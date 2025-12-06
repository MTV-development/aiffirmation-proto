import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type-safe helper for KV Store operations
export type KVStoreRow = {
  id: string;
  key: string;
  value: unknown;
  created_at: string;
  updated_at: string;
};
