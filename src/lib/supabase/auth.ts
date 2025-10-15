import { supabase } from './client';
import type { User } from '@/types/entities';

/**
 * Guest Trial Management
 * Handles automatic guest account creation and trial tracking
 */

export interface GuestTrialInfo {
  guestId: string;
  expiresAt: Date;
  daysRemaining: number;
}

/**
 * Create a new guest trial account
 * Constitution Requirement: Guest accounts MUST have server-side tracking
 */
export async function createGuestTrial(): Promise<GuestTrialInfo> {
  const { data, error } = await supabase
    .from('guest_trials')
    .insert({
      progress_snapshot: {},
    })
    .select()
    .single();

  if (error) throw error;

  const expiresAt = new Date(data.expires_at);
  const daysRemaining = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return {
    guestId: data.guest_id,
    expiresAt,
    daysRemaining,
  };
}

/**
 * Validate guest trial status
 * Constitution Requirement: Server-side validation in addition to client-side
 */
export async function validateGuestTrial(guestId: string): Promise<{
  valid: boolean;
  expired: boolean;
  daysRemaining: number;
}> {
  const { data, error } = await supabase
    .from('guest_trials')
    .select('expires_at, migrated_at')
    .eq('guest_id', guestId)
    .single();

  if (error || !data) {
    return { valid: false, expired: true, daysRemaining: 0 };
  }

  // Check if already migrated
  if (data.migrated_at) {
    return { valid: false, expired: true, daysRemaining: 0 };
  }

  const expiresAt = new Date(data.expires_at);
  const now = new Date();
  const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return {
    valid: daysRemaining > 0,
    expired: daysRemaining <= 0,
    daysRemaining: Math.max(0, daysRemaining),
  };
}

/**
 * Update guest trial last activity timestamp
 */
export async function updateGuestActivity(guestId: string): Promise<void> {
  await supabase
    .from('guest_trials')
    .update({ last_activity: new Date().toISOString() })
    .eq('guest_id', guestId);
}

/**
 * User Registration
 */
export async function registerUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  // Create user profile
  if (data.user) {
    await supabase.from('users').insert({
      id: data.user.id,
      user_type: 'student',
      registration_date: new Date().toISOString(),
      current_level: 1,
      total_xp: 0,
      coin_balance: 0,
      selected_language: 'en',
      preferences: {},
    });
  }

  return data;
}

/**
 * User Login
 */
export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

/**
 * OAuth Login
 * Supports Google and GitHub as per FR-003
 */
export async function loginWithOAuth(provider: 'google' | 'github') {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Logout
 */
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get current user session
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) return null;

  return {
    id: profile.id,
    userType: profile.user_type,
    registrationDate: new Date(profile.registration_date),
    currentLevel: profile.current_level,
    totalXP: profile.total_xp,
    coinBalance: profile.coin_balance,
    selectedLanguage: profile.selected_language,
    preferences: profile.preferences as Record<string, unknown>,
  };
}

/**
 * Migrate guest trial to registered account
 * Constitution Requirement: Migration MUST be atomic and data-preserving
 */
export async function migrateGuestToRegistered(
  guestId: string,
  userId: string
): Promise<void> {
  // This should be called after successful registration
  // The migration happens in a Supabase Edge Function to ensure atomicity

  const { error } = await supabase.functions.invoke('migrate-guest-trial', {
    body: { guestId, userId },
  });

  if (error) throw error;
}

