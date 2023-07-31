import { Database } from "@/utils/database";
import { regExp } from "@/utils/string";
import {
  AppType,
  AttachmentBucketType,
  CanvassLowestPriceType,
  CanvassType,
  FormStatusType,
  FormType,
  ItemWithDescriptionAndField,
  NotificationTableRow,
  RequestByFormType,
  RequestDashboardOverviewData,
  RequestListItemType,
  RequestResponseTableRow,
  RequestWithResponseType,
  TeamMemberType,
  TeamTableRow,
} from "@/utils/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { lowerCase, startCase } from "lodash";
import { v4 as uuidv4 } from "uuid";

const REQUEST_STATUS_LIST = ["PENDING", "APPROVED", "REJECTED"];

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

  const requestorCondition = requestor
    ?.map((value) => `request_table.request_team_member_id = '${value}'`)
    .join(" OR ");
  const statusCondition = status
    ?.map((value) => `request_table.request_status = '${value}'`)
    .join(" OR ");
  const formCondition = form
    ?.map((value) => `request_table.request_form_id = '${value}'`)
    .join(" OR ");

  const { data, error } = await supabaseClient.rpc("fetch_request_list", {
    input_data: {
      teamId: teamId,
      page: page,
      limit: limit,
      requestor: requestorCondition ? `AND ${requestorCondition}` : "",
      form: formCondition ? `AND ${formCondition}` : "",
      status: statusCondition ? `AND ${statusCondition}` : "",
      search: search ? `AND request_table.request_id = '${search}'` : "",
      sort: sort === "descending" ? "DESC" : "ASC",
    },
  });

  if (error) throw error;
  const dataFormat = data as unknown as {
    data: RequestListItemType[];
    count: number;
  };

  return { data: dataFormat.data, count: dataFormat.count };
};

// Get user's active team id
export const getUserActiveTeamId = async (
  supabaseClient: SupabaseClient<Database>,
  params: { userId: string }
) => {
  const { userId } = params;

  const { data: activeTeamId, error } = await supabaseClient
    .rpc("get_user_active_team_id", { user_id: userId })
    .select("*")
    .single();
  if (error) throw error;

  return activeTeamId;
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
      `*, 
      request_team_member: request_team_member_id!inner(
        team_member_team_id, 
        team_member_user: team_member_user_id!inner(
          user_id, 
          user_first_name, 
          user_last_name, 
          user_username, 
          user_avatar
        )
      ), 
      request_signer: request_signer_table!inner(
        request_signer_id, 
        request_signer_status, 
        request_signer_signer: request_signer_signer_id!inner(
          signer_id, 
          signer_is_primary_signer, 
          signer_action, 
          signer_order, 
          signer_team_member: signer_team_member_id!inner(
            team_member_id, 
            team_member_user: team_member_user_id!inner(
              user_first_name, 
              user_last_name
            )
          )
        )
      ), 
      request_comment: comment_table(
        comment_id, 
        comment_date_created, 
        comment_content, 
        comment_is_edited,
        comment_last_updated, 
        comment_type, 
        comment_team_member_id, 
        comment_team_member: comment_team_member_id!inner(
          team_member_user: team_member_user_id!inner(
            user_id, 
            user_first_name, 
            user_last_name, 
            user_username, 
            user_avatar
          )
        )
      ), 
      request_form: request_form_id!inner(
        form_id, 
        form_name, 
        form_description, 
        form_is_formsly_form, 
        form_section: section_table!inner(
          *, 
          section_field: field_table!inner(
            *, 
            field_option: option_table(*), 
            field_response: request_response_table(*)
          )
        )
      )`
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
    .or("team_member_role.eq.ADMIN, team_member_role.eq.OWNER");
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
      `form_id, 
      form_name, 
      form_description, 
      form_date_created, 
      form_is_hidden, 
      form_is_formsly_form, 
      form_group, 
      form_is_for_every_member, 
      form_team_member: form_team_member_id(
        team_member_id, 
        team_member_user: team_member_user_id(
          user_id, 
          user_first_name, 
          user_last_name, 
          user_avatar, 
          user_username
        )
      ), 
      form_signer: signer_table(
        signer_id, 
        signer_is_primary_signer, 
        signer_action, 
        signer_order,
        signer_is_disabled, 
        signer_team_member: signer_team_member_id(
          team_member_id, 
          team_member_user: team_member_user_id(
            user_id, 
            user_first_name, 
            user_last_name, 
            user_avatar
          )
        )
      ), 
      form_section: section_table(
        *, 
        section_field: 
        field_table(
          *, 
          field_option: option_table(*)
        )
      )`
    )
    .eq("form_id", formId)
    // .eq("form_is_disabled", false)
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
  const { data, error } = await supabaseClient
    .rpc("get_all_notification", { input_data: params })
    .select("*")
    .single();

  if (error) throw error;

  return data as { data: NotificationTableRow[]; count: number };
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

  const { data, error } = await supabaseClient
    .rpc("check_order_to_purchase_form_status", {
      form_id: formId,
      team_id: teamId,
    })
    .select("*")
    .single();
  if (error) throw error;

  return data === "true" ? true : (data as string);
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
      "request_id, request_date_created, request_status, request_team_member: request_team_member_id!inner(team_member_id, team_member_user: team_member_user_id(user_id, user_first_name, user_last_name, user_avatar)), request_form: request_form_id!inner(form_id, form_name, form_description, form_is_formsly_form, form_section: section_table(*, section_field: field_table(*, field_option: option_table(*), field_response: request_response_table!inner(request_response_field_id, request_response_id, request_response, request_response_duplicatable_section_id, request_response_request_id))))",
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

