import {
  Avatar,
  Container,
  Divider,
  Group,
  Rating,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { Fragment } from "react";
import { ReviewType } from "./ProfilePage";
import { setTimeDifference } from "./utils";

type Props = {
  reviews: ReviewType[];
};

const Reviews = ({ reviews }: Props) => {
  return (
    <Container fluid p={0}>
      {reviews?.map((review, index) => (
        <Fragment key={review?.id}>
          {index !== 0 ? <Divider my="md" /> : null}
          <Review review={review} />
        </Fragment>
      ))}
    </Container>
  );
};

export default Reviews;

type ReviewProps = {
  review: ReviewType;
};

function Review({ review }: ReviewProps) {
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
}
