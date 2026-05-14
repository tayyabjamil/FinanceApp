// Supabase Edge Function — TrueLayer Token Exchange
//
// Handles two operations via the `action` field in the request body:
//   "exchange" — swap an auth code for access + refresh tokens (initial login)
//   "refresh"  — use a refresh token to get a new access token
//
// The client_secret NEVER leaves this function. It is read from Supabase secrets:
//   supabase secrets set TRUELAYER_CLIENT_SECRET=<your-secret>

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const SANDBOX_TOKEN_URL = 'https://auth.truelayer-sandbox.com/connect/token';
const CLIENT_ID = 'sandbox-aifinanceapp-83a068';
const REDIRECT_URI = 'financeaiapp://truelayer-callback';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const clientSecret = Deno.env.get('TRUELAYER_CLIENT_SECRET');
    if (!clientSecret) {
      return new Response(JSON.stringify({ error: 'Server misconfiguration' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, code, refresh_token } = await req.json();

    let body: Record<string, string>;

    if (action === 'exchange') {
      // Initial code → tokens exchange
      body = {
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        client_secret: clientSecret,
        redirect_uri: REDIRECT_URI,
        code,
      };
    } else if (action === 'refresh') {
      // Refresh expired access token
      body = {
        grant_type: 'refresh_token',
        client_id: CLIENT_ID,
        client_secret: clientSecret,
        refresh_token,
      };
    } else {
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch(SANDBOX_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(body).toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Return access_token, refresh_token, expires_in to the app
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
