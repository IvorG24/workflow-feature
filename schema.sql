DROP SCHEMA IF EXISTS public CASCADE;

CREATE SCHEMA public
  AUTHORIZATION postgres;

  -- Remove all policies for files
DROP POLICY IF EXISTS objects_policy ON storage.objects;
DROP POLICY IF EXISTS buckets_policy ON storage.buckets;

-- Delete file buckets created and files uploaded
DELETE FROM storage.objects;
DELETE FROM storage.buckets;

-- Allow all to access storage
CREATE POLICY objects_policy ON storage.objects FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY buckets_policy ON storage.buckets FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

INSERT INTO storage.buckets (id, name) VALUES ('USER_AVATARS', 'USER_AVATARS');
INSERT INTO storage.buckets (id, name) VALUES ('USER_SIGNATURES', 'USER_SIGNATURES');
INSERT INTO storage.buckets (id, name) VALUES ('TEAM_LOGOS', 'TEAM_LOGOS');
INSERT INTO storage.buckets (id, name) VALUES ('COMMENT_ATTACHMENTS', 'COMMENT_ATTACHMENTS');
INSERT INTO storage.buckets (id, name) VALUES ('REQUEST_ATTACHMENTS', 'REQUEST_ATTACHMENTS');

UPDATE storage.buckets SET public = true;

---------- Start: TABLES

-- Start: User and Teams
CREATE TABLE user_table (
    -- temporary
    user_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
    user_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    user_username VARCHAR(4000) UNIQUE NOT NULL,
    user_first_name VARCHAR(4000) NOT NULL,
    user_last_name VARCHAR(4000) NOT NULL,
    user_email VARCHAR(4000) UNIQUE NOT NULL,
    user_job_title VARCHAR(4000),
    user_phone_number VARCHAR(4000),
    user_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
    user_active_team_id UUID,
    user_active_app VARCHAR(4000) DEFAULT 'REQUEST' NOT NULL,
    user_avatar VARCHAR(4000),

    CHECK (user_username = LOWER(user_username))
);
CREATE TABLE team_table (
  team_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  team_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  team_name VARCHAR(4000) UNIQUE NOT NULL,
  team_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
  team_is_request_signature_required BOOLEAN DEFAULT FALSE NOT NULL,
  team_logo VARCHAR(4000),
  
  team_user_id UUID REFERENCES user_table(user_id) NOT NULL
);
CREATE TABLE team_member_table(
  team_member_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  team_member_role VARCHAR(4000) DEFAULT 'MEMBER' NOT NULL,
  team_member_date_created DATE DEFAULT NOW() NOT NULL,
  team_member_disabled BOOL DEFAULT FALSE NOT NULL,

  team_member_user_id UUID REFERENCES user_table(user_id) NOT NULL,
  team_member_team_id UUID REFERENCES team_table(team_id) NOT NULL,
  UNIQUE (team_member_team_id, team_member_user_id)
);
-- End: User and Teams

-- Start: Notification and Invitation
CREATE TABLE notification_table (
  notification_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  notification_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  notification_content VARCHAR(4000) NOT NULL,
  notification_is_read  BOOLEAN DEFAULT FALSE NOT NULL,
  notification_redirect_url VARCHAR(4000),
  notification_type VARCHAR(4000) NOT NULL,
  notification_app VARCHAR(4000) NOT NULL,

  notification_team_member_id UUID REFERENCES team_member_table(team_member_id) NOT NULL
);
CREATE TABLE invitation_table (
  invitation_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  invitation_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  invitation_to_email VARCHAR(4000) NOT NULL,

  invitation_from_team_member_id UUID REFERENCES team_member_table(team_member_id) NOT NULL
);
-- End: Notification and Invitation

