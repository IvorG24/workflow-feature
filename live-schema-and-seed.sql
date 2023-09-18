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
  option_description VARCHAR(4000),
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
  request_formsly_id VARCHAR(4000) UNIQUE,
  request_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  request_status VARCHAR(4000) DEFAULT 'PENDING' NOT NULL,
  request_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,

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
  item_division_id_list VARCHAR(4000)[] NOT NULL,

  item_team_id UUID REFERENCES team_table(team_id) NOT NULL
);

CREATE TABLE item_description_table(
  item_description_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  item_description_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  item_description_label VARCHAR(4000) NOT NULL,
  item_description_is_available BOOLEAN DEFAULT TRUE NOT NULL,
  item_description_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
  item_description_is_with_uom BOOLEAN DEFAULT FALSE NOT NULL,

  item_description_field_id UUID REFERENCES field_table(field_id) ON DELETE CASCADE NOT NULL,
  item_description_item_id UUID REFERENCES item_table(item_id) ON DELETE CASCADE NOT NULL
);

CREATE TABLE item_description_field_table(
  item_description_field_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  item_description_field_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  item_description_field_value VARCHAR(4000) NOT NULL,
  item_description_field_uom VARCHAR(4000),
  item_description_field_is_available BOOLEAN DEFAULT TRUE NOT NULL,
  item_description_field_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,

  item_description_field_item_description_id UUID REFERENCES item_description_table(item_description_id) ON DELETE CASCADE NOT NULL
);

-- End: Requisition Form

-- Start: Quotation Form

CREATE TABLE supplier_table(
  supplier_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  supplier_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  supplier_is_available BOOLEAN DEFAULT TRUE NOT NULL,
  supplier_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
  supplier_name VARCHAR(4000) NOT NULL,

  supplier_team_id UUID REFERENCES team_table(team_id) NOT NULL
);

-- End: Quotation Form

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
    searchCondition = `request_table.request_formsly_id ILIKE '%' || '${search}' || '%'`;
  }

  if(requisitionFilterCount || supplierList.length !== 0){
    if(requisitionFilterCount){
      condition = requisitionFilter.map(value => `request_response_table.request_response = '"${value}"'`).join(' OR ');
    }

    if(supplierList.length !== 0){
      const quotationCondition = supplierList.map(supplier => `request_response_table.request_response='"${supplier}"'`).join(" OR ");
      const quotationRequestIdList = plv8.execute(`SELECT request_table.request_id FROM request_response_table INNER JOIN request_table ON request_response_table.request_response_request_id=request_table.request_id WHERE request_table.request_status='APPROVED' AND request_table.request_form_id='${quotation_form.form_id}' AND (${quotationCondition})`);

      if(quotationRequestIdList.length === 0){
        ssot_data = [];
        return;
      }

      const sectionId = plv8.execute(`SELECT section_id FROM section_table WHERE section_form_id='${quotation_form.form_id}' AND section_name='ID'`)[0];
      const fieldId = plv8.execute(`SELECT field_id FROM field_table WHERE field_section_id='${sectionId.section_id}' AND field_name='Requisition ID'`)[0];

      const requisitionCondition = quotationRequestIdList.map(requestId => `(request_response_request_id='${requestId.request_id}' AND request_response_field_id='${fieldId.field_id}')`).join(" OR ");
      const requisitionIdList = plv8.execute(`SELECT request_response FROM request_response_table WHERE ${requisitionCondition}`);

      supplierCondition = requisitionIdList.map(requestId => `request_table.request_id = '${JSON.parse(requestId.request_response)}'`).join(' OR ');
    }

    let orCondition = [...(condition ? [`${condition}`] : []), ...(searchCondition ? [`${searchCondition}`] : [])].join(' OR ');

    requisition_requests = plv8.execute(
      `
        SELECT * FROM (
          SELECT 
            request_table.request_id, 
            request_table.request_formsly_id,
            request_table.request_date_created, 
            request_table.request_team_member_id, 
            request_response_table.request_response, 
            ROW_NUMBER() OVER (PARTITION BY request_table.request_id) AS RowNumber 
          FROM request_table INNER JOIN request_response_table ON request_table.request_id = request_response_table.request_response_request_id 
          WHERE 
            request_table.request_status = 'APPROVED'
            AND request_table.request_form_id = '${requisition_form.form_id}'
            AND (
              ${[...(orCondition ? [`${orCondition}`] : []), ...(supplierCondition ? [`${supplierCondition}`] : [])].join(' AND ')}
            )
          ORDER BY request_table.request_date_created DESC
        ) AS a 
        WHERE a.RowNumber = ${requisitionFilterCount ? requisitionFilterCount : 1}
        OFFSET ${rowStart} 
        ROWS FETCH FIRST ${rowLimit} ROWS ONLY
      `
    );
        
  }else{
    requisition_requests = plv8.execute(`SELECT request_id, request_formsly_id, request_date_created, request_team_member_id FROM request_table WHERE request_status='APPROVED' AND request_form_id='${requisition_form.form_id}' ORDER BY request_date_created DESC OFFSET ${rowStart} ROWS FETCH FIRST ${rowLimit} ROWS ONLY`);
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

    const quotation_ids = plv8.execute(`SELECT request_table.request_id FROM request_response_table INNER JOIN request_table ON request_response_table.request_response_request_id=request_table.request_id WHERE request_response_table.request_response='"${requisition.request_id}"' AND request_table.request_status='APPROVED' AND request_table.request_form_id='${quotation_form.form_id}'`);
    let quotation_list = [];
    if(quotation_ids.length !== 0){
      let quotation_condition = "";
      quotation_ids.forEach(quotation => {
        quotation_condition += `request_id='${quotation.request_id}' OR `;
      });

      const quotation_requests = plv8.execute(`SELECT request_id, request_formsly_id, request_date_created, request_team_member_id FROM request_table WHERE ${quotation_condition.slice(0, -4)} ORDER BY request_date_created DESC`);
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

          const rir_requests = plv8.execute(`SELECT request_id, request_formsly_id, request_date_created, request_team_member_id FROM request_table WHERE ${rir_condition.slice(0, -4)} ORDER BY request_date_created DESC`);
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

      const sourced_item_requests = plv8.execute(`SELECT request_id, request_formsly_id, request_date_created, request_team_member_id FROM request_table WHERE ${sourced_item_condition.slice(0, -4)} ORDER BY request_date_created DESC`);
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

          const ro_requests = plv8.execute(`SELECT request_id, request_formsly_id, request_date_created, request_team_member_id FROM request_table WHERE ${ro_condition.slice(0, -4)} ORDER BY request_date_created DESC`);
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

              const transfer_receipt_requests = plv8.execute(`SELECT request_id, request_formsly_id, request_date_created, request_team_member_id FROM request_table WHERE ${transfer_receipt_condition.slice(0, -4)} ORDER BY request_date_created DESC`);
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
      user_job_title
    } = input_data;

    user_data = plv8.execute(`INSERT INTO user_table (user_id,user_email,user_first_name,user_last_name,user_username,user_avatar,user_phone_number,user_job_title) VALUES ('${user_id}','${user_email}','${user_first_name}','${user_last_name}','${user_username}','${user_avatar}','${user_phone_number}','${user_job_title}') RETURNING *;`)[0];
    
    const invitation = plv8.execute(`SELECT invt.* ,teamt.team_name FROM invitation_table invt INNER JOIN team_member_table tmemt ON invt.invitation_from_team_member_id = tmemt.team_member_id INNER JOIN team_table teamt ON tmemt.team_member_team_id = teamt.team_id WHERE invitation_to_email='${user_email}';`)[0];

    if(invitation) plv8.execute(`INSERT INTO notification_table (notification_app,notification_content,notification_redirect_url,notification_type,notification_user_id) VALUES ('GENERAL','You have been invited to join ${invitation.team_name}','/team/invitation/${invitation.invitation_id}','INVITE','${user_id}') ;`);
    
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
      notificationValues,
      formName,
      isFormslyForm,
      projectId
    } = input_data;

    let request_formsly_id = 'NULL';
    if(isFormslyForm===true) {
      const requestCount = plv8.execute(`SELECT COUNT(*) FROM REQUEST_TABLE WHERE request_form_id='${formId}' AND request_project_id='${projectId}';`)[0].count;
      const newCount = (Number(requestCount) + 1).toString(16).toUpperCase();
      const project = plv8.execute(`SELECT * FROM team_project_table WHERE team_project_id='${projectId}';`)[0];
      
      let endId = '';
      if(formName==='Quotation') {
        endId = `Q-${newCount}`;
      } else if(formName==='Sourced Item') {
        endId = `SI-${newCount}`;
      } else if(formName==='Receiving Inspecting Report') {
        endId = `RIR-${newCount}`;
      } else if(formName==='Release Order') {
        endId = `RO-${newCount}`;
      } else if(formName==='Transfer Receipt') {
        endId = `TR-${newCount}`;
      } else {
        endId = `-${newCount}`;
      }

      request_formsly_id = `${project.team_project_code}${endId}`;
    }
    
    if (projectId === "") {
      request_data = plv8.execute(`INSERT INTO request_table (request_id,request_form_id,request_team_member_id) VALUES ('${requestId}','${formId}','${teamMemberId}') RETURNING *;`)[0];
    } else {
      request_data = plv8.execute(`INSERT INTO request_table (request_id,request_form_id,request_team_member_id,request_formsly_id,request_project_id) VALUES ('${requestId}','${formId}','${teamMemberId}','${request_formsly_id}','${projectId}') RETURNING *;`)[0];
    }

    plv8.execute(`INSERT INTO request_response_table (request_response,request_response_duplicatable_section_id,request_response_field_id,request_response_request_id) VALUES ${responseValues};`);

    plv8.execute(`INSERT INTO request_signer_table (request_signer_signer_id,request_signer_request_id) VALUES ${signerValues};`);

    plv8.execute(`INSERT INTO notification_table (notification_app,notification_content,notification_redirect_url,notification_team_id,notification_type,notification_user_id) VALUES ${notificationValues};`);
    
 });
 return request_data;
$$ LANGUAGE plv8;

-- End: Create request

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
    } = input_data;

    const present = { APPROVED: "APPROVE", REJECTED: "REJECT" };

    plv8.execute(`UPDATE request_signer_table SET request_signer_status = '${requestAction}' WHERE request_signer_signer_id='${requestSignerId}' AND request_signer_request_id='${requestId}';`);
    
    plv8.execute(`INSERT INTO comment_table (comment_request_id,comment_team_member_id,comment_type,comment_content) VALUES ('${requestId}','${memberId}','ACTION_${requestAction}','${signerFullName} ${requestAction.toLowerCase()}  this request');`);
    
    plv8.execute(`INSERT INTO notification_table (notification_app,notification_type,notification_content,notification_redirect_url,notification_user_id,notification_team_id) VALUES ('REQUEST','${present[requestAction]}','${signerFullName} ${requestAction.toLowerCase()} your ${formName} request','/team-requests/requests/${requestId}','${requestOwnerId}','${teamId}');`);
    
    if(isPrimarySigner===true){
      plv8.execute(`UPDATE request_table SET request_status = '${requestAction}' WHERE request_id='${requestId}';`);
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
        item_division_id_list
      },
      itemDescription
    } = input_data;

    
    const item_result = plv8.execute(`INSERT INTO item_table (item_general_name,item_is_available,item_unit,item_gl_account,item_team_id,item_division_id_list) VALUES ('${item_general_name}','${item_is_available}','${item_unit}','${item_gl_account}','${item_team_id}',ARRAY[${item_division_id_list}]) RETURNING *;`)[0];

    const {section_id} = plv8.execute(`SELECT section_id FROM section_table WHERE section_form_id='${formId}' AND section_name='Item';`)[0];

    const itemDescriptionInput = [];
    const fieldInput= [];

    itemDescription.forEach((description) => {
      const fieldId = plv8.execute('SELECT uuid_generate_v4();')[0].uuid_generate_v4
      itemDescriptionInput.push({
        item_description_label: description.description,
        item_description_item_id: item_result.item_id,
        item_description_is_available: true,
        item_description_field_id: fieldId,
        item_description_is_with_uom: description.withUoM
      });
      fieldInput.push({
        field_id: fieldId,
        field_name: description.description,
        field_type: "DROPDOWN",
        field_order: 14,
        field_section_id: section_id,
        field_is_required: true,
      });
    });

    const itemDescriptionValues = itemDescriptionInput
      .map((item) =>
        `('${item.item_description_label}','${item.item_description_item_id}','${item.item_description_is_available}','${item.item_description_field_id}','${item.item_description_is_with_uom}')`
      )
      .join(",");

    const fieldValues = fieldInput
      .map((field) =>
        `('${field.field_id}','${field.field_name}','${field.field_type}','${field.field_order}','${field.field_section_id}','${field.field_is_required}')`
      )
      .join(",");

    plv8.execute(`INSERT INTO field_table (field_id,field_name,field_type,field_order,field_section_id,field_is_required) VALUES ${fieldValues};`);
    
    const item_description = plv8.execute(`INSERT INTO item_description_table (item_description_label,item_description_item_id,item_description_is_available,item_description_field_id, item_description_is_with_uom) VALUES ${itemDescriptionValues} RETURNING *;`);

    item_data = {...item_result, item_description: item_description}

 });
 return item_data;
$$ LANGUAGE plv8;

-- End: Create item

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
          notification_redirect_url: `/team/invitation/${invitationId}`,
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

-- Start: Transfer ownership 

CREATE OR REPLACE FUNCTION transfer_ownership(
    owner_id TEXT,
    member_id TEXT
)
RETURNS VOID  as $$
  plv8.subtransaction(function(){

    plv8.execute(`UPDATE team_member_table SET team_member_role='OWNER' WHERE team_member_id='${member_id}'`);
    plv8.execute(`UPDATE team_member_table SET team_member_role='ADMIN' WHERE team_member_id='${owner_id}'`);
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

    plv8.execute(`UPDATE request_table SET request_status='CANCELED' WHERE request_id='${request_id}'`);
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
          `('${option.option_id}','${option.option_value}',${
            option.option_description ? `'${option.option_description}'` : "NULL"
          },'${option.option_order}','${option.option_field_id}')`
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

    const option_query = `INSERT INTO option_table (option_id,option_value,option_description,option_order,option_field_id) VALUES ${optionValues}`;

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
        status,
        form,
        sort,
        search,
      } = input_data;

      const start = (page - 1) * limit;

      const request_list = plv8.execute(
        `
          SELECT 
            request_table.request_id, 
            request_table.request_formsly_id,
            request_date_created, 
            request_status,
            request_team_member_id,
            request_form_id
          FROM request_table
          INNER JOIN team_member_table ON request_table.request_team_member_id = team_member_table.team_member_id
          INNER JOIN form_table ON request_table.request_form_id = form_table.form_id
          WHERE team_member_table.team_member_team_id = '${teamId}'
          AND request_is_disabled = false
          AND form_table.form_is_disabled = false
          ${requestor}
          ${status}
          ${form}
          ${search}
          ORDER BY request_table.request_date_created ${sort} 
          OFFSET ${start} ROWS FETCH FIRST ${limit} ROWS ONLY
        `
      );

      const request_count = plv8.execute(
        `
          SELECT COUNT(*)
          FROM request_table
          INNER JOIN team_member_table ON request_table.request_team_member_id = team_member_table.team_member_id
          INNER JOIN form_table ON request_table.request_form_id = form_table.form_id
          WHERE team_member_table.team_member_team_id = '${teamId}'
          AND request_is_disabled = false
          AND form_table.form_is_disabled = false
          ${requestor}
          ${status}
          ${form}
          ${search}
        `
      )[0];

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
          request_team_member: {
            team_member_team_id: request.request_team_member_id,
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
    } = input_data;

    
   const projectInitialCount = plv8.execute(`
      SELECT COUNT(*) FROM team_project_table 
      WHERE team_project_team_id = $1 
      AND team_project_code ILIKE '%' || $2 || '%';
    `, [teamProjectTeamId, teamProjectInitials])[0].count + 1n;

    const teamProjectCode = teamProjectInitials + projectInitialCount.toString(16).toUpperCase();

    team_project_data = plv8.execute(`INSERT INTO team_project_table (team_project_name, team_project_code, team_project_team_id) VALUES ('${teamProjectName}', '${teamProjectCode}', '${teamProjectTeamId}') RETURNING *;`)[0];

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
    
    if (!request.request_form.form_is_formsly_form) {
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
          INNER JOIN request_table ON request_id=request_response_request_id
          INNER JOIN form_table ON form_id=request_form_id 
          WHERE 
            request_response='"${requestId}"' 
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
            form_team_member_id
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
            INNER JOIN request_table ON request_response_request_id = request_id
            INNER JOIN form_table ON request_form_id = form_id
            WHERE
              request_response = '"${requestId}"'
              AND request_status = 'PENDING'
              AND form_name = 'Quotation'
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
            form_team_member_id
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
            form_team_member_id
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
              request_signer_request_id='${requestId}'
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
            form_team_member_id
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

CREATE FUNCTION get_team_member_on_load(
    input_data JSON
)
RETURNS JSON AS $$
  let team_member_data;
  plv8.subtransaction(function(){
    const {
      teamMemberId
    } = input_data;
    
    const member = plv8.execute(`SELECT tmt.* , ( SELECT row_to_json(usert) FROM user_table usert WHERE usert.user_id = tmt.team_member_user_id ) AS team_member_user FROM team_member_table tmt WHERE team_member_id='${teamMemberId}';`)[0];

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
          'user_email', usert.user_email 
        ) AS team_member_user  
        FROM team_member_table tmt 
        JOIN user_table usert ON tmt.team_member_user_id = usert.user_id 
        WHERE 
          tmt.team_member_team_id='${teamId}' 
          AND tmt.team_member_is_disabled=false 
          AND usert.user_is_disabled=false
        ORDER BY
          CASE tmt.team_member_role
              WHEN 'OWNER' THEN 1
              WHEN 'ADMIN' THEN 2
              WHEN 'MEMBER' THEN 3
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

    const teamProjects = plv8.execute(`SELECT * FROM team_project_table WHERE team_project_team_id='${teamId}' AND team_project_is_disabled=false ORDER BY team_project_date_created DESC LIMIT 10;`);

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
            'user_email', usert.user_email 
          ) AS team_member_user  
        FROM team_member_table tmt 
        JOIN user_table usert ON tmt.team_member_user_id = usert.user_id 
        WHERE 
          tmt.team_member_team_id='${teamId}' 
          AND tmt.team_member_is_disabled=false 
          AND usert.user_is_disabled=false
          ${search && `AND (
            usert.user_first_name ILIKE '%${search}%'
            OR usert.user_last_name ILIKE '%${search}%'
            OR usert.user_email ILIKE '%${search}%'
          )`}
        ORDER BY
          CASE tmt.team_member_role
              WHEN 'OWNER' THEN 1
              WHEN 'ADMIN' THEN 2
              WHEN 'MEMBER' THEN 3
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
            usert.user_first_name ILIKE '%${search}%'
            OR usert.user_last_name ILIKE '%${search}%'
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

CREATE FUNCTION get_request_list_on_load(
    input_data JSON
)
RETURNS JSON AS $$
  let request_data;
  plv8.subtransaction(function(){
    const {
      userId,
    } = input_data;
    
    const teamId = plv8.execute(`SELECT get_user_active_team_id('${userId}');`)[0].get_user_active_team_id;
    
    const teamMemberId = plv8.execute(`SELECT team_member_id FROM team_member_table WHERE team_member_user_id='${userId}' AND team_member_team_id='${teamId}';`)[0].team_member_id;

    const teamMemberList = plv8.execute(`SELECT tmt.team_member_id, tmt.team_member_role, json_build_object( 'user_id',usert.user_id, 'user_first_name',usert.user_first_name , 'user_last_name',usert.user_last_name) AS team_member_user FROM team_member_table tmt JOIN user_table usert ON tmt.team_member_user_id=usert.user_id WHERE tmt.team_member_team_id='${teamId}' AND tmt.team_member_is_disabled=false;`);

    const isFormslyTeam = plv8.execute(`SELECT COUNT(formt.form_id) > 0 AS isFormslyTeam FROM form_table formt JOIN team_member_table tmt ON formt.form_team_member_id = tmt.team_member_id WHERE tmt.team_member_team_id='${teamId}' AND formt.form_is_formsly_form=true;`)[0].isformslyteam;

    const formListData = plv8.execute(`SELECT formt.form_name, formt.form_id FROM form_table formt JOIN team_member_table tmt ON formt.form_team_member_id = tmt.team_member_id WHERE tmt.team_member_team_id='${teamId}' AND formt.form_is_disabled=false AND formt.form_app='REQUEST';`);

    const formList = formListData.map(form=>({ label: form.form_name, value: form.form_id }));
    
    const requestList = plv8.execute(`SELECT fetch_request_list('{"teamId":"${teamId}", "page":"1", "limit":"13", "requestor":"", "form":"", "status":"", "search":"", "sort":"ASC"}');`)[0].fetch_request_list;

    request_data = {teamMemberId,teamMemberList,isFormslyTeam, formList, requestList: requestList.data, requestListCount: requestList.count}
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
          AND (team_member_role = 'ADMIN' OR team_member_role = 'OWNER')
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
          AND (team_member_role = 'ADMIN' OR team_member_role = 'OWNER')
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
      const teamProjectList = plv8.execute(`SELECT * FROM team_project_table WHERE team_project_team_id = '${teamId}' AND team_project_is_disabled = false ORDER BY team_project_date_created DESC LIMIT ${limit}`);
      const teamProjectListCount = plv8.execute(`SELECT COUNT(*) FROM team_project_table WHERE team_project_team_id = '${teamId}' AND team_project_is_disabled = false`)[0].count;
    
      if(formName === 'Requisition'){
        const items = [];
        const itemData = plv8.execute(`SELECT * FROM item_table WHERE item_team_id = '${teamId}' AND item_is_disabled = false LIMIT ${limit}`);
        const itemListCount = plv8.execute(`SELECT COUNT(*) FROM item_table WHERE item_team_id = '${teamId}' AND item_is_disabled = false`)[0].count;

        itemData.forEach(value => {
          const itemDescription = plv8.execute(`SELECT * FROM item_description_table WHERE item_description_item_id = '${value.item_id}'`);
          items.push({
            ...value,
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
            option_description: null,
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
          `
        );

        const projectOptions = projects.map((project, index) => {
          return {
            option_description: null,
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
                  ...form.form_section[1].section_field.slice(0, 9),
                ],
              },
            ],
          },
          itemOptions,
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
            option_description: null,
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
          `
        );

        const projectOptions = teamProjects.map((project, index) => {
          return {
            option_description: project.team_project_id,
            option_field_id: form.form_section[1].section_field[2].field_id,
            option_id: project.team_project_name,
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
                  ...form.form_section[1].section_field.slice(0, 2),
                  {
                    ...form.form_section[1].section_field[2],
                    field_option: projectOptions.filter(
                      (project) =>
                        project.option_description !== requestProjectId
                    ),
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
            option_description: null,
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
            option_description: null,
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
            option_description: null,
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
            option_description: null,
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
    const requestData = plv8.execute(
      `
        SELECT 
          request_table.*,
          team_member_team_id,
          user_id, 
          user_first_name, 
          user_last_name, 
          user_username, 
          user_avatar,
          form_id, 
          form_name, 
          form_description, 
          form_is_formsly_form,
          team_project_name
        FROM request_table
        INNER JOIN team_member_table ON team_member_id = request_team_member_id
        INNER JOIN user_table ON user_id = team_member_user_id
        INNER JOIN form_table ON form_id = request_form_id
        LEFT JOIN team_project_table ON team_project_id = request_project_id
        WHERE 
          request_id = '${request_id}'
          AND request_is_disabled = false
      `
    )[0];

    const requestSignerData = plv8.execute(
      `
        SELECT
          request_signer_id, 
          request_signer_status, 
          signer_id, 
          signer_is_primary_signer, 
          signer_action, 
          signer_order, 
          signer_form_id,
          team_member_id, 
          user_first_name, 
          user_last_name
        FROM request_signer_table
        INNER JOIN signer_table ON signer_id = request_signer_signer_id
        INNER JOIN team_member_table ON team_member_id = signer_team_member_id
        INNER JOIN user_table ON user_id = team_member_user_id
        WHERE request_signer_request_id = '${request_id}'
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
          comment_request_id = '${request_id}'
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

    const section = sectionData.map(section => {
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


      return {
        ...section,
        section_field: fieldWithOptionAndResponse,
      }
    });
 
    const form = {
      form_id: requestData.form_id,
      form_name: requestData.form_name,
      form_description: requestData.form_description,
      form_is_formsly_form: requestData.form_is_formsly_form,
      form_section: section,
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
          user_avatar: requestData.user_avatar
        }
      },
      request_signer: requestSignerData.map(requestSigner => {
        return {
          request_signer_id: requestSigner.request_signer_id, 
          request_signer_status: requestSigner.request_signer_status,
          request_signer_signer: {
            signer_id: requestSigner.signer_id, 
            signer_is_primary_signer: requestSigner.signer_is_primary_signer, 
            signer_action: requestSigner.signer_action, 
            signer_order: requestSigner.signer_order, 
            signer_form_id: requestSigner.signer_form_id,
            signer_team_member:{
              team_member_id: requestSigner.team_member_id,
              team_member_user:{
                user_first_name: requestSigner.user_first_name, 
                user_last_name: requestSigner.user_last_name
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


DROP POLICY IF EXISTS "Allow CRUD for authenticated users only" ON attachment_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON team_member_table;
DROP POLICY IF EXISTS "Allow READ access for authenticated users" ON team_member_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON team_member_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON team_member_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON field_table;
DROP POLICY IF EXISTS "Allow READ access for authenticated users" ON field_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON field_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON field_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON form_table;
DROP POLICY IF EXISTS "Allow READ access for authenticated users" ON form_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON form_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON form_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON item_description_field_table;
DROP POLICY IF EXISTS "Allow READ access for authenticated users" ON item_description_field_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON item_description_field_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON item_description_field_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON item_description_table;
DROP POLICY IF EXISTS "Allow READ access for authenticated users" ON item_description_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON item_description_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON item_description_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON item_table;
DROP POLICY IF EXISTS "Allow READ access for authenticated users" ON item_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON item_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON item_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON option_table;
DROP POLICY IF EXISTS "Allow READ access for authenticated users" ON option_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON option_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON option_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON request_signer_table;
DROP POLICY IF EXISTS "Allow READ access for authenticated users" ON request_signer_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON request_signer_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON request_signer_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON section_table;
DROP POLICY IF EXISTS "Allow READ access for authenticated users" ON section_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON section_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON section_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON signer_table;
DROP POLICY IF EXISTS "Allow READ access for authenticated users" ON signer_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON signer_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON signer_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users with OWNER or ADMIN role" ON supplier_table;
DROP POLICY IF EXISTS "Allow READ access for authenticated users" ON supplier_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON supplier_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users with OWNER or ADMIN role" ON supplier_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users" ON comment_table;
DROP POLICY IF EXISTS "Allow READ for authenticated users" ON comment_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users based on team_member_id" ON comment_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users based on team_member_id" ON comment_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users" ON invitation_table;
DROP POLICY IF EXISTS "Allow READ for users based on invitation_to_email" ON invitation_table;
DROP POLICY IF EXISTS "Allow UPDATE for users based on invitation_from_team_member_id" ON invitation_table;
DROP POLICY IF EXISTS "Allow DELETE for users based on invitation_from_team_member_id" ON invitation_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users" ON notification_table;
DROP POLICY IF EXISTS "Allow READ for authenticated users on own notifications" ON notification_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users on own notifications" ON notification_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users on own notifications" ON notification_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users" ON request_response_table;
DROP POLICY IF EXISTS "Allow READ for authenticated users" ON request_response_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users on own requests" ON request_response_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users on own requests" ON request_response_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users" ON request_table;
DROP POLICY IF EXISTS "Allow READ for authenticated users" ON request_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users on own requests" ON request_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users on own requests" ON request_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users" ON team_table;
DROP POLICY IF EXISTS "Allow READ for authenticated users" ON team_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users on own teams" ON team_table;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users on own teams" ON team_table;

DROP POLICY IF EXISTS "Allow CREATE for authenticated users" ON user_table;
DROP POLICY IF EXISTS "Allow READ for authenticated users" ON user_table;
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
DROP POLICY IF EXISTS "Allow READ for authenticated team members" ON team_project_table;
DROP POLICY IF EXISTS "Allow UPDATE for OWNER or ADMIN roles" ON team_project_table;
DROP POLICY IF EXISTS "Allow DELETE for OWNER or ADMIN roles" ON team_project_table;

--- ATTACHMENT_TABLE
CREATE POLICY "Allow CRUD for authenticated users only" ON "public"."attachment_table"
AS PERMISSIVE FOR ALL
TO authenticated
USING (true);

--- FIELD_TABLE
CREATE POLICY "Allow CREATE for authenticated users with OWNER or ADMIN role" ON "public"."field_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
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

CREATE POLICY "Allow READ access for authenticated users" ON "public"."field_table"
AS PERMISSIVE FOR SELECT
TO authenticated
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

CREATE POLICY "Allow READ access for authenticated users" ON "public"."form_table"
AS PERMISSIVE FOR SELECT
TO authenticated
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

CREATE POLICY "Allow READ access for authenticated users" ON "public"."item_description_field_table"
AS PERMISSIVE FOR SELECT
TO authenticated
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

CREATE POLICY "Allow READ access for authenticated users" ON "public"."item_description_table"
AS PERMISSIVE FOR SELECT
TO authenticated
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

CREATE POLICY "Allow READ access for authenticated users" ON "public"."item_table"
AS PERMISSIVE FOR SELECT
TO authenticated
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

CREATE POLICY "Allow READ access for authenticated users" ON "public"."option_table"
AS PERMISSIVE FOR SELECT
TO authenticated
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
CREATE POLICY "Allow CREATE for authenticated users" ON "public"."request_signer_table"
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

CREATE POLICY "Allow READ access for authenticated users" ON "public"."request_signer_table"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON "public"."request_signer_table"
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
    AND team_member_role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON "public"."request_signer_table"
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
    AND team_member_role IN ('OWNER', 'ADMIN')
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

CREATE POLICY "Allow READ access for authenticated users" ON "public"."section_table"
AS PERMISSIVE FOR SELECT
TO authenticated
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

CREATE POLICY "Allow READ access for authenticated users" ON "public"."signer_table"
AS PERMISSIVE FOR SELECT
TO authenticated
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

CREATE POLICY "Allow READ access for authenticated users" ON "public"."supplier_table"
AS PERMISSIVE FOR SELECT
TO authenticated
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

CREATE POLICY "Allow READ access for authenticated users" ON "public"."team_member_table"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users with OWNER or ADMIN role" ON "public"."team_member_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  team_member_team_id IN (
    SELECT team_member_team_id from team_member_table
    WHERE team_member_user_id = auth.uid()
    AND team_member_role = 'OWNER'
  ) OR team_member_user_id = auth.uid()
);

CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON "public"."team_member_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  team_member_team_id IN (
    SELECT team_member_team_id from team_member_table
    WHERE team_member_user_id = auth.uid()
    AND team_member_role = 'OWNER'
  )
);

--- COMMENT_TABLE
CREATE POLICY "Allow CREATE for authenticated users" ON "public"."comment_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow READ for authenticated users" ON "public"."comment_table"
AS PERMISSIVE FOR SELECT
TO authenticated
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

CREATE POLICY "Allow READ for authenticated users" ON "public"."request_response_table"
AS PERMISSIVE FOR SELECT
TO authenticated
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

CREATE POLICY "Allow READ for authenticated users" ON "public"."request_table"
AS PERMISSIVE FOR SELECT
TO authenticated
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
    AND team_member_role IN ('OWNER', 'ADMIN')
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
    AND team_member_role IN ('OWNER', 'ADMIN')
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

CREATE POLICY "Allow READ for authenticated users" ON "public"."user_table"
AS PERMISSIVE FOR SELECT
TO authenticated
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

CREATE POLICY "Allow READ for authenticated team members" ON "public"."team_project_table"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT tm.team_member_team_id
    FROM team_member_table as tm
    JOIN user_table as ut ON ut.user_id = auth.uid()
    WHERE ut.user_active_team_id = team_project_team_id
    AND tm.team_member_user_id = auth.uid()
  ) 
);

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

-------- End: POLICIES

---------- Start: INDEXES

CREATE INDEX request_response_request_id_idx ON request_response_table (request_response, request_response_request_id);
CREATE INDEX request_list_idx ON request_table (request_id, request_date_created, request_form_id, request_team_member_id, request_status);

-------- End: INDEXES

---------- Start: VIEWS

CREATE VIEW distinct_division AS SELECT DISTINCT csi_code_division_id, csi_code_division_description from csi_code_table;

-------- End: VIEWS

-------- Start: SUBSCRIPTION

DROP PUBLICATION if exists supabase_realtime;

CREATE PUBLICATION supabase_realtime;
COMMIT;

ALTER PUBLICATION supabase_realtime ADD TABLE request_table, request_signer_table, comment_table, notification_table, team_member_table, invitation_table, team_project_table, team_group_table;

-------- END: SUBSCRIPTION


GRANT ALL ON ALL TABLES IN SCHEMA public TO PUBLIC;
GRANT ALL ON ALL TABLES IN SCHEMA public TO POSTGRES;

GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

INSERT INTO user_table (user_id, user_username, user_first_name, user_last_name, user_email, user_active_team_id) VALUES
('5b4ba109-ee91-44fa-a514-1652b57d3c5f', 'albertlinao', 'Albert', 'Linao', 'albert.linao@staclara.com.ph', 'a5a28977-6956-45c1-a624-b9e90911502e');

INSERT INTO team_table (team_id, team_name, team_user_id) VALUES
('a5a28977-6956-45c1-a624-b9e90911502e', 'SCIC', '5b4ba109-ee91-44fa-a514-1652b57d3c5f');

INSERT INTO team_member_table (team_member_id, team_member_role, team_member_team_id, team_member_user_id) VALUES
('eb4d3419-b70f-44ba-b88f-c3d983cbcf3b', 'OWNER', 'a5a28977-6956-45c1-a624-b9e90911502e', '5b4ba109-ee91-44fa-a514-1652b57d3c5f');

INSERT INTO team_group_table (team_group_id, team_group_name, team_group_team_id) VALUES
('9f7de2eb-4073-43e6-b662-d688ccba4b26', 'REQUESTER', 'a5a28977-6956-45c1-a624-b9e90911502e'), -- Requisition 
('51277fb9-7f1f-4c80-a122-c3fea3cf3ed7', 'PURCHASER', 'a5a28977-6956-45c1-a624-b9e90911502e'), -- Quotation
('72ef0fd8-72ef-487d-9b88-ee61ddc3f275', 'WAREHOUSE', 'a5a28977-6956-45c1-a624-b9e90911502e'); -- Sourced Item , Release Order , Transfer Receipt, Receiving Inspecting Report

INSERT INTO team_project_table (team_project_id, team_project_name, team_project_team_id, team_project_code) VALUES
('4b3a151a-a077-486c-9dfb-e996c2c9184c', 'PHILIP MORRIS', 'a5a28977-6956-45c1-a624-b9e90911502e', 'PM1'),
('bf4dc226-a763-49da-be9f-606202d2c4c9', 'SIGUIL HYDRO', 'a5a28977-6956-45c1-a624-b9e90911502e','SH1'),
('989dbcc2-fdfe-48c7-806a-98cf80e1bf42', 'LAKE MAINIT', 'a5a28977-6956-45c1-a624-b9e90911502e', 'LM1');

INSERT INTO team_group_member_table (team_member_id, team_group_id) VALUES
('eb4d3419-b70f-44ba-b88f-c3d983cbcf3b', '9f7de2eb-4073-43e6-b662-d688ccba4b26'),
('eb4d3419-b70f-44ba-b88f-c3d983cbcf3b', '51277fb9-7f1f-4c80-a122-c3fea3cf3ed7'),
('eb4d3419-b70f-44ba-b88f-c3d983cbcf3b', '72ef0fd8-72ef-487d-9b88-ee61ddc3f275');

INSERT INTO team_project_member_table (team_member_id, team_project_id) VALUES
('eb4d3419-b70f-44ba-b88f-c3d983cbcf3b', '4b3a151a-a077-486c-9dfb-e996c2c9184c'),
('eb4d3419-b70f-44ba-b88f-c3d983cbcf3b', 'bf4dc226-a763-49da-be9f-606202d2c4c9'),
('eb4d3419-b70f-44ba-b88f-c3d983cbcf3b', '989dbcc2-fdfe-48c7-806a-98cf80e1bf42');

INSERT INTO form_table (form_id, form_name, form_description, form_app, form_team_member_id, form_is_formsly_form, form_is_hidden, form_is_for_every_member, form_is_disabled) VALUES
('d13b3b0f-14df-4277-b6c1-7c80f7e7a829', 'Requisition', 'formsly premade Requisition form', 'REQUEST', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b', true, true, false, false),
('e5062660-9026-4629-bc2c-633826fdaa24', 'Sourced Item', 'formsly premade Sourced Item form', 'REQUEST', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b', true, true, false, false),
('a732196f-9779-45e2-85fa-7320397e5b0a', 'Quotation', 'formsly premade Quotation form', 'REQUEST', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b', true, true, false, false),
('5782d70a-5f6b-486c-a77f-401066afd005', 'Receiving Inspecting Report', 'These items were not available during this Requsitions sourcing step.', 'REQUEST', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b', true, true, false, false),
('391c1b8c-db12-42ff-ad4a-4ea7680243d7', 'Release Order', 'These items were available during this Requsitions sourcing step.', 'REQUEST', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b', true, true, false, false),
('8e173d92-c346-4fb5-8ef2-490105e19263', 'Transfer Receipt', 'formsly premade Transfer Receipt form.', 'REQUEST', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b', true, true, false, false);

INSERT INTO section_table (section_id, section_name, section_order, section_is_duplicatable, section_form_id) VALUES
-- Requisition
('ee34bb67-fffa-4690-aaf2-7ae371b21e88', 'Main', 1, false, 'd13b3b0f-14df-4277-b6c1-7c80f7e7a829'),
('0672ef7d-849d-4bc7-81b1-7a5eefcc1451', 'Item', 2, true, 'd13b3b0f-14df-4277-b6c1-7c80f7e7a829'),

-- Sourced Item
('65d2d36a-7e69-4044-9f74-157bc753bd59', 'ID', 1, false, 'e5062660-9026-4629-bc2c-633826fdaa24'),
('2e7e0b5f-cbf4-4340-af1a-18a16fd3a028', 'Item', 2, true, 'e5062660-9026-4629-bc2c-633826fdaa24'),

-- Quotation
('7d6649c2-316b-4895-86eb-120def2e2f33', 'ID', 1, false, 'a732196f-9779-45e2-85fa-7320397e5b0a'),
('991d9830-ae1b-4c14-bdba-6167b64f50f7', 'Main', 2, false, 'a732196f-9779-45e2-85fa-7320397e5b0a'),
('cd7b6204-1e87-4c5b-9ce3-3d8ca5c201fb', 'Additional Charges', 3, false, 'a732196f-9779-45e2-85fa-7320397e5b0a'),
('ee8a3bc7-4253-44f7-bd7c-53b0e8871601', 'Item', 4, true, 'a732196f-9779-45e2-85fa-7320397e5b0a'),

-- Receiving Inspecting Report
('b79c9a66-f112-4bfa-8d5c-88267be24fd8', 'ID', 1, false, '5782d70a-5f6b-486c-a77f-401066afd005'),
('39831fe4-00f3-4b5e-b840-aae8f1469841', 'Quality Check', 2, false, '5782d70a-5f6b-486c-a77f-401066afd005'),
('00341355-1ece-47e6-88a2-060fbab8b11a', 'Item', 3, true, '5782d70a-5f6b-486c-a77f-401066afd005'),

-- Release Order
('1416e947-3491-436f-9b20-f0cd705607d0', 'ID', 1, false, '391c1b8c-db12-42ff-ad4a-4ea7680243d7'),
('0d630b15-3c88-49e0-b588-1e60dd839bcb', 'Item', 2, true, '391c1b8c-db12-42ff-ad4a-4ea7680243d7'),

-- Transfer Receipt
('47b11674-d641-4680-834e-7fd48f43696b', 'ID', 1, false, '8e173d92-c346-4fb5-8ef2-490105e19263'),
('c3d7f001-32ce-4e44-8677-7d2dd16c45dd', 'Quantity Check', 2, false, '8e173d92-c346-4fb5-8ef2-490105e19263'),
('b2466824-9803-41a2-8abc-5d9f7045c73b', 'Item', 3, true, '8e173d92-c346-4fb5-8ef2-490105e19263');

INSERT INTO field_table (field_id, field_name, field_type, field_order, field_section_id, field_is_required, field_is_read_only) VALUES
-- Requisition 
('51b6da24-3e28-49c4-9e19-5988b9ad3909', 'Requesting Project', 'DROPDOWN', 1, 'ee34bb67-fffa-4690-aaf2-7ae371b21e88', true, false),
('6882287e-57c7-42ae-a672-b0d6c8979b01', 'Type', 'DROPDOWN', 2, 'ee34bb67-fffa-4690-aaf2-7ae371b21e88', true, false),
('46dc154d-1c35-4a3c-9809-698b56d17faa', 'Date Needed', 'DATE', 3, 'ee34bb67-fffa-4690-aaf2-7ae371b21e88', true, false),
('c08820a5-592a-4bf9-9528-97b7ee7be94b', 'Purpose', 'TEXT', 4, 'ee34bb67-fffa-4690-aaf2-7ae371b21e88', true, false),

('b2c899e8-4ac7-4019-819e-d6ebcae71f41', 'General Name', 'DROPDOWN', 5, '0672ef7d-849d-4bc7-81b1-7a5eefcc1451', true, false),
('c3efa89d-8297-4920-8c3e-d9dee61fdf13', 'Base Unit of Measurement', 'TEXT', 6, '0672ef7d-849d-4bc7-81b1-7a5eefcc1451', true, true),
('d78145e8-ba83-4fa8-907f-db66fd3cae0d', 'Quantity', 'NUMBER', 7, '0672ef7d-849d-4bc7-81b1-7a5eefcc1451', true, false),
('440d9a37-656a-4237-be3b-c434f512eaa9', 'GL Account', 'TEXT', 8, '0672ef7d-849d-4bc7-81b1-7a5eefcc1451', true, true),
('a6266f0b-1339-4c50-910e-9bae73031df0', 'CSI Code Description', 'DROPDOWN', 9, '0672ef7d-849d-4bc7-81b1-7a5eefcc1451', true, false),
('0c9831e7-dc18-4aaf-87f7-2e7bcbc53eae', 'CSI Code', 'TEXT', 10, '0672ef7d-849d-4bc7-81b1-7a5eefcc1451', true, true),
('64bb5899-bad4-4fe4-bc08-60dce9923f57', 'Division Description', 'TEXT', 11, '0672ef7d-849d-4bc7-81b1-7a5eefcc1451', true, true),
('8fdb158b-bed5-4eac-a6dc-bc69275f1ac7', 'Level 2 Major Group Description', 'TEXT', 12, '0672ef7d-849d-4bc7-81b1-7a5eefcc1451', true, true),
('b69182a9-dc96-472b-aa31-b1f2f92ec78b', 'Level 2 Minor Group Description', 'TEXT', 13, '0672ef7d-849d-4bc7-81b1-7a5eefcc1451', true, true),

-- Sourced Item 
('e01d6fc1-48c3-4abb-b605-841f73f83f9a', 'Requisition ID', 'LINK', 1, '65d2d36a-7e69-4044-9f74-157bc753bd59', true, true),

('bdaa7b68-8ca3-443c-999c-3adec9339709', 'Item', 'DROPDOWN', 2, '2e7e0b5f-cbf4-4340-af1a-18a16fd3a028', true, false),
('8c15e0f0-f360-4826-a684-5ab4ecb52009', 'Quantity', 'NUMBER', 3, '2e7e0b5f-cbf4-4340-af1a-18a16fd3a028', true, false),
('4982e986-865c-4574-9767-4951b4f6c155', 'Source Project', 'DROPDOWN', 4, '2e7e0b5f-cbf4-4340-af1a-18a16fd3a028', true, false),

-- Quotation 
('df0cb109-e34d-498f-ac51-af2139628ac0', 'Requisition ID', 'LINK', 1, '7d6649c2-316b-4895-86eb-120def2e2f33', true, true),

('2a43aedd-017c-4675-ad4c-00debbac7050', 'Supplier', 'DROPDOWN', 2, '991d9830-ae1b-4c14-bdba-6167b64f50f7', true, false),
('39ea4ce9-7c78-4470-b3ff-cfd13429d6c5', 'Supplier Quotation', 'FILE', 3, '991d9830-ae1b-4c14-bdba-6167b64f50f7', true, false),
('039f5c31-6e9c-42ae-aa27-21c0cba12560', 'Request Send Method', 'DROPDOWN', 4, '991d9830-ae1b-4c14-bdba-6167b64f50f7', false, false),
('4c201ab9-92d9-47dd-a661-a7bb2c4e3923', 'Proof of Sending', 'FILE', 5, '991d9830-ae1b-4c14-bdba-6167b64f50f7', false, false),
('0dfd9844-656d-4468-9919-a243e2fef1ef', 'Payment Terms', 'DROPDOWN', 6, '991d9830-ae1b-4c14-bdba-6167b64f50f7', true, false),
('53497dc1-33bf-46de-a445-4115e45167eb', 'Lead Time', 'NUMBER', 7, '991d9830-ae1b-4c14-bdba-6167b64f50f7', true, false),
('918e4f18-c4c1-44c1-bec8-da796ff33dfe', 'Required Down Payment', 'NUMBER', 8, '991d9830-ae1b-4c14-bdba-6167b64f50f7', true, false),

('90e7959a-12a4-44f7-8b45-225a40b681f6', 'Delivery Fee', 'NUMBER', 9, 'cd7b6204-1e87-4c5b-9ce3-3d8ca5c201fb', false, false),
('7a46ec08-b38d-424a-94ef-f9de5df5e6c2', 'Bank Charge', 'NUMBER', 10, 'cd7b6204-1e87-4c5b-9ce3-3d8ca5c201fb', false, false),
('70133386-277b-4c4a-9260-3fe769bf12d2', 'Mobilization Charge', 'NUMBER', 11, 'cd7b6204-1e87-4c5b-9ce3-3d8ca5c201fb', false, false),
('8b4389b7-328f-47dc-974b-485c17475be3', 'Demobilization Charge', 'NUMBER', 12, 'cd7b6204-1e87-4c5b-9ce3-3d8ca5c201fb', false, false),
('69887d56-f813-4570-9230-c3e98c808b0d', 'Freight Charge', 'NUMBER', 13, 'cd7b6204-1e87-4c5b-9ce3-3d8ca5c201fb', false, false),
('cabe5c9a-79c4-42bd-ab4e-01ef8f200251', 'Hauling Charge', 'NUMBER', 14, 'cd7b6204-1e87-4c5b-9ce3-3d8ca5c201fb', false, false),
('c7ac30a2-39bf-427d-aa94-cf24827cb3e2', 'Handling Charge', 'NUMBER', 15, 'cd7b6204-1e87-4c5b-9ce3-3d8ca5c201fb', false, false),
('08e43351-79ec-4967-9aed-9909ee44495d', 'Packing Charge', 'NUMBER', 16, 'cd7b6204-1e87-4c5b-9ce3-3d8ca5c201fb', false, false),

('ba52fb74-5663-41f9-a72b-5dbe0244f317', 'Item', 'DROPDOWN', 17, 'ee8a3bc7-4253-44f7-bd7c-53b0e8871601', true, false),
('273a1161-2a86-4b96-a024-94cf4f6f4cdf', 'Price per Unit', 'NUMBER', 18, 'ee8a3bc7-4253-44f7-bd7c-53b0e8871601', true, false),
('5dfbc04b-6f2d-4b55-818c-8f7031cdcdc2', 'Quantity', 'NUMBER', 19, 'ee8a3bc7-4253-44f7-bd7c-53b0e8871601', true, false),

-- Receiving Inspecting Report 
('1df80eb4-b171-4bbf-925c-ae09b7d09bad', 'Requisition ID', 'LINK', 1, 'b79c9a66-f112-4bfa-8d5c-88267be24fd8', true, true),
('9d69d6fe-8019-416b-b4e6-41ec71792cb4', 'Quotation ID', 'LINK', 2, 'b79c9a66-f112-4bfa-8d5c-88267be24fd8', true, true),
('18975198-02d3-49b4-af40-232c2c915ba7', 'DR', 'FILE', 3, '39831fe4-00f3-4b5e-b840-aae8f1469841', true, false),
('6317b506-816f-4ce4-a083-b9a94c900446', 'SI', 'FILE', 4, '39831fe4-00f3-4b5e-b840-aae8f1469841', false, false),
('6be1b3b0-8b9d-46fc-bb42-a068d47a76d8', 'QCIR', 'FILE', 5, '39831fe4-00f3-4b5e-b840-aae8f1469841', false, false),
('cf0af133-5e81-4665-aa44-6dd3d5e28b43', 'Item', 'DROPDOWN', 6, '00341355-1ece-47e6-88a2-060fbab8b11a', true, false),
('3ca0dbf6-800f-44e5-ba30-149dd5c211fc', 'Quantity', 'NUMBER', 7, '00341355-1ece-47e6-88a2-060fbab8b11a', true, false),
('d440c116-830b-4339-bcf8-ca49aba9c395', 'Receiving Status', 'TEXT', 8, '00341355-1ece-47e6-88a2-060fbab8b11a', true, true), 

-- Release Order 
('2075f549-bcbf-4719-ae44-ec38b2fab79f', 'Requisition ID', 'LINK', 1, '1416e947-3491-436f-9b20-f0cd705607d0', true, true),
('9fe04f40-a250-4a16-9e6a-b6c8a0b5a4c1', 'Sourced Item ID', 'LINK', 2, '1416e947-3491-436f-9b20-f0cd705607d0', true, true),
('3a8b66dc-2853-467a-a82b-72dd9bc29b40', 'Item', 'DROPDOWN', 3, '0d630b15-3c88-49e0-b588-1e60dd839bcb', true, false),
('4050bfbe-0cbe-443b-a4c7-3851dba2d7c8', 'Quantity', 'NUMBER', 4, '0d630b15-3c88-49e0-b588-1e60dd839bcb', true, false),
('d3d790fe-3d37-421c-91f3-e943ee5941b6', 'Receiving Status', 'TEXT', 5, '0d630b15-3c88-49e0-b588-1e60dd839bcb', true, true), 
('2ea7acb6-37a4-4ced-b5d2-b944c3a1de37', 'Source Project', 'TEXT', 6, '0d630b15-3c88-49e0-b588-1e60dd839bcb', true, true), 

-- Transfer Receipt 
('c336e79e-4a89-49f7-92c3-6de1dddc977b', 'Requisition ID', 'LINK', 1, '47b11674-d641-4680-834e-7fd48f43696b', true, true),
('0778f0ba-bb0f-4110-b19f-38d999d8e8f1', 'Sourced Item ID', 'LINK', 2, '47b11674-d641-4680-834e-7fd48f43696b', true, true),
('a4004713-7b1d-436f-a765-a8da3912f83f', 'Release Order ID', 'LINK', 3, '47b11674-d641-4680-834e-7fd48f43696b', true, true),
('b4e8eda9-a83b-4e56-8455-ab2e32db93f6', 'Transfer Shipment', 'FILE', 4, 'c3d7f001-32ce-4e44-8677-7d2dd16c45dd', true, false),
('75303e92-b8b0-4f6b-a92d-cda798c5639e', 'Transfer Receipt', 'FILE', 5, 'c3d7f001-32ce-4e44-8677-7d2dd16c45dd', true, false),
('490e3c51-d183-4752-88c4-c3f92ff7c15b', 'Item', 'DROPDOWN', 6, 'b2466824-9803-41a2-8abc-5d9f7045c73b', true, false),
('be528e76-6531-4cdd-9725-8aa858219d0d', 'Quantity', 'NUMBER', 7, 'b2466824-9803-41a2-8abc-5d9f7045c73b', true, false),
('054e73e1-601a-4764-b447-903b9b0c6e68', 'Receiving Status', 'TEXT', 8, 'b2466824-9803-41a2-8abc-5d9f7045c73b', true, true), 
('e0d9563f-463d-4f25-8c6e-46463841cd24', 'Source Project', 'TEXT', 9, 'b2466824-9803-41a2-8abc-5d9f7045c73b', true, true);

INSERT INTO option_table (option_id, option_value, option_order, option_field_id) VALUES
-- Requisition 
('f97eb24f-53b2-452b-966e-9a2f1dfd812d', 'Cash Purchase - Advance Payment', 1, '6882287e-57c7-42ae-a672-b0d6c8979b01'),
('6ce7fa3a-9e85-4ab1-9f3b-de931071fa26', 'Cash Purchase - Local Purchase', 2, '6882287e-57c7-42ae-a672-b0d6c8979b01'),
('a73672df-03ea-4bc8-b904-366044819188', 'Order to Purchase', 3, '6882287e-57c7-42ae-a672-b0d6c8979b01'),

-- Quotation 
('345214ae-9523-4f81-b3c1-d118f7735999', 'Email', 1, '039f5c31-6e9c-42ae-aa27-21c0cba12560'),
('3b8437da-7135-4fc5-ae4f-d9e294f096ab', 'Text', 2, '039f5c31-6e9c-42ae-aa27-21c0cba12560'),
('5ca3971c-ab0b-46e0-ad0b-cc48719360d4', 'Other', 3, '039f5c31-6e9c-42ae-aa27-21c0cba12560'),

('57068866-68e7-4b3b-9277-5f402887b65f', '7 PDC', 1, '0dfd9844-656d-4468-9919-a243e2fef1ef'),
('21d0ad95-8395-4acb-b774-9e36fd99d66d', '15 PDC', 2, '0dfd9844-656d-4468-9919-a243e2fef1ef'),
('e4cb98a6-1d14-4a9a-b0df-14b4e26b7ce4', '30 PDC', 3, '0dfd9844-656d-4468-9919-a243e2fef1ef'),
('28d3d825-7b40-4d8d-aa78-19adf3ae9dab', '45 PDC', 4, '0dfd9844-656d-4468-9919-a243e2fef1ef'),
('9763cddd-c663-4be2-ac69-0381e2b908b1', '60 PDC', 5, '0dfd9844-656d-4468-9919-a243e2fef1ef'),
('872fff90-445d-4501-b920-95e08cb051c0', '70 PDC', 6, '0dfd9844-656d-4468-9919-a243e2fef1ef'),
('53c15efc-261d-490c-a362-719ef606f835', '90 PDC', 7, '0dfd9844-656d-4468-9919-a243e2fef1ef'),
('6d75beba-fa74-47dc-a1af-03662caff5b8', '120 PDC', 8, '0dfd9844-656d-4468-9919-a243e2fef1ef'),
('6601bbe7-4703-4dc3-9765-691b8ebee1ad', '7 UPI', 9, '0dfd9844-656d-4468-9919-a243e2fef1ef'),
('4e34a3be-5b8e-44a1-bf8e-fb154dfa83e5', '15 UPI', 10, '0dfd9844-656d-4468-9919-a243e2fef1ef'),
('b4d7b068-f3e6-4bcd-8325-0f18c58580b2', '30 UPI', 11, '0dfd9844-656d-4468-9919-a243e2fef1ef'),
('d70e38bd-60d6-44a1-9dea-74c51ada3467', '35 UPI', 12, '0dfd9844-656d-4468-9919-a243e2fef1ef'),
('87ae575e-71a8-4e26-bf2c-45845269789a', '45 UPI', 13, '0dfd9844-656d-4468-9919-a243e2fef1ef'),
('2260ca32-4cd4-4af3-80ef-701f6afba337', '60 UPI', 14, '0dfd9844-656d-4468-9919-a243e2fef1ef'),
('0c5a1ece-a5a2-45b8-91e3-cb99c43a31eb', '90 UPI', 15, '0dfd9844-656d-4468-9919-a243e2fef1ef'),
('2637dcd9-6420-44a7-a842-9ef9c73effda', '120 UPI', 16, '0dfd9844-656d-4468-9919-a243e2fef1ef'),
('0ce51086-27ae-4440-9c37-5c67c35914df', '7 DAYS', 17, '0dfd9844-656d-4468-9919-a243e2fef1ef'),
('77f73271-50b2-4480-ab0a-0affc08517f2', 'COD', 18, '0dfd9844-656d-4468-9919-a243e2fef1ef'),
('2ae3b91d-dbba-408f-a3e7-d69085efb88e', 'DATED', 19, '0dfd9844-656d-4468-9919-a243e2fef1ef'),
('efc90008-111a-4c41-b16e-4ab9e22277fd', 'FO3', 20, '0dfd9844-656d-4468-9919-a243e2fef1ef'),
('ff8af524-7c9f-4d88-881c-c3cfef70c0ae', 'LC', 21, '0dfd9844-656d-4468-9919-a243e2fef1ef'),
('ae5fa8db-44f0-4b21-829c-aef2500bc8d1', 'PB', 22, '0dfd9844-656d-4468-9919-a243e2fef1ef'),
('fb8aabe9-2ea1-4471-ba12-47a322a4e0ad', 'TT', 23, '0dfd9844-656d-4468-9919-a243e2fef1ef');

INSERT INTO form_team_group_table (form_team_group_id, form_id, team_group_id) VALUES
('39aa91ef-7b4a-4f16-ba9c-7e78cefd90d3', 'd13b3b0f-14df-4277-b6c1-7c80f7e7a829', '9f7de2eb-4073-43e6-b662-d688ccba4b26'),
('169ba447-3b92-4510-9b2a-b9021a1b8774', 'e5062660-9026-4629-bc2c-633826fdaa24', '72ef0fd8-72ef-487d-9b88-ee61ddc3f275'),
('3be21f1a-ee76-4dce-9d94-f0c9f7224553', 'a732196f-9779-45e2-85fa-7320397e5b0a', '51277fb9-7f1f-4c80-a122-c3fea3cf3ed7'),
('8fa70223-807d-41eb-898b-31f16a34fb4f', '5782d70a-5f6b-486c-a77f-401066afd005', '72ef0fd8-72ef-487d-9b88-ee61ddc3f275'),
('a21fd316-1227-46fa-858f-d1ce8173f962', '391c1b8c-db12-42ff-ad4a-4ea7680243d7', '72ef0fd8-72ef-487d-9b88-ee61ddc3f275'),
('2b3806c6-c61c-46d4-a56e-eb563e2fc78c', '8e173d92-c346-4fb5-8ef2-490105e19263', '72ef0fd8-72ef-487d-9b88-ee61ddc3f275');

DROP FUNCTION IF EXISTS item_seed;
CREATE FUNCTION item_seed()
RETURNS VOID AS $$
  plv8.subtransaction(function(){

    const itemData = [
      {
        generalName: "REINFORCED STEEL BAR",
        unit: "piece",
        description: ["TYPE", "DIAMETER", "LENGTH", "GRADE MARK", "MATERIAL TYPE"],
        descriptionField: [
          ["CUT & BEND", "NONE"],
          ["10 mm", "12 mm", "16 mm", "20 mm", "25 mm", "40 mm"],
          ["6 m", "6.5 m", "7 m", "7.5 m", "9 m", "12 m"],
          ["60", "40", "75"],
          ["WELDABLE", "NON-WELDABLE"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['3']",
      },
      {
        generalName: "ELECTRICAL WIRE",
        unit: "meter",
        description: [
          "WIRE TYPE",
          "INSULATION TYPE",
          "WIRE DIAMETER",
          "CORES",
          "COLOR",
          "BRAND",
        ],
        descriptionField: [
          ["STRANDED", "SOLID"],
          ["THHN", "THHN/THWN-2", "THWN", "THW", "TW", "TF", "TFN", "TFFN", "PDX"],
          ["0.75 mm²", "300 mm²"],
          ["1C", "2C", "3C", "4C", "5C", "10C"],
          ["BLUE", "RED", "YELLOW", "GREEN", "WHITE", "BLACK", "BARE"],
          ["ROYAL CORD", "PHELPS DODGE"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['26']",
      },
      {
        generalName: "BOLT",
        unit: "piece",
        description: [
          "MATERIAL TYPE",
          "TYPE",
          "HEAD",
          "COMPONENT",
          "NOMINAL SIZE",
          "LENGTH",
          "IS RENTAL",
        ],
        descriptionField: [
          ["STAINLESS STEEL", "ALUMINUM"],
          ["FULL THREAD", "SPACER LOCKED STAINLESS", "QUICK", "UNIFIX"],
          [
            "HEX",
            "COUNTERSUNK",
            "DOME",
            "BUTTON",
            "HEX WASHER",
            "PAN",
            "SOCKET",
            "SLOTTED HEX WASHER",
          ],
          ["NUT", "NUT WITH WASHER", "NONE"],
          ["M16 mm", "M10 mm", "M12 mm", "M24 mm", "M19 mm"],
          [
            "50 mm",
            "30 mm",
            "100 mm",
            "25 mm",
            "63.5 mm",
            "19 mm",
            "13 mm",
            "38 mm",
          ],
          ["YES", "NO"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['5']",
      },
      {
        generalName: "CEMENT",
        unit: "kilogram",
        description: ["TYPE", "BRAND"],
        descriptionField: [
          ["TYPE I", "TYPE II", "TYPE IT", "TYPE IP"],
          ["CEMEX", "EAGLE", "HOLCIM", "PORTLAND", "REPUBLIC"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['3']",
      },
      {
        generalName: "FIXED CLAMP",
        unit: "piece",
        description: ["SIZE"],
        descriptionField: [["1 1/2 inch", "2 inch"]],
        glAccount: "1010601",
        divisionIdList: "ARRAY ['22']",
      },
      {
        generalName: "RIVET",
        unit: "piece",
        description: ["TYPE", "DIAMETER", "GRIP"],
        descriptionField: [
          ["BLIND", "DRIVE", "FLANGE HEAD"],
          ["3/16 inch", "5/32 inch", "1/8 inch"],
          ["5/8 inch", "3/8 inch", "1/2 inch", "3/4 inch"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['5']",
      },
      {
        generalName: "ENGINE OIL",
        unit: "liter",
        description: ["PRODUCT NAME", "BRAND"],
        descriptionField: [
          [
            "RIMULA R1 30",
            "RIMULA R1 40",
            "RIMULA R3 10W",
            "RIMULA R3 ND 15W-40",
            "RIMULA R3+ 30",
            "RIMULA R3+ 40",
          ],
          ["SHELL"],
        ],
        glAccount: "1010605",
        divisionIdList: "ARRAY ['15']",
      },
      {
        generalName: "TRANSMISSION AND GEAR OIL",
        unit: "liter",
        description: ["PRODUCT NAME", "BRAND"],
        descriptionField: [
          [
            "SPIRAX S2 A 140",
            "SPIRAX S2 A 80W-90",
            "SPIRAX S2 A 85W-140",
            "SPIRAX S2 A 90",
            "SPIRAX S2 G 140",
            "SPIRAX S2 G 80W-90",
            "SPIRAX S2 G 90",
            "SPIRAX S3 AX 80W-90",
            "SPIRAX S3 G 80W-90",
            "SPIRAX S6 AXME 75W-90",
            "SPIRAX S6 AXME 80W-140",
          ],
          ["SHELL"],
        ],
        glAccount: "1010605",
        divisionIdList: "ARRAY ['42']",
      },
      {
        generalName: "GREASE",
        unit: "liter",
        description: ["PRODUCT NAME", "BRAND"],
        descriptionField: [["SHELL GADUS S2 V220 0"], ["SHELL"]],
        glAccount: "1010605",
        divisionIdList: "ARRAY ['15']",
      },
      {
        generalName: "HYDRAULIC OIL AND FLUID",
        unit: "liter",
        description: ["PRODUCT NAME", "BRAND"],
        descriptionField: [
          ["SHELL TELLUS S2 MX 68 ", "MOBIL NUTO H 68"],
          ["SHELL", "MOBIL"],
        ],
        glAccount: "1010605",
        divisionIdList: "ARRAY ['45']",
      },
      {
        generalName: "DEGREASER",
        unit: "liter",
        description: ["PRODUCT NAME", "BRAND"],
        descriptionField: [["GREASOLVE"], ["PETRON"]],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['9']",
      },
      {
        generalName: "FUEL",
        unit: "liter",
        description: ["PRODUCT"],
        descriptionField: [["DIESEL", "GASOLINE"]],
        glAccount: "1010605",
        divisionIdList: "ARRAY ['28']",
      },
      {
        generalName: "DIESEL EXHAUST FLUID",
        unit: "liter",
        description: ["PRODUCT", "BRAND"],
        descriptionField: [["ADBLUE"], ["PRO-99", "PURE BLULE"]],
        glAccount: "1010605",
        divisionIdList: "ARRAY ['1']",
      },
      {
        generalName: "COOLANT AND ANTI-FREEZE",
        unit: "liter",
        description: ["PRODUCT", "BRAND"],
        descriptionField: [
          [
            "HAVOLINE XTENDED LIFE ANTIFREEZE / COOLANT CONCENTRATE",
            "RADIATOR COOLANT",
            "DELO XLI CI PREMIXED",
            "COOLANT READY MIX RAF 12+",
          ],
          ["CALTEX", "DERFOE", "SEGA", "LIQUI MOLY"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['0']",
      },
      {
        generalName: "READY MIX CONCRETE",
        unit: "cubic meter",
        description: [
          "COMPRESSIVE STRENGTH",
          "DESIGN",
          "GRAVEL SIZE",
          "CURING PERIOD",
        ],
        descriptionField: [
          [
            "1500 PSI",
            "2000 PSI",
            "2500 PSI",
            "3000 PSI",
            "3500 PSI",
            "4000 PSI",
            "4500 PSI",
            "5000 PSI",
            "6000 PSI",
          ],
          ["ORDINARY DESIGN (ORD)", "PUMP CRETE DESIGN (PCD)"],
          ["3/8", "3/4", "1"],
          ["7 days", "14 days", "21 days", "28 days"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['3']",
      },
      {
        generalName: "SCREW",
        unit: "piece",
        description: ["LENGTH", "SCREW DIAMETER"],
        descriptionField: [
          ["1 1/2 inch", "1 inch", "2 inch", "3/4 inch"],
          ["3 mm"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['1']",
      },
      {
        generalName: "GI PIPE",
        unit: "piece",
        description: ["DIAMETER", "LENGTH", "WALL THICKNESS", "IS USED"],
        descriptionField: [
          ["1 1/2 inch"],
          ["1 m - 1.5 m", "1.51 m - 2.5 m", "6 m"],
          ["SCH.40", "SCH.20"],
          ["YES", "NULL"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['22']",
      },
      {
        generalName: "COVID19 RAPID ANTIGEN TEST KIT",
        unit: "piece",
        description: ["BRAND", "MANUFACTURER"],
        descriptionField: [
          ["INNOVITA", "PANBIO"],
          ["INNOVITA", "ABBOTT"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['22']",
      },
      {
        generalName: "KNITTED GLOVE",
        unit: "pair",
        description: ["PALM COATING", "TYPE", "SIZE"],
        descriptionField: [
          ["RUBBERIZED", "LATEX"],
          ["DOTTED", "DIPPED"],
          ["SMALL", "MEDIUM", "LARGE", "EXTRA LARGE"],
        ],
        glAccount: "1010604",
        divisionIdList: "ARRAY ['45']",
      },
      {
        generalName: "GOGGLES",
        unit: "pair",
        description: ["SIMILAR NAME", "COLOR"],
        descriptionField: [
          ["SAFETY GLASSES", "FLASH GOGGLE", "WELDING GOGGLES"],
          ["CLEAR", "DARK"],
        ],
        glAccount: "1010604",
        divisionIdList: "ARRAY ['1']",
      },
      {
        generalName: "HARD HAT",
        unit: "piece",
        description: ["KIND", "STYLE", "ADD-ONS", "BRIM", "COLOR"],
        descriptionField: [
          ["HARD HAT", "USED HARD HAT", "FIREFIGHTER HARD HAT"],
          ["V-GARD", "TOPGARD", "COMFO-CAP", "NONE"],
          [
            "WITH LINER",
            "WITH CHIN STRAP",
            "WITH LAMP BRACKET",
            "WITH VISOR AND BRACKET",
          ],
          ["FULL BRIM", "HALF BRIM", "NO BRIM"],
          ["WHITE", "GREEN", "RED", "ORANGE", "YELLOW", "BLUE"],
        ],
        glAccount: "1010604",
        divisionIdList: "ARRAY ['8']",
      },
      {
        generalName: "T SHIRT",
        unit: "piece",
        description: ["TYPE", "SIZE", "COLOR"],
        descriptionField: [
          ["LONG SLEEVE"],
          ["SMALL", "MEDIUM", "LARGE"],
          ["MINT GREEN"],
        ],
        glAccount: "1010604",
        divisionIdList: "ARRAY ['32']",
      },
      {
        generalName: "REFLECTORIZED VEST",
        unit: "piece",
        description: ["COLOR", "ADD-ONS"],
        descriptionField: [
          ["WHITE", "GREEN", "RED", "ORANGE", "YELLOW", "BLUE", "SILVER", "BLACK"],
          ["WITH SCIC LOGO", "WITH SMCC LOGO"],
        ],
        glAccount: "1010604",
        divisionIdList: "ARRAY ['31']",
      },
      {
        generalName: "EAR PLUG",
        unit: "pack",
        description: ["MODEL", "MANUFACTURER"],
        descriptionField: [["MAX1"], ["HOWARD LIGHT"]],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['7']",
      },
      {
        generalName: "TAPE",
        unit: "piece",
        description: [
          "KIND",
          "SIMILAR NAME",
          "TYPE",
          "BRAND",
          "MODEL",
          "COLOR",
          "DIMENSION",
          "SIZE",
        ],
        descriptionField: [
          [
            "ELECTRICAL TAPE",
            "DUCT TAPE",
            "POLYETHYLENE TAPE",
            "RUBBER MASTIC TAPE",
            "COTTON TAPE",
            "RESTRICTING TAPE",
            "PETRO TAPE",
            "TEFLON TAPE",
            "MASKING TAPE",
            "GYPSUM TAPE",
            "PVC TAPE",
            "SELF-ADHESIVE TAPE",
            "DOUBLE SIDED TAPE",
            "PLASTIC LABEL TAPE",
            "FISH TAPE",
            "SURGICAL TAPE",
            "CONSPICUITY TAPE",
            "HAZARD TAPE",
            "CAUTION TAPE",
            "DANGER TAPE",
            "COPPER TAPE",
          ],
          [
            "DENSO TAPE",
            "SEALING TAPE",
            "PAPER TAPE",
            "MESH TAPE",
            "DRAWING TAPE",
            "MICROPORE TAPE",
          ],
          ["SEMI-CONDUCTING", "FIRM", "SIKAPROOF"],
          ["SHAIC", "3M", "SIKA"],
          ["2228", "P-4", "PT-310", "PF-320", "TAPE-120", "NONE"],
          ["RED", "YELLOW", "BLUE", "GREEN", "WHITE", "CLEAR", "NOT APPLICABLE"],
          [
            "1/2 inch",
            "1I inch",
            "1 1/2 inch",
            "3/4 inch",
            "2 inch",
            "3 inch",
            "4 inch",
            "6 inch",
            "7/8 inch X 15 foot",
            "12 inch",
            "1 m X 50 m",
            "1.1 mm X 50 mm X 10 m",
            "0.2 mm X 50 mm X 30 m ",
          ],
          ["SMALL", "MEDIUM", "BIG"],
        ],
        glAccount: "1010606",
        divisionIdList: "ARRAY ['31']",
      },
      {
        generalName: "PLASTIC CONE",
        unit: "piece",
        description: ["KIND", "SIMILAR NAME", "SIZE"],
        descriptionField: [
          ["PLASTIC CONE", "PUR - PLASTIC CONE", "USED"],
          ["PYLON", "ROAD CONE", "SAFETY CONE", "CONSTRUCTION CONE"],
          ["12 mm", "15 mm", "16 mm", "20 mm", "21 mm", "23 mm X 27 mm", "50 mm"],
        ],
        glAccount: "1010601",
        divisionIdList: "ARRAY ['1']",
      },
      {
        generalName: "GASKET",
        unit: "piece",
        description: ["TYPE", "DIAMETER NOMINAL", "THICKNESS"],
        descriptionField: [["RUBBER GASKET"], ["50 mm"], ["10 mm"]],
        glAccount: "1010604",
        divisionIdList: "ARRAY ['3']",
      },
      {
        generalName: "DUST MASK",
        unit: "piece",
        description: ["KIND"],
        descriptionField: [["WITH FILTER", "WITHOUT FILTER"]],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['13']",
      },
      {
        generalName: "CROSS BRACE",
        unit: "piece",
        description: ["LENGTH"],
        descriptionField: [["1.70 m", "2.20 m"]],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['41']",
      },
      {
        generalName: "PAPER CLIP",
        unit: "piece",
        description: ["KIND", "SIZE"],
        descriptionField: [
          ["BINDER CLIP", "BULLDOG CLIP", "USED BINDER CLIP", "USED BULLDOG CLIP"],
          [
            "3/4 inch",
            "1 inch",
            "1 1/2 inch",
            "1 1/4 inch",
            "1 5/8 inch",
            "2 inch",
            "3 inch",
            "4 inch",
            "5 inch",
          ],
        ],
        glAccount: "1010606",
        divisionIdList: "ARRAY ['12']",
      },
      {
        generalName: "PIPE CLAMP",
        unit: "piece",
        description: ["KIND", "DIAMETER", "BRAND"],
        descriptionField: [
          [
            "SWIVEL CLAMP",
            "SWIVEL COMBINATION CLAMP",
            "PUR - SWIVEL BEAM CLAMP",
            "REN - SWIVEL BEAM CLAMP",
            "FIXED CLAMP",
            "SUPERSLIM",
            "PUR - SUPERSLIM CLAMP",
          ],
          ["3/4", "1", "1 1/2", "1 1/4", "1 5/8", "2", "3", "4", "5"],
          ["KOREA", "JAPAN", "NONE"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['5']",
      },
      {
        generalName: "CLAMP ASSEMBLY",
        unit: "piece",
        description: ["KIND", "PART NUMBER"],
        descriptionField: [
          ["A-CLAMP ASSEMBLY", "PUR - A-CLAMP ASSEMBLY", "CLAMP LIGHT ASSEMBLY"],
          ["B265", "100359", "NONE"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['28']",
      },
      {
        generalName: "STEEL BALL",
        unit: "piece",
        description: ["SIZE"],
        descriptionField: [["1/8 inch"]],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['5']",
      },
      {
        generalName: "FLAT TIE",
        unit: "piece",
        description: ["LENGTH", "THICKNESS"],
        descriptionField: [
          ["900 mm", "300 mm"],
          ["3 mm", "4 mm", "2 mm"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['4']",
      },
      {
        generalName: "ENVELOPE",
        unit: "pack",
        description: ["TYPE", "COLOR", "ENVELOPE NUMBER", "DIMENSION"],
        descriptionField: [
          ["PLASTIC", "AIRMAIL", "EXPANDED", "FILE CASE", "COIN"],
          ["BROWN", "WHITE", "CLEAR"],
          ["NONE", "4 1/2", "7 1/2", "8 1/2"],
          [
            "SHORT (3 1/2 X 6)",
            "LONG (3 5/8 X 6 1/2)",
            "3 X 4 1/2",
            "4 X 6 3/8",
            "4 X 7 1/2",
          ],
        ],
        glAccount: "1010606",
        divisionIdList: "ARRAY ['12']",
      },
      {
        generalName: "CONCRETE HOLLOW BLOCK",
        unit: "piece",
        description: [
          "KIND",
          "BLOCK TYPE",
          "WIDTH",
          "LENGTH",
          "HEIGHT",
          "COMPRESSIVE STRENGTH",
          "CURING PERIOD",
        ],
        descriptionField: [
          ["LOAD BEARING", "NON LOAD BEARING"],
          [
            "BEAM",
            "CORE STRETCHER",
            "DOUBLE END",
            "HALF",
            "L-CORNER",
            "LOUVER",
            "SINGLE END ",
            "STRETCHER",
            "STRETCHER SEALED END",
          ],
          ["4 in / 90 mm", "6 in / 140 mm", "8 in / 190 mm"],
          ["190 mm", "200 mm"],
          ["390 mm", "400 mm"],
          [
            "150 psi",
            "300 psi",
            "350 psi",
            "400 psi",
            "450 psi",
            "550 psi",
            "650 psi",
            "700 psi",
            "750 psi",
            "800 psi",
            "1000 psi",
            "1100 psi",
            "1450 psi",
            "1500 psi",
          ],
          ["7 days", "14 days", "21 days", "28 days"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['3']",
      },
      {
        generalName: "TEKSCREW",
        unit: "piece",
        description: ["TYPE", "SCREW HEAD TYPE", "SCREW DIAMETER", "LENGTH"],
        descriptionField: [
          ["STAINLESS STEEL", "STEEL", "WOOD", "METAL"],
          ["FLAT", "HEX", "OVAL", "PAN", "PANCAKE", "WAFER"],
          ["8", "12", "14"],
          ["16", "20", "25", "35", "45", "50", "55", "65", "75"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['5']",
      },
      {
        generalName: "WEDGE PINS",
        unit: "piece",
        description: ["LENGTH"],
        descriptionField: [["70 mm"]],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['33']",
      },
      {
        generalName: "VIBRO SAND",
        unit: "cubic meter",
        description: ["GRAIN SIZE"],
        descriptionField: [["2 mm", "4 mm"]],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['26']",
      },
      {
        generalName: "CONCRETE MIX",
        unit: "cubic meter",
        description: ["DESCRIPTION"],
        descriptionField: [["MIX SAND AND GRAVEL"]],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['3']",
      },
      {
        generalName: "FORM",
        unit: "pad",
        description: ["FORM TYPE"],
        descriptionField: [
          [
            "SCAFFOLDING CHECKLIST",
            "ACCOUNT PAYABLE VOUCHER",
            "APPLICATION FOR LEAVE",
            "AUTHORITY TO DEDUCT",
            "CHECK VOUCHER NEW SCIC",
            "CHECK VOUCHER NECO",
            "CHECK VOUCHER XWELL",
            "CUSTODY RECEIPT",
            "DAILY ACCOMPLISHMENT REPORT",
            "DAILY AGGREGATES HAULING / DELIVERY REPORT",
            "DELIVERY RECEIPT",
            "DISCREPANCY REPORT",
            "EUR",
            "FOWA",
            "GATE PASS",
            "JOURNAL VOUCHER",
            "LIQUIDATION/REIMBURSEMENT",
            "MAJOR MATERIALS INVENTORY REPORT",
            "MATERIAL ISSUANCE SLIP",
            "PROVISIONAL RECEIPT",
            "PURCHASE ORDER",
            "REQUEST FOR INSPECTION",
            "REQUEST FOR PAYMENT",
            "REQUEST FOR QA/QC RECEIVING INSPECTION",
            "RIR",
            "TRANSFER ORDER",
            "TRANSFER SLIP",
            "WORKING ADVANCE VOUCHER",
            "EQUIPMENT INSPECTION CHECKLIST",
            "DAILY TIMESHEET",
          ],
        ],
        glAccount: "1010606",
        divisionIdList: "ARRAY ['12']",
      },
      {
        generalName: "TIME CARD",
        unit: "pack",
        description: ["MODEL", "PACKAGING SIZE"],
        descriptionField: [["9000+"], ["100 PCS PER PACK"]],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['5']",
      },
      {
        generalName: "ALUMINUM CONDUCTOR STEEL REINFORCED",
        unit: "piece",
        description: ["CATEGORY", "WIRE GAUGE"],
        descriptionField: [
          ["AWG", "MCM"],
          ["1/0", "4/0", "2/0", "250", "336.4"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['7']",
      },
      {
        generalName: "STEEL ROPE",
        unit: "meter",
        description: [
          "TYPES",
          "ADDITIONAL DESCRIPTION",
          "ROPE DIAMETER",
          "STRANDS",
        ],
        descriptionField: [
          ["STAINLESSS STEEL", "GALVANIZED STEEL", "WIRE", "UNGALVANIZED"],
          ["ANTI-TWISTING BRAIDED"],
          ["20 mm"],
          ["12"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['10']",
      },
      {
        generalName: "COUPLER",
        unit: "piece",
        description: ["TYPE", "SUB CATEGORY", "DIAMETER"],
        descriptionField: [
          ["MECHANICAL", "OPTICAL", "ELECTRICAL"],
          [
            "RIGID",
            "FLEXIBLE",
            "SLEEVE",
            "FIBER OPTIC",
            "WIRE NUT",
            "TERMINAL BLOCKS",
            "CONNECTOR",
          ],
          ["40 mm"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['43']",
      },
      {
        generalName: "CONCRETE HARDENER",
        unit: "liter",
        description: ["BRAND", "MODEL", "VOLUME"],
        descriptionField: [
          ["SIKA", "DRIBOND", "ABC"],
          ["CUREHARD-24"],
          ["CUREHARD-24"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['9']",
      },
      {
        generalName: "IRON SHEET",
        unit: "piece",
        description: [
          "FINISH",
          "SURFACE",
          "ROOFING PROFILE",
          "THICKNESS",
          "LENGTH",
          "WIDTH",
          "PAINT",
        ],
        descriptionField: [
          ["CORRUGATED IRON", "GALVANIZED", "COLD-ROLLED", "HOT ROLLED"],
          [
            "MATT",
            "HIGH GLOSS",
            "DOUBLE COATED",
            "WOOD PATTERN",
            "MARBLE PATTERN",
            "WINKLE",
          ],
          ["RIB TYPE", "TRAPEZOID", "R-SPAN", "TWIN RIB"],
          ["0.4 mm"],
          ["8 ft"],
          ["4 ft"],
          ["RED", "GREEN", "BLUE", "NOT AVAILABLE"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['5']",
      },
      {
        generalName: "PAINT BRUSH",
        unit: "piece",
        description: ["BRUSH TYPE", "SIZE"],
        descriptionField: [
          [
            "MEDIUM-SIZED",
            "LARGE-SIZED",
            "SMALL BRISTLE",
            "SYNTHETIC BRISTLE",
            "FLAT SASH",
            "ROUND SASH",
            "ANGLED SASH",
            "FLAGGED BRISTLE",
            "STENCIL",
            "FINISHING",
            "FOAMING",
            "COTTON",
          ],
          [
            "1/2 inch",
            "3/4 inch",
            "1 inch",
            "1 1/2 inch",
            "1 3/4 inch",
            "2 inch",
            "2 1/2 inch",
            "2 3/4 inch",
            "3 inch",
            "3 1/2 inch",
            "3 3/4",
            "4 inch",
            "4 1/2 inch",
            "4 3/4 inch",
            "5 inch",
            "5 1/2 inch",
            "5 3/4 inch",
            "6 inch",
            "6 1/2 inch",
            "6 3/4 inch",
            "7 inch",
            "7 1/2 inch",
            "7 3/4 inch",
            "8 inch",
            "8 1/2 inch",
            "8 3/4 inch",
            "9 inch",
            "9 1/2 inch",
            "9 3/4 inch",
            "14 inch",
            "18 inch",
          ],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['9']",
      },
      {
        generalName: "PAINT",
        unit: "liter",
        description: ["TYPE", "FINISH", "BRAND", "MODEL", "COLOR"],
        descriptionField: [
          [
            "SPRAY",
            "ACRYLIC",
            "URETHANE",
            "QUICK DRYING ENAMEL (QDE)",
            "REFLECTORIZED",
            "EPOXY",
            "WATERPROOF",
            "LATEX",
            "POLYURETHANE",
            "ROOF GUARD",
            "EPOXY PRIMER",
            "INTERMEDIATE",
            "THINNER",
            "EPOXY ENAMEL",
            "ALUMINUM",
            "BITUMEN",
            "TRAFFIC",
          ],
          ["CHLORINATED RUBBER-BASED REFLECTORIZED", "SEMI-GLOSS"],
          [
            "BOYSEN",
            "DAVIES",
            "JOTUN",
            "ELASTOMERIC",
            "PERMATEX",
            "INTERGARD",
            "AHEMPELA",
            "KERAMIFLOOR",
          ],
          [
            "TANKGUARD",
            "701",
            "INTERTHANE 990",
            "SIGMACOVER-620",
            "251",
            "269",
            "850",
            "SILVUM-51570",
            "KF-90",
            "KF-61",
          ],
          [
            "REDBROWN",
            "WHITE",
            "MINT GREEN",
            "MARKER BLUE",
            "GREY",
            "BLACK",
            "BLUE",
            "IVORY RAL (1014)",
            "FLAT WHITE",
            "EAW SIENNA",
            "HANSA YELLOW",
            "LAMP BLACK",
            "THALO GREEN",
            "THOULIDINE RED",
            "THALO BLUE",
            "BLUE OXIDE",
            "BON RED",
            "BRIGHT WHITE",
            "CATERPILLAR YELLOW",
            "CHROME YELLOW LIGHT",
            "CHROME FLAT BLACK",
            "CLEAR",
          ],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['9']",
      },
      {
        generalName: "STOCK CARD",
        unit: "pad",
        description: ["LENGTH", "WIDTH"],
        descriptionField: [
          ["7 inch", "11 inch"],
          ["5 inch", "8.5 inch"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['43']",
      },
      {
        generalName: "INVENTORY STOCK TAG",
        unit: "pad",
        description: ["LENGTH", "WIDTH"],
        descriptionField: [
          ["5.25 inch", "6.25 inch"],
          ["2.625 inch", "3.125 inch"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['48']",
      },
      {
        generalName: "WASHER",
        unit: "piece",
        description: ["MATERIAL", "TYPE", "NOMINAL SIZE"],
        descriptionField: [
          ["STEEL", "ALUMINUM"],
          [
            "LOCK",
            "FLAT",
            "FENDER",
            "FINISHING",
            "SPLIT LOCK",
            "DOCK",
            "SQUARE",
            "SPRING",
          ],
          ["M16 mm", "M10 mm", "M12 mm", "M24 mm", "M19 mm"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['22']",
      },
      {
        generalName: "NUTS",
        unit: "piece",
        description: ["MATERIAL", "TYPE", "NOMINAL SIZE"],
        descriptionField: [
          ["STEEL", "ALUMINUM", "STAINLESS"],
          [
            "HEX NUTS",
            "NYLON INSERT LOCK NUTS",
            "WING NUTS",
            "CAP NUTS",
            "SQUARE NUTS",
            "FLANGE NUTS",
          ],
          ["M16 mm", "M10 mm", "M12 mm", "M24 mm", "M19 mm"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['5']",
      },
      {
        generalName: "PIPE HOOK",
        unit: "piece",
        description: ["AXIS", "DESCRIPTION"],
        descriptionField: [
          ["HORIZONTAL", "VERTICAL"],
          ["SHORT", "LONG"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['4']",
      },
      {
        generalName: "METAL SCREW",
        unit: "piece",
        description: [
          "TYPE",
          "MATERIAL",
          "SCREW HEAD TYPE",
          "SCREW DIAMETER",
          "LENGTH",
        ],
        descriptionField: [
          ["SELF TAPPING", "SELF DRILLING", "MACHINE"],
          ["STAINLESS STEEL", "STEEL", "METAL"],
          ["FLAT", "HEX", "OVAL", "PAN", "PANCAKE", "WAFER"],
          ["8", "12", "14"],
          ["16", "20", "25", "35", "45", "50", "55", "65", "75"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['6']",
      },
      {
        generalName: "TIE ROD",
        unit: "piece",
        description: ["DIAMETER", "LENGTH"],
        descriptionField: [
          ["17 mm"],
          ["0.6 m", "1 m", "1.8 m", "2.1 m", "2.8 m", "3 m", "4 m", "6 m"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['13']",
      },
      {
        generalName: "WOOD SCREW",
        unit: "piece",
        description: [
          "TYPE",
          "MATERIAL ",
          "SCREW HEAD TYPE",
          "SCREW DIAMETER",
          "LENGTH",
        ],
        descriptionField: [
          ["SELF TAPPING", "SELF DRILLING", "MACHINE"],
          ["STAINLESS STEEL", "STEEL", "METAL"],
          ["FLAT", "HEX", "OVAL", "PAN", "PANCAKE", "WAFER"],
          ["8 mm", "12 mm", "14 mm"],
          [
            "16 mm",
            "20 mm",
            "25 mm",
            "35 mm",
            "45 mm",
            "50 mm",
            "55 mm",
            "65 mm",
            "75 mm",
          ],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['31']",
      },
      {
        generalName: "TIE WIRE",
        unit: "meter",
        description: ["IS COATED", "Gauge NO"],
        descriptionField: [
          ["With PVC Coat", "Without PVC Coat"],
          ["8", "10", "12", "14", "16", "18", "20", "22"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['8']",
      },
      {
        generalName: "SHORING JACK",
        unit: "piece",
        description: ["TYPE", "LENGTH", "DIAMETER"],
        descriptionField: [
          ["U HEAD", "JACK BASE", "SWIVEL JACK BASE", "SCAFFOLDING BASE PLATE"],
          ["1.7 m", "2.2 m", "3 m", "4.2 m", "6 m"],
          ["30 mm", "32 mm", "34 mm"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['45']",
      },
      {
        generalName: "JOINT PIN",
        unit: "piece",
        description: ["FORMWORKS TYPE", "SPECS", "DIMENSION"],
        descriptionField: [["PUR", "REN"], ["HD", "RINGLOCK"], ["48 mm X 200 mm"]],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['32']",
      },
      {
        generalName: "ACOUSTIC CEILING BOARD",
        unit: "piece",
        description: ["DESIGN", "DIMENSION"],
        descriptionField: [
          [
            "FINE FISSURED",
            "MILANO",
            "TEXTURA",
            "MAXIBOARD FINE FISSURED",
            "ARMSTRONG FINE FISSURED",
            "ARMSTRONG DUNE",
            "ARMSTRONG FINE FISSURED BEVELED TEGULAR",
            "ARMSTRONG DUNE BEVELED TEGULAR",
            "DAIEKN SMOOTH FINISH",
            "MAXIBOARD FLEECE",
          ],
          ["60 mm X 60 mm", "60 mm X 60 mm X 4 ft", "600 mm X 600 mm X 4 ft"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['9']",
      },
      {
        generalName: "SUPERSLIM PIN",
        unit: "kilogram",
        description: ["FORMWORKS TYPE", "SIZE"],
        descriptionField: [["PUR", "REN"], ["19 mm"]],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['41']",
      },
      {
        generalName: "SPRING CLIP",
        unit: "kilogram",
        description: ["FORMWORKS TYPE", "MATERIAL", "SIZE"],
        descriptionField: [["PUR", "REN"], ["S/S"], ["19 mm"]],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['10']",
      },
      {
        generalName: "GYPSUM SCREW",
        unit: "piece",
        description: [
          "TYPE",
          "MATERIAL ",
          "SCREW HEAD TYPE",
          "SCREW DIAMETER",
          "LENGTH",
        ],
        descriptionField: [
          ["S TYPE", "W TYPE", "G TYPE"],
          ["STAINLESS STEEL", "STEEL", "METAL"],
          ["FLAT", "HEX", "OVAL", "PAN", "PANCAKE", "WAFER"],
          ["8 mm", "12 mm", "14 mm"],
          ["16 mm", "25 mm", "35 mm", "45 mm", "50 mm", "55 mm", "65 mm", "75 mm"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['33']",
      },
      {
        generalName: "AAC BLOCK ADHESIVE",
        unit: "bag",
        description: ["NET WEIGHT PER BAG"],
        descriptionField: [["25K g"]],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['48']",
      },
      {
        generalName: "CABLE",
        unit: "meter",
        description: ["CABLE TYPE", "VOLTAGE", "COLOR", "INSULATION THICKNESS"],
        descriptionField: [
          ["XLPE"],
          ["MEDIUM"],
          ["BROWN", "BLUE", "GREEN", "YELLOW", "RED"],
          ["6 mm"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['1']",
      },
      {
        generalName: "ADMIXTURE",
        unit: "liter",
        description: ["BRAND"],
        descriptionField: [["CHRYSO OMEGA 98S", "SUPERKONTARD R2", "SHOT-SET 250"]],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['11']",
      },
      {
        generalName: "LOG BOOK",
        unit: "piece",
        description: ["SIZE", "NO. OF PAGES"],
        descriptionField: [
          ["JUNIOR", "REGULAR"],
          ["150", "200", "300"],
        ],
        glAccount: "1010606",
        divisionIdList: "ARRAY ['12']",
      },
      {
        generalName: "RAIN COAT",
        unit: "piece",
        description: ["TYPE ", "SIZE "],
        descriptionField: [
          ["JACKET AND PANTS", "KNEE LENGTH"],
          [
            "Large",
            "Small",
            "Medium",
            "Extra Large",
            "Double Extra Large",
            "Extra Small",
          ],
        ],
        glAccount: "1010604",
        divisionIdList: "ARRAY ['5']",
      },
      {
        generalName: "STAMP PAD",
        unit: "piece",
        description: ["BRAND"],
        descriptionField: [["Best Buy", "Orions", "HBW", "Joy", "Artline"]],
        glAccount: "1010606",
        divisionIdList: "ARRAY ['12']",
      },
      {
        generalName: "SHEET PILE",
        unit: "piece",
        description: [
          "MATERIAL",
          "METHOD OF MANUFACTURED",
          "TYPES",
          "WIDTH (mm)",
          "HEIGHT (mm)",
          "THICKNESS (mm)",
        ],
        descriptionField: [
          [
            "STEEL",
            "VINYL",
            "CONCRETE",
            "WOODEN",
            "FIBERGLASS",
            "ALUMINUM",
            "COLD FORMED",
            "HOT ROLLED",
            "COMBINATION",
          ],
          ["U-SHAPED", "Z-SHAPED"],
          ["STEEL", "CONCRETE", "COMPOSITE"],
          ["400", "500", "600", "700", "630", "580"],
          ["85", "100", "125", "150", "170", "200", "225", "130", "180"],
          ["8", "8.5", "10.5", "13", "13.1", "15.5"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['31']",
      },
      {
        generalName: "AGGREGATES",
        unit: "cu.m",
        description: ["CLASSIFICATION", "TYPE", "GRADE", "SIZE (DIAMETER)"],
        descriptionField: [
          [
            "SAND",
            "GRAVEL",
            "MOUNTAIN ROCK MATERIALS",
            "BACKFILLING MATERIALS",
            "RIVER MIX MATERIALS",
            "RIVERRUN STONES",
            "BASE COARSE",
            "SUB BASE COURSE",
            "LIMESTONE",
            "COBBLES",
            "ROCK",
          ],
          [
            "Lahar",
            "Crushed",
            "S1",
            "Fine",
            "White",
            "Vibro S1",
            "Vibro",
            "Screened",
            "Wash",
            "CLEAR ROCK",
            "SEMI ARMOR ROCK",
          ],
          ["#1", "#2", "#3", "#8", "#57"],
          ["75-600MM", "600MM", "400MM"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['3']",
      },
      {
        generalName: "CANVASS LONA",
        unit: "piece",
        description: ["WIDTH (m)", "LENGTH (m)"],
        descriptionField: [
          ["3", "6", "7", "8", "9", "10", "12", "15", "18", "36", "45", "80", "90"],
          ["3", "4", "8", "7", "10", "15", "100"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['9']",
      },
      {
        generalName: "GLOVES",
        unit: "pair",
        description: ["TYPE", "MATERIAL"],
        descriptionField: [
          [
            "CHEMICAL",
            "SUPERPRO",
            "WELDING ",
            "SURGICAL",
            "Knitted",
            "Electrical",
            "Reflectorized",
            "Memphis",
            "Cotton",
          ],
          [
            "Natural Rubber",
            "Nitrile",
            "Neoprene",
            "PVC",
            "Butyl",
            "Viton",
            "Leather ",
            "TIG",
            "Kevlar",
            "Silicon",
            "Thin heat",
            "Non Leather",
            "Rec Leather",
            "Polyester",
            "Polyisoprene",
            "Natural Cotton ",
          ],
        ],
        glAccount: "1010604",
        divisionIdList: "ARRAY ['5']",
      },
      {
        generalName: "PRINTER INK",
        unit: "piece",
        description: ["BRAND", "MODEL", "TYPE"],
        descriptionField: [
          ["EPSON", "BROTHER ", "HP", "CANON"],
          [
            "T639",
            "T003",
            "T008",
            "LC-39",
            "BT6000BK",
            "BT5000",
            "BTD60BK",
            "LC-3617",
            "LC-535XL",
            "GT51",
            "GT52",
            "GT53",
            "GI-790",
            "PG-47",
            "CL-706",
            "PG-89",
            "PG-88",
            "PG-745",
            "CL-98",
            "PG-830",
            "CL-99",
            "CL-57",
            "PG-80",
            "PG-740",
            "PG-40",
            "CL-831",
          ],
          ["Bottle", "Cartridge"],
        ],
        glAccount: "1010606",
        divisionIdList: "ARRAY ['12']",
      },
      {
        generalName: "TRANSMISSION OIL",
        unit: "liter",
        description: ["BRAND", "MODEL", "PART NUMBER"],
        descriptionField: [
          ["SHELL", "VOLVO", "CAT", "PETRON", "KOMATSU LIMITED"],
          [
            "SPIRAX S3 ATF MD3",
            "SPIRAX S2 A 80W-90",
            "SPIRAX S1 ATF",
            "SPIRAX S4 CX 30",
            "97304",
            "AT102",
            "CAT-143487",
            "CAT-143487",
            "#30",
            "TO30",
          ],
          [
            "VOE15143928",
            "9X6466 CAT",
            "7X7855 CAT",
            "TO-30-CF-20L-PCP",
            "SYEO-TO30",
            "550038324",
            "550025606",
            "550027786",
            "500005682",
            "VOE21707133",
          ],
        ],
        glAccount: "1010605",
        divisionIdList: "ARRAY ['11']",
      },
      {
        generalName: "TARPAULIN",
        unit: "piece",
        description: ["LENGTH (m)", "WIDTH (m)"],
        descriptionField: [
          ["4", "10", "12", "20"],
          ["2", "10", "5", "20"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['7']",
      },
      {
        generalName: "WHITE BOARD",
        unit: "piece",
        description: ["WIDTH (mm)", "HEIGHT (mm)"],
        descriptionField: [
          ["900", "1200", "1500", "1800", "2400", "3000", "3600"],
          ["600", "900", "1200"],
        ],
        glAccount: "1010606",
        divisionIdList: "ARRAY ['10']",
      },
      {
        generalName: "ACETATE SHEET",
        unit: "pack",
        description: ["COLOR", "SIZE"],
        descriptionField: [
          [
            "BOND PAPER",
            "PLOTTER PAPER",
            "PRINTER PAPER",
            "VELLUM BOARD PAPER",
            "CARBON PAPER",
            "MYLAR PAPER",
            "STICKER PAPER",
            "ONION PAPER",
            "PHOTO PAPER  GLOSSY DOUBLE SIDE",
            "PHOTO PAPER WITH STICKEY",
            "STENCIL PAPER",
            "OSLO PAPER",
            "COLORED PAPER",
            "PAPER PARCHMENT",
            "NEWSPRINT",
          ],
          [
            "UNCOATED",
            "COATED",
            "SMOOTH",
            "SATIN",
            "MATTE",
            "TRANSLUCENT",
            "GLOSSY",
          ],
        ],
        glAccount: "1010606",
        divisionIdList: "ARRAY ['12']",
      },
      {
        generalName: "RAIN BOOTS",
        unit: "pair",
        description: ["BRAND", "TYPE", "FOOT SIZE U.S."],
        descriptionField: [
          ["SUPERTUFF", "NONE"],
          ["WITH STEEL TOE", "ORDINARY"],
          ["5", "6", "7", "8", "9", "10", "11"],
        ],
        glAccount: "1010604",
        divisionIdList: "ARRAY ['5']",
      },
      {
        generalName: "CONCRETE PRIMER",
        unit: "liter",
        description: ["TYPE", "FINISH"],
        descriptionField: [["Acrylic", "Silicone"], ["Flat"]],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['9']",
      },
      {
        generalName: "CONTAINER VAN",
        unit: "unit",
        description: ["TYPE", "CONTAINER FEATURE", "STANDARD SIZE IN LENGTH (FT)"],
        descriptionField: [
          [
            "OFFICE TYPE",
            "BARE TYPE ISO CERTIFIED",
            "STEEL CONTAINER WITHOUT ISOLATION",
            "COLLAPSIBLE CONTAINER HOUSE",
          ],
          ["HIGH CUBE", "DRY CONATINER ", "STANDARD"],
          ["20", "40"],
        ],
        glAccount: "1020606",
        divisionIdList: "ARRAY ['1']",
      },
      {
        generalName: "CHEMICAL ANCHOR EPOXY",
        unit: "piece",
        description: ["BRAND", "MODEL", "VOLUME ml"],
        descriptionField: [
          ["HORSE", "HILTI", "EAGLE BOND", "SIKA", "BOSSONG"],
          [
            "HM-500",
            "HIT-RE 100",
            "HIT-RE 500",
            "AB500",
            "3001",
            "BCR-900",
            "BCR-470",
            "BCR-265",
          ],
          ["250", "265", "390", "470", "500", "580", "900"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['3']",
      },
      {
        generalName: "LAMINATING FILM",
        unit: "box",
        description: ["SIZE ", "THICKNESS (micron)", "PACKAGING SIZE (pc)"],
        descriptionField: [
          ["A4", "A3", "Long", "Letter "],
          ["250", "125"],
          ["10", "15", "25", "100"],
        ],
        glAccount: "1010606",
        divisionIdList: "ARRAY ['12']",
      },
      {
        generalName: "CERTIFICATE FRAME",
        unit: "piece",
        description: ["TYPE", "SIZE"],
        descriptionField: [
          ["WOOD", "METAL", "GLASS"],
          ["A3", "A4"],
        ],
        glAccount: "1010606",
        divisionIdList: "ARRAY ['12']",
      },
      {
        generalName: "NOTEBOOK",
        unit: "piece",
        description: ["TYPE", "SIZE"],
        descriptionField: [
          ["SPIRAL", "BOUND"],
          ["PASSPORT", "POCKET", "A6", "B6", "STANDARD", "A5", "B5", "A4"],
        ],
        glAccount: "1010606",
        divisionIdList: "ARRAY ['12']",
      },
      {
        generalName: "GLUE",
        unit: "piece",
        description: ["BRAND", "PACKAGING SIZE (ml)"],
        descriptionField: [
          ["ELMER", "HBW"],
          ["36.9", "118", "225", "473", "946", "3875"],
        ],
        glAccount: "1010606",
        divisionIdList: "ARRAY ['12']",
      },
      {
        generalName: "FLASH DRIVE",
        unit: "piece",
        description: ["BRAND", "STORAGE (gb)"],
        descriptionField: [
          ["SAMSUNG", "SANDISK", "KINGSTON", "PNY", "TRANSCEND", "SONY", "TOSHIBA"],
          ["8", "16", "32", "64", "128", "256", "512", "1000"],
        ],
        glAccount: "1010606",
        divisionIdList: "ARRAY ['34']",
      },
      {
        generalName: "ID LACE",
        unit: "piece",
        description: ["FINISH", "SIZE (mm)", "COLOR", "ACCESSORIES"],
        descriptionField: [
          ["SILK", "ORDINARY", "GLOSSY"],
          ["760", "810", "860", "900"],
          ["GREEN", "RED", "BLUE", "BLACK", "ORANGE", "VIOLET"],
          ["BUCKLE", "PLASTIC HOOK", "METAL HOOK", "CARD HOLDER"],
        ],
        glAccount: "1010606",
        divisionIdList: "ARRAY ['12']",
      },
      {
        generalName: "BOX FILE",
        unit: "piece",
        description: ["SIZE", "COLOR"],
        descriptionField: [
          ["A4", "F/C", "LONG"],
          ["Black", "Red", "Yellow", "Green", "Blue", "Gray"],
        ],
        glAccount: "1010606",
        divisionIdList: "ARRAY ['23']",
      },
      {
        generalName: "GROUT",
        unit: "pack",
        description: ["TYPE", "COLOR", "VOLUME (kg)"],
        descriptionField: [
          ["Sanded", "Epoxy", "Acrylic", "Non-Sanded"],
          [
            "BLACK",
            "CREAM",
            "BAHAMA BEIGE",
            "BANAHAW MINT",
            "BURGUNDY",
            "DARK BLUE",
            "CARMEN RED",
            "DARK BROWN",
            "MANGO",
            "GRAY",
            "GREEN",
            "PINK",
            "RED",
            "WHITE",
            "MINT GREEN",
            "STRAW BEIGE",
            "PINATUBO GRAY",
            "ROMBLON WHITE",
          ],
          ["2", "5"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['7']",
      },
      {
        generalName: "FLAT BAR",
        unit: "peice",
        description: ["TYPE", "LENGTH (m)", "WIDTH (mm)", "THICKNESS (mm)"],
        descriptionField: [
          [
            "Type I",
            "Type II",
            "Type III",
            "Type IV",
            "Type V",
            "Type VI",
            "Type VII",
            "Type VIII",
            "Type IX",
            "Type X",
            "Type XI",
            "Type XII",
            "Type XIII",
            "Type XIV",
            "Type XV",
            "Type XVI",
            "Type XVII",
            "Type XVIII",
            "Type XIX",
            "Type XX",
            "Type XXI",
            "Type XXII",
            "Type XXIII",
            "Type XXIV",
            "Type XXV",
            "Type XXVI",
            "Type XXVII",
            "Type XXVIII",
            "TYPE XXIX",
            "TYPE XXX",
            "TYPE XXXI",
            "TYPE XXXII",
            "TYPE XXXIII",
            "TYPE XXXIV",
            "TYPE XXXV",
            "TYPE XXXVI",
            "TYPE XXXVII",
            "TYPE XXXVIII",
            "TYPE XXXIX",
            "TYPE XXXX",
          ],
          ["6"],
          ["32", "100"],
          ["1.5", "9"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['5']",
      },
      {
        generalName: "TILE",
        unit: "piece",
        description: ["TYPE", "LENGTH", "WIDTH"],
        descriptionField: [
          ["Vinyl", "Matte Finished", "Ceramic"],
          ["20", "30", "60", "8", "600"],
          ["20", "30", "60", "8", "600", "300"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['40']",
      },
      {
        generalName: "MASK",
        unit: "piece",
        description: ["TYPE"],
        descriptionField: [
          ["Respiratory", "Face", "Welding", "Washable", "Gas", "Surgical"],
        ],
        glAccount: "1010604",
        divisionIdList: "ARRAY ['5']",
      },
      {
        generalName: "FILE TRAY",
        unit: "piece",
        description: ["TYPE", "NO. OF LAYERS"],
        descriptionField: [
          ["INCLINE", "VERTICAL", "HORIZONTAL", "DRAWER"],
          ["2", "3", "4", "5"],
        ],
        glAccount: "1010606",
        divisionIdList: "ARRAY ['12']",
      },
      {
        generalName: "WELDING ROD",
        unit: "piece",
        description: ["BRAND", "TYPE", "DIAMETER (mm)"],
        descriptionField: [
          ["WIPWELD", "KOBELCO", "EUTECTIC", "NIHONWELD"],
          [
            "6010",
            "6011",
            "6012",
            "6013",
            "7016",
            "7018",
            "7024",
            "6010",
            "6011",
            "6012",
            "6013",
            "7016",
            "7018",
            "7024",
          ],
          ["2.5", "2.6", "3.2", "4", "5"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['5']",
      },
      {
        generalName: "FOLDER",
        unit: "piece",
        description: ["TYPE", "COLOR", "SIZE"],
        descriptionField: [
          [
            "Arch File",
            "Binder Folder",
            "Long Folder",
            "Short Folder",
            "Plastic Folder",
            "Expanded Folder",
            "Ring Binder Spine",
            "Binder",
          ],
          ["COLORED", "CLEAR", "WHITE"],
          ["A3", "Legal", "A4", "Long", "Short", "Letter"],
        ],
        glAccount: "1010606",
        divisionIdList: "ARRAY ['12']",
      },
      {
        generalName: "BRAKE FLUID",
        unit: "bottle",
        description: ["BRAND", "CLASS", "TYPE"],
        descriptionField: [
          ["National", "Preston", "Generic"],
          ["BRAKE FLUID", "BRAKE AND CLUTH FLUID"],
          ["DOT 2", "DOT 3", "DOT 4", "DOT 5", "DOT 5.1"],
        ],
        glAccount: "1010605",
        divisionIdList: "ARRAY ['11']",
      },
      {
        generalName: "BED SHEET",
        unit: "piece",
        description: ["TYPE", "MATTRESS SIZE", "INCLUSION"],
        descriptionField: [
          ["Flat Sheet", "Fitted Sheet"],
          [
            "Full (Double)",
            "King",
            "Queen",
            "Twin (Single)",
            "Twin (Single) XL",
            "Cali King",
          ],
          [
            "with Pillow Case",
            "with Duvet Cover",
            "with Pillow Case and Duvet Cover",
            "None",
          ],
        ],
        glAccount: "5010500",
        divisionIdList: "ARRAY ['12']",
      },
      {
        generalName: "METAL CLAMP",
        unit: "piece",
        description: ["SIZE (inch)"],
        descriptionField: [["1/2", "1", "2", "3/4"]],
        glAccount: "1010606",
        divisionIdList: "ARRAY ['5']",
      },
      {
        generalName: "STICKER CARTRIDGE",
        unit: "piece",
        description: ["SIZE (inch)", "LENGTH (inch)", "WIDTH (inch)"],
        descriptionField: [
          ["TEM1 x 1", "2 x 2", "2 x 3.5", "4 x 6", "5 x 5"],
          ["1", "2", "4", "5"],
          ["1", "2", "3.5", "6", "5"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['12']",
      },
      {
        generalName: "PEN",
        unit: "piece",
        description: ["TYPE", "COLOR"],
        descriptionField: [
          [
            "Fountain",
            "Gel",
            "Ballpoint",
            "Rollerball",
            "Ceramic",
            "Felt",
            "Maker",
            "Stylus",
            "Ballpen",
            "Permanent Marker",
            "White Board Marker",
            "Sign Pen",
          ],
          ["Black", "Blue", "Red"],
        ],
        glAccount: "1010606",
        divisionIdList: "ARRAY ['12']",
      },
      {
        generalName: "PEN INK",
        unit: "piece",
        description: ["BRAND", "TYPE", "COLOR", "PACKAGING SIZE (ml)"],
        descriptionField: [
          [
            "Robert Oster",
            "Sailor",
            "Pilot Iroshizuku",
            "P.W Akkerman",
            "Montblanc",
          ],
          [
            "Fountain",
            "Gel",
            "Ballpoint",
            "Rollerball",
            "Ceramic",
            "Felt",
            "Maker",
            "Stylus",
            "Ballpen",
            "Permanent Marker",
            "White Board Marker",
            "Sign Pen",
          ],
          ["Black", "Blue", "Red"],
          ["10", "12", "20", "30"],
        ],
        glAccount: "1010606",
        divisionIdList: "ARRAY ['12']",
      },
      {
        generalName: "SOLVENT CEMENT",
        unit: "can",
        description: ["BRAND", "SIZE (cc)"],
        descriptionField: [
          ["Atlanta", "Nelftex"],
          ["100", "200", "250", "300", "400", "724"],
        ],
        glAccount: "1010606",
        divisionIdList: "ARRAY ['22']",
      },
      {
        generalName: "CLIP BOARD",
        unit: "piece",
        description: ["TYPE", "MATERIAL", "SIZE"],
        descriptionField: [
          ["Standard", "Storage", "Foldable", "Clipboard Binder"],
          [
            "Hardboard",
            "Plastic",
            "Aluminum",
            "Metal",
            "Acrylic",
            "Cardboard",
            "Leather or Faux Leather",
          ],
          ["Letter", "Legal", "A4", "Mini"],
        ],
        glAccount: "1010606",
        divisionIdList: "ARRAY ['12']",
      },
      {
        generalName: "AIR CONDITIONER",
        unit: "unit",
        description: ["TYPE", "BRAND", "MODEL"],
        descriptionField: [
          ["CENTRAL", "SPLIT ", "WINDOW", "FLOOR MOUNTED", "INVERTER"],
          [
            "PANASONIC",
            "MIDEA",
            "SHARP",
            "AMERICAN HOME",
            "KOLIN",
            "HANABISHI",
            "CARRIER",
            "TCL",
          ],
          [
            "CW-SC185EPH ",
            "YCARY1DEC",
            "CW-SC104VPH ",
            "CS/CU-PU18WKQ",
            "CS/U-PS18SKQ",
            "CS/CU-PU12WKQ",
            "TAC-22CSA/KEI",
            "CS/CU-XU30VKQ",
            "AHAC93MNT",
            "WCONC00GEC",
            "AFT-522CM",
          ],
        ],
        glAccount: "5010500",
        divisionIdList: "ARRAY ['23']",
      },
      {
        generalName: "RESPIRATOR CARTRIDGE",
        unit: "piece",
        description: ["BRAND", "TYPE", "FACEPIECE TYPE", "CARTRIDGE USE", "MODEL"],
        descriptionField: [
          ["3M", "North", "Moldex"],
          ["Single", "Twin"],
          [
            "Powered Air-Purifying Respirator (PAPR)",
            "Full Face Respirator",
            "Half Face Respirator",
          ],
          [
            "Particulate Cartridges (N95, N99, N100)",
            "Organic Vapor Cartridges",
            "Acid Gas Cartridges",
            "Combination Cartridges",
            "Ammonia Cartridges",
            "Mercury Vapor Cartridges",
            "Multi-Gas Cartridges",
          ],
          [
            "3301K-100, 60 EA/Case",
            "6001 (07046)",
            "60921",
            "6002",
            "60922",
            "6003 (07047)",
            "60923",
            "6004",
            "60924",
            "6005",
            "60925",
            "6006",
            "60926",
            "60928",
            "6007",
            "60927",
            "6003, 60 EA/Case",
            "3311K-100, 60 EA/Case",
            "6006, 60 EA/Case",
            "60926, P100 60 ea/Case",
            "3303K-100, 60 EA/Case",
            "6001, 60 EA/Case",
            "6007, 60 EA/Case",
            "60921, P100 60 EA/Case",
            "6004, 60 EA/Case",
            "6002, 60 EA/Case",
            "N75001",
            "7583P100L",
            "7580P100",
            "75SCP100L",
            "7000/7800/9000 series",
            "8000 series",
          ],
        ],
        glAccount: "1010604",
        divisionIdList: "ARRAY ['11']",
      },
      {
        generalName: "LEAD WIRE",
        unit: "roll",
        description: ["TYPE", "WIRE DIAMETER (mm)", "LENGTH (m)"],
        descriptionField: [
          ["Rosin Core", "Flux Cored"],
          ["0.3", "0.6", "0.8", "1", "1.2", "1.5"],
          ["1", "1.5", "3", "7"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['11']",
      },
      {
        generalName: "EXHAUST FLUID",
        unit: "liter",
        description: ["BRAND", "STANDARD", "LITERS PER PACKAGE", "PART NUMBER"],
        descriptionField: [
          ["Volvo", "AdBlue"],
          ["Euro IV (4)", "Euro V (5)", "Euro VI (6)"],
          ["10", "1.89", "1.5", "1", "200", "15", "9.46", "3.5", "5", "20"],
          ["85109697", "ADBLUE10", "12674"],
        ],
        glAccount: "1010605",
        divisionIdList: "ARRAY ['11']",
      },
      {
        generalName: "STEEL EPOXY",
        unit: "piece",
        description: ["BRAND", "TYPE", "VOLUME IN ML"],
        descriptionField: [
          ["Devcon", "Pioneer"],
          [
            "Plastic Steel",
            "Cold Weld",
            "Steel-Reinforced",
            "High-Temperature",
            "Rapid-Setting Steel",
            "Water-Resistant Steel",
            "Chemical-Resistant",
            "Electrical Conductive",
            "Electrical Conductive",
            "Flexible Steel",
          ],
          ["25", "48.5", "100", "390", "470", "1000", "1500", "2000", "4000"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['3']",
      },
      {
        generalName: "DOOR JAMB",
        unit: "piece",
        description: ["TYPE", "WDITH DIMENSION IN CM", "HEIGHT DIMENSION IN CM"],
        descriptionField: [
          [
            "Standard Door Jamb",
            "Split Door Jamb",
            "Pocket Door Jamb",
            "Adjustable Door Jamb",
            "Extension Door Jamb",
            "Exterior Door Jamb",
            "Interior Door Jamb",
            "Fire-Rated Door Jamb",
          ],
          ["60", "70", "80", "120", "160"],
          ["210"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['8']",
      },
      {
        generalName: "WATER CONTAINER",
        unit: "piece",
        description: ["TYPE", "COMPONENT", "CAPACITY (l)"],
        descriptionField: [
          ["SLIM", "ROUND", "SQUARE"],
          ["WITH FAUCET", "WITH CAP"],
          ["3", "6", "10", "20", "75", "100", "150", "200"],
        ],
        glAccount: "1010607",
        divisionIdList: "ARRAY ['33']",
      },
      {
        generalName: "RUBBER BAND",
        unit: "piece",
        description: ["BRAND", "SIZE & NO", "PACKAGING SIZE (kg)"],
        descriptionField: [
          ["Arrow", "Brite", "Everlasting"],
          ["Big#18", "Small#16"],
          ["350", "50"],
        ],
        glAccount: "1010606",
        divisionIdList: "ARRAY ['12']",
      },
      {
        generalName: "JACKET",
        unit: "piece",
        description: ["VARIANT", "TYPE", "SIZE"],
        descriptionField: [
          ["Polo"],
          ["Long Sleeve", "Short Sleeve"],
          ["Small", "Medium", "Large", "Extra Large", "XXL"],
        ],
        glAccount: "1010604",
        divisionIdList: "ARRAY ['5']",
      },
      {
        generalName: "DRIFTER ROD",
        unit: "piece",
        description: ["BRAND", "TYPE", "LENGTH (mm)", "DIAMETER (mm)"],
        descriptionField: [
          ["SANDVIK"],
          [
            "R32 - H25 - R25",
            "R32 - H28 - R25",
            "R32 - H28 - R28",
            "R38 - H35 - R32",
            "R38 - H32 - R32",
            "T38 - H32 - R32",
            "T38 - H35 - R32",
          ],
          ["2475", "3090", "3700", "4305", "4915", "5525", "6135", "6440"],
          ["35", "32"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['41']",
      },
      {
        generalName: "TERMINAL LUG",
        unit: "piece",
        description: [
          "BRAND",
          "TYPE",
          "MATERIAL",
          "PLATE",
          "NUMBER OF HOLE",
          "BARREL SIZE",
          "CONDUCTOR AREA SIZE IN MM²",
          "INSULATION",
        ],
        descriptionField: [
          ["TE Raychem", "Airic", "Terminal-Lug", "PLATT"],
          [
            "Ring Type (R Type)",
            "Compression",
            "Crimp",
            "Pin",
            "Fork",
            "Spade",
            "Insulated",
            "Long Barrel",
            "Short Barrel",
            "Coupling to bare wire connector",
          ],
          ["Copper", "Aluminum", "Brass", "Stainless Steel", "Nickel", "Bronze"],
          ["Tin-plated", "Non-plated"],
          ["2 hole", "1 hole"],
          ["Long Barrel", "Short Barrel"],
          [
            "0.5",
            "0.52",
            "0.75",
            "1",
            "1.5",
            "2.5",
            "3.2",
            "3.5",
            "3.7",
            "4",
            "4.3",
            "5.3",
            "6",
            "6.4",
            "8.4",
            "10",
            "14",
            "16",
            "22",
            "25",
            "30",
            "35",
            "38",
            "50",
            "60",
            "70",
            "80",
            "80",
            "90",
            "95",
            "100",
            "120",
            "150",
            "152",
            "185",
            "240",
            "250",
            "300",
            "400",
            "500",
            "630",
            "800",
            "1000",
            "0.52 (AWG 20)",
            "0.82 (AWG 18)",
            "1.31 (AWG 16)",
            "2.08 (AWG 14)",
            "3.31 (AWG 12)",
            "5.26 (AWG 10)",
            "8.37 (AWG 8)",
            "13.3 (AWG 6)",
            "21.1 (AWG 4)",
            "33.6 (AWG 2)",
            "53.5 (AWG 1/0)",
            "67.4 (AWG 2/0)",
            "85 (AWG 3/0)",
            "107 (AWG 4/0)",
            "127 (AWG 250 kcmil)",
            "152 (AWG 300 kcmil)",
            "177 (AWG 350 kcmil)",
            "203 (AWG 400 kcmil)",
            "253 (AWG 500 kcmil)",
            "304 (AWG 600 kcmil)",
          ],
          ["Insulated", "Non-Insulated"],
        ],
        glAccount: "1010603",
        divisionIdList: "ARRAY ['26']",
      },
      {
        generalName: "CABLE TESTER",
        unit: "unit",
        description: [
          "BRAND",
          "MODEL",
          "CABLE TYPE",
          "BATTERY",
          "CAPACITY (v)",
          "LENGTH (mm)",
          "WIDTH (mm)",
        ],
        descriptionField: [
          ["NOFAYA", "FLUKE", "KLEIN", "TEMPO"],
          [
            "NF-8508",
            "NF-8601S",
            "NF-8209",
            "NF-8601S",
            "NF-388",
            "NF-8209S",
            "NF-858C",
            "NF-8108-M",
            "NF-308S",
            "LIQ-100",
            "LIQ-100-IE",
            "MS-POE",
            "MS2-100-IE",
            "MT-8200-61-TNR",
            "MT-8200-63A",
            "MT-8200-49A",
            "VDV526-100",
            "VDV512-100",
            "VDV501-851",
            "VDV526-200",
            "VDV526-052",
            "NC-100",
            "NC-500",
            "NC-510",
          ],
          [
            "CAT5",
            "CAT6",
            "RJ45",
            "COXIAL",
            "RG11",
            "RG59",
            "RG7",
            "CAT3",
            "CAT5E",
            "CAT6A",
            "CAT7",
            "STP",
            "UTP",
          ],
          ["LITHIUM ", "ALKALINE", "LR44"],
          ["3.7", "9", "1.5"],
          [
            "205",
            "173",
            "185",
            "125",
            "135",
            "78",
            "305",
            "216",
            "163",
            "141",
            "222",
            "127",
            "147",
            "178",
            "241",
            "150",
            "85",
          ],
          [
            "38",
            "92",
            "80",
            "70",
            "78",
            "33",
            "262",
            "114",
            "76",
            "75",
            "48",
            "64",
            "32",
            "58",
            "35",
          ],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['26']",
      },
      {
        generalName: "SPUD",
        unit: "piece",
        description: ["TYPE", "DIAMTER (mm)"],
        descriptionField: [
          ["RUBBER", "VALVE", "GASKET", "MALE", "FEMALE", "WRENCH"],
          ["12.7", "25.4", "50", "12.7", "25.4", "19.05", "20", "41"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['22']",
      },
      {
        generalName: "HANDLE CLAMP",
        unit: "piece",
        description: ["TYPE", "MODEL"],
        descriptionField: [
          ["Cadweld", "Weld", "Grounding Mold", "Mold", "Chain Support"],
          [
            "L160",
            "CL-10",
            "CL-3",
            "CL-5",
            "CL-7",
            "CR2",
            "CR25",
            "CR33",
            "CC1",
            "CC2",
            "HCC00",
            "L-60",
          ],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['6']",
      },
      {
        generalName: "BENTONITE",
        unit: "piece",
        description: ["TYPE", "PURPOSE"],
        descriptionField: [
          ["Sodium", "Calcium"],
          [
            "Sealing and Waterproofing",
            "Drilling Fluids",
            "Foundry Sand Binder",
            "Cement Grouting",
            "Soil Stabilization",
            "Horizontal Directional Drilling (HDD)",
            "Landfill Liners",
            "Piling",
            "Tunnel Construction",
            "Geosynthetic Clay Liners (GCLs)",
            "Erosion Control",
          ],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['2']",
      },
      {
        generalName: "STICKY NOTES",
        unit: "pad",
        description: ["BRAND", "TYPE", "COLOR", "WIDTH", "LENGTH"],
        descriptionField: [
          ["POST IT", "Q-CONNECT"],
          ["REPOSITIONAL NOTES", "PAGE MARKER", "RULED NOTES (POST IT)"],
          ["ASSORTED", "YELLOW", "RED", "PASTEL", "NEON", "PINK"],
          [
            "76 MM",
            "76 MM",
            "38 MM",
            "101 mm",
            "40 MM",
            "148 MM",
            "25 mm",
            "101 MM",
            "101 MM",
            "127 MM",
          ],
          [
            "76 MM",
            "127 MM",
            "51 MM",
            "152 mm",
            "50 MM",
            "98 MM",
            "44 mm",
            "101 MM",
            "152 MM",
            "203 MM",
          ],
        ],
        glAccount: "1010606",
        divisionIdList: "ARRAY ['12']",
      },
      {
        generalName: "STP CABLE",
        unit: "roll",
        description: [
          "BRAND",
          "CATEGORY",
          "BANDWITH (MHz)",
          "DATA TRANSFER RATE (Mbps)",
          "LENGTH (m)",
        ],
        descriptionField: [
          ["BELDEN", "COMMSCOPE", "PANDUIT"],
          [
            "CAT 2",
            "CAT 3",
            "CAT 4",
            "CAT 5",
            "CAT 5E",
            "CAT 6",
            "CAT 6A",
            "CAT 7",
            "CAT 7A",
            "CAT 8",
          ],
          ["4", "16", "20", "100", "100", "250", "500", "600", "1000", "2000"],
          [
            "4",
            "10",
            "16",
            "100",
            "1000",
            "10000",
            "10000",
            "10000",
            "1000000",
            "4000000",
          ],
          ["1", "5", "10", "15", "20", "30", "40", "50", "60", "80", "100", "305"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['26']",
      },
      {
        generalName: "BEARING",
        unit: "piece",
        description: [
          "TYPE",
          "MATERIAL",
          "INTERNAL (BORE) DIAMETER IN MM",
          "OUTSIDE DIAMETER IN MM",
          "WIDTH IN MM",
          "CAGE TYPE",
        ],
        descriptionField: [
          [
            "Ball",
            "Cylindrical Roller",
            "Tapered Roller",
            "Spherical Roller",
            "Needle",
            "Thrust",
            "Plain (Bushings)",
            "Sleeve",
            "Flange",
            "Angular Contact",
            "Radial",
            "Linear",
            "Self-Aligning",
            "Mounted (Pillow Block)",
          ],
          [
            "Steel",
            "Ceramics",
            "Plastics and Polymers",
            "Bronze",
            "Alloys",
            "Sintered Metals",
            "Thermoplastics",
            "Rubber and Elastomers",
          ],
          ["60", "25", "12", "40", "55", "65", "50", "45", "38", "45", "10"],
          [
            "164",
            "140",
            "127",
            "184",
            "72",
            "65",
            "206",
            "57.2",
            "78",
            "100",
            "40",
          ],
          ["60", "32", "50", "25", "12", "3", "33", "16", "19"],
          [
            "Metal (Pressed Steel)",
            "Brass",
            "Polyamide (Nylon)",
            "Machined Brass",
            "Phenolic",
            "Full Complement",
            "Crown",
            "Ribbon",
            "Guided",
          ],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['3']",
      },
      {
        generalName: "VEST",
        unit: "piece",
        description: ["TYPE", "COLOR", "SIZE"],
        descriptionField: [
          [
            "LIFE JACKET",
            "TEMTRAFFIC VESTP",
            "HIGH-VISIBILITY SAFETY",
            "HARNESS SAFETY",
          ],
          ["RED", "YELLOW", "ORANGE", "NEON GREEN", "BLUE"],
          ["SMALL", "MEDIUM", "LARGE"],
        ],
        glAccount: "1010604",
        divisionIdList: "ARRAY ['1']",
      },
      {
        generalName: "WINDOW CURTAIN ROD",
        unit: "piece",
        description: [
          "TYPE",
          "MATERIAL",
          "MIN ROD LENGTH (mm)",
          "MAX ROD LENGTH (mm)",
        ],
        descriptionField: [
          ["STANDARD", "TENSION", "DOUBLE", "TRAVERSE", "SWING-ARM"],
          ["METAL", "WOOD", "PLASTIC"],
          ["711.2", "1219.2", "1676.4", "3048"],
          ["1219.2", "2133.6", "3048", "4318"],
        ],
        glAccount: "1010607",
        divisionIdList: "ARRAY ['12']",
      },
      {
        generalName: "PRINTER TONER",
        unit: "piece",
        description: [
          "BRAND",
          "BRAND MODEL",
          "CARTRIDGE TYPE",
          "MODEL",
          "TONER COLOR",
        ],
        descriptionField: [
          ["Canon", "KYOCERA", "KONICA", "Sharp", "Brother", "HP"],
          [
            "TK-8345",
            "CS-3010i",
            "CS-3011i",
            "C3320",
            "C3325",
            "C3330",
            "C3520",
            "C3525",
            "C3530",
            "C3720",
            "C3725",
            "C3730",
            "C3020",
            "C3025",
            "C3120",
            "C3125",
            "MFC-L5900DW",
            "AR-6023N",
            "131A",
            "HL-2365DW",
            "DCP-L2540DW",
            "MFC-L2700D",
            "MFC-L2700DW",
            "MFC-L2740DW",
            "KM-1620",
          ],
          [
            "OEM Toner Cartridges",
            "New Compatible Cartridges",
            "Remanufactured Cartridges",
            "Refilled Cartridges",
          ],
          [
            "NPG-67",
            "MX27GTMA",
            "TK-8113M",
            "TK-8113K",
            "TK-8113Y",
            "TK-8113C",
            "TN850",
            "TK-7109",
            "CF213A",
            "CF212A",
            "CF211A",
            "CF210A",
            "MX237GT",
            "MX23GTCA",
            "TN-2380",
            "TK-410",
            "TN-3423",
            "MX23GTYA",
          ],
          ["Black", "Cyan", "Magenta", "Yellow"],
        ],
        glAccount: "1010606",
        divisionIdList: "ARRAY ['0']",
      },
      {
        generalName: "PENCIL GRINDER",
        unit: "piece",
        description: ["TYPE", "MATERIAL", "TIP TYPE", "TIP SHAPE"],
        descriptionField: [
          [
            "Straight Pencil Grinder",
            "Angle Pencil Grinder",
            "Variable Speed Pencil Grinder",
            "Extended Pencil Grinder",
            "Right-Angle Pencil Grinder",
            "Collet Pencil Grinder",
          ],
          ["Aluminum", "Steel", "Plastic", "Tungsten Carbide"],
          [
            "Burrs",
            "Grinding Stones",
            "Cutting Wheels",
            "Sanding Drums and Sleeves",
            "Wire Brushes",
            "Polishing Wheels",
            "Flap Wheels",
            "Diamond-Embedded Tip",
            "Carbide Tip",
            "Collet Attachment",
            "Rotary Files",
            "Carbide Bit Pointed",
            "Stone Cone Type",
          ],
          [
            "Cylindrical",
            "Conical",
            "Ball",
            "Bullet",
            "Disk",
            "Needle",
            "Oval",
            "Wire Brush",
            "Poninted",
            "Inverted",
            "Round Nose/Ball Nose",
            "Flame",
            "Cylindrical with round head",
          ],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['41']",
      },
      {
        generalName: "RJ45",
        unit: "piece",
        description: ["CATEGORY", "PIECES PER PACKAGE"],
        descriptionField: [
          ["CAT5E", "CAT6", "CAT6A", "CAT7", "CAT8"],
          ["50", "100", "150", "200", "60", "70", "80", "90", "120", "140"],
        ],
        glAccount: "1010606",
        divisionIdList: "ARRAY ['26']",
      },
      {
        generalName: "DISC",
        unit: "piece",
        description: ["TYPE", "GRIT", "SIZE"],
        descriptionField: [
          ["Flap Disc", "Grinding Disc"],
          [
            "100",
            "1000",
            "120",
            "600",
            "80",
            "240",
            "320",
            "60",
            "16",
            "24",
            "36",
            "40",
            "50",
            "150",
            "180",
            "220",
          ],
          ["4", "7", "5", "4.5", "6", "9"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['11']",
      },
      {
        generalName: "CONCRETE CURING COMPOUND",
        unit: "liter",
        description: ["BRAND", "TYPE", "AMOUNT OF LITERS"],
        descriptionField: [
          ["HyperCURE", "Sika Antisol S"],
          [
            "Solvent-Based",
            "Water-Based",
            "Wax-Based",
            "Water-Soluble",
            "Resin-Based",
            "Silicate-Based",
          ],
          [
            "210",
            "1",
            "3",
            "5",
            "10",
            "20",
            "15",
            "200",
            "1000",
            "300",
            "400",
            "500",
            "600",
            "700",
            "800",
            "900",
          ],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['3']",
      },
      {
        generalName: "WIRE ROPE CLIP",
        unit: "piece",
        description: [
          "TYPE",
          "MATERIAL",
          "ROPE DIAMETER (mm)",
          "MINIMUM NO. PER CLIP",
          "AMOUNT OF TURN BACK (mm)",
        ],
        descriptionField: [
          ["U-BOLT", "DOUBLE-SADDLE"],
          ["STAINLESS STEEL", "MALLEABLE IRON", "DROP-FORGED STEEL"],
          [
            "3.18",
            "4.76",
            "6.35",
            "7.94",
            "9.53",
            "11.11",
            "12.7",
            "14.29",
            "15.88",
            "19.05",
            "22.23",
            "25.4",
            "28.58",
            "31.75",
            "34.93",
            "38.1",
            "41.28",
            "44.45",
            "50.8",
            "57.15",
            "63.5",
          ],
          ["2", "3", "4", "5", "6", "7", "8", "9"],
          [
            "82.55",
            "95.25",
            "120.65",
            "133.35",
            "165.1",
            "177.8",
            "292.1",
            "304.8",
            "457.2",
            "482.6",
            "660.4",
            "863.6",
            "1117.6",
            "1371.6",
            "1473.2",
            "1549.4",
            "1803.4",
            "1879.6",
            "2133.6",
            "101.6",
            "127",
            "279.4",
            "323.85",
            "342.9",
            "406.4",
            "939.8",
            "1041.4",
            "1397",
            "1574.8",
            "1981.2",
          ],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['5']",
      },
      {
        generalName: "FIBER CEMENT BOARD",
        unit: "piece",
        description: ["BRAND", "WIDTH", "LENGTH", "THICKNESS"],
        descriptionField: [
          ["KALSI", "HARDIFLEX", "GARDNER", "SHERA"],
          ["1219", "603", "1220", "603", "1200"],
          ["2438", "1213", "1220", "1213", "2400"],
          ["3.2", "3.5", "4", "4.5", "6", "8", "9", "10", "12", "15", "18", "20"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['7']",
      },
      {
        generalName: "BINDING COVER",
        unit: "set",
        description: ["TYPE", "LENGTH (mm)", "WIDTH (mm)"],
        descriptionField: [
          ["PVC Book (A4)", "Letter-Size", "Half-Size", "A5", "Mini (3-Ring)"],
          ["210", "215.9", "177.8", "144.78", "139.7"],
          ["297", "279.4", "228.6", "209.804", "215.9"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['11']",
      },
      {
        generalName: "STAPLER",
        unit: "piece",
        description: ["TYPE", "FEATURE", "STAPLE WIRE NUMBER"],
        descriptionField: [
          [
            "Desktop",
            "Mini",
            "Heavy-Duty",
            "Electric",
            "Pneumatic",
            "Saddle",
            "Long Reach",
            "Tacker",
            "Clinch",
            "Carton",
            "Bookbinding",
            "Staple-less",
            "Spring-Powered",
          ],
          ["With remover", "No Remover"],
          [
            "#35",
            "#10",
            "#40",
            "26/6",
            "23/8",
            "23/10",
            "23/13",
            "23/15",
            "23/17",
            "23/20",
            "23/23",
            "23/24",
            "23/12",
            "13/10",
            "13/14",
            "26/10",
            "26/8",
            "24/6",
            "24/8",
            "24/10",
          ],
        ],
        glAccount: "1010606",
        divisionIdList: "ARRAY ['12']",
      },
      {
        generalName: "ROPE",
        unit: "meter",
        description: ["TYPE", "SUB CATEGORY", "SIZE IN MM"],
        descriptionField: [
          ["Nylon"],
          [
            "3-Strand Nylon Rope",
            "Double Braid Nylon Rope",
            "Solid Braid Nylon Rope",
            "8-Strand Nylon Rope",
            "Flat Nylon Webbing",
          ],
          [
            "16",
            "18",
            "1, 1/8",
            "1, 1/16",
            "10",
            "12",
            "30",
            "28",
            "22",
            "3/4",
            "5",
            "6",
            "8",
            "11",
            "14",
            "24",
            "13",
            "5/8",
            "5/16",
            "1, 1/2",
            "1, 3/4",
            "2",
            "1 7/8",
            "32",
            "1/4",
            "3/8",
            "2, 1/2",
          ],
        ],
        glAccount: "1010606",
        divisionIdList: "ARRAY ['11']",
      },
      {
        generalName: "JALOUSIE FRAME",
        unit: "piece",
        description: [
          "MATERIAL",
          "JALOUSIE GLASS THICKNESS (mm)",
          "NUMBER OF BLADES",
        ],
        descriptionField: [
          ["Plastic", "Aluminum", "Steel"],
          ["4", "5", "6"],
          [
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
            "11",
            "12",
            "13",
            "14",
            "15",
            "16",
            "17",
            "18",
            "19",
            "20",
            "21",
            "22",
          ],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['8']",
      },
      {
        generalName: "DOOR CLOSER",
        unit: "piece",
        description: [
          "TYPE",
          "TYPE OF OVERHEAD DOOR CLOSER",
          "CLOSING MECHANISM",
          "APPLICATION",
          "HANDEDNESS",
          "DOOR WEIGHT (kg)",
          "FEATURE",
        ],
        descriptionField: [
          ["Overhead", "Concealed", "Floor spring", "Surface-mounted"],
          ["Regular Arm", "Parallel Arm", "Top Jamb"],
          ["Pneumatic", "Mechanical Spring"],
          ["Indoor Door", "Exterior Door"],
          ["Right Hand Door", "Left Hand Door", ""],
          [
            "40",
            "50",
            "60",
            "65",
            "40-65",
            "80",
            "70",
            "45",
            "55",
            "75",
            "85",
            "30",
            "25-45",
            "80-100",
            "90",
            "95",
            "100",
            "130",
            "100-120",
          ],
          ["with Hold-Open", "None"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['8']",
      },
      {
        generalName: "ENGINEERS FIELD BOOK",
        unit: "piece",
        description: ["BRAND", "LENGTH (mm)", "WIDTH (mm)", "HEIGHT (mm)"],
        descriptionField: [["VECO", "VALIANT"], ["184"], ["144"], ["10.3"]],
        glAccount: "1010606",
        divisionIdList: "ARRAY ['23']",
      },
      {
        generalName: "CABLE CLAMP",
        unit: "piece",
        description: ["TYPE", "MATERIAL", "SIZE DIAMETER (mm)", "GROMMET"],
        descriptionField: [
          [
            "Adhesive",
            "Screw-On",
            "Nail-In",
            "Snap-In",
            "Cable Tie Mount",
            "Cable Clip",
            "Hook-and-Loop Cable Strap",
            "Cable Saddle",
            "Self-Adhesive Cable Holder",
          ],
          [
            "Plastic",
            "Rubber",
            "Steel",
            "Aluminum",
            "Stainless Steel",
            "Nylon",
            "Silicone",
          ],
          [
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
            "11",
            "12",
            "13",
            "14",
            "15",
            "16",
            "17",
            "18",
            "19",
            "20",
            "21",
            "22",
            "23",
            "24",
            "25",
            "26",
            "27",
            "28",
            "29",
            "30",
            "31",
            "32",
            "33",
            "34",
            "35",
            "36",
            "37",
            "38",
            "39",
            "40",
            "50.8",
            "76.2",
            "101.6",
            "63.5",
            "88.9",
          ],
          ["Rubber", "None"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['28']",
      },
      {
        generalName: "PLASTIC BAG",
        unit: "pack",
        description: ["TYPE", "SIZE"],
        descriptionField: [
          ["TYPE", "ZIPLOCK"],
          [
            "TINY",
            "MINI",
            "EXTRA SMALL",
            "SMALL",
            "MEDIUM",
            "LARGE",
            "EXTRA LARGE",
            "DOUBLE EXTRA LARGE",
          ],
        ],
        glAccount: "1010606",
        divisionIdList: "ARRAY ['2']",
      },
      {
        generalName: "PILLOW",
        unit: "piece",
        description: ["TYPE", "SIZE"],
        descriptionField: [
          ["Standard", "Cotton", "Latex", "Memory Foam"],
          ["Standard", "Super Standard", "King", "Queen", "Body", "Euro pillow"],
        ],
        glAccount: "5010500",
        divisionIdList: "ARRAY ['12']",
      },
      {
        generalName: "TOE BOARD",
        unit: "piece",
        description: ["TYPE", "HEIGHT (mm)", "LENGTH (mm)"],
        descriptionField: [
          ["Wooden", "Metal", "Composite", "Mesh"],
          ["89", "225", "150"],
          [
            "506",
            "1800",
            "850",
            "1450",
            "1000",
            "2000",
            "2500",
            "668",
            "1270",
            "680",
            "1280",
            "3200",
          ],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['5']",
      },
      {
        generalName: "BORAL POWDER",
        unit: "kilogram",
        description: ["BRAND"],
        descriptionField: [["USG BORAL", "BORAL"]],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['4']",
      },
      {
        generalName: "VALVE, FIRE EXTINGUISHER",
        unit: "piece",
        description: [
          "TYPE",
          "MATERIAL",
          "FIRE EXTINGUISHER AGENT",
          "FIRE EXTINGUISHER SIZE",
          "FIRE EXTINGUISHER PRESSURE (Psi)",
        ],
        descriptionField: [
          [
            "Squeeze Grip",
            "Lever-operated",
            "Pistol Grip",
            "T-Handle",
            "Rotary",
            "Push Button",
            "Breakable Seal",
          ],
          [
            "Brass",
            "Aluminum",
            "Stainless Steel",
            "Plastics",
            "Copper",
            "Ceramics",
          ],
          [
            "ABC Dry Chemical",
            "BC Dry Chemical",
            "Dry Powder",
            "Water",
            "Foam",
            "Wet Chemical",
            "Halogenated",
            "Carbon Dioxide (CO₂)",
          ],
          [
            "1.25",
            "2.5",
            "3",
            "5",
            "10",
            "15",
            "20",
            "30",
            "50",
            "65",
            "125",
            "150",
            "250",
            "300",
            "6",
            "9",
            "13",
            "13.2",
            "17",
          ],
          [
            "185",
            "195",
            "825",
            "220",
            "200",
            "500",
            "85",
            "400",
            "510",
            "520",
            "100-150",
            "150-195",
            "195-225",
            "195-240",
            "240-300",
            "50",
            "800",
            "2000",
            "125",
            "150",
            "175",
            "235",
            "240",
            "350",
            "360",
            "3000",
            "350",
          ],
        ],
        glAccount: "1010604",
        divisionIdList: "ARRAY ['14']",
      },
      {
        generalName: "SUBMERSIBLE PUMP CABLE",
        unit: "piece",
        description: [
          "BRAND",
          "TYPE",
          "NUMBER OF CONDUCTOR",
          "NOMINAL AREA CONDUCTOR SIZE mm²",
          "INSULATION",
        ],
        descriptionField: [
          ["PHILFLEX", "Huadong", "Ramesh", "ZW", "JIUKAI"],
          ["Flat Jacketed", "Twisted", "Round", "4 Core", "3 Core"],
          ["2", "3", "4"],
          [
            "1.15",
            "1.4",
            "2",
            "2.2",
            "1.5",
            "2.5",
            "4",
            "6",
            "10",
            "16",
            "35",
            "50",
            "25",
            "70",
            "95",
            "0.5",
            "0.75",
            "1",
            "120",
            "150",
            "185",
            "240",
            "300",
            "400",
            "500",
            "630",
            "800",
            "1000",
          ],
          ["PVC", "Rubber"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['26']",
      },
      {
        generalName: "PENCIL",
        unit: "piece",
        description: ["TYPE", "COLOR", "LEAD SIZE"],
        descriptionField: [
          [
            "Graphite",
            "Solid",
            "Liquid",
            "Charcoal",
            "Carbon",
            "Grease",
            "Indelible",
            "Mechanical",
          ],
          ["Black", "Blue", "Red"],
          [
            "9B",
            "8B",
            "7B",
            "6B",
            "5B",
            "4B",
            "3B",
            "2B",
            "B",
            "HB",
            "F",
            "H",
            "2H",
            "3H",
            "4H",
            "5H",
            "6H",
            "7H",
            "8H",
            "None",
          ],
        ],
        glAccount: "1010606",
        divisionIdList: "ARRAY ['12']",
      },
      {
        generalName: "ALUMINUM CLIP",
        unit: "piece",
        description: ["TYPE", "LENGTH (mm)", "WIDTH (m)"],
        descriptionField: [
          [
            "Glass",
            "Panel Clips",
            "Scaffold Clips",
            "Curtain Wall Clips",
            "Electrical Conduit Clips",
            "Cable Tray Clips",
            "U-Clip",
          ],
          ["6", "300", "400", "500", "600", "30", "101.6", "12.7", "6.35"],
          ["6", "300", "400", "500", "600", "1.2", "1.6", "19.05", "9.525"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['5']",
      },
      {
        generalName: "BEAM, ALUMA",
        unit: "piece",
        description: ["LENGTH", "HEIGHT", "WIDTH BASE", "WIDTH TOP"],
        descriptionField: [
          ["6000", "200", "3200", "3700", "4300", "4900", "5000", "5500", "6400"],
          ["122", "140", "125", "85"],
          ["75", "85", "127", "122"],
          ["75", "85", "81", "84"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['32']",
      },
      {
        generalName: "OIL SPILL KIT ",
        unit: "set",
        description: [
          "TYPE",
          "MODEL",
          "BRAND",
          "LENGTH (mm)",
          "WIDTH (mm)",
          "HEIGHT (mm)",
          "CAPACITY (L)",
        ],
        descriptionField: [
          ["Drop Fronted Spill", "Yellow Wheelie Bin"],
          ["776-9703", "OSK120"],
          ["RS PRO", "Spill Centre"],
          ["550", "500"],
          ["450", "930"],
          ["100", "550"],
          ["80", "120"],
        ],
        glAccount: "1010604",
        divisionIdList: "ARRAY ['46']",
      },
      {
        generalName: "COMPACT DISC",
        unit: "piece",
        description: ["BRAND", "TYPE", "CAPACITY (mb)", "DIAMETER (mm)"],
        descriptionField: [
          ["SONY", "PHLIPS", "TDK", "FUJIFILM", "HP", "KODAK", "PANASONIC"],
          ["CD-READ ONLY MEMORY", "CD-REWRITABLE", "CR-RECORDABLE"],
          ["700"],
          ["120"],
        ],
        glAccount: "1010606",
        divisionIdList: "ARRAY ['12']",
      },
      {
        generalName: "VALVE, CHECK",
        unit: "piece",
        description: [
          "TYPE",
          "MATERIAL",
          "END CONNECTION",
          "DIAMETER NOMINAL (mm)",
          "LENGTH (mm)",
          "HEIGHT (mm)",
        ],
        descriptionField: [
          [
            "Swing",
            "Lift",
            "Ball",
            "Swing Disc",
            "Diaphragm",
            "Wafer",
            "Single non-return",
          ],
          [
            "Brass",
            "Plastic/PVC",
            "Copper",
            "Cast Iron",
            "Carbon Steel",
            "Stainless Steel",
            "Bronze",
            "Ductile Iron",
          ],
          ["Flange", "Threaded", "Other"],
          [
            "50",
            "65",
            "80",
            "100",
            "150",
            "200",
            "250",
            "300",
            "350",
            "400",
            "500",
            "76",
            "31",
            "12",
            "19",
            "125",
            "450",
            "550",
            "600",
            "15",
            "20",
            "25",
            "32",
            "40",
          ],
          [
            "230",
            "290",
            "310",
            "350",
            "480",
            "600",
            "730",
            "850",
            "980",
            "1100",
            "1250",
            "54",
            "56",
            "59",
            "66",
            "72",
            "78",
            "96",
            "145",
            "184",
            "191",
            "204",
            "203",
            "216",
            "241",
            "292",
            "330",
            "356",
            "495",
            "622",
            "698",
            "787",
            "864",
            "978",
            "1295",
            "65",
            "80",
            "90",
            "105",
            "120",
            "140",
            "85",
            "95",
            "110",
            "130",
            "150",
            "180",
            "108",
            "117",
            "127",
            "50",
            "40",
            "32",
            "25",
            "20",
            "76",
          ],
          [
            "165",
            "180",
            "190",
            "208",
            "270",
            "295",
            "337",
            "386",
            "430",
            "475",
            "565",
            "126",
            "140",
            "148",
            "153",
            "166",
            "214",
            "241",
            "289",
            "315",
            "328",
            "355",
            "156",
            "168",
            "185",
            "210",
            "239",
            "250",
            "293",
            "340",
            "375",
            "415",
            "455",
            "508",
            "585",
            "670",
            "39",
            "42",
            "48",
            "56",
            "65",
            "73",
            "61",
            "69",
            "75",
            "87",
            "50",
            "53",
            "40",
            "32",
            "25",
            "20",
            "60",
          ],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['25']",
      },
      {
        generalName: "BEAM, I",
        unit: "piece",
        description: [
          "LENGTH (mm)",
          "DEPTH (mm)",
          "WIDTH (mm)",
          "WEB THICKNESS (mm)",
          "FLANGE THICKNESS (mm)",
          "WEIGHT (m)",
        ],
        descriptionField: [
          [
            "100",
            "130",
            "150",
            "200",
            "250",
            "310",
            "360",
            "410",
            "460",
            "530",
            "610",
            "690",
          ],
          [
            "106",
            "131",
            "127",
            "162",
            "157",
            "152",
            "160",
            "153",
            "150",
            "148",
            "229",
            "222",
            "216",
            "210",
            "206",
            "203",
            "205",
            "201",
            "207",
            "200",
            "290",
            "282",
            "274",
            "269",
            "264",
            "259",
            "257",
            "254",
            "252",
            "247",
            "267",
            "262",
            "251",
            "427",
            "414",
            "404",
            "391",
            "384",
            "373",
            "366",
            "356",
            "348",
            "340",
            "333",
            "328",
            "323",
            "318",
            "315",
            "312",
            "307",
            "310",
            "302",
            "305",
            "569",
            "549",
            "531",
            "513",
            "498",
            "483",
            "475",
            "465",
            "455",
            "445",
            "434",
            "424",
            "417",
            "406",
            "399",
            "394",
            "386",
            "381",
            "376",
            "368",
            "363",
            "361",
            "353",
            "351",
            "358",
            "432",
            "419",
            "409",
            "566",
            "556",
            "546",
            "536",
            "526",
            "518",
            "508",
            "500",
            "495",
            "490",
            "472",
            "467",
            "462",
            "470",
            "460",
            "457",
            "450",
            "584",
            "577",
            "572",
            "561",
            "554",
            "551",
            "544",
            "538",
            "533",
            "528",
            "523",
            "711",
            "699",
            "688",
            "678",
            "668",
            "660",
            "653",
            "648",
            "640",
            "635",
            "627",
            "622",
            "617",
            "612",
            "607",
            "602",
            "599",
            "826",
            "772",
            "762",
            "752",
            "744",
            "737",
            "729",
            "721",
            "714",
            "706",
            "701",
            "696",
            "693",
            "683",
          ],
          [
            "103",
            "128",
            "127",
            "154",
            "153",
            "152",
            "102",
            "100",
            "210",
            "209",
            "206",
            "205",
            "204",
            "203",
            "166",
            "165",
            "134",
            "133",
            "264",
            "262",
            "259",
            "257",
            "254",
            "202",
            "148",
            "147",
            "146",
            "101",
            "340",
            "335",
            "333",
            "330",
            "328",
            "325",
            "323",
            "320",
            "318",
            "315",
            "312",
            "310",
            "307",
            "305",
            "167",
            "455",
            "450",
            "442",
            "437",
            "432",
            "427",
            "424",
            "422",
            "419",
            "417",
            "411",
            "409",
            "406",
            "404",
            "401",
            "399",
            "396",
            "394",
            "373",
            "371",
            "368",
            "172",
            "171",
            "181",
            "180",
            "179",
            "178",
            "140",
            "302",
            "300",
            "297",
            "295",
            "292",
            "290",
            "287",
            "284",
            "282",
            "279",
            "194",
            "193",
            "192",
            "191",
            "214",
            "212",
            "211",
            "207",
            "348",
            "343",
            "338",
            "229",
            "230",
            "228",
            "389",
            "366",
            "363",
            "361",
            "358",
            "356",
          ],
          [
            "7.11",
            "6.86",
            "6.1",
            "8.13",
            "6.6",
            "5.84",
            "6.6",
            "4.32",
            "14.5",
            "13",
            "10.2",
            "9.14",
            "7.87",
            "7.24",
            "6.22",
            "6.35",
            "19.2",
            "17.3",
            "15.4",
            "13.5",
            "11.9",
            "10.7",
            "9.4",
            "8.64",
            "8.89",
            "8",
            "7.37",
            "7.62",
            "6.1",
            "6.1",
            "4.83",
            "45.2",
            "41.4",
            "38.9",
            "35.6",
            "32.8",
            "30",
            "26.9",
            "24.4",
            "22.1",
            "20.1",
            "18",
            "15.5",
            "14",
            "13.1",
            "10.9",
            "9.91",
            "8.76",
            "9.4",
            "8.51",
            "7.49",
            "5.97",
            "5.56",
            "5.08",
            "78",
            "71.9",
            "66",
            "60.5",
            "55.6",
            "51.3",
            "47.8",
            "45",
            "42.2",
            "39.1",
            "35.8",
            "30",
            "27.2",
            "24.9",
            "22.6",
            "21.1",
            "18.9",
            "16.4",
            "15",
            "13.3",
            "12.3",
            "11.2",
            "13",
            "11",
            "10.5",
            "9.53",
            "9.4",
            "7.75",
            "6.48",
            "14.9",
            "11.6",
            "10",
            "9.65",
            "6.99",
            "38.6",
            "32.5",
            "29.5",
            "20.6",
            "18.5",
            "17",
            "16.6",
            "13.6",
            "12.2",
            "10.8",
            "12.6",
            "11.4",
            "9.02",
            "8",
            "23.1",
            "19.1",
            "18.3",
            "16.5",
            "15.2",
            "12.7",
            "14.7",
            "10.3",
            "35.1",
            "32",
            "26.4",
            "17.9",
            "50",
            "18.4",
            "16.8",
            "12.4",
            "11.7",
          ],
          [
            "8.76",
            "2",
            "9.14",
            "11.6",
            "9.27",
            "6.6",
            "10.3",
            "7.11",
            "5.46",
            "4.95",
            "23.7",
            "20.6",
            "17.4",
            "14.2",
            "12.6",
            "11",
            "11.8",
            "10.2",
            "8.38",
            "8",
            "6.48",
            "5.21",
            "31.8",
            "28.4",
            "25.1",
            "22.1",
            "19.6",
            "17.3",
            "15.6",
            "15.7",
            "13.5",
            "13",
            "11.2",
            "10",
            "6.86",
            "5.33",
            "75.2",
            "68.8",
            "62.7",
            "57.2",
            "52.6",
            "48.3",
            "44.2",
            "39.6",
            "35.6",
            "28.2",
            "22.9",
            "18.7",
            "17",
            "15.4",
            "16.3",
            "14.6",
            "13.1",
            "13.2",
            "9.65",
            "10.8",
            "8.89",
            "6.73",
            "5.72",
            "125",
            "115",
            "106",
            "97",
            "88.9",
            "81.5",
            "77.2",
            "72.4",
            "67.6",
            "57.4",
            "48",
            "43.7",
            "36.6",
            "33.3",
            "30.2",
            "27.7",
            "26.2",
            "23.9",
            "21.8",
            "19.8",
            "18",
            "21.7",
            "19.9",
            "18.3",
            "16.4",
            "16.8",
            "15.1",
            "9.78",
            "10.7",
            "8.51",
            "25",
            "22.2",
            "19.3",
            "16.9",
            "18.2",
            "16",
            "14.4",
            "12.8",
            "69.6",
            "63.5",
            "58.4",
            "53.6",
            "48.5",
            "44.5",
            "40.4",
            "33.5",
            "30.5",
            "26.9",
            "19.1",
            "17.7",
            "14.5",
            "13.3",
            "41.4",
            "37.6",
            "34.5",
            "29.2",
            "26.4",
            "24.4",
            "20.3",
            "23.6",
            "21.2",
            "18.8",
            "16.5",
            "13.6",
            "11.4",
            "69.1",
            "63",
            "57.9",
            "53.1",
            "43.9",
            "39.9",
            "37.1",
            "34",
            "31",
            "21.6",
            "24.9",
            "14.9",
            "15",
            "89.9",
            "49",
            "45",
            "40.9",
            "38.1",
            "27.4",
            "24.8",
            "27.9",
            "21.1",
            "18.9",
          ],
          [
            "19.3",
            "28.1",
            "23.8",
            "37.1",
            "29.8",
            "22.5",
            "24",
            "18",
            "13.5",
            "13",
            "100",
            "86",
            "71",
            "59",
            "52",
            "46.1",
            "41.7",
            "35.9",
            "31.3",
            "26.6",
            "15",
            "167",
            "149",
            "131",
            "115",
            "101",
            "89",
            "80",
            "73",
            "67",
            "58",
            "49.1",
            "44.8",
            "38.5",
            "32.7",
            "28.4",
            "25.3",
            "22.3",
            "17.9",
            "500",
            "454",
            "415",
            "375",
            "342",
            "313",
            "283",
            "253",
            "226",
            "202",
            "179",
            "158",
            "143",
            "129",
            "117",
            "107",
            "97",
            "79",
            "74",
            "60",
            "44.5",
            "38.7",
            "28.3",
            "21",
            "1090",
            "990",
            "900",
            "818",
            "744",
            "677",
            "634",
            "592",
            "551",
            "509",
            "463",
            "421",
            "382",
            "347",
            "314",
            "287",
            "262",
            "237",
            "216",
            "196",
            "162",
            "147",
            "134",
            "122",
            "110",
            "91",
            "72",
            "64",
            "57.8",
            "51",
            "44",
            "39",
            "32.9",
            "132",
            "114",
            "85",
            "75",
            "53",
            "38.8",
            "464",
            "384",
            "349",
            "315",
            "286",
            "260",
            "235",
            "213",
            "193",
            "177",
            "144",
            "128",
            "113",
            "106",
            "82",
            "68",
            "300",
            "272",
            "248",
            "219",
            "182",
            "165",
            "150",
            "138",
            "123",
            "109",
            "92",
            "66",
            "498",
            "455",
            "372",
            "341",
            "307",
            "285",
            "241",
            "217",
            "195",
            "174",
            "155",
            "153",
            "140",
            "125",
            "802",
            "548",
            "457",
            "419",
            "350",
            "323",
            "289",
            "265",
            "240",
            "192",
            "170",
            "152",
          ],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['5']",
      },
      {
        generalName: "BLIND RIVET",
        unit: "piece",
        description: [
          "MATERIAL",
          "TYPE",
          "FINISH",
          "SHELL LENGTH (mm)",
          "RIVET CLEARANCE (mm)",
        ],
        descriptionField: [
          [
            "Aluminum",
            "Steel",
            "Stainless Steel",
            "Copper",
            "Brass",
            "Plastic",
            "Nickel-copper",
            "Zinc",
          ],
          [
            "F2710 32 6",
            "F2710 32 12",
            "F2710 32 16",
            "F2710 32 20",
            "F2710 4 8",
            "F2710 4 10",
            "F2710 4 16",
            "F2710 4 24",
            "F2710 48 7",
            "F2710 48 10",
            "F2710 48 16",
            "F2710 48 21",
          ],
          ["Galvanised", "GI-plated"],
          [
            "7",
            "10.2",
            "13.3",
            "16.5",
            "7.7",
            "10.9",
            "14.1",
            "17.3",
            "20.4",
            "8.5",
            "11.7",
            "14.9",
            "18",
            "21.2",
            "24",
            "27",
            "30",
          ],
          [
            "9",
            "12.2",
            "15.3",
            "18.5",
            "10",
            "13.2",
            "16.4",
            "19.6",
            "22.7",
            "11",
            "14.2",
            "17.4",
            "20.6",
            "24.2",
            "26.6",
            "29.6",
            "32.6",
          ],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['6']",
      },
      {
        generalName: "EXHAUST FAN",
        unit: "piece",
        description: ["BRAND", "TYPE", "SIZE"],
        descriptionField: [
          ["OMNI", "ASAHI", "TOLSEN", "WINLAND"],
          ["WALL MOUNTED", "CEILING MOUNTED", "INDUSTRIAL", "STANDARD MOUNTED"],
          ["203.2"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['8']",
      },
      {
        generalName: "EMULSION EXPLOSIVE ",
        unit: "piece",
        description: [
          "BRAND",
          "DIAMETER OF CARTRIDGES (mm)",
          "CARTRIDGE WEIGHT (g)",
          "VOD METER",
        ],
        descriptionField: [
          [
            "Croda International Plc",
            "Incitec Pivot Limited",
            "Sasol Ltd",
            "Orica Limited",
            "African Explosives Limited",
            "MAXAM",
            "Keltech Energies Ltd",
            "Yara International",
          ],
          ["25", "32", "40", "25", "32", "40"],
          ["125", "185", "395", "125", "185", "395"],
          ["4000", "4500"],
        ],
        glAccount: "1010602",
        divisionIdList: "ARRAY ['40']",
      },
    ];

    const ITEM_UNIT_CHOICES = [
      "ampere",
      "area",
      "assembly",
      "bank cubic meter",
      "bit",
      "board foot",
      "byte",
      "candela",
      "centigram",
      "centiliter",
      "centimeter",
      "coulumb",
      "cubic centimeter",
      "cubic foot",
      "cubic meter",
      "exabyte",
      "farad",
      "foot",
      "gallon",
      "gigabyte",
      "gram",
      "hectare",
      "henry",
      "hertz",
      "horespower",
      "inch",
      "joule",
      "kelvin",
      "kilo hertz",
      "kilobyte",
      "kilogram",
      "kiloliteer",
      "kilometer",
      "kilonewton",
      "liter",
      "lumen",
      "lux",
      "mega hertz",
      "mega pixel",
      "megabyte",
      "megapascal",
      "meter",
      "metric ton",
      "microgram",
      "microleter",
      "micrometer",
      "miligram",
      "milliampere hours",
      "milliliter",
      "millimeter",
      "mole",
      "nanometer",
      "newton",
      "ohm",
      "ounce",
      "pascal",
      "petabyte",
      "pound",
      "quart",
      "rotation per minute",
      "second",
      "siemens",
      "square foot",
      "square kilometer",
      "square meter",
      "terabyte",
      "teraliter",
      "tesla",
      "volt",
      "watt",
      "weber",
      "yottabyte",
      "zettabyte",
    ];

    const TEAM_ID = "a5a28977-6956-45c1-a624-b9e90911502e";
    const SECTION_ID = "0672ef7d-849d-4bc7-81b1-7a5eefcc1451";
    const CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    const itemInput = [];
    const fieldInput = [];
    const itemDescriptionInput = [];
    const itemDescriptionFieldInput = [];

    itemData.forEach((item) => {
      const itemId = plv8.execute('SELECT uuid_generate_v4()')[0].uuid_generate_v4;
      
      // insert item
      itemInput.push({
        item_id: itemId,
        item_general_name: item.generalName,
        item_unit: item.unit,
        item_gl_account: item.glAccount,
        item_team_id: TEAM_ID,
        item_division_id_list: item.divisionIdList
      });

      item.description.forEach((description, index) => {
        const fieldId = plv8.execute('SELECT uuid_generate_v4()')[0].uuid_generate_v4;
        const itemDescriptionId = plv8.execute('SELECT uuid_generate_v4()')[0].uuid_generate_v4;

        // insert field
        fieldInput.push({
          field_id: fieldId,
          field_name: description,
          field_is_required: true,
          field_type: 'DROPDOWN',
          field_order: 14,
          field_section_id: SECTION_ID,
        });

        // insert description
        itemDescriptionInput.push({
          item_description_id: itemDescriptionId,
          item_description_label: description,
          item_description_field_id: fieldId,
          item_description_item_id: itemId,
        });

        item.descriptionField[index].forEach((descriptionField) => {
          // insert description field
          itemDescriptionFieldInput.push({
            item_description_field_value: descriptionField,
            item_description_field_item_description_id: itemDescriptionId,
          });
        });
      });
    });

    const item_input = itemInput.map((item) => `('${item.item_id}', '${item.item_general_name}', '${item.item_unit}', '${item.item_gl_account}', '${item.item_team_id}', ${item.item_division_id_list})`).join(',');

    const field_input = fieldInput.map((field) => `('${field.field_id}', '${field.field_name}', '${field.field_is_required}', '${field.field_type}', '${field.field_order}', '${field.field_section_id}')`).join(',');

    const item_description_input = itemDescriptionInput.map((itemDescription) => `('${itemDescription.item_description_id}', '${itemDescription.item_description_label}', '${itemDescription.item_description_field_id}', '${itemDescription.item_description_item_id}')`).join(',');

    const item_description_field_input = itemDescriptionFieldInput.map((itemDescriptionField) => `('${itemDescriptionField.item_description_field_value}', '${itemDescriptionField.item_description_field_item_description_id}')`).join(',');

    plv8.execute(`INSERT INTO item_table (item_id, item_general_name, item_unit, item_gl_account, item_team_id, item_division_id_list) VALUES ${item_input}`);
    plv8.execute(`INSERT INTO field_table (field_id, field_name, field_is_required, field_type, field_order, field_section_id) VALUES ${field_input}`);
    plv8.execute(`INSERT INTO item_description_table (item_description_id, item_description_label, item_description_field_id, item_description_item_id) VALUES ${item_description_input}`);
    plv8.execute(`INSERT INTO item_description_field_table (item_description_field_value, item_description_field_item_description_id) VALUES ${item_description_field_input}`);
  })
$$ LANGUAGE plv8;
SELECT item_seed();
DROP FUNCTION IF EXISTS item_seed;

DROP FUNCTION IF EXISTS supplier_seed;
CREATE FUNCTION supplier_seed()
RETURNS VOID AS $$
  plv8.subtransaction(function(){

    const supplierData = [
        "10K CONCRETE MIX SPECIALIST, INC.",
        "10K SOUTH CONCRETE MIX SPECIALIST, INC.",
        "2GO GROUP, INC.",
        "3MR BUILDERS AND SUPPLY",
        "7- CIRCLE ENTERPRISE",
        "7 IN 1 BLOW PEST CONTROL SERVICES",
        "747 LUMBER & CONST. SUPPLY",
        "8 INTERCONNECTIVITIES INCORPORATED",
        "888 GOLDEN DRAGON TRADING CO.",
        "A.B. DE CASTRO TRADING",
        "A.D. DONOR GRAVEL & SAND",
        "A1 ENGINEERING CENTRE",
        "AA INFINITY AGGREGATES SUPPLY",
        "AB INNOVATIONS INC.",
        "ABANTE TIRE MARKETING CORPORATION",
        "ABB, INC.",
        "ABC PHILIPPINES INC.",
        "ABSOLUTE STEEL INCORPORATED",
        "AC HARRIS CABLE CORP.",
        "ACCESS FRONTIER TECHNOLOGIES, INC.",
        "ACCUBEND INC.",
        "ACERSTEEL INDUSTRIAL SALES, INC.",
        "ACHAS AGGREGATES",
        "ACL INDUSTRIAL SALES",
        "ACRO OFFICE PRODUCTS INC.",
        "ACS MANUFACTURING CORPORATION",
        "ADVANCE MARKETING",
        "ADVATECH INDUSTRIES INC.",
        "AERO-SEAL TRADING & INDUSTRIAL SUPPLY",
        "AFFILIATED ELECTRONICS SERVICE CORPORATION",
        "AGP INDUSTRIAL SALES AND SERVICES INC.",
        "AGRU PHILIPPINES CORPORATION",
        "AHNEX BUILDERS & READY MIX CORPORATION",
        "AIC INDUSTRIAL AND SAFETY SUPPLY",
        "AIRNERGY AND RENEWABLES, INC.",
        "AIR-RICH INDUSTRIAL SYSTEMS,INC.",
        "AIRSPEED INTERNATIONAL CORPORATION",
        "AIRTAC COMPRESSOR PARTS AND SERVICES",
        "AKIRA TAKAHASHI",
        "AL & AJ TILES CENTER",
        "ALBE CONSTRUCTION & ENTERPRISES",
        "ALBERT ALAMARIS CONSTRUCTION SUPPLY",
        "ALEJA BLOWER CORPORATION",
        "ALFECO CALIBRATION CENTER",
        "ALLAN G. ROMASANTA GENERAL MERCHANDISE",
        "ALLIANCE INDUSTRIAL SALES CORPORATION",
        "ALLIED CONCRETE PRODUCTS, INC.",
        "ALONA MARIETTA ENTERPRISES",
        "ALORA''S HEAVY EQUIPMENT PARTS SUPPLY",
        "ALPHA PACIFIC ELECTRIC CO. INC.",
        "ALPHA POOLS, INC.",
        "ALPHATEC CHEMICAL CORP.",
        "AL-SY MARKETING ENTERPRISES",
        "ALUMINUM POWER MARKETING CORP.",
        "ALVIMCO CO. INC.",
        "AMBAS HARDWARE",
        "AMERICAN PACKING INDUSTRIES (PHILS.) CORP",
        "AMICI MERCANTILE INC.",
        "AMSTAR PROCESS TECHNOLOGY, INC.",
        "ANAKO PHILIPPINES CORPORATION",
        "ANDISON INDUSTRIAL SALES INC.",
        "ANDRITZ HYDRO PRIVATE LTD.",
        "AN''S ENTERPRISES",
        "ANSUICO, INCORPORATED",
        "ANT INDUSTRIAL WORKS, INC.",
        "ANTRAK PHILIPPINES TRANSPORT SOLUTIONS CORPORATION",
        "ANTS TECHNOLOGIES, INC.",
        "ANVIO''S MERCHANDISING",
        "APC INDUSTRIAL SUPPLY",
        "APO CEMENT CORPORATION",
        "ARC-CARE ENTERPRISES",
        "ARCHIFOLD ARCHITECTURAL SYSTEM, INC.",
        "ARDEE''S VENTURES & LOGISTICS, INC.",
        "ARGENTECHS, INC.",
        "ARISTOCRAT TRADING & ENGINEERING SERVICES",
        "ARKISOLUTIONS TRADING INC.",
        "ARM-G AIR & SEA LOGISTICS INC.",
        "ARTY FERROCAST INC.",
        "ARZADON ENTERPRISES",
        "ASCD INDUSTRIAL SALES",
        "ASCONTECH BUILDERS",
        "ASCRETE MACHINE SUPPLIER INC.",
        "ASIA INDUSTRIES MATERIAL HANDLING EQUIPMENT CORP.",
        "ASIAN GULF DISTRIBUTOR",
        "ASIONG''S INDUSTRIAL PRODUCTS",
        "ASPEN INDUSTRIAL SALES CORP.",
        "ATEX AUTOMATION AND TECHNOLOGIES CORP.",
        "ATIENZA SHIPPING LINES",
        "ATLANTA INDUSTRIES, INC.",
        "ATLAS CONCRETE WORKS",
        "ATLAS COPCO (PHILIPPINES) INC.",
        "AUDI MOTORCARS, INC.",
        "AUSTRALIAN MINING TECHNOLOGIES",
        "AUTOCIRCULO CORPORATION-GREENHILLS",
        "AUTOCIRCULO CORPORATION-LAS PINAS",
        "AVA CONSTRUCTION CORPORATION",
        "AVESCO MARKETING CORPORATION",
        "B M POWER SUPPLY & ELECTRICAL SERVICES",
        "B. SORIA MACHINE SHOP",
        "B.A. BILALAT HARDWARE AND AGGREGATES",
        "B.C.T. TRADING & CONSTRUCTION",
        "B.S. TEMPLE HARDWARE",
        "BADSBRO CRUSHING PLANT",
        "BANCUANG PETRON GASOLINE STATION",
        "BARICA HEAVY EQUIPMENT PARTS CENTER",
        "BASE STAR BROKERAGE & LITHERAGE SERVICES",
        "BASECO SHIPYARD CORPORATION",
        "BASF PHILIPPINES, INC.",
        "BASIC VENTURES VULCANIZING SERVICES & GENERAL MERC",
        "BASIC1 BUSINESS SOLUTIONS CO.",
        "BASILICA TRADING",
        "BASOY PETRON FILLING STATION",
        "BATPARTS SUPPLY CO. INC.",
        "BATTERYWORLD, INC.",
        "BEARING CENTER &  MACHINERY, INC.",
        "BEE GEE MACHINE SHOP AND ENGINEERING WORKS",
        "BEE SIN CANVAS STORE",
        "BEGUL BUILDERS CORPORATION",
        "BELLKAT INDUSTRIAL SUPPLY",
        "BENEDICTO STEEL CORPORATION",
        "BENTER N CUTTER MACHINERY CORP.",
        "BENTOY ELECTRICAL REWINDING SHOP",
        "BEST CHOICE ENTERPRISES",
        "BEST FORD TRADING",
        "BESTANK MANUFACTURING CORPORATION",
        "BESTREAD TRADING AND SERVICES",
        "BESTRESOURCE, INC.",
        "BESTULZ INC.",
        "BETAFOAM CORPORATION",
        "BETH CONSTRUCTION & ENTERPRISES",
        "BETINA TRUCKING SERVICES, INC.",
        "BETONVAL READYCONCRETE, INC.",
        "BGA HARDWARE",
        "BIA''S PRINTING AND ADVERTISING SERVICES",
        "BIGLEAP TECHNOLOGIES INC.",
        "BIZ ASIA TRADING INC.",
        "BLAIRES ENTERPRISES",
        "BLASTMASTER INCORPORATED",
        "BLAZEGUARD INDUSTRIAL TRADERS",
        "BLUE MOUNTAIN SAFETY & INDUSTRIAL PRODUCTS INC",
        "BLUE OCEAN CHEMTRADE INC.",
        "BLUESTAR WORLDWIDE LOGISTIC CORP.",
        "BMC TRUCKING SERVICES",
        "BNR CONSTRUCTION AND DEVELOPMENT CORPORATION",
        "BOEING MATERIAL HANDLING CORP.",
        "BORDEOS HEAVY EQUIPMENT PARTS CENTER",
        "BORDEOS TRACTOR PARTS AND SERVICES, CORP.",
        "BRIGHT ELECTRICAL & HARDWARE CORP.",
        "BRILLIANCY AUTOMOTIVE MACHINE SHOP",
        "BRYANT HEAVY EQUIPMENT TRADING",
        "BUREAU VERITAS SA",
        "BUSINESS MACHINES CORPORATION",
        "BVV SPEZIALTIEFBAUTECHNIK VERTRIEBS GMBH",
        "C & J GENERAL MERCHANDISE & SERVICES",
        "C.M. PANCHO CONSTRUCTION, INC.",
        "CABUYAO GIANT ENTERPRISE CORP.",
        "CAGAYAN DE ORO GAS CORPORATION",
        "CAGAYAN REGENT FURNISHINGS",
        "CALAPAN GLASS AND STAINLESS SUPPLY",
        "CALAPAN ORIENTAL MACHINE AND ENGINEERING",
        "CALIFORNIA ENTERPRISE",
        "CALOOCAN BEARING & PARTS CORP",
        "CALOOCAN GAS CORPORATION (CALAPAN)",
        "CALOOCAN GAS CORPORATION (CALOOCAN)",
        "CALOOCAN STANDARD INC.",
        "CAMEC JCB CORP.",
        "CAPERNAUM DEVELOPMENT CORPORATION",
        "CAPILITAN ENTERPRISE",
        "CARPENTER''S WOODCRAFT CENTER",
        "CARTRIDGE WORLD GREENHILLS",
        "CARWORLD, INC.",
        "CASTLE POWER SOLUTIONS PHILIPPINES, INC.",
        "CASTRO HEAVY METAL EQUIPMENT AND SPARE PARTS",
        "CATHAY INDUSTRIAL & MILL SUPPLY INC.",
        "C-CUBE GENERAL MERCHANDISE",
        "CEBU HYDRAULIC HOSE CENTER, INC.",
        "CEBU SEA CHARTERERS, INC.",
        "CEILS COMMERCIAL",
        "CEMENT MANUFACTURERS ASSOCIATION OF THE PHILS. INC",
        "CEMENTAID PHILIPPINES, INC.",
        "CENTER INDUSTRIAL SUPPLY CORP.",
        "CENTRO CALAPAN HARDWARE AND GENERAL MERCHANDISE",
        "CENTURY IRON WORKS, INC.",
        "CEPALCO ENERGY SERVICES CORPORATION",
        "CERPLAS ENTERPRISES",
        "CHERRY''S GIFT SHOP-BRANCH II",
        "CHRISTIAN MOTOR SALES CORPORATION",
        "CICJ GENERAL CONSTRUCTION & BUILDING MAINTENANCE",
        "CIFRA MARKETING CORPORATION",
        "CITICON READY MIX & CONST., INC.",
        "CITIMOTORS LAS PIÑAS, CORP.",
        "CITY LIGHT GLASS & ALUMINUM",
        "CITYTECH ROLL-UP SHUTTER",
        "CIVIC MERCHANDISING,INC.",
        "CLARKSON INDUSTRIAL SUPPLY INC.",
        "CLIXLOGIC, INC.",
        "CLKT TRADING",
        "CLOVER MOTOR SUPPLY, INC",
        "CLUSTER AIRE INDUSTRIES, INC.",
        "CMA CGM PHILIPPINES, INC.",
        "CMM INDUSTRIAL SALES",
        "CNZ CONSTRUCTION CORP.",
        "CO BAN KIAT HARDWARE, INC.",
        "COLDPOINT AIR SYSTEMS CORPORATION",
        "COLORSTEEL SYSTEMS CORP.",
        "COMER INDUSTRIAL DEVELOPMENT INC.",
        "COMFAC CORPORATION",
        "COMPRESSAIR CENTER, INC.",
        "COMPUTER KINGDOM",
        "CON FORMS ASIA SDN BHD",
        "CONCEPT COMPUTER CENTER",
        "CONCRETE MASTERS INC.",
        "CONMIX BUILDING SOLUTION INC.",
        "CONSTRUCTION CHEMICALS TECHNOLOGIES INC.",
        "CONTE BUILDERS & CONSTRUCTION SUPPLY",
        "CORAND SUPPORT MARKETING, INC.",
        "CORDERO BUILDERS",
        "CORELINE DRILLING SUPPLIES & SERVICES, CO",
        "CORON MOTOR PARTS",
        "COSMOTECH PHILIPPINES, INC.",
        "COST U LESS TRADE VENTURES",
        "COSTEMARA, INC.",
        "CPD MARKETING & GENERAL MERCHANDISING",
        "CQ DX REPAIR CENTRE",
        "CRANE AND HEAVY EQUIPMENT CERTIICATION CORP.",
        "CRL CALABARQUEZ CORPORATION",
        "CROWN PAPER AND STATIONERIES SUPPLY",
        "CTVENTURES CORP.",
        "CW MARKETING AND DEVELOPMENT CORP.",
        "CYTRONIX TRADING AND AUTOMATION",
        "D. MERCADO TRADING",
        "D.J. ROQUE CONST. CO., INC.",
        "DAIRIN AUTO TRUCKLINE, INC.",
        "DALE STARR ENTERPRISES",
        "DAMASCO MARKETING",
        "DANITECH POWER SYSTEM, INC.",
        "DANTES RADIATOR ENTR CORP.",
        "DASMARI¥AS ISUZU PARTS CENTER",
        "DATA COMPUTER FORMS, INCORPORATED",
        "DATAWORLD COMPUTER CENTER",
        "DAVAO BETA SPRING INC.",
        "DAVAO GOLDEN HARDWARE, INC.",
        "DAVAO SUN-ASIA GENERAL MERCHANDISING, INC.",
        "DEAN''S COCO LUMBER & CONSTRUCTION SUPPLY",
        "DECORS AND DESIGN CENTER",
        "DELA TORRE AND CO., INC.",
        "DELGO BUILDERS",
        "DELS APPAREL CORPORATION",
        "DELSONS OIL SEAL AND PACKINGS MARKETING",
        "DELTA CONCRETE CORPORATION",
        "DELTA STAR POWER MANUFACTURING CORP.",
        "DENISE SEAOIL GASOLINE STATION",
        "DENOVO EXPRESS ENDEAVOURS CORPORATION",
        "DEX INTERNATIONAL CO.",
        "DEXTERTON CORPORATION",
        "DG FOURTEEN TRADING AND CONSTRUCTION",
        "DIAMOND GREENHILLS INC",
        "DIAMOND MOTOR CORP.",
        "DIESEL MATE CALIBRATION AND MOTOR WORKS COR",
        "DIMAANO''S COMMERCIAL",
        "DJM GLASS & ALUMINUM SUPPLY",
        "DML TRUCKING AND EQUIPMENTS",
        "DONUM INDUSTRIAL CORPORATION",
        "DORON BUILDERS & CONSTRUCTION SUPPLIES LTD. CO.",
        "DOT MARKETING",
        "DREX INDUSTRIAL SALES",
        "DRILLCORP PHILIPPINES INC",
        "DS WINDOWS & WALLS INTERIOR SUPPLY",
        "DSP PREROV, SPOL. S R.O.",
        "DURAGLASS INC.",
        "DYNAMIC PILE TESTING PHILIPPINES",
        "D''ZIGNO TILE COMPANY INC",
        "E & V GENERAL MERCHANDISE",
        "E.C. DAUGHSON, INC.",
        "E.C.G. BROKERAGE, INC.",
        "E.G. ENERGY CORPORATION",
        "E.G.V. ELECTROPLATING SHOP",
        "E.I. GARCIA TRADING",
        "E.S. CASTRO TRADING",
        "EAGLE EQUIPMENT COMPANY, INC",
        "EAGLE SHIELD ENTERPRISES",
        "EAST RICHWOOD SAFE CO., INC.",
        "EASTERN WIRE MANUFACTURING INC.",
        "EASTMAN INDUSTRIAL SUPPLY, INC.",
        "EBARA PUMPS PHILIPPINES, INC.",
        "ECOEQUIPMENT SAFETY ENTERPRISES",
        "ECOPACK CORPORATION",
        "ECT PLUMBING WORKS",
        "ED LOVEHEIM VAN UMANI",
        "EDGARDO VICERRA",
        "EDSA FURNITURE & APPLIANCES, INC.",
        "EEE TRUCKING SERVICES",
        "EFCO PHILIPPINES LTD.",
        "EHJT HARDWARE & CONSTRUCTION SUPPLY",
        "EISUS ENTERPRISES",
        "ELDRIDGE G. INTERNATIONAL ENTERPRISE CORPORATION",
        "ELECTROPRO MARKETING",
        "ELEKSIS MARKETING CORPORATION",
        "ELITEAIR CLIMATE CONTROL INCORPORATED",
        "ELKON BETON MAKINALARI SANAYI VE TICARET ANONIM SIRKETI",
        "ELLA''S DRESS SHOP",
        "EMCOR, INCORPORATED",
        "EMMANUEL T. ANGELO",
        "ENERGYNET INC.",
        "ENERPRO MARKETING INC.",
        "ENERTECH BUILDERS ENTERPRISES",
        "ENGINEERED FIRE AND SECURITY SYSTEMS, INC.",
        "ENGINEERING & DEVELOPMENT CORPORATION OF THE PHILIPPINES",
        "ENOCOR CONSTRUCTION & HAULING SERVICES",
        "ENTER-FIL INDUSTRIAL PRODUCTS",
        "ENVIRONMENTAL LIFE INDUSTRIAL TECHNOLOGIES",
        "ERJ INDUSTRIAL PRODUCTS",
        "ERQ CONSTRUCTION, INC.",
        "ESBE INDUSTRIAL BUILDERS & CONTRACTORS CORPORATION",
        "EUROBRASS PRODUCT,INC.",
        "EVERBEST LOGISTICS SERVICES",
        "EXCELINE GLOBAL CONCEPTS INC.",
        "EXEC ENGINEERING WORKS",
        "EXICON CONSTRUCTION SUPPLY",
        "EXZZON CORP.",
        "F & E ENTERPRISES, INC.",
        "F.D.J. ROSMAR CORP.",
        "F.R. HORTON ENTERPRISES",
        "FABRILINE INCORPORATED",
        "FALCON WATERFREE PHILIPPINES, INC.",
        "FAR EASTERN HARDWARE & FURNITURE ENTERPRISES, INC.",
        "FAR EASTERN HARDWARE DEPOT",
        "FD DE GUZMAN LOGISTICS",
        "FELBRETCH J. MATEO",
        "FERVID INTERNATIONAL PRODUCTS, INC.",
        "FH COMMERCIAL, INC.",
        "FIL-AMERICAN HARDWARE CO., INC.",
        "FILIPINAS RENEWABLE ENERGY DEVELOPMENT CORPORATION",
        "FILTEX CENTER",
        "FINAL ART WORK GRAPHICS INC.",
        "FINE W ENTERPRISES",
        "FIRE SOLUTIONS, INC.",
        "FIREFLY ELECTRIC & LIGHTING CORPORATION",
        "FIRST ASIAN METALS CORPORATION",
        "FIRST NITRO CORPORATION",
        "FIRST PHIL SKILLS & EQUIPMENT TESTING CORPORATION",
        "FIRST PHILIPPINE SCALES, INC.",
        "FIRST SCAN PHILS., INC.",
        "FIVE STALLON TRADING",
        "FLEXIMETAL INCORPORATED",
        "FOOT PLUS MANUFACTURING CORPORATION",
        "FORD QUEZON AVENUE/MMI",
        "FOREMOST EASTERN ASIAN TRADING COMPANY INC.",
        "FOREST HILLS GARDEN",
        "FORMAPLY INDUSTRIES, INC.",
        "FORMINGTECH MARKETING",
        "FORZA KEMIKA AG, INC.",
        "FOSROC PHILIPPINES, INC.",
        "FOUR C TRADING",
        "FOUR PILLARS PAINTS CENTER & GENERAL MDSE.INC.",
        "FRANCISCO P. UYGUANGCO, JR.",
        "FREE-AIRE INDUSTRIES, INC",
        "FREY-FIL CORPORATION",
        "FUERTE PETRON STATION",
        "FUJI-HAYA ELECTRIC",
        "FUMACO, INC.",
        "FURUKAWA ELECTRICAL SUPPLY & SERVICES CO.",
        "FW NICOL PHILIPPINES INC.",
        "G. E. T. ENTERPRISES",
        "G.S.GO BROS., INC.",
        "G.U. ENGINEERING SOLUTIONS, INC.",
        "GA PRINTING, INC.",
        "GABRIEL DRILLING AND BLASTING SERVICES",
        "GAIN APPLIANCE SERVICE CENTER",
        "GBM CONCRETE PRODUCTS MANUFACTURING AND TRADING",
        "GBM SURPLUS CENTER - CDO",
        "GCK INTERNATIONAL INC.",
        "GDBS INC.",
        "GECEL ENGINEERING & SERVICES",
        "GEMAC TRADING & DEVELOPMENT CORPORATION",
        "GEMARC ENTERPRISES INC.",
        "GENERAL HARDWARE PRODUCTS, INC.",
        "GEOCONSTRUCTION DEVELOPMENT CORPORATION",
        "GEOLITE INNOVATIVE TRADING",
        "GEORGETOWN ELECTRICAL SYSTEMS",
        "GEOSCIENCE TECHNOLOGIES, INC.",
        "GEOSUPPLY  LAM CORPORATION",
        "GEOTECH MERCANTILE CORPORATION",
        "GERCON SHELL STATION",
        "GERONA ENTERPRISES",
        "GIAN TRUCKING",
        "GIARDINI DEL SOLE MANUFACTURING & TRADING CORP.",
        "GIBMA ENGINEERING SERVICES",
        "GICA GRINDING WHEEL CORPORATION",
        "GIGA TRADING",
        "GIGAWORKZ TECHNOLOGIES INC.",
        "GLASSPRO SOLUTION & SERVICES INC.",
        "GLOBAL INNOVATION TRADING CO.",
        "GLOBAL SAFETY & INDUSTRIAL SUPPLY",
        "GLOBE-AIRE TECHNICAL SERVICES COMPANY",
        "GLOBEMASTER TRADING",
        "GLORY LUMBER CONSTRUCTION SUPPLIES, INC.",
        "GOLD MASTERS ENTERPRISES",
        "GOLDCREST MARKETING CORPORATION",
        "GOLDEN BAT (FAR EAST) INC.",
        "GOLDEN POINT AUTO CARE, INC.",
        "GOLDSTRONG CORPORATION",
        "GOLDTOWN INDUSTRIAL SALES CORPORATION",
        "GOMESON METAL CRAFT",
        "GOOD HAND SECURITY PRODUCTS",
        "GOOD MORNING INT''L. CORPORATION",
        "GOODYEAR STEEL PIPE CORP.",
        "GOTESCO MARKETING, INCORPORATED",
        "GPACE FIRE FIGHTING EQUIPMENT AND SERVICES",
        "GRAND POWER MOTOR REWINDING AND SERVICES",
        "GRANT AND GLENN TRUCKING SERVICES",
        "GRAVEL DEN AGGREGATES",
        "GREAT SHEPHERD COMMERCIAL",
        "GREAT WALL ENTERPRISES",
        "GREATPHIL ENTERPRISES INC.",
        "GREEN CONCEPT SYSTEMS PHILS. INC.",
        "GREEN HORIZON LANDSCAPERS & DEVELOPERS, INC.",
        "GREENCARE TRADING AND SERVICES",
        "GREENLEE CP ELECTRICAL CORPORATION",
        "GRMIV INC.",
        "GRS JR GENERAL MERCHANDISE AND CONSTRUCTION",
        "GTC GLOBAL INC.",
        "GTS CONSTRUCTION SUPPLY & DEV''T.  CORP.",
        "GUAN YIAC HARDWARE",
        "GULAY GLASS ALUMINUM AND TRADING",
        "GULF OIL PHILIPPINES, INC",
        "GUZENT INC.",
        "H. LACUNA TRADING AND CONSTRUCTION CORPORATION",
        "H.MALABANAN SEPTIC SLUDGE EXCAVATOR & PLUMBING SERVICES",
        "H.E. & G. ENTERPRISES",
        "HAFELE PHILIPPINES INC.",
        "HALCON BUILDERS SUPPLIES",
        "HALIFAX GLASS & ALUMINUM SUPPLY, INC.",
        "HAN''S INFINITE TOOLS",
        "HARDROCK AGGREGATES, INC.",
        "HARDSTONE RESOURCES CORP.",
        "HASTINGS MOTOR CORPORATION",
        "HATULAN ENGINEERING WORKS & MACHINE SHOP",
        "HAWK MACHINERY FABRICATION",
        "HB LUMBANG ELECTRIC & INDUSTRIAL CORP",
        "HDN TECHNOLOGY & RESOURCES, INC.",
        "HE AND SONS CORPORATION",
        "HERMIAS ENTERPRISES",
        "HH ASIA TRADING INC.",
        "HIGH PERFORMANCE SOLUTIONS INC.",
        "HIGHLAND TRACTOR PARTS, INC",
        "HIGHLY INDUSTRIALIZED COMMODITIES CORPORATION",
        "HIGHMAX CONSTRUCTION SUPPLY INC.",
        "HILTI (PHILIPPINES) INC.",
        "HIMAX MARKETING",
        "HI-TECH STEEL INDUSTRIES CORPORATION",
        "HI-TEK ELECTRO MECHANICAL SALES & SERVICES CORP.",
        "HI-TOP PELLETIZE PRODUCT",
        "HOLCIM PHILIPPINES, INC. - MCKINLEY",
        "HOME DESIGN",
        "HOME TRUST MARKETING CORPORATION",
        "HOOVERDALE INDUSTRIAL CORPORATION",
        "HOPPS MARKETING, INC",
        "HRN AUTO SUPPLY",
        "HTSP MEDIA PRODUCTION SERVICES",
        "HUNG COCONET & HYDROSEEDING, INC.",
        "HUSSAR ENTERPRISES",
        "HUU BUILDING SOLUTIONS INC.",
        "HYDRAUKING INDUSTRIAL CORPORATION",
        "HYPER KEM AND MACHINERIES INC.",
        "IC MARKETING",
        "ICARGO WORLDWIDE LOGISTICS INC.",
        "ICI SYSTEMS INC.",
        "ICSD COMPUTER SUPPLIES",
        "IDHI PORTS & SHIPPING INC.",
        "IGROS MARKETING CORPORATION",
        "ILOILO ASIAN LUMBER & HARDWARE INC.",
        "IMPERIAL APPLIANCE PLAZA",
        "INCALSYS METROLOGY AND LABORATORY SERVICE INC.",
        "INCALSYS, INC.",
        "INCREMENTAL GENERAL MERCHANDISE",
        "INDENTRADE SYSTEMS CORPORATION",
        "INDUSTRIX ALUMINUM & GLASS SUPPLY",
        "INFINITE SYSTEMS TECHNOLOGY CORP.",
        "INFINITEOPTIONS SALES & SERVICES INC.",
        "INFRAMACHINERIES CORPORATION",
        "INGERSOLL-RAND PHILIPPINES, INC.",
        "INSULFLEX INDUSTRIES, INCORPORATED",
        "INTEGRATED GEOTECHNICAL SYSTEMS",
        "INTEGRATED HYDRO-PNEUMATIC SYSTEMS, INC.",
        "INTERNATIONAL CHEMICAL INDUSTRIES, INC.",
        "INTERNATIONAL INDUSTRY PARTNERS, INC.",
        "INTERNATIONAL PIPE INDUSTRIES CORPORATION",
        "INTERTEK TESTING SERVICES PHILIPPINES, INC.",
        "LINTEC CONCRETE TECHNOLOGIES PTE. LTD.",
        "IRIDIA INSPECTION & TESTING CORP.",
        "IRLANDEZ HOLLOW BLOCKS AND HARDWARE",
        "IRWIN LUMBER",
        "ISUZU COMMONWEALTH",
        "ISUZU SALES PHILIPPINES INC.",
        "ISUZU SPECIALISTS SALES, INC.",
        "ITALIT CONSTRUCTION & DEVELOPMENT CORPORATION",
        "IZUMI DIESEL CENTER, INC.",
        "IZUMI INDUSTRIAL TRADING",
        "J.B. AND SONS EQUIPMENT SPECIALIST INC.",
        "J.E.T. HARDWARE",
        "J.E.TICO CONSTRUCTION COMPANY, INC.",
        "J-10 INCORPORATED",
        "J21 BUILDERS",
        "J2K TRUCKING, TRADING AND ALLIED SERVICES",
        "JACALA METAL WORKS CORPORATION",
        "JACEM MERCHANDISING, INC.",
        "JACKBILT INDUSTRIES, INC.",
        "JACOBS PROJECT (PHILIPPINES), INC.",
        "JAIRA PHILIPPINES, INC.",
        "JAMAN PRODUCTS INC.",
        "JAN REY MARKETING",
        "JANO BAHAY KUBO MAKER & NATIVE PRODUCT",
        "JASSY ELECTROMECHANICAL SERVICES",
        "JAYBUILDERS'' INDUSTRIES INC.",
        "JAY-ER GEN. MERCHANDISE",
        "JAYSON RIVERA HAULING SERVICES",
        "JAZMED ENTERPRISES",
        "JBW FLOOR CENTER",
        "JC TIRE SUPPLY",
        "JCARL ENTERPRISES",
        "JE CARS ENTERPRISES",
        "JEBSEN INTERNATIONAL TRADING CORP.",
        "JECAMS ENTERPRISES",
        "JELLCO ENTERPRISES INCORPORATED",
        "JERCON TRADE CONSTRUCTION DEVELOPMENT CORPORATION",
        "JERVIS ELECTRIC CORPORATION",
        "JESMA ENGINEERING CONSULTANCY",
        "JETMAR INDUSTRIAL SALES",
        "JFE SHOJI TRADE PHILIPPINES, INC.",
        "JG ANDRE'' CONSTRUCTION & SUPPLY",
        "JGL TRADING",
        "JHORENCE ENTERPRISES",
        "JHRTRUCKING CORP.",
        "JIA CHENG HARDWARE & CONSTRUCTION SUPPLY",
        "JIANGSU BAILEY STEEL BRIDGE CO., LTD",
        "JIZERU AUTO PARTS CENTER",
        "JJ AND J ENGINEERING AND MACHINE WORKS",
        "JJ SAFETY GLASS",
        "JJ-LAPP CABLE(P) INC.",
        "JMD INTERNATIONAL CORPORATION",
        "JN STW INCORPORATED",
        "JNA ELECTRONICS CENTER",
        "JNV STEEL FRAMING CENTER, INC.",
        "JOBECON TRADING & CONSTRUCTION",
        "JOCAS MACHINE SHOP AND ENGINEERING SERVICES",
        "JOEY S. GIANAN ENTERPRISES",
        "JOHNRAY CONCRETE PRODUCTS & CONSTRUCTION SUPPLY",
        "JOMALIA SHIPPING CORPORATION",
        "JONATAS GLASS AND ALUMINUM SUPPLY",
        "JOWOOD INDUSTRIES, INC.",
        "JOYTRADE INDUSTRIAL MARKETING",
        "J-PAC LOGISTICS INC.",
        "JPMS SALES INTERNATIONAL CORPORATION",
        "JRB HEAVY EQUIPMENT PARTS TRADING",
        "JSC BLESSINGS CONSTRUCTION SUPPLY",
        "JSL ELECTRIC CORPORATION",
        "JUMP SOLUTIONS, INC.",
        "JUNNI INDUSTRIES INC.",
        "JUSTINO CORPORATION (Toku)",
        "J. VAZCO, INC.",
        "JVF COMMERCIAL AND PROJECT DEVELOPMENT SYSTEM, INC",
        "JVF COMMERCIAL AND PROJECT DEV''T SYSTEM SERVICES",
        "JZ ELECTRICAL SUPPLY, INC.",
        "K.U.S STRUCTURAL COMPONENTS, INC.",
        "K.U.S. ARCHITECTURAL COMPONENTS INC.",
        "KAHING HARDWARE & CONSTRUCTION SUPPLY",
        "KAIROSTEEL CORP.",
        "KALI PHILMARKETING CORP.",
        "KAPALONG SURPLUS CENTER",
        "KAPS AUTO PARTS",
        "KARGAMINE TOO, INC.",
        "KASSEL VENTURES PHILS., INC.",
        "KEMIZ ENTERPRISE",
        "KENT INTERNATIONAL TRADING CO., INC.",
        "KEN-TOOL HARDWARE CORPORATION",
        "KEY LINK SALES INTEGRATED",
        "KHANSAHEB SYKES L.L.C.",
        "KIER & KEN LABOR CONSTRUCTION",
        "KILTON MOTOR CORPORATION",
        "KINGS RUBBER INTERNATIONAL INC.",
        "KITCHENFAST FURNITURE",
        "KIV MARKETING COMPANY",
        "KLINCH AIRCONDITIONING SERVICES",
        "KNK HOK LAI BUILDERS",
        "KOKO''S TRADING",
        "K-PLAST, INC.",
        "KUTANG BATO ALLIANCE CORPORATION",
        "L & B CONCRETE PRODUCTS",
        "L & L OPTIMUM COMMERCIAL CORP.",
        "L.T. STEEL CENTER INC.",
        "LA VISTA MOTORIST SHELLSTOP",
        "LAFARGE MINDANAO, INC.",
        "LAFARGE REPUBLIC AGGREGATES, INC.",
        "LAFARGE REPUBLIC, INC.",
        "LAGUNA AIR PRODUCT CORPORATION",
        "LANCE REFRIGERATION & AIRCONDITIONING SERVICE CENTER",
        "LANCET ENTERPRISES",
        "LC5 AND MACH ENTERPRISES, INC.",
        "LCPC TRADING",
        "LDL STA. CRUZ MARBLE SUPPLY",
        "LEARED AUTOMATIC EQUIPMENT PHILS. ENTERPRISES INC.",
        "LEEMASTERS INTERNATIONAL SYSTEMS, INC.",
        "LEE-YAN FABRICATION & TRADING CO.",
        "LEJAN TRUCKPARTS CENTER INC. - BALINTAWAK",
        "LEODEMAC TRADING CO.",
        "LEOMAR''S FARMHOUSE",
        "LGC ELECTRIC INC.",
        "LIFT MASTER PARTS TRADING CORP.",
        "LIFTING AND HEAVY EQUIPMENT SAFETY SPECIALIST",
        "LIFTRITE INC.",
        "LIMARV ENTERPRISES",
        "LIMSON MARKETING INC.",
        "LINCON MANUFACTURING PHILS. INC.",
        "LINTON INC.",
        "LIRIO SHIPPING LINES, INC.",
        "LIVAN TRADE CORPORATION",
        "LMK TECH SYS-INC.",
        "LNG LUMBER TRADING",
        "LODESTAR ENGINEERING SUPPLY CORP.",
        "LOPEZ ENGINEERING AND GENERAL SERVICES",
        "LORIGEN TRADING AND SERVICES INC.",
        "LRC TRADING & ENGINEERING SERVICES",
        "LS INSTRUMENTATION SALES & SERVICES",
        "LUBESTRADERS CORPORATION",
        "LUBRI-CHEM PHILIPPINES DISTRIBUTORS, INC.",
        "LUZON FOUNDRY, INC.",
        "LYS MARKETING CORPORATION",
        "M&L Enterprises",
        "M.A. CAMILO FREIGHT SERVICES",
        "M.A. CAMILO/ROCKY FIVE J AGGREGATES AND CRUSHING",
        "M.I. SANTOS ENTERPRISES",
        "M.V. MARAHAY ENTERPRISES",
        "MA INDUSTRIAL GAS AND AIR PRODUCTION AND SUPPLY",
        "MABA-AY CALTEX SERVICE STATION",
        "MACHINEBANKS'' CORPORATION",
        "MACRO HARDWARE & CONSTRUCTION SUPPLY CO., INC",
        "MAGDRILLS EQUIPMENT CORPORATION",
        "MAGNIFICENT MILE FASHION COLLECTION",
        "MAGNUM COMPUTERWARE",
        "MAHARLIKA EIGHT BUILDERS",
        "MAINCOAT, INCORPORATED",
        "MAIT S.P.A. MACCHINE INDUSTRIALI TRIVELLATRICI",
        "MAJESTIC SHIPPING CORPORATION",
        "MAN AUTOMOTIVE CONCESSIONAIRES CORP.",
        "MANILA IMPERIAL MOTOR SALES",
        "MANILA SOURCES CORPORATION",
        "MANUCHAR PHILIPPINES INC.",
        "MANUEL STATIONERY",
        "MAPLE LEAF MOVER''S INC.",
        "MARCE-3A TRADE & CONSTRUCTION",
        "MARSIAN INDUSTRIAL SALES AND SUPPLY CORP.",
        "MARSTEEL CONSTRUCTION SUPPLY",
        "MAVEN ENTERPRISES",
        "MAXIMA MACHINERIES INC. - CDO",
        "MAXIMA MACHINERIES INCORPORATED",
        "MAXIMUM SOLUTIONS CORPORATION",
        "MAXITECH MANUFACTURING, INC.",
        "MAX''S GENERAL MERCHANDISE",
        "MAY GOLD CONSTRUCTION SUPPLY",
        "MAYER STEEL PIPE CORPORATION",
        "MAYON CONST. SUPPLY",
        "MAYTIPAN METAL CORPORATION",
        "MB ROCK EQUIPT SERVICES INC.",
        "MC BUILT ENTERPRISES",
        "MCGRAW ENGINEERING",
        "M-COAT PAINT CENTER",
        "MCPRIME INDUSTRIAL SALES INC.",
        "MECHANICAL HANDLING EQUIPMENT COMPANY, INC.",
        "MEE TRANSFORMER REPAIR AND SUPPLY",
        "MEGA HOME AND OFFICE CENTER",
        "MEGA INNOX MACHINE SHOP",
        "MEGAPAINT & COATING CORPORATION",
        "MEGASTEEL PIPE CORPORATION",
        "MEKSUN PRINT ENTERPRISES",
        "MELANRO MARKETING",
        "MELIEVE ENTERPRISES",
        "MEN AT WORK ENTERPRISES",
        "METAL EXPONENTS, INC.",
        "METRO INDUSTRIES, INC.",
        "METRO LAMPS COMPANY, INC.",
        "METROBANK",
        "METROFLEX ENTERPRISES",
        "METROTECH STEEL INDUSTRIES INC.",
        "MEZU DIGITAL PRINTING",
        "MG SAMIDAN CONSTRUCTION",
        "MHE-DEMAG (P) INC.",
        "MIAMI TOOLS SUPPLIES",
        "MICAGAS INDUSTRIAL CORPORATION",
        "MICHAEL HERNANDEZ IRON WORKS",
        "MICHAEL PAPIN",
        "MICMAC ENTERPRISES",
        "MICO EQUIPMENT AND PARTS",
        "MICRO PACIFIC TECHNOLOGIES AND SYSTEMS CORPORATION",
        "MICRO QUADKEYS CORPORATION",
        "MICROCADD INSTITUTE INC.-QC",
        "MICROGENESIS BUSINESS SYSTEM",
        "MICRON CLEANROOM (PHILIPPINES), INC.",
        "MICROSERVER INFORMATION SYSTEM, INC.",
        "MICROVAN, INC.",
        "MID SOUTH CALIBRATION AND MOTORWORKS",
        "MIDSOUTH TECHNICAL SERVICES CORPORATION",
        "MINDANAO TRIGON STEEL PRODUCTS, INC.",
        "MINDORO AUTO PARTS",
        "MITPARTS AUTO SUPPLY CENTER, INC.",
        "MOLDEX PRODUCTS, INC.",
        "MONARK EQUIPMENT CORPORATION - CDO",
        "MONARK EQUIPMENT CORPORATION - DAVAO BRANCH",
        "MONARK EQUIPMENT CORPORATION - SAN PEDRO LAGUNA",
        "MONFORT TERRASSEMENT S.A.",
        "MONITEYE LTD",
        "MONTALBAN MILLEX AGGREGATES CORPORATION",
        "MONTE CARLO TILES AND FURNITURES CENTER",
        "MORSE HYDRAULICS SYSTEM CORPORATION",
        "MOTMM MARKETING",
        "MOUNT ROCK POWDER CORP.",
        "MULTI-CON ENTERPRISES",
        "MUSTARD SEED SYSTEMS CORPORATION",
        "MZC2L MARKETING INC.",
        "N.A.S CONSTRUCTION REINFORCEMENT SPECIALIST",
        "NATIDOME CORPORATION",
        "NATIONAL BOOK STORE INC.",
        "NAUTS AND VECTORS COMPANY INC.",
        "NAVISTAR INTERNATIONAL TRUCKS, PARTS AND SERVICES",
        "NC POWER SALES CORPORATION",
        "NEAW ENTERPRISES",
        "NEED INK SALES & SERVICES",
        "NELTEX DEVELOPMENT COMPANY INCORPORATED",
        "NEMA ELECTRIC COMPANY, INC.",
        "NEUTRONICA I.T. SERVICES CORP.",
        "NEW CUNA HARDWARE",
        "NEW ERA METAL FORMING INDUSTRY",
        "NEW GUIMARAS HOME AND AGRI CENTER CORP.",
        "NEW MALABON ENTERPRISES",
        "NEW MANILA HARDWARE",
        "NEW MARCING COCOLUMBER AND CONSTRUCTION SUPPLY",
        "NEW MOOR INDUSTRIAL CENTER, INC.",
        "NEW RAISE ENTERPRISES",
        "NEW ROCKS, INC.",
        "NEW ROYAL PLUMBING  AND HARDWARE",
        "NEW TRI-STAR READY MIX INC.",
        "NEW WHITELINES REFRIGERATION, AIRCONDITIONING",
        "NFT SPECIALIZED IN TOWER CRANES L.L.C.",
        "NH MOTOR SALES",
        "NIKKEN LEASE KOGYO CO., LTD",
        "NISSAN SOUTHWOODS",
        "NITRO ASIA COMPANY, INC.",
        "NKD INTERNATIONAL TRADING CORP.",
        "NORTH MINDANAO STEEL CORPORATION",
        "NORTH TREND MARKETING CORPORATION",
        "NORTHGATE TECHNOLOGIES, INC.",
        "NORTHSTAR MOTORS CORPORATION",
        "NORTHWIND COMMUNICATIONS & ELECTRONICS, INC.",
        "NSG TRACTOR PARTS",
        "NUTEX EQUIPMENT SUPPLY",
        "OCTAGON COMPUTER SUPERSTORE- TAGUM",
        "OFFICE BASICS CORPORATION",
        "OLIVER INDUSTRIAL PRODUCTS",
        "OLN SEA-LAND SERVICES AND LOGISTICS CORP.",
        "OPTIMUM INDUSTRIAL SALES",
        "ORIENTAL CONSTRUCTION & ELECTRICAL SUPPLY CO., INC",
        "ORO HI-SPEED REBUILDERS,INC.",
        "ORO JMP ENTERPRISES",
        "OROBENDY MACHINE WORKS CORP.",
        "OSTREA MINERAL LABORATORIES, INC.",
        "OTING  CONSTRUCTION & SUPPLY",
        "P.T. CERNA CORPORATION",
        "PACIFIC PARTS CORPORATION",
        "PAG-ASA STEEL WORKS, INC.",
        "PAINTPROS INDUSTRIAL CORP.",
        "PAMCO-PMI INTERNATIONAL INC.",
        "PANTHER ASIA CORPORATION",
        "PAPERTIME ENTERPRISES",
        "PARAGON PEGASUS SOLUTIONS INC.",
        "PARPIPES CONCRETE CORPORATION",
        "PARTSFINDER ENTERPRISES",
        "PATH TRADING",
        "PAYLESS PARTS & CAR CARE CORPORATION",
        "PC BASICS CORPORATION",
        "PEACE HARDWARE",
        "PENINSULA GULF MARINE SERVICES CORP.",
        "PEOPLE360 CONSULTING CORPORATION",
        "PEPE AUTO SUPPLY",
        "PETAL MARKETING",
        "PETI TRADING, INC.",
        "PETRON CORPORATION",
        "PFE CAR AIRCON PARTS & SUPPLIES",
        "PGG BUILDERS",
        "PHELPS DODGE PHIL. ENERGY PRODUCTS CORP.",
        "PHIL. FIBERTECH INDUSTRIES, INC.",
        "PHILASER MARKETING INC.",
        "PHILCOPY CORPORATION",
        "PHILEX INTEGRATED SEWER''S ASSN.",
        "PHILGALV INDUSTRIAL COATING, INC.",
        "PHILIPPINE ALLIED ENTERPRISES CORPORATION",
        "PHILIPPINE BEARING CORPORATION",
        "PHILIPPINE NUCLEAR RESEARCH INSTITUTE",
        "PHILIPPINE RIGID CONSTRUCTION CORPORATION",
        "PHILIPPINE SKYBIRD INDUSTRIAL CORPORATION",
        "PHILIPPINE SPAN ASIA CARRIER CORP.",
        "PHILIPPINE VALVE MANUFACTURING COMPANY",
        "PHILIPS WIRE & CABLE CO.",
        "PICOLANDIA MOTORS",
        "PILIPINAS SHELL PETROLEUM CORP.",
        "PIMENTEL & ASSOCIATES ENGINEERING CONSULTANT",
        "PLASTI-FAB INTERNATIONAL",
        "POLYFOAM - RCG",
        "PORTA COELI INDUSTRIAL CO., INC",
        "PORT-LINK CONTAINER YARD CORP.",
        "POWER ACCESS ELECTRICAL SERVICES",
        "POWER HEAVY PARTS",
        "POWER STEEL SPECIALIST TRADING CORPORATION",
        "POWER SYSTEMS, INC.",
        "POWERLIGHT ELECTRICAL SUPPLY",
        "POWERZUN QUARRYING & TRADING INC.",
        "POZZOLANIC PHILIPPINES, INC",
        "PPC ASIA CORPORATION",
        "PPC DRILLING INDUSTRIAL SUPPLY",
        "PPCI CHEMICAL INDUSTRIES INCORPORATED",
        "PREMIER AUTOTECK INC.",
        "PREMIUM CHOICE TRADING",
        "PRESAM CONSTRUCTION & GENERAL SERVICES, INC.",
        "PRESTIGE WOOD",
        "PRIME ACCESS I.T. SOLUTIONS INC.",
        "PRIME SUMMIT TRUCKS AND PARTS",
        "PRINCESS ROCK TRADING",
        "PRISMA ELECTRICAL CONTROLS CORP.",
        "PRODUCTIVITY TECHNOLOGIES SERVICES, INC.",
        "PRUDENTIAL INTERTRADE PHILIPPINES INC.",
        "PTC AGENCY & TRANSPORT, INC.",
        "PUMA SPRING AND RUBBER INDUSTRIES",
        "PURCIA TRANSPORT SYSTEM, INC",
        "PURITY BEARING AND INDUSTRIAL SUPPLY COMPANY",
        "PYROTECH SOLUTION AND INTEGRATED SERVICES CORP.",
        "Q.C. STYROPACKAGING CORP.",
        "QUALITECH INDUSTRIAL AND TECHNICAL SERVICES, INC.",
        "QUALITY APPLIANCE PLAZA, INC.",
        "QUANTUM COMMERCIAL TRADING",
        "QUARTZ CONSTRUCTION & SUPPLY",
        "QUICK INTEGRATED KARGO INC.",
        "QUICKFLO FORWARDERS INC.",
        "R TOOLS TRADING & INDUSTRIAL SALES",
        "R. TINDA-AN CORPORATION",
        "R.A.C. INDUSTRIES",
        "R.N DE GUZMAN CONCRETE PRODUCT",
        "R.O. ILAGAN PROJECT LOGISTICS INC.",
        "RAB INNOVATIVE ENGINEERING SOLUTIONS",
        "RAJAB ENTERPRISES",
        "RAMBIC CONSTRUCTION EQUIPMENT ENTERPRISES",
        "RAMBUS INDUSTRIAL SUPPLY",
        "RAPID FORMING CORP.",
        "RATIONAL LUMBER & HARDWARE, INC.",
        "RB FREIGHT SOLUTIONS, INC.",
        "RC NEW CHEMICAL RESOURCES, INC.",
        "READYCON TRADING & CONSTRUCTION CORPORATION",
        "REBTRADE INTERNATIONAL CORPORATION",
        "RED FLAG ENVIRONMENTAL SCIENCE",
        "REGAN INDUSTRIAL SALES, INC.",
        "REMINGTON INDUSTRIAL SALES CORPORATION",
        "REYNA DRILLING SUPPLIES",
        "REZIL P. SABINO",
        "RGR INDUSTRIAL SALES",
        "RHANIEL GENERAL MERCHANDISING",
        "RHEMA INDUSTRIAL SALES",
        "RHP ELECTROMECHANICAL SALES & SERVICES CORP.",
        "RICHWELL AUTO PARTS SALES CORPORATION",
        "RICMEN ENTERPRISES",
        "RIKEN MOTOR SALES",
        "RIPESTONE ENTERPRISES",
        "RL AUTOCARE SERVICES AND PARTS",
        "RMD KWIKFORM PHILIPPINES, INC.",
        "RN QUINO TRUCKING SERVICES INCORPORATED",
        "RNW PACIFIC PIPES CORPORATION",
        "ROADWORK AUTOMOTIVE EQUIPMENT SUPPLIES",
        "ROGER CONSTRUCTION SUPPLY INC.",
        "ROJAN PRINCESS SHIPMENT CORP.",
        "ROLLY FERRER",
        "ROMEO & JAYDA CONSTRUCTION SUPPLY CORP.",
        "ROMEO C. OLALIA",
        "ROMEO V. AUSTRIA TRADING",
        "ROMEO V. MALARAN",
        "ROSARIO JAMIS",
        "ROSCH ENTERPRISES",
        "ROSCO MACHINE SHOP & MFG. CORP",
        "ROTES GENERAL MERCHANDISE",
        "ROYAL CARGO, INC.",
        "ROYAL CROWN EQUIPMENT & CONSTRUCTION SALES CORP.",
        "ROZEMAR HARDWARE",
        "RS COMPONENTS CORPORATION",
        "RS JARDIN & ASSOCIATES",
        "RS LLOSALA TRADING",
        "R-SQUARE INDUSTRIAL SUPPLY CORP.",
        "RTC LABORATORY SERVICES & SUPPLY HOUSE",
        "RTC TRUCKING",
        "RTEC TRUCKS & HEAVY EQUIPMENT PARTS SUPPLY",
        "RTN CONSTRUCTION SUPPLY",
        "RYCO, INC.",
        "S&S IT SOLUTIONS INCORPORATED",
        "S.A.S. ELECTRICAL CONSTRUCTION & SUPPLY",
        "S.D.M.C. ENTERPRISES",
        "SABORDO''S GENERAL MERCHANDISE",
        "SAFE ONE ENTERPRISES",
        "SAFECON ENTERPRISES",
        "SALAY AUTO PARTS",
        "SALVADOR O. NICDAO, JR.",
        "SAMBON INDUSTRIAL SALES,INC.",
        "SANCHEZ MACHINE SHOP",
        "SANDHEL TRADING",
        "SANDVIK TAMROCK (PHILIPPINES) INC.",
        "SANTA FE LIME ENT.",
        "SANTIENZ PHILIPPINES INCORPORATED",
        "SANTOL MARKETING",
        "SANYOSEIKI STAINLESS STEEL CORP.",
        "SATO HEAVY EQUIPMENT PARTS SUPPLY",
        "SAY ENTERPRISES INCORPORATED",
        "SBMN ENTERPRISES",
        "SCAN PACIFIC MACHINERY LTD. CO.",
        "SCANIA LOGISTICS CORPORATION",
        "SCHATZEN AUTOMOTIVE RESOURCES CORP.",
        "SCHILD INTERNATIONAL INC.",
        "SEAL MART PHILLIPINES CORPORATION",
        "SEALBOND CHEMICAL INDUSTRIES, INC.",
        "SENSING TECHNOLOGY CORPORATION",
        "SERCON AIRCONDITIONING & REFRIGERATION SERVICES",
        "SERGAT ENTERPRISES",
        "SETREGNER SYSTEMS PHILS. INC.",
        "SEVERO SY LING, INC.",
        "SFM SALES CORP.",
        "SHANGHAI SHIBANG MACHINERY CO., LTD.",
        "SHEN CONSTRUCTION SUPPLY",
        "SHOBE TRUCKS GARAGE SERVICES",
        "SHOCKBLOCK PHILS. INC.",
        "SHORR INDUSTRIAL SALES, INC.",
        "SICCION MARKETING, INC.",
        "SIMPLEX INDUSTRIAL CORPORATION",
        "SINAMAY COMMERCIAL GENERAL MERCHANDISE",
        "SK MACHINE & PARTS PHILS. INC.",
        "SKID MARKS GENERAL MERCHANDISE",
        "SKY GREEN IMPORTS INCORPORATED",
        "SKY LAND GLOBAL LOGISTICS, INC.",
        "SMALLVILLE INFORMATION TECHNOLOGY ENTERPRISE CORP.",
        "SMR ENTERPRISES",
        "SOILTECH ARVAZA CORPORATION",
        "SOLANDA ENTERPRISES  INC.",
        "SOLAR TECH INDUSTRIAL RESOURCES",
        "SOLART SHIPPING AGENCIES CORP.",
        "SOLGEN INCORPORATED",
        "SOLID CEMENT CORPORATION",
        "SOLID HUB EXPRESS, INC.",
        "SOLID STATE INFOTECH, INC.",
        "SOLIDMARK, INC.",
        "SONAR TIRE REPAIR AND SERVICES",
        "SOONEST GLOBAL EXPRESS CORP.",
        "SOUTH AVENUE CONSTRUCTION SUPPLY",
        "SOUTHERN EAGLE SUMMIT INC.",
        "SOUTHERN ISLAND SEA CARRIER & LOGISTICS",
        "SPARKTON CONSTRUCTION SUPPLIES INC.",
        "SPEED MASTERSON AUTO SUPPLY",
        "SPP CONSTRUCTION SUPPLY",
        "SPURWAY ENTERPRISES",
        "STANFORD MARKETING",
        "STAREX MOTOR PARTS",
        "STEELASIA MANUFACTURING CORP.",
        "STELSEN CORPORATION",
        "STONE FIRE FIGHTING EQUIPMENT SALES & SERVICES",
        "STRONGBASE CONSTRUCTION CORPORATION",
        "SUBIC GS AUTO INC. - HINO PARA¥AQUE",
        "SUDENOR SHIPPING & LOGISTICS SERVICES",
        "SUMITOMO DRIVE TECHNOLOGIES",
        "SUMMIT SIGMA READY MIX CONCRETE CORPORATION",
        "SUN & EARTH CORPORATION",
        "SUN POWER TRADING",
        "SUN PRINCE TBA CORPORATION",
        "SUNLIGHT BUILDER''S CENTER, INC.",
        "SUNSHINE MULTI PLUS CORPORATION",
        "SUPER AGRO MACHINERY AND HARDWARE CORP.",
        "SUPERCAST FOUNDRY AND MACHINERY CORPORATION",
        "SUPERSONIC MANUFACTURING, INCORPORATED",
        "SUPERTANK INTERNATIONAL COMPANY",
        "SUPERVALUE, INC.",
        "SUPREME STEEL PIPE CORPORATION",
        "SURVEYTECH TRADING",
        "T. D. SY INDUSTRIAL WASTE HAULING SERVICES",
        "T.C. BENAVIDEZ CONSTRUCTION SUPPLY",
        "T.C. FLORENTIN ENGINEERING COMPANY",
        "TADANO IMES LTD.",
        "TADIOS, RICKSON L.",
        "TAILOR MADE BY OLIVE",
        "TASCO, INC.",
        "TD RESOURCES PHILIPPINES, INC.",
        "TECHNOCRETE TRADING",
        "TECHNOSAM CORPORATION",
        "TEH TAI GLOBAL CORPORATION",
        "TERLET TRADING",
        "TERMS CONCRETE TESTING CENTER, INC.",
        "TERTEX INTERNATIONAL PHILS., INC.",
        "TESTLAB ENGINEERING & GEOTECH SERVICES",
        "THE COMPUTER AUTHORITY, INC.",
        "THERMOVAR PIPES SALES AND SERVICES",
        "TIANJIN OUNAIDA TRANSMISSIONS MACHINERY CO., LTD",
        "TIARA COMMERCIAL & INDUSTRIAL CORP.",
        "TIMBERLAND GENERAL MERCHANDISING",
        "TOMASITO B. GOMEZ",
        "TOMIFUJI CO. LTD.",
        "TONAEKI INDUSTRIAL CORPORATION",
        "T-ONE VISION INC.",
        "TOOLEC, INC.",
        "TOP BUSINESS CENTER",
        "TOP LIFEGEAR MARKETING",
        "TOPGEAR INDUSTRIAL EQUIPMENT SALES",
        "TORK TECHNOLOGY AND GENERAL SERVICES CO.",
        "TOWER -  GENERAL MERCHANDISE",
        "TOWERTECH ENTERPRISES",
        "TOYOSCO PARTS CENTER INC.",
        "TOYOTA BAGUIO CITY, INC",
        "TOYOTA CABANATUAN CITY, INC.",
        "TOYOTA CAGAYAN DE ORO INC.",
        "TOYOTA CUBAO INCORPORATED",
        "TOYOTA OTIS INC.",
        "TOYOTA PASIG",
        "TOYOTA PASONG TAMO, INC.",
        "TOYOTA SAN FERNANDO PAMPANGA INC.",
        "TOYOTA SHAW,INC.",
        "TRACKSTAR HYDRAULIC SUPPLY INC.",
        "TRADESHIP ENTERPRISES",
        "TRADETOWN CALIBRATION CENTER",
        "TRANSCRAFT CARRIER CORPORATION",
        "TREVI FOUNDATIONS PHILIPPINES",
        "TRICOM DYNAMICS, INC.",
        "TRICOMAC CONSTRUCTION INC.",
        "TRI-EX TOWER CO. INC.",
        "TRIF-A CONSTRUCTION EQUIPMENT RENTAL",
        "TRINAV SURVEYS INC.",
        "TRIPLE D TRADING & FABRICATION",
        "TRI-STAR READY MIX, INC.",
        "TRU LINK ENERGY CORP.",
        "TRUST HARDWARE PHILS. INC",
        "TSI INCORPORATED",
        "TUNNELING & MINING TECHNOLOGIES",
        "TYRECORP INCORPORATED",
        "TYREMART INC.",
        "UKC BUILDERS, INC.",
        "ULTRA PETRONNE INTERIOR SUPPLY CORPORATION",
        "UNI-FIELD ENTERPRISES,INC.",
        "UNI-FIVE STEEL CORPORATION",
        "UNILOX INDUSTRIAL CORPORATION",
        "UNIMAC TRADING",
        "UNIOIL PETROLEUM PHILIPPINES, INC.",
        "UNION GALVASTEEL CORPORATION",
        "UNION HARDWARE FAR EAST CORPORATION",
        "UNISAFE INDUSTRIAL CO., INC.",
        "UNITECH ELECTRONICS AND SECURITY SYSTEMS",
        "UNITED BL CEMENT CORPORATION",
        "UNITED DIGITAL SYSTEMS",
        "UNIVERSAL GLOBAL STEEL INDUSTRIES INC.",
        "UNIVERSAL INSPECTION & CORROSION PROTECTION CO.",
        "UNIVERSAL TESTING LABORATORY & INSPECTION INC.",
        "UPLIFT HEALTH & BIOSCIENCE COMPANY LTD.",
        "UP-TOWN INDUSTRIAL SALES, INC.",
        "V3 HAULING SERVICES",
        "VCNT ENTERPRISE",
        "VCOMMERCE PHILIPPINES (VCOM) INC.",
        "VEGAS BUILDERS & GENERAL CONSTRUCTION SUPPLIES",
        "VERMEER (SEA) PTE LTD",
        "VETA MADRE, INC.",
        "VIBRATECH ENTERPRISES",
        "VICTORY UPHOLSTERY & CANVASS STORE",
        "VIMAN MARKETING",
        "VINELJ ENTERPRISES & WATER TREATMENT SERVICES",
        "VIOLETA AVENUE GARDEN SUPPLY",
        "VITAS PORT ARRASTRE CORP.",
        "VITO R. QUIROG",
        "VSERVE TRADING",
        "W.A.T AUTO SUPPLY",
        "WACKER MACHINES SUPPLIES CORP.",
        "WASTE SOLUTIONS AND MANAGEMENT SERVICES INC.",
        "WEBFORGE PHILIPPINES, INC.",
        "WEIDA PHILIPPINES INC.",
        "WELD INDUSTRIAL SALES",
        "WELD INDUSTRIAL SALES-CDO",
        "WELDERS TESTING LABORATORIES PHILS INC",
        "WELDING INDUSTRIES OF THE PHILIPPINES",
        "WESCOR TRANSFORMER CORPORATION",
        "WESTBAY MULTI-RESOURCES INC.",
        "WESTECH BUILDERS & ELECTRICAL CORP.",
        "WESWIN COMPANY INC.",
        "WHEEL SPEC MARKETING",
        "WILCON BUILDER''S DEPOT, INC.-LIBIS QC",
        "WILCON BUILDER''S SUPPLY INC.-BT-QC",
        "WILCOR AUTO SUPPLY",
        "WILDCAT MACHINERY INC.",
        "WIL-EM TRADING",
        "WILLIAMS FORM ENGINEERING CORP.",
        "WILLING PRINTING PRESS",
        "WINBETH TRADING",
        "WINMIL INDUSTRIAL SALES",
        "WINROSE CHAN ENTERPRISES",
        "WIRELESS LINK TECHNOLOGIES, INC.",
        "WM ANGELES INDUSTRIAL GASES",
        "WOO GENERAL MERCHANDISE & FARM SERVICES",
        "WOODFIELDS CONSULTANTS INC.",
        "WORLD CLASS LAMINATE, INC.",
        "WORLDCENTRAL APPLIANCE CORPORATION",
        "WORLDWIDE STEEL GROUP, INC.",
        "WTS INTL. CARGO SERVICE CORP.",
        "WYLER ENTERPRISES INC.",
        "XURIANT GARMENTS MANUFACTURING",
        "X''WELL TESTING SERVICES INC.",
        "Y & N NEEDLE WORKS",
        "Y2K SCREW HARDWARE",
        "YACINNIE CONSTRUCTION",
        "YALE HARDWARE CORPORATION",
        "YATOMI INDUSTRIAL SALES",
        "YATOMI MARKETING",
        "YENOM MARKETING CORPORATION",
        "YMAGE TRADING & CONSTRUCTION CORP.",
        "YU ENG KAO ELECTRICAL SUPPLY & HARDWARE, INC.",
        "YUKSON MERCHANDISING CO.",
        "ZAB ENTERPRISES",
        "ZAMED ENTERPRISES",
        "ZAMIL STEEL BUILDINGS VIETNAM CO., LTD",
        "ZENITH ELECTRICAL & INDUSTRIAL SUPPLY CORP.",
        "ZENITH HEAVY SYSTEMS AND EQUIPMENT INC.",
        "ZENITH WIRE & CONDUIT, INC.",
        "ZHENGZHOU HAOMEI INDUSTRIAL CO., LTD",
        "ZIRCONST INTERNATIONAL MARKETING CORPORATION",
        "ZOE COMMERCIAL",
        "ORIX METRO LEASING AND FINANCE CORP.",
        "ASIA INTERNATIONAL AUCTIONEERS, INC.",
        "SOGO CORPORATION",
        "UNITED AUCTIONEERS, INC.",
        "1010 HARDWARE & GENERAL MERCHANDISE",
        "518 HARDWARE INDUSTRIAL & MILLING SUPPLY",
        "A & A HARDWARE",
        "A.C.P. WELDING SHOP",
        "A.M. GEOCONSULT & ASSOCIATES, INC.",
        "ABMS TRADING",
        "AC MORENO HAULING SERVICES",
        "ACCENT MICRO TECHNOLOGIES INC",
        "ADDTECH RESOURCES & DEVELOPMENT COMPANY,INC.",
        "ADVANCE MACHINE ENTERPRISES INC.",
        "ADVANCED GEOTECHNICAL ENGINEERING SERVICES",
        "ADVANCED TRITEK AUTOMATION INC.",
        "AENCARNACION REYES CONSTRUCTION CORP.",
        "AEON INDUSTRIAL SERVICES & ENGINEERED PRODUCTS INC",
        "AGILE TECHFRONTIER CORPORATION",
        "AHD ELECTRICAL CONTRACTING  ENGINEERING & TRADING",
        "ALAN C. ABAN",
        "ALLIANCE WELL DRILLING AND PUMPS SERVICING INC.",
        "ALSINA FORMWORK SOUTHEAST ASIA CORPORATION",
        "ALTSOURCE USA INC.",
        "AMERICAN TECHNOLOGIES, INC.",
        "AMMEX MACHINE TOOLS PHILS.,INC.",
        "ANALYTICAL & TESTING TECHNOLOGY CORPORATION",
        "ANSALDO LOGISTICS, INCORPORATED",
        "ARCHON NELL INCORPORATED",
        "ARDEO SOLUTIONS PTE LTD.",
        "ARIZONA INTEGRATED TECHNOLOGY, INC.",
        "ASCENDANT TRUCKING SERVICES, INC.",
        "AURORA (OA) PHILS, INC.",
        "AYANNA''S TRADING",
        "BARAS TILE DEPOT",
        "BDO LEASING & FINANCE, INC.",
        "BEN LINE AGENCIES PHILIPPINES INC.",
        "BETONIT PRODUCTS PHILIPPINES INCORPORATED",
        "BFN GENERAL MERCHANDISE",
        "BIG H GASOLINE STATION",
        "BLACKSTONE POWER & CONTROLS PHILS., INC.",
        "BRIGHTON MACHINERY CORPORATION",
        "BRINNO INCORPORATED",
        "BROADWAY ONE SHIPPING CORPORATION",
        "BROTECH CONSTRUCTION",
        "BROWNSTONE ASIA- TECH, INC.",
        "BUE TRUCKING SERVICES",
        "BUKIDNON SECOND ELECTRIC COOPERATIVE INC.",
        "BUSECO SOLIDARITY MARKETING COOPERATIVE",
        "BYTAN GENERAL SERVICES",
        "C.K. GALVANIZING CORPORATION",
        "CABANGCA & SONS ENTERPRISES, INC.",
        "CAGAYAN DE ORO HARDWARE & ELETRICAL SUPPLY",
        "CAGAYAN EDUCATIONAL SUPPLY",
        "CART-AWAY CONCRETE SYSTEMS, INC.",
        "CDO JOSON RESOURCES, INC.",
        "CEBU PARAGON EQUIPMENT RENTAL CORPORATION",
        "CENTRAL DIESEL CLINIC",
        "CERAMIC PLAZA INCORPORATED",
        "CJJ BUILDERS AND ENTERPRISE",
        "CLASSIK ENTERPRISES & INTERIOR",
        "CNTRANS (PHILS.) LTD. CO. INC.",
        "COLEX GAS STATION",
        "CWC PRIME INDUSTRIES CORP.",
        "D.B. INTERNATIONAL SALES & SERVICES, INC.",
        "D3RM TRADING",
        "DALCOM s.r.l.",
        "DANSTEPH MARKETING",
        "DATALINK SOLUTIONS TECHNOLOGY AND CONSULTANCY INC.",
        "SOUTH NATIONAL HIGHWAY PARK,KAPATIRAN BGY. SAN PEDRO",
        "DAVAO INTERNATIONAL MEGA GAS, CORP.",
        "DAVAO SECURITY & INVESTIGATION AGENCY, INC.",
        "DES APPLIANCE PLAZA INC.",
        "DEUTSCHE MOTORGERATE INC.",
        "MIGZO TRADING",
        "DIMENSION- ALL INC.",
        "DMD MOTOR REWINDING SHOP",
        "DMT MARKETING",
        "DN DISTRIBUTIONS CENTER, INC.",
        "DN STEEL MARKETING INC",
        "DOORTECH SYSTEM",
        "DOROTHY BUILDERS",
        "D''SUMMERTIME MARKETING, INC.",
        "DULAY TRUCKING SERVICES",
        "E & E APPLIANCE SERVICE & SUPPLY",
        "E.A. ALIPIO ENGINEERING & MOTOR",
        "EARTHCLEAN ENVIRONMENTAL MANAGEMENT CORP.",
        "EAZY POWER INC.",
        "E-COPY CORPORATION",
        "ECXS MACHINERY & INDUSTRIAL SERVICES, CORP.",
        "EDCHA METAL CRAFT",
        "ELECTRODYNAMICS CONSTRUCTION & DEVELOPMENT INC.",
        "ELM''S GARDEN",
        "ELPEDES MINIATURE MODEL MAKER & DESIGN",
        "EQUIMACH INDUSTRIAL SALES AND SERVICE",
        "EQUIPLINKNET TRADE & SERVICES",
        "EQUI-POX ENGINEERING & INDUSTRIAL SUPPLY",
        "EXAN BUILDERS CORP.",
        "EXPONENT CONTROLS AND ELECTRICAL CORPORATION",
        "EXTINGUISHED INC.",
        "F.M.C.S. CONSTRUCTION & SUPPLY",
        "FARLAND STEEL FABRICATION SPECIALIST INC.",
        "FAST AUTOWORLD PHILIPPINES CORP.",
        "FERDINAND V. TOLOSA",
        "FIBERMAX CORPORATION",
        "FILOIL ENERGY COMPANY, INC.",
        "FIRST BALFOUR, INC.",
        "FIRST SOLID BUILDERS INC.",
        "FISCHER PH ASIA, INC.",
        "FISHER MARTIN TECHNOLOGIES, INC.",
        "FJ LINE STRUCTURAL SERVICES CO.",
        "FLYING JETSTAR TRUCKING SERVICES CORPORATION",
        "FONDAQUIP PTE LTD",
        "FORMLINX CENTRAL PRINTING",
        "FORMOSA COMPUTER WORLD",
        "FOSHAN WELLCAMP BUILDING MATERIALS CO.,LTD",
        "FRANCIS REFRIGERATION AND REPAIR SHOP",
        "FREIGHT EXPRESS TRANSPORT CO. LTD.",
        "FREY - FIL CORPORATION",
        "FUMAN INDUSTRIES INC.",
        "GARYBEB''S TRADING",
        "GBS GRAPHIC SERVICES",
        "GDM SALES AND EQUIPMENT RENTAL ,INC.",
        "GENCARS BATANGAS, INC.",
        "GENCARS, INC",
        "GENTEK LIFT SOLUTIONS INC",
        "GEO-TRANSPORT & CONSTRUCTION, INC.",
        "GEZEGEND ENTERPRISES",
        "GLC TRUCK & EQUIPMENT",
        "GL-GEM PETRON STATION",
        "GLOBALPANELS INC.",
        "GOLDLINK NETWORK SOLUTIONS INC.",
        "GREENLEE FACILITY SOLUTIONS INCORPORATED",
        "GREGAND ENTERPRISES CO.",
        "GS EQUIPMENT INC.",
        "GT NATURAL STONE, INC.",
        "GY INDUSTRIAL MILL SUPPLY CORPORATION",
        "HANS PAPER CORPORATION",
        "HARRY CE¥IDO",
        "HBL MARKETING,INC.",
        "HE-MAX INDUSTRIAL CORPORATION",
        "HESREAL DEVELOPMENT CORPORATION",
        "HI-GAUGE AUTO PARTS",
        "HIGH GLORY SUBIC INT''L. LOGISTICS",
        "HMR ENVIROCYCLE PHILS., INC.",
        "HN BUILDERS TRADING",
        "HOCSON MARKETING",
        "HU AN ELECTRIC (SINGAPORE) PTE. LTD.",
        "HVL ENGINEERING SERVICES",
        "HYPRO CONSTRUCTION AND DEVELOPMENT CORPORATION",
        "IBAAN MULTI-STEEL RESOURCES CO.",
        "GRANDMA''S CONSTRUCTION SUPPLY",
        "INFRATEX PHILIPPINES INC.",
        "INK BRIGHT TRADING",
        "INKNETPH, CO.",
        "INSPIRON TECHNOLOGIES, INC.",
        "INTELLISMART TECHNOLOGY INC.",
        "ISUZU SALES PHILS. INC.",
        "J. BELTRAM WESTERN CRUISER",
        "J.P. LUNA GAS SERVICE STATION",
        "J.Q. ENTERPRISES",
        "JAI-LYN TRUCK PARTS CENTER",
        "JEA STEEL INDUSTRIES INC.",
        "JERICH DATU TRADING",
        "JEROME DIEGO RALA",
        "JICA ICE PLANT",
        "JKFRJK INSULATION SALES & SERVICES",
        "JMCC INDUSTRIES INC.",
        "JOPARE PEST CONTROL",
        "JOSE ARNEL R. ANONUEVO",
        "JOSOL MARKETING",
        "JOTUS BUILDERS CORPORATION",
        "JOYRAP TRADING",
        "JRA SURPLUS & PARTS SUPPLY",
        "J-REDD LIGHTING COMPANY",
        "JULES GLASS & ALUMINUM WORKS",
        "KA TEI SOLAR INC.",
        "KARL''S COMMERCIAL & PAINT CENTER",
        "KENTOSO POWER SYSTEMS CORP.",
        "KERRY LOGISTICS PHILIPPINES, INC.",
        "KEVLAR DEVELOPMENT CORPORATION",
        "KEYSYS, INC.",
        "KGEM MARKETING",
        "KIM-GEL GLASS AND ALUMINUM WORKS & SUPPLY",
        "KING''S SAFETYNET INC.",
        "YEK YEU MERCHANDISING INC.",
        "KNOXVILLE AUTO SUPPLY",
        "KOBELCO CRANES TRADING CO.,LTD.",
        "KST HOME SYSTEM",
        "KUS OFFICE SYSTEM MFG CORP",
        "LCG MARKETING PHILIPPINES CORPORATION",
        "LCTSI-LEAD CORE TECHNOLOGY SYSTEM INCORPORATED",
        "LIQUIDFLOW MARKETING INC.",
        "LM OUTLUMBER & FIREWOOD DEALER",
        "LONG CHASSY TRANSPORT INC.",
        "M.P. ALCANTARA ENTERPRISES",
        "M21 GAS INC.",
        "MACCAFERRI (PHILIPPINES), INC.",
        "MACTAN INFOSYS INC.",
        "MAGNAYE ELECTRICAL SERVICES",
        "MAKO TEKNOMECANIQUES, INC.",
        "MALASAGA TRADING CORP.",
        "MAMALINTA INVESTIGATIVE SECURITY AND  DETECTIVE AGENCY",
        "MANITOWOC CRANE GROUP INC.",
        "MANSOR SECURITY AND GENERAL SERVICES, INC.",
        "MAPECON PHILIPPINES, INC.",
        "MB TECHNOSOLUTIONS CORPORATION",
        "MB VERSOZA POWER SYSTEM INC.",
        "MCLINK COPY SERVICES",
        "MEFAFIL INDUSTRIAL SALES INC.",
        "MEGA PHILIPPINES INC.",
        "METALLFIT, INC.",
        "MIDTOWN SALES, INC.",
        "MJL INDUSTRIAL ENGINEERING SERVICES",
        "MUSH ENTERPRISES",
        "MV & CH MARKETING",
        "N. PACER GENERAL MERCHANDISING",
        "NATIONWIDE CONTRACTING L.L.C.",
        "NATIONWIDE ERECTORS CORP.",
        "NEW DELBEGA TRADING",
        "NEW EXCELSIOR GENERAL MERCHANDISING INC.",
        "NEW LAGUNA GLASS & ALUMINUM SUPPLY",
        "NFF INDUSTRIAL CORPORATION",
        "NIAGARA INDUSTRIAL EQUIPMENT CORP.",
        "NIZA BUILDERS AND SUPPLY",
        "N''VEST SECURITY AGENCY CORPORATION",
        "OCEAN TIDES EXPRESS LOGISTICS INC.",
        "OG CORPORATION",
        "OHMRHO INFORMATION TECHNOLOGY SOLUTIONS",
        "OJO MAJICA INDUSTRIAL INSPECTION CORPORATION",
        "OPTIMAL LABORATORIES INC.",
        "ORIENTAL SCHOOL AND OFFICE SUPPLY",
        "ORIONLAND CONST. & HEAVY EQUIPMENT CO., INC.",
        "ORO DY CONSTRUCTION",
        "ORO HI-Q PACKAGING CORPORATION",
        "OUTBOX FORWARDING SERVICES",
        "OXFORD COMPUTER TECHNOLOGIES CORPORATION",
        "PANELMAXX INC.",
        "PARTSWORLD GENERAL MERCHANDISE",
        "PENINSULA ELECTRIC COOPERATIVE, INC.",
        "PENTAIR PUMP GROUP INC.",
        "PERT ENTERPRISES",
        "PHIL-DATA BUSINESS SYSTEM INC.",
        "PHILIPPINE GEOANALYTICS, CALIBRATION & MEASUREMENT LABORATORY CORPORATION",
        "PHILMAN COMMERCIAL, INC.",
        "PHILTYRES CORPORATION",
        "PILEMAX TRADING",
        "PINNACLE PARTS CO., INC",
        "POWER KRIMP HYDRAULIC PNEUMATIC INC.",
        "POWER TRACTIRE INC.",
        "POWERGY FIVE CONSTRUCTION CORP.",
        "PRG INDUSTRIAL SOLUTIONS INC.",
        "PRIME QUEST TRANSPORT SOLUTIONS,INC.",
        "PRIMEBLOCK BUILDER CORP.",
        "PRINCESS ELA TRADING",
        "PRO DISENYO ARCHITECTURAL AND ENGINEERING SERVICES",
        "PRO PROGRESS MARKETING",
        "PROFIBUS INDUSTRIAL CONTROL SYSTEM,INC.",
        "PRULIFE GAS TRADING",
        "QUALITEST SOLUTIONS & TECHNOLOGIES INC",
        "R & T LAUDENCIA TRADING",
        "R.O. ILAGAN CUSTOMS BROKERAGE",
        "RAC TRADING AND HAULING SERVICES",
        "RCP ELECTRICAL SUPPLY & SERVICES",
        "RED STALLION TRADING",
        "REPUBLIC CEMENT &  BUILDING MATERIALS, INC.",
        "RESONANT MECHANELECSYS INC.",
        "RETS TRADING",
        "RIDE, INC.",
        "ROMEO O. ORPIADA",
        "S&R MEMBERSHIP SHOPPING",
        "SADABA AUTO PARTS",
        "SAFECO ENVIRONMENTAL SERVICES INC.",
        "SAN-VIC TRADERS, INC.",
        "SHIHLIN ELECTRIC & ENGINEERING CORP.",
        "SIDEKICK FORCE INVESTIGATION, DETECTIVE & SECURITY SERVICES, INC.",
        "SIM COMPUTER SALES INCORPORATED",
        "SMARTHOUSE CORP.",
        "SOUDO-WELD INDUSTRIAL PHILS., INC.",
        "SOUTH SEA DEV''T. CORP.",
        "SQUARE -D FABRICATOR & CONTROL SYSTEMS ENTERPRISE",
        "STACKBIT COMPUTER SOLUTIONS",
        "STARGEM CONSTRUCTION",
        "STEELFAB ENTERPRISES",
        "STEELTEK INDUSTRIAL SUPPLY INC.",
        "STEELWORLD MANUFACTURING CORP.",
        "SUBIC MOTOR WORLD COMPANY",
        "SUNBRIGHT TRADING AND CONSTRUCTION SUPPLY",
        "SWITCH INDUSTRIAL SALES CORPORATION",
        "TAGUSAO CONSTRUCTION & TRADING",
        "TECHPRO PHILIPPINES, INC.",
        "TENFOLD CONSTRUCTION & DEVELOPMENT CORP.",
        "TESLINQUE COMPUTER SALES CENTER",
        "TETRA SALES AND SERVICE, INC.",
        "THERMA ONE TRANSPORT CORP.",
        "THUNDERHEADS CONSTRUCTION CORPORATION",
        "TOWER  MARK LIMITED",
        "TOYOTA ABAD SANTOS, MANILA",
        "TOYOTA DASMARI¥AS - CAVITE",
        "TRADEPOINTS INCORPORATED",
        "TREADSTONE INDUSTRIAL SALES",
        "TRIPLE A POWERTECH AUTOMATION SYSTEM INC.",
        "TRIUMPH MACHINERY CORPORATION",
        "TWA, INC.",
        "TWINCELL",
        "TYVAL INDUSTRIAL SUPPLY CORP.",
        "UNICO GENERAL MERCHANDISING",
        "UNION MOTOR CORPORATION",
        "UNITED BEARING INDUSTRIAL CORPORATION",
        "UNIVERSAL FORTUNE TRADING",
        "USAE (MALAYSIA) SDN BHD",
        "V & 4J ENTERPRISES",
        "V.A. FARM TRACTOR INDUSTRIAL CORP.",
        "V.G. GATDULA CONSTRUCTION, INC.",
        "VAN DER HORST TECHNOLOGIES PHILS., INC.",
        "VANDEM ENTERPRISES",
        "VARQUEZ SAND AND GRAVEL",
        "VEESAFE INDUSTRIAL SAFETY SUPPLIES, INC.",
        "VERIDIS PROJECTS MANILA CO.",
        "VG CAD PRESSURE SOLUTION CORP.",
        "VICTORIA PEACE BUILDER",
        "VICTORIA TRADING",
        "VICTORIOUS CREATION INTERIORS",
        "VILLAMOR & VICTOLERO CONSTRUCTION CO.",
        "VONOTEC, INC.",
        "WALTERMART HANDYMAN, INC.",
        "WESTBROOK ENTERPRISES",
        "WII TRADING CORPORATION",
        "WIN-A-PARTNER INTERNATIONAL BUSINESS INC.",
        "WMLC TRADING & CONSTRUCTION SUPPLY",
        "WUERTH PHILIPPINES, INC.",
        "Y & G COMMERCIAL",
        "YOLOB ENTERPRISES",
        "A.V.D MARKETING CORPORATION",
        "ACRUE ENTERPRISES",
        "ADVANCE CONSTRUCTION AND DEVELOPMENT SERVICES, INC",
        "ADY CONSTRUCTION AND SURVEYING SERVICES",
        "AGILE TECHNODYNAMICS INC.",
        "ALNOR CONSTRUCTION",
        "ANTARES STAR CONSTRUCTION, INC.",
        "ANTHONY ANGDAGCO AND HAIDEE HERNANDEZ",
        "ANTONIO VANZUELA JR.",
        "ARC CONSTRUCTION SUPPLY",
        "ARCHDECO ASSOCIATES",
        "ATI CONSULTORES, S.L.",
        "A-TO-Z DESIGNS",
        "BENITO, DONATO",
        "QUALITY STAR CONCRETE PRODUCTS, INC.",
        "CABANDUCOS IRON WORKS",
        "CARLOS A. GOTHONG LINES, INC.",
        "CARRION, CARLOS MIGUEL G.",
        "CDO K&J EXPRESS CORPORATION",
        "CEBU UNION BUILDERS CORPORATION",
        "CENDAUR ENGINEERING",
        "CODERS TECHNOLOGY SOLUTIONS",
        "CONEX",
        "CONSOLIDATED EXPLOSIVES GROUP CORPORATION",
        "DAVAO DIAMOND INDUSTRIAL SUPPLY",
        "DENTCHEM ENTERPRISE CO.",
        "DONALD PADILLA",
        "ELECDES TRADING AND TECHNICAL SERVICES",
        "DONATO BENITO",
        "DVAL BUILDING PRODUCTS & SERVICES CO.",
        "DWIGHTSTEEL BUILDING SYSTEMS INC.",
        "ECE COGEMACOUSTIC",
        "ECO-EDGE HOME INTERIORS & SUPPLIES, INC.",
        "EDCOP",
        "EDELBURGO T. PAG-ONG",
        "ELECTRICAL EQUIPMENT AND SYSTEM INTEGRATION, INC.",
        "ELIJAH S. PAG-ONG",
        "ELIZER BAGALANON",
        "ELMER S. PARILLA",
        "FANM ENTERPRISES",
        "ERNESTO C. TRIA",
        "ESMENDA ENGINEERING WORKS",
        "FLORENCIO JORDAN",
        "FREEPORT DK INTERNATIONAL INCORPORATED",
        "FRONTIERBUILDERS INC.",
        "GEREDAL CONSTRUCTION SERVICES",
        "GISMECON WATER TANKS",
        "GLOBESTAR TECHNOLOGIES, INC.",
        "GRAND ACES VENTURES, INC.",
        "GRETOUGH INC.",
        "GRHAMES PHILIPPINES, INC.",
        "HALCROW",
        "IGNACIO SABRIDO",
        "J.A. PAGARA CONSTRUCTION",
        "JIMSCO NOZZLE RECONDITIONING",
        "JOBBER PHILIPPE ENTERPRISES",
        "JOEL CALARA",
        "JONZLIB''Z BUILDING SYSTEM",
        "JR VALENCIA AIRCONDITIONING SERVICES",
        "JSL CONSTRUCTION AND GEN. SERVICES",
        "JUMUAD ENGINEERING SERVICES",
        "KINETIC PHILS. ELECTRICAL CONSTRUCTION, INC.",
        "KINGSTONE SOLID SURFACE",
        "KUMI CONSTRUCTION",
        "L.C. LISING INTERIOR DECORATION SERVICES",
        "LORENA N. DALISAY",
        "MADZ BLASTING & PAINTING WORK.",
        "MAGDALUYO, RENANTE",
        "MARLON B. BANDA",
        "MCCD ENGINEERING SERVICES & TRADING",
        "MERALCO",
        "MONTRELEC INCORPORATED",
        "NJORTH CORPORATION",
        "NOEL PENDEJITO",
        "GREENTEK ENVIRONMENTAL ENGINEERING SERVICES",
        "PARPAD BUILDERS",
        "PHP PHILIPPINES HYDRO PROJECT, INC.",
        "POLA''S TRUCKING SERVICES",
        "POWER DIMENSION INCORPORATED",
        "PROJECTS UNLIMITED PHILIPPINES INC.",
        "R. LUNA TELECOM SERVICES",
        "R.J.S. INDUSTRIAL CONSTRUCTION & DEVELOPMENT CORPORATION",
        "RANIN, ERNESTO D.",
        "RCC CONSTRUCTION",
        "RDG CONSTRUCTION AND SUPPLY",
        "RESARI ARCHITECTS & INTERIOR DESIGNER",
        "REYNALDO PAGDANGANAN",
        "RLN ROAD LEAD MANAGEMENT",
        "RMR METALFAB",
        "TOP ENTERPRISES",
        "S.G.O PHILS., INC.",
        "SANTIAGO PINERA",
        "ENERGY & BUILDING APPLICATION TECHNOLOGIES CORP.",
        "SB CONSTRUCTION & WATER TREATMENT CORPORATION",
        "SHECEL ENTERPRISES",
        "SPECIALIZED TRADING & CONTRACTING SERVICES",
        "SPRINGFIELD DOORS CENTER",
        "STEFISTONE GRANITES & MARBLES",
        "STEVENSON MARKETING & SERVICES",
        "SYSTEM8 CONTROLS INCORPORATED",
        "TRADERS INDUSTRIAL SUPPLY CO. INC.",
        "TRADETEK RESOURCES, INC.",
        "TRI-TECH GENERAL SERVICES, INC.",
        "TRUSCON STEELWORKS, INC.",
        "UAE ENGINEERING CONTRACTOR",
        "ULTRA PLASTECH PHILIPPINES, INC.",
        "V. CUTAMORA CONSTRUCTION, INC.",
        "VICTORINO P. BENSI",
        "WHESSOE PHILIPPINES CONSTRUCTION, INC.",
        "WORLDCHEM ENVIRO TECHNOLOGIES, INC.",
        "ZZF STEEL WORKS",
        "BATKINS INCORPORATED",
        "DARIO D. LUGA",
        "GLOBAL INFINITY ENGINEERING",
        "IMELDA E. GANDIA",
        "JBDS CONSTRUCTION",
        "MAPECON PHILIPPINES INC. - DAVAO",
        "PIONEER SPECIALTY BUILDING SYSTEMS, INC.",
        "PURESTEEL MARKETING & CONSTRUCTION",
        "RELIANCE VENTURES AND TRUCKING",
        "REYNALDO MARZAN",
        "VICHEM COATINGS AND CHEMICALS, INC.",
        "ACTIVE CONSTRUCTION SUPPLY",
        "ANTONIO MONTILLA",
        "APPA PAINT GENERAL MERCHANDISE",
        "CEMPRON CONSTRUCTION & DEVELOPMENT",
        "EEC COATING & WATERPROOFING SERVICES",
        "ELMECH CONTRACTORS INCORPORATED",
        "ERNESTO CABAJES",
        "FLORENCIO S. ESTOQUE JR.",
        "FSJ TRUCKING SERVICES",
        "GERRY GONZAGA",
        "GREAT YEAR INDUSTRIES CORP.",
        "GROUNDWORX CONSTRUCTION",
        "M&M ROLL UP DOOR",
        "MARCELO S. ATONEN",
        "MATEO ABUYEN JR.",
        "MIGANS BUILDERS",
        "M-M MARBLE & CONSTRUCTION SUPPLY, INC.",
        "MOTHER NATURE ENVIRONMENTAL & LANDSCAPING SERVICES",
        "NUKOTE INTERNATIONAL CORPORATION",
        "OMNI CRAFTSMAN",
        "PACATE, ISRAEL",
        "PACIFICTECH SOLUTIONS",
        "RAMCRETE DEVELOPMENT CORPORATION",
        "RAUL RODRIGUEZ",
        "RC ESPEJON BUILDERS",
        "ROBEI DRILLING SERVICES",
        "STRATA BUILDERS DESIGN AND PROJECT MANAGEMENT, INC",
        "TACGOS MANPOWER SERVICES",
        "SEACOM, INC.",
        "ULTRA INSULATED PANEL SYSTEMS CORP.",
        "ZALDY MARCILLA",
        "SINOTRUK HOWO SALES CO., LTD",
        "HONDA CARS MARIKINA",
        "ISUZU ILOILO CORPORATION",
        "RCBC SAVINGS BANK",
        "TOYOTA BALINTAWAK, INC.",
        "TOYOTA MARIKINA",
        "ASIAN MARINE TRANSPORT CORPORATION",
        "MEASURE & SEW TAILORING SERVICES",
        "CCI CEBU CABLES INTERNATIONAL INC.",
        "FIRE MASTER IMPORT AND EXPORT CORPORATION",
        "QUAN U FURNITURE",
        "ECOTRANS PORTABLE SOLUTIONS INC.",
        "EDDIE FABROS JR.",
        "SUBICCON CORPORATION",
        "FOSHAN NANHAI YAODA BUILDING MATERIALS CO., LTD",
        "GREENTECH IND''L SUPPLY & SERVICES CO.",
        "TOSHIN-JH CO., LTD.",
        "GREENCARS MINDANAO CORPORATION",
        "BILANDO, GRACE MAGUILAY",
        "ELECTRICAL & EQUIPMENT SALES CO., INC.",
        "R&R EXCELLENT TRADING CORPORATION",
        "ICE FAR EAST PTE LTD.",
        "RCR STRUCTURES",
        "TOYOTA DAVAO CITY, INC.",
        "IPE ASIA CO. LTD",
        "TANAKA ENTERPRISES",
        "ABC COCO LUMBER & GENERAL MERCHANDISE",
        "ALMIGHTY CORPORATE TECH SOLUTIONS, INC.",
        "ABELLANA SAND & GRAVEL DEALER",
        "OMERTA HOUSING SUPPLY",
        "PHILIPPINE LAMP POST MFG CORPORATION",
        "REPUBLIC CEMENT MINDANAO, INC.",
        "MORICH TRADING",
        "CASTLE POWER SEM",
        "HEBEI GN SOLIDS CONTROLS CO. LTD.",
        "M.A.W. ENTERPRISES",
        "RM RAYTOS CONSTRUCTION",
        "BLU TRADING",
        "CEBU TRISTAR CORPORATION",
        "EST TIMES CONSTRUCTION & DEVELOPMENT CORPORATION",
        "WIBEE INDUSTRIAL TECHNOLOGY",
        "EJJM TRADING AND CONSTRUCTION SERVICES",
        "MAIBEN STRATEGIC CONSTRUCTION",
        "DBBS CONSTRUCTION",
        "BASOY MINEROCKS CORPORATION",
        "BCMLACORPORATION",
        "DHEAVYLINEPARTS&EQUIPMENTRENTAL",
        "RICHARDBADANG",
        "THEBRAINCOMPUTERCORPORATION",
        "LILAICONSTRUCTION&DEVELOPMENTCORP.",
        "A.G.CRUZTRADING&GEN.SERVICES",
        "KUMKANGINDUSTRY",
        "OFFICEFABE-SERVICESPHILIPPINESINC.",
        "TIREMANTRADINGANDSERVICES",
        "ROCKBUILTENTERPRISESINC.",
        "LZAMMACHINESHOPCORP.",
        "B-THIRTEENTRADING",
        "CONZONETRADINGCORPORATION",
        "HAMARCEDCONSTRUCTION",
        "INSTRUMENTSCIENCESYSTEMS,INC.",
        "TRI-STARAUTOSUPPLY",
        "NO.1HYDRAULICCORPORATION",
        "LARGEFORMATIXVISUALCOMMUNICATION,INC.",
        "TANGINTERNATIONALENTERPRISES,INC.",
        "ENVIRONMENTAL,ALTERNATIVE,RENEWABLEANDTECHNOLO",
        "VERTICALHORIZONENTERPRISE",
        "IDEALREADYMIXCONCRETE",
        "CD-RKINGGEN.MERCHANDISEDAVAOBRANCH",
        "ALONZOCONSTRUCTION",
        "PILLARSINDUSTRIALEQUIPMENTCORP.",
        "ZETAINT''LTRADINGCORP.",
        "AMETROSINC.",
        "SUPERHIGHWAYENTERPRISES",
        "CERVETTIALDO&FIGLIOSRL",
        "D.H.PHILIPPINESELECTRICALCORPORATION",
        "YESUNGINC.",
        "ASIANCOATINGSPHILIPPINESINC.",
        "VILLMANCOMPUTERSYSTEMS(WEST)INC.",
        "RPMENGINEERINGSERVICES",
        "WHOLEBOXENTERPRISES",
        "BALANGARHOYALMASTERCALIBRATION",
        "ENVIRONMENTALVENTURESMARKETINGINC.",
        "ORIENTFREIGHTINTERNATIONAL",
        "BLUECOMPACTSTEEL",
        "WILLYBACOONG",
        "ALFALAVALPHILIPPINES,INC.",
        "INDUSTRIAL&TRANSPORTEQUIPMENTINC.",
        "WILMORR.RITUAL",
        "ANALYD.BADANOY",
        "EMERSONPROCESSMANAGEMENTASIAPACIFICPRIVATE",
        "EDMUNDVALLEJERAMACAS,SR.",
        "MOTORIMAGEMANILA,INC.",
        "LIEBHERR-WERK NENZING GMBH",
        "1911TRADING",
        "4BROTHERSTRAPALSUPPLY",
        "4D''SENTERPRISES",
        "8DRAGONCONSTRUCTIONSUPPLYINC.",
        "A.BONIFACIOLININGSBRAKE&CLUTCH",
        "A.M.GREGORIOGRAVEL&SAND",
        "A.O.GSIPHONINGSEPTICTANK&PLUMBINGSERVICE",
        "A.V.PAMATONGTRADING&CONSTRUCTIONINC.",
        "AA2000ENTERPRISES",
        "ABENSON VENTURES, INC.",
        "ACCESSNETWORKSYSTEMSCOMMUNICATIONS",
        "ACEHARDWARE",
        "ACECORCALIBRATIONSERVICESANDGEN.MERCHANDISE",
        "ACG BUILDER''S CENTRE, INC.",
        "ADNUMENTERPRISES",
        "AERONICSINCORPORATED",
        "AEROPACEQUIPMENTRENTALCORPORATION",
        "AIMILFIRESAFETYPRODUCTS",
        "AIRPACSYSTEMSCONTROL,INC.",
        "AISINCARPARTS",
        "ALFREDOD.RUIZJR.",
        "ALLEGIANCECARGOADVANTAGEINC.",
        "ALL-FLEXMARKETINGINDUSTRIALSALES",
        "ALLIEDTIRECENTERCORPORATION",
        "REYNALDOM.ALMERO",
        "ALYSON''SCHEMICALENTERPRISES.INC.",
        "AMAAUTOTECHNIC,CORP.",
        "ANDANMULTISALESCORPORATION",
        "ANONASCONST.&INDUSTRIALSUPPLYCORP.",
        "APEXGOLDENLADIESGARMENTSSEWINGSERVSCOOP.",
        "APG&ETRADING",
        "APOVILCONSTRUCTION",
        "ARABOTRADING",
        "ARAMINEGROUPEMELKONIAN",
        "ARGINS''INDUSTRIALSUPPLY",
        "ARGUSPHILIPPINESNDESERVICES-BATAAN",
        "ARUAUTOPARTS",
        "ASALUMBER&CONSTRUCTIONSUPPLY",
        "ASIAHOMETRADINGCORPORATION",
        "ASIANCENTREFORINSULATIONPHILIPPINESINC.",
        "ASTROBUILTCONST.&DEVELOPMENT",
        "ASUKI WEIGHING SYSTEM, INC.",
        "ATLASCOPCOROCKDRILLAB",
        "AUTOZONEENTERPRISES",
        "AUTOWERKSTATTSOLUTION,INC.",
        "AVZCOCOLUMBER",
        "B-12 CONSTRUCTION AND TRADING CORPORATION",
        "BALANGAMACHINESHOPANDENGINERECONDITIONING",
        "BALINGASAGQUARRY",
        "BASICOCCUPATIONALSAFETYSUPPLIESPHILS.,INC.",
        "MR.INOCENCIOC.BATIANCILA",
        "RIZAA.BAUTISTA",
        "BAVARIASWISSAGUSEDMACHINERY",
        "BENESCOCONST.SUPPLYINC.",
        "BENTLEYTRADING",
        "BESTELECTRICALAUTOMATIONCONTROLS(BEAC),INC.",
        "BG ELIOT ENTERPRISES",
        "BJHYDRAULIC",
        "BJGCONCRETEPRODUCTS",
        "BLIMSFINEFURNITURE",
        "BONLIMARKETING",
        "BORCHEMECONCRETESOLUTIONS",
        "BRANESMATRAPALSUPPLY",
        "BUGUIASAUTOSUPPLY&GENERALMERCHANDISE",
        "BUSUANGAGEN.MERCHANDISE",
        "C.G.UMALICOMMERCIAL",
        "CAGAYANPRINTINGPRESS",
        "CALOOCANOILSEALCORPORATION",
        "CAMPBRIDGEPAINTS",
        "CANON MARKETING (PHILIPPINES), INC.",
        "AVELINAM.CAPINDA",
        "CARTREXTRUCKING",
        "CEBUACETRUCKINGCORPORATION",
        "CEBU BIONIC BUILDERS SUPPLY, INC.",
        "EQUIPMENTSHOPINDUSTRIALSALESCORP.",
        "CENTIREEENTERPRISES",
        "CHAMPIONSTARMERCHANDISINGCENTER",
        "CHEMI-SOURCEUNLIMITEDCORPORATION",
        "CIMTECHNOLOGIES,INC.",
        "CITY SHUTTER INCORPORATED",
        "CIVICMERCHANDISINGINC-CDO",
        "CIVICMERCHANDISINGINC.-DAVAO",
        "CKLBUILDERS&GENERALMERCHANDISE",
        "CLAZIQUEGASMARKETING",
        "CLEARSTONEENTERPRISES",
        "CLESIAN''SENTERPRISES",
        "COLENTMARKETINGPHILIPPINESINC.",
        "COLOSSALA-PLUSCORPORATION",
        "COMPETITIVECARDSOLUTIONSPHILS.INC.",
        "COMPLINK MARKETING INC.",
        "CONCHITANGOESCOLARTRADINGINC.",
        "CONPROTECTRADING",
        "CONSANDINC.",
        "CONTROLGEARELECTRICCORPORATION",
        "COOLAIRCONDITIONING&REFRIGERATIONIND.,INC.",
        "COOL-MAXCARAIRCONDITIONINGSERVICES",
        "CRISELDAAUTOSUPPLY",
        "CUMMINSSALESANDSERVICESPHILIPPINES",
        "CWCINTERIORCONCEPTS,INC.",
        "DADIANGASPHILIPPINECHAMPIONINDUSTRIES,IC.",
        "DANNY''STIRE&BATTERYSUPPLY",
        "DAVAO INTERNATIONAL MEGA GAS CORPORATION",
        "DAVAOBOLTCENTERCORP.",
        "DAVAOCITIHARDWAREINC.",
        "DAVAODOMARTENTERPRISESCO.",
        "DAVAOGREATLYMARKETING",
        "DAVAOINDUSTRIALCOMPRESSEDGASESCORP.",
        "DAVAO PREMIUM ENTERPRISES",
        "DAVAOCITYSOLIDMIXCONCRETECORP.",
        "DELUXECANVAS&UPHOLSTERYSUPPLY",
        "DEOROPACIFICHOMEPLUS",
        "DECO MACHINE SHOP INC.",
        "DELTAMACHINERY",
        "DESIGNCRESTFURNITURECOMPONENT",
        "DIAMONDCLUTCH-BRAKES&PARTSCENTERCO.",
        "DIAZMARKETING",
        "DICOMARKETING",
        "DIPSCETRADERS",
        "DSDELASARMASCONSTRUCTIONSUPPLIES",
        "DUBRICONMANUFACTURINGANDMARKETINGCORP.",
        "DYD REFRIGERATION SYSTEMS, INC.",
        "E.RAMOSAUTOSUPPLY",
        "E.L.ANOLINCONSTRUCTION",
        "EAGLEPESTCONTROL",
        "EAGLEWINGSENTERPRISES",
        "EASTKEMINDUSTRIAL,INC.",
        "ECONTECHENECIOCONSTRUCTIONTECHNOLOGYINC.",
        "EDGETRADING",
        "EDGINAUTOSUPPLY",
        "EIGHTYANKEESINDUSTRIALSALES",
        "ELTECHSE&CCORPORATION",
        "EMERALD VINYL CORPORATION",
        "EMERSONTRADING",
        "EUROSEALINDUSTRIALPARTSSALES",
        "EXCELCONINDUSTRIESPHILIPPINES,INC.",
        "EXCELONINDUSTRIALPLASTICS",
        "F.ALBORCARAIRCONSHOP",
        "FASTPACETRACTORPARTSTRADING",
        "FELPORTINTERNATIONALMARKETING",
        "FF&G.COMPRESSEDGASDISTRIBUTOR",
        "FIL-ONEGENERALMERCHANDISEDISTRIBUTOR",
        "FIRSTFINESTELECTRICALTRADINGCORP.",
        "FIRSTPHILECMANUFACTURINGTECHNOLOGIESCORP.",
        "FLOWCRETECONSTRUCTIONEQUIPMENTPHILIPPINES,INC.",
        "FOCUSGLOBALINC.",
        "FREIGHT1 EXPRESS TRANSPORT CO., LTD.",
        "FUJI XEROX PHILIPPINES, INC.",
        "FULLSPEEDFREIGHTSYSTEMS,INC.",
        "FUSO DIESEL CENTER INC.",
        "FZICONSTRUCTION,PARTS&SUPPLY",
        "GAMOLOCONSTRUCTIONSUPPLY",
        "GARPANTRADING",
        "GCDRIVEINDUSTRIALCORPORATION",
        "GENDIESELPHILIPPINESINC.",
        "GHERTZCOMPUTERCORP.",
        "GICARCONSTRUCTIONINC.",
        "G.J. PALMEA STEEL FABRICATION",
        "GLITZYGLASSANDINTERIORS",
        "GLOBALTOOLSENTERPRISESINC.",
        "GOLDSUNLUMBER&CONSTRUCTIONSUPPLY",
        "GOLDENADVANCEMARKETINGCORP",
        "GOLDENAXLECARGOANDHEAVYLIFTSPECIALIST",
        "GOLDENDRAGONMETALPRODUCTS",
        "GOLDEN RAIN CONSTRUCTION & TRADING",
        "GOTHONG SOUTHERN SHIPPING LINES INC.",
        "GPNSAND&GRAVEL",
        "GRAMPENTERPRISES",
        "GRUPOSELECTROGENOSEUROPA,SA",
        "LERMAM.GUNTAN",
        "H20CONCEPTSANDDESIGNSINC.",
        "HARLEPHILIPPINES",
        "HARNWELLCHEMICALSCORPORATION",
        "HARROWSINDUSTRIALSALES",
        "HARTEECOMMERCIAL",
        "HEDDY MANZANO MARKETING",
        "HIWAYCENTERTRADING",
        "HNLOFFICEDESIGNSCO.",
        "HOMEATTITUDEWOODCRAFT&TRADING",
        "HOMEPLUSBUILDERS''CENTREINC.",
        "HONDACARSGLOBALCITY",
        "HONDA CARS MAKATI INC.",
        "HONDACARSMAKATI",
        "HONEYWELLSHELLSERVICESTATION",
        "HORIZONCONCRETEPRODUCTSCORPORATION",
        "HOTGADGETSTRADING",
        "HOWICKTRADING",
        "IMMANUELA.BOMEDIANO",
        "ICHIBANIMPORT-EXPORTCORPORATION",
        "INDUSTRIAL WELDING CORPORATION",
        "INDUSTRIASAUGES.ADEC.V.",
        "INFINICOMCOMPUTERS",
        "IRISINDUSTRIALSALESINC.",
        "ISLANDSTEELENTERPRISES",
        "ISSIINFORMATIONTECHNOLOGIES,INC.",
        "ISTEEL, INC.",
        "ISUZU AUTOMOTIVE DEALERSHIP, INC",
        "JCAJELESENTERPRISES",
        "JMARKETINGCORP.",
        "J.A.PAGARACONSTRUCTION",
        "JABAR ENTERPRISES",
        "JAC AUTOMOBILE INT''L. PHILIPPINES INC.",
        "JAMILCRES,INC.",
        "JARGEMCONTRACTORDEVELOPER",
        "JASMACHINESHOP&ENGINEERINGWORKS",
        "JASH-VELECTROMECHANICALSUPPLIES&SERVICES",
        "J-COTRADING",
        "JCSMACHINESHOP&ENGINERECONDITIONING",
        "JEJEINDUSTRIALENTERPRISES",
        "JETECHENGINEERINGTECHNOLOGIES",
        "JIMMYA.AGRAMON",
        "JMT",
        "JOESONS COMMERCIAL CO., INC.",
        "JOJISASAKI",
        "JOMELLEPETRONSERVICECENTER",
        "JONIEROSETRADING",
        "JORGEPATERNO",
        "JOSEPHCONSTANTINEA.PALANCA",
        "JRCINDUSTRIALSALES",
        "JUNVALENCIAGRAVEL&SAND",
        "JUSTINEANGELO''SCARAIRCONREPAIRANDSERVICES",
        "JVSPAINTCENTER",
        "KC INDUSTRIAL CORPORATION",
        "KENJHEMTRADING",
        "KENJOOFFICESUPPLIES,INC.",
        "KFRJGENERALMERCHANDISE",
        "KHREZNAJANTRUCKINGSERVICES",
        "KIA-ALABANG",
        "KIAMOTORSESGUERRA",
        "KIAPAMPANGATRADERSAUTOCENTER,INC",
        "KIAPASAY",
        "KIPCOLINTERNATIONALCORPORATION",
        "KOBELCOCOMPRESSORS&MACHINERYPHILIPPINESCORP.",
        "KOBELCOCRANESSOUTHEASTASIAPRIVATELIMITED",
        "KRIZLERINDUSTRIALTRADERSCOOPERATIVE",
        "KRUGER M & E INDUSTRIES CORP.",
        "LAFARGECEMENTSERVICES(PHILIPPINES),INC.",
        "MR.PEDROLANGUIDO",
        "VILMALATAYAN",
        "JOSEPHP.LAURDEN",
        "LEEMASTERSINTERNATIONALLTD.-HONGKONG",
        "LEOPOLDODEVILLA",
        "LIEBHERR-SINGAPORE PTE. LTD.",
        "LIGHTMASTERMANUFACTURINGCORP.",
        "LINK ENERGIE MARKETING INTERNATIONAL INC.",
        "LIONGMEIGENERATIONCORPORATION",
        "LIVINGCORNERSTONECONSTRUCTIONSUPPLY",
        "LJ CONTAINER TRADING",
        "LPOTRUCKINGSERVICES",
        "ALEXANDERA.LUNA",
        "LUOYANGCIMCLINYUAUTOMOBILECO.,LTD.",
        "LYLDEVELOPMENTCORPORATION",
        "LYNCGOLDCONSTRUCTIONSUPPLY&SERVICESINC.",
        "LYNDONLIBIRANWOODWORKS",
        "M.M.U-CHEMINDUSTRIES,INCORPORATED",
        "MAC-PJLANDCORPORATION",
        "EMMAMAGBITANG",
        "MAIN HARDWARE, INC.",
        "MALABONTIRE",
        "EDGARMALIT",
        "MANTRADEDEVELOPMENTCORPORATION",
        "MAQUILINGHARDWARELUMBERANDCONSTRUCTION",
        "MARBEXENTERPRISES",
        "MARIOGRAVELANDSANDSUPPLY",
        "MATEENTERPRISES",
        "MAXIMAEQUIPMENTCO.,INC",
        "MAYONGLASSSUPPLY",
        "MB AGGREGATES & CONSTRUCTION SUPPLY TRADER & PROCESSOR",
        "MCEDGIELYANNTRADING",
        "MCEDENTERPRISES",
        "MDOCONSTRUCTIONANDALLIEDSERVICES",
        "MDRCTRDG&LOGISTICSSERVICES",
        "MEGABOLTENTERPRISES",
        "METALSINDUSTRYRESEARCHANDDEVELOPMENTCENTER",
        "METMATRADING&INDUSTRIALCORPORATION",
        "MEWINDUSTRIALSALESCORP.",
        "MHIENGINESYSTEMASIAPTE.LTD.",
        "MICROKINETICSINC.",
        "MIDLANDENGINEANDHYDRAULICCOMPONENTSCORP.",
        "MIDTOWNINDUSTRIALSALES,INC.",
        "MINDANAOACEMARKETING",
        "MINTEXINDUSTRIALSUPPLY",
        "MJAS ZENITH TRADING",
        "MJSGCARGOSERVICES",
        "MMLSMARKETING",
        "MOLAVETRADINGINC.",
        "MONARKEQUIPMENTCORPORATION",
        "MOORIE''SCOCOLUMBER",
        "MOREFLEXENTERPRISES",
        "MOTORCARSAUTOPARTSCO.",
        "MRDMANPOWERSERVICES",
        "MUTENTERPRISES",
        "MVSAMERAENTERPRISES",
        "NARITASTEELINDUSTRYCORPORATION",
        "NASAJETMATICCENTER",
        "NERIAM.ERSANTRUCKINGSERVICES",
        "NETEX SYSTEMS, INC",
        "NEWBAYAUTOSUPPLY",
        "NEWCIRCULATEDELECTRICALSUPPLY",
        "NEWTOSUYHARDWARE",
        "NEWTOPBESTLUMBER&CONST.SUPPLY",
        "NIPPONSCAFFOLDINGANDFORMWORKSCORP.",
        "NIPPONSTEEL&SUMIKINBUSSANCORPORATION",
        "NISSANCAGAYANDEORODIST.INC.",
        "NISSANCOMMONWEALTH,INC.-BALIWAGBRANCH",
        "NISSANWESTGATEALABANG-SHAW",
        "NITZQUICKPRINT©SYSTEMS",
        "NMCPRINTINGSERVICES",
        "NONAGINTATRADING",
        "NONITOEBAYAERRABO",
        "NORTHCOASTSHIPPING.NCSCORPORATION",
        "NOVAXMATERIAL&TECHNOLOGYINC.",
        "NUTZFAHRZEUGE&BAUMASCHINENM.BAUER",
        "OCEANICCONTAINERLINES,INC.",
        "OCTAGONCOMPUTERSTORE",
        "OCTAGONCOMPUTERSUPERSTORE",
        "OLEUMINDUSTRIACORPORATION",
        "ONAGASHOJICO.,LTD.",
        "ORION WIRE AND CABLE INC",
        "OROASIACONSTRUCTIONSUPPLY",
        "OROPHILINDUSTRIES",
        "OSPADVANTAGESYSTEMCORPORATION",
        "OTHMANNINCORPORATED",
        "P.J.C.CONSTRUCTIONANDTRADING",
        "PACCARMERCHANDISING",
        "PACIFICGLASSCORPORATION",
        "PACIFIC TIMBER EXPORT CORPORATION",
        "PALL ROCES CORPORATION",
        "PANASHIRTTRADING",
        "PCOPTIONSCOMMERCIALINC.",
        "PCMEXPRESSSYSTEMINC.",
        "PENTAGON GAS CORPORATION",
        "PENTAGONINDUSTRIALDEV''T&CONST.COMPANY,INC.",
        "PENTAUNOINTERNATIONALCORPORATION",
        "PERFECTMASTER",
        "PHIL.INSULATIONCO.,INC.",
        "PHILCHAMPTRANSPORTRESOURCES,INC.",
        "PHILCOPYCORPORATION-OLONGAPO",
        "PHILIPPIANS4:13ELECTRICALSUPPLY",
        "PHILIPPINEBELTMANUFACTURINGCORP.",
        "PHILIPPINE DUPLICATORS INC.",
        "PHILTRUCKAUTOMOTIVEVENTURES",
        "POWERMANHARDWARE",
        "PPG COATINGS PHILIPPINES INC.",
        "PRIMAEQUIPMENTB.V.",
        "PRIMEPAVECONSTRUCTIONANDASPHALTCORPORATION",
        "PRINTMARKERSILKSCREENPRINTINGSERVICES",
        "PUYAT STEEL CORPORATION",
        "QUANTUMRUBBERPRODUCTSCORP.",
        "QUARTZBUSINESSPRODUCTSCORP",
        "RAMOND.QUEBRAL",
        "RGRINDUSTRIALSALES",
        "R.MANUELENTERPRISES",
        "R.M.DKWIKFORM",
        "R.R.ALIVIOGENERALMERCHANDISE",
        "RAINBOWGEOSCIENTIFICCORPORATION",
        "RANGLASSALUMINUMSUPPLY&IRONWORKS&UPVC",
        "RAPIDEAUTOSERVICECENTER",
        "RBCHARDWAREANDCONSTRUCTIONSUPPLY",
        "REEDLLC",
        "REST&RUSHATHLETICUNIFORM",
        "REVOLTERMARKETINGSERVICES",
        "REY MARKETING, INC.",
        "REY-DHEAVYLIFTCORPORATION",
        "REYDEMSONCARAIRCON",
        "NESTOR ESCINAS",
        "RKTCSAFETYINDUSTRIES",
        "RMCLAVERIAENTERPRISESINC.",
        "RNKTRADING",
        "ROBBIN''SAUTOPARTS",
        "ROBINSONSAPPLIANCES",
        "ROI''SSUPERBOLTTRADING",
        "ROJULPRINTINGSERVICES",
        "ROMMELM.SOLMAYOR",
        "RONILSLUDGE&ALLIEDSERVICES",
        "ROYALCOMMUNICATIONSINTERNATIONAL,INC.",
        "RSJJTRADING",
        "RTLEQUIPMENTSALES&RENTAL",
        "SAFEELECTRICALSUPPLYANDSERVICES",
        "SAFECONINDUSTRIES,INC.",
        "SAFETYSHELLSERVICENTER",
        "SAHLSHAUSWARE",
        "SAMBARMACHINESHOP",
        "SAMBARMACHINEWORKS&AUTOREPAIRSHOP",
        "SAMGLOTRADING,INC.",
        "GLENNLANSANGSAZON",
        "SBMARKETING",
        "SCAFFSYSTEMMANUFACTURING,INC.",
        "SEAHAWKTRANSPORT,INC.",
        "SEASOLUTIONSINC.",
        "SEINEGARMENTSCORPORATION",
        "SEOULFASTENINGCO.,LTD",
        "SFC OFFICE FURNITURE",
        "SHAICINTERNATIONALCO.",
        "SHIRTCITYCOMMERCIAL",
        "SILANGANREPAIRSHOP",
        "SIMARTSALESCORPORATION",
        "SKYDRAGONCONSTRUCTIONPRODUCTS,INC.",
        "SMAPPLIANCECENTER",
        "SMALLVILLECOMPUTERSOLUTIONCO.",
        "SMECPHILIPPINES",
        "S.N.A.G.P. CORPORATION",
        "SOBIDAMOTORSCORPORATION",
        "SOLARFLEXMARKETINGHYDRAULICHOSESERVICECENTER",
        "SOLIMANE.C.",
        "SOUTHMILANDIA,INC.",
        "SOUTHERNBANAWE",
        "SOUTHTRADEBUILDERSRESOURCECENTER",
        "STARITA168BUILDERSCORP.",
        "STARCRETE MANUFACTURING CORP.",
        "STARWIN TRADING",
        "STATICELECTRICALSUPPLY",
        "STATICPOWERPTELTD",
        "STEELTRUST CORPORATION",
        "STREAMFLOWTRADING&GENERALSERVICES",
        "STYRO-LITEMANUFACTURINGCORPORATION",
        "SUPERTERMITE&PESTCONTROLINC.",
        "SUPERIORGAS&EQUIPMENTCO.OFCEBU,INC.",
        "SUPREMESTARMARKETING",
        "T.L.TADEOHAULINGSERVICES",
        "TACTICALSTONESENTERPRISE",
        "TADANOASIAPTELTD",
        "TECHNO-TRADE RESOURCES, INC.",
        "TENFOLDTELECOMCONSTRUCTION,INC.",
        "TETINGSANDANDGRAVEL",
        "TGSIENTIFICEQUIPMENTCORPORATION",
        "THICKN''THINPANELS",
        "THREEESOLUTIONS",
        "TIMOGTIREHAUSCORPORATION",
        "TIMPLAPAINTSHOP&HARDWARE",
        "TJCPJOINTVENTURE",
        "TOMASELECTRICALSUPPLYCORPORATION",
        "TOPJTRADING",
        "TOPWELDIND''LSUPPLYINC.",
        "TOYORAMAMOTORSCORPORATION",
        "TOYOTAQUEZONAVENUE,INC.",
        "TRANSPORTEQUIPMENTCORP.",
        "TRESHERMANASMOTORSCORP.",
        "TRI-GINDUSTRIALSUPPLY",
        "ULTIMATEFREIGHTLOGISTICS,INC.",
        "ULTRACOTE PAINTS & COATINGS CORPORATION",
        "UNIFORMREFRIGERATIONANDAIRCONDITIONINGSUPPLY",
        "UNISONCOMPUTERSYSTEMS,INC.",
        "UNITEDSTEELTECHNOLOGYINTERNATIONALCORPORATION",
        "UNIVERSALELASTOMER,INC.",
        "UNIVERSALMULTI-TESTINGSOLUTIONS,INC.",
        "UPMARKETING",
        "URCIACOOLTECHTRADING",
        "VASQUEZCOMMODITIESCORPORATION",
        "VERSATRUNKPHILIPPINES",
        "VILCHESENTERPRISES",
        "VILLMANCOMPUTERSYSTEMSINC.",
        "VIRSONSVENTURES",
        "VISHAYCELTRONTECHNOLOGIESINC.",
        "VISUALASERMODELMAKER",
        "VIVAMACHINERYSALES",
        "W.V.NEWDAVAOGOLDSTARHARDWARECO.,INC.",
        "WARDENMARKETING&CONSTRUCTION",
        "WEAREI.T.PHILS.,INC.",
        "WELDINDUSTRIAL&HARDWARESUPPLY",
        "WELDENDIESELCENTER",
        "WESTPOINTINDUSTRIALSALESCO.INC.",
        "WHEELS INC.",
        "WILCONBUILDERDEPOT",
        "WILCONBUILDER''SSUPPLY,INC",
        "WILCONHOMEESSENTIALS,INC.",
        "WILLEXPRINTING",
        "WIRE ROPE CORPORATION OF THE PHILIPPINES",
        "WOODBRIDGECOMMERCIAL&INDUSTRIALSUPPLYCORP.",
        "WORLDWIDEOUTBOXEXPRESSINC.",
        "XD-EVERTRANSFORMERSERVICECORPORATION",
        "XELENTLOGISTICS,INC.",
        "ZEPPELINOSTERREICHGMBH",
        "ZOLLNERINTERNATIONALMERCHANDISING",
        "MALVAR HARDWARE & CONSTRUCTION SUPPLY",
        "N.R. SIPHONING POZO NEGRO & PLUMBING SERVICES",
        "HQC BUILDING EQUIPMENTS CORPORATION",
        "RHODECO RUBBER PROCESSING SERVICES INC.",
        "GO FIX DIGITAL PRINTING",
        "SOUTHERN SUN TRADING",
        "M.C. LANDICHO CONSTRUCTION BUILDERS AND SUPPLY",
        "EVANS HARDWARE AND CONSTRUCTION SUPPLY",
        "BRYAN''S GARDEN",
        "AXIS MEG ENTERPRISES",
        "THINK SAFE  ENTERPRISES",
        "LJ INDUSTRIAL FABRICATION, INC.",
        "B.A. TAPIA SHUTTLE SERVICE",
        "HAYANE MARKETING CO.",
        "VIAN-ALDWIN ENTERPRISES",
        "JUHEN TRADING",
        "FERNANDO P. QUILILAN",
        "ALAI ENVIRONMENT''L SERVICES INC.",
        "COFFRAL ACCESS AND SHORING INC.",
        "HAKSAN INTERNATIONAL PHILS INC.",
        "RMR ELECTRIC CORPORATION",
        "KINDEN PHILS. CORPORATION",
        "POINTER ENTERPRISES INC.",
        "S.G.C. MOTOR WORKS",
        "DEODEN MAGCAWAS",
        "VLRS PHIL. BUILDERS., INC.",
        "SOTERIA MARKETING INC.",
        "HARD WORKS FOUNDATION ENGINEERING AND CONSTRUCTION SERVICES",
        "J & B BACOLOD HDPE PIPES",
        "777 KAPUSO LABOR SERVICES COOPERATIVE",
        "RBER INDUSTRIAL & TRADING CORPORATION",
        "METRO CONSTRUCTION INC.",
        "TC FLORENTIN ELECTRO SYSTEM BUILDERS CORPORATION",
        "HEXAGON BOLT CENTER CORPORATION",
        "PHILVENT INDUSTRIAL CORPORATION",
        "METRO FASTENERS & INDUSTRIAL SUPPLY",
        "FIBERCOM TELECOM PHILS., INC.",
        "HYPRIME MANPOWER SERVICES PROVIDER INC.",
        "SOLAR ICE ENTERPRISES",
        "NORFOLK INTERNATIONAL INCORPORATION",
        "CASEDIST INC.",
        "MACNIT BUILDERS AND REAL ESTATE DEALER",
        "BASALO SAND & GRAVEL HAULER",
        "EXPROTECH MARKETING",
        "KITCHEN MALL CORPORATION(KMC)",
        "AGP CORPORATION",
        "MULTI-ROCK READY MIX CONCRETE INC.",
        "EV HERNANDEZ TRADING",
        "AYKRAND TOOLS & EQUIPMENT TRADING & SERVICES",
        "GOLDEN STATE ALUMINUM GLASS & GENERAL MERCHANDISE",
        "SOFTLINK CONSTRUCTION & DEVELOPMENT INC.",
        "CLARITO V. CORDERO",
        "DELFIN FAJARDO JR.",
        "JMN CONSTRUCTION SERVICES",
        "JEFF SAN LUIS ENTERPRISES",
        "SMARTBRO",
        "ARSOLITA DE CASTRO",
        "MEDELYN VIVAS",
        "BODY LIFT WATER",
        "ARNOLD CABILTES",
        "PROPRIMEX INDUSTRIAL TRADING",
        "RMP CONSULTANCY",
        "INTEGRATED SECURITY & AUTOMATION INC.",
        "HYATT ELEVATORS & ESCALATORS CORPORATION",
        "PEPITO E. LUNA",
        "LIMA PARK HOTEL INC.",
        "MALABANAN,TEODORO",
        "TERAVERA CORPORATION",
        "JAVAREZ, JAMERO R.",
        "OCTAVIO BERNARDO",
        "RUNWAY TRANSPORT",
        "FIRST MEKONG DELTA INC.",
        "CHUAN HING METAL FABRICATOR CORPORATION",
        "JE''S AUTO SUPPLY",
        "SHINRYO (PHILIPPINES) COMPANY, INC.",
        "VILLANUEVA, GLENDA B.",
        "TASICO, PABLITO L.",
        "MAC ALPHA OMEGA INDUSTRIAL SALES INC",
        "JHUN BLOCKS MAKER",
        "A&F GREEN ELECTRIC TECHNOLOGIES, INC.",
        "UNIVERSIGNS ENTERPRISES",
        "CHRONICLES ELECTRONICS CORP.",
        "BONIFACIO PADILLA",
        "YANGA, AMANDO S.",
        "SKAFF CONSTRUKT INC.",
        "CONTECH CONCRETE PRODUCTS INC.",
        "JMS CONCRETE PRODUCTS",
        "FUN4PIX PHOTOBOOTH",
        "FACILITIES PROTECTION INC.",
        "JVF COMMERCIAL AND PROJECT DEVELOPMENT SUPPORT SVS.",
        "ATLAS METAL INDUSTRIES",
        "RODELAS BUILDERS AND SUPPLY",
        "JOSE N. BURDEOS JR.",
        "AMELIA L. REYES",
        "FCIE ASSOCIATION INC.",
        "THE INSULAR LIFE ASSURANCE COMPANY LTD.",
        "AQUABEST WATER REFILLING STATION",
        "SUSANA ANORE CERTEZA",
        "FIL CONVEYOR COMPONENTS",
        "R.V. MARZAN LOGISTICS INC.",
        "ICE-PVE ASIA PTE. LTD.",
        "JONATECH ELECTRICAL POWER CONTROL SYSTEM INC.",
        "BRGY. SAN LUCAS",
        "CONICA PHILLIPINES, INC.",
        "ARIZONA GEO-SYNTHETICS INC.",
        "MARIE PAZ B. CLOSA",
        "RANIA CIVIL ENGINEERING SERVICES",
        "IMACON ENGINEERING SERVICES AND TRADING",
        "LAH CONSTRUCTION SERVICES",
        "CT-TECHNOLOGIES APS",
        "KC INDUSTRIAL LIMITED",
        "PUMP PRO CONCRETE MACHINERY CORP",
        "RTS TOOLMAKER TECHNOLOGY",
        "TLC ENTERPRISES",
        "ARVYN CONSTRUCTION INCORPORATED",
        "JANE BAYDO",
        "BENITEZ SALEM BALDONADO LAW FIRM",
        "PALAWAN ELECTRIC COOPERATIVE",
        "FIL-NIPPON TECHNOLOGY SUPPLY INC.",
        "TOYOTA CALAMBA LAGUNA INC.",
        "ANNABELLE S. OCAMPO",
        "ALEX SORIANO",
        "JULIE EVE P. MOSCA",
        "CLEAN WORLD TRADING & SUPPLIES INC.",
        "KJL COMPUTER ENTERPRISES",
        "JER TEC''S CONSTRUCTION CORPORATION",
        "EAGLEWATCH SECURITY SERVICES",
        "GLOBAL HEAVY EQUIPMENT & CONSTRUCTION CORP",
        "FIRST ASIA READY MIX CORPORATION",
        "HAIDEE H. HERNANDEZ",
        "BETAYAN, ROGELIO",
        "WORLD HOME DEPOT CORPORATION",
        "REBECCA NAJEEBA CONSTRUCTION & DEVELOPMENT",
        "HERIBERTO E. MARCELINO",
        "EVELYN TG JIMENEZ",
        "JULIAN G. RODRIGUEZ",
        "DELIA P. HINGGAN",
        "ALLEN TOURS AND TRANSPORT SERVICES",
        "MICROTRADE GCM CORPORATION",
        "ANGARA ABELLO CONCEPCION REGALA & CRUZ LAW OFFICES",
        "ALCAZAR, JAN CARLO C.",
        "SOFITEL PHILIPPINE PLAZA MANILA",
        "SBDMC, INC.",
        "MILLEUM TRAVEL CORPORATION",
        "NIDA C. FRANCISCO",
        "TREASURER''S OFFICE MUNICIPALITY OF BINANGONAN",
        "ENDERUN COLLEGES, INC.",
        "NATIONWARE MARKETING SERVICES INC.",
        "CALOOCAN GAS CORPORATION  (BATANGAS BRANCH)",
        "PLDT SUBIC TELECOM, INC.",
        "MIDTOWN PRIME HEALTH CARE",
        "DR. MARIQUIT MAGTOTO",
        "YRAMAR TRADING",
        "LAGUNA DIAGNOSTIC CENTER",
        "DFT ORGANIZER & PROMOTIONS",
        "BARCELONA, JIFFY E.",
        "DENNISON W. LIM",
        "J ROSALES CONSTRUCTION SERVICE",
        "PRIME PLUS READY MIX INC.",
        "JAN & GEL ENGINEERING & AUTOMOTIVE WORKS",
        "ALMEREZ MARKETING",
        "GEORGE CONTRERAS",
        "CT-TECHNOLOGIES INC.",
        "MEGA PACKAGING CORPORATION",
        "EOI PACKAGING SUPPLY CORP.",
        "ORCHARD LADY GOLFERS ASSOCIATION",
        "ASSOCIATION OF CARRIERS AND EQUIPMENT LESSORS INC.",
        "TURBLADES PHILS. INC.",
        "RACHEL SHARON O. TUNGOL",
        "BIG ORTIGAS CONSTRUCTION AND ELECTRICAL SUPPLY CO.",
        "PR360",
        "STEPHEN STONE GRAVEL AND SAND",
        "FERNANDO QUILILIAN",
        "PHILIPPINE CONSTRUCTOR ASSOCIATION INC.",
        "UNISUN DEVELOPMENT COMPANY",
        "MESA, VIVIAN R.",
        "TG & P VENTURES",
        "CITY TREASURER''S OFFICE OF MAKATI",
        "PRUDENTIAL GUARANTEE & ASSURANCE INC.",
        "ISHIDA PHILIPPINES GRATING CO., INC.",
        "ALTHEA CONCRETING SERVICES",
        "PRIME WORLDWIDE PAPER PACKAGING CORPORATION",
        "TEJADA, GAY S.",
        "PROCESS MACHINERY COMPANY INC.",
        "SKYMIX READY CONCRETE INC.",
        "CAMARIHWOOD TRADING CORPORATION",
        "AB & T RESOURCES, INC.",
        "GLECELIA C. SEGARRA",
        "SAGITTARIUS 8DA* MARINE SERV.",
        "JEGAZ ENTERPRISES",
        "ISIDRO ANLICAO",
        "GRAVELDEN INC.",
        "PACULDAR, ROXANNE STA ANA",
        "BELINDA A. DE JESUS",
        "MYRA P. CONCEPCION",
        "LORD C. PEREZ",
        "UKUSA INC.",
        "ROBERT SAN JOSE",
        "MICHAEL SAQUITAN",
        "IFE ELEVATORS PHILIPPINES INC.",
        "BALAMBAN CONSTRUCTION & MARINE SERVICES LTD. CO.",
        "RIZAL GAS CORPORATION",
        "ZHEJIANG CERTEG INTERNATIONAL CO.,LTD",
        "CEBU IRON FOUNDRY CORPORATION",
        "GOLDCREST SERVITRADE INC.",
        "MIMOSA CITYSCAPES, INC.",
        "ALI ANVAYA UTILITIES",
        "CORPUZ, JERRY",
        "TAN, RACHEL S.",
        "OLONGAPO ELECTRICITY DISTRIBUTION COMPANY, INC.",
        "CAGAYAN ISUZU CENTER",
        "SINOTRUK JINAN SALES & SERVICES CO. LTD",
        "WESTMONT INDUSTRIAL SALES INC.",
        "DE CASTRO MEDICAL CLINIC",
        "KEE SAFETY SINGAPORE PTE LIMITED",
        "WYN POWER CORPORATION",
        "GLOBAL-LINK MP EVENTS INT''L. INC.",
        "DAVE''S SATELLITE LINK",
        "ADVANCE ENVIRONMENTAL CONTROL, INC.",
        "TOTAL (PHILIPPINES) CORPORATION",
        "HOFFSMAN SYSTEMATIC DESIGNS, INC.",
        "KIRBY SOUTHEAST ASIA CO., LTD.",
        "LJM INDUSTRIAL SAFETY PRODUCTS",
        "MOST HIGH ENTERPRISES",
        "ARB INDUSTRIAL SUPPLY",
        "GRACE PASCUA",
        "CENTER POINT BUILDERS SUPPLY",
        "INTEGRATED COMPUTER SYSTEMS, INC.",
        "PREMIER SHELTER PRODUCTS, INC.-CDO",
        "H.M. ALAPIDE GRAVEL AND SAND SUPPLIER",
        "LIMA ENERZONE CORPORATION",
        "PREMIER SHELTER PRODUCTS, INC.-PANGASINAN",
        "TOLBO, MERCEDES D",
        "MODELE CONCEPTS COMMERCIAL CORPORATION",
        "KAIPING INTERNATIONAL CORPORATION",
        "ALARM TECH PHILS. CONSTRUCTION DEV. CO.",
        "SAMMY M. OLAES",
        "JOSEFINA B. BUMANLAG",
        "SBZ CONSTRUCTION SUPPLY",
        "RAKK SOO INC.",
        "PABCA ENTERPRISES",
        "CARGEM MANAGEMENT CORPORATION",
        "OHANA KONSTRUCT INC.",
        "BRUCE/KING CONSTRUCTION",
        "INKOTE PHILS., INC.",
        "ROSSAN D. MONSALUD",
        "CUERVO APPRAISERS INC.",
        "AGUILA, MERLITA O.",
        "J-MAT ENTERPRISES",
        "AXIS MEG PETROLEUM CORP.",
        "ENGINEERING CONSTRUCTIVE SOLUTIONS (ECS)",
        "COFCAVILLE ARTWORKS",
        "TOKWING INFINITE READY MIX CONCRETE PRODUCTS, INC.",
        "A AND N CONSTRUCTION SERVICES AND SUPPLIES",
        "BPRD SUBIC LEISURE CORPORATION",
        "JULANT PEST CONTROL SYSTEMS, INC.",
        "PHILIPPINE CONTRUCTORS ASSOCIATION",
        "DUN & BRADSTREET PHILIPPINES, INC.",
        "ARNEI G. JAEL",
        "ANNIE SD YAO TRADING",
        "BACHELOR''S REALTY & BROKERAGE INC.",
        "BATANGAS II ELECTRIC COOPERATIVE, INC.",
        "REMALITA S. PINEDA",
        "ALPINE SYSTEMS CORPORATION",
        "DXE MARKETING",
        "MAPECON PAMPANGA INCORPORATED",
        "FIREWALL FIRE EXTINGUISHER",
        "ENTOM PEST CONTROL & GENERAL SERVICES CORPORATION",
        "INFRATEX ENVIRONMENTAL SERVICES, INC.",
        "RN HERNANDO CONSTRUCTION SERVICES",
        "MEDIT INC.",
        "LODI LEE",
        "CALOOCAN GAS CORPORATION (OLONGAPO BRANCH)",
        "RAMON DEL MONTE",
        "FIRST-AVPR VENTURE, INC.",
        "ECA QUARRYING AND TRADING",
        "ELVA GALLO MAGNO",
        "ILAYA METAL WORKS AND ROOFING SERVICES CO.",
        "RODERICK SEVILLA.",
        "ARNEL MORALES",
        "V. N. MENDOZA TRADING",
        "SOIL EXPLORATION AND GEOTECHNICAL CONSULTANCY CO.",
        "QINGDAO NEW HOPE INDUSTRY AND TRADE CO., LTD",
        "TIKE-EE ENTERPRISE",
        "TRI-STAR PAINTS CENTER AND MARKETING CORPORATION",
        "CARDONA MULTI-PURPOSE COOPERATIVE",
        "MAHABANG PARANG MULTI-PURPOSE COOPERATIVE",
        "PABIES TRADING",
        "BRIZAL, WILFREDO JR N.",
        "KENWA MICOM PHILIPPINES INC.",
        "THE LAW FIRM OF YANGCO & PASTOR CO.",
        "UNIFIED MULTIPURPOSE COOPERATIVE",
        "WILLI HAHN ENTERPRISES",
        "SUBIC WATER & SEWERAGE CO. INC.",
        "CS & T SUBIC, INC.",
        "NIPPON-TECH BUILDERS",
        "KING SON CONSTRUCTION SUPPLY",
        "CHARTER PING AN INSURANCE CORPORATION",
        "TOMAS P. LALOON",
        "CONSTRUCTION INDUSTRY AUTHORITY OF THE PHILIPPINES",
        "MANASES R. CARPIO",
        "DE BELEN, MATYLINE A.",
        "JONATHAN DELA CRUZ",
        "GEOTECHNICS PHILIPPINES, INC.",
        "ROGELIO UYBAAN",
        "SYNERGY SALES INTERNATIONAL CORP.",
        "BLACKHAWK TRADING",
        "ASIAN-RELIANCE INDUSTRIAL ENGINEERING SUPPLIES",
        "GERE ENTERPRISES",
        "HYPRIME MANPOWER SERVICES PROVIDER, INC.",
        "ANCHOR STEEL IND''L CORP.",
        "BRAAMD INC.",
        "CABALLERO, EILEEN C.",
        "MANUEL A. OLAPANI",
        "P.M. SILANG CONSTRUCTION SERVICES",
        "RAMON HAT STORE & GEN. MDSE.",
        "BALDOMERO L. AGUILERA",
        "MAVEN EFFECTIVE SOLUTIONS CO.",
        "TOKS AQUINO",
        "JOVEL M. CUARESMA",
        "PMA MAGILAS CLASS ''76 ASSOCIATION, INC.",
        "PSTD FOUNDATION, INC.",
        "JB MERCHANDISING INC.",
        "A.L. LLANES TRADING",
        "ASD PIPEPLAST SUPPLY AND SERVICES INC.",
        "YNARES, ELVIRA R.",
        "STA. CATALINA TRADING & CONSTRUCTION",
        "DREAMHAUZ MANAGEMENT AND DEVELOPMENT CORPORATION",
        "TOYOTA LIPA BATANGAS INC.",
        "GREYSTONE ASIA RESOURCES INC.",
        "THE MEDICAL CITY",
        "RICHARD FABROS",
        "DELIA GALICIA",
        "PHILIPPINE INSTITUTE OF SUPPLY MANAGEMENT, INC.",
        "HEAVENLY SPARE PARTS TRADING",
        "PREMIER PHYSIC METROLOGIE CO.",
        "SENTRI FLOW PUMP SYSTEMS TRADING AND SERVICES",
        "HEDCOR SABANGAN, INC.",
        "A-TWENTY SIX TRADING",
        "JN BER HEAVY EQUIPMENT RENTAL",
        "MARNEY INDUSTRIES CORPORATION",
        "DARWISH TRADING CO. WLL",
        "MANDALUYONG GOLF CLUB, INC.",
        "HEREDIANO, FELMAR C.",
        "CERNA, NANETTE D.",
        "URGELLES, WILMA C.",
        "JANE MARK REFRIGERATION &",
        "AIRCONDITIONING S",
        "GMA CONSTRUCTION AND CONSTRUCTION SUPPLIES",
        "KENWA CO., LTD.",
        "DEMATE, MARILYN C.",
        "UNIVERSAL TECHNO PIPING CORPORATION",
        "JCL TRUCKING SERVICES",
        "A. RIVERA CONSTRUCTION",
        "DAYANAN MACHINE SHOP",
        "ROLANDO L. OFREN",
        "RUEL M. ATIENZA",
        "BLR MACHINE SHOP & ENGINE REBUILDING INC.",
        "JEANICA HYDRAULIC TRADING",
        "ARM-G INTERNATIONAL LOGISTICS INC.",
        "ISLAND AIR PRODUCTS CORP.",
        "DUE EMME TRUCKING SERVICES",
        "ROMEL R. LIBRES CONSTRUCTION SUPPLY",
        "SYNERQUEST MANAGEMENT CONSULATNCY SERVICES INC.",
        "PEOPLE DYNAMICS, INC.",
        "PRIMITIVA L. AQUINO",
        "UNIHEALTH-BAYPOINTE HOSPITAL & MED. CENTER, INC.",
        "MEGA SOUTH HARDWARE & CONSTRUCTION SUPPLY CORP.",
        "THIRTEEN TEN GENERAL MERCHANDISING",
        "STERLING TRADE & DISTRIBUTION GROUP INC.",
        "TOP BRASS BUILDING SOLUTIONS INCORPORATED",
        "MARKVIN GLASS AND ALUMINUM CONTRACTOR",
        "MERLITA M. TUPAZ",
        "ANGLOM AUTOMOTIVE & INDUSTRIAL SUPPLY CORP.",
        "MIGOY BUGOY ENTERPRISES",
        "PPL TRADING AND CONSTRUCTION",
        "BUSINESS PROCESS OUTSOURCING INTERNATIONAL, INC.",
        "ADOBE DESIGN GRAPHICS, INC.",
        "PRINCE KAISER TRADING",
        "2KT MARKETING",
        "HYMETOCEAN PEERS CO.",
        "PINAGPALA PT AGGREGATE CORP.",
        "PETRO DE ORO CORPORATION",
        "J.S. TANAEL JR. TRADING AND HAULING SERVICES",
        "RCNA CONSTRUCTION AND SUPPLY",
        "I. MARCELO BUILDERS INC.",
        "DOXA TRUCKING SERVICES",
        "TREASURE ISLAND INDUSTRIAL CORPORATION",
        "NORTHERN MINDANAO MARICULTURE VENTURES & DEV''T CORPORATION",
        "SYBLINGS STEEL AND HARDWARE CORPORATION",
        "BOLENBACH MARKETING CORP.",
        "JUNANGIE CONCRETE BLOCKS",
        "GBM CONCRETE PRODUCTS-MANUFACTURING & TRADING CORP",
        "JUMAN ELECTRICAL AND INDUSTRIAL SUPPLY CORP.",
        "CNB MACHINERY AND STEEL CORP.",
        "ORO OXYGEN CORPORATION",
        "MADERA LIFESTYLE CONCEPTS INC.",
        "YNM ENTERPRISE",
        "FAST CORE FILIPINAS CORPORATION",
        "YUTYCO ELECTRIC INDUSTRIES, INCORPORATED",
        "IMAC UPVC ROOF CORPORATION",
        "DIAGNOSTICS & MAINTENANCE TECHNIQUE, INC.",
        "EURL GEMAT",
        "FOXCHEM DEVELOPMENT INC.",
        "OCEANIARE GENERAL CONTRACTING CORP.",
        "RECE BUILDING SOLUTIONS, INC.",
        "WAREMA INTERNATIONAL GMBH",
        "JOHANNA MA PAOLA EUTHROPIA CAOILI AGUIRRE",
        "EBARLE SAND & GRAVEL VENTURES",
        "JIED MACHINE SHOP",
        "PROVINCIALÿGOVERNMENTÿOF ISABELA",
        "CC ALIPIO ENGINEERING WORKS",
        "RONMARK CONSTRUCTION",
        "METRO SAFE AND VAULT MANUFACTURING CORPORATION",
        "GOLDEN MILE ENTERPRISES",
        "UNITED CONCRETE TECHNOLOGIES PHILS. INC.",
        "TOP STAR MIX READY CONCRETE INC.",
        "BARRINGTON CARPETS, INC.",
        "DONPIN CORPORATION",
        "PHILIPPINE & SCANDINAVIAN DESIGN FILTRA, INC.",
        "GEANAUX SYSTEMS CORP.",
        "AMSTEEL STRUCTURES, INC.",
        "KAMEE SEH CONSTRUCTION INC.",
        "L.J. MARBLE & CONSTRUCTION SUPPLY",
        "PACIFICSTAR TRANSPORT SERVICES CO.",
        "PLUS BUSINESS SOLUTIONS",
        "JOVINAR BUILDING MATERIALS & CONSTRUCTION",
        "AQUAJEM INDUSTRIAL CORPORATION",
        "STEPHEN TAN CONSTRUCTION",
        "BAUER CONSTRUCTION AND SUPPLIES",
        "ALOU ENGINEERING SERVICES",
        "IBUILD CONSTRUCTION SOLUTIONS INC.",
        "THEODON SHUTTLE SERVICES",
        "JPM VEHICLE ARMORING SERVICES",
        "ANSONY CORPORATION",
        "SEA OLYMPUS MARKETING INC.",
        "VALUE PRINTING SOLUTIONS",
        "DDC COOLMAKERS & POWER BUILDERS CORP.",
        "ZAKRAH INDUSTRIAL ENGINEERING & CONSTRUCTION",
        "WEATHERTECH REFRIGERATION & AIRCON CO.",
        "AEP CONSTRUCTION AND SERVICES, INC.",
        "A.R.T. METAL FABRICATION",
        "COLORS AND SHADES PAINTING CONTRACTOR",
        "HAP SUY SOLUTIONS INC.",
        "JOHN B & L TRADING",
        "L.B. LEONCIO TRADING & CONSTRUCTION",
        "AMARSICAT ENTERPRISES",
        "JFR ENTERPRISES",
        "M&S ELECTRICAL CONTRACTING & TRADING",
        "PINNACLE DISTRIBUTORS, INC.",
        "CASSID CORPORATION",
        "STEALTH VENTURES CORPORATION",
        "DAVIES PAINTS PHILIPPINES INCORPORATED",
        "MEGAWATTS ELECTRICAL SUPPLY AND DISTRIBUTION INC.",
        "OYAEST AND ROCKTECH INC.",
        "GRACE G. RAFAEL",
        "CHAD LOURENCE TRADING & CONSTRUCTION SERVICES",
        "PACIA WELDING SHOP",
        "AMPACITY MARKETING COMPANY",
        "J.M. SANVICENTE TRUCKING SERVICES, INC.",
        "ACAR",
        "CM RECTO AUTO SUPPLY CO., INC",
        "ESPA¥OLA MACHINE SHOP",
        "HARDWARE CENTRE CEBU INC.",
        "HOPPS ENGINEERING PRODUCTS AND SERVICES",
        "IGNACIO D. GRAJO JR.",
        "MURAHAMA TRUCKPARTS CENTER",
        "NEW EZ-KLEEN PORTALET CORP.",
        "PHILIPPINE DIESEL CALIBRATION COOPERATIVE",
        "SKI CONSTRUCTION GROUP, INC.",
        "UNIPIPE PHILIPPINES INC.",
        "VICTOR HUGO ENERGY CORP.",
        "ZAIDA COBIN",
        "ALPINE OPUS TECHNOLOGIES CORPORATION",
        "EG4 TRADING",
        "VARIOUS SUPPLIER",
        "DUL TRUCKING AND AGGREGATES",
        "DSMA AUTO SUPPLY",
        "INTERNATIONAL STAINLESS  PRODUCT MANUFACTURING CORP",
        "CHARTER EXPRESS OF THE ORIENT, INC.",
        "ARENEY CONSTRUCTION SERVICES",
        "GADGETWORKS CORP.",
        "KAIZEN E & M CORPORATION",
        "FIVE SIXTEEN WELDING SHOP",
        "PABETH CONSTRUCTION",
        "GSG STEEL WORKS AND GENERAL SERVICES",
        "DORMA PHILIPPINES CORP.",
        "ALROS ENTERPRISES",
        "LIQUIONE ENTERPRISES CORP.",
        "ROMUALDO, JESUS JR N.",
        "J-AR TRADING & CONSTRUCTION",
        "ROLLWAY FREIGHT & SHIPPING AGENCIES CORP.",
        "TIMOTEO B. MARTINEZ",
        "MAGELLAN RESOURCE AND CONSULTANCY SERVICES",
        "CI-CAP GLASS & ALUMINUM SUPPLY",
        "RED GIANT AGGREGATES",
        "ANHAMM LIQUID BARRIER PRODUCTS GMBH",
        "PRIOMETAL MINDANAO CORPORATION",
        "AR 2016 TRUCKING SERVICES",
        "ORO NQA ENTERPRISES CORPORATION",
        "JADE TEXAS GASOLINE STATION",
        "PROBUS BUSINESS CONSULTING",
        "SUPER MILER SALES CORPORATION",
        "FELIX S. MACAPAGAL",
        "YPDR TRADING",
        "ASAHI GROUP INTERNATIONAL CORPORATION",
        "CARMEL BUILDERS",
        "JOHN DEO HARDWARE & GENERAL MERCHANDISE",
        "NORTH CAST CONSTRUCTION TRADING AND DEVELOPMENT CO.",
        "SITEC GMBH",
        "COMMODORE TRANSPORT SERVICES",
        "JL CABANDUCOS IRON WORKS",
        "MORSE TECHPRO SPECIALIST CORPORATION",
        "VDM GLASS AND ALUMINUM SUPPLIES AND SERVICES, INC.",
        "SOUTH EAST AUTO GAS CORP.",
        "BOSTIK PHILIPPINES INC.",
        "TOYOTA COMMONWEALTH, INC.",
        "DORFLEX AUS PRODUCTS CORPORATION",
        "EE. SANTIAGO SUPPLY AND CONSTRUCTION",
        "EFAFLEX TOR- & SICHERHEITSSYSTEME GMBH & CO. KG",
        "GABRIEL''S ENGINEERING WORKS",
        "TABLAC ENTERPRISES",
        "OVE ARUP & PARTNERS HONGKONG LTD (PHIL. BRANCH)",
        "INGGEL GRAVEL AND SAND",
        "PAR-BE LUMBER AND CONSTRUCTION SUPPLY INC.",
        "CA¥ADA EXCAVATION AND PLUMBING SERVICES",
        "GLENDA M. LUCERO",
        "MONIMAR M. PARANADA",
        "DOC ARCHITECTURAL GLASS SUPPLY, INC.",
        "JR JUAN DESIGN AND KONSTRUKT",
        "DCCD ENGINEERING CORPORATION",
        "ABRPHIL CONSTRUCTION AND DEVELOPMENT CORPORATION",
        "CARMAK MOTORS CORPORATION",
        "ECV OFFICE SUPPLIES WAREHOUSE INC.",
        "SHANDONG WENYUAN ENVIRONMENTAL TECHNOLOGY CO., LTD.",
        "TOYO CONSTRUCTION CO., LTD.",
        "PSRIF ENTERPRISES",
        "OMNIBRAIN ENTERPRISE",
        "CENTROTEST ASIA INC.",
        "DALAGUIT, LUCINO L. SR.",
        "XACT PRINTING SERVICES",
        "DMRC CONSTRUCTION",
        "ALEXANDER ENGINEERING AND MACHINERIES SERVICE",
        "FIREPROFESSIONALS (FIREPRO) INC.",
        "JEM 8 CIRCLE TRADING CO.",
        "AEROVENT FANS AND BLOWERS MANUFACTURING",
        "JEICCA ENTERPRISES",
        "LOY''S LANDSCAPING AND ORNAMENTAL COLLECTION",
        "TOYOTA MAKATI INC.",
        "BOBBY S. YU",
        "OPTIMUM EQUIPMENT MANAGEMENT & EXCHANGE, INC.",
        "MATE''S TRADING",
        "WILCON DEPOT, INC.",
        "TOYOTA ALABANG, INC.",
        "PRIMOGPS DEVICES TRADING",
        "SINBAD BUILDERS",
        "COMPUCARE CORPORATION",
        "YUTIVO CORPORATION",
        "EPARTNERS SOLUTIONS, INC.",
        "SANDY PAR BATCHING PLANT CORPORATION",
        "DO-MORE-RESULT BUILDERS",
        "MARVIN SECURITY, INVESTIGATION & ALLIED SERVICES",
        "ACONEX (PHILIPPINES) INC.",
        "YANAGAWA SHOJI CO., LTD.",
        "AVK PHILIPPINES, INC.",
        "WORLDWIDE UPHOLSTERY & CANVASS TRADING INC.",
        "YMO CORPORATION",
        "G KONSULT WATER INC.",
        "TERABIT COMPUTER SYSTEMS CORPORATION",
        "PCWORX I.T SOLUTIONS INC.",
        "NVH ENGINEERING AND SERVICES",
        "KIRIN RESOURCES INC.",
        "RJAC CONSTRUCTION,TRUCKING & EQUIPMENT RENTAL CORPORATION",
        "AMBAGUIO BUILDERS",
        "POWERCON ENGINEERING SERVICES",
        "ELECTROCRAFT TECHNOLOGY & TRADING CO.",
        "PHIL-NIPPON KYOEI CORPORATION",
        "MARC J TRADING & HARDWARE INC.",
        "SPIRA SALES CORPORATION",
        "TIMBERPORT ENTERPRISES",
        "24/7 STRAIGHTLINE CONSTRUCTION CORPORATION",
        "FJMB ECOLUX TRADING CORPORATION",
        "LACHICA CONSTRUCTION SERVICES",
        "ABDA CONSTRUCTION INC.",
        "AGGREKO ENERGY RENTAL SOLUTIONS INC.",
        "MEGA MORE HARDWARE & CONSTRUCTION SUPPLY",
        "GLOBALBUILD DEVELOPMENT CORPORATION",
        "J.V. GABRIEL ELECTRICAL ENTERPRISE",
        "NORTHERN STAR ENERGY CORPORATION",
        "RODGE JULIENNE ENTERPRISES",
        "NADEN ENTERPRISES",
        "CROWN ASIA CHEMICALS CORPORATION",
        "CHEMPRO ANALYTICAL SERVICES LABORATORIES INC.",
        "CORNERSTONECONSTRUCTION CORPORATION",
        "VIRGILIO LUMANGTAD MANINGO",
        "CITYTECH STEEL FABRICATION INC.",
        "MULTI ARTWORKS AND SIGNAGES",
        "PHD MEDIA NETWORK 2006, INC.",
        "MULTI-LINE BUILDING SYSTEM INC.",
        "AV SANTOS CONSTRUCTION",
        "GLD DESIGN AND BUILDERS",
        "JODER TRADING",
        "HULS TECHNOLOGIES INTERNATIONAL LIMITED",
        "D SQUARED TECHNOLOGY INC",
        "CEGI ENTERPRISES",
        "ROCKETSHIP CREATIVE DESIGN SERVICES CO.",
        "ACPC TRADING",
        "1758 CONSTRUCTION SERVICES AND SUPPLY",
        "FLOORCOMPANY INC.",
        "JBW FLOORCENTER, INC",
        "GD-EX DIESEL CALIBRATION",
        "CHEMFOUR INCORPORATED",
        "GRAN STRATMAN INDUSTRIES INC.",
        "ATLAS CONCRETE WORKS (ACW) INC.",
        "TOYOTA GENERAL SANTOS, INC.",
        "TRACKSTAR ENTERPRISES CORPORATION",
        "SURYA SOURCE ENERGY INC.",
        "J.E.M 88 CONSTRUCTION DEVELOPMENT CORP.",
        "ACO PTY LTD",
        "GEORGE FISCHER PTE LTD",
        "ELEKTRO WERK INCORPORATED",
        "JUSTRIGHT RESOURCES DEVELOPMENT (JRD) CORP.",
        "FIVE EMPERORS INCORPORATED",
        "JBRANCE BUILDERS",
        "ADVANCE SUBURBAN FACILITY SERVICES CORP.",
        "PARTSERV EQUIPMENT PTE LTD",
        "GREENFLOOR INNOVATIONS CORPORATION",
        "VALVETEK TRADING",
        "ZAB ENTERPRISES INC.",
        "RICHARD AND ROSABEL ENTERPRISES",
        "GOLDEX MANUFACTURING & TRADING CORP",
        "ESE SIGNEX SIGN EXPRESS INC.",
        "EXEKIEL BUILDERS & MACHINERY INC.",
        "QINGDAO MUNICIPAL CONSTRUCTION GROUP CO.,LTD",
        "TOZEN PHILIPPINES INC.",
        "KIKOPORDS TRUCK PARTS TRADING",
        "THE TILEEXPO TRADING INC.",
        "ZENITH TECHNOLOGY, INC.",
        "JEREMIAS F. AGBALOG",
        "FEDDAIRE SALES & GENERAL SERVICES",
        "ALLGEMEINE BAU-CHEMIE PHIL., INC.",
        "GATHERGATES ELECTRIC PHILIPPINES CORPORATION",
        "AQUATRADE AND INDUSTRIAL DEVELOPMENT CORPORATION",
        "CADDSOLUTIONS INC.",
        "FRANCISCO SUNGA SAND QUARRY",
        "LARA''S MERCHANDISING",
        "MAKATI FOUNDRY, INC.",
        "J.P. LOZADA ENGINEERING",
        "J.A. PAGULAYAN GRAVEL & SAND",
        "DOUBLE EIGHT HARDWARE",
        "BALZAIN AUTO PARTS CENTER",
        "MUNACO INDUSTRIAL SALES INC.",
        "CRISANTO DALOGDOG CAPA",
        "PAT PAT WOODCRAFT",
        "INDUSTRAMACH INC.",
        "RAMAPLUS FURNITURE",
        "WALLCROWN DESIGN CENTER INC.",
        "JOEL V. UANANG",
        "QUADROCAS CORP.",
        "EUROASIA MARABLE & GRANITE INC.",
        "TRADIENT MARKETING",
        "RPM BUSINESS SOLUTIONS",
        "TRI-RON STAINLESS STEEL",
        "CROWNMIX CORPORATION",
        "CUT & BREAK DIAMOND PRODUCTS INC.",
        "JOTUN (PHILIPPINES) INC.",
        "UPTIME EARTHMOVING SOLUTIONS INC.",
        "MEGAEAST POWER CONSTRUCTION CORPORATION",
        "ARCENAL CAR CARE CENTER",
        "I-CONSTECH CONSTRUCTION & GEN SERVICES CORP.",
        "YAPOT CONSTRUCTION",
        "3-TECH INNOVATION MASTER CORP.",
        "TRACERLINE TECHNOLOGIES INC.",
        "DIAMOND OFFICE FURNITURES INC.",
        "EN-TIRE CAR CARE CENTRE, INC.",
        "FILIPINA CACATIAN BARNACHEA",
        "JBB ALUMINUM INSTALLATION SERVICES",
        "DBBS TRADING",
        "GALA GALA ELECTRICAL,MECHANICAL,ENGINEERING SERVICES AND SUPPLY",
        "TAISHAN EQUIPMENT RENTALS INC.",
        "FILIPINAS ASIA GLASS AND DOOR CORPORATION",
        "PHILIPPINE PURE ENERGY SOLUTIONS INC.",
        "D8KATANA INDUSTRIAL SUPPLIES",
        "FIRST AND FINEST TECHNOLOGY CORP.",
        "JP NELSON EQUIPMENT PTE. LTD",
        "PACIFIC CROSS INSURANCE, INC.",
        "EPP FIRE SAFETY AND RESCUE PRODUCTS CO.",
        "JDM TECHNO COMPUTER CENTER",
        "BATANGAS-LAGUNA AUTOCENTER, INC.",
        "SOLARNRG PHILIPPINES INC.",
        "JJCC MARKETING & SERVICE CENTER",
        "EDGARDO M. PURA",
        "INKLINE OFFICE SOULTIONS, INC.",
        "GOLDEN ARCHER MARKETING",
        "MN ELECTRO INDUSTRIAL SUPPLY AND SERVICES, INC.",
        "PRIME MASTER CONSTRUCTION AND DEVELOPMENT CORPORATION",
        "ASIANA CO., LTD. INC.",
        "JERECON ENTERPRISES",
        "FYS GRAVEL AND SAND",
        "TRANS-OVERSEAS INDUSTRIAL CORPORATION",
        "MICROBASE INCORPORATED",
        "SILVER GRAINS CONSTRUCTION AND SUPPLY",
        "ARMANDO GASPAR A. MERCADO",
        "SICHUAN CONSTRUCTION MACHINERY (GROUP) CO., LTD",
        "GREEN VALLEY AUTO SALES CORP.",
        "JUNSLYN TRADING",
        "TALARIBA TRADING",
        "KRAH PIPES MANILA, INC.",
        "WRAPMAC T-SHIRT PRINTING AND DECALS",
        "SJ & A CONSTRUCTION EQUIPMENT & PARTS SUPPLY",
        "STR8LUCK TRADING CORPORATION",
        "VAUGHN KYRIE ENTERPRISES",
        "ROEL ONRADO ARNOL",
        "SLICK SILVER FERN VENTURES INC.",
        "JCES CONSTRUCTION & ENGINEERING SERVICES",
        "FLOWTORK TECHNOLOGIES CORPORATION",
        "ENVIROCLEAR PURIFIED WATER STATION",
        "POWEREE COMMERCIAL CORP.",
        "EPIMONOS INNOVATOR CONSTRUCTION ENG''NG SERVICES",
        "OPTIMUM ELECTROKONSULT INC.",
        "STRONGBOND PRODUCTS PHILIPPINES INC.",
        "DIMERCO EXPRESS PHILIPPINES, INC.",
        "SKY INK REFILLING SERVICES",
        "M3G GENERAL MERCHANDISE",
        "RAUL M. DONGGO",
        "ACELA S. OLOFERNES",
        "ACY TRANSPORT CORPORATION",
        "INTEGRAL INDUSTRIAL MANAGEMENT CORPORATION",
        "JRD D2 ENTERPRISES",
        "EASCON MANILA CONST. CON., INC.",
        "METRO MEGAMIX CONCRETE PHILIPPINES INC.",
        "NOUVAC TECHNOLOGIES AND SERVICES, INC",
        "AQUAGEN TECHNOLOGIES INC",
        "JENSCO AUTO SUPPLY",
        "KGB SCHNEIDEN, CORP.",
        "GLOBAL ELECTRIC POWER DEVELOPMENT CORPORATION",
        "CONCRETE SOLUTION BUILDERS & SUPPLY",
        "RC VICTORY WORLD TRADING, INC.",
        "JLJB TRADING",
        "JG NORA BUILDERS",
        "EPIROC PHILIPPINES, INC.",
        "NOVEAULAB ASIA CORP.",
        "ROBERT FAELDEN",
        "ARENGER BUILDERS",
        "GEOINNOVATIVE SPECIALISTS INC.",
        "ECU WORLDWIDE (PHILIPPINES) INC.",
        "EARTHSTONES FLOOR CENTER, INC.",
        "JABEZ MOTOR CORPORATION",
        "MARK DEXTER MOSTER GENEROSA",
        "PPRTECH FRAMES ENTERPRISES",
        "JFE ENGINEERING CORPORATION-PHILIPPINE BRANCH",
        "D. ALEJANDRO BUILDERS",
        "FLAMINGO BUILD-TECH ENTERPRISES",
        "BRIANNA INNOVATIONS & SOLUTIONS CORPORATION",
        "PCA FOUNDATION, INC.",
        "TOCMOHAN, WILZON PABAYDA",
        "VLF WOOD VENEERS",
        "EC STRUCTURAL COMPOSITES INC.",
        "NDS GLOVICS MARKETING",
        "AERCLIFT PRINTSHOP & GEN. MERCHANDISE",
        "PERNADA, GREGORIO CATLI",
        "UBIX CORPORATION",
        "CHAIN MARKETING CORPORATION",
        "ST. DOMINIC INDUSTRIES, INC.",
        "JGENTECH ENTERPRISES",
        "ZIPSTER SOLUTIONS CORPORATION",
        "WELD POWERTOOLS INDUSTRIAL MACHINERY",
        "ALL MUST GO TRADING CORP.",
        "DEVELOPED LOGICAL TECHNIQUES FOR AIRCONDITIONING",
        "P. CASTRO AUTO SUPPLY",
        "PORSCHE MOTORS INC.",
        "GENTROMECH CO.",
        "DOMESTIC TRADING CORP.",
        "STATIC POWER PHILIPPINES, INC.",
        "INDUSTRIAL CONTROL SYSTEMS, INC.",
        "JERSONIX ENTERPRISES",
        "RUEKO GMBH BAUMASCHINEN",
        "SHALOME TRADING",
        "ALPHA SACKS STORE",
        "FAHRENHEIT CO. LTD.",
        "ZENITH UNITED ELECTRIC CORPORATION",
        "PODLASLY BAUMASHINEN EXPORT GMBH",
        "EA BARRIOS CONSTRUCTION AND PLUMBING CO.",
        "MIESCOR BUILDERS INC.",
        "CONCAVE CONSTRUCTION AND GENERAL MERCHANDISE",
        "NEW DAGUPAN METRO GAS CORPORATION",
        "GOB MACHINE SHOP AND ENGINE REBUILDER",
        "ROCK TECH INT.,",
        "GEPOLLO ROOFING ENTERPRISES",
        "BAGONG SILANG INTEGRATED TRADING AND SERVICES CORP",
        "ANY NETWORK SYSTEMS, INC.",
        "PIRYTE TECH INC.",
        "JEFFERSON B. ESTEBAN",
        "CRISANTO C. OJASTRO SR.",
        "GRANITE ENVIRONMENTAL, INC.",
        "ERNESTO L. GATUZ & FAMILY ENTERPRISES, INC.",
        "JDA TRADING",
        "CRE8TEVE IT TECH SOLUTIONS",
        "BELLEMINA DYNAMIC BUILDERS INC",
        "GL TECHNOLOGY FACILITIES CORPORATION",
        "GRAND RAJAS BLOCK CORP.",
        "JID SECURITY SOLUTIONS",
        "SUNSTATE MACHINERY CORP",
        "LA CORONA READY MIX CONCRETE",
        "ACASALES TECHNOLOGIES INC.",
        "QINGDAO KINGWORLD CONTROL CO., LTD.",
        "JOHANNA COCO LUMBER AND WOODCRAFT",
        "HAMOFA INDUSTRIAL ENGINES",
        "ISUZU INDUSTRY CO., LTD",
        "HELIX STEEL PRODUCTS CORPORATION",
        "BGC QUALI ENTERPRISES",
        "TAKEZO INDUSTRIAL SUPPLY",
        "DIAMOND ROOFING & METAL SYSTEMS CORP.",
        "SHENYANG WENSHENG INSTRUMENT EQUIPMENT CO., LTD",
        "ANDREWS SYKES HIRE LIMITED",
        "D''FLAG MARKETING CORPORATION",
        "MULTI-BRANDED QUALITY TRADING CORP.",
        "EMMANUEL V. DEL MADRID, JR",
        "JERRY GUINTO TOLENTINO VIBRO SAND AND QUARRY",
        "PRIMESTONE AGGREMIX CORPORATION",
        "MARVIN TOLENTINO TRADING",
        "INK4U CORP.",
        "MOTORPLAZA, INC.",
        "VKDL EQUIPMENT MAINTENANCE SERVICE",
        "CONTRONICS COMPUTER TECHNOLOGIES INC.",
        "ANSTELLA SCHOOL & OFFICE SUPPLIES",
        "SPYRO EIGHT ENGINEERING SERVICES",
        "SATURN CEMENT MARKETING CORPORATION",
        "ACDC ELECTRICAL SERVICES",
        "REPUBLIC CEMENT SERVICES, INC.",
        "ACENKAYS CORPORATION",
        "SCALENE ENTERPRISES",
        "GLOBE INTERNATIONAL DISTRIBUTOR CENTER, INC.",
        "TEJAS, INC.",
        "FELICISIMO C. CANOY",
        "LINETECH INC.",
        "ALLIED INSPECTION CORROSION SERVICES",
        "CONTEMPORANEO DESIGN ENTERPRISE",
        "DANNY B. DOMINGO",
        "TWIN C ENTERPRISE",
        "BARICA ENTERPRISES",
        "COMPLINK MARKETING INC.-SM MEGAMALL",
        "INSULAR OIL CORPORATION",
        "THE TENT CITY RENTALS AND SALES SERVICES CORP.",
        "MAVETEC ENTERPRISES",
        "KEY LINK SALES INTEGRATED INC.",
        "NIKKERU PLANT MAINTENANCE SOLUTION INC.",
        "JMA SAND & GRAVEL HAULING SERVICES",
        "DAMAEGI CONSTRUCTION CORPORATION",
        "AC JOYO DESIGN & TECHNICAL SERVICES",
        "LMJJ ENTERPRISE",
        "DAIKIN AIRCONDITIONING PHILIPPINES INC.",
        "A-XET FLOORCOVERING PTE. LTD PHILIPPINES INC.",
        "IATECH SOLUTIONS INC.",
        "E.B. ILAGAN CONSTRUCTION AND MANPOWER SERVICES",
        "SOLER METALCRAFT MARKETING",
        "PJDN CONSTRUCTION SUPPLIES CORPORATION",
        "G-CAST CONCRETE SDN BHD",
        "KIM SAND AND GRAVEL",
        "XINXING PIPES INTERNATIONAL DEVELOPMENT CO., LTD",
        "WIDEVALUE AUTO INC.",
        "GRAPPE CINCO CONSTRUCTION CORP.",
        "MECHANICAL VOLT''Z WATER PUMP TRADE AND SERVICES",
        "PBF ENTERPRISES",
        "ROMJAYZ REFRIGERATION AND AIRCONDITIONING SERVICE CENTER",
        "SIOTE SAND & GRAVEL & HOLLOWBLOCKS ENTERPRISES",
        "MAGNUS INTERNATIONAL TRADING",
        "THERMAC INSULATION INCORPORATED",
        "SAMBRIEL ENTERPRISE",
        "A. BANTEGUI TRADING",
        "CEST, INCORPORATED",
        "CNBM INTERNATONAL CORPORAION",
        "AMADA CORPORATION",
        "ANDREA''S HOLLOW BLOCKS ENTERPRISES",
        "ENVIROKONSULT EQUIPMENT & SERVICES INC",
        "TRAMSTAR PTY LTD T/A REGLIN RUBBER",
        "EAG CONSTRUCTION INCORPORATED",
        "HANGZHOU EHASE-FLEX CO., LTD.",
        "BIG C TRADING AND CONSTRUCTION SUPPLY",
        "BIGGOALS CORPORATION",
        "VIBROMIX CONSTRUCTION TRADING AND SUPPLY INC",
        "ACE TRADER EQUIPMENT SALES CORPORATION",
        "GEORGE B. PADILLA & ASSOCIATES",
        "MARY ROSE S. DELOS SANTOS",
        "DENLOU TRADING",
        "GHIBLI INTERNATIONAL TRADING CORP.",
        "MARKPOWER ENTERPRISES",
        "METRO TILES INC.",
        "GEO-LASER GMBH",
        "PHILMETAL PRODUCTS, INC.",
        "WILCON DEPOT, INC.- COMMONWEALTH",
        "K.U.R.L.Z GENERAL MERCHANDISE",
        "BOHOL MACHINE SHOP & ENGINEERING WORKS",
        "GASTRACK ENTERPRISES",
        "J. CHAR CONSTRUCTION AND SUPPLY",
        "SYNERGEERING CORP.",
        "E.M.O. S.A.S",
        "JTO CONSTRUCTION CORPORATION",
        "OCCIDENTAL ENTERPRISES",
        "ABENSON VENTURES INC",
        "CAMLA ENTERPRISES",
        "PHILIPPINE ENVIRONMENTAL & TECHNOLOGICAL SYSTEMS AND SERVICES INC.",
        "STARLASER CORPORATION",
        "MAXIAIR CORPORATION",
        "BUMA CE CO., LTD.",
        "MAYFLOWER CONSTRUCTION AND DEVELOPMENT",
        "U.S. COMMERCIAL, INC.",
        "COLADO''S QUARRY",
        "FLEXTOOL EQUIPMENTS AND TOOLS CORP.",
        "ROSITA T. GAMBOA",
        "PATROCINIA C. DE LEON",
        "DANDY SO SY",
        "ROCKCHIP ENTERPRISES",
        "PUMP ONE INTERNATIONAL CORPORATION",
        "ALPINE MOTORS CORPORATION",
        "ADVANCE ELECTRONICS CORPORATION",
        "PRECISE SURVEYTRADE INSTRUMENTS, INC.",
        "AUTOZONE CAR SERVICE CORPORATION",
        "MONTI-WERKZEUGE GMBH",
        "777G&P INDUSTRIAL VENTURES AND GENERAL SERVICES CO",
        "BARCOM TRADING CORPORATION",
        "JFM ENTERPRISES",
        "NANTEEPAMA SAND AND GRAVEL",
        "JENNIFER A. EVANGELISTA",
        "AER CONSTRUCTION & DEVELOPMENT CO., INC.",
        "918 AGGREGATES AND TRUCKMASTER, INC.",
        "TOPSPOT HEAVY EQUIPMENT INC.",
        "SM FLOW COMPANY",
        "DWAYNE GASOLINE STATION",
        "TRSS MARKETING SERVICES",
        "SHIJIAZHUANG NAINATER SLURRY PUMP CO., LTD.",
        "SAFE INDUSTRIAL SALES CORP.",
        "RB VELASCO POWER SYSTEMS COMPANY",
        "SHENZHEN DTH MACHINES CO., LTD.",
        "ROSLER ENTERPRISES",
        "ROLE STA. ANA ENTERPRISES, INC.",
        "MILLENIUM GLOBAL POWER CORPORATION",
        "CTECH INDUSTRIAL SERVICES",
        "ASIA TRACTOR PARTS SUPPLY",
        "CLASSIK INTERIORS",
        "TRI-AMP CORPORATION",
        "KTDG TRADING",
        "RFR3 ELECTRICAL INSTALLATION SERVICES",
        "ARAMINE",
        "BRAVO AGGREGATES AND MINERALS CORPORATION",
        "MARTINDALE TECHNOLOGIES INC.",
        "JANITA G. SAYAT",
        "PREXIPHIL CORPORATION",
        "CJJS HARDWARE AUTO PARTS & SUPPLY INC.",
        "TAPZ HARDWARE",
        "ULTRA-SEER, INC.",
        "DODECA DRONES, INC.",
        "RAPID CONCRETECH BUILDERS CORPORATION",
        "SHIJIAZHUANG HEAVY PUMP COMPANY LIMITED",
        "BMJE MARKETING AND ELECTRICAL SERVICES, INC.",
        "IEQUITY TECHNOLOGIES, CORPORATION",
        "VIBES AUTO SUPPLY",
        "SOILMEC SINGAPORE PTE. LTD.",
        "PTC PILING EQUIPMENT (FAR EAST) PTE LTD",
        "EXCELCO EQUIPMENT, INCORPORATION",
        "COMBINED ELECTRO-MECHANICAL SUPPLY, INC.",
        "R. SISON BUILDERS",
        "JACRAJ ENTERPRISES",
        "DOCENA, DANICA ROSE TAGLE",
        "MORFFLEX INDUSTRIAL SUPPLY",
        "KINGSWAY BATTERY SALES INC.",
        "FORMULACON READYMIX CONCRETE SUPPLY",
        "GLOBELINK NVOCC PHILS., INC.",
        "YELLOW PARTS S.I.",
        "UNIMATE HEAVY INDUSTRY CO., LTD.",
        "JFE ENGINEERING CORPORATION",
        "SBE ENTERPRISES",
        "YANG KEE LOGISTICS PHILIPPINES, INC.",
        "MODELCO GROUP, SL",
        "KIMWA CONSTRUCTION & DEVELOPMENT CORPORATION",
        "YONYON LUMBER & FURNITURE SHOP",
        "C.T. CONSIGNA CONSTRUCTION CORPORATION",
        "JADE BROS. INTERNATIONAL LOGISTICS CORPORATION",
        "XI''AN HERONG MECH-ELECTRICAL CO., LTD.",
        "WELD POWERTOOLS INDUSTRIAL MACHINERY CORP(MANDAUE)",
        "I-GLOBE TECHNOLOGY MARKETING CORPORATION",
        "GLOBEAIRE YAKU CORPORATION",
        "MACRO CONSTRUCTION EQUIPMENT",
        "NELIA H. PAGTALUNAN TRADING",
        "WALKER PLANT SERVICES LTD",
        "CFS CREATIVE TRAINING & MANAGEMENT",
        "SWITCHTEK CONSTRUCTION CORPORATION",
        "ZERO POINT FIELD ELECTRICAL CORP",
        "KOBELCO INTERNATIONAL (S) CO., PTE. LTD.",
        "GOLDEN RATIO ELECTRO-AUTOMATION SYSTEMS, INC.",
        "GLU REALTY AND DEVELOPMENT INC.",
        "EMIELY Q. ABECILLA",
        "CONCRETE SOLUTIONS, INC.",
        "COFFRAL FORMWORKS AND SCAFFOLDS, INC.",
        "S.N. HARDWARE",
        "JANSY COMMERCIAL",
        "GRUNDFOS (SINGAPORE) PTE. LTD.",
        "P.A TECH CO., LTD",
        "CRISMAR ENTERPRISES",
        "SOULMATE-PTP LOGISTICS CORPORATION",
        "MEGA INTERNATIONAL LIQUID OXYGEN CORPORATION",
        "SANLEX ROOFMASTER CENTER CO., INC.",
        "CERTUSO STRUCTURAL SPECIALISTS CORPORATION",
        "GRUNDFOS PUMPS (PHILIPPINES), INCORPORATED",
        "JARDINE SCHINDLER ELEVATOR CORPORATION",
        "EXPLORER FREIGHT CORPORATION",
        "ALOT''S CONSTRUCTION SUPPLY",
        "JIC BUILDERS",
        "VCE OTOMOTIV-TURGAY YILMAZ",
        "JOEMARIE S. SILGUERA",
        "UNO DRAGON METAL CORPORATION",
        "FLUID ENERGY PHILIPPINES, INCORPORATED",
        "SOLIDFORMS CORPORATION",
        "LEXUS INDUSTRIAL ENTERPRISE CORPORATION",
        "AIM HIGH PHIL. LOGISTICS INC.",
        "PJEM LIGHT AND HEAVY AUTO PARTS SUPPLY",
        "P.T. BOHOL CONST., TRADING & REALTY DEV. CORP.",
        "PTE CONSTRUCTION & SUPPLY",
        "DML''S TRADING",
        "MASTER COATING INDUSTRIAL TECHNOLOGY INCORPORATED",
        "SEG ROCKWORKS & ENGINEERING",
        "KEN 31 HARDWARE CORPORATION",
        "GLOBALHOME TILE CORPORATION",
        "ARCMIXX CORPORATION",
        "AEP GROUNDTEST SPECIALIST COMPANY",
        "ROCKMIX, INCORPORATED",
        "A. ALBA CONSTRUCTION SUPPLY",
        "PRIME RICH READY MIX INC.",
        "JEK TRADING AND CONSTRUCTION",
        "JMH-MASS TRADING",
        "JEYDI K WATERPROOFING & RETROFITTING SERVICES",
        "WYNNPOOL INDUSTRIAL GASES, INC.",
        "VLFS ENTERPRISE",
        "HANIN CORPORATION",
        "TRENDS & TECHNOLOGIES, INC.",
        "SWITZER PROCESS INSTRUMENTS PVT. LTD.",
        "PEDROLLO PUMPS PHILS INC",
        "LUCILLE SPAREPARTS SURPLUS AND ACCESSORIES",
        "MIRASOL TIRE SUPPLY",
        "UNIROCK CORPORATION",
        "JAJ AGGREGATES",
        "GOLDENWHEEL TRADING AND LOGISTICS CORPORATION",
        "MICROFIX DATACOM INTEGRATION SYSTEMS INC.",
        "WITZCO TRAILERS, INC.",
        "HOLCIM PHILIPPINES, INC.",
        "TRESIS WORLDWIDE CORPORATION",
        "DI DIZON CONSTRUCTION",
        "FOSHAN XINZHONGWEI ECONOMIC AND TRADE CO., LTD",
        "PABLO T. MEDALLA",
        "INTERFREIGHT WORLDWIDE CARGO LOGISTICS, INC.",
        "TEMPWELL COMPANY",
        "EM3J SAND & GRAVEL QUARRY",
        "LIBBEY HOUSEWARE",
        "ACCENTPLUS INC.",
        "S1 TECHNOLOGIES, INC.",
        "YAMA ENTERPRISES",
        "WIKA INSTRUMENTS PHILIPPINES INC.",
        "JPCC CONSTRUCTION SUPPLIES TRADING",
        "BMG GLASS AND METAL WORKS",
        "DILGONZ CONSTRUCTION CORPORATION",
        "TRANS-AEROMAR LOGISTICS INC",
        "ELMANUEL HAULING SERVICES",
        "BONO DE LUXE PHILIPPINES INC.",
        "VICOSA VENTURES PHIL. INC.",
        "APEX PLASTIC PIPING SUPPLY AND SERVICES INC",
        "E.A. CANAVERAL CONSTRUCTION AND EQUIPMENT",
        "KOBELCO CONSTRUCTION MACHINERY INTERNATIONAL TRADING CO., LTD.",
        "ALEX C. SALAS CONSTRUCTION",
        "AERO-SEAL INDUSTRIAL TECHNOLOGIES, INC.",
        "ZHEJIANG WANMA CO.,LTD.",
        "PLATINUM HEAVY TRUCK''S AND EQUIPMENT SALES, INC.",
        "LARRY P. SALES",
        "APO EAST BUILDERS AND TRADING CORP.",
        "SR ONGSON GROUP OF COMPANIES INC.",
        "BLAS TECHNOLOGIES INC.",
        "G FOX DATAWARE SHOWROOM",
        "SUY HUAT HARDWARE CO., INC.",
        "GXSUN CORPORATION",
        "GREEN ANTZ BUILDERS INC",
        "M.T. PEREZ ENTERPRISES",
        "N & J MACHINE SHOP",
        "GENUS RIGGING SUPPLIES",
        "JDVF INTERIOR DESIGN",
        "TECHNOLOGIES SPECIALIST, INC.",
        "WEBERT MARKETING",
        "JAS R ONE TRADING",
        "ZL MACHINERY PHILIPPINES INC.",
        "ROBERT C. BACARRA",
        "SILVER HORIZON TRADING CO., INC.",
        "W.C.A. GENERAL MERCHANDISE",
        "AUTOLAB MARKETING, INC.",
        "POWERTECH INDUSTRIAL SALES, INC.",
        "ALLENSOLUTIONS HARDWARE TRADING",
        "TRIPLE A UNIVERSAL SAFETY & INDUSTRIAL SUPPLY",
        "CLASSIC COLORS ENTERPRISES",
        "BERNTSEN INTERNATIONAL, INC.",
        "DURATUF PRODUCTS PVT. LTD.",
        "TCGI ENGINEERS CO.",
        "ADC GENERAL MERCHANDISE INC.",
        "LINES & STRIPES MANUFACTURING & DISTRIBUTION INC.",
        "KOMSTAK INC.",
        "MAI EQUIPMENT RENTAL",
        "XANDERXON HOME SUPPLIES",
        "DFS CONSTRUCTION",
        "SPECIALIZED BOLT CENTER AND INDUSTRIAL SUPPLY INC",
        "MAGISA''S CONCRETE PRODUCTS",
        "ARIEL COCO LUMBER",
        "COLO HARDWARE",
        "JHUSTLY TRADING",
        "SIXONESEVEN ENTERPRISES",
        "ROLANDO N. ISIG",
        "V.C. CRUZ CONSTRUCTION",
        "ARGEN GLASS AND ALUMINUM SUPPLY",
        "A. LING SACK DEALER",
        "MBT AUTOWORX CORPORATION",
        "VOLMAX MARKETING",
        "3F TRADE CENTER MART INC.",
        "CONTROL SYSTEM TEKNIQUE INC.",
        "G TWELVE SOLAR POWER ENTERPRISES",
        "POWERTRAC INCORPORATED",
        "CHRYSO PHILIPPINES, INC.",
        "M.V. ANGELES TRADING & TIRE SUPPLY",
        "MCRD CONSTRUCTION AND DESIGN SERVICES",
        "HENAN DRILLS-KING MINING TECHNOLOGY CO., LTD.",
        "INVIGOR PIPES & FITTINGS INC.",
        "KPL INDUSTRIAL SUPPLY",
        "PERI-ASIA PHILIPPINES, INC.",
        "JEDARIC CHEMICALS CO., INC",
        "CLEAN CITY COMMERCIAL INCORPORATED",
        "OHCOTECH CORPORATION",
        "POWERSUPPLY CONSTRUCTION AND DEVELOPMENT CORP",
        "G.J. INDUSTRIES",
        "IGAWARA INDUSTRIAL SERVICE & TRADING PTE LTD",
        "AMERICAN INTERNATIONAL INDUSTRIES PTE. LTD.",
        "ASAHI CORPORATION CO., LTD.",
        "NATION MANUFACTURING & INDUSTRIAL PRODUCTS CORP.",
        "ADVANCED CRANE AND EQUIPMENT TESTING CORPORATION",
        "DYNALAB CORPORATION",
        "AF TRUCKING SERVICES",
        "SCE SYSTEMS COMPANY LTD.",
        "R.M.B. RETROBUILD & CONST. INC.",
        "ELCO WOOD PROCESSING CORP.",
        "TOPUNIVERSE INC.",
        "HAZZ PAINT AND COATING SOLUTIONS, INC.",
        "ORO ORIENTAL ENTERPRISES, INC.",
        "TOYO KENSETSU KOHKI CO., LTD",
        "TUAN BON OFFICE SUPPLIES CORP.",
        "INKRITE INK REFILLING STATION",
        "SOLIMAN E.C. SEPTIC TANK DISPOSAL (POZO NEGRO)",
        "PHILIPPINE HOH INDUSTRIES, INCORPORATED",
        "AG MARCUAP AGGREGATES TRADING",
        "PHILIPPINE GEOANALYTICS, INC.",
        "N2S ANALYSIS & CONSTRUCTION CO.",
        "TRI-M ENGINE CALIBRATION CENTER",
        "PANDA CONSTRUCTION SUPPLY, INC.",
        "MESCO, INC.",
        "INTERNAL STAR HARDWARE AND CONSTRUCTION SUPPLY",
        "SORBETO TRADING",
        "ARIEL C. BLANCAFLOR",
        "OLILA GLASS & SERVICES",
        "HYDROVENTURE CORP.",
        "PAREXGROUP INC.",
        "S.B.F.Z. GATEWAY CORP.",
        "MARCBILT CONSTRUCTION INC.",
        "YUO PIN CONSTRUCTION (PHILIPPINES) INC.",
        "MARCBILT READY MIX AND ASPHALT CORP.",
        "DRILLTO TRENCHLESS CO., LTD",
        "RONGA FABRICATION AND BUILDER",
        "OSCAR D. CABADING",
        "MELEKON CONTRACTORS INC.",
        "UPHIL CONTAINER & EQUIPMENT TRADING INC.",
        "UNIMAC TECHNOLOGY",
        "DONALD V. GARCIA",
        "JOHNZEL ENTERPRISES",
        "J-JARM TRANSPORT CORP.",
        "JJAY''S GRAVEL & SAND & TRUCKING SERVICE",
        "AMECOR INDUSTRIAL CORPORATION",
        "FONDAQUIP (PHIL.) INC.",
        "SURFACE PREP INDUSTRIAL SALES CORPORATION",
        "TOPRITE PLASTIC INDUSTRIES, INC.",
        "MTL GENSAN MOTORS, INC.",
        "RUBEN APOLONIO ISLA SR.",
        "ALPHA ONE A1 GRAND INDUSTRIAL SALES, INC.",
        "BULLDOG TYRE CENTER",
        "J.E.C.O.M TRUCKING SERVICES",
        "MEGAPOWER INDUSTRIAL MILL SUPPLY CORP.",
        "BZS ENTERPRISE INC.",
        "HI-TECH BATTERY & TIRE SUPPLY",
        "CERBERUS TYRE AND BATTERY CENTER",
        "LIGHTCORD ENTERPRISES",
        "G MONTEMAYOR TRUCKING",
        "SICHUAN OVERLAND MACHINERY CO., LTD",
        "HWAY TRANZ TRADING CORP.",
        "SINOEQUIP INCORPORATED",
        "ACME EQUIPMENT PTE LTD",
        "YUO PIN CONSTRUCTION CO., LTD.",
        "KLAD SANITATION SERVICES",
        "GEOFISICA CONSULTORES",
        "KOFLO CORPORATION",
        "CRL ENVIRONMENTAL CORPORATION",
        "PCAP ENGINEERING SERVICES",
        "SOUTHERN UNION HARDWARE CORPORATION",
        "SILVER TIRE TRADERS, INC.",
        "TRANSPOWER BUILDERS AND DEVELOPMENT CORPORATION",
        "NEW YOUNG STAR METAL CO., LTD",
        "C-ELEVEN TRADING",
        "JAHRELLA MARKETING",
        "ONWARD COMMUNICATIONS & SERVICES",
        "PT KEMINDO CAO RESOURCES",
        "THL FOUNDATION EQUIPMENT (PHILIPPINES) INC.",
        "RONNIE C. SULANGI",
        "ARES CONSTRUCTION & AGGREGATES",
        "JANNAH CAR ACCESSORIES",
        "JOHN & CARL TRADING",
        "HUNAN DRILLMASTER ENGINEERING TECHNOLOGY CO., LTD.",
        "TITAN SUPERTOOLS HARDWARE COMPANY",
        "G4 STEEL FABRICATION",
        "JERRY D. EUGENIO",
        "KAIZEN ASIA SAFETY MANAGEMENT AND TESTING COMPANY",
        "GRATEK SMART WATER CORP.",
        "JAYRICH STAINLESS STEEL PRODUCT TRADING",
        "KYOKUTO KAIHATSU ENTERPRISE",
        "INSTALL-ALL ENTERPRISE",
        "ECOSHIFT CORPORATION",
        "ALSY TRADING",
        "MG CARPIO''S METAL CRAFT AND TINSMITH BENDER",
        "TOYOTA TAGUM CITY",
        "SHANGHAI ICE (HONGKONG) CONSTRUCTION MACHINERY TRADING COMPANY",
        "KORIX OFFICE FURNITURE ENTERPRISE",
        "L.M. CAPITULO ENTERPRISES",
        "WIL INDUSTRIAL SALES CO.",
        "BBR PHILIPPINES CORPORATION",
        "B.M. DOMINGO MOTOR SALES, INC.",
        "PRIMESEARCH SERVICE PROVIDER CORPORATION",
        "PTT PHILIPPINES CORPORATION",
        "USAE PTE LTD",
        "KENGI MARKETING",
        "SRA TRUCKING SERVICES",
        "JAMMYBOX ONLINE SHOP",
        "KOOLER INDUSTRIES, INC.",
        "ATAD STEEL STRUCTURE CORPORATION",
        "VERDANT TECH AND SYSTEM INTEGRATION INC.",
        "VERMEER MIDDLE EAST FZCO",
        "DITCH WITCH MIDDLE EAST",
        "COZINHA MODULAR DESIGN INC.",
        "WELD POWERTOOLS INDUSTRIAL MACHINERY CORPORATION",
        "JTE GROUP OF COMPANIES INC.",
        "R.I. MAYO CONSTRUCTION AND SUPPLIES",
        "A. ALVARO COCOLUMBER AND CONSTRUCTION SUPPLIES",
        "RAINBOW COLOR PAINT",
        "MATHEW AND MA. ARTHEA ENTERPRISES",
        "ASIA CORROSION SERVICES INC",
        "MJD STEEL ENTERPRISES",
        "GEORGE FLOR  PUNO ANGCANA GAS CORP.",
        "SUNLIT PRINT & GRAPHICS",
        "MACWORKS MANPOWER AND GENERAL SERVICES",
        "SOLAR HOME SUPPLIES & SERVICES",
        "FIREPRO TECHNOLOGIES AND ENGINEERED SYSTEMS",
        "MS 8/27 CONSTRUCTION & DEV''T. CORP.",
        "MATCHSTICKS ADVERTISING SERVICES",
        "NUEVA CONSTRUCTION",
        "NAVARRA BUILDERS",
        "RSJJ CONSTRUCTION SERVICES",
        "NEWAGEMOGUL, INC.",
        "MTECH INDUSTRIAL AUTOMATION CORPORATION",
        "MINING AND PETROLEUM SERVICES CORPORATION",
        "CDO ELECTROCARE CORPORATION",
        "PHOENIX PETROLEUM PHILIPPINES INC.",
        "EAST ASIA SOLUTIONS TECHNOLOGIES CORPORATION",
        "LAVIOSA CHIMICA MINERARIA S.p.A.",
        "JENJUN CONSTRUCTION EQUIPMENT & PARTS SUPPLY",
        "RETROPOWER CORPORATION",
        "AlternativePower Solutions, Inc.",
        "LOC-SEAL INDUSTRIAL CORPORATION",
        "ASENSO INDUSTRIAL SALES",
        "MVA POWER SYSTEMS DEVELOPMENT CORP.",
        "SOUTHEASTERN FIBER PRODUCTS",
        "DOELEUR ELECTROSYSTEMS INC",
        "DON RAMON CONCRETE READY MIX CORPORATION",
        "AARON CONSTRUCTION AND SUPPLY",
        "JB & SONS TRADING AND CONSTRUCTION",
        "CG INTEGRA CORP",
        "FREPA BUILDER AND CONSTRUCTION SUPPLY",
        "INDUSTRIAL GALVANIZERS CORP. OF THE PHILS.",
        "RM PILAPIL TRADING",
        "HIGHCHEM TRADING",
        "HI-SAFETY INDUSTRIAL SUPPLIES, INC.",
        "CLIFTON K. LIWAKEN",
        "REBCOR CONST. AND TRADING CORPORATION",
        "FIRST JAPS COMML. INC.",
        "GABE8HARIEL CONSTRUCTION SUPPLIES TRADING",
        "SHANDONG BETTER DRILLING MACHINERY CO., LTD",
        "R.G. MERCADO CONSTRUCTION SERVICES",
        "JELLI''S GAS STATION",
        "MAYON MACHINERY RENTRADE, INC.",
        "GENTEC DISTRIBUTION CORP.",
        "TAIHEI ALLTECH CONSTRUCTION (PHIL) INC",
        "RONALDO T. ROY",
        "BELMAN COMPANIA INCORPORADA",
        "MDRIDR CONSTRUCTION & DEV''T CORP.",
        "SPIRAL GROUP INC.",
        "ONE MEGA GRANDIS DEV''T. CORP.",
        "J4 ALUMINUM GLASS IRON WORKS",
        "KHINGCHEY MARKETING",
        "MASTER DRAGON ENTERPRISES",
        "SMARTBUILT MARKETING CORP.",
        "ICP-FNET ENGINEERING",
        "HERMOGENES GAMUEDA",
        "DELTA EARTHMOVING, INC.",
        "CTJAY CALIBRATION SERVICE CENTER",
        "ORLY TORING TUAN",
        "RIGZONE INC.",
        "KMV8 MARKETING",
        "SYSTEMHUB DISTRIBUTION INC.",
        "MMG FORWARDING CORP.",
        "ZECO DI ZERBARO E COSTA E.C. SRL",
        "ALIMARK DE GUZMAN OCQUIA",
        "PUMPKART ENGINEERING MACHINERIES SERVICES",
        "SEGURO MEDICO TRADING CORP",
        "MCC GARMENT TRADING",
        "JJ VILCHES HARDWARE AND CONSTRUCTION SUPPLY",
        "5S METAL FABRICATION SERVICES",
        "STA CLARA INTERNATIONAL CO. WLL",
        "DURA-FLEX CONSTRUCTION & TRADING CORPORATION",
        "TAGBILARAN CITY TYRE SALES AND SERVICE CENTER",
        "LIFEQUEST SAFETYPRO VENTURES",
        "CROSSPOINT PAPER INC",
        "ATIMONAN BUILDERS",
        "GLOBAL COMPANY",
        "5MPL TRUCKING",
        "RVR TRADING",
        "FIVE LETTERS CONSTRUCTION SUPPLIES",
        "WRUSKIN ELECTRICAL PRODUCTS TRADING",
        "SERJOHN ELECTRICAL",
        "COLUMBIA TECHNOLOGIES, INC.",
        "PC SYSTEM PLUS COMPUTER PARTS & ACCESSORIES",
        "S&K INDUSTRIAL SALES AND SERVICES, INC.",
        "KING JNP TRUCKING SERVICES",
        "SYSTEMS VARIABLE TECHNICOM INC.",
        "BRIGHT WORLD ELECTRIC SYSTEMS, INC.",
        "IFIXZ ENTERPRISE",
        "LIEBHERR-EXPORT AG",
        "QUICKEN CONCRETE MIX CORP",
        "KINGTON CONCRETE EQUIPMENTS SDN BHD",
        "RICARDO G. ALMAZAN",
        "AMAPEX INDUSTRIAL SALES",
        "N.M PARAFINA BUILDERS INC.",
        "INFINUS CORPORATION",
        "SOJITZ PHILIPPINES CORPORATION",
        "WILL & JOE AGGREGATES, INC.",
        "CNR 8910 INDUSTRIAL INC.",
        "TDS AIRCONDITIONING INDUSTRIES, INC.",
        "RAYMOND R. ESTO",
        "TITAN CONCRETE MATERIALS CORP.",
        "BEN''S WINDOORS INC.",
        "LR FANGGOLO SAND AND GRAVEL",
        "RMDC AUTO PARTS AND SERVICES",
        "RD SQUARE CONSTRUCTION",
        "TOYOTA TSUSHO CORPORATION",
        "STN-C BATTERY SHOP",
        "ROANN CONSTRUCTION AND SUPPLIES",
        "MRB ESTELOPE TRADING AND SERVICES INCORPORATED",
        "M.G. MAGNATA TRADING",
        "CAPITOL STEEL CORPORATION",
        "R33 CAR EXCHANGE CORPORATION",
        "SJM KONSTRAKTION SERVICES",
        "JOSE AND LUCIA PROPERTIES",
        "TRIBROS SAFETY",
        "DEEWAN EQUIPMENT TRADING (L.L.C)",
        "MARLON JAMES BUCAWE DULNUAN",
        "KIM DOMINADO MIRAFUENTE",
        "CINERGI INDUSTRIAL SOLUTIONS INC.",
        "TECHGEEKPH SOLUTIONS & SERVICES",
        "JERRY CARILLO SAJER",
        "MICRO IMAGE INTERNATIONAL CORP",
        "PRESSOIL s.r.l.",
        "R.G. GONZAGA BUILDERS",
        "WFO HARDWARE",
        "U-BIX CORPORATION",
        "F.F. ROSALES GENERAL CONTRACTOR",
        "EURO AUTOCARS, INC.",
        "GR8 CAR, INC.",
        "CARLOS AND LORIE BUILDERS",
        "CHADROCK CONSTRUCTION AND DEVELOPMENT",
        "WORLD SOLUTION TECHNOLOGY, INC",
        "SCHNEIDER ELECTRIC (PHILIPPINES), INC.",
        "JICJAM CYCLE INC.",
        "HICOR MANUFACTURING CORP.",
        "SPECS CORP.",
        "HADI CONSTRUCTION AND SUPPLY",
        "RODOLFO S. IZON",
        "MARCELLIN SAND AND GRAVEL AND HOLLOWBLOCKS FACTORY",
        "J-TRADE CONCRETE PRODUCTS AND CONSTRUCTION SUPPLY",
        "SEAWAY FILIPINAS LOGISTICS, INC.",
        "TAIZHOU HAOXIN ELECTRIC POWER MACHINE CO., LTD.",
        "BIEMED AESTHETIC AND MEDICAL SUPPLIES",
        "QUAD-R BUILDING SOLUTIONS",
        "M&P WORLDWIDE SOLUTIONS INC.",
        "DIAMETRIC POWER ELECTRO MECHANICAL SERVICES",
        "EDGAR ALLAN VILLANUEVA VICEDO",
        "MACD MEDICAL EQUIPMENT AND SUPPLIES TRADING",
        "OLT VENTURES",
        "SHELL ALCALA GASOLINE STATION",
        "LANDURAI ENGINEERING AND CONSTRUCTION",
        "BSTECH ENG CONSTRUCTION CORPORATION",
        "AP BLUE WHALE CORP",
        "AVANZADO MACHINERY WORKS & ENGINE REBUILDER",
        "LASCO HOME SECURITY AND AUTOMATION",
        "AMERICAN WIRE & CABLE CO., INC.",
        "HYGIEIA INNOVATIONS AND TECHNOLOGY INC.",
        "FILMIX CONCRETE INDUSTRIES, INC.",
        "PARCONCRETE PIPES MANUFACTURING INC.",
        "PRIME NUTRICEUTICALS, OPC",
        "ALEX S. ALAYON",
        "JM FAR EAST INC.",
        "LS-VINA CABLE & SYSTEM",
        "DOKA PHILIPPINES, INC.",
        "POLINAR''S TIRE SUPPLY",
        "MEGA FLEET TRADING",
        "DHINIE''S FUEL STATION",
        "PRECY T. BANTA BUILDERS",
        "COCO TECHNOLOGIES CORPORATION",
        "MEGATEC INNOVATIVE SOLUTIONS INC.",
        "SMART MASONRY PHILIPPINES, INC.",
        "M. SALAS DESIGN & CONSTRUCTION",
        "ARCHITECKS METAL SYSTEMS, INC.",
        "NORTH STAR GASOLINE STATION",
        "S-ENERGY CO., LTD.",
        "LJW ECO FRIENDLY PRODUCT TRADING",
        "IMMAX ENGINEERING AND CONSTRUCTION",
        "SCHWER ENGINEERING SERVICES AND SUPPLIES",
        "DOUBLESQUARE NETWORKS INC.",
        "ACHIEVE WITHOUT BORDERS, INC.",
        "ALJEMA MINERAL & ENVIRONMENTAL CONSULTANCY SERVICES",
        "GLOBOROCKS MINING CORP.",
        "FREYSSINET INTERNATIONAL MANILA, INC.",
        "JUBRE'' HEAVY EQUIPMENT PARTS TRADING",
        "COOLER MASTER TRADING",
        "SQUARE8 CONSTRUCTION & TRADING CORP.",
        "KING HYDRO-MECHANIC EQUIPMENT REPAIR",
        "RYAN A. SARMIENTO",
        "SMR COMPUTERS",
        "MMS MEDICAL AND LABORATORY SUPPLIES",
        "IRAH TRADING CORP.",
        "MSEVEN CONSTRUCTION AND SUPPLIES",
        "C. ONGKIT TRADING",
        "KING ACE HARDWARE & INDUSTRIAL SUPPLY CORPORATION",
        "INSIGIDA CONSTRUCTION CORPORATION",
        "BEYOND IMAGINATION ADVERTISING SERVICES INC.",
        "GREGORY JOHN HOUGHTON",
        "ACDAUGHSONS LOGISTICS SERVICES",
        "GREENMETAL ELECTRIC MANUFACTURING CORPORATION",
        "LYNDELLE AGRO- INDUSTRIAL SALES",
        "AUTOKID SUBIC TRADING CORPORATION",
        "SUNSHINE RUBBER TECH RESOURCES CO.",
        "LUCKY 5 K HAULING SERVICES",
        "APEXAIMER DEVELOPMENT CORPORATION",
        "AMD HAULING SERVICES",
        "NETRUMA INCORPORATED",
        "MUSTBUY OFFICE SUPPLIES CORPORATION",
        "TFE SALES MARKETING CORPORATION",
        "ORTHOKINETICS ENTERPRISES",
        "NLEX VENTURES CORPORATION",
        "TAMECH MARKETING",
        "SLJM CONSTRUCTION DESIGN AND BUILT",
        "SAFETYMATE INDUSTRIAL PRODUCTS",
        "WELL KARGO SOLUTIONS INC.",
        "FAST AUTOWORLD PHILIPPINES CORPORATION",
        "MASTER BUILDERS SOLUTIONS PHILIPPINES INC.",
        "ANIMAS BROS CONSTRUCTION",
        "S-BROS AGGREGATES TRADING",
        "AB SURVEYING & DEVELOPMENT",
        "WELDING INDUSTRIES OF THE PHILIPPINES, INC.",
        "SPEEVO AUTO SUPPLY",
        "ACEZ INSTRUMENTS PHILIPPINES CORPORATION",
        "V3 INC.",
        "SLEE CARGO FORWARDING",
        "ONE PREMIUM POWER CORPORATION",
        "ILIJAN MULTIPURPOSE COOPERATIVE",
        "PHOS LIGHTING SOLUTIONS ENTERPRISES",
        "MEGATRENDS I&C CORPORATION",
        "REX HARDWARE",
        "ELJOAQUIN VEHICLE TRADING",
        "ANGEL GRACE CONSTRUCTION SUPPLY",
        "BGH GENERAL MERCHANDISE",
        "ROCK GOLD TRADING & EQUIPMENT RENTALS",
        "SIGHT ENGINEERS & BUILDERS",
        "HOBBY DYNAMICS EQUIPMENT GADGETS, GIZMOS AND SOLUTIONS INC.",
        "AZINET TRADING",
        "FIBER-REX PHILIPPINES LLC INC.",
        "VANCOUVER ENTERPRISES",
        "AERO TEC LABORATORIES INC.",
        "MCKUPLER INC.",
        "JMC FIRE ENTERPRISES",
        "RGE CONST. AND SUPPLY INC.",
        "SANVI DETECTORS",
        "ROCK MOVING DRILLING AND BLASTING SERVICES",
        "AL-SUFFYAN ENGINEERING SERVICES AND SUPPLY",
        "ZARRIO AUTO PARTS TRADING",
        "BLIMS LIFESTYLE GROUP INC.",
        "CUBIX OFFICE INC.",
        "STEELSOURCE INC.",
        "PRECISION SURVEY SOLUTIONS",
        "EFREN RAMIREZ CONSTRUCTION AND GENERAL SERVICES CORP.",
        "MCMB INDUSTRIAL AND DEVELOPMENT CORPORATION",
        "GP ABACAN ELECTRICAL SERVICES",
        "DC ENTERPRISES",
        "JLM HARDWARE TOOLS AND EQUIPMENT TRADING",
        "CSO ENGINEERING SERVICES",
        "HPS METAL FABRICATION",
        "INCA PHILIPPINES, INC.",
        "RSB TRADING",
        "TWIN BUILDER STEEL INDUSTRIAL CORP.",
        "JAD MEASUREMENT AND CONTROL TECHNOLOGY CORPORATION",
        "INFINITE QUALITY DESIGNS CENTER, INC. (STA. LUCIA BRANCH)",
        "PABILAIÂS VARIETY SHOP",
        "LONGFIELD HARDWARE & CONSTRUCTION SUPPLIES",
        "GELSTONE TRADING & SERVICES, INC.",
        "DC INDUSTRIAL AND OFFICE SUPPLIES",
        "ROCKWORKS TRADING & ENTERPRISES",
        "LOBO WATER DISTRICT",
        "DONG-AYE ENTERPRISES",
        "VASTRESULTS INC.",
        "WASTECON INC.",
        "FAR EAST FUEL CORPORATION",
        "YATAI INTERNATIONAL CORPORATION",
        "MAPECON PHILIPPINES, INC. - BATANGAS BRANCH",
        "BASILIO RENTALS AND SALES CORPORATION",
        "GAD BUILDER AND ENTERPRISES, INC.",
        "WAYNER AGGREGATES TRADING",
        "DIMBROS INDUSTRIAL FABRICATION SERVICES",
        "AS BUILT ENGINEERING AND INDUSTRIAL SOLUTION",
        "GOLDENMILE CHEMICALS AND CONSTRUCTION INC.",
        "CGP METAL WORKS AND STAINLESS FABRICATION",
        "HANDYLEO TRUCKING SERVICES",
        "HI-TOP MERCHANDISING, INC.",
        "JOEL CHAVEZ EQUIPMENT RENTALS CORPORATION",
        "MD LAQUINDANUM TRUCKING INC.",
        "MIGHTY VICTOR BUILDERS AND DEVELOPMENT CORP.",
        "IRAH SOLUTIONS AND SERVICES INC.",
        "EDUMAR ENTERPRISES",
        "VERTILUX LIGHTING AND & ELECTRONICS CORPORATION",
        "MC ARC INDUSTRIAL SUPPLY",
        "M. LAWIN CONSTRUCTION SUPPLY AND SERVICES",
        "TKL STEEL CORPORATION",
        "PACIFIC ROCKSAND DEVELOPMENT CORPORATION",
        "SOHANIE FIRE PROTECTION PRODUCT TRADING",
        "ASISI SYSTEMS CORP.",
        "TOTAL 2000 CORPORATION",
        "NVC REF. & AIR-CONDITIONING SUPPLY & GENERAL SERVICES",
        "GOLDENTEC CONTRACTOR CORPORATION",
        "DEAN MEDICAL EQUIPMENT AND SUPPLIES TRADING",
        "ELECTROWORLD, INC.",
        "ZJBB TRADING AND ENGINEERING SERVICES",
        "ASI.COM.PH INC.",
        "IBA BOTANICALS, INC.",
        "J & B INDUSTRIAL CORPORATION",
        "PHIL-ASIA STEEL POLE CORPORATION",
        "JB GONZALES CONSTRUCTION AGGREGATES TRADING",
        "ARB LOGOGRAPHY BUSINESS SOLUTIONS INC",
        "VEAL BUILD CORP.",
        "UNITEC MULTI-SYSTEM INT''L. INC.",
        "ECAÂS CONSTRUCTION SUPPLIES TRADING",
        "ROSALES SUPPLIES AND SERVICES PLANT PROPAGATION",
        "RLCJR TRUCKING SERVICES",
        "FILIPINAS ASIA SHUTTER DOOR CORPORATION",
        "C.B. BARANGAY ENTERPRISES TOWING & TRUCKING SERVICES INC.",
        "ROYAL STONE TRADING",
        "TECHROM COMPUTER CORP.",
        "QS LOGISTICS AND RENTALS INC.",
        "SYMMETRIC INTERCONTINENTAL IT SOLUTIONS INC.",
        "OFFICE WAREHOUSE, INC.",
        "AD-TECH COMPUTER TRADING",
        "AEROFONE CELLPHONES & ACCESSORIES CO.",
        "SOLOMON PACIFIC FISHERIES INC",
        "YES-JJE MARKETING CORPORATION",
        "NEXUS ABRASIVES INC",
        "SEAOIL PHILIPPINES, INC.",
        "MQUAD SOLUTIONS INC",
        "NORTHLINK OFFICE SYSTEMS CORPORATION",
        "CHEMICAL ALLOY CORPORATION",
        "J.M.E. HARDWARE AND CONSTRUCTION SUPPLIES",
    ];

    const TEAM_ID = "a5a28977-6956-45c1-a624-b9e90911502e";

    const supplierInput = supplierData.map((supplier) => {
      return {
        supplier_name: supplier,
        supplier_team_id: TEAM_ID
      }
    });

    const supplier_input = supplierInput.map((supplier) => `('${supplier.supplier_name}', '${supplier.supplier_team_id}')`).join(',');
    plv8.execute(`INSERT INTO supplier_table (supplier_name, supplier_team_id) VALUES ${supplier_input}`);
  })
$$ LANGUAGE plv8;
SELECT supplier_seed();
DROP FUNCTION IF EXISTS supplier_seed;