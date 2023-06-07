DROP SCHEMA IF EXISTS public CASCADE;

CREATE SCHEMA public
  AUTHORIZATION postgres;

-- Remove all policies for files
DROP POLICY IF EXISTS objects_policy ON storage.objects;
DROP POLICY IF EXISTS buckets_policy ON storage.buckets;

-- Delete file buckets created and files uploaded
DELETE FROM storage.objects;
DELETE FROM storage.buckets;



CREATE EXTENSION IF NOT EXISTS plv8;

-- Allow all to access storage
CREATE POLICY objects_policy ON storage.objects FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY buckets_policy ON storage.buckets FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

UPDATE storage.buckets SET public = true;
-- References:
-- https://www.upsolver.com/blog/difference-between-star-schema-and-snowflake-schema
-- https://www.thoughtspot.com/data-trends/data-modeling/star-schema-vs-snowflake-schema

CREATE TABLE app_table (
  app_id VARCHAR(4000) PRIMARY KEY NOT NULL
);
-- Start: Attachments
CREATE TABLE attachment_type_table(
  attachment_type_id VARCHAR(4000) PRIMARY KEY NOT NULL
);
CREATE TABLE attachment_bucket_table(
  attachment_bucket_id VARCHAR(4000) PRIMARY KEY NOT NULL
);
CREATE TABLE attachment_table (
  attachment_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  attachment_name VARCHAR(4000) NOT NULL,
  attachment_prefixed_name VARCHAR(4000) NOT NULL,
  attachment_value VARCHAR(4000) NOT NULL,
  attachment_bucket_id VARCHAR(4000) REFERENCES attachment_bucket_table(attachment_bucket_id) NOT NULL,
  attachment_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  attachment_is_disabled  BOOLEAN DEFAULT FALSE NOT NULL,
  attachment_attachment_type_id VARCHAR(4000) REFERENCES attachment_type_table(attachment_type_id) NOT NULL
  -- ! Archived
  -- attachment_user_id UUID REFERENCES user_profile_table(user_id) NOT NULL
);
-- End: Attachments


-- Start: User and teams
CREATE TABLE user_profile_table (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY NOT NULL,
  user_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  username VARCHAR(4000) UNIQUE NOT NULL,
  user_first_name VARCHAR(4000) NOT NULL,
  user_last_name VARCHAR(4000) NOT NULL,
  user_avatar_attachment_id UUID REFERENCES attachment_table(attachment_id),
  user_email VARCHAR(4000) UNIQUE NOT NULL,
  user_job_title VARCHAR(4000),
  user_phone_number VARCHAR(4000),
  user_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
  user_active_team_id UUID,
  CHECK (username = LOWER(username))
);
CREATE TABLE team_table (
  team_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  team_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  team_name VARCHAR(4000) UNIQUE NOT NULL,
  team_logo_attachment_id UUID REFERENCES attachment_table(attachment_id),
  team_user_id UUID REFERENCES user_profile_table(user_id) NOT NULL,
  team_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
  team_is_requisition_form_hidden BOOLEAN DEFAULT TRUE NOT NULL,
  team_is_trip_ticketing_hidden BOOLEAN DEFAULT TRUE NOT NULL
);
CREATE TABLE member_role_table (
  member_role_id VARCHAR(4000) PRIMARY KEY NOT NULL
);
-- End: User and teams

-- Start: Notifications and team invitations
CREATE TABLE notification_type_table (
  notification_type_id VARCHAR(4000) PRIMARY KEY NOT NULL
);
CREATE TABLE notification_table (
  notification_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  notification_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  notification_content VARCHAR(4000) NOT NULL,
  notification_is_read  BOOLEAN DEFAULT FALSE NOT NULL,
  notification_redirect_url VARCHAR(4000),
  notification_user_id UUID REFERENCES user_profile_table(user_id) NOT NULL,
  notification_team_id UUID REFERENCES team_table(team_id),
  notification_notification_type_id VARCHAR(4000) REFERENCES notification_type_table(notification_type_id) NOT NULL,
  notification_app_id VARCHAR(4000)  REFERENCES app_table(app_id) NOT NULL
);
CREATE TABLE invitation_table (
  invitation_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  invitation_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  invitation_to_email VARCHAR(4000) NOT NULL,
  invitation_team_id UUID REFERENCES team_table(team_id) NOT NULL,
  invitation_from_user_id UUID REFERENCES user_profile_table(user_id) NOT NULL
);
-- End: Notifications and team invitations

-- Start: Tables for form
CREATE TABLE field_type_table (
  field_type_id VARCHAR(4000) DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL
);

CREATE TABLE field_table (
  field_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  field_name VARCHAR(4000) NOT NULL,
  field_description VARCHAR(4000),
  field_is_required  BOOLEAN DEFAULT FALSE NOT NULL,
  field_field_type_id VARCHAR(4000) REFERENCES field_type_table (field_type_id) NOT NULL,
  field_slider_min INT,
  field_slider_max INT
);

CREATE TABLE option_table (
  option_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  option_value_varchar VARCHAR(4000),
  option_description VARCHAR(4000)
  -- * Archived
  -- option_value_int INT, 
  -- option_value_date DATE,
  -- option_value_time TIME,
  -- option_value_boolean BOOLEAN,
);

CREATE TABLE response_table (
  response_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  response_value_varchar VARCHAR(4000),  
  response_value_int INT,
  response_value_date DATE, 
  -- * Archived
  -- response_value_time TIME,
  response_value_boolean BOOLEAN,
  response_value_date_start DATE,
  response_value_date_end DATE
);

CREATE TABLE form_table(
  form_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  form_user_id UUID REFERENCES user_profile_table (user_id) NOT NULL,
  form_team_id UUID REFERENCES team_table (team_id) NOT NULL,
  form_name VARCHAR(4000) NOT NULL,
  form_description VARCHAR(4000) NOT NULL,
  form_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  form_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
  -- ! Archived
  form_is_hidden BOOLEAN DEFAULT FALSE NOT NULL,
  form_is_archived BOOLEAN DEFAULT FALSE NOT NULL,
  form_app_id VARCHAR(4000) REFERENCES app_table(app_id) NOT NULL
);
-- End: Tables for form

-- Start: Comments
CREATE TABLE comment_type_table(
  comment_type_id VARCHAR(4000) PRIMARY KEY NOT NULL
);
CREATE TABLE comment_table(
  comment_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  comment_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  comment_user_id UUID REFERENCES user_profile_table(user_id) NOT NULL,
  comment_content VARCHAR(4000),
  comment_is_edited  BOOLEAN DEFAULT FALSE,
  comment_last_updated TIMESTAMPTZ,
  comment_is_disabled  BOOLEAN DEFAULT FALSE NOT NULL,
  comment_app_id VARCHAR(4000) REFERENCES app_table(app_id) NOT NULL,
  comment_comment_type_id VARCHAR(4000) REFERENCES comment_type_table(comment_type_id) NOT NULL
);
-- End: Comments

-- Start: Team and form settings
CREATE TABLE team_setting_table(
  team_setting_id VARCHAR(4000)PRIMARY KEY NOT NULL,
  team_setting_description VARCHAR(4000) NOT NULL,
  team_setting_app_id VARCHAR(4000) REFERENCES app_table(app_id) NOT NULL
);
CREATE TABLE form_setting_table(
  form_setting_id VARCHAR(4000) PRIMARY KEY NOT NULL,
  form_setting_description VARCHAR(4000) NOT NULL,
  form_setting_app_id VARCHAR(4000) REFERENCES app_table(app_id) NOT NULL
);

CREATE TABLE receiver_status_table (
  receiver_status_id VARCHAR(4000) PRIMARY KEY NOT NULL
);
CREATE TABLE action_table(
  action_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  action_name VARCHAR(4000) NOT NULL
);
CREATE TABLE field_tag_table (
  field_tag_id VARCHAR(4000) PRIMARY KEY NOT NULL
);
CREATE TABLE submitted_form_status_table (
  submitted_form_status_id VARCHAR(4000) PRIMARY KEY NOT NULL
);
-- Information about the submitted form.
CREATE TABLE submitted_form_table (
  submitted_form_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  submitted_form_form_id UUID REFERENCES form_table (form_id) NOT NULL,
  submitted_form_user_id UUID REFERENCES user_profile_table (user_id) NOT NULL,
  submitted_form_team_id UUID REFERENCES team_table (team_id) NOT NULL,
  submitted_form_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  submitted_form_status_last_updated TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  submitted_form_is_disabled BOOL DEFAULT FALSE NOT NULL,
  submitted_form_signature_attachment_id UUID REFERENCES attachment_table(attachment_id),
  submitted_form_submitted_form_status_id VARCHAR(4000) REFERENCES submitted_form_status_table (submitted_form_status_id),
  -- app_id
  submitted_form_app_id VARCHAR(4000) REFERENCES app_table(app_id) NOT NULL
);

-- Start: User and teams
CREATE TABLE team_member_table(
  team_member_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  team_member_user_id UUID REFERENCES user_profile_table(user_id) NOT NULL,
  team_member_team_id UUID REFERENCES team_table(team_id) NOT NULL,
  team_member_member_role_id VARCHAR(4000) REFERENCES member_role_table(member_role_id) DEFAULT 'MEMBER' NOT NULL,
  team_member_date_created DATE DEFAULT NOW() NOT NULL,
  team_member_is_disabled BOOL DEFAULT FALSE NOT NULL,
  -- Make sure user is only a member of a team once.
  UNIQUE (team_member_team_id, team_member_user_id)
);
-- End: User and teams

-- Start: Form tables
CREATE TABLE field_option_table (
  field_option_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  field_option_field_id UUID REFERENCES field_table (field_id) NOT NULL,
  field_option_option_id UUID REFERENCES option_table (option_id) NOT NULL,
  field_option_order INT NOT NULL
);

CREATE TABLE response_option_table (
  response_option_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  response_option_response_id UUID REFERENCES response_table (response_id) NOT NULL,
  response_option_option_id UUID REFERENCES option_table (option_id) NOT NULL,
  response_option_order INT NOT NULL
);

-- Connects form to fields.
CREATE TABLE form_field_table (
  form_field_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  form_field_form_id UUID REFERENCES form_table (form_id) NOT NULL,
  form_field_field_id UUID REFERENCES field_table (field_id) NOT NULL,
  form_field_order INT NOT NULL
);

-- End: Form tables

-- Start: Settings
CREATE TABLE team_enables_setting_table(
  team_enables_setting_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  team_enables_setting_team_setting_id VARCHAR(4000) REFERENCES team_setting_table(team_setting_id),
  team_enables_setting_team_id UUID REFERENCES team_table(team_id),
  team_enables_setting_toggle BOOL NOT NULL,
  UNIQUE(team_enables_setting_team_setting_id, team_enables_setting_team_id)
);
CREATE TABLE form_enables_setting_table(
  form_enables_setting_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  form_enables_setting_form_setting_id VARCHAR(4000) REFERENCES form_setting_table(form_setting_id),
  form_enables_setting_form_id UUID REFERENCES form_table(form_id),
  form_enables_setting_toggle BOOL NOT NULL,
  UNIQUE(form_enables_setting_form_setting_id, form_enables_setting_form_id)
);
-- End: Settings

