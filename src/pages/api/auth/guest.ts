/**
 * Guest Trial API Endpoint
 * Creates a new guest account and redirects to learning interface
 */

import type { APIRoute } from 'astro';
import { createGuestTrial } from '@/lib/supabase/queries/guest-trials';

export const GET: APIRoute = async ({ cookies, redirect }) => {
  try {
    // Generate unique client token
    const clientToken = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;

    // Create guest trial account
    const result = await createGuestTrial({ clientToken });

    if (!result.success || !result.guestTrial || !result.user) {
      return new Response(
        JSON.stringify({
          error: result.error || 'Failed to create guest account',
        }),
        { status: 500 }
      );
    }

    // Store client token in cookie (30 days)
    cookies.set('guest_token', clientToken, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      httpOnly: true,
      sameSite: 'lax',
      secure: import.meta.env.PROD,
    });

    // Store user ID in cookie for quick access
    cookies.set('user_id', result.user.id, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: true,
      sameSite: 'lax',
      secure: import.meta.env.PROD,
    });

    // Redirect to learning path
    return redirect('/learn', 302);
  } catch (error: any) {
    console.error('Guest trial creation error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message,
      }),
      { status: 500 }
    );
  }
};

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Alternative POST endpoint for programmatic access
    const clientToken = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;

    const result = await createGuestTrial({ clientToken });

    if (!result.success || !result.guestTrial || !result.user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: result.error || 'Failed to create guest account',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Set cookies
    cookies.set('guest_token', clientToken, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: true,
      sameSite: 'lax',
      secure: import.meta.env.PROD,
    });

    cookies.set('user_id', result.user.id, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: true,
      sameSite: 'lax',
      secure: import.meta.env.PROD,
    });

    return new Response(
      JSON.stringify({
        success: true,
        user: result.user,
        guestTrial: {
          id: result.guestTrial.id,
          expiresAt: result.guestTrial.expires_at,
          clientToken,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Guest trial creation error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: error.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

