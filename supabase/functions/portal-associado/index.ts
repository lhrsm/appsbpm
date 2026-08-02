import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3.23.8';

const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 horas

const enc = new TextEncoder();

const b64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const fromB64url = (s: string) => {
  const pad = s.replace(/-/g, '+').replace(/_/g, '/');
  const str = atob(pad + '='.repeat((4 - (pad.length % 4)) % 4));
  return Uint8Array.from(str, (c) => c.charCodeAt(0));
};

let keyPromise: Promise<CryptoKey> | null = null;
const getKey = () => {
  if (!keyPromise) {
    const secret = Deno.env.get('PORTAL_SESSION_SECRET');
    if (!secret) throw new Error('PORTAL_SESSION_SECRET ausente');
    keyPromise = crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify'],
    );
  }
  return keyPromise;
};

interface SessionPayload {
  aid: string;
  did: string | null;
  exp: number;
}

async function signSession(payload: SessionPayload) {
  const body = b64url(enc.encode(JSON.stringify(payload)));
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', await getKey(), enc.encode(body)));
  return `${body}.${b64url(sig)}`;
}

async function verifySession(token: string): Promise<SessionPayload | null> {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  let ok = false;
  try {
    ok = await crypto.subtle.verify('HMAC', await getKey(), fromB64url(sig), enc.encode(body));
  } catch {
    return null;
  }
  if (!ok) return null;
  try {
    const payload = JSON.parse(new TextDecoder().decode(fromB64url(body))) as SessionPayload;
    if (!payload?.aid || typeof payload.exp !== 'number') return null;
    if (payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const soNumeros = (v?: string | null) => (v || '').replace(/\D+/g, '');

const BodySchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('login'),
    credential: z.string().min(1).max(20),
    user_agent: z.string().max(500).optional(),
  }),
  z.object({ action: z.literal('perfil'), token: z.string().min(1).max(2000) }),
  z.object({ action: z.literal('mensalidades'), token: z.string().min(1).max(2000) }),
  z.object({ action: z.literal('documentos'), token: z.string().min(1).max(2000) }),
  z.object({
    action: z.literal('documento_url'),
    token: z.string().min(1).max(2000),
    documento_id: z.string().uuid(),
  }),
  z.object({ action: z.literal('acessos'), token: z.string().min(1).max(2000) }),
  z.object({
    action: z.literal('push_registrar'),
    token: z.string().min(1).max(2000),
    fcm_token: z.string().min(10).max(500),
    user_agent: z.string().max(500).optional(),
  }),
  z.object({ action: z.literal('notificacoes_listar'), token: z.string().min(1).max(2000) }),
  z.object({
    action: z.literal('notificacoes_marcar'),
    token: z.string().min(1).max(2000),
    ids: z.array(z.string().uuid()).min(1).max(200),
  }),
  z.object({ action: z.literal('privacidade'), token: z.string().min(1).max(2000) }),
  z.object({ action: z.literal('solicitacoes_listar'), token: z.string().min(1).max(2000) }),
  z.object({
    action: z.literal('solicitacoes_criar'),
    token: z.string().min(1).max(2000),
    categoria: z.string().min(1).max(40),
    assunto: z.string().min(3).max(200),
    descricao: z.string().min(3).max(4000),
    prioridade: z.enum(['baixa', 'normal', 'alta', 'urgente']),
    sla_prazo: z.string().datetime().optional(),
  }),
  z.object({
    action: z.literal('solicitacoes_feedback'),
    token: z.string().min(1).max(2000),
    solicitacao_id: z.string().uuid(),
    nota: z.number().int().min(1).max(5),
    satisfacao: z.enum(['muito_insatisfeito', 'insatisfeito', 'neutro', 'satisfeito', 'muito_satisfeito']),
    tempo_atendimento: z.enum(['muito_rapido', 'adequado', 'demorado']),
    comentario: z.string().max(1000).nullable().optional(),
  }),
]);

const CAMPOS_ASSOCIADO =
  'id, matricula, nome, cpf, data_nascimento, email, telefone, endereco, foto_url, assinatura_url, data_admissao, ativo, patente, cep, cidade';

