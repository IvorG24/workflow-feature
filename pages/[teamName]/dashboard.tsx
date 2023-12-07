import { getTeam, getTicketList } from "@/backend/api/get";
import Dashboard from "@/components/Dashboard/Dashboard";
import Meta from "@/components/Meta/Meta";
import { withActiveTeam } from "@/utils/server-side-protections";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withActiveTeam(
  async ({ supabaseClient, teamId }) => {
    try {
      const currentTeam = await getTeam(supabaseClient, { teamId });

      if (!currentTeam) {
        return {
          redirect: {
            destination: "/",
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
      <Meta description="Request List Page" url="/{teamName}/dashboard" />
      <Dashboard ticketListCount={ticketListCount} />
    </>
  );
};

export default Page;
Page.Layout = "APP";
