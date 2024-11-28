import { FilterChartValues } from "@/components/AnalyticsPage/Analytics";
import { ResultType } from "@/components/ItemAnalyticsPage/ItemAnalyticsPage";
import { ItemOrderType } from "@/components/ItemFormPage/ItemList/ItemList";
import { MemoFormatFormValues } from "@/components/MemoFormatEditor/MemoFormatEditor";
import { TeamAdminType } from "@/components/TeamPage/TeamGroup/AdminGroup";
import { TeamApproverType } from "@/components/TeamPage/TeamGroup/ApproverGroup";
import {
    APP_SOURCE_ID,
    DEFAULT_NUMBER_HR_SSOT_ROWS,
    FETCH_OPTION_LIMIT,
    formatDate,
    IT_ASSET_FIELD_ID_LIST,
    ITEM_FIELD_ID_LIST,
    PED_ITEM_FIELD_ID_LIST,
    PRACTICAL_TEST_FIELD_LIST,
    ROW_PER_PAGE,
    TECHNICAL_ASSESSMENT_FIELD_LIST,
} from "@/utils/constant";
import { Database } from "@/utils/database";
import { getFilterConditionFromArray, safeParse } from "@/utils/functions";
import {
    addAmpersandBetweenWords,
    escapeQuotes,
    escapeQuotesForObject,
    parseJSONIfValid,
} from "@/utils/string";
import {
    AddressTableRow,
    ApplicationInformationFilterFormValues,
    ApplicationInformationSpreadsheetData,
    ApplicationListItemType,
    ApproverUnresolvedRequestCountType,
    AppType,
    AttachmentBucketType,
    AttachmentTableRow,
    BackgroundCheckFilterFormValues,
    BackgroundCheckSpreadsheetData,
    BackgroundCheckTableRow,
    BasicEdgeType,
    BasicNodeType,
    ConnectedRequestFormProps,
    CreatePracticalTestFormType,
    CreateTicketFormValues,
    CreateTicketPageOnLoad,
    CSICodeTableRow,
    DashboardRequestorAndSignerType,
    Dataset,
    EquipmentDescriptionTableRow,
    EquipmentPartTableInsert,
    EquipmentPartType,
    EquipmentTableRow,
    FetchRequestListParams,
    FetchUserRequestListParams,
    FieldTableRow,
    FormTableRow,
    FormType,
    FormWithOwnerType,
    FormWithResponseType,
    HRAnalyticsData,
    HRPhoneInterviewFilterFormValues,
    HRPhoneInterviewSpreadsheetData,
    HRPhoneInterviewTableRow,
    HRProjectType,
    HRRecruitmentData,
    InitialFormType,
    InterviewOnlineMeetingTableRow,
    ItemCategoryWithSigner,
    ItemDescriptionFieldWithUoM,
    ItemDescriptionTableRow,
    ItemWithDescriptionAndField,
    ItemWithDescriptionType,
    JiraFormslyItemCategoryWithUserDataType,
    JiraFormslyProjectType,
    JiraItemCategoryDataType,
    JiraOrganizationTableRow,
    JiraProjectDataType,
    JobOfferFilterFormValues,
    JobOfferHistoryType,
    JobOfferSpreadsheetData,
    JobOfferTableRow,
    LRFSpreadsheetData,
    MemoListItemType,
    MemoType,
    ModuleData,
    ModuleFormItem,
    ModuleFormList,
    ModuleListType,
    ModuleRequestList,
    NodeData,
    NodeOption,
    NotificationOnLoad,
    NotificationTableRow,
    OptionTableRow,
    OptionType,
    OtherExpensesTypeTableRow,
    PendingInviteType,
    PracticalTestTableRow,
    PracticalTestType,
    PreferredPositionType,
    QuestionnaireData,
    ReferenceMemoType,
    RequesterPrimarySignerType,
    RequestListItemType,
    RequestListOnLoad,
    RequestTableRow,
    RequestViewRow,
    RequestWithResponseType,
    SCICEmployeeTableRow,
    SectionWithFieldType,
    SidebarPreference,
    SignatureHistoryTableRow,
    SignerRequestSLA,
    SignerWithProfile,
    SSOTOnLoad,
    SSOTType,
    TeamGroupTableRow,
    TeamMemberOnLoad,
    TeamMembershipRequestTableRow,
    TeamMemberTableRow,
    TeamMemberType,
    TeamMemberWithUser,
    TeamMemberWithUserDetails,
    TeamOnLoad,
    TeamProjectTableRow,
    TeamTableRow,
    TeamTeamMembershipRequest,
    TechnicalAssessmentTableRow,
    TechnicalInterviewFilterFormValues,
    TechnicalInterviewSpreadsheetData,
    TechnicalInterviewTableRow,
    TicketListOnLoad,
    TicketListType,
    TicketPageOnLoad,
    TicketStatusType,
    TradeTestFilterFormValues,
    TradeTestSpreadsheetData,
    TradeTestTableRow,
    TransactionTableRow,
    UnformattedRequestListItemRequestSigner,
    UserIssuedItem,
    WorkflowTableParams,
} from "@/utils/types";
import { SupabaseClient } from "@supabase/supabase-js";
import moment from "moment";
import {
    getBarangay,
    getCity,
    getProvince,
    getRegion,
    getTransactionList,
    Database as OneOfficeDatabase,
} from "oneoffice-api";
import { v4 as uuidv4, validate } from "uuid";

const REQUEST_STATUS_LIST = ["PENDING", "APPROVED", "REJECTED"];

export async function getUserSidebarPreference(
  supabaseClient: SupabaseClient<Database>,
  params: { userId: string }
): Promise<SidebarPreference | null> {
  const { userId } = params;

  const { data, error } = await supabaseClient
    .schema("user_schema")
    .from("user_sidebar_preference_table")
    .select("*")
    .eq("user_sidebar_preference_user_id", userId)
    .maybeSingle();
  if (error) {
    throw error;
  }
  return data;
}

export async function getFileUrl(
  supabaseClient: SupabaseClient<Database>,
  params: { path: string; bucket: AttachmentBucketType }
) {
  const { path, bucket } = params;
  const { data, error } = await supabaseClient.storage
    .from(bucket)
    .download(`${path}?id=${uuidv4()}`);
  if (error) throw error;

  const url = URL.createObjectURL(data);
  return url;
}

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

export const getCurrentDateString = async (
  supabaseClient: SupabaseClient<Database>
) => {
  const { data, error } = await supabaseClient
    .rpc("get_current_date")
    .select("*")
    .single();
  if (error) throw error;
  if (!data) throw error;
  return formatDate(data);
};

export const getAllTeamOfUser = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    userId: string;
  }
) => {
  const { userId } = params;
  const { data, error } = await supabaseClient
    .schema("team_schema")
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

export const getUser = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    userId: string;
  }
) => {
  const { userId } = params;
  const { data, error } = await supabaseClient
    .schema("user_schema")
    .from("user_table")
    .select("*")
    .eq("user_is_disabled", false)
    .eq("user_id", userId)
    .single();
  if (error) throw error;
  return data;
};

export const getFormList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    app: string;
    memberId: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_form_list", { input_data: params })
    .select("*");
  if (error) throw error;

  return data;
};

export const getRequestList = async (
  supabaseClient: SupabaseClient<Database>,
  params: FetchRequestListParams
) => {
  const {
    teamId,
    page,
    limit,
    requestor,
    approver,
    status,
    form,
    isAscendingSort,
    search,
    isApproversView,
    teamMemberId,
    project,
    columnAccessor = "request_date_created",
  } = params;

  const sort = isAscendingSort ? "ASC" : "DESC";

  const requestorCondition = getFilterConditionFromArray({
    values: requestor,
    column: "request_view.request_team_member_id",
  });
  const statusCondition = getFilterConditionFromArray({
    values: status,
    column: "request_view.request_status",
  });
  const formCondition = getFilterConditionFromArray({
    values: form,
    column: "request_view.request_form_id",
  });
  const projectCondition = getFilterConditionFromArray({
    values: project,
    column: "request_view.request_formsly_id_prefix",
    operator: "SIMILAR TO",
  });

  const approverList = approver?.map((approver) => `'${approver}'`).join(",");
  const approverCondition = approver
    ? `EXISTS (
        SELECT 1
        FROM request_schema.request_signer_table
        INNER JOIN form_schema.signer_table signer ON signer.signer_id = request_signer_signer_id
        WHERE
            request_signer_request_id = request_view.request_id
            AND signer.signer_team_member_id IN (${approverList})
    )`
    : "";

  const searchCondition = search
    ? validate(search)
      ? `request_view.request_id = '${search}'`
      : `request_view.request_formsly_id ILIKE '%${search}%'`
    : "";

  const inputData = {
    teamId,
    page,
    limit,
    requestor: requestorCondition ? `AND (${requestorCondition})` : "",
    approver: approverCondition ? `AND (${approverCondition})` : "",
    project: projectCondition ? `AND (${projectCondition})` : "",
    form: formCondition ? `AND (${formCondition})` : "",
    status: statusCondition ? `AND (${statusCondition})` : "",
    search: search ? `AND (${searchCondition})` : "",
    sort,
    isApproversView,
    teamMemberId,
    columnAccessor,
  };

  const { data, error } = await supabaseClient.rpc("fetch_request_list", {
    input_data: inputData,
  });

  if (error || !data) throw error;

  const dataFormat = data as unknown as {
    data: (Omit<RequestListItemType, "request_signer"> & {
      request_signer: UnformattedRequestListItemRequestSigner[];
    })[];
    count: number;
  };

  const formattedData: RequestListItemType[] = dataFormat.data.map((item) => {
    const formatted_request_signer = item.request_signer.map((signer) => ({
      request_signer_id: signer.request_signer_id,
      request_signer_status: signer.request_signer_status,
      request_signer: {
        signer_team_member_id: signer.signer_team_member_id,
        signer_is_primary_signer: signer.signer_is_primary_signer,
      },
    }));

    return { ...item, request_signer: formatted_request_signer };
  });

  return { data: formattedData, count: dataFormat.count };
};

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

export const getUserWithSignature = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    userId: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_user_with_signature", { input_data: params })
    .select("*");
  if (error) throw error;
  return data;
};

export const checkUsername = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    username: string;
  }
) => {
  const { username } = params;
  const { data, error } = await supabaseClient
    .schema("user_schema")
    .from("user_table")
    .select("user_username")
    .eq("user_username", username)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
};

export const getTeam = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
  }
) => {
  const { teamId } = params;
  const { data, error } = await supabaseClient
    .schema("team_schema")
    .from("team_table")
    .select("*")
    .eq("team_id", teamId)
    .eq("team_is_disabled", false)
    .maybeSingle();

  if (error) throw error;

  return data;
};

export const getUserTeamMemberData = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    userId: string;
    teamId: string;
  }
) => {
  const { userId, teamId } = params;
  const { data, error } = await supabaseClient
    .schema("team_schema")
    .from("team_member_table")
    .select("*")
    .eq("team_member_user_id", userId)
    .eq("team_member_team_id", teamId)
    .maybeSingle();

  if (error) throw error;

  return data;
};

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
  const { data, error } = await supabaseClient
    .rpc("get_form_list_with_filter", { input_data: params })
    .select("*");
  if (error) throw error;
  const formattedData = data as unknown as {
    data: FormTableRow[];
    count: number;
  };

  return { data: formattedData.data, count: formattedData.count };
};

export const getForm = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    formId: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_form", { input_data: params })
    .select("*");
  if (error) throw error;

  return data as unknown as InitialFormType;
};

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

export const getItemList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    limit: number;
    page: number;
    generalName: string;
    description: string;
    unitOfMeasurement: string;
    glAccount: string;
    division: string;
    status: string;
    sortColumn?: ItemOrderType;
    sortOrder?: string;
    isPedItem?: boolean;
    isITAsset?: boolean;
  }
) => {
  const {
    teamId,
    limit,
    page,
    generalName,
    description,
    unitOfMeasurement,
    glAccount,
    division,
    status,
    sortColumn,
    sortOrder,
    isPedItem,
    isITAsset,
  } = params;

  const start = (page - 1) * limit;

  let query = supabaseClient
    .schema("item_schema")
    .from("item_table")
    .select(
      `
        *,
        item_division_table!inner(*),
        item_description: item_description_table!inner(*),
        item_level_three_description: item_level_three_description_table(*)
      `,
      {
        count: "exact",
      }
    )
    .eq("item_team_id", teamId)
    .eq("item_is_disabled", false)
    .eq("item_description.item_description_is_disabled", false);

  if (generalName) {
    query = query.ilike("item_general_name", `%${generalName}%`);
  }
  if (description) {
    query = query.ilike(
      "item_description.item_description_label",
      `${description}%`
    );
  }
  if (unitOfMeasurement) {
    query = query.eq("item_unit", `${unitOfMeasurement}`);
  }
  if (glAccount) {
    query = query.eq("item_gl_account", `${glAccount}`);
  }
  if (division) {
    query = query.eq("item_division_table.item_division_value", `${division}`);
  }
  if (status) {
    switch (status) {
      case "active":
        query = query.eq("item_is_available", true);
        break;
      case "inactive":
        query = query.eq("item_is_available", false);
        break;
    }
  }
  if (isPedItem !== undefined) {
    query = query.eq("item_is_ped_item ", isPedItem);
  }

  if (isITAsset !== undefined) {
    query = query.eq("item_is_it_asset_item ", isITAsset);
  }

  if (sortColumn) {
    query.order(sortColumn, {
      ascending: sortOrder === "asc",
    });
  } else {
    query.order("item_general_name", {
      ascending: true,
    });
  }

  query.order("item_description_order", {
    foreignTable: "item_description",
    ascending: true,
  });
  query.order("item_division_value", {
    foreignTable: "item_division_table",
    ascending: true,
  });
  query.limit(limit);
  query.range(start, start + limit - 1);
  query.maybeSingle;

  const { data, error, count } = await query;
  if (error) throw error;

  const formattedData = data as unknown as (ItemWithDescriptionType & {
    item_division_table: { item_division_value: string }[];
    item_level_three_description: { item_level_three_description: string }[];
  })[];

  return {
    data: formattedData.map((data) => {
      return {
        ...data,
        item_division_id_list: data.item_division_table.map(
          (division: { item_division_value: string }) =>
            division.item_division_value
        ),
        item_level_three_description:
          data.item_level_three_description.length !== 0
            ? data.item_level_three_description[0].item_level_three_description
            : "",
      };
    }),
    count,
  };
};

export const getAllItems = async (
  supabaseClient: SupabaseClient<Database>,
  params: { teamId: string }
) => {
  const { teamId } = params;
  const { data, error } = await supabaseClient
    .schema("item_schema")
    .from("item_table")
    .select("item_general_name")
    .eq("item_team_id", teamId)
    .eq("item_is_disabled", false)
    .eq("item_is_available", true)
    .order("item_general_name", { ascending: true });
  if (error) throw error;

  return data;
};

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
    .schema("item_schema")
    .from("item_description_field_table")
    .select(
      "*, item_description_field_uom: item_description_field_uom_table(item_description_field_uom)",
      {
        count: "exact",
      }
    )
    .eq("item_description_field_item_description_id", descriptionId)
    .eq("item_description_field_is_disabled", false);

  if (search) {
    query = query.ilike("item_description_field_value", `%${search}%`);
  }

  query.order("item_description_field_value", { ascending: true });
  query.limit(limit);
  query.range(start, start + limit - 1);
  query.maybeSingle;

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: data as ItemDescriptionFieldWithUoM[],
    count,
  };
};

export const getItem = async (
  supabaseClient: SupabaseClient<Database>,
  params: { teamId: string; itemName: string }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_item", { input_data: params })
    .select("*");
  if (error) throw error;

  return data as unknown as ItemWithDescriptionAndField;
};

export const checkItemFormStatus = async (
  supabaseClient: SupabaseClient<Database>,
  params: { teamId: string; formId: string }
) => {
  const { teamId, formId } = params;

  const { data, error } = await supabaseClient
    .rpc("check_item_form_status", {
      form_id: formId,
      team_id: teamId,
    })
    .select("*")
    .single();
  if (error) throw error;

  return data === "true" ? true : (data as string);
};

export const checkItemName = async (
  supabaseClient: SupabaseClient<Database>,
  params: { itemName: string; teamId: string }
) => {
  const { itemName, teamId } = params;

  const { count, error } = await supabaseClient
    .schema("item_schema")
    .from("item_table")
    .select("*", { count: "exact", head: true })
    .eq("item_general_name", itemName)
    .eq("item_is_disabled", false)
    .eq("item_team_id", teamId);
  if (error) throw error;

  return Boolean(count);
};

export const checkItemDescription = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    itemDescription: string;
    itemDescriptionUom: string;
    descriptionId: string;
  }
) => {
  const { itemDescription, itemDescriptionUom, descriptionId } = params;

  let query = supabaseClient
    .schema("item_schema")
    .from("item_description_field_table")
    .select(
      `*${
        itemDescriptionUom
          ? ",item_description_field_uom: item_description_field_uom_table!inner(item_description_field_uom) "
          : ""
      }`,
      {
        count: "exact",
        head: true,
      }
    )
    .eq("item_description_field_value", itemDescription)
    .eq("item_description_field_is_disabled", false)
    .eq("item_description_field_item_description_id", descriptionId);

  if (itemDescriptionUom) {
    query = query.eq(
      "item_description_field_uom.item_description_field_uom",
      itemDescriptionUom
    );
  }

  const { count, error } = await query;
  if (error) throw error;

  return Boolean(count);
};

export const getTeamMemberList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    search?: string;
    offset?: number;
    limit?: number;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_team_member_list", { input_data: params })
    .select("*");
  if (error) throw error;

  return data as unknown as TeamMemberType[];
};

export const getInvitation = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    invitationId: string;
    userEmail: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_invitation", { input_data: params })
    .select("*");
  if (error) throw error;
  return data;
};

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

export const getResponseDataByKeyword = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    keyword: string;
    formId: string;
  }
) => {
  const { keyword, formId } = params;
  const { data, error } = await supabaseClient
    .schema("request_schema")
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

export const checkIfOwnerOrAdmin = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    userId: string;
    teamId: string;
  }
) => {
  const { userId, teamId } = params;
  const { data, error } = await supabaseClient
    .schema("team_schema")
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

export const getRequestStatusCount = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    formId: string;
    teamId: string;
    startDate: string;
    endDate: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_request_status_count", {
      input_data: { ...params, requestStatusList: REQUEST_STATUS_LIST },
    })
    .select("*");
  if (error) throw error;

  const formattedData = data as unknown as {
    data: { label: string; value: number }[];
    totalCount: number;
  };

  return {
    requestStatusCountData: formattedData.data,
    totalCount: formattedData.totalCount,
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

  // Generate the list of month ranges within the specified date range
  // Generate the list of month ranges within the specified date range
  const startDateObj = moment(startDate);
  const endDateObj = moment(endDate).endOf("month");

  const monthRanges = [];
  while (startDateObj.isSameOrBefore(endDateObj, "month")) {
    const startOfMonth = startDateObj.clone().startOf("month");
    const endOfMonth = startDateObj.clone().endOf("month");

    monthRanges.push({
      start_of_month: startOfMonth.format(),
      end_of_month: endOfMonth.isSameOrBefore(endDateObj)
        ? endOfMonth.format()
        : endDateObj.format(),
    });

    startDateObj.add(1, "month");
  }

  const { data: monthlyData, error: monthlyError } = await supabaseClient
    .rpc("get_request_status_monthly_count", {
      input_data: {
        formId,
        teamId,
        monthRanges,
      },
    })
    .select("*");
  if (monthlyError) throw monthlyError;

  const { data: totalCount, error: totalError } = await supabaseClient
    .rpc("get_request_total_count", {
      input_data: {
        formId,
        teamId,
        startDate,
        endDate,
      },
    })
    .select("*");
  if (totalError) throw totalError;

  return {
    data: monthlyData as unknown as {
      month: string;
      pending: number;
      approved: number;
      rejected: number;
    }[],
    totalCount: Number(totalCount),
  };
};

