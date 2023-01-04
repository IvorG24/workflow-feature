import { Button, Container, Flex, Text, Title } from "@mantine/core";
import { useRouter } from "next/router";

const InvalidInvitation = () => {
  const router = useRouter();

  return (
    <Container fluid p="xl" mt="xl">
      <Flex direction="column" justify="center" align="center" mt="xl">
        {/* <Avatar src={teamLogo} size={200} radius={100} /> */}
        <Title mt="xl">Failed to accept invite</Title>
        <Text size="xl" mt="sm">
          Invitation is invalid
        </Text>
        <Button
          mt="xl"
          fullWidth
          maw={300}
          size="lg"
          onClick={() => router.push("/")}
          data-cy="invitation-button"
        >
          Return to home
        </Button>
      </Flex>
    </Container>
  );
};

export default InvalidInvitation;
