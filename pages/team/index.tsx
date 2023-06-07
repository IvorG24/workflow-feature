import {
  getTeam,
  getTeamMemberList,
  getUserActiveTeamId,
} from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import TeamPage from "@/components/TeamPage/TeamPage";
import { DEFAULT_TEAM_MEMBER_LIST_LIMIT } from "@/utils/constant";
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

    const { data: teamMembers, count: teamMembersCount } =
      await getTeamMemberList(supabaseClient, {
        teamId: team.team_id,
        page: 1,
        limit: DEFAULT_TEAM_MEMBER_LIST_LIMIT,
      });

    return {
      props: { team, teamMembers, teamMembersCount },
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
  teamMembersCount: number;
};

const Page = ({ team, teamMembers, teamMembersCount }: Props) => {
  return (
    <>
      <Meta description="Team Page" url="/team" />
      <TeamPage
        team={team}
        teamMembers={teamMembers}
        teamMembersCount={teamMembersCount}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
