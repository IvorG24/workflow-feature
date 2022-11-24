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

const tempData = [
  {
    id: 1,
    name: "Kenneth Campbell",
    position: "Hr Administrator",
    rate: 3,
    date: "10/23/22",
    comment:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia, molestiae quas vel sint commodi repudiandae consequuntur voluptatum laborum numquam blanditiis harum quisquam eius sed odit fugiat iusto fuga praesentium optio, eaque rerum! Provident similique accusantium nemo autem. Veritatis obcaecati tenetur iure eius earum ut molesti",
  },
  {
    id: 2,
    name: "Kenneth Campbell",
    position: "Hr Administrator",
    rate: 3,
    date: "9/23/22",
    comment:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia, molestiae quas vel sint commodi repudiandae consequuntur voluptatum laborum numquam blanditiis harum quisquam eius sed odit fugiat iusto fuga praesentium optio, eaque rerum! Provident similique accusantium nemo autem. Veritatis obcaecati tenetur iure eius earum ut molesti",
  },
];

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

const Reviews = () => {
  return (
    <Stack spacing={40}>
      {tempData.map(({ id, name, position, rate, date, comment }, index) => (
        <>
          {index !== 0 ? <Divider /> : null}
          <Stack key={id}>
            <Group>
              <Avatar radius={100} size={50} />
              <Stack spacing={0}>
                <Title order={4} mb={0}>
                  {name}
                </Title>
                <Text mt={0}>{position}</Text>
              </Stack>
            </Group>
            <Group>
              <Rating defaultValue={rate} readOnly />
              <Text>{setTimeDifference(new Date(date))}</Text>
            </Group>
            <Text>{comment}</Text>
          </Stack>
        </>
      ))}
    </Stack>
  );
};

export default Reviews;
