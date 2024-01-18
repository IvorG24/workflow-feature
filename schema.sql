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
INSERT INTO storage.buckets (id, name) VALUES ('MEMO_ATTACHMENTS', 'MEMO_ATTACHMENTS');
INSERT INTO storage.buckets (id, name) VALUES ('TEAM_PROJECT_ATTACHMENTS', 'TEAM_PROJECT_ATTACHMENTS');

UPDATE storage.buckets SET public = true;

---------- Start: TABLES

-- Start: Attachments
CREATE TABLE attachment_table (
    attachment_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
    attachment_name VARCHAR(4000) NOT NULL,
    attachment_value VARCHAR(4000) NOT NULL,
    attachment_bucket VARCHAR(4000) NOT NULL,
    attachment_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    attachment_is_disabled BOOLEAN DEFAULT FALSE NOT NULL
);
-- End: Attachments

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

    user_signature_attachment_id UUID REFERENCES attachment_table(attachment_id)
);
CREATE TABLE team_table (
  team_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  team_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  team_name VARCHAR(4000) NOT NULL,
  team_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
  team_is_request_signature_required BOOLEAN DEFAULT FALSE NOT NULL,
  team_logo VARCHAR(4000),
  
  team_user_id UUID REFERENCES user_table(user_id) NOT NULL
);
CREATE TABLE team_member_table(
  team_member_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  team_member_role VARCHAR(4000) DEFAULT 'MEMBER' NOT NULL,
  team_member_date_created DATE DEFAULT NOW() NOT NULL,
  team_member_is_disabled BOOL DEFAULT FALSE NOT NULL,

  team_member_user_id UUID REFERENCES user_table(user_id) NOT NULL,
  team_member_team_id UUID REFERENCES team_table(team_id) NOT NULL,
  UNIQUE (team_member_team_id, team_member_user_id)
);
CREATE TABLE team_group_table(
  team_group_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  team_group_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  team_group_name VARCHAR(4000) NOT NULL,
  team_group_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,

  team_group_team_id UUID REFERENCES team_table(team_id) NOT NULL
);
CREATE TABLE team_project_table(
  team_project_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  team_project_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  team_project_name VARCHAR(4000) NOT NULL,
  team_project_code VARCHAR(4000) NOT NULL,
  team_project_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,

  team_project_site_map_attachment_id UUID REFERENCES attachment_table(attachment_id),
  team_project_boq_attachment_id UUID REFERENCES attachment_table(attachment_id),
  team_project_team_id UUID REFERENCES team_table(team_id) NOT NULL
);
CREATE TABLE team_group_member_table(
  team_group_member_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  team_member_id UUID REFERENCES team_member_table(team_member_id) ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,
  team_group_id UUID REFERENCES team_group_table(team_group_id) ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,

  UNIQUE(team_group_id, team_member_id) 
);
CREATE TABLE team_project_member_table(
  team_project_member_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  team_member_id UUID REFERENCES team_member_table(team_member_id) ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,
  team_project_id UUID REFERENCES team_project_table(team_project_id) ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,
  
  UNIQUE(team_project_id, team_member_id) 
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

  notification_team_id UUID REFERENCES team_table(team_id),
  notification_user_id UUID REFERENCES user_table(user_id) NOT NULL
);
CREATE TABLE invitation_table (
  invitation_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  invitation_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  invitation_to_email VARCHAR(4000) NOT NULL,
  invitation_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
  invitation_status VARCHAR(4000) DEFAULT 'PENDING' NOT NULL,

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
  form_is_formsly_form BOOLEAN DEFAULT FALSE NOT NULL,
  form_app VARCHAR(4000) NOT NULL,
  form_is_for_every_member BOOLEAN DEFAULT TRUE NOT NULL,
  form_type VARCHAR(4000),
  form_sub_type VARCHAR(4000),

  form_team_member_id UUID REFERENCES team_member_table(team_member_id) NOT NULL
);
CREATE TABLE signer_table (
  signer_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  signer_is_primary_signer BOOLEAN DEFAULT FALSE NOT NULL,
  signer_action VARCHAR(4000) NOT NULL,
  signer_order INT NOT NULL,
  signer_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,

  signer_form_id UUID REFERENCES form_table(form_id) NOT NULL,
  signer_team_member_id UUID REFERENCES team_member_table(team_member_id) NOT NULL,
  signer_team_project_id UUID REFERENCES team_project_table(team_project_id)
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
  field_is_read_only BOOLEAN DEFAULT FALSE NOT NULL,

  field_section_id UUID REFERENCES section_table(section_id) NOT NULL
);
CREATE TABLE option_table (
  option_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  option_value VARCHAR(4000) NOT NULL,
  option_order INT NOT NULL,

  option_field_id UUID REFERENCES field_table(field_id) NOT NULL
);
CREATE TABLE form_team_group_table(
  form_team_group_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  form_id UUID REFERENCES form_table(form_id) ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,
  team_group_id UUID REFERENCES team_group_table(team_group_id) ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,

  UNIQUE(form_id, team_group_id) 
);
-- End: Form

-- Start: Request
CREATE TABLE request_table(
  request_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  request_formsly_id_prefix VARCHAR(4000),
  request_formsly_id_serial VARCHAR(4000),
  request_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  request_status_date_updated TIMESTAMPTZ,
  request_status VARCHAR(4000) DEFAULT 'PENDING' NOT NULL,
  request_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
  request_jira_id VARCHAR(4000),
  request_jira_link VARCHAR(4000),
  request_otp_id VARCHAR(4000),

  request_team_member_id UUID REFERENCES team_member_table(team_member_id),
  request_form_id UUID REFERENCES form_table(form_id) NOT NULL,
  request_project_id UUID REFERENCES team_project_table(team_project_id)
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
  request_signer_status_date_updated TIMESTAMPTZ,

  request_signer_request_id UUID REFERENCES request_table(request_id) NOT NULL,
  request_signer_signer_id UUID REFERENCES signer_table(signer_id) NOT NULL
);
-- End: Request

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

-- Start: Requisition Form
CREATE TABLE item_table(
  item_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  item_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  item_general_name VARCHAR(4000) NOT NULL,
  item_unit VARCHAR(4000) NOT NULL,
  item_is_available BOOLEAN DEFAULT TRUE NOT NULL,
  item_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
  item_gl_account VARCHAR(4000) NOT NULL,

  item_team_id UUID REFERENCES team_table(team_id) NOT NULL,
  item_encoder_team_member_id UUID REFERENCES team_member_table(team_member_id)
);

CREATE TABLE item_division_table(
  item_division_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  item_division_value VARCHAR(4000) NOT NULL,

  item_division_item_id UUID REFERENCES item_table(item_id) NOT NULL
);

CREATE TABLE item_description_table(
  item_description_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  item_description_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  item_description_label VARCHAR(4000) NOT NULL,
  item_description_is_available BOOLEAN DEFAULT TRUE NOT NULL,
  item_description_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
  item_description_is_with_uom BOOLEAN DEFAULT FALSE NOT NULL,
  item_description_order INT NOT NULL,

  item_description_field_id UUID REFERENCES field_table(field_id) ON DELETE CASCADE NOT NULL,
  item_description_item_id UUID REFERENCES item_table(item_id) ON DELETE CASCADE NOT NULL
);

CREATE TABLE item_description_field_table(
  item_description_field_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  item_description_field_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  item_description_field_value VARCHAR(4000) NOT NULL,
  item_description_field_is_available BOOLEAN DEFAULT TRUE NOT NULL,
  item_description_field_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,

  item_description_field_item_description_id UUID REFERENCES item_description_table(item_description_id) ON DELETE CASCADE NOT NULL,
  item_description_field_encoder_team_member_id UUID REFERENCES team_member_table(team_member_id)
);

-- End: Requisition Form

-- Start: Quotation Form

CREATE TABLE supplier_table(
  supplier_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  supplier_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  supplier VARCHAR(4000) NOT NULL,
  supplier_is_available BOOLEAN DEFAULT TRUE NOT NULL,
  supplier_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
  
  supplier_encoder_team_member_id UUID REFERENCES team_member_table(team_member_id),
  supplier_team_id UUID REFERENCES team_table(team_id) NOT NULL
);

-- End: Quotation Form

-- Start: Subcon Form

CREATE TABLE service_table(
  service_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  service_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  service_is_available BOOLEAN DEFAULT TRUE NOT NULL,
  service_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
  service_name VARCHAR(4000) NOT NULL,

  service_team_id UUID REFERENCES team_table(team_id) ON DELETE CASCADE NOT NULL
);

CREATE TABLE service_scope_table(
  service_scope_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  service_scope_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  service_scope_is_available BOOLEAN DEFAULT TRUE NOT NULL,
  service_scope_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
  service_scope_name VARCHAR(4000) NOT NULL,
  service_scope_type VARCHAR(4000) NOT NULL,
  service_scope_is_with_other BOOLEAN NOT NULL,

  service_scope_field_id UUID REFERENCES field_table(field_id) ON DELETE CASCADE NOT NULL,
  service_scope_service_id UUID REFERENCES service_table(service_id) ON DELETE CASCADE NOT NULL
);

CREATE TABLE service_scope_choice_table(
  service_scope_choice_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  service_scope_choice_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  service_scope_choice_is_available BOOLEAN DEFAULT TRUE NOT NULL,
  service_scope_choice_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
  service_scope_choice_name VARCHAR(4000) NOT NULL,

  service_scope_choice_service_scope_id UUID REFERENCES service_scope_table(service_scope_id) ON DELETE CASCADE NOT NULL
);

-- End: Subcon Form

CREATE TABLE csi_code_table(
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

-- Start: Ticket

CREATE TABLE ticket_table(
  ticket_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  ticket_title VARCHAR(4000) NOT NULL,
  ticket_description VARCHAR(4000) NOT NULL,
  ticket_category VARCHAR(4000) NOT NULL,
  ticket_status VARCHAR(4000) DEFAULT 'PENDING' NOT NULL,
  ticket_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  ticket_status_date_updated TIMESTAMPTZ,
  
  ticket_requester_team_member_id UUID REFERENCES team_member_table(team_member_id) NOT NULL,
  ticket_approver_team_member_id UUID REFERENCES team_member_table(team_member_id)
);

-- END: Ticket

-- Start: Ticket comment

CREATE TABLE ticket_comment_table(
  ticket_comment_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  ticket_comment_content VARCHAR(4000) NOT NULL,
  ticket_comment_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
  ticket_comment_is_edited BOOLEAN DEFAULT FALSE NOT NULL,
  ticket_comment_type VARCHAR(4000) NOT NULL,
  ticket_comment_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  ticket_comment_last_updated TIMESTAMPTZ,

  ticket_comment_ticket_id UUID REFERENCES ticket_table(ticket_id) NOT NULL,
  ticket_comment_team_member_id UUID REFERENCES team_member_table(team_member_id) NOT NULL
);

-- END: Ticket comment

-- Start: Special Approver

CREATE TABLE special_approver_table(
  special_approver_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,

  special_approver_signer_id UUID REFERENCES signer_table(signer_id) NOT NULL
);

-- END: Special Approver

-- Start: Item Description Field UOM
CREATE TABLE item_description_field_uom_table(
  item_description_field_uom_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  item_description_field_uom VARCHAR(4000) NOT NULL,
  item_description_field_uom_item_description_field_id UUID REFERENCES item_description_field_table(item_description_field_id) ON DELETE CASCADE NOT NULL
);
-- END: Item Description Field UOM

-- Start: Special approver item table

CREATE TABLE special_approver_item_table(
  special_approver_item_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  special_approver_item_value VARCHAR(4000) NOT NULL,
  
  special_approver_item_special_approver_id UUID REFERENCES special_approver_table(special_approver_id) ON DELETE CASCADE NOT NULL
);

-- END: Special approver item table

-- Start: User employee number table

CREATE TABLE user_employee_number_table (
    user_employee_number_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
    user_employee_number_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    user_employee_number_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
    user_employee_number VARCHAR(4000) NOT NULL,

    user_employee_number_user_id UUID REFERENCES user_table(user_id)
);

-- END: User employee number table

-- Start: User onboard table

CREATE TABLE user_onboard_table(
  user_onboard_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  user_onboard_name VARCHAR(4000) NOT NULL,
  user_onboard_score INT NOT NULL,
  user_onboard_top_score INT NOT NULL,

  user_onboard_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  user_onboard_user_id UUID REFERENCES user_table(user_id) NOT NULL
);

-- END: User onboard table

-- Start: Service category table

CREATE TABLE service_category_table(
  service_category_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  service_category_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  service_category VARCHAR(4000) NOT NULL,
  service_category_is_disabled BOOLEAN DEFAULT false NOT NULL,
  service_category_is_available BOOLEAN DEFAULT true NOT NULL,
  
  service_category_encoder_team_member_id UUID REFERENCES team_member_table(team_member_id),
  service_category_team_id UUID REFERENCES team_table(team_id) NOT NULL
);

-- End: Service category table

-- Start: General unit of measurement table

CREATE TABLE general_unit_of_measurement_table(
  general_unit_of_measurement_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  general_unit_of_measurement_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  general_unit_of_measurement VARCHAR(4000) NOT NULL,
  general_unit_of_measurement_is_disabled BOOLEAN DEFAULT false NOT NULL,
  general_unit_of_measurement_is_available BOOLEAN DEFAULT true NOT NULL,
  
  general_unit_of_measurement_encoder_team_member_id UUID REFERENCES team_member_table(team_member_id),
  general_unit_of_measurement_team_id UUID REFERENCES team_table(team_id) NOT NULL
);

-- End: General unit of measurement table

-- Start: Memo feature table

CREATE TABLE memo_table (
    memo_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
    memo_subject VARCHAR(4000) NOT NULL,
    memo_date_created TIMESTAMPTZ(0) DEFAULT NOW() NOT NULL,
    memo_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
    memo_author_user_id UUID REFERENCES user_table(user_id) NOT NULL,
    memo_team_id UUID REFERENCES team_table(team_id) NOT NULL,
    memo_version VARCHAR(4000) NOT NULL,
    memo_reference_number UUID DEFAULT uuid_generate_v4() NOT NULL
);

CREATE TABLE memo_signer_table (
    memo_signer_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
    memo_signer_status VARCHAR(4000) DEFAULT 'PENDING' NOT NULL,
    memo_signer_is_primary BOOLEAN DEFAULT FALSE NOT NULL,
    memo_signer_order INT NOT NULL,
    memo_signer_team_member_id UUID REFERENCES team_member_table(team_member_id) NOT NULL,
    memo_signer_memo_id UUID REFERENCES memo_table(memo_id) NOT NULL
);

CREATE TABLE memo_line_item_table (
    memo_line_item_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
    memo_line_item_content VARCHAR(4000) NOT NULL,
    memo_line_item_date_created TIMESTAMPTZ(0) DEFAULT NOW() NOT NULL,
    memo_line_item_date_updated TIMESTAMPTZ(0),
    memo_line_item_order INT NOT NULL,
    memo_line_item_memo_id UUID REFERENCES memo_table(memo_id) NOT NULL
);

CREATE TABLE memo_line_item_attachment_table (
    memo_line_item_attachment_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
    memo_line_item_attachment_name VARCHAR(4000) NOT NULL,
    memo_line_item_attachment_caption VARCHAR(4000),
    memo_line_item_attachment_storage_bucket VARCHAR(4000) NOT NULL,
    memo_line_item_attachment_public_url VARCHAR(4000) NOT NULL,
    memo_line_item_attachment_line_item_id UUID REFERENCES memo_line_item_table(memo_line_item_id) ON DELETE CASCADE NOT NULL
);

CREATE TABLE memo_date_updated_table (
    memo_date_updated_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
    memo_date_updated TIMESTAMPTZ(0) DEFAULT NOW() NOT NULL,
    memo_date_updated_memo_id UUID REFERENCES memo_table(memo_id) NOT NULL
);

CREATE TABLE memo_status_table (
    memo_status_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
    memo_status VARCHAR(4000) DEFAULT 'PENDING' NOT NULL,
    memo_status_date_updated TIMESTAMPTZ(0),
    memo_status_memo_id UUID REFERENCES memo_table(memo_id) NOT NULL
);

CREATE TABLE memo_read_receipt_table (
    memo_read_receipt_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
    memo_read_receipt_date_created TIMESTAMPTZ(0) DEFAULT NOW() NOT NULL,
    memo_read_receipt_by_team_member_id UUID REFERENCES team_member_table(team_member_id) NOT NULL,
    memo_read_receipt_memo_id UUID REFERENCES memo_table(memo_id) NOT NULL
);

CREATE TABLE memo_agreement_table (
    memo_agreement_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
    memo_agreement_date_created TIMESTAMPTZ(0) DEFAULT NOW() NOT NULL,
    memo_agreement_by_team_member_id UUID REFERENCES team_member_table(team_member_id) NOT NULL,
    memo_agreement_memo_id UUID REFERENCES memo_table(memo_id) NOT NULL
);

CREATE TABLE memo_format_table(
    memo_format_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
    memo_format_header_margin_top VARCHAR(20) NOT NULL,
    memo_format_header_margin_right VARCHAR(20) NOT NULL,
    memo_format_header_margin_bottom VARCHAR(20) NOT NULL,
    memo_format_header_margin_left VARCHAR(20) NOT NULL,
    memo_format_header_logo_position VARCHAR(255) NOT NULL,
    memo_format_body_margin_top VARCHAR(20) NOT NULL,
    memo_format_body_margin_right VARCHAR(20) NOT NULL,
    memo_format_body_margin_bottom VARCHAR(20) NOT NULL,
    memo_format_body_margin_left VARCHAR(20) NOT NULL,
    memo_format_footer_margin_top VARCHAR(20) NOT NULL,
    memo_format_footer_margin_right VARCHAR(20) NOT NULL,
    memo_format_footer_margin_bottom VARCHAR(20) NOT NULL,
    memo_format_footer_margin_left VARCHAR(20) NOT NULL
);

-- End: Memo feature table

-- Start: Username history table

CREATE TABLE user_name_history_table(
  user_name_history_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  user_name_history_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  user_name_history_value VARCHAR(4000) NOT NULL,

  user_name_history_user_id UUID REFERENCES user_table(user_id) NOT NULL
);

CREATE TABLE signature_history_table(
  signature_history_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  signature_history_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  signature_history_value VARCHAR(4000) NOT NULL,

  signature_history_user_id UUID REFERENCES user_table(user_id) NOT NULL
);

-- End: Username history table

-- Start: Other expenses category table

CREATE TABLE other_expenses_category_table(
  other_expenses_category_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  other_expenses_category_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  other_expenses_category VARCHAR(4000) NOT NULL,
  other_expenses_category_is_disabled BOOLEAN DEFAULT false NOT NULL,
  other_expenses_category_is_available BOOLEAN DEFAULT true NOT NULL,
  
  other_expenses_category_encoder_team_member_id UUID REFERENCES team_member_table(team_member_id),
  other_expenses_category_team_id UUID REFERENCES team_table(team_id) NOT NULL
);

-- End: Other expenses category table

-- Start: Other expenses type table

CREATE TABLE other_expenses_type_table(
  other_expenses_type_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  other_expenses_type_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  other_expenses_type VARCHAR(4000) NOT NULL,
  other_expenses_type_is_disabled BOOLEAN DEFAULT false NOT NULL,
  other_expenses_type_is_available BOOLEAN DEFAULT true NOT NULL,
  
  other_expenses_type_category_id UUID REFERENCES other_expenses_category_table(other_expenses_category_id),
  other_expenses_type_encoder_team_member_id UUID REFERENCES team_member_table(team_member_id)
);

-- End: Other expenses type table

---------- End: TABLES

---------- Start: FUNCTIONS

-- Start: Get current date

CREATE OR REPLACE FUNCTION get_current_date()
RETURNS TIMESTAMPTZ
AS $$
BEGIN
    RETURN NOW();
END;
$$ LANGUAGE plpgsql;

-- End: Get current date

-- Extensions
CREATE EXTENSION IF NOT EXISTS plv8;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" with schema extensions;

-- Start: Get SSOT

CREATE OR REPLACE FUNCTION get_ssot(
  input_data JSON
)
RETURNS JSON as $$
let ssot_data;
plv8.subtransaction(function(){
  const {
    activeTeam,
    pageNumber,
    rowLimit,
    search,
    requisitionFilter,
    requisitionFilterCount,
    supplierList
  } = input_data;

  const rowStart = (pageNumber - 1) * rowLimit;

  // Fetch owner of team
  const team_owner = plv8.execute(`SELECT * FROM team_member_table WHERE team_member_team_id='${activeTeam}' AND team_member_role='OWNER'`)[0];

  // Fetch team formsly forms
  const requisition_form = plv8.execute(`SELECT * FROM form_table WHERE form_name='Requisition' AND form_is_formsly_form=true AND form_team_member_id='${team_owner.team_member_id}'`)[0];
  const sourced_item_form = plv8.execute(`SELECT * FROM form_table WHERE form_name='Sourced Item' AND form_is_formsly_form=true AND form_team_member_id='${team_owner.team_member_id}'`)[0];
  const quotation_form = plv8.execute(`SELECT * FROM form_table WHERE form_name='Quotation' AND form_is_formsly_form=true AND form_team_member_id='${team_owner.team_member_id}'`)[0];
  const rir_form = plv8.execute(`SELECT * FROM form_table WHERE form_name='Receiving Inspecting Report' AND form_is_formsly_form=true AND form_team_member_id='${team_owner.team_member_id}'`)[0];
  const ro_form = plv8.execute(`SELECT * FROM form_table WHERE form_name='Release Order' AND form_is_formsly_form=true AND form_team_member_id='${team_owner.team_member_id}'`)[0];
  const transfer_receipt_form = plv8.execute(`SELECT * FROM form_table WHERE form_name='Transfer Receipt' AND form_is_formsly_form=true AND form_team_member_id='${team_owner.team_member_id}'`)[0];

  let requisition_requests;
  let searchCondition = '';
  let condition = '';
  let supplierCondition = '';
  
  if(search.length !== 0){
    searchCondition = `request_view.request_formsly_id ILIKE '%' || '${search}' || '%'`;
  }

  if(requisitionFilterCount || supplierList.length !== 0){
    if(requisitionFilterCount){
      condition = requisitionFilter.map(value => `request_response_table.request_response = '"${value}"'`).join(' OR ');
    }

    if(supplierList.length !== 0){
      const quotationCondition = supplierList.map(supplier => `request_response_table.request_response='"${supplier}"'`).join(" OR ");
      const quotationRequestIdList = plv8.execute(`SELECT request_view.request_id FROM request_response_table INNER JOIN request_view ON request_response_table.request_response_request_id=request_view.request_id WHERE request_view.request_status='APPROVED' AND request_view.request_form_id='${quotation_form.form_id}' AND (${quotationCondition})`);

      if(quotationRequestIdList.length === 0){
        ssot_data = [];
        return;
      }

      const sectionId = plv8.execute(`SELECT section_id FROM section_table WHERE section_form_id='${quotation_form.form_id}' AND section_name='ID'`)[0];
      const fieldId = plv8.execute(`SELECT field_id FROM field_table WHERE field_section_id='${sectionId.section_id}' AND field_name='Requisition ID'`)[0];

      const requisitionCondition = quotationRequestIdList.map(requestId => `(request_response_request_id='${requestId.request_id}' AND request_response_field_id='${fieldId.field_id}')`).join(" OR ");
      const requisitionIdList = plv8.execute(`SELECT request_response FROM request_response_table WHERE ${requisitionCondition}`);

      supplierCondition = requisitionIdList.map(requestId => `request_view.request_id = '${JSON.parse(requestId.request_response)}'`).join(' OR ');
    }

    let orCondition = [...(condition ? [`${condition}`] : []), ...(searchCondition ? [`${searchCondition}`] : [])].join(' OR ');

    requisition_requests = plv8.execute(
      `
        SELECT * FROM (
          SELECT 
          request_view.request_id, 
            request_view.request_jira_id,
            request_view.request_otp_id,
            request_view.request_formsly_id,
            request_view.request_date_created, 
            request_view.request_team_member_id, 
            request_response_table.request_response, 
            ROW_NUMBER() OVER (PARTITION BY request_view.request_id) AS RowNumber 
          FROM request_view INNER JOIN request_response_table ON request_view.request_id = request_response_table.request_response_request_id 
          WHERE 
            request_view.request_status = 'APPROVED'
            AND request_view.request_form_id = '${requisition_form.form_id}'
            AND (
              ${[...(orCondition ? [`${orCondition}`] : []), ...(supplierCondition ? [`${supplierCondition}`] : [])].join(' AND ')}
            )
          ORDER BY request_view.request_status_date_updated DESC
        ) AS a 
        WHERE a.RowNumber = ${requisitionFilterCount ? requisitionFilterCount : 1}
        OFFSET ${rowStart} 
        ROWS FETCH FIRST ${rowLimit} ROWS ONLY
      `
    );
        
  }else{
    requisition_requests = plv8.execute(`SELECT request_id, request_formsly_id, request_view.request_jira_id, request_view.request_otp_id, request_date_created, request_team_member_id FROM request_view WHERE request_status='APPROVED' AND request_form_id='${requisition_form.form_id}' ORDER BY request_status_date_updated DESC OFFSET ${rowStart} ROWS FETCH FIRST ${rowLimit} ROWS ONLY`);
  }

  ssot_data = requisition_requests.map((requisition) => {
    // Requisition request response
    const requisition_response = plv8.execute(`SELECT request_response, request_response_field_id, request_response_duplicatable_section_id FROM request_response_table WHERE request_response_request_id='${requisition.request_id}'`);
    
    if(!requisition_response) return;

    // Requisition request response with fields
    const requisition_response_fields = requisition_response.map(response => {
      const field = plv8.execute(`SELECT field_name, field_type FROM field_table WHERE field_id='${response.request_response_field_id}'`)[0];

      return {
        request_response: response.request_response,
        request_response_field_name: field.field_name,
        request_response_field_type: field.field_type,
        request_response_duplicatable_section_id: response.request_response_duplicatable_section_id
      }
    });

    // Requisition team member
    const requisition_team_member = plv8.execute(`SELECT user_table.user_first_name, user_table.user_last_name FROM team_member_table INNER JOIN user_table ON team_member_table.team_member_user_id = user_id WHERE team_member_id='${requisition.request_team_member_id}'`)[0];

    const quotation_ids = plv8.execute(`SELECT request_view.request_id FROM request_response_table INNER JOIN request_view ON request_response_table.request_response_request_id=request_view.request_id WHERE request_response_table.request_response='"${requisition.request_id}"' AND request_view.request_status='APPROVED' AND request_view.request_form_id='${quotation_form.form_id}'`);
    let quotation_list = [];
    if(quotation_ids.length !== 0){
      let quotation_condition = "";
      quotation_ids.forEach(quotation => {
        quotation_condition += `request_id='${quotation.request_id}' OR `;
      });

      const quotation_requests = plv8.execute(`SELECT request_id, request_formsly_id, request_date_created, request_team_member_id FROM request_view WHERE ${quotation_condition.slice(0, -4)} ORDER BY request_status_date_updated DESC`);
      quotation_list = quotation_requests.map(quotation => {
        // Quotation request response
        const quotation_response = plv8.execute(`SELECT request_response, request_response_field_id FROM request_response_table WHERE request_response_request_id='${quotation.request_id}'`);
        
        // Quotation request response with fields
        const quotation_response_fields = quotation_response.map(response => {
          const field = plv8.execute(`SELECT field_name, field_type FROM field_table WHERE field_id='${response.request_response_field_id}'`)[0];
          return {
            request_response: response.request_response,
            request_response_field_name: field.field_name,
            request_response_field_type: field.field_type,
          }
        });

        // Quotation team member
        const quotation_team_member = plv8.execute(`SELECT user_table.user_first_name, user_table.user_last_name FROM team_member_table INNER JOIN user_table ON team_member_table.team_member_user_id = user_id WHERE team_member_id='${quotation.request_team_member_id}'`)[0];

        const rir_ids = plv8.execute(`SELECT request_view.request_id FROM request_response_table INNER JOIN request_view ON request_response_table.request_response_request_id=request_view.request_id WHERE request_response_table.request_response='"${quotation.request_id}"' AND request_view.request_status='APPROVED' AND request_view.request_form_id='${rir_form.form_id}'`);
        let rir_list = [];
        
        if(rir_ids.length !== 0){
          let rir_condition = "";
          rir_ids.forEach(rir => {
            rir_condition += `request_id='${rir.request_id}' OR `;
          });

          const rir_requests = plv8.execute(`SELECT request_id, request_formsly_id, request_date_created, request_team_member_id FROM request_view WHERE ${rir_condition.slice(0, -4)} ORDER BY request_status_date_updated DESC`);
          rir_list = rir_requests.map(rir => {
            // rir request response
            const rir_response = plv8.execute(`SELECT request_response, request_response_field_id FROM request_response_table WHERE request_response_request_id='${rir.request_id}'`);
            
            // rir request response with fields
            const rir_response_fields = rir_response.map(response => {
              const field = plv8.execute(`SELECT field_name, field_type FROM field_table WHERE field_id='${response.request_response_field_id}'`)[0];
              return {
                request_response: response.request_response,
                request_response_field_name: field.field_name,
                request_response_field_type: field.field_type,
              }
            });

            // rir team member
            const rir_team_member = plv8.execute(`SELECT user_table.user_first_name, user_table.user_last_name FROM team_member_table INNER JOIN user_table ON team_member_table.team_member_user_id = user_id WHERE team_member_id='${rir.request_team_member_id}'`)[0];

            return {
              rir_request_id: rir.request_id,
              rir_request_formsly_id: rir.request_formsly_id,
              rir_request_date_created: rir.request_date_created,
              rir_request_response: rir_response_fields,
              rir_request_owner: rir_team_member,
            }
          });
        }

        return {
          quotation_request_id: quotation.request_id,
          quotation_request_formsly_id: quotation.request_formsly_id,
          quotation_request_date_created: quotation.request_date_created,
          quotation_request_response: quotation_response_fields,
          quotation_request_owner: quotation_team_member,
          quotation_rir_request: rir_list
        }
      });
    }

    const sourced_item_ids = plv8.execute(`SELECT request_view.request_id FROM request_response_table INNER JOIN request_view ON request_response_table.request_response_request_id=request_view.request_id WHERE request_response_table.request_response='"${requisition.request_id}"' AND request_view.request_status='APPROVED' AND request_view.request_form_id='${sourced_item_form.form_id}'`);
    let sourced_item_list = [];
    if(sourced_item_ids.length !== 0){
      let sourced_item_condition = "";
      sourced_item_ids.forEach(sourced_item => {
        sourced_item_condition += `request_id='${sourced_item.request_id}' OR `;
      });

      const sourced_item_requests = plv8.execute(`SELECT request_id, request_formsly_id, request_date_created, request_team_member_id FROM request_view WHERE ${sourced_item_condition.slice(0, -4)} ORDER BY request_status_date_updated DESC`);
      sourced_item_list = sourced_item_requests.map(sourced_item => {
        // Sourced Item request response
        const sourced_item_response = plv8.execute(`SELECT request_response, request_response_field_id FROM request_response_table WHERE request_response_request_id='${sourced_item.request_id}'`);
        
        // Sourced Item request response with fields
        const sourced_item_response_fields = sourced_item_response.map(response => {
          const field = plv8.execute(`SELECT field_name, field_type FROM field_table WHERE field_id='${response.request_response_field_id}'`)[0];
          return {
            request_response: response.request_response,
            request_response_field_name: field.field_name,
            request_response_field_type: field.field_type,
          }
        });

        // Sourced Item team member
        const sourced_item_team_member = plv8.execute(`SELECT user_table.user_first_name, user_table.user_last_name FROM team_member_table INNER JOIN user_table ON team_member_table.team_member_user_id = user_id WHERE team_member_id='${sourced_item.request_team_member_id}'`)[0];

        const ro_ids = plv8.execute(`SELECT request_view.request_id FROM request_response_table INNER JOIN request_view ON request_response_table.request_response_request_id=request_view.request_id WHERE request_response_table.request_response='"${sourced_item.request_id}"' AND request_view.request_status='APPROVED' AND request_view.request_form_id='${ro_form.form_id}'`);
        let ro_list = [];
        
        if(ro_ids.length !== 0){
          let ro_condition = "";
          ro_ids.forEach(ro => {
            ro_condition += `request_id='${ro.request_id}' OR `;
          });

          const ro_requests = plv8.execute(`SELECT request_id, request_formsly_id, request_date_created, request_team_member_id FROM request_view WHERE ${ro_condition.slice(0, -4)} ORDER BY request_status_date_updated DESC`);
          ro_list = ro_requests.map(ro => {
            // ro request response
            const ro_response = plv8.execute(`SELECT request_response, request_response_field_id FROM request_response_table WHERE request_response_request_id='${ro.request_id}'`);
            
            // ro request response with fields
            const ro_response_fields = ro_response.map(response => {
              const field = plv8.execute(`SELECT field_name, field_type FROM field_table WHERE field_id='${response.request_response_field_id}'`)[0];
              return {
                request_response: response.request_response,
                request_response_field_name: field.field_name,
                request_response_field_type: field.field_type,
              }
            });

            // ro team member
            const ro_team_member = plv8.execute(`SELECT user_table.user_first_name, user_table.user_last_name FROM team_member_table INNER JOIN user_table ON team_member_table.team_member_user_id = user_id WHERE team_member_id='${ro.request_team_member_id}'`)[0];

            const transfer_receipt_ids = plv8.execute(`SELECT request_view.request_id FROM request_response_table INNER JOIN request_view ON request_response_table.request_response_request_id=request_view.request_id WHERE request_response_table.request_response='"${ro.request_id}"' AND request_view.request_status='APPROVED' AND request_view.request_form_id='${transfer_receipt_form.form_id}'`);
            let transfer_receipt_list = [];
            
            if(transfer_receipt_ids.length !== 0){
              let transfer_receipt_condition = "";
              transfer_receipt_ids.forEach(transfer_receipt => {
                transfer_receipt_condition += `request_id='${transfer_receipt.request_id}' OR `;
              });

              const transfer_receipt_requests = plv8.execute(`SELECT request_id, request_formsly_id, request_date_created, request_team_member_id FROM request_view WHERE ${transfer_receipt_condition.slice(0, -4)} ORDER BY request_status_date_updated DESC`);
              transfer_receipt_list = transfer_receipt_requests.map(transfer_receipt => {
                // transfer_receipt request response
                const transfer_receipt_response = plv8.execute(`SELECT request_response, request_response_field_id FROM request_response_table WHERE request_response_request_id='${transfer_receipt.request_id}'`);
                
                // transfer_receipt request response with fields
                const transfer_receipt_response_fields = transfer_receipt_response.map(response => {
                  const field = plv8.execute(`SELECT field_name, field_type FROM field_table WHERE field_id='${response.request_response_field_id}'`)[0];
                  return {
                    request_response: response.request_response,
                    request_response_field_name: field.field_name,
                    request_response_field_type: field.field_type,
                  }
                });

                // transfer_receipt team member
                const transfer_receipt_team_member = plv8.execute(`SELECT user_table.user_first_name, user_table.user_last_name FROM team_member_table INNER JOIN user_table ON team_member_table.team_member_user_id = user_id WHERE team_member_id='${transfer_receipt.request_team_member_id}'`)[0];

                return {
                  transfer_receipt_request_id: transfer_receipt.request_id,
                  transfer_receipt_request_formsly_id: transfer_receipt.request_formsly_id,
                  transfer_receipt_request_date_created: transfer_receipt.request_date_created,
                  transfer_receipt_request_response: transfer_receipt_response_fields,
                  transfer_receipt_request_owner: transfer_receipt_team_member,
                }
              });
            }

            return {
              ro_request_id: ro.request_id,
              ro_request_formsly_id: ro.request_formsly_id,
              ro_request_date_created: ro.request_date_created,
              ro_request_response: ro_response_fields,
              ro_request_owner: ro_team_member,
              ro_transfer_receipt_request: transfer_receipt_list
            }
          });
        }

        return {
          sourced_item_request_id: sourced_item.request_id,
          sourced_item_request_formsly_id: sourced_item.request_formsly_id,
          sourced_item_request_date_created: sourced_item.request_date_created,
          sourced_item_request_response: sourced_item_response_fields,
          sourced_item_request_owner: sourced_item_team_member,
          sourced_item_ro_request: ro_list
        }
      });
    } 

    return {
      requisition_request_id: requisition.request_id,
      requisition_request_formsly_id: requisition.request_formsly_id,
      requisition_request_jira_id: requisition.request_jira_id,
      requisition_request_otp_id: requisition.request_otp_id,
      requisition_request_date_created: requisition.request_date_created,
      requisition_request_response: requisition_response_fields,
      requisition_request_owner: requisition_team_member,
      requisition_quotation_request: quotation_list,
      requisition_sourced_item_request: sourced_item_list,
    }
  })
});
return ssot_data;
$$ LANGUAGE plv8;

-- End: Get SSOT

-- Start: Create user

CREATE OR REPLACE FUNCTION create_user(
    input_data JSON
)
RETURNS JSON AS $$
  let user_data;
  plv8.subtransaction(function(){
    const {
      user_id,
      user_email,
      user_first_name,
      user_last_name,
      user_username,
      user_avatar,
      user_phone_number,
      user_job_title,
      user_active_team_id,
      user_employee_number
    } = input_data;

    if(user_active_team_id){
        user_data = plv8.execute(`INSERT INTO user_table (user_id,user_email,user_first_name,user_last_name,user_username,user_avatar,user_phone_number,user_job_title,user_active_team_id) VALUES ('${user_id}','${user_email}','${user_first_name}','${user_last_name}','${user_username}','${user_avatar}','${user_phone_number}','${user_job_title}','${user_active_team_id}') RETURNING *;`)[0];
    }else{
        user_data = plv8.execute(`INSERT INTO user_table (user_id,user_email,user_first_name,user_last_name,user_username,user_avatar,user_phone_number,user_job_title) VALUES ('${user_id}','${user_email}','${user_first_name}','${user_last_name}','${user_username}','${user_avatar}','${user_phone_number}','${user_job_title}') RETURNING *;`)[0];
    }
    const invitation = plv8.execute(`SELECT invt.* ,teamt.team_name FROM invitation_table invt INNER JOIN team_member_table tmemt ON invt.invitation_from_team_member_id = tmemt.team_member_id INNER JOIN team_table teamt ON tmemt.team_member_team_id = teamt.team_id WHERE invitation_to_email='${user_email}';`)[0];

    if(invitation) plv8.execute(`INSERT INTO notification_table (notification_app,notification_content,notification_redirect_url,notification_type,notification_user_id) VALUES ('GENERAL','You have been invited to join ${invitation.team_name}','/user/invitation/${invitation.invitation_id}','INVITE','${user_id}') ;`);
    
    plv8.execute(`INSERT INTO user_employee_number_table (user_employee_number, user_employee_number_user_id) VALUES ('${user_employee_number}', '${user_id}')`);
 });
 return user_data;
$$ LANGUAGE plv8;

-- End: Create user

-- Start: Create request

CREATE OR REPLACE FUNCTION create_request(
    input_data JSON
)
RETURNS JSON AS $$
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
      teamId
    } = input_data;

    let formslyIdPrefix = '';
    let formslyIdSerial = '';

    if(isFormslyForm===true) {
      const requestCount = plv8.execute(
        `
          SELECT COUNT(*) FROM request_table 
          INNER JOIN form_table ON request_form_id = form_id
          INNER JOIN team_member_table ON team_member_id = form_team_member_id
          WHERE
            team_member_team_id = '${teamId}'
        `
      )[0].count;
  
      formslyIdSerial = (Number(requestCount) + 1).toString(16).toUpperCase();
      const project = plv8.execute(`SELECT * FROM team_project_table WHERE team_project_id='${projectId}';`)[0];
      
      if(formName==='Quotation') {
        endId = `Q`;
      } else if(formName==='Services') {
        endId = `S`;
      } else if(formName==='Other Expenses') {
        endId = `OE`;
      } else if(formName==='Sourced Item') {
        endId = `SI`;
      } else if(formName==='Receiving Inspecting Report') {
        endId = `RIR`;
      } else if(formName==='Release Order') {
        endId = `RO`;
      } else if(formName==='Transfer Receipt') {
        endId = `TR`;
      } else {
        endId = ``;
      }
      formslyIdPrefix = `${project.team_project_code}${endId}`;
    }

    if (projectId === "") {
      request_data = plv8.execute(`INSERT INTO request_table (request_id,request_form_id,request_team_member_id) VALUES ('${requestId}','${formId}','${teamMemberId}') RETURNING *;`)[0];
    } else {
      request_data = plv8.execute(`INSERT INTO request_table (request_id,request_form_id,request_team_member_id,request_formsly_id_prefix,request_formsly_id_serial,request_project_id) VALUES ('${requestId}','${formId}','${teamMemberId}','${formslyIdPrefix}','${formslyIdSerial}','${projectId}') RETURNING *;`)[0];
    }

    plv8.execute(`INSERT INTO request_response_table (request_response,request_response_duplicatable_section_id,request_response_field_id,request_response_request_id) VALUES ${responseValues};`);

    plv8.execute(`INSERT INTO request_signer_table (request_signer_signer_id,request_signer_request_id) VALUES ${signerValues};`);

    const activeTeamResult = plv8.execute(`SELECT * FROM team_table WHERE team_id='${teamId}';`);
    const activeTeam = activeTeamResult.length > 0 ? activeTeamResult[0] : null;

    if (activeTeam) {
      const teamNameUrlKeyResult = plv8.execute(`SELECT format_team_name_to_url_key('${activeTeam.team_name}') AS url_key;`);
      const teamNameUrlKey = teamNameUrlKeyResult.length > 0 ? teamNameUrlKeyResult[0].url_key : null;

      if (teamNameUrlKey) {
        const notificationValues = requestSignerNotificationInput
        .map(
          (notification) =>
            `('${notification.notification_app}','${notification.notification_content}','/${teamNameUrlKey}/requests/${isFormslyForm ? `${formslyIdPrefix}-${formslyIdSerial}` : requestId}','${notification.notification_team_id}','${notification.notification_type}','${notification.notification_user_id}')`
        )
        .join(",");

        plv8.execute(`INSERT INTO notification_table (notification_app,notification_content,notification_redirect_url,notification_team_id,notification_type,notification_user_id) VALUES ${notificationValues};`);
      }
    }
    
 });
 return request_data;
$$ LANGUAGE plv8;

-- End: Create request

-- Start: Edit request

CREATE OR REPLACE FUNCTION edit_request(
    input_data JSON
)
RETURNS JSON AS $$
  let request_data;
  plv8.subtransaction(function(){
    const {
      requestId,
      responseValues,
      signerValues,
      requestSignerNotificationInput
    } = input_data;

    request_data = plv8.execute(`SELECT * FROM request_view WHERE request_id='${requestId}';`)[0];

    plv8.execute(`DELETE FROM request_response_table WHERE request_response_request_id='${requestId}';`);

    plv8.execute(`DELETE FROM request_signer_table WHERE request_signer_request_id='${requestId}';`);

    plv8.execute(`INSERT INTO request_response_table (request_response,request_response_duplicatable_section_id,request_response_field_id,request_response_request_id) VALUES ${responseValues};`);

    plv8.execute(`INSERT INTO request_signer_table (request_signer_signer_id,request_signer_request_id) VALUES ${signerValues};`);

    const team_member_data = plv8.execute(`SELECT * FROM team_member_table WHERE team_member_id='${request_data.request_team_member_id}';`)[0];
    const activeTeamResult = plv8.execute(`SELECT * FROM team_table WHERE team_id='${team_member_data.team_member_team_id}'`)[0];
    const activeTeam = activeTeamResult.length > 0 ? activeTeamResult[0] : null;

    if (activeTeam) {
      const teamNameUrlKeyResult = plv8.execute(`SELECT format_team_name_to_url_key('${activeTeam.team_name}') AS url_key;`);
      const teamNameUrlKey = teamNameUrlKeyResult.length > 0 ? teamNameUrlKeyResult[0].url_key : null;

      if (teamNameUrlKey) {
        const notificationValues = requestSignerNotificationInput
        .map(
          (notification) =>
            `('${notification.notification_app}','${notification.notification_content}','/${teamNameUrlKey}/requests/${request_data.request_formsly_id ?? requestId}','${notification.notification_team_id}','${notification.notification_type}','${notification.notification_user_id}')`
        )
        .join(",");

        plv8.execute(`INSERT INTO notification_table (notification_app,notification_content,notification_redirect_url,notification_team_id,notification_type,notification_user_id) VALUES ${notificationValues};`);
      }
    }
 });
 return request_data;
$$ LANGUAGE plv8;

-- End: Edit request

-- Start: Approve or reject request
    
CREATE OR REPLACE FUNCTION approve_or_reject_request(
    input_data JSON
)
RETURNS VOID AS $$
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
      requestFormslyId
    } = input_data;

    const present = { APPROVED: "APPROVE", REJECTED: "REJECT" };

    plv8.execute(`UPDATE request_signer_table SET request_signer_status = '${requestAction}', request_signer_status_date_updated = NOW() WHERE request_signer_signer_id='${requestSignerId}' AND request_signer_request_id='${requestId}';`);
    
    plv8.execute(`INSERT INTO comment_table (comment_request_id,comment_team_member_id,comment_type,comment_content) VALUES ('${requestId}','${memberId}','ACTION_${requestAction}','${signerFullName} ${requestAction.toLowerCase()}  this request');`);
    
    const activeTeamResult = plv8.execute(`SELECT * FROM team_table WHERE team_id='${teamId}';`);
    const activeTeam = activeTeamResult.length > 0 ? activeTeamResult[0] : null;

    if (activeTeam) {
      const teamNameUrlKeyResult = plv8.execute(`SELECT format_team_name_to_url_key('${activeTeam.team_name}') AS url_key;`);
      const teamNameUrlKey = teamNameUrlKeyResult.length > 0 ? teamNameUrlKeyResult[0].url_key : null;

      if (teamNameUrlKey) {
        plv8.execute(`INSERT INTO notification_table (notification_app,notification_type,notification_content,notification_redirect_url,notification_user_id,notification_team_id) VALUES ('REQUEST','${present[requestAction]}','${signerFullName} ${requestAction.toLowerCase()} your ${formName} request','/${teamNameUrlKey}/requests/${requestFormslyId ?? requestId}','${requestOwnerId}','${teamId}');`);
      }
    }
    
    if(isPrimarySigner===true){
      plv8.execute(`UPDATE request_table SET request_status = '${requestAction}', request_status_date_updated = NOW() ${jiraId ? `, request_jira_id = '${jiraId}'` : ""} ${jiraLink ? `, request_jira_link = '${jiraLink}'` : ""} WHERE request_id='${requestId}';`);
    }
    
 });
$$ LANGUAGE plv8;

-- End: Approve or reject request

-- Start: Create formsly premade forms

CREATE OR REPLACE FUNCTION create_formsly_premade_forms(
    input_data JSON
)
RETURNS VOID AS $$
  plv8.subtransaction(function(){
    const {
      formValues,
      sectionValues,
      fieldWithIdValues,
      fieldsWithoutIdValues,
      optionsValues
    } = input_data;

    plv8.execute(`INSERT INTO form_table (form_id,form_name,form_description,form_app,form_is_formsly_form,form_is_hidden,form_team_member_id,form_is_disabled) VALUES ${formValues};`);
    
    plv8.execute(`INSERT INTO section_table (section_form_id,section_id,section_is_duplicatable,section_name,section_order) VALUES ${sectionValues};`);

    plv8.execute(`INSERT INTO field_table (field_id,field_is_read_only,field_is_required,field_name,field_order,field_section_id,field_type) VALUES ${fieldWithIdValues};`);

    plv8.execute(`INSERT INTO field_table (field_is_read_only,field_is_required,field_name,field_order,field_section_id,field_type) VALUES ${fieldsWithoutIdValues};`);

    plv8.execute(`INSERT INTO option_table (option_field_id,option_order,option_value) VALUES ${optionsValues};`);

 });
$$ LANGUAGE plv8;

-- End: Create formsly premade forms

-- Start: Create item

CREATE OR REPLACE FUNCTION create_item(
    input_data JSON
)
RETURNS JSON AS $$
  let item_data;
  plv8.subtransaction(function(){
    const {
      formId,
      itemData: {
        item_general_name,
        item_is_available,
        item_unit,
        item_gl_account,
        item_team_id,
        item_division_id_list,
        item_encoder_team_member_id
      },
      itemDescription
    } = input_data;

    
    const item_result = plv8.execute(`INSERT INTO item_table (item_general_name,item_is_available,item_unit,item_gl_account,item_team_id,item_encoder_team_member_id) VALUES ('${item_general_name}','${item_is_available}','${item_unit}','${item_gl_account}','${item_team_id}','${item_encoder_team_member_id}') RETURNING *;`)[0];
    const itemDivisionInput = item_division_id_list.map(division => {
      return `(${division}, '${item_result.item_id}')`;
    }).join(",");
    const item_division_list_result = plv8.execute(`INSERT INTO item_division_table (item_division_value, item_division_item_id) VALUES ${itemDivisionInput} RETURNING *`);

    const {section_id} = plv8.execute(`SELECT section_id FROM section_table WHERE section_form_id='${formId}' AND section_name='Item';`)[0];

    const itemDescriptionInput = [];
    const fieldInput= [];

    itemDescription.forEach((description) => {
      const fieldId = plv8.execute('SELECT uuid_generate_v4();')[0].uuid_generate_v4;
      itemDescriptionInput.push({
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
        field_order: 15,
        field_section_id: section_id,
        field_is_required: true,
      });
    });

    const itemDescriptionValues = itemDescriptionInput
      .map((item) =>
        `('${item.item_description_label}','${item.item_description_item_id}','${item.item_description_is_available}','${item.item_description_field_id}','${item.item_description_is_with_uom}',${item.item_description_order})`
      )
      .join(",");

    const fieldValues = fieldInput
      .map((field) =>
        `('${field.field_id}','${field.field_name}','${field.field_type}','${field.field_order}','${field.field_section_id}','${field.field_is_required}')`
      )
      .join(",");

    plv8.execute(`INSERT INTO field_table (field_id,field_name,field_type,field_order,field_section_id,field_is_required) VALUES ${fieldValues};`);
    
    const item_description = plv8.execute(`INSERT INTO item_description_table (item_description_label,item_description_item_id,item_description_is_available,item_description_field_id, item_description_is_with_uom, item_description_order) VALUES ${itemDescriptionValues} RETURNING *;`);

    item_data = {
      ...item_result, 
      item_division_id_list: item_division_list_result.map(division => division.item_division_value), 
      item_description: item_description
    }
 });
 return item_data;
$$ LANGUAGE plv8;

-- End: Create item

-- Start: Update item

CREATE OR REPLACE FUNCTION update_item(
    input_data JSON
)
RETURNS JSON AS $$
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
        item_division_id_list
      },
      toAdd,
      toUpdate,
      toRemove,
      formId
    } = input_data;

    
    const item_result = plv8.execute(
      `
        UPDATE item_table SET 
          item_general_name = '${item_general_name}',
          item_is_available = '${item_is_available}',
          item_unit = '${item_unit}',
          item_gl_account = '${item_gl_account}',
          item_team_id = '${item_team_id}'
        WHERE item_id = '${item_id}'
        RETURNING *
      `
    )[0];

    const { section_id } = plv8.execute(`SELECT section_id FROM section_table WHERE section_form_id='${formId}' AND section_name='Item';`)[0];

    const itemDescriptionInput = [];
    const fieldInput= [];

    toAdd.forEach((description) => {
      const fieldId = plv8.execute('SELECT uuid_generate_v4();')[0].uuid_generate_v4;
      itemDescriptionInput.push({
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
        field_order: 15,
        field_section_id: section_id,
        field_is_required: true,
      });
    });

    const itemDescriptionValues = itemDescriptionInput
      .map((item) =>
        `('${item.item_description_label}','${item.item_description_item_id}','${item.item_description_is_available}','${item.item_description_field_id}','${item.item_description_is_with_uom}',${item.item_description_order})`
      )
      .join(",");

    const fieldValues = fieldInput
      .map((field) =>
        `('${field.field_id}','${field.field_name}','${field.field_type}','${field.field_order}','${field.field_section_id}','${field.field_is_required}')`
      )
      .join(",");

    // update
    const updatedItemDescription = [];
    toUpdate.forEach(description => {
      const updatedDescription = plv8.execute(
        `
          UPDATE item_description_table SET 
            item_description_is_with_uom = '${description.item_description_is_with_uom}',
            item_description_label = '${description.item_description_label}',
            item_description_order = ${description.item_description_order}
          WHERE item_description_id = '${description.item_description_id}'
          RETURNING *
        `
      )[0];
      plv8.execute(
        `
          UPDATE field_table SET 
            field_name = '${description.item_description_label}'
          WHERE field_id = '${description.item_description_field_id}'
        `
      );
      updatedItemDescription.push(updatedDescription);
    });

    // delete
    toRemove.forEach(description => {
      plv8.execute(
        `
          UPDATE item_description_table SET 
            item_description_is_disabled = true
          WHERE item_description_id = '${description.descriptionId}'
        `
      );
    });

    // add
    let addedDescription = [];
    if(fieldValues.length && itemDescriptionValues.length){
      plv8.execute(`INSERT INTO field_table (field_id,field_name,field_type,field_order,field_section_id,field_is_required) VALUES ${fieldValues}`);

      addedDescription = plv8.execute(`INSERT INTO item_description_table (item_description_label,item_description_item_id,item_description_is_available,item_description_field_id, item_description_is_with_uom, item_description_order) VALUES ${itemDescriptionValues} RETURNING *`);
    }

    plv8.execute(`DELETE FROM item_division_table WHERE item_division_item_id='${item_id}'`);
    const itemDivisionInput = item_division_id_list.map(division => {
      return `(${division}, '${item_result.item_id}')`;
    }).join(",");
    
    const item_division_list_result = plv8.execute(`INSERT INTO item_division_table (item_division_value, item_division_item_id) VALUES ${itemDivisionInput} RETURNING *`);

    item_data = {
      ...item_result, 
      item_division_id_list: item_division_list_result.map(division => division.item_division_value), 
      item_description: [...updatedItemDescription, ...addedDescription]
    }
 });
 return item_data;
$$ LANGUAGE plv8;

-- End: Update item

-- Start: Create service

CREATE OR REPLACE FUNCTION create_service(
    input_data JSON
)
RETURNS JSON AS $$
  let item_data;
  plv8.subtransaction(function(){
    const {
      formId,
      serviceData: {
        service_name,
        service_is_available,
        service_team_id,
      },
      scope
    } = input_data;

    
    const service_result = plv8.execute(`INSERT INTO service_table (service_name,service_is_available,service_team_id) VALUES ('${service_name}','${service_is_available}','${service_team_id}') RETURNING *;`)[0];

    const {section_id} = plv8.execute(`SELECT section_id FROM section_table WHERE section_form_id='${formId}' AND section_name='Service';`)[0];

    const serviceScopeInput = [];
    const fieldInput = [];

    scope.forEach((scope) => {
      const fieldId = plv8.execute('SELECT uuid_generate_v4();')[0].uuid_generate_v4;
      
      fieldInput.push({
        field_id: fieldId,
        field_name: scope.name,
        field_type: scope.type,
        field_order: 8,
        field_section_id: section_id,
        field_is_required: false,
      });
      serviceScopeInput.push({
        service_scope_name: scope.name,
        service_scope_type: scope.type,
        service_scope_is_with_other: scope.isWithOther,
        service_scope_service_id: service_result.service_id,
        service_scope_field_id: fieldId
      });
    });

    const fieldValues = fieldInput
      .map((field) =>
        `('${field.field_id}','${field.field_name}','${field.field_type}','${field.field_order}','${field.field_section_id}','${field.field_is_required}')`
      )
      .join(",");
    const serviceScopeValues = serviceScopeInput
      .map((scope) =>
        `('${scope.service_scope_name}','${scope.service_scope_type}','${scope.service_scope_is_with_other}','${scope.service_scope_service_id}','${scope.service_scope_field_id}')`
      )
      .join(",");

    plv8.execute(`INSERT INTO field_table (field_id,field_name,field_type,field_order,field_section_id,field_is_required) VALUES ${fieldValues};`);
    const service_scope = plv8.execute(`INSERT INTO service_scope_table (service_scope_name,service_scope_type,service_scope_is_with_other,service_scope_service_id,service_scope_field_id) VALUES ${serviceScopeValues} RETURNING *;`);

    item_data = {...service_result, service_scope: service_scope}

 });
 return item_data;
$$ LANGUAGE plv8;

-- End: Create service

-- Start: Create team invitation


CREATE OR REPLACE FUNCTION create_team_invitation(
    input_data JSON
)
RETURNS JSON AS $$
  let invitation_data;
  plv8.subtransaction(function(){
    const {
      emailList,
      teamMemberId,
      teamName
    } = input_data;

    const invitationInput = [];
    const notificationInput = [];

    emailList.forEach((email) => {
      const invitationId = plv8.execute('SELECT uuid_generate_v4()')[0].uuid_generate_v4;

      const  checkInvitationCount = plv8.execute(`SELECT COUNT(*) FROM invitation_table WHERE invitation_to_email='${email}' AND invitation_from_team_member_id='${teamMemberId}' AND invitation_is_disabled='false' AND invitation_status='PENDING';`)[0].count;
        
      if (!checkInvitationCount) {
        invitationInput.push({
          invitation_id: invitationId,
          invitation_to_email: email,
          invitation_from_team_member_id: teamMemberId,
        });
      }

      const checkUserData = plv8.execute(`SELECT * FROM user_table WHERE user_email='${email}';`)[0];

      if (checkUserData) {
        notificationInput.push({
          notification_app: "GENERAL",
          notification_content: `You have been invited to join ${teamName}`,
          notification_redirect_url: `/invitation/${invitationId}`,
          notification_type: "INVITE",
          notification_user_id: checkUserData.user_id,
        });
      }
    });

    if (invitationInput.length > 0){
      const invitationValues = invitationInput
        .map((invitation) =>
          `('${invitation.invitation_id}','${invitation.invitation_to_email}','${invitation.invitation_from_team_member_id}')`
        )
        .join(",");

      invitation_data = plv8.execute(`INSERT INTO invitation_table (invitation_id,invitation_to_email,invitation_from_team_member_id) VALUES ${invitationValues} RETURNING *;`);
    }

    if (notificationInput.length > 0){
      const notificationValues = notificationInput
        .map((notification) =>
          `('${notification.notification_app}','${notification.notification_content}','${notification.notification_redirect_url}','${notification.notification_type}','${notification.notification_user_id}')`
        )
        .join(",");

      plv8.execute(`INSERT INTO notification_table (notification_app,notification_content,notification_redirect_url,notification_type,notification_user_id) VALUES ${notificationValues};`);
    }
  });
  return invitation_data;
$$ LANGUAGE plv8;

-- End: Create team invitation

-- Start: Get user's active team id

CREATE OR REPLACE FUNCTION get_user_active_team_id(
  user_id TEXT
)
RETURNS TEXT as $$
  let active_team_id;
  plv8.subtransaction(function(){
    const user_data = plv8.execute(`SELECT * FROM user_table WHERE user_id='${user_id}' LIMIT 1`)[0];
    
    if(!user_data.user_active_team_id){
      const team_member = plv8.execute(`SELECT * FROM team_member_table WHERE team_member_user_id='${user_id}' AND team_member_is_disabled='false' LIMIT 1`)[0];
      if(team_member){
        active_team_id = team_member.team_member_team_id
      }
    }else{
      active_team_id = user_data.user_active_team_id
    }  
 });
 return active_team_id;
$$ LANGUAGE plv8;

-- End: Get user's active team id

-- Start: check if Requisition form can be activated

CREATE OR REPLACE FUNCTION check_requisition_form_status(
    team_id TEXT,
    form_id TEXT
)
RETURNS Text as $$
  let return_data;
  plv8.subtransaction(function(){


    const item_count = plv8.execute(`SELECT COUNT(*) FROM item_table WHERE item_team_id='${team_id}' AND item_is_available='true' AND item_is_disabled='false'`)[0];

    const signer_count = plv8.execute(`SELECT COUNT(*) FROM signer_table WHERE signer_form_id='${form_id}' AND signer_is_disabled='false' AND signer_is_primary_signer='true'`)[0];

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

-- End: check if Requisition form can be activated

-- Start: check if Subcon form can be activated

CREATE OR REPLACE FUNCTION check_subcon_form_status(
    team_id TEXT,
    form_id TEXT
)
RETURNS Text as $$
  let return_data;
  plv8.subtransaction(function(){


    const service_count = plv8.execute(`SELECT COUNT(*) FROM service_table WHERE service_team_id='${team_id}' AND service_is_available='true' AND service_is_disabled='false'`)[0];

    const signer_count = plv8.execute(`SELECT COUNT(*) FROM signer_table WHERE signer_form_id='${form_id}' AND signer_is_disabled='false' AND signer_is_primary_signer='true'`)[0];

    if (!service_count.count) {
      return_data = "There must be at least one available service";
    } else if (!signer_count) {
      return_data = "You need to add a primary signer first";
    } else {
      return_data = "true"
    }
 });

 return return_data;
$$ LANGUAGE plv8;

-- End: check if Subcon form can be activated

-- Start: Transfer ownership 

CREATE OR REPLACE FUNCTION transfer_ownership(
    owner_id TEXT,
    member_id TEXT
)
RETURNS VOID  as $$
  plv8.subtransaction(function(){

    plv8.execute(`UPDATE team_member_table SET team_member_role='OWNER' WHERE team_member_id='${member_id}'`);
    plv8.execute(`UPDATE team_member_table SET team_member_role='APPROVER' WHERE team_member_id='${owner_id}'`);
 });
$$ LANGUAGE plv8;

-- End: Transfer ownership

-- Start: Accept team invitation

CREATE OR REPLACE FUNCTION accept_team_invitation(
    invitation_id TEXT,
    team_id TEXT,
    user_id TEXT
)
RETURNS JSON as $$
  let user_team_list
  plv8.subtransaction(function(){

    const isUserPreviousMember = plv8.execute(`SELECT COUNT(*) FROM team_member_table WHERE team_member_team_id='${team_id}' AND team_member_user_id='${user_id}' AND team_member_is_disabled=TRUE`);
    const userData = plv8.execute(`SELECT user_id, user_active_team_id FROM user_table WHERE user_id='${user_id}'`)[0];

    if (isUserPreviousMember[0].count > 0) {
      plv8.execute(`UPDATE team_member_table SET team_member_is_disabled=FALSE WHERE team_member_team_id='${team_id}' AND team_member_user_id='${user_id}'`);
    } else {
      plv8.execute(`INSERT INTO team_member_table (team_member_team_id, team_member_user_id) VALUES ('${team_id}', '${user_id}')`);
    }

    if (!userData.user_active_team_id) {
      plv8.execute(`UPDATE user_table SET user_active_team_id='${team_id}' WHERE user_id='${user_id}'`);
    }

    plv8.execute(`UPDATE invitation_table SET invitation_status='ACCEPTED' WHERE invitation_id='${invitation_id}'`);

    user_team_list = plv8.execute(`SELECT tt.* 
      FROM team_member_table as tm
      JOIN team_table as tt ON tt.team_id = tm.team_member_team_id
      WHERE team_member_is_disabled=FALSE 
      AND team_member_user_id='${user_id}'
      ORDER BY tt.team_date_created DESC`)

 });
 return user_team_list;
$$ LANGUAGE plv8;

-- End: Accept team invitation

-- Start: Update request status to canceled

CREATE OR REPLACE FUNCTION cancel_request(
    request_id TEXT,
    member_id TEXT,
    comment_type TEXT,
    comment_content TEXT
)
RETURNS VOID as $$
  plv8.subtransaction(function(){
    plv8.execute(`UPDATE request_table SET request_status='CANCELED', request_status_date_updated = NOW() WHERE request_id='${request_id}'`);
    plv8.execute(`INSERT INTO comment_table (comment_request_id,comment_team_member_id,comment_type,comment_content) VALUES ('${request_id}', '${member_id}','${comment_type}', '${comment_content}')`);
 });
$$ LANGUAGE plv8;

-- End: Accept team invitation

-- Start: Create request form

CREATE OR REPLACE FUNCTION create_request_form(
    input_data JSON
)
RETURNS JSON AS $$
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

    form_data = plv8.execute(`INSERT INTO form_table (form_app,form_description,form_name,form_team_member_id,form_id,form_is_signature_required,form_is_for_every_member) VALUES ('${formType}','${formDescription}','${formName}','${teamMemberId}','${formId}','${isSignatureRequired}','${isForEveryone}') RETURNING *`)[0];

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
          `('${field.field_id}','${field.field_name}','${field.field_type}',${
            field.field_description ? `'${field.field_description}'` : "NULL"
          },'${field.field_is_positive_metric}','${field.field_is_required}','${field.field_order}','${field.field_section_id}')`
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
    
    const section_query = `INSERT INTO section_table (section_id,section_form_id,section_is_duplicatable,section_name,section_order) VALUES ${sectionValues}`;

    const field_query = `INSERT INTO field_table (field_id,field_name,field_type,field_description,field_is_positive_metric,field_is_required,field_order,field_section_id) VALUES ${fieldValues}`;

    const option_query = `INSERT INTO option_table (option_id,option_value,option_order,option_field_id) VALUES ${optionValues}`;

    const signer_query = `INSERT INTO signer_table (signer_id,signer_form_id,signer_team_member_id,signer_action,signer_is_primary_signer,signer_order) VALUES ${signerValues}`;

    const form_group_query = `INSERT INTO form_team_group_table (form_id, team_group_id) VALUES ${groupValues}`;

    const all_query = `${section_query}; ${field_query}; ${optionInput.length>0?option_query:''}; ${signer_query}; ${groupList.length>0?form_group_query:''};`
    
    plv8.execute(all_query);
 });
 return form_data;
$$ LANGUAGE plv8;

-- End: Create request form

-- Start: Get all notification

CREATE OR REPLACE FUNCTION get_all_notification(
    input_data JSON
)
RETURNS JSON AS $$
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
    if(teamId) team_query = `OR notification_team_id='${teamId}'`

    const notification_list = plv8.execute(`SELECT  * FROM notification_table WHERE notification_user_id='${userId}' AND (notification_app = 'GENERAL' OR notification_app = '${app}') AND (notification_team_id IS NULL ${team_query}) ORDER BY notification_date_created DESC LIMIT '${limit}' OFFSET '${start}';`);
    
    const unread_notification_count = plv8.execute(`SELECT COUNT(*) FROM notification_table WHERE notification_user_id='${userId}' AND (notification_app='GENERAL' OR notification_app='${app}') AND (notification_team_id IS NULL ${team_query}) AND notification_is_read=false;`)[0].count;

    notification_data = {data: notification_list,  count: parseInt(unread_notification_count)}
 });
 return notification_data;
$$ LANGUAGE plv8;

-- End: Get all notification

-- Start: Update form signer

CREATE OR REPLACE FUNCTION update_form_signer(
    input_data JSON
)
RETURNS JSON AS $$
  let signer_data;
  plv8.subtransaction(function(){
    const {
     formId,
     signers,
     selectedProjectId
    } = input_data;

    plv8.execute(`UPDATE signer_table SET signer_is_disabled=true WHERE signer_form_id='${formId}' AND signer_team_project_id ${selectedProjectId ? `='${selectedProjectId}'` : "IS NULL"}`);

    const signerValues = signers
      .map(
        (signer) =>
          `('${signer.signer_id}','${formId}','${signer.signer_team_member_id}','${signer.signer_action}','${signer.signer_is_primary_signer}','${signer.signer_order}','${signer.signer_is_disabled}', ${selectedProjectId ? `'${selectedProjectId}'` : null})`
      )
      .join(",");

    signer_data = plv8.execute(`INSERT INTO signer_table (signer_id,signer_form_id,signer_team_member_id,signer_action,signer_is_primary_signer,signer_order,signer_is_disabled,signer_team_project_id) VALUES ${signerValues} ON CONFLICT ON CONSTRAINT signer_table_pkey DO UPDATE SET signer_team_member_id = excluded.signer_team_member_id, signer_action = excluded.signer_action, signer_is_primary_signer = excluded.signer_is_primary_signer, signer_order = excluded.signer_order, signer_is_disabled = excluded.signer_is_disabled, signer_team_project_id = excluded.signer_team_project_id RETURNING *;`);

 });
 return signer_data;
$$ LANGUAGE plv8;

-- End: Update form signer

-- Start: Check if the approving or creating quotation item quantity are less than the requisition quantity

CREATE OR REPLACE FUNCTION check_requisition_quantity(
    input_data JSON
)
RETURNS JSON AS $$
    let item_data
    plv8.subtransaction(function(){
        const {
            requisitionID,
            itemFieldList,
            quantityFieldList
        } = input_data;

        const request = plv8.execute(
            `
                SELECT request_response_table.* 
                FROM request_response_table 
                INNER JOIN request_table ON request_response_request_id = request_id 
                INNER JOIN form_table ON request_form_id = form_id 
                WHERE 
                    request_status = 'APPROVED'
                    AND request_response = '${requisitionID}' 
                    AND form_is_formsly_form = true 
                    AND (form_name = 'Quotation' OR form_name = 'Sourced Item')
            `
        );
        
        let requestResponse = []
        if(request.length > 0) {
            const requestIdList = request.map(
                (response) => `'${response.request_response_request_id}'`
            ).join(",");

            requestResponse = plv8.execute(
                `
                    SELECT 
                        request_response_table.*, 
                        field_name 
                    FROM request_response_table 
                    INNER JOIN field_table ON field_id = request_response_field_id 
                    WHERE 
                        (
                            field_name = 'Quantity' 
                            OR field_name = 'Item'
                        ) 
                        AND request_response_request_id IN (${requestIdList})
                    ORDER BY request_response_duplicatable_section_id ASC
                `
            );
        }

        const requestResponseItem = [];
        const requestResponseQuantity = [];

        requestResponse.forEach((response) => {
            if (response.field_name === "Item") {
                requestResponseItem.push(response);
            } else if (response.field_name === "Quantity") {
                requestResponseQuantity.push(response);
            }
        });

        requestResponseItem.push(...itemFieldList);
        requestResponseQuantity.push(...quantityFieldList);

        const itemList = [];
        const quantityList = [];

        const descriptionMatcher = (options, currentItem) => {
            const regex = /\(([^()]+)\)/g;
            let returnData = "";
            for (const option of options) {
              const currentItemResult = currentItem.match(regex);
              const currentItemIndex = currentItem.indexOf("(");
              const currentItemGeneralName = currentItem.slice(0, currentItemIndex - 1);
              const currentItemDescriptionList =
                currentItemResult && currentItemResult[1].slice(1, -1).split(", ");
        
              const optionIndex = option.indexOf("(");
              const optionGeneralName = option.slice(0, optionIndex - 1);
        
              if (
                currentItemGeneralName === optionGeneralName &&
                currentItemDescriptionList
              ) {
                let match = true;
                for (const description of currentItemDescriptionList) {
                  if (!option.includes(description)) {
                    match = false;
                    break;
                  }
                }
                if (match) {
                  returnData = option;
                  break;
                }
              }
            }
            return returnData;
        };
        
  
        for (let i = 0; i < requestResponseItem.length; i++) {
            const currentItem = descriptionMatcher(itemList, requestResponseItem[i].request_response) || requestResponseItem[i].request_response;
            if (itemList.includes(currentItem)) {
                const quantityIndex = itemList.indexOf(currentItem);
                quantityList[quantityIndex] += Number(
                    requestResponseQuantity[i].request_response
                );
            } else {
                itemList.push(currentItem);
                quantityList.push(Number(requestResponseQuantity[i].request_response));
            }
        }

        const returnData = [];
        const regExp = /\(([^)]+)\)/;
        for (let i = 0; i < itemList.length; i++) {
            const matches = regExp.exec(itemList[i]);
            if (!matches) continue;

            const quantityMatch = matches[1].match(/(\d+)/);
            if (!quantityMatch) continue;

            const expectedQuantity = Number(quantityMatch[1]);
            const unit = matches[1].replace(/\d+/g, "").trim();

            if (quantityList[i] > expectedQuantity) {
            const quantityMatch = itemList[i].match(/(\d+)/);
            if (!quantityMatch) return;

            returnData.push(
                `${JSON.parse(
                itemList[i].replace(
                    quantityMatch[1],
                    Number(quantityMatch[1]).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                )
                )} exceeds quantity limit by ${(
                quantityList[i] - expectedQuantity
                ).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ${unit}`
            );
            }
        }
        item_data = returnData;
        
    });
    return item_data;
$$ LANGUAGE plv8;

-- End: Check if the approving or creating quotation item quantity are less than the requisition quantity

-- Start: Check if the approving or creating release order item quantity are less than the quotation quantity

CREATE OR REPLACE FUNCTION check_ro_item_quantity(
    input_data JSON
)
RETURNS JSON AS $$
    let item_data
    plv8.subtransaction(function(){
        const {
            sourcedItemId,
            itemFieldId,
            quantityFieldId,
            itemFieldList,
            quantityFieldList
        } = input_data;

        const request = plv8.execute(
            `
                SELECT request_response_table.* 
                FROM request_response_table 
                INNER JOIN request_table ON request_response_request_id = request_id
                INNER JOIN form_table ON request_form_id = form_id 
                WHERE 
                    request_table.request_status = 'APPROVED' 
                    AND request_response = '${sourcedItemId}' 
                    AND form_is_formsly_form = true 
                    AND form_name = 'Release Order'
            `
        );
        
        let requestResponse = []
        if(request.length > 0) {
            const requestIdList = request.map(
                (response) => `'${response.request_response_request_id}'`
            ).join(",");

            requestResponse = plv8.execute(
                `
                    SELECT * FROM request_response_table 
                    WHERE 
                        (
                            request_response_field_id = '${itemFieldId}' 
                            OR request_response_field_id = '${quantityFieldId}'
                        ) 
                        AND request_response_request_id IN (${requestIdList})
                    ORDER BY request_response_duplicatable_section_id ASC
                `
            );
        }

        const requestResponseItem = [];
        const requestResponseQuantity = [];

        requestResponse.forEach((response) => {
            if (response.request_response_field_id === itemFieldId) {
              requestResponseItem.push(response);
            } else if (response.request_response_field_id === quantityFieldId) {
              requestResponseQuantity.push(response);
            }
        });

        requestResponseItem.push(...itemFieldList);
        requestResponseQuantity.push(...quantityFieldList);

        const itemList = [];
        const quantityList = [];

        for (let i = 0; i < requestResponseItem.length; i++) {
            if (itemList.includes(requestResponseItem[i].request_response)) {
                const quantityIndex = itemList.indexOf(requestResponseItem[i].request_response);
                quantityList[quantityIndex] += Number(requestResponseQuantity[i].request_response);
            } else {
                itemList.push(requestResponseItem[i].request_response);
                quantityList.push(Number(requestResponseQuantity[i].request_response));
            }
        }

        const returnData = [];
        const regExp = /\(([^)]+)\)/;
        for (let i = 0; i < itemList.length; i++) {
            const matches = regExp.exec(itemList[i]);
            if (!matches) continue;

            const quantityMatch = matches[1].match(/(\d+)/);
            if (!quantityMatch) continue;

            const expectedQuantity = Number(quantityMatch[1]);
            const unit = matches[1].replace(/\d+/g, "").trim();

            if (quantityList[i] > expectedQuantity) {
                const quantityMatch = itemList[i].match(/(\d+)/);
                if (!quantityMatch) return;

                returnData.push(
                    `${JSON.parse(
                    itemList[i].replace(
                        quantityMatch[1],
                        Number(quantityMatch[1]).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    )
                    )} exceeds quantity limit by ${(
                        quantityList[i] - expectedQuantity
                    ).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ${unit}`
                );
            }
        }
        item_data = returnData
    });
    return item_data;
$$ LANGUAGE plv8;

-- End: Check if the approving or creating release order item quantity are less than the quotation quantity

-- Start: Check if the approving or creating rir item quantity are less than the quotation quantity

CREATE OR REPLACE FUNCTION check_rir_item_quantity(
    input_data JSON
)
RETURNS JSON AS $$
    let item_data
    plv8.subtransaction(function(){
        const {
            quotationId,
            itemFieldId,
            quantityFieldId,
            itemFieldList,
            quantityFieldList
        } = input_data;

        const request = plv8.execute(
            `
                SELECT request_response_table.* 
                FROM request_response_table 
                INNER JOIN request_table ON request_response_request_id = request_id 
                INNER JOIN form_table ON request_form_id = form_id
                WHERE 
                    request_status = 'APPROVED' 
                    AND request_response = '${quotationId}' 
                    AND form_is_formsly_form = true 
                    AND form_name = 'Receiving Inspecting Report'
            `
        );
        
        let requestResponse = [];
        if(request.length > 0) {
            const requestIdList = request.map(
                (response) => `'${response.request_response_request_id}'`
            ).join(",");

            requestResponse = plv8.execute(
                `
                    SELECT * FROM request_response_table 
                    WHERE 
                        (
                            request_response_field_id = '${itemFieldId}' 
                            OR request_response_field_id = '${quantityFieldId}'
                        ) 
                        AND request_response_request_id IN (${requestIdList})
                    ORDER BY request_response_duplicatable_section_id ASC
                    `
                );
            const requestResponseItem = [];
            const requestResponseQuantity = [];

            requestResponse.forEach((response) => {
                if (response.request_response_field_id === itemFieldId) {
                requestResponseItem.push(response);
                } else if (response.request_response_field_id === quantityFieldId) {
                requestResponseQuantity.push(response);
                }
            });

            requestResponseItem.push(...itemFieldList);
            requestResponseQuantity.push(...quantityFieldList);

            const itemList = [];
            const quantityList = [];

            for (let i = 0; i < requestResponseItem.length; i++) {
                if (itemList.includes(requestResponseItem[i].request_response)) {
                const quantityIndex = itemList.indexOf(
                    requestResponseItem[i].request_response
                );
                quantityList[quantityIndex] += Number(
                    requestResponseQuantity[i].request_response
                );
                } else {
                itemList.push(requestResponseItem[i].request_response);
                quantityList.push(Number(requestResponseQuantity[i].request_response));
                }
            }

            const returnData = [];
            const regExp = /\(([^)]+)\)/;
            for (let i = 0; i < itemList.length; i++) {
                const matches = regExp.exec(itemList[i]);
                if (!matches) continue;

                const quantityMatch = matches[1].match(/(\d+)/);
                if (!quantityMatch) continue;

                const expectedQuantity = Number(quantityMatch[1]);
                const unit = matches[1].replace(/\d+/g, "").trim();

                if (quantityList[i] > expectedQuantity) {
                const quantityMatch = itemList[i].match(/(\d+)/);
                if (!quantityMatch) return;

                returnData.push(
                    `${JSON.parse(
                    itemList[i].replace(
                        quantityMatch[1],
                        Number(quantityMatch[1]).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    )
                    )} exceeds quantity limit by ${(
                    quantityList[i] - expectedQuantity
                    ).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ${unit}`
                );
                }
            }
            item_data = returnData
        }
    });
    return item_data;
$$ LANGUAGE plv8;

-- End: Check if the approving or creating tranfer receipt item quantity are less than the release order quantity

CREATE OR REPLACE FUNCTION check_tranfer_receipt_item_quantity(
    input_data JSON
)
RETURNS JSON AS $$
    let item_data
    plv8.subtransaction(function(){
        const {
          releaseOrderItemId,
          itemFieldId,
          quantityFieldId,
          itemFieldList,
          quantityFieldList
        } = input_data;

        const request = plv8.execute(
          `
            SELECT request_response_table.* 
            FROM request_response_table 
            INNER JOIN request_table ON request_response_request_id = request_id 
            INNER JOIN form_table ON request_form_id = form_id 
            WHERE 
              request_response_table.request_response = '${releaseOrderItemId}' 
              AND request_table.request_status = 'APPROVED' 
              AND form_table.form_is_formsly_form = true 
              AND form_table.form_name = 'Transfer Receipt'
          `
        );
        
        let requestResponse = []
        if(request.length > 0) {
            const requestIdList = request.map(
                (response) => `'${response.request_response_request_id}'`
            ).join(",");
            requestResponse = plv8.execute(
              `
                SELECT * 
                FROM request_response_table
                WHERE 
                  (
                    request_response_field_id = '${itemFieldId}' 
                    OR request_response_field_id = '${quantityFieldId}'
                  ) 
                AND request_response_request_id IN (${requestIdList})
                ORDER BY request_response_duplicatable_section_id ASC
            `
          );
        }

        const requestResponseItem = [];
        const requestResponseQuantity = [];

        requestResponse.forEach((response) => {
            if (response.request_response_field_id === itemFieldId) {
            requestResponseItem.push(response);
            } else if (response.request_response_field_id === quantityFieldId) {
            requestResponseQuantity.push(response);
            }
        });

        requestResponseItem.push(...itemFieldList);
        requestResponseQuantity.push(...quantityFieldList);

        const itemList = [];
        const quantityList = [];

        for (let i = 0; i < requestResponseItem.length; i++) {
            if (itemList.includes(requestResponseItem[i].request_response)) {
            const quantityIndex = itemList.indexOf(
                requestResponseItem[i].request_response
            );
            quantityList[quantityIndex] += Number(
                requestResponseQuantity[i].request_response
            );
            } else {
            itemList.push(requestResponseItem[i].request_response);
            quantityList.push(Number(requestResponseQuantity[i].request_response));
            }
        }

        const returnData = [];
        const regExp = /\(([^)]+)\)/;
        for (let i = 0; i < itemList.length; i++) {
            const matches = regExp.exec(itemList[i]);
            if (!matches) continue;

            const quantityMatch = matches[1].match(/(\d+)/);
            if (!quantityMatch) continue;

            const expectedQuantity = Number(quantityMatch[1]);
            const unit = matches[1].replace(/\d+/g, "").trim();

            if (quantityList[i] > expectedQuantity) {
            const quantityMatch = itemList[i].match(/(\d+)/);
            if (!quantityMatch) return;

            returnData.push(
                `${JSON.parse(
                itemList[i].replace(
                    quantityMatch[1],
                    Number(quantityMatch[1]).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                )
                )} exceeds quantity limit by ${(
                quantityList[i] - expectedQuantity
                ).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ${unit}`
            );
            }
        }
        item_data = returnData
    });
    return item_data;
$$ LANGUAGE plv8;

-- End: Check if the approving or creating tranfer receipt item quantity are less than the release order quantity

-- Start: Fetch request list

CREATE OR REPLACE FUNCTION fetch_request_list(
    input_data JSON
)
RETURNS JSON AS $$
    let return_value
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
        idFilter
      } = input_data;

      const start = (page - 1) * limit;

      let request_list = [];
      let request_count = 0;

      if(!isApproversView) {
        request_list = plv8.execute(
          `
            SELECT DISTINCT
              request_id, 
              request_formsly_id,
              request_date_created, 
              request_status,
              request_team_member_id,
              request_jira_id,
              request_jira_link,
              request_otp_id,
              request_form_id
            FROM request_view
            INNER JOIN team_member_table ON request_view.request_team_member_id = team_member_table.team_member_id
            INNER JOIN form_table ON request_view.request_form_id = form_table.form_id
            INNER JOIN request_signer_table ON request_view.request_id = request_signer_table.request_signer_request_id
            INNER JOIN signer_table ON request_signer_table.request_signer_signer_id = signer_table.signer_id
            WHERE team_member_table.team_member_team_id = '${teamId}'
            AND request_is_disabled = false
            AND form_table.form_is_disabled = false
            ${requestor}
            ${approver}
            ${status}
            ${form}
            ${project}
            ${idFilter}
            ${search}
            ORDER BY request_view.request_date_created ${sort} 
            OFFSET ${start} ROWS FETCH FIRST ${limit} ROWS ONLY
          `
        );

        request_count = plv8.execute(
          `
            SELECT COUNT(DISTINCT request_id)
            FROM request_view
            INNER JOIN team_member_table ON request_view.request_team_member_id = team_member_table.team_member_id
            INNER JOIN form_table ON request_view.request_form_id = form_table.form_id
            INNER JOIN request_signer_table ON request_view.request_id = request_signer_table.request_signer_request_id
            INNER JOIN signer_table ON request_signer_table.request_signer_signer_id = signer_table.signer_id
            WHERE team_member_table.team_member_team_id = '${teamId}'
            AND request_is_disabled = false
            AND form_table.form_is_disabled = false
            ${requestor}
            ${approver}
            ${status}
            ${form}
            ${project}
            ${idFilter}
            ${search}
          `
        )[0];
      }else {
        request_list = plv8.execute(
          `
            SELECT DISTINCT
              request_view.request_id, 
              request_view.request_formsly_id,
              request_date_created, 
              request_status,
              request_team_member_id,
              request_jira_id,
              request_jira_link,
              request_otp_id,
              request_form_id
            FROM request_view
            INNER JOIN team_member_table ON request_view.request_team_member_id = team_member_table.team_member_id
            INNER JOIN form_table ON request_view.request_form_id = form_table.form_id
            INNER JOIN request_signer_table ON request_view.request_id = request_signer_table.request_signer_request_id
            INNER JOIN signer_table ON request_signer_table.request_signer_signer_id = signer_table.signer_id
            WHERE team_member_table.team_member_team_id = '${teamId}'
            AND request_is_disabled = false
            AND form_table.form_is_disabled = false
            AND signer_team_member_id = '${teamMemberId}'
            AND request_status = 'PENDING'
            AND request_signer_status = 'PENDING'
            ORDER BY request_view.request_date_created ${sort} 
            OFFSET ${start} ROWS FETCH FIRST ${limit} ROWS ONLY
          `
        );
        request_count = plv8.execute(
          `
            SELECT COUNT(DISTINCT request_id)
            FROM request_view
            INNER JOIN team_member_table ON request_view.request_team_member_id = team_member_table.team_member_id
            INNER JOIN form_table ON request_view.request_form_id = form_table.form_id
            INNER JOIN request_signer_table ON request_view.request_id = request_signer_table.request_signer_request_id
            INNER JOIN signer_table ON request_signer_table.request_signer_signer_id = signer_table.signer_id
            WHERE team_member_table.team_member_team_id = '${teamId}'
            AND request_is_disabled = false
            AND form_table.form_is_disabled = false
            AND signer_team_member_id = '${teamMemberId}'
            AND request_status = 'PENDING'
            AND request_signer_status = 'PENDING'
          `
        )[0];
      }

      const request_data = request_list.map(request => {
        const request_team_member = plv8.execute(
          `
            SELECT 
              team_member_table.team_member_team_id, 
              user_table.user_id,
              user_table.user_first_name,
              user_table.user_last_name,
              user_table.user_avatar
            FROM team_member_table
            INNER JOIN user_table ON team_member_table.team_member_user_id = user_table.user_id
            WHERE team_member_table.team_member_id = '${request.request_team_member_id}'
          `
        )[0];
        const request_form = plv8.execute(`SELECT form_id, form_name, form_description FROM form_table WHERE form_id = '${request.request_form_id}'`)[0];
        const request_signer = plv8.execute(
          `
            SELECT 
              request_signer_table.request_signer_id, 
              request_signer_table.request_signer_status, 
              signer_table.signer_is_primary_signer,
              user_table.user_id,
              user_table.user_first_name,
              user_table.user_last_name,
              user_table.user_avatar
            FROM request_signer_table
            INNER JOIN signer_table ON request_signer_table.request_signer_signer_id = signer_table.signer_id
            INNER JOIN team_member_table ON signer_table.signer_team_member_id = team_member_table.team_member_id
            INNER JOIN user_table ON team_member_table.team_member_user_id = user_table.user_id
            WHERE request_signer_table.request_signer_request_id = '${request.request_id}'
          `
        ).map(signer => {
          return {
            request_signer_id: signer.request_signer_id,
            request_signer_status: signer.request_signer_status,
            request_signer: {
              signer_is_primary_signer: signer.signer_is_primary_signer ,
              signer_team_member: {
                team_member_user: {
                  user_id: signer.user_id,
                  user_first_name: signer.user_first_name,
                  user_last_name: signer.user_last_name,
                  user_avatar: signer.user_avatar,
                }
              }
            }
          }
        });

        return {
          request_id: request.request_id, 
          request_formsly_id: request.request_formsly_id,
          request_date_created: request.request_date_created, 
          request_status: request.request_status, 
          request_jira_id: request.request_jira_id,
          request_jira_link: request.request_jira_link,
          request_otp_id: request.request_otp_id,
          request_team_member: {
            team_member_id: request.request_team_member_id,
            team_member_user: {
              user_id: request_team_member.user_id, 
              user_first_name: request_team_member.user_first_name,
              user_last_name: request_team_member.user_last_name,
              user_avatar: request_team_member.user_avatar,
            },
          }, 
          request_form: {
            form_id: request_form.form_id,
            form_name: request_form.form_name,
            form_description: request_form.form_description,
            form_is_disabled: request_form.form_is_disabled,
          }, 
          request_signer: request_signer,
        }
      });

      return_value = {
        data: request_data, 
        count: Number(request_count.count)
      };
    });
    return return_value
$$ LANGUAGE plv8;

-- End: Fetch request list

-- Start: Approve sourced requisition request

CREATE OR REPLACE FUNCTION approve_sourced_requisition_request(
    input_data JSON
)
RETURNS VOID AS $$
  plv8.subtransaction(function(){
    const {
      approveOrRejectParameters,
      teamId,
      responseData,
      itemWithDupId,
      requisitionID
    } = input_data;

    plv8.execute(`
        select approve_or_reject_request('{
            "requestAction": "${approveOrRejectParameters.requestAction}",
            "requestId": "${approveOrRejectParameters.requestId}",
            "isPrimarySigner": ${approveOrRejectParameters.isPrimarySigner},
            "requestSignerId": "${approveOrRejectParameters.requestSignerId}",
            "requestOwnerId": "${approveOrRejectParameters.requestOwnerId}",
            "signerFullName": "${approveOrRejectParameters.signerFullName}",
            "formName": "${approveOrRejectParameters.formName}",
            "memberId": "${approveOrRejectParameters.memberId}",
            "teamId": "${approveOrRejectParameters.teamId}",
        }');
    `);

    const form = plv8.execute(
      `
        SELECT field_table.field_id FROM form_table 
        INNER JOIN team_member_table ON form_table.form_team_member_id = team_member_table.team_member_id
        INNER JOIN section_table ON form_table.form_id = section_table.section_form_id
        INNER JOIN field_table ON section_table.section_id = field_table.field_section_id
        WHERE form_table.form_name='Requisition'
        AND team_member_table.team_member_team_id='${teamId}'
        AND section_table.section_name='Item'
        AND field_table.field_name='Source Project'
      `
    )[0];

    const parsedData = JSON.parse(responseData);

    const inputData = parsedData.sections.map((section) => `('"${section.section_field[2].field_response}"', '${form.field_id}', ${itemWithDupId[`${section.section_field[0].field_response}`] ? `'${itemWithDupId[`${section.section_field[0].field_response}`]}'` : null}, '${requisitionID}')`).join(",");
    plv8.execute(`INSERT INTO request_response_table (request_response, request_response_field_id, request_response_duplicatable_section_id, request_response_request_id) VALUES ${inputData}`);

  });
$$ LANGUAGE plv8;

-- End: Check if the approving or creating rir item quantity are less than the quotation quantity


-- Start: Create Team Project
CREATE OR REPLACE FUNCTION create_team_project(
    input_data JSON
)
RETURNS JSON AS $$
  let team_project_data;
  plv8.subtransaction(function(){
    const {
      teamProjectName,
      teamProjectInitials,
      teamProjectTeamId,
      siteMapId,
      boqId
    } = input_data;

    
   const projectInitialCount = plv8.execute(`
      SELECT COUNT(*) FROM team_project_table 
      WHERE team_project_team_id = $1 
      AND team_project_code ILIKE '%' || $2 || '%';
    `, [teamProjectTeamId, teamProjectInitials])[0].count + 1n;

    const teamProjectCode = teamProjectInitials + projectInitialCount.toString(16).toUpperCase();

    team_project_data = plv8.execute(
      `
        INSERT INTO team_project_table 
          (team_project_name, team_project_code, team_project_team_id, team_project_site_map_attachment_id, team_project_boq_attachment_id) 
        VALUES 
          ('${teamProjectName}', '${teamProjectCode}', '${teamProjectTeamId}', '${siteMapId}', '${boqId}')
        RETURNING *
      `
    )[0];

 });
 return team_project_data;
$$ LANGUAGE plv8;
-- End: Create Team Project

-- Start: Insert Group Member

CREATE OR REPLACE FUNCTION insert_group_member(
    input_data JSON
)
RETURNS JSON AS $$
  let group_data;
  plv8.subtransaction(function(){
    const {
     groupId,
     teamMemberIdList
    } = input_data;

    const teamMemberIdListValues = teamMemberIdList.map(memberId=>`'${memberId}'`).join(",");

    const alreadyMemberData = plv8.execute(`SELECT team_member_id FROM team_group_member_table WHERE team_group_id='${groupId}' AND team_member_id IN (${teamMemberIdListValues});`);

    const alreadyMemberId = alreadyMemberData.map(
      (member) => member.team_member_id
    );

    const insertData = [];
    teamMemberIdList.forEach((memberId) => {
      if (!alreadyMemberId.includes(memberId)) {
        insertData.push({
          team_group_id: groupId,
          team_member_id: memberId,
        });
      }
    });

    const groupMemberValues = insertData
      .map(
        (member) =>
          `('${member.team_member_id}','${member.team_group_id}')`
      )
      .join(",");

    const groupInsertData = plv8.execute(`INSERT INTO team_group_member_table (team_member_id,team_group_id) VALUES ${groupMemberValues} RETURNING *;`);

    const groupInsertValues = groupInsertData.map(group=>`('${group.team_group_member_id}','${group.team_member_id}','${group.team_group_id}')`).join(",");

    const groupJoin = plv8.execute(`SELECT tgm.team_group_member_id, json_build_object( 'team_member_id', tmemt.team_member_id, 'team_member_date_created', tmemt.team_member_date_created, 'team_member_user', ( SELECT json_build_object( 'user_id', usert.user_id, 'user_first_name', usert.user_first_name, 'user_last_name', usert.user_last_name, 'user_avatar', usert.user_avatar, 'user_email', usert.user_email ) FROM user_table usert WHERE usert.user_id = tmemt.team_member_user_id ) ) AS team_member FROM team_group_member_table tgm LEFT JOIN team_member_table tmemt ON tgm.team_member_id = tmemt.team_member_id WHERE (tgm.team_group_member_id,tgm.team_member_id,tgm.team_group_id) IN (${groupInsertValues}) GROUP BY tgm.team_group_member_id ,tmemt.team_member_id;`);

    group_data = {data: groupJoin, count: groupJoin.length};

 });
 return group_data;
$$ LANGUAGE plv8;

-- End: Insert Group Member

-- Start: Insert Project Member

CREATE OR REPLACE FUNCTION insert_project_member(
    input_data JSON
)
RETURNS JSON AS $$
  let project_data;
  plv8.subtransaction(function(){
    const {
     projectId,
     teamMemberIdList
    } = input_data;

    const teamMemberIdListValues = teamMemberIdList.map(memberId=>`'${memberId}'`).join(",")

    const alreadyMemberData = plv8.execute(`SELECT team_member_id FROM team_project_member_table WHERE team_project_id='${projectId}' AND team_member_id IN (${teamMemberIdListValues});`);

    const alreadyMemberId = alreadyMemberData.map(
      (member) => member.team_member_id
    );

    const insertData = [];
    teamMemberIdList.forEach((memberId) => {
      if (!alreadyMemberId.includes(memberId)) {
        insertData.push({
          team_project_id: projectId,
          team_member_id: memberId,
        });
      }
    });

    const projectMemberValues = insertData
      .map(
        (member) =>
          `('${member.team_member_id}','${member.team_project_id}')`
      )
      .join(",");

    const projectInsertData = plv8.execute(`INSERT INTO team_project_member_table (team_member_id,team_project_id) VALUES ${projectMemberValues} RETURNING *;`);

    const projectInsertValues = projectInsertData.map(project=>`('${project.team_project_member_id}','${project.team_member_id}','${project.team_project_id}')`).join(",")

    const projectJoin = plv8.execute(`SELECT tpm.team_project_member_id, json_build_object( 'team_member_id', tmemt.team_member_id, 'team_member_date_created', tmemt.team_member_date_created, 'team_member_user', ( SELECT json_build_object( 'user_id', usert.user_id, 'user_first_name', usert.user_first_name, 'user_last_name', usert.user_last_name, 'user_avatar', usert.user_avatar, 'user_email', usert.user_email ) FROM user_table usert WHERE usert.user_id = tmemt.team_member_user_id ) ) AS team_member FROM team_project_member_table tpm LEFT JOIN team_member_table tmemt ON tpm.team_member_id = tmemt.team_member_id WHERE (tpm.team_project_member_id,tpm.team_member_id,tpm.team_project_id) IN (${projectInsertValues}) GROUP BY tpm.team_project_member_id ,tmemt.team_member_id;`) 

    project_data = {data: projectJoin, count: projectJoin.length};

 });
 return project_data;
$$ LANGUAGE plv8;

-- End: Insert Project Member

-- Start: Update Form Group

CREATE OR REPLACE FUNCTION update_form_group(
    input_data JSON
)
RETURNS VOID AS $$
  plv8.subtransaction(function(){
    const {
     formId,
     isForEveryone,
     groupList
    } = input_data;

    plv8.execute(`UPDATE form_table SET form_is_for_every_member='${isForEveryone?"TRUE":"FALSE"}' WHERE form_id='${formId}';`);

    plv8.execute(`DELETE FROM form_team_group_table WHERE form_id='${formId}';`);

    const newGroupInsertValues = groupList.map((group) =>`('${group}','${formId}')`).join(",");
    
    plv8.execute(`INSERT INTO form_team_group_table (team_group_id,form_id) VALUES ${newGroupInsertValues} RETURNING *;`);
  });
$$ LANGUAGE plv8;

-- End: Update Form Group

-- Start: Get all team members without existing member of the group

CREATE OR REPLACE FUNCTION get_all_team_members_without_group_members(
    input_data JSON
)
RETURNS JSON AS $$
  let member_data;
  plv8.subtransaction(function(){
    const {
     teamId,
     groupId
    } = input_data;

    const teamGroupMemberData = plv8.execute(`SELECT team_member_id FROM team_group_member_table where team_group_id='${groupId}';`);

    const condition = teamGroupMemberData.map((member) => `'${member.team_member_id}'`).join(",");

    let teamMemberList = [];
    
    if(condition.length !== 0){
      teamMemberList = plv8.execute(`SELECT tmt.team_member_id, ( SELECT json_build_object( 'user_id', usert.user_id, 'user_first_name', usert.user_first_name, 'user_last_name', usert.user_last_name, 'user_avatar', usert.user_avatar, 'user_email', usert.user_email ) FROM user_table usert WHERE usert.user_id = tmt.team_member_user_id AND usert.user_is_disabled = FALSE ) AS team_member_user FROM team_member_table tmt WHERE tmt.team_member_team_id = '${teamId}' AND tmt.team_member_is_disabled = FALSE AND tmt.team_member_id NOT IN (${condition})`);
    }else{
      teamMemberList = plv8.execute(`SELECT tmt.team_member_id, ( SELECT json_build_object( 'user_id', usert.user_id, 'user_first_name', usert.user_first_name, 'user_last_name', usert.user_last_name, 'user_avatar', usert.user_avatar, 'user_email', usert.user_email ) FROM user_table usert WHERE usert.user_id = tmt.team_member_user_id AND usert.user_is_disabled = FALSE ) AS team_member_user FROM team_member_table tmt WHERE tmt.team_member_team_id = '${teamId}' AND tmt.team_member_is_disabled = FALSE`);
    }

    member_data = teamMemberList.sort((a, b) =>
      a.user_first_name < b.user_first_name ? -1 : (a.user_first_name > b.user_first_name ? 1 : 0)
    )
 });
 return member_data;
$$ LANGUAGE plv8;

-- End: Get all team members without existing member of the group

-- End: Get all team members without existing member of the project

CREATE OR REPLACE FUNCTION get_all_team_members_without_project_members(
    input_data JSON
)
RETURNS JSON AS $$
  let member_data;
  plv8.subtransaction(function(){
    const {
     teamId,
     projectId
    } = input_data;

    const teamProjectMemberData = plv8.execute(`SELECT team_member_id FROM team_project_member_table where team_project_id='${projectId}';`);

    const condition = teamProjectMemberData.map((member) => `'${member.team_member_id}'`).join(",");

    let teamMemberList = []
    
    if(condition.length !== 0){
      teamMemberList = plv8.execute(`SELECT tmt.team_member_id, ( SELECT json_build_object( 'user_id', usert.user_id, 'user_first_name', usert.user_first_name, 'user_last_name', usert.user_last_name, 'user_avatar', usert.user_avatar, 'user_email', usert.user_email ) FROM user_table usert WHERE usert.user_id = tmt.team_member_user_id AND usert.user_is_disabled = FALSE ) AS team_member_user FROM team_member_table tmt WHERE tmt.team_member_team_id = '${teamId}' AND tmt.team_member_is_disabled = FALSE AND tmt.team_member_id NOT IN (${condition});`);
    }else{
      teamMemberList = plv8.execute(`SELECT tmt.team_member_id, ( SELECT json_build_object( 'user_id', usert.user_id, 'user_first_name', usert.user_first_name, 'user_last_name', usert.user_last_name, 'user_avatar', usert.user_avatar, 'user_email', usert.user_email ) FROM user_table usert WHERE usert.user_id = tmt.team_member_user_id AND usert.user_is_disabled = FALSE ) AS team_member_user FROM team_member_table tmt WHERE tmt.team_member_team_id = '${teamId}' AND tmt.team_member_is_disabled = FALSE`);
    }

    member_data = teamMemberList.sort((a, b) =>
      a.user_first_name < b.user_first_name ? -1 : (a.user_first_name > b.user_first_name ? 1 : 0)
    )

 });
 return member_data;
$$ LANGUAGE plv8;

-- End: Get all team members without existing member of the project

-- Start: Delete team

CREATE OR REPLACE FUNCTION delete_team(
    team_id TEXT,
    team_member_id TEXT
)
RETURNS VOID as $$
  plv8.subtransaction(function(){
    const user = plv8.execute(`SELECT * FROM team_member_table WHERE team_member_team_id='${team_id}' AND team_member_id='${team_member_id}'`)[0];
    const isUserOwner = user.team_member_role === 'OWNER';

    if (!isUserOwner) return;


    plv8.execute(`UPDATE team_table SET team_is_disabled=TRUE WHERE team_id='${team_id}'`);

    plv8.execute(`UPDATE team_member_table SET team_member_is_disabled=TRUE WHERE team_member_team_id='${team_id}'`);

    plv8.execute(`UPDATE invitation_table it
      SET invitation_is_disabled=TRUE
      FROM team_member_table tm
      WHERE tm.team_member_team_id='${team_id}'
      AND tm.team_member_id = it.invitation_from_team_member_id `);

    plv8.execute(`UPDATE form_table ft
      SET form_is_disabled=TRUE
      FROM team_member_table tm
      WHERE tm.team_member_team_id='${team_id}'
      AND tm.team_member_id = ft.form_team_member_id `);

    plv8.execute(`UPDATE request_table rt
      SET request_is_disabled=TRUE
      FROM team_member_table tm
      WHERE tm.team_member_team_id='${team_id}'
      AND tm.team_member_id = rt.request_team_member_id `);

    plv8.execute(`UPDATE signer_table st
      SET signer_is_disabled=TRUE
      FROM team_member_table tm
      WHERE tm.team_member_team_id='${team_id}'
      AND tm.team_member_id = st.signer_team_member_id `);

    plv8.execute(`UPDATE comment_table ct
      SET comment_is_disabled=TRUE
      FROM team_member_table tm
      WHERE tm.team_member_team_id='${team_id}'
      AND tm.team_member_id = ct.comment_team_member_id `);

    plv8.execute(`UPDATE team_group_table SET team_group_is_disabled=TRUE WHERE team_group_team_id='${team_id}'`);

    plv8.execute(`UPDATE team_project_table SET team_project_is_disabled=TRUE WHERE team_project_team_id='${team_id}'`);

    plv8.execute(`UPDATE item_table SET item_is_disabled=TRUE, item_is_available=FALSE WHERE item_team_id='${team_id}'`);

    plv8.execute(`UPDATE item_description_table dt
      SET item_description_is_disabled=TRUE, item_description_is_available=FALSE
      FROM item_table it
      WHERE it.item_team_id='${team_id}'
      AND dt.item_description_item_id = it.item_id `);

    plv8.execute(`UPDATE item_description_field_table AS idf
      SET item_description_field_is_disabled=TRUE, item_description_field_is_available=FALSE
      FROM item_description_table AS dt
      JOIN item_table AS it ON it.item_id = dt.item_description_item_id
      WHERE dt.item_description_id = idf.item_description_field_item_description_id
      AND it.item_team_id = '${team_id}'
      AND dt.item_description_item_id = it.item_id`);

    const userTeamList = plv8.execute(`SELECT * FROM team_member_table WHERE team_member_id='${team_member_id}' AND team_member_is_disabled=FALSE`);

    if (userTeamList.length > 0) {
      plv8.execute(`UPDATE user_table SET user_active_team_id='${userTeamList[0].team_member_team_id}' WHERE user_id='${user.team_member_user_id}'`);
    } else {
      plv8.execute(`UPDATE user_table SET user_active_team_id=NULL WHERE user_id='${user.team_member_user_id}'`);
    }
 });
$$ LANGUAGE plv8;

-- END: Delete team

-- Start: Update multiple approver

CREATE OR REPLACE FUNCTION update_multiple_approver(
  input_data JSON
)
RETURNS JSON as $$
  let approverList = [];
  plv8.subtransaction(function(){
    const {
      teamApproverIdList,
      updateRole
    } = input_data;
    teamApproverIdList.forEach(id => {
      const member = plv8.execute(`UPDATE team_member_table SET team_member_role='${updateRole}' WHERE team_member_id='${id}' RETURNING *`)[0];
      const user = plv8.execute(`SELECT * FROM user_table WHERE user_id='${member.team_member_user_id}'`)[0];

      approverList.push({
        team_member_id: member.team_member_id,
        team_member_user: {
          user_id: user.user_id,
          user_first_name: user.user_first_name,
          user_last_name: user.user_last_name,
          user_avatar: user.user_avatar,
          user_email: user.user_email
        }
      });
    });
 });
 return approverList;
$$ LANGUAGE plv8;

-- END: Update multiple approver

-- Start: Update multiple admin

CREATE OR REPLACE FUNCTION update_multiple_admin(
  input_data JSON
)
RETURNS JSON as $$
  let adminList = [];
  plv8.subtransaction(function(){
    const {
      teamAdminIdList,
      updateRole
    } = input_data;
    teamAdminIdList.forEach(id => {
      const member = plv8.execute(`UPDATE team_member_table SET team_member_role='${updateRole}' WHERE team_member_id='${id}' RETURNING *`)[0];
      const user = plv8.execute(`SELECT * FROM user_table WHERE user_id='${member.team_member_user_id}'`)[0];

      adminList.push({
        team_member_id: member.team_member_id,
        team_member_user: {
          user_id: user.user_id,
          user_first_name: user.user_first_name,
          user_last_name: user.user_last_name,
          user_avatar: user.user_avatar,
          user_email: user.user_email
        }
      });
    });
 });
 return adminList;
$$ LANGUAGE plv8;

-- END: Update multiple admin

-- Start: Request page on load

CREATE OR REPLACE FUNCTION request_page_on_load(
  input_data JSON
)
RETURNS JSON as $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      requestId,
      userId
    } = input_data;

    const request = plv8.execute(`SELECT get_request('${requestId}')`)[0].get_request;
    if(!request) throw new Error('404');
    
    if (!request.request_form.form_is_formsly_form || (request.request_form.form_is_formsly_form && request.form_name === "Subcon")) {
      returnData = {
        request
      };
      return;
    } else {
      const teamId = plv8.execute(`SELECT get_user_active_team_id('${userId}')`)[0].get_user_active_team_id;
      if (!teamId) throw new Error("No team found");

      const teamMember = plv8.execute(`SELECT * FROM team_member_table WHERE team_member_user_id='${userId}' AND team_member_team_id='${teamId}'`)[0];
      
      const connectedRequestIDList = plv8.execute(
        `
          SELECT 
            request_response_request_id,
            request_formsly_id,
            form_name
          FROM request_response_table 
          INNER JOIN request_view ON request_id=request_response_request_id
          INNER JOIN form_table ON form_id=request_form_id 
          WHERE 
            request_response='"${request.request_formsly_id}"' 
            AND request_status='APPROVED'
        `
      );

      const requestList = {
        Requisition: [],
        "Sourced Item": [],
        "Quotation": [],
        "Receiving Inspecting Report": [],
        "Release Order": [],
        "Transfer Receipt": [],
        "Release Quantity": [],
      };

      connectedRequestIDList.forEach((response) => {
        const newFormattedData = {
          request_id: response.request_response_request_id,
          request_formsly_id: response.request_formsly_id,
        };
        switch (response.form_name) {
          case "Requisition":
            requestList["Requisition"].push(newFormattedData);
            break;
          case "Sourced Item":
            requestList["Sourced Item"].push(newFormattedData);
            break;
          case "Quotation":
            requestList["Quotation"].push(newFormattedData);
            break;
          case "Receiving Inspecting Report":
            requestList["Receiving Inspecting Report"].push(newFormattedData);
            break;
          case "Release Order":
            requestList["Release Order"].push(newFormattedData);
            break;
          case "Transfer Receipt":
            requestList["Transfer Receipt"].push(newFormattedData);
            break;
          case "Release Quantity":
            requestList["Release Quantity"].push(newFormattedData);
            break;
        }
      });

      if (request.request_form.form_name === "Requisition") {
        const connectedForm = [];
        const formList = plv8.execute(
          `SELECT 
            form_id, 
            form_name, 
            form_is_for_every_member,
            form_team_member_id,
            form_is_hidden
          FROM form_table
          INNER JOIN team_member_table
          ON team_member_id = form_team_member_id
        WHERE 
          form_is_formsly_form=true
          AND team_member_team_id='${teamId}'
          AND (
            form_name='Quotation' 
            OR form_name='Sourced Item'
          )
        `);

        for(const form of formList){
          const formTeamGroupList = plv8.execute(
            `
              SELECT team_group_id 
              FROM form_team_group_table 
              WHERE form_id = '${form.form_id}'
            `
          );
          
          const teamGroupIdList = formTeamGroupList.map(teamGroupId => `'${teamGroupId.team_group_id}'`);

          const groupMember = plv8.execute(
            `
              SELECT team_group_member_id 
              FROM team_group_member_table 
              WHERE team_member_id = '${teamMember.team_member_id}' 
              ${teamGroupIdList.length !== 0 ? `AND team_group_id IN (${teamGroupIdList})` : ''}
            `);
      
          connectedForm.push({
            form_id: form.form_id,
            form_name: form.form_name,
            form_is_for_every_member: form.form_is_for_every_member,
            form_is_member: Boolean(groupMember.length),
            form_is_hidden: form.form_is_hidden
          })
        }
       
        const canvassData = plv8.execute(
          `
            SELECT 
              request_id,
              request_formsly_id,
              request_status,
              form_name
            FROM request_response_table
            INNER JOIN request_view ON request_response_request_id = request_id
            INNER JOIN form_table ON request_form_id = form_id
            WHERE
              request_response = '"${request.request_formsly_id}"'
              AND request_status = 'PENDING'
              AND form_name = 'Quotation'
            ORDER BY request_formsly_id DESC
          `
        );

        const canvassRequest = canvassData.map(request => request.request_id);

        returnData =  {
          connectedForm,
          connectedRequestIDList: requestList,
          canvassRequest,
          request
        };
      } else if (request.request_form.form_name === "Quotation") {
        const form = plv8.execute(
          `SELECT 
            form_id, 
            form_is_for_every_member,
            form_team_member_id,
            form_is_hidden
          FROM form_table
          INNER JOIN team_member_table
          ON team_member_id = form_team_member_id
          WHERE 
            form_is_formsly_form=true
            AND team_member_team_id='${teamId}'
            AND form_name='Receiving Inspecting Report'
        `)[0];

        const formTeamGroupList = plv8.execute(
          `
            SELECT team_group_id 
            FROM form_team_group_table 
            WHERE form_id = '${form.form_id}'
          `
        );
        const teamGroupIdList = formTeamGroupList.map(teamGroupId => `'${teamGroupId.team_group_id}'`);
        const groupMember = plv8.execute(
          `
            SELECT team_group_member_id 
            FROM team_group_member_table 
            WHERE team_member_id = '${teamMember.team_member_id}' 
            ${teamGroupIdList.length !== 0 ? `AND team_group_id IN (${teamGroupIdList})` : ''}
          `);

        const connectedFormIdAndGroup = {
          formId: form.form_id,
          formName: 'Receiving Inspecting Report',
          formIsForEveryone: form.form_is_for_every_member,
          formIsMember: Boolean(groupMember.length),
          formIsHidden: form.form_is_hidden
        };
      
        returnData =  {
          connectedFormIdAndGroup,
          connectedRequestIDList: requestList,
          request
        };
      } else if (request.request_form.form_name === "Sourced Item") {
        const form = plv8.execute(
          `SELECT 
            form_id, 
            form_is_for_every_member,
            form_team_member_id,
            form_is_hidden
          FROM form_table
          INNER JOIN team_member_table
          ON team_member_id = form_team_member_id
          WHERE 
            form_is_formsly_form=true
            AND team_member_team_id='${teamId}'
            AND form_name='Release Order'
        `)[0];

        const formTeamGroupList = plv8.execute(
          `
            SELECT team_group_id 
            FROM form_team_group_table 
            WHERE form_id = '${form.form_id}'
          `
        );
        const teamGroupIdList = formTeamGroupList.map(teamGroupId => `'${teamGroupId.team_group_id}'`);
        const groupMember = plv8.execute(
          `
            SELECT team_group_member_id 
            FROM team_group_member_table 
            WHERE team_member_id = '${teamMember.team_member_id}' 
            ${teamGroupIdList.length !== 0 ? `AND team_group_id IN (${teamGroupIdList})` : ''}
          `);

        const connectedFormIdAndGroup = {
          formId: form.form_id,
          formName: 'Release Order',
          formIsForEveryone: form.form_is_for_every_member,
          formIsMember: Boolean(groupMember.length),
          formIsHidden: form.form_is_hidden
        };

        const signerData = plv8.execute(
          `
            SELECT signer_id 
            FROM signer_table 
            WHERE 
              signer_form_id='${request.request_form.form_id}' 
              AND signer_is_disabled=false
              AND (
                signer_team_project_id='${request.request_project_id}'
                OR signer_team_project_id IS NULL
              ) 
          `
        );

        const requestSignerData = plv8.execute(
          `
            SELECT 
              request_signer_table.*,
              signer_table.*,
              team_project_name
            FROM request_signer_table
            INNER JOIN signer_table ON signer_id = request_signer_signer_id
            INNER JOIN team_project_table ON team_project_id = signer_team_project_id
            WHERE
              request_signer_request_id='${request.request_id}'
              AND signer_is_disabled=false
          `
        );

        const projectSignerStatus = requestSignerData.map(
            (signer) => ({
              signer_project_name: signer.team_project_name,
              signer_status: signer.request_signer_status,
              signer_team_member_id: signer.signer_team_member_id,
            })
          );
          
        const mainSignerIdList = signerData.map(
          (signer) => signer.signer_id
        );
    
        returnData =  {
          connectedFormIdAndGroup,
          connectedRequestIDList: requestList,
          signerData,
          requestSignerData,
          request: {
            ...request,
            request_signer: request.request_signer.map((requestSigner) => {
              if (
                !mainSignerIdList.includes(
                  requestSigner.request_signer_signer.signer_id
                )
              ) {
                return {
                  ...requestSigner,
                  request_signer_signer: {
                    ...requestSigner.request_signer_signer,
                    signer_is_primary_signer: false,
                  },
                };
              } else {
                return requestSigner;
              }
            }),
          },
          projectSignerStatus
        };
      } else if (request.request_form.form_name === "Release Order") {
        const form = plv8.execute(
          `SELECT 
            form_id, 
            form_is_for_every_member,
            form_team_member_id,
            form_is_hidden
          FROM form_table
          INNER JOIN team_member_table
          ON team_member_id = form_team_member_id
          WHERE 
            form_is_formsly_form=true
            AND team_member_team_id='${teamId}'
            AND form_name='Transfer Receipt'
        `)[0];

        const formTeamGroupList = plv8.execute(
          `
            SELECT team_group_id 
            FROM form_team_group_table 
            WHERE form_id = '${form.form_id}'
          `
        );
        const teamGroupIdList = formTeamGroupList.map(teamGroupId => `'${teamGroupId.team_group_id}'`);
        const groupMember = plv8.execute(
          `
            SELECT team_group_member_id 
            FROM team_group_member_table 
            WHERE team_member_id = '${teamMember.team_member_id}' 
            ${teamGroupIdList.length !== 0 ? `AND team_group_id IN (${teamGroupIdList})` : ''}
          `);

        const connectedFormIdAndGroup = {
          formId: form.form_id,
          formName: 'Transfer Receipt',
          formIsForEveryone: form.form_is_for_every_member,
          formIsMember: Boolean(groupMember.length),
          formIsHidden: form.form_is_hidden
        };
      
        returnData =  {
          connectedFormIdAndGroup,
          connectedRequestIDList: requestList,
          request
        };
      } else{
        returnData =  {
          connectedRequestIDList: requestList,
          request
        };
      }
    }
 });
 return returnData;
$$ LANGUAGE plv8;

-- END: Request page on load

-- Start: Get team member on load

CREATE OR REPLACE FUNCTION get_team_member_on_load(
    input_data JSON
)
RETURNS JSON AS $$
  let team_member_data;
  plv8.subtransaction(function(){
    const {
      teamMemberId
    } = input_data;
    
    const member = plv8.execute(
      `
        SELECT 
          tmt.*, 
          json_build_object( 
            'user_id', usert.user_id, 
            'user_first_name', usert.user_first_name, 
            'user_last_name', usert.user_last_name, 
            'user_avatar', usert.user_avatar, 
            'user_email', usert.user_email,
            'user_phone_number', usert.user_phone_number,
            'user_username', usert.user_username,
            'user_job_title', usert.user_job_title,
            'user_employee_number', uent.user_employee_number
          ) AS team_member_user 
        FROM team_member_table tmt 
        INNER JOIN user_table usert ON usert.user_id = tmt.team_member_user_id
        LEFT JOIN user_employee_number_table uent 
          ON uent.user_employee_number_user_id = usert.user_id
          AND uent.user_employee_number_is_disabled = false
        WHERE team_member_id='${teamMemberId}'
      `
    )[0];

    const memberGroupToSelect = plv8.execute(`SELECT tgmt2.team_group_member_id, tgt2.team_group_name FROM team_group_member_table tgmt2 INNER JOIN team_group_table tgt2 ON tgt2.team_group_id = tgmt2.team_group_id WHERE tgmt2.team_member_id='${teamMemberId}' ORDER BY tgt2.team_group_name ASC LIMIT 10`);

    let groupList = []
    let groupCount = 0
    if(memberGroupToSelect.length > 0){
      const memberGroupToSelectArray = memberGroupToSelect.map(group=>`'${group.team_group_member_id}'`).join(",")

      groupList = plv8.execute(`SELECT tgmt.team_group_member_id , ( SELECT row_to_json(tgt) FROM team_group_table tgt WHERE tgt.team_group_id = tgmt.team_group_id) AS team_group FROM team_group_member_table tgmt WHERE tgmt.team_member_id='${teamMemberId}' AND tgmt.team_group_member_id IN (${memberGroupToSelectArray});`);

      groupCount = plv8.execute(`SELECT COUNT(*) FROM team_group_member_table WHERE team_member_id='${teamMemberId}';`)[0].count
    }
    
    const memberProjectToSelect = plv8.execute(`SELECT tpmt2.team_project_member_id, tpt2.team_project_name FROM team_project_member_table tpmt2 INNER JOIN team_project_table tpt2 ON tpt2.team_project_id = tpmt2.team_project_id WHERE tpmt2.team_member_id='${teamMemberId}' ORDER BY tpt2.team_project_name ASC LIMIT 10`);

    let projectList = []
    let projectCount = 0
    if(memberProjectToSelect.length > 0){
      const memberProjectToSelectArray = memberProjectToSelect.map(project=>`'${project.team_project_member_id}'`).join(",")

      projectList = plv8.execute(`SELECT tpmt.team_project_member_id , ( SELECT row_to_json(tpt) FROM team_project_table tpt WHERE tpt.team_project_id = tpmt.team_project_id) AS team_project FROM team_project_member_table tpmt WHERE tpmt.team_member_id='${teamMemberId}' AND tpmt.team_project_member_id IN (${memberProjectToSelectArray});`);

      projectCount = plv8.execute(`SELECT COUNT(*) FROM team_group_member_table WHERE team_member_id='${teamMemberId}';`)[0].count
    }

    team_member_data = {member: member, groupList, groupCount:`${groupCount}`, projectList, projectCount: `${projectCount}`}
 });
 return team_member_data;
$$ LANGUAGE plv8;

-- END: Get team member on load

-- START: Get team on load

CREATE OR REPLACE FUNCTION get_team_on_load(
    input_data JSON
)
RETURNS JSON AS $$
  let team_data;
  plv8.subtransaction(function(){
    const {
      userId,
      teamMemberLimit
    } = input_data;
    
    const teamId = plv8.execute(`SELECT get_user_active_team_id('${userId}');`)[0].get_user_active_team_id;
    
    const team = plv8.execute(`SELECT * FROM team_table WHERE team_id='${teamId}' AND team_is_disabled=false;`)[0];

    const teamMembers = plv8.execute(
      `
        SELECT tmt.team_member_id, 
        tmt.team_member_role, 
        json_build_object( 
          'user_id', usert.user_id, 
          'user_first_name', usert.user_first_name, 
          'user_last_name', usert.user_last_name, 
          'user_avatar', usert.user_avatar, 
          'user_email', usert.user_email,
          'user_employee_number', uent.user_employee_number
        ) AS team_member_user  
        FROM team_member_table tmt 
        JOIN user_table usert ON tmt.team_member_user_id = usert.user_id
        LEFT JOIN user_employee_number_table uent 
          ON uent.user_employee_number_user_id = usert.user_id
          AND uent.user_employee_number_is_disabled=false
        WHERE 
          tmt.team_member_team_id='${teamId}' 
          AND tmt.team_member_is_disabled=false 
          AND usert.user_is_disabled=false
        ORDER BY
          CASE tmt.team_member_role
              WHEN 'OWNER' THEN 1
              WHEN 'ADMIN' THEN 2
              WHEN 'APPROVER' THEN 3
              WHEN 'MEMBER' THEN 4
          END ASC,
          usert.user_first_name ASC,
          usert.user_last_name ASC
        LIMIT ${teamMemberLimit}
      `
    );

    const teamMembersCount = plv8.execute(
      `
        SELECT COUNT(*)
        FROM team_member_table tmt 
        JOIN user_table usert ON tmt.team_member_user_id = usert.user_id 
        WHERE 
          tmt.team_member_team_id='${teamId}' 
          AND tmt.team_member_is_disabled=false 
          AND usert.user_is_disabled=false
      `
    )[0].count;

    const teamGroups = plv8.execute(`SELECT * FROM team_group_table WHERE team_group_team_id='${teamId}' AND team_group_is_disabled=false ORDER BY team_group_date_created DESC LIMIT 10;`);

    const teamGroupsCount = plv8.execute(`SELECT COUNT(*) FROM team_group_table WHERE team_group_team_id='${teamId}' AND team_group_is_disabled=false;`)[0].count;

    const teamProjects = plv8.execute(
      `
        SELECT 
          team_project_table.*,
          boq.attachment_value AS team_project_boq_attachment_id,
          site_map.attachment_value AS team_project_site_map_attachment_id
        FROM team_project_table 
        LEFT JOIN attachment_table boq ON (
          team_project_boq_attachment_id = boq.attachment_id
          AND boq.attachment_is_disabled = false
        )
        LEFT JOIN attachment_table site_map ON (
          team_project_site_map_attachment_id = site_map.attachment_id
          AND site_map.attachment_is_disabled = false
        )
        WHERE 
          team_project_team_id='${teamId}' 
          AND team_project_is_disabled=false 
        ORDER BY team_project_name ASC 
        LIMIT 10
      `
    );

    const teamProjectsCount = plv8.execute(`SELECT COUNT(*) FROM team_project_table WHERE team_project_team_id='${teamId}' AND team_project_is_disabled=false;`)[0].count;

    team_data = { team, teamMembers, teamGroups, teamGroupsCount:`${teamGroupsCount}`, teamProjects, teamProjectsCount:`${teamProjectsCount}`, teamMembersCount: Number(teamMembersCount)}
 });
 return team_data;
$$ LANGUAGE plv8;

-- END: Get team on load

-- START: Get team members with filter

CREATE OR REPLACE FUNCTION get_team_member_with_filter(
    input_data JSON
)
RETURNS JSON AS $$
  let team_data;
  plv8.subtransaction(function(){
    const {
      teamId,
      page,
      limit,
      search
    } = input_data;

    const start = (page - 1) * limit;
    
    const teamMembers = plv8.execute(
      `
        SELECT 
          tmt.team_member_id, 
          tmt.team_member_role, 
          json_build_object( 
            'user_id', usert.user_id, 
            'user_first_name', usert.user_first_name, 
            'user_last_name', usert.user_last_name, 
            'user_avatar', usert.user_avatar, 
            'user_email', usert.user_email,
            'user_employee_number', uent.user_employee_number
          ) AS team_member_user  
        FROM team_member_table tmt 
        JOIN user_table usert ON tmt.team_member_user_id = usert.user_id
        LEFT JOIN user_employee_number_table uent 
          ON uent.user_employee_number_user_id = usert.user_id
          AND uent.user_employee_number_is_disabled=false
        WHERE 
          tmt.team_member_team_id='${teamId}' 
          AND tmt.team_member_is_disabled=false 
          AND usert.user_is_disabled=false
          ${search && `AND (
            CONCAT(usert.user_first_name, ' ', usert.user_last_name) ILIKE '%${search}%'
            OR usert.user_email ILIKE '%${search}%'
          )`}
        ORDER BY
          CASE tmt.team_member_role
              WHEN 'OWNER' THEN 1
              WHEN 'ADMIN' THEN 2
              WHEN 'APPROVER' THEN 3
              WHEN 'MEMBER' THEN 4
          END ASC,
          usert.user_first_name ASC,
          usert.user_last_name ASC
        OFFSET ${start}
        LIMIT ${limit}
      `
    );

    const teamMembersCount = plv8.execute(
      `
        SELECT COUNT(*)
        FROM team_member_table tmt 
        JOIN user_table usert ON tmt.team_member_user_id = usert.user_id 
        WHERE 
          team_member_team_id='${teamId}' 
          AND tmt.team_member_is_disabled=false 
          AND usert.user_is_disabled=false
          ${search && `AND (
            CONCAT(usert.user_first_name, ' ', usert.user_last_name) ILIKE '%${search}%'
            OR usert.user_email ILIKE '%${search}%'
          )`}
      `
    )[0].count;

    team_data = { teamMembers, teamMembersCount: Number(teamMembersCount) }
 });
 return team_data;
$$ LANGUAGE plv8;

-- END: Get team members with filter

-- START: Get notifications on load

CREATE FUNCTION get_notification_on_load(
    input_data JSON
)
RETURNS JSON AS $$
  let notification_data;
  plv8.subtransaction(function(){
    const {
      userId,
      app,
      page,
      limit,
      unreadOnly
    } = input_data;
    
    const teamId = plv8.execute(`SELECT get_user_active_team_id('${userId}');`)[0].get_user_active_team_id;

    const start = (page - 1) * limit;

    let team_query = '';
    let unread_query = '';
    let last_query = ` ORDER BY notification_date_created DESC LIMIT '${limit}' OFFSET '${start}'`;

    if(teamId) team_query = `OR notification_team_id='${teamId}'`;
    if(unreadOnly) unread_query = 'AND notification_is_read=false';

    const query = (toSelect) => `SELECT ${toSelect} FROM notification_table WHERE notification_user_id='${userId}' AND (notification_app = 'GENERAL' OR notification_app = '${app}') AND (notification_team_id IS NULL ${team_query}) ${unread_query}`

    const notificationList = plv8.execute(`${query('*')} ${last_query};`);
    const totalNotificationCount = plv8.execute(`${query('COUNT(*)')};`)[0].count;
    
    const tab = unreadOnly ? "unread" : "all";
    notification_data = {notificationList, totalNotificationCount: parseInt(totalNotificationCount), tab}
 });
 return notification_data;
$$ LANGUAGE plv8;

-- END: Get notifications on load

-- START: Get ssot on load

CREATE FUNCTION get_ssot_on_load(
    input_data JSON
)
RETURNS JSON AS $$
  let ssot_data;
  plv8.subtransaction(function(){
    const {
      userId,
      app,
      page,
      limit,
      unreadOnly
    } = input_data;
    
    const teamId = plv8.execute(`SELECT get_user_active_team_id('${userId}');`)[0].get_user_active_team_id;

    const ssotData = plv8.execute(`SELECT get_ssot('{ "activeTeam": "${teamId}", "pageNumber": 1, "rowLimit": 10, "search": "", "requisitionFilter": [], "requisitionFilterCount": 0, "supplierList": [] }');`)[0].get_ssot;

    const itemList = plv8.execute(`SELECT * FROM item_table WHERE item_team_id='${teamId}' AND item_is_disabled=false AND item_is_available=true ORDER BY item_general_name ASC;`);

    const projectList = plv8.execute(`SELECT * FROM team_project_table WHERE team_project_team_id='${teamId}' AND team_project_is_disabled=false ORDER BY team_project_name ASC;`);
    
    const itemNameList = itemList.map(item=>item.item_general_name);
    const projectNameList = projectList.map(project=>project.team_project_name);
    
    ssot_data = {data: ssotData, itemNameList, projectNameList}
 });
 return ssot_data;
$$ LANGUAGE plv8;

-- END: Get ssot on load

-- END: Get request list on load

CREATE OR REPLACE FUNCTION get_request_list_on_load(
    input_data JSON
)
RETURNS JSON AS $$
  let request_data;
  plv8.subtransaction(function(){
    const {
      userId
    } = input_data;
    
    const teamId = plv8.execute(`SELECT get_user_active_team_id('${userId}');`)[0].get_user_active_team_id;
    
    const teamMemberId = plv8.execute(`SELECT team_member_id FROM team_member_table WHERE team_member_user_id='${userId}' AND team_member_team_id='${teamId}';`)[0].team_member_id;

    const teamMemberList = plv8.execute(`SELECT tmt.team_member_id, tmt.team_member_role, json_build_object( 'user_id',usert.user_id, 'user_first_name',usert.user_first_name , 'user_last_name',usert.user_last_name) AS team_member_user FROM team_member_table tmt JOIN user_table usert ON tmt.team_member_user_id=usert.user_id WHERE tmt.team_member_team_id='${teamId}' AND tmt.team_member_is_disabled=false;`);

    const isFormslyTeam = plv8.execute(`SELECT COUNT(formt.form_id) > 0 AS isFormslyTeam FROM form_table formt JOIN team_member_table tmt ON formt.form_team_member_id = tmt.team_member_id WHERE tmt.team_member_team_id='${teamId}' AND formt.form_is_formsly_form=true;`)[0].isformslyteam;

    const formListData = plv8.execute(`SELECT formt.form_name, formt.form_id FROM form_table formt JOIN team_member_table tmt ON formt.form_team_member_id = tmt.team_member_id WHERE tmt.team_member_team_id='${teamId}' AND formt.form_is_disabled=false AND formt.form_app='REQUEST';`);

    const formList = formListData.map(form=>({ label: form.form_name, value: form.form_id }));
    
    const requestList = plv8.execute(`SELECT fetch_request_list('{"teamId":"${teamId}", "page":"1", "limit":"13", "requestor":"", "approver":"", "form":"", "idFilter":"", "project":"", "status":"", "search":"", "sort":"DESC"}');`)[0].fetch_request_list;

    const projectList = plv8.execute(`SELECT * FROM team_project_table WHERE team_project_is_disabled=false AND team_project_team_id='${teamId}';`);

    request_data = {teamMemberId,teamMemberList,isFormslyTeam, formList, requestList: requestList.data, requestListCount: requestList.count,projectList}
 });
 return request_data;
$$ LANGUAGE plv8;

-- END: Get request list on load

-- Start: Canvass page on load

CREATE OR REPLACE FUNCTION canvass_page_on_load(
  input_data JSON
)
RETURNS JSON as $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      requestId
    } = input_data;

    const descriptionMatcher = (options, currentItem) => {
      const regex = /\(([^()]+)\)/g;
      let returnData = "";
      for (const option of options) {
        const currentItemResult = currentItem.match(regex);
        const currentItemIndex = currentItem.indexOf("(");
        const currentItemGeneralName = currentItem.slice(0, currentItemIndex - 1);
        const currentItemDescriptionList =
          currentItemResult && currentItemResult[1].slice(1, -1).split(", ");
  
        const optionIndex = option.indexOf("(");
        const optionGeneralName = option.slice(0, optionIndex - 1);
  
        if (
          currentItemGeneralName === optionGeneralName &&
          currentItemDescriptionList
        ) {
          let match = true;
          for (const description of currentItemDescriptionList) {
            if (!option.includes(description)) {
              match = false;
              break;
            }
          }
          if (match) {
            returnData = option;
            break;
          }
        }
      }
      return returnData;
    };

    const requestResponseData = plv8.execute(`SELECT request_response_table.*, field_name, field_order FROM request_response_table INNER JOIN field_table ON field_id = request_response_field_id WHERE request_response_request_id='${requestId}'`);

    const options = {};
    const idForNullDuplicationId = plv8.execute('SELECT uuid_generate_v4()')[0].uuid_generate_v4;
    requestResponseData.forEach((response) => {
      if (response) {
        const fieldName = response.field_name;
        const duplicatableSectionId =
          response.request_response_duplicatable_section_id ??
          idForNullDuplicationId;

        if (response.field_order > 4) {
          if (!options[duplicatableSectionId]) {
            options[duplicatableSectionId] = {
              name: "",
              description: "",
              quantity: 0,
              unit: "",
            };
          }

          if (fieldName === "General Name") {
            options[duplicatableSectionId].name = JSON.parse(
              response.request_response
            );
          } else if (fieldName === "Base Unit of Measurement") {
            options[duplicatableSectionId].unit = JSON.parse(
              response.request_response
            );
          } else if (fieldName === "Quantity") {
            options[duplicatableSectionId].quantity = Number(
              response.request_response
            );
          } else if (
            fieldName === "GL Account" ||
            fieldName === "CSI Code" ||
            fieldName === "CSI Code Description" ||
            fieldName === "Division Description" ||
            fieldName === "Level 2 Major Group Description" ||
            fieldName === "Level 2 Minor Group Description"
          ) {
          } else {
            options[duplicatableSectionId].description += `${
              options[duplicatableSectionId].description ? ", " : ""
            }${fieldName}: ${JSON.parse(response.request_response)}`;
          }
        }
      }
    });

    const itemOptions = Object.keys(options).map(
    (item) =>
      `${options[item].name} (${options[item].quantity} ${options[item].unit}) (${options[item].description})`
    );

    const canvassRequest = plv8.execute(
      `
        SELECT 
          request_id, 
          request_formsly_id,
          request_status,
          form_name
        FROM request_response_table
        INNER JOIN request_table ON request_id = request_response_request_id
        INNER JOIN form_table ON form_id= request_form_id
        WHERE
          request_response='"${requestId}"'
          AND request_status='PENDING'
          AND form_name='Quotation'
        ORDER BY request_formsly_id DESC
      `
    );

    const additionalChargeFields = [
      'Delivery Fee',
      'Bank Charge',
      'Mobilization Charge',
      'Demobilization Charge',
      'Freight Charge',
      'Hauling Charge',
      'Handling Charge',
      'Packing Charge',
    ];

    const summaryData = {};
    let summaryAdditionalDetails= [];

    const quotationRequestList = canvassRequest.map(({ request_id, request_formsly_id }) => {
      const quotationResponseList = plv8.execute(
        `
          SELECT 
            request_response_table.*,
            field_name,
            request_id,
            request_formsly_id
          FROM request_response_table
          INNER JOIN field_table ON field_id = request_response_field_id
          INNER JOIN request_table ON request_id = request_response_request_id
          WHERE
            request_response_request_id = '${request_id}'
            AND field_name IN ('Item', 'Price per Unit', 'Quantity', 'Lead Time', 'Payment Terms', ${additionalChargeFields.map(fee => `'${fee}'`)})
        `
      );
      summaryData[request_formsly_id] = 0;
      summaryAdditionalDetails.push({
        quotation_id: request_id,
        formsly_id: request_formsly_id,
        lead_time: 0,
        payment_terms: "",
      });
      return quotationResponseList;
    });

    const canvassData = {};
    const lowestPricePerItem = {};
    const requestAdditionalCharge = {};
    let lowestAdditionalCharge = 999999999;

    itemOptions.forEach((item) => {
      canvassData[item] = [];
      lowestPricePerItem[item] = 999999999;
    });

    quotationRequestList.forEach((request) => {
      let currentItem = "";
      let tempAdditionalCharge = 0;

      request.forEach((response) => {
        if (response.field_name === "Item") {
          currentItem = descriptionMatcher(itemOptions, JSON.parse(response.request_response));
          canvassData[currentItem].push({
            quotationId: response.request_formsly_id,
            price: 0,
            quantity: 0,
          });
        } else if (
          response.field_name === "Price per Unit"
        ) {
          const price = Number(response.request_response);
          canvassData[currentItem][canvassData[currentItem].length - 1].price =
            price;
          if (price < lowestPricePerItem[currentItem]) {
            lowestPricePerItem[currentItem] = price;
          }
          summaryData[response.request_formsly_id] +=
            price;
        } else if (
          response.field_name === "Payment Terms"
        ) {
          summaryAdditionalDetails = summaryAdditionalDetails.map((request) => {
            if (request.quotation_id === response.request_response_request_id)
              return {
                ...request,
                payment_terms: JSON.parse(response.request_response),
              };
            else return request;
          });
        } else if (response.field_name === "Lead Time") {
          summaryAdditionalDetails = summaryAdditionalDetails.map((request) => {
            if (request.quotation_id === response.request_response_request_id)
              return { ...request, lead_time: Number(response.request_response) };
            else return request;
          });
        } else if (response.field_name === "Quantity") {
          canvassData[currentItem][canvassData[currentItem].length - 1].quantity =
            Number(response.request_response);
        } else if (
          additionalChargeFields.includes(
            response.field_name
          )
        ) {
          const price = Number(response.request_response);
          summaryData[response.request_formsly_id] +=
            price;
          tempAdditionalCharge += price;
        }
      });

      requestAdditionalCharge[
        request[0].request_formsly_id
      ] = tempAdditionalCharge;
      if (tempAdditionalCharge < lowestAdditionalCharge) {
        lowestAdditionalCharge = tempAdditionalCharge;
      }
    });

    const sortedQuotation = Object.entries(summaryData)
      .sort(([, a], [, b]) => a - b)
      .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
    const recommendedQuotationId = Object.keys(sortedQuotation)[0];
    const request_id = canvassRequest.find(
      (request) => request.request_formsly_id === recommendedQuotationId
    )?.request_id;

    returnData = {
      canvassData,
      lowestPricePerItem,
      summaryData,
      summaryAdditionalDetails,
      lowestQuotation: {
        id: recommendedQuotationId,
        request_id: request_id,
        value: sortedQuotation[recommendedQuotationId],
      },
      requestAdditionalCharge,
      lowestAdditionalCharge,
    };
 });
 return returnData;
$$ LANGUAGE plv8;



-- END: Canvass page on load

-- Start: Form list page on load

CREATE OR REPLACE FUNCTION form_list_page_on_load(
  input_data JSON
)
RETURNS JSON as $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      userId,
      limit
    } = input_data;

    const teamId = plv8.execute(`SELECT get_user_active_team_id('${userId}')`)[0].get_user_active_team_id;

    const formList = plv8.execute(
      `
        SELECT 
          form_table.*, 
          team_member_table.*,
          user_id,
          user_first_name,
          user_last_name,
          user_avatar
        FROM form_table 
        INNER JOIN team_member_table ON team_member_id = form_team_member_id
        INNER JOIN user_table ON user_id = team_member_user_id
        WHERE
          team_member_team_id = '${teamId}'
          AND form_is_disabled = false
          AND form_app = 'REQUEST'
        LIMIT ${limit}
      `);

    const formListCount = plv8.execute(
      `
        SELECT COUNT(*)
        FROM form_table 
        INNER JOIN team_member_table ON team_member_id = form_team_member_id
        INNER JOIN user_table ON user_id = team_member_user_id
        WHERE
          team_member_team_id = '${teamId}'
          AND form_is_disabled = false
          AND form_app = 'REQUEST'
        LIMIT ${limit}
      `)[0].count;

    const teamMemberList = plv8.execute(
      `
        SELECT
          team_member_id,
          team_member_role,
          user_id,
          user_first_name,
          user_last_name
        FROM team_member_table
        INNER JOIN user_table ON user_id = team_member_user_id
        WHERE
          team_member_team_id = '${teamId}'
          AND team_member_is_disabled = false
      `
    );

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
      formListCount: Number(`${formListCount}`),
      teamMemberList: teamMemberList.map(teamMember => {
        return {
          team_member_id: teamMember.team_member_id,
          team_member_role: teamMember.team_member_role,
          team_member_user: {
            user_id: teamMember.user_id,
            user_first_name: teamMember.user_first_name,
            user_last_name: teamMember.user_last_name,
          }
        }
      }),
      teamId
    }
 });
 return returnData;
$$ LANGUAGE plv8;

-- END: Form list page on load

-- Start: Build form page on load

CREATE OR REPLACE FUNCTION build_form_page_on_load(
  input_data JSON
)
RETURNS JSON as $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      userId
    } = input_data;

    const teamId = plv8.execute(`SELECT get_user_active_team_id('${userId}')`)[0].get_user_active_team_id;
    const teamMemberList = plv8.execute(
      `
        SELECT
          team_member_id,
          team_member_role,
          user_id,
          user_first_name,
          user_last_name
        FROM team_member_table
        INNER JOIN user_table ON user_id = team_member_user_id
        WHERE 
          team_member_team_id = '${teamId}'
          AND team_member_is_disabled = false
          AND (team_member_role = 'APPROVER' OR team_member_role = 'OWNER')
        ORDER BY user_first_name, user_last_name ASC
      `
    );
    const groupList = plv8.execute(`SELECT * FROM team_group_table WHERE team_group_team_id = '${teamId}' AND team_group_is_disabled = false`);
    const formId = plv8.execute('SELECT uuid_generate_v4()')[0].uuid_generate_v4;

    returnData = {
      teamMemberList: teamMemberList.map(teamMember => {
        return {   
          team_member_id: teamMember.team_member_id,
          team_member_role: teamMember.team_member_role,
          team_member_user: {
            user_id: teamMember.user_id,
            user_first_name: teamMember.user_first_name,
            user_last_name: teamMember.user_last_name,
          }
        }
      }),
      groupList,
      formId
    }
 });
 return returnData;
$$ LANGUAGE plv8;

-- END: Build form page on load

-- Start: Form page on load

CREATE OR REPLACE FUNCTION form_page_on_load(
  input_data JSON
)
RETURNS JSON as $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      userId,
      isFormslyForm,
      formName,
      limit
    } = input_data;

    const teamId = plv8.execute(`SELECT get_user_active_team_id('${userId}')`)[0].get_user_active_team_id;
 
    const teamMembers = plv8.execute(
      `
        SELECT
          team_member_id,
          team_member_role,
          user_id,
          user_first_name,
          user_last_name
        FROM team_member_table
        INNER JOIN user_table ON user_id = team_member_user_id
        WHERE 
          team_member_team_id = '${teamId}'
          AND team_member_is_disabled = false
          AND (team_member_role = 'APPROVER' OR team_member_role = 'OWNER')
        ORDER BY user_first_name, user_last_name ASC
      `
    );
    const teamMemberList = teamMembers.map(member => {
      return {
        team_member_id: member.team_member_id,
        team_member_role: member.team_member_role,
        team_member_user: {
          user_id: member.user_id,
          user_first_name: member.user_first_name,
          user_last_name: member.user_last_name,
        }
      }
    })

    const teamGroupList = plv8.execute(`SELECT * FROM team_group_table WHERE team_group_team_id = '${teamId}' AND team_group_is_disabled = false`);
 
    if(isFormslyForm){
      const teamProjectList = plv8.execute(`SELECT * FROM team_project_table WHERE team_project_team_id = '${teamId}' AND team_project_is_disabled = false ORDER BY team_project_name ASC LIMIT ${limit}`);
      const teamProjectListCount = plv8.execute(`SELECT COUNT(*) FROM team_project_table WHERE team_project_team_id = '${teamId}' AND team_project_is_disabled = false`)[0].count;
    
      if(formName === 'Requisition'){
        const items = [];
        const itemData = plv8.execute(`SELECT * FROM item_table WHERE item_team_id = '${teamId}' AND item_is_disabled = false ORDER BY item_general_name ASC LIMIT ${limit}`);
        const itemListCount = plv8.execute(`SELECT COUNT(*) FROM item_table WHERE item_team_id = '${teamId}' AND item_is_disabled = false`)[0].count;

        itemData.forEach(value => {
          const itemDescription = plv8.execute(`SELECT * FROM item_description_table WHERE item_description_item_id = '${value.item_id}' AND item_description_is_disabled = false ORDER BY item_description_order ASC`);
          
          const itemDivision = plv8.execute(`SELECT * FROM item_division_table WHERE item_division_item_id = '${value.item_id}' ORDER BY item_division_value ASC`);
          
          items.push({
            ...value,
            item_division_id_list: itemDivision.map(division => division.item_division_value),
            item_description: itemDescription
          })
        })

        returnData = {
          items,
          itemListCount: Number(`${itemListCount}`),
          teamMemberList,
          teamGroupList,
          teamProjectList,
          teamProjectListCount: Number(`${teamProjectListCount}`),
        }
      } else if (formName === 'Quotation'){
        const suppliers = plv8.execute(`SELECT * FROM supplier_table WHERE supplier_team_id = '${teamId}' AND supplier_is_disabled = false ORDER BY supplier_date_created DESC LIMIT ${limit}`);
        const supplierListCount = plv8.execute(`SELECT COUNT(*) FROM supplier_table WHERE supplier_team_id = '${teamId}' AND supplier_is_disabled = false`)[0].count;

        returnData = {
          teamMemberList,
          suppliers,
          supplierListCount: Number(`${supplierListCount}`),
          teamGroupList,
          teamProjectList,
          teamProjectListCount: Number(`${teamProjectListCount}`)
        }
      } else if (formName === 'Subcon'){
        const services = [];
        const serviceData = plv8.execute(`SELECT * FROM service_table WHERE service_team_id = '${teamId}' AND service_is_disabled = false LIMIT ${limit}`);
        const serviceListCount = plv8.execute(`SELECT COUNT(*) FROM service_table WHERE service_team_id = '${teamId}' AND service_is_disabled = false`)[0].count;

        serviceData.forEach(value => {
          const serviceScope = plv8.execute(`SELECT * FROM service_scope_table WHERE service_scope_service_id = '${value.service_id}'`);
          services.push({
            ...value,
            service_scope: serviceScope
          })
        });

        const suppliers = plv8.execute(`SELECT * FROM supplier_table WHERE supplier_team_id = '${teamId}' AND supplier_is_disabled = false ORDER BY supplier_date_created DESC LIMIT ${limit}`);
        const supplierListCount = plv8.execute(`SELECT COUNT(*) FROM supplier_table WHERE supplier_team_id = '${teamId}' AND supplier_is_disabled = false`)[0].count;

        returnData = {
          services,
          serviceListCount: Number(`${serviceListCount}`),
          teamMemberList,
          teamGroupList,
          teamProjectList,
          teamProjectListCount: Number(`${teamProjectListCount}`),
          suppliers,
          supplierListCount: Number(`${supplierListCount}`),
        }
      } else if (formName === 'Other Expenses'){
        const otherExpensesTypes = plv8.execute(`
          SELECT 
            other_expenses_type_table.*,
            other_expenses_category
          FROM other_expenses_type_table 
          INNER JOIN other_expenses_category_table ON other_expenses_category_id = other_expenses_type_category_id
          WHERE 
            other_expenses_category_team_id = '${teamId}' 
            AND other_expenses_type_is_disabled = false
          ORDER BY other_expenses_type
          LIMIT ${limit}
        `);
        const otherExpensesTypeCount = plv8.execute(`
          SELECT COUNT(*)
          FROM other_expenses_type_table 
          INNER JOIN other_expenses_category_table ON other_expenses_category_id = other_expenses_type_category_id
          WHERE 
            other_expenses_category_team_id = '${teamId}' 
            AND other_expenses_type_is_disabled = false 
        `)[0].count;

        returnData = {
          otherExpensesTypes,
          otherExpensesTypeCount: Number(otherExpensesTypeCount),
          teamMemberList,
          teamGroupList,
          teamProjectList,
          teamProjectListCount: Number(teamProjectListCount)
        }
      } else {
        returnData = {
          teamMemberList,
          teamGroupList,
          teamProjectList,
          teamProjectListCount: Number(`${teamProjectListCount}`)
        }
      }
    }else{
      returnData = {
        teamMemberList, 
        teamGroupList
      }
    }
 });
 return returnData;
$$ LANGUAGE plv8;

-- END: Form page on load

-- Start: Create request page on load

CREATE OR REPLACE FUNCTION create_request_page_on_load(
  input_data JSON
)
RETURNS JSON as $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      formId,
      userId,
      requisitionId,
      quotationId,
      sourcedItemId,
      releaseOrderId
    } = input_data;

    const teamId = plv8.execute(`SELECT get_user_active_team_id('${userId}')`)[0].get_user_active_team_id;
    if (!teamId) throw new Error("No team found");

    const teamMember = plv8.execute(`SELECT * FROM team_member_table WHERE team_member_user_id = '${userId}' AND team_member_team_id = '${teamId}'`)[0];
    if (!teamMember) throw new Error("No team member found");

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
          user_username
        FROM form_table
        INNER JOIN team_member_table ON team_member_id = form_team_member_id
        INNER JOIN user_table ON user_id = team_member_user_id
        WHERE 
          form_id = '${formId}'
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
        FROM signer_table
        INNER JOIN team_member_table ON team_member_id = signer_team_member_id
        INNER JOIN user_table ON user_id = team_member_user_id
        WHERE 
          signer_is_disabled = false
          AND signer_team_project_id IS null
          AND signer_form_id = '${formId}'
      `
    );

    const sectionData = plv8.execute(
      `
        SELECT *
        FROM section_table
        WHERE section_form_id = '${formId}'
        ORDER BY section_order ASC
      `
    );

    const section = sectionData.map(section => {
      const fieldData = plv8.execute(
        `
          SELECT *
          FROM field_table
          WHERE field_section_id = '${section.section_id}'
          ORDER BY field_order ASC
        `
      );
      const fieldWithOption = fieldData.map(field => {
        const optionData = plv8.execute(
          `
            SELECT *
            FROM option_table
            WHERE option_field_id = '${field.field_id}'
            ORDER BY option_order ASC
          `
        );
        return {
          ...field,
          field_option: optionData
        };
      });

      return {
        ...section,
        section_field: fieldWithOption,
      }
    });

    const formTeamGroupData = plv8.execute(
      `
        SELECT
          team_group_table.team_group_id,
          team_group_table.team_group_name,
          team_group_table.team_group_is_disabled
        FROM form_team_group_table
        INNER JOIN team_group_table ON team_group_table.team_group_id = form_team_group_table.team_group_id       
        WHERE form_team_group_table.form_id = '${formId}'
      `
    );
 
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
        }
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
      form_section: section,
      form_team_group: formTeamGroupData.map(teamGroup => {
        return {
          team_group: teamGroup
        }
      })
    };

    let requestProjectId = "";
    if (requisitionId) {
      const requestData = plv8.execute(
        `
          SELECT 
            request_project_id
          FROM request_table
          WHERE 
            request_id = '${requisitionId}'
            AND request_is_disabled = false
        `
      )[0];
      requestProjectId = requestData.request_project_id;
    }

    if (form.form_is_formsly_form) {
      if (form.form_name === "Requisition") {
        const itemData = plv8.execute(
          `
            SELECT *
            FROM item_table
            WHERE
              item_team_id = '${teamId}'
              AND item_is_disabled = false
              AND item_is_available = true
              ORDER BY item_general_name ASC
          `
        );

        const items = itemData.map(item => {
           const itemDescriptionData = plv8.execute(
            `
              SELECT *
              FROM item_description_table
              WHERE
                item_description_item_id = '${item.item_id}'
            `
          );
          return {
            ...item,
            item_description: itemDescriptionData
          }
        });

        const itemOptions = items.map((item, index) => {
          return {
            option_field_id: form.form_section[1].section_field[0].field_id,
            option_id: item.item_id,
            option_order: index,
            option_value: item.item_general_name,
          };
        });

        const projects = plv8.execute(
          `
            SELECT 
              team_project_table.*
            FROM team_project_member_table
            INNER JOIN team_project_table ON team_project_table.team_project_id = team_project_member_table.team_project_id
            WHERE
              team_member_id = '${teamMember.team_member_id}'
            ORDER BY team_project_name
          `
        );

        const projectOptions = projects.map((project, index) => {
          return {
            option_field_id: form.form_section[0].section_field[0].field_id,
            option_id: project.team_project_id,
            option_order: index,
            option_value: project.team_project_name,
          };
        });

        const specialApprover = plv8.execute(
          `
            SELECT 
              special_approver_table.*,
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
            FROM special_approver_table
            INNER JOIN signer_table ON signer_id = special_approver_signer_id
            INNER JOIN team_member_table ON team_member_id = signer_team_member_id
            INNER JOIN user_table ON user_id = team_member_user_id
          `
        );

        const specialApproverWithItem = specialApprover.map(approver => {
          const itemList = plv8.execute(`SELECT * FROM special_approver_item_table WHERE special_approver_item_special_approver_id = '${approver.special_approver_id}'`);
          return {
            ...approver,
            special_approver_item_list: itemList.map(item => item.special_approver_item_value)
          }
        })

        const suppliers = plv8.execute(
          `
            SELECT *
            FROM supplier_table
            WHERE
              supplier_is_available = true
              AND supplier_is_disabled = false
              AND supplier_team_id = '${teamId}'
            ORDER BY supplier ASC
            LIMIT 100
          `
        );

        const supplierOptions = suppliers.map((suppliers, index) => {
          return {
            option_field_id: form.form_section[0].section_field[0].field_id,
            option_id: suppliers.supplier_id,
            option_order: index,
            option_value: suppliers.supplier,
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
                  ...form.form_section[1].section_field.slice(0, 9),
                  {
                    ...form.form_section[1].section_field[9],
                    field_option: supplierOptions
                  }
                ],
              },
            ],
          },
          itemOptions,
          projectOptions,
          specialApprover: specialApproverWithItem.map(specialApprover => {
            return {
              special_approver_id: specialApprover.special_approver_id,
              special_approver_item_list: specialApprover.special_approver_item_list,
              special_approver_signer: {
                signer_id: specialApprover.signer_id,
                signer_is_primary_signer: specialApprover.signer_is_primary_signer,
                signer_action: specialApprover.signer_action,
                signer_order: specialApprover.signer_order,
                signer_is_disabled: specialApprover.signer_is_disabled,
                signer_team_project_id: specialApprover.signer_team_project_id,
                signer_team_member: {
                  team_member_id: specialApprover.team_member_id,
                  team_member_user: {
                    user_id: specialApprover.user_id,
                    user_first_name: specialApprover.user_first_name,
                    user_last_name: specialApprover.user_last_name,
                    user_avatar: specialApprover.user_avatar,
                  }
                }
              }
            }
          })
        }
        return;
      } else if (form.form_name === "Subcon") {
        const serviceData = plv8.execute(
          `
            SELECT *
            FROM service_table
            WHERE
              service_team_id = '${teamId}'
              AND service_is_disabled = false
              AND service_is_available = true
              ORDER BY service_name ASC
          `
        );

        const services = serviceData.map(service => {
           const serviceScopeData = plv8.execute(
            `
              SELECT *
              FROM service_scope_table
              WHERE
                service_scope_service_id = '${service.service_id}'
            `
          );
          return {
            ...service,
            service_scope: serviceScopeData
          }
        });

        const serviceOptions = services.map((service, index) => {
          return {
            option_field_id: form.form_section[1].section_field[0].field_id,
            option_id: service.service_id,
            option_order: index,
            option_value: service.service_name,
          };
        });

        const projects = plv8.execute(
          `
            SELECT 
              team_project_table.*
            FROM team_project_member_table
            INNER JOIN team_project_table ON team_project_table.team_project_id = team_project_member_table.team_project_id
            WHERE
              team_member_id = '${teamMember.team_member_id}'
            ORDER BY team_project_name
          `
        );

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
                ...form.form_section[1],
                section_field: [
                  form.form_section[1].section_field[0],
                ],
              },
            ],
          },
          serviceOptions,
          projectOptions,
        }
        return;
      } else if (form.form_name === "Services") {
        const projects = plv8.execute(
          `
            SELECT 
              team_project_table.*
            FROM team_project_member_table
            INNER JOIN team_project_table ON team_project_table.team_project_id = team_project_member_table.team_project_id
            WHERE
              team_member_id = '${teamMember.team_member_id}'
            ORDER BY team_project_name
          `
        );

        const projectOptions = projects.map((project, index) => {
          return {
            option_field_id: form.form_section[0].section_field[0].field_id,
            option_id: project.team_project_id,
            option_order: index,
            option_value: project.team_project_name,
          };
        });

        const suppliers = plv8.execute(
          `
            SELECT *
            FROM supplier_table
            WHERE
              supplier_is_available = true
              AND supplier_is_disabled = false
              AND supplier_team_id = '${teamId}'
            ORDER BY supplier ASC
            LIMIT 100
          `
        );

        const supplierOptions = suppliers.map((suppliers, index) => {
          return {
            option_field_id: form.form_section[1].section_field[9].field_id,
            option_id: suppliers.supplier_id,
            option_order: index,
            option_value: suppliers.supplier,
          };
        });

        const categories = plv8.execute(
          `
            SELECT *
            FROM service_category_table
            WHERE 
              service_category_team_id = '${teamMember.team_member_team_id}'
              AND service_category_is_disabled = false
              AND service_category_is_available = true
          `
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
            SELECT *
            FROM distinct_division_view
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
            SELECT *
            FROM general_unit_of_measurement_table
            WHERE 
              general_unit_of_measurement_team_id = '${teamMember.team_member_team_id}'
              AND general_unit_of_measurement_is_disabled = false
              AND general_unit_of_measurement_is_available = true
            ORDER BY general_unit_of_measurement
          `
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
                  ...form.form_section[1].section_field.slice(5, 9),
                  {
                    ...form.form_section[1].section_field[9],
                    field_option: supplierOptions
                  }
                ],
              },
            ],
          },
          projectOptions,
        }
        return;
      } else if (form.form_name === "Other Expenses") {
        const projects = plv8.execute(
          `
            SELECT 
              team_project_table.*
            FROM team_project_member_table
            INNER JOIN team_project_table ON team_project_table.team_project_id = team_project_member_table.team_project_id
            WHERE
              team_member_id = '${teamMember.team_member_id}'
            ORDER BY team_project_name
          `
        );

        const projectOptions = projects.map((project, index) => {
          return {
            option_field_id: form.form_section[0].section_field[0].field_id,
            option_id: project.team_project_id,
            option_order: index,
            option_value: project.team_project_name,
          };
        });

        const suppliers = plv8.execute(
          `
            SELECT *
            FROM supplier_table
            WHERE
              supplier_is_available = true
              AND supplier_is_disabled = false
              AND supplier_team_id = '${teamId}'
            ORDER BY supplier ASC
            LIMIT 100
          `
        );

        const supplierOptions = suppliers.map((suppliers, index) => {
          return {
            option_field_id: form.form_section[1].section_field[9].field_id,
            option_id: suppliers.supplier_id,
            option_order: index,
            option_value: suppliers.supplier,
          };
        });

        const categories = plv8.execute(
          `
            SELECT *
            FROM other_expenses_category_table
            WHERE 
              other_expenses_category_team_id = '${teamMember.team_member_team_id}'
              AND other_expenses_category_is_disabled = false
              AND other_expenses_category_is_available = true
          `
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
            SELECT *
            FROM csi_code_table
            WHERE csi_code_division_id = '01'
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
            SELECT *
            FROM general_unit_of_measurement_table
            WHERE 
              general_unit_of_measurement_team_id = '${teamMember.team_member_team_id}'
              AND general_unit_of_measurement_is_disabled = false
              AND general_unit_of_measurement_is_available = true
          `
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
                  ...form.form_section[1].section_field.slice(6, 9),
                  {
                    ...form.form_section[1].section_field[9],
                    field_option: supplierOptions
                  }
                ],
              },
            ],
          },
          projectOptions,
        }
        return;
      }

      const project = plv8.execute(
        `
          SELECT team_project_table.*
          FROM request_table
          INNER JOIN  team_project_table ON team_project_id = request_project_id
          WHERE request_id = '${requisitionId}'
        `
      )[0];

      if (!project) throw new Error();

      const projectSignerData = plv8.execute(
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
          FROM signer_table
          INNER JOIN team_member_table ON team_member_id = signer_team_member_id
          INNER JOIN user_table ON user_id = team_member_user_id
          WHERE
            signer_team_project_id = '${project.team_project_id}'
            AND signer_form_id = '${formId}'
            AND signer_is_disabled = false
        `
      );

      const projectSigner = projectSignerData.map(signer => {
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
      })


      if (form.form_name === "Sourced Item") {
        const isRequestIdValid = plv8.execute(
          `
            SELECT COUNT(*) 
            FROM request_table 
            WHERE 
              request_id = '${requisitionId}'
              AND request_status = 'APPROVED'
              AND request_is_disabled = false
          `
        )[0];
        if (!Number(isRequestIdValid.count)) {
          throw new Error('404')
        }

        const requestResponseData = plv8.execute(
          `
            SELECT
              request_response_table.*,
              field_name,
              field_order
            FROM request_response_table 
            INNER JOIN field_table ON field_id  = request_response_field_id
            WHERE 
              request_response_request_id = '${requisitionId}'
            ORDER BY request_response_duplicatable_section_id, field_name, field_order ASC
          `
        );

        const items = {};
        const idForNullDuplicationId = plv8.execute('SELECT uuid_generate_v4()')[0].uuid_generate_v4;
        requestResponseData.forEach((response) => {
          if (response) {
            const fieldName = response.field_name;
            const duplicatableSectionId =
              response.request_response_duplicatable_section_id ??
              idForNullDuplicationId;

            if (response.field_order > 4) {
              if (!items[duplicatableSectionId]) {
                items[duplicatableSectionId] = {
                  name: "",
                  description: "",
                  quantity: 0,
                  unit: "",
                };
              }

              if (fieldName === "General Name") {
                items[duplicatableSectionId].name = JSON.parse(
                  response.request_response
                );
              } else if (fieldName === "Base Unit of Measurement") {
                items[duplicatableSectionId].unit = JSON.parse(
                  response.request_response
                );
              } else if (fieldName === "Quantity") {
                items[duplicatableSectionId].quantity = Number(
                  response.request_response
                );
              } else if (
                fieldName === "GL Account" ||
                fieldName === "CSI Code" ||
                fieldName === "CSI Code Description" ||
                fieldName === "Division Description" ||
                fieldName === "Level 2 Major Group Description" ||
                fieldName === "Level 2 Minor Group Description"
              ) {
              } else {
                items[duplicatableSectionId].description += `${
                  items[duplicatableSectionId].description ? ", " : ""
                }${fieldName}: ${JSON.parse(response.request_response)}`;
              }
            }
          }
        });

        const itemOptions = Object.keys(items).map((item, index) => {
          const value = `${items[item].name} (${items[item].quantity} ${items[item].unit}) (${items[item].description})`;
          return {
            option_field_id: form.form_section[1].section_field[0].field_id,
            option_id: item,
            option_order: index,
            option_value: value,
          };
        });

        const teamProjects = plv8.execute(
          `
            SELECT *
            FROM team_project_table
            WHERE team_project_team_id = '${teamId}'
            AND team_project_is_disabled = false
            ORDER BY team_project_name
          `
        );

        const projectOptions = teamProjects.filter((project, index) => {
          if(requestProjectId === project.team_project_id){
            return {
              option_field_id: form.form_section[1].section_field[2].field_id,
              option_id: project.team_project_name,
              option_order: index,
              option_value: project.team_project_name,
            };
          }
        });

        returnData = {
          form: {
            ...form,
            form_section: [
              form.form_section[0],
              {
                ...form.form_section[1],
                section_field: [
                  ...form.form_section[1].section_field.slice(0, 2),
                  {
                    ...form.form_section[1].section_field[2],
                    field_option: projectOptions
                  },
                ],
              },
            ],
            form_signer:
              projectSigner.length !== 0 ? projectSigner : form.form_signer,
          },
          itemOptions,
          requestProjectId,
          requestingProject: project.team_project_name,
        };
        return;
      }
      else if (form.form_name === "Quotation") {
        const isRequestIdValid = plv8.execute(
          `
            SELECT COUNT(*) 
            FROM request_table 
            WHERE 
              request_id = '${requisitionId}'
              AND request_status = 'APPROVED'
              AND request_is_disabled = false
          `
        )[0];
        if (!Number(isRequestIdValid.count)) {
          throw new Error('404')
        }

        const requestResponseData = plv8.execute(
          `
            SELECT
              request_response_table.*,
              field_name,
              field_order
            FROM request_response_table 
            INNER JOIN field_table ON field_id  = request_response_field_id
            WHERE 
              request_response_request_id = '${requisitionId}'
            ORDER BY request_response_duplicatable_section_id, field_name, field_order ASC
          `
        );

        const items = {};
        const idForNullDuplicationId = plv8.execute('SELECT uuid_generate_v4()')[0].uuid_generate_v4;
        requestResponseData.forEach((response) => {
          if (response) {
            const fieldName = response.field_name;
            const duplicatableSectionId =
              response.request_response_duplicatable_section_id ??
              idForNullDuplicationId;

            if (response.field_order > 4) {
              if (!items[duplicatableSectionId]) {
                items[duplicatableSectionId] = {
                  name: "",
                  description: "",
                  quantity: 0,
                  unit: "",
                };
              }

              if (fieldName === "General Name") {
                items[duplicatableSectionId].name = JSON.parse(
                  response.request_response
                );
              } else if (fieldName === "Base Unit of Measurement") {
                items[duplicatableSectionId].unit = JSON.parse(
                  response.request_response
                );
              } else if (fieldName === "Quantity") {
                items[duplicatableSectionId].quantity = Number(
                  response.request_response
                );
              } else if (
                fieldName === "GL Account" ||
                fieldName === "CSI Code" ||
                fieldName === "CSI Code Description" ||
                fieldName === "Division Description" ||
                fieldName === "Level 2 Major Group Description" ||
                fieldName === "Level 2 Minor Group Description"
              ) {
              } else {
                items[duplicatableSectionId].description += `${
                  items[duplicatableSectionId].description ? ", " : ""
                }${fieldName}: ${JSON.parse(response.request_response)}`;
              }
            }
          }
        });

        const itemOptions = Object.keys(items).map((item, index) => {
          const value = `${items[item].name} (${items[item].quantity} ${items[item].unit}) (${items[item].description})`;
          return {
            option_field_id: form.form_section[1].section_field[0].field_id,
            option_id: item,
            option_order: index,
            option_value: value,
          };
        });

        returnData = {
          form: {
            ...form,
            form_signer: projectSigner.length !== 0 ? projectSigner : form.form_signer,
          },
          itemOptions,
          requestProjectId,
          requestingProject: project.team_project_name,
        };
        return;
      }
      else if (form.form_name === "Receiving Inspecting Report") {
        const isRequestIdValid = plv8.execute(
          `
            SELECT COUNT(*) 
            FROM request_table 
            WHERE 
              (
                request_id = '${requisitionId}'
                OR request_id = '${quotationId}'
              )
              AND request_status = 'APPROVED'
              AND request_is_disabled = false
          `
        )[0];
        if (Number(isRequestIdValid.count) !== 2) {
          throw new Error('404')
        }

        const requestResponseData = plv8.execute(
          `
            SELECT
              request_response_table.*,
              field_name,
              field_order
            FROM request_response_table 
            INNER JOIN field_table ON field_id  = request_response_field_id
            WHERE 
              request_response_request_id = '${quotationId}'
            ORDER BY request_response_duplicatable_section_id, field_name, field_order ASC
          `
        );

        const items = {};
        const idForNullDuplicationId = plv8.execute('SELECT uuid_generate_v4()')[0].uuid_generate_v4;
        const regExp = /\(([^)]+)\)/;
        requestResponseData.forEach((response) => {
          if (response) {
            const fieldName = response.field_name;
            const duplicatableSectionId =
              response.request_response_duplicatable_section_id ??
              idForNullDuplicationId;

            if (response.field_order > 12) {
              if (!items[duplicatableSectionId]) {
                items[duplicatableSectionId] = {
                  item: "",
                  quantity: "",
                };
              }

              if (fieldName === "Item") {
                items[duplicatableSectionId].item = JSON.parse(
                  response.request_response
                );
              } else if (fieldName === "Quantity") {
                const matches = regExp.exec(items[duplicatableSectionId].item);

                if (matches) {
                  const unit = matches[1].replace(/\d+/g, "").trim();

                  items[
                    duplicatableSectionId
                  ].quantity = `${response.request_response} ${unit}`;
                }
              }
            }
          }
        });

        const regex = /\(([^()]+)\)/g;
        const itemOptions = Object.keys(items).map((item, index) => {
          const result = items[item].item.match(regex);

          const value =
            result &&
            items[item].item.replace(result[0], `(${items[item].quantity})`);
          return {
            option_field_id: form.form_section[2].section_field[0].field_id,
            option_id: item,
            option_order: index,
            option_value: value,
          };
        });
        returnData = {
          form: {
              ...form,
              form_signer: projectSigner.length !== 0 ? projectSigner : form.form_signer,
          },
          itemOptions,
          requestProjectId,
          requestingProject: project.team_project_name,
        };
        return;
      }
      else if (form.form_name === "Release Order") {
        const isRequestIdValid = plv8.execute(
          `
            SELECT COUNT(*) 
            FROM request_table 
            WHERE 
              (
                request_id = '${requisitionId}'
                OR request_id = '${sourcedItemId}'
              )
              AND request_status = 'APPROVED'
              AND request_is_disabled = false
          `
        )[0];
        if (Number(isRequestIdValid.count) !== 2) {
          throw new Error('404');
        }

        const requestResponseData = plv8.execute(
          `
            SELECT
              request_response_table.*,
              field_name,
              field_order
            FROM request_response_table 
            INNER JOIN field_table ON field_id  = request_response_field_id
            WHERE 
              request_response_request_id = '${sourcedItemId}'
            ORDER BY request_response_duplicatable_section_id, field_name, field_order ASC
          `
        );

        const items = {};
        const idForNullDuplicationId = plv8.execute('SELECT uuid_generate_v4()')[0].uuid_generate_v4;

        requestResponseData.forEach((response) => {
          if (response) {
            const fieldName = response.field_name;
            const duplicatableSectionId =
              response.request_response_duplicatable_section_id ??
              idForNullDuplicationId;

            if (response.field_order > 1) {
              if (!items[duplicatableSectionId]) {
                items[duplicatableSectionId] = {
                  item: "",
                  quantity: 0,
                  sourceProject: "",
                };
              }

              if (fieldName === "Item") {
                items[duplicatableSectionId].item = JSON.parse(
                  response.request_response
                );
              } else if (fieldName === "Quantity") {
                items[duplicatableSectionId].quantity = JSON.parse(
                  response.request_response
                );
              } else if (fieldName === "Source Project") {
                items[duplicatableSectionId].sourceProject = JSON.parse(
                  response.request_response
                );
              }
            }
          }
        });

        const sourceProjectList = {};

        const regex = /\(([^()]+)\)/g;
        const itemOptions = Object.keys(items).map((item, index) => {
          const itemName = items[item].item;
          const quantity = items[item].quantity;
          const sourceProject = items[item].sourceProject;

          const matches = regex.exec(itemName);
          const unit = matches && matches[1].replace(/\d+/g, "").trim();

          const replace = items[item].item.match(regex);
          if (!replace) return;

          const value = `${itemName.replace(
            replace[0],
            `(${quantity} ${unit}) (${sourceProject})`
          )} `;

          sourceProjectList[value] = items[item].sourceProject;

          return {
            option_field_id: form.form_section[1].section_field[0].field_id,
            option_id: item,
            option_order: index,
            option_value: value,
          };
        });
        returnData =  {
          form: {
            ...form,
            form_signer:
              projectSigner.length !== 0 ? projectSigner : form.form_signer,
          },
          itemOptions,
          sourceProjectList,
          requestProjectId,
          requestingProject: project.team_project_name,
        };
        return;
      }
      else if (form.form_name === "Transfer Receipt") {
        const isRequestIdValid = plv8.execute(
          `
            SELECT COUNT(*) 
            FROM request_table 
            WHERE 
              (
                request_id = '${requisitionId}'
                OR request_id = '${sourcedItemId}'
                OR request_id = '${releaseOrderId}'
              )
              AND request_status = 'APPROVED'
              AND request_is_disabled = false
          `
        )[0];
        if (Number(isRequestIdValid.count) !== 3) {
          throw new Error('404')
        }

        const requestResponseData = plv8.execute(
          `
            SELECT
              request_response_table.*,
              field_name,
              field_order
            FROM request_response_table 
            INNER JOIN field_table ON field_id  = request_response_field_id
            WHERE 
              request_response_request_id = '${releaseOrderId}'
            ORDER BY request_response_duplicatable_section_id, field_name, field_order ASC
          `
        );

        const items = {};
        const idForNullDuplicationId = plv8.execute('SELECT uuid_generate_v4()')[0].uuid_generate_v4;
        requestResponseData.forEach((response) => {
          if (response) {
            const fieldName = response.field_name;
            const duplicatableSectionId =
              response.request_response_duplicatable_section_id ??
              idForNullDuplicationId;

            if (response.field_order > 2) {
              if (!items[duplicatableSectionId]) {
                items[duplicatableSectionId] = {
                  item: "",
                  quantity: 0,
                  sourceProject: "",
                };
              }

              if (fieldName === "Item") {
                items[duplicatableSectionId].item = JSON.parse(
                  response.request_response
                );
              } else if (fieldName === "Quantity") {
                items[duplicatableSectionId].quantity = JSON.parse(
                  response.request_response
                );
              } else if (fieldName === "Source Project") {
                items[duplicatableSectionId].sourceProject = JSON.parse(
                  response.request_response
                );
              }
            }
          }
        });
        
        const sourceProjectList = {};

        const regex = /\(([^()]+)\)/g;
        const itemOptions = Object.keys(items).map((item, index) => {
          const itemName = items[item].item;
          const quantity = items[item].quantity;

          const matches = regex.exec(itemName);
          const unit = matches && matches[1].replace(/\d+/g, "").trim();

          const replace = items[item].item.match(regex);
          if (!replace) return;

          const value = `${itemName.replace(
            replace[0],
            `(${quantity} ${unit})`
          )} `;

          sourceProjectList[value] = items[item].sourceProject;

          return {
            option_field_id: form.form_section[1].section_field[0].field_id,
            option_id: item,
            option_order: index,
            option_value: value,
          };
        });


        returnData = {
          form: {
            ...form,
            form_signer:
              projectSigner.length !== 0 ? projectSigner : form.form_signer,
          },
          itemOptions,
          sourceProjectList,
          requestProjectId,
          requestingProject: project.team_project_name,
        };
        return;
      }
    }else {
      returnData = {
        form, 
        requestProjectId
      }
    }
 });
 return returnData;
$$ LANGUAGE plv8;

-- END: Create request page on load

-- Start: Get request

CREATE OR REPLACE FUNCTION get_request(
  request_id TEXT
)
RETURNS JSON as $$
  let returnData;
  plv8.subtransaction(function(){
    const isUUID = (str) => {
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return uuidPattern.test(str);
    }

    let idCondition = '';
    if(isUUID(request_id)){
      idCondition = `request_id = '${request_id}'`;
    }else{
      const formslyId = request_id.split("-");
      idCondition = `request_formsly_id_prefix = '${formslyId[0]}' AND request_formsly_id_serial = '${formslyId[1]}'`
    }

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
        FROM request_view
        INNER JOIN team_member_table ON team_member_id = request_team_member_id
        INNER JOIN user_table ON user_id = team_member_user_id
        INNER JOIN form_table ON form_id = request_form_id
        LEFT JOIN team_project_table ON team_project_id = request_project_id
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
        FROM request_signer_table
        INNER JOIN signer_table ON signer_id = request_signer_signer_id
        INNER JOIN team_member_table ON team_member_id = signer_team_member_id
        INNER JOIN user_table ON user_id = team_member_user_id
        LEFT JOIN attachment_table on attachment_id = user_signature_attachment_id
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
        FROM comment_table 
        INNER JOIN team_member_table ON team_member_id = comment_team_member_id
        INNER JOIN user_table ON user_id = team_member_user_id
        WHERE
          comment_request_id = '${requestData.request_id}'
        ORDER BY comment_date_created DESC
      `
    );

    const sectionData = plv8.execute(
      `
        SELECT *
        FROM section_table
        WHERE section_form_id = '${requestData.form_id}'
        ORDER BY section_order ASC
      `
    );

    const formSection = [];
    if(requestData.form_is_formsly_form && (requestData.form_name === "Requisition" || requestData.form_name === "Subcon")) {
      sectionData.forEach(section => {
        const fieldData = plv8.execute(
          `
            SELECT DISTINCT field_table.*
            FROM field_table
            INNER JOIN request_response_table ON request_response_field_id = field_id
            WHERE 
              field_section_id = '${section.section_id}'
              AND request_response_request_id = '${requestData.request_id}'
            ORDER BY field_order ASC
          `
        );
        const fieldWithOptionAndResponse = [];
        fieldData.forEach(field => {
          const requestResponseData = plv8.execute(
            `
              SELECT *
              FROM request_response_table
              WHERE request_response_request_id = '${requestData.request_id}'
              AND request_response_field_id = '${field.field_id}'
            `
          );
          const optionData = plv8.execute(
            `
              SELECT *
              FROM option_table
              WHERE option_field_id = '${field.field_id}'
              ORDER BY option_order ASC
            `
          );
          let fieldItemDescriptionOrder = 0;
          const order = plv8.execute(
            `
              SELECT item_description_order
              FROM item_description_table
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
    } else {
      sectionData.forEach(section => {
        const fieldData = plv8.execute(
          `
            SELECT *
            FROM field_table
            WHERE field_section_id = '${section.section_id}'
            ORDER BY field_order ASC
          `
        );
        const fieldWithOptionAndResponse = fieldData.map(field => {
          const optionData = plv8.execute(
            `
              SELECT *
              FROM option_table
              WHERE option_field_id = '${field.field_id}'
              ORDER BY option_order ASC
            `
          );

          const requestResponseData = plv8.execute(
            `
              SELECT *
              FROM request_response_table
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

-- END: Get request

-- Start: Get all approved requisition json

CREATE OR REPLACE FUNCTION get_all_approved_requisition_json(
  team_id TEXT
)
RETURNS JSON as $$
  let ssot_data;
  plv8.subtransaction(function(){
    // Fetch owner of team
    const team_owner = plv8.execute(`SELECT * FROM team_member_table WHERE team_member_team_id='${team_id}' AND team_member_role='OWNER'`)[0];

    // Fetch team formsly forms
    const requisition_form = plv8.execute(`SELECT * FROM form_table WHERE form_name='Requisition' AND form_is_formsly_form=true AND form_team_member_id='${team_owner.team_member_id}'`)[0];
    const sourced_item_form = plv8.execute(`SELECT * FROM form_table WHERE form_name='Sourced Item' AND form_is_formsly_form=true AND form_team_member_id='${team_owner.team_member_id}'`)[0];
    const quotation_form = plv8.execute(`SELECT * FROM form_table WHERE form_name='Quotation' AND form_is_formsly_form=true AND form_team_member_id='${team_owner.team_member_id}'`)[0];
    const rir_form = plv8.execute(`SELECT * FROM form_table WHERE form_name='Receiving Inspecting Report' AND form_is_formsly_form=true AND form_team_member_id='${team_owner.team_member_id}'`)[0];
    const ro_form = plv8.execute(`SELECT * FROM form_table WHERE form_name='Release Order' AND form_is_formsly_form=true AND form_team_member_id='${team_owner.team_member_id}'`)[0];
    const transfer_receipt_form = plv8.execute(`SELECT * FROM form_table WHERE form_name='Transfer Receipt' AND form_is_formsly_form=true AND form_team_member_id='${team_owner.team_member_id}'`)[0];

    const requisition_requests = plv8.execute(`SELECT request_id, request_formsly_id, request_date_created, request_team_member_id FROM request_table WHERE request_status='APPROVED' AND request_form_id='${requisition_form.form_id}' ORDER BY request_status_date_updated DESC`);
    
    ssot_data = requisition_requests.map((requisition) => {
      // Requisition request response
      const requisition_response = plv8.execute(`SELECT request_response, request_response_field_id, request_response_duplicatable_section_id FROM request_response_table WHERE request_response_request_id='${requisition.request_id}'`);
      
      if(!requisition_response) return;

      // Requisition request response with fields
      const requisition_response_fields = requisition_response.map(response => {
        const field = plv8.execute(`SELECT field_name, field_type FROM field_table WHERE field_id='${response.request_response_field_id}'`)[0];

        return {
          request_response: response.request_response,
          request_response_field_name: field.field_name,
          request_response_field_type: field.field_type,
          request_response_duplicatable_section_id: response.request_response_duplicatable_section_id
        }
      });

      // Requisition team member
      const requisition_team_member = plv8.execute(`SELECT user_table.user_first_name, user_table.user_last_name FROM team_member_table INNER JOIN user_table ON team_member_table.team_member_user_id = user_id WHERE team_member_id='${requisition.request_team_member_id}'`)[0];

      const quotation_ids = plv8.execute(`SELECT request_table.request_id FROM request_response_table INNER JOIN request_table ON request_response_table.request_response_request_id=request_table.request_id WHERE request_response_table.request_response='"${requisition.request_id}"' AND request_table.request_status='APPROVED' AND request_table.request_form_id='${quotation_form.form_id}'`);
      let quotation_list = [];
      if(quotation_ids.length !== 0){
        let quotation_condition = "";
        quotation_ids.forEach(quotation => {
          quotation_condition += `request_id='${quotation.request_id}' OR `;
        });

        const quotation_requests = plv8.execute(`SELECT request_id, request_formsly_id, request_date_created, request_team_member_id FROM request_table WHERE ${quotation_condition.slice(0, -4)} ORDER BY request_status_date_updated DESC`);
        quotation_list = quotation_requests.map(quotation => {
          // Quotation request response
          const quotation_response = plv8.execute(`SELECT request_response, request_response_field_id FROM request_response_table WHERE request_response_request_id='${quotation.request_id}'`);
          
          // Quotation request response with fields
          const quotation_response_fields = quotation_response.map(response => {
            const field = plv8.execute(`SELECT field_name, field_type FROM field_table WHERE field_id='${response.request_response_field_id}'`)[0];
            return {
              request_response: response.request_response,
              request_response_field_name: field.field_name,
              request_response_field_type: field.field_type,
            }
          });

          // Quotation team member
          const quotation_team_member = plv8.execute(`SELECT user_table.user_first_name, user_table.user_last_name FROM team_member_table INNER JOIN user_table ON team_member_table.team_member_user_id = user_id WHERE team_member_id='${quotation.request_team_member_id}'`)[0];

          const rir_ids = plv8.execute(`SELECT request_table.request_id FROM request_response_table INNER JOIN request_table ON request_response_table.request_response_request_id=request_table.request_id WHERE request_response_table.request_response='"${quotation.request_id}"' AND request_table.request_status='APPROVED' AND request_table.request_form_id='${rir_form.form_id}'`);
          let rir_list = [];
          
          if(rir_ids.length !== 0){
            let rir_condition = "";
            rir_ids.forEach(rir => {
              rir_condition += `request_id='${rir.request_id}' OR `;
            });

            const rir_requests = plv8.execute(`SELECT request_id, request_formsly_id, request_date_created, request_team_member_id FROM request_table WHERE ${rir_condition.slice(0, -4)} ORDER BY request_status_date_updated DESC`);
            rir_list = rir_requests.map(rir => {
              // rir request response
              const rir_response = plv8.execute(`SELECT request_response, request_response_field_id FROM request_response_table WHERE request_response_request_id='${rir.request_id}'`);
              
              // rir request response with fields
              const rir_response_fields = rir_response.map(response => {
                const field = plv8.execute(`SELECT field_name, field_type FROM field_table WHERE field_id='${response.request_response_field_id}'`)[0];
                return {
                  request_response: response.request_response,
                  request_response_field_name: field.field_name,
                  request_response_field_type: field.field_type,
                }
              });

              // rir team member
              const rir_team_member = plv8.execute(`SELECT user_table.user_first_name, user_table.user_last_name FROM team_member_table INNER JOIN user_table ON team_member_table.team_member_user_id = user_id WHERE team_member_id='${rir.request_team_member_id}'`)[0];

              return {
                rir_request_id: rir.request_id,
                rir_request_formsly_id: rir.request_formsly_id,
                rir_request_date_created: rir.request_date_created,
                rir_request_response: rir_response_fields,
                rir_request_owner: rir_team_member,
              }
            });
          }

          return {
            quotation_request_id: quotation.request_id,
            quotation_request_formsly_id: quotation.request_formsly_id,
            quotation_request_date_created: quotation.request_date_created,
            quotation_request_response: quotation_response_fields,
            quotation_request_owner: quotation_team_member,
            quotation_rir_request: rir_list
          }
        });
      }

      const sourced_item_ids = plv8.execute(`SELECT request_table.request_id FROM request_response_table INNER JOIN request_table ON request_response_table.request_response_request_id=request_table.request_id WHERE request_response_table.request_response='"${requisition.request_id}"' AND request_table.request_status='APPROVED' AND request_table.request_form_id='${sourced_item_form.form_id}'`);
      let sourced_item_list = [];
      if(sourced_item_ids.length !== 0){
        let sourced_item_condition = "";
        sourced_item_ids.forEach(sourced_item => {
          sourced_item_condition += `request_id='${sourced_item.request_id}' OR `;
        });

        const sourced_item_requests = plv8.execute(`SELECT request_id, request_formsly_id, request_date_created, request_team_member_id FROM request_table WHERE ${sourced_item_condition.slice(0, -4)} ORDER BY request_status_date_updated DESC`);
        sourced_item_list = sourced_item_requests.map(sourced_item => {
          // Sourced Item request response
          const sourced_item_response = plv8.execute(`SELECT request_response, request_response_field_id FROM request_response_table WHERE request_response_request_id='${sourced_item.request_id}'`);
          
          // Sourced Item request response with fields
          const sourced_item_response_fields = sourced_item_response.map(response => {
            const field = plv8.execute(`SELECT field_name, field_type FROM field_table WHERE field_id='${response.request_response_field_id}'`)[0];
            return {
              request_response: response.request_response,
              request_response_field_name: field.field_name,
              request_response_field_type: field.field_type,
            }
          });

          // Sourced Item team member
          const sourced_item_team_member = plv8.execute(`SELECT user_table.user_first_name, user_table.user_last_name FROM team_member_table INNER JOIN user_table ON team_member_table.team_member_user_id = user_id WHERE team_member_id='${sourced_item.request_team_member_id}'`)[0];

          const ro_ids = plv8.execute(`SELECT request_table.request_id FROM request_response_table INNER JOIN request_table ON request_response_table.request_response_request_id=request_table.request_id WHERE request_response_table.request_response='"${sourced_item.request_id}"' AND request_table.request_status='APPROVED' AND request_table.request_form_id='${ro_form.form_id}'`);
          let ro_list = [];
          
          if(ro_ids.length !== 0){
            let ro_condition = "";
            ro_ids.forEach(ro => {
              ro_condition += `request_id='${ro.request_id}' OR `;
            });

            const ro_requests = plv8.execute(`SELECT request_id, request_formsly_id, request_date_created, request_team_member_id FROM request_table WHERE ${ro_condition.slice(0, -4)} ORDER BY request_status_date_updated DESC`);
            ro_list = ro_requests.map(ro => {
              // ro request response
              const ro_response = plv8.execute(`SELECT request_response, request_response_field_id FROM request_response_table WHERE request_response_request_id='${ro.request_id}'`);
              
              // ro request response with fields
              const ro_response_fields = ro_response.map(response => {
                const field = plv8.execute(`SELECT field_name, field_type FROM field_table WHERE field_id='${response.request_response_field_id}'`)[0];
                return {
                  request_response: response.request_response,
                  request_response_field_name: field.field_name,
                  request_response_field_type: field.field_type,
                }
              });

              // ro team member
              const ro_team_member = plv8.execute(`SELECT user_table.user_first_name, user_table.user_last_name FROM team_member_table INNER JOIN user_table ON team_member_table.team_member_user_id = user_id WHERE team_member_id='${ro.request_team_member_id}'`)[0];

              const transfer_receipt_ids = plv8.execute(`SELECT request_table.request_id FROM request_response_table INNER JOIN request_table ON request_response_table.request_response_request_id=request_table.request_id WHERE request_response_table.request_response='"${ro.request_id}"' AND request_table.request_status='APPROVED' AND request_table.request_form_id='${transfer_receipt_form.form_id}'`);
              let transfer_receipt_list = [];
              
              if(transfer_receipt_ids.length !== 0){
                let transfer_receipt_condition = "";
                transfer_receipt_ids.forEach(transfer_receipt => {
                  transfer_receipt_condition += `request_id='${transfer_receipt.request_id}' OR `;
                });

                const transfer_receipt_requests = plv8.execute(`SELECT request_id, request_formsly_id, request_date_created, request_team_member_id FROM request_table WHERE ${transfer_receipt_condition.slice(0, -4)} ORDER BY request_status_date_updated DESC`);
                transfer_receipt_list = transfer_receipt_requests.map(transfer_receipt => {
                  // transfer_receipt request response
                  const transfer_receipt_response = plv8.execute(`SELECT request_response, request_response_field_id FROM request_response_table WHERE request_response_request_id='${transfer_receipt.request_id}'`);
                  
                  // transfer_receipt request response with fields
                  const transfer_receipt_response_fields = transfer_receipt_response.map(response => {
                    const field = plv8.execute(`SELECT field_name, field_type FROM field_table WHERE field_id='${response.request_response_field_id}'`)[0];
                    return {
                      request_response: response.request_response,
                      request_response_field_name: field.field_name,
                      request_response_field_type: field.field_type,
                    }
                  });

                  // transfer_receipt team member
                  const transfer_receipt_team_member = plv8.execute(`SELECT user_table.user_first_name, user_table.user_last_name FROM team_member_table INNER JOIN user_table ON team_member_table.team_member_user_id = user_id WHERE team_member_id='${transfer_receipt.request_team_member_id}'`)[0];

                  return {
                    transfer_receipt_request_id: transfer_receipt.request_id,
                    transfer_receipt_request_formsly_id: transfer_receipt.request_formsly_id,
                    transfer_receipt_request_date_created: transfer_receipt.request_date_created,
                    transfer_receipt_request_response: transfer_receipt_response_fields,
                    transfer_receipt_request_owner: transfer_receipt_team_member,
                  }
                });
              }

              return {
                ro_request_id: ro.request_id,
                ro_request_formsly_id: ro.request_formsly_id,
                ro_request_date_created: ro.request_date_created,
                ro_request_response: ro_response_fields,
                ro_request_owner: ro_team_member,
                ro_transfer_receipt_request: transfer_receipt_list
              }
            });
          }

          return {
            sourced_item_request_id: sourced_item.request_id,
            sourced_item_request_formsly_id: sourced_item.request_formsly_id,
            sourced_item_request_date_created: sourced_item.request_date_created,
            sourced_item_request_response: sourced_item_response_fields,
            sourced_item_request_owner: sourced_item_team_member,
            sourced_item_ro_request: ro_list
          }
        });
      }

      

      return {
        requisition_request_id: requisition.request_id,
        requisition_request_formsly_id: requisition.request_formsly_id,
        requisition_request_date_created: requisition.request_date_created,
        requisition_request_response: requisition_response_fields,
        requisition_request_owner: requisition_team_member,
        requisition_quotation_request: quotation_list,
        requisition_sourced_item_request: sourced_item_list,
      }
    })
  });
  return ssot_data;
$$ LANGUAGE plv8;

-- End: Get all approved requisition json

-- Start: Create ticket on load

CREATE OR REPLACE FUNCTION get_create_ticket_on_load(
    input_data JSON
)
RETURNS JSON AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      userId
    } = input_data;
    
    const teamId = plv8.execute(`SELECT get_user_active_team_id('${userId}');`)[0].get_user_active_team_id;

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
        FROM team_member_table tmt 
        JOIN user_table usert ON tmt.team_member_user_id = usert.user_id 
        WHERE 
          tmt.team_member_team_id='${teamId}' 
          AND tmt.team_member_is_disabled=false 
          AND usert.user_is_disabled=false
          AND usert.user_id='${userId}';
      `
    )[0];

    returnData = { member }
 });
 return returnData;
$$ LANGUAGE plv8;

-- Start: Create ticket on load

-- Start: Create ticket

CREATE OR REPLACE FUNCTION create_ticket(
  input_data JSON
)
RETURNS JSON as $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      requester,
      category,
      title,
      description,
    } = input_data;

    returnData = plv8.execute(`INSERT INTO ticket_table (ticket_category, ticket_title, ticket_description, ticket_requester_team_member_id) VALUES ('${category}','${title}','${description}','${requester}') RETURNING *;`)[0];

 });
 return returnData;
$$ LANGUAGE plv8;

-- End: Create ticket

-- Start: Get ticket on load

CREATE OR REPLACE FUNCTION get_ticket_on_load(
  input_data JSON
)
RETURNS JSON as $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      ticketId,
      userId
    } = input_data;

    const ticket = plv8.execute(`SELECT *  FROM ticket_table WHERE ticket_id='${ticketId}';`)[0];

    const requester = plv8.execute(`SELECT jsonb_build_object(
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
      FROM team_member_table tm
      JOIN user_table u ON tm.team_member_user_id = u.user_id
      WHERE tm.team_member_id = '${ticket.ticket_requester_team_member_id}';`)[0]

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
      FROM team_member_table tm
      JOIN user_table u ON tm.team_member_user_id = u.user_id
      WHERE tm.team_member_id = '${ticket.ticket_approver_team_member_id}';`)[0]
    }

    const teamId = plv8.execute(`SELECT get_user_active_team_id('${userId}');`)[0].get_user_active_team_id;

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
        FROM team_member_table tmt 
        JOIN user_table usert ON tmt.team_member_user_id = usert.user_id 
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
        FROM ticket_comment_table 
        INNER JOIN team_member_table ON team_member_id = ticket_comment_team_member_id
        INNER JOIN user_table ON user_id = team_member_user_id
        WHERE
          ticket_comment_ticket_id = '${ticketId}'
        ORDER BY ticket_comment_date_created DESC
      `
    );

    returnData = {
      ticket: {
        ...ticket,
        ticket_requester: requester.member,
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
    user: member
    }
 });
 return returnData;
$$ LANGUAGE plv8;

-- End: Create ticket

-- Start: Assign ticket

CREATE OR REPLACE FUNCTION assign_ticket(
  input_data JSON
)
RETURNS JSON as $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      ticketId,
      teamMemberId
    } = input_data;

    const ticket = plv8.execute(`SELECT ticket_approver_team_member_id FROM ticket_table WHERE ticket_id='${ticketId}'`)[0];
    const member = plv8.execute(`SELECT *  FROM team_member_table WHERE team_member_id='${teamMemberId}';`)[0];

    const isApprover = member.team_member_role === 'OWNER' || member.team_member_role === 'ADMIN';
    if (!isApprover) throw new Error("User is not an Approver");

    const hasApprover = ticket.ticket_approver_team_member_id !== null
    if (hasApprover) throw new Error("Ticket already have approver");
    
    const updatedTicket = plv8.execute(`UPDATE ticket_table SET ticket_status='UNDER REVIEW', ticket_status_date_updated = NOW(), ticket_approver_team_member_id = '${teamMemberId}' WHERE ticket_id='${ticketId}' RETURNING *;`)[0];

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
        FROM team_member_table tmt 
        JOIN user_table usert ON tmt.team_member_user_id = usert.user_id 
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
        FROM team_member_table tmt 
        JOIN user_table usert ON tmt.team_member_user_id = usert.user_id 
        WHERE 
          tmt.team_member_id='${teamMemberId}' 
      `
    )[0];

    returnData = {...updatedTicket, ticket_requester: requester, ticket_approver: approver}
 });
 return returnData;
$$ LANGUAGE plv8;

-- End: Assign ticket

-- Start: Edit ticket response

CREATE OR REPLACE FUNCTION edit_ticket_response(
  input_data JSON
)
RETURNS JSON as $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      ticketId,
      title,
      description
    } = input_data;

    returnData = plv8.execute(`UPDATE ticket_table SET ticket_title='${title}', ticket_description='${description}' WHERE ticket_id='${ticketId}' RETURNING *;`)[0];

 });
 return returnData;
$$ LANGUAGE plv8;

-- End: Edit ticket response

-- Start: Update ticket status

CREATE OR REPLACE FUNCTION update_ticket_status(
  input_data JSON
)
RETURNS JSON as $$
  let returnData;
  plv8.subtransaction(function(){
    const {
     ticketId,
     status,
     rejectionMessage
    } = input_data;

    returnData = plv8.execute(`UPDATE ticket_table SET ticket_status='${status.toUpperCase()}' WHERE ticket_id='${ticketId}' RETURNING *;`)[0];

 });
 return returnData;
$$ LANGUAGE plv8;

-- End: Edit ticket response

-- Start: Fetch ticket list

CREATE OR REPLACE FUNCTION fetch_ticket_list(
    input_data JSON
)
RETURNS JSON AS $$
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
      } = input_data;

      const start = (page - 1) * limit;

      const ticket_list = plv8.execute(
        `
          SELECT DISTINCT
            ticket_table.*
          FROM ticket_table
          INNER JOIN team_member_table tm ON ticket_table.ticket_requester_team_member_id = tm.team_member_id
          WHERE tm.team_member_team_id = '${teamId}'
          ${requester}
          ${approver}
          ${status}
          ${category}
          ${search}
          ORDER BY ticket_table.ticket_date_created ${sort} 
          OFFSET ${start} ROWS FETCH FIRST ${limit} ROWS ONLY
        `
      );

      const ticket_count = plv8.execute(
        `
          SELECT DISTINCT COUNT(*)
          FROM ticket_table
          INNER JOIN team_member_table ON ticket_table.ticket_requester_team_member_id = team_member_table.team_member_id
          WHERE team_member_table.team_member_team_id = '${teamId}'
          ${requester}
          ${approver}
          ${status}
          ${category}
          ${search}
        `
      )[0];

      const ticket_data = ticket_list.map(ticket => {
        const ticket_requester = plv8.execute(
          `
            SELECT 
              team_member_table.team_member_id, 
              user_table.user_id,
              user_table.user_first_name,
              user_table.user_last_name,
              user_table.user_username,
              user_table.user_avatar
            FROM team_member_table
            INNER JOIN user_table ON team_member_table.team_member_user_id = user_table.user_id
            WHERE team_member_table.team_member_id = '${ticket.ticket_requester_team_member_id}'
          `
        )[0];
        let ticket_approver = {}
        if(ticket.ticket_approver_team_member_id){
          ticket_approver = plv8.execute(
            `
              SELECT 
                team_member_table.team_member_id, 
                user_table.user_id,
                user_table.user_first_name,
                user_table.user_last_name,
                user_table.user_username,
                user_table.user_avatar
              FROM team_member_table
              INNER JOIN user_table ON team_member_table.team_member_user_id = user_table.user_id
              WHERE team_member_table.team_member_id = '${ticket.ticket_approver_team_member_id}'
            `
          )[0];
        }

        return {
          ...ticket,
          ticket_requester,
          ticket_approver,
        }
      });

      returnData = {
        data: ticket_data, 
        count: Number(ticket_count.count)
      };
    });
    return returnData
$$ LANGUAGE plv8;

-- End: Fetch ticket list

-- Start: Get ticket list on load

CREATE OR REPLACE FUNCTION get_ticket_list_on_load(
    input_data JSON
)
RETURNS JSON AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      userId,
    } = input_data;
    
    
    const teamId = plv8.execute(`SELECT get_user_active_team_id('${userId}');`)[0].get_user_active_team_id;
    
    const teamMemberList = plv8.execute(`SELECT tmt.team_member_id, tmt.team_member_role, json_build_object( 'user_id',usert.user_id, 'user_first_name',usert.user_first_name , 'user_last_name',usert.user_last_name) AS team_member_user FROM team_member_table tmt JOIN user_table usert ON tmt.team_member_user_id=usert.user_id WHERE tmt.team_member_team_id='${teamId}' AND tmt.team_member_is_disabled=false;`);

    const ticketList = plv8.execute(`SELECT fetch_ticket_list('{"teamId":"${teamId}", "page":"1", "limit":"13", "requester":"", "approver":"", "category":"", "status":"", "search":"", "sort":"DESC"}');`)[0].fetch_ticket_list;

    returnData = {teamMemberList, ticketList: ticketList.data, ticketListCount: ticketList.count}
 });
 return returnData;
$$ LANGUAGE plv8;

-- End: Get ticket list on load

-- Start: Reverse Request Approval

CREATE OR REPLACE FUNCTION reverse_request_approval(
    input_data JSON
)
RETURNS VOID AS $$
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
    } = input_data;

    const present = { REVERSED: "REVERSE" };

    plv8.execute(`UPDATE request_signer_table SET request_signer_status = 'PENDING', request_signer_status_date_updated = NOW() WHERE request_signer_id='${requestSignerId}';`);
    
    plv8.execute(`INSERT INTO comment_table (comment_request_id,comment_team_member_id,comment_type,comment_content) VALUES ('${requestId}','${memberId}','ACTION_${requestAction}','${signerFullName} ${requestAction.toLowerCase()} their approval of this request.');`);
    
    const activeTeamResult = plv8.execute(`SELECT * FROM team_table WHERE team_id='${teamId}';`);
    const activeTeam = activeTeamResult.length > 0 ? activeTeamResult[0] : null;

    if (activeTeam) {
      const teamNameUrlKeyResult = plv8.execute(`SELECT format_team_name_to_url_key('${activeTeam.team_name}') AS url_key;`);
      const teamNameUrlKey = teamNameUrlKeyResult.length > 0 ? teamNameUrlKeyResult[0].url_key : null;

      if (teamNameUrlKey) {
        plv8.execute(`INSERT INTO notification_table (notification_app,notification_type,notification_content,notification_redirect_url,notification_user_id,notification_team_id) VALUES ('REQUEST','${present[requestAction]}','${signerFullName} ${requestAction.toLowerCase()} their approval of your ${formName} request','/${teamNameUrlKey}/requests/${requestId}','${requestOwnerId}','${teamId}');`);
      }
    }
    
    if(isPrimarySigner===true){
      plv8.execute(`UPDATE request_table SET request_status = 'PENDING', request_status_date_updated = NOW(), ${`request_jira_id=NULL`}, ${`request_jira_link=NULL`} WHERE request_id='${requestId}';`);
    }
    
 });
$$ LANGUAGE plv8;

-- End: Reverse Request Approval

-- Start: Analyze Item

CREATE OR REPLACE FUNCTION analyze_item(
    input_data JSON
)
RETURNS JSON AS $$
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

    const generalNameFieldId = plv8.execute(
      `
        SELECT field_id
        FROM field_table
          INNER JOIN section_table ON section_id = field_section_id
          INNER JOIN form_table ON form_id = section_form_id
          INNER JOIN team_member_table ON team_member_id = form_team_member_id
        WHERE 
          field_name = 'General Name' AND
          team_member_team_id = '${teamId}' AND
          form_name = 'Requisition' AND
          form_is_formsly_form = true
      `
    )[0].field_id;

    const itemGeneralNameList = plv8.execute(
      `
        SELECT 
          request_response_table.*,
          request_status,
          request_formsly_id,
          request_id
        FROM request_response_table
        INNER JOIN request_view ON request_id = request_response_request_id
        WHERE 
          request_response = '"${itemName}"' AND
          request_response_field_id = '${generalNameFieldId}' AND
          request_is_disabled = false 
        ORDER BY request_date_created DESC
        LIMIT '${limit}' 
        OFFSET '${start}'
      `
    );

    const itemGeneralNameCount = plv8.execute(
      `
        SELECT COUNT(*)
        FROM request_response_table
        INNER JOIN request_view ON request_id = request_response_request_id
        WHERE 
          request_response = '"${itemName}"' AND
          request_response_field_id = '${generalNameFieldId}' AND
          request_is_disabled = false 
      `
    )[0].count;

    const itemList = itemGeneralNameList.map((item) => {
      const itemDescription = [];
      let csiCodeDescription = "";
      let quantity = 0;
      let uom = "";

      const itemDescriptionList = plv8.execute(
        `
          SELECT 
            request_response_table.*,
            field_name
          FROM request_response_table
          INNER JOIN field_table ON field_id = request_response_field_id
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

    returnData = {
      data: itemList,
      count: Number(itemGeneralNameCount)
    }
 });
 return returnData;
$$ LANGUAGE plv8;

-- End: Analyze Item

-- Start: Get Edit Request on load

CREATE OR REPLACE FUNCTION get_edit_request_on_load(
    input_data JSON
)
RETURNS JSON AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      userId,
      requestId,
      referenceOnly
    } = input_data;
    
    const teamId = plv8.execute(`SELECT get_user_active_team_id('${userId}');`)[0].get_user_active_team_id;
    if (!teamId) throw new Error("No team found");

    const unformattedRequest = plv8.execute(`SELECT get_request('${requestId}')`)[0].get_request;

    if(!referenceOnly){
      const isPending = Boolean(plv8.execute(`SELECT COUNT(*) FROM request_table WHERE request_id='${unformattedRequest.request_id}' AND request_status='PENDING' AND request_is_disabled=false;`)[0].count);
      if (!isPending) throw new Error("Request can't be edited") 
      const isRequester = userId===unformattedRequest.request_team_member.team_member_user.user_id
      if (!isRequester) throw new Error("Requests can only be edited by the request creator") 
    }

    const {
      request_form: { form_section: originalSectionList },
    } = unformattedRequest;

    const sectionWithDuplicateList = [];
    originalSectionList.forEach((section) => {
      const hasDuplicates = section.section_field.some((field) =>
        field.field_response.some(
          (response) => response.request_response_duplicatable_section_id !== null
        )
      );
      if (section.section_is_duplicatable && hasDuplicates) {
        const fieldResponse = section.section_field.flatMap((field) => field.field_response);

        const uniqueIdList = fieldResponse.reduce((unique, item) => {
          const { request_response_duplicatable_section_id } = item;
          const isDuplicate = unique.some((uniqueItem) =>
            uniqueItem.includes(`${request_response_duplicatable_section_id}`)
          );
          if (!isDuplicate) {
            unique.push(`${request_response_duplicatable_section_id}`);
          }
          return unique;
        }, []);

        const duplicateSectionList = uniqueIdList.map((id) => ({
          ...section,
          section_field: section.section_field.map((field) => ({
            ...field,
            field_response: [
              field.field_response.filter(
                (response) =>
                  `${response.request_response_duplicatable_section_id}` === id
              )[0] || null,
            ],
          })),
        }));

        duplicateSectionList.forEach((duplicateSection) =>
          sectionWithDuplicateList.push(duplicateSection)
        );
      } else {
        sectionWithDuplicateList.push(section);
      }
    });

    const request = {
      ...unformattedRequest,
      request_form: {
        ...unformattedRequest.request_form,
        form_section: sectionWithDuplicateList,
      },
    };

    const { request_form: form } = request;

    if (!form.form_is_formsly_form){
      returnData = {request};
    } else {

      const teamMemberId = plv8.execute(`SELECT team_member_id FROM team_member_table WHERE team_member_user_id='${userId}' AND team_member_team_id='${teamId}';`)[0].team_member_id;

      const projectList = plv8.execute(
        `
          SELECT tpt.* FROM team_project_table tpt
          INNER JOIN team_project_member_table tpmt ON tpt.team_project_id=tpmt.team_project_id 
          WHERE 
            tpt.team_project_team_id='${teamId}' 
            AND tpmt.team_member_id='${teamMemberId}' 
            AND tpt.team_project_is_disabled=false 
          ORDER BY team_project_name
        `
      );
      
      const projectOptions = projectList.map((project, index) => {
        return {
          option_id: project.team_project_id,
          option_value: project.team_project_name,
          option_order: index,
          option_field_id: null,
        };
      });

      let projectSignerList=[]
      if (request.request_project_id) {
        const projectSigner = plv8.execute(`SELECT st.*, json_build_object( 
          'team_member_id', tmt.team_member_id,
          'team_member_user', json_build_object( 
            'user_id',ut.user_id, 
            'user_first_name',ut.user_first_name, 
            'user_last_name',ut.user_last_name, 
            'user_avatar',ut.user_avatar
          )
        ) AS signer_team_member
        FROM signer_table st
        INNER JOIN team_member_table tmt ON st.signer_team_member_id=tmt.team_member_id
        INNER JOIN user_table ut ON tmt.team_member_user_id=ut.user_id
        WHERE st.signer_team_project_id='${request.request_project_id}'
        AND st.signer_form_id='${request.request_form_id}'
        AND st.signer_is_disabled=false;`);

        projectSignerList = projectSigner.map((signer) => ({
          request_signer_id: signer.signer_id,
          request_signer_status: "PENDING",
          request_signer_request_id: request.request_id,
          request_signer_signer_id: signer.signer_id,
          request_signer_status_date_updated: "",
          request_signer_signer: {
            signer_id: signer.signer_id,
            signer_is_primary_signer: signer.signer_is_primary_signer,
            signer_action: signer.signer_action,
            signer_order: signer.signer_order,
            signer_form_id: request.request_form_id,
            signer_team_member: {
              team_member_id: signer.signer_team_member.team_member_id,
              team_member_user: {
                user_id: signer.signer_team_member.team_member_user.user_id,
                user_first_name:
                  signer.signer_team_member.team_member_user.user_first_name,
                user_last_name:
                  signer.signer_team_member.team_member_user.user_last_name,
                user_job_title: "",
                user_signature_attachment_id: "",
              },
            },
          },
        }));
      }

      if (form.form_name === "Requisition") {
        const itemList = plv8.execute(`
          SELECT * FROM item_table 
          WHERE item_team_id='${teamId}'
          AND item_is_disabled = false
          AND item_is_available = true
          ORDER BY item_general_name ASC;
        `);

        const itemOptions = itemList.map((item, index) => {
          return {
            option_field_id:
              request.request_form.form_section[1].section_field[0].field_id,
            option_id: item.item_id,
            option_order: index,
            option_value: item.item_general_name,
          };
        });

        const supplierList = plv8.execute(`
          SELECT *
          FROM supplier_table
          WHERE supplier_team_id = 'a5a28977-6956-45c1-a624-b9e90911502e'
              AND supplier_is_disabled = false
              AND supplier_is_available = true
          ORDER BY supplier ASC
          LIMIT 100;
        `);

        const preferredSupplierField = plv8.execute(`
          SELECT *
          FROM field_table
          WHERE field_id='159c86c3-dda6-4c8a-919f-50e1674659bd'
          LIMIT 1;
        `)[0];

        const supplierOptions = supplierList.map((supplier, index) => {
          return {
            option_field_id: preferredSupplierField.field_id,
            option_id: supplier.supplier_id,
            option_order: index,
            option_value: supplier.supplier,
          };
        });

        const sectionWithDuplicateList = form.form_section
          .slice(1)
          .map((section) => {
            const fieldWithResponse = section.section_field.filter((field) =>
                field.field_response.length > 0 && field.field_response[0] !== null
            );

            return {
              ...section,
              section_field: fieldWithResponse,
            }
          });

        const itemSectionList = sectionWithDuplicateList
          .map((section) => {
            const isWithPreferredSupplier =
              section.section_field[9].field_name === "Preferred Supplier";

            const itemName = JSON.parse(
              section.section_field[0].field_response[0].request_response
            );

            const item = plv8.execute(`
              SELECT *
              FROM item_table 
              WHERE item_team_id = '${teamId}'
                AND item_general_name = '${itemName}'
                AND item_is_disabled = false
                AND item_is_available = true;
            `)[0];

            const item_division_list = plv8.execute(`SELECT * FROM item_division_table WHERE item_division_item_id = '${item.item_id}'`);

            const itemDescriptionList = plv8.execute(`
              SELECT * 
              FROM item_description_table
              WHERE item_description_item_id = '${item.item_id}'
                AND item_description_is_disabled = false
                AND item_description_is_available = true;
            `);

            const itemDescriptionWithField = itemDescriptionList
              .map((description)=> {

                const itemDescriptionFieldList = plv8.execute(`
                  SELECT * 
                  FROM item_description_field_table
                  LEFT JOIN item_description_field_uom_table ON item_description_field_id = item_description_field_uom_item_description_field_id
                  WHERE item_description_field_item_description_id = '${description.item_description_id}'
                    AND item_description_field_is_disabled = false
                    AND item_description_field_is_available = true;
                `);

                const field = plv8.execute(`
                  SELECT * 
                  FROM field_table
                  WHERE field_id = '${description.item_description_field_id}';
                `)[0];

                return {
                  ...description,
                  item_description_field: itemDescriptionFieldList,
                  item_field: field
                }
              })

            const itemDivisionIdList = `('${item_division_list.map(division => division.item_division_value).join("','")}')`

            const csiCodeList = plv8.execute(`
              SELECT *
              FROM csi_code_table
              WHERE csi_code_division_id IN ${itemDivisionIdList};
            `);

            const csiCodeOptions = csiCodeList.map((csiCode, index) => {
              return {

                option_field_id: form.form_section[0].section_field[0].field_id,
                option_id: csiCode.csi_code_id,
                option_order: index,
                option_value: csiCode.csi_code_level_three_description,
              };
            });

            const newFieldsWithOptions = itemDescriptionWithField.map(
              (description) => {
                const options = description.item_description_field.map(
                  (options, optionIndex) => {
                    return {
                      option_field_id: description.item_field.field_id,
                      option_id: options.item_description_field_id,
                      option_order: optionIndex + 1,
                      option_value: `${options.item_description_field_value}${
                        options.item_description_field_uom
                          ? ` ${options.item_description_field_uom}`
                          : ""
                      }`,
                    };
                  }
                );

                const descriptionList = section.section_field.slice(5);

                const field = descriptionList.find(
                  (refDescription) =>
                    refDescription.field_id === description.item_field.field_id
                );

                return {
                  ...field,
                  field_option: options,
                };
              }
            );
            

            return {
              ...section,
              section_field: [
                {
                  ...section.section_field[0],
                  field_option: itemOptions,
                },
                ...section.section_field.slice(1, 4),
                {
                  ...section.section_field[4],
                  field_option: csiCodeOptions,
                },
                ...section.section_field.slice(5, 9),
                isWithPreferredSupplier
                  ? {
                      ...section.section_field[9],
                      field_option: [
                        {
                          option_field_id: preferredSupplierField.field_id,
                          option_id: JSON.parse(
                            section.section_field[9].field_response[0]
                              .request_response
                          ),
                          option_order: 1,
                          option_value: JSON.parse(
                            section.section_field[9].field_response[0]
                              .request_response
                          ),
                        },
                      ],
                    }
                  : {
                      ...preferredSupplierField,
                      field_response: [
                        {
                          request_response_id: plv8.execute('SELECT uuid_generate_v4()')[0].uuid_generate_v4,
                          request_response: null,
                          request_response_duplicatable_section_id:
                            section.section_field[8].field_response[0]
                              .request_response_duplicatable_section_id,
                          request_response_field_id:
                            preferredSupplierField.field_id,
                        },
                      ],
                      field_option: supplierOptions,
                    },
                ...newFieldsWithOptions,
              ],
            };
          });

        const formattedRequest = {
          ...request,
          request_form: {
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
              ...itemSectionList,
            ],
          },
          request_signer:
            projectSignerList.length !== 0
              ? projectSignerList
              : request.request_signer,
        };

        const specialApprover = plv8.execute(`
          SELECT sat.*,
            json_build_object( 
              'signer_id', st.signer_id, 
              'signer_is_primary_signer', st.signer_is_primary_signer, 
              'signer_action', st.signer_action, 
              'signer_order', st.signer_order, 
              'signer_is_disabled', st.signer_is_disabled, 
              'signer_form_id', st.signer_form_id, 
              'signer_team_member_id', st.signer_team_member_id, 
              'signer_team_project_id', st.signer_team_project_id,
              'signer_team_member', json_build_object( 
                'team_member_id', tmt.team_member_id,
                'team_member_user', json_build_object(
                  'user_id',ut.user_id,
                  'user_first_name',ut.user_first_name,
                  'user_last_name',ut.user_last_name,
                  'user_avatar',ut.user_avatar
                )
              )
            ) AS special_approver_signer
          FROM special_approver_table sat
          INNER JOIN signer_table st ON sat.special_approver_signer_id = st.signer_id
          INNER JOIN team_member_table tmt ON st.signer_team_member_id = tmt.team_member_id
          INNER JOIN user_table ut ON tmt.team_member_user_id = ut.user_id;
        `);

        const specialApproverWithItem = specialApprover.map(approver => {
          const itemList = plv8.execute(`SELECT * FROM special_approver_item_table WHERE special_approver_item_special_approver_id = '${approver.special_approver_id}'`);
          return {
            ...approver,
            special_approver_item_list: itemList.map(item => item.special_approver_item_value)
          }
        })

        returnData = {
          request: formattedRequest,
          itemOptions,
          projectOptions,
          specialApprover: specialApproverWithItem
        }
      } else if (form.form_name === "Services") {
        const suppliers = plv8.execute(
          `
            SELECT *
            FROM supplier_table
            WHERE
              supplier_is_available = true
              AND supplier_is_disabled = false
              AND supplier_team_id = '${teamId}'
            ORDER BY supplier ASC
            LIMIT 100
          `
        );

        const supplierOptions = suppliers.map((supplier, index) => {
          return {
            option_field_id: form.form_section[1].section_field[9].field_id,
            option_id: supplier.supplier_id,
            option_order: index,
            option_value: supplier.supplier,
          };
        });

        const categories = plv8.execute(
          `
            SELECT *
            FROM service_category_table
            WHERE 
              service_category_team_id = '${teamId}'
              AND service_category_is_disabled = false
              AND service_category_is_available = true
          `
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
            SELECT *
            FROM distinct_division_view
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
            SELECT *
            FROM general_unit_of_measurement_table
            WHERE 
              general_unit_of_measurement_team_id = '${teamId}'
              AND general_unit_of_measurement_is_disabled = false
              AND general_unit_of_measurement_is_available = true
            ORDER BY general_unit_of_measurement
          `
        );

        const unitOfMeasurementOptions = unitOfMeasurements.map((uom, index) => {
          return {
            option_field_id: form.form_section[1].section_field[3].field_id,
            option_id: uom.general_unit_of_measurement_id,
            option_order: index,
            option_value: uom.general_unit_of_measurement,
          };
        });

        const sectionWithDuplicateList = form.form_section
          .slice(1)
          .map((section) => {
            return {
              ...section,
              section_field: section.section_field,
            }
          });

        const requestSectionList = sectionWithDuplicateList
          .map((section) => {
            const requestDivision = JSON.parse(section.section_field[4].field_response[0].request_response);

            const csiCodeList = plv8.execute(`
              SELECT *
              FROM csi_code_table
              WHERE csi_code_division_description = '${requestDivision}'
            `);

            const csiCodeOptions = csiCodeList.map((csiCode, index) => {
              return {
                option_field_id: form.form_section[0].section_field[0].field_id,
                option_id: csiCode.csi_code_level_three_description,
                option_order: index,
                option_value: csiCode.csi_code_level_three_description,
              };
            });

            return {
              ...section,
              section_field: [
                {
                  ...section.section_field[0],
                  field_option: categoryOptions,
                },
                ...section.section_field.slice(1, 3),
                {
                  ...section.section_field[3],
                  field_option: unitOfMeasurementOptions,
                },
                {
                  ...section.section_field[4],
                  field_option: csiDivisionOption,
                },
                {
                  ...section.section_field[5],
                  field_option: csiCodeOptions,
                },
                ...section.section_field.slice(6, 9),
                {
                  ...section.section_field[9],
                  field_option: supplierOptions,
                },
              ],
            };
          });

        const formattedRequest = {
          ...request,
          request_form: {
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
              ...requestSectionList,
            ],
          },
          request_signer:
            projectSignerList.length !== 0
              ? projectSignerList
              : request.request_signer,
        };

        returnData = {
          request: formattedRequest,
          projectOptions
        }
      } else if (form.form_name === "Other Expenses") {
        const suppliers = plv8.execute(
          `
            SELECT *
            FROM supplier_table
            WHERE
              supplier_is_available = true
              AND supplier_is_disabled = false
              AND supplier_team_id = '${teamId}'
            ORDER BY supplier ASC
            LIMIT 100
          `
        );

        const supplierOptions = suppliers.map((suppliers, index) => {
          return {
            option_field_id: form.form_section[1].section_field[9].field_id,
            option_id: suppliers.supplier_id,
            option_order: index,
            option_value: suppliers.supplier,
          };
        });

        const categories = plv8.execute(
          `
            SELECT *
            FROM other_expenses_category_table
            WHERE 
              other_expenses_category_team_id = '${teamId}'
              AND other_expenses_category_is_disabled = false
              AND other_expenses_category_is_available = true
          `
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
            SELECT *
            FROM csi_code_table
            WHERE csi_code_division_id = '01'
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
            SELECT *
            FROM general_unit_of_measurement_table
            WHERE 
              general_unit_of_measurement_team_id = '${teamId}'
              AND general_unit_of_measurement_is_disabled = false
              AND general_unit_of_measurement_is_available = true
          `
        );

        const unitOfMeasurementOptions = unitOfMeasurements.map((uom, index) => {
          return {
            option_field_id: form.form_section[1].section_field[4].field_id,
            option_id: uom.general_unit_of_measurement_id,
            option_order: index,
            option_value: uom.general_unit_of_measurement,
          };
        });

        const sectionWithDuplicateList = form.form_section
          .slice(1)
          .map((section) => {
            return {
              ...section,
              section_field: section.section_field,
            }
          });

        const requestSectionList = sectionWithDuplicateList
          .map((section) => {
            const categoryResponse = JSON.parse(section.section_field[0].field_response[0].request_response);
            const categoryID = categoryOptions.find(category => category.option_value === categoryResponse).option_id;

            const typeList = plv8.execute(`
              SELECT *
              FROM other_expenses_type_table
              WHERE other_expenses_type_category_id = '${categoryID}'
              AND other_expenses_type_is_disabled = false
              AND other_expenses_type_is_available = true
              ORDER BY other_expenses_type
            `);

            const typeOptions = typeList.map((type, index) => {
              return {
                option_field_id: form.form_section[1].section_field[1].field_id,
                option_id: type.other_expenses_type_id,
                option_order: index,
                option_value: type.other_expenses_type,
              };
            });

            return {
              ...section,
              section_field: [
                {
                  ...section.section_field[0],
                  field_option: categoryOptions,
                },
                {
                  ...section.section_field[1],
                  field_option: typeOptions,
                },
                ...section.section_field.slice(2, 4),
                {
                  ...section.section_field[4],
                  field_option: unitOfMeasurementOptions,
                },
                {
                  ...section.section_field[5],
                  field_option: csiCodeDescriptionOptions,
                },
                ...section.section_field.slice(6, 9),
                {
                  ...section.section_field[9],
                  field_option: supplierOptions,
                },
              ],
            };
          });

        const formattedRequest = {
          ...request,
          request_form: {
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
              ...requestSectionList,
            ],
          },
          request_signer:
            projectSignerList.length !== 0
              ? projectSignerList
              : request.request_signer,
        };

        returnData = {
          request: formattedRequest,
          projectOptions
        }
      } else if (form.form_name === "Subcon") {
        const serviceList = plv8.execute(`
          SELECT *
          FROM service_table
          WHERE service_team_id='${teamId}'
            AND service_is_disabled=false
            AND service_is_available=true
            ORDER BY service_name ASC;
        `);

        const serviceOptions = serviceList.map((service, index) => {
          return {
            option_field_id:
              request.request_form.form_section[1].section_field[0].field_id,
            option_id: service.service_id,
            option_order: index,
            option_value: service.service_name,
          };
        });

        const subconResponse = JSON.parse(
          request.request_form.form_section[0].section_field[5]
            .field_response[0].request_response
        );

        const supplierOptions = subconResponse.map((response, responseIdx) => ({
          option_field_id: `${responseIdx}`,
          option_id: `${responseIdx}`,
          option_order: responseIdx,
          option_value: response,
        }));

        const sectionWithDuplicateList = form.form_section
          .slice(1)
          .map((section) => {
            const fieldWithResponse = section.section_field.filter((field) =>
                field.field_response.length > 0 && field.field_response[0] !== null
            );
            return {
              ...section,
              section_field: fieldWithResponse,
            }
          });

        const serviceSectionList = sectionWithDuplicateList.map((section)=>{
          
          const serviceName = JSON.parse(
            section.section_field[0].field_response[0].request_response
          );

          const service = plv8.execute(`
            SELECT *
            FROM service_table
            WHERE service_team_id='${teamId}'
              AND service_name='${serviceName}'
              AND service_is_disabled=false
              AND service_is_available=true;
          `)[0];

          const fieldList = section.section_field.slice(1);
          const newFieldsWithOptions = fieldList.map(field=>{
            const serviceScope = plv8.execute(`
              SELECT *
              FROM service_scope_table
              WHERE service_scope_service_id='${service.service_id}'
                AND service_scope_field_id='${field.field_id}'
                AND service_scope_is_disabled=false
                AND service_scope_is_available=true;
            `)[0];

            let options = []
            if (serviceScope?.service_scope_id){
              serviceScopeChoiceList = plv8.execute(`
                SELECT *
                FROM service_scope_choice_table
                WHERE service_scope_choice_service_scope_id='${serviceScope.service_scope_id}'
                  AND service_scope_choice_is_disabled=false
                  AND service_scope_choice_is_available=true;
              `);

              options = serviceScopeChoiceList.map(
                (options, optionIndex) => {
                  return {
                    option_field_id: field.field_id,
                    option_id: options.service_scope_choice_id,
                    option_order: optionIndex + 1,
                    option_value: options.service_scope_choice_name,
                  };
                }
              );
            }
            
            return {
                ...field,
                field_option: options,
              };
          })

          return {
            ...section,
            section_field: [
              {
                ...section.section_field[0],
                field_option: serviceOptions,
              },
              ...newFieldsWithOptions,
            ],
          };
        })

        const formattedRequest = {
          ...request,
          request_form: {
            ...form,
            form_section: [
              {
                ...form.form_section[0],
                section_field: [
                  {
                    ...form.form_section[0].section_field[0],
                    field_option: projectOptions,
                  },
                  ...form.form_section[0].section_field.slice(1, 5),
                  {
                    ...form.form_section[0].section_field[5],
                    field_option: supplierOptions,
                  },
                ],
              },
              ...serviceSectionList,
            ],
          },
          request_signer:
            projectSignerList.length !== 0
              ? projectSignerList
              : request.request_signer,
        };


        returnData = {
          request: formattedRequest,
          serviceOptions,
          projectOptions,
        };
      } else if (form.form_name === "Sourced Item") {
        const requisitionId = JSON.parse(form.form_section[0].section_field.find(
          (field) => field.field_name === "Requisition ID"
        )?.field_response[0].request_response);

        const requestResponseData = plv8.execute(`
          SELECT
              request_response_table.*,
              field_name,
              field_order
            FROM request_response_table 
            INNER JOIN field_table ON field_id  = request_response_field_id
            WHERE 
              request_response_request_id = '${requisitionId}'
            ORDER BY request_response_duplicatable_section_id, field_name, field_order ASC
        `);

        const items = {};
        const idForNullDuplicationId = plv8.execute('SELECT uuid_generate_v4()')[0].uuid_generate_v4;
        requestResponseData.forEach((response) => {
          if (response.field_name) {
            const fieldName = response.field_name;
            const duplicatableSectionId =
              response.request_response_duplicatable_section_id ??
              idForNullDuplicationId;

            if (response.field_order > 4) {
              if (!items[duplicatableSectionId]) {
                items[duplicatableSectionId] = {
                  name: "",
                  description: "",
                  quantity: 0,
                  unit: "",
                };
              }

              if (fieldName === "General Name") {
                items[duplicatableSectionId].name = JSON.parse(
                  response.request_response
                );
              } else if (fieldName === "Base Unit of Measurement") {
                items[duplicatableSectionId].unit = JSON.parse(
                  response.request_response
                );
              } else if (fieldName === "Quantity") {
                items[duplicatableSectionId].quantity = Number(
                  response.request_response
                );
              } else if (
                fieldName === "GL Account" ||
                fieldName === "CSI Code" ||
                fieldName === "CSI Code Description" ||
                fieldName === "Division Description" ||
                fieldName === "Level 2 Major Group Description" ||
                fieldName === "Level 2 Minor Group Description"
              ) {
              } else {
                items[duplicatableSectionId].description += `${
                  items[duplicatableSectionId].description ? ", " : ""
                }${fieldName}: ${JSON.parse(response.request_response)}`;
              }
            }
          }
        });

        const itemOptions = Object.keys(items).map((item, index) => {
          const value = `${items[item].name} (${items[item].quantity} ${items[item].unit}) (${items[item].description})`;
          return {
            option_field_id: form.form_section[1].section_field[0].field_id,
            option_id: item,
            option_order: index,
            option_value: value,
          };
        });

        const itemSectionWithProjectOptions = form.form_section
          .slice(1)
          .map((section) => ({
            ...section,
            section_field: [
              {
                ...section.section_field[0],
                field_option: itemOptions,
              },
              section.section_field[1],
              {
                ...section.section_field[2],
                field_option: projectOptions.filter(
                  (project) => project.option_id !== request.request_project_id
                ),
              },
            ],
          }));

        const formattedRequest = {
          ...request,
          request_form: {
            ...request.request_form,
            form_section: [
              request.request_form.form_section[0],
              ...itemSectionWithProjectOptions,
            ],
          },
          request_signer:
            projectSignerList.length !== 0
              ? projectSignerList
              : request.request_signer,
        };

        returnData = {
          request: formattedRequest,
          itemOptions,
          requestingProject: request.request_project.team_project_name,
        };
      } else if (form.form_name === "Release Order") {
        const sourcedItemId =JSON.parse(form.form_section[0].section_field.slice(-1)[0].field_response[0].request_response);
       
        const requestResponseData = plv8.execute(`
          SELECT
              request_response_table.*,
              field_name,
              field_order
            FROM request_response_table 
            INNER JOIN field_table ON field_id  = request_response_field_id
            WHERE 
              request_response_request_id = '${sourcedItemId}'
            ORDER BY request_response_duplicatable_section_id, field_name, field_order ASC
        `);

        const items = {};
        const idForNullDuplicationId = plv8.execute('SELECT uuid_generate_v4()')[0].uuid_generate_v4;
        requestResponseData.forEach((response) => {
          if (response.field_name) {
            const fieldName = response.field_name;
            const duplicatableSectionId =
              response.request_response_duplicatable_section_id ??
              idForNullDuplicationId;

            if (response.field_order > 1) {
              if (!items[duplicatableSectionId]) {
                items[duplicatableSectionId] = {
                  item: "",
                  quantity: 0,
                  sourceProject: "",
                };
              }

              if (fieldName === "Item") {
                items[duplicatableSectionId].item = JSON.parse(
                  response.request_response
                );
              } else if (fieldName === "Quantity") {
                items[duplicatableSectionId].quantity = JSON.parse(
                  response.request_response
                );
              } else if (fieldName === "Source Project") {
                items[duplicatableSectionId].sourceProject = JSON.parse(
                  response.request_response
                );
              }
            }
          }
        });

        const sourceProjectList = {};

        const regex = /\(([^()]+)\)/g;
        const itemList = Object.keys(items);
        const newOptionList = itemList.map((item, index) => {
          const itemName = items[item].item;
          const quantity = items[item].quantity;
          const sourceProject = items[item].sourceProject;

          const matches = regex.exec(itemName);
          const unit = matches && matches[1].replace(/\d+/g, "").trim();

          const replace = items[item].item.match(regex);
          if (!replace) return;

          const value = `${itemName.replace(
            replace[0],
            `(${quantity} ${unit}) (${sourceProject})`
          )} `;
          sourceProjectList[value] = items[item].sourceProject;

          return {
            option_field_id: form.form_section[1].section_field[0].field_id,
            option_id: item,
            option_order: index,
            option_value: value,
          };
        });

        const itemOptions = newOptionList.filter(
          (item) => item?.option_value
        );

        const usedItem = request.request_form.form_section
          .slice(1)
          .map((section) =>
            `${JSON.parse(
              section.section_field[0].field_response[0].request_response
            )}`.trim()
          )
          .flat();

        const unusedItemOption = itemOptions.filter(
          (option) => !usedItem.includes(option.option_value.trim())
        );
        const itemSectionWithOptions =
          request.request_form.form_section.slice(1).map((section) => ({
            ...section,
            section_field: [
              {
                ...section.section_field[0],
                field_option: [
                  ...itemOptions.filter(
                    (option) =>
                      option.option_value ===
                      JSON.parse(
                        section.section_field[0].field_response[0]
                          .request_response
                      )
                  ),
                  ...unusedItemOption,
                ],
              },
              ...section.section_field.slice(1),
            ],
          }));

        const formattedRequest = {
          ...request,
          request_form: {
            ...request.request_form,
            form_section: [
              request.request_form.form_section[0],
              ...itemSectionWithOptions,
            ],
          },
          request_signer:
            projectSignerList.length !== 0
              ? projectSignerList
              : request.request_signer,
        };

        returnData = {
          request: formattedRequest,
          itemOptions: unusedItemOption,
          originalItemOptions: itemOptions,
          sourceProjectList,
          requestingProject: request.request_project.team_project_name,
        }
      } else if (form.form_name === "Transfer Receipt") {
        const releaseOrderId =
          JSON.parse(form.form_section[0].section_field.slice(-1)[0].field_response[0]
            .request_response);
        
        const requestResponseData = plv8.execute(`
          SELECT
              request_response_table.*,
              field_name,
              field_order
            FROM request_response_table 
            INNER JOIN field_table ON field_id  = request_response_field_id
            WHERE 
              request_response_request_id = '${releaseOrderId}'
            ORDER BY request_response_duplicatable_section_id, field_name, field_order ASC
        `);

        const items = {};
        const idForNullDuplicationId = plv8.execute('SELECT uuid_generate_v4()')[0].uuid_generate_v4;
        requestResponseData.forEach((response) => {
          if (response.field_name) {
            const fieldName = response.field_name;
            const duplicatableSectionId =
              response.request_response_duplicatable_section_id ??
              idForNullDuplicationId;

            if (response.field_order > 1) {
              if (!items[duplicatableSectionId]) {
                items[duplicatableSectionId] = {
                  item: "",
                  quantity: 0,
                  sourceProject: "",
                };
              }

              if (fieldName === "Item") {
                items[duplicatableSectionId].item = JSON.parse(
                  response.request_response
                );
              } else if (fieldName === "Quantity") {
                items[duplicatableSectionId].quantity = JSON.parse(
                  response.request_response
                );
              } else if (fieldName === "Source Project") {
                items[duplicatableSectionId].sourceProject = JSON.parse(
                  response.request_response
                );
              }
            }
          }
        });

        const sourceProjectList = {};

        const regex = /\(([^()]+)\)/g;
        const itemList = Object.keys(items);
        const newOptionList = itemList.map((item, index) => {
          const itemName = items[item].item;
          const quantity = items[item].quantity;

          const matches = regex.exec(itemName);
          const unit = matches && matches[1].replace(/\d+/g, "").trim();

          const replace = items[item].item.match(regex);
          if (!replace) return;

          const value = `${itemName.replace(
            replace[0],
            `(${quantity} ${unit})`
          )} `;
          sourceProjectList[value] = items[item].sourceProject;

          return {
            option_field_id: form.form_section[1].section_field[0].field_id,
            option_id: item,
            option_order: index,
            option_value: value,
          };
        });

        const itemOptions = newOptionList.filter(
          (item) => item?.option_value
        );

        const usedItem = request.request_form.form_section
          .slice(1)
          .map((section) =>
            `${JSON.parse(
              section.section_field[0].field_response[0].request_response
            )}`.trim()
          )
          .flat();

        const unusedItemOption = itemOptions.filter(
          (option) => !usedItem.includes(option.option_value.trim())
        );
        const itemSectionWithOptions =
          request.request_form.form_section.slice(1).map((section) => ({
            ...section,
            section_field: [
              {
                ...section.section_field[0],
                field_option: [
                  ...itemOptions.filter(
                    (option) =>
                      option.option_value ===
                      JSON.parse(
                        section.section_field[0].field_response[0]
                          .request_response
                      )
                  ),
                  ...unusedItemOption,
                ],
              },
              ...section.section_field.slice(1),
            ],
          }));

        const formattedRequest = {
          ...request,
          request_form: {
            ...request.request_form,
            form_section: [
              request.request_form.form_section[0],
              ...itemSectionWithOptions,
            ],
          },
          request_signer:
            projectSignerList.length !== 0
              ? projectSignerList
              : request.request_signer,
        };

        returnData = {
          request: formattedRequest,
          itemOptions: unusedItemOption,
          originalItemOptions: itemOptions,
          sourceProjectList,
          requestingProject: request.request_project.team_project_name,
        }
      } else if (form.form_name === "Quotation") {
        const requisitionId =
          JSON.parse(form.form_section[0].section_field.slice(-1)[0].field_response[0]
            .request_response);
        
        const requestResponseData = plv8.execute(`
          SELECT
              request_response_table.*,
              field_name,
              field_order
            FROM request_response_table 
            INNER JOIN field_table ON field_id  = request_response_field_id
            WHERE 
              request_response_request_id = '${requisitionId}'
            ORDER BY request_response_duplicatable_section_id, field_name, field_order ASC
        `);

        const items = {};
        const idForNullDuplicationId = plv8.execute('SELECT uuid_generate_v4()')[0].uuid_generate_v4;
        requestResponseData.forEach((response) => {
          if (response) {
            const fieldName = response.field_name;
            const duplicatableSectionId =
              response.request_response_duplicatable_section_id ??
              idForNullDuplicationId;

            if (response.field_order > 4) {
              if (!items[duplicatableSectionId]) {
                items[duplicatableSectionId] = {
                  name: "",
                  description: "",
                  quantity: 0,
                  unit: "",
                };
              }

              if (fieldName === "General Name") {
                items[duplicatableSectionId].name = JSON.parse(
                  response.request_response
                );
              } else if (fieldName === "Base Unit of Measurement") {
                items[duplicatableSectionId].unit = JSON.parse(
                  response.request_response
                );
              } else if (fieldName === "Quantity") {
                items[duplicatableSectionId].quantity = Number(
                  response.request_response
                );
              } else if (
                fieldName === "GL Account" ||
                fieldName === "CSI Code" ||
                fieldName === "CSI Code Description" ||
                fieldName === "Division Description" ||
                fieldName === "Level 2 Major Group Description" ||
                fieldName === "Level 2 Minor Group Description"
              ) {
              } else {
                items[duplicatableSectionId].description += `${
                  items[duplicatableSectionId].description ? ", " : ""
                }${fieldName}: ${JSON.parse(response.request_response)}`;
              }
            }
          }
        });

        const newOptionList = Object.keys(items).map((item, index) => {
          const value = `${items[item].name} (${items[item].quantity} ${items[item].unit}) (${items[item].description})`;
          return {
            option_field_id: form.form_section[1].section_field[0].field_id,
            option_id: item,
            option_order: index,
            option_value: value,
          };
        });

        const itemOptions = newOptionList.filter(
          (item) => item?.option_value
        )

        const usedItem = request.request_form.form_section
          .slice(3)
          .map((section) =>
            `${JSON.parse(
              section.section_field[0].field_response[0].request_response
            )}`.trim()
          )
          .flat();

        const unusedItemOption = itemOptions.filter(
          (option) => !usedItem.includes(option.option_value.trim())
        );

        const itemSectionWithOptions =
          request.request_form.form_section.slice(3).map((section) => ({
            ...section,
            section_field: [
              {
                ...section.section_field[0],
                field_option: [
                  ...itemOptions.filter(
                    (option) =>
                      option.option_value ===
                      JSON.parse(
                        section.section_field[0].field_response[0]
                          .request_response
                      )
                  ),
                  ...unusedItemOption,
                ],
              },
              ...section.section_field.slice(1),
            ],
          }));

        const supplierResponse =
          JSON.parse(request.request_form.form_section[1].section_field[0]
            .field_response[0].request_response);

        const supplierListData = plv8.execute(`
          SELECT * 
          FROM supplier_table
          WHERE supplier_team_id = '${teamId}'
            AND supplier ILIKE '%${supplierResponse}%'
          ORDER BY supplier ASC
          LIMIT 100;
        `);

        const supplierList = supplierListData.map((supplier, index) => {
          return {
            option_field_id: form.form_section[1].section_field[0].field_id,
            option_id: plv8.execute('SELECT uuid_generate_v4()')[0].uuid_generate_v4,
            option_order: index + 1,
            option_value: supplier.supplier,
          };
        });

        const formattedRequest = {
          ...request,
          request_form: {
            ...request.request_form,
            form_section: [
              request.request_form.form_section[0],
              {
                ...request.request_form.form_section[1],
                section_field: [
                  {
                    ...request.request_form.form_section[1]
                      .section_field[0],
                    field_option: supplierList,
                  },
                  ...request.request_form.form_section[1].section_field.slice(
                    1
                  ),
                ],
              },
              request.request_form.form_section[2],
              ...itemSectionWithOptions,
            ],
          },
          request_signer:
            projectSignerList.length !== 0
              ? projectSignerList
              : request.request_signer,
        };

        returnData = {
          requestResponseData,
          request: formattedRequest,
          itemOptions: unusedItemOption,
          originalItemOptions: itemOptions,
          requestingProject: request.request_project.team_project_name,
        };
      } else if (form.form_name === "Receiving Inspecting Report") {
        const quotationId =
          JSON.parse(form.form_section[0].section_field.slice(-1)[0].field_response[0]
            .request_response);
        
        const requestResponseData = plv8.execute(`
          SELECT
              request_response_table.*,
              field_name,
              field_order
            FROM request_response_table 
            INNER JOIN field_table ON field_id  = request_response_field_id
            WHERE 
              request_response_request_id = '${quotationId}'
            ORDER BY request_response_duplicatable_section_id, field_name, field_order ASC
        `);

        const items = {};
        const idForNullDuplicationId = plv8.execute('SELECT uuid_generate_v4()')[0].uuid_generate_v4;
        requestResponseData.forEach((response) => {
          if (response.field_name) {
            const fieldName = response.field_name;
            const duplicatableSectionId =
              response.request_response_duplicatable_section_id ??
              idForNullDuplicationId;

            if (response.field_order > 12) {
              if (!items[duplicatableSectionId]) {
                items[duplicatableSectionId] = {
                  item: "",
                  quantity: "",
                };
              }

              if (fieldName === "Item") {
                items[duplicatableSectionId].item = JSON.parse(
                  response.request_response
                );
              } else if (fieldName === "Quantity") {
                const matches = /\(([^)]+)\)/.exec(items[duplicatableSectionId].item);

                if (matches) {
                  const unit = matches[1].replace(/\d+/g, "").trim();

                  items[
                    duplicatableSectionId
                  ].quantity = `${response.request_response} ${unit}`;
                }
              }
            }
          }
        });

        const sourceProjectList = {};

        const regex = /\(([^()]+)\)/g;
        const itemList = Object.keys(items);
        const newOptionList = itemList.map((item, index) => {
          const itemName = items[item].item;
          const quantity = items[item].quantity;
          const replace = items[item].item.match(regex);
          if (!replace) return;
          const value = `${itemName.replace(replace[0], `(${quantity})`)} `;

          return {
            option_field_id: form.form_section[1].section_field[0].field_id,
            option_id: item,
            option_order: index,
            option_value: value.trim(),
          };
        });

        const itemOptions = newOptionList.filter(
          (item) => item?.option_value
        ) 

        const usedItem = request.request_form.form_section
          .slice(1)
          .map((section) =>
            `${JSON.parse(
              section.section_field[0].field_response[0].request_response
            )}`.trim()
          )
          .flat();

        const unusedItemOption = itemOptions.filter(
          (option) => !usedItem.includes(option.option_value.trim())
        );
        const itemSectionWithOptions =
          request.request_form.form_section.slice(2).map((section) => ({
            ...section,
            section_field: [
              {
                ...section.section_field[0],
                field_option: [
                  ...itemOptions.filter(
                    (option) =>
                      option.option_value ===
                      JSON.parse(
                        section.section_field[0].field_response[0]
                          .request_response
                      )
                  ),
                  ...unusedItemOption,
                ],
              },
              ...section.section_field.slice(1),
            ],
          }));

        const formattedRequest = {
          ...request,
          request_form: {
            ...request.request_form,
            form_section: [
              request.request_form.form_section[0],
              request.request_form.form_section[1],
              ...itemSectionWithOptions,
            ],
          },
          request_signer:
            projectSignerList.length !== 0
              ? projectSignerList
              : request.request_signer,
        };

        returnData = {
          request: formattedRequest,
          itemOptions: unusedItemOption,
          originalItemOptions: itemOptions,
          sourceProjectList,
          requestingProject: request.request_project.team_project_name,
        }
      } else {
        returnData = {request};
      }
    }
 });
 return returnData;
$$ LANGUAGE plv8;

-- End: Get Edit Request on load

-- Start: Fetch Top Requestor

CREATE OR REPLACE FUNCTION fetch_dashboard_top_requestor(
  input_data JSON
)
RETURNS JSON as $$
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
      SELECT 
        request_team_member_id, 
        COUNT(*) 
      FROM request_table
      WHERE 
        request_is_disabled = false
        AND request_date_created BETWEEN '${startDate}' AND '${endDate}'
        AND request_form_id = '${formId}'
      GROUP BY request_team_member_id
      ORDER BY COUNT(*) DESC
      LIMIT '${limit}' 
      OFFSET '${start}'
    `);

    const teamMemberList = topRequestorList.map(requestor => {
      const teamMember = plv8.execute(`
        SELECT 
          team_member_id,
          team_member_role,
          team_member_date_created,
          user_id,
          user_first_name,
          user_last_name,
          user_avatar,
          user_email
        FROM team_member_table
        INNER JOIN user_table ON user_id = team_member_user_id
        WHERE team_member_id = '${requestor.request_team_member_id}'
      `)[0];
      const pendingCount = Number(plv8.execute(`
        SELECT COUNT(*)
        FROM request_table
        WHERE 
          request_status = 'PENDING'
          AND request_is_disabled = false
          AND request_team_member_id = '${requestor.request_team_member_id}'
      `)[0].count);
      const approvedCount = Number(plv8.execute(`
        SELECT COUNT(*)
        FROM request_table
        WHERE 
          request_status = 'APPROVED'
          AND request_is_disabled = false
          AND request_team_member_id = '${requestor.request_team_member_id}'
      `)[0].count);
      const rejectedCount = Number(plv8.execute(`
        SELECT COUNT(*)
        FROM request_table
        WHERE 
          request_status = 'REJECTED'
          AND request_is_disabled = false
          AND request_team_member_id = '${requestor.request_team_member_id}'
      `)[0].count);

      return {
        request: [
          { label: 'Pending', value: pendingCount },
          { label: 'Approved', value: approvedCount },
          { label: 'Rejected', value: rejectedCount },
        ],
        total: pendingCount + approvedCount + rejectedCount,
        team_member_id: teamMember.team_member_id,
        team_member_role: teamMember.team_member_role,
        team_member_user: {
          user_avatar: teamMember.user_avatar,
          user_email: teamMember.user_email,
          user_first_name: teamMember.user_first_name,
          user_id: teamMember.user_id,
          user_last_name: teamMember.user_last_name
        }
      }
    });

    returnData = teamMemberList;
 });
 return returnData;
$$ LANGUAGE plv8;

-- End: Fetch Top Requestor

-- Start: Fetch Top Signer

CREATE OR REPLACE FUNCTION fetch_dashboard_top_signer(
  input_data JSON
)
RETURNS JSON as $$
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
      SELECT 
        signer_team_member_id, 
        COUNT(*) 
      FROM request_signer_table
      INNER JOIN signer_table ON signer_id = request_signer_signer_id
      INNER JOIN request_table ON request_id = request_signer_request_id
      WHERE 
        request_is_disabled = false
        AND request_date_created BETWEEN '${startDate}' AND '${endDate}'
        AND request_form_id = '${formId}'
        AND signer_is_disabled = false
        AND request_status != 'CANCELED'
      GROUP BY signer_team_member_id
      ORDER BY COUNT(*) DESC
      LIMIT '${limit}' 
      OFFSET '${start}'
    `);

    const teamMemberList = topSignerList.map(signer => {
      const teamMember = plv8.execute(`
        SELECT 
          team_member_id,
          team_member_role,
          team_member_date_created,
          user_id,
          user_first_name,
          user_last_name,
          user_avatar,
          user_email
        FROM team_member_table
        INNER JOIN user_table ON user_id = team_member_user_id
        WHERE team_member_id = '${signer.signer_team_member_id}'
      `)[0];
      const pendingCount = Number(plv8.execute(`
        SELECT COUNT(*)
        FROM request_signer_table
        INNER JOIN signer_table ON signer_id = request_signer_signer_id
        INNER JOIN request_table ON request_id = request_signer_request_id
        WHERE 
          request_status = 'PENDING'
          AND request_is_disabled = false
          AND request_status != 'CANCELED'
          AND signer_team_member_id = '${signer.signer_team_member_id}'
      `)[0].count);
      const approvedCount = Number(plv8.execute(`
        SELECT COUNT(*)
        FROM request_signer_table
        INNER JOIN signer_table ON signer_id = request_signer_signer_id
        INNER JOIN request_table ON request_id = request_signer_request_id
        WHERE 
          request_status = 'APPROVED'
          AND request_is_disabled = false
          AND request_status != 'CANCELED'
          AND signer_team_member_id = '${signer.signer_team_member_id}'
      `)[0].count);
      const rejectedCount = Number(plv8.execute(`
        SELECT COUNT(*)
        FROM request_signer_table
        INNER JOIN signer_table ON signer_id = request_signer_signer_id
        INNER JOIN request_table ON request_id = request_signer_request_id
        WHERE 
          request_status = 'REJECTED'
          AND request_is_disabled = false
          AND request_status != 'CANCELED'
          AND signer_team_member_id = '${signer.signer_team_member_id}'
      `)[0].count);

      return {
        request: [
          { label: 'Pending', value: pendingCount },
          { label: 'Approved', value: approvedCount },
          { label: 'Rejected', value: rejectedCount },
        ],
        total: pendingCount + approvedCount + rejectedCount,
        team_member_id: teamMember.team_member_id,
        team_member_role: teamMember.team_member_role,
        team_member_user: {
          user_avatar: teamMember.user_avatar,
          user_email: teamMember.user_email,
          user_first_name: teamMember.user_first_name,
          user_id: teamMember.user_id,
          user_last_name: teamMember.user_last_name
        }
      }
    });

    returnData = teamMemberList;
 });
 return returnData;
$$ LANGUAGE plv8;

-- End: Fetch Top Signer

-- Start: Leave Team

CREATE OR REPLACE FUNCTION leave_team(
    team_id TEXT,
    team_member_id TEXT
)
RETURNS VOID as $$
  plv8.subtransaction(function(){
    const teamMember = plv8.execute(`SELECT * FROM team_member_table WHERE team_member_team_id='${team_id}' AND team_member_id='${team_member_id}'`)[0];
    const isUserOwner = teamMember.team_member_role === 'OWNER';
    if(isUserOwner) throw new Error('Owner cannot leave the team');

    plv8.execute(`UPDATE team_member_table SET team_member_is_disabled=TRUE WHERE team_member_team_id='${team_id}' AND team_member_id='${team_member_id}'`);

    const userTeamList = plv8.execute(`SELECT * FROM team_member_table WHERE team_member_user_id='${teamMember.team_member_user_id}' AND team_member_is_disabled=FALSE`);

    if (userTeamList.length > 0) {
      plv8.execute(`UPDATE user_table SET user_active_team_id='${userTeamList[0].team_member_team_id}' WHERE user_id='${teamMember.team_member_user_id}'`);
    } else {
      plv8.execute(`UPDATE user_table SET user_active_team_id=NULL WHERE user_id='${teamMember.team_member_user_id}'`);
    }
 });
$$ LANGUAGE plv8;

-- End: Leave Team

-- Start: Redirect to team dashboard

CREATE OR REPLACE FUNCTION redirect_to_new_team(
    input_data JSON
)
RETURNS JSON AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      userId,
      teamId,
      app
    } = input_data;

    plv8.execute(`UPDATE user_table SET user_active_team_id = '${teamId}' WHERE user_id = '${userId}'`);

    const teamMember = plv8.execute(`SELECT * FROM team_member_table WHERE team_member_user_id = '${userId}' AND team_member_team_id = '${teamId}'`)[0];

    let formList = [];

    if(teamMember){
      const formData = plv8.execute(
        `
          SELECT *
          FROM form_table
          INNER JOIN team_member_table ON team_member_id = form_team_member_id
          WHERE 
            team_member_team_id = '${teamId}'
            AND form_is_disabled = false
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

-- End: Redirect to team dashboard

-- Start: Format team name to url key
CREATE OR REPLACE FUNCTION format_team_name_to_url_key(team_name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(regexp_replace(team_name, '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;
-- End: Format team name to url key

-- Start: Analyze user issued item

CREATE OR REPLACE FUNCTION analyze_user_issued_item(
    input_data JSON
)
RETURNS JSON AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      teamMemberId,
      startDate,
      endDate
    } = input_data;


    const requestListData = plv8.execute(`
      SELECT request_id
      FROM request_table 
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
      FROM request_response_table rrt 
      INNER JOIN field_table ft ON rrt.request_response_field_id = ft.field_id 
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

-- End: Analyze user issued item

-- Start: memo queries

CREATE OR REPLACE FUNCTION create_memo(
    input_data JSON
)
RETURNS JSON AS $$
  let new_memo_data;
  plv8.subtransaction(function(){
    const {
      memoData,
      signerData,
      lineItemData
    } = input_data;

    const memo_count = plv8.execute(`SELECT COUNT(*) FROM memo_table WHERE memo_reference_number = '${memoData.memo_reference_number}'`)[0].count;
    const memo_version = (Number(memo_count) + 1);
    memoData.memo_version = memo_version;

    new_memo_data = plv8.execute(`
      INSERT INTO memo_table (
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

    plv8.execute(`INSERT INTO memo_date_updated_table (memo_date_updated_memo_id) VALUES ('${new_memo_data.memo_id}')`);
    plv8.execute(`INSERT INTO memo_status_table (memo_status_memo_id) VALUES ('${new_memo_data.memo_id}')`);

    const signerTableValues = signerData.map((signer) => `('${signer.memo_signer_is_primary}','${signer.memo_signer_order}','${signer.memo_signer_team_member_id}', '${new_memo_data.memo_id}')`).join(",");

    plv8.execute(`INSERT INTO memo_signer_table (memo_signer_is_primary, memo_signer_order, memo_signer_team_member_id, memo_signer_memo_id) VALUES ${signerTableValues}`);

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
      INSERT INTO memo_line_item_table (
        memo_line_item_id,
        memo_line_item_content,
        memo_line_item_order,
        memo_line_item_memo_id
      ) VALUES 
      ${lineItemTableValues.join(",")}
    `);

    if (lineItemAttachmentTableValues.length > 0) {
      plv8.execute(`
        INSERT INTO memo_line_item_attachment_table (
          memo_line_item_attachment_name,
          memo_line_item_attachment_caption,
          memo_line_item_attachment_storage_bucket,
          memo_line_item_attachment_public_url,
          memo_line_item_attachment_line_item_id
        ) VALUES 
        ${lineItemAttachmentTableValues.join(",")}
      `);
    }

    const activeTeamResult = plv8.execute(`SELECT * FROM team_table WHERE team_id='${memoData.memo_team_id}';`);
    const activeTeam = activeTeamResult.length > 0 ? activeTeamResult[0] : null;
    const memo_author_data = plv8.execute(`SELECT user_first_name, user_last_name FROM user_table WHERE user_id = '${memoData.memo_author_user_id}' LIMIT 1`)[0];

    const signerNotificationInput = signerData.map((signer) => ({notification_app: 'REQUEST', notification_content: `${memo_author_data.user_first_name} ${memo_author_data.user_last_name} requested you to sign his/her memo`, notification_redirect_url: '', notification_team_id: memoData.memo_team_id, notification_type: 'MEMO-APPROVAL', notification_user_id: signer.memo_signer_user_id}));

    
    if (activeTeam && memo_author_data) {
      const teamNameUrlKeyResult = plv8.execute(`SELECT format_team_name_to_url_key('${activeTeam.team_name}') AS url_key;`);
      const teamNameUrlKey = teamNameUrlKeyResult.length > 0 ? teamNameUrlKeyResult[0].url_key : null;

      if (teamNameUrlKey) {
        const notificationValues = signerNotificationInput
        .map(
          (notification) =>
            `('${notification.notification_app}','${notification.notification_content}','/${teamNameUrlKey}/memo/${new_memo_data.memo_id}','${notification.notification_team_id}','${notification.notification_type}','${notification.notification_user_id}')`
        )
        .join(",");

        plv8.execute(`INSERT INTO notification_table (notification_app,notification_content,notification_redirect_url,notification_team_id,notification_type,notification_user_id) VALUES ${notificationValues};`);
      }
    }

 });
 return new_memo_data;
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_memo_on_load(
    input_data JSON
)
RETURNS JSON AS $$
  let memo_data_on_load;
  plv8.subtransaction(function(){

    const {memo_id, current_user_id, isReference} = input_data;

    const currentUser = plv8.execute(`SELECT * FROM team_member_table WHERE team_member_user_id = '${current_user_id}' LIMIT 1`)[0];
    
    if (currentUser) {
      const hasUserReadMemo = plv8.execute(
      `
        SELECT COUNT(*) 
        FROM memo_read_receipt_table 
        WHERE memo_read_receipt_by_team_member_id = '${currentUser.team_member_id}' 
        AND memo_read_receipt_memo_id = '${memo_id}';
      `)[0];

      if (Number(hasUserReadMemo.count) === 0) {
        plv8.execute(`INSERT INTO memo_read_receipt_table (memo_read_receipt_by_team_member_id, memo_read_receipt_memo_id) VALUES ('${currentUser.team_member_id}', '${memo_id}')`);
      }
    }

    const memo_data_raw = plv8.execute(
      `
      SELECT *
      FROM memo_table
      INNER JOIN user_table ON user_table.user_id = memo_author_user_id
      INNER JOIN memo_date_updated_table ON memo_date_updated_memo_id = memo_id
      INNER JOIN memo_status_table ON memo_status_memo_id = memo_id
      WHERE memo_id = '${memo_id}' AND memo_is_disabled = false
      LIMIT 1;
      `
    )[0];

    if (memo_data_raw.length === 0) {
        memo_data_on_load = {};
    }

    const {memo_subject, memo_reference_number, memo_date_created, memo_version, memo_date_updated, memo_status, user_id, user_avatar, user_first_name, user_last_name, user_job_title, user_signature_attachment_id} = memo_data_raw;

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
        SELECT * 
        FROM memo_signer_table 
        INNER JOIN team_member_table tm ON tm.team_member_id = memo_signer_team_member_id 
        INNER JOIN user_table ut ON ut.user_id = tm.team_member_user_id 
        LEFT JOIN attachment_table ON attachment_id = ut.user_signature_attachment_id
        WHERE memo_signer_memo_id = '${memo_id}'
    `);

    const signer_data = signer_data_raw.map(row => {
        const newSignerData = {
        memo_signer_id: row.memo_signer_id,
        memo_signer_status: row.memo_signer_status,
        memo_signer_is_primary: row.memo_signer_is_primary,
        memo_signer_order: row.memo_signer_order,
        memo_signer_team_member: {
                team_member_id: row.team_member_id,
                user: {
                    user_id: row.user_id,
                    user_first_name: row.user_first_name,
                    user_last_name: row.user_last_name,
                    user_avatar: row.user_avatar,
                    user_signature_attachment: {
                        user_signature_attachment_id: row.attachment_id,
                        attachment_value: row.attachment_value
                    },
                    user_job_title: row.user_job_title
                }
            }
        }

        return newSignerData;
    });

    const line_item_data_raw = plv8.execute(`
        SELECT * 
        FROM memo_line_item_table 
        LEFT JOIN memo_line_item_attachment_table mat ON mat.memo_line_item_attachment_line_item_id = memo_line_item_id 
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
    }));

    const read_receipt_data = plv8.execute(
      `
        SELECT memo_read_receipt_table.*, user_id, user_first_name, user_last_name, user_avatar, user_employee_number
        FROM memo_read_receipt_table 
        INNER JOIN team_member_table ON team_member_id = memo_read_receipt_by_team_member_id
        INNER JOIN user_table ON user_id = team_member_user_id
        LEFT JOIN user_employee_number_table ON user_id = user_employee_number_user_id
        WHERE memo_read_receipt_memo_id = '${memo_id}'
      `
    );

    const agreement_data = plv8.execute(
      `
        SELECT memo_agreement_table.*, user_id, user_first_name, user_last_name, user_avatar, user_employee_number
        FROM memo_agreement_table
        INNER JOIN team_member_table ON team_member_id = memo_agreement_by_team_member_id
        INNER JOIN user_table ON user_id = team_member_user_id
        LEFT JOIN user_employee_number_table ON user_id = user_employee_number_user_id
        WHERE memo_agreement_memo_id = '${memo_id}'
      `
    )

    memo_data_on_load = {
        ...memo_data,
        memo_signer_list: signer_data,
        memo_line_item_list: line_item_data,
        memo_read_receipt_list: read_receipt_data,
        memo_agreement_list: agreement_data
    }
 });
 return memo_data_on_load;
$$ LANGUAGE plv8;



CREATE OR REPLACE FUNCTION get_memo_list(
    input_data JSON
)
RETURNS JSON AS $$
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
      searchFilter
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
        FROM memo_table
        INNER JOIN user_table ON user_table.user_id = memo_table.memo_author_user_id
        INNER JOIN memo_date_updated_table ON memo_date_updated_memo_id = memo_table.memo_id
        INNER JOIN memo_status_table ON memo_status_memo_id = memo_table.memo_id
        LEFT JOIN memo_signer_table ON memo_signer_table.memo_signer_memo_id = memo_table.memo_id
        LEFT JOIN team_member_table ON team_member_table.team_member_id = memo_signer_table.memo_signer_team_member_id
        LEFT JOIN user_table AS team_member_user_table ON team_member_user_table.user_id = team_member_table.team_member_user_id
        LEFT JOIN memo_line_item_table ON memo_line_item_table.memo_line_item_memo_id = memo_table.memo_id
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
        ORDER BY memo_table.memo_date_created ${sort}
        OFFSET ${start} ROWS FETCH FIRST ${limit} ROWS ONLY
      `
    );

    const memo_count = plv8.execute(`
      SELECT COUNT(DISTINCT memo_table.memo_id)
      FROM memo_table
      INNER JOIN memo_date_updated_table ON memo_date_updated_memo_id = memo_id
      INNER JOIN memo_status_table ON memo_status_memo_id = memo_id
      LEFT JOIN memo_line_item_table ON memo_line_item_table.memo_line_item_memo_id = memo_id
      LEFT JOIN memo_signer_table ON memo_signer_table.memo_signer_memo_id = memo_id
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
RETURNS JSON AS $$
  plv8.subtransaction(function(){
    const {
      memo_id,
      memo_subject,
      memoSignerTableValues,
      memoLineItemTableValues,
      memoLineItemAttachmentTableValues,
      memoLineItemIdFilter
    } = input_data;

    plv8.execute(`UPDATE memo_table SET memo_subject = '${memo_subject}' WHERE memo_id = '${memo_id}'`);

    plv8.execute(`UPDATE memo_date_updated_table SET memo_date_updated = NOW() WHERE memo_date_updated_memo_id = '${memo_id}'`);

    plv8.execute(`DELETE FROM memo_signer_table WHERE memo_signer_memo_id = '${memo_id}'`);

    plv8.execute(`DELETE FROM memo_line_item_table WHERE memo_line_item_memo_id = '${memo_id}'`);

    plv8.execute(`DELETE FROM memo_line_item_attachment_table WHERE memo_line_item_attachment_line_item_id IN (${memoLineItemIdFilter})`);

    plv8.execute(`INSERT INTO memo_signer_table (memo_signer_is_primary, memo_signer_order, memo_signer_team_member_id, memo_signer_memo_id) VALUES ${memoSignerTableValues}`);

    plv8.execute(`INSERT INTO memo_line_item_table (memo_line_item_id, memo_line_item_content, memo_line_item_order, memo_line_item_memo_id) VALUES ${memoLineItemTableValues}`);

    plv8.execute(`INSERT INTO memo_line_item_attachment_table (memo_line_item_attachment_name,memo_line_item_attachment_caption,memo_line_item_attachment_storage_bucket,memo_line_item_attachment_public_url,memo_line_item_attachment_line_item_id) VALUES ${memoLineItemAttachmentTableValues}`);
 });
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION get_memo_reference_on_load(
    input_data JSON
)
RETURNS JSON AS $$
  let memo_data_on_load;
  plv8.subtransaction(function(){

    const {memo_id, current_user_id} = input_data;

    const currentUser = plv8.execute(`
      SELECT *
      FROM team_member_table
      INNER JOIN user_table ON user_id = team_member_user_id
      WHERE team_member_user_id = '${current_user_id}'
      LIMIT 1
    `)[0];

    const memo_data_raw = plv8.execute(
      `
      SELECT *
      FROM memo_table
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
        SELECT * 
        FROM memo_signer_table 
        INNER JOIN team_member_table tm ON tm.team_member_id = memo_signer_team_member_id 
        INNER JOIN user_table ut ON ut.user_id = tm.team_member_user_id 
        LEFT JOIN attachment_table ON attachment_id = ut.user_signature_attachment_id
        WHERE memo_signer_memo_id = '${memo_id}'
    `);

    const signer_data = signer_data_raw.map(row => {
        const newSignerData = {
        memo_signer_id: row.memo_signer_id,
        memo_signer_status: row.memo_signer_status,
        memo_signer_is_primary: row.memo_signer_is_primary,
        memo_signer_order: row.memo_signer_order,
        memo_signer_team_member: {
                team_member_id: row.team_member_id,
                user: {
                    user_id: row.user_id,
                    user_first_name: row.user_first_name,
                    user_last_name: row.user_last_name,
                    user_avatar: row.user_avatar,
                    user_signature_attachment: {
                        user_signature_attachment_id: row.attachment_id,
                        attachment_value: row.attachment_value
                    },
                    user_job_title: row.user_job_title
                }
            }
        }

        return newSignerData;
    });

    const line_item_data_raw = plv8.execute(`
        SELECT * 
        FROM memo_line_item_table 
        LEFT JOIN memo_line_item_attachment_table mat ON mat.memo_line_item_attachment_line_item_id = memo_line_item_id 
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
    }));
    
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
RETURNS JSON AS $$
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
      memoLineItemAttachmentTableValues,
      memoLineItemIdFilter
    } = input_data;

    const memo_count = plv8.execute(`
      SELECT COUNT(*) 
      FROM memo_table 
      WHERE memo_reference_number = '${memo_reference_number}'
    `)[0].count;
    const memo_version = Number(memo_count) + 1;

    new_memo_data = plv8.execute(`
      INSERT INTO memo_table (
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
      INSERT INTO memo_date_updated_table (memo_date_updated_memo_id) 
      VALUES ('${new_memo_data.memo_id}')
    `);

    plv8.execute(`
      INSERT INTO memo_status_table (memo_status_memo_id) 
      VALUES ('${new_memo_data.memo_id}')
    `);

    plv8.execute(`
      INSERT INTO memo_signer_table (
        memo_signer_is_primary,
        memo_signer_order,
        memo_signer_team_member_id,
        memo_signer_memo_id
      ) 
      VALUES ${memoSignerTableValues}
    `);

    plv8.execute(`
      INSERT INTO memo_line_item_table (
        memo_line_item_id,
        memo_line_item_content,
        memo_line_item_order,
        memo_line_item_memo_id
      ) 
      VALUES ${memoLineItemTableValues}
    `);

    plv8.execute(`
      INSERT INTO memo_line_item_attachment_table (
        memo_line_item_attachment_name,
        memo_line_item_attachment_caption,
        memo_line_item_attachment_storage_bucket,
        memo_line_item_attachment_public_url,
        memo_line_item_attachment_line_item_id
      ) 
      VALUES ${memoLineItemAttachmentTableValues}
    `);
  });
  return new_memo_data;
$$ LANGUAGE plv8;

-- End: memo queries

-- Start: Update user

CREATE OR REPLACE FUNCTION update_user(
    input_data JSON
)
RETURNS VOID AS $$
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
    plv8.execute(`UPDATE user_table SET ${userDataUpdate.join(", ")} WHERE user_id = '${userData.user_id}'`);

    if(previousUsername){
      plv8.execute(`INSERT INTO user_name_history_table (user_name_history_value, user_name_history_user_id) VALUES ('${previousUsername}', '${userData.user_id}')`);
    }
    if(previousSignatureUrl){
      plv8.execute(`INSERT INTO signature_history_table (signature_history_value, signature_history_user_id) VALUES ('${previousSignatureUrl}', '${userData.user_id}')`);
    }
 });
$$ LANGUAGE plv8;

-- End: Update user

---------- End: FUNCTIONS


-------- Start: POLICIES
ALTER TABLE attachment_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_member_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_description_field_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_description_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE option_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_signer_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE signer_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_response_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_team_group_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_group_member_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_group_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_project_member_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_project_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comment_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_division_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_description_field_uom_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_approver_item_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_employee_number_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_onboard_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_name_history_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE signature_history_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE general_unit_of_measurement_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_category_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE memo_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE memo_signer_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE memo_line_item_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE memo_line_item_attachment_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE memo_date_updated_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE memo_status_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE memo_read_receipt_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE memo_agreement_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE memo_format_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CRUD for anon users" ON attachment_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users" ON team_member_table;
DROP POLICY IF EXISTS "Allow READ for anon users" ON team_member_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON team_member_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON team_member_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users" ON field_table;
DROP POLICY IF EXISTS "Allow READ for anon users" ON field_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON field_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON field_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON form_table;
DROP POLICY IF EXISTS "Allow READ for anon users" ON form_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON form_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON form_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON item_description_field_table;
DROP POLICY IF EXISTS "Allow READ access for anon users" ON item_description_field_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON item_description_field_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON item_description_field_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON item_description_table;
DROP POLICY IF EXISTS "Allow READ access for anon users" ON item_description_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON item_description_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON item_description_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON item_table;
DROP POLICY IF EXISTS "Allow READ access for anon users" ON item_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON item_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON item_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON option_table;
DROP POLICY IF EXISTS "Allow READ for anon users" ON option_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON option_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON option_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users" ON request_signer_table;
DROP POLICY IF EXISTS "Allow READ for anon users" ON request_signer_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON request_signer_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users" ON request_signer_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON section_table;
DROP POLICY IF EXISTS "Allow READ for anon users" ON section_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON section_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON section_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON signer_table;
DROP POLICY IF EXISTS "Allow READ for anon users" ON signer_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON signer_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON signer_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON supplier_table;
DROP POLICY IF EXISTS "Allow READ access for anon users" ON supplier_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON supplier_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON supplier_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users" ON comment_table;
DROP POLICY IF EXISTS "Allow READ for anon users" ON comment_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users based on team_member_id" ON comment_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users based on team_member_id" ON comment_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users" ON invitation_table;
DROP POLICY IF EXISTS "Allow READ for users based on invitation_to_email" ON invitation_table;
DROP POLICY IF EXISTS "Allow UPDATE for users based on invitation_from_team_member_id" ON invitation_table;
DROP POLICY IF EXISTS "Allow DELETE for users based on invitation_from_team_member_id" ON invitation_table;

DROP POLICY IF EXISTS "Allow INSERT for authenticated users" ON notification_table;
DROP POLICY IF EXISTS "Allow READ for authenticated users on own notifications" ON notification_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users on notification_user_id" ON notification_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users on notification_user_id" ON notification_table;

DROP POLICY IF EXISTS "Allow CREATE access for all users" ON request_response_table;
DROP POLICY IF EXISTS "Allow READ for anon users" ON request_response_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users on own request response" ON request_response_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users on own request response" ON request_response_table;

DROP POLICY IF EXISTS "Allow CREATE access for all users" ON request_table;
DROP POLICY IF EXISTS "Allow READ for anon users" ON request_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users on own requests" ON request_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users on own requests" ON request_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users" ON team_table;
DROP POLICY IF EXISTS "Allow READ for authenticated users" ON team_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users on own teams" ON team_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users on own teams" ON team_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users" ON user_table;
DROP POLICY IF EXISTS "Allow READ for anon users" ON user_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users based on user_id" ON user_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users based on user_id" ON user_table;

DROP POLICY IF EXISTS "Allow CREATE for OWNER or ADMIN roles" ON form_team_group_table;
DROP POLICY IF EXISTS "Allow READ for authenticated team members" ON form_team_group_table;
DROP POLICY IF EXISTS "Allow UPDATE for OWNER or ADMIN roles" ON form_team_group_table;
DROP POLICY IF EXISTS "Allow DELETE for OWNER or ADMIN roles" ON form_team_group_table;

DROP POLICY IF EXISTS "Allow CREATE for OWNER or ADMIN roles" ON team_group_member_table;
DROP POLICY IF EXISTS "Allow READ for authenticated team members" ON team_group_member_table;
DROP POLICY IF EXISTS "Allow UPDATE for OWNER or ADMIN roles" ON team_group_member_table;
DROP POLICY IF EXISTS "Allow DELETE for OWNER or ADMIN roles" ON team_group_member_table;

DROP POLICY IF EXISTS "Allow CREATE for OWNER or ADMIN roles" ON team_group_table;
DROP POLICY IF EXISTS "Allow READ for authenticated team members" ON team_group_table;
DROP POLICY IF EXISTS "Allow UPDATE for OWNER or ADMIN roles" ON team_group_table;
DROP POLICY IF EXISTS "Allow DELETE for OWNER or ADMIN roles" ON team_group_table;

DROP POLICY IF EXISTS "Allow CREATE for OWNER or ADMIN roles" ON team_project_member_table;
DROP POLICY IF EXISTS "Allow READ for authenticated team members" ON team_project_member_table;
DROP POLICY IF EXISTS "Allow UPDATE for OWNER or ADMIN roles" ON team_project_member_table;
DROP POLICY IF EXISTS "Allow DELETE for OWNER or ADMIN roles" ON team_project_member_table;

DROP POLICY IF EXISTS "Allow CREATE for OWNER or ADMIN roles" ON team_project_table;
DROP POLICY IF EXISTS "Allow READ for anon" ON team_project_table;
DROP POLICY IF EXISTS "Allow UPDATE for OWNER or ADMIN roles" ON team_project_table;
DROP POLICY IF EXISTS "Allow DELETE for OWNER or ADMIN roles" ON team_project_table;

DROP POLICY IF EXISTS "Allow CREATE access for all users" ON ticket_table;
DROP POLICY IF EXISTS "Allow READ for anon users" ON ticket_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON ticket_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users on own ticket" ON ticket_table;

DROP POLICY IF EXISTS "Allow CREATE access for all users" ON ticket_comment_table;
DROP POLICY IF EXISTS "Allow READ for anon users" ON ticket_comment_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON ticket_comment_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users on own ticket" ON ticket_comment_table;

DROP POLICY IF EXISTS "Allow READ access for anon users" ON csi_code_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON service_scope_choice_table;
DROP POLICY IF EXISTS "Allow READ access for anon users" ON service_scope_choice_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON service_scope_choice_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON service_scope_choice_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON service_scope_table;
DROP POLICY IF EXISTS "Allow READ access for anon users" ON service_scope_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON service_scope_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON service_scope_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON service_table;
DROP POLICY IF EXISTS "Allow READ access for anon users" ON service_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON service_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON service_table;

DROP POLICY IF EXISTS "Allow READ access for anon users" ON special_approver_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON item_division_table;
DROP POLICY IF EXISTS "Allow READ access for anon users" ON item_division_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON item_division_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON item_division_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON item_description_field_uom_table;
DROP POLICY IF EXISTS "Allow READ access for anon users" ON item_description_field_uom_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON item_description_field_uom_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON item_description_field_uom_table;

DROP POLICY IF EXISTS "Allow CREATE access for all users" ON user_onboard_table;
DROP POLICY IF EXISTS "Allow READ for anon users" ON user_onboard_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON user_onboard_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users on own onboard" ON user_onboard_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users" ON user_employee_number_table;
DROP POLICY IF EXISTS "Allow READ for anon users" ON user_employee_number_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users based on user_id" ON user_employee_number_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users based on user_id" ON user_employee_number_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users" ON user_name_history_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users" ON signature_history_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON general_unit_of_measurement_table;
DROP POLICY IF EXISTS "Allow READ for anon users" ON general_unit_of_measurement_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON general_unit_of_measurement_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON general_unit_of_measurement_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON service_category_table;
DROP POLICY IF EXISTS "Allow READ for anon users" ON service_category_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON service_category_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON service_category_table;

DROP POLICY IF EXISTS "Allow CREATE access for auth users" ON memo_table;
DROP POLICY IF EXISTS "Allow READ for anon users" ON memo_table;
DROP POLICY IF EXISTS "Allow UPDATE for auth users" ON memo_table;
DROP POLICY IF EXISTS "Allow DELETE for auth users on own memo" ON memo_table;

DROP POLICY IF EXISTS "Allow CRUD for auth users" ON memo_signer_table;

DROP POLICY IF EXISTS "Allow CRUD for auth users" ON memo_line_item_table;

DROP POLICY IF EXISTS "Allow CRUD for auth users" ON memo_line_item_attachment_table;

DROP POLICY IF EXISTS "Allow CREATE access for auth users" ON memo_date_updated_table;
DROP POLICY IF EXISTS "Allow READ for anon users" ON memo_date_updated_table;
DROP POLICY IF EXISTS "Allow UPDATE for auth users" ON memo_date_updated_table;
DROP POLICY IF EXISTS "Allow DELETE for auth users on own memo" ON memo_date_updated_table;

DROP POLICY IF EXISTS "Allow CREATE access for auth users" ON memo_status_table;
DROP POLICY IF EXISTS "Allow READ for anon users" ON memo_status_table;
DROP POLICY IF EXISTS "Allow UPDATE for auth users" ON memo_status_table;
DROP POLICY IF EXISTS "Allow DELETE for auth users on own memo" ON memo_status_table;

DROP POLICY IF EXISTS "Allow CREATE access for auth users" ON memo_read_receipt_table;
DROP POLICY IF EXISTS "Allow READ for anon users" ON memo_read_receipt_table;

DROP POLICY IF EXISTS "Allow CREATE access for auth users" ON memo_agreement_table;
DROP POLICY IF EXISTS "Allow READ for anon users" ON memo_agreement_table;

DROP POLICY IF EXISTS "Allow CRUD for auth users" ON memo_format_table;

--- ATTACHMENT_TABLE
CREATE POLICY "Allow CRUD for anon users" ON "public"."attachment_table"
AS PERMISSIVE FOR ALL
USING (true);

--- FIELD_TABLE
CREATE POLICY "Allow CREATE for authenticated users" ON "public"."field_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow READ for anon users" ON "public"."field_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON "public"."field_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING ( 
  (
    SELECT tt.team_member_team_id
    FROM section_table AS st
    JOIN form_table AS fot ON st.section_form_id = fot.form_id
    JOIN team_member_table AS tt ON fot.form_team_member_id = tt.team_member_id
    WHERE st.section_id = field_section_id
  ) IN (
    SELECT team_member_team_id
    FROM team_member_table
    WHERE team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON "public"."field_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING ( 
  (
    SELECT tt.team_member_team_id
    FROM section_table AS st
    JOIN form_table AS fot ON st.section_form_id = fot.form_id
    JOIN team_member_table AS tt ON fot.form_team_member_id = tt.team_member_id
    WHERE st.section_id = field_section_id
  ) IN (
    SELECT team_member_team_id
    FROM team_member_table
    WHERE team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- FORM_TABLE
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON "public"."form_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK ( 
  (
    SELECT team_member_team_id
    FROM team_member_table
    WHERE team_member_id = form_team_member_id
  ) IN (
    SELECT team_member_team_id 
    FROM team_member_table 
    WHERE team_member_user_id = auth.uid() 
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow READ for anon users" ON "public"."form_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON "public"."form_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  (
    SELECT team_member_team_id
    FROM team_member_table
    WHERE team_member_id = form_team_member_id
  ) IN (
    SELECT team_member_team_id 
    FROM team_member_table 
    WHERE team_member_user_id = auth.uid() 
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON "public"."form_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  (
    SELECT team_member_team_id
    FROM team_member_table
    WHERE team_member_id = form_team_member_id
  ) IN (
    SELECT team_member_team_id 
    FROM team_member_table 
    WHERE team_member_user_id = auth.uid() 
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- ITEM_DESCRIPTION_FIELD_TABLE
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON "public"."item_description_field_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM item_description_table as id
    JOIN item_table as it ON it.item_id = id.item_description_item_id
    JOIN team_table as tt ON tt.team_id = it.item_team_id
    JOIN team_member_table as tm ON tm.team_member_team_id = tt.team_id
    WHERE id.item_description_id = item_description_field_item_description_id
    AND tm.team_member_user_id = auth.uid()
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow READ access for anon users" ON "public"."item_description_field_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON "public"."item_description_field_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM item_description_table as id
    JOIN item_table as it ON it.item_id = id.item_description_item_id
    JOIN team_table as tt ON tt.team_id = it.item_team_id
    JOIN team_member_table as tm ON tm.team_member_team_id = tt.team_id
    WHERE id.item_description_id = item_description_field_item_description_id
    AND tm.team_member_user_id = auth.uid()
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON "public"."item_description_field_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM item_description_table as id
    JOIN item_table as it ON it.item_id = id.item_description_item_id
    JOIN team_table as tt ON tt.team_id = it.item_team_id
    JOIN team_member_table as tm ON tm.team_member_team_id = tt.team_id
    WHERE id.item_description_id = item_description_field_item_description_id
    AND tm.team_member_user_id = auth.uid()
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- ITEM_DESCRIPTION_TABLE
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON "public"."item_description_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM item_table as it
    JOIN team_table as tt ON tt.team_id = it.item_team_id
    JOIN team_member_table as tm ON tm.team_member_team_id = tt.team_id
    WHERE it.item_id = item_description_item_id
    AND tm.team_member_user_id = auth.uid()
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow READ access for anon users" ON "public"."item_description_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON "public"."item_description_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM item_table as it
    JOIN team_table as tt ON tt.team_id = it.item_team_id
    JOIN team_member_table as tm ON tm.team_member_team_id = tt.team_id
    WHERE it.item_id = item_description_item_id
    AND tm.team_member_user_id = auth.uid()
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON "public"."item_description_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM item_table as it
    JOIN team_table as tt ON tt.team_id = it.item_team_id
    JOIN team_member_table as tm ON tm.team_member_team_id = tt.team_id
    WHERE it.item_id = item_description_item_id
    AND tm.team_member_user_id = auth.uid()
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- ITEM_TABLE
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON "public"."item_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM team_member_table
    WHERE team_member_team_id = item_team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow READ access for anon users" ON "public"."item_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON "public"."item_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_member_table
    WHERE team_member_team_id = item_team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON "public"."item_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_member_table
    WHERE team_member_team_id = item_team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- OPTION_TABLE
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON "public"."option_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM field_table as ft
    JOIN section_table as st ON st.section_id = ft.field_section_id
    JOIN form_table as fo ON fo.form_id = st.section_form_id
    JOIN team_member_table as tm ON tm.team_member_id = fo.form_team_member_id 
    WHERE ft.field_id = option_field_id
    AND tm.team_member_user_id = auth.uid()
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow READ for anon users" ON "public"."option_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON "public"."option_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM field_table as ft
    JOIN section_table as st ON st.section_id = ft.field_section_id
    JOIN form_table as fo ON fo.form_id = st.section_form_id
    JOIN team_member_table as tm ON tm.team_member_id = fo.form_team_member_id 
    WHERE ft.field_id = option_field_id
    AND tm.team_member_user_id = auth.uid()
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON "public"."option_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM field_table as ft
    JOIN section_table as st ON st.section_id = ft.field_section_id
    JOIN form_table as fo ON fo.form_id = st.section_form_id
    JOIN team_member_table as tm ON tm.team_member_id = fo.form_team_member_id 
    WHERE ft.field_id = option_field_id
    AND tm.team_member_user_id = auth.uid()
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- REQUEST_SIGNER_TABLE
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON "public"."request_signer_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  (
    SELECT tm.team_member_team_id
    FROM request_table as rt
    JOIN team_member_table as tm ON tm.team_member_id = rt.request_team_member_id
    WHERE rt.request_id = request_signer_request_id
  ) IN (
    SELECT team_member_team_id 
    FROM team_member_table 
    WHERE team_member_user_id = auth.uid()
  )
);

CREATE POLICY "Allow READ for anon users" ON "public"."request_signer_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users with OWNER or APPROVER role" ON "public"."request_signer_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  (
    SELECT tm.team_member_team_id
    FROM request_table as rt
    JOIN team_member_table as tm ON tm.team_member_id = rt.request_team_member_id
    WHERE rt.request_id = request_signer_request_id
  ) IN (
    SELECT team_member_team_id 
    FROM team_member_table 
    WHERE team_member_user_id = auth.uid() 
    AND team_member_role IN ('OWNER', 'APPROVER')
  )
);

CREATE POLICY "Allow DELETE for authenticated users" ON "public"."request_signer_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  (
    SELECT tm.team_member_team_id
    FROM request_table as rt
    JOIN team_member_table as tm ON tm.team_member_id = rt.request_team_member_id
    WHERE rt.request_id = request_signer_request_id
  ) IN (
    SELECT team_member_team_id 
    FROM team_member_table 
    WHERE team_member_user_id = auth.uid()
  )
);

--- SECTION_TABLE
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON "public"."section_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  (
    SELECT tm.team_member_team_id
    FROM form_table as fo
    JOIN team_member_table as tm ON tm.team_member_id = fo.form_team_member_id
    WHERE fo.form_id = section_form_id
  ) IN (
    SELECT team_member_team_id
    FROM team_member_table
    WHERE team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow READ for anon users" ON "public"."section_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON "public"."section_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  (
    SELECT tm.team_member_team_id
    FROM form_table as fo
    JOIN team_member_table as tm ON tm.team_member_id = fo.form_team_member_id
    WHERE fo.form_id = section_form_id
  ) = (
    SELECT team_member_team_id
    FROM team_member_table
    WHERE team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON "public"."section_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  (
    SELECT tm.team_member_team_id
    FROM form_table as fo
    JOIN team_member_table as tm ON tm.team_member_id = fo.form_team_member_id
    WHERE fo.form_id = section_form_id
  ) = (
    SELECT team_member_team_id
    FROM team_member_table
    WHERE team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- SIGNER_TABLE
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON "public"."signer_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  (
    SELECT tm.team_member_team_id
    FROM form_table as fo
    JOIN team_member_table as tm ON tm.team_member_id = fo.form_team_member_id
    WHERE fo.form_id = signer_form_id
  ) IN (
    SELECT team_member_team_id
    FROM team_member_table
    WHERE team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow READ for anon users" ON "public"."signer_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON "public"."signer_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  (
    SELECT tm.team_member_team_id
    FROM form_table as fo
    JOIN team_member_table as tm ON tm.team_member_id = fo.form_team_member_id
    WHERE fo.form_id = signer_form_id
  ) IN (
    SELECT team_member_team_id
    FROM team_member_table
    WHERE team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON "public"."signer_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  (
    SELECT tm.team_member_team_id
    FROM form_table as fo
    JOIN team_member_table as tm ON tm.team_member_id = fo.form_team_member_id
    WHERE fo.form_id = signer_form_id
  ) IN (
    SELECT team_member_team_id
    FROM team_member_table
    WHERE team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- SUPPLIER_TABLE
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON "public"."supplier_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  supplier_team_id IN (
    SELECT team_member_team_id 
    FROM team_member_table 
    WHERE team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow READ access for anon users" ON "public"."supplier_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON "public"."supplier_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  supplier_team_id IN (
    SELECT team_member_team_id 
    FROM team_member_table 
    WHERE team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON "public"."supplier_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  supplier_team_id IN (
    SELECT team_member_team_id 
    FROM team_member_table 
    WHERE team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- TEAM_MEMBER_TABLE
CREATE POLICY "Allow CREATE for authenticated users" ON "public"."team_member_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow READ for anon users" ON "public"."team_member_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON "public"."team_member_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  team_member_team_id IN (
    SELECT team_member_team_id from team_member_table
    WHERE team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  ) OR team_member_user_id = auth.uid()
);

CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON "public"."team_member_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  team_member_team_id IN (
    SELECT team_member_team_id from team_member_table
    WHERE team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- COMMENT_TABLE
CREATE POLICY "Allow CREATE for authenticated users" ON "public"."comment_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow READ for anon users" ON "public"."comment_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users based on team_member_id" ON "public"."comment_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (comment_team_member_id IN (SELECT team_member_id FROM team_member_table WHERE team_member_user_id = auth.uid()))
WITH CHECK (comment_team_member_id IN (SELECT team_member_id FROM team_member_table WHERE team_member_user_id = auth.uid()));

CREATE POLICY "Allow DELETE for authenticated users based on team_member_id" ON "public"."comment_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (comment_team_member_id IN (SELECT team_member_id FROM team_member_table WHERE team_member_user_id = auth.uid()));

--- INVITATION_TABLE
CREATE POLICY "Allow CREATE for authenticated users" ON "public"."invitation_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow READ for users based on invitation_to_email" ON "public"."invitation_table"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (
  invitation_to_email = (
    SELECT user_email 
    FROM public.user_table 
    WHERE user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1
    FROM public.team_member_table
    WHERE team_member_team_id = (
      SELECT team_member_team_id
      FROM public.team_member_table
      WHERE team_member_id = invitation_from_team_member_id
      AND team_member_is_disabled = FALSE
      LIMIT 1
    )
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow UPDATE for users based on invitation_from_team_member_id" ON "public"."invitation_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.team_member_table
    WHERE team_member_team_id = (
      SELECT team_member_team_id
      FROM public.team_member_table
      WHERE team_member_id = invitation_from_team_member_id
      AND team_member_is_disabled = FALSE
      LIMIT 1
    )
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  ) OR invitation_to_email = (
    SELECT user_email 
    FROM user_table 
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.team_member_table
    WHERE team_member_team_id = (
      SELECT team_member_team_id
      FROM public.team_member_table
      WHERE team_member_id = invitation_from_team_member_id
      AND team_member_is_disabled = FALSE
      LIMIT 1
    )
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  ) OR invitation_to_email = (
    SELECT user_email 
    FROM user_table 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Allow DELETE for users based on invitation_from_team_member_id" ON "public"."invitation_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (invitation_from_team_member_id IN (SELECT team_member_id FROM team_member_table WHERE team_member_user_id = auth.uid()));

--- NOTIFICATION_TABLE
CREATE POLICY "Allow INSERT for authenticated users" ON "public"."notification_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow READ for authenticated users on own notifications" ON "public"."notification_table"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (auth.uid() = notification_user_id);

CREATE POLICY "Allow UPDATE for authenticated users on notification_user_id" ON "public"."notification_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (auth.uid() = notification_user_id)
WITH CHECK (auth.uid() = notification_user_id);

CREATE POLICY "Allow DELETE for authenticated users on notification_user_id" ON "public"."notification_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (auth.uid() = notification_user_id);

--- REQUEST_RESPONSE_TABLE
CREATE POLICY "Allow CREATE access for all users" ON "public"."request_response_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow READ for anon users" ON "public"."request_response_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users on own request response"
ON "public"."request_response_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  (
    SELECT rt.request_team_member_id
    FROM request_table as rt
    WHERE rt.request_id = request_response_request_id
  ) IN (
    SELECT team_member_id
    FROM team_member_table
    WHERE team_member_user_id = auth.uid()
  )
)
WITH CHECK (
  (
    SELECT rt.request_team_member_id
    FROM request_table as rt
    WHERE rt.request_id = request_response_request_id
  ) IN (
    SELECT team_member_id
    FROM team_member_table
    WHERE team_member_user_id = auth.uid()
  )
);

CREATE POLICY "Allow DELETE for authenticated users on own request response" ON "public"."request_response_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  (
    SELECT rt.request_team_member_id
    FROM request_table as rt
    WHERE rt.request_id = request_response_request_id
  ) IN (
    SELECT team_member_id
    FROM team_member_table
    WHERE team_member_user_id = auth.uid()
  )
);

--- REQUEST_TABLE
CREATE POLICY "Allow CREATE access for all users" ON "public"."request_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow READ for anon users" ON "public"."request_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users on own requests" ON "public"."request_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  request_team_member_id IN (
    SELECT team_member_id  
    FROM team_member_table 
    WHERE team_member_user_id = auth.uid()
  ) OR (
    SELECT team_member_team_id 
    FROM team_member_table 
    WHERE team_member_id = request_team_member_id
  ) IN (
    SELECT team_member_team_id 
    FROM team_member_table 
    WHERE team_member_user_id = auth.uid() 
    AND team_member_role IN ('OWNER', 'APPROVER')
  )
)
WITH CHECK (
  request_team_member_id IN (
    SELECT team_member_id  
    FROM team_member_table 
    WHERE team_member_user_id = auth.uid()
  ) OR (
    SELECT team_member_team_id 
    FROM team_member_table 
    WHERE team_member_id = request_team_member_id
  ) IN (
    SELECT team_member_team_id 
    FROM team_member_table 
    WHERE team_member_user_id = auth.uid() 
    AND team_member_role IN ('OWNER', 'APPROVER')
  )
);

CREATE POLICY "Allow DELETE for authenticated users on own requests" ON "public"."request_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  request_team_member_id IN (
    SELECT team_member_id  
    FROM team_member_table 
    WHERE team_member_user_id = auth.uid()
  )
);

--- TEAM_TABLE
CREATE POLICY "Allow CREATE for authenticated users" ON "public"."team_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow READ for authenticated users" ON "public"."team_table"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users on own teams" ON "public"."team_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (auth.uid() = team_user_id)
WITH CHECK (auth.uid() = team_user_id);

CREATE POLICY "Allow DELETE for authenticated users on own teams" ON "public"."team_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (auth.uid() = team_user_id);

-- USER_TABLE
CREATE POLICY "Allow CREATE for authenticated users" ON "public"."user_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow READ for anon users" ON "public"."user_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users based on user_id" ON "public"."user_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow DELETE for authenticated users based on user_id" ON "public"."user_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

--- FORM_TEAM_GROUP_TABLE
CREATE POLICY "Allow CREATE for OWNER or ADMIN roles" ON "public"."form_team_group_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT tt.team_group_team_id 
    FROM team_group_table as tt
    JOIN team_member_table as tm ON tm.team_member_team_id = tt.team_group_team_id
    WHERE tt.team_group_id = team_group_id
    AND tm.team_member_user_id = auth.uid()
    AND team_member_role in ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow READ for authenticated team members" ON "public"."form_team_group_table"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT tt.team_group_team_id 
    FROM team_group_table as tt
    JOIN team_member_table as tm ON tm.team_member_team_id = tt.team_group_team_id
    WHERE tt.team_group_id = team_group_id
    AND tm.team_member_user_id = auth.uid()
  )
);

CREATE POLICY "Allow UPDATE for OWNER or ADMIN roles" ON "public"."form_team_group_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT tt.team_group_team_id 
    FROM team_group_table as tt
    JOIN team_member_table as tm ON tm.team_member_team_id = tt.team_group_team_id
    WHERE tt.team_group_id = team_group_id
    AND tm.team_member_user_id = auth.uid()
    AND team_member_role in ('OWNER', 'ADMIN')
  )
)
WITH CHECK (
  EXISTS (
    SELECT tt.team_group_team_id 
    FROM team_group_table as tt
    JOIN team_member_table as tm ON tm.team_member_team_id = tt.team_group_team_id
    WHERE tt.team_group_id = team_group_id
    AND tm.team_member_user_id = auth.uid()
    AND team_member_role in ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow DELETE for OWNER or ADMIN roles" ON "public"."form_team_group_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT tt.team_group_team_id 
    FROM team_group_table as tt
    JOIN team_member_table as tm ON tm.team_member_team_id = tt.team_group_team_id
    WHERE tt.team_group_id = team_group_id
    AND tm.team_member_user_id = auth.uid()
    AND team_member_role in ('OWNER', 'ADMIN')
  )
);

--- TEAM_GROUP_MEMBER_TABLE
CREATE POLICY "Allow CREATE for OWNER or ADMIN roles" ON "public"."team_group_member_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT tt.team_group_team_id
    FROM team_group_table as tt
    JOIN team_member_table as tm ON tm.team_member_team_id = tt.team_group_team_id
    WHERE tt.team_group_id = team_group_id
    AND team_member_user_id = auth.uid()
    AND team_member_role in ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow READ for authenticated team members" ON "public"."team_group_member_table"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT tt.team_group_team_id
    FROM team_group_table as tt
    JOIN team_member_table as tm ON tm.team_member_team_id = tt.team_group_team_id
    WHERE tt.team_group_id = team_group_id
    AND team_member_user_id = auth.uid()
  )
);

CREATE POLICY "Allow UPDATE for OWNER or ADMIN roles" ON "public"."team_group_member_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT tt.team_group_team_id
    FROM team_group_table as tt
    JOIN team_member_table as tm ON tm.team_member_team_id = tt.team_group_team_id
    WHERE tt.team_group_id = team_group_id
    AND team_member_user_id = auth.uid()
    AND team_member_role in ('OWNER', 'ADMIN')
  )
)
WITH CHECK (
   EXISTS (
    SELECT tt.team_group_team_id
    FROM team_group_table as tt
    JOIN team_member_table as tm ON tm.team_member_team_id = tt.team_group_team_id
    WHERE tt.team_group_id = team_group_id
    AND team_member_user_id = auth.uid()
    AND team_member_role in ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow DELETE for OWNER or ADMIN roles" ON "public"."team_group_member_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT tt.team_group_team_id
    FROM team_group_table as tt
    JOIN team_member_table as tm ON tm.team_member_team_id = tt.team_group_team_id
    WHERE tt.team_group_id = team_group_id
    AND team_member_user_id = auth.uid()
    AND team_member_role in ('OWNER', 'ADMIN')
  )
);

--- TEAM_GROUP_TABLE
CREATE POLICY "Allow CREATE for OWNER or ADMIN roles" ON "public"."team_group_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT tm.team_member_team_id
    FROM team_member_table as tm
    JOIN user_table as ut ON ut.user_id = auth.uid()
    WHERE ut.user_active_team_id = team_group_team_id
    AND tm.team_member_user_id = auth.uid()
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  ) 
);

CREATE POLICY "Allow READ for authenticated team members" ON "public"."team_group_table"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT tm.team_member_team_id
    FROM team_member_table as tm
    JOIN user_table as ut ON ut.user_id = auth.uid()
    WHERE ut.user_active_team_id = team_group_team_id
    AND tm.team_member_user_id = auth.uid()
  ) 
);

CREATE POLICY "Allow UPDATE for OWNER or ADMIN roles" ON "public"."team_group_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT tm.team_member_team_id
    FROM team_member_table as tm
    JOIN user_table as ut ON ut.user_id = auth.uid()
    WHERE ut.user_active_team_id = team_group_team_id
    AND tm.team_member_user_id = auth.uid()
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  ) 
)
WITH CHECK (
  EXISTS (
    SELECT tm.team_member_team_id
    FROM team_member_table as tm
    JOIN user_table as ut ON ut.user_id = auth.uid()
    WHERE ut.user_active_team_id = team_group_team_id
    AND tm.team_member_user_id = auth.uid()
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  ) 
);

CREATE POLICY "Allow DELETE for OWNER or ADMIN roles" ON "public"."team_group_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT tm.team_member_team_id
    FROM team_member_table as tm
    JOIN user_table as ut ON ut.user_id = auth.uid()
    WHERE ut.user_active_team_id = team_group_team_id
    AND tm.team_member_user_id = auth.uid()
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  ) 
);

--- TEAM_PROJECT_MEMBER_TABLE
CREATE POLICY "Allow CREATE for OWNER or ADMIN roles" ON "public"."team_project_member_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT tp.team_project_team_id
    FROM team_project_table as tp
    JOIN team_member_table as tm ON tm.team_member_team_id = tp.team_project_team_id
    WHERE tp.team_project_id = team_project_id
    AND tm.team_member_user_id = auth.uid()
    AND team_member_role in ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow READ for authenticated team members" ON "public"."team_project_member_table"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT tp.team_project_team_id
    FROM team_project_table as tp
    JOIN team_member_table as tm ON tm.team_member_team_id = tp.team_project_team_id
    WHERE tp.team_project_id = team_project_id
    AND tm.team_member_user_id = auth.uid()
  )
);

CREATE POLICY "Allow UPDATE for OWNER or ADMIN roles" ON "public"."team_project_member_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT tp.team_project_team_id
    FROM team_project_table as tp
    JOIN team_member_table as tm ON tm.team_member_team_id = tp.team_project_team_id
    WHERE tp.team_project_id = team_project_id
    AND tm.team_member_user_id = auth.uid()
    AND team_member_role in ('OWNER', 'ADMIN')
  )
)
WITH CHECK (
  EXISTS (
    SELECT tp.team_project_team_id
    FROM team_project_table as tp
    JOIN team_member_table as tm ON tm.team_member_team_id = tp.team_project_team_id
    WHERE tp.team_project_id = team_project_id
    AND tm.team_member_user_id = auth.uid()
    AND team_member_role in ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow DELETE for OWNER or ADMIN roles" ON "public"."team_project_member_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT tp.team_project_team_id
    FROM team_project_table as tp
    JOIN team_member_table as tm ON tm.team_member_team_id = tp.team_project_team_id
    WHERE tp.team_project_id = team_project_id
    AND tm.team_member_user_id = auth.uid()
    AND team_member_role in ('OWNER', 'ADMIN')
  )
);

--- TEAM_PROJECT_TABLE
CREATE POLICY "Allow CREATE for OWNER or ADMIN roles" ON "public"."team_project_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT tm.team_member_team_id
    FROM team_member_table as tm
    JOIN user_table as ut ON ut.user_id = auth.uid()
    WHERE ut.user_active_team_id = team_project_team_id
    AND tm.team_member_user_id = auth.uid()
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  ) 
);

CREATE POLICY "Allow READ for anon" ON "public"."team_project_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for OWNER or ADMIN roles" ON "public"."team_project_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT tm.team_member_team_id
    FROM team_member_table as tm
    JOIN user_table as ut ON ut.user_id = auth.uid()
    WHERE ut.user_active_team_id = team_project_team_id
    AND tm.team_member_user_id = auth.uid()
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  ) 
)
WITH CHECK (
  EXISTS (
    SELECT tm.team_member_team_id
    FROM team_member_table as tm
    JOIN user_table as ut ON ut.user_id = auth.uid()
    WHERE ut.user_active_team_id = team_project_team_id
    AND tm.team_member_user_id = auth.uid()
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  ) 
);

CREATE POLICY "Allow DELETE for OWNER or ADMIN roles" ON "public"."team_project_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT tm.team_member_team_id
    FROM team_member_table as tm
    JOIN user_table as ut ON ut.user_id = auth.uid()
    WHERE ut.user_active_team_id = team_project_team_id
    AND tm.team_member_user_id = auth.uid()
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- TICKET_TABLE

CREATE POLICY "Allow CREATE access for all users" ON "public"."ticket_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow READ for anon users" ON "public"."ticket_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users" ON "public"."ticket_table"
AS PERMISSIVE FOR UPDATE
TO authenticated 
USING(true)
WITH CHECK (true);

CREATE POLICY "Allow DELETE for authenticated users on own ticket" ON "public"."ticket_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  ticket_requester_team_member_id IN (
    SELECT team_member_id  
    FROM team_member_table 
    WHERE team_member_user_id = auth.uid()
  )
);

--- TICKET_COMMENT_TABLE

CREATE POLICY "Allow CREATE access for all users" ON "public"."ticket_comment_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow READ for anon users" ON "public"."ticket_comment_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users" ON "public"."ticket_comment_table"
AS PERMISSIVE FOR UPDATE
TO authenticated 
USING(true)
WITH CHECK (true);

CREATE POLICY "Allow DELETE for authenticated users on own ticket" ON "public"."ticket_comment_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  ticket_comment_team_member_id IN (
    SELECT team_member_id  
    FROM team_member_table 
    WHERE team_member_user_id = auth.uid()
  )
);

--- CSI_CODE_TABLE
CREATE POLICY "Allow READ access for anon users" ON "public"."csi_code_table"
AS PERMISSIVE FOR SELECT
USING (true);

--- SERVICE_SCOPE_CHOICE_TABLE
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON "public"."service_scope_choice_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM service_scope_table
    JOIN service_table ON service_id = service_scope_service_id
    JOIN team_table ON team_id = service_team_id
    JOIN team_member_table ON team_member_team_id = team_id
    WHERE service_scope_id = service_scope_choice_service_scope_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow READ access for anon users" ON "public"."service_scope_choice_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON "public"."service_scope_choice_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM service_scope_table
    JOIN service_table ON service_id = service_scope_service_id
    JOIN team_table ON team_id = service_team_id
    JOIN team_member_table ON team_member_team_id = team_id
    WHERE service_scope_id = service_scope_choice_service_scope_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON "public"."service_scope_choice_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM service_scope_table
    JOIN service_table ON service_id = service_scope_service_id
    JOIN team_table ON team_id = service_team_id
    JOIN team_member_table ON team_member_team_id = team_id
    WHERE service_scope_id = service_scope_choice_service_scope_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- SERVICE_SCOPE_TABLE
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON "public"."service_scope_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM service_table 
    JOIN team_table ON team_id = service_team_id
    JOIN team_member_table ON team_member_team_id = team_id
    WHERE service_id = service_scope_service_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow READ access for anon users" ON "public"."service_scope_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON "public"."service_scope_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM service_table
    JOIN team_table ON team_id = service_team_id
    JOIN team_member_table ON team_member_team_id = team_id
    WHERE service_id = service_scope_service_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON "public"."service_scope_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM service_table
    JOIN team_table ON team_id = service_team_id
    JOIN team_member_table ON team_member_team_id = team_id
    WHERE service_id = service_scope_service_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- SERVICE_TABLE
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON "public"."service_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM team_member_table
    WHERE team_member_team_id = service_team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow READ access for anon users" ON "public"."service_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON "public"."service_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_member_table
    WHERE team_member_team_id = service_team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON "public"."service_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_member_table
    WHERE team_member_team_id = service_team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- SPECIAL_APPROVER_TABLE
CREATE POLICY "Allow READ access for anon users" ON "public"."special_approver_table"
AS PERMISSIVE FOR SELECT
USING (true);

--- ITEM_DIVISION_TABLE
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON "public"."item_division_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM item_table as it
    JOIN team_table as tt ON tt.team_id = it.item_team_id
    JOIN team_member_table as tm ON tm.team_member_team_id = tt.team_id
    WHERE it.item_id = item_division_item_id
    AND tm.team_member_user_id = auth.uid()
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow READ access for anon users" ON "public"."item_division_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON "public"."item_division_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM item_table as it
    JOIN team_table as tt ON tt.team_id = it.item_team_id
    JOIN team_member_table as tm ON tm.team_member_team_id = tt.team_id
    WHERE it.item_id = item_division_item_id
    AND tm.team_member_user_id = auth.uid()
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON "public"."item_division_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM item_table as it
    JOIN team_table as tt ON tt.team_id = it.item_team_id
    JOIN team_member_table as tm ON tm.team_member_team_id = tt.team_id
    WHERE it.item_id = item_division_item_id
    AND tm.team_member_user_id = auth.uid()
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- item_description_field_uom_table
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON "public"."item_description_field_uom_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM item_description_field_table AS idf
    JOIN item_description_table ON item_description_id = item_description_field_item_description_id
    JOIN item_table ON item_id = item_description_item_id
    JOIN team_table ON team_id = item_team_id
    JOIN team_member_table ON team_member_team_id = team_id
    WHERE idf.item_description_field_id = item_description_field_uom_item_description_field_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow READ access for anon users" ON "public"."item_description_field_uom_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON "public"."item_description_field_uom_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM item_description_field_table AS idf
    JOIN item_description_table ON item_description_id = item_description_field_item_description_id
    JOIN item_table ON item_id = item_description_item_id
    JOIN team_table ON team_id = item_team_id
    JOIN team_member_table ON team_member_team_id = team_id
    WHERE idf.item_description_field_id = item_description_field_uom_item_description_field_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON "public"."item_description_field_uom_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM item_description_field_table AS idf
    JOIN item_description_table ON item_description_id = item_description_field_item_description_id
    JOIN item_table ON item_id = item_description_item_id
    JOIN team_table ON team_id = item_team_id
    JOIN team_member_table ON team_member_team_id = team_id
    WHERE idf.item_description_field_id = item_description_field_uom_item_description_field_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- SPECIAL_APPROVER_ITEM_TABLE
CREATE POLICY "Allow READ access for anon users" ON "public"."special_approver_item_table"
AS PERMISSIVE FOR SELECT
USING (true);

-- USER_EMPLOYEE_NUMBER_TABLE
CREATE POLICY "Allow CREATE for authenticated users" ON "public"."user_employee_number_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow READ for anon users" ON "public"."user_employee_number_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users based on user_id" ON "public"."user_employee_number_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT user_id
    FROM user_table
    WHERE user_id = user_employee_number_user_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT user_id
    FROM user_table
    WHERE user_id = user_employee_number_user_id
  )
);

CREATE POLICY "Allow DELETE for authenticated users based on user_id" ON "public"."user_employee_number_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT user_id
    FROM user_table
    WHERE user_id = user_employee_number_user_id
  )
);

--- USER_ONBOARD_TABLE
CREATE POLICY "Allow CREATE access for all users" ON "public"."user_onboard_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow READ for anon users" ON "public"."user_onboard_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users" ON "public"."user_onboard_table"
AS PERMISSIVE FOR UPDATE
TO authenticated 
USING(true)
WITH CHECK (true);

CREATE POLICY "Allow DELETE for authenticated users on own onboard" ON "public"."user_onboard_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  user_onboard_user_id IN (
    SELECT user_onboard_user_id  
    FROM user_onboard_table 
    WHERE user_onboard_user_id = auth.uid()
  )
);

--- USER_NAME_HISTORY_TABLE
CREATE POLICY "Allow CREATE for authenticated users" ON "public"."user_name_history_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

--- SIGNATURE_HISTORY_TABLE
CREATE POLICY "Allow CREATE for authenticated users" ON "public"."signature_history_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

--- general_unit_of_measurement_table
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON "public"."general_unit_of_measurement_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM team_table
    JOIN team_member_table ON team_member_team_id = team_id
    WHERE general_unit_of_measurement_team_id = team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow READ access for anon users" ON "public"."general_unit_of_measurement_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON "public"."general_unit_of_measurement_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM team_table
    JOIN team_member_table ON team_member_team_id = team_id
    WHERE general_unit_of_measurement_team_id = team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON "public"."general_unit_of_measurement_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM team_table
    JOIN team_member_table ON team_member_team_id = team_id
    WHERE general_unit_of_measurement_team_id = team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- service_category_table
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON "public"."service_category_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM team_table
    JOIN team_member_table ON team_member_team_id = team_id
    WHERE service_category_team_id = team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow READ access for anon users" ON "public"."service_category_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON "public"."service_category_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM team_table
    JOIN team_member_table ON team_member_team_id = team_id
    WHERE service_category_team_id = team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON "public"."service_category_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM team_table
    JOIN team_member_table ON team_member_team_id = team_id
    WHERE service_category_team_id = team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

-- memo_table
CREATE POLICY "Allow CREATE access for auth users" ON "public"."memo_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow READ for anon users" ON "public"."memo_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for auth users" ON "public"."memo_table"
AS PERMISSIVE FOR UPDATE
TO authenticated 
USING(true)
WITH CHECK (true);

CREATE POLICY "Allow DELETE for auth users on own memo" ON "public"."memo_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  memo_author_user_id = auth.uid()
);

-- memo_signer_table
CREATE POLICY "Allow CRUD for auth users" ON "public"."memo_signer_table"
AS PERMISSIVE FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- memo_line_item_table
CREATE POLICY "Allow CRUD for auth users" ON "public"."memo_line_item_table"
AS PERMISSIVE FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- memo_line_item_attachment_table
CREATE POLICY "Allow CRUD for auth users" ON "public"."memo_line_item_attachment_table"
AS PERMISSIVE FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- memo_date_updated_table
CREATE POLICY "Allow CREATE access for auth users" ON "public"."memo_date_updated_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow READ for anon users" ON "public"."memo_date_updated_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for auth users" ON "public"."memo_date_updated_table"
AS PERMISSIVE FOR UPDATE
TO authenticated 
USING(true)
WITH CHECK (true);

CREATE POLICY "Allow DELETE for auth users on own memo" ON "public"."memo_date_updated_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM memo_table
    WHERE memo_id = memo_date_updated_memo_id
    AND memo_author_user_id = auth.uid()
  )
);

-- memo_status_table
CREATE POLICY "Allow CREATE access for auth users" ON "public"."memo_status_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow READ for anon users" ON "public"."memo_status_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for auth users" ON "public"."memo_status_table"
AS PERMISSIVE FOR UPDATE
TO authenticated 
USING(true)
WITH CHECK (true);

CREATE POLICY "Allow DELETE for auth users on own memo" ON "public"."memo_status_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM memo_table
    WHERE memo_id = memo_status_memo_id
    AND memo_author_user_id = auth.uid()
  )
);

-- memo_read_receipt_table
CREATE POLICY "Allow CREATE access for auth users" ON "public"."memo_read_receipt_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow READ for anon users" ON "public"."memo_read_receipt_table"
AS PERMISSIVE FOR SELECT
USING (true);

-- memo_agreement_table
CREATE POLICY "Allow CREATE access for auth users" ON "public"."memo_agreement_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow READ for anon users" ON "public"."memo_agreement_table"
AS PERMISSIVE FOR SELECT
USING (true);

-- memo_format_table
CREATE POLICY "Allow CRUD for auth users" ON "public"."memo_format_table"
AS PERMISSIVE FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-------- End: POLICIES

---------- Start: INDEXES

CREATE INDEX request_response_request_id_idx ON request_response_table (request_response, request_response_request_id);
CREATE INDEX request_list_idx ON request_table (request_id, request_date_created, request_form_id, request_team_member_id, request_status);

-------- End: INDEXES

---------- Start: VIEWS

CREATE VIEW distinct_division_view AS SELECT DISTINCT csi_code_division_id, csi_code_division_description from csi_code_table;
CREATE VIEW request_view AS SELECT *, CONCAT(request_formsly_id_prefix, '-', request_formsly_id_serial) AS request_formsly_id FROM request_table;

-------- End: VIEWS

-------- Start: SUBSCRIPTION

DROP PUBLICATION if exists supabase_realtime;

CREATE PUBLICATION supabase_realtime;
COMMIT;

ALTER PUBLICATION supabase_realtime ADD TABLE request_table, request_signer_table, comment_table, notification_table, team_member_table, invitation_table, team_project_table, team_group_table, ticket_comment_table ;

-------- END: SUBSCRIPTION


GRANT ALL ON ALL TABLES IN SCHEMA public TO PUBLIC;
GRANT ALL ON ALL TABLES IN SCHEMA public TO POSTGRES;

GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;