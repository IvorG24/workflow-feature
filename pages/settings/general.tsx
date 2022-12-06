import WorkspaceLayout from "@/components/Layout/WorkspaceLayout";
import Meta from "@/components/Meta/Meta";
import Setting from "@/components/Setting/Setting";
import { ReactElement } from "react";
import type { NextPageWithLayout } from "../_app";

const GeneralSettingsPage: NextPageWithLayout = () => {
  return (
    <div>
      <Meta
        description="General Settings Page"
        url="localhost:3000/settings/general"
      />
      <Setting activeTab="general" />
    </div>
  );
};

GeneralSettingsPage.getLayout = function getLayout(page: ReactElement) {
  return <WorkspaceLayout>{page}</WorkspaceLayout>;
};

export default GeneralSettingsPage;
