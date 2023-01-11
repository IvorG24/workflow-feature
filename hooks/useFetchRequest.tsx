import { GetRequest, getRequest } from "@/utils/queries-new";
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import useAuth from "./useAuth";

const useFetchRequest = (requestId: number) => {
  const { user } = useAuth();
  const router = useRouter();
  const supabaseClient = useSupabaseClient();
  const [request, setRequest] = useState<GetRequest>();
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setIsFetching(true);
        if (!router.isReady) return;
        if (!user) return;

        const data = await getRequest(supabaseClient, requestId);

        setRequest(data);
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

  return { request, setRequest, isFetching };
};

export default useFetchRequest;
