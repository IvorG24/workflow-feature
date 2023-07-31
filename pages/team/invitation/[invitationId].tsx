import { getInvitation } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import TeamInvitationPage from "@/components/TeamInvitationPage/TeamInvitationPage";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import { InvitationWithTeam } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async ({ supabaseClient, user, context }) => {
    try {
      const invitation = await getInvitation(supabaseClient, {
        invitationId: `${context.query.invitationId}`,
        userEmail: user.email || "",
      });
      if (!invitation) {
        return {
          redirect: {
            destination: "/404",
            permanent: false,
          },
        };
      }

      return {
        props: {
          invitation,
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

export type Props = {
  invitation: InvitationWithTeam;
};

const Page = ({ invitation }: Props) => {
  return (
    <>
      <Meta
        description="Team Invitation Page"
        url="/team/invitation/[invitationId]"
      />
      <TeamInvitationPage invitation={invitation} />
    </>
  );
};

export default Page;
Page.Layout = "APP";
