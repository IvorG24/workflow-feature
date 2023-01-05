import { FetchUserNotificationList } from "@/utils/queries";
import { Box, Button, createStyles, Group, Stack, Text } from "@mantine/core";
import { useRouter } from "next/router";
import SvgMoreHoriz from "../Icon/MoreHoriz";

// * https://mantine.dev/styles/create-styles/#:~:text=js%20library.%20We-,recommend,-using%20createStyles%20to
const useStyles = createStyles(() => ({
  container: {
    cursor: "pointer",
  },
}));

type Props = {
  data: FetchUserNotificationList[0];
};

const NotificationItem = ({ data }: Props) => {
  const router = useRouter();
  const { classes } = useStyles();
  const date = new Date(data.created_at as string);
  const month = date.toLocaleString("default", { month: "short" });

  return (
    <Stack
      maw="500px"
      py="sm"
      sx={{ borderBottom: "1px solid #E9E9E9" }}
      onClick={async () => {
        if (data.redirection_url) await router.push(data.redirection_url);
      }}
      className={classes.container}
      data-cy="notification-item"
    >
      <Group position="apart">
        <Box w="80%">
          <Text size="sm" data-cy="notification-message">
            {data.notification_message}
          </Text>
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
