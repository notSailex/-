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
    if (!sessionUser || !sessionUser.id) {
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
      if (session?.user) {
        syncUserFromSession(session.user);
      } else {
        // No active session - ensure clean state
        setUser(null);
        wipeAllUserData();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
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
          msg = 'يرجى تأكيد بريدك الإلكتروني أولاً، أو تعطيل خيار تأكيد البريد من لوحة التحكم.';
        } else if (msg.includes('Invalid login credentials')) {
          msg = 'بيانات الدخول غير صحيحة، يرجى التأكد من البريد وكلمة المرور.';
        }
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
        let msg = error.message;
        const lower = msg.toLowerCase();
        if (lower.includes('rate limit')) {
          msg = 'تم تجاوز الحد الأقصى لإرسال رسائل التفعيل مؤقتاً. يرجى الانتظار قليلاً ثم المحاولة مرة أخرى.';
        } else if (lower.includes('already registered') || lower.includes('user already exists')) {
          msg = 'هذا البريد مسجل مسبقاً، يرجى الانتقال إلى تبويب "تسجيل الدخول".';
        } else if (lower.includes('password')) {
          msg = 'كلمة المرور يجب أن تكون 6 أحرف أو أرقام على الأقل.';
        }
        setAuthError(msg);
        setIsLoading(false);
        return { success: false, error: msg };
      }

      // If auto-logged in (Confirm email is OFF in Supabase):
      if (data.session && data.user) {
        await syncUserFromSession(data.user);
        setIsLoading(false);
        return { success: true, requiresEmailConfirmation: false };
      }

      // If Supabase still requires email confirmation:
      if (data.user && !data.user.email_confirmed_at && !data.session) {
        setUser(null);
        setIsLoading(false);
        return {
          success: true,
          requiresEmailConfirmation: true,
          email,
        };
      }

      if (data.user) {
        await syncUserFromSession(data.user);
        setIsLoading(false);
        return { success: true, requiresEmailConfirmation: false };
      }

      setUser(null);
      setIsLoading(false);
      return {
        success: false,
        error: 'تعذر استكمال التسجيل',
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
