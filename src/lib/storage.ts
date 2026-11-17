import { JournalEntry, QuickNote, AppSettings, MoodType, FocusSession, BookItem } from '../types/journal';
import { getTodayISODate, getConsecutiveDate, calculateWordCount, calculateReadingTime } from './utils';

const STORAGE_KEY_ENTRIES = 'trmez_journal_entries_v1';
const STORAGE_KEY_NOTES = 'trmez_quick_notes_v1';
const STORAGE_KEY_SETTINGS = 'trmez_settings_v1';
const STORAGE_KEY_FOCUS_SESSIONS = 'trmez_focus_sessions_v1';
const STORAGE_KEY_FOCUS_SUBJECTS = 'trmez_focus_subjects_v1';
const STORAGE_KEY_BOOKS = 'trmez_library_books_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  nightTheme: 'sand',
  fontFamily: 'Thmanyah',
  fontSize: 'base',
  soundEnabled: false,
  soundType: 'rain',
  soundVolume: 0.35,
  paperRuling: 'lined',
  language: 'ar',
  autoSaveDelayMs: 600,
  showMonthNumber: false,
  enableHijriCalendar: false,
};

export function loadStoredEntries(): Record<string, JournalEntry> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ENTRIES);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveStoredEntries(entries: Record<string, JournalEntry>) {
  try {
    localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(entries));
  } catch (e) {
    console.error('Error saving stored entries', e);
  }
}

export function loadStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    // Ensure Thmanyah is the default if not set or legacy
    if (!parsed.fontFamily || parsed.fontFamily === 'Tajawal') {
      parsed.fontFamily = 'Thmanyah';
    }
    if (!parsed.nightTheme) {
      parsed.nightTheme = 'sand';
    }
    if (parsed.theme === 'sepia' || (parsed.theme !== 'dark' && parsed.theme !== 'light')) {
      parsed.theme = 'dark';
    }
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: AppSettings) {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings', e);
  }
}

export function loadStoredNotes(): QuickNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredNotes(notes: QuickNote[]) {
  try {
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
  } catch (e) {
    console.error('Error saving notes', e);
  }
}

// ----------------------------------------------------
// تخزين جلسات التركيز والبومودورو والمواد
// ----------------------------------------------------
const DEFAULT_FOCUS_SUBJECTS = ['برمجة', 'قراءة حرة', 'رياضيات', 'لغات', 'كتابة وأدب', 'عام'];

export function loadStoredFocusSessions(): FocusSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FOCUS_SESSIONS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredFocusSessions(sessions: FocusSession[]) {
  try {
    localStorage.setItem(STORAGE_KEY_FOCUS_SESSIONS, JSON.stringify(sessions));
  } catch (e) {
    console.error('Error saving focus sessions', e);
  }
}

export function loadStoredFocusSubjects(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FOCUS_SUBJECTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_FOCUS_SUBJECTS, JSON.stringify(DEFAULT_FOCUS_SUBJECTS));
      return DEFAULT_FOCUS_SUBJECTS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_FOCUS_SUBJECTS;
  }
}

export function saveStoredFocusSubjects(subjects: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY_FOCUS_SUBJECTS, JSON.stringify(subjects));
  } catch (e) {
    console.error('Error saving focus subjects', e);
  }
}

// ----------------------------------------------------
// تخزين كتب ومكتبتي الأدبية
// ----------------------------------------------------
export function loadStoredBooks(): BookItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredBooks(books: BookItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(books));
  } catch (e) {
    console.error('Error saving library books', e);
  }
}
