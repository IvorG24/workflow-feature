import Meta from "@/components/Meta/Meta";
import TeamInvitationPage from "@/components/TeamInvitationPage/TeamInvitaionPage";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const invitationId = ctx.query.invitationId;

    return {
      props: {
        invitation: {
          invitation_id: invitationId,
          invitation_date_created: "2023-06-05 00:30:31.923443+00",
          invitation_to_email: "janedoe@gmail.com",
          invitation_from_team_member: {
            team_member_id: "eb4d3419-b70f-44ba-b88f-c3d983cbcf3b",
            team_member_user_id: "8d01bf49-186f-49e2-8b13-b14220446622",
            team: {
              team_id: "a5a28977-6956-45c1-a624-b9e90911502e",
              team_name: "Sta Clara",
              team_logo: null,
            },
          },
        },
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

export type InvitationPageProps = {
  invitation: {
    invitation_id: string;
    invitation_date_created: string;
    invitation_to_email: string;
    invitation_from_team_member: {
      team_member_id: string;
      team_member_user_id: string;
      team: {
        team_id: string;
        team_name: string;
        team_logo: string | null;
      };
    };
  };
};

const Page = ({ invitation }: InvitationPageProps) => {
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
Page.Layout = "HOME";
