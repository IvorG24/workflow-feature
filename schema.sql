----- Remove all policies for files
DROP POLICY IF EXISTS objects_policy ON storage.objects;
DROP POLICY IF EXISTS buckets_policy ON storage.buckets;

----- Delete file buckets created and files uploaded
DELETE FROM storage.objects;
DELETE FROM storage.buckets;

-- Allow all to access storage
CREATE POLICY objects_policy ON storage.objects FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY buckets_policy ON storage.buckets FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

----- START: STORAGES

INSERT INTO storage.buckets (id, name) VALUES ('USER_AVATARS', 'USER_AVATARS');
INSERT INTO storage.buckets (id, name) VALUES ('USER_SIGNATURES', 'USER_SIGNATURES');
INSERT INTO storage.buckets (id, name) VALUES ('TEAM_LOGOS', 'TEAM_LOGOS');
INSERT INTO storage.buckets (id, name) VALUES ('COMMENT_ATTACHMENTS', 'COMMENT_ATTACHMENTS');
INSERT INTO storage.buckets (id, name) VALUES ('REQUEST_ATTACHMENTS', 'REQUEST_ATTACHMENTS');
INSERT INTO storage.buckets (id, name) VALUES ('MEMO_ATTACHMENTS', 'MEMO_ATTACHMENTS');
INSERT INTO storage.buckets (id, name) VALUES ('TEAM_PROJECT_ATTACHMENTS', 'TEAM_PROJECT_ATTACHMENTS');
INSERT INTO storage.buckets (id, name) VALUES ('USER_VALID_IDS', 'USER_VALID_IDS');
INSERT INTO storage.buckets (id, name) VALUES ('TICKET_ATTACHMENTS', 'TICKET_ATTACHMENTS');
INSERT INTO storage.buckets (id, name) VALUES ('JOB_OFFER_ATTACHMENTS', 'JOB_OFFER_ATTACHMENTS');
INSERT INTO storage.buckets (id, name) VALUES ('SSS_ID_ATTACHMENTS', 'SSS_ID_ATTACHMENTS');

----- END: STORAGES

UPDATE storage.buckets SET public = true;

----- START: EXTENSIONS

CREATE EXTENSION IF NOT EXISTS plv8;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" with schema extensions;
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

----- END: EXTENSIONS

----- START: SCHEMAS

DROP SCHEMA IF EXISTS public CASCADE;
DROP SCHEMA IF EXISTS user_schema CASCADE;
DROP SCHEMA IF EXISTS history_schema CASCADE;
DROP SCHEMA IF EXISTS service_schema CASCADE;
DROP SCHEMA IF EXISTS unit_of_measurement_schema CASCADE;
DROP SCHEMA IF EXISTS item_schema CASCADE;
DROP SCHEMA IF EXISTS other_expenses_schema CASCADE;
DROP SCHEMA IF EXISTS equipment_schema CASCADE;
DROP SCHEMA IF EXISTS lookup_schema CASCADE;
DROP SCHEMA IF EXISTS jira_schema CASCADE;
DROP SCHEMA IF EXISTS memo_schema CASCADE;
DROP SCHEMA IF EXISTS ticket_schema CASCADE;
DROP SCHEMA IF EXISTS request_schema CASCADE;
DROP SCHEMA IF EXISTS form_schema CASCADE;
DROP SCHEMA IF EXISTS team_schema CASCADE;
DROP SCHEMA IF EXISTS hr_schema CASCADE;

CREATE SCHEMA public AUTHORIZATION postgres;
CREATE SCHEMA user_schema AUTHORIZATION postgres;
CREATE SCHEMA history_schema AUTHORIZATION postgres;
CREATE SCHEMA service_schema AUTHORIZATION postgres;
CREATE SCHEMA unit_of_measurement_schema AUTHORIZATION postgres;
CREATE SCHEMA item_schema AUTHORIZATION postgres;
CREATE SCHEMA other_expenses_schema AUTHORIZATION postgres;
CREATE SCHEMA equipment_schema AUTHORIZATION postgres;
CREATE SCHEMA lookup_schema AUTHORIZATION postgres;
CREATE SCHEMA jira_schema AUTHORIZATION postgres;
CREATE SCHEMA memo_schema AUTHORIZATION postgres;
CREATE SCHEMA ticket_schema AUTHORIZATION postgres;
CREATE SCHEMA request_schema AUTHORIZATION postgres;
CREATE SCHEMA form_schema AUTHORIZATION postgres;
CREATE SCHEMA team_schema AUTHORIZATION postgres;
CREATE SCHEMA hr_schema AUTHORIZATION postgres;

----- END: SCHEMAS

----- START: SEQUENCES

CREATE SEQUENCE request_schema.formsly_id_seq;

----- END: SEQUENCES

----- START: TABLES

CREATE TABLE attachment_table (
  attachment_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  attachment_name VARCHAR(4000) NOT NULL,
  attachment_value VARCHAR(4000) NOT NULL,
  attachment_bucket VARCHAR(4000) NOT NULL,
  attachment_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  attachment_is_disabled BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE address_table (
  address_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  address_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  address_region VARCHAR(4000) NOT NULL,
  address_province VARCHAR(4000) NOT NULL,
  address_city VARCHAR(4000) NOT NULL,
  address_barangay VARCHAR(4000) NOT NULL,
  address_street VARCHAR(4000) NOT NULL,
  address_zip_code VARCHAR(4000) NOT NULL,
  address_latitude VARCHAR(4000),
  address_longitude VARCHAR(4000)
);

CREATE TABLE user_schema.user_table (
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

  user_signature_attachment_id UUID REFERENCES attachment_table(attachment_id)
);

CREATE TABLE team_schema.team_table (
  team_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  team_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  team_expiration DATE,
  team_name VARCHAR(4000) NOT NULL,
  team_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
  team_is_request_signature_required BOOLEAN DEFAULT FALSE NOT NULL,
  team_logo VARCHAR(4000),

  team_user_id UUID REFERENCES user_schema.user_table(user_id) NOT NULL
);

CREATE TABLE team_schema.team_transaction_table (
  team_transaction_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  team_transaction_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  team_transaction_price INT NOT NULL,
  team_transaction_number_of_months INT NOT NULL,
  team_transaction_team_expiration_date DATE NOT NULL,

  team_transaction_team_id UUID REFERENCES team_schema.team_table(team_id) NOT NULL
);

CREATE TABLE team_schema.team_member_table (
  team_member_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  team_member_role VARCHAR(4000) DEFAULT 'MEMBER' NOT NULL,
  team_member_date_created DATE DEFAULT NOW() NOT NULL,
  team_member_is_disabled BOOL DEFAULT FALSE NOT NULL,

  team_member_user_id UUID REFERENCES user_schema.user_table(user_id) NOT NULL,
  team_member_team_id UUID REFERENCES team_schema.team_table(team_id) NOT NULL,
  UNIQUE (team_member_team_id, team_member_user_id)
);

CREATE TABLE team_schema.team_group_table (
  team_group_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  team_group_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  team_group_name VARCHAR(4000) NOT NULL,
  team_group_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,

  team_group_team_id UUID REFERENCES team_schema.team_table(team_id) NOT NULL
);

CREATE TABLE team_schema.team_project_table (
  team_project_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  team_project_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  team_project_name VARCHAR(4000) NOT NULL,
  team_project_code VARCHAR(4000) NOT NULL,
  team_project_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,

  team_project_site_map_attachment_id UUID REFERENCES attachment_table(attachment_id),
  team_project_boq_attachment_id UUID REFERENCES attachment_table(attachment_id),
  team_project_team_id UUID REFERENCES team_schema.team_table(team_id) NOT NULL,
  team_project_address_id UUID REFERENCES address_table(address_id)
);

CREATE TABLE team_schema.team_group_member_table (
  team_group_member_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  team_member_id UUID REFERENCES team_schema.team_member_table(team_member_id) ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,
  team_group_id UUID REFERENCES team_schema.team_group_table(team_group_id) ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,

  UNIQUE(team_group_id, team_member_id)
);

CREATE TABLE team_schema.team_project_member_table (
  team_project_member_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  team_member_id UUID REFERENCES team_schema.team_member_table(team_member_id) ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,
  team_project_id UUID REFERENCES team_schema.team_project_table(team_project_id) ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,

  UNIQUE(team_project_id, team_member_id)
);

CREATE TABLE team_schema.team_department_table (
  team_department_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  team_department_name VARCHAR(4000) NOT NULL,
  team_department_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
  team_department_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE team_schema.supplier_table (
  supplier_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  supplier_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  supplier VARCHAR(4000) NOT NULL,
  supplier_is_available BOOLEAN DEFAULT TRUE NOT NULL,
  supplier_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,

  supplier_team_id UUID REFERENCES team_schema.team_table(team_id) NOT NULL
);

CREATE TABLE team_schema.team_key_table (
  team_key_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  team_key_api_key VARCHAR(4000) NOT NULL,
  team_key_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  team_key_label VARCHAR(4000) NOT NULL,
  team_key_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,

  team_key_team_id UUID REFERENCES team_schema.team_table(team_id) NOT NULL
);

CREATE TABLE team_schema.team_key_record_table (
  team_key_record_key_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  team_key_record_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  team_key_record_access_api VARCHAR(5000) NOT NULL,

  team_key_record_team_key_id UUID REFERENCES team_schema.team_key_table(team_key_id) NOT NULL
);

CREATE TABLE team_schema.team_membership_request_table (
  team_membership_request_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  team_membership_request_to_team_id UUID REFERENCES team_schema.team_table(team_id) NOT NULL,
  team_membership_request_from_user_id UUID REFERENCES user_schema.user_table(user_id) NOT NULL
);

CREATE TABLE user_schema.user_valid_id_table (
  user_valid_id_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  user_valid_id_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  user_valid_id_date_updated TIMESTAMPTZ,
  user_valid_id_number VARCHAR(4000) UNIQUE NOT NULL,
  user_valid_id_type VARCHAR(4000) NOT NULL,
  user_valid_id_first_name VARCHAR(4000) NOT NULL,
  user_valid_id_middle_name VARCHAR(4000) NOT NULL,
  user_valid_id_last_name VARCHAR(4000) NOT NULL,
  user_valid_id_gender VARCHAR(4000) NOT NULL,
  user_valid_id_nationality VARCHAR(4000) NOT NULL,
  user_valid_id_front_image_url VARCHAR(4000) NOT NULL,
  user_valid_id_back_image_url VARCHAR(4000),
  user_valid_id_status VARCHAR(4000) NOT NULL,

  user_valid_id_approver_user_id UUID REFERENCES user_schema.user_table(user_id),
  user_valid_id_user_id UUID REFERENCES user_schema.user_table(user_id) NOT NULL,
  user_valid_id_address_id UUID REFERENCES address_table(address_id) NOT NULL
);

CREATE TABLE user_schema.user_sss_table (
  user_sss_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  user_sss_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  user_sss_number VARCHAR(4000) UNIQUE NOT NULL,
  user_sss_front_image_url VARCHAR(4000) NOT NULL,
  user_sss_back_image_url VARCHAR(4000) NOT NULL,

  user_sss_user_id UUID REFERENCES user_schema.user_table(user_id) NOT NULL
);

CREATE TABLE user_schema.user_employee_number_table (
  user_employee_number_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  user_employee_number_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  user_employee_number_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
  user_employee_number VARCHAR(4000) NOT NULL,

  user_employee_number_user_id UUID REFERENCES user_schema.user_table(user_id)
);

CREATE TABLE user_schema.invitation_table (
  invitation_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  invitation_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  invitation_to_email VARCHAR(4000) NOT NULL,
  invitation_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
  invitation_status VARCHAR(4000) DEFAULT 'PENDING' NOT NULL,

  invitation_from_team_member_id UUID REFERENCES team_schema.team_member_table(team_member_id) NOT NULL
);

CREATE TABLE notification_table (
  notification_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  notification_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  notification_content VARCHAR(4000) NOT NULL,
  notification_is_read  BOOLEAN DEFAULT FALSE NOT NULL,
  notification_redirect_url VARCHAR(4000),
  notification_type VARCHAR(4000) NOT NULL,
  notification_app VARCHAR(4000) NOT NULL,

  notification_team_id UUID REFERENCES team_schema.team_table(team_id),
  notification_user_id UUID REFERENCES user_schema.user_table(user_id) NOT NULL
);

CREATE TABLE form_schema.form_table (
  form_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  form_name VARCHAR(4000) NOT NULL,
  form_description VARCHAR(4000) NOT NULL,
  form_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  form_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
  form_is_hidden BOOLEAN DEFAULT FALSE NOT NULL,
  form_is_signature_required BOOLEAN DEFAULT FALSE NOT NULL,
  form_is_formsly_form BOOLEAN DEFAULT FALSE NOT NULL,
  form_app VARCHAR(4000) NOT NULL,
  form_is_for_every_member BOOLEAN DEFAULT TRUE NOT NULL,
  form_type VARCHAR(4000),
  form_sub_type VARCHAR(4000),
  form_is_public_form BOOLEAN DEFAULT FALSE NOT NULL,

  form_team_member_id UUID REFERENCES team_schema.team_member_table(team_member_id) NOT NULL
);

CREATE TABLE form_schema.signer_table (
  signer_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  signer_is_primary_signer BOOLEAN DEFAULT FALSE NOT NULL,
  signer_action VARCHAR(4000) NOT NULL,
  signer_order INT NOT NULL,
  signer_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
  signer_is_requester_signer BOOLEAN DEFAULT FALSE NOT NULL,

  signer_form_id UUID REFERENCES form_schema.form_table(form_id) NOT NULL,
  signer_team_member_id UUID REFERENCES team_schema.team_member_table(team_member_id) NOT NULL,
  signer_team_project_id UUID REFERENCES team_schema.team_project_table(team_project_id),
  signer_team_department_id UUID REFERENCES team_schema.team_department_table(team_department_id)
);

CREATE TABLE form_schema.section_table (
  section_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  section_name VARCHAR(4000) NOT NULL,
  section_order INT NOT NULL,
  section_is_duplicatable BOOLEAN DEFAULT FALSE NOT NULL,

  section_form_id UUID REFERENCES form_schema.form_table(form_id) NOT NULL
);

CREATE TABLE form_schema.special_field_template_table (
  special_field_template_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  special_field_template_name VARCHAR(4000) NOT NULL,
  special_field_template_description VARCHAR(4000),
  special_field_template_type VARCHAR(4000) NOT NULL
);

CREATE TABLE form_schema.field_table (
  field_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  field_name VARCHAR(4000) NOT NULL,
  field_is_required  BOOLEAN DEFAULT FALSE NOT NULL,
  field_type VARCHAR(4000) NOT NULL,
  field_order INT NOT NULL,
  field_is_positive_metric BOOLEAN DEFAULT TRUE NOT NULL,
  field_is_read_only BOOLEAN DEFAULT FALSE NOT NULL,

  field_section_id UUID REFERENCES form_schema.section_table(section_id) NOT NULL,
  field_special_field_template_id UUID REFERENCES form_schema.special_field_template_table(special_field_template_id)
);

CREATE TABLE form_schema.correct_response_table (
  correct_response_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  correct_response_value VARCHAR(4000) NOT NULL,

  correct_response_field_id UUID REFERENCES form_schema.field_table(field_id) NOT NULL
);

CREATE TABLE form_schema.option_table (
  option_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  option_value VARCHAR(4000) NOT NULL,
  option_order INT NOT NULL,

  option_field_id UUID REFERENCES form_schema.field_table(field_id) NOT NULL
);

CREATE TABLE form_schema.form_sla_table (
  form_sla_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  form_sla_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  form_sla_date_updated TIMESTAMPTZ,
  form_sla_hours INT NOT NULL,

  form_sla_form_id UUID REFERENCES form_schema.form_table(form_id) NOT NULL,
  form_sla_team_id UUID REFERENCES team_schema.team_table(team_id) NOT NULL
);

CREATE TABLE form_schema.form_team_group_table (
  form_team_group_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  form_id UUID REFERENCES form_schema.form_table(form_id) ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,
  team_group_id UUID REFERENCES team_schema.team_group_table(team_group_id) ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,

  UNIQUE(form_id, team_group_id)
);

CREATE TABLE form_schema.requester_primary_signer_table (
  requester_primary_signer_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  requester_team_member_id UUID REFERENCES team_schema.team_member_table(team_member_id) NOT NULL,
  requester_primary_signer_signer_id UUID REFERENCES form_schema.signer_table(signer_id) NOT NULL
);

CREATE TABLE request_schema.request_table (
  request_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  request_formsly_id_prefix VARCHAR(4000),
  request_formsly_id_serial VARCHAR(4000) DEFAULT UPPER(TO_HEX(NEXTVAL('formsly_id_seq'))),
  request_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  request_status_date_updated TIMESTAMPTZ,
  request_status VARCHAR(4000) DEFAULT 'PENDING' NOT NULL,
  request_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
  request_jira_id VARCHAR(4000),
  request_jira_link VARCHAR(4000),
  request_otp_id VARCHAR(4000),

  request_team_member_id UUID REFERENCES team_schema.team_member_table(team_member_id),
  request_form_id UUID REFERENCES form_schema.form_table(form_id) NOT NULL,
  request_project_id UUID REFERENCES team_schema.team_project_table(team_project_id)
);

CREATE TABLE request_schema.request_score_table (
  request_score_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  request_score_value INT NOT NULL,

  request_score_request_id UUID REFERENCES request_schema.request_table(request_id) NOT NULL
);

CREATE TABLE request_schema.request_response_table (
  request_response_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  request_response VARCHAR(4000) NOT NULL,
  request_response_duplicatable_section_id UUID,
  request_response_prefix VARCHAR(4000),

  request_response_request_id UUID REFERENCES request_schema.request_table(request_id) NOT NULL,
  request_response_field_id UUID REFERENCES form_schema.field_table(field_id) NOT NULL
);

CREATE TABLE request_schema.request_signer_table (
  request_signer_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  request_signer_status VARCHAR(4000) DEFAULT 'PENDING' NOT NULL,
  request_signer_status_date_updated TIMESTAMPTZ,

  request_signer_request_id UUID REFERENCES request_schema.request_table(request_id) NOT NULL,
  request_signer_signer_id UUID REFERENCES form_schema.signer_table(signer_id) NOT NULL
);

CREATE TABLE request_schema.comment_table (
  comment_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  comment_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  comment_content VARCHAR(4000),
  comment_is_edited  BOOLEAN DEFAULT FALSE,
  comment_last_updated TIMESTAMPTZ,
  comment_is_disabled  BOOLEAN DEFAULT FALSE NOT NULL,
  comment_type VARCHAR(4000) NOT NULL,

  comment_request_id UUID REFERENCES request_schema.request_table(request_id) NOT NULL,
  comment_team_member_id UUID REFERENCES team_schema.team_member_table(team_member_id) NOT NULL
);

CREATE TABLE ticket_schema.ticket_category_table (
  ticket_category_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  ticket_category VARCHAR(4000) NOT NULL,
  ticket_category_is_disabled BOOLEAN DEFAULT false NOT NULL,
  ticket_category_is_active BOOLEAN DEFAULT true NOT NULL
);

CREATE TABLE ticket_schema.ticket_section_table (
  ticket_section_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  ticket_section_name VARCHAR(4000) NOT NULL,
  ticket_section_is_duplicatable BOOLEAN DEFAULT false NOT NULL,

  ticket_section_category_id UUID REFERENCES ticket_schema.ticket_category_table(ticket_category_id) NOT NULL
);

CREATE TABLE ticket_schema.ticket_field_table (
  ticket_field_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  ticket_field_name VARCHAR(4000) NOT NULL,
  ticket_field_type VARCHAR(4000) NOT NULL,
  ticket_field_is_required BOOLEAN DEFAULT true NOT NULL,
  ticket_field_is_read_only BOOLEAN DEFAULT false NOT NULL,
  ticket_field_order INT NOT NULL,

  ticket_field_section_id UUID REFERENCES ticket_schema.ticket_section_table(ticket_section_id) NOT NULL
);

CREATE TABLE ticket_schema.ticket_option_table (
  ticket_option_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  ticket_option_value VARCHAR(4000) NOT NULL,
  ticket_option_order INT NOT NULL,

  ticket_option_field_id UUID REFERENCES ticket_schema.ticket_field_table(ticket_field_id) NOT NULL
);

CREATE TABLE ticket_schema.ticket_table (
  ticket_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  ticket_status VARCHAR(4000) DEFAULT 'PENDING' NOT NULL,
  ticket_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  ticket_status_date_updated TIMESTAMPTZ,
  ticket_is_disabled BOOLEAN DEFAULT false NOT NULL,

  ticket_category_id UUID REFERENCES ticket_schema.ticket_category_table(ticket_category_id) NOT NULL,
  ticket_requester_team_member_id UUID REFERENCES team_schema.team_member_table(team_member_id) NOT NULL,
  ticket_approver_team_member_id UUID REFERENCES team_schema.team_member_table(team_member_id)
);

CREATE TABLE ticket_schema.ticket_response_table (
  ticket_response_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  ticket_response_value VARCHAR(4000) NOT NULL,
  ticket_response_duplicatable_section_id UUID,

  ticket_response_ticket_id UUID REFERENCES ticket_schema.ticket_table(ticket_id) NOT NULL,
  ticket_response_field_id UUID REFERENCES ticket_schema.ticket_field_table(ticket_field_id) NOT NULL
);

CREATE TABLE ticket_schema.ticket_comment_table (
  ticket_comment_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  ticket_comment_content VARCHAR(4000) NOT NULL,
  ticket_comment_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
  ticket_comment_is_edited BOOLEAN DEFAULT FALSE NOT NULL,
  ticket_comment_type VARCHAR(4000) NOT NULL,
  ticket_comment_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  ticket_comment_last_updated TIMESTAMPTZ,

  ticket_comment_ticket_id UUID REFERENCES ticket_schema.ticket_table(ticket_id) NOT NULL,
  ticket_comment_team_member_id UUID REFERENCES team_schema.team_member_table(team_member_id) NOT NULL
);

CREATE TABLE memo_schema.memo_table (
  memo_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  memo_subject VARCHAR(4000) NOT NULL,
  memo_date_created TIMESTAMPTZ(0) DEFAULT NOW() NOT NULL,
  memo_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
  memo_author_user_id UUID REFERENCES user_schema.user_table(user_id) NOT NULL,
  memo_team_id UUID REFERENCES team_schema.team_table(team_id) NOT NULL,
  memo_version VARCHAR(4000) NOT NULL,
  memo_reference_number UUID DEFAULT uuid_generate_v4() NOT NULL
);

CREATE TABLE memo_schema.memo_signer_table (
  memo_signer_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  memo_signer_status VARCHAR(4000) DEFAULT 'PENDING' NOT NULL,
  memo_signer_is_primary BOOLEAN DEFAULT FALSE NOT NULL,
  memo_signer_order INT NOT NULL,
  memo_signer_team_member_id UUID REFERENCES team_schema.team_member_table(team_member_id) NOT NULL,
  memo_signer_memo_id UUID REFERENCES memo_schema.memo_table(memo_id) NOT NULL,
  memo_signer_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  memo_signer_date_signed TIMESTAMPTZ(0)
);

CREATE TABLE memo_schema.memo_line_item_table (
  memo_line_item_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  memo_line_item_content VARCHAR(4000) NOT NULL,
  memo_line_item_date_created TIMESTAMPTZ(0) DEFAULT NOW() NOT NULL,
  memo_line_item_date_updated TIMESTAMPTZ(0),
  memo_line_item_order INT NOT NULL,
  memo_line_item_memo_id UUID REFERENCES memo_schema.memo_table(memo_id) NOT NULL
);

CREATE TABLE memo_schema.memo_line_item_attachment_table (
  memo_line_item_attachment_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  memo_line_item_attachment_name VARCHAR(4000) NOT NULL,
  memo_line_item_attachment_caption VARCHAR(4000),
  memo_line_item_attachment_storage_bucket VARCHAR(4000) NOT NULL,
  memo_line_item_attachment_public_url VARCHAR(4000) NOT NULL,
  memo_line_item_attachment_line_item_id UUID REFERENCES memo_schema.memo_line_item_table(memo_line_item_id) ON DELETE CASCADE NOT NULL
);

CREATE TABLE memo_schema.memo_date_updated_table (
  memo_date_updated_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  memo_date_updated TIMESTAMPTZ(0) DEFAULT NOW() NOT NULL,
  memo_date_updated_memo_id UUID REFERENCES memo_schema.memo_table(memo_id) NOT NULL
);

CREATE TABLE memo_schema.memo_status_table (
  memo_status_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  memo_status VARCHAR(4000) DEFAULT 'PENDING' NOT NULL,
  memo_status_date_updated TIMESTAMPTZ(0),
  memo_status_memo_id UUID REFERENCES memo_schema.memo_table(memo_id) NOT NULL
);

CREATE TABLE memo_schema.memo_read_receipt_table (
  memo_read_receipt_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  memo_read_receipt_date_created TIMESTAMPTZ(0) DEFAULT NOW() NOT NULL,
  memo_read_receipt_by_team_member_id UUID REFERENCES team_schema.team_member_table(team_member_id) NOT NULL,
  memo_read_receipt_memo_id UUID REFERENCES memo_schema.memo_table(memo_id) NOT NULL
);

CREATE TABLE memo_schema.memo_agreement_table (
  memo_agreement_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  memo_agreement_date_created TIMESTAMPTZ(0) DEFAULT NOW() NOT NULL,
  memo_agreement_by_team_member_id UUID REFERENCES team_schema.team_member_table(team_member_id) NOT NULL,
  memo_agreement_memo_id UUID REFERENCES memo_schema.memo_table(memo_id) NOT NULL
);

CREATE TABLE memo_schema.memo_format_section_table(
  memo_format_section_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  memo_format_section_margin_top VARCHAR(20),
  memo_format_section_margin_right VARCHAR(20),
  memo_format_section_margin_bottom VARCHAR(20),
  memo_format_section_margin_left VARCHAR(20),
  memo_format_section_name VARCHAR(100)
);

CREATE TABLE memo_schema.memo_format_subsection_table(
  memo_format_subsection_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  memo_format_subsection_name VARCHAR(100),
  memo_format_subsection_text VARCHAR(4000),
  memo_format_subsection_text_font_size VARCHAR(20),
  memo_format_subsection_section_id UUID REFERENCES memo_schema.memo_format_section_table(memo_format_section_id)
);

CREATE TABLE memo_schema.memo_format_attachment_table(
  memo_format_attachment_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  memo_format_attachment_name VARCHAR(4000) NOT NULL,
  memo_format_attachment_url VARCHAR(4000) NOT NULL,
  memo_format_attachment_order VARCHAR(20) NOT NULL,
  memo_format_attachment_subsection_id UUID REFERENCES memo_schema.memo_format_subsection_table(memo_format_subsection_id)
);

CREATE TABLE history_schema.user_name_history_table(
  user_name_history_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  user_name_history_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  user_name_history_value VARCHAR(4000) NOT NULL,

  user_name_history_user_id UUID REFERENCES user_schema.user_table(user_id) NOT NULL
);

CREATE TABLE history_schema.signature_history_table(
  signature_history_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  signature_history_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  signature_history_value VARCHAR(4000) NOT NULL,

  signature_history_user_id UUID REFERENCES user_schema.user_table(user_id) NOT NULL
);

CREATE TABLE item_schema.item_category_table (
  item_category_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  item_category_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  item_category VARCHAR(4000) NOT NULL,
  item_category_is_available BOOLEAN DEFAULT TRUE NOT NULL,
  item_category_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,

  item_category_signer_id UUID REFERENCES form_schema.signer_table(signer_id) NOT NULL
);

CREATE TABLE item_schema.item_table (
  item_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  item_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  item_general_name VARCHAR(4000) NOT NULL,
  item_unit VARCHAR(4000) NOT NULL,
  item_is_available BOOLEAN DEFAULT TRUE NOT NULL,
  item_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
  item_gl_account VARCHAR(4000) NOT NULL,
  item_is_ped_item BOOLEAN DEFAULT FALSE NOT NULL,
  item_is_it_asset_item BOOLEAN DEFAULT FALSE NOT NULL,

  item_team_id UUID REFERENCES team_schema.team_table(team_id) NOT NULL,
  item_category_id UUID REFERENCES item_schema.item_category_table(item_category_id)
);

CREATE TABLE item_schema.item_division_table (
  item_division_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  item_division_value VARCHAR(4000) NOT NULL,

  item_division_item_id UUID REFERENCES item_schema.item_table(item_id) NOT NULL
);

CREATE TABLE item_schema.item_description_table (
  item_description_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  item_description_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  item_description_label VARCHAR(4000) NOT NULL,
  item_description_is_available BOOLEAN DEFAULT TRUE NOT NULL,
  item_description_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
  item_description_is_with_uom BOOLEAN DEFAULT FALSE NOT NULL,
  item_description_order INT NOT NULL,

  item_description_field_id UUID REFERENCES form_schema.field_table(field_id) ON DELETE CASCADE NOT NULL,
  item_description_item_id UUID REFERENCES item_schema.item_table(item_id) ON DELETE CASCADE NOT NULL
);

CREATE TABLE item_schema.item_description_field_table (
  item_description_field_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  item_description_field_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  item_description_field_value VARCHAR(4000) NOT NULL,
  item_description_field_is_available BOOLEAN DEFAULT TRUE NOT NULL,
  item_description_field_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,

  item_description_field_item_description_id UUID REFERENCES item_schema.item_description_table(item_description_id) ON DELETE CASCADE NOT NULL
);

CREATE TABLE item_schema.item_description_field_uom_table (
  item_description_field_uom_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  item_description_field_uom VARCHAR(4000) NOT NULL,

  item_description_field_uom_item_description_field_id UUID REFERENCES item_schema.item_description_field_table(item_description_field_id) ON DELETE CASCADE NOT NULL
);

CREATE TABLE item_schema.item_level_three_description_table (
  item_level_three_description_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  item_level_three_description_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  item_level_three_description VARCHAR(4000) NOT NULL,
  item_level_three_description_csi_code_section VARCHAR(4000) NOT NULL,

  item_level_three_description_item_id UUID REFERENCES item_schema.item_table(item_id)
);

CREATE TABLE jira_schema.jira_project_table (
  jira_project_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  jira_project_jira_id VARCHAR(4000) NOT NULL,
  jira_project_jira_label VARCHAR(4000) NOT NULL
);

CREATE TABLE jira_schema.jira_formsly_project_table (
  jira_formsly_project_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  jira_project_id UUID REFERENCES jira_schema.jira_project_table(jira_project_id) NOT NULL,
  formsly_project_id UUID REFERENCES team_schema.team_project_table(team_project_id) UNIQUE NOT NULL
);

CREATE TABLE jira_schema.jira_user_role_table (
  jira_user_role_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  jira_user_role_label VARCHAR(4000) NOT NULL,
  jira_user_role_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  jira_user_role_date_updated TIMESTAMPTZ
);

CREATE TABLE jira_schema.jira_user_account_table (
  jira_user_account_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  jira_user_account_jira_id VARCHAR(4000) NOT NULL,
  jira_user_account_email_address VARCHAR(4000) NOT NULL,
  jira_user_account_display_name VARCHAR(4000) NOT NULL,
  jira_user_account_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  jira_user_account_date_updated TIMESTAMPTZ
);

CREATE TABLE jira_schema.jira_project_user_table (
  jira_project_user_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  jira_project_user_account_id UUID REFERENCES jira_schema.jira_user_account_table(jira_user_account_id) NOT NULL,
  jira_project_user_team_project_id UUID REFERENCES team_schema.team_project_table(team_project_id) NOT NULL,
  jira_project_user_role_id UUID REFERENCES jira_schema.jira_user_role_table(jira_user_role_id) NOT NULL
);

CREATE TABLE jira_schema.jira_item_category_table (
  jira_item_category_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  jira_item_category_jira_id VARCHAR(4000) NOT NULL,
  jira_item_category_jira_label VARCHAR(4000) NOT NULL,
  jira_item_category_formsly_label VARCHAR(4000) NOT NULL
);

CREATE TABLE jira_schema.jira_item_user_table (
  jira_item_user_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  jira_item_user_account_id UUID REFERENCES jira_schema.jira_user_account_table(jira_user_account_id) NOT NULL,
  jira_item_user_item_category_id UUID REFERENCES jira_schema.jira_item_category_table(jira_item_category_id) NOT NULL,
  jira_item_user_role_id UUID REFERENCES jira_schema.jira_user_role_table(jira_user_role_id) NOT NULL
);

CREATE TABLE jira_schema.jira_organization_table (
  jira_organization_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  jira_organization_jira_id VARCHAR(4000) NOT NULL,
  jira_organization_jira_label VARCHAR(4000) NOT NULL
);

CREATE TABLE jira_schema.jira_organization_team_project_table (
  jira_organization_team_project_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  jira_organization_team_project_project_id UUID REFERENCES team_schema.team_project_table(team_project_id) NOT NULL,
  jira_organization_team_project_organization_id UUID REFERENCES jira_schema.jira_organization_table(jira_organization_id) NOT NULL
);

CREATE TABLE lookup_schema.currency_table (
  currency_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  currency_entity VARCHAR(4000) NOT NULL,
  currency_label VARCHAR(4000) NOT NULL,
  currency_alphabetic_code VARCHAR(10) NOT NULL,
  currency_numeric_code VARCHAR(10) NOT NULL
);

CREATE TABLE lookup_schema.query_table (
  query_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  query_name VARCHAR(4000) UNIQUE NOT NULL,
  query_sql VARCHAR(4000) NOT NULL
);

CREATE TABLE lookup_schema.employee_job_title_table (
  employee_job_title_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  employee_job_title_label VARCHAR(4000) NOT NULL,
  employee_job_title_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  employee_job_title_is_disabled BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE lookup_schema.scic_employee_table (
  scic_employee_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  scic_employee_hris_id_number VARCHAR(4000) NOT NULL,
  scic_employee_first_name VARCHAR(4000) NOT NULL,
  scic_employee_middle_name VARCHAR(4000),
  scic_employee_last_name VARCHAR(4000) NOT NULL,
  scic_employee_suffix VARCHAR(10),
  scic_employee_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE lookup_schema.csi_code_table (
  csi_code_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  csi_code_section VARCHAR(4000) NOT NULL,
  csi_code_division_id VARCHAR(4000) NOT NULL,
  csi_code_division_description VARCHAR(4000) NOT NULL,
  csi_code_level_two_major_group_id VARCHAR(4000) NOT NULL,
  csi_code_level_two_major_group_description VARCHAR(4000) NOT NULL,
  csi_code_level_two_minor_group_id VARCHAR(4000) NOT NULL,
  csi_code_level_two_minor_group_description VARCHAR(4000) NOT NULL,
  csi_code_level_three_id VARCHAR(4000) NOT NULL,
  csi_code_level_three_description VARCHAR(4000) NOT NULL
);

CREATE TABLE lookup_schema.formsly_price_table (
  formsly_price_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  formsly_price_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  formsly_price INT NOT NULL
);

CREATE TABLE equipment_schema.equipment_category_table (
  equipment_category_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  equipment_category_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  equipment_category VARCHAR(4000) NOT NULL,
  equipment_category_is_disabled BOOLEAN DEFAULT false NOT NULL,
  equipment_category_is_available BOOLEAN DEFAULT true NOT NULL,

  equipment_category_team_id UUID REFERENCES team_schema.team_table(team_id) NOT NULL
);

CREATE TABLE equipment_schema.equipment_brand_table (
  equipment_brand_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  equipment_brand_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  equipment_brand VARCHAR(4000) NOT NULL,
  equipment_brand_is_disabled BOOLEAN DEFAULT false NOT NULL,
  equipment_brand_is_available BOOLEAN DEFAULT true NOT NULL,

  equipment_brand_team_id UUID REFERENCES team_schema.team_table(team_id) NOT NULL
);

CREATE TABLE equipment_schema.equipment_model_table (
  equipment_model_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  equipment_model_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  equipment_model VARCHAR(4000) NOT NULL,
  equipment_model_is_disabled BOOLEAN DEFAULT false NOT NULL,
  equipment_model_is_available BOOLEAN DEFAULT true NOT NULL,

  equipment_model_team_id UUID REFERENCES team_schema.team_table(team_id) NOT NULL
);

CREATE TABLE equipment_schema.equipment_component_category_table (
  equipment_component_category_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  equipment_component_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  equipment_component_category VARCHAR(4000) NOT NULL,
  equipment_component_category_is_disabled BOOLEAN DEFAULT false NOT NULL,
  equipment_component_category_is_available BOOLEAN DEFAULT true NOT NULL,

  equipment_component_category_team_id UUID REFERENCES team_schema.team_table(team_id) NOT NULL
);

CREATE TABLE equipment_schema.equipment_table (
  equipment_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  equipment_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  equipment_name VARCHAR(4000) NOT NULL,
  equipment_name_shorthand VARCHAR(4000) NOT NULL,
  equipment_is_disabled BOOLEAN DEFAULT false NOT NULL,
  equipment_is_available BOOLEAN DEFAULT true NOT NULL,

  equipment_equipment_category_id UUID REFERENCES equipment_schema.equipment_category_table(equipment_category_id) ON DELETE CASCADE NOT NULL,
  equipment_team_id UUID REFERENCES team_schema.team_table(team_id) NOT NULL
);

CREATE TABLE equipment_schema.equipment_description_table (
  equipment_description_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  equipment_description_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  equipment_description_property_number VARCHAR(4000) NOT NULL,
  equipment_description_serial_number VARCHAR(4000) NOT NULL,
  equipment_description_is_disabled BOOLEAN DEFAULT false NOT NULL,
  equipment_description_is_available BOOLEAN DEFAULT true NOT NULL,
  equipment_description_acquisition_date INT,
  equipment_description_is_rental BOOLEAN DEFAULT false NOT NULL,

  equipment_description_brand_id UUID REFERENCES equipment_schema.equipment_brand_table(equipment_brand_id) ON DELETE CASCADE NOT NULL,
  equipment_description_model_id UUID REFERENCES equipment_schema.equipment_model_table(equipment_model_id) ON DELETE CASCADE NOT NULL,
  equipment_description_equipment_id UUID REFERENCES equipment_schema.equipment_table(equipment_id) ON DELETE CASCADE NOT NULL
);

CREATE TABLE equipment_schema.equipment_general_name_table (
  equipment_general_name_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  equipment_general_name_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  equipment_general_name VARCHAR(4000) NOT NULL,
  equipment_general_name_is_available BOOLEAN DEFAULT TRUE NOT NULL,
  equipment_general_name_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,

  equipment_general_name_team_id UUID REFERENCES team_schema.team_table(team_id) NOT NULL
);

CREATE TABLE unit_of_measurement_schema.equipment_unit_of_measurement_table (
  equipment_unit_of_measurement_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  equipment_unit_of_measurement_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  equipment_unit_of_measurement VARCHAR(4000) NOT NULL,
  equipment_unit_of_measurement_is_disabled BOOLEAN DEFAULT false NOT NULL,
  equipment_unit_of_measurement_is_available BOOLEAN DEFAULT true NOT NULL,

  equipment_unit_of_measurement_team_id UUID REFERENCES team_schema.team_table(team_id) NOT NULL
);

CREATE TABLE equipment_schema.equipment_part_table (
  equipment_part_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  equipment_part_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  equipment_part_number VARCHAR(4000) NOT NULL,
  equipment_part_is_available BOOLEAN DEFAULT TRUE NOT NULL,
  equipment_part_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,

  equipment_part_general_name_id UUID REFERENCES equipment_schema.equipment_general_name_table(equipment_general_name_id) ON DELETE CASCADE NOT NULL,
  equipment_part_brand_id UUID REFERENCES equipment_schema.equipment_brand_table(equipment_brand_id) ON DELETE CASCADE NOT NULL,
  equipment_part_model_id UUID REFERENCES equipment_schema.equipment_model_table(equipment_model_id) ON DELETE CASCADE NOT NULL,
  equipment_part_unit_of_measurement_id UUID REFERENCES unit_of_measurement_schema.equipment_unit_of_measurement_table(equipment_unit_of_measurement_id) ON DELETE CASCADE NOT NULL,
  equipment_part_component_category_id UUID REFERENCES equipment_schema.equipment_component_category_table(equipment_component_category_id) ON DELETE CASCADE NOT NULL,
  equipment_part_equipment_id UUID REFERENCES equipment_schema.equipment_table(equipment_id) ON DELETE CASCADE NOT NULL
);

CREATE TABLE service_schema.service_table (
  service_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  service_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  service_is_available BOOLEAN DEFAULT TRUE NOT NULL,
  service_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
  service_name VARCHAR(4000) NOT NULL,

  service_team_id UUID REFERENCES team_schema.team_table(team_id) ON DELETE CASCADE NOT NULL
);

CREATE TABLE service_schema.service_scope_table (
  service_scope_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  service_scope_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  service_scope_is_available BOOLEAN DEFAULT TRUE NOT NULL,
  service_scope_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
  service_scope_name VARCHAR(4000) NOT NULL,
  service_scope_type VARCHAR(4000) NOT NULL,
  service_scope_is_with_other BOOLEAN NOT NULL,

  service_scope_field_id UUID REFERENCES form_schema.field_table(field_id) ON DELETE CASCADE NOT NULL,
  service_scope_service_id UUID REFERENCES service_schema.service_table(service_id) ON DELETE CASCADE NOT NULL
);

CREATE TABLE service_schema.service_scope_choice_table (
  service_scope_choice_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  service_scope_choice_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  service_scope_choice_is_available BOOLEAN DEFAULT TRUE NOT NULL,
  service_scope_choice_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
  service_scope_choice_name VARCHAR(4000) NOT NULL,

  service_scope_choice_service_scope_id UUID REFERENCES service_schema.service_scope_table(service_scope_id) ON DELETE CASCADE NOT NULL
);

CREATE TABLE service_schema.service_category_table (
  service_category_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  service_category_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  service_category VARCHAR(4000) NOT NULL,
  service_category_is_disabled BOOLEAN DEFAULT false NOT NULL,
  service_category_is_available BOOLEAN DEFAULT true NOT NULL,

  service_category_team_id UUID REFERENCES team_schema.team_table(team_id) NOT NULL
);

CREATE TABLE other_expenses_schema.other_expenses_category_table(
  other_expenses_category_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  other_expenses_category_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  other_expenses_category VARCHAR(4000) NOT NULL,
  other_expenses_category_is_disabled BOOLEAN DEFAULT false NOT NULL,
  other_expenses_category_is_available BOOLEAN DEFAULT true NOT NULL,

  other_expenses_category_team_id UUID REFERENCES team_schema.team_table(team_id) NOT NULL
);

CREATE TABLE other_expenses_schema.other_expenses_type_table(
  other_expenses_type_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  other_expenses_type_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  other_expenses_type VARCHAR(4000) NOT NULL,
  other_expenses_type_is_disabled BOOLEAN DEFAULT false NOT NULL,
  other_expenses_type_is_available BOOLEAN DEFAULT true NOT NULL,

  other_expenses_type_category_id UUID REFERENCES other_expenses_schema.other_expenses_category_table(other_expenses_category_id)
);

CREATE TABLE unit_of_measurement_schema.capacity_unit_of_measurement_table(
  capacity_unit_of_measurement_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  capacity_unit_of_measurement_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  capacity_unit_of_measurement VARCHAR(4000) NOT NULL,
  capacity_unit_of_measurement_is_disabled BOOLEAN DEFAULT false NOT NULL,
  capacity_unit_of_measurement_is_available BOOLEAN DEFAULT true NOT NULL,

  capacity_unit_of_measurement_team_id UUID REFERENCES team_schema.team_table(team_id) NOT NULL
);

CREATE TABLE unit_of_measurement_schema.general_unit_of_measurement_table (
  general_unit_of_measurement_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  general_unit_of_measurement_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  general_unit_of_measurement VARCHAR(4000) NOT NULL,
  general_unit_of_measurement_is_disabled BOOLEAN DEFAULT false NOT NULL,
  general_unit_of_measurement_is_available BOOLEAN DEFAULT true NOT NULL,

  general_unit_of_measurement_team_id UUID REFERENCES team_schema.team_table(team_id) NOT NULL
);

CREATE TABLE unit_of_measurement_schema.item_unit_of_measurement_table (
  item_unit_of_measurement_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  item_unit_of_measurement_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  item_unit_of_measurement VARCHAR(4000) NOT NULL,
  item_unit_of_measurement_is_disabled BOOLEAN DEFAULT false NOT NULL,
  item_unit_of_measurement_is_available BOOLEAN DEFAULT true NOT NULL,

  item_unit_of_measurement_team_id UUID REFERENCES team_schema.team_table(team_id) NOT NULL
);

CREATE TABLE lookup_schema.bank_list_table (
  bank_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  bank_label VARCHAR(4000) NOT NULL
);

CREATE TABLE lookup_schema.ad_owner_table (
  ad_owner_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  ad_owner_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  ad_owner_name TEXT NOT NULL,
  ad_owner_is_disabled BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE lookup_schema.ad_owner_request_table (
  ad_owner_request_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  ad_owner_request_owner_id UUID REFERENCES lookup_schema.ad_owner_table(ad_owner_id) NOT NULL,
  ad_owner_request_request_id UUID REFERENCES request_schema.request_table(request_id) NOT NULL
);

CREATE TABLE hr_schema.hr_phone_interview_table (
  hr_phone_interview_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  hr_phone_interview_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  hr_phone_interview_status VARCHAR(4000) DEFAULT 'WAITING FOR SCHEDULE' NOT NULL,
  hr_phone_interview_status_date_updated TIMESTAMPTZ,
  hr_phone_interview_schedule TIMESTAMPTZ,

  hr_phone_interview_request_id UUID REFERENCES request_schema.request_table(request_id) NOT NULL,
  hr_phone_interview_team_member_id UUID REFERENCES team_schema.team_member_table(team_member_id)
);

CREATE TABLE hr_schema.technical_interview_table (
  technical_interview_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  technical_interview_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  technical_interview_status VARCHAR(4000) DEFAULT 'WAITING FOR SCHEDULE' NOT NULL,
  technical_interview_status_date_updated TIMESTAMPTZ,
  technical_interview_schedule TIMESTAMPTZ,
  technical_interview_number INT DEFAULT 1 NOT NULL,
  technical_interview_evaluation_link VARCHAR(4000),

  technical_interview_request_id UUID REFERENCES request_schema.request_table(request_id) NOT NULL,
  technical_interview_team_member_id UUID REFERENCES team_schema.team_member_table(team_member_id),
  technical_interview_evaluator_team_member_id UUID REFERENCES team_schema.team_member_table(team_member_id),
  technical_interview_evaluation_request_id UUID REFERENCES request_schema.request_table(request_id)
);

CREATE TABLE hr_schema.trade_test_table (
  trade_test_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  trade_test_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  trade_test_status VARCHAR(4000) DEFAULT 'WAITING FOR SCHEDULE' NOT NULL,
  trade_test_status_date_updated TIMESTAMPTZ,
  trade_test_schedule TIMESTAMPTZ,
  trade_test_evaluation_link VARCHAR(4000),

  trade_test_address_id UUID REFERENCES address_table(address_id),
  trade_test_request_id UUID REFERENCES request_schema.request_table(request_id) NOT NULL,
  trade_test_team_member_id UUID REFERENCES team_schema.team_member_table(team_member_id),
  trade_test_evaluator_team_member_id UUID REFERENCES team_schema.team_member_table(team_member_id),
  trade_test_evaluation_request_id UUID REFERENCES request_schema.request_table(request_id)
);

CREATE TABLE hr_schema.background_check_table (
  background_check_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  background_check_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  background_check_status VARCHAR(4000) DEFAULT 'PENDING' NOT NULL,
  background_check_status_date_updated TIMESTAMPTZ,

  background_check_request_id UUID REFERENCES request_schema.request_table(request_id) NOT NULL,
  background_check_team_member_id UUID REFERENCES team_schema.team_member_table(team_member_id),
  background_check_evaluation_request_id UUID REFERENCES request_schema.request_table(request_id)
);

CREATE TABLE hr_schema.job_offer_table (
  job_offer_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  job_offer_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  job_offer_status VARCHAR(4000) DEFAULT 'WAITING FOR OFFER' NOT NULL,

  job_offer_title VARCHAR(4000),
  job_offer_project_assignment VARCHAR(4000),
  job_offer_project_assignment_address VARCHAR(4000),
  job_offer_project_latitude VARCHAR(4000),
  job_offer_project_longitude VARCHAR(4000),
  job_offer_manpower_loading_id VARCHAR(4000),
  job_offer_manpower_loading_reference_created_by VARCHAR(4000),
  job_offer_compensation VARCHAR(4000),

  job_offer_request_id UUID REFERENCES request_schema.request_table(request_id) NOT NULL,
  job_offer_attachment_id UUID REFERENCES public.attachment_table(attachment_id),
  job_offer_team_member_id UUID REFERENCES team_schema.team_member_table(team_member_id)
);

CREATE TABLE hr_schema.job_offer_reason_for_rejection_table (
  job_offer_reason_for_rejection_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  job_offer_reason_for_rejection VARCHAR(4000) NOT NULL,

  job_offer_reason_for_rejection_job_offer_id UUID REFERENCES hr_schema.job_offer_table(job_offer_id) NOT NULL
);

CREATE TABLE hr_schema.request_connection_table (
  request_connection_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,

  request_connection_application_information_request_id UUID REFERENCES request_schema.request_table(request_id) NOT NULL,
  request_connection_general_assessment_request_id UUID REFERENCES request_schema.request_table(request_id),
  request_connection_technical_assessment_request_id UUID REFERENCES request_schema.request_table(request_id)
);

CREATE TABLE hr_schema.interview_online_meeting_table (
  interview_meeting_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  interview_meeting_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  interview_meeting_provider_id TEXT,
  interview_meeting_url TEXT NOT NULL,
  interview_meeting_interview_id UUID NOT NULL,
  interview_meeting_duration INT NOT NULL,
  interview_meeting_break_duration INT NOT NULL,
  interview_meeting_schedule TIMESTAMPTZ NOT NULL,
  interview_meeting_is_disabled BOOLEAN DEFAULT false NOT NULL
);

CREATE TABLE hr_schema.recruitment_table (
  recruitment_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,

  recruitment_request_id UUID REFERENCES request_schema.request_table(request_id) NOT NULL,
  recruitment_team_member_id UUID REFERENCES team_schema.team_member_table(team_member_id) NOT NULL
);

CREATE TABLE hr_schema.hr_project_table (
  hr_project_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  hr_project_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  hr_project_name VARCHAR(4000) NOT NULL,

  hr_project_address_id UUID REFERENCES public.address_table(address_id) NOT NULL
);

CREATE TABLE hr_schema.hr_preferred_position_table (
  hr_preferred_position_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  hr_preferred_position_group_member_id UUID NOT NULL REFERENCES team_schema.team_group_member_table(team_group_member_id),
  hr_preferred_position_position_id UUID NOT NULL REFERENCES lookup_schema.position_table(position_id)
);

CREATE TABLE lookup_schema.degree_table (
  degree_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  degree_type VARCHAR(4000) NOT NULL,
  degree_branch VARCHAR(4000) NOT NULL,
  degree_field_of_study VARCHAR(4000),
  degree_name VARCHAR(4000) NOT NULL
);

CREATE TABLE form_schema.questionnaire_table (
  questionnaire_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  questionnaire_name VARCHAR(5000) NOT NULL,
  questionnaire_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  questionnaire_date_updated TIMESTAMP,
  questionnaire_is_disabled BOOLEAN DEFAULT FALSE,

  questionnaire_created_by UUID REFERENCES team_schema.team_member_table(team_member_id) NOT NULL,
  questionnaire_updated_by UUID REFERENCES team_schema.team_member_table(team_member_id),
  questionnaire_team_id UUID REFERENCES team_schema.team_table(team_id) NOT NULL
);

CREATE TABLE form_schema.questionnaire_question_table(
  questionnaire_question_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  questionnaire_question VARCHAR(4000) NOT NULL,
  questionnaire_question_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  questionnaire_question_is_disabled BOOLEAN DEFAULT FALSE,

  questionnaire_question_field_id UUID REFERENCES form_schema.field_table(field_id) NOT NULL,
  questionnaire_question_questionnaire_id UUID REFERENCES form_schema.questionnaire_table(questionnaire_id) NOT NULL
);

CREATE TABLE form_schema.question_option_table(
  question_option_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  question_option_value VARCHAR(4000),
  question_option_order INT NOT NULL,

  question_option_questionnaire_question_id UUID REFERENCES form_schema.questionnaire_question_table(questionnaire_question_id) NOT NULL
);

CREATE TABLE error_table(
  error_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  error_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  error_message TEXT NOT NULL,
  error_url TEXT NOT NULL,
  error_function TEXT NOT NULL,

  error_user_id UUID REFERENCES user_schema.user_table(user_id),
  error_user_email VARCHAR(4000)
);

CREATE TABLE lookup_schema.position_table (
  position_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  position_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  position_is_disabled BOOLEAN DEFAULT false NOT NULL,
  position_is_available BOOLEAN DEFAULT true NOT NULL,

  position_category VARCHAR(4000) NOT NULL,
  position_classification VARCHAR(4000) NOT NULL,

  position_seniority VARCHAR(4000) NOT NULL,
  position_department_function VARCHAR(4000),
  position_department VARCHAR(4000),
  position_title_type VARCHAR(4000),
  position_title VARCHAR(4000) NOT NULL,
  position_function VARCHAR(4000),
  position_alias VARCHAR(4000) NOT NULL,

  position_is_with_certificate BOOLEAN DEFAULT false NOT NULL,
  position_certificate_label VARCHAR(4000),
  position_is_with_license BOOLEAN DEFAULT false NOT NULL,
  position_license_label VARCHAR(4000),

  position_minimum_years_of_experience INT DEFAULT 1 NOT NULL,
  position_is_ped_position BOOLEAN DEFAULT false NOT NULL,

  position_is_with_technical_interview_1 BOOLEAN DEFAULT false NOT NULL,
  position_is_with_technical_interview_2 BOOLEAN DEFAULT false NOT NULL,
  position_is_with_trade_test BOOLEAN DEFAULT false NOT NULL,
  position_is_with_background_check BOOLEAN DEFAULT false NOT NULL,

  position_team_id UUID REFERENCES team_schema.team_table(team_id) NOT NULL,
  position_questionnaire_id UUID REFERENCES form_schema.questionnaire_table(questionnaire_id)
);

CREATE TABLE user_schema.email_resend_table (
  email_resend_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  email_resend_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  email_resend_email VARCHAR(4000) NOT NULL
);

CREATE TABLE hr_schema.practical_test_table (
  practical_test_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  practical_test_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  practical_test_date_updated TIMESTAMPTZ,
  practical_test_label VARCHAR(4000) NOT NULL,
  practical_test_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
  practical_test_passing_score INT NOT NULL,

  practical_test_created_by UUID REFERENCES team_schema.team_member_table(team_member_id) NOT NULL,
  practical_test_updated_by UUID REFERENCES team_schema.team_member_table(team_member_id),
  practical_test_team_id UUID REFERENCES team_schema.team_table(team_id) NOT NULL
);

CREATE TABLE hr_schema.practical_test_question_table (
  practical_test_question_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  practical_test_question_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  practical_test_question VARCHAR(4000) NOT NULL,
  practical_test_question_weight INT NOT NULL,
  practical_test_question_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
  practical_test_question_order INT NOT NULL,

  practical_test_question_field_id UUID REFERENCES form_schema.field_table(field_id) ON DELETE CASCADE NOT NULL,
  practical_test_question_practical_test_id UUID REFERENCES hr_schema.practical_test_table(practical_test_id) ON DELETE CASCADE NOT NULL
);

CREATE TABLE hr_schema.practical_test_position_table (
  practical_test_position_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  practical_test_position_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  practical_test_position_practical_test_id UUID REFERENCES hr_schema.practical_test_table(practical_test_id) ON DELETE CASCADE NOT NULL,
  practical_test_position_position_id UUID REFERENCES lookup_schema.position_table(position_id) ON DELETE CASCADE NOT NULL
);

CREATE TABLE hr_schema.application_information_additional_details_table (
  application_information_additional_details_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  application_information_additional_details_position VARCHAR(4000) NOT NULL,
  application_information_additional_details_first_name VARCHAR(4000) NOT NULL,
  application_information_additional_details_middle_name VARCHAR(4000),
  application_information_additional_details_last_name VARCHAR(4000) NOT NULL,
  application_information_additional_details_contact_number VARCHAR(4000) NOT NULL,
  application_information_additional_details_email VARCHAR(4000) NOT NULL,

  application_information_additional_details_request_id UUID REFERENCES request_schema.request_table(request_id) NOT NULL
);

----- END: TABLES

----- START: FUNCTIONS

CREATE OR REPLACE FUNCTION get_current_date()
RETURNS TIMESTAMPTZ
SET search_path TO ''
AS $$
BEGIN
  RETURN NOW();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_ssot(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let ssot_data;
  plv8.subtransaction(function(){
    const {
      pageNumber,
      rowLimit,
      search,
      requestingProject,
      itemName
    } = input_data;

    const rowStart = (pageNumber - 1) * rowLimit;

    let requestingProjectCondition = "";
    if (requestingProject.length) {
      const projectCode = plv8.execute(
        `
          SELECT team_project_code
          FROM team_schema.team_project_table
          WHERE
            team_project_name = $1
            AND team_project_is_disabled = false
          LIMIT 1
        `,
        [requestingProject]
      );
      if(projectCode.length) {
        requestingProjectCondition = `AND request_formsly_id ILIKE '${projectCode[0].team_project_code}%'`
      }
    }
    const itemNameCondition = itemName.length ? `
      INNER JOIN (
        SELECT DISTINCT(request_response_request_id)
        FROM request_schema.request_response_table
        WHERE
          request_response = '"' || $1 || '"'
          AND request_response_field_id = 'b2c899e8-4ac7-4019-819e-d6ebcae71f41'
      ) requestResponse ON request_id = requestResponse.request_response_request_id
    ` : "";
    const searchCondition = search.length ? `
      AND (request_formsly_id ILIKE '%' || $2 || '%')
    ` : "";
    const query = `
      WITH request_data AS (
        SELECT *
        FROM public.request_view
        ${itemNameCondition}
        WHERE
          request_status = 'APPROVED'
          AND request_form_id = 'd13b3b0f-14df-4277-b6c1-7c80f7e7a829'
          ${searchCondition}
          ${requestingProjectCondition}
        ORDER BY request_status_date_updated DESC
        OFFSET $3 ROWS FETCH FIRST $4 ROWS ONLY
      )
      SELECT jsonb_build_object(
        'item_request_id', request_id,
        'item_request_formsly_id', request_formsly_id,
        'item_request_jira_id', request_jira_id,
        'item_request_otp_id', request_otp_id,
        'item_request_date_created', request_date_created,
        'item_request_response', (
          SELECT jsonb_agg(
            jsonb_build_object(
              'request_response', request_response,
              'request_response_field_name', field_name,
              'request_response_field_type', field_type,
              'request_response_duplicatable_section_id', request_response_duplicatable_section_id
            )
          )
          FROM request_schema.request_response_table
          INNER JOIN form_schema.field_table ON field_id = request_response_field_id
          WHERE
            request_response_request_id = request_id
        ),
        'item_request_owner', (
          SELECT jsonb_build_object(
            'user_first_name', user_first_name,
            'user_last_name', user_last_name
          )
          FROM team_schema.team_member_table
          INNER JOIN user_schema.user_table ON team_member_table.team_member_user_id = user_id
          WHERE
            team_member_id = request_team_member_id
        )
      )
      FROM request_data
    `;

    ssot_data = plv8.execute(query, [
      itemName || null,
      search || null,
      rowStart,
      rowLimit
    ]).map(data => data.jsonb_build_object);
  });
  return ssot_data;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION create_user_with_sss_id(
  input_data JSON
)
RETURNS VOID
SET search_path TO ''
AS $$
  plv8.subtransaction(function(){
    const {
      user_id,
      user_email,
      user_first_name,
      user_last_name,
      user_username,
      user_avatar,
      user_phone_number,
      user_active_team_id,
      user_employee_number,
      user_job_title,
      sss_number,
      sss_front_image_url,
      sss_back_image_url,
    } = input_data;

    user_data = plv8.execute(
      `
        INSERT INTO user_schema.user_table
        (
          user_id,
          user_email,
          user_first_name,
          user_last_name,
          user_username,
          user_avatar,
          user_phone_number,
          user_job_title,
          user_active_team_id
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9
        )
        RETURNING *
      `, [
        user_id,
        user_email,
        user_first_name,
        user_last_name,
        user_username,
        user_avatar,
        user_phone_number,
        user_job_title,
        user_active_team_id || null
      ]
    )[0];

    const invitation = plv8.execute(
      `
        SELECT
          invitation_table.*,
          team_name
        FROM user_schema.invitation_table
        INNER JOIN team_schema.team_member_table
          ON invitation_from_team_member_id = team_member_id
        INNER JOIN team_schema.team_table
          ON team_member_team_id = team_id
        WHERE invitation_to_email = $1
      `, [
        user_email
      ]
    )[0];

    if (invitation) {
      plv8.execute(
        `
          INSERT INTO public.notification_table
          (
            notification_app,
            notification_content,
            notification_redirect_url,
            notification_type,
            notification_user_id
          )
          VALUES
          (
            'GENERAL', 
            'You have been invited to join ' || $1,
            '/user/invitation/' || $2,
            'INVITE', 
            $3
          )
        `, [
          invitation.team_name,
          invitation.invitation_id,
          user_id
        ]
      );
    }

    if (user_employee_number) {
      plv8.execute(
        `
          INSERT INTO user_schema.user_employee_number_table
          (
            user_employee_number,
            user_employee_number_user_id
          )
          VALUES
          (
            $1,
            $2
          )
        `, [
          user_employee_number,
          user_id
        ]
      );
    }

    plv8.execute(
      `
        INSERT INTO user_schema.user_sss_table
        (
          user_sss_number,
          user_sss_front_image_url,
          user_sss_back_image_url,
          user_sss_user_id
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4
        )
        RETURNING *
      `, [
        sss_number,
        sss_front_image_url,
        sss_back_image_url,
        user_id
      ]
    );
  });
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION create_request(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let request_data;
  plv8.subtransaction(function(){
    const {
      requestId,
      formId,
      teamMemberId,
      responseValues,
      signerValues,
      requestSignerNotificationInput,
      formName,
      isFormslyForm,
      projectId,
      teamId,
      status,
      requestScore,
      rootFormslyRequestId,
      recruiter,
      applicationInformationParams,
      interviewParams,
      backgroundCheckParams,
      tradeTestParams
    } = input_data;

    let formslyIdPrefix = '';
    let endId = '';

    if (isFormslyForm) {
      let project;
      if (projectId) {
        project = plv8.execute(
          `
            SELECT *
            FROM team_schema.team_project_table
            WHERE team_project_id = $1
          `, [
            projectId
          ]
        )[0];
      }

      if (formName ==='Services') {
        endId = `S`;
      } else if (formName ==='Other Expenses') {
        endId = `OE`;
      } else if (formName ==='PED Equipment') {
        endId = `PE`;
      } else if (formName ==='PED Part') {
        endId = `PP`;
      } else if (formName ==='PED Item') {
        endId = `PC`;
      } else if (formName === 'IT Asset') {
        endId = `ITA`;
      } else if (formName === 'Liquidation Reimbursement') {
        endId = `LR`;
      } else if (formName === 'Bill of Quantity') {
        endId = `BOQ`;
      } else if (formName === 'Personnel Transfer Requisition') {
        endId = `PTRF`;
      } else if (formName === 'Petty Cash Voucher') {
        endId = `PCV`;
      } else if (formName === 'Equipment Service Report') {
        endId = `ESR`;
      } else if (formName === 'Request For Payment Code') {
        endId = `RFPC`;
      } else if (formName.includes('Request For Payment')) {
        endId = `RFP`;
      } else if (formName.includes('Petty Cash Voucher Balance')) {
        endId = `PCVB`;
      } else if (formName === 'Application Information') {
        endId = `AI`;
      } else if (formName === 'General Assessment') {
        endId = `GA`;
      } else if (formName === 'Technical Assessment') {
        endId = `TA`;
      } else if (formName === 'Evaluation Result') {
        endId = `ER`;
      } else if (formName === 'Background Investigation') {
        endId = `BI`;
      } else if (formName === 'Practical Test') {
        endId = `PT`;
      }
      formslyIdPrefix = `${project ? `${project.team_project_code}` : ""}${endId}`;
    }

    if (!projectId && !endId) {
      request_data = plv8.execute(
        `
          INSERT INTO request_schema.request_table
          (
            request_id,
            request_form_id,
            request_team_member_id,
            request_status,
            request_status_date_updated,
            request_formsly_id_serial
          )
          VALUES
          (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6
          )
          RETURNING *
        `, [
          requestId,
          formId,
          teamMemberId || null,
          status || 'PENDING',
          status ? 'NOW()' : null,
          null
        ]
      )[0];
    } else {
      request_data = plv8.execute(
        `
          INSERT INTO request_schema.request_table
          (
            request_id,
            request_form_id,
            request_formsly_id_prefix,
            request_team_member_id,
            request_project_id,
            request_status,
            request_status_date_updated
          )
          VALUES
          (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7
          )
          RETURNING *
        `, [
          requestId,
          formId,
          formslyIdPrefix,
          teamMemberId || null,
          projectId || null,
          status || 'PENDING',
          status ? 'NOW()' : null
        ]
      )[0];
    }

    plv8.execute(
      `
        INSERT INTO request_schema.request_response_table
        (
          request_response,
          request_response_duplicatable_section_id,
          request_response_field_id,
          request_response_request_id,
          request_response_prefix
        )
        VALUES ${responseValues}
      `
    );

    if (!status) {
      if (formId === '16ae1f62-c553-4b0e-909a-003d92828036') {
        const position = applicationInformationParams.position;

        const currentDate = new Date(plv8.execute(`SELECT public.get_current_date()`)[0].get_current_date);
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();

        const getRange = (start, end) => [new Date(currentYear, currentMonth, start), new Date(currentYear, currentMonth, end)];

        const weekRanges = [
          getRange(1, 7),
          getRange(7, 14),
          getRange(14, 21),
          getRange(21, new Date(currentYear, currentMonth + 1, 0).getDate())
        ];

        let weekStart, weekEnd;
        for (let [start, end] of weekRanges) {
          if (currentDate >= start && currentDate <= end) {
            weekStart = start;
            weekEnd = end;
            break;
          }
        }

        if (!weekStart) {
          weekStart = new Date(currentYear, currentMonth, 1);
          weekEnd = weekRanges[0][1];
        }

        const teamMemberData = plv8.execute(
          `
            SELECT
            tg.team_member_id,
            pt.position_alias,
            CASE
              WHEN pt.position_alias = $1
                THEN true
              ELSE false
            END AS is_preferred
            FROM team_schema.team_group_member_table tg
            LEFT JOIN hr_schema.hr_preferred_position_table p
              ON p.hr_preferred_position_group_member_id = tg.team_group_member_id
            LEFT JOIN lookup_schema.position_table pt
              ON pt.position_id = p.hr_preferred_position_position_id
            WHERE tg.team_group_id = 'a691a6ca-8209-4b7a-8f48-8a4582bbe75a'
          `, [
            position
          ]
        );

        if (!teamMemberData.length) {
          throw new Error("No team members found.");
        }

        const teamMemberIdList = teamMemberData.map(member => member.team_member_id);
        const signerIds = plv8.execute(
          `
            SELECT
              signer_id,
              signer_team_member_id
            FROM form_schema.signer_table
            WHERE
              signer_team_member_id = ANY($1)
              AND signer_form_id = '16ae1f62-c553-4b0e-909a-003d92828036'
          `, [
            teamMemberIdList
          ]
        );

        if (!signerIds.length) {
          throw new Error("No signers found.");
        }
        const combinedSignerData = signerIds.map(signer => {
          const teamMember = teamMemberData.find(
            member => member.team_member_id === signer.signer_team_member_id
          );
          return {
            signer_id: signer.signer_id,
            is_preferred: teamMember.is_preferred
          };
        });

        const preferredSignerIds = combinedSignerData
          .filter(signer => signer.is_preferred)
          .map(signer => signer.signer_id);

        const isPreferredCondition = preferredSignerIds.length > 0
          ? `signer_id IN (${preferredSignerIds})`
          : `false`;

        const selectSignerDynamically = (signers) => {
          if (!signers || signers.length === 0) return null;

          const signerIdList = signers.map(s => s.signer_id);
          const signerLoadData = plv8.execute(
            `
              WITH preferred_signers AS (
                SELECT
                  signer_id,
                  COUNT(request_signer_id) AS total_count,
                  COUNT(
                    CASE WHEN request_date_created::Date BETWEEN $1 AND $2
                      THEN request_signer_id END
                  ) AS weekly_count,
                  CASE WHEN $3
                    THEN true ELSE false
                  END AS is_preferred
                FROM form_schema.signer_table
                  LEFT JOIN request_schema.request_signer_table
                    ON request_signer_signer_id = signer_id
                  LEFT JOIN request_schema.request_table
                    ON request_id = request_signer_request_id
                WHERE
                  signer_id = ANY($4)
                GROUP BY signer_id
              ),
              preferred_balance AS (
                SELECT
                  MIN(weekly_count) AS min_weekly_count,
                  MAX(weekly_count) AS max_weekly_count
                FROM preferred_signers
              ),
              priority_signers AS (
                SELECT *,
                  CASE WHEN min_weekly_count = max_weekly_count
                    THEN weekly_count
                  ELSE is_preferred::INT * 1000 + weekly_count
                  END AS sorting_priority
                FROM preferred_signers
                CROSS JOIN preferred_balance
              )
              SELECT
                signer_id,
                weekly_count,
                total_count,
                is_preferred
              FROM priority_signers
              ORDER BY
                weekly_count ASC,
                is_preferred DESC,
                total_count ASC
                LIMIT 1
            `, [
              weekStart.toISOString(),
              weekEnd.toISOString(),
              isPreferredCondition,
              signerIdList
            ]
          );
          return signerLoadData.length > 0 ? signerLoadData[0].signer_id : null;
        };
        const selectedSigner = selectSignerDynamically(combinedSignerData);

        if (!selectedSigner) {
          throw new Error("No available signers found.");
        }

        plv8.execute(
          `
            INSERT INTO request_schema.request_signer_table
            (
              request_signer_signer_id,
              request_signer_request_id
            )
            VALUES
            (
              $1,
              $2
            )
          `, [
            selectedSigner,
            requestId
          ]
        );

        if (recruiter) {
          plv8.execute(
            `
              INSERT INTO hr_schema.recruitment_table
              (
                recruitment_request_id,
                recruitment_team_member_id
              )
              VALUES
              (
                $1,
                $2
              )
            `, [
              requestId,
              recruiter
            ]
          );
        }
      } else {
        plv8.execute(
          `
            INSERT INTO request_schema.request_signer_table
            (
              request_signer_signer_id,
              request_signer_request_id
            )
            VALUES ${signerValues}
          `
        );
      }
    } else {
      if (status === 'APPROVED' && formId === 'cc410201-f5a6-49ce-a06c-c2ce2c169436') {
        const requestUUID = plv8.execute(
          `
            SELECT request_id
            FROM public.request_view
            WHERE request_formsly_id = $1
          `, [
            rootFormslyRequestId
          ]
        )[0].request_id;
        plv8.execute(
          `
            INSERT INTO hr_schema.hr_phone_interview_table
            (
              hr_phone_interview_request_id
            )
            VALUES
            (
              $1
            )
          `, [
            requestUUID
          ]
        );
      }
    }

    if (requestScore !== undefined) {
      plv8.execute(
        `
          INSERT INTO request_schema.request_score_table
          (
            request_score_value,
            request_score_request_id
          )
          VALUES
          (
            $1,
            $2
          )
        `, [
          requestScore,
          requestId
        ]
      );
    }

    const activeTeamResult = plv8.execute(
      `
        SELECT *
        FROM team_schema.team_table
        WHERE team_id = $1
      `, [
        teamId
      ]
    );
    const activeTeam = activeTeamResult.length > 0 ? activeTeamResult[0] : null;

    if (activeTeam && requestSignerNotificationInput.length) {
      const teamNameUrlKeyResult = plv8.execute(
        `
          SELECT public.format_team_name_to_url_key($1) AS url_key
        `, [
          activeTeam.team_name
        ]
      );
      const teamNameUrlKey = teamNameUrlKeyResult.length > 0 ? teamNameUrlKeyResult[0].url_key : null;

      if (teamNameUrlKey) {
        const notificationValues = requestSignerNotificationInput
        .map(
          (notification) =>
            `('${notification.notification_app}','${notification.notification_content}','/${teamNameUrlKey}/requests/${isFormslyForm ? `${request_data.request_formsly_id_prefix}-${request_data.request_formsly_id_serial}` : requestId}','${notification.notification_team_id}','${notification.notification_type}','${notification.notification_user_id}')`
        )
        .join(",");

        plv8.execute(
          `
            INSERT INTO public.notification_table
            (
              notification_app,
              notification_content,
              notification_redirect_url,
              notification_team_id,
              notification_type,
              notification_user_id
            )
            VALUES ${notificationValues}
          `
        );
      }
    }

    if (formId === '16ae1f62-c553-4b0e-909a-003d92828036') {
      plv8.execute(
        `
          INSERT INTO hr_schema.request_connection_table
          (request_connection_application_information_request_id)
          VALUES
          ($1)
        `, [
          requestId
        ]
      );
    } else if (formId === '2f9100a9-f322-405f-acda-68bbf94236b0') {
      const requestUUID = plv8.execute(
        `
          SELECT request_id
          FROM public.request_view
          WHERE request_formsly_id = $1
        `, [
          rootFormslyRequestId
        ]
      )[0].request_id
      plv8.execute(
        `
          UPDATE hr_schema.request_connection_table
          SET
            request_connection_general_assessment_request_id = $1
          WHERE
            request_connection_application_information_request_id = $2
        `, [
          requestId,
          requestUUID
        ]
      );
    } else if (formId === 'cc410201-f5a6-49ce-a06c-c2ce2c169436') {
      const requestUUID = plv8.execute(
        `
          SELECT request_id
          FROM public.request_view
          WHERE
            request_formsly_id = $1
        `, [
          rootFormslyRequestId
        ]
      )[0].request_id
      plv8.execute(
        `
          UPDATE hr_schema.request_connection_table
          SET
            request_connection_technical_assessment_request_id = $1
          WHERE
            request_connection_application_information_request_id = $2
        `, [
          requestId,
          requestUUID
        ]
      );
    }

    if (interviewParams) {
      plv8.execute(
        `
          UPDATE hr_schema.technical_interview_table
          SET
            technical_interview_evaluation_request_id = $1
          WHERE
            technical_interview_id = $2
        `, [
          requestId,
          interviewParams.technicalInterviewId
        ]
      );
      plv8.execute(
        `
          SELECT public.update_technical_interview_status($1::json)
        `, [
          interviewParams
        ]
      );
    } else if (backgroundCheckParams) {
      plv8.execute(
        `
          UPDATE hr_schema.background_check_table
          SET
            background_check_evaluation_request_id = $1
          WHERE
            background_check_id = $2
        `, [
          requestId,
          backgroundCheckParams.backgroundCheckId
        ]
      );
      plv8.execute(
        `
          SELECT public.update_background_check_status($1::json)
        `, [
          backgroundCheckParams
        ]
      );
    } else if (tradeTestParams) {
      plv8.execute(
        `
          UPDATE hr_schema.trade_test_table
          SET
            trade_test_evaluation_request_id = $1
          WHERE
            trade_test_id = $2
        `, [
          requestId,
          tradeTestParams.tradeTestId
        ]
      );
      plv8.execute(
        `
          SELECT public.update_trade_test_status($1::json)
        `, [
          tradeTestParams
        ]
      );
    } else if (applicationInformationParams) {
      plv8.execute(
        `
          INSERT INTO hr_schema.application_information_additional_details_table
          (
            application_information_additional_details_position,
            application_information_additional_details_first_name,
            application_information_additional_details_middle_name,
            application_information_additional_details_last_name,
            application_information_additional_details_contact_number,
            application_information_additional_details_email,
            application_information_additional_details_request_id
          )
          VALUES
          (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7
          )
        `, [
          applicationInformationParams.position,
          applicationInformationParams.firstName,
          applicationInformationParams.middleName || null,
          applicationInformationParams.lastName,
          applicationInformationParams.contactNumber,
          applicationInformationParams.email,
          requestId
        ]
      );
    }
  });
  return request_data;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION edit_request(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let request_data;
  plv8.subtransaction(function(){
    const {
      requestId,
      responseValues,
      signerValues,
      notificationValues
    } = input_data;

    request_data = plv8.execute(
      `
        SELECT *
        FROM public.request_view
        WHERE request_id = $1
      `, [
        requestId
      ]
    )[0];

    plv8.execute(
      `
        DELETE
        FROM request_schema.request_response_table
        WHERE request_response_request_id = $1
      `, [
        requestId
      ]
    );

    plv8.execute(
      `
        DELETE
        FROM request_schema.request_signer_table
        WHERE request_signer_request_id = $1
      `, [
        requestId
      ]
    );

    plv8.execute(
      `
        INSERT INTO request_schema.request_response_table
        (
          request_response,
          request_response_duplicatable_section_id,
          request_response_field_id,request_response_request_id,
          request_response_prefix
        )
        VALUES ${responseValues}
      `
    );

    plv8.execute(
      `
        INSERT INTO request_schema.request_signer_table
        (
          request_signer_signer_id,
          request_signer_request_id
        )
        VALUES ${signerValues}
      `
    );

    const team_member_data = plv8.execute(
      `
        SELECT *
        FROM team_schema.team_member_table
        WHERE team_member_id = $1
      `, [
        request_data.request_team_member_id
      ]
    )[0];
    const activeTeamResult = plv8.execute(
      `
        SELECT * FROM team_schema.team_table
        WHERE team_id = $1
      `, [
        team_member_data.team_member_team_id
      ]
    );
    const activeTeam = activeTeamResult.length ? activeTeamResult[0] : null;

    if (activeTeam) {
      const teamNameUrlKeyResult = plv8.execute(
        `
          SELECT public.format_team_name_to_url_key($1) AS url_key
        `, [
          activeTeam.team_name
        ]
      );
      const teamNameUrlKey = teamNameUrlKeyResult.length > 0 ? teamNameUrlKeyResult[0].url_key : null;

      if (teamNameUrlKey) {
        plv8.execute(
          `
            INSERT INTO public.notification_table
            (
              notification_app,
              notification_content,
              notification_redirect_url,
              notification_team_id,
              notification_type,
              notification_user_id
            ) VALUES ${notificationValues}
          `
        );
      }
    }
  });
  return request_data;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION approve_or_reject_request(
  input_data JSON
)
RETURNS TEXT
SET search_path TO ''
AS $$
  let request_status;
  plv8.subtransaction(function(){
    const {
      requestId,
      isPrimarySigner,
      requestSignerId,
      requestOwnerId,
      signerFullName,
      formName,
      requestAction,
      memberId,
      teamId,
      jiraId,
      jiraLink,
      requestFormslyId,
      userId
    } = input_data;

    request_status = "PENDING";
    const present = { APPROVED: "APPROVE", REJECTED: "REJECT" };

    plv8.execute(
      `
        UPDATE request_schema.request_signer_table
        SET
          request_signer_status = $1,
          request_signer_status_date_updated = NOW()
        WHERE
          request_signer_id = $2
      `, [
        requestAction,
        requestSignerId
      ]
    );

    plv8.execute(
      `
        INSERT INTO request_schema.comment_table
        (
          comment_request_id,
          comment_team_member_id,
          comment_type,
          comment_content
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4
        )
      `, [
        requestId,
        memberId,
        `ACTION_${requestAction}`,
        `${signerFullName} ${requestAction.toLowerCase()} this request`
      ]
    );

    let activeTeam = "";
    if (teamId) {
      const activeTeamResult = plv8.execute(
        `
          SELECT *
          FROM team_schema.team_table
          WHERE team_id = $1
        `, [
          teamId
        ]
      );
      if(activeTeamResult.length){
        activeTeam = activeTeamResult[0];
      }
    }

    if (activeTeam) {
      const teamNameUrlKeyResult = plv8.execute(
        `
          SELECT public.format_team_name_to_url_key($1) AS url_key
        `, [
          activeTeam.team_name
        ]
      );
      const teamNameUrlKey = teamNameUrlKeyResult.length > 0 ? teamNameUrlKeyResult[0].url_key : null;

      if (teamNameUrlKey) {
        plv8.execute(
          `
            INSERT INTO public.notification_table
            (
              notification_app,
              notification_type,
              notification_content,
              notification_redirect_url,
              notification_user_id,
              notification_team_id
            ) 
            VALUES
            (
              $1,
              $2,
              $3,
              $4,
              $5,
              $6
            )
          `, [
            'REQUEST',
            present[requestAction],
            `${signerFullName} ${requestAction.toLowerCase()} your ${formName} request`,
            `/${teamNameUrlKey}/requests/${requestFormslyId ?? requestId}`,
            requestOwnerId,
            teamId
          ]
        );
      }
    }

    if (userId) {
      plv8.execute(
        `
          INSERT INTO public.notification_table
          (
            notification_app,
            notification_type,
            notification_content,
            notification_redirect_url,
            notification_user_id
          ) VALUES
          (
            $1,
            $2,
            $3,
            $4,
            $5
          )
        `, [
          'REQUEST',
          present[requestAction],
          `${signerFullName} ${requestAction.toLowerCase()} your ${formName} request`,
          `/user/requests/${requestFormslyId ?? requestId}`,
          userId
        ]
      );
    }

    if (isPrimarySigner) {
      if (requestAction === "APPROVED") {
        const isAllPrimaryApprovedTheRequest =  plv8.execute(
          `
            SELECT EXISTS (
              SELECT 1
              FROM request_schema.request_signer_table
              INNER JOIN form_schema.signer_table ON signer_id = request_signer_signer_id
                AND signer_is_primary_signer = true
              WHERE
                request_signer_request_id = $1
                AND request_signer_id != $2
                AND request_signer_status != 'APPROVED'
            )
          `, [
            requestId,
            requestSignerId
          ]
        )[0].exists
        if (!isAllPrimaryApprovedTheRequest) {
          plv8.execute(
            `
              UPDATE request_schema.request_table
              SET
                request_status = $1,
                request_status_date_updated = NOW(),
                request_jira_id = $2,
                request_jira_link = $3
              WHERE
                request_id = $4
            `, [
              requestAction,
              jiraId || null,
              jiraLink || null,
              requestId
            ]
          );
          request_status = "APPROVED"
        }
      } else if (requestAction === "REJECTED") {
        plv8.execute(
          `
            UPDATE request_schema.request_table
            SET
              request_status = $1,
              request_status_date_updated = NOW(),
              request_jira_id = $2,
              request_jira_link = $3
            WHERE
              request_id = $4
          `, [
            requestAction,
            jiraId || null,
            jiraLink || null,
            requestId
          ]
        );
        request_status = "REJECTED"
      }
    }
  });
  return request_status;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION create_formsly_premade_forms(
  input_data JSON
)
RETURNS VOID
SET search_path TO ''
AS $$
  plv8.subtransaction(function(){
    const {
      formValues,
      sectionValues,
      fieldWithIdValues,
      fieldsWithoutIdValues,
      optionsValues
    } = input_data;

    plv8.execute(
      `
        INSERT INTO form_schema.form_table
        (
          form_id,
          form_name,
          form_description,
          form_app,
          form_is_formsly_form,
          form_is_hidden,
          form_team_member_id,
          form_is_disabled
        )
        VALUES ${formValues}
      `
    );
    plv8.execute(
      `
        INSERT INTO form_schema.section_table
        (
          section_form_id,
          section_id,
          section_is_duplicatable,
          section_name,
          section_order
        )
        VALUES ${sectionValues}
      `
    );
    plv8.execute(
      `
        INSERT INTO form_schema.field_table
        (
          field_id,
          field_is_read_only,
          field_is_required,
          field_name,
          field_order,
          field_section_id,
          field_type
        )
        VALUES ${fieldWithIdValues}
      `
    );
    plv8.execute(
      `
        INSERT INTO form_schema.field_table
        (
          field_is_read_only,
          field_is_required,
          field_name,
          field_order,
          field_section_id,
          field_type
        )
        VALUES ${fieldsWithoutIdValues}
      `
    );
    plv8.execute(
      `
        INSERT INTO form_schema.option_table
        (
          option_field_id,
          option_order,
          option_value
        )
        VALUES ${optionsValues}
      `
    );
  });
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION create_item(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let item_data;
  plv8.subtransaction(function(){
    const {
      itemData: {
        item_general_name,
        item_is_available,
        item_unit,
        item_gl_account,
        item_team_id,
        item_division_id_list,
        item_level_three_description,
        item_is_ped_item,
        item_category_id,
        item_is_it_asset_item
      },
      itemDescription
    } = input_data;

    const item_result = plv8.execute(
      `
        INSERT INTO item_schema.item_table
        (
          item_general_name,
          item_is_available,
          item_unit,
          item_gl_account,
          item_team_id,
          item_is_ped_item,
          item_category_id,
          item_is_it_asset_item
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8
        )
        RETURNING *
      `, [
        item_general_name,
        item_is_available,
        item_unit,
        item_gl_account,
        item_team_id,
        Boolean(item_is_ped_item),
        item_category_id || null,
        Boolean(item_is_it_asset_item)
      ]
    )[0];

    const csiCodeSection = plv8.execute(
      `
        SELECT csi_code_section
        FROM lookup_schema.csi_code_table
        WHERE
          csi_code_division_id = ANY($1)
          AND csi_code_level_three_description = $2
        LIMIT 1
      `, [
        item_division_id_list,
        item_level_three_description
      ]
    )[0].csi_code_section;

    const itemDivisionDescription = plv8.execute(
      `
        INSERT INTO item_schema.item_level_three_description_table
        (
          item_level_three_description_item_id,
          item_level_three_description,
          item_level_three_description_csi_code_section
        )
        VALUES
        (
          $1,
          $2,
          $3
        )
        RETURNING *
      `, [
        item_result.item_id,
        item_level_three_description,
        csiCodeSection
      ]
    )[0].item_level_three_description;

    const itemDivisionInput = item_division_id_list.map(division => `('${division}', '${item_result.item_id}')`).join(",");
    const item_division_list_result = plv8.execute(
      `
        INSERT INTO item_schema.item_division_table
        (
          item_division_value,
          item_division_item_id
        )
        VALUES ${itemDivisionInput}
        RETURNING *
      `
    );

    const itemDescriptionInput = [];
    const fieldInput = [];

    itemDescription.forEach((description, index) => {
      const fieldId = plv8.execute('SELECT extensions.uuid_generate_v4()')[0].uuid_generate_v4;
      const descriptionId = plv8.execute('SELECT extensions.uuid_generate_v4()')[0].uuid_generate_v4;
      itemDescriptionInput.push({
        item_description_id: descriptionId,
        item_description_label: description.description,
        item_description_item_id: item_result.item_id,
        item_description_is_available: true,
        item_description_field_id: fieldId,
        item_description_is_with_uom: description.withUoM,
        item_description_order: description.order
      });
      fieldInput.push({
        field_id: fieldId,
        field_name: description.description,
        field_type: "DROPDOWN",
        field_order: index + 15,
        field_section_id: '0672ef7d-849d-4bc7-81b1-7a5eefcc1451',
        field_is_required: true,
      });
    });


    const fieldValues = fieldInput
      .map((field) =>
        `('${field.field_id}','${field.field_name}','${field.field_type}','${field.field_order}','${field.field_section_id}','${field.field_is_required}')`
      ).join(",");
    plv8.execute(
      `
        INSERT INTO form_schema.field_table
        (
          field_id,field_name,
          field_type,field_order,
          field_section_id,
          field_is_required
        )
        VALUES ${fieldValues}
      `
    );

    const itemDescriptionValues = itemDescriptionInput
      .map((item) =>
        `('${item.item_description_id}','${item.item_description_label}','${item.item_description_item_id}','${item.item_description_is_available}','${item.item_description_field_id}','${item.item_description_is_with_uom}',${item.item_description_order})`
      )
      .join(",");
    const item_description = plv8.execute(
      `
        INSERT INTO item_schema.item_description_table
        (
          item_description_id,
          item_description_label,
          item_description_item_id,
          item_description_is_available,
          item_description_field_id,
          item_description_is_with_uom,
          item_description_order
        )
        VALUES ${itemDescriptionValues}
        RETURNING *
      `
    );

    item_data = {
      ...item_result,
      item_division_id_list: item_division_list_result.map(division => division.item_division_value),
      item_description: item_description,
      item_level_three_description: itemDivisionDescription
    }
  });
  return item_data;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION update_item(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let item_data;
  plv8.subtransaction(function(){
    const {
      itemData: {
        item_id,
        item_general_name,
        item_is_available,
        item_unit,
        item_gl_account,
        item_team_id,
        item_division_id_list,
        item_level_three_description,
        item_is_ped_item,
        item_category_id,
        item_is_it_asset_item
      },
      toAdd,
      toUpdate,
      toRemove,
      formId
    } = input_data;


    const item_result = plv8.execute(
      `
        UPDATE item_schema.item_table SET
          item_general_name = $1,
          item_is_available = $2,
          item_unit = $3,
          item_gl_account = $4,
          item_team_id = $5,
          item_is_ped_item = $6,
          item_category_id = $7,
          item_is_it_asset_item = $8
        WHERE item_id = $9
        RETURNING *
      `, [
        item_general_name,
        item_is_available,
        item_unit,
        item_gl_account,
        item_team_id,
        Boolean(item_is_ped_item),
        item_category_id || null,
        Boolean(item_is_it_asset_item),
        item_id
      ]
    )[0];

    const { section_id } = plv8.execute(
      `
        SELECT
          section_id
        FROM form_schema.section_table
        WHERE
          section_form_id = $1
          AND section_name = 'Item'
      `, [
        formId
      ]
    )[0];
    const itemDescriptionInput = [];
    const fieldInput = [];

    toAdd.forEach((description) => {
      const fieldId = plv8.execute('SELECT extensions.uuid_generate_v4()')[0].uuid_generate_v4;
      const descriptionId = plv8.execute('SELECT extensions.uuid_generate_v4()')[0].uuid_generate_v4;
      itemDescriptionInput.push({
        item_description_id: descriptionId,
        item_description_label: description.description,
        item_description_item_id: item_result.item_id,
        item_description_is_available: true,
        item_description_field_id: fieldId,
        item_description_is_with_uom: description.withUoM,
        item_description_order: description.order
      });
      fieldInput.push({
        field_id: fieldId,
        field_name: description.description,
        field_type: "DROPDOWN",
        field_order: description.order + 15,
        field_section_id: section_id,
        field_is_required: true,
      });
    });

    // update
    let updatedItemDescription = [];
    if (toUpdate.length) {
      const itemDescriptionIds = [];
      const itemDescriptionWithUoms = [];
      const itemDescriptionLabels = [];
      const itemDescriptionOrders = [];
      const itemFieldIds = [];
      const itemFieldOrders = [];
      toUpdate.forEach(description => {
        itemDescriptionIds.push(`'${description.item_description_id}'`);
        itemDescriptionWithUoms.push(description.item_description_is_with_uom);
        itemDescriptionLabels.push(`'${description.item_description_label}'`);
        itemDescriptionOrders.push(description.item_description_order);
        itemFieldIds.push(`'${description.item_description_field_id}'`);
        itemFieldOrders.push(description.item_description_order + 15);
      });

      updatedItemDescription = plv8.execute(
        `
          WITH updates AS (
            SELECT
              UNNEST(ARRAY[${itemDescriptionIds}]) AS item_description_id,
              UNNEST(ARRAY[${itemDescriptionWithUoms}]) AS item_description_is_with_uom,
              UNNEST(ARRAY[${itemDescriptionLabels}]) AS item_description_label,
              UNNEST(ARRAY[${itemDescriptionOrders}]) AS item_description_order
          )
          UPDATE item_schema.item_description_table
          SET
            item_description_is_with_uom = updates.item_description_is_with_uom::BOOLEAN,
            item_description_label = updates.item_description_label,
            item_description_order = updates.item_description_order::INTEGER
          FROM updates
          WHERE item_description_table.item_description_id = updates.item_description_id::UUID
          RETURNING *
        `
      );

      plv8.execute(
        `
          WITH updates AS (
            SELECT
              UNNEST(ARRAY[${itemFieldIds}]) AS field_id,
              UNNEST(ARRAY[${itemDescriptionLabels}]) AS field_name,
              UNNEST(ARRAY[${itemFieldOrders}]) AS field_order
          )
          UPDATE form_schema.field_table
          SET
            field_name = updates.field_name,
            field_order = updates.field_order::INTEGER
          FROM updates
          WHERE field_table.field_id = updates.field_id::UUID
        `
      );
    }

    // delete
    if (toRemove.length) {
      const itemDescriptionIds = [];
      toRemove.forEach(description => {
        itemDescriptionIds.push(description.descriptionId)
      });
      plv8.execute(
        `
          UPDATE item_schema.item_description_table
          SET
            item_description_is_disabled = true
          WHERE
            item_description_id = ANY($1)
        `, [
          itemDescriptionIds
        ]
      );

      plv8.execute(
        `
          DELETE FROM item_schema.item_level_three_description_table
          WHERE item_level_three_description_item_id = $1
        `, [
          item_id
        ]
      );
    }


    // add
    let addedDescription = [];
    if (fieldInput.length && itemDescriptionInput.length) {
      const fieldValues = fieldInput
        .map((field) =>
          `('${field.field_id}','${field.field_name}','${field.field_type}','${field.field_order}','${field.field_section_id}','${field.field_is_required}')`
        )
        .join(",");
      plv8.execute(
        `
          INSERT INTO form_schema.field_table
          (
            field_id,
            field_name,
            field_type,
            field_order,
            field_section_id,
            field_is_required
          )
          VALUES ${fieldValues}
        `
      );
      const itemDescriptionValues = itemDescriptionInput
        .map((item) =>
          `('${item.item_description_id}','${item.item_description_label}','${item.item_description_item_id}','${item.item_description_is_available}','${item.item_description_field_id}','${item.item_description_is_with_uom}',${item.item_description_order})`
        )
        .join(",");
      addedDescription = plv8.execute(
        `
          INSERT INTO item_schema.item_description_table
          (
            item_description_id,
            item_description_label,
            item_description_item_id,
            item_description_is_available,
            item_description_field_id,
            item_description_is_with_uom,
            item_description_order
          )
          VALUES ${itemDescriptionValues}
          RETURNING *
        `
      );
    }

    plv8.execute(
      `
        DELETE FROM item_schema.item_division_table
        WHERE item_division_item_id = $1
      `, [
        item_id
      ]
    );
    const itemDivisionInput = item_division_id_list.map(division => {
      return `('${division}', '${item_result.item_id}')`;
    }).join(",");

    const item_division_list_result = plv8.execute(
      `
        INSERT INTO item_schema.item_division_table
        (
          item_division_value,
          item_division_item_id
        )
        VALUES ${itemDivisionInput}
        RETURNING *
      `
    );

    const csiCodeSection = plv8.execute(
      `
        SELECT csi_code_section
        FROM lookup_schema.csi_code_table
        WHERE
          csi_code_division_id = ANY($1)
          AND csi_code_level_three_description = $2
        LIMIT 1
      `, [
        item_division_id_list,
        item_level_three_description
      ]
    )[0].csi_code_section;

    const itemLevelThreeDescription = plv8.execute(
      `
        INSERT INTO item_schema.item_level_three_description_table
        (
          item_level_three_description_item_id,
          item_level_three_description,
          item_level_three_description_csi_code_section
        )
        VALUES
        (
          $1,
          $2,
          $3
        )
        RETURNING *
      `, [
        item_id,
        item_level_three_description,
        csiCodeSection
      ]
    )[0].item_level_three_description;

    item_data = {
      ...item_result,
      item_division_id_list: item_division_list_result.map(division => division.item_division_value),
      item_description: [...updatedItemDescription, ...addedDescription],
      item_level_three_description: itemLevelThreeDescription
    }
  });
  return item_data;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION create_team_invitation(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let invitation_data;
  plv8.subtransaction(function(){
    const {
      emailList,
      teamMemberId,
      teamName
    } = input_data;

    plv8.execute(
      `
        DELETE FROM user_schema.invitation_table
        WHERE
          invitation_to_email = ANY($1)
          AND invitation_status = 'PENDING'
      `, [
        emailList
      ]
    );

    const userData = plv8.execute(
      `
        SELECT * 
        FROM user_schema.user_table 
        WHERE 
          user_email = ANY($1)
      `, [
        emailList
      ]
    );

    const invitationInput = [];
    const notificationInput = [];
    emailList.forEach((email) => {
      const invitationId = plv8.execute('SELECT extensions.uuid_generate_v4()')[0].uuid_generate_v4;

      invitationInput.push({
        invitation_id: invitationId,
        invitation_to_email: email,
        invitation_from_team_member_id: teamMemberId,
      });

      const matchedUser = userData.find(user => user.user_email === email);
      if (matchedUser) {
          notificationInput.push({
          notification_app: "GENERAL",
          notification_content: `You have been invited to join ${teamName}`,
          notification_redirect_url: `/invitation/${invitationId}`,
          notification_type: "INVITE",
          notification_user_id: matchedUser.user_id,
        });
      }
    });

    if (userData.length) {
      const userIdList = userData.map(user => user.user_id);
      plv8.execute(
        `
          DELETE FROM public.notification_table
          WHERE
            notification_app = 'GENERAL'
            AND notification_content = 'You have been invited to join ' || $1
            AND notification_type = 'INVITE'
            AND notification_user_id = ANY($2)
        `, [
          teamName,
          userIdList
        ]
      );
    }

    if (invitationInput.length > 0){
      const invitationValues = invitationInput
        .map((invitation) =>
          `('${invitation.invitation_id}','${invitation.invitation_to_email}','${invitation.invitation_from_team_member_id}')`
        ).join(",");

      invitation_data = plv8.execute(
        `
          INSERT INTO user_schema.invitation_table 
          (
            invitation_id,
            invitation_to_email,
            invitation_from_team_member_id
          ) 
          VALUES ${invitationValues}
          RETURNING *
        `
      );
    }

    if (notificationInput.length > 0){
      const notificationValues = notificationInput
        .map((notification) =>
          `('${notification.notification_app}','${notification.notification_content}','${notification.notification_redirect_url}','${notification.notification_type}','${notification.notification_user_id}')`
        ).join(",");

      plv8.execute(
        `
          INSERT INTO public.notification_table 
          (
            notification_app,
            notification_content,
            notification_redirect_url,
            notification_type,
            notification_user_id
          ) 
          VALUES ${notificationValues}
        `
      );
    }
  });
  return invitation_data;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_user_active_team_id(
  user_id TEXT
)
RETURNS TEXT
SET search_path TO ''
AS $$
  let active_team_id;
  plv8.subtransaction(function(){
    const user_data = plv8.execute(
      `
        SELECT * 
        FROM user_schema.user_table 
        WHERE user_id = $1 
        LIMIT 1
      `, [
        user_id
      ]
    )[0];

    if (!user_data.user_active_team_id) {
      const team_member = plv8.execute(
        `
          SELECT * 
          FROM team_schema.team_member_table 
          WHERE 
            team_member_user_id = $1
            AND team_member_is_disabled = false
          LIMIT 1
        `, [
          user_id
        ]
      );

      if (team_member.length) {
        active_team_id = team_member[0].team_member_team_id
      }
    } else {
      active_team_id = user_data.user_active_team_id
    }
  });
  return active_team_id;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION check_item_form_status(
  team_id TEXT,
  form_id TEXT
)
RETURNS TEXT
SET search_path TO ''
AS $$
  let return_data;
  plv8.subtransaction(function(){
    const item_count = plv8.execute(
      `
        SELECT COUNT(*) 
        FROM item_schema.item_table 
        WHERE 
          item_team_id = $1
          AND item_is_available = true
          AND item_is_disabled = false
      `, [
        team_id
      ]
    )[0];

    const signer_count = plv8.execute(
      `
        SELECT COUNT(*) 
        FROM form_schema.signer_table 
        WHERE 
          signer_form_id = $1
          AND signer_is_disabled = false
          AND signer_is_primary_signer = true
      `, [
        form_id
      ]
    )[0];

    if (!item_count.count) {
      return_data = "There must be at least one available item";
    } else if (!signer_count) {
      return_data = "You need to add a primary signer first";
    } else {
      return_data = "true"
    }
  });
  return return_data;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION transfer_ownership(
  owner_id TEXT,
  member_id TEXT
)
RETURNS VOID
SET search_path TO ''
AS $$
  plv8.subtransaction(function(){
    plv8.execute(
      `
        UPDATE team_schema.team_member_table 
        SET 
          team_member_role = 'OWNER',
        WHERE 
          team_member_id = $1
      `, [
        member_id
      ]
    );
    plv8.execute(
      `
        UPDATE team_schema.team_member_table 
        SET
          team_member_role = 'APPROVER'
        WHERE 
          team_member_id = $1
      `, [
        owner_id
      ]
    );
  });
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION accept_team_invitation(
  invitation_id TEXT,
  team_id TEXT,
  user_id TEXT
)
RETURNS JSON
SET search_path TO ''
AS $$
  let user_team_list
  plv8.subtransaction(function(){

    const isUserPreviousMember = plv8.execute(
      `
        SELECT EXISTS (
          SELECT 1
          FROM team_schema.team_member_table 
          WHERE 
            team_member_team_id = $1
            AND team_member_user_id = $2
            AND team_member_is_disabled = true
        )
      `, [
        team_id,
        user_id
      ]
    )[0].exists;
    
    const userData = plv8.execute(
      `
        SELECT 
          user_id, 
          user_active_team_id 
        FROM user_schema.user_table 
        WHERE 
          user_id = $1
      `, [
        user_id
      ]
    )[0];

    if (isUserPreviousMember) {
      plv8.execute(
        `
          UPDATE team_schema.team_member_table 
          SET 
            team_member_is_disabled = false
          WHERE 
            team_member_team_id = $1
            AND team_member_user_id = $2
        `, [
          team_id,
          user_id
        ]
      );
    } else {
      plv8.execute(
        `
          INSERT INTO team_schema.team_member_table 
          (
            team_member_team_id,
            team_member_user_id
          ) VALUES 
          (
            $1,
            $2
          )
        `, [
          team_id,
          user_id
        ]
      );
    }

    if (!userData.user_active_team_id) {
      plv8.execute(
        `
          UPDATE user_schema.user_table 
          SET 
            user_active_team_id = $1
          WHERE user_id = $2
        `, [
          team_id,
          user_id
        ]
      );
    }

    plv8.execute(
      `
        UPDATE user_schema.invitation_table 
        SET 
          invitation_status = 'ACCEPTED'
        WHERE 
          invitation_id = $1
      `, [
        invitation_id
      ]
    );

    user_team_list = plv8.execute(
      `
        SELECT team_table.*
        FROM team_schema.team_member_table
        INNER JOIN team_schema.team_table 
          ON team_id = team_member_team_id
        WHERE 
          team_member_is_disabled = false
          AND team_member_user_id = $1
        ORDER BY team_date_created DESC
      `, [
        user_id
      ]
    );
  });
  return user_team_list;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION cancel_request(
  request_id TEXT,
  member_id TEXT,
  comment_type TEXT,
  comment_content TEXT
)
RETURNS VOID
SET search_path TO ''
AS $$
  plv8.subtransaction(function(){
    plv8.execute(
      `
        UPDATE request_schema.request_table 
        SET 
          request_status = 'CANCELED',
          request_status_date_updated = NOW()
        WHERE 
          request_id = $1
      `, [
        request_id
      ]
    );
    plv8.execute(
      `
        INSERT INTO request_schema.comment_table 
        (
          comment_request_id,
          comment_team_member_id,
          comment_type,
          comment_content
        ) 
        VALUES 
        (
          $1,
          $2,
          $3,
          $4
        )
      `, [
        request_id,
        member_id,
        comment_type,
        comment_content
      ]
    );
  });
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION create_request_form(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let form_data;
  plv8.subtransaction(function(){
    const {
      teamMemberId,
      formBuilderData: {
        formDescription,
        formId,
        formName,
        formType,
        groupList,
        isForEveryone,
        isSignatureRequired,
        sections,
        signers
      },
    } = input_data;

    form_data = plv8.execute(
      `
        INSERT INTO form_schema.form_table 
        (
          form_app,
          form_description,
          form_name,form_team_member_id,
          form_id,form_is_signature_required,
          form_is_for_every_member
        ) 
        VALUES 
        (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7
        ) 
        RETURNING *
      `, [
        formType,
        formDescription,
        formName,
        teamMemberId,
        formId,
        isSignatureRequired,
        isForEveryone
      ]
    )[0];

    const sectionInput = [];
    const fieldInput = [];
    const optionInput = [];

    sections.forEach((section) => {
      const { fields, ...newSection } = section;
      sectionInput.push(newSection);
      fields.forEach((field) => {
        const { options, ...newField } = field;
        fieldInput.push(newField);
        options.forEach((option) => optionInput.push(option));
      });
    });

    const sectionValues = sectionInput
      .map(
        (section) =>
          `('${section.section_id}','${formId}','${section.section_is_duplicatable}','${section.section_name}','${section.section_order}')`
      )
      .join(",");

    const fieldValues = fieldInput
      .map(
        (field) =>
          `('${field.field_id}','${field.field_name}','${field.field_type}','${field.field_is_positive_metric}','${field.field_is_required}','${field.field_order}','${field.field_section_id}',${field.field_special_field_template_id ? `'${field.field_special_field_template_id}'` : "NULL"})`
      )
      .join(",");


    const optionValues = optionInput
      .map(
        (option) =>
          `('${option.option_id}','${option.option_value}','${option.option_order}','${option.option_field_id}')`
      )
      .join(",");

    const signerValues = signers
      .map(
        (signer) =>
          `('${signer.signer_id}','${formId}','${signer.signer_team_member_id}','${signer.signer_action}','${signer.signer_is_primary_signer}','${signer.signer_order}')`
      )
      .join(",");

    const groupValues = groupList
      .map(
        (group) =>
          `('${formId}','${group}')`
      )
      .join(",");

    const section_query = `
      INSERT INTO form_schema.section_table 
      (
        section_id,
        section_form_id,
        section_is_duplicatable,
        section_name,
        section_order
      ) 
      VALUES ${sectionValues}
    `;

    const field_query = `
      INSERT INTO form_schema.field_table 
      (
        field_id,
        field_name,
        field_type,
        field_is_positive_metric,
        field_is_required,
        field_order,
        field_section_id,
        field_special_field_template_id
      ) 
      VALUES ${fieldValues}
    `;

    const option_query = `
      INSERT INTO form_schema.option_table 
      (
        option_id,option_value,
        option_order,
        option_field_id
      ) 
      VALUES ${optionValues}
    `;

    const signer_query = `
      INSERT INTO form_schema.signer_table 
      (
        signer_id,
        signer_form_id,
        signer_team_member_id,
        signer_action,
        signer_is_primary_signer,signer_order
      ) 
      VALUES ${signerValues}
    `;

    const form_group_query = `
      INSERT INTO form_schema.form_team_group_table 
      (
        form_id,
        team_group_id
      ) 
      VALUES ${groupValues}
    `;

    const all_query = `
      ${section_query}; 
      ${field_query}; 
      ${optionInput.length>0?option_query : ''}; 
      ${signer_query}; 
      ${groupList.length > 0 ? form_group_query : ''};
    `
    plv8.execute(all_query);
  });
  return form_data;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_all_notification(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let notification_data;
  plv8.subtransaction(function(){
    const {
      userId,
      app,
      page,
      limit,
      teamId
    } = input_data;

    const start = (page - 1) * limit;

    let team_query = ''
    if (teamId) {
      team_query = `OR notification_team_id = '${teamId}'`;
    }

    const notification_list = plv8.execute(
      `
        SELECT  * FROM public.notification_table 
        WHERE 
          notification_user_id = $1
          AND (
            notification_app = 'GENERAL'
            OR notification_app = $2
          ) 
          AND (
            notification_team_id IS NULL 
            ${team_query}
          ) 
        ORDER BY notification_date_created DESC 
        LIMIT $3
        OFFSET $4
      `, [
        userId,
        app,
        limit,
        start
      ]
    );

    const unread_notification_count = plv8.execute(
      `
        SELECT COUNT(*) 
        FROM public.notification_table 
        WHERE 
          notification_user_id = $1
          AND (
            notification_app = 'GENERAL'
            OR notification_app = $2
          ) 
          AND (
            notification_team_id IS NULL 
            ${team_query}
          ) 
          AND notification_is_read = false
      `, [
        userId,
        app
      ]
    )[0].count;

    notification_data = {
      data: notification_list,
      count: Number(unread_notification_count)
    }
  });
  return notification_data;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION update_form_signer(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let signer_data;
  plv8.subtransaction(function(){
    const {
     formId,
     signers,
     selectedProjectId
    } = input_data;

    plv8.execute(
      `
        UPDATE form_schema.signer_table 
        SET 
          signer_is_disabled = true
        WHERE 
          signer_form_id = $1
          AND signer_team_project_id ${selectedProjectId ? `= '${selectedProjectId}'` : "IS NULL"} 
          AND signer_team_department_id IS NULL
      `, [
        formId
      ]
    );

    const signerValues = signers
      .map(
        (signer) =>
          `('${signer.signer_id}','${formId}','${signer.signer_team_member_id}','${signer.signer_action}','${signer.signer_is_primary_signer}','${signer.signer_order}','${signer.signer_is_disabled}', ${selectedProjectId ? `'${selectedProjectId}'` : null})`
      )
      .join(",");

    signer_data = plv8.execute(
      `
        INSERT INTO form_schema.signer_table 
        (
          signer_id,
          signer_form_id,
          signer_team_member_id,
          signer_action,
          signer_is_primary_signer,
          signer_order,
          signer_is_disabled,
          signer_team_project_id
        ) 
        VALUES ${signerValues} 
        ON CONFLICT 
        ON CONSTRAINT signer_table_pkey 
        DO UPDATE 
        SET 
          signer_team_member_id = excluded.signer_team_member_id,
          signer_action = excluded.signer_action,
          signer_is_primary_signer = excluded.signer_is_primary_signer,
          signer_order = excluded.signer_order,
          signer_is_disabled = excluded.signer_is_disabled,
          signer_team_project_id = excluded.signer_team_project_id 
        RETURNING *
      `
    );
  });
  return signer_data;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION fetch_request_list(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let return_value;
  plv8.subtransaction(function(){
    const {
      teamId,
      page,
      limit,
      requestor,
      approver,
      status,
      form,
      sort,
      search,
      isApproversView,
      teamMemberId,
      project,
      columnAccessor
    } = input_data;

    const start = (page - 1) * limit;

    let request_list = [];
    let request_count = 0;

    const base_request_list_query = `
      WITH request_data AS (
        SELECT
          request_id,
          request_formsly_id,
          request_date_created,
          request_status,
          request_team_member_id,
          request_jira_id,
          request_jira_link,
          request_otp_id,
          request_form_id,
          form_name
        FROM public.request_view
        INNER JOIN form_schema.form_table ON request_form_id = form_id
          AND form_is_disabled = false
          AND form_is_public_form = false
        INNER JOIN team_schema.team_member_table ON team_member_id = request_team_member_id
          AND team_member_team_id = $1
        WHERE
          request_is_disabled = false
    `;

    const request_signer_query = `
      )
      SELECT jsonb_build_object(
        'request_id', request_id,
        'request_formsly_id', request_formsly_id,
        'request_date_created', request_date_created,
        'request_status', request_status,
        'request_team_member_id', request_team_member_id,
        'request_jira_id', request_jira_id,
        'request_jira_link', request_jira_link,
        'request_otp_id', request_otp_id,
        'request_form_id', request_form_id,
        'form_name', form_name,
        'request_signer', (
          SELECT jsonb_agg(
            jsonb_build_object(
              'request_signer_id', request_signer_id,
              'request_signer_status', request_signer_status,
              'signer_is_primary_signer', signer_is_primary_signer,
              'signer_team_member_id', signer_team_member_id
            )
          )
          FROM request_schema.request_signer_table
          INNER JOIN form_schema.signer_table 
            ON request_signer_signer_id = signer_id
          WHERE request_signer_request_id = request_id
        )
      )
      FROM request_data
    `

    const base_sort_query = `
      ORDER BY ${columnAccessor} ${sort}
      OFFSET ${start} ROWS FETCH FIRST ${limit} ROWS ONLY
    `;

    const base_request_count_query = `
      SELECT COUNT(*)
      FROM public.request_view
      INNER JOIN form_schema.form_table ON request_form_id = form_id
        AND form_is_disabled = false
        AND form_is_public_form = false
      INNER JOIN team_schema.team_member_table ON team_member_id = request_team_member_id
        AND team_member_team_id = $1
      WHERE
        request_is_disabled = false
    `;

    if (isApproversView) {
      const approver_filter_query = `
        AND EXISTS (
          SELECT 1
          FROM request_schema.request_signer_table
          INNER JOIN form_schema.signer_table signer ON signer_id = request_signer_signer_id
          WHERE
            request_signer_request_id = request_view.request_id
            AND request_signer_status = 'PENDING'
            AND signer_team_member_id = $2
        )
        AND request_view.request_status != 'CANCELED'
      `;

      request_list = plv8.execute(base_request_list_query + approver_filter_query + base_sort_query + request_signer_query, [teamId, teamMemberId]);

      request_count = plv8.execute(base_request_count_query + approver_filter_query, [teamId, teamMemberId])[0];
    } else {
      const non_approver_filter_query = `${requestor} ${approver} ${status} ${form} ${project} ${search}`;

      request_list = plv8.execute(base_request_list_query + non_approver_filter_query + base_sort_query + request_signer_query, [teamId]);

      request_count = plv8.execute(base_request_count_query + non_approver_filter_query, [teamId])[0];
    }

    return_value = {
      data: request_list.map(data => data.jsonb_build_object),
      count: Number(request_count.count)
    };
  });
  return return_value;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION create_team_project(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let team_project_data;
  plv8.subtransaction(function(){
    const {
      teamProjectName,
      teamProjectInitials,
      teamProjectTeamId,
      siteMapId,
      boqId,
      region,
      province,
      city,
      barangay,
      street,
      zipCode
    } = input_data;

    const projectInitialCount = plv8.execute(
      `
        SELECT COUNT(*) FROM team_schema.team_project_table
        WHERE 
          team_project_team_id = $1
          AND team_project_code ILIKE '%' || $2 || '%'
      `, [
        teamProjectTeamId, 
        teamProjectInitials
      ]
    )[0].count + 1n;

    const teamProjectCode = teamProjectInitials + projectInitialCount.toString(16).toUpperCase();

    const addressData = plv8.execute(
      `
        INSERT INTO public.address_table
        (
          address_region,
          address_province,
          address_city,
          address_barangay,
          address_street,
          address_zip_code
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6
        ) 
        RETURNING *
      `, [
        region,
        province,
        city,
        barangay,
        street,
        zipCode
      ]
    )[0];

    teamData = plv8.execute(
      `
        INSERT INTO team_schema.team_project_table
        (
          team_project_name,
          team_project_code,
          team_project_team_id,
          team_project_site_map_attachment_id,
          team_project_boq_attachment_id,
          team_project_address_id
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6
        )
        RETURNING *
      `, [
        teamProjectName,
        teamProjectCode,
        teamProjectTeamId,
        siteMapId || null,
        boqId || null,
        addressData.address_id
      ]
    )[0];

    team_project_data = {
      ...teamData,
      team_project_address: {
        ...addressData
      }
    }
  });
  return team_project_data;
$$ LANGUAGE plv8;


CREATE OR REPLACE FUNCTION insert_group_member(
  input_data JSON
)
RETURNS VOID
SET search_path TO ''
AS $$
  plv8.subtransaction(function(){
    const {
     groupId,
     teamMemberIdList,
     teamProjectIdList
    } = input_data;

    const groupInsertData = teamMemberIdList.map((memberId) => {
      return `('${memberId}', '${groupId}')`;
    }).join(", ");

    plv8.execute(
      `
        INSERT INTO team_schema.team_group_member_table 
        (
          team_member_id,
          team_group_id
        ) 
        VALUES ${groupInsertData}
        ON CONFLICT (
          team_member_id,
          team_group_id
        )
        DO NOTHING
        RETURNING *
      `
    );

    if (teamProjectIdList.length) {
      const projectInsertData = [];
      teamProjectIdList.forEach(projectId => {
        teamMemberIdList.forEach(memberId => {
          projectInsertData.push(`(
            '${memberId}',
            '${projectId}'
          )`)
        });
      });

      plv8.execute(
        `
          INSERT INTO team_schema.team_project_member_table 
          (
            team_member_id,
            team_project_id
          ) 
          VALUES ${projectInsertData.join(', ')}
          ON CONFLICT (
            team_member_id,
            team_project_id
          )
          DO NOTHING
          RETURNING *
        `
      );
    }

    if (groupId === 'a691a6ca-8209-4b7a-8f48-8a4582bbe75a') {
      const signerInput = teamMemberIdList.map(teamMemberId => {
        return `(
          true,
          1,
          'Approved',
          true,
          '16ae1f62-c553-4b0e-909a-003d92828036'::UUID,
          '${teamMemberId}'::UUID
        )`;
      }).join(', ');

      plv8.execute(
        `
          WITH batch_data (
            signer_is_primary_signer,
            signer_order,
            signer_action,
            signer_is_disabled,
            signer_form_id,
            signer_team_member_id
          ) AS (
            VALUES ${signerInput}
          )
          INSERT INTO form_schema.signer_table
          (
            signer_is_primary_signer,
            signer_order,
            signer_action,
            signer_is_disabled,
            signer_form_id,
            signer_team_member_id
          )
          SELECT *
          FROM batch_data
          WHERE NOT EXISTS (
            SELECT 1 
            FROM form_schema.signer_table 
            WHERE 
              signer_is_primary_signer = true
              AND signer_order = 1
              AND signer_action = 'Approved'
              AND signer_is_disabled = true
              AND signer_form_id = '16ae1f62-c553-4b0e-909a-003d92828036'
              AND signer_team_member_id = ANY($1)
          );
        `, [
          teamMemberIdList
        ]
      );
    }
  });
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION insert_project_member(
  input_data JSON
)
RETURNS VOID
SET search_path TO ''
AS $$
  plv8.subtransaction(function(){
    const {
      projectId,
      teamMemberIdList,
      teamGroupIdList
    } = input_data;

    const projectInsertData = teamMemberIdList.map((memberId) => {
      return `('${memberId}', '${projectId}')`;
    }).join(", ");

    plv8.execute(
      `
        INSERT INTO team_schema.team_project_member_table 
        (
          team_member_id,
          team_project_id
        ) 
        VALUES ${projectInsertData}
        ON CONFLICT (
          team_member_id,
          team_project_id
        )
        DO NOTHING
        RETURNING *
      `
    );

    if (teamGroupIdList.length) {
      const groupInsertData = [];
      teamGroupIdList.forEach(groupId => {
        teamMemberIdList.forEach(memberId => {
          groupInsertData.push(`(
            '${memberId}',
            '${groupId}'
          )`)
        });
      });

      plv8.execute(
        `
          INSERT INTO team_schema.team_group_member_table 
          (
            team_member_id,
            team_group_id
          ) 
          VALUES ${groupInsertData.join(', ')}
          ON CONFLICT (
            team_member_id,
            team_group_id
          )
          DO NOTHING
          RETURNING *
        `
      );
    }
  });
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION update_form_group(
  input_data JSON
)
RETURNS VOID
SET search_path TO ''
AS $$
  plv8.subtransaction(function(){
    const {
     formId,
     isForEveryone,
     groupList
    } = input_data;

    plv8.execute(
      `
        UPDATE form_schema.form_table 
        SET 
          form_is_for_every_member = $1
          WHERE form_id = $2
      `, [
        isForEveryone,
        formId
      ]
    );

    plv8.execute(
      `
        DELETE FROM form_schema.form_team_group_table 
        WHERE form_id $1
      `, [
        formId
      ]
    );

    const newGroupInsertValues = groupList.map((group) =>`('${group}', '${formId}')`).join(",");

    plv8.execute(
      `
        INSERT INTO form_schema.form_team_group_table 
        (
          team_group_id,
          form_id
        ) 
        VALUES ${newGroupInsertValues}
        RETURNING *
      `
    );
  });
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_all_team_members_without_group_members(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let member_data;
  plv8.subtransaction(function(){
    const {
     teamId,
     groupId
    } = input_data;

    const teamGroupMemberData = plv8.execute(
      `
        SELECT team_member_id 
        FROM team_schema.team_group_member_table 
        WHERE 
          team_group_id = $1
      `, [
        groupId
      ]
    );

    const condition = teamGroupMemberData.map((member) => member.team_member_id);

    member_data = plv8.execute(
      `
        SELECT 
          team_member_id, 
          user_id,
          user_first_name,
          user_last_name,
          user_avatar,
          user_email
        FROM team_schema.team_member_table
        INNER JOIN user_schema.user_table ON user_id = team_member_user_id
        WHERE 
          team_member_team_id = $1
          AND team_member_is_disabled = FALSE 
          AND team_member_id != ALL($2)
        ORDER BY
          user_first_name ASC,
          user_last_name ASC
      `, [
        teamId,
        condition.length ? condition : [plv8.execute(`SELECT extensions.uuid_generate_v4()`)[0].uuid_generate_v4]
      ]
    ).map(teamMember => {
      return {
        team_member_id: teamMember.team_member_id,
        team_member_user: {
          user_id: teamMember.user_id,
          user_first_name: teamMember.user_first_name,
          user_last_name: teamMember.user_last_name,
          user_avatar: teamMember.user_avatar,
          user_email: teamMember.user_email
        }
      }
    });
  });
  return member_data;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_all_team_members_without_project_members(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let member_data;
  plv8.subtransaction(function(){
    const {
     teamId,
     projectId
    } = input_data;

    const teamProjectMemberData = plv8.execute(
      `
        SELECT team_member_id 
        FROM team_schema.team_project_member_table 
        WHERE 
          team_project_id = $1
      `, [
        projectId
      ]
    );

    const condition = teamProjectMemberData.map((member) => member.team_member_id);

    member_data = plv8.execute(
      `
        SELECT 
          team_member_id, 
          user_id,
          user_first_name,
          user_last_name,
          user_avatar,
          user_email
        FROM team_schema.team_member_table
        INNER JOIN user_schema.user_table ON user_id = team_member_user_id
        WHERE 
          team_member_team_id = $1
          AND team_member_is_disabled = FALSE 
          AND team_member_id != ALL($2)
        ORDER BY
          user_first_name ASC,
          user_last_name ASC
      `, [
        teamId,
        condition.length ? condition : [plv8.execute(`SELECT extensions.uuid_generate_v4()`)[0].uuid_generate_v4]
      ]
    ).map(teamMember => {
      return {
        team_member_id: teamMember.team_member_id,
        team_member_user: {
          user_id: teamMember.user_id,
          user_first_name: teamMember.user_first_name,
          user_last_name: teamMember.user_last_name,
          user_avatar: teamMember.user_avatar,
          user_email: teamMember.user_email
        }
      }
    });
  });
  return member_data;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION delete_team(
  team_id TEXT,
  team_member_id TEXT
)
RETURNS VOID
SET search_path TO ''
AS $$
  plv8.subtransaction(function(){
    const user = plv8.execute(
      `
        SELECT * FROM 
        team_schema.team_member_table 
        WHERE 
          team_member_team_id = $1
          AND team_member_id = $2
          AND team_member_role = 'OWNER'
        LIMIT 1
      `, [
        team_id,
        team_member_id
      ]
    );
    if (!user.length) return;

    plv8.execute(
      `
        UPDATE team_schema.team_table 
        SET 
          team_is_disabled = true
        WHERE 
          team_id = $1
      `, [
        team_id
      ]
    );

    plv8.execute(
      `
        UPDATE team_schema.team_member_table 
        SET 
          team_member_is_disabled = true
        WHERE 
          team_member_team_id = $1
      `, [
        team_id
      ]
    );

    plv8.execute(
      `
        UPDATE invitation_table
        SET 
          invitation_is_disabled = true
        FROM team_schema.team_member_table
        WHERE 
          team_member_team_id = $1
          AND team_member_id = invitation_from_team_member_id 
      `, [
        team_id
      ]
    );

    const userTeamList = plv8.execute(
      `
        SELECT * 
        FROM team_schema.team_member_table 
        WHERE 
          team_member_id = $1
          AND team_member_is_disabled = false
      `, [
        team_member_id
      ]
    );

    if (userTeamList.length > 0) {
      plv8.execute(
        `
          UPDATE user_schema.user_table 
          SET 
            user_active_team_id = $1
          WHERE 
            user_id = $2
        `, [
          userTeamList[0].team_member_team_id,
          user[0].team_member_user_id
        ]
      );
    } else {
      plv8.execute(
        `
          UPDATE user_schema.user_table 
          SET user_active_team_id = NULL
          WHERE
            user_id = $1
        `, [
          user[0].team_member_user_id
        ]
      );
    }
  });
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION update_member_role(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let memberList = [];
  plv8.subtransaction(function(){
    const {
      memberIdList,
      updateRole
    } = input_data;

    memberList = plv8.execute(
      `
        WITH updated AS (
          UPDATE team_schema.team_member_table 
          SET 
            team_member_role = $1
          WHERE 
            team_member_id = ANY($2)
          RETURNING *
        )
        SELECT
          team_member_id,
          user_id,
          user_first_name,
          user_last_name,
          user_avatar,
          user_email
        FROM updated
        INNER JOIN user_schema.user_table
          ON user_id = team_member_user_id
      `, [
        updateRole,
        memberIdList
      ]
    ).map(data => {
      return {
        team_member_id: data.team_member_id,
        team_member_user: {
          user_id: data.user_id,
          user_first_name: data.user_first_name,
          user_last_name: data.user_last_name,
          user_avatar: data.user_avatar,
          user_email: data.user_email
        }
      }
    });
  });
  return memberList;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION request_page_on_load(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      requestId
    } = input_data;

    const idCondition = plv8.execute(`SELECT public.generate_request_id_condition($1)`, [requestId])[0].generate_request_id_condition;

    const request = plv8.execute(
      `
        SELECT
          request_formsly_id,
          request_status,
          form_is_formsly_form,
          form_name,
          form_is_public_form
        FROM public.request_view
        INNER JOIN form_schema.form_table ON form_id = request_form_id
        WHERE
          ${idCondition}
          AND request_is_disabled = false
      `
    )[0];

    let isWithNextStep = false;
    if(request.request_status === 'APPROVED' && request.form_is_public_form){
      isWithNextStep = !(
        plv8.execute(
          `
            SELECT EXISTS (
              SELECT 1
              FROM request_schema.request_response_table
              WHERE
                request_response_field_id IN (
                  '44edd3e4-9595-4b7c-a924-98b084346d36',
                  'be0e130b-455b-47e0-a804-f90943f7bc07',
                  'c3225996-d3e8-4fb4-87d8-f5ced778adcf',
                  'ef1e47d2-413f-4f92-b541-20c88f3a67b2',
                  '362bff3d-54fa-413b-992c-fd344d8552c6'
                )
                AND request_response = $1
            )
          `, [
            `"${request.request_formsly_id}"`
          ]
        )[0].exists
      );
    }

    if (!request.form_is_formsly_form || (
        request.form_is_formsly_form && [
            'Subcon', 'Request For Payment v1',
            'Petty Cash Voucher',
            'Petty Cash Voucher Balance',
            'Application Information v1',
            'Application Information',
            'General Assessment v1',
            'General Assessment',
            'Technical Assessment',
            'Evaluation Result',
            'Background Investigation'
          ].includes(request.form_name)
        )
      ) {
      const requestData = plv8.execute(`SELECT public.get_request($1)`, [requestId])[0].get_request;
      if (!request) throw new Error('404');
      returnData = {
        request: {
          ...requestData,
          isWithNextStep
        }
      };
      return;
    } else if (request.form_is_formsly_form && ['Personnel Transfer Requisition', 'Equipment Service Report', 'Request For Payment'].includes(request.form_name)) {
      const requestData = plv8.execute(`SELECT public.get_request_without_duplicatable_section($1)`, [requestId])[0].get_request_without_duplicatable_section;
      if(!request) throw new Error('404');

      const sectionIdWithDuplicatableSectionIdList = plv8.execute(
        `
          SELECT DISTINCT
            request_response_duplicatable_section_id,
            section_id,
            section_order
          FROM request_schema.request_response_table
          INNER JOIN form_schema.field_table ON field_id = request_response_field_id
          INNER JOIN form_schema.section_table ON section_id = field_section_id
          WHERE
            request_response_request_id = $1
          ORDER BY section_order
        `, [
          requestData.request_id
        ]
      );

      returnData =  {
        request: {
          ...requestData,
          isWithNextStep
        },
        sectionIdWithDuplicatableSectionIdList
      };
    } else {
      const requestData = plv8.execute(`SELECT public.get_request_without_duplicatable_section($1)`, [requestId])[0].get_request_without_duplicatable_section;
      if(!request) throw new Error('404');

      const duplicatableSectionIdList = plv8.execute(
        `
          SELECT DISTINCT(request_response_duplicatable_section_id)
          FROM request_schema.request_response_table
          WHERE
            request_response_request_id = $1
            AND request_response_duplicatable_section_id IS NOT NULL
        `, [
          requestData.request_id
        ]
      ).map(response => response.request_response_duplicatable_section_id);

      returnData =  {
        request: {
          ...requestData,
          isWithNextStep
        },
        duplicatableSectionIdList
      };
    }
  });
  return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_team_member_on_load(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let team_member_data;
  plv8.subtransaction(function(){
    const {
      teamMemberId
    } = input_data;

    const member = plv8.execute(
      `
        SELECT
          team_member_table.*,
          json_build_object(
            'user_id', user_id,
            'user_first_name', user_first_name,
            'user_last_name', user_last_name,
            'user_avatar', user_avatar,
            'user_email', user_email,
            'user_phone_number', user_phone_number,
            'user_username', user_username,
            'user_job_title', user_job_title,
            'user_employee_number', user_employee_number
          ) AS team_member_user
        FROM team_schema.team_member_table
        INNER JOIN user_schema.user_table 
          ON user_id = team_member_user_id
        LEFT JOIN user_schema.user_employee_number_table
          ON user_employee_number_user_id = user_id
          AND user_employee_number_is_disabled = false
        WHERE team_member_id = $1
      `, [
        teamMemberId
      ]
    )[0];

    const userValidId = plv8.execute(
      `
        SELECT * FROM user_schema.user_valid_id_table 
        WHERE 
          user_valid_id_user_id = $1
      `, [
        member.team_member_user.user_id
      ]
    )[0];

    const memberGroupToSelect = plv8.execute(
      `
        SELECT 
          tgmt2.team_group_member_id,
          tgt2.team_group_name 
        FROM team_schema.team_group_member_table tgmt2 
        INNER JOIN team_schema.team_group_table tgt2 
          ON tgt2.team_group_id = tgmt2.team_group_id 
        WHERE 
          tgmt2.team_member_id = $1
        ORDER BY tgt2.team_group_name ASC 
        LIMIT 10
      `, [
        teamMemberId
      ]
    );

    let groupList = []
    let groupCount = 0
    if (memberGroupToSelect.length) {
      const memberGroupToSelectArray = memberGroupToSelect.map(group => group.team_group_member_id);

      groupList = plv8.execute(
        `
          SELECT 
            tgmt.team_group_member_id,
            ( 
              SELECT row_to_json(tgt) 
              FROM team_schema.team_group_table tgt 
              WHERE 
                tgt.team_group_id = tgmt.team_group_id
            ) AS team_group 
          FROM team_schema.team_group_member_table tgmt 
          WHERE 
            tgmt.team_member_id = $1
            AND tgmt.team_group_member_id = ANY($2)
        `, [
          teamMemberId,
          memberGroupToSelectArray
        ]
      );

      groupCount = plv8.execute(
        `
          SELECT COUNT(*) FROM team_schema.team_group_member_table 
          WHERE 
            team_member_id = $1
        `, [
          teamMemberId
        ]
      )[0].count
    }

    const memberProjectToSelect = plv8.execute(
      `
        SELECT
          tpmt2.team_project_member_id,
          tpt2.team_project_name
        FROM team_schema.team_project_member_table tpmt2
        INNER JOIN team_schema.team_project_table tpt2 
          ON tpt2.team_project_id = tpmt2.team_project_id
        WHERE
          tpmt2.team_member_id = $1
        ORDER BY tpt2.team_project_name ASC
        LIMIT 10
      `, [
        teamMemberId
      ]
    );

    let projectList = []
    let projectCount = 0
    if (memberProjectToSelect.length > 0) {
      const memberProjectToSelectArray = memberProjectToSelect.map(project => project.team_project_member_id);

      projectList = plv8.execute(
        `
          SELECT
            tpmt.team_project_member_id,
            (
              SELECT row_to_json(tpt)
              FROM team_schema.team_project_table tpt
              WHERE
                tpt.team_project_id = tpmt.team_project_id
            ) AS team_project
            FROM team_schema.team_project_member_table tpmt
            WHERE
              tpmt.team_member_id = $1
              AND tpmt.team_project_member_id = ANY($2)
        `, [
          teamMemberId,
          memberProjectToSelectArray
        ]
      );

      projectCount = plv8.execute(
        `
          SELECT COUNT(*) 
          FROM team_schema.team_project_member_table 
          WHERE 
            team_member_id = $1
        `, [
          teamMemberId
        ]
      )[0].count
    }

    team_member_data = {
      member: member, 
      userValidId, 
      groupList, 
      groupCount: Number(groupCount), 
      projectList, 
      projectCount: Number(projectCount)
    }
  });
  return team_member_data;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_team_on_load(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let team_data;
  plv8.subtransaction(function(){
    const {
      userId,
      teamMemberLimit
    } = input_data;

    const teamId = plv8.execute(`SELECT public.get_user_active_team_id($1)`, [userId])[0].get_user_active_team_id;

    const team = plv8.execute(
      `
        SELECT 
          team_id, 
          team_name, 
          team_logo 
        FROM team_schema.team_table 
        WHERE 
          team_id = $1
          AND team_is_disabled = false
      `, [
        teamId
      ]
    )[0];

    const teamMembers = plv8.execute(
      `
        SELECT
          team_member_id,
          team_member_role,
          json_build_object(
            'user_id', user_id,
            'user_first_name', user_first_name,
            'user_last_name', user_last_name,
            'user_avatar', user_avatar,
            'user_email', user_email,
            'user_employee_number', user_employee_number
          ) AS team_member_user
        FROM team_schema.team_member_table
        JOIN user_schema.user_table 
          ON team_member_user_id = user_id
        LEFT JOIN user_schema.user_employee_number_table 
          ON user_employee_number_user_id = user_id
          AND user_employee_number_is_disabled = false
        WHERE
          team_member_team_id = $1
          AND team_member_is_disabled = false
          AND user_is_disabled = false
        ORDER BY
          CASE team_member_role
            WHEN 'OWNER' THEN 1
            WHEN 'ADMIN' THEN 2
            WHEN 'APPROVER' THEN 3
            WHEN 'MEMBER' THEN 4
          END ASC,
          user_first_name ASC,
          user_last_name ASC
        LIMIT $2
      `, [
        teamId ,
        teamMemberLimit
      ]
    );

    const teamMembersCount = plv8.execute(
      `
        SELECT COUNT(*)
        FROM team_schema.team_member_table
        JOIN user_schema.user_table 
          ON team_member_user_id = user_id
        WHERE
          team_member_team_id = $1
          AND team_member_is_disabled = false
          AND user_is_disabled = false
      `, [
        teamId
      ]
    )[0].count;

    const teamGroups = plv8.execute(
      `
        SELECT 
          team_group_id, 
          team_group_name, 
          team_group_team_id 
        FROM team_schema.team_group_table 
        WHERE 
          team_group_team_id = $1
          AND team_group_is_disabled = false 
        ORDER BY team_group_date_created DESC
        LIMIT 10
      `, [
        teamId
      ]
    );

    const teamGroupsCount = plv8.execute(
      `
        SELECT COUNT(*) 
        FROM team_schema.team_group_table 
        WHERE 
          team_group_team_id = $1
          AND team_group_is_disabled = false
      `, [
        teamId
      ]
    )[0].count;

    const teamProjects = plv8.execute(
      `
        SELECT
          team_project_table.*,
          boq.attachment_value AS team_project_boq_attachment_id,
          site_map.attachment_value AS team_project_site_map_attachment_id,
          address_table.*
        FROM team_schema.team_project_table
        LEFT JOIN public.attachment_table boq 
          ON (
            team_project_boq_attachment_id = boq.attachment_id
            AND boq.attachment_is_disabled = false
          )
        LEFT JOIN public.attachment_table site_map 
          ON (
            team_project_site_map_attachment_id = site_map.attachment_id
            AND site_map.attachment_is_disabled = false
          )
        LEFT JOIN public.address_table 
          ON (
            team_project_address_id = address_id
          )
        WHERE
          team_project_team_id = $1
          AND team_project_is_disabled = false
        ORDER BY team_project_name ASC
        LIMIT 10
      `, [
        teamId
      ]
    );

    const teamProjectsCount = plv8.execute(
      `
        SELECT COUNT(*) 
        FROM team_schema.team_project_table 
          WHERE team_project_team_id = $1
          AND team_project_is_disabled = false
      `, [
        teamId
      ]
    )[0].count;

    team_data = {
      team,
      teamMembers,
      teamGroups,
      teamGroupsCount: Number(teamGroupsCount),
      teamProjects: teamProjects.map(project => {
        if(!project.address_id){
          return project;
        }
        return {
          team_project_id: project.team_project_id,
          team_project_date_created: project.team_project_date_created,
          team_project_name: project.team_project_name,
          team_project_code: project.team_project_code,
          team_project_is_disabled: project.team_project_is_disabled,
          team_project_team_id: project.team_project_team_id,
          team_project_site_map_attachment_id: project.team_project_site_map_attachment_id,
          team_project_boq_attachment_id: project.team_project_boq_attachment_id,
          team_project_address_id: project.team_project_address_id,
          team_project_address: {
            address_id: project.address_id,
            address_date_created: project.address_date_created,
            address_region: project.address_region,
            address_province: project.address_province,
            address_city: project.address_city,
            address_barangay: project.address_barangay,
            address_street: project.address_street,
            address_zip_code: project.address_zip_code
          }
        }
      }),
      teamProjectsCount: Number(teamProjectsCount),
      teamMembersCount: Number(teamMembersCount),
      pendingValidIDList: []
    }
  });
  return team_data;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_team_member_with_filter(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let team_data;
  plv8.subtransaction(function(){
    const {
      teamId,
      page,
      limit,
      search
    } = input_data;

    const start = (page - 1) * limit;

    const searchCondition = `
      AND (
        CONCAT(user_first_name, ' ', user_last_name) ILIKE '%${search}%'
        OR user_email ILIKE '%${search}%'
      )
    `
    const teamMembers = plv8.execute(
      `
        SELECT
          team_member_id,
          team_member_role,
          json_build_object(
            'user_id', user_id,
            'user_first_name', user_first_name,
            'user_last_name', user_last_name,
            'user_avatar', user_avatar,
            'user_email', user_email,
            'user_employee_number', user_employee_number
          ) AS team_member_user
        FROM team_schema.team_member_table 
        INNER JOIN user_schema.user_table 
          ON team_member_user_id = user_id
          AND user_is_disabled = false
          ${searchCondition}
        LEFT JOIN user_schema.user_employee_number_table 
          ON user_employee_number_user_id = user_id
          AND user_employee_number_is_disabled = false
        WHERE
          team_member_team_id = $1
          AND team_member_is_disabled = false
        ORDER BY
          CASE team_member_role
            WHEN 'OWNER' THEN 1
            WHEN 'ADMIN' THEN 2
            WHEN 'APPROVER' THEN 3
            WHEN 'MEMBER' THEN 4
          END ASC,
          user_first_name ASC,
          user_last_name ASC
        OFFSET $2
        LIMIT $3
      `, [
        teamId,
        start,
        limit
      ]
    );

    const teamMembersCount = plv8.execute(
      `
        SELECT COUNT(*)
        FROM team_schema.team_member_table 
        INNER JOIN user_schema.user_table
          ON team_member_user_id = user_id
          AND user_is_disabled = false
          ${searchCondition}
        WHERE
          team_member_team_id = $1
          AND team_member_is_disabled = false
      `, [
        teamId
      ]
    )[0].count;

    team_data = { 
      teamMembers, 
      teamMembersCount: Number(teamMembersCount) 
    }
  });
  return team_data;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_notification_on_load(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let notification_data;
  plv8.subtransaction(function(){
    const {
      userId,
      app,
      page,
      limit,
      unreadOnly
    } = input_data;

    const teamId = plv8.execute(`SELECT public.get_user_active_team_id($1)`, [userId])[0].get_user_active_team_id;
    const start = (page - 1) * limit;

    const notificationList = plv8.execute(
      `
        SELECT * 
        FROM public.notification_table
        WHERE 
          notification_user_id = $1
          AND (
            notification_app = 'GENERAL' 
            OR notification_app = $2
          ) 
          AND (
            notification_team_id IS NULL
            OR notification_team_id = $3
          )
          AND notification_is_read = ANY($4)
        ORDER BY notification_date_created DESC 
        LIMIT $5
        OFFSET $6
      `, [
        userId,
        app,
        teamId,
        [!unreadOnly, false],
        limit,
        start
      ]
    );

    const totalNotificationCount = plv8.execute(
      `
        SELECT * 
        FROM public.notification_table
        WHERE 
          notification_user_id = $1
          AND (
            notification_app = 'GENERAL' 
            OR notification_app = $2
          ) 
          AND (
            notification_team_id IS NULL
            OR notification_team_id = $3
          )
          AND notification_is_read = ANY($4)
        ORDER BY notification_date_created DESC 
      `, [
        userId,
        app,
        teamId,
        [!unreadOnly, false]
      ]
    )[0].count;

    notification_data = {
      notificationList, 
      totalNotificationCount: Number(totalNotificationCount), 
      tab: unreadOnly ? "unread" : "all"
    }
  });
  return notification_data;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_ssot_on_load(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let ssot_data;
  plv8.subtransaction(function(){
    const {
      userId,
      app,
      page,
      limit,
      unreadOnly
    } = input_data;

    const teamId = plv8.execute(`SELECT public.get_user_active_team_id($1)`, [userId])[0].get_user_active_team_id;

    const itemList = plv8.execute(
      `
        SELECT item_general_name
        FROM item_schema.item_table 
        WHERE item_team_id = $1
          AND item_is_disabled = false 
          AND item_is_available = true 
        ORDER BY item_general_name ASC
      `, [
        teamId
      ]
    );

    const projectList = plv8.execute(
      `
        SELECT team_project_name
        FROM team_schema.team_project_table 
        WHERE 
          team_project_team_id = $1
          AND team_project_is_disabled = false 
        ORDER BY team_project_name ASC
      `, [
        teamId
      ]
    );

    const itemNameList = itemList.map(item => item.item_general_name);
    const projectNameList = projectList.map(project => project.team_project_name);

    ssot_data = { 
      itemNameList, 
      projectNameList 
    }
  });
  return ssot_data;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_request_list_on_load(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let request_data;
  plv8.subtransaction(function(){
    const {
      userId
    } = input_data;

    const teamId = plv8.execute(`SELECT public.get_user_active_team_id($1)`, [userId])[0].get_user_active_team_id;

    const isFormslyTeam = plv8.execute(
      `
        SELECT EXISTS (
          SELECT 1
          FROM form_schema.form_table 
          INNER JOIN team_schema.team_member_table 
            ON form_team_member_id = team_member_id 
          WHERE 
            team_member_team_id = $1
            AND form_is_formsly_form = true
        )
      `, [
        teamId
      ]
    )[0].exists;

    const projectList = plv8.execute(
      `
        SELECT 
          team_project_name, 
          team_project_code 
        FROM team_schema.team_project_table 
        WHERE 
          team_project_is_disabled = false
          AND team_project_team_id = $1
      `, [
        teamId
      ]
    );

    request_data = {
      isFormslyTeam,
      projectList
    }
  });
  return request_data;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION form_list_page_on_load(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      userId,
      limit
    } = input_data;

    const teamId = plv8.execute(`SELECT public.get_user_active_team_id($1)`, [userId])[0].get_user_active_team_id;

    const formList = plv8.execute(
      `
        SELECT
          form_table.*,
          team_member_table.*,
          user_id,
          user_first_name,
          user_last_name,
          user_avatar
        FROM form_schema.form_table
        INNER JOIN team_schema.team_member_table 
          ON team_member_id = form_team_member_id
          AND team_member_team_id = $1
        INNER JOIN user_schema.user_table 
          ON user_id = team_member_user_id
        WHERE
          form_is_disabled = false
          AND form_app = 'REQUEST'
        LIMIT $2
      `, [
        teamId,
        limit
      ]
    );

    const formListCount = plv8.execute(
      `
        SELECT COUNT(*)
        FROM form_schema.form_table
        INNER JOIN team_schema.team_member_table 
          ON team_member_id = form_team_member_id
          AND team_member_team_id = $1
        INNER JOIN user_schema.user_table 
          ON user_id = team_member_user_id
        WHERE
          form_is_disabled = false
          AND form_app = 'REQUEST'
      `, [
        teamId
      ]
    )[0].count;

    returnData = {
      formList: formList.map(form => {
        return {
          form_app: form.form_app,
          form_date_created: form.form_date_created,
          form_description: form.form_description,
          form_id: form.form_id,
          form_is_disabled: form.form_is_disabled,
          form_is_for_every_member: form.form_is_for_every_member,
          form_is_formsly_form: form.form_is_formsly_form,
          form_is_hidden: form.form_is_hidden,
          form_is_signature_required: form.form_is_signature_required,
          form_name: form.form_name,
          form_team_member_id: form.form_team_member_id,
          form_team_member: {
            team_member_date_created: form.team_member_date_created,
            team_member_id: form.team_member_id,
            team_member_is_disabled: form.team_member_is_disabled,
            team_member_role: form.team_member_role,
            team_member_team_id: form.team_member_team_id,
            team_member_user_id: form.team_member_user_id,
            team_member_user: {
              user_id: form.user_id,
              user_first_name: form.user_first_name,
              user_last_name: form.user_last_name,
              user_avatar: form.user_avatar,
            }
          }
        }
      }),
      formListCount: Number(formListCount),
      teamId
    }
  });
  return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION build_form_page_on_load(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      userId
    } = input_data;

    const teamId = plv8.execute(`SELECT public.get_user_active_team_id($1)`, [userId])[0].get_user_active_team_id;
    const groupList = plv8.execute(
      `
        SELECT * 
        FROM team_schema.team_group_table 
        WHERE 
          team_group_team_id = $1
          AND team_group_is_disabled = false
      `, [
        teamId
      ]
    );
    const formId = plv8.execute('SELECT extensions.uuid_generate_v4()')[0].uuid_generate_v4;
    returnData = {
      groupList,
      formId
    }
  });
  return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION form_page_on_load(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      userId,
      isFormslyForm,
      formName,
      limit
    } = input_data;

    const teamId = plv8.execute(`SELECT public.get_user_active_team_id($1)`, [userId])[0].get_user_active_team_id;
    const teamGroupList = plv8.execute(
      `
        SELECT 
          team_group_id,
          team_group_name
        FROM team_schema.team_group_table
        WHERE 
          team_group_team_id = $1
          AND team_group_is_disabled = false
      `, [
        teamId
      ]
    );

    if(isFormslyForm){
      const teamProjectList = plv8.execute(
        `
          SELECT 
            team_project_id, 
            team_project_name 
          FROM team_schema.team_project_table 
          WHERE 
            team_project_team_id = $1
            AND team_project_is_disabled = false 
          ORDER BY team_project_name ASC 
          LIMIT $2
        `, [
          teamId,
          limit
        ]
      );
      const teamProjectListCount = plv8.execute(
        `
          SELECT COUNT(*) 
          FROM team_schema.team_project_table 
          WHERE 
            team_project_team_id = $1
            AND team_project_is_disabled = false
        `, [
          teamId
        ]
      )[0].count;

      returnData = {
        teamGroupList,
        teamProjectList,
        teamProjectListCount: Number(teamProjectListCount)
      }
    } else {
      returnData = {
        teamGroupList
      }
    }
  });
  return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION create_request_page_on_load(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      formId,
      userId,
      connectedRequestFormslyId
    } = input_data;

    const teamId = plv8.execute(`SELECT public.get_user_active_team_id($1)`, [userId])[0].get_user_active_team_id;
    if (!teamId) throw new Error("No team found");

    const teamMember = plv8.execute(
      `
        SELECT * 
        FROM team_schema.team_member_table 
        WHERE 
          team_member_user_id = $1
          AND team_member_team_id = $2
      `, [
        userId,
        teamId
      ]
    )[0];
    if (!teamMember) throw new Error("No team member found");

    const formData = plv8.execute(
      `
        WITH form_data AS (
          SELECT *
          FROM form_schema.form_table
          WHERE
            form_id = $1
          LIMIT 1
        )
        SELECT jsonb_build_object(
          'form_id', form_id,
          'form_name', form_name,
          'form_description', form_description,
          'form_date_created', form_date_created,
          'form_is_hidden', form_is_hidden,
          'form_is_formsly_form', form_is_formsly_form,
          'form_is_for_every_member', form_is_for_every_member,
          'form_type', form_type,
          'form_sub_type', form_sub_type,
          'form_team_member', (
            SELECT jsonb_build_object(
              'team_member_id', team_member_id,
              'team_member_user', (
                SELECT jsonb_build_object(
                  'user_id', user_id,
                  'user_first_name', user_first_name,
                  'user_last_name', user_last_name,
                  'user_avatar', user_avatar,
                  'user_username', user_username
                )
                FROM user_schema.user_table
                WHERE
                  user_id = team_member_user_id
              )
            )
            FROM team_schema.team_member_table
            WHERE 
              team_member_id = form_team_member_id
          ),
          'form_signer', COALESCE(
            (
              SELECT jsonb_agg (
                jsonb_build_object (
                  'signer_id', signer_id,
                  'signer_is_primary_signer', signer_is_primary_signer,
                  'signer_action', signer_action,
                  'signer_order', signer_order,
                  'signer_is_disabled', signer_is_disabled,
                  'signer_team_project_id', signer_team_project_id,
                  'signer_team_member', (
                    jsonb_build_object (
                      'team_member_id', team_member_id,
                      'team_member_user', (
                        jsonb_build_object (
                          'user_id', user_id,
                          'user_first_name', user_first_name,
                          'user_last_name', user_last_name,
                          'user_avatar', user_avatar
                        )
                      )
                    )
                  )
                )
              )
              FROM form_schema.signer_table
              INNER JOIN team_schema.team_member_table 
                ON team_member_id = signer_team_member_id
              INNER JOIN user_schema.user_table 
                ON user_id = team_member_user_id
              WHERE
                signer_form_id = form_id
                AND signer_is_disabled = false
                AND signer_team_project_id IS NULL
                AND signer_is_requester_signer = false
            ), '[]'::jsonb
          ),
          'form_section', (
            SELECT jsonb_agg (
              jsonb_build_object (
                'section_id', section_id,
                'section_name', section_name,
                'section_order', section_order,
                'section_is_duplicatable', section_is_duplicatable,
                'section_form_id', section_form_id,
                'section_field', (
                  SELECT jsonb_agg (
                    jsonb_build_object (
                      'field_id', field_id,
                      'field_name', field_name,
                      'field_is_required', field_is_required,
                      'field_type', field_type,
                      'field_order', field_order,
                      'field_is_positive_metric', field_is_positive_metric,
                      'field_is_read_only', field_is_read_only,
                      'field_section_id', field_section_id,
                      'field_special_field_template_id', field_special_field_template_id,
                      'field_option', COALESCE(
                        (
                          SELECT jsonb_agg (
                            jsonb_build_object (
                              'option_id', option_id,
                              'option_value', option_value,
                              'option_order', option_order,
                              'option_field_id', option_field_id
                            )
                            ORDER BY option_order ASC
                          )
                          FROM form_schema.option_table
                          WHERE 
                            option_field_id = field_id
                        ), '[]'::jsonb
                      )
                    )
                    ORDER BY field_order ASC
                  )
                  FROM (
                    SELECT *
                    FROM form_schema.field_table
                    WHERE
                      field_section_id = section_id
                    ORDER BY field_order ASC
                    LIMIT 
                      CASE 
                        WHEN form_name = 'Item' THEN 10
                        WHEN form_name = 'PED Item' THEN 7
                        WHEN form_name = 'IT Asset'  THEN 10
                        WHEN form_name = 'Practical Test' AND section_name = 'Quantitative Assessment' THEN 0
                        ELSE NULL
                      END
                  ) limited_fields
                )
              )
              ORDER BY section_order ASC
            )
            FROM form_schema.section_table
            WHERE 
              section_form_id = form_id
          )
        )
        FROM form_data
      `, [
        formId
      ]
    )[0].jsonb_build_object;

    const section = formData.form_section.map(section => {
      const sectionField = section.section_field.map(field => {
        let optionData = field.field_option;
        if (field.field_special_field_template_id) {
          switch (field.field_special_field_template_id) {
            case "c3a2ab64-de3c-450f-8631-05f4cc7db890":
              const teamMemberList = plv8.execute(
                `
                  SELECT 
                    user_id,
                    user_first_name,
                    user_last_name 
                  FROM team_schema.team_member_table 
                  INNER JOIN user_schema.user_table 
                    ON user_id = team_member_user_id 
                  WHERE 
                    team_member_team_id = $1
                  ORDER BY user_last_name
                `, [
                  teamId
                ]
              );
              optionData = teamMemberList.map((item, index) => ({
                option_id: item.user_id,
                option_value: item.user_last_name + ', ' + item.user_first_name,
                option_order: index,
                option_field_id: field.field_id
              }));
              break;
            case "ff007180-4367-4cf2-b259-7804867615a7":
              const csiCodeList = plv8.execute(
                `
                  SELECT 
                    csi_code_id,
                    csi_code_section 
                  FROM lookup_schema.csi_code_table 
                  LIMIT 1000
                `
              );
              optionData = csiCodeList.map((item, index) => ({
                option_id: item.csi_code_id,
                option_value: item.csi_code_section,
                option_order: index,
                option_field_id: field.field_id
              }));
              break;
          }
        } 

        return {
          ...field,
          field_option: optionData
        };
      })

      return {
        ...section,
        section_field: sectionField
      }
    }
      
    );
    const form = {
      ...formData,
      form_section: section
    }

    if (!form.form_is_formsly_form) {
      returnData = { form };
      return;
    }

    const getProjectOptions = (teamMemberId) => {
      const projects = plv8.execute(
        `
          SELECT
            team_project_table.team_project_id,
            team_project_table.team_project_name
          FROM team_schema.team_project_member_table
          INNER JOIN team_schema.team_project_table 
            ON team_project_table.team_project_id = team_project_member_table.team_project_id
          WHERE
            team_member_id = $1
            AND team_project_is_disabled = false
          ORDER BY team_project_name
        `, [
          teamMemberId
        ]
      );
      return projects;
    }

    const getDepartmentOptions = () => {
      const departments = plv8.execute(
        `
          SELECT
            team_department_id,
            team_department_name
          FROM team_schema.team_department_table
          WHERE
            team_department_is_disabled = false
          ORDER BY team_department_name
        `
      );
      return departments;
    }

    const getConnectedRequest = (connectedRequestFormslyId) => {
      const splitFormslyId = connectedRequestFormslyId.split('-');
      const connectedRequest = plv8.execute(
        `
          SELECT
            request_id,
            request_form_id,
            request_project_id,
            request_team_member_id
          FROM
            request_schema.request_table
          WHERE
            request_formsly_id_prefix = $1
            AND request_formsly_id_serial = $2
          LIMIT 1
        `, [
          splitFormslyId[0],
          splitFormslyId[1]
        ]
      )[0];
      if (!connectedRequest) {
        throw new Error('Request id not found');
      }
      return connectedRequest;
    }

    if (form.form_name === "Item") {
      const projects = getProjectOptions(teamMember.team_member_id);
      const projectOptions = projects.map((project, index) => {
        return {
          option_field_id: form.form_section[0].section_field[0].field_id,
          option_id: project.team_project_id,
          option_order: index,
          option_value: project.team_project_name,
        };
      });

      returnData = {
        form: {
          ...form,
          form_section: [
            {
              ...form.form_section[0],
              section_field: [
                {
                  ...form.form_section[0].section_field[0],
                  field_option: projectOptions,
                },
                ...form.form_section[0].section_field.slice(1),
              ],
            },
            form.form_section[1]
          ],
        },
        projectOptions
      }
      return;
    } else if (form.form_name === "Services") {
      const projects = getProjectOptions(teamMember.team_member_id);
      const projectOptions = projects.map((project, index) => {
        return {
          option_field_id: form.form_section[0].section_field[0].field_id,
          option_id: project.team_project_id,
          option_order: index,
          option_value: project.team_project_name,
        };
      });

      const categories = plv8.execute(
        `
          SELECT
            service_category_id,
            service_category
          FROM service_schema.service_category_table
          WHERE
            service_category_team_id = $1
            AND service_category_is_disabled = false
            AND service_category_is_available = true
          ORDER BY service_category
        `, [
          teamMember.team_member_team_id
        ]
      );
      const categoryOptions = categories.map((category, index) => {
        return {
          option_field_id: form.form_section[1].section_field[0].field_id,
          option_id: category.service_category_id,
          option_order: index,
          option_value: category.service_category,
        };
      });

      const csiDivisions = plv8.execute(
        `
          SELECT
            csi_code_division_id,
            csi_code_division_description
          FROM public.distinct_division_view
        `
      );
      const csiDivisionOption = csiDivisions.map((division, index) => {
        return {
          option_field_id: form.form_section[1].section_field[4].field_id,
          option_id: division.csi_code_division_description,
          option_order: index,
          option_value: division.csi_code_division_description,
        };
      });

      const unitOfMeasurements = plv8.execute(
        `
          SELECT
            general_unit_of_measurement_id,
            general_unit_of_measurement
          FROM unit_of_measurement_schema.general_unit_of_measurement_table
          WHERE
            general_unit_of_measurement_team_id = $1
            AND general_unit_of_measurement_is_disabled = false
            AND general_unit_of_measurement_is_available = true
          ORDER BY general_unit_of_measurement
        `, [
          teamMember.team_member_team_id
        ]
      );
      const unitOfMeasurementOptions = unitOfMeasurements.map((uom, index) => {
        return {
          option_field_id: form.form_section[1].section_field[3].field_id,
          option_id: uom.general_unit_of_measurement_id,
          option_order: index,
          option_value: uom.general_unit_of_measurement,
        };
      });

      returnData = {
        form: {
          ...form,
          form_section: [
            {
              ...form.form_section[0],
              section_field: [
                {
                  ...form.form_section[0].section_field[0],
                  field_option: projectOptions,
                },
                ...form.form_section[0].section_field.slice(1),
              ],
            },
            {
              ...form.form_section[1],
              section_field: [
                {
                  ...form.form_section[1].section_field[0],
                  field_option: categoryOptions
                },
                ...form.form_section[1].section_field.slice(1, 3),
                  {
                  ...form.form_section[1].section_field[3],
                  field_option: unitOfMeasurementOptions
                },
                {
                  ...form.form_section[1].section_field[4],
                  field_option: csiDivisionOption
                },
                ...form.form_section[1].section_field.slice(5, 10),
              ],
            },
          ],
        },
        projectOptions,
      }
      return;
    } else if (form.form_name === "Other Expenses") {
      const projects = getProjectOptions(teamMember.team_member_id);
      const projectOptions = projects.map((project, index) => {
        return {
          option_field_id: form.form_section[0].section_field[0].field_id,
          option_id: project.team_project_id,
          option_order: index,
          option_value: project.team_project_name,
        };
      });

      const categories = plv8.execute(
        `
          SELECT
            other_expenses_category_id,
            other_expenses_category
          FROM other_expenses_schema.other_expenses_category_table
          WHERE
            other_expenses_category_team_id = $1
            AND other_expenses_category_is_disabled = false
            AND other_expenses_category_is_available = true
          ORDER BY other_expenses_category
        `, [
          teamMember.team_member_team_id
        ]
      );
      const categoryOptions = categories.map((category, index) => {
        return {
          option_field_id: form.form_section[1].section_field[0].field_id,
          option_id: category.other_expenses_category_id,
          option_order: index,
          option_value: category.other_expenses_category,
        };
      });

      const csiCodeDescription = plv8.execute(
        `
          SELECT
            csi_code_id,
            csi_code_level_three_description
          FROM lookup_schema.csi_code_table
          WHERE csi_code_division_id = '01'
          ORDER BY csi_code_level_three_description
        `
      );
      const csiCodeDescriptionOptions = csiCodeDescription.map((codDescription, index) => {
        return {
          option_field_id: form.form_section[1].section_field[5].field_id,
          option_id: codDescription.csi_code_id,
          option_order: index,
          option_value: codDescription.csi_code_level_three_description,
        };
      });

      const unitOfMeasurements = plv8.execute(
        `
          SELECT
            general_unit_of_measurement_id,
            general_unit_of_measurement
          FROM unit_of_measurement_schema.general_unit_of_measurement_table
          WHERE
            general_unit_of_measurement_team_id = $1
            AND general_unit_of_measurement_is_disabled = false
            AND general_unit_of_measurement_is_available = true
          ORDER BY general_unit_of_measurement
        `, [
          teamMember.team_member_team_id
        ]
      );
      const unitOfMeasurementOptions = unitOfMeasurements.map((uom, index) => {
        return {
          option_field_id: form.form_section[1].section_field[4].field_id,
          option_id: uom.general_unit_of_measurement_id,
          option_order: index,
          option_value: uom.general_unit_of_measurement,
        };
      });

      returnData = {
        form: {
          ...form,
          form_section: [
            {
              ...form.form_section[0],
              section_field: [
                {
                  ...form.form_section[0].section_field[0],
                  field_option: projectOptions,
                },
                ...form.form_section[0].section_field.slice(1),
              ],
            },
            {
              ...form.form_section[1],
              section_field: [
                {
                  ...form.form_section[1].section_field[0],
                  field_option: categoryOptions
                },
                ...form.form_section[1].section_field.slice(1, 4),
                  {
                  ...form.form_section[1].section_field[4],
                  field_option: unitOfMeasurementOptions
                },
                {
                  ...form.form_section[1].section_field[5],
                  field_option: csiCodeDescriptionOptions
                },
                ...form.form_section[1].section_field.slice(6, 10)
              ],
            },
          ],
        },
        projectOptions,
      }
      return;
    } else if (form.form_name === "PED Equipment") {
      const projects = getProjectOptions(teamMember.team_member_id);
      const projectOptions = projects.map((project, index) => {
        return {
          option_field_id: form.form_section[0].section_field[0].field_id,
          option_id: project.team_project_id,
          option_order: index,
          option_value: project.team_project_name,
        };
      });

      const categories = plv8.execute(
        `
          SELECT
            equipment_category_id,
            equipment_category
          FROM equipment_schema.equipment_category_table
          WHERE
            equipment_category_team_id = $1
            AND equipment_category_is_disabled = false
            AND equipment_category_is_available = true
          ORDER BY equipment_category
        `, [
          teamMember.team_member_team_id
        ]
      );
      const categoryOptions = categories.map((category, index) => {
        return {
          option_field_id: form.form_section[1].section_field[0].field_id,
          option_id: category.equipment_category_id,
          option_order: index,
          option_value: category.equipment_category,
        };
      });

      const capacityUoM = plv8.execute(
        `
          SELECT
            capacity_unit_of_measurement_id,
            capacity_unit_of_measurement
          FROM unit_of_measurement_schema.capacity_unit_of_measurement_table
          WHERE
            capacity_unit_of_measurement_team_id = $1
            AND capacity_unit_of_measurement_is_disabled = false
            AND capacity_unit_of_measurement_is_available = true
          ORDER BY capacity_unit_of_measurement
        `, [
          teamMember.team_member_team_id
        ]
      );
      const capacityUoMOptions = capacityUoM.map((uom, index) => {
        return {
          option_field_id: form.form_section[1].section_field[5].field_id,
          option_id: uom.capacity_unit_of_measurement_id,
          option_order: index,
          option_value: uom.capacity_unit_of_measurement,
        };
      });

      returnData = {
        form: {
          ...form,
          form_section: [
            {
              ...form.form_section[0],
              section_field: [
                {
                  ...form.form_section[0].section_field[0],
                  field_option: projectOptions,
                },
                ...form.form_section[0].section_field.slice(1),
              ],
            },
            {
              ...form.form_section[1],
              section_field: [
                {
                  ...form.form_section[1].section_field[0],
                  field_option: categoryOptions
                },
                ...form.form_section[1].section_field.slice(1, 5),
                {
                  ...form.form_section[1].section_field[5],
                  field_option: capacityUoMOptions
                },
                ...form.form_section[1].section_field.slice(6),
              ],
            },
          ],
        },
        projectOptions,
        categoryOptions
      }
      return;
    } else if (form.form_name === "PED Part") {
      const projects = getProjectOptions(teamMember.team_member_id);
      const projectOptions = projects.map((project, index) => {
        return {
          option_field_id: form.form_section[0].section_field[0].field_id,
          option_id: project.team_project_id,
          option_order: index,
          option_value: project.team_project_name,
        };
      });

      const categories = plv8.execute(
        `
          SELECT
            equipment_category_id,
            equipment_category
          FROM equipment_schema.equipment_category_table
          WHERE
            equipment_category_team_id = $1
            AND equipment_category_is_disabled = false
            AND equipment_category_is_available = true
          ORDER BY equipment_category
        `, [
          teamMember.team_member_team_id
        ]
      );
      const categoryOptions = categories.map((category, index) => {
        return {
          option_field_id: form.form_section[0].section_field[2].field_id,
          option_id: category.equipment_category_id,
          option_order: index,
          option_value: category.equipment_category,
        };
      });

      returnData = {
        form: {
          ...form,
          form_section: [
            {
              ...form.form_section[0],
              section_field: [
                {
                  ...form.form_section[0].section_field[0],
                  field_option: projectOptions,
                },
                {
                  ...form.form_section[0].section_field[1]
                },
                {
                  ...form.form_section[0].section_field[2],
                  field_option: categoryOptions,
                },
                ...form.form_section[0].section_field.slice(3),
              ],
            },
            {
              ...form.form_section[1],
            },
          ],
        },
        projectOptions,
        categoryOptions
      }
      return;
    } else if (form.form_name === "PED Item") {
      const projects = getProjectOptions(teamMember.team_member_id);
      const projectOptions = projects.map((project, index) => {
        return {
          option_field_id: form.form_section[0].section_field[0].field_id,
          option_id: project.team_project_id,
          option_order: index,
          option_value: project.team_project_name,
        };
      });

      returnData = {
        form: {
          ...form,
          form_section: [
            {
              ...form.form_section[0],
              section_field: [
                {
                  ...form.form_section[0].section_field[0],
                  field_option: projectOptions,
                },
                ...form.form_section[0].section_field.slice(1),
              ],
            },
            form.form_section[1]
          ],
        },
        projectOptions
      }
      return;
    } else if (form.form_name === "Request For Payment v1") {
      const projects = getProjectOptions(teamMember.team_member_id);
      const projectOptions = projects.map((project, index) => {
        return {
          option_field_id: form.form_section[0].section_field[0].field_id,
          option_id: project.team_project_id,
          option_order: index,
          option_value: project.team_project_name,
        };
      });

      returnData = {
        form: {
          ...form,
          form_section: [
            {
              ...form.form_section[0],
              section_field: [
                {
                  ...form.form_section[0].section_field[0],
                  field_option: projectOptions,
                },
                ...form.form_section[0].section_field.slice(1),
              ],
            },
            {
              ...form.form_section[1]
            }
          ],
        },
        projectOptions,
      }
      return;
    } else if (form.form_name === "IT Asset") {
      const projects = getProjectOptions(teamMember.team_member_id);
      const projectOptions = projects.map((project, index) => {
        return {
          option_field_id: form.form_section[0].section_field[0].field_id,
          option_id: project.team_project_id,
          option_order: index,
          option_value: project.team_project_name,
        };
      });

      const departments = getDepartmentOptions();
      const departmentOptions = departments.map((department, index) => {
        return {
          option_field_id: form.form_section[0].section_field[2].field_id,
          option_id: department.team_department_id,
          option_order: index,
          option_value: department.team_department_name
        }
      });

      const firstSectionFieldList = form.form_section[0].section_field.map((field) => {
        if (field.field_name === 'Requesting Project') {
          return {
            ...field,
            field_option: projectOptions
          }
        } else if (field.field_name === 'Department') {
          return {
            ...field,
            field_option: departmentOptions,
          }
        } else {
          return field;
        }
      });

      const assigneeSectionFieldList = form.form_section[2].section_field.filter((field) => field.field_order !== 0);

      returnData = {
        form: {
          ...form,
          form_section: [
            {
              ...form.form_section[0],
              section_field: firstSectionFieldList,
            },
            {
              ...form.form_section[1]
            },
            {
              ...form.form_section[2],
              section_field: assigneeSectionFieldList,
            }
          ],
        },
        projectOptions
      }
      return;
    } else if (form.form_name === "Personnel Transfer Requisition") {
      const projects = getProjectOptions(teamMember.team_member_id);
      const projectOptions = projects.map((project, index) => {
        return {
          option_field_id: form.form_section[0].section_field[0].field_id,
          option_id: project.team_project_id,
          option_order: index,
          option_value: project.team_project_name,
        };
      });

      returnData = {
        form,
        projectOptions
      }
      return;
    } else if (form.form_name === "Liquidation Reimbursement") {
      const projects = getProjectOptions(teamMember.team_member_id);
      const projectOptions = projects.map((project, index) => {
        return {
          option_field_id: form.form_section[0].section_field[0].field_id,
          option_id: project.team_project_id,
          option_order: index,
          option_value: project.team_project_name,
        };
      });

      const departments = getDepartmentOptions();
      const departmentOptions = departments.map((department, index) => {
        return {
          option_field_id: form.form_section[0].section_field[2].field_id,
          option_id: department.team_department_id,
          option_order: index,
          option_value: department.team_department_name
        }
      });

      const bankList = plv8.execute(
        `
          SELECT *
            FROM lookup_schema.bank_list_table
          ORDER BY bank_label
        `
      );
      const bankListOptions = bankList.map((bank, index) => {
        return {
          option_field_id: form.form_section[2].section_field[0].field_id,
          option_id: bank.bank_id,
          option_order: index,
          option_value: bank.bank_label
        }
      });

      const firstSectionFieldList = form.form_section[0].section_field.map((field) => {
        let currentField = field;
        switch(currentField.field_id) {
          case 'ef1ca48b-89a7-4f9f-9430-1658284e18cf':
            currentField.field_option = projectOptions;
            break;
          case '041579d9-aff1-4508-a5a7-ac20e7bc7cb7':
            currentField.field_option = departmentOptions;
            break;
        };
        return currentField;
      });

      const filteredRequestDetailsField = ['BOQ Code', 'Equipment Code'];

      returnData = {
        form: {
          ...form,
          form_section: [
            {
              ...form.form_section[0],
              section_field: firstSectionFieldList.filter((field) => !filteredRequestDetailsField.includes(field.field_name)),
            },
            form.form_section[1],
            form.form_section[2]
          ],
        },
        projectOptions,
        bankListOptions
      }
      return;
    } else if (form.form_name === "Bill of Quantity" && connectedRequestFormslyId) {
      const connectedRequest = getConnectedRequest(connectedRequestFormslyId);

      const duplicatableSectionIdList = plv8.execute(
        `
          SELECT DISTINCT(request_response_duplicatable_section_id)
          FROM request_schema.request_response_table
          WHERE
            request_response_request_id = $1
            AND request_response_duplicatable_section_id IS NOT NULL
        `, [
          connectedRequest.request_id
        ]
      ).map(response => response.request_response_duplicatable_section_id);

      const connectedRequestPayeeSectionId = plv8.execute(
        `
          SELECT
            section_id
          FROM
            form_schema.section_table
          WHERE
            section_form_id = $1
            AND section_name = 'Payee'
        `, [
          connectedRequest.request_form_id
        ]
      )[0].section_id;

      let signerList = []

      const hasSpecialSigner = plv8.execute(
        `
          SELECT requester_primary_signer_signer_id
          FROM form_schema.requester_primary_signer_table
          INNER JOIN form_schema.signer_table 
            ON signer_id = requester_primary_signer_signer_id
          WHERE
            requester_team_member_id = $1
            AND signer_form_id = $2
        `, [
          connectedRequest.request_team_member_id,
          form.form_id
        ]
      )[0];

      if (hasSpecialSigner) {
        signerList = plv8.execute(
          `
            SELECT
              signer_id,
              signer_is_primary_signer,
              signer_action,
              signer_order,
              team_member_id,
              user_id,
              user_first_name,
              user_last_name,
              user_avatar
            FROM form_schema.signer_table
            INNER JOIN team_schema.team_member_table ON team_member_id = signer_team_member_id
            INNER JOIN user_schema.user_table ON user_id = team_member_user_id
            WHERE
              signer_id = $1
          `, [
            hasSpecialSigner.requester_primary_signer_signer_id
          ]
        );
      } else {
        signerList = plv8.execute(
          `
            SELECT
              signer_id,
              signer_is_primary_signer,
              signer_action,
              signer_order,
              team_member_id,
              user_id,
              user_first_name,
              user_last_name,
              user_avatar
            FROM form_schema.signer_table
            INNER JOIN team_schema.team_member_table ON team_member_id = signer_team_member_id
            INNER JOIN user_schema.user_table ON user_id = team_member_user_id
            WHERE
              signer_is_disabled = false
              AND signer_form_id = $1
              AND signer_team_project_id = $2
            ORDER BY signer_order
          `, [
            form.form_id,
            connectedRequest.request_project_id
          ]
        );
      }

      const formattedSignerList = signerList.map(signer => {
        return {
          signer_id: signer.signer_id,
          signer_is_primary_signer: signer.signer_is_primary_signer,
          signer_action: signer.signer_action,
          signer_order: signer.signer_order,
          signer_team_member: {
            team_member_id: signer.team_member_id,
            team_member_user: {
              user_id: signer.user_id,
              user_first_name: signer.user_first_name,
              user_last_name: signer.user_last_name,
              user_avatar: signer.user_avatar,
            }
          }
        }
      });

      returnData = {
        form: {
          ...form,
          form_signer: formattedSignerList
        },
        connectedRequest: {
          ...connectedRequest,
          form_section: [connectedRequestPayeeSectionId],
          duplicatableSectionIdList
        }
      };
      return;
    } else if (form.form_name === "Petty Cash Voucher") {
      const projects = getProjectOptions(teamMember.team_member_id);
      const projectOptions = projects.map((project, index) => {
        return {
          option_field_id: form.form_section[1].section_field[0].field_id,
          option_id: project.team_project_id,
          option_order: index,
          option_value: project.team_project_name,
        };
      });

      const departments = getDepartmentOptions();
      const departmentOptions = departments.map((department, index) => {
        return {
          option_field_id: form.form_section[1].section_field[2].field_id,
          option_id: department.team_department_id,
          option_order: index,
          option_value: department.team_department_name
        }
      });

      const bankList = plv8.execute(`SELECT * FROM lookup_schema.bank_list_table`);
      const bankListOptions = bankList.map((bank, index) => {
        return {
          option_field_id: form.form_section[3].section_field[1].field_id,
          option_id: bank.bank_id,
          option_order: index,
          option_value: bank.bank_label
        }
      });

      const uomList = plv8.execute(
        `
          SELECT * 
          FROM unit_of_measurement_schema.item_unit_of_measurement_table 
          WHERE 
            item_unit_of_measurement_is_disabled = false
        `
      );
      const uomOptions = uomList.map((uom, index) => {
        return {
          option_field_id: form.form_section[5].section_field[2].field_id,
          option_id: uom.item_unit_of_measurement_id,
          option_order: index,
          option_value: uom.item_unit_of_measurement
        }
      });

      const equipmentCodeList = plv8.execute(
        `
          SELECT 
            equipment_description_id, 
            equipment_description_property_number_with_prefix 
          FROM equipment_schema.equipment_description_view
        `
      );
      const equipmentCodeOptions = equipmentCodeList.map((equipmentCode, index) => {
        return {
          option_field_id: form.form_section[2].section_field[4].field_id,
          option_id: equipmentCode.equipment_description_id,
          option_order: index,
          option_value: equipmentCode.equipment_description_property_number_with_prefix
        }
      });

      returnData = {
        form,
        projectOptions,
        departmentOptions,
        bankListOptions,
        uomOptions,
        equipmentCodeOptions
      }
      return;
    } else if (form.form_name === "Equipment Service Report") {
      const projects = getProjectOptions(teamMember.team_member_id);
      const projectOptions = projects.map((project, index) => {
        return {
          option_field_id: form.form_section[0].section_field[0].field_id,
          option_id: project.team_project_id,
          option_order: index,
          option_value: project.team_project_name,
        };
      });

      const departments = getDepartmentOptions();
      const departmentOptions = departments.map((department, index) => {
        return {
          option_field_id: form.form_section[0].section_field[2].field_id,
          option_id: department.team_department_id,
          option_order: index,
          option_value: department.team_department_name,
        };
      });

      const categories = plv8.execute(
        `
          SELECT
            equipment_category_id,
            equipment_category
          FROM equipment_schema.equipment_category_table
          WHERE
            equipment_category_team_id = $1
            AND equipment_category_is_disabled = false
            AND equipment_category_is_available = true
          ORDER BY equipment_category
        `, [
          teamMember.team_member_team_id
        ]
      );
      const categoryOptions = categories.map((category, index) => {
        return {
          option_field_id: form.form_section[1].section_field[1].field_id,
          option_id: category.equipment_category_id,
          option_order: index,
          option_value: category.equipment_category,
        };
      });

      returnData = {
        form: {
          ...form,
          form_section: [
            {
              ...form.form_section[0],
              section_field: [
                {
                  ...form.form_section[0].section_field[0],
                  field_option: projectOptions
                },
                form.form_section[0].section_field[1],
                {
                  ...form.form_section[0].section_field[2],
                  field_option: departmentOptions
                },
              ]
            },
            {
              ...form.form_section[1],
              section_field: [
                form.form_section[1].section_field[0],
                {
                  ...form.form_section[1].section_field[1],
                  field_option: categoryOptions
                },
                ...form.form_section[1].section_field.slice(2)
              ]
            },
            ...form.form_section.slice(2)
          ]
        },
        projectOptions,
        categoryOptions
      }
      return;
    } else if (form.form_name === "Request For Payment") {
      const projects = getProjectOptions(teamMember.team_member_id);
      const projectOptions = projects.map((project, index) => {
        return {
          option_field_id: form.form_section[0].section_field[0].field_id,
          option_id: project.team_project_id,
          option_order: index,
          option_value: project.team_project_name,
        };
      });

      const departments = getDepartmentOptions();
      const departmentOptions = departments.map((department, index) => {
        return {
          option_field_id: form.form_section[0].section_field[2].field_id,
          option_id: department.team_department_id,
          option_order: index,
          option_value: department.team_department_name,
        };
      });

      const allProjects = plv8.execute(
        `
          SELECT
            team_project_id,
            team_project_name
          FROM team_schema.team_project_table
          WHERE
            team_project_is_disabled = false
          ORDER BY team_project_name
        `
      );

      const allProjectOptions = allProjects.map((project, index) => {
        return {
          option_field_id: form.form_section[2].section_field[2].field_id,
          option_id: project.team_project_id,
          option_order: index,
          option_value: project.team_project_name,
        };
      });

      returnData = {
        form: {
          ...form,
          form_section: [
            {
              ...form.form_section[0],
              section_field: [
                {
                  ...form.form_section[0].section_field[0],
                  field_option: projectOptions,
                },
                {
                  ...form.form_section[0].section_field[1],
                  field_option: departmentOptions,
                },
                ...form.form_section[0].section_field.slice(2),
              ],
            },
            ...form.form_section.slice(1)
          ],
        },
        projectOptions,
        departmentOptions,
        allProjectOptions
      }
      return;
    } else if (form.form_name === "Request For Payment Code" && connectedRequestFormslyId) {
      const connectedRequest = getConnectedRequest(connectedRequestFormslyId);

      const duplicatableSectionIdList = plv8.execute(
        `
          SELECT DISTINCT(request_response_duplicatable_section_id)
          FROM request_schema.request_response_table
          WHERE
            request_response_request_id = $1
            AND request_response_duplicatable_section_id IS NOT NULL
        `, [
          connectedRequest.request_id
        ]
      ).map(response => response.request_response_duplicatable_section_id);

      const connectedRequestSectionId = plv8.execute(
        `
          SELECT
            section_id
          FROM
            form_schema.section_table
          WHERE
            section_form_id = $1
            AND section_name = 'Request'
        `, [
          connectedRequest.request_form_id
        ]
      )[0].section_id;

      const signerList = plv8.execute(
        `
          SELECT
            signer_id,
            signer_is_primary_signer,
            signer_action,
            signer_order,
            team_member_id,
            user_id,
            user_first_name,
            user_last_name,
            user_avatar
          FROM form_schema.signer_table
          INNER JOIN team_schema.team_member_table 
            ON team_member_id = signer_team_member_id
          INNER JOIN user_schema.user_table 
            ON user_id = team_member_user_id
          WHERE
            signer_is_disabled = false
            AND signer_form_id = $1
            AND signer_team_project_id = $2
          ORDER BY signer_order
        `, [
          form.form_id,
          connectedRequest.request_project_id
        ]
      );
      const formattedSignerList = signerList.map(signer => {
        return {
          signer_id: signer.signer_id,
          signer_is_primary_signer: signer.signer_is_primary_signer,
          signer_action: signer.signer_action,
          signer_order: signer.signer_order,
          signer_team_member: {
            team_member_id: signer.team_member_id,
            team_member_user: {
              user_id: signer.user_id,
              user_first_name: signer.user_first_name,
              user_last_name: signer.user_last_name,
              user_avatar: signer.user_avatar,
            }
          }
        }
      });

      returnData = {
        form: {
          ...form,
          form_signer: formattedSignerList
        },
        connectedRequest: {
          ...connectedRequest,
          form_section: [connectedRequestSectionId],
          duplicatableSectionIdList
        }
      };
      return;
    } else if (form.form_name === "Petty Cash Voucher Balance" && connectedRequestFormslyId) {
      const connectedRequest = getConnectedRequest(connectedRequestFormslyId);

      const connectedRequestSectionId = plv8.execute(
        `
          SELECT
            section_id
          FROM
            form_schema.section_table
          WHERE
            section_form_id = $1
        `, [
          connectedRequest.request_form_id
        ]
      )[0].section_id;

      let connectedRequestChargeToProjectId = "";
      const parentRequestIdField = plv8.execute(
        `
          SELECT request_response
          FROM request_schema.request_response_table
          WHERE
            request_response_field_id IN (
              '9a112d6f-a34e-4767-b3c1-7f30af858f8f',
              '2bac0084-53f4-419f-aba7-fb1f77403e00'
            )
            AND request_response_request_id = $1
        `, [
          connectedRequest.request_id
        ]
      )[0];

      if (parentRequestIdField) {
        const parentRequestIdFieldResponse = parentRequestIdField.request_response.split('"').join('');
        const isUUID = (str) => {
          const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          return uuidPattern.test(str);
        };

        if (isUUID(parentRequestIdFieldResponse)) {
          const connectedRequestChargeToProjectName = plv8.execute(
            `
              SELECT request_response
              FROM request_schema.request_response_table
              WHERE
                request_response_request_id = $1
                AND request_response_field_id = '2bac0084-53f4-419f-aba7-fb1f77403e00'
            `, [
              parentRequestIdFieldResponse
            ]
          )[0];

          if (connectedRequestChargeToProjectName) {
            const parseProjectName = connectedRequestChargeToProjectName.request_response.split('"').join('');
            const connectedRequestChargeToProject = plv8.execute(
              `
                SELECT team_project_id
                FROM team_schema.team_project_table
                WHERE 
                    team_project_name = $1
                    AND team_project_is_disabled = false
              `, [
                parseProjectName
              ]
            )[0];

            if (connectedRequestChargeToProject) {
              connectedRequestChargeToProjectId = connectedRequestChargeToProject.team_project_id.split('"').join('');
            }
          }
        } else {
          const connectedRequestChargeToProject = plv8.execute(
            `
              SELECT team_project_id
              FROM team_schema.team_project_table
              WHERE 
                    team_project_name = $1
                    AND team_project_is_disabled = false
            `, [
              parentRequestIdFieldResponse
            ]
          )[0];

          if (connectedRequestChargeToProject) {
              connectedRequestChargeToProjectId = connectedRequestChargeToProject.team_project_id.split('"').join('');
          }
        }
      }

      const chargeToProjectField = plv8.execute(
        `
          SELECT
            request_response
          FROM request_schema.request_response_table
          WHERE
            request_response_field_id = '9cde1e79-646d-4a9f-9e76-3a6494bff6e2'
            AND request_response_request_id = $1
        `, [
          connectedRequest.request_id
        ]
      )[0];

      const isChargeToProject = chargeToProjectField ? Boolean(chargeToProjectField.request_response) : false;
      let signerList = [];

      const hasSpecialSigner = plv8.execute(
        `
          SELECT requester_primary_signer_signer_id
          FROM form_schema.requester_primary_signer_table
          INNER JOIN form_schema.signer_table ON signer_id = requester_primary_signer_signer_id
          WHERE
              requester_team_member_id = $1
              AND signer_form_id = $2
        `, [
          connectedRequest.request_team_member_id, 
          form.form_id
        ]
      )[0];

      if (isChargeToProject && connectedRequestChargeToProjectId !== "") {
        signerList = plv8.execute(
          `
            SELECT
              signer_id,
              signer_is_primary_signer,
              signer_action,
              signer_order,
              team_member_id,
              user_id,
              user_first_name,
              user_last_name,
              user_avatar
            FROM form_schema.signer_table
            INNER JOIN team_schema.team_member_table 
              ON team_member_id = signer_team_member_id
            INNER JOIN user_schema.user_table 
              ON user_id = team_member_user_id
            WHERE
              signer_is_disabled = false
              AND signer_form_id = $1
              AND signer_team_project_id = $2
            ORDER BY signer_order
        `, [
            form.form_id,
            connectedRequestChargeToProjectId
          ]
        );
      } else if (hasSpecialSigner) {
        signerList = plv8.execute(
          `
            SELECT
              signer_id,
              signer_is_primary_signer,
              signer_action,
              signer_order,
              team_member_id,
              user_id,
              user_first_name,
              user_last_name,
              user_avatar
            FROM form_schema.signer_table
            INNER JOIN team_schema.team_member_table ON team_member_id = signer_team_member_id
            INNER JOIN user_schema.user_table ON user_id = team_member_user_id
            WHERE
              signer_id = $1
          `, [
            hasSpecialSigner.requester_primary_signer_signer_id
          ]
        );
      } else {
        const pcvWavField = plv8.execute(
          `
            SELECT
              request_response
            FROM request_schema.request_response_table
            WHERE
              request_response_field_id = '694465de-8aa9-4361-be52-f8c091c13fde'
              AND request_response_request_id = $1
          `, [
            connectedRequest.request_id
          ]
        )[0];

        const isPED = pcvWavField ? JSON.parse(pcvWavField.request_response) === 'Plants and Equipment' : false;
        if (isPED) {
          const pedSignerProjectId = '38acb52d-98a7-401f-af04-080a3fd56cfd';
          signerList = plv8.execute(
            `
              SELECT
                signer_id,
                signer_is_primary_signer,
                signer_action,
                signer_order,
                team_member_id,
                user_id,
                user_first_name,
                user_last_name,
                user_avatar
              FROM form_schema.signer_table
              INNER JOIN team_schema.team_member_table ON team_member_id = signer_team_member_id
              INNER JOIN user_schema.user_table ON user_id = team_member_user_id
              WHERE
                signer_is_disabled = false
                AND signer_form_id = $1
                AND signer_team_project_id = $2
              ORDER BY signer_order
            `, [
              form.form_id,
              pedSignerProjectId
            ]
          );
        } else {
          signerList = plv8.execute(
            `
              SELECT
                signer_id,
                signer_is_primary_signer,
                signer_action,
                signer_order,
                team_member_id,
                user_id,
                user_first_name,
                user_last_name,
                user_avatar
              FROM form_schema.signer_table
              INNER JOIN team_schema.team_member_table 
                ON team_member_id = signer_team_member_id
              INNER JOIN user_schema.user_table 
                ON user_id = team_member_user_id
              WHERE
                signer_is_disabled = false
                AND signer_form_id = $1
                AND signer_team_project_id = $2
              ORDER BY signer_order
            `, [
              form.form_id,
              connectedRequest.request_project_id
            ]
          );
        }
      }

      const formattedSignerList = signerList.map(signer => ({
        signer_id: signer.signer_id,
        signer_is_primary_signer: signer.signer_is_primary_signer,
        signer_action: signer.signer_action,
        signer_order: signer.signer_order,
        signer_team_member: {
          team_member_id: signer.team_member_id,
          team_member_user: {
            user_id: signer.user_id,
            user_first_name: signer.user_first_name,
            user_last_name: signer.user_last_name,
            user_avatar: signer.user_avatar,
          }
        }
      }));

      const uniqueSignerList = [];
      formattedSignerList.forEach((signer) => {
        const signerIsDuplicate = uniqueSignerList.some(
          uniqueSigner => uniqueSigner.signer_team_member.team_member_id === signer.signer_team_member.team_member_id
        );
        if (!signerIsDuplicate) {
          uniqueSignerList.push(signer);
        }
      });

      returnData = {
        form: {
          ...form,
          form_signer: uniqueSignerList
        },
        connectedRequest: {
          ...connectedRequest,
          form_section: [connectedRequestSectionId]
        },
      };
      return;
    } else if (form.form_name === "Evaluation Result") {
      const projects = getProjectOptions(teamMember.team_member_id);
      const projectOptions = projects.map((project, index) => {
        return {
          option_field_id: form.form_section[0].section_field[0].field_id,
          option_id: project.team_project_id,
          option_order: index,
          option_value: project.team_project_name,
        };
      });

      returnData = {
        form: {
          ...form,
          form_section: [
            form.form_section[0],
            {
              ...form.form_section[1],
              section_field: [
                ...form.form_section[1].section_field.slice(0, 3),
                  {
                  ...form.form_section[1].section_field[3],
                  field_option: projectOptions
                },
              ],
            },
            ...form.form_section.slice(2),
          ],
        },
      }
      return;
    } else {
      returnData = { form }
    }
  });
  return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_request(
  request_id TEXT
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function(){

    const isStringParsable = (str) => {
      try {
        JSON.parse(str);
        return true;
      } catch (e) {
        return false;
      }
    };

    const safeParse = (str) => {
      if (isStringParsable(str)) {
        return JSON.parse(str);
      } else {
        return str;
      }
    };

    const idCondition = plv8.execute(`SELECT public.generate_request_id_condition('${request_id}')`)[0].generate_request_id_condition;

    const requestData = plv8.execute(
      `
        SELECT
          request_view.*,
          team_member_team_id,
          user_id,
          user_first_name,
          user_last_name,
          user_username,
          user_avatar,
          user_job_title,
          form_id,
          form_name,
          form_description,
          form_is_formsly_form,
          form_type,
          form_sub_type,
          team_project_name
        FROM public.request_view
        LEFT JOIN team_schema.team_member_table ON team_member_id = request_team_member_id
        LEFT JOIN user_schema.user_table ON user_id = team_member_user_id
        INNER JOIN form_schema.form_table ON form_id = request_form_id
        LEFT JOIN team_schema.team_project_table ON team_project_id = request_project_id
        WHERE
          ${idCondition}
          AND request_is_disabled = false
      `
    )[0];

    const requestSignerData = plv8.execute(
      `
        SELECT
          request_signer_id,
          request_signer_status,
          request_signer_status_date_updated,
          signer_id,
          signer_is_primary_signer,
          signer_action,
          signer_order,
          signer_form_id,
          team_member_id,
          user_id,
          user_first_name,
          user_last_name,
          user_job_title,
          attachment_value
        FROM request_schema.request_signer_table
        INNER JOIN form_schema.signer_table ON signer_id = request_signer_signer_id
        LEFT JOIN team_schema.team_member_table ON team_member_id = signer_team_member_id
        LEFT JOIN user_schema.user_table ON user_id = team_member_user_id
        LEFT JOIN public.attachment_table on attachment_id = user_signature_attachment_id
        WHERE request_signer_request_id = '${requestData.request_id}'
      `
    );

    const requestCommentData = plv8.execute(
      `
        SELECT
          comment_id,
          comment_date_created,
          comment_content,
          comment_is_edited,
          comment_last_updated,
          comment_type,
          comment_team_member_id,
          user_id,
          user_first_name,
          user_last_name,
          user_username,
          user_avatar
        FROM request_schema.comment_table
        INNER JOIN team_schema.team_member_table ON team_member_id = comment_team_member_id
        INNER JOIN user_schema.user_table ON user_id = team_member_user_id
        WHERE
          comment_request_id = '${requestData.request_id}'
        ORDER BY comment_date_created DESC
      `
    );

    const sectionData = plv8.execute(
      `
        SELECT *
        FROM form_schema.section_table
        WHERE section_form_id = '${requestData.form_id}'
        ORDER BY section_order ASC
      `
    );

    const formSection = [];
    if(requestData.form_is_formsly_form && (requestData.form_name === "Item" || requestData.form_name === "Subcon" || requestData.form_name === "PED Item")) {
      sectionData.forEach(section => {
        const fieldData = plv8.execute(
          `
            SELECT DISTINCT field_table.*
            FROM form_schema.field_table
            INNER JOIN request_schema.request_response_table ON request_response_field_id = field_id
              AND request_response_request_id = '${requestData.request_id}'
            WHERE
              field_section_id = '${section.section_id}'
            ORDER BY field_order ASC
          `
        );
        const fieldWithOptionAndResponse = [];
        fieldData.forEach(field => {
          const requestResponseData = plv8.execute(
            `
              SELECT *
              FROM request_schema.request_response_table
              WHERE request_response_request_id = '${requestData.request_id}'
              AND request_response_field_id = '${field.field_id}'
            `
          );
          const optionData = plv8.execute(
            `
              SELECT *
              FROM form_schema.option_table
              WHERE option_field_id = '${field.field_id}'
              ORDER BY option_order ASC
            `
          );
          let fieldItemDescriptionOrder = 0;
          const order = plv8.execute(
            `
              SELECT item_description_order
              FROM item_schema.item_description_table
              WHERE item_description_field_id = '${field.field_id}'
            `
          );
          if(order.length > 0){
            fieldItemDescriptionOrder = order[0].item_description_order;
          }

          fieldWithOptionAndResponse.push({
            ...field,
            field_order: field.field_order + fieldItemDescriptionOrder,
            field_response: requestResponseData,
            field_option: optionData
          });
        });

        formSection.push({
          ...section,
          section_field: fieldWithOptionAndResponse.sort((a,b) => a.field_order - b.field_order),
        })
      });
    } else if (requestData.form_is_formsly_form && (requestData.form_name === "Technical Assessment")) {
      const technicalAssessmentResult = plv8.execute(`
        SELECT request_id
        FROM public.request_view
        WHERE request_formsly_id = '${request_id}'
      `);
      const technicalAssessmentId = technicalAssessmentResult[0].request_id;

      const generalAssessmentData = plv8.execute(`
      SELECT
        request_response,
        field_id
      FROM request_schema.request_response_table
      INNER JOIN form_schema.field_table ON field_id = request_response_field_id
        AND field_id = '362bff3d-54fa-413b-992c-fd344d8552c6'
      WHERE
        request_response_request_id = '${technicalAssessmentId}'
        ORDER BY field_order
      `);

      const generalAssessmentId = generalAssessmentData[0].request_response;

      const generalRequestData = plv8.execute(`
        SELECT request_id
        FROM public.request_view
        WHERE request_formsly_id = '${safeParse(generalAssessmentId)}'
      `);

      if (!generalRequestData.length) {
        throw new Error("General request data not found.");
      }

      const requestId = generalRequestData[0].request_id;

      const applicantData = plv8.execute(`
        SELECT
          request_response,
          field_id
        FROM request_schema.request_response_table
        INNER JOIN form_schema.field_table ON field_id = request_response_field_id
          AND field_id IN (
            'be0e130b-455b-47e0-a804-f90943f7bc07',
            '5c5284cd-7647-4307-b558-40b9076d9f7f',
            'f1c516bd-e483-4f32-a5b0-5223b186afb5',
            'd209aed6-e560-49a8-aa77-66c9cada168d',
            'f92a07b0-7b04-4262-8cd4-b3c7f37ce9b6',
            'c3225996-d3e8-4fb4-87d8-f5ced778adcf',
            '3c0723cc-f083-4f89-abe0-f8fb4bd02234',
            '3e2cca9c-b23b-449a-a544-8d60ee8c269d',
            '69a2664f-c34d-4381-b19c-749c4a9a012b',
            '8abe5d1a-8370-4472-b88e-3580f724d12d'
          )
        WHERE
          request_response_request_id = '${requestId}'
        ORDER BY field_order
      `);

      if (!applicantData.length) {
        throw new Error("Applicant data not found.");
      }

      const requestApplicationData = plv8.execute(`
        SELECT request_id
        FROM public.request_view
        WHERE request_formsly_id = '${safeParse(applicantData[0].request_response)}'
      `);

      if (!requestApplicationData.length) {
        throw new Error("Request application data not found.");
      }

      const positionData = plv8.execute(`
        SELECT
          request_response,
          field_id
        FROM request_schema.request_response_table
        INNER JOIN form_schema.field_table ON field_id = request_response_field_id
          AND field_id = '0fd115df-c2fe-4375-b5cf-6f899b47ec56'
        WHERE
          request_response_request_id = '${requestApplicationData[0].request_id}'
        ORDER BY field_order ASC
      `);

      if (!positionData.length) {
        throw new Error("Position data not found.");
      }

      const position_type = safeParse(positionData[0].request_response);

      sectionData.forEach((section, index) => {
        if (index === 2) {
          const fieldData = plv8.execute(`
            SELECT f.*, qq.questionnaire_question_id
            FROM form_schema.questionnaire_table q
            JOIN form_schema.questionnaire_question_table qq
            ON qq.questionnaire_question_questionnaire_id = q.questionnaire_id
            JOIN form_schema.field_table f
            ON f.field_id = qq.questionnaire_question_field_id
            JOIN lookup_schema.position_table p
            ON p.position_questionnaire_id  = q.questionnaire_id
            WHERE p.position_alias = '${position_type}' AND qq.questionnaire_question_is_disabled = FALSE
            ORDER BY field_order ASC
          `);

          const fieldWithOptionAndResponse = fieldData.map(field => {
            const optionData = plv8.execute(`
              SELECT *
              FROM form_schema.question_option_table
              WHERE question_option_questionnaire_question_id = '${field.questionnaire_question_id}'
              ORDER BY question_option_order ASC;
            `);

            const requestResponseData = plv8.execute(`
              SELECT *
              FROM request_schema.request_response_table
              WHERE
                request_response_field_id = '${field.field_id}'
                AND request_response_request_id = '${technicalAssessmentId}'
            `);

            return {
              ...field,
              field_response:requestResponseData,
              field_option: optionData.filter(option => option.question_option_value !== null && option.question_option_value.trim() !== "").map((option) => ({
                option_id: option.question_option_id,
                option_value: option.question_option_value,
                option_order: option.question_option_order,
              }))
            };
          });

          formSection.push({
            ...section,
            section_field: fieldWithOptionAndResponse,
          });
        } else {
          const fieldData = plv8.execute(
            `
              SELECT *
              FROM form_schema.field_table
              WHERE field_section_id = '${section.section_id}'
              ORDER BY field_order ASC
            `
          );
          const fieldWithOptionAndResponse = fieldData.map(field => {
            const optionData = plv8.execute(
              `
                SELECT *
                FROM form_schema.option_table
                WHERE option_field_id = '${field.field_id}'
                ORDER BY option_order ASC
              `
            );

            const requestResponseData = plv8.execute(
              `
                SELECT *
                FROM request_schema.request_response_table
                WHERE
                  request_response_field_id = '${field.field_id}'
                  AND request_response_request_id = '${requestData.request_id}'
              `
            );

            return {
              ...field,
              field_response: requestResponseData,
              field_option: optionData
            };
          });

          formSection.push({
            ...section,
            section_field: fieldWithOptionAndResponse,
          })
        }
      });
    } else {
      sectionData.forEach(section => {
        const fieldData = plv8.execute(
          `
            SELECT *
            FROM form_schema.field_table
            WHERE field_section_id = '${section.section_id}'
            ORDER BY field_order ASC
          `
        );
        const fieldWithOptionAndResponse = fieldData.map(field => {
          const optionData = plv8.execute(
            `
              SELECT *
              FROM form_schema.option_table
              WHERE option_field_id = '${field.field_id}'
              ORDER BY option_order ASC
            `
          );

          const requestResponseData = plv8.execute(
            `
              SELECT *
              FROM request_schema.request_response_table
              WHERE
                request_response_field_id = '${field.field_id}'
                AND request_response_request_id = '${requestData.request_id}'
            `
          );

          return {
            ...field,
            field_response: requestResponseData,
            field_option: optionData
          };
        });

        formSection.push({
          ...section,
          section_field: fieldWithOptionAndResponse,
        })
      });
    }

    const form = {
      form_id: requestData.form_id,
      form_name: requestData.form_name,
      form_description: requestData.form_description,
      form_is_formsly_form: requestData.form_is_formsly_form,
      form_section: formSection,
      form_type: requestData.form_type,
      form_sub_type: requestData.form_sub_type
    };

    returnData = {
      request_id: requestData.request_id,
      request_formsly_id: requestData.request_formsly_id,
      request_date_created: requestData.request_date_created,
      request_status: requestData.request_status,
      request_is_disabled: requestData.request_is_disabled,
      request_team_member_id: requestData.request_team_member_id,
      request_form_id: requestData.request_form_id,
      request_project_id: requestData.request_project_id,
      request_jira_id: requestData.request_jira_id,
      request_jira_link: requestData.request_jira_link,
      request_otp_id: requestData.request_otp_id,
      request_comment: requestCommentData.map(requestComment => {
        return {
          comment_id: requestComment.comment_id,
          comment_date_created: requestComment.comment_date_created,
          comment_content: requestComment.comment_content,
          comment_is_edited: requestComment.comment_is_edited,
          comment_last_updated: requestComment.comment_last_updated,
          comment_type: requestComment.comment_type,
          comment_team_member_id: requestComment.comment_team_member_id,
          comment_team_member: {
            team_member_user: {
              user_id: requestComment.user_id,
              user_first_name: requestComment.user_first_name,
              user_last_name: requestComment.user_last_name,
              user_username: requestComment.user_username,
              user_avatar: requestComment.user_avatar
            }
          }
        }
      }),
      request_form: form,
      request_team_member: {
        team_member_team_id: requestData.team_member_team_id,
        team_member_user: {
          user_id: requestData.user_id,
          user_first_name: requestData.user_first_name,
          user_last_name: requestData.user_last_name,
          user_username: requestData.user_username,
          user_avatar: requestData.user_avatar,
          user_job_title: requestData.user_job_title
        }
      },
      request_signer: requestSignerData.map(requestSigner => {
        return {
          request_signer_id: requestSigner.request_signer_id,
          request_signer_status: requestSigner.request_signer_status,
          request_signer_status_date_updated: requestSigner.request_signer_status_date_updated,
          request_signer_signer: {
            signer_id: requestSigner.signer_id,
            signer_is_primary_signer: requestSigner.signer_is_primary_signer,
            signer_action: requestSigner.signer_action,
            signer_order: requestSigner.signer_order,
            signer_form_id: requestSigner.signer_form_id,
            signer_team_member:{
              team_member_id: requestSigner.team_member_id,
              team_member_user:{
                user_id: requestSigner.user_id,
                user_first_name: requestSigner.user_first_name,
                user_last_name: requestSigner.user_last_name,
                user_job_title: requestSigner.user_job_title,
                user_signature_attachment_id: requestSigner.attachment_value
              }
            },
          },
        }
      }),
      request_project: {
        team_project_name: requestData.team_project_name
      }
    };
 });
 return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_ticket_form(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      category,
      teamId,
    } = input_data;

    const categoryData = plv8.execute(`SELECT * FROM ticket_schema.ticket_category_table WHERE ticket_category = '${category}' LIMIT 1`)[0];

    const sectionData = plv8.execute(`SELECT * FROM ticket_schema.ticket_section_table WHERE ticket_section_category_id = '${categoryData.ticket_category_id}'`);

    const sectionList = sectionData.map(section => {
      const fieldData = plv8.execute(
        `
          SELECT *
          FROM ticket_schema.ticket_field_table
          WHERE ticket_field_section_id = '${section.ticket_section_id}'
          ORDER BY ticket_field_order ASC
        `
      );
      const fieldWithOption = fieldData.map(field => {
        const optionData = plv8.execute(
          `
            SELECT *
            FROM ticket_schema.ticket_option_table
            WHERE ticket_option_field_id = '${field.ticket_field_id}'
            ORDER BY ticket_option_order ASC
          `
        );
        const optionList = optionData.map((option)=> option.ticket_option_value);

        return {
          ...field,
          ticket_field_option: optionList,
          ticket_field_response: ""
        };
      });

      return {
        ...section,
        ticket_section_fields: fieldWithOption,
      }
    });

    if(category === "Request Custom CSI"){
      const itemList = plv8.execute(`
        SELECT * FROM item_schema.item_table
        WHERE item_team_id='${teamId}'
        AND item_is_disabled = false
        AND item_is_available = true
        ORDER BY item_general_name ASC;
      `);
      const itemOptions = itemList.map((option)=> option.item_general_name);

      const ticket_sections = sectionList.map(section => {

        const fieldWithOption = section.ticket_section_fields.map((field, fieldIdx) => {
          return {
            ...field,
            ticket_field_option: fieldIdx === 0 ? itemOptions : [],
          };
        });

        return {
          ...section,
          ticket_section_fields: fieldWithOption,
        }
      })
      returnData = { ticket_sections }
    } else if (category === "Request Item CSI"){
      const itemList = plv8.execute(`
        SELECT * FROM item_schema.item_table
        WHERE item_team_id='${teamId}'
        AND item_is_disabled = false
        AND item_is_available = true
        ORDER BY item_general_name ASC;
      `);
      const itemOptions = itemList.map((option)=> option.item_general_name);

      const csiCodeDescriptionList = plv8.execute(`
        SELECT * FROM lookup_schema.csi_code_table
        ORDER BY csi_code_level_three_description ASC;
      `);
      const csiCodeDescriptionOptions = csiCodeDescriptionList.map((option)=> option.csi_code_level_three_description);

      const ticket_sections = sectionList.map(section => {

        const fieldWithOption = section.ticket_section_fields.map((field, fieldIdx) => {
          let fieldOptions = []
          if(fieldIdx === 0){
            fieldOptions = itemOptions
          }else if(fieldIdx === 1){
            fieldOptions = csiCodeDescriptionOptions
          }

          return {
            ...field,
            ticket_field_option: fieldOptions,
          };
        });

        return {
          ...section,
          ticket_section_fields: fieldWithOption,
        }
      })
      returnData = { ticket_sections }
    } else if (category === "Request Item Option"){
      const itemList = plv8.execute(`
        SELECT * FROM item_schema.item_table
        WHERE item_team_id='${teamId}'
        AND item_is_disabled = false
        AND item_is_available = true
        ORDER BY item_general_name ASC;
      `);
      const itemOptions = itemList.map((option)=> option.item_general_name);

      const uomList = plv8.execute(`
        SELECT item_unit_of_measurement
        FROM unit_of_measurement_schema.item_unit_of_measurement_table
        WHERE
          item_unit_of_measurement_is_available=true
          AND item_unit_of_measurement_is_disabled=false
          AND item_unit_of_measurement_team_id='${teamId}'
          ORDER BY item_unit_of_measurement ASC;
      `);
      const uomOptions = uomList.map((option)=> option.item_unit_of_measurement);


      const ticket_sections = sectionList.map((section, sectionIdx) => {

        const fieldWithOption = section.ticket_section_fields.map((field, fieldIdx) => {
          let fieldOptions = []
          if(sectionIdx===0 && fieldIdx === 0){
            fieldOptions = itemOptions
          }else if(sectionIdx===1 && fieldIdx === 1){
            fieldOptions = uomOptions
          }

          return {
            ...field,
            ticket_field_option: fieldOptions,
          };
        });

        return {
          ...section,
          ticket_section_fields: fieldWithOption,
        }
      })
      returnData = { ticket_sections }
    } else if (category === "Incident Report for Employees"){
        const memberList = plv8.execute(`
          SELECT
            tmt.team_member_id,
            tmt.team_member_role,
            json_build_object(
              'user_id', usert.user_id,
              'user_first_name', usert.user_first_name,
              'user_last_name', usert.user_last_name,
              'user_avatar', usert.user_avatar,
              'user_email', usert.user_email
            ) AS team_member_user
          FROM team_schema.team_member_table tmt
            JOIN user_schema.user_table usert ON usert.user_id = tmt.team_member_user_id
          WHERE
            tmt.team_member_team_id = '${teamId}'
            AND tmt.team_member_is_disabled = false;
        `);
        const memberOptions = memberList.map((option)=> ({label: `${option.team_member_user.user_first_name} ${option.team_member_user.user_last_name}`, value:option.team_member_id}));

        const ticket_sections = sectionList.map(section => {
          const fieldWithOption = section.ticket_section_fields.map((field, fieldIdx) => {
          let fieldOptions = []
          if(fieldIdx === 0){
            fieldOptions = memberOptions
          }

          return {
            ...field,
            ticket_field_option: fieldOptions,
          };
        });

        return {
          ...section,
          ticket_section_fields: fieldWithOption,
        }
      })
      returnData = { ticket_sections }
    } else if (category === "Request PED Equipment Part"){
      const equipmentNameList = plv8.execute(
        `
          SELECT equipment_name
          FROM equipment_schema.equipment_table
          WHERE
            equipment_is_disabled = false
            AND equipment_is_available = true
            AND equipment_team_id = '${teamId}'
          ORDER BY equipment_name
        `
      );
      const equipmentNameOptions = equipmentNameList.map((option)=> option.equipment_name);

      const allEquipmentPartNameList = [];
      const equipmentGeneralNameCount = plv8.execute(
        `
          SELECT COUNT(*)
          FROM equipment_schema.equipment_general_name_table
          WHERE equipment_general_name_team_id = '${teamId}'
        `
      )[0].count;
      let index = 0;
      while (index < equipmentGeneralNameCount) {
        const nameList = plv8.execute(
          `
            SELECT equipment_general_name
            FROM equipment_schema.equipment_general_name_table
            WHERE
              equipment_general_name_team_id = '${teamId}'
              AND equipment_general_name_is_disabled = false
              AND equipment_general_name_is_available = true
            ORDER BY equipment_general_name
            LIMIT 1000
            OFFSET ${index}
          `
        );
        allEquipmentPartNameList.push(...nameList);
        index += 1000;
      }
      const equipmentPartNameOptions = allEquipmentPartNameList.map((option)=> option.equipment_general_name);

      const brandList = plv8.execute(
        `
          SELECT equipment_brand
          FROM equipment_schema.equipment_brand_table
          WHERE
            equipment_brand_is_disabled = false
            AND equipment_brand_is_available = true
            AND equipment_brand_team_id = '${teamId}'
          ORDER BY equipment_brand
        `
      );
      const brandOptions = brandList.map((option)=> option.equipment_brand);

      const modelList = plv8.execute(
        `
          SELECT equipment_model
          FROM equipment_schema.equipment_model_table
          WHERE
            equipment_model_is_disabled = false
            AND equipment_model_is_available = true
            AND equipment_model_team_id = '${teamId}'
          ORDER BY equipment_model
        `
      );
      const modelOptions = modelList.map((option)=> option.equipment_model);

      const uomList = plv8.execute(
        `
          SELECT equipment_unit_of_measurement
          FROM unit_of_measurement_schema.equipment_unit_of_measurement_table
          WHERE
            equipment_unit_of_measurement_is_disabled = false
            AND equipment_unit_of_measurement_is_available = true
            AND equipment_unit_of_measurement_team_id = '${teamId}'
          ORDER BY equipment_unit_of_measurement
        `
      );
      const uomOptions = uomList.map((option)=> option.equipment_unit_of_measurement);

      const categoryList = plv8.execute(
        `
          SELECT equipment_component_category
          FROM equipment_schema.equipment_component_category_table
          WHERE
            equipment_component_category_is_disabled = false
            AND equipment_component_category_is_available = true
            AND equipment_component_category_team_id = '${teamId}'
          ORDER BY equipment_component_category
        `
      );
      const categoryOptions = categoryList.map((option)=> option.equipment_component_category);

      const ticket_sections = sectionList.map(section => {

        const fieldWithOption = section.ticket_section_fields.map((field, fieldIdx) => {
          let fieldOptions = []
          if(fieldIdx === 0){
            fieldOptions = equipmentNameOptions
          }else if(fieldIdx === 1){
            fieldOptions = equipmentPartNameOptions
          }else if(fieldIdx === 3){
            fieldOptions = brandOptions
          }else if(fieldIdx === 4){
            fieldOptions = modelOptions
          }else if(fieldIdx === 5){
            fieldOptions = uomOptions
          }else if(fieldIdx === 6){
            fieldOptions = categoryOptions
          }

          return {
            ...field,
            ticket_field_option: fieldOptions,
          };
        });

        return {
          ...section,
          ticket_section_fields: fieldWithOption,
        }
      })
      returnData = { ticket_sections }
    } else {
      returnData = { ticket_sections: sectionList }
    }
 });
 return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION check_custom_csi_validity(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      csiCode
    } = input_data;

    const csiCodeArray = csiCode.split(" ");
    const csi_code_division_id = csiCodeArray[0];
    const csi_code_level_two_major_group_id = csiCodeArray[1][0];
    const csi_code_level_two_minor_group_id = csiCodeArray[1][1];
    const csi_code_level_three_id = csiCodeArray[2];

    const csiCodeDivisionIdExists = plv8.execute(`
      SELECT *
      FROM lookup_schema.csi_code_table
      WHERE
        csi_code_division_id = '${csi_code_division_id}';
    `)[0];

    const csiCodeLevelTwoMajorGroupIdExists = plv8.execute(`
      SELECT *
      FROM lookup_schema.csi_code_table
      WHERE
        csi_code_division_id = '${csi_code_division_id}'
        AND csi_code_level_two_major_group_id = '${csi_code_level_two_major_group_id}';
    `)[0];

    const csiCodeLevelTwoMinorGroupIdExists = plv8.execute(`
      SELECT *
      FROM lookup_schema.csi_code_table
      WHERE
        csi_code_division_id = '${csi_code_division_id}'
        AND csi_code_level_two_major_group_id = '${csi_code_level_two_major_group_id}'
        AND csi_code_level_two_minor_group_id = '${csi_code_level_two_minor_group_id}';
    `)[0];

    const csiCodeLevelThreeIdExists = plv8.execute(`
      SELECT *
      FROM lookup_schema.csi_code_table
      WHERE
        csi_code_division_id = '${csi_code_division_id}'
        AND csi_code_level_two_major_group_id = '${csi_code_level_two_major_group_id}'
        AND csi_code_level_two_minor_group_id = '${csi_code_level_two_minor_group_id}'
        AND csi_code_level_three_id = '${csi_code_level_three_id}';
    `)[0];

    returnData = {
      csiCodeDivisionIdExists: Boolean(csiCodeDivisionIdExists),
      csiCodeLevelTwoMajorGroupIdExists: Boolean(csiCodeLevelTwoMajorGroupIdExists),
      csiCodeLevelTwoMinorGroupIdExists: Boolean(csiCodeLevelTwoMinorGroupIdExists),
      csiCodeLevelThreeIdExists: Boolean(csiCodeLevelThreeIdExists),
    }
 });
 return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_ticket_on_load(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      ticketId,
      userId
    } = input_data;

    const ticket = plv8.execute(
      `
        SELECT
          tt.*,
          tct.ticket_category
        FROM ticket_schema.ticket_table tt
        INNER JOIN ticket_schema.ticket_category_table tct ON tct.ticket_category_id = tt.ticket_category_id
        WHERE ticket_id = '${ticketId}'
      `
    )[0];

    const requester = plv8.execute(
      `
        SELECT
          team_member_id,
          team_member_team_id,
          team_member_role,
          user_id,
          user_first_name,
          user_last_name,
          user_email,
          user_avatar
        FROM team_schema.team_member_table
        JOIN user_schema.user_table ON team_member_user_id = user_id
        WHERE team_member_id = '${ticket.ticket_requester_team_member_id}'
      `
    )[0];

    const ticketForm = plv8.execute(`SELECT public.get_ticket_form('{"category": "${ticket.ticket_category}","teamId": "${requester.team_member_team_id}"}')`)[0].get_ticket_form;

    const responseData = plv8.execute(`SELECT * FROM ticket_schema.ticket_response_table WHERE ticket_response_ticket_id='${ticketId}'`);

    const originalTicketSections = ticketForm.ticket_sections.map(section=>({
      ...section,
      field_section_duplicatable_id: null,
      ticket_section_fields: section.ticket_section_fields.map(field=>{
        return {
          ...field,
          ticket_field_response: responseData.filter(response=>response.ticket_response_field_id===field.ticket_field_id)
        }
      })
    }));

    const sectionWithDuplicateList = [];
    originalTicketSections.forEach((section) => {
      const hasDuplicates = section.ticket_section_fields.some((field) =>
        field.ticket_field_response.some(
          (response) => response.ticket_response_duplicatable_section_id !== null
        )
      );
      if (section.ticket_section_is_duplicatable && hasDuplicates) {
        const fieldResponse = section.ticket_section_fields.flatMap((field) => field.ticket_field_response);

        const uniqueIdList = fieldResponse.reduce((unique, item) => {
          const { ticket_response_duplicatable_section_id } = item;
          const isDuplicate = unique.some((uniqueItem) =>
            uniqueItem.includes(`${ticket_response_duplicatable_section_id}`)
          );
          if (!isDuplicate) {
            unique.push(`${ticket_response_duplicatable_section_id}`);
          }
          return unique;
        }, []);

        const duplicateSectionList = uniqueIdList.map((id) => ({
          ...section,
          field_section_duplicatable_id: id==="null" ? null : id,
          ticket_section_fields: section.ticket_section_fields.map((field) => ({
            ...field,
            ticket_field_response: [

              field.ticket_field_response.filter(
                (response) =>
                  `${response.ticket_response_duplicatable_section_id}` === id
              )[0] || null,
            ]
          })),
        }));

        duplicateSectionList.forEach((duplicateSection) =>
          sectionWithDuplicateList.push(duplicateSection)
        );
      } else {
        sectionWithDuplicateList.push(section);
      }
    });

    const ticketFormWithResponse = {
      ticket_sections: sectionWithDuplicateList.map((section, sectionIdx)=>({
        ...section,
        ticket_section_fields: section.ticket_section_fields.map((field,fieldIdx)=>{
          const responseArray = field.ticket_field_response
          let response = ""
          let responseId = ""
          if(responseArray.length>0){
            response = field.ticket_field_response[0]?.ticket_response_value || ""
            responseId = field.ticket_field_response[0]?.ticket_response_id || ""
          }

          let fieldOptions = field.ticket_field_option
          if(ticket.ticket_category === "Request Item Option" && sectionIdx === 0 && fieldIdx === 1){
            const itemName = JSON.parse(sectionWithDuplicateList[0].ticket_section_fields[0].ticket_field_response[0]?.ticket_response_value)
            const item = plv8.execute(`SELECT * FROM item_schema.item_table WHERE item_general_name = '${itemName}';`)[0];
            const itemDescriptionList = plv8.execute(`SELECT item_description_label FROM item_schema.item_description_table WHERE item_description_item_id = '${item.item_id}';`);
            fieldOptions = itemDescriptionList.map((description)=>description.item_description_label)
          }

          return {
            ...field,
            ticket_field_option: fieldOptions,
            ticket_field_response: response,
            ticket_field_response_referrence: response,
            ticket_field_response_id: responseId
          }
        })
      }))
    }

    let approver = null
    if(ticket.ticket_approver_team_member_id !== null){
      approver = plv8.execute(`SELECT jsonb_build_object(
          'team_member_id', tm.team_member_id,
          'team_member_role', tm.team_member_role,
          'team_member_user', jsonb_build_object(
              'user_id', u.user_id,
              'user_first_name', u.user_first_name,
              'user_last_name', u.user_last_name,
              'user_email', u.user_email,
              'user_avatar', u.user_avatar
          )
      ) AS member
      FROM team_schema.team_member_table tm
      JOIN user_schema.user_table u ON tm.team_member_user_id = u.user_id
      WHERE tm.team_member_id = '${ticket.ticket_approver_team_member_id}';`)[0]
    }

    const teamId = plv8.execute(`SELECT public.get_user_active_team_id($1)`, [userId])[0].get_user_active_team_id;

    const member = plv8.execute(
      `
        SELECT tmt.team_member_id,
        tmt.team_member_role,
        json_build_object(
          'user_id', usert.user_id,
          'user_first_name', usert.user_first_name,
          'user_last_name', usert.user_last_name,
          'user_avatar', usert.user_avatar,
          'user_email', usert.user_email
        ) AS team_member_user
        FROM team_schema.team_member_table tmt
        JOIN user_schema.user_table usert ON tmt.team_member_user_id = usert.user_id
        WHERE
          tmt.team_member_team_id='${teamId}'
          AND tmt.team_member_is_disabled=false
          AND usert.user_is_disabled=false
          AND usert.user_id='${userId}';
      `
    )[0];

    const ticketCommentData = plv8.execute(
      `
        SELECT
          ticket_comment_id,
          ticket_comment_content,
          ticket_comment_is_disabled,
          ticket_comment_is_edited,
          ticket_comment_type,
          ticket_comment_date_created,
          ticket_comment_last_updated,
          ticket_comment_ticket_id,
          ticket_comment_team_member_id,
          user_id,
          user_first_name,
          user_last_name,
          user_username,
          user_avatar
        FROM ticket_schema.ticket_comment_table
        INNER JOIN team_schema.team_member_table ON team_member_id = ticket_comment_team_member_id
        INNER JOIN user_schema.user_table ON user_id = team_member_user_id
        WHERE
          ticket_comment_ticket_id = '${ticketId}'
        ORDER BY ticket_comment_date_created DESC
      `
    );

    returnData = {
      ticket: {
        ...ticket,
        ticket_requester: {
          team_member_id: requester.team_member_id,
          team_member_role: requester.team_member_role,
          team_member_user: {
            user_id: requester.user_id,
            user_first_name: requester.user_first_name,
            user_last_name: requester.user_last_name,
            user_avatar: requester.user_avatar,
            user_email: requester.user_email
          }
        },
        ticket_approver: approver ? approver.member : null,
        ticket_comment: ticketCommentData.map(ticketComment => {
          return {
            ticket_comment_id: ticketComment.ticket_comment_id,
            ticket_comment_content: ticketComment.ticket_comment_content,
            ticket_comment_is_disabled: ticketComment.ticket_comment_is_disabled,
            ticket_comment_is_edited: ticketComment.ticket_comment_is_edited,
            ticket_comment_type: ticketComment.ticket_comment_type,
            ticket_comment_date_created: ticketComment.ticket_comment_date_created,
            ticket_comment_last_updated: ticketComment.ticket_comment_last_updated,
            ticket_comment_ticket_id: ticketComment.ticket_comment_ticket_id,
            ticket_comment_team_member_id: ticketComment.ticket_comment_team_member_id,
            ticket_comment_attachment: [],
            ticket_comment_team_member: {
              team_member_user: {
                user_id: ticketComment.user_id,
                user_first_name: ticketComment.user_first_name,
                user_last_name: ticketComment.user_last_name,
                user_username: ticketComment.user_username,
                user_avatar: ticketComment.user_avatar
              }
            }
          }
        }
      )},
      user: member,
      ticketForm: ticketFormWithResponse,
    }
 });
 return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION assign_ticket(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      ticketId,
      teamMemberId
    } = input_data;

    const member = plv8.execute(`SELECT *  FROM team_schema.team_member_table WHERE team_member_id='${teamMemberId}';`)[0];

    const isApprover = member.team_member_role === 'OWNER' || member.team_member_role === 'ADMIN';
    if (!isApprover) throw new Error("User is not an Approver");

    plv8.execute(`UPDATE ticket_schema.ticket_table SET ticket_status='UNDER REVIEW', ticket_status_date_updated = NOW(), ticket_approver_team_member_id = '${teamMemberId}' WHERE ticket_id='${ticketId}' RETURNING *;`)[0];

    const updatedTicket = plv8.execute(`SELECT tt.*, tct.ticket_category
      FROM ticket_schema.ticket_table tt
      INNER JOIN ticket_schema.ticket_category_table tct ON tct.ticket_category_id = tt.ticket_category_id
      WHERE ticket_id='${ticketId}';
    `)[0];

    const requester = plv8.execute(
      `
        SELECT tmt.team_member_id,
        tmt.team_member_role,
        json_build_object(
          'user_id', usert.user_id,
          'user_first_name', usert.user_first_name,
          'user_last_name', usert.user_last_name,
          'user_avatar', usert.user_avatar,
          'user_email', usert.user_email
        ) AS team_member_user
        FROM team_schema.team_member_table tmt
        JOIN user_schema.user_table usert ON tmt.team_member_user_id = usert.user_id
        WHERE
          tmt.team_member_id='${updatedTicket.ticket_requester_team_member_id}'
      `
    )[0];

    const approver = plv8.execute(
      `
        SELECT tmt.team_member_id,
        tmt.team_member_role,
        json_build_object(
          'user_id', usert.user_id,
          'user_first_name', usert.user_first_name,
          'user_last_name', usert.user_last_name,
          'user_avatar', usert.user_avatar,
          'user_email', usert.user_email
        ) AS team_member_user
        FROM team_schema.team_member_table tmt
        JOIN user_schema.user_table usert ON tmt.team_member_user_id = usert.user_id
        WHERE
          tmt.team_member_id='${teamMemberId}'
      `
    )[0];

    returnData = {...updatedTicket, ticket_requester: requester, ticket_approver: approver}
 });
 return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION update_ticket_status(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
     ticketId,
     status,
     rejectionMessage
    } = input_data;

    returnData = plv8.execute(`UPDATE ticket_schema.ticket_table SET ticket_status='${status.toUpperCase()}' WHERE ticket_id='${ticketId}' RETURNING *;`)[0];

 });
 return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION fetch_ticket_list(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let return_value
  plv8.subtransaction(function(){
    const {
      teamId,
      page,
      limit,
      requester,
      approver,
      status,
      sort,
      category,
      search,
      columnAccessor
    } = input_data;

    const start = (page - 1) * limit;

    const ticket_list = plv8.execute(
      `
        SELECT DISTINCT
          ticket_table.*,
          ticket_category_table.ticket_category,
          user_table.user_id,
          user_table.user_first_name,
          user_table.user_last_name,
          user_table.user_username,
          user_table.user_avatar
        FROM ticket_schema.ticket_table
        INNER JOIN team_schema.team_member_table ON ticket_requester_team_member_id = team_member_table.team_member_id
        INNER JOIN ticket_schema.ticket_category_table ON ticket_category_table.ticket_category_id = ticket_table.ticket_category_id
        INNER JOIN user_schema.user_table ON team_member_table.team_member_user_id = user_table.user_id
        WHERE team_member_table.team_member_team_id = '${teamId}'
        ${requester}
        ${approver}
        ${status}
        ${category}
        ${search}
        ORDER BY ${columnAccessor} ${sort}
        OFFSET ${start} ROWS FETCH FIRST ${limit} ROWS ONLY
      `
    );

    const ticket_count = plv8.execute(
      `
        SELECT DISTINCT COUNT(*)
        FROM ticket_schema.ticket_table
        INNER JOIN team_schema.team_member_table ON ticket_table.ticket_requester_team_member_id = team_member_table.team_member_id
        WHERE team_member_table.team_member_team_id = '${teamId}'
        ${requester}
        ${approver}
        ${status}
        ${category}
        ${search}
      `
    )[0];

    const ticket_data = ticket_list.map(ticket => {
      const approver_list = plv8.execute(
        `
        SELECT
        user_id,
        user_first_name,
        user_last_name,
        user_username,
        user_avatar
        FROM ticket_schema.ticket_table
        LEFT JOIN team_schema.team_member_table ON ticket_approver_team_member_id = team_member_id
        LEFT JOIN user_schema.user_table ON team_member_table.team_member_user_id = user_table.user_id
        WHERE ticket_id = '${ticket.ticket_id}'
        `
      )[0];
      return {
          ticket_approver_team_member_id: ticket.ticket_approver_team_member_id,
          ticket_category: ticket.ticket_category,
          ticket_category_id: ticket.ticket_category_id,
          ticket_date_created: ticket.ticket_date_created,
          ticket_id: ticket.ticket_id,
          ticket_is_disabled: ticket.ticket_is_disabled,
          ticket_requester_team_member_id: ticket.ticket_requester_team_member_id,
          ticket_requester_user: {
            user_avatar: ticket.user_avatar,
            user_first_name: ticket.user_first_name,
            user_id: ticket.user_id,
            user_last_name: ticket.user_last_name,
            user_username: ticket.user_username
          },
          ticket_approver_user: {
            user_avatar: approver_list.user_avatar,
            user_first_name: approver_list.user_first_name,
            user_id: approver_list.user_id,
            user_last_name: approver_list.user_last_name,
            user_username: approver_list.user_username
          },
          ticket_status: ticket.ticket_status,
          ticket_status_date_updated: ticket.ticket_status_date_updated
        }
    });

    returnData = {
      data: ticket_data,
      count: Number(ticket_count.count)
    };
  });
  return returnData
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION analyze_item(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData;
plv8.subtransaction(function(){
  const {
    itemName,
    teamId,
    page,
    limit
  } = input_data;

  const start = (page - 1) * limit;

  const skippedField = [
    "General Name",
    "GL Account",
    "CSI Code",
    "Division Description",
    "Level 2 Major Group Description",
    "Level 2 Minor Group Description",
    "Preferred Supplier",
    "Requesting Project",
    "Type",
    "Date Needed",
    "Purpose"
  ]

  const itemGeneralNameList = plv8.execute(
    `
      SELECT
        request_response_table.*,
        request_status,
        request_formsly_id,
        request_id
      FROM request_schema.request_response_table
      INNER JOIN public.request_view ON request_id = request_response_request_id
        AND request_is_disabled = false
      WHERE
        request_response_field_id = 'b2c899e8-4ac7-4019-819e-d6ebcae71f41'
        AND request_response = '"${itemName}"'
      ORDER BY request_date_created DESC
      LIMIT '${limit}'
      OFFSET '${start}'
    `
  );

  returnData = itemGeneralNameList.map((item) => {
    const itemDescription = [];
    let csiCodeDescription = "";
    let quantity = 0;
    let uom = "";

    const itemDescriptionList = plv8.execute(
      `
        SELECT
          request_response_table.*,
          field_name
        FROM request_schema.request_response_table
        INNER JOIN form_schema.field_table ON field_id = request_response_field_id
        WHERE
          request_response_request_id = '${item.request_response_request_id}' AND
          request_response_duplicatable_section_id ${
            item.request_response_duplicatable_section_id !== null ?
              ` = '${item.request_response_duplicatable_section_id}'` :
              "IS NULL"
          }
      `
    );

    itemDescriptionList.forEach((description) => {
      if(skippedField.includes(description.field_name)) return;

      switch(description.field_name){
        case "Base Unit of Measurement": uom = description.request_response; break;
        case "Quantity": quantity = description.request_response; break;
        case "CSI Code Description": csiCodeDescription = description.request_response; break;
        default:
          itemDescription.push({
            field_name: description.field_name,
            request_response: description.request_response
          });
      }
    })

    return {
      request_id: item.request_id,
      request_formsly_id: item.request_formsly_id,
      item_description: itemDescription,
      csi_code_description: csiCodeDescription,
      quantity: quantity,
      unit_of_measurement: uom,
      request_status: item.request_status
    }
  });
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_edit_request_on_load(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData;
plv8.subtransaction(function(){
  const {
    userId,
    requestId: initialRequestId,
    referenceOnly
  } = input_data;

  const teamId = plv8.execute(`SELECT public.get_user_active_team_id($1)`, [userId])[0].get_user_active_team_id;
  if (!teamId) throw new Error("No team found");

  const isUUID = (str) => {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidPattern.test(str);
  }

  let requestId = initialRequestId;
  if(!isUUID(requestId)){
    requestId = plv8.execute(`SELECT request_id FROM public.request_view WHERE request_formsly_id = '${initialRequestId}'`)[0].request_id;
  }

  const requestData = plv8.execute(
    `
      SELECT
        request_form_id,
        request_status,
        user_id
      FROM request_schema.request_table
      INNER JOIN team_schema.team_member_table ON team_member_id = request_team_member_id
      INNER JOIN user_schema.user_table ON user_id = team_member_user_id
      WHERE
        request_id = '${requestId}'
        AND request_is_disabled = false
    `
  )[0];

  if(!referenceOnly){
    const isNotLRF = requestData.request_form_id !== '582fefa5-3c47-4c2e-85c8-6ba0d6ccd55a';
    if (requestData.request_status !== 'PENDING' && isNotLRF) throw new Error("Request can't be edited")
    if (!userId === requestData.user_id && isNotLRF) throw new Error("Requests can only be edited by the request creator")
  }

  const duplicatableSectionIdList = plv8.execute(
    `
      SELECT DISTINCT(request_response_duplicatable_section_id)
      FROM request_schema.request_response_table
      WHERE
        request_response_request_id = '${requestId}'
        AND request_response_duplicatable_section_id IS NOT NULL
    `
  ).map(response => response.request_response_duplicatable_section_id);

  formData = plv8.execute(`SELECT public.create_request_page_on_load('{ "formId": "${requestData.request_form_id}", "userId": "${userId}", "connectedRequestFormslyId": "${initialRequestId}" }')`)[0].create_request_page_on_load;

  returnData = {
    ...formData,
    duplicatableSectionIdList,
    requestId
  }
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION fetch_dashboard_top_requestor(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      formId,
      startDate,
      endDate,
      page,
      limit
    } = input_data;

    const start = (page - 1) * limit;

    const topRequestorList = plv8.execute(`
        WITH requestor_counts AS (
            SELECT
                request_team_member_id,
                COUNT(*) AS requestor_count,
                COUNT(*) FILTER (WHERE request_status = 'PENDING') AS pending_count,
                COUNT(*) FILTER (WHERE request_status = 'APPROVED') AS approved_count,
                COUNT(*) FILTER (WHERE request_status = 'REJECTED') AS rejected_count
            FROM request_schema.request_table
            WHERE
                request_is_disabled = false
                AND request_date_created BETWEEN '${startDate}' AND '${endDate}'
                AND request_form_id = '${formId}'
            GROUP BY request_team_member_id
        )
        SELECT *
        FROM requestor_counts
        ORDER BY requestor_count DESC
        LIMIT ${limit}
        OFFSET ${start}
    `);

    const teamMemberList = topRequestorList.map(requestor => {
      return {
        request: [
          { label: 'Pending', value: Number(requestor.pending_count) },
          { label: 'Approved', value: Number(requestor.approved_count) },
          { label: 'Rejected', value: Number(requestor.rejected_count) },
        ],
        total: Number(requestor.requestor_count),
        team_member_id: requestor.request_team_member_id
      }
    });

    returnData = teamMemberList;
 });
 return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_equipment_part_list(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      equipmentId,
      limit,
      page,
      search
    } = input_data;

    const start = (page - 1) * limit;

    const data = plv8.execute(
      `
        SELECT
          equipment_part_table.*,
          equipment_general_name AS equipment_part_general_name,
          equipment_brand AS equipment_part_brand,
          equipment_model AS equipment_part_model,
          equipment_unit_of_measurement AS equipment_part_unit_of_measurement,
          equipment_component_category AS equipment_part_component_category
        FROM equipment_schema.equipment_part_table
        LEFT JOIN equipment_schema.equipment_general_name_table
          ON equipment_part_general_name_id = equipment_general_name_id
          AND equipment_general_name_is_disabled = false
        LEFT JOIN equipment_schema.equipment_brand_table
          ON equipment_part_brand_id = equipment_brand_id
          AND equipment_brand_is_disabled = false
        LEFT JOIN equipment_schema.equipment_model_table
          ON equipment_part_model_id = equipment_model_id
          AND equipment_model_is_disabled = false
        LEFT JOIN unit_of_measurement_schema.equipment_unit_of_measurement_table
          ON equipment_part_unit_of_measurement_id = equipment_unit_of_measurement_id
          AND equipment_unit_of_measurement_is_disabled = false
        LEFT JOIN equipment_schema.equipment_component_category_table
          ON equipment_part_component_category_id = equipment_component_category_id
          AND equipment_component_category_is_disabled = false
        WHERE
          equipment_part_equipment_id = '${equipmentId}'
          AND equipment_part_is_disabled = false
          ${
            search &&
            `
              AND (
                equipment_general_name ILIKE '%${search}%'
                OR equipment_part_number ILIKE '%${search}%'
              )
            `
          }
        ORDER BY equipment_general_name
        LIMIT ${limit}
        OFFSET '${start}'
      `
    );

    const count = plv8.execute(
      `
        SELECT COUNT(equipment_part_id) FROM equipment_schema.equipment_part_table
        LEFT JOIN equipment_schema.equipment_general_name_table
          ON equipment_part_general_name_id = equipment_general_name_id
          AND equipment_general_name_is_disabled = false
        LEFT JOIN equipment_schema.equipment_brand_table
          ON equipment_part_brand_id = equipment_brand_id
          AND equipment_brand_is_disabled = false
        LEFT JOIN equipment_schema.equipment_model_table
          ON equipment_part_model_id = equipment_model_id
          AND equipment_model_is_disabled = false
        LEFT JOIN unit_of_measurement_schema.equipment_unit_of_measurement_table
          ON equipment_part_unit_of_measurement_id = equipment_unit_of_measurement_id
          AND equipment_unit_of_measurement_is_disabled = false
        LEFT JOIN equipment_schema.equipment_component_category_table
          ON equipment_part_component_category_id = equipment_component_category_id
          AND equipment_component_category_is_disabled = false
        WHERE
          equipment_part_equipment_id = '${equipmentId}'
          AND equipment_part_is_disabled = false
          ${
            search &&
            `
              AND (
                equipment_general_name ILIKE '%${search}%'
                OR equipment_part_number ILIKE '%${search}%'
              )
            `
          }
      `
    )[0].count;

    returnData = {
      data,
      count: Number(count)
    };
 });
 return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_item_section_choices(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      equipmentId,
      generalName: initialGeneralName,
      componentCategory: initialComponentCategory,
      brand: initialBrand,
      model: initialModel,
      index,
      limit
    } = input_data;

    const generalName = initialGeneralName ? initialGeneralName.replace("*", "''") : undefined;
    const componentCategory = initialComponentCategory ? initialComponentCategory.replace("*", "''") : undefined;
    const brand = initialBrand ? initialBrand.replace("*", "''") : undefined;
    const model = initialModel ? initialModel.replace("*", "''") : undefined;

    let order = "equipment_general_name";

    if (model) {
      order = `equipment_part_number`;
    } else if (brand){
      order = `equipment_model`;
    } else if (componentCategory){
      order = `equipment_brand`;
    } else if (generalName){
      order = `equipment_component_category`;
    }

    const data = plv8.execute(
      `
        SELECT * FROM (
          SELECT
            equipment_part_id,
            equipment_general_name,
            ${generalName ? "equipment_component_category, " : ""}
            ${componentCategory ? "equipment_brand, " : ""}
            ${brand ? "equipment_model, " : ""}
            ${model ? "equipment_part_number, " : ""}
            ROW_NUMBER() OVER (PARTITION BY ${order}) AS row_number
          FROM equipment_schema.equipment_part_table
          INNER JOIN equipment_schema.equipment_general_name_table ON equipment_general_name_id = equipment_part_general_name_id
          INNER JOIN equipment_schema.equipment_table ON equipment_id = equipment_part_equipment_id
          INNER JOIN equipment_schema.equipment_component_category_table ON equipment_component_category_id = equipment_part_component_category_id
          INNER JOIN equipment_schema.equipment_brand_table ON equipment_brand_id = equipment_part_brand_id
          INNER JOIN equipment_schema.equipment_model_table ON equipment_model_id = equipment_part_model_id
          INNER JOIN unit_of_measurement_schema.equipment_unit_of_measurement_table ON equipment_unit_of_measurement_id = equipment_part_unit_of_measurement_id
          WHERE
            equipment_part_is_disabled = false
            AND equipment_part_is_available = true
            AND equipment_general_name_is_disabled = false
            AND equipment_general_name_is_available = true
            ${equipmentId ? `AND equipment_part_equipment_id = '${equipmentId}'` : ""}
            AND equipment_is_disabled = false
            AND equipment_is_available = true
            ${generalName ? `AND equipment_general_name = '${generalName}'` : ""}
            AND equipment_component_category_is_disabled = false
            AND equipment_component_category_is_available = true
            ${componentCategory ? `AND equipment_component_category = '${componentCategory}'` : ""}
            AND equipment_brand_is_disabled = false
            AND equipment_brand_is_available = true
            ${brand ? `AND equipment_brand = '${brand}'` : ""}
            AND equipment_model_is_disabled = false
            AND equipment_model_is_available = true
            ${model ? `AND equipment_model = '${model}'` : ""}
            AND equipment_unit_of_measurement_is_disabled = false
            AND equipment_unit_of_measurement_is_available = true
        ) AS subquery
        WHERE row_number = 1
        ORDER BY ${order}
        LIMIT ${limit}
        OFFSET ${index}
      `
    );

    returnData = data.map(value => {
      const { row_number, ...returnValue } = value;
      return returnValue;
    })
  });
  return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION fetch_dashboard_top_signer(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      formId,
      startDate,
      endDate,
      page,
      limit
    } = input_data;

    const start = (page - 1) * limit;

    const topSignerList = plv8.execute(`
      WITH signer_counts AS (
        SELECT
          signer_team_member_id,
          COUNT(*) AS signer_count,
          COUNT(*) FILTER (WHERE request_status = 'PENDING') AS pending_count,
          COUNT(*) FILTER (WHERE request_status = 'APPROVED') AS approved_count,
          COUNT(*) FILTER (WHERE request_status = 'REJECTED') AS rejected_count
        FROM request_schema.request_signer_table
        INNER JOIN form_schema.signer_table
          ON signer_id = request_signer_signer_id
          AND signer_is_disabled = false
        INNER JOIN request_schema.request_table
          ON request_id = request_signer_request_id
          AND request_is_disabled = false
          AND request_date_created BETWEEN '${startDate}' AND '${endDate}'
          AND request_form_id = '${formId}'
        WHERE
          request_status != 'CANCELED'
        GROUP BY signer_team_member_id
      )
      SELECT *
      FROM signer_counts
      ORDER BY signer_count DESC
      LIMIT ${limit}
      OFFSET ${start}
    `);

    const teamMemberList = topSignerList.map(signer => {
      return {
        request: [
          { label: 'Pending', value: Number(signer.pending_count) },
          { label: 'Approved', value: Number(signer.approved_count) },
          { label: 'Rejected', value: Number(signer.rejected_count) },
        ],
        total: Number(signer.signer_count),
        team_member_id: signer.signer_team_member_id
      }
    });

    returnData = teamMemberList;
 });
 return returnData;
$$ LANGUAGE plv8;


CREATE OR REPLACE FUNCTION leave_team(
  team_id TEXT,
  team_member_id TEXT
)
RETURNS VOID
SET search_path TO ''
AS $$
  plv8.subtransaction(function(){
    const teamMember = plv8.execute(`SELECT * FROM team_schema.team_member_table WHERE team_member_team_id='${team_id}' AND team_member_id='${team_member_id}'`)[0];
    const isUserOwner = teamMember.team_member_role === 'OWNER';
    if(isUserOwner) throw new Error('Owner cannot leave the team');

    plv8.execute(`UPDATE team_schema.team_member_table SET team_member_is_disabled=TRUE WHERE team_member_team_id='${team_id}' AND team_member_id='${team_member_id}'`);

    const userTeamList = plv8.execute(`SELECT * FROM team_schema.team_member_table WHERE team_member_user_id='${teamMember.team_member_user_id}' AND team_member_is_disabled=FALSE`);

    if (userTeamList.length > 0) {
      plv8.execute(`UPDATE user_schema.user_table SET user_active_team_id='${userTeamList[0].team_member_team_id}' WHERE user_id='${teamMember.team_member_user_id}'`);
    } else {
      plv8.execute(`UPDATE user_schema.user_table SET user_active_team_id=NULL WHERE user_id='${teamMember.team_member_user_id}'`);
    }
 });
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION redirect_to_new_team(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      userId,
      teamId,
      app
    } = input_data;

    plv8.execute(`UPDATE user_schema.user_table SET user_active_team_id = '${teamId}' WHERE user_id = '${userId}'`);

    const teamMember = plv8.execute(`SELECT * FROM team_schema.team_member_table WHERE team_member_user_id = '${userId}' AND team_member_team_id = '${teamId}'`)[0];

    let formList = [];

    if(teamMember){
      const formData = plv8.execute(
        `
          SELECT *
          FROM form_schema.form_table
          INNER JOIN team_schema.team_member_table ON team_member_id = form_team_member_id
            AND team_member_team_id = '${teamId}'
          WHERE
            form_is_disabled = false
            AND form_app = '${app}'
          ORDER BY form_date_created DESC
        `
      );

      formList = formData.map(form => {
        return {
          form_app: form.form_app,
          form_date_created: form.form_date_created,
          form_description: form.form_description,
          form_id: form.form_id,
          form_is_disabled: form.form_is_disabled,
          form_is_for_every_member: form.form_is_for_every_member,
          form_is_formsly_form: form.form_is_formsly_form,
          form_is_hidden: form.form_is_hidden,
          form_is_signature_required: form.form_is_signature_required,
          form_name: form.form_name,
          form_team_group: [],
          form_team_member: {
            team_member_date_created: form.team_member_date_created,
            team_member_id: form.team_member_id,
            team_member_is_disabled: form.team_member_is_disabled,
            team_member_role: form.team_member_role,
            team_member_team_id: form.team_member_team_id,
            team_member_user_id: form.team_member_user_id
          },
          form_team_member_id: form.form_team_member_id
        }
      })
    }

    returnData = {
      teamMember,
      formList
    }
 });
 return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION format_team_name_to_url_key(team_name TEXT)
RETURNS TEXT
SET search_path TO ''
AS $$
BEGIN
  RETURN LOWER(regexp_replace(team_name, '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION analyze_user_issued_item(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      teamMemberId,
      startDate,
      endDate
    } = input_data;


    const requestListData = plv8.execute(`
      SELECT request_id
      FROM request_schema.request_table
      WHERE request_team_member_id='${teamMemberId}'
      AND request_form_id='d13b3b0f-14df-4277-b6c1-7c80f7e7a829'
      AND request_status='APPROVED'
      AND request_date_created BETWEEN '${startDate}' AND '${endDate}'
      ORDER BY request_date_created DESC;
    `);

    if(requestListData.length<=0) {
      returnData = { data: [] }
      return;
    }

    const requestListQuery = requestListData.map(request=>`'${request.request_id}'`).join(",");

    const skippedField = [
      "GL Account",
      "CSI Code Description",
      "CSI Code",
      "Division Description",
      "Level 2 Major Group Description",
      "Level 2 Minor Group Description",
      "Preferred Supplier",
      "Requesting Project",
      "Type",
      "Date Needed",
      "Purpose"
    ]

    const skippedFieldQuery = skippedField.map(field=>`'${field}'`).join(",");

    const responseListData = plv8.execute(`
      SELECT
        rrt.*,
        ft.field_name,
        ft.field_section_id
      FROM request_schema.request_response_table rrt
      INNER JOIN form_schema.field_table ft ON rrt.request_response_field_id = ft.field_id
      WHERE rrt.request_response_request_id IN (${requestListQuery})
      AND ft.field_name NOT IN (${skippedFieldQuery});
    `);

    const itemSpecificList = {};

    responseListData.forEach(item => {
      const key = `${item.request_response_request_id}-${item.request_response_duplicatable_section_id || ''}`;

      if (!itemSpecificList[key]) {
        itemSpecificList[key] = [];
      }

      itemSpecificList[key].push({
        request_response_id: item.request_response_id,
        request_response: JSON.parse(item.request_response),
        request_response_duplicatable_section_id: item.request_response_duplicatable_section_id,
        request_response_request_id: item.request_response_request_id,
        request_response_field_id: item.request_response_field_id,
        field_name: item.field_name,
        field_section_id: item.field_section_id,
      });
    });

    const nonUniqueitemList = [];

    for (const key in itemSpecificList) {
      const items = itemSpecificList[key];

      const formattedItem = {
          itemName: "",
          itemUom: "",
          itemQuantity: 0,
          variation: [{
            quantity: 0,
            specification: []
          }]
      };



      items.forEach(item => {
        switch (item.field_name) {
          case "General Name":
            formattedItem.itemName = item.request_response;
            break;
          case "Base Unit of Measurement":
            formattedItem.itemUom = item.request_response;
            break;
          case "Quantity":
            formattedItem.itemQuantity = item.request_response;
            formattedItem.variation[0].quantity = item.request_response;
            break;
          default:
            formattedItem.variation[0].specification.push({
              fieldName: item.field_name,
              response: `${item.request_response}`
            });
            break;
        }
      });

      nonUniqueitemList.push(formattedItem);
    }

    const mergedItems = [];

    Object.values(nonUniqueitemList).forEach((item) => {
      const existingItem = mergedItems.find(
        (mergedItem) =>
          mergedItem.itemName === item.itemName &&
          mergedItem.itemUom === item.itemUom
      );

      if (existingItem) {
        const existingVariation = existingItem.variation.find(
          (variation) =>
            JSON.stringify(variation.specification) ===
            JSON.stringify(item.variation[0].specification)
        );

        if (existingVariation) {
          existingVariation.quantity += Number(item.variation[0].quantity);
        } else {
          existingItem.variation.push(item.variation[0]);
        }
          existingItem.itemQuantity = existingItem.variation
            .map((spec) => spec.quantity)
            .reduce((a, c) => a + c, 0);
      } else {
        mergedItems.push({ ...item });
      }
    });

    const itemList = mergedItems.sort((a, b) => b.itemQuantity - a.itemQuantity);

    returnData = {
      data: itemList,
    }
 });
 return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION create_memo(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let new_memo_data;
  plv8.subtransaction(function(){
    const {
      memoData,
      signerData,
      lineItemData
    } = input_data;

    const memo_count = plv8.execute(`SELECT COUNT(*) FROM memo_schema.memo_table WHERE memo_reference_number = '${memoData.memo_reference_number}'`)[0].count;
    const memo_version = (Number(memo_count) + 1);
    memoData.memo_version = memo_version;

    new_memo_data = plv8.execute(`
      INSERT INTO memo_schema.memo_table (
        memo_team_id,
        memo_author_user_id,
        memo_subject,
        memo_reference_number,
        memo_version
      )
      VALUES (
        '${memoData.memo_team_id}',
        '${memoData.memo_author_user_id}',
        '${memoData.memo_subject}',
        '${memoData.memo_reference_number}',
        '${memoData.memo_version}'
      )
      RETURNING *;
    `)[0];

    plv8.execute(`INSERT INTO memo_schema.memo_date_updated_table (memo_date_updated_memo_id) VALUES ('${new_memo_data.memo_id}')`);
    plv8.execute(`INSERT INTO memo_schema.memo_status_table (memo_status_memo_id) VALUES ('${new_memo_data.memo_id}')`);

    const signerTableValues = signerData.map((signer) => `('${signer.memo_signer_is_primary}','${signer.memo_signer_order}','${signer.memo_signer_team_member_id}', '${new_memo_data.memo_id}')`).join(",");

    plv8.execute(`INSERT INTO memo_schema.memo_signer_table (memo_signer_is_primary, memo_signer_order, memo_signer_team_member_id, memo_signer_memo_id) VALUES ${signerTableValues}`);

    let lineItemTableValues = [];
    let lineItemAttachmentTableValues = [];

    lineItemData.forEach((lineItem, lineItemIndex) => {
      const lineItemValues = `('${lineItem.memo_line_item_id}', '${lineItem.memo_line_item_content}', '${lineItemIndex}', '${new_memo_data.memo_id}')`

      lineItemTableValues.push(lineItemValues)

      if (lineItem.memo_line_item_attachment) {

        const lineItemAttachmentValues = `('${lineItem.memo_line_item_attachment_name}', '${lineItem.memo_line_item_attachment_caption}', '${lineItem.memo_line_item_attachment_storage_bucket}', '${lineItem.memo_line_item_attachment_public_url}', '${lineItem.memo_line_item_id}')`

        lineItemAttachmentTableValues.push(lineItemAttachmentValues)
      }
    });

    plv8.execute(`
      INSERT INTO memo_schema.memo_line_item_table (
        memo_line_item_id,
        memo_line_item_content,
        memo_line_item_order,
        memo_line_item_memo_id
      ) VALUES
      ${lineItemTableValues.join(",")}
    `);

    if (lineItemAttachmentTableValues.length > 0) {
      plv8.execute(`
        INSERT INTO memo_schema.memo_line_item_attachment_table (
          memo_line_item_attachment_name,
          memo_line_item_attachment_caption,
          memo_line_item_attachment_storage_bucket,
          memo_line_item_attachment_public_url,
          memo_line_item_attachment_line_item_id
        ) VALUES
        ${lineItemAttachmentTableValues.join(",")}
      `);
    }

    const activeTeamResult = plv8.execute(`SELECT * FROM team_schema.team_table WHERE team_id='${memoData.memo_team_id}';`);
    const activeTeam = activeTeamResult.length > 0 ? activeTeamResult[0] : null;
    const memo_author_data = plv8.execute(`SELECT user_first_name, user_last_name FROM user_schema.user_table WHERE user_id = '${memoData.memo_author_user_id}' LIMIT 1`)[0];

    const signerNotificationInput = signerData.map((signer) => ({notification_app: 'REQUEST', notification_content: `${memo_author_data.user_first_name} ${memo_author_data.user_last_name} requested you to sign his/her memo`, notification_redirect_url: '', notification_team_id: memoData.memo_team_id, notification_type: 'MEMO-APPROVAL', notification_user_id: signer.memo_signer_user_id}));


    if (activeTeam && memo_author_data) {
      const teamNameUrlKeyResult = plv8.execute(`SELECT public.format_team_name_to_url_key('${activeTeam.team_name}') AS url_key;`);
      const teamNameUrlKey = teamNameUrlKeyResult.length > 0 ? teamNameUrlKeyResult[0].url_key : null;

      if (teamNameUrlKey) {
        const notificationValues = signerNotificationInput
        .map(
          (notification) =>
            `('${notification.notification_app}','${notification.notification_content}','/${teamNameUrlKey}/memo/${new_memo_data.memo_id}','${notification.notification_team_id}','${notification.notification_type}','${notification.notification_user_id}')`
        )
        .join(",");

        plv8.execute(`INSERT INTO public.notification_table (notification_app,notification_content,notification_redirect_url,notification_team_id,notification_type,notification_user_id) VALUES ${notificationValues};`);
      }
    }

 });
 return new_memo_data;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_memo_on_load(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let memo_data_on_load;
  plv8.subtransaction(function() {
    const { memo_id, team_id, current_user_id } = input_data;

    const currentUser = plv8.execute(`
      SELECT *
      FROM team_schema.team_member_table
      WHERE team_member_user_id = '${current_user_id}' AND team_member_team_id = '${team_id}'`)[0];

    if (currentUser) {
      const hasUserReadMemo = plv8.execute(`
        SELECT COUNT(*)
        FROM memo_schema.memo_read_receipt_table
        WHERE memo_read_receipt_by_team_member_id = '${currentUser.team_member_id}'
        AND memo_read_receipt_memo_id = '${memo_id}';
      `)[0];

      if (Number(hasUserReadMemo.count) === 0) {
        plv8.execute(`
          INSERT INTO memo_schema.memo_read_receipt_table (memo_read_receipt_by_team_member_id, memo_read_receipt_memo_id)
          VALUES ('${currentUser.team_member_id}', '${memo_id}')
        `);
      }
    }

    const memo_data_raw = plv8.execute(`
      SELECT *
      FROM memo_schema.memo_table
      INNER JOIN user_schema.user_table ON user_table.user_id = memo_author_user_id
      INNER JOIN memo_schema.memo_date_updated_table ON memo_date_updated_memo_id = memo_id
      INNER JOIN memo_schema.memo_status_table ON memo_status_memo_id = memo_id
      WHERE memo_id = '${memo_id}' AND memo_is_disabled = false
      LIMIT 1;
    `)[0];

    if (memo_data_raw.length === 0) {
      memo_data_on_load = {};
    }

    const {
      memo_subject,
      memo_reference_number,
      memo_date_created,
      memo_version,
      memo_date_updated,
      memo_status,
      user_id,
      user_avatar,
      user_first_name,
      user_last_name,
      user_job_title,
      user_signature_attachment_id
    } = memo_data_raw;

    const memo_data = {
      memo_id: memo_data_raw.memo_id,
      memo_subject,
      memo_reference_number,
      memo_date_created,
      memo_date_updated,
      memo_status,
      memo_version,
      memo_author_user: {
        user_id,
        user_avatar,
        user_first_name,
        user_last_name,
        user_job_title,
        user_signature_attachment_id
      }
    };

    const signer_data_raw = plv8.execute(`
      SELECT
        mst.*,
        tm.*,
        ut.*,
        json_agg(sht.*) as signature_list
      FROM memo_schema.memo_signer_table mst
      INNER JOIN team_schema.team_member_table tm ON tm.team_member_id = mst.memo_signer_team_member_id
      INNER JOIN user_schema.user_table ut ON ut.user_id = tm.team_member_user_id
      LEFT JOIN history_schema.signature_history_table sht ON sht.signature_history_user_id = ut.user_id
      WHERE mst.memo_signer_memo_id = '${memo_id}'
      GROUP BY mst.memo_signer_id, tm.team_member_id, ut.user_id;
    `);

    const signer_data = signer_data_raw.map(row => {
      let signature_public_url = "";
      const signatureList = row.signature_list || [];
      const defaultSignature = signatureList[signatureList.length - 1];

      const sortedSignatures = signatureList.slice().sort((a, b) => {
        const aTime = new Date(a.signature_history_date_created).getTime();
        const bTime = new Date(b.signature_history_date_created).getTime();
        return aTime - bTime;
      });

      const signedDate = new Date(row.memo_signer_date_signed).getTime();

      const signatureMatch = sortedSignatures.find((signature, index) => {
        if (!signature) {
            return false;
        }
        const nextSignatureDateCreatedTime = index < sortedSignatures.length - 1
            ? new Date(sortedSignatures[index + 1].signature_history_date_created).getTime()
            : 0;
        return signedDate < nextSignatureDateCreatedTime;
      });

      if (signatureMatch) {
        signature_public_url = signatureMatch.signature_history_value;
      } else {
        signature_public_url = defaultSignature
          ? defaultSignature.signature_history_value
          : "";
      }

      const newSignerData = {
        memo_signer_id: row.memo_signer_id,
        memo_signer_status: row.memo_signer_status,
        memo_signer_is_primary: row.memo_signer_is_primary,
        memo_signer_order: row.memo_signer_order,
        memo_signer_date_created: row.memo_signer_date_created,
        memo_signer_date_signed: row.memo_signer_date_signed,
        memo_signer_team_member: {
          team_member_id: row.team_member_id,
          user: {
            user_id: row.user_id,
            user_first_name: row.user_first_name,
            user_last_name: row.user_last_name,
            user_avatar: row.user_avatar,
            user_job_title: row.user_job_title
          }
        },
        memo_signer_signature_public_url: signature_public_url,
        signatureList
      };
      return newSignerData;
    });

    const line_item_data_raw = plv8.execute(`
      SELECT *
      FROM memo_schema.memo_line_item_table
      LEFT JOIN memo_schema.memo_line_item_attachment_table mat ON mat.memo_line_item_attachment_line_item_id = memo_line_item_id
      WHERE memo_line_item_memo_id = '${memo_id}'
    `);

    const line_item_data = line_item_data_raw.map(row => ({
      memo_line_item_id: row.memo_line_item_id,
      memo_line_item_content: row.memo_line_item_content,
      memo_line_item_date_created: row.memo_line_item_date_created,
      memo_line_item_date_updated: row.memo_line_item_date_updated,
      memo_line_item_order: row.memo_line_item_order,
      memo_line_item_attachment: {
        memo_line_item_attachment_id: row.memo_line_item_attachment_id,
        memo_line_item_attachment_name: row.memo_line_item_attachment_name,
        memo_line_item_attachment_caption: row.memo_line_item_attachment_caption,
        memo_line_item_attachment_storage_bucket:
          row.memo_line_item_attachment_storage_bucket,
        memo_line_item_attachment_public_url:
          row.memo_line_item_attachment_public_url,
        memo_line_item_attachment_line_item_id:
          row.memo_line_item_attachment_line_item_id
      }
    })).sort((a, b) => a.memo_line_item_order - b.memo_line_item_order);

    const read_receipt_data = plv8.execute(`
      SELECT memo_read_receipt_table.*, user_id, user_first_name, user_last_name, user_avatar, user_employee_number
      FROM memo_schema.memo_read_receipt_table
      INNER JOIN team_schema.team_member_table ON team_member_id = memo_read_receipt_by_team_member_id
      INNER JOIN user_schema.user_table ON user_id = team_member_user_id
      LEFT JOIN user_schema.user_employee_number_table ON user_id = user_employee_number_user_id
      WHERE memo_read_receipt_memo_id = '${memo_id}'
    `);

    const agreement_data = plv8.execute(`
      SELECT memo_agreement_table.*, user_id, user_first_name, user_last_name, user_avatar, user_employee_number
      FROM memo_schema.memo_agreement_table
      INNER JOIN team_schema.team_member_table ON team_member_id = memo_agreement_by_team_member_id
      INNER JOIN user_schema.user_table ON user_id = team_member_user_id
      LEFT JOIN user_schema.user_employee_number_table ON user_id = user_employee_number_user_id
      WHERE memo_agreement_memo_id = '${memo_id}'
    `);

    memo_data_on_load = {
      ...memo_data,
      memo_signer_list: signer_data,
      memo_line_item_list: line_item_data,
      memo_read_receipt_list: read_receipt_data,
      memo_agreement_list: agreement_data
    };
  });
  return memo_data_on_load;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_memo_list(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let return_value;
  plv8.subtransaction(function(){
    const {
      teamId,
      page,
      limit,
      authorFilter,
      approverFilter,
      status,
      sort,
      searchFilter,
      columnAccessor
    } = input_data;

    const start = (page - 1) * limit;

    const memo_list = plv8.execute(
      `
        SELECT
        memo_table.*,
        memo_status_table.memo_status as memo_status,
        memo_date_updated_table.memo_date_updated as memo_date_updated,
        JSONB_BUILD_OBJECT(
            'user_id', user_table.user_id,
            'user_avatar', user_table.user_avatar,
            'user_first_name', user_table.user_first_name,
            'user_last_name', user_table.user_last_name
        ) AS memo_author_user,
        ARRAY_AGG(
          DISTINCT JSONB_BUILD_OBJECT(
            'memo_signer_id', memo_signer_id,
            'memo_signer_status', memo_signer_status,
            'memo_signer_is_primary', memo_signer_is_primary,
            'memo_signer_order', memo_signer_order,
            'memo_signer_team_member', JSONB_BUILD_OBJECT(
              'team_member_id', team_member_table.team_member_id,
              'user', JSONB_BUILD_OBJECT(
                'user_id', team_member_user_table.user_id,
                'user_first_name', team_member_user_table.user_first_name,
                'user_last_name', team_member_user_table.user_last_name,
                'user_avatar', team_member_user_table.user_avatar
              )
            )
          )
        ) AS memo_signer_list
        FROM memo_schema.memo_table
        INNER JOIN user_schema.user_table ON user_table.user_id = memo_table.memo_author_user_id
        INNER JOIN memo_schema.memo_date_updated_table ON memo_date_updated_memo_id = memo_table.memo_id
        INNER JOIN memo_schema.memo_status_table ON memo_status_memo_id = memo_table.memo_id
        LEFT JOIN memo_schema.memo_signer_table ON memo_signer_table.memo_signer_memo_id = memo_table.memo_id
        LEFT JOIN team_schema.team_member_table ON team_member_table.team_member_id = memo_signer_table.memo_signer_team_member_id
        LEFT JOIN user_schema.user_table AS team_member_user_table ON team_member_user_table.user_id = team_member_table.team_member_user_id
        LEFT JOIN memo_schema.memo_line_item_table ON memo_line_item_table.memo_line_item_memo_id = memo_table.memo_id
        WHERE
          memo_team_id = '${teamId}'
          AND memo_is_disabled = false
          ${authorFilter}
          ${approverFilter}
          ${status}
          ${searchFilter ? `AND to_tsvector(memo_subject || ' ' || memo_line_item_table.memo_line_item_content) @@ to_tsquery('${searchFilter}')` : ''}
        GROUP BY
          memo_id,
          user_table.user_id,
          memo_status_table.memo_status,
          memo_date_updated_table.memo_date_updated
        ORDER BY ${columnAccessor} ${sort}
        OFFSET ${start} ROWS FETCH FIRST ${limit} ROWS ONLY
      `
    );

    const memo_count = plv8.execute(`
      SELECT COUNT(DISTINCT memo_table.memo_id)
      FROM memo_schema.memo_table
      INNER JOIN memo_schema.memo_date_updated_table ON memo_date_updated_memo_id = memo_id
      INNER JOIN memo_schema.memo_status_table ON memo_status_memo_id = memo_id
      LEFT JOIN memo_schema.memo_line_item_table ON memo_line_item_table.memo_line_item_memo_id = memo_id
      LEFT JOIN memo_schema.memo_signer_table ON memo_signer_table.memo_signer_memo_id = memo_id
      WHERE
          memo_team_id = '${teamId}'
          AND memo_is_disabled = false
          ${authorFilter}
          ${approverFilter}
          ${status}
          ${searchFilter ? `AND to_tsvector(memo_line_item_table.memo_line_item_content) @@ to_tsquery('${searchFilter}')` : ''}
    `)[0];

    return_value = {data: memo_list, count: Number(memo_count.count)}
 });
 return return_value;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION edit_memo(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  plv8.subtransaction(function(){
    const {
      memo_id,
      memo_subject,
      memoSignerTableValues,
      memoLineItemTableValues,
      memoLineItemAttachmentTableValues,
      memoLineItemIdFilter
    } = input_data;

    plv8.execute(`UPDATE memo_schema.memo_table SET memo_subject = '${memo_subject}' WHERE memo_id = '${memo_id}'`);

    plv8.execute(`UPDATE memo_schema.memo_date_updated_table SET memo_date_updated = NOW() WHERE memo_date_updated_memo_id = '${memo_id}'`);

    plv8.execute(`DELETE FROM memo_schema.memo_signer_table WHERE memo_signer_memo_id = '${memo_id}'`);

    plv8.execute(`DELETE FROM memo_schema.memo_line_item_table WHERE memo_line_item_memo_id = '${memo_id}'`);

    plv8.execute(`DELETE FROM memo_schema.memo_line_item_attachment_table WHERE memo_line_item_attachment_line_item_id IN (${memoLineItemIdFilter})`);

    plv8.execute(`INSERT INTO memo_schema.memo_signer_table (memo_signer_is_primary, memo_signer_order, memo_signer_team_member_id, memo_signer_memo_id) VALUES ${memoSignerTableValues}`);

    plv8.execute(`INSERT INTO memo_schema.memo_line_item_table (memo_line_item_id, memo_line_item_content, memo_line_item_order, memo_line_item_memo_id) VALUES ${memoLineItemTableValues}`);

    if (memoLineItemAttachmentTableValues) {
      plv8.execute(`INSERT INTO memo_schema.memo_line_item_attachment_table (memo_line_item_attachment_name,memo_line_item_attachment_caption,memo_line_item_attachment_storage_bucket,memo_line_item_attachment_public_url,memo_line_item_attachment_line_item_id) VALUES ${memoLineItemAttachmentTableValues}`);
    }
 });
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_memo_reference_on_load(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let memo_data_on_load;
  plv8.subtransaction(function(){

    const {memo_id, current_user_id} = input_data;

    const currentUser = plv8.execute(`
      SELECT *
      FROM team_schema.team_member_table
      INNER JOIN user_schema.user_table ON user_id = team_member_user_id
      WHERE team_member_user_id = '${current_user_id}'
      LIMIT 1
    `)[0];

    const memo_data_raw = plv8.execute(
      `
      SELECT *
      FROM memo_schema.memo_table
      WHERE memo_id = '${memo_id}' AND memo_is_disabled = false
      LIMIT 1;
      `
    )[0];

    if (memo_data_raw.length === 0) {
        memo_data_on_load = {};
    }

    const {memo_subject, memo_reference_number} = memo_data_raw;

    const {user_id, user_avatar, user_first_name, user_last_name, user_job_title, user_signature_attachment_id} = currentUser;

    const memo_data = {
        memo_id: memo_data_raw.memo_id,
        memo_subject,
        memo_reference_number,
        memo_author_user: {
            user_id,
            user_avatar,
            user_first_name,
            user_last_name,
            user_job_title,
            user_signature_attachment_id
        }
    };

    const signer_data_raw = plv8.execute(`
      SELECT
        mst.*,
        tm.*,
        ut.*,
        json_agg(sht.*) as signature_list
      FROM memo_schema.memo_signer_table mst
      INNER JOIN team_schema.team_member_table tm ON tm.team_member_id = mst.memo_signer_team_member_id
      INNER JOIN user_schema.user_table ut ON ut.user_id = tm.team_member_user_id
      LEFT JOIN history_schema.signature_history_table sht ON sht.signature_history_user_id = ut.user_id
      WHERE mst.memo_signer_memo_id = '${memo_id}'
      GROUP BY mst.memo_signer_id, tm.team_member_id, ut.user_id;
    `);

    const signer_data = signer_data_raw.map(row => {
      let signature_public_url = "";
      const signatureList = row.signature_list || [];
      const defaultSignature = signatureList[signatureList.length - 1];

      if (defaultSignature) {
        signature_public_url = defaultSignature
          ? defaultSignature.signature_history_value
          : "";
      }

      const newSignerData = {
        memo_signer_id: row.memo_signer_id,
        memo_signer_status: row.memo_signer_status,
        memo_signer_is_primary: row.memo_signer_is_primary,
        memo_signer_order: row.memo_signer_order,
        memo_signer_date_created: row.memo_signer_date_created,
        memo_signer_date_signed: row.memo_signer_date_signed,
        memo_signer_team_member: {
          team_member_id: row.team_member_id,
          user: {
            user_id: row.user_id,
            user_first_name: row.user_first_name,
            user_last_name: row.user_last_name,
            user_avatar: row.user_avatar,
            user_job_title: row.user_job_title
          }
        },
        memo_signer_signature_public_url: signature_public_url
      };
      return newSignerData;
    });

    const line_item_data_raw = plv8.execute(`
        SELECT *
        FROM memo_schema.memo_line_item_table
        LEFT JOIN memo_schema.memo_line_item_attachment_table mat ON mat.memo_line_item_attachment_line_item_id = memo_line_item_id
        WHERE memo_line_item_memo_id = '${memo_id}'
    `);

    const line_item_data = line_item_data_raw.map(row => ({
        memo_line_item_id: row.memo_line_item_id,
        memo_line_item_content: row.memo_line_item_content,
        memo_line_item_date_created: row.memo_line_item_date_created,
        memo_line_item_date_updated: row.memo_line_item_date_updated,
        memo_line_item_order: row.memo_line_item_order,
        memo_line_item_attachment: {
            memo_line_item_attachment_id: row.memo_line_item_attachment_id,
            memo_line_item_attachment_name: row.memo_line_item_attachment_name,
            memo_line_item_attachment_caption: row.memo_line_item_attachment_caption,
            memo_line_item_attachment_storage_bucket: row.memo_line_item_attachment_storage_bucket,
            memo_line_item_attachment_public_url: row.memo_line_item_attachment_public_url,
            memo_line_item_attachment_line_item_id: row.memo_line_item_attachment_line_item_id
        }
    })).sort((a, b) => a.memo_line_item_order - b.memo_line_item_order);

    memo_data_on_load = {
        ...memo_data,
        memo_signer_list: signer_data,
        memo_line_item_list: line_item_data
    }
 });
 return memo_data_on_load;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION create_reference_memo(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let new_memo_data;
  plv8.subtransaction(function() {
    const {
      memo_id,
      memo_subject,
      memo_reference_number,
      memo_team_id,
      memo_author_user_id,
      memoSignerTableValues,
      memoLineItemTableValues,
      memoLineItemAttachmentTableValues
    } = input_data;

    const memo_count = plv8.execute(`
      SELECT COUNT(*)
      FROM memo_schema.memo_table
      WHERE memo_reference_number = '${memo_reference_number}'
    `)[0].count;
    const memo_version = Number(memo_count) + 1;

    new_memo_data = plv8.execute(`
      INSERT INTO memo_schema.memo_table (
        memo_id,
        memo_team_id,
        memo_author_user_id,
        memo_subject,
        memo_reference_number,
        memo_version
      )
      VALUES (
        '${memo_id}',
        '${memo_team_id}',
        '${memo_author_user_id}',
        '${memo_subject}',
        '${memo_reference_number}',
        '${memo_version}'
      )
      RETURNING *;
    `)[0];

    plv8.execute(`
      INSERT INTO memo_schema.memo_date_updated_table (memo_date_updated_memo_id)
      VALUES ('${new_memo_data.memo_id}')
    `);

    plv8.execute(`
      INSERT INTO memo_schema.memo_status_table (memo_status_memo_id)
      VALUES ('${new_memo_data.memo_id}')
    `);

    plv8.execute(`
      INSERT INTO memo_schema.memo_signer_table (
        memo_signer_is_primary,
        memo_signer_order,
        memo_signer_team_member_id,
        memo_signer_memo_id
      )
      VALUES ${memoSignerTableValues}
    `);

    plv8.execute(`
      INSERT INTO memo_schema.memo_line_item_table (
        memo_line_item_id,
        memo_line_item_content,
        memo_line_item_order,
        memo_line_item_memo_id
      )
      VALUES ${memoLineItemTableValues}
    `);

    if (memoLineItemAttachmentTableValues) {
      plv8.execute(`
        INSERT INTO memo_schema.memo_line_item_attachment_table (
          memo_line_item_attachment_name,
          memo_line_item_attachment_caption,
          memo_line_item_attachment_storage_bucket,
          memo_line_item_attachment_public_url,
          memo_line_item_attachment_line_item_id
        )
        VALUES ${memoLineItemAttachmentTableValues}
      `);
    }
    ;
  });
  return new_memo_data;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION update_user(
  input_data JSON
)
RETURNS VOID
SET search_path TO ''
AS $$
  plv8.subtransaction(function(){
    const {
      userData,
      previousUsername,
      previousSignatureUrl
    } = input_data;

    const userDataUpdate = [];
    for(const key in userData){
      if(key !== "user_id"){
        userDataUpdate.push(`${key} = '${userData[key]}'`)
      }
    }
    plv8.execute(`UPDATE user_schema.user_table SET ${userDataUpdate.join(", ")} WHERE user_id = '${userData.user_id}'`);

    if(previousUsername){
      plv8.execute(`INSERT INTO history_schema.user_name_history_table (user_name_history_value, user_name_history_user_id) VALUES ('${previousUsername}', '${userData.user_id}')`);
    }
    if(previousSignatureUrl){
      plv8.execute(`INSERT INTO history_schema.signature_history_table (signature_history_value, signature_history_user_id) VALUES ('${previousSignatureUrl}', '${userData.user_id}')`);
    }
 });
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_query_data(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      queryId
    } = input_data;

    const selectedQuery = plv8.execute(`SELECT * FROM lookup_schema.query_table WHERE query_id='${queryId}';`)[0];

    const fetchedData = plv8.execute(selectedQuery.query_sql);

    BigInt.prototype.toJSON = function () {
    return this.toString();
    };

    returnData ={queryData: JSON.stringify(fetchedData)}
 });
 return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_signer_sla(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      teamId,
      formId,
      projectId,
      singerId,
      status,
      page,
      limit
    } = input_data;

    const start = (page - 1) * limit;

    let projectQuery = "";
    if(Boolean(projectId)){
      projectQuery = ` AND st.signer_team_project_id = '${projectId}' `
    }
    let statusQuery = "";
    if(status!=='ALL'){
      statusQuery = `AND CASE
        WHEN (EXTRACT(EPOCH FROM (rst.request_signer_status_date_updated-rt.request_date_created)) / 3600) <= 1 THEN 'PASSED'
        ELSE 'FAILED'
      END = '${status}' `
    }

    const thresholdHours = plv8.execute(`
      SELECT form_sla_hours FROM form_schema.form_sla_table
      WHERE
        form_sla_team_id = '${teamId}'
        AND form_sla_form_id = '${formId}';
    `)[0].form_sla_hours;

    const signerRequestList = plv8.execute(`
        SELECT
          rt.request_id,
          rt.request_date_created,
          rt.request_formsly_id_prefix || '-' || rt.request_formsly_id_serial AS formsly_id,
          rst.request_signer_status_date_updated,
          (rst.request_signer_status_date_updated-rt.request_date_created) AS time_difference,
          CASE
            WHEN (EXTRACT(EPOCH FROM (rst.request_signer_status_date_updated-rt.request_date_created)) / 3600) <= ${thresholdHours} THEN 'PASSED'
            ELSE 'FAILED'
          END AS status
        FROM request_schema.request_signer_table rst
          INNER JOIN request_schema.request_table rt ON rt.request_id = rst.request_signer_request_id
          INNER JOIN form_schema.signer_table st ON st.signer_id = rst.request_signer_signer_id
        WHERE
          rst.request_signer_status_date_updated IS NOT NULL
          AND rst.request_signer_signer_id = '${singerId}'
          AND st.signer_form_id = '${formId}'
          ${statusQuery}
          ${projectQuery}
        ORDER BY rt.request_date_created DESC
        LIMIT '${limit}' OFFSET '${start}';
    `);

    const totalCountQuery = plv8.execute(`
        SELECT COUNT(*) AS total_count
        FROM request_schema.request_signer_table rst
          INNER JOIN request_schema.request_table rt ON rt.request_id = rst.request_signer_request_id
          INNER JOIN form_schema.signer_table st ON st.signer_id = rst.request_signer_signer_id
        WHERE
          rst.request_signer_status_date_updated IS NOT NULL
          AND rst.request_signer_signer_id = '${singerId}'
          AND st.signer_form_id = '${formId}'
          ${statusQuery}
          ${projectQuery}
    `);

    returnData = {
      signerRequestSLA: signerRequestList,
      slaHours: thresholdHours,
      signerRequestSLACount: Number(`${totalCountQuery[0].total_count}`)
    }
 });
 return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_incident_report(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      reporteeId,
      interval,
      year,
      month
    } = input_data;

    let data = []
    if(interval==='Monthly'){
      data = plv8.execute(`
        SELECT
            DATE_TRUNC('month', tt.ticket_date_created) AS date,
            COUNT(*) AS report_count
        FROM
            ticket_schema.ticket_response_table trt
            INNER JOIN ticket_schema.ticket_field_table  tft ON tft.ticket_field_id = trt.ticket_response_field_id
            INNER JOIN ticket_schema.ticket_section_table  tst ON tst.ticket_section_id = tft.ticket_field_section_id
            INNER JOIN ticket_schema.ticket_category_table  tct ON tct.ticket_category_id = tst.ticket_section_category_id
            INNER JOIN ticket_schema.ticket_table  tt ON tt.ticket_id = trt.ticket_response_ticket_id
        WHERE
            trt.ticket_response_value ILIKE '%' || '${reporteeId}' || '%'
            AND tft.ticket_field_name='Reportee'
            AND tt.ticket_status = 'CLOSED'
            AND EXTRACT(YEAR FROM tt.ticket_date_created) = ${year}
        GROUP BY
            DATE_TRUNC('month', tt.ticket_date_created)
        ORDER BY
            date;
      `);

    }else{
      data = plv8.execute(`
        SELECT
            DATE_TRUNC('day', tt.ticket_date_created) AS date,
            COUNT(*) AS report_count
        FROM
            ticket_schema.ticket_response_table trt
            INNER JOIN ticket_schema.ticket_field_table tft ON tft.ticket_field_id = trt.ticket_response_field_id
            INNER JOIN ticket_schema.ticket_section_table tst ON tst.ticket_section_id = tft.ticket_field_section_id
            INNER JOIN ticket_schema.ticket_category_table tct ON tct.ticket_category_id = tst.ticket_section_category_id
            INNER JOIN ticket_schema.ticket_table tt ON tt.ticket_id = trt.ticket_response_ticket_id
        WHERE
            trt.ticket_response_value ILIKE '%' || '${reporteeId}' || '%'
            AND tft.ticket_field_name = 'Reportee'
            AND tt.ticket_status = 'CLOSED'
            AND EXTRACT(YEAR FROM tt.ticket_date_created) = ${year}
            AND EXTRACT(MONTH FROM tt.ticket_date_created) = ${month}
        GROUP BY
            DATE_TRUNC('day', tt.ticket_date_created)
        ORDER BY
            date;
      `);
    }

    BigInt.prototype.toJSON = function() {
        return this.toString()
    }
    returnData={interval,month,year,data:JSON.stringify(data)}
 });
 return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_ticket_list_on_load(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      userId,
    } = input_data;

    const teamId = plv8.execute(`SELECT public.get_user_active_team_id($1)`, [userId])[0].get_user_active_team_id;

    const ticketList = plv8.execute(`SELECT public.fetch_ticket_list('{"teamId":"${teamId}", "page":"1", "limit":"13", "requester":"", "approver":"", "category":"", "status":"", "search":"", "sort":"DESC", "columnAccessor": "ticket_date_created"}');`)[0].fetch_ticket_list;

    const ticketCategoryList = plv8.execute(`SELECT * FROM ticket_schema.ticket_category_table WHERE ticket_category_is_disabled = false`);

    returnData = {ticketList: ticketList.data, ticketListCount: ticketList.count, ticketCategoryList}
 });
 return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_create_ticket_on_load(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      userId
    } = input_data;

    const teamId = plv8.execute(`SELECT public.get_user_active_team_id($1)`, [userId])[0].get_user_active_team_id;

    const member = plv8.execute(
      `
        SELECT tmt.team_member_id,
        tmt.team_member_role,
        json_build_object(
          'user_id', usert.user_id,
          'user_first_name', usert.user_first_name,
          'user_last_name', usert.user_last_name,
          'user_avatar', usert.user_avatar,
          'user_email', usert.user_email
        ) AS team_member_user
        FROM team_schema.team_member_table tmt
        JOIN user_schema.user_table usert ON tmt.team_member_user_id = usert.user_id
        WHERE
          tmt.team_member_team_id='${teamId}'
          AND tmt.team_member_is_disabled=false
          AND usert.user_is_disabled=false
          AND usert.user_id='${userId}';
      `
    )[0];

    const categoryList = plv8.execute(`SELECT * FROM ticket_schema.ticket_category_table WHERE ticket_category_is_disabled = false`);

    returnData = { member, categoryList }
 });
 return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION create_custom_csi(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      itemName,
      csiCodeDescription,
      csiCode
    } = input_data;

    const csiCodeArray = csiCode.split(" ");
    const csi_code_division_id = csiCodeArray[0];
    const csi_code_level_two_major_group_id = csiCodeArray[1][0];
    const csi_code_level_two_minor_group_id = csiCodeArray[1][1];
    const csi_code_level_three_id = csiCodeArray[2];

    const referrence = plv8.execute(`
      SELECT *
      FROM lookup_schema.csi_code_table
      WHERE
        csi_code_division_id = '${csi_code_division_id}'
        AND csi_code_level_two_major_group_id = '${csi_code_level_two_major_group_id}'
        AND csi_code_level_two_minor_group_id = '${csi_code_level_two_minor_group_id}';
    `)[0];

    if(referrence){
    const csi = plv8.execute(`
      INSERT INTO lookup_schema.csi_code_table (csi_code_section, csi_code_division_id, csi_code_division_description, csi_code_level_two_major_group_id,csi_code_level_two_major_group_description, csi_code_level_two_minor_group_id, csi_code_level_two_minor_group_description, csi_code_level_three_id, csi_code_level_three_description)
      VALUES ('${csiCode}','${csi_code_division_id}','${referrence.csi_code_division_description}','${csi_code_level_two_major_group_id}','${referrence.csi_code_level_two_major_group_description}','${csi_code_level_two_minor_group_id}','${referrence.csi_code_level_two_minor_group_description}','${csi_code_level_three_id}','${csiCodeDescription}')
      RETURNING *;
     `)[0];

    const item = plv8.execute(`
      SELECT *
      FROM item_schema.item_table
      WHERE item_general_name = '${itemName}'
    `)[0];

    const itemDivision = plv8.execute(`
      SELECT *
      FROM item_schema.item_division_table
      WHERE item_division_item_id='${item.item_id}'
      AND item_division_value='${csi_code_division_id}';
    `);

    if(itemDivision.length<=0){
     plv8.execute(`
      INSERT INTO item_schema.item_division_table (item_division_value, item_division_item_id)
      VALUES ('${csi_code_division_id}','${item.item_id}')
      RETURNING *;
     `)[0];
    }


     returnData = Boolean(csi)
    }else{
      returnData = false
    }
 });
 return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION create_ticket(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      category,
      ticketId,
      teamMemberId,
      responseValues,
    } = input_data;

    const categoryData = plv8.execute(`SELECT * FROM ticket_schema.ticket_category_table WHERE ticket_category='${category}' LIMIT 1;`)[0];

    returnData = plv8.execute(`INSERT INTO ticket_schema.ticket_table (ticket_id,ticket_requester_team_member_id,ticket_category_id) VALUES ('${ticketId}','${teamMemberId}','${categoryData.ticket_category_id}') RETURNING *;`)[0];

    plv8.execute(`INSERT INTO ticket_schema.ticket_response_table (ticket_response_value,ticket_response_duplicatable_section_id,ticket_response_field_id,ticket_response_ticket_id) VALUES ${responseValues};`);

 });
 return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION edit_ticket(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      ticketId,
      responseValues,
    } = input_data;

    plv8.execute(`DELETE FROM ticket_schema.ticket_response_table WHERE ticket_response_ticket_id='${ticketId}';`);
    plv8.execute(`INSERT INTO ticket_schema.ticket_response_table (ticket_response_value,ticket_response_duplicatable_section_id,ticket_response_field_id,ticket_response_ticket_id) VALUES ${responseValues};`);

 });
 return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION ped_part_check(
  input_data JSON
)
RETURNS BOOLEAN
SET search_path TO ''
AS $$
  let returnData = false;
  plv8.subtransaction(function(){
    const {
      equipmentName,
      partName,
      partNumber,
      brand,
      model,
      unitOfMeasure,
      category
    } = input_data;

    const equipmentId = plv8.execute(`SELECT equipment_id FROM equipment_schema.equipment_table WHERE equipment_name = '${equipmentName}'`)[0].equipment_id;
    const generalNameId = plv8.execute(`SELECT equipment_general_name_id FROM equipment_schema.equipment_general_name_table WHERE equipment_general_name = '${partName}'`);
    const brandId = plv8.execute(`SELECT equipment_brand_id FROM equipment_schema.equipment_brand_table WHERE equipment_brand = '${brand}'`);
    const modelId = plv8.execute(`SELECT equipment_model_id FROM equipment_schema.equipment_model_table WHERE equipment_model = '${model}'`);
    const uomId = plv8.execute(`SELECT equipment_unit_of_measurement_id FROM unit_of_measurement_schema.equipment_unit_of_measurement_table WHERE equipment_unit_of_measurement = '${unitOfMeasure}'`);
    const categoryId = plv8.execute(`SELECT equipment_component_category_id FROM equipment_schema.equipment_component_category_table WHERE equipment_component_category = '${category}'`);

    if(generalNameId.length === 0 || brandId.length === 0 || modelId.length === 0 || uomId.length === 0 || categoryId.length === 0) {
      returnData = false;
      return;
    }

    const partData = plv8.execute(
      `
        SELECT * FROM equipment_schema.equipment_part_table
        WHERE
          equipment_part_is_disabled = false
          AND equipment_part_equipment_id = '${equipmentId}'
          AND equipment_part_general_name_id = '${generalNameId[0].equipment_general_name_id}'
          AND regexp_replace(equipment_part_number, '[^a-zA-Z0-9]', '', 'g') = '${partNumber}'
          AND equipment_part_brand_id = '${brandId[0].equipment_brand_id}'
          AND equipment_part_model_id = '${modelId[0].equipment_model_id}'
          AND equipment_part_unit_of_measurement_id = '${uomId[0].equipment_unit_of_measurement_id}'
          AND equipment_part_component_category_id = '${categoryId[0].equipment_component_category_id}'
      `
    );

    returnData = Boolean(partData.length);
 });
 return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION create_ped_part_from_ticket_request(
  input_data JSON
)
RETURNS VOID
SET search_path TO ''
AS $$
  plv8.subtransaction(function(){
    const {
      equipmentName,
      partName,
      partNumber,
      brand,
      model,
      unitOfMeasure,
      category,
      teamId
    } = input_data;

    const equipmentId = plv8.execute(`SELECT equipment_id FROM equipment_schema.equipment_table WHERE equipment_name = '${equipmentName}' AND equipment_is_disabled = false`)[0].equipment_id;
    let generalNameId = plv8.execute(`SELECT equipment_general_name_id FROM equipment_schema.equipment_general_name_table WHERE equipment_general_name = '${partName}' AND equipment_general_name_is_disabled = false`);
    let brandId = plv8.execute(`SELECT equipment_brand_id FROM equipment_schema.equipment_brand_table WHERE equipment_brand = '${brand}' AND equipment_brand_is_disabled = false`);
    let modelId = plv8.execute(`SELECT equipment_model_id FROM equipment_schema.equipment_model_table WHERE equipment_model = '${model}' AND equipment_model_is_disabled = false`);
    let uomId = plv8.execute(`SELECT equipment_unit_of_measurement_id FROM unit_of_measurement_schema.equipment_unit_of_measurement_table WHERE equipment_unit_of_measurement = '${unitOfMeasure}' AND equipment_unit_of_measurement_is_disabled = false`);
    let categoryId = plv8.execute(`SELECT equipment_component_category_id FROM equipment_schema.equipment_component_category_table WHERE equipment_component_category = '${category}' AND equipment_component_category_is_disabled = false`);

    if(generalNameId.length === 0){
      generalNameId = plv8.execute(
        `
          INSERT INTO equipment_schema.equipment_general_name_table
          (equipment_general_name, equipment_general_name_team_id)
          VALUES
          ('${partName}', '${teamId}')
          RETURNING *
        `
      );
    }
    if(brandId.length === 0){
      brandId = plv8.execute(
        `
          INSERT INTO equipment_schema.equipment_brand_table
          (equipment_brand, equipment_brand_team_id)
          VALUES
          ('${brand}', '${teamId}')
          RETURNING *
        `
      );
    }
    if(modelId.length === 0){
      modelId = plv8.execute(
        `
          INSERT INTO equipment_schema.equipment_model_table
          (equipment_model, equipment_model_team_id)
          VALUES
          ('${model}', '${teamId}')
          RETURNING *
        `
      );
    }
    if(uomId.length === 0){
      uomId = plv8.execute(
        `
          INSERT INTO unit_of_measurement_schema.equipment_unit_of_measurement_table
          (equipment_unit_of_measurement, equipment_unit_of_measurement_team_id)
          VALUES
          ('${unitOfMeasure}', '${teamId}')
          RETURNING *
        `
      );
    }
    if(categoryId.length === 0){
      categoryId = plv8.execute(
        `
          INSERT INTO equipment_schema.equipment_component_category_table
          (equipment_component_category, equipment_component_category_team_id)
          VALUES
          ('${category}', '${teamId}')
          RETURNING *
        `
      );
    }

    const formattedPartNumber = partNumber.replace('/[^a-zA-Z0-9]/g', '');
    const partData = plv8.execute(
      `
        SELECT * FROM equipment_schema.equipment_part_table
        WHERE
          equipment_part_is_disabled = false
          AND equipment_part_equipment_id = '${equipmentId}'
          AND equipment_part_general_name_id = '${generalNameId[0].equipment_general_name_id}'
          AND regexp_replace(equipment_part_number, '[^a-zA-Z0-9]', '', 'g') = '${formattedPartNumber}'
          AND equipment_part_brand_id = '${brandId[0].equipment_brand_id}'
          AND equipment_part_model_id = '${modelId[0].equipment_model_id}'
          AND equipment_part_unit_of_measurement_id = '${uomId[0].equipment_unit_of_measurement_id}'
          AND equipment_part_component_category_id = '${categoryId[0].equipment_component_category_id}'
      `
    );

    if(partData.length !== 0) return;

    plv8.execute(
      `
        INSERT INTO equipment_schema.equipment_part_table
          (equipment_part_number, equipment_part_general_name_id, equipment_part_brand_id, equipment_part_model_id, equipment_part_unit_of_measurement_id, equipment_part_component_category_id, equipment_part_equipment_id)
        VALUES
          ('${partNumber}', '${generalNameId[0].equipment_general_name_id}', '${brandId[0].equipment_brand_id}', '${modelId[0].equipment_model_id}', '${uomId[0].equipment_unit_of_measurement_id}', '${categoryId[0].equipment_component_category_id}', '${equipmentId}')
      `
    );
 });
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION check_ped_part(
  input_data JSON
)
RETURNS BOOLEAN
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      equipment_part_id,
      equipment_part_general_name_id,
      equipment_part_number,
      equipment_part_brand_id,
      equipment_part_model_id,
      equipment_part_component_category_id,
      equipment_part_equipment_id
    } = input_data;

    const partData = plv8.execute(
      `
        SELECT
          *
        FROM equipment_schema.equipment_part_table
        WHERE
          equipment_part_general_name_id = '${equipment_part_general_name_id}'
          AND regexp_replace(equipment_part_number, '[^a-zA-Z0-9]', '', 'g') = '${equipment_part_number}'
          AND equipment_part_brand_id = '${equipment_part_brand_id}'
          AND equipment_part_model_id = '${equipment_part_model_id}'
          AND equipment_part_component_category_id = '${equipment_part_component_category_id}'
          AND equipment_part_equipment_id = '${equipment_part_equipment_id}'
          AND equipment_part_is_disabled = false
          ${equipment_part_id ? `AND equipment_part_id != '${equipment_part_id}'` : ""}
      `
    );

    returnData = Boolean(partData.length);
 });
 return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_request_without_duplicatable_section(
  request_id TEXT
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function(){
    const idCondition = plv8.execute(`SELECT public.generate_request_id_condition('${request_id}')`)[0].generate_request_id_condition;

    const requestData = plv8.execute(
      `
        SELECT
          request_view.*,
          team_member_team_id,
          user_id,
          user_first_name,
          user_last_name,
          user_username,
          user_avatar,
          user_job_title,
          form_id,
          form_name,
          form_description,
          form_is_formsly_form,
          form_type,
          form_sub_type,
          team_project_name
        FROM public.request_view
        INNER JOIN team_schema.team_member_table ON team_member_id = request_team_member_id
        INNER JOIN user_schema.user_table ON user_id = team_member_user_id
        INNER JOIN form_schema.form_table ON form_id = request_form_id
        LEFT JOIN team_schema.team_project_table ON team_project_id = request_project_id
        WHERE
          ${idCondition}
          AND request_is_disabled = false
      `
    )[0];

    const isWithConditionalFields = requestData.form_is_formsly_form && ["Item", "Subcon", "PED Item", "IT Asset", "Liquidation Reimbursement", "Practical Test"].includes(requestData.form_name);

    const sectionData = plv8.execute(
      `
        SELECT *
        FROM form_schema.section_table
        WHERE section_form_id = '${requestData.form_id}'
        ORDER BY section_order ASC
      `
    );

    const formSection = sectionData.map((section, index) => {
      if (index === 0 || (index === 2 &&  ["IT Asset", "Liquidation Reimbursement"].includes(requestData.form_name))) {
        const fieldData = plv8.execute(
          `
            SELECT *
            FROM form_schema.field_table
            WHERE field_section_id = '${section.section_id}'
            ORDER BY field_order ASC
          `
        );

        fieldWithOptionAndResponse = fieldData.map(field => {
          const optionData = plv8.execute(
            `
              SELECT *
              FROM form_schema.option_table
              WHERE option_field_id = '${field.field_id}'
              ORDER BY option_order ASC
            `
          );

          const requestResponseData = plv8.execute(
            `
              SELECT *
              FROM request_schema.request_response_table
              WHERE request_response_request_id = '${requestData.request_id}'
              AND request_response_field_id = '${field.field_id}'
            `
          );

          return {
            ...field,
            field_response: requestResponseData,
            field_option: optionData
          };
        });

        return {
          ...section,
          section_field: fieldWithOptionAndResponse,
        };
      } else if (requestData.form_name === "Practical Test") {
        const fieldData = plv8.execute(
          `
            SELECT field_table.*
            FROM form_schema.field_table
            INNER JOIN request_schema.request_response_table ON request_response_field_id = field_id
              AND request_response_request_id = '${requestData.request_id}'
            WHERE field_section_id = '${section.section_id}'
            ORDER BY field_order ASC
          `
        );

        fieldWithOptionAndResponse = fieldData.map(field => {
          const optionData = plv8.execute(
            `
              SELECT *
              FROM form_schema.option_table
              WHERE option_field_id = '${field.field_id}'
              ORDER BY option_order ASC
            `
          );

          const requestResponseData = plv8.execute(
            `
              SELECT *
              FROM request_schema.request_response_table
              WHERE request_response_request_id = '${requestData.request_id}'
              AND request_response_field_id = '${field.field_id}'
            `
          );

          return {
            ...field,
            field_response: requestResponseData,
            field_option: optionData
          };
        });

        return {
          ...section,
          section_field: fieldWithOptionAndResponse,
        };
      } else {
        if (isWithConditionalFields) {
          return {
            ...section,
            section_field: []
          }
        } else {
          const fieldData = plv8.execute(
            `
              SELECT *
              FROM form_schema.field_table
              WHERE field_section_id = '${section.section_id}'
              ORDER BY field_order ASC
            `
          );
          return {
            ...section,
            section_field: fieldData
          }
        }
      }
    });

    const form = {
      form_id: requestData.form_id,
      form_name: requestData.form_name,
      form_description: requestData.form_description,
      form_is_formsly_form: requestData.form_is_formsly_form,
      form_section: formSection,
      form_type: requestData.form_type,
      form_sub_type: requestData.form_sub_type
    };

     const requestSignerData = plv8.execute(
      `
        SELECT
          request_signer_id,
          request_signer_status,
          request_signer_status_date_updated,
          signer_id,
          signer_is_primary_signer,
          signer_action,
          signer_order,
          signer_form_id,
          team_member_id,
          user_id,
          user_first_name,
          user_last_name,
          user_job_title,
          attachment_value
        FROM request_schema.request_signer_table
        INNER JOIN form_schema.signer_table ON signer_id = request_signer_signer_id
        INNER JOIN team_schema.team_member_table ON team_member_id = signer_team_member_id
        INNER JOIN user_schema.user_table ON user_id = team_member_user_id
        LEFT JOIN public.attachment_table on attachment_id = user_signature_attachment_id
        WHERE request_signer_request_id = '${requestData.request_id}'
      `
    );

    returnData = {
      request_id: requestData.request_id,
      request_formsly_id: requestData.request_formsly_id,
      request_date_created: requestData.request_date_created,
      request_status: requestData.request_status,
      request_is_disabled: requestData.request_is_disabled,
      request_team_member_id: requestData.request_team_member_id,
      request_form_id: requestData.request_form_id,
      request_project_id: requestData.request_project_id,
      request_jira_id: requestData.request_jira_id,
      request_jira_link: requestData.request_jira_link,
      request_otp_id: requestData.request_otp_id,
      request_form: form,
      request_team_member: {
        team_member_team_id: requestData.team_member_team_id,
        team_member_user: {
          user_id: requestData.user_id,
          user_first_name: requestData.user_first_name,
          user_last_name: requestData.user_last_name,
          user_username: requestData.user_username,
          user_avatar: requestData.user_avatar,
          user_job_title: requestData.user_job_title
        }
      },
      request_project: {
        team_project_name: requestData.team_project_name
      },
      request_signer: requestSignerData.map(requestSigner => {
        return {
          request_signer_id: requestSigner.request_signer_id,
          request_signer_status: requestSigner.request_signer_status,
          request_signer_status_date_updated: requestSigner.request_signer_status_date_updated,
          request_signer_signer: {
            signer_id: requestSigner.signer_id,
            signer_is_primary_signer: requestSigner.signer_is_primary_signer,
            signer_action: requestSigner.signer_action,
            signer_order: requestSigner.signer_order,
            signer_form_id: requestSigner.signer_form_id,
            signer_team_member:{
              team_member_id: requestSigner.team_member_id,
              team_member_user:{
                user_id: requestSigner.user_id,
                user_first_name: requestSigner.user_first_name,
                user_last_name: requestSigner.user_last_name,
                user_job_title: requestSigner.user_job_title,
                user_signature_attachment_id: requestSigner.attachment_value
              }
            },
          },
        }
      }),
    };
 });
 return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION fetch_request_page_section(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = [];
plv8.subtransaction(function() {
  const {
    index,
    requestId,
    sectionId,
    fieldData,
    duplicatableSectionIdCondition,
    withOption
  } = input_data;

  const specialSection = [
    '0672ef7d-849d-4bc7-81b1-7a5eefcc1451',
    'b232d5a5-6212-405e-8d35-5f9127dca1aa',
    '64f87323-ac4a-4fb5-9d64-0be89806fdf9'
  ];

  const teamId = plv8.execute(`
    SELECT team_member_team_id
    FROM request_schema.request_table
    INNER JOIN team_schema.team_member_table ON team_member_id = request_team_member_id
    WHERE request_id = '${requestId}'
    LIMIT 1
  `)[0].team_member_team_id;


  if (!teamId) throw new Error("No team found");

  if (!fieldData) {
    const fieldList = plv8.execute(`
      SELECT DISTINCT field_table.*
      FROM form_schema.field_table
      INNER JOIN request_schema.request_response_table ON request_response_field_id = field_id
      WHERE ${specialSection.includes(sectionId) ? `
        field_section_id IN ('0672ef7d-849d-4bc7-81b1-7a5eefcc1451', 'b232d5a5-6212-405e-8d35-5f9127dca1aa', '64f87323-ac4a-4fb5-9d64-0be89806fdf9')` : `
        field_section_id = '${sectionId}'`
      }
      AND request_response_request_id = '${requestId}'
      AND (
        request_response_duplicatable_section_id IN (${duplicatableSectionIdCondition})
        ${index === 0 ? "OR request_response_duplicatable_section_id IS NULL" : ""}
      )
      ORDER BY field_order ASC
    `);

    let fieldWithResponse = fieldList.map(field => {
      const requestResponseData = plv8.execute(`
        SELECT *
        FROM request_schema.request_response_table
        WHERE request_response_request_id = '${requestId}'
        AND request_response_field_id = '${field.field_id}'
        AND (
          request_response_duplicatable_section_id IN (${duplicatableSectionIdCondition})
          ${index === 0 ? "OR request_response_duplicatable_section_id IS NULL" : ""}
        )
      `);

      let requestOptionData = [];
      if (withOption) {
        if (field.field_special_field_template_id) {
          switch (field.field_special_field_template_id) {
            case "c3a2ab64-de3c-450f-8631-05f4cc7db890":
              const teamMemberList = plv8.execute(`
                SELECT user_id, user_first_name, user_last_name
                FROM team_schema.team_member_table
                INNER JOIN user_schema.user_table ON user_id = team_member_user_id
                WHERE team_member_team_id = '${teamId}'
                ORDER BY user_last_name
              `);
              requestOptionData = teamMemberList.map((item, index) => ({
                option_id: item.user_id,
                option_value: item.user_last_name + ', ' + item.user_first_name,
                option_order: index,
                option_field_id: field.field_id
              }));
              break;

            case "ff007180-4367-4cf2-b259-7804867615a7":
              const csiCodeList = plv8.execute(`
                SELECT csi_code_id, csi_code_section
                FROM lookup_schema.csi_code_table LIMIT 1000
              `);
              requestOptionData = csiCodeList.map((item, index) => ({
                option_id: item.csi_code_id,
                option_value: item.csi_code_section,
                option_order: index,
                option_field_id: field.field_id
              }));
              break;
          }
        } else {
          requestOptionData = plv8.execute(`
            SELECT *
            FROM form_schema.option_table
            WHERE option_field_id = '${field.field_id}'
          `);
        }
      }

      return {
        ...field,
        field_response: requestResponseData,
        field_option: requestOptionData
      };
    });

    returnData = fieldWithResponse;
  } else {
    let fieldWithResponse = fieldData.map(field => {
      const requestResponseData = plv8.execute(`
        SELECT *
        FROM request_schema.request_response_table
        WHERE request_response_request_id = '${requestId}'
        AND request_response_field_id = '${field.field_id}'
        AND (
          request_response_duplicatable_section_id IN (${duplicatableSectionIdCondition})
          ${index === 0 ? "OR request_response_duplicatable_section_id IS NULL" : ""}
        )
      `);

      let requestOptionData = [];
      if (withOption) {
        requestOptionData = plv8.execute(`
          SELECT *
          FROM form_schema.option_table
          WHERE option_field_id = '${field.field_id}'
        `);
      }

      return {
        ...field,
        field_response: requestResponseData,
        field_option: requestOptionData
      };
    });

    returnData = fieldWithResponse;
  }
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION generate_request_id_condition(
  request_id TEXT
)
RETURNS TEXT
SET search_path TO ''
AS $$
  let idCondition = '';
  plv8.subtransaction(function(){
    const isUUID = (str) => {
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return uuidPattern.test(str);
    }
    if(isUUID(request_id)){
      idCondition = `request_id = '${request_id}'`;
    }else{
      const formslyId = request_id.split("-");
      idCondition = `request_formsly_id_prefix = '${formslyId[0]}' AND request_formsly_id_serial = '${formslyId[1]}'`
    }
 });
 return idCondition;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION fetch_request_comment(
  request_id TEXT
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData = '';
  plv8.subtransaction(function(){
    const requestCommentData = plv8.execute(
      `
        SELECT
          comment_id,
          comment_date_created,
          comment_content,
          comment_is_edited,
          comment_last_updated,
          comment_type,
          comment_team_member_id,
          user_id,
          user_first_name,
          user_last_name,
          user_username,
          user_avatar
        FROM request_schema.comment_table
        INNER JOIN team_schema.team_member_table ON team_member_id = comment_team_member_id
        INNER JOIN user_schema.user_table ON user_id = team_member_user_id
        WHERE
          comment_request_id = '${request_id}'
        ORDER BY comment_date_created DESC
      `
    );
    returnData = requestCommentData.map(requestComment => {
      return {
        comment_id: requestComment.comment_id,
        comment_date_created: requestComment.comment_date_created,
        comment_content: requestComment.comment_content,
        comment_is_edited: requestComment.comment_is_edited,
        comment_last_updated: requestComment.comment_last_updated,
        comment_type: requestComment.comment_type,
        comment_team_member_id: requestComment.comment_team_member_id,
        comment_team_member: {
          team_member_user: {
            user_id: requestComment.user_id,
            user_first_name: requestComment.user_first_name,
            user_last_name: requestComment.user_last_name,
            user_username: requestComment.user_username,
            user_avatar: requestComment.user_avatar
          }
        }
      }
    })
 });
 return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION fetch_item_request_conditional_options(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData = [];
  plv8.subtransaction(function(){
    const {
      sectionList
    } = input_data;

    returnData = sectionList.map(section => {
      const itemCategory = plv8.execute(
        `
          SELECT
            ict.item_category,
            signer_id,
            signer_is_primary_signer,
            signer_action,
            signer_order,
            team_member_id,
            user_id,
            user_first_name,
            user_last_name,
            user_avatar
          FROM item_schema.item_table AS it
          INNER JOIN item_schema.item_category_table AS ict ON it.item_category_id = ict.item_category_id
            AND ict.item_category_is_disabled = false
          INNER JOIN form_schema.signer_table ON signer_id = item_category_signer_id
          INNER JOIN team_schema.team_member_table ON team_member_id = signer_team_member_id
          INNER JOIN user_schema.user_table ON user_id = team_member_user_id
          WHERE
            it.item_general_name = '${section.itemName}'
            AND it.item_is_disabled = false
        `
      );

      return {
        itemName: section.itemName,
        category: itemCategory.length ? {
          item_category_signer: {
            signer_id: itemCategory[0].signer_id,
            signer_is_primary_signer: itemCategory[0].signer_is_primary_signer,
            signer_action: itemCategory[0].signer_action,
            signer_order: itemCategory[0].signer_order,
            signer_team_member: {
              team_member_id: itemCategory[0].team_member_id,
              team_member_user: {
                user_id: itemCategory[0].user_id,
                user_first_name: itemCategory[0].user_first_name,
                user_last_name: itemCategory[0].user_last_name,
                user_avatar: itemCategory[0].user_avatar
              }
            }
          }
        } : null,
        fieldList: section.fieldIdList.map(field => {
          let optionData = [];
          if (field === 'a6266f0b-1339-4c50-910e-9bae73031df0' || field === '8a14bffe-2672-4a99-9943-9d7e6a7a15fa') {
            const csiData = plv8.execute(
              `
                SELECT
                  csi_code_id,
                  csi_code_level_three_description
                FROM item_schema.item_table
                LEFT JOIN item_schema.item_division_table ON item_division_item_id = item_id
                LEFT JOIN lookup_schema.csi_code_table ON csi_code_division_id = item_division_value
                WHERE
                  item_general_name = '${section.itemName}'
                  AND item_is_disabled = false
                ORDER BY csi_code_level_three_description
              `
            );
            optionData = csiData.map((csiCode, index) => {
              return {
                option_field_id: field,
                option_id: csiCode.csi_code_id,
                option_order: index,
                option_value: csiCode.csi_code_level_three_description,
              }
            });
          } else {
            const itemDescriptionData = plv8.execute(
              `
                SELECT
                  idft.item_description_field_id,
                  item_description_field_value,
                  item_description_field_uom,
                  item_description_is_with_uom
                FROM item_schema.item_table
                INNER JOIN item_schema.item_description_table ON item_description_item_id = item_id
                INNER JOIN form_schema.field_table ON field_id = item_description_field_id
                  AND field_id = '${field}'
                INNER JOIN item_schema.item_description_field_table AS idft ON idft.item_description_field_item_description_id = item_description_id
                LEFT JOIN item_schema.item_description_field_uom_table ON item_description_field_uom_item_description_field_id = idft.item_description_field_id
                WHERE
                  item_general_name = '${section.itemName}'
                  AND item_is_disabled = false
              `
            );

            optionData = itemDescriptionData.map((options, index) => {
              return {
                option_field_id: field,
                option_id: options.item_description_field_id,
                option_order: index + 1,
                option_value: `${options.item_description_field_value}${options.item_description_is_with_uom ? ` ${options.item_description_field_uom}`: ''}`,
              }
            });
          }
          return {
            fieldId: field,
            optionList: optionData
          }
        })
      }
    });
 });
 return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION fetch_ped_equipment_request_conditional_options(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData = [];
  plv8.subtransaction(function(){
    const {
      sectionList
    } = input_data;

    const fieldIdMap = {
      "2c715814-fecf-448e-9b78-460d8a536714": "equipmentName",
      "ce9d94a2-bfef-48ea-977a-b3e1918ac90e": "brand",
      "6bd08eb7-f872-4475-8323-4eca2abf4264": "model"
    }

    returnData = sectionList.map(section => {
      return {
        category: section.category,
        equipmentName: section.equipmentName,
        brand: section.brand,
        fieldList: section.fieldIdList.map(field => {
          let optionData = [];

          if (fieldIdMap[field] === "equipmentName") {
            const equipmentData = plv8.execute(
              `
                SELECT
                  DISTINCT
                  equipment_id,
                  equipment_name
                FROM equipment_schema.equipment_table
                INNER JOIN equipment_schema.equipment_category_table ON equipment_equipment_category_id = equipment_category_id
                  AND equipment_category_is_disabled = false
                  AND equipment_category_is_available = true
                WHERE
                  equipment_category = '${section.category}'
                  AND equipment_is_disabled = false
                  AND equipment_is_available = true
              `
            );
            optionData = equipmentData.map((options, index) => {
              return {
                option_field_id: field,
                option_id: options.equipment_id,
                option_order: index + 1,
                option_value: options.equipment_name
              }
            });
          } else if (fieldIdMap[field] === "brand") {
            const equipmentData = plv8.execute(
              `
                SELECT
                  DISTINCT
                  equipment_brand_id,
                  equipment_brand
                FROM equipment_schema.equipment_table
                INNER JOIN equipment_schema.equipment_category_table ON equipment_equipment_category_id = equipment_category_id
                  AND equipment_category_is_disabled = false
                  AND equipment_category_is_available = true
                INNER JOIN equipment_schema.equipment_description_table ON equipment_description_equipment_id = equipment_id
                  AND equipment_description_is_disabled = false
                  AND equipment_description_is_available = true
                INNER JOIN equipment_schema.equipment_brand_table ON equipment_brand_id = equipment_description_brand_id
                  AND equipment_brand_is_disabled = false
                  AND equipment_brand_is_available = true
                WHERE
                  equipment_category = '${section.category}'
                  AND equipment_is_disabled = false
                  AND equipment_is_available = true
              `
            );

            optionData = equipmentData.map((options, index) => {
              return {
                option_field_id: field,
                option_id: options.equipment_brand_id,
                option_order: index + 1,
                option_value: options.equipment_brand
              }
            });
            optionData.unshift({
              option_field_id: field,
              option_id: plv8.execute('SELECT extensions.uuid_generate_v4()')[0].uuid_generate_v4,
              option_order: 0,
              option_value: "ANY"
            });
          } else if (fieldIdMap[field] === "model") {
            const equipmentData = plv8.execute(
              `
                SELECT
                  DISTINCT
                  equipment_model_id,
                  equipment_model
                FROM equipment_schema.equipment_table
                INNER JOIN equipment_schema.equipment_category_table ON equipment_equipment_category_id = equipment_category_id
                  AND equipment_category_is_disabled = false
                  AND equipment_category_is_available = true
                INNER JOIN equipment_schema.equipment_description_table ON equipment_description_equipment_id = equipment_id
                  AND equipment_description_is_disabled = false
                  AND equipment_description_is_available = true
                INNER JOIN equipment_schema.equipment_brand_table ON equipment_brand_id = equipment_description_brand_id
                  AND equipment_brand_is_disabled = false
                  AND equipment_brand_is_available = true
                  AND equipment_brand = '${section.brand}'
                INNER JOIN equipment_schema.equipment_model_table ON equipment_model_id = equipment_description_model_id
                  AND equipment_model_is_disabled = false
                  AND equipment_model_is_available = true
                WHERE
                  equipment_category = '${section.category}'
                  AND equipment_is_disabled = false
                  AND equipment_is_available = true
              `
            );
            optionData = equipmentData.map((options, index) => {
              return {
                option_field_id: field,
                option_id: options.equipment_model_id,
                option_order: index + 1,
                option_value: options.equipment_model
              }
            });
            optionData.unshift({
              option_field_id: field,
              option_id: plv8.execute('SELECT extensions.uuid_generate_v4()')[0].uuid_generate_v4,
              option_order: 0,
              option_value: "ANY"
            });
          }

          return {
            fieldId: field,
            optionList: optionData
          }
        })
      }
    });
 });
 return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION create_item_category(
  input_data JSON
)
RETURNS VOID
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      formId,
      category,
      teamMemberId
    } = input_data;

    let signerData;
    signerData = plv8.execute(
      `
        SELECT signer_id FROM form_schema.signer_table
        WHERE
          signer_is_primary_signer = false
          AND signer_form_id = '${formId}'
          AND signer_team_member_id = '${teamMemberId}'
          AND signer_team_project_id IS NULL
      `
    )[0];

    if(!signerData) {
      signerData = plv8.execute(
        `
          INSERT INTO form_schema.signer_table
          (signer_is_primary_signer, signer_action, signer_order, signer_is_disabled, signer_form_id, signer_team_member_id, signer_team_project_id)
          VALUES
          (false, 'Approved', 5, true, '${formId}', '${teamMemberId}', null)
          RETURNING signer_id
        `
      )[0];
    }

    plv8.execute(
      `
        INSERT INTO item_schema.item_category_table
        (item_category, item_category_signer_id)
        VALUES
        ('${category}', '${signerData.signer_id}')
      `
    );
 });
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION update_item_category(
  input_data JSON
)
RETURNS VOID
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      category,
      teamMemberId,
      categoryId,
      formId
    } = input_data;

    let signerData;
    signerData = plv8.execute(
      `
        SELECT signer_id FROM form_schema.signer_table
        WHERE
          signer_is_primary_signer = false
          AND signer_form_id = '${formId}'
          AND signer_team_member_id = '${teamMemberId}'
          AND signer_team_project_id IS NULL
      `
    )[0];

    if(!signerData) {
      signerData = plv8.execute(
        `
          INSERT INTO form_schema.signer_table
          (signer_is_primary_signer, signer_action, signer_order, signer_is_disabled, signer_form_id, signer_team_member_id, signer_team_project_id)
          VALUES
          (false, 'Approved', 5, true, '${formId}', '${teamMemberId}', null)
          RETURNING signer_id
        `
      )[0];
    }

    plv8.execute(`UPDATE item_schema.item_category_table SET item_category = '${category}', item_category_signer_id = '${signerData.signer_id}' WHERE item_category_id = '${categoryId}'`);
 });
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_jira_automation_data(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let jira_automation_data;
  plv8.subtransaction(function(){
    const {
      teamProjectId
    } = input_data;

    const projectJiraUserData = plv8.execute(
      `
        SELECT
          jpt.jira_project_jira_id,
          jpt.jira_project_jira_label
        FROM
          jira_schema.jira_formsly_project_table jfpt
        LEFT JOIN
          jira_schema.jira_project_table jpt ON jpt.jira_project_id = jfpt.jira_project_id
        WHERE
          formsly_project_id = '${teamProjectId}'
      `
    );

    const jira_user_list = plv8.execute(
      `
        SELECT
          jua.jira_user_account_jira_id,
          jua.jira_user_account_display_name,
          jur.jira_user_role_label
        FROM
          jira_schema.jira_project_user_table jira_project_user_team_project_id
        LEFT JOIN
          jira_schema.jira_user_account_table jua ON jua.jira_user_account_id = jira_project_user_account_id
        LEFT JOIN
          jira_schema.jira_user_role_table jur ON jur.jira_user_role_id = jira_project_user_role_id
        WHERE
          jira_project_user_team_project_id = '${teamProjectId}'
      `
    );

    const jiraProjectData = {
      ...projectJiraUserData[0],
      jira_user_list
    };

    const jiraItemCategoryData = plv8.execute(
      `
        SELECT
          jira_item_category_id,
          jira_item_category_jira_id,
          jira_item_category_jira_label,
          jira_item_category_formsly_label,
          jua.jira_user_account_jira_id,
          jua.jira_user_account_display_name,
          jur.jira_user_role_label
        FROM
          jira_schema.jira_item_category_table
        LEFT JOIN jira_schema.jira_item_user_table jiu ON jiu.jira_item_user_item_category_id = jira_item_category_id
        LEFT JOIN jira_schema.jira_user_account_table jua ON jua.jira_user_account_id = jiu.jira_item_user_account_id
        LEFT JOIN jira_schema.jira_user_role_table jur ON jur.jira_user_role_id= jiu.jira_item_user_role_id
      `
    );

    const jiraOrganizationData = plv8.execute(
      `
        SELECT
          jira_organization_id,
          jira_organization_jira_id,
          jira_organization_jira_label,
          jira_organization_team_project_project_id
        FROM
          jira_schema.jira_organization_team_project_table
        INNER JOIN jira_schema.jira_organization_table jot ON jot.jira_organization_id = jira_organization_team_project_organization_id
        WHERE
          jira_organization_team_project_project_id = '${teamProjectId}'
      `
    )

    jira_automation_data = {jiraProjectData, jiraItemCategoryData, jiraOrganizationData: jiraOrganizationData[0]}
 });
 return jira_automation_data;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_approver_unresolved_request_count(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let data;
  plv8.subtransaction(function() {
    const {
      teamMemberId
    } = input_data;

    const getCount = (status, jiraIdCondition) => {
      return plv8.execute(`
        SELECT COUNT(*)
        FROM request_schema.request_signer_table
        INNER JOIN form_schema.signer_table ON signer_id = request_signer_signer_id
          AND signer_team_member_id = '${teamMemberId}'
        INNER JOIN request_schema.request_table ON request_id = request_signer_request_id
          AND request_status != 'CANCELED'
          AND request_is_disabled = false
        WHERE
          request_signer_status = '${status}'
          ${jiraIdCondition}`
      )[0].count;
    };

    const pendingRequestCount = getCount('PENDING', '');
    const totalApprovedRequestCount = getCount('APPROVED', '');
    const approvedRequestWithJiraIdCount = getCount('APPROVED', 'AND request_jira_id IS NOT NULL');
    const approvedRequestWithoutJiraIdCount = getCount('APPROVED', 'AND request_jira_id IS NULL');

    data = {
      pendingRequestCount: parseInt(pendingRequestCount),
      approvedRequestCount: {
        total: parseInt(totalApprovedRequestCount),
        withJiraId: parseInt(approvedRequestWithJiraIdCount),
        withoutJiraId: parseInt(approvedRequestWithoutJiraIdCount),
      },
    };
  });
  return data;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_admin_ticket_analytics(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData = [];
  plv8.subtransaction(function(){
    const {
      adminTeamMemberId,
      intervalList,
      ticketCategoryIdList
    } = input_data;

    const ticketCategoryCondition = ticketCategoryIdList.map(category => `'${category}'`).join(",");

    intervalList.forEach(interval => {
      const condition = `
        AND ticket_status_date_updated >= '${interval.startDate}'
        AND ticket_status_date_updated < '${interval.endDate}'
        AND ticket_approver_team_member_id = '${adminTeamMemberId}'
        AND ticket_is_disabled = false
        AND ticket_category_id IN (${ticketCategoryCondition})
      `

      const closedCount = plv8.execute(
        `
          SELECT COUNT(*)
          FROM ticket_schema.ticket_table
          WHERE
            ticket_status = 'CLOSED'
            ${condition}
        `
      )[0].count;
      const underReviewCount = plv8.execute(
        `
          SELECT COUNT(*)
          FROM ticket_schema.ticket_table
          WHERE
            ticket_status = 'UNDER REVIEW'
            ${condition}
        `
      )[0].count;
      const incorrectCount = plv8.execute(
        `
          SELECT COUNT(*)
          FROM ticket_schema.ticket_table
          WHERE
            ticket_status = 'INCORRECT'
            ${condition}
        `
      )[0].count;

      returnData.push({
        startDate: interval.startDate,
        endDate: interval.endDate,
        closedCount: Number(closedCount),
        underReviewCount: Number(underReviewCount),
        incorrectCount: Number(incorrectCount)
      });
    });
 });
 return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION handle_formsly_payment(
  input_data JSON
)
RETURNS VOID
SET search_path TO ''
AS $$
  plv8.subtransaction(function(){
    const {
      teamId,
      newExpiryDate,
      numberOfMonths,
      price
    } = input_data;
    const existingData = plv8.execute(
      `
        SELECT * FROM team_schema.team_transaction_table
        WHERE
          team_transaction_price = ${price}
          AND team_transaction_number_of_months = ${numberOfMonths}
          AND team_transaction_team_expiration_date = '${newExpiryDate}'
          AND team_transaction_team_id = '${teamId}'
      `
    );
    if(existingData.length) return;

    plv8.execute(`
      INSERT INTO team_schema.team_transaction_table
      (
        team_transaction_price,
        team_transaction_number_of_months,
        team_transaction_team_expiration_date,
        team_transaction_team_id
      )
      VALUES
      (
        ${price},
        ${numberOfMonths},
        '${newExpiryDate}',
        '${teamId}'
      )
    `);
 });
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION team_invoice_on_load(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      teamId,
      teamDateCreated,
      userId
    } = input_data;

    const currentDate = plv8.execute(`SELECT public.get_current_date()`)[0].get_current_date.toLocaleDateString();
    let expirationDate = teamDateCreated;

    const latestTransaction = plv8.execute(
      `
        SELECT team_transaction_team_expiration_date
        FROM team_schema.team_transaction_table
        WHERE
          team_transaction_team_id = '${teamId}'
        ORDER BY team_transaction_date_created DESC
        LIMIT 1
      `
    );

    const price = plv8.execute(`SELECT formsly_price FROM lookup_schema.formsly_price_table ORDER BY formsly_price_date_created DESC LIMIT 1`)[0].formsly_price;

    if (latestTransaction.length) {
      expirationDate =
        new Date(latestTransaction[0].team_transaction_team_expiration_date).toLocaleDateString();
    }
    returnData = {
      currentDate,
      expirationDate,
      price
    }
 });
 return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION fetch_form_section_with_multiple_duplicatable_section(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = [];
plv8.subtransaction(function() {
  const {
    index,
    requestId,
    duplicatableSectionIdCondition
  } = input_data;

  const fieldList = plv8.execute(`
    SELECT
      field_table.*,
      request_response_duplicatable_section_id
    FROM form_schema.field_table
    INNER JOIN request_schema.request_response_table ON request_response_field_id = field_id
      AND request_response_request_id = '${requestId}'
    WHERE
      (${duplicatableSectionIdCondition})
    ORDER BY field_order ASC
  `);

  let fieldWithResponse = fieldList.map(field => {
    const requestResponseData = plv8.execute(`
      SELECT *
      FROM request_schema.request_response_table
      WHERE request_response_request_id = '${requestId}'
      AND request_response_field_id = '${field.field_id}'
      AND request_response_duplicatable_section_id
        ${field.request_response_duplicatable_section_id ?
          `= '${field.request_response_duplicatable_section_id}'`
          : "is NULL"
        }
    `);

    return {
      ...field,
      field_response: requestResponseData[0]
    };
  });

  returnData = fieldWithResponse;
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_memo_signer_list(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = [];
plv8.subtransaction(function() {
  const {
    teamId
  } = input_data;

  const teamMemberList = plv8.execute(
    `
      SELECT
        team_member_id,
        user_id,
        user_first_name,
        user_last_name,
        user_job_title,
        user_avatar
      FROM team_schema.team_member_table
      INNER JOIN user_schema.user_table ON user_id = team_member_user_id
      WHERE
        team_member_team_id = '${teamId}'
    `
  );

  returnData = teamMemberList.map(teamMember => {
    const signatureList = plv8.execute(
      `
        SELECT *
        FROM history_schema.signature_history_table
        WHERE
          signature_history_user_id = '${teamMember.user_id}'
      `
    );

    return {
      team_member_id: teamMember.team_member_id,
      team_member_user: {
        user_id: teamMember.user_id,
        user_first_name: teamMember.user_first_name,
        user_last_name: teamMember.user_last_name,
        user_job_title: teamMember.user_job_title,
        user_avatar: teamMember.user_avatar,
        signature_list: signatureList
      }
    }
  })
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_signer_with_profile(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = [];
plv8.subtransaction(function() {
  const {
    formId,
    projectId
  } = input_data;

  const signerList = plv8.execute(
    `
      SELECT
        signer_table.*,
        team_member_table.*,
        user_table.*
      FROM form_schema.signer_table
      INNER JOIN team_schema.team_member_table ON team_member_id = signer_team_member_id
      INNER JOIN user_schema.user_table ON user_id = team_member_user_id
      WHERE
        signer_form_id = '${formId}'
        AND signer_team_project_id ${projectId.length ? `= '${projectId}'` : `IS NULL`}
    `
  );

  returnData = signerList.map(signer => {
    return {
      signer_action: signer.signer_action,
      signer_form_id: signer.signer_form_id,
      signer_id: signer.signer_id,
      signer_is_disabled: signer.signer_is_disabled,
      signer_is_primary_signer: signer.signer_is_primary_signer,
      signer_order: signer.signer_order,
      signer_team_member_id: signer.signer_team_member_id,
      signer_team_project_id: signer.signer_team_project_id,
      signer_team_member: {
        team_member_date_created: signer.team_member_date_created,
        team_member_id: signer.team_member_id,
        team_member_is_disabled: signer.team_member_is_disabled,
        team_member_role: signer.team_member_role,
        team_member_team_id: signer.team_member_team_id,
        team_member_user_id: signer.team_member_user_id,
        team_member_user: {
          user_active_app: signer.user_active_app,
          user_active_team_id: signer.user_active_team_id,
          user_avatar: signer.user_avatar,
          user_date_created: signer.user_date_created,
          user_email: signer.user_email,
          user_first_name: signer.user_first_name,
          user_id: signer.user_id,
          user_is_disabled: signer.user_is_disabled,
          user_job_title: signer.user_job_title,
          user_last_name: signer.user_last_name,
          user_phone_number: signer.user_phone_number,
          user_signature_attachment_id: signer.user_signature_attachment_id,
          user_username: signer.user_username
        }
      }
    }
  })
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_user_with_signature(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = [];
plv8.subtransaction(function() {
  const {
    userId
  } = input_data;

  const userData = plv8.execute(
    `
      SELECT
        user_table.*,
        attachment_table.*,
        user_employee_number,
        user_employee_number_is_disabled
      FROM user_schema.user_table
      LEFT JOIN public.attachment_table ON attachment_id = user_signature_attachment_id
      LEFT JOIN user_schema.user_employee_number_table ON user_employee_number_user_id = user_id
        AND user_employee_number_is_disabled = false
      WHERE
        user_id = '${userId}'
    `
  )[0];

  const userEmployeeNumberData = plv8.execute(
    `
      SELECT
        user_employee_number
      FROM user_schema.user_employee_number_table
      WHERE
        user_employee_number_user_id = '${userData.user_id}'
        AND user_employee_number_is_disabled = false
    `
  );

  returnData = {
    user_active_app: userData.user_active_app,
    user_active_team_id: userData.user_active_team_id,
    user_avatar: userData.user_avatar,
    user_date_created: userData.user_date_created,
    user_email: userData.user_email,
    user_first_name: userData.user_first_name,
    user_id: userData.user_id,
    user_is_disabled: userData.user_is_disabled,
    user_job_title: userData.user_job_title,
    user_last_name: userData.user_last_name,
    user_phone_number: userData.user_phone_number,
    user_signature_attachment_id: userData.user_signature_attachment_id,
    user_username: userData.user_username,
    user_signature_attachment: {
      attachment_bucket: userData.attachment_bucket,
      attachment_date_created: userData.attachment_date_created,
      attachment_id: userData.attachment_id,
      attachment_is_disabled: userData.attachment_is_disabled,
      attachment_name: userData.attachment_name,
      attachment_value: userData.attachment_value
    },
    user_employee_number: userEmployeeNumberData.length ? userEmployeeNumberData[0].user_employee_number : null
  }
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_user_current_signature(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = [];
plv8.subtransaction(function() {
  const {
    userId
  } = input_data;

  const userData = plv8.execute(
    `
      SELECT
        attachment_value,
        attachment_bucket
      FROM user_schema.user_table
      INNER JOIN public.attachment_table ON attachment_id = user_signature_attachment_id
      WHERE
        user_id = '${userId}'
    `
  )[0];

  returnData = {
    user_signature_attachment: {
      attachment_value: userData.attachment_value,
      attachment_bucket: userData.attachment_bucket
    }
  }
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_form_list_with_filter(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = {};
plv8.subtransaction(function() {
  const {
    teamId,
    app,
    page,
    limit,
    creator,
    status,
    sort,
    search
  } = input_data;

  const start = (page - 1) * limit;

  let creatorCondition = "";
  if (creator) {
    creatorCondition = creator.map((value) => {
      creatorCondition += `AND form_team_member_id = '${value}'`;
    }).join(" ");
  }

  let statusCondition = "";
  if (status) {
    statusCondition = `AND form_is_hidden = ${status === "hidden"}`
  }

  let searchCondition = "";
  if (search) {
    searchCondition = `AND form_name ILIKE '%${search}%'`
  }

  const formData = plv8.execute(
    `
      SELECT
        form_table.*,
        team_member_table.*,
        user_id,
        user_first_name,
        user_last_name,
        user_avatar
      FROM form_schema.form_table
      INNER JOIN team_schema.team_member_table ON team_member_id = form_team_member_id
        AND team_member_team_id = '${teamId}'
      INNER JOIN user_schema.user_table ON user_id = team_member_user_id
      WHERE
        form_is_disabled = false
        AND form_app = '${app}'
        ${creatorCondition}
        ${statusCondition}
        ${searchCondition}
      ORDER BY
        form_is_formsly_form DESC,
        form_date_created ${sort === "ascending" ? "ASC" : "DESC"}
      LIMIT ${limit}
      OFFSET ${start}
    `
  );

  const formCount = plv8.execute(
    `
      SELECT
        COUNT(*)
      FROM form_schema.form_table
      INNER JOIN team_schema.team_member_table ON team_member_id = form_team_member_id
        AND team_member_team_id = '${teamId}'
      INNER JOIN user_schema.user_table ON user_id = team_member_user_id
      WHERE
        form_is_disabled = false
        AND form_app = '${app}'
        ${creatorCondition}
        ${statusCondition}
        ${searchCondition}
    `
  )[0].count;

  const formList = formData.map(form => {
    return {
      form_id: form.form_id,
      form_name: form.form_name,
      form_description: form.form_description,
      form_date_created: form.form_date_created,
      form_is_disabled: form.form_is_disabled,
      form_is_hidden: form.form_is_hidden,
      form_is_signature_required: form.form_is_signature_required,
      form_is_formsly_form: form.form_is_formsly_form,
      form_app: form.form_app,
      form_is_for_every_member: form.form_is_for_every_member,
      form_type: form.form_type,
      form_sub_type: form.form_sub_type,
      form_team_member: {
        team_member_id: form.team_member_id,
        team_member_role: form.team_member_role,
        team_member_date_created: form.team_member_date_created,
        team_member_is_disabled: form.team_member_is_disabled,
        team_member_user_id: form.team_member_user_id,
        team_member_team_id: form.team_member_team_id,
        team_member_user: {
          user_id: form.user_id,
          user_first_name: form.user_first_name,
          user_last_name: form.user_last_name,
          user_avatar: form.user_avatar
        }
      }
    }
  });

  returnData = {
    data: formList,
    count: Number(formCount)
  }
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_form(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = {};
plv8.subtransaction(function() {
  const {
    formId
  } = input_data;

  const formData = plv8.execute(
    `
      SELECT
        form_table.*,
        team_member_id,
        user_table.*
      FROM form_schema.form_table
      INNER JOIN team_schema.team_member_table ON team_member_id = form_team_member_id
      INNER JOIN user_schema.user_table ON user_id = team_member_user_id
      WHERE
        form_id = '${formId}'
    `
  )[0];

  const formTeamGroupData = plv8.execute(
    `
      SELECT
        ftgt.team_group_id,
        team_group_name,
        team_group_is_disabled
      FROM form_schema.form_team_group_table AS ftgt
      INNER JOIN team_schema.team_group_table AS tgt ON tgt.team_group_id = ftgt.team_group_id
      WHERE
        form_id = '${formId}'
        AND team_group_is_disabled = false
    `
  );

  const formSignerData = plv8.execute(
    `
      SELECT
        signer_id,
        signer_is_primary_signer,
        signer_action,
        signer_order,
        signer_is_disabled,
        signer_team_project_id,
        team_member_id,
        user_table.*
      FROM form_schema.signer_table
      INNER JOIN team_schema.team_member_table ON team_member_id = signer_team_member_id
      INNER JOIN user_schema.user_table ON user_id = team_member_user_id
      WHERE
        signer_form_id = '${formId}'
        AND signer_is_disabled = false
        AND signer_team_project_id IS NULL
        AND signer_is_requester_signer = false
    `
  );

  returnData = {
    form_app: formData.form_app,
    form_date_created: formData.form_date_created,
    form_description: formData.form_description,
    form_id: formData.form_id,
    form_is_disabled: formData.form_is_disabled,
    form_is_for_every_member: formData.form_is_for_every_member,
    form_is_formsly_form: formData.form_is_formsly_form,
    form_is_hidden: formData.form_is_hidden,
    form_is_signature_required: formData.form_is_signature_required,
    form_name: formData.form_name,
    form_sub_type: formData.form_sub_type,
    form_team_member_id: formData.form_team_member_id,
    form_type: formData.form_type,
    form_team_member: {
      team_member_id: formData.team_member_id,
      team_member_user: {
        user_id: formData.user_id,
        user_first_name: formData.user_first_name,
        user_last_name: formData.user_last_name,
        user_avatar: formData.user_avatar,
        user_username: formData.user_username
      }
    },
    form_team_group: formTeamGroupData.map(teamGroup => {
      return {
        team_group: {
            team_group_id: teamGroup.team_group_id,
            team_group_name: teamGroup.team_group_name,
            team_group_is_disabled: teamGroup.team_group_is_disabled
        }
      }
    }),
    form_signer: formSignerData.map(formSigner => {
      return {
        signer_team_member: {
          team_member_id: formSigner.team_member_id,
          team_member_user: {
            user_id: formSigner.user_id,
            user_first_name: formSigner.user_first_name,
            user_last_name: formSigner.user_last_name,
            user_avatar: formSigner.user_avatar,
            user_username: formSigner.user_username
          }
        }
      }
    })
  }
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_item(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = {};
plv8.subtransaction(function() {
  const {
    teamId,
    itemName
  } = input_data;

  const itemData = plv8.execute(
    `
      SELECT
        it.*,
        signer_table.*,
        team_member_id,
        user_id,
        user_first_name,
        user_last_name,
        user_avatar
      FROM item_schema.item_table AS it
      LEFT JOIN item_schema.item_category_table AS ict ON ict.item_category_id = it.item_category_id
        AND item_category_is_disabled = false
      LEFT JOIN form_schema.signer_table ON signer_id = ict.item_category_signer_id
      LEFT JOIN team_schema.team_member_table ON team_member_id = signer_team_member_id
      LEFT JOIN user_schema.user_table ON user_id = team_member_user_id
      WHERE
        it.item_team_id = '${teamId}'
        AND it.item_general_name = '${itemName}'
        AND it.item_is_disabled = false
        AND it.item_is_available = true
    `
  )[0];

  const itemDescriptionData = plv8.execute(
    `
      SELECT
        item_schema.item_description_table.*,
        field_table.*
      FROM item_schema.item_description_table
      INNER JOIN form_schema.field_table ON field_id = item_description_field_id
      WHERE
        item_description_item_id = '${itemData.item_id}'
        AND item_description_is_disabled = false
        AND item_description_is_available = true
    `
  );

  const formattedItemDescription = itemDescriptionData.map(itemDescription => {
    const itemDescriptionFieldData = plv8.execute(
      `
        SELECT *
        FROM item_schema.item_description_field_table
        WHERE
          item_description_field_item_description_id = '${itemDescription.item_description_id}'
          AND item_description_field_is_disabled = false
          AND item_description_field_is_available = true
      `
    );

    const itemDescriptionFieldWithUom = itemDescriptionFieldData.map(itemDescriptionField => {
      const itemDescriptionFieldUomData = plv8.execute(
        `
          SELECT *
          FROM item_schema.item_description_field_uom_table
          WHERE
            item_description_field_uom_item_description_field_id = '${itemDescriptionField.item_description_field_id}'
          LIMIT 1
        `
      );

      return {
        ...itemDescriptionField,
        item_description_field_uom: itemDescriptionFieldUomData
      }
    })

    return {
      item_description_date_created: itemDescription.item_description_date_created,
      item_description_field_id: itemDescription.item_description_field_id,
      item_description_id: itemDescription.item_description_id,
      item_description_is_available: itemDescription.item_description_is_available,
      item_description_is_disabled: itemDescription.item_description_is_disabled,
      item_description_is_with_uom: itemDescription.item_description_is_with_uom,
      item_description_item_id: itemDescription.item_description_item_id,
      item_description_label: itemDescription.item_description_label,
      item_description_order: itemDescription.item_description_order,
      item_description_field: itemDescriptionFieldWithUom.map(itemDescriptionField => {
        return {
          item_description_field_date_created: itemDescriptionField.item_description_field_date_created,
          item_description_field_id: itemDescriptionField.item_description_field_id,
          item_description_field_is_available: itemDescriptionField.item_description_field_is_available,
          item_description_field_is_disabled: itemDescriptionField.item_description_field_is_disabled,
          item_description_field_item_description_id: itemDescriptionField.item_description_field_item_description_id,
          item_description_field_value: itemDescriptionField.item_description_field_value,
          item_description_field_uom: itemDescriptionField.item_description_field_uom
        }
      }),
      item_field: {
        field_id: itemDescription.field_id,
        field_is_positive_metric: itemDescription.field_is_positive_metric,
        field_is_read_only: itemDescription.field_is_read_only,
        field_is_required: itemDescription.field_is_required,
        field_name: itemDescription.field_name,
        field_order: itemDescription.field_order,
        field_section_id: itemDescription.field_section_id,
        field_special_field_template_id: itemDescription.field_special_field_template_id,
        field_type: itemDescription.field_type
      }
    }
  });

  returnData = {
    item_category_id: itemData.item_category_id,
    item_date_created: itemData.item_date_created,
    item_general_name: itemData.item_general_name,
    item_gl_account: itemData.item_gl_account,
    item_id: itemData.item_id,
    item_is_available: itemData.item_is_available,
    item_is_disabled: itemData.item_is_disabled,
    item_is_it_asset_item: itemData.item_is_it_asset_item,
    item_is_ped_item: itemData.item_is_ped_item,
    item_team_id: itemData.item_team_id,
    item_unit: itemData.item_unit,
    item_description: formattedItemDescription,
    item_category: itemData.item_category_id ? {
      item_category_signer: {
        signer_id: itemData.signer_id,
        signer_is_primary_signer: itemData.signer_is_primary_signer,
        signer_action: itemData.signer_action,
        signer_order: itemData.signer_order,
        signer_team_member: {
          team_member_id: itemData.team_member_id,
          team_member_user: {
            user_id: itemData.user_id,
            user_first_name: itemData.user_first_name,
            user_last_name: itemData.user_last_name,
            user_avatar: itemData.user_avatar
          },
        }
      }
    } : null
  }
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_team_member_list(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = [];
plv8.subtransaction(function() {
  const {
    teamId,
    search,
    limit = 500,
    offset = 0
  } = input_data;

  let searchCondition = '';
  if (search) {
    searchCondition = `AND ((user_first_name || ' ' || user_last_name) ILIKE '%${search}%' OR user_email ILIKE '%${search}%')`;
  }

  const teamMemberData = plv8.execute(
    `
      SELECT
        team_member_id,
        team_member_role,
        team_member_date_created,
        user_id,
        user_first_name,
        user_last_name,
        user_avatar,
        user_email
      FROM team_schema.team_member_table
      INNER JOIN user_schema.user_table ON user_id = team_member_user_id
        AND user_is_disabled = false
      WHERE
        team_member_team_id = '${teamId}'
        AND team_member_is_disabled = false
        ${searchCondition}
      ORDER BY user_first_name, user_last_name
      LIMIT ${limit} OFFSET ${offset}
    `
  );

  returnData = teamMemberData.map(teamMember => {
    return {
      team_member_id: teamMember.team_member_id,
      team_member_role: teamMember.team_member_role,
      team_member_date_created: teamMember.team_member_date_created,
      team_member_user: {
        user_id: teamMember.user_id,
        user_first_name: teamMember.user_first_name,
        user_last_name: teamMember.user_last_name,
        user_avatar: teamMember.user_avatar,
        user_email: teamMember.user_email,
        user_employee_number: teamMember.user_employee_number
      }
    }
  });
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_team_group_member_list(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = {};
plv8.subtransaction(function() {
  const {
    groupId,
    search,
    page,
    limit
  } = input_data;

  const start = (page - 1) * limit;

  let searchCondition = "";
  if(search){
    searchCondition = `AND ((user_first_name || ' ' || user_last_name) ILIKE '%${search}%' OR user_email ILIKE '%${search}%')`;
  }

  const teamGroupMemberData = plv8.execute(
    `
      SELECT
        team_group_member_id,
        tmt.team_member_id,
        tmt.team_member_date_created,
        user_id,
        user_first_name,
        user_last_name,
        user_avatar,
        user_email
      FROM team_schema.team_group_member_table AS tgmt
      INNER JOIN team_schema.team_member_table AS tmt ON tmt.team_member_id = tgmt.team_member_id
      INNER JOIN user_schema.user_table ON user_id = tmt.team_member_user_id
      WHERE
        tgmt.team_group_id = '${groupId}'
        AND team_member_is_disabled = false
        ${searchCondition}
      ORDER BY
        user_first_name ASC,
        user_last_name ASC
      LIMIT ${limit} OFFSET ${start}
    `
  );

  const count = plv8.execute(
    `
      SELECT
        COUNT(*)
      FROM team_schema.team_group_member_table AS tgmt
      INNER JOIN team_schema.team_member_table AS tmt ON tmt.team_member_id = tgmt.team_member_id
      INNER JOIN user_schema.user_table ON user_id = tmt.team_member_user_id
      WHERE
        tgmt.team_group_id = '${groupId}'
        AND team_member_is_disabled = false
        ${searchCondition}
    `
  )[0].count;

  const data = teamGroupMemberData.map(teamGroupMember => {
    const teamProjectMemberData = plv8.execute(
      `
        SELECT
          team_project_name
        FROM team_schema.team_project_member_table AS tpmt
        INNER JOIN team_schema.team_project_table AS tpt ON tpt.team_project_id = tpmt.team_project_id
        WHERE
          team_project_is_disabled = false
          AND team_member_id = '${teamGroupMember.team_member_id}'
      `
    );

    return {
      team_group_member_id: teamGroupMember.team_group_member_id,
      team_member: {
        team_member_id: teamGroupMember.team_member_id,
        team_member_date_created: teamGroupMember.team_member_date_created,
        team_member_user: {
          user_id: teamGroupMember.user_id,
          user_first_name: teamGroupMember.user_first_name,
          user_last_name: teamGroupMember.user_last_name,
          user_avatar: teamGroupMember.user_avatar,
          user_email: teamGroupMember.user_email,
        },
        team_member_project_list: teamProjectMemberData.map(teamProjectMember => teamProjectMember.team_project_name)
      }
    }
  });

  returnData = {
    data,
    count: Number(count)
  }
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_team_project_member_list(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = {};
plv8.subtransaction(function() {
  const {
    projectId,
    search,
    page,
    limit
  } = input_data;

  const start = (page - 1) * limit;

  let searchCondition = "";
  if(search){
    searchCondition = `AND ((user_first_name || ' ' || user_last_name) ILIKE '%${search}%' OR user_email ILIKE '%${search}%')`;
  }

  const teamProjectMemberData = plv8.execute(
    `
      SELECT
        team_project_member_id,
        tmt.team_member_id,
        tmt.team_member_date_created,
        tmt.team_member_role,
        user_id,
        user_first_name,
        user_last_name,
        user_avatar,
        user_email
      FROM team_schema.team_project_member_table AS tpmt
      INNER JOIN team_schema.team_member_table AS tmt ON tmt.team_member_id = tpmt.team_member_id
      INNER JOIN user_schema.user_table ON user_id = tmt.team_member_user_id
      WHERE
        tpmt.team_project_id = '${projectId}'
        AND team_member_is_disabled = false
        ${searchCondition}
      ORDER BY
        user_first_name ASC,
        user_last_name ASC
      LIMIT ${limit} OFFSET ${start}
    `
  );

  const count = plv8.execute(
    `
      SELECT
        COUNT(*)
      FROM team_schema.team_project_member_table AS tpmt
      INNER JOIN team_schema.team_member_table AS tmt ON tmt.team_member_id = tpmt.team_member_id
      INNER JOIN user_schema.user_table ON user_id = tmt.team_member_user_id
      WHERE
        tpmt.team_project_id = '${projectId}'
        AND team_member_is_disabled = false
        ${searchCondition}
    `
  )[0].count;

  const data = teamProjectMemberData.map(teamProjectMember => {
    const teamGroupMemberData = plv8.execute(
      `
        SELECT
          team_group_name
        FROM team_schema.team_group_member_table AS tgmt
        INNER JOIN team_schema.team_group_table AS tpt ON tpt.team_group_id = tgmt.team_group_id
        WHERE
          team_group_is_disabled = false
          AND team_member_id = '${teamProjectMember.team_member_id}'
      `
    );

    return {
      team_project_member_id: teamProjectMember.team_project_member_id,
      team_member: {
        team_member_id: teamProjectMember.team_member_id,
        team_member_date_created: teamProjectMember.team_member_date_created,
        team_member_role: teamProjectMember.team_member_role,
        team_member_user: {
          user_id: teamProjectMember.user_id,
          user_first_name: teamProjectMember.user_first_name,
          user_last_name: teamProjectMember.user_last_name,
          user_avatar: teamProjectMember.user_avatar,
          user_email: teamProjectMember.user_email,
        },
        team_member_group_list: teamGroupMemberData.map(teamGroupMember => teamGroupMember.team_group_name)
      }
    }
  });

  returnData = {
    data,
    count: Number(count)
  }
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_project_signer_with_team_member(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = [];
function fetchSignerData(condition, params = []) {
    return plv8.execute(`
        SELECT
            signer_id,
            signer_is_primary_signer,
            signer_action,
            signer_order,
            signer_is_disabled,
            signer_team_project_id,
            team_member_id,
            user_id,
            user_first_name,
            user_last_name,
            user_avatar
        FROM form_schema.signer_table
        INNER JOIN team_schema.team_member_table ON team_member_id = signer_team_member_id
        INNER JOIN user_schema.user_table ON user_id = team_member_user_id
        ${condition}
    `, params);
};
plv8.subtransaction(function() {
    const {
        projectId,
        formId,
        departmentId,
        requesterTeamMemberId
    } = input_data;

    const hasSpecialSigner = plv8.execute(`
        SELECT requester_primary_signer_signer_id
        FROM form_schema.requester_primary_signer_table
        INNER JOIN form_schema.signer_table ON signer_id = requester_primary_signer_signer_id
        WHERE
            requester_team_member_id = $1
            AND signer_form_id = $2
    `, [requesterTeamMemberId, formId])[0];

    let condition = `
        WHERE signer_team_project_id = $1
        AND signer_form_id = $2
        AND signer_is_disabled = false
        AND signer_is_requester_signer = false
    `;

    const params = [projectId, formId];
    let signerData = [];

    if (hasSpecialSigner) {
        signerData = fetchSignerData(`WHERE signer_id = $1`, [hasSpecialSigner.requester_primary_signer_signer_id]);
    } else if (departmentId) {
        condition += ` AND signer_team_department_id = $3`;
        params.push(departmentId);
        signerData = fetchSignerData(condition, params);
    }

    if (signerData.length <= 0) {
        signerData = fetchSignerData(`
            WHERE signer_team_project_id = $1
            AND signer_form_id = $2
            AND signer_team_department_id IS NULL
            AND signer_is_disabled = false
        `, [projectId, formId]);
    }

    returnData = signerData.map(signer => ({
        signer_id: signer.signer_id,
        signer_is_primary_signer: signer.signer_is_primary_signer,
        signer_action: signer.signer_action,
        signer_order: signer.signer_order,
        signer_is_disabled: signer.signer_is_disabled,
        signer_team_project_id: signer.signer_team_project_id,
        signer_team_member: {
            team_member_id: signer.team_member_id,
            team_member_user: {
                user_id: signer.user_id,
                user_first_name: signer.user_first_name,
                user_last_name: signer.user_last_name,
                user_avatar: signer.user_avatar,
            }
        }
    }));
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_team_approver_list_with_filter(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = {};
plv8.subtransaction(function() {
  const {
    teamId,
    search,
    page,
    limit
  } = input_data;

  const start = (page - 1) * limit;

  let searchCondition = "";
  if(search){
    searchCondition = `AND ((user_first_name || ' ' || user_last_name) ILIKE '%${search}%' OR user_email ILIKE '%${search}%')`;
  }

  const teamMemberData = plv8.execute(
    `
      SELECT
        team_member_id,
        team_member_date_created,
        user_id,
        user_first_name,
        user_last_name,
        user_avatar,
        user_email
      FROM team_schema.team_member_table
      INNER JOIN user_schema.user_table ON user_id = team_member_user_id
      WHERE
        team_member_role = 'APPROVER'
        AND team_member_team_id = '${teamId}'
        AND team_member_is_disabled = false
        ${searchCondition}
      ORDER BY
        user_first_name ASC,
        user_last_name ASC
      LIMIT ${limit} OFFSET ${start}
    `
  );

  const teamMemberCount = plv8.execute(
    `
      SELECT
        COUNT(*)
      FROM team_schema.team_member_table
      INNER JOIN user_schema.user_table ON user_id = team_member_user_id
      WHERE
        team_member_role = 'APPROVER'
        AND team_member_team_id = '${teamId}'
        AND team_member_is_disabled = false
        ${searchCondition}
    `
  )[0].count;

  returnData = {
    data: teamMemberData.map(teamMember => {
      return {
        team_member_id: teamMember.team_member_id,
        team_member_date_created: teamMember.team_member_date_created,
        team_member_user: {
          user_id: teamMember.user_id,
          user_first_name: teamMember.user_first_name,
          user_last_name: teamMember.user_last_name,
          user_avatar: teamMember.user_avatar,
          user_email: teamMember.user_email,
        }
      }
    }),
    count: Number(teamMemberCount)
  }
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_team_admin_list_with_filter(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = {};
plv8.subtransaction(function() {
  const {
    teamId,
    search,
    page,
    limit
  } = input_data;

  const start = (page - 1) * limit;

  let searchCondition = "";
  if(search){
    searchCondition = `AND ((user_first_name || ' ' || user_last_name) ILIKE '%${search}%' OR user_email ILIKE '%${search}%')`;
  }

  const teamMemberData = plv8.execute(
    `
      SELECT
        team_member_id,
        team_member_date_created,
        user_id,
        user_first_name,
        user_last_name,
        user_avatar,
        user_email
      FROM team_schema.team_member_table
      INNER JOIN user_schema.user_table ON user_id = team_member_user_id
      WHERE
        team_member_role = 'ADMIN'
        AND team_member_team_id = '${teamId}'
        AND team_member_is_disabled = false
        ${searchCondition}
      ORDER BY
        user_first_name ASC,
        user_last_name ASC
      LIMIT ${limit} OFFSET ${start}
    `
  );

  const teamMemberCount = plv8.execute(
    `
      SELECT
        COUNT(*)
      FROM team_schema.team_member_table
      INNER JOIN user_schema.user_table ON user_id = team_member_user_id
      WHERE
        team_member_role = 'ADMIN'
        AND team_member_team_id = '${teamId}'
        AND team_member_is_disabled = false
        ${searchCondition}
    `
  )[0].count;

  returnData = {
    data: teamMemberData.map(teamMember => {
      return {
        team_member_id: teamMember.team_member_id,
        team_member_date_created: teamMember.team_member_date_created,
        team_member_user: {
          user_id: teamMember.user_id,
          user_first_name: teamMember.user_first_name,
          user_last_name: teamMember.user_last_name,
          user_avatar: teamMember.user_avatar,
          user_email: teamMember.user_email,
        }
      }
    }),
    count: Number(teamMemberCount)
  }
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_team_members_with_member_role(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = [];
plv8.subtransaction(function() {
  const {
    teamId
  } = input_data;

  const teamMemberData = plv8.execute(
    `
      SELECT
        team_member_id,
        team_member_date_created,
        user_id,
        user_first_name,
        user_last_name,
        user_avatar,
        user_email
      FROM team_schema.team_member_table
      INNER JOIN user_schema.user_table ON user_id = team_member_user_id
      WHERE
        team_member_team_id = '${teamId}'
        AND team_member_is_disabled = false
        AND team_member_role = 'MEMBER'
    `
  );

  returnData = teamMemberData.map(teamMember => {
    return {
      team_member_id: teamMember.team_member_id,
      team_member_date_created: teamMember.team_member_date_created,
      team_member_user: {
        user_id: teamMember.user_id,
        user_first_name: teamMember.user_first_name,
        user_last_name: teamMember.user_last_name,
        user_avatar: teamMember.user_avatar,
        user_email: teamMember.user_email,
      }
    }
  })
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_member_user_data(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = [];
plv8.subtransaction(function() {
  const {
    teamMemberId
  } = input_data;

  returnData = plv8.execute(
    `
      SELECT
        user_id,
        user_first_name,
        user_last_name,
        user_username,
        user_avatar
      FROM team_schema.team_member_table
      INNER JOIN user_schema.user_table ON user_id = team_member_user_id
      WHERE
        team_member_id = '${teamMemberId}'
      LIMIT 1
    `
  );
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_member_user(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = {};
plv8.subtransaction(function() {
  const {
    teamMemberId
  } = input_data;

  const teamMemberData = plv8.execute(
    `
      SELECT
        team_member_table.*,
        user_id,
        user_first_name,
        user_last_name,
        user_username,
        user_avatar
      FROM team_schema.team_member_table
      INNER JOIN user_schema.user_table ON user_id = team_member_user_id
      WHERE
        team_member_id = '${teamMemberId}'
      LIMIT 1
    `
  );

  if(!teamMemberData.length) {
    returnData = null
  } else {
    returnData = {
      team_member_date_created: teamMemberData[0].team_member_date_created,
      team_member_id: teamMemberData[0].team_member_id,
      team_member_is_disabled: teamMemberData[0].team_member_is_disabled,
      team_member_role: teamMemberData[0].team_member_role,
      team_member_team_id: teamMemberData[0].team_member_team_id,
      team_member_user_id: teamMemberData[0].team_member_user_id,
      team_member_user: {
        user_id: teamMemberData[0].user_id,
        user_first_name: teamMemberData[0].user_first_name,
        user_last_name: teamMemberData[0].user_last_name,
        user_username: teamMemberData[0].user_username,
        user_avatar: teamMemberData[0].user_avatar,
      }
    }
  }
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_item_category_list(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = {};
plv8.subtransaction(function() {
  const {
    formId,
    limit,
    page,
    search
  } = input_data;

  const start = (page - 1) * limit;

  let searchCondition = "";
  if(search){
    searchCondition = `AND item_category ILIKE '%${search}%'`;
  }

  const itemCategoryData = plv8.execute(
    `
      SELECT
        item_category_table.*,
        signer_id,
        signer_form_id,
        team_member_id,
        user_id,
        user_first_name,
        user_last_name,
        user_avatar
      FROM item_schema.item_category_table
      INNER JOIN form_schema.signer_table ON signer_id = item_category_signer_id
        AND signer_form_id = '${formId}'
      INNER JOIN team_schema.team_member_table ON team_member_id = signer_team_member_id
      INNER JOIN user_schema.user_table ON user_id = team_member_user_id
      WHERE
        item_category_is_disabled = false
        ${searchCondition}
      ORDER BY item_category ASC
      LIMIT ${limit} OFFSET ${start}
    `
  );

  const itemCategoryCount = plv8.execute(
    `
      SELECT
        COUNT(*)
      FROM item_schema.item_category_table
      INNER JOIN form_schema.signer_table ON signer_id = item_category_signer_id
        AND signer_form_id = '${formId}'
      WHERE
        item_category_is_disabled = false
        ${searchCondition}
    `
  )[0].count;

  returnData = {
    data: itemCategoryData.map(itemCategory => {
      return {
        item_category: itemCategory.item_category,
        item_category_date_created: itemCategory.item_category_date_created,
        item_category_id: itemCategory.item_category_id,
        item_category_is_available: itemCategory.item_category_is_available,
        item_category_is_disabled: itemCategory.item_category_is_disabled,
        item_category_signer_id: itemCategory.item_category_signer_id,
        item_category_signer: {
          signer_id: itemCategory.signer_id,
          signer_team_member: {
            team_member_id: itemCategory.team_member_id,
            team_member_user: {
              user_id: itemCategory.user_id,
              user_first_name: itemCategory.user_first_name,
              user_last_name: itemCategory.user_last_name,
              user_avatar: itemCategory.user_avatar,
            }
          }
        }
      }
    }),
    count: Number(itemCategoryCount)
  }
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_item_form_approver(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = [];
plv8.subtransaction(function() {
  const {
    teamId
  } = input_data;

  const teamMemberData = plv8.execute(
    `
      SELECT
        team_member_id,
        user_first_name,
        user_last_name
      FROM team_schema.team_member_table
      INNER JOIN user_schema.user_table ON user_id = team_member_user_id
        AND user_is_disabled = false
      WHERE
        team_member_role = 'APPROVER'
        AND team_member_is_disabled = false
        AND team_member_team_id = '${teamId}'
      ORDER BY
        user_first_name ASC,
        user_last_name ASC
    `
  );

  returnData = teamMemberData.map(teamMember => {
    return {
      value: teamMember.team_member_id,
      label: `${teamMember.user_first_name} ${teamMember.user_last_name}`
    }
  });
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION agree_to_memo(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = {};
plv8.subtransaction(function() {
  const {
    memoId,
    teamMemberId
  } = input_data;

  const memoAgreementCount = plv8.execute(
    `
      SELECT
        COUNT(*)
      FROM memo_schema.memo_agreement_table
      WHERE
        memo_agreement_by_team_member_id = '${teamMemberId}'
        AND memo_agreement_memo_id = '${memoId}'
    `
  )[0].count;

  if(memoAgreementCount){
    returnData =  null;
    return;
  }

  const memoAgreementId = plv8.execute(
    `
      INSERT INTO memo_schema.memo_agreement_table
      (memo_agreement_by_team_member_id, memo_agreement_memo_id)
      VALUES
      ('${teamMemberId}', '${memoId}')
      RETURNING memo_agreement_id
    `
  )[0].memo_agreement_id;

  const memoAgreementData = plv8.execute(
    `
      SELECT
        memo_agreement_table.*,
        user_id,
        user_avatar,
        user_first_name,
        user_last_name
      FROM memo_schema.memo_agreement_table
      INNER JOIN team_schema.team_member_table ON team_member_id = memo_agreement_by_team_member_id
      INNER JOIN user_schema.user_table ON user_id = team_member_user_id
      WHERE
        memo_agreement_id = '${memoAgreementId}'
    `
  )[0];

  const employeeNumberData = plv8.execute(
    `
      SELECT user_employee_number
      FROM user_schema.user_employee_number_table
      WHERE
        user_employee_number_user_id = '${memoAgreementData.user_id}'
      LIMIT 1
    `
  );

  returnData = {
    memo_agreement_by_team_member_id: memoAgreementData.memo_agreement_by_team_member_id,
    memo_agreement_date_created: memoAgreementData.memo_agreement_date_created,
    memo_agreement_id: memoAgreementData.memo_agreement_id,
    memo_agreement_memo_id: memoAgreementData.memo_agreement_memo_id,
    memo_agreement_by_team_member: {
      user_data: {
        user_avatar: memoAgreementData.user_avatar,
        user_id: memoAgreementData.user_id,
        user_first_name: memoAgreementData.user_first_name,
        user_last_name: memoAgreementData.user_last_name,
        user_employee_number: employeeNumberData
      }
    }
  };
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION approve_or_reject_memo(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = {};
plv8.subtransaction(function() {
  const {
    memoSignerId,
    memoId,
    action,
    isPrimarySigner,
    memoSignerTeamMemberId
  } = input_data;

  const currentDate = plv8.execute(`SELECT public.get_current_date()`)[0].get_current_date.toISOString();

  plv8.execute(
    `
      UPDATE memo_schema.memo_signer_table
      SET
        memo_signer_status = '${action}',
        memo_signer_date_signed = '${currentDate}'
      WHERE
        memo_signer_id = '${memoSignerId}'
    `
  );

  if(isPrimarySigner){
    plv8.execute(
      `
        UPDATE memo_schema.memo_status_table
        SET
          memo_status = '${action}',
          memo_status_date_updated = '${currentDate}'
        WHERE
          memo_status_memo_id = '${memoId}'
      `
    );
  }

  if (action.toLowerCase() === "approved") {
    const memoAgreementCount = plv8.execute(
      `
        SELECT COUNT(*)
        FROM memo_schema.memo_agreement_table
        WHERE
          memo_agreement_by_team_member_id = '${memoSignerTeamMemberId}'
          AND memo_agreement_memo_id = '${memoId}'
      `
    )[0].count;

    if (Number(memoAgreementCount) === 0) {
      const memoAgreementId = plv8.execute(
        `
          INSERT INTO memo_schema.memo_agreement_table
          (memo_agreement_by_team_member_id, memo_agreement_memo_id)
          VALUES
          ('${memoSignerTeamMemberId}', '${memoId}')
          RETURNING memo_agreement_id
        `
      )[0].memo_agreement_id;

      const memoAgreementData = plv8.execute(
        `
          SELECT
            memo_agreement_table.*,
            user_id,
            user_avatar,
            user_first_name,
            user_last_name
          FROM memo_schema.memo_agreement_table
          INNER JOIN team_schema.team_member_table ON team_member_id = memo_agreement_by_team_member_id
          INNER JOIN user_schema.user_table ON user_id = team_member_user_id
          WHERE
            memo_agreement_id = '${memoAgreementId}'
        `
      )[0];

      const employeeNumberData = plv8.execute(
        `
          SELECT user_employee_number
          FROM user_schema.user_employee_number_table
          WHERE
            user_employee_number_user_id = '${memoAgreementData.user_id}'
          LIMIT 1
        `
      );

      returnData = {
        memo_agreement_by_team_member_id: memoAgreementData.memo_agreement_by_team_member_id,
        memo_agreement_date_created: memoAgreementData.memo_agreement_date_created,
        memo_agreement_id: memoAgreementData.memo_agreement_id,
        memo_agreement_memo_id: memoAgreementData.memo_agreement_memo_id,
        memo_agreement_by_team_member: {
          user_data: {
            user_avatar: memoAgreementData.user_avatar,
            user_id: memoAgreementData.user_id,
            user_first_name: memoAgreementData.user_first_name,
            user_last_name: memoAgreementData.user_last_name,
            user_employee_number: employeeNumberData
          }
        }
      };
    }
  }
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_user_valid_id(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = {};
plv8.subtransaction(function() {
  const {
    validId
  } = input_data;

  const userValidIdData = plv8.execute(
    `
      SELECT
        user_valid_id_table.*,
        address_table.*
      FROM user_schema.user_valid_id_table
      INNER JOIN public.address_table ON address_id = user_valid_id_address_id
      WHERE user_valid_id_id = '${validId}'
    `
  )[0];

  const userData = plv8.execute(
    `
      SELECT *
      FROM user_schema.user_table
      WHERE
        user_id = '${userValidIdData.user_valid_id_user_id}'
    `
  )[0];

  let approverData = null;
  if(userValidIdData.user_valid_id_approver_user_id){
    approverData = plv8.execute(
      `
        SELECT *
        FROM user_schema.user_table
        WHERE
          user_id = '${userValidIdData.user_valid_id_approver_user_id}'
        LIMIT 1
      `
    )[0];
  }


  returnData = {
    user_valid_id_back_image_url: userValidIdData.user_valid_id_back_image_url,
    user_valid_id_date_created: userValidIdData.user_valid_id_date_created,
    user_valid_id_date_updated: userValidIdData.user_valid_id_date_updated,
    user_valid_id_first_name: userValidIdData.user_valid_id_first_name,
    user_valid_id_front_image_url: userValidIdData.user_valid_id_front_image_url,
    user_valid_id_gender: userValidIdData.user_valid_id_gender,
    user_valid_id_id: userValidIdData.user_valid_id_id,
    user_valid_id_last_name: userValidIdData.user_valid_id_last_name,
    user_valid_id_middle_name: userValidIdData.user_valid_id_middle_name,
    user_valid_id_nationality: userValidIdData.user_valid_id_nationality,
    user_valid_id_number: userValidIdData.user_valid_id_number,
    user_valid_id_status: userValidIdData.user_valid_id_status,
    user_valid_id_type: userValidIdData.user_valid_id_type,
    user_valid_id_user: userData,
    user_valid_id_approver_user: approverData,
    user_valid_id_address: {
      address_barangay: userValidIdData.address_barangay,
      address_city: userValidIdData.address_city,
      address_date_created: userValidIdData.address_date_created,
      address_id: userValidIdData.address_id,
      address_province: userValidIdData.address_province,
      address_region: userValidIdData.address_region,
      address_street: userValidIdData.address_street,
      address_zip_code: userValidIdData.address_zip_code,
    }
  }
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_team_invitation(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = {};
plv8.subtransaction(function() {
  const {
    teamId,
    status,
    page,
    limit,
    search
  } = input_data;

  const start = (page - 1) * limit;

  let searchCondition = "";
  if(search){
    searchCondition = `AND invitation_to_email ILIKE '%${search}%'`;
  }

  const invitationData = plv8.execute(
    `
      SELECT
        invitation_id,
        invitation_to_email,
        invitation_date_created,
        team_member_team_id
      FROM user_schema.invitation_table
      INNER JOIN team_schema.team_member_table ON team_member_id = invitation_from_team_member_id
        AND team_member_team_id = '${teamId}'
      WHERE
        invitation_status = '${status}'
        AND invitation_is_disabled = false
        ${searchCondition}
      ORDER BY invitation_to_email
      OFFSET ${start} LIMIT ${limit}
    `
  );

  const invitationCount = plv8.execute(
    `
      SELECT COUNT(*)
      FROM user_schema.invitation_table
      INNER JOIN team_schema.team_member_table ON team_member_id = invitation_from_team_member_id
        AND team_member_team_id = '${teamId}'
      WHERE
        invitation_status = '${status}'
        AND invitation_is_disabled = false
        ${searchCondition}
    `
  )[0].count;

  returnData = {
    data: invitationData,
    count: Number(invitationCount)
  }
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_invitation_id(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = "";
plv8.subtransaction(function() {
  const {
    teamId,
    userEmail
  } = input_data;

  const invitationData = plv8.execute(
    `
      SELECT
        invitation_id,
        team_member_team_id
      FROM user_schema.invitation_table
      INNER JOIN team_schema.team_member_table ON team_member_id = invitation_from_team_member_id
        AND team_member_team_id = '${teamId}'
      WHERE
        invitation_is_disabled = false
        AND invitation_to_email = '${userEmail}'
        AND invitation_status = 'PENDING'
      ORDER BY invitation_date_created DESC
      LIMIT 1
    `
  );

  returnData = invitationData.length ? invitationData[0].invitation_id : null;
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_invitation(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = {};
plv8.subtransaction(function() {
  const {
    invitationId,
    userEmail
  } = input_data;

  const invitationData = plv8.execute(
    `
      SELECT
        invitation_table.*,
        team_member_table.*,
        team_table.*
      FROM user_schema.invitation_table
      INNER JOIN team_schema.team_member_table ON team_member_id = invitation_from_team_member_id
      INNER JOIN team_schema.team_table ON team_id = team_member_team_id
      WHERE
        invitation_id = '${invitationId}'
        AND invitation_is_disabled = false
        AND invitation_to_email = '${userEmail}'
      ORDER BY invitation_date_created DESC
      LIMIT 1
    `
  );

  if(!invitationData.length){
    returnData = null;
    return;
  }

  returnData = {
    invitation_date_created: invitationData[0].invitation_date_created,
    invitation_from_team_member_id: invitationData[0].invitation_from_team_member_id,
    invitation_id: invitationData[0].invitation_id,
    invitation_is_disabled: invitationData[0].invitation_is_disabled,
    invitation_status: invitationData[0].invitation_status,
    invitation_to_email: invitationData[0].invitation_to_email,
    invitation_from_team_member: {
      team_member_date_created: invitationData[0].team_member_date_created,
      team_member_id: invitationData[0].team_member_id,
      team_member_is_disabled: invitationData[0].team_member_is_disabled,
      team_member_role: invitationData[0].team_member_role,
      team_member_team_id: invitationData[0].team_member_team_id,
      team_member_user_id: invitationData[0].team_member_user_id,
      team_member_team: {
        team_date_created: invitationData[0].team_date_created,
        team_expiration: invitationData[0].team_expiration,
        team_id: invitationData[0].team_id,
        team_is_disabled: invitationData[0].team_is_disabled,
        team_is_request_signature_required: invitationData[0].team_is_request_signature_required,
        team_logo: invitationData[0].team_logo,
        team_name: invitationData[0].team_name,
        team_user_id: invitationData[0].team_user_id,
      }
    }
  }
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_item_unit_of_measurement(
  input_data JSON
)
RETURNS TEXT
SET search_path TO ''
AS $$
let returnData = "";
plv8.subtransaction(function() {
  const {
    generalName,
    componentCategory,
    brand,
    model,
    partNumber
  } = input_data;

  const uomData = plv8.execute(
    `
      SELECT
        equipment_unit_of_measurement
      FROM equipment_schema.equipment_part_table AS ept
      INNER JOIN equipment_schema.equipment_general_name_table ON equipment_general_name_id = ept.equipment_part_general_name_id
        AND equipment_general_name_is_disabled = false
        AND equipment_general_name_is_available = true
        AND equipment_general_name = '${generalName}'
      INNER JOIN equipment_schema.equipment_component_category_table ON equipment_component_category_id = ept.equipment_part_component_category_id
        AND equipment_component_category_is_disabled = false
        AND equipment_component_category_is_available = true
        AND equipment_component_category = '${componentCategory}'
      INNER JOIN equipment_schema.equipment_brand_table ON equipment_brand_id = ept.equipment_part_brand_id
        AND equipment_brand_is_disabled = false
        AND equipment_brand_is_available = true
        AND equipment_brand = '${brand}'
      INNER JOIN equipment_schema.equipment_model_table ON equipment_model_id = ept.equipment_part_model_id
        AND equipment_model_is_disabled = false
        AND equipment_model_is_available = true
        AND equipment_model = '${model}'
      INNER JOIN unit_of_measurement_schema.equipment_unit_of_measurement_table ON equipment_unit_of_measurement_id = ept.equipment_part_unit_of_measurement_id
        AND equipment_unit_of_measurement_is_disabled = false
        AND equipment_unit_of_measurement_is_available = true
      WHERE
        equipment_part_is_disabled = false
        AND equipment_part_is_available = true
        AND equipment_part_number = '${partNumber}'
      LIMIT 1
    `
  );

  if(uomData.length){
    returnData = uomData[0].equipment_unit_of_measurement
  }
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION send_notification_to_project_cost_engineer(
  input_data JSON
)
RETURNS VOID
SET search_path TO ''
AS $$
plv8.subtransaction(function() {
  const {
    projectId,
    requesterName,
    redirectUrl,
    teamId
  } = input_data;

  const projectTeamMemberIdList = plv8.execute(`SELECT team_member_id FROM team_schema.team_project_member_table WHERE team_project_id='${projectId}'`);

  if (projectTeamMemberIdList.length <= 0) throw Error('Team member not found');

  const projectTeamMemberIdListQuery = projectTeamMemberIdList.map((project) => `'${project.team_member_id}'`).join(', ');

  const costEngineerGroupId = plv8.execute(`SELECT team_group_id FROM team_schema.team_group_table WHERE team_group_name='COST ENGINEER'`)[0].team_group_id;

  const projectCostEngineerList = plv8.execute(`
    SELECT tgm.team_member_id, tmt.team_member_user_id
    FROM team_schema.team_group_member_table AS tgm
    INNER JOIN team_schema.team_member_table AS tmt ON tmt.team_member_id = tgm.team_member_id
    WHERE tgm.team_member_id IN (${projectTeamMemberIdListQuery})
    AND tgm.team_group_id = '${costEngineerGroupId}'`);

  if (projectCostEngineerList.length <= 0) throw Error('No Cost Engineers found for the project');

  const costEngineerNotificationInput = projectCostEngineerList.map((costEngineer) => ({
    notification_app: 'REQUEST',
    notification_content: `${requesterName} requested you to add cost code to his/her request`,
    notification_redirect_url: redirectUrl,
    notification_team_id: teamId,
    notification_type: 'REQUEST',
    notification_user_id: costEngineer.team_member_user_id
  }));

  const notificationValues = costEngineerNotificationInput.map((notification) =>
    `('${notification.notification_app}','${notification.notification_content}','${notification.notification_redirect_url}','${notification.notification_team_id}','${notification.notification_type}','${notification.notification_user_id}')`).join(",");

  plv8.execute(
    `INSERT INTO public.notification_table
    (notification_app, notification_content, notification_redirect_url, notification_team_id, notification_type, notification_user_id)
    VALUES ${notificationValues};`);
});
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_item_category_option(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = [];
plv8.subtransaction(function() {
  const {
    formId
  } = input_data;

  returnData = plv8.execute(
    `
      SELECT
        item_category_id,
        item_category,
        signer_form_id
      FROM item_schema.item_category_table
      INNER JOIN form_schema.signer_table ON signer_id = item_category_signer_id
        AND signer_form_id = '${formId}'
      WHERE
        item_category_is_available = true
        AND item_category_is_disabled = false
      ORDER BY item_category
    `
  ).map(itemCategory => {
    return {
      item_category_id: itemCategory.item_category_id,
      item_category: itemCategory.item_category,
      item_category_signer: {
        signer_form_id: itemCategory.signer_form_id
      }
    }
  })
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_jira_formsly_project_list(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = {};
plv8.subtransaction(function() {
  const {
    teamId,
    page,
    limit,
    search
  } = input_data;

  const start = (page - 1) * limit;

  let searchCondition = "";
  if (search) {
    searchCondition = `AND team_project_name ILIKE '%${search}%'`
  }

  const teamProjectData = plv8.execute(
    `
      SELECT
        team_project_id,
        team_project_name
      FROM team_schema.team_project_table
      WHERE
        team_project_team_id = '${teamId}'
        ${searchCondition}
      ORDER BY team_project_name
      OFFSET ${start} LIMIT ${limit}
    `
  );

  const teamProjectCount = plv8.execute(
    `
      SELECT COUNT(*)
      FROM team_schema.team_project_table
      WHERE
        team_project_team_id = '${teamId}'
    `
  )[0].count;

  const teamProjectWithJiraProjectAndOrganization = teamProjectData.map(teamProject => {
    const jiraFormslyProjectData = plv8.execute(
      `
        SELECT
          jira_formsly_project_id,
          jira_project_id,
          formsly_project_id
        FROM jira_schema.jira_formsly_project_table
        WHERE
          formsly_project_id = '${teamProject.team_project_id}'
      `
    );

    let jiraProjectData = [];
    if(jiraFormslyProjectData.length){
      jiraProjectData = plv8.execute(
        `
          SELECT *
          FROM jira_schema.jira_project_table
          WHERE
            jira_project_id = '${jiraFormslyProjectData[0].jira_project_id}'
        `
      );
    }

    const jiraFormslyOrganizationData = plv8.execute(
      `
        SELECT
          jira_organization_team_project_id,
          jira_organization_team_project_project_id,
          jira_organization_team_project_organization_id
        FROM jira_schema.jira_organization_team_project_table
        WHERE
          jira_organization_team_project_project_id = '${teamProject.team_project_id}'
      `
    );

    let jiraOrganizationData = [];
    if(jiraFormslyOrganizationData.length){
      jiraOrganizationData = plv8.execute(
        `
          SELECT *
          FROM jira_schema.jira_organization_table
          WHERE
            jira_organization_id = '${jiraFormslyOrganizationData[0].jira_organization_team_project_organization_id}'
        `
      );
    }

    return {
      ...teamProject,
      assigned_jira_project: jiraFormslyProjectData.length ? {
        ...jiraProjectData,
        jira_project: jiraProjectData.length ? jiraProjectData[0] : null
      } : null,
      assigned_jira_organization: jiraFormslyOrganizationData.length ? {
        ...jiraFormslyOrganizationData,
        jira_organization_team_project_organization: jiraOrganizationData.length ? jiraOrganizationData[0] : null
      } : null
    }
  });

  returnData = {
    data: teamProjectWithJiraProjectAndOrganization,
    count: Number(teamProjectCount)
  }
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION check_if_all_primary_approver_approved_the_request(
  input_data JSON
)
RETURNS BOOLEAN
SET search_path TO ''
AS $$
let returnData = false;
plv8.subtransaction(function() {
  const {
    requestId,
    requestSignerId
  } = input_data;

  const count = plv8.execute(
    `
      SELECT COUNT(*)
      FROM request_schema.request_signer_table
      INNER JOIN form_schema.signer_table ON signer_id = request_signer_signer_id
        AND signer_is_primary_signer = true
      WHERE
        request_signer_request_id = '${requestId}'
        AND request_signer_id != '${requestSignerId}'
        AND request_signer_status != 'APPROVED'
    `
  )[0].count;

  returnData = !Boolean(count);
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_approver_request_count(
  input_data JSON
)
RETURNS INT
SET search_path TO ''
AS $$
let returnData = 0;
plv8.subtransaction(function() {
  const {
    teamMemberId,
    status,
    withJiraId
  } = input_data;

  let jiraIdCondition = "";
  if(withJiraId !== undefined){
    jiraIdCondition = `request_jira_id IS ${withJiraId ? "NOT" : ""} NULL`;
  }

  const requestSignerCount = plv8.execute(
    `
      SELECT COUNT(*)
      FROM request_schema.request_signer_table
      INNER JOIN form_schema.signer_table ON signer_id = request_signer_signer_id
        AND signer_team_member_id = '${teamMemberId}'
      INNER JOIN request_schema.request_table ON request_id = request_signer_request_id
        AND request_is_disabled = false
      WHERE
        request_signer_status = '${status}'
        AND request_status != 'CANCELED'
    `
  )[0].count;

  returnData = Number(requestSignerCount);
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_request_status_count(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = {};
plv8.subtransaction(function() {
  const {
    formId,
    teamId,
    startDate,
    endDate,
    requestStatusList
  } = input_data;

  const startCase = (str) => str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const data = requestStatusList.map((status) => {
    const statusCount = plv8.execute(
      `
        SELECT COUNT(*)
        FROM request_schema.request_table
        INNER JOIN team_schema.team_member_table ON team_member_id = request_team_member_id
          AND team_member_team_id = '${teamId}'
        WHERE
          request_form_id = '${formId}'
          AND request_status = '${status}'
          AND request_date_created >= '${startDate}'
          AND request_date_created <= '${endDate}'
      `
    )[0].count;

    return {
      label: startCase(status.toLowerCase()),
      value: Number(statusCount),
    };
  });

  const totalCount = data.reduce((total, item) => item.value + total, 0);
  returnData = {
    data,
    totalCount
  }
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_request_team_id(
  input_data JSON
)
RETURNS TEXT
SET search_path TO ''
AS $$
let returnData = "";
plv8.subtransaction(function() {
  const {
    requestId
  } = input_data;

  const requestData = plv8.execute(
    `
      SELECT team_member_team_id
      FROM request_schema.request_table
      INNER JOIN team_schema.team_member_table ON team_member_id = request_team_member_id
      WHERE
        request_id = '${requestId}'
        AND request_is_disabled = false
      LIMIT 1
    `
  );

  if(requestData.length) {
    returnData = requestData[0].team_member_team_id
  }
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_request_total_count(
  input_data JSON
)
RETURNS INT
SET search_path TO ''
AS $$
let returnData = 0;
plv8.subtransaction(function() {
  const {
    formId,
    teamId,
    startDate,
    endDate
  } = input_data;

  const count = plv8.execute(
    `
      SELECT COUNT(*)
      FROM request_schema.request_table
      INNER JOIN team_schema.team_member_table ON team_member_id = request_team_member_id
        AND team_member_team_id = '${teamId}'
      WHERE
        request_is_disabled = false
        AND request_form_id = '${formId}'
        AND request_date_created >= '${startDate}'
        AND request_date_created <= '${endDate}'
    `
  );

  returnData = Number(count);
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_request_status_monthly_count(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = {};
plv8.subtransaction(function() {
  const {
    formId,
    teamId,
    monthRanges
  } = input_data;

  const statusList = ["PENDING", "APPROVED", "REJECTED"];

  returnData = monthRanges.map(({start_of_month, end_of_month}) => {
    const monthlyData = statusList.map(status => {
      const requestStatusCount = plv8.execute(
        `
          SELECT COUNT(*)
          FROM request_schema.request_table
          INNER JOIN team_schema.team_member_table ON team_member_id = request_team_member_id
            AND team_member_team_id = '${teamId}'
          WHERE
            request_is_disabled = false
            AND request_form_id = '${formId}'
            AND request_status = '${status}'
            AND request_date_created >= '${start_of_month}'
            AND request_date_created <= '${end_of_month}'
        `
      )[0].count;

      return {
        key: status.toLowerCase(),
        value: Number(requestStatusCount)
      }
    });

    let statusData = monthlyData.reduce((acc, cur) => {
      acc[cur.key] = cur.value;
      return acc;
    }, {});

    return {
      month: start_of_month,
      ...statusData
    }
  });
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_form_list(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = [];
plv8.subtransaction(function() {
  const {
    teamId,
    app,
    memberId
  } = input_data;

  const formData = plv8.execute(
    `
      SELECT
        form_table.*,
        team_member_table.*
      FROM form_schema.form_table
      INNER JOIN team_schema.team_member_table ON team_member_id = form_team_member_id
        AND team_member_team_id = '${teamId}'
      WHERE
        form_is_disabled = false
        AND form_app = '${app}'
      ORDER BY form_date_created DESC
    `
  );

  returnData = formData.map(form => {
    const formTeamGroupData = plv8.execute(
      `
        SELECT tmgt.team_group_id
        FROM form_schema.form_team_group_table AS ftgt
        INNER JOIN team_schema.team_group_table AS tmgt ON tmgt.team_group_id = ftgt.team_group_id
        WHERE
          form_id = '${form.form_id}'
      `
    );

    const teamGroupData = formTeamGroupData.map(formTeamGroup => {
      const teamMemberData = plv8.execute(
        `
          SELECT team_member_id
          FROM team_schema.team_group_member_table
          WHERE
            team_group_id = '${formTeamGroup.team_group_id}'
            AND team_member_id = '${memberId}'
        `
      );

      return {
        team_group: {
          team_group_member: teamMemberData
        }
      }
    });

    return {
      form_app: form.form_app,
      form_date_created: form.form_date_created,
      form_description: form.form_description,
      form_id: form.form_id,
      form_is_disabled: form.form_is_disabled,
      form_is_for_every_member: form.form_is_for_every_member,
      form_is_formsly_form: form.form_is_formsly_form,
      form_is_hidden: form.form_is_hidden,
      form_is_signature_required: form.form_is_signature_required,
      form_name: form.form_name,
      form_sub_type: form.form_sub_type,
      form_team_member_id: form.form_team_member_id,
      form_type: form.form_type,
      form_is_public_form: form.form_is_public_form,
      form_team_member: {
        team_member_date_created: form.team_member_date_created,
        team_member_id: form.team_member_id,
        team_member_is_disabled: form.team_member_is_disabled,
        team_member_role: form.team_member_role,
        team_member_team_id: form.team_member_team_id,
        team_member_user_id: form.team_member_user_id,
      },
      form_team_group: teamGroupData
    }
  });
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_team_project_list(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = {};
plv8.subtransaction(function() {
  const {
    teamId,
    search,
    page,
    limit
  } = input_data;

  const start = (page - 1) * limit;

  let searchCondition = '';
  if(search){
    searchCondition = `AND team_project_name ILIKE '%${search}%'`;
  }

  const teamProjectData = plv8.execute(
    `
      SELECT *
      FROM team_schema.team_project_table
      WHERE
        team_project_team_id = '${teamId}'
        AND team_project_is_disabled = false
        ${searchCondition}
      ORDER BY team_project_name
      OFFSET ${start} LIMIT ${limit}
    `
  );

  const teamProjectCount = plv8.execute(
    `
      SELECT COUNT(*)
      FROM team_schema.team_project_table
      WHERE
        team_project_team_id = '${teamId}'
        AND team_project_is_disabled = false
        ${searchCondition}
    `
  )[0].count;

  const teamProjectWithAttachmentData = teamProjectData.map(project => {
    let addressData = [];
    if(project.team_project_address_id){
      addressData = plv8.execute(
        `
          SELECT *
          FROM public.address_table
          WHERE address_id = '${project.team_project_address_id}'
          LIMIT 1
        `
      );
    }
    let siteMapData = [];
    if(project.team_project_site_map_attachment_id){
      siteMapData = plv8.execute(
        `
          SELECT attachment_value
          FROM public.attachment_table
          WHERE attachment_id = '${project.team_project_site_map_attachment_id}'
          LIMIT 1
        `
      );
    }
    let boqData = [];
    if(project.team_project_boq_attachment_id){
      boqData = plv8.execute(
        `
          SELECT attachment_value
          FROM public.attachment_table
          WHERE attachment_id = '${project.team_project_boq_attachment_id}'
          LIMIT 1
        `
      );
    }

    return {
      team_project_address_id: project.team_project_address_id,
      team_project_boq_attachment_id: project.team_project_boq_attachment_id,
      team_project_code: project.team_project_code,
      team_project_date_created: project.team_project_date_created,
      team_project_id: project.team_project_id,
      team_project_is_disabled: project.team_project_is_disabled,
      team_project_name: project.team_project_name,
      team_project_site_map_attachment_id: project.team_project_site_map_attachment_id,
      team_project_team_id: project.team_project_team_id,
      team_project_site_map_attachment_id: siteMapData.length ? siteMapData[0].attachment_value : "",
      team_project_boq_attachment_id: boqData.length ? boqData[0].attachment_value : "",
      team_project_address: addressData.length ? addressData[0] : {}
    }
  });

  returnData = {
    data: teamProjectWithAttachmentData,
    count: Number(teamProjectCount)
  }
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION check_user_email(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = [];
plv8.subtransaction(function() {
  const {
    emailList,
    teamId
  } = input_data;

  const emailListCondition = emailList.map(email => `'${email}'`).join(",");

  returnData = plv8.execute(
    `
      SELECT user_email
      FROM team_schema.team_member_table
      INNER JOIN user_schema.user_table ON user_id = team_member_user_id
        AND user_email IN (${emailListCondition})
      WHERE
        team_member_team_id = '${teamId}'
    `
  ).map(data => data.user_email);
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION create_item_from_ticket_request(
  input_data JSON
)
RETURNS VOID
SET search_path TO ''
AS $$
  plv8.subtransaction(function(){
    const {
      generalName,
      unitOfMeasurement,
      glAccount,
      divisionList,
      divisionDescription,
      isPedItem,
      isITAssetItem,
      descriptionList,
      teamId
    } = input_data;

    const item_result = plv8.execute(
      `
        INSERT INTO item_schema.item_table
        (
          item_general_name,
          item_unit,
          item_gl_account,
          item_team_id,
          item_is_ped_item,
          item_is_it_asset_item
        )
        VALUES
        (
          '${generalName}',
          '${unitOfMeasurement}',
          '${glAccount}',
          '${teamId}',
          ${Boolean(isPedItem)},
          ${Boolean(isITAssetItem)}
        ) RETURNING *
      `
    )[0];

    const itemDivisionInput = divisionList.map(division => {
      return `('${division}', '${item_result.item_id}')`;
    }).join(",");
    let itemDivisionDescription;
    if (divisionDescription) {
      itemDivisionDescription = plv8.execute(
        `
          INSERT INTO item_schema.item_level_three_description_table
          (
            item_level_three_description_item_id,
            item_level_three_description
          )
          VALUES (
            '${item_result.item_id}',
            '${divisionDescription}'
          )
          RETURNING *
        `
      )[0].item_level_three_description;
    }
    const item_division_list_result = plv8.execute(`INSERT INTO item_schema.item_division_table (item_division_value, item_division_item_id) VALUES ${itemDivisionInput} RETURNING *`);

    const itemDescriptionInput = [];
    const fieldInput = [];

    descriptionList.forEach((description, index) => {
      const fieldId = plv8.execute('SELECT extensions.uuid_generate_v4()')[0].uuid_generate_v4;
      const descriptionId = plv8.execute('SELECT extensions.uuid_generate_v4()')[0].uuid_generate_v4;
      itemDescriptionInput.push({
        item_description_id: descriptionId,
        item_description_label: description.description,
        item_description_item_id: item_result.item_id,
        item_description_is_available: true,
        item_description_field_id: fieldId,
        item_description_is_with_uom: Boolean(description.isWithUom),
        item_description_order: index + 1
      });
      fieldInput.push({
        field_id: fieldId,
        field_name: description.description,
        field_type: "DROPDOWN",
        field_order: index + 15,
        field_section_id: '0672ef7d-849d-4bc7-81b1-7a5eefcc1451',
        field_is_required: true,
      });
    });

    const itemDescriptionValues = itemDescriptionInput
      .map((item) =>
        `('${item.item_description_id}','${item.item_description_label}','${item.item_description_item_id}','${item.item_description_is_available}','${item.item_description_field_id}','${item.item_description_is_with_uom}',${item.item_description_order})`
      )
      .join(",");

    const fieldValues = fieldInput
      .map((field) =>
        `('${field.field_id}','${field.field_name}','${field.field_type}','${field.field_order}','${field.field_section_id}','${field.field_is_required}')`
      ).join(",");

    plv8.execute(`INSERT INTO form_schema.field_table (field_id,field_name,field_type,field_order,field_section_id,field_is_required) VALUES ${fieldValues}`);

    const item_description = plv8.execute(`INSERT INTO item_schema.item_description_table (item_description_id, item_description_label,item_description_item_id,item_description_is_available,item_description_field_id, item_description_is_with_uom, item_description_order) VALUES ${itemDescriptionValues} RETURNING *`);
 });
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION add_team_member_to_all_project(
  input_data JSON
)
RETURNS VOID
SET search_path TO ''
AS $$
  plv8.subtransaction(function(){
    const {
      teamMemberIdList
    } = input_data;

    const teamProjectData = plv8.execute(
      `
        SELECT team_project_id
        FROM team_schema.team_project_table
        WHERE
          team_project_is_disabled = false
      `
    );

    teamMemberIdList.forEach(teamMemberId => {
      teamProjectData.forEach(teamProject => {
        plv8.execute(
          `
            INSERT INTO team_schema.team_project_member_table (team_member_id, team_project_id)
            SELECT '${teamMemberId}', '${teamProject.team_project_id}'
            WHERE NOT EXISTS (
              SELECT team_project_member_id
              FROM team_schema.team_project_member_table
              WHERE
                team_member_id = '${teamMemberId}'
                AND team_project_id = '${teamProject.team_project_id}'
            )
          `
        )
      })
    });
 });
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_lrf_summary_table(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      userId,
      limit,
      page,
      projectFilter,
      startDate,
      endDate,
      sortFilter
    } = input_data;

    const offset = (page - 1) * limit;
    const teamId = plv8.execute(`SELECT public.get_user_active_team_id($1)`, [userId])[0].get_user_active_team_id;

    const projectFilterCondition = projectFilter ? `AND request_project_id IN (${projectFilter})` : '';
    const startDateCondition = startDate ? `AND request_date_created >= '${startDate}'` : '';
    const endDateCondition = endDate ? `AND request_date_created <= '${endDate}'` : '';

    const projectList = plv8.execute(`
        SELECT * 
        FROM team_schema.team_project_table 
        WHERE 
            team_project_team_id='${teamId}' 
            AND team_project_is_disabled=false ORDER BY team_project_name ASC;
    `);

    const projectListOptions = projectList.map(project=> ({value: project.team_project_id, label: project.team_project_name}));

    const requestCount = plv8.execute(`
      SELECT
        COUNT(*)
      FROM request_schema.request_table
      INNER JOIN team_schema.team_member_table AS tmt ON tmt.team_member_id = request_team_member_id AND tmt.team_member_team_id = '${teamId}'
      WHERE
        request_status = 'APPROVED'
        AND request_form_id = '582fefa5-3c47-4c2e-85c8-6ba0d6ccd55a'
        ${projectFilterCondition}
        ${startDateCondition}
        ${endDateCondition}
    `)[0].count;

    const parentRequests = plv8.execute(`
      SELECT
        request_id,
        request_formsly_id_prefix,
        request_formsly_id_serial,
        request_date_created,
        request_status_date_updated,
        request_jira_id,
        request_project_id,
        request_form_id AS form_id
      FROM request_schema.request_table
      INNER JOIN team_schema.team_member_table AS tmt ON tmt.team_member_id = request_team_member_id AND tmt.team_member_team_id = '${teamId}'
      WHERE
        request_status = 'APPROVED'
        AND request_form_id = '582fefa5-3c47-4c2e-85c8-6ba0d6ccd55a'
        ${projectFilterCondition}
        ${startDateCondition}
        ${endDateCondition}
      ORDER BY request_date_created ${sortFilter}
      LIMIT '${limit}'
      OFFSET '${offset}'
    `);

    const parentRequestIds = parentRequests.map(req => req.request_id);
    const parentResponses = plv8.execute(`
        SELECT
            rr.request_response,
            rr.request_response_field_id,
            rr.request_response_request_id,
            rr.request_response_duplicatable_section_id,
            ft.field_name
        FROM
            request_schema.request_response_table AS rr
        INNER JOIN
            form_schema.field_table AS ft
            ON ft.field_id = rr.request_response_field_id
        WHERE
            rr.request_response_request_id = ANY($1)
            AND ft.field_name IN (
                'Supplier Name/Payee',
                'Type of Request',
                'Invoice Amount',
                'VAT',
                'Cost',
                'Equipment Code',
                'Cost Code',
                'Bill of Quantity Code',
                'Department'
            )
    `, [parentRequestIds]);

    const parentResponseMap = parentResponses.reduce((map, response) => {
        if (!map[response.request_response_request_id]) {
            map[response.request_response_request_id] = [];
        }
        map[response.request_response_request_id].push(response);
        return map;
    }, {});

    const departmentCache = {};
    Object.entries(parentResponseMap).forEach(([requestId, responses]) => {
        const department = JSON.parse(
            responses.find(res => res.field_name === "Department")?.request_response || null
        );

        if (department && !departmentCache[department]) {
            const deptCodeQuery = `
                SELECT team_department_code
                FROM team_schema.team_department_table
                WHERE team_department_name = $1
            `;
            departmentCache[department] = plv8.execute(deptCodeQuery, [department])[0]?.team_department_code;
        }
    });

    const jiraProjectMap = {};
    parentRequests.forEach(parent => {
        if (!jiraProjectMap[parent.request_project_id]) {
            const jiraProjectQuery = `
                SELECT
                    jpt.jira_project_jira_label
                FROM jira_schema.jira_formsly_project_table AS jfp
                INNER JOIN jira_schema.jira_project_table AS jpt
                ON jpt.jira_project_id = jfp.jira_project_id
                WHERE jfp.formsly_project_id = $1
                LIMIT 1
            `;
            const jiraResult = plv8.execute(jiraProjectQuery, [parent.request_project_id]);
            jiraProjectMap[parent.request_project_id] = jiraResult[0]?.jira_project_jira_label || "";
        }
    });

    const childRequests = plv8.execute(`
        SELECT
            rt.request_id,
            rt.request_formsly_id_prefix,
            rt.request_formsly_id_serial,
            rt.request_date_created,
            rt.request_status_date_updated,
            rt.request_jira_id,
            rt.request_form_id AS form_id
        FROM request_schema.request_table AS rt
        INNER JOIN request_schema.request_response_table AS rrt
            ON rrt.request_response_request_id = rt.request_id
            AND REPLACE(rrt.request_response, '"', '') = ANY($1)
        WHERE
            rt.request_status = 'APPROVED'
            AND rt.request_is_disabled = FALSE
            AND rt.request_form_id = 'e10abdce-e012-45b6-bec4-e0133f1a8467'
    `, [parentRequestIds]);


    const childRequestIds = childRequests.map(req => req.request_id);
    const childResponses = plv8.execute(`
        SELECT
            rr.request_response,
            rr.request_response_field_id,
            rr.request_response_request_id,
            rr.request_response_duplicatable_section_id,
            ft.field_name
        FROM
            request_schema.request_response_table AS rr
        INNER JOIN
            form_schema.field_table AS ft
            ON ft.field_id = rr.request_response_field_id
        WHERE
            rr.request_response_request_id = ANY($1)
            AND ft.field_name IN (
                'Supplier Name/Payee',
                'Type of Request',
                'Invoice Amount',
                'VAT',
                'Cost',
                'Equipment Code',
                'Cost Code',
                'Bill of Quantity Code',
                'Liquidation Reimbursement ID'
            )
    `, [childRequestIds]);

    const childResponseMap = childResponses.reduce((map, response) => {
        if (!map[response.request_response_request_id]) {
            map[response.request_response_request_id] = [];
        }
        map[response.request_response_request_id].push(response);
        return map;
    }, {});

    const requestListWithResponses = parentRequests.flatMap(parent => {
        const parentResponseList = parentResponseMap[parent.request_id] || [];
        const requestDepartment = JSON.parse(
            parentResponseList.find(res => res.field_name === "Department")?.request_response || null
        );

        const requestProject = projectListOptions.find((project) => project.value === parent.request_project_id);

        let requestDepartmentCode = null;

        if (requestProject && requestProject.label.includes("CENTRAL OFFICE")) {
            requestDepartmentCode = departmentCache[requestDepartment];
        }

        const parentRequestWithResponses = {
            ...parent,
            request_response_list: parentResponseList,
            request_department_code: requestDepartmentCode,
            jira_project_jira_label: jiraProjectMap[parent.request_project_id] || ""
        };

        return parentRequestWithResponses;
    });

    const boqRequestIds = childRequests.map(request => `'${request.request_id}'`).join(',');

    const boqParentIdResponses = childResponses.filter((res) => res.request_response_field_id === 'eff42959-8552-4d7e-836f-f89018293ae8');

    const reducedRequestListWithResponses = requestListWithResponses
    .reduce((acc, current) => {
        const connectedBoqRequest = boqParentIdResponses.find(
            res => res.request_response === `"${current.request_id}"`
        )
        if (connectedBoqRequest) {
            const boqRequestData = childRequests.find((req) => req.request_id === connectedBoqRequest.request_response_request_id);
            if (boqRequestData) {
                const boqRequest = {
                    ...boqRequestData,
                    request_response_list: childResponseMap[connectedBoqRequest.request_response_request_id]
                };

                current = {
                    ...current,
                    request_boq_data: {
                        request_id: boqRequest.request_id,
                        request_formsly_id: `${boqRequest.request_formsly_id_prefix}-${boqRequest.request_formsly_id_serial}`
                    },
                    request_response_list: boqRequest.request_response_list
                }
            }
        }

        acc.push(current);

        return acc;
    }, []);



    returnData = {
      data: reducedRequestListWithResponses,
      count: parseInt(requestCount),
      projectListOptions,
      projectFilter
    };
 });
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION create_public_request_page_on_load(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData;
plv8.subtransaction(function(){
   const {
      formId,
      applicationInformationId,
      generalAssessmentId
    } = input_data;

    const isStringParsable = (str) => {
      try {
        JSON.parse(str);
        return true;
      } catch (e) {
        return false;
      }
    };

    const safeParse = (str) => {
      if (isStringParsable(str)) {
        return JSON.parse(str);
      } else {
        return str;
      }
    };

    const formData = plv8.execute(
      `
        SELECT
          form_id,
          form_name,
          form_description,
          form_date_created,
          form_is_hidden,
          form_is_formsly_form,
          form_is_for_every_member,
          form_type,
          form_sub_type,
          team_member_id,
          user_id,
          user_first_name,
          user_last_name,
          user_avatar,
          user_username,
          team_member_team_id
        FROM form_schema.form_table
        INNER JOIN team_schema.team_member_table ON team_member_id = form_team_member_id
        INNER JOIN user_schema.user_table ON user_id = team_member_user_id
        WHERE
          form_id = '${formId}'
          AND form_is_disabled = false
      `
    )[0];

    const signerData = plv8.execute(
      `
        SELECT
          signer_id,
          signer_is_primary_signer,
          signer_action,
          signer_order,
          signer_is_disabled,
          signer_team_project_id,
          team_member_id,
          user_id,
          user_first_name,
          user_last_name,
          user_avatar
        FROM form_schema.signer_table
        INNER JOIN team_schema.team_member_table ON team_member_id = signer_team_member_id
        INNER JOIN user_schema.user_table ON user_id = team_member_user_id
        WHERE
          signer_is_disabled = false
          AND signer_team_project_id IS null
          AND signer_form_id = '${formId}'
      `
    );

    const sectionData = [];
    const formSection = plv8.execute(`SELECT * FROM form_schema.section_table WHERE section_form_id = '${formId}' ORDER BY section_order ASC`);
    formSection.forEach(section => {
      const fieldData = plv8.execute(
        `
          SELECT *
          FROM form_schema.field_table
          WHERE field_section_id = '${section.section_id}'
          ORDER BY field_order ASC
        `
      );
      const field = fieldData.map(field => {
        const optionData = plv8.execute(
          `
            SELECT *
            FROM form_schema.option_table
            WHERE option_field_id = '${field.field_id}'
            ORDER BY option_order ASC
          `
        );

        const correctResponseData = plv8.execute(
          `
            SELECT *
            FROM form_schema.correct_response_table
            WHERE
              correct_response_field_id = '${field.field_id}'
            LIMIT 1
          `
        );

        return {
          ...field,
          field_option: optionData,
          field_correct_response: correctResponseData.length ? correctResponseData[0] : null
        };
      });
      sectionData.push({
        ...section,
        section_field: field,
      })
    });

    const form = {
      form_id: formData.form_id,
      form_name: formData.form_name,
      form_description: formData.form_description,
      form_date_created: formData.form_date_created,
      form_is_hidden: formData.form_is_hidden,
      form_is_formsly_form: formData.form_is_formsly_form,
      form_is_for_every_member: formData.form_is_for_every_member,
      form_type: formData.form_type,
      form_sub_type: formData.form_sub_type,
      form_team_member: {
        team_member_id: formData.team_member_id,
        team_member_user: {
          user_id: formData.user_id,
          user_first_name: formData.user_first_name,
          user_last_name: formData.user_last_name,
          user_avatar: formData.user_avatar,
          user_username: formData.user_username
        },
        team_member_team_id: formData.team_member_team_id
      },
      form_signer: signerData.map(signer => {
        return {
          signer_id: signer.signer_id,
          signer_is_primary_signer: signer.signer_is_primary_signer,
          signer_action: signer.signer_action,
          signer_order: signer.signer_order,
          signer_is_disabled: signer.signer_is_disabled,
          signer_team_project_id: signer.signer_team_project_id,
          signer_team_member: {
            team_member_id: signer.team_member_id,
            team_member_user: {
              user_id: signer.user_id,
              user_first_name: signer.user_first_name,
              user_last_name: signer.user_last_name,
              user_avatar: signer.user_avatar
            }
          }
        }
      }),
      form_section: sectionData,
    };

    if (form.form_is_formsly_form) {
      if (form.form_name.includes('General Assessment') && applicationInformationId) {
        const requestData = plv8.execute(
          `
            SELECT request_id
            FROM public.request_view
            WHERE request_formsly_id = '${applicationInformationId}'
          `
        );
        if(!requestData.length) throw new Error('Request not found');
        const requestId = requestData[0].request_id;

        const applicantData = plv8.execute(
          `
            SELECT
              request_response,
              field_id
            FROM request_schema.request_response_table
            INNER JOIN form_schema.field_table ON field_id = request_response_field_id
              AND field_id IN (
                '56438f2d-da70-4fa4-ade6-855f2f29823b',
                'e48e7297-c250-4595-ba61-2945bf559a25',
                '7ebb72a0-9a97-4701-bf7c-5c45cd51fbce',
                '9322b870-a0a1-4788-93f0-2895be713f9c'
              )
            WHERE
              request_response_request_id = '${requestId}'
            ORDER BY field_order
          `
        );

        returnData = {
          form: {
            ...form,
            form_section: [
              {
                ...form.form_section[0],
                section_field: [
                  {
                    ...form.form_section[0].section_field[0],
                    field_response: applicationInformationId,
                  },
                  ...form.form_section[0].section_field.slice(1)
                ]
              },
              {
                ...form.form_section[1],
                section_field: [
                  {
                    ...form.form_section[1].section_field[0],
                    field_response: safeParse(applicantData[applicantData.length-1].request_response)
                  },
                  {
                    ...form.form_section[1].section_field[1],
                    field_response: safeParse(applicantData[0].request_response)
                  },
                  {
                    ...form.form_section[1].section_field[2],
                    field_response: applicantData[1].field_id === '7ebb72a0-9a97-4701-bf7c-5c45cd51fbce' ? safeParse(applicantData[1].request_response) : ""
                  },
                  {
                    ...form.form_section[1].section_field[3],
                    field_response: safeParse(applicantData[applicantData.length-2].request_response)
                  },
                ]
              },
              ...form.form_section.slice(2)
            ]
          }
        }
        return;
      } else if (form.form_name === 'Technical Assessment' && generalAssessmentId) {
        const requestData = plv8.execute(`
          SELECT request_id
          FROM public.request_view
          WHERE request_formsly_id = '${generalAssessmentId}'
        `);

        if(!requestData.length) throw new Error('Request not found');
         const requestId = requestData[0].request_id;

        const applicantData = plv8.execute(`
          SELECT
            request_response,
            field_id
          FROM request_schema.request_response_table
          INNER JOIN form_schema.field_table ON field_id = request_response_field_id
            AND field_id IN (
              'c3225996-d3e8-4fb4-87d8-f5ced778adcf',
              '3c0723cc-f083-4f89-abe0-f8fb4bd02234',
              '3e2cca9c-b23b-449a-a544-8d60ee8c269d',
              '69a2664f-c34d-4381-b19c-749c4a9a012b',
              '8abe5d1a-8370-4472-b88e-3580f724d12d',
              'be0e130b-455b-47e0-a804-f90943f7bc07',
              '5c5284cd-7647-4307-b558-40b9076d9f7f',
              'f1c516bd-e483-4f32-a5b0-5223b186afb5',
              'd209aed6-e560-49a8-aa77-66c9cada168d',
              'f92a07b0-7b04-4262-8cd4-b3c7f37ce9b6'
            )
          WHERE
            request_response_request_id = '${requestId}'
          ORDER BY field_order
        `);

        const requestApplicationData = plv8.execute(`
          SELECT request_id
          FROM public.request_view
          WHERE request_formsly_id = '${safeParse(applicantData[0].request_response)}'
        `);

        const positionData = plv8.execute(`
          SELECT
            request_response,
            field_id
          FROM request_schema.request_response_table
          INNER JOIN form_schema.field_table ON field_id = request_response_field_id
            AND field_id IN ('0fd115df-c2fe-4375-b5cf-6f899b47ec56')
          WHERE
            request_response_request_id = '${requestApplicationData[0].request_id}'
          ORDER BY field_order
        `);

        const position_type = safeParse(positionData[0].request_response);

        const fieldData = plv8.execute(`
          SELECT f.*, qq.questionnaire_question_id
          FROM form_schema.questionnaire_table q
          JOIN form_schema.questionnaire_question_table qq
          ON qq.questionnaire_question_questionnaire_id = q.questionnaire_id
          JOIN form_schema.field_table f
          ON f.field_id = qq.questionnaire_question_field_id
          JOIN lookup_schema.position_table p
          ON p.position_questionnaire_id  = q.questionnaire_id
          WHERE
            p.position_alias ='${position_type}'
            AND qq.questionnaire_question_is_disabled = FALSE
          ORDER BY RANDOM()
          LIMIT 5;
        `);

        let sectionFieldsWithOptions = [];

        if (fieldData.length > 0) {
          sectionFieldsWithOptions = fieldData.map((field) => {
            const optionData = plv8.execute(`
              SELECT *
              FROM form_schema.question_option_table
              WHERE question_option_questionnaire_question_id = '${field.questionnaire_question_id}'
              ORDER BY question_option_order ASC
            `);

            const optionFormattedData = optionData.filter(option => option.question_option_value !== null && option.question_option_value.trim() !== "").map((option) => ({
                option_id: option.question_option_id,
                option_value: option.question_option_value,
                option_order: option.question_option_order,
                option_field_id: field.field_id,
             }));

            const correctResponseData = plv8.execute(`
              SELECT *
              FROM form_schema.correct_response_table
              WHERE correct_response_field_id = '${field.field_id}'
            `);

            return {
              ...field,
              field_name: safeParse(field.field_name),
              field_type: 'MULTIPLE CHOICE',
              field_option: optionFormattedData,
              field_correct_response: correctResponseData[0],
            };
          });
        }
        returnData = {
          form: {
            ...form,
            form_section: [
            {
              ...form.form_section[0],
              section_field: [
                {
                  ...form.form_section[0].section_field[0],
                  field_response: safeParse(applicantData[0].request_response),
                },
                {
                  ...form.form_section[0].section_field[1],
                  field_response: generalAssessmentId,
                },
                ...form.form_section[0].section_field.slice(2),
             ],
            },
            {
              ...form.form_section[1],
              section_field: [
                {
                  ...form.form_section[1].section_field[0],
                  field_response: safeParse(applicantData[0].request_response),
                },
                {
                  ...form.form_section[1].section_field[1],
                  field_response: safeParse(applicantData[1].request_response),
                },
                {
                  ...form.form_section[1].section_field[2],
                  field_response: safeParse(applicantData[2].request_response),
                },
                {
                  ...form.form_section[1].section_field[3],
                  field_response:
                  applicantData[3].field_id === '69a2664f-c34d-4381-b19c-749c4a9a012b'
                  ? safeParse(applicantData[3].request_response)
                  : '',
                },
                {
                  ...form.form_section[1].section_field[4],
                  field_response:
                  applicantData[3].field_id === '69a2664f-c34d-4381-b19c-749c4a9a012b'
                  ? safeParse(applicantData[4].request_response)
                  : safeParse(applicantData[3].request_response),
                },
              ],
            },
            // ...(sectionFieldsWithOptions.length === 5
            //   ? [
            //     {
            //       ...form.form_section[2],
            //       section_field: sectionFieldsWithOptions,
            //     },
            //   ]
            // : []),
            ],
          },
         };
         return;
      } else {
        returnData = { form }
      }
    } else {
      returnData = { form }
    }
  });
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_application_information_summary_table(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData = [];
  plv8.subtransaction(function(){
    const {
      parentRequestQuery
    } = input_data;
    returnData = plv8.execute(parentRequestQuery);
  });
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_application_information_summary_table_columns(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData = [];
  plv8.subtransaction(function(){
    const {
      requestIdList
    } = input_data;

    returnData = requestIdList.map(requestId => {
      const request_signer = plv8.execute(
        `
          SELECT
            request_signer_id,
            request_signer_status,
            signer_is_primary_signer,
            signer_team_member_id
          FROM request_schema.request_signer_table
          INNER JOIN form_schema.signer_table ON request_signer_signer_id = signer_id
          WHERE request_signer_request_id = $1
        `,
        [requestId]
      )

      return {
        request_id: requestId,
        request_signer: request_signer.map(signer => {
          return {
            request_signer_id: signer.request_signer_id,
            request_signer_status: signer.request_signer_status,
            request_signer: {
              signer_team_member_id: signer.signer_team_member_id,
              signer_is_primary_signer: signer.signer_is_primary_signer
            }
          }
        }),
      };
    });
  });
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_form_section_with_field_list(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      formId,
      userId,
      teamId
    } = input_data;

    const teamMemberGroup = plv8.execute(
      `
        SELECT COUNT(*)
        FROM team_schema.team_member_table AS tmt
        INNER JOIN team_schema.team_group_member_table AS tgmt ON tgmt.team_member_id = tmt.team_member_id
        WHERE
          tmt.team_member_user_id = '${userId}'
          AND tmt.team_member_team_id = '${teamId}'
          AND tmt.team_member_is_disabled = false
          AND tgmt.team_group_id = 'a691a6ca-8209-4b7a-8f48-8a4582bbe75a'
      `
    );
    if(!teamMemberGroup.length) throw new Error();

    const optionList = [];

    const signerIdList = plv8.execute(
      `
        SELECT DISTINCT(signer_id)
        FROM request_schema.request_signer_table
        INNER JOIN request_schema.request_table ON request_id = request_signer_request_id
          AND request_form_id = '16ae1f62-c553-4b0e-909a-003d92828036'
          AND request_is_disabled = false
        INNER JOIN form_schema.signer_table ON signer_id = request_signer_signer_id
      `
    ).map(signer => `'${signer.signer_id}'`);

    let approverOptionList = [];
    if (signerIdList.length) {
      approverOptionList = plv8.execute(
        `
          SELECT
            signer_id,
            user_first_name,
            user_last_name
          FROM form_schema.signer_table
          INNER JOIN team_schema.team_member_table ON team_member_id = signer_team_member_id
          INNER JOIN user_schema.user_table ON user_id = team_member_user_id
          WHERE
            signer_id IN (${signerIdList})
        `
      );
    }

    returnData = {
      optionList,
      approverOptionList: approverOptionList.map(approver => {
        return {
          label: [approver.user_first_name, approver.user_last_name].join(" "),
          value: approver.signer_id
        }
      })
    }
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION fetch_user_request_list(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let return_value
  plv8.subtransaction(function(){
    const {
      page,
      limit,
      email,
      search,
      columnAccessor,
      sort
    } = input_data;

    const offset = (page - 1) * limit;

    const request_list = plv8.execute(
      `
        SELECT
          request_id,
          request_formsly_id,
          request_date_created,
          request_status,
          request_response AS request_application_information_position
        FROM public.request_view
        INNER JOIN hr_schema.application_information_additional_details_table ON request_id = application_information_additional_details_request_id
          AND application_information_additional_details_email = '${email}'
        INNER JOIN request_schema.request_response_table ON request_response_request_id = request_id
          AND request_response_field_id = '0fd115df-c2fe-4375-b5cf-6f899b47ec56'
        WHERE
          request_is_disabled = false
          ${search}
        ORDER BY ${columnAccessor} ${sort}
        LIMIT ${limit}
        OFFSET ${offset}
      `
    );

    let request_count = plv8.execute(
      `
        SELECT COUNT(*)
        FROM public.request_view
        INNER JOIN hr_schema.application_information_additional_details_table ON request_id = application_information_additional_details_request_id
          AND application_information_additional_details_email = '${email}'
        WHERE
          request_is_disabled = false
          ${search}
      `
    )[0];

    return_value = {
      data: request_list,
      count: Number(request_count.count)
    };
  });
  return return_value
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION fetch_user_request_indicator(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      requestList
    } = input_data;

    const checkProgress = (formslyId, requestId) => {
      const generalAssessmentExists = plv8.execute(
        `
          SELECT EXISTS (
            SELECT 1
            FROM hr_schema.request_connection_table
            WHERE
              request_connection_application_information_request_id = '${requestId}'
              AND request_connection_general_assessment_request_id IS NULL
          )
        `
      )[0].exists;
      if(generalAssessmentExists){
        return true;
      }

      const hrPhoneInterviewExists = plv8.execute(
        `
          SELECT EXISTS (
            SELECT 1
            FROM hr_schema.hr_phone_interview_table
            WHERE
              hr_phone_interview_request_id = '${requestId}'
              AND hr_phone_interview_schedule IS NULL
          )
        `
      )[0].exists;
      if(hrPhoneInterviewExists){
        return true;
      }

      const technicalInterviewExists = plv8.execute(
        `
          SELECT EXISTS (
            SELECT 1
            FROM hr_schema.technical_interview_table
            WHERE
              technical_interview_request_id = '${requestId}'
              AND technical_interview_schedule IS NULL
          )
        `
      )[0].exists;
      if(technicalInterviewExists){
        return true;
      }

      const tradeTestExists = plv8.execute(
        `
          SELECT EXISTS (
            SELECT 1
            FROM hr_schema.trade_test_table
            WHERE
              trade_test_request_id = '${requestId}'
              AND trade_test_schedule IS NULL
          )
        `
      )[0].exists;
      if(tradeTestExists){
        return true;
      }

      const jobOfferData = plv8.execute(
        `
          SELECT job_offer_id, job_offer_status
          FROM hr_schema.job_offer_table
          WHERE
            job_offer_request_id = '${requestId}'
          ORDER BY job_offer_date_created DESC
          LIMIT 1
        `
      );
      if(jobOfferData.length && jobOfferData[0].job_offer_status === 'PENDING'){
        return true;
      }
    }

    returnData = requestList.map(request => {
      let isWithProgressIndicator = false;
      if (request.request_status === 'APPROVED') {
        isWithProgressIndicator = checkProgress(request.request_formsly_id, request.request_id);
      }

      return {
        ...request,
        request_is_with_progress_indicator: isWithProgressIndicator
      }
    });
  });
  return returnData
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_user_id_in_application_information(
  input_data JSON
)
RETURNS TEXT
SET search_path TO ''
AS $$
  let return_value = '';
  plv8.subtransaction(function(){
    const {
      requestId
    } = input_data;

    const email = plv8.execute(
      `
        SELECT request_response
        FROM request_schema.request_response_table
        WHERE
          request_response_field_id = '56438f2d-da70-4fa4-ade6-855f2f29823b'
          AND request_response_request_id = '${requestId}'
      `
    )[0].request_response;

    const user = plv8.execute(
      `
        SELECT user_id
        FROM user_schema.user_table
        WHERE
          user_email = '${email.replace(/"/g, '')}'
      `
    );

    if(user.length){
      return_value = user[0].user_id
    }
  });
  return return_value
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_user_id_in_application_information_v1(
  input_data JSON
)
RETURNS TEXT
SET search_path TO ''
AS $$
  let return_value = '';
  plv8.subtransaction(function(){
    const {
      requestId
    } = input_data;

    const email = plv8.execute(
      `
        SELECT request_response
        FROM request_schema.request_response_table
        WHERE
          request_response_field_id = '56438f2d-da70-4fa4-ade6-855f2f29823b'
          AND request_response_request_id = '${requestId}'
      `
    )[0].request_response;

    const user = plv8.execute(
      `
        SELECT user_id
        FROM user_schema.user_table
        WHERE
          user_email = '${email.replace(/"/g, '')}'
      `
    );

    if(user.length){
      return_value = user[0].user_id
    }
  });
  return return_value
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_user_application_progress_on_load(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData = {};
  plv8.subtransaction(function(){
    const {
      requestId,
      userEmail
    } = input_data;

    let applicationInformationData
      = generalAssessmentData
      = technicalAssessmentData
      = hrPhoneInterviewData
      = jobOfferData
      = undefined;
    let technicalInterview1Data
      = technicalInterview2Data
      = tradeTestData
      = backgroundCheckData
      = null;

    const requestUUID = plv8.execute(`SELECT request_id FROM public.request_view WHERE request_formsly_id = '${requestId}'`)[0].request_id;
    const applicantData = plv8.execute(
      `
        SELECT *
        FROM hr_schema.application_information_additional_details_table
        WHERE
          application_information_additional_details_request_id = '${requestUUID}'
        LIMIT 1
      `
    )[0];

    if (userEmail !== applicantData.application_information_additional_details_email) throw new Error('403')
    const positionData = plv8.execute(`SELECT * FROM lookup_schema.position_table WHERE position_alias = '${applicantData.application_information_additional_details_position}' LIMIT 1`)[0];

    if (positionData.position_is_with_technical_interview_1) {
      technicalInterview1Data = undefined;
    }
    if (positionData.position_is_with_technical_interview_2) {
      technicalInterview2Data = undefined;
    }
    if (positionData.position_is_with_trade_test) {
      tradeTestData = undefined;
    }
    if (positionData.position_is_with_background_check) {
      backgroundCheckData = undefined;
    }

    applicationInformationData = plv8.execute(
      `
        SELECT *
        FROM public.request_view
        INNER JOIN hr_schema.request_connection_table ON request_connection_application_information_request_id = request_id
        WHERE
          request_formsly_id = '${requestId}'
        LIMIT 1
      `
    )[0];

    if (!applicationInformationData.request_connection_general_assessment_request_id) {
      returnData = {
        applicationInformationData,
        generalAssessmentData: undefined,
        technicalAssessmentData,
        hrPhoneInterviewData,
        technicalInterview1Data,
        technicalInterview2Data,
        tradeTestData,
        backgroundCheckData,
        jobOfferData
      }
      return;
    }

    generalAssessmentData = plv8.execute(
      `
        SELECT request_view.*
        FROM public.request_view
        WHERE request_id = '${applicationInformationData.request_connection_general_assessment_request_id}'
        LIMIT 1
      `
    );
    generalAssessmentData = generalAssessmentData[0];

     if (!applicationInformationData.request_connection_technical_assessment_request_id) {
      returnData = {
        applicationInformationData,
        generalAssessmentData,
        technicalAssessmentData: undefined,
        hrPhoneInterviewData,
        technicalInterview1Data,
        technicalInterview2Data,
        tradeTestData,
        backgroundCheckData,
        jobOfferData
      }
      return;
    }

    technicalAssessmentData = plv8.execute(
      `
        SELECT request_view.*
        FROM public.request_view
        WHERE request_id = '${applicationInformationData.request_connection_technical_assessment_request_id}'
        LIMIT 1
      `
    );
    technicalAssessmentData = technicalAssessmentData[0];

    hrPhoneInterviewData = plv8.execute(`SELECT * FROM hr_schema.hr_phone_interview_table WHERE hr_phone_interview_request_id = '${requestUUID}'`);
    if (!hrPhoneInterviewData.length) {
      returnData = {
        applicationInformationData,
        generalAssessmentData,
        technicalAssessmentData,
        hrPhoneInterviewData: undefined,
        technicalInterview1Data,
        technicalInterview2Data,
        tradeTestData,
        backgroundCheckData,
        jobOfferData
      }
    }
    hrPhoneInterviewData = hrPhoneInterviewData[0];

    if (positionData.position_is_with_technical_interview_1) {
      technicalInterview1Data = plv8.execute(`SELECT * FROM hr_schema.technical_interview_table WHERE technical_interview_request_id = '${requestUUID}' AND technical_interview_number = 1`);
       if (!technicalInterview1Data.length) {
        returnData = {
          applicationInformationData,
          generalAssessmentData,
          technicalAssessmentData,
          hrPhoneInterviewData,
          technicalInterview1Data: undefined,
          technicalInterview2Data,
          tradeTestData,
          backgroundCheckData,
          jobOfferData
        }
      }
      technicalInterview1Data = technicalInterview1Data[0];
    }

    if (positionData.position_is_with_technical_interview_2) {
      technicalInterview2Data = plv8.execute(`SELECT * FROM hr_schema.technical_interview_table WHERE technical_interview_request_id = '${requestUUID}' AND technical_interview_number = 2`);
       if (!technicalInterview2Data.length) {
        returnData = {
          applicationInformationData,
          generalAssessmentData,
          technicalAssessmentData,
          hrPhoneInterviewData,
          technicalInterview1Data,
          technicalInterview2Data: undefined,
          tradeTestData,
          backgroundCheckData,
          jobOfferData
        }
      }
      technicalInterview2Data = technicalInterview2Data[0];
    }

    if (positionData.position_is_with_trade_test) {
      tradeTestData = plv8.execute(`SELECT * FROM hr_schema.trade_test_table WHERE trade_test_request_id = '${requestUUID}'`);
       if (!tradeTestData.length) {
        returnData = {
          applicationInformationData,
          generalAssessmentData,
          technicalAssessmentData,
          hrPhoneInterviewData,
          technicalInterview1Data,
          technicalInterview2Data,
          tradeTestData: undefined,
          backgroundCheckData,
          jobOfferData
        }
      }
      tradeTestData = tradeTestData[0];
    }

    if (positionData.position_is_with_background_check) {
      backgroundCheckData = plv8.execute(`SELECT * FROM hr_schema.background_check_table WHERE background_check_request_id = '${requestUUID}'`);
       if (!backgroundCheckData.length) {
        returnData = {
          applicationInformationData,
          generalAssessmentData,
          technicalAssessmentData,
          hrPhoneInterviewData,
          technicalInterview1Data,
          technicalInterview2Data,
          tradeTestData,
          backgroundCheckData: undefined,
          jobOfferData
        }
      }
      backgroundCheckData = backgroundCheckData[0];
    }

    jobOfferData = plv8.execute(
      `
        SELECT
          job_offer_table.*,
          attachment_table.*
        FROM hr_schema.job_offer_table
        LEFT JOIN public.attachment_table ON attachment_id = job_offer_attachment_id
        WHERE job_offer_request_id = '${requestUUID}'
        ORDER BY job_offer_date_created DESC
        LIMIT 1
      `
    );
    if (!jobOfferData.length) {
      returnData = {
        applicationInformationData,
        generalAssessmentData,
        technicalAssessmentData,
        hrPhoneInterviewData,
        technicalInterview1Data,
        technicalInterview2Data,
        tradeTestData,
        backgroundCheckData,
        jobOfferData: undefined
      }
    }
    jobOfferData = jobOfferData[0];

    returnData = {
      applicationInformationData,
      generalAssessmentData,
      technicalAssessmentData,
      hrPhoneInterviewData,
      technicalInterview1Data,
      technicalInterview2Data,
      tradeTestData,
      backgroundCheckData,
      jobOfferData
    }
  });
  return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_hr_phone_interview_summary_table(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData = [];
  plv8.subtransaction(function(){
    const {
      userId,
      limit,
      page,
      sort,
      position,
      application_information_request_id,
      application_information_score,
      general_assessment_request_id,
      general_assessment_score,
      technical_assessment_request_id,
      technical_assessment_score,
      hr_phone_interview_status,
      hr_phone_interview_schedule,
      hr_phone_interview_date_created,
      assigned_hr,
      applicant_name,
      applicant_contact_number,
      applicant_email
    } = input_data;

    const offset = (page - 1) * limit;

    let additionalDetailsCondition = [];
    if (position && position.length) {
      additionalDetailsCondition.push(`AND application_information_additional_details_position IN (${position.map(position => `'${position}'`).join(", ")})`);
    }
    if (applicant_name) {
      additionalDetailsCondition.push(`AND CONCAT_WS(' ', application_information_additional_details_first_name, application_information_additional_details_middle_name, application_information_additional_details_last_name) ILIKE '%${applicant_name}%'`);
    }
    if (applicant_contact_number) {
      additionalDetailsCondition.push(`AND application_information_additional_details_contact_number ILIKE '%${applicant_contact_number}%'`);
    }
    if (applicant_email) {
      additionalDetailsCondition.push(`AND application_information_additional_details_email ILIKE '%${applicant_email}%'`);
    }

    let applicationInformationRequestIdCondition = '';
    if (application_information_request_id) {
      applicationInformationRequestIdCondition = `AND applicationInformation.request_formsly_id ILIKE '%${application_information_request_id}%'`;
    }
    let applicationInformationScoreCondition = '';
    if (application_information_score) {
      if (application_information_score.start) {
        applicationInformationScoreCondition += ` AND applicationInformationScore.request_score_value >= ${application_information_score.start}`;
      }
      if (application_information_score.end) {
        applicationInformationScoreCondition += ` AND applicationInformationScore.request_score_value <= ${application_information_score.end}`;
      }
    }
    let generalAssessmentRequestIdCondition = '';
    if (general_assessment_request_id) {
      generalAssessmentRequestIdCondition = `AND generalAssessment.request_formsly_id ILIKE '%${general_assessment_request_id}%'`;
    }
    let generalAssessmentScoreCondition = '';
    if (general_assessment_score) {
      if (general_assessment_score.start) {
        generalAssessmentScoreCondition += ` AND generalAssessmentScore.request_score_value >= ${general_assessment_score.start}`;
      }
      if (general_assessment_score.end) {
        generalAssessmentScoreCondition += ` AND generalAssessmentScore.request_score_value <= ${general_assessment_score.end}`;
      }
    }
    let technicalAssessmentRequestIdCondition = '';
    if (technical_assessment_request_id) {
      technicalAssessmentRequestIdCondition = `AND technicalAssessment.request_formsly_id ILIKE '%${technical_assessment_request_id}%'`;
    }
    let technicalAssessmentScoreCondition = '';
    if (technical_assessment_score) {
      if (technical_assessment_score.start) {
        technicalAssessmentScoreCondition += ` AND technicalAssessmentScore.request_score_value >= ${technical_assessment_score.start}`;
      }
      if (technical_assessment_score.end) {
        technicalAssessmentScoreCondition += ` AND technicalAssessmentScore.request_score_value <= ${technical_assessment_score.end}`;
      }
    }

    let hrPhoneInterviewCondition = "";
    if (hr_phone_interview_status && hr_phone_interview_status.length) {
      hrPhoneInterviewCondition = `AND hr_phone_interview_status IN (${hr_phone_interview_status.map(status => `'${status}'`).join(", ")})`;
    }
    let hrPhoneInterviewScheduleCondition = "";
    if (hr_phone_interview_schedule) {
      if (hr_phone_interview_schedule.start) {
        hrPhoneInterviewScheduleCondition += ` AND hr_phone_interview_schedule >= '${hr_phone_interview_schedule.start}'`;
      }
      if (hr_phone_interview_schedule.end) {
        hrPhoneInterviewScheduleCondition += ` AND hr_phone_interview_schedule <= '${hr_phone_interview_schedule.end}'`;
      }
    }
    let hrPhoneInterviewDateCondition = "";
    if (hr_phone_interview_date_created) {
      if (hr_phone_interview_date_created.start) {
        hrPhoneInterviewDateCondition += ` AND hr_phone_interview_date_created >= '${new Date(hr_phone_interview_date_created.start).toISOString()}'`;
      }
      if (hr_phone_interview_date_created.end) {
        hrPhoneInterviewDateCondition += ` AND hr_phone_interview_date_created <= '${new Date(hr_phone_interview_date_created.end).toISOString()}'`;
      }
    }
    let assignedHRCondition = '';
    if (assigned_hr && assigned_hr.length) {
      assignedHRCondition = `AND hr_phone_interview_team_member_id IN (${assigned_hr.map(assigned_hr => `'${assigned_hr}'`).join(", ")})`;
    }

    returnData = plv8.execute(
      `
        SELECT
          applicationInformation.request_id AS hr_request_reference_id,
          applicationInformation.request_formsly_id AS application_information_request_id,
          applicationInformationScore.request_score_value AS application_information_score,
          generalAssessment.request_formsly_id AS general_assessment_request_id,
          generalAssessmentScore.request_score_value AS general_assessment_score,
          technicalAssessment.request_formsly_id AS technical_assessment_request_id,
          technicalAssessmentScore.request_score_value AS technical_assessment_score,
          hr_phone_interview_id,
          hr_phone_interview_date_created,
          hr_phone_interview_status,
          hr_phone_interview_schedule,
          hr_phone_interview_team_member_id AS assigned_hr_team_member_id,
          CONCAT(user_first_name, ' ', user_last_name) AS assigned_hr,
          application_information_additional_details_position AS position,
          CONCAT_WS(
            ' ',
            application_information_additional_details_first_name,
            application_information_additional_details_middle_name,
            application_information_additional_details_last_name
          ) AS application_information_full_name,
          application_information_additional_details_contact_number AS application_information_contact_number,
          application_information_additional_details_email AS application_information_email
        FROM hr_schema.request_connection_table
        INNER JOIN public.request_view AS applicationInformation ON applicationInformation.request_id = request_connection_application_information_request_id
          AND applicationInformation.request_status = 'APPROVED'
          ${applicationInformationRequestIdCondition.length ? applicationInformationRequestIdCondition : ""}
        INNER JOIN request_schema.request_score_table AS applicationInformationScore ON applicationInformationScore.request_score_request_id = request_connection_application_information_request_id
          ${applicationInformationScoreCondition.length ? applicationInformationScoreCondition : ""}
        INNER JOIN hr_schema.application_information_additional_details_table ON application_information_additional_details_request_id = applicationInformation.request_id
          ${additionalDetailsCondition.length ? additionalDetailsCondition.join(" ") : ""}
        INNER JOIN public.request_view AS generalAssessment ON generalAssessment.request_id = request_connection_general_assessment_request_id
          AND generalAssessment.request_status = 'APPROVED'
          ${generalAssessmentRequestIdCondition.length ? generalAssessmentRequestIdCondition : ""}
        INNER JOIN request_schema.request_score_table AS generalAssessmentScore ON generalAssessmentScore.request_score_request_id = generalAssessment.request_id
          ${generalAssessmentScoreCondition.length ? generalAssessmentScoreCondition : ""}
        INNER JOIN public.request_view AS technicalAssessment ON technicalAssessment.request_id = request_connection_technical_assessment_request_id
          AND technicalAssessment.request_status = 'APPROVED'
          ${technicalAssessmentRequestIdCondition.length ? technicalAssessmentRequestIdCondition : ""}
        INNER JOIN request_schema.request_score_table AS technicalAssessmentScore ON technicalAssessmentScore.request_score_request_id = technicalAssessment.request_id
          ${technicalAssessmentScoreCondition.length ? technicalAssessmentScoreCondition : ""}
        INNER JOIN hr_schema.hr_phone_interview_table ON hr_phone_interview_request_id = applicationInformation.request_id
          ${hrPhoneInterviewDateCondition.length ? hrPhoneInterviewDateCondition : ""}
          ${hrPhoneInterviewCondition}
          ${hrPhoneInterviewScheduleCondition}
          ${assignedHRCondition}
        LEFT JOIN team_schema.team_member_table ON team_member_id = hr_phone_interview_team_member_id
        LEFT JOIN user_schema.user_table ON user_id = team_member_user_id
        ORDER BY ${sort.sortBy} ${sort.order}, hr_phone_interview_date_created DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `
    );
  });
  return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION application_information_next_step(
  input_data JSON
)
RETURNS VOID
SET search_path TO ''
AS $$
  let returnData = {};
  plv8.subtransaction(function(){
    const {
      qualifiedStep,
      position,
      requestId
    } = input_data;

    const steps = [
      'hr_phone_interview',
      'technical_interview_1',
      'technical_interview_2',
      'trade_test',
      'background_check'
    ];
    const positionData = plv8.execute(`SELECT * FROM lookup_schema.position_table WHERE position_alias = '${position}' LIMIT 1`)[0];
    const currentStep = steps.indexOf(qualifiedStep);

    if (positionData.position_is_with_technical_interview_1 && currentStep <= 0) {
      const isAlreadyDone = plv8.execute(`SELECT COUNT(*) FROM hr_schema.technical_interview_table WHERE technical_interview_request_id = '${requestId}' AND technical_interview_number = 1`)[0].count;
      if(isAlreadyDone) {
        plv8.execute(`SELECT public.application_information_next_step('{ "qualifiedStep": "technical_interview_1", "position": "${position}", "requestId": "${requestId}" }')`);
        return;
      };
      plv8.execute(`INSERT INTO hr_schema.technical_interview_table (technical_interview_request_id, technical_interview_number) VALUES ('${requestId}', 1)`);
    } else if (positionData.position_is_with_technical_interview_2 && currentStep <= 1) {
      const isAlreadyDone = plv8.execute(`SELECT COUNT(*) FROM hr_schema.technical_interview_table WHERE technical_interview_request_id = '${requestId}' AND technical_interview_number = 2`)[0].count;
      if(isAlreadyDone) {
        plv8.execute(`SELECT public.application_information_next_step('{ "qualifiedStep": "technical_interview_2", "position": "${position}", "requestId": "${requestId}" }')`);
        return;
      };
      plv8.execute(`INSERT INTO hr_schema.technical_interview_table (technical_interview_request_id, technical_interview_number) VALUES ('${requestId}', 2)`);
    } else if (positionData.position_is_with_trade_test && currentStep <= 2) {
      const isAlreadyDone = plv8.execute(`SELECT COUNT(*) FROM hr_schema.trade_test_table WHERE trade_test_request_id = '${requestId}'`)[0].count;
      if(isAlreadyDone) {
        plv8.execute(`SELECT public.application_information_next_step('{ "qualifiedStep": "trade_test", "position": "${position}", "requestId": "${requestId}" }')`);
        return;
      };
      plv8.execute(`INSERT INTO hr_schema.trade_test_table (trade_test_request_id) VALUES ('${requestId}')`);
    } else if (positionData.position_is_with_background_check && currentStep <= 3) {
      const isAlreadyDoneWithTechnical = plv8.execute(`SELECT COUNT(*) FROM hr_schema.technical_interview_table WHERE technical_interview_request_id = '${requestId}' AND technical_interview_number = 1`)[0].count;
      if(!isAlreadyDoneWithTechnical) {
        plv8.execute(`SELECT public.application_information_next_step('{ "qualifiedStep": "hr_phone_interview", "position": "${position}", "requestId": "${requestId}" }')`);
        return;
      };

      const hrTeamMemberId = plv8.execute(`SELECT public.get_hr_with_lowest_load_within_a_week('{ "table": "background_check", "position":"${position}" }')`)[0].get_hr_with_lowest_load_within_a_week;
      plv8.execute(`INSERT INTO hr_schema.background_check_table (background_check_request_id, background_check_team_member_id) VALUES ('${requestId}', '${hrTeamMemberId}')`);
    } else {
      const hrTeamMemberId = plv8.execute(`SELECT public.get_hr_with_lowest_load_within_a_week('{ "table": "job_offer", "position":"${position}" }')`)[0].get_hr_with_lowest_load_within_a_week;
      plv8.execute(`INSERT INTO hr_schema.job_offer_table (job_offer_request_id, job_offer_team_member_id) VALUES ('${requestId}', '${hrTeamMemberId}')`);
    }
  });
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_hr_with_lowest_load_within_a_week(
  input_data JSON
)
RETURNS TEXT
SET search_path TO ''
AS $$
  let returnData = "";
  plv8.subtransaction(function () {
    const { table, position } = input_data;

    const hrTeamMembers = plv8.execute(`
        SELECT
          tg.team_member_id,
          pt.position_alias,
          CASE
            WHEN pt.position_alias = '${position}' THEN true
            ELSE false
          END AS is_preferred
        FROM team_schema.team_group_member_table tg
        LEFT JOIN hr_schema.hr_preferred_position_table p
          ON p.hr_preferred_position_group_member_id = tg.team_group_member_id
        LEFT JOIN lookup_schema.position_table pt
          ON pt.position_id = p.hr_preferred_position_position_id
        WHERE tg.team_group_id = 'a691a6ca-8209-4b7a-8f48-8a4582bbe75a'
    `);

    if (!hrTeamMembers.length) {
      throw new Error("No HR team members found.");
    }
    const currentDate = new Date(plv8.execute(`SELECT public.get_current_date()`)[0].get_current_date);
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const getWeekRange = (start, end) => [new Date(currentYear, currentMonth, start), new Date(currentYear, currentMonth, end)];
    const weekRanges = [
      getWeekRange(1, 7),
      getWeekRange(8, 14),
      getWeekRange(15, 21),
      getWeekRange(22, new Date(currentYear, currentMonth + 1, 0).getDate())
    ];

    let weekStart, weekEnd;
    for (let [start, end] of weekRanges) {
      if (currentDate >= start && currentDate <= end) {
        weekStart = start;
        weekEnd = end;
        break;
      }
    }

    if (!weekStart) {
      weekStart = new Date(currentYear, currentMonth, 1);
      weekEnd = weekRanges[0][1];
    }

    const hrTeamMemberIds = hrTeamMembers.map(member => `'${member.team_member_id}'`).join(", ");
    const preferredMemberIds = hrTeamMembers
      .filter(member => member.is_preferred)
      .map(member => `'${member.team_member_id}'`)
      .join(", ");

    const isPreferredCondition = preferredMemberIds.length > 0
    ? `team_member_id IN (${preferredMemberIds})`
    : `false`;



    const loadData = plv8.execute(`
        WITH team_member_ids AS (
            SELECT UNNEST(ARRAY[${hrTeamMemberIds}]::UUID[]) AS team_member_id
        ),
        team_load AS (
            SELECT
                t.team_member_id,
                COUNT(bc.${table}_team_member_id) AS total_count,
                COUNT(CASE WHEN bc.${table}_date_created::Date BETWEEN '${weekStart.toISOString()}' AND '${weekEnd.toISOString()}' THEN 1
                END
                ) AS weekly_count
            FROM team_member_ids t
            LEFT JOIN hr_schema.${table}_table bc
            ON t.team_member_id = bc.${table}_team_member_id
            GROUP BY t.team_member_id
        ),
        preferred_load AS (
          SELECT *,
            CASE WHEN ${isPreferredCondition} THEN true ELSE false
            END AS is_preferred
          FROM team_load
        ),
        preferred_balance AS (
          SELECT
            MIN(weekly_count) AS min_weekly_count,
            MAX(weekly_count) AS max_weekly_count
          FROM preferred_load
        ),
       priority_signers AS (
            SELECT pl.*,
                CASE WHEN pb.min_weekly_count = pb.max_weekly_count THEN weekly_count ELSE is_preferred::INT * 1000 + weekly_count
                END AS sorting_priority
            FROM preferred_load pl
            CROSS JOIN preferred_balance pb
        )
        SELECT
            team_member_id,
            weekly_count,
            total_count,
            is_preferred
        FROM priority_signers
        ORDER BY
            weekly_count ASC,
            is_preferred DESC,
            total_count ASC
        LIMIT 1
    `);

    if (loadData.length > 0) {
      returnData = loadData[0].team_member_id;
    } else {
      returnData = "No HR member with available load.";
    }
  });

  return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION update_hr_phone_interview_status(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData = {};
  plv8.subtransaction(function(){
    const {
      status,
      teamMemberId,
      data
    } = input_data;

    const currentDate = new Date(plv8.execute(`SELECT public.get_current_date()`)[0].get_current_date).toISOString();

    plv8.execute(
      `
        UPDATE hr_schema.hr_phone_interview_table
        SET
          hr_phone_interview_status = '${status}',
          hr_phone_interview_status_date_updated = '${currentDate}',
          hr_phone_interview_team_member_id = '${teamMemberId}'
        WHERE
          hr_phone_interview_request_id = '${data.hr_request_reference_id}'
      `
    );

    const userId = plv8.execute(`SELECT user_id FROM user_schema.user_table WHERE user_email = '${data.application_information_email.toLowerCase()}' LIMIT 1`);
    if(userId.length) {
      plv8.execute(
        `
          INSERT INTO public.notification_table
          (
            notification_app,
            notification_type,
            notification_content,
            notification_redirect_url,
            notification_user_id
          ) VALUES
          (
            'REQUEST',
            '${status}',
            'HR phone interview status is updated to ${status}',
            '/user/application-progress/${data.application_information_request_id}',
            '${userId[0].user_id}'
          )
        `
      );
    }

    if (status === 'QUALIFIED') {
      const parsedPosition = data.position.replaceAll('"', '');
      plv8.execute(`SELECT public.application_information_next_step('{ "qualifiedStep": "hr_phone_interview", "position": "${parsedPosition}", "requestId": "${data.hr_request_reference_id}" }')`);
    }
  });
  return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_trade_test_summary_table(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData = [];
  plv8.subtransaction(function(){
    const {
      userId,
      limit,
      page,
      sort,
      position,
      application_information_request_id,
      application_information_score,
      general_assessment_request_id,
      general_assessment_score,
      technical_assessment_request_id,
      technical_assessment_score,
      trade_test_date_created,
      trade_test_status,
      trade_test_schedule,
      assigned_hr,
      applicant_name,
      applicant_contact_number,
      applicant_email
    } = input_data;

    const offset = (page - 1) * limit;

    let additionalDetailsCondition = [];
    if (position && position.length) {
      additionalDetailsCondition.push(`AND application_information_additional_details_position IN (${position.map(position => `'${position}'`).join(", ")})`);
    }
    if (applicant_name) {
      additionalDetailsCondition.push(`AND CONCAT_WS(' ', application_information_additional_details_first_name, application_information_additional_details_middle_name, application_information_additional_details_last_name) ILIKE '%${applicant_name}%'`);
    }
     if (applicant_contact_number) {
      additionalDetailsCondition.push(`AND application_information_additional_details_contact_number ILIKE '%${applicant_contact_number}%'`);
    }
    if (applicant_email) {
      additionalDetailsCondition.push(`AND application_information_additional_details_email ILIKE '%${applicant_email}%'`);
    }

    let applicationInformationRequestIdCondition = '';
    if (application_information_request_id) {
      applicationInformationRequestIdCondition = `AND applicationInformation.request_formsly_id ILIKE '%${application_information_request_id}%'`;
    }
    let applicationInformationScoreCondition = '';
    if (application_information_score) {
      if (application_information_score.start) {
        applicationInformationScoreCondition += ` AND applicationInformationScore.request_score_value >= ${application_information_score.start}`;
      }
      if (application_information_score.end) {
        applicationInformationScoreCondition += ` AND applicationInformationScore.request_score_value <= ${application_information_score.end}`;
      }
    }
    let generalAssessmentRequestIdCondition = '';
    if (general_assessment_request_id) {
      generalAssessmentRequestIdCondition = `AND generalAssessment.request_formsly_id ILIKE '%${general_assessment_request_id}%'`;
    }
    let generalAssessmentScoreCondition = '';
    if (general_assessment_score) {
      if (general_assessment_score.start) {
        generalAssessmentScoreCondition += ` AND generalAssessmentScore.request_score_value >= ${general_assessment_score.start}`;
      }
      if (general_assessment_score.end) {
        generalAssessmentScoreCondition += ` AND generalAssessmentScore.request_score_value <= ${general_assessment_score.end}`;
      }
    }
    let technicalAssessmentRequestIdCondition = '';
    if (technical_assessment_request_id) {
      technicalAssessmentRequestIdCondition = `AND technicalAssessment.request_formsly_id ILIKE '%${technical_assessment_request_id}%'`;
    }
    let technicalAssessmentScoreCondition = '';
    if (technical_assessment_score) {
      if (technical_assessment_score.start) {
        technicalAssessmentScoreCondition += ` AND technicalAssessmentScore.request_score_value >= ${technical_assessment_score.start}`;
      }
      if (technical_assessment_score.end) {
        technicalAssessmentScoreCondition += ` AND technicalAssessmentScore.request_score_value <= ${technical_assessment_score.end}`;
      }
    }
    let tradeTestDateCondition = "";
    if (trade_test_date_created) {
      if (trade_test_date_created.start) {
        tradeTestDateCondition += ` AND trade_test_date_created >= '${new Date(trade_test_date_created.start).toISOString()}'`;
      }
      if (trade_test_date_created.end) {
        tradeTestDateCondition += ` AND trade_test_date_created <= '${new Date(trade_test_date_created.end).toISOString()}'`;
      }trade_test_date_created
    }
    let tradeTestCondition = "";
    if (trade_test_status && trade_test_status.length) {
      tradeTestCondition = `AND trade_test_status IN (${trade_test_status.map(status => `'${status}'`).join(", ")})`;
    }
    let tradeTestScheduleCondition = "";
    if (trade_test_schedule) {
      if (trade_test_schedule.start) {
        tradeTestScheduleCondition += ` AND trade_test_schedule >= '${trade_test_schedule.start}'`;
      }
      if (trade_test_schedule.end) {
        tradeTestScheduleCondition += ` AND trade_test_schedule <= '${trade_test_schedule.end}'`;
      }
    }
    let assignedHRCondition = '';
    if (assigned_hr && assigned_hr.length) {
      assignedHRCondition = `AND trade_test_team_member_id IN (${assigned_hr.map(assigned_hr => `'${assigned_hr}'`).join(", ")})`;
    }

    returnData = plv8.execute(
      `
        SELECT
          applicationInformation.request_id AS hr_request_reference_id,
          applicationInformation.request_formsly_id AS application_information_request_id,
          applicationInformationScore.request_score_value AS application_information_score,
          generalAssessment.request_formsly_id AS general_assessment_request_id,
          generalAssessmentScore.request_score_value AS general_assessment_score,
          technicalAssessment.request_formsly_id AS technical_assessment_request_id,
          technicalAssessmentScore.request_score_value AS technical_assessment_score,
          trade_test_id,
          trade_test_date_created,
          trade_test_status,
          trade_test_schedule,
          trade_test_team_member_id AS assigned_hr_team_member_id,
          trade_test_evaluation_link,
          trade_test_evaluator_team_member_id,
          CONCAT(hru.user_first_name, ' ', hru.user_last_name) AS assigned_hr,
          CONCAT(eu.user_first_name, ' ', eu.user_last_name) AS trade_test_assigned_evaluator,
          er.request_formsly_id AS trade_test_evaluation_request_id,
          application_information_additional_details_position AS position,
          CONCAT_WS(
            ' ',
            application_information_additional_details_first_name,
            application_information_additional_details_middle_name,
            application_information_additional_details_last_name
          ) AS application_information_full_name,
          application_information_additional_details_contact_number AS application_information_contact_number,
          application_information_additional_details_email AS application_information_email,
          interview_meeting_url AS meeting_link
        FROM hr_schema.request_connection_table
        INNER JOIN public.request_view AS applicationInformation ON applicationInformation.request_id = request_connection_application_information_request_id
          AND applicationInformation.request_status = 'APPROVED'
          ${applicationInformationRequestIdCondition.length ? applicationInformationRequestIdCondition : ""}
        INNER JOIN request_schema.request_score_table AS applicationInformationScore ON applicationInformationScore.request_score_request_id = request_connection_application_information_request_id
          ${applicationInformationScoreCondition.length ? applicationInformationScoreCondition : ""}
        INNER JOIN hr_schema.application_information_additional_details_table ON application_information_additional_details_request_id = applicationInformation.request_id
          ${additionalDetailsCondition.length ? additionalDetailsCondition.join(" ") : ""}
        INNER JOIN public.request_view AS generalAssessment ON generalAssessment.request_id = request_connection_general_assessment_request_id
          AND generalAssessment.request_status = 'APPROVED'
          ${generalAssessmentRequestIdCondition.length ? generalAssessmentRequestIdCondition : ""}
        INNER JOIN request_schema.request_score_table AS generalAssessmentScore ON generalAssessmentScore.request_score_request_id = generalAssessment.request_id
          ${generalAssessmentScoreCondition.length ? generalAssessmentScoreCondition : ""}
        INNER JOIN public.request_view AS technicalAssessment ON technicalAssessment.request_id = request_connection_technical_assessment_request_id
          AND technicalAssessment.request_status = 'APPROVED'
          ${technicalAssessmentRequestIdCondition.length ? technicalAssessmentRequestIdCondition : ""}
        INNER JOIN request_schema.request_score_table AS technicalAssessmentScore ON technicalAssessmentScore.request_score_request_id = technicalAssessment.request_id
          ${technicalAssessmentScoreCondition.length ? technicalAssessmentScoreCondition : ""}
        INNER JOIN hr_schema.trade_test_table ON trade_test_request_id = applicationInformation.request_id
          ${tradeTestDateCondition.length ? tradeTestDateCondition : ""}
          ${tradeTestCondition}
          ${tradeTestScheduleCondition}
          ${assignedHRCondition}
        LEFT JOIN team_schema.team_member_table AS hrtm ON hrtm.team_member_id = trade_test_team_member_id
        LEFT JOIN user_schema.user_table AS hru ON hru.user_id = hrtm.team_member_user_id
        LEFT JOIN team_schema.team_member_table AS etm ON etm.team_member_id = trade_test_evaluator_team_member_id
        LEFT JOIN user_schema.user_table AS eu ON eu.user_id = etm.team_member_user_id
        LEFT JOIN public.request_view AS er ON er.request_id = trade_test_evaluation_request_id
        LEFT JOIN hr_schema.interview_online_meeting_table ON interview_meeting_interview_id = trade_test_id
        ORDER BY ${sort.sortBy} ${sort.order}, trade_test_date_created DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `
    );
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION update_trade_test_status(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData = {};
  plv8.subtransaction(function(){
    const {
      status,
      teamMemberId,
      data
    } = input_data;

    const currentDate = new Date(plv8.execute(`SELECT public.get_current_date()`)[0].get_current_date).toISOString();

    plv8.execute(
      `
        UPDATE hr_schema.trade_test_table
        SET
          trade_test_status = '${status}',
          trade_test_status_date_updated = '${currentDate}',
          trade_test_team_member_id = '${teamMemberId}'
        WHERE
          trade_test_request_id = '${data.hr_request_reference_id}'
      `
    );

    const userId = plv8.execute(`SELECT user_id FROM user_schema.user_table WHERE user_email = '${data.application_information_email.toLowerCase()}' LIMIT 1`);
    if(userId.length){
      plv8.execute(
        `
          INSERT INTO public.notification_table
          (
            notification_app,
            notification_type,
            notification_content,
            notification_redirect_url,
            notification_user_id
          ) VALUES
          (
            'REQUEST',
            '${status}',
            'Practical Test status is updated to ${status}',
            '/user/application-progress/${data.application_information_request_id}',
            '${userId[0].user_id}'
          )
        `
      );
    }

    if (status === 'QUALIFIED') {
      const parsedPosition = data.position.replaceAll('"', '');
      plv8.execute(`SELECT public.application_information_next_step('{ "qualifiedStep": "trade_test", "position": "${parsedPosition}", "requestId": "${data.hr_request_reference_id}" }')`);
    }
  });
  return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_phone_meeting_available(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let free_slots;
  plv8.subtransaction(function() {
    const {
      startTime,
      endTime,
      meetingDuration,
      breakDuration
    } = input_data;

    const startUtc = new Date(startTime).toISOString();
    const endUtc = new Date(endTime).toISOString();
    const currentUtc = new Date().toISOString();
    const hrCountResult = plv8.execute(`
      SELECT COUNT(*) AS count
      FROM team_schema.team_group_table tgt
      JOIN team_schema.team_group_member_table tgmt ON tgt.team_group_id = tgmt.team_group_id
      JOIN team_schema.team_member_table tmt ON tmt.team_member_id = tgmt.team_member_id
      WHERE tgt.team_group_name = 'HUMAN RESOURCES'
        AND tmt.team_member_is_disabled = false
    `);
    const hrCount = hrCountResult[0].count;

    const selectedDate = new Date(startTime).toISOString().split('T')[0];


    // Generate slots
    const generateSlots = ({ startTime, endTime, meetingDuration, breakDuration }) => {
      let validStartTime = new Date(startTime);
      let validEndTime = new Date(endTime);
      let slots = [];

      while (validStartTime < validEndTime) {
        const currentSlotEnd = new Date(validStartTime.getTime() + meetingDuration);

         const scheduledList = plv8.execute(`
        SELECT
          iom.interview_meeting_interview_id,
          COALESCE(p.hr_phone_interview_id, t.trade_test_id, ti.technical_interview_id) AS pending_interview_id
        FROM hr_schema.interview_online_meeting_table iom
        LEFT JOIN hr_schema.hr_phone_interview_table p
          ON p.hr_phone_interview_id = iom.interview_meeting_interview_id
          AND p.hr_phone_interview_status = 'PENDING'
        LEFT JOIN hr_schema.technical_interview_table ti
          ON ti.technical_interview_id = iom.interview_meeting_interview_id
          AND ti.technical_interview_status = 'PENDING'
        LEFT JOIN hr_schema.trade_test_table t
          ON t.trade_test_id = iom.interview_meeting_interview_id
          AND t.trade_test_status = 'PENDING'
        WHERE iom.interview_meeting_is_disabled = false
          AND iom.interview_meeting_schedule = '${validStartTime.toISOString()}'
          AND (
            p.hr_phone_interview_status = 'PENDING'
            OR ti.technical_interview_status = 'PENDING'
            OR t.trade_test_status = 'PENDING'
          )
      `);

       const countScheduledInSlot = scheduledList.length;
         const isFullyBooked = countScheduledInSlot >= hrCount;
        const isPast = validStartTime.toISOString() < currentUtc;
        const isDisabled = isFullyBooked || isPast;

        if (currentSlotEnd <= validEndTime) {
          slots.push({
            slot_start: validStartTime.toISOString(),
            slot_end: currentSlotEnd.toISOString(),
            isDisabled: isDisabled
          });
        }

        validStartTime = new Date(validStartTime.getTime() + meetingDuration + breakDuration);
      }

      return slots;
    };

    free_slots = generateSlots({ startTime: startUtc, endTime: endUtc, meetingDuration, breakDuration });
  });

  return free_slots;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION phone_interview_validation(
    input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let message;
  plv8.subtransaction(function() {
    const {
      interview_schedule,
      requestId,
      meetingType
    } = input_data;

    const position = plv8.execute(`
      SELECT a.application_information_additional_details_position
      FROM hr_schema.application_information_additional_details_table a
      JOIN hr_schema.${meetingType}_table t
      ON t.${meetingType}_request_id = a.application_information_additional_details_request_id
      WHERE t.${meetingType}_id = '${requestId}'
    `)[0].application_information_additional_details_position;

    const hrTeamMembers = plv8.execute(
      `
        SELECT
          tg.team_member_id,
          pt.position_alias,
          CASE
            WHEN pt.position_alias = $1 THEN true
            ELSE false
          END AS is_preferred
        FROM team_schema.team_group_member_table tg
        LEFT JOIN hr_schema.hr_preferred_position_table p
          ON p.hr_preferred_position_group_member_id = tg.team_group_member_id
        LEFT JOIN lookup_schema.position_table pt
          ON pt.position_id = p.hr_preferred_position_position_id
        WHERE tg.team_group_id = 'a691a6ca-8209-4b7a-8f48-8a4582bbe75a'
      `,
      [position]
    );

    if (!hrTeamMembers.length) {
      message = {
        status: 'error',
        message: 'No available HR members.'
      };
      return;
    }

    const hrMemberIds = hrTeamMembers.map(member => member.team_member_id);

    const overlappingSchedules = plv8.execute(
      `
        SELECT
          iom.interview_meeting_schedule,
          COALESCE(
            hpi.hr_phone_interview_team_member_id,
            ti.technical_interview_team_member_id,
            t.trade_test_team_member_id
          ) AS team_member_id
        FROM hr_schema.interview_online_meeting_table iom
        LEFT JOIN hr_schema.hr_phone_interview_table hpi
          ON iom.interview_meeting_interview_id = hpi.hr_phone_interview_id
        LEFT JOIN hr_schema.trade_test_table t
          ON iom.interview_meeting_interview_id = t.trade_test_id
        LEFT JOIN hr_schema.technical_interview_table ti
          ON iom.interview_meeting_interview_id = ti.technical_interview_id
        WHERE iom.interview_meeting_schedule::timestamp = $1::timestamp
          AND iom.interview_meeting_is_disabled = false
          AND COALESCE(
            hpi.hr_phone_interview_team_member_id,
            ti.technical_interview_team_member_id,
            t.trade_test_team_member_id
          ) = ANY($2)
          AND (
            hpi.hr_phone_interview_status = 'PENDING'
            OR ti.technical_interview_status = 'PENDING'
            OR t.trade_test_status = 'PENDING'
          )
      `,
      [interview_schedule, hrMemberIds]
    );

    const membersWithOverlap = overlappingSchedules.map(schedule => schedule.team_member_id);
    const availableMembers = hrTeamMembers.filter(
      member => !membersWithOverlap.includes(member.team_member_id)
    );

    if (!availableMembers.length) {
      message = {
        status: 'error',
        message: 'No available HR members due to overlapping schedules.'
      };
      return;
    }

    const interviewDate = new Date(interview_schedule);
    const currentYear = interviewDate.getFullYear();
    const currentMonth = interviewDate.getMonth();

    const getRange = (start, end) => [new Date(currentYear, currentMonth, start), new Date(currentYear, currentMonth, end)];

    const weekRanges = [
      getRange(1, 7),
      getRange(7, 14),
      getRange(14, 21),
      getRange(21, new Date(currentYear, currentMonth + 1, 0).getDate())
    ];

    let weekStart, weekEnd;
    for (let [start, end] of weekRanges) {
      if (interviewDate >= start && interviewDate <= end) {
        weekStart = start;
        weekEnd = end;
        break;
      }
    }

    if (!weekStart) {
      weekStart = new Date(currentYear, currentMonth, 1);
      weekEnd = weekRanges[0][1];
    }

    const calculateLoads = (members) => {
      return members.map(member => {
        const result = plv8.execute(
          `
            WITH interviews_data AS (
              SELECT
                COUNT(iom_total.interview_meeting_interview_id) AS total_count,
                COUNT(
                  CASE
                    WHEN iom_total.interview_meeting_schedule::DATE BETWEEN $1 AND $2
                    THEN 1 ELSE NULL
                  END
                ) AS weekly_count
              FROM hr_schema.interview_online_meeting_table iom_total
              LEFT JOIN hr_schema.hr_phone_interview_table hpi
                ON iom_total.interview_meeting_interview_id = hpi.hr_phone_interview_id
              LEFT JOIN hr_schema.technical_interview_table ti
                ON iom_total.interview_meeting_interview_id = ti.technical_interview_id
              LEFT JOIN hr_schema.trade_test_table t
                ON iom_total.interview_meeting_interview_id = t.trade_test_id
              WHERE iom_total.interview_meeting_is_disabled = false
                AND (
                  hpi.hr_phone_interview_team_member_id = $3 OR
                  ti.technical_interview_team_member_id = $3 OR
                  t.trade_test_team_member_id = $3
                )
            )
            SELECT
              $3 AS team_member_id,
              weekly_count,
              total_count
            FROM interviews_data;
          `,
          [weekStart, weekEnd, member.team_member_id]
        );
        return {
          ...result[0],
          weekly_count: Number(result[0].weekly_count),
          total_count: Number(result[0].total_count),
          is_preferred: member.is_preferred
        };
      });
    };

    const memberLoads = calculateLoads(availableMembers);

    memberLoads.sort((a, b) => {
      if (a.weekly_count !== b.weekly_count) return a.weekly_count - b.weekly_count;
      if (a.is_preferred !== b.is_preferred) return b.is_preferred - a.is_preferred;
      return a.total_count - b.total_count;
    });

    const selectedMember = memberLoads[0];

    if (!selectedMember) {
      message = {
        status: 'error',
        message: 'No available HR member for the selected time.'
      };
    } else {
      const assignedHrData = plv8.execute(
        `
          SELECT
            user_email,
            user_first_name,
            user_last_name
          FROM team_schema.team_member_table
          INNER JOIN user_schema.user_table ON user_id = team_member_user_id
          WHERE
            team_member_id = $1
          LIMIT 1
        `,
        [selectedMember.team_member_id]
      )[0];

      message = {
        status: 'success',
        message: 'HR phone interview scheduled successfully.',
        assigned_hr_team_member_id: selectedMember.team_member_id,
        assigned_hr_full_name: `${assignedHrData.user_first_name} ${assignedHrData.user_last_name}`,
        assigned_hr_email: assignedHrData.user_email
      };
    }
  });

  return message;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION create_schedule(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData = {};
  plv8.subtransaction(function() {
    const {
      interview_meeting_break_duration,
      interview_meeting_duration,
      interview_meeting_interview_id,
      interview_meeting_provider_id,
      interview_meeting_schedule,
      interview_meeting_url,
      updateScheduleProps
    } = input_data;

    const currentDate = new Date(plv8.execute(`SELECT public.get_current_date()`)[0].get_current_date).toISOString();

    let query = `
      UPDATE hr_schema.` + updateScheduleProps.table + `_table
      SET
        ` + updateScheduleProps.table + `_status_date_updated = '` + currentDate + `',
        ` + updateScheduleProps.table + `_status = '` + updateScheduleProps.status + `',
        ` + updateScheduleProps.table + `_schedule = '` + updateScheduleProps.interviewSchedule + `',
        ` + updateScheduleProps.table + `_team_member_id = '` + updateScheduleProps.team_member_id + `'`;
    if (updateScheduleProps.meetingTypeNumber) {
      query += `,
        ` + updateScheduleProps.table + `_number = ` + updateScheduleProps.meetingTypeNumber;
    }
    query += `
      WHERE ` + updateScheduleProps.table + `_id = '` + updateScheduleProps.targetId + `';`;
    plv8.execute(query);

    returnData = plv8.execute(
      `
        INSERT INTO hr_schema.interview_online_meeting_table
        (
          interview_meeting_break_duration,
          interview_meeting_duration,
          interview_meeting_interview_id,
          interview_meeting_provider_id,
          interview_meeting_schedule,
          interview_meeting_url
        )
        VALUES
        (
          '${interview_meeting_break_duration}',
          '${interview_meeting_duration}',
          '${interview_meeting_interview_id}',
          '${interview_meeting_provider_id}',
          '${interview_meeting_schedule}',
          '${interview_meeting_url}'
        )
        RETURNING *
      `
    )[0];
  });
  return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION update_schedule(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData = {};
  plv8.subtransaction(function() {
    const {
      interview_meeting_id,
      interview_meeting_provider_id,
      interview_meeting_url,
      interview_meeting_schedule,
      updateScheduleProps
    } = input_data;

    const currentDate = new Date(plv8.execute(`SELECT public.get_current_date()`)[0].get_current_date).toISOString();

    let query = `
      UPDATE hr_schema.` + updateScheduleProps.table + `_table
      SET
        ` + updateScheduleProps.table + `_status_date_updated = '` + currentDate + `',
        ` + updateScheduleProps.table + `_status = '` + updateScheduleProps.status + `',
        ` + updateScheduleProps.table + `_schedule = '` + updateScheduleProps.interviewSchedule + `',
        ` + updateScheduleProps.table + `_team_member_id = '` + updateScheduleProps.team_member_id + `'`;
    if (updateScheduleProps.meetingTypeNumber) {
      query += `,
        ` + updateScheduleProps.table + `_number = ` + updateScheduleProps.meetingTypeNumber;
    }
    query += `
      WHERE ` + updateScheduleProps.table + `_id = '` + updateScheduleProps.targetId + `';`;
    plv8.execute(query);

    returnData = plv8.execute(
      `
        UPDATE hr_schema.interview_online_meeting_table
        SET
          interview_meeting_url = '${interview_meeting_url}',
          interview_meeting_provider_id = '${interview_meeting_provider_id}',
          interview_meeting_schedule = '${interview_meeting_schedule}'
        WHERE
          interview_meeting_id = '${interview_meeting_id}'
        RETURNING *
      `
    )[0];
  });
  return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_technical_interview_summary_table(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData = [];
  plv8.subtransaction(function(){
    const {
      userId,
      limit,
      page,
      sort,
      position,
      application_information_request_id,
      application_information_score,
      general_assessment_request_id,
      general_assessment_score,
      technical_assessment_request_id,
      technical_assessment_score,
      technical_interview_date_created,
      technical_interview_status,
      technical_interview_schedule,
      technicalInterviewNumber,
      assigned_hr,
      applicant_name,
      applicant_contact_number,
      applicant_email
    } = input_data;

    const offset = (page - 1) * limit;

    let additionalDetailsCondition = [];
    if (position && position.length) {
      additionalDetailsCondition.push(`AND application_information_additional_details_position IN (${position.map(position => `'${position}'`).join(", ")})`);
    }
    if (applicant_name) {
      additionalDetailsCondition.push(`AND CONCAT_WS(' ', application_information_additional_details_first_name, application_information_additional_details_middle_name, application_information_additional_details_last_name) ILIKE '%${applicant_name}%'`);
    }
    if (applicant_contact_number) {
      additionalDetailsCondition.push(`AND application_information_additional_details_contact_number ILIKE '%${applicant_contact_number}%'`);
    }
    if (applicant_email) {
      additionalDetailsCondition.push(`AND application_information_additional_details_email ILIKE '%${applicant_email}%'`);
    }

    let applicationInformationRequestIdCondition = '';
    if (application_information_request_id) {
      applicationInformationRequestIdCondition = `AND applicationInformation.request_formsly_id ILIKE '%${application_information_request_id}%'`;
    }
    let applicationInformationScoreCondition = '';
    if (application_information_score) {
      if (application_information_score.start) {
        applicationInformationScoreCondition += ` AND applicationInformationScore.request_score_value >= ${application_information_score.start}`;
      }
      if (application_information_score.end) {
        applicationInformationScoreCondition += ` AND applicationInformationScore.request_score_value <= ${application_information_score.end}`;
      }
    }
    let generalAssessmentRequestIdCondition = '';
    if (general_assessment_request_id) {
      generalAssessmentRequestIdCondition = `AND generalAssessment.request_formsly_id ILIKE '%${general_assessment_request_id}%'`;
    }
    let generalAssessmentScoreCondition = '';
    if (general_assessment_score) {
      if (general_assessment_score.start) {
        generalAssessmentScoreCondition += ` AND generalAssessmentScore.request_score_value >= ${general_assessment_score.start}`;
      }
      if (general_assessment_score.end) {
        generalAssessmentScoreCondition += ` AND generalAssessmentScore.request_score_value <= ${general_assessment_score.end}`;
      }
    }
    let technicalAssessmentRequestIdCondition = '';
    if (technical_assessment_request_id) {
      technicalAssessmentRequestIdCondition = `AND technicalAssessment.request_formsly_id ILIKE '%${technical_assessment_request_id}%'`;
    }
    let technicalAssessmentScoreCondition = '';
    if (technical_assessment_score) {
      if (technical_assessment_score.start) {
        technicalAssessmentScoreCondition += ` AND technicalAssessmentScore.request_score_value >= ${technical_assessment_score.start}`;
      }
      if (technical_assessment_score.end) {
        technicalAssessmentScoreCondition += ` AND technicalAssessmentScore.request_score_value <= ${technical_assessment_score.end}`;
      }
    }
    let technicalInterviewDateCondition = "";
    if (technical_interview_date_created) {
      if (technical_interview_date_created.start) {
        technicalInterviewDateCondition += ` AND technical_interview_date_created >= '${new Date(technical_interview_date_created.start).toISOString()}'`;
      }
      if (technical_interview_date_created.end) {
        technicalInterviewDateCondition += ` AND technical_interview_date_created <= '${new Date(technical_interview_date_created.end).toISOString()}'`;
      }technical_interview_date_created
    }
    let technicalInterviewCondition = "";
    if (technical_interview_status && technical_interview_status.length) {
      technicalInterviewCondition = `AND technical_interview_status IN (${technical_interview_status.map(status => `'${status}'`).join(", ")})`;
    }
    let technicalInterviewScheduleCondition = "";
    if (technical_interview_schedule) {
      if (technical_interview_schedule.start) {
        technicalInterviewScheduleCondition += ` AND technical_interview_schedule >= '${technical_interview_schedule.start}'`;
      }
      if (technical_interview_schedule.end) {
        technicalInterviewScheduleCondition += ` AND technical_interview_schedule <= '${technical_interview_schedule.end}'`;
      }
    }
    let assignedHRCondition = '';
    if (assigned_hr && assigned_hr.length) {
      assignedHRCondition = `AND technical_interview_team_member_id IN (${assigned_hr.map(assigned_hr => `'${assigned_hr}'`).join(", ")})`;
    }

    returnData  = plv8.execute(
      `
        SELECT
          applicationInformation.request_id AS hr_request_reference_id,
          applicationInformation.request_formsly_id AS application_information_request_id,
          applicationInformationScore.request_score_value AS application_information_score,
          generalAssessment.request_formsly_id AS general_assessment_request_id,
          generalAssessmentScore.request_score_value AS general_assessment_score,
          technicalAssessment.request_formsly_id AS technical_assessment_request_id,
          technicalAssessmentScore.request_score_value AS technical_assessment_score,
          technical_interview_id,
          technical_interview_date_created,
          technical_interview_status,
          technical_interview_schedule,
          technical_interview_team_member_id AS assigned_hr_team_member_id,
          technical_interview_evaluation_link,
          technical_interview_evaluator_team_member_id,
          CONCAT(hru.user_first_name, ' ', hru.user_last_name) AS assigned_hr,
          CONCAT(eu.user_first_name, ' ', eu.user_last_name) AS technical_interview_assigned_evaluator,
          er.request_formsly_id AS technical_interview_evaluation_request_id,
          application_information_additional_details_position AS position,
          CONCAT_WS(
            ' ',
            application_information_additional_details_first_name,
            application_information_additional_details_middle_name,
            application_information_additional_details_last_name
          ) AS application_information_full_name,
          application_information_additional_details_contact_number AS application_information_contact_number,
          application_information_additional_details_email AS application_information_email,
          interview_meeting_url AS meeting_link
        FROM hr_schema.request_connection_table
        INNER JOIN public.request_view AS applicationInformation ON applicationInformation.request_id = request_connection_application_information_request_id
          AND applicationInformation.request_status = 'APPROVED'
          ${applicationInformationRequestIdCondition.length ? applicationInformationRequestIdCondition : ""}
        INNER JOIN request_schema.request_score_table AS applicationInformationScore ON applicationInformationScore.request_score_request_id = request_connection_application_information_request_id
          ${applicationInformationScoreCondition.length ? applicationInformationScoreCondition : ""}
        INNER JOIN hr_schema.application_information_additional_details_table ON application_information_additional_details_request_id = applicationInformation.request_id
          ${additionalDetailsCondition.length ? additionalDetailsCondition.join(" ") : ""}
        INNER JOIN public.request_view AS generalAssessment ON generalAssessment.request_id = request_connection_general_assessment_request_id
          AND generalAssessment.request_status = 'APPROVED'
          ${generalAssessmentRequestIdCondition.length ? generalAssessmentRequestIdCondition : ""}
        INNER JOIN request_schema.request_score_table AS generalAssessmentScore ON generalAssessmentScore.request_score_request_id = generalAssessment.request_id
          ${generalAssessmentScoreCondition.length ? generalAssessmentScoreCondition : ""}
        INNER JOIN public.request_view AS technicalAssessment ON technicalAssessment.request_id = request_connection_technical_assessment_request_id
          AND technicalAssessment.request_status = 'APPROVED'
          ${technicalAssessmentRequestIdCondition.length ? technicalAssessmentRequestIdCondition : ""}
        INNER JOIN request_schema.request_score_table AS technicalAssessmentScore ON technicalAssessmentScore.request_score_request_id = technicalAssessment.request_id
          ${technicalAssessmentScoreCondition.length ? technicalAssessmentScoreCondition : ""}
        INNER JOIN hr_schema.technical_interview_table ON technical_interview_request_id = applicationInformation.request_id
          AND technical_interview_number = ${technicalInterviewNumber}
          ${technicalInterviewDateCondition.length ? technicalInterviewDateCondition : ""}
          ${technicalInterviewCondition}
          ${technicalInterviewScheduleCondition}
          ${assignedHRCondition}
        LEFT JOIN team_schema.team_member_table AS hrtm ON hrtm.team_member_id = technical_interview_team_member_id
        LEFT JOIN user_schema.user_table AS hru ON hru.user_id = hrtm.team_member_user_id
        LEFT JOIN team_schema.team_member_table AS etm ON etm.team_member_id = technical_interview_evaluator_team_member_id
        LEFT JOIN user_schema.user_table AS eu ON eu.user_id = etm.team_member_user_id
        LEFT JOIN public.request_view AS er ON er.request_id = technical_interview_evaluation_request_id
        LEFT JOIN hr_schema.interview_online_meeting_table ON interview_meeting_interview_id = technical_interview_id
        ORDER BY ${sort.sortBy} ${sort.order}, technical_interview_date_created DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `
    );
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION update_technical_interview_status(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData = {};
  plv8.subtransaction(function(){
    const {
      status,
      teamMemberId,
      data,
      technicalInterviewNumber
    } = input_data;

    const currentDate = new Date(plv8.execute(`SELECT public.get_current_date()`)[0].get_current_date).toISOString();

    plv8.execute(
      `
        UPDATE hr_schema.technical_interview_table
        SET
          technical_interview_status = '${status}',
          technical_interview_status_date_updated = '${currentDate}',
          technical_interview_team_member_id = '${teamMemberId}'
        WHERE
          technical_interview_request_id = '${data.hr_request_reference_id}'
          AND technical_interview_number = ${technicalInterviewNumber}
      `
    );

    const userId = plv8.execute(`SELECT user_id FROM user_schema.user_table WHERE user_email = '${data.application_information_email.toLowerCase()}' LIMIT 1`);
    if(userId.length){
      plv8.execute(
        `
          INSERT INTO public.notification_table
          (
            notification_app,
            notification_type,
            notification_content,
            notification_redirect_url,
            notification_user_id
          ) VALUES
          (
            'REQUEST',
            '${status}',
            '${technicalInterviewNumber === 1 ? "Department Interview" : "Requestor Interview"} status is updated to ${status}',
            '/user/application-progress/${data.application_information_request_id}',
            '${userId[0].user_id}'
          )
        `
      );
    }

    if (status === 'QUALIFIED') {
      const parsedPosition = data.position.replaceAll('"', '');
      const qualifiedStep = `technical_interview_${technicalInterviewNumber}`;
      plv8.execute(`SELECT public.application_information_next_step('{ "qualifiedStep": "${qualifiedStep}", "position": "${parsedPosition}", "requestId": "${data.hr_request_reference_id}" }')`);
    }
  });
  return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_background_check_summary_table(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData = [];
  plv8.subtransaction(function(){
    const {
      userId,
      limit,
      page,
      sort,
      position,
      application_information_request_id,
      application_information_score,
      general_assessment_request_id,
      general_assessment_score,
      technical_assessment_request_id,
      technical_assessment_score,
      background_check_date_created,
      background_check_status,
      assigned_hr,
      applicant_name,
      applicant_contact_number,
      applicant_email
    } = input_data;

    const offset = (page - 1) * limit;

    let additionalDetailsCondition = [];
    if (position && position.length) {
      additionalDetailsCondition.push(`AND application_information_additional_details_position IN (${position.map(position => `'${position}'`).join(", ")})`);
    }
    if (applicant_name) {
      additionalDetailsCondition.push(`AND CONCAT_WS(' ', application_information_additional_details_first_name, application_information_additional_details_middle_name, application_information_additional_details_last_name) ILIKE '%${applicant_name}%'`);
    }
    if (applicant_contact_number) {
      additionalDetailsCondition.push(`AND application_information_additional_details_contact_number ILIKE '%${applicant_contact_number}%'`);
    }
    if (applicant_email) {
      additionalDetailsCondition.push(`AND application_information_additional_details_email ILIKE '%${applicant_email}%'`);
    }

    let applicationInformationRequestIdCondition = '';
    if (application_information_request_id) {
      applicationInformationRequestIdCondition = `AND applicationInformation.request_formsly_id ILIKE '%${application_information_request_id}%'`;
    }
    let applicationInformationScoreCondition = '';
    if (application_information_score) {
      if (application_information_score.start) {
        applicationInformationScoreCondition += ` AND applicationInformationScore.request_score_value >= ${application_information_score.start}`;
      }
      if (application_information_score.end) {
        applicationInformationScoreCondition += ` AND applicationInformationScore.request_score_value <= ${application_information_score.end}`;
      }
    }
    let generalAssessmentRequestIdCondition = '';
    if (general_assessment_request_id) {
      generalAssessmentRequestIdCondition = `AND generalAssessment.request_formsly_id ILIKE '%${general_assessment_request_id}%'`;
    }
    let generalAssessmentScoreCondition = '';
    if (general_assessment_score) {
      if (general_assessment_score.start) {
        generalAssessmentScoreCondition += ` AND generalAssessmentScore.request_score_value >= ${general_assessment_score.start}`;
      }
      if (general_assessment_score.end) {
        generalAssessmentScoreCondition += ` AND generalAssessmentScore.request_score_value <= ${general_assessment_score.end}`;
      }
    }
    let technicalAssessmentRequestIdCondition = '';
    if (technical_assessment_request_id) {
      technicalAssessmentRequestIdCondition = `AND technicalAssessment.request_formsly_id ILIKE '%${technical_assessment_request_id}%'`;
    }
    let technicalAssessmentScoreCondition = '';
    if (technical_assessment_score) {
      if (technical_assessment_score.start) {
        technicalAssessmentScoreCondition += ` AND technicalAssessmentScore.request_score_value >= ${technical_assessment_score.start}`;
      }
      if (technical_assessment_score.end) {
        technicalAssessmentScoreCondition += ` AND technicalAssessmentScore.request_score_value <= ${technical_assessment_score.end}`;
      }
    }
    let backgroundCheckDateCondition = "";
    if (background_check_date_created) {
      if (background_check_date_created.start) {
        backgroundCheckDateCondition += ` AND background_check_date_created >= '${new Date(background_check_date_created.start).toISOString()}'`;
      }
      if (background_check_date_created.end) {
        backgroundCheckDateCondition += ` AND background_check_date_created <= '${new Date(background_check_date_created.end).toISOString()}'`;
      }background_check_date_created
    }
    let backgroundCheckCondition = "";
    if (background_check_status && background_check_status.length) {
      backgroundCheckCondition = `AND background_check_status IN (${background_check_status.map(status => `'${status}'`).join(", ")})`;
    }
    let assignedHRCondition = '';
    if (assigned_hr && assigned_hr.length) {
      assignedHRCondition = `AND background_check_team_member_id IN (${assigned_hr.map(assigned_hr => `'${assigned_hr}'`).join(", ")})`;
    }

    returnData = plv8.execute(
      `
        SELECT
          applicationInformation.request_id AS hr_request_reference_id,
          applicationInformation.request_formsly_id AS application_information_request_id,
          applicationInformationScore.request_score_value AS application_information_score,
          generalAssessment.request_formsly_id AS general_assessment_request_id,
          generalAssessmentScore.request_score_value AS general_assessment_score,
          technicalAssessment.request_formsly_id AS technical_assessment_request_id,
          technicalAssessmentScore.request_score_value AS technical_assessment_score,
          background_check_id,
          background_check_date_created,
          background_check_status,
          background_check_team_member_id AS assigned_hr_team_member_id,
          CONCAT(user_first_name, ' ', user_last_name) AS assigned_hr,
          bi.request_formsly_id AS background_check_evaluation_request_id,
          application_information_additional_details_position AS position,
          CONCAT_WS(
            ' ',
            application_information_additional_details_first_name,
            application_information_additional_details_middle_name,
            application_information_additional_details_last_name
          ) AS application_information_full_name,
          application_information_additional_details_contact_number AS application_information_contact_number,
          application_information_additional_details_email AS application_information_email
        FROM hr_schema.request_connection_table
        INNER JOIN public.request_view AS applicationInformation ON applicationInformation.request_id = request_connection_application_information_request_id
          AND applicationInformation.request_status = 'APPROVED'
          ${applicationInformationRequestIdCondition.length ? applicationInformationRequestIdCondition : ""}
        INNER JOIN request_schema.request_score_table AS applicationInformationScore ON applicationInformationScore.request_score_request_id = request_connection_application_information_request_id
          ${applicationInformationScoreCondition.length ? applicationInformationScoreCondition : ""}
        INNER JOIN hr_schema.application_information_additional_details_table ON application_information_additional_details_request_id = applicationInformation.request_id
          ${additionalDetailsCondition.length ? additionalDetailsCondition.join(" ") : ""}
        INNER JOIN public.request_view AS generalAssessment ON generalAssessment.request_id = request_connection_general_assessment_request_id
          AND generalAssessment.request_status = 'APPROVED'
          ${generalAssessmentRequestIdCondition.length ? generalAssessmentRequestIdCondition : ""}
        INNER JOIN request_schema.request_score_table AS generalAssessmentScore ON generalAssessmentScore.request_score_request_id = generalAssessment.request_id
          ${generalAssessmentScoreCondition.length ? generalAssessmentScoreCondition : ""}
        INNER JOIN public.request_view AS technicalAssessment ON technicalAssessment.request_id = request_connection_technical_assessment_request_id
          AND technicalAssessment.request_status = 'APPROVED'
          ${technicalAssessmentRequestIdCondition.length ? technicalAssessmentRequestIdCondition : ""}
        INNER JOIN request_schema.request_score_table AS technicalAssessmentScore ON technicalAssessmentScore.request_score_request_id = technicalAssessment.request_id
          ${technicalAssessmentScoreCondition.length ? technicalAssessmentScoreCondition : ""}
        INNER JOIN hr_schema.background_check_table ON background_check_request_id = applicationInformation.request_id
          ${backgroundCheckDateCondition.length ? backgroundCheckDateCondition : ""}
          ${backgroundCheckCondition}
          ${assignedHRCondition}
        LEFT JOIN team_schema.team_member_table ON team_member_id = background_check_team_member_id
        LEFT JOIN user_schema.user_table ON user_id = team_member_user_id
        LEFT JOIN public.request_view AS bi ON bi.request_id = background_check_evaluation_request_id
        ORDER BY ${sort.sortBy} ${sort.order}, background_check_date_created DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `
    );
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION update_background_check_status(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData = {};
  plv8.subtransaction(function(){
    const {
      status,
      teamMemberId,
      data
    } = input_data;

    const currentDate = new Date(plv8.execute(`SELECT public.get_current_date()`)[0].get_current_date).toISOString();

    plv8.execute(
      `
        UPDATE hr_schema.background_check_table
        SET
          background_check_status = '${status}',
          background_check_status_date_updated = '${currentDate}',
          background_check_team_member_id = '${teamMemberId}'
        WHERE
          background_check_request_id = '${data.hr_request_reference_id}'
      `
    );

    const userData = plv8.execute(
      `
        SELECT
          user_id,
          user_first_name,
          user_last_name,
          user_email
        FROM user_schema.user_table
        WHERE
          user_email = '${data.application_information_email.toLowerCase()}'
        LIMIT 1
      `
    );
    if(userData.length){
      plv8.execute(
        `
          INSERT INTO public.notification_table
          (
            notification_app,
            notification_type,
            notification_content,
            notification_redirect_url,
            notification_user_id
          ) VALUES
          (
            'REQUEST',
            '${status}',
            'Background Check status is updated to ${status}',
            '/user/application-progress/${data.application_information_request_id}',
            '${userData[0].user_id}'
          )
        `
      );
    }

    if (status === 'QUALIFIED') {
      const parsedPosition = data.position.replaceAll('"', '');
      plv8.execute(`SELECT public.application_information_next_step('{ "qualifiedStep": "background_check", "position": "${parsedPosition}", "requestId": "${data.hr_request_reference_id}" }')`);
    }

    returNData = userData;
  });
  return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_job_offer_summary_table(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData = [];
  plv8.subtransaction(function(){
    const {
      userId,
      limit,
      page,
      sort,
      position,
      application_information_request_id,
      application_information_score,
      general_assessment_request_id,
      general_assessment_score,
      technical_assessment_request_id,
      technical_assessment_score,
      job_offer_date_created,
      job_offer_status,
      assigned_hr,
      applicant_name,
      applicant_contact_number,
      applicant_email
    } = input_data;

    const offset = (page - 1) * limit;

    let additionalDetailsCondition = [];
    if (position && position.length) {
      additionalDetailsCondition.push(`AND application_information_additional_details_position IN (${position.map(position => `'${position}'`).join(", ")})`);
    }
    if (applicant_name) {
      additionalDetailsCondition.push(`AND CONCAT_WS(' ', application_information_additional_details_first_name, application_information_additional_details_middle_name, application_information_additional_details_last_name) ILIKE '%${applicant_name}%'`);
    }
    if (applicant_contact_number) {
      additionalDetailsCondition.push(`AND application_information_additional_details_contact_number ILIKE '%${applicant_contact_number}%'`);
    }
    if (applicant_email) {
      additionalDetailsCondition.push(`AND application_information_additional_details_email ILIKE '%${applicant_email}%'`);
    }

    let applicationInformationRequestIdCondition = '';
    if (application_information_request_id) {
      applicationInformationRequestIdCondition = `AND applicationInformation.request_formsly_id ILIKE '%${application_information_request_id}%'`;
    }
    let applicationInformationScoreCondition = '';
    if (application_information_score) {
      if (application_information_score.start) {
        applicationInformationScoreCondition += ` AND applicationInformationScore.request_score_value >= ${application_information_score.start}`;
      }
      if (application_information_score.end) {
        applicationInformationScoreCondition += ` AND applicationInformationScore.request_score_value <= ${application_information_score.end}`;
      }
    }
    let generalAssessmentRequestIdCondition = '';
    if (general_assessment_request_id) {
      generalAssessmentRequestIdCondition = `AND generalAssessment.request_formsly_id ILIKE '%${general_assessment_request_id}%'`;
    }
    let generalAssessmentScoreCondition = '';
    if (general_assessment_score) {
      if (general_assessment_score.start) {
        generalAssessmentScoreCondition += ` AND generalAssessmentScore.request_score_value >= ${general_assessment_score.start}`;
      }
      if (general_assessment_score.end) {
        generalAssessmentScoreCondition += ` AND generalAssessmentScore.request_score_value <= ${general_assessment_score.end}`;
      }
    }
    let technicalAssessmentRequestIdCondition = '';
    if (technical_assessment_request_id) {
      technicalAssessmentRequestIdCondition = `AND technicalAssessment.request_formsly_id ILIKE '%${technical_assessment_request_id}%'`;
    }
    let technicalAssessmentScoreCondition = '';
    if (technical_assessment_score) {
      if (technical_assessment_score.start) {
        technicalAssessmentScoreCondition += ` AND technicalAssessmentScore.request_score_value >= ${technical_assessment_score.start}`;
      }
      if (technical_assessment_score.end) {
        technicalAssessmentScoreCondition += ` AND technicalAssessmentScore.request_score_value <= ${technical_assessment_score.end}`;
      }
    }
    let jobOfferDateCondition = "";
    if (job_offer_date_created) {
      if (job_offer_date_created.start) {
        jobOfferDateCondition += ` AND job_offer_date_created >= '${new Date(job_offer_date_created.start).toISOString()}'`;
      }
      if (job_offer_date_created.end) {
        jobOfferDateCondition += ` AND job_offer_date_created <= '${new Date(job_offer_date_created.end).toISOString()}'`;
      }job_offer_date_created
    }
    let jobOfferCondition = "";
    if (job_offer_status && job_offer_status.length) {
      jobOfferCondition = `AND job_offer_status IN (${job_offer_status.map(status => `'${status}'`).join(", ")})`;
    }
    let assignedHRCondition = '';
    if (assigned_hr && assigned_hr.length) {
      assignedHRCondition = `AND job_offer_team_member_id IN (${assigned_hr.map(assigned_hr => `'${assigned_hr}'`).join(", ")})`;
    }

    returnData = plv8.execute(
      `
        SELECT
          applicationInformation.request_id AS hr_request_reference_id,
          applicationInformation.request_formsly_id AS application_information_request_id,
          applicationInformationScore.request_score_value AS application_information_score,
          generalAssessment.request_formsly_id AS general_assessment_request_id,
          generalAssessmentScore.request_score_value AS general_assessment_score,
          technicalAssessment.request_formsly_id AS technical_assessment_request_id,
          technicalAssessmentScore.request_score_value AS technical_assessment_score,
          job_offer_id,
          job_offer_date_created,
          job_offer_status,
          job_offer_attachment_id,
          job_offer_project_assignment,
          job_offer_team_member_id AS assigned_hr_team_member_id,
          CONCAT(user_first_name, ' ', user_last_name) AS assigned_hr,
          application_information_additional_details_position AS position,
          CONCAT_WS(
            ' ',
            application_information_additional_details_first_name,
            application_information_additional_details_middle_name,
            application_information_additional_details_last_name
          ) AS application_information_full_name,
          application_information_additional_details_contact_number AS application_information_contact_number,
          application_information_additional_details_email AS application_information_email
        FROM hr_schema.request_connection_table
        INNER JOIN public.request_view AS applicationInformation ON applicationInformation.request_id = request_connection_application_information_request_id
          AND applicationInformation.request_status = 'APPROVED'
          ${applicationInformationRequestIdCondition.length ? applicationInformationRequestIdCondition : ""}
        INNER JOIN request_schema.request_score_table AS applicationInformationScore ON applicationInformationScore.request_score_request_id = request_connection_application_information_request_id
          ${applicationInformationScoreCondition.length ? applicationInformationScoreCondition : ""}
        INNER JOIN hr_schema.application_information_additional_details_table ON application_information_additional_details_request_id = applicationInformation.request_id
          ${additionalDetailsCondition.length ? additionalDetailsCondition.join(" ") : ""}
        INNER JOIN public.request_view AS generalAssessment ON generalAssessment.request_id = request_connection_general_assessment_request_id
          AND generalAssessment.request_status = 'APPROVED'
          ${generalAssessmentRequestIdCondition.length ? generalAssessmentRequestIdCondition : ""}
        INNER JOIN request_schema.request_score_table AS generalAssessmentScore ON generalAssessmentScore.request_score_request_id = generalAssessment.request_id
          ${generalAssessmentScoreCondition.length ? generalAssessmentScoreCondition : ""}
        INNER JOIN public.request_view AS technicalAssessment ON technicalAssessment.request_id = request_connection_technical_assessment_request_id
          AND technicalAssessment.request_status = 'APPROVED'
          ${technicalAssessmentRequestIdCondition.length ? technicalAssessmentRequestIdCondition : ""}
        INNER JOIN request_schema.request_score_table AS technicalAssessmentScore ON technicalAssessmentScore.request_score_request_id = technicalAssessment.request_id
          ${technicalAssessmentScoreCondition.length ? technicalAssessmentScoreCondition : ""}
        INNER JOIN (
          SELECT
            JobOffer.*,
            ROW_NUMBER() OVER (PARTITION BY job_offer_request_id ORDER BY JobOffer.job_offer_date_created DESC) AS RowNumber
          FROM hr_schema.job_offer_table JobOffer
        ) JobOffer ON JobOffer.job_offer_request_id = applicationInformation.request_id
          AND JobOffer.RowNumber = 1
          ${jobOfferDateCondition.length ? jobOfferDateCondition : ""}
          ${jobOfferCondition}
          ${assignedHRCondition}
        LEFT JOIN team_schema.team_member_table ON team_member_id = job_offer_team_member_id
        LEFT JOIN user_schema.user_table ON user_id = team_member_user_id
        ORDER BY ${sort.sortBy} ${sort.order}, job_offer_date_created DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `
    );
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION add_job_offer(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData = {};
  plv8.subtransaction(function(){
    const {
      teamMemberId,
      requestReferenceId,
      userEmail,
      applicationInformationFormslyId,
      attachmentId,
      title,
      projectAssignment,
      projectAddress,
      manpowerLoadingId,
      manpowerLoadingReferenceCreatedBy,
      compensation,
      projectLongitude,
      projectLatitude
    } = input_data;

    const jobOfferId = plv8.execute(
      `
        INSERT INTO hr_schema.job_offer_table
        (
          job_offer_status,
          job_offer_team_member_id,
          job_offer_attachment_id,
          job_offer_request_id,
          job_offer_title,
          job_offer_project_assignment,
          job_offer_project_assignment_address,
          job_offer_manpower_loading_id,
          job_offer_manpower_loading_reference_created_by,
          job_offer_compensation,
          job_offer_project_latitude,
          job_offer_project_longitude
        )
        VALUES
        (
          'PENDING',
          '${teamMemberId}',
          '${attachmentId}',
          '${requestReferenceId}',
          '${title}',
          '${projectAssignment}',
          '${projectAddress}',
          '${manpowerLoadingId}',
          '${manpowerLoadingReferenceCreatedBy}',
          '${compensation}',
          ${projectLatitude ? `'${projectLatitude}'` : "NULL"},
          ${projectLongitude ? `'${projectLongitude}'` : "NULL"}
        )
        RETURNING job_offer_id
      `
    )[0].job_offer_id;

    const userId = plv8.execute(`SELECT user_id FROM user_schema.user_table WHERE user_email = '${userEmail.toLowerCase()}' LIMIT 1`)[0].user_id;
    plv8.execute(
      `
        INSERT INTO public.notification_table
        (
          notification_app,
          notification_type,
          notification_content,
          notification_redirect_url,
          notification_user_id
        ) VALUES
        (
          'REQUEST',
          'REQUEST',
          'You have a new job offer (${title}).',
          '/user/application-progress/${applicationInformationFormslyId}',
          '${userId}'
        )
      `
    );
  });
  return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION update_job_offer_status(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData = {};
  plv8.subtransaction(function(){
    const {
      status,
      requestReferenceId,
      title,
      attachmentId,
      teamMemberId,
      projectAssignment,
      reason,
      projectAddress,
      manpowerLoadingId,
      manpowerLoadingReferenceCreatedBy,
      compensation
    } = input_data;

    const jobOfferId = plv8.execute(
      `
        INSERT INTO hr_schema.job_offer_table
        (
          job_offer_status,
          job_offer_title,
          job_offer_request_id,
          job_offer_attachment_id,
          job_offer_team_member_id,
          job_offer_project_assignment,
          job_offer_project_assignment_address,
          job_offer_manpower_loading_id,
          job_offer_manpower_loading_reference_created_by,
          job_offer_compensation
        )
        VALUES
        (
          '${status}',
          ${title ? `'${title}'` : "NULL"},
          '${requestReferenceId}',
          ${attachmentId ? `'${attachmentId}'` : "NULL"},
          '${teamMemberId}',
          ${projectAssignment ? `'${projectAssignment}'` : "NULL"},
          ${projectAddress ? `'${projectAddress}'` : "NULL"},
          ${manpowerLoadingId ? `'${manpowerLoadingId}'` : "NULL"},
          ${manpowerLoadingReferenceCreatedBy ? `'${manpowerLoadingReferenceCreatedBy}'` : "NULL"},
          ${compensation ? `'${compensation}'` : "NULL"}
        )
        RETURNING job_offer_id
      `
    )[0].job_offer_id;

    if (reason) {
      plv8.execute(
        `
          INSERT INTO hr_schema.job_offer_reason_for_rejection_table
          (
            job_offer_reason_for_rejection,
            job_offer_reason_for_rejection_job_offer_id
          )
          VALUES
          (
            '${reason}',
            '${jobOfferId}'
          )
        `
      );
    }
  });
  return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION accept_job_offer_fetch_request_id_list(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData = [];
  plv8.subtransaction(function(){
    const {
      email
    } = input_data;

    const requestData = plv8.execute(
      `
        SELECT application_information_additional_details_request_id
        FROM hr_schema.application_information_additional_details_table
        WHERE
          application_information_additional_details_email = '${email}'
      `
    );
    if (!requestData.length) return;

    returnData = requestData.map(request => `'${request.application_information_additional_details_request_id}'`);
  });
  return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION accept_job_offer_update_status(
  input_data JSON
)
RETURNS VOID
SET search_path TO ''
AS $$
  plv8.subtransaction(function(){
    const {
      requestIdList
    } = input_data;

    plv8.execute(
      `
        UPDATE request_schema.request_table
        SET request_status = 'WITH ACCEPTED OFFER'
        WHERE
          request_status = 'PENDING'
          AND request_id IN (${requestIdList})
      `
    );

    plv8.execute(
      `
        UPDATE hr_schema.hr_phone_interview_table
        SET hr_phone_interview_status = 'WITH ACCEPTED OFFER'
        WHERE
          hr_phone_interview_status IN ('PENDING', 'WAITING FOR SCHEDULE')
          AND hr_phone_interview_request_id IN (${requestIdList})
      `
    );

    plv8.execute(
      `
        UPDATE hr_schema.technical_interview_table
        SET technical_interview_status = 'WITH ACCEPTED OFFER'
        WHERE
          technical_interview_status IN ('PENDING', 'WAITING FOR SCHEDULE')
          AND technical_interview_request_id IN (${requestIdList})
      `
    );

    plv8.execute(
      `
        UPDATE hr_schema.trade_test_table
        SET trade_test_status = 'WITH ACCEPTED OFFER'
        WHERE
          trade_test_status IN ('PENDING', 'WAITING FOR SCHEDULE')
          AND trade_test_request_id IN (${requestIdList})
      `
    );

    plv8.execute(
      `
        UPDATE hr_schema.background_check_table
        SET background_check_status = 'WITH ACCEPTED OFFER'
        WHERE
          background_check_status = 'PENDING'
          AND background_check_request_id IN (${requestIdList})
      `
    );
  });
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION accept_job_offer_fetch_job_offer_list(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData = [];
  plv8.subtransaction(function(){
    const {
      requestIdList,
      requestReferenceId
    } = input_data;

    returnData = plv8.execute(
      `
        SELECT
          request_id
        FROM request_schema.request_table
        INNER JOIN (
          SELECT *,
            ROW_NUMBER() OVER (PARTITION BY job_offer_request_id ORDER BY job_offer_date_created DESC) AS rn
          FROM hr_schema.job_offer_table
          WHERE
            job_offer_request_id IN (${requestIdList})
            AND job_offer_request_id != '${requestReferenceId}'
        ) jo ON job_offer_request_id = request_id
        AND jo.rn = 1
        AND job_offer_status IN ('PENDING', 'REJECTED', 'WAITING FOR OFFER', 'FOR POOLING')
        ORDER BY job_offer_date_created DESC
      `
    );
  });
  return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION accept_job_offer_update_job_offer(
  input_data JSON
)
RETURNS VOID
SET search_path TO ''
AS $$
  plv8.subtransaction(function(){
    const {
      jobOfferList
    } = input_data;

    const jobOfferInput = jobOfferList.map(jobOffer => {
      return `('WITH ACCEPTED OFFER', '${jobOffer.request_id}')`;
    }).join(", ");

    plv8.execute(
      `
        INSERT INTO hr_schema.job_offer_table
        (
          job_offer_status,
          job_offer_request_id
        )
        VALUES ${jobOfferInput}
      `
    );
  });
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_job_history(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData = [];
  plv8.subtransaction(function(){
    const {
      requestId
    } = input_data;

    const jobOfferData = plv8.execute(
      `
        SELECT * FROM hr_schema.job_offer_table
        LEFT JOIN hr_schema.job_offer_reason_for_rejection_table ON job_offer_id = job_offer_reason_for_rejection_job_offer_id
        WHERE job_offer_request_id = '${requestId}'
        ORDER BY job_offer_date_created
      `
    );

    returnData = jobOfferData.map(jobOffer => {
      let attachmentData = [];
      if (jobOffer.job_offer_attachment_id) {
        attachmentData = plv8.execute(`SELECT * FROM public.attachment_table WHERE attachment_id = '${jobOffer.job_offer_attachment_id}'`);
      }

      let teamMemberData;
      if (jobOffer.job_offer_team_member_id) {
        teamMemberData = plv8.execute(
          `
            SELECT
              team_member_id,
              user_first_name,
              user_last_name
            FROM team_schema.team_member_table
            INNER JOIN user_schema.user_table ON user_id = team_member_user_id
            WHERE
              team_member_id = '${jobOffer.job_offer_team_member_id}'
            LIMIT 1
          `
        )[0];
      }



      return {
        ...jobOffer,
        job_offer_attachment: attachmentData.length ? attachmentData[0] : null,
        job_offer_team_member: {
          team_member_id: teamMemberData ? teamMemberData.team_member_id : "",
          team_member_full_name: teamMemberData ? `${teamMemberData.user_first_name} ${teamMemberData.user_last_name}` : ""
        }
      }
    });
  });
  return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION check_if_group_member(
  input_data JSON
)
RETURNS BOOLEAN
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      userId,
      groupName,
      teamId
    } = input_data;

    const teamMemberId = plv8.execute(
      `
        SELECT team_member_id
        FROM team_schema.team_member_table
        WHERE
          team_member_is_disabled = false
          AND team_member_user_id = '${userId}'
          AND team_member_team_id = '${teamId}'
        LIMIT 1
      `
    )[0].team_member_id;

    const groupNameCondition = groupName.map(name => `team_group_name = '${name}'`).join(" OR ");

    const teamGroupId = plv8.execute(
      `
        SELECT team_group_id
        FROM team_schema.team_group_table
        WHERE
          team_group_is_disabled = false
          AND team_group_team_id = '${teamId}'
          AND (${groupNameCondition})
      `
    );

    const groupIdCondition = teamGroupId.map(id => `team_group_id = '${id.team_group_id}'`).join(" OR ");

    const teamGroupMemberCount = plv8.execute(
      `
        SELECT COUNT(*)
        FROM team_schema.team_group_member_table
        WHERE
          team_member_id = '${teamMemberId}'
          AND (${groupIdCondition})
      `
    )[0].count;

    returnData = Boolean(teamGroupMemberCount);
  });
  return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION create_ad_owner_request(
  input_data JSON
)
RETURNS VOID
SET search_path TO ''
AS $$
plv8.subtransaction(function(){
  const {
    ad_owner_request_owner_id,
    ad_owner_request_request_id
  } = input_data;

  const insert_data = { ad_owner_request_owner_id, ad_owner_request_request_id };

  const ad_owner_list = plv8.execute(`SELECT * FROM lookup_schema.ad_owner_table`);
  const ad_owner_id_list = ad_owner_list.map((owner) => owner.ad_owner_id);
  const is_valid_owner = ad_owner_id_list.includes(ad_owner_request_owner_id);

  if (!is_valid_owner) {
    const scic = ad_owner_list.find((owner) => owner.ad_owner_name === 'scic');
    if (!scic) return;
    insert_data.ad_owner_request_owner_id = scic.ad_owner_id;
  }

  plv8.execute(`
    INSERT INTO lookup_schema.ad_owner_request_table (ad_owner_request_owner_id, ad_owner_request_request_id)
    VALUES ($1, $2)
  `, [insert_data.ad_owner_request_owner_id, insert_data.ad_owner_request_request_id]);
});
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_application_information_analytics(input_data JSON)
RETURNS JSON
SET search_path TO ''
AS $$
  let data;
  plv8.subtransaction(function(){
    const {
      startDate,
      endDate
    } = input_data;

    let dateFilterCondition = '';
    if (startDate && endDate) {
      dateFilterCondition = `AND request_date_created >= '${startDate}' AND request_date_created <= '${endDate}'`
    }

    const candidate_referral_source = plv8.execute(`
        SELECT request_response, COUNT(*)::int AS count
        FROM request_schema.request_response_table
        INNER JOIN request_schema.request_table ON request_id = request_response_request_id
        WHERE request_response_field_id = 'c6e15dd5-9548-4f43-8989-ee53842abde3'
        ${dateFilterCondition}
        GROUP BY request_response
    `);

    const formatted_candidate_referral_source = candidate_referral_source.map((d) => ({count: Number(d.count), ...d}));

    const most_applied_position = plv8.execute(`
      SELECT request_response, COUNT(*)::int AS count
      FROM request_schema.request_response_table
      INNER JOIN request_schema.request_table ON request_id = request_response_request_id
      WHERE request_response_field_id = '0fd115df-c2fe-4375-b5cf-6f899b47ec56'
      ${dateFilterCondition}
      GROUP BY request_response
      ORDER BY count DESC
      LIMIT 10
    `);

    const formatted_most_applied_position = most_applied_position.map((d) => ({count: Number(d.count), ...d}));

    const age_bracket_list = [
      {min: 18, max: 25},
      {min: 26, max: 30},
      {min: 31, max: 35},
      {min: 36, max: 40},
      {min: 41, max: 100}
    ];

    const applicant_age_bracket = age_bracket_list.map((bracket) => {
      const result = plv8.execute(`
        SELECT COUNT(*)::int
        FROM request_schema.request_response_table
        INNER JOIN request_schema.request_table
        ON request_id = request_response_request_id
        WHERE request_response_field_id = '22229778-e532-4b39-b15d-ca9f80c397c0'
        AND CAST(request_response AS int) >= $1
        AND CAST(request_response AS int) <= $2
        ${dateFilterCondition}
      `, [bracket.min, bracket.max]);

      const count = result.length > 0 ? result[0].count : 0;

      return {
        request_response: `${bracket.min}-${bracket.max}`,
        count: Number(count)
      };
    });

    data = {
      candidate_referral_source: formatted_candidate_referral_source,
      most_applied_position: formatted_most_applied_position,
      applicant_age_bracket
    }
 });
 return data;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_ped_part_raya_api(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData = [];
  plv8.subtransaction(function() {
    const {
      sort = 'equipment_part_date_created',
      limit = 100,
      offset = 0,
      startDate = null,
      endDate = null,
      order = 'asc',
      teamId
    } = input_data;

    let query = `
     SELECT p.*,
        g.equipment_general_name,
        b.equipment_brand,
        m.equipment_model,
        u.equipment_unit_of_measurement,
        ec.equipment_component_category
     FROM equipment_schema.equipment_part_table p
     JOIN equipment_schema.equipment_table e
        ON e.equipment_id = p.equipment_part_equipment_id
        AND e.equipment_is_disabled = false
        AND e.equipment_is_available = true
     JOIN equipment_schema.equipment_general_name_table g
        ON g.equipment_general_name_id = p.equipment_part_general_name_id
        AND g.equipment_general_name_is_disabled = false
        AND g.equipment_general_name_is_available = true
     JOIN equipment_schema.equipment_brand_table b
        ON b.equipment_brand_id = p.equipment_part_brand_id
        AND b.equipment_brand_is_disabled = false
        AND b.equipment_brand_is_available = true
     JOIN equipment_schema.equipment_model_table m
        ON m.equipment_model_id = p.equipment_part_model_id
        AND m.equipment_model_is_disabled = false
        AND m.equipment_model_is_available = true
     JOIN unit_of_measurement_schema.equipment_unit_of_measurement_table u
        ON u.equipment_unit_of_measurement_id = p.equipment_part_unit_of_measurement_id
        AND u.equipment_unit_of_measurement_is_disabled = false
        AND u.equipment_unit_of_measurement_is_available = true
     JOIN equipment_schema.equipment_component_category_table ec
        ON ec.equipment_component_category_id = p.equipment_part_component_category_id
        AND ec.equipment_component_category_is_disabled = false
        AND ec.equipment_component_category_is_available = true
     WHERE p.equipment_part_is_available = true
       AND p.equipment_part_is_disabled = false
       AND e.equipment_team_id = '${teamId}'`;

    if (startDate) {
      query += ` AND p.equipment_part_date_created >= '${startDate}' `;
    }
    if (endDate) {
      query += ` AND p.equipment_part_date_created <= '${endDate}' `;
    }

    query += ` ORDER BY p.${sort} ${order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'} `;
    query += ` LIMIT ${Math.min(limit, 1000)} OFFSET ${offset} `;
    let pedPartData = plv8.execute(query);
     pedPartData.forEach((data) => {
        const {
          equipment_part_is_available,
          equipment_part_is_disabled,
          equipment_part_general_name_id,
          equipment_part_brand_id,
          equipment_part_unit_of_measurement_id,
          equipment_part_component_category_id,
          equipment_part_model_id,
          equipment_part_equipment_id,
          ...filteredData
        } = data;
        returnData.push(filteredData);
    });
  });
  return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_other_expenses_raya_api(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData = [];
   plv8.subtransaction(function() {
    const {
      sort = 'other_expenses_type_date_created',
      limit = 100,
      offset = 0,
      startDate = null,
      endDate = null,
      order = 'asc',
      teamId
    } = input_data;

    let query = `
      SELECT t.*, c.other_expenses_category
      FROM other_expenses_schema.other_expenses_type_table t
      JOIN other_expenses_schema.other_expenses_category_table c
      ON c.other_expenses_category_id = t.other_expenses_type_category_id
      WHERE t.other_expenses_type_is_available = true
      AND t.other_expenses_type_is_disabled = false
      AND c.other_expenses_category_team_id = '${teamId}'
    `;

    if (startDate) {
      query += ` AND t.other_expenses_type_date_created >= '${startDate}' `;
    }
    if (endDate) {
      query += ` AND t.other_expenses_type_date_created <= '${endDate}' `;
    }
    query += ` ORDER BY t.${sort} ${order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'} `;
    query += ` LIMIT ${Math.min(limit, 1000)} OFFSET ${offset} `;
    let otherExpensesData = plv8.execute(query);

    otherExpensesData.forEach((data) => {
      const {
        other_expenses_type_is_disabled,
        other_expenses_type_is_available,
        other_expenses_type_category_id,
        ...filteredData
      } = data;

      returnData.push(filteredData);
    });
  });
  return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_item_raya_api(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = [];
  plv8.subtransaction(function() {
    const {
      limit = 100,
      offset = 0,
      startDate = null,
      endDate = null,
      order = 'asc',
      teamId
    } = input_data;

    let query = `
      SELECT
        i.*,
        c.item_description_label
      FROM
        item_schema.item_table i
      JOIN
        item_schema.item_description_table c
        ON c.item_description_item_id = i.item_id
        AND c.item_description_is_available = true
        AND c.item_description_is_disabled = false
      WHERE
        i.item_is_available = true
        AND i.item_is_disabled = false
        AND i.item_team_id = '${teamId}'`;

    if (startDate) {
      query += ` AND i.item_date_created >= '${startDate}' `;
    }
    if (endDate) {
      query += ` AND i.item_date_created <= '${endDate}' `;
    }

    query += ` ORDER BY i.item_date_created ${order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'} `;
    query += ` LIMIT ${Math.min(limit, 1000)} OFFSET ${offset} `;

    let itemData = plv8.execute(query);

    let groupedData = {};

    itemData.forEach((data) => {
      const itemId = data.item_id;
      if (!groupedData[itemId]) {
        const {
          item_is_available,
          item_is_disabled,
          item_category_id,
          item_team_id,
          item_description_label,
          ...initialData
        } = data;

        groupedData[itemId] = {
          ...initialData,
          item_descriptions: [],
        };
      }

      if (data.item_description_label) {
        groupedData[itemId].item_descriptions.push(data.item_description_label);
      }
    });

    returnData = Object.values(groupedData);
  });
  return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_ped_item_raya_api(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = [];
  plv8.subtransaction(function() {
    const {
      limit = 100,
      offset = 0,
      startDate = null,
      endDate = null,
      order = 'asc',
      teamId
    } = input_data;

    let query = `
      SELECT
        i.*,
        c.item_description_label
      FROM
        item_schema.item_table i
      JOIN
        item_schema.item_description_table c
        ON c.item_description_item_id = i.item_id
        AND c.item_description_is_available = true
        AND c.item_description_is_disabled = false
      WHERE
        i.item_is_available = true
        AND i.item_is_disabled = false
        AND i.item_is_ped_item = true
        AND i.item_team_id = '${teamId}'`;

    if (startDate) {
      query += ` AND i.item_date_created >= '${startDate}' `;
    }
    if (endDate) {
      query += ` AND i.item_date_created <= '${endDate}' `;
    }

    query += ` ORDER BY i.item_date_created ${order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'} `;
    query += ` LIMIT ${Math.min(limit, 1000)} OFFSET ${offset} `;

    let itemData = plv8.execute(query);

    let groupedData = {};

    itemData.forEach((data) => {
      const itemId = data.item_id;
      if (!groupedData[itemId]) {
        const {
          item_is_available,
          item_is_disabled,
          item_category_id,
          item_team_id,
          item_description_label,
          ...initialData
        } = data;

        groupedData[itemId] = {
          ...initialData,
          item_descriptions: [],
        };
      }

      if (data.item_description_label) {
        groupedData[itemId].item_descriptions.push(data.item_description_label);
      }
    });
    returnData = Object.values(groupedData);
  });
  return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_services_raya_api(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = [];
plv8.subtransaction(function() {
    const {
      limit = 100,
      offset = 0,
      startDate = null,
      endDate = null,
      order = 'asc',
      teamId
    } = input_data;

    let query = `
      SELECT s.*,c.service_scope_name
      FROM service_schema.service_table s
      JOIN service_schema.service_scope_table c ON c.service_scope_service_id = s.service_id
      AND c.service_scope_is_available = true
      AND c.service_scope_is_disabled = false
      WHERE s.service_is_available = true and s.service_is_disabled = false AND s.service_team_id = '${teamId}'`
    if (startDate) {
      query += ` AND s.service_date_created >= '${startDate}' `;
    }
    if (endDate) {
      query += ` AND s.service_date_created <= '${endDate}' `;
    }
    query += ` ORDER BY s.service_date_created ${order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'} `;
    query += ` LIMIT ${Math.min(limit, 1000)} OFFSET ${offset} `;
    let serviceData = plv8.execute(query);

    serviceData.forEach((data)=>{
      const {
        service_is_available,
        service_is_disabled,
        service_category_id,
        service_team_id,
        ...filteredData
      } = data;

      returnData.push(filteredData);
    })
})
return returnData
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_it_asset_raya_api(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = [];
  plv8.subtransaction(function() {
    const {
      limit = 100,
      offset = 0,
      startDate = null,
      endDate = null,
      order = 'asc',
      teamId
    } = input_data;

    let query = `
      SELECT
        i.*,
        c.item_description_label
      FROM
        item_schema.item_table i
      JOIN
        item_schema.item_description_table c
        ON c.item_description_item_id = i.item_id
        AND c.item_description_is_available = true
        AND c.item_description_is_disabled = false
      WHERE
        i.item_is_available = true
        AND i.item_is_disabled = false
        AND i.item_is_it_asset_item = true
        AND i.item_team_id = '${teamId}'`;

    if (startDate) {
      query += ` AND i.item_date_created >= '${startDate}' `;
    }
    if (endDate) {
      query += ` AND i.item_date_created <= '${endDate}' `;
    }

    query += ` ORDER BY i.item_date_created ${order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'} `;
    query += ` LIMIT ${Math.min(limit, 1000)} OFFSET ${offset} `;

    let itemData = plv8.execute(query);

    let groupedData = {};

    itemData.forEach((data) => {
      const itemId = data.item_id;
      if (!groupedData[itemId]) {
        const {
          item_is_available,
          item_is_disabled,
          item_category_id,
          item_team_id,
          ...initialData
        } = data;

        groupedData[itemId] = {
          ...initialData,
          item_descriptions: [],
        };
      }

      if (data.item_description_label) {
        groupedData[itemId].item_descriptions.push(data.item_description_label);
      }
    });
    returnData = Object.values(groupedData);
  });
  return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_request_raya_api(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData = [];
  plv8.subtransaction(function() {
    const {
      sort = 'request_date_created',
      limit = 100,
      offset = 0,
      startDate = null,
      endDate = null,
      order = 'asc',
      teamId
    } = input_data;

    let mainQuery = `
      SELECT
        r.*,
        ru.user_id AS requester_user_id,
        ru.user_first_name AS requester_first_name,
        ru.user_last_name AS requester_last_name,
        f.form_name,
        p.team_project_name
      FROM
        request_schema.request_table r
      JOIN
        form_schema.form_table f
        ON f.form_id = r.request_form_id
      JOIN
        team_schema.team_project_table p
        ON p.team_project_id = r.request_project_id
      JOIN
        team_schema.team_member_table tmt
        ON tmt.team_member_id = r.request_team_member_id
      JOIN
        user_schema.user_table ru
        ON ru.user_id = tmt.team_member_user_id
      JOIN
        team_schema.team_table t
        ON t.team_id = tmt.team_member_team_id
      WHERE
        r.request_status = 'APPROVED' AND
        r.request_is_disabled = false
        AND t.team_id = '${teamId}'
      `;

    if (startDate) {
      mainQuery += ` AND r.request_date_created >= '${startDate}' `;
    }
    if (endDate) {
      mainQuery += ` AND r.request_date_created <= '${endDate}' `;
    }

    mainQuery += ` ORDER BY r.${sort} ${order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'} `;
    mainQuery += ` LIMIT ${Math.min(limit, 1000)} OFFSET ${offset} `;

    let mainQueryData = plv8.execute(mainQuery);

    let requestIds = mainQueryData.map(data => data.request_id);
    let groupedData = {};

    mainQueryData.forEach((data) => {
      const {request_team_member_id,request_form_id,request_module_request_id,requester_user_id,request_project_id,request_is_disabled, ...filteredData}=data;
      const requestId = data.request_id;
      groupedData[requestId] = {
        ...filteredData,
         requester: {
          user_first_name: data.requester_first_name,
          user_last_name: data.requester_last_name,
        },
        request_signers: [],
        request_comments: [],
        request_sections: [],
      };
    });

    if (requestIds.length > 0) {
      let signerQuery = `
        SELECT
          rs.request_signer_request_id,
          u.user_first_name,
          u.user_last_name
        FROM
          request_schema.request_signer_table rs
        JOIN
          form_schema.signer_table s
        ON s.signer_id = rs.request_signer_signer_id
        JOIN
          team_schema.team_member_table tmm
        ON tmm.team_member_id = s.signer_team_member_id
        JOIN
          user_schema.user_table u
        ON u.user_id = tmm.team_member_user_id
        WHERE
          rs.request_signer_request_id = ANY($1)
      `;

      let signerData = plv8.execute(signerQuery, [requestIds]);

      signerData.forEach((data) => {
        const requestId = data.request_signer_request_id;
        if (groupedData[requestId]) {
          groupedData[requestId].request_signers.push({
            user_first_name: data.user_first_name,
            user_last_name: data.user_last_name
          });
        }
      });
    }

    if (requestIds.length > 0) {
      let commentQuery = `
        SELECT
          c.comment_request_id,
          c.comment_content
        FROM
          request_schema.comment_table c
        WHERE
          c.comment_request_id = ANY($1)
          AND c.comment_is_disabled = false
      `;

      let commentData = plv8.execute(commentQuery, [requestIds]);

      commentData.forEach((data) => {
        const requestId = data.comment_request_id;
        if (groupedData[requestId]) {
          groupedData[requestId].request_comments.push({
            comment_content: data.comment_content
          });
        }
      });
    }

    if (requestIds.length > 0) {
      let sectionQuery = `
        SELECT
          s.section_name,
          ft.field_name,
          rr.request_response,
          rr.request_response_request_id
        FROM
          form_schema.section_table s
        JOIN
          form_schema.field_table ft
        ON ft.field_section_id = s.section_id
        JOIN
          request_schema.request_response_table rr
        ON rr.request_response_field_id = ft.field_id
        WHERE
          rr.request_response_request_id = ANY($1)
      `;

      let sectionData = plv8.execute(sectionQuery, [requestIds]);

      sectionData.forEach((data) => {
        const requestId = data.request_response_request_id;
        if (groupedData[requestId]) {
          let section = groupedData[requestId].request_sections.find(s => s.section_name === data.section_name);
          if (!section) {
            section = {
              section_name: data.section_name,
              fields: []
            };
            groupedData[requestId].request_sections.push(section);
          }
          section.fields.push({
            field_name: data.field_name,
            response: JSON.parse(data.request_response)
          });
        }
      });
    }
    returnData = Object.values(groupedData);
  });
  return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_hr_spreadsheet_view_on_load(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = {};
plv8.subtransaction(function(){
  const {
    teamId
  } = input_data;

  const positionData = plv8.execute(
    `
      SELECT position_alias
      FROM lookup_schema.position_table
      WHERE
        position_team_id = '${teamId}'
      ORDER BY position_alias
    `
  );

  const positionOptionList = positionData.map(position => {
    return { label: position.position_alias, value: position.position_alias };
  });

  const hrMemberData = plv8.execute(
    `
      SELECT
        user_first_name,
        user_last_name,
        tmt.team_member_id
      FROM team_schema.team_group_member_table AS tgmt
      INNER JOIN team_schema.team_member_table AS tmt ON tmt.team_member_id = tgmt.team_member_id
      INNER JOIN user_schema.user_table ON user_id = tmt.team_member_user_id
      WHERE
        team_group_id = 'a691a6ca-8209-4b7a-8f48-8a4582bbe75a'
      ORDER BY user_first_name, user_last_name
    `
  );

  const hrOptionList = hrMemberData.map(hr => {
    return { label: `${hr.user_first_name} ${hr.user_last_name}`, value: hr.team_member_id };
  });

  returnData = {
    positionOptionList,
    hrOptionList
  }
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION handle_missed_schedule()
RETURNS VOID
SET search_path TO ''
AS $$
plv8.subtransaction(function(){
  plv8.execute(
    `
      UPDATE hr_schema.hr_phone_interview_table
      SET
        hr_phone_interview_status = 'MISSED',
        hr_phone_interview_status_date_updated = NOW()
      WHERE
        hr_phone_interview_status = 'PENDING'
        AND hr_phone_interview_schedule <= NOW()
    `
  );
  plv8.execute(
    `
      UPDATE hr_schema.trade_test_table
      SET
        trade_test_status = 'MISSED',
        trade_test_status_date_updated = NOW()
      WHERE
        trade_test_status = 'PENDING'
        AND trade_test_schedule <= NOW()
    `
  );
  plv8.execute(
    `
      UPDATE hr_schema.technical_interview_table
      SET
        technical_interview_status = 'MISSED',
        technical_interview_status_date_updated = NOW()
      WHERE
        technical_interview_status = 'PENDING'
        AND technical_interview_schedule <= NOW()
    `
  );
});
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION check_spreadsheet_row_status(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = {};
plv8.subtransaction(function(){
  const {
    table,
    status,
    id
  } = input_data;

  const request = plv8.execute(
    `
      SELECT
        request_response AS position,
        applicationInformation.request_id AS hr_request_reference_id,
        applicationInformation.request_formsly_id AS application_information_request_id,
        applicationInformationScore.request_score_value AS application_information_score,
        generalAssessment.request_formsly_id AS general_assessment_request_id,
        generalAssessmentScore.request_score_value AS general_assessment_score,
        technicalAssessment.request_formsly_id AS technical_assessment_request_id,
        technicalAssessmentScore.request_score_value AS technical_assessment_score,
        ${table}_id,
        ${table}_date_created,
        ${table}_status,
        ${table === "background_check" ? "" : `${table}_schedule,`}
        ${table}_team_member_id AS assigned_hr_team_member_id,
        CONCAT(user_first_name, ' ', user_last_name) AS assigned_hr
      FROM hr_schema.request_connection_table
      INNER JOIN public.request_view AS applicationInformation ON applicationInformation.request_id = request_connection_application_information_request_id
      INNER JOIN request_schema.request_score_table AS applicationInformationScore ON applicationInformationScore.request_score_request_id = request_connection_application_information_request_id
      INNER JOIN request_schema.request_response_table ON request_response_request_id = applicationInformation.request_id
        AND request_response_field_id IN ('0fd115df-c2fe-4375-b5cf-6f899b47ec56')
      INNER JOIN public.request_view AS generalAssessment ON generalAssessment.request_id = request_connection_general_assessment_request_id
      INNER JOIN request_schema.request_score_table AS generalAssessmentScore ON generalAssessmentScore.request_score_request_id = generalAssessment.request_id
      INNER JOIN public.request_view AS technicalAssessment ON technicalAssessment.request_id = request_connection_technical_assessment_request_id
      INNER JOIN request_schema.request_score_table AS technicalAssessmentScore ON technicalAssessmentScore.request_score_request_id = technicalAssessment.request_id
      INNER JOIN hr_schema.${table}_table ON ${table}_request_id = applicationInformation.request_id
      LEFT JOIN team_schema.team_member_table ON team_member_id = ${table}_team_member_id
      LEFT JOIN user_schema.user_table ON user_id = team_member_user_id
      WHERE
        ${table}_id = '${id}'
      LIMIT 1
    `
  )[0];

  if (request[`${table}_status`] === status) {
    returnData = null;
    return;
  }

  const additionalData = plv8.execute(
    `
      SELECT
        request_response,
        request_response_field_id
      FROM request_schema.request_response_table
      WHERE
        request_response_request_id = '${request.hr_request_reference_id}'
        AND request_response_field_id IN ('e48e7297-c250-4595-ba61-2945bf559a25', '7ebb72a0-9a97-4701-bf7c-5c45cd51fbce', '9322b870-a0a1-4788-93f0-2895be713f9c', 'b2972102-99b0-4014-8560-caee2fdaf44e', '56438f2d-da70-4fa4-ade6-855f2f29823b')
    `
  );

  let firstName = middleName = lastName = contactNumber = email = "";
  additionalData.forEach(response => {
    const parsedResponse = response.request_response.replaceAll('"', "");
    switch(response.request_response_field_id) {
      case "e48e7297-c250-4595-ba61-2945bf559a25": firstName = parsedResponse; break;
      case "7ebb72a0-9a97-4701-bf7c-5c45cd51fbce": middleName = parsedResponse; break;
      case "9322b870-a0a1-4788-93f0-2895be713f9c": lastName = parsedResponse; break;
      case "b2972102-99b0-4014-8560-caee2fdaf44e": contactNumber = parsedResponse; break;
      case "56438f2d-da70-4fa4-ade6-855f2f29823b": email = parsedResponse; break;
    }
  });

  returnData =  {
    ...request,
    application_information_full_name: [firstName, ...(middleName ? [middleName]: []), lastName].join(" "),
    application_information_contact_number: contactNumber,
    application_information_email: email
  }
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION check_job_offer_row(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = {};
plv8.subtransaction(function(){
  const {
    id,
    status,
    requestId
  } = input_data;

  const jobOfferData = plv8.execute(
    `
      SELECT *
      FROM hr_schema.job_offer_table
      WHERE
        job_offer_request_id = '${requestId}'
      ORDER BY job_offer_date_created DESC
      LIMIT 1
    `
  )[0];

  if(jobOfferData.job_offer_id === id && jobOfferData.job_offer_status === status) {
    returnData = null;
    return;
  }

  const request = plv8.execute(
    `
      SELECT
        request_response AS position,
        applicationInformation.request_id AS hr_request_reference_id,
        applicationInformation.request_formsly_id AS application_information_request_id,
        applicationInformationScore.request_score_value AS application_information_score,
        generalAssessment.request_formsly_id AS general_assessment_request_id,
        generalAssessmentScore.request_score_value AS general_assessment_score,
        technicalAssessment.request_formsly_id AS technical_assessment_request_id,
        technicalAssessmentScore.request_score_value AS technical_assessment_score,
        job_offer_id,
        job_offer_date_created,
        job_offer_status,
        job_offer_attachment_id,
        job_offer_project_assignment,
        job_offer_team_member_id AS assigned_hr_team_member_id,
        CONCAT(user_first_name, ' ', user_last_name) AS assigned_hr
      FROM hr_schema.request_connection_table
      INNER JOIN public.request_view AS applicationInformation ON applicationInformation.request_id = request_connection_application_information_request_id
      INNER JOIN request_schema.request_score_table AS applicationInformationScore ON applicationInformationScore.request_score_request_id = request_connection_application_information_request_id
      INNER JOIN request_schema.request_response_table ON request_response_request_id = applicationInformation.request_id
        AND request_response_field_id IN ('0fd115df-c2fe-4375-b5cf-6f899b47ec56')
      INNER JOIN public.request_view AS generalAssessment ON generalAssessment.request_id = request_connection_general_assessment_request_id
      INNER JOIN request_schema.request_score_table AS generalAssessmentScore ON generalAssessmentScore.request_score_request_id = generalAssessment.request_id
      INNER JOIN public.request_view AS technicalAssessment ON technicalAssessment.request_id = request_connection_technical_assessment_request_id
      INNER JOIN request_schema.request_score_table AS technicalAssessmentScore ON technicalAssessmentScore.request_score_request_id = technicalAssessment.request_id
      INNER JOIN hr_schema.job_offer_table ON job_offer_request_id = request_connection_application_information_request_id
        AND job_offer_id = '${jobOfferData.job_offer_id}'
      LEFT JOIN team_schema.team_member_table ON team_member_id = job_offer_team_member_id
      LEFT JOIN user_schema.user_table ON user_id = team_member_user_id
      WHERE
        request_connection_application_information_request_id = '${requestId}'
      LIMIT 1
    `
  )[0];

  const additionalData = plv8.execute(
    `
      SELECT
        request_response,
        request_response_field_id
      FROM request_schema.request_response_table
      WHERE
        request_response_request_id = '${request.hr_request_reference_id}'
        AND request_response_field_id IN ('e48e7297-c250-4595-ba61-2945bf559a25', '7ebb72a0-9a97-4701-bf7c-5c45cd51fbce', '9322b870-a0a1-4788-93f0-2895be713f9c', 'b2972102-99b0-4014-8560-caee2fdaf44e', '56438f2d-da70-4fa4-ade6-855f2f29823b')
    `
  );

  let attachmentData = [];
  if (request.job_offer_attachment_id) {
    attachmentData = plv8.execute(
      `
        SELECT *
        FROM public.attachment_table
        WHERE
          attachment_id = '${request.job_offer_attachment_id}'
        LIMIT 1
      `
    );
  }

  let firstName = middleName = lastName = contactNumber = email = "";
  additionalData.forEach(response => {
    const parsedResponse = response.request_response.replaceAll('"', "");
    switch(response.request_response_field_id) {
      case "e48e7297-c250-4595-ba61-2945bf559a25": firstName = parsedResponse; break;
      case "7ebb72a0-9a97-4701-bf7c-5c45cd51fbce": middleName = parsedResponse; break;
      case "9322b870-a0a1-4788-93f0-2895be713f9c": lastName = parsedResponse; break;
      case "b2972102-99b0-4014-8560-caee2fdaf44e": contactNumber = parsedResponse; break;
      case "56438f2d-da70-4fa4-ade6-855f2f29823b": email = parsedResponse; break;
    }
  });

  returnData = {
    ...request,
    application_information_full_name: [firstName, ...(middleName ? [middleName]: []), lastName].join(" "),
    application_information_contact_number: contactNumber,
    application_information_email: email,
    job_offer_attachment: attachmentData.length ? attachmentData[0] : null
  }
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_hr_indicator_count(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = {};
plv8.subtransaction(function(){
  const {
    teamMemberId
  } = input_data;

  const applicationInformationCount = plv8.execute(
    `
      SELECT COUNT(*)
      FROM request_schema.request_table
      INNER JOIN request_schema.request_signer_table ON request_signer_request_id = request_id
      INNER JOIN form_schema.signer_table ON signer_id = request_signer_signer_id
        AND signer_team_member_id = '${teamMemberId}'
      WHERE
        request_form_id = '16ae1f62-c553-4b0e-909a-003d92828036'
        AND request_status = 'PENDING'

    `
  )[0].count;

  const hrPhoneInterviewCount = plv8.execute(
    `
      SELECT COUNT(*)
      FROM hr_schema.hr_phone_interview_table
      WHERE
        hr_phone_interview_status = 'PENDING'
        AND hr_phone_interview_team_member_id = '${teamMemberId}'
    `
  )[0].count;

  const technicalInterview1Count = plv8.execute(
    `
      SELECT COUNT(*)
      FROM hr_schema.technical_interview_table
      WHERE
        technical_interview_status = 'PENDING'
        AND technical_interview_team_member_id = '${teamMemberId}'
        AND technical_interview_number = 1
    `
  )[0].count;

  const technicalInterview2Count = plv8.execute(
    `
      SELECT COUNT(*)
      FROM hr_schema.technical_interview_table
      WHERE
        technical_interview_status = 'PENDING'
        AND technical_interview_team_member_id = '${teamMemberId}'
        AND technical_interview_number = 2
    `
  )[0].count;

  const tradeTestCount = plv8.execute(
    `
      SELECT COUNT(*)
      FROM hr_schema.trade_test_table
      WHERE
        trade_test_status = 'PENDING'
        AND trade_test_team_member_id = '${teamMemberId}'
    `
  )[0].count;

  const backgroundCheckCount = plv8.execute(
    `
      SELECT COUNT(*)
      FROM hr_schema.background_check_table
      WHERE
        background_check_status = 'PENDING'
        AND background_check_team_member_id = '${teamMemberId}'
    `
  )[0].count;

  const jobOfferCount = plv8.execute(
    `
      SELECT COUNT(*)
      FROM hr_schema.request_connection_table
      INNER JOIN (
        SELECT
          JobOffer.*,
          ROW_NUMBER() OVER (PARTITION BY job_offer_request_id ORDER BY JobOffer.job_offer_date_created DESC) AS RowNumber
        FROM hr_schema.job_offer_table JobOffer
      ) JobOffer ON JobOffer.job_offer_request_id = request_connection_application_information_request_id
      LEFT JOIN team_schema.team_member_table ON team_member_id = job_offer_team_member_id
      LEFT JOIN user_schema.user_table ON user_id = team_member_user_id
      WHERE
        job_offer_team_member_id = '${teamMemberId}'
        AND JobOffer.RowNumber = 1
        AND job_offer_status = 'WAITING FOR OFFER'
    `
  )[0].count;

  returnData = {
    applicationInformation: Number(applicationInformationCount),
    hrPhoneInterview: Number(hrPhoneInterviewCount),
    technicalInterview1: Number(technicalInterview1Count),
    technicalInterview2: Number(technicalInterview2Count),
    tradeTest: Number(tradeTestCount),
    backgroundCheck: Number(backgroundCheckCount),
    jobOffer: Number(jobOfferCount)
  }
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_field_of_study_options(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = [];
plv8.subtransaction(function(){
  const {
    value
  } = input_data;
  const data = plv8.execute(
    `
      SELECT DISTINCT(degree_field_of_study)
      FROM lookup_schema.degree_table
      WHERE
        degree_type = '${value}'
        AND degree_field_of_study IS NOT NULL
      ORDER BY degree_field_of_study
    `
  );
  returnData = data.map(value => value.degree_field_of_study);
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_degree_name_options(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = [];
plv8.subtransaction(function(){
  const {
    degreeType,
    fieldOfStudy
  } = input_data;
  const data = plv8.execute(
    `
      SELECT DISTINCT(degree_name)
      FROM lookup_schema.degree_table
      WHERE
        degree_type = '${degreeType}'
        AND degree_field_of_study = '${fieldOfStudy}'
      ORDER BY degree_name
    `
  );
  returnData = data.map(value => value.degree_name);
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_hr_project_options()
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = [];
plv8.subtransaction(function(){
  const data = plv8.execute(
    `
      SELECT *
      FROM hr_schema.hr_project_table
      INNER JOIN public.address_table ON address_id = hr_project_address_id
      ORDER BY hr_project_name
    `
  );
  returnData = data.map(project => {
    return {
      hr_project_id: project.hr_project_id,
      hr_project_date_created: project.hr_project_date_created,
      hr_project_name: project.hr_project_name,
      hr_project_address: {
        address_id: project.address_id,
        address_date_created: project.address_date_created,
        address_region: project.address_region,
        address_province: project.address_province,
        address_city: project.address_city,
        address_barangay: project.address_barangay,
        address_street: project.address_street,
        address_zip_code: project.address_zip_code,
        address_latitude: project.address_latitude,
        address_longitude: project.address_longitude,
      }
    }
  });
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_technical_options(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData = [];
  plv8.subtransaction(function() {
    const {
      teamId,
      questionnaireId
    } = input_data;

    const fieldData = plv8.execute(`
      SELECT
        f.*, qq.questionnaire_question_id
      FROM form_schema.field_table f
      JOIN form_schema.questionnaire_question_table qq
      ON qq.questionnaire_question_field_id = f.field_id
      JOIN form_schema.questionnaire_table q
      ON q.questionnaire_id = qq.questionnaire_question_questionnaire_id
      WHERE
        q.questionnaire_id = $1
        AND qq.questionnaire_question_is_disabled = FALSE
      ORDER BY f.field_order ASC;
    `, [questionnaireId]);

    const questionnaireData = plv8.execute(`
      SELECT questionnaire_name, questionnaire_date_created
      FROM form_schema.questionnaire_table
      WHERE questionnaire_id = $1;
    `, [questionnaireId]);

    returnData = fieldData.map((field) => {
      const optionsData = plv8.execute(`
        SELECT *
        FROM form_schema.question_option_table
        WHERE question_option_questionnaire_question_id = $1
        ORDER BY question_option_order ASC;
      `, [field.questionnaire_question_id]);

      const correctAnswer = plv8.execute(`
        SELECT *
        FROM form_schema.correct_response_table
        WHERE correct_response_field_id = $1;
      `, [field.field_id]);

      let correctResponseValue = null;
      if (correctAnswer.length > 0) {
        correctResponseValue = correctAnswer[0].correct_response_value;
      }

      return {
        field_name: field.field_name,
        field_response: field.field_name,
        field_id: field.field_id,
        field_is_required: field.field_is_required,
        field_type: field.field_type,
        field_position_type: field.field_position_id,
        field_options: optionsData.map((option, index) => ({
          field_id: option.question_option_id,
          field_name: `Question Choice ${index + 1}`,
          field_response: option.question_option_value,
          field_is_correct: option.question_option_value === correctResponseValue,
        }))
      };
    });

    returnData = {
      questionnaire_name: questionnaireData[0].questionnaire_name,
      questionnaire_date_created: questionnaireData[0].questionnaire_date_created,
      fields: returnData
    };
  });

  return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION create_technical_question(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let request_data;
plv8.subtransaction(function(){
    const {
      fieldResponseValues,
      correctResponseValues,
      questionResponseValues,
      questionOptionResponseValues,
    } = input_data;

    plv8.execute(`
      INSERT INTO form_schema.field_table
      (field_id, field_name, field_is_required, field_type, field_order, field_section_id)
      VALUES ${fieldResponseValues}
    `);

    plv8.execute(`
      INSERT INTO form_schema.correct_response_table
      (correct_response_id, correct_response_value, correct_response_field_id)
      VALUES ${correctResponseValues}
    `);

    plv8.execute(`
      INSERT INTO form_schema.questionnaire_question_table
      (questionnaire_question_id, questionnaire_question, questionnaire_question_field_id,questionnaire_question_questionnaire_id)
      VALUES ${questionResponseValues}
    `);

    plv8.execute(`
      INSERT INTO form_schema.question_option_table
      ( question_option_value,question_option_order,question_option_questionnaire_question_id)
      VALUES ${questionOptionResponseValues}
    `);

    request_data = { success: true, message: 'Data inserted successfully' };
});
return request_data;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION check_technical_question(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
    let returnData = false;
    const { data, questionnaireId } = input_data;

    const query = `
        SELECT COUNT(*)
        FROM form_schema.field_table f
        JOIN form_schema.questionnaire_question_table q
        ON q.questionnaire_question_field_id = f.field_id
        WHERE
          LOWER(f.field_name) = ANY($1)
          AND q.questionnaire_question_questionnaire_id = $2
        AND q.questionnaire_question_is_disabled = FALSE
    `;

    const result = plv8.execute(query, [data, questionnaireId]);

    if (result[0].count > 0) {
      returnData = true;
    }

    return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_questionnare_table_on_load(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = {
  data: [],
  count: 0
};
plv8.subtransaction(function() {
    const {
      teamId,
      search = '',
      creator = '',
      page = 1,
      isAscendingSort = 'ASC',
      limit
    } = input_data;

    const totalCountResult = plv8.execute(`
      SELECT COUNT(*)::INT AS total_count
      FROM form_schema.questionnaire_table q
      JOIN team_schema.team_member_table tm
      ON tm.team_member_id = q.questionnaire_created_by
      JOIN user_schema.user_table u
      ON u.user_id = tm.team_member_user_id
      LEFT JOIN team_schema.team_member_table tm2
      ON tm2.team_member_id = q.questionnaire_updated_by
      LEFT JOIN user_schema.user_table u2
      ON u2.user_id = tm2.team_member_user_id
      WHERE q.questionnaire_team_id = $1
      ${creator}
      ${search}
    `, [teamId]);

    if (totalCountResult.length > 0) {
      returnData.count = totalCountResult[0].total_count;
    }

    const offset = (page - 1) * limit;

    const questionnaireData = plv8.execute(`
      SELECT q.*,
        u.user_id AS created_user_id,
        u.user_first_name AS created_user_first_name,
        u.user_last_name AS created_user_last_name,
        u.user_avatar AS created_user_avatar,
        u2.user_id AS updated_user_id,
        u2.user_first_name AS updated_user_first_name,
        u2.user_last_name AS updated_user_last_name,
        u2.user_avatar AS updated_user_avatar
      FROM form_schema.questionnaire_table q
      JOIN team_schema.team_member_table tm
      ON tm.team_member_id = q.questionnaire_created_by
      JOIN user_schema.user_table u
      ON u.user_id = tm.team_member_user_id
      LEFT JOIN team_schema.team_member_table tm2
      ON tm2.team_member_id = q.questionnaire_updated_by
      LEFT JOIN user_schema.user_table u2
      ON u2.user_id = tm2.team_member_user_id
      WHERE
        q.questionnaire_team_id = $1
        ${creator}
        ${search}
      ORDER BY ${isAscendingSort}
      LIMIT $2 OFFSET $3
      `, [teamId, limit, offset]);

    returnData.data = questionnaireData.map(response => {
      const {
        created_user_id,
        created_user_first_name,
        created_user_last_name,
        created_user_avatar,
        updated_user_id,
        updated_user_first_name,
        updated_user_last_name,
        updated_user_avatar,
        ...rest
      } = response;

      return {
        ...rest,
        questionnaire_created_by: {
          user_id: created_user_id,
          user_first_name: created_user_first_name,
          user_last_name: created_user_last_name,
          user_avatar: created_user_avatar
        },
        questionnaire_updated_by: updated_user_id ? {
          user_id: updated_user_id,
          user_first_name: updated_user_first_name,
          user_last_name: updated_user_last_name,
          user_avatar: updated_user_avatar
        } : null
      };
    });
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_email_resend_timer(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = [];
plv8.subtransaction(function(){
  const { email } = input_data;

  const emailResendData = plv8.execute(
    `
      SELECT *
      FROM user_schema.email_resend_table
      WHERE
        email_resend_email = '${email}'
      ORDER BY email_resend_date_created DESC
      LIMIT 1
    `
  );
  if(!emailResendData.length) {
    returnData = 0;
    return;
  }

  const currentDate = new Date(plv8.execute(`SELECT public.get_current_date()`)[0].get_current_date);
  const diffInMilliseconds = currentDate - emailResendData[0].email_resend_date_created;

  const timer = 60 - Math.ceil(diffInMilliseconds / 1000);
  returnData = timer <= 0 ? 0 : timer;
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_question_field_order(
    input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = 0;
plv8.subtransaction(function() {
    const { questionnaireId } = input_data;
    const fieldOrderResult = plv8.execute(`
        SELECT f.field_order
        FROM form_schema.field_table f
        JOIN form_schema.questionnaire_question_table q
        ON q.questionnaire_question_field_id = f.field_id
        WHERE q.questionnaire_question_questionnaire_id = $1
        ORDER BY f.field_order DESC
        LIMIT 1
    `, [questionnaireId]);

    if (fieldOrderResult.length > 0) {
        returnData = fieldOrderResult[0].field_order;
    }
});

return returnData;
$$ LANGUAGE PLV8;

CREATE OR REPLACE FUNCTION check_assessment_create_request_page(
  input_data JSON
)
RETURNS BOOLEAN
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      applicationInformationFormslyId,
      generalAssessmentFormslyId
    } = input_data;

    if (applicationInformationFormslyId) {
      returnData = plv8.execute(
        `
          SELECT EXISTS (
            SELECT 1
            FROM public.request_view
            INNER JOIN hr_schema.request_connection_table ON request_connection_application_information_request_id = request_id
            WHERE
              request_formsly_id = '${applicationInformationFormslyId}'
              AND request_connection_general_assessment_request_id IS NOT NULL
          )
        `
      )[0].exists;
    } else if (generalAssessmentFormslyId) {
      returnData = plv8.execute(
        `
          SELECT EXISTS (
            SELECT 1
            FROM public.request_view
            INNER JOIN hr_schema.request_connection_table ON request_connection_general_assessment_request_id = request_id
            WHERE
              request_formsly_id = '${generalAssessmentFormslyId}'
              AND request_connection_technical_assessment_request_id IS NOT NULL
          )
        `
      )[0].exists;
    }
  });
  return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_team_group_member(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = [];
plv8.subtransaction(function() {
  const {
    groupId
  } = input_data;

  const teamGroupMemberData = plv8.execute(
    `
      SELECT
        team_group_member_id,
        tmt.team_member_id,
        tmt.team_member_date_created,
        user_id,
        user_first_name,
        user_last_name,
        user_avatar,
        user_email
      FROM team_schema.team_group_member_table AS tgmt
      INNER JOIN team_schema.team_member_table AS tmt ON tmt.team_member_id = tgmt.team_member_id
      INNER JOIN user_schema.user_table ON user_id = tmt.team_member_user_id
      WHERE
        tgmt.team_group_id = '${groupId}'
        AND team_member_is_disabled = false
      ORDER BY
        user_first_name ASC,
        user_last_name ASC
    `
  );

  teamGroupMemberData.forEach(teamGroupMember => {
    const teamProjectMemberData = plv8.execute(
      `
        SELECT
          team_project_name
        FROM team_schema.team_project_member_table AS tpmt
        INNER JOIN team_schema.team_project_table AS tpt ON tpt.team_project_id = tpmt.team_project_id
        WHERE
          team_project_is_disabled = false
          AND team_member_id = '${teamGroupMember.team_member_id}'
      `
    );

    returnData.push({
      team_member_id: teamGroupMember.team_member_id,
      team_member_date_created: teamGroupMember.team_member_date_created,
      team_member_user: {
        user_id: teamGroupMember.user_id,
        user_first_name: teamGroupMember.user_first_name,
        user_last_name: teamGroupMember.user_last_name,
        user_avatar: teamGroupMember.user_avatar,
        user_email: teamGroupMember.user_email,
      },
    });
  });
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION hr_response_analytics(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData = {
    dates: [],
    pending_counts: [],
    qualified_counts: [],
    not_qualified_counts: [],
    waiting_for_schedule_counts:[],
    not_responsive_counts: [],
    cancelled_counts: [],
    for_pooling_counts: [],
    accepted_counts:[],
    waiting_for_offer_counts:[],
    rejected_counts: [],
    missed_counts:[],
    approved_counts: []
  };

  const { filterChartValues } = input_data;
  const currentDate = new Date(plv8.execute(`SELECT public.get_current_date()`)[0].get_current_date);

  const frequency = filterChartValues.frequencyFilter || 'monthly';

  const normalizeDate = (date, isEndDate = false) => {
    if (isEndDate) {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
    }
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
  };

  const getDateRange = (frequency, startDateValue, endDateValue) => {
    let startDate;
    let endDate;
    let clonedCurrentDate = new Date(currentDate.getTime());

    switch (frequency) {
      case "daily":
        startDate = startDateValue
        ? new Date(normalizeDate(new Date(startDateValue)).setDate(normalizeDate(new Date(startDateValue)).getDate() + 1))
        : normalizeDate(clonedCurrentDate);
        endDate = endDateValue ? normalizeDate(new Date(endDateValue), true) : normalizeDate(clonedCurrentDate, true);
        break;
      case "monthly":
        startDate = startDateValue ? new Date(normalizeDate(new Date(startDateValue)).setDate(normalizeDate(new Date(startDateValue)).getDate() + 1)) : new Date(clonedCurrentDate.getFullYear(), clonedCurrentDate.getMonth(), 1);
        endDate = endDateValue ? normalizeDate(new Date(endDateValue), true) : new Date(clonedCurrentDate.getFullYear(), clonedCurrentDate.getMonth() + 1, 0, 23, 59, 59);
        break;
      case "yearly":
      startDate = startDateValue?new Date(normalizeDate(new Date(startDateValue)).setDate(normalizeDate(new Date(startDateValue)).getDate() + 1)) : new Date(clonedCurrentDate.getFullYear(), 0, 1);
        endDate = endDateValue ? normalizeDate(new Date(endDateValue), true) : new Date(clonedCurrentDate.getFullYear(), 11, 31, 23, 59, 59);
        break;
      default:
        throw new Error("Invalid frequency");
    }
    return { startDate, endDate };
  };

  const generateAllDates = (startDate, endDate, frequency) => {
    let dates = [];

    startDate = new Date(startDate);
    endDate = new Date(endDate);

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    if (frequency === 'daily') {
      while (startDate <= endDate) {
        dates.push(startDate.toISOString().slice(0, 10));
        startDate.setDate(startDate.getDate() + 1);
      }
    } else if (frequency === 'monthly') {
      while (startDate <= endDate) {
        dates.push(startDate.toISOString().slice(0, 7));
        startDate.setMonth(startDate.getMonth() + 1);
      }
    } else if (frequency === 'yearly') {
      while (startDate <= endDate) {
        dates.push(startDate.getFullYear().toString());
        startDate.setFullYear(startDate.getFullYear() + 1);
      }
    }

    return dates;
  };

  const { startDate, endDate } = getDateRange(
    frequency,
    filterChartValues.startDate,
    filterChartValues.endDate
  );
  const allDates = generateAllDates(startDate, endDate, frequency);

  plv8.subtransaction(function () {
    const dateFormat = frequency === 'daily' ? 'YYYY-MM-DD'
                       : frequency === 'weekly' ? 'IYYY-IW'
                       : frequency === 'monthly' ? 'YYYY-MM'
                       : 'YYYY';

    if (filterChartValues.stepFilter === "request") {
      const memberFilterCondition = filterChartValues.memberFilter && filterChartValues.memberFilter !== "All"
        ? `AND team_member_table.team_member_id = '${filterChartValues.memberFilter}'`
        : "";

      const requestData = plv8.execute(`
        SELECT
          TO_CHAR(DATE_TRUNC('${frequency === 'weekly' ? 'week' : 'day'}', request_table.request_date_created), '${dateFormat}') AS date_group,
          COUNT(CASE WHEN request_table.request_status = 'PENDING' THEN 1 END) AS pending_count,
          COUNT(CASE WHEN request_table.request_status = 'APPROVED' THEN 1 END) AS approved_count,
          COUNT(CASE WHEN request_table.request_status = 'REJECTED' THEN 1 END) AS rejected_count
        FROM request_schema.request_table
        JOIN request_schema.request_signer_table
          ON request_signer_table.request_signer_request_id = request_table.request_id
        JOIN form_schema.signer_table
          ON signer_table.signer_id = request_signer_table.request_signer_signer_id
        JOIN team_schema.team_member_table
          ON team_member_table.team_member_id = signer_table.signer_team_member_id
        WHERE request_table.request_form_id = '16ae1f62-c553-4b0e-909a-003d92828036'
          AND request_table.request_date_created BETWEEN '${startDate.toISOString()}' AND '${endDate.toISOString()}'
          ${memberFilterCondition}
        GROUP BY TO_CHAR(DATE_TRUNC('${frequency === 'weekly' ? 'week' : 'day'}', request_table.request_date_created), '${dateFormat}')
        ORDER BY date_group
      `);

      const dateDataMap = {};
      requestData.forEach(row => {
        const dateKey = row.date_group;
        dateDataMap[dateKey] = {
          pending_count: String(row.pending_count),
          approved_count: String(row.approved_count),
          rejected_count: String(row.rejected_count)
        };
      });

      allDates.forEach(date => {
        const data = dateDataMap[date] || {
          pending_count: "0",
          approved_count: "0",
          rejected_count: "0"
        };

        returnData.dates.push(date);
        returnData.pending_counts.push(data.pending_count);
        returnData.approved_counts.push(data.approved_count);
        returnData.rejected_counts.push(data.rejected_count);
      });

      delete returnData.qualified_counts;
      delete returnData.not_qualified_counts;
      delete returnData.not_responsive_counts;
      delete returnData.cancelled_counts;
      delete returnData.for_pooling_counts;
    } else {
      let table = filterChartValues.stepFilter;
      const technicalInterviewCondition = filterChartValues.stepFilter === "technical_interview_1"
        ? "technical_interview_number = 1 AND"
        : filterChartValues.stepFilter === "technical_interview_2"
        ? "technical_interview_number = 2 AND"
        : "";
      table = (table === "technical_interview_1" || table === "technical_interview_2")
        ? "technical_interview"
        : table;

      const memberFilterCondition = filterChartValues.memberFilter && filterChartValues.memberFilter !== "All"
        ? `WHERE ${table}_table.${table}_team_member_id = '${filterChartValues.memberFilter}' AND`
        : "";

      const jobOfferCondition = filterChartValues.memberFilter && filterChartValues.memberFilter !== "All"
        ? `WHERE ${table}_table.${table}_team_member_id = '${filterChartValues.memberFilter}'`
        : "";

   let interviewData;
    if (table === 'job_offer') {
        interviewData = plv8.execute(`
            WITH latest_status AS (
              SELECT DISTINCT ON (job_offer_table.job_offer_request_id)
                  job_offer_table.job_offer_request_id,
                  job_offer_table.job_offer_status,
                  job_offer_table.job_offer_date_created
              FROM hr_schema.job_offer_table
              ${jobOfferCondition}
              ORDER BY job_offer_table.job_offer_request_id, job_offer_table.job_offer_date_created DESC
            )
            SELECT
                TO_CHAR(DATE_TRUNC('${frequency === 'weekly' ? 'week' : 'day'}', latest_status.job_offer_date_created), '${dateFormat}') AS date_group,
                COUNT(CASE WHEN latest_status.job_offer_status = 'PENDING' THEN 1 END) AS pending_count,
                COUNT(CASE WHEN latest_status.job_offer_status = 'FOR POOLING' THEN 1 END) AS for_pooling_count,
                COUNT(CASE WHEN latest_status.job_offer_status = 'ACCEPTED' THEN 1 END) AS accepted_count,
                COUNT(CASE WHEN latest_status.job_offer_status = 'WAITING FOR OFFER' THEN 1 END) AS waiting_for_offer_count,
                COUNT(CASE WHEN latest_status.job_offer_status = 'REJECTED' THEN 1 END) AS rejected_count
            FROM latest_status
            WHERE latest_status.job_offer_date_created BETWEEN '${startDate.toISOString()}' AND '${endDate.toISOString()}'
            GROUP BY date_group
            ORDER BY date_group;
        `);
    } else {
        interviewData = plv8.execute(`
            SELECT
            TO_CHAR(DATE_TRUNC('${frequency === 'weekly' ? 'week' : 'day'}', ${table}_table.${table}_date_created), '${dateFormat}') AS date_group,
            COUNT(CASE WHEN ${table}_table.${table}_status = 'PENDING' THEN 1 END) AS pending_count,
            COUNT(CASE WHEN ${table}_table.${table}_status = 'QUALIFIED' THEN 1 END) AS qualified_count,
            COUNT(CASE WHEN ${table}_table.${table}_status = 'NOT QUALIFIED' THEN 1 END) AS not_qualified_count,
            COUNT(CASE WHEN ${table}_table.${table}_status = 'WAITING FOR SCHEDULE' THEN 1 END) AS waiting_for_schedule_count,
            COUNT(CASE WHEN ${table}_table.${table}_status = 'NOT RESPONSIVE' THEN 1 END) AS not_responsive_count,
            COUNT(CASE WHEN ${table}_table.${table}_status = 'CANCELLED' THEN 1 END) AS cancelled_count,
            COUNT(CASE WHEN ${table}_table.${table}_status = 'FOR POOLING' THEN 1 END) AS for_pooling_count,
            COUNT(CASE WHEN ${table}_table.${table}_status = 'ACCEPTED' THEN 1 END) AS accepted_count,
            COUNT(CASE WHEN ${table}_table.${table}_status = 'WAITING FOR OFFER' THEN 1 END) AS waiting_for_offer_count,
            COUNT(CASE WHEN ${table}_table.${table}_status = 'REJECTED' THEN 1 END) AS rejected_count,
            COUNT(CASE WHEN ${table}_table.${table}_status = 'MISSED' THEN 1 END) AS missed_count
            FROM hr_schema.${table}_table
            WHERE ${memberFilterCondition} ${technicalInterviewCondition}
            ${table}_table.${table}_date_created BETWEEN '${startDate.toISOString()}' AND '${endDate.toISOString()}'
            GROUP BY TO_CHAR(DATE_TRUNC('${frequency === 'weekly' ? 'week' : 'day'}', ${table}_table.${table}_date_created), '${dateFormat}')
            ORDER BY date_group DESC;
        `);
    }
      const dateDataMap = {};
      interviewData.forEach(row => {
        const dateKey = row.date_group;
        dateDataMap[dateKey] = {
          pending_count: String(row.pending_count ?? "0"),
          qualified_count: String(row.qualified_count ?? "0"),
          not_qualified_count: String(row.not_qualified_count ?? "0"),
          waiting_for_schedule_count: String(row.waiting_for_schedule_count ?? "0"),
          not_responsive_count: String(row.not_responsive_count ?? "0"),
          cancelled_count: String(row.cancelled_count ?? "0"),
          for_pooling_count: String(row.for_pooling_count ?? "0"),
          accepted_count: String(row.accepted_count ?? "0"),
          waiting_for_offer_count: String(row.waiting_for_offer_count ?? "0"),
          rejected_count: String(row.rejected_count ?? "0"),
          missed_count: String(row.missed_count ?? "0")
      };
    });

      allDates.forEach(date => {
        const data = dateDataMap[date] || {
          pending_count: "0",
          qualified_count: "0",
          not_qualified_count: "0",
          waiting_for_schedule_count:"0",
          waiting_for_offer_count:"0",
          accepted_count:"0",
          rejected_count: "0",
          not_responsive_count: "0",
          for_pooling_count: "0",
          cancelled_count: "0",
          missed_count: "0"
        };

        returnData.dates.push(date);
        returnData.pending_counts.push(data.pending_count);
        returnData.qualified_counts.push(data.qualified_count);
        returnData.not_qualified_counts.push(data.not_qualified_count);
        returnData.waiting_for_schedule_counts.push(data.waiting_for_schedule_count);
        returnData.not_responsive_counts.push(data.not_responsive_count);
        returnData.cancelled_counts.push(data.cancelled_count);
        returnData.for_pooling_counts.push(data.for_pooling_count);
        returnData.accepted_counts.push(data.accepted_count);
        returnData.waiting_for_offer_counts.push(data.waiting_for_offer_count);
        returnData.rejected_counts.push(data.rejected_count);
        returnData.missed_counts.push(data.missed_count);
      });

      delete returnData.approved_counts;
      if (table !== "job_offer") {
        delete returnData.for_pooling_counts;
      }
    }
  });

  return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_storage_upload_details(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData = {};
  plv8.subtransaction(function() {
    const {
      userId,
      sssId,
      applicationInformationFormslyId,
    } = input_data;

    const currentDate = new Date(plv8.execute(`SELECT public.get_current_date()`)[0].get_current_date).toISOString();
    let sssIDNumber = "";

    if (sssId) {
      sssIDNumber = sssId;
    } else if (applicationInformationFormslyId) {
      const sssData = plv8.execute(`
        SELECT request_response
        FROM public.request_view
        INNER JOIN request_schema.request_response_table ON request_response_request_id = request_id
          AND request_response_field_id = 'ab7bf673-c22d-4290-b858-7cba2c4d2474'
        WHERE request_formsly_id = '${applicationInformationFormslyId}'
      `);
      if(!sssData.length) throw new Error();
      sssIDNumber = JSON.parse(sssData[0].request_response).replace(/\D/g, "");
    } else if (userId) {
      const userData = plv8.execute(
        `
          SELECT user_sss_number
          FROM user_schema.user_table
          INNER JOIN user_schema.user_sss_table ON user_id = user_sss_user_id
          WHERE user_id = '${userId}'
        `
      );
      if(!userData.length) throw new Error("The user has not yet uploaded an SSS ID.");
      sssIDNumber = userData[0].user_sss_number;
    } else {
      throw new Error();
    }

    returnData = {
      sssIDNumber,
      currentDate
    }
  });
  return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION update_questionnaire_position(
    input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData = [];

  plv8.subtransaction(function() {
    const { questionnaireId, teamMemberId, position } = input_data;
    const currentDate = new Date(plv8.execute(`SELECT public.get_current_date()`)[0].get_current_date).toISOString();

    plv8.execute(`
        UPDATE lookup_schema.position_table
        SET position_questionnaire_id = null
        WHERE position_questionnaire_id = $1
    `, [questionnaireId]);

     position.forEach(pos => {
        const positionData = plv8.execute(`
            SELECT position_id
            FROM lookup_schema.position_table
            WHERE position_alias = $1
        `, [pos])[0];

        if (positionData && positionData.position_id) {
            plv8.execute(`
                UPDATE lookup_schema.position_table
                SET position_questionnaire_id = $1
                WHERE position_id = $2
            `, [questionnaireId, positionData.position_id]);
        }
    });

     plv8.execute(`
        UPDATE form_schema.questionnaire_table
        SET
            questionnaire_updated_by = $1,
            questionnaire_date_updated = $2
         WHERE questionnaire_id = $3
    `, [teamMemberId, currentDate, questionnaireId]);
    });

    return returnData
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION update_technical_question_option(
    input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
    let returnData = [];

    plv8.subtransaction(function() {
        const { questionnaireId, teamMemberId, correctAnswerEscaped, escapedQuestion, escapedChoices, fieldId } = input_data;

        const currentDate = new Date(plv8.execute(`SELECT public.get_current_date()`)[0].get_current_date).toISOString();

        plv8.execute(`
            UPDATE lookup_schema.position_table
            SET position_questionnaire_id = null
            WHERE position_questionnaire_id = $1
        `, [questionnaireId]);


        plv8.execute(`
            UPDATE form_schema.correct_response_table
            SET correct_response_value = $1
            WHERE correct_response_field_id = $2
        `, [correctAnswerEscaped, fieldId]);

        plv8.execute(`
            UPDATE form_schema.field_table
            SET field_name = $1
            WHERE field_id = $2
        `, [escapedQuestion, fieldId]);

        plv8.execute(`
            UPDATE form_schema.questionnaire_question_table
            SET questionnaire_question = $1
            WHERE questionnaire_question_field_id = $2
        `, [escapedQuestion, fieldId]);

        escapedChoices.map((choice) => {
            plv8.execute(`
                UPDATE form_schema.question_option_table
                SET question_option_value = $1
                WHERE question_option_id = $2
            `, [choice.choices, choice.fieldId]);
        });

        plv8.execute(`
            UPDATE form_schema.questionnaire_table
            SET
              questionnaire_updated_by = $1,
              questionnaire_date_updated = $2
            WHERE questionnaire_id = $3
        `, [teamMemberId, currentDate, questionnaireId]);

        returnData.push({ status: 'success' });
    });

    return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION override_request(
  input_data JSON
)
RETURNS VOID
SET search_path TO ''
AS $$
  plv8.subtransaction(function() {
    const {
      requestSignerId,
      teamMemberId
    } = input_data;

    const signerData = plv8.execute(
      `
        SELECT signer_id
        FROM form_schema.signer_table
        WHERE
          signer_is_primary_signer = true
          AND signer_form_id = '16ae1f62-c553-4b0e-909a-003d92828036'
          AND signer_team_member_id = '${teamMemberId}'
        LIMIT 1
      `
    );
    if(!signerData.length) throw new Error("No signer found");

    plv8.execute(
      `
        UPDATE request_schema.request_signer_table
        SET
          request_signer_signer_id = '${signerData[0].signer_id}'
        WHERE
          request_signer_id = '${requestSignerId}'
      `
    );
  });
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_team_member_project_list(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let team_member_data;
  plv8.subtransaction(function(){
    const {
      teamMemberId,
      offset,
      search,
      limit
    } = input_data;

    let searchValue = "";
    if(search) {
      searchValue = "AND team_project_name ILIKE '%${search}%'";
    }

    const memberProjectToSelect = plv8.execute(
      `
        SELECT
          tpmt2.team_project_member_id,
          tpt2.team_project_name
        FROM team_schema.team_project_member_table tpmt2
        INNER JOIN team_schema.team_project_table tpt2 ON tpt2.team_project_id = tpmt2.team_project_id
        WHERE
          tpmt2.team_member_id='${teamMemberId}'
          ${searchValue}
        ORDER BY tpt2.team_project_name ASC
        OFFSET ${offset}
        LIMIT ${limit}
      `
    );

    let projectList = []
    let projectCount = 0
    if(memberProjectToSelect.length > 0){
      const memberProjectToSelectArray = memberProjectToSelect.map(project=>`'${project.team_project_member_id}'`).join(",")

      projectList = plv8.execute(
        `
          SELECT
            tpmt.team_project_member_id,
            (
              SELECT row_to_json(tpt)
              FROM team_schema.team_project_table tpt
              WHERE
                tpt.team_project_id = tpmt.team_project_id
            ) AS team_project
            FROM team_schema.team_project_member_table tpmt
            WHERE
              tpmt.team_member_id='${teamMemberId}'
              AND tpmt.team_project_member_id IN (${memberProjectToSelectArray})
        `
      );

      projectCount = plv8.execute(`SELECT COUNT(*) FROM team_schema.team_project_member_table WHERE team_member_id='${teamMemberId}';`)[0].count
    }

    team_member_data = {projectList, projectCount: `${projectCount}`}
 });
 return team_member_data;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION update_evaluator(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      link,
      notificationLink,
      teamMemberId,
      interviewId,
      formslyId
    } = input_data;

    plv8.execute(
      `
        UPDATE hr_schema.technical_interview_table
        SET
          technical_interview_evaluation_link = '${link}',
          technical_interview_evaluator_team_member_id = '${teamMemberId}'
        WHERE
          technical_interview_id = '${interviewId}'
      `
    );

    const userId = plv8.execute(`SELECT team_member_user_id FROM team_schema.team_member_table WHERE team_member_id = '${teamMemberId}'`)[0].team_member_user_id;
    plv8.execute(
      `
        INSERT INTO public.notification_table
        (
          notification_app,
          notification_type,
          notification_content,
          notification_redirect_url,
          notification_user_id
        ) VALUES
        (
          'REQUEST',
          'REQUEST',
          'You are assigned to evaluate ${formslyId} applicant',
          '${notificationLink}',
          '${userId}'
        )
      `
    );

    returnData = plv8.execute(`SELECT user_first_name, user_last_name, user_email FROM user_schema.user_table WHERE user_id = '${userId}'`)[0];
 });
 return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION update_practical_test_evaluator(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      link,
      notificationLink,
      teamMemberId,
      practicalTestId,
      formslyId
    } = input_data;

    plv8.execute(
      `
        UPDATE hr_schema.trade_test_table
        SET
          trade_test_evaluation_link = '${link}',
          trade_test_evaluator_team_member_id = '${teamMemberId}'
        WHERE
          trade_test_id = '${practicalTestId}'
      `
    );

    const userId = plv8.execute(`SELECT team_member_user_id FROM team_schema.team_member_table WHERE team_member_id = '${teamMemberId}'`)[0].team_member_user_id;
    plv8.execute(
      `
        INSERT INTO public.notification_table
        (
          notification_app,
          notification_type,
          notification_content,
          notification_redirect_url,
          notification_user_id
        ) VALUES
        (
          'REQUEST',
          'REQUEST',
          'You are assigned to evaluate ${formslyId} applicant',
          '${notificationLink}',
          '${userId}'
        )
      `
    );

    returnData = plv8.execute(`SELECT user_first_name, user_last_name, user_email FROM user_schema.user_table WHERE user_id = '${userId}'`)[0];
 });
 return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_evaluation_result_data(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      interviewId
    } = input_data;

    const requestId = plv8.execute(
      `
        SELECT technical_interview_request_id
        FROM hr_schema.technical_interview_table
        WHERE
          technical_interview_id = '${interviewId}'
      `
    )[0].technical_interview_request_id;

    const firstName = plv8.execute(
      `
        SELECT request_response
        FROM request_schema.request_response_table
        WHERE
          request_response_request_id = '${requestId}'
          AND request_response_field_id = 'e48e7297-c250-4595-ba61-2945bf559a25'
        LIMIT 1
      `
    );
    const middleName = plv8.execute(
      `
        SELECT request_response
        FROM request_schema.request_response_table
        WHERE
          request_response_request_id = '${requestId}'
          AND request_response_field_id = '7ebb72a0-9a97-4701-bf7c-5c45cd51fbce'
        LIMIT 1
      `
    );
    const lastName = plv8.execute(
      `
        SELECT request_response
        FROM request_schema.request_response_table
        WHERE
          request_response_request_id = '${requestId}'
          AND request_response_field_id = '9322b870-a0a1-4788-93f0-2895be713f9c'
        LIMIT 1
      `
    );
    const position = plv8.execute(
      `
        SELECT request_response
        FROM request_schema.request_response_table
        WHERE
          request_response_request_id = '${requestId}'
          AND request_response_field_id = '0fd115df-c2fe-4375-b5cf-6f899b47ec56'
        LIMIT 1
      `
    );
    const email = plv8.execute(
      `
        SELECT request_response
        FROM request_schema.request_response_table
        WHERE
          request_response_request_id = '${requestId}'
          AND request_response_field_id = '56438f2d-da70-4fa4-ade6-855f2f29823b'
        LIMIT 1
      `
    );

    const interviewData = plv8.execute(
      `
        SELECT technical_interview_table.*, request_formsly_id
        FROM hr_schema.technical_interview_table
        INNER JOIN public.request_view ON request_id = technical_interview_request_id
        WHERE
          technical_interview_id = '${interviewId}'
        LIMIT 1
      `
    );

    returnData = {
      candidateFirstName: JSON.parse(firstName[0].request_response),
      candidateMiddleName: middleName.length ? JSON.parse(middleName[0].request_response) : "",
      candidateLastName: JSON.parse(lastName[0].request_response),
      position: JSON.parse(position[0].request_response),
      email: JSON.parse(email[0].request_response),
      interviewData: interviewData[0]
    }
 });
 return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION create_requester_primary_signer(
  input_data JSON
)
RETURNS VOID
SET search_path TO ''
AS $$
plv8.subtransaction(function() {
    const {
        formId,
        requesterTeamMemberId,
        signerTeamMemberId,
        signerAction
    } = input_data;

    let signerData = plv8.execute(`
        SELECT *
        FROM form_schema.signer_table
        WHERE
            signer_is_requester_signer = TRUE
            AND signer_form_id = $1
            AND signer_team_member_id = $2
        LIMIT 1
    `, [formId, signerTeamMemberId])[0];

    if (!signerData) {
        const signerIsPrimary = true;
        const signerIsRequesterSigner = true;
        const signerOrder = 1;

        signerData = plv8.execute(`
            INSERT INTO form_schema.signer_table
                (signer_is_primary_signer, signer_action, signer_is_requester_signer, signer_form_id, signer_team_member_id, signer_order)
            VALUES
                ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `, [signerIsPrimary, signerAction, signerIsRequesterSigner, formId, signerTeamMemberId, signerOrder])[0];
    }

    requesterTeamMemberId.forEach((requester) => {
        const duplicateCount = plv8.execute(`
            SELECT COUNT(*)
            FROM form_schema.requester_primary_signer_table
            WHERE
                requester_team_member_id = $1
                AND requester_primary_signer_signer_id = $2
        `, [requester, signerData.signer_id])[0].count;

        if (Number(duplicateCount) === 0) {
            plv8.execute(`
                INSERT INTO form_schema.requester_primary_signer_table
                    (requester_team_member_id, requester_primary_signer_signer_id)
                VALUES
                    ($1, $2)
            `, [requester, signerData.signer_id]);
        }
    });
});
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_requester_signer_list(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
let returnData = [];
plv8.subtransaction(function() {
  const {
    page,
    limit,
    search,
    formId
  } = input_data;

    const start = (page - 1) * limit;

    const requesterSignerCount = plv8.execute(`
      SELECT COUNT(*)
      FROM form_schema.requester_primary_signer_table
      INNER JOIN form_schema.signer_table ON signer_id = requester_primary_signer_signer_id
      WHERE
        signer_form_id = $1
    `, [formId])[0].count;

    let query = `
      SELECT
          requester_primary_signer_id,
          requester_team_member_id,
          requester_primary_signer_signer_id,
          signer_team_member_id AS requester_primary_signer_signer_team_member_id
      FROM form_schema.requester_primary_signer_table
      INNER JOIN form_schema.signer_table ON signer_id = requester_primary_signer_signer_id
      INNER JOIN team_schema.team_member_table signer_team_member ON signer_team_member.team_member_id = signer_team_member_id
      INNER JOIN user_schema.user_table signer_user ON signer_user.user_id = signer_team_member.team_member_user_id
      INNER JOIN team_schema.team_member_table requester_team_member ON requester_team_member.team_member_id = requester_team_member_id
      INNER JOIN user_schema.user_table requester_user ON requester_user.user_id = requester_team_member.team_member_user_id
      WHERE
          signer_form_id = $1
          AND signer_is_disabled = false
          AND signer_is_requester_signer = true
    `;
    let params = [formId, limit, start];
    if (search) {
        query += ` AND (CONCAT(signer_user.user_first_name, ' ', signer_user.user_last_name) ILIKE $4 OR CONCAT(requester_user.user_first_name, ' ', requester_user.user_last_name) ILIKE $4)`;
        params.push(`%${search}%`)
    }

    query += ` LIMIT $2 OFFSET $3`;

    const requesterSignerList = plv8.execute(query, params);

    returnData = {data: requesterSignerList, count: Number(requesterSignerCount)};
});
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_background_check_data(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      backgroundCheckId
    } = input_data;

    const requestId = plv8.execute(
      `
        SELECT background_check_request_id
        FROM hr_schema.background_check_table
        WHERE
          background_check_id = '${backgroundCheckId}'
      `
    )[0].background_check_request_id;

    const firstName = plv8.execute(
      `
        SELECT request_response
        FROM request_schema.request_response_table
        WHERE
          request_response_request_id = '${requestId}'
          AND request_response_field_id = 'e48e7297-c250-4595-ba61-2945bf559a25'
        LIMIT 1
      `
    );
    const middleName = plv8.execute(
      `
        SELECT request_response
        FROM request_schema.request_response_table
        WHERE
          request_response_request_id = '${requestId}'
          AND request_response_field_id = '7ebb72a0-9a97-4701-bf7c-5c45cd51fbce'
        LIMIT 1
      `
    );
    const lastName = plv8.execute(
      `
        SELECT request_response
        FROM request_schema.request_response_table
        WHERE
          request_response_request_id = '${requestId}'
          AND request_response_field_id = '9322b870-a0a1-4788-93f0-2895be713f9c'
        LIMIT 1
      `
    );
    const position = plv8.execute(
      `
        SELECT request_response
        FROM request_schema.request_response_table
        WHERE
          request_response_request_id = '${requestId}'
          AND request_response_field_id = '0fd115df-c2fe-4375-b5cf-6f899b47ec56'
        LIMIT 1
      `
    );
    const email = plv8.execute(
      `
        SELECT request_response
        FROM request_schema.request_response_table
        WHERE
          request_response_request_id = '${requestId}'
          AND request_response_field_id = '56438f2d-da70-4fa4-ade6-855f2f29823b'
        LIMIT 1
      `
    );

    const backgroundCheckData = plv8.execute(
      `
        SELECT background_check_table.*, request_formsly_id
        FROM hr_schema.background_check_table
        INNER JOIN public.request_view ON request_id = background_check_request_id
        WHERE
          background_check_id = '${backgroundCheckId}'
        LIMIT 1
      `
    );

    returnData = {
      candidateFirstName: JSON.parse(firstName[0].request_response),
      candidateMiddleName: middleName.length ? JSON.parse(middleName[0].request_response) : "",
      candidateLastName: JSON.parse(lastName[0].request_response),
      position: JSON.parse(position[0].request_response),
      email: JSON.parse(email[0].request_response),
      backgroundCheckData: backgroundCheckData[0]
    }
 });
 return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_practical_test_form_on_load(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData = {
    data: [],
    count: 0
  };
  plv8.subtransaction(function() {
    const {
      teamId,
      search = '',
      creator = '',
      page = 1,
      isAscendingSort = 'ASC',
      limit
    } = input_data;

    const totalCountResult = plv8.execute(`
      SELECT COUNT(*)::INT AS total_count
      FROM hr_schema.practical_test_table
      JOIN team_schema.team_member_table tm
        ON tm.team_member_id = practical_test_created_by
      JOIN user_schema.user_table u
        ON u.user_id = tm.team_member_user_id
      LEFT JOIN team_schema.team_member_table tm2
        ON tm2.team_member_id = practical_test_updated_by
      LEFT JOIN user_schema.user_table u2
        ON u2.user_id = tm2.team_member_user_id
      WHERE
        practical_test_team_id = $1
        ${creator}
        ${search}
    `, [teamId]);

    if (totalCountResult.length > 0) {
      returnData.count = totalCountResult[0].total_count;
    }

    const offset = (page - 1) * limit;

    const practicalTestData = plv8.execute(`
      SELECT
        practical_test_table.*,
        u.user_id AS created_user_id,
        u.user_first_name AS created_user_first_name,
        u.user_last_name AS created_user_last_name,
        u.user_avatar AS created_user_avatar,
        u2.user_id AS updated_user_id,
        u2.user_first_name AS updated_user_first_name,
        u2.user_last_name AS updated_user_last_name,
        u2.user_avatar AS updated_user_avatar
      FROM hr_schema.practical_test_table
      JOIN team_schema.team_member_table tm
      ON tm.team_member_id = practical_test_created_by
      JOIN user_schema.user_table u
      ON u.user_id = tm.team_member_user_id
      LEFT JOIN team_schema.team_member_table tm2
      ON tm2.team_member_id = practical_test_updated_by
      LEFT JOIN user_schema.user_table u2
      ON u2.user_id = tm2.team_member_user_id
      WHERE
        practical_test_team_id = $1
        ${creator}
        ${search}
      ORDER BY ${isAscendingSort}
      LIMIT $2 OFFSET $3
      `, [teamId, limit, offset]);

    returnData.data = practicalTestData.map(response => {
      const {
        created_user_id,
        created_user_first_name,
        created_user_last_name,
        created_user_avatar,
        updated_user_id,
        updated_user_first_name,
        updated_user_last_name,
        updated_user_avatar,
        ...rest
      } = response;

      return {
        ...rest,
        practical_test_created_by_user: {
          user_id: created_user_id,
          user_first_name: created_user_first_name,
          user_last_name: created_user_last_name,
          user_avatar: created_user_avatar
        },
        practical_test_updated_by_user: updated_user_id ? {
          user_id: updated_user_id,
          user_first_name: updated_user_first_name,
          user_last_name: updated_user_last_name,
          user_avatar: updated_user_avatar
        } : null
      };
    });
  });
return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION create_practical_test_form(
  input_data JSON
)
RETURNS VOID
SET search_path TO ''
AS $$
  plv8.subtransaction(function() {
    const {
      practicalTestQuery,
      practicalTestPositionInput,
      fieldInput,
      practicalTestQuestionInput,
      practicalTestId,
      positionList
    } = input_data;

    if (practicalTestId) {
      plv8.execute(
        `
          UPDATE hr_schema.practical_test_question_table
          SET practical_test_question_is_disabled = true
          WHERE practical_test_question_practical_test_id = '${practicalTestId}'
        `
      );
      plv8.execute(
        `
          DELETE FROM hr_schema.practical_test_position_table
          WHERE practical_test_position_practical_test_id = '${practicalTestId}'
        `
      )
    }

    if (positionList.length) {
      plv8.execute(
        `
          DELETE FROM hr_schema.practical_test_position_table
          WHERE practical_test_position_position_id IN (${positionList})
        `
      )
    }
    plv8.execute(practicalTestQuery);

    if (practicalTestPositionInput.length) {
      plv8.execute(
        `
          INSERT INTO hr_schema.practical_test_position_table
          (
            practical_test_position_practical_test_id,
            practical_test_position_position_id
          )
          VALUES ${practicalTestPositionInput}
        `
      );
    }

    plv8.execute(
      `
        INSERT INTO form_schema.field_table
        (
          field_id,
          field_name,
          field_is_required,
          field_type,
          field_order,
          field_section_id
        )
        VALUES ${fieldInput}
      `
    );

    plv8.execute(
      `
        INSERT INTO hr_schema.practical_test_question_table
        (
          practical_test_question,
          practical_test_question_weight,
          practical_test_question_order,
          practical_test_question_field_id,
          practical_test_question_practical_test_id
        )
        VALUES ${practicalTestQuestionInput}
      `
    );
  });
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_practical_test_form(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function() {
    const {
      practicalTestId
    } = input_data;

    const practicalTestData = plv8.execute(
      `
        SELECT
          practical_test_id,
          practical_test_label,
          practical_test_passing_score
        FROM hr_schema.practical_test_table
        WHERE
          practical_test_id = '${practicalTestId}'
      `
    )[0];

    const practical_test_position_list = plv8.execute(
      `
        SELECT
          position_id
        FROM hr_schema.practical_test_position_table
        INNER JOIN lookup_schema.position_table ON position_id = practical_test_position_position_id
        WHERE
          practical_test_position_practical_test_id = '${practicalTestId}'
      `
    ).map(position => position.position_id);

    const practical_test_question_list = plv8.execute(
      `
        SELECT
          practical_test_question,
          practical_test_question_weight
        FROM hr_schema.practical_test_question_table
        WHERE
          practical_test_question_practical_test_id = '${practicalTestId}'
          AND practical_test_question_is_disabled = false
      `
    ).map(question => {
      return {
        practical_test_question: question.practical_test_question,
        practical_test_question_weight: question.practical_test_question_weight
      }
    });

    returnData = {
      ...practicalTestData,
      practical_test_position_list,
      practical_test_question_list
    }
  });
  return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_practical_test_data(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      practicalTestId
    } = input_data;

    const requestId = plv8.execute(
      `
        SELECT trade_test_request_id
        FROM hr_schema.trade_test_table
        WHERE
          trade_test_id = '${practicalTestId}'
      `
    )[0].trade_test_request_id;

    const firstName = plv8.execute(
      `
        SELECT request_response
        FROM request_schema.request_response_table
        WHERE
          request_response_request_id = '${requestId}'
          AND request_response_field_id = 'e48e7297-c250-4595-ba61-2945bf559a25'
        LIMIT 1
      `
    );
    const middleName = plv8.execute(
      `
        SELECT request_response
        FROM request_schema.request_response_table
        WHERE
          request_response_request_id = '${requestId}'
          AND request_response_field_id = '7ebb72a0-9a97-4701-bf7c-5c45cd51fbce'
        LIMIT 1
      `
    );
    const lastName = plv8.execute(
      `
        SELECT request_response
        FROM request_schema.request_response_table
        WHERE
          request_response_request_id = '${requestId}'
          AND request_response_field_id = '9322b870-a0a1-4788-93f0-2895be713f9c'
        LIMIT 1
      `
    );
    const position = plv8.execute(
      `
        SELECT request_response
        FROM request_schema.request_response_table
        WHERE
          request_response_request_id = '${requestId}'
          AND request_response_field_id = '0fd115df-c2fe-4375-b5cf-6f899b47ec56'
        LIMIT 1
      `
    );
    const email = plv8.execute(
      `
        SELECT request_response
        FROM request_schema.request_response_table
        WHERE
          request_response_request_id = '${requestId}'
          AND request_response_field_id = '56438f2d-da70-4fa4-ade6-855f2f29823b'
        LIMIT 1
      `
    );

    const tradeTestData = plv8.execute(
      `
        SELECT trade_test_table.*, request_formsly_id
        FROM hr_schema.trade_test_table
        INNER JOIN public.request_view ON request_id = trade_test_request_id
        WHERE
          trade_test_id = '${practicalTestId}'
        LIMIT 1
      `
    );

    returnData = {
      candidateFirstName: JSON.parse(firstName[0].request_response),
      candidateMiddleName: middleName.length ? JSON.parse(middleName[0].request_response) : "",
      candidateLastName: JSON.parse(lastName[0].request_response),
      position: JSON.parse(position[0].request_response),
      email: JSON.parse(email[0].request_response),
      tradeTestData: tradeTestData[0]
    }
 });
 return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_practical_test_field_list(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      position
    } = input_data;

    const practicalTestData = plv8.execute(
      `
        SELECT practical_test_table.*
        FROM lookup_schema.position_table
        INNER JOIN hr_schema.practical_test_position_table ON practical_test_position_position_id = position_id
        INNER JOIN hr_schema.practical_test_table ON practical_test_id = practical_test_position_practical_test_id
        WHERE
          position_alias = '${position}'
        ORDER BY position_date_created DESC
        LIMIT 1
      `
    );
    if (!practicalTestData.length) {
      returnData = null;
      return;
    }

    const practicalTestQuestionList = plv8.execute(
      `
        SELECT
          field_table.*,
          practical_test_question_weight AS field_weight
        FROM hr_schema.practical_test_question_table
        INNER JOIN form_schema.field_table ON field_id = practical_test_question_field_id
        WHERE
          practical_test_question_practical_test_id = '${practicalTestData[0].practical_test_id}'
          AND practical_test_question_is_disabled = false
      `
    );

    returnData = {
      ...practicalTestData[0],
      practicalTestQuestionList: practicalTestQuestionList
    }
 });
 return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION create_ticket_comment(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      commentInput,
      notificationInput
    } = input_data;

    const commentData = plv8.execute(
      `
        INSERT INTO ticket_schema.ticket_comment_table
        (
          ticket_comment_id,
          ticket_comment_content,
          ticket_comment_type,
          ticket_comment_team_member_id,
          ticket_comment_ticket_id
        )
        VALUES
        (
          '${commentInput.ticket_comment_id}',
          '${commentInput.ticket_comment_content}',
          '${commentInput.ticket_comment_type}',
          '${commentInput.ticket_comment_team_member_id}',
          '${commentInput.ticket_comment_ticket_id}'
        )
        RETURNING *
      `
    );

    const notificationQuery = notificationInput.map(notification => {
      return `
        (
          '${notification.notification_app}',
          '${notification.notification_type}',
          '${notification.notification_content}',
          '${notification.notification_redirect_url}',
          '${notification.notification_user_id}',
          '${notification.notification_team_id}'
        )
      `
    }).join(", ");

    if (notificationQuery.length) {
      plv8.execute(
        `
          INSERT INTO public.notification_table
          (
            notification_app,
            notification_type,
            notification_content,
            notification_redirect_url,
            notification_user_id,
            notification_team_id
          )
          VALUES ${notificationQuery}
        `
      );
    }

    returnData = commentData[0];
 });
 return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_team_team_membership_request(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      page,
      limit,
      teamId,
      search
    } = input_data;

    const start = (page - 1) * limit;
    let params = [teamId, limit, start]
    let query = `
      SELECT
        team_membership_request_id,
        team_membership_request_from_user_id as user_id,
        user_first_name,
        user_last_name,
        user_email
      FROM
        team_schema.team_membership_request_table
      INNER JOIN user_schema.user_table ON user_id = team_membership_request_from_user_id
      WHERE
        team_membership_request_to_team_id = $1
    `;

    if (search) {
      query += ` AND CONCAT(user_first_name, ' ', user_last_name) ILIKE $4 OR user_email ILIKE $4`
      params.push(`%${search}%`);
    };

    query += ` LIMIT $2 OFFSET $3`;
    const teamMembershipRequestList = plv8.execute(query, params);

    const teamMembershipRequestCount = plv8.execute(`
      SELECT COUNT(*)
      FROM
        team_schema.team_membership_request_table
      INNER JOIN user_schema.user_table ON user_id = team_membership_request_from_user_id
      WHERE
        team_membership_request_to_team_id = $1
        ${search ? `AND (CONCAT(user_first_name, ' ', user_last_name) ILIKE '%${search}%' OR user_email ILIKE '%${search}%')` : ''}
    `, [teamId])[0].count;


    returnData = {
      data: teamMembershipRequestList,
      count: Number(teamMembershipRequestCount)
    }

 });
 return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION accept_team_member_request(
  input_data JSON
)
RETURNS VOID
SET search_path TO ''
AS $$
  plv8.subtransaction(function(){
    const {
      userIdList,
      teamId,
      memberRole
    } = input_data;

    userIdList.forEach((userId) => {
      plv8.execute(`
        DELETE FROM team_schema.team_membership_request_table
        WHERE
          team_membership_request_from_user_id = $1
          AND team_membership_request_to_team_id = $2
      `, [userId, teamId]);

      const isUserAlreadyAMember = plv8.execute(`SELECT EXISTS (
        SELECT 1
        FROM team_schema.team_member_table
        WHERE
          team_member_user_id = $1
          AND team_member_team_id = $2
      )`, [userId, teamId])[0].exists;

      if (isUserAlreadyAMember) return;

      plv8.execute(`
        INSERT INTO team_schema.team_member_table
        (team_member_user_id, team_member_team_id, team_member_role)
        VALUES ($1, $2, $3)
      `, [userId, teamId, memberRole]);
    });
 });
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION join_team_group_by_ticket_request(
  input_data JSON
)
RETURNS VOID
SET search_path TO ''
AS $$
  plv8.subtransaction(function(){
    const {
      groupList,
      teamMemberId,
      teamId
    } = input_data;

    const teamGroupIdList = plv8.execute(
      `
        SELECT
          team_group_id
        FROM team_schema.team_group_table
        WHERE
          team_group_name IN (${groupList})
          AND team_group_team_id = '${teamId}'
      `
    );

    const insertData = teamGroupIdList.map(groupId => {
      return `('${teamMemberId}', '${groupId.team_group_id}')`
    }).join(", ");

    plv8.execute(
      `
        INSERT INTO team_schema.team_group_member_table
        (
          team_member_id,
          team_group_id
        )
        VALUES ${insertData}
        ON CONFLICT (team_member_id, team_group_id) DO NOTHING
      `
    );
 });
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION join_team_project_by_ticket_request(
  input_data JSON
)
RETURNS VOID
SET search_path TO ''
AS $$
  plv8.subtransaction(function(){
    const {
      projectList,
      teamMemberId,
      teamId
    } = input_data;

    const teamProjectIdList = plv8.execute(
      `
        SELECT
          team_project_id
        FROM team_schema.team_project_table
        WHERE
          team_project_name IN (${projectList})
          AND team_project_team_id = '${teamId}'
      `
    );

    const insertData = teamProjectIdList.map(projectId => {
      return `('${teamMemberId}', '${projectId.team_project_id}')`
    }).join(", ");

    plv8.execute(
      `
        INSERT INTO team_schema.team_project_member_table
        (
          team_member_id,
          team_project_id
        )
        VALUES ${insertData}
        ON CONFLICT (team_member_id, team_project_id) DO NOTHING
      `
    );
 });
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_hr_recruitment_data(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let data;
  plv8.subtransaction(function(){
    const {
      startDate,
      endDate,
      limit = 100,
      offset = 0
    } = input_data;

    let query = `
        SELECT
            request_formsly_id AS "Applicant Ref ID",
            REPLACE(CONCAT(first.request_response, ' ', middle.request_response, ' ', last.request_response), '"', '') AS "Name of Applicant",
            REPLACE(position.request_response, '"', '') AS "Position",
            salary.request_response AS "Asking Salary",
            request_status AS "Application Information Status",
            request_status_date_updated AS "Application Information Date",
            CONCAT(aiu.user_first_name, ' ', aiu.user_last_name) AS "Application Information Assigned HR",
            hr_phone_interview_status AS "HR Phone Interview Status",
            hr_phone_interview_status_date_updated AS "HR Phone Interview Date",
            CONCAT(hru.user_first_name, ' ', hru.user_last_name) AS "HR Interview Assigned HR",
            di.technical_interview_status AS "Department Interview Status",
            di.technical_interview_status_date_updated AS "Department Interview Date",
            CONCAT(diu.user_first_name, ' ', diu.user_last_name) AS "Department Interview Assigned HR",
            ri.technical_interview_status AS "Department Interview Status",
            ri.technical_interview_status_date_updated AS "Department Interview Date",
            CONCAT(riu.user_first_name, ' ', riu.user_last_name) AS "Requestor Interview Assigned HR",
            background_check_status AS "Background Check Status",
            background_check_status_date_updated AS "Background Check Date",
            CONCAT(bcu.user_first_name, ' ', bcu.user_last_name) AS "Background Check Assigned HR",
            job_offer_status AS "Job Offer Status",
            job_offer_compensation AS "Compensation",
            job_offer_date_created "Job Offer Date",
            CONCAT(jou.user_first_name, ' ', jou.user_last_name) AS "Job Offer Assigned HR",
            request_date_created AS "Date Created"
        FROM public.request_view
        INNER JOIN request_schema.request_response_table AS first ON first.request_response_request_id = request_id
            AND first.request_response_field_id = 'e48e7297-c250-4595-ba61-2945bf559a25'
        LEFT JOIN request_schema.request_response_table AS middle ON middle.request_response_request_id = request_id
            AND middle.request_response_field_id = '7ebb72a0-9a97-4701-bf7c-5c45cd51fbce'
        INNER JOIN request_schema.request_response_table AS last ON last.request_response_request_id = request_id
        AND last.request_response_field_id = '9322b870-a0a1-4788-93f0-2895be713f9c'
        INNER JOIN request_schema.request_response_table AS position ON position.request_response_request_id = request_id
            AND position.request_response_field_id = '0fd115df-c2fe-4375-b5cf-6f899b47ec56'
        INNER JOIN request_schema.request_response_table AS salary ON salary.request_response_request_id = request_id
            AND salary.request_response_field_id = 'bcfba5e2-b9cc-4c4b-a308-174993c4564d'
        INNER JOIN request_schema.request_signer_table ON request_signer_request_id = request_id
        INNER JOIN form_schema.signer_table ON signer_id = request_signer_signer_id
        INNER JOIN team_schema.team_member_table ON team_member_id = signer_team_member_id
        INNER JOIN user_schema.user_table AS aiu ON aiu.user_id = team_member_user_id
        LEFT JOIN hr_schema.hr_phone_interview_table ON hr_phone_interview_request_id = request_id
        LEFT JOIN team_schema.team_member_table AS hrtm ON hrtm.team_member_id = hr_phone_interview_team_member_id
        LEFT JOIN user_schema.user_table AS hru ON hru.user_id = hrtm.team_member_user_id
        LEFT JOIN hr_schema.technical_interview_table AS di ON di.technical_interview_request_id = request_id
            AND di.technical_interview_number = 1
        LEFT JOIN team_schema.team_member_table AS ditm ON ditm.team_member_id = di.technical_interview_team_member_id
        LEFT JOIN user_schema.user_table AS diu ON diu.user_id = ditm.team_member_user_id
        LEFT JOIN hr_schema.technical_interview_table AS ri ON ri.technical_interview_request_id = request_id
            AND ri.technical_interview_number = 2
        LEFT JOIN team_schema.team_member_table AS ritm ON ritm.team_member_id = ri.technical_interview_team_member_id
        LEFT JOIN user_schema.user_table AS riu ON riu.user_id = ritm.team_member_user_id
        LEFT JOIN hr_schema.background_check_table ON background_check_request_id = request_id
        LEFT JOIN team_schema.team_member_table AS bctm ON bctm.team_member_id = background_check_team_member_id
        LEFT JOIN user_schema.user_table AS bcu ON bcu.user_id = bctm.team_member_user_id
        LEFT JOIN (
        SELECT *,
            ROW_NUMBER() OVER (PARTITION BY job_offer_request_id ORDER BY job_offer_date_created DESC) AS rn
        FROM hr_schema.job_offer_table
        ) jo ON job_offer_request_id = request_id
        AND jo.rn = 1
        LEFT JOIN team_schema.team_member_table AS jotm ON jotm.team_member_id = job_offer_team_member_id
        LEFT JOIN user_schema.user_table AS jou ON jou.user_id = jotm.team_member_user_id
        WHERE
            request_form_id = '16ae1f62-c553-4b0e-909a-003d92828036'
    `;

    const params = [];
    if (startDate) {
        params.push(...[startDate, endDate]);
        query += ' AND (request_date_created >= $1 AND request_date_created <= $2)'
    };

    query += ` ORDER BY request_date_created DESC LIMIT ${limit} OFFSET ${offset}`;

    const recruitment_data = plv8.execute(query, params);

    data = recruitment_data;
 });
 return data;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_team_membership_request_page_on_load(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let data;
  plv8.subtransaction(function(){
    const {
      userId
    } = input_data;

    const availableTeams = plv8.execute(`
        SELECT
            team_id,
            team_name,
            team_logo
        FROM team_schema.team_table
        WHERE
            team_is_disabled = false
    `);

    const availableTeamsCount = plv8.execute(`
        SELECT COUNT(*)
        FROM team_schema.team_table
        WHERE
            team_is_disabled = false
    `)[0].count;

    const userTeamMembershipRequest = plv8.execute(`
        SELECT *
        FROM team_schema.team_membership_request_table
        WHERE
            team_membership_request_from_user_id = $1
    `, [userId]);

    data = {
        teams: availableTeams,
        teamsCount: Number(availableTeamsCount),
        teamMembershipRequestList: userTeamMembershipRequest
    }

 });
 return data;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_hr_preferred_position_on_load(
  input_data JSON
)
RETURNS JSON
SET search_path TO ''
AS $$
  let returnData = {
    groupMemberData: [],
    totalCount: 0
  };
  plv8.subtransaction(() => {
    const {
      teamId,
      limit = 10,
      page = 1,
      search = ''
    } = input_data;

    const searchCondition = search
      ? `AND (u.user_first_name || ' ' || u.user_last_name ILIKE '%${search}%')`
      : '';

    const offset = (page - 1) * limit;

    const groupMemberData = plv8.execute(`
        SELECT
            tg.team_group_member_id,
            u.user_first_name,
            u.user_last_name
        FROM team_schema.team_group_member_table tg
        JOIN team_schema.team_member_table tm
            ON tg.team_member_id = tm.team_member_id
            AND tg.team_group_id = 'a691a6ca-8209-4b7a-8f48-8a4582bbe75a'
            AND tm.team_member_team_id = '${teamId}'
        JOIN user_schema.user_table u
            ON tm.team_member_user_id = u.user_id
        WHERE 1=1
        ${searchCondition}
        ORDER BY u.user_first_name ASC
        LIMIT ${limit} OFFSET ${offset};
    `);

    const groupMemberCount = plv8.execute(`
      SELECT
        COUNT(*)
      FROM team_schema.team_group_member_table tg
      JOIN team_schema.team_member_table tm
        ON tg.team_member_id = tm.team_member_id
        AND tg.team_group_id = 'a691a6ca-8209-4b7a-8f48-8a4582bbe75a'
        AND tm.team_member_team_id = '${teamId}'
      JOIN user_schema.user_table u
        ON tm.team_member_user_id = u.user_id
      WHERE 1=1
      ${searchCondition}

    `)[0].count;


    returnData.groupMemberData = groupMemberData.map(member => ({
      group_member_id: member.team_group_member_id,
      group_member_name: `${member.user_first_name} ${member.user_last_name}`
    }));
    returnData.totalCount = Number(groupMemberCount);
  });
  return returnData;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION insert_update_hr_preferred_position(
  input_data JSON
)
RETURNS VOID
SET search_path TO ''
AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
        positionData,
        memberId
    } = input_data;

    const hrPreferredPositionData = plv8.execute(`
        SELECT *
        FROM hr_schema.hr_preferred_position_table
        WHERE hr_preferred_position_group_member_id = '${memberId}'
    `);

    if(hrPreferredPositionData.length > 0 ){
      const hrPreferredPositionData = plv8.execute(`
        DELETE FROM hr_schema.hr_preferred_position_table
        WHERE hr_preferred_position_group_member_id = '${memberId}'
    `);
    };

   positionData.forEach((position) => {
      plv8.execute(`
        INSERT INTO hr_schema.hr_preferred_position_table (
          hr_preferred_position_group_member_id,
          hr_preferred_position_position_id
        ) VALUES ('${memberId}', '${position}')
      `);
    });
  })
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_hr_preferred_position_per_member_id(
  input_data JSON
)
RETURNS VOID
SET search_path TO ''
AS $$
  let returnData = {
    positionData: [],
    positionId: []
  };
  plv8.subtransaction(function() {
    const { memberId } = input_data;

    const hrPreferredPositionData = plv8.execute(`
      SELECT p.position_alias, p.position_id
      FROM hr_schema.hr_preferred_position_table pr
      JOIN lookup_schema.position_table p
      ON p.position_id = pr.hr_preferred_position_position_id
      WHERE pr.hr_preferred_position_group_member_id = $1
    `, [memberId]);

    hrPreferredPositionData.forEach(row => {
      returnData.positionData.push({
        position_id:row.position_id,
        position_alias:row.position_alias
        });
      returnData.positionId.push(row.position_id);
    });
  });
  return returnData;
$$ LANGUAGE plv8;

----- END: FUNCTIONS

----- START: POLICIES

--- attachment_table
ALTER TABLE attachment_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CRUD for anon users" ON attachment_table;
CREATE POLICY "Allow CRUD for anon users" ON attachment_table
AS PERMISSIVE FOR ALL
USING (true)
WITH CHECK (true);

--- form_schema.field_table
ALTER TABLE form_schema.field_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users" ON form_schema.field_table;
CREATE POLICY "Allow CREATE for authenticated users" ON form_schema.field_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ for anon users" ON form_schema.field_table;
CREATE POLICY "Allow READ for anon users" ON form_schema.field_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON form_schema.field_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON form_schema.field_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  (
    SELECT tt.team_member_team_id
    FROM form_schema.section_table AS st
    JOIN form_schema.form_table AS fot ON st.section_form_id = fot.form_id
    JOIN team_schema.team_member_table AS tt ON fot.form_team_member_id = tt.team_member_id
    WHERE st.section_id = field_section_id
  ) IN (
    SELECT team_member_team_id
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON form_schema.field_table;
CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON form_schema.field_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  (
    SELECT tt.team_member_team_id
    FROM form_schema.section_table AS st
    JOIN form_schema.form_table AS fot ON st.section_form_id = fot.form_id
    JOIN team_schema.team_member_table AS tt ON fot.form_team_member_id = tt.team_member_id
    WHERE st.section_id = field_section_id
  ) IN (
    SELECT team_member_team_id
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- form_schema.form_table
ALTER TABLE form_schema.form_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON form_schema.form_table;
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON "form_schema"."form_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  (
    SELECT team_member_team_id
    FROM team_schema.team_member_table
    WHERE team_member_id = form_team_member_id
  ) IN (
    SELECT team_member_team_id
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow READ for anon users" ON form_schema.form_table;
CREATE POLICY "Allow READ for anon users" ON "form_schema"."form_table"
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON form_schema.form_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON "form_schema"."form_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  (
    SELECT team_member_team_id
    FROM team_schema.team_member_table
    WHERE team_member_id = form_team_member_id
  ) IN (
    SELECT team_member_team_id
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON form_schema.form_table;
CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON "form_schema"."form_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  (
    SELECT team_member_team_id
    FROM team_schema.team_member_table
    WHERE team_member_id = form_team_member_id
  ) IN (
    SELECT team_member_team_id
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

---  item_schema.item_description_field_table
ALTER TABLE item_schema.item_description_field_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON item_schema.item_description_field_table;
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON item_schema.item_description_field_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM item_schema.item_description_table as id
    JOIN item_schema.item_table as it ON it.item_id = id.item_description_item_id
    JOIN team_schema.team_table as tt ON tt.team_id = it.item_team_id
    JOIN team_schema.team_member_table as tm ON tm.team_member_team_id = tt.team_id
    WHERE id.item_description_id = item_description_field_item_description_id
    AND tm.team_member_user_id = (SELECT auth.uid())
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow READ access for anon users" ON item_schema.item_description_field_table;
CREATE POLICY "Allow READ access for anon users" ON item_schema.item_description_field_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON item_schema.item_description_field_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON item_schema.item_description_field_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM item_schema.item_description_table as id
    JOIN item_schema.item_table as it ON it.item_id = id.item_description_item_id
    JOIN team_schema.team_table as tt ON tt.team_id = it.item_team_id
    JOIN team_schema.team_member_table as tm ON tm.team_member_team_id = tt.team_id
    WHERE id.item_description_id = item_description_field_item_description_id
    AND tm.team_member_user_id = (SELECT auth.uid())
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON item_schema.item_description_field_table;
CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON item_schema.item_description_field_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM item_schema.item_description_table as id
    JOIN item_schema.item_table as it ON it.item_id = id.item_description_item_id
    JOIN team_schema.team_table as tt ON tt.team_id = it.item_team_id
    JOIN team_schema.team_member_table as tm ON tm.team_member_team_id = tt.team_id
    WHERE id.item_description_id = item_description_field_item_description_id
    AND tm.team_member_user_id = (SELECT auth.uid())
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- item_schema.item_description_table
ALTER TABLE item_schema.item_description_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON item_schema.item_description_table;
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON item_schema.item_description_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM item_schema.item_table as it
    JOIN team_schema.team_table as tt ON tt.team_id = it.item_team_id
    JOIN team_schema.team_member_table as tm ON tm.team_member_team_id = tt.team_id
    WHERE it.item_id = item_description_item_id
    AND tm.team_member_user_id = (SELECT auth.uid())
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow READ access for anon users" ON item_schema.item_description_table;
CREATE POLICY "Allow READ access for anon users" ON item_schema.item_description_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON item_schema.item_description_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON item_schema.item_description_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM item_schema.item_table as it
    JOIN team_schema.team_table as tt ON tt.team_id = it.item_team_id
    JOIN team_schema.team_member_table as tm ON tm.team_member_team_id = tt.team_id
    WHERE it.item_id = item_description_item_id
    AND tm.team_member_user_id = (SELECT auth.uid())
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON item_schema.item_description_table;
CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON item_schema.item_description_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM item_schema.item_table as it
    JOIN team_schema.team_table as tt ON tt.team_id = it.item_team_id
    JOIN team_schema.team_member_table as tm ON tm.team_member_team_id = tt.team_id
    WHERE it.item_id = item_description_item_id
    AND tm.team_member_user_id = (SELECT auth.uid())
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- item_schema.item_table
ALTER TABLE item_schema.item_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON item_schema.item_table;
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON item_schema.item_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_team_id = item_team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow READ access for anon users" ON item_schema.item_table;
CREATE POLICY "Allow READ access for anon users" ON item_schema.item_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON item_schema.item_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON item_schema.item_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_team_id = item_team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON item_schema.item_table;
CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON item_schema.item_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_team_id = item_team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- form_schema.option_table
ALTER TABLE form_schema.option_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON form_schema.option_table;
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON form_schema.option_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM form_schema.field_table as ft
    JOIN form_schema.section_table as st ON st.section_id = ft.field_section_id
    JOIN form_schema.form_table as fo ON fo.form_id = st.section_form_id
    JOIN team_schema.team_member_table as tm ON tm.team_member_id = fo.form_team_member_id
    WHERE ft.field_id = option_field_id
      AND team_member_team_id IN (
        SELECT team_member_team_id
        FROM team_schema.team_member_table
        WHERE team_member_user_id = (SELECT auth.uid())
          AND team_member_role IN ('OWNER', 'ADMIN')
      )
  )
);

DROP POLICY IF EXISTS "Allow READ for anon users" ON form_schema.option_table;
CREATE POLICY "Allow READ for anon users" ON form_schema.option_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON form_schema.option_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON form_schema.option_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM form_schema.field_table as ft
    JOIN form_schema.section_table as st ON st.section_id = ft.field_section_id
    JOIN form_schema.form_table as fo ON fo.form_id = st.section_form_id
    JOIN team_schema.team_member_table as tm ON tm.team_member_id = fo.form_team_member_id
    WHERE ft.field_id = option_field_id
      AND team_member_team_id IN (
        SELECT team_member_team_id
        FROM team_schema.team_member_table
        WHERE team_member_user_id = (SELECT auth.uid())
          AND team_member_role IN ('OWNER', 'ADMIN')
      )
  )
);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON form_schema.option_table;
CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON form_schema.option_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM form_schema.field_table as ft
    JOIN form_schema.section_table as st ON st.section_id = ft.field_section_id
    JOIN form_schema.form_table as fo ON fo.form_id = st.section_form_id
    JOIN team_schema.team_member_table as tm ON tm.team_member_id = fo.form_team_member_id
    WHERE ft.field_id = option_field_id
      AND team_member_team_id IN (
        SELECT team_member_team_id
        FROM team_schema.team_member_table
        WHERE team_member_user_id = (SELECT auth.uid())
          AND team_member_role IN ('OWNER', 'ADMIN')
      )
  )
);

--- request_schema.request_signer_table
ALTER TABLE request_schema.request_signer_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users" ON request_schema.request_signer_table;
CREATE POLICY "Allow CREATE for authenticated users" ON request_schema.request_signer_table
AS PERMISSIVE FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ for anon users" ON request_schema.request_signer_table;
CREATE POLICY "Allow READ for anon users" ON request_schema.request_signer_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or APPROVER role" ON request_schema.request_signer_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or APPROVER role" ON request_schema.request_signer_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users" ON request_schema.request_signer_table;
CREATE POLICY "Allow DELETE for authenticated users" ON request_schema.request_signer_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  (
    SELECT tm.team_member_team_id
    FROM request_schema.request_table as rt
    JOIN team_schema.team_member_table as tm ON tm.team_member_id = rt.request_team_member_id
    WHERE rt.request_id = request_signer_request_id
  ) IN (
    SELECT team_member_team_id
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
  )
);

--- form_schema.section_table
ALTER TABLE form_schema.section_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON form_schema.section_table;
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON form_schema.section_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  (
    SELECT tm.team_member_team_id
    FROM form_schema.form_table as fo
    JOIN team_schema.team_member_table as tm ON tm.team_member_id = fo.form_team_member_id
    WHERE fo.form_id = section_form_id
  ) IN (
    SELECT team_member_team_id
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow READ for anon users" ON form_schema.section_table;
CREATE POLICY "Allow READ for anon users" ON form_schema.section_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON form_schema.section_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON form_schema.section_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  (
    SELECT tm.team_member_team_id
    FROM form_schema.form_table as fo
    JOIN team_schema.team_member_table as tm ON tm.team_member_id = fo.form_team_member_id
    WHERE fo.form_id = section_form_id
  ) = (
    SELECT team_member_team_id
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON form_schema.section_table;
CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON form_schema.section_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  (
    SELECT tm.team_member_team_id
    FROM form_schema.form_table as fo
    JOIN team_schema.team_member_table as tm ON tm.team_member_id = fo.form_team_member_id
    WHERE fo.form_id = section_form_id
  ) = (
    SELECT team_member_team_id
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- form_schema.signer_table
ALTER TABLE form_schema.signer_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON form_schema.signer_table;
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON form_schema.signer_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  (
    SELECT tm.team_member_team_id
    FROM form_schema.form_table as fo
    JOIN team_schema.team_member_table as tm ON tm.team_member_id = fo.form_team_member_id
    WHERE fo.form_id = signer_form_id
  ) IN (
    SELECT team_member_team_id
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow READ for anon users" ON form_schema.signer_table;
CREATE POLICY "Allow READ for anon users" ON form_schema.signer_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON form_schema.signer_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON form_schema.signer_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  (
    SELECT tm.team_member_team_id
    FROM form_schema.form_table as fo
    JOIN team_schema.team_member_table as tm ON tm.team_member_id = fo.form_team_member_id
    WHERE fo.form_id = signer_form_id
  ) IN (
    SELECT team_member_team_id
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON form_schema.signer_table;
CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON form_schema.signer_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  (
    SELECT tm.team_member_team_id
    FROM form_schema.form_table as fo
    JOIN team_schema.team_member_table as tm ON tm.team_member_id = fo.form_team_member_id
    WHERE fo.form_id = signer_form_id
  ) IN (
    SELECT team_member_team_id
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- team_schema.supplier_table
ALTER TABLE team_schema.supplier_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON team_schema.supplier_table;
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON team_schema.supplier_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  supplier_team_id IN (
    SELECT team_member_team_id
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow READ access for anon users" ON team_schema.supplier_table;
CREATE POLICY "Allow READ access for anon users" ON team_schema.supplier_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON team_schema.supplier_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON team_schema.supplier_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  supplier_team_id IN (
    SELECT team_member_team_id
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON team_schema.supplier_table;
CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON team_schema.supplier_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  supplier_team_id IN (
    SELECT team_member_team_id
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- team_schema.team_member_table
ALTER TABLE team_schema.team_member_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users" ON team_schema.team_member_table;
CREATE POLICY "Allow CREATE for authenticated users" ON team_schema.team_member_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ for anon users" ON team_schema.team_member_table;
CREATE POLICY "Allow READ for anon users" ON team_schema.team_member_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON team_schema.team_member_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON team_schema.team_member_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  team_member_team_id IN (
    SELECT team_member_team_id FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  ) OR team_member_user_id = (SELECT auth.uid())
);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON team_schema.team_member_table;
CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON team_schema.team_member_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  team_member_team_id IN (
    SELECT team_member_team_id FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- request_schema.comment_table
ALTER TABLE request_schema.comment_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users" ON request_schema.comment_table;
CREATE POLICY "Allow CREATE for authenticated users" ON request_schema.comment_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ for anon users" ON request_schema.comment_table;
CREATE POLICY "Allow READ for anon users" ON request_schema.comment_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users based on team_member_id" ON request_schema.comment_table;
CREATE POLICY "Allow UPDATE for authenticated users based on team_member_id" ON request_schema.comment_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (comment_team_member_id IN (SELECT team_member_id FROM team_schema.team_member_table WHERE team_member_user_id = (SELECT auth.uid())))
WITH CHECK (comment_team_member_id IN (SELECT team_member_id FROM team_schema.team_member_table WHERE team_member_user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Allow DELETE for authenticated users based on team_member_id" ON request_schema.comment_table;
CREATE POLICY "Allow DELETE for authenticated users based on team_member_id" ON request_schema.comment_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (comment_team_member_id IN (SELECT team_member_id FROM team_schema.team_member_table WHERE team_member_user_id = (SELECT auth.uid())));

--- user_schema.invitation_table
ALTER TABLE user_schema.invitation_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users" ON user_schema.invitation_table;
CREATE POLICY "Allow CREATE for authenticated users" ON user_schema.invitation_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ for users based on invitation_to_email" ON user_schema.invitation_table;
CREATE POLICY "Allow READ for users based on invitation_to_email" ON user_schema.invitation_table
AS PERMISSIVE FOR SELECT
TO authenticated
USING (
  invitation_to_email = (
    SELECT user_email
    FROM user_schema.user_table
    WHERE user_id = (SELECT auth.uid())
  )
  OR EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_team_id = (
      SELECT team_member_team_id
      FROM team_schema.team_member_table
      WHERE team_member_id = invitation_from_team_member_id
      AND team_member_is_disabled = FALSE
      LIMIT 1
    )
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow UPDATE for users based on invitation_from_team_member_id" ON user_schema.invitation_table;
CREATE POLICY "Allow UPDATE for users based on invitation_from_team_member_id" ON user_schema.invitation_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_team_id = (
      SELECT team_member_team_id
      FROM team_schema.team_member_table
      WHERE team_member_id = invitation_from_team_member_id
      AND team_member_is_disabled = FALSE
      LIMIT 1
    )
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  ) OR invitation_to_email = (
    SELECT user_email
    FROM user_schema.user_table
    WHERE user_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_team_id = (
      SELECT team_member_team_id
      FROM team_schema.team_member_table
      WHERE team_member_id = invitation_from_team_member_id
      AND team_member_is_disabled = FALSE
      LIMIT 1
    )
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  ) OR invitation_to_email = (
    SELECT user_email
    FROM user_schema.user_table
    WHERE user_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "Allow DELETE for users based on invitation_from_team_member_id" ON user_schema.invitation_table;
CREATE POLICY "Allow DELETE for users based on invitation_from_team_member_id" ON user_schema.invitation_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (true);

--- notification_table
ALTER TABLE notification_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow INSERT for public users" ON notification_table;
CREATE POLICY "Allow INSERT for public users" ON notification_table
AS PERMISSIVE FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ for authenticated users on own notifications" ON notification_table;
CREATE POLICY "Allow READ for authenticated users on own notifications" ON notification_table
AS PERMISSIVE FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = notification_user_id);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users on notification_user_id" ON notification_table;
CREATE POLICY "Allow UPDATE for authenticated users on notification_user_id" ON notification_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = notification_user_id)
WITH CHECK ((SELECT auth.uid()) = notification_user_id);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users" ON notification_table;
CREATE POLICY "Allow DELETE for authenticated users" ON notification_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (true);

--- request_schema.request_response_table
ALTER TABLE request_schema.request_response_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE access for all users" ON request_schema.request_response_table;
CREATE POLICY "Allow CREATE access for all users" ON request_schema.request_response_table
AS PERMISSIVE FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ for anon users" ON request_schema.request_response_table;
CREATE POLICY "Allow READ for anon users" ON request_schema.request_response_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users on own request response" ON request_schema.request_response_table;
CREATE POLICY "Allow UPDATE for authenticated users on own request response"
ON request_schema.request_response_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  (
    SELECT rt.request_team_member_id
    FROM request_schema.request_table as rt
    WHERE rt.request_id = request_response_request_id
  ) IN (
    SELECT team_member_id
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  (
    SELECT rt.request_team_member_id
    FROM request_schema.request_table as rt
    WHERE rt.request_id = request_response_request_id
  ) IN (
    SELECT team_member_id
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users on own request response" ON request_schema.request_response_table;
CREATE POLICY "Allow DELETE for authenticated users on own request response"
ON request_schema.request_response_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  (
    SELECT rt.request_team_member_id
    FROM request_schema.request_table AS rt
    WHERE rt.request_id = request_response_request_id
  ) IN (
    SELECT tmt.team_member_id
    FROM team_schema.team_member_table AS tmt
    WHERE tmt.team_member_user_id = (SELECT auth.uid())
  ) OR EXISTS (
    SELECT 1
    FROM team_schema.team_group_member_table AS tgm
    INNER JOIN team_schema.team_member_table AS tmt ON tmt.team_member_id = tgm.team_member_id
    INNER JOIN team_schema.team_group_table AS tg ON tg.team_group_id = tgm.team_group_id
    WHERE tmt.team_member_user_id = (SELECT auth.uid())
    AND tg.team_group_name IN ('COST ENGINEER', 'ACCOUNTANT')
  )
);

--- request_schema.request_table
ALTER TABLE request_schema.request_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE access for all users" ON request_schema.request_table;
CREATE POLICY "Allow CREATE access for all users" ON request_schema.request_table
AS PERMISSIVE FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ for anon users" ON request_schema.request_table;
CREATE POLICY "Allow READ for anon users" ON request_schema.request_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users on own requests or approver" ON request_schema.request_table;
CREATE POLICY "Allow UPDATE for authenticated users on own requests or approver" ON request_schema.request_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users on own requests" ON request_schema.request_table;
CREATE POLICY "Allow DELETE for authenticated users on own requests" ON request_schema.request_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  request_team_member_id IN (
    SELECT team_member_id
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
  )
);

--- team_schema.team_table
ALTER TABLE team_schema.team_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users" ON team_schema.team_table;
CREATE POLICY "Allow CREATE for authenticated users" ON team_schema.team_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ for anon users" ON team_schema.team_table;
CREATE POLICY "Allow READ for anon users" ON team_schema.team_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users on own teams" ON team_schema.team_table;
CREATE POLICY "Allow UPDATE for authenticated users on own teams" ON team_schema.team_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = team_user_id)
WITH CHECK ((SELECT auth.uid()) = team_user_id);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users on own teams" ON team_schema.team_table;
CREATE POLICY "Allow DELETE for authenticated users on own teams" ON team_schema.team_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = team_user_id);

--- user_schema.user_table
ALTER TABLE user_schema.user_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users" ON user_schema.user_table;
CREATE POLICY "Allow CREATE for authenticated users" ON user_schema.user_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ for anon users" ON user_schema.user_table;
CREATE POLICY "Allow READ for anon users" ON user_schema.user_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users based on user_id" ON user_schema.user_table;
CREATE POLICY "Allow UPDATE for authenticated users based on user_id" ON user_schema.user_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users based on user_id" ON user_schema.user_table;
CREATE POLICY "Allow DELETE for authenticated users based on user_id" ON user_schema.user_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = user_id);

--- form_schema.form_team_group_table
ALTER TABLE form_schema.form_team_group_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for OWNER or ADMIN roles" ON form_schema.form_team_group_table;
CREATE POLICY "Allow CREATE for OWNER or ADMIN roles" ON form_schema.form_team_group_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT tt.team_group_team_id
    FROM team_schema.team_group_table as tt
    JOIN team_schema.team_member_table as tm ON tm.team_member_team_id = tt.team_group_team_id
    WHERE tt.team_group_id = team_group_id
    AND tm.team_member_user_id = (SELECT auth.uid())
    AND team_member_role in ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow READ for authenticated team members" ON form_schema.form_team_group_table;
CREATE POLICY "Allow READ for authenticated team members" ON form_schema.form_team_group_table
AS PERMISSIVE FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT tt.team_group_team_id
    FROM team_schema.team_group_table as tt
    JOIN team_schema.team_member_table as tm ON tm.team_member_team_id = tt.team_group_team_id
    WHERE tt.team_group_id = team_group_id
    AND tm.team_member_user_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "Allow UPDATE for OWNER or ADMIN roles" ON form_schema.form_team_group_table;
CREATE POLICY "Allow UPDATE for OWNER or ADMIN roles" ON form_schema.form_team_group_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT tt.team_group_team_id
    FROM team_schema.team_group_table as tt
    JOIN team_schema.team_member_table as tm ON tm.team_member_team_id = tt.team_group_team_id
    WHERE tt.team_group_id = team_group_id
    AND tm.team_member_user_id = (SELECT auth.uid())
    AND team_member_role in ('OWNER', 'ADMIN')
  )
)
WITH CHECK (
  EXISTS (
    SELECT tt.team_group_team_id
    FROM team_schema.team_group_table as tt
    JOIN team_schema.team_member_table as tm ON tm.team_member_team_id = tt.team_group_team_id
    WHERE tt.team_group_id = team_group_id
    AND tm.team_member_user_id = (SELECT auth.uid())
    AND team_member_role in ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow DELETE for OWNER or ADMIN roles" ON form_schema.form_team_group_table;
CREATE POLICY "Allow DELETE for OWNER or ADMIN roles" ON form_schema.form_team_group_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT tt.team_group_team_id
    FROM team_schema.team_group_table as tt
    JOIN team_schema.team_member_table as tm ON tm.team_member_team_id = tt.team_group_team_id
    WHERE tt.team_group_id = team_group_id
    AND tm.team_member_user_id = (SELECT auth.uid())
    AND team_member_role in ('OWNER', 'ADMIN')
  )
);

--- team_schema.team_group_member_table
ALTER TABLE team_schema.team_group_member_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for OWNER or ADMIN roles" ON team_schema.team_group_member_table;
CREATE POLICY "Allow CREATE for OWNER or ADMIN roles" ON team_schema.team_group_member_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT tt.team_group_team_id
    FROM team_schema.team_group_table as tt
    JOIN team_schema.team_member_table as tm ON tm.team_member_team_id = tt.team_group_team_id
    WHERE tt.team_group_id = team_group_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role in ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow READ for anon users" ON team_schema.team_group_member_table;
CREATE policy "Allow READ for anon users" ON team_schema.team_group_member_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for OWNER or ADMIN roles" ON team_schema.team_group_member_table;
CREATE POLICY "Allow UPDATE for OWNER or ADMIN roles" ON team_schema.team_group_member_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT tt.team_group_team_id
    FROM team_schema.team_group_table as tt
    JOIN team_schema.team_member_table as tm ON tm.team_member_team_id = tt.team_group_team_id
    WHERE tt.team_group_id = team_group_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role in ('OWNER', 'ADMIN')
  )
)
WITH CHECK (
   EXISTS (
    SELECT tt.team_group_team_id
    FROM team_schema.team_group_table as tt
    JOIN team_schema.team_member_table as tm ON tm.team_member_team_id = tt.team_group_team_id
    WHERE tt.team_group_id = team_group_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role in ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow DELETE for OWNER or ADMIN roles" ON team_schema.team_group_member_table;
CREATE POLICY "Allow DELETE for OWNER or ADMIN roles" ON team_schema.team_group_member_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT tt.team_group_team_id
    FROM team_schema.team_group_table as tt
    JOIN team_schema.team_member_table as tm ON tm.team_member_team_id = tt.team_group_team_id
    WHERE tt.team_group_id = team_group_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role in ('OWNER', 'ADMIN')
  )
);

--- team_schema.team_group_table
ALTER TABLE team_schema.team_group_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for OWNER or ADMIN roles" ON team_schema.team_group_table;
CREATE POLICY "Allow CREATE for OWNER or ADMIN roles" ON team_schema.team_group_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT tm.team_member_team_id
    FROM team_schema.team_member_table as tm
    JOIN user_schema.user_table as ut ON ut.user_id = (SELECT auth.uid())
    WHERE ut.user_active_team_id = team_group_team_id
    AND tm.team_member_user_id = (SELECT auth.uid())
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow READ for anon users" ON team_schema.team_group_table;
CREATE policy "Allow READ for anon users" ON team_schema.team_group_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for OWNER or ADMIN roles" ON team_schema.team_group_table;
CREATE POLICY "Allow UPDATE for OWNER or ADMIN roles" ON team_schema.team_group_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT tm.team_member_team_id
    FROM team_schema.team_member_table as tm
    JOIN user_schema.user_table as ut ON ut.user_id = (SELECT auth.uid())
    WHERE ut.user_active_team_id = team_group_team_id
    AND tm.team_member_user_id = (SELECT auth.uid())
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  )
)
WITH CHECK (
  EXISTS (
    SELECT tm.team_member_team_id
    FROM team_schema.team_member_table as tm
    JOIN user_schema.user_table as ut ON ut.user_id = (SELECT auth.uid())
    WHERE ut.user_active_team_id = team_group_team_id
    AND tm.team_member_user_id = (SELECT auth.uid())
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow DELETE for OWNER or ADMIN roles" ON team_schema.team_group_table;
CREATE POLICY "Allow DELETE for OWNER or ADMIN roles" ON team_schema.team_group_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT tm.team_member_team_id
    FROM team_schema.team_member_table as tm
    JOIN user_schema.user_table as ut ON ut.user_id = (SELECT auth.uid())
    WHERE ut.user_active_team_id = team_group_team_id
    AND tm.team_member_user_id = (SELECT auth.uid())
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- team_schema.team_project_member_table
ALTER TABLE team_schema.team_project_member_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for OWNER or ADMIN roles" ON team_schema.team_project_member_table;
CREATE POLICY "Allow CREATE for OWNER or ADMIN roles" ON team_schema.team_project_member_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT tp.team_project_team_id
    FROM team_schema.team_project_table as tp
    JOIN team_schema.team_member_table as tm ON tm.team_member_team_id = tp.team_project_team_id
    WHERE tp.team_project_id = team_project_id
    AND tm.team_member_user_id = (SELECT auth.uid())
    AND team_member_role in ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow READ for authenticated team members" ON team_schema.team_project_member_table;
CREATE POLICY "Allow READ for authenticated team members" ON team_schema.team_project_member_table
AS PERMISSIVE FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT tp.team_project_team_id
    FROM team_schema.team_project_table as tp
    JOIN team_schema.team_member_table as tm ON tm.team_member_team_id = tp.team_project_team_id
    WHERE tp.team_project_id = team_project_id
    AND tm.team_member_user_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "Allow UPDATE for OWNER or ADMIN roles" ON team_schema.team_project_member_table;
CREATE POLICY "Allow UPDATE for OWNER or ADMIN roles" ON team_schema.team_project_member_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT tp.team_project_team_id
    FROM team_schema.team_project_table as tp
    JOIN team_schema.team_member_table as tm ON tm.team_member_team_id = tp.team_project_team_id
    WHERE tp.team_project_id = team_project_id
    AND tm.team_member_user_id = (SELECT auth.uid())
    AND team_member_role in ('OWNER', 'ADMIN')
  )
)
WITH CHECK (
  EXISTS (
    SELECT tp.team_project_team_id
    FROM team_schema.team_project_table as tp
    JOIN team_schema.team_member_table as tm ON tm.team_member_team_id = tp.team_project_team_id
    WHERE tp.team_project_id = team_project_id
    AND tm.team_member_user_id = (SELECT auth.uid())
    AND team_member_role in ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow DELETE for OWNER or ADMIN roles" ON team_schema.team_project_member_table;
CREATE POLICY "Allow DELETE for OWNER or ADMIN roles" ON team_schema.team_project_member_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT tp.team_project_team_id
    FROM team_schema.team_project_table as tp
    JOIN team_schema.team_member_table as tm ON tm.team_member_team_id = tp.team_project_team_id
    WHERE tp.team_project_id = team_project_id
    AND tm.team_member_user_id = (SELECT auth.uid())
    AND team_member_role in ('OWNER', 'ADMIN')
  )
);

--- team_schema.team_project_table
ALTER TABLE team_schema.team_project_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for OWNER or ADMIN roles" ON team_schema.team_project_table;
CREATE POLICY "Allow CREATE for OWNER or ADMIN roles" ON team_schema.team_project_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT tm.team_member_team_id
    FROM team_schema.team_member_table as tm
    JOIN user_schema.user_table as ut ON ut.user_id = (SELECT auth.uid())
    WHERE ut.user_active_team_id = team_project_team_id
    AND tm.team_member_user_id = (SELECT auth.uid())
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow READ for anon users" ON team_schema.team_project_table;
CREATE POLICY "Allow READ for anon users" ON team_schema.team_project_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for OWNER or ADMIN roles" ON team_schema.team_project_table;
CREATE POLICY "Allow UPDATE for OWNER or ADMIN roles" ON team_schema.team_project_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT tm.team_member_team_id
    FROM team_schema.team_member_table as tm
    JOIN user_schema.user_table as ut ON ut.user_id = (SELECT auth.uid())
    WHERE ut.user_active_team_id = team_project_team_id
    AND tm.team_member_user_id = (SELECT auth.uid())
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  )
)
WITH CHECK (
  EXISTS (
    SELECT tm.team_member_team_id
    FROM team_schema.team_member_table as tm
    JOIN user_schema.user_table as ut ON ut.user_id = (SELECT auth.uid())
    WHERE ut.user_active_team_id = team_project_team_id
    AND tm.team_member_user_id = (SELECT auth.uid())
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow DELETE for OWNER or ADMIN roles" ON team_schema.team_project_table;
CREATE POLICY "Allow DELETE for OWNER or ADMIN roles" ON team_schema.team_project_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT tm.team_member_team_id
    FROM team_schema.team_member_table as tm
    JOIN user_schema.user_table as ut ON ut.user_id = (SELECT auth.uid())
    WHERE ut.user_active_team_id = team_project_team_id
    AND tm.team_member_user_id = (SELECT auth.uid())
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- ticket_schema.ticket_table
ALTER TABLE ticket_schema.ticket_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE access for all users" ON ticket_schema.ticket_table;
CREATE POLICY "Allow CREATE access for all users" ON ticket_schema.ticket_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ for anon users" ON ticket_schema.ticket_table;
CREATE POLICY "Allow READ for anon users" ON ticket_schema.ticket_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON ticket_schema.ticket_table;
CREATE POLICY "Allow UPDATE for authenticated users" ON ticket_schema.ticket_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING(true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users on own ticket" ON ticket_schema.ticket_table;
CREATE POLICY "Allow DELETE for authenticated users on own ticket" ON ticket_schema.ticket_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  ticket_requester_team_member_id IN (
    SELECT team_member_id
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
  )
);

--- ticket_schema.ticket_comment_table
ALTER TABLE ticket_schema.ticket_comment_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE access for all users" ON ticket_schema.ticket_comment_table;
CREATE POLICY "Allow CREATE access for all users" ON ticket_schema.ticket_comment_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ for anon users" ON ticket_schema.ticket_comment_table;
CREATE POLICY "Allow READ for anon users" ON ticket_schema.ticket_comment_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON ticket_schema.ticket_comment_table;
CREATE POLICY "Allow UPDATE for authenticated users" ON ticket_schema.ticket_comment_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING(true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users on own ticket" ON ticket_schema.ticket_comment_table;
CREATE POLICY "Allow DELETE for authenticated users on own ticket" ON ticket_schema.ticket_comment_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  ticket_comment_team_member_id IN (
    SELECT team_member_id
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
  )
);

--- service_schema.service_scope_choice_table
ALTER TABLE service_schema.service_scope_choice_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON service_schema.service_scope_choice_table;
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON service_schema.service_scope_choice_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM service_schema.service_scope_table
    JOIN service_schema.service_table ON service_id = service_scope_service_id
    JOIN team_schema.team_table ON team_id = service_team_id
    JOIN team_schema.team_member_table ON team_member_team_id = team_id
    WHERE service_scope_id = service_scope_choice_service_scope_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow READ access for anon users" ON service_schema.service_scope_choice_table;
CREATE POLICY "Allow READ access for anon users" ON service_schema.service_scope_choice_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON service_schema.service_scope_choice_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON service_schema.service_scope_choice_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM service_schema.service_scope_table
    JOIN service_schema.service_table ON service_id = service_scope_service_id
    JOIN team_schema.team_table ON team_id = service_team_id
    JOIN team_schema.team_member_table ON team_member_team_id = team_id
    WHERE service_scope_id = service_scope_choice_service_scope_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON service_schema.service_scope_choice_table;
CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON service_schema.service_scope_choice_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM service_schema.service_scope_table
    JOIN service_schema.service_table ON service_id = service_scope_service_id
    JOIN team_schema.team_table ON team_id = service_team_id
    JOIN team_schema.team_member_table ON team_member_team_id = team_id
    WHERE service_scope_id = service_scope_choice_service_scope_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- service_schema.service_scope_table
ALTER TABLE service_schema.service_scope_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON service_schema.service_scope_table;
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON service_schema.service_scope_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM service_schema.service_table
    JOIN team_schema.team_table ON team_id = service_team_id
    JOIN team_schema.team_member_table ON team_member_team_id = team_id
    WHERE service_id = service_scope_service_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow READ for anon users" ON service_schema.service_scope_table;
CREATE POLICY "Allow READ for anon users" ON service_schema.service_scope_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON service_schema.service_scope_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON service_schema.service_scope_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM service_schema.service_table
    JOIN team_schema.team_table ON team_id = service_team_id
    JOIN team_schema.team_member_table ON team_member_team_id = team_id
    WHERE service_id = service_scope_service_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON service_schema.service_scope_table;
CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON service_schema.service_scope_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM service_schema.service_table
    JOIN team_schema.team_table ON team_id = service_team_id
    JOIN team_schema.team_member_table ON team_member_team_id = team_id
    WHERE service_id = service_scope_service_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- service_schema.service_table
ALTER TABLE service_schema.service_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON service_schema.service_table;
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON service_schema.service_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_team_id = service_team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow READ for anon users" ON service_schema.service_table;
CREATE POLICY "Allow READ for anon users" ON service_schema.service_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON service_schema.service_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON service_schema.service_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_team_id = service_team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON service_schema.service_table;
CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON service_schema.service_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_team_id = service_team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- item_schema.item_division_table
ALTER TABLE item_schema.item_division_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON item_schema.item_division_table;
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON item_schema.item_division_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM item_schema.item_table as it
    JOIN team_schema.team_table as tt ON tt.team_id = it.item_team_id
    JOIN team_schema.team_member_table as tm ON tm.team_member_team_id = tt.team_id
    WHERE it.item_id = item_division_item_id
    AND tm.team_member_user_id = (SELECT auth.uid())
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow READ access for anon users" ON item_schema.item_division_table;
CREATE POLICY "Allow READ access for anon users" ON item_schema.item_division_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON item_schema.item_division_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON item_schema.item_division_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM item_schema.item_table as it
    JOIN team_schema.team_table as tt ON tt.team_id = it.item_team_id
    JOIN team_schema.team_member_table as tm ON tm.team_member_team_id = tt.team_id
    WHERE it.item_id = item_division_item_id
    AND tm.team_member_user_id = (SELECT auth.uid())
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON item_schema.item_division_table;
CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON item_schema.item_division_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM item_schema.item_table as it
    JOIN team_schema.team_table as tt ON tt.team_id = it.item_team_id
    JOIN team_schema.team_member_table as tm ON tm.team_member_team_id = tt.team_id
    WHERE it.item_id = item_division_item_id
    AND tm.team_member_user_id = (SELECT auth.uid())
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- item_schema.item_description_field_uom_table
ALTER TABLE item_schema.item_description_field_uom_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON item_schema.item_description_field_uom_table;
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON item_schema.item_description_field_uom_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM item_schema.item_description_field_table AS idf
    JOIN item_schema.item_description_table ON item_description_id = item_description_field_item_description_id
    JOIN item_schema.item_table ON item_id = item_description_item_id
    JOIN team_schema.team_table ON team_id = item_team_id
    JOIN team_schema.team_member_table ON team_member_team_id = team_id
    WHERE idf.item_description_field_id = item_description_field_uom_item_description_field_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow READ access for anon users" ON item_schema.item_description_field_uom_table;
CREATE POLICY "Allow READ access for anon users" ON item_schema.item_description_field_uom_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON item_schema.item_description_field_uom_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON item_schema.item_description_field_uom_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM item_schema.item_description_field_table AS idf
    JOIN item_schema.item_description_table ON item_description_id = item_description_field_item_description_id
    JOIN item_schema.item_table ON item_id = item_description_item_id
    JOIN team_schema.team_table ON team_id = item_team_id
    JOIN team_schema.team_member_table ON team_member_team_id = team_id
    WHERE idf.item_description_field_id = item_description_field_uom_item_description_field_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON item_schema.item_description_field_uom_table;
CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON item_schema.item_description_field_uom_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM item_schema.item_description_field_table AS idf
    JOIN item_schema.item_description_table ON item_description_id = item_description_field_item_description_id
    JOIN item_schema.item_table ON item_id = item_description_item_id
    JOIN team_schema.team_table ON team_id = item_team_id
    JOIN team_schema.team_member_table ON team_member_team_id = team_id
    WHERE idf.item_description_field_id = item_description_field_uom_item_description_field_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- user_schema.user_employee_number_table
ALTER TABLE user_schema.user_employee_number_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users" ON user_schema.user_employee_number_table;
CREATE POLICY "Allow CREATE for authenticated users" ON user_schema.user_employee_number_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ for anon users" ON user_schema.user_employee_number_table;
CREATE POLICY "Allow READ for anon users" ON user_schema.user_employee_number_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users based on user_id" ON user_schema.user_employee_number_table;
CREATE POLICY "Allow UPDATE for authenticated users based on user_id" ON user_schema.user_employee_number_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT user_id
    FROM user_schema.user_table
    WHERE user_id = user_employee_number_user_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT user_id
    FROM user_schema.user_table
    WHERE user_id = user_employee_number_user_id
  )
);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users based on user_id" ON user_schema.user_employee_number_table;
CREATE POLICY "Allow DELETE for authenticated users based on user_id" ON user_schema.user_employee_number_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT user_id
    FROM user_schema.user_table
    WHERE user_id = user_employee_number_user_id
  )
);
--- history_schema.user_name_history_table
ALTER TABLE history_schema.user_name_history_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users" ON history_schema.user_name_history_table;
CREATE POLICY "Allow CREATE for authenticated users" ON history_schema.user_name_history_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

--- history_schema.signature_history_table
ALTER TABLE history_schema.signature_history_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users" ON history_schema.signature_history_table;
CREATE POLICY "Allow CREATE for authenticated users" ON history_schema.signature_history_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON history_schema.signature_history_table;
CREATE POLICY "Enable read access for all users" ON history_schema.signature_history_table
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON history_schema.signature_history_table;
CREATE POLICY "Allow UPDATE for authenticated users" ON history_schema.signature_history_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

--- unit_of_measurement_schema.general_unit_of_measurement_table
ALTER TABLE unit_of_measurement_schema.general_unit_of_measurement_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON unit_of_measurement_schema.general_unit_of_measurement_table;
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON unit_of_measurement_schema.general_unit_of_measurement_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM team_schema.team_table
    JOIN team_schema.team_member_table ON team_member_team_id = team_id
    WHERE general_unit_of_measurement_team_id = team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow READ for anon users" ON unit_of_measurement_schema.general_unit_of_measurement_table;
CREATE POLICY "Allow READ for anon users" ON unit_of_measurement_schema.general_unit_of_measurement_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON unit_of_measurement_schema.general_unit_of_measurement_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON unit_of_measurement_schema.general_unit_of_measurement_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_schema.team_table
    JOIN team_schema.team_member_table ON team_member_team_id = team_id
    WHERE general_unit_of_measurement_team_id = team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON unit_of_measurement_schema.general_unit_of_measurement_table;
CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON unit_of_measurement_schema.general_unit_of_measurement_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_schema.team_table
    JOIN team_schema.team_member_table ON team_member_team_id = team_id
    WHERE general_unit_of_measurement_team_id = team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- service_schema.service_category_table
ALTER TABLE service_schema.service_category_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON service_schema.service_category_table;
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON service_schema.service_category_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM team_schema.team_table
    JOIN team_schema.team_member_table ON team_member_team_id = team_id
    WHERE service_category_team_id = team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow READ for anon users" ON service_schema.service_category_table;
CREATE POLICY "Allow READ for anon users" ON service_schema.service_category_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON service_schema.service_category_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON service_schema.service_category_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_schema.team_table
    JOIN team_schema.team_member_table ON team_member_team_id = team_id
    WHERE service_category_team_id = team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON service_schema.service_category_table;
CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON service_schema.service_category_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_schema.team_table
    JOIN team_schema.team_member_table ON team_member_team_id = team_id
    WHERE service_category_team_id = team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- memo_schema.memo_table
ALTER TABLE memo_schema.memo_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE access for auth users" ON memo_schema.memo_table;
CREATE POLICY "Allow CREATE access for auth users" ON memo_schema.memo_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ for anon users" ON memo_schema.memo_table;
CREATE POLICY "Allow READ for anon users" ON memo_schema.memo_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for auth users" ON memo_schema.memo_table;
CREATE POLICY "Allow UPDATE for auth users" ON memo_schema.memo_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING(true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow DELETE for auth users on own memo" ON memo_schema.memo_table;
CREATE POLICY "Allow DELETE for auth users on own memo" ON memo_schema.memo_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  memo_author_user_id = (SELECT auth.uid())
);

--- memo_schema.memo_signer_table
ALTER TABLE memo_schema.memo_signer_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CRUD for auth users" ON memo_schema.memo_signer_table;
CREATE POLICY "Allow CRUD for auth users" ON memo_schema.memo_signer_table
AS PERMISSIVE FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

--- memo_schema.memo_line_item_table
ALTER TABLE memo_schema.memo_line_item_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CRUD for auth users" ON memo_schema.memo_line_item_table;
CREATE POLICY "Allow CRUD for auth users" ON memo_schema.memo_line_item_table
AS PERMISSIVE FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

--- memo_schema.memo_line_item_attachment_table
ALTER TABLE memo_schema.memo_line_item_attachment_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CRUD for auth users" ON memo_schema.memo_line_item_attachment_table;
CREATE POLICY "Allow CRUD for auth users" ON memo_schema.memo_line_item_attachment_table
AS PERMISSIVE FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

--- memo_schema.memo_date_updated_table
ALTER TABLE memo_schema.memo_date_updated_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE access for auth users" ON memo_schema.memo_date_updated_table;
CREATE POLICY "Allow CREATE access for auth users" ON memo_schema.memo_date_updated_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ for anon users" ON memo_schema.memo_date_updated_table;
CREATE POLICY "Allow READ for anon users" ON memo_schema.memo_date_updated_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for auth users" ON memo_schema.memo_date_updated_table;
CREATE POLICY "Allow UPDATE for auth users" ON memo_schema.memo_date_updated_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING(true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow DELETE for auth users on own memo" ON memo_schema.memo_date_updated_table;
CREATE POLICY "Allow DELETE for auth users on own memo" ON memo_schema.memo_date_updated_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM memo_schema.memo_table
    WHERE memo_id = memo_date_updated_memo_id
    AND memo_author_user_id = (SELECT auth.uid())
  )
);

--- memo_schema.memo_status_table
ALTER TABLE memo_schema.memo_status_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE access for auth users" ON memo_schema.memo_status_table;
CREATE POLICY "Allow CREATE access for auth users" ON memo_schema.memo_status_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ for anon users" ON memo_schema.memo_status_table;
CREATE POLICY "Allow READ for anon users" ON memo_schema.memo_status_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for auth users" ON memo_schema.memo_status_table;
CREATE POLICY "Allow UPDATE for auth users" ON memo_schema.memo_status_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING(true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow DELETE for auth users on own memo" ON memo_schema.memo_status_table;
CREATE POLICY "Allow DELETE for auth users on own memo" ON memo_schema.memo_status_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM memo_schema.memo_table
    WHERE memo_id = memo_status_memo_id
    AND memo_author_user_id = (SELECT auth.uid())
  )
);

--- memo_schema.memo_read_receipt_table
ALTER TABLE memo_schema.memo_read_receipt_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE access for auth users" ON memo_schema.memo_read_receipt_table;
CREATE POLICY "Allow CREATE access for auth users" ON memo_schema.memo_read_receipt_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ for anon users" ON memo_schema.memo_read_receipt_table;
CREATE POLICY "Allow READ for anon users" ON memo_schema.memo_read_receipt_table
AS PERMISSIVE FOR SELECT
USING (true);

--- memo_schema.memo_agreement_table
ALTER TABLE memo_schema.memo_agreement_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE access for auth users" ON memo_schema.memo_agreement_table;
CREATE POLICY "Allow CREATE access for auth users" ON memo_schema.memo_agreement_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ for anon users" ON memo_schema.memo_agreement_table;
CREATE POLICY "Allow READ for anon users" ON memo_schema.memo_agreement_table
AS PERMISSIVE FOR SELECT
USING (true);

--- user_schema.user_valid_id_table
ALTER TABLE user_schema.user_valid_id_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE access for all users" ON user_schema.user_valid_id_table;
CREATE POLICY "Allow CREATE access for all users" ON user_schema.user_valid_id_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ for anon users" ON user_schema.user_valid_id_table;
CREATE POLICY "Allow READ for anon users" ON user_schema.user_valid_id_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON user_schema.user_valid_id_table;
CREATE POLICY "Allow UPDATE for authenticated users" ON user_schema.user_valid_id_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING(true)
WITH CHECK (true);

--- other_expenses_schema.other_expenses_category_table
ALTER TABLE other_expenses_schema.other_expenses_category_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON other_expenses_schema.other_expenses_category_table;
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON other_expenses_schema.other_expenses_category_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM team_schema.team_table
    JOIN team_schema.team_member_table ON team_member_team_id = team_id
    WHERE other_expenses_category_team_id = team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow READ for anon users" ON other_expenses_schema.other_expenses_category_table;
CREATE POLICY "Allow READ for anon users" ON other_expenses_schema.other_expenses_category_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON other_expenses_schema.other_expenses_category_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON other_expenses_schema.other_expenses_category_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_schema.team_table
    JOIN team_schema.team_member_table ON team_member_team_id = team_id
    WHERE other_expenses_category_team_id = team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON other_expenses_schema.other_expenses_category_table;
CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON other_expenses_schema.other_expenses_category_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM other_expenses_schema.other_expenses_category_table
    JOIN team_schema.team_table ON other_expenses_category_team_id = team_id
    JOIN team_schema.team_member_table ON team_member_team_id = team_id
    WHERE other_expenses_category_team_id = team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- other_expenses_schema.other_expenses_type_table
ALTER TABLE other_expenses_schema.other_expenses_type_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON other_expenses_schema.other_expenses_type_table;
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON other_expenses_schema.other_expenses_type_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM other_expenses_schema.other_expenses_category_table
    JOIN team_schema.team_table ON team_id = other_expenses_category_team_id
    JOIN team_schema.team_member_table ON team_member_team_id = team_id
    WHERE other_expenses_category_team_id = team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow READ for anon users" ON other_expenses_schema.other_expenses_type_table;
CREATE POLICY "Allow READ for anon users" ON other_expenses_schema.other_expenses_type_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON other_expenses_schema.other_expenses_type_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON other_expenses_schema.other_expenses_type_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM other_expenses_schema.other_expenses_category_table
    JOIN team_schema.team_table ON team_id = other_expenses_category_team_id
    JOIN team_schema.team_member_table ON team_member_team_id = team_id
    WHERE other_expenses_category_team_id = team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON other_expenses_schema.other_expenses_type_table;
CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON other_expenses_schema.other_expenses_type_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM other_expenses_schema.other_expenses_category_table
    JOIN team_schema.team_table ON team_id = other_expenses_category_team_id
    JOIN team_schema.team_member_table ON team_member_team_id = team_id
    WHERE other_expenses_category_team_id = team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- unit_of_measurement_schema.item_unit_of_measurement_table
ALTER TABLE unit_of_measurement_schema.item_unit_of_measurement_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON unit_of_measurement_schema.item_unit_of_measurement_table;
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON unit_of_measurement_schema.item_unit_of_measurement_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM team_schema.team_table
    JOIN team_schema.team_member_table ON team_member_team_id = team_id
    WHERE item_unit_of_measurement_team_id = team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow READ for anon users" ON unit_of_measurement_schema.item_unit_of_measurement_table;
CREATE POLICY "Allow READ for anon users" ON unit_of_measurement_schema.item_unit_of_measurement_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON unit_of_measurement_schema.item_unit_of_measurement_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON unit_of_measurement_schema.item_unit_of_measurement_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_schema.team_table
    JOIN team_schema.team_member_table ON team_member_team_id = team_id
    WHERE item_unit_of_measurement_team_id = team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON unit_of_measurement_schema.item_unit_of_measurement_table;
CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON unit_of_measurement_schema.item_unit_of_measurement_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_schema.team_table
    JOIN team_schema.team_member_table ON team_member_team_id = team_id
    WHERE item_unit_of_measurement_team_id = team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- item_schema.item_level_three_description_table
ALTER TABLE item_schema.item_level_three_description_table  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON item_schema.item_level_three_description_table;
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON item_schema.item_level_three_description_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM item_schema.item_table as it
    JOIN team_schema.team_table as tt ON tt.team_id = it.item_team_id
    JOIN team_schema.team_member_table as tm ON tm.team_member_team_id = tt.team_id
    WHERE it.item_id = item_level_three_description_item_id
    AND tm.team_member_user_id = (SELECT auth.uid())
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow READ access for anon users" ON item_schema.item_level_three_description_table;
CREATE POLICY "Allow READ access for anon users" ON item_schema.item_level_three_description_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON item_schema.item_level_three_description_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON item_schema.item_level_three_description_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM item_schema.item_table as it
    JOIN team_schema.team_table as tt ON tt.team_id = it.item_team_id
    JOIN team_schema.team_member_table as tm ON tm.team_member_team_id = tt.team_id
    WHERE it.item_id = item_level_three_description_item_id
    AND tm.team_member_user_id = (SELECT auth.uid())
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON item_schema.item_level_three_description_table;
CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON item_schema.item_level_three_description_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM item_schema.item_table as it
    JOIN team_schema.team_table as tt ON tt.team_id = it.item_team_id
    JOIN team_schema.team_member_table as tm ON tm.team_member_team_id = tt.team_id
    WHERE it.item_id = item_level_three_description_item_id
    AND tm.team_member_user_id = (SELECT auth.uid())
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- memo_schema.memo_format_section_table
ALTER TABLE memo_schema.memo_format_section_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CRUD for auth users" ON memo_schema.memo_format_section_table;
CREATE POLICY "Allow CRUD for auth users" ON memo_schema.memo_format_section_table
AS PERMISSIVE FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

--- mmemo_schema.memo_format_subsection_table
ALTER TABLE memo_schema.memo_format_subsection_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CRUD for auth users" ON memo_schema.memo_format_subsection_table;
CREATE POLICY "Allow CRUD for auth users" ON memo_schema.memo_format_subsection_table
AS PERMISSIVE FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

--- memo_schema.memo_format_attachment_table
ALTER TABLE memo_schema.memo_format_attachment_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CRUD for auth users" ON memo_schema.memo_format_attachment_table;
CREATE POLICY "Allow CRUD for auth users" ON memo_schema.memo_format_attachment_table
AS PERMISSIVE FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

--- lookup_schema.query_table
ALTER TABLE lookup_schema.query_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow READ for anon users" ON lookup_schema.query_table;
CREATE POLICY "Allow READ for anon users" ON lookup_schema.query_table
AS PERMISSIVE FOR SELECT
USING (true);

--- form_schema.form_sla_table
ALTER TABLE form_schema.form_sla_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE access for all users" ON form_schema.form_sla_table;
CREATE POLICY "Allow CREATE access for all users" ON form_schema.form_sla_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ for anon users" ON form_schema.form_sla_table;
CREATE POLICY "Allow READ for anon users" ON form_schema.form_sla_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON form_schema.form_sla_table;
CREATE POLICY "Allow UPDATE for authenticated users" ON form_schema.form_sla_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING(true)
WITH CHECK (true);

--- lookup_schema.csi_code_table
ALTER TABLE lookup_schema.csi_code_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE access for all users" ON lookup_schema.csi_code_table;
CREATE POLICY "Allow CREATE access for all users" ON lookup_schema.csi_code_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ access for anon users" ON lookup_schema.csi_code_table;
CREATE POLICY "Allow READ access for anon users" ON lookup_schema.csi_code_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON lookup_schema.csi_code_table;
CREATE POLICY "Allow UPDATE for authenticated users" ON lookup_schema.csi_code_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING(true)
WITH CHECK (true);

--- ticket_schema.ticket_category_table
ALTER TABLE ticket_schema.ticket_category_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE access for all users" ON ticket_schema.ticket_category_table;
CREATE POLICY "Allow CREATE access for all users" ON ticket_schema.ticket_category_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ access for anon users" ON ticket_schema.ticket_category_table;
CREATE POLICY "Allow READ access for anon users" ON ticket_schema.ticket_category_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON ticket_schema.ticket_category_table;
CREATE POLICY "Allow UPDATE for authenticated users" ON ticket_schema.ticket_category_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING(true)
WITH CHECK (true);

--- ticket_schema.ticket_section_table
ALTER TABLE ticket_schema.ticket_section_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE access for all users" ON ticket_schema.ticket_section_table;
CREATE POLICY "Allow CREATE access for all users" ON ticket_schema.ticket_section_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ access for anon users" ON ticket_schema.ticket_section_table;
CREATE POLICY "Allow READ access for anon users" ON ticket_schema.ticket_section_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON ticket_schema.ticket_section_table;
CREATE POLICY "Allow UPDATE for authenticated users" ON ticket_schema.ticket_section_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING(true)
WITH CHECK (true);

--- ticket_schema.ticket_field_table
ALTER TABLE ticket_schema.ticket_field_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE access for all users" ON ticket_schema.ticket_field_table;
CREATE POLICY "Allow CREATE access for all users" ON ticket_schema.ticket_field_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ access for anon users" ON ticket_schema.ticket_field_table;
CREATE POLICY "Allow READ access for anon users" ON ticket_schema.ticket_field_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON ticket_schema.ticket_field_table;
CREATE POLICY "Allow UPDATE for authenticated users" ON ticket_schema.ticket_field_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING(true)
WITH CHECK (true);

--- ticket_schema.ticket_option_table
ALTER TABLE ticket_schema.ticket_option_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE access for all users" ON ticket_schema.ticket_option_table;
CREATE POLICY "Allow CREATE access for all users" ON ticket_schema.ticket_option_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ access for anon users" ON ticket_schema.ticket_option_table;
CREATE POLICY "Allow READ access for anon users" ON ticket_schema.ticket_option_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON ticket_schema.ticket_option_table;
CREATE POLICY "Allow UPDATE for authenticated users" ON ticket_schema.ticket_option_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING(true)
WITH CHECK (true);

--- ticket_schema.ticket_response_table
ALTER TABLE ticket_schema.ticket_response_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE access for all users" ON ticket_schema.ticket_response_table;
CREATE POLICY "Allow CREATE access for all users" ON ticket_schema.ticket_response_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ access for anon users" ON ticket_schema.ticket_response_table;
CREATE POLICY "Allow READ access for anon users" ON ticket_schema.ticket_response_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON ticket_schema.ticket_response_table;
CREATE POLICY "Allow UPDATE for authenticated users" ON ticket_schema.ticket_response_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING(true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users" ON ticket_schema.ticket_response_table;
CREATE POLICY "Allow DELETE for authenticated users" ON ticket_schema.ticket_response_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING(true);

--- equipment_schema.equipment_category_table
ALTER TABLE equipment_schema.equipment_category_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_category_table;
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_category_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_team_id = equipment_category_team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow READ access for anon users" ON equipment_schema.equipment_category_table;
CREATE POLICY "Allow READ access for anon users" ON equipment_schema.equipment_category_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_category_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_category_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_team_id = equipment_category_team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_category_table;
CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_category_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_team_id = equipment_category_team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- equipment_schema.equipment_brand_table
ALTER TABLE equipment_schema.equipment_brand_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_brand_table;
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_brand_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_team_id = equipment_brand_team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow READ access for anon users" ON equipment_schema.equipment_brand_table;
CREATE POLICY "Allow READ access for anon users" ON equipment_schema.equipment_brand_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_brand_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_brand_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_team_id = equipment_brand_team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_brand_table;
CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_brand_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_team_id = equipment_brand_team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- equipment_schema.equipment_model_table
ALTER TABLE equipment_schema.equipment_model_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_model_table;
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_model_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_team_id = equipment_model_team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow READ access for anon users" ON equipment_schema.equipment_model_table;
CREATE POLICY "Allow READ access for anon users" ON equipment_schema.equipment_model_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_model_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_model_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_team_id = equipment_model_team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_model_table;
CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_model_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_team_id = equipment_model_team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- equipment_schema.equipment_component_category_table
ALTER TABLE equipment_schema.equipment_component_category_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_component_category_table;
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_component_category_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_team_id = equipment_component_category_team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow READ access for anon users" ON equipment_schema.equipment_component_category_table;
CREATE POLICY "Allow READ access for anon users" ON equipment_schema.equipment_component_category_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_component_category_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_component_category_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_team_id = equipment_component_category_team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_component_category_table;
CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_component_category_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_team_id = equipment_component_category_team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- equipment_schema.equipment_table
ALTER TABLE equipment_schema.equipment_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_table;
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_team_id = equipment_team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow READ access for anon users" ON equipment_schema.equipment_table;
CREATE POLICY "Allow READ access for anon users" ON equipment_schema.equipment_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_team_id = equipment_team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_table;
CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_team_id = equipment_team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- equipment_schema.equipment_description_table
ALTER TABLE equipment_schema.equipment_description_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_description_table;
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_description_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM equipment_schema.equipment_table
    INNER JOIN team_schema.team_table ON team_id = equipment_team_id
    INNER JOIN team_schema.team_member_table ON team_member_team_id = team_id
    WHERE equipment_id = equipment_description_equipment_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow READ access for anon users" ON equipment_schema.equipment_description_table;
CREATE POLICY "Allow READ access for anon users" ON equipment_schema.equipment_description_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_description_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_description_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM equipment_schema.equipment_table
    INNER JOIN team_schema.team_table ON team_id = equipment_team_id
    INNER JOIN team_schema.team_member_table ON team_member_team_id = team_id
    WHERE equipment_id = equipment_description_equipment_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_description_table;
CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_description_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM equipment_schema.equipment_table
    INNER JOIN team_schema.team_table ON team_id = equipment_team_id
    INNER JOIN team_schema.team_member_table ON team_member_team_id = team_id
    WHERE equipment_id = equipment_description_equipment_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- unit_of_measurement_schema.equipment_unit_of_measurement_table
ALTER TABLE unit_of_measurement_schema.equipment_unit_of_measurement_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON unit_of_measurement_schema.equipment_unit_of_measurement_table;
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON unit_of_measurement_schema.equipment_unit_of_measurement_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_team_id = equipment_unit_of_measurement_team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow READ access for anon users" ON unit_of_measurement_schema.equipment_unit_of_measurement_table;
CREATE POLICY "Allow READ access for anon users" ON unit_of_measurement_schema.equipment_unit_of_measurement_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON unit_of_measurement_schema.equipment_unit_of_measurement_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON unit_of_measurement_schema.equipment_unit_of_measurement_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_team_id = equipment_unit_of_measurement_team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON unit_of_measurement_schema.equipment_unit_of_measurement_table;
CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON unit_of_measurement_schema.equipment_unit_of_measurement_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_team_id = equipment_unit_of_measurement_team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- equipment_schema.equipment_general_name_table
ALTER TABLE equipment_schema.equipment_general_name_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_general_name_table;
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_general_name_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_team_id = equipment_general_name_team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow READ access for anon users" ON equipment_schema.equipment_general_name_table;
CREATE POLICY "Allow READ access for anon users" ON equipment_schema.equipment_general_name_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_general_name_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_general_name_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_team_id = equipment_general_name_team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_general_name_table;
CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_general_name_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_team_id = equipment_general_name_team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- equipment_schema.equipment_part_table
ALTER TABLE equipment_schema.equipment_part_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_part_table;
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_part_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM equipment_schema.equipment_table
    INNER JOIN team_schema.team_table ON team_id = equipment_team_id
    INNER JOIN team_schema.team_member_table ON team_member_team_id = team_id
    WHERE equipment_id = equipment_part_equipment_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow READ access for anon users" ON equipment_schema.equipment_part_table;
CREATE POLICY "Allow READ access for anon users" ON equipment_schema.equipment_part_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_part_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_part_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM equipment_schema.equipment_table
    INNER JOIN team_schema.team_table ON team_id = equipment_team_id
    INNER JOIN team_schema.team_member_table ON team_member_team_id = team_id
    WHERE equipment_id = equipment_part_equipment_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_part_table;
CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON equipment_schema.equipment_part_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM equipment_schema.equipment_table
    INNER JOIN team_schema.team_table ON team_id = equipment_team_id
    INNER JOIN team_schema.team_member_table ON team_member_team_id = team_id
    WHERE equipment_id = equipment_part_equipment_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- unit_of_measurement_schema.capacity_unit_of_measurement_table
ALTER TABLE unit_of_measurement_schema.capacity_unit_of_measurement_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON unit_of_measurement_schema.capacity_unit_of_measurement_table;
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON unit_of_measurement_schema.capacity_unit_of_measurement_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_team_id = capacity_unit_of_measurement_team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow READ access for anon users" ON unit_of_measurement_schema.capacity_unit_of_measurement_table;
CREATE POLICY "Allow READ access for anon users" ON unit_of_measurement_schema.capacity_unit_of_measurement_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON unit_of_measurement_schema.capacity_unit_of_measurement_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON unit_of_measurement_schema.capacity_unit_of_measurement_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_team_id = capacity_unit_of_measurement_team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON unit_of_measurement_schema.capacity_unit_of_measurement_table;
CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON unit_of_measurement_schema.capacity_unit_of_measurement_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_team_id = capacity_unit_of_measurement_team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- address_table
ALTER TABLE address_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CRUD for authenticated users" ON address_table;
CREATE POLICY "Allow CRUD for authenticated users" ON address_table
AS PERMISSIVE FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

--- jira_schema.jira_project_table
ALTER TABLE jira_schema.jira_project_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CRUD for authenticated users" ON jira_schema.jira_project_table;
CREATE POLICY "Allow CRUD for authenticated users" ON jira_schema.jira_project_table
AS PERMISSIVE FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- jira_schema.jira_formsly_project_table
ALTER TABLE jira_schema.jira_formsly_project_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow READ for anon users" ON jira_schema.jira_formsly_project_table;
CREATE POLICY "Allow READ for anon users" ON jira_schema.jira_formsly_project_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON jira_schema.jira_formsly_project_table;
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON jira_schema.jira_formsly_project_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  (
    SELECT team_project_team_id
    FROM team_schema.team_project_table
    WHERE team_project_table.team_project_id = formsly_project_id
  ) IN (
    SELECT team_member_team_id
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON jira_schema.jira_formsly_project_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON jira_schema.jira_formsly_project_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  (
    SELECT team_project_team_id
    FROM team_schema.team_project_table
    WHERE team_project_table.team_project_id = formsly_project_id
  ) IN (
    SELECT team_member_team_id
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- jira_schema.
ALTER TABLE jira_schema.jira_user_role_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CRUD for authenticated users" ON jira_schema.jira_user_role_table;
CREATE POLICY "Allow CRUD for authenticated users" ON jira_schema.jira_user_role_table
AS PERMISSIVE FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

--- JIRA_USER_ACCOUNT_TABLE
ALTER TABLE jira_schema.jira_user_account_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CRUD for authenticated users" ON jira_schema.jira_user_account_table;
CREATE POLICY "Allow CRUD for authenticated users" ON jira_schema.jira_user_account_table
AS PERMISSIVE FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

--- jira_schema.jira_project_user_table
ALTER TABLE jira_schema.jira_project_user_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow READ for anon users" ON jira_schema.jira_project_user_table;
CREATE POLICY "Allow READ for anon users" ON jira_schema.jira_project_user_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON jira_schema.jira_project_user_table;
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON jira_schema.jira_project_user_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  (
    SELECT team_project_team_id
    FROM team_schema.team_project_table
    WHERE team_project_table.team_project_id = jira_project_user_team_project_id
  ) IN (
    SELECT team_member_team_id
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON jira_schema.jira_project_user_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON jira_schema.jira_project_user_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  (
    SELECT team_project_team_id
    FROM team_schema.team_project_table
    WHERE team_project_table.team_project_id = jira_project_user_team_project_id
  ) IN (
    SELECT team_member_team_id
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON jira_schema.jira_project_user_table;
CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON jira_schema.jira_project_user_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  (
    SELECT team_project_team_id
    FROM team_schema.team_project_table
    WHERE team_project_table.team_project_id = jira_project_user_team_project_id
  ) IN (
    SELECT team_member_team_id
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- jira_schema.jira_item_category_table
ALTER TABLE jira_schema.jira_item_category_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CRUD for authenticated users" ON jira_schema.jira_item_category_table;
CREATE POLICY "Allow CRUD for authenticated users" ON jira_schema.jira_item_category_table
AS PERMISSIVE FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

--- jira_schema.jira_item_user_table
ALTER TABLE jira_schema.jira_item_user_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CRUD for authenticated users" ON jira_schema.jira_item_user_table;
CREATE POLICY "Allow CRUD for authenticated users" ON jira_schema.jira_item_user_table
AS PERMISSIVE FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

--- team_schema.team_department_table
ALTER TABLE team_schema.team_department_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow READ for anon users" ON team_schema.team_department_table;
CREATE POLICY "Allow READ for anon users" ON team_schema.team_department_table
AS PERMISSIVE FOR SELECT
USING (true);

--- jira_schema.jira_organization_table
ALTER TABLE jira_schema.jira_organization_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CRUD for authenticated users" ON jira_schema.jira_organization_table;
CREATE POLICY "Allow CRUD for authenticated users" ON jira_schema.jira_organization_table
AS PERMISSIVE FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

--- jira_organization_team_project_table
ALTER TABLE jira_schema.jira_organization_team_project_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow READ for anon users" ON jira_schema.jira_organization_team_project_table;
CREATE POLICY "Allow READ for anon users" ON jira_schema.jira_organization_team_project_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON jira_schema.jira_organization_team_project_table;
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON jira_schema.jira_organization_team_project_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  (
    SELECT team_project_team_id
    FROM team_schema.team_project_table
    WHERE team_project_table.team_project_id = jira_organization_team_project_project_id
  ) IN (
    SELECT team_member_team_id
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON jira_schema.jira_organization_team_project_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON jira_schema.jira_organization_team_project_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  (
    SELECT team_project_team_id
    FROM team_schema.team_project_table
    WHERE team_project_table.team_project_id = jira_organization_team_project_project_id
  ) IN (
    SELECT team_member_team_id
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON jira_schema.jira_organization_team_project_table;
CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON jira_schema.jira_organization_team_project_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  (
    SELECT team_project_team_id
    FROM team_schema.team_project_table
    WHERE team_project_table.team_project_id = jira_organization_team_project_project_id
  ) IN (
    SELECT team_member_team_id
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- lookup_schema.employee_job_title_table
ALTER TABLE lookup_schema.employee_job_title_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow READ for anon users" ON lookup_schema.employee_job_title_table;
CREATE POLICY "Allow READ for anon users" ON lookup_schema.employee_job_title_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON lookup_schema.employee_job_title_table;
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role"
ON lookup_schema.employee_job_title_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON lookup_schema.employee_job_title_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role"
ON lookup_schema.employee_job_title_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON lookup_schema.employee_job_title_table;
CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role"
ON lookup_schema.employee_job_title_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- lookup_schema.scic_employee_table
ALTER TABLE lookup_schema.scic_employee_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow READ for anon users" ON lookup_schema.scic_employee_table;
CREATE POLICY "Allow READ for anon users" ON lookup_schema.scic_employee_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON lookup_schema.scic_employee_table;
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role"
ON lookup_schema.scic_employee_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON lookup_schema.scic_employee_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role"
ON lookup_schema.scic_employee_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- form_schema.special_field_template_table
ALTER TABLE form_schema.special_field_template_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON form_schema.special_field_template_table;
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON form_schema.special_field_template_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE
      team_member_user_id = (SELECT auth.uid())
      AND team_member_role IN ('OWNER', 'ADMIN')
      AND team_member_team_id = 'a5a28977-6956-45c1-a624-b9e90911502e'
  )
);

DROP POLICY IF EXISTS "Allow READ for anon users" ON form_schema.special_field_template_table;
CREATE POLICY "Allow READ for anon users" ON form_schema.special_field_template_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON form_schema.special_field_template_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON form_schema.special_field_template_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE
      team_member_user_id = (SELECT auth.uid())
      AND team_member_role IN ('OWNER', 'ADMIN')
      AND team_member_team_id = 'a5a28977-6956-45c1-a624-b9e90911502e'
  )
);

--- item_schema.item_category_table
ALTER TABLE item_schema.item_category_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON item_schema.item_category_table;
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON item_schema.item_category_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  (
    SELECT team_member_team_id
    FROM form_schema.signer_table
    JOIN team_schema.team_member_table ON team_member_id = signer_team_member_id
    WHERE signer_id = item_category_signer_id
  ) IN (
    SELECT team_member_team_id
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow READ for anon users" ON item_schema.item_category_table;
CREATE POLICY "Allow READ for anon users" ON item_schema.item_category_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON item_schema.item_category_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON item_schema.item_category_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  (
    SELECT team_member_team_id
    FROM form_schema.signer_table
    JOIN team_schema.team_member_table ON team_member_id = signer_team_member_id
    WHERE signer_id = item_category_signer_id
  ) IN (
    SELECT team_member_team_id
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- lookup_schema.bank_list_table
ALTER TABLE lookup_schema.bank_list_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow READ for authenticated users" ON lookup_schema.bank_list_table;
CREATE POLICY "Allow READ for authenticated users" ON lookup_schema.bank_list_table
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

--- lookup_schema.currency_table
ALTER TABLE lookup_schema.currency_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow READ for authenticated users" ON lookup_schema.currency_table;
CREATE POLICY "Allow READ for authenticated users" ON lookup_schema.currency_table
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

--- lookup_schema.formsly_price_table
ALTER TABLE lookup_schema.formsly_price_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow READ for authenticated users" ON lookup_schema.formsly_price_table;
CREATE POLICY "Allow READ for authenticated users" ON lookup_schema.formsly_price_table
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

--- service_schema.service_scope_table
ALTER TABLE service_schema.service_scope_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON service_schema.service_scope_table;
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON service_schema.service_scope_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  (
    SELECT service_team_id
    FROM service_schema.service_table
    WHERE service_id = service_scope_service_id
  ) IN (
    SELECT team_member_team_id
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow READ for authenticated users" ON service_schema.service_scope_table;
CREATE POLICY "Allow READ for authenticated users" ON service_schema.service_scope_table
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON service_schema.service_scope_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON service_schema.service_scope_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  (
    SELECT service_team_id
    FROM service_schema.service_table
    WHERE service_id = service_scope_service_id
  ) IN (
    SELECT team_member_team_id
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- service_schema.service_scope_choice_table
ALTER TABLE service_schema.service_scope_choice_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON service_schema.service_scope_choice_table;
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON service_schema.service_scope_choice_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  (
    SELECT service_team_id
    FROM service_schema.service_scope_table
    JOIN service_schema.service_table ON service_id = service_scope_service_id
    WHERE service_scope_id = service_scope_choice_service_scope_id
  ) IN (
    SELECT team_member_team_id
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow READ for authenticated users" ON service_schema.service_scope_choice_table;
CREATE POLICY "Allow READ for authenticated users" ON service_schema.service_scope_choice_table
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON service_schema.service_scope_choice_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON service_schema.service_scope_choice_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  (
    SELECT service_team_id
    FROM service_schema.service_scope_table
    JOIN service_schema.service_table ON service_id = service_scope_service_id
    WHERE service_scope_id = service_scope_choice_service_scope_id
  ) IN (
    SELECT team_member_team_id
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- team_transaction_table
ALTER TABLE team_schema.team_transaction_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CRUD for authenticated users with OWNER role" ON team_schema.team_transaction_table;
CREATE POLICY "Allow CRUD for authenticated users with OWNER role" ON team_schema.team_transaction_table
AS PERMISSIVE FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE
      team_member_user_id = (SELECT auth.uid())
      AND team_member_role IN ('OWNER')
      AND team_member_team_id = team_transaction_team_id
  )
);

--- team_schema.team_key_table
ALTER TABLE team_schema.team_key_table ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow Read for anon users on team key table" ON team_schema.team_key_table;
CREATE POLICY "Allow Read for anon users on team key table" ON team_schema.team_key_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow INSERT for authenticated users with OWNER role" ON team_schema.team_key_table;
CREATE POLICY "Allow INSERT for authenticated users with OWNER role"
ON team_schema.team_key_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table tm
    JOIN team_schema.team_table t ON t.team_id = tm.team_member_team_id
    WHERE tm.team_member_user_id = (SELECT auth.uid())
    AND tm.team_member_role = 'OWNER'
  )
);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER role" ON team_schema.team_key_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER role"
ON team_schema.team_key_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table tm
    JOIN team_schema.team_table t ON t.team_id = tm.team_member_team_id
    WHERE tm.team_member_user_id = (SELECT auth.uid())
    AND tm.team_member_role = 'OWNER'
  )
);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER role" ON team_schema.team_key_table;
CREATE POLICY "Allow DELETE for authenticated users with OWNER role"
ON team_schema.team_key_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  (
    SELECT team_key_team_id
    FROM team_schema.team_key_table
    WHERE team_key_table.team_key_id = team_key_id
  ) IN (
    SELECT team_member_team_id
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER')
  )
);
ALTER TABLE team_schema.team_key_record_table ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow ALL for anon users on team key record table" ON team_schema.team_key_record_table;
CREATE POLICY "Allow ALL for anon users on team key record table" ON team_schema.team_key_record_table
AS PERMISSIVE FOR ALL
USING (true);

--- lookup_schema.position_table
ALTER TABLE lookup_schema.position_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow READ for anon users" ON lookup_schema.position_table;
CREATE POLICY "Allow READ for anon users" ON lookup_schema.position_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with specific team group" ON lookup_schema.position_table;
CREATE POLICY "Allow UPDATE for authenticated users with specific team group"
ON lookup_schema.position_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_schema.team_table
    JOIN team_schema.team_member_table ON team_member_team_id = team_id
    JOIN team_schema.team_group_table ON team_group_team_id = team_member_team_id
    WHERE position_team_id = team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_group_name IN ('HUMAN RESOURCES')
  )
);

DROP POLICY IF EXISTS "Allow INSERT for authenticated users with specific team group" ON lookup_schema.position_table;
CREATE POLICY "Allow INSERT for authenticated users with specific team group"
ON lookup_schema.position_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM team_schema.team_table
    JOIN team_schema.team_member_table ON team_member_team_id = team_id
    JOIN team_schema.team_group_table ON team_group_team_id = team_member_team_id
    WHERE position_team_id = team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_group_name IN ('HUMAN RESOURCES')
  )
);

--- lookup_schema.ad_owner_table
ALTER TABLE lookup_schema.ad_owner_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow READ for anon users" ON lookup_schema.ad_owner_table;
CREATE POLICY "Allow READ for anon users" ON lookup_schema.ad_owner_table
AS PERMISSIVE FOR SELECT
USING (true);

--- lookup_schema.ad_owner_request_table
ALTER TABLE lookup_schema.ad_owner_request_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow READ for anon users" ON lookup_schema.ad_owner_request_table;
CREATE POLICY "Allow READ for anon users" ON lookup_schema.ad_owner_request_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow CREATE for anon users" ON lookup_schema.ad_owner_request_table;
CREATE POLICY "Allow CREATE for anon users" ON lookup_schema.ad_owner_request_table
AS PERMISSIVE FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ for anon users" ON lookup_schema.ad_owner_request_table;
CREATE POLICY "Allow READ for anon users" ON lookup_schema.ad_owner_request_table
AS PERMISSIVE FOR SELECT
USING (true);

--- form_schema.requester_primary_signer_table
ALTER TABLE form_schema.requester_primary_signer_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow READ for anon users" ON form_schema.requester_primary_signer_table;
CREATE POLICY "Allow READ for anon users" ON form_schema.requester_primary_signer_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON form_schema.requester_primary_signer_table;
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role"
ON form_schema.requester_primary_signer_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON form_schema.requester_primary_signer_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role"
ON form_schema.requester_primary_signer_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON form_schema.requester_primary_signer_table;
CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role"
ON form_schema.requester_primary_signer_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- team_schema.team_membership_request_table
ALTER TABLE team_schema.team_membership_request_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow READ for anon users" ON team_schema.team_membership_request_table;
CREATE POLICY "Allow READ for anon users" ON team_schema.team_membership_request_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON team_schema.team_membership_request_table;
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role"
ON team_schema.team_membership_request_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK(true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON team_schema.team_membership_request_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role"
ON team_schema.team_membership_request_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow DELETE for request owners or members with OWNER or ADMIN role" ON team_schema.team_membership_request_table;
CREATE POLICY "Allow DELETE for request owners or members with OWNER or ADMIN role"
ON team_schema.team_membership_request_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  ) OR (
    team_membership_request_from_user_id = auth.uid()
  )
);

--- form_schema.questionnaire_table
ALTER TABLE form_schema.questionnaire_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON form_schema.questionnaire_table;
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON form_schema.questionnaire_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_team_id = questionnaire_team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow READ access for anon users" ON form_schema.questionnaire_table;
CREATE POLICY "Allow READ access for anon users" ON form_schema.questionnaire_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON form_schema.questionnaire_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON form_schema.questionnaire_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_team_id = questionnaire_team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON form_schema.questionnaire_table;
CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON form_schema.questionnaire_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_schema.team_member_table
    WHERE team_member_team_id = questionnaire_team_id
    AND team_member_user_id = (SELECT auth.uid())
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- form_schema.questionnaire_question_table
ALTER TABLE form_schema.questionnaire_question_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON form_schema.questionnaire_question_table;
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON form_schema.questionnaire_question_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM form_schema.questionnaire_table as qt
    JOIN team_schema.team_table as tt ON tt.team_id = qt.questionnaire_team_id
    JOIN team_schema.team_member_table as tm ON tm.team_member_team_id = tt.team_id
    WHERE qt.questionnaire_id = questionnaire_question_questionnaire_id
    AND tm.team_member_user_id = (SELECT auth.uid())
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow READ access for anon users" ON form_schema.questionnaire_question_table;
CREATE POLICY "Allow READ access for anon users" ON form_schema.questionnaire_question_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON form_schema.questionnaire_question_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON form_schema.questionnaire_question_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM form_schema.questionnaire_table as qt
    JOIN team_schema.team_table as tt ON tt.team_id = qt.questionnaire_team_id
    JOIN team_schema.team_member_table as tm ON tm.team_member_team_id = tt.team_id
    WHERE qt.questionnaire_id = questionnaire_question_questionnaire_id
    AND tm.team_member_user_id = (SELECT auth.uid())
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON form_schema.questionnaire_question_table;
CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON form_schema.questionnaire_question_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM form_schema.questionnaire_table as qt
    JOIN team_schema.team_table as tt ON tt.team_id = qt.questionnaire_team_id
    JOIN team_schema.team_member_table as tm ON tm.team_member_team_id = tt.team_id
    WHERE qt.questionnaire_id = questionnaire_question_questionnaire_id
    AND tm.team_member_user_id = (SELECT auth.uid())
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  )
);

---  form_schema.question_option_table
ALTER TABLE form_schema.question_option_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON form_schema.question_option_table;
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON form_schema.question_option_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM form_schema.questionnaire_question_table as qqt
    JOIN form_schema.questionnaire_table as qt ON qt.questionnaire_id = qqt.questionnaire_question_questionnaire_id
    JOIN team_schema.team_table as tt ON tt.team_id = qt.questionnaire_team_id
    JOIN team_schema.team_member_table as tm ON tm.team_member_team_id = tt.team_id
    WHERE qqt.questionnaire_question_id = '0033eafc-a7af-46e9-886c-66f59af8a003'
    AND tm.team_member_user_id = 'abc84276-1ca3-4b34-91f3-2aed10d557bf'
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow READ access for anon users" ON form_schema.question_option_table;
CREATE POLICY "Allow READ access for anon users" ON form_schema.question_option_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON form_schema.question_option_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON form_schema.question_option_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM form_schema.questionnaire_question_table as qqt
    JOIN form_schema.questionnaire_table as qt ON qt.questionnaire_id = qqt.questionnaire_question_questionnaire_id
    JOIN team_schema.team_table as tt ON tt.team_id = qt.questionnaire_team_id
    JOIN team_schema.team_member_table as tm ON tm.team_member_team_id = tt.team_id
    WHERE qqt.questionnaire_question_id = '0033eafc-a7af-46e9-886c-66f59af8a003'
    AND tm.team_member_user_id = 'abc84276-1ca3-4b34-91f3-2aed10d557bf'
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  )
);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON form_schema.question_option_table;
CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON form_schema.question_option_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM form_schema.questionnaire_question_table as qqt
    JOIN form_schema.questionnaire_table as qt ON qt.questionnaire_id = qqt.questionnaire_question_questionnaire_id
    JOIN team_schema.team_table as tt ON tt.team_id = qt.questionnaire_team_id
    JOIN team_schema.team_member_table as tm ON tm.team_member_team_id = tt.team_id
    WHERE qqt.questionnaire_question_id = '0033eafc-a7af-46e9-886c-66f59af8a003'
    AND tm.team_member_user_id = 'abc84276-1ca3-4b34-91f3-2aed10d557bf'
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- form_schema.correct_response_table
ALTER TABLE form_schema.correct_response_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON form_schema.correct_response_table;
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON form_schema.correct_response_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM form_schema.field_table as ft
    JOIN form_schema.section_table as st ON st.section_id = ft.field_section_id
    JOIN form_schema.form_table as fo ON fo.form_id = st.section_form_id
    JOIN team_schema.team_member_table as tm ON tm.team_member_id = fo.form_team_member_id
    WHERE ft.field_id = correct_response_field_id
      AND team_member_team_id IN (
        SELECT team_member_team_id
        FROM team_schema.team_member_table
        WHERE team_member_user_id = (SELECT auth.uid())
          AND team_member_role IN ('OWNER', 'ADMIN')
      )
  )
);

DROP POLICY IF EXISTS "Allow READ for anon users" ON form_schema.correct_response_table;
CREATE POLICY "Allow READ for anon users" ON form_schema.correct_response_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON form_schema.correct_response_table;
CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON form_schema.correct_response_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM form_schema.field_table as ft
    JOIN form_schema.section_table as st ON st.section_id = ft.field_section_id
    JOIN form_schema.form_table as fo ON fo.form_id = st.section_form_id
    JOIN team_schema.team_member_table as tm ON tm.team_member_id = fo.form_team_member_id
    WHERE ft.field_id = correct_response_field_id
      AND team_member_team_id IN (
        SELECT team_member_team_id
        FROM team_schema.team_member_table
        WHERE team_member_user_id = (SELECT auth.uid())
          AND team_member_role IN ('OWNER', 'ADMIN')
      )
  )
);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON form_schema.correct_response_table;
CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON form_schema.correct_response_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM form_schema.field_table as ft
    JOIN form_schema.section_table as st ON st.section_id = ft.field_section_id
    JOIN form_schema.form_table as fo ON fo.form_id = st.section_form_id
    JOIN team_schema.team_member_table as tm ON tm.team_member_id = fo.form_team_member_id
    WHERE ft.field_id = correct_response_field_id
      AND team_member_team_id IN (
        SELECT team_member_team_id
        FROM team_schema.team_member_table
        WHERE team_member_user_id = (SELECT auth.uid())
          AND team_member_role IN ('OWNER', 'ADMIN')
      )
  )
);

--- lookup_schema.query_table
ALTER TABLE lookup_schema.degree_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow READ for anon users" ON lookup_schema.degree_table;
CREATE POLICY "Allow READ for anon users" ON lookup_schema.degree_table
AS PERMISSIVE FOR SELECT
USING (true);

--- user_schema.user_sss_table
ALTER TABLE user_schema.user_sss_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE access for own user" ON user_schema.user_sss_table;
CREATE POLICY "Allow CREATE access for own user" ON user_schema.user_sss_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (user_sss_user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Allow READ for authenticated users" ON user_schema.user_sss_table;
CREATE POLICY "Allow READ for authenticated users" ON user_schema.user_sss_table
AS PERMISSIVE FOR SELECT
TO authenticated
USING (user_sss_user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Allow UPDATE for own user" ON user_schema.user_sss_table;
CREATE POLICY "Allow UPDATE for own user" ON user_schema.user_sss_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING(true);

--- user_schema.email_resend_table
ALTER TABLE user_schema.email_resend_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE access for anon users" ON user_schema.email_resend_table;
CREATE POLICY "Allow CREATE access for anon users" ON user_schema.email_resend_table
AS PERMISSIVE FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ for anon users" ON user_schema.email_resend_table;
CREATE POLICY "Allow READ for anon users" ON user_schema.email_resend_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for anon users" ON user_schema.email_resend_table;
CREATE POLICY "Allow UPDATE for anon users" ON user_schema.email_resend_table
AS PERMISSIVE FOR UPDATE
USING (true);

--- hr_schema.background_check_table
ALTER TABLE hr_schema.background_check_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE access for authenticated users" ON hr_schema.background_check_table;
CREATE POLICY "Allow CREATE access for authenticated users" ON hr_schema.background_check_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ for authenticated users" ON hr_schema.background_check_table;
CREATE POLICY "Allow READ for authenticated users" ON hr_schema.background_check_table
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON hr_schema.background_check_table;
CREATE POLICY "Allow UPDATE for authenticated users" ON hr_schema.background_check_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (true);

--- hr_schema.hr_phone_interview_table
ALTER TABLE hr_schema.hr_phone_interview_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE access for authenticated users" ON hr_schema.hr_phone_interview_table;
CREATE POLICY "Allow CREATE access for authenticated users" ON hr_schema.hr_phone_interview_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ for authenticated users" ON hr_schema.hr_phone_interview_table;
CREATE POLICY "Allow READ for authenticated users" ON hr_schema.hr_phone_interview_table
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON hr_schema.hr_phone_interview_table;
CREATE POLICY "Allow UPDATE for authenticated users" ON hr_schema.hr_phone_interview_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (true);

--- hr_schema.hr_project_table
ALTER TABLE hr_schema.hr_project_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE access for authenticated users" ON hr_schema.hr_project_table;
CREATE POLICY "Allow CREATE access for authenticated users" ON hr_schema.hr_project_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ for authenticated users" ON hr_schema.hr_project_table;
CREATE POLICY "Allow READ for authenticated users" ON hr_schema.hr_project_table
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON hr_schema.hr_project_table;
CREATE POLICY "Allow UPDATE for authenticated users" ON hr_schema.hr_project_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (true);

--- hr_schema.interview_online_meeting_table
ALTER TABLE hr_schema.interview_online_meeting_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE access for authenticated users" ON hr_schema.interview_online_meeting_table;
CREATE POLICY "Allow CREATE access for authenticated users" ON hr_schema.interview_online_meeting_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ for authenticated users" ON hr_schema.interview_online_meeting_table;
CREATE POLICY "Allow READ for authenticated users" ON hr_schema.interview_online_meeting_table
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON hr_schema.interview_online_meeting_table;
CREATE POLICY "Allow UPDATE for authenticated users" ON hr_schema.interview_online_meeting_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (true);

--- hr_schema.job_offer_reason_for_rejection_table
ALTER TABLE hr_schema.job_offer_reason_for_rejection_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE access for authenticated users" ON hr_schema.job_offer_reason_for_rejection_table;
CREATE POLICY "Allow CREATE access for authenticated users" ON hr_schema.job_offer_reason_for_rejection_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ for authenticated users" ON hr_schema.job_offer_reason_for_rejection_table;
CREATE POLICY "Allow READ for authenticated users" ON hr_schema.job_offer_reason_for_rejection_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON hr_schema.job_offer_reason_for_rejection_table;
CREATE POLICY "Allow UPDATE for authenticated users" ON hr_schema.job_offer_reason_for_rejection_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (true);

--- hr_schema.job_offer_table
ALTER TABLE hr_schema.job_offer_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE access for authenticated users" ON hr_schema.job_offer_table;
CREATE POLICY "Allow CREATE access for authenticated users" ON hr_schema.job_offer_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ for authenticated users" ON hr_schema.job_offer_table;
CREATE POLICY "Allow READ for authenticated users" ON hr_schema.job_offer_table
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON hr_schema.job_offer_table;
CREATE POLICY "Allow UPDATE for authenticated users" ON hr_schema.job_offer_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (true);

--- hr_schema.practical_test_position_table
ALTER TABLE hr_schema.practical_test_position_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE access for authenticated users" ON hr_schema.practical_test_position_table;
CREATE POLICY "Allow CREATE access for authenticated users" ON hr_schema.practical_test_position_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ for authenticated users" ON hr_schema.practical_test_position_table;
CREATE POLICY "Allow READ for authenticated users" ON hr_schema.practical_test_position_table
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON hr_schema.practical_test_position_table;
CREATE POLICY "Allow UPDATE for authenticated users" ON hr_schema.practical_test_position_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users" ON hr_schema.practical_test_position_table;
CREATE POLICY "Allow DELETE for authenticated users" ON hr_schema.practical_test_position_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (true);

--- hr_schema.hr_preferred_position_table
ALTER TABLE hr_schema.hr_preferred_position_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE access for authenticated users" ON hr_schema.hr_preferred_position_table;
CREATE POLICY "Allow CREATE access for authenticated users" ON hr_schema.hr_preferred_position_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ for authenticated users" ON hr_schema.hr_preferred_position_table;
CREATE POLICY "Allow READ for authenticated users" ON hr_schema.hr_preferred_position_table
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON hr_schema.hr_preferred_position_table;
CREATE POLICY "Allow UPDATE for authenticated users" ON hr_schema.hr_preferred_position_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow DELETE for authenticated users" ON hr_schema.hr_preferred_position_table;
CREATE POLICY "Allow DELETE for authenticated users" ON hr_schema.hr_preferred_position_table
AS PERMISSIVE FOR DELETE
TO authenticated
USING (true);

--- hr_schema.practical_test_question_table
ALTER TABLE hr_schema.practical_test_question_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE access for authenticated users" ON hr_schema.practical_test_question_table;
CREATE POLICY "Allow CREATE access for authenticated users" ON hr_schema.practical_test_question_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ for authenticated users" ON hr_schema.practical_test_question_table;
CREATE POLICY "Allow READ for authenticated users" ON hr_schema.practical_test_question_table
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON hr_schema.practical_test_question_table;
CREATE POLICY "Allow UPDATE for authenticated users" ON hr_schema.practical_test_question_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (true);

--- hr_schema.practical_test_table
ALTER TABLE hr_schema.practical_test_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE access for authenticated users" ON hr_schema.practical_test_table;
CREATE POLICY "Allow CREATE access for authenticated users" ON hr_schema.practical_test_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ for authenticated users" ON hr_schema.practical_test_table;
CREATE POLICY "Allow READ for authenticated users" ON hr_schema.practical_test_table
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON hr_schema.practical_test_table;
CREATE POLICY "Allow UPDATE for authenticated users" ON hr_schema.practical_test_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (true);

--- hr_schema.technical_interview_table
ALTER TABLE hr_schema.technical_interview_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE access for authenticated users" ON hr_schema.technical_interview_table;
CREATE POLICY "Allow CREATE access for authenticated users" ON hr_schema.technical_interview_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ for authenticated users" ON hr_schema.technical_interview_table;
CREATE POLICY "Allow READ for authenticated users" ON hr_schema.technical_interview_table
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON hr_schema.technical_interview_table;
CREATE POLICY "Allow UPDATE for authenticated users" ON hr_schema.technical_interview_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (true);

--- hr_schema.trade_test_table
ALTER TABLE hr_schema.trade_test_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE access for authenticated users" ON hr_schema.trade_test_table;
CREATE POLICY "Allow CREATE access for authenticated users" ON hr_schema.trade_test_table
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ for authenticated users" ON hr_schema.trade_test_table;
CREATE POLICY "Allow READ for authenticated users" ON hr_schema.trade_test_table
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON hr_schema.trade_test_table;
CREATE POLICY "Allow UPDATE for authenticated users" ON hr_schema.trade_test_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (true);

--- hr_schema.recruitment_table
ALTER TABLE hr_schema.recruitment_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE access for anon users" ON hr_schema.recruitment_table;
CREATE POLICY "Allow CREATE access for anon users" ON hr_schema.recruitment_table
AS PERMISSIVE FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ for authenticated users" ON hr_schema.recruitment_table;
CREATE POLICY "Allow READ for authenticated users" ON hr_schema.recruitment_table
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON hr_schema.recruitment_table;
CREATE POLICY "Allow UPDATE for authenticated users" ON hr_schema.recruitment_table
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (true);

--- hr_schema.request_connection_table
ALTER TABLE hr_schema.request_connection_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE access for anon users" ON hr_schema.request_connection_table;
CREATE POLICY "Allow CREATE access for anon users" ON hr_schema.request_connection_table
AS PERMISSIVE FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ for authenticated users" ON hr_schema.request_connection_table;
CREATE POLICY "Allow READ for authenticated users" ON hr_schema.request_connection_table
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for anon users" ON hr_schema.request_connection_table;
CREATE POLICY "Allow UPDATE for anon users" ON hr_schema.request_connection_table
AS PERMISSIVE FOR UPDATE
USING (true);

--- error_table
ALTER TABLE error_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE access for anon users" ON error_table;
CREATE POLICY "Allow CREATE access for anon users" ON error_table
AS PERMISSIVE FOR INSERT
WITH CHECK (true);

--- request_schema.request_score_table
ALTER TABLE request_schema.request_score_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE access for anon users" ON request_schema.request_score_table;
CREATE POLICY "Allow CREATE access for anon users" ON request_schema.request_score_table
AS PERMISSIVE FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ for authenticated users" ON request_schema.request_score_table;
CREATE POLICY "Allow READ for authenticated users" ON request_schema.request_score_table
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

--- hr_schema.application_information_additional_details_table
ALTER TABLE hr_schema.application_information_additional_details_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE access for anon users" ON hr_schema.application_information_additional_details_table;
CREATE POLICY "Allow CREATE access for anon users" ON hr_schema.application_information_additional_details_table
AS PERMISSIVE FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow READ for anon users" ON hr_schema.application_information_additional_details_table;
CREATE POLICY "Allow READ for anon users" ON hr_schema.application_information_additional_details_table
AS PERMISSIVE FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow UPDATE for anon users" ON hr_schema.application_information_additional_details_table;;
CREATE POLICY "Allow UPDATE for anon users" ON hr_schema.application_information_additional_details_table
AS PERMISSIVE FOR UPDATE
USING (true);

----- END: POLICIES

----- START: SCHEDULED FUNCTIONS

SELECT
  cron.schedule(
    'invoke-function-every-day',
    '59 23 * * *',
    $$
    SELECT
      net.http_post(
        url:='https://xwsbaxmttvxkvorpabim.supabase.co/functions/v1/handle-missed-schedule',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3c2JheG10dHZ4a3ZvcnBhYmltIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODk2NjMzNTcsImV4cCI6MjAwNTIzOTM1N30.jzWunPK46SRY8r7CaqMIDD22AljvOqRwLP6CCrzAbtA"}'::jsonb,
        body:=concat('{"time": "', NOW(), '"}')::jsonb
      ) AS request_id;
    $$
  );

----- END: SCHEDULED FUNCTIONS

----- START: INDEXES

CREATE INDEX request_form_id_idx ON request_schema.request_table(request_form_id);

CREATE INDEX team_member_team_id_idx ON team_schema.team_member_table(team_member_team_id);

CREATE INDEX request_is_disabled_idx ON request_schema.request_table(request_is_disabled);

CREATE INDEX form_is_disabled_public_idx ON form_schema.form_table(form_is_disabled, form_is_public_form);

CREATE INDEX request_team_member_id_idx ON request_schema.request_table(request_team_member_id);

CREATE INDEX request_date_created_idx ON request_schema.request_table(request_date_created);

CREATE INDEX request_response_field_id_request_response_request_id_idx
ON request_schema.request_response_table (request_response_field_id, request_response_request_id);

CREATE INDEX request_response_request_id_idx
ON request_schema.request_response_table (request_response_request_id);

CREATE INDEX request_response_request_response_field_id_idx
ON request_schema.request_response_table (SUBSTRING(request_response FROM 1 FOR 255), request_response_field_id);

CREATE INDEX comment_team_member_id_comment_request_idx
ON request_schema.comment_table (comment_team_member_id, comment_request_id);

CREATE INDEX notification_user_id_notification_app_notification_team_id_idx
ON public.notification_table (notification_user_id, notification_app, notification_team_id);

CREATE INDEX team_member_user_id_idx
ON team_schema.team_member_table (team_member_user_id);

CREATE INDEX item_is_disabled_item_is_available_item_team_id_idx
ON item_schema.item_table (item_is_disabled, item_is_available, item_team_id);

CREATE INDEX item_description_item_id_item_description_is_disabled_item_description_is_available_idx
ON item_schema.item_description_table (item_description_item_id, item_description_is_disabled, item_description_is_available);

CREATE INDEX item_description_field_item_description_id_item_description_field_is_disabled_item_description_field_is_available_idx
ON item_schema.item_description_field_table (item_description_field_item_description_id, item_description_field_is_disabled, item_description_field_is_available);

CREATE INDEX request_signer_signer_id_request_signer_request_id_request_signer_status_idx
ON request_schema.request_signer_table (request_signer_signer_id, request_signer_request_id, request_signer_status);

CREATE INDEX request_signer_request_id_idx
ON request_schema.request_signer_table (request_signer_request_id);

----- END: INDEXES

----- START: VIEWS

CREATE VIEW distinct_division_view WITH (SECURITY_INVOKER = ON) AS SELECT DISTINCT csi_code_division_id, csi_code_division_description FROM lookup_schema.csi_code_table;
CREATE VIEW request_view WITH (SECURITY_INVOKER = ON) AS SELECT *, CONCAT(request_formsly_id_prefix, '-', request_formsly_id_serial) AS request_formsly_id FROM request_schema.request_table;
CREATE VIEW equipment_schema.equipment_description_view WITH (SECURITY_INVOKER = ON) AS
SELECT
  equipment_description_table.*,
  CASE
      WHEN equipment_description_is_rental = true
      THEN CONCAT('REN-', equipment_name_shorthand, '-', equipment_description_property_number)
      ELSE CONCAT(equipment_name_shorthand, '-', equipment_description_property_number)
  END AS equipment_description_property_number_with_prefix
FROM
    equipment_schema.equipment_description_table
INNER JOIN
  equipment_schema.equipment_table
ON
  equipment_id = equipment_description_equipment_id;

----- END: VIEWS

----- START: SUBSCRIPTIONS

DROP PUBLICATION if exists supabase_realtime;

CREATE PUBLICATION supabase_realtime;
COMMIT;

ALTER PUBLICATION supabase_realtime ADD TABLE request_schema.request_table, request_schema.request_signer_table, request_schema.comment_table, notification_table, team_schema.team_member_table, user_schema.invitation_table, team_schema.team_project_table, team_schema.team_group_table, ticket_schema.ticket_comment_table, ticket_schema.ticket_table, team_schema.team_table;

----- END: SUBSCRIPTIONS

----- START: PRIVILEGES

GRANT ALL ON ALL TABLES IN SCHEMA public TO PUBLIC;
GRANT ALL ON ALL TABLES IN SCHEMA public TO POSTGRES;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

GRANT ALL ON ALL TABLES IN SCHEMA user_schema TO PUBLIC;
GRANT ALL ON ALL TABLES IN SCHEMA user_schema TO POSTGRES;
GRANT ALL ON SCHEMA user_schema TO postgres;
GRANT ALL ON SCHEMA user_schema TO public;

GRANT ALL ON ALL TABLES IN SCHEMA history_schema TO PUBLIC;
GRANT ALL ON ALL TABLES IN SCHEMA history_schema TO POSTGRES;
GRANT ALL ON SCHEMA history_schema TO postgres;
GRANT ALL ON SCHEMA history_schema TO public;

GRANT ALL ON ALL TABLES IN SCHEMA service_schema TO PUBLIC;
GRANT ALL ON ALL TABLES IN SCHEMA service_schema TO POSTGRES;
GRANT ALL ON SCHEMA service_schema TO postgres;
GRANT ALL ON SCHEMA service_schema TO public;

GRANT ALL ON ALL TABLES IN SCHEMA unit_of_measurement_schema TO PUBLIC;
GRANT ALL ON ALL TABLES IN SCHEMA unit_of_measurement_schema TO POSTGRES;
GRANT ALL ON SCHEMA unit_of_measurement_schema TO postgres;
GRANT ALL ON SCHEMA unit_of_measurement_schema TO public;

GRANT ALL ON ALL TABLES IN SCHEMA item_schema TO PUBLIC;
GRANT ALL ON ALL TABLES IN SCHEMA item_schema TO POSTGRES;
GRANT ALL ON SCHEMA item_schema TO postgres;
GRANT ALL ON SCHEMA item_schema TO public;

GRANT ALL ON ALL TABLES IN SCHEMA other_expenses_schema TO PUBLIC;
GRANT ALL ON ALL TABLES IN SCHEMA other_expenses_schema TO POSTGRES;
GRANT ALL ON SCHEMA other_expenses_schema TO postgres;
GRANT ALL ON SCHEMA other_expenses_schema TO public;

GRANT ALL ON ALL TABLES IN SCHEMA equipment_schema TO PUBLIC;
GRANT ALL ON ALL TABLES IN SCHEMA equipment_schema TO POSTGRES;
GRANT ALL ON SCHEMA equipment_schema TO postgres;
GRANT ALL ON SCHEMA equipment_schema TO public;

GRANT ALL ON ALL TABLES IN SCHEMA lookup_schema TO PUBLIC;
GRANT ALL ON ALL TABLES IN SCHEMA lookup_schema TO POSTGRES;
GRANT ALL ON SCHEMA lookup_schema TO postgres;
GRANT ALL ON SCHEMA lookup_schema TO public;

GRANT ALL ON ALL TABLES IN SCHEMA jira_schema TO PUBLIC;
GRANT ALL ON ALL TABLES IN SCHEMA jira_schema TO POSTGRES;
GRANT ALL ON SCHEMA jira_schema TO postgres;
GRANT ALL ON SCHEMA jira_schema TO public;

GRANT ALL ON ALL TABLES IN SCHEMA memo_schema TO PUBLIC;
GRANT ALL ON ALL TABLES IN SCHEMA memo_schema TO POSTGRES;
GRANT ALL ON SCHEMA memo_schema TO postgres;
GRANT ALL ON SCHEMA memo_schema TO public;

GRANT ALL ON ALL TABLES IN SCHEMA ticket_schema TO PUBLIC;
GRANT ALL ON ALL TABLES IN SCHEMA ticket_schema TO POSTGRES;
GRANT ALL ON SCHEMA ticket_schema TO postgres;
GRANT ALL ON SCHEMA ticket_schema TO public;

GRANT ALL ON ALL TABLES IN SCHEMA request_schema TO PUBLIC;
GRANT ALL ON ALL TABLES IN SCHEMA request_schema TO POSTGRES;
GRANT ALL ON SCHEMA request_schema TO postgres;
GRANT ALL ON SCHEMA request_schema TO public;
GRANT USAGE, SELECT ON SEQUENCE formsly_id_seq TO PUBLIC, POSTGRES;

GRANT ALL ON ALL TABLES IN SCHEMA form_schema TO PUBLIC;
GRANT ALL ON ALL TABLES IN SCHEMA form_schema TO POSTGRES;
GRANT ALL ON SCHEMA form_schema TO postgres;
GRANT ALL ON SCHEMA form_schema TO public;

GRANT ALL ON ALL TABLES IN SCHEMA team_schema TO PUBLIC;
GRANT ALL ON ALL TABLES IN SCHEMA team_schema TO POSTGRES;
GRANT ALL ON SCHEMA team_schema TO postgres;
GRANT ALL ON SCHEMA team_schema TO public;

GRANT ALL ON ALL TABLES IN SCHEMA hr_schema TO PUBLIC;
GRANT ALL ON ALL TABLES IN SCHEMA hr_schema TO POSTGRES;
GRANT ALL ON SCHEMA hr_schema TO postgres;
GRANT ALL ON SCHEMA hr_schema TO public;

----- END: PRIVILEGES
