import { getSupabase } from './supabaseClient';
import {
  JournalEntry,
  QuickNote,
  BookItem,
  FocusSession,
  AppSettings,
  UserProfile
} from '../types/journal';

// ============================================================================
// 1. إدارة ملف التعريف والإعدادات (Profiles & Settings)
// ============================================================================

export async function fetchUserProfile(userId: string): Promise<Partial<UserProfile> & { settings?: AppSettings } | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user && authData.user.id === userId) {
        const email = authData.user.email || '';
        const name = authData.user.user_metadata?.full_name || email.split('@')[0] || 'مستخدم';
        const { data: inserted } = await supabase
          .from('profiles')
          .insert({ id: userId, email, name, role: 'user' })
          .select()
          .single();
        if (inserted) {
          return {
            id: inserted.id,
            email: inserted.email,
            name: inserted.name,
            role: inserted.role || 'user',
            isAdmin: inserted.role === 'admin',
            settings: inserted.settings || undefined,
          };
        }
      }
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role || 'user',
      isAdmin: data.role === 'admin',
      settings: data.settings || undefined,
    };
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return null;
  }
}

export async function saveUserProfileSettings(userId: string, settings: AppSettings): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        settings,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    return !error;
  } catch (err) {
    console.error('Error saving user settings:', err);
    return false;
  }
}

// ============================================================================
// 2. إدارة تدوينات اليوميات (Journals)
// ============================================================================

export async function fetchUserJournals(userId: string): Promise<Record<string, JournalEntry>> {
  const supabase = getSupabase();
  if (!supabase) return {};

  try {
    const { data, error } = await supabase
      .from('journals')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error || !data) return {};

    const map: Record<string, JournalEntry> = {};
    data.forEach((row: any) => {
      map[row.date] = {
        id: row.id,
        date: row.date,
        title: row.title || '',
        content: row.content || '',
        mood: row.mood || null,
        weather: row.weather || 'coffee',
        tags: row.tags || [],
        wordCount: row.word_count || 0,
        readingTimeMinutes: row.reading_time_minutes || 1,
        drawingData: row.drawing_data || undefined,
        images: row.images || [],
        favorite: row.favorite || false,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    });

    return map;
  } catch (err) {
    console.error('Error fetching journals:', err);
    return {};
  }
}

export async function saveUserJournal(userId: string, entry: JournalEntry): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('journals')
      .upsert({
        id: entry.id || `entry-${entry.date}`,
        user_id: userId,
        date: entry.date,
        title: entry.title,
        content: entry.content,
        mood: entry.mood,
        weather: entry.weather,
        tags: entry.tags,
        word_count: entry.wordCount,
        reading_time_minutes: entry.readingTimeMinutes,
        drawing_data: entry.drawingData,
        images: entry.images || [],
        favorite: entry.favorite || false,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,date' });

    if (error) {
      console.error('Error upserting journal:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error saving journal entry:', err);
    return false;
  }
}

export async function deleteUserJournal(userId: string, date: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('journals')
      .delete()
      .eq('user_id', userId)
      .eq('date', date);

    return !error;
  } catch (err) {
    console.error('Error deleting journal entry:', err);
    return false;
  }
}

// ============================================================================
// 3. إدارة الملاحظات السريعة (Notes)
// ============================================================================

export async function fetchUserNotes(userId: string): Promise<QuickNote[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('pinned', { ascending: false })
      .order('updated_at', { ascending: false });

    if (error || !data) return [];

    return data.map((row: any) => ({
      id: row.id,
      title: row.title || '',
      content: row.content || '',
      category: row.category || 'أفكار',
      pinned: row.pinned || false,
      drawingData: row.drawing_data || undefined,
      updatedAt: row.updated_at,
    }));
  } catch (err) {
    console.error('Error fetching notes:', err);
    return [];
  }
}

