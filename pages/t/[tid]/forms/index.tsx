import FormsPage from "@/components/FormsPage/FormsPage";
import WorkspaceLayout from "@/components/Layout/WorkspaceLayout";
import Meta from "@/components/Meta/Meta";
import { ReactElement } from "react";
import type { NextPageWithLayout } from "../../../_app";

const Forms: NextPageWithLayout = () => {
  return (
    <div>
      {/* todo: fix meta tags */}
      <Meta
        description="Forms Page for every form"
        url="localhost:3000/forms"
      />
      <FormsPage />
    </div>
  );
};

Forms.getLayout = function getLayout(page: ReactElement) {
  return <WorkspaceLayout>{page}</WorkspaceLayout>;
};

export default Forms;
