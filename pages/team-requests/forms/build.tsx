import { getTeamMemberList, getUserActiveTeamId } from "@/backend/api/get";
import BuildRequestFormPage from "@/components/BuildRequestFormPage/BuildRequestFormPage";
import Meta from "@/components/Meta/Meta";
import { TEMP_USER_ID } from "@/utils/dummyData";
import { TeamMemberWithUserType } from "@/utils/types";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const supabaseClient = createServerSupabaseClient(ctx);
    const teamId = await getUserActiveTeamId(supabaseClient, {
      userId: TEMP_USER_ID,
    });

    const teamMemberList = await getTeamMemberList(supabaseClient, {
      teamId,
    });

    return {
      props: { teamMemberList },
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
  teamMemberList: TeamMemberWithUserType[];
};

const Page = ({ teamMemberList }: Props) => {
  return (
    <>
      <Meta description="Build Request Page" url="/team-requests/forms/build" />
      <BuildRequestFormPage teamMemberList={teamMemberList} />
    </>
  );
};

export default Page;
Page.Layout = "APP";
