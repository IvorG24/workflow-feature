import { getRequestListByForm } from "@/backend/api/get";
import { Database } from "@/utils/database";
import { SupabaseClient } from "@supabase/supabase-js";
import useSWR from "swr";

type Params = {
  teamId: string;
  formId?: string | null;
  requestStatus?: string | null;
  supabaseClient: SupabaseClient<Database>;
};

const fetcher = async (params: Params) => {
  try {
    const { data, count } = await getRequestListByForm(params.supabaseClient, {
      teamId: params.teamId,
      formId: params.formId ? params.formId : undefined,
      requestStatus: params.requestStatus ? params.requestStatus : undefined,
    });

    if (!data) throw new Error();

    const requestList = data;
    const requestListCount = count;

    return { requestList, requestListCount };
  } catch (error) {
    console.log(error);
    if (error) throw new Error("Failed to fetch request list by form");
  }
};

function useFetchRequestListByForm(params: Params) {
  const { data, error, isLoading } = useSWR(params, fetcher);

  const requestList = data ? data.requestList : [];
  const requestCount = data ? data.requestListCount : 0;

  return {
    requestList,
    requestCount,
    isLoading,
    isError: error,
  };
}

export default useFetchRequestListByForm;
