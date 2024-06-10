import CreateBillOfQuantityRequestPage from "@/components/CreateBillOfQuantityRequestPage/CreateBillOfQuantityRequestPage";
import CreateITAssetRequestPage from "@/components/CreateITAssetRequestPage.tsx/CreateITAssetRequestPage";
import CreateItemRequestPage from "@/components/CreateItemRequestPage/CreateItemRequestPage";
import CreateLiquidationReimbursementRequestPage from "@/components/CreateLiquidationReimbursementRequestPage/CreateLiquidationReimbursementRequestPage";
import CreateOtherExpensesRequestPage from "@/components/CreateOtherExpensesRequestPage/CreateOtherExpensesRequestPage";
import CreatePEDEquipmentRequestPage from "@/components/CreatePEDEquipmentRequestPage/CreatePEDEquipmentRequestPage";
import CreatePEDItemRequestPage from "@/components/CreatePEDItemRequestPage/CreatePEDItemRequestPage";
import CreatePEDPartRequestPage from "@/components/CreatePEDPartRequestPage/CreatePEDPartRequestPage";
import CreateRequestForPaymentPage from "@/components/CreateRequestForPaymentPage/CreateRequestForPaymentPage";
import CreateRequestPage from "@/components/CreateRequestPage/CreateRequestPage";
import CreateServicesRequestPage from "@/components/CreateServicesRequestPage/CreateServicesRequestPage";
import Meta from "@/components/Meta/Meta";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import {
  ConnectedRequestFormProps,
  FormWithResponseType,
  OptionTableRow,
} from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async ({ supabaseClient, user, context }) => {
    try {
      const connectedRequestFormslyId = context.query.lrf;
      const { data, error } = await supabaseClient.rpc(
        "create_request_page_on_load",
        {
          input_data: {
            formId: context.query.formId,
            userId: user.id,
            connectedRequestFormslyId: connectedRequestFormslyId
              ? connectedRequestFormslyId
              : null,
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
  categoryOptions?: OptionTableRow[];
  connectedRequest?: ConnectedRequestFormProps;
};

const Page = ({
  form,
  projectOptions = [],
  categoryOptions = [],
  connectedRequest,
}: Props) => {
  const formslyForm = () => {
    switch (form.form_name) {
      case "Item":
        return (
          <CreateItemRequestPage form={form} projectOptions={projectOptions} />
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
      case "PED Item":
        return (
          <CreatePEDItemRequestPage
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

      case "IT Asset":
        return (
          <CreateITAssetRequestPage
            form={form}
            projectOptions={projectOptions}
          />
        );
      case "Liquidation Reimbursement":
        return (
          <CreateLiquidationReimbursementRequestPage
            form={form}
            projectOptions={projectOptions}
          />
        );

      case "Bill of Quantity":
        return (
          <CreateBillOfQuantityRequestPage
            form={form}
            connectedRequest={connectedRequest}
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
      {!form.form_is_formsly_form ? (
        <CreateRequestPage form={form} formslyFormName={form.form_name} />
      ) : null}
    </>
  );
};

export default Page;
Page.Layout = "APP";
