// * All database queries are written here para isang reference na lang.
// * Import lang form here then use in your components.
// * Refrences: https://supabase.com/docs/reference/javascript/typescript-support#type-hints

import { SupabaseClient, User } from "@supabase/supabase-js";
import { Database } from "./database.types";
import {
  FieldRow,
  FieldTableRow,
  FieldTypeEnum,
  FormQuestion,
  FormRequest,
  FormRow,
  FormTableRow,
  FormTypeEnum,
  RequestCommentTableRow,
  RequestResponseRow,
  RequestRow,
  RequestStatusEnum,
  RequestType,
  TeamInvitationTableRow,
  TeamRoleEnum,
  TeamRoleTableRow,
  TeamTableRow,
  UserNotificationTableInsert,
  UserProfileRow,
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
      // username: "",
      // full_name: "",
      // avatar_url: "",
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
  const {
    data: teamRequestFormList,
    error: teamRequestFormLIstError,
    count,
  } = await supabaseClient
    .from("form_table")
    .select()
    .eq("team_id", teamId)
    .eq("form_type", "request");
  if (teamRequestFormLIstError) throw teamRequestFormLIstError;
  return { teamRequestFormList, count };
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
  const { data: form, error: formError } = await supabaseClient
    .from("form_table")
    .select("form_priority")
    .eq("form_id", formId)
    .single();

  if (formError) throw formError;

  const { data: formFieldList, error: formFieldListError } =
    await supabaseClient
      .from("field_table")
      .select("*")
      .eq("form_table_id", formId)
      .order("field_id", { ascending: false });

  if (formFieldListError) throw formFieldListError;

  const priority = form.form_priority as number[];
  return formFieldList.sort(
    (a, b) => priority.indexOf(a.field_id) - priority.indexOf(b.field_id)
  );
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
      "*, form: form_table_id!inner(*), approver: approver_id(*), owner: requested_by(*)"
    )
    .eq("is_draft", false)
    .eq("form.team_id", teamId)
    .range(start, start + requestPerPage - 1)
    .order("request_created_at", { ascending: false });

  let countQuery = supabaseClient
    .from("request_table")
    .select("*, form: form_table_id!inner(*)")
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

// * Request Form Builder start

// * Fetch empty form for users to fill out.
// * After fetching form with this function, call mapEmptyFormToReactDndRequestForm() then pass to form builder component.
export const fetchEmptyForm = async (
  supabaseClient: SupabaseClient<Database>,
  formId: number
) => {
  const { data: formTableRow, error: formTableRowError } = await supabaseClient
    .from("form_table")
    .select()
    .eq("form_id", formId)
    .single();

  if (formTableRowError) throw formTableRowError;

  // Fetch fields of form
  const { data: fieldTableRowList, error: fieldTableRowListError } =
    await supabaseClient
      .from("field_table")
      .select()
      .eq("form_table_id", formId);

  if (fieldTableRowListError) throw fieldTableRowListError;

  const priority = formTableRow.form_priority as number[];
  const sortedFieldTableRowList = fieldTableRowList.sort(
    (a, b) => priority.indexOf(a.field_id) - priority.indexOf(b.field_id)
  );

  return {
    formTableRow: formTableRow as FormTableRow | null,
    fieldTableRowList: sortedFieldTableRowList as FieldTableRow[] | null,
  };
};
// * Type here
export type FetchEmptyForm = Awaited<ReturnType<typeof fetchEmptyForm>>;

export const mapEmptyFormToReactDndRequestForm = async ({
  formTableRow,
  fieldTableRowList,
}: FetchEmptyForm) => {
  if (!formTableRow) throw new Error("Form not found");
  if (!fieldTableRowList) throw new Error("Fields not found");

  // Map emptyForm to reactDndRequestForm of type FormRequest.
  const reactDndRequestForm: FormRequest = { form_name: "", questions: [] };

  // Map form name to react dnd.
  reactDndRequestForm.form_name = formTableRow?.form_name as string;

  // Map questions to react dnd.
  fieldTableRowList.forEach((fieldTableRow) => {
    const formQuestion: FormQuestion = {
      data: {
        question: fieldTableRow.field_name as string,
        expected_response_type: fieldTableRow.field_type as string,
      },
      option: fieldTableRow.field_option?.map((option) => ({ value: option })),
    };
    reactDndRequestForm.questions.push(formQuestion);
  });

  return reactDndRequestForm;
};

