import { getRequestList, getUserActiveTeamId } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import RequestListPage from "@/components/RequestListPage/RequestListPage";
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

    const requestList = await getRequestList(supabaseClient, {
      teamId: teamId,
    });

    return {
      props: { requestList },
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
};

const Page = ({ requestList }: Props) => {
  return (
    <>
      <Meta description="Request List Page" url="/team-requests/requests" />
      <RequestListPage requestList={requestList} />
    </>
  );
};

export default Page;
Page.Layout = "APP";
