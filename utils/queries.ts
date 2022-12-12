// * All database queries are written here para isang reference na lang.
// * Import lang form here then use in your components.
// * Refrences: https://supabase.com/docs/reference/javascript/typescript-support#type-hints

import { SupabaseClient, User } from "@supabase/supabase-js";
import { Database } from "./database.types";
import {
  FormTypeEnum,
  TeamInvitationTableRow,
  TeamRoleEnum,
  TeamRoleTableRow,
  TeamTableRow,
  UserNotificationTableInsert,
  UserProfileTableRow,
} from "./types";

// * Creates or retrieve user if existing.
export const createOrRetrieveUser = async (
  supabaseClient: SupabaseClient<Database>,
  user: User
) => {
  const { data: retrievedUser, error: retrievedUserError } =
    await supabaseClient
      .from("user_profile_table")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
  if (retrievedUserError) throw retrievedUserError;
  if (retrievedUser) return retrievedUser;

  const { data: createdUser, error: createdUserError } = await supabaseClient
    .from("user_profile_table")
    .insert({
      user_id: user.id,
      username: "",
      full_name: "",
      avatar_url: "",
      email: user.email,
    })
    .select()
    .single();
  if (createdUserError) throw createdUserError;
  return createdUser;
};
// * Type here
export type CreatedOrRetrievedUser = Awaited<
  ReturnType<typeof createOrRetrieveUser>
>;

// * Creates a team or retrieve user team list if existing.
export const createOrRetrieveUserTeamList = async (
  supabaseClient: SupabaseClient<Database>,
  user: User
) => {
  const retrievedUserTeamList = await retrieveUserTeamList(
    supabaseClient,
    user.id
  );
  if (retrievedUserTeamList && retrievedUserTeamList.length > 0)
    return retrievedUserTeamList;

  const createdUserTeam = await createUserTeam(supabaseClient, user.id);
  return [createdUserTeam];
};
// * Type here
export type CreateOrRetrieveUserTeamList = Awaited<
  ReturnType<typeof createOrRetrieveUserTeamList>
>;

// * Retrieve user's team list..
export const retrieveUserTeamList = async (
  supabaseClient: SupabaseClient<Database>,
  userId: string
) => {
  const { data: retrievedUserTeamList, error: retrievedUserTeamListError } =
    await supabaseClient
      .from("team_role_table")
      .select(`*, team_table(*)`)
      .eq("user_id", userId);
  if (retrievedUserTeamListError) throw retrievedUserTeamListError;
  return retrievedUserTeamList as RetrieveUserTeamList;
};
// * Type here
// TODO: I'll go back to this. For now, the manual typing is safer.
// ! This approach is faulty when foreign tables are included. Ask Choy.
// export type RetrieveUserTeamList = Awaited<
//   ReturnType<typeof retrieveUserTeamList>
// >;
export type RetrieveUserTeamList = (TeamRoleTableRow & {
  team_table: TeamTableRow;
})[];

// * Create team for the user.
export const createUserTeam = async (
  supabaseClient: SupabaseClient<Database>,
  userId: string,
  teamName = "My Team"
) => {
  const { data: createdTeam, error: createdTeamError } = await supabaseClient
    .from("team_table")
    .insert({
      team_name: teamName,
      user_id: userId,
    })
    .select()
    .single();
  if (createdTeamError) throw createdTeamError;

  const { data: createdTeamRole, error: createdTeamRoleError } =
    await supabaseClient
      .from("team_role_table")
      .insert({
        user_id: userId,
        team_id: createdTeam.team_id,
        team_role: "owner",
      })
      .select(`*, team_table(*)`)
      .single();
  if (createdTeamRoleError) throw createdTeamRoleError;

  return createdTeamRole as CreateUserTeam;
};
// * Type here
// export type CreateUserTeam = Awaited<ReturnType<typeof createUserTeam>>;
export type CreateUserTeam = TeamRoleTableRow & {
  team_table: TeamTableRow;
};

// * Fetch request form list under a team.
export const fetchTeamRequestFormList = async (
  supabaseClient: SupabaseClient<Database>,
  teamId: string
) => {
  const { data: teamRequestFormList, error: teamRequestFormLIstError } =
    await supabaseClient
      .from("form_table")
      .select()
      .eq("team_id", teamId)
      .eq("form_type", "request");
  if (teamRequestFormLIstError) throw teamRequestFormLIstError;
  return teamRequestFormList;
};
// * Type here
export type FetchTeamRequestFormList = Awaited<
  ReturnType<typeof fetchTeamRequestFormList>
>;

// * User profile information.
export const fetchUserProfile = async (
  supabaseClient: SupabaseClient<Database>,
  userId: string
) => {
  const { data: userProfile, error: userProfileError } = await supabaseClient
    .from("user_profile_table")
    .select()
    .eq("user_id", userId)
    .single();
  if (userProfileError) throw userProfileError;
  return userProfile;
};
// * Type here
export type FetchUserProfile = Awaited<ReturnType<typeof fetchUserProfile>>;

// * Fetch members of a team.
export const fetchTeamMemberList = async (
  supabaseClient: SupabaseClient<Database>,
  teamId: string
) => {
  const { data: teamMemberList, error: teamMemberListError } =
    await supabaseClient
      .from("team_role_table")
      .select(`*, user_profile_table(*)`)
      .eq("team_id", teamId);
  if (teamMemberListError) throw teamMemberListError;
  return teamMemberList as unknown as FetchTeamMemberList;
};
// * Type here
export type FetchTeamMemberList = (TeamRoleTableRow & {
  user_profile_table: UserProfileTableRow;
})[];

