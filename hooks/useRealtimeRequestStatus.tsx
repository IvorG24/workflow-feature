import { Database } from "@/utils/database";
import { SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import useRouteChange from "./useRouteChange";

const useRealtimeRequestStatus = (
  supabaseClient: SupabaseClient<Database>,
  params: { requestId: string; initialRequestStatus: string }
) => {
  const { requestId, initialRequestStatus } = params;
  const [requestStatus, setRequestStatus] = useState(initialRequestStatus);

  useRouteChange(() => {
    setRequestStatus(initialRequestStatus);
  });

  useEffect(() => {
    const channel = supabaseClient
      .channel("realtime request")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "request_table",
          filter: `request_id=eq.${requestId}`,
        },
        (payload) => {
          setRequestStatus(payload.new.request_status);
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [supabaseClient, requestId]);

  return requestStatus;
};

export default useRealtimeRequestStatus;
