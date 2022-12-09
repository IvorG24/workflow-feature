import WorkspaceLayout from "@/components/Layout/WorkspaceLayout";
import Meta from "@/components/Meta/Meta";
import { ReactElement } from "react";
import { NextPageWithLayout } from "./_app";

const Forms: NextPageWithLayout = () => {
  return (
    <div>
      {/* todo: fix meta tags */}
      <Meta description="Home page" url="localhost:3000/forms" />
      <h1>Home page</h1>
    </div>
  );
};

Forms.getLayout = function getLayout(page: ReactElement) {
  return <WorkspaceLayout>{page}</WorkspaceLayout>;
};

export default Forms;
