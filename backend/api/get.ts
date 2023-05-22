import { Database } from "@/utils/database";
import { SupabaseClient } from "@supabase/supabase-js";

export const getCurrentDate = async (
  supabaseClient: SupabaseClient<Database>
) => {
  const { data, error } = await supabaseClient
    .rpc("get_current_date")
    .select("*")
    .single();
  if (error) throw error;
  if (!data) throw error;
  return new Date(data);
};

export const getAllTeamOfUser = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    userId: string;
  }
) => {
  const { userId } = params;
  const { data, error } = await supabaseClient
    .from("team_member_table")
    .select("*, team:team_table(*)")
    .eq("team_member_user_id", userId);
  if (error) throw error;
  const teamList = data.map((teamMember) => {
    return teamMember.team;
  });

  return teamList;
};

export const getUser = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    userId: string;
  }
) => {
  const { userId } = params;
  const { data, error } = await supabaseClient
    .from("user_table")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error) throw error;
  return data;
};

export const getFormList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    app: string;
  }
) => {
  const { teamId, app } = params;
  const { data, error } = await supabaseClient
    .from("form_table")
    .select("*, form_team_member:form_team_member_id!inner(*)")
    .eq("form_team_member.team_member_team_id", teamId)
    .eq("form_app", app);
  if (error) throw error;
  return data;
};
