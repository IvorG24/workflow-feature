import { getUserValidID } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import UserValidIDVerificationPage from "@/components/UserValidIDVerificationPage/UserValidIDVerificationPage";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import { UserValidIdWithUser } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async ({ supabaseClient, context, user: { id } }) => {
    try {
      const { validId } = context.query;
      const userValidId = await getUserValidID(supabaseClient, {
        validId: `${validId}`,
      });

      return {
        props: { userValidId, approverId: id },
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
  userValidId: UserValidIdWithUser;
  approverId: string;
};

const Page = ({ userValidId, approverId }: Props) => {
  return (
    <>
      <Meta description="User Settings Page" url="/user/settings" />
      <UserValidIDVerificationPage
        userValidId={userValidId}
        approverId={approverId}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
