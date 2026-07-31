import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3.23.8';
import { getIdentityProvider, soNumeros, type PersonType } from './providers.ts';
import { getEmailService, codeEmailHtml, codeEmailText, maskEmail } from './email.ts';

const SESSION_TTL_SECONDS = 60 * 60 * 8;
const VALIDATION_TTL_MIN = 15;
const CODE_TTL_MIN = 5;
const MAX_CODE_ATTEMPTS = 5;
const MAX_RESENDS = 3;
const RESEND_INTERVAL_MS = 60_000;
const MAX_VALIDATION_ATTEMPTS = 5;
const VALIDATION_WINDOW_MIN = 15;

const TERMS_VERSION = '2026-07';
const PRIVACY_VERSION = '2026-07';

const enc = new TextEncoder();
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const b64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const sha256 = async (v: string) =>
  b64url(new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(v))));

let keyPromise: Promise<CryptoKey> | null = null;
const getKey = () => {
  if (!keyPromise) {
    const secret = Deno.env.get('PORTAL_SESSION_SECRET');
    if (!secret) throw new Error('PORTAL_SESSION_SECRET ausente');
    keyPromise = crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
      'sign',
      'verify',
    ]);
  }
  return keyPromise;
};

/** Sessão do portal — mesmo formato usado pela função portal-associado. */
async function signSession(payload: { aid: string; did: string | null; exp: number }) {
  const body = b64url(enc.encode(JSON.stringify(payload)));
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', await getKey(), enc.encode(body)));
  return `${body}.${b64url(sig)}`;
}

const randomCode = () => String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, '0');

const cpfVariants = (d: string) => [d, d.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')];

const CAMPOS_ASSOCIADO =
  'id, matricula, nome, cpf, data_nascimento, email, telefone, endereco, foto_url, assinatura_url, data_admissao, ativo, patente, cep, cidade';
const CAMPOS_DEPENDENTE =
  'id, associado_id, nome, cpf, data_nascimento, tipo, foto_url, assinatura_url, email, telefone, endereco, ativo, status';

const MENSAGENS: Record<string, string> = {
  not_matched: 'Não foi possível validar os dados informados. Confira as informações e tente novamente.',
  inactive: 'Não foi possível liberar o acesso. Entre em contato com o atendimento da SBPM.',
  blocked: 'Não foi possível liberar o acesso. Entre em contato com o atendimento da SBPM.',
  deceased: 'Não foi possível liberar o acesso. Entre em contato com o atendimento da SBPM.',
  duplicate_record: 'Seu cadastro precisa de revisão. Entre em contato com o atendimento da SBPM.',
  manual_review_required: 'Seu cadastro precisa de revisão. Entre em contato com o atendimento da SBPM.',
  already_linked: 'Já existe um acesso vinculado a estes dados.',
  unavailable: 'A validação está temporariamente indisponível. Tente novamente em alguns minutos.',
  rate_limited: 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.',
};

const Body = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('validate_identity'),
    cpf: z.string().min(11).max(14),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    personType: z.enum(['associate', 'dependent']),
    registration: z.string().max(40).optional(),
    fullName: z.string().max(200).optional(),
    motherName: z.string().max(200).optional(),
    user_agent: z.string().max(300).optional(),
  }),
  z.object({
    action: z.literal('email_start'),
    sessionId: z.string().uuid(),
    validationToken: z.string().min(10).max(200),
    email: z.string().email().max(200),
    resend: z.boolean().optional(),
  }),
  z.object({
    action: z.literal('email_verify'),
    sessionId: z.string().uuid(),
    validationToken: z.string().min(10).max(200),
    code: z.string().regex(/^\d{6}$/),
  }),
  z.object({
    action: z.literal('create_account'),
    sessionId: z.string().uuid(),
    validationToken: z.string().min(10).max(200),
    password: z.string().min(10).max(200),
    acceptTerms: z.literal(true),
    acceptPrivacy: z.literal(true),
    user_agent: z.string().max(300).optional(),
  }),
  z.object({
    action: z.literal('login'),
    credential: z.string().min(3).max(30),
    password: z.string().min(1).max(200),
    user_agent: z.string().max(300).optional(),
  }),
  z.object({ action: z.literal('recover_start'), credential: z.string().min(3).max(30) }),
]);

