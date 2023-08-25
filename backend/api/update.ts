import { RequestSigner } from "@/components/FormBuilder/SignerSection";
import { Database } from "@/utils/database";
import {
  AppType,
  MemberRoleType,
  SignerTableRow,
  TeamTableRow,
  TeamTableUpdate,
  UserTableUpdate,
} from "@/utils/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { getCurrentDate } from "./get";

// Update Team
export const updateTeam = async (
  supabaseClient: SupabaseClient<Database>,
  params: TeamTableUpdate
) => {
  const { data, error } = await supabaseClient
    .from("team_table")
    .update(params)
    .eq("team_id", params.team_id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Update user's active app
export const updateUserActiveApp = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    userId: string;
    app: string;
  }
) => {
  const { userId, app } = params;
  const { error } = await supabaseClient
    .from("user_table")
    .update({ user_active_app: app })
    .eq("user_id", userId);
  if (error) throw error;
};

// Update user's active team
export const updateUserActiveTeam = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    userId: string;
    teamId: string;
  }
) => {
  const { userId, teamId } = params;
  const { error } = await supabaseClient
    .from("user_table")
    .update({ user_active_team_id: teamId })
    .eq("user_id", userId);
  if (error) throw error;
};

// Update User
export const udpateUser = async (
  supabaseClient: SupabaseClient<Database>,
  params: UserTableUpdate
) => {
  const { error } = await supabaseClient
    .from("user_table")
    .update(params)
    .eq("user_id", params.user_id);
  if (error) throw error;
};

// Update form visibility
export const updateFormVisibility = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    formId: string;
    isHidden: boolean;
  }
) => {
  const { formId, isHidden } = params;

  const { error } = await supabaseClient
    .from("form_table")
    .update({ form_is_hidden: isHidden })
    .eq("form_id", formId);
  if (error) throw error;
};

// Update request status and signer status
export const approveOrRejectRequest = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    requestAction: "APPROVED" | "REJECTED";
    requestId: string;
    isPrimarySigner: boolean;
    requestSignerId: string;
    requestOwnerId: string;
    signerFullName: string;
    formName: string;
    memberId: string;
    teamId: string;
  }
) => {
  const { error } = await supabaseClient.rpc("approve_or_reject_request", {
    input_data: { ...params },
  });

  if (error) throw error;
};

// Update request status to canceled
export const cancelRequest = async (
  supabaseClient: SupabaseClient<Database>,
  params: { requestId: string; memberId: string }
) => {
  const { requestId, memberId } = params;
  const { error } = await supabaseClient
    .rpc("cancel_request", {
      request_id: requestId,
      member_id: memberId,
      comment_type: "ACTION_CANCELED",
      comment_content: "Request canceled",
    })
    .select("*")
    .single();
  if (error) throw error;
};

// Update comment
export const updateComment = async (
  supabaseClient: SupabaseClient<Database>,
  params: { commentId: string; newComment: string }
) => {
  const { commentId, newComment } = params;
  const currentDate = (await getCurrentDate(supabaseClient)).toLocaleString();

  const { error } = await supabaseClient
    .from("comment_table")
    .update({
      comment_content: newComment,
      comment_is_edited: true,
      comment_last_updated: `${currentDate}`,
    })
    .eq("comment_id", commentId);
  if (error) throw error;
};

// Update team member role
export const updateTeamMemberRole = async (
  supabaseClient: SupabaseClient<Database>,
  params: { memberId: string; role: MemberRoleType }
) => {
  const { memberId, role } = params;
  const { error } = await supabaseClient
    .from("team_member_table")
    .update({
      team_member_role: role,
    })
    .eq("team_member_id", memberId);
  if (error) throw error;
};

// Transfer ownership
export const updateTeamOwner = async (
  supabaseClient: SupabaseClient<Database>,
  params: { ownerId: string; memberId: string }
) => {
  const { ownerId, memberId } = params;
  const { error } = await supabaseClient
    .rpc("transfer_ownership", { member_id: memberId, owner_id: ownerId })
    .select("*")
    .single();
  if (error) throw error;
};

// Update status
export const toggleStatus = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    id: string;
    status: boolean;
    table: string;
  }
) => {
  const { id, status, table } = params;

  const { error } = await supabaseClient
    .from(`${table}_table`)
    .update({
      [`${table}_is_available`]: status,
    })
    .eq(`${table}_id`, id);
  if (error) throw error;
};

// Upsert form signers
export const updateFormSigner = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    signers: (RequestSigner & {
      signer_is_disabled: boolean;
    })[];
    selectedProjectId: string | null;
    formId: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("update_form_signer", { input_data: params })
    .select("*")
    .single();

  if (error) throw error;

  return data as SignerTableRow[];
};

// Update notification status
export const updateNotificationStatus = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    notificationId: string;
  }
) => {
  const { notificationId } = params;
  const { error } = await supabaseClient
    .from("notification_table")
    .update({ notification_is_read: true })
    .eq("notification_id", notificationId);
  if (error) throw error;
};

// Accept team invitation
export const acceptTeamInvitation = async (
  supabaseClient: SupabaseClient<Database>,
  params: { invitationId: string; teamId: string; userId: string }
) => {
  const { invitationId, teamId, userId } = params;

  const { data, error } = await supabaseClient.rpc("accept_team_invitation", {
    invitation_id: invitationId,
    team_id: teamId,
    user_id: userId,
  });
  if (error) throw error;

  return data as TeamTableRow[];
};

// Decline team invitation
export const declineTeamInvitation = async (
  supabaseClient: SupabaseClient<Database>,
  params: { invitationId: string }
) => {
  const { invitationId } = params;
  const { error: invitationError } = await supabaseClient
    .from("invitation_table")
    .update({ invitation_status: "DECLINED" })
    .eq("invitation_id", invitationId);
  if (invitationError) throw invitationError;
};

// Read all notification
export const readAllNotification = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    userId: string;
    appType: AppType;
  }
) => {
  const { userId, appType } = params;
  const { error } = await supabaseClient
    .from("notification_table")
    .update({ notification_is_read: true })
    .eq("notification_user_id", userId)
    .or(`notification_app.eq.${appType}, notification_app.is.null`);
  if (error) throw error;
};

// Update form group
export const updateFormGroup = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    formId: string;
    isForEveryone: boolean;
    groupList: string[];
  }
) => {
  const { error } = await supabaseClient.rpc("update_form_group", {
    input_data: params,
  });

  if (error) throw error;
};

// Update form description
export const updateFormDescription = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    formId: string;
    description: string;
  }
) => {
  const { formId, description } = params;

  const { error } = await supabaseClient
    .from("form_table")
    .update({ form_description: description })
    .eq("form_id", formId);
  if (error) throw error;
};

// Delete team
export const deleteTeam = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    teamMemberId: string;
  }
) => {
  const { teamId, teamMemberId } = params;

  const { error } = await supabaseClient.rpc("delete_team", {
    team_id: teamId,
    team_member_id: teamMemberId,
  });

  if (error) throw error;
};
