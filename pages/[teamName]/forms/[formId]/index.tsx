import { getForm } from "@/backend/api/get";
import ItemFormPage from "@/components/ItemFormPage/ItemFormPage";
import Meta from "@/components/Meta/Meta";
import OtherExpensesFormPage from "@/components/OtherExpensesFormPage/OtherExpensesFormPage";
import PEDConsumableFormPage from "@/components/PEDConsumableFormPage/PEDConsumableFormPage";
import PEDEquipmentFormPage from "@/components/PEDEquipmentFormPage/PEDEquipmentFormPage";
import PEDPartFormPage from "@/components/PEDPartFormPage/PEDPartFormPage";
import QuotationFormPage from "@/components/QuotationFormPage/QuotationFormPage";
import RequestFormPage from "@/components/RequestFormPage/RequestFormPage";
import ServicesFormPage from "@/components/ServicesFormPage/ServicesFormPage";
import SubconFormPage from "@/components/SubconFormPage/SubconFormPage";
import { ROW_PER_PAGE } from "@/utils/constant";
import { withOwnerOrApprover } from "@/utils/server-side-protections";
import {
  EquipmentWithCategoryType,
  FormType,
  ItemWithDescriptionType,
  OtherExpensesTypeWithCategoryType,
  ServiceWithScopeType,
  SupplierTableRow,
  TeamGroupTableRow,
  TeamMemberWithUserType,
  TeamProjectTableRow,
} from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withOwnerOrApprover(
  async ({ supabaseClient, user, context }) => {
    try {
      const form = await getForm(supabaseClient, {
        formId: `${context.query.formId}`,
      });

      const { data, error } = await supabaseClient.rpc("form_page_on_load", {
        input_data: {
          userId: user.id,
          isFormslyForm: form.form_is_formsly_form,
          formName: form.form_name,
          limit: ROW_PER_PAGE,
        },
      });
      if (error) throw error;

      return {
        props: { ...(data as unknown as Props), form },
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
  teamGroupList: TeamGroupTableRow[];
  items?: ItemWithDescriptionType[];
  itemListCount?: number;
  suppliers?: SupplierTableRow[];
  supplierListCount?: number;
  teamProjectList?: TeamProjectTableRow[];
  teamProjectListCount?: number;
  services?: ServiceWithScopeType[];
  serviceListCount?: number;
  otherExpensesTypes?: OtherExpensesTypeWithCategoryType[];
  otherExpensesTypeCount?: number;
  equipments?: EquipmentWithCategoryType[];
  equipmentListCount?: number;
};

const Page = ({
  form,
  teamMemberList = [],
  items = [],
  itemListCount = 0,
  suppliers = [],
  supplierListCount = 0,
  teamGroupList,
  teamProjectList = [],
  teamProjectListCount = 0,
  services = [],
  serviceListCount = 0,
  otherExpensesTypes = [],
  otherExpensesTypeCount = 0,
  equipments = [],
  equipmentListCount = 0,
}: Props) => {
  const formslyForm = () => {
    switch (form.form_name) {
      case "Item":
        return (
          <ItemFormPage
            items={items}
            itemListCount={itemListCount}
            teamMemberList={teamMemberList}
            form={form}
            teamGroupList={teamGroupList}
            teamProjectList={teamProjectList}
            teamProjectListCount={teamProjectListCount}
          />
        );
      case "PED Part":
        return (
          <PEDPartFormPage
            equipments={equipments}
            equipmentListCount={equipmentListCount}
            teamMemberList={teamMemberList}
            form={form}
            teamGroupList={teamGroupList}
            teamProjectList={teamProjectList}
            teamProjectListCount={teamProjectListCount}
          />
        );
      case "PED Equipment":
        return (
          <PEDEquipmentFormPage
            equipments={equipments}
            equipmentListCount={equipmentListCount}
            teamMemberList={teamMemberList}
            form={form}
            teamGroupList={teamGroupList}
            teamProjectList={teamProjectList}
            teamProjectListCount={teamProjectListCount}
          />
        );
      case "PED Consumable":
        return (
          <PEDConsumableFormPage
            items={items}
            itemListCount={itemListCount}
            teamMemberList={teamMemberList}
            form={form}
            teamGroupList={teamGroupList}
            teamProjectList={teamProjectList}
            teamProjectListCount={teamProjectListCount}
          />
        );
      case "Quotation":
        return (
          <QuotationFormPage
            teamMemberList={teamMemberList}
            form={form}
            suppliers={suppliers}
            supplierListCount={supplierListCount}
            teamGroupList={teamGroupList}
            teamProjectList={teamProjectList}
            teamProjectListCount={teamProjectListCount}
          />
        );
      case "Subcon":
        return (
          <SubconFormPage
            services={services}
            serviceListCount={serviceListCount}
            teamMemberList={teamMemberList}
            form={form}
            teamGroupList={teamGroupList}
            teamProjectList={teamProjectList}
            teamProjectListCount={teamProjectListCount}
            suppliers={suppliers}
            supplierListCount={supplierListCount}
          />
        );
      case "Services":
        return (
          <ServicesFormPage
            teamMemberList={teamMemberList}
            form={form}
            teamGroupList={teamGroupList}
            teamProjectList={teamProjectList}
            teamProjectListCount={teamProjectListCount}
          />
        );
      case "Other Expenses":
        return (
          <OtherExpensesFormPage
            teamMemberList={teamMemberList}
            form={form}
            teamGroupList={teamGroupList}
            teamProjectList={teamProjectList}
            teamProjectListCount={teamProjectListCount}
            otherExpensesTypes={otherExpensesTypes}
            otherExpensesTypeCount={otherExpensesTypeCount}
          />
        );
      default:
        return (
          <RequestFormPage
            form={form}
            teamMemberList={teamMemberList}
            teamGroupList={teamGroupList}
            isFormslyForm={true}
            teamProjectList={teamProjectList}
            teamProjectListCount={teamProjectListCount}
          />
        );
    }
  };

  return (
    <>
      <Meta description="Request Page" url="/teamName/forms/[formId]" />
      {form.form_is_formsly_form ? formslyForm() : null}
      {!form.form_is_formsly_form ? (
        <RequestFormPage
          form={form}
          teamMemberList={teamMemberList}
          teamGroupList={teamGroupList}
          isFormslyForm={false}
          teamProjectList={teamProjectList}
          teamProjectListCount={teamProjectListCount}
        />
      ) : null}
    </>
  );
};

export default Page;
Page.Layout = "APP";
