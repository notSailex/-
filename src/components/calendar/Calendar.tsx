import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JournalEntry, MoodType, AppSettings, QuickNote } from '../../types/journal';
import { loadStoredNotes } from '../../lib/storage';
import {
  ARABIC_MONTHS,
  ARABIC_DAYS,
  getTodayISODate,
  toArabicNumerals,
  MOOD_CONFIGS,
  getHijriDateParts,
  cn
} from '../../lib/utils';
import {
  ChevronRight,
  ChevronLeft,
  Calendar as CalendarIcon,
  Sparkles,
  Feather,
  Bell
} from 'lucide-react';

export function isNoteReminderOnDate(note: QuickNote, targetIso: string): boolean {
  if (!note.reminderDate) return false;
  if (note.reminderCompleted) return false;

  const remDate = note.reminderDate;
  const freq = note.reminderFrequency || 'once';

  if (freq === 'once') {
    return remDate === targetIso;
  }
  if (freq === 'daily') {
    return targetIso >= remDate;
  }
  if (freq === 'weekly') {
    if (targetIso < remDate) return false;
    const remD = new Date(remDate);
    const targetD = new Date(targetIso);
    return remD.getDay() === targetD.getDay();
  }
  if (freq === 'monthly') {
    if (targetIso < remDate) return false;
    const remD = new Date(remDate);
    const targetD = new Date(targetIso);
    return remD.getDate() === targetD.getDate();
  }
  if (freq === 'yearly') {
    if (targetIso < remDate) return false;
    const remD = new Date(remDate);
    const targetD = new Date(targetIso);
    return remD.getMonth() === targetD.getMonth() && remD.getDate() === targetD.getDate();
  }
  return false;
}

interface CalendarProps {
  entries: Record<string, JournalEntry>;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  settings?: AppSettings;
  notes?: QuickNote[];
}

