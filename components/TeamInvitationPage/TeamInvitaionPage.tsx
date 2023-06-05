import {
  Avatar,
  Button,
  Center,
  Container,
  Paper,
  Stack,
  Title,
} from "@mantine/core";

const TeamInvitationPage = () => {
  return (
    <Container fluid>
      <Center>
        <Paper p="xl" mt="xl">
          <Stack align="center">
            <Avatar color="blue" size={120} radius={60}>
              SC
            </Avatar>
            <Title align="center" weight={500} order={4}>
              You have been invited to join Sta Clara Dev team.
            </Title>
            <Stack w="100%" mt="md" spacing="xs">
              <Button fullWidth size="md">
                Accept Invitation
              </Button>
              <Button fullWidth size="md" color="red">
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
