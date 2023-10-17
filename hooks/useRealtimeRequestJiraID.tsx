import { Database } from "@/utils/database";
import { SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import useRouteChange from "./useRouteChange";

const useRealtimeRequestJiraID = (
  supabaseClient: SupabaseClient<Database>,
  params: { requestId: string; initialRequestJiraID: string | null }
) => {
  const { requestId, initialRequestJiraID } = params;
  const [requestJiraID, setRequestJiraID] = useState(initialRequestJiraID);

  useRouteChange(() => {
    setRequestJiraID(initialRequestJiraID);
  });

  useEffect(() => {
    const channel = supabaseClient
      .channel("realtime request jira id")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "request_table",
          filter: `request_id=eq.${requestId}`,
        },
        (payload) => {
          setRequestJiraID(payload.new.request_jira_id);
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [supabaseClient, requestId]);

  return requestJiraID;
};

export default useRealtimeRequestJiraID;
