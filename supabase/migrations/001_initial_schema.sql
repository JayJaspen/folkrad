-- ============================================================
-- Folkrådet – Komplett databasschema
-- ============================================================

-- Aktivera UUID-extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILER (utökar Supabase auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username        TEXT UNIQUE NOT NULL,
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT NOT NULL,
  phone_verified  BOOLEAN DEFAULT FALSE,
  gender          TEXT CHECK (gender IN ('man','kvinna','annat')),
  birth_year      INTEGER NOT NULL CHECK (birth_year <= EXTRACT(YEAR FROM NOW()) - 18),
  lan             TEXT NOT NULL,
  is_admin        BOOLEAN DEFAULT FALSE,
  is_suspended    BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  last_answer_at  TIMESTAMPTZ
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins see all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE)
  );

CREATE POLICY "Insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================
-- SMS-VERIFIERINGSKODER
-- ============================================================
CREATE TABLE public.sms_verifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone      TEXT NOT NULL,
  code       TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sms_verifications ENABLE ROW LEVEL SECURITY;
-- Hanteras enbart server-side med service role

-- ============================================================
-- VECKANS FRÅGA
-- ============================================================
CREATE TABLE public.weekly_questions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT NOT NULL,
  description  TEXT,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  week_number  INTEGER NOT NULL,
  year         INTEGER NOT NULL,
  is_active    BOOLEAN DEFAULT TRUE,
  created_by   UUID REFERENCES public.profiles(id),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(week_number, year)
);

ALTER TABLE public.weekly_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All authenticated can read questions" ON public.weekly_questions
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Only admins insert questions" ON public.weekly_questions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin)
  );
CREATE POLICY "Only admins update questions" ON public.weekly_questions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin)
  );

-- ============================================================
-- SVARSALTERNATIV FÖR VECKANS FRÅGA
-- ============================================================
CREATE TABLE public.question_options (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES public.weekly_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  sort_order  INTEGER DEFAULT 0
);

ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All authenticated can read options" ON public.question_options
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Only admins manage options" ON public.question_options
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin)
  );

-- ============================================================
-- RÖSTER PÅ VECKANS FRÅGA
-- ============================================================
CREATE TABLE public.question_votes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES public.weekly_questions(id) ON DELETE CASCADE,
  option_id   UUID REFERENCES public.question_options(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  voted_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(question_id, user_id)
);

ALTER TABLE public.question_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users vote once per question" ON public.question_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "All authenticated can read votes" ON public.question_votes
  FOR SELECT TO authenticated USING (TRUE);

-- ============================================================
-- PARTIOMRÖSTNING (väljarbarometer)
-- ============================================================
CREATE TABLE public.party_votes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  party      TEXT NOT NULL,
  voted_at   TIMESTAMPTZ DEFAULT NOW(),
  vote_date  DATE DEFAULT CURRENT_DATE
);

ALTER TABLE public.party_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users insert own party vote" ON public.party_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "All authenticated read party votes" ON public.party_votes
  FOR SELECT TO authenticated USING (TRUE);

-- Index för att hämta senaste röst per användare per dag
CREATE INDEX idx_party_votes_user_date ON public.party_votes(user_id, vote_date);

-- ============================================================
-- FRÅGEFÖRSLAG FRÅN ANVÄNDARE
-- ============================================================
CREATE TABLE public.question_suggestions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  username    TEXT NOT NULL,
  suggestion  TEXT NOT NULL,
  description TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  is_read     BOOLEAN DEFAULT FALSE
);

ALTER TABLE public.question_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users insert suggestions" ON public.question_suggestions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users see own suggestions" ON public.question_suggestions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins see all suggestions" ON public.question_suggestions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin)
  );

-- ============================================================
-- CPM BANNERS
-- ============================================================
CREATE TABLE public.banners (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  position    TEXT CHECK (position IN ('left','right')) DEFAULT 'left',
  adsense_slot TEXT,
  image_url   TEXT,
  link_url    TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All authenticated read banners" ON public.banners
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Public read active banners" ON public.banners
  FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins manage banners" ON public.banners
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin)
  );

-- ============================================================
-- INSTÄLLNINGAR
-- ============================================================
CREATE TABLE public.site_settings (
  key   TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All authenticated read settings" ON public.site_settings
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Admins manage settings" ON public.site_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin)
  );

INSERT INTO public.site_settings (key, value) VALUES
  ('site_name', 'Folkrådet'),
  ('admin_email', 'info@folkradet.se'),
  ('adsense_client', ''),
  ('adsense_slot_left', ''),
  ('adsense_slot_right', '');