-- Start: Attachments
-- Idea: Attachments can be attached to other things.
CREATE TABLE signature_user_table (
  signature_user_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  signature_user_attachment_id UUID REFERENCES attachment_table(attachment_id) NOT NULL,
  signature_user_user_id UUID REFERENCES user_profile_table(user_id) NOT NULL,
  signature_user_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE TABLE attachment_submitted_form_table (
  attachment_submitted_form_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  attachment_submitted_form_attachment_id UUID REFERENCES attachment_table(attachment_id) NOT NULL,
  attachment_submitted_form_submitted_form_id UUID REFERENCES submitted_form_table(submitted_form_id) NOT NULL
);
CREATE TABLE attachment_comment_table (
  attachment_comment_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  attachment_comment_attachment_id UUID REFERENCES attachment_table(attachment_id) NOT NULL,
  attachment_comment_comment_id UUID REFERENCES comment_table(comment_id) NOT NULL
);
-- End: Attachments

-- Start: Comments
-- Idea: Comments can be attached to a request or review.
CREATE TABLE comment_submitted_form_table (
  comment_submitted_form_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  comment_submitted_form_comment_id UUID REFERENCES comment_table(comment_id) NOT NULL,
  comment_submitted_form_submitted_form_id UUID REFERENCES submitted_form_table(submitted_form_id) NOT NULL
);
-- End: Comments

CREATE TABLE form_receiver_table (
  form_receiver_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  form_receiver_form_id UUID REFERENCES form_table (form_id) NOT NULL,
  form_receiver_user_id UUID REFERENCES user_profile_table (user_id) NOT NULL,
  form_receiver_action_id UUID REFERENCES action_table (action_id) NOT NULL,
  form_receiver_is_primary_receiver BOOL NOT NULL,
  form_receiver_order INT NOT NULL
);

-- Start: Field tags
-- Just like attachments, tags can be attached to fields.
CREATE TABLE field_tag_field_table (
  field_tag_field_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  field_tag_field_field_id UUID REFERENCES field_table (field_id) NOT NULL,
  field_tag_field_field_tag_id VARCHAR(4000) REFERENCES field_tag_table (field_tag_id) NOT NULL
);
-- End: Field tags

-- Start: Submitted forms

-- Submitted form.
-- * Archived
-- CREATE submitted_form_submitted_form_status_table (
--   submitted_form_submitted_form_status_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
--   submitted_form_submitted_form_status_submitted_form_id UUID REFERENCES submitted_form_table (submitted_form_id) NOT NULL,
--   submitted_form_submitted_form_status_submitted_form_status_id VARCHAR(4000) REFERENCES submitted_form_status_table (submitted_form_status_id) NOT NULL
-- );


CREATE TABLE submitted_form_field_response_table (
  submitted_form_field_response_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  submitted_form_field_response_submitted_form_id UUID REFERENCES submitted_form_table (submitted_form_id) NOT NULL,
  -- * Archived
  -- submitted_form_field_response_form_id UUID REFERENCES form_table (form_id) NOT NULL,
  submitted_form_field_response_field_id UUID REFERENCES field_table (field_id) NOT NULL,
  submitted_form_field_response_response_id UUID REFERENCES response_table (response_id) NOT NULL,
  submitted_form_field_response_order INT NOT NULL
);

-- Receiver of the form and his/her status or action if there is attached.
CREATE TABLE submitted_form_receiver_table (
  submitted_form_receiver_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  submitted_form_receiver_submitted_form_id UUID REFERENCES submitted_form_table (submitted_form_id) NOT NULL,
  submitted_form_receiver_user_id UUID REFERENCES user_profile_table (user_id) NOT NULL,
  submitted_form_receiver_comment_id UUID REFERENCES comment_table (comment_id),
  submitted_form_receiver_action_id UUID REFERENCES action_table (action_id),
  submitted_form_receiver_receiver_status_id VARCHAR(4000) REFERENCES receiver_status_table (receiver_status_id),
  submitted_form_receiver_signature_attachment_id UUID REFERENCES attachment_table (attachment_id),
  submitted_form_receiver_status_last_updated TIMESTAMPTZ,
  submitted_form_receiver_order INT,
  submitted_form_receiver_is_primary_receiver BOOL NOT NULL
);

-- End: Submitted forms
INSERT INTO storage.buckets (id, name) VALUES ('USER_AVATARS', 'USER_AVATARS');
INSERT INTO storage.buckets (id, name) VALUES ('USER_SIGNATURES', 'USER_SIGNATURES');
INSERT INTO storage.buckets (id, name) VALUES ('TEAM_LOGOS', 'TEAM_LOGOS');
INSERT INTO storage.buckets (id, name) VALUES ('COMMENT_ATTACHMENTS', 'COMMENT_ATTACHMENTS');
INSERT INTO storage.buckets (id, name) VALUES ('REQUEST_ATTACHMENTS', 'REQUEST_ATTACHMENTS');

INSERT INTO attachment_bucket_table (attachment_bucket_id) VALUES ('USER_AVATARS');
INSERT INTO attachment_bucket_table (attachment_bucket_id) VALUES ('USER_SIGNATURES');
INSERT INTO attachment_bucket_table (attachment_bucket_id) VALUES ('TEAM_LOGOS');
INSERT INTO attachment_bucket_table (attachment_bucket_id) VALUES ('COMMENT_ATTACHMENTS');
INSERT INTO attachment_bucket_table (attachment_bucket_id) VALUES ('REQUEST_ATTACHMENTS');

INSERT INTO app_table (app_id) VALUES ('GENERAL');
INSERT INTO app_table (app_id) VALUES ('REQUEST');
INSERT INTO app_table (app_id) VALUES ('REVIEW');

INSERT INTO member_role_table (member_role_id) VALUES ('OWNER');
INSERT INTO member_role_table (member_role_id) VALUES ('ADMIN');
INSERT INTO member_role_table (member_role_id) VALUES ('MEMBER');

INSERT INTO submitted_form_status_table (submitted_form_status_id) VALUES ('REQUEST_PENDING');
INSERT INTO submitted_form_status_table (submitted_form_status_id) VALUES ('REQUEST_APPROVED');
INSERT INTO submitted_form_status_table (submitted_form_status_id) VALUES ('REQUEST_REJECTED');
INSERT INTO submitted_form_status_table (submitted_form_status_id) VALUES ('REQUEST_CANCELED');

INSERT INTO field_type_table (field_type_id) VALUES ('SECTION');
INSERT INTO field_type_table (field_type_id) VALUES ('TEXT');
INSERT INTO field_type_table (field_type_id) VALUES ('NUMBER');
INSERT INTO field_type_table (field_type_id) VALUES ('TEXTAREA');
INSERT INTO field_type_table (field_type_id) VALUES ('SELECT');
INSERT INTO field_type_table (field_type_id) VALUES ('MULTISELECT');
INSERT INTO field_type_table (field_type_id) VALUES ('SLIDER');
INSERT INTO field_type_table (field_type_id) VALUES ('DATE');
INSERT INTO field_type_table (field_type_id) VALUES ('DATERANGE');
INSERT INTO field_type_table (field_type_id) VALUES ('MULTICHECKBOX');
INSERT INTO field_type_table (field_type_id) VALUES ('BOOLEAN');

INSERT INTO attachment_type_table (attachment_type_id) VALUES ('FILE');
-- * Archived
-- INSERT INTO attachment_type_table (attachment_type_id) VALUES ('URL');

INSERT INTO field_tag_table (field_tag_id) VALUES ('POSITIVE_METRIC');
INSERT INTO field_tag_table (field_tag_id) VALUES ('NEGATIVE_METRIC');
INSERT INTO field_tag_table (field_tag_id) VALUES ('SUBMISSION_FORM_TITLE');
INSERT INTO field_tag_table (field_tag_id) VALUES ('SUBMISSION_FORM_DESCRIPTION');
INSERT INTO field_tag_table (field_tag_id) VALUES ('REVIEW_GENERAL_COMMENT');
INSERT INTO field_tag_table (field_tag_id) VALUES ('DUPLICATABLE_SECTION');


INSERT INTO receiver_status_table (receiver_status_id) VALUES ('ACTION_PENDING');
INSERT INTO receiver_status_table (receiver_status_id) VALUES ('ACTION_APPROVED');
INSERT INTO receiver_status_table (receiver_status_id) VALUES ('ACTION_REJECTED');

INSERT INTO comment_type_table (comment_type_id) VALUES ('ACTION_APPROVED');
INSERT INTO comment_type_table (comment_type_id) VALUES ('ACTION_REJECTED');
INSERT INTO comment_type_table (comment_type_id) VALUES ('REQUEST_CANCELED');
INSERT INTO comment_type_table (comment_type_id) VALUES ('REQUEST_UNDO');
INSERT INTO comment_type_table (comment_type_id) VALUES ('REQUEST_COMMENT');
INSERT INTO comment_type_table (comment_type_id) VALUES ('REQUEST_CREATED');
INSERT INTO comment_type_table (comment_type_id) VALUES ('REVIEW_CREATED');
INSERT INTO comment_type_table (comment_type_id) VALUES ('REVIEW_COMMENT');

INSERT INTO notification_type_table (notification_type_id) VALUES ('REQUEST_FOR_APPROVAL');
INSERT INTO notification_type_table (notification_type_id) VALUES ('ACTION_APPROVED');
INSERT INTO notification_type_table (notification_type_id) VALUES ('ACTION_REJECTED');
INSERT INTO notification_type_table (notification_type_id) VALUES ('TEAM_INVITATION');
INSERT INTO notification_type_table (notification_type_id) VALUES ('REVIEW_CREATED');

INSERT INTO form_setting_table (form_setting_id, form_setting_description, form_setting_app_id) VALUES ('FORM_SIGNATURE_REQUIRED', 'Require requester and approver signature during request creation and approval process.', 'REQUEST');
INSERT INTO team_setting_table (team_setting_id, team_setting_description, team_setting_app_id) VALUES ('FORM_SIGNATURE_REQUIRED', 'Require requester and approver signature during request creation and approval process.', 'REQUEST');CREATE INDEX form_name_idx ON form_table (form_name);
-- * UserMetadata: Already transformed.
CREATE VIEW user_metadata_view AS
SELECT 
    -- Expose table columns that will be used for filtering.
  up.user_id as "id",
  up.username as "username",
  up.user_email as "email",
  up.user_first_name as "firstName",
  up.user_last_name as "lastName",
  up.user_active_team_id as "activeTeamId",
    CASE
    WHEN a.attachment_id IS NULL THEN NULL
    ELSE json_build_object(
      'id', a.attachment_id,
      'name', a.attachment_name,
      'prefixedName', a.attachment_prefixed_name,
      'value', a.attachment_value,
      'type', a.attachment_attachment_type_id,
      'bucket', a.attachment_bucket_id,
      'dateCreated', a.attachment_date_created
    )
  END as "avatar",
  CASE
  WHEN sua.attachment_id IS NULL THEN NULL
  ELSE json_build_object(
    'id', sua.attachment_id,
    'name', sua.attachment_name,
    'prefixedName', sua.attachment_prefixed_name,
    'value', sua.attachment_value,
    'type', sua.attachment_attachment_type_id,
    'bucket', sua.attachment_bucket_id,
    'dateCreated', sua.attachment_date_created
  ) 
  END as "signature"
FROM user_profile_table up
LEFT JOIN attachment_table a ON up.user_avatar_attachment_id = a.attachment_id
LEFT JOIN (
  SELECT 
    DISTINCT ON (su.signature_user_user_id)
    *
  FROM signature_user_table su
  JOIN attachment_table a ON a.attachment_id = su.signature_user_attachment_id
  ORDER BY su.signature_user_user_id, su.signature_user_date_created DESC
) sua ON up.user_id = sua.signature_user_user_id;


-- * TeamMetadata: Already transformed.
CREATE VIEW team_metadata_view AS
SELECT
    -- Expose table columns that will be used for filtering.
  t.team_id as "id",
  t.team_name as "name",
  t.team_date_created as "dateCreated",
  t.team_is_disabled as "isDisabled",
  t.team_logo_attachment_id as "logoAttachmentId",
  um."id" as "createdById",
  um."username" as "createdByUsername",
json_build_object(
    'id', um."id",
    'username', um."username",
    'firstName', um."firstName",
    'email', um."email",
    'lastName', um."lastName",
    'avatar', um."avatar"
) as "createdBy",
  CASE
  WHEN a.attachment_id IS NULL THEN NULL
  ELSE json_build_object(
    'id',
    a.attachment_id,
    'name',
    a.attachment_name,
    'prefixedName',
    a.attachment_prefixed_name,
    'value',
    a.attachment_value,
    'type',
    a.attachment_attachment_type_id,
    'bucket',
    a.attachment_bucket_id,
    'dateCreated',
    a.attachment_date_created
  ) 
  END as "logo",
  tes."settingList" as "settingList"
FROM
  team_table t
  JOIN user_metadata_view um ON t.team_user_id = um."id"
  LEFT JOIN attachment_table a ON t.team_logo_attachment_id = a.attachment_id
  LEFT JOIN (
    SELECT
      tes.team_enables_setting_team_id,
      json_agg(tes.team_enables_setting_team_setting_id) as "settingList"
    FROM
      team_enables_setting_table tes
    WHERE
      tes.team_enables_setting_toggle = TRUE
    GROUP BY
      tes.team_enables_setting_team_id
  ) tes ON t.team_id = tes.team_enables_setting_team_id;

-- * Member: Already transformed.
CREATE VIEW member_view AS
SELECT 
    -- Expose table columns that will be used for filtering.
um."id" as "userId",
tm."id" as "teamId",
tm."createdById" as "teamCreatedById",
tm."name" as "teamName",
tm."dateCreated" as "teamDateCreated",
tm."logoAttachmentId" as "logoAttachmentId",
tm."isDisabled" as "teamIsDisabled",
um."username" as "memberUsername",
um."firstName" as "memberFirstName",
um."lastName" as "memberLastName",
um."email" as "memberEmail",
json_build_object(
    'id', um."id",
    'username', um."username",
    'firstName', um."firstName",
    'email', um."email",
    'lastName', um."lastName",
    'avatar', um."avatar"
) as "user",
json_build_object(
    'id', tm."id",
    'name', tm."name",
    'dateCreated', tm."dateCreated",
    'createdBy', tm."createdBy",
    'logo', tm."logo",
    'settingList', tm."settingList"
) as "team",
tmm.team_member_member_role_id as "role",
tmm.team_member_date_created as "memberDateJoined",
tmm.team_member_is_disabled as "memberIsDisabled"
FROM team_member_table tmm
JOIN user_metadata_view um ON tmm.team_member_user_id = um."id"
JOIN team_metadata_view tm ON tmm.team_member_team_id = tm."id";

-- * FormMetadata: Already transformed.
CREATE VIEW form_metadata_view AS
SELECT
    -- Expose table columns that will be used for filtering.

f.form_app_id as "app",
f.form_id as "id",
f.form_name as "name",
f.form_description as "description",
f.form_date_created as "dateCreated",
f.form_is_disabled as "isDisabled",
-- f.form_is_hidden as "isHidden",
f.form_is_archived as "isArchived",
um."id" as "createdById",
um."username" as "createdByUsername",
tm."id" as "teamId",
json_build_object(
    'id', um."id",
    'username', um."username",
    'firstName', um."firstName",
    'email', um."email",
    'lastName', um."lastName",
    'avatar', um."avatar"
) as "createdBy",
json_build_object(
    'id', tm."id"
) as "team",
fes."settingList" as "settingList",
frua."receiverList" as "receiverList"
FROM form_table f
JOIN user_metadata_view um ON f.form_user_id = um."id"
JOIN team_metadata_view tm ON f.form_team_id = tm."id"
LEFT JOIN
(
    SELECT 
    fes.form_enables_setting_form_id,
    json_agg(fes.form_enables_setting_form_setting_id) as "settingList"
    FROM form_enables_setting_table fes
    WHERE fes.form_enables_setting_toggle = TRUE
    GROUP BY fes.form_enables_setting_form_id
) fes ON f.form_id = fes.form_enables_setting_form_id
LEFT JOIN 
(
    SELECT
    fr.form_receiver_form_id,
    json_agg(json_build_object(
        'id', fr.form_receiver_id,
        'user', um.*,
        'isPrimaryReceiver', fr.form_receiver_is_primary_receiver,
        'action', json_build_object(
            'id', a.action_id,
            'name', a.action_name
        ),
        'order', fr.form_receiver_order
    )) as "receiverList"
    FROM form_receiver_table fr
    JOIN user_metadata_view um ON fr.form_receiver_user_id = um."id"
    LEFT JOIN action_table a ON fr.form_receiver_action_id = a.action_id
    GROUP BY fr.form_receiver_form_id
) frua ON f.form_id = frua.form_receiver_form_id;

-- * Form: Already transformed.
CREATE VIEW form_view AS
SELECT
    -- Expose table columns that will be used for filtering.

fm."app" as "app",
fm."id" as "id",
fm."name" as "name",
fm."description" as "description",
fm."dateCreated" as "dateCreated",
-- fm."isHidden" as "isHidden",
fm."isArchived" as "isArchived",
fm."isDisabled" as "isDisabled",
fm."createdById" as "createdById",
fm."createdByUsername" as "createdByUsername",
fm."teamId" as "teamId",
json_build_object(
    'app', fm."app",
    'id', fm."id",
    'name', fm."name",
    'description', fm."description",
    'dateCreated', fm."dateCreated",
    'isDisabled', fm."isDisabled",
    -- 'isHidden', fm."isHidden",
    'isArchived', fm."isArchived",
    'createdBy', fm."createdBy",
    'team', fm."team",
    'settingList', fm."settingList",
    'receiverList', fm."receiverList"
) as "form",
ff2."fieldList" as "fieldList"
-- FROM form_field_table ff 
-- form
-- JOIN form_metadata_view fm ON ff.form_field_form_id = fm."id"
FROM form_metadata_view fm
-- fieldList
LEFT JOIN 
(
    SELECT
    ff.form_field_form_id,
    json_agg(
        json_build_object(
            'id', f.field_id,
            'name', f.field_name,
            'description', f.field_description,
            'type', f.field_field_type_id,
            'required', f.field_is_required,
            'order', ff.form_field_order,
            'sliderMin', f.field_slider_min,
            'sliderMax', f.field_slider_max,
            'optionList', foo."optionList",
            'tagList', ftf."tagList"
        )
        ORDER BY ff.form_field_order
    ) as "fieldList"
    FROM form_field_table ff 
    LEFT JOIN field_table f ON ff.form_field_field_id = f.field_id
    LEFT JOIN
    (
        SELECT
        fo.field_option_field_id,
        json_agg(json_build_object(
            'id', o.option_id,
            'value', o.option_value_varchar,
            'description', o.option_description,
            'order', fo.field_option_order
        )) as "optionList"
        FROM field_option_table fo
        JOIN option_table o ON fo.field_option_option_id = o.option_id
        GROUP BY fo.field_option_field_id
    ) foo ON ff.form_field_field_id = foo.field_option_field_id
    LEFT JOIN
    (
        SELECT
        ftf.field_tag_field_field_id,
        json_agg(ftf.field_tag_field_field_tag_id) as "tagList"
        FROM field_tag_field_table ftf 
        GROUP BY ftf.field_tag_field_field_id
    ) ftf ON ff.form_field_field_id = ftf.field_tag_field_field_id
    GROUP BY ff.form_field_form_id
-- ) ff2 ON ff.form_field_form_id = ff2.form_field_form_id
) ff2 ON fm."id" = ff2.form_field_form_id;


