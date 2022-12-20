import {
  fetchUserNotificationList,
  FetchUserNotificationList,
} from "@/utils/queries";
import { FormTypeEnum } from "@/utils/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import showNotification from "./showNotifications";
import useAuth from "./useAuth";

const useFetchNotificationList = (teamId?: string, formType?: FormTypeEnum) => {
  const { user } = useAuth();
  const router = useRouter();
  const supabaseClient = useSupabaseClient();
  const [userNotificationList, setUserNotificationList] =
    useState<FetchUserNotificationList>([]);

  useEffect(() => {
    (async () => {
      try {
        if (!router.isReady) return;
        if (!user) return;

        const userNotificationList = await fetchUserNotificationList(
          supabaseClient,
          user.id,
          teamId,
          formType
        );
        setUserNotificationList(userNotificationList);
        console.log(userNotificationList);
      } catch (e) {
        console.error(e);
        showNotification({
          message: "Failed to fetch notifications.",
          state: "Danger",
          title: "Error",
        });
      }
    })();
  }, [supabaseClient, user, router]);

  return { userNotificationList };
};

export default useFetchNotificationList;
