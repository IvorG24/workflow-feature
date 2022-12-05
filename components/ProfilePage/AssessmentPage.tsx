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
import { Assessment } from "./ProfilePage";
import { setTimeDifference } from "./utils";

type Props = {
  assessments: Assessment[];
};

const AssessmentPage = ({ assessments }: Props) => {
  return (
    <Container fluid p={0}>
      {assessments.map((assessment, index) => (
        <Assessment key={index} assessment={assessment} index={index} />
      ))}
      <Center pt="lg">
        <Button>Show More Reviews</Button>
      </Center>
    </Container>
  );
};

export default AssessmentPage;

type AssessmentProps = {
  assessment: Assessment;
  index: number;
};

function Assessment({ assessment, index }: AssessmentProps) {
  return (
    <Container key={assessment?.id} fluid py="sm" p={0}>
      {index !== 0 && <Divider mb="lg" />}
      <Group mb="sm">
        <Avatar size={50} radius={25} />
        <Flex direction="column">
          <Group spacing="xs">
            <Text
              weight="bold"
              size="md"
              sx={(theme) => ({
                color:
                  theme.colorScheme === "dark"
                    ? theme.colors.dark[6]
                    : theme.colors.gray[9],
              })}
            >
              {assessment?.review_from.name}
            </Text>
            <Text c="dimmed">
              &#x2022;&nbsp;{" "}
              {setTimeDifference(new Date(`${assessment?.created_at}`))}
            </Text>
          </Group>
          <Text>{assessment.review_from.position}</Text>
        </Flex>
      </Group>
      <Text>{assessment.comment}</Text>
    </Container>
  );
}
