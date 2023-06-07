import { updateNotificationStatus } from "@/backend/api/update";
import {
  useNotificationActions,
  useNotificationList,
  useUnreadNotificationCount,
} from "@/stores/useNotificationStore";
import { Database } from "@/utils/database";
import {
  Center,
  Group,
  Indicator,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import moment from "moment";
import { useRouter } from "next/router";

const Notification = () => {
  const supabaseClient = createBrowserSupabaseClient<Database>();
  const router = useRouter();
  const notificationList = useNotificationList();
  const unreadNotificationCount = useUnreadNotificationCount();
  const { setNotificationList, setUnreadNotification } =
    useNotificationActions();
  return (
    <Stack spacing={8} p={8}>
      <Group position="apart">
        <Text weight={600}>Notifications</Text>
      </Group>
      <ScrollArea h={300} type="scroll">
        <Stack p={8}>
          {notificationList.map((notification) => (
            <Stack
              spacing={0}
              key={notification.notification_id}
              sx={{ cursor: "pointer" }}
              onClick={async () => {
                if (!notification.notification_is_read) {
                  const newNotifications = notificationList.map((notif) => {
                    if (notif.notification_id !== notification.notification_id)
                      return notif;
                    return {
                      ...notif,
                      notification_is_read: true,
                    };
                  });
                  setNotificationList(newNotifications);
                  setUnreadNotification(unreadNotificationCount - 1);
                  await updateNotificationStatus(supabaseClient, {
                    notificationId: notification.notification_id,
                  });
                }
                await router.push(`${notification.notification_redirect_url}`);
              }}
            >
              <Indicator disabled={notification.notification_is_read} size={5}>
                <Text size={14}>{notification.notification_content}</Text>
                <Text size={12} c="dimmed">
                  {moment(notification.notification_date_created).fromNow()}
                </Text>
              </Indicator>
            </Stack>
          ))}
          {notificationList.length === 0 ? (
            <Center>
              <Text size={12} c="dimmed">
                No notifications yet
              </Text>
            </Center>
          ) : null}
        </Stack>
      </ScrollArea>
    </Stack>
  );
};

export default Notification;
