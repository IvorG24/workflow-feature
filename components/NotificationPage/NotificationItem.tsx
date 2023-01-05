import { GetNotificationList } from "@/utils/queries-new";
import { Box, Button, createStyles, Group, Stack, Text } from "@mantine/core";
import { useRouter } from "next/router";
import { NonUndefined } from "react-hook-form";
import SvgMoreHoriz from "../Icon/MoreHoriz";

// * https://mantine.dev/styles/create-styles/#:~:text=js%20library.%20We-,recommend,-using%20createStyles%20to
const useStyles = createStyles(() => ({
  container: {
    cursor: "pointer",
  },
}));

type Props = {
  data: NonUndefined<GetNotificationList>[0];
};

const NotificationItem = ({ data }: Props) => {
  const router = useRouter();
  const { classes } = useStyles();
  const date = new Date(data.notification_date_created as string);
  const month = date.toLocaleString("default", { month: "short" });

  return (
    <Stack
      maw="500px"
      py="sm"
      sx={{ borderBottom: "1px solid #E9E9E9" }}
      onClick={async () => {
        if (data.notification_redirect_url)
          await router.push(data.notification_redirect_url);
      }}
      className={classes.container}
    >
      <Group position="apart">
        <Box w="80%">
          <Text size="sm">{data.notification_content}</Text>
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
