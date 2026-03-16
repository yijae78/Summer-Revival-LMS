// Full SQL schema for BYOS setup wizard (Step 5: SQL copy-paste)
// This is displayed to users who need to run it in Supabase SQL Editor
export const SCHEMA_SQL = `
-- ============================================
-- 교회 여름행사 LMS - 데이터베이스 스키마
-- BYOS (Bring Your Own Supabase) 설정용
-- Supabase SQL Editor에서 실행하세요
-- ============================================

-- 앱 메타 정보 (스키마 버전 관리)
CREATE TABLE IF NOT EXISTS _app_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO _app_meta (key, value) VALUES ('schema_version', '1.0.0')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- 행사
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  location TEXT,
  description TEXT,
  invite_code TEXT UNIQUE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 사용자 프로필 (Supabase Auth 확장)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  phone TEXT,
  avatar_url TEXT,
  has_seen_onboarding BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 참가자
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  birth_date DATE,
  gender TEXT,
  grade TEXT,
  phone TEXT,
  parent_phone TEXT,
  emergency_contact TEXT,
  health_info JSONB DEFAULT '{}',
  dietary_restrictions TEXT,
  transportation TEXT,
  fee_paid BOOLEAN DEFAULT false,
  consent_personal_info BOOLEAN DEFAULT false,
  consent_sensitive_info BOOLEAN DEFAULT false,
  consent_photo_video BOOLEAN DEFAULT false,
  consent_overseas_transfer BOOLEAN DEFAULT false,
  consent_ip TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- 조/분반
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  leader_id UUID REFERENCES profiles(id),
  color TEXT,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 조원 매핑
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  UNIQUE(group_id, participant_id)
);

-- 일정/세션
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  date DATE,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT,
  speaker TEXT,
  description TEXT,
  materials TEXT[],
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 출석
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'absent',
  checked_by UUID REFERENCES profiles(id),
  checked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(schedule_id, participant_id)
);

-- 공지사항
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'general',
  target_group_id UUID REFERENCES groups(id),
  is_pinned BOOLEAN DEFAULT false,
  author_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 자료
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  day_number INTEGER,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 퀴즈
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'standard',
  is_active BOOLEAN DEFAULT false,
  time_limit INTEGER,
  points_per_question INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 퀴즈 문제
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  type TEXT NOT NULL,
  options JSONB,
  correct_answer TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  points INTEGER DEFAULT 10
);

-- 퀴즈 응답
CREATE TABLE IF NOT EXISTS quiz_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES quiz_questions(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  answer TEXT,
  is_correct BOOLEAN,
  time_taken INTEGER,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(question_id, participant_id)
);

-- 포인트 이력
CREATE TABLE IF NOT EXISTS points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id),
  group_id UUID REFERENCES groups(id),
  category TEXT NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 갤러리 앨범
CREATE TABLE IF NOT EXISTS gallery_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  day_number INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 갤러리 사진
CREATE TABLE IF NOT EXISTS gallery_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID REFERENCES gallery_albums(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 숙소/방
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  capacity INTEGER,
  gender TEXT,
  floor TEXT
);

-- 방 배정
CREATE TABLE IF NOT EXISTS room_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  UNIQUE(room_id, participant_id)
);

-- 예산 카테고리
CREATE TABLE IF NOT EXISTS budget_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  planned_amount INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 수입 기록
CREATE TABLE IF NOT EXISTS income_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id),
  category TEXT NOT NULL DEFAULT 'registration_fee',
  amount INTEGER NOT NULL,
  description TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 지출 기록
CREATE TABLE IF NOT EXISTS expense_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  receipt_url TEXT,
  paid_by UUID REFERENCES profiles(id),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 인덱스 (성능 최적화)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_participants_event ON participants(event_id);
CREATE INDEX IF NOT EXISTS idx_schedules_event_day ON schedules(event_id, day_number);
CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(date);
CREATE INDEX IF NOT EXISTS idx_attendance_schedule ON attendance(schedule_id);
CREATE INDEX IF NOT EXISTS idx_attendance_participant ON attendance(participant_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_participant ON group_members(participant_id);
CREATE INDEX IF NOT EXISTS idx_points_event ON points(event_id);
CREATE INDEX IF NOT EXISTS idx_points_participant ON points(participant_id);
CREATE INDEX IF NOT EXISTS idx_points_group ON points(group_id);
CREATE INDEX IF NOT EXISTS idx_announcements_event ON announcements(event_id);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_question ON quiz_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_budget_categories_event ON budget_categories(event_id);
CREATE INDEX IF NOT EXISTS idx_income_records_event ON income_records(event_id);
CREATE INDEX IF NOT EXISTS idx_expense_records_event ON expense_records(event_id);

-- ============================================
-- RPC 함수
-- ============================================
CREATE OR REPLACE FUNCTION increment_group_points(p_group_id UUID, p_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE groups SET total_points = total_points + p_amount WHERE id = p_group_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Row Level Security (RLS) 활성화
-- ============================================
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE points ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_records ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS 정책 (기본: 인증 사용자 전체 접근)
-- 추후 역할별 세분화 예정
-- ============================================
CREATE POLICY "Authenticated users can read all" ON events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage events" ON events FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can read profiles" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

CREATE POLICY "Authenticated access participants" ON participants FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated access groups" ON groups FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated access group_members" ON group_members FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated access schedules" ON schedules FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated access attendance" ON attendance FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated access announcements" ON announcements FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated access materials" ON materials FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated access quizzes" ON quizzes FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated access quiz_questions" ON quiz_questions FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated access quiz_responses" ON quiz_responses FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated access points" ON points FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated access gallery_albums" ON gallery_albums FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated access gallery_photos" ON gallery_photos FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated access rooms" ON rooms FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated access room_assignments" ON room_assignments FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated access budget_categories" ON budget_categories FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated access income_records" ON income_records FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated access expense_records" ON expense_records FOR ALL TO authenticated USING (true);

-- Public access for join page (participants registration)
CREATE POLICY "Public can insert participants" ON participants FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public can read events by invite code" ON events FOR SELECT TO anon USING (invite_code IS NOT NULL);

-- ============================================
-- Storage 버킷
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('materials', 'materials', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage RLS
CREATE POLICY "Authenticated upload gallery" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gallery');
CREATE POLICY "Public read gallery" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'gallery');
CREATE POLICY "Authenticated upload materials" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'materials');
CREATE POLICY "Public read materials" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'materials');
CREATE POLICY "Authenticated upload avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Public read avatars" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'avatars');

-- ============================================
-- Realtime 활성화
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE points;
ALTER PUBLICATION supabase_realtime ADD TABLE quizzes;
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_responses;
ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
`.trim()
