import { Container, Divider } from "@mantine/core";
import { Fragment } from "react";
import { ReviewType } from "./ProfilePage";
import Review from "./Review";

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
