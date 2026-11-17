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
  const [announcement] = useState(() => loadStoredAnnouncement());
  const [isAnnouncementDismissed, setIsAnnouncementDismissed] = useState(false);

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
            <div className={`p-3 md:p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs shadow-xs animate-fade-in ${
              announcement.type === 'golden'
                ? 'bg-gradient-to-r from-amber-500/15 via-[var(--color-bg-card)] to-amber-600/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                : announcement.type === 'alert'
                ? 'bg-rose-500/10 border-rose-500/25 text-rose-600 dark:text-rose-400'
                : 'bg-blue-500/10 border-blue-500/25 text-blue-600 dark:text-blue-400'
            }`}>
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-7 h-7 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 text-amber-500">
                  <Megaphone className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <span className="font-bold ml-1.5">{announcement.title}:</span>
                  <span className="text-[var(--color-text-secondary)]">{announcement.message}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAnnouncementDismissed(true)}
                className="p-1 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors shrink-0"
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
