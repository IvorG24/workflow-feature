import { RequestFormValues } from "@/components/CreateRequestPage/CreateRequestPage";
import { RequestSigner } from "@/components/FormBuilder/SignerSection";
import { generateSectionWithDuplicateList } from "@/utils/arrayFunctions/arrayFunctions";
import { Database } from "@/utils/database";
import {
  AppType,
  MemberRoleType,
  RequestWithResponseType,
  SignerTableRow,
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
    additionalInfo?: string;
  }
) => {
  const { error } = await supabaseClient.rpc("approve_or_reject_request", {
    input_data: { ...params, additionalInfo: params?.additionalInfo || "" },
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
    signers: (RequestSigner & { signer_is_disabled: boolean })[];
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

  const { error } = await supabaseClient
    .rpc("accept_team_invitation", {
      invitation_id: invitationId,
      team_id: teamId,
      user_id: userId,
    })
    .select("*")
    .single();
  if (error) throw error;
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

// Update team and team member group list
export const updateTeamAndTeamMemberGroupList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    teamGroupList: string[];
    upsertGroupName: string;
    addedGroupMembers: string[];
    deletedGroupMembers: string[];
    previousName?: string;
    previousGroupMembers?: string[];
  }
) => {
  const { error } = await supabaseClient.rpc(
    "update_team_and_team_member_group_list",
    {
      input_data: params,
    }
  );

  if (error) throw error;
};

// Update team and team member project list
export const updateTeamAndTeamMemberProjectList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    teamProjectList: string[];
    upsertProjectName: string;
    addedProjectMembers: string[];
    deletedProjectMembers: string[];
    previousName?: string;
    previousProjectMembers?: string[];
  }
) => {
  const { error } = await supabaseClient.rpc(
    "update_team_and_team_member_project_list",
    {
      input_data: params,
    }
  );

  if (error) throw error;
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

// Split parent otp
export const splitParentOtp = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    otpID: string;
    teamMemberId: string;
    data: RequestFormValues;
    signerFullName: string;
    teamId: string;
  }
) => {
  const { otpID, teamMemberId, data, signerFullName, teamId } = params;

  // fetch the parent otp
  const { data: otpRequest, error: otpRequestError } = await supabaseClient
    .from("request_table")
    .select(
      `*, 
      request_form: request_form_id!inner(
        form_id, 
        form_name, 
        form_description, 
        form_is_formsly_form, 
        form_section: section_table!inner(
          *, 
          section_field: field_table!inner(
            *, 
            field_option: option_table(*), 
            field_response: request_response_table!inner(*)
          )
        )
      ),
      request_team_member: request_team_member_id(
        team_member_user: team_member_user_id(
          user_id,
          user_first_name,
          user_last_name
        )
      ),
      request_signer: request_signer_table!inner(
        request_signer_id,
        request_signer_signer_id,
        request_signer_request_id,
        request_signer_signer: request_signer_signer_id!inner(
          signer_team_member_id
        )
      )`
    )
    .eq("request_id", otpID)
    .eq("request_is_disabled", false)
    .eq(
      "request_form.form_section.section_field.field_response.request_response_request_id",
      otpID
    )
    .eq(
      "request_signer.request_signer_signer.signer_team_member_id",
      teamMemberId
    )
    .maybeSingle();
  if (otpRequestError) throw otpRequestError;

  const formattedOTP = otpRequest as unknown as RequestWithResponseType;
  const formattedSection = generateSectionWithDuplicateList(
    formattedOTP.request_form.form_section
  );
  const formattedData = {
    ...formattedOTP,
    request_form: {
      ...formattedOTP.request_form,
      form_section: formattedSection,
    },
  };

  const remainingQuantityList: number[] = [];
  const approvedQuantityList: number[] = [];

  // input the Item Section
  const matchedIndex: number[] = [];

  // loop parent otp sections
  formattedSection.slice(2).map((section, sectionIndex) => {
    // loop input sections
    for (let j = 0; j < data.sections.length; j++) {
      if (matchedIndex.includes(j)) {
        continue;
      }
      const item = `${data.sections[j].section_field[0].field_response}`;
      let descriptionMatch = true;

      // check if general name matches
      const generalNameMatch = item.includes(
        JSON.parse(
          `${section.section_field[0].field_response?.request_response}`
        )
      );
      if (generalNameMatch) {
        for (let i = 5; i < section.section_field.length; i++) {
          if (section.section_field[i].field_response) {
            const fieldNameWithResponse = `${
              section.section_field[i].field_name
            }: ${JSON.parse(
              `${section.section_field[i].field_response?.request_response}`
            )}`;

            if (!item.includes(fieldNameWithResponse)) {
              descriptionMatch = false;
              break;
            }
          }
        }
        if (descriptionMatch) {
          matchedIndex.push(j);
          remainingQuantityList.push(
            Number(section.section_field[2].field_response?.request_response) -
              Number(data.sections[j].section_field[1].field_response)
          );
          approvedQuantityList.push(
            Number(data.sections[j].section_field[1].field_response)
          );
        }
      }
    }

    if (remainingQuantityList[sectionIndex] === undefined) {
      remainingQuantityList.push(
        Number(section.section_field[2].field_response?.request_response)
      );
    }
    if (approvedQuantityList[sectionIndex] === undefined) {
      approvedQuantityList.push(0);
    }
  });

  let isNoRemaining = true;
  for (const remaining of remainingQuantityList) {
    if (Number(remaining) !== 0) {
      isNoRemaining = false;
      break;
    }
  }

  if (!isNoRemaining) {
    // get OTP form
    const { data: otpForm, error: otpFormError } = await supabaseClient
      .from("form_table")
      .select(
        `*, 
        form_team_member: form_team_member_id!inner(*),
        form_signer: signer_table!inner(
          signer_id, 
          signer_is_primary_signer, 
          signer_action, 
          signer_order,
          signer_is_disabled, 
          signer_team_member: signer_team_member_id(
            team_member_id, 
            team_member_user: team_member_user_id(
              user_id, 
              user_first_name, 
              user_last_name, 
              user_avatar
            )
          )
        )`
      )
      .eq("form_name", "Order to Purchase")
      .eq("form_is_formsly_form", true)
      .eq("form_team_member.team_member_team_id", teamId)
      .single();
    if (otpFormError) throw otpFormError;

    const { error } = await supabaseClient.rpc("split_otp", {
      input_data: {
        otpForm,
        formattedSection,
        teamMemberId,
        otpID,
        remainingQuantityList,
        approvedQuantityList,
        formattedData,
        teamId,
        signerFullName,
      },
    });
    if (error) throw error;

    return true;
  } else {
    await approveOrRejectRequest(supabaseClient, {
      requestAction: "APPROVED",
      requestId: otpID,
      isPrimarySigner: true,
      requestSignerId: formattedData.request_signer[0].request_signer_signer_id,
      requestOwnerId:
        formattedData.request_team_member.team_member_user.user_id,
      signerFullName: signerFullName,
      formName: "Order to Purchase",
      memberId: teamMemberId,
      teamId: teamId,
      additionalInfo: "AVAILABLE_INTERNALLY",
    });

    return false;
  }
};
