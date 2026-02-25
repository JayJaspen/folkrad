-- =============================================
-- FOLKRÅDET - Supabase Database Schema
-- =============================================
-- Run this in Supabase SQL Editor

-- 1. PROFILES (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  gender TEXT CHECK (gender IN ('Kvinna', 'Man', 'Annan', 'Vill ej ange')),
  birth_year INTEGER CHECK (birth_year >= 1900 AND birth_year <= 2010),
  county TEXT,
  party_preference TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. WEEK QUESTIONS
CREATE TABLE questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'multiple_choice' CHECK (type IN ('multiple_choice', 'open')),
  options JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ
);

-- 3. ANSWERS
CREATE TABLE answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(question_id, user_id)
);

-- 4. QUESTION SUGGESTIONS
CREATE TABLE suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  type TEXT DEFAULT 'suggestion' CHECK (type IN ('question', 'suggestion')),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CONTACT MESSAGES
CREATE TABLE contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. BANNERS
CREATE TABLE banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  size TEXT NOT NULL CHECK (size IN ('160x600', '336x280', '728x90')),
  is_active BOOLEAN DEFAULT true,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- QUESTIONS
CREATE POLICY "Questions are viewable by everyone"
  ON questions FOR SELECT USING (true);

CREATE POLICY "Only admins can insert questions"
  ON questions FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can update questions"
  ON questions FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can delete questions"
  ON questions FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ANSWERS
CREATE POLICY "Answers viewable by everyone for stats"
  ON answers FOR SELECT USING (true);

CREATE POLICY "Authenticated users can answer"
  ON answers FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own answer"
  ON answers FOR UPDATE USING (auth.uid() = user_id);

-- SUGGESTIONS
CREATE POLICY "Users can create suggestions"
  ON suggestions FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own suggestions"
  ON suggestions FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can update suggestions"
  ON suggestions FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- CONTACT MESSAGES
CREATE POLICY "Anyone can send contact messages"
  ON contact_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admins can view contact messages"
  ON contact_messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- BANNERS
CREATE POLICY "Banners viewable by everyone"
  ON banners FOR SELECT USING (true);

CREATE POLICY "Only admins can manage banners"
  ON banners FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- FUNCTIONS
-- =============================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, email, phone, gender, birth_year, county, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'gender',
    (NEW.raw_user_meta_data->>'birth_year')::INTEGER,
    NEW.raw_user_meta_data->>'county',
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to get question stats with filters
CREATE OR REPLACE FUNCTION get_question_stats(
  q_id UUID,
  filter_gender TEXT DEFAULT NULL,
  filter_county TEXT DEFAULT NULL,
  filter_age_min INTEGER DEFAULT NULL,
  filter_age_max INTEGER DEFAULT NULL
)
RETURNS TABLE (answer TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT a.answer, COUNT(*)::BIGINT
  FROM answers a
  JOIN profiles p ON a.user_id = p.id
  WHERE a.question_id = q_id
    AND (filter_gender IS NULL OR p.gender = filter_gender)
    AND (filter_county IS NULL OR p.county = filter_county)
    AND (filter_age_min IS NULL OR EXTRACT(YEAR FROM NOW()) - p.birth_year >= filter_age_min)
    AND (filter_age_max IS NULL OR EXTRACT(YEAR FROM NOW()) - p.birth_year <= filter_age_max)
  GROUP BY a.answer
  ORDER BY COUNT(*) DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get party stats
CREATE OR REPLACE FUNCTION get_party_stats()
RETURNS TABLE (party TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT p.party_preference, COUNT(*)::BIGINT
  FROM profiles p
  WHERE p.party_preference IS NOT NULL
  GROUP BY p.party_preference
  ORDER BY COUNT(*) DESC;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SEED DATA: Create admin user
-- =============================================
-- After running this schema, create an admin user via Supabase Auth,
-- then run:
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
