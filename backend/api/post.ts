import { RequestFormValues } from "@/components/CreateRequestPage/CreateRequestPage";
import { FormBuilderData } from "@/components/FormBuilder/FormBuilder";
import { TeamMemberType as GroupTeamMemberType } from "@/components/TeamPage/TeamGroup/GroupMembers";
import { TeamMemberType as ProjectTeamMemberType } from "@/components/TeamPage/TeamProject/ProjectMembers";
import { formslyPremadeFormsData } from "@/utils/constant";
import { Database } from "@/utils/database";
import { escapeQuotes, parseJSONIfValid } from "@/utils/string";
import {
  AddressTableInsert,
  AttachmentBucketType,
  AttachmentTableInsert,
  CommentTableInsert,
  CreateTicketFormValues,
  EquipmentDescriptionTableInsert,
  EquipmentPartTableInsert,
  EquipmentTableInsert,
  FormTableRow,
  FormType,
  InvitationTableRow,
  ItemDescriptionFieldTableInsert,
  ItemDescriptionFieldUOMTableInsert,
  ItemDescriptionTableUpdate,
  ItemForm,
  ItemTableInsert,
  MemoAgreementTableRow,
  MemoLineItem,
  MemoTableRow,
  NotificationTableInsert,
  OtherExpensesTypeTableInsert,
  ReferenceMemoType,
  RequestResponseTableInsert,
  RequestSignerTableInsert,
  RequestTableRow,
  RequestWithResponseType,
  ServiceForm,
  ServiceScopeChoiceTableInsert,
  ServiceTableInsert,
  SupplierTableInsert,
  TeamGroupTableInsert,
  TeamMemberTableInsert,
  TeamProjectWithAddressType,
  TeamTableInsert,
  TicketCommentTableInsert,
  TicketResponseTableInsert,
  TicketTableRow,
  UserTableInsert,
  UserTableRow,
  UserValidIDTableInsert,
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
  params: UserTableInsert & { user_employee_number: string }
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

// Create Team Member with team name
export const createTeamMemberReturnTeamName = async (
  supabaseClient: SupabaseClient<Database>,
  params: TeamMemberTableInsert
) => {
  const { data, error } = await supabaseClient
    .from("team_member_table")
    .insert(params)
    .select("*, team:team_table(team_name)");
  if (error) throw error;
  return data as unknown as [
    {
      team: { team_name: string };
    } & TeamMemberTableInsert
  ];
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

  if (data.user && data.user.identities && data.user.identities?.length > 0) {
    return { data, error: null };
  } else {
    return { data, error: "Email already registered." };
  }
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
    itemData: ItemTableInsert & {
      item_division_id_list: string[];
      item_level_three_description?: string;
    };
    itemDescription: {
      description: string;
      withUoM: boolean;
      order: number;
    }[];
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

// Update item
export const updateItem = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    itemData: ItemTableInsert & {
      item_division_id_list: string[];
      item_level_three_description?: string;
    };
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

// Create item description field
export const createItemDescriptionField = async (
  supabaseClient: SupabaseClient<Database>,
  params: (ItemDescriptionFieldTableInsert & {
    item_description_field_uom: string | null;
  })[]
) => {
  const itemDescriptionFieldUomInput: ItemDescriptionFieldUOMTableInsert[] = [];
  const itemDescriptionFieldInput = params.map((field) => {
    const fieldId = uuidv4();
    if (field.item_description_field_uom) {
      itemDescriptionFieldUomInput.push({
        item_description_field_uom_item_description_field_id: fieldId,
        item_description_field_uom: field.item_description_field_uom,
      });
    }
    return {
      item_description_field_id: fieldId,
      item_description_field_value: field.item_description_field_value,
      item_description_field_is_available:
        field.item_description_field_is_available,
      item_description_field_item_description_id:
        field.item_description_field_item_description_id,
      item_description_field_encoder_team_member_id:
        field.item_description_field_encoder_team_member_id,
    };
  });
  const { data: item, error: itemError } = await supabaseClient
    .from("item_description_field_table")
    .insert(itemDescriptionFieldInput)
    .select("*");
  if (itemError) throw itemError;
  const { data: uom, error: uomError } = await supabaseClient
    .from("item_description_field_uom_table")
    .insert(itemDescriptionFieldUomInput)
    .select("*");
  if (uomError) throw uomError;
  return item.map((item) => {
    const itemUom = uom.find(
      (value) =>
        value.item_description_field_uom_item_description_field_id ===
        item.item_description_field_id
    );
    return {
      ...item,
      item_description_field_uom: itemUom?.item_description_field_uom,
    };
  });
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
    teamName: string;
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
    teamName,
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
  const signerIdList: string[] = [];

  // get signer notification
  const requestSignerNotificationInput: NotificationTableInsert[] = [];

  signers.forEach((signer) => {
    if (!signerIdList.includes(signer.signer_id)) {
      requestSignerInput.push({
        request_signer_signer_id: signer.signer_id,
        request_signer_request_id: requestId,
      });
      requestSignerNotificationInput.push({
        notification_app: "REQUEST",
        notification_content: `${requesterName} requested you to sign his/her ${formName} request`,
        notification_redirect_url: `/${teamName}/requests/${requestId}`,
        notification_team_id: teamId,
        notification_type: "REQUEST",
        notification_user_id:
          signer.signer_team_member.team_member_user.user_id,
      });
      signerIdList.push(signer.signer_id);
    }
  });

  const responseValues = requestResponseInput
    .map((response) => {
      const escapedResponse = response.request_response.replace(/'/g, "''");
      return `('${escapedResponse}',${
        response.request_response_duplicatable_section_id
          ? `'${response.request_response_duplicatable_section_id}'`
          : "NULL"
      },'${response.request_response_field_id}','${
        response.request_response_request_id
      }')`;
    })
    .join(",");

  const signerValues = requestSignerInput
    .map(
      (signer) =>
        `('${signer.request_signer_signer_id}','${signer.request_signer_request_id}')`
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
        requestSignerNotificationInput,
        formName,
        isFormslyForm,
        projectId,
        teamId,
      },
    })
    .select()
    .single();
  if (error) throw error;

  return data as RequestTableRow;
};

// Edit request
export const editRequest = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    requestId: string;
    requestFormValues: {
      sections: RequestWithResponseType["request_form"]["form_section"];
    };
    signers: FormType["form_signer"];
    teamId: string;
    requesterName: string;
    formName: string;
    teamName: string;
  }
) => {
  const {
    requestId,
    requestFormValues,
    signers,
    teamId,
    requesterName,
    formName,
    teamName,
  } = params;

  // get request response
  const requestResponseInput: RequestResponseTableInsert[] = [];
  for (const section of requestFormValues.sections) {
    const duplicatableSectionId = section.section_is_duplicatable
      ? uuidv4()
      : null;
    for (const field of section.section_field) {
      let responseValue = field?.field_response[0]?.request_response as unknown;
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
        const parsedResponse = parseJSONIfValid(`${responseValue}`);

        if (field.field_type === "MULTISELECT") {
          if (typeof responseValue === "string") responseValue = parsedResponse;
        } else {
          responseValue =
            parsedResponse.length >= 2 &&
            parsedResponse[0] === '"' &&
            parsedResponse[parsedResponse.length - 1] === '"'
              ? parsedResponse.slice(1, -1)
              : parsedResponse;
        }

        const response = {
          request_response: JSON.stringify(responseValue),
          request_response_duplicatable_section_id: duplicatableSectionId,
          request_response_field_id: field.field_id,
          request_response_request_id: requestId,
        };
        requestResponseInput.push(response);
      }
    }
  }

  // get request signers
  const requestSignerInput: RequestSignerTableInsert[] = [];
  const signerIdList: string[] = [];

  // get signer notification
  const requestSignerNotificationInput: NotificationTableInsert[] = [];

  signers.forEach((signer) => {
    if (!signerIdList.includes(signer.signer_id)) {
      requestSignerInput.push({
        request_signer_signer_id: signer.signer_id,
        request_signer_request_id: requestId,
      });
      requestSignerNotificationInput.push({
        notification_app: "REQUEST",
        notification_content: `${requesterName} requested you to sign his/her ${formName} request`,
        notification_redirect_url: `/${teamName}/requests/${requestId}`,
        notification_team_id: teamId,
        notification_type: "REQUEST",
        notification_user_id:
          signer.signer_team_member.team_member_user.user_id,
      });
      signerIdList.push(signer.signer_id);
    }
  });

  const responseValues = requestResponseInput
    .map((response) => {
      const escapedResponse = response.request_response.replace(/'/g, "''");
      return `('${escapedResponse}',${
        response.request_response_duplicatable_section_id
          ? `'${response.request_response_duplicatable_section_id}'`
          : "NULL"
      },'${response.request_response_field_id}','${
        response.request_response_request_id
      }')`;
    })
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

  const { data, error } = await supabaseClient
    .rpc("edit_request", {
      input_data: {
        requestId,
        responseValues,
        signerValues,
        notificationValues,
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
    siteMapId: string;
    boqId: string;
    region: string;
    province: string;
    city: string;
    barangay: string;
    street: string;
    zipCode: string;
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

  return data as TeamProjectWithAddressType;
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

export const downloadFromStorage = (
  supabaseClient: SupabaseClient<Database>,
  params: {
    bucket: string;
    filename: string;
  }
) => {
  const { bucket, filename } = params;

  const { data } = supabaseClient.storage.from(bucket).getPublicUrl(filename, {
    download: true,
  });

  return data.publicUrl;
};

// Create service
export const createService = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    serviceData: ServiceTableInsert;
    scope: ServiceForm["scope"];
    formId: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("create_service", { input_data: params })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Create item description field
export const createServiceScopeChoice = async (
  supabaseClient: SupabaseClient<Database>,
  params: ServiceScopeChoiceTableInsert
) => {
  const { data, error } = await supabaseClient
    .from("service_scope_choice_table")
    .insert(params)
    .select("*")
    .single();
  if (error) throw error;

  return data;
};

// Create ticket comment
export const createTicketComment = async (
  supabaseClient: SupabaseClient<Database>,
  params: TicketCommentTableInsert
) => {
  const { data, error } = await supabaseClient
    .from("ticket_comment_table")
    .insert(params)
    .select("*")
    .single();
  if (error) throw error;

  return { data, error };
};

// Create row in lookup table
export const createRowInLookupTable = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    inputData: JSON;
    tableName: string;
  }
) => {
  const { tableName, inputData } = params;
  const { data, error } = await supabaseClient
    .from(`${tableName}_table`)
    .insert(inputData)
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

// Create memo
export const createTeamMemo = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    memoData: {
      memo_author_user_id: string;
      memo_subject: string;
      memo_team_id: string;
      memo_reference_number: string;
    };
    signerData: {
      memo_signer_order: number;
      memo_signer_is_primary: boolean;
      memo_signer_team_member_id: string;
      memo_signer_user_id: string;
    }[];
    lineItemData: MemoLineItem[];
  }
) => {
  const { memoData, signerData, lineItemData } = params;

  // upload attachments
  const updatedLineItemData = await processAllMemoLineItems(
    lineItemData,
    supabaseClient
  );

  const input_data = {
    memoData,
    signerData,
    lineItemData: updatedLineItemData,
  };

  // create memo
  const { data, error } = await supabaseClient.rpc("create_memo", {
    input_data,
  });
  if (error) throw Error;

  return data as MemoTableRow;
};

const processAllMemoLineItems = async (
  lineItemData: MemoLineItem[],
  supabaseClient: SupabaseClient<Database>
) => {
  const processedLineItems = await Promise.all(
    lineItemData.map(async (lineItem) => {
      const memo_line_item_id = uuidv4();

      if (lineItem.memo_line_item_attachment_caption) {
        lineItem.memo_line_item_attachment_caption = escapeQuotes(
          lineItem.memo_line_item_attachment_caption
        );
      }

      if (lineItem.memo_line_item_attachment) {
        const bucket = "MEMO_ATTACHMENTS";
        const attachmentPublicUrl = await uploadImage(supabaseClient, {
          id: uuidv4(),
          image: lineItem.memo_line_item_attachment,
          bucket,
        });

        return {
          ...lineItem,
          memo_line_item_id,
          memo_line_item_attachment_public_url: attachmentPublicUrl,
          memo_line_item_attachment_storage_bucket: bucket,
        };
      }

      return {
        ...lineItem,
        memo_line_item_content: escapeQuotes(lineItem.memo_line_item_content),
        memo_line_item_id,
      };
    })
  );

  return JSON.parse(JSON.stringify(processedLineItems));
};

// End create memo

// Agree to memo

export const agreeToMemo = async (
  supabaseClient: SupabaseClient<Database>,
  params: { memoId: string; teamMemberId: string }
) => {
  const { memoId, teamMemberId } = params;

  const { count, error: CountError } = await supabaseClient
    .from("memo_agreement_table")
    .select("*", { count: "exact" })
    .eq("memo_agreement_by_team_member_id", teamMemberId)
    .eq("memo_agreement_memo_id", memoId);

  if (CountError) throw Error;

  if (Number(count) === 0) {
    const { data, error } = await supabaseClient
      .from("memo_agreement_table")
      .insert({
        memo_agreement_by_team_member_id: teamMemberId,
        memo_agreement_memo_id: memoId,
      })
      .select(
        "*, memo_agreement_by_team_member: memo_agreement_by_team_member_id!inner(user_data: team_member_user_id(user_id, user_avatar, user_first_name, user_last_name, user_employee_number: user_employee_number_table(user_employee_number)))"
      )
      .maybeSingle();

    if (error) throw Error;

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

  return null;
};

// create reference memo
export const createReferenceMemo = async (
  supabaseClient: SupabaseClient<Database>,
  params: ReferenceMemoType
) => {
  const memoId = uuidv4();
  const updatedLineItemData: ReferenceMemoType["memo_line_item_list"] =
    await processReferenceMemoLineItems(
      params.memo_line_item_list,
      supabaseClient,
      memoId
    );

  const memoSignerTableValues = params.memo_signer_list
    .map(
      (signer, signerIndex) =>
        `('${signer.memo_signer_is_primary}', '${signerIndex}', '${signer.memo_signer_team_member?.team_member_id}', '${memoId}')`
    )
    .join(",");

  const memoLineItemTableValues = updatedLineItemData
    .map(
      (lineItem, lineItemIndex) =>
        `('${lineItem.memo_line_item_id}', '${escapeQuotes(
          lineItem.memo_line_item_content
        )}', '${lineItemIndex}', '${memoId}')`
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
          escapeQuotes(
            `${lineItemAttachment?.memo_line_item_attachment_caption}`
          ) ?? ""
        }', '${
          lineItemAttachment?.memo_line_item_attachment_storage_bucket
        }', '${
          lineItemAttachment?.memo_line_item_attachment_public_url
        }', '${memo_line_item_id}')`
    )
    .join(",");

  const input_data = {
    memo_id: memoId,
    memo_subject: params.memo_subject,
    memo_reference_number: params.memo_reference_number,
    memo_team_id: params.memo_team_id,
    memo_author_user_id: params.memo_author_user_id,
    memoSignerTableValues,
    memoLineItemTableValues,
    memoLineItemAttachmentTableValues,
  };

  const { data, error } = await supabaseClient.rpc("create_reference_memo", {
    input_data,
  });

  if (error) throw Error;

  return data as unknown as ReferenceMemoType;
};

const processReferenceMemoLineItems = async (
  lineItemData: ReferenceMemoType["memo_line_item_list"],
  supabaseClient: SupabaseClient<Database>,
  memoId: string
) => {
  const processedLineItems = await Promise.all(
    lineItemData.map(async (lineItem) => {
      const memoLineItemId = uuidv4();
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
          memo_line_item_id: memoLineItemId,
          memo_line_item_content: lineItem.memo_line_item_content,
          memo_line_item_memo_id: memoId,
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
        memo_line_item_id: memoLineItemId,
        memo_line_item_content: lineItem.memo_line_item_content,
        memo_line_item_memo_id: memoId,
      };
    })
  );

  return JSON.parse(JSON.stringify(processedLineItems));
};
// Create row in other expenses type table
export const createRowInOtherExpensesTypeTable = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    inputData: OtherExpensesTypeTableInsert;
  }
) => {
  const { inputData } = params;
  const { data, error } = await supabaseClient
    .from("other_expenses_type_table")
    .insert(inputData)
    .select()
    .single();
  if (error) throw error;

  return data;
};