// * Save built request form (react dnd) to database.
export const saveReactDndRequestForm = async (
  supabaseClient: SupabaseClient<Database>,
  formRequest: FormRequest,
  userId: string,
  teamId: string,
  formType: FormTypeEnum
) => {
  // Insert form name to form_table.
  const { data: formTableRow, error: formError } = await supabaseClient
    .from("form_table")
    .insert({
      form_name: formRequest.form_name,
      form_owner: userId,
      team_id: teamId,
      form_type: formType,
    })
    .select()
    .single();

  // Insert questions to field_table.
  const { data: fieldTableRowList, error: fieldError } = await supabaseClient
    .from("field_table")
    .insert(
      formRequest.questions.map((question) => ({
        field_name: question.data.question,
        field_type: question.data.expected_response_type as FieldTypeEnum,
        field_option: question.option?.map((option) => option.value),
        form_table_id: formTableRow?.form_id,
      }))
    )
    .select();

  if (formError || fieldError) throw formError || fieldError;
  return { formTableRow, fieldTableRowList };
};

// * Request Form Builder end

// * Update user profile information and upload user profile image if there's a new one.
export const updateUserProfile = async (
  supabaseClient: SupabaseClient<Database>,
  userId: string,
  fullName: string,
  avatar?: File | Blob | null
) => {
  if (avatar) {
    const { error: uploadUserProfileError } = await supabaseClient.storage
      .from("images")
      .upload(`user-profile/${userId}`, avatar, { upsert: true });

    if (uploadUserProfileError) throw uploadUserProfileError;

    const { data: uploadedProfileImageUrl } = supabaseClient.storage
      .from("images")
      .getPublicUrl(`user-profile/${userId}`);

    const {
      data: updatedUserProfileImage,
      error: updatedUserProfileImageError,
    } = await supabaseClient
      .from("user_profile_table")
      .update({
        full_name: fullName,
        avatar_url: `${
          uploadedProfileImageUrl.publicUrl
        }?indicator=${new Date()}`,
      })
      .eq("user_id", userId);

    if (updatedUserProfileImageError) throw updatedUserProfileImageError;

    return updatedUserProfileImage;
  } else {
    const { data: updatedUserProfile, error: updatedUserProfileError } =
      await supabaseClient
        .from("user_profile_table")
        .update({
          full_name: fullName,
        })
        .eq("user_id", userId);

    if (updatedUserProfileError) throw updatedUserProfileError;
    return updatedUserProfile;
  }
};

// * Type here
export type UpdatedUserProfile = Awaited<ReturnType<typeof updateUserProfile>>;

// * Upload and update team logo.
export const uploadTeamLogo = async (
  supabaseClient: SupabaseClient<Database>,
  teamId: string,
  image: Blob | File
) => {
  const { error: uploadTeamLogoError } = await supabaseClient.storage
    .from("images")
    .upload(`team-logo/${teamId}`, image);

  if (uploadTeamLogoError) throw uploadTeamLogoError;

  const { data: uploadedTeamLogoUrl } = supabaseClient.storage
    .from("images")
    .getPublicUrl(`team-logo/${teamId}`);

  const { data: updatedTeamLogo, error: updatedTeamLogoError } =
    await supabaseClient
      .from("team_table")
      .update({
        team_logo: uploadedTeamLogoUrl.publicUrl,
      })
      .eq("team_id", teamId);

  if (updatedTeamLogoError) throw updatedTeamLogoError;

  return updatedTeamLogo;
};

// * Type here
export type UpdateTeamLogo = Awaited<ReturnType<typeof uploadTeamLogo>>;

