import CreateTeam from "@/components/CreateTeam/CreateTeam";
import TeamLayout from "@/components/Layout/TeamLayout";
import Meta from "@/components/Meta/Meta";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";
import { ReactElement } from "react";
import type { NextPageWithLayout } from "../_app";

const CreateTeamPage: NextPageWithLayout = () => {
  return (
    <div>
      {/* todo: fix meta tags */}
      <Meta description="Create Team Page" url="localhost:3000/team/create" />
      <CreateTeam />
    </div>
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

  return {
    props: {},
  };
};

CreateTeamPage.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default CreateTeamPage;
