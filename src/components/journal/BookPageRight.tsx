import React, { useRef, useState } from 'react';
import { JournalEntry, AppSettings } from '../../types/journal';
import { cn, toArabicNumerals, formatWordsCount, compressImage } from '../../lib/utils';
import confetti from 'canvas-confetti';
import {
  Check,
  Clock,
  Feather,
  Maximize2,
  Minimize2,
  Type,
  Sparkles,
  PenTool,
  FileText,
  Image as ImageIcon,
  Trash2,
  X,
  ZoomIn,
  Plus
} from 'lucide-react';
import { StylusCanvas } from '../common/StylusCanvas';

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
  const [inputMode, setInputMode] = useState<'text' | 'drawing'>('text');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isCompressingImage, setIsCompressingImage] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const images = entry.images || [];

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

  // Image Upload Handler with client-side compression (Max 3 images)
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = Math.max(0, 3 - images.length);
    if (remainingSlots <= 0) {
      alert('الحد الأقصى المسموح به هو 3 صور لكل تدوينة.');
      return;
    }

    setIsCompressingImage(true);
    try {
      const filesToProcess = Array.from(files).slice(0, remainingSlots);
      const compressedUrls: string[] = [];

      for (const file of filesToProcess) {
        const compressed = await compressImage(file, 1200, 0.75);
        compressedUrls.push(compressed);
      }

      const updatedImages = [...images, ...compressedUrls].slice(0, 3);
      onUpdate({ images: updatedImages });
    } catch (err) {
      console.error('Failed to process image', err);
    } finally {
      setIsCompressingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onUpdate({ images: updated });
  };

  return (
    <div className={cn(
      "flex flex-col h-full p-4 sm:p-6 lg:p-8 transition-all duration-300 overflow-hidden relative",
      isZenMode && "fixed inset-0 z-50 bg-[#FAF8F5] dark:bg-[var(--color-bg-base)] max-w-4xl mx-auto shadow-2xl p-6 md:p-12",
      settings.paperRuling === 'lined' && "paper-lined",
      settings.paperRuling === 'dotted' && "paper-dotted"
    )}>
      {/* Hidden File Input for Images */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageSelect}
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* Top Toolbar: Status, Mode Switcher & Typography Controls */}
      <div className="flex-shrink-0 flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-[var(--color-border-subtle)] mb-3 gap-2 flex-wrap">
        {/* Save Status & Word Count */}
        <div className="flex items-center gap-2.5">
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

        {/* Input Mode Switcher (Text vs Drawing Stylus) + Actions */}
        <div className="flex items-center gap-1.5">
          {/* Text vs Pen Toggle */}
          <div className="flex items-center bg-black/[0.04] dark:bg-[var(--color-bg-card)] p-0.5 rounded-xl border border-[var(--color-border-subtle)]">
            <button
              type="button"
              onClick={() => setInputMode('text')}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all",
                inputMode === 'text'
                  ? "bg-[var(--color-accent-warm)] text-white shadow-xs"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              )}
              title="الكتابة النصية"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">نص</span>
            </button>

            <button
              type="button"
              onClick={() => setInputMode('drawing')}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all",
                inputMode === 'drawing'
                  ? "bg-[var(--color-accent-warm)] text-white shadow-xs"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              )}
              title="الرسم والكتابة بالقلم الذكي"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">رسم بالقلم</span>
            </button>
          </div>

          {/* Add Image Button (Max 3) */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={images.length >= 3 || isCompressingImage}
            className={cn(
              "p-1.5 rounded-lg text-xs font-medium border border-[var(--color-border-subtle)] transition-colors flex items-center gap-1",
              images.length >= 3
                ? "opacity-40 cursor-not-allowed bg-black/[0.02]"
                : "bg-black/[0.03] dark:bg-[var(--color-bg-card)] text-[#7E786E] dark:text-[#9E9689] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] hover:text-[var(--color-text-primary)]"
            )}
            title={images.length >= 3 ? "تم الوصول للحد الأقصى (3 صور)" : "إرفاق صورة (حتى 3 صور)"}
          >
            <ImageIcon className="w-3.5 h-3.5 text-[var(--color-accent-warm)]" />
            <span className="text-[11px] font-mono">{toArabicNumerals(images.length)}/٣</span>
          </button>

          {/* Insert Timestamp */}
          <button
            type="button"
            onClick={insertTimestamp}
            className="p-1.5 rounded-lg text-xs font-medium text-[#7E786E] dark:text-[#9E9689] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] hover:text-[#1D1A16] dark:hover:text-[#F3EFE6] transition-colors flex items-center gap-1"
            title="إدراج الوقت الحالي"
          >
            <Clock className="w-3.5 h-3.5" />
          </button>

          {/* Font Scale */}
          <button
            type="button"
            onClick={() => setFontSizeOffset(prev => (prev >= 4 ? -2 : prev + 2))}
            className="p-1.5 rounded-lg text-xs text-[#7E786E] dark:text-[#9E9689] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] hover:text-[#1D1A16] dark:hover:text-[#F3EFE6] transition-colors"
            title="تغيير حجم الخط"
          >
            <Type className="w-4 h-4" />
          </button>

          {/* Zen Mode */}
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

      {/* Main Content Area: Switches between Textarea and Stylus Canvas */}
      <div className="flex-1 min-h-0 relative flex flex-col overflow-y-auto scrollbar-thin">
        {inputMode === 'drawing' ? (
          <div className="flex-1 flex flex-col min-h-[380px] space-y-2">
            <StylusCanvas
              initialDataUrl={entry.drawingData}
              onSave={(dataUrl) => onUpdate({ drawingData: dataUrl })}
              onClear={() => onUpdate({ drawingData: undefined })}
              height={380}
            />
            <p className="text-[11px] text-[var(--color-text-muted)] text-center">
              يتم حفظ الرسمة تلقائياً مع تدوينتك، ويمكنك العودة للكتابة النصية في أي وقت.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            {/* The Textarea */}
            <textarea
              ref={textareaRef}
              value={entry.content}
              onChange={handleContentChange}
              placeholder="اكتب هنا بحرية وسكينة... أفرغ خواطرك، تفاصيل يومك، وملاحظاتك الصغيرة دون استعجال..."
              style={{
                fontSize: `${16 + fontSizeOffset}px`,
                lineHeight: '1.9',
              }}
              className="w-full flex-1 min-h-[220px] bg-transparent resize-none focus:outline-none text-[#23211E] dark:text-[#EDE7DC] placeholder-[#5C5549] dark:placeholder-[var(--color-text-muted)] font-text"
              spellCheck={false}
            />

            {/* Embedded Drawing Preview (if user drew something previously) */}
            {entry.drawingData && (
              <div className="mt-3 p-2 rounded-2xl border border-[var(--color-border-subtle)] bg-black/[0.02] dark:bg-[var(--color-bg-base)]/40 relative group">
                <div className="flex items-center justify-between pb-1.5 px-2 border-b border-[var(--color-border-subtle)] text-[11px] text-[var(--color-text-muted)]">
                  <span className="flex items-center gap-1">
                    <PenTool className="w-3 h-3 text-[var(--color-accent-warm)]" />
                    <span>رسمة بالقلم مرفقة</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setInputMode('drawing')}
                      className="text-xs text-[var(--color-accent-warm)] hover:underline font-semibold"
                    >
                      تعديل الرسمة
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdate({ drawingData: undefined })}
                      className="text-xs text-rose-500 hover:underline"
                    >
                      حذف
                    </button>
                  </div>
                </div>
                <div className="p-2 flex justify-center">
                  <img
                    src={entry.drawingData}
                    alt="رسمة التدوينة"
                    className="max-h-48 rounded-xl object-contain shadow-xs"
                  />
                </div>
              </div>
            )}

            {/* Attached Images Grid (Max 3 Images) */}
            {images.length > 0 && (
              <div className="mt-4 pt-3 border-t border-[var(--color-border-subtle)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[var(--color-text-secondary)] flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[var(--color-accent-warm)]" />
                    <span>الصور المرفقة ({toArabicNumerals(images.length)}/٣)</span>
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {images.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="group relative aspect-video rounded-xl overflow-hidden bg-black/10 dark:bg-white/5 border border-[var(--color-border-subtle)] shadow-xs"
                    >
                      <img
                        src={imgUrl}
                        alt={`مرفق ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {/* Hover Overlay with Preview and Delete */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewImage(imgUrl)}
                          className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-xs transition-colors"
                          title="تكبير الصورة"
                        >
                          <ZoomIn className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="p-1.5 rounded-full bg-rose-500/80 hover:bg-rose-500 text-white backdrop-blur-xs transition-colors"
                          title="حذف الصورة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/20 shadow-2xl">
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 left-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors z-10"
              title="إغلاق المعاينة"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImage}
              alt="معاينة مكبرة"
              className="max-h-[85vh] w-auto object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

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
