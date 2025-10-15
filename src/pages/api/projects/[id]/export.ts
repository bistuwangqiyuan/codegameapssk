/**
 * Export Project API Endpoint
 * Generates a ZIP file of the project
 */

import type { APIRoute } from 'astro';
import { getProject } from '@/lib/supabase/queries/projects';

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

    if (!result.success || !result.data) {
      return new Response(JSON.stringify({ error: 'Project not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const project = result.data;

    // Generate complete HTML file with embedded CSS and JS
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.title || 'My Project'}</title>
  <style>
${project.css_code || project.cssCode || ''}
  </style>
</head>
<body>
${project.html_code || project.htmlCode || ''}
  <script>
${project.js_code || project.jsCode || ''}
  </script>
</body>
</html>`;

    // For now, return as a downloadable HTML file
    // In production, you'd use a library like JSZip to create a proper ZIP file
    const filename = `${(project.title || 'project').replace(/[^a-z0-9]/gi, '-').toLowerCase()}.html`;

    return new Response(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Export project error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

