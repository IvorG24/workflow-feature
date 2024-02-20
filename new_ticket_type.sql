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

-- Start: Ticket Response

CREATE TABLE ticket_response_table(
  ticket_response_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  ticket_response_value VARCHAR(4000) NOT NULL,
  ticket_response_duplicatable_section_id UUID,
  
  ticket_response_ticket_id UUID REFERENCES ticket_table(ticket_id) NOT NULL,
  ticket_response_field_id UUID REFERENCES ticket_field_table(ticket_field_id) NOT NULL
);

-- END: Ticket Response

ALTER TABLE csi_code_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_category_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_section_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_field_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_option_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_response_table ENABLE ROW LEVEL SECURITY;

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

INSERT INTO ticket_category_table (ticket_category_id, ticket_category) VALUES
('1e9aef8b-cf84-4443-9e07-d9ad2461a301', 'General'),
('a2cfde15-1b4a-41b2-8415-08221148ca2d', 'Feature Request'),
('f57ced26-0b93-472f-8268-c41fbd7e010b', 'Item Request'),
('f9d44ea0-4cdb-427f-8224-bc16fd92f1be', 'Request Custom CSI'),
('ea67c627-6975-4e01-9c2d-445ae61fa144', 'Request Item CSI'),
('f1759af2-2a07-460d-9a72-86faf8eccd85', 'Request Item Option'),
('2df7ca37-444f-4e71-9c84-ad0d6f3e77b5', 'Incident Report for Employees'),
('c9f373c8-09d6-46f0-92cb-5efeffd72758', 'Bug Report');

INSERT INTO ticket_section_table (ticket_section_id, ticket_section_name, ticket_section_is_duplicatable, ticket_section_category_id) VALUES
('0db787b2-092f-4499-ab82-2c42a459c8f0', 'Request Details', false, '1e9aef8b-cf84-4443-9e07-d9ad2461a301'),
('caac5b9c-c233-4370-b45d-37f43c73cbdb', 'Request Details', false, 'a2cfde15-1b4a-41b2-8415-08221148ca2d'),
('2b701e68-18e5-4bd6-a966-5809ea11e236', 'Request Details', false, 'f57ced26-0b93-472f-8268-c41fbd7e010b'),
('5f3aeb4a-c5e9-4d4f-9e9b-d241d52ebe1e', 'Request Details', false, 'f9d44ea0-4cdb-427f-8224-bc16fd92f1be'),
('8b05e5e1-f521-449d-8ec5-106acd7936f6', 'Request Details', false, 'ea67c627-6975-4e01-9c2d-445ae61fa144'),
('6031d434-e930-445a-afc3-184cf1f7ab4d', 'Item', false, 'f1759af2-2a07-460d-9a72-86faf8eccd85'),
('a6b7c597-681f-4b2d-84c2-8bf267133fc4', 'Request Option', true, 'f1759af2-2a07-460d-9a72-86faf8eccd85'),
('ae0991e6-e3a4-452d-ac4b-d78908b99819', 'Request Details', false, '2df7ca37-444f-4e71-9c84-ad0d6f3e77b5'),
('222576c2-ef0b-4714-ac10-2f57d310c9f0', 'Request Details', false, 'c9f373c8-09d6-46f0-92cb-5efeffd72758');

INSERT INTO ticket_field_table (ticket_field_id, ticket_field_name, ticket_field_type, ticket_field_is_required, ticket_field_is_read_only, ticket_field_order, ticket_field_section_id) VALUES 
('849c0073-ec1e-4557-beed-6e930cd69c78', 'Title', 'TEXT', true, false, 1, '0db787b2-092f-4499-ab82-2c42a459c8f0'),
('8b034462-a8d3-4649-8832-d248d94024c1', 'Description', 'TEXTAREA', true, false, 2, '0db787b2-092f-4499-ab82-2c42a459c8f0'),

