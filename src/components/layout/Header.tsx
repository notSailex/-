import React from 'react';
import { ActiveTab } from '../mobile/MobileBottomNav';
import { UserProfile, AppSettings } from '../../types/journal';
import {
  Moon,
  Sun,
  Settings,
  User,
  Sliders
} from 'lucide-react';
import { TrmezLogoIcon } from '../icons/TrmezLogoIcon';
import { cn } from '../../lib/utils';

interface HeaderProps {
  activeTab: ActiveTab;
  onNavigateSettings: () => void;
  onOpenAuth: () => void;
  user: UserProfile | null;
  settings: AppSettings;
  onToggleTheme: () => void;
  isCustomizationOpen: boolean;
  onToggleCustomization: () => void;
}

const TAB_TITLES: Record<ActiveTab, string> = {
  home: 'الرئيسية والتقويم',
  journal: 'كتاب اليوميات',
  notes: 'الملاحظات السريعة',
  stats: 'لوحة الإحصاءات',
  profile: 'الإعدادات وتخصيص الخزينة',
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onNavigateSettings,
  onOpenAuth,
  user,
  settings,
  onToggleTheme,
  isCustomizationOpen,
  onToggleCustomization,
}) => {
  return (
    <header className="w-full h-16 px-4 md:px-8 flex items-center justify-between border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] backdrop-blur-md sticky top-0 z-30">
      {/* Title / Brand on Mobile */}
      <div className="flex items-center gap-3">
        <div className="relative lg:hidden group/logo shrink-0">
          {/* Ambient Glow Halo */}
          <div
            className="absolute -inset-1 rounded-full bg-gradient-to-tr from-[#B37418] via-[#D49838] to-[#F59E0B] opacity-45 dark:opacity-60 blur-xs pointer-events-none"
            aria-hidden="true"
          />
          <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-[#B37418] via-[#CB8826] to-[#E8A73D] dark:from-[#8C520E] dark:via-[#B37418] dark:to-[#D89630] text-[#FFFDF8] flex items-center justify-center shadow-sm shadow-[#B37418]/25 border border-white/35 dark:border-amber-300/30">
            <TrmezLogoIcon className="w-4.5 h-4.5 text-[#FFFDF8] drop-shadow-xs" />
          </div>
        </div>
        <div>
          <h2 className="text-base md:text-lg font-display font-bold text-[var(--color-text-primary)]">
            {TAB_TITLES[activeTab]}
          </h2>
          <span className="text-[10px] text-[var(--color-text-muted)] hidden sm:inline">
            كتابة هادئة • تباين فائق • مزامنة سريعة
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Collapsible Customization Drawer Toggle Button (Desktop Only) */}
        <button
          type="button"
          onClick={onToggleCustomization}
          className={cn(
            "hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 select-none group",
            isCustomizationOpen
              ? "bg-[var(--color-active-card)] text-[var(--color-accent-warm)] border-[var(--color-active-border)] shadow-[0_0_12px_var(--color-accent-glow)] font-bold scale-[1.02]"
              : "bg-black/[0.04] dark:bg-white/[0.05] border-black/[0.06] dark:border-[var(--color-border-subtle)] text-[#5C5549] dark:text-[#DDD4C4] hover:text-[#1D1A16] dark:hover:text-[#FFFFFF] hover:border-[var(--color-active-border)]/40 hover:scale-[1.02] active:scale-[0.98]"
          )}
          title="فتح/إغلاق لوحة تخصيص الخزينة"
        >
          <Sliders className={cn("w-3.5 h-3.5 transition-transform duration-200", isCustomizationOpen ? "rotate-90 text-[var(--color-accent-warm)]" : "group-hover:rotate-45")} />
          <span>تخصيص الخزينة</span>
        </button>

        {/* Quick Theme Toggle (Desktop Only) */}
        <button
          type="button"
          onClick={onToggleTheme}
          className="hidden lg:flex items-center justify-center p-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/[0.06] dark:border-[var(--color-border-subtle)] text-[#5C5549] dark:text-[var(--color-text-secondary)] hover:text-[#1D1A16] dark:hover:text-[#FFFFFF] transition-colors"
          title="تبديل المظهر (داكن / فاتح)"
        >
          {settings.theme === 'dark' ? (
            <Moon className="w-4 h-4 text-[var(--color-accent-warm)]" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
        </button>

        {/* Quick Settings Access Button (Desktop Only) */}
        <button
          type="button"
          onClick={onNavigateSettings}
          className="hidden lg:flex items-center justify-center p-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/[0.06] dark:border-[var(--color-border-subtle)] text-[#5C5549] dark:text-[#DDD4C4] hover:text-[#1D1A16] dark:hover:text-[#FFFFFF] hover:border-[var(--color-active-border)]/40 transition-colors"
          title="الإعدادات وحساب الكاتب"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Account Pill (Desktop Only) */}
        <button
          type="button"
          onClick={onOpenAuth}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-accent-warm)]/10 border border-[var(--color-accent-warm)]/20 text-xs font-semibold text-[var(--color-accent-warm)] hover:bg-[var(--color-accent-warm)]/20 transition-all"
        >
          <User className="w-3.5 h-3.5" />
          <span>
            {user?.name?.split(' ')[0] || 'الحساب'}
          </span>
        </button>

        {/* Standard Settings Gear Button (Mobile Only) */}
        <button
          type="button"
          onClick={onNavigateSettings}
          className="lg:hidden p-2 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-active-border)]/40 transition-colors"
          title="الإعدادات وتخصيص الخزينة"
        >
          <Settings className="w-4 h-4 text-[var(--color-accent-warm)]" />
        </button>
      </div>
    </header>
  );
};
