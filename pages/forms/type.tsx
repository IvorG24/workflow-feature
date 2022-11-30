import Type from "@/components/FormsPage/Type";
import Meta from "@/components/Meta/Meta";
import { GetServerSideProps } from "next";
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
const FormType: NextPageWithLayout = () => {
  return (
    <div>
      <Meta description="Choose Form Type" url="localhost:3000/forms/type" />
      <Type />
    </div>
  );
};

export default FormType;
