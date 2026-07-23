import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3.23.8';

const optionalStr = (max: number) =>
  z.string().max(max).optional().or(z.literal('')).or(z.null());

const BodySchema = z.object({
  tipo: z.enum(['associado', 'dependente']),
  id: z.string().uuid(),
  // Credencial simples: precisa bater com o cadastro para autorizar
  matricula_titular: z.string().min(1).max(50),
  cpf: optionalStr(20),
  campos: z.object({
    email: optionalStr(200),
    telefone: optionalStr(30),
    endereco: optionalStr(500),
    foto_url: optionalStr(1000),
    assinatura_url: optionalStr(1000),
  }),
});


const soNumeros = (v?: string | null) => (v || '').replace(/\D+/g, '');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: 'Dados inválidos', details: parsed.error.flatten() }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }
    const { tipo, id, matricula_titular, cpf, campos } = parsed.data;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // 1) Buscar titular pela matrícula para autorizar a alteração
    const { data: titular, error: eTit } = await supabase
      .from('associados')
      .select('id, matricula, cpf')
      .eq('matricula', matricula_titular)
      .maybeSingle();
    if (eTit) throw eTit;
    if (!titular) {
      return new Response(
        JSON.stringify({ error: 'Titular não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 2) Validar propriedade do registro
    if (tipo === 'associado') {
      if (titular.id !== id) {
        return new Response(
          JSON.stringify({ error: 'Não autorizado' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
      // CPF do titular deve bater (defesa em profundidade)
      if (cpf && soNumeros(cpf) !== soNumeros(titular.cpf)) {
        return new Response(
          JSON.stringify({ error: 'CPF inválido' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      const update: Record<string, unknown> = {};
      if (campos.email !== undefined) update.email = campos.email || null;
      if (campos.telefone !== undefined) update.telefone = campos.telefone || null;
      if (campos.endereco !== undefined) update.endereco = campos.endereco || null;
      if (campos.foto_url !== undefined) update.foto_url = campos.foto_url || null;
      if (campos.assinatura_url !== undefined) update.assinatura_url = campos.assinatura_url || null;

      const { data, error } = await supabase
        .from('associados')
        .update(update)
        .eq('id', id)
        .select('id, email, telefone, endereco, foto_url, assinatura_url')
        .maybeSingle();

      if (error) throw error;
      return new Response(
        JSON.stringify({ ok: true, associado: data }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Dependente: precisa pertencer ao titular
    const { data: dep, error: eDep } = await supabase
      .from('dependentes')
      .select('id, associado_id, cpf')
      .eq('id', id)
      .maybeSingle();
    if (eDep) throw eDep;
    if (!dep || dep.associado_id !== titular.id) {
      return new Response(
        JSON.stringify({ error: 'Dependente não pertence ao titular' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }
    // Se CPF foi enviado, deve bater com o do dependente
    if (cpf && dep.cpf && soNumeros(cpf) !== soNumeros(dep.cpf)) {
      return new Response(
        JSON.stringify({ error: 'CPF do dependente inválido' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Dependente: só permitimos alterar foto_url e assinatura_url
    const update: Record<string, unknown> = {};
    if (campos.foto_url !== undefined) update.foto_url = campos.foto_url || null;
    if (campos.assinatura_url !== undefined) update.assinatura_url = campos.assinatura_url || null;

    const { data, error } = await supabase
      .from('dependentes')
      .update(update)
      .eq('id', id)
      .select('id, foto_url, assinatura_url')
      .maybeSingle();

    if (error) throw error;
    return new Response(
      JSON.stringify({ ok: true, dependente: data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('update-perfil erro:', msg);
    return new Response(
      JSON.stringify({ error: 'Erro ao atualizar perfil', details: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
