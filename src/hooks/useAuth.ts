import { useState, useEffect } from 'react';
import { UserProfile } from '../types/journal';
import { getSupabase, isSupabaseReady } from '../lib/supabaseClient';

const LOCAL_USER_KEY = 'trmez_auth_user_v1';

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const raw = localStorage.getItem(LOCAL_USER_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    // Default guest profile
    return {
      id: 'guest-local-user',
      email: 'guest@trmez.local',
      name: 'كاتب هادئ (زائر)',
      isGuest: true,
      joinedDate: new Date().toISOString(),
    };
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    // Check remote session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const remoteUser: UserProfile = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'مستخدم',
          isGuest: false,
          joinedDate: session.user.created_at,
        };
        setUser(remoteUser);
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(remoteUser));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const remoteUser: UserProfile = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'مستخدم',
          isGuest: false,
          joinedDate: session.user.created_at,
        };
        setUser(remoteUser);
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(remoteUser));
      } else {
        // Fall back to guest if signed out from remote
        const guest: UserProfile = {
          id: 'guest-local-user',
          email: 'guest@trmez.local',
          name: 'كاتب هادئ (زائر)',
          isGuest: true,
          joinedDate: new Date().toISOString(),
        };
        setUser(guest);
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(guest));
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    setAuthError(null);
    const supabase = getSupabase();

    if (!supabase) {
      // Simulate local login
      setTimeout(() => {
        const localUser: UserProfile = {
          id: `local-${Date.now()}`,
          email,
          name: email.split('@')[0] || 'كاتب',
          isGuest: false,
          joinedDate: new Date().toISOString(),
        };
        setUser(localUser);
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localUser));
        setIsLoading(false);
      }, 500);
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthError(error.message);
        setIsLoading(false);
        return { success: false, error: error.message };
      }
      if (data.user) {
        const u: UserProfile = {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'مستخدم',
          isGuest: false,
          joinedDate: data.user.created_at,
        };
        setUser(u);
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(u));
      }
      setIsLoading(false);
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ أثناء تسجيل الدخول';
      setAuthError(msg);
      setIsLoading(false);
      return { success: false, error: msg };
    }
  };

  const registerWithEmail = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    setAuthError(null);
    const supabase = getSupabase();

    if (!supabase) {
      setTimeout(() => {
        const localUser: UserProfile = {
          id: `local-${Date.now()}`,
          email,
          name: name || email.split('@')[0] || 'كاتب',
          isGuest: false,
          joinedDate: new Date().toISOString(),
        };
        setUser(localUser);
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localUser));
        setIsLoading(false);
      }, 500);
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name }
        }
      });
      if (error) {
        setAuthError(error.message);
        setIsLoading(false);
        return { success: false, error: error.message };
      }
      if (data.user) {
        const u: UserProfile = {
          id: data.user.id,
          email: data.user.email || '',
          name: name || data.user.email?.split('@')[0] || 'مستخدم',
          isGuest: false,
          joinedDate: data.user.created_at,
        };
        setUser(u);
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(u));
      }
      setIsLoading(false);
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ أثناء إنشاء الحساب';
      setAuthError(msg);
      setIsLoading(false);
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    const guest: UserProfile = {
      id: 'guest-local-user',
      email: 'guest@trmez.local',
      name: 'كاتب هادئ (زائر)',
      isGuest: true,
      joinedDate: new Date().toISOString(),
    };
    setUser(guest);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(guest));
  };

  const setGuestMode = () => {
    const guest: UserProfile = {
      id: 'guest-local-user',
      email: 'guest@trmez.local',
      name: 'كاتب هادئ (خزينة محلية)',
      isGuest: true,
      joinedDate: new Date().toISOString(),
    };
    setUser(guest);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(guest));
  };

  return {
    user,
    isLoading,
    authError,
    loginWithEmail,
    registerWithEmail,
    logout,
    setGuestMode,
    isSupabaseConnected: isSupabaseReady(),
  };
}
