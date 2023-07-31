import { checkUsername } from "@/backend/api/get";
import { useUserIntials, useUserProfile } from "@/stores/useUserStore";
import { mobileNumberFormatter } from "@/utils/styling";
import {
  Button,
  Container,
  Divider,
  Flex,
  LoadingOverlay,
  NumberInput,
  Paper,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { usePrevious } from "@mantine/hooks";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Dispatch, SetStateAction } from "react";
import { Controller, useFormContext } from "react-hook-form";
import validator from "validator";
import UploadAvatar from "../UploadAvatar/UploadAvatar";
import { PersonalInfoForm } from "./UserSettingsPage";

type Props = {
  onSavePersonalInfo: (data: PersonalInfoForm) => void;
  avatarFile: File | null;
  onAvatarFileChange: Dispatch<SetStateAction<File | null>>;
  isUpdatingPersonalInfo: boolean;
};

const PersonalInfo = ({
  onSavePersonalInfo,
  avatarFile,
  onAvatarFileChange,
  isUpdatingPersonalInfo,
}: Props) => {
  const supabaseClient = useSupabaseClient();
  const user = useUserProfile();
  const userInitials = useUserIntials();

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setError,
    formState: { errors, isDirty, defaultValues },
  } = useFormContext<PersonalInfoForm>();

  const prevAvatarFile = usePrevious(avatarFile);
  const isAvatarChanged = avatarFile !== prevAvatarFile;

  return (
    <Container p={0} mt="xl" pos="relative" fluid>
      <LoadingOverlay
        visible={isUpdatingPersonalInfo}
        overlayBlur={2}
        transitionDuration={500}
      />
      <Paper p="lg" shadow="xs">
        <form onSubmit={handleSubmit(onSavePersonalInfo)}>
          <Stack spacing={12}>
            <Text weight={600}>Personal Info</Text>

            <Divider mt={-12} />

            <Flex mt="md" justify="space-between" gap="xl" wrap="wrap">
              <UploadAvatar
                // {...register("user_avatar")}
                src={getValues("user_avatar")}
                value={avatarFile}
                onChange={onAvatarFileChange}
                onError={(error: string) =>
                  setError("user_avatar", { message: error })
                }
                initials={userInitials}
                id={user?.user_id}
              />
              {/* <Button size="xs">View Public Profile</Button> */}
            </Flex>

            <Flex direction={{ base: "column", md: "row" }} gap={16}>
              <TextInput
                w="100%"
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
                      if (defaultValues?.user_username === value) return true;
                      const isAlreadyUsed = await checkUsername(
                        supabaseClient,
                        {
                          username: value,
                        }
                      );
                      return isAlreadyUsed ? "Username is already used" : true;
                    },
                  },
                })}
                error={errors.user_username?.message}
              />

              <TextInput
                w="100%"
                label="Email"
                {...register("user_email", {
                  required: true,
                  validate: {
                    isEmail: (value: string) =>
                      validator.isEmail(value) || "Email is invalid",
                  },
                })}
                error={errors.user_email?.message}
                disabled
              />
            </Flex>

            <Flex direction={{ base: "column", md: "row" }} gap={16}>
              <TextInput
                w="100%"
                label="First Name"
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
              />

              <TextInput
                w="100%"
                label="Last Name"
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
              />
            </Flex>

            <Flex direction={{ base: "column", md: "row" }} gap={16}>
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
                    w="100%"
                    defaultValue={Number(getValues("user_phone_number"))}
                    label="Mobile Number"
                    maxLength={10}
                    hideControls
                    formatter={(value) => mobileNumberFormatter(value)}
                    icon="+63"
                    min={0}
                    max={9999999999}
                    onChange={onChange}
                    error={errors.user_phone_number?.message}
                  />
                )}
              />

              <TextInput
                w="100%"
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
              />
            </Flex>

            <Button
              type="submit"
              size="xs"
              sx={{ alignSelf: "flex-end" }}
              disabled={!isAvatarChanged && !isDirty}
            >
              Save Changes
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default PersonalInfo;
