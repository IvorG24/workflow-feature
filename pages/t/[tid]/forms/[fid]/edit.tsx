import TeamLayout from "@/components/Layout/TeamLayout";
import Meta from "@/components/Meta/Meta";
import RequestFormBuilderPage from "@/components/RequestFormBuilderPage/RequestFormBuilderPage";
import { Database } from "@/utils/database.types";
import {
  fetchEmptyForm,
  mapEmptyFormToReactDndRequestForm,
} from "@/utils/queries";
import { FormRequest } from "@/utils/types";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSideProps } from "next";
import { ReactElement } from "react";
import { resetServerContext } from "react-beautiful-dnd";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  resetServerContext();
  const supabaseClient = createServerSupabaseClient<Database>(ctx);
  const { fid } = ctx.query;

  const emptyForm = await fetchEmptyForm(supabaseClient, Number(fid));
  if (!emptyForm) return { notFound: true };

  const emptyReactDndRequestForm = await mapEmptyFormToReactDndRequestForm({
    formTableRow: emptyForm.formTableRow,
    fieldTableRowList: emptyForm.fieldTableRowList,
  });

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
