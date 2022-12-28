// * All database queries are written here para isang reference na lang.
// * Import lang form here then use in your components.
// * Refrences: https://supabase.com/docs/reference/javascript/typescript-support#type-hints

import { SupabaseClient, User } from "@supabase/supabase-js";
import { Database } from "./database.types-new";
import { getFileUrl } from "./file";
import {
  ApproverList,
  FieldIdResponseKeyValue,
  FormRequest,
  RequestRequestTableUpdate,
  RequestStatus,
  ResponseList,
  TeamMemberRole,
  TeamTableUpdate,
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
// ✅ Get team user notification list.
// ✅ Read team user notification.
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

// - Create or retrieve a user profile.
export async function createOrRetrieveUserProfile(
  supabaseClient: SupabaseClient<Database>,
  user: User
) {
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
}

// - Create or retrieve a user team list.
export async function createOrRetrieveUserTeamList(
  supabaseClient: SupabaseClient<Database>,
  userId: string
) {
  const { data, error } = await supabaseClient
    .from("team_member_view")
    .select()
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (data) return data;

  if (!data) {
    const { data: teamData, error } = await supabaseClient
      .from("team_table")
      .insert({
        team_name: "My Team",
      })
      .select()
      .single();

    if (error) throw error;
    if (data) {
      const { error: insertError } = await supabaseClient
        .from("team_member_table")
        .insert({
          team_member_team_id: teamData.team_id,
          user_id: userId,
          member_role_id: "owner",
        });

      if (insertError) throw insertError;

      const { data, error } = await supabaseClient
        .from("team_member_view")
        .select()
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      if (data) return data;
    }
  }
}
export type CreateOrRetrieveUserTeamList = Awaited<
  ReturnType<typeof createOrRetrieveUserTeamList>
>;

// - Get current user team list.
export async function getCurrentUserTeamList(
  supabaseClient: SupabaseClient<Database>,
  userId: string
) {
  const { data, error } = await supabaseClient
    .from("team_member_view")
    .select()
    .eq("user_id", userId);

  if (error) throw error;
  if (data) return data;
}
export type GetCurrentUserTeamList = Awaited<
  ReturnType<typeof getCurrentUserTeamList>
>;

// - Get a team.
export async function getTeam(
  supabaseClient: SupabaseClient<Database>,
  teamId: string
) {
  const { data, error } = await supabaseClient
    .from("team_member_view")
    .select()
    .eq("team_id", teamId);

  if (error) throw error;
  if (data) return data;
}
export type GetTeam = Awaited<ReturnType<typeof getTeam>>;

// - Get team approver list.
// Approver if TeamMemberRole is "owner", "admin" or "approver".
export async function getTeamApproverList(
  supabaseClient: SupabaseClient<Database>,
  teamId: string
) {
  const { data, error } = await supabaseClient
    .from("team_member_view")
    .select()
    .eq("team_id", teamId)
    .in("member_role_id", ["owner", "admin", "approver"]);

  if (error) throw error;
  if (data) return data;
}
export type GetTeamApproverList = Awaited<
  ReturnType<typeof getTeamApproverList>
>;

// - Get team purchaser list.
// Purchaser if TeamMemberRole is "purchaser".
export async function getTeamPurchaserList(
  supabaseClient: SupabaseClient<Database>,
  teamId: string
) {
  const { data, error } = await supabaseClient
    .from("team_member_view")
    .select()
    .eq("team_id", teamId)
    .eq("member_role_id", "purchaser");

  if (error) throw error;
  if (data) return data;
}
export type GetTeamPurchaserList = Awaited<
  ReturnType<typeof getTeamPurchaserList>
>;

// - Get team owner.
// Owner if TeamMemberRole is "owner".
export async function getTeamOwner(
  supabaseClient: SupabaseClient<Database>,
  teamId: string
) {
  const { data, error } = await supabaseClient
    .from("team_member_view")
    .select()
    .eq("team_id", teamId)
    .eq("member_role_id", "owner")
    .single();

  if (error) throw error;
  if (data) return data;
}

// - Get team admin list.
// Admin if TeamMemberRole is "owner" or "admin".
export async function getTeamAdminList(
  supabaseClient: SupabaseClient<Database>,
  teamId: string
) {
  const { data, error } = await supabaseClient
    .from("team_member_view")
    .select()
    .eq("team_id", teamId)
    .in("member_role_id", ["owner", "admin"]);

  if (error) throw error;
  if (data) return data;
}

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
  formTemplateId: string
) => {
  const { data, error } = await supabaseClient
    .from("request_form_template_view")
    .select()
    .eq("form_fact_form_id", formTemplateId);

  if (error) throw error;
  if (data) return data;
};
export type GetFormTemplate = Awaited<ReturnType<typeof getFormTemplate>>;
// - Get request list of a team.
export const getTeamRequestList = async (
  supabaseClient: SupabaseClient<Database>,
  teamId: string
) => {
  const { data, error } = await supabaseClient
    .from("request_form_fact_view")
    .select()
    .eq("team_id", teamId)
    .not("request_id", "is", null)
    .not("response_id", "is", null)
    .not("request_is_draft", "is", true)
    .not("request_is_disabled", "is", true);

  if (error) throw error;
  if (data) return data;
};
export type GetTeamRequestList = Awaited<ReturnType<typeof getTeamRequestList>>;
// - Get a request.
export const getRequest = async (
  supabaseClient: SupabaseClient<Database>,
  requestId: string
) => {
  const { data, error } = await supabaseClient
    .from("request_form_fact_view")
    .select()
    .eq("request_id", requestId);

  if (error) throw error;
  if (data) return data;
};
export type GetRequest = Awaited<ReturnType<typeof getRequest>>;

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
  user: User,
  targetEmail: string
) => {
  const { data: invitationData, error } = await supabaseClient
    .from("invitation_table")
    .insert({
      invitation_target_email: targetEmail,
    })
    .select()
    .single();
  if (error) throw error;
  if (invitationData) {
    const { error } = await supabaseClient
      .from("team_invitation_table")
      .insert({
        team_invitation_created_by: user.id,
        team_invitation_team_id: teamId,
        team_invitation_invitation_id: invitationData.invitation_id,
      });
    if (error) throw error;
  }
};

