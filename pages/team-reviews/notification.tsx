import { getNotificationList, getUserActiveTeamId } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import NotificationPage from "@/components/NotificationPage/NotificationPage";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import { NotificationTableRow } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async ({ supabaseClient, context, user }) => {
    try {
      const tab = context.query.tab || "all";
      const page = context.query.page || 1;

      const teamId = await getUserActiveTeamId(supabaseClient, {
        userId: user.id,
      });

      const { data: notificationList, count: totalNotificationCount } =
        await getNotificationList(supabaseClient, {
          app: "REVIEW",
          limit: 100,
          page: Number(page),
          userId: user.id,
          teamId,
          unreadOnly: tab === "unread",
        });

      return {
        props: { notificationList, totalNotificationCount, tab },
      };
    } catch (error) {
      console.error(error);
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
      <Meta description="Notification Page" url="/team-reviews/notification" />
      <NotificationPage
        app="REVIEW"
        notificationList={notificationList}
        totalNotificationCount={totalNotificationCount}
        tab={tab}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
