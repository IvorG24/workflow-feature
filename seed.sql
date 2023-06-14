INSERT INTO user_table (user_id, user_username, user_first_name, user_last_name, user_email, user_job_title, user_phone_number, user_active_team_id) VALUES
('8d01bf49-186f-49e2-8b13-b14220446622', 'johndoe', 'John', 'Doe', 'johndoe@gmail.com', 'Graphic Designer', '9586325781', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('9f4e60c0-6583-490f-a998-846a31d433d7', 'janedoe', 'Jane', 'Doe', 'janedoe@gmail.com', 'Sales Management', '9563268975', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('259e5eab-b47d-4918-8e6b-6dd4f8245a05', 'loremipsum', 'Lorem', 'Ipsum', 'loremipsum@gmail.com', 'Software Engineer', '9571523487', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('cf8b637e-3d65-4c7d-9680-a7330c73faa7', 'dolorsit', 'Dolor', 'Sit', 'dolorsit@gmail.com', 'Data Entry Clerk', '9856325789', 'a5a28977-6956-45c1-a624-b9e90911502e');

INSERT INTO team_table (team_id, team_name, team_user_id) VALUES
('a5a28977-6956-45c1-a624-b9e90911502e', 'Sta Clara', '8d01bf49-186f-49e2-8b13-b14220446622'),
('285cf257-07fb-40bb-befe-aecff5eb0ea6', 'Dodeca', '8d01bf49-186f-49e2-8b13-b14220446622'),
('7d653b33-d60f-4d39-a559-c56711eeb44c', 'Developers', '8d01bf49-186f-49e2-8b13-b14220446622');

INSERT INTO team_member_table (team_member_id, team_member_role, team_member_team_id, team_member_user_id) VALUES
('eb4d3419-b70f-44ba-b88f-c3d983cbcf3b', 'OWNER', 'a5a28977-6956-45c1-a624-b9e90911502e', '8d01bf49-186f-49e2-8b13-b14220446622'),
('d9c6c738-8a60-43de-965f-f1f666da1639', 'ADMIN', 'a5a28977-6956-45c1-a624-b9e90911502e', '9f4e60c0-6583-490f-a998-846a31d433d7'),
('1e9bb9c7-e4e6-42e4-9377-a33f9b645343', 'ADMIN', 'a5a28977-6956-45c1-a624-b9e90911502e', '259e5eab-b47d-4918-8e6b-6dd4f8245a05'),
('390dbc5f-c3ba-4f86-81ca-7cc9746b6e31', 'MEMBER', 'a5a28977-6956-45c1-a624-b9e90911502e', 'cf8b637e-3d65-4c7d-9680-a7330c73faa7'),
('ccff17b4-66bf-4c0f-bc02-35750403cecf', 'OWNER', '285cf257-07fb-40bb-befe-aecff5eb0ea6', '8d01bf49-186f-49e2-8b13-b14220446622'),
('a77b9169-705a-4e3c-a3f3-fef15f18423f', 'OWNER', '7d653b33-d60f-4d39-a559-c56711eeb44c', '8d01bf49-186f-49e2-8b13-b14220446622');

INSERT INTO form_table (form_id, form_name, form_description, form_app, form_team_member_id, form_is_formsly_form, form_is_hidden) VALUES
('b8408545-4354-47d0-a648-928c6755a94b', 'All Fields', 'test all types of fields', 'REQUEST', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b', false, false),
('337658f1-0777-45f2-853f-b6f20551712e', 'Duplicatable Sections', 'test field duplicatable sections', 'REQUEST', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b', false, false),
('d13b3b0f-14df-4277-b6c1-7c80f7e7a829', 'Order to Purchase', 'formsly premade Order to Purchase form', 'REQUEST', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b', true, true),
('bba77187-c35d-4a6d-bf03-431e2ff2212e', 'Purchase Order', 'formsly premade Purchase Order form', 'REQUEST', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b', true, true),
('a732196f-9779-45e2-85fa-7320397e5b0a', 'Invoice', 'formsly premade Invoice form', 'REQUEST', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b', true, true),
('6f7b3e6c-002e-4a74-8a67-ea21a11dc178', 'Account Payable Voucher', 'formsly premade Account Payable Voucher form', 'REQUEST', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b', true, true),
('5782d70a-5f6b-486c-a77f-401066afd005', 'Receiving Inspecting Report', 'formsly premade Receiving Inspecting Report form', 'REQUEST', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b', true, true),
('913a09d8-88f9-4139-a039-a77394405b62', 'Cheque Reference', 'formsly premade Cheque Reference form', 'REQUEST', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b', true, true),
('d2e3e618-7f9b-4439-8f76-72a05a0bf305', 'Audit', 'formsly premade Audit form', 'REQUEST', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b', true, true);

INSERT INTO section_table (section_id, section_name, section_order, section_is_duplicatable, section_form_id) VALUES
('80017528-ddb2-419d-92be-cdfa867b8f42', 'All fields Section 1', 1, false, 'b8408545-4354-47d0-a648-928c6755a94b'),
('2bba9d85-90ed-4cec-a97a-159e482f4f65', 'All fields Section 2', 2, false, 'b8408545-4354-47d0-a648-928c6755a94b'),
('e36be46d-4eec-4d5a-bb71-fd2d539c599e', 'All fields Section 3', 3, false, 'b8408545-4354-47d0-a648-928c6755a94b'),
('5da6140a-bec6-4afa-aeec-2fcb84c17669', 'Duplicatable Section 1', 1, true, '337658f1-0777-45f2-853f-b6f20551712e'),
('8ef2c6a0-797d-4e36-8246-cfa0f783afb5', 'Normal Section 2', 2, false, '337658f1-0777-45f2-853f-b6f20551712e'),
('d8465119-a0ef-43e8-9feb-0373b7d46b29', 'Duplicatable Section 3', 3, true, '337658f1-0777-45f2-853f-b6f20551712e'),

-- Order to Purchase
('ee34bb67-fffa-4690-aaf2-7ae371b21e88', 'Main', 1, false, 'd13b3b0f-14df-4277-b6c1-7c80f7e7a829'),
('0672ef7d-849d-4bc7-81b1-7a5eefcc1451', 'Item', 2, true, 'd13b3b0f-14df-4277-b6c1-7c80f7e7a829'),

-- Purchase Order
('f052f7da-a130-41db-a6ef-6150fbb9cd06', 'ID', 1, false, 'bba77187-c35d-4a6d-bf03-431e2ff2212e'),
('e283f2ca-bfba-4ec0-bc57-38e3d3ccb94d', 'Main', 2, false, 'bba77187-c35d-4a6d-bf03-431e2ff2212e'),

-- Invoice
('7d6649c2-316b-4895-86eb-120def2e2f33', 'ID', 1, false, 'a732196f-9779-45e2-85fa-7320397e5b0a'),
('991d9830-ae1b-4c14-bdba-6167b64f50f7', 'Main', 2, false, 'a732196f-9779-45e2-85fa-7320397e5b0a'),

-- Account Payable Voucher
('5a936443-46ef-471f-8c87-6bc82b1568c3', 'ID', 1, false, '6f7b3e6c-002e-4a74-8a67-ea21a11dc178'),

-- Receiving Inspecting Report
('b79c9a66-f112-4bfa-8d5c-88267be24fd8', 'ID', 1, false, '5782d70a-5f6b-486c-a77f-401066afd005'),
('00341355-1ece-47e6-88a2-060fbab8b11a', 'Main', 2, false, '5782d70a-5f6b-486c-a77f-401066afd005'),

-- Cheque Reference
('2217dcb5-0604-4455-b15a-6beb4ee4fa9f', 'Treasury', 1, false, '913a09d8-88f9-4139-a039-a77394405b62'),
('5ec2a535-7855-48dd-ab14-318a5344409d', 'Cheque', 1, false, '913a09d8-88f9-4139-a039-a77394405b62'),

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
('51b6da24-3e28-49c4-9e19-5988b9ad3909', 'Project Name', 'DROPDOWN', 1, 'ee34bb67-fffa-4690-aaf2-7ae371b21e88', true, false),
('c88f075a-e97a-4d8c-aab0-1540c32e5b9b', 'Warehouse Processor', 'DROPDOWN', 2, 'ee34bb67-fffa-4690-aaf2-7ae371b21e88', true, false),
('6882287e-57c7-42ae-a672-b0d6c8979b01', 'Type', 'DROPDOWN', 3, 'ee34bb67-fffa-4690-aaf2-7ae371b21e88', true, false),
('46dc154d-1c35-4a3c-9809-698b56d17faa', 'Date Needed', 'DATE', 4, 'ee34bb67-fffa-4690-aaf2-7ae371b21e88', true, false),

('b2c899e8-4ac7-4019-819e-d6ebcae71f41', 'General Name', 'DROPDOWN', 1, '0672ef7d-849d-4bc7-81b1-7a5eefcc1451', true, false),
('d78145e8-ba83-4fa8-907f-db66fd3cae0d', 'Quantity', 'NUMBER', 2, '0672ef7d-849d-4bc7-81b1-7a5eefcc1451', true, false),
('59a6093c-5733-44c0-8a99-e12011207ff8', 'Length', 'DROPDOWN', 3, '0672ef7d-849d-4bc7-81b1-7a5eefcc1451', true, false),
('d527a714-a49a-4162-a851-f73553f6bea1', 'Width', 'DROPDOWN', 3, '0672ef7d-849d-4bc7-81b1-7a5eefcc1451', true, false),
('743ac520-e8a8-4801-a89b-abe4d666ff68', 'Height', 'DROPDOWN', 3, '0672ef7d-849d-4bc7-81b1-7a5eefcc1451', true, false),
('84b92308-11bf-47b4-b006-00894ea3640d', 'Type', 'DROPDOWN', 3, '0672ef7d-849d-4bc7-81b1-7a5eefcc1451', true, false),
('2d0a3a6c-107d-4f86-bf3d-87a98607f832', 'Brand', 'DROPDOWN', 3, '0672ef7d-849d-4bc7-81b1-7a5eefcc1451', true, false),
('ed1f9bbd-deab-4576-b83d-965b16b98522', 'Material', 'DROPDOWN', 3, '0672ef7d-849d-4bc7-81b1-7a5eefcc1451', true, false),
('84e06984-45eb-4947-913e-7882e20f3bfd', 'Size', 'DROPDOWN', 3, '0672ef7d-849d-4bc7-81b1-7a5eefcc1451', true, false),

-- Purchase Order Form
('1582b98c-c8a0-4a2c-a802-771a7f3bc248', 'Order to Purchase ID', 'LINK', 1, 'f052f7da-a130-41db-a6ef-6150fbb9cd06', true, true),
('c1668339-396e-439e-af1d-9f78024f985c', 'Purchasing Processor', 'DROPDOWN', 2, 'e283f2ca-bfba-4ec0-bc57-38e3d3ccb94d', true, false),
('2a43aedd-017c-4675-ad4c-00debbac7050', 'Vendor', 'DROPDOWN', 3, 'e283f2ca-bfba-4ec0-bc57-38e3d3ccb94d', true, false),
('a263d179-0c91-4139-a5a3-aad7c7838c9f', 'Amount', 'NUMBER', 4, 'e283f2ca-bfba-4ec0-bc57-38e3d3ccb94d', true, false),
('edec8e71-7fe0-4e6f-a390-4ab7462f85d6', 'Remarks', 'TEXTAREA', 5, 'e283f2ca-bfba-4ec0-bc57-38e3d3ccb94d', false, false),
('ce33edb3-a69b-4cde-b735-c6e2f7228e10', 'Payment Terms', 'TEXT', 6, 'e283f2ca-bfba-4ec0-bc57-38e3d3ccb94d', true, false),
('ef9e3fbb-3f37-4513-b455-c6b8098cf428', 'Down Payment Percentage', 'NUMBER', 7, 'e283f2ca-bfba-4ec0-bc57-38e3d3ccb94d', true, false),
('4ede3ad7-6763-4f42-9681-ef7f9d6c2872', 'Down Payment Computation', 'NUMBER', 8, 'e283f2ca-bfba-4ec0-bc57-38e3d3ccb94d', true, true),
('5dd83e41-c884-4466-b856-0a1ed5182774', 'Expected Delivery Date', 'DATE', 9, 'e283f2ca-bfba-4ec0-bc57-38e3d3ccb94d', true, false),

-- Invoice Form
('df0cb109-e34d-498f-ac51-af2139628ac0', 'Order to Purchase ID', 'LINK', 1, '7d6649c2-316b-4895-86eb-120def2e2f33', true, true),
('671c4cb1-75cc-4be4-b87d-ec6e3f8ec90a', 'Purchase Order ID', 'LINK', 2, '7d6649c2-316b-4895-86eb-120def2e2f33', true, true),
('dc494a3b-824c-4e5d-8fe1-6a7fab240880', 'Accounting Processor', 'DROPDOWN', 3, '991d9830-ae1b-4c14-bdba-6167b64f50f7', true, false),
('039f5c31-6e9c-42ae-aa27-21c0cba12560', 'Invoice Received Date', 'DATE', 4, '991d9830-ae1b-4c14-bdba-6167b64f50f7', true, false),
('4c201ab9-92d9-47dd-a661-a7bb2c4e3923', 'Invoice Attachment', 'FILE', 5, '991d9830-ae1b-4c14-bdba-6167b64f50f7', true, false),
('39ea4ce9-7c78-4470-b3ff-cfd13429d6c5', 'Invoice Pay by Date', 'DATE', 6, '991d9830-ae1b-4c14-bdba-6167b64f50f7', true, false),
('e18d1ebd-860a-4e46-8c88-15c1e4b9222f', 'Invoice Payable Amount', 'NUMBER', 7, '991d9830-ae1b-4c14-bdba-6167b64f50f7', true, false),
('3368de3f-ff94-4549-bd99-69bb5457ff13', 'CV Attachment', 'FILE', 8, '991d9830-ae1b-4c14-bdba-6167b64f50f7', true, false),

-- Account Payable Voucher Form
('72e63b67-7c13-4961-a277-2c8bcd222f6f', 'Order to Purchase ID', 'LINK', 1, '5a936443-46ef-471f-8c87-6bc82b1568c3', true, true),
('cec2b402-15d3-48ab-aee3-f28e5ae6b695', 'Purchase Order ID', 'LINK', 2, '5a936443-46ef-471f-8c87-6bc82b1568c3', true, true),
('c4ddbd67-73a7-4a86-b374-249dabae692e', 'Invoice ID', 'LINK', 3, '5a936443-46ef-471f-8c87-6bc82b1568c3', true, true),

-- Receiving Inspecting Report Form
('1df80eb4-b171-4bbf-925c-ae09b7d09bad', 'Order to Purchase ID', 'LINK', 1, 'b79c9a66-f112-4bfa-8d5c-88267be24fd8', true, true),
('ae1a746d-47c7-4184-a9a2-1c23d0440353', 'Purchase Order ID', 'LINK', 2, 'b79c9a66-f112-4bfa-8d5c-88267be24fd8', true, true),
('9d69d6fe-8019-416b-b4e6-41ec71792cb4', 'Invoice ID', 'LINK', 3, 'b79c9a66-f112-4bfa-8d5c-88267be24fd8', true, true),
('8bd25524-eea4-4771-bb12-4af7205ea4b9', 'Account Payable Voucher ID', 'LINK', 4, 'b79c9a66-f112-4bfa-8d5c-88267be24fd8', true, true),
('e9f687cb-fcbe-4a87-aa88-2d43df8659bd', 'Warehouse Receiver', 'DROPDOWN', 5, '00341355-1ece-47e6-88a2-060fbab8b11a', true, false),
('b74ff20b-33d5-444f-b39d-07745ba0d332', 'Receiving Status', 'DROPDOWN', 6, '00341355-1ece-47e6-88a2-060fbab8b11a', true, false), 

-- Cheque Reference Form
('f77ed73c-ddec-4a41-87fe-c6000d315d8e', 'Treasury Processsor', 'DROPDOWN', 1, '2217dcb5-0604-4455-b15a-6beb4ee4fa9f', true, false),
('8d245864-66be-46b7-8944-cef61c86a1ce', 'Treasury Status', 'DROPDOWN', 2, '2217dcb5-0604-4455-b15a-6beb4ee4fa9f', true, false),
('80054b56-d390-45ed-a3c5-2ae63489721b', 'Cheque Cancelled', 'SWITCH', 3, '5ec2a535-7855-48dd-ab14-318a5344409d', false, false),
('6def6dcb-c1a9-4597-93ac-0287b4005618', 'Cheque Printed Date', 'DATE', 4, '5ec2a535-7855-48dd-ab14-318a5344409d', true, false),
('c43f2688-30ac-407b-9366-f8820c34467e', 'Cheque Clearing Date', 'DATE', 5, '5ec2a535-7855-48dd-ab14-318a5344409d', true, false),
('9909f38c-cef9-4773-955b-7bc33700b747', 'Cheque First Signatory Name', 'TEXT', 6, '5ec2a535-7855-48dd-ab14-318a5344409d', true, false),
('1c286b86-01a5-4530-9285-3125bfd2cc55', 'Cheque First Date Signed', 'DATE', 7, '5ec2a535-7855-48dd-ab14-318a5344409d', true, false),
('230a92cf-80cf-4732-a66b-be5312a7b431', 'Cheque Second Signatory Name', 'TEXT', 8, '5ec2a535-7855-48dd-ab14-318a5344409d', true, false),
('4aa09972-2e53-4933-8dcb-f0ac92ec6063', 'Cheque Second Date Signed', 'DATE', 9, '5ec2a535-7855-48dd-ab14-318a5344409d', true, false),

-- Audit Form
('ebd59060-4564-4fe4-838c-774a5de6d1ba', 'Audit Processsor', 'DROPDOWN', 1, '8efd8c64-d1e7-45d4-a761-631db06d9a08', true, false),
('01ce24b8-780b-46af-8b15-864da9c20528', 'SSOT PO Prioritization Row Check', 'DROPDOWN', 2, '8efd8c64-d1e7-45d4-a761-631db06d9a08', true, false),
('5fde63d6-b583-49f2-881c-669d405f734c', 'Audit Remarks', 'TEXTAREA', 3, '8efd8c64-d1e7-45d4-a761-631db06d9a08', false, false),
('fd7cc81e-b93a-4bdf-bddf-0975f05aeda6', 'Date Audit Work Complete', 'DATE', 4, '8efd8c64-d1e7-45d4-a761-631db06d9a08', true, false);

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
('f97eb24f-53b2-452b-966e-9a2f1dfd812d', 'Cash', 1, '6882287e-57c7-42ae-a672-b0d6c8979b01'),
('a73672df-03ea-4bc8-b904-366044819188', 'Order to Purchase', 2, '6882287e-57c7-42ae-a672-b0d6c8979b01'),

-- Receiving Inspecting Report Form
('448d9bb2-f09c-4a9f-9b03-632bc849c3aa', 'Not Received', 1, 'b74ff20b-33d5-444f-b39d-07745ba0d332'),
('5376f40c-2dae-400a-9cb5-ed3d0fa003b7', 'Partially Received', 2, 'b74ff20b-33d5-444f-b39d-07745ba0d332'),
('78717371-9d2d-4e9c-ad86-cd39e51929ad', 'Fully Received', 3, 'b74ff20b-33d5-444f-b39d-07745ba0d332'),

-- Cheque Reference Form
('dff5176c-2e56-43a2-bbad-51d5d300a6f1', 'No Cheque', 1, '8d245864-66be-46b7-8944-cef61c86a1ce'),
('ff91134e-058c-4e26-8fba-f656e25aaa69', 'Ready for Pickup', 2, '8d245864-66be-46b7-8944-cef61c86a1ce'),
('0709f847-305b-4ed2-85cb-2ad73967e36f', 'Paid', 3, '8d245864-66be-46b7-8944-cef61c86a1ce'),

-- Audit Form
('c252a774-c364-4a37-8563-42467ff17a9f', 'Pass', 1, '01ce24b8-780b-46af-8b15-864da9c20528'),
('762aace6-aa47-4ece-a6a3-dc251ded05fd', 'Fail', 3, '01ce24b8-780b-46af-8b15-864da9c20528');

INSERT INTO signer_table (signer_id, signer_is_primary_signer, signer_action, signer_order, signer_form_id, signer_team_member_id) VALUES
('dd0149ad-9a49-4480-b7fa-62b55df3134e', TRUE, 'Approved', 1, 'b8408545-4354-47d0-a648-928c6755a94b', 'd9c6c738-8a60-43de-965f-f1f666da1639'),
('b7115738-8089-4e68-ac94-76ce6d0452f5', TRUE, 'Approved', 1, '337658f1-0777-45f2-853f-b6f20551712e', 'd9c6c738-8a60-43de-965f-f1f666da1639'),
('7d0781fe-eb57-4225-858d-abb6b93357c7', FALSE, 'Noted', 2, '337658f1-0777-45f2-853f-b6f20551712e', '1e9bb9c7-e4e6-42e4-9377-a33f9b645343'),
('37067546-44b2-4bfa-a952-b0332e98298c', TRUE, 'Approved', 1, 'd13b3b0f-14df-4277-b6c1-7c80f7e7a829', 'd9c6c738-8a60-43de-965f-f1f666da1639'),
('50caa3f7-80e5-4cb4-9e52-0f3e8b921c90', TRUE, 'Approved', 1, 'bba77187-c35d-4a6d-bf03-431e2ff2212e', 'd9c6c738-8a60-43de-965f-f1f666da1639'),
('8321f613-6362-4d17-b9f2-f439ddd9a8a8', TRUE, 'Approved', 1, 'a732196f-9779-45e2-85fa-7320397e5b0a', 'd9c6c738-8a60-43de-965f-f1f666da1639'),
('9fd0abd8-efa8-4598-98d1-b39b0a87faab', TRUE, 'Approved', 1, '6f7b3e6c-002e-4a74-8a67-ea21a11dc178', 'd9c6c738-8a60-43de-965f-f1f666da1639'),
('37f8b92c-9e9e-4e97-a6f4-f2f55a7f1a87', TRUE, 'Approved', 1, '5782d70a-5f6b-486c-a77f-401066afd005', 'd9c6c738-8a60-43de-965f-f1f666da1639'),
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
('9aeefd48-41b1-4eb3-aeec-8858cec974a5', 'Test notification invite', TRUE, '/', 'INVITE', 'GENERAL', NULL, '9f4e60c0-6583-490f-a998-846a31d433d7'),
('08df0d02-13e0-49f2-9bae-9ca9d6b25161', 'Test notification request', TRUE, '/', 'REQUEST', 'REQUEST', 'a5a28977-6956-45c1-a624-b9e90911502e', '8d01bf49-186f-49e2-8b13-b14220446622'),
('f5caeebf-8158-450a-88da-d7a098155a14', 'Test notification approve', TRUE, '/', 'APPROVE', 'REQUEST', 'a5a28977-6956-45c1-a624-b9e90911502e', '8d01bf49-186f-49e2-8b13-b14220446622'),
('84b561a3-2a15-4c2d-b681-dc70e0695b50', 'Test notification reject', TRUE, '/', 'REJECT', 'REQUEST', 'a5a28977-6956-45c1-a624-b9e90911502e', '8d01bf49-186f-49e2-8b13-b14220446622'),
('fd0a8148-59b2-49e1-8cb7-fd9210433040', 'Test notification comment', TRUE, '/', 'COMMENT', 'REQUEST', 'a5a28977-6956-45c1-a624-b9e90911502e', '8d01bf49-186f-49e2-8b13-b14220446622');

INSERT INTO item_table (item_id, item_general_name, item_unit, item_team_id) VALUES 
('5bc0f573-9c7f-4053-a387-21e744399b0c', 'Wood', 'piece', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('64de1a67-18dd-4010-ac2a-326aa7178908', 'Gasoline', 'liter', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('bf56098b-3869-4c28-a1e8-896c82b9386e', 'Nail', 'bag', 'a5a28977-6956-45c1-a624-b9e90911502e');

INSERT INTO item_description_table(item_description_id, item_description_label, item_description_item_id) VALUES 
('164a75f3-09cc-42ae-9d9e-276eb33166f3', 'Length', '5bc0f573-9c7f-4053-a387-21e744399b0c'),
('19bd52fb-c7a0-48c7-a0a3-0a453abf8a1c', 'Width', '5bc0f573-9c7f-4053-a387-21e744399b0c'),
('b3090b4d-120e-4f68-8374-2080eee4b29c', 'Height', '5bc0f573-9c7f-4053-a387-21e744399b0c'),
('a80ef950-2a2a-4669-8dd7-b3b502f3e82d', 'Type', '64de1a67-18dd-4010-ac2a-326aa7178908'),
('f63b2370-0174-4a89-a047-a2680717d91a', 'Brand', '64de1a67-18dd-4010-ac2a-326aa7178908'),
('0e5e970a-63aa-4b88-902a-e410a3611015', 'Material', 'bf56098b-3869-4c28-a1e8-896c82b9386e'),
('0554d368-42e8-4b3b-a5d0-8fc68a7129ec', 'Size', 'bf56098b-3869-4c28-a1e8-896c82b9386e');

INSERT INTO item_description_field_table (item_description_field_id, item_description_field_value, item_description_field_item_description_id) VALUES 
('f55f7011-16b4-4d68-913d-26b982851b78', '1', '164a75f3-09cc-42ae-9d9e-276eb33166f3'),
('d943db75-d8cf-413e-b9c3-c5b499a73640', '2', '164a75f3-09cc-42ae-9d9e-276eb33166f3'),
('4b6ce9ff-361c-4c81-977d-6aba7fa6382e', '3', '164a75f3-09cc-42ae-9d9e-276eb33166f3'),
('44da0631-b20b-4887-85e7-2d979f840f04', '4', '164a75f3-09cc-42ae-9d9e-276eb33166f3'),
('8331b319-569f-4613-b62a-338cc2d8359d', '1', '19bd52fb-c7a0-48c7-a0a3-0a453abf8a1c'),
('a80b02c8-3068-40be-8a82-444a82e7f63f', '2', '19bd52fb-c7a0-48c7-a0a3-0a453abf8a1c'),
('a1f5ae8e-71e9-43ed-8a4e-575614a0d5bc', '3', '19bd52fb-c7a0-48c7-a0a3-0a453abf8a1c'),
('779a3de2-7cc0-4214-8b81-8ad82185cb94', '1', 'b3090b4d-120e-4f68-8374-2080eee4b29c'),
('83d756f9-7238-4e0c-81e1-b284ffb4b7f2', '2', 'b3090b4d-120e-4f68-8374-2080eee4b29c'),
('13a12596-3161-4893-a3fe-07ea73fbeffd', 'Unleaded',  'a80ef950-2a2a-4669-8dd7-b3b502f3e82d'),
('f1a11c5a-915b-4eff-a4d2-f36683998b2f', 'Shell',  'f63b2370-0174-4a89-a047-a2680717d91a'),
('b113659c-8ae7-4650-8b19-1d88e2d76c37', 'Diesel',  'a80ef950-2a2a-4669-8dd7-b3b502f3e82d'),
('ed3fe8d0-a9c5-4e67-a9da-2d8617a8a550', 'Petron',  'f63b2370-0174-4a89-a047-a2680717d91a'),
('0055da68-32c8-40f9-ad6e-d7be663dad70', 'Metal', '0e5e970a-63aa-4b88-902a-e410a3611015'),
('1fc0f954-bd1a-46e8-905b-6a9c367a6cc0', '5', '0554d368-42e8-4b3b-a5d0-8fc68a7129ec');

INSERT INTO project_table (project_id, project_name, project_team_id) VALUES
('5918cc87-8f77-4b90-8db1-30705318d0ba', 'Philip Morris', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('925ee08f-9dc6-4188-a7a4-befa1de9757f', 'Siguil Hydro', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('45d921f4-19cb-4d42-b441-ee80a04e8e68', 'Lake Mainit', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('da7466c2-b5f3-48b6-b092-866804143d93', 'Meralco HDD', 'a5a28977-6956-45c1-a624-b9e90911502e');

INSERT INTO warehouse_processor_table (warehouse_processor_id, warehouse_processor_first_name, warehouse_processor_last_name, warehouse_processor_employee_number, warehouse_processor_team_id) VALUES 
('239d5de1-ba78-46ae-a0f5-7471c4cba265', 'Christian', 'Dillon', '5760', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('721bf5bb-d621-412b-b945-5af719ae70a6', 'Jayson', 'Robertson', '3145', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('5ef4ee74-32e2-40cd-b6e5-c183fd18ce8d', 'Daren', 'Moran', '5471', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('2410e2f7-55a2-4ad2-83ce-8dd722801087', 'Nicholas', 'Hanson', '7021', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('235a8fa3-83dd-4899-bc03-b1a65c385f92', 'Jennie', 'Christian', '8977', 'a5a28977-6956-45c1-a624-b9e90911502e');

INSERT INTO vendor_table (vendor_id, vendor_name, vendor_team_id) VALUES
('0f61f7e2-8354-4022-a5bd-adeae3e4027e', 'Techrom Computer Shop', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('c4cc353e-7b92-421b-b161-47e3f19c1c26', 'Symmetric Intercontinental IT Solutions Inc', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('3753ab78-290b-4b53-a4b0-752a8e42daf5', 'Fire Solution Inc', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('15c734e9-174f-4a19-b9ab-a3cc2f661b56', 'Begul Builders Corporation', 'a5a28977-6956-45c1-a624-b9e90911502e');

INSERT INTO purchasing_processor_table (purchasing_processor_id, purchasing_processor_first_name, purchasing_processor_last_name, purchasing_processor_employee_number, purchasing_processor_team_id) VALUES 
('6d24a39c-2bf1-48f1-8739-d60bbda9dc34', 'Chris', 'Swanson', '5760', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('b8a32349-8333-4a3b-818e-19f18576adf7', 'Hunter', 'Gates', '3145', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('04c12e38-d79d-4a82-8e23-ef60356b90d9', 'Lorie', 'Blackburn', '5471', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('f9cd72ab-d3a5-4c13-9ca6-d6db021df329', 'Rosanne', 'Vincent', '7021', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('2dde9900-5f34-4821-a3fd-6a9740aff772', 'Lowell', 'Bautista', '8977', 'a5a28977-6956-45c1-a624-b9e90911502e');

INSERT INTO accounting_processor_table (accounting_processor_id, accounting_processor_first_name, accounting_processor_last_name, accounting_processor_employee_number, accounting_processor_team_id) VALUES 
('ef8bb978-96a6-40c2-bcdc-226fb30c691f', 'Ralph', 'Freeman', '3698', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('7f5d7d26-414a-45cf-ac8a-5a66584ae52e', 'Erik', 'Guerra', '6259', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('7cbd3185-4440-4313-a19b-9013d7a77964', 'Leonardo', 'Lambert', '1233', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('1e26f8eb-d604-42ff-94bb-0b71f44abc6c', 'Mckinley', 'Hatfield', '5431', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('45f41256-4e34-41fd-a8fe-48a6fda93d5f', 'Rudy', 'Tate', '6754', 'a5a28977-6956-45c1-a624-b9e90911502e');

INSERT INTO warehouse_receiver_table (warehouse_receiver_id, warehouse_receiver_first_name, warehouse_receiver_last_name, warehouse_receiver_employee_number, warehouse_receiver_team_id) VALUES 
('a3a46ce3-478c-4d8e-9b54-8410bb1f9d30', 'Darwin', 'Henderson', '5423', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('f41276a8-5329-4674-b7b6-7447521b7cfa', 'Jacinto', 'Little', '5678', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('6025ff26-3646-4c41-9341-f6fd3bce04b2', 'Kellie', 'Chan', '0988', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('2278e890-3a02-404b-b690-645242080e13', 'Paulette', 'Ward', '1232', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('82559661-66d8-4822-b9de-d7907d8e1a93', 'Judy', 'Robertson', '6787', 'a5a28977-6956-45c1-a624-b9e90911502e');

INSERT INTO treasury_processor_table (treasury_processor_id, treasury_processor_first_name, treasury_processor_last_name, treasury_processor_employee_number, treasury_processor_team_id) VALUES 
('667b7e64-8294-443d-9192-0f63b65d4117', 'Mavis', 'Hubbard', '9852', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('8a7844cf-7601-4998-a4f5-059c86b271a9', 'Hans', 'English', '6723', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('408560c0-810a-4d81-ab93-d81cd53609af', 'Phoebe', 'Barber', '6978', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('b5d0b3b4-81e1-4b7a-bbda-39a89954cc74', 'Patrice', 'Hendrix', '4521', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('acea3330-d46b-443a-a62a-6519b53656e0', 'Irving', 'Nielsen', '8258', 'a5a28977-6956-45c1-a624-b9e90911502e');

INSERT INTO audit_processor_table (audit_processor_id, audit_processor_first_name, audit_processor_last_name, audit_processor_employee_number, audit_processor_team_id) VALUES 
('41593035-a2f4-47b2-9e65-80bef1e18a2b', 'Bessie', 'Johnston', '4357', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('14e7ae88-1f42-45b1-a1e3-7355ec30ebf0', 'Erwin', 'Huerta', '9873', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('cf8ba8a9-121e-42ab-bc25-598a31fbdfc5', 'Jules', 'Atkins', '2587', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('dc3c0e42-0765-4fd8-83b1-9173cd3c46aa', 'Henry', 'Fry', '4568', 'a5a28977-6956-45c1-a624-b9e90911502e'),
('760e045e-4148-4f60-854d-2f5ac9c135cc', 'Florentino', 'Kaiser', '8133', 'a5a28977-6956-45c1-a624-b9e90911502e');