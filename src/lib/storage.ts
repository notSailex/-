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

function generateInitialEntries(): Record<string, JournalEntry> {
  const today = getTodayISODate();
  const dMinus1 = getConsecutiveDate(today, -1);
  const dMinus2 = getConsecutiveDate(today, -2);
  const dMinus3 = getConsecutiveDate(today, -3);
  const dMinus4 = getConsecutiveDate(today, -4);
  const dMinus5 = getConsecutiveDate(today, -5);
  const dMinus6 = getConsecutiveDate(today, -6);

  const initialList: JournalEntry[] = [
    {
      id: `entry-${today}`,
      date: today,
      title: 'بداية هادئة لرحلة التدوين اليومية',
      content: 'صباح مليء بالسكينة والضوء الخافت. كوب من القهوة الدافئة وصوت هطول المطر بالخارج. أردت أن أبدأ هذه اليوميات كواحة هادئة أفرغ فيها ضجيج اليوم وأحتفظ بلحظات الامتنان الصغيرة التي قد تتلاشى في زحام الأيام.\n\nالكتابة هنا تشبه الجلوس في مكتبة قديمة دافئة، حيث الورق له ملمس والأفكار تأخذ وقتها الكافي لتنضج على مهل.',
      mood: 'radiant',
      weather: 'rainy',
      tags: ['تأمل', 'امتنان', 'صباحات'],
      wordCount: 56,
      readingTimeMinutes: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      favorite: true,
    },
    {
      id: `entry-${dMinus1}`,
      date: dMinus1,
      title: 'جلسة قراءة مسائية في فصول الأدب',
      content: 'أنهيت اليوم فصلاً من كتاب طالما أحببت العودة إليه. الأفكار الكبيرة تحتاج إلى عقول هادئة لتستوعبها. شعرت برغبة عارمة في ترتيب أولوياتي للأسبوع القادم والتخفف من المهام غير المجدية التي تستنزف طاقتي الذهنية.',
      mood: 'peaceful',
      weather: 'night',
      tags: ['قراءة', 'أولويات'],
      wordCount: 42,
      readingTimeMinutes: 1,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      favorite: false,
    },
    {
      id: `entry-${dMinus2}`,
      date: dMinus2,
      title: 'إنجاز مشاريع تقنية وضبط النبض',
      content: 'يوم طويل ومزدحم بالاجتماعات والمراجعات الدقيقة. كانت هناك لحظات من التشويش، لكن أخذ فترات استراحة قصيرة للمشي في الهواء الطلق ساعدني على استعادة التوازن والتركيز.',
      mood: 'neutral',
      weather: 'coffee',
      tags: ['عمل', 'تركيز'],
      wordCount: 33,
      readingTimeMinutes: 1,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      favorite: false,
    },
    {
      id: `entry-${dMinus3}`,
      date: dMinus3,
      title: 'ضغط العمل وتأملات في التباطؤ الممتع',
      content: 'شعرت ببعض الإرهاق اليوم بسبب تسارع المواعيد النهائية. بدأت أتساءل: هل نسرع لأن الأمور تتطلب ذلك حقاً، أم لأننا اعتدنا الركض الدائم؟ قررت أخذ استراحة مبكرة والخلود للنوم باكراً.',
      mood: 'exhausted',
      weather: 'cloudy',
      tags: ['راحة', 'تساؤلات'],
      wordCount: 38,
      readingTimeMinutes: 1,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      favorite: false,
    },
    {
      id: `entry-${dMinus4}`,
      date: dMinus4,
      title: 'جلسة عائلية وضحكات صادقة',
      content: 'اجتماع رائع مع الأهل وتناول طعام العشاء معاً. الضحك العفوي هو أفضل ترياق لأي تعب متراكم. شعرت بدفء غامر ورغبة في حماية هذه اللحظات في ذاكرتي للأبد.',
      mood: 'radiant',
      weather: 'sunny',
      tags: ['عائلة', 'دفء'],
      wordCount: 36,
      readingTimeMinutes: 1,
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      favorite: true,
    },
    {
      id: `entry-${dMinus5}`,
      date: dMinus5,
      title: 'مشي على شاطئ البحر وسكينة الأمواج',
      content: 'خرجت في وقت الغروب للمشي بمحاذاة الشاطئ. صوت الأمواج المنتظم يمارس نوعاً من التنويم اللطيف على الروح. نسيم البحر كان نقياً وخفف الكثير من الأفكار المتشابكة في رأسي.',
      mood: 'peaceful',
      weather: 'windy',
      tags: ['طبيعة', 'مشي'],
      wordCount: 37,
      readingTimeMinutes: 1,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      favorite: false,
    },
  ];

  const map: Record<string, JournalEntry> = {};
  for (const item of initialList) {
    map[item.date] = item;
  }
  return map;
}

