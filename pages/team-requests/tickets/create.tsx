import CreateTicketPage from "@/components/CreateTicketPage/CreateTicketPage";

import Meta from "@/components/Meta/Meta";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import { TeamMemberType } from "@/utils/types";
import { GetServerSideProps } from "next";
import { TEMP_TEAM_MEMBER_LIST } from ".";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async () => {
    try {
      const teamMemberData = TEMP_TEAM_MEMBER_LIST[0];

      return {
        props: { teamMemberData },
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
  teamMemberData: TeamMemberType;
};

const Page = (props: Props) => {
  return (
    <>
      <Meta
        description="Create Ticket Page"
        url="/team-requests/tickets/create"
      />

      <CreateTicketPage {...props} />
    </>
  );
};

export default Page;
Page.Layout = "APP";
