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
import { Megaphone, X } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
  const [announcement, setAnnouncement] = useState(() => loadStoredAnnouncement());
  const [isAnnouncementDismissed, setIsAnnouncementDismissed] = useState(false);

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
            <div className={`p-3 md:p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs shadow-md animate-fade-in ${
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
                  <div className="flex items-center gap-2">
                    <span className="font-display font-black text-sm text-[var(--color-text-primary)]">
                      {announcement.title}
                    </span>
                    <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-400/30">
                      إعلان عام من الإدارة
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] font-text mt-0.5 truncate">
                    {announcement.message}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAnnouncementDismissed(true)}
                className="p-1.5 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors shrink-0"
                title="إخفاء الإعلان"
              >
                <X className="w-4 h-4" />
              </button>
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
