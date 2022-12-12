// * All database queries are written here para isang reference na lang.
// * Import lang form here then use in your components.
// * Refrences: https://supabase.com/docs/reference/javascript/typescript-support#type-hints

import { SupabaseClient, User } from "@supabase/supabase-js";
import { Database } from "./database.types";
import {
  FieldRow,
  FormRow,
  RequestResponseRow,
  RequestRow,
  RequestStatusEnum,
  RequestType,
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

// * Retrieve approver list by team.
export const retrieveApproverListByTeam = async (
  supabaseClient: SupabaseClient<Database>,
  userId: string,
  teamId: string
) => {
  const { data: approverList, error: approverListError } = await supabaseClient
    .from("team_role_table")
    .select("*, approver: user_id(*)")
    .or(`team_role.eq.admin, team_role.eq.owner`)
    .eq("team_id", teamId)
    .neq("user_id", userId);

  if (approverListError) throw approverListError;

  return approverList;
};
// * Type here
export type RetreivedApproverList = Awaited<
  ReturnType<typeof retrieveApproverListByTeam>
>;

// * Retrieve request draft by form.
export const retrieveRequestDraftByForm = async (
  supabaseClient: SupabaseClient<Database>,
  formId: string,
  userId: string
) => {
  const { data: requestDraft, error: requestDraftError } = await supabaseClient
    .from("request_table")
    .select("*")
    .eq("is_draft", true)
    .eq("form_table_id", formId)
    .eq("requested_by", userId)
    .maybeSingle();

  if (requestDraftError) throw requestDraftError;

  return requestDraft;
};
// * Type here
export type RetreivedRequestDraft = Awaited<
  ReturnType<typeof retrieveRequestDraftByForm>
>;

// * Retrieve request form by id.
export const retrieveRequestForm = async (
  supabaseClient: SupabaseClient<Database>,
  formId: string
) => {
  const { data: requestForm, error: requestFormError } = await supabaseClient
    .from("form_table")
    .select("*")
    .eq("form_id", formId)
    .single();

  if (requestFormError) throw requestFormError;

  return requestForm;
};
// * Type here
export type RetrievedRequestForm = Awaited<
  ReturnType<typeof retrieveRequestForm>
>;

// * Retrieve form field list.
export const retrieveFormFieldList = async (
  supabaseClient: SupabaseClient<Database>,
  formId: string
) => {
  const { data: formFieldList, error: formFieldListError } =
    await supabaseClient
      .from("field_table")
      .select("*")
      .eq("form_table_id", formId);

  if (formFieldListError) throw formFieldListError;

  return formFieldList;
};
// * Type here
export type RetrievedFormFields = Awaited<
  ReturnType<typeof retrieveFormFieldList>
>;

// * Retrieve request draft by request id.
export const retreivedRequestDraftByRequestId = async (
  supabaseClient: SupabaseClient<Database>,
  requestId: number
) => {
  const { data: requestDraft, error: requestDraftError } = await supabaseClient
    .from("request_table")
    .select("*, form: form_table_id(*)")
    .eq("request_id", requestId)
    .single();

  if (requestDraftError) throw requestDraftError;

  return requestDraft as RetrievedRequestDraftByRequestId;
};
// * Type here
export type RetrievedRequestDraftByRequestId = RequestRow & { form: FormRow };

// * Retrieve request response by request id.
export const retrieveRequestResponse = async (
  supabaseClient: SupabaseClient<Database>,
  requestId: number
) => {
  const { data: requestResponse, error: requestResponseError } =
    await supabaseClient
      .from("request_response_table")
      .select("*, field: field_id(*)")
      .eq("request_id", requestId);

  if (requestResponseError) throw requestResponseError;

  return requestResponse as RetrievedRequestReponse[];
};
// * Type here
export type RetrievedRequestReponse = RequestResponseRow & { field: FieldRow };

// * Update request response.
export const updateRequestReponse = async (
  supabaseClient: SupabaseClient<Database>,
  requestResponseList: {
    field_id: number;
    response_value: string;
    request_id: number;
  }[],
  draftId: number
) => {
  const { error: requestResponseError } = await supabaseClient
    .from("request_response_table")
    .upsert(requestResponseList)
    .eq("request_id", draftId);

  if (requestResponseError) throw requestResponseError;
};
// * Type here
export type UpdateRequestResponse = Awaited<
  ReturnType<typeof updateRequestReponse>
>;

// * Update request.
type RequestFieldsType = {
  requestor: string;
  date: string;
  title: string;
  behalf: string;
  description: string;
};
export const updateRequest = async (
  supabaseClient: SupabaseClient<Database>,
  selectedApprover: string,
  formData: RequestFieldsType,
  draftId: number
) => {
  const { error: requestError } = await supabaseClient
    .from("request_table")
    .update({
      approver_id: selectedApprover,
      request_created_at: `${new Date().toISOString()}`,
      request_title: formData.title,
      on_behalf_of: formData.behalf,
      request_description: formData.description,
      is_draft: false,
    })
    .eq("request_id", draftId);

  if (requestError) throw requestError;
};
// * Type here
export type UpdateRequest = Awaited<ReturnType<typeof updateRequest>>;

// * Save request.
export const saveRequest = async (
  supabaseClient: SupabaseClient<Database>,
  selectedApprover: string,
  formData: RequestFieldsType,
  userId: string,
  formId: number
) => {
  const { data: request, error: requestError } = await supabaseClient
    .from("request_table")
    .insert({
      approver_id: selectedApprover,
      requested_by: userId,
      form_table_id: formId,
      request_title: formData.title,
      on_behalf_of: formData.behalf,
      request_description: formData.description,
      is_draft: false,
    })
    .select()
    .single();

  if (requestError) throw requestError;
  return request;
};
// * Type here
export type SaveRequest = Awaited<ReturnType<typeof saveRequest>>;

// * Save request field.
export const saveRequestField = async (
  supabaseClient: SupabaseClient<Database>,
  requestResponse: {
    field_id: number;
    request_id: number;
    response_value: string;
  }[]
) => {
  const { error: requestResponseError } = await supabaseClient
    .from("request_response_table")
    .insert(requestResponse);

  if (requestResponseError) throw requestResponseError;
};
// * Type here
export type SaveRequestField = Awaited<ReturnType<typeof saveRequestField>>;

// * Retrieve request by request id.
export const retrieveRequest = async (
  supabaseClient: SupabaseClient<Database>,
  requestId: number
) => {
  const { data: request, error: requestError } = await supabaseClient
    .from("request_table")
    .select("*, owner: requested_by(*), approver: approver_id(*)")
    .eq("request_id", requestId)
    .single();

  if (requestError) throw requestError;
  return request as RequestType;
};
// * Type here
export type RetrievedRequest = RequestType;

// * Approve, Reject, or Send to Revision request by request id.
export const requestResponse = async (
  supabaseClient: SupabaseClient<Database>,
  requestId: number,
  response: RequestStatusEnum
) => {
  const { error: requestError } = await supabaseClient
    .from("request_table")
    .update({ request_status: response })
    .eq("request_id", requestId);

  if (requestError) throw requestError;
};
// * Type here
export type RequestResponse = Awaited<ReturnType<typeof requestResponse>>;

// * Approve, Reject, or Sent to Revision request by request id.
export const retrieveRequestList = async (
  supabaseClient: SupabaseClient<Database>,
  start: number,
  teamId: string,
  requestPerPage: number,
  selectedForm: string | null,
  status: string | null,
  search: string,
  isSearch: boolean,
  filter?: "all" | "sent" | "received",
  userId?: string
) => {
  let query = supabaseClient
    .from("request_table")
    .select(
      "*, form: form_table_id(*), approver: approver_id(*), owner: requested_by(*)"
    )
    .eq("is_draft", false)
    .eq("form.team_id", teamId)
    .range(start, start + requestPerPage - 1);

  let countQuery = supabaseClient
    .from("request_table")
    .select("*, form: form_table_id(*)")
    .eq("is_draft", false)
    .eq("form.team_id", teamId);

  if (filter === "received") {
    query = query.eq("approver_id", userId);
    countQuery = countQuery.eq("approver_id", userId);
  } else if (filter === "sent") {
    query = query.eq("requested_by", userId);
    countQuery = countQuery.eq("requested_by", userId);
  }

  if (selectedForm) {
    query = query.eq("form_table_id", selectedForm);
    countQuery = countQuery.eq("form_table_id", selectedForm);
  }
  if (status) {
    query = query.eq("request_status", status);
    countQuery = countQuery.eq("request_status", status);
  }
  if (search && isSearch) {
    query = query.or(
      `or(request_title.ilike.%${search}%, request_description.ilike.%${search}%)`
    );
    countQuery = query.or(
      `or(request_title.ilike.%${search}%, request_description.ilike.%${search}%)`
    );
  }
  const { data: requestList, error: requestListError } = await query;
  if (requestListError) throw requestListError;
  const { count: requestCount, error: requestCountError } = await countQuery;
  if (requestCountError) throw requestCountError;

  return {
    requestList: requestList as RequestType[],
    requestCount,
  };
};
// * Type here
export type RetrievedRequestList = Awaited<
  ReturnType<typeof retrieveRequestList>
>;

// * Retrieve request form by team.
export const retrieveRequestFormByTeam = async (
  supabaseClient: SupabaseClient<Database>,
  teamId: string
) => {
  const { data: requestFormList, error: requestFormListError } =
    await supabaseClient.from("form_table").select("*").eq("team_id", teamId);

  if (requestFormListError) throw requestFormListError;

  return requestFormList;
};

// * Type here
export type RetrievedRequestFormByTeam = Awaited<
  ReturnType<typeof retrieveRequestFormByTeam>
>;
