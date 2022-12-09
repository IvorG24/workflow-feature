import WorkspaceLayout from "@/components/Layout/WorkspaceLayout";
import Meta from "@/components/Meta/Meta";
import Setting from "@/components/Setting/Setting";
import { ReactElement } from "react";
import type { NextPageWithLayout } from "../../../_app";

const ProfileSettingsPage: NextPageWithLayout = () => {
  return (
    <div>
      <Meta
        description="Profile Settings Page"
        url="localhost:3000/settings/profile"
      />
      <Setting activeTab="profile" />
    </div>
  );
};

ProfileSettingsPage.getLayout = function getLayout(page: ReactElement) {
  return <WorkspaceLayout>{page}</WorkspaceLayout>;
};

export default ProfileSettingsPage;
