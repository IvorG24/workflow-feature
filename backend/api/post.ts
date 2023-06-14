import { RequestFormValues } from "@/components/CreateRequestPage/CreateRequestPage";
import { FormBuilderData } from "@/components/FormBuilder/FormBuilder";
import { formslyPremadeFormsData } from "@/utils/constant";
import { Database } from "@/utils/database";
import {
  AccountingProcessorTableInsert,
  AttachmentBucketType,
  AttachmentTableInsert,
  AuditProcessorTableInsert,
  CommentTableInsert,
  FieldTableInsert,
  FormType,
  InvitationTableInsert,
  ItemDescriptionFieldTableInsert,
  ItemTDescriptionableInsert,
  ItemTableInsert,
  NotificationTableInsert,
  OptionTableInsert,
  ProjectTableInsert,
  PurchasingProcessorTableInsert,
  RequestResponseTableInsert,
  RequestSignerTableInsert,
  SectionTableInsert,
  TeamMemberTableInsert,
  TeamTableInsert,
  TreasuryProcessorTableInsert,
  UserTableInsert,
  VendorTableInsert,
  WarehouseProcessorTableInsert,
  WarehouseReceiverTableInsert,
} from "@/utils/types";
import { SupabaseClient } from "@supabase/supabase-js";
import Compressor from "compressorjs";
import { v4 as uuidv4 } from "uuid";
import { getFileUrl } from "./get";

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
  const { data, error } = await supabaseClient
    .from("user_table")
    .insert(params)
    .select()
    .single();
  if (error) throw error;

  return data;
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
  const { emailList, teamMemberId, teamName } = params;

  const invitationInput: InvitationTableInsert[] = [];
  const notificationInput: NotificationTableInsert[] = [];

  for (const email of emailList) {
    const invitationId = uuidv4();
    // check if there is already an invitation
    const { count: checkInvitationCount, error: checkInvitationError } =
      await supabaseClient
        .from("invitation_table")
        .select("*", { count: "exact", head: true })
        .eq("invitation_to_email", email)
        .eq("invitation_from_team_member_id", teamMemberId)
        .eq("invitation_is_disabled", false)
        .eq("invitation_status", "PENDING");
    if (checkInvitationError) throw checkInvitationError;

    if (!checkInvitationCount) {
      invitationInput.push({
        invitation_id: invitationId,
        invitation_to_email: email,
        invitation_from_team_member_id: teamMemberId,
      });
    }

    // check if user exists
    const { data: checkUserData, error: checkUserError } = await supabaseClient
      .from("user_table")
      .select("*")
      .eq("user_email", email)
      .maybeSingle();
    if (checkUserError) throw checkUserError;
    if (checkUserData) {
      notificationInput.push({
        notification_app: "GENERAL",
        notification_content: `You have been invited to join ${teamName}`,
        notification_redirect_url: `/team/invitation/${invitationId}`,
        notification_type: "INVITE",
        notification_user_id: checkUserData.user_id,
      });
    }
  }

  const { data: invitationData, error: invitationError } = await supabaseClient
    .from("invitation_table")
    .insert(invitationInput)
    .select();
  if (invitationError) throw invitationError;

  const { error: notificationError } = await supabaseClient
    .from("notification_table")
    .insert(notificationInput);
  if (notificationError) throw notificationError;

  return invitationData;
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
    redirectTo: "http://localhost:3000/reset-password",
  });
};

