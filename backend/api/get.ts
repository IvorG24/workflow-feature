import { Database } from "@/utils/database";
import { AttachmentBucketType, FormStatusType } from "@/utils/types";
import { SupabaseClient } from "@supabase/supabase-js";

// Get file url
export async function getFileUrl(
  supabaseClient: SupabaseClient<Database>,
  params: { path: string; bucket: AttachmentBucketType }
) {
  const { path, bucket } = params;
  const { data, error } = await supabaseClient.storage
    .from(bucket)
    .download(path);
  if (error) throw error;

  const url = URL.createObjectURL(data);
  return url;
}

// Get server's current date
export const getCurrentDate = async (
  supabaseClient: SupabaseClient<Database>
) => {
  const { data, error } = await supabaseClient
    .rpc("get_current_date")
    .select("*")
    .single();
  if (error) throw error;
  if (!data) throw error;
  return new Date(data);
};

// Get all the user's team
export const getAllTeamOfUser = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    userId: string;
  }
) => {
  const { userId } = params;
  const { data, error } = await supabaseClient
    .from("team_member_table")
    .select("*, team:team_table(*)")
    .eq("team_member_disabled", false)
    .eq("team_member_user_id", userId);
  if (error) throw error;
  const teamList = data.map((teamMember) => {
    return teamMember.team;
  });

  return teamList;
};

// Get user
export const getUser = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    userId: string;
  }
) => {
  const { userId } = params;
  const { data, error } = await supabaseClient
    .from("user_table")
    .select("*")
    .eq("user_is_disabled", false)
    .eq("user_id", userId)
    .single();
  if (error) throw error;
  return data;
};

// Get form list
export const getFormList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    app: string;
  }
) => {
  const { teamId, app } = params;
  const { data, error } = await supabaseClient
    .from("form_table")
    .select("*, form_team_member:form_team_member_id!inner(*)")
    .eq("form_team_member.team_member_team_id", teamId)
    .eq("form_is_disabled", false)
    .eq("form_app", app);
  if (error) throw error;
  return data;
};

// Get request list
export const getRequestList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    page: number;
    limit: number;
    requestor?: string[];
    status?: FormStatusType[];
    form?: string[];
    sort?: "ascending" | "descending";
    search?: string;
  }
) => {
  const {
    teamId,
    page,
    limit,
    requestor,
    status,
    form,
    sort = "descending",
    search,
  } = params;

  const start = (page - 1) * limit;

  let query = supabaseClient
    .from("request_table")
    .select(
      "request_id, request_date_created, request_status, request_team_member: request_team_member_id!inner(team_member_user: team_member_user_id(user_first_name, user_last_name, user_avatar)), request_form: request_form_id( form_name, form_description), request_signer: request_signer_table(request_signer_id, request_signer_status, request_signer: request_signer_signer_id(signer_is_primary_signer, signer_team_member: signer_team_member_id(team_member_user: team_member_user_id(user_first_name, user_last_name, user_avatar))))",
      { count: "exact" }
    )
    .eq("request_team_member.team_member_team_id", teamId)
    .eq("request_is_disabled", false);

  if (requestor) {
    let requestorCondition = "";
    requestor.forEach((value) => {
      requestorCondition += `request_team_member_id.eq.${value}, `;
    });
    query = query.or(requestorCondition.slice(0, -2));
  }

  if (status) {
    let statusCondition = "";
    status.forEach((value) => {
      statusCondition += `request_status.eq.${value}, `;
    });
    query = query.or(statusCondition.slice(0, -2));
  }

  if (form) {
    let formCondition = "";
    form.forEach((value) => {
      formCondition += `request_form_id.eq.${value}, `;
    });
    query = query.or(formCondition.slice(0, -2));
  }

  if (search) {
    query = query.eq("request_id", search);
  }

  query = query.order("request_date_created", {
    ascending: sort === "ascending",
  });
  query.limit(limit);
  query.range(start, start + limit - 1);

  const { data, count, error } = await query;
  if (error) throw error;

  return { data, count };
};

// Get user's active team id
export const getUserActiveTeamId = async (
  supabaseClient: SupabaseClient<Database>,
  params: { userId: string }
) => {
  const { userId } = params;

  const { data, error } = await supabaseClient
    .from("user_table")
    .select("user_active_team_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data?.user_active_team_id) throw new Error("Active team not found.");

  return data.user_active_team_id;
};

// Get user with signature attachment
export const getUserWithSignature = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    userId: string;
  }
) => {
  const { userId } = params;
  const { data, error } = await supabaseClient
    .from("user_table")
    .select("*, user_signature_attachment: user_signature_attachment_id(*)")
    .eq("user_id", userId)
    .single();
  if (error) throw error;
  return data;
};

// Check username if it already exists
export const checkUsername = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    username: string;
  }
) => {
  const { username } = params;
  const { data, error } = await supabaseClient
    .from("user_table")
    .select("user_username")
    .eq("user_username", username)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
};

