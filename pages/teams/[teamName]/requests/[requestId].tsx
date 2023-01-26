import Layout from "@/components/Layout/Layout";
import Request from "@/components/RequestPage/Request";
import {
  GetRequest,
  getRequest,
  GetRequestApproverList,
  getRequestApproverList,
} from "@/utils/queries";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";
import { DndListHandleProps, RequestTrail } from "./create";

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabaseClient = createServerSupabaseClient(ctx);

  const promises = [
    getRequest(supabaseClient, Number(ctx.query.requestId)),
    getRequestApproverList(supabaseClient, Number(ctx.query.requestId)),
  ];

  const result = await Promise.all(promises);

  const request = result[0] as GetRequest;
  const approverList = result[1] as GetRequestApproverList;

  if (request.length === 0 || approverList.length === 0) {
    return {
      notFound: true,
    };
  }

  // Transform to DndListHandleProps and RequestTrail so frontend can handle data easier.
  const dndList: DndListHandleProps = {
    data: request.map((field) => ({
      id: (field.field_id as number).toString(),
      type: field.request_field_type as string,
      label: field.field_name as string,
    })),
  };

  const trail: RequestTrail = {
    data: approverList.map((approver) => ({
      approverId: approver.user_id as string,
      approverAction: approver.action_id as string,
      approverUsername: approver.username as string,
      signed: approver.request_approver_action_is_approved as boolean,
    })),
  };

  return {
    props: {
      request,
      dndList,
      trail,
    },
  };
};

const RequestPage: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ request, dndList, trail }) => {
  return <Request request={request} dndList={dndList} trail={trail} />;
};

export default RequestPage;

RequestPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
