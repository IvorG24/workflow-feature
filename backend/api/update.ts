import { RequestSigner } from "@/components/FormBuilder/SignerSection";
import { Database } from "@/utils/database";
import {
  AppType,
  MemberRoleType,
  TeamTableUpdate,
  UserTableUpdate,
} from "@/utils/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { lowerCase } from "lodash";
import { getCurrentDate } from "./get";
import { createComment, createNotification } from "./post";

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
  const {
    requestId,
    isPrimarySigner,
    requestSignerId,
    requestOwnerId,
    signerFullName,
    formName,
    requestAction,
    memberId,
    teamId,
  } = params;

  const present = { APPROVED: "APPROVE", REJECTED: "REJECT" };

  // update request signer
  const { error: updateSignerError } = await supabaseClient
    .from("request_signer_table")
    .update({ request_signer_status: requestAction })
    .eq("request_signer_signer_id", requestSignerId)
    .eq("request_signer_request_id", requestId);
  if (updateSignerError) throw updateSignerError;

  // create comment
  await createComment(supabaseClient, {
    comment_request_id: requestId,
    comment_team_member_id: memberId,
    comment_type: `ACTION_${requestAction}`,
    comment_content: `${signerFullName} ${lowerCase(
      requestAction
    )} this request`,
  });

  // create notification
  await createNotification(supabaseClient, {
    notification_app: "REQUEST",
    notification_type: present[requestAction],
    notification_content: `${signerFullName} ${lowerCase(
      requestAction
    )} your ${formName} request`,
    notification_redirect_url: `/team-requests/requests/${requestId}`,
    notification_user_id: requestOwnerId,
    notification_team_id: teamId,
  });

  // update request status if the signer is the primary signer
  if (isPrimarySigner) {
    const { error: updateRequestError } = await supabaseClient
      .from("request_table")
      .update({ request_status: requestAction })
      .eq("request_id", requestId)
      .select();
    if (updateRequestError) throw updateRequestError;
  }
};

// Update request status to canceled
export const cancelRequest = async (
  supabaseClient: SupabaseClient<Database>,
  params: { requestId: string; memberId: string }
) => {
  const { requestId, memberId } = params;
  const { error } = await supabaseClient
    .from("request_table")
    .update({ request_status: "CANCELED" })
    .eq("request_id", requestId);
  if (error) throw error;

  // create comment
  await createComment(supabaseClient, {
    comment_request_id: requestId,
    comment_team_member_id: memberId,
    comment_type: "REQUEST_CANCELED",
    comment_content: "Request canceled",
  });
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
  const { error: newOwnerError } = await supabaseClient
    .from("team_member_table")
    .update({
      team_member_role: "OWNER",
    })
    .eq("team_member_id", memberId);
  if (newOwnerError) throw newOwnerError;

  const { error: previousOwnerError } = await supabaseClient
    .from("team_member_table")
    .update({
      team_member_role: "ADMIN",
    })
    .eq("team_member_id", ownerId);
  if (previousOwnerError) throw previousOwnerError;
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
    signers: (RequestSigner & { signer_is_disabled: boolean })[];
    formId: string;
  }
) => {
  const { signers, formId } = params;
  const { error: disableAllError } = await supabaseClient
    .from("signer_table")
    .update({ signer_is_disabled: true })
    .eq("signer_form_id", formId);
  if (disableAllError) throw disableAllError;
  const { data: signerData, error: signerError } = await supabaseClient
    .from("signer_table")
    .upsert(signers)
    .select("*");
  if (signerError) throw signerError;
  return signerData;
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
  const { error: invitationError } = await supabaseClient
    .from("invitation_table")
    .update({ invitation_status: "ACCEPTED" })
    .eq("invitation_id", invitationId);
  if (invitationError) throw invitationError;

  const { error: teamMemberError } = await supabaseClient
    .from("team_member_table")
    .insert({ team_member_team_id: teamId, team_member_user_id: userId })
    .select();
  if (teamMemberError) throw teamMemberError;
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

// Udpate team and team member group list
export const updateTeamAndTeamMemberGroupList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    teamGroupList: string[];
    upsertGroupName: string;
    addedGroupMembers: string[];
    deletedGroupMembers: string[];
  }
) => {
  const {
    teamId,
    teamGroupList,
    upsertGroupName,
    addedGroupMembers,
    deletedGroupMembers,
  } = params;
  const { error: teamError } = await supabaseClient
    .from("team_table")
    .update({ team_group_list: teamGroupList })
    .eq("team_id", teamId);
  if (teamError) throw teamError;

  if (addedGroupMembers.length !== 0) {
    let addTeamMemberCondition = "";
    addedGroupMembers.forEach((memberId) => {
      addTeamMemberCondition += `team_member_id.eq.${memberId}, `;
    });

    const { data: teamMemberList, error: teamMemberListError } =
      await supabaseClient
        .from("team_member_table")
        .select("*")
        .or(addTeamMemberCondition.slice(0, -2));
    if (teamMemberListError) throw teamMemberListError;

    const upsertTeamMemberData = teamMemberList.map((member) => {
      return {
        ...member,
        team_member_group_list: [
          ...member.team_member_group_list,
          upsertGroupName,
        ],
      };
    });

    const { error: teamMemberUpsertError } = await supabaseClient
      .from("team_member_table")
      .upsert(upsertTeamMemberData);

    if (teamMemberUpsertError) throw teamMemberUpsertError;
  }

  if (deletedGroupMembers.length !== 0) {
    let deleteTeamMemberCondition = "";
    deletedGroupMembers.forEach((memberId) => {
      deleteTeamMemberCondition += `team_member_id.eq.${memberId}, `;
    });

    const { data: teamMemberList, error: teamMemberListError } =
      await supabaseClient
        .from("team_member_table")
        .select("*")
        .or(deleteTeamMemberCondition.slice(0, -2));
    if (teamMemberListError) throw teamMemberListError;

    const upsertTeamMemberData = teamMemberList.map((member) => {
      return {
        ...member,
        team_member_group_list: member.team_member_group_list.filter(
          (group) => group !== upsertGroupName
        ),
      };
    });

    const { error: teamMemberUpsertError } = await supabaseClient
      .from("team_member_table")
      .upsert(upsertTeamMemberData);

    if (teamMemberUpsertError) throw teamMemberUpsertError;
  }
};