// Create Valid ID
export const createValidID = async (
  supabaseClient: SupabaseClient<Database>,
  params: Omit<UserValidIDTableInsert, "user_valid_id_address_id"> &
    AddressTableInsert
) => {
  const { data, error } = await supabaseClient.rpc("create_user_valid_id", {
    input_data: params,
  });
  if (error) throw error;
  return data;
};

// Create ticket
export const createTicket = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamMemberId: string;
    category: string;
    ticketFormValues: CreateTicketFormValues;
  }
) => {
  const { category, teamMemberId, ticketFormValues } = params;

  const ticketId = uuidv4();

  // get request response
  const requestResponseInput: TicketResponseTableInsert[] = [];
  for (const section of ticketFormValues.ticket_sections) {
    for (const field of section.ticket_section_fields) {
      let responseValue = field.ticket_field_response;
      if (responseValue) {
        if (field.ticket_field_type === "FILE") {
          const fileResponse = responseValue as File;
          const uploadId = `${field.ticket_field_id}${
            section.ticket_section_id
              ? `_${field.ticket_field_section_id}___${fileResponse.name}___`
              : ""
          }`;
          if (fileResponse["type"].split("/")[0] === "image") {
            responseValue = await uploadImage(supabaseClient, {
              id: uploadId,
              image: fileResponse,
              bucket: "TICKET_ATTACHMENTS",
            });
          } else {
            responseValue = await uploadFile(supabaseClient, {
              id: uploadId,
              file: fileResponse,
              bucket: "TICKET_ATTACHMENTS",
            });
          }
        }
        const response = {
          ticket_response_value: JSON.stringify(responseValue),
          ticket_response_duplicatable_section_id:
            section.field_section_duplicatable_id ?? null,
          ticket_response_field_id: field.ticket_field_id,
          ticket_response_ticket_id: ticketId,
        };
        requestResponseInput.push(response);
      }
    }
  }

  const responseValues = requestResponseInput
    .map((response) => {
      const escapedResponse = response.ticket_response_value.replace(
        /'/g,
        "''"
      );
      return `('${escapedResponse}',${
        response.ticket_response_duplicatable_section_id
          ? `'${response.ticket_response_duplicatable_section_id}'`
          : "NULL"
      },'${response.ticket_response_field_id}','${
        response.ticket_response_ticket_id
      }')`;
    })
    .join(",");

  // create ticket
  const { data, error } = await supabaseClient
    .rpc("create_ticket", {
      input_data: {
        category,
        ticketId,
        teamMemberId,
        responseValues,
      },
    })
    .select()
    .single();
  if (error) throw error;

  return data as TicketTableRow;
};

