// todo: create unit test
import FileUrlListContext from "@/contexts/FileUrlListContext";
import { Database } from "@/utils/database.types";
import { uploadFile } from "@/utils/file";
import { GetUserProfile, updateUserProfile } from "@/utils/queries-new";
import {
  Avatar,
  Button,
  Container,
  FileInput,
  Flex,
  Group,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import {
  Dispatch,
  MouseEventHandler,
  SetStateAction,
  useContext,
  useRef,
  useState,
} from "react";
import { useForm } from "react-hook-form";

type Props = {
  user: NonNullable<GetUserProfile>;
  onCancel: MouseEventHandler<HTMLButtonElement>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
};

type Data = {
  username: string;
  firstName: string;
  lastName: string;
};

const EditProfileForm = ({ user, onCancel, setIsLoading }: Props) => {
  const supabaseClient = useSupabaseClient<Database>();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Data>();
  const [avatar, setAvatar] = useState<File | null>(null);

  const avatarInput = useRef<HTMLButtonElement>(null);

  const fileUrlListContext = useContext(FileUrlListContext);

  // const handleUpload = (data: Data) => {
  //   return new Promise((resolve, reject) => {
  //     new Compressor(avatar as File, {
  //       quality: 0.6,
  //       async success(result) {
  //         resolve(
  //           await updateUserProfile(supabaseClient, user.user_id, data.username, result)
  //         );
  //       },
  //       error() {
  //         reject(
  //           showNotification({
  //             title: "Error!",
  //             message: "Failed to upload user profile avatar",
  //             color: "red",
  //           })
  //         );
  //       },
  //     });
  //   });
  // };

  const onSubmit = handleSubmit(async (data) => {
    try {
      setIsLoading(true);
      let filepath;

      // Call the uploadFile function first so that if the team logo upload fails, the team will not be created.
      if (avatar) {
        const { path } = await uploadFile(
          supabaseClient,
          avatar.name,
          avatar,
          "avatars"
        );
        filepath = path;
      }

      await updateUserProfile(supabaseClient, {
        username: data.username,
        user_id: user.user_id,
        user_avatar_filepath: filepath,
        user_first_name: data.firstName,
        user_last_name: data.lastName,
      });

      router.reload();
    } catch {
      setIsLoading(false);
      showNotification({
        title: "Error!",
        message: "Failed to Update Profile",
        color: "red",
      });
    }
  });

  return (
    <Container>
      <Title order={1} weight={600} size={25} mb="lg">
        Edit Profile
      </Title>
      <form onSubmit={onSubmit}>
        <Stack>
          <Group position="center">
            <FileInput
              accept="image/png,image/jpeg"
              display="none"
              ref={avatarInput}
              onChange={(e) => setAvatar(e)}
            />
            <Avatar
              size={150}
              radius={100}
              onClick={() => avatarInput.current?.click()}
              style={{ cursor: "pointer" }}
              src={
                avatar
                  ? URL.createObjectURL(avatar)
                  : fileUrlListContext?.avatarUrlList[user.user_id as string]
              }
              alt="User avatar"
            />
          </Group>
          <TextInput
            label="Display Name"
            {...register("username", {
              required: "Display name is required",
              minLength: {
                value: 3,
                message: "Display name must be at least 3 characters",
              },
            })}
            defaultValue={`${user?.username}`}
            error={errors.username?.message}
          />
          <TextInput
            label="First Name"
            {...register("firstName", {
              required: "First name is required",
              minLength: {
                value: 2,
                message: "First name must be at least 2 characters",
              },
            })}
            defaultValue={`${user?.user_first_name}`}
            error={errors.firstName?.message}
          />
          <TextInput
            label="Last Name"
            {...register("lastName", {
              required: "Last name is required",
              minLength: {
                value: 2,
                message: "Last name must be at least 2 characters",
              },
            })}
            defaultValue={`${user?.user_last_name}`}
            error={errors.lastName?.message}
          />
          <TextInput
            label="Email"
            disabled
            defaultValue={`${user?.user_email}`}
          />
          <Flex justify="flex-end" gap="xs">
            <Button
              variant="outline"
              color="dark"
              onClick={onCancel}
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
