import { getTicketList, getUserActiveTeamId } from "@/backend/api/get";
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

      if (!teamId) {
        return {
          redirect: {
            destination: "/team/create",
            permanent: false,
          },
        };
      }

      const { count: ticketListCount } = await getTicketList(supabaseClient, {
        teamId,
        limit: 13,
        page: 1,
        status: ["PENDING"],
      });

      return {
        props: {
          ticketListCount,
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
  ticketListCount: number;
};

const Page = ({ ticketListCount }: Props) => {
  return (
    <>
      <Meta description="Request List Page" url="/team-requests/requests" />
      <Dashboard ticketListCount={ticketListCount} />
    </>
  );
};

export default Page;
Page.Layout = "APP";
