import TeamLayout from "@/components/Layout/TeamLayout";
import Meta from "@/components/Meta/Meta";
import CurrentUserProfileContext from "@/contexts/CurrentUserProfileContext";
import { ReactElement, useContext } from "react";
import { NextPageWithLayout } from "./_app";

const Forms: NextPageWithLayout = () => {

  // Get user profile context here.
  const userProfile = useContext(CurrentUserProfileContext);
  // Change the value of the context here.
  


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
