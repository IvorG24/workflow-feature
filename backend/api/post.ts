import { RequestFormValues } from "@/components/CreateRequestPage/CreateRequestPage";
import { FormBuilderData } from "@/components/FormBuilder/FormBuilder";
import { Database } from "@/utils/database";
import {
  AttachmentBucketType,
  AttachmentTableInsert,
  CommentTableInsert,
  FieldTableInsert,
  FormType,
  InvitationTableInsert,
  ItemDescriptionFieldTableInsert,
  ItemTableInsert,
  NotificationTableInsert,
  OptionTableInsert,
  RequestResponseTableInsert,
  RequestSignerTableInsert,
  SectionTableInsert,
  TeamMemberTableInsert,
  TeamTableInsert,
  UserTableInsert,
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
  params: InvitationTableInsert[]
) => {
  const { data, error } = await supabaseClient
    .from("invitation_table")
    .insert(params)
    .select();
  if (error) throw error;
  return data;
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
  }
) => {
  const { itemData, itemDescription } = params;
  const { data, error } = await supabaseClient
    .from("item_table")
    .insert(itemData)
    .select()
    .single();
  if (error) throw error;

  const itemDescriptionInput = itemDescription.map((description: string) => {
    return {
      item_description_label: description,
      item_description_item_id: data.item_id,
      item_description_is_available: true,
    };
  });
  const { data: itemDescriptionData, error: itemDescriptionError } =
    await supabaseClient
      .from("item_description_table")
      .insert(itemDescriptionInput)
      .select();

  if (itemDescriptionError) throw itemDescriptionError;
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
  requestFormValues.sections.forEach((section) => {
    section.section_field.forEach((field) => {
      const responseValue = field.field_response;
      if (typeof responseValue === "boolean" || responseValue) {
        const response = {
          request_response: JSON.stringify(field.field_response),
          request_response_duplicatable_section_id:
            field.field_section_duplicatable_id ?? null,
          request_response_field_id: field.field_id,
          request_response_request_id: request.request_id,
        };
        requestResponseInput.push(response);
      }
    });
  });

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

