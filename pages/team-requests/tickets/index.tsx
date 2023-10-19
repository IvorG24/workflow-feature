// Imports
import { getTicketListOnLoad } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import TicketListPage from "@/components/TicketListPage/TicketListPage";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import { TeamMemberWithUserType, TicketListType } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async ({ user, supabaseClient }) => {
    try {
      const requestListData = await getTicketListOnLoad(supabaseClient, {
        userId: user.id,
      });

      return {
        props: requestListData,
      };
    } catch (error) {
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
  ticketList: TicketListType;
  ticketListCount: number;
  teamMemberList: TeamMemberWithUserType[];
};

const Page = ({ ticketList, ticketListCount, teamMemberList }: Props) => {
  return (
    <>
      <Meta description="Ticket List Page" url="/team-requests/tickets" />

      <TicketListPage
        ticketList={ticketList}
        ticketListCount={ticketListCount}
        teamMemberList={teamMemberList}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";