export const getDashboardOverViewData = async (
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
      "request_id, request_date_created, request_status, request_team_member: request_team_member_id!inner(team_member_id, team_member_user: team_member_user_id(user_id, user_first_name, user_last_name, user_avatar)), request_signer: request_signer_table(request_signer_id, request_signer_status, request_signer_signer: request_signer_signer_id(signer_id, signer_is_primary_signer, signer_action, signer_order, signer_team_member: signer_team_member_id(team_member_id, team_member_user: team_member_user_id(user_first_name, user_last_name, user_avatar)))), request_form: request_form_id!inner(form_id, form_name, form_description, form_is_formsly_form)))",
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

  const requestList = data as unknown as RequestDashboardOverviewData[];

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
    .or(
      "form_name.eq.Quotation, form_name.eq.Cheque Reference, form_name.ilike.%Sourced%, form_name.eq.Sourced Order to Purchase"
    )
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

// Check if the request is pending
export const checkOTPRequestForSourced = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    otpId: string;
  }
) => {
  const { otpId } = params;

  const { count, error } = await supabaseClient
    .from("request_table")
    .select("*", { count: "exact" })
    .eq("request_id", otpId)
    .eq("request_status", "PENDING")
    .eq("request_is_disabled", false);

  if (error) throw error;
  return Boolean(count);
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
    "Receiving Inspecting Report (Purchased)": [] as string[],
    "Receiving Inspecting Report (Sourced)": [] as string[],
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
      case "Receiving Inspecting Report (Purchased)":
        requestList["Receiving Inspecting Report (Purchased)"].push(
          `"${request.request_response_request.request_id}"`
        );
        break;
      case "Receiving Inspecting Report (Sourced)":
        requestList["Receiving Inspecting Report (Sourced)"].push(
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

      if (response.request_response_field.field_order > 4) {
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

// Get item response of a quotation request
export const getItemResponseForRIRPurchased = async (
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

// Get item response of a otp request
export const getItemResponseForRIRSourced = async (
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
      generalName: string;
      unit: string;
      quantity: number;
      description: string;
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
            generalName: "",
            unit: "",
            quantity: 0,
            description: "",
          };
        }

        if (fieldName === "General Name") {
          options[duplicatableSectionId].generalName = JSON.parse(
            response.request_response
          );
        } else if (fieldName === "Unit of Measurement") {
          options[duplicatableSectionId].unit = JSON.parse(
            response.request_response
          );
        } else if (fieldName === "Quantity") {
          options[duplicatableSectionId].quantity = JSON.parse(
            response.request_response
          );
        } else if (fieldName === "Cost Code" || fieldName === "GL Account") {
        } else {
          options[duplicatableSectionId].description += `${
            response.request_response_field.field_name
          }: ${JSON.parse(response.request_response)}, `;
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
  const { data, error } = await supabaseClient
    .rpc("check_quotation_item_quantity", { input_data: params })
    .select("*");

  if (error) throw error;

  return data as string[];
};

// Check if the approving or creating rir purchased item quantity are less than the quotation quantity
export const checkRIRPurchasedItemQuantity = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    quotationId: string;
    itemFieldId: string;
    quantityFieldId: string;
    itemFieldList: RequestResponseTableRow[];
    quantityFieldList: RequestResponseTableRow[];
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("check_rir_purchased_item_quantity", { input_data: params })
    .select("*");

  if (error) throw error;

  return data as string[];
};

// Check if the approving or creating rir sourced item quantity are less than the quotation quantity
export const checkRIRSourcedItemQuantity = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    otpId: string;
    itemFieldId: string;
    quantityFieldId: string;
    itemFieldList: RequestResponseTableRow[];
    quantityFieldList: RequestResponseTableRow[];
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("check_rir_sourced_item_quantity", { input_data: params })
    .select("*");

  if (error) throw error;

  return data as string[];
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

// Get request per status count
export const getRequestStatusCount = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    formId: string;
    teamId: string;
    startDate: string;
    endDate: string;
  }
) => {
  const { formId, teamId, startDate, endDate } = params;
  const getCount = (status: string) =>
    supabaseClient
      .from("request_table")
      .select(
        `request_team_member: request_team_member_id!inner(team_member_team_id)`,
        { count: "exact", head: true }
      )
      .eq("request_form_id", formId)
      .eq("request_team_member.team_member_team_id", teamId)
      .eq("request_status", status)
      .gte("request_date_created", startDate)
      .lte("request_date_created", endDate);

  const data = await Promise.all(
    REQUEST_STATUS_LIST.map(async (status) => {
      const { count: statusCount } = await getCount(status);

      return {
        label: startCase(lowerCase(status)),
        value: statusCount || 0,
      };
    })
  );

  const totalCount = data.reduce((total, item) => item.value + total, 0);

  return {
    data,
    totalCount,
  };
};

