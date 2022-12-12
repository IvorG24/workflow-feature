// this page was just used to test layout, you can delete it if you want
import TeamLayout from "@/components/Layout/TeamLayout";
import Meta from "@/components/Meta/Meta";
import Profile from "@/components/ProfilePage/ProfilePage";
import { ReactElement } from "react";
import type { NextPageWithLayout } from "../../_app";

const ProfilePage: NextPageWithLayout = () => {
  return (
    <div>
      <Meta
        description="Profile Page for every Team Members"
        url="localhost:3000/profiles/id"
      />
      <Profile />
    </div>
  );
};

ProfilePage.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default ProfilePage;