('2bcf2775-5a25-43fc-9422-3665e9585af0', 'Title', 'TEXT', true, false, 1, 'caac5b9c-c233-4370-b45d-37f43c73cbdb'),
('b5ff3145-e454-40bf-a1f4-96516807c34a', 'Description', 'TEXTAREA', true, false, 2, 'caac5b9c-c233-4370-b45d-37f43c73cbdb'),

('2fb7b796-2e56-48cb-b0c8-db43a6ed97c3', 'Title', 'TEXT', true, false, 1, '2b701e68-18e5-4bd6-a966-5809ea11e236'),
('f22f1777-b776-4dbd-bd5f-a1baacd01d18', 'Description', 'TEXTAREA', true, false, 2, '2b701e68-18e5-4bd6-a966-5809ea11e236'),

('c272d2d6-c652-4cb0-8aee-71cfac888b4b', 'Item Name', 'SELECT', true, false, 1, '5f3aeb4a-c5e9-4d4f-9e9b-d241d52ebe1e'),
('072c4570-74ca-4629-9fd7-c7ecf5303621', 'CSI Code Description', 'TEXT', true, false, 2, '5f3aeb4a-c5e9-4d4f-9e9b-d241d52ebe1e'),
('2bd89b57-6e78-4f9d-85eb-254a63929875', 'CSI Code', 'TEXT', true, false, 3, '5f3aeb4a-c5e9-4d4f-9e9b-d241d52ebe1e'),

('d86cc7a1-4754-47fd-a010-4fd00f690b8c', 'Item Name', 'SELECT', true, false, 1, '8b05e5e1-f521-449d-8ec5-106acd7936f6'),
('a9d21d82-423e-4b05-8a02-be6df5444b86', 'CSI Code Description', 'SELECT', true, false, 2, '8b05e5e1-f521-449d-8ec5-106acd7936f6'),
('9adb2f64-6a87-4572-be6f-476af2a45b41', 'CSI Code', 'TEXT', true, true, 3, '8b05e5e1-f521-449d-8ec5-106acd7936f6'),
('d6870b74-26b0-47f4-9ba6-93ea932aef3c', 'Division Description', 'TEXT', true, true, 4, '8b05e5e1-f521-449d-8ec5-106acd7936f6'),
('1bddaf83-e973-4c94-b070-dbaa22cda2ff', 'Level 2 Major Group Description', 'TEXT', true, true, 5, '8b05e5e1-f521-449d-8ec5-106acd7936f6'),
('f6f1fdbd-d833-40ab-aba9-178d66250117', 'Level 2 Minor Group Description', 'TEXT', true, true, 6, '8b05e5e1-f521-449d-8ec5-106acd7936f6'),

('418ee61a-e406-4e91-ae14-66e4d1c62ce6', 'Item Name', 'SELECT', true, false, 1, '6031d434-e930-445a-afc3-184cf1f7ab4d'),
('88d1a4f2-6905-4b40-877b-25432ed1adad', 'Item Description', 'SELECT', true, false, 2, '6031d434-e930-445a-afc3-184cf1f7ab4d'),
('bad0c5f1-c3e1-49f9-8a59-97d96eaaddc9', 'Value', 'TEXT', true, false, 3, 'a6b7c597-681f-4b2d-84c2-8bf267133fc4'),
('b33631fb-9dcd-485b-a688-338c1f566b5a', 'Base Unit of Measurement', 'SELECT', false, true, 4, 'a6b7c597-681f-4b2d-84c2-8bf267133fc4'),

('39c506f4-f58b-4fe9-8f40-64f48f75b8ce', 'Reportee', 'SELECT', true, false, 1, 'ae0991e6-e3a4-452d-ac4b-d78908b99819'),
('7fbed2f3-e9b0-4149-9271-abea4a8fefc5', 'Description of Incident', 'TEXTAREA', true, false, 2, 'ae0991e6-e3a4-452d-ac4b-d78908b99819'),
('4c1c1a20-8d8e-4058-be5b-51bf550ef9ad', 'Immediate Actions Taken', 'TEXTAREA', true, false, 3, 'ae0991e6-e3a4-452d-ac4b-d78908b99819'),
('78a2a55f-fab8-403c-bceb-e989342e1254', 'Evidence/Attachment', 'FILE', true, false, 4, 'ae0991e6-e3a4-452d-ac4b-d78908b99819'),