// Get specific request
export const getRequest = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    requestId: string;
  }
) => {
  const { requestId } = params;
  const { data, error } = await supabaseClient
    .from("request_table")
    .select(
      "*, request_team_member: request_team_member_id(team_member_user: team_member_user_id(user_id, user_first_name, user_last_name, user_username, user_avatar)), request_signer: request_signer_table(request_signer_id, request_signer_status, request_signer_signer: request_signer_signer_id(signer_id, signer_is_primary_signer, signer_action, signer_order, signer_team_member: signer_team_member_id(team_member_id, team_member_user: team_member_user_id(user_first_name, user_last_name)))), request_comment: comment_table(comment_id, comment_date_created, comment_content, comment_is_edited, comment_last_updated, comment_type, comment_team_member: comment_team_member_id(team_member_user: team_member_user_id(user_first_name, user_last_name))), request_form: request_form_id(form_id, form_name, form_description, form_section: section_table(*, section_field: field_table(*, field_option: option_table(*), field_response: request_response_table(*)))))"
    )
    .eq("request_id", requestId)
    .eq(
      "request_form.form_section.section_field.field_response.request_response_request_id",
      requestId
    )
    .eq("request_comment.comment_is_disabled", false)
    .single();

  if (error) throw error;

  return data;
};

// Get specific team
export const getTeam = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
  }
) => {
  const { teamId } = params;
  const { data, error } = await supabaseClient
    .from("team_table")
    .select(
      "team_id, team_name, team_is_request_signature_required, team_logo, team_user_id, team_member: team_member_table(team_member_id, team_member_role, team_member_user: team_member_user_id(user_id, user_first_name, user_last_name, user_email, user_job_title, user_phone_number, user_avatar))"
    )
    .eq("team_id", teamId)
    .eq("team_is_disabled", false)
    .eq("team_member.team_member_disabled", false)
    .eq("team_member.team_member_user.user_is_disabled", false)
    .maybeSingle();

  if (error) throw error;

  return data;
};

// Get user's team member id
export const getUserTeamMemberId = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    userId: string;
    teamId: string;
  }
) => {
  const { userId, teamId } = params;
  const { data, error } = await supabaseClient
    .from("team_member_table")
    .select("team_member_id")
    .eq("team_member_user_id", userId)
    .eq("team_member_team_id", teamId)
    .maybeSingle();

  if (error) throw error;

  return data?.team_member_id;
};

// Get form list with filter
export const getFormListWithFilter = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    app: string;
    page: number;
    limit: number;
    creator?: string[];
    status?: "hidden" | "visible";
    sort?: "ascending" | "descending";
    search?: string;
  }
) => {
  const {
    teamId,
    app,
    page,
    limit,
    creator,
    status,
    sort = "descending",
    search,
  } = params;

  const start = (page - 1) * limit;
  let query = supabaseClient
    .from("form_table")
    .select("*, form_team_member:form_team_member_id!inner(*)", {
      count: "exact",
    })
    .eq("form_team_member.team_member_team_id", teamId)
    .eq("form_is_disabled", false)
    .eq("form_app", app);

  if (creator) {
    let creatorCondition = "";
    creator.forEach((value) => {
      creatorCondition += `form_team_member_id.eq.${value}, `;
    });
    query = query.or(creatorCondition.slice(0, -2));
  }

  if (status) {
    query = query.eq("form_is_hidden", status === "hidden");
  }

  if (search) {
    query = query.ilike("form_name", `%${search}%`);
  }

  query = query.order("form_date_created", {
    ascending: sort === "ascending",
  });
  query.limit(limit);
  query.range(start, start + limit - 1);

  const { data, count, error } = await query;
  if (error) throw error;
  return { data, count };
};

// Get team's all members
export const getTeamMemberList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
  }
) => {
  const { teamId } = params;
  const { data, error } = await supabaseClient
    .from("team_member_table")
    .select(
      "team_member_id, team_member_role, team_member_user: team_member_user_id(user_id, user_first_name, user_last_name)"
    )
    .eq("team_member_team_id", teamId);
  if (error) throw error;

  return data;
};

// Get specific form
export const getForm = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    formId: string;
  }
) => {
  const { formId } = params;
  const { data, error } = await supabaseClient
    .from("form_table")
    .select(
      "form_name, form_description, form_date_created, form_is_hidden, form_team_member: form_team_member_id(team_member_id, team_member_user: team_member_user_id(user_first_name, user_last_name, user_avatar)), form_signer: signer_table(signer_id, signer_is_primary_signer, signer_action, signer_order, signer_team_member: signer_team_member_id(team_member_id, team_member_user: team_member_user_id(user_first_name, user_last_name, user_avatar))), form_section: section_table(*, section_field: field_table(*, field_option: option_table(*))))"
    )
    .eq("form_id", formId)
    .eq("form_is_disabled", false)
    .single();

  if (error) throw error;

  return data;
};
