import { RequestSigner } from "@/components/FormBuilder/SignerSection";
import { MemoFormatFormValues } from "@/components/MemoFormatEditor/MemoFormatEditor";
import { TeamApproverChoiceType } from "@/components/TeamPage/TeamGroup/ApproverGroup";
import { Database } from "@/utils/database";
import { escapeQuotes } from "@/utils/string";
import {
  AppType,
  EditMemoType,
  EquipmentDescriptionTableUpdate,
  EquipmentLookupChoices,
  EquipmentLookupTableUpdate,
  EquipmentPartTableUpdate,
  EquipmentTableUpdate,
  ItemDescriptionTableUpdate,
  ItemForm,
  ItemTableInsert,
  JiraFormslyItemCategoryWithUserDataType,
  JiraItemCategoryTableUpdate,
  JiraOrganizationTableUpdate,
  JiraProjectTableUpdate,
  JiraUserAccountTableUpdate,
  JobTitleTableUpdate,
  MemberRoleType,
  MemoAgreementTableRow,
  MemoFormatAttachmentTableInsert,
  MemoFormatSubsectionTableUpdate,
  OtherExpensesTypeTableUpdate,
  SignerTableRow,
  TeamTableRow,
  TeamTableUpdate,
  TicketTableRow,
  TicketType,
  UserTableUpdate,
} from "@/utils/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { getCurrentDate, getMemoFormat } from "./get";
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
  const { data, error } = await supabaseClient
    .rpc("approve_or_reject_request", {
      input_data: { ...params },
    })
    .select("*")
    .single();

  if (error) throw error;

  return data as string;
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
  supabaseClient: SupabaseClient,
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
    currentTicketStatus: string;
  }
) => {
  const { ticketId, teamMemberId, currentTicketStatus } = params;
  const { count } = await supabaseClient
    .from("ticket_table")
    .select("", { count: "exact", head: true })
    .eq("ticket_id", ticketId)
    .is("ticket_approver_team_member_id", null);

  // validation in case admin ui is not updated
  const ticketIsAlreadyAssigned =
    Number(count) === 0 && currentTicketStatus === "PENDING";

  if (ticketIsAlreadyAssigned) {
    return null;
  }

  const { data, error } = await supabaseClient
    .rpc("assign_ticket", {
      input_data: {
        ticketId,
        teamMemberId,
      },
    })
    .select()
    .single();
  if (error) throw error;
  return data as TicketType;
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

export const cancelTeamInvitation = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    invitation_id: string;
  }
) => {
  const { invitation_id } = params;
  const { error } = await supabaseClient
    .from("invitation_table")
    .update({ invitation_is_disabled: true })
    .eq("invitation_id", invitation_id)
    .select();

  if (error) throw Error;
};

// Update item
export const updateItem = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    itemData: ItemTableInsert & { item_division_id_list: string[] };
    toAdd: ItemForm["descriptions"];
    toUpdate: ItemDescriptionTableUpdate[];
    toRemove: { fieldId: string; descriptionId: string }[];
    formId: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("update_item", { input_data: params })
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Update equipment
export const updateEquipment = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    equipmentData: EquipmentTableUpdate;
    category: string;
  }
) => {
  const { equipmentData, category } = params;
  if (!equipmentData.equipment_id) throw new Error();

  const { data, error } = await supabaseClient
    .from("equipment_table")
    .update(equipmentData)
    .eq("equipment_id", equipmentData.equipment_id)
    .select()
    .single();
  if (error) throw error;

  return {
    ...data,
    equipment_category: category,
  };
};

// Update equipment description
export const updateEquipmentDescription = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    equipmentDescriptionData: EquipmentDescriptionTableUpdate;
    brand: string;
    model: string;
  }
) => {
  const { equipmentDescriptionData, brand, model } = params;
  if (!equipmentDescriptionData.equipment_description_id) throw new Error();

  const { data, error } = await supabaseClient
    .from("equipment_description_table")
    .update(equipmentDescriptionData)
    .eq(
      "equipment_description_id",
      equipmentDescriptionData.equipment_description_id
    )
    .select()
    .single();
  if (error) throw error;

  return {
    ...data,
    equipment_description_brand: brand,
    equipment_description_model: model,
  };
};

