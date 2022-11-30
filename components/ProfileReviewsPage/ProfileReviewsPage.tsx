import { Container, Divider } from "@mantine/core";

import { useRouter } from "next/router";
import { Fragment } from "react";
import data from "../../teams.json";
import Review from "./Review";

const Reviews = () => {
  const router = useRouter();
  const { profileId } = router.query;
  const profile = data[0].members.find((member) => member.id === profileId);

  return (
    <Container fluid p={0}>
      {profile?.reviews &&
        profile?.reviews.map((review, index) => (
          <Fragment key={review?.id}>
            {index !== 0 ? <Divider my="md" /> : null}
            <Review review={review} />
          </Fragment>
        ))}
    </Container>
  );
};

export default Reviews;
