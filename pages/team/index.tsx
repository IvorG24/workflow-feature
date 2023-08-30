import {
  getTeam,
  getTeamGroupList,
  getTeamMemberList,
  getTeamProjectList,
  getUserActiveTeamId,
} from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import TeamPage from "@/components/TeamPage/TeamPage";
import { ROW_PER_PAGE } from "@/utils/constant";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import {
  TeamGroupTableRow,
  TeamMemberType,
  TeamProjectTableRow,
  TeamTableRow,
} from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async ({ supabaseClient, user }) => {
    try {
      const teamId = await getUserActiveTeamId(supabaseClient, {
        userId: user.id,
      });
      if (!teamId) {
        return {
          redirect: {
            destination: "/team/create",
            permanent: false,
          },
        };
      }

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

      const { data: teamGroups, count: teamGroupsCount } =
        await getTeamGroupList(supabaseClient, {
          teamId: team.team_id,
          page: 1,
          limit: ROW_PER_PAGE,
        });

      const { data: teamProjects, count: teamProjectsCount } =
        await getTeamProjectList(supabaseClient, {
          teamId: team.team_id,
          page: 1,
          limit: ROW_PER_PAGE,
        });

      return {
        props: {
          team,
          teamMembers,
          teamGroups,
          teamProjects,
          teamGroupsCount,
          teamProjectsCount,
        },
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
  teamGroups: TeamGroupTableRow[];
  teamProjects: TeamProjectTableRow[];
  teamGroupsCount: number;
  teamProjectsCount: number;
};

const Page = ({
  team,
  teamMembers,
  teamGroups,
  teamProjects,
  teamGroupsCount,
  teamProjectsCount,
}: Props) => {
  return (
    <>
      <Meta description="Team Page" url="/team" />
      <TeamPage
        team={team}
        teamMembers={teamMembers}
        teamGroups={teamGroups}
        teamProjects={teamProjects}
        teamGroupsCount={teamGroupsCount}
        teamProjectsCount={teamProjectsCount}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
