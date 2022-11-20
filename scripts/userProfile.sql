-- LAST RUN: NOV 20, 2022 - 10:38AM
DROP TABLE IF EXISTS user_profile CASCADE;

CREATE TABLE user_profile (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE, --TIMESTAMPTZ no syntax highlighting ON intellisense
  username VARCHAR(254) UNIQUE,
  full_name VARCHAR(254),
  avatar_url VARCHAR(254)
);
-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security FOR more details.
ALTER TABLE user_profile
  ENABLE ROW LEVEL SECURITY;

CREATE policy "Profiles viewable by everyone." ON user_profile
  FOR SELECT USING (TRUE);

CREATE policy "Users can insert into their own profile." ON user_profile
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE policy "Users can update own profile." ON user_profile
  FOR UPDATE USING (auth.uid() = id);

-- Set up Storage!
INSERT INTO storage.buckets (id, name)
  VALUES ('avatars', 'avatars');

-- Set up access controls FOR storage.
-- See https://supabase.com/docs/guides/storage#policy-examples FOR more details.
CREATE policy "Avatar images are publicly accessible." ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE policy "Anyone can upload an avatar." ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars');

CREATE policy "Anyone can update their own avatar." ON storage.objects
  FOR UPDATE USING (auth.uid() = owner) WITH CHECK (bucket_id = 'avatars');