import {
  getAllTeamMembers,
  getRequestList,
  getUserActiveTeamId,
} from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import RequestListPage from "@/components/RequestListPage/RequestListPage";
import { DEFAULT_REQUEST_LIST_LIMIT } from "@/utils/constant";
import { TEMP_USER_ID } from "@/utils/dummyData";
import { RequestType, TeamMemberWithUserType } from "@/utils/types";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const supabaseClient = createServerSupabaseClient(ctx);
    const teamId = await getUserActiveTeamId(supabaseClient, {
      userId: TEMP_USER_ID,
    });

    const { data, count } = await getRequestList(supabaseClient, {
      teamId: teamId,
      page: 1,
      limit: DEFAULT_REQUEST_LIST_LIMIT,
    });

    const teamMemberList = await getAllTeamMembers(supabaseClient, {
      teamId,
    });

    return {
      props: { requestList: data, requestListCount: count, teamMemberList },
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
  requestList: RequestType[];
  requestListCount: number;
  teamMemberList: TeamMemberWithUserType[];
};

const Page = ({ requestList, requestListCount, teamMemberList }: Props) => {
  return (
    <>
      <Meta description="Request List Page" url="/team-requests/requests" />
      <RequestListPage
        requestList={requestList}
        requestListCount={requestListCount}
        teamMemberList={teamMemberList}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
