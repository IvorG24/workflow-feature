import { getNotificationList } from "@/backend/api/get";
import {
  readAllNotification,
  updateNotificationStatus,
} from "@/backend/api/update";
import { useUserStore } from "@/stores/useUserStore";
import { DEFAULT_NOTIFICATION_LIST_LIMIT } from "@/utils/constant";
import { Database } from "@/utils/database";
import { AppType, NotificationTableRow } from "@/utils/types";
import {
  Center,
  Container,
  Pagination,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { capitalize, toLower } from "lodash";
import { useRouter } from "next/router";
import { useState } from "react";
import NotificationList from "./NotificationList";

type Props = {
  app: AppType;
  notificationList: NotificationTableRow[];
  totalNotificationCount: number;
  tab: "all" | "unread";
};

const NotificationPage = ({
  app,
  notificationList: initialNotificationList,
  totalNotificationCount: initialTotalNotificationCount,
  tab,
}: Props) => {
  const router = useRouter();
  const initialPage = router.query.page || 1;
  const supabaseClient = createPagesBrowserClient<Database>();
  const { userProfile } = useUserStore();
  const userId = userProfile?.user_id || "";
  const teamId = userProfile?.user_active_team_id || "";

  const [notificationList, setNotificationList] = useState(
    initialNotificationList
  );
  const [totalNotificationCount, setTotalNotificationCount] = useState(
    initialTotalNotificationCount
  );
  const [activePage, setActivePage] = useState(Number(initialPage));
  const [isLoading, setIsLoading] = useState(false);

  const handleMarkAllAsRead = async () => {
    setIsLoading(true);
    try {
      await readAllNotification(supabaseClient, {
        userId: userId,
        appType: app,
      });
      setNotificationList((notificationList) =>
        notificationList.map((notification) => {
          return {
            ...notification,
            notification_is_read: true,
          };
        })
      );
      notifications.show({
        message: "All notifications read.",
        color: "green",
      });
    } catch {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
    setIsLoading(false);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await updateNotificationStatus(supabaseClient, { notificationId });
    } catch {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const handleGetNotificationList = async (page: number) => {
    try {
      setIsLoading(true);

      const { data, count } = await getNotificationList(supabaseClient, {
        app,
        limit: DEFAULT_NOTIFICATION_LIST_LIMIT,
        page: Number(page),
        userId,
        teamId,
        unreadOnly: tab === "unread",
      });

      const result = data as NotificationTableRow[];
      setNotificationList(result);
      setTotalNotificationCount(count || 0);
    } catch {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container p={0}>
      <Title order={2}>{capitalize(app)} Notifications </Title>

      <Tabs
        defaultValue={tab}
        onTabChange={(value) =>
          router
            .replace(
              `/team-${
                app === "REQUEST" ? `${toLower(app)}s` : toLower(app)
              }/notification?tab=${value}`
            )
            .then(() => router.reload())
        }
        mt="lg"
      >
        <Tabs.List>
          <Tabs.Tab value="all">All</Tabs.Tab>
          <Tabs.Tab value="unread">Unread</Tabs.Tab>
        </Tabs.List>

        {notificationList.length !== 0 ? (
          <NotificationList
            notificationList={notificationList}
            onMarkAllAsRead={handleMarkAllAsRead}
            onMarkAsRead={handleMarkAsRead}
            isLoading={isLoading}
          />
        ) : null}
        {notificationList.length === 0 ? (
          <Center mt="xl">
            <Text c="dimmed">No notifications yet</Text>
          </Center>
        ) : null}
      </Tabs>

      <Pagination
        value={activePage}
        total={Math.ceil(
          totalNotificationCount / DEFAULT_NOTIFICATION_LIST_LIMIT
        )}
        onChange={async (value) => {
          setActivePage(value);
          await router.push(
            `/team-${
              app === "REQUEST" ? `${toLower(app)}s` : toLower(app)
            }/notification?tab=${tab}&page=${value}`
          );
          await handleGetNotificationList(value);
        }}
        mt="xl"
        position="right"
      />
    </Container>
  );
};

export default NotificationPage;
