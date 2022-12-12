import CreateRequest from "@/components/CreateRequest/CreateRequest";
import TeamLayout from "@/components/Layout/TeamLayout";
import Meta from "@/components/Meta/Meta";
import { ReactElement } from "react";
import type { NextPageWithLayout } from "../../../_app";

const CreateRequestPage: NextPageWithLayout = () => {
  // todo: fix meta tags
  return (
    <div>
      <Meta
        description="Create Request Page"
        url="localhost:3000/requests/create"
      />

      <CreateRequest />
    </div>
  );
};

CreateRequestPage.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default CreateRequestPage;
