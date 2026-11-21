-- ==============================================================================
-- تطبيق تِرميـز (Trmez) - سكربت تهيئة قاعدة البيانات والتخزين السحابي (Supabase Schema)
-- انسخ هذا الكود بالكامل والصقه في: Supabase Dashboard -> SQL Editor -> New query -> Run
-- ==============================================================================

-- 1. جدول الحسابات الشخصية للمستخدمين (Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. جدول كتاب اليوميات (Journals)
CREATE TABLE IF NOT EXISTS public.journals (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  title TEXT DEFAULT '',
  content TEXT DEFAULT '',
  mood TEXT,
  weather TEXT,
  tags TEXT[] DEFAULT '{}',
  word_count INTEGER DEFAULT 0,
  reading_time_minutes INTEGER DEFAULT 1,
  drawing_data TEXT,
  images TEXT[] DEFAULT '{}',
  favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_user_journal_date UNIQUE (user_id, date)
);

-- 3. جدول الملاحظات السريعة (Notes)
CREATE TABLE IF NOT EXISTS public.notes (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT '',
  content TEXT DEFAULT '',
  category TEXT DEFAULT 'أفكار',
  pinned BOOLEAN DEFAULT false,
  drawing_data TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. جدول مكتبتي للكتب والقراءات (Books)
CREATE TABLE IF NOT EXISTS public.books (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  cover_image TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('completed', 'reading', 'unread')),
  author TEXT,
  rating INTEGER,
  finished_date TEXT,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. جدول جلسات التركيز والبومودورو (Pomodoro Sessions)
CREATE TABLE IF NOT EXISTS public.pomodoro_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  duration_minutes INTEGER NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('study', 'work', 'reading', 'meditation')),
  subject TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- تفعيل سياسات الحماية والأمان على مستوى الصف (Row Level Security - RLS)
-- تضمن خصوصية مطلقة: لا يمكن لأي مستخدم قراءة أو تعديل بيانات أي مستخدم آخر
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;

-- حذف أي سياسات سابقة لتجنب التكرار
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view their own journals" ON public.journals;
DROP POLICY IF EXISTS "Users can insert their own journals" ON public.journals;
DROP POLICY IF EXISTS "Users can update their own journals" ON public.journals;
DROP POLICY IF EXISTS "Users can delete their own journals" ON public.journals;

DROP POLICY IF EXISTS "Users can view their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can insert their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON public.notes;

DROP POLICY IF EXISTS "Users can view their own books" ON public.books;
DROP POLICY IF EXISTS "Users can insert their own books" ON public.books;
DROP POLICY IF EXISTS "Users can update their own books" ON public.books;
DROP POLICY IF EXISTS "Users can delete their own books" ON public.books;

DROP POLICY IF EXISTS "Users can view their own pomodoro sessions" ON public.pomodoro_sessions;
DROP POLICY IF EXISTS "Users can insert their own pomodoro sessions" ON public.pomodoro_sessions;
DROP POLICY IF EXISTS "Users can update their own pomodoro sessions" ON public.pomodoro_sessions;
DROP POLICY IF EXISTS "Users can delete their own pomodoro sessions" ON public.pomodoro_sessions;

-- سياسات profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- سياسات journals
CREATE POLICY "Users can view their own journals"
  ON public.journals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journals"
  ON public.journals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journals"
  ON public.journals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journals"
  ON public.journals FOR DELETE
  USING (auth.uid() = user_id);

-- سياسات notes
CREATE POLICY "Users can view their own notes"
  ON public.notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes"
  ON public.notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
  ON public.notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
  ON public.notes FOR DELETE
  USING (auth.uid() = user_id);

-- سياسات books
CREATE POLICY "Users can view their own books"
  ON public.books FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own books"
  ON public.books FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own books"
  ON public.books FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own books"
  ON public.books FOR DELETE
  USING (auth.uid() = user_id);

-- سياسات pomodoro_sessions
CREATE POLICY "Users can view their own pomodoro sessions"
  ON public.pomodoro_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pomodoro sessions"
  ON public.pomodoro_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pomodoro sessions"
  ON public.pomodoro_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pomodoro sessions"
  ON public.pomodoro_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- ==============================================================================
-- مشغل تلقائي لإنشاء ملف تعريف للمستخدم فور تسجيله (Auto Profile Trigger)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'user'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.profiles.name);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- إنشاء حاوية تخزين الصور والوسائط (Storage Bucket: trmez-media)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('trmez-media', 'trmez-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- سياسات أمان حاوية التخزين
DROP POLICY IF EXISTS "Public Read trmez-media" ON storage.objects;
DROP POLICY IF EXISTS "User Upload trmez-media" ON storage.objects;
DROP POLICY IF EXISTS "User Delete trmez-media" ON storage.objects;

CREATE POLICY "Public Read trmez-media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'trmez-media');

CREATE POLICY "User Upload trmez-media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'trmez-media' AND auth.role() = 'authenticated');

CREATE POLICY "User Delete trmez-media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'trmez-media' AND auth.role() = 'authenticated');

-- ==============================================================================
-- دوال لوحة تحكم الأدمن بصلاحية عليا (SECURITY DEFINER)
-- تحسب الإحصائيات الحقيقية لكامل قاعدة البيانات وتجلب قائمة المستخدمين
-- دون كشف أي محتوى خاص من اليوميات أو الملاحظات، وتتأكد من صلاحية الأدمن
-- ==============================================================================

-- 1. دالة حساب الإحصائيات الإجمالية الحقيقية لقاعدة البيانات
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  is_admin BOOLEAN := FALSE;
  users_cnt BIGINT := 0;
  journals_cnt BIGINT := 0;
  notes_cnt BIGINT := 0;
  books_cnt BIGINT := 0;
  sessions_cnt BIGINT := 0;
BEGIN
  -- التحقق الصارم من أن المستعلم يحمل رتبة admin في profiles
  SELECT (role = 'admin') INTO is_admin
  FROM public.profiles
  WHERE id = auth.uid();

  IF is_admin IS NOT TRUE THEN
    RAISE EXCEPTION 'Access denied: Requires administrator privilege';
  END IF;

  -- حساب الأرقام الإجمالية الحقيقية من كامل جداول النظام
  SELECT COUNT(*) INTO users_cnt FROM auth.users;
  SELECT COUNT(*) INTO journals_cnt FROM public.journals;
  SELECT COUNT(*) INTO notes_cnt FROM public.notes;
  SELECT COUNT(*) INTO books_cnt FROM public.books;
  SELECT COUNT(*) INTO sessions_cnt FROM public.pomodoro_sessions;

  RETURN jsonb_build_object(
    'totalUsersCount', users_cnt,
    'totalJournalsCount', journals_cnt,
    'totalNotesCount', notes_cnt,
    'totalBooksCount', books_cnt,
    'totalFocusSessionsCount', sessions_cnt
  );
END;
$$;

-- 2. دالة إرجاع قائمة المستخدمين مع عدد نشاطهم لتبويب إدارة المستخدمين
CREATE OR REPLACE FUNCTION public.get_all_users_for_admin()
RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT,
  role TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  journals_count BIGINT,
  notes_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  is_admin BOOLEAN := FALSE;
BEGIN
  -- التحقق من صلاحية الأدمن
  SELECT (p.role = 'admin') INTO is_admin
  FROM public.profiles p
  WHERE p.id = auth.uid();

  IF is_admin IS NOT TRUE THEN
    RAISE EXCEPTION 'Access denied: Requires administrator privilege';
  END IF;

  RETURN QUERY
  SELECT 
    u.id,
    COALESCE(u.email::TEXT, p.email, '') AS email,
    COALESCE(p.name, u.raw_user_meta_data->>'full_name', split_part(u.email::TEXT, '@', 1), 'مستخدم') AS name,
    COALESCE(p.role, 'user') AS role,
    COALESCE(p.created_at, u.created_at) AS created_at,
    COALESCE(p.updated_at, u.created_at) AS updated_at,
    (SELECT COUNT(*) FROM public.journals j WHERE j.user_id = u.id) AS journals_count,
    (SELECT COUNT(*) FROM public.notes n WHERE n.user_id = u.id) AS notes_count
  FROM auth.users u
  LEFT JOIN public.profiles p ON u.id = p.id
  ORDER BY u.created_at DESC;
END;
$$;

-- 3. دالة تعديل صلاحية المستخدم (ترقية أو تخفيض) بأمان
CREATE OR REPLACE FUNCTION public.set_user_role_for_admin(target_user_id UUID, target_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin BOOLEAN := FALSE;
BEGIN
  SELECT (role = 'admin') INTO is_admin
  FROM public.profiles
  WHERE id = auth.uid();

  IF is_admin IS NOT TRUE THEN
    RAISE EXCEPTION 'Access denied: Requires administrator privilege';
  END IF;

  IF target_role NOT IN ('admin', 'user') THEN
    RAISE EXCEPTION 'Invalid role: must be admin or user';
  END IF;

  UPDATE public.profiles
  SET role = target_role, updated_at = now()
  WHERE id = target_user_id;

  RETURN TRUE;
END;
$$;

-- منح إذن الاستدعاء للمستخدمين المسجلين (الدوال تتحقق داخلياً من صلاحية الأدمن)
GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_users_for_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_user_role_for_admin(UUID, TEXT) TO authenticated;

-- مزامنة الحسابات السابقة التي قد تكون مسجلة في auth.users ولم يُنشأ لها صف في profiles
INSERT INTO public.profiles (id, email, name, role)
SELECT 
  u.id, 
  u.email, 
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)), 
  'user'
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

-- تصحيح معرفات اليوميات القديمة لتكون فريدة لكل مستخدم وتاريخ لمنع تعارض المفتاح الأساسي (journals_pkey)
UPDATE public.journals
SET id = 'entry-' || user_id || '-' || date
WHERE id NOT LIKE 'entry-%-%-%-%-%';

-- ==============================================================================
-- كيفية تعيين حسابك كـ "أدمن" (Admin):
-- بعد تسجيل حسابك بالبريد الإلكتروني في التطبيق، قم بتشغيل الأمر التالي:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'ضع_بريدك_هنا@example.com';
-- ==============================================================================
