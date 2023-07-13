-- create a temporary table to access global variable values
CREATE TEMPORARY TABLE seed_variable_table (
  var_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  var_key VARCHAR(4000) UNIQUE NOT NULL,
  var_value VARCHAR(4000) NOT NULL
);

INSERT INTO seed_variable_table (var_key, var_value) VALUES
('ownerMemberId', gen_random_uuid()),
('otpFormId', gen_random_uuid()),
('quotationFormId', gen_random_uuid()),
('rirPurchasedFormId', gen_random_uuid()),
('rirSourcedFormId', gen_random_uuid()),
('chequeReferenceFormId', gen_random_uuid()),
('auditFormId', gen_random_uuid()),
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
  otpFormId UUID;
  quotationFormId UUID;
  rirPurchasedFormId UUID;
  rirSourcedFormId UUID;
  chequeReferenceFormId UUID;
  auditFormId UUID;
-- section ids
  allFieldsSectionId1 UUID;
  allFieldsSectionId2 UUID;
  allFieldsSectionId3 UUID;
  duplicateFieldsSection1 UUID;
  duplicateFieldsSection2 UUID;
  duplicateFieldsSection3 UUID;

BEGIN

-- Create new team
INSERT INTO team_table (team_id, team_name, team_user_id, team_group_list, team_project_list) VALUES
('2cfc4947-a9be-43f8-9037-c0ae7ec04bd2', 'XYZ Corp', '20ce163c-be18-49fa-a8e1-abf26c3a8a04', ARRAY['Warehouse Processor', 'Accounting Processor','Warehouse Receiver', 'Treasury Processor', 'Audit Processor'], ARRAY['Philip Morris', 'Siguil Hydro', 'Lake Mainit', 'Meralco HDD']);

SELECT var_value INTO ownerMemberId
  FROM seed_variable_table
  WHERE var_key = 'ownerMemberId';

INSERT INTO team_member_table (team_member_id, team_member_role, team_member_team_id, team_member_user_id, team_member_group_list, team_member_project_list) VALUES
(ownerMemberId, 'OWNER', '2cfc4947-a9be-43f8-9037-c0ae7ec04bd2', '20ce163c-be18-49fa-a8e1-abf26c3a8a04', ARRAY['Warehouse Processor', 'Accounting Processor','Warehouse Receiver', 'Treasury Processor', 'Audit Processor'], ARRAY['Philip Morris', 'Siguil Hydro', 'Lake Mainit', 'Meralco HDD']),
('0a61a37f-7805-4fe5-8856-3c7fa801c744', 'ADMIN', '2cfc4947-a9be-43f8-9037-c0ae7ec04bd2', '63e913eb-746e-4eb9-a1b2-4b3c88df0659', ARRAY['Warehouse Processor', 'Accounting Processor','Warehouse Receiver', 'Treasury Processor', 'Audit Processor'], ARRAY['Philip Morris', 'Siguil Hydro', 'Lake Mainit', 'Meralco HDD']),
('a750df8c-35fe-48d6-862a-1135c8f96a9a', 'ADMIN', '2cfc4947-a9be-43f8-9037-c0ae7ec04bd2', 'f5ee3322-46a1-48ea-a40f-9244ab198f18', ARRAY['Warehouse Processor', 'Accounting Processor','Warehouse Receiver', 'Treasury Processor', 'Audit Processor'], ARRAY['Philip Morris', 'Siguil Hydro', 'Lake Mainit', 'Meralco HDD']);

-- Create Forms
SELECT var_value INTO allFieldsFormId
  FROM seed_variable_table
  WHERE var_key = 'allFieldsFormId';

SELECT var_value INTO duplicateFieldsFormId
  FROM seed_variable_table
  WHERE var_key = 'duplicateFieldsFormId';

SELECT var_value INTO otpFormId
  FROM seed_variable_table
  WHERE var_key = 'otpFormId';

SELECT var_value INTO quotationFormId
  FROM seed_variable_table
  WHERE var_key = 'quotationFormId';

SELECT var_value INTO rirPurchasedFormId
  FROM seed_variable_table
  WHERE var_key = 'rirPurchasedFormId';

SELECT var_value INTO rirSourcedFormId
  FROM seed_variable_table
  WHERE var_key = 'rirSourcedFormId';

SELECT var_value INTO chequeReferenceFormId
  FROM seed_variable_table
  WHERE var_key = 'chequeReferenceFormId';

SELECT var_value INTO auditFormId
  FROM seed_variable_table
  WHERE var_key = 'auditFormId';

