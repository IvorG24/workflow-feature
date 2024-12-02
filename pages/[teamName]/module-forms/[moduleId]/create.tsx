import CreateITAssetRequestPage from "@/components/CreateITAssetRequestPage.tsx/CreateITAssetRequestPage";
import CreateItemRequestPage from "@/components/CreateItemRequestPage/CreateItemRequestPage";
import CreateOtherExpensesRequestPage from "@/components/CreateOtherExpensesRequestPage/CreateOtherExpensesRequestPage";
import CreatePEDEquipmentRequestPage from "@/components/CreatePEDEquipmentRequestPage/CreatePEDEquipmentRequestPage";
import CreatePEDItemRequestPage from "@/components/CreatePEDItemRequestPage/CreatePEDItemRequestPage";
import CreatePEDPartRequestPage from "@/components/CreatePEDPartRequestPage/CreatePEDPartRequestPage";
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
      const { moduleId, moduleRequestId } = context.query;

      const { data, error } = await supabaseClient.rpc(
        "create_module_request_page_on_load",
        {
          input_data: {
            moduleId: moduleId as string,
            moduleRequestId: moduleRequestId as string,
            userId: user.id,
          },
        }
      );

      if (error) throw error;

      return {
        props: data as Props,
      };
    } catch (e) {
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
  projectOptions: OptionTableRow[];
  sourceProjectList?: Record<string, string>;
  requestProjectId: string;
  requestingProject?: string;
  categoryOptions: OptionTableRow[];
  connectedRequest?: ConnectedRequestFormProps;
  departmentOptions?: OptionTableRow[];
  allProjectOptions?: OptionTableRow[];
  bankListOptions?: OptionTableRow[];
  uomOptions?: OptionTableRow[];
  equipmentCodeOptions?: OptionTableRow[];
};

const Page = ({ form, projectOptions, categoryOptions }: Props) => {
  const formslyForm = () => {
    switch (form.form_name) {
      case "Item":
        return (
          <CreateItemRequestPage
            type="Module Request"
            projectOptions={projectOptions}
            form={form}
          />
        );
      case "Services":
        return (
          <CreateServicesRequestPage
            form={form}
            type="Module Request"
            projectOptions={projectOptions}
          />
        );
      case "Other Expenses":
        return (
          <CreateOtherExpensesRequestPage
            type="Module Request"
            projectOptions={projectOptions}
            form={form}
          />
        );
      case "PED Equipment":
        return (
          <CreatePEDEquipmentRequestPage
            type="Module Request"
            form={form}
            projectOptions={projectOptions}
            categoryOptions={categoryOptions}
          />
        );
      case "PED Part":
        return (
          <CreatePEDPartRequestPage
            type="Module Request"
            form={form}
            projectOptions={projectOptions}
            categoryOptions={categoryOptions}
          />
        );
      case "PED Item":
        return (
          <CreatePEDItemRequestPage
            type="Module Request"
            projectOptions={projectOptions}
            form={form}
          />
        );
      case "IT Asset":
        return (
          <CreateITAssetRequestPage
            type="Module Request"
            projectOptions={projectOptions}
            form={form}
          />
        );
    }
  };

  return (
    <>
      <Meta
        description="Create Request Page"
        url="/teamName/module-forms/[moduleId]/create"
      />

      {form && form.form_is_formsly_form ? formslyForm() : null}
      {!form?.form_is_formsly_form ? (
        <CreateRequestPage form={form} formslyFormName={form.form_name} />
      ) : null}
    </>
  );
};

export default Page;
Page.Layout = "APP";
