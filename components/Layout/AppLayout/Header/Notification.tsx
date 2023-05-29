import { useNotificationList } from "@/stores/useNotificationStore";
import {
  Center,
  Group,
  Indicator,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import moment from "moment";

const Notification = () => {
  const notificationList = useNotificationList();
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
            >
              <Indicator disabled={notification.notification_is_read}>
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
