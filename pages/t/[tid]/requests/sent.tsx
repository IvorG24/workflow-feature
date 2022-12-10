import WorkspaceLayout from "@/components/Layout/WorkspaceLayout";
import Meta from "@/components/Meta/Meta";
import Request from "@/components/RequestsPage/RequestsPage";
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
      <Request activeTab="sent" />
    </div>
  );
};

RequestsSentPage.getLayout = function getLayout(page: ReactElement) {
  return <WorkspaceLayout>{page}</WorkspaceLayout>;
};

export default RequestsSentPage;