-- * SubmittedFormMetadata: Already transformed.
CREATE VIEW submitted_form_metadata_view AS
SELECT
    -- Expose table columns that will be used for filtering.

sf.submitted_form_app_id as "app",
sf.submitted_form_id as "id",
sf.submitted_form_user_id as "createdById",
sf.submitted_form_team_id as "teamId",
sf.submitted_form_date_created as "dateCreated",
sf.submitted_form_submitted_form_status_id as "status",
sf.submitted_form_status_last_updated as "statusLastUpdated",
sf.submitted_form_signature_attachment_id as "signatureAttachmentId",
sf.submitted_form_is_disabled as "isDisabled",
sffr.title as "title",
sffr2.description as "description",
fm."id" as "formId",
fm."isDisabled" as "formIsDisabled",
-- fm."isHidden" as "formIsHidden",
fm."isArchived" as "formIsArchived",
json_build_object(
    'app', fm."app",
    'id', fm."id",
    'name', fm."name",
    'description', fm."description",
    'dateCreated', fm."dateCreated",
    'isDisabled', fm."isDisabled",
    -- 'isHidden', fm."isHidden",
    'isArchived', fm."isArchived",
    'createdBy', fm."createdBy",
    'team', fm."team",
    'settingList', fm."settingList",
    'receiverList', fm."receiverList"
) as "form",
json_build_object(
    'id', um."id",
    'username', um."username",
    'firstName', um."firstName",
    'email', um."email",
    'lastName', um."lastName",
    'avatar', um."avatar"
) as "createdBy",
sfrua."receiverList" as "receiverList",
sfrua."receiverIdList" as "receiverIdList",
asfa."attachmentList" as "attachmentList"
-- submitted form
FROM submitted_form_table sf
-- form
JOIN form_metadata_view fm ON sf.submitted_form_form_id = fm."id"
-- createdBy
JOIN user_metadata_view um ON sf.submitted_form_user_id = um."id"
-- title: FieldWithResponse
LEFT JOIN 
(   
    SELECT
    DISTINCT ON (sffr.submitted_form_field_response_submitted_form_id)
    sffr.submitted_form_field_response_submitted_form_id,
    json_build_object(
    'field', json_build_object(
                'id', f.field_id,
                'name', f.field_name,
                'description', f.field_description,
                'type', f.field_field_type_id,
                'required', f.field_is_required,
                'order', sffr.submitted_form_field_response_order,
                'sliderMin', f.field_slider_min,
                'sliderMax', f.field_slider_max,
                'optionList', foo."optionList",
                'tagList', ARRAY[ftf.field_tag_field_field_tag_id]
            ),
    'response', json_build_object(
                'id', r.response_id,
                'value', CASE
                    WHEN response_value_varchar IS NOT NULL THEN to_json(response_value_varchar)
                    WHEN response_value_int IS NOT NULL THEN to_json(response_value_int)
                    WHEN response_value_date IS NOT NULL THEN to_json(response_value_date)
                    WHEN response_value_boolean IS NOT NULL THEN to_json(response_value_boolean)
                    ELSE NULL
                END,
                'dateRangeStart', r.response_value_date_start,
                'dateRangeEnd', r.response_value_date_end,
                'selectedOptionList', roo."optionList"
            )
    ) as "title"
    FROM
    submitted_form_field_response_table sffr
    -- field
    LEFT JOIN field_table f ON sffr.submitted_form_field_response_field_id = f.field_id
    LEFT JOIN
    (
        SELECT
        fo.field_option_field_id,
        json_agg(json_build_object(
            'id', o.option_id,
            'value', o.option_value_varchar,
            'description', o.option_description,
            'order', fo.field_option_order
        )) as "optionList"
        FROM field_option_table fo
        JOIN option_table o ON fo.field_option_option_id = o.option_id
        GROUP BY fo.field_option_field_id
    ) foo ON sffr.submitted_form_field_response_field_id = foo.field_option_field_id
    LEFT JOIN field_tag_field_table ftf  ON sffr.submitted_form_field_response_field_id = ftf.field_tag_field_field_id
    -- response
    LEFT JOIN response_table r ON sffr.submitted_form_field_response_response_id = r.response_id
    -- responseOptionList
    LEFT JOIN
    (
        SELECT
        ro.response_option_response_id,
        json_agg(json_build_object(
            'id', o.option_id,
            'value', o.option_value_varchar,
            'description', o.option_description,
            'order', ro.response_option_order
        )) as "optionList"
        FROM response_option_table ro
        JOIN option_table o ON ro.response_option_option_id = o.option_id
        GROUP BY ro.response_option_response_id
    ) roo ON r.response_id = roo.response_option_response_id
    WHERE ftf.field_tag_field_field_tag_id = 'SUBMISSION_FORM_TITLE'
) sffr ON sf.submitted_form_id = sffr.submitted_form_field_response_submitted_form_id
-- description: FieldWithResponse
LEFT JOIN 
(   
    SELECT
    DISTINCT ON (sffr.submitted_form_field_response_submitted_form_id)
    sffr.submitted_form_field_response_submitted_form_id,
        json_build_object(
            'field', json_build_object(
                        'id', f.field_id,
                        'name', f.field_name,
                        'description', f.field_description,
                        'type', f.field_field_type_id,
                        'required', f.field_is_required,
                        'order', sffr.submitted_form_field_response_order,
                        'sliderMin', f.field_slider_min,
                        'sliderMax', f.field_slider_max,
                        'optionList', foo."optionList",
                        'tagList', ARRAY[ftf.field_tag_field_field_tag_id]
                    ),
            'response', json_build_object(
                        'id', r.response_id,
                        'value', CASE
                            WHEN response_value_varchar IS NOT NULL THEN to_json(response_value_varchar)
                            WHEN response_value_int IS NOT NULL THEN to_json(response_value_int)
                            WHEN response_value_date IS NOT NULL THEN to_json(response_value_date)
                            WHEN response_value_boolean IS NOT NULL THEN to_json(response_value_boolean)
                            ELSE NULL
                        END,
                        'dateRangeStart', r.response_value_date_start,
                        'dateRangeEnd', r.response_value_date_end,
                        'selectedOptionList', roo."optionList"
                    )
        ) as "description"
    FROM
    submitted_form_field_response_table sffr
    -- field
    LEFT JOIN field_table f ON sffr.submitted_form_field_response_field_id = f.field_id
    LEFT JOIN
    (
        SELECT
        fo.field_option_field_id,
        json_agg(json_build_object(
            'id', o.option_id,
            'value', o.option_value_varchar,
            'description', o.option_description,
            'order', fo.field_option_order
        )) as "optionList"
        FROM field_option_table fo
        JOIN option_table o ON fo.field_option_option_id = o.option_id
        GROUP BY fo.field_option_field_id
    ) foo ON sffr.submitted_form_field_response_field_id = foo.field_option_field_id
    LEFT JOIN field_tag_field_table ftf  ON sffr.submitted_form_field_response_field_id = ftf.field_tag_field_field_id
    -- response
    LEFT JOIN response_table r ON sffr.submitted_form_field_response_response_id = r.response_id
    -- responseOptionList
    LEFT JOIN
    (
        SELECT
        ro.response_option_response_id,
        json_agg(json_build_object(
            'id', o.option_id,
            'value', o.option_value_varchar,
            'description', o.option_description,
            'order', ro.response_option_order
        )) as "optionList"
        FROM response_option_table ro
        JOIN option_table o ON ro.response_option_option_id = o.option_id
        GROUP BY ro.response_option_response_id
    ) roo ON r.response_id = roo.response_option_response_id
    WHERE ftf.field_tag_field_field_tag_id = 'SUBMISSION_FORM_DESCRIPTION'
) sffr2 ON sf.submitted_form_id = sffr2.submitted_form_field_response_submitted_form_id
-- receiverList
LEFT JOIN
(
    SELECT
    sfr.submitted_form_receiver_submitted_form_id,
    json_agg(json_build_object(
        'id', sfr.submitted_form_receiver_id,
        'user', um.*,
        'isPrimaryReceiver', sfr.submitted_form_receiver_is_primary_receiver,
        'action', json_build_object(
            'id', a.action_id,
            'name', a.action_name
        ),
        'order', sfr.submitted_form_receiver_order,
        'comment', c.comment_content,
        'status', sfr.submitted_form_receiver_receiver_status_id,
        'statusLastUpdated', sfr.submitted_form_receiver_status_last_updated,
        'signature', json_build_object(
            'id', att.attachment_id,
            'name', att.attachment_name,
            'prefixedName', att.attachment_prefixed_name,
            'value', att.attachment_value,
            'type', att.attachment_attachment_type_id,
            'bucket', att.attachment_bucket_id,
            'dateCreated', att.attachment_date_created
        )
    )) as "receiverList",
    array_agg(sfr.submitted_form_receiver_user_id::text) as "receiverIdList"
    FROM submitted_form_receiver_table sfr
    JOIN user_metadata_view um ON sfr.submitted_form_receiver_user_id = um."id"
    LEFT JOIN action_table a ON sfr.submitted_form_receiver_action_id = a.action_id
    LEFT JOIN comment_table c ON sfr.submitted_form_receiver_comment_id = c.comment_id
    LEFT JOIN attachment_table att ON sfr.submitted_form_receiver_signature_attachment_id = att.attachment_id
    GROUP BY sfr.submitted_form_receiver_submitted_form_id
) sfrua ON sf.submitted_form_id = sfrua.submitted_form_receiver_submitted_form_id
-- attachmentList
LEFT JOIN
(
    SELECT 
    asf.attachment_submitted_form_submitted_form_id,
    json_agg(json_build_object(
        'id', a.attachment_id,
        'name', a.attachment_name,
        'prefixedName', a.attachment_prefixed_name,
        'value', a.attachment_value,
        'type', a.attachment_attachment_type_id,
        'bucket', a.attachment_bucket_id,
        'dateCreated', a.attachment_date_created
    )) as "attachmentList"
    FROM attachment_submitted_form_table asf 
    JOIN attachment_table a ON asf.attachment_submitted_form_attachment_id = a.attachment_id
    GROUP BY asf.attachment_submitted_form_submitted_form_id
) asfa ON asfa.attachment_submitted_form_submitted_form_id = sf.submitted_form_form_id;


