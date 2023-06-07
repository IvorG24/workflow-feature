import { getInvitation } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import TeamInvitationPage from "@/components/TeamInvitationPage/TeamInvitationPage";
import { TEMP_USER_EMAIL } from "@/utils/dummyData";
import { InvitationWithTeam } from "@/utils/types";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const supabaseClient = createServerSupabaseClient(ctx);
    const invitation = await getInvitation(supabaseClient, {
      invitationId: `${ctx.query.invitationId}`,
      userEmail: TEMP_USER_EMAIL,
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
};

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
