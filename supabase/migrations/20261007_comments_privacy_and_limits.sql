-- =====================================================================
-- Lời chia buồn: bảo vệ số điện thoại người gửi + chống spam
-- Chạy trong Supabase Dashboard > SQL Editor.
-- QUAN TRỌNG: deploy bản frontend mới TRƯỚC, rồi mới chạy file này
-- (bản frontend cũ dùng select("*") nên sẽ không đọc được lời chia buồn
-- sau khi khách bị giới hạn cột).
-- File chạy lại nhiều lần vẫn an toàn.
-- =====================================================================

-- ---------- 1. Khách chỉ đọc/ghi được các cột cần thiết ----------
-- author_email (đang chứa số điện thoại) không còn đọc được bằng anon key.
REVOKE ALL ON public.comments FROM anon;
GRANT SELECT (id, profile_id, author_name, content, is_public, created_at)
  ON public.comments TO anon;
GRANT INSERT (profile_id, author_name, author_email, content)
  ON public.comments TO anon;

-- Policy xem công khai chỉ áp dụng cho khách (anon). Tài khoản đã đăng nhập
-- nhưng không có quyền admin/nhân viên sẽ không đọc được gì; admin/nhân viên
-- vẫn đọc qua policy quản lý sẵn có.
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'comments'
      AND cmd = 'SELECT' AND roles @> '{public}'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.comments', pol.policyname);
  END LOOP;
END $$;

DROP POLICY IF EXISTS "Guests can view public comments" ON public.comments;
CREATE POLICY "Guests can view public comments" ON public.comments
  FOR SELECT TO anon USING (is_public = true);

-- ---------- 2. Giới hạn độ dài ----------
-- NOT VALID: chỉ áp dụng cho dòng mới, không đụng dữ liệu cũ.
ALTER TABLE public.comments
  DROP CONSTRAINT IF EXISTS comments_author_name_length,
  DROP CONSTRAINT IF EXISTS comments_content_length,
  DROP CONSTRAINT IF EXISTS comments_author_email_length;

ALTER TABLE public.comments
  ADD CONSTRAINT comments_author_name_length
    CHECK (char_length(btrim(author_name)) BETWEEN 1 AND 100) NOT VALID,
  ADD CONSTRAINT comments_content_length
    CHECK (char_length(btrim(content)) BETWEEN 1 AND 2000) NOT VALID,
  ADD CONSTRAINT comments_author_email_length
    CHECK (author_email IS NULL OR char_length(author_email) <= 100) NOT VALID;

-- ---------- 3. Giới hạn tần suất ----------
-- Tối đa 30 lời chia buồn / phút cho mỗi hồ sơ (admin/nhân viên không bị giới hạn).
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

DROP TRIGGER IF EXISTS limit_comment_rate_before_insert ON public.comments;
CREATE TRIGGER limit_comment_rate_before_insert BEFORE INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.limit_comment_rate();
