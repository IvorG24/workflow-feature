import CreateTeam from "@/components/CreateTeam/CreateTeam";
import TeamLayout from "@/components/Layout/TeamLayout";
import Meta from "@/components/Meta/Meta";
import { ReactElement } from "react";
import type { NextPageWithLayout } from "../_app";

const CreateTeamPage: NextPageWithLayout = () => {
  return (
    <div>
      {/* todo: fix meta tags */}
      <Meta description="Create Team Page" url="localhost:3000/team/create" />
      <CreateTeam />
    </div>
  );
};

CreateTeamPage.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default CreateTeamPage;
