// * All database queries are written here para isang reference na lang.
// * Import lang form here then use in your components.
// * Refrences: https://supabase.com/docs/reference/javascript/typescript-support#type-hints

import { SupabaseClient, User } from "@supabase/supabase-js";
import { Database } from "./database.types";
import {
  TeamRoleEnum,
  TeamRoleTableRow,
  TeamTableRow,
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
// TODO: I'll go back to this. For now, the typing works fine.
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

export const updateTeamMemberRole = async (
  supabaseClient: SupabaseClient<Database>,
  newRole: TeamRoleEnum,
  memberId: string
) => {
  const { error: updateTeamMemberRoleError } = await supabaseClient
    .from("team_role_table")
    .update({ team_role: newRole })
    .eq("user_id", memberId);

  if (updateTeamMemberRoleError) throw updateTeamMemberRoleError;
  return updateTeamMemberRoleError;
};
