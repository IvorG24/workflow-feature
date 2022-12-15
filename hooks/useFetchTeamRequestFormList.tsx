import {
  fetchTeamRequestFormList,
  FetchTeamRequestFormList,
} from "@/utils/queries";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import showNotification from "./showNotifications";
import useAuth from "./useAuth";

const useFetchTeamRequestFormList = (teamId: string) => {
  const { user } = useAuth();
  const router = useRouter();
  const supabaseClient = useSupabaseClient();
  const [teamRequestFormList, setTeamRequestFormList] =
    useState<FetchTeamRequestFormList>({ teamRequestFormList: [], count: 0 });

  useEffect(() => {
    (async () => {
      try {
        if (!router.isReady) return;
        if (!user) return;

        const teamRequestFormList = await fetchTeamRequestFormList(
          supabaseClient,
          teamId
        );
        setTeamRequestFormList(teamRequestFormList);
      } catch (e) {
        console.error(e);
        showNotification({
          message: "Failed to request form list.",
          state: "Danger",
          title: "Error",
        });
      }
    })();
  }, [supabaseClient, user, router]);

  return { teamRequestFormList };
};

export default useFetchTeamRequestFormList;
