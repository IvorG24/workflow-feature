// todo: create unit test
import { Database } from "@/utils/database.types";
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
};

const EditProfileForm = ({ user, onCancel, setIsLoading }: Props) => {
  const supabaseClient = useSupabaseClient<Database>();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Data>();
  const [avatar, setAvatar] = useState<Blob | MediaSource | null>(null);

  const avatarInput = useRef<HTMLButtonElement>(null);

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
      // await handleUpload(data);

      await updateUserProfile(supabaseClient, {
        username: data.username,
        user_id: user.user_id,
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
                avatar ? URL.createObjectURL(avatar) : user.user_avatar_filepath
              }
              alt="User avatar"
            />
          </Group>
          <TextInput
            label="Display Name"
            {...register("username", {
              required: "Name is required",
              minLength: {
                value: 3,
                message: "Name must be at least 3 characters",
              },
            })}
            defaultValue={`${user?.username}`}
            error={errors.username?.message}
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
