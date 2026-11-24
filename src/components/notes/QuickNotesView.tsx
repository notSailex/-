import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuickNote, UserProfile, ReminderFrequency } from '../../types/journal';
import { loadStoredNotes, saveStoredNotes } from '../../lib/storage';
import { fetchUserNotes, saveUserNote, deleteUserNote } from '../../lib/supabaseService';
import { isNoteReminderOnDate } from '../calendar/Calendar';
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
  FileText,
  PenTool,
  Lock,
  Bell,
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertCircle,
  Repeat,
  X,
  ChevronLeft
} from 'lucide-react';
import { cn, toArabicNumerals, formatWordsCount, getTodayISODate } from '../../lib/utils';
import { StylusCanvas } from '../common/StylusCanvas';

const CATEGORIES = ['all', 'أفكار', 'إلهام', 'قراءة', 'مهام'] as const;

const FREQUENCY_LABELS: Record<ReminderFrequency, string> = {
  once: 'مرة واحدة',
  daily: 'يومياً',
  weekly: 'أسبوعياً',
  monthly: 'شهرياً',
  yearly: 'سنوياً',
};

const ARABIC_MONTH_NAMES = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

const WEEKDAY_SHORT = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

interface NoteCalendarPickerProps {
  selectedDate?: string;
  onSelectDate: (date: string) => void;
  onClose?: () => void;
}

const NoteCalendarPicker: React.FC<NoteCalendarPickerProps> = ({
  selectedDate,
  onSelectDate,
  onClose,
}) => {
  const initialDate = selectedDate ? new Date(selectedDate) : new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth()); // 0-indexed

  const todayStr = getTodayISODate();

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  return (
    <div className="p-3.5 rounded-2xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-amber-500/40 shadow-xl space-y-3 max-w-sm animate-fade-in select-none">
      {/* الترويسة والتنقل بين الشهور */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleNextMonth}
          className="p-1 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-[var(--color-text-secondary)] transition-colors"
          title="الشهر التالي"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="text-xs font-bold font-display text-[var(--color-text-primary)]">
          {ARABIC_MONTH_NAMES[viewMonth]} {toArabicNumerals(viewYear)}
        </div>

        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-1 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-[var(--color-text-secondary)] transition-colors"
          title="الشهر السابق"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* أسماء أيام الأسبوع */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAY_SHORT.map(w => (
          <span key={w} className="text-[10px] font-semibold text-[var(--color-text-muted)]">
            {w}
          </span>
        ))}
      </div>

      {/* شبكة أيام الشهر التفاعلية */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((dayNum, i) => {
          if (!dayNum) {
            return <div key={`empty-${i}`} className="h-7 w-7" />;
          }
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
          const isSelected = selectedDate === dateStr;
          const isToday = todayStr === dateStr;

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelectDate(dateStr)}
              className={cn(
                "h-7 w-7 mx-auto rounded-lg text-xs font-bold flex items-center justify-center transition-all",
                isSelected
                  ? "bg-amber-500 text-black shadow-xs font-black ring-2 ring-amber-300 scale-105"
                  : isToday
                  ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40"
                  : "text-[var(--color-text-primary)] hover:bg-black/[0.05] dark:hover:bg-white/[0.08]"
              )}
            >
              {toArabicNumerals(dayNum)}
            </button>
          );
        })}
      </div>

      {/* شريط الإغلاق والتأكيد */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border-subtle)] text-[10px]">
        <span className="text-amber-800 dark:text-amber-300 truncate font-mono">
          {selectedDate ? `المحدد: ${selectedDate}` : 'اضغط على اليوم لتحديده'}
        </span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 rounded-md bg-amber-500 text-black font-bold hover:bg-amber-400 transition-colors"
          >
            تأكيد الاختيار
          </button>
        )}
      </div>
    </div>
  );
};

interface QuickNotesViewProps {
  user?: UserProfile | null;
  onRequireAuth?: () => void;
}

