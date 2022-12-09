import WorkspaceLayout from "@/components/Layout/WorkspaceLayout";
import Meta from "@/components/Meta/Meta";
import { ReactElement } from "react";
import type { NextPageWithLayout } from "../../../_app";

const RequestsSentPage: NextPageWithLayout = () => {
  // todo: fix meta tags
  return (
    <div>
      <Meta
        description="List of all Sent Requests"
        url="localhost:3000/requests"
      />
      <h1>Requests Sent Page</h1>
    </div>
  );
};

RequestsSentPage.getLayout = function getLayout(page: ReactElement) {
  return <WorkspaceLayout>{page}</WorkspaceLayout>;
};

export default RequestsSentPage;
