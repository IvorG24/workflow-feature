import {
  Avatar,
  Button,
  Container,
  Divider,
  Group,
  Paper,
  Rating,
  Slider,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { useState } from "react";
import { useForm } from "react-hook-form";
import styles from "./PeerReviewForm.module.scss";

type Props = {
  user: string;
};

const PeerReviewForm = ({ user }: Props) => {
  const [responsibilityScore, setResponsibilityScore] = useState(0);
  const [learnabilityScore, setLearnabilityScore] = useState(0);
  const [creativityScore, setCreativityScore] = useState(0);
  const [punctualityScore, setPunctualityScore] = useState(0);
  const [meetsDeadlinesScore, setMeetsDeadlinesScore] = useState(0);
  const [communicationScore, setCommunicationScore] = useState(0);
  const [rating, setRating] = useState(0);

  const { register, handleSubmit } = useForm();

  const onSubmit = handleSubmit((data) => {
    // values you need
    console.log(responsibilityScore);
    console.log(learnabilityScore);
    console.log(creativityScore);
    console.log(punctualityScore);
    console.log(meetsDeadlinesScore);
    console.log(communicationScore);
    console.log(rating);
    const { additionalComments } = data;
    console.log(additionalComments);
  });

  return (
    <Container size="xs">
      <Paper shadow="xs" p="xl">
        <form onSubmit={onSubmit}>
          <Title order={2}>Peer Review</Title>
          <Group mt="sm">
            <Text weight={500}>Employee: </Text>
            <Avatar radius={100} />
            <Text>{user}</Text>
          </Group>
          <Divider mt="xs" />
          <Title order={3} mt="xl">
            Job Performance
          </Title>

          <Text mt="md" weight={500}>
            Takes Responsibility
          </Text>
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

          <Text mt={40} weight={500}>
            Has the ability to learn and use new skills
          </Text>
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

          <Text mt={40} weight={500}>
            Generate creative ideas and solutions
          </Text>
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

          <Text mt={40} weight={500}>
            Meets attendance requirements
          </Text>
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

          <Text mt={40} weight={500}>
            Set and meet deadlines
          </Text>
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

          <Text mt={40} weight={500}>
            Effectively communicate with others
          </Text>
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

          <Title order={3} mt="xl">
            How would you rate the quality of you co-worker&apos;s performance?
          </Title>
          <Group mt="xs">
            <Rating
              defaultValue={rating}
              onChange={(value) => setRating(value)}
              size="xl"
              className={styles.rating}
            />
          </Group>

          <Title order={3} mt="xl">
            Additional Comments
          </Title>
          <Textarea mt="xs" {...register("additionalComments")} />
          <Button mt="xl" type="submit">
            Submit
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default PeerReviewForm;
