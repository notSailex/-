import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MoodConfig, MoodType } from '../types/journal';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert any number or digit string to Eastern Arabic numerals (٠، ١، ٢، ٣، ٤، ٥، ٦، ٧، ٨، ٩)
export function toArabicNumerals(val: number | string | null | undefined): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return str.replace(/[0-9]/g, (digit) => arabicDigits[parseInt(digit, 10)]);
}

// Format percentages with proper Eastern Arabic numerals and Arabic percent sign (٪)
export function formatPercentArabic(val: number): string {
  const rounded = Math.round(val);
  return `${toArabicNumerals(rounded)}٪`;
}

// Format counts of entries with natural Arabic grammar and Eastern Arabic numerals
export function formatEntriesCount(count: number): string {
  if (count === 0) return 'لا توجد تدوينات';
  if (count === 1) return 'تدوينة واحدة';
  if (count === 2) return 'تدوينتان';
  if (count >= 3 && count <= 10) return `${toArabicNumerals(count)} تدوينات`;
  return `${toArabicNumerals(count)} تدوينة`;
}

// Format counts of days with natural Arabic grammar and Eastern Arabic numerals
export function formatDaysCount(count: number): string {
  if (count === 0) return '٠ يوم';
  if (count === 1) return 'يوم واحد';
  if (count === 2) return 'يومان';
  if (count >= 3 && count <= 10) return `${toArabicNumerals(count)} أيام`;
  return `${toArabicNumerals(count)} يوماً`;
}

// Format words count with Eastern Arabic numerals
export function formatWordsCount(count: number): string {
  if (count === 0) return '٠ كلمة';
  if (count === 1) return 'كلمة واحدة';
  if (count === 2) return 'كلمتان';
  if (count >= 3 && count <= 10) return `${toArabicNumerals(count)} كلمات`;
  return `${toArabicNumerals(count)} كلمة`;
}

export function getTodayISODate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getConsecutiveDate(isoDate: string, offsetDays: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  target.setDate(target.getDate() + offsetDays);
  
  const year = target.getFullYear();
  const month = String(target.getMonth() + 1).padStart(2, '0');
  const day = String(target.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

export const ARABIC_DAYS = [
  'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'
];

export function formatDateArabic(isoDate: string): {
  dayName: string;
  dayNumber: number;
  dayNumberAr: string;
  monthName: string;
  year: number;
  yearAr: string;
  fullString: string;
} {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  
  const dayName = ARABIC_DAYS[dateObj.getDay()] || '';
  const dayNumber = d;
  const dayNumberAr = toArabicNumerals(d);
  const monthName = ARABIC_MONTHS[m - 1] || '';
  const year = y;
  const yearAr = toArabicNumerals(y);

  return {
    dayName,
    dayNumber,
    dayNumberAr,
    monthName,
    year,
    yearAr,
    fullString: `${dayName}، ${dayNumberAr} ${monthName} ${yearAr}`,
  };
}

export function formatDateEnglish(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function calculateWordCount(content: string): number {
  if (!content) return 0;
  const words = content.trim().split(/[\s\n\r\t]+/);
  return words.filter(w => w.length > 0).length;
}

export function calculateReadingTime(content: string): number {
  const words = calculateWordCount(content);
  const minutes = Math.ceil(words / 180);
  return Math.max(1, minutes);
}

export const MOOD_CONFIGS: Record<MoodType, MoodConfig> = {
  radiant: {
    id: 'radiant',
    level: 5,
    labelAr: 'مبتهج ومشرق',
    labelEn: 'Radiant & Inspired',
    emoji: '☀️',
    color: '#F59E0B',
    bgLight: 'bg-amber-50 text-amber-700',
    bgDark: 'dark:bg-amber-950/40 dark:text-amber-300',
    borderColor: 'border-amber-400 dark:border-amber-500/40',
    descriptionAr: 'طاقة إيجابية عالية، وضوح ذهني وشعور بالامتنان العميق.',
  },
  peaceful: {
    id: 'peaceful',
    level: 4,
    labelAr: 'هادئ وراضٍ',
    labelEn: 'Peaceful & Serene',
    emoji: '🍃',
    color: '#10B981',
    bgLight: 'bg-emerald-50 text-emerald-700',
    bgDark: 'dark:bg-emerald-950/40 dark:text-emerald-300',
    borderColor: 'border-emerald-400 dark:border-emerald-500/40',
    descriptionAr: 'سكينة داخلية، طمأنينة متوازنة، ويوم مر بسلاسة ولطف.',
  },
  neutral: {
    id: 'neutral',
    level: 3,
    labelAr: 'عادي ومحايد',
    labelEn: 'Balanced & Neutral',
    emoji: '☕',
    color: '#8B5CF6',
    bgLight: 'bg-violet-50 text-violet-700',
    bgDark: 'dark:bg-violet-950/40 dark:text-violet-300',
    borderColor: 'border-violet-400 dark:border-violet-500/40',
    descriptionAr: 'يوم روتيني طبيعي بلا صخب كبير ولا انزعاج.',
  },
  exhausted: {
    id: 'exhausted',
    level: 2,
    labelAr: 'مرهق وقلق',
    labelEn: 'Exhausted & Restless',
    emoji: '🌧️',
    color: '#3B82F6',
    bgLight: 'bg-blue-50 text-blue-700',
    bgDark: 'dark:bg-blue-950/40 dark:text-blue-300',
    borderColor: 'border-blue-400 dark:border-blue-500/40',
    descriptionAr: 'استنزاف في الطاقة، تشويش في الأفكار، أو ضغط عمل.',
  },
  heavy: {
    id: 'heavy',
    level: 1,
    labelAr: 'كئيب وثقيل',
    labelEn: 'Melancholy & Heavy',
    emoji: '🌑',
    color: '#64748B',
    bgLight: 'bg-slate-100 text-slate-700',
    bgDark: 'dark:bg-slate-900/60 dark:text-slate-300',
    borderColor: 'border-slate-400 dark:border-slate-600',
    descriptionAr: 'مشاعر ثقيلة أو حزن، يحتاج مساحة من الرقة والتدوين لتفريغه.',
  },
};
