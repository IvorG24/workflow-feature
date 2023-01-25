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
  params: TeamTableInsert,
  createdBy: string
) => {
  // insert to team table
  // insert to team member table
  try {
    const { data: data1Data, error: data1Error } = await supabaseClient
      .from("team_table")
      .insert(params)
      .select()
      .single();
    if (data1Error) throw data1Error;

    const { data: data2Data, error: data2Error } = await supabaseClient
      .from("team_member_table")
      .insert({
        team_member_team_id: data1Data?.team_id,
        team_member_user_id: createdBy,
        team_member_member_role_id: "owner",
      })
      .select()
      .single();
    if (data2Error) throw data2Error;

    return {
      team_table: data1Data,
      team_member_table: data2Data,
    };
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
    const { data: data1Data, error: data1Error } = await supabaseClient
      .from("invitation_table")
      .insert({
        invitation_target_email: toUserEmail,
      })
      .select()
      .single();
    if (data1Error) throw data1Error;

    const { data: data2Data, error: data2Error } = await supabaseClient
      .from("team_invitation_table")
      .insert({
        team_invitation_created_by: fromUserId,
        team_invitation_team_id: teamId,
        team_invitation_invitation_id: data1Data?.invitation_id,
      })
      .select()
      .single();
    if (data2Error) throw data2Error;

    return {
      invitation_table: data1Data,
      team_invitation_table: data2Data,
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
    const { data: data1Data, error: data1Error } = await supabaseClient
      .from("notification_table")
      .insert({
        notification_content: content,
        notification_redirection_url: redirectionUrl,
      })
      .select()
      .single();
    if (data1Error) throw data1Error;

    const { data: data2Data, error: data2Error } = await supabaseClient
      .from("team_user_notification_table")
      .insert({
        team_user_notification_team_id: teamId,
        team_user_notification_user_id: toUserId,
        team_user_notification_notification_id: data1Data?.notification_id,
      })
      .select()
      .single();
    if (data2Error) throw data2Error;

    return {
      notification_table: data1Data,
      team_user_notification_table: data2Data,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type CreateNotification = Awaited<ReturnType<typeof createNotification>>;

export const getUserTeamList = async (
  supabaseClient: SupabaseClient<Database>,
  userId: string
) => {
  try {
    const { data, error } = await supabaseClient
      .from("team_member_view")
      .select()
      .eq("team_member_user_id", userId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type GetUserTeamList = Awaited<ReturnType<typeof getUserTeamList>>;

export const isUserOnboarded = async (
  supabaseClient: SupabaseClient<Database>,
  userId: string
) => {
  try {
    const promises = [
      supabaseClient
        .from("user_profile_table")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),
      supabaseClient
        .from("team_member_table")
        .select("*", { count: "exact", head: true })
        .eq("team_member_user_id", userId),
    ];

    const [userProfile, teamList] = await Promise.all(promises);

    if (userProfile.error) throw userProfile.error;
    if (teamList.error) throw teamList.error;

    if (!userProfile.count) return false;
    if (!teamList.count) return false;

    if (userProfile.count === 0) return false;
    if (teamList.count === 0) return false;

    return true;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type IsUserOnboarded = Awaited<ReturnType<typeof isUserOnboarded>>;

export const getTeamFormList = async (
  supabaseClient: SupabaseClient<Database>,
  teamName: string
) => {
  try {
    const { data, error } = await supabaseClient
      .from("request_form_template_distinct_view")
      .select()
      .eq("team_name", teamName);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type GetTeamFormList = Awaited<ReturnType<typeof getTeamFormList>>;
