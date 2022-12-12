import TeamLayout from "@/components/Layout/TeamLayout";
import Meta from "@/components/Meta/Meta";
import { GetServerSideProps } from "next";
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
const CreateRequestForm: NextPageWithLayout = () => {
  return (
    <div>
      <Meta
        description="Create Request Form"
        // this is just a temporary url, canoncial url will be set in the future
        url="localhost:3000/testpage"
      />
      <h1>Generalized form builder component here to build request form</h1>
    </div>
  );
};

CreateRequestForm.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default CreateRequestForm;