export const getTeamMemberOnLoad = async (
  supabaseClient: SupabaseClient<Database>,
  params: { teamMemberId: string }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_team_member_on_load", { input_data: params })
    .select("*");
  if (error) throw error;

  return data as unknown as TeamMemberOnLoad;
};

export const getTeamGroupList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    search?: string;
    page: number;
    limit: number;
  }
) => {
  const { teamId, search = "", page, limit } = params;
  const start = (page - 1) * limit;

  let query = supabaseClient
    .schema("team_schema")
    .from("team_group_table")
    .select("*", { count: "exact" })
    .eq("team_group_team_id", teamId)
    .eq("team_group_is_disabled", false);

  if (search) {
    query = query.ilike("team_group_name", `%${search}%`);
  }

  query = query.order("team_group_name", { ascending: true });
  query.limit(limit);
  query.range(start, start + limit - 1);

  const { data, count, error } = await query;
  if (error) throw error;

  return { data, count };
};

export const getTeamProjectList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    search?: string;
    page: number;
    limit: number;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_team_project_list", { input_data: params })
    .select("*");

  if (error) throw error;

  const formattedData = data as unknown as {
    data: (TeamProjectTableRow & {
      team_project_address: AddressTableRow;
    } & {
      team_project_site_map_attachment: { attachment_value: string | null };
    } & {
      team_project_boq_attachment: { attachment_value: string | null };
    })[];
    count: number;
  };

  return {
    data: formattedData.data,
    count: formattedData.count,
  };
};

export const checkIfTeamGroupExists = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    groupName: string;
    teamId: string;
  }
) => {
  const { groupName, teamId } = params;

  const { count, error } = await supabaseClient
    .schema("team_schema")
    .from("team_group_table")
    .select("*", { count: "exact", head: true })
    .eq("team_group_name", groupName)
    .eq("team_group_team_id", teamId)
    .eq("team_group_is_disabled", false);
  if (error) throw error;

  return Boolean(count);
};

export const checkIfTeamProjectExists = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    projectName: string;
    teamId: string;
  }
) => {
  const { projectName, teamId } = params;

  const { count, error } = await supabaseClient
    .schema("team_schema")
    .from("team_project_table")
    .select("*", { count: "exact", head: true })
    .eq("team_project_name", projectName)
    .eq("team_project_team_id", teamId)
    .eq("team_project_is_disabled", false);
  if (error) throw error;

  return Boolean(count);
};

export const getTeamGroupMemberList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    groupId: string;
    search?: string;
    page: number;
    limit: number;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_team_group_member_list", { input_data: params })
    .select("*");
  if (error) throw error;

  const formattedData = data as unknown as {
    data: TeamMemberType[];
    count: number;
  };

  return {
    data: formattedData.data,
    count: formattedData.count,
  };
};

export const getAllTeamMembersWithoutGroupMembers = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    groupId: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_all_team_members_without_group_members", { input_data: params })
    .select("*");

  if (error) throw error;

  return data as TeamMemberWithUserDetails;
};

export const getTeamProjectMemberList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    projectId: string;
    search?: string;
    page: number;
    limit: number;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_team_project_member_list", { input_data: params })
    .select("*");
  if (error) throw error;

  const formattedData = data as unknown as {
    data: TeamMemberType[];
    count: number;
  };

  return {
    data: formattedData.data,
    count: formattedData.count,
  };
};

export const getAllTeamMembersWithoutProjectMembers = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    projectId: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_all_team_members_without_project_members", { input_data: params })
    .select("*");

  if (error) throw error;

  return data as TeamMemberWithUserDetails;
};

export const getTeamMemberProjectList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamMemberId: string;
    search?: string;
    offset: number;
    limit: number;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_team_member_project_list", { input_data: params })
    .select("*");
  if (error) throw error;
  const formattedData = data as unknown as {
    projectList: {
      team_project_member_id: string;
      team_project: TeamProjectTableRow;
    }[];
    projectCount: number;
  };

  return {
    data: formattedData.projectList.sort((a, b) =>
      a.team_project.team_project_name < b.team_project.team_project_name
        ? -1
        : a.team_project.team_project_name > b.team_project.team_project_name
          ? 1
          : 0
    ),
    count: formattedData.projectCount,
  };
};

export const getTeamMemberGroupList = async (
  supabaseClient: SupabaseClient<Database>,
  params: { teamMemberId: string; search?: string; page: number; limit: number }
) => {
  const { teamMemberId, search, page, limit } = params;

  const start = (page - 1) * limit;

  let query = supabaseClient
    .schema("team_schema")
    .from("team_group_member_table")
    .select("team_group_member_id, team_group: team_group_id!inner(*)", {
      count: "exact",
    })
    .eq("team_member_id", teamMemberId);

  if (search) {
    query = query.ilike("team_group.team_group_name", `%${search}%`);
  }

  query = query.order("team_group_name", {
    ascending: true,
    foreignTable: "team_group",
  });
  query.limit(limit);
  query.range(start, start + limit - 1);

  const { data, count, error } = await query;
  if (error) throw error;

  return {
    data,
    count,
  };
};

export const getAllTeamGroups = async (
  supabaseClient: SupabaseClient<Database>,
  params: { teamId: string }
) => {
  const { teamId } = params;

  const { data, error } = await supabaseClient
    .schema("team_schema")
    .from("team_group_table")
    .select("*")
    .eq("team_group_team_id", teamId)
    .eq("team_group_is_disabled", false);
  if (error) throw error;

  return data;
};

export const checkIfTeamGroupMember = async (
  supabaseClient: SupabaseClient<Database>,
  params: { teamMemberId: string; groupId: string[] }
) => {
  const { teamMemberId, groupId } = params;

  const { count, error } = await supabaseClient
    .schema("team_schema")
    .from("team_group_member_table")
    .select("*", { count: "exact", head: true })
    .in("team_group_id", groupId)
    .eq("team_member_id", teamMemberId);
  if (error) throw error;

  return Boolean(count);
};

export const getAllTeamProjects = async (
  supabaseClient: SupabaseClient<Database>,
  params: { teamId: string }
) => {
  const { teamId } = params;

  const { data, error } = await supabaseClient
    .schema("team_schema")
    .from("team_project_table")
    .select("*")
    .eq("team_project_team_id", teamId)
    .eq("team_project_is_disabled", false);
  if (error) throw error;

  return data;
};

export const getTeamInvitation = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    status: string;
    page: number;
    limit: number;
    search?: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_team_invitation", { input_data: params })
    .select("*");
  if (error) throw error;
  const formattedData = data as unknown as {
    data: PendingInviteType[];
    count: number;
  };

  return { data: formattedData.data, count: formattedData.count };
};

export const getRequestFormslyId = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    requestId: string;
  }
) => {
  const isUUID = validate(params.requestId);
  let query = supabaseClient.from("request_view").select("request_formsly_id");

  if (isUUID) {
    query = query.eq("request_id", params.requestId);
  } else {
    query.eq("request_formsly_id", params.requestId);
  }
  query.limit(1);

  const { data, error } = await query;

  if (error) throw error;

  return data[0] ? data[0].request_formsly_id : null;
};

export const getProjectSigner = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    projectId: string;
    formId: string;
  }
) => {
  const { projectId, formId } = params;
  const { data, error } = await supabaseClient
    .schema("form_schema")
    .from("signer_table")
    .select("*")
    .eq("signer_team_project_id", projectId)
    .eq("signer_form_id", formId)
    .is("signer_team_department_id", null)
    .eq("signer_is_disabled", false);

  if (error) throw error;

  return data;
};

export const getProjectSignerWithTeamMember = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    projectId: string;
    formId: string;
    departmentId?: string;
    requesterTeamMemberId: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_project_signer_with_team_member", { input_data: params })
    .select("*");
  if (error) throw error;
  return data as unknown as FormType["form_signer"];
};

export const getCSICode = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    csiCode: string;
  }
) => {
  const { csiCode } = params;
  const { data, error } = await supabaseClient
    .schema("lookup_schema")
    .from("csi_code_table")
    .select("*")
    .eq("csi_code_level_three_description", csiCode);
  if (error) throw error;

  return data[0] as CSICodeTableRow;
};

export const getItemDivisionOption = async (
  supabaseClient: SupabaseClient<Database>
) => {
  const { data, error } = await supabaseClient
    .from("distinct_division_view")
    .select("csi_code_division_id, csi_code_division_description")
    .order("csi_code_division_id", { ascending: true });
  if (error) throw error;

  return data;
};

export const getItemUnitOfMeasurementOption = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
  }
) => {
  const { teamId } = params;
  const { data, error } = await supabaseClient
    .schema("unit_of_measurement_schema")
    .from("item_unit_of_measurement_table")
    .select("item_unit_of_measurement_id, item_unit_of_measurement")
    .eq("item_unit_of_measurement_is_available", true)
    .eq("item_unit_of_measurement_is_disabled", false)
    .eq("item_unit_of_measurement_team_id", teamId)
    .order("item_unit_of_measurement", { ascending: true });
  if (error) throw error;

  return data;
};

export const getTeamApproverListWithFilter = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    search?: string;
    page: number;
    limit: number;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_team_approver_list_with_filter", { input_data: params })
    .select("*");
  if (error) throw error;

  const formattedData = data as unknown as {
    data: TeamApproverType[];
    count: number;
  };

  return {
    data: formattedData.data,
    count: formattedData.count,
  };
};

export const getTeamAdminListWithFilter = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    search?: string;
    page: number;
    limit: number;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_team_admin_list_with_filter", { input_data: params })
    .select("*");
  if (error) throw error;

  const formattedData = data as unknown as {
    data: TeamAdminType[];
    count: number;
  };

  return {
    data: formattedData.data,
    count: formattedData.count,
  };
};

export const getTeamMembersWithMemberRole = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_team_members_with_member_role", { input_data: params })
    .select("*");
  if (error) throw error;

  return data;
};

export const getMemberUserData = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamMemberId: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_member_user_data", { input_data: params })
    .select("*");
  if (error) throw error;

  if (data) {
    const commentTeamMember = data[0];
    return commentTeamMember as unknown as RequestWithResponseType["request_comment"][0]["comment_team_member"];
  } else {
    return null;
  }
};

export const getTeamOnLoad = async (
  supabaseClient: SupabaseClient<Database>,
  params: { userId: string; teamMemberLimit: number }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_team_on_load", { input_data: params })
    .select("*");
  if (error) throw error;

  return data as unknown as TeamOnLoad;
};

export const getNotificationOnLoad = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    userId: string;
    app: AppType;
    page: number;
    limit: number;
    unreadOnly: boolean;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_notification_on_load", { input_data: params })
    .select("*");
  if (error) throw error;

  return data as unknown as NotificationOnLoad;
};

export const getSSOTOnLoad = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    userId: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_ssot_on_load", { input_data: params })
    .select("*");
  if (error) throw error;

  return data as unknown as SSOTOnLoad;
};

export const getRequestListOnLoad = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    userId: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_request_list_on_load", { input_data: params })
    .select("*");

  if (error) throw error;

  return data as unknown as RequestListOnLoad;
};

export const getInvitationId = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    userEmail: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_invitation_id", { input_data: params })
    .select("*");
  if (error) throw error;

  return data;
};

export const getUserPendingInvitation = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    userEmail: string;
  }
) => {
  const { userEmail } = params;

  const { data, error } = await supabaseClient
    .schema("user_schema")
    .from("invitation_table")
    .select("*")
    .eq("invitation_is_disabled", false)
    .eq("invitation_to_email", userEmail)
    .eq("invitation_status", "PENDING")
    .maybeSingle();
  if (error) throw error;

  return data;
};

export const getCommentAttachment = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    commentId: string;
  }
) => {
  const { commentId } = params;

  const { data, error } = await supabaseClient
    .from("attachment_table")
    .select("*")
    .like("attachment_value", `%${commentId}%`)
    .eq("attachment_is_disabled", false);

  if (error) throw error;

  const getAttachmentUrls = async (data: AttachmentTableRow[]) => {
    const attachmentUrls = await Promise.all(
      data.map(async (attachment) => {
        const attachment_public_url = supabaseClient.storage
          .from(attachment.attachment_bucket)
          .getPublicUrl(`${attachment.attachment_value}`).data.publicUrl;

        return { ...attachment, attachment_public_url };
      })
    );

    return attachmentUrls;
  };

  if (data) {
    const attachmentUrl = await getAttachmentUrls(data);
    return attachmentUrl;
  } else {
    return [];
  }
};

export const checkIfJiraIDIsUnique = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    value: string;
  }
) => {
  const { value } = params;

  const { count, error } = await supabaseClient
    .schema("request_schema")
    .from("request_table")
    .select("*", {
      count: "exact",
    })
    .eq("request_status", "APPROVED")
    .eq("request_jira_id", value);

  if (error) throw error;

  return Boolean(count);
};

export const checkIfOtpIdIsUnique = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    value: string;
  }
) => {
  const { value } = params;

  const { count, error } = await supabaseClient
    .schema("request_schema")
    .from("request_table")
    .select("*", {
      count: "exact",
    })
    .eq("request_status", "APPROVED")
    .eq("request_otp_id", value);

  if (error) throw error;

  return Boolean(count);
};

export const getCreateTicketOnLoad = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    userId: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_create_ticket_on_load", {
      input_data: params,
    })
    .select()
    .single();

  if (error) throw error;
  return data as CreateTicketPageOnLoad;
};

export const getTicketOnLoad = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    ticketId: string;
    userId: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_ticket_on_load", {
      input_data: params,
    })
    .select()
    .single();

  if (error) throw error;
  return data as TicketPageOnLoad;
};

export const getTicketList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    page: number;
    limit: number;
    requester?: string[];
    approver?: string[];
    status?: TicketStatusType[];
    category?: string[];
    sort?: "ascending" | "descending";
    search?: string;
    columnAccessor?: string;
  }
) => {
  const {
    teamId,
    page,
    limit,
    requester,
    approver,
    status,
    category,
    sort = "descending",
    search = "",
    columnAccessor = "ticket_date_created",
  } = params;

  const requesterCondition = requester
    ?.map(
      (value) => `ticket_table.ticket_requester_team_member_id = '${value}'`
    )
    .join(" OR ");
  const approverCondition = approver
    ?.map((value) => `ticket_table.ticket_approver_team_member_id = '${value}'`)
    .join(" OR ");
  const statusCondition = status
    ?.map((value) => `ticket_table.ticket_status = '${value}'`)
    .join(" OR ");
  const categoryCondition = category
    ?.map((value) => `ticket_table.ticket_category_id = '${value}'`)
    .join(" OR ");

  const searchCondition =
    search && search?.length > 0 && validate(search)
      ? `ticket_table.ticket_id = '${search}'`
      : `ticket_table.ticket_id::text LIKE '${search}%'`;

  const { data, error } = await supabaseClient.rpc("fetch_ticket_list", {
    input_data: {
      teamId: teamId,
      page: page,
      limit: limit,
      requester: requesterCondition ? `AND (${requesterCondition})` : "",
      approver: approverCondition ? `AND (${approverCondition})` : "",
      category: categoryCondition ? `AND (${categoryCondition})` : "",
      status: statusCondition ? `AND (${statusCondition})` : "",
      search: searchCondition ? `AND (${searchCondition})` : "",
      sort: sort === "descending" ? "DESC" : "ASC",
      columnAccessor,
    },
  });

  if (error) throw error;
  const dataFormat = data as unknown as {
    data: TicketListType;
    count: number;
  };

  return { data: dataFormat.data, count: dataFormat.count };
};

export const getTicketListOnLoad = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    userId: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_ticket_list_on_load", { input_data: params })
    .select("*");
  if (error) throw error;
  return data as unknown as TicketListOnLoad;
};

export const getApproverRequestCount = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamMemberId: string;
    status: string;
    withJiraId?: boolean;
  }
) => {
  const { data, error } = await supabaseClient.rpc(
    "get_approver_request_count",
    { input_data: params }
  );
  if (error) throw error;

  return Number(data);
};

export const getApproverUnresolvedRequestCount = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamMemberId: string;
  }
) => {
  const { teamMemberId } = params;
  const { data, error } = await supabaseClient.rpc(
    "get_approver_unresolved_request_count",
    { input_data: { teamMemberId } }
  );
  if (error) throw error;
  return data as ApproverUnresolvedRequestCountType;
};

export const getEditRequestOnLoad = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    userId: string;
    requestId: string;
    referenceOnly: boolean;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_edit_request_on_load", { input_data: params })
    .select("*");
  if (error) throw error;

  return data;
};

export const getAllGroupOfTeamMember = async (
  supabaseClient: SupabaseClient<Database>,
  params: { teamMemberId: string }
) => {
  const { teamMemberId } = params;

  const { data, error } = await supabaseClient
    .schema("team_schema")
    .from("team_group_member_table")
    .select(
      "team_group: team_group_id(team_group_name, team_group_is_disabled)"
    )
    .eq("team_member_id", teamMemberId)
    .eq("team_group.team_group_is_disabled", false);

  if (error) throw error;
  const formattedData = data as unknown as {
    team_group: { team_group_name: string };
  }[];

  return formattedData.map((group) => group.team_group.team_group_name);
};

export const checkIfTeamNameExists = async (
  supabaseClient: SupabaseClient<Database>,
  params: { teamName: string }
) => {
  const { teamName } = params;

  const { count, error } = await supabaseClient
    .schema("team_schema")
    .from("team_table")
    .select("*", { count: "exact" })
    .ilike("team_name", teamName);

  if (error) throw error;

  return Boolean(count);
};

export const getEquipmentList = async (
  supabaseClient: SupabaseClient<Database>,
  params: { teamId: string; limit: number; page: number; search?: string }
) => {
  const { teamId, search, limit, page } = params;

  const start = (page - 1) * limit;

  let query = supabaseClient
    .schema("equipment_schema")
    .from("equipment_table")
    .select(
      "*, equipment_category: equipment_equipment_category_id(equipment_category)",
      {
        count: "exact",
      }
    )
    .eq("equipment_team_id", teamId)
    .eq("equipment_is_disabled", false);

  if (search) {
    query = query.ilike("equipment_name", `%${search}%`);
  }

  query.order("equipment_name", { ascending: true });
  query.limit(limit);
  query.range(start, start + limit - 1);
  query.maybeSingle;

  const { data, error, count } = await query;
  if (error) throw error;

  const formattedData = data as unknown as EquipmentTableRow &
    { equipment_category: { equipment_category: string } }[];

  return {
    data: formattedData.map((equipment) => {
      return {
        ...equipment,
        equipment_category: equipment.equipment_category.equipment_category,
      };
    }),
    count,
  };
};

export const checkEquipmentName = async (
  supabaseClient: SupabaseClient<Database>,
  params: { equipmentName: string; teamId: string }
) => {
  const { equipmentName, teamId } = params;

  const { count, error } = await supabaseClient
    .schema("equipment_schema")
    .from("equipment_table")
    .select("*", { count: "exact", head: true })
    .eq("equipment_name", equipmentName)
    .eq("equipment_is_disabled", false)
    .eq("equipment_team_id", teamId);
  if (error) throw error;

  return Boolean(count);
};

