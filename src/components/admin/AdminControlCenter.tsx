import React, { useState, useEffect } from 'react';
import {
  Crown,
  Users,
  Feather,
  StickyNote,
  BookOpen,
  Clock,
  RefreshCw,
  ShieldCheck,
  Megaphone,
  Radio,
  Star,
  Activity,
  Download,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  UserCheck,
  UserX,
  Trash2,
  Plus,
  Send,
  Sliders,
  ChevronLeft
} from 'lucide-react';
import { UserProfile, BookItem, AppSettings } from '../../types/journal';
import {
  fetchAdminSystemStats,
  AdminSystemStats,
  fetchAllUsers,
  AdminUserRecord,
  updateUserRole,
  checkDatabasePing,
  GlobalAnnouncement,
  loadStoredAnnouncement,
  saveStoredAnnouncement,
  loadStoredFeaturedBooks,
  saveStoredFeaturedBooks,
  exportFullBackupData
} from '../../lib/supabaseService';
import { toArabicNumerals } from '../../lib/utils';

interface AdminControlCenterProps {
  user: UserProfile | null;
  settings: AppSettings;
  onNavigateTab: (tab: any) => void;
  onRefreshUserData?: () => void;
}

type AdminSubTab = 'overview' | 'users' | 'broadcast' | 'featured_books';

