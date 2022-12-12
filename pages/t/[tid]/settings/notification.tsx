import TeamLayout from "@/components/Layout/TeamLayout";
import Meta from "@/components/Meta/Meta";
import Setting from "@/components/Setting/Setting";
import { ReactElement } from "react";
import type { NextPageWithLayout } from "../../../_app";

const NotificationSettingsPage: NextPageWithLayout = () => {
  return (
    <div>
      <Meta
        description="Notification Settings Page"
        url="localhost:3000/settings/notification"
      />
      <Setting activeTab="notification" />
    </div>
  );
};

NotificationSettingsPage.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default NotificationSettingsPage;
