import Meta from "@/components/Meta/Meta";
import TeamInvitationPage from "@/components/TeamInvitationPage/TeamInvitaionPage";

const Page = () => {
  return (
    <>
      <Meta
        description="Team Invitation Page"
        url="/team/invitation/[invitationId]"
      />
      <TeamInvitationPage />
    </>
  );
};

export default Page;
Page.Layout = "APP";
