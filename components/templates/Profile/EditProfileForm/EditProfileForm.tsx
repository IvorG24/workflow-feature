import { PhotoCamera } from "@/components/Icon";
import {
  Avatar,
  BackgroundImage,
  Button,
  Container,
  FileButton,
  Flex,
  Stack,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import validator from "validator";
import { User } from "../Profile";
import styles from "./EditProfileForm.module.scss";

type Props = {
  user: User;
  setIsEditProfileOpen: Dispatch<SetStateAction<boolean>>;
};

const EditProfileForm = ({ user, setIsEditProfileOpen }: Props) => {
  const { register, handleSubmit } = useForm();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bgFile, setBGFile] = useState<File | null>(null);
  const onSubmit = handleSubmit(async (data) => {
    console.log(data);
    console.log(avatarFile);
    console.log(bgFile);
  });

  return (
    <Container className={styles.container}>
      <Title order={1} weight={600} size={25} mb="lg">
        Edit Profile
      </Title>
      <form onSubmit={onSubmit}>
        <Stack>
          <BackgroundImage className={styles.backgroundImage} src="">
            <FileButton onChange={setBGFile} accept="image/png,image/jpeg">
              {(props) => (
                <Button
                  variant="subtle"
                  {...props}
                  className={styles.centerIcon}
                >
                  <PhotoCamera />
                </Button>
              )}
            </FileButton>
          </BackgroundImage>
          <Container className={styles.avatar} mt={-120}>
            <Avatar
              size={120}
              radius={60}
              className={styles.avatarImage}
              src=""
            />
            <FileButton onChange={setAvatarFile} accept="image/png,image/jpeg">
              {(props) => (
                <Button
                  variant="subtle"
                  {...props}
                  className={styles.centerIcon}
                >
                  <PhotoCamera />
                </Button>
              )}
            </FileButton>
          </Container>
          <TextInput
            label="Display Name"
            {...register("name", { required: "Name is required" })}
            value={user?.name}
          />
          <TextInput
            label="Email"
            {...register("email", {
              required: "Email address is required",
              validate: {
                isEmail: (input) =>
                  validator.isEmail(input) || "Email is invalid",
              },
            })}
            value={user?.email}
          />
          <TextInput
            label="Profession"
            {...register("profession", { required: "Profession is required" })}
            value={user?.position}
          />
          <Textarea label="Bio" {...register("bio")} />
          <Flex justify="flex-end" gap="xs">
            <Button
              variant="outline"
              color="dark"
              onClick={() => setIsEditProfileOpen(false)}
              aria-label="cancel edit profile"
            >
              Cancel
            </Button>
            <Button color="dark" type="submit" aria-label="save changes">
              Save Changes
            </Button>
          </Flex>
        </Stack>
      </form>
    </Container>
  );
};

export default EditProfileForm;
