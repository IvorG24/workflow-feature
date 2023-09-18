-- create a temporary table to access global variable values
CREATE TEMPORARY TABLE seed_variable_table (
  var_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  var_key VARCHAR(4000) UNIQUE NOT NULL,
  var_value VARCHAR(4000) NOT NULL
);

INSERT INTO seed_variable_table (var_key, var_value) VALUES
('ownerMemberId', gen_random_uuid()),
('requisitionFormId', gen_random_uuid()),
('quotationFormId', gen_random_uuid()),
('rirFormId', gen_random_uuid()),
('sourcedItemFormId', gen_random_uuid()),
('roFormId', gen_random_uuid()),
('transferReceiptFormId', gen_random_uuid()),
('allFieldsFormId', gen_random_uuid()),
('duplicateFieldsFormId', gen_random_uuid());

-- CREATE FORMS SEED

DO $$
DECLARE
-- member ids
  ownerMemberId UUID;
-- form ids
  allFieldsFormId UUID;
  duplicateFieldsFormId UUID;
  requisitionFormId UUID;
  quotationFormId UUID;
  rirFormId UUID;
  sourcedItemFormId UUID;
  roFormId UUID;
  transferReceiptFormId UUID;

-- section ids
  allFieldsSectionId1 UUID;
  allFieldsSectionId2 UUID;
  allFieldsSectionId3 UUID;
  duplicateFieldsSection1 UUID;
  duplicateFieldsSection2 UUID;
  duplicateFieldsSection3 UUID;

BEGIN

-- Create new team
INSERT INTO team_table (team_id, team_name, team_user_id) VALUES
('2cfc4947-a9be-43f8-9037-c0ae7ec04bd2', 'XYZ Corp', 'beb2d52c-77d5-49a9-a175-637152c44424');

SELECT var_value INTO ownerMemberId
  FROM seed_variable_table
  WHERE var_key = 'ownerMemberId';

INSERT INTO team_member_table (team_member_id, team_member_role, team_member_team_id, team_member_user_id) VALUES
(ownerMemberId, 'OWNER', '2cfc4947-a9be-43f8-9037-c0ae7ec04bd2', 'beb2d52c-77d5-49a9-a175-637152c44424'),
('0a61a37f-7805-4fe5-8856-3c7fa801c744', 'ADMIN', '2cfc4947-a9be-43f8-9037-c0ae7ec04bd2', 'dd689b20-8293-4b8a-b9c6-9a5cc63f659c'),
('a750df8c-35fe-48d6-862a-1135c8f96a9a', 'ADMIN', '2cfc4947-a9be-43f8-9037-c0ae7ec04bd2', '930de3a6-181d-449e-8890-0aa055947d80');

-- Create Forms
SELECT var_value INTO allFieldsFormId
  FROM seed_variable_table
  WHERE var_key = 'allFieldsFormId';

SELECT var_value INTO duplicateFieldsFormId
  FROM seed_variable_table
  WHERE var_key = 'duplicateFieldsFormId';

SELECT var_value INTO requisitionFormId
  FROM seed_variable_table
  WHERE var_key = 'requisitionFormId';

SELECT var_value INTO quotationFormId
  FROM seed_variable_table
  WHERE var_key = 'quotationFormId';

SELECT var_value INTO rirFormId
  FROM seed_variable_table
  WHERE var_key = 'rirFormId';

SELECT var_value INTO sourcedItemFormId
  FROM seed_variable_table
  WHERE var_key = 'sourcedItemFormId';

SELECT var_value INTO roFormId
  FROM seed_variable_table
  WHERE var_key = 'roFormId';

SELECT var_value INTO transferReceiptFormId
  FROM seed_variable_table
  WHERE var_key = 'transferReceiptFormId';

INSERT INTO form_table (form_id, form_name, form_description, form_app, form_team_member_id, form_is_formsly_form, form_is_hidden, form_is_for_every_member) VALUES
(allFieldsFormId, 'All Fields', 'test all types of fields', 'REQUEST', ownerMemberId, false, false, true),
(duplicateFieldsFormId, 'Duplicatable Sections', 'test field duplicatable sections', 'REQUEST', ownerMemberId, false, false, true),
(requisitionFormId, 'Requisition', 'formsly premade Requisition form', 'REQUEST', ownerMemberId, true, false, false),
(quotationFormId, 'Quotation', 'formsly premade Quotation form', 'REQUEST', ownerMemberId, true, true, false),
(rirFormId, 'Receiving Inspecting Report', 'These items were not available during this Requsitions sourcing step.', 'REQUEST', ownerMemberId, true, true, false),
(sourcedItemFormId, 'Sourced Item', 'formsly premade Sourced Item form.', 'REQUEST', ownerMemberId, true, true, false),
(roFormId, 'Release Order', 'These items were available during this Requsitions sourcing step.', 'REQUEST', ownerMemberId, true, true, false),
(transferReceiptFormId, 'Transfer Receipt', 'formsly premade Transfer Receipt form', 'REQUEST', ownerMemberId, true, true, false);

-- Add section
allFieldsSectionId1 := gen_random_uuid();
allFieldsSectionId2 := gen_random_uuid();
allFieldsSectionId3 := gen_random_uuid();
duplicateFieldsSection1 := gen_random_uuid();
duplicateFieldsSection2 := gen_random_uuid();
duplicateFieldsSection3 := gen_random_uuid();

INSERT INTO section_table (section_id, section_name, section_order, section_is_duplicatable, section_form_id) VALUES 
-- All fields Form
(allFieldsSectionId1, 'All fields Section 1', 1, false, allFieldsFormId),
(allFieldsSectionId2, 'All fields Section 2', 2, false, allFieldsFormId),
(allFieldsSectionId3, 'All fields Section 3', 3, false, allFieldsFormId),

-- Duplicatable Form
(duplicateFieldsSection1, 'Duplicatable Section 1', 1, true, duplicateFieldsFormId),
(duplicateFieldsSection2, 'Normal Section 2', 2, false, duplicateFieldsFormId),
(duplicateFieldsSection3, 'Duplicatable Section 3', 3, true, duplicateFieldsFormId),

-- Requisition
('4825cada-afc4-4657-affd-7f5be69a48e6', 'Main', 1, false, 'd13b3b0f-14df-4277-b6c1-7c80f7e7a829'),
('c44e8f72-c112-4fb4-a5a4-b2619ac77aa1', 'Item', 2, true, 'd13b3b0f-14df-4277-b6c1-7c80f7e7a829'),

-- Sourced Item
('dc06e690-9dd1-46e8-a769-0f83ea5cb215', 'ID', 1, false, 'e5062660-9026-4629-bc2c-633826fdaa24'),
('26a2cb17-1b90-434a-a8f1-e54479af3927', 'Item', 2, true, 'e5062660-9026-4629-bc2c-633826fdaa24'),

-- Quotation
('92ba57aa-ee3d-47bc-889f-744c4ea68565', 'ID', 1, false, 'a732196f-9779-45e2-85fa-7320397e5b0a'),
('1ada0454-f349-462a-8178-3f91c24a89d4', 'Main', 2, false, 'a732196f-9779-45e2-85fa-7320397e5b0a'),
('aded878d-be2a-4cb6-8431-c61bcb90a0ae', 'Additional Charges', 3, false, 'a732196f-9779-45e2-85fa-7320397e5b0a'),
('46647207-4894-4ed6-9c75-1d0f37ea3d72', 'Item', 4, true, 'a732196f-9779-45e2-85fa-7320397e5b0a'),

