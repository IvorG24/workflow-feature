import { Avatar, Button, Container, Flex, Text, Title } from "@mantine/core";

type Props = {
  teamName: string;
  teamLogo: string;
};

const SuccessInvitation = ({ teamName, teamLogo }: Props) => {
  return (
    <Container fluid p="xl" mt="xl">
      <Flex direction="column" justify="center" align="center" mt="xl">
        <Avatar src={teamLogo} size={200} radius={100} />
        <Title mt="xl">{teamName}</Title>
        <Text mt="sm"> Successfully joined {teamName} </Text>
        <Button mt="xl" fullWidth maw={300}>
          Continue
        </Button>
      </Flex>
    </Container>
  );
};

export default SuccessInvitation;