export const getEquipmentCategoryOption = async (
  supabaseClient: SupabaseClient<Database>,
  params: { teamId: string }
) => {
  const { teamId } = params;
  const { data, error } = await supabaseClient
    .schema("equipment_schema")
    .from("equipment_category_table")
    .select("*")
    .eq("equipment_category_team_id", teamId)
    .eq("equipment_category_is_available", true)
    .eq("equipment_category_is_disabled", false)
    .order("equipment_category", { ascending: true });
  if (error) throw error;

  return data;
};

export const getEquipmentDescriptionList = async (
  supabaseClient: SupabaseClient<Database>,
  params: { equipmentId: string; limit: number; page: number; search?: string }
) => {
  const { equipmentId, search, limit, page } = params;

  const start = (page - 1) * limit;

  let query = supabaseClient
    .schema("equipment_schema")
    .from("equipment_description_view")
    .select(
      `
        *,
        equipment_description_brand: equipment_description_brand_id(equipment_brand),
        equipment_description_model: equipment_description_model_id(equipment_model)
      `,
      {
        count: "exact",
      }
    )
    .eq("equipment_description_equipment_id", equipmentId)
    .eq("equipment_description_is_disabled", false)
    .eq("equipment_description_brand.equipment_brand_is_disabled", false)
    .eq("equipment_description_model.equipment_model_is_disabled", false);

  if (search) {
    query = query.or(
      `equipment_description_property_number_with_prefix.ilike.%${search}%, equipment_description_serial_number.ilike.%${search}%`
    );
  }

  query.order("equipment_description_property_number_with_prefix", {
    ascending: true,
  });
  query.limit(limit);
  query.range(start, start + limit - 1);
  query.maybeSingle;

  const { data, error, count } = await query;

  if (error) throw error;

  const formattedData = data as unknown as (ItemDescriptionTableRow & {
    equipment_description_brand: { equipment_brand: string };
    equipment_description_model: { equipment_model: string };
  })[];

  return {
    data: formattedData.map((description) => {
      return {
        ...description,
        equipment_description_brand: description.equipment_description_brand
          ? description.equipment_description_brand.equipment_brand
          : "",
        equipment_description_model: description.equipment_description_model
          ? description.equipment_description_model.equipment_model
          : "",
      };
    }),
    count,
  };
};

export const getEquipmentBrandAndModelOption = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
  }
) => {
  const { teamId } = params;
  const { data: brandList, error: brandError } = await supabaseClient
    .schema("equipment_schema")
    .from("equipment_brand_table")
    .select("*")
    .eq("equipment_brand_team_id", teamId)
    .eq("equipment_brand_is_disabled", false)
    .eq("equipment_brand_is_available", true)
    .order("equipment_brand", { ascending: true });
  if (brandError) throw brandError;

  const { data: modelList, error: modelError } = await supabaseClient
    .schema("equipment_schema")
    .from("equipment_model_table")
    .select("*")
    .eq("equipment_model_team_id", teamId)
    .eq("equipment_model_is_disabled", false)
    .eq("equipment_model_is_available", true)
    .order("equipment_model", { ascending: true });
  if (modelError) throw modelError;

  return {
    brandList,
    modelList,
  };
};

export const getEquipmentNameOption = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    index: number;
    teamId: string;
  }
) => {
  const { index, teamId } = params;
  const { data: nameList, error: nameError } = await supabaseClient
    .schema("equipment_schema")
    .from("equipment_general_name_table")
    .select("*")
    .eq("equipment_general_name_team_id", teamId)
    .eq("equipment_general_name_is_disabled", false)
    .eq("equipment_general_name_is_available", true)
    .range(index, index + 1000)
    .order("equipment_general_name", { ascending: true });
  if (nameError) throw nameError;

  return {
    nameList,
  };
};

export const checkPropertyNumber = async (
  supabaseClient: SupabaseClient<Database>,
  params: { propertyNumber: string; teamId: string }
) => {
  const { propertyNumber, teamId } = params;

  const { count, error } = await supabaseClient
    .schema("equipment_schema")
    .from("equipment_description_view")
    .select(
      "*, equipment_description_equipment: equipment_description_equipment_id(*)",
      { count: "exact", head: true }
    )
    .in("equipment_description_property_number_with_prefix", [
      propertyNumber,
      `REN-${propertyNumber}`,
    ])
    .eq("equipment_description_is_disabled", false)
    .eq("equipment_description_equipment.equipment_team_id", teamId);
  if (error) throw error;

  return Boolean(count);
};

export const getEquipmentPartList = async (
  supabaseClient: SupabaseClient<Database>,
  params: { equipmentId: string; limit: number; page: number; search?: string }
) => {
  const { data, error } = await supabaseClient.rpc("get_equipment_part_list", {
    input_data: params,
  });

  if (error) throw error;

  const formattedData = data as {
    data: EquipmentPartType[];
    count: number;
  };
  return {
    data: formattedData.data,
    count: formattedData.count,
  };
};

export const getEquipmentUOMAndCategoryOption = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
  }
) => {
  const { teamId } = params;
  const { data: uomList, error: uomListError } = await supabaseClient
    .schema("unit_of_measurement_schema")
    .from("equipment_unit_of_measurement_table")
    .select("*")
    .eq("equipment_unit_of_measurement_team_id", teamId)
    .eq("equipment_unit_of_measurement_is_available", true)
    .eq("equipment_unit_of_measurement_is_disabled", false)
    .order("equipment_unit_of_measurement", { ascending: true });
  if (uomListError) throw uomListError;

  const { data: categoryList, error: categoryError } = await supabaseClient
    .schema("equipment_schema")
    .from("equipment_component_category_table")
    .select("*")
    .eq("equipment_component_category_team_id", teamId)
    .eq("equipment_component_category_is_available", true)
    .eq("equipment_component_category_is_disabled", false)
    .order("equipment_component_category", { ascending: true });
  if (categoryError) throw categoryError;

  return {
    uomList,
    categoryList,
  };
};

export const checkPEDPart = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    equipmentPartData: EquipmentPartTableInsert;
  }
) => {
  const { equipmentPartData } = params;
  const { data, error } = await supabaseClient
    .rpc("check_ped_part", { input_data: equipmentPartData })
    .select("*");
  if (error) throw error;
  return data;
};

export const checkEquipmentLookupTable = async (
  supabaseClient: SupabaseClient,
  params: { lookupTableName: string; value: string; teamId: string }
) => {
  const { lookupTableName, value, teamId } = params;
  const { count, error } = await supabaseClient
    .from(`${lookupTableName}_table`)
    .select("*", { count: "exact", head: true })
    .eq(`${lookupTableName}`, value)
    .eq(`${lookupTableName}_is_disabled`, false)
    .eq(`${lookupTableName}_team_id`, teamId);
  if (error) throw error;

  return Boolean(count);
};

export const checkIfEmailsOnboarded = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    emailList: string[];
  }
) => {
  const { emailList } = params;
  const { data, error } = await supabaseClient
    .schema("user_schema")
    .from("user_table")
    .select("user_email")
    .in("user_email", emailList);
  if (error) throw error;

  return emailList.map((email) => ({
    email: email,
    onboarded: data.map((userData) => userData.user_email).includes(email),
  }));
};

export const getRequestTeamId = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    requestId: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_request_team_id", { input_data: params })
    .select("*");
  if (error) throw error;

  return data.length ? (data as unknown as string) : null;
};

export const getLookupList = async (
  supabaseClient: SupabaseClient,
  params: {
    lookup: string;
    teamId: string;
    limit: number;
    page: number;
    search?: string;
    schema: string;
  }
) => {
  const { lookup, teamId, search, limit, page, schema } = params;

  const start = (page - 1) * limit;

  let query = supabaseClient
    .schema(schema)
    .from(`${lookup}_table`)
    .select("*", { count: "exact" })
    .eq(`${lookup}_team_id`, teamId)
    .eq(`${lookup}_is_disabled`, false);

  if (search) {
    query = query.ilike(`${lookup}`, `%${search}%`);
  }

  query.order(`${lookup}`, { ascending: true, foreignTable: "" });
  query.limit(limit);
  query.range(start, start + limit - 1);
  query.maybeSingle;

  const { data, error, count } = await query;
  if (error) throw error;

  const id = `${lookup}_id`;
  const value = lookup;
  const status = `${lookup}_is_available`;

  const formattedData = data as unknown as {
    [key: string]: string;
  }[];

  return {
    data: formattedData.map((lookupData) => {
      return {
        id: lookupData[id],
        status: Boolean(lookupData[status]),
        value: lookupData[value],
      };
    }),
    count,
  };
};

export const checkLookupTable = async (
  supabaseClient: SupabaseClient,
  params: { lookupTableName: string; value: string; teamId: string }
) => {
  const { lookupTableName, value, teamId } = params;
  const { count, error } = await supabaseClient
    .from(`${lookupTableName}_table`)
    .select("*", { count: "exact", head: true })
    .eq(`${lookupTableName}`, value)
    .eq(`${lookupTableName}_is_disabled`, false)
    .eq(`${lookupTableName}_team_id`, teamId);
  if (error) throw error;

  return Boolean(count);
};

export const getUserIssuedItemList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamMemberId: string;
    startDate: string;
    endDate: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("analyze_user_issued_item", { input_data: params })
    .select("*");
  if (error) throw error;

  return data as unknown as { data: UserIssuedItem[]; raw: UserIssuedItem[] };
};

export const getTeamMemoSignerList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc("get_memo_signer_list", {
    input_data: params,
  });
  if (error) throw error;

  const dataWithType = data as unknown as {
    team_member_id: string;
    team_member_user: {
      user_id: string;
      user_first_name: string;
      user_last_name: string | null;
      user_job_title: string | null;
      user_avatar: string;
      signature_list: SignatureHistoryTableRow[];
    };
  }[];

  const formattedData = dataWithType.map((signer) => {
    const signatureList = signer.team_member_user.signature_list ?? [];
    const defaultSignature = signatureList[signatureList.length - 1];

    return {
      ...signer,
      signer_signature_public_url: defaultSignature
        ? defaultSignature.signature_history_value
        : "",
    };
  });
  return formattedData;
};

export const getMemo = async (
  supabaseClient: SupabaseClient<Database>,
  params: { memo_id: string; current_user_id: string; team_id: string }
) => {
  const { data, error } = await supabaseClient.rpc("get_memo_on_load", {
    input_data: params,
  });

  if (error || !data) throw Error;

  return data as MemoType;
};

export const getMemoList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    page: number;
    limit: number;
    authorFilter?: string[];
    approverFilter?: string[];
    status?: string[];
    sort?: "ascending" | "descending";
    searchFilter?: string;
    columnAccessor?: string;
  }
) => {
  const {
    teamId,
    page,
    limit,
    authorFilter,
    approverFilter,
    status,
    sort = "descending",
    searchFilter,
    columnAccessor = "memo_table.memo_date_created",
  } = params;

  const authorFilterCondition = authorFilter
    ?.map(
      (authorUserId) => `memo_table.memo_author_user_id = '${authorUserId}'`
    )
    .join(" OR ");

  const approverFilterCondition = approverFilter
    ?.map(
      (approverTeamMemberId) =>
        `memo_signer_table.memo_signer_team_member_id = '${approverTeamMemberId}'`
    )
    .join(" OR ");

  const statusCondition = status
    ?.map((status) => `memo_status = '${status}'`)
    .join(" OR ");

  const { data, error } = await supabaseClient.rpc("get_memo_list", {
    input_data: {
      teamId,
      page,
      limit,
      sort: sort === "descending" ? "DESC" : "ASC",
      authorFilter: authorFilterCondition
        ? `AND (${authorFilterCondition})`
        : "",
      approverFilter: approverFilterCondition
        ? `AND (${approverFilterCondition})`
        : "",
      status: statusCondition ? `AND (${statusCondition})` : "",
      searchFilter: searchFilter ? addAmpersandBetweenWords(searchFilter) : "",
      columnAccessor,
    },
  });
  if (error) throw error;

  return data as { data: MemoListItemType[]; count: number };
};

export const getReferenceMemo = async (
  supabaseClient: SupabaseClient<Database>,
  params: { memo_id: string; current_user_id: string }
) => {
  const { data, error } = await supabaseClient.rpc(
    "get_memo_reference_on_load",
    {
      input_data: params,
    }
  );
  if (error || !data) throw Error;

  return data as unknown as ReferenceMemoType;
};

export const getMemoFormat = async (
  supabaseClient: SupabaseClient<Database>
) => {
  const { data, error } = await supabaseClient
    .schema("memo_schema")
    .from("memo_format_section_table")
    .select(
      "*, format_subsection: memo_format_subsection_table(*, subsection_attachment: memo_format_attachment_table(*))"
    );
  if (error || !data) throw Error;

  const sectionOrderList = ["header", "body", "footer"];
  const sortedData = data.sort((a, b) => {
    const aIndex = sectionOrderList.findIndex(
      (section) => section === a.memo_format_section_name
    );
    const bIndex = sectionOrderList.findIndex(
      (section) => section === b.memo_format_section_name
    );

    return aIndex - bIndex;
  });

  const sortedDataWithType =
    sortedData as MemoFormatFormValues["formatSection"];

  const sortedDataWithAttachmentFile = await Promise.all(
    sortedDataWithType.map(async (section) => {
      const updatedSubsectionList = await Promise.all(
        section.format_subsection.map(async (subsection) => {
          const updatedAttachmentList = await Promise.all(
            subsection.subsection_attachment.map(async (attachment) => {
              try {
                const attachmentFileResponse = await fetch(
                  `${attachment.memo_format_attachment_url}`
                );

                if (!attachmentFileResponse.ok) {
                  throw new Error(
                    `Failed to fetch attachment for ${attachment.memo_format_attachment_name}`
                  );
                }

                const blob = await attachmentFileResponse.blob();
                const newAttachmentFile = new File(
                  [blob],
                  attachment.memo_format_attachment_name,
                  { type: blob.type }
                );

                return {
                  ...attachment,
                  memo_format_attachment_file: newAttachmentFile,
                };
              } catch (e) {
                return attachment;
              }
            })
          );

          return {
            ...subsection,
            subsection_attachment: updatedAttachmentList,
          };
        })
      );

      return {
        ...section,
        format_subsection: updatedSubsectionList,
      };
    })
  );
  return sortedDataWithAttachmentFile;
};

export const getTypeList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    limit: number;
    page: number;
    search?: string;
  }
) => {
  const { teamId, search, limit, page } = params;

  const start = (page - 1) * limit;

  let query = supabaseClient
    .schema("other_expenses_schema")
    .from(`other_expenses_type_table`)
    .select(
      `
        *,
        other_expenses_type_category: other_expenses_type_category_id!inner(
          other_expenses_category
        )
      `,
      { count: "exact" }
    )
    .eq("other_expenses_type_category.other_expenses_category_team_id", teamId)
    .eq(
      "other_expenses_type_category.other_expenses_category_is_disabled",
      false
    )
    .eq("other_expenses_type_is_disabled", false);

  if (search) {
    query = query.ilike("other_expenses_type", `%${search}%`);
  }

  query.order("other_expenses_type");
  query.limit(limit);
  query.range(start, start + limit - 1);
  query.maybeSingle;

  const { data, error, count } = await query;
  if (error) throw error;

  const formattedData = data as unknown as (OtherExpensesTypeTableRow & {
    other_expenses_type_category: { other_expenses_category: string };
  })[];

  return {
    data: formattedData.map((type) => {
      return {
        ...type,
        other_expenses_category:
          type.other_expenses_type_category.other_expenses_category,
      };
    }),
    count,
  };
};

export const checkOtherExpenesesTypeTable = async (
  supabaseClient: SupabaseClient<Database>,
  params: { value: string; categoryId: string }
) => {
  const { value, categoryId } = params;
  const { count, error } = await supabaseClient
    .schema("other_expenses_schema")
    .from("other_expenses_type_table")
    .select("*", { count: "exact", head: true })
    .eq("other_expenses_type", value)
    .eq("other_expenses_type_is_disabled", false)
    .eq("other_expenses_type_category_id", categoryId);
  if (error) throw error;

  return Boolean(count);
};

export const getOtherExpensesCategoryOptions = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
  }
) => {
  const { teamId } = params;
  const { data, error } = await supabaseClient
    .schema("other_expenses_schema")
    .from("other_expenses_category_table")
    .select("*")
    .eq("other_expenses_category_team_id", teamId)
    .eq("other_expenses_category_is_disabled", false)
    .eq("other_expenses_category_is_available", true)
    .order("other_expenses_category", { ascending: true });
  if (error) throw error;
  return data;
};

export const getTypeOptions = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    categoryId: string;
  }
) => {
  const { categoryId } = params;
  const { data, error } = await supabaseClient
    .schema("other_expenses_schema")
    .from("other_expenses_type_table")
    .select("*")
    .eq("other_expenses_type_category_id", categoryId)
    .eq("other_expenses_type_is_available", true)
    .eq("other_expenses_type_is_disabled", false)
    .order("other_expenses_type", { ascending: true });
  if (error) throw error;
  return data;
};

export const getUserSignatureList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    userId: string;
  }
) => {
  const { userId } = params;
  const { data, error } = await supabaseClient
    .schema("history_schema")
    .from("signature_history_table")
    .select("*")
    .eq("signature_history_user_id", userId);

  if (error) throw error;
  return data;
};

export const getUserValidID = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    validId: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_user_valid_id", { input_data: params })
    .select("*");
  if (error) throw error;

  return data;
};

export const getCSIDescriptionOptionBasedOnDivisionId = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    divisionId: string[];
  }
) => {
  const { divisionId } = params;
  const { data, error } = await supabaseClient
    .schema("lookup_schema")
    .from("csi_code_table")
    .select("csi_code_level_three_description, csi_code_division_id")
    .in("csi_code_division_id", divisionId)
    .order("csi_code_level_three_description", { ascending: true });
  if (error) throw error;
  return data;
};

export const getQueryData = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    queryId: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_query_data", { input_data: params })
    .select("*");
  if (error) throw error;

  const queryFetchedData = data as unknown as { queryData: string };
  return queryFetchedData.queryData;
};

export const getQueryList = async (
  supabaseClient: SupabaseClient<Database>
) => {
  const { data, error } = await supabaseClient
    .schema("lookup_schema")
    .from("query_table")
    .select("*");
  if (error) throw error;
  return data;
};

export const getSignerSLA = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    formId: string;
    projectId: string;
    singerId: string;
    status: string;
    page: number;
    limit: number;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_signer_sla", { input_data: params })
    .select("*");
  if (error) throw error;

  return data as unknown as {
    signerRequestSLA: SignerRequestSLA[];
    slaHours: number;
    signerRequestSLACount: number;
  };
};

export const getFormSLA = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    formId: string;
    teamId: string;
  }
) => {
  const { formId, teamId } = params;

  const { data, error } = await supabaseClient
    .schema("form_schema")
    .from("form_sla_table")
    .select("*")
    .eq("form_sla_form_id", formId)
    .eq("form_sla_team_id", teamId)
    .single();
  if (error) throw error;
  return data;
};

