import { getNotificationList } from "@/backend/api/get";
import { updateNotificationStatus } from "@/backend/api/update";
import { useUserStore } from "@/stores/useUserStore";
import { DEFAULT_NOTIFICATION_LIST_LIMIT } from "@/utils/constant";
import { Database } from "@/utils/database";
import { AppType, NotificationTableRow } from "@/utils/types";
import { Container, Pagination, Tabs, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { capitalize, toLower } from "lodash";
import { useRouter } from "next/router";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import NotificationList, { SearchNotificationData } from "./NotificationList";

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
  const supabaseClient = createBrowserSupabaseClient<Database>();
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

  const searchNotificationMethod = useForm<SearchNotificationData>({
    defaultValues: { keyword: "" },
  });

  const handleSearchNotification = (data: SearchNotificationData) => {
    // todo: fetch notification with keyword

    try {
      setIsLoading(true);
      const { keyword } = data;
      console.log(keyword);
    } catch {
      notifications.show({
        title: "Something went wrong",
        message: "Please try again later",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAllAsRead = () => {
    // todo: update all notifications as read

    setNotificationList((notificationList) =>
      notificationList.map((notification) => {
        return {
          ...notification,
          notification_is_read: true,
        };
      })
    );
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await updateNotificationStatus(supabaseClient, { notificationId });
    } catch {
      notifications.show({
        title: "Something went wrong",
        message: "Please try again later",
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
        title: "Something went wrong",
        message: "Please try again later",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormProvider {...searchNotificationMethod}>
      <Container p={0} fluid>
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

          <NotificationList
            notificationList={notificationList}
            onSearchNotification={handleSearchNotification}
            onMarkAllAsRead={handleMarkAllAsRead}
            onMarkAsRead={handleMarkAsRead}
            isLoading={isLoading}
          />
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
    </FormProvider>
  );
};

export default NotificationPage;
