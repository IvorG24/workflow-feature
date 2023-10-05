import Meta from "@/components/Meta/Meta";
import RequestPage from "@/components/RequestPage/RequestPage";
import { RequestWithResponseType } from "@/utils/types";
import { Space } from "@mantine/core";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const supabaseClient = createPagesServerClient(context);
  try {
    const { data, error } = await supabaseClient.rpc("get_request", {
      request_id: `${context.query.requestId}`,
    });
    if (error) throw error;

    return {
      props: {
        request: data,
      },
    };
  } catch (e) {
    console.error(e);
    return {
      redirect: {
        destination: "/500",
        permanent: false,
      },
    };
  }
};

type Props = {
  request: RequestWithResponseType;
};

const Page = ({ request }: Props) => {
  return (
    <>
      <Meta
        description="Request Page"
        url="/team-requests/requests/[requestId]"
      />
      <Space h="xl" />
      <RequestPage
        request={request}
        isAnon={true}
        isFormslyForm={request.request_form.form_is_formsly_form}
      />
      <Space h="xl" />
    </>
  );
};

export default Page;
Page.Layout = "HOME";