export const getTeamFormSLAList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    search?: string;
    page: number;
    limit: number;
  }
) => {
  const { teamId, page, limit, search } = params;
  const start = (page - 1) * limit;

  let query = supabaseClient
    .schema("form_schema")
    .from("form_sla_table")
    .select("*, form_table!inner(*)", { count: "exact" })
    .eq("form_sla_team_id", teamId);

  if (search) {
    query = query.ilike("form_table.form_name", `%${search}%`);
  }

  query.order("form_sla_date_updated", { ascending: true });
  query.limit(limit);
  query.range(start, start + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  return { data, count };
};

export const getFormProjectIDs = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    formId: string;
  }
) => {
  const { formId } = params;
  const { data, error } = await supabaseClient
    .schema("form_schema")
    .from("signer_table")
    .select("signer_team_project_id")
    .eq("signer_form_id", formId)
    .eq("signer_is_disabled", false);
  if (error) throw error;

  const stringArray = data.map((signer) => signer.signer_team_project_id);
  const filteredData = stringArray.filter(Boolean);
  return filteredData as string[];
};

export const getProjectByID = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    projectIdList: string[];
  }
) => {
  const { projectIdList } = params;

  const { data, error } = await supabaseClient
    .schema("team_schema")
    .from("team_project_table")
    .select("*")
    .in("team_project_id", projectIdList);
  if (error) throw error;

  return data;
};

export const getSignerWithProfile = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    formId: string;
    projectId: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_signer_with_profile", { input_data: params })
    .select("*");
  if (error) throw error;

  return data as SignerWithProfile[];
};

export const getTicketCategoryList = async (
  supabaseClient: SupabaseClient<Database>
) => {
  const { data, error } = await supabaseClient
    .schema("ticket_schema")
    .from("ticket_category_table")
    .select("*")
    .eq("ticket_category_is_disabled", false)
    .eq("ticket_category_is_active", true);
  if (error) throw error;

  return data;
};

export const getTicketForm = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    category: string;
    teamId: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_ticket_form", { input_data: params })
    .select("*");
  if (error) throw error;

  return data as unknown as CreateTicketFormValues;
};

export const checkCSICodeDescriptionExists = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    csiCodeDescription: string;
  }
) => {
  const { csiCodeDescription } = params;
  const { data, error } = await supabaseClient
    .schema("lookup_schema")
    .from("csi_code_table")
    .select("csi_code_level_three_description")
    .ilike("csi_code_level_three_description", csiCodeDescription)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
};

export const checkCSICodeItemExists = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    divisionId: string;
    itemId: string;
  }
) => {
  const { divisionId, itemId } = params;
  const { data, error } = await supabaseClient
    .schema("item_schema")
    .from("item_division_table")
    .select("*")
    .eq("item_division_value", divisionId)
    .eq("item_division_item_id", itemId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
};

export const getMemberUser = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamMemberId: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_member_user", { input_data: params })
    .select("*");
  if (error) throw error;

  return data as unknown as TeamMemberWithUser;
};

export const getIncidentReport = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    reporteeId: string;
    interval: string;
    year: string;
    month: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_incident_report", { input_data: params })
    .select("*");
  if (error) throw error;
  const returnData = data as unknown as {
    interval: string;
    year: string;
    month: string;
    data: string;
  };

  return {
    interval: returnData.interval,
    month: returnData.month,
    year: returnData.year,
    data: parseJSONIfValid(returnData.data) as {
      date: string;
      report_count: number;
    }[],
  };
};

export const checkCustomCSICodeValidity = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    csiCode: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("check_custom_csi_validity", { input_data: params })
    .select("*");
  if (error) throw error;

  return data as unknown as {
    csiCodeDivisionIdExists: boolean;
    csiCodeLevelTwoMajorGroupIdExists: boolean;
    csiCodeLevelTwoMinorGroupIdExists: boolean;
    csiCodeLevelThreeIdExists: boolean;
  };
};

export const getEquipmentName = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    category: string;
  }
) => {
  const { category } = params;
  const { data, error } = await supabaseClient
    .schema("equipment_schema")
    .from("equipment_table")
    .select("*")
    .eq("equipment_is_disabled", false)
    .eq("equipment_is_available", true)
    .eq("equipment_equipment_category_id", category);
  if (error) throw error;

  return data;
};

export const getEquipmentDescription = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    propertyNumber: string;
  }
) => {
  const { propertyNumber } = params;
  const { data, error } = await supabaseClient
    .schema("equipment_schema")
    .from("equipment_description_view")
    .select(
      "*, equipment_description_brand: equipment_description_brand_id(equipment_brand), equipment_description_model: equipment_description_model_id(equipment_model)"
    )
    .eq("equipment_description_is_disabled", false)
    .eq("equipment_description_is_available", true)
    .eq("equipment_description_brand.equipment_brand_is_disabled", false)
    .eq("equipment_description_model.equipment_model_is_disabled", false)
    .eq("equipment_description_property_number_with_prefix", propertyNumber)
    .single();
  if (error) throw error;

  type ReturnDataType = EquipmentDescriptionTableRow & {
    equipment_description_brand: { equipment_brand: string };
  } & {
    equipment_description_model: { equipment_model: string };
  };

  const formattedData = data as unknown as ReturnDataType;

  return {
    ...data,
    equipment_description_brand: {
      equipment_brand: formattedData.equipment_description_brand
        ? formattedData.equipment_description_brand.equipment_brand
        : "",
    },
    equipment_description_model: {
      equipment_model: formattedData.equipment_description_model
        ? formattedData.equipment_description_model.equipment_model
        : "",
    },
  } as unknown as ReturnDataType;
};

export const getItemSectionChoices = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    equipmentId?: string;
    generalName?: string;
    componentCategory?: string;
    brand?: string;
    model?: string;
  }
) => {
  const { equipmentId, generalName, componentCategory, brand, model } = params;

  let index = 0;
  const optionList: JSON[] = [];
  while (1) {
    const { data, error } = await supabaseClient.rpc(
      "get_item_section_choices",
      {
        input_data: {
          equipmentId: equipmentId
            ? `${safeParse(escapeQuotes(equipmentId))}`
            : undefined,
          generalName: generalName
            ? `${safeParse(escapeQuotes(generalName))}`
            : undefined,
          componentCategory: componentCategory
            ? `${safeParse(escapeQuotes(componentCategory))}`
            : undefined,
          brand: brand ? `${safeParse(escapeQuotes(brand))}` : undefined,
          model: model ? `${safeParse(escapeQuotes(model))}` : undefined,
          index,
          limit: FETCH_OPTION_LIMIT,
        },
      }
    );
    if (error) throw error;
    const formattedData = data as unknown as JSON[];
    optionList.push(...formattedData);
    if (formattedData.length < FETCH_OPTION_LIMIT) break;
    index += FETCH_OPTION_LIMIT;
  }

  return optionList;
};

export const getItemUnitOfMeasurement = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    generalName: string;
    componentCategory: string;
    brand: string;
    model: string;
    partNumber: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_item_unit_of_measurement", {
      input_data: escapeQuotesForObject(params),
    })
    .select("*");
  if (error) throw error;

  return data;
};

export const getEquipmentSectionChoices = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    category: string;
    equipmentName: string;
    brand?: string;
  }
) => {
  const { category, equipmentName, brand } = params;
  let query = supabaseClient
    .schema("equipment_schema")
    .from("equipment_table")
    .select(
      `
        equipment_id,
        equipment_equipment_category: equipment_equipment_category_id!inner(equipment_category),
        equipment_name,
        equipment_description:
          equipment_description_table!inner(
            equipment_description_brand: equipment_description_brand_id(
              equipment_brand
            )
            ${
              brand
                ? `, equipment_description_model: equipment_description_model_id(
                equipment_model
              )`
                : ""
            }
          )
      `
    )
    .eq("equipment_is_disabled", false)
    .eq("equipment_is_available", true)
    .eq("equipment_equipment_category.equipment_category", category)
    .eq("equipment_name", equipmentName);

  if (brand) {
    query = query.eq(
      "equipment_description.equipment_description_brand.equipment_brand_is_disabled",
      false
    );
    query = query.eq(
      "equipment_description.equipment_description_brand.equipment_brand_is_available",
      true
    );
    query = query.eq(
      "equipment_description.equipment_description_brand.equipment_brand",
      brand
    );
  }

  const { data, error } = await query;
  if (error) throw error;

  const tempList: string[] = [];
  if (!brand) {
    const formattedData = data[0] as unknown as {
      equipment_id: string;
      equipment_description?: {
        equipment_description_brand: {
          equipment_brand: string;
        };
      }[];
      equipment_name: string;
    };
    if (!formattedData?.equipment_description) return [];

    return formattedData.equipment_description.filter((value) => {
      if (
        !tempList.includes(value.equipment_description_brand.equipment_brand)
      ) {
        tempList.push(value.equipment_description_brand.equipment_brand);
        return value;
      }
    });
  } else {
    const formattedData = data[0] as unknown as {
      equipment_id: string;
      equipment_description?: {
        equipment_description_model: {
          equipment_model: string;
        };
      }[];
      equipment_name: string;
    };
    if (!formattedData?.equipment_description) return [];

    return formattedData.equipment_description.filter((value) => {
      if (
        !tempList.includes(value.equipment_description_model.equipment_model)
      ) {
        tempList.push(value.equipment_description_model.equipment_model);
        return value;
      }
    });
  }
};

export const pedPartCheck = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    equipmentName: string;
    partName: string;
    partNumber: string;
    brand: string;
    model: string;
    unitOfMeasure: string;
    category: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc("ped_part_check", {
    input_data: escapeQuotesForObject(params),
  });
  if (error) throw error;
  return data;
};

export const fetchRegion = async (
  supabaseClient: SupabaseClient<OneOfficeDatabase["address_schema"]>
) => {
  const { data, error } = await getRegion({ supabaseClient: supabaseClient });
  if (error) throw error;
  return data;
};

export const fetchProvince = async (
  supabaseClient: SupabaseClient<OneOfficeDatabase["address_schema"]>,
  params: { regionId: string }
) => {
  const { regionId } = params;

  const { data, error } = await getProvince({
    supabaseClient,
    regionId,
  });
  if (error) throw error;
  return data;
};

export const fetchCity = async (
  supabaseClient: SupabaseClient<OneOfficeDatabase["address_schema"]>,
  params: { provinceId: string }
) => {
  const { provinceId } = params;

  const { data, error } = await getCity({
    supabaseClient: supabaseClient,
    provinceId,
  });
  if (error) throw error;
  return data;
};

export const fetchBarangay = async (
  supabaseClient: SupabaseClient<OneOfficeDatabase["address_schema"]>,
  params: { cityId: string }
) => {
  const { cityId } = params;

  const { data, error } = await getBarangay({
    supabaseClient: supabaseClient,
    cityId,
  });
  if (error) throw error;
  return data;
};

export const getSectionInRequestPage = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    index: number;
    requestId: string;
    sectionId: string;
    fieldData?: RequestWithResponseType["request_form"]["form_section"][0]["section_field"];
    duplicatableSectionIdCondition: string;
    withOption?: boolean;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("fetch_request_page_section", { input_data: params })
    .select("*");
  if (error) throw error;
  return data as RequestWithResponseType["request_form"]["form_section"][0]["section_field"];
};

export const getRequestComment = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    request_id: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("fetch_request_comment", { request_id: params.request_id })
    .select("*");
  if (error) throw error;
  return data;
};

export const getItemOptions = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    index: number;
    limit: number;
  }
) => {
  const { teamId, index, limit } = params;
  const { data, error } = await supabaseClient
    .schema("item_schema")
    .from("item_table")
    .select("item_id, item_general_name")
    .eq("item_team_id", teamId)
    .eq("item_is_disabled", false)
    .eq("item_is_available", true)
    .order("item_general_name")
    .limit(limit)
    .range(index, index + limit - 1);
  if (error) throw error;

  return data;
};

export const getSupplierOptions = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    index: number;
    limit: number;
  }
) => {
  const { teamId, index, limit } = params;
  const { data, error } = await supabaseClient
    .schema("team_schema")
    .from("supplier_table")
    .select("supplier_id, supplier")
    .eq("supplier_team_id", teamId)
    .order("supplier")
    .limit(limit)
    .range(index, index + limit - 1);
  if (error) throw error;

  return data;
};

export const getPedItemOptions = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    index: number;
    limit: number;
  }
) => {
  const { teamId, index, limit } = params;
  const { data, error } = await supabaseClient
    .schema("item_schema")
    .from("item_table")
    .select("item_id, item_general_name")
    .eq("item_team_id", teamId)
    .eq("item_is_disabled", false)
    .eq("item_is_available", true)
    .eq("item_is_ped_item", true)
    .order("item_general_name")
    .limit(limit)
    .range(index, index + limit - 1);
  if (error) throw error;

  return data;
};

export const getPropertyNumberOptions = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    index: number;
    limit: number;
    equipmentId?: string;
    isWithAcquisitionDate?: boolean;
  }
) => {
  const { teamId, index, limit, equipmentId, isWithAcquisitionDate } = params;
  let query = supabaseClient
    .schema("equipment_schema")
    .from("equipment_description_view")
    .select(
      `
        equipment_description_id,
        equipment_description_property_number_with_prefix,
        equipment_description_equipment: equipment_description_equipment_id!inner(
          equipment_team_id
        )
      `
    )
    .eq("equipment_description_equipment.equipment_team_id", teamId)
    .eq("equipment_description_is_disabled", false)
    .eq("equipment_description_is_available", true)
    .order("equipment_description_property_number_with_prefix");

  if (equipmentId) {
    query.eq("equipment_description_equipment_id", equipmentId);
  }
  if (isWithAcquisitionDate) {
    query.not("equipment_description_acquisition_date", "is", null);
  }

  query = query.limit(limit);
  query = query.range(index, index + limit - 1);

  const { data, error } = await query;
  if (error) throw error;

  return data as unknown as {
    equipment_description_id: string;
    equipment_description_property_number_with_prefix: string;
  }[];
};

export const getAllProjects = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
  }
) => {
  const { teamId } = params;
  const { data, error } = await supabaseClient
    .schema("team_schema")
    .from("team_project_table")
    .select("team_project_id, team_project_name")
    .eq("team_project_is_disabled", false)
    .eq("team_project_team_id", teamId);
  if (error) throw error;

  return data;
};

export const getAllGroups = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
  }
) => {
  const { teamId } = params;
  const { data, error } = await supabaseClient
    .schema("team_schema")
    .from("team_group_table")
    .select("team_group_id, team_group_name")
    .eq("team_group_is_disabled", false)
    .eq("team_group_team_id", teamId);
  if (error) throw error;

  return data;
};

export const getJiraProjectList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    from: number;
    to: number;
    search?: string;
  }
) => {
  const { from, to, search } = params;
  let query = supabaseClient
    .schema("jira_schema")
    .from("jira_project_table")
    .select("*", { count: "exact" })
    .order("jira_project_jira_label")
    .range(from, to);

  if (search) {
    query = query.ilike("jira_project_jira_label", `%${search}%`);
  }

  const { data, count, error } = await query;
  if (error) throw error;

  return { data, count: Number(count) };
};

export const getJiraFormslyProjectList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    page: number;
    limit: number;
    search?: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc(
    "get_jira_formsly_project_list",
    {
      input_data: params,
    }
  );
  if (error) throw error;

  const formattedData = data as unknown as {
    data: JiraFormslyProjectType[];
    count: number;
  };

  return { data: formattedData.data, count: Number(formattedData.count) };
};

export const getJiraUserAccountList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    from: number;
    to: number;
    search?: string;
  }
) => {
  const { from, to, search } = params;
  let query = supabaseClient
    .schema("jira_schema")
    .from("jira_user_account_table")
    .select("*", {
      count: "exact",
    })
    .order("jira_user_account_display_name")
    .range(from, to);

  if (search) {
    query = query.ilike("jira_user_account_display_name", `%${search}%`);
  }

  const { data, count, error } = await query;

  if (error) throw error;

  return {
    data,
    count: Number(count),
  };
};

export const getProjectJiraUserAccountList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    from: number;
    to: number;
    search?: string;
    teamProjectId: string;
  }
) => {
  const { from, to, search, teamProjectId } = params;
  let query = supabaseClient
    .schema("jira_schema")
    .from("jira_project_user_table")
    .select("*", { count: "exact" })
    .eq("jira_project_user_team_project_id", teamProjectId)
    .range(from, to);

  if (search) {
    query = query.ilike("team_project_name", `%${search}%`);
  }

  const { data, count, error } = await query;

  if (error) throw error;

  return {
    data,
    count: Number(count),
  };
};

export const getJiraUserRoleList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    from: number;
    to: number;
  }
) => {
  const { from, to } = params;
  const query = supabaseClient
    .schema("jira_schema")
    .from("jira_user_role_table")
    .select("*")
    .order("jira_user_role_label")
    .range(from, to);

  const { data, error } = await query;

  if (error) throw error;

  return data;
};

export const getJiraItemCategoryList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    from: number;
    to: number;
    search?: string;
  }
) => {
  const { from, to, search } = params;
  let query = supabaseClient
    .schema("jira_schema")
    .from("jira_item_category_table")
    .select(
      "*, assigned_jira_user: jira_item_user_table(jira_item_user_id, jira_item_user_account_id(jira_user_account_jira_id, jira_user_account_display_name, jira_user_account_id), jira_item_user_role_id(jira_user_role_id, jira_user_role_label))",
      { count: "exact" }
    )
    .order("jira_item_category_formsly_label")
    .range(from, to);

  if (search) {
    query = query.or(
      `jira_item_category_jira_label.ilike.%${search}%, jira_item_category_formsly_label.ilike.%${search}%`
    );
  }

  const { data, count, error } = await query;

  if (error) throw error;

  const formattedData = data.map((item) => {
    const assignedUser = item.assigned_jira_user as unknown as {
      jira_item_user_id: string;
      jira_item_user_account_id: {
        jira_user_account_jira_id: string;
        jira_user_account_display_name: string;
        jira_user_account_id: string;
      };
      jira_item_user_role_id: {
        jira_user_role_id: string;
        jira_user_role_label: string;
      };
    }[];

    return {
      ...item,
      assigned_jira_user: {
        ...assignedUser[0],
        ...assignedUser[0]?.jira_item_user_account_id,
        ...assignedUser[0]?.jira_item_user_role_id,
      },
    };
  });

  return {
    data: formattedData as unknown as JiraFormslyItemCategoryWithUserDataType[],
    count: Number(count),
  };
};

export const getJiraAutomationDataByProjectId = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamProjectId: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc("get_jira_automation_data", {
    input_data: params,
  });

  if (error) {
    console.warn("Failed to fetch jira automation data");
    return null;
  }

  return data as {
    jiraProjectData: JiraProjectDataType;
    jiraItemCategoryData: JiraItemCategoryDataType[];
    jiraOrganizationData: {
      jira_organization_team_project_project_id: string;
    } & JiraOrganizationTableRow;
  };
};

