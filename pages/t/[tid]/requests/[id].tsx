import TeamLayout from "@/components/Layout/TeamLayout";
import Meta from "@/components/Meta/Meta";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

import Request from "@/components/Request/Request";
import RequestContext, { RequestProps } from "@/contexts/RequestContext";
import { getRequest, getRequestWithApproverList } from "@/utils/queries-new";
import { GetServerSidePropsContext } from "next";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement, useState } from "react";

const RequestPage: NextPageWithLayout<RequestProps> = (props) => {
  const [requestProps, setRequestProps] = useState(props.request);
  const [requestWithApproverListProps, setRequestWithApproverListProps] =
    useState(props.requestWithApproverList);

  return (
    <RequestContext.Provider
      value={{
        request: requestProps,
        requestWithApproverList: requestWithApproverListProps,
        setRequest: setRequestProps,
        setRequestWithApproverList: setRequestWithApproverListProps,
      }}
    >
      <Meta description="Specific Request" url="localhost:3000/requests/id" />
      {/* <Request view="full" selectedRequest={selectedRequest} /> */}
      {/* <Request view="full" selectedRequest={selectedRequestWithAttachmentUrl} /> */}
      <Request
        view="full"
        selectedRequestId={Number(props.request[0].request_id)}
      />
      {/* <Request
        view="split"
        selectedRequestId={selectedRequestId}
        setSelectedRequestId={setSelectedRequestId}
      /> */}
    </RequestContext.Provider>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabaseClient = createServerSupabaseClient(ctx);

  const { id: requestId } = ctx.query;

  const request = await getRequest(supabaseClient, Number(requestId));
  if (!request) return { notFound: true };
  if (request.length === 0) return { notFound: true };

  const requestIdList = [request[0].request_id];
  const requestWithApproverList = await getRequestWithApproverList(
    supabaseClient,
    requestIdList as number[]
  );

  return {
    props: {
      request,
      requestWithApproverList,
    },
  };
};

RequestPage.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default RequestPage;
