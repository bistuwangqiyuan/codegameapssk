/**
 * Load Project API Endpoint
 * Handles loading a specific project
 */

import type { APIRoute } from 'astro';
import { getProject, deleteProject } from '@/lib/supabase/queries/projects';

// GET - Load project
export const GET: APIRoute = async ({ params }) => {
  try {
    const projectId = params.id;

    if (!projectId) {
      return new Response(JSON.stringify({ error: 'Project ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await getProject(projectId);

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, project: result.data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Load project error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// DELETE - Delete project
export const DELETE: APIRoute = async ({ params, cookies }) => {
  try {
    // Check authentication
    const sessionToken = cookies.get('sb-auth-token')?.value;
    const guestToken = cookies.get('guest-token')?.value;

    if (!sessionToken && !guestToken) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const projectId = params.id;

    if (!projectId) {
      return new Response(JSON.stringify({ error: 'Project ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await deleteProject(projectId);

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Project deleted successfully' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Delete project error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

