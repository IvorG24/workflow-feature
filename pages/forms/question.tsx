import Question from "@/components/FormsPage/Question";
import WorkspaceLayout from "@/components/Layout/WorkspaceLayout";
import Meta from "@/components/Meta/Meta";
import { GetServerSideProps } from "next";
import { ReactElement } from "react";
import { resetServerContext } from "react-beautiful-dnd";
import type { NextPageWithLayout } from "../_app";

export const getServerSideProps: GetServerSideProps = async () => {
  resetServerContext();
  return {
    props: {
      data: [],
    },
  };
};

// todo: fix meta tags
const FormQuestion: NextPageWithLayout = () => {
  return (
    <div>
      <Meta description="Question" url="localhost:3000/forms/question" />
      <Question />
    </div>
  );
};

FormQuestion.getLayout = function getLayout(page: ReactElement) {
  return <WorkspaceLayout>{page}</WorkspaceLayout>;
};

export default FormQuestion;
