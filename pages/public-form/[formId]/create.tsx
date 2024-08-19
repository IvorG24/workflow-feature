import CreateApplicationInformationRequestPage from "@/components/CreateApplicationInformationRequestPage/CreateApplicationInformationRequestPage";
import CreateOnlineApplicationRequestPage from "@/components/CreateOnlineApplicationRequestPage/CreateOnlineApplicationRequestPage";
import CreateOnlineAssessmentRequestPage from "@/components/CreateOnlineAssessmentRequestPage/CreateOnlineAssessmentRequestPage";
import CreateRequestPage from "@/components/CreateRequestPage/CreateRequestPage";
import Meta from "@/components/Meta/Meta";
import { FormWithResponseType } from "@/utils/types";
import { Space } from "@mantine/core";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const supabaseClient = createPagesServerClient(context);
    const { data, error } = await supabaseClient.rpc(
      "create_public_request_page_on_load",
      {
        input_data: {
          formId: context.query.formId,
          applicationInformationId: context.query.applicationInformationId,
          onlineApplicationId: context.query.onlineApplicationId,
        },
      }
    );
    if (error) throw error;

    return {
      props: data as Props,
    };
  } catch (e) {
    return {
      redirect: {
        destination: "/500",
        permanent: false,
      },
    };
  }
};

type Props = {
  form: FormWithResponseType;
};

const Page = ({ form }: Props) => {
  const formslyForm = () => {
    switch (form.form_name) {
      case "Application Information":
        return <CreateApplicationInformationRequestPage form={form} />;
      case "Online Application":
        return <CreateOnlineApplicationRequestPage form={form} />;
      case "Online Assessment":
        return <CreateOnlineAssessmentRequestPage form={form} />;
      default:
        return (
          <CreateRequestPage form={form} formslyFormName={form.form_name} />
        );
    }
  };
  return (
    <>
      <Meta
        description="Public Create Request Page"
        url="/public-form/[formId]/create"
      />
      <Space h="xl" />
      {form.form_is_formsly_form ? formslyForm() : null}
      {!form.form_is_formsly_form ? (
        <CreateRequestPage form={form} formslyFormName={form.form_name} />
      ) : null}
      <Space h="xl" />
    </>
  );
};

export default Page;
Page.Layout = "NOLAYOUT";