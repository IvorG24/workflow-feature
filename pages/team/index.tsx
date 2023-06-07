import {
  getTeam,
  getTeamMemberList,
  getUserActiveTeamId,
} from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import TeamPage from "@/components/TeamPage/TeamPage";
import { TEMP_USER_ID } from "@/utils/dummyData";
import { TeamMemberType, TeamTableRow } from "@/utils/types";
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
    if (!team) {
      return {
        redirect: {
          destination: "/404",
          permanent: false,
        },
      };
    }

    const teamMembers = await getTeamMemberList(supabaseClient, {
      teamId: team.team_id,
    });

    return {
      props: { team, teamMembers },
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
  team: TeamTableRow;
  teamMembers: TeamMemberType[];
};

const Page = ({ team, teamMembers }: Props) => {
  return (
    <>
      <Meta description="Team Page" url="/team" />
      <TeamPage team={team} teamMembers={teamMembers} />
    </>
  );
};

export default Page;
Page.Layout = "APP";
