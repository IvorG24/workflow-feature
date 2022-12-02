import {
  Avatar,
  Button,
  Container,
  Divider,
  Flex,
  Group,
  Slider,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { useState } from "react";
import { useForm } from "react-hook-form";
import styles from "./EmployeeReviewForm.module.scss";
import { CreateAssessment, User } from "./ProfilePage";

type Props = {
  user?: User;
  onCreate: (data: CreateAssessment) => void;
};

const EmployeeReviewForm = ({ user, onCreate }: Props) => {
  const [responsibilityScore, setResponsibilityScore] = useState(0);
  const [learnabilityScore, setLearnabilityScore] = useState(0);
  const [creativityScore, setCreativityScore] = useState(0);
  const [punctualityScore, setPunctualityScore] = useState(0);
  const [meetsDeadlinesScore, setMeetsDeadlinesScore] = useState(0);
  const [communicationScore, setCommunicationScore] = useState(0);

  const { register, handleSubmit } = useForm();

  const onSubmit = handleSubmit((data) => {
    // values you need
    console.log(responsibilityScore);
    console.log(learnabilityScore);
    console.log(creativityScore);
    console.log(punctualityScore);
    console.log(meetsDeadlinesScore);
    console.log(communicationScore);
    const { additionalComments } = data;
    console.log(additionalComments);

    onCreate({
      created_at: new Date().toISOString(),
      review_from: {
        id: "c40605b7-321e-40bb-ac51-4ca315cfaf9c",
        name: "Alberto Linao",
        email: "albertolinao@gmail.com",
        position: "IT Manager",
        role: "manager",
        avatar_url: "",
        bg_url: "",
      },
      comment: additionalComments,
    });
  });

  return (
    <Container pb="lg">
      <form onSubmit={onSubmit}>
        <Title order={1} weight={600}>
          Assessment Review
        </Title>
        <Group mt="xl">
          <Text weight={500}>Employee: </Text>
          <Avatar radius={100} />
          <Text>{user?.name}</Text>
        </Group>
        <Divider mt="xs" />
        <Title order={4} mt="xl" weight={600}>
          Job Performance
        </Title>

        <Stack spacing="xl" mt="lg">
          <Group spacing="xl">
            <Text weight={500} className={styles.sliderLabel}>
              Takes Responsibility
            </Text>
            <Container className={styles.sliderContainer} p={0}>
              <Slider
                mt="xs"
                step={25}
                value={responsibilityScore}
                onChange={(value) => setResponsibilityScore(value)}
                marks={[
                  { value: 0, label: "1" },
                  { value: 25, label: "2" },
                  { value: 50, label: "3" },
                  { value: 75, label: "4" },
                  { value: 100, label: "5" },
                ]}
              />
            </Container>
          </Group>

          <Group spacing="xl">
            <Text weight={500} className={styles.sliderLabel}>
              Has the ability to learn and use new skills
            </Text>
            <Container p={0} className={styles.sliderContainer}>
              <Slider
                value={learnabilityScore}
                onChange={(value) => setLearnabilityScore(value)}
                mt="xs"
                step={25}
                marks={[
                  { value: 0, label: "1" },
                  { value: 25, label: "2" },
                  { value: 50, label: "3" },
                  { value: 75, label: "4" },
                  { value: 100, label: "5" },
                ]}
              />
            </Container>
          </Group>

          <Group spacing="xl">
            <Text weight={500} className={styles.sliderLabel}>
              Generate creative ideas and solutions
            </Text>
            <Container p={0} className={styles.sliderContainer}>
              <Slider
                value={creativityScore}
                onChange={(value) => setCreativityScore(value)}
                mt="xs"
                step={25}
                pb="xl"
                marks={[
                  { value: 0, label: "1" },
                  { value: 25, label: "2" },
                  { value: 50, label: "3" },
                  { value: 75, label: "4" },
                  { value: 100, label: "5" },
                ]}
              />
            </Container>
          </Group>

          <Group spacing="xl">
            <Text weight={500} className={styles.sliderLabel}>
              Meets attendance requirements
            </Text>
            <Container className={styles.sliderContainer} p={0}>
              <Slider
                value={punctualityScore}
                onChange={(value) => setPunctualityScore(value)}
                mt="xs"
                pb="xl"
                step={25}
                marks={[
                  { value: 0, label: "1" },
                  { value: 25, label: "2" },
                  { value: 50, label: "3" },
                  { value: 75, label: "4" },
                  { value: 100, label: "5" },
                ]}
              />
            </Container>
          </Group>

          <Group spacing="xl">
            <Text weight={500} className={styles.sliderLabel}>
              Set and meet deadlines
            </Text>
            <Container className={styles.sliderContainer} p={0}>
              <Slider
                value={meetsDeadlinesScore}
                onChange={(value) => setMeetsDeadlinesScore(value)}
                mt="xs"
                pb="xl"
                step={25}
                marks={[
                  { value: 0, label: "1" },
                  { value: 25, label: "2" },
                  { value: 50, label: "3" },
                  { value: 75, label: "4" },
                  { value: 100, label: "5" },
                ]}
              />
            </Container>
          </Group>

          <Group spacing="xl">
            <Text weight={500} className={styles.sliderLabel}>
              Effectively communicate with others
            </Text>
            <Container className={styles.sliderContainer} p={0}>
              <Slider
                value={communicationScore}
                onChange={(value) => setCommunicationScore(value)}
                mt="xs"
                pb="xl"
                step={25}
                marks={[
                  { value: 0, label: "1" },
                  { value: 25, label: "2" },
                  { value: 50, label: "3" },
                  { value: 75, label: "4" },
                  { value: 100, label: "5" },
                ]}
              />
            </Container>
          </Group>
        </Stack>
        <Stack mt="lg">
          <TextInput
            label="What are the employee’s strongest points?"
            {...register("question1")}
          />
          <TextInput
            label="What are the employee’s weakest points?"
            {...register("question2")}
          />
          <TextInput
            label="What can the employee do to be more effective  or make improvements?"
            {...register("question3")}
          />
          <TextInput
            label="What additional training would benefit the employee?"
            {...register("question4")}
          />

          <Title order={4} weight={600}>
            Additional Comments
            <Textarea {...register("additionalComments")} />
          </Title>
        </Stack>

        <Flex justify="flex-end">
          <Button mt="xl" type="submit">
            Submit Review
          </Button>
        </Flex>
      </form>
    </Container>
  );
};

export default EmployeeReviewForm;
