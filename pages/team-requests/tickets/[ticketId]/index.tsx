import Meta from "@/components/Meta/Meta";
import TicketPage from "@/components/TicketPage.tsx/TicketPage";
import { withAuthAndOnboardingRequestPage } from "@/utils/server-side-protections";
import { GetServerSideProps } from "next";
import { TEMP_TICKET_LIST, TicketListItemType } from "..";

export const getServerSideProps: GetServerSideProps =
  withAuthAndOnboardingRequestPage(async ({ context }) => {
    try {
      const ticket = TEMP_TICKET_LIST.find(
        (ticket) => ticket.ticket_id === context.query.ticketId
      );

      if (!ticket) throw Error;

      return {
        props: {
          ticket,
        },
      };
    } catch (e) {
      console.error(e);
      return {
        redirect: {
          destination: "/500",
          permanent: false,
        },
      };
    }
  });

type Props = {
  ticket: TicketListItemType;
};

const Page = ({ ticket }: Props) => {
  return (
    <>
      <Meta description="Ticket Page" url="/team-requests/tickets/[ticketId]" />
      <TicketPage ticket={ticket} />
    </>
  );
};

export default Page;
Page.Layout = "APP";