-- Receiving Inspecting Report
('322a7743-2771-419a-880e-da6e69eb2b67', 'ID', 1, false, '5782d70a-5f6b-486c-a77f-401066afd005'),
('942ecf49-1ce4-4dbb-a570-231844546a58', 'Quality Check', 2, false, '5782d70a-5f6b-486c-a77f-401066afd005'),
('0c069155-289d-4628-8985-bdac8bc65cd3', 'Item', 3, true, '5782d70a-5f6b-486c-a77f-401066afd005'),

-- Release Order
('b9a5efac-c020-42cf-8196-97792583e1a4', 'ID', 1, false, '391c1b8c-db12-42ff-ad4a-4ea7680243d7'),
('396d543e-e86d-41cd-80eb-c1d8d9c24b30', 'Item', 2, true, '391c1b8c-db12-42ff-ad4a-4ea7680243d7'),

-- Transfer Receipt
('5c8cf8df-a20e-46bb-8e22-b0e2a90624ab', 'ID', 1, false, '8e173d92-c346-4fb5-8ef2-490105e19263'),
('7018f1d5-5ffd-4853-8fca-9cce1e7a2409', 'Quantity Check', 2, false, '8e173d92-c346-4fb5-8ef2-490105e19263'),
('ec9c42ee-eceb-4b8a-9c9b-0ccc042bd077', 'Item', 3, true, '8e173d92-c346-4fb5-8ef2-490105e19263');

INSERT INTO field_table (field_id, field_name, field_type, field_order, field_section_id, field_is_required, field_is_read_only) VALUES
-- All Fields 
('1a08417c-3a0d-433c-bc59-a598ffb13883', 'Text field', 'TEXT', 1, '80017528-ddb2-419d-92be-cdfa867b8f42', false, false),
('8b796e64-524c-48ca-bc62-2e834f5ab64f', 'Text area field', 'TEXTAREA', 2, '80017528-ddb2-419d-92be-cdfa867b8f42', false, false),
('de015df9-4c2a-4cd6-8e60-80846055347e', 'Number field', 'NUMBER', 3, '80017528-ddb2-419d-92be-cdfa867b8f42', false, false),
('4ea62b46-1ffe-4145-9751-f4fc0e002804', 'Switch field', 'SWITCH', 4, '2bba9d85-90ed-4cec-a97a-159e482f4f65', false, false),
('e2b59f56-4a94-40af-9adb-ad22571294cc', 'Dropdown field', 'DROPDOWN', 5, '2bba9d85-90ed-4cec-a97a-159e482f4f65', false, false),
('910ecd57-bc8e-4050-a252-8f333648ac70', 'Multiselect field', 'MULTISELECT', 6, '2bba9d85-90ed-4cec-a97a-159e482f4f65', false, false),
('6648cc67-9b56-4808-9745-d92e0cd23167', 'Date field', 'DATE', 7, 'e36be46d-4eec-4d5a-bb71-fd2d539c599e', false, false),
('e71b4d6f-d4c2-4475-97aa-7ab9b8ac18b1', 'Time field', 'TIME', 8, 'e36be46d-4eec-4d5a-bb71-fd2d539c599e', false, false),
('e3963e5b-4232-428e-8d2e-e94fd0144a1b', 'File field', 'FILE', 9, 'e36be46d-4eec-4d5a-bb71-fd2d539c599e', false, false),

-- Duplicatable Section
('1d14b17f-9882-4644-8100-657c9ce3094b', 'Text field', 'TEXT', 1, '5da6140a-bec6-4afa-aeec-2fcb84c17669', false, false),
('ef6e25fe-cebe-45b5-ab2a-9b857b7352a9', 'Number field', 'NUMBER', 2, '5da6140a-bec6-4afa-aeec-2fcb84c17669', false, false),
('8271dae2-55ae-40ce-a95c-28eb852a5b0e', 'Switch field', 'SWITCH', 3, '5da6140a-bec6-4afa-aeec-2fcb84c17669', false, false),
('b02f350b-83f5-405a-be19-0bfb07803aa5', 'Dropdown field', 'DROPDOWN', 4, '5da6140a-bec6-4afa-aeec-2fcb84c17669', false, false),

('a64d10b9-2041-42da-af9d-7e414d762753', 'Text field', 'TEXT', 5, '8ef2c6a0-797d-4e36-8246-cfa0f783afb5', false, false),
('fe5cb192-f239-4415-87df-e86e293ada11', 'Dropdown field', 'DROPDOWN', 6, '8ef2c6a0-797d-4e36-8246-cfa0f783afb5', false, false),
('d7eb7004-2d88-4752-a75b-61ff2789ed66', 'Date field', 'DATE', 7, '8ef2c6a0-797d-4e36-8246-cfa0f783afb5', false, false),

('ec6831ee-ea45-468e-bd5c-fb29a7297a56', 'Multiselect field', 'MULTISELECT', 8, 'd8465119-a0ef-43e8-9feb-0373b7d46b29', false, false),
('f5e0af5e-266c-464c-81ea-fdaf0dbb9669', 'Date field', 'DATE', 9, 'd8465119-a0ef-43e8-9feb-0373b7d46b29', false, false),
('0f1d0f3b-5e8b-4666-b978-a249a981498f', 'Time field', 'TIME', 10, 'd8465119-a0ef-43e8-9feb-0373b7d46b29', false, false),

-- Requisition 
('eb64f865-e034-4efb-8809-b162bb33175b', 'Requesting Project', 'DROPDOWN', 1, '4825cada-afc4-4657-affd-7f5be69a48e6', true, false),
('d644d57b-dc0c-4f44-9cef-403fd73a7cf2', 'Type', 'DROPDOWN', 2, '4825cada-afc4-4657-affd-7f5be69a48e6', true, false),
('f0432de0-0fbe-4351-a258-3272e2d29db4', 'Date Needed', 'DATE', 3, '4825cada-afc4-4657-affd-7f5be69a48e6', true, false),
('e05152c4-f172-4394-9a6d-cfc229ee99a9', 'Purpose', 'TEXT', 4, '4825cada-afc4-4657-affd-7f5be69a48e6', true, false),

('b857e53a-690b-418b-9fb7-732748875b17', 'General Name', 'DROPDOWN', 5, 'c44e8f72-c112-4fb4-a5a4-b2619ac77aa1', true, false),
('697efd8f-f522-4396-9af7-cc817992f10a', 'Base Unit of Measurement', 'TEXT', 6, 'c44e8f72-c112-4fb4-a5a4-b2619ac77aa1', true, true),
('cb7f89ba-58db-4be7-bd8a-6ec6315afe3d', 'Quantity', 'NUMBER', 7, 'c44e8f72-c112-4fb4-a5a4-b2619ac77aa1', true, false),
('94e628bc-0d39-4312-9e26-514707ab2b86', 'GL Account', 'TEXT', 8, 'c44e8f72-c112-4fb4-a5a4-b2619ac77aa1', true, true),
('4614a0f6-8a1c-4b1f-8f30-60ff6b11f236', 'CSI Code Description', 'DROPDOWN', 9, 'c44e8f72-c112-4fb4-a5a4-b2619ac77aa1', true, false),
('2ad09f4e-6369-45af-99a8-ef945300c3b2', 'CSI Code', 'TEXT', 10, 'c44e8f72-c112-4fb4-a5a4-b2619ac77aa1', true, true),
('4541cc61-49c9-4ec5-bcb8-5146bc31de6c', 'Division Description', 'TEXT', 11, 'c44e8f72-c112-4fb4-a5a4-b2619ac77aa1', true, true),
('83530e5f-0bc4-4983-9079-485384996e20', 'Level 2 Major Group Description', 'TEXT', 12, 'c44e8f72-c112-4fb4-a5a4-b2619ac77aa1', true, true),
('1d88906e-f786-4d8a-8992-a2f11e7a55dd', 'Level 2 Minor Group Description', 'TEXT', 13, 'c44e8f72-c112-4fb4-a5a4-b2619ac77aa1', true, true),

