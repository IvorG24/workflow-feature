import { getRequestListByForm } from "@/backend/api/get";
import { Database } from "@/utils/database";
import { SupabaseClient } from "@supabase/supabase-js";
import useSWR from "swr";

type Params = {
  teamId: string;
  formId?: string | null;
  supabaseClient: SupabaseClient<Database>;
};

const fetcher = async (key: string, params: Params) => {
  try {
    if (!params.teamId) return;
    const { data, count } = await getRequestListByForm(params.supabaseClient, {
      teamId: params.teamId,
      formId: params.formId ? params.formId : undefined,
    });
    if (!data) throw new Error();

    const requestList = data;
    const requestListCount = count;

    return { requestList, requestListCount };
  } catch (error) {
    console.error(error);
    if (error) throw new Error("Failed to fetch request list by form");
  }
};

function useFetchRequestListByForm(params: Params) {
  const { data, error, isLoading } = useSWR(
    [
      `/api/fetchDashboardData?teamId=${params.teamId}&formId=${params.formId}`,
      params,
    ],
    ([key, params]) => fetcher(key, params)
  );

  const requestList = data ? data.requestList : [];
  const requestListCount = data ? data.requestListCount : 0;

  const requestListWithMatchingResponses = requestList.map((request) => {
    const matchingResponses = request.request_form.form_section.map(
      (section) => {
        const sectionFields = section.section_field.map((field) => {
          const filteredResponseByRequestId = field.field_response.filter(
            (response) =>
              response.request_response_request_id === request.request_id
          );

          const filteredResponseWithDateCreated =
            filteredResponseByRequestId.map((response) => ({
              ...response,
              request_response_date_purchased: request.request_date_created,
              request_response_team_member_id:
                request.request_team_member.team_member_id,
              request_response_request_status: request.request_status,
            }));

          return {
            ...field,
            field_response: filteredResponseWithDateCreated,
          };
        });

        return {
          ...section,
          section_field: sectionFields,
        };
      }
    );
    return {
      ...request,
      request_form: {
        ...request.request_form,
        form_section: matchingResponses,
      },
    };
  });

  return {
    requestList: requestListWithMatchingResponses,
    requestListCount,
    isLoading,
    isError: error,
  };
}

export default useFetchRequestListByForm;
