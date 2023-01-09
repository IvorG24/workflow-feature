import TeamLayout from "@/components/Layout/TeamLayout";
import Meta from "@/components/Meta/Meta";
import Setting from "@/components/Setting/Setting";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";
import { ReactElement } from "react";
import type { NextPageWithLayout } from "../../../_app";

const GeneralSettingsPage: NextPageWithLayout = () => {
  return (
    <div>
      <Meta
        description="General Settings Page"
        url="localhost:3000/settings/general"
      />
      <Setting activeTab="general" />
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

GeneralSettingsPage.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default GeneralSettingsPage;
