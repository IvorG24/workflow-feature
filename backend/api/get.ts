import { Database } from "@/utils/database";
import { regExp } from "@/utils/string";
import {
  AppType,
  AttachmentBucketType,
  FormStatusType,
  FormType,
  ItemWithDescriptionAndField,
  RequestByFormType,
  RequestResponseTableRow,
  RequestWithResponseType,
  TeamMemberType,
  TeamTableRow,
} from "@/utils/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

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
  const teamList = data
    .map((teamMember) => {
      return teamMember.team as TeamTableRow;
    })
    .sort((a, b) => {
      return Date.parse(b.team_date_created) - Date.parse(a.team_date_created);
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
      "request_id, request_date_created, request_status, request_team_member: request_team_member_id!inner(team_member_user: team_member_user_id(user_id, user_first_name, user_last_name, user_avatar)), request_form: request_form_id!inner(form_id, form_name, form_description), request_signer: request_signer_table(request_signer_id, request_signer_status, request_signer: request_signer_signer_id(signer_is_primary_signer, signer_team_member: signer_team_member_id(team_member_user: team_member_user_id(user_id, user_first_name, user_last_name, user_avatar))))",
      { count: "exact" }
    )
    .eq("request_team_member.team_member_team_id", teamId)
    .eq("request_is_disabled", false)
    .eq("request_form.form_is_disabled", false);

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

    if (!firstTeam) return null;
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
      "*, request_team_member: request_team_member_id(team_member_team_id, team_member_user: team_member_user_id(user_id, user_first_name, user_last_name, user_username, user_avatar)), request_signer: request_signer_table(request_signer_id, request_signer_status, request_signer_signer: request_signer_signer_id(signer_id, signer_is_primary_signer, signer_action, signer_order, signer_team_member: signer_team_member_id(team_member_id, team_member_user: team_member_user_id(user_first_name, user_last_name)))), request_comment: comment_table(comment_id, comment_date_created, comment_content, comment_is_edited, comment_last_updated, comment_type, comment_team_member_id, comment_team_member: comment_team_member_id(team_member_user: team_member_user_id(user_id, user_first_name, user_last_name, user_username, user_avatar))), request_form: request_form_id(form_id, form_name, form_description, form_is_formsly_form, form_section: section_table(*, section_field: field_table(*, field_option: option_table(*), field_response: request_response_table(*)))))"
    )
    .eq("request_id", requestId)
    .eq("request_is_disabled", false)
    .eq(
      "request_form.form_section.section_field.field_response.request_response_request_id",
      requestId
    )
    .eq("request_comment.comment_is_disabled", false)
    .order("comment_date_created", {
      foreignTable: "comment_table",
      ascending: false,
    })
    .maybeSingle();
  if (error) throw error;

  const formattedRequest = data as unknown as RequestWithResponseType;
  const sortedSection = formattedRequest.request_form.form_section
    .sort((a, b) => {
      return a.section_order - b.section_order;
    })
    .map((section) => {
      const sortedFields = section.section_field
        .sort((a, b) => {
          return a.field_order - b.field_order;
        })
        .map((field) => {
          let sortedOption = field.field_option;
          if (field.field_option) {
            sortedOption = field.field_option.sort((a, b) => {
              return a.option_order - b.option_order;
            });
          }
          return {
            ...field,
            field_option: sortedOption,
          };
        });
      return {
        ...section,
        section_field: sortedFields,
      };
    });

  return {
    ...formattedRequest,
    request_form: {
      ...formattedRequest.request_form,
      form_section: sortedSection,
    },
  };
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
export const getUserTeamMemberData = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    userId: string;
    teamId: string;
  }
) => {
  const { userId, teamId } = params;
  const { data, error } = await supabaseClient
    .from("team_member_table")
    .select("*")
    .eq("team_member_user_id", userId)
    .eq("team_member_team_id", teamId)
    .maybeSingle();

  if (error) throw error;

  return data;
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
    search?: string;
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
      "form_id, form_name, form_description, form_date_created, form_is_hidden, form_is_formsly_form, form_group, form_is_for_every_member, form_team_member: form_team_member_id(team_member_id, team_member_user: team_member_user_id(user_id, user_first_name, user_last_name, user_avatar, user_username)), form_signer: signer_table(signer_id, signer_is_primary_signer, signer_action, signer_order, signer_is_disabled, signer_team_member: signer_team_member_id(team_member_id, team_member_user: team_member_user_id(user_id, user_first_name, user_last_name, user_avatar))), form_section: section_table(*, section_field: field_table(*, field_option: option_table(*))))"
    )
    .eq("form_id", formId)
    .eq("form_is_disabled", false)
    .eq("form_signer.signer_is_disabled", false)
    .single();
  if (error) throw error;

  const formattedForm = data as unknown as FormType;
  const sortedSection = formattedForm.form_section
    .sort((a, b) => {
      return a.section_order - b.section_order;
    })
    .map((section) => {
      const sortedFields = section.section_field
        .sort((a, b) => {
          return a.field_order - b.field_order;
        })
        .map((field) => {
          let sortedOption = field.field_option;
          if (field.field_option) {
            sortedOption = field.field_option.sort((a, b) => {
              return a.option_order - b.option_order;
            });
          }
          return {
            ...field,
            field_option: sortedOption,
          };
        });
      return {
        ...section,
        section_field: sortedFields,
      };
    });

  return {
    ...formattedForm,
    form_section: sortedSection,
  };
};

