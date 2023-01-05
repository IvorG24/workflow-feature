// TODO: Redirect '/requests' to '/requests?active_tab=all&page=1'

import TeamLayout from "@/components/Layout/TeamLayout";
import Meta from "@/components/Meta/Meta";
import RequestListPage from "@/components/RequestsPage/RequestsPage";
import RequestListContext from "@/contexts/RequestListContext";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/router";

import { RequestProps } from "@/contexts/RequestListContext";
import { distinctByKey } from "@/utils/object";
import {
  getRequestApproverList,
  getRequestCommentList,
  getTeamRequestList,
} from "@/utils/queries-new";
import { RequestStatus } from "@/utils/types-new";
import { GetServerSidePropsContext } from "next";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";

const RequestsPage: NextPageWithLayout<RequestProps> = (props) => {
  const router = useRouter();

  // todo: fix meta tags
  return (
    <RequestListContext.Provider value={props}>
      <Meta description="List of all Requests" url="localhost:3000/requests" />
      <RequestListPage />
    </RequestListContext.Provider>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabase = createServerSupabaseClient(ctx);

  const {
    tid: teamId,
    page: activePage,
    form,
    search_query: searchQuery,
    active_tab,
    status,
  } = ctx.query;
  const request_per_page = 8;
  const start = (Number(activePage) - 1) * request_per_page;
  const activeTab = active_tab !== "all" ? active_tab : false;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [requestList, requestListNoRange] = await Promise.all([
    getTeamRequestList(supabase, {
      teamId: teamId as string,
      userId: user?.id as string,
      formId: Number(form),
      requestStatus: status as RequestStatus,
      keyword: searchQuery as string,
      direction: activeTab as "received" | "sent",
      pageSize: request_per_page,
      pageNumber: start,
    }),
    getTeamRequestList(supabase, {
      teamId: teamId as string,
      userId: user?.id as string,
      formId: Number(form),
      keyword: searchQuery as string,
      requestStatus: status as RequestStatus,
      direction: activeTab as "received" | "sent",
    }),
  ]);

  // Get distinct request id list.
  const requestListCount = distinctByKey(
    requestListNoRange,
    "form_fact_request_id"
  ).length;

  // Get distinct request id list from team request list.
  const requestIdList = distinctByKey(requestList, "form_fact_request_id").map(
    (request) => request.form_fact_request_id
  );

  const [requestApproverList, requestCommentList] = await Promise.all([
    getRequestApproverList(supabase, requestIdList as number[]),
    getRequestCommentList(supabase, requestIdList as number[]),
  ]);

  return {
    props: {
      requestIdList,
      requestList,
      requestListCount,
      requestApproverList,
      requestCommentList,
    },
  };
};

RequestsPage.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default RequestsPage;
