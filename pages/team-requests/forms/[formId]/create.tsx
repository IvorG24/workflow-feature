import {
  checkRequest,
  getAllItems,
  getAllNames,
  getAllProcessors,
  getAllReceivers,
  getForm,
  getUserActiveTeamId,
} from "@/backend/api/get";
import CreateAccountPayableVoucherRequestPage from "@/components/CreateAccountPayableVoucherRequestPage/CreateAccountPayableVoucherRequestPage";
import CreateInvoiceRequestPage from "@/components/CreateInvoiceRequestPage/CreateInvoiceRequestPage";
import CreateOrderToPurchaseRequestPage from "@/components/CreateOrderToPurchaseRequestPage/CreateOrderToPurchaseRequestPage";
import CreatePurchaseOrderRequestPage from "@/components/CreatePurchaseOrderRequestPage/CreatePurchaseOrderRequestPage";
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

          // warehouse processors
          const warehouseProcessors = await getAllProcessors(supabaseClient, {
            processor: "warehouse",
            teamId: teamId,
          });
          const warehouseProcessorOptions = warehouseProcessors.map(
            (warehouseProcessor, index) => {
              return {
                option_description: null,
                option_field_id: form.form_section[0].section_field[0].field_id,
                option_id: warehouseProcessor.warehouse_processor_id,
                option_order: index,
                option_value: `${warehouseProcessor.warehouse_processor_first_name} ${warehouseProcessor.warehouse_processor_last_name} (${warehouseProcessor.warehouse_processor_employee_number})`,
              };
            }
          );

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
                        field_option: warehouseProcessorOptions,
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
        // Purchase Order
        else if (form.form_name === "Purchase Order") {
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

          // vendors
          const vendors = await getAllNames(supabaseClient, {
            table: "vendor",
            teamId: teamId,
          });
          const vendorOptions = vendors.map((vendor, index) => {
            return {
              option_description: null,
              option_field_id: form.form_section[0].section_field[0].field_id,
              option_id: vendor.vendor_id,
              option_order: index,
              option_value: vendor.vendor_name,
            };
          });

          // purchasing processors
          const purchasingProcessors = await getAllProcessors(supabaseClient, {
            processor: "purchasing",
            teamId: teamId,
          });
          const purchasingProcessorOptions = purchasingProcessors.map(
            (purchasingProcessor, index) => {
              return {
                option_description: null,
                option_field_id: form.form_section[0].section_field[0].field_id,
                option_id: purchasingProcessor.purchasing_processor_id,
                option_order: index,
                option_value: `${purchasingProcessor.purchasing_processor_first_name} ${purchasingProcessor.purchasing_processor_last_name} (${purchasingProcessor.purchasing_processor_employee_number})`,
              };
            }
          );

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
                        field_option: purchasingProcessorOptions,
                      },
                      {
                        ...form.form_section[1].section_field[1],
                        field_option: vendorOptions,
                      },
                      ...form.form_section[1].section_field.slice(
                        2,
                        form.form_section[1].section_field.length
                      ),
                    ],
                  },
                ],
              },
            },
          };
        }
        // Invoice
        else if (form.form_name === "Invoice") {
          const isRequestIdValid = await checkRequest(supabaseClient, {
            requestId: [`${context.query.otpId}`, `${context.query.poId}`],
          });

          if (!isRequestIdValid) {
            return {
              redirect: {
                destination: "/404",
                permanent: false,
              },
            };
          }

          // accounting processors
          const accountingProcessors = await getAllProcessors(supabaseClient, {
            processor: "accounting",
            teamId: teamId,
          });
          const accountingProcessorOptions = accountingProcessors.map(
            (accountingProcessor, index) => {
              return {
                option_description: null,
                option_field_id: form.form_section[0].section_field[0].field_id,
                option_id: accountingProcessor.accounting_processor_id,
                option_order: index,
                option_value: `${accountingProcessor.accounting_processor_first_name} ${accountingProcessor.accounting_processor_last_name} (${accountingProcessor.accounting_processor_employee_number})`,
              };
            }
          );

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
                        field_option: accountingProcessorOptions,
                      },
                      ...form.form_section[1].section_field.slice(
                        1,
                        form.form_section[1].section_field.length
                      ),
                    ],
                  },
                ],
              },
            },
          };
        }
        // Account Payable Voucher
        else if (form.form_name === "Account Payable Voucher ") {
          const isRequestIdValid = await checkRequest(supabaseClient, {
            requestId: [
              `${context.query.otpId}`,
              `${context.query.poId}`,
              `${context.query.invoiceId}`,
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
              `${context.query.poId}`,
              `${context.query.invoiceId}`,
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

          // warehouse receiver
          const warehouseReceivers = await getAllReceivers(supabaseClient, {
            receiver: "warehouse",
            teamId: teamId,
          });
          const warehouseReceiverOptions = warehouseReceivers.map(
            (warehouseReceiver, index) => {
              return {
                option_description: null,
                option_field_id: form.form_section[0].section_field[0].field_id,
                option_id: warehouseReceiver.warehouse_receiver_id,
                option_order: index,
                option_value: `${warehouseReceiver.warehouse_receiver_first_name} ${warehouseReceiver.warehouse_receiver_last_name} (${warehouseReceiver.warehouse_receiver_employee_number})`,
              };
            }
          );

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
                        field_option: warehouseReceiverOptions,
                      },
                      ...form.form_section[1].section_field.slice(
                        1,
                        form.form_section[1].section_field.length
                      ),
                    ],
                  },
                ],
              },
            },
          };
        }
        // Cheque Reference
        else if (form.form_name === "Cheque Reference") {
          // warehouse receiver
          const treasuryProcessors = await getAllProcessors(supabaseClient, {
            processor: "treasury",
            teamId: teamId,
          });
          const treasuryProcessorOptions = treasuryProcessors.map(
            (treasuryProcessor, index) => {
              return {
                option_description: null,
                option_field_id: form.form_section[0].section_field[0].field_id,
                option_id: treasuryProcessor.treasury_processor_id,
                option_order: index,
                option_value: `${treasuryProcessor.treasury_processor_first_name} ${treasuryProcessor.treasury_processor_last_name} (${treasuryProcessor.treasury_processor_employee_number})`,
              };
            }
          );

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
                        field_option: treasuryProcessorOptions,
                      },
                      ...form.form_section[0].section_field.slice(
                        1,
                        form.form_section[0].section_field.length
                      ),
                    ],
                  },
                  {
                    ...form.form_section[1],
                  },
                ],
              },
            },
          };
        }
        // Audit
        else if (form.form_name === "Audit") {
          // accounting processors
          const auditProcessors = await getAllProcessors(supabaseClient, {
            processor: "audit",
            teamId: teamId,
          });
          const accountingProcessorOptions = auditProcessors.map(
            (auditProcessor, index) => {
              return {
                option_description: null,
                option_field_id: form.form_section[0].section_field[0].field_id,
                option_id: auditProcessor.audit_processor_id,
                option_order: index,
                option_value: `${auditProcessor.audit_processor_first_name} ${auditProcessor.audit_processor_last_name} (${auditProcessor.audit_processor_employee_number})`,
              };
            }
          );

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
                        field_option: accountingProcessorOptions,
                      },
                      ...form.form_section[0].section_field.slice(
                        1,
                        form.form_section[0].section_field.length
                      ),
                    ],
                  },
                ],
              },
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
      case "Purchase Order":
        return <CreatePurchaseOrderRequestPage form={form} />;
      case "Invoice":
        return <CreateInvoiceRequestPage form={form} />;
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