// Get notification
export const getAllNotification = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    userId: string;
    app: AppType;
    page: number;
    limit: number;
    teamId: string;
  }
) => {
  const { userId, app, page, limit, teamId } = params;
  const start = (page - 1) * limit;

  let notificationListQuery = supabaseClient
    .from("notification_table")
    .select("*")
    .eq("notification_user_id", userId)
    .or(`notification_app.eq.GENERAL, notification_app.eq.${app}`)
    .order("notification_date_created", { ascending: false })
    .limit(limit)
    .range(start, start + limit - 1);

  if (teamId) {
    notificationListQuery = notificationListQuery.or(
      `notification_team_id.eq.${teamId}, notification_team_id.is.${null}`
    );
  } else {
    notificationListQuery = notificationListQuery.is(
      "notification_team_id",
      null
    );
  }

  const { data: notificationList, error: notificationListError } =
    await notificationListQuery;
  if (notificationListError) throw notificationListError;

  let unreadNotificationCountQuery = supabaseClient
    .from("notification_table")
    .select("*", { count: "exact", head: true })
    .eq("notification_user_id", userId)
    .or(`notification_app.eq.GENERAL, notification_app.eq.${app}`)
    .eq("notification_is_read", false);

  if (teamId) {
    unreadNotificationCountQuery = unreadNotificationCountQuery.or(
      `notification_team_id.eq.${teamId}, notification_team_id.is.${null}`
    );
  } else {
    unreadNotificationCountQuery = unreadNotificationCountQuery.is(
      "notification_team_id",
      null
    );
  }

  const { count: unreadNotificationCount, error: unreadNotificationError } =
    await unreadNotificationCountQuery;
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
    .order("item_general_name", { ascending: true });

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
      "*, item_description: item_description_table(*, item_description_field: item_description_field_table(*), item_field: item_description_field_id(*))"
    )
    .eq("item_team_id", teamId)
    .eq("item_general_name", itemName)
    .eq("item_is_disabled", false)
    .eq("item_is_available", true)
    .eq("item_description.item_description_is_disabled", false)
    .eq("item_description.item_description_is_available", true)
    .eq(
      "item_description.item_description_field.item_description_field_is_disabled",
      false
    )
    .eq(
      "item_description.item_description_field.item_description_field_is_available",
      true
    )
    .single();
  if (error) throw error;

  return data as ItemWithDescriptionAndField;
};

