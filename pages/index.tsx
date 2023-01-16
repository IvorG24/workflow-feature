import TeamLayout from "@/components/Layout/TeamLayout";
import Meta from "@/components/Meta/Meta";
import { createOrRetrieveUserTeamList } from "@/utils/queries-new";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";
import { ReactElement } from "react";
import { NextPageWithLayout } from "./_app";

const HomePage: NextPageWithLayout = () => {
  return (
    <div>
      {/* todo: fix meta tags */}
      <Meta description="Home page" url="localhost:3000/forms" />
      <h1>Home page</h1>
    </div>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabaseClient = createServerSupabaseClient(ctx);
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (!user)
    return {
      redirect: {
        destination: "/sign-in",
        permanent: false,
      },
    };

  const teamList = await createOrRetrieveUserTeamList(supabaseClient, user);
  if (!teamList.length)
    return {
      redirect: {
        destination: "/teams/create",
        permanent: false,
      },
    };

  return {
    props: {},
  };
};

HomePage.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default HomePage;
