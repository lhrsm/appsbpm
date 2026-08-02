// ============================================================
// portal-conta — Conta, Segurança, 2FA, Privacidade e LGPD (Fase 10)
// Toda operação sensível exige sessão válida do portal e, quando indicado,
// reautenticação por senha. Segredos e códigos nunca voltam ao cliente
// depois de criados, nem são gravados em log.
// ============================================================
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3.23.8';
import { sha256Hex, timingSafeEqual, verifyPortalSession } from '../_shared/portalSession.ts';
import { cifrar, decifrar, gerarRecoveryCodes, gerarSegredoBase32, otpauthUri, validarTotp } from '../_shared/totp.ts';
import { enviarEmail, maskEmail, templateAlerta, templateCodigo } from '../_shared/email.ts';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const ERRO_GENERICO = 'Não foi possível concluir esta alteração.';
const CODIGO_TTL_MIN = 10;

const admin = () =>
  createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });

const Body = z.object({
  action: z.string().min(1).max(60),
  token: z.string().min(10).max(4000).optional(),
}).passthrough();

const str = (v: unknown, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const soNumeros = (v: unknown) => str(v, 40).replace(/\D+/g, '');
const emailValido = (v: string) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v);

/** Resumo de dispositivo/navegador sem IP completo nem impressão digital detalhada. */
function resumirDispositivo(ua: string) {
  const navegador = /Edg\//.test(ua) ? 'Edge'
    : /OPR\//.test(ua) ? 'Opera'
    : /Chrome\//.test(ua) ? 'Chrome'
    : /Safari\//.test(ua) ? 'Safari'
    : /Firefox\//.test(ua) ? 'Firefox'
    : 'Navegador';
  const so = /Android/.test(ua) ? 'Android'
    : /iPhone|iPad|iOS/.test(ua) ? 'iOS'
    : /Windows/.test(ua) ? 'Windows'
    : /Mac OS/.test(ua) ? 'macOS'
    : /Linux/.test(ua) ? 'Linux'
    : 'Sistema não identificado';
  const tipo = /Mobi|Android|iPhone/.test(ua) ? 'Celular' : /iPad|Tablet/.test(ua) ? 'Tablet' : 'Computador';
  return { navegador, so, dispositivo: `${tipo} · ${so}` };
}

/** Mascara o IP: apenas os dois primeiros octetos, o resto é descartado. */
const localizacaoResumida = (req: Request) => {
  const cidade = req.headers.get('x-vercel-ip-city') || req.headers.get('cf-ipcity');
  const regiao = req.headers.get('x-vercel-ip-country-region') || req.headers.get('cf-region');
  if (cidade) return [cidade, regiao].filter(Boolean).join(' / ');
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim();
  if (!ip) return 'Origem não identificada';
  const partes = ip.split('.');
  return partes.length === 4 ? `Rede ${partes[0]}.${partes[1]}.x.x` : 'Rede não identificada';
};

interface Contexto {
  db: ReturnType<typeof admin>;
  userId: string;
  linkId: string | null;
  email: string;
  perfil: 'associate' | 'dependent';
  associadoId: string;
  dependenteId: string | null;
  ua: string;
  local: string;
  ipHash: string;
}

async function registrarEvento(
  ctx: Contexto,
  event_type: string,
  result: 'success' | 'failed' | 'pending' = 'success',
  metadata_safe: Record<string, unknown> = {},
) {
  const d = resumirDispositivo(ctx.ua);
  await ctx.db.from('user_security_events').insert({
    user_id: ctx.userId,
    event_type,
    result,
    device_summary: `${d.dispositivo} · ${d.navegador}`,
    location_summary: ctx.local,
    ip_hash: ctx.ipHash,
    metadata_safe,
  });
}

async function auditar(ctx: Contexto, action: string, detalhes: Record<string, unknown> = {}) {
  await ctx.db.from('audit_logs').insert({
    user_id: ctx.userId,
    action,
    entity: 'conta_portal',
    criticidade: 'alta',
    details: detalhes,
  }).select().maybeSingle().catch(() => null);
}

async function garantirSettings(ctx: Contexto) {
  const { data } = await ctx.db.from('user_security_settings').select('*').eq('user_id', ctx.userId).maybeSingle();
  if (data) return data;
  const { data: novo } = await ctx.db
    .from('user_security_settings')
    .insert({ user_id: ctx.userId, link_id: ctx.linkId, email_verified: true })
    .select('*')
    .maybeSingle();
  return novo;
}

