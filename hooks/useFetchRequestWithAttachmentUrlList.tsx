import {
  getRequestWithAttachmentUrlList,
  GetRequestWithAttachmentUrlList,
} from "@/utils/queries-new";
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import useAuth from "./useAuth";

const useFetchRequestWithAttachmentUrlList = (requestId: number) => {
  const { user } = useAuth();
  const router = useRouter();
  const supabaseClient = useSupabaseClient();
  const [requestWithAttachmentUrlList, setRequestWithAttachmentUrlList] =
    useState<GetRequestWithAttachmentUrlList>();
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    (async () => {
      setIsFetching(true);
      try {
        if (!router.isReady) return;
        if (!user) return;

        const data = await getRequestWithAttachmentUrlList(
          supabaseClient,
          requestId
        );

        setRequestWithAttachmentUrlList(data);
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

  return {
    requestWithAttachmentUrlList,
    setRequestWithAttachmentUrlList,
    isFetching,
  };
};

export default useFetchRequestWithAttachmentUrlList;
