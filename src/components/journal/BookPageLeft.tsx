import React, { useState } from 'react';
import { JournalEntry, MoodType, AppSettings } from '../../types/journal';
import { formatDateArabic, formatDateEnglish, cn } from '../../lib/utils';
import { MoodSelector } from './MoodSelector';
import {
  Sun,
  Cloud,
  CloudRain,
  Wind,
  Moon,
  Coffee,
  Heart,
  Tag as TagIcon,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X
} from 'lucide-react';

interface BookPageLeftProps {
  entry: JournalEntry;
  onUpdate: (updates: Partial<JournalEntry>) => void;
  onPrevDay: () => void;
  onNextDay: () => void;
  isToday: boolean;
  settings?: AppSettings;
}

const WEATHER_OPTIONS = [
  { id: 'sunny', label: 'مشرق', icon: Sun },
  { id: 'cloudy', label: 'غائم', icon: Cloud },
  { id: 'rainy', label: 'ماطر', icon: CloudRain },
  { id: 'windy', label: 'نسيم', icon: Wind },
  { id: 'night', label: 'سكون الليل', icon: Moon },
  { id: 'coffee', label: 'وقت قهوة', icon: Coffee },
] as const;

const REFLECTION_PROMPTS = [
  'ما هو الشيء الصغير الذي منحك ابتسامة أو سكينة اليوم؟',
  'ما الفكرة التي زارت عقلك اليوم وتستحق التفكير فيها بعمق؟',
  'لو كان بإمكانك إرسال رسالة شكر لشخص واحد اليوم، لمن ستكون؟',
  'ما هو التحدي الذي واجهته اليوم وكيف تعاملت معه بلطف؟',
  'صف لحظة هدوء عشتها اليوم وكيف كان شعورك فيها.',
];

