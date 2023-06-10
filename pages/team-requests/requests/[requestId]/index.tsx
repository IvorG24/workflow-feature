import { getRequest } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import OrderToPurchaseRequestPage from "@/components/OrderToPurchaseRequestPage/OrderToPurchaseRequestPage";
import RequestPage from "@/components/RequestPage/RequestPage";
import { RequestWithResponseType } from "@/utils/types";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const supabaseClient = createServerSupabaseClient(ctx);

    const request = await getRequest(supabaseClient, {
      requestId: `${ctx.query.requestId}`,
    });

    if (!request) {
      return {
        redirect: {
          destination: "/404",
          permanent: false,
        },
      };
    }

    return {
      props: { request },
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
  request: RequestWithResponseType;
};

const Page = ({ request }: Props) => {
  const formslyForm = () => {
    switch (request.request_form.form_name) {
      case "Order to Purchase":
        return <OrderToPurchaseRequestPage request={request} />;
      case "Purchase Order":
        return <RequestPage request={request} isFormslyForm />;
      case "Invoice":
        return <RequestPage request={request} isFormslyForm />;
      case "Account Payable Voucher":
        return <RequestPage request={request} isFormslyForm />;
      case "Receiving Inspecting Report":
        return <RequestPage request={request} isFormslyForm />;
    }
  };
  return (
    <>
      <Meta
        description="Request Page"
        url="/team-requests/requests/[requestId]"
      />

      {request.request_form.form_is_formsly_form ? formslyForm() : null}
      {!request.request_form.form_is_formsly_form ? (
        <RequestPage request={request} />
      ) : null}
    </>
  );
};

export default Page;
Page.Layout = "APP";
