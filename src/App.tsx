import React, { useState } from 'react';
import { useJournal } from './hooks/useJournal';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './hooks/useAuth';
import { ActiveTab, MobileBottomNav } from './components/mobile/MobileBottomNav';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { HomeDashboard } from './components/dashboard/HomeDashboard';
import { BookView } from './components/journal/BookView';
import { QuickNotesView } from './components/notes/QuickNotesView';
import { StatsDashboard } from './components/stats/StatsDashboard';
import { FocusTimerView } from './components/focus/FocusTimerView';
import { LibraryView } from './components/library/LibraryView';
import { ProfileView } from './components/profile/ProfileView';
import { AdminControlCenter } from './components/admin/AdminControlCenter';
import { AuthModal } from './components/auth/AuthModal';
import { CustomizationDrawer } from './components/settings/CustomizationDrawer';
import { loadStoredAnnouncement } from './lib/supabaseService';
import { purgeLegacyMockData } from './lib/storage';
import { Megaphone, X, Clock } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
  const [announcement, setAnnouncement] = useState(() => loadStoredAnnouncement());
  const [isAnnouncementDismissed, setIsAnnouncementDismissed] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  // Auto clean legacy mock demo data
  React.useEffect(() => {
    purgeLegacyMockData();
  }, []);

  // Listen to live broadcast announcement updates across components
  React.useEffect(() => {
    const handleBroadcastUpdate = (e: any) => {
      if (e.detail) {
        setAnnouncement(e.detail);
        setIsAnnouncementDismissed(false);
      }
    };
    window.addEventListener('trmez_announcement_updated', handleBroadcastUpdate);
    return () => window.removeEventListener('trmez_announcement_updated', handleBroadcastUpdate);
  }, []);

  // Auto-dismiss countdown timer when expiresAt is set
  React.useEffect(() => {
    if (!announcement?.expiresAt || !announcement.isActive) {
      setRemainingSeconds(null);
      return;
    }

    const calculateRemaining = () => {
      const diffMs = new Date(announcement.expiresAt!).getTime() - Date.now();
      const secs = Math.ceil(diffMs / 1000);
      return secs > 0 ? secs : 0;
    };

    const initial = calculateRemaining();
    if (initial <= 0) {
      setAnnouncement(null);
      setRemainingSeconds(null);
      return;
    }

    setRemainingSeconds(initial);

    const interval = setInterval(() => {
      const left = calculateRemaining();
      if (left <= 0) {
        clearInterval(interval);
        setAnnouncement(null);
        setRemainingSeconds(null);
      } else {
        setRemainingSeconds(left);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [announcement]);

  // Core Hooks & Live Customization State
  const {
    theme,
    settings,
    toggleTheme,
    setTheme,
    setNightTheme,
    setFont,
    setPaperRuling,
    updateSettings,
  } = useTheme();

  const { user } = useAuth();
  const {
    entries,
    selectedDate,
    currentEntry,
    updateCurrentEntry,
    goToDate,
    goToPreviousDay,
    goToNextDay,
    goToToday,
    pageTurnDirection,
    saveStatus,
    stats,
  } = useJournal(user?.id);

  // Navigation handlers
  const handleSelectDateFromCalendar = (date: string) => {
    goToDate(date);
    setActiveTab('journal');
  };

  const handleStartWritingToday = () => {
    goToToday();
    setActiveTab('journal');
  };

  return (
    <div className="min-h-screen flex bg-[var(--color-bg-base)] text-[var(--color-text-primary)] font-sans transition-colors duration-300">
      {/* Desktop Left Sidebar with Quick Customization Launcher */}
      <Sidebar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
        user={user}
        settings={settings}
        isCustomizationOpen={isCustomizationOpen}
        onToggleCustomization={() => setIsCustomizationOpen(prev => !prev)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden pb-20 lg:pb-8">
        {/* Top Header with Customization Toggle */}
        <Header
          activeTab={activeTab}
          onNavigateSettings={() => setActiveTab('profile')}
          onNavigateLibrary={() => setActiveTab('library')}
          onNavigateAdmin={() => setActiveTab('admin')}
          onOpenAuth={() => setIsAuthOpen(true)}
          user={user}
          settings={settings}
          onToggleTheme={toggleTheme}
          isCustomizationOpen={isCustomizationOpen}
          onToggleCustomization={() => setIsCustomizationOpen(prev => !prev)}
        />

        {/* Global Broadcast Announcement */}
        {announcement && announcement.isActive && !isAnnouncementDismissed && (
          <div className="w-full px-4 md:px-8 pt-3 max-w-7xl mx-auto">
            <div className={`p-3 md:p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs shadow-md animate-fade-in relative overflow-hidden ${
              announcement.type === 'golden'
                ? 'bg-gradient-to-r from-amber-500/20 via-[var(--color-bg-card)] to-amber-600/15 border-amber-500/40 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                : announcement.type === 'alert'
                ? 'bg-gradient-to-r from-rose-500/20 via-[var(--color-bg-card)] to-rose-600/15 border-rose-500/35 text-rose-400'
                : 'bg-gradient-to-r from-blue-500/20 via-[var(--color-bg-card)] to-blue-600/15 border-blue-500/35 text-blue-400'
            }`}>
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-black flex items-center justify-center shrink-0 shadow-xs">
                  <Megaphone className="w-4 h-4 fill-current animate-pulse" />
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-black text-sm text-[var(--color-text-primary)]">
                      {announcement.title}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-400/30">
                      إعلان عام من الإدارة
                    </span>
                    {remainingSeconds !== null && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/10 dark:bg-white/10 text-[var(--color-text-primary)] border border-black/10 dark:border-white/10">
                        <Clock className="w-3 h-3 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
                        <span>
                          {remainingSeconds < 60
                            ? `يختفي خلال ${remainingSeconds} ث`
                            : `يختفي خلال ${Math.floor(remainingSeconds / 60)}:${(remainingSeconds % 60).toString().padStart(2, '0')}`}
                        </span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] font-text mt-0.5">
                    {announcement.message}
                  </p>
                </div>
              </div>

              {/* Immediate Dismiss / Close Button */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAnnouncementDismissed(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[var(--color-text-primary)] transition-all text-[11px] font-bold cursor-pointer shadow-xs"
                  title="إغلاق الإعلان فوراً"
                >
                  <span>إغلاق</span>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Progress bar counting down if duration is set */}
              {announcement.durationSeconds && announcement.durationSeconds > 0 && remainingSeconds !== null && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all duration-1000 ease-linear"
                    style={{
                      width: `${Math.min(100, Math.max(0, (remainingSeconds / announcement.durationSeconds) * 100))}%`,
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Page Views */}
        <main className="flex-1 px-4 md:px-8 pt-3.5 md:pt-4 max-w-7xl w-full mx-auto">
          {activeTab === 'home' && (
            <HomeDashboard
              entries={entries}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDateFromCalendar}
              onStartWritingToday={handleStartWritingToday}
              stats={stats}
              settings={settings}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'journal' && (
            <BookView
              entry={currentEntry}
              onUpdate={updateCurrentEntry}
              onPrevDay={goToPreviousDay}
              onNextDay={goToNextDay}
              onOpenCalendar={() => setActiveTab('home')}
              saveStatus={saveStatus}
              direction={pageTurnDirection}
              settings={settings}
              user={user}
              onRequireAuth={() => setIsAuthOpen(true)}
            />
          )}

          {activeTab === 'notes' && (
            <QuickNotesView
              user={user}
              onRequireAuth={() => setIsAuthOpen(true)}
            />
          )}

          {activeTab === 'library' && (
            <LibraryView
              user={user}
              onRequireAuth={() => setIsAuthOpen(true)}
            />
          )}

          {activeTab === 'focus' && (
            <FocusTimerView
              user={user}
              onRequireAuth={() => setIsAuthOpen(true)}
            />
          )}

          {activeTab === 'stats' && (
            <StatsDashboard
              stats={stats}
              onSelectDate={handleSelectDateFromCalendar}
              user={user}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              user={user}
              stats={stats}
              settings={settings}
              onOpenAuth={() => setIsAuthOpen(true)}
              onToggleTheme={toggleTheme}
              onSetTheme={setTheme}
              onSetNightTheme={setNightTheme}
              onSetFont={setFont}
              onSetPaperRuling={setPaperRuling}
              onUpdateSettings={updateSettings}
              entries={entries}
            />
          )}

          {activeTab === 'admin' && user?.isAdmin && (
            <AdminControlCenter
              user={user}
              settings={settings}
              onNavigateTab={setActiveTab}
              onUpdateAnnouncement={(updated) => {
                setAnnouncement(updated);
                setIsAnnouncementDismissed(false);
              }}
            />
          )}
        </main>
      </div>

      {/* Mobile Fixed Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
      />

      {/* Auth Modal (Login / Register / Supabase) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Collapsible Customization Drawer / Sidebar */}
      <CustomizationDrawer
        isOpen={isCustomizationOpen}
        onClose={() => setIsCustomizationOpen(false)}
        settings={settings}
        onSetTheme={setTheme}
        onSetNightTheme={setNightTheme}
        onSetFont={setFont}
        onSetPaperRuling={setPaperRuling}
        onUpdateSettings={updateSettings}
        entries={entries}
      />
    </div>
  );
};

export default App;
