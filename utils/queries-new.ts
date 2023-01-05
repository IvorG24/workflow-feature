// * All database queries are written here para isang reference na lang.
// * Import lang form here then use in your components.
// * Refrences: https://supabase.com/docs/reference/javascript/typescript-support#type-hints

import { SupabaseClient, User } from "@supabase/supabase-js";
import { getFileUrl } from "./file";
import {
  ApproverList,
  Database,
  FieldIdResponseKeyValue,
  FormQuestion,
  FormRequest,
  InvitationTableInsert,
  NotificationTableInsert,
  RequestFieldType,
  RequestFormFactViewRow,
  RequestRequestApproverViewRow,
  RequestStatus,
  ResponseList,
  TeamInvitationTableInsert,
  TeamMemberRole,
  TeamMemberTableInsert,
  TeamMemberViewRow,
  TeamTableInsert,
  TeamTableUpdate,
  TeamUserNotificationTableInsert,
  UserProfileTableUpdate,
} from "./types-new";

// New Queries for the new Formsly Snowflake Schema.
// ✅ Create or retrieve a user profile.
// ✅ Create or retrieve a user team list.
// ✅ Get current user team list (Members included).
// ✅ Get a team (Members included).
// ✅ Get form template list of a team.
// ✅ Get form template.
// ✅ Get request list of a team.
// ✅ Get a request.
// ✅ Get a team invitation.
// ✅ Get a team invitation list of a team.
// ✅ Create team invitation.
// ✅ Accept team invitation.
// ✅ Update team member role.
// ✅ Read notification.
// ✅ Build form template.
// ✅ Update form template order.
// ✅ Update user profile (Uploading should happen outside this function. New filepath is the only one that should be passed here.).
// ✅ Update team information (Uploading should happen outside this function. New filepath is the only one that should be passed here.).
// ✅ Create request (Draft or not).
// ✅ Create request comment.
// ✅ Update request comment.
// ✅ Delete request comment.
// ✅ Delete pending request.
// ✅ Create request draft.
// ✅ Update request draft.
// ✅ Get request status.
// ✅ Update request status.
// ✅ Update a team member role.
// ✅ Build form template.
// ✅ Create request (draft or not).
// ✅ Update request draft.
// ✅ Save request draft.
// ✅ Get team approver list.
// ✅ Get team purchaser list.
// ✅ Get team owner.
// ✅ Get team admin list.
// ✅ Get Team Member role of a user in a team.
// ✅ Generate lookup table for request attachment url list.
// ✅ Generate lookup table for team member avatar url list.
// ✅ Generate lookup table for user team logo url list.
// ✅ Create team.
// ✅ Get notification list.
// ✅ Create notification.
// ✅ Get user id list from email list.
// ✅ Is user a member of a team.
// ✅ Get a user profile.
// ✅ Map GetFormTemplate to FormRequest.
// ✅ Get request comment list.
// ✅ Get request main status list.
// ✅ Transform request to React Dnd.

// - Create or retrieve a user profile.
export const createOrRetrieveUserProfile = async (
  supabaseClient: SupabaseClient<Database>,
  user: User
) => {
  const { data, error } = await supabaseClient
    .from("user_profile_table")
    .select()
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw error;
  if (data) return data;
  if (!data) {
    const { data, error } = await supabaseClient
      .from("user_profile_table")
      .insert({
        user_id: user.id,
        user_email: user.email,
        username: user.email?.split("@")[0],
        user_first_name: user.email?.split("@")[0],
        user_last_name: user.email?.split("@")[0],
      })
      .select()
      .single();

    if (error) throw error;
    if (data) return data;
  }
};
export type CreateOrRetrieveUserProfile = Awaited<
  ReturnType<typeof createOrRetrieveUserProfile>
>;

// - Create or retrieve a user team list.
export const createOrRetrieveUserTeamList = async (
  supabaseClient: SupabaseClient<Database>,
  userId: string
) => {
  const { data, error } = await supabaseClient
    .from("team_member_view")
    .select()
    .eq("user_id", userId)
    .order("team_member_id", { ascending: false });

  if (error) throw error;
  if (data && data.length > 0) return data;

  const { data: teamData, error: teamError } = await supabaseClient
    .from("team_table")
    .insert({
      team_name: `my team ${userId}`,
    })
    .select()
    .single();

  if (teamError) throw teamError;
  if (!teamData) throw new Error("No default team created.");

  const { error: insertError } = await supabaseClient
    .from("team_member_table")
    .insert({
      team_member_team_id: teamData.team_id,
      team_member_user_id: userId,
      team_member_member_role_id: "owner",
    });

  if (insertError) throw insertError;

  const { data: teamMemberViewData, error: teamMemberViewError } =
    await supabaseClient
      .from("team_member_view")
      .select()
      .eq("user_id", userId)
      .order("team_member_id", { ascending: false });
  if (teamMemberViewError) throw teamMemberViewError;
  if (teamMemberViewData) return teamMemberViewData;
};
export type CreateOrRetrieveUserTeamList = Awaited<
  ReturnType<typeof createOrRetrieveUserTeamList>
>;

