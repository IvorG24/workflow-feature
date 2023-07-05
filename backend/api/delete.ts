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
  const { groupList, teamId, deletedGroup, groupMemberList } = params;
  const { error } = await supabaseClient
    .from("team_table")
    .update({ team_group_list: groupList })
    .eq("team_id", teamId);
  if (error) throw error;

  if (groupMemberList.length !== 0) {
    let deleteTeamMemberCondition = "";
    groupMemberList.forEach((memberId) => {
      deleteTeamMemberCondition += `team_member_id.eq.${memberId}, `;
    });

    const { data: teamMemberList, error: teamMemberListError } =
      await supabaseClient
        .from("team_member_table")
        .select("*")
        .or(deleteTeamMemberCondition.slice(0, -2));
    if (teamMemberListError) throw teamMemberListError;

    const deleteTeamMemberGroupData = teamMemberList.map((member) => {
      return {
        ...member,
        team_member_group_list: member.team_member_group_list.filter(
          (group) => group !== deletedGroup
        ),
      };
    });

    const { error: teamMemberGroupDeleteError } = await supabaseClient
      .from("team_member_table")
      .upsert(deleteTeamMemberGroupData);

    if (teamMemberGroupDeleteError) throw teamMemberGroupDeleteError;
  }
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
  const { projectList, teamId, deletedProject, projectMemberList } = params;
  const { error } = await supabaseClient
    .from("team_table")
    .update({ team_project_list: projectList })
    .eq("team_id", teamId);
  if (error) throw error;

  if (projectMemberList.length !== 0) {
    let deleteTeamMemberCondition = "";
    projectMemberList.forEach((memberId) => {
      deleteTeamMemberCondition += `team_member_id.eq.${memberId}, `;
    });

    const { data: teamMemberList, error: teamMemberListError } =
      await supabaseClient
        .from("team_member_table")
        .select("*")
        .or(deleteTeamMemberCondition.slice(0, -2));
    if (teamMemberListError) throw teamMemberListError;

    const deleteTeamMemberProjectData = teamMemberList.map((member) => {
      return {
        ...member,
        team_member_project_list: member.team_member_project_list.filter(
          (project) => project !== deletedProject
        ),
      };
    });

    const { error: teamMemberProjectDeleteError } = await supabaseClient
      .from("team_member_table")
      .upsert(deleteTeamMemberProjectData);

    if (teamMemberProjectDeleteError) throw teamMemberProjectDeleteError;
  }
};
