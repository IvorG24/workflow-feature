import { Box, Button, Group, Stack, Text } from "@mantine/core";
import SvgMoreHoriz from "../Icon/MoreHoriz";

// todo: replace with actual type from @utils/types
type Data = {
  id: number;
  team_id: number;
  message: string;
  created_at: string;
};

type Props = {
  data: Data;
};

const NotificationItem = ({ data }: Props) => {
  const date = new Date(data.created_at);
  const month = date.toLocaleString("default", { month: "short" });

  return (
    <Stack maw="500px" py="sm" sx={{ borderBottom: "1px solid #E9E9E9" }}>
      <Group position="apart">
        <Box w="80%">
          <Text size="sm">{data.message}</Text>
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
