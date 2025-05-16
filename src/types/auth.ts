
import { User as SupabaseUser } from "@supabase/supabase-js";

export interface User extends SupabaseUser {
  name?: string;
  avatar_url?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
  updateUserProfile?: (profile: Partial<User>) => Promise<void>;
  logout?: () => Promise<void>;
}

export interface Profile {
  id: string;
  email: string;
  username: string;
  full_name: string;
  city?: string;
  country?: string;
  preferred_currency: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}
