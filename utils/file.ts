import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "./database.types";
import { Bucket } from "./types";

// * Get file URL from storage using filepath.
// * See https://github.com/supabase/supabase/blob/master/examples/user-management/nextjs-ts-user-management/components/Avatar.tsx
export async function getFileUrl(
  supabaseClient: SupabaseClient<Database>,
  path: string,
  bucket: Bucket
) {
  try {
    // * Archived
    // if (isValidHttpUrl(path)) return path;
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
  bucket: Bucket
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
  filename: string,
  file: File | Blob,
  bucket: Bucket,
  teamName: string,
  username: string
) {
  try {
    const datestring = new Date().toISOString();
    const prefixedFilename = `${datestring}?${teamName}?${username}?${filename}`;
    const { data, error } = await supabaseClient.storage
      .from(bucket)
      .upload(prefixedFilename, file);
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
  bucket: Bucket
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
  bucket: Bucket
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

// * Archived
// function isValidHttpUrl(string: string) {
//   let url;
//   try {
//     url = new URL(string);
//   } catch (_) {
//     return false;
//   }
//   return url.protocol === "http:" || url.protocol === "https:";
// }

// * Archived
// Get file size without downloading the whole file.
// export async function getFileSize(
//   fileUrl: string
// ): Promise<number | undefined> {
//   try {
//     const response = await axios.head(fileUrl);

//     const contentLength = response.headers["content-length"];
//     if (!contentLength) {
//       throw new Error(`Could not retrieve file size for ${fileUrl}`);
//     }

//     return parseInt(contentLength, 10);
//   } catch (error) {
//     console.error(error);
//   }
// }

export async function removeFileList(
  supabaseClient: SupabaseClient<Database>,
  pathList: string[],
  bucket: Bucket
) {
  try {
    if (!pathList) return;
    if (pathList.length === 0) return;

    const { data, error } = await supabaseClient.storage
      .from(bucket)
      .remove(pathList);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