INSERT INTO form_table (form_id, form_name, form_description, form_app, form_team_member_id, form_is_formsly_form, form_is_hidden, form_is_for_every_member, form_group) VALUES
(allFieldsFormId, 'All Fields', 'test all types of fields', 'REQUEST', ownerMemberId, false, false, true, ARRAY[]::VARCHAR[]),
(duplicateFieldsFormId, 'Duplicatable Sections', 'test field duplicatable sections', 'REQUEST', ownerMemberId, false, false, true, ARRAY[]::VARCHAR[]),
(otpFormId, 'Order to Purchase', 'formsly premade Order to Purchase form', 'REQUEST', ownerMemberId, true, false, false, ARRAY['Warehouse Processor']),
(quotationFormId, 'Quotation', 'formsly premade Quotation form', 'REQUEST', ownerMemberId, true, true, false, ARRAY['Accounting Processor']),
(rirPurchasedFormId, 'Receiving Inspecting Report (Purchased)', 'These items were not available during this OTPs sourcing step.', 'REQUEST', ownerMemberId, true, true, false, ARRAY['Warehouse Receiver']),
(rirSourcedFormId, 'Receiving Inspecting Report (Sourced)', 'These items were available during this OTPs sourcing step.', 'REQUEST', ownerMemberId, true, true, false, ARRAY['Warehouse Receiver']),
(chequeReferenceFormId, 'Cheque Reference', 'formsly premade Cheque Reference form', 'REQUEST', ownerMemberId, true, true, false, ARRAY['Treasury Processor']),
(auditFormId, 'Audit', 'formsly premade Audit form', 'REQUEST', ownerMemberId, true, false, false, ARRAY['Audit Processor']);

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

-- OTP Form
('bbb22159-13cd-4a91-8579-175aa6344663', 'Main', 1, false, otpFormId),
('275782b4-4291-40f9-bb9f-dd5d658b1943', 'Item', 2, true, otpFormId),

-- Quotation
('829bdb96-8049-472f-96cd-e3e5c0414817', 'ID', 1, false, quotationFormId),
('0ed3bd29-910c-4f6f-93e9-0f367cd37eab', 'Main', 2, false, quotationFormId),
('f622cb4e-f6dc-40d9-9188-9911773787c8', 'Item', 3, true, quotationFormId),

-- Receiving Inspecting Report Form
('e2f8594c-a7c4-40bb-9ac3-de4618a73681', 'ID', 1, false, rirPurchasedFormId),
('1a9c5cd4-44a8-4505-b6c8-3130803fcca4', 'Quality Check', 2, false, rirPurchasedFormId),
('aa0e7187-9e0e-4853-b536-fdaf484a26d8', 'Item', 2, true, rirPurchasedFormId);

INSERT INTO field_table (field_id, field_name, field_type, field_order, field_section_id, field_is_required, field_is_read_only) VALUES
-- All Fields Form
('ade87336-6b9b-42d4-9a63-6cd9e982d230', 'Text field', 'TEXT', 1, allFieldsSectionId1, false, false),
('3351c43a-901b-4fae-b4de-b60dcbafd362', 'Text area field', 'TEXTAREA', 2, allFieldsSectionId1, false, false),
('3de74a80-fe10-457a-ad54-6a5144249e9e', 'Number field', 'NUMBER', 3, allFieldsSectionId1, false, false),
('07e15382-948a-4224-9ada-ed547cf35f28', 'Switch field', 'SWITCH', 4, allFieldsSectionId2, false, false),
('e2b59f56-4a94-40af-9adb-ad22571294cc', 'Dropdown field', 'DROPDOWN', 5, allFieldsSectionId2, false, false),
('910ecd57-bc8e-4050-a252-8f333648ac70', 'Multiselect field', 'MULTISELECT', 6, allFieldsSectionId2, false, false),
('936ac10f-63d5-42af-92c5-676191383f88', 'Date field', 'DATE', 7, allFieldsSectionId3, false, false),
('ecbe6664-27be-4bb5-87a7-5891dbeb9c5d', 'Time field', 'TIME', 8, allFieldsSectionId3, false, false),
('d8b23734-edbd-4200-adaa-bf562f88acb4', 'File field', 'FILE', 9, allFieldsSectionId3, false, false),

