import TeamLayout from "@/components/Layout/TeamLayout";
import Meta from "@/components/Meta/Meta";
import Request from "@/components/RequestsPage/RequestsPage";
import RequestListContext from "@/contexts/RequestListContext";
import { RetrievedRequestList, retrieveRequestList } from "@/utils/queries";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

import { GetServerSidePropsContext } from "next";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";

type Props = {
  requestList: RetrievedRequestList["requestList"];
  requestCount: number;
};

const RequestsPage: NextPageWithLayout<Props> = (props) => {
  // todo: fix meta tags
  return (
    <RequestListContext.Provider value={props}>
      <Meta description="List of all Requests" url="localhost:3000/requests" />
      <Request />
    </RequestListContext.Provider>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabase = createServerSupabaseClient(ctx);

  const {
    tid: teamId,
    page: activePage,
    form: form,
    search_query: searchQuery,
    active_tab: activeTab,
  } = ctx.query;
  const request_per_page = 8;
  const start = (Number(activePage) - 1) * request_per_page;
  const selectedForm = form === undefined ? null : (form as string);

  const search = searchQuery === undefined ? "" : (searchQuery as string);
  const isSearch = searchQuery ? true : false;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { requestList, requestCount } = await retrieveRequestList(
    supabase,
    start,
    `${teamId}`,
    request_per_page,
    selectedForm,
    null,
    search,
    isSearch,
    activeTab as string,
    user?.id
  );

  return {
    props: {
      requestList,
      requestCount,
    },
  };
};

RequestsPage.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default RequestsPage;
