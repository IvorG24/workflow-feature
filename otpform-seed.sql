-- Create new team

INSERT INTO team_table (team_id, team_name, team_user_id, team_group_list) VALUES
('2cfc4947-a9be-43f8-9037-c0ae7ec04bd2', 'XYZ Corp', '15de3182-6efe-47cf-b681-00f8ed10365f', ARRAY['Warehouse Processor', 'Accounting Processor','Warehouse Receiver', 'Treasury Processor', 'Audit Processor']);

-- Add Members
INSERT INTO team_member_table (team_member_id, team_member_role, team_member_team_id, team_member_user_id, team_member_group_list) VALUES
('6bc6029f-03ea-4053-8f4b-52d91be69359', 'OWNER', '2cfc4947-a9be-43f8-9037-c0ae7ec04bd2', '15de3182-6efe-47cf-b681-00f8ed10365f', ARRAY['Warehouse Processor', 'Accounting Processor','Warehouse Receiver', 'Treasury Processor', 'Audit Processor']),

('ea01e1dd-0bb0-4902-9ca9-63b9a5171ae2', 'ADMIN', '2cfc4947-a9be-43f8-9037-c0ae7ec04bd2', '66865893-dd0a-40f3-8acd-03fed41d4051', ARRAY['Warehouse Processor', 'Accounting Processor','Warehouse Receiver', 'Treasury Processor', 'Audit Processor']),
('503148fd-fe66-4ae1-ac10-6c2fa068246c', 'ADMIN', '2cfc4947-a9be-43f8-9037-c0ae7ec04bd2', 'bcaad583-4bb3-4d86-9067-956cf7f20688', ARRAY['Warehouse Processor', 'Accounting Processor','Warehouse Receiver', 'Treasury Processor', 'Audit Processor']);

-- Create OTP Form
INSERT INTO form_table (form_id, form_name, form_description, form_app, form_team_member_id, form_is_formsly_form, form_is_hidden) VALUES
('281b7de3-e204-43c2-bc89-9cb7bfcb341e', 'Order to Purchase', 'formsly premade Order to Purchase form', 'REQUEST', '6bc6029f-03ea-4053-8f4b-52d91be69359', true, false);

-- Add signer
INSERT INTO signer_table (signer_id, signer_is_primary_signer, signer_action, signer_order, signer_form_id, signer_team_member_id) VALUES
('ab5287ae-50df-4e27-a2f8-84c6ce472abc', TRUE, 'Approved', 1, '281b7de3-e204-43c2-bc89-9cb7bfcb341e', 'ea01e1dd-0bb0-4902-9ca9-63b9a5171ae2'),
('18dcb6e5-a572-4fe9-9ad9-c86279723098', FALSE, 'Approved', 2, '281b7de3-e204-43c2-bc89-9cb7bfcb341e', '503148fd-fe66-4ae1-ac10-6c2fa068246c');

-- Add section
INSERT INTO section_table (section_id, section_name, section_order, section_is_duplicatable, section_form_id) VALUES 
('bbb22159-13cd-4a91-8579-175aa6344663', 'Main', 1, false, '281b7de3-e204-43c2-bc89-9cb7bfcb341e'),
('275782b4-4291-40f9-bb9f-dd5d658b1943', 'Item', 2, true, '281b7de3-e204-43c2-bc89-9cb7bfcb341e');

