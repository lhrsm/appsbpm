import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

interface Body {
  instanceId: string;
  token: string;
  clientToken?: string;
  phone: string;
  message: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = (await req.json()) as Body;
    if (!body?.instanceId || !body?.token || !body?.phone || !body?.message) {
      return new Response(JSON.stringify({ error: 'Campos obrigatórios: instanceId, token, phone, message' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const cleanPhone = body.phone.replace(/\D/g, '');
    const phone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

    const url = `https://api.z-api.io/instances/${body.instanceId}/token/${body.token}/send-text`;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (body.clientToken) headers['Client-Token'] = body.clientToken;

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ phone, message: body.message }),
    });
    const data = await res.json().catch(() => ({}));

    return new Response(JSON.stringify({ ok: res.ok, status: res.status, data }), {
      status: res.ok ? 200 : 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
