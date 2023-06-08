import { getNotification, getUserActiveTeamId } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import NotificationPage from "@/components/NotificationPage/NotificationPage";
import { NOTIFICATION_LIST_LIMIT } from "@/utils/constant";
import { TEMP_USER_ID } from "@/utils/dummyData";
import { NotificationTableRow } from "@/utils/types";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const supabaseClient = createServerSupabaseClient(ctx);
    const tab = ctx.query.tab || "all";

    const teamId = await getUserActiveTeamId(supabaseClient, {
      userId: TEMP_USER_ID,
    });

    const { data: fetchedNotificationList } = await getNotification(
      supabaseClient,
      {
        app: "REVIEW",
        limit: NOTIFICATION_LIST_LIMIT,
        page: 1,
        userId: TEMP_USER_ID,
        teamId,
      }
    );

    const notificationList =
      tab === "unread"
        ? fetchedNotificationList.filter(
            (notification) => !notification.notification_is_read
          )
        : fetchedNotificationList;

    return {
      props: { notificationList, tab },
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
  tab: "all" | "unread";
};

const Page = ({ notificationList, tab }: Props) => {
  return (
    <>
      <Meta description="Notification Page" url="/team-reviews/notification" />
      <NotificationPage
        app="REVIEW"
        notificationList={notificationList}
        tab={tab}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