// - Get current user team list.
export const getCurrentUserTeamList = async (
  supabaseClient: SupabaseClient<Database>,
  userId: string
) => {
  const { data, error } = await supabaseClient
    .from("team_member_view")
    .select()
    .eq("user_id", userId)
    .order("team_member_id", { ascending: false });

  if (error) throw error;
  if (data) return data;
};
export type GetCurrentUserTeamList = Awaited<
  ReturnType<typeof getCurrentUserTeamList>
>;

// - Get a team.
export const getTeam = async (
  supabaseClient: SupabaseClient<Database>,
  teamId: string
) => {
  const { data, error } = await supabaseClient
    .from("team_member_view")
    .select()
    .eq("team_id", teamId);

  if (error) throw error;
  if (data) return data;
};
export type GetTeam = Awaited<ReturnType<typeof getTeam>>;

// - Get team approver list.
// Approver if TeamMemberRole is "owner", "admin" or "approver".
export const getTeamApproverList = async (
  supabaseClient: SupabaseClient<Database>,
  teamId: string
) => {
  const { data, error } = await supabaseClient
    .from("team_member_view")
    .select()
    .eq("team_id", teamId)
    .in("member_role_id", ["owner", "admin", "approver"]);

  if (error) throw error;
  if (data) return data;
};
export type GetTeamApproverList = Awaited<
  ReturnType<typeof getTeamApproverList>
>;

// - Get team purchaser list.
// Purchaser if TeamMemberRole is "purchaser".
export const getTeamPurchaserList = async (
  supabaseClient: SupabaseClient<Database>,
  teamId: string
) => {
  const { data, error } = await supabaseClient
    .from("team_member_view")
    .select()
    .eq("team_id", teamId)
    .eq("member_role_id", "purchaser");

  if (error) throw error;
  if (data) return data;
};
export type GetTeamPurchaserList = Awaited<
  ReturnType<typeof getTeamPurchaserList>
>;

// - Get team owner.
// Owner if TeamMemberRole is "owner".
export const getTeamOwner = async (
  supabaseClient: SupabaseClient<Database>,
  teamId: string
) => {
  const { data, error } = await supabaseClient
    .from("team_member_view")
    .select()
    .eq("team_id", teamId)
    .eq("member_role_id", "owner")
    .single();

  if (error) throw error;
  if (data) return data;
};

// - Get team admin list.
// Admin if TeamMemberRole is "owner" or "admin".
export const getTeamAdminList = async (
  supabaseClient: SupabaseClient<Database>,
  teamId: string
) => {
  const { data, error } = await supabaseClient
    .from("team_member_view")
    .select()
    .eq("team_id", teamId)
    .in("member_role_id", ["owner", "admin"]);

  if (error) throw error;
  if (data) return data;
};

// - Get form template list of a team.
export const getTeamFormTemplateList = async (
  supabaseClient: SupabaseClient<Database>,
  teamId: string
) => {
  const { data, error } = await supabaseClient
    .from("request_form_template_view")
    .select()
    .eq("team_id", teamId);

  if (error) throw error;
  if (data) return data;
};
export type GetTeamFormTemplateList = Awaited<
  ReturnType<typeof getTeamFormTemplateList>
>;
// - Get form template.
export const getFormTemplate = async (
  supabaseClient: SupabaseClient<Database>,
  formTemplateId: number
) => {
  const { data, error } = await supabaseClient
    .from("request_form_template_view")
    .select()
    .eq("form_fact_form_id", formTemplateId);
  if (error) throw error;
  if (data) return data;
};
export type GetFormTemplate = Awaited<ReturnType<typeof getFormTemplate>>;

// Transform GetFormTemplate (From database view) to FormRequest (React DND).
export const transformFormTemplateToReactDndFormRequest = (
  formTemplate: NonNullable<GetFormTemplate>
) => {
  let formRequest: FormRequest;

  const order = formTemplate[0].order_field_id_list as number[];

  // Sort formTemplate by form_fact_field_id and order.
  formTemplate.sort((a, b) => {
    if (
      order.indexOf(a.form_fact_field_id as number) <
      order.indexOf(b.form_fact_field_id as number)
    )
      return -1;
    if (
      order.indexOf(a.form_fact_field_id as number) >
      order.indexOf(b.form_fact_field_id as number)
    )
      return 1;
    return 0;
  });

  if (formTemplate && formTemplate.length > 0) {
    formRequest = {
      form_id: formTemplate[0].form_fact_form_id as number,
      form_name: formTemplate[0].form_name as string,
      questions: formTemplate.map((formTemplateItem) => {
        return {
          fieldId: formTemplateItem.form_fact_field_id as number,
          isRequired: formTemplateItem.field_is_required as boolean,
          fieldTooltip: formTemplateItem.field_tooltip as string,
          data: {
            question: formTemplateItem.field_name as string,
            expected_response_type:
              formTemplateItem.request_field_type as RequestFieldType,
          },
          option: formTemplateItem.field_options
            ? formTemplateItem.field_options.map((optionItem) => {
                return {
                  value: optionItem,
                };
              })
            : undefined,
        };
      }),
    };
  } else {
    formRequest = {
      form_name: "",
      questions: [],
    };
  }

  return formRequest;
};
export type TransformFormTemplateToReactDndFormRequest = ReturnType<
  typeof transformFormTemplateToReactDndFormRequest