export const getRequestorData = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    formId: string;
    teamMemberId: string;
    startDate: string;
    endDate: string;
  }
) => {
  const { formId, teamMemberId, startDate, endDate } = params;

  const getRequestCount = (status: string) =>
    supabaseClient
      .from("request_table")
      .select("*", { count: "exact", head: true })
      .eq("request_form_id", formId)
      .eq("request_status", status)
      .eq("request_team_member_id", teamMemberId)
      .gte("request_date_created", startDate)
      .lte("request_date_created", endDate);

  const data = await Promise.all(
    REQUEST_STATUS_LIST.map(async (status) => {
      const { count: statusCount } = await getRequestCount(status);

      return {
        label: startCase(lowerCase(status)),
        value: statusCount || 0,
      };
    })
  );

  return data;
};

export const getSignerData = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    formId: string;
    teamMemberId: string;
    startDate: string;
    endDate: string;
  }
) => {
  const { formId, teamMemberId, startDate, endDate } = params;
  const getSignedRequestCount = (status: string) =>
    supabaseClient
      .from("request_signer_table")
      .select(
        "request: request_signer_request_id!inner(request_form_id, request_date_created), request_signer: request_signer_signer_id!inner(team_member: signer_team_member_id!inner(team_member_id, team_member_team_id)), request_signer_status",
        { count: "exact", head: true }
      )
      .eq("request.request_form_id", formId)
      .eq("request_signer_status", status)
      .eq("request_signer.team_member.team_member_id", teamMemberId)
      .gte("request.request_date_created", startDate)
      .lte("request.request_date_created", endDate);

  const data = await Promise.all(
    REQUEST_STATUS_LIST.map(async (status) => {
      const { count: statusCount } = await getSignedRequestCount(status);

      return {
        label: startCase(lowerCase(status)),
        value: statusCount || 0,
      };
    })
  );

  return data;
};

