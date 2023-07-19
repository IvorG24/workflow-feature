import { NotificationTableRow } from "@/utils/types";
import {
  Container,
  Flex,
  Group,
  Indicator,
  Paper,
  Text,
  Tooltip,
} from "@mantine/core";
import {
  IconFile,
  IconFileAlert,
  IconFileDislike,
  IconFileLike,
  IconMail,
  IconMessage2,
  IconMessages,
} from "@tabler/icons-react";
import { capitalize, startCase } from "lodash";
import moment from "moment";
import { useRouter } from "next/router";

type Props = {
  notification: NotificationTableRow;
  onReadNotification: () => void;
};

const NotificationItem = ({ notification, onReadNotification }: Props) => {
  const router = useRouter();
  const tab = router.query.tab || "all";

  const getIcon = () => {
    const type = notification.notification_type;
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
    <Container
      m={0}
      p={0}
      onClick={async () => {
        await router.push(notification.notification_redirect_url || "");
        onReadNotification();
      }}
      sx={{ cursor: "pointer" }}
      fluid
    >
      <Indicator
        offset={2}
        position="top-end"
        disabled={notification.notification_is_read}
      >
        <Paper
          radius={6}
          px="md"
          py="sm"
          withBorder
          bg={
            notification.notification_is_read && tab !== "unread"
              ? "transparent"
              : ""
          }
        >
          <Flex justify="flex-start" align="center" gap="sm" w="100%">
            <Group>{getIcon()}</Group>

            <Flex direction="column" w="100%">
              <Tooltip
                label={capitalize(notification.notification_content)}
                openDelay={2000}
              >
                <Text size="sm" lineClamp={2}>
                  {capitalize(notification.notification_content)}
                </Text>
              </Tooltip>
              <Flex justify="space-between" w="100%">
                <Text size="xs" weight={600} color="dimmed">
                  {startCase(notification.notification_type.toLowerCase())}
                </Text>
                <Text color="dimmed" size="xs">
                  {moment(notification.notification_date_created).fromNow()}
                </Text>
              </Flex>
            </Flex>
          </Flex>
        </Paper>
      </Indicator>
    </Container>
  );
};

export default NotificationItem;
