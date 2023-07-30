INSERT INTO user_table (user_id, user_username, user_first_name, user_last_name, user_email, user_job_title, user_phone_number, user_active_team_id) VALUES
('beb2d52c-77d5-49a9-a175-637152c44424', 'johndoe', 'John', 'Doe', 'johndoe@gmail.com', 'Graphic Designer', '9586325781', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('dd689b20-8293-4b8a-b9c6-9a5cc63f659c', 'janedoe', 'Jane', 'Doe', 'janedoe@gmail.com', 'Sales Management', '9563268975', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('930de3a6-181d-449e-8890-0aa055947d80', 'loremipsum', 'Lorem', 'Ipsum', 'loremipsum@gmail.com', 'Software Engineer', '9571523487', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('eaf09887-9686-4faf-8a13-d51fba94eb39', 'dolorsit', 'Dolor', 'Sit', 'dolorsit@gmail.com', 'Data Entry Clerk', '9856325789', 'a5a28977-6956-45c1-a624-b9e90911502e');

INSERT INTO team_table (team_id, team_name, team_user_id, team_group_list, team_project_list) VALUES
('a5a28977-6956-45c1-a624-b9e90911502e', 'Sta Clara', 'beb2d52c-77d5-49a9-a175-637152c44424', ARRAY['Warehouse Processor', 'Accounting Processor','Warehouse Receiver', 'Treasury Processor', 'Audit Processor'], ARRAY['Philip Morris', 'Siguil Hydro', 'Lake Mainit', 'Meralco HDD']),
('285cf257-07fb-40bb-befe-aecff5eb0ea6', 'Dodeca', 'beb2d52c-77d5-49a9-a175-637152c44424', ARRAY[]::VARCHAR[], ARRAY[]::VARCHAR[]),
('7d653b33-d60f-4d39-a559-c56711eeb44c', 'Developers', 'beb2d52c-77d5-49a9-a175-637152c44424', ARRAY[]::VARCHAR[], ARRAY[]::VARCHAR[]);

INSERT INTO team_member_table (team_member_id, team_member_role, team_member_team_id, team_member_user_id, team_member_group_list, team_member_project_list) VALUES
('eb4d3419-b70f-44ba-b88f-c3d983cbcf3b', 'OWNER', 'a5a28977-6956-45c1-a624-b9e90911502e', 'beb2d52c-77d5-49a9-a175-637152c44424', ARRAY['Warehouse Processor', 'Accounting Processor','Warehouse Receiver', 'Treasury Processor', 'Audit Processor'], ARRAY['Philip Morris', 'Siguil Hydro', 'Lake Mainit', 'Meralco HDD']),
('d9c6c738-8a60-43de-965f-f1f666da1639', 'ADMIN', 'a5a28977-6956-45c1-a624-b9e90911502e', 'dd689b20-8293-4b8a-b9c6-9a5cc63f659c', ARRAY['Warehouse Processor', 'Accounting Processor','Warehouse Receiver', 'Treasury Processor', 'Audit Processor'], ARRAY['Philip Morris', 'Siguil Hydro', 'Lake Mainit', 'Meralco HDD']),
('1e9bb9c7-e4e6-42e4-9377-a33f9b645343', 'ADMIN', 'a5a28977-6956-45c1-a624-b9e90911502e', '930de3a6-181d-449e-8890-0aa055947d80', ARRAY['Warehouse Processor', 'Accounting Processor','Warehouse Receiver', 'Treasury Processor', 'Audit Processor'], ARRAY['Philip Morris', 'Siguil Hydro', 'Lake Mainit', 'Meralco HDD']),
('390dbc5f-c3ba-4f86-81ca-7cc9746b6e31', 'MEMBER', 'a5a28977-6956-45c1-a624-b9e90911502e', 'eaf09887-9686-4faf-8a13-d51fba94eb39', ARRAY[]::VARCHAR[], ARRAY[]::VARCHAR[]),
('cb06905e-e64b-4bfe-9f03-ee36dba0c809', 'OWNER', '285cf257-07fb-40bb-befe-aecff5eb0ea6', 'beb2d52c-77d5-49a9-a175-637152c44424', ARRAY[]::VARCHAR[], ARRAY[]::VARCHAR[]),
('a77b9169-705a-4e3c-a3f3-fef15f18423f', 'OWNER', '7d653b33-d60f-4d39-a559-c56711eeb44c', 'beb2d52c-77d5-49a9-a175-637152c44424', ARRAY[]::VARCHAR[], ARRAY[]::VARCHAR[]);

INSERT INTO form_table (form_id, form_name, form_description, form_app, form_team_member_id, form_is_formsly_form, form_is_hidden, form_is_for_every_member, form_group, form_is_disabled) VALUES
('b8408545-4354-47d0-a648-928c6755a94b', 'All Fields', 'test all types of fields', 'REQUEST', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b', false, false, true, ARRAY[]::VARCHAR[], false),
('337658f1-0777-45f2-853f-b6f20551712e', 'Duplicatable Sections', 'test field duplicatable sections', 'REQUEST', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b', false, false, true, ARRAY[]::VARCHAR[], false),
('d13b3b0f-14df-4277-b6c1-7c80f7e7a829', 'Order to Purchase', 'formsly premade Order to Purchase form', 'REQUEST', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b', true, false, false, ARRAY['Warehouse Processor'], false),
('e5062660-9026-4629-bc2c-633826fdaa24', 'Sourced Order to Purchase', 'formsly premade Sourced Order to Purchase form', 'REQUEST', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b', true, true, false, ARRAY['Warehouse Processor'], true),
('a732196f-9779-45e2-85fa-7320397e5b0a', 'Quotation', 'formsly premade Quotation form', 'REQUEST', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b', true, true, false, ARRAY['Accounting Processor'], false),
('5782d70a-5f6b-486c-a77f-401066afd005', 'Receiving Inspecting Report (Purchased)', 'These items were not available during this OTPs sourcing step.', 'REQUEST', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b', true, true, false, ARRAY['Warehouse Receiver'], false),
('391c1b8c-db12-42ff-ad4a-4ea7680243d7', 'Receiving Inspecting Report (Sourced)', 'These items were available during this OTPs sourcing step.', 'REQUEST', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b', true, true, false, ARRAY['Warehouse Receiver'], false),
('913a09d8-88f9-4139-a039-a77394405b62', 'Cheque Reference', 'formsly premade Cheque Reference form', 'REQUEST', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b', true, true, false, ARRAY['Treasury Processor'], false),
('d2e3e618-7f9b-4439-8f76-72a05a0bf305', 'Audit', 'formsly premade Audit form', 'REQUEST', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b', true, false, false, ARRAY['Audit Processor'], false);

INSERT INTO section_table (section_id, section_name, section_order, section_is_duplicatable, section_form_id) VALUES
('80017528-ddb2-419d-92be-cdfa867b8f42', 'All fields Section 1', 1, false, 'b8408545-4354-47d0-a648-928c6755a94b'),
('2bba9d85-90ed-4cec-a97a-159e482f4f65', 'All fields Section 2', 2, false, 'b8408545-4354-47d0-a648-928c6755a94b'),
('e36be46d-4eec-4d5a-bb71-fd2d539c599e', 'All fields Section 3', 3, false, 'b8408545-4354-47d0-a648-928c6755a94b'),
('5da6140a-bec6-4afa-aeec-2fcb84c17669', 'Duplicatable Section 1', 1, true, '337658f1-0777-45f2-853f-b6f20551712e'),
('8ef2c6a0-797d-4e36-8246-cfa0f783afb5', 'Normal Section 2', 2, false, '337658f1-0777-45f2-853f-b6f20551712e'),
('d8465119-a0ef-43e8-9feb-0373b7d46b29', 'Duplicatable Section 3', 3, true, '337658f1-0777-45f2-853f-b6f20551712e'),

-- Order to Purchase
('333cd418-69d1-459b-82e4-cc67c34c2b8b', 'ID', 1, false, 'd13b3b0f-14df-4277-b6c1-7c80f7e7a829'),
('ee34bb67-fffa-4690-aaf2-7ae371b21e88', 'Main', 2, false, 'd13b3b0f-14df-4277-b6c1-7c80f7e7a829'),
('0672ef7d-849d-4bc7-81b1-7a5eefcc1451', 'Item', 3, true, 'd13b3b0f-14df-4277-b6c1-7c80f7e7a829'),

-- Sourced Order to Purchase
('2e7e0b5f-cbf4-4340-af1a-18a16fd3a028', 'Item', 1, true, 'e5062660-9026-4629-bc2c-633826fdaa24'),

-- Quotation
('7d6649c2-316b-4895-86eb-120def2e2f33', 'ID', 1, false, 'a732196f-9779-45e2-85fa-7320397e5b0a'),
('991d9830-ae1b-4c14-bdba-6167b64f50f7', 'Main', 2, false, 'a732196f-9779-45e2-85fa-7320397e5b0a'),
('cd7b6204-1e87-4c5b-9ce3-3d8ca5c201fb', 'Additional Charges', 3, false, 'a732196f-9779-45e2-85fa-7320397e5b0a'),
('ee8a3bc7-4253-44f7-bd7c-53b0e8871601', 'Item', 4, true, 'a732196f-9779-45e2-85fa-7320397e5b0a'),

-- Receiving Inspecting Report (Purchased)
('b79c9a66-f112-4bfa-8d5c-88267be24fd8', 'ID', 1, false, '5782d70a-5f6b-486c-a77f-401066afd005'),
('39831fe4-00f3-4b5e-b840-aae8f1469841', 'Quality Check', 2, false, '5782d70a-5f6b-486c-a77f-401066afd005'),
('00341355-1ece-47e6-88a2-060fbab8b11a', 'Item', 3, true, '5782d70a-5f6b-486c-a77f-401066afd005'),

-- Receiving Inspecting Report (Sourced)
('1416e947-3491-436f-9b20-f0cd705607d0', 'ID', 1, false, '391c1b8c-db12-42ff-ad4a-4ea7680243d7'),
('dacb6338-8839-4f66-ae70-2f1d3175e169', 'Quality Check', 2, false, '391c1b8c-db12-42ff-ad4a-4ea7680243d7'),
('0d630b15-3c88-49e0-b588-1e60dd839bcb', 'Item', 3, true, '391c1b8c-db12-42ff-ad4a-4ea7680243d7'),

-- Cheque Reference
('5e9cf483-98dd-4b44-820d-4c020ae50279', 'ID', 1, false, '913a09d8-88f9-4139-a039-a77394405b62'),
('2217dcb5-0604-4455-b15a-6beb4ee4fa9f', 'Treasury', 2, false, '913a09d8-88f9-4139-a039-a77394405b62'),
('5ec2a535-7855-48dd-ab14-318a5344409d', 'Cheque', 3, false, '913a09d8-88f9-4139-a039-a77394405b62'),

-- Audit
('8efd8c64-d1e7-45d4-a761-631db06d9a08', 'Main', 1, false, 'd2e3e618-7f9b-4439-8f76-72a05a0bf305');

INSERT INTO field_table (field_id, field_name, field_type, field_order, field_section_id, field_is_required, field_is_read_only) VALUES
-- All Fields Form
('9696114b-9884-4ecf-8000-ab30ecde85aa', 'Text field', 'TEXT', 1, '80017528-ddb2-419d-92be-cdfa867b8f42', false, false),
('04141446-2b59-4d57-a81f-1bcbb5f4d4fd', 'Text area field', 'TEXTAREA', 2, '80017528-ddb2-419d-92be-cdfa867b8f42', false, false),
('34568491-4c73-4511-8a3e-babc6a54fdde', 'Number field', 'NUMBER', 3, '80017528-ddb2-419d-92be-cdfa867b8f42', false, false),
('f8ad5957-ed6d-48a9-858e-67127599be43', 'Switch field', 'SWITCH', 4, '2bba9d85-90ed-4cec-a97a-159e482f4f65', false, false),
('f6caa6e5-f2f5-4444-b96f-eec55dea2794', 'Dropdown field', 'DROPDOWN', 5, '2bba9d85-90ed-4cec-a97a-159e482f4f65', false, false),
('297e382a-34ad-4301-9017-4d8f5eaf9728', 'Multiselect field', 'MULTISELECT', 6, '2bba9d85-90ed-4cec-a97a-159e482f4f65', false, false),
('2d2b787e-4398-4be2-b5b1-b47d78e2db81', 'Date field', 'DATE', 7, 'e36be46d-4eec-4d5a-bb71-fd2d539c599e', false, false),
('a217e383-7bb1-4f95-a145-6d37145a4477', 'Time field', 'TIME', 8, 'e36be46d-4eec-4d5a-bb71-fd2d539c599e', false, false),
('dfa66f26-0891-4ce4-a91a-93f7e55eda93', 'File field', 'FILE', 9, 'e36be46d-4eec-4d5a-bb71-fd2d539c599e', false, false),
-- ('1b4c7148-faaa-46cd-b361-806e670058e7', 'Slider field', 'SLIDER', 9, 'e36be46d-4eec-4d5a-bb71-fd2d539c599e', false, false),

-- Duplicatable Section Form
('253f311c-aca6-401d-be77-696aa67a59d5', 'Text field', 'TEXT', 1, '5da6140a-bec6-4afa-aeec-2fcb84c17669', false, false),
('570a2b3f-bfb8-490e-a7bb-a8d0e4b512eb', 'Number field', 'NUMBER', 2, '5da6140a-bec6-4afa-aeec-2fcb84c17669', false, false),
('b925b45f-1d3e-4bbc-963b-80c5184702fb', 'Switch field', 'SWITCH', 3, '5da6140a-bec6-4afa-aeec-2fcb84c17669', false, false),
('f36180e1-ac98-4d56-ba7d-8eef9a71e0d8', 'Dropdown field', 'DROPDOWN', 4, '5da6140a-bec6-4afa-aeec-2fcb84c17669', false, false),

('d22f6df6-1845-4368-9e1b-7cd22fed7a1e', 'Text field', 'TEXT', 5, '8ef2c6a0-797d-4e36-8246-cfa0f783afb5', false, false),
('7c53aa9f-ec53-45f1-ba95-0556b07a71ba', 'Dropdown field', 'DROPDOWN', 6, '8ef2c6a0-797d-4e36-8246-cfa0f783afb5', false, false),
('3ecfcb90-7fdd-4521-82a3-4fb7daab44c0', 'Date field', 'DATE', 7, '8ef2c6a0-797d-4e36-8246-cfa0f783afb5', false, false),

('5ef54cb5-f694-4f4e-aee5-ec228dec1da4', 'Multiselect field', 'MULTISELECT', 8, 'd8465119-a0ef-43e8-9feb-0373b7d46b29', false, false),
('1f9366fb-b89b-4d41-9a0e-e0264c422f17', 'Date field', 'DATE', 9, 'd8465119-a0ef-43e8-9feb-0373b7d46b29', false, false),
('0b4a3e53-629a-49d8-80e6-bfe1f31c0510', 'Time field', 'TIME', 10, 'd8465119-a0ef-43e8-9feb-0373b7d46b29', false, false),
-- ('5ed0f5c1-a97d-465b-ade4-758a5ae351a2', 'Slider field', 'SLIDER', 11, 'd8465119-a0ef-43e8-9feb-0373b7d46b29', false, false),

-- Order to Purchase Form
('eb04956c-4164-4ca6-90ee-5081783884a1', 'Parent OTP ID', 'LINK', 1, '333cd418-69d1-459b-82e4-cc67c34c2b8b', true, true),

('51b6da24-3e28-49c4-9e19-5988b9ad3909', 'Project Name', 'DROPDOWN', 2, 'ee34bb67-fffa-4690-aaf2-7ae371b21e88', true, false),
('6882287e-57c7-42ae-a672-b0d6c8979b01', 'Type', 'DROPDOWN', 3, 'ee34bb67-fffa-4690-aaf2-7ae371b21e88', true, false),
('46dc154d-1c35-4a3c-9809-698b56d17faa', 'Date Needed', 'DATE', 4, 'ee34bb67-fffa-4690-aaf2-7ae371b21e88', true, false),

('b2c899e8-4ac7-4019-819e-d6ebcae71f41', 'General Name', 'DROPDOWN', 5, '0672ef7d-849d-4bc7-81b1-7a5eefcc1451', true, false),
('c3efa89d-8297-4920-8c3e-d9dee61fdf13', 'Unit of Measurement', 'TEXT', 6, '0672ef7d-849d-4bc7-81b1-7a5eefcc1451', true, true),
('d78145e8-ba83-4fa8-907f-db66fd3cae0d', 'Quantity', 'NUMBER', 7, '0672ef7d-849d-4bc7-81b1-7a5eefcc1451', true, false),
('d00f3562-d778-469d-b058-15e29e68b1ea', 'Cost Code', 'TEXT', 8, '0672ef7d-849d-4bc7-81b1-7a5eefcc1451', true, true),
('440d9a37-656a-4237-be3b-c434f512eaa9', 'GL Account', 'TEXT', 9, '0672ef7d-849d-4bc7-81b1-7a5eefcc1451', true, true),

-- Sourced Order to Purchase Form
('bdaa7b68-8ca3-443c-999c-3adec9339709', 'Item', 'DROPDOWN', 1, '2e7e0b5f-cbf4-4340-af1a-18a16fd3a028', true, false),
('8c15e0f0-f360-4826-a684-5ab4ecb52009', 'Quantity', 'NUMBER', 2, '2e7e0b5f-cbf4-4340-af1a-18a16fd3a028', true, false),

-- Quotation Form
('df0cb109-e34d-498f-ac51-af2139628ac0', 'Order to Purchase ID', 'LINK', 1, '7d6649c2-316b-4895-86eb-120def2e2f33', true, true),
('2a43aedd-017c-4675-ad4c-00debbac7050', 'Supplier', 'DROPDOWN', 2, '991d9830-ae1b-4c14-bdba-6167b64f50f7', true, false),
('39ea4ce9-7c78-4470-b3ff-cfd13429d6c5', 'Supplier Quotation', 'FILE', 3, '991d9830-ae1b-4c14-bdba-6167b64f50f7', true, false),
('039f5c31-6e9c-42ae-aa27-21c0cba12560', 'Request Send Method', 'DROPDOWN', 4, '991d9830-ae1b-4c14-bdba-6167b64f50f7', false, false),
('4c201ab9-92d9-47dd-a661-a7bb2c4e3923', 'Proof of Sending', 'FILE', 5, '991d9830-ae1b-4c14-bdba-6167b64f50f7', false, false),
('90e7959a-12a4-44f7-8b45-225a40b681f6', 'Delivery Fee', 'NUMBER', 6, 'cd7b6204-1e87-4c5b-9ce3-3d8ca5c201fb', false, false),
('7a46ec08-b38d-424a-94ef-f9de5df5e6c2', 'Bank Charge', 'NUMBER', 7, 'cd7b6204-1e87-4c5b-9ce3-3d8ca5c201fb', false, false),
('70133386-277b-4c4a-9260-3fe769bf12d2', 'Mobilization Charge', 'NUMBER', 8, 'cd7b6204-1e87-4c5b-9ce3-3d8ca5c201fb', false, false),
('8b4389b7-328f-47dc-974b-485c17475be3', 'Demobilization Charge', 'NUMBER', 9, 'cd7b6204-1e87-4c5b-9ce3-3d8ca5c201fb', false, false),
('69887d56-f813-4570-9230-c3e98c808b0d', 'Freight Charge', 'NUMBER', 10, 'cd7b6204-1e87-4c5b-9ce3-3d8ca5c201fb', false, false),
('cabe5c9a-79c4-42bd-ab4e-01ef8f200251', 'Hauling Charge', 'NUMBER', 11, 'cd7b6204-1e87-4c5b-9ce3-3d8ca5c201fb', false, false),
('c7ac30a2-39bf-427d-aa94-cf24827cb3e2', 'Handling Charge', 'NUMBER', 12, 'cd7b6204-1e87-4c5b-9ce3-3d8ca5c201fb', false, false),
('08e43351-79ec-4967-9aed-9909ee44495d', 'Packing Charge', 'NUMBER', 13, 'cd7b6204-1e87-4c5b-9ce3-3d8ca5c201fb', false, false),
('ba52fb74-5663-41f9-a72b-5dbe0244f317', 'Item', 'DROPDOWN', 14, 'ee8a3bc7-4253-44f7-bd7c-53b0e8871601', true, false),
('273a1161-2a86-4b96-a024-94cf4f6f4cdf', 'Price per Unit', 'NUMBER', 15, 'ee8a3bc7-4253-44f7-bd7c-53b0e8871601', true, false),
('5dfbc04b-6f2d-4b55-818c-8f7031cdcdc2', 'Quantity', 'NUMBER', 16, 'ee8a3bc7-4253-44f7-bd7c-53b0e8871601', true, false),

-- Receiving Inspecting Report (Purchased) Form
('1df80eb4-b171-4bbf-925c-ae09b7d09bad', 'Order to Purchase ID', 'LINK', 1, 'b79c9a66-f112-4bfa-8d5c-88267be24fd8', true, true),
('9d69d6fe-8019-416b-b4e6-41ec71792cb4', 'Quotation ID', 'LINK', 2, 'b79c9a66-f112-4bfa-8d5c-88267be24fd8', true, true),
('18975198-02d3-49b4-af40-232c2c915ba7', 'DR', 'FILE', 3, '39831fe4-00f3-4b5e-b840-aae8f1469841', false, false),
('6317b506-816f-4ce4-a083-b9a94c900446', 'SI', 'FILE', 4, '39831fe4-00f3-4b5e-b840-aae8f1469841', false, false),
('cf0af133-5e81-4665-aa44-6dd3d5e28b43', 'Item', 'DROPDOWN', 5, '00341355-1ece-47e6-88a2-060fbab8b11a', true, false),
('3ca0dbf6-800f-44e5-ba30-149dd5c211fc', 'Quantity', 'NUMBER', 6, '00341355-1ece-47e6-88a2-060fbab8b11a', true, false),
('d440c116-830b-4339-bcf8-ca49aba9c395', 'Receiving Status', 'TEXT', 7, '00341355-1ece-47e6-88a2-060fbab8b11a', true, true), 

-- Receiving Inspecting Report (Sourced) Form
('2075f549-bcbf-4719-ae44-ec38b2fab79f', 'Order to Purchase ID', 'LINK', 1, '1416e947-3491-436f-9b20-f0cd705607d0', true, true),
('92cfe1b7-cce0-4632-83d6-8a03bd9a75f5', 'DR', 'FILE', 2, 'dacb6338-8839-4f66-ae70-2f1d3175e169', false, false),
('a5bd44e8-1fcf-4df0-a836-37e33b1b534a', 'SI', 'FILE', 3, 'dacb6338-8839-4f66-ae70-2f1d3175e169', false, false),
('3a8b66dc-2853-467a-a82b-72dd9bc29b40', 'Item', 'DROPDOWN', 4, '0d630b15-3c88-49e0-b588-1e60dd839bcb', true, false),
('4050bfbe-0cbe-443b-a4c7-3851dba2d7c8', 'Quantity', 'NUMBER', 5, '0d630b15-3c88-49e0-b588-1e60dd839bcb', true, false),
('d3d790fe-3d37-421c-91f3-e943ee5941b6', 'Receiving Status', 'TEXT', 6, '0d630b15-3c88-49e0-b588-1e60dd839bcb', true, true), 

-- Cheque Reference Form
('618770e4-40d1-4d8d-b5a0-189eca838ac7', 'Order to Purchase ID', 'LINK', 1, '5e9cf483-98dd-4b44-820d-4c020ae50279', true, true),
('8d245864-66be-46b7-8944-cef61c86a1ce', 'Treasury Status', 'DROPDOWN', 2, '2217dcb5-0604-4455-b15a-6beb4ee4fa9f', true, false),
('80054b56-d390-45ed-a3c5-2ae63489721b', 'Cheque Cancelled', 'SWITCH', 3, '5ec2a535-7855-48dd-ab14-318a5344409d', false, false),
('6def6dcb-c1a9-4597-93ac-0287b4005618', 'Cheque Printed Date', 'DATE', 4, '5ec2a535-7855-48dd-ab14-318a5344409d', true, false),
('c43f2688-30ac-407b-9366-f8820c34467e', 'Cheque Clearing Date', 'DATE', 5, '5ec2a535-7855-48dd-ab14-318a5344409d', true, false),
('9909f38c-cef9-4773-955b-7bc33700b747', 'Cheque First Signatory Name', 'TEXT', 6, '5ec2a535-7855-48dd-ab14-318a5344409d', true, false),
('1c286b86-01a5-4530-9285-3125bfd2cc55', 'Cheque First Date Signed', 'DATE', 7, '5ec2a535-7855-48dd-ab14-318a5344409d', true, false),
('230a92cf-80cf-4732-a66b-be5312a7b431', 'Cheque Second Signatory Name', 'TEXT', 8, '5ec2a535-7855-48dd-ab14-318a5344409d', true, false),
('4aa09972-2e53-4933-8dcb-f0ac92ec6063', 'Cheque Second Date Signed', 'DATE', 9, '5ec2a535-7855-48dd-ab14-318a5344409d', true, false),

-- Audit Form
('01ce24b8-780b-46af-8b15-864da9c20528', 'SSOT PO Prioritization Row Check', 'DROPDOWN', 1, '8efd8c64-d1e7-45d4-a761-631db06d9a08', true, false),
('5fde63d6-b583-49f2-881c-669d405f734c', 'Audit Remarks', 'TEXTAREA', 2, '8efd8c64-d1e7-45d4-a761-631db06d9a08', false, false),
('fd7cc81e-b93a-4bdf-bddf-0975f05aeda6', 'Date Audit Work Complete', 'DATE', 3, '8efd8c64-d1e7-45d4-a761-631db06d9a08', true, false);

INSERT INTO option_table (option_id, option_value, option_order, option_field_id) VALUES
('7961d4d4-6c04-46e7-b995-472856fff590', 'Dropdown 1', 1, 'f6caa6e5-f2f5-4444-b96f-eec55dea2794'),
('e80290da-9bc0-4aae-adb3-b15b321a8ad1', 'Dropdown 2', 2, 'f6caa6e5-f2f5-4444-b96f-eec55dea2794'),
('a9959120-e6ce-4b8b-998e-ec9e4a32b791', 'Dropdown 3', 3, 'f6caa6e5-f2f5-4444-b96f-eec55dea2794'),
('ee7597d6-472d-4a97-9661-3c509a571deb', 'Multiselect 1', 1, '297e382a-34ad-4301-9017-4d8f5eaf9728'),
('8addcf84-c1d7-44b6-8937-1fcca31a18e1', 'Multiselect 2', 2, '297e382a-34ad-4301-9017-4d8f5eaf9728'),
('6e573ba8-8e21-4965-b269-3bcba2d11bb8', 'Multiselect 3', 3, '297e382a-34ad-4301-9017-4d8f5eaf9728'),
-- ('8576731c-144d-4e52-9878-6d773d2e9fb3', '[1,5]', 1, '1b4c7148-faaa-46cd-b361-806e670058e7'),
('bc487823-89f8-4038-b3eb-d90f4b43fbf9', 'Dropdown 1', 1, 'f36180e1-ac98-4d56-ba7d-8eef9a71e0d8'),
('7d86cfc1-21c2-4b52-8ba5-accc058c9aac', 'Dropdown 2', 2, 'f36180e1-ac98-4d56-ba7d-8eef9a71e0d8'),
('6114629a-b334-4fb4-99e6-18905aa80cad', 'Dropdown 3', 3, 'f36180e1-ac98-4d56-ba7d-8eef9a71e0d8'),
('db59d039-b548-444b-817c-66258fe61813', 'Dropdown 1', 1, '7c53aa9f-ec53-45f1-ba95-0556b07a71ba'),
('42f6a134-097e-4f6a-8072-2352bb2071ef', 'Dropdown 2', 2, '7c53aa9f-ec53-45f1-ba95-0556b07a71ba'),
('0af76533-83d1-460c-bf02-f2b5523cdd22', 'Dropdown 3', 3, '7c53aa9f-ec53-45f1-ba95-0556b07a71ba'),
('763721ed-2c20-4e87-a7f1-bfd1eaa848e0', 'Multiselect 1', 1, '5ef54cb5-f694-4f4e-aee5-ec228dec1da4'),
('c6d92f18-f06d-4f8c-ae89-3cef183b42e9', 'Multiselect 2', 2, '5ef54cb5-f694-4f4e-aee5-ec228dec1da4'),
('52da4c49-c855-4130-bb6f-c70f47bf21e4', 'Multiselect 3', 3, '5ef54cb5-f694-4f4e-aee5-ec228dec1da4'),
-- ('bab0a354-4a06-4bb2-a8a2-dcdbb7f68fde', '[1,10]', 1, '5ed0f5c1-a97d-465b-ade4-758a5ae351a2');

-- Order to Purchase Form
('f97eb24f-53b2-452b-966e-9a2f1dfd812d', 'Cash Purchase - Advance Payment', 1, '6882287e-57c7-42ae-a672-b0d6c8979b01'),
('6ce7fa3a-9e85-4ab1-9f3b-de931071fa26', 'Cash Purchase - Local Purchase', 2, '6882287e-57c7-42ae-a672-b0d6c8979b01'),
('a73672df-03ea-4bc8-b904-366044819188', 'Order to Purchase', 3, '6882287e-57c7-42ae-a672-b0d6c8979b01'),

-- Quotation Form
('345214ae-9523-4f81-b3c1-d118f7735999', 'Email', 1, '039f5c31-6e9c-42ae-aa27-21c0cba12560'),
('3b8437da-7135-4fc5-ae4f-d9e294f096ab', 'Text', 2, '039f5c31-6e9c-42ae-aa27-21c0cba12560'),
('5ca3971c-ab0b-46e0-ad0b-cc48719360d4', 'Other', 3, '039f5c31-6e9c-42ae-aa27-21c0cba12560'),

-- Cheque Reference Form
('dff5176c-2e56-43a2-bbad-51d5d300a6f1', 'No Cheque', 1, '8d245864-66be-46b7-8944-cef61c86a1ce'),
('ff91134e-058c-4e26-8fba-f656e25aaa69', 'Ready for Pickup', 2, '8d245864-66be-46b7-8944-cef61c86a1ce'),
('0709f847-305b-4ed2-85cb-2ad73967e36f', 'Paid', 3, '8d245864-66be-46b7-8944-cef61c86a1ce'),

-- Audit Form
('c252a774-c364-4a37-8563-42467ff17a9f', 'Pass', 1, '01ce24b8-780b-46af-8b15-864da9c20528'),
('762aace6-aa47-4ece-a6a3-dc251ded05fd', 'Fail', 2, '01ce24b8-780b-46af-8b15-864da9c20528');

INSERT INTO signer_table (signer_id, signer_is_primary_signer, signer_action, signer_order, signer_form_id, signer_team_member_id) VALUES
('dd0149ad-9a49-4480-b7fa-62b55df3134e', TRUE, 'Approved', 1, 'b8408545-4354-47d0-a648-928c6755a94b', 'd9c6c738-8a60-43de-965f-f1f666da1639'),
('b7115738-8089-4e68-ac94-76ce6d0452f5', TRUE, 'Approved', 1, '337658f1-0777-45f2-853f-b6f20551712e', 'd9c6c738-8a60-43de-965f-f1f666da1639'),
('7d0781fe-eb57-4225-858d-abb6b93357c7', FALSE, 'Noted', 2, '337658f1-0777-45f2-853f-b6f20551712e', '1e9bb9c7-e4e6-42e4-9377-a33f9b645343'),
('37067546-44b2-4bfa-a952-b0332e98298c', TRUE, 'Approved', 1, 'd13b3b0f-14df-4277-b6c1-7c80f7e7a829', 'd9c6c738-8a60-43de-965f-f1f666da1639'),
('b96ad041-2ad5-41be-9358-06d0a8524401', TRUE, 'Approved', 1, 'e5062660-9026-4629-bc2c-633826fdaa24', 'd9c6c738-8a60-43de-965f-f1f666da1639'),
('8321f613-6362-4d17-b9f2-f439ddd9a8a8', TRUE, 'Approved', 1, 'a732196f-9779-45e2-85fa-7320397e5b0a', 'd9c6c738-8a60-43de-965f-f1f666da1639'),
('37f8b92c-9e9e-4e97-a6f4-f2f55a7f1a87', TRUE, 'Approved', 1, '5782d70a-5f6b-486c-a77f-401066afd005', 'd9c6c738-8a60-43de-965f-f1f666da1639'),
('2c4504a3-6b38-42bb-af23-d489967205e3', TRUE, 'Approved', 1, '391c1b8c-db12-42ff-ad4a-4ea7680243d7', 'd9c6c738-8a60-43de-965f-f1f666da1639'),
('72eb38d7-2933-4bda-99ad-a51e1ba62b71', TRUE, 'Approved', 1, '913a09d8-88f9-4139-a039-a77394405b62', 'd9c6c738-8a60-43de-965f-f1f666da1639'),
('a8a254ee-7294-48b1-9c14-252875d08330', TRUE, 'Approved', 1, 'd2e3e618-7f9b-4439-8f76-72a05a0bf305', 'd9c6c738-8a60-43de-965f-f1f666da1639');

INSERT INTO request_table (request_id, request_team_member_id, request_form_id) VALUES
('45820673-8b88-4d15-a4bf-12d67f140929', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b', 'b8408545-4354-47d0-a648-928c6755a94b'),
('280504f9-9739-45b2-a70d-484be2289861', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b', 'b8408545-4354-47d0-a648-928c6755a94b'),
('a9315409-9719-40cb-ada2-3f3ee622049b', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b', 'b8408545-4354-47d0-a648-928c6755a94b'),
('6d52c8df-1ed6-41cd-920a-827e3eba0abf', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b', '337658f1-0777-45f2-853f-b6f20551712e');

INSERT INTO comment_table (comment_id, comment_content, comment_type, comment_team_member_id, comment_request_id) VALUES
('e5d6d43c-cd56-42d2-874f-2cf327a260fd', 'Request 1 Comment 1', 'REQUEST_COMMENT', 'd9c6c738-8a60-43de-965f-f1f666da1639', '45820673-8b88-4d15-a4bf-12d67f140929'),
('62764682-7975-437c-b93c-22b38b2c2ea6', 'Request 1 Comment 2', 'REQUEST_COMMENT', '1e9bb9c7-e4e6-42e4-9377-a33f9b645343', '45820673-8b88-4d15-a4bf-12d67f140929'),
('666b0045-ed3f-453c-b32d-2871143f2430', 'Request 1 Comment 3', 'REQUEST_COMMENT', '390dbc5f-c3ba-4f86-81ca-7cc9746b6e31', '45820673-8b88-4d15-a4bf-12d67f140929'),
('9a30141f-eb3f-4896-8110-a08ab0fcd6bc', 'Request 2 Comment 1', 'REQUEST_COMMENT', 'd9c6c738-8a60-43de-965f-f1f666da1639', '280504f9-9739-45b2-a70d-484be2289861'),
('76ae08e1-0905-4ff7-8d9a-ef03e3ecedab', 'Request 2 Comment 2', 'REQUEST_COMMENT', '1e9bb9c7-e4e6-42e4-9377-a33f9b645343', '280504f9-9739-45b2-a70d-484be2289861'),
('4de364ae-ac61-43e0-822e-dd6bbf9a0946', 'Request 3 Comment 1', 'REQUEST_COMMENT', '390dbc5f-c3ba-4f86-81ca-7cc9746b6e31', 'a9315409-9719-40cb-ada2-3f3ee622049b'),
('6d200a8a-eb47-4ac6-a0b4-ff5d7135d161', 'Request 4 Comment 1', 'REQUEST_COMMENT', 'd9c6c738-8a60-43de-965f-f1f666da1639', '6d52c8df-1ed6-41cd-920a-827e3eba0abf'),
('792e9f15-a8cb-4299-bf8a-7d07bc3a86a4', 'Request 4 Comment 1', 'REQUEST_COMMENT', 'd9c6c738-8a60-43de-965f-f1f666da1639', '6d52c8df-1ed6-41cd-920a-827e3eba0abf');

INSERT INTO request_response_table (request_response_id, request_response, request_response_duplicatable_section_id, request_response_field_id, request_response_request_id) VALUES
('b3a3bb8f-7a30-431f-a55e-b9b5e50bed95', '"Text field response 1"', NULL, '9696114b-9884-4ecf-8000-ab30ecde85aa', '45820673-8b88-4d15-a4bf-12d67f140929'),
('fbc191aa-0fd2-485e-a1c5-9526ab343c94', '"Text area field response 1"', NULL, '04141446-2b59-4d57-a81f-1bcbb5f4d4fd', '45820673-8b88-4d15-a4bf-12d67f140929'),
('fbc87253-44c7-441c-b84a-18e25085c200', '100', NULL, '34568491-4c73-4511-8a3e-babc6a54fdde', '45820673-8b88-4d15-a4bf-12d67f140929'),
('1e9e1cb3-ede1-4831-a9ef-c244043014c6', '"TRUE"', NULL, 'f8ad5957-ed6d-48a9-858e-67127599be43', '45820673-8b88-4d15-a4bf-12d67f140929'),
('19e8c73d-7669-44c0-a43d-1f3eb8c6dea5', '"Dropdown 1"', NULL, 'f6caa6e5-f2f5-4444-b96f-eec55dea2794', '45820673-8b88-4d15-a4bf-12d67f140929'),
('6b686238-b361-4212-8868-17192efac383', '["Multiselect 1","Multiselect 2"]', NULL, '297e382a-34ad-4301-9017-4d8f5eaf9728', '45820673-8b88-4d15-a4bf-12d67f140929'),
('4e7352eb-ed1b-4b1b-bea2-5b22d9e2b12a', '"01/01/23"', NULL, '2d2b787e-4398-4be2-b5b1-b47d78e2db81', '45820673-8b88-4d15-a4bf-12d67f140929'),
('fd856744-4092-493a-9953-3f82a48c5ead', '"11:11"', NULL, 'a217e383-7bb1-4f95-a145-6d37145a4477', '45820673-8b88-4d15-a4bf-12d67f140929'),
-- ('f7688f15-7cb2-4200-8290-546fdeb499b7', '1', NULL, '1b4c7148-faaa-46cd-b361-806e670058e7', '45820673-8b88-4d15-a4bf-12d67f140929'),

('718e01ee-6e6f-446a-be7a-0eb01e9fd192', '"Text field response 2"', NULL, '9696114b-9884-4ecf-8000-ab30ecde85aa', '280504f9-9739-45b2-a70d-484be2289861'),
('7c344881-ac14-4f41-83c9-d4f650455bc5', '"Text area field response 2"', NULL, '04141446-2b59-4d57-a81f-1bcbb5f4d4fd', '280504f9-9739-45b2-a70d-484be2289861'),
('24f9c70d-2253-4669-9184-83ab94562b3b', '200', NULL, '34568491-4c73-4511-8a3e-babc6a54fdde', '280504f9-9739-45b2-a70d-484be2289861'),
('1ccdc673-05ae-4695-bbeb-b38b006b10e7', '"FALSE"', NULL, 'f8ad5957-ed6d-48a9-858e-67127599be43', '280504f9-9739-45b2-a70d-484be2289861'),
('f6876072-68aa-4ac7-999b-9f8f3fd2cb68', '"Dropdown 2"', NULL, 'f6caa6e5-f2f5-4444-b96f-eec55dea2794', '280504f9-9739-45b2-a70d-484be2289861'),
('9db413ca-bc7f-466e-9589-2024db4bf23c', '["Multiselect 3"]', NULL, '297e382a-34ad-4301-9017-4d8f5eaf9728', '280504f9-9739-45b2-a70d-484be2289861'),
('8b2af4a8-1ae8-4b40-8a5d-8a2d002d557d', '"02/02/23"', NULL, '2d2b787e-4398-4be2-b5b1-b47d78e2db81', '280504f9-9739-45b2-a70d-484be2289861'),
('c6f51a20-b1b8-4ba9-9ace-22b6c9d2a0bc', '"2:22"', NULL, 'a217e383-7bb1-4f95-a145-6d37145a4477', '280504f9-9739-45b2-a70d-484be2289861'),
-- ('26a40562-8c51-477e-8a6c-e1dac26fb287', '2', NULL, '1b4c7148-faaa-46cd-b361-806e670058e7', '280504f9-9739-45b2-a70d-484be2289861'),

('19f062da-2940-44b3-b274-9a82aecbe2ef', '"Text field response 3"', NULL, '9696114b-9884-4ecf-8000-ab30ecde85aa', 'a9315409-9719-40cb-ada2-3f3ee622049b'),
('1030658c-8910-408b-ae75-e9c1cf9ee6dd', '"Text area field response 3"', NULL, '04141446-2b59-4d57-a81f-1bcbb5f4d4fd', 'a9315409-9719-40cb-ada2-3f3ee622049b'),
('c51154b7-48a0-4599-aa8d-6dcf69875745', '300', NULL, '34568491-4c73-4511-8a3e-babc6a54fdde', 'a9315409-9719-40cb-ada2-3f3ee622049b'),
('fd466eee-2904-4c63-aa5e-888271e829e3', '"TRUE"', NULL, 'f8ad5957-ed6d-48a9-858e-67127599be43', 'a9315409-9719-40cb-ada2-3f3ee622049b'),
('7bb8ad60-0890-4bb7-bdda-b2c576e6d054', '"Dropdown 3"', NULL, 'f6caa6e5-f2f5-4444-b96f-eec55dea2794', 'a9315409-9719-40cb-ada2-3f3ee622049b'),
('897196fd-9ed9-49e1-a87a-d97eda0bb18a', '["Multiselect 3"]', NULL, '297e382a-34ad-4301-9017-4d8f5eaf9728', 'a9315409-9719-40cb-ada2-3f3ee622049b'),
('e1874b02-fbb0-41f7-a305-ce35c7f270d3', '"03/03/23"', NULL, '2d2b787e-4398-4be2-b5b1-b47d78e2db81', 'a9315409-9719-40cb-ada2-3f3ee622049b'),
('115dd319-1296-443e-a3ca-b04c1a807bea', '"3:33"', NULL, 'a217e383-7bb1-4f95-a145-6d37145a4477', 'a9315409-9719-40cb-ada2-3f3ee622049b'),
-- ('8d5f35a9-3c0d-45e4-83ae-066a1ca3d975', '3', NULL, '1b4c7148-faaa-46cd-b361-806e670058e7', 'a9315409-9719-40cb-ada2-3f3ee622049b'),

('d19a565d-109c-4395-82e7-d75df4dafd92', '"Text field response 1"', '700d6cd5-9691-491e-b02f-2cbd73cb64b6', '253f311c-aca6-401d-be77-696aa67a59d5', '6d52c8df-1ed6-41cd-920a-827e3eba0abf'),
('8f792df5-f4fb-44c3-9d05-d699c0cabd47', '1', '700d6cd5-9691-491e-b02f-2cbd73cb64b6', '570a2b3f-bfb8-490e-a7bb-a8d0e4b512eb', '6d52c8df-1ed6-41cd-920a-827e3eba0abf'),
('566aa4ee-92c1-433a-8dcf-927a35e55e0c', '"TRUE"', '700d6cd5-9691-491e-b02f-2cbd73cb64b6', 'b925b45f-1d3e-4bbc-963b-80c5184702fb', '6d52c8df-1ed6-41cd-920a-827e3eba0abf'),
('5d5b6c20-d96a-49d3-92cb-7d3b82bdc645', '"Dropdown 1"', '700d6cd5-9691-491e-b02f-2cbd73cb64b6', 'f36180e1-ac98-4d56-ba7d-8eef9a71e0d8', '6d52c8df-1ed6-41cd-920a-827e3eba0abf'),

('1dd50817-0793-405f-9aef-a4edc29533b0', '"Text field response 2"', 'ce57791a-48d0-45aa-8ba1-4896f169c8b7', '253f311c-aca6-401d-be77-696aa67a59d5', '6d52c8df-1ed6-41cd-920a-827e3eba0abf'),
('6f9e3117-8a54-4e7f-b52d-a1f01be6e39f', '2', 'ce57791a-48d0-45aa-8ba1-4896f169c8b7', '570a2b3f-bfb8-490e-a7bb-a8d0e4b512eb', '6d52c8df-1ed6-41cd-920a-827e3eba0abf'),
('cb139450-3885-4f73-8755-30f23274f54a', '"FALSE"', 'ce57791a-48d0-45aa-8ba1-4896f169c8b7', 'b925b45f-1d3e-4bbc-963b-80c5184702fb', '6d52c8df-1ed6-41cd-920a-827e3eba0abf'),
('cd28c091-7b66-4213-b028-a4141e30ac5a', '"Dropdown 2"', 'ce57791a-48d0-45aa-8ba1-4896f169c8b7', 'f36180e1-ac98-4d56-ba7d-8eef9a71e0d8', '6d52c8df-1ed6-41cd-920a-827e3eba0abf'),

('fecbf2df-5e64-4c20-8396-f052f753d1d7', '"Text field response 3"', '72d23cc5-72a1-428a-b6ad-33e15810ea5b', '253f311c-aca6-401d-be77-696aa67a59d5', '6d52c8df-1ed6-41cd-920a-827e3eba0abf'),
('02a199d9-5e79-45c4-b8b9-ea25536d8ca8', '3', '72d23cc5-72a1-428a-b6ad-33e15810ea5b', '570a2b3f-bfb8-490e-a7bb-a8d0e4b512eb', '6d52c8df-1ed6-41cd-920a-827e3eba0abf'),
('502098c8-358d-4406-8b60-1f67ef12fc03', '"TRUE"', '72d23cc5-72a1-428a-b6ad-33e15810ea5b', 'b925b45f-1d3e-4bbc-963b-80c5184702fb', '6d52c8df-1ed6-41cd-920a-827e3eba0abf'),
('69e5b5d3-d12e-4548-88c5-1d2fde7bf33f', '"Dropdown 3"', '72d23cc5-72a1-428a-b6ad-33e15810ea5b', 'f36180e1-ac98-4d56-ba7d-8eef9a71e0d8', '6d52c8df-1ed6-41cd-920a-827e3eba0abf'),

('b523400b-cc12-4fc7-8937-ea9f7f7bd930', '"Not duplicatable text response"', NULL, 'd22f6df6-1845-4368-9e1b-7cd22fed7a1e', '6d52c8df-1ed6-41cd-920a-827e3eba0abf'),
('ce555508-5a32-4162-96e8-dbb554ac17ed', '"Dropdown 1"', NULL, '7c53aa9f-ec53-45f1-ba95-0556b07a71ba', '6d52c8df-1ed6-41cd-920a-827e3eba0abf'),
('30c8d27a-84e7-4aec-9c1d-8fd0d77ce2fd', '"01/01/23"', NULL, '3ecfcb90-7fdd-4521-82a3-4fb7daab44c0', '6d52c8df-1ed6-41cd-920a-827e3eba0abf'),

('4adde6bc-7a01-4c40-8ae2-4cebada31a8a', '["Multiselect 1"]', '38f01ebc-dfaa-44aa-b963-04cd57b1cff4', '5ef54cb5-f694-4f4e-aee5-ec228dec1da4', '6d52c8df-1ed6-41cd-920a-827e3eba0abf'),
('7b8b3f73-e53a-4fb7-824e-c05b89ae566b', '"01/01/23"', '38f01ebc-dfaa-44aa-b963-04cd57b1cff4', '1f9366fb-b89b-4d41-9a0e-e0264c422f17', '6d52c8df-1ed6-41cd-920a-827e3eba0abf'),
('833d72b4-32b8-45f3-8e93-fdd7bfe8997b', '"11:11"', '38f01ebc-dfaa-44aa-b963-04cd57b1cff4', '0b4a3e53-629a-49d8-80e6-bfe1f31c0510', '6d52c8df-1ed6-41cd-920a-827e3eba0abf');
-- ('18d9fa34-95c0-4b10-82b3-695e095153b2', '5', '38f01ebc-dfaa-44aa-b963-04cd57b1cff4', '5ed0f5c1-a97d-465b-ade4-758a5ae351a2', '6d52c8df-1ed6-41cd-920a-827e3eba0abf');

INSERT INTO request_signer_table (request_signer_id, request_signer_status, request_signer_request_id, request_signer_signer_id) VALUES
('a28e7cab-a4f1-4b65-903b-15ddd3fbac85', 'PENDING', '45820673-8b88-4d15-a4bf-12d67f140929', 'dd0149ad-9a49-4480-b7fa-62b55df3134e'),
('2782ebc2-8498-40e5-9100-d163827f0f49', 'PENDING', '280504f9-9739-45b2-a70d-484be2289861', 'dd0149ad-9a49-4480-b7fa-62b55df3134e'),
('8c1ce26f-058b-423b-8a4d-6043590091f2', 'PENDING', 'a9315409-9719-40cb-ada2-3f3ee622049b', 'dd0149ad-9a49-4480-b7fa-62b55df3134e'),

('73fac67e-7bf5-48b4-a272-53163830689c', 'PENDING', '6d52c8df-1ed6-41cd-920a-827e3eba0abf', 'b7115738-8089-4e68-ac94-76ce6d0452f5'),
('6b3ab922-2556-4c06-ac1f-4a11b8a58a05', 'PENDING', '6d52c8df-1ed6-41cd-920a-827e3eba0abf', '7d0781fe-eb57-4225-858d-abb6b93357c7');

INSERT INTO invitation_table (invitation_id, invitation_to_email, invitation_from_team_member_id) VALUES
('01c5621b-7442-4ae3-809b-b09697bdbbeb', 'janedoe@gmail.com', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b'),
('f0b53ba1-e6cf-4074-b362-c0bca03e748d', 'loremipsum@gmail.com', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b'),
('80176876-068c-4b7f-b143-e41f78fd16c9', 'dolorsit@gmail.com', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b');

INSERT INTO notification_table (notification_id, notification_content, notification_is_read, notification_redirect_url, notification_type, notification_app, notification_team_id, notification_user_id) VALUES
('9aeefd48-41b1-4eb3-aeec-8858cec974a5', 'Test notification invite', TRUE, '/', 'INVITE', 'GENERAL', NULL, 'dd689b20-8293-4b8a-b9c6-9a5cc63f659c'),
('08df0d02-13e0-49f2-9bae-9ca9d6b25161', 'Test notification request', TRUE, '/', 'REQUEST', 'REQUEST', 'a5a28977-6956-45c1-a624-b9e90911502e', 'beb2d52c-77d5-49a9-a175-637152c44424'),
('f5caeebf-8158-450a-88da-d7a098155a14', 'Test notification approve', TRUE, '/', 'APPROVE', 'REQUEST', 'a5a28977-6956-45c1-a624-b9e90911502e', 'beb2d52c-77d5-49a9-a175-637152c44424'),
('84b561a3-2a15-4c2d-b681-dc70e0695b50', 'Test notification reject', TRUE, '/', 'REJECT', 'REQUEST', 'a5a28977-6956-45c1-a624-b9e90911502e', 'beb2d52c-77d5-49a9-a175-637152c44424'),
('fd0a8148-59b2-49e1-8cb7-fd9210433040', 'Test notification comment', TRUE, '/', 'COMMENT', 'REQUEST', 'a5a28977-6956-45c1-a624-b9e90911502e', 'beb2d52c-77d5-49a9-a175-637152c44424');

INSERT INTO supplier_table (supplier_id, supplier_name, supplier_team_id) VALUES
('0f61f7e2-8354-4022-a5bd-adeae3e4027e', 'Techrom Computer Shop', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('c4cc353e-7b92-421b-b161-47e3f19c1c26', 'Symmetric Intercontinental IT Solutions Inc', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('3753ab78-290b-4b53-a4b0-752a8e42daf5', 'Fire Solution Inc', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('15c734e9-174f-4a19-b9ab-a3cc2f661b56', 'Begul Builders Corporation', 'a5a28977-6956-45c1-a624-b9e90911502e');