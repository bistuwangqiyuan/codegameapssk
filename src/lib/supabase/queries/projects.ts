/**
 * Projects Queries Service
 * Handles saving, loading, and managing user projects
 */

import { supabase } from '../client';
import type { Project } from '@/types/entities';

/**
 * Get all projects for a user
 */
export async function getUserProjects(params: {
  userId?: string;
  guestId?: string;
  limit?: number;
}): Promise<{
  success: boolean;
  data?: Project[];
  error?: string;
}> {
  try {
    const { userId, guestId, limit = 50 } = params;

    let query = supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (userId) {
      query = query.eq('user_id', userId);
    } else if (guestId) {
      query = query.eq('guest_id', guestId);
    } else {
      return { success: false, error: 'User ID or Guest ID required' };
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Project[] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get a specific project
 */
export async function getProject(projectId: string): Promise<{
  success: boolean;
  data?: Project;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Project };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Create a new project
 */
export async function createProject(params: {
  userId?: string;
  guestId?: string;
  title: string;
  description?: string;
  htmlCode?: string;
  cssCode?: string;
  jsCode?: string;
  isPublic?: boolean;
  challengeId?: string;
}): Promise<{
  success: boolean;
  data?: Project;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: params.userId,
        guest_id: params.guestId,
        title: params.title,
        description: params.description,
        html_code: params.htmlCode || '',
        css_code: params.cssCode || '',
        js_code: params.jsCode || '',
        is_public: params.isPublic || false,
        challenge_id: params.challengeId,
        likes: 0,
        views: 0,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Project };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Update an existing project
 */
export async function updateProject(
  projectId: string,
  updates: {
    title?: string;
    description?: string;
    htmlCode?: string;
    cssCode?: string;
    jsCode?: string;
    isPublic?: boolean;
  }
): Promise<{
  success: boolean;
  data?: Project;
  error?: string;
}> {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.htmlCode !== undefined) updateData.html_code = updates.htmlCode;
    if (updates.cssCode !== undefined) updateData.css_code = updates.cssCode;
    if (updates.jsCode !== undefined) updateData.js_code = updates.jsCode;
    if (updates.isPublic !== undefined) updateData.is_public = updates.isPublic;

    const { data, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Project };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Fork a project
 */
export async function forkProject(params: {
  projectId: string;
  userId?: string;
  guestId?: string;
  title?: string;
}): Promise<{
  success: boolean;
  data?: Project;
  error?: string;
}> {
  try {
    // Get original project
    const { data: original, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', params.projectId)
      .single();

    if (fetchError || !original) {
      return { success: false, error: 'Original project not found' };
    }

    // Create forked project
    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: params.userId,
        guest_id: params.guestId,
        title: params.title || `Fork of ${original.title}`,
        description: original.description,
        html_code: original.html_code,
        css_code: original.css_code,
        js_code: original.js_code,
        is_public: false, // Forked projects start as private
        forked_from: params.projectId,
        likes: 0,
        views: 0,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Project };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get public projects (community showcase)
 */
export async function getPublicProjects(params: {
  limit?: number;
  offset?: number;
  sortBy?: 'recent' | 'popular' | 'views';
}): Promise<{
  success: boolean;
  data?: Project[];
  error?: string;
}> {
  try {
    const { limit = 20, offset = 0, sortBy = 'recent' } = params;

    let query = supabase
      .from('projects')
      .select('*')
      .eq('is_public', true)
      .range(offset, offset + limit - 1);

    // Apply sorting
    if (sortBy === 'recent') {
      query = query.order('created_at', { ascending: false });
    } else if (sortBy === 'popular') {
      query = query.order('likes', { ascending: false });
    } else if (sortBy === 'views') {
      query = query.order('views', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Project[] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Increment project view count
 */
export async function incrementProjectViews(projectId: string): Promise<void> {
  try {
    await supabase.rpc('increment_project_views', { project_id: projectId });
  } catch (error) {
    console.error('Error incrementing project views:', error);
  }
}

/**
 * Like/unlike a project
 */
export async function toggleProjectLike(
  projectId: string,
  userId: string
): Promise<{
  success: boolean;
  liked: boolean;
  error?: string;
}> {
  try {
    // Check if already liked
    const { data: existingLike } = await supabase
      .from('project_likes')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      // Unlike
      await supabase
        .from('project_likes')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', userId);

      await supabase.rpc('decrement_project_likes', { project_id: projectId });

      return { success: true, liked: false };
    } else {
      // Like
      await supabase.from('project_likes').insert({
        project_id: projectId,
        user_id: userId,
      });

      await supabase.rpc('increment_project_likes', { project_id: projectId });

      return { success: true, liked: true };
    }
  } catch (error: any) {
    return { success: false, liked: false, error: error.message };
  }
}