// Udpate team and team member project list
export const updateTeamAndTeamMemberProjectList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    teamProjectList: string[];
    upsertProjectName: string;
    addedProjectMembers: string[];
    deletedProjectMembers: string[];
  }
) => {
  const {
    teamId,
    teamProjectList,
    upsertProjectName,
    addedProjectMembers,
    deletedProjectMembers,
  } = params;
  const { error: teamError } = await supabaseClient
    .from("team_table")
    .update({ team_project_list: teamProjectList })
    .eq("team_id", teamId);
  if (teamError) throw teamError;

  if (addedProjectMembers.length !== 0) {
    let addTeamMemberCondition = "";
    addedProjectMembers.forEach((memberId) => {
      addTeamMemberCondition += `team_member_id.eq.${memberId}, `;
    });

    const { data: teamMemberList, error: teamMemberListError } =
      await supabaseClient
        .from("team_member_table")
        .select("*")
        .or(addTeamMemberCondition.slice(0, -2));
    if (teamMemberListError) throw teamMemberListError;

    const upsertTeamMemberData = teamMemberList.map((member) => {
      return {
        ...member,
        team_member_project_list: [
          ...member.team_member_project_list,
          upsertProjectName,
        ],
      };
    });

    const { error: teamMemberUpsertError } = await supabaseClient
      .from("team_member_table")
      .upsert(upsertTeamMemberData);

    if (teamMemberUpsertError) throw teamMemberUpsertError;
  }

  if (deletedProjectMembers.length !== 0) {
    let deleteTeamMemberCondition = "";
    deletedProjectMembers.forEach((memberId) => {
      deleteTeamMemberCondition += `team_member_id.eq.${memberId}, `;
    });

    const { data: teamMemberList, error: teamMemberListError } =
      await supabaseClient
        .from("team_member_table")
        .select("*")
        .or(deleteTeamMemberCondition.slice(0, -2));
    if (teamMemberListError) throw teamMemberListError;

    const upsertTeamMemberData = teamMemberList.map((member) => {
      return {
        ...member,
        team_member_project_list: member.team_member_project_list.filter(
          (project) => project !== upsertProjectName
        ),
      };
    });

    const { error: teamMemberUpsertError } = await supabaseClient
      .from("team_member_table")
      .upsert(upsertTeamMemberData);

    if (teamMemberUpsertError) throw teamMemberUpsertError;
  }
};

// Update form group
export const updateFormGroup = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    formId: string;
    groupList: string[];
    isForEveryone: boolean;
  }
) => {
  const { formId, groupList, isForEveryone } = params;
  const { data, error } = await supabaseClient
    .from("form_table")
    .update({ form_group: groupList, form_is_for_every_member: isForEveryone })
    .eq("form_id", formId);
  if (error) throw error;
  return data;
};