// - Accept team invitation.
export const acceptTeamInvitation = async (
  supabaseClient: SupabaseClient<Database>,
  teamInvitationId: string,
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

    const { error: updateInvitationError } = await supabaseClient
      .from("invitation_table")
      .update({ invitation_is_accepted: true })
      .eq("invitation_id", invitationData.team_invitation_invitation_id);

    if (updateInvitationError) throw updateInvitationError;
  }
};

// - Update a team member role.

// Parameters:
// - teamId: string
// - userId: string
// - role: TeamMemberRole

// Related tables:
// - team_member_table

// Steps:
// 1. Update team_member_role to role.
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

// - Get team user notification list.
export const getTeamUserNotificationList = async (
  supabaseClient: SupabaseClient<Database>,
  teamId: string,
  userId: string
) => {
  const { data, error } = await supabaseClient
    .from("team_user_notification_view")
    .select()
    .eq("team_id", teamId)
    .eq("user_id", userId);

  if (error) throw error;
  if (data) return data;
};
export type GetTeamUserNotificationList = Awaited<
  ReturnType<typeof getTeamUserNotificationList>
>;

// - Read team user notification.
export const readTeamUserNotification = async (
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

// Related tables:
// - request_order_table
// - request_order_table columns: order_field_id_list.
// - request_form_fact_table
// - request_form_fact_table columns: form_fact_user_id, form_fact_team_id, form_fact_field_id, form_fact_response_id, form_fact_order_id, form_fact_request_id, form_fact_form_id.

// Steps:
// 1. Get order_id using formTemplateId from request_form_fact_table.
// 2. Update order_field_id_list using order_id from Step 1.
export const updateFormTemplateOrder = async (
  supabaseClient: SupabaseClient<Database>,
  formTemplateId: string,
  order: number[]
) => {
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
};

// - Create request comment.

// Parameters:
// - commentContent: string
// - userId: string
// - requestId: string

// Related tables:
// - request_request_user_comment_table
// - request_request_user_comment_table columns: user_request_comment_user_id, user_request_comment_request_id, user_request_comment_comment_id.
// - request_comment_table
// - request_comment_table columns: comment_content, comment_is_edited.
// - request_request_table

// Steps:
// 1. Insert comment_content to request_comment_table.
// 2. Get comment_id from Step 1.
// 3. Insert user_request_comment_request_id to request_request_user_comment_table using comment_id from Step 2. Get user_request_comment_user_id from function parameter. Get user_request_comment_request_id from function parameter.
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
};

// - Update request comment.
// Parameters:
// - commentContent: string
// - commentId: string

// Related tables:
// - request_comment_table
// - request_comment_table columns: comment_content, comment_is_edited, comment_last_updated.

// Related PostgreSQL database functions:
// - get_current_date()

// Steps:
// 1. Get current date from database using get_current_date function.
// 2. Do the following:
// - Update comment_content, comment_is_edited, and comment_last_updated.
export const updateRequestComment = async (
  supabaseClient: SupabaseClient<Database>,
  commentContent: string,
  commentId: string
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
  commentId: string
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
  requestId: string
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
  requestId: string
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
  requestId: string,
  status: RequestStatus,
  userId: string
) => {
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
        request_approver_last_updated: currentDateData,
      })
      .eq("request_approver_request_id", requestId)
      .eq("request_approver_user_id", userId);
    if (updateRequestStatusError) throw updateRequestStatusError;
  }
};

// - Update user profile
// If a key is not provided, it will not be updated.

