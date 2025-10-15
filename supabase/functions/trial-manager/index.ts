/**
 * Supabase Edge Function: Trial Manager
 * Validates guest trial status and handles expiration logic
 * 
 * Endpoints:
 * - POST /trial-manager/validate - Validate trial status
 * - POST /trial-manager/extend - Extend trial (admin only)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidateRequest {
  userId: string;
}

interface ExtendRequest {
  userId: string;
  additionalDays: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const url = new URL(req.url);
    const path = url.pathname;

    // Validate endpoint
    if (path.endsWith('/validate') && req.method === 'POST') {
      const { userId }: ValidateRequest = await req.json();

      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'userId is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get trial data
      const { data: trial, error } = await supabaseClient
        .from('guest_trials')
        .select('*')
        .eq('user_id', userId)
        .eq('is_migrated', false)
        .single();

      if (error || !trial) {
        return new Response(
          JSON.stringify({
            valid: false,
            error: 'Trial not found or already migrated',
          }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Calculate days remaining
      const expiresAt = new Date(trial.expires_at);
      const now = new Date();
      const msRemaining = expiresAt.getTime() - now.getTime();
      const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

      const isValid = daysRemaining > 0;

      return new Response(
        JSON.stringify({
          valid: isValid,
          daysRemaining: Math.max(daysRemaining, 0),
          expiresAt: trial.expires_at,
          expired: !isValid,
          userId: trial.user_id,
          clientToken: trial.client_token,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extend endpoint (admin only)
    if (path.endsWith('/extend') && req.method === 'POST') {
      const { userId, additionalDays }: ExtendRequest = await req.json();

      if (!userId || !additionalDays || additionalDays <= 0) {
        return new Response(
          JSON.stringify({ error: 'userId and positive additionalDays are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if user is admin
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: userData } = await supabaseClient
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (userData?.role !== 'admin') {
        return new Response(
          JSON.stringify({ error: 'Forbidden - Admin access required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get current trial
      const { data: trial, error: trialError } = await supabaseClient
        .from('guest_trials')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (trialError || !trial) {
        return new Response(
          JSON.stringify({ error: 'Trial not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Extend expiration date
      const currentExpires = new Date(trial.expires_at);
      const newExpires = new Date(currentExpires.getTime() + additionalDays * 24 * 60 * 60 * 1000);

      const { error: updateError } = await supabaseClient
        .from('guest_trials')
        .update({ expires_at: newExpires.toISOString() })
        .eq('user_id', userId);

      if (updateError) {
        return new Response(
          JSON.stringify({ error: 'Failed to extend trial' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `Trial extended by ${additionalDays} days`,
          newExpiresAt: newExpires.toISOString(),
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Trial manager error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

