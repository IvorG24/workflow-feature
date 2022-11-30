// this page was just used to test layout, you can delete it if you want
import WorkspaceLayout from "@/components/Layout/WorkspaceLayout";
import Meta from "@/components/Meta/Meta";
import Profile from "@/components/Profile/Profile";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { ReactElement, useEffect } from "react";
import type { NextPageWithLayout } from "../../_app";

const ProfilePage: NextPageWithLayout = () => {
  const { supabaseClient, session, isLoading } = useSessionContext();

  // todo: transfer this to GSSP when fetching sesion inside GSSP is figured out.
  useEffect(() => {
    const handleNewUser = async () => {
      if (isLoading) return;

      if (!session)
        return {
          redirect: {
            destination: "/sign-in",
            permanent: false,
          },
        };

      // Purpose: Auto save new user to user_profile_table without using database triggers.
      // This approach - new user only saved to user_profile_table when user visits their profile.
      // https://github.com/supabase/supabase/tree/master/examples/slack-clone/nextjs-slack-clone
      const { data } = await supabaseClient
        .from("user_profile_table")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (!data) await supabaseClient.rpc("handle_new_user");
    };

    handleNewUser();
  }, [supabaseClient, session, isLoading]);

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
  return <WorkspaceLayout>{page}</WorkspaceLayout>;
};

export default ProfilePage;
