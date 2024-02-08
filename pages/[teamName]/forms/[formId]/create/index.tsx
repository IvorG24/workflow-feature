import CreateItemRequestPage from "@/components/CreateItemRequestPage/CreateItemRequestPage";
import CreateOtherExpensesRequestPage from "@/components/CreateOtherExpensesRequestPage/CreateOtherExpensesRequestPage";
import CreatePEDEquipmentRequestPage from "@/components/CreatePEDEquipmentRequestPage/CreatePEDEquipmentRequestPage";
import CreatePEDPartRequestPage from "@/components/CreatePEDPartRequestPage/CreatePEDPartRequestPage";
import CreateQuotationRequestPage from "@/components/CreateQuotationRequestPage/CreateQuotationRequestPage";
import CreateReceivingInspectingReportPage from "@/components/CreateReceivingInspectingReport/CreateReceivingInspectingReport";
import CreateReleaseOrderPage from "@/components/CreateReleaseOrderPage/CreateReleaseOrderPage";
import CreateRequestPage from "@/components/CreateRequestPage/CreateRequestPage";
import CreateServicesRequestPage from "@/components/CreateServicesRequestPage/CreateServicesRequestPage";
import CreateSourcedItemRequestPage from "@/components/CreateSourcedItemRequestPage/CreateSourcedItemRequestPage";
import CreateSubconRequestPage from "@/components/CreateSubconRequestPage/CreateSubconRequestPage";
import CreateTransferReceiptPage from "@/components/CreateTransferReceiptPage/CreateTransferReceiptPage";

import Meta from "@/components/Meta/Meta";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import { FormType, FormWithResponseType, OptionTableRow } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async ({ supabaseClient, user, context }) => {
    try {
      const { data, error } = await supabaseClient.rpc(
        "create_request_page_on_load",
        {
          input_data: {
            formId: context.query.formId,
            userId: user.id,
            itemId: context.query.itemId,
            quotationId: context.query.quotationId,
            sourcedItemId: context.query.sourcedItemId,
            releaseOrderId: context.query.releaseOrderId,
          },
        }
      );
      if (error) throw error;

      return {
        props: data as Props,
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
  serviceOptions?: OptionTableRow[];
  specialApprover?: {
    special_approver_id: string;
    special_approver_item_list: string[];
    special_approver_signer: FormType["form_signer"][0];
  }[];
  categoryOptions?: OptionTableRow[];
};

const Page = ({
  form,
  itemOptions,
  sourceProjectList = {},
  requestProjectId = "",
  projectOptions = [],
  requestingProject = "",
  serviceOptions = [],
  specialApprover = [],
  categoryOptions = [],
}: Props) => {
  const formslyForm = () => {
    switch (form.form_name) {
      case "Item":
        return (
          <CreateItemRequestPage
            form={form}
            itemOptions={itemOptions}
            projectOptions={projectOptions}
            specialApprover={specialApprover}
          />
        );
      case "Subcon":
        return (
          <CreateSubconRequestPage
            form={form}
            serviceOptions={serviceOptions}
            projectOptions={projectOptions}
          />
        );
      case "Services":
        return (
          <CreateServicesRequestPage
            form={form}
            projectOptions={projectOptions}
          />
        );
      case "Other Expenses":
        return (
          <CreateOtherExpensesRequestPage
            form={form}
            projectOptions={projectOptions}
          />
        );
      case "PED Equipment":
        return (
          <CreatePEDEquipmentRequestPage
            form={form}
            projectOptions={projectOptions}
            categoryOptions={categoryOptions}
          />
        );
      case "PED Part":
        return (
          <CreatePEDPartRequestPage
            form={form}
            projectOptions={projectOptions}
            categoryOptions={categoryOptions}
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
        url="/teamName/forms/[formId]/create"
      />

      {form.form_is_formsly_form ? formslyForm() : null}
      {!form.form_is_formsly_form ? <CreateRequestPage form={form} /> : null}
    </>
  );
};

export default Page;
Page.Layout = "APP";
