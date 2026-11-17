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

const MOCK_ENTRY_TITLES = [
  'بداية هادئة لرحلة التدوين اليومية',
  'جلسة قراءة مسائية في فصول الأدب',
  'إنجاز مشاريع تقنية وضبط النبض',
  'ضغط العمل وتأملات في التباطؤ الممتع',
  'جلسة عائلية وضحكات صادقة',
  'مشي على شاطئ البحر وسكينة الأمواج',
];

export function purgeLegacyMockEntries(entries: Record<string, JournalEntry>): Record<string, JournalEntry> {
  const clean: Record<string, JournalEntry> = {};
  for (const [date, item] of Object.entries(entries)) {
    if (!item) continue;
    if (
      MOCK_ENTRY_TITLES.includes(item.title) ||
      (item.content && (
        item.content.includes('صباح مليء بالسكينة والضوء الخافت') ||
        item.content.includes('أنهيت اليوم فصلاً من كتاب طالما أحببت العودة إليه') ||
        item.content.includes('يوم طويل ومزدحم بالاجتماعات') ||
        item.content.includes('شعرت ببعض الإرهاق اليوم بسبب تسارع المواعيد') ||
        item.content.includes('اجتماع رائع مع الأهل وتناول طعام العشاء') ||
        item.content.includes('خرجت في وقت الغروب للمشي بمحاذاة الشاطئ')
      ))
    ) {
      continue; // Skip fake mock entries
    }
    clean[date] = item;
  }
  return clean;
}

export function purgeLegacyMockData(): void {
  try {
    // 1. Clean entries
    const rawEntries = localStorage.getItem(STORAGE_KEY_ENTRIES);
    if (rawEntries) {
      const parsed = JSON.parse(rawEntries);
      const cleaned = purgeLegacyMockEntries(parsed);
      localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(cleaned));
    }

    // 2. Clean notes
    const rawNotes = localStorage.getItem(STORAGE_KEY_NOTES);
    if (rawNotes) {
      const parsed: QuickNote[] = JSON.parse(rawNotes);
      const cleaned = parsed.filter(n =>
        n.id !== 'note-1' &&
        n.id !== 'note-2' &&
        n.title !== 'اقتباس اليوم الملهم' &&
        n.title !== 'قائمة كتب الشتاء الهادئ' &&
        !(n.content && n.content.includes('في مديح الظل - جونيشيرو')) &&
        !(n.content && n.content.includes('إن الهدوء ليس غياب الفوضى'))
      );
      localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(cleaned));
    }

    // 3. Clean focus sessions
    const rawSessions = localStorage.getItem(STORAGE_KEY_FOCUS_SESSIONS);
    if (rawSessions) {
      const parsed: FocusSession[] = JSON.parse(rawSessions);
      const cleaned = parsed.filter(s =>
        s.id !== 'focus-1' &&
        s.id !== 'focus-2' &&
        s.id !== 'focus-3' &&
        s.id !== 'focus-4' &&
        !['focus-1', 'focus-2', 'focus-3', 'focus-4'].includes(s.id)
      );
      localStorage.setItem(STORAGE_KEY_FOCUS_SESSIONS, JSON.stringify(cleaned));
    }
  } catch (err) {
    console.error('Error in purgeLegacyMockData:', err);
  }
}

// Auto purge on module evaluation
if (typeof window !== 'undefined') {
  purgeLegacyMockData();
}

export function loadStoredEntries(): Record<string, JournalEntry> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ENTRIES);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const cleaned = purgeLegacyMockEntries(parsed);
    return cleaned;
  } catch {
    return {};
  }
}

export function saveStoredEntries(entries: Record<string, JournalEntry>) {
  try {
    const cleaned = purgeLegacyMockEntries(entries);
    localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(cleaned));
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
    const parsed: QuickNote[] = JSON.parse(raw);
    return parsed.filter(n =>
      n.id !== 'note-1' &&
      n.id !== 'note-2' &&
      n.title !== 'اقتباس اليوم الملهم' &&
      n.title !== 'قائمة كتب الشتاء الهادئ' &&
      !(n.content && n.content.includes('في مديح الظل - جونيشيرو')) &&
      !(n.content && n.content.includes('إن الهدوء ليس غياب الفوضى'))
    );
  } catch {
    return [];
  }
}

export function saveStoredNotes(notes: QuickNote[]) {
  try {
    const cleaned = notes.filter(n =>
      n.id !== 'note-1' &&
      n.id !== 'note-2' &&
      n.title !== 'اقتباس اليوم الملهم' &&
      n.title !== 'قائمة كتب الشتاء الهادئ' &&
      !(n.content && n.content.includes('في مديح الظل - جونيشيرو')) &&
      !(n.content && n.content.includes('إن الهدوء ليس غياب الفوضى'))
    );
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(cleaned));
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
    const parsed: FocusSession[] = JSON.parse(raw);
    return parsed.filter(s =>
      s.id !== 'focus-1' &&
      s.id !== 'focus-2' &&
      s.id !== 'focus-3' &&
      s.id !== 'focus-4' &&
      !['focus-1', 'focus-2', 'focus-3', 'focus-4'].includes(s.id)
    );
  } catch {
    return [];
  }
}

export function saveStoredFocusSessions(sessions: FocusSession[]) {
  try {
    const cleaned = sessions.filter(s =>
      s.id !== 'focus-1' &&
      s.id !== 'focus-2' &&
      s.id !== 'focus-3' &&
      s.id !== 'focus-4' &&
      !['focus-1', 'focus-2', 'focus-3', 'focus-4'].includes(s.id)
    );
    localStorage.setItem(STORAGE_KEY_FOCUS_SESSIONS, JSON.stringify(cleaned));
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
