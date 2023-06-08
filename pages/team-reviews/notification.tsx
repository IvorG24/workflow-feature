import { getNotificationList, getUserActiveTeamId } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import NotificationPage from "@/components/NotificationPage/NotificationPage";
import { TEMP_USER_ID } from "@/utils/dummyData";
import { NotificationTableRow } from "@/utils/types";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const supabaseClient = createServerSupabaseClient(ctx);
    const tab = ctx.query.tab || "all";
    const page = ctx.query.page || 1;

    const teamId = await getUserActiveTeamId(supabaseClient, {
      userId: TEMP_USER_ID,
    });

    const { data: notificationList, count: totalNotificationCount } =
      await getNotificationList(supabaseClient, {
        app: "REVIEW",
        limit: 100,
        page: Number(page),
        userId: TEMP_USER_ID,
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
};

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
