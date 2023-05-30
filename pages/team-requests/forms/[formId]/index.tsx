import {
  getForm,
  getItemList,
  getTeamAdminList,
  getUserActiveTeamId,
} from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import RequestFormPage from "@/components/RequestFormPage/RequestFormPage";
import RequisitionFormPage from "@/components/RequisitionFormPage/RequisitionFormPage";
import { ROW_PER_PAGE } from "@/utils/contant";
import { TEMP_USER_ID } from "@/utils/dummyData";
import {
  FormType,
  ItemWithDescriptionType,
  TeamMemberWithUserType,
} from "@/utils/types";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const supabaseClient = createServerSupabaseClient(ctx);

    const form = await getForm(supabaseClient, {
      formId: `${ctx.query.formId}`,
    });

    const formattedForm = form as unknown as FormType;
    if (
      formattedForm.form_is_formsly_form &&
      formattedForm.form_name === "Requisition Form"
    ) {
      const teamId = await getUserActiveTeamId(supabaseClient, {
        userId: TEMP_USER_ID,
      });

      const teamMemberList = await getTeamAdminList(supabaseClient, {
        teamId,
      });

      const { data: items, count: itemsCount } = await getItemList(
        supabaseClient,
        {
          teamId: teamId,
          page: 1,
          limit: ROW_PER_PAGE,
        }
      );

      return {
        props: { form, items, itemsCount, teamMemberList },
      };
    }

    return {
      props: { form },
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
  itemsCount?: number;
  teamMemberList?: TeamMemberWithUserType[];
};

const Page = ({
  form,
  items = [],
  itemsCount = 0,
  teamMemberList = [],
}: Props) => {
  const formslyForm = () => {
    switch (form.form_name) {
      case "Requisition Form":
        return (
          <RequisitionFormPage
            items={items}
            itemsCount={itemsCount}
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
      {!form.form_is_formsly_form ? <RequestFormPage form={form} /> : null}
    </>
  );
};

export default Page;
Page.Layout = "APP";
