import {
  getTeam,
  getUserActiveTeamId,
  getUserTeamMemberId,
} from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import TeamPage from "@/components/TeamPage/TeamPage";
import { TEMP_USER_ID } from "@/utils/dummyData";
import { TeamWithTeamMemberType } from "@/utils/types";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const supabaseClient = createServerSupabaseClient(ctx);

    const teamId = await getUserActiveTeamId(supabaseClient, {
      userId: TEMP_USER_ID,
    });

    const team = await getTeam(supabaseClient, {
      teamId: teamId,
    });
    if (!team) throw new Error("No team found");

    const teamMemberId = await getUserTeamMemberId(supabaseClient, {
      teamId: teamId,
      userId: TEMP_USER_ID,
    });

    if (!teamMemberId) throw new Error("No team member found");

    return {
      props: { team, teamMemberId },
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
  team: TeamWithTeamMemberType;
  teamMemberId: string;
};

const Page = ({ team, teamMemberId }: Props) => {
  return (
    <>
      <Meta description="Team Page" url="/team" />
      <TeamPage team={team} teamMemberId={teamMemberId} />
    </>
  );
};

export default Page;
Page.Layout = "APP";
