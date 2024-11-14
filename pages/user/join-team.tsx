import Meta from "@/components/Meta/Meta";
import TeamMembershipRequestPage from "@/components/TeamMembershipRequest/TeamMembershipRequestPage";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import { TeamMembershipRequestTableRow, TeamTableRow } from "@/utils/types";
import { GetServerSideProps } from "next";

type Props = {
  teams: Pick<TeamTableRow, "team_id" | "team_name" | "team_logo">[];
  teamsCount: number;
  teamMembershipRequestList: TeamMembershipRequestTableRow[];
};

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async ({ supabaseClient, user }) => {
    try {
      const { data, error } = await supabaseClient.rpc(
        "get_team_membership_request_page_on_load",
        { input_data: { userId: user.id } }
      );
      if (error) throw error;
      return {
        props: data as Props,
      };
    } catch (e) {
      return {
        redirect: {
          destination: "/500",
          permanent: false,
        },
      };
    }
  }
);

const Page = (props: Props) => {
  return (
    <>
      <Meta description="Join Team Page" url="/user/join-team" />
      <TeamMembershipRequestPage {...props} />
    </>
  );
};

export default Page;
Page.Layout = "APP";
