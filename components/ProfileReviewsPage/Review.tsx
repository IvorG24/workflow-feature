import {
  Avatar,
  Container,
  Group,
  Rating,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import moment from "moment";

type User = {
  id: string;
  name: string;
  email: string;
  position: string;
  avatar_url: string;
  bg_url: string;
};

type Review = {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  review_from: User;
};

type Props = {
  review: Review;
};

const setTimeDifference = (date: Date) => {
  const minutes = Math.floor(
    moment.duration(moment(new Date()).diff(date)).asMinutes()
  );
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(
    moment.duration(moment(new Date()).diff(date)).asHours()
  );
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(
    moment.duration(moment(new Date()).diff(date)).asDays()
  );
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;

  const months = Math.floor(
    moment.duration(moment(new Date()).diff(date)).asMonths()
  );
  return `${months} month${months === 1 ? "" : "s"} ago`;
};

const Review = ({ review }: Props) => {
  return (
    <Container fluid p={0}>
      <Group>
        <Avatar radius={100} size={50} />
        <Stack spacing={0}>
          <Title order={4} mb={0}>
            {review?.review_from?.name}
          </Title>
          <Text mt={0}>{review?.review_from?.position}</Text>
        </Stack>
      </Group>
      <Group mt="xs">
        <Rating defaultValue={Number(review.rating)} readOnly />
        <Text>{setTimeDifference(new Date(`${review?.created_at}`))}</Text>
      </Group>
      <Text mt="xs">{review.comment}</Text>
    </Container>
  );
};

export default Review;
