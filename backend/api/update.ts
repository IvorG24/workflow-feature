import { RequestFormValues } from "@/components/CreateRequestPage/CreateRequestPage";
import { RequestSigner } from "@/components/FormBuilder/SignerSection";
import { Database } from "@/utils/database";
import {
  AppType,
  FormWithResponseType,
  MemberRoleType,
  NotificationTableInsert,
  RequestResponseTableInsert,
  RequestSignerTableInsert,
  RequestWithResponseType,
  TeamTableUpdate,
  UserTableUpdate,
} from "@/utils/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { lowerCase } from "lodash";
import { v4 as uuidv4 } from "uuid";
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
    additionalInfo?: string;
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
    additionalInfo,
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
      .update({
        request_status: requestAction,
        request_additional_info: additionalInfo,
      })
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
  const formattedData = otpRequest as unknown as RequestWithResponseType;

  // request response data
  const remainingOTPRequestResponseData: RequestResponseTableInsert[] = [];
  const approvedOTPRequestResponseData: RequestResponseTableInsert[] = [];

  const itemList: Record<string, string> = {};
  const parentQuantityList: Record<string, number> = {};
  const remainingQuantityList: Record<string, number> = {};
  const approvedQuantityList: Record<string, number> = {};

  // build item with description
  formattedData.request_form.form_section.forEach((section) => {
    section.section_field.forEach((field) => {
      field.field_response.forEach((response) => {
        const dupId = `${response.request_response_duplicatable_section_id}`;
        if (field.field_name === "General Name") {
          itemList[dupId] = `${JSON.parse(response.request_response)} (`;
        } else if (field.field_name === "Quantity") {
          itemList[dupId] = itemList[dupId].replace(
            "*",
            `${response.request_response}`
          );
          parentQuantityList[dupId] = Number(response.request_response);
        } else if (field.field_name === "Unit of Measurement") {
          itemList[dupId] += `* ${JSON.parse(response.request_response)}) (`;
        } else if (!["Cost Code", "GL Account"].includes(field.field_name)) {
          itemList[dupId] += `${field.field_name}: ${JSON.parse(
            response.request_response
          )}, `;
        }
      });
    });
  });
  Object.keys(itemList).forEach((item) => {
    itemList[item] = `${itemList[item].slice(0, -2)})`;
  });

  let isNoRemainingQuantity = true;
  // subtract item quantity
  data.sections.forEach((section) => {
    for (const dupId in itemList) {
      if (itemList[dupId] === section.section_field[0].field_response) {
        approvedQuantityList[dupId] = Number(
          section.section_field[1].field_response
        );
        const remainingQuantity =
          parentQuantityList[dupId] -
          Number(section.section_field[1].field_response);

        remainingQuantityList[dupId] = remainingQuantity;
        if (remainingQuantity !== 0) {
          isNoRemainingQuantity = false;
        }
        break;
      }
    }
  });

  if (!isNoRemainingQuantity) {
    // get OTP form
    const { data: otpForm, error: otpFormError } = await supabaseClient
      .from("form_table")
      .select(
        `*, 
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
      .single();
    if (otpFormError) throw otpFormError;

    // update parent top request status
    const { error: updateRequestError } = await supabaseClient
      .from("request_table")
      .update({ request_status: "PAUSED" })
      .eq("request_id", otpID);
    if (updateRequestError) throw updateRequestError;

    // create new otp request
    const { data: newOTPRequest, error: newOTPRequestError } =
      await supabaseClient
        .from("request_table")
        .insert([
          {
            request_form_id: otpForm.form_id,
            request_team_member_id: teamMemberId,
            request_additional_info: "SOURCED OTP",
            request_status: "PENDING",
          },
          {
            request_form_id: otpForm.form_id,
            request_team_member_id: teamMemberId,
            request_additional_info: "AVAILABLE_INTERNALLY",
            request_status: "APPROVED",
          },
        ])
        .select();
    if (newOTPRequestError) throw newOTPRequestError;

    // populate request response data
    formattedData.request_form.form_section.forEach((section) => {
      section.section_field.forEach((field) => {
        field.field_response.forEach((response) => {
          const duplicateId = `${response.request_response_duplicatable_section_id}`;
          if (field.field_name === "Quantity") {
            if (remainingQuantityList[duplicateId] !== 0) {
              if (remainingQuantityList[duplicateId] === undefined) {
                remainingOTPRequestResponseData.push({
                  request_response: `${parentQuantityList[duplicateId]}`,
                  request_response_duplicatable_section_id:
                    response.request_response_duplicatable_section_id,
                  request_response_field_id: response.request_response_field_id,
                  request_response_request_id: newOTPRequest[0].request_id,
                });
              } else {
                remainingOTPRequestResponseData.push({
                  request_response: `${remainingQuantityList[duplicateId]}`,
                  request_response_duplicatable_section_id:
                    response.request_response_duplicatable_section_id,
                  request_response_field_id: response.request_response_field_id,
                  request_response_request_id: newOTPRequest[0].request_id,
                });
              }
            }

            if (approvedQuantityList[duplicateId]) {
              approvedOTPRequestResponseData.push({
                request_response: `${approvedQuantityList[duplicateId]}`,
                request_response_duplicatable_section_id:
                  response.request_response_duplicatable_section_id,
                request_response_field_id: response.request_response_field_id,
                request_response_request_id: newOTPRequest[1].request_id,
              });
            }
          } else if (field.field_name === "Parent OTP ID") {
            remainingOTPRequestResponseData.push({
              request_response: `"${otpID}"`,
              request_response_duplicatable_section_id:
                response.request_response_duplicatable_section_id,
              request_response_field_id: response.request_response_field_id,
              request_response_request_id: newOTPRequest[0].request_id,
            });
            approvedOTPRequestResponseData.push({
              request_response: `"${otpID}"`,
              request_response_duplicatable_section_id:
                response.request_response_duplicatable_section_id,
              request_response_field_id: response.request_response_field_id,
              request_response_request_id: newOTPRequest[1].request_id,
            });
          } else {
            if (
              remainingQuantityList[duplicateId] !== 0 ||
              field.field_order < 5
            ) {
              remainingOTPRequestResponseData.push({
                request_response: response.request_response,
                request_response_duplicatable_section_id:
                  response.request_response_duplicatable_section_id,
                request_response_field_id: response.request_response_field_id,
                request_response_request_id: newOTPRequest[0].request_id,
              });
            }
            if (approvedQuantityList[duplicateId]) {
              approvedOTPRequestResponseData.push({
                request_response: response.request_response,
                request_response_duplicatable_section_id:
                  response.request_response_duplicatable_section_id,
                request_response_field_id: response.request_response_field_id,
                request_response_request_id: newOTPRequest[1].request_id,
              });
            }
          }
        });
      });
    });

    // get request signers
    const remainingRequestSignerInput: RequestSignerTableInsert[] = [];
    const approvedRequestSignerInput: RequestSignerTableInsert[] = [];

    // request signer notification
    const signerNotificationInput: NotificationTableInsert[] = [];

    const formattedOtpForm = otpForm as unknown as FormWithResponseType;
    formattedOtpForm.form_signer.forEach((signer) => {
      remainingRequestSignerInput.push({
        request_signer_id: uuidv4(),
        request_signer_signer_id: signer.signer_id,
        request_signer_request_id: newOTPRequest[0].request_id,
        request_signer_status: "PENDING",
      });

      // remaining otp request signer notification
      signerNotificationInput.push({
        notification_app: "REQUEST",
        notification_type: "REQUEST",
        notification_content: `${formattedData.request_team_member.team_member_user.user_first_name} ${formattedData.request_team_member.team_member_user.user_last_name} requested you to sign his/her Order to Purchase request`,
        notification_redirect_url: `/team-requests/requests/${newOTPRequest[0].request_id}`,
        notification_user_id:
          signer.signer_team_member.team_member_user.user_id,
        notification_team_id: teamId,
      });
      if (signer.signer_team_member.team_member_id === teamMemberId) {
        approvedRequestSignerInput.push({
          request_signer_id: uuidv4(),
          request_signer_signer_id: signer.signer_id,
          request_signer_request_id: newOTPRequest[1].request_id,
          request_signer_status: "APPROVED",
        });
      } else {
        approvedRequestSignerInput.push({
          request_signer_id: uuidv4(),
          request_signer_signer_id: signer.signer_id,
          request_signer_request_id: newOTPRequest[1].request_id,
          request_signer_status: "PENDING",
        });
      }
    });

    // create request responses
    const { error: requestResponseError } = await supabaseClient
      .from("request_response_table")
      .insert([
        ...remainingOTPRequestResponseData,
        ...approvedOTPRequestResponseData,
      ]);
    if (requestResponseError) throw requestResponseError;

    // create request signers
    const { error: requestSignerError } = await supabaseClient
      .from("request_signer_table")
      .upsert([
        ...remainingRequestSignerInput,
        ...approvedRequestSignerInput,
        {
          request_signer_id: formattedData.request_signer[0].request_signer_id,
          request_signer_request_id:
            formattedData.request_signer[0].request_signer_request_id,
          request_signer_signer_id:
            formattedData.request_signer[0].request_signer_signer_id,
          request_signer_status: "PAUSED",
        },
      ]);
    if (requestSignerError) throw requestSignerError;

    await supabaseClient.from("comment_table").insert([
      // create comment for parent otp
      {
        comment_request_id: otpID,
        comment_team_member_id: teamMemberId,
        comment_type: `ACTION_PAUSED`,
        comment_content: `${signerFullName} paused this request`,
      },
      // create comment for approved otp
      {
        comment_request_id: newOTPRequest[1].request_id,
        comment_team_member_id: teamMemberId,
        comment_type: `ACTION_APPROVED`,
        comment_content: `${signerFullName} approved this request`,
      },
    ]);

    // create notification for parent otp requestor
    await supabaseClient.from("notification_table").insert([
      ...signerNotificationInput,
      {
        notification_app: "REQUEST",
        notification_type: "PAUSE",
        notification_content: `${signerFullName} paused your Order to Purchase request`,
        notification_redirect_url: `/team-requests/requests/${otpID}`,
        notification_user_id:
          formattedData.request_team_member.team_member_user.user_id,
        notification_team_id: teamId,
      },
      {
        notification_app: "REQUEST",
        notification_type: "APPROVE",
        notification_content: `${signerFullName} approved your Order to Purchase request`,
        notification_redirect_url: `/team-requests/requests/${newOTPRequest[1].request_id}`,
        notification_user_id:
          formattedData.request_team_member.team_member_user.user_id,
        notification_team_id: teamId,
      },
    ]);

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
