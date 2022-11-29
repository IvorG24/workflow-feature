import { AddCircle, Edit, Mail } from "@/components/Icon";
import PeerReviewForm from "@/components/PeerReviewForm/PeerReviewForm";
import {
  Avatar,
  Button,
  Flex,
  Group,
  Modal,
  Stack,
  Tabs,
  Text,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useRouter } from "next/router";
import { useState } from "react";
import { MEMBERS } from "../../../tempData";
import Assesment from "./Assessment/Assessment";
import Bio from "./Bio/Bio";
import EditProfileForm from "./EditProfileForm/EditProfileForm";
import Notes from "./Notes/Notes";
import styles from "./Profile.module.scss";
import Reviews from "./Reviews/Reviews";

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
  const router = useRouter();
  const user = MEMBERS.find((member) => {
    return member.id === router.query.id;
  }) as User;
  const isMobile = useMediaQuery("(max-width: 576px)");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

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
      <Modal
        opened={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        size="auto"
        fullScreen={isMobile}
      >
        {user && (
          <EditProfileForm
            user={user}
            setIsEditProfileOpen={setIsEditProfileOpen}
          />
        )}
      </Modal>
      <div className={styles.banner} />
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
