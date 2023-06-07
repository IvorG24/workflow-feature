import {
  getNotification,
  getUserActiveTeamId,
  getUserTeamMemberId,
} from "@/backend/api/get";
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

    const teamId = await getUserActiveTeamId(supabaseClient, {
      userId: TEMP_USER_ID,
    });

    const teamMemberId = await getUserTeamMemberId(supabaseClient, {
      teamId: teamId,
      userId: TEMP_USER_ID,
    });

    if (!teamMemberId) throw new Error("No team member found");

    const { data: notificationList, count: unreadNotificationCount } =
      await getNotification(supabaseClient, {
        app: "REQUEST",
        limit: NOTIFICATION_LIST_LIMIT,
        memberId: teamMemberId,
        page: 1,
      });

    return {
      props: { teamMemberId, notificationList, unreadNotificationCount },
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
  teamMemberId: string;
  notificationList: NotificationTableRow[];
  unreadNotificationCount: number;
};

const Page = ({
  notificationList,
  unreadNotificationCount,
  teamMemberId,
}: Props) => {
  return (
    <>
      <Meta description="Notification Page" url="/team-requests/notification" />
      <NotificationPage
        app="REQUEST"
        notificationList={notificationList}
        unreadNotificationCount={unreadNotificationCount}
        teamMemberId={teamMemberId}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