function calcularNivel(s: Record<string, unknown>, recoveryAtivos: number, sessoesRevisadas: boolean) {
  // Critério documentado: cada item vale 1 ponto; 5-6 = reforçado, 3-4 = intermediário.
  const criterios = [
    { id: 'email_verificado', ok: !!s.email_verified, label: 'E-mail verificado' },
    { id: 'telefone_verificado', ok: !!s.phone_verified, label: 'Telefone verificado' },
    { id: 'mfa', ok: !!s.mfa_enabled, label: 'Autenticação em dois fatores ativa' },
    { id: 'recovery', ok: recoveryAtivos > 0, label: 'Códigos de recuperação disponíveis' },
    {
      id: 'senha',
      ok: !!s.last_password_change_at &&
        Date.now() - new Date(String(s.last_password_change_at)).getTime() < 365 * 24 * 3600 * 1000,
      label: 'Senha atualizada nos últimos 12 meses',
    },
    { id: 'sessoes', ok: sessoesRevisadas, label: 'Sessões revisadas recentemente' },
  ];
  const pontos = criterios.filter((c) => c.ok).length;
  const nivel = pontos >= 5 ? 'reforcado' : pontos >= 3 ? 'intermediario' : 'basico';
  return { nivel, pontos, total: criterios.length, criterios };
}

/** Reautenticação: valida a senha atual sem criar sessão persistente. */
async function senhaConfere(email: string, senha: string) {
  if (!senha || senha.length < 6) return false;
  const anon = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    auth: { persistSession: false },
  });
  const { error } = await anon.auth.signInWithPassword({ email, password: senha });
  if (!error) await anon.auth.signOut();
  return !error;
}

/** Rate limiting simples por usuário e ação, usando os próprios eventos de segurança. */
async function limiteExcedido(ctx: Contexto, acao: string, max: number, minutos: number) {
  const desde = new Date(Date.now() - minutos * 60_000).toISOString();
  const { count } = await ctx.db
    .from('user_security_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', ctx.userId)
    .eq('event_type', acao)
    .eq('result', 'failed')
    .gte('created_at', desde);
  return (count ?? 0) >= max;
}

/** Códigos de confirmação ficam apenas como hash em um evento pendente. */
async function criarDesafio(ctx: Contexto, tipo: string, alvo: string) {
  const codigo = String(Math.floor(100000 + Math.random() * 900000));
  await ctx.db.from('user_security_events').insert({
    user_id: ctx.userId,
    event_type: `${tipo}_pendente`,
    result: 'pending',
    device_summary: resumirDispositivo(ctx.ua).dispositivo,
    location_summary: ctx.local,
    ip_hash: ctx.ipHash,
    metadata_safe: {
      alvo,
      code_hash: await sha256Hex(`${ctx.userId}:${codigo}`),
      expira_em: new Date(Date.now() + CODIGO_TTL_MIN * 60_000).toISOString(),
      tentativas: 0,
    },
  });
  return codigo;
}

