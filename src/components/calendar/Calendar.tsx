import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JournalEntry, MoodType } from '../../types/journal';
import {
  ARABIC_MONTHS,
  ARABIC_DAYS,
  getTodayISODate,
  toArabicNumerals,
  MOOD_CONFIGS,
  cn
} from '../../lib/utils';
import {
  ChevronRight,
  ChevronLeft,
  Calendar as CalendarIcon,
  Sparkles,
  Feather
} from 'lucide-react';

interface CalendarProps {
  entries: Record<string, JournalEntry>;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const Calendar: React.FC<CalendarProps> = ({
  entries,
  selectedDate,
  onSelectDate,
}) => {
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
                key={`${viewYear}-${viewMonth}`}
                custom={monthDirection}
                initial={{ opacity: 0, y: monthDirection === 'next' ? 6 : -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: monthDirection === 'next' ? -6 : 6 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="text-xl md:text-2xl font-display font-bold text-[var(--color-text-primary)]"
              >
                {ARABIC_MONTHS[viewMonth - 1]} {toArabicNumerals(viewYear)}
              </motion.h3>
            </AnimatePresence>
            <p className="text-xs text-[var(--color-text-muted)]">
              انقر على أي يوم لفتح تدوينته مباشرة
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

              return (
                <button
                  key={currentCellDate}
                  type="button"
                  onClick={() => onSelectDate(currentCellDate)}
                  className={cn(
                    "group relative flex flex-col justify-between p-2 md:p-2.5 rounded-2xl text-start transition-all duration-200 select-none",
                    "h-16 md:h-20 border",
                    isSelected
                      ? "bg-[#FAF5EC] dark:bg-[var(--color-active-card)] border-[1.5px] border-[var(--color-active-border)] shadow-xs ring-1 ring-[var(--color-active-border)]/20 z-10 scale-[1.01]"
                      : "bg-black/[0.015] dark:bg-[var(--color-bg-surface)] border-black/[0.05] dark:border-[var(--color-border-subtle)] hover:bg-black/[0.035] dark:hover:bg-[var(--color-active-card)]/50 hover:border-black/[0.12] dark:hover:border-[var(--color-border-subtle)] hover:scale-[1.02] z-0",
                    isToday && !isSelected && "border-[var(--color-active-border)]/60 ring-1 ring-[var(--color-active-border)]/20"
                  )}
                >
                  {/* Day Number Header with Eastern Arabic Numerals */}
                  <div className="flex items-center justify-between w-full">
                    <span className={cn(
                      "text-xs md:text-sm font-semibold rounded-md px-1.5 py-0.5 font-sans",
                      isToday
                        ? "bg-[var(--color-accent-warm)] text-white shadow-xs"
                        : isSelected
                        ? "text-[var(--color-accent-warm)] font-bold"
                        : "text-[#1D1A16] dark:text-[#FFFFFF]"
                    )}>
                      {toArabicNumerals(dayNum)}
                    </span>

                    {moodConfig && (
                      <span
                        className="text-xs transition-transform group-hover:scale-125"
                        title={moodConfig.labelAr}
                      >
                        {moodConfig.emoji}
                      </span>
                    )}
                  </div>

                  {/* Bottom indicators: Word count or writing dot */}
                  <div className="w-full flex items-center justify-between text-[10px]">
                    {hasContent ? (
                      <div className="flex items-center gap-1 text-[#8C8476] dark:text-[var(--color-text-muted)] font-sans">
                        <Feather className="w-2.5 h-2.5 text-[var(--color-accent-warm)]" />
                        <span className="hidden md:inline">{toArabicNumerals(entry.wordCount)} ك</span>
                      </div>
                    ) : (
                      <span />
                    )}

                    {hasContent && (
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: moodConfig?.color || 'var(--color-accent-warm)' }}
                      />
                    )}
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
            <span className="px-1.5 py-0.5 rounded bg-[var(--color-accent-warm)] text-white text-[10px] font-bold">اليوم</span>
            <span>تاريخ الجهاز الحالي</span>
          </div>
        </div>

        <div className="italic text-[11px]">
          «الأيام التي نكتبها لا تموت في الذاكرة»
        </div>
      </div>
    </div>
  );
};
