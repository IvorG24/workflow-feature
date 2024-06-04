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
INSERT INTO storage.buckets (id, name) VALUES ('USER_VALID_IDS', 'USER_VALID_IDS');
INSERT INTO storage.buckets (id, name) VALUES ('TICKET_ATTACHMENTS', 'TICKET_ATTACHMENTS');

UPDATE storage.buckets SET public = true;

---------- Start: TABLES

-- Start: formsly_price_table
CREATE TABLE formsly_price_table (
  formsly_price_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  formsly_price_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  formsly_price INT NOT NULL
);
-- End: address_table

-- Start: address_table
CREATE TABLE address_table (
  address_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  address_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  address_region VARCHAR(4000) NOT NULL,
  address_province VARCHAR(4000) NOT NULL,
  address_city VARCHAR(4000) NOT NULL,
  address_barangay VARCHAR(4000) NOT NULL,
  address_street VARCHAR(4000) NOT NULL,
  address_zip_code VARCHAR(4000) NOT NULL
);
-- End: address_table

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
  team_expiration DATE,
  team_name VARCHAR(4000) NOT NULL,
  team_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
  team_is_request_signature_required BOOLEAN DEFAULT FALSE NOT NULL,
  team_logo VARCHAR(4000),
  
  team_user_id UUID REFERENCES user_table(user_id) NOT NULL
);
CREATE TABLE team_transaction_table (
  team_transaction_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  team_transaction_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  team_transaction_price INT NOT NULL,
  team_transaction_number_of_months INT NOT NULL,
  team_transaction_team_expiration_date DATE NOT NULL,
  
  team_transaction_team_id UUID REFERENCES team_table(team_id) NOT NULL
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
  team_project_team_id UUID REFERENCES team_table(team_id) NOT NULL,
  team_project_address_id UUID REFERENCES address_table(address_id)
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
CREATE TABLE special_field_template_table (
  special_field_template_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  special_field_template_name VARCHAR(4000) NOT NULL,
  special_field_template_description VARCHAR(4000),
  special_field_template_type VARCHAR(4000) NOT NULL
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

  field_section_id UUID REFERENCES section_table(section_id) NOT NULL,
  field_special_field_template_id UUID REFERENCES special_field_template_table(special_field_template_id)
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
  request_response_prefix VARCHAR(4000),

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

-- Start: Item unit of measurement
CREATE TABLE item_unit_of_measurement_table(
  item_unit_of_measurement_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  item_unit_of_measurement_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  item_unit_of_measurement VARCHAR(4000) NOT NULL,
  item_unit_of_measurement_is_disabled BOOLEAN DEFAULT false NOT NULL,
  item_unit_of_measurement_is_available BOOLEAN DEFAULT true NOT NULL,
  
  item_unit_of_measurement_encoder_team_member_id UUID REFERENCES team_member_table(team_member_id),
  item_unit_of_measurement_team_id UUID REFERENCES team_table(team_id) NOT NULL
);
-- End: Item unit of measurement

-- Start: Item Form
CREATE TABLE item_category_table(
  item_category_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  item_category_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  item_category VARCHAR(4000) NOT NULL,
  item_category_is_available BOOLEAN DEFAULT TRUE NOT NULL,
  item_category_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,

  item_category_signer_id UUID REFERENCES signer_table(signer_id) NOT NULL
);

CREATE TABLE item_table(
  item_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  item_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  item_general_name VARCHAR(4000) NOT NULL,
  item_unit VARCHAR(4000) NOT NULL,
  item_is_available BOOLEAN DEFAULT TRUE NOT NULL,
  item_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
  item_gl_account VARCHAR(4000) NOT NULL,
  item_is_ped_item BOOLEAN DEFAULT FALSE NOT NULL,
  item_is_it_asset_item BOOLEAN DEFAULT FALSE NOT NULL,

  item_team_id UUID REFERENCES team_table(team_id) NOT NULL,
  item_encoder_team_member_id UUID REFERENCES team_member_table(team_member_id),
  item_category_id UUID REFERENCES item_category_table(item_category_id)
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

-- End: Item Form

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

-- Start: Ticket Category

CREATE TABLE ticket_category_table(
  ticket_category_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  ticket_category VARCHAR(4000) NOT NULL, 
  ticket_category_is_disabled BOOLEAN DEFAULT false NOT NULL,
  ticket_category_is_active BOOLEAN DEFAULT true NOT NULL
);

-- END: Ticket Category

-- Start: Ticket Section

CREATE TABLE ticket_section_table(
  ticket_section_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  ticket_section_name VARCHAR(4000) NOT NULL,
  ticket_section_is_duplicatable BOOLEAN DEFAULT false NOT NULL,
  
  ticket_section_category_id UUID REFERENCES ticket_category_table(ticket_category_id) NOT NULL
);

-- END: Ticket Section

-- Start: Ticket Field

CREATE TABLE ticket_field_table(
  ticket_field_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  ticket_field_name VARCHAR(4000) NOT NULL,
  ticket_field_type VARCHAR(4000) NOT NULL,
  ticket_field_is_required BOOLEAN DEFAULT true NOT NULL,
  ticket_field_is_read_only BOOLEAN DEFAULT false NOT NULL,
  ticket_field_order INT NOT NULL,
  
  ticket_field_section_id UUID REFERENCES ticket_section_table(ticket_section_id) NOT NULL
);

-- END: Ticket Field

-- Start: Ticket Option

CREATE TABLE ticket_option_table(
  ticket_option_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  ticket_option_value VARCHAR(4000) NOT NULL,
  ticket_option_order INT NOT NULL,
  
  ticket_option_field_id UUID REFERENCES ticket_field_table(ticket_field_id) NOT NULL
);

-- END: Ticket Option

-- Start: Ticket

CREATE TABLE ticket_table(
  ticket_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  ticket_status VARCHAR(4000) DEFAULT 'PENDING' NOT NULL,
  ticket_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  ticket_status_date_updated TIMESTAMPTZ,
  ticket_is_disabled BOOLEAN DEFAULT false NOT NULL,
  
  ticket_category_id UUID REFERENCES ticket_category_table(ticket_category_id) NOT NULL,
  ticket_requester_team_member_id UUID REFERENCES team_member_table(team_member_id) NOT NULL,
  ticket_approver_team_member_id UUID REFERENCES team_member_table(team_member_id)
);

-- End: Ticket

-- Start: Ticket Response

CREATE TABLE ticket_response_table(
  ticket_response_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  ticket_response_value VARCHAR(4000) NOT NULL,
  ticket_response_duplicatable_section_id UUID,
  
  ticket_response_ticket_id UUID REFERENCES ticket_table(ticket_id) NOT NULL,
  ticket_response_field_id UUID REFERENCES ticket_field_table(ticket_field_id) NOT NULL
);

-- END: Ticket Response

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

-- End: Ticket comment

-- Start: Item Description Field UOM
CREATE TABLE item_description_field_uom_table(
  item_description_field_uom_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  item_description_field_uom VARCHAR(4000) NOT NULL,

  item_description_field_uom_item_description_field_id UUID REFERENCES item_description_field_table(item_description_field_id) ON DELETE CASCADE NOT NULL
);
-- End: Item Description Field UOM

-- Start: Equipment category

CREATE TABLE equipment_category_table(
  equipment_category_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  equipment_category_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  equipment_category VARCHAR(4000) NOT NULL,
  equipment_category_is_disabled BOOLEAN DEFAULT false NOT NULL,
  equipment_category_is_available BOOLEAN DEFAULT true NOT NULL,
  
  equipment_category_encoder_team_member_id UUID REFERENCES team_member_table(team_member_id),
  equipment_category_team_id UUID REFERENCES team_table(team_id) NOT NULL
);

-- End: Equipment category

-- Start: Equipment brand

CREATE TABLE equipment_brand_table(
  equipment_brand_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  equipment_brand_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  equipment_brand VARCHAR(4000) NOT NULL,
  equipment_brand_is_disabled BOOLEAN DEFAULT false NOT NULL,
  equipment_brand_is_available BOOLEAN DEFAULT true NOT NULL,
  
  equipment_brand_encoder_team_member_id UUID REFERENCES team_member_table(team_member_id),
  equipment_brand_team_id UUID REFERENCES team_table(team_id) NOT NULL
);

-- End: Equipment brand

-- Start: Equipment model

CREATE TABLE equipment_model_table(
  equipment_model_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  equipment_model_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  equipment_model VARCHAR(4000) NOT NULL,
  equipment_model_is_disabled BOOLEAN DEFAULT false NOT NULL,
  equipment_model_is_available BOOLEAN DEFAULT true NOT NULL,
  
  equipment_model_encoder_team_member_id UUID REFERENCES team_member_table(team_member_id),
  equipment_model_team_id UUID REFERENCES team_table(team_id) NOT NULL
);

-- End: Equipment model

-- Start: Equipment component category model

CREATE TABLE equipment_component_category_table(
  equipment_component_category_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  equipment_component_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  equipment_component_category VARCHAR(4000) NOT NULL,
  equipment_component_category_is_disabled BOOLEAN DEFAULT false NOT NULL,
  equipment_component_category_is_available BOOLEAN DEFAULT true NOT NULL,
  
  equipment_component_category_encoder_team_member_id UUID REFERENCES team_member_table(team_member_id),
  equipment_component_category_team_id UUID REFERENCES team_table(team_id) NOT NULL
);

-- End: Equipment component category model

-- Start: Equipment

CREATE TABLE equipment_table(
  equipment_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  equipment_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  equipment_name VARCHAR(4000) NOT NULL,
  equipment_name_shorthand VARCHAR(4000) NOT NULL,
  equipment_is_disabled BOOLEAN DEFAULT false NOT NULL,
  equipment_is_available BOOLEAN DEFAULT true NOT NULL,
  
  equipment_equipment_category_id UUID REFERENCES equipment_category_table(equipment_category_id) ON DELETE CASCADE NOT NULL,
  equipment_encoder_team_member_id UUID REFERENCES team_member_table(team_member_id),
  equipment_team_id UUID REFERENCES team_table(team_id) NOT NULL
);

-- End: Equipment 

-- Start: Equipment description

CREATE TABLE equipment_description_table(
  equipment_description_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  equipment_description_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  equipment_description_property_number VARCHAR(4000) NOT NULL,
  equipment_description_serial_number VARCHAR(4000) NOT NULL,
  equipment_description_is_disabled BOOLEAN DEFAULT false NOT NULL,
  equipment_description_is_available BOOLEAN DEFAULT true NOT NULL,
  
  equipment_description_brand_id UUID REFERENCES equipment_brand_table(equipment_brand_id) ON DELETE CASCADE NOT NULL,
  equipment_description_model_id UUID REFERENCES equipment_model_table(equipment_model_id) ON DELETE CASCADE NOT NULL,
  equipment_description_equipment_id UUID REFERENCES equipment_table(equipment_id) ON DELETE CASCADE NOT NULL,
  equipment_description_encoder_team_member_id UUID REFERENCES team_member_table(team_member_id)
);

-- End: Equipment description

-- Start: Equipment unit of measurement

CREATE TABLE equipment_unit_of_measurement_table(
  equipment_unit_of_measurement_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  equipment_unit_of_measurement_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  equipment_unit_of_measurement VARCHAR(4000) NOT NULL,
  equipment_unit_of_measurement_is_disabled BOOLEAN DEFAULT false NOT NULL,
  equipment_unit_of_measurement_is_available BOOLEAN DEFAULT true NOT NULL,
  
  equipment_unit_of_measurement_encoder_team_member_id UUID REFERENCES team_member_table(team_member_id),
  equipment_unit_of_measurement_team_id UUID REFERENCES team_table(team_id) NOT NULL
);

-- End: Equipment unit of measurement

-- Start: Equipment part general name

CREATE TABLE equipment_general_name_table(
  equipment_general_name_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  equipment_general_name_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  equipment_general_name VARCHAR(4000) NOT NULL,
  equipment_general_name_is_available BOOLEAN DEFAULT TRUE NOT NULL,
  equipment_general_name_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,

  equipment_general_name_team_id UUID REFERENCES team_table(team_id) NOT NULL,
  equipment_general_name_encoder_team_member_id UUID REFERENCES team_member_table(team_member_id)
);

-- End: Equipment part general name

-- Start: Equipment part

CREATE TABLE equipment_part_table(
  equipment_part_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  equipment_part_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  equipment_part_number VARCHAR(4000) NOT NULL,
  equipment_part_is_available BOOLEAN DEFAULT TRUE NOT NULL,
  equipment_part_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,

  equipment_part_general_name_id UUID REFERENCES equipment_general_name_table(equipment_general_name_id) ON DELETE CASCADE NOT NULL,
  equipment_part_brand_id UUID REFERENCES equipment_brand_table(equipment_brand_id) ON DELETE CASCADE NOT NULL,
  equipment_part_model_id UUID REFERENCES equipment_model_table(equipment_model_id) ON DELETE CASCADE NOT NULL,
  equipment_part_unit_of_measurement_id UUID REFERENCES equipment_unit_of_measurement_table(equipment_unit_of_measurement_id) ON DELETE CASCADE NOT NULL,
  equipment_part_component_category_id UUID REFERENCES equipment_component_category_table(equipment_component_category_id) ON DELETE CASCADE NOT NULL,
  equipment_part_equipment_id UUID REFERENCES equipment_table(equipment_id) ON DELETE CASCADE NOT NULL,
  equipment_part_encoder_team_member_id UUID REFERENCES team_member_table(team_member_id)
);

-- End: Equipment part

-- Start: User employee number table

CREATE TABLE user_employee_number_table (
    user_employee_number_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
    user_employee_number_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    user_employee_number_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
    user_employee_number VARCHAR(4000) NOT NULL,

    user_employee_number_user_id UUID REFERENCES user_table(user_id)
);

-- END: User employee number table

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
    memo_signer_memo_id UUID REFERENCES memo_table(memo_id) NOT NULL,
    memo_signer_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    memo_signer_date_signed TIMESTAMPTZ(0)
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

CREATE TABLE memo_format_section_table(
    memo_format_section_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
    memo_format_section_margin_top VARCHAR(20),
    memo_format_section_margin_right VARCHAR(20),
    memo_format_section_margin_bottom VARCHAR(20),
    memo_format_section_margin_left VARCHAR(20),
    memo_format_section_name VARCHAR(100)
);

CREATE TABLE memo_format_subsection_table(
    memo_format_subsection_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
    memo_format_subsection_name VARCHAR(100),
    memo_format_subsection_text VARCHAR(4000),
    memo_format_subsection_text_font_size VARCHAR(20),
    memo_format_subsection_section_id UUID REFERENCES memo_format_section_table(memo_format_section_id)
);

CREATE TABLE memo_format_attachment_table(
    memo_format_attachment_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
    memo_format_attachment_name VARCHAR(4000) NOT NULL,
    memo_format_attachment_url VARCHAR(4000) NOT NULL,
    memo_format_attachment_order VARCHAR(20) NOT NULL,
    memo_format_attachment_subsection_id UUID REFERENCES memo_format_subsection_table(memo_format_subsection_id)
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

-- Start: Valid ID
CREATE TABLE user_valid_id_table (
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

  user_valid_id_approver_user_id UUID REFERENCES user_table(user_id),
  user_valid_id_user_id UUID REFERENCES user_table(user_id) NOT NULL,
  user_valid_id_address_id UUID REFERENCES address_table(address_id) NOT NULL
);
-- End: Valid ID

-- Start: Item Level Three Description
CREATE TABLE item_level_three_description_table (
  item_level_three_description_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  item_level_three_description_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  item_level_three_description VARCHAR(4000) NOT NULL,

  item_level_three_description_item_id UUID REFERENCES item_table(item_id)
);
-- End: Item Level Three Description

-- Start: Query table

CREATE TABLE query_table (
    query_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
    query_name VARCHAR(4000) UNIQUE NOT NULL,
    query_sql VARCHAR(4000) NOT NULL
);

-- End: Query table

-- Start: Form SLA
CREATE TABLE form_sla_table (
    form_sla_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
    form_sla_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    form_sla_date_updated TIMESTAMPTZ,
    form_sla_hours INT NOT NULL,

    form_sla_form_id UUID REFERENCES form_table(form_id) NOT NULL,
    form_sla_team_id UUID REFERENCES team_table(team_id) NOT NULL
);
-- End: Form SLA

-- Start: Capacity unit of measurement table

CREATE TABLE capacity_unit_of_measurement_table(
  capacity_unit_of_measurement_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  capacity_unit_of_measurement_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  capacity_unit_of_measurement VARCHAR(4000) NOT NULL,
  capacity_unit_of_measurement_is_disabled BOOLEAN DEFAULT false NOT NULL,
  capacity_unit_of_measurement_is_available BOOLEAN DEFAULT true NOT NULL,
  
  capacity_unit_of_measurement_encoder_team_member_id UUID REFERENCES team_member_table(team_member_id),
  capacity_unit_of_measurement_team_id UUID REFERENCES team_table(team_id) NOT NULL
);

-- End: Capacity unit of measurement table

-- Start: Jira automation tables
CREATE TABLE jira_project_table (
  jira_project_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  jira_project_jira_id VARCHAR(4000) NOT NULL,
  jira_project_jira_label VARCHAR(4000) NOT NULL
);

CREATE TABLE jira_formsly_project_table (
  jira_formsly_project_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  jira_project_id UUID REFERENCES jira_project_table(jira_project_id) NOT NULL,
  formsly_project_id UUID REFERENCES team_project_table(team_project_id) UNIQUE NOT NULL
);

CREATE TABLE jira_user_role_table (
  jira_user_role_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  jira_user_role_label VARCHAR(4000) NOT NULL,
  jira_user_role_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  jira_user_role_date_updated TIMESTAMPTZ
);

CREATE TABLE jira_user_account_table (
  jira_user_account_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  jira_user_account_jira_id VARCHAR(4000) NOT NULL,
  jira_user_account_email_address VARCHAR(4000) NOT NULL,
  jira_user_account_display_name VARCHAR(4000) NOT NULL,
  jira_user_account_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  jira_user_account_date_updated TIMESTAMPTZ
);

CREATE TABLE jira_project_user_table (
  jira_project_user_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  jira_project_user_account_id UUID REFERENCES jira_user_account_table(jira_user_account_id) NOT NULL,
  jira_project_user_team_project_id UUID REFERENCES team_project_table(team_project_id) NOT NULL,
  jira_project_user_role_id UUID REFERENCES jira_user_role_table(jira_user_role_id) NOT NULL
);

CREATE TABLE jira_item_category_table (
  jira_item_category_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  jira_item_category_jira_id VARCHAR(4000) NOT NULL,
  jira_item_category_jira_label VARCHAR(4000) NOT NULL,
  jira_item_category_formsly_label VARCHAR(4000) NOT NULL
);

CREATE TABLE jira_item_user_table (
  jira_item_user_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  jira_item_user_account_id UUID REFERENCES jira_user_account_table(jira_user_account_id) NOT NULL,
  jira_item_user_item_category_id UUID REFERENCES jira_item_category_table(jira_item_category_id) NOT NULL,
  jira_item_user_role_id UUID REFERENCES jira_user_role_table(jira_user_role_id) NOT NULL
);

CREATE TABLE jira_organization_table (
    jira_organization_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
    jira_organization_jira_id VARCHAR(4000) NOT NULL,
    jira_organization_jira_label VARCHAR(4000) NOT NULL
);

CREATE TABLE jira_organization_team_project_table (
    jira_organization_team_project_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
    jira_organization_team_project_project_id UUID REFERENCES team_project_table(team_project_id) NOT NULL,
    jira_organization_team_project_organization_id UUID REFERENCES jira_organization_table(jira_organization_id) NOT NULL
);
-- End: Jira automation tables

-- Start: Team department table
CREATE TABLE team_department_table (
  team_department_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  team_department_name VARCHAR(4000) NOT NULL,
  team_department_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
  team_department_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
-- End: Team department table

-- employee_job_title_table
CREATE TABLE employee_job_title_table (
    employee_job_title_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
    employee_job_title_label VARCHAR(4000) NOT NULL,
    employee_job_title_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    employee_job_title_date_updated TIMESTAMPTZ,
    employee_job_title_is_disabled BOOLEAN DEFAULT FALSE NOT NULL
);

-- scic_employee_table
CREATE TABLE scic_employee_table (
    scic_employee_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
    scic_employee_hris_id_number VARCHAR(4000) NOT NULL,
    scic_employee_first_name VARCHAR(4000) NOT NULL,
    scic_employee_middle_name VARCHAR(4000),
    scic_employee_last_name VARCHAR(4000) NOT NULL,
    scic_employee_suffix VARCHAR(10),
    scic_employee_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    scic_employee_date_updated TIMESTAMPTZ
);

CREATE TABLE currency_table (
  currency_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  currency_entity VARCHAR(4000) NOT NULL,
  currency_label VARCHAR(4000) NOT NULL,
  currnecy_alphabetic_code VARCHAR(10) NOT NULL,
  currency_numeric_code VARCHAR(10) NOT NULL
);

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
    itemFilter,
    itemFilterCount,
    supplierList
  } = input_data;

  const rowStart = (pageNumber - 1) * rowLimit;

  // Fetch owner of team
  const team_owner = plv8.execute(`SELECT * FROM team_member_table WHERE team_member_team_id='${activeTeam}' AND team_member_role='OWNER'`)[0];

  // Fetch team formsly forms
  const item_form = plv8.execute(`SELECT * FROM form_table WHERE form_name='Item' AND form_is_formsly_form=true AND form_team_member_id='${team_owner.team_member_id}'`)[0];
  const sourced_item_form = plv8.execute(`SELECT * FROM form_table WHERE form_name='Sourced Item' AND form_is_formsly_form=true AND form_team_member_id='${team_owner.team_member_id}'`)[0];
  const quotation_form = plv8.execute(`SELECT * FROM form_table WHERE form_name='Quotation' AND form_is_formsly_form=true AND form_team_member_id='${team_owner.team_member_id}'`)[0];
  const rir_form = plv8.execute(`SELECT * FROM form_table WHERE form_name='Receiving Inspecting Report' AND form_is_formsly_form=true AND form_team_member_id='${team_owner.team_member_id}'`)[0];
  const ro_form = plv8.execute(`SELECT * FROM form_table WHERE form_name='Release Order' AND form_is_formsly_form=true AND form_team_member_id='${team_owner.team_member_id}'`)[0];
  const transfer_receipt_form = plv8.execute(`SELECT * FROM form_table WHERE form_name='Transfer Receipt' AND form_is_formsly_form=true AND form_team_member_id='${team_owner.team_member_id}'`)[0];

  let item_requests;
  let searchCondition = '';
  let condition = '';
  let supplierCondition = '';
  
  if(search.length !== 0){
    searchCondition = `request_view.request_formsly_id ILIKE '%' || '${search}' || '%'`;
  }

  if(itemFilterCount || supplierList.length !== 0){
    if(itemFilterCount){
      condition = itemFilter.map(value => `request_response_table.request_response = '"${value}"'`).join(' OR ');
    }

    if(supplierList.length !== 0){
      const quotationCondition = supplierList.map(supplier => `request_response_table.request_response='"${supplier}"'`).join(" OR ");
      const quotationRequestIdList = plv8.execute(`SELECT request_view.request_id FROM request_response_table INNER JOIN request_view ON request_response_table.request_response_request_id=request_view.request_id WHERE request_view.request_status='APPROVED' AND request_view.request_form_id='${quotation_form.form_id}' AND (${quotationCondition})`);

      if(quotationRequestIdList.length === 0){
        ssot_data = [];
        return;
      }

      const sectionId = plv8.execute(`SELECT section_id FROM section_table WHERE section_form_id='${quotation_form.form_id}' AND section_name='ID'`)[0];
      const fieldId = plv8.execute(`SELECT field_id FROM field_table WHERE field_section_id='${sectionId.section_id}' AND field_name='Item ID'`)[0];

      const itemCondition = quotationRequestIdList.map(requestId => `(request_response_request_id='${requestId.request_id}' AND request_response_field_id='${fieldId.field_id}')`).join(" OR ");
      const itemIdList = plv8.execute(`SELECT request_response FROM request_response_table WHERE ${itemCondition}`);

      supplierCondition = itemIdList.map(requestId => `request_view.request_id = '${JSON.parse(requestId.request_response)}'`).join(' OR ');
    }

    let orCondition = [...(condition ? [`${condition}`] : []), ...(searchCondition ? [`${searchCondition}`] : [])].join(' OR ');

    item_requests = plv8.execute(
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
            AND request_view.request_form_id = '${item_form.form_id}'
            AND (
              ${[...(orCondition ? [`${orCondition}`] : []), ...(supplierCondition ? [`${supplierCondition}`] : [])].join(' AND ')}
            )
          ORDER BY request_view.request_status_date_updated DESC
        ) AS a 
        WHERE a.RowNumber = ${itemFilterCount ? itemFilterCount : 1}
        OFFSET ${rowStart} 
        ROWS FETCH FIRST ${rowLimit} ROWS ONLY
      `
    );
        
  }else{
    item_requests = plv8.execute(`SELECT request_id, request_formsly_id, request_view.request_jira_id, request_view.request_otp_id, request_date_created, request_team_member_id FROM request_view WHERE request_status='APPROVED' AND request_form_id='${item_form.form_id}' ORDER BY request_status_date_updated DESC OFFSET ${rowStart} ROWS FETCH FIRST ${rowLimit} ROWS ONLY`);
  }

  ssot_data = item_requests.map((item) => {
    // Item request response
    const item_response = plv8.execute(`SELECT request_response, request_response_field_id, request_response_duplicatable_section_id FROM request_response_table WHERE request_response_request_id='${item.request_id}'`);
    
    if(!item_response) return;

    // Item request response with fields
    const item_response_fields = item_response.map(response => {
      const field = plv8.execute(`SELECT field_name, field_type FROM field_table WHERE field_id='${response.request_response_field_id}'`)[0];

      return {
        request_response: response.request_response,
        request_response_field_name: field.field_name,
        request_response_field_type: field.field_type,
        request_response_duplicatable_section_id: response.request_response_duplicatable_section_id
      }
    });

    // Item team member
    const item_team_member = plv8.execute(`SELECT user_table.user_first_name, user_table.user_last_name FROM team_member_table INNER JOIN user_table ON team_member_table.team_member_user_id = user_id WHERE team_member_id='${item.request_team_member_id}'`)[0];

    const quotation_ids = plv8.execute(`SELECT request_view.request_id FROM request_response_table INNER JOIN request_view ON request_response_table.request_response_request_id=request_view.request_id WHERE request_response_table.request_response='"${item.request_id}"' AND request_view.request_status='APPROVED' AND request_view.request_form_id='${quotation_form.form_id}'`);
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

    const sourced_item_ids = plv8.execute(`SELECT request_view.request_id FROM request_response_table INNER JOIN request_view ON request_response_table.request_response_request_id=request_view.request_id WHERE request_response_table.request_response='"${item.request_id}"' AND request_view.request_status='APPROVED' AND request_view.request_form_id='${sourced_item_form.form_id}'`);
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
      item_request_id: item.request_id,
      item_request_formsly_id: item.request_formsly_id,
      item_request_jira_id: item.request_jira_id,
      item_request_otp_id: item.request_otp_id,
      item_request_date_created: item.request_date_created,
      item_request_response: item_response_fields,
      item_request_owner: item_team_member,
      item_quotation_request: quotation_list,
      item_sourced_item_request: sourced_item_list,
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
      } else if(formName==='PED Equipment') {
        endId = `PE`;
      } else if(formName==='PED Part') {
        endId = `PP`;
      } else if(formName==='PED Item') {
        endId = `PC`;
      } else if(formName==='Sourced Item') {
        endId = `SI`;
      } else if(formName==='Receiving Inspecting Report') {
        endId = `RIR`;
      } else if(formName==='Release Order') {
        endId = `RO`;
      } else if(formName==='Transfer Receipt') {
        endId = `TR`;
      } else if(formName==='Request For Payment') {
        endId = `RFP`;
      } else if(formName === 'IT Asset'){
        endId = `ITA`;
      } else if(formName === 'Liquidation/Reimbursement'){
        endId = `LR`;
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

    plv8.execute(`INSERT INTO request_response_table (request_response,request_response_duplicatable_section_id,request_response_field_id,request_response_request_id,request_response_prefix) VALUES ${responseValues};`);

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

    plv8.execute(`INSERT INTO request_response_table (request_response,request_response_duplicatable_section_id,request_response_field_id,request_response_request_id, request_response_prefix) VALUES ${responseValues};`);

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
      itemData: {
        item_general_name,
        item_is_available,
        item_unit,
        item_gl_account,
        item_team_id,
        item_division_id_list,
        item_encoder_team_member_id,
        item_level_three_description,
        item_is_ped_item,
        item_category_id,
        item_is_it_asset_item
      },
      itemDescription
    } = input_data;
    
    const item_result = plv8.execute(
      `
        INSERT INTO item_table 
        (
          item_general_name,
          item_is_available,
          item_unit,
          item_gl_account,
          item_team_id,
          item_encoder_team_member_id, 
          item_is_ped_item, 
          item_category_id,
          item_is_it_asset_item
        ) 
        VALUES 
        (
          '${item_general_name}',
          '${item_is_available}',
          '${item_unit}',
          '${item_gl_account}',
          '${item_team_id}',
          '${item_encoder_team_member_id}',
          '${Boolean(item_is_ped_item)}',
          ${item_category_id ? `'${item_category_id}'` : null},
          '${Boolean(item_is_it_asset_item)}'
        ) RETURNING *
      `
    )[0];

    const itemDivisionInput = item_division_id_list.map(division => {
      return `(${division}, '${item_result.item_id}')`;
    }).join(",");
    let itemDivisionDescription;
    if (item_level_three_description) {
      itemDivisionDescription = plv8.execute(`INSERT INTO item_level_three_description_table (item_level_three_description_item_id, item_level_three_description) VALUES ('${item_result.item_id}', '${item_level_three_description}') RETURNING *`)[0].item_level_three_description;
    }
    const item_division_list_result = plv8.execute(`INSERT INTO item_division_table (item_division_value, item_division_item_id) VALUES ${itemDivisionInput} RETURNING *`);

    const itemDescriptionInput = [];
    const fieldInput= [];

    itemDescription.forEach((description, index) => {
      const fieldId = plv8.execute('SELECT uuid_generate_v4()')[0].uuid_generate_v4;
      const descriptionId = plv8.execute('SELECT uuid_generate_v4()')[0].uuid_generate_v4;
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

    const itemDescriptionValues = itemDescriptionInput
      .map((item) =>
        `('${item.item_description_id}','${item.item_description_label}','${item.item_description_item_id}','${item.item_description_is_available}','${item.item_description_field_id}','${item.item_description_is_with_uom}',${item.item_description_order})`
      )
      .join(",");

    const fieldValues = fieldInput
      .map((field) =>
        `('${field.field_id}','${field.field_name}','${field.field_type}','${field.field_order}','${field.field_section_id}','${field.field_is_required}')`
      ).join(",");

    plv8.execute(`INSERT INTO field_table (field_id,field_name,field_type,field_order,field_section_id,field_is_required) VALUES ${fieldValues}`);
    
    const item_description = plv8.execute(`INSERT INTO item_description_table (item_description_id, item_description_label,item_description_item_id,item_description_is_available,item_description_field_id, item_description_is_with_uom, item_description_order) VALUES ${itemDescriptionValues} RETURNING *`);

    item_data = {
      ...item_result, 
      item_division_id_list: item_division_list_result.map(division => division.item_division_value), 
      item_description: item_description,
      item_level_three_description: itemDivisionDescription
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
        UPDATE item_table SET 
          item_general_name = '${item_general_name}',
          item_is_available = '${item_is_available}',
          item_unit = '${item_unit}',
          item_gl_account = '${item_gl_account}',
          item_team_id = '${item_team_id}',
          item_is_ped_item = '${Boolean(item_is_ped_item)}',
          item_category_id = ${item_category_id ? `'${item_category_id}'` : null},
          item_is_it_asset_item = '${Boolean(item_is_it_asset_item)}'
        WHERE item_id = '${item_id}'
        RETURNING *
      `
    )[0];

    const { section_id } = plv8.execute(`SELECT section_id FROM section_table WHERE section_form_id='${formId}' AND section_name='Item';`)[0];
    const itemDescriptionInput = [];
    const fieldInput = [];

    toAdd.forEach((description) => {
      const fieldId = plv8.execute('SELECT uuid_generate_v4();')[0].uuid_generate_v4;
      const descriptionId = plv8.execute('SELECT uuid_generate_v4()')[0].uuid_generate_v4;
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

    const itemDescriptionValues = itemDescriptionInput
      .map((item) =>
        `('${item.item_description_id}','${item.item_description_label}','${item.item_description_item_id}','${item.item_description_is_available}','${item.item_description_field_id}','${item.item_description_is_with_uom}',${item.item_description_order})`
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
            field_name = '${description.item_description_label}',
            field_order = ${description.item_description_order + 15}
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
    plv8.execute(
      `
        DELETE FROM item_level_three_description_table
        WHERE item_level_three_description_item_id = '${item_id}'
      `
    );

    // add
    let addedDescription = [];
    if(fieldValues.length && itemDescriptionValues.length){
      plv8.execute(`INSERT INTO field_table (field_id,field_name,field_type,field_order,field_section_id,field_is_required) VALUES ${fieldValues}`);

      addedDescription = plv8.execute(`INSERT INTO item_description_table (item_description_id, item_description_label,item_description_item_id,item_description_is_available,item_description_field_id, item_description_is_with_uom, item_description_order) VALUES ${itemDescriptionValues} RETURNING *`);
    }

    plv8.execute(`DELETE FROM item_division_table WHERE item_division_item_id='${item_id}'`);
    const itemDivisionInput = item_division_id_list.map(division => {
      return `(${division}, '${item_result.item_id}')`;
    }).join(",");
    
    const item_division_list_result = plv8.execute(`INSERT INTO item_division_table (item_division_value, item_division_item_id) VALUES ${itemDivisionInput} RETURNING *`);

    let itemLevelThreeDescription = "";
    if(item_level_three_description){
      itemLevelThreeDescription = plv8.execute(`INSERT INTO item_level_three_description_table (item_level_three_description_item_id, item_level_three_description) VALUES ('${item_id}', '${item_level_three_description}') RETURNING *`)[0].item_level_three_description;
    }

    item_data = {
      ...item_result, 
      item_division_id_list: item_division_list_result.map(division => division.item_division_value), 
      item_description: [...updatedItemDescription, ...addedDescription],
      item_level_three_description: itemLevelThreeDescription
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

-- Start: check if Item form can be activated

CREATE OR REPLACE FUNCTION check_item_form_status(
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

-- End: check if Item form can be activated

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
          },'${field.field_is_positive_metric}','${field.field_is_required}','${field.field_order}','${field.field_section_id}', ${field.field_special_field_template_id ? `'${field.field_special_field_template_id}'` : "NULL"})`
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

    const field_query = `INSERT INTO field_table (field_id,field_name,field_type,field_description,field_is_positive_metric,field_is_required,field_order,field_section_id,field_special_field_template_id) VALUES ${fieldValues}`;

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

-- Start: Check if the approving or creating quotation item quantity are less than the item quantity

CREATE OR REPLACE FUNCTION check_item_quantity(
    input_data JSON
)
RETURNS JSON AS $$
    let item_data
    plv8.subtransaction(function(){
        const {
            itemID,
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
                    AND request_response = '${itemID}' 
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

-- End: Check if the approving or creating quotation item quantity are less than the item quantity

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

      let fetch_request_list_query = 
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
        `;

      let sort_request_list_query = 
        `
          ORDER BY request_view.request_date_created ${sort} 
          OFFSET ${start} ROWS FETCH FIRST ${limit} ROWS ONLY
        `;

      let request_list_count_query = 
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
        `;

      if (!isApproversView) {
        const nonApproverFilterQuery = 
          `
            ${requestor}
            ${approver}
            ${status}
            ${form}
            ${project}
            ${idFilter}
            ${search}
          `;

        request_list = plv8.execute(fetch_request_list_query + nonApproverFilterQuery + sort_request_list_query);
        request_count = plv8.execute(request_list_count_query + ' ' + nonApproverFilterQuery)[0];
      } else {
        const approverFilterQuery = 
          `
            AND signer_team_member_id = '${teamMemberId}'
            AND request_signer_status = 'PENDING'
            AND request_status != 'CANCELED'
          `;
        request_list = plv8.execute(fetch_request_list_query + approverFilterQuery + sort_request_list_query);
        request_count = plv8.execute(request_list_count_query + ' ' + approverFilterQuery)[0];
      }

      const request_data = request_list.map(request => {
        const request_signer = plv8.execute(
          `
            SELECT 
              request_signer_table.request_signer_id, 
              request_signer_table.request_signer_status, 
              signer_table.signer_is_primary_signer,
              signer_table.signer_team_member_id
            FROM request_signer_table
            INNER JOIN signer_table ON request_signer_table.request_signer_signer_id = signer_table.signer_id
            WHERE request_signer_table.request_signer_request_id = '${request.request_id}'
          `
        ).map(signer => {
          return {
            request_signer_id: signer.request_signer_id,
            request_signer_status: signer.request_signer_status,
            request_signer: {
                signer_team_member_id: signer.signer_team_member_id,
                signer_is_primary_signer: signer.signer_is_primary_signer
            }
          }
        });

        return {
          ...request,
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
      boqId,
      region,
      province,
      city,
      barangay,
      street,
      zipCode
    } = input_data;

    const projectInitialCount = plv8.execute(`
      SELECT COUNT(*) FROM team_project_table 
      WHERE team_project_team_id = $1 
      AND team_project_code ILIKE '%' || $2 || '%';
    `, [teamProjectTeamId, teamProjectInitials])[0].count + 1n;

    const teamProjectCode = teamProjectInitials + projectInitialCount.toString(16).toUpperCase();

    const addressData = plv8.execute(
      `
        INSERT INTO address_table 
          (address_region, address_province, address_city, address_barangay, address_street, address_zip_code)
        VALUES 
          ('${region}', '${province}', '${city}', '${barangay}', '${street}', '${zipCode}') RETURNING *
      `
    )[0];

    teamData = plv8.execute(
      `
        INSERT INTO team_project_table 
          (team_project_name, team_project_code, team_project_team_id, team_project_site_map_attachment_id, team_project_boq_attachment_id, team_project_address_id) 
        VALUES 
          ('${teamProjectName}', '${teamProjectCode}', '${teamProjectTeamId}', ${siteMapId ? `'${siteMapId}'` : null},  ${boqId ? `'${boqId}'` : null}, '${addressData.address_id}')
        RETURNING *
      `
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
     teamMemberIdList,
     teamProjectIdList
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

    teamProjectIdList.forEach(projectId => {
      insertData.forEach(member => {
        plv8.execute(
          `
            INSERT INTO team_project_member_table (team_member_id, team_project_id)
            SELECT '${member.team_member_id}', '${projectId}'
            WHERE NOT EXISTS (
              SELECT 1 FROM team_project_member_table
              WHERE 
                team_member_id = '${member.team_member_id}'
                AND team_project_id = '${projectId}'
            )
          `
        )
      })
    })

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
      teamMemberIdList,
      teamGroupIdList
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

    teamGroupIdList.forEach(groupId => {
      insertData.forEach(member => {
        plv8.execute(
          `
            INSERT INTO team_group_member_table (team_member_id, team_group_id)
            SELECT '${member.team_member_id}', '${groupId}'
            WHERE NOT EXISTS (
              SELECT 1 FROM team_group_member_table
              WHERE 
                team_member_id = '${member.team_member_id}'
                AND team_group_id = '${groupId}'
            )
          `
        )
      })
    })

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

-- End: Delete team

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

-- End: Update multiple approver

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

-- End: Update multiple admin

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

    const idCondition = plv8.execute(`SELECT generate_request_id_condition('${requestId}')`)[0].generate_request_id_condition;

    const request = plv8.execute(
      `
        SELECT 
          form_is_formsly_form, 
          form_name
        FROM request_view
        INNER JOIN form_table ON form_id = request_form_id
        WHERE 
          ${idCondition}
          AND request_is_disabled = false
      `
    )[0];

    if (!request.form_is_formsly_form || (request.form_is_formsly_form && ['Subcon', 'Request For Payment'].includes(request.form_name))) {
      const requestData = plv8.execute(`SELECT get_request('${requestId}')`)[0].get_request;
      if(!request) throw new Error('404');
      returnData = {
        request: requestData
      };
      return;
    } else {
      const teamId = plv8.execute(`SELECT get_user_active_team_id('${userId}')`)[0].get_user_active_team_id;
      if (!teamId) throw new Error("No team found");

      const requestData = plv8.execute(`SELECT get_request_without_duplicatable_section('${requestId}')`)[0].get_request_without_duplicatable_section;
      if(!request) throw new Error('404');

      const duplicatableSectionIdList = plv8.execute(
        `
          SELECT DISTINCT(request_response_duplicatable_section_id)
          FROM request_response_table
          WHERE 
            request_response_request_id = '${requestData.request_id}'
            AND request_response_duplicatable_section_id IS NOT NULL
        `
      ).map(response => response.request_response_duplicatable_section_id);

      returnData =  {
        request: requestData,
        duplicatableSectionIdList
      };
    }
 });
 return returnData;
$$ LANGUAGE plv8;

-- End: Request page on load

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

    const userValidId = plv8.execute(`SELECT * FROM user_valid_id_table WHERE user_valid_id_user_id='${member.team_member_user.user_id}';`)[0];

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

    team_member_data = {member: member, userValidId, groupList, groupCount:`${groupCount}`, projectList, projectCount: `${projectCount}`}
 });
 return team_member_data;
$$ LANGUAGE plv8;

-- End: Get team member on load

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
    
    const team = plv8.execute(`SELECT team_id, team_name, team_logo FROM team_table WHERE team_id='${teamId}' AND team_is_disabled=false;`)[0];

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
        FROM 
            team_member_table tmt 
        JOIN 
            user_table usert ON tmt.team_member_user_id = usert.user_id
        LEFT JOIN 
            user_employee_number_table uent ON uent.user_employee_number_user_id = usert.user_id
                AND uent.user_employee_number_is_disabled = false
        WHERE 
            tmt.team_member_team_id = '${teamId}'
            AND tmt.team_member_is_disabled = false 
            AND usert.user_is_disabled = false
        ORDER BY
            CASE tmt.team_member_role
                WHEN 'OWNER' THEN 1
                WHEN 'ADMIN' THEN 2
                WHEN 'APPROVER' THEN 3
                WHEN 'MEMBER' THEN 4
            END ASC,
            usert.user_first_name ASC,
            usert.user_last_name ASC
        LIMIT '${teamMemberLimit}'
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

    const teamGroups = plv8.execute(`SELECT team_group_id, team_group_name, team_group_team_id FROM team_group_table WHERE team_group_team_id='${teamId}' AND team_group_is_disabled=false ORDER BY team_group_date_created DESC LIMIT 10;`);

    const teamGroupsCount = plv8.execute(`SELECT COUNT(*) FROM team_group_table WHERE team_group_team_id='${teamId}' AND team_group_is_disabled=false;`)[0].count;

    const teamProjects = plv8.execute(
      `
        SELECT 
          team_project_table.*,
          boq.attachment_value AS team_project_boq_attachment_id,
          site_map.attachment_value AS team_project_site_map_attachment_id,
          address_table.*
        FROM team_project_table 
        LEFT JOIN attachment_table boq ON (
          team_project_boq_attachment_id = boq.attachment_id
          AND boq.attachment_is_disabled = false
        )
        LEFT JOIN attachment_table site_map ON (
          team_project_site_map_attachment_id = site_map.attachment_id
          AND site_map.attachment_is_disabled = false
        )
        LEFT JOIN address_table ON (
          team_project_address_id = address_id
        )
        WHERE 
          team_project_team_id='${teamId}' 
          AND team_project_is_disabled=false 
        ORDER BY team_project_name ASC 
        LIMIT 10
      `
    );

    const teamProjectsCount = plv8.execute(`SELECT COUNT(*) FROM team_project_table WHERE team_project_team_id='${teamId}' AND team_project_is_disabled=false;`)[0].count;

    const pendingValidIDList = plv8.execute(`SELECT * FROM user_valid_id_table WHERE user_valid_id_status='PENDING';`);

    team_data = { 
      team, 
      teamMembers, 
      teamGroups, 
      teamGroupsCount: `${teamGroupsCount}`, 
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
      teamProjectsCount: `${teamProjectsCount}`, 
      teamMembersCount: Number(teamMembersCount), 
      pendingValidIDList
    }
 });
 return team_data;
$$ LANGUAGE plv8;

-- End: Get team on load

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

-- End: Get team members with filter

-- START: Get notifications on load

CREATE OR REPLACE FUNCTION get_notification_on_load(
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

-- End: Get notifications on load

-- START: Get ssot on load

CREATE OR REPLACE FUNCTION get_ssot_on_load(
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

    const ssotData = plv8.execute(`SELECT get_ssot('{ "activeTeam": "${teamId}", "pageNumber": 1, "rowLimit": 10, "search": "", "itemFilter": [], "itemFilterCount": 0, "supplierList": [] }');`)[0].get_ssot;

    const itemList = plv8.execute(`SELECT * FROM item_table WHERE item_team_id='${teamId}' AND item_is_disabled=false AND item_is_available=true ORDER BY item_general_name ASC;`);

    const projectList = plv8.execute(`SELECT * FROM team_project_table WHERE team_project_team_id='${teamId}' AND team_project_is_disabled=false ORDER BY team_project_name ASC;`);
    
    const itemNameList = itemList.map(item=>item.item_general_name);
    const projectNameList = projectList.map(project=>project.team_project_name);
    
    ssot_data = {data: ssotData, itemNameList, projectNameList}
 });
 return ssot_data;
$$ LANGUAGE plv8;

-- End: Get ssot on load

-- End: Get request list on load

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

    const teamMemberList = plv8.execute(`SELECT tmt.team_member_id, tmt.team_member_role, json_build_object( 'user_id',usert.user_id, 'user_first_name',usert.user_first_name , 'user_last_name',usert.user_last_name) AS team_member_user FROM team_member_table tmt JOIN user_table usert ON tmt.team_member_user_id=usert.user_id WHERE tmt.team_member_team_id='${teamId}' AND tmt.team_member_is_disabled=false;`);

    const isFormslyTeam = plv8.execute(`SELECT COUNT(formt.form_id) > 0 AS isFormslyTeam FROM form_table formt JOIN team_member_table tmt ON formt.form_team_member_id = tmt.team_member_id WHERE tmt.team_member_team_id='${teamId}' AND formt.form_is_formsly_form=true;`)[0].isformslyteam;

    const projectList = plv8.execute(`SELECT * FROM team_project_table WHERE team_project_is_disabled=false AND team_project_team_id='${teamId}';`);

    request_data = {teamMemberList,isFormslyTeam,projectList}
 });
 return request_data;
$$ LANGUAGE plv8;

-- End: Get request list on load

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

-- End: Canvass page on load

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

-- End: Form list page on load

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

-- End: Build form page on load

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

    const teamId = plv8.execute(`SELECT get_user_active_team_id('${userId}');`)[0].get_user_active_team_id;
 
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
        ORDER BY user_first_name, user_last_name ASC;
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

    const teamGroupList = plv8.execute(`SELECT team_group_id, team_group_name FROM team_group_table WHERE team_group_team_id = '${teamId}' AND team_group_is_disabled = false;`);
 
    if(isFormslyForm){
      const teamProjectList = plv8.execute(`SELECT team_project_id, team_project_name FROM team_project_table WHERE team_project_team_id = '${teamId}' AND team_project_is_disabled = false ORDER BY team_project_name ASC LIMIT ${limit};`);
      const teamProjectListCount = plv8.execute(`SELECT COUNT(*) FROM team_project_table WHERE team_project_team_id = '${teamId}' AND team_project_is_disabled = false;`)[0].count;
    
      returnData = {
        teamMemberList,
        teamGroupList,
        teamProjectList,
        teamProjectListCount: Number(`${teamProjectListCount}`)
      }
    } else {
      returnData = {
        teamMemberList, 
        teamGroupList
      }
    }
 });
 return returnData;
$$ LANGUAGE plv8;

-- End: Form page on load

-- Start: Create request page on load

CREATE OR REPLACE FUNCTION create_request_page_on_load(
  input_data JSON
)
RETURNS JSON as $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      formId,
      userId
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

    const sectionData = [];
    const formSection = plv8.execute(`SELECT * FROM section_table WHERE section_form_id = '${formId}' ORDER BY section_order ASC`);
    formSection.forEach(section => {
      const fieldData = plv8.execute(
        `
          SELECT *
          FROM field_table
          WHERE field_section_id = '${section.section_id}'
          ORDER BY field_order ASC
          ${formData.form_name === 'Item' ? "LIMIT 10" : ""}
          ${formData.form_name === 'PED Item' ? "LIMIT 7" : ""}
          ${formData.form_name === 'IT Asset' ? "LIMIT 10" : ""}
        `
      );
      const field = fieldData.map(field => {
        let optionData = [];
 
        if (field.field_special_field_template_id) {
          switch(field.field_special_field_template_id){
                case "c3a2ab64-de3c-450f-8631-05f4cc7db890": 
                    const teamMemberList = plv8.execute(`SELECT user_id, user_first_name, user_last_name FROM team_member_table INNER JOIN user_table ON user_id = team_member_user_id WHERE team_member_team_id = '${teamId}' ORDER BY user_last_name`); 
                    optionData = teamMemberList.map((item, index) => ({
                        option_id: item.user_id,
                        option_value: item.user_last_name + ', ' + item.user_first_name,
                        option_order: index,
                        option_field_id: field.field_id
                    }));
                    break;

                case "ff007180-4367-4cf2-b259-7804867615a7":
                    const csiCodeList = plv8.execute(`SELECT csi_code_id, csi_code_section FROM csi_code_table LIMIT 1000`); 
                    optionData = csiCodeList.map((item, index) => ({
                        option_id: item.csi_code_id,
                        option_value: item.csi_code_section,
                        option_order: index,
                        option_field_id: field.field_id
                    }));
                    break;
            }
        } else {
            optionData = plv8.execute( `
              SELECT *
              FROM option_table
              WHERE option_field_id = '${field.field_id}'
              ORDER BY option_order ASC
            `);
        }

        return {
          ...field,
          field_option: optionData
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
      form_section: sectionData,
    };

    if (form.form_is_formsly_form) {
      if (form.form_name === "Item") {
        const projects = plv8.execute(
          `
            SELECT 
              team_project_table.team_project_id,
              team_project_table.team_project_name
            FROM team_project_member_table
            INNER JOIN team_project_table ON team_project_table.team_project_id = team_project_member_table.team_project_id
            WHERE
              team_member_id = '${teamMember.team_member_id}'
              AND team_project_is_disabled = false
            ORDER BY team_project_name;
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
              form.form_section[1]
            ],
          },
          projectOptions
        }
        return;
      } else if (form.form_name === "Services") {
        const projects = plv8.execute(
          `
            SELECT 
              team_project_table.team_project_id,
              team_project_table.team_project_name
            FROM team_project_member_table
            INNER JOIN team_project_table ON team_project_table.team_project_id = team_project_member_table.team_project_id
            WHERE
              team_member_id = '${teamMember.team_member_id}'
              AND team_project_is_disabled = false
            ORDER BY team_project_name;
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

        const categories = plv8.execute(
          `
            SELECT 
                service_category_id,
                service_category
            FROM service_category_table
            WHERE 
              service_category_team_id = '${teamMember.team_member_team_id}'
              AND service_category_is_disabled = false
              AND service_category_is_available = true
            ORDER BY service_category;
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
            SELECT 
              csi_code_division_id,
              csi_code_division_description
            FROM distinct_division_view;
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
            FROM general_unit_of_measurement_table
            WHERE 
              general_unit_of_measurement_team_id = '${teamMember.team_member_team_id}'
              AND general_unit_of_measurement_is_disabled = false
              AND general_unit_of_measurement_is_available = true
            ORDER BY general_unit_of_measurement;
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
                  ...form.form_section[1].section_field.slice(5, 10),
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
              team_project_table.team_project_id,
              team_project_table.team_project_name
            FROM team_project_member_table
            INNER JOIN team_project_table ON team_project_table.team_project_id = team_project_member_table.team_project_id
            WHERE
              team_member_id = '${teamMember.team_member_id}'
              AND team_project_is_disabled = false
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

        const categories = plv8.execute(
          `
            SELECT 
                other_expenses_category_id,
                other_expenses_category
            FROM other_expenses_category_table
            WHERE 
              other_expenses_category_team_id = '${teamMember.team_member_team_id}'
              AND other_expenses_category_is_disabled = false
              AND other_expenses_category_is_available = true
            ORDER BY other_expenses_category
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
            SELECT 
                csi_code_id,
                csi_code_level_three_description
            FROM csi_code_table
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
        const projects = plv8.execute(
          `
            SELECT 
                team_project_table.team_project_id,
                team_project_table.team_project_name
            FROM team_project_member_table
            INNER JOIN team_project_table ON team_project_table.team_project_id = team_project_member_table.team_project_id
            WHERE
              team_member_id = '${teamMember.team_member_id}'
              AND team_project_is_disabled = false
            ORDER BY team_project_name;
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

        const categories = plv8.execute(
          `
            SELECT 
                equipment_category_id,
                equipment_category
            FROM equipment_category_table
            WHERE 
              equipment_category_team_id = '${teamMember.team_member_team_id}'
              AND equipment_category_is_disabled = false
              AND equipment_category_is_available = true
            ORDER BY equipment_category;
          `
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
            FROM capacity_unit_of_measurement_table
            WHERE 
              capacity_unit_of_measurement_team_id = '${teamMember.team_member_team_id}'
              AND capacity_unit_of_measurement_is_disabled = false
              AND capacity_unit_of_measurement_is_available = true
            ORDER BY capacity_unit_of_measurement;
          `
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
        const projects = plv8.execute(
          `
            SELECT 
              team_project_table.team_project_id,
              team_project_table.team_project_name
            FROM team_project_member_table
            INNER JOIN team_project_table ON team_project_table.team_project_id = team_project_member_table.team_project_id
            WHERE
              team_member_id = '${teamMember.team_member_id}'
              AND team_project_is_disabled = false
            ORDER BY team_project_name;
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

        const categories = plv8.execute(
          `
            SELECT 
                equipment_category_id,
                equipment_category
            FROM equipment_category_table
            WHERE 
              equipment_category_team_id = '${teamMember.team_member_team_id}'
              AND equipment_category_is_disabled = false
              AND equipment_category_is_available = true
            ORDER BY equipment_category;
          `
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
        const projects = plv8.execute(
          `
            SELECT 
              team_project_table.team_project_id,
              team_project_table.team_project_name
            FROM team_project_member_table
            INNER JOIN team_project_table ON team_project_table.team_project_id = team_project_member_table.team_project_id
            WHERE
              team_member_id = '${teamMember.team_member_id}'
              AND team_project_is_disabled = false
            ORDER BY team_project_name;
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
              form.form_section[1]
            ],
          },
          projectOptions
        }
        return;
      } else if (form.form_name === "Request For Payment") {
        const projects = plv8.execute(
          `
            SELECT 
                team_project_table.team_project_id,
                team_project_table.team_project_name
            FROM team_project_member_table
            INNER JOIN team_project_table ON team_project_table.team_project_id = team_project_member_table.team_project_id
            WHERE
              team_member_id = '${teamMember.team_member_id}'
            ORDER BY team_project_name;
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
                ...form.form_section[1]
              }
            ],
          },

          projectOptions,
        }
        return;
      } else if (form.form_name === "IT Asset") {
        const projects = plv8.execute(
          `
            SELECT 
                team_project_table.team_project_id,
                team_project_table.team_project_name
            FROM team_project_member_table
            INNER JOIN team_project_table ON team_project_table.team_project_id = team_project_member_table.team_project_id
            WHERE
              team_member_id = '${teamMember.team_member_id}'
              AND team_project_is_disabled = false
            ORDER BY team_project_name;
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

        const departments = plv8.execute(`SELECT team_department_id, team_department_name FROM team_department_table WHERE team_department_is_disabled=FALSE`);

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
        })

        returnData = {
          form: {
            ...form,
            form_section: [
              {
                ...form.form_section[0],
                section_field: firstSectionFieldList,
              },
              ...form.form_section.slice(1)
            ],
          },
          projectOptions
        }
        return;
      } else if (form.form_name === "Liquidation/Reimbursement") {
        const projects = plv8.execute(
          `
            SELECT 
                team_project_table.team_project_id,
                team_project_table.team_project_name
            FROM team_project_member_table
            INNER JOIN team_project_table ON team_project_table.team_project_id = team_project_member_table.team_project_id
            WHERE
              team_member_id = '${teamMember.team_member_id}'
              AND team_project_is_disabled = false
            ORDER BY team_project_name;
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

        const departments = plv8.execute(`SELECT team_department_id, team_department_name FROM team_department_table WHERE team_department_is_disabled=FALSE`);

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
        })

        returnData = {
          form: {
            ...form,
            form_section: [
              {
                ...form.form_section[0],
                section_field: firstSectionFieldList,
              },
              ...form.form_section.slice(1)
            ],
          },
          projectOptions
        }
        return;
      }
    }else {
      returnData = {
        form
      }
    }
 });
 return returnData;