>;

// - Get request list of a team.
export type GetTeamRequestListParams = {
  teamId: string;
  userId: string;
  pageSize?: number;
  pageNumber?: number;
  formId?: number;
  requestStatus?: RequestStatus;
  keyword?: string;
  direction?: "received" | "sent";
};

export const getTeamRequestList = async (
  supabaseClient: SupabaseClient<Database>,
  params: GetTeamRequestListParams
) => {
  const {
    userId,
    formId,
    requestStatus,
    keyword,
    direction,
    teamId,
    pageSize,
    pageNumber,
  } = params;

  let query = supabaseClient
    .from("request_form_fact_view")
    .select()
    .eq("team_id", teamId)
    .not("request_id", "is", null)
    .not("response_id", "is", null)
    .not("request_is_draft", "is", true)
    .not("request_is_disabled", "is", true);

  if (formId) {
    query = query.eq("form_fact_form_id", formId);
  }

  if (keyword) {
    query = query.or(
      `response_value.ilike.%${keyword}%, request_title.ilike.%${keyword}%, request_description.ilike.%${keyword}%`
    );
  }

  if (requestStatus) {
    query = query.eq("form_fact_request_status_id", requestStatus);
  }

  if (direction === "sent") {
    query = query.eq("form_fact_user_id", userId);
  }

  if (direction === "received") {
    // Query from request_request_approver_table where userId === rerequest_request_approver_user_id

    const { data, error } = await supabaseClient
      .from("request_request_approver_view")
      .select("request_id")
      .eq("request_approver_user_id", userId)
      .is("request_is_disabled", false);

    if (error) throw error;

    if (!data) return [];
    if (data && data.length === 0) return [];

    const receivedRequestIdList = data.map((request) => request.request_id);

    query = query.in("form_fact_request_id", receivedRequestIdList);
  }

  if (pageSize && pageNumber) {
    query = query.range(pageNumber, pageNumber + pageSize - 1);
  }

  const { data, error } = await query.order("form_fact_request_id", {
    ascending: false,
  });

  if (error) throw error;

  return data;
};
export type GetTeamRequestList = Awaited<ReturnType<typeof getTeamRequestList>>;

// - Get a request.
export const getRequest = async (
  supabaseClient: SupabaseClient<Database>,
  requestId: number
) => {
  const { data, error } = await supabaseClient
    .from("request_form_fact_view")
    .select()
    .eq("request_id", requestId)
    .is("request_is_draft", false)
    .is("request_is_disabled", false);

  if (error) throw error;
  if (data) return data;
};
export type GetRequest = Awaited<ReturnType<typeof getRequest>>;

// - transformRequestToReactDnd
export const transformRequestToReactDnd = (
  request: GetRequest
): FormRequest => {
  const formRequest: FormRequest = {
    form_name: request && request[0].form_name ? request[0].form_name : "",
    questions: request
      ? request.map((formTemplateItem) => {
          return {
            fieldId: formTemplateItem.field_id as number,
            isRequired: formTemplateItem.field_is_required as boolean,
            fieldTooltip: formTemplateItem.field_tooltip as string,
            data: {
              question: formTemplateItem.field_name as string,
              expected_response_type:
                formTemplateItem.request_field_type as RequestFieldType,
            },
            option: formTemplateItem.field_options
              ? formTemplateItem.field_options.map((optionItem) => {
                  return {
                    value: optionItem,
                  };
                })
              : undefined,
          };
        })
      : [],
  };

  return formRequest;
};
export type TransformRequestToReactDnd = ReturnType<
  typeof transformRequestToReactDnd
>;

// - Get a team invitation.
export const getTeamInvitation = async (
  supabaseClient: SupabaseClient<Database>,
  teamInvitationId: string
) => {
  const { data, error } = await supabaseClient
    .from("team_invitation_view")
    .select()
    .eq("team_invitation_id", teamInvitationId)
    .maybeSingle();

  if (error) throw error;
  if (data) return data;
};
export type GetTeamInvitation = Awaited<ReturnType<typeof getTeamInvitation>>;

// - Get a team invitation list of a team.
export const getTeamInvitationList = async (
  supabaseClient: SupabaseClient<Database>,
  teamId: string
) => {
  const { data, error } = await supabaseClient
    .from("team_invitation_view")
    .select()
    .eq("team_id", teamId);

  if (error) throw error;
  if (data) return data;
};
export type GetTeamInvitationList = Awaited<
  ReturnType<typeof getTeamInvitationList>
>;

// - Create team invitation.
export const createTeamInvitation = async (
  supabaseClient: SupabaseClient<Database>,
  teamId: string,
  userId: string,
  targetEmail: string[]
) => {
  const invitationInsertInput: InvitationTableInsert[] = targetEmail.map(
    (email) => ({
      invitation_target_email: email,
    })
  );
  const { data: invitationData, error } = await supabaseClient
    .from("invitation_table")
    .insert(invitationInsertInput)
    .select();
  if (error) throw error;
  if (invitationData) {
    const teamInvitationInsertInput: TeamInvitationTableInsert[] =
      invitationData.map((invitation) => ({
        team_invitation_created_by: userId,
        team_invitation_team_id: teamId,
        team_invitation_invitation_id: invitation.invitation_id,
      }));
    const { error } = await supabaseClient
      .from("team_invitation_table")
      .insert(teamInvitationInsertInput);
    if (error) throw error;
  }

  return invitationData;
};

