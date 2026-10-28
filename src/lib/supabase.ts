import { createClient, SupabaseClient } from '@supabase/supabase-js';

const defaultUrl = import.meta.env.VITE_SUPABASE_URL || '';
const defaultAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Load custom credentials from localStorage if provided by user in settings
const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('campusevent_supabase_url') : null;
const storedAnonKey = typeof window !== 'undefined' ? localStorage.getItem('campusevent_supabase_anon_key') : null;

export const supabaseUrl = storedUrl || defaultUrl;
export const supabaseAnonKey = storedAnonKey || defaultAnonKey;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  supabaseUrl.includes('.supabase.co')
);

export let supabase: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (err) {
    console.warn('Gagal menginisialisasi client Supabase:', err);
    supabase = null;
  }
}

export function saveSupabaseConfig(url: string, anonKey: string) {
  localStorage.setItem('campusevent_supabase_url', url.trim());
  localStorage.setItem('campusevent_supabase_anon_key', anonKey.trim());
  window.location.reload();
}

export function clearSupabaseConfig() {
  localStorage.removeItem('campusevent_supabase_url');
  localStorage.removeItem('campusevent_supabase_anon_key');
  window.location.reload();
}
