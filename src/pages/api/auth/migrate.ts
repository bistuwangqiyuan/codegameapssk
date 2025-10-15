/**
 * Guest-to-Registered Migration API
 * Converts guest account to full registered account
 */

import type { APIRoute } from 'astro';
import { migrateGuestToRegistered } from '@/lib/supabase/queries/guest-trials';
import { supabase } from '@/lib/supabase/client';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { email, password, fullName } = body;

    // Validation
    if (!email || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email and password are required',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (password.length < 8) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Password must be at least 8 characters long',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get user ID from cookie
    const userId = cookies.get('user_id')?.value;
    const guestToken = cookies.get('guest_token')?.value;

    if (!userId || !guestToken) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No guest session found. Please start a new trial.',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Perform migration
    const result = await migrateGuestToRegistered(userId, email, password);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: result.error || 'Migration failed',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update full name if provided
    if (fullName) {
      await supabase.from('users').update({ full_name: fullName }).eq('id', userId);
    }

    // Clear guest token cookie
    cookies.delete('guest_token', { path: '/' });

    // Keep user_id cookie for continuity
    cookies.set('user_id', userId, {
      path: '/',
      maxAge: 365 * 24 * 60 * 60, // 1 year
      httpOnly: true,
      sameSite: 'lax',
      secure: import.meta.env.PROD,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Account successfully created! Your progress has been saved.',
        user: {
          id: userId,
          email,
          full_name: fullName,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Migration error:', error);
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