export const Calendar: React.FC<CalendarProps> = ({
  entries,
  selectedDate,
  onSelectDate,
  settings,
  notes: propNotes,
}) => {
  // Load notes for reminder indicators
  const notes = propNotes || loadStoredNotes();

  // Device's current real date
  const todayISO = getTodayISODate();
  const [todayY, todayM] = todayISO.split('-').map(Number);

  // Active view month and year
  const [viewYear, setViewYear] = useState<number>(todayY);
  const [viewMonth, setViewMonth] = useState<number>(todayM); // 1 to 12
  const [monthDirection, setMonthDirection] = useState<'next' | 'prev'>('next');

  const handlePrevMonth = () => {
    setMonthDirection('prev');
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    setMonthDirection('next');
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const handleJumpToToday = () => {
    const isGoingBack = todayY < viewYear || (todayY === viewYear && todayM < viewMonth);
    setMonthDirection(isGoingBack ? 'prev' : 'next');
    setViewYear(todayY);
    setViewMonth(todayM);
    onSelectDate(todayISO);
  };

  // Calculate days in month and starting day of week
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth - 1, 1).getDay(); // 0 (Sunday) to 6 (Saturday)

  // Calendar cells
  const daysArray: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  // Soft fade and slide animation variants for month changes
  const monthTransitionVariants = {
    initial: (dir: 'next' | 'prev') => ({
      opacity: 0,
      x: dir === 'next' ? -24 : 24,
      filter: 'blur(3px)',
    }),
    animate: {
      opacity: 1,
      x: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.34,
        ease: [0.16, 1, 0.3, 1], // Apple / Linear ease-out
      },
    },
    exit: (dir: 'next' | 'prev') => ({
      opacity: 0,
      x: dir === 'next' ? 24 : -24,
      filter: 'blur(3px)',
      transition: {
        duration: 0.22,
        ease: 'easeInOut',
      },
    }),
  };

  // Determine month titles based on Hijri and Month Number settings
  const middleDate = new Date(viewYear, viewMonth - 1, 15);
  const hijriMiddle = getHijriDateParts(middleDate);
  const isHijri = Boolean(settings?.enableHijriCalendar);
  const showNum = Boolean(settings?.showMonthNumber);

  const monthTitle = isHijri
    ? `${hijriMiddle.monthName} ${showNum ? `(${hijriMiddle.monthNumber})` : ''} ${hijriMiddle.year} هـ`
    : `${ARABIC_MONTHS[viewMonth - 1]} ${showNum ? `(${viewMonth})` : ''} ${toArabicNumerals(viewYear)}`;

  const monthSubtitle = isHijri
    ? `الموافق: ${ARABIC_MONTHS[viewMonth - 1]} ${toArabicNumerals(viewYear)} م`
    : 'انقر على أي يوم لفتح تدوينته مباشرة';

  return (
    <div className="w-full bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] rounded-2xl md:rounded-3xl p-5 md:p-7 border border-[var(--color-border-subtle)] shadow-subtle dark:shadow-subtle-dark transition-all select-none">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--color-accent-warm)]/10 flex items-center justify-center text-[var(--color-accent-warm)] shadow-sm">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <AnimatePresence mode="wait" custom={monthDirection}>
              <motion.h3
                key={`${viewYear}-${viewMonth}-${isHijri}-${showNum}`}
                custom={monthDirection}
                initial={{ opacity: 0, y: monthDirection === 'next' ? 6 : -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: monthDirection === 'next' ? -6 : 6 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="text-xl md:text-2xl font-display font-bold text-[var(--color-text-primary)]"
              >
                {monthTitle}
              </motion.h3>
            </AnimatePresence>
            <p className="text-xs text-[var(--color-text-muted)]">
              {monthSubtitle}
            </p>
          </div>
        </div>

        {/* Navigation & Today controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleJumpToToday}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[var(--color-accent-warm)] bg-[var(--color-accent-warm)]/10 hover:bg-[var(--color-accent-warm)]/20 transition-all border border-[var(--color-accent-warm)]/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            اليوم
          </button>

          {/* Improved month navigation buttons (Right: Prev Month / Left: Next Month) */}
          <div className="flex items-center gap-1.5 bg-black/[0.04] dark:bg-[var(--color-bg-surface)] p-1.5 rounded-2xl border border-[var(--color-border-subtle)]">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card)] dark:hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)] hover:shadow-xs transition-all active:scale-95 group"
              title="الشهر السابق"
            >
              <ChevronRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
            </button>
            <div className="w-px h-4 bg-black/[0.08] dark:bg-[var(--color-border-subtle)]" />
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card)] dark:hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)] hover:shadow-xs transition-all active:scale-95 group"
              title="الشهر التالي"
            >
              <ChevronLeft className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 text-center">
        {ARABIC_DAYS.map((dayName) => (
          <div
            key={dayName}
            className="text-xs font-semibold text-[var(--color-text-muted)] py-1"
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Animated Days Grid with Smooth Slide & Soft Fade (No Clipping) */}
      <div className="relative min-h-[340px] md:min-h-[380px] p-1.5 -m-1.5">
        <AnimatePresence mode="wait" custom={monthDirection}>
          <motion.div
            key={`${viewYear}-${viewMonth}`}
            custom={monthDirection}
            variants={monthTransitionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="grid grid-cols-7 gap-1.5 md:gap-2.5 w-full p-1"
          >
            {daysArray.map((dayNum, idx) => {
              if (!dayNum) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="h-16 md:h-20 rounded-xl bg-transparent opacity-0 pointer-events-none"
                  />
                );
              }

              const currentCellDate = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isToday = currentCellDate === todayISO;
              const isSelected = currentCellDate === selectedDate;
              const entry = entries[currentCellDate];
              const hasContent = entry && entry.content.trim().length > 0;
              const moodConfig = entry?.mood ? MOOD_CONFIGS[entry.mood] : null;
              const cellHijri = isHijri ? getHijriDateParts(new Date(viewYear, viewMonth - 1, dayNum)) : null;
              const dayReminders = notes.filter(n => isNoteReminderOnDate(n, currentCellDate));

              return (
                <button
                  key={currentCellDate}
                  type="button"
                  onClick={() => onSelectDate(currentCellDate)}
                  className={cn(
                    "group relative overflow-hidden flex flex-col justify-between p-1.5 sm:p-2 md:p-2.5 rounded-2xl text-start transition-all duration-200 select-none",
                    "h-16 md:h-20 border",
                    isSelected
                      ? "bg-[#FAF5EC] dark:bg-[var(--color-active-card)] border-[1.5px] border-[var(--color-active-border)] shadow-xs ring-1 ring-[var(--color-active-border)]/20 z-10 scale-[1.01]"
                      : "bg-black/[0.015] dark:bg-[var(--color-bg-surface)] border-black/[0.05] dark:border-[var(--color-border-subtle)] hover:bg-black/[0.035] dark:hover:bg-[var(--color-active-card)]/50 hover:border-black/[0.12] dark:hover:border-[var(--color-border-subtle)] hover:scale-[1.02] z-0",
                    isToday && !isSelected && "border-[var(--color-active-border)]/60 ring-1 ring-[var(--color-active-border)]/20"
                  )}
                >
                  {/* الصف العلوي: مخصص للتاريخين فقط مع جرس صغير ناعم عند وجود تذكير */}
                  <div className="flex items-baseline justify-between w-full">
                    <div className="flex items-baseline gap-1 truncate">
                      <span className={cn(
                        "text-xs md:text-sm font-semibold rounded-md px-1 py-0.5 font-sans leading-none",
                        isToday
                          ? "bg-[var(--color-accent-warm)] text-white shadow-xs"
                          : isSelected
                          ? "text-[var(--color-accent-warm)] font-bold"
                          : "text-[#1D1A16] dark:text-[#FFFFFF]"
                      )}>
                        {cellHijri ? toArabicNumerals(cellHijri.dayNumber) : toArabicNumerals(dayNum)}
                      </span>
                      {cellHijri && (
                        <span className="text-[10px] text-[var(--color-text-muted)] font-sans opacity-70 leading-none">
                          {toArabicNumerals(dayNum)}
                        </span>
                      )}
                    </div>

                    {/* علامة صغيرة وناعمة للتذكير المجدول حتى لا تزاحم التقويم */}
                    {dayReminders.length > 0 && (
                      <span
                        className="flex items-center text-amber-500 animate-pulse shrink-0"
                        title={`تذكير ملاحظة: ${dayReminders.map(n => n.title || 'مذكرة').join(' • ')}`}
                      >
                        <Bell className="w-2.5 h-2.5 fill-current" />
                      </span>
                    )}
                  </div>

                  {/* الصف السفلي: نبض المزاج وأيقونة التدوينة والريشة بمساحة مستقلة */}
                  <div className="w-full flex items-center justify-between text-[10px] mt-auto pt-1">
                    {/* جهة اليمين: أيقونة نبض المزاج بحجم ناعم 13px - 14px */}
                    <div className="flex items-center gap-1 shrink-0">
                      {moodConfig ? (
                        <span
                          className="text-[13px] md:text-[14px] leading-none transition-transform group-hover:scale-115 select-none"
                          title={moodConfig.labelAr}
                        >
                          {moodConfig.emoji}
                        </span>
                      ) : (
                        <span className="w-3 h-3" />
                      )}
                    </div>

                    {/* جهة اليسار: مؤشر التدوينة (الريشة وعدد الكلمات أو النقطة) */}
                    <div className="flex items-center gap-1 min-w-0">
                      {hasContent ? (
                        <div className="flex items-center gap-1 text-[#8C8476] dark:text-[var(--color-text-muted)] font-sans">
                          <Feather className="w-2.5 h-2.5 text-[var(--color-accent-warm)] shrink-0" />
                          <span className="hidden md:inline leading-none">{toArabicNumerals(entry.wordCount)} ك</span>
                        </div>
                      ) : (
                        <span />
                      )}

                      {hasContent && (
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: moodConfig?.color || 'var(--color-accent-warm)' }}
                        />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Legend below calendar */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-black/[0.06] dark:border-[var(--color-border-subtle)] text-xs text-[#7E786E] dark:text-[#8C8476] flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--color-accent-warm)]" />
            <span>يوم به تدوينات</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bell className="w-3 h-3 text-amber-500 fill-current" />
            <span>تذكير مجدول</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-[var(--color-accent-warm)] text-white text-[10px] font-bold">اليوم</span>
            <span>تاريخ اليوم</span>
          </div>
        </div>

        <div className="italic text-[11px]">
          «الأيام التي نكتبها لا تموت في الذاكرة»
        </div>
      </div>
    </div>
  );
};