// check if Order to Purchase form can be activated
export const checkOrderToPurchaseFormStatus = async (
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

// check if item's code already exists
export const checkItemCode = async (
  supabaseClient: SupabaseClient<Database>,
  params: { itemCode: string; teamId: string }
) => {
  const { itemCode, teamId } = params;

  const { count, error } = await supabaseClient
    .from("item_table")
    .select("*", { count: "exact", head: true })
    .or(`item_cost_code.eq.${itemCode}, item_gl_account.eq.${itemCode}`)
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
    search?: string;
  }
) => {
  const { teamId, search = "" } = params;

  let query = supabaseClient
    .from("team_member_table")
    .select(
      "team_member_id, team_member_role, team_member_group_list, team_member_project_list, team_member_user: team_member_user_id!inner(user_id, user_first_name, user_last_name, user_avatar, user_email)"
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

  const { data, error } = await query;
  if (error) throw error;

  return data as TeamMemberType[];
};

// Get invitation
export const getInvitation = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    invitationId: string;
    userEmail: string;
  }
) => {
  const { invitationId, userEmail } = params;
  const { data, error } = await supabaseClient
    .from("invitation_table")
    .select(
      "*, invitation_from_team_member: invitation_from_team_member_id(*, team_member_team: team_member_team_id(*))"
    )
    .eq("invitation_id", invitationId)
    .eq("invitation_to_email", userEmail)
    .eq("invitation_is_disabled", false)
    .maybeSingle();

  if (error) throw error;

  return data;
};

// Get notification list
export const getNotificationList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    userId: string;
    app: AppType;
    page: number;
    limit: number;
    unreadOnly: boolean;
    teamId: string | null;
  }
) => {
  const { userId, app, page, limit, teamId, unreadOnly } = params;
  const start = (page - 1) * limit;

  let query = supabaseClient
    .from("notification_table")
    .select("*", {
      count: "exact",
    })
    .eq("notification_user_id", userId)
    .or(`notification_app.eq.GENERAL, notification_app.eq.${app}`);

  if (teamId) {
    query = query.or(
      `notification_team_id.eq.${teamId}, notification_team_id.is.${null}`
    );
  } else {
    query = query.is("notification_team_id", null);
  }

  if (unreadOnly) {
    query = query.eq("notification_is_read", false);
  }

  query = query.order("notification_date_created", { ascending: false });
  query = query.limit(limit);
  query = query.range(start, start + limit - 1);

  const { data, count, error } = await query;
  if (error) throw error;

  return { data, count };
};

// Get list of db that only have name column
export const getNameList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    table: string;
    teamId: string;
    limit: number;
    page: number;
    search?: string;
  }
) => {
  const { table, teamId, search, limit, page } = params;

  const start = (page - 1) * limit;

  let query = supabaseClient
    .from(`${table}_table`)
    .select("*", {
      count: "exact",
    })
    .eq(`${table}_team_id`, teamId)
    .eq(`${table}_is_disabled`, false);

  if (search) {
    query = query.ilike(`${table}_name`, `%${search}%`);
  }

  query.order(`${table}_date_created`, { ascending: false });
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

// Get all db that only have name column
export const getAllNames = async (
  supabaseClient: SupabaseClient<Database>,
  params: { table: string; teamId: string }
) => {
  const { table, teamId } = params;
  const { data, error } = await supabaseClient
    .from(`${table}_table`)
    .select("*")
    .eq(`${table}_team_id`, teamId)
    .eq(`${table}_is_disabled`, false)
    .eq(`${table}_is_available`, true)
    .order(`${table}_name`, { ascending: true });

  if (error) throw error;

  return data;
};

// check if db that only have name column's name already exists
export const checkName = async (
  supabaseClient: SupabaseClient<Database>,
  params: { table: string; name: string; teamId: string }
) => {
  const { table, name, teamId } = params;

  const { count, error } = await supabaseClient
    .from(`${table}_table`)
    .select("*", { count: "exact", head: true })
    .eq(`${table}_name`, name)
    .eq(`${table}_is_disabled`, false)
    .eq(`${table}_team_id`, teamId);
  if (error) throw error;

  return Boolean(count);
};

// Get processor list
export const getProcessorList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    processor: string;
    teamId: string;
    limit: number;
    page: number;
    search?: string;
  }
) => {
  const { processor, teamId, search, limit, page } = params;

  const start = (page - 1) * limit;

  let query = supabaseClient
    .from(`${processor}_processor_table`)
    .select(`*`, {
      count: `exact`,
    })
    .eq(`${processor}_processor_team_id`, teamId)
    .eq(`${processor}_processor_is_disabled`, false);

  if (search) {
    query = query.or(
      `${processor}_processor_first_name.ilike.%${search}%, ${processor}_processor_last_name.ilike.%${search}%, ${processor}_processor_employee_number.ilike.%${search}%`
    );
  }

  query.order(`${processor}_processor_date_created`, { ascending: false });
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

// Get processors
export const getAllProcessors = async (
  supabaseClient: SupabaseClient<Database>,
  params: { processor: string; teamId: string }
) => {
  const { processor, teamId } = params;
  const { data, error } = await supabaseClient
    .from(`${processor}_processor_table`)
    .select(`*`)
    .eq(`${processor}_processor_team_id`, teamId)
    .eq(`${processor}_processor_is_disabled`, false)
    .eq(`${processor}_processor_is_available`, true)
    .order(`${processor}_processor_first_name`, { ascending: true });

  if (error) throw error;

  return data;
};

// check if procesor already exists
export const checkProcessor = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    processor: string;
    firstName: string;
    lastName: string;
    employeeNumber: string;
    teamId: string;
  }
) => {
  const { processor, firstName, lastName, employeeNumber, teamId } = params;

  const { count, error } = await supabaseClient
    .from(`${processor}_processor_table`)
    .select(`*`, { count: `exact`, head: true })
    .eq(`${processor}_processor_first_name`, firstName)
    .eq(`${processor}_processor_last_name`, lastName)
    .eq(`${processor}_processor_employee_number`, employeeNumber)
    .eq(`${processor}_processor_is_disabled`, false)
    .eq(`${processor}_processor_team_id`, teamId);
  if (error) throw error;

  return Boolean(count);
};

