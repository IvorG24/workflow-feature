import CreateTicketPage from "@/components/CreateTicketPage/CreateTicketPage";

import { getCreateTicketOnLoad } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import { CreateTicketPageOnLoad } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async ({ supabaseClient, user }) => {
    try {
      const { member } = await getCreateTicketOnLoad(supabaseClient, {
        userId: `${user.id}`,
      });

      return {
        props: { member },
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

const Page = ({ member }: CreateTicketPageOnLoad) => {
  return (
    <>
      <Meta description="Create Ticket Page" url="/<teamName>/tickets/create" />

      <CreateTicketPage member={member} />
    </>
  );
};

export default Page;
Page.Layout = "APP";
