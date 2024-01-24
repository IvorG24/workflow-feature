import { approveOrRejectValidId } from "@/backend/api/update";
import { Database } from "@/utils/database";
import { toTitleCase } from "@/utils/string";
import { UserValidIdWithUser } from "@/utils/types";
import {
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Image,
  LoadingOverlay,
  Modal,
  Overlay,
  Paper,
  Text,
  Title,
} from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { IconArrowsMaximize } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useState } from "react";

type Props = {
  userValidId: UserValidIdWithUser;
  approverId: string;
};
const UserValidIDVerificationPage = ({ userValidId, approverId }: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const router = useRouter();

  const { hovered: frontIDHovered, ref: frontIDRef } = useHover();
  const { hovered: backIDHovered, ref: backIDRef } = useHover();

  const user = userValidId.user_valid_id_user;
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageMaximize, setImageMaximize] = useState<string | null>(null);

  const handleUpdateStatus = async (status: "APPROVED" | "REJECTED") => {
    try {
      setIsUpdatingStatus(true);

      await approveOrRejectValidId(supabaseClient, {
        validIdId: userValidId.user_valid_id_id,
        approverUserId: approverId,
        status,
      });

      notifications.show({
        message: `Valid ID ${toTitleCase(status)}.`,
        color: "green",
      });
      router.back();
    } catch {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleMaximizeIDImage = (image: string) => {
    setIsModalOpen(true);
    setImageMaximize(image);
  };

  return (
    <Container>
      <Title order={2}>Valid ID Verification</Title>
      <Paper shadow="md" p="md" mt="sm">
        <Flex
          gap="md"
          justify="space-evenly"
          direction={{ base: "column", xs: "row" }}
        >
          <Flex direction="column" gap="md">
            <Paper withBorder ref={frontIDRef} pos="relative">
              <Image
                radius="md"
                src={userValidId.user_valid_id_front_image_url}
                alt="ID Front Image"
              />
              {frontIDHovered && (
                <Overlay color="black" opacity={0.2} center zIndex={20}>
                  <Button
                    onClick={() =>
                      handleMaximizeIDImage(
                        userValidId.user_valid_id_front_image_url
                      )
                    }
                    color="blue"
                  >
                    <IconArrowsMaximize />
                  </Button>
                </Overlay>
              )}
            </Paper>
            {userValidId.user_valid_id_back_image_url && (
              <Paper withBorder ref={backIDRef} pos="relative">
                <Image
                  radius="md"
                  src={userValidId.user_valid_id_back_image_url}
                  alt="ID back Image"
                />
                {backIDHovered && (
                  <Overlay color="black" opacity={0.2} center zIndex={20}>
                    <Button
                      onClick={() =>
                        handleMaximizeIDImage(
                          `${userValidId.user_valid_id_back_image_url}`
                        )
                      }
                      color="blue"
                    >
                      <IconArrowsMaximize />
                    </Button>
                  </Overlay>
                )}
              </Paper>
            )}
          </Flex>

          <Box>
            <Flex gap="md">
              <Avatar src={user.user_avatar} radius={90} size={90}>
                {user.user_first_name[0].toUpperCase()}
                {user.user_last_name[0].toUpperCase()}
              </Avatar>
              <Flex direction="column">
                <Text size="lg" fw="bold">
                  {user.user_first_name} {user.user_last_name}
                </Text>
                <Text>{user.user_email}</Text>
                <Text color="dimmed">{user.user_username}</Text>
              </Flex>
            </Flex>

            <Divider my="md" />

            <Text size="lg" fw="bold">
              ID Details
            </Text>

            <Text mt="md">
              <Text color="dimmed" span>
                ID Type:&nbsp;
              </Text>
              {userValidId.user_valid_id_type}
            </Text>
            <Text mt="md">
              <Text color="dimmed" span>
                ID Number:&nbsp;
              </Text>
              {userValidId.user_valid_id_number}
            </Text>
            <Text mt="md">
              <Text color="dimmed" span>
                First Name:&nbsp;
              </Text>
              {userValidId.user_valid_id_first_name}
            </Text>
            <Text mt="md">
              <Text color="dimmed" span>
                Middle Name:&nbsp;
              </Text>
              {userValidId.user_valid_id_middle_name}
            </Text>
            <Text mt="md">
              <Text color="dimmed" span>
                Last Name:&nbsp;
              </Text>
              {userValidId.user_valid_id_last_name}
            </Text>
            <Text mt="md">
              <Text color="dimmed" span>
                Gender:&nbsp;
              </Text>
              {userValidId.user_valid_id_gender}
            </Text>
            <Text mt="md">
              <Text color="dimmed" span>
                Nationality:&nbsp;
              </Text>
              {userValidId.user_valid_id_nationality}
            </Text>
            <Text mt="md">
              <Text color="dimmed" span>
                Region:&nbsp;
              </Text>
              {userValidId.user_valid_id_address.address_region}
            </Text>
            <Text mt="md">
              <Text color="dimmed" span>
                Province:&nbsp;
              </Text>
              {userValidId.user_valid_id_address.address_province}
            </Text>
            <Text mt="md">
              <Text color="dimmed" span>
                City:&nbsp;
              </Text>
              {userValidId.user_valid_id_address.address_city}
            </Text>
            <Text mt="md">
              <Text color="dimmed" span>
                Barangay:&nbsp;
              </Text>
              {userValidId.user_valid_id_address.address_barangay}
            </Text>
            <Text mt="md">
              <Text color="dimmed" span>
                Street:&nbsp;
              </Text>
              {userValidId.user_valid_id_address.address_street}
            </Text>
            <Text mt="md">
              <Text color="dimmed" span>
                Zip Code:&nbsp;
              </Text>
              {userValidId.user_valid_id_address.address_zip_code}
            </Text>
          </Box>
        </Flex>
      </Paper>

      <Paper shadow="md" p="md" mt="xl">
        <LoadingOverlay visible={isUpdatingStatus} />
        <Flex direction="column" justify="center" gap="lg">
          <Button onClick={() => handleUpdateStatus("APPROVED")}>
            Approve
          </Button>
          <Button onClick={() => handleUpdateStatus("REJECTED")} color="red">
            Reject
          </Button>
        </Flex>
      </Paper>

      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        fullScreen
      >
        <Image radius="md" src={imageMaximize} alt="ID Image" />
      </Modal>
    </Container>
  );
};

export default UserValidIDVerificationPage;
