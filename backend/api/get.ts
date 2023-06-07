import { Database } from "@/utils/database";
import {
  AppType,
  AttachmentBucketType,
  FormStatusType,
  ItemWithDecsriptionAndField,
  TeamMemberType,
} from "@/utils/types";
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
    .eq("team_member_is_disabled", false)
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
    .eq("form_app", app)
    .order("form_date_created", { ascending: false });
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
      "request_id, request_date_created, request_status, request_team_member: request_team_member_id!inner(team_member_user: team_member_user_id(user_first_name, user_last_name, user_avatar)), request_form: request_form_id(form_id, form_name, form_description), request_signer: request_signer_table(request_signer_id, request_signer_status, request_signer: request_signer_signer_id(signer_is_primary_signer, signer_team_member: signer_team_member_id(team_member_user: team_member_user_id(user_id, user_first_name, user_last_name, user_avatar))))",
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
  if (!data?.user_active_team_id) {
    const { data: firstTeam, error: firstTeamError } = await supabaseClient
      .from("team_member_table")
      .select("*")
      .eq("team_member_user_id", userId)
      .eq("team_member_is_disabled", false)
      .maybeSingle();
    if (firstTeamError) throw firstTeamError;

    if (!firstTeam) throw new Error("No team not found.");
    return firstTeam.team_member_team_id;
  }

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
      "*, request_team_member: request_team_member_id(team_member_user: team_member_user_id(user_id, user_first_name, user_last_name, user_username, user_avatar)), request_signer: request_signer_table(request_signer_id, request_signer_status, request_signer_signer: request_signer_signer_id(signer_id, signer_is_primary_signer, signer_action, signer_order, signer_team_member: signer_team_member_id(team_member_id, team_member_user: team_member_user_id(user_first_name, user_last_name)))), request_comment: comment_table(comment_id, comment_date_created, comment_content, comment_is_edited, comment_last_updated, comment_type, comment_team_member_id, comment_team_member: comment_team_member_id(team_member_user: team_member_user_id(user_id, user_first_name, user_last_name, user_username, user_avatar))), request_form: request_form_id(form_id, form_name, form_description, form_is_formsly_form, form_section: section_table(*, section_field: field_table(*, field_option: option_table(*), field_response: request_response_table(*)))))"
    )
    .eq("request_id", requestId)
    .eq(
      "request_form.form_section.section_field.field_response.request_response_request_id",
      requestId
    )
    .eq("request_comment.comment_is_disabled", false)
    .order("comment_date_created", {
      foreignTable: "comment_table",
      ascending: false,
    })
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
    .select("*")
    .eq("team_id", teamId)
    .eq("team_is_disabled", false)
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
    .select(
      "*, form_team_member:form_team_member_id!inner(*, team_member_user: team_member_user_id(user_id, user_first_name, user_last_name, user_avatar))",
      {
        count: "exact",
      }
    )
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

// Get all team members
export const getAllTeamMembers = async (
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
    .eq("team_member_team_id", teamId)
    .eq("team_member_is_disabled", false);
  if (error) throw error;

  return data;
};

// Get team's all admin members
export const getTeamAdminList = async (
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
    .eq("team_member_team_id", teamId)
    .eq("team_member_is_disabled", false)
    .eq("team_member_role", "ADMIN");
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
      "form_name, form_description, form_date_created, form_is_hidden, form_is_formsly_form, form_team_member: form_team_member_id(team_member_id, team_member_user: team_member_user_id(user_id, user_first_name, user_last_name, user_avatar, user_username)), form_signer: signer_table(signer_id, signer_is_primary_signer, signer_action, signer_order, signer_is_disabled, signer_team_member: signer_team_member_id(team_member_id, team_member_user: team_member_user_id(user_first_name, user_last_name, user_avatar))), form_section: section_table(*, section_field: field_table(*, field_option: option_table(*))))"
    )
    .eq("form_id", formId)
    .eq("form_is_disabled", false)
    .eq("form_signer.signer_is_disabled", false)
    .single();

  if (error) throw error;

  return data;
};

// Get notification
export const getNotification = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    memberId: string;
    app: AppType;
    page: number;
    limit: number;
  }
) => {
  const { memberId, app, page, limit } = params;
  const start = (page - 1) * limit;

  const { data: notificationList, error: notificationListError } =
    await supabaseClient
      .from("notification_table")
      .select("*")
      .eq("notification_team_member_id", memberId)
      .eq("notification_app", app)
      .order("notification_date_created", { ascending: false })
      .limit(limit)
      .range(start, start + limit - 1);
  if (notificationListError) throw notificationListError;

  const { count: unreadNotificationCount, error: unreadNotificationError } =
    await supabaseClient
      .from("notification_table")
      .select("*", { count: "exact", head: true })
      .eq("notification_team_member_id", memberId)
      .eq("notification_app", app)
      .eq("notification_is_read", false);
  if (unreadNotificationError) throw unreadNotificationError;

  return { data: notificationList, count: unreadNotificationCount };
};

// Get item list
export const getItemList = async (
  supabaseClient: SupabaseClient<Database>,
  params: { teamId: string; limit: number; page: number; search?: string }
) => {
  const { teamId, search, limit, page } = params;

  const start = (page - 1) * limit;

  let query = supabaseClient
    .from("item_table")
    .select("*, item_description: item_description_table(*)", {
      count: "exact",
    })
    .eq("item_team_id", teamId)
    .eq("item_is_disabled", false);

  if (search) {
    query = query.ilike("item_general_name", `%${search}%`);
  }

  query.order("item_date_created", { ascending: false });
  query.limit(limit);
  query.range(start, start + limit - 1);
  query.maybeSingle;

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data,
    count,
  };
};

