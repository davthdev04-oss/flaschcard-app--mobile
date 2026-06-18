import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';

const expoConfig = Constants.expoConfig ?? {};
const supabaseUrl = expoConfig.extra?.SUPABASE_URL;
const supabaseAnonKey = expoConfig.extra?.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(`Missing Supabase env vars. URL: ${supabaseUrl}, Key: ${supabaseAnonKey}`);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
