import { getUserWithSignature } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import UserSettingsPage from "@/components/UserSettingsPage/UserSettingsPage";
import { TEMP_USER_ID } from "@/utils/dummyData";
import { UserWithSignatureType } from "@/utils/types";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const supabaseClient = createServerSupabaseClient(ctx);

    const user = await getUserWithSignature(supabaseClient, {
      userId: TEMP_USER_ID,
    });

    return {
      props: { user: user },
    };
  } catch (error) {
    console.error(error);
    return {
      redirect: {
        destination: "/500",
        permanent: false,
      },
    };
  }
};

type Props = {
  user: UserWithSignatureType;
};

const Page = ({ user }: Props) => {
  return (
    <>
      <Meta description="User Settings Page" url="/user/settings" />
      <UserSettingsPage user={user} />
    </>
  );
};

export default Page;
Page.Layout = "APP";