// Get all quotation request for the otp
export const getOTPPendingQuotationRequestList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    requestId: string;
  }
) => {
  const { requestId } = params;

  const { data, error } = await supabaseClient
    .from("request_response_table")
    .select(
      `request_response_request: request_response_request_id!inner(
        request_id, 
        request_status, 
        request_form: request_form_id!inner(
          form_name
        )
      )`
    )
    .eq("request_response", `"${requestId}"`)
    .eq("request_response_request.request_status", "PENDING")
    .eq("request_response_request.request_form.form_name", "Quotation");

  if (error) throw error;
  const formattedData = data as unknown as {
    request_response_request: { request_id: string };
  }[];
  return formattedData.map(
    (request) => request.request_response_request.request_id
  );
};

// Get canvass data
export const getCanvassData = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    requestId: string;
  }
) => {
  const { requestId } = params;

  const items = await getItemResponseForQuotation(supabaseClient, {
    requestId,
  });
  const itemOptions = Object.keys(items).map(
    (item) =>
      `${items[item].name} (${items[item].quantity} ${items[item].unit}) (${items[item].description})`
  );

  const canvassRequest = await getOTPPendingQuotationRequestList(
    supabaseClient,
    { requestId }
  );

  const additionalChargeFields = [
    "Delivery Fee",
    "Bank Charge",
    "Mobilization Charge",
    "Demobilization Charge",
    "Freight Charge",
    "Hauling Charge",
    "Handling Charge",
    "Packing Charge",
  ];

  const summaryData: CanvassLowestPriceType = {};
  const quotationRequestList = await Promise.all(
    canvassRequest.map(async (canvassRequestId) => {
      const { data: quotationResponseList, error: quotationResponseListError } =
        await supabaseClient
          .from("request_response_table")
          .select(
            "*, request_response_field: request_response_field_id!inner(field_name)"
          )
          .eq("request_response_request_id", canvassRequestId)
          .in("request_response_field.field_name", [
            "Item",
            "Price per Unit",
            "Quantity",
            ...additionalChargeFields,
          ]);
      if (quotationResponseListError) throw quotationResponseListError;
      summaryData[canvassRequestId] = 0;
      return quotationResponseList;
    })
  );
  const formattedQuotationRequestList =
    quotationRequestList as unknown as (RequestResponseTableRow & {
      request_response_field: { field_name: string };
    })[][];

  const canvassData: CanvassType = {};
  const lowestPricePerItem: CanvassLowestPriceType = {};
  const requestAdditionalCharge: CanvassLowestPriceType = {};
  let lowestAdditionalCharge = 999999999;

  itemOptions.forEach((item) => {
    canvassData[item] = [];
    lowestPricePerItem[item] = 999999999;
  });

  formattedQuotationRequestList.forEach((request) => {
    let currentItem = "";
    let tempAdditionalCharge = 0;

    request.forEach((response) => {
      if (response.request_response_field.field_name === "Item") {
        currentItem = JSON.parse(response.request_response);
        canvassData[currentItem].push({
          quotationId: response.request_response_request_id,
          price: 0,
          quantity: 0,
        });
      } else if (
        response.request_response_field.field_name === "Price per Unit"
      ) {
        const price = Number(response.request_response);
        canvassData[currentItem][canvassData[currentItem].length - 1].price =
          price;
        if (price < lowestPricePerItem[currentItem]) {
          lowestPricePerItem[currentItem] = price;
        }
        summaryData[response.request_response_request_id] += price;
      } else if (response.request_response_field.field_name === "Quantity") {
        canvassData[currentItem][canvassData[currentItem].length - 1].quantity =
          Number(response.request_response);
      } else if (
        additionalChargeFields.includes(
          response.request_response_field.field_name
        )
      ) {
        const price = Number(response.request_response);
        summaryData[response.request_response_request_id] += price;
        tempAdditionalCharge += price;
      }
    });

    requestAdditionalCharge[request[0].request_response_request_id] =
      tempAdditionalCharge;
    if (tempAdditionalCharge < lowestAdditionalCharge) {
      lowestAdditionalCharge = tempAdditionalCharge;
    }
  });

  const sortedQuotation: Record<string, number> = Object.entries(summaryData)
    .sort(([, a], [, b]) => a - b)
    .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
  const recommendedQuotationId = Object.keys(sortedQuotation)[0];

  return {
    canvassData,
    lowestPricePerItem,
    summaryData,
    lowestQuotation: {
      id: recommendedQuotationId,
      value: sortedQuotation[recommendedQuotationId],
    },
    requestAdditionalCharge,
    lowestAdditionalCharge,
  };
};

