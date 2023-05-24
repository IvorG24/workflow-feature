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

export const getRequestList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
  }
) => {
  const { teamId } = params;
  const { data, error } = await supabaseClient
    .from("request_table")
    .select(
      "request_id, request_date_created, request_status, request_team_member: request_team_member_id!inner(team_member_user: team_member_user_id(user_first_name, user_last_name, user_avatar)), request_form: request_form_id(form_name, form_description), request_signer: request_signer_table(request_signer_id, request_signer_status, request_signer: request_signer_signer_id(signer_is_primary_approver, signer_team_member: signer_team_member_id(team_member_user: team_member_user_id(user_first_name, user_last_name, user_avatar))))"
    )
    .eq("request_team_member.team_member_team_id", teamId);
  if (error) throw error;

  return data;
};

export const getUserActiveTeamId = async (
  supabaseClient: SupabaseClient<Database>,
  params: { userId: string }
) => {
  const { userId } = params;

  const { data, error } = await supabaseClient
    .from("user_table")
    .select("user_active_team_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data?.user_active_team_id) throw new Error("Active team not found.");

  return data.user_active_team_id;
};

export const getUserWithSignature = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    userId: string;
  }
) => {
  const { userId } = params;
  const { data, error } = await supabaseClient
    .from("user_table")
    .select("*, user_signature_attachment: user_signature_attachment_id(*)")
    .eq("user_id", userId)
    .single();
  if (error) throw error;
  return data;
};

export const checkUsername = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    username: string;
  }
) => {
  const { username } = params;
  const { data, error } = await supabaseClient
    .from("user_table")
    .select("user_username")
    .eq("user_username", username)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
};
