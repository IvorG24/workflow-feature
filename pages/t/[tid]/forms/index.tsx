import FormsPage from "@/components/FormsPage/FormsPage";
import TeamLayout from "@/components/Layout/TeamLayout";
import Meta from "@/components/Meta/Meta";
import { distinctByKey } from "@/utils/object";
import {
  getTeamFormTemplateList,
  GetTeamFormTemplateList,
} from "@/utils/queries-new";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSideProps } from "next";
import { ReactElement } from "react";
import type { NextPageWithLayout } from "../../../_app";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const supabase = createServerSupabaseClient(ctx);
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) throw new Error("Not authorized");

    const teamRequestFormList = await getTeamFormTemplateList(
      supabase,
      ctx.params?.tid as string
    );

    // Make teamRequestFormList distinct by form_fact_form_id.
    const distinctFormList =
      teamRequestFormList &&
      distinctByKey(teamRequestFormList, "form_fact_form_id");

    return {
      props: {
        formList: distinctFormList,
      },
    };
  } catch (error) {
    return {
      props: { formList: null },
    };
  }
};

type Props = {
  formList: NonNullable<GetTeamFormTemplateList>;
};

const Forms: NextPageWithLayout<Props> = ({ formList }) => {
  return (
    <div>
      {/* todo: fix meta tags */}
      <Meta
        description="Forms Page for every form"
        url="localhost:3000/forms"
      />
      <FormsPage teamRequestFormList={formList} />
    </div>
  );
};

Forms.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default Forms;
