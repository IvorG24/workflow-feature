import TeamLayout from "@/components/Layout/TeamLayout";
import Meta from "@/components/Meta/Meta";
import RequestFormBuilderPage from "@/components/RequestFormBuilderPage/RequestFormBuilderPage";
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

const RequestFormBuilder: NextPageWithLayout = () => {
  return (
    <div>
      <Meta
        description="Build Request Form"
        // this is just a temporary url, canoncial url will be set in the future
        url="localhost:3000/testpage"
      />
      <RequestFormBuilderPage />
    </div>
  );
};

RequestFormBuilder.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default RequestFormBuilder;
