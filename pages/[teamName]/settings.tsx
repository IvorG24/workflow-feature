import { getTeamOnLoad } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import TeamPage from "@/components/TeamPage/TeamPage";
import { ROW_PER_PAGE } from "@/utils/constant";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import {
  TeamGroupTableRow,
  TeamMemberType,
  TeamProjectWithAddressType,
  TeamTableRow,
  UserValidIDTableRow,
} from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async ({ supabaseClient, user }) => {
    try {
      const teamData = await getTeamOnLoad(supabaseClient, {
        userId: user.id,
        teamMemberLimit: ROW_PER_PAGE,
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
  teamProjects: TeamProjectWithAddressType[];
  teamMembersCount: number;
  teamGroupsCount: number;
  teamProjectsCount: number;
  pendingValidIDList: UserValidIDTableRow[];
};

const Page = ({
  team,
  teamMembers,
  teamGroups,
  teamProjects,
  teamMembersCount,
  teamGroupsCount,
  teamProjectsCount,
  pendingValidIDList,
}: Props) => {
  return (
    <>
      <Meta description="Team Page" url="/teamName/settings" />
      <TeamPage
        team={team}
        teamMembers={teamMembers}
        teamGroups={teamGroups}
        teamProjects={teamProjects}
        teamMembersCount={teamMembersCount}
        teamGroupsCount={teamGroupsCount}
        teamProjectsCount={teamProjectsCount}
        pendingValidIDList={pendingValidIDList}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
