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
DROP TYPE IF EXISTS expected_response_type CASCADE;
DROP TYPE IF EXISTS team_role CASCADE;

CREATE TYPE expected_response_type AS ENUM('text', 'number', 'date', 'daterange', 'time', 'email', 'select', 'slider', 'multiple');
CREATE TYPE team_role AS ENUM('member','manager');

-- START user_profile_table
CREATE TABLE user_profile_table (
  user_id UUID REFERENCES auth.users(id) NOT NULL PRIMARY KEY,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  username VARCHAR(254) UNIQUE,
  full_name VARCHAR(254),
  avatar_url VARCHAR(254)
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
  team_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  team_name VARCHAR(254),
  user_id UUID REFERENCES auth.users(id)
);

CREATE TABLE team_role_table(
  team_id INT REFERENCES team_table(team_id),
  user_id UUID REFERENCES auth.users(id),
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

CREATE TABLE form_table(
  form_id INT GENERATED ALWAYS AS IDENTITY UNIQUE PRIMARY KEY,
  form_name_id INT REFERENCES form_name_table(form_name_id),
  form_owner UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  question_id INT REFERENCES question_table(question_id),
  response_value VARCHAR(254)[],
  response_owner UUID REFERENCES auth.users(id),
  response_comment VARCHAR(254) DEFAULT NULL,
  team_id INT REFERENCES team_table(team_id) DEFAULT 1
);

CREATE TABLE review_score_table(
  review_score_id INT GENERATED ALWAYS AS IDENTITY UNIQUE PRIMARY KEY,
  review_score_name VARCHAR(254),
  review_score_value INT,
  review_score_comment VARCHAR(254)
);

CREATE TABLE review_table(
  review_id INT GENERATED ALWAYS AS IDENTITY UNIQUE PRIMARY KEY,
  review_source UUID REFERENCES auth.users(id),
  review_target UUID REFERENCES auth.users(id),
  review_score INT REFERENCES review_score_table(review_score_id),
  team_id INT REFERENCES team_table(team_id)
);

CREATE TABLE form_priority_table (
  form_name_id INT REFERENCES form_name_table(form_name_id) PRIMARY KEY,
  priority INT[]
);