export const getUserCurrentSignature = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    userId: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_user_current_signature", { input_data: params })
    .select("*");
  if (error) throw error;

  const formattedData = data as unknown as {
    user_signature_attachment: {
      attachment_value: string;
      attachment_bucket: string;
    };
  };

  return formattedData
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${formattedData.user_signature_attachment.attachment_bucket}/${formattedData.user_signature_attachment.attachment_value}`
    : "";
};

export const getNonDuplictableSectionResponse = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    fieldIdList: string[];
    requestId: string;
  }
) => {
  const { fieldIdList, requestId } = params;
  const { data, error } = await supabaseClient
    .schema("request_schema")
    .from("request_response_table")
    .select(
      "request_response_field_id, request_response, request_response_prefix"
    )
    .in("request_response_field_id", fieldIdList)
    .eq("request_response_request_id", requestId);

  if (error) throw error;
  return data;
};

export const getItemRequestConditionalOptions = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    sectionList: {
      itemName: string;
      fieldIdList: string[];
    }[];
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("fetch_item_request_conditional_options", { input_data: params })
    .select("*");
  if (error) throw error;
  return data;
};

export const getServiceCategoryOptions = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    index: number;
    limit: number;
  }
) => {
  const { teamId, index, limit } = params;
  const { data, error } = await supabaseClient
    .schema("service_schema")
    .from("service_category_table")
    .select("service_category_id, service_category")
    .eq("service_category_team_id", teamId)
    .eq("service_category_is_disabled", false)
    .eq("service_category_is_available", true)
    .order("service_category")
    .limit(limit)
    .range(index, index + limit - 1);
  if (error) throw error;

  return data;
};

export const getGeneralUnitOfMeasurementOptions = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    index: number;
    limit: number;
  }
) => {
  const { teamId, index, limit } = params;
  const { data, error } = await supabaseClient
    .schema("unit_of_measurement_schema")
    .from("general_unit_of_measurement_table")
    .select("general_unit_of_measurement_id, general_unit_of_measurement")
    .eq("general_unit_of_measurement_team_id", teamId)
    .eq("general_unit_of_measurement_is_disabled", false)
    .eq("general_unit_of_measurement_is_available", true)
    .order("general_unit_of_measurement")
    .limit(limit)
    .range(index, index + limit - 1);
  if (error) throw error;

  return data;
};

export const getOtherExpensesCategoryOptionsWithLimit = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    index: number;
    limit: number;
  }
) => {
  const { teamId, index, limit } = params;
  const { data, error } = await supabaseClient
    .schema("other_expenses_schema")
    .from("other_expenses_category_table")
    .select("other_expenses_category_id, other_expenses_category")
    .eq("other_expenses_category_team_id", teamId)
    .eq("other_expenses_category_is_disabled", false)
    .eq("other_expenses_category_is_available", true)
    .order("other_expenses_category")
    .limit(limit)
    .range(index, index + limit - 1);
  if (error) throw error;

  return data;
};

export const getPEDEquipmentCategoryOptions = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    index: number;
    limit: number;
  }
) => {
  const { teamId, index, limit } = params;
  const { data, error } = await supabaseClient
    .schema("equipment_schema")
    .from("equipment_category_table")
    .select("equipment_category_id, equipment_category")
    .eq("equipment_category_team_id", teamId)
    .eq("equipment_category_is_disabled", false)
    .eq("equipment_category_is_available", true)
    .order("equipment_category")
    .limit(limit)
    .range(index, index + limit - 1);
  if (error) throw error;

  return data;
};

export const getCapacityUnitOfMeasurementOptions = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    index: number;
    limit: number;
  }
) => {
  const { teamId, index, limit } = params;
  const { data, error } = await supabaseClient
    .schema("unit_of_measurement_schema")
    .from("capacity_unit_of_measurement_table")
    .select("capacity_unit_of_measurement_id, capacity_unit_of_measurement")
    .eq("capacity_unit_of_measurement_team_id", teamId)
    .eq("capacity_unit_of_measurement_is_disabled", false)
    .eq("capacity_unit_of_measurement_is_available", true)
    .order("capacity_unit_of_measurement")
    .limit(limit)
    .range(index, index + limit - 1);
  if (error) throw error;

  return data;
};

export const getPEDEquipmentRequestConditionalOptions = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    sectionList: {
      category: string;
      equipmentName: string;
      brand: string;
      fieldIdList: string[];
    }[];
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("fetch_ped_equipment_request_conditional_options", {
      input_data: params,
    })
    .select("*");
  if (error) throw error;
  return data;
};

export const getItemCategoryOption = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    formId: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_item_category_option", { input_data: params })
    .select("*");
  if (error) throw error;

  return data as unknown as {
    item_category: string;
    item_category_id: string;
  }[];
};

export const getItemFormApprover = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_item_form_approver", { input_data: params })
    .select("*");
  if (error) throw error;

  return data;
};

export const checkItemCategory = async (
  supabaseClient: SupabaseClient<Database>,
  params: { category: string }
) => {
  const { category } = params;

  const { count, error } = await supabaseClient
    .schema("item_schema")
    .from("item_category_table")
    .select("*", { count: "exact", head: true })
    .eq("item_category", category)
    .eq("item_category_is_disabled", false);
  if (error) throw error;

  return Boolean(count);
};

export const getItemCategoryList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    formId: string;
    limit: number;
    page: number;
    search?: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_item_category_list", { input_data: params })
    .select("*");
  if (error) throw error;

  const formattedData = data as unknown as {
    data: ItemCategoryWithSigner[];
    count: number;
  };

  return {
    data: formattedData.data,
    count: formattedData.count,
  };
};

export const getFormSection = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    formId: string;
    formName: string;
  }
) => {
  const { formId, formName } = params;
  let query = supabaseClient
    .schema("form_schema")
    .from("section_table")
    .select(
      `
        *,
        section_field:
        field_table(
          *,
          field_option: option_table(*)
        )
      `
    )
    .eq("section_form_id", formId);

  switch (formName) {
    case "Item":
      query = query.in("field_table.field_id", ITEM_FIELD_ID_LIST);
      break;
    case "PED Item":
      query = query.in("field_table.field_id", PED_ITEM_FIELD_ID_LIST);
      break;
    case "IT Asset":
      query = query.in("field_table.field_id", IT_ASSET_FIELD_ID_LIST);
      break;
    case "Technical Assessment":
      query = query.in("field_table.field_id", TECHNICAL_ASSESSMENT_FIELD_LIST);
      break;
    case "Practical Test":
      query = query.in("field_table.field_id", PRACTICAL_TEST_FIELD_LIST);
      break;
  }

  const { data, error } = await query;
  if (error) throw error;

  const formattedSection = data as unknown as FormType["form_section"];
  const sortedSection = formattedSection
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

  return sortedSection;
};

export const getITAssetItemOptions = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    index: number;
    limit: number;
  }
) => {
  const { teamId, index, limit } = params;
  const { data, error } = await supabaseClient
    .schema("item_schema")
    .from("item_table")
    .select("item_id, item_general_name")
    .eq("item_team_id", teamId)
    .eq("item_is_disabled", false)
    .eq("item_is_available", true)
    .eq("item_is_it_asset_item", true)
    .order("item_general_name")
    .limit(limit)
    .range(index, index + limit - 1);
  if (error) throw error;

  return data;
};

export const getJiraOrganizationList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    from: number;
    to: number;
    search?: string;
  }
) => {
  const { from, to, search } = params;
  let query = supabaseClient
    .schema("jira_schema")
    .from("jira_organization_table")
    .select("*", {
      count: "exact",
    })
    .order("jira_organization_jira_label")
    .range(from, to);

  if (search) {
    query = query.ilike("jira_organization_jira_label", `%${search}%`);
  }

  const { data, count, error } = await query;

  if (error) throw error;

  return {
    data,
    count: Number(count),
  };
};

export const getFieldResponseByRequestId = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    requestId: string;
    fieldId: string;
  }
) => {
  const { requestId, fieldId } = params;

  const { data, error } = await supabaseClient
    .schema("request_schema")
    .from("request_response_table")
    .select("request_response")
    .eq("request_response_field_id", fieldId)
    .eq("request_response_request_id", requestId);
  if (error) throw error;

  return data;
};

export const getAdminTicketAnalytics = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    adminTeamMemberId: string;
    intervalList: { startDate: string; endDate: string }[];
    ticketCategoryIdList: string[];
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_admin_ticket_analytics", { input_data: params })
    .select("*");
  if (error) throw error;
  return data;
};

export const getTicket = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    ticketId: string;
  }
) => {
  const { data } = await supabaseClient
    .schema("ticket_schema")
    .from("ticket_table")
    .select("*")
    .eq("ticket_id", params.ticketId)
    .maybeSingle();

  return data;
};

export const fetchFormslyInvoiceHistoryList = async (
  supabaseClient: SupabaseClient<OneOfficeDatabase["transaction_schema"]>,
  params: {
    userId: string;
    page: number;
    limit: number;
  }
) => {
  const { userId, page, limit } = params;

  const start = (page - 1) * limit;
  const { data, count, error } = await getTransactionList({
    supabaseClient,
    pagination: {
      from: start,
      to: start + limit,
    },
    filter: {
      appSourceUserId: userId,
      appSource: APP_SOURCE_ID,
    },
  });
  if (error) throw error;
  return { data: data as TransactionTableRow[], count };
};

export const getTeamDepartmentOptions = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    index: number;
    limit: number;
  }
) => {
  const { index, limit } = params;
  const { data, error } = await supabaseClient
    .schema("team_schema")
    .from("team_department_table")
    .select("team_department_id, team_department_name")
    .eq("team_department_is_disabled", false)
    .order("team_department_name")
    .limit(limit)
    .range(index, index + limit - 1);
  if (error) throw error;

  return data;
};

export const getEquipmentCodeOptions = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    index: number;
    limit: number;
  }
) => {
  const { index, limit } = params;
  const { data, error } = await supabaseClient
    .schema("equipment_schema")
    .from("equipment_description_view")
    .select(
      "equipment_description_id, equipment_description_property_number_with_prefix"
    )
    .eq("equipment_description_is_disabled", false)
    .eq("equipment_description_is_available", true)
    .order("equipment_description_property_number_with_prefix")
    .limit(limit)
    .range(index, index + limit - 1);
  if (error) throw error;

  return data;
};

export const getEquipmentUnitOptions = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    index: number;
    limit: number;
  }
) => {
  const { index, limit } = params;
  const { data, error } = await supabaseClient
    .schema("unit_of_measurement_schema")
    .from("equipment_unit_of_measurement_table")
    .select("equipment_unit_of_measurement_id, equipment_unit_of_measurement")
    .eq("equipment_unit_of_measurement_is_disabled", false)
    .order("equipment_unit_of_measurement")
    .limit(limit)
    .range(index, index + limit - 1);
  if (error) throw error;

  return data;
};

export const getEmployeePositionOptions = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    index: number;
    limit: number;
  }
) => {
  const { index, limit } = params;
  const { data, error } = await supabaseClient
    .schema("lookup_schema")
    .from("employee_job_title_table")
    .select("employee_job_title_id, employee_job_title_label")
    .eq("employee_job_title_is_disabled", false)
    .order("employee_job_title_label")
    .limit(limit)
    .range(index, index + limit - 1);
  if (error) throw error;

  return data;
};

export const getEmployeeName = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    employeeId: string;
  }
) => {
  const { employeeId } = params;
  const { data, error } = await supabaseClient
    .schema("lookup_schema")
    .from("scic_employee_table")
    .select("*")
    .eq("scic_employee_hris_id_number", employeeId)
    .maybeSingle();
  if (error) throw error;

  return data;
};

export const getSectionInRequestPageWithMultipleDuplicatableSection = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    index: number;
    requestId: string;
    duplicatableSectionIdCondition: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("fetch_form_section_with_multiple_duplicatable_section", {
      input_data: params,
    })
    .select("*");
  if (error) throw error;
  return data;
};

export const getAllSection = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    sectionIdList: string[];
  }
) => {
  const { sectionIdList } = params;

  const { data, error } = await supabaseClient
    .schema("form_schema")
    .from("section_table")
    .select("*")
    .in("section_id", sectionIdList)
    .order("section_order");
  if (error) throw error;
  return data;
};

export const checkIfAllPrimaryApprovedTheRequest = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    requestId: string;
    requestSignerId: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("check_if_all_primary_approver_approved_the_request", {
      input_data: params,
    })
    .select("*");
  if (error) throw error;

  return data as unknown as boolean;
};

export const getJiraProjectByTeamProjectName = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamProjectName: string;
  }
) => {
  const { data, error } = await supabaseClient
    .schema("jira_schema")
    .from("jira_formsly_project_table")
    .select(
      "jira_project_id!inner(jira_project_jira_id, jira_project_jira_label), formsly_project_id!inner(team_project_name)"
    )
    .eq("formsly_project_id.team_project_name", params.teamProjectName)
    .maybeSingle();
  if (error || !data) throw error;
  const formattedData = data as unknown as {
    jira_project_id: {
      jira_project_jira_id: string;
      jira_project_jira_label: string;
    };
    formsly_project_id: { team_project_name: string };
  };
  return {
    jiraId: formattedData.jira_project_id.jira_project_jira_id,
    jiraLabel: formattedData.jira_project_id.jira_project_jira_label,
  };
};

export const getJobTitleList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    from: number;
    to: number;
    search?: string;
  }
) => {
  const { from, to, search } = params;
  let query = supabaseClient
    .schema("lookup_schema")
    .from("employee_job_title_table")
    .select("*", { count: "exact" })
    .order("employee_job_title_label")
    .range(from, to);

  if (search) {
    query = query.ilike("employee_job_title_label", `%${search}%`);
  }

  const { data, count, error } = await query;
  if (error) throw error;

  return { data, count: Number(count) };
};

export const getRequestFieldResponse = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    requestId: string;
    fieldId: string[];
  }
) => {
  const { data, error } = await supabaseClient
    .schema("request_schema")
    .from("request_response_table")
    .select("request_response, request_response_field_id")
    .eq("request_response_request_id", params.requestId)
    .in("request_response_field_id", params.fieldId);

  if (error) throw error;

  return data;
};

export const getExistingConnectedRequest = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    parentRequestId: string;
    fieldId: string;
  }
) => {
  const { parentRequestId, fieldId } = params;
  const { data, error } = await supabaseClient
    .schema("request_schema")
    .from("request_response_table")
    .select("request_response, request: request_response_request_id!inner(*)")
    .eq("request_response_field_id", fieldId)
    .eq("request_response", JSON.stringify(parentRequestId))
    .in("request.request_status", ["PENDING", "APPROVED"])
    .maybeSingle();

  if (error) throw error;

  return data
    ? (data.request as unknown as Pick<
        RequestTableRow,
        "request_formsly_id_prefix" | "request_formsly_id_serial" | "request_id"
      >)
    : null;
};

export const getFormDepartmentSigner = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    projectId: string;
    formId: string;
    search?: string;
    page: number;
    limit: number;
  }
) => {
  const { projectId, formId } = params;
  const { data, count, error } = await supabaseClient
    .schema("form_schema")
    .from("signer_table")
    .select("*", { count: "exact" })
    .eq("signer_team_project_id", projectId)
    .eq("signer_form_id", formId)
    .eq("signer_is_disabled", false)
    .not("signer_team_department_id", "is", null);

  if (error) throw error;

  return { data, count: Number(count) };
};

export const checkIfUserIsRequestOwner = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamMemberId: string;
    requestId: string;
  }
) => {
  const { requestId, teamMemberId } = params;
  const { count, error } = await supabaseClient
    .schema("request_schema")
    .from("request_table")
    .select("*", { count: "exact", head: true })
    .eq("request_id", requestId)
    .eq("request_team_member_id", teamMemberId);

  if (error) throw error;

  return Number(count) > 0;
};

export const checkUserEmail = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    emailList: string[];
    teamId: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("check_user_email", { input_data: params })
    .select("*");
  if (error) throw error;
  return data as string[];
};

export const getLRFSummaryData = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    userId: string;
    limit: number;
    page: number;
    projectFilter?: string;
    startDate?: string;
    endDate?: string;
    sortFilter: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc("get_lrf_summary_table", {
    input_data: params,
  });

  if (error) throw error;

  return data as { data: LRFSpreadsheetData[]; count: number };
};

export const getApplicationInformationPositionOptions = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    index: number;
    limit: number;
  }
) => {
  const { teamId, index, limit } = params;
  const { data, error } = await supabaseClient
    .schema("lookup_schema")
    .from("position_table")
    .select("*")
    .eq("position_team_id", teamId)
    .eq("position_is_disabled", false)
    .eq("position_is_available", true)
    .not("position_alias", "ilike", "JUNIOR%")
    .not("position_alias", "ilike", "SENIOR%")
    .limit(limit)
    .range(index, index + limit - 1);
  if (error) throw error;

  return data;
};

export const getAllApplicationInformationPositionOptions = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    index: number;
    limit: number;
  }
) => {
  const { teamId, index, limit } = params;
  const { data, error } = await supabaseClient
    .schema("lookup_schema")
    .from("position_table")
    .select("*")
    .eq("position_team_id", teamId)
    .eq("position_is_disabled", false)
    .eq("position_is_available", true)
    .limit(limit)
    .range(index, index + limit - 1);
  if (error) throw error;

  return data;
};

export const getApplicationInformationSummaryData = async (
  supabaseClient: SupabaseClient<Database>,
  params: ApplicationInformationFilterFormValues & {
    userId: string;
  }
) => {
  const updatedParams = {
    ...params,
    requestFilter: {
      ...params.requestFilter,
      dateCreatedRange: {
        start: params.requestFilter?.dateCreatedRange?.start
          ? new Date(
              params.requestFilter?.dateCreatedRange?.start
            ).toLocaleDateString()
          : undefined,
        end: params.requestFilter?.dateCreatedRange?.end
          ? new Date(
              params.requestFilter?.dateCreatedRange?.end
            ).toLocaleDateString()
          : undefined,
      },
      dateUpdatedRange: {
        start: params.requestFilter?.dateUpdatedRange?.start
          ? new Date(
              params.requestFilter?.dateUpdatedRange?.start
            ).toLocaleDateString()
          : undefined,
        end: params.requestFilter?.dateUpdatedRange?.end
          ? new Date(
              params.requestFilter?.dateUpdatedRange?.end
            ).toLocaleDateString()
          : undefined,
      },
    },
    responseFilter: {
      ...params.responseFilter,
      yearGraduated: {
        start: params.responseFilter?.yearGraduated?.start
          ? moment(params.responseFilter?.yearGraduated?.start)
              .subtract(1, "year")
              .format("MM-DD-YYYY")
          : undefined,
        end: params.responseFilter?.yearGraduated?.end
          ? moment(params.responseFilter?.yearGraduated?.end).format(
              "MM-DD-YYYY"
            )
          : undefined,
      },
      soonestJoiningDate: {
        start: params.responseFilter?.soonestJoiningDate?.start
          ? moment(params.responseFilter?.soonestJoiningDate?.start)
              .subtract(1, "day")
              .format("MM-DD-YYYY")
          : undefined,
        end: params.responseFilter?.soonestJoiningDate?.end
          ? new Date(
              params.responseFilter?.soonestJoiningDate?.end
            ).toLocaleDateString()
          : undefined,
      },
    },
  };

  const {
    sort,
    page = 1,
    limit = DEFAULT_NUMBER_HR_SSOT_ROWS,
    responseFilter,
    requestFilter,
  } = updatedParams;

  const isUUID = (str: string) => {
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidPattern.test(str);
  };

  const isSortByResponse = isUUID(sort?.field ?? "");

  const offset = (page - 1) * limit;

  const responseFilterCondition = [];
  const requestFilterCondition = [];

  if (
    Boolean(responseFilter.seniority) &&
    responseFilter?.seniority?.length &&
    Boolean(responseFilter.position) &&
    responseFilter?.position?.length
  ) {
    const seniority =
      responseFilter.seniority === "MID" ? "" : `${responseFilter.seniority} `;
    responseFilterCondition.push(
      `(application_information_additional_details_position IN (${responseFilter.position
        .map((value) => `'${seniority}${value}'`)
        .join(", ")}))`
    );
  } else if (
    Boolean(responseFilter.seniority) &&
    responseFilter?.seniority?.length
  ) {
    if (responseFilter.seniority === "MID") {
      responseFilterCondition.push(
        `(application_information_additional_details_position NOT ILIKE 'JUNIOR%' AND application_information_additional_details_position NOT ILIKE 'SENIOR%')`
      );
    } else {
      responseFilterCondition.push(
        `(application_information_additional_details_position ILIKE '${responseFilter.seniority}%')`
      );
    }
  } else if (
    Boolean(responseFilter.position) &&
    responseFilter?.position?.length
  ) {
    responseFilterCondition.push(
      `(application_information_additional_details_position IN (${responseFilter.position
        .map((value) => `'${value}'`)
        .join(", ")}))`
    );
  }

  if (responseFilter.firstName) {
    responseFilterCondition.push(
      `(application_information_additional_details_first_name ILIKE '%${responseFilter.firstName}%')`
    );
  }
  if (responseFilter.middleName) {
    responseFilterCondition.push(
      `( application_information_additional_details_middle_name ILIKE '%${responseFilter.middleName}%')`
    );
  }
  if (responseFilter.lastName) {
    responseFilterCondition.push(
      `(application_information_additional_details_last_name ILIKE '%${responseFilter.lastName}%')`
    );
  }

  Boolean(requestFilter.requestId)
    ? requestFilterCondition.push(
        `request_formsly_id ILIKE '%${requestFilter.requestId}%'`
      )
    : null;
  Boolean(requestFilter.status) && requestFilter?.status?.length
    ? requestFilterCondition.push(
        `request_status IN (${requestFilter.status.map(
          (status) => `'${status}'`
        )})`
      )
    : null;
  Boolean(requestFilter.dateCreatedRange.start)
    ? requestFilterCondition.push(
        `request_date_created :: DATE >= '${requestFilter.dateCreatedRange.start}'`
      )
    : null;
  Boolean(requestFilter.dateCreatedRange.end)
    ? requestFilterCondition.push(
        `request_date_created :: DATE <= '${requestFilter.dateCreatedRange.end}'`
      )
    : null;
  Boolean(requestFilter.dateUpdatedRange.start)
    ? requestFilterCondition.push(
        `request_status_date_updated :: DATE >= '${requestFilter.dateUpdatedRange.start}'`
      )
    : null;
  Boolean(requestFilter.dateUpdatedRange.end)
    ? requestFilterCondition.push(
        `request_status_date_updated :: DATE <= '${requestFilter.dateUpdatedRange.end}'`
      )
    : null;

  const requestScoreFilterCondition = [];
  requestFilter.requestScoreRange &&
  Boolean(requestFilter.requestScoreRange.start)
    ? requestScoreFilterCondition.push(
        `request_score_value  >= ${requestFilter.requestScoreRange.start}`
      )
    : null;
  requestFilter.requestScoreRange &&
  Boolean(requestFilter.requestScoreRange.end)
    ? requestScoreFilterCondition.push(
        `request_score_value <= ${requestFilter.requestScoreRange.end}`
      )
    : null;

  let requestSignerCondition = "";
  Boolean(requestFilter.approver) && requestFilter?.approver?.length
    ? (requestSignerCondition = `request_signer_signer_id IN (${requestFilter.approver.map(
        (approver) => `'${approver}'`
      )})`)
    : null;

  const parentRequestQuery = `
    SELECT request_id,
      request_formsly_id,
      request_date_created,
      request_status,
      request_status_date_updated,
      request_score_value,
      application_information_additional_details_position,
      application_information_additional_details_first_name,
      application_information_additional_details_middle_name,
      application_information_additional_details_last_name
    FROM public.request_view
    INNER JOIN request_schema.request_score_table ON request_score_request_id = request_id
      ${
        requestScoreFilterCondition.length
          ? `AND (${requestScoreFilterCondition.join(" AND ")})`
          : ""
      }
    INNER JOIN request_schema.request_signer_table ON request_id = request_signer_request_id
      ${requestSignerCondition.length ? `AND ${requestSignerCondition}` : ""}
    INNER JOIN hr_schema.application_information_additional_details_table ON request_id = application_information_additional_details_request_id
      ${
        responseFilterCondition.length
          ? `AND ${responseFilterCondition.join(" AND ")}`
          : ""
      }
    WHERE
      request_is_disabled = FALSE
      AND request_form_id = '16ae1f62-c553-4b0e-909a-003d92828036'
      ${
        requestFilterCondition.length
          ? `AND ${requestFilterCondition.join(" AND ")}`
          : ""
      }
    ${
      !isSortByResponse ? `ORDER BY ${sort?.field} ${sort?.order}` : ""
    }, request_date_created DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;

  const { data, error } = await supabaseClient.rpc(
    "get_application_information_summary_table",
    {
      input_data: { parentRequestQuery },
    }
  );
  if (error) throw error;
  const formattedData =
    data as unknown as ApplicationInformationSpreadsheetData[];

  const { data: columnData, error: columnError } = await supabaseClient.rpc(
    "get_application_information_summary_table_columns",
    {
      input_data: {
        requestIdList: formattedData.map((request) => request.request_id),
      },
    }
  );
  if (columnError) throw columnError;
  const formattedColumnData = columnData as unknown as {
    request_id: string;
    request_signer: {
      request_signer_id: string;
      request_signer_status: string;
      request_signer: {
        signer_team_member_id: string;
        signer_is_primary_signer: boolean;
      }[];
    };
  }[];

  return formattedData.map((data) => {
    const signer = formattedColumnData.find(
      (signer) => signer.request_id === data.request_id
    );
    return {
      ...data,
      request_signer_list: signer?.request_signer,
    };
  }) as unknown as ApplicationInformationSpreadsheetData[];
};

