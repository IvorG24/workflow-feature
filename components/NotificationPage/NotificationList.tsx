import { JoyRideNoSSR } from "@/utils/functions";
import { NotificationTableRow } from "@/utils/types";
import {
  Button,
  Container,
  Flex,
  LoadingOverlay,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { useRouter } from "next/router";
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
  const router = useRouter();
  const { colors } = useMantineTheme();
  const isInvitationOnboarding = router.query.onboarding === "join" || false;
  return (
    <Container m={0} p={0} mt="xl" pos="relative" fluid>
      <LoadingOverlay
        visible={isLoading}
        overlayBlur={2}
        transitionDuration={500}
      />
      {isInvitationOnboarding && (
        <JoyRideNoSSR
          steps={[
            {
              target: ".onboarding-join-team",
              content: <Text>Click the invitation</Text>,
              disableBeacon: true,
            },
          ]}
          run={isInvitationOnboarding}
          scrollToFirstStep
          hideCloseButton
          disableCloseOnEsc
          disableOverlayClose
          hideBackButton
          spotlightClicks={true}
          styles={{ buttonNext: { backgroundColor: colors.blue[6] } }}
        />
      )}

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
          <div
            className={
              notification.notification_type === "INVITE"
                ? "onboarding-join-team"
                : ""
            }
            key={notification.notification_id}
          >
            <NotificationItem
              notification={notification}
              onReadNotification={() =>
                onMarkAsRead(notification.notification_id)
              }
            />
          </div>
        ))}
      </Flex>
    </Container>
  );
};

export default NotificationList;