('bef47113-a186-4755-9764-263b5c246a41', 'Length', 'DROPDOWN', 14, 'c44e8f72-c112-4fb4-a5a4-b2619ac77aa1', true, false),
('6e539c9f-8ab2-46f1-a8a6-89cc928c3612', 'Width', 'DROPDOWN', 14, 'c44e8f72-c112-4fb4-a5a4-b2619ac77aa1', true, false),
('0af6a571-3bef-4f8c-8716-2bca5a5250fc', 'Height', 'DROPDOWN', 14, 'c44e8f72-c112-4fb4-a5a4-b2619ac77aa1', true, false),
('25e93bd3-30f0-4920-a0e8-6bde5a44898c', 'Type', 'DROPDOWN', 14, 'c44e8f72-c112-4fb4-a5a4-b2619ac77aa1', true, false),
('db862c96-01ec-499c-b9f1-faf7b674074d', 'Brand', 'DROPDOWN', 14, 'c44e8f72-c112-4fb4-a5a4-b2619ac77aa1', true, false),
('03003ee0-811a-44e9-b420-aaac9f80d1de', 'Material', 'DROPDOWN', 14, 'c44e8f72-c112-4fb4-a5a4-b2619ac77aa1', true, false),
('a6745b58-c88d-41dc-82f4-887c0062c03d', 'Size', 'DROPDOWN', 14, 'c44e8f72-c112-4fb4-a5a4-b2619ac77aa1', true, false),

-- Sourced Item 
('f8f77f42-63a5-4053-8b2e-36d0f5174e94', 'Requisition ID', 'LINK', 1, 'dc06e690-9dd1-46e8-a769-0f83ea5cb215', true, true),

('5a7cf568-e3f6-45fc-b624-23ef1b136934', 'Item', 'DROPDOWN', 2, '26a2cb17-1b90-434a-a8f1-e54479af3927', true, false),
('3d68b209-bc8b-4644-aeab-1ba3af3917cc', 'Quantity', 'NUMBER', 3, '26a2cb17-1b90-434a-a8f1-e54479af3927', true, false),
('13fd2110-2c14-467e-82f5-0768809d14fc', 'Source Project', 'DROPDOWN', 4, '26a2cb17-1b90-434a-a8f1-e54479af3927', true, false),

-- Quotation 
('81849f8f-5d5e-4877-b530-f049d349f6da', 'Requisition ID', 'LINK', 1, '92ba57aa-ee3d-47bc-889f-744c4ea68565', true, true),

('4ea7b1fe-e219-4b35-bae8-d8d37578b8fc', 'Supplier', 'DROPDOWN', 2, '1ada0454-f349-462a-8178-3f91c24a89d4', true, false),
('dd48cc60-7756-47e5-870b-a3689cf3eb17', 'Supplier Quotation', 'FILE', 3, '1ada0454-f349-462a-8178-3f91c24a89d4', true, false),
('8508f4ce-2796-45c5-b70d-e2f6bb458841', 'Request Send Method', 'DROPDOWN', 4, '1ada0454-f349-462a-8178-3f91c24a89d4', false, false),
('887764a6-1e9a-4977-8125-41fa01755f90', 'Proof of Sending', 'FILE', 5, '1ada0454-f349-462a-8178-3f91c24a89d4', false, false),
('faa69185-ebfd-4a66-b2af-55e9726fcf7e', 'Payment Terms', 'DROPDOWN', 6, '1ada0454-f349-462a-8178-3f91c24a89d4', true, false),
('b2b5a584-455c-439d-aa48-e5656118f358', 'Lead Time', 'NUMBER', 7, '1ada0454-f349-462a-8178-3f91c24a89d4', true, false),
('3775ee63-a937-451d-b743-43d4516ea3c1', 'Required Down Payment', 'NUMBER', 8, '1ada0454-f349-462a-8178-3f91c24a89d4', true, false),

('71b699ea-149d-4625-ba21-ffefec07daf6', 'Delivery Fee', 'NUMBER', 9, 'aded878d-be2a-4cb6-8431-c61bcb90a0ae', false, false),
('d0df7172-0a94-4815-a4dd-d20e48672985', 'Bank Charge', 'NUMBER', 10, 'aded878d-be2a-4cb6-8431-c61bcb90a0ae', false, false),
('dbb8bea3-4244-40ec-a161-0560e97dfc63', 'Mobilization Charge', 'NUMBER', 11, 'aded878d-be2a-4cb6-8431-c61bcb90a0ae', false, false),
('8a706a43-fa78-4b4a-ad95-d7d779e763a4', 'Demobilization Charge', 'NUMBER', 12, 'aded878d-be2a-4cb6-8431-c61bcb90a0ae', false, false),
('de547efe-3af0-490b-a22d-b7f6ab8d9a6e', 'Freight Charge', 'NUMBER', 13, 'aded878d-be2a-4cb6-8431-c61bcb90a0ae', false, false),
('5bd88be9-5497-407a-a658-51c7fb0a7f47', 'Hauling Charge', 'NUMBER', 14, 'aded878d-be2a-4cb6-8431-c61bcb90a0ae', false, false),
('f901a179-29b6-471a-ae8f-523c7b66457d', 'Handling Charge', 'NUMBER', 15, 'aded878d-be2a-4cb6-8431-c61bcb90a0ae', false, false),
('bb4800bf-d975-44f9-8d0b-90b491ccd2f7', 'Packing Charge', 'NUMBER', 16, 'aded878d-be2a-4cb6-8431-c61bcb90a0ae', false, false),

('ce1a7d0c-6da7-407b-ad9b-cca922a88cd5', 'Item', 'DROPDOWN', 17, '46647207-4894-4ed6-9c75-1d0f37ea3d72', true, false),
('e709da88-9c24-4b3f-aa97-bb81b0ac7712', 'Price per Unit', 'NUMBER', 18, '46647207-4894-4ed6-9c75-1d0f37ea3d72', true, false),
('33a0af42-7451-460d-8073-9f5a2c6649e8', 'Quantity', 'NUMBER', 19, '46647207-4894-4ed6-9c75-1d0f37ea3d72', true, false),

-- Receiving Inspecting Report 
('8ff92103-06ff-408e-afcf-1c9a1c31f1a7', 'Requisition ID', 'LINK', 1, '322a7743-2771-419a-880e-da6e69eb2b67', true, true),
('c36ffc50-38e6-436c-b6f6-408909a36fcb', 'Quotation ID', 'LINK', 2, '322a7743-2771-419a-880e-da6e69eb2b67', true, true),
('f5c5b66e-6f41-418b-ba52-c8d94fdd4b26', 'DR', 'FILE', 3, '942ecf49-1ce4-4dbb-a570-231844546a58', true, false),
('70d2a4d6-e567-4ebc-9995-0ca6421e5c73', 'SI', 'FILE', 4, '942ecf49-1ce4-4dbb-a570-231844546a58', false, false),
('c3589414-a5fe-4d06-8fa0-c5635054277c', 'QCIR', 'FILE', 5, '942ecf49-1ce4-4dbb-a570-231844546a58', false, false),
('0850cbe0-3177-4700-a2b5-9638ab1e9f32', 'Item', 'DROPDOWN', 6, '0c069155-289d-4628-8985-bdac8bc65cd3', true, false),
('a97dd892-2ce6-4def-a302-8ee72bd5f20c', 'Quantity', 'NUMBER', 7, '0c069155-289d-4628-8985-bdac8bc65cd3', true, false),
('4869a22f-835c-40e6-9851-b27eb4460467', 'Receiving Status', 'TEXT', 8, '0c069155-289d-4628-8985-bdac8bc65cd3', true, true), 