-- Duplicatable Section Form
('123782f5-cc53-453c-a709-123285daf450', 'Text field', 'TEXT', 1, duplicateFieldsSection1, false, false),
('b28a9cb3-1d1f-4b7e-922a-15dfdf85ed73', 'Number field', 'NUMBER', 2, duplicateFieldsSection1, false, false),
('ea199351-4cd2-4037-96b4-cdd2c060696e', 'Switch field', 'SWITCH', 3, duplicateFieldsSection1, false, false),
('b02f350b-83f5-405a-be19-0bfb07803aa5', 'Dropdown field', 'DROPDOWN', 4, duplicateFieldsSection1, false, false),

('a3b16b09-83b4-4aba-9819-a88f10e92dee', 'Text field', 'TEXT', 5, duplicateFieldsSection2, false, false),
('fe5cb192-f239-4415-87df-e86e293ada11', 'Dropdown field', 'DROPDOWN', 6, duplicateFieldsSection2, false, false),
('38448ce5-abfd-42f4-a17b-1df39a971977', 'Date field', 'DATE', 7, duplicateFieldsSection2, false, false),

('ec6831ee-ea45-468e-bd5c-fb29a7297a56', 'Multiselect field', 'MULTISELECT', 8, duplicateFieldsSection3, false, false),
('816ce049-4556-4340-8ee5-065e759d4196', 'Date field', 'DATE', 9, duplicateFieldsSection3, false, false),
('57673976-7a46-4a8f-ae0b-67d9d1d24c95', 'Time field', 'TIME', 10, duplicateFieldsSection3, false, false),

-- OTP Form
('a4733172-53af-47b1-b460-6869105f6405', 'Project Name', 'DROPDOWN', 1, 'bbb22159-13cd-4a91-8579-175aa6344663', true, false),
('d644d57b-dc0c-4f44-9cef-403fd73a7cf2', 'Type', 'DROPDOWN', 2, 'bbb22159-13cd-4a91-8579-175aa6344663', true, false),
('3b09156e-40c8-47f5-a5a8-4073ddb474de', 'Date Needed', 'DATE', 3, 'bbb22159-13cd-4a91-8579-175aa6344663', true, false),

('179be4af-5ef2-47f6-8d0f-51726736c801', 'General Name', 'DROPDOWN', 4, '275782b4-4291-40f9-bb9f-dd5d658b1943', true, false),
('390cae92-815a-4851-8497-7c81cf62bc3e', 'Unit of Measurement', 'TEXT', 5, '275782b4-4291-40f9-bb9f-dd5d658b1943', true, true),
('ad82b849-42e2-4eee-9f0d-2effb2a24395', 'Quantity', 'NUMBER', 6, '275782b4-4291-40f9-bb9f-dd5d658b1943', true, false),
('055b465c-52c9-4353-811c-fd002bb639d6', 'Cost Code', 'TEXT', 7, '275782b4-4291-40f9-bb9f-dd5d658b1943', true, false),
('2e0d9f52-e844-44c9-bb59-5dc2b887827c', 'GL Account', 'TEXT', 8, '275782b4-4291-40f9-bb9f-dd5d658b1943', true, false),
('bef47113-a186-4755-9764-263b5c246a41', 'Length', 'DROPDOWN', 9, '275782b4-4291-40f9-bb9f-dd5d658b1943', true, false),
('6e539c9f-8ab2-46f1-a8a6-89cc928c3612', 'Width', 'DROPDOWN', 9, '275782b4-4291-40f9-bb9f-dd5d658b1943', true, false),
('0af6a571-3bef-4f8c-8716-2bca5a5250fc', 'Height', 'DROPDOWN', 9, '275782b4-4291-40f9-bb9f-dd5d658b1943', true, false),
('25e93bd3-30f0-4920-a0e8-6bde5a44898c', 'Type', 'DROPDOWN', 9, '275782b4-4291-40f9-bb9f-dd5d658b1943', true, false),
('db862c96-01ec-499c-b9f1-faf7b674074d', 'Brand', 'DROPDOWN', 9, '275782b4-4291-40f9-bb9f-dd5d658b1943', true, false),
('03003ee0-811a-44e9-b420-aaac9f80d1de', 'Material', 'DROPDOWN', 9, '275782b4-4291-40f9-bb9f-dd5d658b1943', true, false),
('a6745b58-c88d-41dc-82f4-887c0062c03d', 'Size', 'DROPDOWN', 9, '275782b4-4291-40f9-bb9f-dd5d658b1943', true, false),

