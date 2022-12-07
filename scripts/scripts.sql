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
DROP TYPE IF EXISTS form_type CASCADE;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE TYPE expected_response_type AS ENUM('text', 'number', 'date', 'daterange', 'time', 'email', 'select', 'slider', 'multiple');
CREATE TYPE team_role AS ENUM('owner','admin','member');
CREATE TYPE request_status AS ENUM('approved', 'rejected', 'pending', 'revision', 'stale', 'cancelled');
CREATE TYPE form_type AS ENUM('request','review');

DROP TABLE IF EXISTS form_table CASCADE;
DROP TABLE IF EXISTS field_table CASCADE;
DROP TABLE IF EXISTS request_response_table CASCADE;
DROP TABLE IF EXISTS review_response_table CASCADE;
DROP TABLE IF EXISTS request_table CASCADE;
DROP TABLE IF EXISTS review_table CASCADE;


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
-- new below
-- Build form start
CREATE TABLE form_table (
  form_id INT GENERATED ALWAYS AS IDENTITY UNIQUE PRIMARY KEY,
  form_name VARCHAR(254),
  form_owner UUID REFERENCES user_profile_table(user_id),
  team_id UUID REFERENCES team_table(team_id),
  form_type form_type,
  form_priority INT[]
);

CREATE TABLE field_table (
  field_id INT GENERATED ALWAYS AS IDENTITY UNIQUE PRIMARY KEY,
  field_name VARCHAR(254),
  field_type VARCHAR(254),
  field_option VARCHAR(254)[],
  is_required BOOL,
  field_tooltip VARCHAR(254),
  form_table_id INT REFERENCES form_table(form_id)
);


-- Categorize form start
CREATE TABLE request_table (
  request_id INT GENERATED ALWAYS AS IDENTITY UNIQUE PRIMARY KEY,
  approver_id UUID REFERENCES user_profile_table(user_id),
  requested_by UUID REFERENCES user_profile_table(user_id),
  request_created_at TIMESTAMPTZ DEFAULT NOW(),
  request_status_updated_at TIMESTAMPTZ, -- approval or reject date here
  form_table_id INT REFERENCES form_table(form_id),
  request_title VARCHAR(254),
  on_behalf_of VARCHAR(254),
  request_description VARCHAR(254)
);
CREATE TABLE review_table (
  review_id INT GENERATED ALWAYS AS IDENTITY UNIQUE PRIMARY KEY,
  form_table_id INT REFERENCES form_table(form_id),
  review_source UUID REFERENCES user_profile_table(user_id),
  review_target UUID REFERENCES user_profile_table(user_id),
  review_created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Categorize form end

CREATE TABLE request_response_table (
  field_id INT REFERENCES field_table(field_id),
  response_value VARCHAR(254),
  request_id INT REFERENCES request_table(request_id),
  PRIMARY KEY (field_id, request_id)
);

CREATE TABLE review_response_table (
  field_id INT REFERENCES field_table(field_id),
  response_value VARCHAR(254),
  review_id INT REFERENCES review_table(review_id),
  PRIMARY KEY (field_id, review_id)
);
  
-- Build form end