export const getFormSectionWithFieldList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    formId: string;
    userId: string;
    teamId: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc(
    "get_form_section_with_field_list",
    {
      input_data: params,
    }
  );
  if (error) throw error;

  return data as unknown as {
    sectionList: SectionWithFieldType[];
    optionList: (OptionTableRow & { field_name: string })[];
  };
};

export const getUserApplicationList = async (
  supabaseClient: SupabaseClient<Database>,
  params: FetchUserRequestListParams
) => {
  const {
    page,
    limit,
    isAscendingSort,
    email,
    search,
    columnAccessor = "request_date_created",
  } = params;

  const sort = isAscendingSort ? "ASC" : "DESC";

  const searchCondition =
    search && validate(search)
      ? `request_id = '${search}'`
      : `request_formsly_id ILIKE '%' || '${search}' || '%'`;

  const { data: requestList, error: requestListError } =
    await supabaseClient.rpc("fetch_user_request_list", {
      input_data: {
        page: page,
        limit: limit,
        sort,
        email,
        search: search ? `AND (${searchCondition})` : "",
        columnAccessor,
      },
    });
  if (requestListError) throw requestListError;

  const dataFormat = requestList as unknown as {
    data: ApplicationListItemType[];
    count: number;
  };

  if (!dataFormat.data.length) {
    return {
      data: [],
      count: dataFormat.count,
    };
  }

  return dataFormat;
};

export const getUserIdInApplicationInformation = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    requestId: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc(
    "get_user_id_in_application_information",
    {
      input_data: params,
    }
  );
  if (error) throw error;
  return data;
};

export const getUserIdInApplicationInformationV1 = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    requestId: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc(
    "get_user_id_in_application_information_v1",
    {
      input_data: params,
    }
  );
  if (error) throw error;
  return data as string | undefined;
};

export const checkUserSSSIDNumber = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    idNumber: string;
  }
) => {
  const { idNumber } = params;
  const { count, error } = await supabaseClient
    .schema("user_schema")
    .from("user_sss_table")
    .select("user_sss_number", { count: "exact", head: true })
    .eq("user_sss_number", idNumber);

  if (error) throw error;
  return !Boolean(count);
};

export const getHRPhoneInterviewSummaryData = async (
  supabaseClient: SupabaseClient<Database>,
  params: HRPhoneInterviewFilterFormValues & {
    userId: string;
  }
) => {
  const updatedParams = {
    ...params,
    hr_phone_interview_date_created: {
      start: params.hr_phone_interview_date_created?.start
        ? new Date(
            params.hr_phone_interview_date_created?.start
          ).toLocaleDateString()
        : undefined,
      end: params.hr_phone_interview_date_created?.end
        ? moment(params.hr_phone_interview_date_created?.end)
            .add(1, "day")
            .format("MM-DD-YYYY")
        : undefined,
    },
    hr_phone_interview_schedule: {
      start: params.hr_phone_interview_schedule?.start
        ? moment(params.hr_phone_interview_schedule?.start)
            .utc()
            .format("YYYY-MM-DD HH:mm:ssZZ")
        : undefined,
      end: params.hr_phone_interview_schedule?.end
        ? moment(params.hr_phone_interview_schedule?.end)
            .utc()
            .format("YYYY-MM-DD HH:mm:ssZZ")
        : undefined,
    },
  };

  const { data, error } = await supabaseClient.rpc(
    "get_hr_phone_interview_summary_table",
    {
      input_data: updatedParams,
    }
  );
  if (error) throw error;
  return data as HRPhoneInterviewSpreadsheetData[];
};

export const getPhoneMeetingSlots = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    startTime: string;
    endTime: string;
    meetingDuration: number;
    breakDuration: number;
  }
) => {
  const { data, error } = await supabaseClient.rpc(
    "get_phone_meeting_available",
    {
      input_data: params,
    }
  );

  if (error) throw error;

  return data as {
    slot_start: string;
    slot_end: string;
    isDisabled: boolean;
  }[];
};

export const getTradeTestSummaryData = async (
  supabaseClient: SupabaseClient<Database>,
  params: TradeTestFilterFormValues & {
    userId: string;
  }
) => {
  const updatedParams = {
    ...params,
    trade_test_date_created: {
      start: params.trade_test_date_created?.start
        ? new Date(params.trade_test_date_created?.start).toLocaleDateString()
        : undefined,
      end: params.trade_test_date_created?.end
        ? moment(params.trade_test_date_created?.end)
            .add(1, "day")
            .format("MM-DD-YYYY")
        : undefined,
    },
    trade_test_schedule: {
      start: params.trade_test_schedule?.start
        ? moment(params.trade_test_schedule?.start)
            .utc()
            .format("YYYY-MM-DD HH:mm:ssZZ")
        : undefined,
      end: params.trade_test_schedule?.end
        ? moment(params.trade_test_schedule?.end)
            .utc()
            .format("YYYY-MM-DD HH:mm:ssZZ")
        : undefined,
    },
  };

  const { data, error } = await supabaseClient.rpc(
    "get_trade_test_summary_table",
    {
      input_data: updatedParams,
    }
  );
  if (error) throw error;
  return data as TradeTestSpreadsheetData[];
};

export const getTechnicalInterviewSummaryData = async (
  supabaseClient: SupabaseClient<Database>,
  params: TechnicalInterviewFilterFormValues & {
    userId: string;
    technicalInterviewNumber: number;
  }
) => {
  const updatedParams = {
    ...params,
    technical_interview_date_created: {
      start: params.technical_interview_date_created?.start
        ? new Date(
            params.technical_interview_date_created?.start
          ).toLocaleDateString()
        : undefined,
      end: params.technical_interview_date_created?.end
        ? moment(params.technical_interview_date_created?.end)
            .add(1, "day")
            .format("MM-DD-YYYY")
        : undefined,
    },
    technical_interview_schedule: {
      start: params.technical_interview_schedule?.start
        ? moment(params.technical_interview_schedule?.start)
            .utc()
            .format("YYYY-MM-DD HH:mm:ssZZ")
        : undefined,
      end: params.technical_interview_schedule?.end
        ? moment(params.technical_interview_schedule?.end)
            .utc()
            .format("YYYY-MM-DD HH:mm:ssZZ")
        : undefined,
    },
  };

  const { data, error } = await supabaseClient.rpc(
    "get_technical_interview_summary_table",
    {
      input_data: updatedParams,
    }
  );
  if (error) throw error;
  return data as TechnicalInterviewSpreadsheetData[];
};

export const getBackgroundCheckSummaryData = async (
  supabaseClient: SupabaseClient<Database>,
  params: BackgroundCheckFilterFormValues & {
    userId: string;
  }
) => {
  const updatedParams = {
    ...params,
    background_check_date_created: {
      start: params.background_check_date_created?.start
        ? new Date(
            params.background_check_date_created?.start
          ).toLocaleDateString()
        : undefined,
      end: params.background_check_date_created?.end
        ? moment(params.background_check_date_created?.end)
            .add(1, "day")
            .format("MM-DD-YYYY")
        : undefined,
    },
  };

  const { data, error } = await supabaseClient.rpc(
    "get_background_check_summary_table",
    {
      input_data: updatedParams,
    }
  );
  if (error) throw error;
  return data as BackgroundCheckSpreadsheetData[];
};

export const getJobOfferSummaryData = async (
  supabaseClient: SupabaseClient<Database>,
  params: JobOfferFilterFormValues & {
    userId: string;
  }
) => {
  const updatedParams = {
    ...params,
    job_offer_date_created: {
      start: params.job_offer_date_created?.start
        ? new Date(params.job_offer_date_created?.start).toLocaleDateString()
        : undefined,
      end: params.job_offer_date_created?.end
        ? moment(params.job_offer_date_created?.end)
            .add(1, "day")
            .format("MM-DD-YYYY")
        : undefined,
    },
  };

  const { data, error } = await supabaseClient.rpc(
    "get_job_offer_summary_table",
    {
      input_data: updatedParams,
    }
  );
  if (error) throw error;
  return data as JobOfferSpreadsheetData[];
};

export const getJobHistory = async (
  supabaseClient: SupabaseClient<Database>,
  params: { requestId: string }
) => {
  const { data, error } = await supabaseClient.rpc("get_job_history", {
    input_data: params,
  });
  if (error) throw error;

  return data as unknown as JobOfferHistoryType[];
};

export const getInterviewOnlineMeeting = async (
  supabaseClient: SupabaseClient<Database>,
  interviewId: string
) => {
  const { data, error } = await supabaseClient
    .schema("hr_schema")
    .from("interview_online_meeting_table")
    .select("*")
    .eq("interview_meeting_interview_id", interviewId)
    .limit(1);

  if (error) throw error;

  return data[0] as InterviewOnlineMeetingTableRow;
};

export const checkIfGroupMember = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    userId: string;
    groupName: string[];
    teamId: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc("check_if_group_member", {
    input_data: params,
  });

  if (error) throw error;

  return data;
};

export const checkIfOwner = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    userId: string;
    teamId: string;
  }
) => {
  const { userId, teamId } = params;
  const { data, error } = await supabaseClient
    .schema("team_schema")
    .from("team_member_table")
    .select("team_member_role")
    .eq("team_member_user_id", userId)
    .eq("team_member_team_id", teamId)
    .maybeSingle();
  if (error) throw error;
  const role = data?.team_member_role;
  if (role === null) return false;
  return role === "OWNER";
};

export const validateEnvApiKey = async (
  supabase: SupabaseClient<Database>,
  params: {
    apiKey: string;
    endPoint: string;
  }
) => {
  const { apiKey, endPoint } = params;

  if (!apiKey) {
    throw new Error("Missing API key");
  }

  const { data: apiKeyData, error } = await supabase
    .schema("team_schema")
    .from("team_key_table")
    .select("*")
    .eq("team_key_api_key", apiKey)
    .maybeSingle();

  if (error) throw new Error("Error fetching API key data");
  if (!apiKeyData) throw new Error("API key not found");

  if (apiKeyData.team_key_is_disabled) {
    throw new Error("API key is disabled");
  }

  const { error: recordError } = await supabase
    .schema("team_schema")
    .from("team_key_record_table")
    .insert({
      team_key_record_team_key_id: apiKeyData.team_key_id,
      team_key_record_access_api: endPoint,
    });

  if (recordError) throw new Error("Error logging API key access");

  return apiKeyData;
};

export const getRequestRayaApi = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    offset?: string;
    limit?: string;
    order?: string;
    startDate?: string;
    teamId: string;
    endDate?: string;
  }
) => {
  const {
    offset = "0",
    limit = "100",
    order = "asc",
    startDate,
    teamId,
    endDate,
  } = params;

  const parsedOffset = parseInt(offset, 10);
  const parsedLimit = Math.min(parseInt(limit, 10), 1000);
  const parsedOrder = order === "desc" ? "desc" : "asc";

  const { data, error } = await supabaseClient.rpc("get_request_raya_api", {
    input_data: {
      offset: parsedOffset,
      limit: parsedLimit,
      teamId: teamId,
      startDate: startDate,
      endDate: endDate,
      order: parsedOrder,
    },
  });

  if (error) {
    throw error;
  }
  return data;
};

export const getOtherExpensesRayaApi = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    offset?: string;
    limit?: string;
    order?: string;
    startDate?: string;
    teamId: string;
    endDate?: string;
  }
) => {
  const {
    offset = "0",
    limit = "100",
    order = "asc",
    startDate,
    teamId,
    endDate,
  } = params;

  const parsedOffset = parseInt(offset, 10);
  const parsedLimit = Math.min(parseInt(limit, 10), 1000);
  const parsedOrder = order === "desc" ? "desc" : "asc";

  const { data, error } = await supabaseClient.rpc(
    "get_other_expenses_raya_api",
    {
      input_data: {
        offset: parsedOffset,
        limit: parsedLimit,
        teamId: teamId,
        startDate: startDate,
        endDate: endDate,
        order: parsedOrder,
      },
    }
  );

  if (error) {
    throw error;
  }
  return data;
};

export const getPedPartRayaApi = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    offset?: string;
    limit?: string;
    order?: string;
    startDate?: string;
    teamId: string;
    endDate?: string;
  }
) => {
  const {
    offset = "0",
    limit = "100",
    order = "asc",
    startDate,
    teamId,
    endDate,
  } = params;

  const parsedOffset = parseInt(offset, 10);
  const parsedLimit = Math.min(parseInt(limit, 10), 1000);
  const parsedOrder = order === "desc" ? "desc" : "asc";

  const { data, error } = await supabaseClient.rpc("get_ped_part_raya_api", {
    input_data: {
      offset: parsedOffset,
      limit: parsedLimit,
      teamId: teamId,
      startDate: startDate,
      endDate: endDate,
      order: parsedOrder,
    },
  });

  if (error) {
    throw error;
  }
  return data;
};

export const getItemRayaApi = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    offset?: string;
    limit?: string;
    order?: string;
    startDate?: string;
    teamId: string;
    endDate?: string;
  }
) => {
  const {
    offset = "0",
    limit = "100",
    order = "asc",
    startDate,
    teamId,
    endDate,
  } = params;

  const parsedOffset = parseInt(offset, 10);
  const parsedLimit = Math.min(parseInt(limit, 10), 1000);
  const parsedOrder = order === "desc" ? "desc" : "asc";

  const { data, error } = await supabaseClient.rpc("get_item_raya_api", {
    input_data: {
      offset: parsedOffset,
      limit: parsedLimit,
      teamId: teamId,
      startDate: startDate,
      endDate: endDate,
      order: parsedOrder,
    },
  });

  if (error) {
    throw error;
  }
  return data;
};

export const getItAssetRayaApi = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    offset?: string;
    limit?: string;
    order?: string;
    startDate?: string;
    teamId: string;
    endDate?: string;
  }
) => {
  const {
    offset = "0",
    limit = "100",
    order = "asc",
    startDate,
    teamId,
    endDate,
  } = params;

  const parsedOffset = parseInt(offset, 10);
  const parsedLimit = Math.min(parseInt(limit, 10), 1000);
  const parsedOrder = order === "desc" ? "desc" : "asc";

  const { data, error } = await supabaseClient.rpc("get_it_asset_raya_api", {
    input_data: {
      offset: parsedOffset,
      limit: parsedLimit,
      teamId: teamId,
      startDate: startDate,
      endDate: endDate,
      order: parsedOrder,
    },
  });

  if (error) {
    throw error;
  }
  return data;
};

