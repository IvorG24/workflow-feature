import { getRequest } from "@/backend/api/get";
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
      } else {
        const { data, error } = await supabaseClient.rpc(
          "request_page_on_load",
          {
            input_data: {
              requestId: request.request_id,
              userId: user.id,
              formName: request.request_form.form_name,
              formId: request.request_form.form_id,
              projectId: request.request_project_id,
            },
          }
        );
        if (error) throw error;
        const formattedData = data as Props & {
          requestSignerData: {
            team_project_name: string;
            request_signer_status: string;
            signer_team_member_id: string;
          }[];
        } & { signerData: { signer_id: string }[] };

        if (request.request_form.form_name === "Sourced Item") {
          const projectSignerStatus = formattedData.requestSignerData.map(
            (signer) => ({
              signer_project_name: signer.team_project_name,
              signer_status: signer.request_signer_status,
              signer_team_member_id: signer.signer_team_member_id,
            })
          );
          const mainSignerIdList = formattedData.signerData.map(
            (signer) => signer.signer_id
          );

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
              projectSignerStatus,
              formattedData,
            },
          };
        } else {
          return {
            props: {
              ...{
                ...formattedData,
                request,
              },
            },
          };
        }
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
