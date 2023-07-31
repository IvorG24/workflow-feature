import { checkUsername } from "@/backend/api/get";
import { createUser, uploadImage } from "@/backend/api/post";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { mobileNumberFormatter } from "@/utils/styling";
import {
  Button,
  Center,
  Container,
  Divider,
  NumberInput,
  Paper,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { User, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import UploadAvatar from "../UploadAvatar/UploadAvatar";

type OnboardUserParams = {
  user_id: string;
  user_email: string;
  user_first_name: string;
  user_last_name: string;
  user_username: string;
  user_avatar: string;
  user_phone_number: string;
  user_job_title: string;
};

type Props = {
  user: User;
};

const OnboardingPage = ({ user }: Props) => {
  const supabaseClient = useSupabaseClient();
  const router = useRouter();
  const { setIsLoading } = useLoadingActions();

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    control,
  } = useForm<OnboardUserParams>({
    defaultValues: { user_id: user.id, user_email: user.email },
    reValidateMode: "onChange",
  });

  const handleOnboardUser = async (data: OnboardUserParams) => {
    setIsLoading(true);
    try {
      let imageUrl = "";
      if (avatarFile) {
        imageUrl = await uploadImage(supabaseClient, {
          id: data.user_id,
          image: avatarFile,
          bucket: "USER_AVATARS",
        });
      }

      await createUser(supabaseClient, {
        ...data,
        user_avatar: imageUrl,
      });

      await router.push("/team/create");
      notifications.show({
        message: "Profile completed.",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container p={0} mih="100vh" fluid>
      <Container p="xl" maw={450}>
        <Paper p="xl" shadow="sm" withBorder>
          <Title color="blue">Onboarding</Title>

          <Text size="lg" mt="lg" fw="bold">
            Complete your profile
          </Text>

          <Divider mt={4} />

          <Center mt="lg">
            <UploadAvatar
              value={avatarFile}
              onChange={setAvatarFile}
              onError={(error: string) =>
                setError("user_avatar", { message: error })
              }
            />
          </Center>

          <form onSubmit={handleSubmit(handleOnboardUser)}>
            <TextInput
              label="Email"
              {...register("user_email")}
              mt="sm"
              disabled
            />

            <TextInput
              label="Username"
              {...register("user_username", {
                required: "Username is required",
                minLength: {
                  value: 2,
                  message: "Username must have at least 2 characters",
                },
                maxLength: {
                  value: 100,
                  message: "Username must be shorter than 100 characters",
                },
                validate: {
                  validCharacters: (value) =>
                    /^[a-zA-Z0-9_.]+$/.test(value) ||
                    "Username can only contain letters, numbers, underscore, and period",
                  alreadyUsed: async (value) => {
                    const isAlreadyUsed = await checkUsername(supabaseClient, {
                      username: value,
                    });
                    return isAlreadyUsed ? "Username is already used" : true;
                  },
                },
              })}
              error={errors.user_username?.message}
              mt="sm"
            />

            <TextInput
              label="First name"
              {...register("user_first_name", {
                required: "First name is required",
                minLength: {
                  value: 2,
                  message: "First name must have at least 2 characters",
                },
                maxLength: {
                  value: 100,
                  message: "First name must be shorter than 100 characters",
                },
              })}
              error={errors.user_first_name?.message}
              mt="sm"
            />

            <TextInput
              label="Last name"
              {...register("user_last_name", {
                required: "Last name is required",
                minLength: {
                  value: 2,
                  message: "Last name must have at least 2 characters",
                },
                maxLength: {
                  value: 100,
                  message: "Last name must be shorter than 100 characters",
                },
              })}
              error={errors.user_last_name?.message}
              mt="sm"
            />

            <Text size="lg" mt="lg" fw="bold">
              Optional
            </Text>

            <Divider mt={4} />

            <Controller
              control={control}
              name="user_phone_number"
              rules={{
                validate: {
                  valid: (value) =>
                    !value
                      ? true
                      : `${value}`.length === 10
                      ? true
                      : "Invalid mobile number",

                  startsWith: (value) =>
                    !value
                      ? true
                      : `${value}`[0] === "9"
                      ? true
                      : "Mobile number must start with 9",
                },
              }}
              render={({ field: { onChange } }) => (
                <NumberInput
                  label="Mobile Number"
                  maxLength={10}
                  hideControls
                  formatter={(value) => mobileNumberFormatter(value)}
                  icon="+63"
                  min={0}
                  max={9999999999}
                  onChange={onChange}
                  error={errors.user_phone_number?.message}
                  mt="xs"
                />
              )}
            />

            <TextInput
              label="Job Title"
              {...register("user_job_title", {
                minLength: {
                  value: 2,
                  message: "Job title must have at least 2 characters",
                },
                maxLength: {
                  value: 100,
                  message: "Job title must be shorter than 100 characters",
                },
              })}
              error={errors.user_job_title?.message}
              mt="sm"
            />

            <Button type="submit" mt="xl" fullWidth>
              Save and Continue
            </Button>
          </form>
        </Paper>
      </Container>
    </Container>
  );
};

export default OnboardingPage;
