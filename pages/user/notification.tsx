import { getNotificationOnLoad } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import NotificationPage from "@/components/NotificationPage/NotificationPage";
import { DEFAULT_NOTIFICATION_LIST_LIMIT } from "@/utils/constant";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import { NotificationTableRow } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async ({ supabaseClient, context, user }) => {
    try {
      const tab = context.query.tab || "all";
      const page = context.query.page || 1;

      const notification = await getNotificationOnLoad(supabaseClient, {
        app: "REQUEST",
        limit: DEFAULT_NOTIFICATION_LIST_LIMIT,
        page: Number(page),
        userId: user.id,
        unreadOnly: tab === "unread",
      });

      return {
        props: notification,
      };
    } catch (e) {
      return {
        redirect: {
          destination: "/500",
          permanent: false,
        },
      };
    }
  }
);

type Props = {
  notificationList: NotificationTableRow[];
  totalNotificationCount: number;
  tab: "all" | "unread";
};

const Page = ({ notificationList, totalNotificationCount, tab }: Props) => {
  return (
    <>
      <Meta description="Notification Page" url="/user/notification" />
      <NotificationPage
        app="REQUEST"
        notificationList={notificationList}
        totalNotificationCount={totalNotificationCount}
        tab={tab}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
