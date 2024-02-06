ALTER TABLE ticket_table
ALTER COLUMN ticket_title DROP NOT NULL;
ALTER TABLE ticket_table
ALTER COLUMN ticket_description DROP NOT NULL;

-- Start: Ticket field table

CREATE TABLE ticket_field_table (
  ticket_field_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  ticket_field_name VARCHAR(4000) NOT NULL,
  ticket_field_description VARCHAR(4000),   
  ticket_field_is_required  BOOLEAN DEFAULT FALSE NOT NULL,
  ticket_field_type VARCHAR(4000) NOT NULL,
  ticket_field_order INT NOT NULL,
  ticket_field_is_read_only BOOLEAN DEFAULT FALSE NOT NULL,
  ticket_field_ticket_type VARCHAR(4000) NOT NULL
);

-- End: Ticket field table

-- Start: Ticket option table

CREATE TABLE ticket_option_table (
  ticket_option_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  ticket_option_value VARCHAR(4000) NOT NULL,
  ticket_option_order INT NOT NULL,

  ticket_option_ticket_field_id UUID REFERENCES ticket_field_table(ticket_field_id) NOT NULL
);

-- End: Ticket response table

-- Start: Ticket response table

CREATE TABLE ticket_response_table(
  ticket_response_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
  ticket_response VARCHAR(4000) NOT NULL,
  ticket_response_order INT NOT NULL,

  ticket_response_ticket_id UUID REFERENCES ticket_table(ticket_id) NOT NULL,
  ticket_response_ticket_field_id UUID REFERENCES ticket_field_table(ticket_field_id) NOT NULL
);

-- End: Ticket response table


-- SEED

INSERT INTO ticket_field_table (ticket_field_name, ticket_field_description, ticket_field_is_required,ticket_field_type,ticket_field_order,ticket_field_is_read_only,ticket_field_ticket_type) VALUES

-- Request Custom CSI
('Item Name', NULL, true, 'DROPDOWN', 1, false, 'Request Custom CSI'),
('CSI Code Description', NULL, true, 'TEXT', 2, false, 'Request Custom CSI'),
('CSI Code', NULL, true, 'TEXT', 3, false, 'Request Custom CSI'),
('Division Description', NULL, true, 'TEXT', 4, false, 'Request Custom CSI'),
('Level 2 Major Group Description', NULL, true, 'TEXT', 5, false, 'Request Custom CSI'),
('Level 2 Minor Group Description', NULL, true, 'TEXT', 6, false, 'Request Custom CSI');

ALTER TABLE ticket_field_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_option_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_response_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CREATE access for all users" ON ticket_field_table;
DROP POLICY IF EXISTS "Allow READ for anon users" ON ticket_field_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON ticket_field_table;

DROP POLICY IF EXISTS "Allow CREATE access for all users" ON ticket_option_table;
DROP POLICY IF EXISTS "Allow READ for anon users" ON ticket_option_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON ticket_option_table;

DROP POLICY IF EXISTS "Allow CREATE access for all users" ON ticket_response_table;
DROP POLICY IF EXISTS "Allow READ for anon users" ON ticket_response_table;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON ticket_response_table;

--- TICKET_FIELD_TABLE

CREATE POLICY "Allow CREATE access for all users" ON "public"."ticket_field_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow READ for anon users" ON "public"."ticket_field_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users" ON "public"."ticket_field_table"
AS PERMISSIVE FOR UPDATE
TO authenticated 
USING(true)
WITH CHECK (true);

--- TICKET_FIELD_TABLE

CREATE POLICY "Allow CREATE access for all users" ON "public"."ticket_option_table"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow READ for anon users" ON "public"."ticket_option_table"
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

CREATE POLICY "Allow READ for anon users" ON "public"."ticket_response_table"
AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Allow UPDATE for authenticated users" ON "public"."ticket_response_table"
AS PERMISSIVE FOR UPDATE
TO authenticated 
USING(true)
WITH CHECK (true);


GRANT ALL ON ALL TABLES IN SCHEMA public TO PUBLIC;
GRANT ALL ON ALL TABLES IN SCHEMA public TO POSTGRES;

GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

