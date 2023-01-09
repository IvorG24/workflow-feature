import TeamLayout from "@/components/Layout/TeamLayout";
import Meta from "@/components/Meta/Meta";
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

HomePage.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default HomePage;
