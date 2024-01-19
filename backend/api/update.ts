import { RequestSigner } from "@/components/FormBuilder/SignerSection";
import { TeamApproverChoiceType } from "@/components/TeamPage/TeamGroup/ApproverGroup";
import { Database } from "@/utils/database";
import { parseMemoFormatTypeToDB } from "@/utils/functions";
import {
  AppType,
  EditMemoType,
  MemberRoleType,
  MemoAgreementTableRow,
  MemoFormatType,
  OtherExpensesTypeTableUpdate,
  SignerTableRow,
  TeamTableRow,
  TeamTableUpdate,
  TicketTableRow,
  TicketType,
  UserTableUpdate,
} from "@/utils/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { getCurrentDate } from "./get";
import { uploadImage } from "./post";

// Update Team
export const updateTeam = async (
  supabaseClient: SupabaseClient<Database>,
  params: TeamTableUpdate
) => {
  const { data, error } = await supabaseClient
    .from("team_table")
    .update(params)
    .eq("team_id", `${params.team_id}`)
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
    teamId: string | null;
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
export const updateUser = async (
  supabaseClient: SupabaseClient<Database>,
  params: UserTableUpdate
) => {
  const { error } = await supabaseClient
    .from("user_table")
    .update(params)
    .eq("user_id", `${params.user_id}`);
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
    jiraId?: string;
    jiraLink?: string;
    requestFormslyId?: string;
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

// Update approver role
export const updateApproverRole = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamApproverIdList: string[];
    updateRole: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc("update_multiple_approver", {
    input_data: params,
  });
  if (error) throw error;
  return data as unknown as TeamApproverChoiceType[];
};

// Update approver role
export const updateAdminRole = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamAdminIdList: string[];
    updateRole: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc("update_multiple_admin", {
    input_data: params,
  });
  if (error) throw error;
  return data as unknown as TeamApproverChoiceType[];
};

// Update OTP ID
export const updateOtpId = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    requestID: string;
    otpID: string;
  }
) => {
  const { requestID, otpID } = params;
  const { error } = await supabaseClient
    .from("request_table")
    .update({ request_otp_id: otpID })
    .eq("request_id", requestID);
  if (error) throw error;
};

// Assign ticket
export const assignTicket = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    ticketId: string;
    teamMemberId: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("assign_ticket", {
      input_data: params,
    })
    .select()
    .single();
  if (error) throw error;
  return data as TicketType;
};

// Edit ticket response
export const editTicketResponse = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    ticketId: string;
    title: string;
    description: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("edit_ticket_response", {
      input_data: params,
    })
    .select()
    .single();
  if (error) throw error;
  return data as TicketTableRow;
};

// update ticket status
export const updateTicketStatus = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    ticketId: string;
    status: string;
    rejectionMessage: string | null;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("update_ticket_status", {
      input_data: params,
    })
    .select()
    .single();
  if (error) throw error;
  return data as TicketTableRow;
};

// reverse request approval
export const reverseRequestApproval = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    requestAction: "REVERSED";
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
  const { error } = await supabaseClient.rpc("reverse_request_approval", {
    input_data: { ...params },
  });

  if (error) throw error;
};

// leave team
export const leaveTeam = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    teamMemberId: string;
  }
) => {
  const { teamId, teamMemberId } = params;

  const { error } = await supabaseClient.rpc("leave_team", {
    team_id: teamId,
    team_member_id: teamMemberId,
  });

  if (error) throw error;
};

// Update lookup
export const updateLookup = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    lookupData: JSON;
    tableName: string;
    lookupId: string;
  }
) => {
  const { lookupData, tableName, lookupId } = params;

  const { data, error } = await supabaseClient
    .from(`${tableName}_table`)
    .update(lookupData)
    .eq(`${tableName}_id`, lookupId)
    .select()
    .single();
  if (error) throw error;

  const id = `${tableName}_id`;
  const value = tableName;
  const status = `${tableName}_is_available`;

  const formattedData = data as unknown as {
    [key: string]: string;
  };

  return {
    id: formattedData[id],
    status: Boolean(formattedData[status]),
    value: formattedData[value],
  };
};

// approve or reject memo
export const approveOrRejectMemo = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    memoSignerId: string;
    memoId: string;
    action: string;
    isPrimarySigner: boolean;
    memoSignerTeamMemberId: string;
  }
) => {
  const {
    memoSignerId,
    memoId,
    action,
    isPrimarySigner,
    memoSignerTeamMemberId,
  } = params;

  const currentDate = (await getCurrentDate(supabaseClient)).toLocaleString();

  const { error } = await supabaseClient
    .from("memo_signer_table")
    .update({
      memo_signer_status: action,
      memo_signer_date_signed: `${currentDate}`,
    })
    .eq("memo_signer_id", memoSignerId);
  if (error) throw Error;

  if (isPrimarySigner) {
    const { error } = await supabaseClient
      .from("memo_status_table")
      .update({
        memo_status: action,
        memo_status_date_updated: `${currentDate}`,
      })
      .eq("memo_status_memo_id", memoId);
    if (error) throw Error;
  }

  // agree to memo
  if (action.toLowerCase() === "approved") {
    const { count } = await supabaseClient
      .from("memo_agreement_table")
      .select("*", { count: "exact" })
      .eq("memo_agreement_by_team_member_id", memoSignerTeamMemberId)
      .eq("memo_agreement_memo_id", memoId);

    if (Number(count) === 0) {
      const { data, error: MemoAgreementError } = await supabaseClient
        .from("memo_agreement_table")
        .insert({
          memo_agreement_by_team_member_id: memoSignerTeamMemberId,
          memo_agreement_memo_id: memoId,
        })
        .select(
          "*, memo_agreement_by_team_member: memo_agreement_by_team_member_id!inner(user_data: team_member_user_id(user_id, user_avatar, user_first_name, user_last_name, user_employee_number: user_employee_number_table(user_employee_number)))"
        )
        .maybeSingle();
      if (MemoAgreementError) throw Error;

      return data as unknown as MemoAgreementTableRow & {
        memo_agreement_by_team_member: {
          user_data: {
            user_avatar: string;
            user_id: string;
            user_first_name: string;
            user_last_name: string;
            user_employee_number: {
              user_employee_number: string;
            }[];
          };
        };
      };
    }
  }
};

