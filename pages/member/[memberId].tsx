import {
  getTeamMember,
  getTeamMemberGroupList,
  getTeamMemberProjectList,
} from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import TeamMemberPage from "@/components/TeamMemberPage/TeamMemberPage";
import { ROW_PER_PAGE } from "@/utils/constant";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import {
  TeamGroupTableRow,
  TeamMemberTableRow,
  TeamProjectTableRow,
  UserTableRow,
} from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async ({ supabaseClient, context }) => {
    try {
      const member = await getTeamMember(supabaseClient, {
        teamMemberId: `${context.query.memberId}`,
      });

      const { data: groupList, count: groupCount } =
        await getTeamMemberGroupList(supabaseClient, {
          teamMemberId: `${context.query.memberId}`,
          page: 1,
          limit: ROW_PER_PAGE,
        });

      const { data: projectList, count: projectCount } =
        await getTeamMemberProjectList(supabaseClient, {
          teamMemberId: `${context.query.memberId}`,
          page: 1,
          limit: ROW_PER_PAGE,
        });

      return {
        props: { member, groupList, groupCount, projectList, projectCount },
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
  member: TeamMemberTableRow & { team_member_user: UserTableRow };
  groupList: {
    team_group_member_id: string;
    team_group: TeamGroupTableRow;
  }[];
  groupCount: number;
  projectList: {
    team_project_member_id: string;
    team_project: TeamProjectTableRow;
  }[];
  projectCount: number;
};

const Page = ({ member, groupList, groupCount, projectList, projectCount }: Props) => {
  return (
    <>
      <Meta description="User Profile Page" url="/member/<memberId>" />
      <TeamMemberPage
        member={member}
        groupList={groupList}
        groupCount={groupCount}
        projectList={projectList}
        projectCount={projectCount}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
