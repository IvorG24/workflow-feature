import { RequestSignerType } from "@/components/RequestPage/RequestSignerSection";
import { Database } from "@/utils/database";
import { SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

const useRealtimeRequestSignerList = (
  supabaseClient: SupabaseClient<Database>,
  params: { requestId: string; initialRequestSignerList: RequestSignerType[] }
) => {
  const { requestId, initialRequestSignerList } = params;
  const [requestSignerList, setRequestSignerList] = useState(
    initialRequestSignerList
  );

  useEffect(() => {
    const channel = supabaseClient
      .channel("realtime request-signer-list")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "request_signer_table",
          filter: `request_signer_request_id=eq.${requestId}`,
        },
        (payload) => {
          setRequestSignerList((prev) =>
            prev.map((signer) => {
              if (signer.signer_id === payload.new.request_signer_signer_id) {
                return {
                  ...signer,
                  request_signer_status: payload.new.request_signer_status,
                };
              }
              return signer;
            })
          );
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [supabaseClient, requestId]);

  return requestSignerList;
};

export default useRealtimeRequestSignerList;