// update memo
export const updateMemo = async (
  supabaseClient: SupabaseClient<Database>,
  params: EditMemoType
) => {
  const updatedLineItemData: EditMemoType["memo_line_item_list"] =
    await processAllMemoLineItems(params.memo_line_item_list, supabaseClient);

  const memoSignerTableValues = params.memo_signer_list
    .map(
      (signer, signerIndex) =>
        `('${signer.memo_signer_is_primary}', '${signerIndex}', '${signer.memo_signer_team_member?.team_member_id}', '${params.memo_id}')`
    )
    .join(",");

  const memoLineItemTableValues = updatedLineItemData
    .map(
      (lineItem, lineItemIndex) =>
        `('${lineItem.memo_line_item_id}', '${lineItem.memo_line_item_content}', '${lineItemIndex}', '${params.memo_id}')`
    )
    .join(",");

  const memoLineItemAttachmentTableValues = updatedLineItemData
    .filter(
      (lineItem) =>
        lineItem.memo_line_item_attachment?.memo_line_item_attachment_name
    )
    .map(
      ({ memo_line_item_id, memo_line_item_attachment: lineItemAttachment }) =>
        `('${lineItemAttachment?.memo_line_item_attachment_name}', '${
          lineItemAttachment?.memo_line_item_attachment_caption ?? ""
        }', '${
          lineItemAttachment?.memo_line_item_attachment_storage_bucket
        }', '${
          lineItemAttachment?.memo_line_item_attachment_public_url
        }', '${memo_line_item_id}')`
    )
    .join(",");

  const memoLineItemIdFilter = params.memo_line_item_list
    .map((lineItem) => `'${lineItem.memo_line_item_id}'`)
    .join(",");

  const input_data = {
    memo_id: params.memo_id,
    memo_subject: params.memo_subject,
    memoSignerTableValues,
    memoLineItemTableValues,
    memoLineItemAttachmentTableValues,
    memoLineItemIdFilter,
  };

  const { error } = await supabaseClient.rpc("edit_memo", { input_data });

  if (error) throw Error;
};

const processAllMemoLineItems = async (
  lineItemData: EditMemoType["memo_line_item_list"],
  supabaseClient: SupabaseClient<Database>
) => {
  const processedLineItems = await Promise.all(
    lineItemData.map(async (lineItem) => {
      const file =
        lineItem.memo_line_item_attachment &&
        lineItem.memo_line_item_attachment.memo_line_item_attachment_file;

      if (file) {
        const bucket = "MEMO_ATTACHMENTS";
        const attachmentPublicUrl = await uploadImage(supabaseClient, {
          id: `${lineItem.memo_line_item_id}-${file.name}`,
          image: file,
          bucket,
        });

        return {
          memo_line_item_id: lineItem.memo_line_item_id,
          memo_line_item_content: lineItem.memo_line_item_content,
          memo_line_item_memo_id: lineItem.memo_line_item_memo_id,
          memo_line_item_attachment: {
            memo_line_item_attachment_public_url: attachmentPublicUrl,
            memo_line_item_attachment_storage_bucket: bucket,
            memo_line_item_attachment_name: file.name,
            memo_line_item_attachment_caption:
              lineItem.memo_line_item_attachment
                ?.memo_line_item_attachment_caption ?? "",
          },
        };
      }

      return {
        memo_line_item_id: lineItem.memo_line_item_id,
        memo_line_item_content: lineItem.memo_line_item_content,
        memo_line_item_memo_id: lineItem.memo_line_item_memo_id,
      };
    })
  );

  return JSON.parse(JSON.stringify(processedLineItems));
};

export const updateMemoFormat = async (
  supabaseClient: SupabaseClient<Database>,
  params: MemoFormatType
) => {
  const columnListToUpdate = parseMemoFormatTypeToDB(params);
  const { error } = await supabaseClient
    .from("memo_format_table")
    .update(columnListToUpdate)
    .eq("memo_format_id", params.memo_format_id);

  if (error) throw Error;
};

// Update other expenses type
export const updateOtherExpensesType = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    updateData: OtherExpensesTypeTableUpdate;
    otherExpensesTypeId: string;
  }
) => {
  const { updateData, otherExpensesTypeId } = params;

  const { data, error } = await supabaseClient
    .from("other_expenses_type_table")
    .update(updateData)
    .eq("other_expenses_type_id", otherExpensesTypeId)
    .select()
    .single();
  if (error) throw error;

  return data;
};
