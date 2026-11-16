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

export const HIJRI_MONTHS = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر',
  'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
  'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
];

export const ARABIC_DAYS = [
  'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'
];

/**
 * دالة استخراج تفاصيل التاريخ الهجري بدقة تقويم أم القرى
 */
export function getHijriDateParts(date: Date) {
  try {
    const fmt = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
    const parts = fmt.formatToParts(date);
    const dayStr = parts.find(p => p.type === 'day')?.value || '1';
    const monthStr = parts.find(p => p.type === 'month')?.value || '1';
    const yearStr = parts.find(p => p.type === 'year')?.value || '1448';

    const parseDigits = (s: string) => {
      const western = s.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
      return parseInt(western, 10) || 1;
    };

    const day = parseDigits(dayStr);
    const month = parseDigits(monthStr);
    const year = parseDigits(yearStr);
    const monthName = HIJRI_MONTHS[month - 1] || 'محرم';

    return {
      dayNumber: day,
      dayNumberAr: toArabicNumerals(day),
      monthNumber: month,
      monthNumberAr: toArabicNumerals(month),
      monthName,
      year,
      yearAr: toArabicNumerals(year),
    };
  } catch {
    return {
      dayNumber: date.getDate(),
      dayNumberAr: toArabicNumerals(date.getDate()),
      monthNumber: 1,
      monthNumberAr: '١',
      monthName: 'محرم',
      year: 1448,
      yearAr: '١٤٤٨',
    };
  }
}

export function formatDateArabic(
  isoDate: string,
  options?: { showMonthNumber?: boolean; enableHijri?: boolean }
): {
  dayName: string;
  dayNumber: number;
  dayNumberAr: string;
  monthName: string;
  monthNumber: number;
  year: number;
  yearAr: string;
  fullString: string;
  isHijri?: boolean;
} {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  
  const dayName = ARABIC_DAYS[dateObj.getDay()] || '';

  if (options?.enableHijri) {
    const hijri = getHijriDateParts(dateObj);
    const monthWithNum = options.showMonthNumber
      ? `${hijri.monthName} (${hijri.monthNumber})`
      : hijri.monthName;
    return {
      dayName,
      dayNumber: hijri.dayNumber,
      dayNumberAr: hijri.dayNumberAr,
      monthName: hijri.monthName,
      monthNumber: hijri.monthNumber,
      year: hijri.year,
      yearAr: hijri.yearAr,
      fullString: `${dayName}، ${hijri.dayNumber} ${monthWithNum} ${hijri.year} هـ`,
      isHijri: true,
    };
  }

  const dayNumber = d;
  const dayNumberAr = toArabicNumerals(d);
  const monthName = ARABIC_MONTHS[m - 1] || '';
  const monthWithNum = options?.showMonthNumber ? `${monthName} (${m})` : monthName;
  const year = y;
  const yearAr = toArabicNumerals(y);

  return {
    dayName,
    dayNumber,
    dayNumberAr,
    monthName,
    monthNumber: m,
    year,
    yearAr,
    fullString: `${dayName}، ${dayNumber} ${monthWithNum} ${year}`,
    isHijri: false,
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

/**
 * ضغط الصور برمجياً على طرف العميل لحفظ أداء وسرعة التطبيق
 */
export async function compressImage(file: File, maxDim = 1200, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