export function loadStoredEntries(): Record<string, JournalEntry> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ENTRIES);
    if (!raw) {
      const initial = generateInitialEntries();
      localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading stored entries', e);
    return generateInitialEntries();
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

const DEFAULT_NOTES: QuickNote[] = [
  {
    id: 'note-1',
    title: 'اقتباس اليوم الملهم',
    content: '«إن الهدوء ليس غياب الفوضى، بل هو السكينة في منتصفها.» - فكرة تحتاج للتدوين والتأمل.',
    category: 'إلهام',
    pinned: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'note-2',
    title: 'قائمة كتب الشتاء الهادئ',
    content: '1. في مديح الظل - جونيشيرو تانيزاكي\n2. التفكير فريضة إسلامية - عباس العقاد\n3. مجالس دمشق الأدبية',
    category: 'قراءة',
    pinned: false,
    updatedAt: new Date().toISOString(),
  },
];

export function loadStoredNotes(): QuickNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(DEFAULT_NOTES));
      return DEFAULT_NOTES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_NOTES;
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

const DEFAULT_FOCUS_SESSIONS: FocusSession[] = [
  {
    id: 'focus-1',
    durationMinutes: 25,
    sessionType: 'study',
    subject: 'برمجة',
    completedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    date: getTodayISODate(),
  },
  {
    id: 'focus-2',
    durationMinutes: 25,
    sessionType: 'reading',
    subject: 'قراءة حرة',
    completedAt: new Date(Date.now() - 86400000).toISOString(),
    date: getConsecutiveDate(getTodayISODate(), -1),
  },
  {
    id: 'focus-3',
    durationMinutes: 45,
    sessionType: 'work',
    subject: 'كتابة وأدب',
    completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    date: getConsecutiveDate(getTodayISODate(), -2),
  },
  {
    id: 'focus-4',
    durationMinutes: 20,
    sessionType: 'meditation',
    subject: 'عام',
    completedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    date: getConsecutiveDate(getTodayISODate(), -3),
  },
];

export function loadStoredFocusSessions(): FocusSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FOCUS_SESSIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_FOCUS_SESSIONS, JSON.stringify(DEFAULT_FOCUS_SESSIONS));
      return DEFAULT_FOCUS_SESSIONS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_FOCUS_SESSIONS;
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
const DEFAULT_BOOKS: BookItem[] = [
  {
    id: 'book-1',
    title: 'في مديح الظل',
    author: 'جونيشيرو تانيزاكي',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
    status: 'completed',
    rating: 5,
    finishedDate: '2026-11-10',
    summary: 'رسالة فلسفية بصرية مدهشة عن جماليات الظلال والعتمة في العمارة والأدب والروح الشرقية مقارنة بالسطوع الغربي.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'book-2',
    title: 'طوق الحمامة في الألفة والأُلاّف',
    author: 'ابن حزم الأندلسي',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80',
    status: 'reading',
    rating: 5,
    summary: 'من أعذب ما كُتب في الأدب الأندلسي حول فلسفة المشاعر الإنسانية وعلامات المحبة النفسية وأخلاق الوفاء.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'book-3',
    title: 'التفكير فريضة إسلامية',
    author: 'عباس محمود العقاد',
    coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&q=80',
    status: 'unread',
    rating: 4,
    summary: 'أطروحة عقلانية رصينة حول إعمال العقل والمنطق وأثر التفكير الحر في بناء النهضة الفكرية.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function loadStoredBooks(): BookItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(DEFAULT_BOOKS));
      return DEFAULT_BOOKS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_BOOKS;
  }
}

export function saveStoredBooks(books: BookItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(books));
  } catch (e) {
    console.error('Error saving library books', e);
  }
}
