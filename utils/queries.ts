import { SupabaseClient } from "@supabase/supabase-js";
import {
  DndListHandleProps,
  RequestTrail,
} from "pages/teams/[teamName]/forms/build";
import {
  Database,
  RequestFieldType,
  RequestFormFactTableInsert,
  RequestFormTableInsert,
  RequestOrderTableInsert,
  TeamMemberTableInsert,
  TeamTableInsert,
  UserProfileTableInsert,
} from "./types";

export const getTeamFormTemplateNameList = async (
  supabaseClient: SupabaseClient<Database>,
  teamId: string
) => {
  try {
    const { data, error } = await supabaseClient
      .from("request_form_template_distinct_view")
      .select("form_id, form_name")
      .eq("team_id", teamId);
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
  redirectionUrl: string,
  toUserId: string,
  teamId: string | null
) => {
  try {
    const { data: data1Data, error: data1Error } = await supabaseClient
      .from("notification_table")
      .insert({
        notification_content: content,
        notification_redirection_url: redirectionUrl,
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
    const promises = [
      supabaseClient
        .from("user_profile_table")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),
      supabaseClient
        .from("team_member_table")
        .select("*", { count: "exact", head: true })
        .eq("team_member_user_id", userId),
    ];

    const [userProfile, teamList] = await Promise.all(promises);

    if (userProfile.error) throw userProfile.error;
    if (teamList.error) throw teamList.error;

    if (!userProfile.count) return false;
    if (!teamList.count) return false;

    if (userProfile.count === 0) return false;
    if (teamList.count === 0) return false;

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
      .eq("team_name", teamName);

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
  dndListHandleProps: DndListHandleProps["data"],
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
            request_field_type: item.type as RequestFieldType,
            field_is_required: false,
            field_options: null,
          })
          .select()
          .single();
      })
    );
    requestFieldList.map(({ error }) => {
      if (error) throw error;
    });

    // insert into request_order_table
    const params2: RequestOrderTableInsert = {
      order_field_id_list: requestFieldList.map(
        ({ data }) => data?.field_id as number
      ),
    };

    const { data: data2Data, error: data2Error } = await supabaseClient
      .from("request_order_table")
      .insert(params2)
      .select()
      .single();
    if (data2Error) throw data2Error;

    // insert into request_form_fact_table
    const params3: RequestFormFactTableInsert[] = requestFieldList.map(
      (field) => {
        return {
          form_fact_form_id: data1Data?.form_id as number,
          form_fact_field_id: field.data?.field_id as number,
          form_fact_order_id: data2Data?.order_id as number,
          form_fact_team_id: teamId,
          form_fact_user_id: userId,
          form_fact_request_status_id: "pending",
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
      request_order_table: data2Data,
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
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type GetTeam = Awaited<ReturnType<typeof getTeam>>;

export const getTeamMemberList = async (
  supabaseClient: SupabaseClient<Database>,
  teamName: string
) => {
  try {
    const { data, error } = await supabaseClient
      .from("team_member_view")
      .select()
      .eq("team_name", teamName);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type GetTeamMemberList = Awaited<ReturnType<typeof getTeamMemberList>>;

export const createFormApproverList = async (
  supabaseClient: SupabaseClient<Database>,
  formId: number,
  requestTrail: RequestTrail["data"]
) => {
  try {
    // insert to request_action_table
    const { data: data1Data, error: data1Error } = await supabaseClient
      .from("request_action_table")
      .insert(
        requestTrail.map((trail) => {
          return {
            action_id: trail.approverAction,
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
  formId: number
) => {
  try {
    const { data, error } = await supabaseClient
      .from("request_form_approver_view")
      .select()
      .eq("form_id", formId);

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
      .eq("team_name", teamName);

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
  formId: number;
  userId: string;
  teamId: string;
  orderId: number;
  responseList: {
    fieldId: number;
    responseValue: string;
  }[];
  requestTrail: RequestTrail["data"];
};
export const createRequest = async (
  supabaseClient: SupabaseClient<Database>,
  params: CreateRequestParams
) => {
  try {
    // insert into request_request_table
    // insert into request_response_table
    // insert into request_form_fact_table
    // insert into request_request_approver_action_table
    // insert into

    const { data: data1Data, error: data1Error } = await supabaseClient
      .from("request_request_table")
      .insert({
        request_title: params.title,
        request_description: params.description,
        request_is_draft: false,
        request_is_disabled: false,
      })
      .select()
      .single();

    if (data1Error) throw data1Error;

    const { data: data2Data, error: data2Error } = await supabaseClient
      .from("request_response_table")
      .insert(
        params.responseList.map((response) => {
          return {
            response_value: response.responseValue,
          };
        })
      )
      .select();

    if (data2Error) throw data2Error;

    const { data: data3Data, error: data3Error } = await supabaseClient
      .from("request_form_fact_table")
      .insert(
        params.responseList.map((response) => {
          return {
            form_fact_user_id: params.userId,
            form_fact_form_id: params.formId,
            form_fact_field_id: response.fieldId,
            form_fact_request_id: data1Data.request_id,
            form_fact_response_id: data2Data.find(
              (e) => e.response_id === response.fieldId
            )?.response_id as number,
            form_fact_team_id: params.teamId,
            form_fact_request_status_id: "pending",
            form_fact_order_id: params.orderId,
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
            request_approver_action_action_id: trail.approverAction,
            request_approver_action_is_approved: false,
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

export const getTeamRequestList = async (
  supabaseClient: SupabaseClient<Database>,
  teamName: string
) => {
  try {
    const { data: team, error: teamError } = await supabaseClient
      .from("team_table")
      .select("team_id")
      .eq("team_name", teamName)
      .single();

    if (teamError) throw teamError;

    const { data, error } = await supabaseClient
      .from("request_request_distinct_view")
      .select()
      .eq("team_id", team.team_id);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export type GetTeamRequestList = Awaited<ReturnType<typeof getTeamRequestList>>;

export const getRequest = async (
  supabaseClient: SupabaseClient<Database>,
  requestId: number
) => {
  try {
    const { data, error } = await supabaseClient
      .from("request_request_view")
      .select()
      .eq("request_id", requestId)
      .eq("request_is_disabled", false)
      .eq("request_is_draft", false);

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
  requestId: number
) => {
  try {
    const { data, error } = await supabaseClient
      .from("request_request_approver_action_view")
      .select()
      .eq("request_id", requestId)
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

export const approveRequest = async (
  supabaseClient: SupabaseClient<Database>,
  userId: string,
  requestId: number,
  actionId: string
) => {
  // update request_request_approver_action_table.request_approver_action_is_approved

  try {
    const { data, error } = await supabaseClient
      .from("request_request_approver_action_table")
      .update({
        request_approver_action_is_approved: true,
      })
      .eq("request_approver_action_request_id", requestId)
      .eq("request_approver_action_user_id", userId)
      .eq("request_approver_action_action_id", actionId)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