const CAMPOS_DEPENDENTE =
  'id, associado_id, nome, cpf, data_nascimento, tipo, foto_url, assinatura_url, email, telefone, endereco, ativo, status';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return json({ error: 'Requisição inválida' }, 400);
    const body = parsed.data;

    // ---------- LOGIN ----------
    if (body.action === 'login') {
      const credencial = body.credential.trim();
      const digitos = soNumeros(credencial);

      let associado: any = null;
      let dependente: any = null;

      const { data: porMatricula } = await admin
        .from('associados')
        .select(CAMPOS_ASSOCIADO)
        .eq('matricula', credencial)
        .eq('ativo', true)
        .maybeSingle();

      if (porMatricula) {
        associado = porMatricula;
      } else if (digitos.length === 11) {
        const { data: porCpf } = await admin
          .from('associados')
          .select(CAMPOS_ASSOCIADO)
          .eq('ativo', true)
          .or(`cpf.eq.${digitos},cpf.eq.${digitos.replace(
            /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
            '$1.$2.$3-$4',
          )}`)
          .maybeSingle();

        if (porCpf) {
          associado = porCpf;
        } else {
          const { data: dep } = await admin
            .from('dependentes')
            .select(CAMPOS_DEPENDENTE)
            .eq('ativo', true)
            .or(`cpf.eq.${digitos},cpf.eq.${digitos.replace(
              /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
              '$1.$2.$3-$4',
            )}`)
            .maybeSingle();

          if (dep) {
            const { data: titular } = await admin
              .from('associados')
              .select(CAMPOS_ASSOCIADO)
              .eq('id', dep.associado_id)
              .eq('ativo', true)
              .maybeSingle();
            if (titular) {
              associado = titular;
              dependente = dep;
            }
          }
        }
      }

      if (!associado) {
        return json({ error: 'Credencial não encontrada' }, 401);
      }

      const [dependentes, limite, historico, informes] = await Promise.all([
        admin.from('dependentes').select(CAMPOS_DEPENDENTE).eq('associado_id', associado.id).eq('ativo', true),
        admin.from('limites').select('*').eq('associado_id', associado.id).maybeSingle(),
        admin
          .from('historico_limite')
          .select('*')
          .eq('associado_id', associado.id)
          .order('data_utilizacao', { ascending: false }),
        admin
          .from('informes_rendimentos')
          .select('*')
          .eq('associado_id', associado.id)
          .order('ano', { ascending: false }),
      ]);

      await admin.from('acessos_log').insert({
        associado_id: associado.id,
        dependente_id: dependente?.id ?? null,
        tipo_usuario: dependente ? 'dependente' : 'titular',
        metodo_login: digitos.length === 11 ? 'cpf' : 'matricula',
        user_agent: (body.user_agent || '').slice(0, 500),
        sucesso: true,
      });

      const token = await signSession({
        aid: associado.id,
        did: dependente?.id ?? null,
        exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
      });

      return json({
        token,
        associado,
        dependente,
        dependentes: dependentes.data || [],
        limite: limite.data || null,
        historico: historico.data || [],
        informes: informes.data || [],
      });
    }

    // ---------- SESSÃO OBRIGATÓRIA ----------
    const sessao = await verifySession(body.token);
    if (!sessao) return json({ error: 'Sessão expirada' }, 401);

    if (body.action === 'perfil') {
      const { data: associado } = await admin
        .from('associados')
        .select(CAMPOS_ASSOCIADO)
        .eq('id', sessao.aid)
        .eq('ativo', true)
        .maybeSingle();
      if (!associado) return json({ error: 'Cadastro indisponível' }, 401);

      let dependente = null;
      if (sessao.did) {
        const { data } = await admin
          .from('dependentes')
          .select(CAMPOS_DEPENDENTE)
          .eq('id', sessao.did)
          .eq('associado_id', sessao.aid)
          .maybeSingle();
        dependente = data;
      }
      return json({ associado, dependente });
    }

    if (body.action === 'mensalidades') {
      if (sessao.did) return json({ itens: [] });
      const { data } = await admin
        .from('mensalidades')
        .select('*')
        .eq('associado_id', sessao.aid)
        .order('vencimento', { ascending: false });
      return json({ itens: data || [] });
    }

    if (body.action === 'documentos') {
      let q = admin
        .from('documentos_associado')
        .select('*')
        .eq('associado_id', sessao.aid)
        .eq('ativo', true);
      if (sessao.did) q = q.or(`visibilidade.eq.todos,dependente_id.eq.${sessao.did}`);
      const { data } = await q.order('publicado_em', { ascending: false });
      return json({ itens: data || [] });
    }

    if (body.action === 'documento_url') {
      const { data: doc } = await admin
        .from('documentos_associado')
        .select('id, associado_id, dependente_id, visibilidade, arquivo_path, ativo')
        .eq('id', body.documento_id)
        .maybeSingle();
      if (!doc || !doc.ativo || doc.associado_id !== sessao.aid) {
        return json({ error: 'Documento não disponível' }, 403);
      }
      if (sessao.did && doc.visibilidade !== 'todos' && doc.dependente_id !== sessao.did) {
        return json({ error: 'Documento não disponível' }, 403);
      }
      const { data: signed, error } = await admin.storage
        .from('documentos')
        .createSignedUrl(doc.arquivo_path, 60);
      if (error || !signed) return json({ error: 'Não foi possível gerar o link' }, 400);
      return json({ url: signed.signedUrl });
    }

    if (body.action === 'acessos') {
      let q = admin
        .from('acessos_log')
        .select('id, created_at, metodo_login, user_agent, sucesso')
        .order('created_at', { ascending: false })
        .limit(20);
      q = sessao.did
        ? q.eq('dependente_id', sessao.did)
        : q.eq('associado_id', sessao.aid).is('dependente_id', null);
      const { data } = await q;
      return json({ itens: data || [] });
    }

    if (body.action === 'push_registrar') {
      const { error } = await admin.from('push_tokens').upsert(
        {
          token: body.fcm_token,
          associado_id: sessao.did ? null : sessao.aid,
          dependente_id: sessao.did ?? null,
          user_agent: body.user_agent ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'token' },
      );
      if (error) throw error;
      return json({ ok: true });
    }

    if (body.action === 'notificacoes_listar') {
      let q = admin
        .from('notificacoes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      q = sessao.did
        ? q.eq('dependente_id', sessao.did)
        : q.eq('associado_id', sessao.aid).is('dependente_id', null);
      const { data } = await q;
      return json({ itens: data || [] });
    }

    if (body.action === 'notificacoes_marcar') {
      let q = admin
        .from('notificacoes')
        .update({ lida: true, read_at: new Date().toISOString() })
        .in('id', body.ids);
      q = sessao.did
        ? q.eq('dependente_id', sessao.did)
        : q.eq('associado_id', sessao.aid).is('dependente_id', null);
      const { error } = await q;
      if (error) throw error;
      return json({ ok: true });
    }

    if (body.action === 'privacidade') {
      let acessosQ = admin
        .from('acessos_log')
        .select('id, created_at, tipo_usuario, metodo_login, ip, user_agent, sucesso')
        .order('created_at', { ascending: false })
        .limit(50);
      acessosQ = sessao.did
        ? acessosQ.eq('dependente_id', sessao.did)
        : acessosQ.eq('associado_id', sessao.aid).is('dependente_id', null);

      const [consentimentos, solicitacoes, acessos] = await Promise.all([
        admin
          .from('consentimentos')
          .select('*')
          .eq('associado_id', sessao.aid)
          .order('aceito_em', { ascending: false }),
        admin
          .from('solicitacoes_privacidade')
          .select('*')
          .eq('associado_id', sessao.aid)
          .order('created_at', { ascending: false }),
        acessosQ,
      ]);

      return json({
        consentimentos: consentimentos.data || [],
        solicitacoes: solicitacoes.data || [],
        acessos: acessos.data || [],
      });
    }

    if (body.action === 'solicitacoes_listar') {
      let q = admin.from('solicitacoes').select('*').eq('associado_id', sessao.aid);
      if (sessao.did) q = q.eq('dependente_id', sessao.did);
      const { data } = await q.order('created_at', { ascending: false });
      return json({ itens: data || [] });
    }

    if (body.action === 'solicitacoes_criar') {
      const { data: associado } = await admin
        .from('associados')
        .select('id, nome')
        .eq('id', sessao.aid)
        .maybeSingle();
      if (!associado) return json({ error: 'Cadastro indisponível' }, 401);

      let nome = associado.nome;
      if (sessao.did) {
        const { data: dep } = await admin
          .from('dependentes')
          .select('nome')
          .eq('id', sessao.did)
          .eq('associado_id', sessao.aid)
          .maybeSingle();
        if (!dep) return json({ error: 'Dependente inválido' }, 403);
        nome = dep.nome;
      }

      // Protocolo institucional SBPM-AAAA-000000000 (sequencial por ano).
      const ano = new Date().getFullYear();
      const inicioAno = `${ano}-01-01T00:00:00.000Z`;
      const { count } = await admin
        .from('solicitacoes')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', inicioAno);
      const protocolo = `SBPM-${ano}-${String((count ?? 0) + 1).padStart(9, '0')}`;

      const { data: criada, error } = await admin
        .from('solicitacoes')
        .insert({
          associado_id: sessao.aid,
          dependente_id: sessao.did,
          solicitante_nome: nome,
          solicitante_tipo: sessao.did ? 'dependente' : 'titular',
          categoria: body.categoria,
          assunto: body.assunto.trim(),
          descricao: body.descricao.trim(),
          prioridade: body.prioridade,
          sla_prazo: body.sla_prazo ?? null,
          metadata: { protocolo, origem: 'portal' },
        })
        .select('*')
        .single();
      if (error) throw error;
      return json({ ok: true, item: criada });
    }

    if (body.action === 'solicitacoes_feedback') {
      const { data: atual } = await admin
        .from('solicitacoes')
        .select('id, metadata, associado_id, dependente_id')
        .eq('id', body.solicitacao_id)
        .eq('associado_id', sessao.aid)
        .maybeSingle();
      if (!atual) return json({ error: 'Solicitação não encontrada' }, 404);
      if (sessao.did && atual.dependente_id !== sessao.did) return json({ error: 'Acesso negado' }, 403);

      const metadata = {
        ...((atual.metadata as Record<string, unknown>) ?? {}),
        avaliacao: {
          nota: body.nota,
          satisfacao: body.satisfacao,
          tempo_atendimento: body.tempo_atendimento,
          comentario: body.comentario ?? null,
          avaliado_em: new Date().toISOString(),
        },
      };

      const { error } = await admin
        .from('solicitacoes')
        .update({ metadata })
        .eq('id', body.solicitacao_id)
        .eq('associado_id', sessao.aid);
      if (error) throw error;
      return json({ ok: true });
    }

    return json({ error: 'Ação desconhecida' }, 400);
  } catch (err) {
    console.error('portal-associado erro:', err instanceof Error ? err.message : String(err));
    return json({ error: 'Erro ao processar a solicitação' }, 500);
  }
});
