INSERT INTO user_table (user_id, user_username, user_first_name, user_last_name, user_email, user_job_title, user_phone_number, user_active_team_id) VALUES
('60874c99-8bd4-4e6c-bc2e-7b90a00878da', 'lancejuat', 'Lance Andrei', 'Juat', 'lancejuat26@gmail.com', 'Web Developer', '9358171232', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('8f174be9-72fd-4b2d-851b-c31e1cbf9a37', 'jaycee', 'Juan Carlos', 'Lumingkit', 'juancarloslumingkit@gmail.com', 'Web Developer', '', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('dde9b9cd-04fd-4dee-a4f7-2d0cac28c60b', 'markjaylunas', 'Mark Jay', 'Lunas', 'markjay.lunas@gmail.com', 'Web Developer', '', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('16aeb09a-2bcc-445a-bf89-ad0e935b9ea2', 'denvercalwing', 'Denver', 'Calwing', 'denver.calwing@staclara.com.ph', '', '9285115565', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('6311438e-ffdd-41b0-8523-d0fdea5cebca', 'ivansedanto', 'Ivan Gerard', 'Sedanto', 'ivan.sedanto@staclara.com.ph', '', '9088181378', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('35549b69-8d0e-4a71-9268-7268941c809c', 'gezilguntan', 'Gezil', 'Guntan', 'gezil.guntan@staclara.com.ph', 'Warehouse Support Lead', '9060288834', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('75481c37-3e40-49ad-bcbc-aae02e345b5c', 'melissadavid', 'Melissa', 'David', 'melissa.david@staclara.com.ph', '', '9158132060', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('2c942c46-f4ba-4b1e-b26f-b2e4877a2999', 'ricoprecioso', 'Rico', 'Precioso', 'rico.precioso@staclara.com.ph', '', '9335090759', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('20224d72-86fd-4f36-b457-e421aba46b06', 'totodalanon', 'Toto', 'Dalanon', 'toto.dalanon.staclara@gmail.com', '', '', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('ee69d901-455f-4b5c-8dde-f8b1811233ab', 'karenbattung', 'Karen', 'Battung', 'karen.battung@staclara.com.ph', '', '', 'a5a28977-6956-45c1-a624-b9e90911502e');

INSERT INTO team_table (team_id, team_name, team_user_id) VALUES
('a5a28977-6956-45c1-a624-b9e90911502e', 'Sta Clara', '60874c99-8bd4-4e6c-bc2e-7b90a00878da');

INSERT INTO team_member_table (team_member_id, team_member_role, team_member_team_id, team_member_user_id) VALUES
('05078711-7d04-4364-b7d8-2962575ff43f', 'OWNER', 'a5a28977-6956-45c1-a624-b9e90911502e', '60874c99-8bd4-4e6c-bc2e-7b90a00878da'),
('8b81bc06-81cc-43c1-9286-6637c91f4520', 'APPROVER', 'a5a28977-6956-45c1-a624-b9e90911502e', '8f174be9-72fd-4b2d-851b-c31e1cbf9a37'),
('e3382256-c883-43b1-a489-a9764c6d2407', 'APPROVER', 'a5a28977-6956-45c1-a624-b9e90911502e', 'dde9b9cd-04fd-4dee-a4f7-2d0cac28c60b'),
('8d4df42b-a861-4b4d-8870-14aaf9f6b668', 'APPROVER', 'a5a28977-6956-45c1-a624-b9e90911502e', '16aeb09a-2bcc-445a-bf89-ad0e935b9ea2'),
('25b8b986-d4b6-4f63-89c1-93c7fbd1a0c9', 'APPROVER', 'a5a28977-6956-45c1-a624-b9e90911502e', '6311438e-ffdd-41b0-8523-d0fdea5cebca'),
('1482f41b-d69c-409b-88bb-c92b2836d9f9', 'APPROVER', 'a5a28977-6956-45c1-a624-b9e90911502e', '35549b69-8d0e-4a71-9268-7268941c809c'),
('a84c1d02-5d9f-4387-a0c0-a9438cc22fcd', 'APPROVER', 'a5a28977-6956-45c1-a624-b9e90911502e', '75481c37-3e40-49ad-bcbc-aae02e345b5c'),
('2824efad-505d-44f5-8ad6-26fb27c57788', 'APPROVER', 'a5a28977-6956-45c1-a624-b9e90911502e', '2c942c46-f4ba-4b1e-b26f-b2e4877a2999'),
('8a4dc14d-d11b-4335-ae7f-5d758ea95463', 'APPROVER', 'a5a28977-6956-45c1-a624-b9e90911502e', '20224d72-86fd-4f36-b457-e421aba46b06'),
('819d049f-7302-4c19-b104-11226b5023f0', 'APPROVER', 'a5a28977-6956-45c1-a624-b9e90911502e', 'ee69d901-455f-4b5c-8dde-f8b1811233ab');

INSERT INTO team_group_table (team_group_id, team_group_name, team_group_team_id) VALUES
('9f7de2eb-4073-43e6-b662-d688ccba4b26', 'REQUESTER', 'a5a28977-6956-45c1-a624-b9e90911502e'), -- Item
('51277fb9-7f1f-4c80-a122-c3fea3cf3ed7', 'PURCHASER', 'a5a28977-6956-45c1-a624-b9e90911502e'), -- Quotation
('72ef0fd8-72ef-487d-9b88-ee61ddc3f275', 'WAREHOUSE', 'a5a28977-6956-45c1-a624-b9e90911502e'); -- Sourced Item , Release Order , Transfer Receipt, Receiving Inspecting Report

INSERT INTO team_project_table (team_project_id, team_project_name, team_project_team_id, team_project_code) VALUES
('4b3a151a-a077-486c-9dfb-e996c2c9184c', 'PHILIP MORRIS', 'a5a28977-6956-45c1-a624-b9e90911502e', 'PM01'),
('bf4dc226-a763-49da-be9f-606202d2c4c9', 'SIGUIL HYDRO', 'a5a28977-6956-45c1-a624-b9e90911502e','SH01'),
('989dbcc2-fdfe-48c7-806a-98cf80e1bf42', 'LAKE MAINIT', 'a5a28977-6956-45c1-a624-b9e90911502e', 'LM01');

INSERT INTO team_group_member_table (team_member_id, team_group_id) VALUES
('05078711-7d04-4364-b7d8-2962575ff43f', '9f7de2eb-4073-43e6-b662-d688ccba4b26'),
('25b8b986-d4b6-4f63-89c1-93c7fbd1a0c9', '51277fb9-7f1f-4c80-a122-c3fea3cf3ed7'),
('2824efad-505d-44f5-8ad6-26fb27c57788', '72ef0fd8-72ef-487d-9b88-ee61ddc3f275');

INSERT INTO team_project_member_table (team_member_id, team_project_id) VALUES
('05078711-7d04-4364-b7d8-2962575ff43f', '4b3a151a-a077-486c-9dfb-e996c2c9184c'),
('8b81bc06-81cc-43c1-9286-6637c91f4520', 'bf4dc226-a763-49da-be9f-606202d2c4c9'),
('e3382256-c883-43b1-a489-a9764c6d2407', '989dbcc2-fdfe-48c7-806a-98cf80e1bf42'),
('8d4df42b-a861-4b4d-8870-14aaf9f6b668', '4b3a151a-a077-486c-9dfb-e996c2c9184c'),
('25b8b986-d4b6-4f63-89c1-93c7fbd1a0c9', 'bf4dc226-a763-49da-be9f-606202d2c4c9'),
('1482f41b-d69c-409b-88bb-c92b2836d9f9', '989dbcc2-fdfe-48c7-806a-98cf80e1bf42'),
('a84c1d02-5d9f-4387-a0c0-a9438cc22fcd', '4b3a151a-a077-486c-9dfb-e996c2c9184c'),
('2824efad-505d-44f5-8ad6-26fb27c57788', 'bf4dc226-a763-49da-be9f-606202d2c4c9'),
('8a4dc14d-d11b-4335-ae7f-5d758ea95463', '989dbcc2-fdfe-48c7-806a-98cf80e1bf42'),
('819d049f-7302-4c19-b104-11226b5023f0', '4b3a151a-a077-486c-9dfb-e996c2c9184c'),
('05078711-7d04-4364-b7d8-2962575ff43f', 'bf4dc226-a763-49da-be9f-606202d2c4c9'),
('8b81bc06-81cc-43c1-9286-6637c91f4520', '989dbcc2-fdfe-48c7-806a-98cf80e1bf42'),
('e3382256-c883-43b1-a489-a9764c6d2407', '4b3a151a-a077-486c-9dfb-e996c2c9184c'),
('8d4df42b-a861-4b4d-8870-14aaf9f6b668', 'bf4dc226-a763-49da-be9f-606202d2c4c9'),
('25b8b986-d4b6-4f63-89c1-93c7fbd1a0c9', '989dbcc2-fdfe-48c7-806a-98cf80e1bf42'),
('1482f41b-d69c-409b-88bb-c92b2836d9f9', '4b3a151a-a077-486c-9dfb-e996c2c9184c'),
('a84c1d02-5d9f-4387-a0c0-a9438cc22fcd', 'bf4dc226-a763-49da-be9f-606202d2c4c9'),
('2824efad-505d-44f5-8ad6-26fb27c57788', '989dbcc2-fdfe-48c7-806a-98cf80e1bf42'),
('8a4dc14d-d11b-4335-ae7f-5d758ea95463', '4b3a151a-a077-486c-9dfb-e996c2c9184c'),
('819d049f-7302-4c19-b104-11226b5023f0', 'bf4dc226-a763-49da-be9f-606202d2c4c9'),
('05078711-7d04-4364-b7d8-2962575ff43f', '989dbcc2-fdfe-48c7-806a-98cf80e1bf42'),
('8b81bc06-81cc-43c1-9286-6637c91f4520', '4b3a151a-a077-486c-9dfb-e996c2c9184c'),
('e3382256-c883-43b1-a489-a9764c6d2407', 'bf4dc226-a763-49da-be9f-606202d2c4c9'),
('8d4df42b-a861-4b4d-8870-14aaf9f6b668', '989dbcc2-fdfe-48c7-806a-98cf80e1bf42'),
('25b8b986-d4b6-4f63-89c1-93c7fbd1a0c9', '4b3a151a-a077-486c-9dfb-e996c2c9184c'),
('1482f41b-d69c-409b-88bb-c92b2836d9f9', 'bf4dc226-a763-49da-be9f-606202d2c4c9'),
('a84c1d02-5d9f-4387-a0c0-a9438cc22fcd', '989dbcc2-fdfe-48c7-806a-98cf80e1bf42'),
('2824efad-505d-44f5-8ad6-26fb27c57788', '4b3a151a-a077-486c-9dfb-e996c2c9184c'),
('8a4dc14d-d11b-4335-ae7f-5d758ea95463', 'bf4dc226-a763-49da-be9f-606202d2c4c9'),
('819d049f-7302-4c19-b104-11226b5023f0', '989dbcc2-fdfe-48c7-806a-98cf80e1bf42');

INSERT INTO form_table (form_id, form_name, form_description, form_app, form_team_member_id, form_is_formsly_form, form_is_hidden, form_is_for_every_member, form_is_disabled) VALUES
('d13b3b0f-14df-4277-b6c1-7c80f7e7a829', 'Item', 'formsly premade Item form', 'REQUEST', '05078711-7d04-4364-b7d8-2962575ff43f', true, false, false, false),
('e5062660-9026-4629-bc2c-633826fdaa24', 'Sourced Item', 'formsly premade Sourced Item form', 'REQUEST', '05078711-7d04-4364-b7d8-2962575ff43f', true, false, false, false),
('a732196f-9779-45e2-85fa-7320397e5b0a', 'Quotation', 'formsly premade Quotation form', 'REQUEST', '05078711-7d04-4364-b7d8-2962575ff43f', true, false, false, false),
('5782d70a-5f6b-486c-a77f-401066afd005', 'Receiving Inspecting Report', 'These items were not available during this Requsitions sourcing step.', 'REQUEST', '05078711-7d04-4364-b7d8-2962575ff43f', true, false, false, false),
('391c1b8c-db12-42ff-ad4a-4ea7680243d7', 'Release Order', 'These items were available during this Requsitions sourcing step.', 'REQUEST', '05078711-7d04-4364-b7d8-2962575ff43f', true, false, false, false),
('8e173d92-c346-4fb5-8ef2-490105e19263', 'Transfer Receipt', 'formsly premade Transfer Receipt form.', 'REQUEST', '05078711-7d04-4364-b7d8-2962575ff43f', true, false, false, false);

INSERT INTO section_table (section_id, section_name, section_order, section_is_duplicatable, section_form_id) VALUES
-- Item
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
-- Item 
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
('e01d6fc1-48c3-4abb-b605-841f73f83f9a', 'Item ID', 'LINK', 1, '65d2d36a-7e69-4044-9f74-157bc753bd59', true, true),

('bdaa7b68-8ca3-443c-999c-3adec9339709', 'Item', 'DROPDOWN', 2, '2e7e0b5f-cbf4-4340-af1a-18a16fd3a028', true, false),
('8c15e0f0-f360-4826-a684-5ab4ecb52009', 'Quantity', 'NUMBER', 3, '2e7e0b5f-cbf4-4340-af1a-18a16fd3a028', true, false),
('4982e986-865c-4574-9767-4951b4f6c155', 'Source Project', 'DROPDOWN', 4, '2e7e0b5f-cbf4-4340-af1a-18a16fd3a028', true, false),

-- Quotation 
('df0cb109-e34d-498f-ac51-af2139628ac0', 'Item ID', 'LINK', 1, '7d6649c2-316b-4895-86eb-120def2e2f33', true, true),

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
('1df80eb4-b171-4bbf-925c-ae09b7d09bad', 'Item ID', 'LINK', 1, 'b79c9a66-f112-4bfa-8d5c-88267be24fd8', true, true),
('9d69d6fe-8019-416b-b4e6-41ec71792cb4', 'Quotation ID', 'LINK', 2, 'b79c9a66-f112-4bfa-8d5c-88267be24fd8', true, true),
('18975198-02d3-49b4-af40-232c2c915ba7', 'DR', 'FILE', 3, '39831fe4-00f3-4b5e-b840-aae8f1469841', true, false),
('6317b506-816f-4ce4-a083-b9a94c900446', 'SI', 'FILE', 4, '39831fe4-00f3-4b5e-b840-aae8f1469841', false, false),
('6be1b3b0-8b9d-46fc-bb42-a068d47a76d8', 'QCIR', 'FILE', 5, '39831fe4-00f3-4b5e-b840-aae8f1469841', false, false),
('cf0af133-5e81-4665-aa44-6dd3d5e28b43', 'Item', 'DROPDOWN', 6, '00341355-1ece-47e6-88a2-060fbab8b11a', true, false),
('3ca0dbf6-800f-44e5-ba30-149dd5c211fc', 'Quantity', 'NUMBER', 7, '00341355-1ece-47e6-88a2-060fbab8b11a', true, false),
('d440c116-830b-4339-bcf8-ca49aba9c395', 'Receiving Status', 'TEXT', 8, '00341355-1ece-47e6-88a2-060fbab8b11a', true, true), 

-- Release Order 
('2075f549-bcbf-4719-ae44-ec38b2fab79f', 'Item ID', 'LINK', 1, '1416e947-3491-436f-9b20-f0cd705607d0', true, true),
('9fe04f40-a250-4a16-9e6a-b6c8a0b5a4c1', 'Sourced Item ID', 'LINK', 2, '1416e947-3491-436f-9b20-f0cd705607d0', true, true),
('3a8b66dc-2853-467a-a82b-72dd9bc29b40', 'Item', 'DROPDOWN', 3, '0d630b15-3c88-49e0-b588-1e60dd839bcb', true, false),
('4050bfbe-0cbe-443b-a4c7-3851dba2d7c8', 'Quantity', 'NUMBER', 4, '0d630b15-3c88-49e0-b588-1e60dd839bcb', true, false),
('d3d790fe-3d37-421c-91f3-e943ee5941b6', 'Receiving Status', 'TEXT', 5, '0d630b15-3c88-49e0-b588-1e60dd839bcb', true, true), 
('2ea7acb6-37a4-4ced-b5d2-b944c3a1de37', 'Source Project', 'TEXT', 6, '0d630b15-3c88-49e0-b588-1e60dd839bcb', true, true), 

-- Transfer Receipt 
('c336e79e-4a89-49f7-92c3-6de1dddc977b', 'Item ID', 'LINK', 1, '47b11674-d641-4680-834e-7fd48f43696b', true, true),
('0778f0ba-bb0f-4110-b19f-38d999d8e8f1', 'Sourced Item ID', 'LINK', 2, '47b11674-d641-4680-834e-7fd48f43696b', true, true),
('a4004713-7b1d-436f-a765-a8da3912f83f', 'Release Order ID', 'LINK', 3, '47b11674-d641-4680-834e-7fd48f43696b', true, true),
('b4e8eda9-a83b-4e56-8455-ab2e32db93f6', 'Transfer Shipment', 'FILE', 4, 'c3d7f001-32ce-4e44-8677-7d2dd16c45dd', true, false),
('75303e92-b8b0-4f6b-a92d-cda798c5639e', 'Transfer Receipt', 'FILE', 5, 'c3d7f001-32ce-4e44-8677-7d2dd16c45dd', true, false),
('490e3c51-d183-4752-88c4-c3f92ff7c15b', 'Item', 'DROPDOWN', 6, 'b2466824-9803-41a2-8abc-5d9f7045c73b', true, false),
('be528e76-6531-4cdd-9725-8aa858219d0d', 'Quantity', 'NUMBER', 7, 'b2466824-9803-41a2-8abc-5d9f7045c73b', true, false),
('054e73e1-601a-4764-b447-903b9b0c6e68', 'Receiving Status', 'TEXT', 8, 'b2466824-9803-41a2-8abc-5d9f7045c73b', true, true), 
('e0d9563f-463d-4f25-8c6e-46463841cd24', 'Source Project', 'TEXT', 9, 'b2466824-9803-41a2-8abc-5d9f7045c73b', true, true);

INSERT INTO option_table (option_id, option_value, option_order, option_field_id) VALUES
-- Item 
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

INSERT INTO signer_table (signer_id, signer_is_primary_signer, signer_action, signer_order, signer_form_id, signer_team_member_id) VALUES
('37067546-44b2-4bfa-a952-b0332e98298c', TRUE, 'Approved', 1, 'd13b3b0f-14df-4277-b6c1-7c80f7e7a829', '05078711-7d04-4364-b7d8-2962575ff43f'),
('b96ad041-2ad5-41be-9358-06d0a8524401', TRUE, 'Approved', 1, 'e5062660-9026-4629-bc2c-633826fdaa24', '8d4df42b-a861-4b4d-8870-14aaf9f6b668'),
('8321f613-6362-4d17-b9f2-f439ddd9a8a8', TRUE, 'Approved', 1, 'a732196f-9779-45e2-85fa-7320397e5b0a', 'a84c1d02-5d9f-4387-a0c0-a9438cc22fcd'),
('37f8b92c-9e9e-4e97-a6f4-f2f55a7f1a87', TRUE, 'Approved', 1, '5782d70a-5f6b-486c-a77f-401066afd005', '8d4df42b-a861-4b4d-8870-14aaf9f6b668'),
('2c4504a3-6b38-42bb-af23-d489967205e3', TRUE, 'Approved', 1, '391c1b8c-db12-42ff-ad4a-4ea7680243d7', '8d4df42b-a861-4b4d-8870-14aaf9f6b668'),
('eedfd28d-8004-4b43-a230-8dfa1b4d4977', TRUE, 'Approved', 1, '8e173d92-c346-4fb5-8ef2-490105e19263', '05078711-7d04-4364-b7d8-2962575ff43f');