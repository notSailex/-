import { useState, useEffect } from 'react';
import { AppSettings } from '../types/journal';
import { loadStoredSettings, saveStoredSettings } from '../lib/storage';

const FONT_CONFIG: Record<AppSettings['fontFamily'], { text: string; display: string }> = {
  Thmanyah: {
    text: "'Thmanyah Text', sans-serif",
    display: "'Thmanyah Display', serif",
  },
  Amiri: {
    text: "'Amiri', serif",
    display: "'Amiri', serif",
  },
  Tajawal: {
    text: "'Tajawal', sans-serif",
    display: "'Tajawal', sans-serif",
  },
};

export function useTheme() {
  const [settings, setSettings] = useState<AppSettings>(() => loadStoredSettings());

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'night-sand', 'night-sky', 'night-palms');

    if (settings.theme === 'dark') {
      root.classList.add('dark');
      root.classList.add(`night-${settings.nightTheme || 'sand'}`);
    }

    // Apply global dynamic font family (Text vs Display separation)
    const fontChoice = settings.fontFamily || 'Thmanyah';
    const config = FONT_CONFIG[fontChoice] || FONT_CONFIG.Thmanyah;
    root.style.setProperty('--app-font-text', config.text);
    root.style.setProperty('--app-font-display', config.display);
    root.style.setProperty('--app-font', config.text);
    root.style.setProperty('--app-font-serif', config.display);
    
    // Save to local storage
    saveStoredSettings(settings);
  }, [settings]);

  const toggleTheme = () => {
    setSettings((prev) => {
      const nextTheme: 'dark' | 'light' = prev.theme === 'dark' ? 'light' : 'dark';
      return { ...prev, theme: nextTheme };
    });
  };

  const setTheme = (theme: 'dark' | 'light') => {
    setSettings((prev) => ({ ...prev, theme }));
  };

  const setNightTheme = (nightTheme: 'sand' | 'sky' | 'palms') => {
    setSettings((prev) => {
      const updated = { ...prev, nightTheme, theme: 'dark' as const };
      saveStoredSettings(updated);
      return updated;
    });
  };

  const setFont = (fontFamily: AppSettings['fontFamily']) => {
    setSettings((prev) => {
      const updated = { ...prev, fontFamily };
      saveStoredSettings(updated);
      return updated;
    });
  };

  const setPaperRuling = (paperRuling: AppSettings['paperRuling']) => {
    setSettings((prev) => {
      const updated = { ...prev, paperRuling };
      saveStoredSettings(updated);
      return updated;
    });
  };

  const updateSettings = (partial: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...partial };
      saveStoredSettings(updated);
      return updated;
    });
  };

  return {
    theme: settings.theme,
    nightTheme: settings.nightTheme || 'sand',
    settings,
    toggleTheme,
    setTheme,
    setNightTheme,
    setFont,
    setPaperRuling,
    updateSettings,
    isDark: settings.theme === 'dark',
  };
}
