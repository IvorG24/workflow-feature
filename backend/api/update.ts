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

// Update user's active team and active app
export const updateUserActiveTeamAndActiveApp = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    userId: string;
    app: string;
  }
) => {
  const { teamId, userId, app } = params;
  const { error } = await supabaseClient
    .from("user_table")
    .update({ user_active_team_id: teamId, user_active_app: app })
    .eq("user_id", userId);
  if (error) throw error;
};
