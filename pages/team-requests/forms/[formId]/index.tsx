import {
  getForm,
  getItemList,
  getNameList,
  getProcessorList,
  getTeamAdminList,
  getUserActiveTeamId,
} from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import OrderToPurchaseFormPage from "@/components/OrderToPurchaseFormPage/OrderToPurchaseFormPage";
import PurchaseOrderFormPage from "@/components/PurchaeOrderFormPage/PurchaseOrderFormPage";
import RequestFormPage from "@/components/RequestFormPage/RequestFormPage";
import { ROW_PER_PAGE } from "@/utils/constant";
import { TEMP_USER_ID } from "@/utils/dummyData";
import {
  FormType,
  ItemWithDescriptionType,
  ProjectTableRow,
  PurchasingProcessorTableRow,
  TeamMemberWithUserType,
  VendorTableRow,
  WarehouseProcessorTableRow,
} from "@/utils/types";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const supabaseClient = createServerSupabaseClient(ctx);

    const form = await getForm(supabaseClient, {
      formId: `${ctx.query.formId}`,
    });

    const teamId = await getUserActiveTeamId(supabaseClient, {
      userId: TEMP_USER_ID,
    });

    const teamMemberList = await getTeamAdminList(supabaseClient, {
      teamId,
    });

    const formattedForm = form as unknown as FormType;
    if (
      formattedForm.form_is_formsly_form &&
      formattedForm.form_name === "Order to Purchase"
    ) {
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

      const { data: warehouseProcessors, count: warehouseProcessorListCount } =
        await getProcessorList(supabaseClient, {
          processor: "warehouse",
          teamId: teamId,
          page: 1,
          limit: ROW_PER_PAGE,
        });

      return {
        props: {
          form,
          items,
          itemListCount,
          teamMemberList,
          projects,
          projectListCount,
          warehouseProcessors,
          warehouseProcessorListCount,
        },
      };
    } else if (
      formattedForm.form_is_formsly_form &&
      formattedForm.form_name === "Purchase Order"
    ) {
      const { data: vendors, count: vendorListCount } = await getNameList(
        supabaseClient,
        {
          table: "vendor",
          teamId: teamId,
          page: 1,
          limit: ROW_PER_PAGE,
        }
      );

      const {
        data: purchasingProcessors,
        count: purchasingProcessorListCount,
      } = await getProcessorList(supabaseClient, {
        processor: "purchasing",
        teamId: teamId,
        page: 1,
        limit: ROW_PER_PAGE,
      });
      return {
        props: {
          form,
          teamMemberList,
          vendors,
          vendorListCount,
          purchasingProcessors,
          purchasingProcessorListCount,
        },
      };
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
};

type Props = {
  form: FormType;
  teamMemberList: TeamMemberWithUserType[];

  items?: ItemWithDescriptionType[];
  itemListCount?: number;
  projects?: ProjectTableRow[];
  projectListCount?: number;
  warehouseProcessors?: WarehouseProcessorTableRow[];
  warehouseProcessorListCount?: number;
  vendors?: VendorTableRow[];
  vendorListCount?: number;
  purchasingProcessors?: PurchasingProcessorTableRow[];
  purchasingProcessorListCount?: number;
};

const Page = ({
  form,
  teamMemberList = [],

  items = [],
  itemListCount = 0,
  projects = [],
  projectListCount = 0,
  warehouseProcessors = [],
  warehouseProcessorListCount = 0,
  vendors = [],
  vendorListCount = 0,
  purchasingProcessors = [],
  purchasingProcessorListCount = 0,
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
            warehouseProcessors={warehouseProcessors}
            warehouseProcessorListCount={warehouseProcessorListCount}
            teamMemberList={teamMemberList}
            form={form}
          />
        );
      case "Purchase Order":
        return (
          <PurchaseOrderFormPage
            teamMemberList={teamMemberList}
            form={form}
            vendors={vendors}
            vendorListCount={vendorListCount}
            purchasingProcessors={purchasingProcessors}
            purchasingProcessorListCount={purchasingProcessorListCount}
          />
        );
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
