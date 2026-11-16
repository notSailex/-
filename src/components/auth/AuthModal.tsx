import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getStoredSupabaseConfig, saveStoredSupabaseConfig } from '../../lib/supabaseClient';
import { X, Lock, Mail, User, Shield, Sparkles, Key, Check, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, isLoading, authError, loginWithEmail, registerWithEmail, logout, setGuestMode, isSupabaseConnected } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showConfig, setShowConfig] = useState(false);

  // Config fields
  const currentConfig = getStoredSupabaseConfig();
  const [customUrl, setCustomUrl] = useState(currentConfig.url);
  const [customKey, setCustomKey] = useState(currentConfig.key);
  const [configSaved, setConfigSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'login') {
      const res = await loginWithEmail(email, password);
      if (res.success) onClose();
    } else {
      const res = await registerWithEmail(email, password, name);
      if (res.success) onClose();
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredSupabaseConfig(customUrl, customKey);
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] rounded-2xl md:rounded-3xl border border-[var(--color-border-subtle)] shadow-2xl overflow-hidden p-6 md:p-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 left-5 p-1.5 rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#B87B22] to-[#D49838] dark:from-[#9E6518] dark:to-[#B87B22] text-white flex items-center justify-center mx-auto mb-3 shadow-sm shadow-[#B87B22]/15">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-[var(--color-text-primary)]">
            {user && !user.isGuest ? 'حسابك الشخصي' : 'بوابة الخزينة الهادئة'}
          </h3>
          <p className="text-xs text-[#7E786E] dark:text-[var(--color-text-muted)] mt-1">
            {isSupabaseConnected
              ? 'متصل بقاعدة سحابة Supabase بأمان وتشفير كامل'
              : 'يعمل حالياً في نمط الخزينة المحلية المحمية على جهازك'}
          </p>
        </div>

        {user && !user.isGuest ? (
          // Already logged in view
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-black/[0.03] dark:bg-[var(--color-bg-surface)] border border-black/[0.06] dark:border-[var(--color-border-subtle)] text-center">
              <div className="text-sm font-bold text-[#1D1A16] dark:text-[#F3EFE6]">
                {user.name}
              </div>
              <div className="text-xs text-[#8C8476] mt-0.5 font-mono">
                {user.email}
              </div>
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-400/30">
                جلسة نشطة ومزامنة
              </span>
            </div>

            <button
              type="button"
              onClick={async () => {
                await logout();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-colors"
            >
              تسجيل الخروج والعودة للنمط المحلي
            </button>
          </div>
        ) : (
          // Tabs: Login / Register
          <>
            <div className="flex bg-black/[0.04] dark:bg-white/[0.05] p-1 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setTab('login')}
                className={cn(
                  "flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all",
                  tab === 'login'
                    ? "bg-white dark:bg-[#25252B] text-[#1D1A16] dark:text-[#F3EFE6] shadow-sm"
                    : "text-[#7E786E] dark:text-[#8C8476]"
                )}
              >
                تسجيل الدخول
              </button>
              <button
                type="button"
                onClick={() => setTab('register')}
                className={cn(
                  "flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all",
                  tab === 'register'
                    ? "bg-white dark:bg-[#25252B] text-[#1D1A16] dark:text-[#F3EFE6] shadow-sm"
                    : "text-[#7E786E] dark:text-[#8C8476]"
                )}
              >
                حساب جديد
              </button>
            </div>

            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {tab === 'register' && (
                <div>
                  <label className="text-xs font-medium text-[#5C5549] dark:text-[#A8A196] block mb-1">
                    الاسم المستعار أو اسم الكاتب
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#8C8476] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="مثال: ياسمين أحمد"
                      className="w-full pr-9 pl-3 py-2 text-xs rounded-xl bg-white dark:bg-black/30 border border-black/[0.08] dark:border-[var(--color-border-subtle)] focus:outline-none focus:ring-2 focus:ring-[#E09F3E]/40"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-[#5C5549] dark:text-[#A8A196] block mb-1">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8C8476] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pr-9 pl-3 py-2 text-xs rounded-xl bg-white dark:bg-black/30 border border-black/[0.08] dark:border-[var(--color-border-subtle)] focus:outline-none focus:ring-2 focus:ring-[#E09F3E]/40"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[#5C5549] dark:text-[#A8A196] block mb-1">
                  كلمة المرور
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8C8476] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pr-9 pl-3 py-2 text-xs rounded-xl bg-white dark:bg-black/30 border border-black/[0.08] dark:border-[var(--color-border-subtle)] focus:outline-none focus:ring-2 focus:ring-[#E09F3E]/40"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 mt-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#C98829] to-[#E09F3E] hover:from-[#B5771F] hover:to-[#C98829] shadow-md shadow-[#E09F3E]/20 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>جاري المعالجة...</span>
                ) : tab === 'login' ? (
                  <>
                    <Shield className="w-3.5 h-3.5" />
                    <span>دخول آمن للخزينة</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>إنشاء حساب وتفعيل المزامنة</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Guest mode option */}
            <div className="mt-4 pt-4 border-t border-black/[0.06] dark:border-[var(--color-border-subtle)] text-center">
              <button
                type="button"
                onClick={() => {
                  setGuestMode();
                  onClose();
                }}
                className="text-xs text-[#7E786E] dark:text-[#9E9689] hover:text-[#E09F3E] transition-colors"
              >
                المتابعة كزائر بدون حساب (تخزين محلي فقط) →
              </button>
            </div>
          </>
        )}

        {/* Supabase Config Collapsible Section */}
        <div className="mt-6 pt-4 border-t border-black/[0.06] dark:border-[var(--color-border-subtle)]">
          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center justify-between w-full text-[11px] text-[#8C8476] hover:text-[#1D1A16] dark:hover:text-[#F3EFE6] transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Key className="w-3 h-3 text-[#E09F3E]" />
              <span>إعدادات ربط Supabase السحابي</span>
            </span>
            <span>{showConfig ? 'إخفاء' : 'تعديل'}</span>
          </button>

          {showConfig && (
            <form onSubmit={handleSaveConfig} className="mt-3 space-y-2 text-xs">
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://xyz.supabase.co"
                className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-black/30 border border-black/[0.08] dark:border-[var(--color-border-subtle)] text-[11px]"
              />
              <input
                type="password"
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                placeholder="Supabase Anon Key"
                className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-black/30 border border-black/[0.08] dark:border-[var(--color-border-subtle)] text-[11px]"
              />
              <button
                type="submit"
                className="w-full py-1.5 text-xs font-semibold bg-[#1D1A16] text-[#F3EFE6] dark:bg-[#F3EFE6] dark:text-[#1D1A16] rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                {configSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                <span>{configSaved ? 'تم حفظ المفاتيح' : 'حفظ مفاتيح Supabase'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
