import WorkspaceLayout from "@/components/Layout/WorkspaceLayout";
import Meta from "@/components/Meta/Meta";
import Requests from "@/components/Requests/Requests";
import { ReactElement } from "react";
import type { NextPageWithLayout } from "../_app";

const RequestsReceivedPage: NextPageWithLayout = () => {
  return (
    <div>
      <Meta
        description="List of all Received Requests"
        url="localhost:3000/requests/receieved"
      />
      <Requests activeTab="received" />
    </div>
  );
};

RequestsReceivedPage.getLayout = function getLayout(page: ReactElement) {
  return <WorkspaceLayout>{page}</WorkspaceLayout>;
};

export default RequestsReceivedPage;
