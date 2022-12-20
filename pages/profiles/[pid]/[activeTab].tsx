// this page was just used to test layout, you can delete it if you want
import TeamLayout from "@/components/Layout/TeamLayout";
import Meta from "@/components/Meta/Meta";
import Profile from "@/components/ProfilePage/ProfilePage";
import { UserProfileTableRow } from "@/utils/types";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";
import { createContext, ReactElement, useContext } from "react";

type Props = {
  profile_data: UserProfileTableRow;
};

const ProfileContext = createContext<UserProfileTableRow | null>(null);

export const useUserProfileContext = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error(
      "useUserProfileContext was used outside of ProfileContext.Provider"
    );
  }
  return context;
};

const ProfilePage = ({ profile_data }: Props) => {
  return (
    <ProfileContext.Provider value={profile_data}>
      <Meta
        description="Profile Page for every Team Members"
        url="localhost:3000/profiles/id"
      />
      <Profile />
    </ProfileContext.Provider>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabase = createServerSupabaseClient(ctx);

  const { data: profile_data, error } = await supabase
    .from("user_profile_table")
    .select("*")
    .eq("user_id", ctx.params?.pid)
    .single();

  if (error) throw error;

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
