import { getUserActiveTeamId } from "@/backend/api/get";
import Dashboard from "@/components/Dashboard/Dashboard";
import Meta from "@/components/Meta/Meta";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async ({ supabaseClient, user }) => {
    try {
      const teamId = await getUserActiveTeamId(supabaseClient, {
        userId: user.id,
      });

      if (!teamId) throw Error;

      return {
        props: {
          activeTeamId: teamId,
        },
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
  activeTeamId: string;
};

const Page = ({ activeTeamId }: Props) => {
  return (
    <>
      <Meta description="Request List Page" url="/team-requests/requests" />
      <Dashboard activeTeamId={activeTeamId} />
    </>
  );
};

export default Page;
Page.Layout = "APP";
