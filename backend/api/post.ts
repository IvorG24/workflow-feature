import { RequestFormValues } from "@/components/CreateRequestPage/CreateRequestPage";
import { FormBuilderData } from "@/components/FormBuilder/FormBuilder";
import { TeamMemberType as GroupTeamMemberType } from "@/components/TeamPage/TeamGroup/GroupMembers";
import { TeamMemberType as ProjectTeamMemberType } from "@/components/TeamPage/TeamProject/ProjectMembers";
import { formslyPremadeFormsData } from "@/utils/constant";
import { Database } from "@/utils/database";
import {
  AttachmentBucketType,
  AttachmentTableInsert,
  CommentTableInsert,
  FormTableRow,
  FormType,
  InvitationTableRow,
  ItemDescriptionFieldTableInsert,
  ItemTableInsert,
  NotificationTableInsert,
  RequestResponseTableInsert,
  RequestSignerTableInsert,
  RequestTableRow,
  SupplierTableInsert,
  TeamGroupTableInsert,
  TeamMemberTableInsert,
  TeamProjectTableRow,
  TeamTableInsert,
  UserTableInsert,
  UserTableRow,
} from "@/utils/types";
import { SupabaseClient } from "@supabase/supabase-js";
import Compressor from "compressorjs";
import { v4 as uuidv4 } from "uuid";

// Upload Image
export const uploadImage = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    id: string;
    image: Blob | File;
    bucket: AttachmentBucketType;
  }
) => {
  const { id, image, bucket } = params;

  // compress image
  const compressedImage: Blob = await new Promise((resolve) => {
    new Compressor(image, {
      quality: 0.6,
      success(result) {
        resolve(result);
      },
      error(error) {
        throw error;
      },
    });
  });

  // upload image
  const { error: uploadError } = await supabaseClient.storage
    .from(bucket)
    .upload(`${id}`, compressedImage, { upsert: true });
  if (uploadError) throw uploadError;

  // get public url
  const { data } = supabaseClient.storage.from(bucket).getPublicUrl(`${id}`);

  return `${data.publicUrl}?id=${uuidv4()}`;
};

// Upload File
export const uploadFile = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    id: string;
    file: Blob | File;
    bucket: AttachmentBucketType;
  }
) => {
  const { id, file, bucket } = params;

  // upload file
  const { error: uploadError } = await supabaseClient.storage
    .from(bucket)
    .upload(`${id}`, file, { upsert: true });
  if (uploadError) throw uploadError;

  // get public url
  const { data } = supabaseClient.storage.from(bucket).getPublicUrl(`${id}`);

  return `${data.publicUrl}?id=${uuidv4()}`;
};

// Create User
export const createUser = async (
  supabaseClient: SupabaseClient<Database>,
  params: UserTableInsert
) => {
  const { user_phone_number } = params;

  const { data, error } = await supabaseClient
    .rpc("create_user", {
      input_data: {
        ...params,
        user_phone_number: user_phone_number || "",
      },
    })
    .select()
    .single();
  if (error) throw error;

  return data as UserTableRow;
};

// Create Team
export const createTeam = async (
  supabaseClient: SupabaseClient<Database>,
  params: TeamTableInsert
) => {
  const { data, error } = await supabaseClient
    .from("team_table")
    .insert(params)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Create Team Member
export const createTeamMember = async (
  supabaseClient: SupabaseClient<Database>,
  params: TeamMemberTableInsert
) => {
  const { data, error } = await supabaseClient
    .from("team_member_table")
    .insert(params)
    .select();
  if (error) throw error;
  return data;
};

// Create Team Invitation/s
export const createTeamInvitation = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    emailList: string[];
    teamMemberId: string;
    teamName: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("create_team_invitation", { input_data: params })
    .select("*");

  if (error) throw error;

  return data as InvitationTableRow[];
};

// Sign Up User
export const signUpUser = async (
  supabaseClient: SupabaseClient<Database>,
  params: { email: string; password: string }
) => {
  const { data, error } = await supabaseClient.auth.signUp({
    ...params,
  });
  if (error) throw error;
  return data;
};

// Sign In User
export const signInUser = async (
  supabaseClient: SupabaseClient<Database>,
  params: { email: string; password: string }
) => {
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      ...params,
    });
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: `${error}` };
  }
};

// Email verification
export const checkIfEmailExists = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    email: string;
  }
) => {
  const { data, error } = await supabaseClient
    .from("user_table")
    .select("user_email")
    .eq("user_email", params.email);
  if (error) throw error;
  return data.length > 0;
};

// Send Reset Password Email
export const sendResetPasswordEmail = async (
  supabaseClient: SupabaseClient<Database>,
  email: string
) => {
  await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  });
};

