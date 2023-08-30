import { getTeamOnLoad } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import TeamPage from "@/components/TeamPage/TeamPage";
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
      const teamData = await getTeamOnLoad(supabaseClient, {
        userId: user.id,
      });

      return {
        props: teamData,
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
