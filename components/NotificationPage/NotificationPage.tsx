import { AppType, NotificationTableRow } from "@/utils/types";
import { Container, Tabs, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { capitalize, toLower } from "lodash";
import { useRouter } from "next/router";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import NotificationList, { SearchNotificationData } from "./NotificationList";

type Props = {
  app: AppType;
  teamMemberId: string;
  notificationList: NotificationTableRow[];
  tab: "all" | "unread";
};

const NotificationPage = ({
  app,
  notificationList: initialNotificationList,
  tab,
}: Props) => {
  const router = useRouter();

  const [notificationList, setNotificationList] = useState(
    initialNotificationList
  );
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
            isLoading={isLoading}
          />
        </Tabs>
      </Container>
    </FormProvider>
  );
};

export default NotificationPage;
