import Layout from "@/components/Layout/Layout";
import Request from "@/components/RequestPage/Request";
import { getRequest, getRequestApproverList } from "@/utils/queries";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabaseClient = createServerSupabaseClient(ctx);

  const promises = [
    getRequest(supabaseClient, Number(ctx.query.requestId)),
    getRequestApproverList(supabaseClient, Number(ctx.query.requestId)),
  ];

  const [request, approverList] = await Promise.all(promises);

  return {
    props: {
      request,
      approverList,
    },
  };
};

const RequestPage: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ request, approverList }) => {
  return <Request request={request} approverList={approverList} />;
};

export default RequestPage;

RequestPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
