// TODO: This is an MVP of notificaitons page only.
import WorkspaceLayout from "@/components/Layout/WorkspaceLayout";
import Meta from "@/components/Meta/Meta";
import showNotification from "@/hooks/showNotifications";
import { Database } from "@/utils/database.types";
import {
  FetchUserNotificationList,
  fetchUserNotificationList,
} from "@/utils/queries";
import { Table } from "@mantine/core";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement, useEffect, useState } from "react";

const Page: NextPageWithLayout = () => {
  const supabaseClient = useSupabaseClient<Database>();
  const user = useUser();
  const router = useRouter();
  const [userNotificationList, setUserNotificationList] =
    useState<FetchUserNotificationList>([]);
  const rows = userNotificationList.map((notification) => (
    <tr
      key={notification.notification_id}
      onClick={async () =>
        await router.push(notification.redirection_url as string)
      }
    >
      <td>{notification.notification_id}</td>
      <td>{notification.notification_message}</td>
      <td>{notification.redirection_url}</td>
    </tr>
  ));

  useEffect(() => {
    (async () => {
      try {
        if (!router.isReady) return;
        if (!user) return;

        const userNotificationList = await fetchUserNotificationList(
          supabaseClient,
          // router.query.tid as string,
          user.id
        );
        setUserNotificationList(userNotificationList);
      } catch (e) {
        showNotification({
          message: "Failed to fetch notifications.",
          state: "Danger",
          title: "Error",
        });
      }
    })();
  }, [router, user]);

  return (
    <div>
      <Meta
        description="Test page used for testing layout"
        // this is just a temporary url, canoncial url will be set in the future
        url="localhost:3000/testpage"
      />
      <Table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Message</th>
            <th>Redirection URL</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </div>
  );
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <WorkspaceLayout>{page}</WorkspaceLayout>;
};

export default Page;
