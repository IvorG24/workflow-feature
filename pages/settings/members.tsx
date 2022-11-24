import WorkspaceLayout from "@/components/Layout/WorkspaceLayout";
import Meta from "@/components/Meta/Meta";
import { Settings } from "@/components/templates/Settings/Settings";
import { ReactElement } from "react";
import type { NextPageWithLayout } from "../_app";

const MemberSettingsPage: NextPageWithLayout = () => {
  return (
    <div>
      <Meta
        description="Member Settings Page"
        url="localhost:3000/settings/member"
      />
      <Settings activeTab="member" />
    </div>
  );
};

MemberSettingsPage.getLayout = function getLayout(page: ReactElement) {
  return <WorkspaceLayout>{page}</WorkspaceLayout>;
};

export default MemberSettingsPage;
