import WorkspaceLayout from "@/components/Layout/WorkspaceLayout";
import Meta from "@/components/Meta/Meta";
import Request from "@/components/Request/Request";
import { ReactElement } from "react";
import type { NextPageWithLayout } from "../_app";

const RequestPage: NextPageWithLayout = () => {
  // todo: fix meta tags
  return (
    <div>
      <Meta description="Specific Request" url="localhost:3000/requests/id" />
      <Request />
    </div>
  );
};

RequestPage.getLayout = function getLayout(page: ReactElement) {
  return <WorkspaceLayout>{page}</WorkspaceLayout>;
};

export default RequestPage;
