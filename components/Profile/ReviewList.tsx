import {
  Avatar,
  Divider,
  Group,
  Rating,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import moment from "moment";
import { useRouter } from "next/router";
import React from "react";
import { MEMBERS, REVIEWS } from "../../tempData";

const Reviews = () => {
  const router = useRouter();

  const reviews = REVIEWS.map((review) => {
    if (review.review_to === router.query.id) {
      const reviewer = MEMBERS.find((member) => {
        return member.id === review.review_from;
      });
      return { ...review, review_from: reviewer };
    }
  }).filter((review) => review);

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

  return (
    <Stack spacing={40}>
      {reviews &&
        reviews.map((review, index) => (
          <React.Fragment key={review?.id}>
            {index !== 0 ? <Divider /> : null}
            <Stack>
              <Group>
                <Avatar radius={100} size={50} />
                <Stack spacing={0}>
                  <Title order={4} mb={0}>
                    {review?.review_from?.name}
                  </Title>
                  <Text mt={0}>{review?.review_from?.position}</Text>
                </Stack>
              </Group>
              <Group>
                <Rating defaultValue={Number(review?.answers[6])} readOnly />
                <Text>
                  {setTimeDifference(new Date(`${review?.created_at}`))}
                </Text>
              </Group>
              <Text>{review?.answers[7]}</Text>
            </Stack>
          </React.Fragment>
        ))}
    </Stack>
  );
};

export default Reviews;
