import { getTicketOnLoad } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import TicketPage from "@/components/TicketPage.tsx/TicketPage";
import { withAuthAndOnboardingRequestPage } from "@/utils/server-side-protections";
import { CreateTicketFormValues, TicketType } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps =
  withAuthAndOnboardingRequestPage(async ({ context, supabaseClient }) => {
    try {
      const data = await getTicketOnLoad(supabaseClient, {
        ticketId: `${context.query.ticketId}`,
      });

      return {
        props: {
          ...data,
        },
      };
    } catch (e) {
      return {
        redirect: {
          destination: "/500",
          permanent: false,
        },
      };
    }
  });

type Props = {
  ticket: TicketType;
  ticketForm: CreateTicketFormValues;
};

const Page = ({ ticket, ticketForm }: Props) => {
  return (
    <>
      <Meta description="Ticket Page" url="/<teamName>/tickets/[ticketId]" />
      <TicketPage ticket={ticket} ticketForm={ticketForm} />
    </>
  );
};

export default Page;
Page.Layout = "APP";
