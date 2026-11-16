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
import { ProfileView } from './components/profile/ProfileView';
import { AuthModal } from './components/auth/AuthModal';
import { CustomizationDrawer } from './components/settings/CustomizationDrawer';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);

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
  } = useJournal();

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
          onOpenAuth={() => setIsAuthOpen(true)}
          user={user}
          settings={settings}
          onToggleTheme={toggleTheme}
          isCustomizationOpen={isCustomizationOpen}
          onToggleCustomization={() => setIsCustomizationOpen(prev => !prev)}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 px-4 md:px-8 pt-6 max-w-7xl w-full mx-auto">
          {activeTab === 'home' && (
            <HomeDashboard
              entries={entries}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDateFromCalendar}
              onStartWritingToday={handleStartWritingToday}
              stats={stats}
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
            />
          )}

          {activeTab === 'notes' && (
            <QuickNotesView />
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
