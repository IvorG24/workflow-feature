import { AddCircle, Calendar } from "@/components/Icon";
import PeerReviewForm from "@/components/PeerReviewForm/PeerReviewForm";
import {
  Avatar,
  Button,
  Group,
  Modal,
  Stack,
  Tabs,
  Text,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { useRouter } from "next/router";
import { useState } from "react";
import { MEMBERS } from "../../tempData";
import Assesment from "./Assessment";
import Bio from "./Bio";
import Notes from "./NoteList";
import styles from "./Profile.module.scss";
import Reviews from "./ReviewList";

const Profile = () => {
  const { colorScheme } = useMantineColorScheme();
  const router = useRouter();
  const user = MEMBERS.find((member) => {
    return member.id === router.query.id;
  });

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  return (
    <div className={styles.container}>
      <Modal
        opened={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        withCloseButton
        size="auto"
      >
        <PeerReviewForm user={`${user?.name}`} />
      </Modal>
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
              onClick={() => setIsReviewModalOpen((prev) => !prev)}
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
