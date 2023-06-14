import {
  getFormslyFormId,
  getRequest,
  getUserActiveTeamId,
} from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import OrderToPurchaseRequestPage from "@/components/OrderToPurchaseRequestPage/OrderToPurchaseRequestPage";
import RequestPage from "@/components/RequestPage/RequestPage";
import { FORM_CONNECTION } from "@/utils/constant";
import { TEMP_USER_ID } from "@/utils/dummyData";
import { ConnectedFormsType, RequestWithResponseType } from "@/utils/types";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const supabaseClient = createServerSupabaseClient(ctx);

    const request = await getRequest(supabaseClient, {
      requestId: `${ctx.query.requestId}`,
    });

    const teamId = await getUserActiveTeamId(supabaseClient, {
      userId: TEMP_USER_ID,
    });

    const connectedFormID = await getFormslyFormId(supabaseClient, {
      formName:
        FORM_CONNECTION[request.request_form.form_name as ConnectedFormsType],
      teamId,
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
      props: { request, connectedFormID },
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
  connectedFormID: string;
};

const Page = ({ request, connectedFormID }: Props) => {
  const formslyForm = () => {
    if (request.request_form.form_name === "Order to Purchase") {
      return (
        <OrderToPurchaseRequestPage
          request={request}
          connectedFormID={connectedFormID}
        />
      );
    } else {
      return (
        <RequestPage
          request={request}
          isFormslyForm
          connectedFormID={connectedFormID}
        />
      );
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