// Parameters:
// userProfileUpdateInput: UserProfileTableUpdate

// Related tables:
// - user_profile_table

// Steps:
// 1. Update user_profile_table using userProfileUpdateInput.

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
// If a key is not provided, it will not be updated.

// Parameters:
// teamUpdateInput: TeamTableUpdate

// Related tables:
// - team_table

// Steps:
// 1. Update team_table using teamUpdateInput.
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

// Parameters:
// - requestId: string

// Related tables:
// - request_request_table
// - request_request_table columns: request_is_draft.

// Steps:
// 1. Verify first if request is a draft using request_request_table.request_is_draft.
// 2. Update request_is_draft to false.
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

// Parameters:
// - reactDndFormTemplate: FormRequest
// - userId: string
// - teamId: string

// Related database functions:
// - build_form_template;

// Steps:
// 1. Call build_form_template function.

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

// Parameters:
//  form_id: number;
//  user_id: string;
//  team_id: string;
//  request: RequestTableUpdate;
//  approver_list: ApproverList;
//  response_list: FieldIdResponseKeyValue;

// Related database functions:
// - create_request;

// Steps:
// 1. Call create_request function.

export const createRequest = async (
  supabaseClient: SupabaseClient<Database>,
  formId: number,
  userId: string,
  teamId: string,
  request: Omit<RequestRequestTableUpdate, "request_id">,
  approverList: ApproverList,
  responseList: FieldIdResponseKeyValue
) => {
  const { data, error } = await supabaseClient
    .rpc("create_request", {
      form_id: formId,
      user_id: userId,
      team_id: teamId,
      request,
      approver_list: approverList,
      response_list: responseList,
    })
    .select();
  if (error) throw error;
  return data;
};

// - Update request draft.

// Parameters:
// - requestId: number
// - responseList: ResponseList

// Related database functions:
// - update_request_draft

// Steps:
// 1. Call update_request_draft function.

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

// Parameters:
// - userId: string
// - teamId: string

// Related views:
// - team_member_view

// Steps:
// 1. Get team_member_view using userId and teamId.

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

// Parameters:
// - requestIdList: string[]

// Related tables:
// - request_request_table

// Steps:
// 1. Get request_request_table using requestIdList.
// 2. Per request_request_table row, loop through request_attachment_filepath_list and call getFileUrl to get the url of the file.
// 3. Generate lookup table for request attachment url list. e.g. { requestId: [url1, url2] }

export const getRequestAttachmentUrlList = async (
  supabaseClient: SupabaseClient<Database>,
  requestIdList: string[]
) => {
  const { data, error } = await supabaseClient
    .from("request_request_table")
    .select("request_id, request_attachment_filepath_list")
    .in("request_id", requestIdList);
  if (error) throw error;
  if (!data || data.length === 0) throw new Error("Request not found.");
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
          "request_attachments"
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

// Generate lookup table for team member avatar url list.

// Parameters:
// - teamIdList: string[]

// Related views:
// - team_member_view

// Steps:
// 1. Get team_member_view using teamIdList.
// 2. Per team_member_view row, call getFileUrl to get the url of the file.
// 3. Generate lookup table for team member avatar url list. e.g.  { userId: url }

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
  const teamMemberAvatarUrlList: { [userId: string]: string } = {};

  // Same as above but use Promise.all to speed up the process.
  const promises = [];
  for (const teamMember of data) {
    const { user_id, user_avatar_filepath } = teamMember;
    if (user_avatar_filepath) {
      const promise = getFileUrl(
        supabaseClient,
        user_avatar_filepath,
        "user_avatars"
      );
      promises.push(promise);
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

// Generate lookup table for user team logo url list.

// Parameters:
// - userId: string

// Related views:
// - team_member_view

// Steps:
// 1. Get teams where user is a member.
// 2. Per team, call getFileUrl to get the url of the team logo.
// 3. Generate lookup table for user team logo url list. e.g.  { teamId: url }

export const getUserTeamLogoUrlList = async (
  supabaseClient: SupabaseClient<Database>,
  userId: string
) => {
  const { data, error } = await supabaseClient
    .from("team_member_view")
    .select("team_id, team_logo_filepath")
    .eq("user_id", userId);
  if (error) throw error;
  if (!data || data.length === 0) throw new Error("User not part of any team.");
  const userTeamLogoUrlList: { [teamId: string]: string } = {};

  const promises = [];
  for (const team of data) {
    const { team_logo_filepath } = team;
    if (team_logo_filepath) {
      const promise = getFileUrl(
        supabaseClient,
        team_logo_filepath,
        "team_logos"
      );
      promises.push(promise);
    }
  }
  const urlList = await Promise.all(promises);

  data.map((team, i) => {
    const { team_id, team_logo_filepath } = team;
    if (team_logo_filepath) {
      userTeamLogoUrlList[team_id as string] = urlList[i];
    }
  });

  return userTeamLogoUrlList;
};
