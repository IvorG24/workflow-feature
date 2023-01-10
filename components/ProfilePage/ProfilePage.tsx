// todo: create unit test
// todo: fix mobile view
import { AddCircle, Edit, Mail } from "@/components/Icon";
import IconWrapper from "@/components/IconWrapper/IconWrapper";
// import EmployeeReviewForm from "@/components/ProfilePage/EmployeeReviewForm";
// import PeerReviewForm from "@/components/ProfilePage/PeerReviewForm";
import {
  Avatar,
  Box,
  Button,
  Container,
  Flex,
  Group,
  LoadingOverlay,
  Modal,
  Stack,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import { useUser } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";

import { useContext, useEffect, useState } from "react";
import AssessmentPage from "./AssessmentPage";
import Bio from "./BioPage";
import EditProfileForm from "./EditProfileForm";
// import data from "../../teams.json";
// import EditProfileForm from "./EditProfileForm";
import FileUrlListContext from "@/contexts/FileUrlListContext";
import MemberProfileContext from "@/contexts/MemberProfileContext";
import styles from "./ProfilePage.module.scss";
import ProfileReviewsPage from "./ReviewsPage";

export type User = {
  id: string;
  name: string;
  email: string;
  position: string;
  role: string;
  avatar_url?: string;
  bg_url?: string;
};

export type CreateReview = {
  created_at: string;
  review_from: User;
  rating: number;
  comment: string;
};

export type ReviewType = {
  id: number;
} & CreateReview;

export type CreateAssessment = {
  created_at: string;
  review_from: User;
  comment: string;
};

export type Assessment = {
  id: number;
} & CreateAssessment;

const Profile = () => {
  const router = useRouter();
  const user = useUser();
  const { activeTab } = router.query;
  const [isLoading, setIsLoading] = useState(true);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  // const [reviews, setReviews] = useState<ReviewType[]>([]);
  // const [assessments, setAssessments] = useState<Assessment[]>([]);

  const fileUrlListContext = useContext(FileUrlListContext);

  const userProfile = useContext(MemberProfileContext);

  useEffect(() => {
    if (userProfile !== null) {
      return setIsLoading(false);
    }
  }, [userProfile]);

  // const handleCreateReview = (review: CreateReview) => {
  //   const newReview = {
  //     id: Math.floor(Math.random() * 1000),
  //     ...review,
  //   };
  //   setReviews((prev) => [...prev, newReview]);
  //   setIsReviewModalOpen(false);
  // };

  // const handleCreateAssessment = (assessment: CreateAssessment) => {
  //   const newAssessment = {
  //     id: Math.floor(Math.random() * 1000),
  //     ...assessment,
  //   };
  //   setAssessments((prev) => [...prev, newAssessment]);
  //   setIsReviewModalOpen(false);
  // };

  return (
    <>
      <LoadingOverlay visible={isLoading} overlayBlur={2} />
      {!isLoading && (
        <Container fluid pt="xl">
          {/* todo: add default styling when no background image is available */}
          <Box
            sx={(theme) => ({
              backgroundColor:
                theme.colorScheme === "dark"
                  ? theme.colors.dark[4]
                  : theme.colors.gray[2],
              width: "100%",
              height: "10rem",
            })}
          />
          <Flex align="flex-start" justify="space-between" wrap="wrap">
            <Group px={30} mt={-30}>
              <Avatar
                size={200}
                radius={100}
                src={
                  fileUrlListContext?.avatarUrlList[
                    userProfile?.user_id as string
                  ]
                }
              />
              <Stack spacing={0}>
                <Title
                  order={2}
                >{`${userProfile?.user_first_name} ${userProfile?.user_last_name}`}</Title>
                {/* add position column to user profile */}
                <Text></Text>
                <Group align="center" mt="xs" spacing={4}>
                  <IconWrapper fontSize={20} color="dimmed">
                    <Mail />
                  </IconWrapper>
                  <Text>{userProfile?.user_email}</Text>
                  <Text color="dimmed">&nbsp;</Text>
                </Group>
              </Stack>
            </Group>
            {userProfile?.user_id === user?.id ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditProfileOpen(true)}
                leftIcon={
                  <IconWrapper fontSize={16}>
                    <Edit />
                  </IconWrapper>
                }
                sx={(theme) => ({
                  color:
                    theme.colorScheme === "dark"
                      ? theme.colors.dark[0]
                      : theme.colors.dark[6],
                })}
                color="dark"
                mt="md"
                mr="md"
              >
                Edit Profile
              </Button>
            ) : null}
          </Flex>

          <Tabs
            value={router.query.activeTab as string}
            onTabChange={(value) =>
              router.push(
                `/t/${router.query.tid}/profiles/${userProfile?.user_id}/${value}`
              )
            }
            mt={30}
          >
            <Group>
              <Tabs.List className={styles.tabContainer}>
                <Tabs.Tab value="bio">Bio</Tabs.Tab>
                <Tabs.Tab value="reviews">Reviews</Tabs.Tab>
                <Tabs.Tab value="assessment">Assessment</Tabs.Tab>
                <Button
                  variant="subtle"
                  onClick={() => setIsReviewModalOpen((prev) => !prev)}
                  ml="auto"
                >
                  <IconWrapper fontSize={20}>
                    <AddCircle />
                  </IconWrapper>
                  &nbsp;Add{activeTab === "reviews" && " a Review"}
                  {activeTab === "assessment" && " an Assessment"}
                </Button>
              </Tabs.List>
            </Group>

            <Tabs.Panel value="bio" pt="xl">
              <Bio />
            </Tabs.Panel>

            <Tabs.Panel value="reviews" pt="xl">
              <ProfileReviewsPage reviews={[]} />
            </Tabs.Panel>

            <Tabs.Panel value="assessment" pt="xl">
              <AssessmentPage assessments={[]} />
            </Tabs.Panel>
          </Tabs>
          <Modal
            opened={isReviewModalOpen}
            onClose={() => setIsReviewModalOpen(false)}
            withCloseButton
            size="lg"
          >
            {/* {activeTab === "reviews" && (
          <PeerReviewForm

            user={`${profile?.full_name}`}
            onCreateReview={handleCreateReview}
          />
        )} */}
            {/* {activeTab === "assessment" && (
          <EmployeeReviewForm
            user={profile}
            onCreate={handleCreateAssessment}
          />
        )} */}
          </Modal>
          <Modal
            opened={isEditProfileOpen}
            onClose={() => setIsEditProfileOpen(false)}
            size="lg"
          >
            {userProfile && (
              <EditProfileForm
                user={userProfile}
                onCancel={() => setIsEditProfileOpen(false)}
                setIsLoading={setIsLoading}
              />
            )}
          </Modal>
        </Container>
      )}
    </>
  );
};

export default Profile;
