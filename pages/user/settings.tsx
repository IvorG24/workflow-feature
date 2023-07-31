import { getUserWithSignature } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import UserSettingsPage from "@/components/UserSettingsPage/UserSettingsPage";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import { UserWithSignatureType } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async ({ supabaseClient, user: { id } }) => {
    try {
      const user = await getUserWithSignature(supabaseClient, {
        userId: id,
      });

      return {
        props: { user },
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
  }
);

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
