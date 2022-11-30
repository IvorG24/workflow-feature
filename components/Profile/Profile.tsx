// todo: create unit test
// todo: fix mobile view
import EmployeeReviewForm from "@/components/EmployeeReviewForm/EmployeeReviewForm";
import { AddCircle, Edit, Mail } from "@/components/Icon";
import PeerReviewForm from "@/components/PeerReviewForm/PeerReviewForm";
import {
  Avatar,
  BackgroundImage,
  Button,
  Container,
  Flex,
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
import data from "../../teams.json";
import AssessmentPage from "../AssessmentPage/AssessmentPage";
import Bio from "./Bio";
import EditProfileForm from "./EditProfileForm";
import Notes from "./NoteList";
import styles from "./Profile.module.scss";
import Reviews from "./ReviewList";

const Profile = () => {
  const { colorScheme } = useMantineColorScheme();
  const router = useRouter();
  const { profileId, activeTab } = router.query;
  // todo: fetch user profile

  const profile = data[0].members.find((member) => member.id === profileId);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  return (
    <Container fluid pt="xl">
      {/* todo: add default styling when no background image is available */}
      <BackgroundImage className={styles.banner} src="" />
      <Flex align="flex-start" justify="space-between" wrap="wrap">
        <Group px={30} mt={-30}>
          <Avatar size={200} radius={100} />
          <Stack spacing={0}>
            <Title order={2}>{profile?.name}</Title>
            <Text>{profile?.position}</Text>
            <Flex align="center" mt="xs">
              <Mail />
              <Text>&nbsp;{profile?.email}</Text>
            </Flex>
          </Stack>
        </Group>
        <Button
          variant="outline"
          size="xs"
          onClick={() => setIsEditProfileOpen(true)}
          leftIcon={<Edit />}
          color="gray"
          mt="md"
          mr="md"
        >
          Edit Profile
        </Button>
      </Flex>

      <Tabs
        value={router.query.activeTab as string}
        onTabChange={(value) => router.push(`/profiles/${profileId}/${value}`)}
        mt={30}
      >
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
              &nbsp;Add{activeTab === "reviews" && " a Review"}
              {activeTab === "assessment" && " an Assessment"}
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
          <AssessmentPage user={profile} />
        </Tabs.Panel>

        <Tabs.Panel value="notes" pt="xl">
          <Notes />
        </Tabs.Panel>
      </Tabs>
      <Modal
        opened={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        withCloseButton
        size="lg"
      >
        {activeTab === "reviews" && (
          <PeerReviewForm user={`${profile?.name}`} />
        )}
        {activeTab === "assessment" && (
          <EmployeeReviewForm user={`${profile?.name}`} />
        )}
      </Modal>
      <Modal
        opened={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        size="lg"
      >
        {profile && (
          <EditProfileForm
            user={profile}
            onCancel={() => setIsEditProfileOpen(false)}
          />
        )}
      </Modal>
    </Container>
  );
};

export default Profile;
