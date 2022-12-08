import WorkspaceLayout from "@/components/Layout/WorkspaceLayout";
import Meta from "@/components/Meta/Meta";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { ReactElement } from "react";
import { resetServerContext } from "react-beautiful-dnd";
import type { NextPageWithLayout } from "../../../_app";

export const getServerSideProps: GetServerSideProps = async () => {
  resetServerContext();
  return {
    props: {
      data: [],
    },
  };
};

// todo: fix meta tags
const FormType: NextPageWithLayout = () => {
  return (
    <div>
      <Meta
        description="Choose Form Type"
        // this is just a temporary url, canoncial url will be set in the future
        url="localhost:3000/forms/type"
      />
    </div>
  );
};

// todo: fix meta tags
const FormQuestion: NextPageWithLayout = () => {
  return (
    <div>
      <Meta
        description="Question"
        // this is just a temporary url, canoncial url will be set in the future
        url="localhost:3000/forms/question"
      />
    </div>
  );
};

FormQuestion.getLayout = function getLayout(page: ReactElement) {
  return <WorkspaceLayout>{page}</WorkspaceLayout>;
};

const CreateForm = () => {
  const router = useRouter();
  const { step } = router.query;
  return Number(step) === 1 ? <FormType /> : <FormQuestion />;
};

export default CreateForm;
