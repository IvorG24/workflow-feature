import FormsPage from "@/components/FormsPage/FormsPage";
import TeamLayout from "@/components/Layout/TeamLayout";
import Meta from "@/components/Meta/Meta";
import {
  FetchTeamRequestFormList,
  fetchTeamRequestFormList,
} from "@/utils/queries";
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

    const teamRequestFormList = await fetchTeamRequestFormList(
      supabase,
      ctx.params?.tid
    );

    return {
      props: {
        teamRequestFormList,
      },
    };
  } catch (error) {
    return {
      props: { teamRequestFormList: null },
    };
  }
};

type Props = {
  teamRequestFormList: FetchTeamRequestFormList;
};

const Forms: NextPageWithLayout = ({ teamRequestFormList }: Props) => {
  return (
    <div>
      {/* todo: fix meta tags */}
      <Meta
        description="Forms Page for every form"
        url="localhost:3000/forms"
      />
      <FormsPage teamRequestFormList={teamRequestFormList} />
    </div>
  );
};

Forms.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default Forms;
