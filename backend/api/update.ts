import { Database } from "@/utils/database";
import { TeamTableUpdate } from "@/utils/types";
import { SupabaseClient } from "@supabase/supabase-js";

// Update Team
export const updateTeam = async (
  supabaseClient: SupabaseClient<Database>,
  params: TeamTableUpdate
) => {
  const { data, error } = await supabaseClient
    .from("team_table")
    .update(params)
    .eq("team_id", params.team_id)
    .select()
    .single();
  if (error) throw error;
  return data;
};
