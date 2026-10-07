-- =====================================================================
-- SỔ TANG ĐIỆN TỬ - Khởi tạo toàn bộ database cho project Supabase MỚI
-- Chạy 1 lần trong Supabase Dashboard > SQL Editor (project trống)
-- =====================================================================

-- ---------- 1. Kiểu dữ liệu ----------
CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'employee');

-- ---------- 2. Bảng ----------
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  birth_date DATE,
  death_date DATE,
  biography TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  qr_code_url TEXT,
  maps_url TEXT,
  slug TEXT UNIQUE,
  is_buried BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  is_celebrity BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  event_date DATE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT comments_author_name_length CHECK (char_length(btrim(author_name)) BETWEEN 1 AND 100),
  CONSTRAINT comments_content_length CHECK (char_length(btrim(content)) BETWEEN 1 AND 2000),
  CONSTRAINT comments_author_email_length CHECK (author_email IS NULL OR char_length(author_email) <= 100)
);

CREATE TABLE public.playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  slide_duration INTEGER NOT NULL DEFAULT 15,
  profile_ids TEXT[] NOT NULL DEFAULT '{}',
  auto_play BOOLEAN NOT NULL DEFAULT true,
  loop BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  position TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid()
);

-- ---------- 3. Index ----------
CREATE INDEX idx_photos_profile_id ON public.photos(profile_id);
CREATE INDEX idx_timeline_events_profile_id ON public.timeline_events(profile_id);
CREATE INDEX idx_comments_profile_id ON public.comments(profile_id);
CREATE INDEX idx_playlists_created_at ON public.playlists(created_at DESC);

-- ---------- 4. Hàm kiểm tra quyền ----------
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
$$;

-- Nhân viên bị khóa (is_active = false) sẽ mất quyền
CREATE OR REPLACE FUNCTION public.is_employee()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles r
    JOIN public.employees e ON e.user_id = r.user_id
    WHERE r.user_id = auth.uid() AND r.role = 'employee' AND e.is_active IS NOT FALSE
  )
$$;

CREATE OR REPLACE FUNCTION public.has_valid_role()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.is_admin() OR public.is_employee()
$$;

-- ---------- 5. Trigger ----------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_playlists_updated_at BEFORE UPDATE ON public.playlists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Xóa nhân viên thì thu hồi luôn quyền employee của tài khoản đó
CREATE OR REPLACE FUNCTION public.revoke_employee_role()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  DELETE FROM public.user_roles WHERE user_id = OLD.user_id AND role = 'employee';
  RETURN OLD;
END;
$$;

CREATE TRIGGER revoke_employee_role_on_delete AFTER DELETE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.revoke_employee_role();

-- Chống spam: tối đa 30 lời chia buồn / phút cho mỗi hồ sơ (admin/nhân viên không bị giới hạn)
CREATE OR REPLACE FUNCTION public.limit_comment_rate()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF public.has_valid_role() THEN
    RETURN NEW;
  END IF;

  IF (
    SELECT count(*) FROM public.comments
    WHERE profile_id = NEW.profile_id
      AND created_at > now() - interval '1 minute'
  ) >= 30 THEN
    RAISE EXCEPTION 'Too many comments, please try again later'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER limit_comment_rate_before_insert BEFORE INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.limit_comment_rate();

-- ---------- 6. Row Level Security ----------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- profiles: khách xem hồ sơ đã xuất bản, admin/nhân viên quản lý tất cả
CREATE POLICY "Anyone can view published profiles" ON public.profiles
  FOR SELECT USING (is_published = true);
CREATE POLICY "Staff can manage all profiles" ON public.profiles
  FOR ALL TO authenticated USING (public.has_valid_role()) WITH CHECK (public.has_valid_role());

-- photos
CREATE POLICY "Anyone can view photos of published profiles" ON public.photos
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = photos.profile_id AND p.is_published = true));
CREATE POLICY "Staff can manage all photos" ON public.photos
  FOR ALL TO authenticated USING (public.has_valid_role()) WITH CHECK (public.has_valid_role());

-- timeline_events
CREATE POLICY "Anyone can view timeline of published profiles" ON public.timeline_events
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = timeline_events.profile_id AND p.is_published = true));
CREATE POLICY "Staff can manage all timeline events" ON public.timeline_events
  FOR ALL TO authenticated USING (public.has_valid_role()) WITH CHECK (public.has_valid_role());

-- comments: khách gửi và xem lời chia buồn công khai, admin/nhân viên quản lý
CREATE POLICY "Guests can view public comments" ON public.comments
  FOR SELECT TO anon USING (is_public = true);
CREATE POLICY "Anyone can add comments to published profiles" ON public.comments
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = comments.profile_id AND p.is_published = true));
CREATE POLICY "Staff can manage all comments" ON public.comments
  FOR ALL TO authenticated USING (public.has_valid_role()) WITH CHECK (public.has_valid_role());

-- playlists: ai cũng xem được (màn hình trình chiếu), admin/nhân viên quản lý
CREATE POLICY "Anyone can view playlists" ON public.playlists
  FOR SELECT USING (true);
CREATE POLICY "Staff can manage playlists" ON public.playlists
  FOR ALL TO authenticated USING (public.has_valid_role()) WITH CHECK (public.has_valid_role());

-- user_roles: người dùng xem quyền của mình, admin quản lý tất cả
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- employees: nhân viên xem hồ sơ của mình, admin quản lý tất cả
CREATE POLICY "Employees can view their own record" ON public.employees
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all employees" ON public.employees
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---------- 7. Quyền truy cập qua Data API ----------
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.profiles, public.photos, public.timeline_events, public.playlists TO anon;
-- Khách không đọc được author_email (đang chứa số điện thoại người gửi)
REVOKE ALL ON public.comments FROM anon;
GRANT SELECT (id, profile_id, author_name, content, is_public, created_at) ON public.comments TO anon;
GRANT INSERT (profile_id, author_name, author_email, content) ON public.comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- ---------- 8. Realtime ----------
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.photos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.timeline_events;

-- =====================================================================
-- SAU KHI CHẠY XONG: tạo tài khoản trong Authentication > Users > Add user
-- (tick "Auto Confirm User"), rồi chạy riêng câu lệnh dưới với email đó
-- để cấp quyền admin:
--
-- INSERT INTO public.user_roles (user_id, role)
-- SELECT id, 'admin' FROM auth.users WHERE email = 'email-cua-ban@example.com';
-- =====================================================================
