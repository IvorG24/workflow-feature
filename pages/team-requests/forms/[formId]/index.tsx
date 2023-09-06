import { getForm } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import QuotationFormPage from "@/components/QuotationFormPage/QuotationFormPage";
import RequestFormPage from "@/components/RequestFormPage/RequestFormPage";
import RequisitionFormPage from "@/components/RequisitionFormPage/RequisitionFormPage";
import { ROW_PER_PAGE } from "@/utils/constant";
import { withOwnerOrAdmin } from "@/utils/server-side-protections";
import {
  FormType,
  ItemWithDescriptionType,
  SupplierTableRow,
  TeamGroupTableRow,
  TeamMemberWithUserType,
  TeamProjectTableRow,
} from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withOwnerOrAdmin(
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
}: Props) => {
  const formslyForm = () => {
    switch (form.form_name) {
      case "Requisition":
        return (
          <RequisitionFormPage
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
      <Meta description="Request Page" url="/team-requests/forms/[formId]" />
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