-- * SubmittedForm: Already transformed.
CREATE VIEW submitted_form_view AS
SELECT
    -- Expose table columns that will be used for filtering.
sfm."app" as "app",
sfm."id" as "id",
sfm."createdById" as "createdById",
sfm."teamId" as "teamId",
sfm."dateCreated" as "dateCreated",
sfm."status" as "status",
sfm."statusLastUpdated" as "statusLastUpdated",
sfm."isDisabled" as "isDisabled",
sfm."receiverIdList" as "receiverIdList",
json_build_object(
    'app', sfm."app",
    'id', sfm."id",
    'title', sfm."title",
    'description', sfm."description",
    'dateCreated', sfm."dateCreated",
    'status', sfm."status",
    'statusLastUpdated', sfm."statusLastUpdated",
    'form', sfm."form",
    'createdBy', sfm."createdBy",
    'receiverList', sfm."receiverList",
    'receiverIdList',    sfm."receiverIdList",
    'attachmentList', sfm."attachmentList"
) as "submittedForm",
sffr."fieldWithResponseList" as "fieldWithResponseList"
-- FROM submitted_form_field_response_table sffr
-- submittedForm
-- JOIN submitted_form_metadata_view sfm ON sfm."id" = sffr.submitted_form_field_response_submitted_form_id
FROM submitted_form_metadata_view sfm
-- fieldWithResponseList
LEFT JOIN 
(
    SELECT
    sffr.submitted_form_field_response_submitted_form_id,
    json_agg(
        json_build_object(
            'field', json_build_object(
                        'id', f.field_id,
                        'name', f.field_name,
                        'description', f.field_description,
                        'type', f.field_field_type_id,
                        'required', f.field_is_required,
                        'order', sffr.submitted_form_field_response_order,
                        'sliderMin', f.field_slider_min,
                        'sliderMax', f.field_slider_max,
                        'optionList', foo."optionList",
                        'tagList', ftf."tagList"
                    ),
            'response', json_build_object(
                        'id', r.response_id,
                        'value', CASE
                            WHEN response_value_varchar IS NOT NULL THEN to_json(response_value_varchar)
                            WHEN response_value_int IS NOT NULL THEN to_json(response_value_int)
                            WHEN response_value_date IS NOT NULL THEN to_json(response_value_date)
                            WHEN response_value_boolean IS NOT NULL THEN to_json(response_value_boolean)
                            ELSE NULL
                        END,
                        'dateRangeStart', r.response_value_date_start,
                        'dateRangeEnd', r.response_value_date_end,
                        'selectedOptionList', roo."optionList"
                    )
        )
        ORDER BY sffr.submitted_form_field_response_order
    ) as "fieldWithResponseList"
    FROM submitted_form_field_response_table sffr 
    LEFT JOIN field_table f ON sffr.submitted_form_field_response_field_id = f.field_id
    -- fieldOptionList
    LEFT JOIN
    (
        SELECT
        fo.field_option_field_id,
        json_agg(json_build_object(
            'id', o.option_id,
            'value', o.option_value_varchar,
            'description', o.option_description,
            'order', fo.field_option_order
        )
        ORDER BY fo.field_option_order       
        ) as "optionList"
        FROM field_option_table fo
        JOIN option_table o ON fo.field_option_option_id = o.option_id
        GROUP BY fo.field_option_field_id
    ) foo ON f.field_id = foo.field_option_field_id
    -- fieldTagList
    LEFT JOIN
    (
        SELECT
        ftf.field_tag_field_field_id,
        json_agg(ftf.field_tag_field_field_tag_id) as "tagList"
        FROM field_tag_field_table ftf 
        GROUP BY ftf.field_tag_field_field_id
    ) ftf ON sffr.submitted_form_field_response_field_id = ftf.field_tag_field_field_id
    -- response
    LEFT JOIN response_table r ON sffr.submitted_form_field_response_response_id = r.response_id
    -- responseOptionList
    LEFT JOIN
    (
        SELECT
        ro.response_option_response_id,
        json_agg(json_build_object(
            'id', o.option_id,
            'value', o.option_value_varchar,
            'description', o.option_description,
            'order', ro.response_option_order
        )
        ORDER BY ro.response_option_order
        ) as "optionList"
        FROM response_option_table ro
        JOIN option_table o ON ro.response_option_option_id = o.option_id
        GROUP BY ro.response_option_response_id
    ) roo ON r.response_id = roo.response_option_response_id
    GROUP BY sffr.submitted_form_field_response_submitted_form_id
) sffr ON sffr.submitted_form_field_response_submitted_form_id = sfm."id";

-- * Comment: Already transformed.
CREATE VIEW comment_view AS
SELECT 
    -- Expose table columns that will be used for filtering.

c.comment_app_id as "app",
json_build_object('id', csf.comment_submitted_form_submitted_form_id) as "submittedForm",
csf.comment_submitted_form_submitted_form_id as "submittedFormId",
c.comment_id as "id",
c.comment_content as "content",
c.comment_date_created as "dateCreated",
json_build_object(
    'id', um."id",
    'username', um."username",
    'firstName', um."firstName",
    'email', um."email",
    'lastName', um."lastName",
    'avatar', um."avatar"
) as "createdBy",
c.comment_last_updated as "dateLastUpdated",
c.comment_comment_type_id as "type",
aca."attachmentList" as "attachmentList"
FROM comment_submitted_form_table csf
-- comment
JOIN comment_table c ON csf.comment_submitted_form_comment_id = c.comment_id 
-- createdBy
JOIN user_metadata_view um ON um."id" = c.comment_user_id
-- attachmentList
LEFT JOIN
(
    SELECT 
    ac.attachment_comment_comment_id,
    json_agg(json_build_object(
        'id', a.attachment_id,
        'name', a.attachment_name,
        'prefixedName', a.attachment_prefixed_name,
        'value', a.attachment_value,
        'type', a.attachment_attachment_type_id,
        'bucket', a.attachment_bucket_id,
        'dateCreated', a.attachment_date_created
    )) as "attachmentList"
    FROM attachment_comment_table ac 
    JOIN attachment_table a ON ac.attachment_comment_attachment_id = a.attachment_id
    GROUP BY ac.attachment_comment_comment_id
) aca ON aca.attachment_comment_comment_id = c.comment_id;


-- * Notification: Already transformed.
CREATE VIEW notification_view AS
SELECT
    -- Expose table columns that will be used for filtering.
    n.notification_app_id as "app",
    n.notification_id as "id",
    n.notification_date_created as "dateCreated",
    n.notification_content as "content",
    n.notification_is_read as "isRead",
    n.notification_redirect_url as "redirectUrl",
    n.notification_user_id as "userId",
    n.notification_team_id as "teamId",
    n.notification_notification_type_id as "type"
FROM notification_table n;-- * Done
CREATE FUNCTION get_current_date()
RETURNS DATE
AS $$
BEGIN
    RETURN CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- * Done
CREATE FUNCTION is_username_taken(var_username VARCHAR(4000))
RETURNS BOOLEAN
AS $$
BEGIN
    RETURN EXISTS(SELECT 1 FROM user_profile_table WHERE username = var_username);
END;
$$ LANGUAGE plpgsql;

-- * Done
CREATE FUNCTION is_team_name_taken(var_team_name VARCHAR(4000))
RETURNS BOOLEAN
AS $$
BEGIN
    RETURN EXISTS(SELECT 1 FROM team_table WHERE team_name = var_team_name);
END;
$$ LANGUAGE plpgsql;

-- * Done
CREATE FUNCTION is_email_registered(email_address text)
RETURNS BOOLEAN
AS $$
BEGIN
    RETURN EXISTS(SELECT 1 FROM auth.users WHERE email = email_address AND email_confirmed_at IS NOT NULL);
END;
$$ LANGUAGE plpgsql security definer;

-- * Done
CREATE FUNCTION get_user_profile_by_email(email_address VARCHAR(4000))
RETURNS SETOF user_profile_table AS $$
BEGIN
  RETURN QUERY SELECT * FROM user_profile_table WHERE user_email = email_address LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- * Done
CREATE FUNCTION is_email_in_profile_table(email_address VARCHAR(4000))
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(SELECT * FROM get_user_profile_by_email(email_address));
END;
$$ LANGUAGE plpgsql;

-- * Done
-- * Potential:
-- Add check if user in app notification is on or off.
-- params: CreateTeamInivtationParams type definition defined in db-types.sql

CREATE FUNCTION send_team_invitation(params JSON)
RETURNS UUID AS $$
  const {
    fromUserId,
    teamId,
    toEmail,
  } = params;

  // Verify that the inviter is a member of the team using limit
  const fromUser = plv8.execute(`
    SELECT
      *
    FROM
      member_view tm
    WHERE
      tm."userId" = $1
    AND
      tm."teamId" = $2
    LIMIT 1
  `, [fromUserId, teamId])[0];

  if (!fromUser) {
    throw new Error('Inviter is not a member of the team');
  }

  // Verify that he is not inviting himself
  if (fromUser.memberEmail === toEmail) {
    throw new Error('You cannot invite yourself');
  }

  // Verify that the invitee is not a member of the team
  const toUser = plv8.execute(`
    SELECT
      *
    FROM
      member_view tm
    WHERE
      tm."memberEmail" = $1
    AND
      tm."teamId" = $2
    LIMIT 1
  `, [toEmail, teamId])[0];

  if (toUser) {
    throw new Error('Invitee is already a member of the team');
  }

  // Save invitation
  const invitationId = plv8.execute(`
    INSERT INTO invitation_table (
      invitation_team_id,
      invitation_from_user_id,
      invitation_to_email
    )
    VALUES ($1, $2, $3)
    RETURNING invitation_id
  `, [teamId, fromUserId, toEmail])[0].invitation_id;


  // Use function "get_user_profile_by_email" which returns a boolean to check if the email is in the profile table and send notification if it is
  const toUserProfile = plv8.execute(`
    SELECT
      *
    FROM
      get_user_profile_by_email($1)
  `, [toEmail])[0];

  const isEmailInProfileTable = !!toUserProfile;
  const redirectUrl = `/team-invitations/${invitationId}`;

  if (isEmailInProfileTable) {
    // Send notification to the invitee. You have been invited to join team ${teamName} by ${fromUser.memberUsername}}

    const team = plv8.execute(`
      SELECT
        *
      FROM
        team_table
      WHERE
        team_id = $1
    `, [teamId])[0];

    plv8.execute(`
      INSERT INTO notification_table (
        notification_content,
        notification_user_id,
        notification_team_id,
        notification_notification_type_id,
        notification_app_id,
        notification_redirect_url
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6
      )
    `, [
      `You have been invited to join team ${team.team_name} by ${fromUser.memberUsername}`,
      toUserProfile.user_id,
      teamId,
      'TEAM_INVITATION',
      'GENERAL',
      redirectUrl
    ]);

  }

return invitationId;

$$ LANGUAGE plv8;


-- * Done
CREATE FUNCTION create_team (params JSON)
RETURNS UUID AS $$
DECLARE
  var_team_id UUID;
  var_created_by_user_id UUID := params->>'userId';
  var_team_name TEXT := params->>'teamName';
BEGIN

  INSERT INTO team_table (team_name, team_user_id)
  VALUES (var_team_name, var_created_by_user_id)
  RETURNING team_id INTO var_team_id;

  INSERT INTO team_member_table (team_member_team_id, team_member_user_id, team_member_member_role_id)
  VALUES (var_team_id, var_created_by_user_id, 'OWNER');

  UPDATE user_profile_table
  SET user_active_team_id = var_team_id
  WHERE user_id = var_created_by_user_id;

  RETURN var_team_id;

END;
$$ LANGUAGE PLPGSQL;

-- * Done
CREATE FUNCTION onboard_user (params JSON)
RETURNS UUID AS $$
DECLARE
  var_user_id UUID;
  var_created_by_user_id UUID;
  var_user_first_name TEXT;
  var_user_last_name TEXT;
  var_team_id UUID;
  var_team_name TEXT;
  var_user_email TEXT;
  var_username TEXT;
