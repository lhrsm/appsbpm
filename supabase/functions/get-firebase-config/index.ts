import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve((req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const config = {
    apiKey: Deno.env.get('GOOGLE_API_KEY') ?? '',
    authDomain: Deno.env.get('FIREBASE_AUTH_DOMAIN') ?? '',
    projectId: Deno.env.get('FIREBASE_PROJECT_ID') ?? '',
    storageBucket: Deno.env.get('FIREBASE_STORAGE_BUCKET') ?? '',
    messagingSenderId: Deno.env.get('FIREBASE_MESSAGING_SENDER_ID') ?? '',
    appId: Deno.env.get('FIREBASE_APP_ID') ?? '',
    vapidKey: Deno.env.get('FIREBASE_VAPID_KEY') ?? '',
  };

  return new Response(JSON.stringify(config), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
    },
  });
});