// Get all items
export const getAllItems = async (
  supabaseClient: SupabaseClient<Database>,
  params: { teamId: string }
) => {
  const { teamId } = params;
  const { data, error } = await supabaseClient
    .from("item_table")
    .select("*, item_description: item_description_table(*)")
    .eq("item_team_id", teamId)
    .eq("item_is_disabled", false)
    .eq("item_is_available", true)
    .order("item_general_name", { ascending: false });

  if (error) throw error;

  return data;
};

// Get item description list
export const getItemDescriptionList = async (
  supabaseClient: SupabaseClient<Database>,
  params: { itemId: string; limit: number; page: number; search?: string }
) => {
  const { itemId, search, limit, page } = params;

  const start = (page - 1) * limit;

  let query = supabaseClient
    .from("item_description_table")
    .select("*", {
      count: "exact",
    })
    .eq("item_description_item_id", itemId)
    .eq("item_is_disabled", false);

  if (search) {
    query = query.ilike("item_description_label", `%${search}%`);
  }

  query.order("item_description_date_created", { ascending: false });
  query.limit(limit);
  query.range(start, start + limit - 1);
  query.maybeSingle;

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data,
    count,
  };
};

// Get item description field list
export const getItemDescriptionFieldList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    descriptionId: string;
    limit: number;
    page: number;
    search?: string;
  }
) => {
  const { descriptionId, search, limit, page } = params;

  const start = (page - 1) * limit;

  let query = supabaseClient
    .from("item_description_field_table")
    .select("*", {
      count: "exact",
    })
    .eq("item_description_field_item_description_id", descriptionId)
    .eq("item_description_field_is_disabled", false);

  if (search) {
    query = query.ilike("item_description_field_value", `%${search}%`);
  }

  query.order("item_description_field_date_created", { ascending: false });
  query.limit(limit);
  query.range(start, start + limit - 1);
  query.maybeSingle;

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data,
    count,
  };
};

// get item
export const getItem = async (
  supabaseClient: SupabaseClient<Database>,
  params: { teamId: string; itemName: string }
) => {
  const { teamId, itemName } = params;

  const { data, error } = await supabaseClient
    .from("item_table")
    .select(
      "*, item_description: item_description_table(*, item_description_field: item_description_field_table(*))"
    )
    .eq("item_team_id", teamId)
    .eq("item_general_name", itemName)
    .eq("item_is_disabled", false)
    .eq("item_description.item_description_is_disabled", false)
    .eq(
      "item_description.item_description_field.item_description_field_is_disabled",
      false
    )
    .single();
  if (error) throw error;

  return data as ItemWithDecsriptionAndField;
};

// check if requisition form can be activated
export const checkRequisitionFormStatus = async (
  supabaseClient: SupabaseClient<Database>,
  params: { teamId: string; formId: string }
) => {
  const { teamId, formId } = params;

  const { count: itemCount, error: itemError } = await supabaseClient
    .from("item_table")
    .select("*", { count: "exact", head: true })
    .eq("item_team_id", teamId)
    .eq("item_is_available", true)
    .eq("item_is_disabled", false);

  if (itemError) throw itemError;

  if (!itemCount) {
    return "There must be at least one available item" as string;
  }

  const { count: signerCount, error: signerError } = await supabaseClient
    .from("signer_table")
    .select("*", { count: "exact", head: true })
    .eq("signer_form_id", formId)
    .eq("signer_is_disabled", false)
    .eq("signer_is_primary_signer", true);
  if (signerError) throw signerError;
  if (!signerCount) {
    return "You need to add a primary signer first" as string;
  }

  return true as boolean;
};

// check if item name already exists
export const checkItemName = async (
  supabaseClient: SupabaseClient<Database>,
  params: { itemName: string; teamId: string }
) => {
  const { itemName, teamId } = params;

  const { count, error } = await supabaseClient
    .from("item_table")
    .select("*", { count: "exact", head: true })
    .eq("item_general_name", itemName)
    .eq("item_is_disabled", false)
    .eq("item_team_id", teamId);
  if (error) throw error;

  return Boolean(count);
};

// check if item description already exists
export const checkItemDescription = async (
  supabaseClient: SupabaseClient<Database>,
  params: { itemDescription: string; descriptionId: string }
) => {
  const { itemDescription, descriptionId } = params;

  const { count, error } = await supabaseClient
    .from("item_description_field_table")
    .select("*", { count: "exact", head: true })
    .eq("item_description_field_value", itemDescription)
    .eq("item_description_field_is_disabled", false)
    .eq("item_description_field_item_description_id", descriptionId);
  if (error) throw error;

  return Boolean(count);
};

// Get team member list
export const getTeamMemberList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    page: number;
    limit: number;
    search?: string;
  }
) => {
  const { teamId, page, limit, search = "" } = params;

  const start = (page - 1) * limit;

  let query = supabaseClient
    .from("team_member_table")
    .select(
      "team_member_id, team_member_role, team_member_user: team_member_user_id!inner(user_id, user_first_name, user_last_name, user_avatar, user_email)",
      { count: "exact" }
    )
    .eq("team_member_team_id", teamId)
    .eq("team_member_is_disabled", false)
    .eq("team_member_user.user_is_disabled", false);

  if (search) {
    query = query.or(
      `user_first_name.ilike.%${search}%, user_last_name.ilike.%${search}%, user_email.ilike.%${search}%`,
      { foreignTable: "team_member_user_id" }
    );
  }
  query.limit(limit);
  query.range(start, start + limit - 1);
  query.order("team_member_role", { ascending: true });

  const { data, error, count } = await query;
  if (error) throw error;

  return { data: data as TeamMemberType[], count };
};
