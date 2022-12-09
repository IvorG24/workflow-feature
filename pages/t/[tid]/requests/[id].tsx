import WorkspaceLayout from "@/components/Layout/WorkspaceLayout";
import Meta from "@/components/Meta/Meta";
import { ReactElement } from "react";
import type { NextPageWithLayout } from "../../../_app";

const RequestPage: NextPageWithLayout = () => {
  // todo: fix meta tags
  return (
    <div>
      <Meta description="Specific Request" url="localhost:3000/requests/id" />
      <h1>Request Page</h1>
    </div>
  );
};

RequestPage.getLayout = function getLayout(page: ReactElement) {
  return <WorkspaceLayout>{page}</WorkspaceLayout>;
};

export default RequestPage;