$$ LANGUAGE plv8;

-- End: Create request page on load

-- Start: Get request

CREATE OR REPLACE FUNCTION get_request(
  request_id TEXT
)
RETURNS JSON as $$
  let returnData;
  plv8.subtransaction(function(){
    const idCondition = plv8.execute(`SELECT generate_request_id_condition('${request_id}')`)[0].generate_request_id_condition;

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
    if(requestData.form_is_formsly_form && (requestData.form_name === "Item" || requestData.form_name === "Subcon" || requestData.form_name === "PED Item")) {
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

-- End: Get request

-- Start: Get ticket form

CREATE OR REPLACE FUNCTION get_ticket_form(
    input_data JSON
)
RETURNS JSON AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      category,
      teamId,
    } = input_data;

    const categoryData = plv8.execute(`SELECT * FROM ticket_category_table WHERE ticket_category='${category}' LIMIT 1;`)[0];
    
    const sectionData = plv8.execute(`SELECT * FROM ticket_section_table WHERE ticket_section_category_id='${categoryData.ticket_category_id}'`);
    
    const sectionList = sectionData.map(section => {
      const fieldData = plv8.execute(
        `
          SELECT *
          FROM ticket_field_table
          WHERE ticket_field_section_id = '${section.ticket_section_id}'
          ORDER BY ticket_field_order ASC
        `
      );
      const fieldWithOption = fieldData.map(field => {
        const optionData = plv8.execute(
          `
            SELECT *
            FROM ticket_option_table
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
        SELECT * FROM item_table 
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
        SELECT * FROM item_table 
        WHERE item_team_id='${teamId}'
        AND item_is_disabled = false
        AND item_is_available = true
        ORDER BY item_general_name ASC;
      `);
      const itemOptions = itemList.map((option)=> option.item_general_name);

      const csiCodeDescriptionList = plv8.execute(`
        SELECT * FROM csi_code_table 
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
        SELECT * FROM item_table 
        WHERE item_team_id='${teamId}'
        AND item_is_disabled = false
        AND item_is_available = true
        ORDER BY item_general_name ASC;
      `);
      const itemOptions = itemList.map((option)=> option.item_general_name);

      const uomList = plv8.execute(`
        SELECT item_unit_of_measurement
        FROM item_unit_of_measurement_table
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
          FROM team_member_table tmt
            JOIN user_table usert ON usert.user_id = tmt.team_member_user_id
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
          FROM equipment_table
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
          FROM equipment_general_name_table 
          WHERE equipment_general_name_team_id = '${teamId}'
        `
      )[0].count;
      let index = 0;
      while (index < equipmentGeneralNameCount) {
        const nameList = plv8.execute(
          `
            SELECT equipment_general_name 
            FROM equipment_general_name_table 
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
          FROM equipment_brand_table
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
          FROM equipment_model_table
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
          FROM equipment_unit_of_measurement_table
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
          FROM equipment_component_category_table
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
    }
    
    else {
      returnData = { ticket_sections: sectionList }
    }
 });
 return returnData;
$$ LANGUAGE plv8;

-- End: Edit ticket response

-- Start: Check custom csi validity

CREATE OR REPLACE FUNCTION check_custom_csi_validity(
    input_data JSON
)
RETURNS JSON AS $$
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
      FROM csi_code_table
      WHERE 
        csi_code_division_id = '${csi_code_division_id}';
    `)[0];
    
    const csiCodeLevelTwoMajorGroupIdExists = plv8.execute(`
      SELECT *
      FROM csi_code_table
      WHERE 
        csi_code_division_id = '${csi_code_division_id}'
        AND csi_code_level_two_major_group_id = '${csi_code_level_two_major_group_id}';
    `)[0];
    
    const csiCodeLevelTwoMinorGroupIdExists = plv8.execute(`
      SELECT *
      FROM csi_code_table
      WHERE 
        csi_code_division_id = '${csi_code_division_id}'
        AND csi_code_level_two_major_group_id = '${csi_code_level_two_major_group_id}'
        AND csi_code_level_two_minor_group_id = '${csi_code_level_two_minor_group_id}';
    `)[0];
    
    const csiCodeLevelThreeIdExists = plv8.execute(`
      SELECT *
      FROM csi_code_table
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

    const ticket = plv8.execute(`SELECT tt.*, tct.ticket_category
      FROM ticket_table tt
      INNER JOIN ticket_category_table tct ON tct.ticket_category_id = tt.ticket_category_id
      WHERE ticket_id='${ticketId}';
    `)[0];

    const requester = plv8.execute(`SELECT jsonb_build_object(
          'team_member_id', tm.team_member_id,
          'team_member_team_id', tm.team_member_team_id,
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
    
    const ticketForm = plv8.execute(`SELECT get_ticket_form('{"category": "${ticket.ticket_category}","teamId": "${requester.member.team_member_team_id}"}')`)[0].get_ticket_form;

    const responseData = plv8.execute(`SELECT * FROM ticket_response_table WHERE ticket_response_ticket_id='${ticketId}';`);

    const originalTicketSections = ticketForm.ticket_sections.map(section=>({
        ...section,
        field_section_duplicatable_id: null,
        ticket_section_fields: section.ticket_section_fields.map(field=>{
          return {
            ...field,
            ticket_field_response: responseData.filter(response=>response.ticket_response_field_id===field.ticket_field_id)
          }
        })
      }))

    
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
            const item = plv8.execute(`SELECT * FROM item_table WHERE item_general_name = '${itemName}';`)[0];
            const itemDescriptionList = plv8.execute(`SELECT item_description_label FROM item_description_table WHERE item_description_item_id = '${item.item_id}';`);
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
    user: member,
    ticketForm: ticketFormWithResponse,
    }
 });
 return returnData;
$$ LANGUAGE plv8;

-- End: Get ticket on load

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
    
    const member = plv8.execute(`SELECT *  FROM team_member_table WHERE team_member_id='${teamMemberId}';`)[0];

    const isApprover = member.team_member_role === 'OWNER' || member.team_member_role === 'ADMIN';
    if (!isApprover) throw new Error("User is not an Approver");
    
    plv8.execute(`UPDATE ticket_table SET ticket_status='UNDER REVIEW', ticket_status_date_updated = NOW(), ticket_approver_team_member_id = '${teamMemberId}' WHERE ticket_id='${ticketId}' RETURNING *;`)[0];

    const updatedTicket = plv8.execute(`SELECT tt.*, tct.ticket_category
          FROM ticket_table tt
          INNER JOIN ticket_category_table tct ON tct.ticket_category_id = tt.ticket_category_id
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
            ticket_table.*,
            ticket_category_table.ticket_category
          FROM ticket_table
          INNER JOIN team_member_table ON ticket_requester_team_member_id = team_member_id
          INNER JOIN ticket_category_table ON ticket_category_table.ticket_category_id = ticket_table.ticket_category_id 
          WHERE team_member_team_id = '${teamId}'
          ${requester}
          ${approver}
          ${status}
          ${category}
          ${search}
          ORDER BY ticket_date_created ${sort} 
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
        form_name = 'Item' AND
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
    requestId: initialRequestId,
    referenceOnly
  } = input_data;

  const teamId = plv8.execute(`SELECT get_user_active_team_id('${userId}');`)[0].get_user_active_team_id;
  if (!teamId) throw new Error("No team found");

  const isUUID = (str) => {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidPattern.test(str);
  }

  let requestId = initialRequestId;
  if(!isUUID(requestId)){
    requestId = plv8.execute(`SELECT request_id FROM request_view WHERE request_formsly_id = '${initialRequestId}'`)[0].request_id;
  }

  const requestData = plv8.execute(
    `
      SELECT 
        request_form_id, 
        request_status,
        user_id
      FROM request_table 
      INNER JOIN team_member_table ON team_member_id = request_team_member_id
      INNER JOIN user_table ON user_id = team_member_user_id
      WHERE 
        request_id = '${requestId}' 
        AND request_is_disabled = false
    `
  )[0];
 
  if(!referenceOnly){
    if (requestData.request_status !== 'PENDING') throw new Error("Request can't be edited") 
    if (!userId === requestData.user_id) throw new Error("Requests can only be edited by the request creator") 
  }

  const duplicatableSectionIdList = plv8.execute(
    `
      SELECT DISTINCT(request_response_duplicatable_section_id)
      FROM request_response_table
      WHERE 
        request_response_request_id = '${requestId}'
        AND request_response_duplicatable_section_id IS NOT NULL
    `
  ).map(response => response.request_response_duplicatable_section_id);
  
  formData = plv8.execute(`SELECT create_request_page_on_load('{ "formId": "${requestData.request_form_id}", "userId": "${userId}" }')`)[0].create_request_page_on_load;

  returnData = {
    ...formData,
    duplicatableSectionIdList,
    requestId
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

-- Start: Fetch equipment part list

CREATE OR REPLACE FUNCTION get_equipment_part_list(
    input_data JSON
)
RETURNS JSON AS $$
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
        FROM equipment_part_table
        LEFT JOIN equipment_general_name_table 
          ON equipment_part_general_name_id = equipment_general_name_id
          AND equipment_general_name_is_disabled = false
        LEFT JOIN equipment_brand_table 
          ON equipment_part_brand_id = equipment_brand_id
          AND equipment_brand_is_disabled = false
        LEFT JOIN equipment_model_table 
          ON equipment_part_model_id = equipment_model_id
          AND equipment_model_is_disabled = false
        LEFT JOIN equipment_unit_of_measurement_table 
          ON equipment_part_unit_of_measurement_id = equipment_unit_of_measurement_id
          AND equipment_unit_of_measurement_is_disabled = false
        LEFT JOIN equipment_component_category_table 
          ON equipment_part_component_category_id = equipment_component_category_id
          AND equipment_component_category_is_disabled = false
        WHERE
          equipment_part_equipment_id = '${equipmentId}'
          AND equipment_part_is_disabled = false
          ${
            search && 
            `
              AND equipment_general_name ILIKE '%${search}%'
              OR equipment_part_number ILIKE '%${search}%'
            `
          }
        ORDER BY equipment_general_name
        LIMIT ${limit}
        OFFSET '${start}'
      `
    );

    const count = plv8.execute(
      `
        SELECT COUNT(equipment_part_id) FROM equipment_part_table
        LEFT JOIN equipment_general_name_table 
          ON equipment_part_general_name_id = equipment_general_name_id
          AND equipment_general_name_is_disabled = false
        LEFT JOIN equipment_brand_table 
          ON equipment_part_brand_id = equipment_brand_id
          AND equipment_brand_is_disabled = false
        LEFT JOIN equipment_model_table 
          ON equipment_part_model_id = equipment_model_id
          AND equipment_model_is_disabled = false
        LEFT JOIN equipment_unit_of_measurement_table 
          ON equipment_part_unit_of_measurement_id = equipment_unit_of_measurement_id
          AND equipment_unit_of_measurement_is_disabled = false
        LEFT JOIN equipment_component_category_table 
          ON equipment_part_component_category_id = equipment_component_category_id
          AND equipment_component_category_is_disabled = false
        WHERE
          equipment_part_equipment_id = '${equipmentId}'
          AND equipment_part_is_disabled = false
          ${
            search && 
            `
              AND equipment_general_name ILIKE '%${search}%'
              OR equipment_part_number ILIKE '%${search}%'
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

-- End: Fetch equipment part list

-- Start: Fetch item section choices

CREATE OR REPLACE FUNCTION get_item_section_choices(
    input_data JSON
)
RETURNS JSON AS $$
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
          FROM equipment_part_table
          INNER JOIN equipment_general_name_table ON equipment_general_name_id = equipment_part_general_name_id
          INNER JOIN equipment_table ON equipment_id = equipment_part_equipment_id
          INNER JOIN equipment_component_category_table ON equipment_component_category_id = equipment_part_component_category_id
          INNER JOIN equipment_brand_table ON equipment_brand_id = equipment_part_brand_id
          INNER JOIN equipment_model_table ON equipment_model_id = equipment_part_model_id
          INNER JOIN equipment_unit_of_measurement_table ON equipment_unit_of_measurement_id = equipment_part_unit_of_measurement_id
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

-- End: Fetch item section choices

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
  plv8.subtransaction(function() {
    const { memo_id, current_user_id } = input_data;

    const currentUser = plv8.execute(`
      SELECT *
      FROM team_member_table
      WHERE team_member_user_id = '${current_user_id}'
      LIMIT 1
    `)[0];

    if (currentUser) {
      const hasUserReadMemo = plv8.execute(`
        SELECT COUNT(*)
        FROM memo_read_receipt_table
        WHERE memo_read_receipt_by_team_member_id = '${currentUser.team_member_id}'
        AND memo_read_receipt_memo_id = '${memo_id}';
      `)[0];

      if (Number(hasUserReadMemo.count) === 0) {
        plv8.execute(`
          INSERT INTO memo_read_receipt_table (memo_read_receipt_by_team_member_id, memo_read_receipt_memo_id)
          VALUES ('${currentUser.team_member_id}', '${memo_id}')
        `);
      }
    }

    const memo_data_raw = plv8.execute(`
      SELECT *
      FROM memo_table
      INNER JOIN user_table ON user_table.user_id = memo_author_user_id
      INNER JOIN memo_date_updated_table ON memo_date_updated_memo_id = memo_id
      INNER JOIN memo_status_table ON memo_status_memo_id = memo_id
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
      FROM memo_signer_table mst
      INNER JOIN team_member_table tm ON tm.team_member_id = mst.memo_signer_team_member_id
      INNER JOIN user_table ut ON ut.user_id = tm.team_member_user_id
      LEFT JOIN signature_history_table sht ON sht.signature_history_user_id = ut.user_id
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
      FROM memo_read_receipt_table
      INNER JOIN team_member_table ON team_member_id = memo_read_receipt_by_team_member_id
      INNER JOIN user_table ON user_id = team_member_user_id
      LEFT JOIN user_employee_number_table ON user_id = user_employee_number_user_id
      WHERE memo_read_receipt_memo_id = '${memo_id}'
    `);

    const agreement_data = plv8.execute(`
      SELECT memo_agreement_table.*, user_id, user_first_name, user_last_name, user_avatar, user_employee_number
      FROM memo_agreement_table
      INNER JOIN team_member_table ON team_member_id = memo_agreement_by_team_member_id
      INNER JOIN user_table ON user_id = team_member_user_id
      LEFT JOIN user_employee_number_table ON user_id = user_employee_number_user_id
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

    if (memoLineItemAttachmentTableValues) {
      plv8.execute(`INSERT INTO memo_line_item_attachment_table (memo_line_item_attachment_name,memo_line_item_attachment_caption,memo_line_item_attachment_storage_bucket,memo_line_item_attachment_public_url,memo_line_item_attachment_line_item_id) VALUES ${memoLineItemAttachmentTableValues}`);
    }
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
      SELECT
        mst.*,
        tm.*,
        ut.*,
        json_agg(sht.*) as signature_list
      FROM memo_signer_table mst
      INNER JOIN team_member_table tm ON tm.team_member_id = mst.memo_signer_team_member_id
      INNER JOIN user_table ut ON ut.user_id = tm.team_member_user_id
      LEFT JOIN signature_history_table sht ON sht.signature_history_user_id = ut.user_id
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
      memoLineItemAttachmentTableValues
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

    if (memoLineItemAttachmentTableValues) {
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
    }
    ;
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

-- Start: Fetch section in edit request

CREATE OR REPLACE FUNCTION fetch_edit_request_section(
    input_data JSON
)
RETURNS JSON AS $$
  let returnData = [];
  plv8.subtransaction(function(){
    const {
      index,
      supplierOptions,
      requestId,
      teamId,
      itemOptions,
      preferredSupplierField
    } = input_data;
    
    const unformattedRequest = plv8.execute(`SELECT get_request('${requestId}')`)[0].get_request;
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

    const itemDivisionIdList = [];
    const itemCategorySignerList = [null];
    const sectionData = sectionWithDuplicateList
      .slice(index, index + 10).map((section) => {
        const isWithPreferredSupplier =
          section.section_field[9].field_name === "Preferred Supplier";

        const itemName = JSON.parse(
          section.section_field[0].field_response[0].request_response
        );

        const item = plv8.execute(`
          SELECT *
          FROM item_table
          WHERE 
            item_team_id = '${teamId}'
            AND item_general_name = '${itemName}'
            AND item_is_disabled = false
            AND item_is_available = true;
        `)[0];

        if(!item) return null;

        const divisionList = plv8.execute(`SELECT * FROM item_division_table WHERE item_division_item_id = '${item.item_id}'`);

        itemDivisionIdList.push(divisionList.map(division => division.item_division_value));

        const itemDescriptionList = plv8.execute(`
          SELECT * 
          FROM item_description_table
          WHERE 
            item_description_item_id = '${item.item_id}'
            AND item_description_is_disabled = false
            AND item_description_is_available = true;
        `);

        const itemDescriptionWithField = itemDescriptionList
          .map((description)=> {

            const itemDescriptionFieldList = plv8.execute(`
              SELECT * 
              FROM item_description_field_table
              LEFT JOIN item_description_field_uom_table ON item_description_field_id = item_description_field_uom_item_description_field_id
              WHERE 
                item_description_field_item_description_id = '${description.item_description_id}'
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

        if(item.item_category_id.length !== 0){
          const signerData = plv8.execute(
            `
              SELECT 
                signer_action,
                signer_id,
                signer_is_primary_signer,
                signer_order,
                team_member_id,
                user_id,
                user_first_name,
                user_last_name,
                user_avatar
              FROM item_category_table
              INNER JOIN signer_table ON signer_id = item_category_signer_id
              INNER JOIN team_member_table ON team_member_id = signer_team_member_id
              INNER JOIN user_table ON user_id = team_member_user_id
              WHERE item_category_id = '${item.item_category_id}'
            `
          );
          if (signerData.lenght === 0) {
            itemCategorySignerList.push(null);
          } else {
            const signer = signerData[0];
            itemCategorySignerList.push({
              item_category_signer: {
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
                    user_avatar: signer.user_avatar
                  }
                }
              }
            });
          }
        }
      
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
              field_option: [{
                option_field_id: unformattedRequest.request_form.form_section[0].section_field[0].field_id,
                option_id: JSON.parse(section.section_field[4].field_response[0].request_response),
                option_order: 1,
                option_value: JSON.parse(section.section_field[4].field_response[0].request_response)
              }],
            },
            ...section.section_field.slice(5, 9),
            isWithPreferredSupplier
              ? {
                  ...section.section_field[9],
                  field_option: [
                    {
                      option_field_id: preferredSupplierField.field_id,
                      option_id: section.section_field[9].field_response[0] ? JSON.parse(
                        section.section_field[9].field_response[0]
                          .request_response
                      ) : "",
                      option_order: 1,
                      option_value: section.section_field[9].field_response[0] ? JSON.parse(
                        section.section_field[9].field_response[0]
                          .request_response
                      ) : "",
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
      }).filter(value => value);
    
    returnData = {
      sectionData,
      itemDivisionIdList,
      itemCategorySignerList
    }
 });
 return returnData;
$$ LANGUAGE plv8;

-- End: Fetch section in edit request

-- START: Get query data

CREATE OR REPLACE FUNCTION get_query_data(
    input_data JSON
)
RETURNS JSON AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      queryId
    } = input_data;
    
    const selectedQuery = plv8.execute(`SELECT * FROM query_table WHERE query_id='${queryId}';`)[0];

    const fetchedData = plv8.execute(selectedQuery.query_sql);
    
    BigInt.prototype.toJSON = function () {
    return this.toString();
    };

    returnData ={queryData: JSON.stringify(fetchedData)}
 });
 return returnData;
$$ LANGUAGE plv8;

-- END: Get query data

-- Start: Get signer sla

CREATE OR REPLACE FUNCTION get_signer_sla(
    input_data JSON
)
RETURNS JSON AS $$
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
        SELECT form_sla_hours FROM form_sla_table 
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
        FROM request_signer_table rst
          INNER JOIN request_table rt ON rt.request_id = rst.request_signer_request_id
          INNER JOIN signer_table st ON st.signer_id = rst.request_signer_signer_id 
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
        FROM request_signer_table rst
          INNER JOIN request_table rt ON rt.request_id = rst.request_signer_request_id
          INNER JOIN signer_table st ON st.signer_id = rst.request_signer_signer_id 
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

-- End: Get signer sla

-- Start: Incident report metrics

CREATE OR REPLACE FUNCTION get_incident_report(
    input_data JSON
)
RETURNS JSON AS $$
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
            ticket_response_table trt
            INNER JOIN ticket_field_table  tft ON tft.ticket_field_id = trt.ticket_response_field_id 
            INNER JOIN ticket_section_table  tst ON tst.ticket_section_id = tft.ticket_field_section_id 
            INNER JOIN ticket_category_table  tct ON tct.ticket_category_id = tst.ticket_section_category_id 
            INNER JOIN ticket_table  tt ON tt.ticket_id = trt.ticket_response_ticket_id 
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
            ticket_response_table trt
            INNER JOIN ticket_field_table tft ON tft.ticket_field_id = trt.ticket_response_field_id 
            INNER JOIN ticket_section_table tst ON tst.ticket_section_id = tft.ticket_field_section_id 
            INNER JOIN ticket_category_table tct ON tct.ticket_category_id = tst.ticket_section_category_id 
            INNER JOIN ticket_table tt ON tt.ticket_id = trt.ticket_response_ticket_id 
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

-- End: Incident report metrics

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

    const ticketCategoryList = plv8.execute(`SELECT * FROM ticket_category_table WHERE ticket_category_is_disabled = false`);

    returnData = {teamMemberList, ticketList: ticketList.data, ticketListCount: ticketList.count, ticketCategoryList}
 });
 return returnData;
$$ LANGUAGE plv8;

-- End: Get ticket list on load

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

    const categoryList = plv8.execute(`SELECT * FROM ticket_category_table WHERE ticket_category_is_disabled = false`);

    returnData = { member, categoryList }
 });
 return returnData;