// * Update role user in a team.
export const updateTeamMemberRole = async (
  supabaseClient: SupabaseClient<Database>,
  newRole: TeamRoleEnum,
  userId: string
) => {
  const { error: updateTeamMemberRoleError } = await supabaseClient
    .from("team_role_table")
    .update({ team_role: newRole })
    .eq("user_id", userId);

  if (updateTeamMemberRoleError) throw updateTeamMemberRoleError;
  return updateTeamMemberRoleError;
};

// * Fetch notifications of a user in a team.
// If no form_type is specified, all current user notifications will be returned regardless of form type.
// If no team_id is specified, all current user notifications will be returned regardless of team id.
export const fetchUserNotificationList = async (
  supabaseClient: SupabaseClient<Database>,
  userId: string,
  teamId?: string,
  formType?: FormTypeEnum
) => {
  // https://supabase.com/docs/reference/javascript/using-filters#conditional-chaining
  let query = supabaseClient
    .from("user_notification_table")
    .select()
    .eq("user_id", userId);

  if (teamId) {
    query = query.eq("team_id", teamId);
  }

  if (formType) {
    query = query.eq("form_type", formType);
  }

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) throw error;
  return data;
};
// * Type here
export type FetchUserNotificationList = Awaited<
  ReturnType<typeof fetchUserNotificationList>
>;

// * Create user notification in a team.
export const createUserNotification = async (
  supabaseClient: SupabaseClient<Database>,
  notificationInsert: UserNotificationTableInsert[]
) => {
  const { data, error } = await supabaseClient
    .from("user_notification_table")
    .insert(notificationInsert)
    .select();
  if (error) throw error;
  return data;
};
// * Type here
export type CreateUserNotification = Awaited<
  ReturnType<typeof createUserNotification>
>;

// * Read user notification.
export const readUserNotification = async (
  supabaseClient: SupabaseClient<Database>,
  notificationId: string
) => {
  const { error } = await supabaseClient
    .from("user_notification_table")
    .update({ is_read: true })
    .eq("notification_id", notificationId);
  if (error) throw error;
  return error;
};

// * Accept user invitation using teamInvitationId.
// Verify first if the invite_source is equal to the userId parameter.
// If the invite_source is equal to the userId parameter, the invitation will be accepted.
// This function will create a new team_role_table row.
export const acceptTeamInvitation = async (
  supabaseClient: SupabaseClient<Database>,
  teamInvitationId: number,
  user: User //* Pass const user = useUser(); here.
) => {
  // Fetch the team invitation.
  const { data, error } = await supabaseClient
    .from("team_invitation_table")
    .select()
    .eq("team_invitation_id", teamInvitationId)
    .eq("invite_target", user.email)
    .maybeSingle();

  // Check if invitation is valid.
  const { data: isInvitationValidData, error: isInvitationValidError } =
    await supabaseClient.rpc("check_if_invitation_is_valid", {
      invitation_id: teamInvitationId,
    });

  if (error || isInvitationValidError) throw error;
  if (!data) throw new Error("Invitation not found"); // If invitation does not exist in database, throw error.
  if (!isInvitationValidData) throw new Error("Invitation not valid"); // If invitation is already accepted or expired, throw error.

  // Add the new member to the team with the role of member.
  if (data) {
    const { error: teamRoleError } = await supabaseClient
      .from("team_role_table")
      .insert({
        team_id: data.team_id as string,
        user_id: user.id,
        team_role: "member",
      })
      .select();
    if (teamRoleError) throw teamRoleError;
  }
};

// * Create team invitations.
export const createTeamInvitation = async (
  supabaseClient: SupabaseClient<Database>,
  teamId: string,
  inviteSource: string,
  inviteTargetList: string[] //* Array of user emails.
) => {
  const { data, error } = await supabaseClient
    .from("team_invitation_table")
    .insert(
      inviteTargetList.map((inviteTarget) => ({
        team_id: teamId,
        invite_source: inviteSource,
        invite_target: inviteTarget,
      }))
    )
    .select(`*, team_table(*)`);
  if (error) throw error;
  return data as CreateTeamInvitation;
};
// * Type here
export type CreateTeamInvitation = (TeamInvitationTableRow & {
  team_table: TeamTableRow;
})[];

// * Returns only user id list of registered users from an email list.
export const getUserIdListFromEmailList = async (
  supabaseClient: SupabaseClient<Database>,
  emailList: string[]
) => {
  const { data, error } = await supabaseClient.rpc(
    "get_user_id_list_from_email_list",
    { email_list: emailList }
  );

  if (error) throw error;
  if (!data) return [];

  // Remove null elements.
  const dataFiltered = data.filter((userIdWithEmail) => userIdWithEmail);
  if (dataFiltered.length === 0) return [];

  const dataRedefined = data as unknown as string[];

  const userIdWithEmailList = dataRedefined.map((userIdWithEmail) => {
    const [userId, userEmail] = userIdWithEmail.split(",");
    return { userId, userEmail };
  });

  return userIdWithEmailList as GetUserIdListFromEmailList;
};
export type GetUserIdListFromEmailList = {
  userId: string;
  userEmail: string;
}[];
