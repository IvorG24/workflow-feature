import { GetTeamMemberList, getTeamMemberList } from "@/utils/queries";
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";

const useFetchTeamMemberList = (teamName: string) => {
  const user = useUser();
  const supabaseClient = useSupabaseClient();
  const [teamMemberList, setTeamMemberList] = useState<GetTeamMemberList>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setIsFetching(true);
        if (!teamName) return;
        if (!supabaseClient) return;
        if (!user?.id) return;

        const data = await getTeamMemberList(supabaseClient, teamName);

        setTeamMemberList(data);
        setIsFetching(false);
      } catch (error) {
        console.error(error);
        showNotification({
          message: "Failed to fetch form templates",
          color: "red",
        });
      }
    })();
  }, [supabaseClient, teamName, user?.id]);

  return { teamMemberList, setTeamMemberList, isFetching };
};

export default useFetchTeamMemberList;
