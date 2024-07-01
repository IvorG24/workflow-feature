import { Database } from "@/utils/database";
import { SupabaseClient } from "@supabase/supabase-js";
import moment from "moment";
import { useEffect, useState } from "react";
import useRouteChange from "./useRouteChange";

const useRealtimeTeamExpiration = (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    initialOutstandingBalance: number;
    initialExpirationDate: string;
    currentDate: string;
    price: number;
  }
) => {
  const {
    teamId,
    initialOutstandingBalance,
    initialExpirationDate,
    currentDate,
    price,
  } = params;
  const [outstandingBalance, setOutstandingBalance] = useState(
    initialOutstandingBalance
  );
  const [expirationDate, setExpirationDate] = useState(initialExpirationDate);

  useRouteChange(() => {
    setOutstandingBalance(initialOutstandingBalance);
    setExpirationDate(initialExpirationDate);
  });

  useEffect(() => {
    const channel = supabaseClient
      .channel("realtime team-transaction")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "team_schema",
          table: "team_transaction_table",
          filter: `team_transaction_team_id=eq.${teamId}`,
        },
        (payload) => {
          const difference = moment(currentDate).diff(
            moment(payload.new.team_transaction_team_expiration_date),
            "months",
            true
          );

          if (difference <= 0) {
            setOutstandingBalance(0);
          } else {
            setOutstandingBalance(Math.ceil(difference) * price);
          }
          setExpirationDate(payload.new.team_transaction_team_expiration_date);
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [supabaseClient, teamId, currentDate, price]);

  return { outstandingBalance, expirationDate };
};

export default useRealtimeTeamExpiration;
