import {
  getTeam,
  getTeamMemberList,
  getUserActiveTeamId,
} from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import TeamPage from "@/components/TeamPage/TeamPage";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import { TeamMemberType, TeamTableRow } from "@/utils/types";
import { isArray } from "lodash";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async ({ supabaseClient, user }) => {
    try {
      const teamId = await getUserActiveTeamId(supabaseClient, {
        userId: user.id,
      });
      if (!teamId) throw new Error("No team found");

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

      const teamGroups: Record<string, TeamMemberType[]> = {};
      team.team_group_list
        ? team.team_group_list.forEach((group) => {
            teamGroups[group] = [];
          })
        : [];

      const teamProjects: Record<string, TeamMemberType[]> = {};
      team.team_project_list
        ? team.team_project_list.forEach((project) => {
            teamProjects[project] = [];
          })
        : [];

      teamMembers.forEach((member) => {
        if (member.team_member_group_list) {
          member.team_member_group_list.forEach((group) => {
            if (isArray(teamGroups[group])) {
              teamGroups[group].push(member);
            }
          });
        }

        if (member.team_member_project_list) {
          member.team_member_project_list.forEach((project) => {
            if (isArray(teamProjects[project])) {
              teamProjects[project].push(member);
            }
          });
        }
      });

      return {
        props: { team, teamMembers, teamGroups, teamProjects },
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
  teamGroups: Record<string, TeamMemberType[]>;
  teamProjects: Record<string, TeamMemberType[]>;
};

const Page = ({ team, teamMembers, teamGroups, teamProjects }: Props) => {
  return (
    <>
      <Meta description="Team Page" url="/team" />
      <TeamPage
        team={team}
        teamMembers={teamMembers}
        teamGroups={teamGroups}
        teamProjects={teamProjects}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
