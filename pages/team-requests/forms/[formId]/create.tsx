import { getForm, getItemList, getUserActiveTeamId } from "@/backend/api/get";
import CreateRequestPage from "@/components/CreateRequestPage/CreateRequestPage";
import CreateRequisitionRequestPage from "@/components/CreateRequisitionRequestPage/CreateRequisitionRequestPage";
import Meta from "@/components/Meta/Meta";
import { ROW_PER_PAGE } from "@/utils/constant";
import { TEMP_USER_ID } from "@/utils/dummyData";
import { FormType, FormWithResponseType, OptionTableRow } from "@/utils/types";
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

      const { data: items } = await getItemList(supabaseClient, {
        teamId: teamId,
        page: 1,
        limit: ROW_PER_PAGE,
      });

      const options = items.map((item, index) => {
        return {
          option_description: null,
          option_field_id:
            formattedForm.form_section[0].section_field[0].field_id,
          option_id: item.item_id,
          option_order: index,
          option_value: item.item_general_name,
        };
      });

      return {
        props: { form, options },
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
  form: FormWithResponseType;
  options: OptionTableRow[];
};

const Page = ({ form, options }: Props) => {
  const formslyForm = () => {
    switch (form.form_name) {
      case "Requisition Form":
        return (
          <CreateRequisitionRequestPage
            options={options}
            form={{
              ...form,
              form_section: [
                {
                  ...form.form_section[0],
                  section_field: [
                    ...form.form_section[0].section_field.slice(0, 2),
                  ],
                },
              ],
            }}
            conditionalFields={form.form_section[0].section_field.slice(
              2,
              form.form_section[0].section_field.length
            )}
          />
        );
    }
  };
  return (
    <>
      <Meta
        description="Create Request Page"
        url="/team-requests/forms/[formId]/create"
      />
      {form.form_is_formsly_form ? formslyForm() : null}
      {!form.form_is_formsly_form ? <CreateRequestPage form={form} /> : null}
    </>
  );
};

export default Page;
Page.Layout = "APP";