('e88d49ee-c4eb-4b48-b0e2-bfc061bd2a03', 'What feature is being impacted?', 'TEXT', true, false, 1, '222576c2-ef0b-4714-ac10-2f57d310c9f0'),
('1964674d-817c-43e1-b180-d451a308e250', 'What Space/List/View is impacted?', 'TEXT', true, false, 2, '222576c2-ef0b-4714-ac10-2f57d310c9f0'),
('445a0329-57a2-4beb-b066-1781798c2142', 'Steps to reproduce issue?', 'TEXTAREA', true, false, 3, '222576c2-ef0b-4714-ac10-2f57d310c9f0'),
('09f90c2f-d6e0-4ed2-b169-670cf9c5691b', 'Description', 'TEXTAREA', true, false, 4, '222576c2-ef0b-4714-ac10-2f57d310c9f0'),
('c422d499-ba4c-4ef1-a36d-f9ff6d55aa68', 'Attachment', 'FILE', true, false, 5, '222576c2-ef0b-4714-ac10-2f57d310c9f0');


INSERT INTO storage.buckets (id, name) VALUES ('TICKET_ATTACHMENTS', 'TICKET_ATTACHMENTS');

UPDATE storage.buckets SET public = true;

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

    let ticketForm

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
    } else {
      returnData = { ticket_sections: sectionList }
    }
 });
 return returnData;
$$ LANGUAGE plv8;

-- End: Get ticket form

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

    const ticket = plv8.execute(`SELECT ticket_approver_team_member_id FROM ticket_table WHERE ticket_id='${ticketId}'`)[0];
    const member = plv8.execute(`SELECT *  FROM team_member_table WHERE team_member_id='${teamMemberId}';`)[0];

    const isApprover = member.team_member_role === 'OWNER' || member.team_member_role === 'ADMIN';
    if (!isApprover) throw new Error("User is not an Approver");

    const hasApprover = ticket.ticket_approver_team_member_id !== null
    if (hasApprover) throw new Error("Ticket already have approver");
    
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

