import WorkspaceLayout from "@/components/Layout/WorkspaceLayout";
import Meta from "@/components/Meta/Meta";
import { ReactElement } from "react";
import type { NextPageWithLayout } from "../../../_app";

const RequestsPage: NextPageWithLayout = () => {
  // todo: fix meta tags
  return (
    <div>
      <Meta description="List of all Requests" url="localhost:3000/requests" />
      <h1>Requests Page</h1>
    </div>
  );
};

RequestsPage.getLayout = function getLayout(page: ReactElement) {
  return <WorkspaceLayout>{page}</WorkspaceLayout>;
};

export default RequestsPage;
