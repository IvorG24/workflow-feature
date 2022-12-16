import { Avatar, Button, Container, Flex, Text, Title } from "@mantine/core";
import { useRouter } from "next/router";

type Props = {
  teamName: string;
  teamLogo: string;
  teamId: string;
};

const AlreadyMember = ({ teamName, teamLogo, teamId }: Props) => {
  const router = useRouter();

  return (
    <Container fluid p="xl" mt="xl">
      <Flex direction="column" justify="center" align="center" mt="xl">
        <Avatar src={teamLogo} size={200} radius={100} />
        <Title mt="xl">{teamName}</Title>
        <Text size="xl" mt="sm">
          You are already a member of {teamName}
        </Text>
        <Button
          mt="xl"
          fullWidth
          maw={300}
          size="lg"
          onClick={() => router.push(`/t/${teamId}/dashboard`)}
        >
          Continue to team dashboard
        </Button>
      </Flex>
    </Container>
  );
};

export default AlreadyMember;