-- Add fields
INSERT INTO field_table (field_id, field_name, field_type, field_order, field_section_id, field_is_required, field_is_read_only) VALUES
-- Main Fields
('a4733172-53af-47b1-b460-6869105f6405', 'Project Name', 'DROPDOWN', 1, 'bbb22159-13cd-4a91-8579-175aa6344663', true, false),
('d644d57b-dc0c-4f44-9cef-403fd73a7cf2', 'Type', 'DROPDOWN', 2, 'bbb22159-13cd-4a91-8579-175aa6344663', true, false),
('3b09156e-40c8-47f5-a5a8-4073ddb474de', 'Date Needed', 'DATE', 3, 'bbb22159-13cd-4a91-8579-175aa6344663', true, false),
('055b465c-52c9-4353-811c-fd002bb639d6', 'Cost Code', 'TEXT', 4, 'bbb22159-13cd-4a91-8579-175aa6344663', true, false),
-- Item Fields
('179be4af-5ef2-47f6-8d0f-51726736c801', 'General Name', 'DROPDOWN', 5, '275782b4-4291-40f9-bb9f-dd5d658b1943', true, false),
('390cae92-815a-4851-8497-7c81cf62bc3e', 'Unit', 'TEXT', 6, '275782b4-4291-40f9-bb9f-dd5d658b1943', true, true),
('ad82b849-42e2-4eee-9f0d-2effb2a24395', 'Quantity', 'NUMBER', 7, '275782b4-4291-40f9-bb9f-dd5d658b1943', true, false),
('bef47113-a186-4755-9764-263b5c246a41', 'Length', 'DROPDOWN', 8, '275782b4-4291-40f9-bb9f-dd5d658b1943', true, false),
('6e539c9f-8ab2-46f1-a8a6-89cc928c3612', 'Width', 'DROPDOWN', 8, '275782b4-4291-40f9-bb9f-dd5d658b1943', true, false),
('0af6a571-3bef-4f8c-8716-2bca5a5250fc', 'Height', 'DROPDOWN', 8, '275782b4-4291-40f9-bb9f-dd5d658b1943', true, false),
('25e93bd3-30f0-4920-a0e8-6bde5a44898c', 'Type', 'DROPDOWN', 8, '275782b4-4291-40f9-bb9f-dd5d658b1943', true, false),
('db862c96-01ec-499c-b9f1-faf7b674074d', 'Brand', 'DROPDOWN', 8, '275782b4-4291-40f9-bb9f-dd5d658b1943', true, false),
('03003ee0-811a-44e9-b420-aaac9f80d1de', 'Material', 'DROPDOWN', 8, '275782b4-4291-40f9-bb9f-dd5d658b1943', true, false),
('a6745b58-c88d-41dc-82f4-887c0062c03d', 'Size', 'DROPDOWN', 8, '275782b4-4291-40f9-bb9f-dd5d658b1943', true, false);

-- Add options
INSERT INTO option_table (option_id, option_value, option_order, option_field_id) VALUES
('a4c9cf29-c4cc-4b6f-af3d-6a50946af85e', 'Cash Purchase - Advance Payment', 1, '6882287e-57c7-42ae-a672-b0d6c8979b01'),
('c22aa5ed-7dc8-45b1-8917-2d12290f8936', 'Cash Purchase - Local Purchase', 2, '6882287e-57c7-42ae-a672-b0d6c8979b01'),
('72d99515-3fcd-47cf-abb6-bbcccf4982fe', 'Order to Purchase', 3, '6882287e-57c7-42ae-a672-b0d6c8979b01');

-- Add items
INSERT INTO item_table (item_id, item_general_name, item_unit, item_purpose, item_team_id) VALUES 
('5dc0a81e-fe9d-4da0-bafc-f498d575ef39', 'Wood', 'piece', 'Major Material', '2cfc4947-a9be-43f8-9037-c0ae7ec04bd2'),
('245aa3d4-0d76-4124-9398-ab177b55c553', 'Gasoline', 'litre', 'Major Material', '2cfc4947-a9be-43f8-9037-c0ae7ec04bd2'),
('5b4652ae-4460-4fc3-9a8a-923b30132d03', 'Nail', 'bag', 'Major Material', '2cfc4947-a9be-43f8-9037-c0ae7ec04bd2');

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

INSERT INTO project_table (project_id, project_name, project_team_id) VALUES
('2c58737d-b8bc-4614-bdb3-8008d8eec645', 'Philip Morris', '2cfc4947-a9be-43f8-9037-c0ae7ec04bd2'),
('32c6c8b4-4a20-4a15-b47e-8ebe409f5fc7', 'Siguil Hydro', '2cfc4947-a9be-43f8-9037-c0ae7ec04bd2'),
('6258a2f9-ab85-47a8-beca-15c0f65ba534', 'Lake Mainit', '2cfc4947-a9be-43f8-9037-c0ae7ec04bd2'),
('ab060cc4-d320-4e94-be46-8571f85fbd49', 'Meralco HDD', '2cfc4947-a9be-43f8-9037-c0ae7ec04bd2');

INSERT INTO supplier_table (supplier_id, supplier_name, supplier_team_id) VALUES
('d07f34da-75db-4fe1-a85b-8c540314769a', 'Techrom Computer Shop', '2cfc4947-a9be-43f8-9037-c0ae7ec04bd2'),
('b501e500-eeb8-43c7-93ec-642ffe15d66a', 'Symmetric Intercontinental IT Solutions Inc', '2cfc4947-a9be-43f8-9037-c0ae7ec04bd2'),
('39db91c4-4cd2-44ce-8482-b98862edfa40', 'Fire Solution Inc', '2cfc4947-a9be-43f8-9037-c0ae7ec04bd2'),
('245db815-a8ab-4230-9d43-7ffa65ce0a47', 'Begul Builders Corporation', '2cfc4947-a9be-43f8-9037-c0ae7ec04bd2');


-- Create OTP requests

DO $$ 
DECLARE
  request_id UUID;
  request_status TEXT;
  request_signer_status TEXT;
  request_date_created TIMESTAMPTZ;
  counter INT := 1;
