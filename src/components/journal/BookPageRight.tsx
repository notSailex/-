import React, { useRef, useState } from 'react';
import { JournalEntry, AppSettings } from '../../types/journal';
import { cn, toArabicNumerals, formatWordsCount } from '../../lib/utils';
import confetti from 'canvas-confetti';
import {
  Check,
  Clock,
  Feather,
  Maximize2,
  Minimize2,
  Type,
  AlignLeft,
  Sparkles,
  RotateCcw
} from 'lucide-react';

interface BookPageRightProps {
  entry: JournalEntry;
  onUpdate: (updates: Partial<JournalEntry>) => void;
  saveStatus: 'saved' | 'saving' | 'unsaved';
  settings: AppSettings;
}

export const BookPageRight: React.FC<BookPageRightProps> = ({
  entry,
  onUpdate,
  saveStatus,
  settings,
}) => {
  const [isZenMode, setIsZenMode] = useState(false);
  const [fontSizeOffset, setFontSizeOffset] = useState<number>(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ title: e.target.value });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    onUpdate({ content: newContent });

    // Celebrate milestone if user just hit 100 words
    const prevWords = entry.wordCount;
    const currentWords = newContent.trim().split(/[\s\n\r\t]+/).filter(w => w.length > 0).length;
    if (prevWords < 100 && currentWords >= 100) {
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#E09F3E', '#F4A261', '#588157', '#E7DEC8']
        });
      } catch {
        // Ignored
      }
    }
  };

  const insertTimestamp = () => {
    const now = new Date();
    const hours = toArabicNumerals(String(now.getHours()).padStart(2, '0'));
    const minutes = toArabicNumerals(String(now.getMinutes()).padStart(2, '0'));
    const timeStr = `${hours}:${minutes}`;
    const insertion = `\n\n[الساعة ${timeStr}]: `;
    const updated = (entry.content || '') + insertion;
    onUpdate({ content: updated });
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
      }
    }, 50);
  };

  return (
    <div className={cn(
      "flex flex-col h-full p-4 sm:p-6 lg:p-8 transition-all duration-300 overflow-hidden",
      isZenMode && "fixed inset-0 z-50 bg-[#FAF8F5] dark:bg-[var(--color-bg-base)] max-w-4xl mx-auto shadow-2xl p-6 md:p-12",
      settings.paperRuling === 'lined' && "paper-lined",
      settings.paperRuling === 'dotted' && "paper-dotted"
    )}>
      {/* Top Toolbar: Status & Typography Controls (Fixed pinned top) */}
      <div className="flex-shrink-0 flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-[var(--color-border-subtle)] mb-3">
        {/* Save Status & Word Count */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[#7E786E] dark:text-[#9E9689]">
            {saveStatus === 'saving' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#E09F3E] animate-pulse" />
                <span>جاري الحفظ...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[11px]">محفوظ بهدوء</span>
              </>
            )}
          </div>

          <span className="text-black/20 dark:text-white/20">•</span>

          <div className="flex items-center gap-1.5 text-xs text-[#5C5549] dark:text-[#A8A196]">
            <Feather className="w-3.5 h-3.5 text-[#E09F3E]" />
            <span>{formatWordsCount(entry.wordCount)}</span>
          </div>

          <span className="text-black/20 dark:text-white/20 hidden sm:inline">•</span>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#7E786E] dark:text-[#9E9689]">
            <Clock className="w-3.5 h-3.5" />
            <span>~{toArabicNumerals(entry.readingTimeMinutes)} دقيقة قراءة</span>
          </div>
        </div>

        {/* Controls: Insert time, Font scale, Zen mode */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={insertTimestamp}
            className="p-1.5 rounded-lg text-xs font-medium text-[#7E786E] dark:text-[#9E9689] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] hover:text-[#1D1A16] dark:hover:text-[#F3EFE6] transition-colors flex items-center gap-1"
            title="إدراج الوقت الحالي"
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="hidden md:inline">وقت</span>
          </button>

          <button
            type="button"
            onClick={() => setFontSizeOffset(prev => (prev >= 4 ? -2 : prev + 2))}
            className="p-1.5 rounded-lg text-xs text-[#7E786E] dark:text-[#9E9689] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] hover:text-[#1D1A16] dark:hover:text-[#F3EFE6] transition-colors"
            title="تغيير حجم الخط"
          >
            <Type className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsZenMode(!isZenMode)}
            className="p-1.5 rounded-lg text-xs text-[#7E786E] dark:text-[#9E9689] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] hover:text-[#1D1A16] dark:hover:text-[#F3EFE6] transition-colors"
            title={isZenMode ? "خروج من وضع التركيز" : "وضع التركيز الكامل"}
          >
            {isZenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Title Input (Fixed pinned header) */}
      <div className="flex-shrink-0 mb-3">
        <input
          type="text"
          value={entry.title}
          onChange={handleTitleChange}
          placeholder="عنوان التدوينة أو الفكرة الرئيسية..."
          className="w-full text-xl md:text-2xl font-display font-bold bg-transparent text-[#1D1A16] dark:text-[#F3EFE6] placeholder-[#5C5549] dark:placeholder-[var(--color-text-muted)] focus:outline-none tracking-tight py-1"
        />
      </div>

      {/* Main Journaling Textarea (Flex-1, stable, scrolls internally only when text overflows) */}
      <div className="flex-1 min-h-0 relative flex flex-col overflow-hidden">
        <textarea
          ref={textareaRef}
          value={entry.content}
          onChange={handleContentChange}
          placeholder="اكتب هنا بحرية وسكينة... أفرغ خواطرك، تفاصيل يومك، وملاحظاتك الصغيرة دون استعجال..."
          style={{
            fontSize: `${16 + fontSizeOffset}px`,
            lineHeight: '1.9',
          }}
          className="w-full h-full flex-1 min-h-0 bg-transparent resize-none focus:outline-none text-[#23211E] dark:text-[#EDE7DC] placeholder-[#5C5549] dark:placeholder-[var(--color-text-muted)] font-text overflow-y-auto scrollbar-thin"
          spellCheck={false}
        />
      </div>

      {/* Zen Mode Exit helper button */}
      {isZenMode && (
        <div className="pt-4 flex justify-end">
          <button
            type="button"
            onClick={() => setIsZenMode(false)}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-[#1D1A16] text-[#F3EFE6] dark:bg-[#F3EFE6] dark:text-[#1D1A16] shadow-lg"
          >
            إغلاق وضع التركيز (Esc)
          </button>
        </div>
      )}
    </div>
  );
};
