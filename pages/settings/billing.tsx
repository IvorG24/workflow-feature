import WorkspaceLayout from "@/components/Layout/WorkspaceLayout";
import Meta from "@/components/Meta/Meta";
import Setting from "@/components/Setting/Setting";
import { ReactElement } from "react";
import type { NextPageWithLayout } from "../_app";

const BillingSettingsPage: NextPageWithLayout = () => {
  return (
    <div>
      <Meta
        description="Billing Settings Page"
        url="localhost:3000/settings/billing"
      />
      <Setting activeTab="billing" />
    </div>
  );
};

BillingSettingsPage.getLayout = function getLayout(page: ReactElement) {
  return <WorkspaceLayout>{page}</WorkspaceLayout>;
};

export default BillingSettingsPage;
