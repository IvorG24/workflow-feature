import { Database } from "@/utils/database";
import { SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import useRouteChange from "./useRouteChange";

const useRealtimeRequestJira = (
  supabaseClient: SupabaseClient<Database>,
  params: {
    requestId: string;
    initialRequestJira: {
      id: string | null;
      link: string | null;
    };
  }
) => {
  const { requestId, initialRequestJira } = params;
  const [requestJira, setRequestJira] = useState(initialRequestJira);

  useRouteChange(() => {
    setRequestJira(initialRequestJira);
  });

  useEffect(() => {
    const channel = supabaseClient
      .channel("realtime request jira")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "request_schema",
          table: "request_table",
          filter: `request_id=eq.${requestId}`,
        },
        (payload) => {
          setRequestJira({
            id: payload.new.request_jira_id,
            link: payload.new.request_jira_link,
          });
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [supabaseClient, requestId]);

  return requestJira;
};

export default useRealtimeRequestJira;
