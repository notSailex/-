import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuickNote } from '../../types/journal';
import { loadStoredNotes, saveStoredNotes } from '../../lib/storage';
import {
  StickyNote,
  Plus,
  Pin,
  Trash2,
  Search,
  ChevronRight,
  Check,
  Clock,
  Sparkles,
  Tag,
  ArrowRight,
  FileText
} from 'lucide-react';
import { cn, toArabicNumerals, formatWordsCount } from '../../lib/utils';

const CATEGORIES = ['all', 'أفكار', 'إلهام', 'قراءة', 'مهام'] as const;

export const QuickNotesView: React.FC = () => {
  const [notes, setNotes] = useState<QuickNote[]>(() => loadStoredNotes());
  const [viewMode, setViewMode] = useState<'list' | 'editor'>('list');
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync notes to localStorage
  const updateNotesList = (updated: QuickNote[]) => {
    setNotes(updated);
    saveStoredNotes(updated);
  };

  // Create a brand new note and immediately open it in the full editor
  const handleCreateNote = () => {
    const newNote: QuickNote = {
      id: `note-${Date.now()}`,
      title: '',
      content: '',
      category: activeCategory !== 'all' ? activeCategory : 'أفكار',
      pinned: false,
      updatedAt: new Date().toISOString(),
    };
    const updated = [newNote, ...notes];
    updateNotesList(updated);
    setActiveNoteId(newNote.id);
    setViewMode('editor');
  };

  // Open existing note in full editor
  const handleOpenNote = (id: string) => {
    setActiveNoteId(id);
    setViewMode('editor');
  };

  // Return to list view
  const handleBackToList = () => {
    setViewMode('list');
    setActiveNoteId(null);
  };

  // Delete note
  const handleDeleteNote = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = notes.filter(n => n.id !== id);
    updateNotesList(updated);
    if (activeNoteId === id) {
      handleBackToList();
    }
  };

  // Toggle pin
  const handleTogglePin = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = notes.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n);
    updateNotesList(updated);
  };

  // Update note content (auto-save)
  const handleUpdateActive = (partial: Partial<QuickNote>) => {
    if (!activeNoteId) return;

    setSaveStatus('saving');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    const nowIso = new Date().toISOString();
    const updated = notes.map(n => n.id === activeNoteId ? { ...n, ...partial, updatedAt: nowIso } : n);
    updateNotesList(updated);

    saveTimeoutRef.current = setTimeout(() => {
      setSaveStatus('saved');
    }, 450);
  };

  const activeNote = notes.find(n => n.id === activeNoteId);

  // Filter notes and sort pinned first, then by updatedAt descending
  const filteredNotes = notes
    .filter(n => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        (n.title && n.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (n.content && n.content.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCat = activeCategory === 'all' || n.category === activeCategory;
      return matchesSearch && matchesCat;
    })
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const formatNoteDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const dateStr = d.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
      const timeStr = d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
      return toArabicNumerals(`${dateStr} • ${timeStr}`);
    } catch {
      return '';
    }
  };

  const calculateNoteWords = (text: string) => {
    if (!text || !text.trim()) return 0;
    return text.trim().split(/[\s\n\r\t]+/).filter(w => w.length > 0).length;
  };

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in select-text">
      <AnimatePresence mode="wait">
        {/* =========================================================
            1. نمط القائمة المتكاملة (List View)
            عرض شبكة بطاقات نظيفة لجميع النوتات بدون أي تداخل أو تضييق
            ========================================================= */}
        {viewMode === 'list' ? (
          <motion.div
            key="notes-list-view"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* الترويسة الرئيسية مع زر إضافة ملاحظة جديدة */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] shadow-subtle dark:shadow-subtle-dark">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <StickyNote className="w-5 h-5 text-[var(--color-accent-warm)]" />
                  <h2 className="text-xl md:text-2xl font-display font-bold text-[var(--color-text-primary)]">
                    دفتر الملاحظات والخواطر السريعة
                  </h2>
                </div>
                <p className="text-xs text-[var(--color-text-muted)] font-text">
                  مساحة مريحة لتدوين الأفكار اللحظية، الاقتباسات، والمهام الخاطفة
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-[var(--color-text-secondary)] bg-black/[0.04] dark:bg-white/[0.05] px-3 py-1.5 rounded-xl border border-[var(--color-border-subtle)]">
                  {toArabicNumerals(notes.length)} {notes.length === 1 ? 'ملاحظة' : 'ملاحظات'}
                </span>

                <button
                  type="button"
                  onClick={handleCreateNote}
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#B87B22] to-[#D49838] dark:from-[#A06718] dark:to-[#B87B22] text-white text-xs md:text-sm font-semibold hover:opacity-95 shadow-sm shadow-[#B87B22]/15 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>ملاحظة جديدة</span>
                </button>
              </div>
            </div>

            {/* شريط البحث وفلاتر التصنيفات */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* حقل البحث السريع */}
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-[#8C8476] dark:text-[var(--color-text-muted)] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث في عنوان أو محتوى الملاحظات..."
                    className="w-full pr-10 pl-4 py-2.5 text-xs md:text-sm rounded-2xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] placeholder-[#5C5549] dark:placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-[#C88A2C]/30 focus:border-[#C88A2C]/60 shadow-xs transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#8C8476] hover:text-[var(--color-text-primary)] px-1"
                    >
                      مسح
                    </button>
                  )}
                </div>

                {/* أزرار التصنيفات */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
                  {CATEGORIES.map(cat => {
                    const count = cat === 'all'
                      ? notes.length
                      : notes.filter(n => n.category === cat).length;
                    const isSelected = activeCategory === cat;

                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setActiveCategory(cat)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border",
                          isSelected
                            ? "bg-[var(--color-active-card)] text-[var(--color-accent-warm)] border-[var(--color-active-border)] shadow-xs font-bold"
                            : "bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-active-border)]/40 hover:text-[var(--color-text-primary)]"
                        )}
                      >
                        <span>{cat === 'all' ? 'كافة التصنيفات' : `#${cat}`}</span>
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.2 rounded-full",
                          isSelected
                            ? "bg-[var(--color-accent-warm)] text-white"
                            : "bg-black/[0.05] dark:bg-white/[0.05] text-[var(--color-text-muted)]"
                        )}>
                          {toArabicNumerals(count)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* شبكة البطاقات المرتبة */}
            {filteredNotes.length === 0 ? (
              <div className="p-12 md:p-16 rounded-3xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[var(--color-accent-warm)]/10 text-[var(--color-accent-warm)] flex items-center justify-center mx-auto">
                  <StickyNote className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-[var(--color-text-primary)]">
                    {searchQuery ? 'لا توجد ملاحظات مطابقة لبحثك' : 'لا توجد ملاحظات في هذا التصنيف بعد'}
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] max-w-sm mx-auto mt-1 font-text">
                    {searchQuery
                      ? 'جرب البحث بكلمات أخرى أو اختر تصنيفاً مختلفاً'
                      : 'ابدأ بتفريغ خواطرك وتدوين أول ملاحظة بالنقر على الزر أدناه'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCreateNote}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#B87B22] to-[#D49838] dark:from-[#9E6518] dark:to-[#B87B22] text-white text-xs font-semibold hover:opacity-95 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>إنشاء ملاحظة جديدة الآن</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
                {filteredNotes.map(n => {
                  const words = calculateNoteWords(n.content);
                  return (
                    <div
                      key={n.id}
                      onClick={() => handleOpenNote(n.id)}
                      className={cn(
                        "group relative flex flex-col justify-between p-5 rounded-3xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border transition-all duration-200 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 min-h-[190px]",
                        n.pinned
                          ? "border-[var(--color-active-border)] shadow-xs"
                          : "border-[var(--color-border-subtle)] hover:border-[var(--color-active-border)]/60"
                      )}
                    >
                      <div>
                        {/* ترويسة البطاقة: التصنيف، زر التثبيت، وزر الحذف */}
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[var(--color-active-card)] text-[#8B5814] dark:text-[var(--color-accent-warm)] border border-[var(--color-active-border)]/40">
                            #{n.category || 'أفكار'}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => handleTogglePin(n.id, e)}
                              className={cn(
                                "p-1.5 rounded-lg text-xs transition-colors",
                                n.pinned
                                  ? "text-[var(--color-accent-warm)] bg-[var(--color-accent-warm)]/10"
                                  : "text-[#8C8476] opacity-0 group-hover:opacity-100 hover:text-[var(--color-text-primary)] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                              )}
                              title={n.pinned ? "إلغاء التثبيت" : "تثبيت الملاحظة في البداية"}
                            >
                              <Pin className={cn("w-3.5 h-3.5", n.pinned && "fill-current")} />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => handleDeleteNote(n.id, e)}
                              className="p-1.5 rounded-lg text-xs text-[#8C8476] opacity-0 group-hover:opacity-100 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
                              title="حذف الملاحظة"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* عنوان الملاحظة */}
                        <h3 className="text-base font-display font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-warm)] transition-colors line-clamp-1 mb-1.5">
                          {n.title.trim() ? n.title : 'ملاحظة بدون عنوان'}
                        </h3>

                        {/* مقتطف المحتوى */}
                        <p className="text-xs text-[var(--color-text-secondary)] font-text line-clamp-3 leading-relaxed">
                          {n.content.trim() ? n.content : 'لا يوجد نص مدوّن بعد... اضغط لفتح المحرر والكتابة'}
                        </p>
                      </div>

                      {/* ذيل البطاقة: التاريخ وعدد الكلمات */}
                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-black/[0.05] dark:border-[var(--color-border-subtle)] text-[10px] text-[var(--color-text-muted)] font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#8C8476]" />
                          <span>{formatNoteDate(n.updatedAt)}</span>
                        </span>

                        <span>{formatWordsCount(words)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : (
          /* =========================================================
             2. نمط المحرر المنفصل بالكامل (Dedicated Full Editor View)
             شاشة حصرية واسعة ومريحة لكتابة وتعديل النوتة مع الحفظ التلقائي
             ========================================================= */
          activeNote && (
            <motion.div
              key="notes-editor-view"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.22 }}
              className="rounded-3xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] shadow-xl p-5 sm:p-8 md:p-10 flex flex-col min-h-[calc(100vh-170px)]"
            >
              {/* شريط الإجراءات والتحكم العلوي في صفحة التعديل */}
              <div className="flex-shrink-0 flex items-center justify-between pb-4 border-b border-black/[0.06] dark:border-[var(--color-border-subtle)] mb-5 gap-3 flex-wrap">
                {/* زر العودة لقائمة الملاحظات */}
                <button
                  type="button"
                  onClick={handleBackToList}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] hover:bg-black/[0.08] dark:hover:bg-white/[0.08] text-xs font-semibold text-[var(--color-text-primary)] border border-[var(--color-border-subtle)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ChevronRight className="w-4 h-4 text-[var(--color-accent-warm)]" />
                  <span>العودة لكافة الملاحظات</span>
                </button>

                {/* حالة الحفظ التلقائي الحية */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] bg-black/[0.03] dark:bg-white/[0.03] px-2.5 py-1 rounded-lg">
                    {saveStatus === 'saving' ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-[var(--color-accent-warm)] animate-pulse" />
                        <span className="text-[11px] font-medium">جاري الحفظ...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
                        <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">محفوظ تلقائياً</span>
                      </>
                    )}
                  </div>
                </div>

                {/* أدوات الملاحظة: التصنيف، التثبيت، والحذف */}
                <div className="flex items-center gap-2">
                  {/* اختيار التصنيف */}
                  <select
                    value={activeNote.category}
                    onChange={(e) => handleUpdateActive({ category: e.target.value })}
                    className="text-xs px-2.5 py-1.5 rounded-xl bg-black/[0.04] dark:bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] font-semibold text-[var(--color-text-secondary)] focus:outline-none focus:ring-1 focus:ring-[#C88A2C]/30 focus:border-[#C88A2C]/60"
                  >
                    <option value="أفكار"># أفكار</option>
                    <option value="إلهام"># إلهام</option>
                    <option value="قراءة"># قراءة</option>
                    <option value="مهام"># مهام</option>
                  </select>

                  {/* زر التثبيت */}
                  <button
                    type="button"
                    onClick={() => handleTogglePin(activeNote.id)}
                    className={cn(
                      "p-1.5 rounded-xl text-xs border border-[var(--color-border-subtle)] transition-colors",
                      activeNote.pinned
                        ? "bg-[var(--color-active-card)] text-[var(--color-accent-warm)] border-[var(--color-active-border)]"
                        : "bg-black/[0.03] dark:bg-white/[0.03] text-[#8C8476] hover:text-[var(--color-text-primary)]"
                    )}
                    title={activeNote.pinned ? "إلغاء التثبيت" : "تثبيت الملاحظة في البداية"}
                  >
                    <Pin className={cn("w-4 h-4", activeNote.pinned && "fill-current")} />
                  </button>

                  {/* زر الحذف */}
                  <button
                    type="button"
                    onClick={() => handleDeleteNote(activeNote.id)}
                    className="p-1.5 rounded-xl text-xs border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-colors"
                    title="حذف هذه الملاحظة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* زر الانتهاء */}
                  <button
                    type="button"
                    onClick={handleBackToList}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#B87B22] to-[#D49838] dark:from-[#9E6518] dark:to-[#B87B22] text-white text-xs font-semibold hover:opacity-95 transition-all shadow-xs"
                  >
                    تم
                  </button>
                </div>
              </div>

              {/* حقل عنوان الملاحظة المستقل */}
              <div className="flex-shrink-0 mb-4">
                <input
                  type="text"
                  value={activeNote.title}
                  onChange={(e) => handleUpdateActive({ title: e.target.value })}
                  placeholder="عنوان الملاحظة أو الفكرة..."
                  autoFocus
                  className="w-full text-2xl md:text-3xl font-display font-bold bg-transparent text-[var(--color-text-primary)] placeholder-[#5C5549] dark:placeholder-[var(--color-text-muted)] focus:outline-none tracking-tight py-1"
                />
              </div>

              {/* المساحة الرئيسية الكاملة لكتابة الملاحظة */}
              <div className="flex-1 min-h-[360px] relative flex flex-col">
                <textarea
                  value={activeNote.content}
                  onChange={(e) => handleUpdateActive({ content: e.target.value })}
                  placeholder="اكتب تفاصيل ملاحظتك، خواطرك السريعة، أو روابط واقتباسات بحرية تامة... كل حرف يُحفظ تلقائياً دون انقطاع..."
                  style={{ lineHeight: '1.9' }}
                  className="w-full h-full flex-1 min-h-[360px] bg-transparent resize-none focus:outline-none text-base md:text-lg text-[var(--color-text-primary)] placeholder-[#5C5549] dark:placeholder-[var(--color-text-muted)] font-text overflow-y-auto scrollbar-thin"
                  spellCheck={false}
                />
              </div>

              {/* الشريط السفلي لمعلومات الملاحظة */}
              <div className="flex-shrink-0 flex items-center justify-between pt-4 border-t border-black/[0.06] dark:border-[var(--color-border-subtle)] mt-4 text-xs text-[var(--color-text-muted)] font-mono">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#8C8476]" />
                  <span>آخر تعديل: {formatNoteDate(activeNote.updatedAt)}</span>
                </span>

                <div className="flex items-center gap-3">
                  <span>{formatWordsCount(calculateNoteWords(activeNote.content))}</span>
                  <span>•</span>
                  <span>{toArabicNumerals(activeNote.content.length)} حرف</span>
                </div>
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
};
