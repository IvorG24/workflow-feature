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
  team_name VARCHAR(4000) UNIQUE NOT NULL,
  team_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
  team_is_request_signature_required BOOLEAN DEFAULT FALSE NOT NULL,
  team_logo VARCHAR(4000),
  team_group_list VARCHAR(4000)[] DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
  team_project_list VARCHAR(4000)[] DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
  
  team_user_id UUID REFERENCES user_table(user_id) NOT NULL
);
CREATE TABLE team_member_table(
  team_member_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  team_member_role VARCHAR(4000) DEFAULT 'MEMBER' NOT NULL,
  team_member_date_created DATE DEFAULT NOW() NOT NULL,
  team_member_is_disabled BOOL DEFAULT FALSE NOT NULL,
  team_member_group_list VARCHAR(4000)[] DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
  team_member_project_list VARCHAR(4000)[] DEFAULT ARRAY[]::VARCHAR[] NOT NULL,

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
  form_group VARCHAR(4000)[] DEFAULT ARRAY[]::VARCHAR[] NOT NULL,

  form_team_member_id UUID REFERENCES team_member_table(team_member_id) NOT NULL
);
CREATE TABLE signer_table (
  signer_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  signer_is_primary_signer BOOLEAN DEFAULT FALSE NOT NULL,
  signer_action VARCHAR(4000) NOT NULL,
  signer_order INT NOT NULL,
  signer_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,

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
-- End: Form

-- Start: Request
CREATE TABLE request_table(
  request_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  request_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  request_status VARCHAR(4000) DEFAULT 'PENDING' NOT NULL,
  request_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
  request_additional_info VARCHAR(4000),

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

-- Start: Order to Purchase Form
CREATE TABLE item_table(
  item_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  item_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  item_general_name VARCHAR(4000) NOT NULL,
  item_unit VARCHAR(4000) NOT NULL,
  item_purpose VARCHAR(4000) NOT NULL,
  item_is_available BOOLEAN DEFAULT TRUE NOT NULL,
  item_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
  item_cost_code VARCHAR(4000) NOT NULL,
  item_gl_account VARCHAR(4000) NOT NULL,

  item_team_id UUID REFERENCES team_table(team_id) NOT NULL
);

CREATE TABLE item_description_table(
  item_description_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  item_description_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  item_description_label VARCHAR(4000) NOT NULL,
  item_description_is_available BOOLEAN DEFAULT TRUE NOT NULL,
  item_description_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,

  item_description_field_id UUID REFERENCES field_table(field_id) ON DELETE CASCADE NOT NULL,
  item_description_item_id UUID REFERENCES item_table(item_id) ON DELETE CASCADE NOT NULL
);

CREATE TABLE item_description_field_table(
  item_description_field_id UUID DEFAULT uuid_generate_v4() UNIQUE PRIMARY KEY NOT NULL,
  item_description_field_date_created TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  item_description_field_value VARCHAR(4000) NOT NULL,
  item_description_field_is_available BOOLEAN DEFAULT TRUE NOT NULL,
  item_description_field_is_disabled BOOLEAN DEFAULT FALSE NOT NULL,

  item_description_field_item_description_id UUID REFERENCES item_description_table(item_description_id) ON DELETE CASCADE NOT NULL
);

-- End: Order to Purchase Form

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

---------- End: TABLES

---------- Start: FUNCTIONS

-- Start: Get current date

CREATE FUNCTION get_current_date()
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

CREATE FUNCTION get_ssot(
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
      otpCondition,
      numberOfCondition
    } = input_data;

    const rowStart = (pageNumber - 1) * rowLimit;

    // Fetch owner of team
    const team_owner = plv8.execute(`SELECT * FROM team_member_table WHERE team_member_team_id='${activeTeam}' AND team_member_role='OWNER'`)[0];

    // Fetch team formsly forms
    const otp_form = plv8.execute(`SELECT * FROM form_table WHERE form_name='Order to Purchase' AND form_is_formsly_form=true AND form_team_member_id='${team_owner.team_member_id}'`)[0];
    const quotation_form = plv8.execute(`SELECT * FROM form_table WHERE form_name='Quotation' AND form_is_formsly_form=true AND form_team_member_id='${team_owner.team_member_id}'`)[0];
    const rir_purchased_form = plv8.execute(`SELECT * FROM form_table WHERE form_name='Receiving Inspecting Report (Purchased)' AND form_is_formsly_form=true AND form_team_member_id='${team_owner.team_member_id}'`)[0];
    const rir_sourced_form = plv8.execute(`SELECT * FROM form_table WHERE form_name='Receiving Inspecting Report (Sourced)' AND form_is_formsly_form=true AND form_team_member_id='${team_owner.team_member_id}'`)[0];
    const cheque_reference_form = plv8.execute(`SELECT * FROM form_table WHERE form_name='Cheque Reference' AND form_is_formsly_form=true AND form_team_member_id='${team_owner.team_member_id}'`)[0];

    let otp_requests;

    if(search){
      otp_requests = plv8.execute(`SELECT request_id, request_date_created, request_team_member_id FROM request_table WHERE request_status='APPROVED' AND request_id='${search}'`);
    }else if(otpCondition.length !== 0){
    const condition = otpCondition.map(value => `request_response_table.request_response = '"${value}"'`).join(" OR ");
      otp_requests = plv8.execute(`SELECT * FROM (SELECT request_table.request_id, request_table.request_date_created, request_table.request_team_member_id, request_response_table.request_response, ROW_NUMBER() OVER (PARTITION BY request_table.request_id) AS RowNumber FROM request_table INNER JOIN request_response_table ON request_table.request_id = request_response_table.request_response_request_id WHERE request_table.request_status = 'APPROVED' AND request_table.request_form_id = '${otp_form.form_id}' AND (${condition}) ORDER BY request_table.request_date_created DESC OFFSET ${rowStart} ROWS FETCH FIRST ${rowLimit} ROWS ONLY) AS a WHERE a.RowNumber = ${numberOfCondition}`);
    }else{
      otp_requests = plv8.execute(`SELECT request_id, request_date_created, request_team_member_id FROM request_table WHERE request_status='APPROVED' AND request_form_id='${otp_form.form_id}' ORDER BY request_date_created DESC OFFSET ${rowStart} ROWS FETCH FIRST ${rowLimit} ROWS ONLY`);
    }
    
    ssot_data = otp_requests.map((otp) => {
      // OTP request response
      const otp_response = plv8.execute(`SELECT request_response, request_response_field_id, request_response_duplicatable_section_id FROM request_response_table WHERE request_response_request_id='${otp.request_id}'`);
      
      if(!otp_response) return;

      // OTP request response with fields
      const otp_response_fields = otp_response.map(response => {
        const field = plv8.execute(`SELECT field_name, field_type FROM field_table WHERE field_id='${response.request_response_field_id}'`)[0];
        return {
          request_response: response.request_response,
          request_response_field_name: field.field_name,
          request_response_field_type: field.field_type,
          request_response_duplicatable_section_id: response.request_response_duplicatable_section_id
        }
      });

      // OTP team member
      const otp_team_member = plv8.execute(`SELECT user_table.user_first_name, user_table.user_last_name FROM team_member_table INNER JOIN user_table ON team_member_table.team_member_user_id = user_id WHERE team_member_id='${otp.request_team_member_id}'`)[0];

      const quotation_ids = plv8.execute(`SELECT request_table.request_id FROM request_response_table INNER JOIN request_table ON request_response_table.request_response_request_id=request_table.request_id WHERE request_response_table.request_response='"${otp.request_id}"' AND request_table.request_status='APPROVED' AND request_table.request_form_id='${quotation_form.form_id}'`);
      let quotation_list = [];

      if(quotation_ids.length !== 0){
        let quotation_condition = "";
        quotation_ids.forEach(quotation => {
          quotation_condition += `request_id='${quotation.request_id}' OR `;
        });

        const quotation_requests = plv8.execute(`SELECT request_id, request_date_created, request_team_member_id FROM request_table WHERE ${quotation_condition.slice(0, -4)} ORDER BY request_date_created DESC`);
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

          const rir_ids = plv8.execute(`SELECT request_table.request_id FROM request_response_table INNER JOIN request_table ON request_response_table.request_response_request_id=request_table.request_id WHERE request_response_table.request_response='"${quotation.request_id}"' AND request_table.request_status='APPROVED' AND request_table.request_form_id='${rir_purchased_form.form_id}'`);
          let rir_list = [];
          
          if(rir_ids.length !== 0){
            let rir_condition = "";
            rir_ids.forEach(rir => {
              rir_condition += `request_id='${rir.request_id}' OR `;
            });

            const rir_requests = plv8.execute(`SELECT request_id, request_date_created, request_team_member_id FROM request_table WHERE ${rir_condition.slice(0, -4)} ORDER BY request_date_created DESC`);
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
                rir_request_date_created: rir.request_date_created,
                rir_request_response: rir_response_fields,
                rir_request_owner: rir_team_member,
              }
            });
          }

          return {
            quotation_request_id: quotation.request_id,
            quotation_request_date_created: quotation.request_date_created,
            quotation_request_response: quotation_response_fields,
            quotation_request_owner: quotation_team_member,
            quotation_rir_request: rir_list
          }
        });
      }

      const cheque_reference_ids = plv8.execute(`SELECT request_table.request_id FROM request_response_table INNER JOIN request_table ON request_response_table.request_response_request_id=request_table.request_id WHERE request_response_table.request_response='"${otp.request_id}"' AND request_table.request_status='APPROVED' AND request_table.request_form_id='${cheque_reference_form.form_id}'`);
      let cheque_reference_list = [];

      if(cheque_reference_ids.length !== 0){
        let cheque_reference_condition = "";
        cheque_reference_ids.forEach(cheque_reference => {
          cheque_reference_condition += `request_id='${cheque_reference.request_id}' OR `;
        });

        const cheque_reference_requests = plv8.execute(`SELECT request_id, request_date_created, request_team_member_id FROM request_table WHERE ${cheque_reference_condition.slice(0, -4)} ORDER BY request_date_created DESC`);
        cheque_reference_list = cheque_reference_requests.map(cheque_reference => {
          // cheque_reference request response
          const cheque_reference_response = plv8.execute(`SELECT request_response, request_response_field_id FROM request_response_table WHERE request_response_request_id='${cheque_reference.request_id}'`);
          
          // cheque_reference request response with fields
          const cheque_reference_response_fields = cheque_reference_response.map(response => {
            const field = plv8.execute(`SELECT field_name, field_type FROM field_table WHERE field_id='${response.request_response_field_id}'`)[0];
            return {
              request_response: response.request_response,
              request_response_field_name: field.field_name,
              request_response_field_type: field.field_type,
            }
          });

          // cheque_reference team member
          const cheque_reference_team_member = plv8.execute(`SELECT user_table.user_first_name, user_table.user_last_name FROM team_member_table INNER JOIN user_table ON team_member_table.team_member_user_id = user_id WHERE team_member_id='${cheque_reference.request_team_member_id}'`)[0];

          return {
            cheque_reference_request_id: cheque_reference.request_id,
            cheque_reference_request_date_created: cheque_reference.request_date_created,
            cheque_reference_request_response: cheque_reference_response_fields,
            cheque_reference_request_owner: cheque_reference_team_member,
          }
        });
      }

      const rir_ids = plv8.execute(`SELECT request_table.request_id FROM request_response_table INNER JOIN request_table ON request_response_table.request_response_request_id=request_table.request_id WHERE request_response_table.request_response='"${otp.request_id}"' AND request_table.request_status='APPROVED' AND request_table.request_form_id='${rir_sourced_form.form_id}'`);
      let rir_list = [];

      if(rir_ids.length !== 0){
        let rir_condition = "";
        rir_ids.forEach(rir => {
          rir_condition += `request_id='${rir.request_id}' OR `;
        });

        const rir_requests = plv8.execute(`SELECT request_id, request_date_created, request_team_member_id FROM request_table WHERE ${rir_condition.slice(0, -4)} ORDER BY request_date_created DESC`);
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
            rir_request_date_created: rir.request_date_created,
            rir_request_response: rir_response_fields,
            rir_request_owner: rir_team_member,
          }
        });
      }

      return {
        otp_request_id: otp.request_id,
        otp_request_date_created: otp.request_date_created,
        otp_request_response: otp_response_fields,
        otp_request_owner: otp_team_member,
        otp_quotation_request: quotation_list,
        otp_cheque_reference_request: cheque_reference_list,
        otp_rir_request: rir_list,
      }
    })
 });
 return ssot_data;