export const getPedItemRayaApi = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    offset?: string;
    limit?: string;
    order?: string;
    startDate?: string;
    teamId: string;
    endDate?: string;
  }
) => {
  const {
    offset = "0",
    limit = "100",
    order = "asc",
    startDate,
    teamId,
    endDate,
  } = params;

  const parsedOffset = parseInt(offset, 10);
  const parsedLimit = Math.min(parseInt(limit, 10), 1000);
  const parsedOrder = order === "desc" ? "desc" : "asc";

  const { data, error } = await supabaseClient.rpc("get_ped_item_raya_api", {
    input_data: {
      offset: parsedOffset,
      limit: parsedLimit,
      teamId: teamId,
      startDate: startDate,
      endDate: endDate,
      order: parsedOrder,
    },
  });

  if (error) {
    throw error;
  }
  return data;
};

export const getServicesRayaApi = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    offset?: string;
    limit?: string;
    order?: string;
    startDate?: string;
    teamId: string;
    endDate?: string;
  }
) => {
  const {
    offset = "0",
    limit = "100",
    order = "asc",
    startDate,
    teamId,
    endDate,
  } = params;

  const parsedOffset = parseInt(offset, 10);
  const parsedLimit = Math.min(parseInt(limit, 10), 1000);
  const parsedOrder = order === "desc" ? "desc" : "asc";

  const { data, error } = await supabaseClient.rpc("get_services_raya_api", {
    input_data: {
      offset: parsedOffset,
      limit: parsedLimit,
      teamId: teamId,
      startDate: startDate,
      endDate: endDate,
      order: parsedOrder,
    },
  });

  if (error) {
    throw error;
  }
  return data;
};

export const getLatestApiKey = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
  }
) => {
  const { teamId } = params;

  const { data, error } = await supabaseClient
    .schema("team_schema")
    .from("team_key_table")
    .select("team_key_api_key,team_key_label")
    .eq("team_key_team_id", teamId)
    .order("team_key_date_created", { ascending: false })
    .eq("team_key_is_disabled", false);

  if (error) {
    throw error;
  }
  return data;
};

export const getAdOwnerList = async (
  supabaseClient: SupabaseClient<Database>
) => {
  const { data, error } = await supabaseClient
    .schema("lookup_schema")
    .from("ad_owner_table")
    .select("*");
  if (error) throw error;

  return data;
};

export const getInterview = async (
  supabaseClient: SupabaseClient,
  params: {
    interviewId: string;
    table: string;
    interviewNumber?: number;
  }
) => {
  const { interviewId, table, interviewNumber } = params;
  let query = supabaseClient
    .schema("hr_schema")
    .from(`${table}_table`)
    .select()
    .eq(`${table}_id`, interviewId)
    .limit(1);

  if (interviewNumber) {
    query = query.eq(`${table}_number`, interviewNumber);
  }
  const { data, error } = await query;
  if (error) throw error;

  return data[0];
};

export const phoneInterviewValidation = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    interview_schedule?: string;
    requestId: string;
    meetingType: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc(
    "phone_interview_validation",
    {
      input_data: params,
    }
  );

  if (error) throw error;

  return data as {
    message: string;
    status: string;
    assigned_hr_team_member_id: string;
    assigned_hr_full_name: string;
    assigned_hr_email: string;
  };
};

export const getHRSpreadsheetViewOnLoad = async (
  supabaseClient: SupabaseClient<Database>,
  params: { teamId: string }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_hr_spreadsheet_view_on_load", { input_data: params })
    .select("*");
  if (error) throw error;

  return data;
};

export const checkSpreadsheetRowStatus = async (
  supabaseClient: SupabaseClient<Database>,
  params: { table: string; status: string; id: string }
) => {
  const { data, error } = await supabaseClient
    .rpc("check_spreadsheet_row_status", { input_data: params })
    .select("*");
  if (error) throw error;
  return data;
};

export const checkJobOfferRow = async (
  supabaseClient: SupabaseClient<Database>,
  params: { id: string; status: string; requestId: string }
) => {
  const { data, error } = await supabaseClient
    .rpc("check_job_offer_row", { input_data: params })
    .select("*");
  if (error) throw error;
  return data;
};

export const getHRIndicatorCount = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamMemberId: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc("get_hr_indicator_count", {
    input_data: params,
  });
  if (error) throw error;

  return data;
};

export const getFieldOfStudyOptions = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    value: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc(
    "get_field_of_study_options",
    { input_data: params }
  );
  if (error) throw error;

  return data as string[];
};

export const getDegreeNameOptions = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    degreeType: string;
    fieldOfStudy: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc("get_degree_name_options", {
    input_data: params,
  });
  if (error) throw error;

  return data as string[];
};

export const getHRProjectOptions = async (
  supabaseClient: SupabaseClient<Database>
) => {
  const { data, error } = await supabaseClient.rpc("get_hr_project_options");
  if (error) throw error;
  return data as HRProjectType[];
};

export const getQuestionnaireList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    page: number;
    limit: number;
    creator?: string;
    columnAccessor: string;
    isAscendingSort: boolean;
    search?: string;
  }
) => {
  const {
    teamId,
    page,
    limit,
    creator,
    isAscendingSort,
    search,
    columnAccessor,
  } = params;
  const sortBy = isAscendingSort ? "asc" : "desc";
  const sortCondition = `${columnAccessor} ${sortBy}`;

  const creatorCondition =
    creator && validate(creator)
      ? `q.questionnaire_created_by = '${creator}'`
      : `q.questionnaire_created_by '%' || '${creator}' || '%'`;

  const searchCondition =
    search && validate(search)
      ? `q.questionnaire_name = '${search}'`
      : `q.questionnaire_name ILIKE '%' || '${search}' || '%'`;

  const { data, error } = await supabaseClient.rpc(
    "get_questionnare_table_on_load",
    {
      input_data: {
        teamId,
        search: search ? `AND (${searchCondition})` : "",
        creator: creator ? `AND (${creatorCondition})` : "",
        page,
        isAscendingSort: sortCondition,
        limit,
      },
    }
  );
  if (error) throw error;

  return data as unknown as {
    data: TechnicalAssessmentTableRow[];
    count: number;
  };
};

export const getPositionPerQuestionnaire = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    questionnaireId: string;
  }
) => {
  const { data, error } = await supabaseClient
    .schema("lookup_schema")
    .from("position_table")
    .select("position_alias")
    .eq("position_questionnaire_id", params.questionnaireId);

  if (error) throw error;

  const positions = data.map((item) => item.position_alias);

  return positions;
};

export const getTechnicalOptionsItem = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    questionnaireId: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc("get_technical_options", {
    input_data: params,
  });

  if (error) throw error;

  return data as unknown as QuestionnaireData;
};

export const getPositionTypeOptions = async (
  supabaseClient: SupabaseClient<Database>,
  params: { teamId: string; limit: number }
) => {
  const { teamId, limit } = params;
  let start = 0;
  let allData: OptionType[] = [];

  while (true) {
    const end = start + limit - 1;
    const { data, error } = await supabaseClient
      .schema("lookup_schema")
      .from("position_table")
      .select("*")
      .eq("position_team_id", teamId)
      .order("position_alias")
      .range(start, end);

    if (error) throw error;

    if (!data || data.length === 0) {
      break;
    }

    const returnData = data.map((item) => ({
      label: `${item.position_alias}`,
      value: `${item.position_id}`,
    }));

    allData = allData.concat(returnData);
    start += limit;
  }

  return allData;
};

export const getHRApplicantAnalytics = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    startDate?: string;
    endDate?: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc(
    "get_application_information_analytics",
    { input_data: params }
  );
  if (error) throw error;

  return data as HRAnalyticsData;
};

export const getEmailResendTimer = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    email: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc("get_email_resend_timer", {
    input_data: params,
  });
  if (error) throw error;

  return data as number;
};

export const checkAssessmentCreateRequestPage = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    applicationInformationFormslyId?: string;
    generalAssessmentFormslyId?: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc(
    "check_assessment_create_request_page",
    {
      input_data: params,
    }
  );
  if (error) throw error;

  return data as boolean;
};

export const getQuestionnaireDetails = async (
  supabaseClient: SupabaseClient<Database>,
  questionnaireId: string
) => {
  const { data, error } = await supabaseClient
    .schema("form_schema")
    .from("questionnaire_table")
    .select("questionnaire_name, questionnaire_date_created")
    .eq("questionnaire_id", questionnaireId)
    .limit(1);
  if (error) throw error;

  return data[0] as unknown as {
    questionnaire_name: string;
    questionnaire_date_created: string;
  };
};

export const getPositionCategory = async (
  supabaseClient: SupabaseClient<Database>,
  position: string
) => {
  const { data, error } = await supabaseClient
    .schema("lookup_schema")
    .from("position_table")
    .select("position_category")
    .eq("position_alias", position)
    .limit(1);
  if (error) throw error;

  return data[0].position_category;
};

export const getHrAnalyticsData = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    filterChartValues: FilterChartValues;
  }
) => {
  const { data, error } = await supabaseClient.rpc("hr_response_analytics", {
    input_data: {
      filterChartValues: {
        memberFilter: params.filterChartValues.memberFilter,
        stepFilter: params.filterChartValues.stepFilter,
        frequencyFilter: params.filterChartValues.frequencyFilter,
        startDate: params.filterChartValues.startDate
          ? params.filterChartValues.startDate.toISOString()
          : null,
        endDate: params.filterChartValues.endDate
          ? params.filterChartValues.endDate.toISOString()
          : null,
      },
    },
  });
  if (error) throw error;

  return data as unknown as Dataset;
};

export const getTeamGroupMember = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    groupId: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_team_group_member", { input_data: params })
    .select("*");
  if (error) throw error;

  return data as TeamMemberType[];
};

export const checkIfUserHaveSSSID = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    userId: string;
  }
) => {
  const { userId } = params;
  const { count, error } = await supabaseClient
    .schema("user_schema")
    .from("user_sss_table")
    .select("*", { count: "exact", head: true })
    .eq("user_sss_user_id", userId);
  if (error) throw error;

  return Boolean(count);
};

export const checkPhoneNumber = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    phoneNumber: string;
  }
) => {
  const { phoneNumber } = params;
  const { count, error } = await supabaseClient
    .schema("user_schema")
    .from("user_table")
    .select("user_phone_number", { count: "exact", head: true })
    .eq("user_phone_number", phoneNumber);

  if (error) throw error;
  return !Boolean(count);
};

export const getEvaluationResultAutomaticResponse = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    interviewId: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_evaluation_result_data", { input_data: params })
    .select("*");
  if (error) throw error;
  const formattedData = data as unknown as {
    candidateFirstName: string;
    candidateMiddleName: string;
    candidateLastName: string;
    candidateEmail: string;
    position: string;
    email: string;
    interviewData: TechnicalInterviewTableRow & { request_formsly_id: string };
  };
  return formattedData;
};

export const getSCICEmployeeList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    search?: string;
    limit: number;
    page: number;
  }
) => {
  const { search, limit, page } = params;

  const start = (page - 1) * limit;
  const end = start + limit - 1;
  let query = supabaseClient
    .schema("lookup_schema")
    .from("scic_employee_table")
    .select("*", { count: "exact" })
    .range(start, end);

  if (search) {
    query = query.ilike("scic_employee_hris_id_number", `%${search}%`);
  }

  const { data, count, error } = await query;

  if (error) throw error;

  return {
    data: data as SCICEmployeeTableRow[],
    totalCount: count ?? 0,
  };
};

export const getRequesterPrimarySignerList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    formId: string;
    page: number;
    search?: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc(
    "get_requester_signer_list",
    {
      input_data: { ...params, limit: ROW_PER_PAGE },
    }
  );
  if (error) throw error;

  return data as {
    data: RequesterPrimarySignerType[];
    count: number;
  };
};

export const getExistingTeams = async (
  supabaseClient: SupabaseClient<Database>,
  params: { page: number; search?: string }
) => {
  const { page, search } = params;
  const start = (page - 1) * ROW_PER_PAGE;
  const end = start + ROW_PER_PAGE - 1;

  let query = supabaseClient
    .schema("team_schema")
    .from("team_table")
    .select("team_id, team_name, team_logo", { count: "exact" });

  if (search) {
    query = query.ilike("team_name", `%${search}%`);
  }
  query.range(start, end);

  const { data, count, error } = await query;

  if (error) throw error;

  return {
    data,
    count: Number(count),
  };
};

export const getUserTeamMembershipRequest = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    userId: string;
    offset: number;
  }
) => {
  const { userId, offset } = params;
  const start = offset * ROW_PER_PAGE;
  const end = start + ROW_PER_PAGE;

  const { data, error } = await supabaseClient
    .schema("team_schema")
    .from("team_membership_request_table")
    .select("*")
    .eq("team_membership_request_from_user_id", userId)
    .range(start, end);

  if (error) throw error;

  return data;
};

export const getRequestIdFromFormslyId = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    formslyId: string;
    requestFormId: string;
  }
) => {
  const { formslyId, requestFormId } = params;
  const { data, error } = await supabaseClient
    .from("request_view")
    .select("request_id")
    .eq("request_form_id", requestFormId)
    .eq("request_formsly_id", formslyId)
    .limit(1);
  if (error) throw error;

  return data[0] ? data[0].request_id : null;
};

export const getBackgroundCheckData = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    backgroundCheckId: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_background_check_data", { input_data: params })
    .select("*");
  if (error) throw error;
  const formattedData = data as unknown as {
    candidateFirstName: string;
    candidateMiddleName: string;
    candidateLastName: string;
    candidateEmail: string;
    position: string;
    email: string;
    backgroundCheckData: BackgroundCheckTableRow & {
      request_formsly_id: string;
    };
  };
  return formattedData;
};

export const getTeamTeamMembershipRequest = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    page: number;
    teamId: string;
    search?: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc(
    "get_team_team_membership_request",
    {
      input_data: { ...params, limit: ROW_PER_PAGE },
    }
  );

  if (error) throw error;

  return data as { data: TeamTeamMembershipRequest[]; count: number };
};

export const getPracticalTestList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    page: number;
    limit: number;
    creator?: string;
    columnAccessor: string;
    isAscendingSort: boolean;
    search?: string;
  }
) => {
  const {
    teamId,
    page,
    limit,
    creator,
    isAscendingSort,
    search,
    columnAccessor,
  } = params;
  const sortBy = isAscendingSort ? "asc" : "desc";
  const sortCondition = `${columnAccessor} ${sortBy}`;

  const creatorCondition =
    creator && validate(creator)
      ? `practical_test_created_by = '${creator}'`
      : `practical_test_created_by '%' || '${creator}' || '%'`;

  const searchCondition =
    search && validate(search)
      ? `practical_test_label = '${search}'`
      : `practical_test_label ILIKE '%' || '${search}' || '%'`;

  const { data, error } = await supabaseClient.rpc(
    "get_practical_test_form_on_load",
    {
      input_data: {
        teamId,
        search: search ? `AND (${searchCondition})` : "",
        creator: creator ? `AND (${creatorCondition})` : "",
        page,
        isAscendingSort: sortCondition,
        limit,
      },
    }
  );
  if (error) throw error;

  return data as unknown as {
    data: PracticalTestType[];
    count: number;
  };
};

export const checkPracticalTestLabel = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    label: string;
  }
) => {
  const { label } = params;

  const { count, error } = await supabaseClient
    .schema("hr_schema")
    .from("practical_test_table")
    .select("*", { count: "exact", head: true })
    .eq("practical_test_label", label)
    .limit(1);
  if (error) throw error;

  return Boolean(count);
};

export const getPracticalTestForm = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    practicalTestId: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc("get_practical_test_form", {
    input_data: params,
  });
  if (error) throw error;

  return data as unknown as CreatePracticalTestFormType;
};

export const getPracticalTestAutomaticResponse = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    practicalTestId: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_practical_test_data", { input_data: params })
    .select("*");
  if (error) throw error;
  const formattedData = data as unknown as {
    candidateFirstName: string;
    candidateMiddleName: string;
    candidateLastName: string;
    candidateEmail: string;
    position: string;
    email: string;
    tradeTestData: TradeTestTableRow & { request_formsly_id: string };
  };
  return formattedData;
};

export const getPracticalTestFieldList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    position: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("get_practical_test_field_list", { input_data: params })
    .select("*");

  if (error) throw error;
  const formattedData = data as unknown as
    | (PracticalTestTableRow & {
        practicalTestQuestionList: (FieldTableRow & { field_weight: number })[];
      })
    | null;

  return formattedData;
};

export const getRecruitmentData = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    startDate: string;
    endDate: string;
    offset: number;
    limit: number;
  }
) => {
  const { data, error } = await supabaseClient.rpc("get_hr_recruitment_data", {
    input_data: params,
  });
  if (error) throw error;

  return data as HRRecruitmentData[];
};

export const getApplicationInformationIndicator = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    requestList: ApplicationListItemType[];
  }
) => {
  const { data, error } = await supabaseClient.rpc(
    "fetch_user_request_indicator",
    {
      input_data: params,
    }
  );

  if (error) throw error;
  return data as unknown as ApplicationListItemType[];
};

export const getPositionWithPracticalTestOptions = async (
  supabaseClient: SupabaseClient<Database>,
  params: { teamId: string; limit: number }
) => {
  const { teamId, limit } = params;
  let start = 0;
  let allData: { position_id: string; position_alias: string }[] = [];

  while (true) {
    const end = start + limit - 1;
    const { data, error } = await supabaseClient
      .schema("lookup_schema")
      .from("position_table")
      .select("position_id, position_alias")
      .eq("position_team_id", teamId)
      .eq("position_is_with_trade_test", true)
      .order("position_alias")
      .range(start, end);
    if (error) throw error;

    if (!data || data.length === 0) {
      break;
    }

    allData = allData.concat(data);
    start += limit;
  }

  return allData;
};

export const getSSOT = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    pageNumber: number;
    rowLimit: number;
    search: string;
    requestingProject: string;
    itemName: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc("get_ssot", {
    input_data: params,
  });
  if (error) throw error;

  return data as SSOTType[];
};

export const getRequestPageOnLoad = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    requestId: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc("request_page_on_load", {
    input_data: params,
  });
  if (error) throw error;

  const formattedData = data as unknown as {
    request: RequestWithResponseType;
    duplicatableSectionIdList: string[];
    sectionIdWithDuplicatableSectionIdList: {
      request_response_duplicatable_section_id: string;
      section_id: string;
    }[];
  };

  return formattedData;
};

export const getTeamMemberWithFilter = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    page: number;
    limit: number;
    search: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc(
    "get_team_member_with_filter",
    {
      input_data: params,
    }
  );
  if (error) throw error;

  return data as {
    teamMembers: TeamMemberType[];
    teamMembersCount: number;
  };
};

export const getFormListPageOnLoad = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    userId: string;
    limit: number;
  }
) => {
  const { data, error } = await supabaseClient.rpc("form_list_page_on_load", {
    input_data: params,
  });
  if (error) throw error;

  return data as {
    formList: FormWithOwnerType[];
    formListCount: number;
    teamId: string;
  };
};