$$ LANGUAGE plv8;

-- End: Create ticket on load

-- Start: Create custom csi

CREATE OR REPLACE FUNCTION create_custom_csi(
    input_data JSON
)
RETURNS JSON AS $$
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
      FROM csi_code_table
      WHERE 
        csi_code_division_id = '${csi_code_division_id}'
        AND csi_code_level_two_major_group_id = '${csi_code_level_two_major_group_id}'
        AND csi_code_level_two_minor_group_id = '${csi_code_level_two_minor_group_id}';
    `)[0];

    if(referrence){
    const csi = plv8.execute(`
      INSERT INTO csi_code_table (csi_code_section, csi_code_division_id, csi_code_division_description, csi_code_level_two_major_group_id,csi_code_level_two_major_group_description, csi_code_level_two_minor_group_id, csi_code_level_two_minor_group_description, csi_code_level_three_id, csi_code_level_three_description) 
      VALUES ('${csiCode}','${csi_code_division_id}','${referrence.csi_code_division_description}','${csi_code_level_two_major_group_id}','${referrence.csi_code_level_two_major_group_description}','${csi_code_level_two_minor_group_id}','${referrence.csi_code_level_two_minor_group_description}','${csi_code_level_three_id}','${csiCodeDescription}') 
      RETURNING *;
     `)[0];

    const item = plv8.execute(`
      SELECT *
      FROM item_table
      WHERE item_general_name = '${itemName}'
    `)[0];
  
    const itemDivision = plv8.execute(`
      SELECT *
      FROM item_division_table
      WHERE item_division_item_id='${item.item_id}'
      AND item_division_value='${csi_code_division_id}';
    `);

    if(itemDivision.lenght<=0){
     plv8.execute(`
      INSERT INTO item_division_table (item_division_value, item_division_item_id) 
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

