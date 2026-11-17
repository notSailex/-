import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types/journal';
import { getSupabase, isSupabaseReady } from '../lib/supabaseClient';
import { fetchUserProfile } from '../lib/supabaseService';

const LOCAL_USER_KEY = 'trmez_auth_user_v2';

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const raw = localStorage.getItem(LOCAL_USER_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.id && !parsed.isGuest) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const syncUserFromSession = useCallback(async (sessionUser: any) => {
    try {
      const profile = await fetchUserProfile(sessionUser.id);
      const u: UserProfile = {
        id: sessionUser.id,
        email: sessionUser.email || '',
        name: profile?.name || sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0] || 'مستخدم',
        isGuest: false,
        role: profile?.role || 'user',
        isAdmin: profile?.role === 'admin' || profile?.isAdmin === true,
        joinedDate: sessionUser.created_at,
      };
      setUser(u);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(u));
      return u;
    } catch (e) {
      console.warn('Error loading user profile:', e);
      const fallbackUser: UserProfile = {
        id: sessionUser.id,
        email: sessionUser.email || '',
        name: sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0] || 'مستخدم',
        isGuest: false,
        role: 'user',
        isAdmin: false,
        joinedDate: sessionUser.created_at,
      };
      setUser(fallbackUser);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(fallbackUser));
      return fallbackUser;
    }
  }, []);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    // Check remote session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        syncUserFromSession(session.user);
      } else {
        // No active session
        setUser(null);
        localStorage.removeItem(LOCAL_USER_KEY);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        syncUserFromSession(session.user);
      } else {
        setUser(null);
        localStorage.removeItem(LOCAL_USER_KEY);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [syncUserFromSession]);

  const loginWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    setAuthError(null);
    const supabase = getSupabase();

    if (!supabase) {
      // Offline fallback login
      const localUser: UserProfile = {
        id: `local-${Date.now()}`,
        email,
        name: email.split('@')[0] || 'كاتب',
        isGuest: false,
        role: 'user',
        isAdmin: false,
        joinedDate: new Date().toISOString(),
      };
      setUser(localUser);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localUser));
      setIsLoading(false);
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
        await syncUserFromSession(data.user);
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
      const localUser: UserProfile = {
        id: `local-${Date.now()}`,
        email,
        name: name || email.split('@')[0] || 'كاتب',
        isGuest: false,
        role: 'user',
        isAdmin: false,
        joinedDate: new Date().toISOString(),
      };
      setUser(localUser);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localUser));
      setIsLoading(false);
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
        await syncUserFromSession(data.user);
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
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('SignOut error:', e);
      }
    }
    setUser(null);
    localStorage.removeItem(LOCAL_USER_KEY);
  };

  const refreshProfile = async () => {
    if (user?.id) {
      const profile = await fetchUserProfile(user.id);
      if (profile) {
        const updated: UserProfile = {
          ...user,
          role: profile.role || user.role,
          isAdmin: profile.role === 'admin' || profile.isAdmin === true,
        };
        setUser(updated);
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updated));
      }
    }
  };

  const setGuestMode = () => {
    // Mode for exploring without logging in (read-only preview)
    setUser(null);
    localStorage.removeItem(LOCAL_USER_KEY);
  };

  return {
    user,
    isLoading,
    authError,
    loginWithEmail,
    registerWithEmail,
    logout,
    refreshProfile,
    setGuestMode,
    isSupabaseConnected: isSupabaseReady(),
  };
}
