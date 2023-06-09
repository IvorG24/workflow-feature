import {
  getAllItems,
  getAllProjects,
  getAllWarehouesProcessors,
  getForm,
  getUserActiveTeamId,
} from "@/backend/api/get";
import CreateOrderToPurchaseRequestPage from "@/components/CreateOrderToPurchaseRequestPage/CreateOrderToPurchaseRequestPage";
import CreateRequestPage from "@/components/CreateRequestPage/CreateRequestPage";
import Meta from "@/components/Meta/Meta";
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
      formattedForm.form_name === "Order to Purchase"
    ) {
      const teamId = await getUserActiveTeamId(supabaseClient, {
        userId: TEMP_USER_ID,
      });

      // items
      const items = await getAllItems(supabaseClient, {
        teamId: teamId,
      });
      const itemOptions = items.map((item, index) => {
        return {
          option_description: null,
          option_field_id:
            formattedForm.form_section[1].section_field[0].field_id,
          option_id: item.item_id,
          option_order: index,
          option_value: item.item_general_name,
        };
      });

      // projects
      const projects = await getAllProjects(supabaseClient, {
        teamId: teamId,
      });
      const projectOptions = projects.map((project, index) => {
        return {
          option_description: null,
          option_field_id:
            formattedForm.form_section[0].section_field[0].field_id,
          option_id: project.project_id,
          option_order: index,
          option_value: project.project_name,
        };
      });

      // warehouse processors
      const warehouseProcessors = await getAllWarehouesProcessors(
        supabaseClient,
        {
          teamId: teamId,
        }
      );
      const warehouseProcessorOptions = warehouseProcessors.map(
        (warehouseProcessor, index) => {
          return {
            option_description: null,
            option_field_id:
              formattedForm.form_section[0].section_field[0].field_id,
            option_id: warehouseProcessor.warehouse_processor_id,
            option_order: index,
            option_value: `${warehouseProcessor.warehouse_processor_first_name} ${warehouseProcessor.warehouse_processor_last_name} (${warehouseProcessor.warehouse_processor_employee_number})`,
          };
        }
      );

      return {
        props: { form, itemOptions, projectOptions, warehouseProcessorOptions },
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
  itemOptions: OptionTableRow[];
  projectOptions: OptionTableRow[];
  warehouseProcessorOptions: OptionTableRow[];
};

const Page = ({
  form,
  itemOptions,
  projectOptions,
  warehouseProcessorOptions,
}: Props) => {
  const formslyForm = () => {
    switch (form.form_name) {
      case "Order to Purchase":
        return (
          <CreateOrderToPurchaseRequestPage
            itemOptions={itemOptions}
            form={{
              ...form,
              form_section: [
                {
                  ...form.form_section[0],
                  section_field: [
                    {
                      ...form.form_section[0].section_field[0],
                      field_option: projectOptions,
                    },
                    {
                      ...form.form_section[0].section_field[1],
                      field_option: warehouseProcessorOptions,
                    },
                    ...form.form_section[0].section_field.slice(
                      2,
                      form.form_section[0].section_field.length
                    ),
                  ],
                },
                {
                  ...form.form_section[1],
                  section_field: [
                    ...form.form_section[1].section_field.slice(0, 2),
                  ],
                },
              ],
            }}
            conditionalFields={form.form_section[1].section_field.slice(
              2,
              form.form_section[1].section_field.length
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
