import {
  getForm,
  getItemList,
  getNameList,
  getTeamAdminList,
  getTeamGroupList,
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

      const teamGroupList = await getTeamGroupList(supabaseClient, {
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

          return {
            props: {
              form,
              items,
              itemListCount,
              teamMemberList,
              teamGroupList,
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
              teamGroupList,
            },
          };
        }
      }

      return {
        props: { form, teamMemberList, teamGroupList },
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
  teamGroupList: string[];
  items?: ItemWithDescriptionType[];
  itemListCount?: number;
  suppliers?: SupplierTableRow[];
  supplierListCount?: number;
};

const Page = ({
  form,
  teamMemberList = [],
  teamGroupList = [],
  items = [],
  itemListCount = 0,
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
            teamMemberList={teamMemberList}
            form={form}
            teamGroupList={teamGroupList}
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
          />
        );

      default:
        return (
          <RequestFormPage
            form={form}
            teamMemberList={teamMemberList}
            teamGroupList={teamGroupList}
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
        />
      ) : null}
    </>
  );
};

export default Page;
Page.Layout = "APP";