export async function saveUserNote(userId: string, note: QuickNote): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('notes')
      .upsert({
        id: note.id,
        user_id: userId,
        title: note.title,
        content: note.content,
        category: note.category,
        pinned: note.pinned,
        drawing_data: note.drawingData,
        updated_at: new Date().toISOString(),
      });

    return !error;
  } catch (err) {
    console.error('Error saving note:', err);
    return false;
  }
}

export async function deleteUserNote(userId: string, noteId: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('user_id', userId)
      .eq('id', noteId);

    return !error;
  } catch (err) {
    console.error('Error deleting note:', err);
    return false;
  }
}

// ============================================================================
// 4. إدارة مكتبتي الأدبية (Books)
// ============================================================================

export async function fetchUserBooks(userId: string): Promise<BookItem[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((row: any) => ({
      id: row.id,
      title: row.title,
      coverImage: row.cover_image,
      status: row.status,
      author: row.author || undefined,
      rating: row.rating || undefined,
      finishedDate: row.finished_date || undefined,
      summary: row.summary || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } catch (err) {
    console.error('Error fetching books:', err);
    return [];
  }
}

export async function saveUserBook(userId: string, book: BookItem): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('books')
      .upsert({
        id: book.id,
        user_id: userId,
        title: book.title,
        cover_image: book.coverImage,
        status: book.status,
        author: book.author,
        rating: book.rating,
        finished_date: book.finishedDate,
        summary: book.summary,
        updated_at: new Date().toISOString(),
      });

    return !error;
  } catch (err) {
    console.error('Error saving book:', err);
    return false;
  }
}

export async function deleteUserBook(userId: string, bookId: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('user_id', userId)
      .eq('id', bookId);

    return !error;
  } catch (err) {
    console.error('Error deleting book:', err);
    return false;
  }
}

// ============================================================================
// 5. إدارة جلسات التركيز والبومودورو (Pomodoro Sessions)
// ============================================================================

export async function fetchUserFocusSessions(userId: string): Promise<FocusSession[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('pomodoro_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (error || !data) return [];

    return data.map((row: any) => ({
      id: row.id,
      durationMinutes: row.duration_minutes,
      sessionType: row.session_type,
      subject: row.subject,
      completedAt: row.completed_at,
      date: row.date,
    }));
  } catch (err) {
    console.error('Error fetching focus sessions:', err);
    return [];
  }
}

export async function saveUserFocusSession(userId: string, session: FocusSession): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('pomodoro_sessions')
      .insert({
        id: session.id,
        user_id: userId,
        duration_minutes: session.durationMinutes,
        session_type: session.sessionType,
        subject: session.subject,
        completed_at: session.completedAt,
        date: session.date,
      });

    return !error;
  } catch (err) {
    console.error('Error inserting focus session:', err);
    return false;
  }
}

export async function deleteUserFocusSession(userId: string, sessionId: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('pomodoro_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', userId);

    return !error;
  } catch (err) {
    console.error('Error deleting focus session:', err);
    return false;
  }
}

// ============================================================================
// 6. رفع الوسائط والصور إلى حاوية التخزين (Supabase Storage: trmez-media)
// ============================================================================