BEGIN
  var_created_by_user_id := params->>'userId';
  var_team_name := params->>'teamName';

  var_user_first_name := params->>'firstName';
  var_user_last_name := params->>'lastName';
  var_user_email := params->>'email';
  var_username := params->>'username';

  INSERT INTO user_profile_table (user_id, username, user_email, user_first_name, user_last_name)
  VALUES (var_created_by_user_id, var_username, var_user_email, var_user_first_name, var_user_last_name)
  RETURNING user_id INTO var_user_id;

  INSERT INTO team_table (team_name, team_user_id)
  VALUES (var_team_name, var_created_by_user_id)
  RETURNING team_id INTO var_team_id;

  INSERT INTO team_member_table (team_member_team_id, team_member_user_id, team_member_member_role_id)
  VALUES (var_team_id, var_user_id, 'OWNER');

  UPDATE user_profile_table
  SET user_active_team_id = var_team_id
  WHERE user_id = var_user_id;

  RETURN var_team_id;

END;
$$ LANGUAGE PLPGSQL;

CREATE FUNCTION build_form (params JSON)
RETURNS UUID AS $$

const { form, fieldList, receiverList, settingList } = params;

  // Check if form.name already exists for the team and app
  const formNameExists =
    plv8.execute(
      `SELECT 1 FROM form_table WHERE form_name = $1 AND form_team_id = $2 AND form_app_id = $3 LIMIT 1`,
      [form.name, form.team.id, form.app]
    ).length > 0;

  if (formNameExists) {
    throw new Error("Form name already exists for the team");
  }

  // Save form metadata
  const formId = plv8.execute(
    `INSERT INTO form_table (form_name, form_description, form_user_id, form_team_id, form_app_id) 
  VALUES ($1, $2, $3, $4, $5) 
  RETURNING form_id`,
    [form.name, form.description, form.createdBy.id, form.team.id, form.app]
  )[0].form_id;

  // Save fields
  fieldList.forEach((field) => {
    const fieldId = plv8.execute(
      `INSERT INTO field_table (field_name, field_description, field_is_required, field_field_type_id, field_slider_min, field_slider_max) 
    VALUES ($1, $2, $3, $4, $5, $6) 
    RETURNING field_id`,
      [
        field.name,
        field.description,
        field.required,
        field.type,
        field.sliderMin,
        field.sliderMax,
      ]
    )[0].field_id;

    // Save options
    field?.optionList?.forEach((option) => {
      const optionId = plv8.execute(
        `INSERT INTO option_table (option_value_varchar, option_description) 
      VALUES ($1, $2) 
      RETURNING option_id`,
        [option.value, option.description]
      )[0].option_id;

      // Save field option relationship
      plv8.execute(
        `INSERT INTO field_option_table (field_option_field_id, field_option_option_id, field_option_order) 
      VALUES ($1, $2, $3)`,
        [fieldId, optionId, option.order]
      );
    });

    // Save form field relationship
    plv8.execute(
      `INSERT INTO form_field_table (form_field_form_id, form_field_field_id, form_field_order) 
    VALUES ($1, $2, $3)`,
      [formId, fieldId, field.order]
    );

    // Save field tag relationship
    field?.tagList?.forEach((tag) => {
      plv8.execute(
        `INSERT INTO field_tag_field_table (field_tag_field_field_id, field_tag_field_field_tag_id) 
      VALUES ($1, $2)`,
        [fieldId, tag]
      );
    });
  });

  // Save receivers
  receiverList?.forEach((receiver) => {
    // Save action
    let actionId = null;
    if (receiver?.action.name) {
      actionId = plv8.execute(
        `INSERT INTO action_table (action_name) 
      VALUES ($1) 
      RETURNING action_id`,
        [receiver.action.name]
      )[0].action_id;
    }
    // Save form receiver action relationship
    plv8.execute(
      `INSERT INTO form_receiver_table (form_receiver_form_id, form_receiver_user_id, form_receiver_order, form_receiver_action_id, form_receiver_is_primary_receiver) 
    VALUES ($1, $2, $3, $4, $5)`,
      [
        formId,
        receiver.user.id,
        receiver.order,
        actionId,
        receiver.isPrimaryReceiver,
      ]
    );
  });

  // Save attached form settings
  form?.settingList?.forEach((setting) => {
    plv8.execute(
      `INSERT INTO form_enables_setting_table (form_enables_setting_form_id, form_enables_setting_form_setting_id, form_enables_setting_toggle) 
    VALUES ($1, $2, $3)`,
      [formId, setting, true]
    );
  });

  return formId;

$$ LANGUAGE plv8;

CREATE FUNCTION submit_form (params JSON) 
RETURNS UUID AS $$

const {
    submittedForm,
    fieldWithResponseList,
    logToCommentList,
    sendNotificationToReceiverList,
    signature: var_signature,
    attachmentList
  } = params;

  // Query teamId using submittedForm.form.id
  const teamId = plv8.execute(
    `SELECT form_team_id FROM form_table WHERE form_id = $1`,
    [submittedForm.form.id]
  )[0].form_team_id;

  // Save submitted form metadata
  const submittedFormId = plv8.execute(
    `INSERT INTO submitted_form_table (submitted_form_form_id, submitted_form_user_id, submitted_form_signature_attachment_id, submitted_form_submitted_form_status_id, submitted_form_team_id, submitted_form_app_id) 
  VALUES ($1, $2, $3, $4, $5, $6) 
  RETURNING submitted_form_id`,
    [
      submittedForm.form.id,
      submittedForm.createdBy.id,
      var_signature?.id,
      submittedForm.app === "REQUEST" ? "REQUEST_PENDING" : null,
      teamId,
      submittedForm.app,
    ]
  )[0].submitted_form_id;

  // Save response list
  fieldWithResponseList.forEach((fieldWithResponse) => {
    const fieldType = plv8.execute(
      `SELECT field_field_type_id FROM field_table WHERE field_id = $1`,
      [fieldWithResponse.field.id]
    )[0].field_field_type_id;

    const isString =
      typeof fieldWithResponse.response.value === "string" ||
      fieldWithResponse.response.value instanceof String;
    const isNullOrUndefined =
      fieldWithResponse.response.value === null ||
      fieldWithResponse.response.value === undefined;
    const isNumber =
      typeof fieldWithResponse.response.value === "number" &&
      isFinite(fieldWithResponse.response.value);
    // const isDate = fieldWithResponse.response.value instanceof Date;
    const isArray = Array.isArray(fieldWithResponse.response.value);
    // -- ! Archived
    // const isBoolean = typeof fieldWithResponse.response.value === "boolean";

    const sectionFieldTypeList = ["SECTION", "DUPLICATABLE_SECTION"];
    const varcharFieldTypeList = ["TEXT", "TEXTAREA"];
    const numberFieldTypeList = ["NUMBER", "SLIDER"];
    const dateFieldTypeList = ["DATE"];
    const arrayFieldTypeList = ["SELECT", "MULTISELECT", "DATERANGE", "MULTICHECKBOX"];
    const booleanFieldTypeList = ["BOOLEAN"];

    let responseId = null;
     if (
      sectionFieldTypeList.includes(fieldType)
    ) {
      // Insert to response_value_varchar
      responseId = plv8.execute(
        `INSERT INTO response_table (response_value_varchar) 
      VALUES ($1) 
      RETURNING response_id`,
        [null]
      )[0].response_id;
    } 
    else if (
      varcharFieldTypeList.includes(fieldType)
    ) {
      // If value is not a string or null or undefined throw error
      if (!isString && !isNullOrUndefined) {
        throw new Error(
          `Field ${fieldWithResponse.field.id} is of type ${fieldType} but the response value is not a string or null or undefined`
        );
      }

      // Insert to response_value_varchar
      responseId = plv8.execute(
        `INSERT INTO response_table (response_value_varchar) 
      VALUES ($1) 
      RETURNING response_id`,
        [fieldWithResponse.response.value.trim()]
      )[0].response_id;
    } else if (numberFieldTypeList.includes(fieldType)) {
      // If value is not a number throw error
      if (!isNumber) {
        throw new Error(
          `Field ${fieldWithResponse.field.id} is of type ${fieldType} but the response value is not a number`
        );
      }

      // Insert to response_value_int
      responseId = plv8.execute(
        `INSERT INTO response_table (response_value_int) 
      VALUES ($1) 
      RETURNING response_id`,
        [fieldWithResponse.response.value]
      )[0].response_id;
    } else if (dateFieldTypeList.includes(fieldType)) {
      // If value is not a date throw error
      //if (!isDate) {
      //  throw new Error(
      //    `Field ${fieldWithResponse.field.id} is of type ${fieldType} but the response value is not a date`
      //  );
      //}

      // Insert to response_value_date
      responseId = plv8.execute(
        `INSERT INTO response_table (response_value_date) 
      VALUES ($1) 
      RETURNING response_id`,
        [fieldWithResponse.response.value]
      )[0].response_id;
    } else if (arrayFieldTypeList.includes(fieldType) && isArray) {
      if (
        fieldType === "DATERANGE"
      ) {
        // Throw error if the array length is not 2
        if (fieldWithResponse.response.value.length !== 2) {
          throw new Error("DATERANGE response must be an array of length 2");
        }

        // If elements are not of type Date, throw error
        // -- ! Archived
        // if (
        //   !(fieldWithResponse.response.value[0] instanceof Date) ||
        //   !(fieldWithResponse.response.value[1] instanceof Date)
        // ) {
        //   throw new Error("DATERANGE response must be an array of Date");
        // }

        // Insert first date response_value_date_start and second date response_value_date_end
        responseId = plv8.execute(
          `INSERT INTO response_table (response_value_date_start, response_value_date_end) 
          VALUES ($1, $2) 
          RETURNING response_id`,
          [
            fieldWithResponse.response.value[0],
            fieldWithResponse.response.value[1],
          ]
        )[0].response_id;
      } else if (
        (fieldType === "SELECT" || fieldType === "MULTISELECT" || fieldType === "MULTICHECKBOX") &&
        fieldWithResponse.response.value.length > 0
      ) {
        responseId = plv8.execute(
          `INSERT INTO response_table (response_value_varchar) 
          VALUES ($1) 
          RETURNING response_id`,
          [null]
        )[0].response_id;
        fieldWithResponse.response.value.forEach((responseValue) => {
          // Qeury field_option_order from field_option_table
          const fieldOptionOrder = plv8.execute(
            `SELECT field_option_order FROM field_option_table WHERE field_option_field_id = $1 AND field_option_option_id = $2`,
            [fieldWithResponse.field.id, responseValue]
          )[0].field_option_order;

          if (!fieldOptionOrder) {
            throw new Error("No field order found");
          }

          // Save response option relationship
          const responseOptionId = plv8.execute(
            `INSERT INTO response_option_table (response_option_response_id, response_option_option_id, response_option_order) 
              VALUES ($1, $2, $3) 
              RETURNING response_option_id`,
            [responseId, responseValue, fieldOptionOrder]
          )[0].response_option_id;
        });
      } else {
        throw new Error("Invalid field type");
      }
    } else if (booleanFieldTypeList.includes(fieldType)) {
      // -- ! Archived: If value is not a boolean throw error

      // Insert to response_value_boolean
      responseId = plv8.execute(
        `INSERT INTO response_table (response_value_boolean) 
      VALUES ($1) 
      RETURNING response_id`,
        [fieldWithResponse.response.value]
      )[0].response_id;
    } else {
      throw new Error("Invalid field type or response value");
    }

    // Query form_field_order from form_field_table using submittedForm.form.id and fieldWithResponse.field.id
    const formFieldOrder = plv8.execute(
      `SELECT form_field_order FROM form_field_table WHERE form_field_form_id = $1 AND form_field_field_id = $2`,
      [submittedForm.form.id, fieldWithResponse.field.id]
    )[0].form_field_order;

    if (!formFieldOrder) {
      throw new Error("No form field order found");
    }

    // Save form field response relationship
    plv8.execute(
      `INSERT INTO submitted_form_field_response_table (
            submitted_form_field_response_submitted_form_id, 
            submitted_form_field_response_field_id, 
            submitted_form_field_response_response_id, 
            submitted_form_field_response_order
        ) 
        VALUES (
            $1, 
            $2, 
            $3, 
            $4
        )`,
      [submittedFormId, fieldWithResponse.field.id, responseId, formFieldOrder]
    );
  });

  // Query owner using createdBy.id
  const owner = plv8.execute(
    `SELECT username FROM user_profile_table WHERE user_id = $1`,
    [submittedForm.createdBy.id]
  )[0];

  // Log submitted form creation to comments section
  let commentId = null;
  if (logToCommentList) {
    const commentType =
      submittedForm.app === "REQUEST"
        ? "REQUEST_CREATED"
        : submittedForm.app === "REVIEW"
        ? "REVIEW_CREATED"
        : null;

    commentId = plv8.execute(
      `INSERT INTO comment_table (comment_user_id, comment_content, comment_app_id, comment_comment_type_id) 
        VALUES ($1, $2, $3, $4) 
        RETURNING comment_id`,
      [submittedForm.createdBy.id, null, submittedForm.app, commentType]
    )[0].comment_id;

    // Save submitted form comment relationship
    plv8.execute(
      `INSERT INTO comment_submitted_form_table (comment_submitted_form_comment_id, comment_submitted_form_submitted_form_id) 
        VALUES ($1, $2)`,
      [commentId, submittedFormId]
    );
  }

  if (sendNotificationToReceiverList) {
    const notificationType =
      submittedForm.app === "REQUEST"
        ? "REQUEST_FOR_APPROVAL"
        : submittedForm.app === "REVIEW"
        ? "REVIEW_CREATED"
        : null;

    const redirectUrl =
      submittedForm.app === "REQUEST"
        ? `/requests/${submittedFormId}`
        : submittedForm.app === "REVIEW"
        ? `/reviews/${submittedFormId}`
        : null;

    const content =
      submittedForm.app === "REQUEST"
        ? `${owner.username} requested for your approval.`
        : submittedForm.app === "REVIEW"
        ? `${owner.username} has given you a review.`
        : null;

    submittedForm?.receiverList?.forEach((receiver) => {
      const notificationId = plv8.execute(
        `INSERT INTO notification_table (
            notification_content,
            notification_redirect_url,
            notification_user_id,
            notification_team_id,
            notification_notification_type_id,
            notification_app_id
        ) 
        VALUES (
            $1, 
            $2, 
            $3,
            $4,
            $5,
            $6
        ) 
        RETURNING notification_id`,
        [
          content,
          redirectUrl,
          submittedForm.createdBy.id,
          teamId,
          notificationType,
          submittedForm.app,
        ]
      )[0].notification_id;
    });
  }

  // Save submitted form receiver relationship
  submittedForm?.receiverList?.forEach((receiver) => {
    plv8.execute(
      `INSERT INTO submitted_form_receiver_table (
            submitted_form_receiver_submitted_form_id, 
            submitted_form_receiver_user_id,
            submitted_form_receiver_comment_id,
            submitted_form_receiver_action_id,
            submitted_form_receiver_receiver_status_id,
            submitted_form_receiver_signature_attachment_id,
            submitted_form_receiver_order,
            submitted_form_receiver_is_primary_receiver
        ) 
        VALUES (
            $1, 
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8
        )`,
      [
        submittedFormId,
        receiver.user.id,
        commentId,
        receiver?.action?.id,
        receiver?.action?.id ? "ACTION_PENDING" : null,
        receiver?.signature?.id,
        receiver.order,
        receiver?.isPrimaryReceiver,
      ]
    );
  });

  // Save attachmentList
  attachmentList?.forEach((attachment) => {
    // Insert to attachment_submitted_form_table
    plv8.execute(
      `INSERT INTO attachment_submitted_form_table (
            attachment_submitted_form_attachment_id, 
            attachment_submitted_form_submitted_form_id
        ) 
        VALUES (
            $1, 
            $2
        )`,
      [attachment.id, submittedFormId]
    );
  });

  return submittedFormId;