-- Release Order 
('18d29716-ea57-412f-af0f-e4a505ec6efc', 'Requisition ID', 'LINK', 1, 'b9a5efac-c020-42cf-8196-97792583e1a4', true, true),
('73a5c1f3-bb0e-40c6-8e0d-224e52350561', 'Sourced Item ID', 'LINK', 2, 'b9a5efac-c020-42cf-8196-97792583e1a4', true, true),
('3bf6959e-012a-4fc9-820f-e67f42cb9edf', 'Item', 'DROPDOWN', 3, '396d543e-e86d-41cd-80eb-c1d8d9c24b30', true, false),
('1ded6e1d-82f3-4936-a33c-7351e2ec9078', 'Quantity', 'NUMBER', 4, '396d543e-e86d-41cd-80eb-c1d8d9c24b30', true, false),
('e75345c9-1df8-40e1-a5cc-dc3ac1bfbfb8', 'Receiving Status', 'TEXT', 5, '396d543e-e86d-41cd-80eb-c1d8d9c24b30', true, true), 
('662ac92f-b340-4121-ac71-1efa41f52909', 'Source Project', 'TEXT', 6, '396d543e-e86d-41cd-80eb-c1d8d9c24b30', true, true), 

-- Transfer Receipt 
('efa6673c-0aea-4ee5-ab3a-11d1fdb26179', 'Requisition ID', 'LINK', 1, '5c8cf8df-a20e-46bb-8e22-b0e2a90624ab', true, true),
('dd3e524c-46b0-4883-9c35-931e24a24e5b', 'Sourced Item ID', 'LINK', 2, '5c8cf8df-a20e-46bb-8e22-b0e2a90624ab', true, true),
('6feb5d81-3893-4e91-aec8-a8ded5c78419', 'Release Order ID', 'LINK', 3, '5c8cf8df-a20e-46bb-8e22-b0e2a90624ab', true, true),
('675a4329-20da-4fc2-8d66-80755f2fef7c', 'Transfer Shipment', 'FILE', 4, '7018f1d5-5ffd-4853-8fca-9cce1e7a2409', true, false),
('d8e0b5ef-fa82-43f6-8c82-90c7c72c677a', 'Transfer Receipt', 'FILE', 5, '7018f1d5-5ffd-4853-8fca-9cce1e7a2409', true, false),
('048e58c2-9f6f-4228-aa55-df5a57ec66f0', 'Item', 'DROPDOWN', 6, 'ec9c42ee-eceb-4b8a-9c9b-0ccc042bd077', true, false),
('9fa34f5c-d8e1-42de-a5dc-f763a9a6cb43', 'Quantity', 'NUMBER', 7, 'ec9c42ee-eceb-4b8a-9c9b-0ccc042bd077', true, false),
('877f8632-4d63-4f84-907c-ff3c752c69dc', 'Receiving Status', 'TEXT', 8, 'ec9c42ee-eceb-4b8a-9c9b-0ccc042bd077', true, true), 
('e7f6813d-b1d7-4a40-b87b-12d76e5b666a', 'Source Project', 'TEXT', 9, 'ec9c42ee-eceb-4b8a-9c9b-0ccc042bd077', true, true);

-- Add options
INSERT INTO option_table (option_id, option_value, option_order, option_field_id) VALUES
(gen_random_uuid(), 'Dropdown 1', 1, 'e2b59f56-4a94-40af-9adb-ad22571294cc'),
(gen_random_uuid(), 'Dropdown 2', 2, 'e2b59f56-4a94-40af-9adb-ad22571294cc'),
(gen_random_uuid(), 'Dropdown 3', 3, 'e2b59f56-4a94-40af-9adb-ad22571294cc'),
(gen_random_uuid(), 'Multiselect 1', 1, '910ecd57-bc8e-4050-a252-8f333648ac70'),
(gen_random_uuid(), 'Multiselect 2', 2, '910ecd57-bc8e-4050-a252-8f333648ac70'),
(gen_random_uuid(), 'Multiselect 3', 3, '910ecd57-bc8e-4050-a252-8f333648ac70'),
(gen_random_uuid(), 'Dropdown 1', 1, 'b02f350b-83f5-405a-be19-0bfb07803aa5'),
(gen_random_uuid(), 'Dropdown 2', 2, 'b02f350b-83f5-405a-be19-0bfb07803aa5'),
(gen_random_uuid(), 'Dropdown 3', 3, 'b02f350b-83f5-405a-be19-0bfb07803aa5'),
(gen_random_uuid(), 'Dropdown 1', 1, 'fe5cb192-f239-4415-87df-e86e293ada11'),
(gen_random_uuid(), 'Dropdown 2', 2, 'fe5cb192-f239-4415-87df-e86e293ada11'),
(gen_random_uuid(), 'Dropdown 3', 3, 'fe5cb192-f239-4415-87df-e86e293ada11'),
(gen_random_uuid(), 'Multiselect 1', 1, 'ec6831ee-ea45-468e-bd5c-fb29a7297a56'),
(gen_random_uuid(), 'Multiselect 2', 2, 'ec6831ee-ea45-468e-bd5c-fb29a7297a56'),
(gen_random_uuid(), 'Multiselect 3', 3, 'ec6831ee-ea45-468e-bd5c-fb29a7297a56'),
('a4c9cf29-c4cc-4b6f-af3d-6a50946af85e', 'Cash Purchase - Advance Payment', 1, 'd644d57b-dc0c-4f44-9cef-403fd73a7cf2'),
('c22aa5ed-7dc8-45b1-8917-2d12290f8936', 'Cash Purchase - Local Purchase', 2, 'd644d57b-dc0c-4f44-9cef-403fd73a7cf2'),
('72d99515-3fcd-47cf-abb6-bbcccf4982fe', 'Requisition', 3, 'd644d57b-dc0c-4f44-9cef-403fd73a7cf2');

-- Add items
INSERT INTO item_table (item_id, item_general_name, item_unit, item_team_id, item_gl_account, item_division_id_list) VALUES 
('5dc0a81e-fe9d-4da0-bafc-f498d575ef39', 'Wood', 'piece', '2cfc4947-a9be-43f8-9037-c0ae7ec04bd2', 'rX7VU', ARRAY['0']),
('245aa3d4-0d76-4124-9398-ab177b55c553', 'Gasoline', 'litre', '2cfc4947-a9be-43f8-9037-c0ae7ec04bd2', 'dpRHk', ARRAY['0']),
('5b4652ae-4460-4fc3-9a8a-923b30132d03', 'Nail', 'bag', '2cfc4947-a9be-43f8-9037-c0ae7ec04bd2', 'QAMFi', ARRAY['0']);

INSERT INTO item_description_table(item_description_id, item_description_label, item_description_item_id, item_description_field_id) VALUES 
('994a07a2-e968-4ce8-8246-45aac0bfdde4', 'Length', '5dc0a81e-fe9d-4da0-bafc-f498d575ef39', 'bef47113-a186-4755-9764-263b5c246a41'),
('b506ed74-e227-4d4b-825b-17d5e95e2d87', 'Width', '5dc0a81e-fe9d-4da0-bafc-f498d575ef39', '6e539c9f-8ab2-46f1-a8a6-89cc928c3612'),
('afb03ac0-d69c-4993-bc92-b8336e7a51f1', 'Height', '5dc0a81e-fe9d-4da0-bafc-f498d575ef39', '0af6a571-3bef-4f8c-8716-2bca5a5250fc'),
('5fd7eb51-22d6-4a5f-b0d4-15a4ee492e39', 'Type', '245aa3d4-0d76-4124-9398-ab177b55c553', '25e93bd3-30f0-4920-a0e8-6bde5a44898c'),
('ef1b1cd1-98d1-410f-a621-3f331a9e5a96', 'Brand', '245aa3d4-0d76-4124-9398-ab177b55c553', 'db862c96-01ec-499c-b9f1-faf7b674074d'),
('442cd87f-25c4-482b-ba4b-d2ab1a852725', 'Material', '5b4652ae-4460-4fc3-9a8a-923b30132d03', '03003ee0-811a-44e9-b420-aaac9f80d1de'),
('3cff6f0b-bc0e-4d29-a040-7417439f164b', 'Size', '5b4652ae-4460-4fc3-9a8a-923b30132d03', 'a6745b58-c88d-41dc-82f4-887c0062c03d');