// Get receiver list
export const getReceiverList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    receiver: string;
    teamId: string;
    limit: number;
    page: number;
    search?: string;
  }
) => {
  const { receiver, teamId, search, limit, page } = params;

  const start = (page - 1) * limit;

  let query = supabaseClient
    .from(`${receiver}_receiver_table`)
    .select(`*`, {
      count: `exact`,
    })
    .eq(`${receiver}_receiver_team_id`, teamId)
    .eq(`${receiver}_receiver_is_disabled`, false);

  if (search) {
    query = query.or(
      `${receiver}_receiver_first_name.ilike.%${search}%, ${receiver}_receiver_last_name.ilike.%${search}%, ${receiver}_receiver_employee_number.ilike.%${search}%`
    );
  }

  query.order(`${receiver}_receiver_date_created`, { ascending: false });
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

// Get receivers
export const getAllReceivers = async (
  supabaseClient: SupabaseClient<Database>,
  params: { receiver: string; teamId: string }
) => {
  const { receiver, teamId } = params;
  const { data, error } = await supabaseClient
    .from(`${receiver}_receiver_table`)
    .select(`*`)
    .eq(`${receiver}_receiver_team_id`, teamId)
    .eq(`${receiver}_receiver_is_disabled`, false)
    .eq(`${receiver}_receiver_is_available`, true)
    .order(`${receiver}_receiver_first_name`, { ascending: true });

  if (error) throw error;

  return data;
};

// check if receiver already exists
export const checkReceiver = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    receiver: string;
    firstName: string;
    lastName: string;
    employeeNumber: string;
    teamId: string;
  }
) => {
  const { receiver, firstName, lastName, employeeNumber, teamId } = params;

  const { count, error } = await supabaseClient
    .from(`${receiver}_receiver_table`)
    .select(`*`, { count: `exact`, head: true })
    .eq(`${receiver}_receiver_first_name`, firstName)
    .eq(`${receiver}_receiver_last_name`, lastName)
    .eq(`${receiver}_receiver_employee_number`, employeeNumber)
    .eq(`${receiver}_receiver_is_disabled`, false)
    .eq(`${receiver}_receiver_team_id`, teamId);
  if (error) throw error;

  return Boolean(count);
};

