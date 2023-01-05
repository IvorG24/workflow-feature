import { GetNotificationList, getNotificationList } from "@/utils/queries-new";
import { NotificationType } from "@/utils/types-new";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import showNotification from "./showNotifications";

const useFetchNotificationList = (
  userId: string,
  teamId?: string
) => {
  const router = useRouter();
  const supabaseClient = useSupabaseClient();
  const [notificationList, setNotificationList] = useState<GetNotificationList>(
    []
  );

  useEffect(() => {
    (async () => {
      try {
        if (!router.isReady) return;

        const notificationList = await getNotificationList(
          supabaseClient,
          userId,
          teamId
        );

        setNotificationList(notificationList);
      } catch {
        showNotification({
          message: "Failed to fetch notifications.",
          state: "Danger",
          title: "Error",
        });
      }
    })();
  }, [supabaseClient, router]);

  return { notificationList };
};

export default useFetchNotificationList;
