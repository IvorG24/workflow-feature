import CreateItemRequestPage from "@/components/CreateItemRequestPage/CreateItemRequestPage";
import CreateOtherExpensesRequestPage from "@/components/CreateOtherExpensesRequestPage/CreateOtherExpensesRequestPage";
import CreatePEDConsumableRequestPage from "@/components/CreatePEDConsumableRequestPage/CreatePEDConsumableRequestPage";
import CreatePEDEquipmentRequestPage from "@/components/CreatePEDEquipmentRequestPage/CreatePEDEquipmentRequestPage";
import CreatePEDPartRequestPage from "@/components/CreatePEDPartRequestPage/CreatePEDPartRequestPage";
import CreateRequestPage from "@/components/CreateRequestPage/CreateRequestPage";
import CreateServicesRequestPage from "@/components/CreateServicesRequestPage/CreateServicesRequestPage";

import CreateRequestForPaymentPage from "@/components/CreateRequestForPaymentPage/CreateRequestForPaymentPage";
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
  projectOptions?: OptionTableRow[];
  sourceProjectList?: Record<string, string>;
  requestProjectId: string;
  requestingProject?: string;
  specialApprover?: {
    special_approver_id: string;
    special_approver_item_list: string[];
    special_approver_signer: FormType["form_signer"][0];
  }[];
  categoryOptions?: OptionTableRow[];
};

const Page = ({
  form,
  projectOptions = [],
  specialApprover = [],
  categoryOptions = [],
}: Props) => {
  const formslyForm = () => {
    switch (form.form_name) {
      case "Item":
        return (
          <CreateItemRequestPage
            form={form}
            projectOptions={projectOptions}
            specialApprover={specialApprover}
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
      case "PED Consumable":
        return (
          <CreatePEDConsumableRequestPage
            form={form}
            projectOptions={projectOptions}
          />
        );
      case "Request For Payment":
        return (
          <CreateRequestForPaymentPage
            form={form}
            projectOptions={projectOptions}
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