// Get request by formId
export const getRequestListByForm = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    formId?: string;
  }
) => {
  const { formId, teamId } = params;
  let query = supabaseClient
    .from("request_table")
    .select(
      "request_id, request_date_created, request_status, request_team_member: request_team_member_id!inner(team_member_id, team_member_user: team_member_user_id(user_id, user_first_name, user_last_name, user_avatar)), request_signer: request_signer_table(request_signer_id, request_signer_status, request_signer_signer: request_signer_signer_id(signer_id, signer_is_primary_signer, signer_action, signer_order, signer_team_member: signer_team_member_id(team_member_id, team_member_user: team_member_user_id(user_first_name, user_last_name, user_avatar)))), request_form: request_form_id!inner(form_id, form_name, form_description, form_is_formsly_form, form_section: section_table(*, section_field: field_table(*, field_option: option_table(*), field_response: request_response_table!inner(request_response_field_id, request_response_id, request_response, request_response_duplicatable_section_id, request_response_request_id))))",
      { count: "exact" }
    )
    .eq("request_team_member.team_member_team_id", teamId)
    .eq("request_is_disabled", false)
    .eq("request_form.form_is_disabled", false);

  if (formId) {
    const formCondition = `request_form_id.eq.${formId}`;
    query = query.or(formCondition);
  }
  const { data, error, count } = await query;
  if (error) throw error;

  const requestList = data as RequestByFormType[];

  return { data: requestList, count };
};

// Get specific formsly form by name and team id
export const getFormslyForm = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    formName: string;
    teamId: string;
  }
) => {
  const { formName, teamId } = params;

  const { data, error } = await supabaseClient
    .from("form_table")
    .select(
      "form_id, form_group, form_is_for_every_member, form_team_member: form_team_member_id!inner(team_member_team_id)"
    )
    .eq("form_name", formName)
    .eq("form_team_member.team_member_team_id", teamId)
    .eq("form_is_formsly_form", true)
    .maybeSingle();

  if (error) throw error;

  return data;
};

// Get specific OTP form id by name and team id
export const getFormIDForOTP = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
  }
) => {
  const { teamId } = params;
  const { data, error } = await supabaseClient
    .from("form_table")
    .select(
      "form_id, form_name, form_group, form_is_for_every_member, form_team_member: form_team_member_id!inner(team_member_team_id)"
    )
    .or("form_name.eq.Quotation, form_name.eq.Cheque Reference")
    .eq("form_team_member.team_member_team_id", teamId)
    .eq("form_is_formsly_form", true);
  if (error) throw error;

  return data.map((form) => {
    return {
      form_id: form.form_id,
      form_name: form.form_name,
      form_group: form.form_group,
      form_is_for_every_member: form.form_is_for_every_member,
    };
  });
};

// Check if the request id exists and already approved
export const checkRequest = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    requestId: string[];
  }
) => {
  const { requestId } = params;

  let requestCondition = "";
  requestId.forEach((id) => {
    requestCondition += `request_id.eq.${id}, `;
  });

  const { count, error } = await supabaseClient
    .from("request_table")
    .select("*", { count: "exact" })
    .or(requestCondition.slice(0, -2))
    .eq("request_status", "APPROVED")
    .eq("request_is_disabled", false);

  if (error) throw error;
  return count === requestId.length;
};

// Get response data by keyword
export const getResponseDataByKeyword = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    keyword: string;
    formId: string;
  }
) => {
  const { keyword, formId } = params;
  const { data, error } = await supabaseClient
    .from("request_response_table")
    .select(
      "*, response_field: request_response_field_id!inner(*), request_form: request_response_request_id!inner(request_id, request_form_id)"
    )
    .eq("request_form.request_form_id", formId)
    .in("response_field.field_type", ["TEXT", "TEXTAREA"])
    .ilike("request_response", `%${keyword}%`);

  if (error) throw error;

  return data;
};

// Check user if owner or admin
export const checkIfOwnerOrAdmin = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    userId: string;
    teamId: string;
  }
) => {
  const { userId, teamId } = params;
  const { data, error } = await supabaseClient
    .from("team_member_table")
    .select("team_member_role")
    .eq("team_member_user_id", userId)
    .eq("team_member_team_id", teamId)
    .maybeSingle();
  if (error) throw error;
  const role = data?.team_member_role;
  if (role === null) return false;
  return role === "ADMIN" || role === "OWNER";
};