export const AdminControlCenter: React.FC<AdminControlCenterProps> = ({
  user,
  settings,
  onNavigateTab,
  onRefreshUserData,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>('overview');

  // Overview states
  const [stats, setStats] = useState<AdminSystemStats | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(false);

  // Users states
  const [usersList, setUsersList] = useState<AdminUserRecord[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false);
  const [userActionMessage, setUserActionMessage] = useState<string | null>(null);

  // Broadcast Announcement states
  const [announcement, setAnnouncement] = useState<GlobalAnnouncement>(() => {
    return loadStoredAnnouncement() || {
      id: `ann-${Date.now()}`,
      title: 'مرحباً بكم في تِرميز 2.0',
      message: 'نسخة سحابية جديدة بهدوء تام، وتشفير كامل ليومياتكم وقراءاتكم.',
      type: 'golden',
      isActive: true,
      updatedAt: new Date().toISOString(),
      authorName: user?.name || 'إدارة تِرميز',
    };
  });
  const [announcementSavedToast, setAnnouncementSavedToast] = useState(false);

  // Featured books states
  const [featuredBooks, setFeaturedBooks] = useState<BookItem[]>(() => loadStoredFeaturedBooks());
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newBookCover, setNewBookCover] = useState('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80');
  const [newBookSummary, setNewBookSummary] = useState('');

  // Initial load
  useEffect(() => {
    loadOverviewData();
  }, []);

  const loadOverviewData = async () => {
    setIsLoadingStats(true);
    const [statsRes, pingRes] = await Promise.all([
      fetchAdminSystemStats(),
      checkDatabasePing(),
    ]);
    if (statsRes) setStats(statsRes);
    setLatency(pingRes.latencyMs);
    setIsLoadingStats(false);
  };

  const loadUsersData = async () => {
    setIsLoadingUsers(true);
    const list = await fetchAllUsers();
    setUsersList(list);
    setIsLoadingUsers(false);
  };

  useEffect(() => {
    if (activeSubTab === 'users') {
      loadUsersData();
    }
  }, [activeSubTab]);

  // Promote / Demote user role
  const handleToggleUserRole = async (targetUser: AdminUserRecord) => {
    const nextRole: 'admin' | 'user' = targetUser.role === 'admin' ? 'user' : 'admin';
    const confirmMsg = targetUser.role === 'admin'
      ? `هل أنت متأكد من تخفيض رتبة ${targetUser.name} إلى مستخدم عادي؟`
      : `هل أنت متأكد من ترقية ${targetUser.name} إلى رتبة أدمن (مسؤول النظام)؟`;

    if (!window.confirm(confirmMsg)) return;

    const ok = await updateUserRole(targetUser.id, nextRole);
    if (ok) {
      setUserActionMessage(`تم تعديل دور ${targetUser.name} إلى ${nextRole === 'admin' ? 'مسؤول (Admin)' : 'مستخدم عادي'}.`);
      setUsersList(prev => prev.map(u => u.id === targetUser.id ? { ...u, role: nextRole } : u));
      setTimeout(() => setUserActionMessage(null), 3500);
      if (targetUser.id === user?.id && onRefreshUserData) {
        onRefreshUserData();
      }
    } else {
      setUserActionMessage('حدث خطأ أثناء تعديل صلاحية المستخدم.');
      setTimeout(() => setUserActionMessage(null), 3500);
    }
  };

  // Save Announcement
  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: GlobalAnnouncement = {
      ...announcement,
      updatedAt: new Date().toISOString(),
      authorName: user?.name || 'إدارة تِرميز',
    };
    setAnnouncement(updated);
    saveStoredAnnouncement(updated);
    setAnnouncementSavedToast(true);
    setTimeout(() => setAnnouncementSavedToast(false), 3000);
  };

  // Add Featured Book
  const handleAddFeaturedBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookTitle.trim()) return;

    const bookItem: BookItem = {
      id: `featured-${Date.now()}`,
      title: newBookTitle.trim(),
      author: newBookAuthor.trim() || undefined,
      coverImage: newBookCover.trim() || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
      status: 'reading',
      rating: 5,
      summary: newBookSummary.trim() || 'كتاب ملهم موصى به لرواد تِرميز.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [bookItem, ...featuredBooks];
    setFeaturedBooks(updated);
    saveStoredFeaturedBooks(updated);
    setNewBookTitle('');
    setNewBookAuthor('');
    setNewBookSummary('');
  };

  const handleDeleteFeaturedBook = (bookId: string) => {
    const updated = featuredBooks.filter(b => b.id !== bookId);
    setFeaturedBooks(updated);
    saveStoredFeaturedBooks(updated);
  };

  // Export full diagnostic report
  const handleExportDiagnosticReport = async () => {
    if (!user) return;
    const backup = await exportFullBackupData(user.id, settings);
    const report = {
      timestamp: new Date().toISOString(),
      generatedBy: user.email,
      systemMetrics: stats,
      latencyMs: latency,
      announcement,
      featuredBooksCount: featuredBooks.length,
      sampleData: backup,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `trmez_admin_report_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in pb-24 select-none">
      {/* Top Admin Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-amber-500/10 via-[var(--color-bg-surface)] to-amber-600/10 dark:from-amber-950/40 dark:via-[var(--color-bg-card)] dark:to-amber-900/30 border border-amber-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#B87B22] to-[#F59E0B] text-black flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
              <Crown className="w-8 h-8 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-black">
                  VIP Superuser
                </span>
                <span className="text-xs text-[var(--color-text-muted)] font-mono">
                  {user?.email}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-display font-black text-[var(--color-text-primary)]">
                مركز إدارة وتحكم النظام
              </h2>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                صلاحيات عليا لمراقبة قاعدة البيانات، إدارة الأعضاء، ونشر التنبيهات وترشيحات الكتب لجميع القراء.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Database Ping Indicator */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-black/[0.04] dark:bg-black/40 border border-black/[0.08] dark:border-white/[0.08] text-xs">
              <div className={`w-2.5 h-2.5 rounded-full ${latency !== null && latency < 350 ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-[var(--color-text-muted)] font-sans">سرعة الاستجابة:</span>
              <span className="font-mono font-bold text-[var(--color-text-primary)]">
                {latency !== null ? `${latency}ms` : '—'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleExportDiagnosticReport}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-500 dark:text-amber-400 text-xs font-bold transition-all shadow-xs"
              title="تصدير تقرير النظام"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">تقرير النظام</span>
            </button>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-amber-500/20">
          <button
            type="button"
            onClick={() => setActiveSubTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'overview'
                ? 'bg-amber-500 text-black shadow-sm shadow-amber-500/30'
                : 'bg-black/[0.04] dark:bg-white/[0.05] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>نظرة عامة والنبض الحي</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'users'
                ? 'bg-amber-500 text-black shadow-sm shadow-amber-500/30'
                : 'bg-black/[0.04] dark:bg-white/[0.05] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>إدارة المستخدمين</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('broadcast')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'broadcast'
                ? 'bg-amber-500 text-black shadow-sm shadow-amber-500/30'
                : 'bg-black/[0.04] dark:bg-white/[0.05] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>البث والإعلانات العامة</span>
            {announcement.isActive && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('featured_books')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'featured_books'
                ? 'bg-amber-500 text-black shadow-sm shadow-amber-500/30'
                : 'bg-black/[0.04] dark:bg-white/[0.05] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>ترشيحات الكتب المميزة</span>
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------
          1. تبويب: نظرة عامة وإحصاءات السيرفر
          ---------------------------------------------------- */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* 5 KPI Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="p-4 rounded-3xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] shadow-subtle dark:shadow-subtle-dark">
              <div className="flex items-center justify-between text-blue-400 mb-2">
                <span className="text-xs font-medium">المستخدمين</span>
                <Users className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold font-sans text-[var(--color-text-primary)]">
                {stats ? toArabicNumerals(stats.totalUsersCount) : '—'}
              </div>
              <div className="text-[10px] text-[var(--color-text-muted)] mt-1">حسابات مسجلة</div>
            </div>

            <div className="p-4 rounded-3xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] shadow-subtle dark:shadow-subtle-dark">
              <div className="flex items-center justify-between text-emerald-400 mb-2">
                <span className="text-xs font-medium">اليوميات</span>
                <Feather className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold font-sans text-[var(--color-text-primary)]">
                {stats ? toArabicNumerals(stats.totalJournalsCount) : '—'}
              </div>
              <div className="text-[10px] text-[var(--color-text-muted)] mt-1">صفحة مدونة</div>
            </div>

            <div className="p-4 rounded-3xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] shadow-subtle dark:shadow-subtle-dark">
              <div className="flex items-center justify-between text-amber-400 mb-2">
                <span className="text-xs font-medium">الملاحظات</span>
                <StickyNote className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold font-sans text-[var(--color-text-primary)]">
                {stats ? toArabicNumerals(stats.totalNotesCount) : '—'}
              </div>
              <div className="text-[10px] text-[var(--color-text-muted)] mt-1">مذكرة سريعة</div>
            </div>

            <div className="p-4 rounded-3xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] shadow-subtle dark:shadow-subtle-dark">
              <div className="flex items-center justify-between text-purple-400 mb-2">
                <span className="text-xs font-medium">الكتب</span>
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold font-sans text-[var(--color-text-primary)]">
                {stats ? toArabicNumerals(stats.totalBooksCount) : '—'}
              </div>
              <div className="text-[10px] text-[var(--color-text-muted)] mt-1">على الرفوف</div>
            </div>

            <div className="p-4 rounded-3xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] shadow-subtle dark:shadow-subtle-dark col-span-2 md:col-span-1">
              <div className="flex items-center justify-between text-rose-400 mb-2">
                <span className="text-xs font-medium">جلسات التركيز</span>
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold font-sans text-[var(--color-text-primary)]">
                {stats ? toArabicNumerals(stats.totalFocusSessionsCount) : '—'}
              </div>
              <div className="text-[10px] text-[var(--color-text-muted)] mt-1">جلسة بومودورو</div>
            </div>
          </div>

          {/* System Health Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-3xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] shadow-subtle dark:shadow-subtle-dark space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-[var(--color-border-subtle)]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <h4 className="text-sm font-bold text-[var(--color-text-primary)]">حالة الأمان والحماية</h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                  نشط ومحمي
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-[var(--color-text-muted)]">
                <div className="flex justify-between py-1 border-b border-black/[0.03] dark:border-white/[0.03]">
                  <span>عزل السجلات (RLS):</span>
                  <span className="text-emerald-500 font-bold">مفعل على جميع الجداول الخمسة</span>
                </div>
                <div className="flex justify-between py-1 border-b border-black/[0.03] dark:border-white/[0.03]">
                  <span>التخزين السحابي (Bucket):</span>
                  <span className="text-[var(--color-text-primary)] font-mono">trmez-media (جاهز)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-black/[0.03] dark:border-white/[0.03]">
                  <span>خوارزمية تشفير كلمات المرور:</span>
                  <span className="text-[var(--color-text-primary)] font-mono">Bcrypt / Supabase Auth</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] shadow-subtle dark:shadow-subtle-dark space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-[var(--color-border-subtle)]">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-amber-500" />
                  <h4 className="text-sm font-bold text-[var(--color-text-primary)]">خادم قاعدة بيانات Supabase</h4>
                </div>
                <button
                  type="button"
                  onClick={loadOverviewData}
                  disabled={isLoadingStats}
                  className="p-1.5 rounded-xl hover:bg-black/[0.05] dark:hover:bg-white/[0.05] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStats ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="space-y-2.5 text-xs text-[var(--color-text-muted)]">
                <div className="flex justify-between py-1 border-b border-black/[0.03] dark:border-white/[0.03]">
                  <span>حالة الاتصال:</span>
                  <span className="text-emerald-500 font-bold">متصل ومستقر</span>
                </div>
                <div className="flex justify-between py-1 border-b border-black/[0.03] dark:border-white/[0.03]">
                  <span>موقع المشروع:</span>
                  <span className="text-[var(--color-text-primary)] font-mono">kopaqeqzaldmesctysqn</span>
                </div>
                <div className="flex justify-between py-1 border-b border-black/[0.03] dark:border-white/[0.03]">
                  <span>سرعة الاستجابة (Latency):</span>
                  <span className="text-[var(--color-text-primary)] font-mono font-bold">
                    {latency !== null ? `${latency} ms` : 'جاري الفحص...'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          2. تبويب: إدارة المستخدمين (Users Management)
          ---------------------------------------------------- */}
      {activeSubTab === 'users' && (
        <div className="p-6 md:p-8 rounded-3xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-black/[0.06] dark:border-[var(--color-border-subtle)]">
            <div>
              <h3 className="text-lg font-bold text-[var(--color-text-primary)]">دليل المستخدمين المسجلين</h3>
              <p className="text-xs text-[var(--color-text-muted)]">
                عرض وإدارة حسابات المستخدمين في منصة تِرميز وترقية المسؤولين
              </p>
            </div>
            <button
              type="button"
              onClick={loadUsersData}
              disabled={isLoadingUsers}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] text-xs font-semibold hover:opacity-80 transition-opacity"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingUsers ? 'animate-spin' : ''}`} />
              <span>تحديث القائمة</span>
            </button>
          </div>

          {userActionMessage && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{userActionMessage}</span>
            </div>
          )}

          {isLoadingUsers ? (
            <div className="text-center py-12 text-xs text-[var(--color-text-muted)]">
              جاري جلب المستخدمين من قاعدة البيانات...
            </div>
          ) : usersList.length === 0 ? (
            <div className="text-center py-12 text-xs text-[var(--color-text-muted)]">
              لا يوجد مستخدمون آخرون بعد، أو يرجى التأكد من تشغيل سطر السماح للأدمن بقراءة الحسابات.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-black/[0.08] dark:border-[var(--color-border-subtle)] text-[var(--color-text-muted)] font-semibold">
                    <th className="pb-3 pr-2">المستخدم</th>
                    <th className="pb-3">البريد الإلكتروني</th>
                    <th className="pb-3">الرتبة</th>
                    <th className="pb-3">تاريخ الانضمام</th>
                    <th className="pb-3 pl-2 text-left">إجراءات الصلاحية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 pr-2 font-bold text-[var(--color-text-primary)]">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                            u.role === 'admin' ? 'bg-amber-500 text-black' : 'bg-black/[0.05] dark:bg-white/[0.08] text-[var(--color-text-primary)]'
                          }`}>
                            {u.role === 'admin' ? <Crown className="w-3.5 h-3.5 fill-current" /> : u.name[0]}
                          </div>
                          <span>{u.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 font-mono text-[var(--color-text-muted)] text-[11px]">
                        {u.email}
                      </td>
                      <td className="py-3.5">
                        {u.role === 'admin' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                            مسؤول (Admin) 👑
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/[0.05] dark:bg-white/[0.08] text-[var(--color-text-muted)]">
                            مستخدم عادي
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 text-[var(--color-text-muted)] text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="py-3.5 pl-2 text-left">
                        {u.id === user?.id ? (
                          <span className="text-[10px] text-[var(--color-text-muted)] italic">
                            (أنت - حسابك الحالي)
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleUserRole(u)}
                            className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                              u.role === 'admin'
                                ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/25'
                                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/25'
                            }`}
                          >
                            {u.role === 'admin' ? 'تخفيض لمستخدم' : 'ترقية لأدمن 👑'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------
          3. تبويب: البث والإعلانات العامة (Broadcast)
          ---------------------------------------------------- */}
      {activeSubTab === 'broadcast' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form */}
          <div className="p-6 md:p-8 rounded-3xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] shadow-xl space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-black/[0.06] dark:border-[var(--color-border-subtle)]">
              <Megaphone className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="text-base font-bold text-[var(--color-text-primary)]">نشر إعلان عام للجميع</h3>
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  يظهر هذا الشريط لجميع زوار ومستخدمي التطبيق في أعلى الشاشة الرئيسية
                </p>
              </div>
            </div>

            {announcementSavedToast && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>تم تحديث ونشر الإعلان العام بنجاح!</span>
              </div>
            )}

            <form onSubmit={handleSaveAnnouncement} className="space-y-4 text-xs">
              <div>
                <label className="block text-[var(--color-text-muted)] font-semibold mb-1">
                  عنوان الإعلان أو المناسبة
                </label>
                <input
                  type="text"
                  required
                  value={announcement.title}
                  onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
                  placeholder="مثال: تحديث شتوي هادئ لترميز"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.03] dark:bg-black/30 border border-black/[0.08] dark:border-[var(--color-border-subtle)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[var(--color-text-muted)] font-semibold mb-1">
                  نص الرسالة أو الاقتباس
                </label>
                <textarea
                  required
                  rows={3}
                  value={announcement.message}
                  onChange={(e) => setAnnouncement({ ...announcement, message: e.target.value })}
                  placeholder="اكتب التنبيه أو الكلمات الملهمة هنا..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.03] dark:bg-black/30 border border-black/[0.08] dark:border-[var(--color-border-subtle)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-[var(--color-text-muted)] font-semibold mb-1">
                  طراز الرسالة
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAnnouncement({ ...announcement, type: 'golden' })}
                    className={`py-2 px-3 rounded-xl border text-[11px] font-bold transition-all ${
                      announcement.type === 'golden'
                        ? 'bg-amber-500/20 text-amber-500 border-amber-500/40'
                        : 'border-black/[0.08] dark:border-white/[0.08] text-[var(--color-text-muted)]'
                    }`}
                  >
                    ✨ ذهبي ملهم
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnnouncement({ ...announcement, type: 'info' })}
                    className={`py-2 px-3 rounded-xl border text-[11px] font-bold transition-all ${
                      announcement.type === 'info'
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                        : 'border-black/[0.08] dark:border-white/[0.08] text-[var(--color-text-muted)]'
                    }`}
                  >
                    ℹ️ إشعار وتحديث
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnnouncement({ ...announcement, type: 'alert' })}
                    className={`py-2 px-3 rounded-xl border text-[11px] font-bold transition-all ${
                      announcement.type === 'alert'
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                        : 'border-black/[0.08] dark:border-white/[0.08] text-[var(--color-text-muted)]'
                    }`}
                  >
                    ⚠️ تنبيه مهم
                  </button>
                </div>
              </div>

              {/* Toggle Active */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/[0.02] dark:bg-black/30 border border-black/[0.06] dark:border-white/[0.06]">
                <div>
                  <div className="font-bold text-[var(--color-text-primary)]">تفعيل الإعلان</div>
                  <div className="text-[10px] text-[var(--color-text-muted)]">إظهار الإعلان للجميع في أعلى الصفحة الرئيسية</div>
                </div>
                <button
                  type="button"
                  onClick={() => setAnnouncement({ ...announcement, isActive: !announcement.isActive })}
                  className={`w-12 h-6 rounded-full p-1 transition-colors relative flex items-center ${
                    announcement.isActive ? 'bg-amber-500' : 'bg-black/20 dark:bg-white/20'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    announcement.isActive ? '-translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-2xl font-bold bg-amber-500 text-black hover:opacity-90 shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 text-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>حفظ ونشر الإعلان العام</span>
              </button>
            </form>
          </div>

          {/* Live Preview */}
          <div className="p-6 md:p-8 rounded-3xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] shadow-xl space-y-4">
            <h4 className="text-sm font-bold text-[var(--color-text-primary)]">
              معاينة حية لشكل الإعلان في الواجهة:
            </h4>

            {announcement.isActive ? (
              <div className={`p-4 rounded-2xl border transition-all ${
                announcement.type === 'golden'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                  : announcement.type === 'info'
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
              }`}>
                <div className="flex items-center gap-2 font-bold text-xs mb-1">
                  <Megaphone className="w-4 h-4 shrink-0" />
                  <span>{announcement.title}</span>
                </div>
                <p className="text-[11px] text-[var(--color-text-primary)] font-text leading-relaxed">
                  {announcement.message}
                </p>
                <div className="mt-2 text-[9px] text-[var(--color-text-muted)]">
                  نُشر بواسطة: {announcement.authorName || 'إدارة تِرميز'}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl border border-dashed border-black/[0.1] dark:border-white/[0.1] text-xs text-[var(--color-text-muted)]">
                الإعلان متوقف حالياً ولن يظهر للمستخدمين.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          4. تبويب: ترشيحات الكتب المميزة (Featured Books)
          ---------------------------------------------------- */}
      {activeSubTab === 'featured_books' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Add Book Form */}
          <div className="p-6 md:p-8 rounded-3xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-black/[0.06] dark:border-[var(--color-border-subtle)]">
              <Star className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="text-base font-bold text-[var(--color-text-primary)]">ترشيح كتاب مميز للقراء</h3>
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  يظهر في قسم مكتبتي مع شارة ترشيح ذهبية لجميع الزوار
                </p>
              </div>
            </div>

            <form onSubmit={handleAddFeaturedBook} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[var(--color-text-muted)] font-semibold mb-1">عنوان الكتاب</label>
                <input
                  type="text"
                  required
                  value={newBookTitle}
                  onChange={(e) => setNewBookTitle(e.target.value)}
                  placeholder="مثال: طوق الحمامة في الألفة والأُلاّف"
                  className="w-full px-3.5 py-2 rounded-xl bg-black/[0.03] dark:bg-black/30 border border-black/[0.08] dark:border-[var(--color-border-subtle)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[var(--color-text-muted)] font-semibold mb-1">المؤلف</label>
                <input
                  type="text"
                  value={newBookAuthor}
                  onChange={(e) => setNewBookAuthor(e.target.value)}
                  placeholder="مثال: ابن حزم الأندلسي"
                  className="w-full px-3.5 py-2 rounded-xl bg-black/[0.03] dark:bg-black/30 border border-black/[0.08] dark:border-[var(--color-border-subtle)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[var(--color-text-muted)] font-semibold mb-1">رابط صورة الغلاف</label>
                <input
                  type="url"
                  value={newBookCover}
                  onChange={(e) => setNewBookCover(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 rounded-xl bg-black/[0.03] dark:bg-black/30 border border-black/[0.08] dark:border-[var(--color-border-subtle)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-amber-500 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-[var(--color-text-muted)] font-semibold mb-1">ملخص ورأي الإدارة</label>
                <textarea
                  rows={2}
                  value={newBookSummary}
                  onChange={(e) => setNewBookSummary(e.target.value)}
                  placeholder="لماذا تنصح بقراءة هذا الكتاب؟"
                  className="w-full px-3.5 py-2 rounded-xl bg-black/[0.03] dark:bg-black/30 border border-black/[0.08] dark:border-[var(--color-border-subtle)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-2xl font-bold bg-amber-500 text-black hover:opacity-90 transition-all flex items-center justify-center gap-1.5 text-xs shadow-md shadow-amber-500/20"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>إضافة الكتاب لقائمة ترشيحات الإدارة</span>
              </button>
            </form>
          </div>

          {/* List of Featured Books */}
          <div className="p-6 md:p-8 rounded-3xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] shadow-xl space-y-4">
            <h4 className="text-sm font-bold text-[var(--color-text-primary)]">
              الكتب المرشحة حالياً ({toArabicNumerals(featuredBooks.length)}):
            </h4>

            {featuredBooks.length === 0 ? (
              <div className="text-center py-12 text-xs text-[var(--color-text-muted)] border border-dashed border-black/[0.1] dark:border-white/[0.1] rounded-2xl">
                لم تقم بإضافة كتب موصى بها بعد.
              </div>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {featuredBooks.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-2xl bg-black/[0.02] dark:bg-black/30 border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img
                        src={b.coverImage}
                        alt={b.title}
                        className="w-10 h-14 object-cover rounded-lg shadow-xs shrink-0"
                      />
                      <div className="truncate">
                        <div className="text-xs font-bold text-[var(--color-text-primary)] truncate">
                          {b.title}
                        </div>
                        <div className="text-[10px] text-[var(--color-text-muted)] truncate">
                          {b.author || 'مؤلف غير معروف'}
                        </div>
                        <div className="text-[9px] text-amber-500 font-semibold mt-0.5">
                          ترشيح معتمد ★
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteFeaturedBook(b.id)}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="حذف من الترشيحات"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};