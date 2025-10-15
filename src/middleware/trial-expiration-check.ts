/**
 * Trial Expiration Check Middleware
 * Validates guest trial status and handles expiration
 */

import { defineMiddleware } from 'astro:middleware';
import { validateGuestTrial } from '@/lib/supabase/queries/guest-trials';

// Routes that don't require trial validation
const PUBLIC_ROUTES = ['/', '/about', '/contact', '/api/auth/guest', '/api/auth/login', '/api/auth/register'];

export const onRequest = defineMiddleware(async ({ cookies, url, redirect }, next) => {
  const pathname = url.pathname;

  // Skip validation for public routes and static assets
  if (
    PUBLIC_ROUTES.includes(pathname) ||
    pathname.startsWith('/_') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return next();
  }

  // Check if user has a guest token
  const guestToken = cookies.get('guest_token')?.value;
  const userId = cookies.get('user_id')?.value;

  if (!guestToken || !userId) {
    // No guest token, allow access (they might be a registered user)
    return next();
  }

  // Validate guest trial
  const validation = await validateGuestTrial(userId);

  if (!validation.valid) {
    if (validation.expired) {
      // Trial expired, redirect to registration
      return redirect(`/auth/trial-expired?return=${encodeURIComponent(pathname)}`);
    }
  }

  // Check if trial is expiring soon (< 7 days)
  if (validation.daysRemaining && validation.daysRemaining <= 7) {
    // Add warning header (can be picked up by frontend)
    const response = await next();
    response.headers.set('X-Trial-Warning', 'true');
    response.headers.set('X-Trial-Days-Remaining', validation.daysRemaining.toString());
    return response;
  }

  return next();
});

