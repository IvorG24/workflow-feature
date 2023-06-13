import {
  getForm,
  getItemList,
  getNameList,
  getProcessorList,
  getReceiverList,
  getTeamAdminList,
  getUserActiveTeamId,
} from "@/backend/api/get";
import AuditFormPage from "@/components/AuditFormPage/AuditFormPage";
import ChequeReferenceFormPage from "@/components/ChequeReferenceFormPage/ChequeReferenceFormPage";
import InvoiceFormPage from "@/components/InvoiceFormPage/InvoiceFormPage";
import Meta from "@/components/Meta/Meta";
import OrderToPurchaseFormPage from "@/components/OrderToPurchaseFormPage/OrderToPurchaseFormPage";
import PurchaseOrderFormPage from "@/components/PurchaseOrderFormPage/PurchaseOrderFormPage";
import ReceivingInspectingReportFormPage from "@/components/ReceivingInspectingReportFormPage/ReceivingInspectingReportFormPage";
import RequestFormPage from "@/components/RequestFormPage/RequestFormPage";
import { ROW_PER_PAGE } from "@/utils/constant";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import {
  AccountingProcessorTableRow,
  AuditProcessorTableRow,
  FormType,
  ItemWithDescriptionType,
  ProjectTableRow,
  PurchasingProcessorTableRow,
  TeamMemberWithUserType,
  TreasuryProcessorTableRow,
  VendorTableRow,
  WarehouseProcessorTableRow,
  WarehouseReceiverTableRow,
} from "@/utils/types";
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

      const teamMemberList = await getTeamAdminList(supabaseClient, {
        teamId,
      });

      const formattedForm = form as unknown as FormType;
      if (formattedForm.form_is_formsly_form) {
        if (formattedForm.form_name === "Order to Purchase") {
          const { data: items, count: itemListCount } = await getItemList(
            supabaseClient,
            {
              teamId: teamId,
              page: 1,
              limit: ROW_PER_PAGE,
            }
          );

          const { data: projects, count: projectListCount } = await getNameList(
            supabaseClient,
            {
              table: "project",
              teamId: teamId,
              page: 1,
              limit: ROW_PER_PAGE,
            }
          );

          const {
            data: warehouseProcessors,
            count: warehouseProcessorListCount,
          } = await getProcessorList(supabaseClient, {
            processor: "warehouse",
            teamId: teamId,
            page: 1,
            limit: ROW_PER_PAGE,
          });

          return {
            props: {
              form,
              items,
              itemListCount,
              teamMemberList,
              projects,
              projectListCount,
              warehouseProcessors,
              warehouseProcessorListCount,
            },
          };
        } else if (formattedForm.form_name === "Purchase Order") {
          const { data: vendors, count: vendorListCount } = await getNameList(
            supabaseClient,
            {
              table: "vendor",
              teamId: teamId,
              page: 1,
              limit: ROW_PER_PAGE,
            }
          );

          const {
            data: purchasingProcessors,
            count: purchasingProcessorListCount,
          } = await getProcessorList(supabaseClient, {
            processor: "purchasing",
            teamId: teamId,
            page: 1,
            limit: ROW_PER_PAGE,
          });
          return {
            props: {
              form,
              teamMemberList,
              vendors,
              vendorListCount,
              purchasingProcessors,
              purchasingProcessorListCount,
            },
          };
        } else if (formattedForm.form_name === "Invoice") {
          const {
            data: accountingProcessors,
            count: accountingProcessorListCount,
          } = await getProcessorList(supabaseClient, {
            processor: "accounting",
            teamId: teamId,
            page: 1,
            limit: ROW_PER_PAGE,
          });
          return {
            props: {
              form,
              teamMemberList,
              accountingProcessors,
              accountingProcessorListCount,
            },
          };
        } else if (formattedForm.form_name === "Receiving Inspecting Report") {
          const {
            data: warehouseReceivers,
            count: warehouseReceiverListCount,
          } = await getReceiverList(supabaseClient, {
            receiver: "warehouse",
            teamId: teamId,
            page: 1,
            limit: ROW_PER_PAGE,
          });
          return {
            props: {
              form,
              teamMemberList,
              warehouseReceivers,
              warehouseReceiverListCount,
            },
          };
        } else if (formattedForm.form_name === "Cheque Reference") {
          const {
            data: treasuryProcessors,
            count: treasuryProcessorListCount,
          } = await getProcessorList(supabaseClient, {
            processor: "treasury",
            teamId: teamId,
            page: 1,
            limit: ROW_PER_PAGE,
          });
          return {
            props: {
              form,
              teamMemberList,
              treasuryProcessors,
              treasuryProcessorListCount,
            },
          };
        } else if (formattedForm.form_name === "Audit") {
          const { data: auditProcessors, count: auditProcessorListCount } =
            await getProcessorList(supabaseClient, {
              processor: "audit",
              teamId: teamId,
              page: 1,
              limit: ROW_PER_PAGE,
            });
          return {
            props: {
              form,
              teamMemberList,
              auditProcessors,
              auditProcessorListCount,
            },
          };
        }
      }
      return {
        props: { form, teamMemberList },
      };
    } catch (error) {
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
  form: FormType;
  teamMemberList: TeamMemberWithUserType[];

  items?: ItemWithDescriptionType[];
  itemListCount?: number;
  projects?: ProjectTableRow[];
  projectListCount?: number;
  warehouseProcessors?: WarehouseProcessorTableRow[];
  warehouseProcessorListCount?: number;
  vendors?: VendorTableRow[];
  vendorListCount?: number;
  purchasingProcessors?: PurchasingProcessorTableRow[];
  purchasingProcessorListCount?: number;
  accountingProcessors?: AccountingProcessorTableRow[];
  accountingProcessorListCount?: number;
  warehouseReceivers?: WarehouseReceiverTableRow[];
  warehouseReceiverListCount?: number;
  treasuryProcessors?: TreasuryProcessorTableRow[];
  treasuryProcessorListCount?: number;
  auditProcessors?: AuditProcessorTableRow[];
  auditProcessorListCount?: number;
};

