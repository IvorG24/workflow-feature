import { getForm } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import RequestFormPage from "@/components/RequestFormPage/RequestFormPage";
import { FormType } from "@/utils/types";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const supabaseClient = createServerSupabaseClient(ctx);

    const form = await getForm(supabaseClient, {
      formId: `${ctx.query.formId}`,
    });

    return {
      props: { form },
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
  form: FormType
}

const Page = ({ form }: Props) => {
  return (
    <>
      <Meta description="Request Page" url="/team-requests/forms/[formId]" />
      <RequestFormPage form={form} />
    </>
  );
};

export default Page;
Page.Layout = "APP";
