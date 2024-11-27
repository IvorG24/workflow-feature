import { getFormid } from "@/backend/api/get";
// import CreateModuleItAssetRequestPage from "@/components/CreateModuleItAssetRequestPage/CreateModuleItAssetRequestPage";
// import CreateModuleItemRequestPage from "@/components/CreateModuleItemRequestPage/CreateModuleItemRequestPage";
// import CreateModuleOtherExpensesRequestPage from "@/components/CreateModuleOtherExpensesRequestPage/CreateModuleOtherExpensesRequestPage";
// import CreateModulePEDEquipmentRequestPage from "@/components/CreateModulePEDEquipmentRequestPage/CreateModulePEDEquipmentRequestPage";
// import CreateModulePEDItemRequestPage from "@/components/CreateModulePEDItemRequestPage/CreateModulePEDItemRequestPage";
// import CreateModulePEDPartRequestPage from "@/components/CreateModulePEDPartRequestPage/CreateModulePEDPartRequestPage";
// import ModuleCreateRequestPage from "@/components/CreateModuleRequestPage/CreateModuleRequestPage";
// import CreateModuleServicesRequestPage from "@/components/CreateModuleServicesRequestPage/CreateModuleServicesRequestPage";
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
      const { moduleId, lrf, rfp, wav, nextForm } = context.query;
      const connectedRequestFormslyId = lrf ?? rfp ?? wav ?? null;

      const formIdData = await getFormid(supabaseClient, {
        moduleId: moduleId as string,
      });

      const formId = nextForm ?? formIdData[0].form_id;
      const { data, error } = await supabaseClient.rpc(
        "create_module_request_page_on_load",
        {
          input_data: {
            moduleId: moduleId as string,
            formId: formId,
            userId: user.id,
            connectedRequestFormslyId: connectedRequestFormslyId,
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
  projectOptions?: OptionTableRow[];
  sourceProjectList?: Record<string, string>;
  requestProjectId: string;
  requestingProject?: string;
  categoryOptions?: OptionTableRow[];
  connectedRequest?: ConnectedRequestFormProps;
  departmentOptions?: OptionTableRow[];
  allProjectOptions?: OptionTableRow[];
  bankListOptions?: OptionTableRow[];
  uomOptions?: OptionTableRow[];
  equipmentCodeOptions?: OptionTableRow[];
};

const Page = ({ form, categoryOptions = [] }: Props) => {
  const formslyForm = () => {
    // switch (form.form_name) {
    //   case "Item":
    //     return <CreateModuleItemRequestPage form={form} />;
    //   case "Services":
    //     return <CreateModuleServicesRequestPage form={form} />;
    //   case "Other Expenses":
    //     return <CreateModuleOtherExpensesRequestPage form={form} />;
    //   case "PED Equipment":
    //     return (
    //       <CreateModulePEDEquipmentRequestPage
    //         form={form}
    //         categoryOptions={categoryOptions}
    //       />
    //     );
    //   case "PED Part":
    //     return (
    //       <CreateModulePEDPartRequestPage
    //         form={form}
    //         categoryOptions={categoryOptions}
    //       />
    //     );
    //   case "PED Item":
    //     return <CreateModulePEDItemRequestPage form={form} />;
    //   case "IT Asset":
    //     return <CreateModuleItAssetRequestPage form={form} />;
    // }
  };

  return (
    <>
      <Meta
        description="Create Request Page"
        url="/teamName/module-forms/[moduleId]/create"
      />

      {/* {form && form.form_is_formsly_form ? formslyForm() : null}
      {!form?.form_is_formsly_form ? (
        <ModuleCreateRequestPage form={form} formslyFormName={form.form_name} />
      ) : null} */}
    </>
  );
};

export default Page;
Page.Layout = "APP";
