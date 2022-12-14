// todo: create unit test
import { Database } from "@/utils/database.types";
import { FetchUserProfile, updateUserProfile } from "@/utils/queries";
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
  user: FetchUserProfile;
  onCancel: MouseEventHandler<HTMLButtonElement>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
};

type Data = {
  name: string;
};

const EditProfileForm = ({ user, onCancel, setIsLoading }: Props) => {
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Data>();
  const [avatar, setAvatar] = useState<Blob | MediaSource | null>(null);

  const avatarInput = useRef<HTMLButtonElement>(null);

  const onSubmit = handleSubmit(async (data) => {
    try {
      setIsLoading(true);
      await updateUserProfile(
        supabase,
        user.user_id,
        data.name,
        `${user.avatar_url}`
      );
      router.reload();
    } catch {
      setIsLoading(false);
      showNotification({
        title: "Error!",
        message: "Failed to Create Team",
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
              src={avatar ? URL.createObjectURL(avatar) : user.avatar_url}
              alt="User avatar"
            />
          </Group>
          <TextInput
            label="Display Name"
            {...register("name", {
              required: "Name is required",
              minLength: {
                value: 3,
                message: "Name must be at least 3 characters",
              },
            })}
            defaultValue={`${user?.full_name}`}
            error={errors.name?.message}
          />
          <TextInput label="Email" disabled defaultValue={`${user?.email}`} />

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
