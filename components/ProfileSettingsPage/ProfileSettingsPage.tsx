import CurrentUserProfileContext from "@/contexts/CurrentUserProfileContext";
import FileUrlListContext from "@/contexts/FileUrlListContext";
import { Database } from "@/utils/database.types-new";
import { getFileUrl } from "@/utils/file";
import { updateUserPassword } from "@/utils/queries-new";
import {
  Avatar,
  Button,
  Container,
  Divider,
  Group,
  Image,
  LoadingOverlay,
  Modal,
  PasswordInput,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Edit, Mail } from "../Icon";
import IconWrapper from "../IconWrapper/IconWrapper";
import AddSignature from "./AddSignature";
import EditProfileForm from "./EditProfileForm";

type ChangePasswordData = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const ProfileSettingsPage = () => {
  const [openedSignature, setOpenedSignature] = useState(false);
  const supabaseClient = useSupabaseClient<Database>();
  const user = useUser();
  const userProfile = useContext(CurrentUserProfileContext);
  const currentSignatureFilePath = userProfile?.user_signature_filepath;
  const [currentSignatureUrl, setCurrentSignatureUrl] = useState("");
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { avatarUrlList } = useContext(FileUrlListContext);
  const noFirstAndLastName =
    !userProfile?.user_first_name && !userProfile?.user_last_name;

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ChangePasswordData>();

  useEffect(() => {
    (async () => {
      if (!currentSignatureFilePath) return;
      const url = await getFileUrl(
        supabaseClient,
        currentSignatureFilePath,
        "signatures"
      );
      setCurrentSignatureUrl(url);
    })();
  }, [supabaseClient, currentSignatureFilePath]);

  useEffect(() => {
    if (userProfile !== null) {
      return setIsLoading(false);
    }
  }, [userProfile]);

  const onDeleteAccount = () => {
    console.log("delete account");
  };
  const onSubmit = handleSubmit(async (data) => {
    try {
      if (!user?.id) throw new Error();

      await updateUserPassword(
        supabaseClient,
        user.id,
        data.oldPassword,
        data.newPassword
      );
      showNotification({
        title: "Success!",
        message: "Your password has been updated.",
        color: "green",
      });
    } catch (error) {
      console.error(error);
      showNotification({
        title: "Error!",
        message: `${(error as Error).message}`,
        color: "red",
      });
    }
  });
  return (
    <Container fluid m={0} p={0}>
      <LoadingOverlay visible={isLoading} overlayBlur={2} />
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
            setIsEditProfileOpen={setIsEditProfileOpen}
            avatarUrlList={avatarUrlList}
          />
        )}
      </Modal>
      <Group px={30}>
        <Avatar
          size={200}
          radius={100}
          src={avatarUrlList[userProfile?.user_id as string]}
        />
        <Stack spacing={0}>
          {!noFirstAndLastName && (
            <Title
              order={2}
            >{`${userProfile?.user_first_name} ${userProfile?.user_last_name}`}</Title>
          )}
          {noFirstAndLastName && <Title order={2}>No name</Title>}

          <Text>{userProfile?.username}</Text>
          <Group align="center" mt="xs" spacing={4}>
            <IconWrapper fontSize={20} color="dimmed">
              <Mail />
            </IconWrapper>
            <Text>{userProfile?.user_email}</Text>
            <Text color="dimmed">&nbsp;</Text>
          </Group>
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
        </Stack>
      </Group>
      <Title order={3} mt="xl">
        Set your signature
      </Title>
      <Text>
        This signature will be auto-attached on every approval you make.
      </Text>
      {currentSignatureUrl && (
        <div style={{ width: 240 }}>
          <Image radius="md" src={currentSignatureUrl} alt="Signature" />
        </div>
      )}

      <Modal opened={openedSignature} onClose={() => setOpenedSignature(false)}>
        <AddSignature
          onCancel={() => setOpenedSignature(false)}
          setCurrentSignatureUrl={setCurrentSignatureUrl}
        />
      </Modal>
      <Button onClick={() => setOpenedSignature(true)} mt="lg">
        Add Signature
      </Button>
      <Divider color="gray.2" mt="xl" />
      <Title order={3} mt="xl">
        Change Password
      </Title>
      <Container fluid size="sm" maw={400} m={0} p={0} mt="lg">
        <form onSubmit={onSubmit}>
          <PasswordInput
            label="Old Password"
            {...register("oldPassword", {
              required: "Old password is required",
            })}
            error={errors.oldPassword?.message}
          />
          <PasswordInput
            label="New Password"
            {...register("newPassword", {
              required: "New password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
              validate: (value) =>
                getValues("oldPassword") !== value ||
                "New password must be different",
            })}
            error={errors.newPassword?.message}
            mt="sm"
          />
          <PasswordInput
            label="Confirm  Password"
            {...register("confirmPassword", {
              required: "Confirm password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
              validate: (value) =>
                getValues("newPassword") === value || "Passwords do not match",
            })}
            error={errors.confirmPassword?.message}
            mt="sm"
          />
          <Button type="submit" mt="xl">
            Update Password
          </Button>
        </form>
      </Container>
      <Divider color="gray.2" mt="xl" />
      <Title order={3} mt="xl">
        Delete Account
      </Title>
      <Text>
        Once you delete your account, there&apos;s no going back. Make sure you
        want to do this.
      </Text>
      <Button onClick={onDeleteAccount} mt="lg" variant="outline" color="red">
        Delete Your Account
      </Button>
    </Container>
  );
};

export default ProfileSettingsPage;
