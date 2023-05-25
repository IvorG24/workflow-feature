import { getRequestList, getUserActiveTeamId } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import RequestListPage from "@/components/RequestListPage/RequestListPage";
import { DEFAULT_REQUEST_LIST_LIMIT } from "@/utils/contant";
import { TEMP_USER_ID } from "@/utils/dummyData";
import { RequestType } from "@/utils/types";
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

    return {
      props: { requestList: data, requestListCount: count },
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
};

const Page = ({ requestList, requestListCount }: Props) => {
  console.log(requestList);
  return (
    <>
      <Meta description="Request List Page" url="/team-requests/requests" />
      <RequestListPage
        requestList={requestList}
        requestListCount={requestListCount}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
