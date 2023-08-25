import {
  checkRequest,
  getAllItems,
  getAllTeamMemberProjects,
  getAllTeamProjects,
  getForm,
  getItemResponseForQuotation,
  getItemResponseForRIR,
  getItemResponseForRO,
  getProjectSignerWithTeamMember,
  getRequest,
  getRequestProjectIdAndName,
  getUserActiveTeamId,
  getUserTeamMemberData,
} from "@/backend/api/get";
import CreateQuotationRequestPage from "@/components/CreateQuotationRequestPage/CreateQuotationRequestPage";
import CreateReceivingInspectingReportPage from "@/components/CreateReceivingInspectingReport/CreateReceivingInspectingReport";
import CreateReleaseOrderPage from "@/components/CreateReleaseOrderPage/CreateReleaseOrderPage";
import CreateRequestPage from "@/components/CreateRequestPage/CreateRequestPage";
import CreateRequisitionRequestPage from "@/components/CreateRequisitionRequestPage/CreateRequisitionRequestPage";
import CreateSourcedItemRequestPage from "@/components/CreateSourcedItemRequestPage/CreateSourcedItemRequestPage";
import CreateTransferReceiptPage from "@/components/CreateTransferReceiptPage/CreateTransferReceiptPage";

import Meta from "@/components/Meta/Meta";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import { FormWithResponseType, OptionTableRow } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async ({ supabaseClient, user, context }) => {
    try {
      const form = await getForm(supabaseClient, {
        formId: `${context.query.formId}`,
      });

      const teamId = await getUserActiveTeamId(supabaseClient, {
        userId: user.id,
      });
      if (!teamId) throw new Error("No team found");

      // check if the user have access to create request on the form.
      const teamMember = await getUserTeamMemberData(supabaseClient, {
        userId: user.id,
        teamId: teamId,
      });
      if (!teamMember) throw new Error("No team member found");

      let requestProjectId = "";
      if (context.query.requisitionId) {
        const request = await getRequest(supabaseClient, {
          requestId: `${context.query.requisitionId}`,
        });
        requestProjectId = `${request.request_project_id}`;
      }

      if (form.form_is_formsly_form) {
        // Requisition Form
        if (form.form_name === "Requisition") {
          // items
          const items = await getAllItems(supabaseClient, {
            teamId: teamId,
          });

          const itemOptions = items.map((item, index) => {
            return {
              option_description: null,
              option_field_id: form.form_section[1].section_field[0].field_id,
              option_id: item.item_id,
              option_order: index,
              option_value: item.item_general_name,
            };
          });

          // projects
          const projects = await getAllTeamMemberProjects(supabaseClient, {
            teamId,
            memberId: teamMember.team_member_id,
          });
          const projectOptions = projects.map((project, index) => {
            return {
              option_description: null,
              option_field_id: form.form_section[0].section_field[0].field_id,
              option_id: project.team_project_id,
              option_order: index,
              option_value: project.team_project_name,
            };
          });

          return {
            props: {
              form: {
                ...form,
                form_section: [
                  {
                    ...form.form_section[0],
                    section_field: [
                      {
                        ...form.form_section[0].section_field[0],
                        field_option: projectOptions,
                      },
                      ...form.form_section[0].section_field.slice(1),
                    ],
                  },
                  {
                    ...form.form_section[1],
                    section_field: [
                      ...form.form_section[1].section_field.slice(0, 9),
                    ],
                  },
                ],
              },
              itemOptions,
              projectOptions,
            },
          };
        }

        const project = await getRequestProjectIdAndName(supabaseClient, {
          requestId: `${context.query.requisitionId}`,
        });

        if (!project) throw new Error();
        const formattedProject = project as unknown as {
          team_project_id: string;
          team_project_name: string;
        };

        const projectSigner = await getProjectSignerWithTeamMember(
          supabaseClient,
          {
            formId: form.form_id,
            projectId: `${formattedProject.team_project_id}`,
          }
        );
        // Sourced Item Form
        if (form.form_name === "Sourced Item") {
          const isRequestIdValid = await checkRequest(supabaseClient, {
            requestId: [`${context.query.requisitionId}`],
          });

          if (!isRequestIdValid) {
            return {
              redirect: {
                destination: "/404",
                permanent: false,
              },
            };
          }

          const items = await getItemResponseForQuotation(supabaseClient, {
            requestId: `${context.query.requisitionId}`,
          });

          const itemOptions = Object.keys(items).map((item, index) => {
            const value = `${items[item].name} (${items[item].quantity} ${items[item].unit}) (${items[item].description})`;

            return {
              option_description: null,
              option_field_id: form.form_section[1].section_field[0].field_id,
              option_id: item,
              option_order: index,
              option_value: value,
            };
          });

          const teamProjects = await getAllTeamProjects(supabaseClient, {
            teamId,
          });

          const projectOptions = teamProjects.map((project, index) => {
            return {
              option_description: project.team_project_id,
              option_field_id: form.form_section[1].section_field[2].field_id,
              option_id: project.team_project_name,
              option_order: index,
              option_value: project.team_project_name,
            };
          });

          return {
            props: {
              form: {
                ...form,
                form_section: [
                  form.form_section[0],
                  {
                    ...form.form_section[1],
                    section_field: [
                      ...form.form_section[1].section_field.slice(0, 2),
                      {
                        ...form.form_section[1].section_field[2],
                        field_option: projectOptions.filter(
                          (project) =>
                            project.option_description !== requestProjectId
                        ),
                      },
                    ],
                  },
                ],
                form_signer:
                  projectSigner.length !== 0 ? projectSigner : form.form_signer,
              },
              itemOptions,
              requestProjectId,
              requestingProject: formattedProject.team_project_name,
            },
          };
        }
        // Quotation Form
        else if (form.form_name === "Quotation") {
          const isRequestIdValid = await checkRequest(supabaseClient, {
            requestId: [`${context.query.requisitionId}`],
          });

          if (!isRequestIdValid) {
            return {
              redirect: {
                destination: "/404",
                permanent: false,
              },
            };
          }

          const items = await getItemResponseForQuotation(supabaseClient, {
            requestId: `${context.query.requisitionId}`,
          });

          const itemOptions = Object.keys(items).map((item, index) => {
            return {
              option_description: null,
              option_field_id: form.form_section[3].section_field[0].field_id,
              option_id: item,
              option_order: index,
              option_value: `${items[item].name} (${items[item].quantity} ${items[item].unit}) (${items[item].description})`,
            };
          });

          return {
            props: {
              form: {
                ...form,
                form_signer:
                  projectSigner.length !== 0 ? projectSigner : form.form_signer,
              },
              itemOptions,
              requestProjectId,
              requestingProject: formattedProject.team_project_name,
            },
          };
        }
        // Receiving Inspecting Report Form
        else if (form.form_name === "Receiving Inspecting Report") {
          const isRequestIdValid = await checkRequest(supabaseClient, {
            requestId: [
              `${context.query.requisitionId}`,
              `${context.query.quotationId}`,
            ],
          });

          if (!isRequestIdValid) {
            return {
              redirect: {
                destination: "/404",
                permanent: false,
              },
            };
          }

          const items = await getItemResponseForRIR(supabaseClient, {
            requestId: `${context.query.quotationId}`,
          });

          const regex = /\(([^()]+)\)/g;
          const itemOptions = Object.keys(items).map((item, index) => {
            const result = items[item].item.match(regex);

            const value =
              result &&
              items[item].item.replace(result[0], `(${items[item].quantity})`);
            return {
              option_description: null,
              option_field_id: form.form_section[2].section_field[0].field_id,
              option_id: item,
              option_order: index,
              option_value: value,
            };
          });
          return {
            props: {
              form: {
                ...form,
                form_signer:
                  projectSigner.length !== 0 ? projectSigner : form.form_signer,
              },
              itemOptions,
              requestProjectId,
              requestingProject: formattedProject.team_project_name,
            },
          };
        }
        // Release Order Form
        else if (form.form_name === "Release Order") {
          const isRequestIdValid = await checkRequest(supabaseClient, {
            requestId: [`${context.query.requisitionId}`],
          });

          if (!isRequestIdValid) {
            return {
              redirect: {
                destination: "/404",
                permanent: false,
              },
            };
          }

          const items = await getItemResponseForRO(supabaseClient, {
            requestId: `${context.query.sourcedItemId}`,
          });

          const sourceProjectList: Record<string, string> = {};

          const regex = /\(([^()]+)\)/g;
          const itemOptions = Object.keys(items).map((item, index) => {
            const itemName = items[item].item;
            const quantity = items[item].quantity;
            const sourceProject = items[item].sourceProject;

            const matches = regex.exec(itemName);
            const unit = matches && matches[1].replace(/\d+/g, "").trim();

            const replace = items[item].item.match(regex);
            if (!replace) return;

            const value = `${itemName.replace(
              replace[0],
              `(${quantity} ${unit}) (${sourceProject})`
            )} `;

            sourceProjectList[value] = items[item].sourceProject;

            return {
              option_description: null,
              option_field_id: form.form_section[1].section_field[0].field_id,
              option_id: item,
              option_order: index,
              option_value: value,
            };
          });
          return {
            props: {
              form: {
                ...form,
                form_signer:
                  projectSigner.length !== 0 ? projectSigner : form.form_signer,
              },
              itemOptions,
              sourceProjectList,
              requestProjectId,
              requestingProject: formattedProject.team_project_name,
            },
          };
        }
        // Transfer Receipt Form
        else if (form.form_name === "Transfer Receipt") {
          const isRequestIdValid = await checkRequest(supabaseClient, {
            requestId: [
              `${context.query.requisitionId}`,
              `${context.query.sourcedItemId}`,
            ],
          });

          if (!isRequestIdValid) {
            return {
              redirect: {
                destination: "/404",
                permanent: false,
              },
            };
          }

          const items = await getItemResponseForRO(supabaseClient, {
            requestId: `${context.query.releaseOrderId}`,
          });

          const sourceProjectList: Record<string, string> = {};

          const regex = /\(([^()]+)\)/g;
          const itemOptions = Object.keys(items).map((item, index) => {
            const itemName = items[item].item;
            const quantity = items[item].quantity;
            const sourceProject = items[item].sourceProject;

            const matches = regex.exec(itemName);
            const unit = matches && matches[1].replace(/\d+/g, "").trim();

            const replace = items[item].item.match(regex);
            if (!replace) return;

            const value = `${itemName.replace(
              replace[0],
              `(${quantity} ${unit}) (${sourceProject})`
            )} `;

            sourceProjectList[value] = items[item].sourceProject;

            return {
              option_description: null,
              option_field_id: form.form_section[1].section_field[0].field_id,
              option_id: item,
              option_order: index,
              option_value: value,
            };
          });
          return {
            props: {
              form: {
                ...form,
                form_signer:
                  projectSigner.length !== 0 ? projectSigner : form.form_signer,
              },
              itemOptions,
              sourceProjectList,
              requestProjectId,
              requestingProject: formattedProject.team_project_name,
            },
          };
        }
      }

      return {
        props: { form, requestProjectId },
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
  form: FormWithResponseType;
  itemOptions: OptionTableRow[];
  projectOptions?: OptionTableRow[];
  sourceProjectList?: Record<string, string>;
  requestProjectId: string;
  requestingProject?: string;
};

const Page = ({
  form,
  itemOptions,
  sourceProjectList = {},
  requestProjectId = "",
  projectOptions = [],
  requestingProject = "",
}: Props) => {
  const formslyForm = () => {
    switch (form.form_name) {
      case "Requisition":
        return (
          <CreateRequisitionRequestPage
            form={form}
            itemOptions={itemOptions}
            projectOptions={projectOptions}
          />
        );
      case "Sourced Item":
        return (
          <CreateSourcedItemRequestPage
            form={form}
            itemOptions={itemOptions}
            requestProjectId={requestProjectId}
            requestingProject={requestingProject}
          />
        );
      case "Quotation":
        return (
          <CreateQuotationRequestPage
            form={form}
            itemOptions={itemOptions}
            requestProjectId={requestProjectId}
            requestingProject={requestingProject}
          />
        );
      case "Receiving Inspecting Report":
        return (
          <CreateReceivingInspectingReportPage
            form={form}
            itemOptions={itemOptions}
            requestProjectId={requestProjectId}
            requestingProject={requestingProject}
          />
        );
      case "Release Order":
        return (
          <CreateReleaseOrderPage
            form={form}
            itemOptions={itemOptions}
            sourceProjectList={sourceProjectList}
            requestProjectId={requestProjectId}
            requestingProject={requestingProject}
          />
        );
      case "Transfer Receipt":
        return (
          <CreateTransferReceiptPage
            form={form}
            itemOptions={itemOptions}
            sourceProjectList={sourceProjectList}
            requestProjectId={requestProjectId}
            requestingProject={requestingProject}
          />
        );
    }
  };
  return (
    <>
      <Meta
        description="Create Request Page"
        url="/team-requests/forms/[formId]/create"
      />
      {form.form_is_formsly_form ? formslyForm() : null}
      {!form.form_is_formsly_form ? <CreateRequestPage form={form} /> : null}
    </>
  );
};

export default Page;
Page.Layout = "APP";
