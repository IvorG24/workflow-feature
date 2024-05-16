import { createClient } from "@supabase/supabase-js";

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_ONEOFFICE_SUPABASE_URL ?? "",
  process.env.NEXT_PUBLIC_ONEOFFICE_SUPABASE_ANON_KEY ?? "",
  { db: { schema: "address_schema" } }
);

export default supabaseClient;
