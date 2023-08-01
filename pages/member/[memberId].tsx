import { getTeamMember } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import TeamMemberPage from "@/components/TeamMemberPage/TeamMemberPage";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import { TeamMemberTableRow, UserTableRow } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async ({ supabaseClient, context }) => {
    try {
      const member = await getTeamMember(supabaseClient, {
        teamMemberId: `${context.query.memberId}`,
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

type Props = {
  member: TeamMemberTableRow & { team_member_user: UserTableRow };
};

const Page = ({ member }: Props) => {
  return (
    <>
      <Meta description="User Profile Page" url="/member/<memberId>" />
      <TeamMemberPage member={member} />
    </>
  );
};

export default Page;
Page.Layout = "APP";
