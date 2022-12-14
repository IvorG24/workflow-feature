import { FetchUserNotificationList } from "@/utils/queries";
import { Box, Button, Group, Stack, Text } from "@mantine/core";
import SvgMoreHoriz from "../Icon/MoreHoriz";

type Props = {
  data: FetchUserNotificationList[0];
};

const NotificationItem = ({ data }: Props) => {
  const date = new Date(data.created_at as string);
  const month = date.toLocaleString("default", { month: "short" });

  return (
    <Stack maw="500px" py="sm" sx={{ borderBottom: "1px solid #E9E9E9" }}>
      <Group position="apart">
        <Box w="80%">
          <Text size="sm">{data.notification_message}</Text>
          <Text size="xs" color="dimmed">
            {month} {date.getDate()}
          </Text>
        </Box>
        <Button variant="subtle" p={0} size="xs" color="dark" fz="xl">
          <SvgMoreHoriz />
        </Button>
      </Group>
    </Stack>
  );
};

export default NotificationItem;
