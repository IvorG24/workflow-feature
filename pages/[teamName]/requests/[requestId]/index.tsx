import ItemRequestPage from "@/components/ItemRequestPage/ItemRequestPage";
import Meta from "@/components/Meta/Meta";
import OtherExpensesRequestPage from "@/components/OtherExpensesRequestPage/OtherExpensesRequestPage";
import PEDConsumableRequestPage from "@/components/PEDConsumableRequestPage/PEDConsumableRequestPage";
import PEDEquipmentRequestPage from "@/components/PEDEquipmentRequestPage/PEDEquipmentRequestPage";
import PEDPartRequestPage from "@/components/PEDPartRequestPage/PEDPartRequestPage";
import RequestForPaymentRequestPage from "@/components/RequestForPaymentRequestPage/RequestForPaymentRequestPage";
import RequestPage from "@/components/RequestPage/RequestPage";
import ServicesRequestPage from "@/components/ServicesRequestPage/ServicesRequestPage";
import { withAuthAndOnboardingRequestPage } from "@/utils/server-side-protections";
import {
  ConnectedRequestIdList,
  RequestProjectSignerStatusType,
  RequestWithResponseType,
} from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps =
  withAuthAndOnboardingRequestPage(
    async ({ supabaseClient, user, context }) => {
      try {
        const { data, error } = await supabaseClient.rpc(
          "request_page_on_load",
          {
            input_data: {
              requestId: context.query.requestId,
              userId: user.id,
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
    }
  );

type Props = {
  request: RequestWithResponseType;
  connectedFormIdAndGroup: {
    formId: string;
    formIsForEveryone: boolean;
    formIsMember: boolean;
    formName: string;
    formIsHidden: boolean;
  };
  connectedRequestIDList: ConnectedRequestIdList;
  connectedForm: {
    form_name: string;
    form_id: string;
    form_is_for_every_member: boolean;
    form_is_member: boolean;
    form_is_hidden: boolean;
  }[];
  canvassRequest?: string[];
  projectSignerStatus?: RequestProjectSignerStatusType;
};

const Page = ({
  request,
  connectedFormIdAndGroup,
  connectedRequestIDList,
  connectedForm = [],
  canvassRequest = [],
  projectSignerStatus,
}: Props) => {
  const formslyForm = () => {
    if (request.request_form.form_name === "Item") {
      return (
        <ItemRequestPage
          request={request}
          connectedForm={connectedForm}
          connectedRequestIDList={connectedRequestIDList}
          canvassRequest={canvassRequest}
        />
      );
    } else if (request.request_form.form_name === "Services") {
      return <ServicesRequestPage request={request} />;
    } else if (request.request_form.form_name === "Other Expenses") {
      return <OtherExpensesRequestPage request={request} />;
    } else if (request.request_form.form_name === "PED Equipment") {
      return <PEDEquipmentRequestPage request={request} />;
    } else if (request.request_form.form_name === "PED Part") {
      return <PEDPartRequestPage request={request} />;
    } else if (request.request_form.form_name === "PED Consumable") {
      return <PEDConsumableRequestPage request={request} />;
    } else if (request.request_form.form_name === "Request For Payment") {
      return <RequestForPaymentRequestPage request={request} />;
    } else {
      return (
        <RequestPage
          request={request}
          isFormslyForm
          connectedFormIdAndGroup={connectedFormIdAndGroup}
          connectedRequestIDList={connectedRequestIDList}
          projectSignerStatus={projectSignerStatus}
        />
      );
    }
  };
  return (
    <>
      <Meta description="Request Page" url="/teamName/requests/[requestId]" />
      {request.request_form.form_is_formsly_form ? formslyForm() : null}
      {!request.request_form.form_is_formsly_form ? (
        <RequestPage request={request} />
      ) : null}
    </>
  );
};

export default Page;
Page.Layout = "APP";
