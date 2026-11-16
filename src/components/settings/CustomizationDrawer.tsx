import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sliders, X } from 'lucide-react';
import { AppSettings, JournalEntry } from '../../types/journal';
import { CustomizationStudio } from './CustomizationStudio';

interface CustomizationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSetTheme: (theme: 'dark' | 'light') => void;
  onSetNightTheme: (nightTheme: 'sand' | 'sky' | 'palms') => void;
  onSetFont: (font: AppSettings['fontFamily']) => void;
  onSetPaperRuling: (paper: AppSettings['paperRuling']) => void;
  onUpdateSettings?: (partial: Partial<AppSettings>) => void;
  entries?: Record<string, JournalEntry>;
}

export const CustomizationDrawer: React.FC<CustomizationDrawerProps> = ({
  isOpen,
  onClose,
  settings,
  onSetTheme,
  onSetNightTheme,
  onSetFont,
  onSetPaperRuling,
  onUpdateSettings,
  entries,
}) => {
  // Listen for Escape key to close the drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Subtle Dim Backdrop Overlay */}
          <motion.div
            key="customization-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50 transition-opacity"
            aria-hidden="true"
          />

          {/* Slide-out Customization Panel / Drawer */}
          <motion.aside
            key="customization-panel"
            initial={{ x: '-100%', opacity: 0.7 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-y-0 left-0 w-80 sm:w-96 max-w-[90vw] z-50 bg-[var(--color-bg-base)] border-r border-[var(--color-border-subtle)] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border-subtle)] bg-black/[0.02] dark:bg-[var(--color-bg-surface)] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[var(--color-accent-warm)]/15 text-[var(--color-accent-warm)] flex items-center justify-center shadow-xs">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-display font-bold text-[var(--color-text-primary)]">
                    تخصيص الخزينة
                  </h3>
                  <p className="text-[10px] text-[var(--color-text-muted)]">
                    الألوان، الخطوط، الورق، والأجواء
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-black/[0.06] dark:hover:bg-[var(--color-bg-card-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-all active:scale-95"
                title="إغلاق اللوحة [Esc]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Studio Content */}
            <div className="flex-1 overflow-y-auto p-5 scrollbar-thin bg-[var(--color-bg-base)]">
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

            {/* Bottom Quick Dismiss Bar */}
            <div className="p-3 border-t border-[var(--color-border-subtle)] bg-black/[0.02] dark:bg-[var(--color-bg-surface)] shrink-0 flex items-center justify-between text-[11px] text-[var(--color-text-muted)]">
              <span>تُحفظ الإعدادات تلقائياً</span>
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1 rounded-lg bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-card-hover)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] font-medium transition-colors"
              >
                تم
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
