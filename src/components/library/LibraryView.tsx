import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookItem, ReadingStatus } from '../../types/journal';
import { loadStoredBooks, saveStoredBooks } from '../../lib/storage';
import { compressImage, toArabicNumerals } from '../../lib/utils';
import {
  Library,
  Plus,
  Star,
  BookOpen,
  CheckCircle2,
  Clock,
  CircleDot,
  Upload,
  X,
  Trash2,
  Edit3,
  Calendar,
  Sparkles,
  ChevronLeft,
  Filter
} from 'lucide-react';
import { cn } from '../../lib/utils';

type FilterStatus = 'all' | ReadingStatus;

const DEFAULT_COVER_PRESETS = [
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&q=80',
  'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&q=80',
];

const STATUS_CONFIG: Record<ReadingStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  completed: {
    label: 'مكتملة',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    icon: CheckCircle2,
  },
  reading: {
    label: 'تحت القراءة',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10 border-amber-500/20',
    icon: Clock,
  },
  unread: {
    label: 'لم يبدأ',
    color: 'text-slate-400',
    bg: 'bg-slate-500/10 border-slate-500/20',
    icon: CircleDot,
  },
};

export const LibraryView: React.FC = () => {
  const [books, setBooks] = useState<BookItem[]>(() => loadStoredBooks());
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [selectedBookForDetails, setSelectedBookForDetails] = useState<BookItem | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formAuthor, setFormAuthor] = useState('');
  const [formCoverImage, setFormCoverImage] = useState(DEFAULT_COVER_PRESETS[0]);
  const [formStatus, setFormStatus] = useState<ReadingStatus>('reading');
  const [formRating, setFormRating] = useState<number>(5);
  const [formFinishedDate, setFormFinishedDate] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formError, setFormError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync to localStorage
  const updateBooksList = (updated: BookItem[]) => {
    setBooks(updated);
    saveStoredBooks(updated);
  };

  // Filtered books
  const filteredBooks = books.filter(b => {
    if (activeFilter === 'all') return true;
    return b.status === activeFilter;
  });

  // Chunk books onto shelves (3 to 4 books per shelf on desktop, 2 to 3 on mobile)
  const booksPerShelf = 4;
  const shelves: BookItem[][] = [];
  for (let i = 0; i < filteredBooks.length; i += booksPerShelf) {
    shelves.push(filteredBooks.slice(i, i + booksPerShelf));
  }
  // Ensure at least 2 shelves for arch visual elegance
  while (shelves.length < 2) {
    shelves.push([]);
  }

  // Handle Cover Upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 800, 0.75);
      setFormCoverImage(compressed);
    } catch (err) {
      console.error('Failed to compress cover image', err);
    }
  };

  // Open Add Book Modal
  const handleOpenAddModal = () => {
    setEditingBookId(null);
    setFormTitle('');
    setFormAuthor('');
    setFormCoverImage(DEFAULT_COVER_PRESETS[Math.floor(Math.random() * DEFAULT_COVER_PRESETS.length)]);
    setFormStatus('reading');
    setFormRating(5);
    setFormFinishedDate('');
    setFormSummary('');
    setFormError('');
    setIsAddModalOpen(true);
  };

  // Open Edit Book Modal
  const handleOpenEditModal = (book: BookItem) => {
    setEditingBookId(book.id);
    setFormTitle(book.title);
    setFormAuthor(book.author || '');
    setFormCoverImage(book.coverImage);
    setFormStatus(book.status);
    setFormRating(book.rating || 5);
    setFormFinishedDate(book.finishedDate || '');
    setFormSummary(book.summary || '');
    setFormError('');
    setSelectedBookForDetails(null);
    setIsAddModalOpen(true);
  };

  // Save Book (Add or Edit)
  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('يرجى كتابة اسم الكتاب.');
      return;
    }
    if (!formCoverImage.trim()) {
      setFormError('يرجى اختيار أو رفع صورة غلاف للكتاب.');
      return;
    }

    if (editingBookId) {
      // Edit existing
      const updated = books.map(b => {
        if (b.id === editingBookId) {
          return {
            ...b,
            title: formTitle.trim(),
            author: formAuthor.trim() || undefined,
            coverImage: formCoverImage,
            status: formStatus,
            rating: formRating,
            finishedDate: formFinishedDate || undefined,
            summary: formSummary.trim() || undefined,
            updatedAt: new Date().toISOString(),
          };
        }
        return b;
      });
      updateBooksList(updated);
    } else {
      // Create new
      const newBook: BookItem = {
        id: `book-${Date.now()}`,
        title: formTitle.trim(),
        author: formAuthor.trim() || undefined,
        coverImage: formCoverImage,
        status: formStatus,
        rating: formRating,
        finishedDate: formFinishedDate || undefined,
        summary: formSummary.trim() || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updateBooksList([newBook, ...books]);
    }

    setIsAddModalOpen(false);
  };

  // Delete Book
  const handleDeleteBook = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الكتاب من رفوف مكتبتك؟')) {
      const updated = books.filter(b => b.id !== id);
      updateBooksList(updated);
      setSelectedBookForDetails(null);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in pb-20 select-none">
      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] shadow-subtle dark:shadow-subtle-dark">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Library className="w-5 h-5 text-[var(--color-accent-warm)]" />
            <h2 className="text-xl md:text-2xl font-display font-bold text-[var(--color-text-primary)]">
              مكتبتي الأدبية
            </h2>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] font-text">
            توثيق مسيرتك القرائية، تقييم الكتب، وتلخيص الأفكار على رفوف مقوّسة دافئة
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[var(--color-text-secondary)] bg-black/[0.04] dark:bg-white/[0.05] px-3 py-1.5 rounded-xl border border-[var(--color-border-subtle)]">
            {toArabicNumerals(books.length)} {books.length === 1 ? 'كتاب' : 'كتب'}
          </span>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#B87B22] to-[#D49838] dark:from-[#9E6518] dark:to-[#B87B22] text-white text-xs md:text-sm font-semibold hover:opacity-95 shadow-sm shadow-[#B87B22]/15 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>إضافة كتاب للرف</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(['all', 'reading', 'completed', 'unread'] as FilterStatus[]).map(status => {
          const isSelected = activeFilter === status;
          const count = status === 'all' ? books.length : books.filter(b => b.status === status).length;
          const label = status === 'all' ? 'كافة الكتب' : STATUS_CONFIG[status as ReadingStatus].label;

          return (
            <button
              key={status}
              type="button"
              onClick={() => setActiveFilter(status)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold border transition-all whitespace-nowrap active:scale-95",
                isSelected
                  ? "bg-[var(--color-active-card)] text-[var(--color-accent-warm)] border-[1.5px] border-[var(--color-active-border)] shadow-xs font-bold"
                  : "bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)]"
              )}
            >
              <span>{label}</span>
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full",
                isSelected
                  ? "bg-[var(--color-accent-warm)]/15 text-[var(--color-accent-warm)]"
                  : "bg-black/[0.04] dark:bg-white/[0.06] text-[var(--color-text-muted)]"
              )}>
                {toArabicNumerals(count)}
              </span>
            </button>
          );
        })}
      </div>

      {/* ========================================================
          واجهة رفوف الكتب المقوّسة (The Arch Bookshelf Frame)
          ======================================================== */}
      <div className="relative w-full rounded-t-[60px] md:rounded-t-[100px] rounded-b-3xl p-5 md:p-10 bg-gradient-to-b from-[#2E251E] via-[#211B15] to-[#171310] dark:from-[var(--color-bg-card)] dark:via-[var(--color-bg-surface)] dark:to-[var(--color-bg-base)] border border-black/10 dark:border-white/[0.08] shadow-2xl overflow-hidden">
        {/* Arch Crown Top Curve Glow & Illumination */}
        <div
          className="absolute -top-12 inset-x-1/4 h-36 rounded-full opacity-60 dark:opacity-40 blur-2xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #D49838 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        {/* Arch Header Ornament */}
        <div className="flex flex-col items-center justify-center mb-8 relative z-10">
          <div className="w-12 h-1 bg-gradient-to-r from-transparent via-[#D49838] to-transparent rounded-full mb-2 opacity-80" />
          <span className="text-xs uppercase tracking-widest text-[#D49838] font-serif font-bold">
            خزانة الكتب والقراءات
          </span>
        </div>

        {/* Shelves Column */}
        <div className="space-y-12 sm:space-y-16 relative z-10 pt-2">
          {shelves.map((shelfBooks, shelfIndex) => (
            <div key={shelfIndex} className="relative">
              {/* Books Grid on this Shelf */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 px-3 sm:px-6 pb-2 min-h-[190px] sm:min-h-[230px] items-end">
                {shelfBooks.map(book => {
                  const statusConfig = STATUS_CONFIG[book.status];
                  return (
                    <motion.div
                      key={book.id}
                      whileHover={{ y: -8, scale: 1.03 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setSelectedBookForDetails(book)}
                      className="group relative cursor-pointer flex flex-col items-center"
                    >
                      {/* Book Cover Container with 3D Spine and Realistic Aspect Ratio */}
                      <div className="relative w-28 sm:w-34 aspect-[2/3] rounded-lg sm:rounded-xl overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.6)] border border-white/10 group-hover:shadow-[0_16px_30px_rgba(212,152,56,0.25)] transition-all duration-300">
                        {/* Book Spine Highlight Overlay */}
                        <div className="absolute inset-y-0 right-0 w-2.5 bg-gradient-to-l from-black/40 via-white/10 to-transparent pointer-events-none z-10" />

                        {/* Status Badge */}
                        <div className="absolute top-2 right-2 z-10">
                          <span className={cn(
                            "px-1.5 py-0.5 rounded-md text-[9px] font-bold border backdrop-blur-md",
                            statusConfig.bg,
                            statusConfig.color
                          )}>
                            {statusConfig.label}
                          </span>
                        </div>

                        {/* Rating Badge */}
                        {book.rating && (
                          <div className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-md flex items-center gap-0.5 text-[10px] text-amber-400 font-bold">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            <span>{toArabicNumerals(book.rating)}</span>
                          </div>
                        )}

                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>

                      {/* Book Title & Author under Cover */}
                      <div className="w-full max-w-[130px] text-center mt-2.5">
                        <h4 className="text-xs font-serif font-bold text-white group-hover:text-[var(--color-accent-warm)] transition-colors truncate">
                          {book.title}
                        </h4>
                        {book.author && (
                          <p className="text-[10px] text-stone-400 truncate mt-0.5">
                            {book.author}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}

                {/* Empty Shelf Placeholder if this is the last shelf and empty */}
                {shelfBooks.length === 0 && (
                  <div className="col-span-full flex items-center justify-center h-28 text-xs text-stone-500 italic">
                    رف هادئ ينتظر إضافتك القادمة...
                  </div>
                )}
              </div>

              {/* Physical Wooden Shelf Ledge (الرف الخشبي ذو العمق والظلال) */}
              <div className="relative w-full h-4 sm:h-5 rounded-md bg-gradient-to-r from-[#3D2E1F] via-[#735436] to-[#3D2E1F] dark:from-[#2B2117] dark:via-[#473625] dark:to-[#2B2117] shadow-[0_8px_16px_rgba(0,0,0,0.8)] border-t border-[#A88258]/30">
                {/* Top wood sheen line */}
                <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#E8B878]/60 to-transparent" />
                {/* Bottom shelf shadow */}
                <div className="absolute -bottom-3 inset-x-2 h-3 bg-black/40 blur-xs rounded-full pointer-events-none" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================
          نافذة إضافة / تعديل كتاب (Add / Edit Book Modal)
          ======================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] rounded-3xl border border-[var(--color-border-subtle)] shadow-2xl p-6 sm:p-8">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 left-5 p-1.5 rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-[var(--color-border-subtle)]">
              <div className="w-10 h-10 rounded-2xl bg-[var(--color-accent-warm)]/10 text-[var(--color-accent-warm)] flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-[var(--color-text-primary)]">
                  {editingBookId ? 'تعديل بيانات الكتاب' : 'إضافة كتاب جديد للرف'}
                </h3>
                <p className="text-xs text-[var(--color-text-muted)]">
                  سجل تفاصيل كتابك، غلافه، ملخصك وتقييمك
                </p>
              </div>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveBook} className="space-y-4">
              {/* Cover Image Picker & Upload */}
              <div>
                <label className="text-xs font-semibold text-[var(--color-text-secondary)] block mb-2">
                  صورة غلاف الكتاب <span className="text-rose-500">*</span>
                </label>

                <div className="flex items-center gap-4">
                  {/* Selected Preview */}
                  <div className="w-20 aspect-[2/3] rounded-xl overflow-hidden border border-[var(--color-border-subtle)] shadow-md bg-black/10 shrink-0">
                    <img src={formCoverImage} alt="غلاف" className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 space-y-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/[0.04] dark:bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] hover:border-[var(--color-active-border)]/50 text-xs font-semibold text-[var(--color-text-primary)] transition-all"
                    >
                      <Upload className="w-3.5 h-3.5 text-[var(--color-accent-warm)]" />
                      <span>رفع صورة غلاف من الجهاز</span>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleCoverUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    {/* Quick Presets */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-[var(--color-text-muted)]">أو اختر:</span>
                      {DEFAULT_COVER_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormCoverImage(preset)}
                          className={cn(
                            "w-6 h-6 rounded-md overflow-hidden border transition-all",
                            formCoverImage === preset ? "ring-2 ring-[var(--color-accent-warm)] scale-110" : "opacity-60 hover:opacity-100"
                          )}
                        >
                          <img src={preset} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Title Input (Required) */}
              <div>
                <label className="text-xs font-semibold text-[var(--color-text-secondary)] block mb-1">
                  اسم الكتاب <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="مثال: في مديح الظل"
                  required
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-black/[0.03] dark:bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-xs font-semibold text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-warm)]"
                />
              </div>

              {/* Author Input (Optional) */}
              <div>
                <label className="text-xs font-semibold text-[var(--color-text-secondary)] block mb-1">
                  اسم المؤلف (اختياري)
                </label>
                <input
                  type="text"
                  value={formAuthor}
                  onChange={(e) => setFormAuthor(e.target.value)}
                  placeholder="مثال: جونيشيرو تانيزاكي"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-black/[0.03] dark:bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-warm)]"
                />
              </div>

              {/* Reading Status (Required) */}
              <div>
                <label className="text-xs font-semibold text-[var(--color-text-secondary)] block mb-1.5">
                  حالة القراءة <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['reading', 'completed', 'unread'] as ReadingStatus[]).map(st => {
                    const isSelected = formStatus === st;
                    const conf = STATUS_CONFIG[st];
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setFormStatus(st)}
                        className={cn(
                          "py-2 px-2.5 rounded-2xl border text-xs font-semibold transition-all text-center",
                          isSelected
                            ? "bg-[var(--color-active-card)] text-[var(--color-accent-warm)] border-[1.5px] border-[var(--color-active-border)] shadow-xs"
                            : "bg-black/[0.02] dark:bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)]"
                        )}
                      >
                        {conf.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Star Rating (Optional 1-5) */}
              <div>
                <label className="text-xs font-semibold text-[var(--color-text-secondary)] block mb-1.5">
                  التقييم بالنجوم (اختياري)
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map(starNum => (
                    <button
                      key={starNum}
                      type="button"
                      onClick={() => setFormRating(starNum)}
                      className="p-1 text-amber-400 hover:scale-125 transition-transform"
                    >
                      <Star className={cn("w-6 h-6", starNum <= formRating ? "fill-current" : "stroke-current fill-none opacity-40")} />
                    </button>
                  ))}
                  <span className="text-xs font-mono text-[var(--color-text-muted)] ms-2">
                    {toArabicNumerals(formRating)} من ٥
                  </span>
                </div>
              </div>

              {/* Finished Date (Optional) */}
              {formStatus === 'completed' && (
                <div>
                  <label className="text-xs font-semibold text-[var(--color-text-secondary)] block mb-1">
                    تاريخ الانتهاء من القراءة (اختياري)
                  </label>
                  <input
                    type="date"
                    value={formFinishedDate}
                    onChange={(e) => setFormFinishedDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-2xl bg-black/[0.03] dark:bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-xs text-[var(--color-text-primary)] focus:outline-none"
                  />
                </div>
              )}

              {/* Summary / Review Textarea (Optional) */}
              <div>
                <label className="text-xs font-semibold text-[var(--color-text-secondary)] block mb-1">
                  ملخص أو رأي شخصي عن الكتاب (اختياري)
                </label>
                <textarea
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  placeholder="دوّن هنا أبرز أفكار الكتاب، اقتباساً لافتاً، أو رأيك النقدي في أسلوب الكاتب..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-black/[0.03] dark:bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none font-text resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-[var(--color-border-subtle)] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#B87B22] to-[#D49838] dark:from-[#9E6518] dark:to-[#B87B22] text-white text-xs font-bold hover:opacity-95 shadow-sm transition-all"
                >
                  {editingBookId ? 'حفظ التعديلات' : 'إضافة الكتاب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          نافذة عرض التفاصيل الكاملة للكتاب (Book Details Card Modal)
          ======================================================== */}
      {selectedBookForDetails && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedBookForDetails(null)}
        >
          <div
            className="relative w-full max-w-xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] rounded-3xl border border-[var(--color-border-subtle)] shadow-2xl p-6 sm:p-8 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              type="button"
              onClick={() => setSelectedBookForDetails(null)}
              className="absolute top-5 left-5 p-1.5 rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row gap-6">
              {/* Cover with 3D Spine and glow */}
              <div className="w-32 sm:w-40 aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl shrink-0 mx-auto sm:mx-0">
                <img
                  src={selectedBookForDetails.coverImage}
                  alt={selectedBookForDetails.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Book Info */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-bold border",
                    STATUS_CONFIG[selectedBookForDetails.status].bg,
                    STATUS_CONFIG[selectedBookForDetails.status].color
                  )}>
                    {STATUS_CONFIG[selectedBookForDetails.status].label}
                  </span>

                  {selectedBookForDetails.rating && (
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{toArabicNumerals(selectedBookForDetails.rating)} / ٥</span>
                    </div>
                  )}
                </div>

                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[var(--color-text-primary)]">
                  {selectedBookForDetails.title}
                </h3>

                {selectedBookForDetails.author && (
                  <p className="text-xs text-[var(--color-text-secondary)] font-medium">
                    المؤلف: {selectedBookForDetails.author}
                  </p>
                )}

                {selectedBookForDetails.finishedDate && (
                  <p className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[var(--color-accent-warm)]" />
                    <span>تاريخ الانتهاء: {selectedBookForDetails.finishedDate}</span>
                  </p>
                )}

                {/* Literary Summary / Review */}
                {selectedBookForDetails.summary && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-black/[0.02] dark:bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-xs text-[var(--color-text-secondary)] font-text leading-relaxed">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent-warm)] mb-1">
                      ملخص ورأي القارئ
                    </div>
                    {selectedBookForDetails.summary}
                  </div>
                )}
              </div>
            </div>

            {/* Actions: Edit & Delete */}
            <div className="mt-6 pt-4 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleDeleteBook(selectedBookForDetails.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/20 text-rose-500 text-xs font-semibold hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف الكتاب</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenEditModal(selectedBookForDetails)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black/[0.04] dark:bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] hover:border-[var(--color-active-border)]/50 text-xs font-semibold text-[var(--color-text-primary)] transition-all"
              >
                <Edit3 className="w-3.5 h-3.5 text-[var(--color-accent-warm)]" />
                <span>تعديل التفاصيل</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