// - Accept team invitation.
export const acceptTeamInvitation = async (
  supabaseClient: SupabaseClient<Database>,
  teamInvitationId: number,
  user: User
) => {
  // Check first using team_invitation_view if the invitation is valid.
  const { data: invitationData, error } = await supabaseClient
    .from("team_invitation_view")
    .select()
    .eq("team_invitation_id", teamInvitationId)
    .eq("invitation_target_email", user.email)
    .single();

  if (error) throw error;
  if (invitationData) {
    const { error } = await supabaseClient.from("team_member_table").insert({
      team_member_user_id: user.id,
      team_member_team_id: invitationData.team_invitation_team_id,
      team_member_member_role_id: "member",
    });

    if (error) throw error;
  }
};

// - Update a team member role.
export const updateTeamMemberRole = async (
  supabaseClient: SupabaseClient<Database>,
  teamId: string,
  userId: string,
  role: TeamMemberRole
) => {
  const { error } = await supabaseClient
    .from("team_member_table")
    .update({ team_member_member_role_id: role })
    .eq("team_member_team_id", teamId)
    .eq("team_member_user_id", userId);

  if (error) throw error;
};

// - Get notification list.
export const getNotificationList = async (
  supabaseClient: SupabaseClient<Database>,
  userId: string,
  teamId?: string
) => {
  let query = supabaseClient
    .from("team_user_notification_view")
    .select()
    .eq("user_id", userId);

  if (teamId) {
    query = query.eq("team_user_notification_team_id", teamId);
  } else {
    query = query.is("team_user_notification_team_id", null);
  }
  query.order("team_user_notification_id", { ascending: false });

  const { data, error } = await query;

  if (error) throw error;
  if (data) return data;
};
export type GetNotificationList = Awaited<
  ReturnType<typeof getNotificationList>
>;

// - Read notification.
export const readNotification = async (
  supabaseClient: SupabaseClient<Database>,
  notificationId: string
) => {
  const { error } = await supabaseClient
    .from("notification_table")
    .update({ notification_is_read: true })
    .eq("notification_id", notificationId);

  if (error) throw error;
};

// - Update form template order.
export const updateFormTemplate = async (
  supabaseClient: SupabaseClient<Database>,
  formTemplateId: number,
  questionList: FormQuestion[]
) => {
  try {
    const order = questionList.map((question) => question.fieldId as number);

    const { data: orderIdData, error } = await supabaseClient
      .from("request_form_fact_table")
      .select("form_fact_order_id")
      .eq("form_fact_form_id", formTemplateId)
      .limit(1)
      .single();
    if (error) throw error;
    if (orderIdData) {
      const { error: updateOrderError } = await supabaseClient
        .from("request_order_table")
        .update({ order_field_id_list: order })
        .eq("order_id", orderIdData.form_fact_order_id);
      if (updateOrderError) throw updateOrderError;
    }
    // Loop per question and update the tooltip using Promise.all.
    const promises = questionList.map((question) =>
      supabaseClient
        .from("request_field_table")
        .update({
          field_tooltip: question.fieldTooltip,
          field_is_required: question.isRequired,
        })
        .eq("field_id", question.fieldId)
    );
    const resultList = await Promise.all(promises);
    console.log("resultList", JSON.stringify(resultList, null, 2));
  } catch {
    throw new Error("Error updating form template.");
  }
};

// - Create request comment.
export const createRequestComment = async (
  supabaseClient: SupabaseClient<Database>,
  commentContent: string,
  userId: string,
  requestId: number
) => {
  const { data: commentData, error } = await supabaseClient
    .from("request_comment_table")
    .insert({ comment_content: commentContent })
    .select()
    .single();
  if (error) throw error;
  if (commentData) {
    const { error: insertCommentError } = await supabaseClient
      .from("request_request_user_comment_table")
      .insert({
        user_request_comment_user_id: userId,
        user_request_comment_request_id: requestId,
        user_request_comment_comment_id: commentData.comment_id,
      });
    if (insertCommentError) throw insertCommentError;
  }
  return commentData.comment_id;
};

// - Update request comment.
export const updateRequestComment = async (
  supabaseClient: SupabaseClient<Database>,
  commentContent: string,
  commentId: number
) => {
  const { data: currentDateData, error } = await supabaseClient
    .rpc("get_current_date")
    .select()
    .single();
  if (error) throw error;
  if (currentDateData) {
    const { error: updateCommentError } = await supabaseClient
      .from("request_comment_table")
      .update({
        comment_content: commentContent,
        comment_is_edited: true,
        comment_last_updated: currentDateData,
      })
      .eq("comment_id", commentId);
    if (updateCommentError) throw updateCommentError;
  }
};

// - Delete request comment.

// Parameters:
// - commentId: string

// Related tables:
// - request_comment_table
// - request_comment_table columns: comment_id, comment_is_disabled.

