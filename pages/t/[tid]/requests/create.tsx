import CreateRequest from "@/components/CreateRequest/CreateRequest";
import TeamLayout from "@/components/Layout/TeamLayout";
import Meta from "@/components/Meta/Meta";
import CreateRequestContext, {
  CreateRequestProps,
} from "@/contexts/CreateRequestContext";
import {
  getFormTemplate,
  GetRequestApproverList,
  getRequestApproverList,
  getRequestDraft,
} from "@/utils/queries-new";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";
import { ReactElement } from "react";
import { resetServerContext } from "react-beautiful-dnd";
import type { NextPageWithLayout } from "../../../_app";

const CreateRequestPage: NextPageWithLayout<CreateRequestProps> = (props) => {
  // todo: fix meta tags
  return (
    <CreateRequestContext.Provider value={props}>
      <Meta
        description="Create Request Page"
        url="localhost:3000/requests/create"
      />

      <CreateRequest />
    </CreateRequestContext.Provider>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabaseClient = createServerSupabaseClient(ctx);
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session)
    return {
      redirect: {
        destination: "/sign-in",
        permanent: false,
      },
    };

  resetServerContext();
  const user = session.user;
  const { formId } = ctx.query;

  const [template, requestDraft] = await Promise.all([
    getFormTemplate(supabaseClient, Number(formId)),
    getRequestDraft(supabaseClient, Number(formId), user?.id as string),
  ]);

  const hasDraft = requestDraft && requestDraft.length > 0;
  const formTemplate = hasDraft ? requestDraft : template;

  const order = formTemplate && formTemplate[0].order_field_id_list;

  formTemplate &&
    formTemplate.sort((a, b) => {
      if (!order) return 0;
      return (
        order.indexOf(a.field_id as number) -
        order.indexOf(b.field_id as number)
      );
    });

  let approverList = [] as GetRequestApproverList;
  if (hasDraft) {
    const requestId = requestDraft && requestDraft[0].request_id;
    approverList = await getRequestApproverList(
      supabaseClient,
      requestId as number
    );
  }

  return {
    props: {
      formTemplate,
      isDraft: hasDraft,
      approverList,
    },
  };
};

CreateRequestPage.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default CreateRequestPage;