// * Check if user is already a member of the team.
export const isUserAlreadyAMemberOfTeam = async (
  supabaseClient: SupabaseClient<Database>,
  teamInvitationId: string,
  userId: string
) => {
  const { data, error } = await supabaseClient
    .from("team_role_table")
    .select()
    .eq("team_id", teamInvitationId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;

  return !!data;
};

// * Fetch team invitation.
export const fetchTeamInvitation = async (
  supabaseClient: SupabaseClient<Database>,
  teamInvitationId: string
) => {
  const { data, error } = await supabaseClient
    .from("team_invitation_table")
    .select(`*, team_table(*), source:invite_source(*)`)
    .eq("team_invitation_id", teamInvitationId)
    .maybeSingle();
  if (error) throw error;

  return data as FetchTeamInvitation;
};
// * Type here
export type FetchTeamInvitation = TeamInvitationTableRow & {
  team_table: TeamTableRow;
  source: UserProfileRow;
};

// * Fetch team owner and admins.
export const retrieveTeamOwnerAndAdmins = async (
  supabaseClient: SupabaseClient<Database>,
  teamId: string,
  userId: string
) => {
  const { data: ownerAndAdminList, error: ownerAndAdminListError } =
    await supabaseClient
      .from("team_role_table")
      .select("*")
      .or(`team_role.eq.admin, team_role.eq.owner`)
      .eq("team_id", teamId)
      .neq("user_id", userId);

  if (ownerAndAdminListError) throw ownerAndAdminListError;

  return ownerAndAdminList;
};

// * Type here
export type RetrievedTeamOwnerAndAdmins = Awaited<
  ReturnType<typeof retrieveTeamOwnerAndAdmins>
>;
// * Add comment on request.
export const retrieveRequestComments = async (
  supabaseClient: SupabaseClient<Database>,
  requestId: number
) => {
  const { data: requestComments, error: requestCommentsError } =
    await supabaseClient
      .from("request_comment_table")
      .select("*, owner: request_comment_by_id(*)")
      .eq("request_id", requestId)
      .order("request_comment_created_at", { ascending: true });
  if (requestCommentsError) throw requestCommentsError;
  return requestComments as RetrievedRequestComments[];
};

// * Type here
export type RetrievedRequestComments = RequestCommentTableRow & {
  owner: UserProfileTableRow;
};

// * Add comment on request.
export const createComment = async (
  supabaseClient: SupabaseClient<Database>,
  requestId: number,
  comment: string,
  userId: string
) => {
  const { data: createdComment, error: createdCommentError } =
    await supabaseClient
      .from("request_comment_table")
      .insert({
        request_comment: comment,
        request_id: requestId,
        request_comment_by_id: userId,
      })
      .select("*, owner: request_comment_by_id(*)")
      .single();
  if (createdCommentError) throw createdCommentError;
  return createdComment as RetrievedRequestComments;
};

// * Type here
export type CreateComment = Awaited<ReturnType<typeof createComment>>;

// * Delete comment on request.
export const deleteComment = async (
  supabaseClient: SupabaseClient<Database>,
  comment_id: number
) => {
  const { error: deletedCommentError } = await supabaseClient
    .from("request_comment_table")
    .delete()
    .eq("request_comment_id", comment_id);
  if (deletedCommentError) throw deletedCommentError;
};

// * Type here
export type DeletedComment = Awaited<ReturnType<typeof deleteComment>>;

// * Edit comment on request.
export const editComment = async (
  supabaseClient: SupabaseClient<Database>,
  comment_id: number,
  comment: string
) => {
  console.log(comment_id, comment);
  const { error: editedCommentError } = await supabaseClient
    .from("request_comment_table")
    .update({
      request_comment: comment,
      request_comment_is_edited: true,
    })
    .eq("request_comment_id", comment_id);
  if (editedCommentError) throw editedCommentError;
};

// * Type here
export type EditedComment = Awaited<ReturnType<typeof editComment>>;
