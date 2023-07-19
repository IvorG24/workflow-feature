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

-- Start: Get get SSOT

CREATE FUNCTION get_ssot(
    input_data JSON
)
RETURNS JSON as $$
  let ssot_data;
  plv8.subtransaction(function(){
    const {
      activeTeam,
      pageNumber,
      rowLimit
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

    const otp_requests = plv8.execute(`SELECT request_id, request_date_created, request_team_member_id FROM request_table WHERE request_status='APPROVED' AND request_form_id='${otp_form.form_id}' ORDER BY request_date_created DESC OFFSET ${rowStart} ROWS FETCH FIRST ${rowLimit} ROWS ONLY`);
    ssot_data = otp_requests.map(otp => {
      // OTP request response
      const otp_response = plv8.execute(`SELECT request_response, request_response_field_id FROM request_response_table WHERE request_response_request_id='${otp.request_id}'`);
      
      // OTP request respone with fields
      const otp_response_fields = otp_response.map(response => {
        const field = plv8.execute(`SELECT field_name, field_type FROM field_table WHERE field_id='${response.request_response_field_id}'`)[0];
        return {
          request_response: response.request_response,
          request_response_field_name: field.field_name,
          request_response_field_type: field.field_type,
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
          
          // Quotation request respone with fields
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
              
              // rir request respone with fields
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
          
          // cheque_reference request respone with fields
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
          
          // rir request respone with fields
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

-- End: Get get SSOT

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
      active_team_id = team_member.team_member_team_id
    }else{
      active_team_id = user_data.user_active_team_id
    }  
 });
 return active_team_id;
$$ LANGUAGE plv8;

-- End: Get user's active team id

-- Start: check if Order to Purchase form can be activated

CREATE OR REPLACE FUNCTION check_order_to_purchase_form_status(
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
RETURNS VOID as $$
  plv8.subtransaction(function(){

    plv8.execute(`UPDATE invitation_table SET invitation_status='ACCEPTED' WHERE invitation_id='${invitation_id}'`);
    plv8.execute(`INSERT INTO team_member_table (team_member_team_id, team_member_user_id) VALUES ('${team_id}', '${user_id}')`);
 });
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

---------- End: FUNCTIONS

---------- Start: VIEWS

CREATE VIEW request_list_table_view AS
SELECT
  r.request_id,
  r.request_date_created,
  r.request_status,
  r.request_team_member_id,
  tm.team_member_team_id as request_team_id,
  json_build_object(
    'user_id', tm.team_member_user_id,
    'user_first_name', u.user_first_name,
    'user_last_name', u.user_last_name,
    'user_avatar', u.user_avatar,
    'team_id', tm.team_member_team_id
  ) AS request_requestor,
  f.form_id AS request_form_id,
  f.form_name,
  f.form_description,
  json_agg(
    json_build_object(
      'request_signer_id', rs.request_signer_id,
      'is_primary_signer', s.signer_is_primary_signer,
      'team_member_id', stm.team_member_user_id,
      'user_first_name', su.user_first_name,
      'user_last_name', su.user_last_name,
      'user_avatar', su.user_avatar
    )
  ) AS request_signers
FROM
  request_table AS r
  LEFT JOIN team_member_table AS tm ON r.request_team_member_id = tm.team_member_id
  LEFT JOIN user_table AS u ON tm.team_member_user_id = u.user_id
  LEFT JOIN form_table AS f ON r.request_form_id = f.form_id
  LEFT JOIN request_signer_table AS rs ON r.request_id = rs.request_signer_request_id
  LEFT JOIN signer_table AS s ON rs.request_signer_signer_id = s.signer_id
  LEFT JOIN team_member_table AS stm ON s.signer_team_member_id = stm.team_member_id
  LEFT JOIN user_table AS su ON stm.team_member_user_id = su.user_id
GROUP BY
  r.request_id,
  r.request_date_created,
  r.request_status,
  tm.team_member_user_id,
  u.user_first_name,
  u.user_last_name,
  u.user_avatar,
  tm.team_member_team_id,
  f.form_id,
  f.form_name,
  f.form_description;

---------- End: VIEWS


GRANT ALL ON ALL TABLES IN SCHEMA public TO PUBLIC;
GRANT ALL ON ALL TABLES IN SCHEMA public TO POSTGRES;

GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;