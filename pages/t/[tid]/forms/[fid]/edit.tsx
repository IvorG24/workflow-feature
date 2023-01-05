import TeamLayout from "@/components/Layout/TeamLayout";
import Meta from "@/components/Meta/Meta";
import RequestFormBuilderPage from "@/components/RequestFormBuilderPage/RequestFormBuilderPage";
import { Database } from "@/utils/database.types";
import {
  getFormTemplate,
  transformFormTemplateToReactDndFormRequest,
} from "@/utils/queries-new";
import { FormRequest } from "@/utils/types";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSideProps } from "next";
import { ReactElement } from "react";
import { resetServerContext } from "react-beautiful-dnd";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  resetServerContext();
  const supabaseClient = createServerSupabaseClient<Database>(ctx);
  const { fid } = ctx.query;

  const formTempalte = await getFormTemplate(supabaseClient, Number(fid));

  if (!formTempalte) return { notFound: true };

  const emptyReactDndRequestForm =
    await transformFormTemplateToReactDndFormRequest(formTempalte);

  const order = formTempalte && formTempalte[0].order_field_id_list;

  emptyReactDndRequestForm.questions.sort((a, b) => {
    if (!order) return 0;
    return (
      order.indexOf(a.fieldId as number) - order.indexOf(b.fieldId as number)
    );
  });

  // Sort emptyReactDndRequestForm.question using order variable above.

  return {
    props: {
      emptyReactDndRequestForm,
    },
  };
};

type Props = {
  emptyReactDndRequestForm: FormRequest;
};

const RequestFormBuilderEdit = ({ emptyReactDndRequestForm }: Props) => {
  return (
    <div>
      <Meta
        description="Edit Request Form"
        // this is just a temporary url, canoncial url will be set in the future
        url="localhost:3000/testpage"
      />
      <RequestFormBuilderPage
        form_id={emptyReactDndRequestForm.form_id}
        form_name={emptyReactDndRequestForm.form_name}
        questions={emptyReactDndRequestForm.questions}
      />
    </div>
  );
};

RequestFormBuilderEdit.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default RequestFormBuilderEdit;
