import { Avatar, Button, Container, Flex, Text, Title } from "@mantine/core";

type Props = {
  teamName: string;
  teamLogo: string;
  inviteSource: string;
  handleAcceptInvitation: () => void;
};

const AcceptInvitation = ({
  teamName,
  teamLogo,
  inviteSource,
  handleAcceptInvitation,
}: Props) => {
  return (
    <Container fluid p="xl" mt="xl">
      <Flex direction="column" justify="center" align="center" mt="xl">
        <Avatar src={teamLogo} size={200} radius={100} />
        <Title mt="xl">{teamName}</Title>
        <Text size="xl" mt="sm">
          {inviteSource} invited you to {teamName}
        </Text>
        <Button
          mt="xl"
          fullWidth
          maw={300}
          size="lg"
          onClick={handleAcceptInvitation}
        >
          Accept Invite
        </Button>
      </Flex>
    </Container>
  );
};

export default AcceptInvitation;
