import React from 'react';
import { UserProfile, UserStats, AppSettings, JournalEntry } from '../../types/journal';
import {
  ShieldCheck,
  Feather,
  Flame,
  BookOpen,
} from 'lucide-react';
import { toArabicNumerals } from '../../lib/utils';
import { CustomizationStudio } from '../settings/CustomizationStudio';

interface ProfileViewProps {
  user: UserProfile | null;
  stats: UserStats;
  settings: AppSettings;
  onOpenAuth: () => void;
  onToggleTheme: () => void;
  onSetTheme: (theme: 'dark' | 'light') => void;
  onSetNightTheme: (nightTheme: 'sand' | 'sky' | 'palms') => void;
  onSetFont: (font: AppSettings['fontFamily']) => void;
  onSetPaperRuling: (paper: AppSettings['paperRuling']) => void;
  onUpdateSettings?: (partial: Partial<AppSettings>) => void;
  entries?: Record<string, JournalEntry>;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  stats,
  settings,
  onOpenAuth,
  onSetTheme,
  onSetNightTheme,
  onSetFont,
  onSetPaperRuling,
  onUpdateSettings,
  entries,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in pb-20 select-none">
      {/* Profile Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] shadow-subtle dark:shadow-subtle-dark text-center relative overflow-hidden">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#B87B22] to-[#D49838] dark:from-[#9E6518] dark:to-[#B87B22] text-white flex items-center justify-center mx-auto mb-4 shadow-md shadow-[#B87B22]/15 text-3xl font-serif font-bold">
          {user?.name ? user.name[0] : 'ك'}
        </div>

        <h3 className="text-2xl font-display font-bold text-[var(--color-text-primary)]">
          {user?.name || 'كاتب هادئ'}
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] font-mono mt-0.5">
          {user?.email || 'guest@trmez.local'}
        </p>

        <div className="flex items-center justify-center gap-2 mt-3">
          {user?.isGuest ? (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--color-accent-warm)]/10 text-[var(--color-accent-warm)] border border-[var(--color-accent-warm)]/20">
              خزينة محلية (Local Vault)
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>مزامنة سحابية معتمدة</span>
            </span>
          )}
        </div>

        <div className="mt-6 flex justify-center gap-2">
          <button
            type="button"
            onClick={onOpenAuth}
            className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-[var(--color-accent-warm)] text-white hover:opacity-90 shadow-sm transition-opacity"
          >
            {user?.isGuest ? 'ربط الحساب بسحابة Supabase' : 'إدارة الحساب'}
          </button>
        </div>
      </div>

      {/* Writing Highlights */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-3xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] text-center shadow-subtle dark:shadow-subtle-dark">
          <Feather className="w-4 h-4 text-[var(--color-accent-warm)] mx-auto mb-1" />
          <div className="text-xl font-bold font-sans text-[var(--color-text-primary)]">
            {toArabicNumerals(stats.totalWordsWritten)}
          </div>
          <div className="text-[10px] text-[var(--color-text-muted)]">كلمة مكتوبة</div>
        </div>

        <div className="p-4 rounded-3xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] text-center shadow-subtle dark:shadow-subtle-dark">
          <Flame className="w-4 h-4 text-amber-500 mx-auto mb-1" />
          <div className="text-xl font-bold font-sans text-[var(--color-text-primary)]">
            {toArabicNumerals(stats.currentStreakDays)}
          </div>
          <div className="text-[10px] text-[var(--color-text-muted)]">أيام متتالية</div>
        </div>

        <div className="p-4 rounded-3xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] text-center shadow-subtle dark:shadow-subtle-dark">
          <BookOpen className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
          <div className="text-xl font-bold font-sans text-[var(--color-text-primary)]">
            {toArabicNumerals(stats.totalEntriesCount)}
          </div>
          <div className="text-[10px] text-[var(--color-text-muted)]">صفحة مدوّنة</div>
        </div>
      </div>

      {/* ========================================================
          لوحة التخصيص الدائمة والمثبتة (Permanent Pinned Studio)
          مفتوحة دائماً دون نوافذ منبثقة أو أزرار فتح
          ======================================================== */}
      <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[var(--color-bg-card)] border border-black/[0.07] dark:border-[var(--color-border-subtle)] shadow-subtle dark:shadow-subtle-dark">
        <CustomizationStudio
          settings={settings}
          onSetTheme={onSetTheme}
          onSetNightTheme={onSetNightTheme}
          onSetFont={onSetFont}
          onSetPaperRuling={onSetPaperRuling}
          onUpdateSettings={onUpdateSettings}
          entries={entries}
          compact={false}
        />
      </div>
    </div>
  );
};