async function audit(admin: any, row: Record<string, unknown>) {
  await admin.from('external_auth_audit_logs').insert(row);
}

/** Dados do portal para a sessão recém-criada (mesma resposta do login antigo). */
async function portalPayload(admin: any, cpfDigits: string) {
  let associado: any = null;
  let dependente: any = null;

  const { data: assoc } = await admin
    .from('associados')
    .select(CAMPOS_ASSOCIADO)
    .in('cpf', cpfVariants(cpfDigits))
    .eq('ativo', true)
    .maybeSingle();

  if (assoc) associado = assoc;
  else {
    const { data: dep } = await admin
      .from('dependentes')
      .select(CAMPOS_DEPENDENTE)
      .in('cpf', cpfVariants(cpfDigits))
      .eq('ativo', true)
      .maybeSingle();
    if (dep) {
      const { data: titular } = await admin
        .from('associados')
        .select(CAMPOS_ASSOCIADO)
        .eq('id', dep.associado_id)
        .maybeSingle();
      if (titular) {
        associado = titular;
        dependente = dep;
      }
    }
  }

  if (!associado) return null;

  const [dependentes, limite, historico, informes] = await Promise.all([
    admin.from('dependentes').select(CAMPOS_DEPENDENTE).eq('associado_id', associado.id).eq('ativo', true),
    admin.from('limites').select('*').eq('associado_id', associado.id).maybeSingle(),
    admin.from('historico_limite').select('*').eq('associado_id', associado.id).order('data_utilizacao', { ascending: false }),
    admin.from('informes_rendimentos').select('*').eq('associado_id', associado.id).order('ano', { ascending: false }),
  ]);

  const token = await signSession({
    aid: associado.id,
    did: dependente?.id ?? null,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  });

  return {
    token,
    associado,
    dependente,
    dependentes: dependentes.data || [],
    limite: limite.data || null,
    historico: historico.data || [],
    informes: informes.data || [],
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const provider = getIdentityProvider(admin);
  const emailService = getEmailService();
  const providerMode = (Deno.env.get('EXTERNAL_IDENTITY_PROVIDER') || 'mock').toLowerCase();

  try {
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ success: false, message: 'Requisição inválida' }, 400);
    const body = parsed.data;

    const ipHash = await sha256(
      (req.headers.get('x-forwarded-for') || 'desconhecido').split(',')[0].trim() + '|sbpm',
    );

    // ---------------- VALIDAÇÃO DE IDENTIDADE ----------------
    if (body.action === 'validate_identity') {
      const desde = new Date(Date.now() - VALIDATION_WINDOW_MIN * 60_000).toISOString();
      const { count } = await admin
        .from('external_identity_validation_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('ip_hash', ipHash)
        .gte('created_at', desde);

      if ((count ?? 0) >= MAX_VALIDATION_ATTEMPTS) {
        await audit(admin, { event_type: 'identity_validation', result: 'rate_limited', provider: providerMode });
        return json({ success: false, status: 'rate_limited', message: MENSAGENS.rate_limited }, 429);
      }

      const cpf = soNumeros(body.cpf);
      if (cpf.length !== 11) return json({ success: false, status: 'not_matched', message: MENSAGENS.not_matched });

      const jaExiste = await admin
        .from('external_account_links')
        .select('id')
        .eq('cpf_reference', cpf)
        .maybeSingle();

      if (jaExiste.data) {
        await audit(admin, { event_type: 'identity_validation', result: 'already_linked', provider: providerMode });
        return json({ success: false, status: 'already_linked', message: MENSAGENS.already_linked });
      }

      const result = await provider.validateIdentity({
        cpf,
        birthDate: body.birthDate,
        personType: body.personType as PersonType,
        registration: body.registration,
        fullName: body.fullName,
        motherName: body.motherName,
      });

      const { data: sess } = await admin
        .from('external_identity_validation_sessions')
        .insert({
          provider: providerMode,
          external_person_id: result.externalPersonId ?? null,
          person_type: result.success ? result.personType : null,
          status: result.success ? 'validated' : 'failed',
          expires_at: new Date(Date.now() + VALIDATION_TTL_MIN * 60_000).toISOString(),
          ip_hash: ipHash,
          user_agent_summary: (body.user_agent || '').slice(0, 120),
        })
        .select('id')
        .single();

      await audit(admin, {
        event_type: 'identity_validation',
        validation_session_id: sess?.id ?? null,
        result: result.status,
        provider: providerMode,
        metadata_safe: { personType: body.personType },
      });

      if (!result.success) {
        return json({
          success: false,
          status: result.status,
          message: MENSAGENS[result.status] ?? MENSAGENS.not_matched,
        });
      }

      const validationToken = b64url(crypto.getRandomValues(new Uint8Array(32)));
      await admin
        .from('external_identity_validation_sessions')
        .update({ validation_token_hash: await sha256(validationToken) })
        .eq('id', sess!.id);

      // CPF guardado apenas no vínculo final; aqui fica na sessão do cliente.
      return json({
        success: true,
        status: 'matched',
        sessionId: sess!.id,
        validationToken,
        personType: result.personType,
        maskedName: result.maskedName,
        registrationTail: result.registration ? String(result.registration).slice(-3) : null,
        expiresAt: new Date(Date.now() + VALIDATION_TTL_MIN * 60_000).toISOString(),
        demoMode: providerMode === 'mock',
      });
    }

    // ---------------- SESSÃO DE VALIDAÇÃO ----------------
    if (body.action === 'email_start' || body.action === 'email_verify' || body.action === 'create_account') {
      const { data: sess } = await admin
        .from('external_identity_validation_sessions')
        .select('*')
        .eq('id', body.sessionId)
        .maybeSingle();

      const tokenHash = await sha256(body.validationToken);
      if (
        !sess ||
        sess.validation_token_hash !== tokenHash ||
        sess.consumed_at ||
        new Date(sess.expires_at).getTime() < Date.now()
      ) {
        return json({ success: false, message: 'Sua sessão expirou. Reinicie o primeiro acesso.' }, 401);
      }

      // ---------- ENVIO / REENVIO DO CÓDIGO ----------
      if (body.action === 'email_start') {
        const email = body.email.trim().toLowerCase();

        const emailUsado = await admin.from('external_account_links').select('id').eq('email', email).maybeSingle();
        if (emailUsado.data) {
          return json({ success: false, message: 'Não foi possível utilizar este e-mail. Informe outro endereço.' });
        }

        const { data: anterior } = await admin
          .from('external_email_verification_codes')
          .select('*')
          .eq('validation_session_id', sess.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        const mesmoEmail = anterior && anterior.email === email;
        if (mesmoEmail && anterior.resend_count >= MAX_RESENDS) {
          return json({ success: false, message: 'Limite de reenvios atingido. Tente novamente mais tarde.' }, 429);
        }
        if (mesmoEmail && Date.now() - new Date(anterior.created_at).getTime() < RESEND_INTERVAL_MS) {
          return json({ success: false, message: 'Aguarde 60 segundos para solicitar um novo código.' }, 429);
        }

        await admin
          .from('external_email_verification_codes')
          .update({ status: 'invalidated' })
          .eq('validation_session_id', sess.id)
          .eq('status', 'pending');

        const code = randomCode();
        await admin.from('external_email_verification_codes').insert({
          validation_session_id: sess.id,
          email,
          code_hash: await sha256(code),
          expires_at: new Date(Date.now() + CODE_TTL_MIN * 60_000).toISOString(),
          resend_count: mesmoEmail ? (anterior?.resend_count ?? 0) + 1 : 0,
          ip_hash: ipHash,
          debug_code: emailService.name === 'mock' ? code : null,
        });

        await admin.from('external_identity_validation_sessions').update({ email }).eq('id', sess.id);

        const envio = await emailService.send({
          to: email,
          subject: 'Código de confirmação — Portal da SBPM',
          html: codeEmailHtml(code),
          text: codeEmailText(code),
        });

        await audit(admin, {
          event_type: mesmoEmail ? 'email_code_resent' : 'email_code_sent',
          validation_session_id: sess.id,
          result: envio.success ? 'sent' : 'failed',
          provider: emailService.name,
          metadata_safe: { email: maskEmail(email) },
        });

        if (!envio.success) {
          console.error('[portal-acesso] falha no envio do código:', envio.error);
          return json(
            { success: false, message: 'Não foi possível enviar o código agora. Tente novamente em instantes.' },
            502,
          );
        }

        return json({
          success: true,
          maskedEmail: maskEmail(email),
          demoMode: emailService.name === 'mock',
          resendInSeconds: RESEND_INTERVAL_MS / 1000,
        });
      }

      // ---------- CONFIRMAÇÃO DO CÓDIGO ----------
      if (body.action === 'email_verify') {
        const { data: codigo } = await admin
          .from('external_email_verification_codes')
          .select('*')
          .eq('validation_session_id', sess.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!codigo || new Date(codigo.expires_at).getTime() < Date.now()) {
          if (codigo) await admin.from('external_email_verification_codes').update({ status: 'expired' }).eq('id', codigo.id);
          return json({ success: false, message: 'O código informado é inválido ou expirou.' });
        }
        if (codigo.attempt_count >= MAX_CODE_ATTEMPTS) {
          await admin.from('external_email_verification_codes').update({ status: 'blocked' }).eq('id', codigo.id);
          return json({ success: false, message: 'Limite de tentativas atingido. Solicite um novo código.' }, 429);
        }

        const ok = codigo.code_hash === (await sha256(body.code));
        await admin
          .from('external_email_verification_codes')
          .update(
            ok
              ? { status: 'verified', verified_at: new Date().toISOString(), attempt_count: codigo.attempt_count + 1, debug_code: null }
              : { attempt_count: codigo.attempt_count + 1 },
          )
          .eq('id', codigo.id);

        await audit(admin, {
          event_type: 'email_code_check',
          validation_session_id: sess.id,
          result: ok ? 'verified' : 'invalid',
          provider: emailService.name,
        });

        if (!ok) return json({ success: false, message: 'O código informado é inválido ou expirou.' });

        await admin
          .from('external_identity_validation_sessions')
          .update({ verified_at: new Date().toISOString(), status: 'email_verified' })
          .eq('id', sess.id);

        return json({ success: true, message: 'E-mail confirmado com sucesso.' });
      }

      // ---------- CRIAÇÃO DA CONTA ----------
      if (body.action === 'create_account') {
        if (sess.status !== 'email_verified' || !sess.email) {
          return json({ success: false, message: 'Confirme seu e-mail antes de criar a senha.' }, 400);
        }

        const forte =
          body.password.length >= 10 &&
          /[a-z]/.test(body.password) &&
          /[A-Z]/.test(body.password) &&
          /\d/.test(body.password) &&
          /[^A-Za-z0-9]/.test(body.password);
        if (!forte) return json({ success: false, message: 'A senha não atende aos requisitos mínimos.' }, 400);

        const { data: mock } = await admin
          .from('external_identity_mock_records')
          .select('cpf_reference, registration_number')
          .eq('external_person_id', sess.external_person_id)
          .maybeSingle();

        const cpf = mock?.cpf_reference ?? '';

        const criado = await admin.auth.admin.createUser({
          email: sess.email,
          password: body.password,
          email_confirm: true,
          user_metadata: { portal_externo: true, person_type: sess.person_type },
        });

        if (criado.error || !criado.data.user) {
          return json({ success: false, message: 'Não foi possível concluir o cadastro. Tente novamente.' }, 400);
        }

        const userId = criado.data.user.id;

        const link = await admin.from('external_account_links').insert({
          user_id: userId,
          external_person_id: sess.external_person_id,
          person_type: sess.person_type,
          cpf_reference: cpf,
          registration_number: mock?.registration_number ?? null,
          email: sess.email,
          source_provider: providerMode,
          last_verified_at: new Date().toISOString(),
        });

        if (link.error) {
          await admin.auth.admin.deleteUser(userId);
          return json({ success: false, message: MENSAGENS.already_linked }, 409);
        }

        await admin.from('terms_acceptances').insert({
          user_id: userId,
          external_person_id: sess.external_person_id,
          terms_version: TERMS_VERSION,
          privacy_version: PRIVACY_VERSION,
          source: 'portal_primeiro_acesso',
          metadata_safe: { ip_hash: ipHash, user_agent: (body.user_agent || '').slice(0, 120) },
        });

        await provider.confirmAccountLink(sess.external_person_id!, userId);

        await admin
          .from('external_identity_validation_sessions')
          .update({ consumed_at: new Date().toISOString(), status: 'consumed' })
          .eq('id', sess.id);

        await audit(admin, {
          event_type: 'account_created',
          user_id: userId,
          validation_session_id: sess.id,
          result: 'success',
          provider: providerMode,
        });

        const payload = await portalPayload(admin, cpf);
        return json({ success: true, portal: payload, maskedEmail: maskEmail(sess.email) });
      }
    }

    // ---------------- LOGIN ----------------
    if (body.action === 'login') {
      const credencial = body.credential.trim();
      const digitos = soNumeros(credencial);

      let link: any = null;
      if (digitos.length === 11) {
        link = (await admin.from('external_account_links').select('*').eq('cpf_reference', digitos).maybeSingle()).data;
      }
      if (!link) {
        link = (
          await admin
            .from('external_account_links')
            .select('*')
            .ilike('registration_number', credencial)
            .maybeSingle()
        ).data;
      }

      const generico = { success: false, message: 'Credenciais inválidas. Verifique os dados e tente novamente.' };
      if (!link || link.status !== 'active') {
        await audit(admin, { event_type: 'login', result: 'failed', provider: providerMode });
        return json(generico, 401);
      }

      const anon = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!);
      const auth = await anon.auth.signInWithPassword({ email: link.email, password: body.password });
      if (auth.error) {
        await audit(admin, { event_type: 'login', user_id: link.user_id, result: 'failed', provider: providerMode });
        return json(generico, 401);
      }
      await anon.auth.signOut();

      const primeiroAcesso = !link.last_login_at;
      await admin
        .from('external_account_links')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', link.id);

      const payload = await portalPayload(admin, link.cpf_reference);
      if (!payload) {
        return json(
          { success: false, message: 'Seu cadastro ainda está em sincronização. Fale com o atendimento da SBPM.' },
          409,
        );
      }

      await admin.from('acessos_log').insert({
        associado_id: payload.associado.id,
        dependente_id: payload.dependente?.id ?? null,
        tipo_usuario: payload.dependente ? 'dependente' : 'titular',
        metodo_login: digitos.length === 11 ? 'cpf' : 'matricula',
        user_agent: (body.user_agent || '').slice(0, 500),
        sucesso: true,
      });

      await audit(admin, {
        event_type: primeiroAcesso ? 'first_login' : 'login',
        user_id: link.user_id,
        result: 'success',
        provider: providerMode,
      });

      return json({ success: true, portal: payload, firstLogin: primeiroAcesso });
    }

    // ---------------- RECUPERAÇÃO DE ACESSO ----------------
    if (body.action === 'recover_start') {
      const digitos = soNumeros(body.credential);
      let link: any = null;
      if (digitos.length === 11) {
        link = (await admin.from('external_account_links').select('*').eq('cpf_reference', digitos).maybeSingle()).data;
      }
      if (!link) {
        link = (
          await admin.from('external_account_links').select('*').ilike('registration_number', body.credential.trim()).maybeSingle()
        ).data;
      }

      if (link) {
        const redirectTo = `${req.headers.get('origin') || 'https://appsbpm.lovable.app'}/redefinir-senha`;
        const gerado = await admin.auth.admin.generateLink({
          type: 'recovery',
          email: link.email,
          options: { redirectTo },
        });
        const actionLink = gerado.data?.properties?.action_link;
        if (actionLink) {
          await emailService.send({
            to: link.email,
            subject: 'Recuperação de acesso — Portal da SBPM',
            html: `<div style="font-family:Arial,sans-serif;padding:24px">
              <h2 style="color:#065f46">Portal da SBPM</h2>
              <p>Recebemos um pedido de recuperação de acesso.</p>
              <p><a href="${actionLink}">Criar nova senha</a></p>
              <p>Se não foi você, ignore esta mensagem.</p></div>`,
          });
        }
        await audit(admin, { event_type: 'password_recovery', user_id: link.user_id, result: 'sent', provider: providerMode });
      } else {
        await audit(admin, { event_type: 'password_recovery', result: 'not_found', provider: providerMode });
      }

      return json({
        success: true,
        message: 'Se existir uma conta vinculada aos dados informados, enviaremos as instruções para recuperação.',
      });
    }

    return json({ success: false, message: 'Ação não suportada' }, 400);
  } catch (e) {
    console.error('portal-acesso erro:', e instanceof Error ? e.message : e);
    return json({ success: false, message: 'Serviço temporariamente indisponível. Tente novamente.' }, 500);
  }
});
