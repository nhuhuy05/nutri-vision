import { createClient } from '@supabase/supabase-js';
import { secureSessionStorage } from '../../infrastructure/SecureSessionStorage';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://jswxvjwwjafhmvpelvpm.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_cFITFNoxJFeBaY5-5jrzVA_ESIZwGlt';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: secureSessionStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