const Page = ({
  form,
  teamMemberList = [],

  items = [],
  itemListCount = 0,
  projects = [],
  projectListCount = 0,
  warehouseProcessors = [],
  warehouseProcessorListCount = 0,
  vendors = [],
  vendorListCount = 0,
  purchasingProcessors = [],
  purchasingProcessorListCount = 0,
  accountingProcessors = [],
  accountingProcessorListCount = 0,
  warehouseReceivers = [],
  warehouseReceiverListCount = 0,
  treasuryProcessors = [],
  treasuryProcessorListCount = 0,
  auditProcessors = [],
  auditProcessorListCount = 0,
}: Props) => {
  const formslyForm = () => {
    switch (form.form_name) {
      case "Order to Purchase":
        return (
          <OrderToPurchaseFormPage
            items={items}
            itemListCount={itemListCount}
            projects={projects}
            projectListCount={projectListCount}
            warehouseProcessors={warehouseProcessors}
            warehouseProcessorListCount={warehouseProcessorListCount}
            teamMemberList={teamMemberList}
            form={form}
          />
        );
      case "Purchase Order":
        return (
          <PurchaseOrderFormPage
            teamMemberList={teamMemberList}
            form={form}
            vendors={vendors}
            vendorListCount={vendorListCount}
            purchasingProcessors={purchasingProcessors}
            purchasingProcessorListCount={purchasingProcessorListCount}
          />
        );
      case "Invoice":
        return (
          <InvoiceFormPage
            teamMemberList={teamMemberList}
            form={form}
            accountingProcessors={accountingProcessors}
            accountingProcessorListCount={accountingProcessorListCount}
          />
        );
      case "Account Payable Voucher":
        return <RequestFormPage form={form} teamMemberList={teamMemberList} />;
      case "Receiving Inspecting Report":
        return (
          <ReceivingInspectingReportFormPage
            form={form}
            teamMemberList={teamMemberList}
            warehouseReceivers={warehouseReceivers}
            warehouseReceiverListCount={warehouseReceiverListCount}
          />
        );
      case "Cheque Reference":
        return (
          <ChequeReferenceFormPage
            form={form}
            teamMemberList={teamMemberList}
            treasuryProcessors={treasuryProcessors}
            treasuryProcessorListCount={treasuryProcessorListCount}
          />
        );
      case "Audit":
        return (
          <AuditFormPage
            form={form}
            teamMemberList={teamMemberList}
            auditProcessors={auditProcessors}
            auditProcessorListCount={auditProcessorListCount}
          />
        );
    }
  };

  return (
    <>
      <Meta description="Request Page" url="/team-requests/forms/[formId]" />
      {form.form_is_formsly_form ? formslyForm() : null}
      {!form.form_is_formsly_form ? (
        <RequestFormPage form={form} teamMemberList={teamMemberList} />
      ) : null}
    </>
  );
};

export default Page;
Page.Layout = "APP";
