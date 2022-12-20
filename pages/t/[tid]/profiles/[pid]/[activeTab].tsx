// this page was just used to test layout, you can delete it if you want
import TeamLayout from "@/components/Layout/TeamLayout";
import Meta from "@/components/Meta/Meta";
import Profile from "@/components/ProfilePage/ProfilePage";
import { MemberProfileContext } from "@/contexts/MemberProfileContext";
import { fetchUserProfile } from "@/utils/queries";
import { UserProfileTableRow } from "@/utils/types";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";
import { ReactElement } from "react";

type Props = {
  profile_data: UserProfileTableRow;
};

const ProfilePage = (props: Props) => {
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
  const supabase = createServerSupabaseClient(ctx);

  const profile_data = await fetchUserProfile(
    supabase,
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
