import { InvitationPageProps } from "@/pages/team/invitation/[invitationId]";
import {
  Avatar,
  Button,
  Center,
  Container,
  Paper,
  Stack,
  Title,
} from "@mantine/core";

const TeamInvitationPage = ({ invitation }: InvitationPageProps) => {
  const handleAcceptInvitation = () => {
    alert(
      `You are now a member of ${invitation.invitation_from_team_member.team.team_name} team.`
    );
    console.log("accepted invitation", invitation);
  };

  const handleDeclineInvitation = () => {
    alert(
      `You have declined to join ${invitation.invitation_from_team_member.team.team_name} team.`
    );
    console.log("declined invitation", invitation);
  };

  return (
    <Container fluid>
      <Center>
        <Paper p="xl" mt="xl">
          <Stack align="center">
            <Avatar
              color="blue"
              src={invitation.invitation_from_team_member.team.team_logo}
              size={120}
              radius={60}
            >
              SC
            </Avatar>
            <Title align="center" weight={500} order={4}>
              You have been invited to join{" "}
              {invitation.invitation_from_team_member.team.team_name} team.
            </Title>
            <Stack w="100%" mt="md" spacing="xs">
              <Button
                fullWidth
                size="md"
                onClick={() => handleAcceptInvitation()}
              >
                Accept Invitation
              </Button>
              <Button
                fullWidth
                size="md"
                color="red"
                onClick={() => handleDeclineInvitation()}
              >
                Decline Invitation
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Center>
    </Container>
  );
};

export default TeamInvitationPage;
