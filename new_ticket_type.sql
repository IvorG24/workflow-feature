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
('8b034462-a8d3-4649-8832-d248d94024c1', 'Description', 'TEXT', true, false, 2, '0db787b2-092f-4499-ab82-2c42a459c8f0'),

('2bcf2775-5a25-43fc-9422-3665e9585af0', 'Title', 'TEXT', true, false, 1, 'caac5b9c-c233-4370-b45d-37f43c73cbdb'),
('b5ff3145-e454-40bf-a1f4-96516807c34a', 'Description', 'TEXT', true, false, 2, 'caac5b9c-c233-4370-b45d-37f43c73cbdb'),

('2fb7b796-2e56-48cb-b0c8-db43a6ed97c3', 'Title', 'TEXT', true, false, 1, '2b701e68-18e5-4bd6-a966-5809ea11e236'),
('f22f1777-b776-4dbd-bd5f-a1baacd01d18', 'Description', 'TEXT', true, false, 2, '2b701e68-18e5-4bd6-a966-5809ea11e236'),

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
('b33631fb-9dcd-485b-a688-338c1f566b5a', 'Base UoM', 'TEXT', true, false, 4, 'a6b7c597-681f-4b2d-84c2-8bf267133fc4'),

('39c506f4-f58b-4fe9-8f40-64f48f75b8ce', 'Reportee', 'SELECT', true, false, 1, 'ae0991e6-e3a4-452d-ac4b-d78908b99819'),
('7fbed2f3-e9b0-4149-9271-abea4a8fefc5', 'Description of Incident', 'TEXTAREA', true, false, 2, 'ae0991e6-e3a4-452d-ac4b-d78908b99819'),
('4c1c1a20-8d8e-4058-be5b-51bf550ef9ad', 'Immediate Actions Taken', 'TEXTAREA', true, false, 3, 'ae0991e6-e3a4-452d-ac4b-d78908b99819'),
('78a2a55f-fab8-403c-bceb-e989342e1254', 'Evidence/Attachment', 'FILE', true, false, 4, 'ae0991e6-e3a4-452d-ac4b-d78908b99819'),

('e88d49ee-c4eb-4b48-b0e2-bfc061bd2a03', 'What feature is being impacted?', 'TEXT', true, false, 1, '222576c2-ef0b-4714-ac10-2f57d310c9f0'),
('1964674d-817c-43e1-b180-d451a308e250', 'What Space/List/View is impacted?', 'TEXT', true, false, 2, '222576c2-ef0b-4714-ac10-2f57d310c9f0'),
('445a0329-57a2-4beb-b066-1781798c2142', 'Steps to reproduce issue?', 'TEXTAREA', true, false, 3, '222576c2-ef0b-4714-ac10-2f57d310c9f0'),
('09f90c2f-d6e0-4ed2-b169-670cf9c5691b', 'Description', 'TEXTAREA', true, false, 4, '222576c2-ef0b-4714-ac10-2f57d310c9f0'),
('c422d499-ba4c-4ef1-a36d-f9ff6d55aa68', 'Attachment', 'FILE', true, false, 5, '222576c2-ef0b-4714-ac10-2f57d310c9f0');

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

-- Start: Create ticket on load


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
    } else {
      returnData = { ticket_sections: sectionList }
    }
 });
 return returnData;
$$ LANGUAGE plv8;


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