// Edit ticket
export const editTicket = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    ticketId: string;
    ticketFormValues: CreateTicketFormValues;
  }
) => {
  const { ticketId, ticketFormValues } = params;

  // get request response
  const requestResponseInput: TicketResponseTableInsert[] = [];
  for (const section of ticketFormValues.ticket_sections) {
    for (const field of section.ticket_section_fields) {
      let responseValue = field.ticket_field_response;
      if (responseValue) {
        if (
          field.ticket_field_type === "FILE" &&
          typeof responseValue !== "string"
        ) {
          const fileResponse = responseValue as File;
          const uploadId = `${field.ticket_field_id}${
            section.ticket_section_id
              ? `_${field.ticket_field_section_id}___${fileResponse.name}___`
              : ""
          }`;
          if (fileResponse["type"].split("/")[0] === "image") {
            responseValue = await uploadImage(supabaseClient, {
              id: uploadId,
              image: fileResponse,
              bucket: "TICKET_ATTACHMENTS",
            });
          } else {
            responseValue = await uploadFile(supabaseClient, {
              id: uploadId,
              file: fileResponse,
              bucket: "TICKET_ATTACHMENTS",
            });
          }
        }
        const response = {
          ticket_response_value: JSON.stringify(responseValue),
          ticket_response_duplicatable_section_id:
            section.field_section_duplicatable_id ?? null,
          ticket_response_field_id: field.ticket_field_id,
          ticket_response_ticket_id: ticketId,
        };
        requestResponseInput.push(response);
      }
    }
  }

  const responseValues = requestResponseInput
    .map((response) => {
      const escapedResponse = response.ticket_response_value.replace(
        /'/g,
        "''"
      );
      return `('${escapedResponse}',${
        response.ticket_response_duplicatable_section_id
          ? `'${response.ticket_response_duplicatable_section_id}'`
          : "NULL"
      },'${response.ticket_response_field_id}','${
        response.ticket_response_ticket_id
      }')`;
    })
    .join(",");

  // edit ticket
  const { error } = await supabaseClient.rpc("edit_ticket", {
    input_data: {
      ticketId,
      responseValues,
    },
  });
  if (error) throw error;
  else return true;
};

