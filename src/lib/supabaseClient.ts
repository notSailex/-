import { createClient, SupabaseClient } from '@supabase/supabase-js';

const LOCAL_STORAGE_KEY_URL = 'trmez_supabase_url';
const LOCAL_STORAGE_KEY_KEY = 'trmez_supabase_anon_key';

export function getStoredSupabaseConfig() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const url = (envUrl && envUrl.trim()) || localStorage.getItem(LOCAL_STORAGE_KEY_URL) || '';
  const key = (envKey && envKey.trim()) || localStorage.getItem(LOCAL_STORAGE_KEY_KEY) || '';
  return { url, key, isConfigured: Boolean(url && key && url.startsWith('http')) };
}

export function saveStoredSupabaseConfig(url: string, key: string) {
  localStorage.setItem(LOCAL_STORAGE_KEY_URL, url.trim());
  localStorage.setItem(LOCAL_STORAGE_KEY_KEY, key.trim());
  initClient();
}

let supabaseInstance: SupabaseClient | null = null;

export function initClient(): SupabaseClient | null {
  const { url, key, isConfigured } = getStoredSupabaseConfig();
  if (isConfigured) {
    try {
      supabaseInstance = createClient(url, key);
      return supabaseInstance;
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      supabaseInstance = null;
      return null;
    }
  }
  supabaseInstance = null;
  return null;
}

// Initial attempt
initClient();

export function getSupabase(): SupabaseClient | null {
  if (!supabaseInstance) {
    initClient();
  }
  return supabaseInstance;
}

export const isSupabaseReady = (): boolean => {
  return Boolean(getSupabase());
};
