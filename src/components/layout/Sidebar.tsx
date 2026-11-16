import React from 'react';
import { ActiveTab } from '../mobile/MobileBottomNav';
import { UserProfile, AppSettings } from '../../types/journal';
import {
  Home,
  StickyNote,
  BookOpen,
  BarChart2,
  User,
  Shield,
  Sparkles
} from 'lucide-react';
import { TrmezLogoIcon } from '../icons/TrmezLogoIcon';
import { cn } from '../../lib/utils';

interface SidebarProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  onOpenAuth: () => void;
  user: UserProfile | null;
  settings: AppSettings;
  isCustomizationOpen?: boolean;
  onToggleCustomization?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onChangeTab,
  onOpenAuth,
  user,
  settings,
  isCustomizationOpen = false,
  onToggleCustomization,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: 'الرئيسية والتقويم', icon: Home },
    { id: 'journal', label: 'كتاب اليوميات', icon: BookOpen },
    { id: 'notes', label: 'الملاحظات السريعة', icon: StickyNote },
    { id: 'stats', label: 'الإحصاءات والنبض', icon: BarChart2 },
  ];

  return (
    <aside className="hidden lg:flex flex-col justify-between w-72 xl:w-80 h-screen sticky top-0 bg-[var(--color-bg-base)] border-l border-[var(--color-border-subtle)] p-5 select-none z-30 overflow-y-auto">
      {/* Top Section: Brand Logo & Navigation */}
      <div className="space-y-5">
        <div className="flex items-center justify-between px-1 pt-1">
          <div className="flex items-center gap-3.5 group/logo cursor-default">
            {/* Minimalist Circular Emblem with Warm Amber Ambient Glow */}
            <div className="relative shrink-0">
              {/* Ambient Glow Halo */}
              <div
                className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-[#B37418] via-[#D49838] to-[#F59E0B] opacity-45 dark:opacity-60 blur-md pointer-events-none transition-opacity duration-300 group-hover/logo:opacity-80"
                aria-hidden="true"
              />
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-[#B37418] via-[#CB8826] to-[#E8A73D] dark:from-[#8C520E] dark:via-[#B37418] dark:to-[#D89630] text-[#FFFDF8] flex items-center justify-center shadow-[0_4px_16px_rgba(179,116,24,0.35)] dark:shadow-[0_4px_22px_rgba(179,116,24,0.45)] border border-white/35 dark:border-amber-300/30 transition-transform duration-300 group-hover/logo:scale-105">
                <TrmezLogoIcon className="w-5.5 h-5.5 text-[#FFFDF8] drop-shadow-xs" />
              </div>
            </div>

            {/* Harmonious Typography Alignment */}
            <div className="flex flex-col justify-center select-none">
              <h1 className="text-xl font-display font-black tracking-tight text-[var(--color-text-primary)] leading-tight">
                تِرميـز
              </h1>
              <p className="text-[10px] text-[var(--color-text-muted)] tracking-wide font-medium mt-0.5 leading-normal">
                دفتر التدوين والتأمل الهادئ
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onChangeTab(id as ActiveTab)}
                className={cn(
                  "w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 group border",
                  isActive
                    ? "bg-[var(--color-active-card)] text-[var(--color-text-primary)] border-[1.5px] border-[var(--color-active-border)] shadow-[0_0_12px_var(--color-accent-glow)] font-bold"
                    : "text-[var(--color-text-secondary)] border-transparent hover:bg-black/[0.04] dark:hover:bg-[var(--color-bg-card-hover)] hover:text-[var(--color-text-primary)]"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", isActive ? "text-[var(--color-accent-warm)]" : "text-[#8C8476]")} />
                  <span>{label}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: User status card */}
      <div className="pt-4 mt-4 border-t border-[var(--color-border-subtle)]">
        <div
          onClick={onOpenAuth}
          className="flex items-center justify-between p-3 rounded-2xl bg-black/[0.03] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] cursor-pointer hover:border-[var(--color-active-border)]/50 transition-all"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-[var(--color-accent-warm)]/20 text-[var(--color-accent-warm)] flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-[var(--color-text-primary)] truncate">
                {user?.name || 'زائر الخزينة'}
              </div>
              <div className="text-[10px] text-[var(--color-text-muted)] truncate">
                {user?.isGuest ? 'تخزين محلي آمن' : 'مزامنة Supabase'}
              </div>
            </div>
          </div>

          <Shield className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
        </div>
      </div>
    </aside>
  );
};