// Get all formsly forward link form id
export const getFormslyForwardLinkFormId = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    requestId: string;
  }
) => {
  const { requestId } = params;

  const { data, error } = await supabaseClient
    .from("request_response_table")
    .select(
      "request_response_request: request_response_request_id!inner(request_id, request_status, request_form: request_form_id(form_name))"
    )
    .eq("request_response", `"${requestId}"`)
    .eq("request_response_request.request_status", "APPROVED");
  if (error) throw error;
  const formattedData = data as unknown as {
    request_response_request: {
      request_id: string;
      request_form: {
        form_name: string;
      };
    };
  }[];

  const requestList = {
    "Order to Purchase": [] as string[],
    Quotation: [] as string[],
    "Receiving Inspecting Report": [] as string[],
  };

  formattedData.forEach((request) => {
    switch (request.request_response_request.request_form.form_name) {
      case "Order to Purchase":
        requestList["Order to Purchase"].push(
          `"${request.request_response_request.request_id}"`
        );
        break;
      case "Quotation":
        requestList["Quotation"].push(
          `"${request.request_response_request.request_id}"`
        );
        break;
      case "Receiving Inspecting Report":
        requestList["Receiving Inspecting Report"].push(
          `"${request.request_response_request.request_id}"`
        );
        break;
    }
  });

  return requestList;
};

// Get item response of an otp request
export const getItemResponseForQuotation = async (
  supabaseClient: SupabaseClient<Database>,
  params: { requestId: string }
) => {
  const { requestId } = params;

  const { data: requestResponseData, error: requestResponseError } =
    await supabaseClient
      .from("request_response_table")
      .select(
        "*, request_response_field: request_response_field_id(field_name, field_order)"
      )
      .eq("request_response_request_id", requestId);

  if (requestResponseError) throw requestResponseError;
  const formattedRequestResponseData =
    requestResponseData as unknown as (RequestResponseTableRow & {
      request_response_field: { field_name: string; field_order: number };
    })[];

  const options: Record<
    string,
    {
      name: string;
      description: string;
      quantity: number;
      unit: string;
    }
  > = {};
  const idForNullDuplicationId = uuidv4();
  formattedRequestResponseData.forEach((response) => {
    if (response.request_response_field) {
      const fieldName = response.request_response_field.field_name;
      const duplicatableSectionId =
        response.request_response_duplicatable_section_id ??
        idForNullDuplicationId;

      if (response.request_response_field.field_order > 3) {
        if (!options[duplicatableSectionId]) {
          options[duplicatableSectionId] = {
            name: "",
            description: "",
            quantity: 0,
            unit: "",
          };
        }

        if (fieldName === "General Name") {
          options[duplicatableSectionId].name = JSON.parse(
            response.request_response
          );
        } else if (fieldName === "Unit of Measurement") {
          options[duplicatableSectionId].unit = JSON.parse(
            response.request_response
          );
        } else if (fieldName === "Quantity") {
          options[duplicatableSectionId].quantity = Number(
            response.request_response
          );
        } else if (fieldName === "Cost Code" || fieldName === "GL Account") {
        } else {
          options[duplicatableSectionId].description += `${
            options[duplicatableSectionId].description ? ", " : ""
          }${fieldName}: ${JSON.parse(response.request_response)}`;
        }
      }
    }
  });
  return options;
};

// Get item response of an quotation request
export const getItemResponseForRIR = async (
  supabaseClient: SupabaseClient<Database>,
  params: { requestId: string }
) => {
  const { requestId } = params;

  const { data: requestResponseData, error: requestResponseError } =
    await supabaseClient
      .from("request_response_table")
      .select(
        "*, request_response_field: request_response_field_id(field_name, field_order)"
      )
      .eq("request_response_request_id", requestId);

  if (requestResponseError) throw requestResponseError;
  const formattedRequestResponseData =
    requestResponseData as unknown as (RequestResponseTableRow & {
      request_response_field: { field_name: string; field_order: number };
    })[];

  const options: Record<
    string,
    {
      item: string;
      quantity: string;
    }
  > = {};
  const idForNullDuplicationId = uuidv4();
  formattedRequestResponseData.forEach((response) => {
    if (response.request_response_field) {
      const fieldName = response.request_response_field.field_name;
      const duplicatableSectionId =
        response.request_response_duplicatable_section_id ??
        idForNullDuplicationId;

      if (response.request_response_field.field_order > 4) {
        if (!options[duplicatableSectionId]) {
          options[duplicatableSectionId] = {
            item: "",
            quantity: "",
          };
        }

        if (fieldName === "Item") {
          options[duplicatableSectionId].item = JSON.parse(
            response.request_response
          );
        } else if (fieldName === "Quantity") {
          const matches = regExp.exec(options[duplicatableSectionId].item);

          if (matches) {
            const unit = matches[1].replace(/\d+/g, "").trim();

            options[
              duplicatableSectionId
            ].quantity = `${response.request_response} ${unit}`;
          }
        }
      }
    }
  });
  return options;
};

