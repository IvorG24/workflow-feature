import {
  getForm,
  getItemList,
  getProjectList,
  getTeamAdminList,
  getUserActiveTeamId,
  getWarehouseProcessorList,
} from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import OrderToPurchaseFormPage from "@/components/OrderToPurchaseFormPage/OrderToPurchaseFormPage";
import RequestFormPage from "@/components/RequestFormPage/RequestFormPage";
import { ROW_PER_PAGE } from "@/utils/constant";
import { TEMP_USER_ID } from "@/utils/dummyData";
import {
  FormType,
  ItemWithDescriptionType,
  ProjectTableRow,
  TeamMemberWithUserType,
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

      const { data: projects, count: projectListCount } = await getProjectList(
        supabaseClient,
        {
          teamId: teamId,
          page: 1,
          limit: ROW_PER_PAGE,
        }
      );

      const { data: warehouseProcessors, count: warehouseProcessorListCount } =
        await getWarehouseProcessorList(supabaseClient, {
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
    }

    return {
      props: { form, teamMemberList },
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
};

type Props = {
  form: FormType;
  items?: ItemWithDescriptionType[];
  itemListCount?: number;
  projects?: ProjectTableRow[];
  projectListCount?: number;
  warehouseProcessors?: WarehouseProcessorTableRow[];
  warehouseProcessorListCount?: number;
  teamMemberList: TeamMemberWithUserType[];
};

const Page = ({
  form,
  items = [],
  itemListCount = 0,
  projects = [],
  projectListCount = 0,
  warehouseProcessors = [],
  warehouseProcessorListCount = 0,
  teamMemberList = [],
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