INSERT INTO item_description_field_table (item_description_field_id, item_description_field_value, item_description_field_item_description_id) VALUES 
('2ef512c1-94f0-4ae3-8279-94efa4ce3e2d', '1 inch', '994a07a2-e968-4ce8-8246-45aac0bfdde4'),
('848f05d8-973b-4209-9d7a-afd7797804a4', '2 inch', '994a07a2-e968-4ce8-8246-45aac0bfdde4'),
('ae362b40-dc57-4a2a-a580-f270ef8821eb', '3 inch', '994a07a2-e968-4ce8-8246-45aac0bfdde4'),
('7ab7b993-7cc9-4a45-ae00-5f896155e2b1', '4 inch', '994a07a2-e968-4ce8-8246-45aac0bfdde4'),
('7b7788b6-33f3-4021-baf8-acb6389c9650', '1 inch', 'b506ed74-e227-4d4b-825b-17d5e95e2d87'),
('ce189925-7df7-47af-9ffd-9af7761f7436', '2 inch', 'b506ed74-e227-4d4b-825b-17d5e95e2d87'),
('bdcbdc5c-0470-4a23-88ef-af362457fb75', '3 inch', 'b506ed74-e227-4d4b-825b-17d5e95e2d87'),
('5deab35a-f902-4752-a53b-382f741e1ab9', '1 inch', 'afb03ac0-d69c-4993-bc92-b8336e7a51f1'),
('40c68e85-a863-433a-a03f-1ee4ed40bf9e', '2 inch', 'afb03ac0-d69c-4993-bc92-b8336e7a51f1'),
('e2ea5d60-bbcd-41ba-ad4a-f156f8a78fb7', 'Unleaded',  '5fd7eb51-22d6-4a5f-b0d4-15a4ee492e39'),
('dd95e2fd-de32-48a1-889e-5e6debf92b6a', 'Diesel',  '5fd7eb51-22d6-4a5f-b0d4-15a4ee492e39'),
('1f0480e1-b81d-4e0f-9c83-f39bdea97f28', 'Shell',  'ef1b1cd1-98d1-410f-a621-3f331a9e5a96'),
('e8a32583-2676-4487-8ace-c0978fa5fb30', 'Petron',  'ef1b1cd1-98d1-410f-a621-3f331a9e5a96'),
('ef251b7b-b2cb-4d98-b42a-74a0cf790ce8', 'Metal', '442cd87f-25c4-482b-ba4b-d2ab1a852725'),
('d86f3986-1444-446a-b4ad-ce9fdf405abc', '5 inch', '3cff6f0b-bc0e-4d29-a040-7417439f164b');

INSERT INTO supplier_table (supplier_id, supplier_name, supplier_team_id) VALUES
('d07f34da-75db-4fe1-a85b-8c540314769a', 'Techrom Computer Shop', '2cfc4947-a9be-43f8-9037-c0ae7ec04bd2'),
('b501e500-eeb8-43c7-93ec-642ffe15d66a', 'Symmetric Intercontinental IT Solutions Inc', '2cfc4947-a9be-43f8-9037-c0ae7ec04bd2'),
('39db91c4-4cd2-44ce-8482-b98862edfa40', 'Fire Solution Inc', '2cfc4947-a9be-43f8-9037-c0ae7ec04bd2'),
('245db815-a8ab-4230-9d43-7ffa65ce0a47', 'Begul Builders Corporation', '2cfc4947-a9be-43f8-9037-c0ae7ec04bd2');

-- Add signer
INSERT INTO signer_table (signer_id, signer_is_primary_signer, signer_action, signer_order, signer_form_id, signer_team_member_id) VALUES
('a6be17fc-1298-411a-b158-abb3b16cdfb6', TRUE, 'Approved', 1, allFieldsFormId, '0a61a37f-7805-4fe5-8856-3c7fa801c744'),
('a92fa55d-9972-4dc5-9369-1cec51635c4a', TRUE, 'Approved', 1, duplicateFieldsFormId, '0a61a37f-7805-4fe5-8856-3c7fa801c744'),
('ab5287ae-50df-4e27-a2f8-84c6ce472abc', TRUE, 'Approved', 1, requisitionFormId, '0a61a37f-7805-4fe5-8856-3c7fa801c744'),
('18dcb6e5-a572-4fe9-9ad9-c86279723098', FALSE, 'Approved', 2, requisitionFormId, 'a750df8c-35fe-48d6-862a-1135c8f96a9a'),
('5d640270-11a2-43e2-9316-de0414b837c0', TRUE, 'Approved', 1, quotationFormId, 'a750df8c-35fe-48d6-862a-1135c8f96a9a'),
('ac286d08-cfb3-42b2-9eab-4e5b9cedbf68', TRUE, 'Approved', 1, rirFormId, '0a61a37f-7805-4fe5-8856-3c7fa801c744');

END $$;


-- CREATE REQUESTS SEED
DO $$ 
DECLARE
  ownerMemberId UUID;

  requisitionRequestId UUID;
  rirRequestId UUID;
  allFieldsRequestId UUID;
  quotationRequestId UUID;
  duplicateFieldsRequestId UUID;

  requisitionFormId UUID;
  quotationFormId UUID;
  rirFormId UUID;
  sourcedItemFormId UUID;
  roFormId UUID;
  transferReceiptFormId UUID;
  allFieldsFormId UUID;
  duplicateFieldsFormId UUID;

  quotation_request_status TEXT;
  rirRequestStatus TEXT;
  request_status TEXT;
  request_signer_status TEXT;
  request_date_created TIMESTAMPTZ;
  item_quantity1 TEXT;
  item_quantity2 TEXT;
  item_quantity3 TEXT;
  duplicatatable_section_id1 UUID;
  duplicatatable_section_id2 UUID;
  duplicatatable_section_id3 UUID;
  counter INT := 1;
BEGIN

SELECT var_value INTO ownerMemberId
  FROM seed_variable_table
  WHERE var_key = 'ownerMemberId';

