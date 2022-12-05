DROP TABLE IF EXISTS user_profile_table CASCADE;
DROP TABLE IF EXISTS team_table CASCADE;
DROP TABLE IF EXISTS team_role_table CASCADE;
DROP TABLE IF EXISTS form_name_table CASCADE;
DROP TABLE IF EXISTS question_table CASCADE;
DROP TABLE IF EXISTS form_table CASCADE;
DROP TABLE IF EXISTS form_priority_table CASCADE;
DROP TABLE IF EXISTS user_created_select_option_table CASCADE;
DROP TABLE IF EXISTS review_score_table CASCADE;
DROP TABLE IF EXISTS review_table CASCADE;
DROP TABLE IF EXISTS request_table CASCADE;
DROP TYPE IF EXISTS expected_response_type CASCADE;
DROP TYPE IF EXISTS team_role CASCADE;
DROP TYPE IF EXISTS request_status CASCADE;

CREATE TYPE expected_response_type AS ENUM('text', 'number', 'date', 'daterange', 'time', 'email', 'select', 'slider', 'multiple');
CREATE TYPE team_role AS ENUM('member','manager');
CREATE TYPE request_status AS ENUM('approved', 'rejected', 'pending', 'revision', 'stale', 'cancelled');

-- START user_profile_table
CREATE TABLE user_profile_table (
  user_id UUID REFERENCES auth.users(id) NOT NULL PRIMARY KEY,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  username VARCHAR(254) UNIQUE,
  full_name VARCHAR(254),
  avatar_url VARCHAR(254),
  email VARCHAR(254)
);
-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security FOR more details.
ALTER TABLE user_profile_table
  ENABLE ROW LEVEL SECURITY;

CREATE policy "Profiles viewable by everyone." ON user_profile_table
  FOR SELECT USING (TRUE);

CREATE policy "Users can insert into their own profile." ON user_profile_table
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE policy "Users can update own profile." ON user_profile_table
  FOR UPDATE USING (auth.uid() = user_id);
-- END user_profile_table

CREATE TABLE team_table(
  team_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_name VARCHAR(254),
  user_id UUID REFERENCES user_profile_table(user_id)
);

CREATE TABLE team_role_table(
  user_id UUID REFERENCES user_profile_table(user_id),
  team_id UUID REFERENCES team_table(team_id),
  team_role team_role,
  lock_account BOOL,
  PRIMARY KEY (team_id, user_id)
);

CREATE TABLE form_name_table(
  form_name_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  form_name VARCHAR(254)
);

CREATE TABLE question_table(
  question_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  question VARCHAR(254),
  expected_response_type expected_response_type
);

CREATE TABLE user_created_select_option_table(
  question_id INT REFERENCES question_table(question_id) PRIMARY KEY,
  question_option VARCHAR(254)[]
);

CREATE TABLE request_table(
  request_id INT GENERATED ALWAYS AS IDENTITY UNIQUE PRIMARY KEY
);

CREATE TABLE form_table(
  form_id INT GENERATED ALWAYS AS IDENTITY UNIQUE PRIMARY KEY,
  form_name_id INT REFERENCES form_name_table(form_name_id),
  form_owner UUID REFERENCES user_profile_table(user_id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  question_id INT REFERENCES question_table(question_id),
  response_value VARCHAR(254)[],
  response_owner UUID REFERENCES user_profile_table(user_id),
  response_comment VARCHAR(254) DEFAULT NULL,
  request_title VARCHAR(254),
  request_description VARCHAR(254),
  approver_id UUID REFERENCES user_profile_table(user_id),
  approval_status VARCHAR(254),
  request_id INT REFERENCES request_table(request_id),
  on_behalf_of VARCHAR(254),
  team_id UUID REFERENCES team_table(team_id),
  question_option_id INT REFERENCES user_created_select_option_table(question_id),
  is_draft BOOL
);

CREATE TABLE review_score_table(
  review_score_id INT GENERATED ALWAYS AS IDENTITY UNIQUE PRIMARY KEY,
  review_score_name VARCHAR(254),
  review_score_value INT,
  review_score_comment VARCHAR(254)
);

CREATE TABLE review_table(
  review_id INT GENERATED ALWAYS AS IDENTITY UNIQUE PRIMARY KEY,
  review_source UUID REFERENCES user_profile_table(user_id),
  review_target UUID REFERENCES user_profile_table(user_id),
  review_score INT REFERENCES review_score_table(review_score_id),
  team_id UUID REFERENCES team_table(team_id)
);

CREATE TABLE form_priority_table (
  form_name_id INT REFERENCES form_name_table(form_name_id) PRIMARY KEY,
  priority INT[]
);

CREATE OR REPLACE FUNCTION handle_new_user() RETURNS VOID AS $$
DECLARE
  full_name text;
BEGIN
  SELECT raw_user_meta_data->>'full_name' INTO full_name FROM auth.users WHERE id = auth.uid();
  INSERT INTO user_profile_table (user_id, full_name) VALUES (auth.uid(), full_name);
END;
$$ language plpgsql security definer;
;

DROP FUNCTION IF EXISTS handle_new_user();