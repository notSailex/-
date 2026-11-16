import React from 'react';
import { MoodType } from '../../types/journal';
import { MOOD_CONFIGS, cn } from '../../lib/utils';
import { Sun, Leaf, Coffee, CloudRain, Moon } from 'lucide-react';

interface MoodSelectorProps {
  selectedMood: MoodType | null;
  onSelectMood: (mood: MoodType) => void;
  compact?: boolean;
}

const MOOD_ICONS: Record<MoodType, React.ElementType> = {
  radiant: Sun,
  peaceful: Leaf,
  neutral: Coffee,
  exhausted: CloudRain,
  heavy: Moon,
};

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  selectedMood,
  onSelectMood,
  compact = false,
}) => {
  const moodList: MoodType[] = ['radiant', 'peaceful', 'neutral', 'exhausted', 'heavy'];

  return (
    <div className="w-full">
      {!compact && (
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium tracking-wide text-[#5C5549] dark:text-[#A8A196] uppercase">
            نبض المزاج اليومي (من الأفضل للأثقل)
          </label>
          {selectedMood && (
            <span className="text-xs text-[#E09F3E] font-medium animate-fade-in">
              {MOOD_CONFIGS[selectedMood].labelAr}
            </span>
          )}
        </div>
      )}

      <div className={cn(
        "grid gap-2",
        compact ? "grid-cols-5" : "grid-cols-5"
      )}>
        {moodList.map((moodKey) => {
          const config = MOOD_CONFIGS[moodKey];
          const isSelected = selectedMood === moodKey;
          const Icon = MOOD_ICONS[moodKey];

          return (
            <button
              key={moodKey}
              type="button"
              onClick={() => onSelectMood(moodKey)}
              title={`${config.labelAr} - ${config.descriptionAr}`}
              className={cn(
                "group relative flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-200 select-none",
                compact ? "h-11" : "h-16 md:h-18",
                isSelected
                  ? `${config.borderColor} ${config.bgLight} ${config.bgDark} shadow-sm ring-2 ring-[#E09F3E]/40 scale-[1.03]`
                  : "border-black/[0.06] dark:border-[var(--color-border-subtle)] bg-white/40 dark:bg-[var(--color-bg-surface)] hover:bg-black/[0.03] dark:hover:bg-[var(--color-bg-card-hover)] hover:scale-[1.02]"
              )}
            >
              {/* Top rating indicator badge */}
              <span className={cn(
                "text-base md:text-lg transition-transform duration-200 group-hover:scale-125",
                isSelected && "animate-bounce"
              )}>
                {config.emoji}
              </span>

              {!compact && (
                <span className={cn(
                  "text-[10px] md:text-xs font-medium mt-1 truncate max-w-full text-center transition-colors",
                  isSelected
                    ? "font-semibold"
                    : "text-[#7E786E] dark:text-[#8C8476] group-hover:text-[#1D1A16] dark:group-hover:text-[#F3EFE6]"
                )}>
                  {config.labelAr.split(' ')[0]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Narrative Reflection based on selected mood */}
      {!compact && selectedMood && (
        <p className="text-xs text-[#7E786E] dark:text-[#9E9689] mt-2 italic px-1 animate-fade-in text-center md:text-start">
          «{MOOD_CONFIGS[selectedMood].descriptionAr}»
        </p>
      )}
    </div>
  );
};
