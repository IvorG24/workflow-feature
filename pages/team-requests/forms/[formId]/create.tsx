import {
  checkRequest,
  checkRequsitionRequestForReleaseOrder,
  getAllItems,
  getAllTeamMemberProjects,
  getForm,
  getItemResponseForQuotation,
  getItemResponseForRIR,
  getItemResponseForRO,
  getUserActiveTeamId,
  getUserTeamMemberData,
} from "@/backend/api/get";
import CreateChequeReferenceRequestPage from "@/components/CreateChequeReferenceRequestPage/CreateChequeReferenceRequestPage";
import CreateQuotationRequestPage from "@/components/CreateQuotationRequestPage/CreateQuotationRequestPage";
import CreateReceivingInspectingReportPage from "@/components/CreateReceivingInspectingReport/CreateReceivingInspectingReport";
import CreateReleaseOrderPage from "@/components/CreateReleaseOrderPage/CreateReleaseOrderPage";
import CreateRequestPage, {
  RequestFormValues,
} from "@/components/CreateRequestPage/CreateRequestPage";
import CreateRequisitionRequestPage from "@/components/CreateRequisitionRequestPage/CreateRequisitionRequestPage";
import CreateSourcedRequisitionRequestPage from "@/components/CreateSourcedOrderToPurchaseRequestPage/CreateSourcedOrderToPurchaseRequestPage";

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
                    ...form.form_section[1],
                    section_field: [
                      {
                        ...form.form_section[1].section_field[0],
                        field_option: projectOptions,
                      },
                      {
                        ...form.form_section[1].section_field[1],
                      },
                      ...form.form_section[1].section_field.slice(2),
                    ],
                  },
                  form.form_section[2],
                ],
              },
              itemOptions,
              requisitionIdSection: {
                ...form.form_section[0],
                section_field: [
                  {
                    ...form.form_section[0].section_field[0],
                    field_response: "null",
                  },
                ],
              },
            },
          };
        }
        // ZZZ Form,
        else if (form.form_name === "ZZZ") {
          const isRequestIdValid = await checkRequsitionRequestForReleaseOrder(
            supabaseClient,
            {
              requisitionId: `${context.query.requisitionId}`,
            }
          );

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
              option_field_id: form.form_section[0].section_field[0].field_id,
              option_id: item,
              option_order: index,
              option_value: `${items[item].name} (${items[item].quantity} ${items[item].unit}) (${items[item].description})`,
            };
          });

          return {
            props: {
              form,
              itemOptions,
            },
          };
        }
        // Quotation
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
              option_field_id: form.form_section[2].section_field[0].field_id,
              option_id: item,
              option_order: index,
              option_value: `${items[item].name} (${items[item].quantity} ${items[item].unit}) (${items[item].description})`,
            };
          });

          return {
            props: {
              form,
              itemOptions,
            },
          };
        }
        // Receiving Inspecting Report
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
              option_field_id: form.form_section[1].section_field[0].field_id,
              option_id: item,
              option_order: index,
              option_value: value,
            };
          });
          return {
            props: {
              form,
              itemOptions,
            },
          };
        }
        // Receiving Inspecting Report
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
            requestId: `${context.query.requisitionId}`,
          });

          const itemOptions = Object.keys(items).map((item, index) => {
            const generalName = items[item].generalName;
            const quantity = items[item].quantity;
            const unit = items[item].unit;
            const description = items[item].description;
            return {
              option_description: null,
              option_field_id: form.form_section[1].section_field[0].field_id,
              option_id: item,
              option_order: index,
              option_value: `${generalName} (${quantity} ${unit}) (${description.slice(
                0,
                -2
              )})`,
            };
          });
          return {
            props: {
              form,
              itemOptions,
            },
          };
        }
      }

      return {
        props: { form },
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
  requisitionIdSection?: RequestFormValues["sections"][0];
};

const Page = ({ form, itemOptions, requisitionIdSection }: Props) => {
  const formslyForm = () => {
    switch (form.form_name) {
      case "Requisition":
        return (
          <CreateRequisitionRequestPage
            itemOptions={itemOptions}
            form={{
              ...form,
              form_section: [
                {
                  ...form.form_section[0],
                },
                {
                  ...form.form_section[1],
                  section_field: [
                    ...form.form_section[1].section_field.slice(0, 5),
                  ],
                },
              ],
            }}
            requisitionIdSection={requisitionIdSection}
          />
        );
      case "ZZZ":
        return (
          <CreateSourcedRequisitionRequestPage
            form={form}
            itemOptions={itemOptions}
          />
        );
      case "Quotation":
        return (
          <CreateQuotationRequestPage form={form} itemOptions={itemOptions} />
        );
      case "Receiving Inspecting Report":
        return (
          <CreateReceivingInspectingReportPage
            form={form}
            itemOptions={itemOptions}
          />
        );
      case "Release Order":
        return <CreateReleaseOrderPage form={form} itemOptions={itemOptions} />;
      case "Cheque Reference":
        return <CreateChequeReferenceRequestPage form={form} />;
      case "Audit":
        return <CreateRequestPage form={form} formslyFormName="Audit" />;
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
