import { SupabaseClient } from "@supabase/supabase-js";
import {
  Database,
  TeamMemberTableInsert,
  TeamTableInsert,
  UserProfileTableInsert,
} from "./types";

export const getFormTemplateNameList = async (
  supabaseClient: SupabaseClient<Database>,
  teamId: string
) => {
  try {
    const { data, error } = await supabaseClient
      .from("request_form_template_distinct_view")
      .select("form_id, form_name")
      .eq("team_id", teamId);
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type GetFormTemplateNameList = Awaited<
  ReturnType<typeof getFormTemplateNameList>
>;

export const getUserProfile = async (
  supabaseClient: SupabaseClient<Database>,
  userId: string
) => {
  try {
    const { data, error } = await supabaseClient
      .from("user_profile_table")
      .select()
      .eq("user_id", userId);
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type GetUserProfile = Awaited<ReturnType<typeof getUserProfile>>;

export const createUserProfile = async (
  supabaseClient: SupabaseClient<Database>,
  params: UserProfileTableInsert
) => {
  try {
    const { data, error } = await supabaseClient
      .from("user_profile_table")
      .insert(params)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type CreateUserProfile = Awaited<ReturnType<typeof createUserProfile>>;

export const createTeam = async (
  supabaseClient: SupabaseClient<Database>,
  params: TeamTableInsert
) => {
  try {
    const { data, error } = await supabaseClient
      .from("team_table")
      .insert(params)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type CreateTeam = Awaited<ReturnType<typeof createTeam>>;

export const addTeamMember = async (
  supabaseClient: SupabaseClient<Database>,
  params: TeamMemberTableInsert
) => {
  try {
    const { data, error } = await supabaseClient
      .from("team_member_table")
      .insert(params)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type AddTeamMember = Awaited<ReturnType<typeof addTeamMember>>;

export const inviteUserToTeam = async (
  supabaseClient: SupabaseClient<Database>,
  fromUserId: string,
  toUserEmail: string,
  teamId: string
) => {
  try {
    const { data: params1Data, error: params1Error } = await supabaseClient
      .from("invitation_table")
      .insert({
        invitation_target_email: toUserEmail,
      })
      .select()
      .single();
    if (params1Error) throw params1Error;

    const { data: params2Data, error: params2Error } = await supabaseClient
      .from("team_invitation_table")
      .insert({
        team_invitation_created_by: fromUserId,
        team_invitation_team_id: teamId,
        team_invitation_invitation_id: params1Data?.invitation_id,
      })
      .select()
      .single();
    if (params2Error) throw params2Error;

    return {
      invitation_table: params1Data,
      team_invitation_table: params2Data,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type InviteUserToTeam = Awaited<ReturnType<typeof inviteUserToTeam>>;

export const createNotification = async (
  supabaseClient: SupabaseClient<Database>,
  content: string,
  redirectionUrl: string,
  toUserId: string,
  teamId: string | null
) => {
  try {
    const { data: params1Data, error: params1Error } = await supabaseClient
      .from("notification_table")
      .insert({
        notification_content: content,
        notification_redirection_url: redirectionUrl,
      })
      .select()
      .single();
    if (params1Error) throw params1Error;

    const { data: params2Data, error: params2Error } = await supabaseClient
      .from("team_user_notification_table")
      .insert({
        team_user_notification_team_id: teamId,
        team_user_notification_user_id: toUserId,
        team_user_notification_notification_id: params1Data?.notification_id,
      })
      .select()
      .single();
    if (params2Error) throw params2Error;

    return {
      notification_table: params1Data,
      team_user_notification_table: params2Data,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type CreateNotification = Awaited<ReturnType<typeof createNotification>>;