// Reset Password
export const resetPassword = async (
  supabaseClient: SupabaseClient<Database>,
  password: string
) => {
  const { data, error } = await supabaseClient.auth.updateUser({ password });
  if (error) throw error;
  return data;
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

  const url = await getFileUrl(supabaseClient, {
    path: data.attachment_value,
    bucket: attachmentData.attachment_bucket as AttachmentBucketType,
  });
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
  const { itemData, itemDescription, formId } = params;
  const { data, error } = await supabaseClient
    .from("item_table")
    .insert(itemData)
    .select()
    .single();
  if (error) throw error;

  const itemDescriptionInput: ItemTDescriptionableInsert[] = [];
  const fieldInput: FieldTableInsert[] = [];

  const { data: section, error: sectionError } = await supabaseClient
    .from("section_table")
    .select("section_id")
    .eq("section_form_id", formId)
    .eq("section_name", "Item")
    .single();
  if (sectionError) throw sectionError;

  itemDescription.forEach((description: string) => {
    itemDescriptionInput.push({
      item_description_label: description,
      item_description_item_id: data.item_id,
      item_description_is_available: true,
    });
    fieldInput.push({
      field_name: description,
      field_type: "DROPDOWN",
      field_order: 7,
      field_section_id: section.section_id,
    });
  });
  const { data: itemDescriptionData, error: itemDescriptionError } =
    await supabaseClient
      .from("item_description_table")
      .insert(itemDescriptionInput)
      .select();
  if (itemDescriptionError) throw itemDescriptionError;

  const { error: fieldError } = await supabaseClient
    .from("field_table")
    .insert(fieldInput);
  if (fieldError) throw fieldError;
  return { ...data, item_description: itemDescriptionData };
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
  const { formBuilderData, teamMemberId } = params;
  const { formDescription, formId, formName, formType, isSignatureRequired } =
    formBuilderData;
  const { sections, signers } = formBuilderData;

  // create form
  const { data: form, error: formError } = await supabaseClient
    .from("form_table")
    .insert({
      form_app: formType,
      form_description: formDescription,
      form_name: formName,
      form_team_member_id: teamMemberId,
      form_id: formId,
      form_is_signature_required: isSignatureRequired,
    })
    .select()
    .single();
  if (formError) throw formError;

  const sectionInput: SectionTableInsert[] = [];
  const fieldInput: FieldTableInsert[] = [];
  const optionInput: OptionTableInsert[] = [];

  // separate sections, fields, and options
  sections.forEach((section) => {
    const { fields, ...newSection } = section;
    sectionInput.push(newSection);
    fields.forEach((field) => {
      const { options, ...newField } = field;
      fieldInput.push(newField);
      options.forEach((option) => optionInput.push(option));
    });
  });

  // create section
  const { error: sectionError } = await supabaseClient
    .from("section_table")
    .insert(sectionInput);
  if (sectionError) throw sectionError;

  // create fields
  const { error: fieldError } = await supabaseClient
    .from("field_table")
    .insert(fieldInput);
  if (fieldError) throw fieldError;

  // create options
  const { error: optionError } = await supabaseClient
    .from("option_table")
    .insert(optionInput);
  if (optionError) throw optionError;

  // create signers
  const { error: signerError } = await supabaseClient
    .from("signer_table")
    .insert(signers);
  if (signerError) throw signerError;

  return form;
};

