import {
  getRequestCommentList,
  GetRequestCommentList,
} from "@/utils/queries-new";
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import useAuth from "./useAuth";

const useFetchRequestCommentList = (requestId: number) => {
  const { user } = useAuth();
  const router = useRouter();
  const supabaseClient = useSupabaseClient();
  const [requestCommentList, setRequestCommentList] =
    useState<GetRequestCommentList>();
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    (async () => {
      setIsFetching(true);
      try {
        if (!router.isReady) return;
        if (!user) return;

        const data = await getRequestCommentList(supabaseClient, requestId);

        setRequestCommentList(data);
      } catch (error) {
        console.error(error);
        showNotification({
          title: "Error!",
          message: "Failed to fetch data.",
          color: "red",
        });
      } finally {
        setIsFetching(false);
      }
    })();
  }, [supabaseClient, user, router, requestId]);

  return { requestCommentList, setRequestCommentList, isFetching };
};

export default useFetchRequestCommentList;
