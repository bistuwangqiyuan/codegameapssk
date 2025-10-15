// Database types - Auto-generated from Supabase schema
// Run: supabase gen types typescript --local > src/types/database.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          user_type: 'guest' | 'student' | 'teacher' | 'admin';
          registration_date: string;
          current_level: number;
          total_xp: number;
          coin_balance: number;
          selected_language: 'en' | 'zh';
          preferences: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id: string;
        };
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      guest_trials: {
        Row: {
          guest_id: string;
          created_at: string;
          expires_at: string;
          last_activity: string;
          progress_snapshot: Json;
          migrated_at: string | null;
          migrated_to_user_id: string | null;
        };
        Insert: Omit<Database['public']['Tables']['guest_trials']['Row'], 'guest_id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['guest_trials']['Insert']>;
      };
      // Add other table types as needed...
    };
    Views: {
      leaderboard: {
        Row: {
          id: string;
          total_xp: number;
          current_level: number;
          coin_balance: number;
          project_count: number;
          xp_rank: number;
          project_rank: number;
        };
      };
    };
    Functions: {
      refresh_leaderboard: {
        Args: Record<string, never>;
        Returns: void;
      };
    };
  };
}

