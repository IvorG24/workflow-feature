import { Banner } from "@/components/EnvironmentalImpactPage/banner";
import Layout from "@/components/Layout/Layout";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";

const UserAccountSettingsPage: NextPageWithLayout = () => {
  return <Banner />;
};

export default UserAccountSettingsPage;

UserAccountSettingsPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
