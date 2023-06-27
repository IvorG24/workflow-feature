import {
  getForm,
  getItemList,
  getNameList,
  getTeamAdminList,
  getUserActiveTeamId,
} from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import OrderToPurchaseFormPage from "@/components/OrderToPurchaseFormPage/OrderToPurchaseFormPage";
import QuotationFormPage from "@/components/QuotationFormPage/QuotationFormPage";
import RequestFormPage from "@/components/RequestFormPage/RequestFormPage";
import { ROW_PER_PAGE } from "@/utils/constant";
import { withOwnerOrAdmin } from "@/utils/server-side-protections";
import {
  FormType,
  ItemWithDescriptionType,
  ProjectTableRow,
  SupplierTableRow,
  TeamMemberWithUserType,
} from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withOwnerOrAdmin(
  async ({ supabaseClient, user, context }) => {
    try {
      const form = await getForm(supabaseClient, {
        formId: `${context.query.formId}`,
      });

      const teamId = await getUserActiveTeamId(supabaseClient, {
        userId: user.id,
      });
      if (!teamId) throw new Error("No team found");

      const teamMemberList = await getTeamAdminList(supabaseClient, {
        teamId,
      });

      if (form.form_is_formsly_form) {
        if (form.form_name === "Order to Purchase") {
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

          return {
            props: {
              form,
              items,
              itemListCount,
              teamMemberList,
              projects,
              projectListCount,
            },
          };
        } else if (form.form_name === "Quotation") {
          const { data: suppliers, count: supplierListCount } =
            await getNameList(supabaseClient, {
              table: "supplier",
              teamId: teamId,
              page: 1,
              limit: ROW_PER_PAGE,
            });

          return {
            props: {
              form,
              teamMemberList,
              suppliers,
              supplierListCount,
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
  suppliers?: SupplierTableRow[];
  supplierListCount?: number;
};

const Page = ({
  form,
  teamMemberList = [],
  items = [],
  itemListCount = 0,
  projects = [],
  projectListCount = 0,
  suppliers = [],
  supplierListCount = 0,
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
            teamMemberList={teamMemberList}
            form={form}
          />
        );
      case "Quotation":
        return (
          <QuotationFormPage
            teamMemberList={teamMemberList}
            form={form}
            suppliers={suppliers}
            supplierListCount={supplierListCount}
          />
        );

      default:
        return <RequestFormPage form={form} teamMemberList={teamMemberList} />;
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