// Create custom CSI
export const createCustomCSI = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    itemName: string;
    csiCodeDescription: string;
    csiCode: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc("create_custom_csi", {
    input_data: {
      ...params,
    },
  });
  if (error) throw error;
  return Boolean(data);
};

// Create item division
export const createItemDivision = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    itemId: string;
    divisionId: string;
  }
) => {
  const { divisionId, itemId } = params;
  const { data, error } = await supabaseClient
    .from("item_division_table")
    .insert({ item_division_value: divisionId, item_division_item_id: itemId });
  if (error) throw error;
  return data;
};

// Create equipment
export const createEquipment = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    equipmentData: EquipmentTableInsert;
    category: string;
  }
) => {
  const { equipmentData, category } = params;
  const { data, error } = await supabaseClient
    .from("equipment_table")
    .insert(equipmentData)
    .select()
    .single();
  if (error) throw error;

  return {
    ...data,
    equipment_category: category,
  };
};

// Create equipment description
export const createEquipmentDescription = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    equipmentDescriptionData: EquipmentDescriptionTableInsert;
    brand: string;
    model: string;
  }
) => {
  const { equipmentDescriptionData, brand, model } = params;
  const { data, error } = await supabaseClient
    .from("equipment_description_table")
    .insert(equipmentDescriptionData)
    .select()
    .single();
  if (error) throw error;

  return {
    ...data,
    equipment_description_brand: brand,
    equipment_description_model: model,
  };
};

// Create equipment part
export const createEquipmentPart = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    equipmentPartData: EquipmentPartTableInsert;
    name: string;
    brand: string;
    model: string;
    uom: string;
    category: string;
  }
) => {
  const { equipmentPartData, name, brand, model, uom, category } = params;
  const { data, error } = await supabaseClient
    .from("equipment_part_table")
    .insert(equipmentPartData)
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

// create ped part from ticket request
export const createPedPartFromTicketRequest = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    equipmentName: string;
    partName: string;
    partNumber: string;
    brand: string;
    model: string;
    unitOfMeasure: string;
    category: string;
    teamMemberId: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc(
    "create_ped_part_from_ticket_request",
    {
      input_data: params,
    }
  );
  if (error) throw error;
  return data;
};
