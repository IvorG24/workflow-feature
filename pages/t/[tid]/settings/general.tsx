import TeamLayout from "@/components/Layout/TeamLayout";
import Meta from "@/components/Meta/Meta";
import Setting from "@/components/Setting/Setting";
import { getTeamByTeamId } from "@/utils/queries-new";
import { TeamTableRow } from "@/utils/types";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";
import { ReactElement } from "react";

type Props = {
  team: TeamTableRow;
};

const GeneralSettingsPage = ({ team }: Props) => {
  return (
    <div>
      <Meta
        description="General Settings Page"
        url="localhost:3000/settings/general"
      />
      <Setting activeTab="general" team={team} />
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

  const team = await getTeamByTeamId(supabaseClient, `${ctx.query.tid}`);

  return {
    props: { team },
  };
};

GeneralSettingsPage.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default GeneralSettingsPage;