// Steps:
// 1. Update comment_is_disabled to true.
export const deleteRequestComment = async (
  supabaseClient: SupabaseClient<Database>,
  commentId: number
) => {
  const { error } = await supabaseClient
    .from("request_comment_table")
    .update({ comment_is_disabled: true })
    .eq("comment_id", commentId);

  if (error) throw error;
};

// - Get request status function.

// Parameters:
// - requestId: string

// Related views:
// - request_request_approver_view

// Steps:
// 1. Get approvers from request_request_approver_view using requestId.
// 2. At least 1 approved approver is required to return approved status.
// 3. At least 1 rejected approver is required to return rejected status.
// 4. If all approvers are pending, return pending status.
// 5. At least 1 purchased approver is required to return purchased status.

// Sample return value:
// {
//   status: "approved",
//   purchased: true
// }
export const getRequestStatus = async (
  supabaseClient: SupabaseClient<Database>,
  requestId: number
) => {
  const { data, error } = await supabaseClient
    .from("request_request_approver_view")
    .select()
    .eq("request_id", requestId);
  if (error) throw error;
  if (data) {
    const rejected = data.some(
      (approver) => approver.request_approver_request_status_id === "rejected"
    );
    const approved = data.some(
      (approver) => approver.request_approver_request_status_id === "approved"
    );
    const purchased = data.some(
      (approver) => approver.request_approver_request_status_id === "purchased"
    );
    if (rejected) {
      return {
        status: "rejected",
        purchased,
      };
    }
    if (approved) {
      return {
        status: "approved",
        purchased,
      };
    }
    return {
      status: "pending",
      purchased,
    };
  }
};

// - Delete pending request.

// Parameters:
// - requestId: string

// Related tables:
// - request_request_table
// - request_request_table columns: request_is_disabled.

// Steps:
// 1. Verify first if request is pending using getRequestStatus function.
// 2. Update request_is_disabled to true.
export const deletePendingRequest = async (
  supabaseClient: SupabaseClient<Database>,
  requestId: number
) => {
  const request = await getRequestStatus(supabaseClient, requestId);
  if (request?.status === "pending") {
    const { error } = await supabaseClient
      .from("request_request_table")
      .update({ request_is_disabled: true })
      .eq("request_id", requestId);
    if (error) throw error;
  } else {
    throw new Error("Request is not pending.");
  }
};

// - Update request status.

// Parameters:
// - requestId: string
// - status: RequestStatus
// - userId: string

// Related tables:
// - request_request_approver_table

// Related views:
// - request_request_approver_view