export const getBuildFormpageOnLoad = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    userId: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc("build_form_page_on_load", {
    input_data: params,
  });
  if (error) throw error;

  return data as {
    formId: string;
    groupList: TeamGroupTableRow[];
  };
};

export const getFormpageOnLoad = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    userId: string;
    isFormslyForm: boolean;
    formName: string;
    limit: number;
  }
) => {
  const { data, error } = await supabaseClient.rpc("form_page_on_load", {
    input_data: params,
  });
  if (error) throw error;

  return data as {
    teamGroupList: TeamGroupTableRow[];
    teamProjectList?: TeamProjectTableRow[];
    teamProjectListCount?: number;
  };
};

export const getCreateRequestPageOnLoad = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    formId: string;
    userId: string;
    connectedRequestFormslyId: string | null;
  }
) => {
  const { data, error } = await supabaseClient.rpc(
    "create_request_page_on_load",
    {
      input_data: params,
    }
  );
  if (error) throw error;

  return data as {
    form: FormWithResponseType;
    projectOptions?: OptionTableRow[];
    sourceProjectList?: Record<string, string>;
    requestProjectId: string;
    requestingProject?: string;
    categoryOptions?: OptionTableRow[];
    connectedRequest?: ConnectedRequestFormProps;
    departmentOptions?: OptionTableRow[];
    allProjectOptions?: OptionTableRow[];
    bankListOptions?: OptionTableRow[];
    uomOptions?: OptionTableRow[];
    equipmentCodeOptions?: OptionTableRow[];
  };
};

export const getRequest = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    request_id: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc("get_request", {
    request_id: params.request_id,
  });
  if (error) throw error;

  return data as RequestWithResponseType;
};

export const analyzeItem = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    itemName: string;
    teamId: string;
    page: number;
    limit: number;
  }
) => {
  const { limit, page, itemName } = params;

  const itemList: ResultType[] = [];
  for (let i = 0; i < limit / 5; i++) {
    const { data, error } = await supabaseClient.rpc("analyze_item", {
      input_data: {
        ...params,
        limit: 5,
        page: page + i,
      },
    });
    if (error) throw error;
    itemList.push(...(data as ResultType[]));
  }

  const { count, error: countError } = await supabaseClient
    .schema("request_schema")
    .from("request_response_table")
    .select("*, request_table!inner(*)", { count: "exact" })
    .eq("request_table.request_is_disabled", false)
    .eq("request_response_field_id", "b2c899e8-4ac7-4019-819e-d6ebcae71f41")
    .eq("request_response", `"${itemName}"`);
  if (countError) throw countError;

  return {
    data: itemList,
    count,
  };
};

export const getDashboardTopRequestor = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    formId: string;
    startDate: string;
    endDate: string;
    page: number;
    limit: number;
  }
) => {
  const { data, error } = await supabaseClient.rpc(
    "fetch_dashboard_top_requestor",
    {
      input_data: params,
    }
  );
  if (error) throw error;

  return data as DashboardRequestorAndSignerType[];
};

export const getDashboardTopSigner = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    formId: string;
    startDate: string;
    endDate: string;
    page: number;
    limit: number;
  }
) => {
  const { data, error } = await supabaseClient.rpc(
    "fetch_dashboard_top_signer",
    {
      input_data: params,
    }
  );
  if (error) throw error;

  return data as DashboardRequestorAndSignerType[];
};

export const redirectToNewTeam = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    userId: string;
    teamId: string;
    app: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc("redirect_to_new_team", {
    input_data: params,
  });
  if (error) throw error;

  return data as {
    teamMember: TeamMemberTableRow;
    formList: FormTableRow[];
  };
};

export const getTeamInvoiceOnload = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    teamDateCreated: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc("team_invoice_on_load", {
    input_data: params,
  });
  if (error) throw error;

  return data as {
    currentDate: string;
    expirationDate: string;
    price: number;
  };
};

export const getCreatePublicRequestPageOnLoad = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    formId: string;
    applicationInformationId: string;
    generalAssessmentId: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc(
    "create_public_request_page_on_load",
    {
      input_data: params,
    }
  );
  if (error) throw error;
  const formattedData = data as { form: FormWithResponseType };

  return formattedData.form;
};

export const getTeamMembershipRequestPageOnLoad = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    userId: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc(
    "get_team_membership_request_page_on_load",
    {
      input_data: params,
    }
  );
  if (error) throw error;

  return data as {
    teams: Pick<TeamTableRow, "team_id" | "team_name" | "team_logo">[];
    teamsCount: number;
    teamMembershipRequestList: TeamMembershipRequestTableRow[];
  };
};

export const getUserApplicationProgressOnLoad = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    requestId: string;
    userEmail: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc(
    "get_user_application_progress_on_load",
    {
      input_data: params,
    }
  );
  if (error) throw error;

  return data as {
    applicationInformationData: RequestViewRow;
    generalAssessmentData?: RequestViewRow;
    technicalAssessmentData?: RequestViewRow;
    hrPhoneInterviewData?: HRPhoneInterviewTableRow;
    technicalInterview1Data?: TechnicalInterviewTableRow | null;
    technicalInterview2Data?: TechnicalInterviewTableRow | null;
    tradeTestData?: TradeTestTableRow | null;
    backgroundCheckData?: BackgroundCheckTableRow | null;
    jobOfferData?: (JobOfferTableRow & AttachmentTableRow) | null;
  };
};

export const getCurrencyOptionList = async (
  supabaseClient: SupabaseClient<Database>
) => {
  const { data, error } = await supabaseClient
    .schema("lookup_schema")
    .from("currency_table")
    .select("*");
  if (error) throw error;

  return data;
};

export const getSpecialFieldTemplate = async (
  supabaseClient: SupabaseClient<Database>
) => {
  const { data, error } = await supabaseClient
    .schema("form_schema")
    .from("special_field_template_table")
    .select("*");
  if (error) throw error;

  return data;
};

export const getCurrentRequestStatus = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    requestId: string;
  }
) => {
  const { requestId } = params;

  const { data, error } = await supabaseClient
    .schema("request_schema")
    .from("request_table")
    .select("request_status")
    .eq("request_id", requestId)
    .single();
  if (error) throw error;
  if (!data.request_status) throw new Error("Invalid request ID");

  return data.request_status;
};

export const getPreferredPositionOnLoad = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    limit?: number;
    page?: number;
    search?: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc(
    "get_hr_preferred_position_on_load",
    {
      input_data: params,
    }
  );
  if (error) throw error;

  return data as { groupMemberData: PreferredPositionType[]; totalCount: 0 };
};

export const fetchPreferredHrPosition = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    memberId: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc(
    "get_hr_preferred_position_per_member_id",
    {
      input_data: params,
    }
  );
  if (error) throw error;

  return data as unknown as {
    positionData: {
      position_id: string;
      position_alias: string;
    }[];
    positionId: string[];
  };
};

export const getMemberTeamProjectList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    memberId: string;
    offset: number;
    limit: number;
  }
) => {
  const { memberId, offset, limit } = params;

  const start = offset * limit;
  const end = start + limit;

  const { data, error } = await supabaseClient
    .schema("team_schema")
    .from("team_project_member_table")
    .select(
      "team_project_id, team_project_name: team_project_id!inner(team_project_name)"
    )
    .eq("team_member_id", memberId)
    .range(start, end);
  if (error) throw error;

  const dataWithType = data as unknown as {
    team_project_id: string;
    team_project_name: { team_project_name: string };
  }[];

  const formattedData = dataWithType.map((d) => ({
    team_project_id: d.team_project_id,
    team_project_name: d.team_project_name.team_project_name,
  }));

  return formattedData;
};

export const getWorkflowPageOnLoad = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    workflowId: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("workflow_page_on_load", { input_data: params })
    .select("*");

  if (error) throw error;
  return data as unknown as {
    initialData: { initialLabel: string; initialVersion: number };
    workflowVersionId: string;
  };
};

export const getNodeInWorkflowPage = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    index: number;
    workflowVersionId: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("fetch_workflow_page_node", { input_data: params })
    .select("*");

  if (error) throw error;
  return data as BasicNodeType[];
};

export const getEdgeInWorkflowPage = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    workflowVersionId: string;
  }
) => {
  const { workflowVersionId } = params;
  const { data, error } = await supabaseClient
    .schema("workflow_schema")
    .from("edge_table")
    .select("*")
    .eq("edge_workflow_version_id", workflowVersionId);
  if (error) throw error;

  const formattedData = data.map((edge) => {
    return {
      id: edge.edge_id,
      source: edge.edge_source_node_id,
      target: edge.edge_target_node_id,
      type: "basic",
      markerEnd: {
        type: edge.edge_marker_end_type,
      },
      sourceHandle: edge.edge_source_handle,
      targetHandle: edge.edge_target_handle,
      data: {
        label: edge.edge_label,
        description: "",
        showTransitionLabel: false,
        isStartEdge: edge.edge_is_start_edge,
        isEndEdge: edge.edge_is_end_edge,
      },
      selected: false,
    };
  });

  return formattedData as unknown as BasicEdgeType[];
};

export const getWorkFlowTableOnLoad = async (
  supabaseClient: SupabaseClient,
  params: WorkflowTableParams
) => {
  const {
    search,
    page,
    limit,
    isAscendingSort,
    creatorList,
    dateRange,
    teamId,
  } = params;

  const creatorListArray = Array.isArray(creatorList)
    ? creatorList
    : [creatorList];
  const searchCondition =
    search && validate(search)
      ? `wt.workflow_id = '${search}'`
      : `wt.workflow_label::text ILIKE '%' || '${search}' || '%'`;

  const creatorCondition =
    creatorListArray.length > 0
      ? creatorListArray
          .map((value) => `tmt.team_member_role = '${value}'`)
          .join(" OR ")
      : "";

  const dateRangeCondition =
    dateRange.length === 2 && dateRange[0] && dateRange[1]
      ? `(wt.workflow_date_created BETWEEN '${new Date(
          dateRange[0]
        ).toISOString()}' AND '${new Date(dateRange[1]).toISOString()}')`
      : dateRange.length === 1 && dateRange[0]
        ? `wt.workflow_date_created = '${new Date(dateRange[0]).toISOString()}'`
        : "";

  const input = {
    page: page,
    limit: limit,
    search: searchCondition,
    isAscendingSort: isAscendingSort,
    creatorList: creatorCondition ? `AND (${creatorCondition})` : "",
    dateRange: dateRangeCondition ? `AND (${dateRangeCondition})` : "",
    teamId: teamId,
  };

  const { data, error } = await supabaseClient.rpc("workflow_table_on_load", {
    input_data: input,
  });

  if (error) {
    throw error;
  }

  return {
    workFlowData: data.workflowData || [],
    count: data.count || 0,
  };
};

export const getNodeTypesOption = async (
  supabaseClient: SupabaseClient<Database>,
  params: { activeTeam: string }
): Promise<NodeOption[]> => {
  const { activeTeam } = params;

  const { data, error } = await supabaseClient
    .schema("workflow_schema")
    .from("node_type_table")
    .select("*")
    .eq("node_type_is_disabled", false)
    .eq("node_type_team_id", activeTeam)
    .order("node_type_date_created", { ascending: false });

  if (error) {
    throw error;
  }

  const formattedData = data
    ?.filter(
      (node) =>
        node.node_type_variant !== "origin" && node.node_type_variant !== "end"
    )
    .map((node) => ({
      value: node.node_type_id,
      label: node.node_type_label,
      type: node.node_type_variant as "basic",
      presetLabel: node.node_type_label,
      presetBackgroundColor: node.node_type_background_color,
      presetTextColor: node.node_type_font_color,
      dateCreated: node.node_type_date_created,
    }));

  return formattedData || [];
};

export const getModuleRequestList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    page: number;
    limit: number;
    isAscendingSort: boolean;
    search?: string;
    requestor?: string[];
    approver?: string[];
    form?: string[];
    teamId: string;
  }
) => {
  const {
    page,
    limit,
    isAscendingSort,
    search,
    requestor,
    approver,
    teamId,
    form,
  } = params;

  const creatorListArray = Array.isArray(requestor) ? requestor : [requestor];
  const approverListArray = Array.isArray(approver) ? approver : [approver];
  const formListArray = Array.isArray(form) ? form : [form];

  const searchCondition =
    search && validate(search)
      ? `mr.module_request_id = '${search}'`
      : `mr.module_request_id::text ILIKE '%' || '${search}' || '%'`;

  const formListCondition =
    formListArray.length > 0
      ? formListArray
          .map((value) => `mr.module_request_latest_form_name = '${value}'`)
          .join(" OR ")
      : "";

  const creatorCondition =
    creatorListArray.length > 0
      ? creatorListArray
          .map((value) => `tm.team_member_role = '${value}'`)
          .join(" OR ")
      : "";

  const approverCondition =
    approverListArray.length > 0
      ? approverListArray
          .map(
            (value) =>
              `mr.module_request_latest_approver ILIKE '%' || '${value}' || '%'`
          )
          .join(" OR ")
      : "";

  const input = {
    page: page,
    limit: limit,
    isAscendingSort: isAscendingSort,
    search: searchCondition ? `AND (${searchCondition})` : "",
    form: formListCondition ? `AND (${formListCondition})` : "",
    creator: creatorCondition ? `AND (${creatorCondition})` : "",
    approver: approverCondition ? `AND (${approverCondition})` : "",
    teamId: teamId,
  };

  const { data, error } = await supabaseClient.rpc(
    "module_request_table_on_load",
    {
      input_data: input,
    }
  );

  if (error) {
    throw error;
  }

  return data as {
    ModuleRequestList: ModuleRequestList[];
    count: number;
  };
};
export const getModulePageOnLoad = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    moduleId: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("module_page_on_load", { input_data: params })
    .select("*");

  if (error) throw error;
  return data as unknown as {
    initialData: { initialLabel: string; initialVersion: number };
    moduleVersionId: string;
  };
};

export const getModulePageNode = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    moduleVersionId: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("fetch_module_page_node", { input_data: params })
    .select("*");

  if (error) throw error;
  return data;
};

export const getModuleList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    page: number;
    limit: number;
    creator: string[];
    dateRange: Date[];
    sort?: boolean;
    searchFilter?: string;
    columnAccessor?: string;
  }
) => {
  const { teamId, creator, dateRange, page, limit, sort, searchFilter } =
    params;
  const searchCondition =
    searchFilter && validate(searchFilter)
      ? `module_id = '${searchFilter}'`
      : `module_id::text ILIKE '%' || '${searchFilter}' || '%'`;

  const creatorCondition =
    creator.length > 0
      ? creator
          .map((value) => `tmtc.team_member_role = '${value}'`)
          .join(" OR ")
      : "";

  const dateRangeCondition =
    dateRange.length === 2 && dateRange[0] && dateRange[1]
      ? `(module_version_date_created BETWEEN '${new Date(
          dateRange[0]
        ).toISOString()}' AND '${new Date(dateRange[1]).toISOString()}')`
      : dateRange.length === 1 && dateRange[0]
        ? `module_version_date_created = '${new Date(dateRange[0]).toISOString()}'`
        : "";

  const { data, error } = await supabaseClient.rpc("get_module_list", {
    input_data: {
      teamId,
      page,
      limit,
      sort: sort,
      searchFilter: searchCondition,
      creator: creatorCondition ? `AND (${creatorCondition})` : "",
      dateRange: dateRangeCondition ? `AND (${dateRangeCondition})` : "",
    },
  });

  if (error) throw Error;

  return data as unknown as {
    moduleData: ModuleListType[];
    moduleCount: number;
  };
};

export const getModuleFormList = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
  }
) => {
  const { teamId } = params;

  const { data, error } = await supabaseClient.rpc("get_module_request_form", {
    input_data: {
      teamId,
    },
  });

  if (error) throw Error;

  return data as ModuleFormList[];
};

export const getFormid = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    moduleId: string;
    moduleVersionId?: string;
  }
) => {
  const { moduleId, moduleVersionId } = params;


  const { data, error } = await supabaseClient.rpc("get_module_form_on_load", {
    input_data: {
      moduleId,
      moduleVersionId,
    },
  });
  if (error) throw Error;

  return data as unknown as ModuleFormItem[];
};

export const checkFormIfExist = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    moduleRequestId: string;
    formData?: ModuleFormItem[];
  }
) => {
  const { moduleRequestId, formData } = params;

  const { data, error } = await supabaseClient.rpc("check_form_exist", {
    input_data: {
      moduleRequestId,
      formData,
    },
  });
  if (error) throw Error;

  return data as ModuleFormItem[];
};

export const getRequestId = async (
  supabaseClient: SupabaseClient<Database>,
  params: { moduleRequestId: string; nextRequest?: string }
) => {
  const { moduleRequestId, nextRequest } = params;

  const { data, error } = await supabaseClient
    .schema("request_schema")
    .from("request_table")
    .select("request_id")
    .eq("request_module_request_id", moduleRequestId)
    .order("request_date_created", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    throw error;
  }

  //   const currentRequestIndex = data.findIndex(
  //     (req) => req.request_id === nextRequest
  //   );

  //   let requestIdToLoad;
  //   if (currentRequestIndex === -1 || !nextRequest) {
  //     requestIdToLoad = data[0].request_id;
  //   } else {
  //     const nextIndex = currentRequestIndex + 1;
  //     if (nextIndex < data.length) {
  //       requestIdToLoad = data[nextIndex].request_id;
  //     } else {
  //       requestIdToLoad = data[currentRequestIndex].request_id;
  //     }
  //   }
  return data.request_id;
};

export const getTargetNode = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    requestId: string;
    currentStatus: string;
    workflowId: string;
    workflowVersionId: string;
  }
) => {
  const { requestId, currentStatus, workflowId, workflowVersionId } = params;

  const { data, error } = await supabaseClient.rpc("get_target_node", {
    input_data: {
      requestId,
      currentStatus,
      workflowId,
      workflowVersionId,
    },
  });

  if (error) {
    throw error;
  }
  return data as unknown as NodeData;
};

export const checkMemberTeamGroup = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    memberId: string;
    requestId: string;
    currentStatus: string;
    userGroupData: string[];
    signerTeamGroups: string[];
  }
) => {
  const {
    memberId,
    requestId,
    currentStatus,
    signerTeamGroups,
    userGroupData,
  } = params;

  const { data, error } = await supabaseClient.rpc("check_member_team_group", {
    input_data: {
      memberId,
      requestId,
      currentStatus,
      signerTeamGroups,
      userGroupData,
    },
  });

  if (error) {
    throw error;
  }
  return data as string[];
};

export const checkApproverGroup = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    requestId: string;
    requestStatus: string[];
  }
) => {
  const { requestId, requestStatus } = params;

  const { data, error } = await supabaseClient.rpc("check_approver_group", {
    input_data: {
      requestId,
      requestStatus,
    },
  });

  if (error) {
    throw error;
  }
  return data;
};

export const checkIfFormCreated = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    moduleRequestId: string;
    formId: string;
  }
) => {
  const { moduleRequestId, formId } = params;

  const { data, error } = await supabaseClient
    .schema("request_schema")
    .from("request_table")
    .select("*")
    .eq("request_form_id", formId)
    .eq("request_module_request_id", moduleRequestId);

  if (error) {
    throw error;
  }

  if (data.length > 0) {
    return true;
  } else {
    false;
  }
};

export const getModuleInformation = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    moduleRequestId: string;
  }
) => {
  const { moduleRequestId } = params;

  const { data, error } = await supabaseClient.rpc("view_page_on_load", {
    input_data: {
      moduleRequestId,
    },
  });

  if (error) throw error;

  return data as unknown as ModuleData;
};