// Check if the approving or creating quotation item quantity are less than the otp quantity
export const checkQuotationItemQuantity = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    otpID: string;
    itemFieldId: string;
    quantityFieldId: string;
    itemFieldList: RequestResponseTableRow[];
    quantityFieldList: RequestResponseTableRow[];
  }
) => {
  const {
    otpID,
    itemFieldId,
    quantityFieldId,
    itemFieldList,
    quantityFieldList,
  } = params;

  // fetch request id
  const { data: requestIds, error: requestIdListError } = await supabaseClient
    .from("request_response_table")
    .select(
      "*, request_response_request: request_response_request_id!inner(request_status, request_form: request_form_id!inner(form_is_formsly_form, form_name))"
    )
    .eq("request_response", otpID)
    .eq("request_response_request.request_status", "APPROVED")
    .eq("request_response_request.request_form.form_is_formsly_form", true)
    .eq("request_response_request.request_form.form_name", "Quotation");

  if (requestIdListError) throw requestIdListError;
  const requestIdList = requestIds.map(
    (response) => response.request_response_request_id
  );

  // fetch request responses
  const { data: requestResponse, error: requestResponseError } =
    await supabaseClient
      .from("request_response_table")
      .select("*")
      .in("request_response_request_id", requestIdList)
      .or(
        `request_response_field_id.eq.${itemFieldId}, request_response_field_id.eq.${quantityFieldId}`
      );
  if (requestResponseError) throw requestResponseError;

  // separate item to quantity response
  const requestResponseItem: RequestResponseTableRow[] = [];
  const requestResponseQuantity: RequestResponseTableRow[] = [];
  requestResponse.forEach((response) => {
    if (response.request_response_field_id === itemFieldId) {
      requestResponseItem.push(response);
    } else if (response.request_response_field_id === quantityFieldId) {
      requestResponseQuantity.push(response);
    }
  });
  requestResponseItem.push(...itemFieldList);
  requestResponseQuantity.push(...quantityFieldList);

  const itemList: string[] = [];
  const quantityList: number[] = [];

  for (let i = 0; i < requestResponseItem.length; i++) {
    if (itemList.includes(requestResponseItem[i].request_response)) {
      const quantityIndex = itemList.indexOf(
        requestResponseItem[i].request_response
      );
      quantityList[quantityIndex] += Number(
        requestResponseQuantity[i].request_response
      );
    } else {
      itemList.push(requestResponseItem[i].request_response);
      quantityList.push(Number(requestResponseQuantity[i].request_response));
    }
  }

  const returnData: string[] = [];
  for (let i = 0; i < itemList.length; i++) {
    const matches = regExp.exec(itemList[i]);
    if (!matches) continue;

    const quantityMatch = matches[1].match(/(\d+)/);
    if (!quantityMatch) continue;

    const expectedQuantity = Number(quantityMatch[1]);
    const unit = matches[1].replace(/\d+/g, "").trim();

    if (quantityList[i] > expectedQuantity) {
      returnData.push(
        `${JSON.parse(itemList[i])} exceeds quantity limit by ${
          quantityList[i] - expectedQuantity
        } ${unit}`
      );
    }
  }
  return returnData;
};

