import Layout from "@/components/Layout/Layout";
import { getUserTeamList, isUserOnboarded } from "@/utils/queries";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabaseClient = createServerSupabaseClient(ctx);

  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session) {
    return {
      redirect: {
        destination: "/authentication",
        permanent: false,
      },
    };
  }

  const isOnboarded = await isUserOnboarded(supabaseClient, session?.user?.id);

  if (!isOnboarded) {
    return {
      redirect: {
        destination: "/onboarding",
        permanent: false,
      },
    };
  }

  const teamName = `${ctx.query?.teamName}`;

  const teamList = await getUserTeamList(
    supabaseClient,
    session?.user?.id as string
  );

  // check if member of team
  if (!teamList.find((team) => team.team_name === teamName)) {
    return {
      notFound: true,
    };
  }

  return {
    redirect: {
      destination: `/teams/${teamName}/requests`,
      permanent: false,
    },
  };
};

const HomePage: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = () => {
  return <></>;
};

export default HomePage;

HomePage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
