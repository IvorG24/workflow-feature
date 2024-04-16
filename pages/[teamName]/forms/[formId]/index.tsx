import { getForm } from "@/backend/api/get";
import ItemFormPage from "@/components/ItemFormPage/ItemFormPage";
import Meta from "@/components/Meta/Meta";
import OtherExpensesFormPage from "@/components/OtherExpensesFormPage/OtherExpensesFormPage";
import PEDEquipmentFormPage from "@/components/PEDEquipmentFormPage/PEDEquipmentFormPage";
import PEDPartFormPage from "@/components/PEDPartFormPage/PEDPartFormPage";
import ServicesFormPage from "@/components/ServicesFormPage/ServicesFormPage";
import { ROW_PER_PAGE } from "@/utils/constant";
import { withOwnerOrApprover } from "@/utils/server-side-protections";
import {
  InitialFormType,
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
  form: InitialFormType;
  teamMemberList: TeamMemberWithUserType[];
  teamGroupList: TeamGroupTableRow[];
  teamProjectList?: TeamProjectTableRow[];
  teamProjectListCount?: number;
};

const Page = ({
  form,
  teamMemberList = [],
  teamGroupList = [],
  teamProjectList = [],
  teamProjectListCount = 0,
}: Props) => {
  const formslyForm = () => {
    switch (form.form_name) {
      case "Item":
        return (
          <ItemFormPage
            form={form}
            teamMemberList={teamMemberList}
            teamGroupList={teamGroupList}
            teamProjectList={teamProjectList}
            teamProjectListCount={teamProjectListCount}
          />
        );
      case "Services":
        return (
          <ServicesFormPage
            form={form}
            teamMemberList={teamMemberList}
            teamGroupList={teamGroupList}
            teamProjectList={teamProjectList}
            teamProjectListCount={teamProjectListCount}
          />
        );
      case "Other Expenses":
        return (
          <OtherExpensesFormPage
            form={form}
            teamMemberList={teamMemberList}
            teamGroupList={teamGroupList}
            teamProjectList={teamProjectList}
            teamProjectListCount={teamProjectListCount}
          />
        );
      case "PED Equipment":
        return (
          <PEDEquipmentFormPage
            form={form}
            teamMemberList={teamMemberList}
            teamGroupList={teamGroupList}
            teamProjectList={teamProjectList}
            teamProjectListCount={teamProjectListCount}
          />
        );
      case "PED Part":
        return (
          <PEDPartFormPage
            form={form}
            teamMemberList={teamMemberList}
            teamGroupList={teamGroupList}
            teamProjectList={teamProjectList}
            teamProjectListCount={teamProjectListCount}
          />
        );
      // case "PED Item":
      //   return (
      //     <PEDItemFormPage
      //       items={items}
      //       itemListCount={itemListCount}
      //       teamMemberList={teamMemberList}
      //       form={form}
      //       teamGroupList={teamGroupList}
      //       teamProjectList={teamProjectList}
      //       teamProjectListCount={teamProjectListCount}
      //     />
      //   );

      // default:
      //   return <RequestFormPage />;
    }
  };

  return (
    <>
      <Meta description="Request Page" url="/teamName/forms/[formId]" />
      {form.form_is_formsly_form ? formslyForm() : null}
      {/* {!form.form_is_formsly_form ? (
        <RequestFormPage
          form={form}
          teamMemberList={teamMemberList}
          teamGroupList={teamGroupList}
          isFormslyForm={false}
          teamProjectList={teamProjectList}
          teamProjectListCount={teamProjectListCount}
        />
      ) : null} */}
    </>
  );
};

export default Page;
Page.Layout = "APP";
