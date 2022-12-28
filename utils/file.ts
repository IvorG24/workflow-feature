import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "./database.types-new";

// * Get file URL from storage using filepath.
// * See https://github.com/supabase/supabase/blob/master/examples/user-management/nextjs-ts-user-management/components/Avatar.tsx
export async function getFileUrl(
  supabaseClient: SupabaseClient<Database>,
  path: string,
  bucket: string
) {
  try {
    const { data, error } = await supabaseClient.storage
      .from(bucket)
      .download(path);
    if (error) throw error;

    const url = URL.createObjectURL(data);

    return url;
  } catch (error) {
    throw new Error("Error fetching file URL");
  }
}

// * Get file as Blob
// * Returns the filepath.
export async function downloadFile(
  supabaseClient: SupabaseClient<Database>,
  path: string,
  bucket: string
) {
  try {
    const { data, error } = await supabaseClient.storage
      .from(bucket)
      .download(path);
    if (error) throw error;

    return data;
  } catch (error) {
    throw new Error("Error downloading file");
  }
}

// * Upload a file
// * Returns the filepath.
export async function uploadFile(
  supabaseClient: SupabaseClient<Database>,
  path: string,
  file: File | Blob,
  bucket: string
) {
  try {
    const { data, error } = await supabaseClient.storage
      .from(bucket)
      .upload(path, file);
    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error("Error uploading file");
  }
}

// * Replace an existing file
export async function replaceFile(
  supabaseClient: SupabaseClient<Database>,
  path: string,
  file: File | Blob,
  bucket: string
) {
  try {
    const { data, error } = await supabaseClient.storage
      .from(bucket)
      .update(path, file);
    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error("Error replacing file");
  }
}
