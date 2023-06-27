import {
  checkRequest,
  getAllItems,
  getAllNames,
  getForm,
  getItemResponse,
  getUserActiveTeamId,
} from "@/backend/api/get";
import CreateAccountPayableVoucherRequestPage from "@/components/CreateAccountPayableVoucherRequestPage/CreateAccountPayableVoucherRequestPage";
import CreateOrderToPurchaseRequestPage from "@/components/CreateOrderToPurchaseRequestPage/CreateOrderToPurchaseRequestPage";
import CreateQuotationRequestPage from "@/components/CreateQuotationRequestPage/CreateQuotationRequestPage";
import CreateReceivingInspectingReportPage from "@/components/CreateReceivingInspectingReportPage/CreateReceivingInspectingReportPage";
import CreateRequestPage from "@/components/CreateRequestPage/CreateRequestPage";
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

      if (form.form_is_formsly_form) {
        const teamId = await getUserActiveTeamId(supabaseClient, {
          userId: user.id,
        });
        if (!teamId) throw new Error("No team found");

        // Order to Purchase Form
        if (form.form_name === "Order to Purchase") {
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
          const projects = await getAllNames(supabaseClient, {
            table: "project",
            teamId: teamId,
          });
          const projectOptions = projects.map((project, index) => {
            return {
              option_description: null,
              option_field_id: form.form_section[0].section_field[0].field_id,
              option_id: project.project_id,
              option_order: index,
              option_value: project.project_name,
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
                      {
                        ...form.form_section[0].section_field[1],
                      },
                      ...form.form_section[0].section_field.slice(
                        2,
                        form.form_section[0].section_field.length
                      ),
                    ],
                  },
                  form.form_section[1],
                ],
              },
              itemOptions,
            },
          };
        }
        // Quotation
        else if (form.form_name === "Quotation") {
          const isRequestIdValid = await checkRequest(supabaseClient, {
            requestId: [`${context.query.otpId}`],
          });

          if (!isRequestIdValid) {
            return {
              redirect: {
                destination: "/404",
                permanent: false,
              },
            };
          }

          // suppliers
          const suppliers = await getAllNames(supabaseClient, {
            table: "supplier",
            teamId: teamId,
          });
          const supplierOptions = suppliers.map((supplier, index) => {
            return {
              option_description: null,
              option_field_id: form.form_section[0].section_field[0].field_id,
              option_id: supplier.supplier_id,
              option_order: index,
              option_value: supplier.supplier_name,
            };
          });

          const items = await getItemResponse(supabaseClient, {
            requestId: `${context.query.otpId}`,
          });

          const itemOptions = Object.keys(items).map((item, index) => {
            return {
              option_description: null,
              option_field_id: form.form_section[2].section_field[0].field_id,
              option_id: item,
              option_order: index,
              option_value: `${items[item].name} (${items[item].quantity}) (${items[item].description})`,
            };
          });

          return {
            props: {
              form: {
                ...form,
                form_section: [
                  {
                    ...form.form_section[0],
                  },
                  {
                    ...form.form_section[1],
                    section_field: [
                      {
                        ...form.form_section[1].section_field[0],
                        field_option: supplierOptions,
                      },
                      ...form.form_section[1].section_field.slice(
                        1,
                        form.form_section[1].section_field.length
                      ),
                    ],
                  },
                  {
                    ...form.form_section[2],
                  },
                ],
              },
              itemOptions,
            },
          };
        }
        // Account Payable Voucher
        else if (form.form_name === "Account Payable Voucher ") {
          const isRequestIdValid = await checkRequest(supabaseClient, {
            requestId: [
              `${context.query.otpId}`,
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

          return {
            props: {
              form,
            },
          };
        }
        // Receiving Inspecting Report
        else if (form.form_name === "Receiving Inspecting Report") {
          const isRequestIdValid = await checkRequest(supabaseClient, {
            requestId: [
              `${context.query.otpId}`,
              `${context.query.quotationId}`,
              `${context.query.apvId}`,
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

          return {
            props: {
              form,
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
};

const Page = ({ form, itemOptions }: Props) => {
  const formslyForm = () => {
    switch (form.form_name) {
      case "Order to Purchase":
        return (
          <CreateOrderToPurchaseRequestPage
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
                    ...form.form_section[1].section_field.slice(0, 2),
                  ],
                },
              ],
            }}
          />
        );
      case "Quotation":
        return (
          <CreateQuotationRequestPage form={form} itemOptions={itemOptions} />
        );
      case "Account Payable Voucher":
        return <CreateAccountPayableVoucherRequestPage form={form} />;
      case "Receiving Inspecting Report":
        return <CreateReceivingInspectingReportPage form={form} />;
      case "Cheque Reference":
        return (
          <CreateRequestPage form={form} formslyFormName="Cheque Reference" />
        );
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
