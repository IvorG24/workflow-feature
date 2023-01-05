import TeamLayout from "@/components/Layout/TeamLayout";
import Meta from "@/components/Meta/Meta";
import ActiveTeamContext from "@/contexts/ActiveTeamContext";
import CurrentUserProfileContext from "@/contexts/CurrentUserProfileContext";
import CurrentUserTeamListContext from "@/contexts/CurrentUserTeamListContext";
import { useRouter } from "next/router";
import { ReactElement, useContext } from "react";
import { NextPageWithLayout } from "./_app";

const Forms: NextPageWithLayout = () => {
  const router = useRouter();
  const userProfile = useContext(CurrentUserProfileContext);
  const teamList = useContext(CurrentUserTeamListContext);
  const team = useContext(ActiveTeamContext);

  console.log("userProfile", JSON.stringify(userProfile, null, 2));
  console.log("teamList", JSON.stringify(teamList, null, 2));
  console.log("team", JSON.stringify(team, null, 2));

  return (
    <div>
      {/* todo: fix meta tags */}
      <Meta description="Home page" url="localhost:3000/forms" />
      <h1>Home page</h1>
    </div>
  );
};

Forms.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default Forms;
