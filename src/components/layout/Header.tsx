import React from 'react';
import { ActiveTab } from '../mobile/MobileBottomNav';
import { UserProfile, AppSettings } from '../../types/journal';
import {
  Moon,
  Sun,
  Settings,
  User,
  Sliders,
  Library,
  Crown
} from 'lucide-react';
import { TrmezLogoIcon } from '../icons/TrmezLogoIcon';
import { cn } from '../../lib/utils';

interface HeaderProps {
  activeTab: ActiveTab;
  onNavigateSettings: () => void;
  onNavigateLibrary?: () => void;
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
  library: 'مكتبتي الأدبية',
  focus: 'جلسات التركيز',
  stats: 'لوحة الإحصاءات والنبض',
  profile: 'الإعدادات وتخصيص الخزينة',
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onNavigateSettings,
  onNavigateLibrary,
  onOpenAuth,
  user,
  settings,
  onToggleTheme,
  isCustomizationOpen,
  onToggleCustomization,
}) => {
  return (
    <header className="w-full h-14 px-4 md:px-8 flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.05] bg-[var(--color-bg-base)]/90 backdrop-blur-md sticky top-0 z-30 transition-all select-none">
      {/* Title / Brand Section */}
      <div className="flex items-center gap-3">
        {/* Mobile View: 32px Golden Logo + "تِرميـز" 16px */}
        <div className="flex lg:hidden items-center gap-2.5">
          <div className="relative group/logo shrink-0">
            {/* Ambient Glow Halo */}
            <div
              className="absolute -inset-1 rounded-full bg-gradient-to-tr from-[#B37418] via-[#D49838] to-[#F59E0B] opacity-40 dark:opacity-55 blur-xs pointer-events-none"
              aria-hidden="true"
            />
            <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-[#B37418] via-[#CB8826] to-[#E8A73D] dark:from-[#8C520E] dark:via-[#B37418] dark:to-[#D89630] text-[#FFFDF8] flex items-center justify-center shadow-xs shadow-[#B37418]/20 border border-white/35 dark:border-amber-300/30">
              <TrmezLogoIcon className="w-4.5 h-4.5 text-[#FFFDF8] drop-shadow-xs" />
            </div>
          </div>
          <h1 className="text-[16px] font-display font-black tracking-tight text-[var(--color-text-primary)] leading-none">
            تِرميـز
          </h1>
        </div>

        {/* Desktop View: 18px Tab Title + 12px Subtitle with tight leading */}
        <div className="hidden lg:flex flex-col justify-center">
          <h2 className="text-[18px] font-display font-bold text-[var(--color-text-primary)] leading-tight">
            {TAB_TITLES[activeTab]}
          </h2>
          <p className="text-[12px] text-[var(--color-text-muted)] leading-tight mt-0.5">
            كتابة هادئة • تباين فائق • مزامنة سريعة
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Collapsible Customization Drawer Toggle Button (Desktop Only) */}
        <button
          type="button"
          onClick={onToggleCustomization}
          className={cn(
            "hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 select-none group",
            isCustomizationOpen
              ? "bg-[var(--color-active-card)] text-[var(--color-accent-warm)] border-[var(--color-active-border)] shadow-[0_0_12px_var(--color-accent-glow)] font-bold scale-[1.02]"
              : "bg-black/[0.04] dark:bg-white/[0.05] border-black/[0.06] dark:border-white/[0.08] text-[#5C5549] dark:text-[#DDD4C4] hover:text-[#1D1A16] dark:hover:text-[#FFFFFF] hover:border-[var(--color-active-border)]/40 hover:scale-[1.02] active:scale-[0.98]"
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
          className="hidden lg:flex items-center justify-center w-8 h-8 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] text-[#5C5549] dark:text-[var(--color-text-secondary)] hover:text-[#1D1A16] dark:hover:text-[#FFFFFF] transition-colors"
          title="تبديل المظهر (داكن / فاتح)"
        >
          {settings.theme === 'dark' ? (
            <Moon className="w-3.5 h-3.5 text-[var(--color-accent-warm)]" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-amber-500" />
          )}
        </button>

        {/* Quick Settings Access Button (Desktop Only) */}
        <button
          type="button"
          onClick={onNavigateSettings}
          className="hidden lg:flex items-center justify-center w-8 h-8 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] text-[#5C5549] dark:text-[#DDD4C4] hover:text-[#1D1A16] dark:hover:text-[#FFFFFF] hover:border-[var(--color-active-border)]/40 transition-colors"
          title="الإعدادات وحساب الكاتب"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        {/* User Account Pill (Desktop Only) */}
        <button
          type="button"
          onClick={onOpenAuth}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-accent-warm)]/10 border border-[var(--color-accent-warm)]/20 text-xs font-semibold text-[var(--color-accent-warm)] hover:bg-[var(--color-accent-warm)]/20 transition-all"
        >
          {user?.isAdmin ? (
            <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
          ) : (
            <User className="w-3.5 h-3.5" />
          )}
          <span>
            {user?.name?.split(' ')[0] || 'الحساب'}
          </span>
          {user?.isAdmin && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30 flex items-center gap-0.5">
              <span>أدمن</span>
            </span>
          )}
        </button>

        {/* Mobile Library Access Button */}
        {onNavigateLibrary && (
          <button
            type="button"
            onClick={onNavigateLibrary}
            className={cn(
              "lg:hidden w-8 h-8 rounded-full flex items-center justify-center border transition-all shadow-xs",
              activeTab === 'library'
                ? "bg-[var(--color-accent-warm)] text-white border-[var(--color-accent-warm)]"
                : "bg-[var(--color-bg-card)] border-black/[0.06] dark:border-white/[0.08] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            )}
            title="مكتبتي الأدبية"
          >
            <Library className="w-4 h-4" />
          </button>
        )}

        {/* Standard Settings Gear Button (Mobile Only - 32px matching the logo) */}
        <button
          type="button"
          onClick={onNavigateSettings}
          className="lg:hidden w-8 h-8 rounded-full flex items-center justify-center bg-[var(--color-bg-card)] border border-black/[0.06] dark:border-white/[0.08] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-active-border)]/40 transition-colors shadow-xs"
          title="الإعدادات وتخصيص الخزينة"
        >
          <Settings className="w-4 h-4 text-[var(--color-accent-warm)]" />
        </button>
      </div>
    </header>
  );
};
