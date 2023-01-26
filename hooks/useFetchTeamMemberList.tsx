import { GetFormTemplateNameList, GetTeamMemberList, getTeamMemberList } from "@/utils/queries";
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useAuth from "./useAuth";

const useFetchTeamMemberList = (teamName: string) => {
  const { session } = useAuth();
  const router = useRouter();
  const supabaseClient = useSupabaseClient();
  const [teamMemberList, setTeamMemberList] = useState<GetTeamMemberList>(
    []
  );
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setIsFetching(true);
        if (!router.isReady) return;
        if (!session) return;
        if (!teamName) return;

        const data = await getTeamMemberList(supabaseClient, teamName);

        setTeamMemberList(data);
        setIsFetching(false);
      } catch (error) {
        console.error(error);
        showNotification({
          title: "Error",
          message: "Failed to fetch form templates",
          color: "red",
        });
      }
    })();
  }, [supabaseClient, session, router, teamName]);

  return { teamMemberList, setTeamMemberList, isFetching };
};

export default useFetchTeamMemberList;
