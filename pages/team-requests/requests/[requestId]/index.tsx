import {
  getFormIDForRequsition,
  getFormSigner,
  getFormslyForm,
  getFormslyForwardLinkFormId,
  getRequest,
  getRequestProjectSigner,
  getRequisitionPendingQuotationRequestList,
  getUserActiveTeamId,
  getUserTeamMemberData,
} from "@/backend/api/get";
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

        const data = await getFormSigner(supabaseClient, {
          formId: request.request_form.form_id,
          projectId: `${request.request_project_id}`,
        });

        const requestProjectSigner = await getRequestProjectSigner(
          supabaseClient,
          {
            requestId: request.request_id,
          }
        );

        const projectSignerStatus = requestProjectSigner.map((signer) => ({
          signer_project_name:
            signer.request_signer.signer_team_project.team_project_name,
          signer_status: signer.request_signer_status,
          signer_team_member_id: signer.request_signer.signer_team_member_id,
        }));

        const mainSignerIdList = data.map((signer) => signer.signer_id);

        return {
          props: {
            request: {
              ...request,
              request_signer: request.request_signer.map((requestSigner) => {
                if (
                  !mainSignerIdList.includes(
                    requestSigner.request_signer_signer.signer_id
                  )
                ) {
                  return {
                    ...requestSigner,
                    request_signer_signer: {
                      ...requestSigner.request_signer_signer,
                      signer_is_primary_signer: false,
                    },
                  };
                } else {
                  return requestSigner;
                }
              }),
            },
            connectedFormIdAndGroup: {
              formId: connectedForm?.form_id,
              formIsForEveryone: connectedForm?.form_is_for_every_member,
              formIsMember: connectedForm?.form_is_member,
              formName: "Release Order",
            },
            connectedRequestIDList,
            projectSignerStatus,
          },
        };
      } else if (request.request_form.form_name === "Release Order") {
        const connectedForm = await getFormslyForm(supabaseClient, {
          formName: "Transfer Receipt",
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
              formName: "Transfer Receipt",
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
  projectSignerStatus?: RequestProjectSignerStatusType;
};

const Page = ({
  request,
  connectedFormIdAndGroup,
  connectedRequestIDList,
  connectedForm,
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