// Steps:
// 1. Verify first if user is an approver of the request using request_request_approver_view.
// 2. Update request_approver_request_status_id to status.
// 3. Update request_approver_last_updated to current date using the get_current_date function.
export const updateRequestStatus = async (
  supabaseClient: SupabaseClient<Database>,
  requestId: number,
  status: RequestStatus,
  userId: string
) => {
  try {
    const { data, error } = await supabaseClient
      .from("request_request_approver_view")
      .select()
      .eq("request_approver_request_id", requestId)
      .eq("request_approver_user_id", userId)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("User is not an approver of the request.");
    const { data: currentDateData, error: currentDateError } =
      await supabaseClient.rpc("get_current_date").select().single();
    if (currentDateError) throw currentDateError;
    if (currentDateData) {
      const { error: updateRequestStatusError } = await supabaseClient
        .from("request_request_approver_table")
        .update({
          request_approver_request_status_id: status,
          request_approver_status_last_updated: currentDateData,
        })
        .eq("request_approver_request_id", requestId)
        .eq("request_approver_user_id", userId);
      if (updateRequestStatusError) throw updateRequestStatusError;
    }

    const { error: updateRequestMainStatusError } = await supabaseClient
      .from("request_form_fact_table")
      .update({
        form_fact_request_status_id: status,
      })
      .eq("form_fact_request_id", requestId);
    if (updateRequestMainStatusError) throw updateRequestMainStatusError;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// - Update user profile
export const updateUserProfile = async (
  supabaseClient: SupabaseClient<Database>,
  userProfileUpdateInput: UserProfileTableUpdate
) => {
  const { error } = await supabaseClient
    .from("user_profile_table")
    .update(userProfileUpdateInput)
    .eq("user_id", userProfileUpdateInput.user_id);
  if (error) throw error;
};

// - Update team information
export const updateTeam = async (
  supabaseClient: SupabaseClient<Database>,
  teamUpdateInput: TeamTableUpdate
) => {
  const { error } = await supabaseClient
    .from("team_table")
    .update(teamUpdateInput)
    .eq("team_id", teamUpdateInput.team_id);
  if (error) throw error;
};

// - Save request draft.
export const saveRequestDraft = async (
  supabaseClient: SupabaseClient<Database>,
  requestId: string
) => {
  const { data, error } = await supabaseClient
    .from("request_request_table")
    .select("request_is_draft")
    .eq("request_id", requestId)
    .is("request_is_draft", true)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Request not found or is not a draft.");
  const { error: updateRequestDraftError } = await supabaseClient
    .from("request_request_table")
    .update({ request_is_draft: false })
    .eq("request_id", requestId);
  if (updateRequestDraftError) throw updateRequestDraftError;
};

// - Build form template.
export const buildFormTemplate = async (
  supabaseClient: SupabaseClient<Database>,
  reactDndFormTemplate: FormRequest,
  userId: string,
  teamId: string
) => {
  const { data, error } = await supabaseClient
    .rpc("build_form_template", {
      react_dnd_form_template: reactDndFormTemplate,
      user_id: userId,
      team_id: teamId,
    })
    .select();
  if (error) throw error;
  return data;
};

// - Create request.
export type CreateRequestParams = {
  formId: number;
  userId: string;
  teamId: string;
  request: {
    request_title: string;
    request_description: string;
    request_on_behalf_of: string;
    request_is_draft: boolean;
  };
  responseList: FieldIdResponseKeyValue;
  approverList: ApproverList;
};
export const createRequest = async (
  supabaseClient: SupabaseClient<Database>,
  createRequestParams: CreateRequestParams
) => {
  const { formId, userId, teamId, request, responseList, approverList } =
    createRequestParams;

  const { data, error } = await supabaseClient
    .rpc("create_request", {
      form_id: formId,
      user_id: userId,
      team_id: teamId,
      request,
      approver_list: approverList,
      response_list: responseList,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};
export type CreateRequest = number;

// - Update request draft.

export const updateRequestDraft = async (
  supabaseClient: SupabaseClient<Database>,
  requestId: number,
  responseList: ResponseList
) => {
  const { data, error } = await supabaseClient
    .rpc("update_request_draft", {
      request_id: requestId,
      response_list: responseList,
    })
    .select();
  if (error) throw error;
  return data;
};

// - Get Team Member role of a user in a team.
export const getTeamMemberRole = async (
  supabaseClient: SupabaseClient<Database>,
  userId: string,
  teamId: string
) => {
  const { data, error } = await supabaseClient
    .from("team_member_view")
    .select("team_member_role")
    .eq("user_id", userId)
    .eq("team_id", teamId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Team member not found.");
  return data.team_member_role;
};

// Generate lookup table for request attachment url list.
export const getRequestAttachmentUrlList = async (
  supabaseClient: SupabaseClient<Database>,
  requestIdList: number[]
) => {
  const { data, error } = await supabaseClient
    .from("request_request_table")
    .select("request_id, request_attachment_filepath_list")
    .in("request_id", requestIdList);
  if (error) throw error;
  // if (!data || data.length === 0) throw new Error("Request not found.");

  const requestAttachmentUrlList: { [requestId: string]: string[] } = {};

  // Same as above but use Promise.all to speed up the process.
  const promises = [];
  for (const request of data) {
    const { request_id, request_attachment_filepath_list } = request;
    if (request_attachment_filepath_list) {
      const urlList: string[] = [];
      for (const filepath of request_attachment_filepath_list) {
        const promise = getFileUrl(
          supabaseClient,
          filepath,
          "request-attachments"
        );
        promises.push(promise);
      }
      requestAttachmentUrlList[request_id] = urlList;
    }
  }
  const urlList = await Promise.all(promises);

  let i = 0;
  for (const request of data) {
    const { request_id, request_attachment_filepath_list } = request;
    if (request_attachment_filepath_list) {
      requestAttachmentUrlList[request_id] =
        request_attachment_filepath_list.map((_) => urlList[i++]);
    }
  }
  return requestAttachmentUrlList;
};
export type GetRequestAttachmentUrlList = Awaited<
  ReturnType<typeof getRequestAttachmentUrlList>
>;

// Generate lookup table for team member avatar url list.
export const getTeamMemberAvatarUrlList = async (
  supabaseClient: SupabaseClient<Database>,
  teamIdList: string[]
) => {
  const { data, error } = await supabaseClient
    .from("team_member_view")
    .select("user_id, user_avatar_filepath")
    .in("team_id", teamIdList);
  if (error) throw error;
  if (!data || data.length === 0) throw new Error("Team member not found.");

  const teamMemberAvatarUrlList: { [userId: string]: string | null } = {};

  // Same as above but use Promise.all to speed up the process.
  const promises = [];
  for (const teamMember of data) {
    const { user_avatar_filepath } = teamMember;
    if (user_avatar_filepath) {
      const promise = getFileUrl(
        supabaseClient,
        user_avatar_filepath,
        "user-profile-images"
      );
      promises.push(promise);
    } else {
      promises.push(null);
    }
  }
  const urlList = await Promise.all(promises);

  data.map((teamMember, i) => {
    const { user_id, user_avatar_filepath } = teamMember;
    if (user_avatar_filepath) {
      teamMemberAvatarUrlList[user_id as string] = urlList[i];
    }
  });

  return teamMemberAvatarUrlList;
};
export type GetTeamMemberAvatarUrlList = Awaited<
  ReturnType<typeof getTeamMemberAvatarUrlList>
>;

// Generate lookup table for team logo url list.
export const getTeamLogoUrlList = async (
  supabaseClient: SupabaseClient<Database>,
  teamIdList: string[]
) => {
  const { data, error } = await supabaseClient
    .from("team_table")
    .select("team_id, team_logo_filepath")
    .in("team_id", teamIdList);
  if (error) throw error;
  if (!data || data.length === 0) throw new Error("Team not found.");
  const teamLogoUrlList: { [teamId: string]: string } = {};

  // Same as above but use Promise.all to speed up the process.
  const promises = [];
  for (const team of data) {
    const { team_id, team_logo_filepath } = team;
    if (team_logo_filepath) {
      const promise = getFileUrl(
        supabaseClient,
        team_logo_filepath,
        "team-logos"
      );
      promises.push(promise);
    }
  }
  const urlList = await Promise.all(promises);
  data.map((team, i) => {
    const { team_id, team_logo_filepath } = team;
    if (team_logo_filepath) {
      teamLogoUrlList[team_id as string] = urlList[i];
    }
  });
  return teamLogoUrlList;
};
export type GetTeamLogoUrlList = Awaited<ReturnType<typeof getTeamLogoUrlList>>;

// Get request approver list with is_approveer and is_purchaser key appended.
export const getRequestApproverList = async (
  supabaseClient: SupabaseClient<Database>,
  requestIdList: number[]
) => {
  const promises = [];
  const promise1 = supabaseClient
    .from("request_request_approver_view")
    .select()
    .in("request_approver_request_id", requestIdList)
    .not("request_is_draft", "is", true)
    .not("request_is_disabled", "is", true);

  const promise2 = supabaseClient
    .from("request_form_fact_view")
    .select()
    .in("form_fact_request_id", requestIdList);

  promises.push(promise1, promise2);
  const [requestApproverView, formFactView] = await Promise.all(promises);

  if (requestApproverView.error) throw requestApproverView.error;
  if (formFactView.error) throw formFactView.error;

  const teamIdList = (
    formFactView.data as unknown as RequestFormFactViewRow[]
  ).map((row) => row.team_id);

  // Distinct by team id.
  const distinctTeamIdList = teamIdList.filter(
    (item, index) => teamIdList.indexOf(item) === index
  );

  const { data: teamMemberViewData, error: teamMemberViewError } =
    await supabaseClient
      .from("team_member_view")
      .select()
      .in("team_id", distinctTeamIdList);
  if (teamMemberViewError) throw teamMemberViewError;

  const requestApproverList: (RequestRequestApproverViewRow & {
    is_approver: boolean;
    is_purchaser: boolean;
  })[] = [];

  // Per requestApproverView.data, check if the user is an approver or purchaser.
  // If user is an owner or admin, then is_approver is true.
  // If user is a purchaser, then is_purchaser is true.
  (requestApproverView.data as RequestRequestApproverViewRow[]).forEach(
    (requestApproverRow) => {
      const { user_id, request_id } = requestApproverRow;
      // Get team id using request_id from formFactView.
      const formFactViewRow = (
        formFactView.data as RequestFormFactViewRow[]
      ).find((row) => row.request_id === request_id);

      const teamMemberViewRow = (
        teamMemberViewData as TeamMemberViewRow[]
      ).find(
        (row) =>
          row.team_id === formFactViewRow?.team_id && row.user_id === user_id
      );
      if (!teamMemberViewRow) {
        throw new Error(
          "Approver of the request is not a part of the team the request belongs to."
        );
      }

      const { member_role_id } = teamMemberViewRow;
      const isApprover =
        member_role_id === "owner" || member_role_id === "admin";
      const isPurchaser = member_role_id === "purchaser";

      requestApproverList.push({
        ...requestApproverRow,
        is_approver: isApprover,
        is_purchaser: isPurchaser,
      });
    }
  );

  return requestApproverList;
};
export type GetRequestApproverList = Awaited<
  ReturnType<typeof getRequestApproverList>
>;

// Create team.
export const createTeam = async (
  supabaseClient: SupabaseClient<Database>,
  userId: string,
  teamInsertInput: TeamTableInsert
) => {
  const { data, error } = await supabaseClient
    .from("team_table")
    .insert(teamInsertInput)
    .select()
    .single();
  if (error) throw error;
  if (!data) throw new Error("Team not created.");

  const teamId = data.team_id;

  const teamMemberInsertInput: TeamMemberTableInsert = {
    team_member_team_id: teamId,
    team_member_user_id: userId,
    team_member_member_role_id: "owner",
  };
  const { data: data2, error: error2 } = await supabaseClient
    .from("team_member_table")
    .insert(teamMemberInsertInput)
    .select()
    .single();
  if (error2) throw error2;
  if (!data2) throw new Error("Team member not created.");

  return teamId;
};
export type CreateTeam = Awaited<ReturnType<typeof createTeam>>;

// - Create notification.
// Create notification for each user in userIdList.
export const createNotification = async (
  supabaseClient: SupabaseClient<Database>,
  userId: string,
  notificationInsertInput: NotificationTableInsert,
  teamId?: string
) => {
  const { data, error } = await supabaseClient
    .from("notification_table")
    .insert(notificationInsertInput)
    .select()
    .single();
  if (error) throw error;
  if (!data) throw new Error("Notification not created.");

  const notificationId = data.notification_id;

  const teamUserNotificationInsertInput: TeamUserNotificationTableInsert = {
    team_user_notification_user_id: userId,
    team_user_notification_notification_id: notificationId,
  };
  if (teamId) {
    teamUserNotificationInsertInput.team_user_notification_team_id = teamId;
  }

  const { data: data2, error: error2 } = await supabaseClient
    .from("team_user_notification_table")
    .insert(teamUserNotificationInsertInput)
    .select()
    .single();
  if (error2) throw error2;
  if (!data2) throw new Error("Team user notification not created.");

  return notificationId;
};
export type CreateNotification = Awaited<ReturnType<typeof createNotification>>;

// * Returns only user id list of registered users from an email list.
export const getUserIdListFromEmailList = async (
  supabaseClient: SupabaseClient<Database>,
  emailList: string[]
) => {
  try {
    const { data, error } = await supabaseClient.rpc(
      "get_user_id_list_from_email_list",
      { email_list: emailList }
    );

    if (error) throw error;
    if (!data) return [];

    // Remove null elements.
    const dataFiltered = data.filter((userIdWithEmail) => userIdWithEmail);
    if (dataFiltered.length === 0) return [];

    const dataRedefined = dataFiltered as unknown as string[];

    const userIdWithEmailList = dataRedefined.map((userIdWithEmail) => {
      const [userId, userEmail] = userIdWithEmail.split(",");
      return { userId, userEmail };
    });

    return userIdWithEmailList as GetUserIdListFromEmailList;
  } catch (e) {
    console.error(e);
  }
};
export type GetUserIdListFromEmailList = {
  userId: string;
  userEmail: string;
}[];

// - Is user a member of team.
// - Use team_member_view.
export const isUserMemberOfTeam = async (
  supabaseClient: SupabaseClient<Database>,
  userId: string,
  teamId: string
) => {
  const { data, error } = await supabaseClient
    .from("team_member_view")
    .select()
    .eq("team_member_user_id", userId)
    .eq("team_member_team_id", teamId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return false;

  return true;
};

// - Get a user profile.
export const getUserProfile = async (
  supabaseClient: SupabaseClient<Database>,
  userId: string
) => {
  const { data, error } = await supabaseClient
    .from("user_profile_table")
    .select()
    .eq("user_id", userId)
    .single();

  if (error) throw error;
  if (!data) return null;

  return data;
};
export type GetUserProfile = Awaited<ReturnType<typeof getUserProfile>>;

// - Get request comment list.
export const getRequestCommentList = async (
  supabaseClient: SupabaseClient<Database>,
  requestId: number[]
) => {
  const { data, error } = await supabaseClient
    .from("request_request_user_comment_view")
    .select()
    .in("request_id", requestId)
    .is("comment_is_disabled", false)
    .is("request_is_draft", false)
    .is("request_is_disabled", false);

  if (error) throw error;
  if (!data) return null;

  return data;
};
export type GetRequestCommentList = Awaited<
  ReturnType<typeof getRequestCommentList>
>;

// Get request main status list.
// Get a request's main status using GetRequestApproverList
// export const getRequestMainStatusList = async (
//   supabaseClient: SupabaseClient<Database>,
//   approverList: GetRequestApproverList
// ) => {
//   const requestList = distinctByKey(approverList, "request_id");

//   // Get server date using get_current_date.
//   const today = await getCurrentDate(supabaseClient);

//   const requestMainStatusList = requestList.reduce(
//     (requestMainStatusList, request) => {
//       const requestId = request.request_id;

//       const requestApproverList = approverList.filter(
//         (requestApprover) => requestApprover.request_id === requestId
//       );
//       const isRejected = requestApproverList.some(
//         (requestApprover) =>
//           requestApprover.request_approver_request_status_id === "rejected"
//       );
//       const isApproved = requestApproverList.some(
//         (requestApprover) =>
//           requestApprover.request_approver_request_status_id === "approved"
//       );
//       const isPurchased = requestApproverList.some(
//         (requestApprover) =>
//           requestApprover.request_approver_request_status_id === "purchased"
//       );
//       const isPending = !isRejected && !isApproved && !isPurchased;
//       // const isStale = isPending && isPast5WorkingDays(requestApproverList);
//       // Use date-fns addBusinessDays to add 5 working days to the request date created.
//       // If the current date is past the date created + 5 working days, then the request is stale.
//       const staleDate = addBusinessDays(
//         new Date(request.request_date_created as string),
//         5
//       );

//       const isStale = isPending && isAfter(today, staleDate);

//       let requestMainStatus: RequestStatus = "pending";

//       if (isRejected) requestMainStatus = "rejected";
//       if (isApproved) requestMainStatus = "approved";
//       if (isPurchased) requestMainStatus = "purchased";
//       if (isStale) requestMainStatus = "stale";

//       if (requestId) {
//         requestMainStatusList[requestId] = requestMainStatus;
//       }
//       return requestMainStatusList;
//     },
//     {} as { [requestId: string]: RequestStatus }
//   );
//   return requestMainStatusList;
// };
// export type GetRequestMainStatusList = Awaited<
//   ReturnType<typeof getRequestMainStatusList>
// >;

export const getCurrentDate = async (
  supabaseClient: SupabaseClient<Database>
) => {
  const { data, error } = await supabaseClient
    .rpc("get_current_date")
    .select()
    .single();
  if (error) throw error;
  if (!data) throw error;
  return new Date(data);
};
export type GetCurrentDate = Awaited<ReturnType<typeof getCurrentDate>>;
