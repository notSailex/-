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
}

export interface QuickNote {
  id: string;
  title: string;
  content: string;
  category: string;
  pinned: boolean;
  updatedAt: string;
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
}