// Create request
export const createRequest = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    requestFormValues: RequestFormValues;
    formId: string;
    teamMemberId: string;
    signers: FormType["form_signer"];
  }
) => {
  const { requestFormValues, formId, teamMemberId, signers } = params;

  // create request
  const { data: request, error: requestError } = await supabaseClient
    .from("request_table")
    .insert({ request_form_id: formId, request_team_member_id: teamMemberId })
    .select()
    .single();
  if (requestError) throw requestError;

  // get request response
  const requestResponseInput: RequestResponseTableInsert[] = [];
  for (const section of requestFormValues.sections) {
    for (const field of section.section_field) {
      let responseValue = field.field_response;
      if (typeof responseValue === "boolean" || responseValue) {
        if (field.field_type === "FILE") {
          const fileResponse = responseValue as File;
          if (fileResponse["type"].split("/")[0] === "image") {
            responseValue = await uploadImage(supabaseClient, {
              id: field.field_id,
              image: fileResponse,
              bucket: "REQUEST_ATTACHMENTS",
            });
          } else {
            responseValue = await uploadFile(supabaseClient, {
              id: field.field_id,
              file: fileResponse,
              bucket: "REQUEST_ATTACHMENTS",
            });
          }
        }
        const response = {
          request_response: JSON.stringify(responseValue),
          request_response_duplicatable_section_id:
            field.field_section_duplicatable_id ?? null,
          request_response_field_id: field.field_id,
          request_response_request_id: request.request_id,
        };
        requestResponseInput.push(response);
      }
    }
  }

  // create request response
  const { error: requestResponseError } = await supabaseClient
    .from("request_response_table")
    .insert(requestResponseInput);
  if (requestResponseError) throw requestResponseError;

  // get request signers
  const requestSignerInput: RequestSignerTableInsert[] = [];
  signers.forEach((signer) => {
    requestSignerInput.push({
      request_signer_signer_id: signer.signer_id,
      request_signer_request_id: request.request_id,
    });
  });

  // create request signers
  const { error: requestSignerError } = await supabaseClient
    .from("request_signer_table")
    .insert(requestSignerInput);
  if (requestSignerError) throw requestSignerError;

  return request;
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

  const { error: formError } = await supabaseClient
    .from("form_table")
    .insert(forms);
  if (formError) throw formError;

  const { error: sectionError } = await supabaseClient
    .from("section_table")
    .insert(sections);
  if (sectionError) throw sectionError;

  const { error: fieldWithIdError } = await supabaseClient
    .from("field_table")
    .insert(fieldWithId);
  if (fieldWithIdError) throw fieldWithIdError;

  const { error: fieldWithoutIdError } = await supabaseClient
    .from("field_table")
    .insert(fieldsWithoutId);
  if (fieldWithoutIdError) throw fieldWithoutIdError;

  const { error: optionError } = await supabaseClient
    .from("option_table")
    .insert(options);
  if (optionError) throw optionError;
};

// Create Project
export const createProject = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    projectData: ProjectTableInsert;
  }
) => {
  const { projectData } = params;
  const { data, error } = await supabaseClient
    .from("project_table")
    .insert(projectData)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Create Warehouse Processor
export const createWarehouseProcessor = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    warehouseProcessorData: WarehouseProcessorTableInsert;
  }
) => {
  const { warehouseProcessorData } = params;
  const { data, error } = await supabaseClient
    .from("warehouse_processor_table")
    .insert(warehouseProcessorData)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Create Vendor
export const createVendor = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    vendorData: VendorTableInsert;
  }
) => {
  const { vendorData } = params;
  const { data, error } = await supabaseClient
    .from("vendor_table")
    .insert(vendorData)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Create Purchasing Processor
export const createPurchasingProcessor = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    purchasingProcessorData: PurchasingProcessorTableInsert;
  }
) => {
  const { purchasingProcessorData } = params;
  const { data, error } = await supabaseClient
    .from("purchasing_processor_table")
    .insert(purchasingProcessorData)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Create Accounting Processor
export const createAccountingProcessor = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    accountingProcessorData: AccountingProcessorTableInsert;
  }
) => {
  const { accountingProcessorData } = params;
  const { data, error } = await supabaseClient
    .from("accounting_processor_table")
    .insert(accountingProcessorData)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Create Warehouse Receiver
export const createWarehouseReceiver = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    warehouseReceiverData: WarehouseReceiverTableInsert;
  }
) => {
  const { warehouseReceiverData } = params;
  const { data, error } = await supabaseClient
    .from("warehouse_receiver_table")
    .insert(warehouseReceiverData)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Create Treasury Processor
export const createTreasuryProcessor = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    treasuryProcessorData: TreasuryProcessorTableInsert;
  }
) => {
  const { treasuryProcessorData } = params;
  const { data, error } = await supabaseClient
    .from("treasury_processor_table")
    .insert(treasuryProcessorData)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Create Audit Processor
export const createAuditProcessor = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    auditProcessorData: AuditProcessorTableInsert;
  }
) => {
  const { auditProcessorData } = params;
  const { data, error } = await supabaseClient
    .from("audit_processor_table")
    .insert(auditProcessorData)
    .select()
    .single();
  if (error) throw error;
  return data;
};
