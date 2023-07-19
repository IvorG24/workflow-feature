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
  Flex,
  Group,
  Indicator,
  ScrollArea,
  Stack,
  Text,
  createStyles,
} from "@mantine/core";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import {
  IconFile,
  IconFileAlert,
  IconFileDislike,
  IconFileLike,
  IconMail,
  IconMessage2,
  IconMessages,
} from "@tabler/icons-react";
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

  const getIcon = (type: string) => {
    if (type === "APPROVE") return <IconFileLike size={20} color="#40C057" />;
    else if (type === "REJECT")
      return <IconFileDislike size={20} color="#FA5252" />;
    else if (type === "PAUSE")
      return <IconFileAlert size={20} color="#FD7E14" />;
    else if (type === "INVITE") return <IconMail size={20} color="#E64980" />;
    else if (type === "COMMENT")
      return <IconMessages size={20} color="#BE4BDB" />;
    else if (type === "REQUEST") return <IconFile size={20} color="#228BE6" />;
    else if (type === "REVIEW") return <IconMessage2 size={20} />;
  };

  return (
    <Stack spacing={8} p={8}>
      <Group position="apart">
        <Text weight={600}>Notifications</Text>
      </Group>

      <ScrollArea type="auto" offsetScrollbars scrollbarSize={5}>
        <Stack mah={300} pr={5} spacing={5}>
          {notificationList.map((notification) => (
            <Flex
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
              align="center"
              gap="xs"
            >
              <Group>{getIcon(notification.notification_type)}</Group>
              <Indicator disabled={notification.notification_is_read} size={5}>
                <Text size={14}>{notification.notification_content}</Text>
                <Text size={12} c="dimmed">
                  {moment(notification.notification_date_created).fromNow()}
                </Text>
              </Indicator>
            </Flex>
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