-- Quotation Form fields
('62f96be5-9e50-45a0-82d7-2b0d731eda91', 'Order to Purchase ID', 'LINK', 1, '829bdb96-8049-472f-96cd-e3e5c0414817', true, true),
('4aee0513-c746-409c-83e3-1ac169afacfe', 'Supplier', 'DROPDOWN', 2, '0ed3bd29-910c-4f6f-93e9-0f367cd37eab', true, false),
('97bfef27-660e-4533-add8-fc80cea23e40', 'Supplier Quotation', 'FILE', 3, '0ed3bd29-910c-4f6f-93e9-0f367cd37eab', true, false),
('587fbe8c-d0e4-4e92-865d-9a005e1ad04a', 'Request Send Method', 'DROPDOWN', 4, '0ed3bd29-910c-4f6f-93e9-0f367cd37eab', false, false),
('fd947409-24dd-4a2b-86fd-b225e5748fcb', 'Proof of Sending', 'FILE', 5, '0ed3bd29-910c-4f6f-93e9-0f367cd37eab', false, false),
('bfdf6962-38d0-47ba-9c77-d840a87047e5', 'Item', 'DROPDOWN', 6, 'f622cb4e-f6dc-40d9-9188-9911773787c8', true, false),
('a1c72d8e-5321-4e16-9307-41df5242fc6a', 'Price', 'NUMBER', 7, 'f622cb4e-f6dc-40d9-9188-9911773787c8', true, false),
('536d7cc3-a458-467b-a716-ff7c39d83d9a', 'Quantity', 'NUMBER', 8, 'f622cb4e-f6dc-40d9-9188-9911773787c8', true, false),

-- Receiving Inspecting Report Form fields
('fd24e66d-d7f4-4f7e-859a-8ee0fcd0ff7c', 'Order to Purchase ID', 'LINK', 1, 'e2f8594c-a7c4-40bb-9ac3-de4618a73681', true, true),
('d4bed2d2-1391-45af-96d9-38e0a92c23cf', 'Quotation ID', 'LINK', 2, 'e2f8594c-a7c4-40bb-9ac3-de4618a73681', true, true),
('1a7f1785-0c4b-419a-b2a1-b4a937077d64', 'Item', 'DROPDOWN', 3, 'aa0e7187-9e0e-4853-b536-fdaf484a26d8', true, false),
('3a44facc-d2a6-4346-b9b3-57731765555c', 'Quantity', 'NUMBER', 4, 'aa0e7187-9e0e-4853-b536-fdaf484a26d8', true, false),
('6f12e069-3fa7-418a-bf09-87edfd711509', 'Receiving Status', 'TEXT', 5, 'aa0e7187-9e0e-4853-b536-fdaf484a26d8', true, true);

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
('72d99515-3fcd-47cf-abb6-bbcccf4982fe', 'Order to Purchase', 3, 'd644d57b-dc0c-4f44-9cef-403fd73a7cf2');

-- Add items
INSERT INTO item_table (item_id, item_general_name, item_unit, item_purpose, item_team_id, item_cost_code, item_gl_account) VALUES 
('5dc0a81e-fe9d-4da0-bafc-f498d575ef39', 'Wood', 'piece', 'Major Material', '2cfc4947-a9be-43f8-9037-c0ae7ec04bd2', '22773', 'rX7VU'),
('245aa3d4-0d76-4124-9398-ab177b55c553', 'Gasoline', 'litre', 'Major Material', '2cfc4947-a9be-43f8-9037-c0ae7ec04bd2', '87943', 'dpRHk'),
('5b4652ae-4460-4fc3-9a8a-923b30132d03', 'Nail', 'bag', 'Major Material', '2cfc4947-a9be-43f8-9037-c0ae7ec04bd2', '48749', 'QAMFi');

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
('ab5287ae-50df-4e27-a2f8-84c6ce472abc', TRUE, 'Approved', 1, otpFormId, '0a61a37f-7805-4fe5-8856-3c7fa801c744'),
('18dcb6e5-a572-4fe9-9ad9-c86279723098', FALSE, 'Approved', 2, otpFormId, 'a750df8c-35fe-48d6-862a-1135c8f96a9a'),
('5d640270-11a2-43e2-9316-de0414b837c0', TRUE, 'Approved', 1, quotationFormId, 'a750df8c-35fe-48d6-862a-1135c8f96a9a'),
('ac286d08-cfb3-42b2-9eab-4e5b9cedbf68', TRUE, 'Approved', 1, rirPurchasedFormId, '0a61a37f-7805-4fe5-8856-3c7fa801c744');

END $$;


