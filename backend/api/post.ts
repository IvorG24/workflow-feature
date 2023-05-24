import { Database } from "@/utils/database";
import {
  AttachmentBucketType,
  AttachmentTableInsert,
  InvitationTableInsert,
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
