import { getRequest } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import RequestPage from "@/components/RequestPage/RequestPage";
import { RequestWithResponseType } from "@/utils/types";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const supabaseClient = createServerSupabaseClient(ctx);

    const request = await getRequest(supabaseClient, {
      requestId: `${ctx.query.requestId}`,
    });

    return {
      props: { request },
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
  request: RequestWithResponseType;
}

const Page = ({ request } : Props) => {
  return (
    <>
      <Meta
        description="Request Page"
        url="/team-requests/requests/[requestId]"
      />
      <RequestPage request={request} />
    </>
  );
};

export default Page;
Page.Layout = "APP";
