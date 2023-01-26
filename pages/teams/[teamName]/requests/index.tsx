import Layout from "@/components/Layout/Layout";
import RequestList from "@/components/RequestListPage/RequestList";
import { getTeamRequestList } from "@/utils/queries";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabaseClient = createServerSupabaseClient(ctx);

  const data = await getTeamRequestList(
    supabaseClient,
    ctx.query.teamName as string
  );

  return {
    props: {
      data,
    },
  };
};

const RequestListPage: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ data }) => {
  return <RequestList requestList={data} />;
};

export default RequestListPage;

RequestListPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