SELECT var_value INTO requisitionFormId
  FROM seed_variable_table
  WHERE var_key = 'requisitionFormId';

  WHILE counter <= 5000 LOOP
    -- Generate request_id
    requisitionRequestId := gen_random_uuid();
    quotationRequestId := gen_random_uuid();

    -- Generate random request_status
  SELECT CASE 
    WHEN random() < 0.25 THEN 'APPROVED'
    WHEN random() < 0.5 THEN 'REJECTED'
    WHEN random() < 0.75 THEN 'CANCELED'
    ELSE 'PENDING'
  END INTO request_status;

  -- Assign request_signer_status based on request_status
  IF request_status = 'APPROVED' THEN
    request_signer_status := 'APPROVED';
  ELSIF request_status = 'REJECTED' THEN
    request_signer_status := 'REJECTED';
  ELSE
    request_signer_status := 'PENDING';
  END IF;

  -- Generate a random quantity
  item_quantity1 := floor(random() * 100) + 1;
  item_quantity2 := floor(random() * 100) + 1;
  item_quantity3 := floor(random() * 100) + 1;

  -- duplicatable section id
  duplicatatable_section_id1 := gen_random_uuid();
  duplicatatable_section_id2 := gen_random_uuid();
  duplicatatable_section_id3 := gen_random_uuid();
 
  -- Generate random date within the current year
  request_date_created := date_trunc('year', current_date) + random() * (current_date - date_trunc('year', current_date));


    -- Create Requisition request
    INSERT INTO request_table (request_id, request_team_member_id, request_form_id, request_status, request_date_created) VALUES
      (requisitionRequestId, ownerMemberId, requisitionFormId, request_status, request_date_created);

    -- Request signer table
    INSERT INTO request_signer_table (request_signer_id, request_signer_status, request_signer_request_id, request_signer_signer_id) VALUES
      (gen_random_uuid(), request_signer_status, requisitionRequestId, 'ab5287ae-50df-4e27-a2f8-84c6ce472abc'),
      (gen_random_uuid(), request_signer_status, requisitionRequestId, '18dcb6e5-a572-4fe9-9ad9-c86279723098');

    INSERT INTO request_response_table (request_response_id, request_response, request_response_duplicatable_section_id, request_response_field_id, request_response_request_id) VALUES
      -- Main Section
      -- Requesting Project
      (gen_random_uuid(), '"LAKE MAINIT"', NULL, 'eb64f865-e034-4efb-8809-b162bb33175b', requisitionRequestId),
      -- Type
      (gen_random_uuid(), '"Cash Purchase - Local Purchase"', NULL, 'd644d57b-dc0c-4f44-9cef-403fd73a7cf2', requisitionRequestId),
      -- Date Needed
      (gen_random_uuid(), '"' || request_date_created || '"', NULL, 'f0432de0-0fbe-4351-a258-3272e2d29db4', requisitionRequestId),
      -- Purpose
      (gen_random_uuid(), '"purpose"', NULL, 'e05152c4-f172-4394-9a6d-cfc229ee99a9', requisitionRequestId),

      -- Item Section

      -- General Name
      (gen_random_uuid(), '"Gasoline"', NULL, 'b857e53a-690b-418b-9fb7-732748875b17', requisitionRequestId),
      -- Base Unit of Measurement
      (gen_random_uuid(), '"litre"', NULL, '697efd8f-f522-4396-9af7-cc817992f10a', requisitionRequestId),
      -- Quantity
      (gen_random_uuid(), item_quantity1, NULL, 'cb7f89ba-58db-4be7-bd8a-6ec6315afe3d', requisitionRequestId),
      -- GL Account
      (gen_random_uuid(), '"0x22141"', NULL, '94e628bc-0d39-4312-9e26-514707ab2b86', requisitionRequestId),
      -- CSI Code Description
      (gen_random_uuid(), '"Procurement and Contracting Requirements"', NULL, '4614a0f6-8a1c-4b1f-8f30-60ff6b11f236', requisitionRequestId),
      -- CSI Code
      (gen_random_uuid(), '"00 00 00"', NULL, '2ad09f4e-6369-45af-99a8-ef945300c3b2', requisitionRequestId),
      -- Division Description
      (gen_random_uuid(), '"Procurement and Contracting Requirements"', NULL, '4541cc61-49c9-4ec5-bcb8-5146bc31de6c', requisitionRequestId),
      -- Level 2 Major Group Description'
      (gen_random_uuid(), '"Procurement and Contracting Requirements"', NULL, '83530e5f-0bc4-4983-9079-485384996e20', requisitionRequestId),
      -- Level 2 Minor Group Description
      (gen_random_uuid(), '"Project Documentation"', NULL, '1d88906e-f786-4d8a-8992-a2f11e7a55dd', requisitionRequestId),
      -- Type
      (gen_random_uuid(), '"Diesel"', NULL, '25e93bd3-30f0-4920-a0e8-6bde5a44898c', requisitionRequestId),
      -- Brand
      (gen_random_uuid(), '"Shell"', NULL, 'db862c96-01ec-499c-b9f1-faf7b674074d', requisitionRequestId),

      -- General Name
      (gen_random_uuid(), '"Wood"', duplicatatable_section_id1, 'b857e53a-690b-418b-9fb7-732748875b17', requisitionRequestId),
      -- Base Unit of Measurement
      (gen_random_uuid(), '"piece"', duplicatatable_section_id1, '697efd8f-f522-4396-9af7-cc817992f10a', requisitionRequestId),
      -- Quantity
      (gen_random_uuid(), item_quantity2, duplicatatable_section_id1, 'cb7f89ba-58db-4be7-bd8a-6ec6315afe3d', requisitionRequestId),
      -- GL Account
      (gen_random_uuid(), '"0x22141"', duplicatatable_section_id1, '94e628bc-0d39-4312-9e26-514707ab2b86', requisitionRequestId),
      -- CSI Code Description
      (gen_random_uuid(), '"Procurement and Contracting Requirements"', NULL, '4614a0f6-8a1c-4b1f-8f30-60ff6b11f236', requisitionRequestId),
      -- CSI Code
      (gen_random_uuid(), '"00 00 00"', NULL, '2ad09f4e-6369-45af-99a8-ef945300c3b2', requisitionRequestId),
      -- Division Description
      (gen_random_uuid(), '"Procurement and Contracting Requirements"', NULL, '4541cc61-49c9-4ec5-bcb8-5146bc31de6c', requisitionRequestId),
      -- Level 2 Major Group Description'
      (gen_random_uuid(), '"Procurement and Contracting Requirements"', NULL, '83530e5f-0bc4-4983-9079-485384996e20', requisitionRequestId),
      -- Level 2 Minor Group Description
      (gen_random_uuid(), '"Project Documentation"', NULL, '1d88906e-f786-4d8a-8992-a2f11e7a55dd', requisitionRequestId),
      -- Length
      (gen_random_uuid(), '"1 inch"', duplicatatable_section_id1, 'bef47113-a186-4755-9764-263b5c246a41', requisitionRequestId),
      -- Width
      (gen_random_uuid(), '"1 inch"', duplicatatable_section_id1, '6e539c9f-8ab2-46f1-a8a6-89cc928c3612', requisitionRequestId),
      -- Height
      (gen_random_uuid(), '"1 inch"', duplicatatable_section_id1, '0af6a571-3bef-4f8c-8716-2bca5a5250fc', requisitionRequestId),

      -- General Name
      (gen_random_uuid(), '"Nail"', duplicatatable_section_id2, 'b857e53a-690b-418b-9fb7-732748875b17', requisitionRequestId),
      -- Base Unit of Measurement
      (gen_random_uuid(), '"bag"', duplicatatable_section_id2, '697efd8f-f522-4396-9af7-cc817992f10a', requisitionRequestId),
      -- Quantity
      (gen_random_uuid(), item_quantity3, duplicatatable_section_id2, 'cb7f89ba-58db-4be7-bd8a-6ec6315afe3d', requisitionRequestId),
      -- CSI Code Description
      (gen_random_uuid(), '"Procurement and Contracting Requirements"', NULL, '4614a0f6-8a1c-4b1f-8f30-60ff6b11f236', requisitionRequestId),
      -- CSI Code
      (gen_random_uuid(), '"00 00 00"', NULL, '2ad09f4e-6369-45af-99a8-ef945300c3b2', requisitionRequestId),
      -- Division Description
      (gen_random_uuid(), '"Procurement and Contracting Requirements"', NULL, '4541cc61-49c9-4ec5-bcb8-5146bc31de6c', requisitionRequestId),
      -- Level 2 Major Group Description'
      (gen_random_uuid(), '"Procurement and Contracting Requirements"', NULL, '83530e5f-0bc4-4983-9079-485384996e20', requisitionRequestId),
      -- Level 2 Minor Group Description
      (gen_random_uuid(), '"Project Documentation"', NULL, '1d88906e-f786-4d8a-8992-a2f11e7a55dd', requisitionRequestId),
      -- GL Account
      (gen_random_uuid(), '"0x221422"', duplicatatable_section_id2, '94e628bc-0d39-4312-9e26-514707ab2b86', requisitionRequestId),
      -- Material
      (gen_random_uuid(), '"Metal"', duplicatatable_section_id2, '03003ee0-811a-44e9-b420-aaac9f80d1de', requisitionRequestId),
      -- Size
      (gen_random_uuid(), '"5 inch"', duplicatatable_section_id2, 'a6745b58-c88d-41dc-82f4-887c0062c03d', requisitionRequestId);


    -- Create Quotation Form
    
    -- Assign quotation_request_status based on odds
    SELECT CASE 
      WHEN random() < 0.5 THEN 'APPROVED'
      WHEN random() < 0.25 THEN 'REJECTED'
      ELSE 'PENDING'
    END INTO quotation_request_status;


    -- Create Quotation Request if Requisition Request is APPROVED
    IF request_status = 'APPROVED'
    THEN

    SELECT var_value INTO quotationFormId
    FROM seed_variable_table
    WHERE var_key = 'quotationFormId';

    INSERT INTO request_table (request_id, request_team_member_id, request_form_id, request_status, request_date_created) VALUES
    (quotationRequestId, ownerMemberId, quotationFormId, quotation_request_status, request_date_created);

    -- Request signer table
    INSERT INTO request_signer_table (request_signer_id, request_signer_status, request_signer_request_id, request_signer_signer_id) VALUES
    (gen_random_uuid(), quotation_request_status, quotationRequestId, '5d640270-11a2-43e2-9316-de0414b837c0');

    INSERT INTO request_response_table (request_response_id, request_response, request_response_duplicatable_section_id, request_response_field_id, request_response_request_id) VALUES
    -- Requisition ID
    (gen_random_uuid(), '"' || requisitionRequestId || '"', NULL, '81849f8f-5d5e-4877-b530-f049d349f6da', quotationRequestId),
    -- Supplier
    (gen_random_uuid(), '"Begul Builders Corporation"', NULL, '4ea7b1fe-e219-4b35-bae8-d8d37578b8fc', quotationRequestId),
    -- Supplier Quotation
    (gen_random_uuid(), '"test.pdf"', NULL, 'dd48cc60-7756-47e5-870b-a3689cf3eb17', quotationRequestId),

    -- Item
    (gen_random_uuid(), '"Gasoline (' || item_quantity1 || ' litre) (Type: Diesel, Brand: Shell)"', NULL, 'ce1a7d0c-6da7-407b-ad9b-cca922a88cd5', quotationRequestId),
    -- Price per Unit
    (gen_random_uuid(), '50' , NULL, 'e709da88-9c24-4b3f-aa97-bb81b0ac7712', quotationRequestId),
    -- Quantity
    (gen_random_uuid(), item_quantity1, NULL, '33a0af42-7451-460d-8073-9f5a2c6649e8', quotationRequestId),

    -- Item
    (gen_random_uuid(), '"Wood (' || item_quantity2 || ' piece) (Length: 1 inch, Width: 1 inch, Height: 1 inch)"' , 'b613091d-bab2-457e-a1f7-119b4ee6e7d7', 'ce1a7d0c-6da7-407b-ad9b-cca922a88cd5', quotationRequestId),
    -- Price per Unit
    (gen_random_uuid(), '20' , 'b613091d-bab2-457e-a1f7-119b4ee6e7d7', 'e709da88-9c24-4b3f-aa97-bb81b0ac7712', quotationRequestId),
    -- Quantity
    (gen_random_uuid(), item_quantity2, 'b613091d-bab2-457e-a1f7-119b4ee6e7d7', '33a0af42-7451-460d-8073-9f5a2c6649e8', quotationRequestId),

    -- Item
    (gen_random_uuid(), '"Nail (' || item_quantity3 || ' bag) (Material: Metal, Size: 5 inch)"' , 'a5008080-75e0-4960-9bfd-83d9a47da6a9', 'ce1a7d0c-6da7-407b-ad9b-cca922a88cd5', quotationRequestId),
    -- Price per Unit
    (gen_random_uuid(), '40' , 'a5008080-75e0-4960-9bfd-83d9a47da6a9', 'e709da88-9c24-4b3f-aa97-bb81b0ac7712', quotationRequestId),
    -- Quantity
    (gen_random_uuid(), item_quantity3, 'a5008080-75e0-4960-9bfd-83d9a47da6a9', '33a0af42-7451-460d-8073-9f5a2c6649e8', quotationRequestId);

    END IF;

    -- Create RIR Request if Quotation Request is APPROVED
    IF quotation_request_status = 'APPROVED' AND request_status = 'APPROVED'
    THEN

    SELECT var_value INTO rirFormId
    FROM seed_variable_table
    WHERE var_key = 'rirFormId';

    rirRequestId := gen_random_uuid();

    -- Assign rirRequestStatus based on odds
    SELECT CASE 
      WHEN random() < 0.5 THEN 'APPROVED'
      WHEN random() < 0.25 THEN 'REJECTED'
      ELSE 'PENDING'
    END INTO rirRequestStatus;


    INSERT INTO request_table (request_id, request_team_member_id, request_form_id, request_status, request_date_created) VALUES
    (rirRequestId, ownerMemberId, rirFormId, rirRequestStatus, request_date_created);

    INSERT INTO request_signer_table (request_signer_id, request_signer_status, request_signer_request_id, request_signer_signer_id) VALUES
    (gen_random_uuid(), rirRequestStatus, rirRequestId, '5d640270-11a2-43e2-9316-de0414b837c0');
    
    INSERT INTO request_response_table (request_response_id, request_response, request_response_duplicatable_section_id, request_response_field_id, request_response_request_id) VALUES
    -- Requisition ID
    (gen_random_uuid(), '"' || requisitionRequestId || '"', NULL, '8ff92103-06ff-408e-afcf-1c9a1c31f1a7', rirRequestId),
    -- Quotation ID
    (gen_random_uuid(), '"' || quotationRequestId || '"', NULL, 'c36ffc50-38e6-436c-b6f6-408909a36fcb', rirRequestId),
    -- DR
    (gen_random_uuid(), '"test.pdf"', NULL, 'f5c5b66e-6f41-418b-ba52-c8d94fdd4b26', rirRequestId),
    -- Item
    (gen_random_uuid(), '"Gasoline (' || item_quantity1 || ' litre / ' || item_quantity1 || ' litre) (Type: Diesel, Brand: Shell)"', '1ac9e2bc-966a-4da7-81be-56e44ae3ac52', '0850cbe0-3177-4700-a2b5-9638ab1e9f32', rirRequestId),
    -- Quantity
    (gen_random_uuid(), item_quantity1, '1ac9e2bc-966a-4da7-81be-56e44ae3ac52', 'a97dd892-2ce6-4def-a302-8ee72bd5f20c', rirRequestId),
    -- Receiving Status
    (gen_random_uuid(), '"Fully Received"', '1ac9e2bc-966a-4da7-81be-56e44ae3ac52', '4869a22f-835c-40e6-9851-b27eb4460467', rirRequestId),

    -- Item
    (gen_random_uuid(), '"Wood (' || item_quantity2 || ' piece / ' || item_quantity2 || ' piece) (Length: 1 inch, Width: 1 inch, Height: 1 inch)"', 'c0b67fe1-c07b-4766-9b49-b95ec20e7026', '0850cbe0-3177-4700-a2b5-9638ab1e9f32', rirRequestId),
    -- Quantity
    (gen_random_uuid(), item_quantity2, 'c0b67fe1-c07b-4766-9b49-b95ec20e7026', 'a97dd892-2ce6-4def-a302-8ee72bd5f20c', rirRequestId),
    -- Receiving Status
    (gen_random_uuid(), '"Fully Received"', 'c0b67fe1-c07b-4766-9b49-b95ec20e7026', '4869a22f-835c-40e6-9851-b27eb4460467', rirRequestId),

    -- Item
    (gen_random_uuid(), '"Nail (' || item_quantity3 || ' bag / ' || item_quantity3 || ' bag) (Material: Metal, Size: 5 inch)"', '712a97ec-c7da-4c04-9191-69147fbe9a50', '0850cbe0-3177-4700-a2b5-9638ab1e9f32', rirRequestId),
    -- Quantity
    (gen_random_uuid(), floor(random() * CAST(item_quantity3 as INTEGER)), '712a97ec-c7da-4c04-9191-69147fbe9a50', 'a97dd892-2ce6-4def-a302-8ee72bd5f20c', rirRequestId),
    -- Receiving Status
    (gen_random_uuid(), '"Partially Received"', '712a97ec-c7da-4c04-9191-69147fbe9a50', '4869a22f-835c-40e6-9851-b27eb4460467', rirRequestId);

    END IF;


    --- Create All Fields and Duplicatable Fields Requests
    SELECT var_value INTO allFieldsFormId
    FROM seed_variable_table
    WHERE var_key = 'allFieldsFormId';

    SELECT var_value INTO duplicateFieldsFormId
    FROM seed_variable_table
    WHERE var_key = 'duplicateFieldsFormId';

    allFieldsRequestId := gen_random_uuid();
    duplicateFieldsRequestId := gen_random_uuid();

    INSERT INTO request_table (request_id, request_team_member_id, request_form_id, request_status, request_date_created) VALUES
    (allFieldsRequestId, ownerMemberId, allFieldsFormId, request_status, request_date_created),
    (duplicateFieldsRequestId, ownerMemberId, duplicateFieldsFormId, request_status, request_date_created);

    INSERT INTO request_signer_table (request_signer_id, request_signer_status, request_signer_request_id, request_signer_signer_id) VALUES
    (gen_random_uuid(), request_status, allFieldsRequestId, 'a6be17fc-1298-411a-b158-abb3b16cdfb6'),
    (gen_random_uuid(), request_status, duplicateFieldsRequestId, 'a92fa55d-9972-4dc5-9369-1cec51635c4a');

    INSERT INTO request_response_table (request_response_id, request_response, request_response_duplicatable_section_id, request_response_field_id, request_response_request_id) VALUES
    -- All Fields
    -- Section 1
    (gen_random_uuid(), '"Text field response 1"', NULL, '1a08417c-3a0d-433c-bc59-a598ffb13883', allFieldsRequestId),
    (gen_random_uuid(), '"Text area field response 1"', NULL, '8b796e64-524c-48ca-bc62-2e834f5ab64f', allFieldsRequestId),
    (gen_random_uuid(), '100', NULL, 'de015df9-4c2a-4cd6-8e60-80846055347e', allFieldsRequestId),
    -- Section 2
    (gen_random_uuid(), '"TRUE"', NULL, '4ea62b46-1ffe-4145-9751-f4fc0e002804', allFieldsRequestId),
    (gen_random_uuid(), '"Dropdown 1"', NULL, 'e2b59f56-4a94-40af-9adb-ad22571294cc', allFieldsRequestId),
    (gen_random_uuid(), '["Multiselect 1","Multiselect 2"]', NULL, '910ecd57-bc8e-4050-a252-8f333648ac70', allFieldsRequestId),
    -- Section 3
    (gen_random_uuid(), '"01/01/23"', NULL, '6648cc67-9b56-4808-9745-d92e0cd23167', allFieldsRequestId),
    (gen_random_uuid(), '"11:11"', NULL, 'e71b4d6f-d4c2-4475-97aa-7ab9b8ac18b1', allFieldsRequestId),

    -- Duplicatable Fields
    -- Section 1
    (gen_random_uuid(), '"Original Text Field 1"', NULL, '1d14b17f-9882-4644-8100-657c9ce3094b', duplicateFieldsRequestId),
    (gen_random_uuid(), '1', NULL, 'ef6e25fe-cebe-45b5-ab2a-9b857b7352a9', duplicateFieldsRequestId),
    (gen_random_uuid(), '"TRUE"', NULL, '8271dae2-55ae-40ce-a95c-28eb852a5b0e', duplicateFieldsRequestId),
    (gen_random_uuid(), '"Dropdown 1"', NULL, 'b02f350b-83f5-405a-be19-0bfb07803aa5', duplicateFieldsRequestId),
    -- Duplicate Section 1
    (gen_random_uuid(), '"Duplicate Text Field 1"', '5281ae81-26c1-4414-8f95-f7df983a8de8', '1d14b17f-9882-4644-8100-657c9ce3094b', duplicateFieldsRequestId),
    (gen_random_uuid(), '2', '5281ae81-26c1-4414-8f95-f7df983a8de8', 'ef6e25fe-cebe-45b5-ab2a-9b857b7352a9', duplicateFieldsRequestId),
    (gen_random_uuid(), '"FALSE"', '5281ae81-26c1-4414-8f95-f7df983a8de8', '8271dae2-55ae-40ce-a95c-28eb852a5b0e', duplicateFieldsRequestId),
    (gen_random_uuid(), '"Dropdown 2"', '5281ae81-26c1-4414-8f95-f7df983a8de8', 'b02f350b-83f5-405a-be19-0bfb07803aa5', duplicateFieldsRequestId),

    -- Section 2
    (gen_random_uuid(), '"Original Text Field 2"', NULL, 'a64d10b9-2041-42da-af9d-7e414d762753', duplicateFieldsRequestId),
    (gen_random_uuid(), '"Dropdown 2"', NULL, 'fe5cb192-f239-4415-87df-e86e293ada11', duplicateFieldsRequestId),
    (gen_random_uuid(), '"01/01/23"', NULL, 'd7eb7004-2d88-4752-a75b-61ff2789ed66', duplicateFieldsRequestId),

    -- Section 3
    (gen_random_uuid(), '["Multiselect 1"]', NULL, 'ec6831ee-ea45-468e-bd5c-fb29a7297a56', duplicateFieldsRequestId),
    (gen_random_uuid(), '"01/01/23"', NULL, 'f5e0af5e-266c-464c-81ea-fdaf0dbb9669', duplicateFieldsRequestId),
    (gen_random_uuid(), '"11:11"', NULL, '0f1d0f3b-5e8b-4666-b978-a249a981498f', duplicateFieldsRequestId),
    -- Duplicate Section 3
    (gen_random_uuid(), '["Multiselect 1","Multiselect 2"]', '70df9615-6413-4bd1-91bc-ca9b4b9b5821', 'ec6831ee-ea45-468e-bd5c-fb29a7297a56', duplicateFieldsRequestId),
    (gen_random_uuid(), '"02/01/23"', '70df9615-6413-4bd1-91bc-ca9b4b9b5821', 'f5e0af5e-266c-464c-81ea-fdaf0dbb9669', duplicateFieldsRequestId),
    (gen_random_uuid(), '"12:12"', '70df9615-6413-4bd1-91bc-ca9b4b9b5821', '0f1d0f3b-5e8b-4666-b978-a249a981498f', duplicateFieldsRequestId);

    counter := counter + 1;
  END LOOP;
END $$;