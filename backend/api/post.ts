import { Database } from "@/utils/database";
import { UserTableInsert } from "@/utils/types";
import { SupabaseClient } from "@supabase/supabase-js";

export const createUser = async (
  supabaseClient: SupabaseClient<Database>,
  params: UserTableInsert
) => {
  console.log(params);
  const { error } = await supabaseClient.from("user_table").insert(params);
  if (error) throw error;
};
