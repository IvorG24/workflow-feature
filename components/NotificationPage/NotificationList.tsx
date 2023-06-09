import { NotificationTableRow } from "@/utils/types";
import { Button, Container, Flex, LoadingOverlay, Text } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { MouseEventHandler } from "react";
import NotificationItem from "./NotificationItem";

type Props = {
  notificationList: NotificationTableRow[];
  onMarkAllAsRead: MouseEventHandler<HTMLButtonElement>;
  onMarkAsRead: (notificationId: string) => void;
  isLoading: boolean;
};

const NotificationList = ({
  notificationList,
  onMarkAllAsRead,
  onMarkAsRead,
  isLoading,
}: Props) => {
  return (
    <Container m={0} p={0} mt="xl" pos="relative" fluid>
      <LoadingOverlay
        visible={isLoading}
        overlayBlur={2}
        transitionDuration={500}
      />
      <Flex
        justify="space-between"
        align="center"
        gap="md"
        direction={{ base: "column", sm: "row" }}
      >
        <Button
          variant="subtle"
          size="xs"
          onClick={onMarkAllAsRead}
          leftIcon={<IconCheck height={20} />}
          ml="auto"
        >
          <Text color="blue" size={12} weight={400}>
            Mark all as read
          </Text>
        </Button>
      </Flex>

      <Flex direction="column" gap="xs" mt="md">
        {notificationList.map((notification) => (
          <NotificationItem
            notification={notification}
            onReadNotification={() =>
              onMarkAsRead(notification.notification_id)
            }
            key={notification.notification_id}
          />
        ))}
      </Flex>
    </Container>
  );
};

export default NotificationList;
