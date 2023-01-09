// TODO: This is an MVP of notifications page only.
import TeamLayout from "@/components/Layout/TeamLayout";
import Meta from "@/components/Meta/Meta";
import NotificationPage from "@/components/NotificationPage/NotificationPage";
import NotificationListContext from "@/contexts/NotificationListContext";
import { getNotificationList, GetNotificationList } from "@/utils/queries-new";
import { Flex } from "@mantine/core";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";

export type NotificationPageProps = {
  userAccount: GetNotificationList;
  team: GetNotificationList;
};

const Page: NextPageWithLayout<NotificationPageProps> = (props) => {
  return (
    <NotificationListContext.Provider value={props}>
      <Meta
        description="Test page used for testing layout"
        // this is just a temporary url, canoncial url will be set in the future
        url="localhost:3000/testpage"
      />
      <Flex justify={{ base: "center", md: "flex-start" }}>
        <NotificationPage />
      </Flex>
    </NotificationListContext.Provider>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabaseClient = createServerSupabaseClient(ctx);
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session)
    return {
      redirect: {
        destination: "/sign-in",
        permanent: false,
      },
    };

  const user = session.user;
  const userId = user.id;

  if (!userId) {
    return {
      redirect: {
        destination: "/sign-in",
        permanent: false,
      },
    };
  }

  const { tid: teamId } = ctx.query;

  const [userAccount, team] = await Promise.all([
    getNotificationList(supabaseClient, userId),
    getNotificationList(supabaseClient, userId, teamId as string),
  ]);

  return {
    props: {
      userAccount,
      team,
    },
  };
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default Page;