-- CREATE REQUESTS SEED
DO $$ 
DECLARE
  ownerMemberId UUID;
  otpFormId UUID;
  optRequestId UUID;
  quotationFormId UUID;
  quotationRequestId UUID;
  quotation_request_status TEXT;
  rirPurchasedFormId UUID;
  rirSourcedFormId UUID;
  rirRequestId UUID;
  rirRequestStatus TEXT;
  allFieldsFormId UUID;
  allFieldsRequestId UUID;
  duplicateFieldsFormId UUID;
  duplicateFieldsRequestId UUID;
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

SELECT var_value INTO otpFormId
  FROM seed_variable_table
  WHERE var_key = 'otpFormId';

  WHILE counter <= 5000 LOOP
    -- Generate request_id
    optRequestId := gen_random_uuid();
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


    -- Create OTP request
    INSERT INTO request_table (request_id, request_team_member_id, request_form_id, request_status, request_date_created) VALUES
      (optRequestId, ownerMemberId, otpFormId, request_status, request_date_created);

    -- Request signer table
    INSERT INTO request_signer_table (request_signer_id, request_signer_status, request_signer_request_id, request_signer_signer_id) VALUES
      (gen_random_uuid(), request_signer_status, optRequestId, 'ab5287ae-50df-4e27-a2f8-84c6ce472abc'),
      (gen_random_uuid(), request_signer_status, optRequestId, '18dcb6e5-a572-4fe9-9ad9-c86279723098');

    INSERT INTO request_response_table (request_response_id, request_response, request_response_duplicatable_section_id, request_response_field_id, request_response_request_id) VALUES
      -- Main Section
      -- Project Name
      (gen_random_uuid(), '"LAKE MAINIT"', NULL, 'a4733172-53af-47b1-b460-6869105f6405', optRequestId),
      -- Type
      (gen_random_uuid(), '"Cash Purchase - Local Purchase"', NULL, 'd644d57b-dc0c-4f44-9cef-403fd73a7cf2', optRequestId),
      -- Date Needed
      (gen_random_uuid(), '"' || request_date_created || '"', NULL, '3b09156e-40c8-47f5-a5a8-4073ddb474de', optRequestId),

      -- Item Section

      -- General Name
      (gen_random_uuid(), '"Gasoline"', NULL, '179be4af-5ef2-47f6-8d0f-51726736c801', optRequestId),
      -- Unit of Measurement
      (gen_random_uuid(), '"litre"', NULL, '390cae92-815a-4851-8497-7c81cf62bc3e', optRequestId),
      -- Quantity
      (gen_random_uuid(), item_quantity1, NULL, 'ad82b849-42e2-4eee-9f0d-2effb2a24395', optRequestId),
      -- Cost Code
      (gen_random_uuid(), '"33552"', NULL, '055b465c-52c9-4353-811c-fd002bb639d6', optRequestId),
      -- GL Account
      (gen_random_uuid(), '"0x22141"', NULL, '2e0d9f52-e844-44c9-bb59-5dc2b887827c', optRequestId),
      -- Type
      (gen_random_uuid(), '"Diesel"', NULL, '25e93bd3-30f0-4920-a0e8-6bde5a44898c', optRequestId),
      -- Brand
      (gen_random_uuid(), '"Shell"', NULL, 'db862c96-01ec-499c-b9f1-faf7b674074d', optRequestId),

      -- General Name
      (gen_random_uuid(), '"Wood"', duplicatatable_section_id1, '179be4af-5ef2-47f6-8d0f-51726736c801', optRequestId),
      -- Unit of Measurement
      (gen_random_uuid(), '"piece"', duplicatatable_section_id1, '390cae92-815a-4851-8497-7c81cf62bc3e', optRequestId),
      -- Quantity
      (gen_random_uuid(), item_quantity2, duplicatatable_section_id1, 'ad82b849-42e2-4eee-9f0d-2effb2a24395', optRequestId),
      -- Cost Code
      (gen_random_uuid(), '"664522"', duplicatatable_section_id1, '055b465c-52c9-4353-811c-fd002bb639d6', optRequestId),
      -- GL Account
      (gen_random_uuid(), '"0x22141"', duplicatatable_section_id1, '2e0d9f52-e844-44c9-bb59-5dc2b887827c', optRequestId),
      -- Length
      (gen_random_uuid(), '"1 inch"', duplicatatable_section_id1, 'bef47113-a186-4755-9764-263b5c246a41', optRequestId),
      -- Width
      (gen_random_uuid(), '"1 inch"', duplicatatable_section_id1, '6e539c9f-8ab2-46f1-a8a6-89cc928c3612', optRequestId),
      -- Height
      (gen_random_uuid(), '"1 inch"', duplicatatable_section_id1, '0af6a571-3bef-4f8c-8716-2bca5a5250fc', optRequestId),

      -- General Name
      (gen_random_uuid(), '"Nail"', duplicatatable_section_id2, '179be4af-5ef2-47f6-8d0f-51726736c801', optRequestId),
      -- Unit of Measurement
      (gen_random_uuid(), '"bag"', duplicatatable_section_id2, '390cae92-815a-4851-8497-7c81cf62bc3e', optRequestId),
      -- Quantity
      (gen_random_uuid(), item_quantity3, duplicatatable_section_id2, 'ad82b849-42e2-4eee-9f0d-2effb2a24395', optRequestId),
      -- Cost Code
      (gen_random_uuid(), '"064520"', duplicatatable_section_id2, '055b465c-52c9-4353-811c-fd002bb639d6', optRequestId),
      -- GL Account
      (gen_random_uuid(), '"0x221422"', duplicatatable_section_id2, '2e0d9f52-e844-44c9-bb59-5dc2b887827c', optRequestId),
      -- Material
      (gen_random_uuid(), '"Metal"', duplicatatable_section_id2, '03003ee0-811a-44e9-b420-aaac9f80d1de', optRequestId),
      -- Size
      (gen_random_uuid(), '"5 inch"', duplicatatable_section_id2, 'a6745b58-c88d-41dc-82f4-887c0062c03d', optRequestId);


    -- Create Quotation Form
    
    -- Assign quotation_request_status based on odds
    SELECT CASE 
      WHEN random() < 0.5 THEN 'APPROVED'
      WHEN random() < 0.25 THEN 'REJECTED'
      ELSE 'PENDING'
    END INTO quotation_request_status;


    -- Create Quotation Request if OTP Request is APPROVED
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
    -- OTP ID
    (gen_random_uuid(), '"' || optRequestId || '"', NULL, '62f96be5-9e50-45a0-82d7-2b0d731eda91', quotationRequestId),
    -- Supplier
    (gen_random_uuid(), '"Begul Builders Corporation"', NULL, '4aee0513-c746-409c-83e3-1ac169afacfe', quotationRequestId),
    -- Supplier Quotation
    (gen_random_uuid(), '"test.pdf"', NULL, '97bfef27-660e-4533-add8-fc80cea23e40', quotationRequestId),

    -- Item
    (gen_random_uuid(), '"Gasoline (' || item_quantity1 || ' litre) (Type: Diesel, Brand: Shell)"', NULL, 'bfdf6962-38d0-47ba-9c77-d840a87047e5', quotationRequestId),
    -- Price
    (gen_random_uuid(), '50' , NULL, 'a1c72d8e-5321-4e16-9307-41df5242fc6a', quotationRequestId),
    -- Quantity
    (gen_random_uuid(), item_quantity1, NULL, '536d7cc3-a458-467b-a716-ff7c39d83d9a', quotationRequestId),

    -- Item
    (gen_random_uuid(), '"Wood (' || item_quantity2 || ' piece) (Length: 1 inch, Width: 1 inch, Height: 1 inch)"' , 'b613091d-bab2-457e-a1f7-119b4ee6e7d7', 'bfdf6962-38d0-47ba-9c77-d840a87047e5', quotationRequestId),
    -- Price
    (gen_random_uuid(), '20' , 'b613091d-bab2-457e-a1f7-119b4ee6e7d7', 'a1c72d8e-5321-4e16-9307-41df5242fc6a', quotationRequestId),
    -- Quantity
    (gen_random_uuid(), item_quantity2, 'b613091d-bab2-457e-a1f7-119b4ee6e7d7', '536d7cc3-a458-467b-a716-ff7c39d83d9a', quotationRequestId),

    -- Item
    (gen_random_uuid(), '"Nail (' || item_quantity3 || ' bag) (Material: Metal, Size: 5 inch)"' , 'a5008080-75e0-4960-9bfd-83d9a47da6a9', 'bfdf6962-38d0-47ba-9c77-d840a87047e5', quotationRequestId),
    -- Price
    (gen_random_uuid(), '40' , 'a5008080-75e0-4960-9bfd-83d9a47da6a9', 'a1c72d8e-5321-4e16-9307-41df5242fc6a', quotationRequestId),
    -- Quantity
    (gen_random_uuid(), item_quantity3, 'a5008080-75e0-4960-9bfd-83d9a47da6a9', '536d7cc3-a458-467b-a716-ff7c39d83d9a', quotationRequestId);

    END IF;

    -- Create RIR Request if Quotation Request is APPROVED
    IF quotation_request_status = 'APPROVED' AND request_status = 'APPROVED'
    THEN

    SELECT var_value INTO rirPurchasedFormId
    FROM seed_variable_table
    WHERE var_key = 'rirPurchasedFormId';

    rirRequestId := gen_random_uuid();

    -- Assign rirRequestStatus based on odds
    SELECT CASE 
      WHEN random() < 0.5 THEN 'APPROVED'
      WHEN random() < 0.25 THEN 'REJECTED'
      ELSE 'PENDING'
    END INTO rirRequestStatus;


    INSERT INTO request_table (request_id, request_team_member_id, request_form_id, request_status, request_date_created) VALUES
    (rirRequestId, ownerMemberId, rirPurchasedFormId, rirRequestStatus, request_date_created);

    INSERT INTO request_signer_table (request_signer_id, request_signer_status, request_signer_request_id, request_signer_signer_id) VALUES
    (gen_random_uuid(), rirRequestStatus, rirRequestId, '5d640270-11a2-43e2-9316-de0414b837c0');
    
    INSERT INTO request_response_table (request_response_id, request_response, request_response_duplicatable_section_id, request_response_field_id, request_response_request_id) VALUES
    -- OTP ID
    (gen_random_uuid(), '"' || optRequestId || '"', NULL, 'fd24e66d-d7f4-4f7e-859a-8ee0fcd0ff7c', rirRequestId),
    -- Quotation ID
    (gen_random_uuid(), '"' || quotationRequestId || '"', NULL, 'd4bed2d2-1391-45af-96d9-38e0a92c23cf', rirRequestId),
    -- Item
    (gen_random_uuid(), '"Gasoline (' || item_quantity1 || ' litre / ' || item_quantity1 || ' litre) (Type: Diesel, Brand: Shell)"', '1ac9e2bc-966a-4da7-81be-56e44ae3ac52', '1a7f1785-0c4b-419a-b2a1-b4a937077d64', rirRequestId),
    -- Quantity
    (gen_random_uuid(), item_quantity1, '1ac9e2bc-966a-4da7-81be-56e44ae3ac52', '3a44facc-d2a6-4346-b9b3-57731765555c', rirRequestId),
    -- Receiving Status
    (gen_random_uuid(), '"Fully Received"', '1ac9e2bc-966a-4da7-81be-56e44ae3ac52', '6f12e069-3fa7-418a-bf09-87edfd711509', rirRequestId),

    -- Item
    (gen_random_uuid(), '"Wood (' || item_quantity2 || ' piece / ' || item_quantity2 || ' piece) (Length: 1 inch, Width: 1 inch, Height: 1 inch)"', 'c0b67fe1-c07b-4766-9b49-b95ec20e7026', '1a7f1785-0c4b-419a-b2a1-b4a937077d64', rirRequestId),
    -- Quantity
    (gen_random_uuid(), item_quantity2, 'c0b67fe1-c07b-4766-9b49-b95ec20e7026', '3a44facc-d2a6-4346-b9b3-57731765555c', rirRequestId),
    -- Receiving Status
    (gen_random_uuid(), '"Fully Received"', 'c0b67fe1-c07b-4766-9b49-b95ec20e7026', '6f12e069-3fa7-418a-bf09-87edfd711509', rirRequestId),

    -- Item
    (gen_random_uuid(), '"Nail (' || item_quantity3 || ' bag / ' || item_quantity3 || ' bag) (Material: Metal, Size: 5 inch)"', '712a97ec-c7da-4c04-9191-69147fbe9a50', '1a7f1785-0c4b-419a-b2a1-b4a937077d64', rirRequestId),
    -- Quantity
    (gen_random_uuid(), floor(random() * CAST(item_quantity3 as INTEGER)), '712a97ec-c7da-4c04-9191-69147fbe9a50', '3a44facc-d2a6-4346-b9b3-57731765555c', rirRequestId),
    -- Receiving Status
    (gen_random_uuid(), '"Partially Received"', '712a97ec-c7da-4c04-9191-69147fbe9a50', '6f12e069-3fa7-418a-bf09-87edfd711509', rirRequestId);

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
    (gen_random_uuid(), '"Text field response 1"', NULL, 'ade87336-6b9b-42d4-9a63-6cd9e982d230', allFieldsRequestId),
    (gen_random_uuid(), '"Text area field response 1"', NULL, '3351c43a-901b-4fae-b4de-b60dcbafd362', allFieldsRequestId),
    (gen_random_uuid(), '100', NULL, '3de74a80-fe10-457a-ad54-6a5144249e9e', allFieldsRequestId),
    -- Section 2
    (gen_random_uuid(), '"TRUE"', NULL, '07e15382-948a-4224-9ada-ed547cf35f28', allFieldsRequestId),
    (gen_random_uuid(), '"Dropdown 1"', NULL, 'e2b59f56-4a94-40af-9adb-ad22571294cc', allFieldsRequestId),
    (gen_random_uuid(), '["Multiselect 1","Multiselect 2"]', NULL, '910ecd57-bc8e-4050-a252-8f333648ac70', allFieldsRequestId),
    -- Section 3
    (gen_random_uuid(), '"01/01/23"', NULL, '936ac10f-63d5-42af-92c5-676191383f88', allFieldsRequestId),
    (gen_random_uuid(), '"11:11"', NULL, 'ecbe6664-27be-4bb5-87a7-5891dbeb9c5d', allFieldsRequestId),

    -- Duplicatable Fields
    -- Section 1
    (gen_random_uuid(), '"Original Text Field 1"', NULL, '123782f5-cc53-453c-a709-123285daf450', duplicateFieldsRequestId),
    (gen_random_uuid(), '1', NULL, 'b28a9cb3-1d1f-4b7e-922a-15dfdf85ed73', duplicateFieldsRequestId),
    (gen_random_uuid(), '"TRUE"', NULL, 'ea199351-4cd2-4037-96b4-cdd2c060696e', duplicateFieldsRequestId),
    (gen_random_uuid(), '"Dropdown 1"', NULL, 'b02f350b-83f5-405a-be19-0bfb07803aa5', duplicateFieldsRequestId),
    -- Duplicate Section 1
    (gen_random_uuid(), '"Duplicate Text Field 1"', '5281ae81-26c1-4414-8f95-f7df983a8de8', '123782f5-cc53-453c-a709-123285daf450', duplicateFieldsRequestId),
    (gen_random_uuid(), '2', '5281ae81-26c1-4414-8f95-f7df983a8de8', 'b28a9cb3-1d1f-4b7e-922a-15dfdf85ed73', duplicateFieldsRequestId),
    (gen_random_uuid(), '"FALSE"', '5281ae81-26c1-4414-8f95-f7df983a8de8', 'ea199351-4cd2-4037-96b4-cdd2c060696e', duplicateFieldsRequestId),
    (gen_random_uuid(), '"Dropdown 2"', '5281ae81-26c1-4414-8f95-f7df983a8de8', 'b02f350b-83f5-405a-be19-0bfb07803aa5', duplicateFieldsRequestId),

    -- Section 2
    (gen_random_uuid(), '"Original Text Field 2"', NULL, 'a3b16b09-83b4-4aba-9819-a88f10e92dee', duplicateFieldsRequestId),
    (gen_random_uuid(), '"Dropdown 2"', NULL, 'fe5cb192-f239-4415-87df-e86e293ada11', duplicateFieldsRequestId),
    (gen_random_uuid(), '"01/01/23"', NULL, '38448ce5-abfd-42f4-a17b-1df39a971977', duplicateFieldsRequestId),

    -- Section 3
    (gen_random_uuid(), '["Multiselect 1"]', NULL, 'ec6831ee-ea45-468e-bd5c-fb29a7297a56', duplicateFieldsRequestId),
    (gen_random_uuid(), '"01/01/23"', NULL, '816ce049-4556-4340-8ee5-065e759d4196', duplicateFieldsRequestId),
    (gen_random_uuid(), '"11:11"', NULL, '57673976-7a46-4a8f-ae0b-67d9d1d24c95', duplicateFieldsRequestId),
    -- Duplicate Section 3
    (gen_random_uuid(), '["Multiselect 1","Multiselect 2"]', '70df9615-6413-4bd1-91bc-ca9b4b9b5821', 'ec6831ee-ea45-468e-bd5c-fb29a7297a56', duplicateFieldsRequestId),
    (gen_random_uuid(), '"02/01/23"', '70df9615-6413-4bd1-91bc-ca9b4b9b5821', '816ce049-4556-4340-8ee5-065e759d4196', duplicateFieldsRequestId),
    (gen_random_uuid(), '"12:12"', '70df9615-6413-4bd1-91bc-ca9b4b9b5821', '57673976-7a46-4a8f-ae0b-67d9d1d24c95', duplicateFieldsRequestId);

    counter := counter + 1;
  END LOOP;
END $$;