-- End: Create custom csi

-- Start: Create ticket

CREATE OR REPLACE FUNCTION create_ticket(
    input_data JSON
)
RETURNS JSON AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      category,
      ticketId,
      teamMemberId,
      responseValues,
    } = input_data;

    const categoryData = plv8.execute(`SELECT * FROM ticket_category_table WHERE ticket_category='${category}' LIMIT 1;`)[0];

    returnData = plv8.execute(`INSERT INTO ticket_table (ticket_id,ticket_requester_team_member_id,ticket_category_id) VALUES ('${ticketId}','${teamMemberId}','${categoryData.ticket_category_id}') RETURNING *;`)[0];

    plv8.execute(`INSERT INTO ticket_response_table (ticket_response_value,ticket_response_duplicatable_section_id,ticket_response_field_id,ticket_response_ticket_id) VALUES ${responseValues};`);
    
 });
 return returnData;
$$ LANGUAGE plv8;

-- End: Create ticket

-- Start: Edit ticket

CREATE OR REPLACE FUNCTION edit_ticket(
    input_data JSON
)
RETURNS JSON AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      ticketId,
      responseValues,
    } = input_data;

    plv8.execute(`DELETE FROM ticket_response_table WHERE ticket_response_ticket_id='${ticketId}';`);
    plv8.execute(`INSERT INTO ticket_response_table (ticket_response_value,ticket_response_duplicatable_section_id,ticket_response_field_id,ticket_response_ticket_id) VALUES ${responseValues};`);
    
 });
 return returnData;
