export type MoodType = 'radiant' | 'peaceful' | 'neutral' | 'exhausted' | 'heavy';

export interface MoodConfig {
  id: MoodType;
  level: number; // 5 to 1 (best to worst)
  labelAr: string;
  labelEn: string;
  emoji: string;
  color: string;
  bgLight: string;
  bgDark: string;
  borderColor: string;
  descriptionAr: string;
}

export interface JournalEntry {
  id: string;
  date: string; // ISO date format: YYYY-MM-DD
  title: string;
  content: string;
  mood: MoodType | null;
  weather?: 'sunny' | 'cloudy' | 'rainy' | 'windy' | 'night' | 'coffee';
  tags: string[];
  wordCount: number;
  readingTimeMinutes: number;
  createdAt: string;
  updatedAt: string;
  favorite?: boolean;
  drawingData?: string; // رسومات القلم الذكي (Data URL)
  images?: string[]; // صور مرفقة بالتدوينة (بحد أقصى 3 صور)
}

export interface QuickNote {
  id: string;
  title: string;
  content: string;
  category: string;
  pinned: boolean;
  updatedAt: string;
  drawingData?: string; // رسومات القلم الذكي (Data URL)
}

export interface UserStats {
  totalWordsWritten: number;
  totalEntriesCount: number;
  currentStreakDays: number;
  longestStreakDays: number;
  moodCounts: Record<MoodType, number>;
  sevenDayWordCounts: {
    date: string;
    dayLabelAr: string;
    dayLabelEn: string;
    wordCount: number;
    mood: MoodType | null;
  }[];
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  isGuest: boolean;
  isAdmin?: boolean;
  role?: 'admin' | 'user';
  joinedDate: string;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  nightTheme: 'sand' | 'sky' | 'palms';
  fontFamily: 'Thmanyah' | 'Amiri' | 'Tajawal';
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  soundEnabled: boolean;
  soundType: 'rain' | 'fire' | 'waves' | 'cafe' | 'none';
  soundVolume: number;
  paperRuling: 'none' | 'lined' | 'dotted';
  language: 'ar' | 'en';
  autoSaveDelayMs: number;
  showMonthNumber?: boolean; // إظهار رقم الشهر بجانب اسمه
  enableHijriCalendar?: boolean; // تفعيل التقويم الهجري
}

// ----------------------------------------------------
// نظام البومودورو والتركيز (Focus & Pomodoro)
// ----------------------------------------------------
export type FocusSessionType = 'study' | 'work' | 'reading' | 'meditation';

export interface FocusSession {
  id: string;
  durationMinutes: number;
  sessionType: FocusSessionType;
  subject: string;
  completedAt: string; // ISO string
  date: string; // YYYY-MM-DD
}

// ----------------------------------------------------
// قسم مكتبتي الأدبية (My Library & Reading Tracker)
// ----------------------------------------------------
export type ReadingStatus = 'completed' | 'reading' | 'unread';

export interface BookItem {
  id: string;
  title: string; // اسم الكتاب (إلزامي)
  coverImage: string; // صورة غلاف الكتاب (إلزامي)
  status: ReadingStatus; // حالة القراءة (إلزامي)
  author?: string; // اسم المؤلف (اختياري)
  rating?: number; // التقييم بالنجوم 1-5 (اختياري)
  finishedDate?: string; // تاريخ الانتهاء (اختياري)
  summary?: string; // ملخص أو رأي عن الكتاب (اختياري)
  createdAt: string;
  updatedAt: string;
}
