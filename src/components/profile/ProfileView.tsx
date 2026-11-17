import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, UserStats, AppSettings, JournalEntry } from '../../types/journal';
import {
  ShieldCheck,
  Feather,
  Flame,
  BookOpen,
  Crown,
  Download,
  Upload,
  RefreshCw,
  Users,
  StickyNote,
  Clock,
  CheckCircle2,
  AlertCircle,
  Database,
  ShieldAlert,
  Sparkles,
  Lock
} from 'lucide-react';
import { toArabicNumerals } from '../../lib/utils';
import { CustomizationStudio } from '../settings/CustomizationStudio';
import {
  exportFullBackupData,
  importFullBackupData,
  fetchAdminSystemStats,
  AdminSystemStats
} from '../../lib/supabaseService';

interface ProfileViewProps {
  user: UserProfile | null;
  stats: UserStats;
  settings: AppSettings;
  onOpenAuth: () => void;
  onToggleTheme: () => void;
  onSetTheme: (theme: 'dark' | 'light') => void;
  onSetNightTheme: (nightTheme: 'sand' | 'sky' | 'palms') => void;
  onSetFont: (font: AppSettings['fontFamily']) => void;
  onSetPaperRuling: (paper: AppSettings['paperRuling']) => void;
  onUpdateSettings?: (partial: Partial<AppSettings>) => void;
  entries?: Record<string, JournalEntry>;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  stats,
  settings,
  onOpenAuth,
  onSetTheme,
  onSetNightTheme,
  onSetFont,
  onSetPaperRuling,
  onUpdateSettings,
  entries,
}) => {
  // Admin stats state
  const [adminStats, setAdminStats] = useState<AdminSystemStats | null>(null);
  const [isLoadingAdminStats, setIsLoadingAdminStats] = useState<boolean>(false);

  // Backup & Restore states
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [backupMessage, setBackupMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch admin stats if user is admin
  useEffect(() => {
    if (user?.isAdmin || user?.role === 'admin') {
      loadAdminMetrics();
    }
  }, [user]);

  const loadAdminMetrics = async () => {
    setIsLoadingAdminStats(true);
    const data = await fetchAdminSystemStats();
    if (data) {
      setAdminStats(data);
    }
    setIsLoadingAdminStats(false);
  };

  // Full Backup Export handler
  const handleExportBackup = async () => {
    if (!user) {
      setBackupMessage({ text: 'يرجى تسجيل الدخول لتصدير نسختك السحابية.', type: 'error' });
      return;
    }

    try {
      setIsExporting(true);
      setBackupMessage(null);
      const payload = await exportFullBackupData(user.id, settings);

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `trmez_full_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setBackupMessage({
        text: `تم تصدير النسخة الاحتياطية بنجاح (${payload.journals.length} تدوينة، ${payload.notes.length} ملاحظة، ${payload.books.length} كتاب، ${payload.focusSessions.length} جلسة تركيز)`,
        type: 'success'
      });
    } catch (err) {
      console.error('Export backup error:', err);
      setBackupMessage({ text: 'حدث خطأ أثناء تصدير النسخة الاحتياطية.', type: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  // Full Backup Import handler
  const handleImportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!user) {
      setBackupMessage({ text: 'يرجى تسجيل الدخول أولاً لاستيراد البيانات إلى حسابك.', type: 'error' });
      return;
    }

    const confirmed = window.confirm('هل أنت متأكد من استيراد هذه النسخة الاحتياطية ودمجها مع بياناتك السحابية؟');
    if (!confirmed) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      setIsImporting(true);
      setBackupMessage(null);

      const fileText = await file.text();
      const parsed = JSON.parse(fileText);

      // Support both full backup format (v2.0) and legacy entries object
      let payloadToImport = parsed;
      if (!parsed.journals && typeof parsed === 'object' && !Array.isArray(parsed)) {
        payloadToImport = {
          version: '2.0',
          exportDate: new Date().toISOString(),
          userId: user.id,
          journals: Object.values(parsed),
          notes: [],
          books: [],
          focusSessions: [],
        };
      }

      const res = await importFullBackupData(user.id, payloadToImport);
      if (res.success) {
        setBackupMessage({
          text: `تم استرجاع البيانات بنجاح: ${res.importedCounts.journals} تدوينة، ${res.importedCounts.notes} ملاحظة، ${res.importedCounts.books} كتاب، ${res.importedCounts.sessions} جلسة تركيز.`,
          type: 'success'
        });
        setTimeout(() => {
          window.location.reload();
        }, 1800);
      } else {
        setBackupMessage({ text: 'تعذر استيراد بعض البيانات، يرجى التأكد من صحة الملف.', type: 'error' });
      }
    } catch (err) {
      console.error('Import backup error:', err);
      setBackupMessage({ text: 'ملف النسخة الاحتياطية غير صالح أو تالف.', type: 'error' });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const isAdmin = user?.isAdmin || user?.role === 'admin';

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in pb-20 select-none">
      {/* Profile Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] shadow-subtle dark:shadow-subtle-dark text-center relative overflow-hidden">
        {/* Admin Golden Glow Ribbon */}
        {isAdmin && (
          <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-amber-400 via-[#E09F3E] to-amber-600 animate-pulse" />
        )}

        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#B87B22] to-[#D49838] dark:from-[#9E6518] dark:to-[#B87B22] text-white flex items-center justify-center mx-auto mb-4 shadow-md shadow-[#B87B22]/15 text-3xl font-serif font-bold relative">
          {user?.name ? user.name[0] : 'ك'}
          {isAdmin && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-xs border border-white">
              <Crown className="w-3.5 h-3.5 fill-current" />
            </div>
          )}
        </div>

        <h3 className="text-2xl font-display font-bold text-[var(--color-text-primary)]">
          {user?.name || 'زائر غير مسجل'}
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] font-mono mt-0.5">
          {user?.email || 'يرجى تسجيل الدخول لحفظ بياناتك'}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
          {isAdmin && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1.5 shadow-xs">
              <Crown className="w-3.5 h-3.5" />
              <span>مسؤول النظام (Admin)</span>
            </span>
          )}

          {user && !user.isGuest ? (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>مزامنة سحابية نشطة (Supabase)</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" />
              <span>غير متصل — الحفظ معطل</span>
            </span>
          )}
        </div>

        <div className="mt-6 flex justify-center gap-2">
          <button
            type="button"
            onClick={onOpenAuth}
            className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-[var(--color-accent-warm)] text-white hover:opacity-90 shadow-sm transition-opacity"
          >
            {user && !user.isGuest ? 'إدارة الحساب وتسجيل الخروج' : 'تسجيل الدخول / إنشاء حساب'}
          </button>
        </div>
      </div>

      {/* Writing Highlights */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-3xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] text-center shadow-subtle dark:shadow-subtle-dark">
          <Feather className="w-4 h-4 text-[var(--color-accent-warm)] mx-auto mb-1" />
          <div className="text-xl font-bold font-sans text-[var(--color-text-primary)]">
            {toArabicNumerals(stats.totalWordsWritten)}
          </div>
          <div className="text-[10px] text-[var(--color-text-muted)]">كلمة مكتوبة</div>
        </div>

        <div className="p-4 rounded-3xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] text-center shadow-subtle dark:shadow-subtle-dark">
          <Flame className="w-4 h-4 text-amber-500 mx-auto mb-1" />
          <div className="text-xl font-bold font-sans text-[var(--color-text-primary)]">
            {toArabicNumerals(stats.currentStreakDays)}
          </div>
          <div className="text-[10px] text-[var(--color-text-muted)]">أيام متتالية</div>
        </div>

        <div className="p-4 rounded-3xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] text-center shadow-subtle dark:shadow-subtle-dark">
          <BookOpen className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
          <div className="text-xl font-bold font-sans text-[var(--color-text-primary)]">
            {toArabicNumerals(stats.totalEntriesCount)}
          </div>
          <div className="text-[10px] text-[var(--color-text-muted)]">صفحة مدوّنة</div>
        </div>
      </div>

      {/* ========================================================
          لوحة تحكم الأدمن المصغرة (Admin Dashboard)
          تظهر فقط إذا كان المستخدم بصلاحية admin
          ======================================================== */}
      {isAdmin && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/[0.04] via-[var(--color-bg-card)] to-amber-600/[0.06] border border-amber-500/25 shadow-subtle dark:shadow-subtle-dark">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-amber-500/20">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center border border-amber-500/30">
                <Crown className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h4 className="text-base font-display font-bold text-[var(--color-text-primary)]">
                  لوحة تحكم مسؤول النظام (Admin Dashboard)
                </h4>
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  إحصاءات شاملة لقاعدة البيانات وحالة حماية RLS
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={loadAdminMetrics}
              disabled={isLoadingAdminStats}
              className="p-2 rounded-xl text-amber-500 hover:bg-amber-500/10 transition-colors"
              title="تحديث بيانات النظام"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingAdminStats ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-black/30 border border-black/[0.06] dark:border-white/[0.06]">
              <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)] mb-1">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span>المستخدمين</span>
              </div>
              <div className="text-lg font-bold font-sans text-[var(--color-text-primary)]">
                {adminStats ? toArabicNumerals(adminStats.totalUsersCount) : '—'}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-black/30 border border-black/[0.06] dark:border-white/[0.06]">
              <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)] mb-1">
                <Feather className="w-3.5 h-3.5 text-emerald-400" />
                <span>اليوميات</span>
              </div>
              <div className="text-lg font-bold font-sans text-[var(--color-text-primary)]">
                {adminStats ? toArabicNumerals(adminStats.totalJournalsCount) : '—'}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-black/30 border border-black/[0.06] dark:border-white/[0.06]">
              <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)] mb-1">
                <StickyNote className="w-3.5 h-3.5 text-amber-400" />
                <span>الملاحظات</span>
              </div>
              <div className="text-lg font-bold font-sans text-[var(--color-text-primary)]">
                {adminStats ? toArabicNumerals(adminStats.totalNotesCount) : '—'}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-black/30 border border-black/[0.06] dark:border-white/[0.06]">
              <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)] mb-1">
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                <span>الكتب</span>
              </div>
              <div className="text-lg font-bold font-sans text-[var(--color-text-primary)]">
                {adminStats ? toArabicNumerals(adminStats.totalBooksCount) : '—'}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-black/30 border border-black/[0.06] dark:border-white/[0.06] col-span-2 md:col-span-1">
              <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)] mb-1">
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                <span>جلسات التركيز</span>
              </div>
              <div className="text-lg font-bold font-sans text-[var(--color-text-primary)]">
                {adminStats ? toArabicNumerals(adminStats.totalFocusSessionsCount) : '—'}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2.5 text-xs text-amber-700 dark:text-amber-300">
            <ShieldCheck className="w-4 h-4 shrink-0 text-amber-500" />
            <span>
              نظام أمان RLS مفعل: جميع الجداول معزولة بالكامل، ولا يمكن لأي مستخدم الاطلاع إلا على سجلاته الخاصة.
            </span>
          </div>
        </div>
      )}

      {/* ========================================================
          قسم النسخ الاحتياطي السحابي الشامل (Backup & Restore)
          ======================================================== */}
      <div className="p-6 rounded-3xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] shadow-subtle dark:shadow-subtle-dark">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-black/[0.06] dark:border-[var(--color-border-subtle)]">
          <div className="w-9 h-9 rounded-2xl bg-[var(--color-accent-warm)]/15 text-[var(--color-accent-warm)] flex items-center justify-center">
            <Database className="w-4.5 h-4.5" />
          </div>
          <div>
            <h4 className="text-base font-display font-bold text-[var(--color-text-primary)]">
              النسخ الاحتياطي والاسترجاع الشامل (Backup & Restore)
            </h4>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              صدّر ملف JSON شامل لكل محتوياتك (يوميات، ملاحظات، كتب، جلسات تركيز) أو استرجعها بضغطة واحدة.
            </p>
          </div>
        </div>

        {backupMessage && (
          <div className={`mb-4 p-3 rounded-2xl flex items-center gap-2.5 text-xs ${
            backupMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300'
          }`}>
            {backupMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{backupMessage.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Export Button */}
          <button
            type="button"
            onClick={handleExportBackup}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.08] text-[var(--color-text-primary)] hover:border-[var(--color-accent-warm)] hover:text-[var(--color-accent-warm)] transition-all shadow-xs disabled:opacity-50"
          >
            <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
            <span>{isExporting ? 'جاري تصدير الملف...' : 'تصدير نسخة احتياطية كاملة (JSON)'}</span>
          </button>

          {/* Import Button */}
          <label className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold bg-[var(--color-accent-warm)]/10 border border-[var(--color-accent-warm)]/25 text-[var(--color-accent-warm)] hover:bg-[var(--color-accent-warm)]/20 transition-all shadow-xs cursor-pointer disabled:opacity-50">
            <Upload className={`w-4 h-4 ${isImporting ? 'animate-spin' : ''}`} />
            <span>{isImporting ? 'جاري الاسترجاع والمزامنة...' : 'استيراد نسخة احتياطية (JSON)'}</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFileChange}
              disabled={isImporting}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* ========================================================
          لوحة التخصيص الدائمة والمثبتة (Permanent Pinned Studio)
          ======================================================== */}
      <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[var(--color-bg-card)] border border-black/[0.07] dark:border-[var(--color-border-subtle)] shadow-subtle dark:shadow-subtle-dark">
        <CustomizationStudio
          settings={settings}
          onSetTheme={onSetTheme}
          onSetNightTheme={onSetNightTheme}
          onSetFont={onSetFont}
          onSetPaperRuling={onSetPaperRuling}
          onUpdateSettings={onUpdateSettings}
          entries={entries}
          compact={false}
        />
      </div>
    </div>
  );
};