async function consumirDesafio(ctx: Contexto, tipo: string, codigo: string) {
  const { data } = await ctx.db
    .from('user_security_events')
    .select('*')
    .eq('user_id', ctx.userId)
    .eq('event_type', `${tipo}_pendente`)
    .eq('result', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return { ok: false as const, motivo: 'O código informado é inválido ou expirou.' };
  const meta = (data.metadata_safe ?? {}) as Record<string, unknown>;
  if (new Date(String(meta.expira_em)).getTime() < Date.now() || Number(meta.tentativas ?? 0) >= 5) {
    await ctx.db.from('user_security_events').update({ result: 'failed' }).eq('id', data.id);
    return { ok: false as const, motivo: 'O código informado é inválido ou expirou.' };
  }
  const hash = await sha256Hex(`${ctx.userId}:${soNumeros(codigo)}`);
  if (!timingSafeEqual(hash, String(meta.code_hash ?? ''))) {
    await ctx.db
      .from('user_security_events')
      .update({ metadata_safe: { ...meta, tentativas: Number(meta.tentativas ?? 0) + 1 } })
      .eq('id', data.id);
    return { ok: false as const, motivo: 'O código informado é inválido ou expirou.' };
  }
  await ctx.db.from('user_security_events').update({ result: 'success', metadata_safe: { alvo: meta.alvo } }).eq('id', data.id);
  return { ok: true as const, alvo: String(meta.alvo ?? '') };
}

const CONSENTIMENTOS_PADRAO = [
  { tipo: 'comunicacoes_institucionais', finalidade: 'Informativos e comunicados institucionais da SBPM.' },
  { tipo: 'email_nao_essencial', finalidade: 'Mensagens por e-mail que não são obrigatórias ao serviço.' },
  { tipo: 'whatsapp_nao_essencial', finalidade: 'Mensagens por WhatsApp que não são obrigatórias ao serviço.' },
  { tipo: 'pesquisa_satisfacao', finalidade: 'Convites para avaliar o atendimento prestado.' },
  { tipo: 'novidades', finalidade: 'Novidades, campanhas e benefícios opcionais.' },
  { tipo: 'recursos_opcionais', finalidade: 'Uso de recursos opcionais do portal, como notificações push.' },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: 'Requisição inválida.' }, 400);
    const body = parsed.data as Record<string, any>;

    const sessao = await verifyPortalSession(body.token);
    if (!sessao) return json({ error: 'Sessão expirada' }, 401);

    const db = admin();

    // Identidade: o vínculo externo é a fonte do user_id.
    const filtro = sessao.did ? { dependente_id: sessao.did } : { associado_id: sessao.aid };
    const { data: link } = await db.from('external_account_links').select('*').match(filtro).maybeSingle();
    if (!link || link.status !== 'active') return json({ error: 'Conta indisponível.' }, 403);
    if (sessao.did && link.dependente_id !== sessao.did) return json({ error: 'Conta indisponível.' }, 403);

    const ua = str(req.headers.get('user-agent'), 500);
    const ipBruto = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim();
    const ctx: Contexto = {
      db,
      userId: link.user_id,
      linkId: link.id,
      email: link.email,
      perfil: sessao.did ? 'dependent' : 'associate',
      associadoId: sessao.aid,
      dependenteId: sessao.did,
      ua,
      local: localizacaoResumida(req),
      ipHash: ipBruto ? await sha256Hex(`ip:${ipBruto}`) : '',
    };

    const action = body.action as string;

    // ------------------------------------------------ RESUMO DE SEGURANÇA
    if (action === 'seguranca_resumo') {
      const settings = await garantirSettings(ctx);
      const [{ count: recoveryAtivos }, { data: sessoes }, { data: ultimoAcesso }, { count: dispositivos }] =
        await Promise.all([
          db.from('mfa_recovery_codes').select('id', { count: 'exact', head: true })
            .eq('user_id', ctx.userId).is('used_at', null).is('revoked_at', null),
          db.from('portal_sessions').select('id').eq('user_id', ctx.userId).is('revoked_at', null),
          db.from('user_security_events').select('created_at, device_summary, location_summary')
            .eq('user_id', ctx.userId).eq('event_type', 'login').eq('result', 'success')
            .order('created_at', { ascending: false }).limit(1).maybeSingle(),
          db.from('user_trusted_devices').select('id', { count: 'exact', head: true })
            .eq('user_id', ctx.userId).is('revoked_at', null).gt('expires_at', new Date().toISOString()),
        ]);

      const revisadas = !!settings?.sessions_reviewed_at &&
        Date.now() - new Date(settings.sessions_reviewed_at).getTime() < 90 * 24 * 3600 * 1000;
      const nivel = calcularNivel(settings ?? {}, recoveryAtivos ?? 0, revisadas);

      if (settings && settings.security_level !== nivel.nivel) {
        await db.from('user_security_settings').update({ security_level: nivel.nivel }).eq('id', settings.id);
      }

      return json({
        mfa_enabled: !!settings?.mfa_enabled,
        mfa_required: !!settings?.mfa_required,
        preferred_mfa_method: settings?.preferred_mfa_method ?? 'totp',
        trusted_device_policy: settings?.trusted_device_policy ?? '15d',
        email_verified: !!settings?.email_verified,
        phone_verified: !!settings?.phone_verified,
        last_password_change_at: settings?.last_password_change_at ?? null,
        recovery_codes_disponiveis: (recoveryAtivos ?? 0) > 0,
        sessoes_ativas: sessoes?.length ?? 0,
        dispositivos_confiaveis: dispositivos ?? 0,
        ultimo_acesso: ultimoAcesso ?? null,
        email_mascarado: maskEmail(ctx.email),
        ...nivel,
      });
    }

    // ------------------------------------------------ SENHA
    if (action === 'senha_alterar') {
      if (await limiteExcedido(ctx, 'password_change', 5, 15)) {
        return json({ error: 'Por segurança, tente novamente mais tarde.' }, 429);
      }
      const atual = str(body.senha_atual, 200);
      const nova = str(body.nova_senha, 200);
      if (nova.length < 10) return json({ error: 'A nova senha deve ter ao menos 10 caracteres.' }, 400);
      if (nova === atual) return json({ error: 'A nova senha deve ser diferente da atual.' }, 400);
      if (!(await senhaConfere(ctx.email, atual))) {
        await registrarEvento(ctx, 'password_change', 'failed');
        return json({ error: 'Senha atual incorreta.' }, 401);
      }

      const { error } = await db.auth.admin.updateUserById(ctx.userId, { password: nova });
      if (error) return json({ error: ERRO_GENERICO }, 400);

      await db.from('user_security_settings')
        .update({ last_password_change_at: new Date().toISOString() })
        .eq('user_id', ctx.userId);

      if (body.encerrar_sessoes) {
        await db.from('portal_sessions').update({ revoked_at: new Date().toISOString() })
          .eq('user_id', ctx.userId).is('revoked_at', null);
        await db.from('user_trusted_devices').update({ revoked_at: new Date().toISOString() })
          .eq('user_id', ctx.userId).is('revoked_at', null);
        await registrarEvento(ctx, 'sessions_revoked', 'success', { motivo: 'troca_de_senha' });
      }

      await registrarEvento(ctx, 'password_change');
      await auditar(ctx, 'senha_alterada');
      await enviarEmail({
        to: ctx.email,
        subject: 'Sua senha foi alterada — Portal da SBPM',
        html: templateAlerta('Senha alterada', 'A senha da sua conta no Portal da SBPM acabou de ser alterada.'),
      });
      return json({ success: true, message: 'Senha alterada com sucesso.' });
    }

    // ------------------------------------------------ E-MAIL
    if (action === 'email_alterar_iniciar') {
      const novo = str(body.novo_email, 160).toLowerCase();
      if (!emailValido(novo)) return json({ error: 'Informe um endereço de e-mail válido.' }, 400);
      if (novo === ctx.email.toLowerCase()) return json({ error: 'Este já é o seu e-mail atual.' }, 400);
      if (!(await senhaConfere(ctx.email, str(body.senha_atual, 200)))) {
        await registrarEvento(ctx, 'email_change', 'failed');
        return json({ error: 'Senha atual incorreta.' }, 401);
      }
      // Mensagem genérica: não revela a existência de outra conta.
      const { data: existente } = await db.from('external_account_links').select('id').ilike('email', novo).maybeSingle();
      if (existente) return json({ error: 'Não foi possível utilizar este endereço de e-mail.' }, 409);

      const codigo = await criarDesafio(ctx, 'email_change', novo);
      await enviarEmail({
        to: novo,
        subject: 'Confirme seu novo e-mail — Portal da SBPM',
        html: templateCodigo(codigo, 'a alteração do e-mail da sua conta'),
      });
      return json({ success: true, destino: maskEmail(novo) });
    }

    if (action === 'email_alterar_confirmar') {
      const r = await consumirDesafio(ctx, 'email_change', str(body.codigo, 10));
      if (!r.ok) return json({ error: r.motivo }, 400);
      const anterior = ctx.email;

      const { error } = await db.auth.admin.updateUserById(ctx.userId, { email: r.alvo, email_confirm: true });
      if (error) return json({ error: ERRO_GENERICO }, 400);

      await db.from('external_account_links').update({ email: r.alvo }).eq('id', ctx.linkId);
      if (ctx.dependenteId) await db.from('dependentes').update({ email: r.alvo }).eq('id', ctx.dependenteId);
      else await db.from('associados').update({ email: r.alvo }).eq('id', ctx.associadoId);
      await db.from('user_security_settings').update({ email_verified: true }).eq('user_id', ctx.userId);

      await registrarEvento(ctx, 'email_change', 'success', { destino: maskEmail(r.alvo) });
      await auditar(ctx, 'email_alterado', { de: maskEmail(anterior), para: maskEmail(r.alvo) });
      await enviarEmail({
        to: anterior,
        subject: 'E-mail da conta alterado — Portal da SBPM',
        html: templateAlerta('E-mail alterado', 'O endereço de e-mail da sua conta no Portal da SBPM foi alterado.'),
      });
      return json({ success: true, email: maskEmail(r.alvo) });
    }

    // ------------------------------------------------ TELEFONE
    if (action === 'telefone_alterar_iniciar') {
      const telefone = soNumeros(body.telefone);
      if (telefone.length < 10) return json({ error: 'Informe um telefone válido com DDD.' }, 400);
      if (!(await senhaConfere(ctx.email, str(body.senha_atual, 200)))) {
        await registrarEvento(ctx, 'phone_change', 'failed');
        return json({ error: 'Senha atual incorreta.' }, 401);
      }
      // Ainda não há envio por SMS/WhatsApp: a confirmação usa o e-mail cadastrado.
      const codigo = await criarDesafio(ctx, 'phone_change', telefone);
      await enviarEmail({
        to: ctx.email,
        subject: 'Confirme seu novo telefone — Portal da SBPM',
        html: templateCodigo(codigo, 'a alteração do telefone da sua conta'),
      });
      return json({ success: true, canal: 'email', destino: maskEmail(ctx.email) });
    }

    if (action === 'telefone_alterar_confirmar') {
      const r = await consumirDesafio(ctx, 'phone_change', str(body.codigo, 10));
      if (!r.ok) return json({ error: r.motivo }, 400);
      const tabela = ctx.dependenteId ? 'dependentes' : 'associados';
      const id = ctx.dependenteId ?? ctx.associadoId;
      await db.from(tabela).update({ telefone: r.alvo }).eq('id', id);
      await db.from('user_security_settings').update({ phone_verified: true }).eq('user_id', ctx.userId);
      await registrarEvento(ctx, 'phone_change');
      await auditar(ctx, 'telefone_alterado');
      await enviarEmail({
        to: ctx.email,
        subject: 'Telefone da conta alterado — Portal da SBPM',
        html: templateAlerta('Telefone alterado', 'O telefone de contato da sua conta foi atualizado.'),
      });
      return json({ success: true });
    }

    // ------------------------------------------------ 2FA (TOTP)
    if (action === 'mfa_iniciar' || action === 'mfa_trocar_dispositivo') {
      if (!(await senhaConfere(ctx.email, str(body.senha_atual, 200)))) {
        await registrarEvento(ctx, 'mfa_enroll', 'failed');
        return json({ error: 'Senha atual incorreta.' }, 401);
      }
      const settings = await garantirSettings(ctx);
      if (action === 'mfa_trocar_dispositivo') {
        const segredo = await decifrar(settings?.totp_secret_enc);
        const codigo = str(body.codigo, 20);
        const recuperacao = str(body.recovery_code, 40).toUpperCase();
        const okTotp = segredo ? await validarTotp(segredo, codigo) : false;
        const okRecovery = recuperacao ? await usarRecoveryCode(ctx, recuperacao) : false;
        if (!okTotp && !okRecovery) return json({ error: 'O código informado é inválido ou expirou.' }, 401);
      } else if (settings?.mfa_enabled) {
        return json({ error: 'A autenticação em dois fatores já está ativa.' }, 409);
      }

      const secret = gerarSegredoBase32();
      await db.from('user_security_settings').update({
        totp_pending_enc: await cifrar(secret),
        totp_pending_expires_at: new Date(Date.now() + 15 * 60_000).toISOString(),
      }).eq('user_id', ctx.userId);

      return json({
        success: true,
        secret,
        otpauth: otpauthUri(secret, ctx.email),
        expira_em_minutos: 15,
      });
    }

    if (action === 'mfa_cancelar') {
      await db.from('user_security_settings')
        .update({ totp_pending_enc: null, totp_pending_expires_at: null })
        .eq('user_id', ctx.userId);
      return json({ success: true });
    }

    if (action === 'mfa_ativar') {
      if (await limiteExcedido(ctx, 'mfa_enroll', 8, 15)) {
        return json({ error: 'Por segurança, tente novamente mais tarde.' }, 429);
      }
      const settings = await garantirSettings(ctx);
      const pendenteValido = settings?.totp_pending_expires_at &&
        new Date(settings.totp_pending_expires_at).getTime() > Date.now();
      const secret = pendenteValido ? await decifrar(settings?.totp_pending_enc) : null;
      if (!secret) return json({ error: 'A configuração expirou. Inicie novamente a ativação.' }, 400);

      if (!(await validarTotp(secret, str(body.codigo, 10)))) {
        await registrarEvento(ctx, 'mfa_enroll', 'failed');
        return json({ error: 'O código informado é inválido ou expirou.' }, 401);
      }

      await db.from('user_security_settings').update({
        mfa_enabled: true,
        preferred_mfa_method: 'totp',
        totp_secret_enc: settings.totp_pending_enc,
        totp_pending_enc: null,
        totp_pending_expires_at: null,
      }).eq('user_id', ctx.userId);

      const codigos = await regenerarRecoveryCodes(ctx);
      await registrarEvento(ctx, 'mfa_enabled');
      await auditar(ctx, 'mfa_ativado');
      await enviarEmail({
        to: ctx.email,
        subject: 'Autenticação em dois fatores ativada — Portal da SBPM',
        html: templateAlerta('2FA ativado', 'A autenticação em dois fatores foi ativada na sua conta.'),
      });
      return json({ success: true, recovery_codes: codigos });
    }

    if (action === 'mfa_desativar') {
      const settings = await garantirSettings(ctx);
      if (!settings?.mfa_enabled) return json({ error: 'A autenticação em dois fatores não está ativa.' }, 400);
      if (settings.mfa_required) {
        return json({
          error: 'A autenticação em dois fatores é obrigatória para o seu perfil. Utilize a troca de dispositivo.',
        }, 403);
      }
      if (!(await senhaConfere(ctx.email, str(body.senha_atual, 200)))) {
        await registrarEvento(ctx, 'mfa_disabled', 'failed');
        return json({ error: 'Senha atual incorreta.' }, 401);
      }
      const segredo = await decifrar(settings.totp_secret_enc);
      const okTotp = segredo ? await validarTotp(segredo, str(body.codigo, 10)) : false;
      const okRecovery = !okTotp && (await usarRecoveryCode(ctx, str(body.recovery_code, 40).toUpperCase()));
      if (!okTotp && !okRecovery) {
        await registrarEvento(ctx, 'mfa_disabled', 'failed');
        return json({ error: 'O código informado é inválido ou expirou.' }, 401);
      }

      await db.from('user_security_settings').update({
        mfa_enabled: false, totp_secret_enc: null, totp_pending_enc: null, totp_pending_expires_at: null,
      }).eq('user_id', ctx.userId);
      await db.from('mfa_recovery_codes').update({ revoked_at: new Date().toISOString() })
        .eq('user_id', ctx.userId).is('used_at', null).is('revoked_at', null);

      await registrarEvento(ctx, 'mfa_disabled', 'success', { justificativa: str(body.justificativa, 300) || null });
      await auditar(ctx, 'mfa_desativado');
      await enviarEmail({
        to: ctx.email,
        subject: 'Autenticação em dois fatores desativada — Portal da SBPM',
        html: templateAlerta('2FA desativado', 'A autenticação em dois fatores foi desativada na sua conta.'),
      });
      return json({ success: true });
    }

    if (action === 'recovery_codes_regenerar') {
      if (!(await senhaConfere(ctx.email, str(body.senha_atual, 200)))) {
        return json({ error: 'Senha atual incorreta.' }, 401);
      }
      const settings = await garantirSettings(ctx);
      const segredo = await decifrar(settings?.totp_secret_enc);
      if (settings?.mfa_enabled && !(segredo && (await validarTotp(segredo, str(body.codigo, 10))))) {
        return json({ error: 'O código informado é inválido ou expirou.' }, 401);
      }
      const codigos = await regenerarRecoveryCodes(ctx);
      await registrarEvento(ctx, 'recovery_codes_generated');
      await auditar(ctx, 'recovery_codes_gerados');
      await enviarEmail({
        to: ctx.email,
        subject: 'Novos códigos de recuperação — Portal da SBPM',
        html: templateAlerta('Códigos de recuperação gerados', 'Novos códigos foram gerados e os anteriores foram invalidados.'),
      });
      return json({ success: true, recovery_codes: codigos });
    }

    // ------------------------------------------------ SESSÕES E DISPOSITIVOS
    if (action === 'sessoes') {
      const atual = body.token ? await sha256Hex(String(body.token)) : '';
      const { data } = await db.from('portal_sessions')
        .select('id, device_name, browser, operating_system, location_summary, started_at, last_activity_at, expires_at, session_token_hash, trusted_device_id')
        .eq('user_id', ctx.userId).is('revoked_at', null)
        .order('last_activity_at', { ascending: false });
      await db.from('user_security_settings')
        .update({ sessions_reviewed_at: new Date().toISOString() }).eq('user_id', ctx.userId);
      return json({
        itens: (data ?? []).map((s) => ({
          id: s.id,
          dispositivo: s.device_name,
          navegador: s.browser,
          sistema: s.operating_system,
          localizacao: s.location_summary,
          iniciada_em: s.started_at,
          ultima_atividade: s.last_activity_at,
          expira_em: s.expires_at,
          confiavel: !!s.trusted_device_id,
          atual: !!atual && s.session_token_hash === atual,
        })),
      });
    }

    if (action === 'sessao_revogar' || action === 'sessoes_revogar_outras') {
      const agora = new Date().toISOString();
      if (action === 'sessao_revogar') {
        const id = str(body.sessao_id, 64);
        await db.from('portal_sessions').update({ revoked_at: agora }).eq('id', id).eq('user_id', ctx.userId);
      } else {
        const atual = body.token ? await sha256Hex(String(body.token)) : '';
        await db.from('portal_sessions').update({ revoked_at: agora })
          .eq('user_id', ctx.userId).is('revoked_at', null).neq('session_token_hash', atual);
      }
      await registrarEvento(ctx, 'session_revoked');
      await auditar(ctx, 'sessoes_revogadas');
      return json({ success: true });
    }

    if (action === 'dispositivos') {
      const { data } = await db.from('user_trusted_devices')
        .select('id, device_name, browser, operating_system, first_seen_at, last_seen_at, expires_at')
        .eq('user_id', ctx.userId).is('revoked_at', null)
        .order('last_seen_at', { ascending: false });
      return json({ itens: data ?? [] });
    }

    if (action === 'dispositivo_revogar') {
      await db.from('user_trusted_devices').update({ revoked_at: new Date().toISOString() })
        .eq('id', str(body.dispositivo_id, 64)).eq('user_id', ctx.userId);
      await registrarEvento(ctx, 'trusted_device_revoked');
      return json({ success: true });
    }

    if (action === 'politica_dispositivo') {
      const politica = str(body.politica, 10);
      if (!['nunca', '7d', '15d', '30d'].includes(politica)) return json({ error: ERRO_GENERICO }, 400);
      await db.from('user_security_settings').update({ trusted_device_policy: politica }).eq('user_id', ctx.userId);
      if (politica === 'nunca') {
        await db.from('user_trusted_devices').update({ revoked_at: new Date().toISOString() })
          .eq('user_id', ctx.userId).is('revoked_at', null);
      }
      return json({ success: true });
    }

    // ------------------------------------------------ HISTÓRICO DE ACESSOS
    if (action === 'eventos') {
      const pagina = Math.max(1, Number(body.pagina ?? 1));
      const tamanho = Math.min(50, Math.max(5, Number(body.tamanho ?? 20)));
      const de = (pagina - 1) * tamanho;
      let q = db.from('user_security_events')
        .select('id, event_type, result, device_summary, location_summary, created_at', { count: 'exact' })
        .eq('user_id', ctx.userId)
        .neq('result', 'pending');
      const tipo = str(body.tipo, 40);
      if (tipo) q = q.eq('event_type', tipo);
      const { data, count } = await q.order('created_at', { ascending: false }).range(de, de + tamanho - 1);
      return json({ itens: data ?? [], total: count ?? 0, pagina, tamanho });
    }

    if (action === 'reportar_acesso_suspeito') {
      const agora = new Date().toISOString();
      await db.from('portal_sessions').update({ revoked_at: agora })
        .eq('user_id', ctx.userId).is('revoked_at', null);
      await db.from('user_trusted_devices').update({ revoked_at: agora })
        .eq('user_id', ctx.userId).is('revoked_at', null);
      const { data: rec } = await db.from('account_recovery_requests').insert({
        user_id: ctx.userId,
        cpf_reference: link.cpf_reference,
        contact_email: ctx.email,
        recovery_type: 'acesso_suspeito',
        reason: str(body.observacao, 500) || 'Acesso não reconhecido informado pelo usuário.',
      }).select('protocol').maybeSingle();

      await registrarEvento(ctx, 'suspicious_access_reported', 'success', { evento_id: str(body.evento_id, 64) || null });
      await auditar(ctx, 'acesso_suspeito_reportado');
      await enviarEmail({
        to: ctx.email,
        subject: 'Registramos sua ocorrência de segurança — Portal da SBPM',
        html: templateAlerta(
          'Ocorrência de segurança registrada',
          'Encerramos todas as sessões e dispositivos confiáveis da sua conta. Altere sua senha e revise a autenticação em dois fatores.',
        ),
      });
      return json({ success: true, protocolo: rec?.protocol ?? null });
    }

    // ------------------------------------------------ CONSENTIMENTOS
    if (action === 'consentimentos') {
      const { data } = await db.from('privacy_consents').select('*')
        .eq('user_id', ctx.userId).order('created_at', { ascending: false });
      const registros = data ?? [];
      const atuais = CONSENTIMENTOS_PADRAO.map((c) => {
        const ultimo = registros.find((r) => r.consent_type === c.tipo);
        return {
          tipo: c.tipo,
          finalidade: c.finalidade,
          versao: ultimo?.version ?? '1.0',
          status: ultimo?.status ?? 'revoked',
          concedido_em: ultimo?.granted_at ?? null,
          revogado_em: ultimo?.revoked_at ?? null,
          origem: ultimo?.source ?? 'portal',
        };
      });
      return json({ itens: atuais, historico: registros });
    }

    if (action === 'consentimento_definir') {
      const tipo = str(body.tipo, 60);
      const definicao = CONSENTIMENTOS_PADRAO.find((c) => c.tipo === tipo);
      if (!definicao) return json({ error: ERRO_GENERICO }, 400);
      const conceder = body.conceder === true;
      const agora = new Date().toISOString();
      // Revogar não apaga histórico: cada decisão gera um novo registro.
      await db.from('privacy_consents').insert({
        user_id: ctx.userId,
        consent_type: tipo,
        purpose: definicao.finalidade,
        version: str(body.versao, 20) || '1.0',
        status: conceder ? 'granted' : 'revoked',
        granted_at: conceder ? agora : null,
        revoked_at: conceder ? null : agora,
        source: 'portal',
      });
      await registrarEvento(ctx, conceder ? 'consent_granted' : 'consent_revoked', 'success', { tipo });
      await auditar(ctx, conceder ? 'consentimento_concedido' : 'consentimento_revogado', { tipo });
      return json({ success: true });
    }

    if (action === 'termos') {
      const { data } = await db.from('terms_acceptances')
        .select('id, terms_version, privacy_version, accepted_at, source')
        .eq('user_id', ctx.userId).order('accepted_at', { ascending: false });
      return json({ itens: data ?? [] });
    }

    // ------------------------------------------------ SOLICITAÇÕES LGPD
    if (action === 'lgpd_listar') {
      const { data } = await db.from('privacy_requests')
        .select('id, protocol, request_type, description, status, submitted_at, completed_at, created_at')
        .eq('user_id', ctx.userId).order('created_at', { ascending: false });
      return json({ itens: data ?? [] });
    }

    if (action === 'lgpd_detalhe') {
      const { data: pedido } = await db.from('privacy_requests')
        .select('id, protocol, request_type, description, status, submitted_at, completed_at, created_at')
        .eq('id', str(body.id, 64)).eq('user_id', ctx.userId).maybeSingle();
      if (!pedido) return json({ error: 'Solicitação não encontrada.' }, 404);
      const { data: historico } = await db.from('privacy_request_history')
        .select('id, previous_status, new_status, notes_safe, created_at')
        .eq('request_id', pedido.id).order('created_at', { ascending: true });
      return json({ pedido, historico: historico ?? [] });
    }

    if (action === 'lgpd_criar') {
      if (await limiteExcedido(ctx, 'privacy_request', 5, 60)) {
        return json({ error: 'Por segurança, tente novamente mais tarde.' }, 429);
      }
      const tipo = str(body.tipo, 60);
      const descricao = str(body.descricao, 4000);
      if (!tipo || descricao.length < 20) {
        return json({ error: 'Descreva sua solicitação com pelo menos 20 caracteres.' }, 400);
      }
      const { data, error } = await db.from('privacy_requests').insert({
        user_id: ctx.userId,
        requester_type: ctx.perfil === 'dependent' ? 'dependent' : 'associate',
        request_type: tipo,
        description: descricao,
      }).select('id, protocol, status, created_at').maybeSingle();
      if (error || !data) return json({ error: ERRO_GENERICO }, 400);

      await registrarEvento(ctx, 'privacy_request', 'success', { protocolo: data.protocol, tipo });
      await auditar(ctx, 'solicitacao_lgpd_criada', { protocolo: data.protocol, tipo });
      await enviarEmail({
        to: ctx.email,
        subject: `Solicitação LGPD recebida — ${data.protocol}`,
        html: templateAlerta(
          'Solicitação registrada',
          `Recebemos sua solicitação sob o protocolo <strong>${data.protocol}</strong>. Você poderá acompanhar o andamento pelo portal.`,
        ),
      });
      return json({ success: true, ...data });
    }

    // ------------------------------------------------ EXPORTAÇÃO DE DADOS
    if (action === 'exportacoes') {
      const { data } = await db.from('personal_data_exports')
        .select('id, format, status, expires_at, downloaded_at, created_at')
        .eq('user_id', ctx.userId).order('created_at', { ascending: false }).limit(10);
      return json({ itens: data ?? [] });
    }

    if (action === 'exportacao_solicitar') {
      if (await limiteExcedido(ctx, 'data_export', 3, 60)) {
        return json({ error: 'Por segurança, tente novamente mais tarde.' }, 429);
      }
      if (!(await senhaConfere(ctx.email, str(body.senha_atual, 200)))) {
        await registrarEvento(ctx, 'data_export', 'failed');
        return json({ error: 'Senha atual incorreta.' }, 401);
      }
      const formato = ['json', 'csv', 'pdf'].includes(str(body.formato, 8)) ? str(body.formato, 8) : 'json';
      const { data: pedido } = await db.from('privacy_requests').insert({
        user_id: ctx.userId,
        requester_type: ctx.perfil === 'dependent' ? 'dependent' : 'associate',
        request_type: 'portabilidade',
        description: `Solicitação de cópia dos dados pessoais em formato ${formato.toUpperCase()}.`,
      }).select('id, protocol').maybeSingle();

      const { data: exportacao } = await db.from('personal_data_exports').insert({
        user_id: ctx.userId,
        request_id: pedido?.id ?? null,
        format: formato,
        status: 'processando',
        expires_at: new Date(Date.now() + 72 * 3600_000).toISOString(),
      }).select('id, status, expires_at').maybeSingle();

      await registrarEvento(ctx, 'data_export', 'success', { protocolo: pedido?.protocol });
      await auditar(ctx, 'exportacao_dados_solicitada', { protocolo: pedido?.protocol });
      return json({ success: true, protocolo: pedido?.protocol ?? null, exportacao });
    }

    return json({ error: 'Ação não suportada.' }, 400);
  } catch (e) {
    console.error('portal-conta erro:', e instanceof Error ? e.message : 'desconhecido');
    return json({ error: 'Serviço temporariamente indisponível. Tente novamente.' }, 500);
  }
});