export const QuickNotesView: React.FC<QuickNotesViewProps> = ({ user, onRequireAuth }) => {
  const [notes, setNotes] = useState<QuickNote[]>(() => (user && !user.isGuest ? loadStoredNotes() : []));
  const [viewMode, setViewMode] = useState<'list' | 'editor'>('list');
  const [editorMode, setEditorMode] = useState<'text' | 'drawing'>('text');
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [isCalendarPickerOpen, setIsCalendarPickerOpen] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Global wipe event listener
  useEffect(() => {
    const handleWipe = () => {
      setNotes([]);
      setActiveNoteId(null);
      setViewMode('list');
    };
    window.addEventListener('trmez_wipe_user_data', handleWipe);
    return () => window.removeEventListener('trmez_wipe_user_data', handleWipe);
  }, []);

  // Reset when user is null or guest
  useEffect(() => {
    if (!user || user.isGuest) {
      setNotes([]);
      setActiveNoteId(null);
      setViewMode('list');
    }
  }, [user]);

  // Sync notes from Supabase when user logs in - Supabase is the single source of truth!
  useEffect(() => {
    if (!user?.id || user.isGuest) return;
    let isMounted = true;
    fetchUserNotes(user.id).then((remoteNotes) => {
      if (!isMounted) return;
      const cleanNotes = (remoteNotes || []).filter(n =>
        n.id !== 'note-1' &&
        n.id !== 'note-2' &&
        n.title !== 'اقتباس اليوم الملهم' &&
        n.title !== 'قائمة كتب الشتاء الهادئ' &&
        !(n.content && n.content.includes('في مديح الظل - جونيشيرو')) &&
        !(n.content && n.content.includes('إن الهدوء ليس غياب الفوضى'))
      );
      setNotes(cleanNotes);
      saveStoredNotes(cleanNotes);
    });
    return () => {
      isMounted = false;
    };
  }, [user?.id, user?.isGuest]);

  // Sync notes to localStorage
  const updateNotesList = (updated: QuickNote[]) => {
    setNotes(updated);
    if (user && !user.isGuest) {
      saveStoredNotes(updated);
    }
  };

  // Create a brand new note and immediately open it in the full editor
  const handleCreateNote = () => {
    if (!user || user.isGuest) {
      onRequireAuth?.();
      return;
    }

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

    if (user?.id) {
      saveUserNote(user.id, newNote);
    }
  };

  // Open existing note in full editor
  const handleOpenNote = (id: string) => {
    if (!user || user.isGuest) {
      onRequireAuth?.();
      return;
    }
    setActiveNoteId(id);
    setViewMode('editor');
  };

  // Return to list view
  const handleBackToList = () => {
    setViewMode('list');
    setActiveNoteId(null);
  };

  // Delete note
  const handleDeleteNote = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user || user.isGuest) {
      onRequireAuth?.();
      return;
    }
    const updated = notes.filter(n => n.id !== id);
    updateNotesList(updated);
    if (activeNoteId === id) {
      handleBackToList();
    }
    if (user?.id) {
      await deleteUserNote(user.id, id);
    }
  };

  // Toggle pin
  const handleTogglePin = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user) {
      onRequireAuth?.();
      return;
    }
    const updated = notes.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n);
    updateNotesList(updated);
    const target = updated.find(n => n.id === id);
    if (user?.id && target) {
      saveUserNote(user.id, target);
    }
  };

  // Update note content (auto-save)
  const handleUpdateActive = (partial: Partial<QuickNote>) => {
    if (!activeNoteId) return;
    if (!user) {
      onRequireAuth?.();
      return;
    }

    setSaveStatus('saving');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    const nowIso = new Date().toISOString();
    let updatedNoteRef: QuickNote | null = null;

    const updated = notes.map(n => {
      if (n.id === activeNoteId) {
        const item = { ...n, ...partial, updatedAt: nowIso };
        updatedNoteRef = item;
        return item;
      }
      return n;
    });

    updateNotesList(updated);

    saveTimeoutRef.current = setTimeout(async () => {
      if (user?.id && updatedNoteRef) {
        await saveUserNote(user.id, updatedNoteRef);
      }
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

  const todayIso = getTodayISODate();
  const dueTodayNotes = notes.filter(n => isNoteReminderOnDate(n, todayIso));

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
            {/* تنبيه الزائر */}
            {(!user || user.isGuest) && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-medium">
                  <Lock className="w-4 h-4 shrink-0 text-amber-500" />
                  <span>أنت تتصفح كزائر الخزينة — سجّل دخولك لكتابة وحفظ خواطرك وملاحظاتك بأمان على السحابة</span>
                </div>
                <button
                  type="button"
                  onClick={onRequireAuth}
                  className="px-4 py-2 rounded-xl font-bold bg-[var(--color-accent-warm)] text-white hover:opacity-90 shrink-0 shadow-xs text-xs"
                >
                  تسجيل الدخول / إنشاء حساب
                </button>
              </div>
            )}

            {/* شريط التنبيهات المستحقة لليوم */}
            {dueTodayNotes.length > 0 && (
              <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-500/5 border border-amber-500/30 shadow-xs flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 text-amber-800 dark:text-amber-200">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4 animate-bounce" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[var(--color-text-primary)] flex items-center gap-2">
                      <span>تذكيرات مستحقة اليوم في جدولك</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-white font-mono">
                        {toArabicNumerals(dueTodayNotes.length)}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                      {dueTodayNotes.map(n => n.title.trim() ? n.title : 'ملاحظة بدون عنوان').join(' • ')}
                    </div>
                  </div>
                </div>
              </div>
            )}

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

                        {/* شارة التذكير المجدول إن وُجد */}
                        {n.reminderDate && (
                          <div className="flex items-center gap-1.5 mt-2.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-700 dark:text-amber-300 w-fit">
                            <Bell className="w-3 h-3 text-amber-500 shrink-0" />
                            <span className="font-mono">{n.reminderDate}</span>
                            {n.reminderTime && <span>• {n.reminderTime}</span>}
                            {n.reminderFrequency && n.reminderFrequency !== 'once' && (
                              <span className="text-[9px] bg-amber-500/20 px-1.5 py-0.2 rounded-md font-bold">
                                {FREQUENCY_LABELS[n.reminderFrequency]}
                              </span>
                            )}
                          </div>
                        )}

                        {/* رسمة القلم المرفقة (إن وُجدت) */}
                        {n.drawingData && (
                          <div className="mt-2.5 p-1.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-[var(--color-border-subtle)] flex items-center justify-center h-16 overflow-hidden">
                            <img src={n.drawingData} alt="رسمة مرفقة" className="max-h-full object-contain opacity-90" />
                          </div>
                        )}
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

                {/* أدوات الملاحظة: التبديل بين النص والرسم، التصنيف، التثبيت، والحذف */}
                <div className="flex items-center gap-2">
                  {/* زر التبديل بين النص والرسم */}
                  <div className="flex items-center bg-black/[0.04] dark:bg-[var(--color-bg-surface)] p-0.5 rounded-xl border border-[var(--color-border-subtle)]">
                    <button
                      type="button"
                      onClick={() => setEditorMode('text')}
                      className={cn(
                        "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all",
                        editorMode === 'text'
                          ? "bg-[var(--color-accent-warm)] text-white shadow-xs"
                          : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                      )}
                      title="كتابة نصية"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">نص</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditorMode('drawing')}
                      className={cn(
                        "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all",
                        editorMode === 'drawing'
                          ? "bg-[var(--color-accent-warm)] text-white shadow-xs"
                          : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                      )}
                      title="رسم بالقلم الذكي"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">رسم</span>
                    </button>
                  </div>

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

                  {/* زر التذكير والتنبيه */}
                  <button
                    type="button"
                    onClick={() => setIsReminderOpen(!isReminderOpen)}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all",
                      activeNote.reminderDate || isReminderOpen
                        ? "bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300 font-bold shadow-xs"
                        : "bg-black/[0.03] dark:bg-white/[0.03] border-[var(--color-border-subtle)] text-[#8C8476] hover:text-[var(--color-text-primary)]"
                    )}
                    title="جدولة تذكير وتنبيه للملاحظة بالتقويم"
                  >
                    <Bell className={cn("w-3.5 h-3.5", activeNote.reminderDate ? "fill-amber-500 text-amber-500" : "")} />
                    <span className="hidden sm:inline">
                      {activeNote.reminderDate ? 'تذكير مجدول' : 'تذكير'}
                    </span>
                  </button>

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

              {/* لوحة ضبط التذكير والتنبيه للملاحظة */}
              {(isReminderOpen || activeNote.reminderDate) && (
                <div className="flex-shrink-0 p-4 rounded-2xl bg-amber-500/[0.08] dark:bg-amber-950/20 border border-amber-500/30 space-y-3 mb-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                      <Bell className="w-4 h-4 text-amber-500" />
                      <span>جدولة تنبيه وتذكير للملاحظة (يظهر بالتقويم الرئيسي)</span>
                    </div>
                    {activeNote.reminderDate && (
                      <button
                        type="button"
                        onClick={() => {
                          handleUpdateActive({
                            reminderDate: undefined,
                            reminderTime: undefined,
                            reminderFrequency: undefined,
                          });
                        }}
                        className="text-[11px] text-rose-500 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>إلغاء التذكير</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* التاريخ مع إمكانية فتح التقويم البصري الشهري مباشرة */}
                    <div className="relative">
                      <label className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 block mb-1">
                        تاريخ التذكير (اضغط لفتح التقويم)
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCalendarPickerOpen(prev => !prev)}
                        className="w-full flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-amber-500/35 text-[var(--color-text-primary)] hover:border-amber-500 transition-colors shadow-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <CalendarIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="font-mono text-xs font-semibold">
                            {activeNote.reminderDate || 'اضغط لاختيار اليوم من التقويم...'}
                          </span>
                        </div>
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold shrink-0">
                          {isCalendarPickerOpen ? 'إغلاق' : 'عرض التقويم 📅'}
                        </span>
                      </button>

                      {/* التقويم البصري التفاعلي المنبثق */}
                      {isCalendarPickerOpen && (
                        <div className="absolute top-full mt-2 right-0 z-50">
                          <NoteCalendarPicker
                            selectedDate={activeNote.reminderDate}
                            onSelectDate={(pickedDate) => {
                              handleUpdateActive({
                                reminderDate: pickedDate,
                                reminderFrequency: activeNote.reminderFrequency || 'once',
                              });
                              setIsCalendarPickerOpen(false);
                            }}
                            onClose={() => setIsCalendarPickerOpen(false)}
                          />
                        </div>
                      )}
                    </div>

                    {/* الوقت (اختياري) */}
                    <div>
                      <label className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 block mb-1">
                        الوقت (اختياري)
                      </label>
                      <input
                        type="time"
                        value={activeNote.reminderTime || ''}
                        onChange={(e) => handleUpdateActive({ reminderTime: e.target.value })}
                        className="w-full text-xs px-3 py-2 rounded-xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-amber-500/30 text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    {/* نمط التكرار */}
                    <div>
                      <label className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 block mb-1">
                        نمط التكرار
                      </label>
                      <select
                        value={activeNote.reminderFrequency || 'once'}
                        onChange={(e) => handleUpdateActive({ reminderFrequency: e.target.value as ReminderFrequency })}
                        className="w-full text-xs px-3 py-2 rounded-xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-amber-500/30 text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                      >
                        <option value="once">مرة واحدة فقط</option>
                        <option value="daily">يومياً (تذكير دائم)</option>
                        <option value="weekly">أسبوعياً (كل أسبوع)</option>
                        <option value="monthly">شهرياً (نفس اليوم من كل شهر)</option>
                        <option value="yearly">سنوياً (ذكرى سنوية)</option>
                      </select>
                    </div>
                  </div>

                  {/* اختصارات سريعة */}
                  <div className="flex items-center gap-2 pt-1 overflow-x-auto text-xs">
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold shrink-0">اختيار سريع:</span>
                    <button
                      type="button"
                      onClick={() => setIsCalendarPickerOpen(prev => !prev)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/25 hover:bg-amber-500/35 text-amber-950 dark:text-amber-100 text-[11px] font-bold transition-colors flex items-center gap-1 shrink-0"
                    >
                      <CalendarIcon className="w-3 h-3 text-amber-600 dark:text-amber-300" />
                      <span>عرض التقويم الشهري 📅</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const today = getTodayISODate();
                        handleUpdateActive({ reminderDate: today, reminderFrequency: activeNote.reminderFrequency || 'once' });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-200 text-[11px] transition-colors"
                    >
                      اليوم
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        handleUpdateActive({ reminderDate: tomorrow.toISOString().slice(0, 10), reminderFrequency: activeNote.reminderFrequency || 'once' });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-200 text-[11px] transition-colors"
                    >
                      غداً
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const nextWeek = new Date();
                        nextWeek.setDate(nextWeek.getDate() + 7);
                        handleUpdateActive({ reminderDate: nextWeek.toISOString().slice(0, 10), reminderFrequency: activeNote.reminderFrequency || 'once' });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-200 text-[11px] transition-colors"
                    >
                      الأسبوع القادم
                    </button>
                  </div>
                </div>
              )}

              {/* المساحة الرئيسية للملاحظة: نصية أو رسم حر بالقلم */}
              <div className="flex-1 min-h-[380px] relative flex flex-col">
                {editorMode === 'drawing' ? (
                  <div className="flex-1 flex flex-col min-h-[400px] space-y-2">
                    <StylusCanvas
                      initialDataUrl={activeNote.drawingData}
                      onSave={(dataUrl) => handleUpdateActive({ drawingData: dataUrl })}
                      onClear={() => handleUpdateActive({ drawingData: undefined })}
                      height={400}
                    />
                    <p className="text-[11px] text-[var(--color-text-muted)] text-center">
                      يتم حفظ الرسمة بالقلم تلقائياً ضمن الملاحظة السريعة.
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col min-h-[360px]">
                    <textarea
                      value={activeNote.content}
                      onChange={(e) => handleUpdateActive({ content: e.target.value })}
                      placeholder="اكتب تفاصيل ملاحظتك، خواطرك السريعة، أو روابط واقتباسات بحرية تامة... كل حرف يُحفظ تلقائياً دون انقطاع..."
                      style={{ lineHeight: '1.9' }}
                      className="w-full flex-1 min-h-[260px] bg-transparent resize-none focus:outline-none text-base md:text-lg text-[var(--color-text-primary)] placeholder-[#5C5549] dark:placeholder-[var(--color-text-muted)] font-text overflow-y-auto scrollbar-thin"
                      spellCheck={false}
                    />

                    {/* عرض الرسمة المرفقة بالملاحظة إذا كانت موجودة */}
                    {activeNote.drawingData && (
                      <div className="mt-4 p-3 rounded-2xl border border-[var(--color-border-subtle)] bg-black/[0.02] dark:bg-[var(--color-bg-base)]/40 relative">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--color-border-subtle)] text-xs text-[var(--color-text-muted)]">
                          <span className="flex items-center gap-1.5">
                            <PenTool className="w-3.5 h-3.5 text-[var(--color-accent-warm)]" />
                            <span>رسمة مرفقة بالملاحظة</span>
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setEditorMode('drawing')}
                              className="text-xs text-[var(--color-accent-warm)] font-semibold hover:underline"
                            >
                              تعديل بالقلم
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateActive({ drawingData: undefined })}
                              className="text-xs text-rose-500 hover:underline"
                            >
                              حذف الرسمة
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-center p-2">
                          <img
                            src={activeNote.drawingData}
                            alt="رسمة الملاحظة"
                            className="max-h-60 rounded-xl object-contain shadow-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
