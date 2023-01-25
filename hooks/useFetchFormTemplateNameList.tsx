import {
  getFormTemplateNameList,
  GetFormTemplateNameList,
} from "@/utils/queries";
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import useAuth from "./useAuth";

const useFetchFormTemplateNameList = (teamId: string) => {
  const { user } = useAuth();
  const router = useRouter();
  const supabaseClient = useSupabaseClient();
  const [formTemplateNameList, setFormTemplateNameList] =
    useState<GetFormTemplateNameList>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setIsFetching(true);
        if (!router.isReady) return;
        if (!user) return;

        const data = await getFormTemplateNameList(supabaseClient, teamId);

        setFormTemplateNameList(data);
      } catch (error) {
        console.error(error);
        showNotification({
          title: "Error",
          message: "Failed to fetch form templates",
          color: "red",
        });
      } finally {
        setIsFetching(false);
      }
    })();
  }, [supabaseClient, user, router, teamId]);

  return { formTemplateNameList, setFormTemplateNameList, isFetching };
};

export default useFetchFormTemplateNameList;
