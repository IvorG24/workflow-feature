import { SupabaseClient } from "@supabase/supabase-js";
import { toLower } from "lodash";
import {
  DndListHandleProps as BuildFormDndListHandleProps,
  RequestTrail as BuildFormRequestTrail,
} from "pages/teams/[teamName]/forms/build";
import {
  DndListHandleProps as CreateRequestDndListHandleProps,
  RequestTrail as CreateRequestTrail,
} from "pages/teams/[teamName]/requests/create";
import { removeFileList } from "./file";
import {
  CommentType,
  Database,
  NotificationType,
  RequestFormFactTableInsert,
  RequestFormTableInsert,
  RequestStatus,
  TeamMemberTableInsert,
  TeamTableInsert,
  TeamTableUpdate,
  UserProfileTableInsert,
  UserProfileTableUpdate,
} from "./types";

export type GetTeamFormTemplateListFilter = {
  keyword: string;
  isHiddenOnly: boolean;
};
export const getTeamFormTemplateList = async (
  supabaseClient: SupabaseClient<Database>,
  teamName: string,
  filter?: GetTeamFormTemplateListFilter
) => {
  try {
    let query = supabaseClient
      .from("request_form_template_distinct_view")
      .select()
      .eq("team_name", teamName);

    if (filter?.keyword) {
      // Reference: https://github.com/supabase/supabase/discussions/6778
      // if (searchText !== "") {
      //   const wordOne = searchText.trim().split(" ").at(0);
      //   const wordTwo = searchText.trim().split(" ").at(1);
      //   console.log({ wordOne, wordTwo });
      //   query = query.or(
      //     `or(first_name.ilike.%${wordOne}%,last_name.ilike.%${wordTwo}%),and(first_name.ilike.%${wordTwo}%,last_name.ilike.%${wordOne}%)`
      //   );
      // }
      // search in form_name, username
      query = query.or(
        `or(form_name.ilike.%${filter.keyword}%,username.ilike.%${filter.keyword}%)`
      );
    }
    if (filter?.isHiddenOnly) {
      query = query.eq("form_is_hidden", true);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type GetTeamFormTemplateList = Awaited<
  ReturnType<typeof getTeamFormTemplateList>
>;

export const getTeamFormTemplateNameList = async (
  supabaseClient: SupabaseClient<Database>,
  teamName: string
) => {
  try {
    const { data, error } = await supabaseClient
      .from("request_form_template_distinct_view")
      .select("form_id, form_name")
      .eq("team_name", teamName);
    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type GetTeamFormTemplateNameList = Awaited<
  ReturnType<typeof getTeamFormTemplateNameList>
>;

export const getUserProfile = async (
  supabaseClient: SupabaseClient<Database>,
  userId: string
) => {
  try {
    const { data, error } = await supabaseClient
      .from("user_profile_table")
      .select()
      .eq("user_id", userId)
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type GetUserProfile = Awaited<ReturnType<typeof getUserProfile>>;

export const getUserProfileNullable = async (
  supabaseClient: SupabaseClient<Database>,
  userId: string
) => {
  try {
    const { data, error } = await supabaseClient
      .from("user_profile_table")
      .select()
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type GetUserProfileNullable = Awaited<
  ReturnType<typeof getUserProfileNullable>
>;

export const getUserProfileByUsername = async (
  supabaseClient: SupabaseClient<Database>,
  username: string
) => {
  try {
    const { data, error } = await supabaseClient
      .from("user_profile_table")
      .select()
      .eq("username", username)
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type GetUserProfileByUsername = Awaited<
  ReturnType<typeof getUserProfileByUsername>
>;

export const createUserProfile = async (
  supabaseClient: SupabaseClient<Database>,
  params: UserProfileTableInsert
) => {
  try {
    params.username = toLower(params.username);
    const { data, error } = await supabaseClient
      .from("user_profile_table")
      .insert(params)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type CreateUserProfile = Awaited<ReturnType<typeof createUserProfile>>;

export const createTeam = async (
  supabaseClient: SupabaseClient<Database>,
  params: TeamTableInsert,
  createdBy: string
) => {
  // insert to team table
  // insert to team member table
  try {
    params.team_name = toLower(params.team_name);
    const { data: data1Data, error: data1Error } = await supabaseClient
      .from("team_table")
      .insert(params)
      .select()
      .single();
    if (data1Error) throw data1Error;

    const { data: data2Data, error: data2Error } = await supabaseClient
      .from("team_member_table")
      .insert({
        team_member_team_id: data1Data?.team_id,
        team_member_user_id: createdBy,
        team_member_member_role_id: "owner",
      })
      .select()
      .single();
    if (data2Error) throw data2Error;

    return {
      team_table: data1Data,
      team_member_table: data2Data,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type CreateTeam = Awaited<ReturnType<typeof createTeam>>;

export const addTeamMember = async (
  supabaseClient: SupabaseClient<Database>,
  params: TeamMemberTableInsert
) => {
  try {
    const { data, error } = await supabaseClient
      .from("team_member_table")
      .insert(params)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type AddTeamMember = Awaited<ReturnType<typeof addTeamMember>>;

export const inviteUserToTeam = async (
  supabaseClient: SupabaseClient<Database>,
  fromUserId: string,
  toUserEmail: string,
  teamId: string
) => {
  try {
    const { data: data1Data, error: data1Error } = await supabaseClient
      .from("invitation_table")
      .insert({
        invitation_target_email: toUserEmail,
      })
      .select()
      .single();
    if (data1Error) throw data1Error;

    const { data: data2Data, error: data2Error } = await supabaseClient
      .from("team_invitation_table")
      .insert({
        team_invitation_created_by: fromUserId,
        team_invitation_team_id: teamId,
        team_invitation_invitation_id: data1Data?.invitation_id,
      })
      .select()
      .single();
    if (data2Error) throw data2Error;

    return {
      invitation_table: data1Data,
      team_invitation_table: data2Data,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type InviteUserToTeam = Awaited<ReturnType<typeof inviteUserToTeam>>;

export const createNotification = async (
  supabaseClient: SupabaseClient<Database>,
  content: string,
  redirectionUrl: string | null,
  toUserId: string,
  teamId: string | null,
  notificationType: NotificationType
) => {
  try {
    const { data: data1Data, error: data1Error } = await supabaseClient
      .from("notification_table")
      .insert({
        notification_content: content,
        notification_redirect_url: redirectionUrl,
      })
      .select()
      .single();
    if (data1Error) throw data1Error;

    const { data: data2Data, error: data2Error } = await supabaseClient
      .from("team_user_notification_table")
      .insert({
        team_user_notification_team_id: teamId,
        team_user_notification_user_id: toUserId,
        team_user_notification_notification_id: data1Data?.notification_id,
        team_user_notification_type_id: notificationType,
      })
      .select()
      .single();
    if (data2Error) throw data2Error;

    return {
      notification_table: data1Data,
      team_user_notification_table: data2Data,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type CreateNotification = Awaited<ReturnType<typeof createNotification>>;

export const getUserTeamList = async (
  supabaseClient: SupabaseClient<Database>,
  userId: string
) => {
  try {
    const { data, error } = await supabaseClient
      .from("team_member_view")
      .select()
      .eq("team_member_user_id", userId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type GetUserTeamList = Awaited<ReturnType<typeof getUserTeamList>>;

export const isUserOnboarded = async (
  supabaseClient: SupabaseClient<Database>,
  userId: string
) => {
  try {
    const { data: userProfileData, error: userProfileError } =
      await supabaseClient
        .from("user_profile_table")
        .select()
        .eq("user_id", userId)
        .maybeSingle();

    const { data: teamListData, error: teamListError } = await supabaseClient
      .from("team_member_table")
      .select()
      .eq("team_member_user_id", userId)
      .limit(1)
      .maybeSingle();

    if (userProfileError) throw userProfileError;
    if (teamListError) throw teamListError;

    if (!userProfileData) return false;
    if (!teamListData) return false;

    return true;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type IsUserOnboarded = Awaited<ReturnType<typeof isUserOnboarded>>;

export const getTeamFormList = async (
  supabaseClient: SupabaseClient<Database>,
  teamName: string
) => {
  try {
    const { data, error } = await supabaseClient
      .from("request_form_template_distinct_view")
      .select("form_id, form_name")
      .eq("team_name", teamName)
      .is("form_is_hidden", false);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type GetTeamFormList = Awaited<ReturnType<typeof getTeamFormList>>;

export const createForm = async (
  supabaseClient: SupabaseClient<Database>,
  params: RequestFormTableInsert,
  dndListHandleProps: BuildFormDndListHandleProps["data"],
  teamId: string,
  userId: string
) => {
  // insert into the following:
  // request_form_table
  // request_field_table
  // request_order_table
  // request_form_fact_table

  try {
    // insert into request_form_table
    const { data: data1Data, error: data1Error } = await supabaseClient
      .from("request_form_table")
      .insert(params)
      .select()
      .single();
    if (data1Error) throw data1Error;

    // insert into request_field_table
    const requestFieldList = await Promise.all(
      dndListHandleProps.map((item) => {
        return supabaseClient
          .from("request_field_table")
          .insert({
            field_name: item.label,
            field_is_required: !!item.isRequired,
            field_tooltip: item?.tooltip || null,
            field_option_list: item.optionList,
            field_option_tooltip_list: item.optionTooltipList,
          })
          .select()
          .single();
      })
    );
    requestFieldList.map(({ error }) => {
      if (error) throw error;
    });

    // insert into request_form_fact_table
    const params3: RequestFormFactTableInsert[] = requestFieldList.map(
      (field, index) => {
        return {
          form_fact_form_id: data1Data?.form_id as string,
          form_fact_field_id: field.data?.field_id as string,
          form_fact_team_id: teamId,
          form_fact_user_id: userId,
          form_fact_request_status_id: "pending",
          form_fact_order_number: index + 1,
          form_fact_field_type_id: dndListHandleProps[index].type,
        };
      }
    );

    const { data: data3Data, error: data3Error } = await supabaseClient
      .from("request_form_fact_table")
      .insert(params3)
      .select();

    if (data3Error) throw data3Error;

    return {
      request_form_table: data1Data,
      request_field_table: requestFieldList.map(({ data }) => data),
      request_form_fact_table: data3Data || [],
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type CreateForm = Awaited<ReturnType<typeof createForm>>;

export const getTeam = async (
  supabaseClient: SupabaseClient<Database>,
  teamName: string
) => {
  try {
    const { data, error } = await supabaseClient
      .from("team_table")
      .select()
      .eq("team_name", teamName)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type GetTeam = Awaited<ReturnType<typeof getTeam>>;

export type GetTeamMemberListFilter = {
  keyword?: string;
  isAdminOnly?: boolean;
};
export const getTeamMemberList = async (
  supabaseClient: SupabaseClient<Database>,
  teamName: string,
  filter?: GetTeamMemberListFilter
) => {
  try {
    let query = supabaseClient
      .from("team_member_view")
      .select()
      .eq("team_name", teamName)
      .is("team_member_disabled", false);

    const { keyword, isAdminOnly } = filter || {};

    if (keyword) {
      // Reference: https://github.com/supabase/supabase/discussions/6778
      // if (searchText !== "") {
      //   const wordOne = searchText.trim().split(" ").at(0);
      //   const wordTwo = searchText.trim().split(" ").at(1);
      //   console.log({ wordOne, wordTwo });
      //   query = query.or(
      //     `or(first_name.ilike.%${wordOne}%,last_name.ilike.%${wordTwo}%),and(first_name.ilike.%${wordTwo}%,last_name.ilike.%${wordOne}%)`
      //   );
      // }
      // Search in username, user_first_name, user_last_name, email,
      query = query.or(
        `or(user_first_name.ilike.%${keyword}%,user_last_name.ilike.%${keyword}%,username.ilike.%${keyword}%,user_email.ilike.%${keyword}%)`
      );
    }
    if (isAdminOnly) {
      // only team_member_member_role_id === "owner" or "admin"
      query = query.or(
        `or(team_member_member_role_id.eq.owner,team_member_member_role_id.eq.admin)`
      );
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type GetTeamMemberList = Awaited<ReturnType<typeof getTeamMemberList>>;

export const getTeamMember = async (
  supabaseClient: SupabaseClient<Database>,
  teamName: string,
  userId: string
) => {
  try {
    const { data, error } = await supabaseClient
      .from("team_member_view")
      .select()
      .eq("team_name", teamName)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type GetTeamMember = Awaited<ReturnType<typeof getTeamMember>>;

export const createFormApproverList = async (
  supabaseClient: SupabaseClient<Database>,
  formId: string,
  requestTrail: BuildFormRequestTrail["data"],
  primaryApproverId: string
) => {
  try {
    // insert to request_action_table
    const { data: data1Data, error: data1Error } = await supabaseClient
      .from("request_action_table")
      .insert(
        requestTrail.map((trail) => {
          return {
            action_name: trail.approverActionName,
          };
        })
      )
      .select();

    if (data1Error) throw data1Error;

    // insert to request_form_approver_table
    const { data: data2Data, error: data2Error } = await supabaseClient
      .from("request_form_approver_table")
      .insert(
        requestTrail.map((trail, index) => {
          return {
            form_approver_form_id: formId,
            form_approver_user_id: trail.approverId,
            form_approver_action_id: data1Data[index].action_id,
            form_approver_is_primary_approver:
              trail.approverId === primaryApproverId,
          };
        })
      )
      .select();

    if (data2Error) throw data2Error;

    return {
      request_action_table: data1Data || [],
      request_form_approver_table: data2Data || [],
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type createFormApproverList = Awaited<
  ReturnType<typeof createFormApproverList>
>;

export const getFormApproverList = async (
  supabaseClient: SupabaseClient<Database>,
  formId: string
) => {
  try {
    const { data, error } = await supabaseClient
      .from("request_form_approver_view")
      .select()
      .eq("form_id", formId)
      .is("form_approver_is_disabled", false);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type GetFormApproverList = Awaited<
  ReturnType<typeof getFormApproverList>
>;

export const getFormByTeamAndFormName = async (
  supabaseClient: SupabaseClient<Database>,
  teamName: string,
  formName: string
) => {
  try {
    const { data, error } = await supabaseClient
      .from("request_form_template_view")
      .select()
      .eq("form_name", formName)
      .eq("team_name", teamName)
      .order("form_fact_order_number", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type GetFormByTeamAndFormName = Awaited<
  ReturnType<typeof getFormByTeamAndFormName>
>;

export type CreateRequestParams = {
  title: string;
  description: string;
  formId: string;
  userId: string;
  teamId: string;
  dndList: CreateRequestDndListHandleProps["data"];
  requestTrail: CreateRequestTrail["data"];
  primaryApproverId: string;
  filepathList?: string[];
};
export const createRequest = async (
  supabaseClient: SupabaseClient<Database>,
  params: CreateRequestParams
) => {
  try {
    const { data: data1Data, error: data1Error } = await supabaseClient
      .from("request_request_table")
      .insert({
        request_title: params.title,
        request_description: params.description,
        request_is_draft: false,
        request_is_disabled: false,
        request_attachment_filepath_list: params.filepathList || null,
      })
      .select()
      .single();

    if (data1Error) throw data1Error;

    const { data: data2Data, error: data2Error } = await supabaseClient
      .from("request_response_table")
      .insert(
        params.dndList.map((item) => {
          return {
            response_value: item.value,
          };
        })
      )
      .select();

    if (data2Error) throw data2Error;

    const { data: data3Data, error: data3Error } = await supabaseClient
      .from("request_form_fact_table")
      .insert(
        params.dndList.map((item, index) => {
          return {
            form_fact_user_id: params.userId,
            form_fact_form_id: params.formId,
            form_fact_field_id: item.duplicatedId ? item.duplicatedId : item.id,
            form_fact_request_id: data1Data.request_id,
            form_fact_response_id: data2Data[index].response_id,
            form_fact_team_id: params.teamId,
            form_fact_request_status_id: "pending",
            form_fact_order_number: index + 1,
            form_fact_field_type_id: params.dndList[index].type,
          };
        })
      );

    if (data3Error) throw data3Error;

    // insert into request_request_approver_action_table

    const { data: data4Data, error: data4Error } = await supabaseClient
      .from("request_request_approver_action_table")
      .insert(
        params.requestTrail.map((trail) => {
          return {
            request_approver_action_request_id: data1Data.request_id,
            request_approver_action_user_id: trail.approverId,
            request_approver_action_action_id: trail.approverActionId,
            request_approver_action_is_primary_approver:
              trail.approverId === params.primaryApproverId,
          };
        })
      );

    if (data4Error) throw data4Error;

    return {
      request_request_table: data1Data || [],
      request_response_table: data2Data || [],
      request_form_fact_table: data3Data || [],
      request_request_approver_action_table: data4Data || [],
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type CreateRequest = Awaited<ReturnType<typeof createRequest>>;

export const GET_REQUEST_LIST_LIMIT = 20;
export type GetTeamRequestListFilter = {
  keyword?: string;
  mainStatus?: RequestStatus | "canceled" | null;
  requesterUserId?: string;
  approverUserId?: string;
  sort?: "asc" | "desc";
  range?: [number, number];
};
export const getTeamRequestList = async (
  supabaseClient: SupabaseClient<Database>,
  teamName: string,
  filter?: GetTeamRequestListFilter
) => {
  try {
    const { data: team, error: teamError } = await supabaseClient
      .from("team_table")
      .select("team_id")
      .eq("team_name", teamName)
      .single();

    if (teamError) throw teamError;

    let query = supabaseClient
      .from("request_request_distinct_view")
      .select()
      .eq("team_id", team.team_id);

    if (filter?.keyword) {
      // Reference: https://github.com/supabase/supabase/discussions/6778
      // if (searchText !== "") {
      //   const wordOne = searchText.trim().split(" ").at(0);
      //   const wordTwo = searchText.trim().split(" ").at(1);
      //   console.log({ wordOne, wordTwo });
      //   query = query.or(
      //     `or(first_name.ilike.%${wordOne}%,last_name.ilike.%${wordTwo}%),and(first_name.ilike.%${wordTwo}%,last_name.ilike.%${wordOne}%)`
      //   );
      // }
      // search in request_title, request_description
      query = query.or(
        `request_title.ilike.%${filter.keyword}%,request_description.ilike.%${filter.keyword}%`
      );
    }
    if (filter?.mainStatus) {
      query = query.eq("form_fact_request_status_id", filter.mainStatus);
      query = query.is("request_is_canceled", false);
    }
    if (filter?.requesterUserId) {
      query = query.eq("user_id", filter.requesterUserId);
    }

    query = query.is("request_is_disabled", false);

    if (filter?.range) {
      query = query.range(filter.range[0], filter.range[1]);
    } else {
      query = query.range(0, GET_REQUEST_LIST_LIMIT);
    }
    // if (filter?.sort) {
    query = query.order("request_date_created", {
      ascending: filter?.sort === "asc" ? true : false,
    });
    // }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type GetTeamRequestList = Awaited<ReturnType<typeof getTeamRequestList>>;

export type GetTeamRequestListCountFilter = {
  keyword?: string;
  mainStatus?: RequestStatus | "canceled" | null;
  requesterUserId?: string;
  approverUserId?: string;
  sort?: "asc" | "desc";
  range?: [number, number];
};
export const getTeamRequestListCount = async (
  supabaseClient: SupabaseClient<Database>,
  teamName: string,
  filter?: GetTeamRequestListCountFilter
) => {
  try {
    const { data: team, error: teamError } = await supabaseClient
      .from("team_table")
      .select("team_id")
      .eq("team_name", teamName)
      .single();

    if (teamError) throw teamError;

    let query = supabaseClient
      .from("request_request_distinct_view")
      .select("*", { count: "exact", head: true })
      .eq("team_id", team.team_id);

    if (filter?.keyword) {
      // Reference: https://github.com/supabase/supabase/discussions/6778
      // if (searchText !== "") {
      //   const wordOne = searchText.trim().split(" ").at(0);
      //   const wordTwo = searchText.trim().split(" ").at(1);
      //   console.log({ wordOne, wordTwo });
      //   query = query.or(
      //     `or(first_name.ilike.%${wordOne}%,last_name.ilike.%${wordTwo}%),and(first_name.ilike.%${wordTwo}%,last_name.ilike.%${wordOne}%)`
      //   );
      // }
      // search in request_title, request_description
      query = query.or(
        `request_title.ilike.%${filter.keyword}%,request_description.ilike.%${filter.keyword}%`
      );
    }
    if (filter?.mainStatus) {
      query = query.eq("form_fact_request_status_id", filter.mainStatus);
      query = query.is("request_is_canceled", false);
    }
    if (filter?.requesterUserId) {
      query = query.eq("user_id", filter.requesterUserId);
    }

    query = query.is("request_is_disabled", false);

    const { count, error } = await query;

    if (error) throw error;

    return count || 0;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type GetTeamRequestListCount = Awaited<
  ReturnType<typeof getTeamRequestListCount>
>;

export const getRequest = async (
  supabaseClient: SupabaseClient<Database>,
  requestId: string
) => {
  try {
    const { data, error } = await supabaseClient
      .from("request_request_view")
      .select()
      .eq("request_id", requestId)
      .eq("request_is_disabled", false)
      .eq("request_is_draft", false)
      .order("form_fact_order_number", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type GetRequest = Awaited<ReturnType<typeof getRequest>>;

export const getRequestApproverList = async (
  supabaseClient: SupabaseClient<Database>,
  requestIdList: string[]
) => {
  try {
    const { data, error } = await supabaseClient
      .from("request_request_approver_action_view")
      .select()
      .in("request_id", requestIdList)
      .eq("request_is_disabled", false)
      .eq("request_is_draft", false);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type GetRequestApproverList = Awaited<
  ReturnType<typeof getRequestApproverList>
>;

export const updateRequestStatus = async (
  supabaseClient: SupabaseClient<Database>,
  userId: string,
  requestId: string,
  actionId: string,
  newStatus: RequestStatus,
  isUpdatedByPrimaryApprover: boolean,
  updateStatusComment: string | null
) => {
  try {
    const { data: serverDate, error: serverDateError } = await supabaseClient
      .rpc("get_current_date")
      .select()
      .single();

    if (serverDateError) throw serverDateError;

    const { data: approverActionTableData, error } = await supabaseClient
      .from("request_request_approver_action_table")
      .update({
        request_approver_action_status_id: newStatus,
        request_approver_action_status_last_updated: serverDate,
        request_approver_action_status_update_comment: updateStatusComment,
      })
      .eq("request_approver_action_request_id", requestId)
      .eq("request_approver_action_user_id", userId)
      .eq("request_approver_action_action_id", actionId)
      .select()
      .single();

    if (error) throw error;

    if (isUpdatedByPrimaryApprover) {
      const { data: formFactTableData, error } = await supabaseClient
        .from("request_form_fact_table")
        .update({
          form_fact_request_status_id: newStatus,
        })
        .eq("form_fact_request_id", requestId)
        .select();

      if (error) throw error;

      return { formFactTableData, approverActionTableData };
    }

    return { approverActionTableData };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type UpdateRequestStatus = Awaited<
  ReturnType<typeof updateRequestStatus>
>;

export const updateRequestCancelStatus = async (
  supabaseClient: SupabaseClient<Database>,
  requestId: string,
  isCanceled: boolean
) => {
  try {
    const { data, error } = await supabaseClient
      .from("request_request_table")
      .update({
        request_is_canceled: isCanceled,
      })
      .eq("request_id", requestId)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type UpdateRequestCancelStatus = Awaited<
  ReturnType<typeof updateRequestCancelStatus>
>;

export const updateForm = async (
  supabaseClient: SupabaseClient<Database>,
  dndListHandleProps: BuildFormDndListHandleProps["data"]
  // teamId: string,
  // userId: string
) => {
  // update into request_field_table: field_tooltip, field_option_list, field_option_tooltip_list.
  // use promise.all to update all fields at once in request_field_table.
  // update into request_form_fact_table: form_fact_order_number.
  // use promise.all to update all fields at once in request_form_fact_table.

  try {
    const updateFieldTooltipPromiseList = dndListHandleProps.map((item) => {
      return supabaseClient
        .from("request_field_table")
        .update({
          field_tooltip: item.tooltip,
          field_option_list: item.optionList,
          field_option_tooltip_list: item.optionTooltipList,
          field_is_required: item.isRequired,
        })
        .eq("field_id", item.id)
        .select()
        .single();
    });

    const updateFieldTooltipResult = await Promise.all(
      updateFieldTooltipPromiseList
    );

    const updateFormFactOrderNumberPromiseList = dndListHandleProps.map(
      (item, index) => {
        return supabaseClient
          .from("request_form_fact_table")
          .update({
            form_fact_order_number: index,
          })
          .eq("form_fact_field_id", item.id)
          .select()
          .single();
      }
    );

    const updateFormFactOrderNumberResult = await Promise.all(
      updateFormFactOrderNumberPromiseList
    );

    return {
      updateFieldTooltipResult,
      updateFormFactOrderNumberResult,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type UpdateForm = Awaited<ReturnType<typeof updateForm>>;

// * Archived
// export const updateFormApproverList = async (
//   supabaseClient: SupabaseClient<Database>,
//   formId: string,
//   requestTrail: BuildFormRequestTrail["data"],
//   primaryApproverId: string
// ) => {
//   try {
//     // disable current approvers from request_form_approver_table  of the form.
//     const { data: data0Data, error: data0Error } = await supabaseClient
//       .from("request_form_approver_table")
//       .update({
//         form_approver_is_disabled: true,
//       })
//       .eq("form_approver_form_id", formId)
//       .select();

//     if (data0Error) throw data0Error;

//     // * Add new approvers

//     // insert to request_action_table
//     const { data: data1Data, error: data1Error } = await supabaseClient
//       .from("request_action_table")
//       .insert(
//         requestTrail.map((trail) => {
//           return {
//             action_name: trail.approverActionName,
//           };
//         })
//       )
//       .select();

//     if (data1Error) throw data1Error;

//     // insert to request_form_approver_table
//     const { data: data2Data, error: data2Error } = await supabaseClient
//       .from("request_form_approver_table")
//       .insert(
//         requestTrail.map((trail, index) => {
//           return {
//             form_approver_form_id: formId,
//             form_approver_user_id: trail.approverId,
//             form_approver_action_id: data1Data[index].action_id,
//             form_approver_is_primary_approver:
//               trail.approverId === primaryApproverId,
//           };
//         })
//       )
//       .select();

//     if (data2Error) throw data2Error;

//     return {
//       request_action_table: data1Data || [],
//       request_form_approver_table: data2Data || [],
//     };
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// };
// export type UpdateFormApproverList = Awaited<
//   ReturnType<typeof updateFormApproverList>
// >;

export const addComment = async (
  supabaseClient: SupabaseClient<Database>,
  requestId: string,
  userId: string,
  comment: string | null,
  commentType: CommentType,
  attachmentFilepathList: string[] | null
) => {
  try {
    const { data: data0Data, error: data0Error } = await supabaseClient
      .from("request_comment_table")
      .insert({
        comment_content: comment || "",
        comment_type_id: commentType,
        comment_attachment_filepath_list: attachmentFilepathList,
      })
      .select();

    if (data0Error) throw data0Error;

    const { data: data1Data, error: data1Error } = await supabaseClient
      .from("request_request_user_comment_table")
      .insert({
        user_request_comment_user_id: userId,
        user_request_comment_request_id: requestId,
        user_request_comment_comment_id: data0Data[0].comment_id,
      })
      .select();

    if (data1Error) throw data1Error;

    return {
      request_comment_table: data0Data || [],
      request_request_user_comment_table: data1Data || [],
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type AddComment = Awaited<ReturnType<typeof addComment>>;

export const editComment = async (
  supabaseClient: SupabaseClient<Database>,
  commentId: string,
  comment: string
) => {
  try {
    const {
      data: currentDatabaseServerDate,
      error: currentDatabaseServerDateError,
    } = await supabaseClient.rpc("get_current_date").select().single();

    if (currentDatabaseServerDateError) throw currentDatabaseServerDateError;

    // TODO: How will updating the comment attachment list happen here?
    const { data, error } = await supabaseClient
      .from("request_comment_table")
      .update({
        comment_content: comment,
        comment_is_edited: true,
        comment_last_updated: currentDatabaseServerDate,
      })
      .eq("comment_id", commentId)
      .select();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type EditComment = Awaited<ReturnType<typeof editComment>>;

export const updateCommentAttachmentList = async (
  supabaseClient: SupabaseClient<Database>,
  commentId: string,
  attachmentList: string[]
) => {
  try {
    // get current comment attachment list
    const {
      data: currentCommentAttachmentListData,
      error: currentCommentAttachmentListError,
    } = await supabaseClient
      .from("request_comment_table")
      .select("comment_attachment_filepath_list")
      .eq("comment_id", commentId)
      .single();

    if (currentCommentAttachmentListError)
      throw currentCommentAttachmentListError;

    // remove current attachment list
    await removeFileList(
      supabaseClient,
      currentCommentAttachmentListData.comment_attachment_filepath_list || [],
      "comment_attachments"
    );

    // update comment attachment list
    const { data, error } = await supabaseClient
      .from("request_comment_table")
      .update({
        comment_attachment_filepath_list: attachmentList,
      })
      .eq("comment_id", commentId)
      .select();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type UpdateCommentAttachmentList = Awaited<
  ReturnType<typeof updateCommentAttachmentList>
>;

export const disableComment = async (
  supabaseClient: SupabaseClient<Database>,
  commentId: string
) => {
  try {
    const {
      data: currentDatabaseServerDate,
      error: currentDatabaseServerDateError,
    } = await supabaseClient.rpc("get_current_date").select().single();

    if (currentDatabaseServerDateError) throw currentDatabaseServerDateError;

    const { data, error } = await supabaseClient
      .from("request_comment_table")
      .update({
        comment_is_disabled: true,
        comment_last_updated: currentDatabaseServerDate,
      })
      .eq("comment_id", commentId)
      .select();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type DisableComment = Awaited<ReturnType<typeof disableComment>>;

export const getCommentList = async (
  supabaseClient: SupabaseClient<Database>,
  requestId: string
) => {
  try {
    const { data, error } = await supabaseClient
      .from("request_request_user_comment_view")
      .select()
      .eq("request_id", requestId)
      .is("comment_is_disabled", false);

    if (error) throw error;

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type GetCommentList = Awaited<ReturnType<typeof getCommentList>>;

export const deleteComment = async (
  supabaseClient: SupabaseClient<Database>,
  commentId: string
) => {
  try {
    const { data, error } = await supabaseClient
      .from("request_comment_table")
      .update({ comment_is_disabled: true })
      .eq("comment_id", commentId)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type DeleteComment = Awaited<ReturnType<typeof deleteComment>>;

export const isUsernameExisting = async (
  supabaseClient: SupabaseClient<Database>,
  username: string
) => {
  try {
    const { data, error } = await supabaseClient
      .from("user_profile_table")
      .select()
      .eq("username", username)
      .maybeSingle();

    if (error) throw error;

    return !!data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type IsUsernameExisting = Awaited<ReturnType<typeof isUsernameExisting>>;

export const isTeamNameExisting = async (
  supabaseClient: SupabaseClient<Database>,
  teamName: string
) => {
  try {
    const { data, error } = await supabaseClient
      .from("team_table")
      .select()
      .ilike("team_name", teamName)
      .maybeSingle();

    if (error) throw error;

    return !!data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type IsTeamNameExisting = Awaited<ReturnType<typeof isTeamNameExisting>>;

export const isEmailExisting = async (
  supabaseClient: SupabaseClient<Database>,
  email: string
) => {
  try {
    const { data, error } = await supabaseClient
      .from("user_profile_table")
      .select()
      .eq("email", email)
      .maybeSingle();

    if (error) throw error;

    return !!data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type IsEmailExisting = Awaited<ReturnType<typeof isEmailExisting>>;

export const isFormNameExisting = async (
  supabaseClient: SupabaseClient<Database>,
  formName: string
) => {
  try {
    const { data, error } = await supabaseClient
      .from("form_table")
      .select()
      .ilike("form_name", formName)
      .maybeSingle();

    if (error) throw error;

    return !!data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type IsFormNameExisting = Awaited<ReturnType<typeof isFormNameExisting>>;

export const transferTeamOwnership = async (
  supabaseClient: SupabaseClient<Database>,
  fromUserId: string,
  toUserId: string,
  teamId: string
) => {
  try {
    const { data: updateMemberData, error: updateMemberError } =
      await supabaseClient
        .from("team_member_table")
        .update({
          team_member_member_role_id: "owner",
        })
        .eq("team_member_user_id", toUserId)
        .eq("team_member_team_id", teamId)
        .select()
        .single();

    if (updateMemberError) throw updateMemberError;

    const { data: updateOwnerData, error: updateOwnerError } =
      await supabaseClient
        .from("team_member_table")
        .update({
          team_member_member_role_id: "admin",
        })
        .eq("team_member_user_id", fromUserId)
        .eq("team_member_team_id", teamId)
        .select()
        .single();

    if (updateOwnerError) throw updateOwnerError;

    return {
      updateMemberData,
      updateOwnerData,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type TransferTeamOwnership = Awaited<
  ReturnType<typeof transferTeamOwnership>
>;

export const removeTeamMember = async (
  supabaseClient: SupabaseClient<Database>,
  userId: string,
  teamId: string
) => {
  try {
    const { data, error } = await supabaseClient
      .from("team_member_table")
      .update({
        team_member_disabled: true,
      })
      .eq("team_member_user_id", userId)
      .eq("team_member_team_id", teamId)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type RemoveTeamMember = Awaited<ReturnType<typeof removeTeamMember>>;

export const updateTeamMemberRole = async (
  supabaseClient: SupabaseClient<Database>,
  userId: string,
  teamId: string,
  teamMemberRoleId: string
) => {
  try {
    const { data, error } = await supabaseClient
      .from("team_member_table")
      .update({
        team_member_member_role_id: teamMemberRoleId,
      })
      .eq("team_member_user_id", userId)
      .eq("team_member_team_id", teamId)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type UpdateTeamMemberRole = Awaited<
  ReturnType<typeof updateTeamMemberRole>
>;

export const updateFormTemplateVisbility = async (
  supabaseClient: SupabaseClient<Database>,
  formTemplateId: string,
  isHidden: boolean
) => {
  try {
    const { data, error } = await supabaseClient
      .from("request_form_table")
      .update({
        form_is_hidden: isHidden,
      })
      .eq("form_id", formTemplateId)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type UpdateFormTemplateVisbility = Awaited<
  ReturnType<typeof updateFormTemplateVisbility>
>;

export const isRequestCanceled = async (
  supabaseClient: SupabaseClient<Database>,
  requestId: string
) => {
  try {
    const { data, error } = await supabaseClient
      .from("request_request_table")
      .select()
      .eq("request_id", requestId)
      .is("request_is_disabled", false)
      .is("request_is_canceled", true)
      .maybeSingle();

    if (error) throw error;

    return !!data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type IsRequestCanceled = Awaited<ReturnType<typeof isRequestCanceled>>;

export const GET_NOTIFICATION_LIST_LIMIT = 15;
export type GetNotificationListFilter = {
  notificationType?: NotificationType;
  keyword?: string;
  teamName?: string;
  isUnreadOnly?: boolean;
  sort?: "asc" | "desc";
  range?: [number, number];
};
export const getNotificationList = async (
  supabaseClient: SupabaseClient<Database>,
  userId: string,
  filter: GetNotificationListFilter = {}
) => {
  try {
    const { notificationType, keyword, teamName, isUnreadOnly, sort, range } =
      filter;

    let queryCount = supabaseClient
      .from("team_user_notification_view")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    let query = supabaseClient
      .from("team_user_notification_view")
      .select()
      .eq("user_id", userId);

    if (teamName) {
      query = query.eq("team_name", teamName);
      queryCount = queryCount.eq("team_name", teamName);
    }

    if (notificationType) {
      query = query.eq("team_user_notification_type_id", notificationType);
      queryCount = queryCount.eq(
        "team_user_notification_type_id",
        notificationType
      );
    }

    if (keyword) {
      query = query.ilike("notification_content", `%${keyword}%`);
      queryCount = queryCount.ilike("notification_content", `%${keyword}%`);
    }

    if (isUnreadOnly) {
      query = query.is("notification_is_read", false);
      queryCount = queryCount.is("notification_is_read", false);
    }

    if (sort) {
      query = query.order("notification_date_created", {
        ascending: sort === "asc",
      });
    }

    if (range) {
      query = query.range(range[0], range[1]);
    } else {
      query = query.range(0, GET_NOTIFICATION_LIST_LIMIT - 1);
    }

    const [queryResult, queryCountResult] = await Promise.all([
      query,
      queryCount,
    ]);

    const { data, error } = queryResult;
    const { count, error: countError } = queryCountResult;

    if (error) throw error;
    if (countError) throw countError;

    return {
      data: data || [],
      count: count || 0,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type GetNotificationList = Awaited<
  ReturnType<typeof getNotificationList>
>;

export const readNotification = async (
  supabaseClient: SupabaseClient<Database>,
  notificationId: string
) => {
  try {
    const { data, error } = await supabaseClient
      .from("notification_table")
      .update({
        notification_is_read: true,
      })
      .eq("notification_id", notificationId)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type ReadNotification = Awaited<ReturnType<typeof readNotification>>;

// create getTeamInvitation function
export const getTeamInvitation = async (
  supabaseClient: SupabaseClient<Database>,
  teamInvitationId: string
) => {
  try {
    const { data, error } = await supabaseClient
      .from("team_invitation_view")
      .select()
      .eq("team_invitation_id", teamInvitationId)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type GetTeamInvitation = Awaited<ReturnType<typeof getTeamInvitation>>;

export const updateUserProfile = async (
  supabaseClient: SupabaseClient<Database>,
  params: UserProfileTableUpdate,
  userId: string
) => {
  try {
    params.username = params.username?.trim().toLowerCase();
    const { data, error } = await supabaseClient
      .from("user_profile_table")
      .update(params)
      .eq("user_id", userId);

    if (error) throw error;

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type UpdateUserProfile = Awaited<ReturnType<typeof updateUserProfile>>;

// create function updateTeam

export const updateTeam = async (
  supabaseClient: SupabaseClient<Database>,
  params: TeamTableUpdate,
  teamId: string
) => {
  try {
    params.team_name = params.team_name?.trim().toLowerCase();
    const { data, error } = await supabaseClient
      .from("team_table")
      .update(params)
      .eq("team_id", teamId);

    if (error) throw error;

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export type UpdateTeam = Awaited<ReturnType<typeof updateTeam>>;
