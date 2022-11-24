import {
  Avatar,
  Button,
  Container,
  Divider,
  Group,
  Paper,
  Slider,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { Star } from "../Icon";
import styles from "./PeerReviewForm.module.scss";

const PeerReviewForm = () => {
  return (
    <Container size="xs">
      <Paper shadow="xs" p="xl">
        <form>
          <Title order={2}>Peer Review</Title>
          <Group mt="sm">
            <Text weight={500}>Employee: </Text>
            <Avatar radius={100} />
            <Text>Patricia Smith</Text>
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
            <Button variant="subtle" color="yellow">
              <div className={styles.starIcon}>
                <Star />
              </div>
            </Button>
            <Button variant="subtle" color="yellow">
              <div className={styles.starIcon}>
                <Star />
              </div>
            </Button>
            <Button variant="subtle" color="yellow">
              <div className={styles.starIcon}>
                <Star />
              </div>
            </Button>
            <Button variant="subtle" color="yellow">
              <div className={styles.starIcon}>
                <Star />
              </div>
            </Button>
            <Button variant="subtle" color="yellow">
              <div className={styles.starIcon}>
                <Star />
              </div>
            </Button>
          </Group>

          <Title order={3} mt="xl">
            Additional Comments
          </Title>
          <Textarea mt="xs"></Textarea>
          <Button mt="xl">Submit</Button>
        </form>
      </Paper>
    </Container>
  );
};

export default PeerReviewForm;
