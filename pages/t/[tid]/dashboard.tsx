// this page was just used to test layout, you can delete it if you want
import WorkspaceLayout from "@/components/Layout/WorkspaceLayout";
import Meta from "@/components/Meta/Meta";
import { ReactElement } from "react";
import type { NextPageWithLayout } from "../../_app";

const Page: NextPageWithLayout = () => {
  return (
    <div>
      <Meta
        description="Test page used for testing layout"
        // this is just a temporary url, canoncial url will be set in the future
        url="localhost:3000/testpage"
      />
      <h1>Team Dashboard page</h1>
    </div>
  );
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <WorkspaceLayout>{page}</WorkspaceLayout>;
};

export default Page;