$$ LANGUAGE plv8;

-- End: Create ticket

-- Start: Check custom csi validity

CREATE OR REPLACE FUNCTION check_custom_csi_validity(
    input_data JSON
)
RETURNS JSON AS $$
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
      FROM csi_code_table
      WHERE 
        csi_code_division_id = '${csi_code_division_id}';
    `)[0];
    
    const csiCodeLevelTwoMajorGroupIdExists = plv8.execute(`
      SELECT *
      FROM csi_code_table
      WHERE 
        csi_code_division_id = '${csi_code_division_id}'
        AND csi_code_level_two_major_group_id = '${csi_code_level_two_major_group_id}';
    `)[0];
    
    const csiCodeLevelTwoMinorGroupIdExists = plv8.execute(`
      SELECT *
      FROM csi_code_table
      WHERE 
        csi_code_division_id = '${csi_code_division_id}'
        AND csi_code_level_two_major_group_id = '${csi_code_level_two_major_group_id}'
        AND csi_code_level_two_minor_group_id = '${csi_code_level_two_minor_group_id}';
    `)[0];
    
    const csiCodeLevelThreeIdExists = plv8.execute(`
      SELECT *
      FROM csi_code_table
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

-- End: Check custom csi validity

-- Start: Check if ped part already exists

CREATE OR REPLACE FUNCTION ped_part_check(
  input_data JSON
)
RETURNS BOOLEAN AS $$
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
    
    const equipmentId = plv8.execute(`SELECT equipment_id FROM equipment_table WHERE equipment_name = '${equipmentName}'`)[0].equipment_id;
    const generalNameId = plv8.execute(`SELECT equipment_general_name_id FROM equipment_general_name_table WHERE equipment_general_name = '${partName}'`);
    const brandId = plv8.execute(`SELECT equipment_brand_id FROM equipment_brand_table WHERE equipment_brand = '${brand}'`);
    const modelId = plv8.execute(`SELECT equipment_model_id FROM equipment_model_table WHERE equipment_model = '${model}'`);
    const uomId = plv8.execute(`SELECT equipment_unit_of_measurement_id FROM equipment_unit_of_measurement_table WHERE equipment_unit_of_measurement = '${unitOfMeasure}'`);
    const categoryId = plv8.execute(`SELECT equipment_component_category_id FROM equipment_component_category_table WHERE equipment_component_category = '${category}'`);

    if(generalNameId.length === 0 || brandId.length === 0 || modelId.length === 0 || uomId.length === 0 || categoryId.length === 0) {
      returnData = false;
      return;
    }

    const partData = plv8.execute(
      `
        SELECT * FROM equipment_part_table
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

-- End: Check if ped part already exists

-- Start: Create PED Part from ticket request

CREATE OR REPLACE FUNCTION create_ped_part_from_ticket_request(
  input_data JSON
)
RETURNS VOID AS $$
  plv8.subtransaction(function(){
    const {
      equipmentName,
      partName,
      partNumber,
      brand,
      model,
      unitOfMeasure,
      category,
      teamMemberId,
      teamId
    } = input_data;
    
    const equipmentId = plv8.execute(`SELECT equipment_id FROM equipment_table WHERE equipment_name = '${equipmentName}' AND equipment_is_disabled = false`)[0].equipment_id;
    let generalNameId = plv8.execute(`SELECT equipment_general_name_id FROM equipment_general_name_table WHERE equipment_general_name = '${partName}' AND equipment_general_name_is_disabled = false`);
    let brandId = plv8.execute(`SELECT equipment_brand_id FROM equipment_brand_table WHERE equipment_brand = '${brand}' AND equipment_brand_is_disabled = false`);
    let modelId = plv8.execute(`SELECT equipment_model_id FROM equipment_model_table WHERE equipment_model = '${model}' AND equipment_model_is_disabled = false`);
    let uomId = plv8.execute(`SELECT equipment_unit_of_measurement_id FROM equipment_unit_of_measurement_table WHERE equipment_unit_of_measurement = '${unitOfMeasure}' AND equipment_unit_of_measurement_is_disabled = false`);
    let categoryId = plv8.execute(`SELECT equipment_component_category_id FROM equipment_component_category_table WHERE equipment_component_category = '${category}' AND equipment_component_category_is_disabled = false`);

    if(generalNameId.length === 0){
      generalNameId = plv8.execute(
        `
          INSERT INTO equipment_general_name_table 
          (equipment_general_name, equipment_general_name_team_id, equipment_general_name_encoder_team_member_id) 
          VALUES 
          ('${partName}', '${teamId}', '${teamMemberId}')
          RETURNING *
        `
      );
    }
    if(brandId.length === 0){
      brandId = plv8.execute(
        `
          INSERT INTO equipment_brand_table 
          (equipment_brand, equipment_brand_team_id, equipment_brand_encoder_team_member_id) 
          VALUES 
          ('${brand}', '${teamId}', '${teamMemberId}')
          RETURNING *
        `
      );
    }
    if(modelId.length === 0){
      modelId = plv8.execute(
        `
          INSERT INTO equipment_model_table 
          (equipment_model, equipment_model_team_id, equipment_model_encoder_team_member_id) 
          VALUES 
          ('${model}', '${teamId}', '${teamMemberId}')
          RETURNING *
        `
      );
    }
    if(uomId.length === 0){
      uomId = plv8.execute(
        `
          INSERT INTO equipment_unit_of_measurement_table 
          (equipment_unit_of_measurement, equipment_unit_of_measurement_team_id, equipment_unit_of_measurement_encoder_team_member_id) 
          VALUES 
          ('${unitOfMeasure}', '${teamId}', '${teamMemberId}')
          RETURNING *
        `
      );
    }
    if(categoryId.length === 0){
      categoryId = plv8.execute(
        `
          INSERT INTO equipment_component_category_table 
          (equipment_component_category, equipment_component_category_team_id, equipment_component_category_encoder_team_member_id) 
          VALUES 
          ('${category}', '${teamId}', '${teamMemberId}')
          RETURNING *
        `
      );
    }

    const formattedPartNumber = partNumber.replace('/[^a-zA-Z0-9]/g', '');
    const partData = plv8.execute(
      `
        SELECT * FROM equipment_part_table
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
        INSERT INTO equipment_part_table
          (equipment_part_number, equipment_part_general_name_id, equipment_part_brand_id, equipment_part_model_id, equipment_part_unit_of_measurement_id, equipment_part_component_category_id, equipment_part_equipment_id, equipment_part_encoder_team_member_id)
        VALUES
          ('${partNumber}', '${generalNameId[0].equipment_general_name_id}', '${brandId[0].equipment_brand_id}', '${modelId[0].equipment_model_id}', '${uomId[0].equipment_unit_of_measurement_id}', '${categoryId[0].equipment_component_category_id}', '${equipmentId}', '${teamMemberId}')
      `
    );
 });
$$ LANGUAGE plv8;

-- End: Create PED Part from ticket request

-- Start: Create user valid id

CREATE OR REPLACE FUNCTION create_user_valid_id(
    input_data JSON
)
RETURNS JSON AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      user_valid_id_user_id,
      user_valid_id_type,
      user_valid_id_number,
      user_valid_id_first_name,
      user_valid_id_middle_name,
      user_valid_id_last_name,
      user_valid_id_gender,
      user_valid_id_nationality,
      user_valid_id_status,
      user_valid_id_front_image_url,
      user_valid_id_back_image_url,
      address_region,
      address_province,
      address_city,
      address_barangay,
      address_street,
      address_zip_code,
    } = input_data;

    const addressData = plv8.execute(
      `
        INSERT INTO address_table 
          (address_region, address_province, address_city, address_barangay, address_street, address_zip_code)
        VALUES
          ('${address_region}', '${address_province}', '${address_city}', '${address_barangay}', '${address_street}', '${address_zip_code}')
        RETURNING *
      `
    )[0];

    const userValidIdData = plv8.execute(
      `
        INSERT INTO user_valid_id_table
          (
            user_valid_id_number, 
            user_valid_id_type, 
            user_valid_id_first_name, 
            user_valid_id_middle_name, 
            user_valid_id_last_name, 
            user_valid_id_gender, 
            user_valid_id_nationality, 
            user_valid_id_front_image_url, 
            user_valid_id_back_image_url, 
            user_valid_id_status, 
            user_valid_id_user_id, 
            user_valid_id_address_id
          )
        VALUES
          (
            '${user_valid_id_number}',
            '${user_valid_id_type}',
            '${user_valid_id_first_name}',
            '${user_valid_id_middle_name}',
            '${user_valid_id_last_name}',
            '${user_valid_id_gender}',
            '${user_valid_id_nationality}',
            '${user_valid_id_front_image_url}',
            '${user_valid_id_back_image_url}',
            '${user_valid_id_status}',
            '${user_valid_id_user_id}',
            '${addressData.address_id}'
          )
        RETURNING *
      `
    )[0];

    returnData = {
      ...addressData,
      ...userValidIdData
    }
 });
 return returnData;
$$ LANGUAGE plv8;

-- End: Create user valid id

-- Start: Check if ped part already exists

CREATE OR REPLACE FUNCTION check_ped_part(
  input_data JSON
)
RETURNS BOOLEAN AS $$
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
        FROM equipment_part_table 
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

-- End: Check if ped part already exists

-- Start: Get request without duplictable section

CREATE OR REPLACE FUNCTION get_request_without_duplicatable_section(
  request_id TEXT
)
RETURNS JSON as $$
  let returnData;
  plv8.subtransaction(function(){
    const idCondition = plv8.execute(`SELECT generate_request_id_condition('${request_id}')`)[0].generate_request_id_condition;

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

    const isWithConditionalFields = requestData.form_is_formsly_form && ["Item", "Subcon", "PED Item", "IT Asset", "Liquidation/Reimbursement"].includes(requestData.form_name);

    const sectionData = plv8.execute(
      `
        SELECT *
        FROM section_table
        WHERE section_form_id = '${requestData.form_id}'
        ORDER BY section_order ASC
      `
    );

    const formSection = sectionData.map((section, index) => {
      if (index === 0 || (index === 2 && requestData.form_name === "IT Asset")) {
        const fieldData = plv8.execute(
          `
            SELECT *
            FROM field_table
            WHERE field_section_id = '${section.section_id}'
            ORDER BY field_order ASC
          `
        );

        fieldWithOptionAndResponse = fieldData.map(field => {
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
              FROM field_table
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
        FROM request_signer_table
        INNER JOIN signer_table ON signer_id = request_signer_signer_id
        INNER JOIN team_member_table ON team_member_id = signer_team_member_id
        INNER JOIN user_table ON user_id = team_member_user_id
        LEFT JOIN attachment_table on attachment_id = user_signature_attachment_id
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

-- End: Get request without duplictable section

-- Start: Fetch request page section

CREATE OR REPLACE FUNCTION fetch_request_page_section(
  input_data JSON
)
RETURNS JSON AS $$
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
    FROM request_table
    INNER JOIN team_member_table ON team_member_id = request_team_member_id
    WHERE request_id = '${requestId}'
    LIMIT 1
  `)[0].team_member_team_id;


  if (!teamId) throw new Error("No team found");

  if (!fieldData) {
    const fieldList = plv8.execute(`
      SELECT DISTINCT field_table.*
      FROM field_table
      INNER JOIN request_response_table ON request_response_field_id = field_id
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
        FROM request_response_table
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
                FROM team_member_table 
                INNER JOIN user_table ON user_id = team_member_user_id 
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
                FROM csi_code_table LIMIT 1000
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
            FROM option_table
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
        FROM request_response_table
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
          FROM option_table
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


-- End: Fetch request page section

-- Start: Generate request id condition

CREATE OR REPLACE FUNCTION generate_request_id_condition(
  request_id TEXT
)
RETURNS TEXT AS $$
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

-- End: Generate request id condition

-- Start: Fetch request comment

CREATE OR REPLACE FUNCTION fetch_request_comment(
  request_id TEXT
)
RETURNS JSON AS $$
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
        FROM comment_table 
        INNER JOIN team_member_table ON team_member_id = comment_team_member_id
        INNER JOIN user_table ON user_id = team_member_user_id
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

-- End: Fetch request comment

-- Start: Public request page on load

CREATE OR REPLACE FUNCTION public_request_page_on_load(
  input_data JSON
)
RETURNS JSON as $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      requestId
    } = input_data;

    const idCondition = plv8.execute(`SELECT generate_request_id_condition('${requestId}')`)[0].generate_request_id_condition;

    const request = plv8.execute(
      `
        SELECT 
          form_is_formsly_form, 
          form_name
        FROM request_view
        INNER JOIN form_table ON form_id = request_form_id
        WHERE 
          ${idCondition}
          AND request_is_disabled = false
      `
    )[0];

    if (!request.form_is_formsly_form || (request.form_is_formsly_form && request.form_name === "Subcon") || request.form_is_formsly_form && request.form_name === "Request For Payment") {
      const requestData = plv8.execute(`SELECT get_request('${requestId}')`)[0].get_request;
      if(!request) throw new Error('404');
      returnData = {
        request: requestData
      };
      return;
    } else {
      const requestData = plv8.execute(`SELECT get_request_without_duplicatable_section('${requestId}')`)[0].get_request_without_duplicatable_section;
      if(!request) throw new Error('404');

      const duplicatableSectionIdList = plv8.execute(
        `
          SELECT DISTINCT(request_response_duplicatable_section_id)
          FROM request_response_table
          WHERE 
            request_response_request_id = '${requestData.request_id}'
            AND request_response_duplicatable_section_id IS NOT NULL
        `
      ).map(response => response.request_response_duplicatable_section_id);

      returnData =  {
        request: requestData,
        duplicatableSectionIdList
      };
    }
 });
 return returnData;
$$ LANGUAGE plv8;

-- End: Public request page on load

-- Start: Fetch item request conditional options

CREATE OR REPLACE FUNCTION fetch_item_request_conditional_options(
  input_data JSON
)
RETURNS JSON as $$
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
          FROM item_table AS it
          INNER JOIN item_category_table AS ict ON it.item_category_id = ict.item_category_id
          INNER JOIN signer_table ON signer_id = item_category_signer_id
          INNER JOIN team_member_table ON team_member_id = signer_team_member_id
          INNER JOIN user_table ON user_id = team_member_user_id
          WHERE
            it.item_general_name = '${section.itemName}'
            AND it.item_is_disabled = false
            AND ict.item_category_is_disabled = false
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
                FROM item_table
                LEFT JOIN item_division_table ON item_division_item_id = item_id
                LEFT JOIN csi_code_table ON csi_code_division_id = item_division_value
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
                FROM item_table
                INNER JOIN item_description_table ON item_description_item_id = item_id
                INNER JOIN field_table ON field_id = item_description_field_id
                INNER JOIN item_description_field_table AS idft ON idft.item_description_field_item_description_id = item_description_id
                LEFT JOIN item_description_field_uom_table ON item_description_field_uom_item_description_field_id = idft.item_description_field_id
                WHERE
                  item_general_name = '${section.itemName}'
                  AND field_id = '${field}'
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

-- End: Fetch item request conditional options

-- Start: Fetch service request conditional options

CREATE OR REPLACE FUNCTION fetch_service_request_conditional_options(
  input_data JSON
)
RETURNS JSON as $$
  let returnData = [];
  plv8.subtransaction(function(){
    const {
      sectionList
    } = input_data;

    returnData = sectionList.map(section => {
      return {
        csiDivision: section.csiDivision,
        fieldList: section.fieldIdList.map(field => {
          let optionData = [];
      
          const csiCodeData = plv8.execute(
            `
              SELECT
                csi_code_id,
                csi_code_level_three_description
              FROM csi_code_table
              WHERE
                csi_code_division_description = '${section.csiDivision}'
            `
          );

          optionData = csiCodeData.map((options, index) => {
            return {
              option_field_id: field,
              option_id: options.csi_code_id,
              option_order: index + 1,
              option_value: options.csi_code_level_three_description
            }

          });
          
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

-- End: Fetch service request conditional options

-- Start: Fetch other expenses request conditional options

CREATE OR REPLACE FUNCTION fetch_other_expenses_request_conditional_options(
  input_data JSON
)
RETURNS JSON as $$
  let returnData = [];
  plv8.subtransaction(function(){
    const {
      sectionList
    } = input_data;

    returnData = sectionList.map(section => {
      return {
        category: section.category,
        fieldList: section.fieldIdList.map(field => {
          let optionData = [];
      
          const csiCodeData = plv8.execute(
            `
              SELECT
                other_expenses_type_id,
                other_expenses_type
              FROM other_expenses_category_table
              INNER JOIN other_expenses_type_table ON other_expenses_type_category_id = other_expenses_category_id
              WHERE
                other_expenses_category = '${section.category}'
                AND other_expenses_type_is_available = true
                AND other_expenses_type_is_disabled = false
                AND other_expenses_category_is_disabled = false
                AND other_expenses_category_is_available = true
            `
          );

          optionData = csiCodeData.map((options, index) => {
            return {
              option_field_id: field,
              option_id: options.other_expenses_type_id,
              option_order: index + 1,
              option_value: options.other_expenses_type
            }

          });
          
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

-- End: Fetch other expenses request conditional options

-- Start: Fetch ped equipment request conditional options

CREATE OR REPLACE FUNCTION fetch_ped_equipment_request_conditional_options(
  input_data JSON
)
RETURNS JSON as $$
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
                FROM equipment_table
                INNER JOIN equipment_category_table ON equipment_equipment_category_id = equipment_category_id
                WHERE
                  equipment_category = '${section.category}'
                  AND equipment_is_disabled = false
                  AND equipment_is_available = true
                  AND equipment_category_is_disabled = false
                  AND equipment_category_is_available = true
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
                FROM equipment_table
                INNER JOIN equipment_category_table ON equipment_equipment_category_id = equipment_category_id
                INNER JOIN equipment_description_table ON equipment_description_equipment_id = equipment_id
                INNER JOIN equipment_brand_table ON equipment_brand_id = equipment_description_brand_id
                WHERE
                  equipment_category = '${section.category}'
                  AND equipment_is_disabled = false
                  AND equipment_is_available = true
                  AND equipment_category_is_disabled = false
                  AND equipment_category_is_available = true
                  AND equipment_description_is_disabled = false
                  AND equipment_description_is_available = true
                  AND equipment_brand_is_disabled = false
                  AND equipment_brand_is_available = true
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
              option_id: plv8.execute('SELECT uuid_generate_v4()')[0].uuid_generate_v4,
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
                FROM equipment_table
                INNER JOIN equipment_category_table ON equipment_equipment_category_id = equipment_category_id
                INNER JOIN equipment_description_table ON equipment_description_equipment_id = equipment_id
                INNER JOIN equipment_brand_table ON equipment_brand_id = equipment_description_brand_id
                INNER JOIN equipment_model_table ON equipment_model_id = equipment_description_model_id
                WHERE
                  equipment_category = '${section.category}'
                  AND equipment_is_disabled = false
                  AND equipment_is_available = true
                  AND equipment_category_is_disabled = false
                  AND equipment_category_is_available = true
                  AND equipment_description_is_disabled = false
                  AND equipment_description_is_available = true
                  AND equipment_brand_is_disabled = false
                  AND equipment_brand_is_available = true
                  AND equipment_brand = '${section.brand}'
                  AND equipment_brand_is_disabled = false
                  AND equipment_brand_is_available = true
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
              option_id: plv8.execute('SELECT uuid_generate_v4()')[0].uuid_generate_v4,
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

-- End: Fetch ped equipment request conditional options

-- Start: Create item category

CREATE OR REPLACE FUNCTION create_item_category(
  input_data JSON
)
RETURNS VOID AS $$
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
        SELECT signer_id FROM signer_table 
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
          INSERT INTO signer_table 
          (signer_is_primary_signer, signer_action, signer_order, signer_is_disabled, signer_form_id, signer_team_member_id, signer_team_project_id)
          VALUES
          (false, 'Approved', 5, true, '${formId}', '${teamMemberId}', null)
          RETURNING signer_id
        `
      )[0]; 
    }

    plv8.execute(
      `
        INSERT INTO item_category_table 
        (item_category, item_category_signer_id)
        VALUES
        ('${category}', '${signerData.signer_id}')
      `
    );
 });
