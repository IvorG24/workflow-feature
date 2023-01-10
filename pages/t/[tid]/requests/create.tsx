import CreateRequest from "@/components/CreateRequest/CreateRequest";
import TeamLayout from "@/components/Layout/TeamLayout";
import Meta from "@/components/Meta/Meta";
import CreateRequestContext, {
  CreateRequestProps,
} from "@/contexts/CreateRequestContext";
import { getFormTemplate, getTeam, getUserProfile } from "@/utils/queries-new";
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
  const { tid: teamId, formId } = ctx.query;

  const [formTemplate, teamMemberList, currentUserProfile] = await Promise.all([
    getFormTemplate(supabaseClient, Number(formId)),
    getTeam(supabaseClient, teamId as string),
    getUserProfile(supabaseClient, user?.id as string),
  ]);

  const order = formTemplate && formTemplate[0].order_field_id_list;

  formTemplate &&
    formTemplate.sort((a, b) => {
      if (!order) return 0;
      return (
        order.indexOf(a.field_id as number) -
        order.indexOf(b.field_id as number)
      );
    });

  const approverList =
    teamMemberList &&
    teamMemberList
      .filter(
        (member) =>
          (member.member_role_id === "owner" ||
            member.member_role_id === "admin") &&
          member.user_id !== user?.id
      )
      .map((approver) => ({
        label: approver.username,
        value: approver.user_id,
      }));

  const purchaserList =
    teamMemberList &&
    teamMemberList
      .filter(
        (member) =>
          member.member_role_id === "purchaser" && member.user_id !== user?.id
      )
      .map((purchaser) => ({
        label: purchaser.username,
        value: purchaser.user_id,
      }));

  return {
    props: {
      formTemplate,
      purchaserList,
      approverList,
      currentUserProfile,
    },
  };
};

CreateRequestPage.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default CreateRequestPage;
