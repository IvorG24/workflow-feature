import { Database } from "@/utils/database";
import { SupabaseClient } from "@supabase/supabase-js";

export const getCurrentUser = async (
  supabaseClient: SupabaseClient<Database>,
  params: { userId: string }
) => {
  if (!params?.userId) throw new Error("Missing required parameter: userId");

  
};
