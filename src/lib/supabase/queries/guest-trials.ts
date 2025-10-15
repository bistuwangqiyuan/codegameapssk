/**
 * Guest Trial Service
 * Handles guest account creation, validation, and migration
 */

import { supabase } from '../client';
import type { GuestTrial, ProgressSnapshot } from '@/types/entities';

const TRIAL_DURATION_DAYS = 30;

interface CreateGuestTrialParams {
  clientToken: string;
}

interface GuestTrialResult {
  success: boolean;
  guestTrial?: GuestTrial;
  user?: any;
  error?: string;
}

/**
 * Create a new guest trial account
 */
export async function createGuestTrial(
  params: CreateGuestTrialParams
): Promise<GuestTrialResult> {
  try {
    // 1. Create anonymous user
    const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
    
    if (authError || !authData.user) {
      return { success: false, error: authError?.message || 'Failed to create guest account' };
    }

    // 2. Create user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        role: 'guest',
        xp: 0,
        level: 1,
        coins: 0,
        streak_days: 0,
      })
      .select()
      .single();

    if (userError) {
      return { success: false, error: userError.message };
    }

    // 3. Create guest trial record
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + TRIAL_DURATION_DAYS);

    const { data: trialData, error: trialError } = await supabase
      .from('guest_trials')
      .insert({
        user_id: authData.user.id,
        client_token: params.clientToken,
        expires_at: expiresAt.toISOString(),
        is_migrated: false,
      })
      .select()
      .single();

    if (trialError) {
      return { success: false, error: trialError.message };
    }

    return {
      success: true,
      guestTrial: trialData as GuestTrial,
      user: userData,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Validate a guest trial (check expiration)
 */
export async function validateGuestTrial(userId: string): Promise<{
  valid: boolean;
  daysRemaining?: number;
  expired?: boolean;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('guest_trials')
      .select('*')
      .eq('user_id', userId)
      .eq('is_migrated', false)
      .single();

    if (error || !data) {
      return { valid: false, error: 'Guest trial not found' };
    }

    const expiresAt = new Date(data.expires_at);
    const now = new Date();
    const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysRemaining <= 0) {
      return { valid: false, expired: true, daysRemaining: 0 };
    }

    return { valid: true, daysRemaining };
  } catch (error: any) {
    return { valid: false, error: error.message };
  }
}

/**
 * Sync guest progress to database
 */
export async function syncGuestProgress(
  userId: string,
  progressSnapshot: ProgressSnapshot
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('guest_trials')
      .update({ progress_snapshot: progressSnapshot })
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Migrate guest account to registered user
 */
export async function migrateGuestToRegistered(
  userId: string,
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Update auth user with email/password
    const { error: updateError } = await supabase.auth.updateUser({
      email,
      password,
    });

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // 2. Update user role
    const { error: roleError } = await supabase
      .from('users')
      .update({ role: 'student', email })
      .eq('id', userId);

    if (roleError) {
      return { success: false, error: roleError.message };
    }

    // 3. Mark trial as migrated
    const { error: trialError } = await supabase
      .from('guest_trials')
      .update({ is_migrated: true })
      .eq('user_id', userId);

    if (trialError) {
      return { success: false, error: trialError.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Generate recovery token for guest account
 */
export async function generateRecoveryToken(userId: string): Promise<{
  success: boolean;
  token?: string;
  error?: string;
}> {
  try {
    const token = `guest_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const { error } = await supabase
      .from('guest_trials')
      .update({ recovery_token: token })
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, token };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

