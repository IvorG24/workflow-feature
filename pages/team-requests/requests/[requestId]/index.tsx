import Meta from "@/components/Meta/Meta";
import RequestPage from "@/components/RequestPage/RequestPage";
import RequisitionRequestPage from "@/components/RequisitionRequestPage/RequisitionRequestPage";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import {
  ConnectedRequestIdList,
  RequestProjectSignerStatusType,
  RequestWithResponseType,
} from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async ({ supabaseClient, user, context }) => {
    try {
      const { data, error } = await supabaseClient.rpc("request_page_on_load", {
        input_data: {
          requestId: context.query.requestId,
          userId: user.id,
        },
      });
      console.log(data);

      if (error) throw error;
      return {
        props: data as Props,
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
  }
);

type Props = {
  request: RequestWithResponseType;
  connectedFormIdAndGroup: {
    formId: string;
    formIsForEveryone: boolean;
    formIsMember: boolean;
    formName: string;
  };
  connectedRequestIDList: ConnectedRequestIdList;
  connectedForm: {
    form_name: string;
    form_id: string;
    form_is_for_every_member: boolean;
    form_is_member: boolean;
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
    if (request.request_form.form_name === "Requisition") {
      return (
        <RequisitionRequestPage
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
          projectSignerStatus={projectSignerStatus}
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
