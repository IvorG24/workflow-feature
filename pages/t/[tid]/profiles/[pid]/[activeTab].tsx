// this page was just used to test layout, you can delete it if you want
import TeamLayout from "@/components/Layout/TeamLayout";
import Meta from "@/components/Meta/Meta";
import Profile from "@/components/ProfilePage/ProfilePage";
import MemberProfileContext from "@/contexts/MemberProfileContext";
import { getUserProfile, GetUserProfile } from "@/utils/queries-new";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";

type Props = {
  profile_data: GetUserProfile;
};

const ProfilePage: NextPageWithLayout<Props> = (props) => {
  return (
    <MemberProfileContext.Provider value={props.profile_data}>
      <Meta
        description="Profile Page for every Team Members"
        url="localhost:3000/profiles/id"
      />
      <Profile />
    </MemberProfileContext.Provider>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabaseClient = createServerSupabaseClient(ctx);
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session)
    return {
      redirect: {
        destination: "/sign-in",
        permanent: false,
      },
    };

  const profile_data = await getUserProfile(
    supabaseClient,
    ctx.params?.pid as string
  );

  return {
    props: {
      profile_data,
    },
  };
};

ProfilePage.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default ProfilePage;
