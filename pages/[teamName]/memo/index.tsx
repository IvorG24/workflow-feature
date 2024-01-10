import { getMemoList, getTeamMemberList } from "@/backend/api/get";
import MemoListPage from "@/components/Memo/MemoListPage";
import Meta from "@/components/Meta/Meta";
import { withActiveTeam } from "@/utils/server-side-protections";
import { MemoListItemType, TeamMemberType } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withActiveTeam(
  async ({ supabaseClient, userActiveTeam }) => {
    try {
      const { data, count } = await getMemoList(supabaseClient, {
        teamId: userActiveTeam.team_id,
        page: 1,
        limit: 13,
      });

      const teamMemberList = await getTeamMemberList(supabaseClient, {
        teamId: userActiveTeam.team_id,
      });

      return {
        props: { memoList: data, memoListCount: count, teamMemberList },
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
  memoList: MemoListItemType[];
  memoListCount: number;
  teamMemberList: TeamMemberType[];
};

const Page = ({ memoList, memoListCount, teamMemberList }: Props) => {
  return (
    <>
      <Meta description="Create Memo Page" url="/teamName/memo/" />
      <MemoListPage
        memoList={memoList}
        memoListCount={memoListCount}
        teamMemberList={teamMemberList}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
