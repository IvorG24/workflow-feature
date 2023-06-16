import {
  getTeam,
  getTeamMemberList,
  getUserActiveTeamId,
} from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import TeamPage from "@/components/TeamPage/TeamPage";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import { TeamMemberType, TeamTableRow } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async ({ supabaseClient, user }) => {
    try {
      const teamId = await getUserActiveTeamId(supabaseClient, {
        userId: user.id,
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
  }
);

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
