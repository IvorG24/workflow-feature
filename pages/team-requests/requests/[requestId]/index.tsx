import {
  getFormIDForOTP,
  getFormslyForm,
  getFormslyForwardLinkFormId,
  getOTPPendingQuotationRequestList,
  getRequest,
  getUserActiveTeamId,
} from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import OrderToPurchaseRequestPage from "@/components/OrderToPurchaseRequestPage/OrderToPurchaseRequestPage";
import RequestPage from "@/components/RequestPage/RequestPage";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import { FormslyFormType, RequestWithResponseType } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async ({ supabaseClient, user, context }) => {
    try {
      const request = await getRequest(supabaseClient, {
        requestId: `${context.query.requestId}`,
      });

      if (!request) {
        return {
          redirect: {
            destination: "/404",
            permanent: false,
          },
        };
      }

      if (!request.request_form.form_is_formsly_form) {
        return {
          props: { request },
        };
      }

      const teamId = await getUserActiveTeamId(supabaseClient, {
        userId: user.id,
      });
      if (!teamId) throw new Error("No team found");

      const connectedRequestIDList = await getFormslyForwardLinkFormId(
        supabaseClient,
        {
          requestId: request.request_id,
        }
      );

      if (request.request_form.form_name === "Order to Purchase") {
        const connectedForm = await getFormIDForOTP(supabaseClient, {
          teamId,
        });

        const canvassRequest = await getOTPPendingQuotationRequestList(
          supabaseClient,
          { requestId: request.request_id }
        );

        return {
          props: {
            request,
            connectedForm,
            connectedRequestIDList,
            canvassRequest,
          },
        };
      } else if (request.request_form.form_name === "Quotation") {
        const connectedForm = await getFormslyForm(supabaseClient, {
          formName: "Receiving Inspecting Report (Purchased)",
          teamId,
        });

        return {
          props: {
            request,
            connectedFormIdAndGroup: {
              formId: connectedForm?.form_id,
              formGroup: connectedForm?.form_group,
              formIsForEveryone: connectedForm?.form_is_for_every_member,
            },
            connectedRequestIDList,
          },
        };
      } else {
        return {
          props: {
            request,
            connectedRequestIDList,
          },
        };
      }
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
  connectedFormIdAndGroup: {
    formId: string;
    formGroup: string[];
    formIsForEveryone: boolean;
  };
  connectedRequestIDList: FormslyFormType;
  connectedForm: {
    form_name: string;
    form_id: string;
    form_group: string[];
    form_is_for_every_member: boolean;
  }[];
  canvassRequest?: string[];
};

const Page = ({
  request,
  connectedFormIdAndGroup,
  connectedRequestIDList,
  connectedForm,
  canvassRequest = [],
}: Props) => {
  const formslyForm = () => {
    if (request.request_form.form_name === "Order to Purchase") {
      return (
        <OrderToPurchaseRequestPage
          request={request}
          connectedForm={connectedForm}
          connectedRequestIDList={connectedRequestIDList}
          canvassRequest={canvassRequest}
        />
      );
    } else {
      return (
        <RequestPage
          request={request}
          isFormslyForm
          connectedFormIdAndGroup={connectedFormIdAndGroup}
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