$$ LANGUAGE plv8;

-- End: Create item category

-- Start: Update item category

CREATE OR REPLACE FUNCTION update_item_category(
  input_data JSON
)
RETURNS VOID AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      category,
      teamMemberId,
      categoryId
    } = input_data;
    
    let signerData;
    signerData = plv8.execute(
      `
        SELECT signer_id FROM signer_table 
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
          INSERT INTO signer_table 
          (signer_is_primary_signer, signer_action, signer_order, signer_is_disabled, signer_form_id, signer_team_member_id, signer_team_project_id)
          VALUES
          (false, 'Approved', 5, true, '${formId}', '${teamMemberId}', null)
          RETURNING signer_id
        `
      )[0]; 
    }

    plv8.execute(`UPDATE item_category_table SET item_category = '${category}', item_category_signer_id = '${signerData.signer_id}' WHERE item_category_id = '${categoryId}'`);
 });
$$ LANGUAGE plv8;

-- End: Update item category

-- Start: Get Jira automation data
CREATE OR REPLACE FUNCTION get_jira_automation_data(
    input_data JSON
)
RETURNS JSON AS $$
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
            jira_formsly_project_table jfpt
        LEFT JOIN
            jira_project_table jpt ON jpt.jira_project_id = jfpt.jira_project_id
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
          jira_project_user_table jira_project_user_team_project_id
        LEFT JOIN
          jira_user_account_table jua ON jua.jira_user_account_id = jira_project_user_account_id
        LEFT JOIN
          jira_user_role_table jur ON jur.jira_user_role_id = jira_project_user_role_id
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
          jira_item_category_table
        LEFT JOIN jira_item_user_table jiu ON jiu.jira_item_user_item_category_id = jira_item_category_id
        LEFT JOIN jira_user_account_table jua ON jua.jira_user_account_id = jiu.jira_item_user_account_id
        LEFT JOIN jira_user_role_table jur ON jur.jira_user_role_id= jiu.jira_item_user_role_id
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
          jira_organization_team_project_table
        INNER JOIN jira_organization_table jot ON jot.jira_organization_id = jira_organization_team_project_organization_id
        WHERE
          jira_organization_team_project_project_id = '${teamProjectId}'
      `
    )

    jira_automation_data = {jiraProjectData, jiraItemCategoryData, jiraOrganizationData: jiraOrganizationData[0]}
 });
 return jira_automation_data;
$$ LANGUAGE plv8;
-- End: Get Jira automation data

-- Start: Get approver unresolved request count
CREATE OR REPLACE FUNCTION get_approver_unresolved_request_count(
    input_data JSON
)
RETURNS JSON AS $$
  let data;
  plv8.subtransaction(function() {
    const {
      teamMemberId
    } = input_data;

    const getCount = (status, jiraIdCondition) => {
      return plv8.execute(`
        SELECT COUNT(*) 
        FROM request_signer_table 
        INNER JOIN signer_table ON signer_id = request_signer_signer_id 
        INNER JOIN request_table ON request_id = request_signer_request_id 
        WHERE 
          signer_team_member_id = '${teamMemberId}' 
          AND request_signer_status = '${status}'
          AND request_is_disabled = false
          AND request_status != 'CANCELED'
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
-- End: Get approver unresolved request count

