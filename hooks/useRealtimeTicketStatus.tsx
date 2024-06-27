import { Database } from "@/utils/database";
import { SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import useRouteChange from "./useRouteChange";

const useRealtimeTicketStatus = (
  supabaseClient: SupabaseClient<Database>,
  params: { ticketId: string; initialTicketStatus: string }
) => {
  const { ticketId, initialTicketStatus } = params;
  const [ticketStatus, setTicketStatus] = useState(initialTicketStatus);

  useRouteChange(() => {
    setTicketStatus(initialTicketStatus);
  });

  useEffect(() => {
    const channel = supabaseClient
      .channel("realtime ticket-status")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "ticket_schema",
          table: "ticket_table",
          filter: `ticket_id=eq.${ticketId}`,
        },
        (payload) => {
          setTicketStatus(payload.new.ticket_status);
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [supabaseClient, ticketId]);

  return ticketStatus;
};

export default useRealtimeTicketStatus;
