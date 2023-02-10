import { Banner } from "@/components/EnvironmentalImpactPage/banner";
import Layout from "@/components/Layout/Layout";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";

const UserProfilePage: NextPageWithLayout = () => {
  return <Banner />;
};

export default UserProfilePage;

UserProfilePage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
