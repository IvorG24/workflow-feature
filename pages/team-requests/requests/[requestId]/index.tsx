import {
  getFormIDForRequsition,
  getFormslyForm,
  getFormslyForwardLinkFormId,
  getRequest,
  getRequisitionPendingQuotationRequestList,
  getUserActiveTeamId,
  getUserTeamMemberData,
} from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import RequestPage from "@/components/RequestPage/RequestPage";
import RequisitionRequestPage from "@/components/RequisitionRequestPage/RequisitionRequestPage";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import { ConnectedRequestIdList, RequestWithResponseType } from "@/utils/types";
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

      const teamMember = await getUserTeamMemberData(supabaseClient, {
        teamId,
        userId: user.id,
      });

      const connectedRequestIDList = await getFormslyForwardLinkFormId(
        supabaseClient,
        {
          requestId: request.request_id,
        }
      );

      if (request.request_form.form_name === "Requisition") {
        const connectedForm = await getFormIDForRequsition(supabaseClient, {
          teamId,
          memberId: `${teamMember?.team_member_id}`,
        });

        const canvassRequestList =
          await getRequisitionPendingQuotationRequestList(supabaseClient, {
            requestId: request.request_id,
          });

        const canvassRequest = canvassRequestList.map(
          (request) => request.request_id
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
          formName: "Receiving Inspecting Report",
          teamId,
          memberId: `${teamMember?.team_member_id}`,
        });

        return {
          props: {
            request,
            connectedFormIdAndGroup: {
              formId: connectedForm?.form_id,
              formIsForEveryone: connectedForm?.form_is_for_every_member,
              formIsMember: connectedForm?.form_is_member,
              formName: "Receiving Inspecting Report",
            },
            connectedRequestIDList,
          },
        };
      } else if (request.request_form.form_name === "Sourced Item") {
        const connectedForm = await getFormslyForm(supabaseClient, {
          formName: "Release Order",
          teamId,
          memberId: `${teamMember?.team_member_id}`,
        });

        return {
          props: {
            request,
            connectedFormIdAndGroup: {
              formId: connectedForm?.form_id,
              formIsForEveryone: connectedForm?.form_is_for_every_member,
              formIsMember: connectedForm?.form_is_member,
              formName: "Release Order",
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
};

const Page = ({
  request,
  connectedFormIdAndGroup,
  connectedRequestIDList,
  connectedForm,
  canvassRequest = [],
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