CREATE OR REPLACE FUNCTION update_tickets()
RETURNS JSON AS $$
  plv8.subtransaction(function(){
    
    const ticketData = plv8.execute(`SELECT * FROM ticket_table`);
    const commentData = plv8.execute(`SELECT * FROM ticket_comment_table`);

    plv8.execute(`DELETE FROM ticket_comment_table`);
    plv8.execute(`DELETE FROM ticket_table`);
    plv8.execute(`ALTER TABLE ticket_table DROP COLUMN ticket_title`);
    plv8.execute(`ALTER TABLE ticket_table DROP COLUMN ticket_description`);
    plv8.execute(`ALTER TABLE ticket_table DROP COLUMN ticket_category`);
    plv8.execute(`ALTER TABLE ticket_table ADD ticket_is_disabled BOOLEAN DEFAULT false NOT NULL`);
    plv8.execute(`ALTER TABLE ticket_table ADD ticket_category_id UUID REFERENCES ticket_category_table(ticket_category_id) NOT NULL`);

    const capitalizeFirstLetterOfEachWord = (str) => {
        let words = str.split(' ');
        for (let i = 0; i < words.length; i++) {
            // Capitalize the first letter of the word
            words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase();
        }
        return words.join(' ');
    };

    ticketData.forEach(ticket => {
        const categoryId = plv8.execute(`SELECT ticket_category_id FROM ticket_category_table WHERE ticket_category = '${capitalizeFirstLetterOfEachWord(ticket.ticket_category)}'`)[0].ticket_category_id;
        const sectionId = plv8.execute(`SELECT ticket_section_id FROM ticket_section_table WHERE ticket_section_category_id = '${categoryId}'`)[0].ticket_section_id;
        const titleFieldId = plv8.execute(`SELECT ticket_field_id FROM ticket_field_table WHERE ticket_field_name = 'Title' AND ticket_field_section_id = '${sectionId}'`)[0].ticket_field_id;
        const descriptionFieldId = plv8.execute(`SELECT ticket_field_id FROM ticket_field_table WHERE ticket_field_name = 'Description' AND ticket_field_section_id = '${sectionId}'`)[0].ticket_field_id;

        if (ticket.ticket_approver_team_member_id) {
            plv8.execute(
                `
                    INSERT INTO ticket_table (
                        ticket_id,
                        ticket_status,
                        ticket_date_created,
                        ticket_status_date_updated,
                        ticket_category_id,
                        ticket_requester_team_member_id,
                        ticket_approver_team_member_id
                    ) 
                    VALUES (
                        '${ticket.ticket_id}',
                        '${ticket.ticket_status}',
                        '${new Date(ticket.ticket_date_created).toISOString()}',
                        '${new Date(ticket.ticket_status_date_updated).toISOString()}',
                        '${categoryId}',
                        '${ticket.ticket_requester_team_member_id}',
                        '${ticket.ticket_approver_team_member_id}'
                    )
                `
            );
        } else {
            plv8.execute(
                `
                    INSERT INTO ticket_table (
                        ticket_id,
                        ticket_status,
                        ticket_date_created,
                        ticket_status_date_updated,
                        ticket_category_id,
                        ticket_requester_team_member_id
                    ) 
                    VALUES (
                        '${ticket.ticket_id}',
                        '${ticket.ticket_status}',
                        '${new Date(ticket.ticket_date_created).toISOString()}',
                        '${new Date(ticket.ticket_status_date_updated).toISOString()}',
                        '${categoryId}',
                        '${ticket.ticket_requester_team_member_id}'
                    )
                `
            );
        }

        plv8.execute(
            `
                INSERT INTO ticket_response_table (
                    ticket_response_value, 
                    ticket_response_ticket_id, 
                    ticket_response_field_id
                ) 
                VALUES (
                    '${ticket.ticket_title}',
                    '${ticket.ticket_id}',
                    '${titleFieldId}'
                )
            `
        );

        plv8.execute(
            `
                INSERT INTO ticket_response_table (
                    ticket_response_value, 
                    ticket_response_ticket_id, 
                    ticket_response_field_id
                ) 
                VALUES (
                    '${ticket.ticket_description}',
                    '${ticket.ticket_id}',
                    '${descriptionFieldId}'
                )
            `
        );
    });
    

    commentData.forEach(comment => {
        const escapedResponse = comment.ticket_comment_content.replace(/'/g, "''");

        plv8.execute(
            `
                INSERT INTO ticket_comment_table (
                    ticket_comment_id,
                    ticket_comment_content,
                    ticket_comment_is_disabled,
                    ticket_comment_is_edited,
                    ticket_comment_type,
                    ticket_comment_date_created,
                    ticket_comment_last_updated,
                    ticket_comment_ticket_id,
                    ticket_comment_team_member_id
                ) 
                VALUES (
                    '${comment.ticket_comment_id}',
                    '${escapedResponse}',
                    '${comment.ticket_comment_is_disabled}',
                    '${comment.ticket_comment_is_edited}',
                    '${comment.ticket_comment_type}',
                    '${new Date(comment.ticket_comment_date_created).toISOString()}',
                    '${new Date(comment.ticket_comment_last_updated).toISOString()}',
                    '${comment.ticket_comment_ticket_id}',
                    '${comment.ticket_comment_team_member_id}'
                )
            `
        );
    });
 });
$$ LANGUAGE plv8;
SELECT update_tickets();
DROP FUNCTION IF EXISTS update_tickets;


GRANT ALL ON ALL TABLES IN SCHEMA public TO PUBLIC;
GRANT ALL ON ALL TABLES IN SCHEMA public TO POSTGRES;

GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