export const BookPageLeft: React.FC<BookPageLeftProps> = ({
  entry,
  onUpdate,
  onPrevDay,
  onNextDay,
  isToday,
  settings,
}) => {
  const [newTagInput, setNewTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  const arabicDate = formatDateArabic(entry.date, {
    showMonthNumber: settings?.showMonthNumber,
    enableHijri: settings?.enableHijriCalendar,
  });
  const englishDate = formatDateEnglish(entry.date);

  // Pick prompt deterministically based on date day number
  const promptIndex = (arabicDate.dayNumber || 1) % REFLECTION_PROMPTS.length;
  const dailyPrompt = REFLECTION_PROMPTS[promptIndex];

  const handleAddTag = () => {
    const val = newTagInput.trim();
    if (val && !entry.tags.includes(val)) {
      onUpdate({ tags: [...entry.tags, val] });
      setNewTagInput('');
      setShowTagInput(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdate({ tags: entry.tags.filter(t => t !== tagToRemove) });
  };

  return (
    <div className="flex flex-col justify-between h-full p-6 md:p-8 lg:p-10 select-none">
      {/* Top Header & Day Navigation */}
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-black/[0.08] dark:border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onPrevDay}
              className="p-1.5 rounded-lg text-[#5C5549] dark:text-[#A8A196] hover:bg-black/[0.05] dark:hover:bg-[var(--color-bg-card-hover)] hover:text-[#1D1A16] dark:hover:text-[#F3EFE6] transition-colors"
              title="اليوم السابق"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onNextDay}
              className="p-1.5 rounded-lg text-[#5C5549] dark:text-[#A8A196] hover:bg-black/[0.05] dark:hover:bg-[var(--color-bg-card-hover)] hover:text-[#1D1A16] dark:hover:text-[#F3EFE6] transition-colors"
              title="اليوم التالي"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {isToday && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#E09F3E]/15 text-[#E09F3E] border border-[#E09F3E]/30">
                اليوم
              </span>
            )}
            <button
              type="button"
              onClick={() => onUpdate({ favorite: !entry.favorite })}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                entry.favorite
                  ? "text-rose-500 fill-rose-500 bg-rose-50 dark:bg-rose-950/40"
                  : "text-[#8C8476] hover:text-rose-500 hover:bg-black/[0.04] dark:hover:bg-white/[0.05]"
              )}
              title="حفظ في المفضلة"
            >
              <Heart className={cn("w-4 h-4", entry.favorite && "fill-current")} />
            </button>
          </div>
        </div>

        {/* Big Date Typography (Apple Notes / Literary Serif style) */}
        <div className="mt-6 mb-6">
          <div className="flex items-baseline gap-3">
            <span className="text-4xl md:text-5xl font-display font-bold text-[#1D1A16] dark:text-[#F3EFE6] tracking-tight">
              {arabicDate.dayNumberAr}
            </span>
            <div>
              <h2 className="text-xl md:text-2xl font-display font-semibold text-[#1D1A16] dark:text-[#F3EFE6]">
                {arabicDate.dayName}
              </h2>
              <p className="text-xs text-[#8C8476] dark:text-[#9E9689] font-medium font-text">
                {arabicDate.monthName} {arabicDate.yearAr}
              </p>
            </div>
          </div>
        </div>

        {/* Ambience / Weather Selection */}
        <div className="mb-6">
          <span className="text-xs font-medium text-[#7E786E] dark:text-[#8C8476] block mb-2">
            طقس اليوم والمحيط
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {WEATHER_OPTIONS.map(({ id, label, icon: Icon }) => {
              const isSelected = entry.weather === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onUpdate({ weather: id })}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all duration-150 border",
                    isSelected
                      ? "bg-[var(--color-active-card)] text-[#8B5814] dark:text-[var(--color-accent-warm)] border-[var(--color-active-border)] shadow-[0_0_8px_var(--color-accent-glow)] font-semibold"
                      : "bg-black/[0.03] dark:bg-white/[0.04] text-[#5C5549] dark:text-[#A8A196] border-transparent hover:bg-black/[0.06] dark:hover:bg-white/[0.08]"
                  )}
                >
                  <Icon className={cn("w-3.5 h-3.5", isSelected ? "text-[#8B5814] dark:text-[var(--color-accent-warm)]" : "text-[#7E786E] dark:text-[#8C8476]")} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5-tier Mood Selector */}
        <div className="mb-6">
          <MoodSelector
            selectedMood={entry.mood}
            onSelectMood={(m: MoodType) => onUpdate({ mood: m })}
          />
        </div>

        {/* Daily Literary Prompt Card */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-[#FAF5EC] to-[#F3ECE0] dark:from-[var(--color-bg-card)] dark:to-[var(--color-bg-surface)] border border-[#E8E0D2] dark:border-[var(--color-border-subtle)] shadow-sm mb-6">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#E09F3E] mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>قبس اليوم للتأمل:</span>
          </div>
          <p className="text-sm font-text italic text-[#3B352E] dark:text-[#D8D2C6] leading-relaxed">
            «{dailyPrompt}»
          </p>
        </div>
      </div>

      {/* Bottom Section: Tags */}
      <div className="pt-4 border-t border-black/[0.08] dark:border-[var(--color-border-subtle)]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[#7E786E] dark:text-[#8C8476] flex items-center gap-1">
            <TagIcon className="w-3 h-3" /> الوسوم والمحاور
          </span>
          <button
            type="button"
            onClick={() => setShowTagInput(!showTagInput)}
            className="text-xs text-[#E09F3E] hover:underline font-medium"
          >
            {showTagInput ? 'إلغاء' : '+ وسم جديد'}
          </button>
        </div>

        {showTagInput && (
          <div className="flex items-center gap-1.5 mb-2.5">
            <input
              type="text"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="اكتب الوسم واضغط Enter..."
              className="flex-1 px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-black/40 border border-black/[0.1] dark:border-[var(--color-border-subtle)] text-[#1D1A16] dark:text-[#F3EFE6] placeholder-[#5C5549] dark:placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-active-border)]"
              autoFocus
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-2.5 py-1 text-xs font-medium bg-[#E09F3E] text-white rounded-lg hover:bg-[#C98829]"
            >
              إضافة
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {entry.tags.length === 0 ? (
            <span className="text-xs text-[#8C8476] italic">لا توجد وسوم مضافة بعد</span>
          ) : (
            entry.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-black/[0.04] dark:bg-[var(--color-bg-surface)] text-[#5C5549] dark:text-[#B5AFA4] border border-black/[0.06] dark:border-[var(--color-border-subtle)]"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-rose-500 transition-colors"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
