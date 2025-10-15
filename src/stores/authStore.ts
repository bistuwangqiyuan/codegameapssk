import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, GuestTrial, ProgressSnapshot } from '@/types/entities';
import { getCurrentUser, logout as authLogout } from '@/lib/supabase/auth';
import { syncGuestProgress } from '@/lib/supabase/queries/guest-trials';

interface AuthState {
  user: User | null;
  guestTrial: GuestTrial | null;
  isGuest: boolean;
  isLoading: boolean;
  trialDaysRemaining: number | null;
  setUser: (user: User | null) => void;
  setGuestTrial: (trial: GuestTrial | null) => void;
  setTrialDaysRemaining: (days: number) => void;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  syncProgress: () => Promise<void>;
}

// Progress sync debounce timer
let syncTimer: NodeJS.Timeout | null = null;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      guestTrial: null,
      isGuest: false,
      isLoading: true,
      trialDaysRemaining: null,

      setUser: (user) => set({ user, isGuest: false }),

      setGuestTrial: (trial) => set({ guestTrial: trial, isGuest: true }),

      setTrialDaysRemaining: (days) => set({ trialDaysRemaining: days }),

      logout: async () => {
        await authLogout();
        set({ user: null, guestTrial: null, isGuest: false, trialDaysRemaining: null });
        // Clear persisted state
        localStorage.removeItem('auth-storage');
      },

      initialize: async () => {
        set({ isLoading: true });
        try {
          const user = await getCurrentUser();
          if (user) {
            set({ user, isGuest: false, isLoading: false });
          } else {
            // Check for guest trial in localStorage
            const guestData = localStorage.getItem('guest-trial');
            if (guestData) {
              const trial = JSON.parse(guestData);
              set({ guestTrial: trial, isGuest: true, isLoading: false });
            } else {
              set({ isLoading: false });
            }
          }
        } catch (error) {
          console.error('Auth initialization failed:', error);
          set({ isLoading: false });
        }
      },

      // T051: Sync progress to database (debounced)
      syncProgress: async () => {
        const { user, isGuest } = get();

        if (!isGuest || !user) return;

        // Clear existing timer
        if (syncTimer) {
          clearTimeout(syncTimer);
        }

        // Debounce progress sync (wait 2 seconds after last change)
        syncTimer = setTimeout(async () => {
          try {
            // Gather progress data from localStorage
            const progressSnapshot: ProgressSnapshot = {
              xp: user.xp || 0,
              level: user.level || 1,
              completed_lessons: JSON.parse(localStorage.getItem('completed_lessons') || '[]'),
              completed_challenges: JSON.parse(localStorage.getItem('completed_challenges') || '[]'),
              projects: JSON.parse(localStorage.getItem('projects') || '[]'),
              achievements: JSON.parse(localStorage.getItem('achievements') || '[]'),
            };

            await syncGuestProgress(user.id, progressSnapshot);
          } catch (error) {
            console.error('Progress sync error:', error);
          }
        }, 2000);
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isGuest: state.isGuest,
        trialDaysRemaining: state.trialDaysRemaining,
      }),
    }
  )
);

// T051: Sync progress on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    const state = useAuthStore.getState();
    if (state.isGuest && state.user) {
      // Gather final progress snapshot
      const progressSnapshot: ProgressSnapshot = {
        xp: state.user.xp || 0,
        level: state.user.level || 1,
        completed_lessons: JSON.parse(localStorage.getItem('completed_lessons') || '[]'),
        completed_challenges: JSON.parse(localStorage.getItem('completed_challenges') || '[]'),
        projects: JSON.parse(localStorage.getItem('projects') || '[]'),
        achievements: JSON.parse(localStorage.getItem('achievements') || '[]'),
      };

      // Send progress via fetch with keepalive flag for reliability
      fetch('/api/progress/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: state.user.id,
          progress: progressSnapshot,
        }),
        keepalive: true,
      }).catch((err) => console.error('Final sync failed:', err));
    }
  });
}

