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

// Delete comment
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

// Delete row
export const deleteRow = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    rowId: string[];
    table: string;
  }
) => {
  const { rowId, table } = params;

  let condition = "";
  rowId.forEach((id) => {
    condition += `${table}_id.eq.${id}, `;
  });

  const { error } = await supabaseClient
    .from(`${table}_table`)
    .update({ [`${table}_is_disabled`]: true })
    .or(condition.slice(0, -2));

  if (error) throw error;
};

// Delete team group
export const deleteTeamGroup = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    groupList: string[];
    teamId: string;
    deletedGroup: string;
    groupMemberList: string[];
  }
) => {
  const { error } = await supabaseClient.rpc("delete_team_group", {
    input_data: params,
  });

  if (error) throw error;
};

// Delete team project
export const deleteTeamProject = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    projectList: string[];
    teamId: string;
    deletedProject: string;
    projectMemberList: string[];
  }
) => {
  const { error } = await supabaseClient.rpc("delete_team_project", {
    input_data: params,
  });

  if (error) throw error;
};
