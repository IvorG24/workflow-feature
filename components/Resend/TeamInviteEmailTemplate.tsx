type TeamInviteEmailTemplateProps = {
  teamName: string;
  inviteUrl: string;
};

const TeamInviteEmailTemplate = ({
  teamName,
  inviteUrl,
}: TeamInviteEmailTemplateProps) => (
  <div>
    <p>Hi,</p>
    <p>
      Please click the link below to accept the invitation. This invite is only
      valid for 48 hours.
    </p>
    &nbsp;
    <p>
      <a href={inviteUrl}>Join {teamName} on Formsly.io</a>
    </p>
    &nbsp;
    <p>Thank you,</p>
    <p>Formsly Team</p>
  </div>
);

export default TeamInviteEmailTemplate;
