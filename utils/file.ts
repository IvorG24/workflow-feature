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
    if (isValidHttpUrl(path)) return path;
    const { data, error } = await supabaseClient.storage
      .from(bucket)
      .download(path);
    if (error) throw error;

    const url = URL.createObjectURL(data);
    return url;
  } catch (error) {
    console.error(error);
    throw error;
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
    console.error(error);
    throw error;
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
    const time = new Date().getTime();
    const prefixedPath = `${time}-${path}`;
    const { data, error } = await supabaseClient.storage
      .from(bucket)
      .upload(prefixedPath, file);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(error);
    throw error;
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
    console.error(error);
    throw error;
  }
}

// * Delete an existing file
export async function deleteFile(
  supabaseClient: SupabaseClient<Database>,
  path: string,
  bucket: string
) {
  try {
    const { data, error } = await supabaseClient.storage
      .from(bucket)
      .remove([path]);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

function isValidHttpUrl(string: string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}
