import { Database } from "@/utils/database";
import { SupabaseClient } from "@supabase/supabase-js";
import moment from "moment";
import { useEffect, useState } from "react";
import useRouteChange from "./useRouteChange";
import { FORMSLY_PRICE_PER_MONTH } from "@/utils/constant";

const useRealtimeTeamExpiration = (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    initialOutstandingBalance: number;
    initialExpirationDate: string;
    currentDate: string;
  }
) => {
  const {
    teamId,
    initialOutstandingBalance,
    initialExpirationDate,
    currentDate,
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
      .channel("realtime team-expiration")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "team_table",
          filter: `team_id=eq.${teamId}`,
        },
        (payload) => {
          const difference = moment(currentDate).diff(
            moment(payload.new.team_expiration),
            "months",
            true
          );

          if (difference <= 0) {
            setOutstandingBalance(0);
          } else {
            setOutstandingBalance(Math.ceil(difference) * FORMSLY_PRICE_PER_MONTH);
          }
          setExpirationDate(payload.new.team_expiration);
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [supabaseClient, teamId, currentDate]);

  return { outstandingBalance, expirationDate };
};

export default useRealtimeTeamExpiration;