-- ============================================================
-- FUNKTIONER & TRIGGERS
-- ============================================================

-- Trigger: uppdatera last_answer_at när en användare röstar
CREATE OR REPLACE FUNCTION update_last_answer_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles SET last_answer_at = NOW() WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_question_vote
  AFTER INSERT ON public.question_votes
  FOR EACH ROW EXECUTE FUNCTION update_last_answer_at();

-- Funktion: räkna antal svar per fråga med filter
CREATE OR REPLACE FUNCTION get_question_results(
  p_question_id UUID,
  p_age_group   TEXT DEFAULT NULL,
  p_gender      TEXT DEFAULT NULL,
  p_lan         TEXT DEFAULT NULL
)
RETURNS TABLE(option_id UUID, option_text TEXT, vote_count BIGINT) AS $$
DECLARE
  v_birth_min INTEGER;
  v_birth_max INTEGER;
  v_current_year INTEGER := EXTRACT(YEAR FROM NOW())::INTEGER;
BEGIN
  IF p_age_group = '18–25' THEN v_birth_min := v_current_year - 25; v_birth_max := v_current_year - 18;
  ELSIF p_age_group = '26–35' THEN v_birth_min := v_current_year - 35; v_birth_max := v_current_year - 26;
  ELSIF p_age_group = '36–45' THEN v_birth_min := v_current_year - 45; v_birth_max := v_current_year - 36;
  ELSIF p_age_group = '46–55' THEN v_birth_min := v_current_year - 55; v_birth_max := v_current_year - 46;
  ELSIF p_age_group = '56–65' THEN v_birth_min := v_current_year - 65; v_birth_max := v_current_year - 56;
  ELSIF p_age_group = '65+' THEN v_birth_min := 1900; v_birth_max := v_current_year - 66;
  END IF;

  RETURN QUERY
  SELECT
    qo.id AS option_id,
    qo.option_text,
    COUNT(qv.id) AS vote_count
  FROM public.question_options qo
  LEFT JOIN public.question_votes qv ON qv.option_id = qo.id
  LEFT JOIN public.profiles p ON p.id = qv.user_id
  WHERE qo.question_id = p_question_id
    AND (p_age_group IS NULL OR (p.birth_year BETWEEN v_birth_min AND v_birth_max))
    AND (p_gender IS NULL OR p.gender = p_gender)
    AND (p_lan IS NULL OR p.lan = p_lan)
  GROUP BY qo.id, qo.option_text, qo.sort_order
  ORDER BY qo.sort_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funktion: hämta partiröst-statistik med filter
CREATE OR REPLACE FUNCTION get_party_results(
  p_age_group TEXT DEFAULT NULL,
  p_gender    TEXT DEFAULT NULL,
  p_lan       TEXT DEFAULT NULL
)
RETURNS TABLE(party TEXT, vote_count BIGINT) AS $$
DECLARE
  v_birth_min INTEGER;
  v_birth_max INTEGER;
  v_current_year INTEGER := EXTRACT(YEAR FROM NOW())::INTEGER;
BEGIN
  IF p_age_group = '18–25' THEN v_birth_min := v_current_year - 25; v_birth_max := v_current_year - 18;
  ELSIF p_age_group = '26–35' THEN v_birth_min := v_current_year - 35; v_birth_max := v_current_year - 26;
  ELSIF p_age_group = '36–45' THEN v_birth_min := v_current_year - 45; v_birth_max := v_current_year - 36;
  ELSIF p_age_group = '46–55' THEN v_birth_min := v_current_year - 55; v_birth_max := v_current_year - 46;
  ELSIF p_age_group = '56–65' THEN v_birth_min := v_current_year - 65; v_birth_max := v_current_year - 56;
  ELSIF p_age_group = '65+' THEN v_birth_min := 1900; v_birth_max := v_current_year - 66;
  END IF;

  RETURN QUERY
  SELECT
    pv.party,
    COUNT(pv.id) AS vote_count
  FROM (
    SELECT DISTINCT ON (user_id) user_id, party
    FROM public.party_votes
    ORDER BY user_id, voted_at DESC
  ) pv
  JOIN public.profiles p ON p.id = pv.user_id
  WHERE (p_age_group IS NULL OR (p.birth_year BETWEEN v_birth_min AND v_birth_max))
    AND (p_gender IS NULL OR p.gender = p_gender)
    AND (p_lan IS NULL OR p.lan = p_lan)
  GROUP BY pv.party
  ORDER BY vote_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
