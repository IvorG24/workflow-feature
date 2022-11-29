// todo: create unit test
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
import { MEMBERS } from "../../tempData";
import Assesment from "./Assessment";
import Bio from "./Bio";
import EditProfileForm from "./EditProfileForm";
import Notes from "./NoteList";
import styles from "./Profile.module.scss";
import Reviews from "./ReviewList";

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  position: string;
  status: string;
  hired_date: string;
  image: string;
};

const Profile = () => {
  const { colorScheme } = useMantineColorScheme();
  const [activeTab, setActiveTab] = useState<string | null>("bio");
  const router = useRouter();
  // todo: fetch user profile
  const user = MEMBERS.find((member) => {
    return member.id === router.query.id;
  }) as User;
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  return (
    <Container fluid pt="xl">
      <Modal
        opened={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        withCloseButton
        size="auto"
      >
        {activeTab === "reviews" && <PeerReviewForm user={`${user?.name}`} />}
        {activeTab === "assessment" && (
          <EmployeeReviewForm user={`${user?.name}`} />
        )}
      </Modal>
      <Modal
        opened={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        size="lg"
      >
        {user && (
          <EditProfileForm
            user={user}
            onCancel={() => setIsEditProfileOpen(false)}
          />
        )}
      </Modal>
      {/* todo: add default styling when no background image is available */}
      <BackgroundImage className={styles.banner} src="" />
      <Flex align="flex-start" justify="space-between" wrap="wrap">
        <Group px={30} mt={-30}>
          <Avatar size={200} radius={100} />
          <Stack spacing={0}>
            <Title order={2}>{user?.name}</Title>
            <Text>
              {user?.position} - {user?.status}
            </Text>
            <Flex align="center">
              <Mail />
              <Text>&nbsp;{user?.email}</Text>
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

      <Tabs value={activeTab} onTabChange={setActiveTab} mt={30}>
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
            {activeTab === "reviews" && (
              <Button
                variant="outline"
                className={styles.addReviewButton}
                onClick={() => setIsReviewModalOpen((prev) => !prev)}
              >
                <AddCircle />
                &nbsp;Add a Review
              </Button>
            )}
            {activeTab === "assessment" && (
              <Button
                variant="outline"
                className={styles.addReviewButton}
                onClick={() => setIsReviewModalOpen((prev) => !prev)}
              >
                <AddCircle />
                &nbsp;Add an Assessment
              </Button>
            )}
          </div>
        </Group>

        <Tabs.Panel value="bio" pt="xl">
          <Bio />
        </Tabs.Panel>

        <Tabs.Panel value="reviews" pt="xl">
          <Reviews />
        </Tabs.Panel>

        <Tabs.Panel value="assessment" pt="xl">
          <Assesment user={user} />
        </Tabs.Panel>

        <Tabs.Panel value="notes" pt="xl">
          <Notes />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
};

export default Profile;
