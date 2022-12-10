import WorkspaceLayout from "@/components/Layout/WorkspaceLayout";
import Meta from "@/components/Meta/Meta";
import { ReactElement } from "react";
import type { NextPageWithLayout } from "../../../_app";
import Request from "@/components/RequestsPage/RequestsPage"

const RequestsPage: NextPageWithLayout = () => {
  // todo: fix meta tags
  return (
    <div>
      <Meta description="List of all Requests" url="localhost:3000/requests" />
      <Request activeTab="all"/>
    </div>
  );
};

RequestsPage.getLayout = function getLayout(page: ReactElement) {
  return <WorkspaceLayout>{page}</WorkspaceLayout>;
};

export default RequestsPage;