BEGIN
  WHILE counter <= 100 LOOP
    -- Generate request_id
    request_id := gen_random_uuid();

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

   -- Generate random date within the current year
  request_date_created := date_trunc('year', current_date) + random() * (date_trunc('year', current_date + INTERVAL '1 year') - date_trunc('year', current_date));

    -- Create request
    INSERT INTO request_table (request_id, request_team_member_id, request_form_id, request_status, request_date_created) VALUES
      (request_id, '6bc6029f-03ea-4053-8f4b-52d91be69359', '281b7de3-e204-43c2-bc89-9cb7bfcb341e', request_status, request_date_created);

    -- Request signer table
    INSERT INTO request_signer_table (request_signer_id, request_signer_status, request_signer_request_id, request_signer_signer_id) VALUES
      (gen_random_uuid(), request_signer_status, request_id, 'ab5287ae-50df-4e27-a2f8-84c6ce472abc'),
      (gen_random_uuid(), request_signer_status, request_id, '18dcb6e5-a572-4fe9-9ad9-c86279723098');

    INSERT INTO request_response_table (request_response_id, request_response, request_response_duplicatable_section_id, request_response_field_id, request_response_request_id) VALUES
      -- Main Section
      (gen_random_uuid(), '"LAKE MAINIT"', NULL, 'a4733172-53af-47b1-b460-6869105f6405', request_id),
      (gen_random_uuid(), '"Cash Purchase - Local Purchase"', NULL, 'd644d57b-dc0c-4f44-9cef-403fd73a7cf2', request_id),
      (gen_random_uuid(), '"' || request_date_created || '"', NULL, '3b09156e-40c8-47f5-a5a8-4073ddb474de', request_id),
      (gen_random_uuid(), '"33552"', NULL, '055b465c-52c9-4353-811c-fd002bb639d6', request_id),

      -- Item Section
      (gen_random_uuid(), '"Gasoline"', NULL, '179be4af-5ef2-47f6-8d0f-51726736c801', request_id),
      (gen_random_uuid(), '"litre"', NULL, '390cae92-815a-4851-8497-7c81cf62bc3e', request_id),
      (gen_random_uuid(), '20', NULL, 'ad82b849-42e2-4eee-9f0d-2effb2a24395', request_id),
      (gen_random_uuid(), '"Diesel"', NULL, '25e93bd3-30f0-4920-a0e8-6bde5a44898c', request_id),
      (gen_random_uuid(), '"Shell"', NULL, 'db862c96-01ec-499c-b9f1-faf7b674074d', request_id),

      (gen_random_uuid(), '"Wood"', '503c2843-3f16-4a53-9934-c0607b3cc0c7', '179be4af-5ef2-47f6-8d0f-51726736c801', request_id),
      (gen_random_uuid(), '"piece"', '503c2843-3f16-4a53-9934-c0607b3cc0c7', '390cae92-815a-4851-8497-7c81cf62bc3e', request_id),
      (gen_random_uuid(), '100', '503c2843-3f16-4a53-9934-c0607b3cc0c7', 'ad82b849-42e2-4eee-9f0d-2effb2a24395', request_id),
      (gen_random_uuid(), '"1 inch"', '503c2843-3f16-4a53-9934-c0607b3cc0c7', 'bef47113-a186-4755-9764-263b5c246a41', request_id),
      (gen_random_uuid(), '"1 inch"', '503c2843-3f16-4a53-9934-c0607b3cc0c7', '6e539c9f-8ab2-46f1-a8a6-89cc928c3612', request_id),
      (gen_random_uuid(), '"1 inch"', '503c2843-3f16-4a53-9934-c0607b3cc0c7', '0af6a571-3bef-4f8c-8716-2bca5a5250fc', request_id),

      (gen_random_uuid(), '"Nail"', 'f5682cce-9144-4f07-83ab-dd0db99af711', '179be4af-5ef2-47f6-8d0f-51726736c801', request_id),
      (gen_random_uuid(), '"bag"', 'f5682cce-9144-4f07-83ab-dd0db99af711', '390cae92-815a-4851-8497-7c81cf62bc3e', request_id),
      (gen_random_uuid(), '40', 'f5682cce-9144-4f07-83ab-dd0db99af711', 'ad82b849-42e2-4eee-9f0d-2effb2a24395', request_id),
      (gen_random_uuid(), '"Metal"', 'f5682cce-9144-4f07-83ab-dd0db99af711', '03003ee0-811a-44e9-b420-aaac9f80d1de', request_id),
      (gen_random_uuid(), '"5 inch"', 'f5682cce-9144-4f07-83ab-dd0db99af711', 'a6745b58-c88d-41dc-82f4-887c0062c03d', request_id);

    counter := counter + 1;
  END LOOP;
END $$;