$$ LANGUAGE plv8;

-- End: Get SSOT

-- Start: Create user

CREATE FUNCTION create_user(
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

CREATE FUNCTION create_request(
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
    } = input_data;

    
    request_data = plv8.execute(`INSERT INTO request_table (request_id,request_form_id,request_team_member_id) VALUES ('${requestId}','${formId}','${teamMemberId}') RETURNING *;`)[0];

    plv8.execute(`INSERT INTO request_response_table (request_response,request_response_duplicatable_section_id,request_response_field_id,request_response_request_id) VALUES ${responseValues};`);

    plv8.execute(`INSERT INTO request_signer_table (request_signer_signer_id,request_signer_request_id) VALUES ${signerValues};`);

    plv8.execute(`INSERT INTO notification_table (notification_app,notification_content,notification_redirect_url,notification_team_id,notification_type,notification_user_id) VALUES ${notificationValues};`);
    
 });
 return request_data;
$$ LANGUAGE plv8;

-- End: Create request

-- Start: Approve or reject request
    
CREATE FUNCTION approve_or_reject_request(
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
      additionalInfo
    } = input_data;

    const present = { APPROVED: "APPROVE", REJECTED: "REJECT" };

     plv8.execute(`UPDATE request_signer_table SET request_signer_status = '${requestAction}' WHERE request_signer_signer_id='${requestSignerId}' AND request_signer_request_id='${requestId}';`);
    
    plv8.execute(`INSERT INTO comment_table (comment_request_id,comment_team_member_id,comment_type,comment_content) VALUES ('${requestId}','${memberId}','ACTION_${requestAction}','${signerFullName} ${requestAction.toLowerCase()}  this request');`);
    
    plv8.execute(`INSERT INTO notification_table (notification_app,notification_type,notification_content,notification_redirect_url,notification_user_id,notification_team_id) VALUES ('REQUEST','${present[requestAction]}','${signerFullName} ${requestAction.toLowerCase()} your ${formName} request','/team-requests/requests/${requestId}','${requestOwnerId}','${teamId}');`);
    
    if(isPrimarySigner===true){
      plv8.execute(`UPDATE request_table SET request_status = '${requestAction}', request_additional_info='${additionalInfo}' WHERE request_id='${requestId}';`);
    }
    
 });