// Reset Password
export const resetPassword = async (
  supabaseClient: SupabaseClient<Database>,
  password: string
) => {
  const { error } = await supabaseClient.auth.updateUser({ password });
  return { error: error };
};

// Create User
export const createAttachment = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    attachmentData: AttachmentTableInsert;
    file: File;
  }
) => {
  const { file, attachmentData } = params;

  const { error: uploadError } = await supabaseClient.storage
    .from(attachmentData.attachment_bucket)
    .upload(attachmentData.attachment_value, file, { upsert: true });
  if (uploadError) throw uploadError;

  const { data, error } = await supabaseClient
    .from("attachment_table")
    .upsert({ ...attachmentData })
    .select()
    .single();

  if (error) throw error;

  // get public url
  const {
    data: { publicUrl },
  } = supabaseClient.storage
    .from(data.attachment_bucket)
    .getPublicUrl(`${data.attachment_value}`);

  const url = `${publicUrl}?id=${uuidv4()}`;

  return { data, url };
};

// Create notification
export const createNotification = async (
  supabaseClient: SupabaseClient<Database>,
  params: NotificationTableInsert
) => {
  const { error } = await supabaseClient
    .from("notification_table")
    .insert(params);
  if (error) throw error;
};

// Create comment
export const createComment = async (
  supabaseClient: SupabaseClient<Database>,
  params: CommentTableInsert
) => {
  const { data, error } = await supabaseClient
    .from("comment_table")
    .insert(params)
    .select("*")
    .single();
  if (error) throw error;

  return { data, error };
};

// Create item
export const createItem = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    itemData: ItemTableInsert;
    itemDescription: string[];
    formId: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("create_item", { input_data: params })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Create item description field
export const createItemDescriptionField = async (
  supabaseClient: SupabaseClient<Database>,
  params: ItemDescriptionFieldTableInsert
) => {
  const { data, error } = await supabaseClient
    .from("item_description_field_table")
    .insert(params)
    .select("*")
    .single();
  if (error) throw error;

  return data;
};

// Create request form
export const createRequestForm = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    formBuilderData: FormBuilderData;
    teamMemberId: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("create_request_form", {
      input_data: params,
    })
    .select()
    .single();

  if (error) throw error;
  return data as unknown as FormTableRow;
};

// Create request
export const createRequest = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    requestFormValues: RequestFormValues;
    formId: string;
    teamMemberId: string;
    signers: FormType["form_signer"];
    teamId: string;
    requesterName: string;
    formName: string;
    isFormslyForm: boolean;
    projectId: string;
  }
) => {
  const {
    requestFormValues,
    signers,
    teamId,
    requesterName,
    formName,
    isFormslyForm,
    projectId,
  } = params;

  const requestId = uuidv4();

  // get request response
  const requestResponseInput: RequestResponseTableInsert[] = [];
  for (const section of requestFormValues.sections) {
    for (const field of section.section_field) {
      let responseValue = field.field_response;
      if (
        typeof responseValue === "boolean" ||
        responseValue ||
        field.field_type === "SWITCH" ||
        (field.field_type === "NUMBER" && responseValue === 0)
      ) {
        if (field.field_type === "FILE") {
          const fileResponse = responseValue as File;
          const uploadId = `${field.field_id}${
            field.field_section_duplicatable_id
              ? `_${field.field_section_duplicatable_id}`
              : ""
          }`;
          if (fileResponse["type"].split("/")[0] === "image") {
            responseValue = await uploadImage(supabaseClient, {
              id: uploadId,
              image: fileResponse,
              bucket: "REQUEST_ATTACHMENTS",
            });
          } else {
            responseValue = await uploadFile(supabaseClient, {
              id: uploadId,
              file: fileResponse,
              bucket: "REQUEST_ATTACHMENTS",
            });
          }
        } else if (field.field_type === "SWITCH" && !field.field_response) {
          responseValue = false;
        }
        const response = {
          request_response: JSON.stringify(responseValue),
          request_response_duplicatable_section_id:
            field.field_section_duplicatable_id ?? null,
          request_response_field_id: field.field_id,
          request_response_request_id: requestId,
        };
        requestResponseInput.push(response);
      }
    }
  }

  // get request signers
  const requestSignerInput: RequestSignerTableInsert[] = [];

  // get signer notification
  const requestSignerNotificationInput: NotificationTableInsert[] = [];

  signers.forEach((signer) => {
    requestSignerInput.push({
      request_signer_signer_id: signer.signer_id,
      request_signer_request_id: requestId,
    });
    requestSignerNotificationInput.push({
      notification_app: "REQUEST",
      notification_content: `${requesterName} requested you to sign his/her ${formName} request`,
      notification_redirect_url: `/team-requests/requests/${requestId}`,
      notification_team_id: teamId,
      notification_type: "REQUEST",
      notification_user_id: signer.signer_team_member.team_member_user.user_id,
    });
  });

  const responseValues = requestResponseInput
    .map(
      (response) =>
        `('${response.request_response}',${
          response.request_response_duplicatable_section_id
            ? `'${response.request_response_duplicatable_section_id}'`
            : "NULL"
        },'${response.request_response_field_id}','${
          response.request_response_request_id
        }')`
    )
    .join(",");

  const signerValues = requestSignerInput
    .map(
      (signer) =>
        `('${signer.request_signer_signer_id}','${signer.request_signer_request_id}')`
    )
    .join(",");

  const notificationValues = requestSignerNotificationInput
    .map(
      (notification) =>
        `('${notification.notification_app}','${notification.notification_content}','${notification.notification_redirect_url}','${notification.notification_team_id}','${notification.notification_type}','${notification.notification_user_id}')`
    )
    .join(",");

  // create request
  const { data, error } = await supabaseClient
    .rpc("create_request", {
      input_data: {
        requestId,
        formId: params.formId,
        teamMemberId: params.teamMemberId,
        responseValues,
        signerValues,
        notificationValues,
        formName,
        isFormslyForm,
        projectId,
      },
    })
    .select()
    .single();

  if (error) throw error;

  return data as RequestTableRow;
};

