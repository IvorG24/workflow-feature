import Layout from "@/components/Layout/Layout";
import CommentsSection from "@/components/RequestPage/CommentsSection";
import Request from "@/components/RequestPage/Request";
import {
  GetCommentList,
  getCommentList,
  GetRequest,
  getRequest,
  GetRequestApproverList,
  getRequestApproverList,
} from "@/utils/queries";
import { RequestStatus } from "@/utils/types";
import { showNotification } from "@mantine/notifications";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement, useEffect, useState } from "react";
import { resetServerContext } from "react-beautiful-dnd";

export type DndListHandleProps = {
  data: {
    id: string;
    type: string;
    label: string;
    value: string;
    optionList: string[];
    optionTooltipList: string[];
    tooltip: string;
    isRequired: boolean;
    isDisabled: boolean;
  }[];
};

export type RequestTrail = {
  data: {
    approverId: string;
    approverUsername: string;
    approverActionId: string;
    approverActionName: string;
    approverActionStatusId: RequestStatus;
    isPrimaryApprover: boolean;
    updateStatusComment: string | null;
  }[];
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  resetServerContext();

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
      type: field.form_fact_field_type_id as string,
      label: field.field_name as string,
      value: field.response_value as string,
      optionList: field.field_option_list || [],
      optionTooltipList: field.field_option_tooltip_list || [],
      tooltip: field.field_tooltip || "",
      isRequired: !!field.field_is_required,
      isDisabled: true,
    })),
  };

  const trail: RequestTrail = {
    data: approverList.map((approver) => ({
      approverId: approver.user_id as string,
      approverActionId: approver.action_id as string,
      approverActionName: approver.action_name as string,
      approverUsername: approver.username as string,
      approverActionStatusId:
        approver.request_approver_action_status_id as RequestStatus,
      isPrimaryApprover: !!approver.request_approver_action_is_primary_approver,
      updateStatusComment:
        approver.request_approver_action_status_update_comment,
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
  const [isFetchingCommentList, setIsFetchingCommentList] = useState(true);
  const supabaseClient = useSupabaseClient();
  const router = useRouter();
  const requestId = router.query.requestId
    ? Number(router.query.requestId)
    : null;
  const [commentList, setCommentList] = useState<GetCommentList>([]);

  useEffect(() => {
    (async () => {
      try {
        setIsFetchingCommentList(true);
        if (!requestId) throw new Error("requestId is null");
        const commentList = await getCommentList(supabaseClient, requestId);

        setCommentList(commentList);
      } catch (error) {
        console.error(error);
        showNotification({
          title: "Error",
          message: "Something went wrong. Please try again later.",
          color: "red",
        });
      } finally {
        setIsFetchingCommentList(false);
      }
    })();
  }, []);

  return (
    <>
      <Request
        request={request}
        dndList={dndList}
        trail={trail}
        setIsFetchingCommentList={setIsFetchingCommentList}
        setCommentList={setCommentList}
      />
      <CommentsSection
        isFetchingCommentList={isFetchingCommentList}
        setIsFetchingCommentList={setIsFetchingCommentList}
        commentList={commentList}
        setCommentList={setCommentList}
      />
      {/* <TextEditor /> */}
    </>
  );
};

export default RequestPage;

RequestPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
