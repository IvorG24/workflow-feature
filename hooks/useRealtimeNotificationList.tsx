import {
  useNotificationActions,
  useNotificationList,
} from "@/stores/useNotificationStore";
import { useUserTeamMember } from "@/stores/useUserStore";
import { Database } from "@/utils/database";
import { NotificationTableRow } from "@/utils/types";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { useEffect } from "react";

const useRealtimeNotificationList = () => {
  const user = useUserTeamMember();
  const supabaseClient = createPagesBrowserClient<Database>();
  const notificationList = useNotificationList();
  const { setUnreadNotification, setNotificationList } =
    useNotificationActions();

  useEffect(() => {
    if (!user) return;
    const channel = supabaseClient
      .channel("realtime notification")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notification_table",
          filter: `notification_user_id=eq.${user.team_member_user_id}`,
        },
        (payload) => {
          const updatedNotificationList = [
            payload.new as NotificationTableRow,
            ...notificationList,
          ];
          setNotificationList(updatedNotificationList);

          const unreadNotification = updatedNotificationList.filter(
            (notification) => !notification.notification_is_read
          );
          setUnreadNotification(unreadNotification.length);
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [
    supabaseClient,
    notificationList,
    user,
    setNotificationList,
    setUnreadNotification,
  ]);

  return notificationList;
};

export default useRealtimeNotificationList;
