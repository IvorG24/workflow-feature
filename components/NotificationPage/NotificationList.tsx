import { NotificationTableRow } from "@/utils/types";
import {
  ActionIcon,
  Button,
  Container,
  Flex,
  LoadingOverlay,
  Text,
  TextInput,
} from "@mantine/core";
import { IconCheck, IconSearch } from "@tabler/icons-react";
import { MouseEventHandler } from "react";
import { useFormContext } from "react-hook-form";
import NotificationItem from "./NotificationItem";

type Props = {
  notificationList: NotificationTableRow[];
  onSearchNotification: (data: SearchNotificationData) => void;
  onMarkAllAsRead: MouseEventHandler<HTMLButtonElement>;
  isLoading: boolean;
};

export type SearchNotificationData = {
  keyword: string;
};

const NotificationList = ({
  notificationList,
  onSearchNotification,
  onMarkAllAsRead,
  isLoading,
}: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useFormContext<SearchNotificationData>();
  return (
    <Container m={0} p={0} mt="xl" pos="relative" fluid>
      <LoadingOverlay
        visible={isLoading}
        overlayBlur={2}
        transitionDuration={500}
      />
      <Flex
        justify="space-between"
        align="flex-start"
        gap="md"
        direction={{ base: "column", sm: "row" }}
      >
        <form onSubmit={handleSubmit(onSearchNotification)}>
          <TextInput
            placeholder="Search notifications"
            rightSection={
              <ActionIcon size="xs" type="submit">
                <IconSearch />
              </ActionIcon>
            }
            w={{ lg: 450, base: "100%" }}
            {...register("keyword", {
              required: true,
              minLength: {
                value: 2,
                message: "Keyword must have at least 2 characters",
              },
            })}
            error={errors.keyword?.message}
          />
        </form>

        <Button
          variant="subtle"
          size="xs"
          onClick={onMarkAllAsRead}
          leftIcon={<IconCheck height={20} />}
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
            key={notification.notification_id}
          />
        ))}
      </Flex>
    </Container>
  );
};

export default NotificationList;
