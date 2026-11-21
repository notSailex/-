import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types/journal';
import { getSupabase, isSupabaseReady } from '../lib/supabaseClient';
import { fetchUserProfile } from '../lib/supabaseService';
import { wipeAllUserData } from '../lib/storage';

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
    // Enforce email confirmation check: do not set user if email is unconfirmed
    if (sessionUser && !sessionUser.email_confirmed_at) {
      setUser(null);
      wipeAllUserData();
      return null;
    }

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

    // Check remote session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && session.user.email_confirmed_at) {
        syncUserFromSession(session.user);
      } else {
        // No active or confirmed session - ensure clean state
        setUser(null);
        wipeAllUserData();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user || !session.user.email_confirmed_at) {
        setUser(null);
        wipeAllUserData();
      } else if (session?.user) {
        // If switching between different accounts, purge local state first
        const currentStored = localStorage.getItem(LOCAL_USER_KEY);
        if (currentStored) {
          try {
            const parsed = JSON.parse(currentStored);
            if (parsed.id && parsed.id !== session.user.id) {
              wipeAllUserData();
            }
          } catch {
            // ignore
          }
        }
        syncUserFromSession(session.user);
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
      setAuthError('تعذر الاتصال بالخادم السحابي حالياً.');
      setIsLoading(false);
      return { success: false, error: 'تعذر الاتصال بالخادم السحابي حالياً.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        let msg = error.message;
        if (msg.includes('Email not confirmed')) {
          msg = 'يرجى تأكيد بريدك الإلكتروني أولاً. تم إرسال رابط التفعيل إلى بريدك، يرجى النقر عليه لتفعيل حسابك والدخول.';
        } else if (msg.includes('Invalid login credentials')) {
          msg = 'بيانات الدخول غير صحيحة، يرجى التأكد من البريد وكلمة المرور.';
        }
        setAuthError(msg);
        setIsLoading(false);
        return { success: false, error: msg };
      }

      if (data.user && !data.user.email_confirmed_at) {
        await supabase.auth.signOut();
        const msg = 'يرجى تأكيد بريدك الإلكتروني أولاً لتفعيل حسابك وتجهيز مساحتك الخاصة.';
        setAuthError(msg);
        setIsLoading(false);
        return { success: false, error: msg };
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
      setAuthError('تعذر الاتصال بالخادم السحابي حالياً.');
      setIsLoading(false);
      return { success: false, error: 'تعذر الاتصال بالخادم السحابي حالياً.' };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        }
      });
      if (error) {
        setAuthError(error.message);
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      // If email confirmation is required:
      if (data.user && !data.user.email_confirmed_at && !data.session) {
        setUser(null);
        setIsLoading(false);
        return {
          success: true,
          requiresEmailConfirmation: true,
          email,
        };
      }

      // If auto-confirmed
      if (data.session && data.user && data.user.email_confirmed_at) {
        await syncUserFromSession(data.user);
        setIsLoading(false);
        return { success: true, requiresEmailConfirmation: false };
      }

      setUser(null);
      setIsLoading(false);
      return {
        success: true,
        requiresEmailConfirmation: true,
        email,
      };
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
    wipeAllUserData();
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
    setUser(null);
    wipeAllUserData();
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
