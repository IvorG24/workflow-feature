import {
  getFormslyFormId,
  getFormslyForwardLinkFormId,
  getRequest,
  getUserActiveTeamId,
} from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import OrderToPurchaseRequestPage from "@/components/OrderToPurchaseRequestPage/OrderToPurchaseRequestPage";
import RequestPage from "@/components/RequestPage/RequestPage";
import { FORM_CONNECTION } from "@/utils/constant";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import { ConnectedFormsType, FormslyFormType, RequestWithResponseType } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async ({ supabaseClient, user, context }) => {
    try {
      const request = await getRequest(supabaseClient, {
        requestId: `${context.query.requestId}`,
      });

      const teamId = await getUserActiveTeamId(supabaseClient, {
        userId: user.id,
      });
      if (!teamId) throw new Error("No team found");

      const connectedFormID = await getFormslyFormId(supabaseClient, {
        formName:
          FORM_CONNECTION[request.request_form.form_name as ConnectedFormsType],
        teamId,
      });

      const connectedRequestIDList = await getFormslyForwardLinkFormId(
        supabaseClient,
        {
          requestId: request.request_id,
        }
      );

      if (!request) {
        return {
          redirect: {
            destination: "/404",
            permanent: false,
          },
        };
      }

      return {
        props: { request, connectedFormID, connectedRequestIDList },
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
  }
);

type Props = {
  request: RequestWithResponseType;
  connectedFormID: string;
  connectedRequestIDList: FormslyFormType;
};

const Page = ({ request, connectedFormID, connectedRequestIDList }: Props) => {
  const formslyForm = () => {
    if (request.request_form.form_name === "Order to Purchase") {
      return (
        <OrderToPurchaseRequestPage
          request={request}
          connectedFormID={connectedFormID}
          connectedRequestIDList={connectedRequestIDList}
        />
      );
    } else {
      return (
        <RequestPage
          request={request}
          isFormslyForm
          connectedFormID={connectedFormID}
          connectedRequestIDList={connectedRequestIDList}
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
