import { getTicketOnLoad } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import TicketPage from "@/components/TicketPage.tsx/TicketPage";
import { withAuthAndOnboardingRequestPage } from "@/utils/server-side-protections";
import { CreateTicketPageOnLoad, TicketType } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps =
  withAuthAndOnboardingRequestPage(
    async ({ context, supabaseClient, user }) => {
      try {
        const data = await getTicketOnLoad(supabaseClient, {
          ticketId: `${context.query.ticketId}`,
          userId: user.id,
        });

        return {
          props: {
            ...data,
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
    }
  );

type Props = {
  ticket: TicketType;
  user: CreateTicketPageOnLoad["member"];
};

const Page = ({ ticket, user }: Props) => {
  return (
    <>
      <Meta description="Ticket Page" url="/<teamName>/tickets/[ticketId]" />
      <TicketPage ticket={ticket} user={user} />
    </>
  );
};

export default Page;
Page.Layout = "APP";