// Update equipment part
export const updateEquipmentPart = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    equipmentPartData: EquipmentPartTableUpdate;
    name: string;
    brand: string;
    model: string;
    uom: string;
    category: string;
  }
) => {
  const { equipmentPartData, name, brand, model, uom, category } = params;
  if (!equipmentPartData.equipment_part_id) throw new Error();

  const { data, error } = await supabaseClient
    .from("equipment_part_table")
    .update(equipmentPartData)
    .eq("equipment_part_id", equipmentPartData.equipment_part_id)
    .select()
    .single();
  if (error) throw error;

  return {
    ...data,
    equipment_part_general_name: name,
    equipment_part_brand: brand,
    equipment_part_model: model,
    equipment_part_unit_of_measurement: uom,
    equipment_part_component_category: category,
  };
};

// Update equipment lookup
export const updateEquipmentLookup = async (
  supabaseClient: SupabaseClient,
  params: {
    equipmentLookupData: EquipmentLookupTableUpdate;
    tableName: EquipmentLookupChoices;
    lookupId: string;
  }
) => {
  const { equipmentLookupData, tableName, lookupId } = params;

  const { data, error } = await supabaseClient
    .from(`${tableName}_table`)
    .update(equipmentLookupData)
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

// Update lookup
export const updateLookup = async (
  supabaseClient: SupabaseClient,
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

  const currentDate = (await getCurrentDate(supabaseClient)).toISOString();

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
        `('${lineItem.memo_line_item_id}', '${escapeQuotes(
          lineItem.memo_line_item_content
        )}', '${lineItemIndex}', '${params.memo_id}')`
    )
    .join(",");

  const memoLineItemAttachmentTableValues = updatedLineItemData
    .filter(
      (lineItem) =>
        lineItem.memo_line_item_attachment?.memo_line_item_attachment_name
    )
    .map(
      ({ memo_line_item_id, memo_line_item_attachment: lineItemAttachment }) =>
        `('${
          lineItemAttachment?.memo_line_item_attachment_name
        }', '${escapeQuotes(
          lineItemAttachment?.memo_line_item_attachment_caption ?? ""
        )}', '${
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
  params: MemoFormatFormValues["formatSection"]
) => {
  const memoFormatSubsectionData: MemoFormatSubsectionTableUpdate[] = [];
  const memoFormatAttachmentData: MemoFormatAttachmentTableInsert[] = [];
  const removedMemoFormatAttachmentSubsectionIdList: string[] = [];

  const memoFormatSectionTableData = params.map((section) => {
    const { format_subsection, ...remainingSectionProps } = section;

    format_subsection.forEach((subsection) => {
      const { subsection_attachment, ...remainingSubsectionProps } = subsection;
      memoFormatSubsectionData.push(remainingSubsectionProps);

      if (subsection_attachment.length > 0) {
        subsection_attachment.forEach((attachment) => {
          if (attachment.memo_format_attachment_file) {
            const attachmentTableRow = {
              memo_format_attachment_id: attachment.memo_format_attachment_id,
              memo_format_attachment_name:
                attachment.memo_format_attachment_name,
              memo_format_attachment_url: attachment.memo_format_attachment_url,
              memo_format_attachment_subsection_id:
                attachment.memo_format_attachment_subsection_id,
              memo_format_attachment_order:
                attachment.memo_format_attachment_order,
            };
            memoFormatAttachmentData.push(
              attachmentTableRow as MemoFormatAttachmentTableInsert
            );
          }
        });
      } else {
        removedMemoFormatAttachmentSubsectionIdList.push(
          `${subsection.memo_format_subsection_id}`
        );
      }
    });

    return remainingSectionProps;
  });

  if (!memoFormatSubsectionData.length || !memoFormatSectionTableData.length) {
    throw new Error(
      "At least one of the required arrays is empty or undefined."
    );
  }

  const { error: memoFormatSectionTableError } = await supabaseClient
    .from("memo_format_section_table")
    .upsert(memoFormatSectionTableData);

  const { error: memoFormatSubsectionTableError } = await supabaseClient
    .from("memo_format_subsection_table")
    .upsert(memoFormatSubsectionData);

  if (memoFormatAttachmentData.length > 0) {
    const { error } = await supabaseClient
      .from("memo_format_attachment_table")
      .upsert(memoFormatAttachmentData);

    if (error) throw Error;
  }

  const existingAttachmentIdList = memoFormatAttachmentData.map(
    (d) => d.memo_format_attachment_id
  );

  // delete removed attachments
  const { error: memoFormatAttachmentDeleteError } = await supabaseClient
    .from("memo_format_attachment_table")
    .delete()
    .or(
      `memo_format_attachment_subsection_id.in.(${removedMemoFormatAttachmentSubsectionIdList.join(
        ","
      )}), memo_format_attachment_id.not.in.(${existingAttachmentIdList.join(
        ","
      )})`
    );

  if (
    memoFormatSectionTableError ||
    memoFormatSubsectionTableError ||
    memoFormatAttachmentDeleteError
  )
    throw Error;

  const updatedFormatData = await getMemoFormat(supabaseClient);

  return updatedFormatData;
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

// Update valid id status and add approver
export const approveOrRejectValidId = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    validIdId: string;
    approverUserId: string;
    status: "APPROVED" | "REJECTED";
  }
) => {
  const currentDate = (await getCurrentDate(supabaseClient)).toLocaleString();

  const { error } = await supabaseClient
    .from("user_valid_id_table")
    .update({
      user_valid_id_status: params.status,
      user_valid_id_approver_user_id: params.approverUserId,
      user_valid_id_date_updated: `${currentDate}`,
    })
    .eq("user_valid_id_id", params.validIdId);

  if (error) throw error;
};

// Update SLA Hours
export const updateSLAHours = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    form_sla_id: string;
    form_sla_hours: number;
  }
) => {
  const { form_sla_hours, form_sla_id } = params;
  const currentDate = (await getCurrentDate(supabaseClient)).toLocaleString();

  const { data, error } = await supabaseClient
    .from("form_sla_table")
    .update({ form_sla_hours, form_sla_date_updated: `${currentDate}` })
    .eq("form_sla_id", form_sla_id)
    .select("*, form_table!inner(*)");

  if (error) throw error;
  return data[0];
};

// update jira item category
export const updateJiraItemCategory = async (
  supabaseClient: SupabaseClient<Database>,
  params: JiraItemCategoryTableUpdate
) => {
  if (!params.jira_item_category_id) throw new Error();

  const { data, error } = await supabaseClient
    .from("jira_item_category_table")
    .update(params)
    .eq("jira_item_category_id", params.jira_item_category_id)
    .select(
      "*, assigned_jira_user: jira_item_user_table(jira_item_user_id, jira_item_user_account_id(jira_user_account_jira_id, jira_user_account_display_name, jira_user_account_id), jira_item_user_role_id(jira_user_role_id, jira_user_role_label))"
    )
    .maybeSingle();

  if (error) throw error;

  const assignedUser = data?.assigned_jira_user as unknown as {
    jira_item_user_id: string;
    jira_item_user_account_id: {
      jira_user_account_jira_id: string;
      jira_user_account_display_name: string;
      jira_user_account_id: string;
    };
    jira_item_user_role_id: {
      jira_user_role_id: string;
      jira_user_role_label: string;
    };
  }[];

  const formattedData = {
    ...data,
    assigned_jira_user:
      {
        ...assignedUser[0],
        ...assignedUser[0]?.jira_item_user_account_id,
        ...assignedUser[0]?.jira_item_user_role_id,
      } ?? null,
  };

  return formattedData as unknown as JiraFormslyItemCategoryWithUserDataType;
};

// update jira project
export const updateJiraProject = async (
  supabaseClient: SupabaseClient<Database>,
  params: JiraProjectTableUpdate
) => {
  if (!params.jira_project_id) throw new Error();
  const { error } = await supabaseClient
    .from("jira_project_table")
    .update(params)
    .eq("jira_project_id", params.jira_project_id);

  if (error) throw error;

  return { success: true, error: null };
};

// update jira user
export const updateJiraUser = async (
  supabaseClient: SupabaseClient<Database>,
  params: JiraUserAccountTableUpdate
) => {
  if (!params.jira_user_account_jira_id) throw new Error();
  const { error } = await supabaseClient
    .from("jira_user_account_table")
    .update(params)
    // todo: replace column with jira_user_account_id
    .eq("jira_user_account_jira_id", params.jira_user_account_jira_id);

  if (error) throw error;

  return { success: true, error: null };
};

// Update item category
export const updateItemCategory = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    formId: string;
    categoryId: string;
    category: string;
    teamMemberId: string;
  }
) => {
  const { error } = await supabaseClient.rpc("update_item_category", {
    input_data: params,
  });

  if (error) throw error;
};

// re-assign jira formsly project
export const updateJiraFormslyProject = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    formslyProjectId: string;
    jiraProjectId: string;
  }
) => {
  const { formslyProjectId, jiraProjectId } = params;

  const { data, error } = await supabaseClient
    .from("jira_formsly_project_table")
    .update({ jira_project_id: jiraProjectId })
    .eq("formsly_project_id", formslyProjectId)
    .select()
    .maybeSingle();
  if (error) throw error;

  return { success: true, data: data };
};

// update jira organization
export const updateJiraOrganization = async (
  supabaseClient: SupabaseClient<Database>,
  params: JiraOrganizationTableUpdate
) => {
  if (!params.jira_organization_id) throw new Error();
  const { error } = await supabaseClient
    .from("jira_organization_table")
    .update(params)
    .eq("jira_organization_id", params.jira_organization_id);

  if (error) throw error;

  return { success: true, error: null };
};

// re-assign jira formsly organization
export const updateJiraFormslyOrganization = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    formslyProjectId: string;
    jiraOrganizationId?: string;
  }
) => {
  const { formslyProjectId, jiraOrganizationId } = params;

  if (!jiraOrganizationId) {
    const { error } = await supabaseClient
      .from("jira_organization_team_project_table")
      .delete()
      .eq("jira_organization_team_project_project_id", formslyProjectId);

    if (error) throw error;

    return null;
  }

  const { data, error } = await supabaseClient
    .from("jira_organization_team_project_table")
    .update({
      jira_organization_team_project_organization_id: jiraOrganizationId,
    })
    .eq("jira_organization_team_project_project_id", formslyProjectId)
    .select()
    .maybeSingle();
  if (error) throw error;

  return data;
};

// add jira id and link to request
export const updateRequestJiraId = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    requestId: string;
    jiraId: string;
    jiraLink: string;
  }
) => {
  const { requestId, jiraId, jiraLink } = params;

  const { error } = await supabaseClient
    .from("request_table")
    .update({
      request_jira_id: jiraId,
      request_jira_link: jiraLink,
    })
    .eq("request_id", requestId);
  if (error) throw error;
  console.log(error);
};

// update jira project
export const updateJobTitle = async (
  supabaseClient: SupabaseClient<Database>,
  params: JobTitleTableUpdate
) => {
  if (!params.employee_job_title_id) throw new Error();
  const { error } = await supabaseClient
    .from("employee_job_title_table")
    .update(params)
    .eq("employee_job_title_id", params.employee_job_title_id);

  if (error) throw error;

  return { success: true, error: null };
};