export const getRequestStatusMonthlyCount = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    formId: string;
    teamId: string;
    startDate: string;
    endDate: string;
  }
) => {
  const { formId, teamId, startDate, endDate } = params;

  const getMonthlyCount = async (startOfMonth: string, endOfMonth: string) => {
    const getCount = (status: string) =>
      supabaseClient
        .from("request_table")
        .select(
          `request_team_member: request_team_member_id!inner(team_member_team_id)`,
          { count: "exact", head: true }
        )
        .eq("request_is_disabled", false)
        .eq("request_form_id", formId)
        .eq("request_team_member.team_member_team_id", teamId)
        .eq("request_status", status)
        .gte("request_date_created", startOfMonth)
        .lte("request_date_created", endOfMonth);

    const { count: pendingCount } = await getCount("PENDING");
    const { count: approvedCount } = await getCount("APPROVED");
    const { count: rejectedCount } = await getCount("REJECTED");

    const statusData = {
      pending: pendingCount || 0,
      approved: approvedCount || 0,
      rejected: rejectedCount || 0,
    };

    return {
      month: startOfMonth,
      ...statusData,
    };
  };

  // Generate the list of month ranges within the specified date range
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);
  const monthRanges = [];

  while (startDateObj < endDateObj) {
    const startOfMonth = new Date(startDateObj);
    const endOfMonth = new Date(
      startDateObj.getFullYear(),
      startDateObj.getMonth() + 1,
      0
    );
    monthRanges.push({
      start_of_month: startOfMonth.toISOString(),
      end_of_month: endOfMonth.toISOString(),
    });
    startDateObj.setMonth(startDateObj.getMonth() + 1);
  }

  const monthlyData = await Promise.all(
    monthRanges.map(async (range) => {
      return getMonthlyCount(range.start_of_month, range.end_of_month);
    })
  );

  const { count: totalCount } = await supabaseClient
    .from("request_table")
    .select(
      `request_team_member: request_team_member_id!inner(team_member_team_id)`,
      { count: "exact", head: true }
    )
    .eq("request_is_disabled", false)
    .eq("request_form_id", formId)
    .eq("request_team_member.team_member_team_id", teamId)
    .gte("request_date_created", startDate)
    .lte("request_date_created", endDate);

  return {
    data: monthlyData,
    totalCount: totalCount,
  };
};

// Get supplier
export const getSupplier = async (
  supabaseClient: SupabaseClient<Database>,
  params: { supplier: string; teamId: string; fieldId: string }
) => {
  const { supplier, teamId, fieldId } = params;
  const { data, error } = await supabaseClient
    .from("supplier_table")
    .select("supplier_name")
    .eq("supplier_team_id", teamId)
    .ilike("supplier_name", `%${supplier}%`)
    .order("supplier_name", { ascending: true })
    .limit(500);
  if (error) throw error;

  const supplierList = data.map((supplier, index) => {
    return {
      option_description: null,
      option_field_id: fieldId,
      option_id: uuidv4(),
      option_order: index + 1,
      option_value: supplier.supplier_name,
    };
  });

  return supplierList;
};
