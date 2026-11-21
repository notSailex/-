import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JournalEntry, AppSettings, UserProfile } from '../../types/journal';
import { BookPageLeft } from './BookPageLeft';
import { BookPageRight } from './BookPageRight';
import { AmbientAudioBar } from './AmbientAudioBar';
import { getTodayISODate, cn } from '../../lib/utils';
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, Bookmark, Lock } from 'lucide-react';

interface BookViewProps {
  entry: JournalEntry;
  onUpdate: (updates: Partial<JournalEntry>) => void;
  onPrevDay: () => void;
  onNextDay: () => void;
  onOpenCalendar: () => void;
  saveStatus: 'saved' | 'saving' | 'unsaved';
  direction: 'left' | 'right' | null;
  settings: AppSettings;
  user?: UserProfile | null;
  onRequireAuth?: () => void;
}

export const BookView: React.FC<BookViewProps> = ({
  entry,
  onUpdate,
  onPrevDay,
  onNextDay,
  onOpenCalendar,
  saveStatus,
  direction,
  settings,
  user,
  onRequireAuth,
}) => {
  const [mobileTab, setMobileTab] = useState<'write' | 'details'>('write');
  const today = getTodayISODate();
  const isToday = entry.date === today;

  const handleUpdate = (updates: Partial<JournalEntry>) => {
    if (!user) {
      onRequireAuth?.();
      return;
    }
    onUpdate(updates);
  };

  // Realistic Physical Paper Slide & Elevation Transition
  // Eliminates 3D rotation in favor of a soft, tactile, high-end paper slide
  const paperSlideVariants = {
    initial: (dir: 'left' | 'right' | null) => ({
      opacity: 0.4,
      x: dir === 'left' ? -35 : dir === 'right' ? 35 : 0,
      scale: 0.995,
      filter: 'blur(2px)',
    }),
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.38,
        ease: [0.16, 1, 0.3, 1], // Natural physical friction easing
      },
    },
    exit: (dir: 'left' | 'right' | null) => ({
      opacity: 0,
      x: dir === 'left' ? 30 : -30,
      scale: 0.995,
      filter: 'blur(2px)',
      transition: {
        duration: 0.24,
        ease: 'easeInOut',
      },
    }),
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
      {/* Unauthenticated User Warning */}
      {!user && (
        <div className="w-full mb-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-medium">
            <Lock className="w-4 h-4 shrink-0 text-amber-500" />
            <span>أنت في نمط المعاينة كزائر — سجّل دخولك لحفظ وتشفير يومياتك على السحابة</span>
          </div>
          <button
            type="button"
            onClick={onRequireAuth}
            className="px-3.5 py-1.5 rounded-xl font-bold bg-[var(--color-accent-warm)] text-white hover:opacity-90 shrink-0 shadow-xs"
          >
            تسجيل الدخول / إنشاء حساب
          </button>
        </div>
      )}

      {/* Top Bar above notebook: Ambient sound player, quick date shortcuts */}
      <div className="w-full flex items-center justify-between mb-4 px-2 sm:px-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenCalendar}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-black/[0.04] dark:bg-[var(--color-bg-card)] border border-black/[0.06] dark:border-[var(--color-border-subtle)] text-[#5C5549] dark:text-[var(--color-text-muted)] hover:bg-black/[0.08] dark:hover:bg-[var(--color-bg-card-hover)] hover:text-[#1D1A16] dark:hover:text-[#F3EFE6] transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-[var(--color-accent-warm)]" />
            <span>عرض التقويم</span>
          </button>

          {!isToday && (
            <button
              type="button"
              onClick={onNextDay}
              className="text-xs text-[var(--color-accent-warm)] hover:underline font-semibold px-2 py-1"
            >
              الذهاب إلى تدوينة اليوم ←
            </button>
          )}
        </div>

        {/* Ambient Sounds Player */}
        <AmbientAudioBar />
      </div>

      {/* Mobile Tab Switcher */}
      <div className="flex lg:hidden w-full max-w-md mx-auto mb-3 bg-black/[0.04] dark:bg-[var(--color-bg-card)] p-1 rounded-xl border border-[var(--color-border-subtle)]">
        <button
          type="button"
          onClick={() => setMobileTab('write')}
          className={cn(
            "flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all",
            mobileTab === 'write'
              ? "bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-sm"
              : "text-[var(--color-text-muted)]"
          )}
        >
          صفحة التدوين والكتابة
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('details')}
          className={cn(
            "flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all",
            mobileTab === 'details'
              ? "bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-sm"
              : "text-[var(--color-text-muted)]"
          )}
        >
          المزاج والتفاصيل
        </button>
      </div>

      {/* The Tactile Notebook / Journal Container */}
      <div className="relative w-full select-text">
        {/* Decorative Golden Ribbon Bookmark */}
        <div className="hidden lg:flex absolute -top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex-col items-center">
          <div className="w-5 h-8 bg-gradient-to-b from-[#B87B22] to-[#D49838] rounded-b-sm shadow-md flex items-center justify-center">
            <Bookmark className="w-3.5 h-3.5 text-white/90" />
          </div>
          <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[7px] border-t-[#B87B22]" />
        </div>

        {/* Notebook Leather/Linen Cover Trim & Soft Depth Shadow */}
        <div className="relative rounded-2xl md:rounded-3xl p-1.5 md:p-3 bg-gradient-to-b from-[#3E352C] via-[#2F2720] to-[#201A15] dark:from-[var(--color-bg-card)] dark:via-[var(--color-bg-surface)] dark:to-[var(--color-bg-base)] border border-[var(--color-border-subtle)] shadow-2xl transition-all duration-300">
          {/* Realistic Paper Slide Animation Container */}
          <div className="relative overflow-hidden rounded-xl md:rounded-2xl">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={entry.date}
                custom={direction}
                variants={paperSlideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="relative w-full h-[620px] sm:h-[660px] lg:h-[700px] xl:h-[720px] rounded-xl md:rounded-2xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden"
                style={{
                  backgroundImage: 'var(--book-page-texture)',
                }}
              >
                {/* Desktop Two-Page Spread */}
                <div className="hidden lg:grid grid-cols-2 h-full divide-x divide-x-reverse divide-[var(--color-border-subtle)] relative overflow-hidden">
                  {/* Subtle Center Notebook Spine Stitching & Crease */}
                  <div
                    className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 pointer-events-none z-20"
                    style={{
                      background: 'linear-gradient(to right, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.01) 50%, rgba(0,0,0,0.05) 100%)'
                    }}
                  />

                  {/* Left Page: Date, Mood, Reflection, Tags */}
                  <div className="h-full relative overflow-y-auto">
                    <BookPageLeft
                      entry={entry}
                      onUpdate={handleUpdate}
                      onPrevDay={onPrevDay}
                      onNextDay={onNextDay}
                      isToday={isToday}
                      settings={settings}
                    />
                  </div>

                  {/* Right Page: Title, Literary Textarea, Word Count, Controls */}
                  <div className="h-full relative overflow-hidden flex flex-col">
                    <BookPageRight
                      entry={entry}
                      onUpdate={handleUpdate}
                      saveStatus={saveStatus}
                      settings={settings}
                      isVisitor={!user || user.isGuest}
                      onRequireAuth={onRequireAuth}
                    />
                  </div>
                </div>

                {/* Mobile / Tablet Single Page Layout */}
                <div className="block lg:hidden h-full overflow-hidden">
                  {mobileTab === 'write' ? (
                    <BookPageRight
                      entry={entry}
                      onUpdate={handleUpdate}
                      saveStatus={saveStatus}
                      settings={settings}
                      isVisitor={!user || user.isGuest}
                      onRequireAuth={onRequireAuth}
                    />
                  ) : (
                    <div className="h-full overflow-y-auto">
                      <BookPageLeft
                        entry={entry}
                        onUpdate={handleUpdate}
                        onPrevDay={onPrevDay}
                        onNextDay={onNextDay}
                        isToday={isToday}
                        settings={settings}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Page Navigation Controls */}
        <div className="flex items-center justify-between mt-4 px-3 text-xs text-[#7E786E] dark:text-[#9E9689]">
          <button
            type="button"
            onClick={onPrevDay}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-black/[0.05] dark:hover:bg-white/[0.08] hover:text-[#1D1A16] dark:hover:text-[#F3EFE6] transition-all font-semibold active:scale-95 group"
          >
            <ChevronRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
            <span>اليوم السابق (الأقدم)</span>
          </button>

          <span className="hidden sm:inline italic text-[11px] text-[#8C8476]">
            انسياب ورقي هادئ عند التنقل بين الأيام
          </span>

          <button
            type="button"
            onClick={onNextDay}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-black/[0.05] dark:hover:bg-white/[0.08] hover:text-[#1D1A16] dark:hover:text-[#F3EFE6] transition-all font-semibold active:scale-95 group"
          >
            <span>اليوم التالي (الأحدث)</span>
            <ChevronLeft className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
