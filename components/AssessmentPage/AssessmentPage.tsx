import {
  Avatar,
  Button,
  Center,
  Container,
  Divider,
  Flex,
  Group,
  Text,
} from "@mantine/core";
import { ASSESSMENTS, MEMBERS } from "tempData";
import { User } from "../Profile/Profile";

type Props = {
  user?: User;
};

const AssessmentPage = ({ user }: Props) => {
  const assessments = ASSESSMENTS.map((assessment) => {
    const reviewed = MEMBERS.find(
      (member) => member.id === assessment.review_to
    );
    if (assessment.review_from === user?.id) {
      return {
        ...assessment,
        assessment_id: assessment?.id,
        ...reviewed,
        user_id: reviewed?.id,
      };
    }
  });

  console.log(assessments);
  return (
    <Container fluid p={0}>
      {assessments.map((assessment, index) => (
        <Container key={assessment?.assessment_id} fluid py="sm" p={0}>
          {index !== 0 && <Divider mb="lg" />}
          <Group mb="sm">
            <Avatar size={50} radius={25} />
            <Flex direction="column">
              <Group spacing="xs">
                <Text weight="bold">{assessment?.name}</Text>
                <Text c="dimmed">&#x2022;&nbsp; {assessment?.hired_date}</Text>
              </Group>
              <Text c="dimmed">{assessment?.position}</Text>
            </Flex>
          </Group>
          <Text>{assessment?.answers.slice(-1)[0]}</Text>
        </Container>
      ))}
      <Center pt="lg">
        <Button>Show More Reviews</Button>
      </Center>
    </Container>
  );
};

export default AssessmentPage;