// Check if the approving or creating rir item quantity are less than the quotation quantity
export const checkRIRItemQuantity = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    quotationId: string;
    itemFieldId: string;
    quantityFieldId: string;
    itemFieldList: RequestResponseTableRow[];
    quantityFieldList: RequestResponseTableRow[];
  }
) => {
  const {
    quotationId,
    itemFieldId,
    quantityFieldId,
    itemFieldList,
    quantityFieldList,
  } = params;

  // fetch request id
  const { data: requestIds, error: requestIdListError } = await supabaseClient
    .from("request_response_table")
    .select(
      "*, request_response_request: request_response_request_id!inner(request_status, request_form: request_form_id!inner(form_is_formsly_form, form_name))"
    )
    .eq("request_response", quotationId)
    .eq("request_response_request.request_status", "APPROVED")
    .eq("request_response_request.request_form.form_is_formsly_form", true)
    .eq(
      "request_response_request.request_form.form_name",
      "Receiving Inspecting Report"
    );

  if (requestIdListError) throw requestIdListError;
  const requestIdList = requestIds.map(
    (response) => response.request_response_request_id
  );

  // fetch request responses
  const { data: requestResponse, error: requestResponseError } =
    await supabaseClient
      .from("request_response_table")
      .select("*")
      .in("request_response_request_id", requestIdList)
      .or(
        `request_response_field_id.eq.${itemFieldId}, request_response_field_id.eq.${quantityFieldId}`
      );
  if (requestResponseError) throw requestResponseError;

  // separate item to quantity response
  const requestResponseItem: RequestResponseTableRow[] = [];
  const requestResponseQuantity: RequestResponseTableRow[] = [];
  requestResponse.forEach((response) => {
    if (response.request_response_field_id === itemFieldId) {
      requestResponseItem.push(response);
    } else if (response.request_response_field_id === quantityFieldId) {
      requestResponseQuantity.push(response);
    }
  });
  requestResponseItem.push(...itemFieldList);
  requestResponseQuantity.push(...quantityFieldList);

  const itemList: string[] = [];
  const quantityList: number[] = [];

  for (let i = 0; i < requestResponseItem.length; i++) {
    if (itemList.includes(requestResponseItem[i].request_response)) {
      const quantityIndex = itemList.indexOf(
        requestResponseItem[i].request_response
      );
      quantityList[quantityIndex] += Number(
        requestResponseQuantity[i].request_response
      );
    } else {
      itemList.push(requestResponseItem[i].request_response);
      quantityList.push(Number(requestResponseQuantity[i].request_response));
    }
  }

  const returnData: string[] = [];
  for (let i = 0; i < itemList.length; i++) {
    const matches = regExp.exec(itemList[i]);
    if (!matches) continue;

    const quantityMatch = matches[1].match(/(\d+)/);
    if (!quantityMatch) continue;

    const expectedQuantity = Number(quantityMatch[1]);
    const unit = matches[1].replace(/\d+/g, "").trim().split(" ")[0];

    if (quantityList[i] > expectedQuantity) {
      returnData.push(
        `${JSON.parse(itemList[i])} exceeds quantity limit by ${
          quantityList[i] - expectedQuantity
        } ${unit}`
      );
    }
  }
  return returnData;
};

// Get SSOT for spreadsheet view
export const checkIfTeamHaveFormslyForms = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
  }
) => {
  const { teamId } = params;
  const { count, error } = await supabaseClient
    .from("form_table")
    .select(
      "*, form_team_member: form_team_member_id!inner(team_member_team_id)",
      {
        count: "exact",
        head: true,
      }
    )
    .eq("form_team_member.team_member_team_id", teamId)
    .eq("form_is_formsly_form", true);

  if (error) throw error;

  return Boolean(count);
};

// Get team member list of projects
export const getMemberProjectList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    userId: string;
    teamId: string;
  }
) => {
  const { userId, teamId } = params;
  const { data, error } = await supabaseClient
    .from("team_member_table")
    .select("team_member_project_list")
    .eq("team_member_user_id", userId)
    .eq("team_member_team_id", teamId)
    .single();
  if (error) throw error;

  return data.team_member_project_list;
};

// Get team group list
export const getTeamGroupList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
  }
) => {
  const { teamId } = params;
  const { data, error } = await supabaseClient
    .from("team_table")
    .select("team_group_list")
    .eq("team_id", teamId)
    .single();
  if (error) throw error;

  return data.team_group_list;
};