// Create formsly premade forms
export const createFormslyPremadeForms = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamMemberId: string;
  }
) => {
  const { teamMemberId } = params;

  const { forms, sections, fieldWithId, fieldsWithoutId, options } =
    formslyPremadeFormsData(teamMemberId);

  const formValues = forms
    .map(
      (form) =>
        `('${form.form_id}','${form.form_name}','${form.form_description}','${form.form_app}','${form.form_is_formsly_form}','${form.form_is_hidden}','${form.form_team_member_id}','${form.form_is_disabled}')`
    )
    .join(",");

  const sectionValues = sections
    .map(
      (section) =>
        `('${section.section_form_id}','${section.section_id}','${section.section_is_duplicatable}','${section.section_name}','${section.section_order}')`
    )
    .join(",");

  const fieldWithIdValues = fieldWithId
    .map(
      (field) =>
        `('${field.field_id}','${field.field_is_read_only}','${field.field_is_required}','${field.field_name}','${field.field_order}','${field.field_section_id}','${field.field_type}')`
    )
    .join(",");

  const fieldsWithoutIdValues = fieldsWithoutId
    .map(
      (field) =>
        `('${field.field_is_read_only}','${field.field_is_required}','${field.field_name}','${field.field_order}','${field.field_section_id}','${field.field_type}')`
    )
    .join(",");

  const optionsValues = options
    .map(
      (option) =>
        `('${option.option_field_id}','${option.option_order}','${option.option_value}')`
    )
    .join(",");

  const { error } = await supabaseClient
    .rpc("create_formsly_premade_forms", {
      input_data: {
        formValues,
        sectionValues,
        fieldWithIdValues,
        fieldsWithoutIdValues,
        optionsValues,
      },
    })
    .select()
    .single();

  if (error) throw error;
};

// Create Supplier
export const createSupplier = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    supplierData: SupplierTableInsert;
  }
) => {
  const { supplierData } = params;
  const { data, error } = await supabaseClient
    .from("supplier_table")
    .insert(supplierData)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Create Team Group
export const createTeamGroup = async (
  supabaseClient: SupabaseClient<Database>,
  params: TeamGroupTableInsert
) => {
  const { data, error } = await supabaseClient
    .from("team_group_table")
    .insert(params)
    .select("*")
    .single();
  if (error) throw error;

  return data;
};

// Create Team Project
export const createTeamProject = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamProjectName: string;
    teamProjectInitials: string;
    teamProjectTeamId: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("create_team_project", {
      input_data: {
        ...params,
      },
    })
    .select()
    .single();
  if (error) throw error;

  return data as TeamProjectTableRow;
};

// Insert team member to group
export const insertGroupMember = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    groupId: string;
    teamMemberIdList: string[];
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("insert_group_member", { input_data: params })
    .select("*");

  if (error) throw error;

  return data as unknown as { data: GroupTeamMemberType[]; count: number };
};

// Insert team member to project
export const insertProjectMember = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    projectId: string;
    teamMemberIdList: string[];
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("insert_project_member", { input_data: params })
    .select("*");

  if (error) throw error;

  return data as unknown as { data: ProjectTeamMemberType[]; count: number };
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
