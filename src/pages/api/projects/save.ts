/**
 * Save Project API Endpoint
 * Handles creating and updating user projects
 */

import type { APIRoute } from 'astro';
import { createProject, updateProject } from '@/lib/supabase/queries/projects';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Get user session
    const sessionToken = cookies.get('sb-auth-token')?.value;
    const guestToken = cookies.get('guest-token')?.value;

    if (!sessionToken && !guestToken) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const body = await request.json();
    const { projectId, title, description, htmlCode, cssCode, jsCode, isPublic } = body;

    // Validate required fields
    if (!title || title.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Project title is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update existing project
    if (projectId) {
      const result = await updateProject(projectId, {
        title,
        description,
        htmlCode,
        cssCode,
        jsCode,
        isPublic,
      });

      if (!result.success) {
        return new Response(JSON.stringify({ error: result.error }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          project: result.data,
          message: 'Project updated successfully',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Create new project
    const userId = sessionToken ? 'user-id' : undefined; // TODO: Extract from session
    const guestId = guestToken || undefined;

    const result = await createProject({
      userId,
      guestId,
      title,
      description,
      htmlCode,
      cssCode,
      jsCode,
      isPublic,
    });

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        project: result.data,
        message: 'Project created successfully',
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Save project error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

