import TeamLayout from "@/components/Layout/TeamLayout";
import Meta from "@/components/Meta/Meta";
import RequestFormBuilderPage from "@/components/RequestFormBuilderPage/RequestFormBuilderPage";
import { Database } from "@/utils/database.types-new";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSideProps } from "next";
import { ReactElement } from "react";
import { resetServerContext } from "react-beautiful-dnd";
import type { NextPageWithLayout } from "../../../_app";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const supabaseClient = createServerSupabaseClient<Database>(ctx);
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
  return {
    props: {
      data: [],
    },
  };
};

const RequestFormBuilder: NextPageWithLayout = () => {
  return (
    <div>
      <Meta
        description="Build Request Form"
        // this is just a temporary url, canoncial url will be set in the future
        url="localhost:3000/testpage"
      />
      <RequestFormBuilderPage form_name="" questions={[]} />
    </div>
  );
};

RequestFormBuilder.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default RequestFormBuilder;