-- Start: Form
CREATE TABLE form_table(
  form_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  form_name VARCHAR(4000) NOT NULL,
  form_description VARCHAR(4000) NOT NULL,
  form_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  form_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
  form_is_hidden BOOLEAN DEFAULT FALSE NOT NULL,
  form_is_signature_required BOOLEAN DEFAULT FALSE NOT NULL,
  form_app VARCHAR(4000) NOT NULL,

  form_team_member_id UUID REFERENCES team_member_table(team_member_id) NOT NULL
);
CREATE TABLE signer_table (
  signer_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  signer_is_primary_approver BOOLEAN DEFAULT FALSE NOT NULL,
  signer_action VARCHAR(4000) NOT NULL,
  signer_order INT NOT NULL,

  signer_form_id UUID REFERENCES form_table(form_id) NOT NULL,
  signer_team_member_id UUID REFERENCES team_member_table(team_member_id) NOT NULL
);
CREATE TABLE section_table (
  section_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  section_name VARCHAR(4000) NOT NULL,
  section_order INT NOT NULL,
  section_is_duplicatable BOOLEAN DEFAULT FALSE NOT NULL,

  section_form_id UUID REFERENCES form_table(form_id) NOT NULL
);
CREATE TABLE field_table (
  field_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  field_name VARCHAR(4000) NOT NULL,
  field_description VARCHAR(4000),
  field_is_required  BOOLEAN DEFAULT FALSE NOT NULL,
  field_type VARCHAR(4000) NOT NULL,
  field_order INT NOT NULL,
  field_is_positive_metric BOOLEAN DEFAULT TRUE NOT NULL,

  field_section_id UUID REFERENCES section_table(section_id) NOT NULL
);
CREATE TABLE option_table (
  option_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  option_value VARCHAR(4000) NOT NULL,
  option_description VARCHAR(4000),
  option_order INT NOT NULL,

  option_field_id UUID REFERENCES field_table(field_id) NOT NULL
);
-- End: Form

-- Start: Request
CREATE TABLE request_table(
  request_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,

  request_team_member_id UUID REFERENCES team_member_table(team_member_id),
  request_form_id UUID REFERENCES form_table(form_id) NOT NULL
);
CREATE TABLE request_response_table(
  request_response_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  request_response VARCHAR(4000) NOT NULL,
  request_response_duplicatable_section_id UUID,

  request_response_request_id UUID REFERENCES request_table(request_id) NOT NULL,
  request_response_field_id UUID REFERENCES field_table(field_id) NOT NULL
);
CREATE TABLE request_signer_table(
  request_signer_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  request_signer_status VARCHAR(4000) DEFAULT 'PENDING' NOT NULL,

  request_signer_request_id UUID REFERENCES request_table(request_id) NOT NULL,
  request_signer_signer_id UUID REFERENCES signer_table(signer_id) NOT NULL
);
-- End: Request

-- Start: Attachments
CREATE TABLE attachment_table (
    attachment_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
    attachment_name VARCHAR(4000) NOT NULL,
    attachment_prefixed_name VARCHAR(4000) NOT NULL,
    attachment_value VARCHAR(4000) NOT NULL,
    attachment_bucket VARCHAR(4000) NOT NULL,
    attachment_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    attachment_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
    attachment_attachment_type VARCHAR(4000) NOT NULL
);
-- End: Attachments

-- Start: Comments
CREATE TABLE comment_table(
  comment_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  comment_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  comment_content VARCHAR(4000),
  comment_is_edited  BOOLEAN DEFAULT FALSE,
  comment_last_updated TIMESTAMPTZ,
  comment_is_disabled  BOOLEAN DEFAULT FALSE NOT NULL,
  comment_type VARCHAR(4000) NOT NULL,

  comment_request_id UUID REFERENCES request_table(request_id) NOT NULL,
  comment_team_member_id UUID REFERENCES team_member_table(team_member_id) NOT NULL
);
-- End: Comments

---------- End: TABLES

---------- Start: FUNCTIONS

CREATE FUNCTION get_current_date()
RETURNS DATE
AS $$
BEGIN
    RETURN CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

---------- End: FUNCTIONS


GRANT ALL ON ALL TABLES IN SCHEMA public TO PUBLIC;
GRANT ALL ON ALL TABLES IN SCHEMA public TO POSTGRES;

GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;