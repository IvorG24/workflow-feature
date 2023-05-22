INSERT INTO user_table (user_id, user_username, user_first_name, user_last_name, user_email, user_job_title, user_phone_number) VALUES
('8d01bf49-186f-49e2-8b13-b14220446622', 'johndoe', 'John', 'Doe', 'johndoe@gmail.com', 'Graphic Designer', '09586325781'),
('9f4e60c0-6583-490f-a998-846a31d433d7', 'janedoe', 'Jane', 'Doe', 'janedoe@gmail.com', 'Sales Management', '09563268975'),
('259e5eab-b47d-4918-8e6b-6dd4f8245a05', 'loremipsum', 'Lorem', 'Ipsum', 'loremipsum@gmail.com', 'Software Engineer', '09571523487'),
('cf8b637e-3d65-4c7d-9680-a7330c73faa7', 'dolorsit', 'Dolor', 'Sit', 'dolorsit@gmail.com', 'Data Entry Clerk', '09856325789');

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

INSERT INTO form_table (form_id, form_name, form_description, form_app, form_team_member_id) VALUES
('b8408545-4354-47d0-a648-928c6755a94b', 'All Fields', 'test all types of fields', 'REQUEST', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b'),
('337658f1-0777-45f2-853f-b6f20551712e', 'Duplicatable Sections', 'test field duplicatable sections', 'REQUEST', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b');

INSERT INTO section_table (section_id, section_name, section_order, section_is_duplicatable, section_form_id) VALUES
('80017528-ddb2-419d-92be-cdfa867b8f42', 'All fields Section 1', 1, false, 'b8408545-4354-47d0-a648-928c6755a94b'),
('2bba9d85-90ed-4cec-a97a-159e482f4f65', 'All fields Section 2', 2, false, 'b8408545-4354-47d0-a648-928c6755a94b'),
('e36be46d-4eec-4d5a-bb71-fd2d539c599e', 'All fields Section 3', 3, false, 'b8408545-4354-47d0-a648-928c6755a94b'),
('5da6140a-bec6-4afa-aeec-2fcb84c17669', 'Duplicatable Section 1', 1, false, '337658f1-0777-45f2-853f-b6f20551712e'),
('8ef2c6a0-797d-4e36-8246-cfa0f783afb5', 'Normal Section 2', 2, false, '337658f1-0777-45f2-853f-b6f20551712e'),
('d8465119-a0ef-43e8-9feb-0373b7d46b29', 'Duplicatable Section 3', 3, false, '337658f1-0777-45f2-853f-b6f20551712e');

INSERT INTO field_table (field_id, field_name, field_type, field_order, field_section_id) VALUES
('9696114b-9884-4ecf-8000-ab30ecde85aa', 'Text field', 'TEXT', 1, '80017528-ddb2-419d-92be-cdfa867b8f42'),
('04141446-2b59-4d57-a81f-1bcbb5f4d4fd', 'Text area field', 'TEXTAREA', 2, '80017528-ddb2-419d-92be-cdfa867b8f42'),
('34568491-4c73-4511-8a3e-babc6a54fdde', 'Number field', 'NUMBER', 3, '80017528-ddb2-419d-92be-cdfa867b8f42'),
('f8ad5957-ed6d-48a9-858e-67127599be43', 'Switch field', 'SWITCH', 4, '2bba9d85-90ed-4cec-a97a-159e482f4f65'),
('f6caa6e5-f2f5-4444-b96f-eec55dea2794', 'Dropdown field', 'DROPDOWN', 5, '2bba9d85-90ed-4cec-a97a-159e482f4f65'),
('297e382a-34ad-4301-9017-4d8f5eaf9728', 'Multiselect field', 'MULTISELECT', 6, '2bba9d85-90ed-4cec-a97a-159e482f4f65'),
('2d2b787e-4398-4be2-b5b1-b47d78e2db81', 'Date field', 'DATE', 7, 'e36be46d-4eec-4d5a-bb71-fd2d539c599e'),
('a217e383-7bb1-4f95-a145-6d37145a4477', 'Time field', 'TIME', 8, 'e36be46d-4eec-4d5a-bb71-fd2d539c599e'),
('1b4c7148-faaa-46cd-b361-806e670058e7', 'Slider field', 'SLIDER', 9, 'e36be46d-4eec-4d5a-bb71-fd2d539c599e'),

('253f311c-aca6-401d-be77-696aa67a59d5', 'Text field', 'TEXT', 1, '5da6140a-bec6-4afa-aeec-2fcb84c17669'),
('570a2b3f-bfb8-490e-a7bb-a8d0e4b512eb', 'Number field', 'NUMBER', 2, '5da6140a-bec6-4afa-aeec-2fcb84c17669'),
('b925b45f-1d3e-4bbc-963b-80c5184702fb', 'Switch field', 'SWITCH', 3, '5da6140a-bec6-4afa-aeec-2fcb84c17669'),
('f36180e1-ac98-4d56-ba7d-8eef9a71e0d8', 'Dropdown field', 'DROPDOWN', 4, '5da6140a-bec6-4afa-aeec-2fcb84c17669'),

('d22f6df6-1845-4368-9e1b-7cd22fed7a1e', 'Text field', 'TEXT', 5, '8ef2c6a0-797d-4e36-8246-cfa0f783afb5'),
('7c53aa9f-ec53-45f1-ba95-0556b07a71ba', 'Dropdown field', 'DROPDOWN', 6, '8ef2c6a0-797d-4e36-8246-cfa0f783afb5'),
('3ecfcb90-7fdd-4521-82a3-4fb7daab44c0', 'Date field', 'DATE', 7, '8ef2c6a0-797d-4e36-8246-cfa0f783afb5'),

('5ef54cb5-f694-4f4e-aee5-ec228dec1da4', 'Multiselect field', 'MULTISELECT', 8, 'd8465119-a0ef-43e8-9feb-0373b7d46b29'),
('1f9366fb-b89b-4d41-9a0e-e0264c422f17', 'Date field', 'DATE', 9, 'd8465119-a0ef-43e8-9feb-0373b7d46b29'),
('0b4a3e53-629a-49d8-80e6-bfe1f31c0510', 'Time field', 'TIME', 10, 'd8465119-a0ef-43e8-9feb-0373b7d46b29'),
('5ed0f5c1-a97d-465b-ade4-758a5ae351a2', 'Slider field', 'SLIDER', 11, 'd8465119-a0ef-43e8-9feb-0373b7d46b29');

INSERT INTO option_table (option_id, option_value, option_order, option_field_id) VALUES
('7961d4d4-6c04-46e7-b995-472856fff590', 'Dropdown 1', 1, 'f6caa6e5-f2f5-4444-b96f-eec55dea2794'),
('e80290da-9bc0-4aae-adb3-b15b321a8ad1', 'Dropdown 2', 2, 'f6caa6e5-f2f5-4444-b96f-eec55dea2794'),
('a9959120-e6ce-4b8b-998e-ec9e4a32b791', 'Dropdown 3', 3, 'f6caa6e5-f2f5-4444-b96f-eec55dea2794'),
('ee7597d6-472d-4a97-9661-3c509a571deb', 'Multiselect 1', 1, '297e382a-34ad-4301-9017-4d8f5eaf9728'),
('8addcf84-c1d7-44b6-8937-1fcca31a18e1', 'Multiselect 2', 2, '297e382a-34ad-4301-9017-4d8f5eaf9728'),
('6e573ba8-8e21-4965-b269-3bcba2d11bb8', 'Multiselect 3', 3, '297e382a-34ad-4301-9017-4d8f5eaf9728'),
('8576731c-144d-4e52-9878-6d773d2e9fb3', '[1,5]', 1, '1b4c7148-faaa-46cd-b361-806e670058e7'),
('bc487823-89f8-4038-b3eb-d90f4b43fbf9', 'Dropdown 1', 1, 'f36180e1-ac98-4d56-ba7d-8eef9a71e0d8'),
('7d86cfc1-21c2-4b52-8ba5-accc058c9aac', 'Dropdown 2', 2, 'f36180e1-ac98-4d56-ba7d-8eef9a71e0d8'),
('6114629a-b334-4fb4-99e6-18905aa80cad', 'Dropdown 3', 3, 'f36180e1-ac98-4d56-ba7d-8eef9a71e0d8'),
('db59d039-b548-444b-817c-66258fe61813', 'Dropdown 1', 1, '7c53aa9f-ec53-45f1-ba95-0556b07a71ba'),
('42f6a134-097e-4f6a-8072-2352bb2071ef', 'Dropdown 2', 2, '7c53aa9f-ec53-45f1-ba95-0556b07a71ba'),
('0af76533-83d1-460c-bf02-f2b5523cdd22', 'Dropdown 3', 3, '7c53aa9f-ec53-45f1-ba95-0556b07a71ba'),
('763721ed-2c20-4e87-a7f1-bfd1eaa848e0', 'Multiselect 1', 1, '5ef54cb5-f694-4f4e-aee5-ec228dec1da4'),
('c6d92f18-f06d-4f8c-ae89-3cef183b42e9', 'Multiselect 2', 2, '5ef54cb5-f694-4f4e-aee5-ec228dec1da4'),
('52da4c49-c855-4130-bb6f-c70f47bf21e4', 'Multiselect 3', 3, '5ef54cb5-f694-4f4e-aee5-ec228dec1da4'),
('bab0a354-4a06-4bb2-a8a2-dcdbb7f68fde', '[1,10]', 1, '5ed0f5c1-a97d-465b-ade4-758a5ae351a2');

INSERT INTO signer_table (signer_id, signer_is_primary_approver, signer_action, signer_order, signer_form_id, signer_team_member_id) VALUES
('dd0149ad-9a49-4480-b7fa-62b55df3134e', TRUE, 'Approved', 1, 'b8408545-4354-47d0-a648-928c6755a94b', 'd9c6c738-8a60-43de-965f-f1f666da1639'),
('b7115738-8089-4e68-ac94-76ce6d0452f5', TRUE, 'Approved', 1, '337658f1-0777-45f2-853f-b6f20551712e', 'd9c6c738-8a60-43de-965f-f1f666da1639'),
('7d0781fe-eb57-4225-858d-abb6b93357c7', FALSE, 'Noted', 2, '337658f1-0777-45f2-853f-b6f20551712e', '1e9bb9c7-e4e6-42e4-9377-a33f9b645343');

INSERT INTO request_table (request_id, request_team_member_id, request_form_id) VALUES
('45820673-8b88-4d15-a4bf-12d67f140929', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b', 'b8408545-4354-47d0-a648-928c6755a94b'),
('280504f9-9739-45b2-a70d-484be2289861', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b', 'b8408545-4354-47d0-a648-928c6755a94b'),
('a9315409-9719-40cb-ada2-3f3ee622049b', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b', 'b8408545-4354-47d0-a648-928c6755a94b'),
('6d52c8df-1ed6-41cd-920a-827e3eba0abf', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b', '337658f1-0777-45f2-853f-b6f20551712e');

INSERT INTO request_response_table (request_response_id, request_response, request_response_duplicatable_section_id, request_response_field_id, request_response_request_id) VALUES
('b3a3bb8f-7a30-431f-a55e-b9b5e50bed95', 'Text field response 1', NULL, '9696114b-9884-4ecf-8000-ab30ecde85aa', '45820673-8b88-4d15-a4bf-12d67f140929'),
('fbc191aa-0fd2-485e-a1c5-9526ab343c94', 'Text area field response 1', NULL, '04141446-2b59-4d57-a81f-1bcbb5f4d4fd', '45820673-8b88-4d15-a4bf-12d67f140929'),
('fbc87253-44c7-441c-b84a-18e25085c200', '100', NULL, '34568491-4c73-4511-8a3e-babc6a54fdde', '45820673-8b88-4d15-a4bf-12d67f140929'),
('1e9e1cb3-ede1-4831-a9ef-c244043014c6', 'TRUE', NULL, 'f8ad5957-ed6d-48a9-858e-67127599be43', '45820673-8b88-4d15-a4bf-12d67f140929'),
('19e8c73d-7669-44c0-a43d-1f3eb8c6dea5', 'Dropdown 1', NULL, 'f6caa6e5-f2f5-4444-b96f-eec55dea2794', '45820673-8b88-4d15-a4bf-12d67f140929'),
('6b686238-b361-4212-8868-17192efac383', 'Multiselect 1', NULL, '297e382a-34ad-4301-9017-4d8f5eaf9728', '45820673-8b88-4d15-a4bf-12d67f140929'),
('4e7352eb-ed1b-4b1b-bea2-5b22d9e2b12a', '01/01/23', NULL, '2d2b787e-4398-4be2-b5b1-b47d78e2db81', '45820673-8b88-4d15-a4bf-12d67f140929'),
('fd856744-4092-493a-9953-3f82a48c5ead', '11:11 A.M.', NULL, 'a217e383-7bb1-4f95-a145-6d37145a4477', '45820673-8b88-4d15-a4bf-12d67f140929'),
('f7688f15-7cb2-4200-8290-546fdeb499b7', '1', NULL, '1b4c7148-faaa-46cd-b361-806e670058e7', '45820673-8b88-4d15-a4bf-12d67f140929'),

('718e01ee-6e6f-446a-be7a-0eb01e9fd192', 'Text field response 2', NULL, '9696114b-9884-4ecf-8000-ab30ecde85aa', '280504f9-9739-45b2-a70d-484be2289861'),
('7c344881-ac14-4f41-83c9-d4f650455bc5', 'Text area field response 2', NULL, '04141446-2b59-4d57-a81f-1bcbb5f4d4fd', '280504f9-9739-45b2-a70d-484be2289861'),
('24f9c70d-2253-4669-9184-83ab94562b3b', '200', NULL, '34568491-4c73-4511-8a3e-babc6a54fdde', '280504f9-9739-45b2-a70d-484be2289861'),
('1ccdc673-05ae-4695-bbeb-b38b006b10e7', 'FALSE', NULL, 'f8ad5957-ed6d-48a9-858e-67127599be43', '280504f9-9739-45b2-a70d-484be2289861'),
('f6876072-68aa-4ac7-999b-9f8f3fd2cb68', 'Dropdown 2', NULL, 'f6caa6e5-f2f5-4444-b96f-eec55dea2794', '280504f9-9739-45b2-a70d-484be2289861'),
('9db413ca-bc7f-466e-9589-2024db4bf23c', 'Multiselect 2', NULL, '297e382a-34ad-4301-9017-4d8f5eaf9728', '280504f9-9739-45b2-a70d-484be2289861'),
('8b2af4a8-1ae8-4b40-8a5d-8a2d002d557d', '02/02/23', NULL, '2d2b787e-4398-4be2-b5b1-b47d78e2db81', '280504f9-9739-45b2-a70d-484be2289861'),
('c6f51a20-b1b8-4ba9-9ace-22b6c9d2a0bc', '22:22 P.M.', NULL, 'a217e383-7bb1-4f95-a145-6d37145a4477', '280504f9-9739-45b2-a70d-484be2289861'),
('26a40562-8c51-477e-8a6c-e1dac26fb287', '2', NULL, '1b4c7148-faaa-46cd-b361-806e670058e7', '280504f9-9739-45b2-a70d-484be2289861'),

('19f062da-2940-44b3-b274-9a82aecbe2ef', 'Text field response 3', NULL, '9696114b-9884-4ecf-8000-ab30ecde85aa', 'a9315409-9719-40cb-ada2-3f3ee622049b'),
('1030658c-8910-408b-ae75-e9c1cf9ee6dd', 'Text area field response 3', NULL, '04141446-2b59-4d57-a81f-1bcbb5f4d4fd', 'a9315409-9719-40cb-ada2-3f3ee622049b'),
('c51154b7-48a0-4599-aa8d-6dcf69875745', '300', NULL, '34568491-4c73-4511-8a3e-babc6a54fdde', 'a9315409-9719-40cb-ada2-3f3ee622049b'),
('fd466eee-2904-4c63-aa5e-888271e829e3', 'TRUE', NULL, 'f8ad5957-ed6d-48a9-858e-67127599be43', 'a9315409-9719-40cb-ada2-3f3ee622049b'),
('7bb8ad60-0890-4bb7-bdda-b2c576e6d054', 'Dropdown 3', NULL, 'f6caa6e5-f2f5-4444-b96f-eec55dea2794', 'a9315409-9719-40cb-ada2-3f3ee622049b'),
('897196fd-9ed9-49e1-a87a-d97eda0bb18a', 'Multiselect 3', NULL, '297e382a-34ad-4301-9017-4d8f5eaf9728', 'a9315409-9719-40cb-ada2-3f3ee622049b'),
('e1874b02-fbb0-41f7-a305-ce35c7f270d3', '03/03/23', NULL, '2d2b787e-4398-4be2-b5b1-b47d78e2db81', 'a9315409-9719-40cb-ada2-3f3ee622049b'),
('115dd319-1296-443e-a3ca-b04c1a807bea', '33:33 A.M.', NULL, 'a217e383-7bb1-4f95-a145-6d37145a4477', 'a9315409-9719-40cb-ada2-3f3ee622049b'),
('8d5f35a9-3c0d-45e4-83ae-066a1ca3d975', '3', NULL, '1b4c7148-faaa-46cd-b361-806e670058e7', 'a9315409-9719-40cb-ada2-3f3ee622049b'),

('d19a565d-109c-4395-82e7-d75df4dafd92', 'Text field response 1', '700d6cd5-9691-491e-b02f-2cbd73cb64b6', '253f311c-aca6-401d-be77-696aa67a59d5', '6d52c8df-1ed6-41cd-920a-827e3eba0abf'),
('8f792df5-f4fb-44c3-9d05-d699c0cabd47', '1', '700d6cd5-9691-491e-b02f-2cbd73cb64b6', '570a2b3f-bfb8-490e-a7bb-a8d0e4b512eb', '6d52c8df-1ed6-41cd-920a-827e3eba0abf'),
('566aa4ee-92c1-433a-8dcf-927a35e55e0c', 'TRUE', '700d6cd5-9691-491e-b02f-2cbd73cb64b6', 'b925b45f-1d3e-4bbc-963b-80c5184702fb', '6d52c8df-1ed6-41cd-920a-827e3eba0abf'),
('5d5b6c20-d96a-49d3-92cb-7d3b82bdc645', 'Dropdown 1', '700d6cd5-9691-491e-b02f-2cbd73cb64b6', 'f36180e1-ac98-4d56-ba7d-8eef9a71e0d8', '6d52c8df-1ed6-41cd-920a-827e3eba0abf'),

('1dd50817-0793-405f-9aef-a4edc29533b0', 'Text field response 2', 'ce57791a-48d0-45aa-8ba1-4896f169c8b7', '253f311c-aca6-401d-be77-696aa67a59d5', '6d52c8df-1ed6-41cd-920a-827e3eba0abf'),
('6f9e3117-8a54-4e7f-b52d-a1f01be6e39f', '2', 'ce57791a-48d0-45aa-8ba1-4896f169c8b7', '570a2b3f-bfb8-490e-a7bb-a8d0e4b512eb', '6d52c8df-1ed6-41cd-920a-827e3eba0abf'),
('cb139450-3885-4f73-8755-30f23274f54a', 'FALSE', 'ce57791a-48d0-45aa-8ba1-4896f169c8b7', 'b925b45f-1d3e-4bbc-963b-80c5184702fb', '6d52c8df-1ed6-41cd-920a-827e3eba0abf'),
('cd28c091-7b66-4213-b028-a4141e30ac5a', 'Dropdown 2', 'ce57791a-48d0-45aa-8ba1-4896f169c8b7', 'f36180e1-ac98-4d56-ba7d-8eef9a71e0d8', '6d52c8df-1ed6-41cd-920a-827e3eba0abf'),

('fecbf2df-5e64-4c20-8396-f052f753d1d7', 'Text field response 3', '72d23cc5-72a1-428a-b6ad-33e15810ea5b', '253f311c-aca6-401d-be77-696aa67a59d5', '6d52c8df-1ed6-41cd-920a-827e3eba0abf'),
('02a199d9-5e79-45c4-b8b9-ea25536d8ca8', '3', '72d23cc5-72a1-428a-b6ad-33e15810ea5b', '570a2b3f-bfb8-490e-a7bb-a8d0e4b512eb', '6d52c8df-1ed6-41cd-920a-827e3eba0abf'),
('502098c8-358d-4406-8b60-1f67ef12fc03', 'TRUE', '72d23cc5-72a1-428a-b6ad-33e15810ea5b', 'b925b45f-1d3e-4bbc-963b-80c5184702fb', '6d52c8df-1ed6-41cd-920a-827e3eba0abf'),
('69e5b5d3-d12e-4548-88c5-1d2fde7bf33f', 'Dropdown 3', '72d23cc5-72a1-428a-b6ad-33e15810ea5b', 'f36180e1-ac98-4d56-ba7d-8eef9a71e0d8', '6d52c8df-1ed6-41cd-920a-827e3eba0abf'),

('b523400b-cc12-4fc7-8937-ea9f7f7bd930', 'Not duplicatable text response', NULL, 'd22f6df6-1845-4368-9e1b-7cd22fed7a1e', '6d52c8df-1ed6-41cd-920a-827e3eba0abf'),
('ce555508-5a32-4162-96e8-dbb554ac17ed', 'Dropdown 1', NULL, '7c53aa9f-ec53-45f1-ba95-0556b07a71ba', '6d52c8df-1ed6-41cd-920a-827e3eba0abf'),
('30c8d27a-84e7-4aec-9c1d-8fd0d77ce2fd', '01/01/23', NULL, '3ecfcb90-7fdd-4521-82a3-4fb7daab44c0', '6d52c8df-1ed6-41cd-920a-827e3eba0abf'),

('4adde6bc-7a01-4c40-8ae2-4cebada31a8a', 'Multiselect 1', '38f01ebc-dfaa-44aa-b963-04cd57b1cff4', '5ef54cb5-f694-4f4e-aee5-ec228dec1da4', '6d52c8df-1ed6-41cd-920a-827e3eba0abf'),
('7b8b3f73-e53a-4fb7-824e-c05b89ae566b', '01/01/23', '38f01ebc-dfaa-44aa-b963-04cd57b1cff4', '1f9366fb-b89b-4d41-9a0e-e0264c422f17', '6d52c8df-1ed6-41cd-920a-827e3eba0abf'),
('833d72b4-32b8-45f3-8e93-fdd7bfe8997b', '11:11 A.M.', '38f01ebc-dfaa-44aa-b963-04cd57b1cff4', '0b4a3e53-629a-49d8-80e6-bfe1f31c0510', '6d52c8df-1ed6-41cd-920a-827e3eba0abf'),
('18d9fa34-95c0-4b10-82b3-695e095153b2', '01/01/23', '38f01ebc-dfaa-44aa-b963-04cd57b1cff4', '5ed0f5c1-a97d-465b-ade4-758a5ae351a2', '6d52c8df-1ed6-41cd-920a-827e3eba0abf');

INSERT INTO request_signer_table (request_signer_id, request_signer_status, request_signer_request_id, request_signer_signer_id) VALUES
('a28e7cab-a4f1-4b65-903b-15ddd3fbac85', 'PENDING', '45820673-8b88-4d15-a4bf-12d67f140929', 'dd0149ad-9a49-4480-b7fa-62b55df3134e'),
('2782ebc2-8498-40e5-9100-d163827f0f49', 'APPROVED', '280504f9-9739-45b2-a70d-484be2289861', 'dd0149ad-9a49-4480-b7fa-62b55df3134e'),
('8c1ce26f-058b-423b-8a4d-6043590091f2', 'REJECTED', 'a9315409-9719-40cb-ada2-3f3ee622049b', 'dd0149ad-9a49-4480-b7fa-62b55df3134e'),

('73fac67e-7bf5-48b4-a272-53163830689c', 'PENDING', '6d52c8df-1ed6-41cd-920a-827e3eba0abf', 'b7115738-8089-4e68-ac94-76ce6d0452f5'),
('6b3ab922-2556-4c06-ac1f-4a11b8a58a05', 'APPROVED', '6d52c8df-1ed6-41cd-920a-827e3eba0abf', '7d0781fe-eb57-4225-858d-abb6b93357c7');

INSERT INTO invitation_table (invitation_id, invitation_to_email, invitation_from_team_member_id) VALUES
('01c5621b-7442-4ae3-809b-b09697bdbbeb', 'janedoe@gmail.com', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b'),
('f0b53ba1-e6cf-4074-b362-c0bca03e748d', 'loremipsum@gmail.com', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b'),
('80176876-068c-4b7f-b143-e41f78fd16c9', 'dolorsit@gmail.com', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b');

INSERT INTO notification_table (notification_id, notification_content, notification_is_read, notification_redirect_url, notification_type, notification_app, notification_team_member_id) VALUES
('9aeefd48-41b1-4eb3-aeec-8858cec974a5', 'Test notification invite', TRUE, '/', 'INVITE', 'REQUEST', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b'),
('08df0d02-13e0-49f2-9bae-9ca9d6b25161', 'Test notification request', TRUE, '/', 'REQUEST', 'REQUEST', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b'),
('f5caeebf-8158-450a-88da-d7a098155a14', 'Test notification approve', TRUE, '/', 'APPROVE', 'REQUEST', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b'),
('84b561a3-2a15-4c2d-b681-dc70e0695b50', 'Test notification reject', TRUE, '/', 'REJECT', 'REQUEST', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b'),
('fd0a8148-59b2-49e1-8cb7-fd9210433040', 'Test notification comment', TRUE, '/', 'COMMENT', 'REQUEST', 'eb4d3419-b70f-44ba-b88f-c3d983cbcf3b');
