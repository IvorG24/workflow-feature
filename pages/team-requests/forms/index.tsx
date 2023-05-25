import { getFormList, getUserActiveTeamId } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import RequestFormListPage from "@/components/RequestFormListPage/RequestFormListPage";
import { TEMP_USER_ID } from "@/utils/dummyData";
import { FormWithTeamMember } from "@/utils/types";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const supabaseClient = createServerSupabaseClient(ctx);

    const teamId = await getUserActiveTeamId(supabaseClient, {
      userId: TEMP_USER_ID,
    });

    const forms = await getFormList(supabaseClient, {
      app: "REQUEST",
      teamId,
      isAll: true,
    });

    return {
      props: { forms },
    };
  } catch (error) {
    console.error(error);
    return {
      redirect: {
        destination: "/500",
        permanent: false,
      },
    };
  }
};

type Props = {
  forms: FormWithTeamMember[];
};

const Page = ({ forms }: Props) => {
  return (
    <>
      <Meta description="Form List Page" url="/team-requests/forms/" />
      <RequestFormListPage forms={forms} />
    </>
  );
};

export default Page;
Page.Layout = "APP";
