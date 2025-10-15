/**
 * Progress Sync API Endpoint
 * Accepts progress snapshots from client and syncs to database
 */

import type { APIRoute } from 'astro';
import { syncGuestProgress } from '@/lib/supabase/queries/guest-trials';
import type { ProgressSnapshot } from '@/types/entities';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { userId, progress } = body as { userId: string; progress: ProgressSnapshot };

    if (!userId || !progress) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'userId and progress are required',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify user ID matches cookie
    const cookieUserId = cookies.get('user_id')?.value;
    if (cookieUserId !== userId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Unauthorized',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Sync progress
    const result = await syncGuestProgress(userId, progress);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: result.error || 'Sync failed',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Progress synced successfully',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Progress sync error:', error);
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