$$ LANGUAGE plv8;


-- TODO: Done but not tested yet.
CREATE FUNCTION update_submitted_form_receiver_status (params JSON) 
RETURNS VOID AS $$

const {
    submittedForm,
    submittedFormReceiver,
    receiverStatus,
    logToCommentList,
    sendNotificationToReceiverList,
    signature: var_signature,
  } = params;

  // Update submitted_form_receiver_receiver_status_id and submitted_form_receiver_status_last_updated in submitted_form_receiver_table
  const {
    submitted_form_receiver_submitted_form_id,
    submitted_form_receiver_is_primary_receiver,
  } = plv8.execute(
    `UPDATE submitted_form_receiver_table 
    SET 
        submitted_form_receiver_receiver_status_id = $1, 
        submitted_form_receiver_status_last_updated = NOW(), 
        submitted_form_receiver_signature_attachment_id = $2
    WHERE submitted_form_receiver_id = $3 
    RETURNING submitted_form_receiver_submitted_form_id, submitted_form_receiver_is_primary_receiver`,
    [receiverStatus, var_signature?.id, submittedFormReceiver.id]
  )[0];

  // Update submitted_form_submitted_form_status_id in submitted_form_table if the approver is the primary approver
  if (submitted_form_receiver_is_primary_receiver) {
    let submittedFormStatus = null;
    if (receiverStatus === "ACTION_APPROVED") {
      submittedFormStatus = "REQUEST_APPROVED";
    } else if (receiverStatus === "ACTION_REJECTED") {
      submittedFormStatus = "REQUEST_REJECTED";
    } else if (receiverStatus === "ACTION_PENDING") {
      submittedFormStatus = "REQUEST_PENDING";
    } else {
      throw new Error("Invalid receiver status");
    }

    plv8.execute(
      `UPDATE submitted_form_table 
        SET 
          submitted_form_submitted_form_status_id = $1, 
          submitted_form_status_last_updated = NOW()
        WHERE submitted_form_id = $2`,
      [submittedFormStatus, submitted_form_receiver_submitted_form_id]
    );
  }

 // Query approver id
    const { submitted_form_receiver_user_id } = plv8.execute(
      `SELECT submitted_form_receiver_user_id FROM submitted_form_receiver_table WHERE submitted_form_receiver_id = $1`,
      [submittedFormReceiver.id]
    )[0];

  if (logToCommentList) {
    const commentType =
    receiverStatus === "ACTION_APPROVED"
      ? "ACTION_APPROVED"
      : receiverStatus === "ACTION_REJECTED"
      ? "ACTION_REJECTED"
      : null;

    const commentId = plv8.execute(
      `INSERT INTO comment_table (comment_user_id, comment_content, comment_app_id, comment_comment_type_id) 
    VALUES ($1, $2, $3, $4) 
    RETURNING comment_id`,
      [submitted_form_receiver_user_id, null, submittedForm.app, commentType]
    )[0].comment_id;

    plv8.execute(
      `INSERT INTO comment_submitted_form_table (comment_submitted_form_comment_id, comment_submitted_form_submitted_form_id) 
    VALUES ($1, $2)`,
      [commentId, submitted_form_receiver_submitted_form_id]
    );
  }

  if (sendNotificationToReceiverList) {
   

    // Query approver username
    const { username } = plv8.execute(
      `SELECT username FROM user_profile_table WHERE user_id = $1`,
      [submitted_form_receiver_user_id]
    )[0];

    // Query requester
    const { submitted_form_user_id, submitted_form_team_id } =
      plv8.execute(
        `SELECT submitted_form_user_id, submitted_form_team_id FROM submitted_form_table WHERE submitted_form_id = $1`,
        [submitted_form_receiver_submitted_form_id]
      )[0];

    const notificationType =
      receiverStatus === "ACTION_APPROVED"
        ? "ACTION_APPROVED"
        : receiverStatus === "ACTION_REJECTED"
        ? "ACTION_REJECTED"
        : null;

    const redirectUrl = `/requests/${submitted_form_receiver_submitted_form_id}`;

    const approval =
      receiverStatus === "ACTION_APPROVED"
        ? "approved"
        : receiverStatus === "ACTION_REJECTED"
        ? "rejected"
        : null;

    const content = `Your request has been ${approval} by ${username}.`;

    plv8.execute(
      `INSERT INTO notification_table (
        notification_content,
        notification_redirect_url,
        notification_user_id,
        notification_notification_type_id,
        notification_app_id,
        notification_team_id
      )
      VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        content,
        redirectUrl,
        submitted_form_user_id,
        notificationType,
        submittedForm.app,
        submitted_form_team_id,
      ]
    );
  }

$$ LANGUAGE plv8;

CREATE FUNCTION accept_team_invitation (params JSON)
RETURNS UUID AS $$
const { userId, invitationId } = params;

  // Get email of the user from auth.users table
  const userEmail = plv8.execute(
    `SELECT email FROM auth.users WHERE id = $1`,
    [userId]
  )[0].email;

  // Verify if the email in invitation matches the one who is accepting the invitation.
  const invitation = plv8.execute(
      `SELECT invitation_to_email, invitation_team_id, invitation_date_created FROM invitation_table WHERE invitation_id = $1`, 
      [invitationId]
  )[0];

  if (invitation.invitation_to_email !== userEmail) {
      throw new Error("Email in invitation does not match the one who is accepting the invitation.");
  }

  // Check if user is already in the team
  const teamMember = plv8.execute(
    `SELECT team_member_id FROM team_member_table WHERE team_member_user_id = $1 AND team_member_team_id = $2 LIMIT 1`,
    [userId, invitation.invitation_team_id]
  );

  if (teamMember.length > 0) {
    throw new Error("User is already in the team.");
  }

  // Make sure the invitation is not expired
  const invitationDateCreated = new Date(invitation.invitation_date_created).getTime();
  const now = new Date().getTime();
  const hoursSinceCreated = (now - invitationDateCreated) / (1000 * 60 * 60);

  // Invitation will expire after 23 hours
  if (hoursSinceCreated > 23) {
    throw new Error("Invitation is expired.");
  }

  // Add user to the team
  const result = plv8.execute(
    `INSERT INTO team_member_table (team_member_user_id, team_member_team_id) VALUES ($1, $2) RETURNING team_member_id`, 
    [userId, invitation.invitation_team_id]
  );  

  if (result.length === 0) {
    throw new Error("Failed to add user to the team.");
  }

  // Update user_active_team_id from user_profile_table
  plv8.execute(
    `UPDATE user_profile_table SET user_active_team_id = $1 WHERE user_id = $2`, 
    [invitation.invitation_team_id, userId]
  );

  return invitation.invitation_team_id;

$$ LANGUAGE plv8 SECURITY DEFINER;

CREATE FUNCTION cancel_request (params JSON)
RETURNS VOID AS $$

const { app, submittedFormId, userId } = params;

if (!submittedFormId || !userId) {
    throw new Error("All parameters must have a value.");
}

const submittedForm = plv8.execute(
    `SELECT * FROM submitted_form_table WHERE submitted_form_id = $1 LIMIT 1`, 
    [submittedFormId]
)[0];

if (!submittedForm) {
    throw new Error("Submitted form not found.");
}

// Verify if the user is the owner of the submitted form
if(submittedForm.submitted_form_user_id !== userId) {
    throw new Error("User is not the owner of the submitted form.");
} 

// Verify that the submitted_form_submitted_form_status_id === 'REQUEST_PENDING'
if(submittedForm.submitted_form_submitted_form_status_id !== 'REQUEST_PENDING') {
    throw new Error("Submitted form is not in pending status.");
}

// Get username and current server date
const { username, date } = plv8.execute(
    `SELECT user_profile_table.username AS username, get_current_date() AS date FROM user_profile_table WHERE user_profile_table.user_id = $1 LIMIT 1`, 
    [userId]
)[0];

// Update submitted_form_submitted_form_status_id to 'REQUEST_CANCELED' and submitted_form_status_last_updated to date
plv8.execute(
    `UPDATE submitted_form_table 
    SET submitted_form_submitted_form_status_id = 'REQUEST_CANCELED', submitted_form_status_last_updated = $1 
    WHERE submitted_form_id = $2`,
    [date, submittedFormId]
);

// Log the cancellation under the submitted form comment section.
const comment = plv8.execute(
    `INSERT INTO comment_table (comment_user_id, comment_content, comment_app_id, comment_comment_type_id) 
    VALUES ($1, $2, $3, $4) 
    RETURNING comment_id`, 
    [
        userId,
        `${username} cancelled this request.`,
        app,
        'REQUEST_CANCELED'
    ]
)[0].comment_id;

plv8.execute(
    `INSERT INTO comment_submitted_form_table (comment_submitted_form_comment_id, comment_submitted_form_submitted_form_id) 
    VALUES ($1, $2)`, 
    [comment, submittedFormId]
);

$$ LANGUAGE plv8;

  -- params: {
  --   teamId: string;
  --   fromUserId: string;
  --   toUserId: string;
  -- }
CREATE FUNCTION transfer_team_ownership (params JSON)
RETURNS VOID AS $$

const { teamId, fromUserId, toUserId } = params;

if (!teamId || !fromUserId || !toUserId) {
    throw new Error("All parameters must have a value.");
}

// Verify fromUserId is the owner of the team from team_member_table
const fromUser = plv8.execute(
    `SELECT team_member_id FROM team_member_table WHERE team_member_user_id = $1 AND team_member_team_id = $2 AND team_member_member_role_id = 'OWNER' LIMIT 1`, 
    [fromUserId, teamId]
)[0];

if (!fromUser) {
    throw new Error("User is not the owner of the team.");
}

// Verify toUserId is a member of the team from team_member_table
const toUser = plv8.execute(
    `SELECT team_member_id FROM team_member_table WHERE team_member_user_id = $1 AND team_member_team_id = $2 LIMIT 1`, 
    [toUserId, teamId]
)[0];

if (!toUser) {
    throw new Error("User is not a member of the team.");
}
if (toUser.team_member_member_role_id === 'OWNER') {
    throw new Error("User is already the owner of the team.");
}

plv8.execute(
    `UPDATE team_member_table 
    SET team_member_member_role_id = 'OWNER' 
    WHERE team_member_user_id = $1 AND team_member_team_id = $2`, 
    [toUserId, teamId]
);

plv8.execute(
    `UPDATE team_member_table 
    SET team_member_member_role_id = 'ADMIN' 
    WHERE team_member_user_id = $1 AND team_member_team_id = $2`, 
    [fromUserId, teamId]
);

$$ LANGUAGE plv8;

-- ! DEVELOPMENT ONLY
CREATE FUNCTION get_auth_user_list ()
RETURNS JSON AS $$
const userList = plv8.execute(`SELECT id, email FROM auth.users LIMIT 10`);

return userList;
$$ LANGUAGE plv8 SECURITY DEFINER;

-- Seed function to populate database.
CREATE FUNCTION seed ()
RETURNS VOID AS $$ 

    const userList = plv8.execute(`SELECT id, email FROM auth.users LIMIT 10`);

  const devUser = plv8.execute(
    `SELECT id, email FROM auth.users WHERE email = 'dev@dodeca.com.ph'`
  )[0];

  userList.push(devUser);

  userList.forEach((user) => {
    const onboardUserParams = {
      userId: user.id,
      email: user.email,
      firstName: `${user.email.split("@")[0]} first name`,
      lastName: `${user.email.split("@")[0]} last name`,
      teamName: `${user.email.split("@")[0]} team`,
      username: `${user.email.split("@")[0]}`,
    };
    plv8.execute(`SELECT onboard_user($1)`, [
      JSON.stringify(onboardUserParams),
    ]);
  });

  // Add userList to devUser team.
  const devUserTeamId = plv8.execute(
    `SELECT team_member_team_id FROM team_member_table WHERE team_member_user_id = $1 AND team_member_member_role_id = 'OWNER'`,
    [devUser.id]
  )[0].team_member_team_id;

  userList.forEach((user) => {
    // Exclude devUser from being added again to his/her own team
    if (user.id === devUser.id) {
      return;
    }

    plv8.execute(
      `INSERT INTO team_member_table (team_member_user_id, team_member_team_id, team_member_member_role_id) 
        VALUES ($1, $2, $3)`,
      [user.id, devUserTeamId, "MEMBER"]
    );
  });

  // Let devUser build a request form using build_form function.

  // Get random receiver from userList.
  const randomReceiver = userList[Math.floor(Math.random() * userList.length)];
  const randomReceiver2 = userList[Math.floor(Math.random() * userList.length)];

  const buildFormParams = {
    form: {
      app: "REQUEST",
      name: "Sample Form",
      description: "This is a sample form",
      settingList: ["FORM_SIGNATURE_REQUIRED"],
      team: {
        id: devUserTeamId,
      },
      createdBy: {
        id: devUser.id,
      },
    },
    fieldList: [
      {
        name: "Full Name",
        description: "Enter your full name",
        type: "TEXT",
        required: true,
        order: 1,
        tagList: ["SUBMISSION_FORM_TITLE"],
      },
      {
        name: "Email",
        description: "Enter your email",
        type: "TEXT",
        required: true,
        order: 2,
        tagList: ["SUBMISSION_FORM_DESCRIPTION"],
      },
      {
        name: "Rating",
        description: "Rate this product",
        type: "SLIDER",
        required: true,
        order: 3,
        sliderMin: 1,
        sliderMax: 5,
        tagList: ["POSITIVE_METRIC"],
      },
      {
        name: "Favorite Color",
        description: "Select your favorite color",
        type: "SELECT",
        required: true,
        order: 4,
        optionList: [
          {
            value: "Red",
            description: "A warm color",
            order: 1,
          },
          {
            value: "Blue",
            description: "A cool color",
            order: 2,
          },
          {
            value: "Green",
            description: "A natural color",
            order: 3,
          },
        ],
      },
      {
        name: "Favorite Fruit",
        description: "Select your favorite fruit",
        type: "MULTISELECT",
        required: true,
        order: 5,
        optionList: [
          {
            value: "Apple",
            description: "A round fruit",
            order: 1,
          },
          {
            value: "Banana",
            description: "A curved fruit",
            order: 2,
          },
          {
            value: "Cherry",
            description: "A small fruit",
            order: 3,
          },
        ],
      },
    ],
    receiverList: [
      {
        isPrimaryReceiver: true,
        order: 1,
        action: {
          name: "Approve",
        },
        user: {
          id: randomReceiver.id,
        },
      },
      {
        isPrimaryReceiver: false,
        order: 2,
        action: {
          name: "Reject",
        },
        user: {
          id: randomReceiver2.id,
        },
      },
    ],
    settingList: ["FORM_SIGNATURE_REQUIRED"],
  };

  // Call build_form function and store the return fvalue in formId variable.
  const formId = plv8.execute(`SELECT build_form($1)`, [
    JSON.stringify(buildFormParams),
  ])[0].build_form;

  // Let devUser submit a request using submit_form function.

  // Query fields from form.
  const formFieldList = plv8.execute(
    `SELECT form_field_form_id, form_field_field_id, form_field_order FROM form_field_table WHERE form_field_form_id = $1`,
    [formId]
  );

  // Create fieldWithResponseList.
  const fieldWithResponseList = formFieldList.map((formField) => {
    // Query field from field_table
    const field = plv8.execute(
      `SELECT field_id, field_field_type_id FROM field_table WHERE field_id = $1`,
      [formField.form_field_field_id]
    )[0];

    const varcharFieldTypeList = ["SECTION", "TEXT", "TEXTAREA"];
    const numberFieldTypeList = ["NUMBER", "SLIDER"];
    const dateFieldTypeList = ["DATE"];
    const arrayFieldTypeList = ["SELECT", "MULTISELECT", "DATERANGE", "MULTICHECKBOX"];

    if (varcharFieldTypeList.includes(field.field_field_type_id)) {
      return {
        field: {
          id: field.field_id,
        },
        response: {
          value: "Response value for Field 1",
        },
      };
    } else if (numberFieldTypeList.includes(field.field_field_type_id)) {
      return {
        field: {
          id: field.field_id,
        },
        response: {
          value: 123,
        },
      };
    } else if (dateFieldTypeList.includes(field.field_field_type_id)) {
      return {
        field: {
          id: field.field_id,
        },
        response: {
          value: "2021-01-01",
        },
      };
    } else if (arrayFieldTypeList.includes(field.field_field_type_id)) {
      // Query options per fieldList from field_option_table
      const optionList = plv8.execute(
        `SELECT field_option_id, field_option_option_id, field_option_field_id, field_option_order FROM field_option_table WHERE field_option_field_id = $1`,
        [field.field_id]
      );

      return {
        field: {
          id: field.field_id,
        },
        response: {
          value: optionList.map((option) => option.field_option_option_id),
        },
      };
    }
  });

  // Query form receiver actions from form_receiver_table
  const formReceiverActionIdList = plv8.execute(
    `SELECT form_receiver_action_id FROM form_receiver_table WHERE form_receiver_form_id = $1 ORDER BY form_receiver_order ASC`,
    [formId]
  );

  const submitFormParams = {
    submittedForm: {
      app: "REQUEST",
      form: { id: formId },
      createdBy: { id: devUser.id },
      receiverList: buildFormParams.receiverList.map((receiver, i) => {
        return {
          isPrimaryReceiver: receiver.isPrimaryReceiver,
          order: receiver.order,
          user: {
            id: receiver.user.id,
          },
          action: {
            id: formReceiverActionIdList[i].form_receiver_action_id,
          },
        };
      }),
    },
    fieldWithResponseList,
  };

  const submittedFormId = plv8.execute(`SELECT submit_form($1)`, [
    JSON.stringify(submitFormParams),
  ]);

  const submittedFormReceiverList = plv8.execute(
    `SELECT submitted_form_receiver_id FROM submitted_form_receiver_table WHERE submitted_form_receiver_submitted_form_id = $1 ORDER BY submitted_form_receiver_order ASC`,
    [submittedFormId[0].submit_form]
  );

  submittedFormReceiverList.forEach((submittedFormReceiver) => {
    const updateSubmittedFormParams = {
      submittedForm: {
        app: "REQUEST",
      },
      receiverStatus:
        Math.random() > 0.5 ? "ACTION_APPROVED" : "ACTION_REJECTED",
      logToCommentList: true,
      sendNotificationToReceiverList: true,
      submittedFormReceiver: { id: submittedFormReceiver.submitted_form_receiver_id },
    };

    plv8.execute(`SELECT update_submitted_form_receiver_status($1)`, [
      JSON.stringify(updateSubmittedFormParams),
    ]);
  });
  

   const submittedForm2 = plv8.execute(`SELECT submit_form($1)`, [
    JSON.stringify(submitFormParams),
  ]);
  const cancelRequestParams = {
    app: 'REQUEST',
    submittedFormId: submittedForm2[0].submit_form,
    userId: devUser.id,
  };

  // Cancel request using cancel_request function.
  plv8.execute(`SELECT cancel_request($1)`, [JSON.stringify(cancelRequestParams)]);


$$ LANGUAGE plv8 SECURITY DEFINER;

CREATE TABLE review_user_stars_user_table (
  user_stars_user_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  user_stars_user_from_user_id UUID REFERENCES user_profile_table (user_id) NOT NULL,
  user_stars_users_to_user_id UUID REFERENCES user_profile_table (user_id) NOT NULL,
  user_stars_user_created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  user_stars_user_is_consumed BOOLEAN DEFAULT FALSE NOT NULL
);CREATE VIEW review_user_stars_user_view AS
SELECT
  rusut.user_stars_user_id,
  rusut.user_stars_user_from_user_id,
  rusut.user_stars_users_to_user_id,
  rusut.user_stars_user_created_at,
  rusut.user_stars_user_is_consumed,
  from_user.username AS from_user_username,
  from_user.user_first_name AS from_user_first_name,
  from_user.user_last_name AS from_user_last_name,
  from_user.user_email AS from_user_email,
  to_user.username AS to_user_username,
  to_user.user_first_name AS to_user_first_name,
  to_user.user_last_name AS to_user_last_name,
  to_user.user_email AS to_user_email
FROM
  review_user_stars_user_table rusut
JOIN
  user_profile_table from_user ON rusut.user_stars_user_from_user_id = from_user.user_id
JOIN
  user_profile_table to_user ON rusut.user_stars_users_to_user_id = to_user.user_id;

CREATE VIEW review_lifetime_user_stars_given_count_view AS
SELECT
    user_stars_user_from_user_id AS "userId",
    COUNT(*) AS "starsGiven"
FROM
    review_user_stars_user_table
GROUP BY
    user_stars_user_from_user_id;

CREATE VIEW review_lifetime_user_stars_received_count_view AS
SELECT
    user_stars_users_to_user_id AS "userId",
    COUNT(*) AS "starsReceived"
FROM
    review_user_stars_user_table
GROUP BY
    user_stars_users_to_user_id;

CREATE VIEW review_yearly_user_stars_given_count_view AS
SELECT
    user_stars_user_from_user_id AS "userId",
    EXTRACT(year FROM user_stars_user_created_at)::integer AS "year",
    COUNT(*) AS "starsGiven"
FROM
    review_user_stars_user_table
GROUP BY
    user_stars_user_from_user_id, EXTRACT(year FROM user_stars_user_created_at);


CREATE VIEW review_yearly_user_stars_received_count_view AS
SELECT
    user_stars_users_to_user_id AS "userId",
    EXTRACT(year FROM user_stars_user_created_at)::integer AS "year",
    COUNT(*) AS "starsReceived"
FROM
    review_user_stars_user_table
GROUP BY
    user_stars_users_to_user_id, EXTRACT(year FROM user_stars_user_created_at);

-- View average metric score for each form in a lifetime
CREATE VIEW review_lifetime_average_metric_score_per_user_or_group_view AS 
WITH submitted_form_receiver_list_combination AS (
    SELECT
    sfr.submitted_form_receiver_submitted_form_id,
    string_agg(sfr.submitted_form_receiver_user_id::text, ',' ORDER BY sfr.submitted_form_receiver_user_id) AS concatenated_receiver_user_id_list
    FROM 
    submitted_form_receiver_table sfr
    GROUP BY sfr.submitted_form_receiver_submitted_form_id
)
SELECT
sf.submitted_form_form_id,
sf.submitted_form_team_id,
f.field_id,
sffr.submitted_form_field_response_order,
sfrlc.concatenated_receiver_user_id_list,
string_to_array(sfrlc.concatenated_receiver_user_id_list, ',')::UUID[] AS receiver_user_id_list,
AVG (
    CASE 
        WHEN f.field_field_type_id = 'BOOLEAN' THEN
            CASE 
                WHEN r.response_value_boolean = true THEN 1
                ELSE 0
            END
        ELSE r.response_value_int
    END
) AS average_metric_score
FROM submitted_form_receiver_list_combination sfrlc
JOIN submitted_form_field_response_table sffr ON sfrlc.submitted_form_receiver_submitted_form_id = sffr.submitted_form_field_response_submitted_form_id
JOIN submitted_form_table sf ON sfrlc.submitted_form_receiver_submitted_form_id = sf.submitted_form_id 
JOIN field_table f ON sffr.submitted_form_field_response_field_id = f.field_id 
JOIN response_table r ON sffr.submitted_form_field_response_response_id = r.response_id
WHERE sf.submitted_form_app_id = 'REVIEW' AND (f.field_field_type_id = 'SLIDER' OR f.field_field_type_id = 'BOOLEAN')
GROUP BY 
    sf.submitted_form_form_id,
    sfrlc.concatenated_receiver_user_id_list,
    sf.submitted_form_team_id,
    f.field_id,
    sffr.submitted_form_field_response_order;

-- View average metric score for each form per month
-- plpgsql already considers the year as well. So April of 2023 will not be grouped together with April of 2024.
-- Reference: https://stackoverflow.com/a/27001121
CREATE VIEW review_monthly_average_metric_score_per_user_or_group_view AS 
WITH submitted_form_receiver_list_combination AS (
    SELECT
    sfr.submitted_form_receiver_submitted_form_id,
    string_agg(sfr.submitted_form_receiver_user_id::text, ',' ORDER BY sfr.submitted_form_receiver_user_id) AS concatenated_receiver_user_id_list
    FROM 
    submitted_form_receiver_table sfr
    GROUP BY sfr.submitted_form_receiver_submitted_form_id
)
SELECT
sf.submitted_form_form_id,
sf.submitted_form_team_id,
f.field_id,
sfrlc.concatenated_receiver_user_id_list,
string_to_array(sfrlc.concatenated_receiver_user_id_list, ',')::UUID[] AS receiver_user_id_list,
date_trunc('month', sf.submitted_form_date_created) AS month,
AVG (
    CASE 
        WHEN f.field_field_type_id = 'BOOLEAN' THEN
            CASE 
                WHEN r.response_value_boolean = true THEN 1
                ELSE 0
            END
        ELSE r.response_value_int
    END
) AS average_metric_score
FROM submitted_form_receiver_list_combination sfrlc
JOIN submitted_form_field_response_table sffr ON sfrlc.submitted_form_receiver_submitted_form_id = sffr.submitted_form_field_response_submitted_form_id
JOIN submitted_form_table sf ON sfrlc.submitted_form_receiver_submitted_form_id = sf.submitted_form_id 
JOIN field_table f ON sffr.submitted_form_field_response_field_id = f.field_id 
JOIN response_table r ON sffr.submitted_form_field_response_response_id = r.response_id
WHERE sf.submitted_form_app_id = 'REVIEW' AND (f.field_field_type_id = 'SLIDER' OR f.field_field_type_id = 'BOOLEAN')
GROUP BY 
    sf.submitted_form_form_id,
    date_trunc('month', sf.submitted_form_date_created),
    sfrlc.concatenated_receiver_user_id_list,
    sf.submitted_form_team_id,
    f.field_id;

-- Get key performing user or group per metric in a review form.
-- Lifetime
CREATE FUNCTION review_get_top_performing_user_or_group_by_metric (p_field_id UUID)
RETURNS TABLE (
    submitted_form_form_id UUID,
    receiver_user_id_list UUID[],
    field_id UUID,
    average_metric_score NUMERIC,
    user_profile_list JSON[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        rlammspurg.submitted_form_form_id,
        string_to_array(rlammspurg.concatenated_receiver_user_id_list, ',')::UUID[] AS receiver_user_id_list,
        rlammspurg.field_id,
        rlammspurg.average_metric_score,
        array(
            SELECT json_build_object(
                'userId', u.user_id,
                'dateCreated', u.user_date_created,
                'username', u.username,
                'firstName', u.user_first_name,
                'lastName', u.user_last_name,
                'avatarAttachmentId', u.user_avatar_attachment_id,
                'email', u.user_email
            )
            FROM user_profile_table u
            WHERE u.user_id = ANY(string_to_array(rlammspurg.concatenated_receiver_user_id_list, ',')::UUID[])
        ) AS user_profile_list
    FROM 
        review_lifetime_average_metric_score_per_user_or_group_view rlammspurg
    WHERE rlammspurg.field_id = p_field_id
    ORDER BY rlammspurg.average_metric_score DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- View review form with top performing user or group per metric
CREATE VIEW review_form_with_top_performing_user_or_group_by_metric_view AS
SELECT
    fm."app" as "app",
    fm."id" as "id",
    fm."name" as "name",
    fm."description" as "description",
    fm."dateCreated" as "dateCreated",
    fm."isArchived" as "isArchived",
    fm."isDisabled" as "isDisabled",
    fm."createdById" as "createdById",
    fm."createdByUsername" as "createdByUsername",
    fm."teamId" as "teamId",
    json_build_object(
        'app', fm."app",
        'id', fm."id",
        'name', fm."name",
        'description', fm."description",
        'dateCreated', fm."dateCreated",
        'isDisabled', fm."isDisabled",
        'isArchived', fm."isArchived",
        'createdBy', fm."createdBy",
        'team', fm."team",
        'settingList', fm."settingList",
        'receiverList', fm."receiverList"
    ) as "form",
    ff2."fieldList" as "fieldList"
FROM form_metadata_view fm
LEFT JOIN 
(
    SELECT
    ff.form_field_form_id,
    json_agg(
        json_build_object(
            'id', f.field_id,
            'name', f.field_name,
            'description', f.field_description,
            'type', f.field_field_type_id,
            'required', f.field_is_required,
            'order', ff.form_field_order,
            'sliderMin', f.field_slider_min,
            'sliderMax', f.field_slider_max,
            'optionList', foo."optionList",
            'tagList', ftf."tagList",
            'topPerformingUserOrGroup', tpug.*
        )
    ) as "fieldList"
    FROM form_field_table ff 
    LEFT JOIN field_table f ON ff.form_field_field_id = f.field_id
    LEFT JOIN
    (
        SELECT
        fo.field_option_field_id,
        json_agg(json_build_object(
            'id', o.option_id,
            'value', o.option_value_varchar,
            'description', o.option_description,
            'order', fo.field_option_order
        )) as "optionList"
        FROM field_option_table fo
        JOIN option_table o ON fo.field_option_option_id = o.option_id
        GROUP BY fo.field_option_field_id
    ) foo ON ff.form_field_field_id = foo.field_option_field_id
    LEFT JOIN
    (
        SELECT
        ftf.field_tag_field_field_id,
        json_agg(ftf.field_tag_field_field_tag_id) as "tagList"
        FROM field_tag_field_table ftf 
        GROUP BY ftf.field_tag_field_field_id
    ) ftf ON ff.form_field_field_id = ftf.field_tag_field_field_id
    LEFT JOIN LATERAL (
        SELECT * 
        FROM review_get_top_performing_user_or_group_by_metric(f.field_id) tpug
    ) tpug ON true
    GROUP BY ff.form_field_form_id
) ff2 ON fm."id" = ff2.form_field_form_id
WHERE fm."app" = 'REVIEW';

-- Filters review_monthly_average_metric_score_per_user_or_group_view to only include the past p_months
CREATE FUNCTION review_monthly_average_metric_score_past_months(p_months INTEGER)
RETURNS TABLE (
    submitted_form_form_id UUID,
    field_id UUID,
    concatenated_receiver_user_id_list TEXT,
    receiver_user_id_list UUID[],
    month TIMESTAMPTZ,
    average_metric_score NUMERIC
) AS $$
DECLARE
    current_month_start DATE := date_trunc('MONTH', current_date)::DATE;
BEGIN
    RETURN QUERY
    SELECT
        rmamspugv.submitted_form_form_id,
        rmamspugv.field_id,
        rmamspugv.concatenated_receiver_user_id_list,
        string_to_array(rmamspugv.concatenated_receiver_user_id_list, ',')::UUID[] AS receiver_user_id_list,
        rmamspugv.month,
        rmamspugv.average_metric_score
    FROM 
        review_monthly_average_metric_score_per_user_or_group_view rmamspugv
    WHERE rmamspugv.month >= (current_month_start - INTERVAL '1 month' * p_months)::DATE AND rmamspugv.month < current_month_start;
END;
$$ LANGUAGE plpgsql;

-- View user or group average metrric scores per form using review_lifetime_average_metric_score_per_user_or_group_view
CREATE VIEW review_user_or_group_average_metric_score_per_form_view AS
SELECT
    rlams.submitted_form_form_id,
    rlams.submitted_form_team_id,
    form.form_name,
    json_agg(
        json_build_object(
            'field_id', rlams.field_id,
            'average_metric_score', rlams.average_metric_score,
            'field_name', ft.field_name,
            'field_description', ft.field_description,
            'field_is_required', ft.field_is_required,
            'field_field_type_id', ft.field_field_type_id,
            'field_slider_min', ft.field_slider_min,
            'field_slider_max', ft.field_slider_max,
            'field_order', rlams.submitted_form_field_response_order
        )
    ) AS field_average_score_list,
    rlams.concatenated_receiver_user_id_list,
    rlams.receiver_user_id_list,
    json_agg(
        DISTINCT jsonb_build_object(
            'user_id', u.user_id,
            'username', u.username,
            'user_first_name', u.user_first_name,
            'user_last_name', u.user_last_name,
            'user_email', u.user_email,
            'user_job_title', u.user_job_title
        )
    ) AS user_information_list
FROM review_lifetime_average_metric_score_per_user_or_group_view rlams
JOIN field_table ft ON rlams.field_id = ft.field_id
JOIN form_table form ON rlams.submitted_form_form_id = form.form_id
LEFT JOIN LATERAL (
    SELECT *
    FROM user_profile_table
    WHERE user_id = ANY(rlams.receiver_user_id_list)
) u ON TRUE


GROUP BY
    rlams.submitted_form_form_id,
    rlams.submitted_form_team_id,
    rlams.concatenated_receiver_user_id_list,
    rlams.receiver_user_id_list,
    form.form_name;


-- Requisition Form and Trip Ticketing start

-- TABLES
CREATE TABLE item_table(
  item_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  item_created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  -- item_udpated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  item_general_name VARCHAR(4000) NOT NULL,
  item_unit VARCHAR(4000) NOT NULL,
  item_is_available BOOLEAN NOT NULL,

  item_team_id UUID REFERENCES team_table(team_id) NOT NULL,
  UNIQUE(item_general_name, item_team_id)
);

CREATE TABLE item_field_label_table(
  item_field_label_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  item_field_label_created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  item_field_label VARCHAR(4000) NOT NULL,
  item_field_label_is_available BOOLEAN NOT NULL,

  item_field_label_item_id UUID REFERENCES item_table(item_id) ON DELETE CASCADE NOT NULL 
);

CREATE TABLE item_field_table(
  item_field_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  item_field_created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  item_field_row_id UUID NOT NULL,
  item_field_value VARCHAR(4000) NOT NULL,
  item_field_is_available BOOLEAN,

  item_field_item_field_label_id UUID REFERENCES item_field_label_table(item_field_label_id) ON DELETE CASCADE NOT NULL 
);

CREATE TABLE project_table(
  project_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  project_created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  project_name VARCHAR(4000) NOT NULL,
  project_is_available BOOLEAN NOT NULL,

  project_team_id UUID REFERENCES team_table(team_id) NOT NULL
);

CREATE TABLE vehicle_table(
  vehicle_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  vehicle_created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  vehicle_plate_number VARCHAR(4000) NOT NULL,
  vehicle_make VARCHAR(4000) NOT NULL,
  vehicle_model VARCHAR(4000) NOT NULL,
  vehicle_year_of_manufacturer INT,
  vehicle_color VARCHAR(4000) NOT NULL,
  vehicle_chassis_number VARCHAR(4000) NOT NULL,
  vehicle_odometer_reading INT,
  vehicle_equipment_number VARCHAR(4000) NOT NULL,
  vehicle_is_available BOOLEAN NOT NULL,

  vehicle_team_id UUID REFERENCES team_table(team_id) NOT NULL,
  UNIQUE(vehicle_plate_number, vehicle_team_id),
  UNIQUE(vehicle_equipment_number, vehicle_team_id)
);

CREATE TABLE driver_table(
  driver_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  driver_created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  driver_name VARCHAR(4000) NOT NULL,
  driver_contact_number VARCHAR(4000) NOT NULL,
  driver_is_available BOOLEAN NOT NULL,

  driver_team_id UUID REFERENCES team_table(team_id) NOT NULL
);

CREATE TABLE project_site_table(
  project_site_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  project_site_created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  project_site_location VARCHAR(4000) NOT NULL,
  project_site_is_available BOOLEAN NOT NULL,

  project_site_team_id UUID REFERENCES team_table(team_id) NOT NULL
);

-- FUNCTIONS
CREATE FUNCTION create_item (params JSON)
RETURNS VOID AS $$
  const {descriptions, generalName, isAvailable, unit, teamId} = params;
  const itemId = plv8.execute(
      `INSERT INTO item_table (item_general_name, item_unit, item_is_available, item_team_id)
      VALUES ($1, $2, $3, $4) RETURNING item_id`, 
      [generalName, unit, isAvailable, teamId]
  )[0].item_id;
  descriptions.forEach((label) => {
    plv8.execute(
      `INSERT INTO item_field_label_table (item_field_label, item_field_label_is_available, item_field_label_item_id)
      VALUES ($1, $2, $3)`, 
      [label, true, itemId]
    );
  });
$$ LANGUAGE plv8;

CREATE FUNCTION delete_item (params JSON)
RETURNS VOID AS $$
  const {descriptions, generalName, isAvailable, unit, teamId} = params;
  const itemId = plv8.execute(
      `INSERT INTO item_table (item_general_name, item_unit, item_is_available, item_team_id)
      VALUES ($1, $2, $3, $4) RETURNING item_id`, 
      [generalName, unit, isAvailable, teamId]
  )[0].item_id;
  descriptions.forEach((label) => {
    plv8.execute(
      `INSERT INTO item_field_label_table (item_field_label, item_field_label_is_available, item_field_label_item_id)
      VALUES ($1, $2, $3)`, 
      [label, true, itemId]
    );
  });
$$ LANGUAGE plv8;





GRANT ALL ON ALL TABLES IN SCHEMA public TO PUBLIC;
GRANT ALL ON ALL TABLES IN SCHEMA public TO POSTGRES;

GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

