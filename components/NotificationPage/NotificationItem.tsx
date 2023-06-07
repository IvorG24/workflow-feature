import { NotificationTableRow } from "@/utils/types";
import { Container, Flex, Indicator, Paper, Text } from "@mantine/core";
import { capitalize, startCase } from "lodash";
import moment from "moment";
import { useRouter } from "next/router";

type Props = {
  notification: NotificationTableRow;
};

const NotificationItem = ({ notification }: Props) => {
  const router = useRouter();

  return (
    <Container
      m={0}
      p={0}
      onClick={() => router.push(notification.notification_redirect_url || "")}
      fluid
    >
      <Indicator
        offset={2}
        position="top-end"
        disabled={notification.notification_is_read}
      >
        <Paper radius={6} px="md" py="sm" withBorder>
          <Flex justify="space-between" align="flex-start">
            <Flex direction="column">
              <Text size="sm" weight={600}>
                {startCase(notification.notification_type.toLowerCase())}
              </Text>
              <Text size="xs">
                {capitalize(notification.notification_content)}
              </Text>
            </Flex>
            <Text color="dimmed" size="xs">
              {moment(notification.notification_date_created).fromNow()}
            </Text>
          </Flex>
        </Paper>
      </Indicator>
    </Container>
  );
};

export default NotificationItem;
