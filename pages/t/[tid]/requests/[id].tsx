import TeamLayout from "@/components/Layout/TeamLayout";
import Meta from "@/components/Meta/Meta";
import RequestListContext from "@/contexts/RequestListContext";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

import Request from "@/components/Request/Request";
import { RequestProps } from "@/contexts/RequestListContext";
import {
  getRequest,
  getRequestApproverList,
  getRequestCommentList,
} from "@/utils/queries-new";
import { GetServerSidePropsContext } from "next";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement, useState } from "react";

const RequestPage: NextPageWithLayout<RequestProps> = (props) => {
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(
    props.requestIdList[0]
  );
  return (
    <RequestListContext.Provider value={props}>
      <Meta description="Specific Request" url="localhost:3000/requests/id" />
      {/* <Request view="full" selectedRequest={selectedRequest} /> */}
      {/* <Request view="full" selectedRequest={selectedRequestWithAttachmentUrl} /> */}
      <Request
        view="full"
        selectedRequestId={Number(selectedRequestId)}
        setSelectedRequestId={setSelectedRequestId}
      />
      {/* <Request
        view="split"
        selectedRequestId={selectedRequestId}
        setSelectedRequestId={setSelectedRequestId}
      /> */}
    </RequestListContext.Provider>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabase = createServerSupabaseClient(ctx);

  const { id: requestId } = ctx.query;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const request = await getRequest(supabase, Number(requestId));

  const requestList = request;
  const requestIdList = [request && request[0].form_fact_request_id];
  const requestListCount = 1;
  const formList = [
    {
      value: request && request[0].form_id,
      label: request && request[0].form_name,
    },
  ];

  const [requestApproverList, requestCommentList] = await Promise.all([
    getRequestApproverList(supabase, requestIdList as number[]),
    getRequestCommentList(supabase, requestIdList as number[]),
  ]);

  return {
    props: {
      requestIdList,
      requestList,
      requestListCount,
      formList,
      requestApproverList,
      requestCommentList,
    },
  };
};

RequestPage.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default RequestPage;