$$ LANGUAGE plv8;

-- End: Approve or reject request

-- Start: Create formsly premade forms

CREATE FUNCTION create_formsly_premade_forms(
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

CREATE FUNCTION create_item(
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
        item_purpose,
        item_cost_code,
        item_gl_account,
        item_team_id
      },
      itemDescription
    } = input_data;

    
    const item_result = plv8.execute(`INSERT INTO item_table (item_general_name,item_is_available,item_unit,item_purpose,item_cost_code,item_gl_account,item_team_id) VALUES ('${item_general_name}','${item_is_available}','${item_unit}','${item_purpose}','${item_cost_code}','${item_gl_account}','${item_team_id}') RETURNING *;`)[0];

    const {section_id} = plv8.execute(`SELECT section_id FROM section_table WHERE section_form_id='${formId}' AND section_name='Item';`)[0];

    const itemDescriptionInput = [];
    const fieldInput= [];

    itemDescription.forEach((description) => {
      const fieldId = plv8.execute('SELECT uuid_generate_v4();')[0].uuid_generate_v4
      itemDescriptionInput.push({
        item_description_label: description,
        item_description_item_id: item_result.item_id,
        item_description_is_available: true,
        item_description_field_id: fieldId,
      });
      fieldInput.push({
        field_id: fieldId,
        field_name: description,
        field_type: "DROPDOWN",
        field_order: 10,
        field_section_id: section_id,
        field_is_required: true,
      });
    });

    const itemDescriptionValues = itemDescriptionInput
      .map((item) =>
        `('${item.item_description_label}','${item.item_description_item_id}','${item.item_description_is_available}','${item.item_description_field_id}')`
      )
      .join(",");

    const fieldValues = fieldInput
      .map((field) =>
        `('${field.field_id}','${field.field_name}','${field.field_type}','${field.field_order}','${field.field_section_id}','${field.field_is_required}')`
      )
      .join(",");

    plv8.execute(`INSERT INTO field_table (field_id,field_name,field_type,field_order,field_section_id,field_is_required) VALUES ${fieldValues};`);
    
    const item_description = plv8.execute(`INSERT INTO item_description_table (item_description_label,item_description_item_id,item_description_is_available,item_description_field_id) VALUES ${itemDescriptionValues} RETURNING *;`);

    item_data = {...item_result, item_description: item_description}

 });
 return item_data;
$$ LANGUAGE plv8;

-- End: Create item

-- Start: Create team invitation


