import { Database } from "@/utils/database";
import { SupabaseClient } from "@supabase/supabase-js";

// Delete form
export const deleteForm = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    formId: string;
  }
) => {
  const { formId } = params;
  const { error } = await supabaseClient
    .from("form_table")
    .update({ form_is_disabled: true })
    .eq("form_id", formId);
  if (error) throw error;
};

// Delete request
export const deleteRequest = async (
  supabaseClient: SupabaseClient<Database>,
  params: { requestId: string }
) => {
  const { requestId } = params;
  const { error } = await supabaseClient
    .from("request_table")
    .update({ request_is_disabled: true })
    .eq("request_id", requestId);
  if (error) throw error;
};

// Delete request
export const deleteComment = async (
  supabaseClient: SupabaseClient<Database>,
  params: { commentId: string }
) => {
  const { commentId } = params;
  const { error } = await supabaseClient
    .from("comment_table")
    .update({ comment_is_disabled: true })
    .eq("comment_id", commentId);
  if (error) throw error;
};
