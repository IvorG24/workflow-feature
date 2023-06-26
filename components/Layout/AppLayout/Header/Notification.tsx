import { updateNotificationStatus } from "@/backend/api/update";
import {
  useNotificationActions,
  useNotificationList,
  useUnreadNotificationCount,
} from "@/stores/useNotificationStore";
import { useActiveApp } from "@/stores/useTeamStore";
import { Database } from "@/utils/database";
import {
  Button,
  Center,
  Group,
  Indicator,
  ScrollArea,
  Stack,
  Text,
  createStyles,
} from "@mantine/core";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { lowerCase } from "lodash";
import moment from "moment";
import { useRouter } from "next/router";

const useStyles = createStyles((theme) => ({
  notification: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 15,
    paddingRight: 15,
    cursor: "pointer",
    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[5]
          : theme.colors.gray[0],
    },
  },
}));

const Notification = () => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const router = useRouter();
  const { classes } = useStyles();

  const notificationList = useNotificationList();
  const unreadNotificationCount = useUnreadNotificationCount();
  const activeApp = useActiveApp();

  const { setNotificationList, setUnreadNotification } =
    useNotificationActions();

  return (
    <Stack spacing={8} p={8}>
      <Group position="apart">
        <Text weight={600}>Notifications</Text>
      </Group>

      <ScrollArea type="auto" offsetScrollbars scrollbarSize={5}>
        <Stack mah={300} pr={5} spacing={5}>
          {notificationList.map((notification) => (
            <Stack
              key={notification.notification_id}
              className={classes.notification}
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
      <Center>
        <Button
          variant="subtle"
          compact
          onClick={() =>
            router.push(`/team-${lowerCase(activeApp)}s/notification`)
          }
        >
          View all
        </Button>
      </Center>
    </Stack>
  );
};

export default Notification;