CREATE FUNCTION create_team_invitation(
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

-- Start: Split OTP

CREATE FUNCTION split_otp(
    input_data JSON
)
RETURNS VOID AS $$
  plv8.subtransaction(function(){
    const {
      otpForm,
      formattedSection,
      teamMemberId,
      otpID,
      remainingQuantityList,
      approvedQuantityList,
      formattedData,
      teamId,
      signerFullName
    } = input_data;

    // update parent top request status
    plv8.execute(`UPDATE request_table SET request_status = 'PAUSED' WHERE request_id = '${otpID}'`);
    
    // create new otp request
    const newOTPRequest = plv8.execute(`
      INSERT INTO request_table 
      (request_form_id, request_team_member_id, request_additional_info, request_status)
      VALUES
      ('${otpForm.form_id}', '${formattedData.request_team_member_id}', 'SOURCED_OTP', 'PENDING'),
      ('${otpForm.form_id}', '${formattedData.request_team_member_id}', 'AVAILABLE_INTERNALLY', 'APPROVED')
      RETURNING *;
    `);

    // request response data
    const remainingOTPRequestResponseData = [];
    const approvedOTPRequestResponseData = [];

    // input the ID and Main section
    formattedSection.slice(0, 2).map((section) => {
      section.section_field.map((field) => {
        remainingOTPRequestResponseData.push({
          request_response:
            field.field_name === "Parent OTP ID"
              ? JSON.stringify(otpID)
              : `${field.field_response?.request_response}`,
          request_response_field_id: field.field_id,
          request_response_request_id: newOTPRequest[0].request_id,
          request_response_duplicatable_section_id:
            section.section_duplicatable_id ?? null,
        });
        approvedOTPRequestResponseData.push({
          request_response:
            field.field_name === "Parent OTP ID"
              ? JSON.stringify(otpID)
              : `${field.field_response?.request_response}`,
          request_response_field_id: field.field_id,
          request_response_request_id: newOTPRequest[1].request_id,
          request_response_duplicatable_section_id:
            section.section_duplicatable_id ?? null,
        });
      });
    });

    // populate request response data
    formattedSection.slice(2).map((section, sectionIndex) => {
      if (remainingQuantityList[sectionIndex] !== 0) {
        section.section_field.forEach((field) => {
          if (field.field_response?.request_response) {
            remainingOTPRequestResponseData.push({
              request_response:
                field.field_name === "Quantity"
                  ? `${remainingQuantityList[sectionIndex]}`
                  : `${field.field_response.request_response}`,
              request_response_field_id: field.field_id,
              request_response_request_id: newOTPRequest[0].request_id,
              request_response_duplicatable_section_id:
                field.field_response.request_response_duplicatable_section_id ??
                null,
            });
          }
        });
      }
      if (approvedQuantityList[sectionIndex] !== 0) {
        section.section_field.forEach((field) => {
          if (field.field_response?.request_response) {
            approvedOTPRequestResponseData.push({
              request_response:
                field.field_name === "Quantity"
                  ? `${approvedQuantityList[sectionIndex]}`
                  : `${field.field_response.request_response}`,
              request_response_field_id: field.field_id,
              request_response_request_id: newOTPRequest[1].request_id,
              request_response_duplicatable_section_id:
                field.field_response.request_response_duplicatable_section_id ??
                null,
            });
          }
        });
      }
    });

    // get request signers
    const remainingRequestSignerInput = [];
    const approvedRequestSignerInput = [];

    // request signer notification
    const signerNotificationInput = [];

    const formattedOtpForm = otpForm;
    formattedOtpForm.form_signer.forEach((signer) => {
      remainingRequestSignerInput.push({
        request_signer_signer_id: signer.signer_id,
        request_signer_request_id: newOTPRequest[0].request_id,
        request_signer_status: "PENDING",
      });

      // remaining otp request signer notification
      signerNotificationInput.push({
        notification_app: "REQUEST",
        notification_type: "REQUEST",
        notification_content: `${formattedData.request_team_member.team_member_user.user_first_name} ${formattedData.request_team_member.team_member_user.user_last_name} requested you to sign his/her Order to Purchase request`,
        notification_redirect_url: `/team-requests/requests/${newOTPRequest[0].request_id}`,
        notification_user_id:
          signer.signer_team_member.team_member_user.user_id,
        notification_team_id: teamId,
      });
      if (signer.signer_team_member.team_member_id === teamMemberId) {
        approvedRequestSignerInput.push({
          request_signer_signer_id: signer.signer_id,
          request_signer_request_id: newOTPRequest[1].request_id,
          request_signer_status: "APPROVED",
        });
      } else {
        approvedRequestSignerInput.push({
          request_signer_signer_id: signer.signer_id,
          request_signer_request_id: newOTPRequest[1].request_id,
          request_signer_status: "PENDING",
        });
      }
    });

    // create request responses
    let requestResponseInput = "";
    remainingOTPRequestResponseData.forEach((response) => {
      requestResponseInput += `('${response.request_response}', '${response.request_response_field_id}', '${response.request_response_request_id}', ${response.request_response_duplicatable_section_id ? `'${response.request_response_duplicatable_section_id}'` : "NULL"}), `;
    });
    approvedOTPRequestResponseData.forEach((response) => {
      requestResponseInput += `('${response.request_response}', '${response.request_response_field_id}', '${response.request_response_request_id}', ${response.request_response_duplicatable_section_id ? `'${response.request_response_duplicatable_section_id}'` : "NULL"}), `;
    });
    plv8.execute(`INSERT INTO request_response_table (request_response, request_response_field_id, request_response_request_id, request_response_duplicatable_section_id) VALUES ${requestResponseInput.slice(0, -2)};`);

    let requestSignerInput = "";
    remainingRequestSignerInput.forEach((signer) => {
      requestSignerInput += `('${signer.request_signer_signer_id}', '${signer.request_signer_request_id}', '${signer.request_signer_status}'), `;
    });
    approvedRequestSignerInput.forEach((signer) => {
      requestSignerInput += `('${signer.request_signer_signer_id}', '${signer.request_signer_request_id}', '${signer.request_signer_status}'), `;
    });
    plv8.execute(`INSERT INTO request_signer_table (request_signer_signer_id, request_signer_request_id, request_signer_status) VALUES ${requestSignerInput.slice(0, -2)};`);
    
    plv8.execute(`UPDATE request_signer_table SET request_signer_status = 'PAUSED' WHERE request_signer_id = '${formattedData.request_signer[0].request_signer_id}'`);
    

    // create comment
    plv8.execute(`
      INSERT INTO comment_table (comment_request_id, comment_team_member_id, comment_type, comment_content) 
      VALUES 
      ('${otpID}', '${teamMemberId}', 'ACTION_PAUSED', '${signerFullName} paused this request'),
      ('${newOTPRequest[1].request_id}', '${teamMemberId}', 'ACTION_APPROVED', '${signerFullName} approved this request');
    `);


    let notificationInput = "";
    signerNotificationInput.forEach((notification) => {
      notificationInput += `('REQUEST', 'REQUEST', '${formattedData.request_team_member.team_member_user.user_first_name} ${formattedData.request_team_member.team_member_user.user_last_name} requested you to sign his/her Order to Purchase request', '/team-requests/requests/${newOTPRequest[0].request_id}', '${notification.notification_user_id}', '${teamId}'), `;
    });
    notificationInput += `('REQUEST', 'PAUSE', '${signerFullName} paused your Order to Purchase request', '/team-requests/requests/${otpID}', '${formattedData.request_team_member.team_member_user.user_id}', '${teamId}'), `;
    notificationInput += `('REQUEST', 'APPROVE', '${signerFullName} approved your Order to Purchase request', '/team-requests/requests/${newOTPRequest[1].request_id}', '${formattedData.request_team_member.team_member_user.user_id}', '${teamId}'), `;

    // create notification
     plv8.execute(`
      INSERT INTO notification_table (notification_app, notification_type, notification_content, notification_redirect_url, notification_user_id, notification_team_id) 
      VALUES ${notificationInput.slice(0, -2)};
    `);
 });
$$ LANGUAGE plv8;

-- End: Split OTP

-- End: Get get SSOT

-- Start: Get user's active team id

CREATE FUNCTION get_user_active_team_id(
    user_id TEXT
)
RETURNS TEXT as $$
  let active_team_id;
  plv8.subtransaction(function(){
    const user_data = plv8.execute(`SELECT * FROM user_table WHERE user_id='${user_id}' LIMIT 1`)[0];
    
    if(!user_data.user_active_team_id){
      const team_member = plv8.execute(`SELECT * FROM team_member_table WHERE team_member_user_id='${user_id}' AND team_member_is_disabled='false' LIMIT 1`)[0];
      active_team_id = team_member.team_member_team_id
    }else{
      active_team_id = user_data.user_active_team_id
    }  
 });
 return active_team_id;
$$ LANGUAGE plv8;

-- End: Get user's active team id

-- Start: check if Order to Purchase form can be activated

CREATE FUNCTION check_order_to_purchase_form_status(
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

-- End: check if Order to Purchase form can be activated

-- Start: Transfer ownership 

CREATE FUNCTION transfer_ownership(
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

CREATE FUNCTION accept_team_invitation(
    invitation_id TEXT,
    team_id TEXT,
    user_id TEXT
)
RETURNS VOID as $$
  plv8.subtransaction(function(){

    plv8.execute(`UPDATE invitation_table SET invitation_status='ACCEPTED' WHERE invitation_id='${invitation_id}'`);
    plv8.execute(`INSERT INTO team_member_table (team_member_team_id, team_member_user_id) VALUES ('${team_id}', '${user_id}')`);
 });
$$ LANGUAGE plv8;

-- End: Accept team invitation

-- Start: Update request status to canceled

CREATE FUNCTION cancel_request(
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

CREATE FUNCTION create_request_form(
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
    
    const formmattedGroup = `{${groupList
      .map((group) => `"${group}"`)
      .join(",")}}`;

    form_data = plv8.execute(`INSERT INTO form_table (form_app,form_description,form_name,form_team_member_id,form_id,form_is_signature_required,form_is_for_every_member,form_group) VALUES ('${formType}','${formDescription}','${formName}','${teamMemberId}','${formId}','${isSignatureRequired}','${isForEveryone}', '${formmattedGroup}') RETURNING *`)[0];

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
    
    const section_query = `INSERT INTO section_table (section_id,section_form_id,section_is_duplicatable,section_name,section_order) VALUES ${sectionValues}`;

    const field_query = `INSERT INTO field_table (field_id,field_name,field_type,field_description,field_is_positive_metric,field_is_required,field_order,field_section_id) VALUES ${fieldValues}`;

    const option_query = `INSERT INTO option_table (option_id,option_value,option_description,option_order,option_field_id) VALUES ${optionValues}`;

    const signer_query = `INSERT INTO signer_table (signer_id,signer_form_id,signer_team_member_id,signer_action,signer_is_primary_signer,signer_order) VALUES ${signerValues}`;

    const all_query = `${section_query}; ${field_query}; ${optionInput.length>0?option_query:''}; ${signer_query};`
    
    plv8.execute(all_query);
 });
 return form_data;
$$ LANGUAGE plv8;

-- End: Create request form

-- Start: Get all notification

CREATE FUNCTION get_all_notification(
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

CREATE FUNCTION update_form_signer(
    input_data JSON
)
RETURNS JSON AS $$
  let signer_data;
  plv8.subtransaction(function(){
    const {
     formId,
     signers
    } = input_data;

    plv8.execute(`UPDATE signer_table SET signer_is_disabled=true WHERE signer_form_id='${formId}';`);

    const signerValues = signers
      .map(
        (signer) =>
          `('${signer.signer_id}','${formId}','${signer.signer_team_member_id}','${signer.signer_action}','${signer.signer_is_primary_signer}','${signer.signer_order}','${signer.signer_is_disabled}')`
      )
      .join(",");

    signer_data = plv8.execute(`INSERT INTO signer_table (signer_id,signer_form_id,signer_team_member_id,signer_action,signer_is_primary_signer,signer_order,signer_is_disabled) VALUES ${signerValues} ON CONFLICT ON CONSTRAINT signer_table_pkey DO UPDATE SET signer_team_member_id = excluded.signer_team_member_id, signer_action = excluded.signer_action, signer_is_primary_signer = excluded.signer_is_primary_signer, signer_order = excluded.signer_order, signer_is_disabled = excluded.signer_is_disabled RETURNING *;`);

 });
 return signer_data;
$$ LANGUAGE plv8;

-- End: Update form signer

-- Start: Update team and team member group list

CREATE FUNCTION update_team_and_team_member_group_list(
    input_data JSON
)
RETURNS VOID AS $$
  plv8.subtransaction(function(){
    const {
      teamId,
      teamGroupList,
      upsertGroupName,
      addedGroupMembers,
      deletedGroupMembers,
      previousName,
      previousGroupMembers
    } = input_data;

    plv8.execute(`UPDATE team_table SET team_group_list='{${teamGroupList.join(',')}}' WHERE team_id='${teamId}';`);

    if (addedGroupMembers.length !== 0) {
      
      const addTeamMemberCondition = addedGroupMembers.map((memberId) => `team_member_id='${memberId}'`).join(" OR ")

      const teamMemberList = plv8.execute(`SELECT * FROM team_member_table WHERE (${addTeamMemberCondition}) ;`);

      const upsertTeamMemberData = teamMemberList.map((member) => {
        return {
          ...member,
          team_member_group_list: [
            ...member.team_member_group_list,
            upsertGroupName,
          ],
        };
      }); 

      const teamMemberValues = upsertTeamMemberData
        .map(
          (member) =>
            `('${member.team_member_id}','${member.team_member_role}','${member.team_member_user_id}','${member.team_member_team_id}','${member.team_member_is_disabled}','{${member.team_member_project_list.join(',')}}','{${member.team_member_group_list.join(',')}}')`
        )
        .join(",");
        
      plv8.execute(`INSERT INTO team_member_table (team_member_id,team_member_role,team_member_user_id,team_member_team_id,team_member_is_disabled,team_member_project_list,team_member_group_list) VALUES ${teamMemberValues} ON CONFLICT ON CONSTRAINT team_member_table_pkey DO UPDATE SET team_member_id = excluded.team_member_id, team_member_role = excluded.team_member_role, team_member_user_id = excluded.team_member_user_id, team_member_team_id = excluded.team_member_team_id, team_member_is_disabled = excluded.team_member_is_disabled, team_member_project_list = excluded.team_member_project_list, team_member_group_list = excluded.team_member_group_list;`);
    }

    if (deletedGroupMembers.length !== 0) {
      const deleteTeamMemberCondition = deletedGroupMembers.map((memberId) => `team_member_id='${memberId}'`).join(" OR ")

      const teamMemberList = plv8.execute(`SELECT * FROM team_member_table WHERE (${deleteTeamMemberCondition}) ;`);

      const upsertTeamMemberData = teamMemberList.map((member) => {
        return {
          ...member,
          team_member_group_list: member.team_member_group_list.filter(
            (group) => group !== upsertGroupName
          ),
        };
      });

      const teamMemberValues = upsertTeamMemberData
        .map(
          (member) =>
            `('${member.team_member_id}','${member.team_member_role}','${member.team_member_user_id}','${member.team_member_team_id}','${member.team_member_is_disabled}','{${member.team_member_project_list.join(',')}}','{${member.team_member_group_list.join(',')}}')`
        )
        .join(",");
        
      plv8.execute(`INSERT INTO team_member_table (team_member_id,team_member_role,team_member_user_id,team_member_team_id,team_member_is_disabled,team_member_project_list,team_member_group_list) VALUES ${teamMemberValues} ON CONFLICT ON CONSTRAINT team_member_table_pkey DO UPDATE SET team_member_id = excluded.team_member_id, team_member_role = excluded.team_member_role, team_member_user_id = excluded.team_member_user_id, team_member_team_id = excluded.team_member_team_id, team_member_is_disabled = excluded.team_member_is_disabled, team_member_project_list = excluded.team_member_project_list, team_member_group_list = excluded.team_member_group_list;`);
    }

    if(previousName && (previousName !== upsertGroupName)){
      const updateTeamMemberCondition = previousGroupMembers.map((memberId) => `team_member_id='${memberId}'`).join(" OR ");

      const teamMemberList = plv8.execute(`SELECT * FROM team_member_table WHERE (${updateTeamMemberCondition}) ;`);

      const upsertTeamMemberData = teamMemberList.map((member) => {
        const groupList = member.team_member_group_list;
        const previousNameIndex = groupList.indexOf(previousName);
        groupList.splice(previousNameIndex, 1);
        return {
          ...member,
          team_member_group_list: groupList,
        };
      }); 

      const teamMemberValues = upsertTeamMemberData
        .map(
          (member) =>
            `('${member.team_member_id}','${member.team_member_role}','${member.team_member_user_id}','${member.team_member_team_id}','${member.team_member_is_disabled}','{${member.team_member_project_list.join(',')}}','{${member.team_member_group_list.join(',')}}')`
        )
        .join(",");

      plv8.execute(`INSERT INTO team_member_table (team_member_id,team_member_role,team_member_user_id,team_member_team_id,team_member_is_disabled,team_member_project_list,team_member_group_list) VALUES ${teamMemberValues} ON CONFLICT ON CONSTRAINT team_member_table_pkey DO UPDATE SET team_member_id = excluded.team_member_id, team_member_role = excluded.team_member_role, team_member_user_id = excluded.team_member_user_id, team_member_team_id = excluded.team_member_team_id, team_member_is_disabled = excluded.team_member_is_disabled, team_member_project_list = excluded.team_member_project_list, team_member_group_list = excluded.team_member_group_list;`);
    }
 });
$$ LANGUAGE plv8;

-- End: Update team and team member group list

-- Start: Update team and team member project list

CREATE FUNCTION update_team_and_team_member_project_list(
    input_data JSON
)
RETURNS VOID AS $$
  plv8.subtransaction(function(){
    const {
      teamId,
      teamProjectList,
      upsertProjectName,
      addedProjectMembers,
      deletedProjectMembers,
      previousName,
      previousProjectMembers
    } = input_data;

    plv8.execute(`UPDATE team_table SET team_project_list='{${teamProjectList.join(',')}}' WHERE team_id='${teamId}';`);

    if (addedProjectMembers.length !== 0) {
      
      const addTeamMemberCondition = addedProjectMembers.map((memberId) => `team_member_id='${memberId}'`).join(" OR ")

      const teamMemberList = plv8.execute(`SELECT * FROM team_member_table WHERE (${addTeamMemberCondition}) ;`);

      const upsertTeamMemberData = teamMemberList.map((member) => {
      return {
        ...member,
        team_member_project_list: [
          ...member.team_member_project_list,
          upsertProjectName,
        ],
      };
    });

      const teamMemberValues = upsertTeamMemberData
        .map(
          (member) =>
            `('${member.team_member_id}','${member.team_member_role}','${member.team_member_user_id}','${member.team_member_team_id}','${member.team_member_is_disabled}','{${member.team_member_project_list.join(',')}}','{${member.team_member_group_list.join(',')}}')`
        )
        .join(",");
        
      plv8.execute(`INSERT INTO team_member_table (team_member_id,team_member_role,team_member_user_id,team_member_team_id,team_member_is_disabled,team_member_project_list,team_member_group_list) VALUES ${teamMemberValues} ON CONFLICT ON CONSTRAINT team_member_table_pkey DO UPDATE SET team_member_id = excluded.team_member_id, team_member_role = excluded.team_member_role, team_member_user_id = excluded.team_member_user_id, team_member_team_id = excluded.team_member_team_id, team_member_is_disabled = excluded.team_member_is_disabled, team_member_project_list = excluded.team_member_project_list, team_member_group_list = excluded.team_member_group_list;`);
    }

    if (deletedProjectMembers.length !== 0) {
      const deleteTeamMemberCondition = deletedProjectMembers.map((memberId) => `team_member_id='${memberId}'`).join(" OR ")

      const teamMemberList = plv8.execute(`SELECT * FROM team_member_table WHERE (${deleteTeamMemberCondition}) ;`);

      const upsertTeamMemberData = teamMemberList.map((member) => {
        return {
          ...member,
          team_member_project_list: member.team_member_project_list.filter(
            (project) => project !== upsertProjectName
          ),
        };
      });

      const teamMemberValues = upsertTeamMemberData
        .map(
          (member) =>
            `('${member.team_member_id}','${member.team_member_role}','${member.team_member_user_id}','${member.team_member_team_id}','${member.team_member_is_disabled}','{${member.team_member_project_list.join(',')}}','{${member.team_member_group_list.join(',')}}')`
        )
        .join(",");
        
      plv8.execute(`INSERT INTO team_member_table (team_member_id,team_member_role,team_member_user_id,team_member_team_id,team_member_is_disabled,team_member_project_list,team_member_group_list) VALUES ${teamMemberValues} ON CONFLICT ON CONSTRAINT team_member_table_pkey DO UPDATE SET team_member_id = excluded.team_member_id, team_member_role = excluded.team_member_role, team_member_user_id = excluded.team_member_user_id, team_member_team_id = excluded.team_member_team_id, team_member_is_disabled = excluded.team_member_is_disabled, team_member_project_list = excluded.team_member_project_list, team_member_group_list = excluded.team_member_group_list;`);
    }

    if(previousName && (previousName !== upsertProjectName)){
      const updateTeamMemberCondition = previousProjectMembers.map((memberId) => `team_member_id='${memberId}'`).join(" OR ");

      const teamMemberList = plv8.execute(`SELECT * FROM team_member_table WHERE (${updateTeamMemberCondition}) ;`);

      const upsertTeamMemberData = teamMemberList.map((member) => {
        const projectList = member.team_member_project_list;
        const previousNameIndex = projectList.indexOf(previousName);
        projectList.splice(previousNameIndex, 1);
        return {
          ...member,
          team_member_project_list: projectList,
        };
      }); 

      const teamMemberValues = upsertTeamMemberData
        .map(
          (member) =>
            `('${member.team_member_id}','${member.team_member_role}','${member.team_member_user_id}','${member.team_member_team_id}','${member.team_member_is_disabled}','{${member.team_member_group_list.join(',')}}','{${member.team_member_project_list.join(',')}}')`
        )
        .join(",");

      plv8.execute(`INSERT INTO team_member_table (team_member_id,team_member_role,team_member_user_id,team_member_team_id,team_member_is_disabled,team_member_group_list,team_member_project_list) VALUES ${teamMemberValues} ON CONFLICT ON CONSTRAINT team_member_table_pkey DO UPDATE SET team_member_id = excluded.team_member_id, team_member_role = excluded.team_member_role, team_member_user_id = excluded.team_member_user_id, team_member_team_id = excluded.team_member_team_id, team_member_is_disabled = excluded.team_member_is_disabled, team_member_group_list = excluded.team_member_group_list, team_member_project_list = excluded.team_member_project_list;`);
    }
    
 });
$$ LANGUAGE plv8;

-- End: Update team and team member project list

-- Start: Delete team group
CREATE FUNCTION delete_team_group(
    input_data JSON
)
RETURNS VOID AS $$
  plv8.subtransaction(function(){
    const {
      teamId,
      groupList,
      groupMemberList,
      deletedGroup
    } = input_data;

    plv8.execute(`UPDATE team_table SET team_group_list='{${groupList.join(',')}}' WHERE team_id='${teamId}';`);

    if (groupMemberList.length !== 0) {
      const deleteTeamMemberCondition = groupMemberList.map((memberId) => `team_member_id='${memberId}'`).join(" OR ")

      const teamMemberList = plv8.execute(`SELECT * FROM team_member_table WHERE (${deleteTeamMemberCondition}) ;`);

      const deleteTeamMemberGroupData = teamMemberList.map((member) => {
        return {
          ...member,
          team_member_group_list: member.team_member_group_list.filter(
            (group) => group !== deletedGroup
          ),
        };
      });

      const teamMemberValues = deleteTeamMemberGroupData
        .map(
          (member) =>
            `('${member.team_member_id}','${member.team_member_role}','${member.team_member_user_id}','${member.team_member_team_id}','${member.team_member_is_disabled}','{${member.team_member_project_list.join(',')}}','{${member.team_member_group_list.join(',')}}')`
        )
        .join(",");
        
      plv8.execute(`INSERT INTO team_member_table (team_member_id,team_member_role,team_member_user_id,team_member_team_id,team_member_is_disabled,team_member_project_list,team_member_group_list) VALUES ${teamMemberValues} ON CONFLICT ON CONSTRAINT team_member_table_pkey DO UPDATE SET team_member_id = excluded.team_member_id, team_member_role = excluded.team_member_role, team_member_user_id = excluded.team_member_user_id, team_member_team_id = excluded.team_member_team_id, team_member_is_disabled = excluded.team_member_is_disabled, team_member_project_list = excluded.team_member_project_list, team_member_group_list = excluded.team_member_group_list;`);
    }
 });
$$ LANGUAGE plv8;

-- End: Delete team group

-- Start: Delete team project

CREATE FUNCTION delete_team_project(
    input_data JSON
)
RETURNS VOID AS $$
  plv8.subtransaction(function(){
    const {
      teamId,
      projectList,
      projectMemberList,
      deletedProject
    } = input_data;

    plv8.execute(`UPDATE team_table SET team_project_list='{${projectList.join(',')}}' WHERE team_id='${teamId}';`);

    if (projectMemberList.length !== 0) {
      const deleteTeamMemberCondition = projectMemberList.map((memberId) => `team_member_id='${memberId}'`).join(" OR ")

      const teamMemberList = plv8.execute(`SELECT * FROM team_member_table WHERE (${deleteTeamMemberCondition}) ;`);

      const deleteTeamMemberProjectData = teamMemberList.map((member) => {
        return {
          ...member,
          team_member_project_list: member.team_member_project_list.filter(
            (project) => project !== deletedProject
          ),
        };
      });

      const teamMemberValues = deleteTeamMemberProjectData
        .map(
          (member) =>
            `('${member.team_member_id}','${member.team_member_role}','${member.team_member_user_id}','${member.team_member_team_id}','${member.team_member_is_disabled}','{${member.team_member_project_list.join(',')}}','{${member.team_member_group_list.join(',')}}')`
        )
        .join(",");
        
      plv8.execute(`INSERT INTO team_member_table (team_member_id,team_member_role,team_member_user_id,team_member_team_id,team_member_is_disabled,team_member_project_list,team_member_group_list) VALUES ${teamMemberValues} ON CONFLICT ON CONSTRAINT team_member_table_pkey DO UPDATE SET team_member_id = excluded.team_member_id, team_member_role = excluded.team_member_role, team_member_user_id = excluded.team_member_user_id, team_member_team_id = excluded.team_member_team_id, team_member_is_disabled = excluded.team_member_is_disabled, team_member_project_list = excluded.team_member_project_list, team_member_group_list = excluded.team_member_group_list;`);
    }
 });
$$ LANGUAGE plv8;

-- End: Delete team project

-- Start: Check if the approving or creating quotation item quantity are less than the otp quantity

CREATE FUNCTION check_quotation_item_quantity(
    input_data JSON
)
RETURNS JSON AS $$
    let item_data
    plv8.subtransaction(function(){
        const {
        otpID,
        itemFieldId,
        quantityFieldId,
        itemFieldList,
        quantityFieldList
        } = input_data;

        const request = plv8.execute(`SELECT request_response_table.* FROM request_response_table JOIN request_table ON request_response_table.request_response_request_id = request_table.request_id AND request_table.request_status = 'APPROVED' AND request_table.request_form_id IS NOT NULL JOIN form_table ON request_table.request_form_id = form_table.form_id WHERE request_response_table.request_response = '${otpID}' AND form_table.form_is_formsly_form = true AND form_table.form_name = 'Quotation';`);
        
        let requestResponse = []
        if(request.length>0) {

            const requestIdList = request.map(
                (response) => `'${response.request_response_request_id}'`
            ).join(",");

            requestResponse = plv8.execute(`SELECT * FROM request_response_table WHERE (request_response_field_id = '${itemFieldId}' OR request_response_field_id = '${quantityFieldId}') AND request_response_request_id IN (${requestIdList});`);
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
        item_data = returnData;
    });
    return item_data;
$$ LANGUAGE plv8;

-- End: Check if the approving or creating quotation item quantity are less than the otp quantity

-- Start: Check if the approving or creating rir sourced item quantity are less than the quotation quantity

CREATE FUNCTION check_rir_sourced_item_quantity(
    input_data JSON
)
RETURNS JSON AS $$
    let item_data
    plv8.subtransaction(function(){
        const {
        otpId,
        itemFieldId,
        quantityFieldId,
        itemFieldList,
        quantityFieldList
        } = input_data;

        const request = plv8.execute(`SELECT request_response_table.* FROM request_response_table JOIN request_table ON request_response_table.request_response_request_id = request_table.request_id AND request_table.request_status = 'APPROVED' AND request_table.request_form_id IS NOT NULL JOIN form_table ON request_table.request_form_id = form_table.form_id WHERE request_response_table.request_response = '${otpId}' AND form_table.form_is_formsly_form = true AND form_table.form_name = 'Receiving Inspecting Report (Sourced)';`);
        
        let requestResponse = []
        if(request.length>0) {

            const requestIdList = request.map(
                (response) => `'${response.request_response_request_id}'`
            ).join(",");

            requestResponse = plv8.execute(`SELECT * FROM request_response_table WHERE (request_response_field_id = '${itemFieldId}' OR request_response_field_id = '${quantityFieldId}') AND request_response_request_id IN (${requestIdList});`);
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


-- End: Check if the approving or creating rir sourced item quantity are less than the quotation quantity

-- Start: Check if the approving or creating rir purchased item quantity are less than the quotation quantity

CREATE FUNCTION check_rir_purchased_item_quantity(
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

        const request = plv8.execute(`SELECT request_response_table.* FROM request_response_table JOIN request_table ON request_response_table.request_response_request_id = request_table.request_id AND request_table.request_status = 'APPROVED' AND request_table.request_form_id IS NOT NULL JOIN form_table ON request_table.request_form_id = form_table.form_id WHERE request_response_table.request_response = '${quotationId}' AND form_table.form_is_formsly_form = true AND form_table.form_name = 'Receiving Inspecting Report (Purchased)';`);
        
        let requestResponse = []
        if(request.length>0) {

            const requestIdList = request.map(
                (response) => `'${response.request_response_request_id}'`
            ).join(",");

            requestResponse = plv8.execute(`SELECT * FROM request_response_table WHERE (request_response_field_id = '${itemFieldId}' OR request_response_field_id = '${quantityFieldId}') AND request_response_request_id IN (${requestIdList});`);
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

-- End: Check if the approving or creating rir purchased item quantity are less than the quotation quantity

-- Start: Fetch request list

CREATE FUNCTION fetch_request_list(
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
    AND team_member_role in ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Allow DELETE for authenticated users with OWNER or ADMIN role" ON "public"."team_member_table"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  team_member_team_id IN (
    SELECT team_member_team_id from team_member_table
    WHERE team_member_user_id = auth.uid()
    AND team_member_role in ('OWNER', 'ADMIN')
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
USING (invitation_to_email = (SELECT user_email FROM user_table WHERE user_id = auth.uid()) OR invitation_from_team_member_id IN (SELECT team_member_id FROM team_member_table WHERE team_member_user_id = auth.uid()));

CREATE POLICY "Allow UPDATE for users based on invitation_from_team_member_id" ON "public"."invitation_table"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  invitation_from_team_member_id IN (
    SELECT team_member_id 
    FROM team_member_table 
    WHERE team_member_user_id = auth.uid()
  ) OR invitation_to_email = (
    SELECT user_email 
    FROM user_table 
    WHERE user_id = auth.uid()
  )
)

WITH CHECK (
  invitation_from_team_member_id IN (
    SELECT team_member_id 
    FROM team_member_table 
    WHERE team_member_user_id = auth.uid()
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

-------- End: POLICIES

---------- Start: INDEXES

CREATE INDEX request_response_request_id_idx ON request_response_table (request_response, request_response_request_id);
CREATE INDEX request_list_idx ON request_table (request_id, request_date_created, request_form_id, request_team_member_id, request_status);

-------- End: INDEXES

GRANT ALL ON ALL TABLES IN SCHEMA public TO PUBLIC;
GRANT ALL ON ALL TABLES IN SCHEMA public TO POSTGRES;

GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;