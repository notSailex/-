import React, { useMemo } from 'react';
import { UserStats, MoodType, FocusSession, FocusSessionType } from '../../types/journal';
import { loadStoredFocusSessions } from '../../lib/storage';
import {
  MOOD_CONFIGS,
  toArabicNumerals,
  formatPercentArabic,
  formatEntriesCount,
  formatDaysCount,
  formatWordsCount,
  cn
} from '../../lib/utils';
import {
  BarChart2,
  Flame,
  Award,
  Feather,
  BookOpen,
  Calendar,
  Sparkles,
  TrendingUp,
  Smile,
  Timer,
  GraduationCap,
  Briefcase,
  Heart,
  Clock,
  Layers
} from 'lucide-react';

interface StatsDashboardProps {
  stats: UserStats;
  onSelectDate: (date: string) => void;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  stats,
  onSelectDate,
}) => {
  const {
    totalWordsWritten,
    totalEntriesCount,
    currentStreakDays,
    longestStreakDays,
    moodCounts,
    sevenDayWordCounts,
  } = stats;

  // Find max word count to scale the 7-day chart smoothly
  const maxWords = Math.max(...sevenDayWordCounts.map(d => d.wordCount), 80);

  // Total recorded moods
  const totalMoodLogs = Object.values(moodCounts).reduce((a, b) => a + b, 0) || 1;

  const moodKeys: MoodType[] = ['radiant', 'peaceful', 'neutral', 'exhausted', 'heavy'];

  // Focus Sessions Analytics
  const focusSessions = useMemo(() => loadStoredFocusSessions(), []);

  const totalFocusMinutes = useMemo(() => {
    return focusSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  }, [focusSessions]);

  const totalFocusHours = (totalFocusMinutes / 60).toFixed(1);

  // Time distribution per subject
  const subjectDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    focusSessions.forEach(s => {
      map[s.subject] = (map[s.subject] || 0) + s.durationMinutes;
    });
    return Object.entries(map)
      .map(([subject, minutes]) => ({
        subject,
        minutes,
        hours: (minutes / 60).toFixed(1),
        percentage: totalFocusMinutes > 0 ? Math.round((minutes / totalFocusMinutes) * 100) : 0,
      }))
      .sort((a, b) => b.minutes - a.minutes);
  }, [focusSessions, totalFocusMinutes]);

  // Time distribution per session type
  const typeDistribution = useMemo(() => {
    const map: Record<FocusSessionType, number> = {
      study: 0,
      work: 0,
      reading: 0,
      meditation: 0,
    };
    focusSessions.forEach(s => {
      map[s.sessionType] = (map[s.sessionType] || 0) + s.durationMinutes;
    });

    const labels: Record<FocusSessionType, { label: string; icon: React.ElementType; color: string }> = {
      study: { label: 'مذاكرة', icon: GraduationCap, color: '#38BDF8' },
      work: { label: 'عمل', icon: Briefcase, color: '#F59E0B' },
      reading: { label: 'قراءة', icon: BookOpen, color: '#10B981' },
      meditation: { label: 'تأمل', icon: Heart, color: '#EC4899' },
    };

    return (Object.keys(map) as FocusSessionType[]).map(type => ({
      type,
      label: labels[type].label,
      icon: labels[type].icon,
      color: labels[type].color,
      minutes: map[type],
      hours: (map[type] / 60).toFixed(1),
      percentage: totalFocusMinutes > 0 ? Math.round((map[type] / totalFocusMinutes) * 100) : 0,
    }));
  }, [focusSessions, totalFocusMinutes]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in pb-16 select-none">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-black/[0.08] dark:border-[var(--color-border-subtle)]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-accent-warm)] mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>لوحة التحليلات والتأمل</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-[#1D1A16] dark:text-[#F3EFE6]">
            إحصاءات الكتابة والنبض العاطفي
          </h2>
          <p className="text-sm text-[#7E786E] dark:text-[var(--color-text-muted)] mt-1">
            نظرة هادئة على وتيرة كلماتك وتوازنك النفسي خلال الأيام السبعة الماضية.
          </p>
        </div>

        {/* Writing Streak Badge */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-[var(--color-accent-warm)]/10 to-[#F4A261]/10 border border-[var(--color-accent-warm)]/25 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-warm)] text-white flex items-center justify-center shadow-sm">
            <Flame className="w-5 h-5 fill-current animate-pulse" />
          </div>
          <div>
            <div className="text-xl font-bold font-sans text-[#1D1A16] dark:text-[#F3EFE6]">
              {formatDaysCount(currentStreakDays)} متواصلة
            </div>
            <div className="text-xs text-[#7E786E] dark:text-[var(--color-text-muted)]">
              أطول سلسلة: {formatDaysCount(longestStreakDays)}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 md:p-5 rounded-2xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] shadow-subtle dark:shadow-subtle-dark">
          <div className="flex items-center justify-between text-[var(--color-text-muted)] mb-2">
            <span className="text-xs font-medium">مجموع الكلمات</span>
            <Feather className="w-4 h-4 text-[var(--color-accent-warm)]" />
          </div>
          <div className="text-2xl md:text-3xl font-sans font-bold text-[var(--color-text-primary)]">
            {toArabicNumerals(totalWordsWritten)}
          </div>
          <div className="text-[11px] text-[var(--color-text-muted)] mt-1">
            في جميع التدوينات
          </div>
        </div>

        <div className="p-4 md:p-5 rounded-2xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] shadow-subtle dark:shadow-subtle-dark">
          <div className="flex items-center justify-between text-[var(--color-text-muted)] mb-2">
            <span className="text-xs font-medium">التدوينات المكتملة</span>
            <BookOpen className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl md:text-3xl font-sans font-bold text-[var(--color-text-primary)]">
            {toArabicNumerals(totalEntriesCount)}
          </div>
          <div className="text-[11px] text-[var(--color-text-muted)] mt-1">
            صفحة في دفترك
          </div>
        </div>

        <div className="p-4 md:p-5 rounded-2xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] shadow-subtle dark:shadow-subtle-dark">
          <div className="flex items-center justify-between text-[var(--color-text-muted)] mb-2">
            <span className="text-xs font-medium">معدل الكلمات باليوم</span>
            <BarChart2 className="w-4 h-4 text-violet-500" />
          </div>
          <div className="text-2xl md:text-3xl font-sans font-bold text-[var(--color-text-primary)]">
            {toArabicNumerals(totalEntriesCount > 0 ? Math.round(totalWordsWritten / totalEntriesCount) : 0)}
          </div>
          <div className="text-[11px] text-[var(--color-text-muted)] mt-1">
            كلمة لكل جلسة
          </div>
        </div>

        <div className="p-4 md:p-5 rounded-2xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] shadow-subtle dark:shadow-subtle-dark">
          <div className="flex items-center justify-between text-[var(--color-text-muted)] mb-2">
            <span className="text-xs font-medium">ساعات التأمل</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl md:text-3xl font-sans font-bold text-[var(--color-text-primary)]">
            {toArabicNumerals(((totalWordsWritten * 0.8) / 60).toFixed(1))}
          </div>
          <div className="text-[11px] text-[var(--color-text-muted)] mt-1">
            ساعة قضاها عقلك بالكتابة
          </div>
        </div>
      </div>

      {/* 7-Day Vertical Bar Chart Section */}
      <div className="p-6 md:p-8 rounded-2xl md:rounded-3xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] shadow-subtle dark:shadow-subtle-dark">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[var(--color-accent-warm)]" />
            <div>
              <h3 className="text-lg font-serif font-bold text-[var(--color-text-primary)]">
                نشاط الكلمات خلال الأيام السبعة الماضية
              </h3>
              <p className="text-xs text-[#7E786E] dark:text-[#9E9689]">
                ارتفاع العمود يمثل عدد الكلمات المكتوبة في كل يوم
              </p>
            </div>
          </div>

          <span className="text-xs font-sans text-[#8C8476] dark:text-[var(--color-text-muted)] bg-black/[0.04] dark:bg-[var(--color-bg-surface)] border border-black/[0.05] dark:border-[var(--color-border-subtle)] px-3 py-1 rounded-full">
            أعلى يوم: {toArabicNumerals(Math.max(...sevenDayWordCounts.map(d => d.wordCount)))} كلمة
          </span>
        </div>

        {/* The Vertical Bar Chart */}
        <div className="relative h-64 md:h-72 w-full pt-8 pb-8 flex items-end justify-between gap-2 md:gap-6">
          {/* Subtle horizontal guideline at 50% and 100% */}
          <div className="absolute inset-x-0 top-8 border-b border-dashed border-black/[0.06] dark:border-[var(--color-border-subtle)] pointer-events-none">
            <span className="text-[11px] font-sans text-[#8C8476] dark:text-[var(--color-text-muted)] absolute -top-4 right-0">
              {toArabicNumerals(maxWords)} ك
            </span>
          </div>
          <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-black/[0.04] dark:border-[var(--color-border-subtle)]/60 pointer-events-none">
            <span className="text-[11px] font-sans text-[#8C8476] dark:text-[var(--color-text-muted)] absolute -top-4 right-0">
              {toArabicNumerals(Math.round(maxWords / 2))} ك
            </span>
          </div>

          {sevenDayWordCounts.map((dayItem) => {
            const heightPercent = maxWords > 0 ? Math.min(100, Math.max(12, (dayItem.wordCount / maxWords) * 100)) : 12;
            const moodConfig = dayItem.mood ? MOOD_CONFIGS[dayItem.mood] : null;
            const [, m, d] = dayItem.date.split('-');

            return (
              <div
                key={dayItem.date}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                onClick={() => onSelectDate(dayItem.date)}
              >
                {/* Floating Word Badge on Hover with Eastern Arabic Numerals */}
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 mb-2 transform -translate-y-1 bg-[#1D1A16] text-[#F3EFE6] dark:bg-[#F3EFE6] dark:text-[#1D1A16] text-[11px] font-sans font-bold px-2.5 py-1 rounded-md shadow-md whitespace-nowrap pointer-events-none">
                  {toArabicNumerals(dayItem.wordCount)} كلمة {moodConfig && `(${moodConfig.emoji})`}
                </div>

                {/* The Bar */}
                <div className="w-full max-w-[48px] bg-black/[0.04] dark:bg-[var(--color-bg-surface)] border border-black/[0.04] dark:border-[var(--color-border-subtle)] rounded-xl p-1 flex items-end h-full">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={cn(
                      "w-full rounded-lg transition-all duration-500 relative flex items-center justify-center shadow-xs",
                      dayItem.wordCount > 0
                        ? "bg-gradient-to-t from-[#C98829] to-[#E09F3E] group-hover:from-[#E09F3E] group-hover:to-[#EDB45D]"
                        : "bg-black/[0.08] dark:bg-[var(--color-bg-card)]"
                    )}
                  >
                    {/* Top mood dot */}
                    {moodConfig && (
                      <span className="absolute -top-3 text-[11px] group-hover:scale-125 transition-transform">
                        {moodConfig.emoji}
                      </span>
                    )}
                  </div>
                </div>

                {/* Day Label with Eastern Arabic Date */}
                <div className="mt-3 text-center">
                  <div className="text-xs font-semibold text-[#1D1A16] dark:text-[#F3EFE6] group-hover:text-[#E09F3E] transition-colors">
                    {dayItem.dayLabelAr}
                  </div>
                  <div className="text-[10px] text-[#8C8476] font-sans mt-0.5">
                    {toArabicNumerals(d)} / {toArabicNumerals(m)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5-Tier Emotional Consistency Section with Proper Eastern Arabic Numerals and Percentages */}
      <div className="p-6 md:p-8 rounded-2xl md:rounded-3xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] shadow-subtle dark:shadow-subtle-dark">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[var(--color-border-subtle)]">
          <Smile className="w-5 h-5 text-emerald-500" />
          <div>
            <h3 className="text-lg font-serif font-bold text-[var(--color-text-primary)]">
              التوازن النفسي والنبض الشعوري
            </h3>
            <p className="text-xs text-[var(--color-text-muted)]">
              توزيع المشاعر الخمسة عبر تدويناتك اليومية
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {moodKeys.map((moodKey) => {
            const config = MOOD_CONFIGS[moodKey];
            const count = moodCounts[moodKey] || 0;
            const percentage = Math.round((count / totalMoodLogs) * 100);

            return (
              <div key={moodKey} className="group">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{config.emoji}</span>
                    <span className="font-semibold text-[#1D1A16] dark:text-[#F3EFE6]">
                      {config.labelAr}
                    </span>
                    <span className="text-[#8C8476] text-[11px] hidden sm:inline">
                      ({config.descriptionAr.slice(0, 35)}...)
                    </span>
                  </div>

                  {/* Correct RTL count and percentage display: e.g. "٣ تدوينات" and "٥٠٪" */}
                  <div className="flex items-center gap-3 font-sans">
                    <span className="text-[#8C8476]">{formatEntriesCount(count)}</span>
                    <span className="font-bold text-[#1D1A16] dark:text-[#F3EFE6]">
                      {formatPercentArabic(percentage)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 rounded-full bg-black/[0.05] dark:bg-[var(--color-bg-surface)] border border-black/[0.04] dark:border-[var(--color-border-subtle)] overflow-hidden p-0.5">
                  <div
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: config.color,
                    }}
                    className="h-full rounded-full transition-all duration-700"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          قسم إحصاءات التركيز والبومودورو والمجالات (Focus Analytics)
          ======================================================== */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Timer className="w-5 h-5 text-[var(--color-accent-warm)]" />
          <h3 className="text-xl font-display font-bold text-[var(--color-text-primary)]">
            إحصاءات التركيز والبومودورو
          </h3>
        </div>

        {/* Focus KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 md:p-5 rounded-2xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] shadow-subtle dark:shadow-subtle-dark">
            <div className="flex items-center justify-between text-[var(--color-text-muted)] mb-2">
              <span className="text-xs font-medium">ساعات التركيز</span>
              <Clock className="w-4 h-4 text-[var(--color-accent-warm)]" />
            </div>
            <div className="text-2xl md:text-3xl font-sans font-bold text-[var(--color-text-primary)]">
              {toArabicNumerals(totalFocusHours)}
            </div>
            <div className="text-[11px] text-[var(--color-text-muted)] mt-1">
              ساعة مسجلة
            </div>
          </div>

          <div className="p-4 md:p-5 rounded-2xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] shadow-subtle dark:shadow-subtle-dark">
            <div className="flex items-center justify-between text-[var(--color-text-muted)] mb-2">
              <span className="text-xs font-medium">الجلسات المكتملة</span>
              <Timer className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl md:text-3xl font-sans font-bold text-[var(--color-text-primary)]">
              {toArabicNumerals(focusSessions.length)}
            </div>
            <div className="text-[11px] text-[var(--color-text-muted)] mt-1">
              جلسة بومودورو
            </div>
          </div>

          <div className="p-4 md:p-5 rounded-2xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] shadow-subtle dark:shadow-subtle-dark">
            <div className="flex items-center justify-between text-[var(--color-text-muted)] mb-2">
              <span className="text-xs font-medium">أعلى مادة تركيز</span>
              <Layers className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-lg md:text-xl font-display font-bold text-[var(--color-text-primary)] truncate">
              {subjectDistribution[0]?.subject || '—'}
            </div>
            <div className="text-[11px] text-[var(--color-text-muted)] mt-1">
              {subjectDistribution[0] ? `${toArabicNumerals(subjectDistribution[0].hours)} ساعة` : 'لا توجد جلسات'}
            </div>
          </div>

          <div className="p-4 md:p-5 rounded-2xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] shadow-subtle dark:shadow-subtle-dark">
            <div className="flex items-center justify-between text-[var(--color-text-muted)] mb-2">
              <span className="text-xs font-medium">متوسط مدة الجلسة</span>
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
            <div className="text-2xl md:text-3xl font-sans font-bold text-[var(--color-text-primary)]">
              {toArabicNumerals(focusSessions.length > 0 ? Math.round(totalFocusMinutes / focusSessions.length) : 0)}
            </div>
            <div className="text-[11px] text-[var(--color-text-muted)] mt-1">
              دقيقة لكل جلسة
            </div>
          </div>
        </div>

        {/* Dual Column: Time by Subject & Time by Session Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Time Distribution per Subject */}
          <div className="p-6 md:p-7 rounded-2xl md:rounded-3xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] shadow-subtle dark:shadow-subtle-dark space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[var(--color-accent-warm)]" />
                <h4 className="text-sm font-serif font-bold text-[var(--color-text-primary)]">
                  توزيع الوقت لكل مادة / مجال
                </h4>
              </div>
              <span className="text-xs text-[var(--color-text-muted)]">
                {toArabicNumerals(subjectDistribution.length)} مواد
              </span>
            </div>

            {subjectDistribution.length === 0 ? (
              <p className="text-xs text-[var(--color-text-muted)] py-4 text-center">
                لم تسجل أي جلسات تركيز بعد.
              </p>
            ) : (
              <div className="space-y-3.5">
                {subjectDistribution.map(item => (
                  <div key={item.subject}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-[var(--color-text-primary)]">
                        {item.subject}
                      </span>
                      <div className="flex items-center gap-2 text-[#8C8476]">
                        <span>{toArabicNumerals(item.hours)} س ({toArabicNumerals(item.minutes)} د)</span>
                        <span className="font-bold text-[var(--color-text-primary)]">{formatPercentArabic(item.percentage)}</span>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-black/[0.05] dark:bg-[var(--color-bg-surface)] overflow-hidden">
                      <div
                        style={{ width: `${item.percentage}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-[#B37418] to-[#D49838] transition-all duration-700"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Time Distribution per Session Type */}
          <div className="p-6 md:p-7 rounded-2xl md:rounded-3xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] shadow-subtle dark:shadow-subtle-dark space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--color-accent-warm)]" />
                <h4 className="text-sm font-serif font-bold text-[var(--color-text-primary)]">
                  توزيع الوقت حسب نوع الجلسة
                </h4>
              </div>
              <span className="text-xs text-[var(--color-text-muted)]">
                (مذاكرة، عمل، قراءة، تأمل)
              </span>
            </div>

            <div className="space-y-3.5">
              {typeDistribution.map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.type}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-[var(--color-text-primary)] flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                        <span>{item.label}</span>
                      </span>
                      <div className="flex items-center gap-2 text-[#8C8476]">
                        <span>{toArabicNumerals(item.hours)} س ({toArabicNumerals(item.minutes)} د)</span>
                        <span className="font-bold text-[var(--color-text-primary)]">{formatPercentArabic(item.percentage)}</span>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-black/[0.05] dark:bg-[var(--color-bg-surface)] overflow-hidden">
                      <div
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: item.color
                        }}
                        className="h-full rounded-full transition-all duration-700"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