-- Start: Get ticket list on load

CREATE OR REPLACE FUNCTION get_admin_ticket_analytics(
  input_data JSON
)
RETURNS JSON AS $$
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
          SELECT COUNT(ticket_id)
          FROM ticket_table
          WHERE
            ticket_status = 'CLOSED'
            ${condition}
        `
      )[0].count;
      const underReviewCount = plv8.execute(
        `
          SELECT COUNT(ticket_id)
          FROM ticket_table
          WHERE
            ticket_status = 'UNDER REVIEW'
            ${condition}
        `
      )[0].count;
      const incorrectCount = plv8.execute(
        `
          SELECT COUNT(ticket_id)
          FROM ticket_table
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

-- End: Get ticket list on load

-- Start: Handle formsly payment

CREATE OR REPLACE FUNCTION handle_formsly_payment(
  input_data JSON
)
RETURNS VOID AS $$
  plv8.subtransaction(function(){
    const {
      teamId,
      newExpiryDate,
      numberOfMonths,
      price
    } = input_data;
    const existingData = plv8.execute(
      `
        SELECT * FROM team_transaction_table
        WHERE
          team_transaction_price = ${price}
          AND team_transaction_number_of_months = ${numberOfMonths}
          AND team_transaction_team_expiration_date = '${newExpiryDate}'
          AND team_transaction_team_id = '${teamId}'
      `
    );
    if(existingData.lenght) return;
    
    plv8.execute(`
      INSERT INTO team_transaction_table
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

-- End: Handle formsly payment

-- Start: Team invoice onload

CREATE OR REPLACE FUNCTION team_invoice_on_load(
  input_data JSON
)
RETURNS JSON AS $$
  let returnData;
  plv8.subtransaction(function(){
    const {
      teamId,
      teamDateCreated,
      userId
    } = input_data;
   
    const currentDate = plv8.execute(`SELECT get_current_date()`)[0].get_current_date.toLocaleDateString();
    let expirationDate = teamDateCreated;

    const latestTransaction = plv8.execute(
      `
        SELECT team_transaction_team_expiration_date 
        FROM team_transaction_table 
        WHERE 
          team_transaction_team_id = '${teamId}'
        ORDER BY team_transaction_date_created DESC
        LIMIT 1
      `
    );

    const price = plv8.execute(`SELECT formsly_price FROM formsly_price_table ORDER BY formsly_price_date_created DESC LIMIT 1`)[0].formsly_price;

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

-- End: Handle formsly payment

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
ALTER TABLE user_employee_number_table ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE user_valid_id_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE other_expenses_category_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE other_expenses_type_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_unit_of_measurement_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_level_three_description_table  ENABLE ROW LEVEL SECURITY;
ALTER TABLE memo_format_section_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE memo_format_subsection_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE memo_format_attachment_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE query_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_sla_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE csi_code_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_category_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_section_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_field_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_option_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_response_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_category_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_brand_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_model_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_component_category_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_description_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_unit_of_measurement_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_general_name_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_part_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE capacity_unit_of_measurement_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE address_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE jira_project_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE jira_formsly_project_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE jira_user_role_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE jira_user_account_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE jira_project_user_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE jira_item_category_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE jira_item_user_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_department_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE jira_organization_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE jira_organization_team_project_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_job_title_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE scic_employee_table ENABLE ROW LEVEL SECURITY;

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

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON item_division_table;
DROP POLICY IF EXISTS "Allow READ access for anon users" ON item_division_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON item_division_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON item_division_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON item_description_field_uom_table;
DROP POLICY IF EXISTS "Allow READ access for anon users" ON item_description_field_uom_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON item_description_field_uom_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON item_description_field_uom_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users" ON user_employee_number_table;
DROP POLICY IF EXISTS "Allow READ for anon users" ON user_employee_number_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users based on user_id" ON user_employee_number_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users based on user_id" ON user_employee_number_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users" ON user_name_history_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users" ON signature_history_table;
DROP POLICY IF EXISTS "Enable read access for all users" ON signature_history_table;

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

DROP POLICY IF EXISTS "Allow CREATE access for all users" ON user_valid_id_table;
DROP POLICY IF EXISTS "Allow READ for anon users" ON user_valid_id_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON user_valid_id_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON other_expenses_category_table;
DROP POLICY IF EXISTS "Allow READ for anon users" ON other_expenses_category_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON other_expenses_category_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON other_expenses_category_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON other_expenses_type_table;
DROP POLICY IF EXISTS "Allow READ for anon users" ON other_expenses_type_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON other_expenses_type_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON other_expenses_type_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON item_unit_of_measurement_table;
DROP POLICY IF EXISTS "Allow READ for anon users" ON item_unit_of_measurement_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON item_unit_of_measurement_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON item_unit_of_measurement_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON item_level_three_description_table;
DROP POLICY IF EXISTS "Allow READ access for anon users" ON item_level_three_description_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON item_level_three_description_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON item_level_three_description_table;

DROP POLICY IF EXISTS "Allow CRUD for auth users" ON memo_format_section_table;
DROP POLICY IF EXISTS "Allow CRUD for auth users" ON memo_format_subsection_table;
DROP POLICY IF EXISTS "Allow CRUD for auth users" ON memo_format_attachment_table;

DROP POLICY IF EXISTS "Allow READ for anon users" ON query_table;

DROP POLICY IF EXISTS "Allow CREATE access for all users" ON form_sla_table;
DROP POLICY IF EXISTS "Allow READ for anon users" ON form_sla_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON form_sla_table;

DROP POLICY IF EXISTS "Allow CREATE access for all users" ON csi_code_table;
DROP POLICY IF EXISTS "Allow READ access for anon users" ON csi_code_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON csi_code_table;

DROP POLICY IF EXISTS "Allow CREATE access for all users" ON ticket_category_table;
DROP POLICY IF EXISTS "Allow READ access for anon users" ON ticket_category_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON ticket_category_table;

DROP POLICY IF EXISTS "Allow CREATE access for all users" ON ticket_section_table;
DROP POLICY IF EXISTS "Allow READ access for anon users" ON ticket_section_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON ticket_section_table;

DROP POLICY IF EXISTS "Allow CREATE access for all users" ON ticket_field_table;
DROP POLICY IF EXISTS "Allow READ access for anon users" ON ticket_field_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON ticket_field_table;

DROP POLICY IF EXISTS "Allow CREATE access for all users" ON ticket_option_table;
DROP POLICY IF EXISTS "Allow READ access for anon users" ON ticket_option_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON ticket_option_table;

DROP POLICY IF EXISTS "Allow CREATE access for all users" ON ticket_response_table;
DROP POLICY IF EXISTS "Allow READ access for anon users" ON ticket_response_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON ticket_response_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users" ON ticket_response_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON equipment_category_table;
DROP POLICY IF EXISTS "Allow READ access for anon users" ON equipment_category_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON equipment_category_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON equipment_category_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON equipment_brand_table;
DROP POLICY IF EXISTS "Allow READ access for anon users" ON equipment_brand_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON equipment_brand_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON equipment_brand_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON equipment_model_table;
DROP POLICY IF EXISTS "Allow READ access for anon users" ON equipment_model_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON equipment_model_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON equipment_model_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON equipment_component_category_table;
DROP POLICY IF EXISTS "Allow READ access for anon users" ON equipment_component_category_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON equipment_component_category_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON equipment_component_category_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON equipment_table;
DROP POLICY IF EXISTS "Allow READ access for anon users" ON equipment_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON equipment_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON equipment_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON equipment_description_table;
DROP POLICY IF EXISTS "Allow READ access for anon users" ON equipment_description_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON equipment_description_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON equipment_description_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON equipment_unit_of_measurement_table;
DROP POLICY IF EXISTS "Allow READ access for anon users" ON equipment_unit_of_measurement_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON equipment_unit_of_measurement_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON equipment_unit_of_measurement_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON equipment_general_name_table;
DROP POLICY IF EXISTS "Allow READ access for anon users" ON equipment_general_name_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON equipment_general_name_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON equipment_general_name_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON equipment_part_table;
DROP POLICY IF EXISTS "Allow READ access for anon users" ON equipment_part_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON equipment_part_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON equipment_part_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON capacity_unit_of_measurement_table;
DROP POLICY IF EXISTS "Allow READ access for anon users" ON capacity_unit_of_measurement_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON capacity_unit_of_measurement_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON capacity_unit_of_measurement_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users" ON address_table;
DROP POLICY IF EXISTS "Allow READ for authenticated users" ON address_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON address_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users" ON address_table;

DROP POLICY IF EXISTS "Allow CRUD for authenticated users" ON jira_project_table;
DROP POLICY IF EXISTS "Allow READ for anon users" ON jira_formsly_project_table;
DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON jira_formsly_project_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON jira_formsly_project_table;
DROP POLICY IF EXISTS "Allow CRUD for authenticated users" ON jira_user_role_table;
DROP POLICY IF EXISTS "Allow CRUD for authenticated users" ON jira_user_account_table;
DROP POLICY IF EXISTS "Allow READ for anon users" ON jira_project_user_table;
DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON jira_project_user_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON jira_project_user_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON jira_project_user_table;
DROP POLICY IF EXISTS "Allow CRUD for authenticated users" ON jira_item_category_table;
DROP POLICY IF EXISTS "Allow CRUD for authenticated users" ON jira_item_user_table;

DROP POLICY IF EXISTS "Allow READ for anon users" ON team_department_table;
DROP POLICY IF EXISTS "Allow CRUD for authenticated users" ON jira_organization_table;
DROP POLICY IF EXISTS "Allow READ for anon users" ON jira_organization_team_project_table;
DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON jira_organization_team_project_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON jira_organization_team_project_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON jira_organization_team_project_table;

DROP POLICY IF EXISTS "Allow READ for anon users" ON employee_job_title_table;
DROP POLICY IF EXISTS "Allow READ for anon users" ON scic_employee_table;

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

CREATE POLICY "Enable read access for all users" ON "public"."signature_history_table"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

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

--- USER_VALID_ID_TABLE

CREATE POLICY "Allow CREATE access for all users" ON "public"."user_valid_id_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow READ for anon users" ON "public"."user_valid_id_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users" ON "public"."user_valid_id_table"
AS PERMISSIVE FOR UPDATE
TO authenticated 
USING(true)
WITH CHECK (true);

--- other_expenses_category_table
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON "public"."other_expenses_category_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM team_table
    JOIN team_member_table ON team_member_team_id = team_id
    WHERE other_expenses_category_team_id = team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow READ access for anon users" ON "public"."other_expenses_category_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON "public"."other_expenses_category_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM team_table
    JOIN team_member_table ON team_member_team_id = team_id
    WHERE other_expenses_category_team_id = team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON "public"."other_expenses_category_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM other_expenses_category_table
    JOIN team_table ON other_expenses_category_team_id = team_id
    JOIN team_member_table ON team_member_team_id = team_id
    WHERE other_expenses_category_team_id = team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- other_expenses_type_table
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON "public"."other_expenses_type_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM other_expenses_category_table
    JOIN team_table ON team_id = other_expenses_category_team_id
    JOIN team_member_table ON team_member_team_id = team_id
    WHERE other_expenses_category_team_id = team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow READ access for anon users" ON "public"."other_expenses_type_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON "public"."other_expenses_type_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM other_expenses_category_table
    JOIN team_table ON team_id = other_expenses_category_team_id
    JOIN team_member_table ON team_member_team_id = team_id
    WHERE other_expenses_category_team_id = team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON "public"."other_expenses_type_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM other_expenses_category_table
    JOIN team_table ON team_id = other_expenses_category_team_id
    JOIN team_member_table ON team_member_team_id = team_id
    WHERE other_expenses_category_team_id = team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- item_unit_of_measurement_table
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON "public"."item_unit_of_measurement_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM team_table
    JOIN team_member_table ON team_member_team_id = team_id
    WHERE item_unit_of_measurement_team_id = team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow READ access for anon users" ON "public"."item_unit_of_measurement_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON "public"."item_unit_of_measurement_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM team_table
    JOIN team_member_table ON team_member_team_id = team_id
    WHERE item_unit_of_measurement_team_id = team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON "public"."item_unit_of_measurement_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM team_table
    JOIN team_member_table ON team_member_team_id = team_id
    WHERE item_unit_of_measurement_team_id = team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- ITEM_LEVEL_THREE_DESCRIPTION
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON "public"."item_level_three_description_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM item_table as it
    JOIN team_table as tt ON tt.team_id = it.item_team_id
    JOIN team_member_table as tm ON tm.team_member_team_id = tt.team_id
    WHERE it.item_id = item_level_three_description_item_id
    AND tm.team_member_user_id = auth.uid()
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow READ access for anon users" ON "public"."item_level_three_description_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON "public"."item_level_three_description_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM item_table as it
    JOIN team_table as tt ON tt.team_id = it.item_team_id
    JOIN team_member_table as tm ON tm.team_member_team_id = tt.team_id
    WHERE it.item_id = item_level_three_description_item_id
    AND tm.team_member_user_id = auth.uid()
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON "public"."item_level_three_description_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM item_table as it
    JOIN team_table as tt ON tt.team_id = it.item_team_id
    JOIN team_member_table as tm ON tm.team_member_team_id = tt.team_id
    WHERE it.item_id = item_level_three_description_item_id
    AND tm.team_member_user_id = auth.uid()
    AND tm.team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow CRUD for auth users" ON "public"."memo_format_section_table"
AS PERMISSIVE FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow CRUD for auth users" ON "public"."memo_format_subsection_table"
AS PERMISSIVE FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow CRUD for auth users" ON "public"."memo_format_attachment_table"
AS PERMISSIVE FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

--- QUERY_TABLE

CREATE POLICY "Allow READ for anon users" ON "public"."query_table"
AS PERMISSIVE FOR SELECT
USING (true);

--- FORM_SLA_TABLE

CREATE POLICY "Allow CREATE access for all users" ON "public"."form_sla_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow READ for anon users" ON "public"."form_sla_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users" ON "public"."form_sla_table"
AS PERMISSIVE FOR UPDATE
TO authenticated 
USING(true)
WITH CHECK (true);

--- CSI_CODE_TABLE

CREATE POLICY "Allow CREATE access for all users" ON "public"."csi_code_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow READ access for anon users" ON "public"."csi_code_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users" ON "public"."csi_code_table"
AS PERMISSIVE FOR UPDATE
TO authenticated 
USING(true)
WITH CHECK (true);

--- TICKET_CATEGORY_TABLE

CREATE POLICY "Allow CREATE access for all users" ON "public"."ticket_category_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow READ access for anon users" ON "public"."ticket_category_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users" ON "public"."ticket_category_table"
AS PERMISSIVE FOR UPDATE
TO authenticated 
USING(true)
WITH CHECK (true);

--- TICKET_SECTION_TABLE

CREATE POLICY "Allow CREATE access for all users" ON "public"."ticket_section_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow READ access for anon users" ON "public"."ticket_section_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users" ON "public"."ticket_section_table"
AS PERMISSIVE FOR UPDATE
TO authenticated 
USING(true)
WITH CHECK (true);

--- TICKET_FIELD_TABLE

CREATE POLICY "Allow CREATE access for all users" ON "public"."ticket_field_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow READ access for anon users" ON "public"."ticket_field_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users" ON "public"."ticket_field_table"
AS PERMISSIVE FOR UPDATE
TO authenticated 
USING(true)
WITH CHECK (true);

--- TICKET_OPTION_TABLE

CREATE POLICY "Allow CREATE access for all users" ON "public"."ticket_option_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow READ access for anon users" ON "public"."ticket_option_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users" ON "public"."ticket_option_table"
AS PERMISSIVE FOR UPDATE
TO authenticated 
USING(true)
WITH CHECK (true);

--- TICKET_RESPONSE_TABLE

CREATE POLICY "Allow CREATE access for all users" ON "public"."ticket_response_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow READ access for anon users" ON "public"."ticket_response_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users" ON "public"."ticket_response_table"
AS PERMISSIVE FOR UPDATE
TO authenticated 
USING(true)
WITH CHECK (true);

CREATE POLICY "Allow DELETE for authenticated users" ON "public"."ticket_response_table"
AS PERMISSIVE FOR DELETE
TO authenticated 
USING(true);

--- EQUIPMENT_CATEGORY_TABLE
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON "public"."equipment_category_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM team_member_table
    WHERE team_member_team_id = equipment_category_team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow READ access for anon users" ON "public"."equipment_category_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON "public"."equipment_category_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_member_table
    WHERE team_member_team_id = equipment_category_team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON "public"."equipment_category_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_member_table
    WHERE team_member_team_id = equipment_category_team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- EQUIPMENT_BRAND_TABLE
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON "public"."equipment_brand_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM team_member_table
    WHERE team_member_team_id = equipment_brand_team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow READ access for anon users" ON "public"."equipment_brand_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON "public"."equipment_brand_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_member_table
    WHERE team_member_team_id = equipment_brand_team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON "public"."equipment_brand_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_member_table
    WHERE team_member_team_id = equipment_brand_team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- EQUIPMENT_MODEL_TABLE
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON "public"."equipment_model_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM team_member_table
    WHERE team_member_team_id = equipment_model_team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow READ access for anon users" ON "public"."equipment_model_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON "public"."equipment_model_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_member_table
    WHERE team_member_team_id = equipment_model_team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON "public"."equipment_model_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_member_table
    WHERE team_member_team_id = equipment_model_team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- EQUIPMENT_COMPONENT_CATEGORY_TABLE
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON "public"."equipment_component_category_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM team_member_table
    WHERE team_member_team_id = equipment_component_category_team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow READ access for anon users" ON "public"."equipment_component_category_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON "public"."equipment_component_category_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_member_table
    WHERE team_member_team_id = equipment_component_category_team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON "public"."equipment_component_category_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_member_table
    WHERE team_member_team_id = equipment_component_category_team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- EQUIPMENT_TABLE
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON "public"."equipment_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM team_member_table
    WHERE team_member_team_id = equipment_team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow READ access for anon users" ON "public"."equipment_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON "public"."equipment_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_member_table
    WHERE team_member_team_id = equipment_team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON "public"."equipment_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_member_table
    WHERE team_member_team_id = equipment_team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- EQUIPMENT_DESCRIPTION_TABLE
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON "public"."equipment_description_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM equipment_table
    INNER JOIN team_table ON team_id = equipment_team_id
    INNER JOIN team_member_table ON team_member_team_id = team_id
    WHERE equipment_id = equipment_description_equipment_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow READ access for anon users" ON "public"."equipment_description_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON "public"."equipment_description_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM equipment_table
    INNER JOIN team_table ON team_id = equipment_team_id
    INNER JOIN team_member_table ON team_member_team_id = team_id
    WHERE equipment_id = equipment_description_equipment_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON "public"."equipment_description_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM equipment_table
    INNER JOIN team_table ON team_id = equipment_team_id
    INNER JOIN team_member_table ON team_member_team_id = team_id
    WHERE equipment_id = equipment_description_equipment_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- EQUIPMENT_UNIT_OF_MEASUREMENT_TABLE
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON "public"."equipment_unit_of_measurement_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM team_member_table
    WHERE team_member_team_id = equipment_unit_of_measurement_team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow READ access for anon users" ON "public"."equipment_unit_of_measurement_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON "public"."equipment_unit_of_measurement_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_member_table
    WHERE team_member_team_id = equipment_unit_of_measurement_team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON "public"."equipment_unit_of_measurement_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_member_table
    WHERE team_member_team_id = equipment_unit_of_measurement_team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- EQUIPMENT_GENERAL_NAME_TABLE
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON "public"."equipment_general_name_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM team_member_table
    WHERE team_member_team_id = equipment_general_name_team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow READ access for anon users" ON "public"."equipment_general_name_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON "public"."equipment_general_name_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_member_table
    WHERE team_member_team_id = equipment_general_name_team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON "public"."equipment_general_name_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_member_table
    WHERE team_member_team_id = equipment_general_name_team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- EQUIPMENT_PART_TABLE
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON "public"."equipment_part_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM equipment_table
    INNER JOIN team_table ON team_id = equipment_team_id
    INNER JOIN team_member_table ON team_member_team_id = team_id
    WHERE equipment_id = equipment_part_equipment_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow READ access for anon users" ON "public"."equipment_part_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON "public"."equipment_part_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM equipment_table
    INNER JOIN team_table ON team_id = equipment_team_id
    INNER JOIN team_member_table ON team_member_team_id = team_id
    WHERE equipment_id = equipment_part_equipment_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON "public"."equipment_part_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM equipment_table
    INNER JOIN team_table ON team_id = equipment_team_id
    INNER JOIN team_member_table ON team_member_team_id = team_id
    WHERE equipment_id = equipment_part_equipment_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

--- CAPACITY_UNIT_OF_MEASUREMENT_TABLE
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON "public"."capacity_unit_of_measurement_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM team_member_table
    WHERE team_member_team_id = capacity_unit_of_measurement_team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow READ access for anon users" ON "public"."capacity_unit_of_measurement_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON "public"."capacity_unit_of_measurement_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_member_table
    WHERE team_member_team_id = capacity_unit_of_measurement_team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON "public"."capacity_unit_of_measurement_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_member_table
    WHERE team_member_team_id = capacity_unit_of_measurement_team_id
    AND team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

-- address_table
CREATE POLICY "Allow CREATE for authenticated users" ON "public"."address_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow READ for authenticated users" ON "public"."address_table"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users" ON "public"."address_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow DELETE for authenticated users" ON "public"."address_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (true);

-- JIRA_PROJECT_TABLE
CREATE POLICY "Allow CRUD for authenticated users" ON "public"."jira_project_table"
AS PERMISSIVE FOR ALL
TO authenticated
USING (true);

-- JIRA_FORMSLY_PROJECT_TABLE
CREATE POLICY "Allow READ for anon users" ON "public"."jira_formsly_project_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON "public"."jira_formsly_project_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  (
    SELECT team_project_team_id
    FROM team_project_table
    WHERE team_project_table.team_project_id = formsly_project_id
  ) IN (
    SELECT team_member_team_id
    FROM team_member_table
    WHERE team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON "public"."jira_formsly_project_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  (
    SELECT team_project_team_id
    FROM team_project_table
    WHERE team_project_table.team_project_id = formsly_project_id
  ) IN (
    SELECT team_member_team_id
    FROM team_member_table
    WHERE team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

-- JIRA_USER_ROLE_TABLE
CREATE POLICY "Allow CRUD for authenticated users" ON "public"."jira_user_role_table"
AS PERMISSIVE FOR ALL
TO authenticated
USING (true);

-- JIRA_USER_ACCOUNT_TABLE
CREATE POLICY "Allow CRUD for authenticated users" ON "public"."jira_user_account_table"
AS PERMISSIVE FOR ALL
TO authenticated
USING (true);

-- JIRA_PROJECT_USER_TABLE
CREATE POLICY "Allow READ for anon users" ON "public"."jira_project_user_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON "public"."jira_project_user_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  (
    SELECT team_project_team_id
    FROM team_project_table
    WHERE team_project_table.team_project_id = jira_project_user_team_project_id
  ) IN (
    SELECT team_member_team_id
    FROM team_member_table
    WHERE team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON "public"."jira_project_user_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  (
    SELECT team_project_team_id
    FROM team_project_table
    WHERE team_project_table.team_project_id = jira_project_user_team_project_id
  ) IN (
    SELECT team_member_team_id
    FROM team_member_table
    WHERE team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON "public"."jira_project_user_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  (
    SELECT team_project_team_id
    FROM team_project_table
    WHERE team_project_table.team_project_id = jira_project_user_team_project_id
  ) IN (
    SELECT team_member_team_id
    FROM team_member_table
    WHERE team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

-- JIRA_ITEM_CATEGORY_TABLE
CREATE POLICY "Allow CRUD for authenticated users" ON "public"."jira_item_category_table"
AS PERMISSIVE FOR ALL
TO authenticated
USING (true);

-- JIRA_ITEM_USER_TABLE
CREATE POLICY "Allow CRUD for authenticated users " ON "public"."jira_item_user_table"
AS PERMISSIVE FOR ALL
TO authenticated
USING (true);

-- TEAM_DEPARTMENT_TABLE
CREATE POLICY "Allow READ for anon users" ON "public"."team_department_table"
AS PERMISSIVE FOR SELECT
USING (true);

-- jira_organization_table
CREATE POLICY "Allow CRUD for authenticated users" ON "public"."jira_organization_table"
AS PERMISSIVE FOR ALL
TO authenticated
USING (true);

-- jira_organization_team_project_table
CREATE POLICY "Allow READ for anon users" ON "public"."jira_organization_team_project_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON "public"."jira_organization_team_project_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  (
    SELECT team_project_team_id
    FROM team_project_table
    WHERE team_project_table.team_project_id = jira_organization_team_project_project_id
  ) IN (
    SELECT team_member_team_id
    FROM team_member_table
    WHERE team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON "public"."jira_organization_team_project_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  (
    SELECT team_project_team_id
    FROM team_project_table
    WHERE team_project_table.team_project_id = jira_organization_team_project_project_id
  ) IN (
    SELECT team_member_team_id
    FROM team_member_table
    WHERE team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON "public"."jira_organization_team_project_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  (
    SELECT team_project_team_id
    FROM team_project_table
    WHERE team_project_table.team_project_id = jira_organization_team_project_project_id
  ) IN (
    SELECT team_member_team_id
    FROM team_member_table
    WHERE team_member_user_id = auth.uid()
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

-- employee_job_title_table
CREATE POLICY "Allow READ for anon users" ON "public"."employee_job_title_table"
AS PERMISSIVE FOR SELECT
USING (true);

-- scic_employee_table
CREATE POLICY "Allow READ for anon users" ON "public"."scic_employee_table"
AS PERMISSIVE FOR SELECT
USING (true);

-------- End: POLICIES

---------- Start: INDEXES

CREATE INDEX request_response_request_id_idx ON request_response_table (request_response, request_response_request_id);
CREATE INDEX request_list_idx ON request_table (request_id, request_date_created, request_form_id, request_team_member_id, request_status);
CREATE INDEX request_response_idx ON request_response_table (request_response_request_id, request_response_field_id, request_response_duplicatable_section_id);

-------- End: INDEXES

---------- Start: VIEWS

CREATE VIEW distinct_division_view AS SELECT DISTINCT csi_code_division_id, csi_code_division_description from csi_code_table;
CREATE VIEW request_view AS SELECT *, CONCAT(request_formsly_id_prefix, '-', request_formsly_id_serial) AS request_formsly_id FROM request_table;
CREATE VIEW equipment_description_view AS SELECT equipment_description_table.*, CONCAT(equipment_name_shorthand, '-', equipment_description_property_number) AS equipment_description_property_number_with_prefix FROM equipment_description_table INNER JOIN equipment_table ON equipment_id = equipment_description_equipment_id;

-------- End: VIEWS

-------- Start: SUBSCRIPTION

DROP PUBLICATION if exists supabase_realtime;

CREATE PUBLICATION supabase_realtime;
COMMIT;

ALTER PUBLICATION supabase_realtime ADD TABLE request_table, request_signer_table, comment_table, notification_table, team_member_table, invitation_table, team_project_table, team_group_table, ticket_comment_table, ticket_table, team_table;

-------- End: SUBSCRIPTION


GRANT ALL ON ALL TABLES IN SCHEMA public TO PUBLIC;
GRANT ALL ON ALL TABLES IN SCHEMA public TO POSTGRES;

GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;