// ------------------------------------------------ Auxiliares de recovery code
async function regenerarRecoveryCodes(ctx: Contexto) {
  const agora = new Date().toISOString();
  await ctx.db.from('mfa_recovery_codes').update({ revoked_at: agora })
    .eq('user_id', ctx.userId).is('used_at', null).is('revoked_at', null);
  const codigos = gerarRecoveryCodes(10);
  const linhas = await Promise.all(
    codigos.map(async (c) => ({ user_id: ctx.userId, code_hash: await sha256Hex(`${ctx.userId}:${c}`) })),
  );
  await ctx.db.from('mfa_recovery_codes').insert(linhas);
  await ctx.db.from('user_security_settings')
    .update({ recovery_codes_generated_at: agora }).eq('user_id', ctx.userId);
  return codigos;
}

async function usarRecoveryCode(ctx: Contexto, codigo: string) {
  const limpo = (codigo || '').trim().toUpperCase();
  if (limpo.length < 8) return false;
  const hash = await sha256Hex(`${ctx.userId}:${limpo}`);
  const { data } = await ctx.db.from('mfa_recovery_codes').select('id')
    .eq('user_id', ctx.userId).eq('code_hash', hash)
    .is('used_at', null).is('revoked_at', null).maybeSingle();
  if (!data) return false;
  await ctx.db.from('mfa_recovery_codes').update({ used_at: new Date().toISOString() }).eq('id', data.id);
  await registrarEvento(ctx, 'recovery_code_used');
  return true;
}
