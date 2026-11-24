import React, { useState } from 'react';
import { JournalEntry, UserStats, AppSettings } from '../../types/journal';
import { ActiveTab } from '../mobile/MobileBottomNav';
import { Calendar } from '../calendar/Calendar';
import {
  formatDateArabic,
  getTodayISODate,
  MOOD_CONFIGS,
  toArabicNumerals,
  formatWordsCount,
  formatDaysCount,
  formatEntriesCount,
  cn
} from '../../lib/utils';
import {
  Feather,
  Sparkles,
  Flame,
  ArrowLeft,
  Heart,
  Clock,
  BookOpen,
  Calendar as CalendarIcon,
  Library,
  Timer,
  RefreshCw,
  BookMarked
} from 'lucide-react';
import {
  getDynamicGreeting,
  getCurrentWisdom,
  cycleNextWisdom,
  WisdomItem
} from '../../lib/dailyWisdom';
import { getTranslation } from '../../lib/i18n';

interface HomeDashboardProps {
  entries: Record<string, JournalEntry>;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onStartWritingToday: () => void;
  stats: UserStats;
  settings?: AppSettings;
  onNavigateTab?: (tab: ActiveTab) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  entries,
  selectedDate,
  onSelectDate,
  onStartWritingToday,
  stats,
  settings,
  onNavigateTab,
}) => {
  const lang = settings?.language || 'ar';
  const todayISO = getTodayISODate();
  const todayFormatted = formatDateArabic(todayISO, {
    showMonthNumber: settings?.showMonthNumber,
    enableHijri: settings?.enableHijriCalendar,
  });
  const todayEntry = entries[todayISO];
  const hasTodayEntry = todayEntry && todayEntry.content.trim().length > 0;

  // Dynamic literary greeting that updates fresh on every mount / refresh
  const [greeting, setGreeting] = useState(() => getDynamicGreeting(lang));

  // Rotating wisdom / lexicon / literary / spiritual pearls that update fresh on every mount / refresh
  const [wisdom, setWisdom] = useState<WisdomItem>(() => getCurrentWisdom());
  const [isRotating, setIsRotating] = useState(false);

  const handleCycleWisdom = () => {
    setIsRotating(true);
    const next = cycleNextWisdom();
    setWisdom(next);
    setGreeting(getDynamicGreeting(lang));
    setTimeout(() => setIsRotating(false), 300);
  };

  // Recent entries list (sorted newest first)
  const recentEntries = Object.values(entries)
    .filter(e => e.content.trim().length > 0 || e.mood !== null)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Hero / Greeting Section with Ambient Radial Gradient Glow */}
      <div className="relative group/hero">
        {/* 1. Behind the Card: Wide Atmospheric Ambient Halo (الهالة الخارجية الشاملة المحيطة بالبطاقة) */}
        <div
          className="absolute -inset-6 md:-inset-10 rounded-[3rem] opacity-95 dark:opacity-100 blur-2xl md:blur-3xl transition-all duration-700 pointer-events-none transform-gpu"
          style={{
            background: 'radial-gradient(ellipse 90% 80% at 65% 40%, var(--hero-ambient-color) 0%, var(--hero-ambient-soft) 48%, transparent 75%)',
          }}
          aria-hidden="true"
        />

        {/* 2. Concentrated Upper-Right Core Bloom (بؤرة الإشراق العلوية المركزة خلف الترحيب) */}
        <div
          className="absolute -top-8 -right-8 w-80 md:w-[32rem] h-64 md:h-80 rounded-full opacity-90 dark:opacity-100 blur-xl md:blur-2xl transition-all duration-700 pointer-events-none transform-gpu"
          style={{
            background: 'radial-gradient(circle at 55% 45%, var(--hero-ambient-color) 0%, var(--hero-ambient-soft) 55%, transparent 78%)',
          }}
          aria-hidden="true"
        />

        {/* 3. Immediate Card Rim Backlight (إضاءة الحواف الخلفية المباشرة والمشعة حول إطار البطاقة) */}
        <div
          className="absolute -inset-1.5 md:-inset-2.5 rounded-[2rem] opacity-85 dark:opacity-95 blur-md md:blur-lg transition-all duration-700 pointer-events-none transform-gpu"
          style={{
            background: 'radial-gradient(ellipse 95% 95% at 50% 15%, var(--hero-ambient-color) 0%, var(--hero-ambient-soft) 60%, transparent 85%)',
          }}
          aria-hidden="true"
        />

        {/* 4. Secondary Soft Counter-Glow (Warm atmospheric presence on bottom-left) */}
        <div
          className="absolute -bottom-8 -left-8 w-72 md:w-96 h-52 md:h-64 rounded-full opacity-75 dark:opacity-90 blur-2xl md:blur-3xl transition-all duration-700 pointer-events-none transform-gpu"
          style={{
            background: 'radial-gradient(circle at 35% 65%, var(--hero-ambient-soft) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        {/* 5. The Hero Card itself */}
        <div className="relative rounded-3xl p-6 md:p-10 bg-gradient-to-br from-[#FAF5EC] via-[#F6EFE2] to-[#ECE3D2] dark:from-[var(--color-bg-card)] dark:via-[var(--color-bg-surface)] dark:to-[var(--color-bg-base)] border border-black/[0.06] dark:border-[var(--color-border-subtle)] shadow-xl dark:shadow-[0_18px_45px_-12px_rgba(0,0,0,0.7),0_0_40px_-8px_var(--hero-ambient-soft)] overflow-hidden transition-all duration-500">
          {/* Top illuminated specular light edge */}
          <div
            className="absolute inset-x-0 top-0 h-[2px] pointer-events-none transition-all duration-700"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, var(--hero-ambient-color) 15%, var(--hero-ambient-color) 85%, transparent 100%)',
              opacity: 1,
            }}
            aria-hidden="true"
          />

          {/* Inner ambient radial gradient reflection & sheen */}
          <div
            className="absolute inset-0 pointer-events-none transition-all duration-700"
            style={{
              background: 'var(--hero-radial-gradient)',
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-accent-warm)]">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>{todayFormatted.fullString}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold text-[var(--color-text-primary)] tracking-tight">
                {greeting}
              </h1>

              {/* Dynamic Wisdom Card (Lexicon / Spiritual / Literary) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-black/[0.03] dark:bg-black/30 border border-black/[0.06] dark:border-white/[0.08] backdrop-blur-xs max-w-2xl transition-all">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase",
                      wisdom.type === 'lexical'
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25"
                        : wisdom.type === 'spiritual'
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25"
                        : "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25"
                    )}>
                      {lang === 'en' ? wisdom.typeLabelEn : wisdom.typeLabelAr}
                    </span>
                    <span className="text-xs font-bold text-[var(--color-text-primary)]">
                      {wisdom.title}
                    </span>
                  </div>

                  {/* Cycle Wisdom Button */}
                  <button
                    type="button"
                    onClick={handleCycleWisdom}
                    disabled={isRotating}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-accent-warm)] bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] transition-all active:scale-95"
                    title={getTranslation('dashboard_cycle_wisdom', lang)}
                  >
                    <RefreshCw className={cn("w-3 h-3", isRotating && "animate-spin")} />
                    <span>{getTranslation('dashboard_cycle_wisdom', lang)}</span>
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] font-text leading-relaxed italic">
                  {wisdom.text}
                </p>

                <div className="mt-2 text-[11px] font-medium text-[var(--color-accent-warm)] flex items-center justify-between">
                  <span>— {wisdom.author}</span>
                  {wisdom.badge && (
                    <span className="text-[10px] text-[var(--color-text-muted)]">
                      #{wisdom.badge}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Write Today Call-to-Action */}
            <div className="shrink-0 flex flex-col gap-2 self-start md:self-center">
              <button
                type="button"
                onClick={onStartWritingToday}
                className="group flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#B87B22] to-[#D49838] dark:from-[#9E6518] dark:to-[#B87B22] hover:opacity-95 text-white font-bold text-sm shadow-md shadow-[#B87B22]/15 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Feather className="w-4 h-4 transform group-hover:-rotate-12 transition-transform" />
                <span>
                  {hasTodayEntry
                    ? (lang === 'en' ? "Continue Today's Journal" : 'متابعة تدوينة اليوم')
                    : getTranslation('dashboard_start_writing', lang)}
                </span>
                <ArrowLeft className={cn(
                  "w-4 h-4 transform transition-transform",
                  lang === 'en' ? "group-hover:translate-x-1 rotate-180" : "group-hover:-translate-x-1"
                )} />
              </button>

              {hasTodayEntry && (
                <span className="text-[11px] text-center text-[var(--color-text-muted)]">
                  {lang === 'en'
                    ? `Written today: ${todayEntry.wordCount} words`
                    : `كتبت اليوم ${formatWordsCount(todayEntry.wordCount)}`}
                </span>
              )}
            </div>
          </div>
      </div>
    </div>

      {/* Main Grid: Interactive Calendar + Recent Reflections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Calendar (7 Cols on desktop) */}
        <div className="lg:col-span-7 space-y-4">
          <Calendar
            entries={entries}
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
            settings={settings}
          />
        </div>

        {/* Right Column: Quick Stats & Recent Pages (5 Cols on desktop) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Streak Banner */}
          <div className="p-5 rounded-3xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] shadow-subtle dark:shadow-subtle-dark flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[var(--color-accent-warm)]/15 text-[var(--color-accent-warm)] flex items-center justify-center">
                <Flame className="w-5 h-5 fill-current" />
              </div>
              <div>
                <div className="text-sm font-bold text-[var(--color-text-primary)]">
                  {formatDaysCount(stats.currentStreakDays)} متتالية
                </div>
                <div className="text-xs text-[var(--color-text-muted)]">
                  استمر في عادة الكتابة الهادئة
                </div>
              </div>
            </div>

            <div className="text-end text-xs text-[var(--color-text-muted)]">
              {formatWordsCount(stats.totalWordsWritten)}
            </div>
          </div>

          {/* Quick Shortcuts to Library & Focus */}
          {onNavigateTab && (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onNavigateTab('library')}
                className="p-3.5 rounded-3xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] hover:border-[var(--color-active-border)]/50 transition-all text-start group shadow-subtle dark:shadow-subtle-dark hover:scale-[1.01]"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-warm)] mb-1">
                  <Library className="w-4 h-4 text-[var(--color-accent-warm)]" />
                  <span>مكتبتي</span>
                </div>
                <p className="text-[10px] text-[var(--color-text-muted)]">
                  رفوف الكتب وتقييم القراءات
                </p>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('focus')}
                className="p-3.5 rounded-3xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] hover:border-[var(--color-active-border)]/50 transition-all text-start group shadow-subtle dark:shadow-subtle-dark hover:scale-[1.01]"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-warm)] mb-1">
                  <Timer className="w-4 h-4 text-[var(--color-accent-warm)]" />
                  <span>جلسة تركيز</span>
                </div>
                <p className="text-[10px] text-[var(--color-text-muted)]">
                  مؤقت البومودورو والمواد
                </p>
              </button>
            </div>
          )}

          {/* Recent Entries List */}
          <div className="p-5 rounded-3xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] shadow-subtle dark:shadow-subtle-dark">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--color-border-subtle)]">
              <h3 className="text-sm font-serif font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[var(--color-accent-warm)]" />
                <span>أحدث الصفحات والخواطر</span>
              </h3>
              <span className="text-xs text-[var(--color-text-muted)]">{formatEntriesCount(recentEntries.length)}</span>
            </div>

            <div className="space-y-3">
              {recentEntries.length === 0 ? (
                <div className="text-center py-6 text-xs text-[var(--color-text-muted)]">
                  لم تبدأ بالتدوين بعد. انقر على اليوم واكتب أول صفحة!
                </div>
              ) : (
                recentEntries.map((item) => {
                  const dateInfo = formatDateArabic(item.date);
                  const moodConfig = item.mood ? MOOD_CONFIGS[item.mood] : null;

                  return (
                    <div
                      key={item.id}
                      onClick={() => onSelectDate(item.date)}
                      className="group p-3 rounded-2xl bg-black/[0.02] dark:bg-[var(--color-bg-surface)] hover:bg-black/[0.05] dark:hover:bg-[var(--color-bg-card-hover)] border border-[var(--color-border-subtle)] hover:border-[var(--color-active-border)]/50 cursor-pointer transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-warm)] transition-colors truncate max-w-[200px]">
                          {item.title || 'تدوينة بدون عنوان'}
                        </span>
                        {moodConfig && (
                          <span className="text-xs" title={moodConfig.labelAr}>
                            {moodConfig.emoji}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">
                        {item.content || 'لا يوجد نص مكتوب...'}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--color-border-subtle)] text-[10px] text-[var(--color-text-muted)]">
                        <span>{dateInfo.dayName}، {dateInfo.dayNumberAr} {dateInfo.monthName}</span>
                        <span>{formatWordsCount(item.wordCount)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