export async function uploadMediaToStorage(
  userId: string,
  fileOrBase64: File | string,
  subfolder: 'journals' | 'books' | 'drawings' | 'covers'
): Promise<string> {
  const supabase = getSupabase();
  // Fallback to base64 if supabase is not initialized
  if (!supabase) {
    if (typeof fileOrBase64 === 'string') return fileOrBase64;
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(fileOrBase64);
    });
  }

  try {
    let blob: Blob;
    let extension = 'jpg';

    if (typeof fileOrBase64 === 'string') {
      if (!fileOrBase64.startsWith('data:')) {
        return fileOrBase64; // already a remote URL
      }
      // Convert data URL to Blob
      const parts = fileOrBase64.split(';base64,');
      const contentType = parts[0].split(':')[1] || 'image/jpeg';
      extension = contentType.split('/')[1] || 'jpg';
      const raw = window.atob(parts[1]);
      const uInt8Array = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      blob = new Blob([uInt8Array], { type: contentType });
    } else {
      blob = fileOrBase64;
      extension = fileOrBase64.name.split('.').pop() || 'jpg';
    }

    const fileName = `${userId}/${subfolder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from('trmez-media')
      .upload(fileName, blob, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.warn('Supabase storage upload failed, falling back to data URL:', uploadError.message);
      return typeof fileOrBase64 === 'string' ? fileOrBase64 : URL.createObjectURL(fileOrBase64);
    }

    const { data } = supabase.storage
      .from('trmez-media')
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (err) {
    console.warn('Storage upload error, returning original:', err);
    return typeof fileOrBase64 === 'string' ? fileOrBase64 : '';
  }
}

// ============================================================================
// 7. تصدير واستعادة النسخ الاحتياطية الشاملة (Full Backup & Restore)
// ============================================================================

export interface FullBackupPayload {
  version: '2.0';
  exportDate: string;
  userId: string;
  journals: JournalEntry[];
  notes: QuickNote[];
  books: BookItem[];
  focusSessions: FocusSession[];
  settings?: AppSettings;
}

export async function exportFullBackupData(userId: string, settings?: AppSettings): Promise<FullBackupPayload> {
  const [journalsMap, notes, books, focusSessions] = await Promise.all([
    fetchUserJournals(userId),
    fetchUserNotes(userId),
    fetchUserBooks(userId),
    fetchUserFocusSessions(userId),
  ]);

  return {
    version: '2.0',
    exportDate: new Date().toISOString(),
    userId,
    journals: Object.values(journalsMap),
    notes,
    books,
    focusSessions,
    settings,
  };
}

export async function importFullBackupData(userId: string, payload: FullBackupPayload): Promise<{ success: boolean; importedCounts: { journals: number; notes: number; books: number; sessions: number } }> {
  const counts = { journals: 0, notes: 0, books: 0, sessions: 0 };
  const supabase = getSupabase();
  if (!supabase) return { success: false, importedCounts: counts };

  try {
    // 1. Restore Journals
    if (Array.isArray(payload.journals)) {
      for (const j of payload.journals) {
        const ok = await saveUserJournal(userId, j);
        if (ok) counts.journals++;
      }
    }

    // 2. Restore Notes
    if (Array.isArray(payload.notes)) {
      for (const n of payload.notes) {
        const ok = await saveUserNote(userId, n);
        if (ok) counts.notes++;
      }
    }

    // 3. Restore Books
    if (Array.isArray(payload.books)) {
      for (const b of payload.books) {
        const ok = await saveUserBook(userId, b);
        if (ok) counts.books++;
      }
    }

    // 4. Restore Focus Sessions
    if (Array.isArray(payload.focusSessions)) {
      for (const s of payload.focusSessions) {
        const ok = await saveUserFocusSession(userId, s);
        if (ok) counts.sessions++;
      }
    }

    // 5. Restore Settings
    if (payload.settings) {
      await saveUserProfileSettings(userId, payload.settings);
    }

    return { success: true, importedCounts: counts };
  } catch (err) {
    console.error('Failed to import full backup:', err);
    return { success: false, importedCounts: counts };
  }
}

// ============================================================================
// 8. لوحة تحكم الأدمن وإحصاءات النظام (Admin Role Capabilities)
// ============================================================================

export interface AdminSystemStats {
  totalUsersCount: number;
  totalJournalsCount: number;
  totalNotesCount: number;
  totalBooksCount: number;
  totalFocusSessionsCount: number;
}

export async function fetchAdminSystemStats(): Promise<AdminSystemStats | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const [profilesRes, journalsRes, notesRes, booksRes, sessionsRes] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('journals').select('id', { count: 'exact', head: true }),
      supabase.from('notes').select('id', { count: 'exact', head: true }),
      supabase.from('books').select('id', { count: 'exact', head: true }),
      supabase.from('pomodoro_sessions').select('id', { count: 'exact', head: true }),
    ]);

    return {
      totalUsersCount: profilesRes.count || 0,
      totalJournalsCount: journalsRes.count || 0,
      totalNotesCount: notesRes.count || 0,
      totalBooksCount: booksRes.count || 0,
      totalFocusSessionsCount: sessionsRes.count || 0,
    };
  } catch (err) {
    console.error('Error fetching admin metrics:', err);
    return null;
  }
}

// ----------------------------------------------------------------------------
// 9. خدمات إدارة المستخدمين والإعلانات العامة للأدمن (Admin Extended Services)
// ----------------------------------------------------------------------------

export interface AdminUserRecord {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface GlobalAnnouncement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'golden' | 'alert';
  isActive: boolean;
  durationSeconds?: number;
  expiresAt?: string;
  updatedAt: string;
  authorName?: string;
}

const STORAGE_KEY_ANNOUNCEMENT = 'trmez_global_announcement_v1';
const STORAGE_KEY_FEATURED_BOOKS = 'trmez_featured_books_v1';

export async function fetchAllUsers(): Promise<AdminUserRecord[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, name, role, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((row: any) => ({
      id: row.id,
      email: row.email || '',
      name: row.name || 'مستخدم',
      role: row.role || 'user',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } catch (err) {
    console.error('Error fetching all users:', err);
    return [];
  }
}

export async function updateUserRole(userId: string, newRole: 'admin' | 'user'): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', userId);

    return !error;
  } catch (err) {
    console.error('Error updating user role:', err);
    return false;
  }
}

export async function checkDatabasePing(): Promise<{ latencyMs: number; isConnected: boolean }> {
  const supabase = getSupabase();
  if (!supabase) return { latencyMs: 0, isConnected: false };

  const start = performance.now();
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    const end = performance.now();
    return {
      latencyMs: Math.round(end - start),
      isConnected: !error,
    };
  } catch {
    return { latencyMs: 0, isConnected: false };
  }
}

export function loadStoredAnnouncement(): GlobalAnnouncement | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ANNOUNCEMENT);
    if (!raw) return null;
    const ann: GlobalAnnouncement = JSON.parse(raw);
    if (!ann) return null;
    if (ann.expiresAt && new Date(ann.expiresAt).getTime() <= Date.now()) {
      return null;
    }
    return ann;
  } catch {
    return null;
  }
}

export function saveStoredAnnouncement(announcement: GlobalAnnouncement | null): void {
  try {
    if (!announcement) {
      localStorage.removeItem(STORAGE_KEY_ANNOUNCEMENT);
    } else {
      localStorage.setItem(STORAGE_KEY_ANNOUNCEMENT, JSON.stringify(announcement));
    }
  } catch (err) {
    console.error('Error saving announcement:', err);
  }
}

const STORAGE_KEY_DISMISSED_FEATURED_BOOKS = 'trmez_dismissed_featured_books';

export function loadStoredFeaturedBooks(): BookItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FEATURED_BOOKS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function loadDismissedFeaturedBookIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DISMISSED_FEATURED_BOOKS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function dismissFeaturedBookId(bookId: string): void {
  try {
    const list = loadDismissedFeaturedBookIds();
    if (!list.includes(bookId)) {
      list.push(bookId);
      localStorage.setItem(STORAGE_KEY_DISMISSED_FEATURED_BOOKS, JSON.stringify(list));
    }
  } catch (err) {
    console.error('Error dismissing featured book:', err);
  }
}

export function loadVisibleFeaturedBooks(): BookItem[] {
  const all = loadStoredFeaturedBooks();
  const dismissed = loadDismissedFeaturedBookIds();
  return all.filter(b => !dismissed.includes(b.id));
}

export function saveStoredFeaturedBooks(books: BookItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_FEATURED_BOOKS, JSON.stringify(books));
  } catch (err) {
    console.error('Error saving featured books:', err);
  }
}
