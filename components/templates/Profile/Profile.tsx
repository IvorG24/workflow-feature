import { AddCircle, Calendar } from "@/components/Icon";
import {
  Avatar,
  Button,
  Group,
  Stack,
  Tabs,
  Text,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { useRouter } from "next/router";
import { MEMBERS } from "../../../tempData";
import Assesment from "./Assessment/Assessment";
import Bio from "./Bio/Bio";
import Notes from "./Notes/Notes";
import styles from "./Profile.module.scss";
import Reviews from "./Reviews/Reviews";

const Profile = () => {
  const { colorScheme } = useMantineColorScheme();
  const router = useRouter();
  const user = MEMBERS.find((member) => {
    return member.id === router.query.id;
  });

  return (
    <div className={styles.container}>
      <div className={styles.banner} />
      <Group px={30} mt={-30}>
        <Avatar size={200} radius={100} />
        <Stack spacing={0}>
          <Title order={2}>{user?.name}</Title>
          <Text>
            {user?.position} - {user?.status}
          </Text>
          <Group mt={10}>
            <Calendar />
            <Text>Hired {user?.hired_date}</Text>
          </Group>
        </Stack>
      </Group>

      <Tabs defaultValue="bio" mt={30}>
        <Group>
          <Tabs.List className={styles.tabContainer}>
            <Tabs.Tab value="bio">Bio</Tabs.Tab>
            <Tabs.Tab value="reviews">Reviews</Tabs.Tab>
            <Tabs.Tab value="assessment">Assessment</Tabs.Tab>
            <Tabs.Tab value="notes">Notes</Tabs.Tab>
          </Tabs.List>
          <div
            className={styles.addReviewButtonContainer}
            style={{
              borderColor: colorScheme === "light" ? "#dee2e6" : "#373A40",
            }}
          >
            <Button
              variant="outline"
              className={styles.addReviewButton}
              onClick={() =>
                router.push(
                  `/reviews/create?t=${1}&ft=${1}&reviewee=${router.query.id}`
                )
              }
            >
              <AddCircle />
              &nbsp;Add a Review
            </Button>
          </div>
        </Group>

        <Tabs.Panel value="bio" pt="xl">
          <Bio />
        </Tabs.Panel>

        <Tabs.Panel value="reviews" pt="xl">
          <Reviews />
        </Tabs.Panel>

        <Tabs.Panel value="assessment" pt="xl">
          <Assesment />
        </Tabs.Panel>

        <Tabs.Panel value="notes" pt="xl">
          <Notes />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};

export default Profile;
