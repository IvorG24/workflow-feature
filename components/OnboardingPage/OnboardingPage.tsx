import { checkUsername, getUserPendingInvitation } from "@/backend/api/get";
import {
  createTeamMemberReturnTeamName,
  createUser,
  createValidID,
  uploadImage,
} from "@/backend/api/post";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { formatTeamNameToUrlKey, isUUID } from "@/utils/string";
import { mobileNumberFormatter } from "@/utils/styling";
import {
  Button,
  Center,
  Container,
  Divider,
  FileInput,
  Flex,
  NumberInput,
  Paper,
  Select,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { User, useSupabaseClient } from "@supabase/auth-helpers-react";
import { IconAlertCircle } from "@tabler/icons-react";
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
  user_id_type: string;
  user_id_number: string;
  user_id_first_name: string;
  user_id_middle_name: string;
  user_id_last_name: string;
  user_id_gender: string;
  user_id_nationality: string;
  user_id_province: string;
  user_id_city: string;
  user_id_barangay: string;
  user_id_zip_code: number;
  user_id_house_and_street: string;
  user_id_front_image: File | null;
  user_id_back_image: File | null;
};

type Props = {
  user: User;
};

const OnboardingPage = ({ user }: Props) => {
  const supabaseClient = useSupabaseClient();
  const router = useRouter();
  const { setIsLoading } = useLoadingActions();

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [idType, setIdType] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    control,
  } = useForm<OnboardUserParams>({
    defaultValues: { user_id: user.id, user_email: user.email },
    reValidateMode: "onChange",
  });

  const handleOnboardUser = async (data: OnboardUserParams) => {
    setIsLoading(true);
    try {
      const { inviteTeamId } = router.query;
      const isValidTeamId = isUUID(inviteTeamId);

      let imageUrl = "";
      if (avatarFile) {
        imageUrl = await uploadImage(supabaseClient, {
          id: data.user_id,
          image: avatarFile,
          bucket: "USER_AVATARS",
        });
      }

      await createUser(supabaseClient, {
        user_id: data.user_id,
        user_email: data.user_email,
        user_first_name: data.user_first_name,
        user_last_name: data.user_last_name,
        user_username: data.user_username,
        user_phone_number: data.user_phone_number,
        user_job_title: data.user_job_title,
        user_active_team_id: isValidTeamId ? `${inviteTeamId}` : "",
        user_avatar: imageUrl,
      });

      let idFrontImage = "";
      if (data.user_id_front_image) {
        idFrontImage = await uploadImage(supabaseClient, {
          id: `${data.user_id}-front`,
          image: data.user_id_front_image,
          bucket: "USER_VALID_IDS",
        });
      }
      let idBackImage = "";
      if (data.user_id_back_image) {
        idBackImage = await uploadImage(supabaseClient, {
          id: `${data.user_id}-back`,
          image: data.user_id_back_image,
          bucket: "USER_VALID_IDS",
        });
      }

      await createValidID(supabaseClient, {
        user_valid_id_user_id: data.user_id,
        user_valid_id_type: data.user_id_type,
        user_valid_id_number: data.user_id_number,
        user_valid_id_first_name: data.user_id_first_name,
        user_valid_id_middle_name: data.user_id_middle_name,
        user_valid_id_last_name: data.user_last_name,
        user_valid_id_gender: data.user_id_gender,
        user_valid_id_nationality: data.user_id_nationality,
        user_valid_id_province: data.user_id_province,
        user_valid_id_city: data.user_id_city,
        user_valid_id_barangay: data.user_id_barangay,
        user_valid_id_zip_code: `${data.user_id_zip_code}`,
        user_valid_id_house_and_street: data.user_id_house_and_street,
        user_valid_id_status: "PENDING",
        user_valid_id_front_image_url: idFrontImage,
        user_valid_id_back_image_url: idBackImage,
      });

      // create user goverment id
      const pendingInvitation = await getUserPendingInvitation(supabaseClient, {
        userEmail: data.user_email,
      });

      if (isValidTeamId) {
        const team = await createTeamMemberReturnTeamName(supabaseClient, {
          team_member_team_id: `${inviteTeamId}`,
          team_member_user_id: data.user_id,
        });

        const activeTeamNameToUrl = formatTeamNameToUrlKey(
          team[0].team.team_name ?? ""
        );
        await router.push(`/${activeTeamNameToUrl}/dashboard?onboarding=true`);
      } else if (pendingInvitation) {
        await router.push(
          `/invitation/${pendingInvitation.invitation_id}?onboarding=true`
        );
      } else {
        await router.push("/create-team?onboarding=true");
      }

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
              data-cy="onboarding-input-username"
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
              data-cy="onboarding-input-first-name"
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
              data-cy="onboarding-input-last-name"
            />

            <Text size="lg" mt="lg" fw="bold">
              Government-issued ID
            </Text>

            <Divider mt={4} />

            <Flex align="center" gap={4} mt="xs">
              <IconAlertCircle size="1rem" color="#998e95" />
              <Text size="xs" color="dimmed">
                Please fill in the fields referring to the government-issued ID.
              </Text>
            </Flex>

            <Controller
              control={control}
              name={"user_id_type"}
              rules={{ required: "ID Type is required" }}
              render={({ field: { value, onChange } }) => (
                <Select
                  label="ID type"
                  value={value}
                  onChange={(value) => {
                    onChange(value);
                    setIdType(value);
                  }}
                  data={[
                    {
                      value: "Philippine Driver's License",
                      label: "Philippine Driver's License",
                    },
                    {
                      value: "Philippine Passport",
                      label: "Philippine Passport",
                    },
                  ]}
                  error={errors.user_id_type?.message}
                  mt="md"
                />
              )}
            />

            <TextInput
              label="ID number"
              {...register("user_id_number", {
                required: "ID Number is required",
                minLength: {
                  value: 6,
                  message: "ID Number must have at least 8 characters",
                },
                maxLength: {
                  value: 16,
                  message: "ID Number must be shorter than 16 characters",
                },
              })}
              error={errors.user_id_number?.message}
              mt="sm"
            />

            <TextInput
              label="First name"
              {...register("user_id_first_name", {
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
              error={errors.user_id_first_name?.message}
              mt="sm"
            />

            <TextInput
              label="Middle name"
              {...register("user_id_middle_name", {
                required: "Middle name is required",
                minLength: {
                  value: 2,
                  message: "Middle name must have at least 2 characters",
                },
                maxLength: {
                  value: 100,
                  message: "Middle name must be shorter than 100 characters",
                },
              })}
              error={errors.user_id_middle_name?.message}
              mt="sm"
            />

            <TextInput
              label="Last name"
              {...register("user_id_last_name", {
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
              error={errors.user_id_last_name?.message}
              mt="sm"
            />

            <Controller
              control={control}
              name={"user_id_gender"}
              rules={{ required: "Gender is required" }}
              render={({ field: { value, onChange } }) => (
                <Select
                  label="Gender"
                  value={value}
                  onChange={onChange}
                  data={[
                    {
                      value: "Male",
                      label: "Male",
                    },
                    {
                      value: "Female",
                      label: "Female",
                    },
                  ]}
                  error={errors.user_id_type?.message}
                  mt="sm"
                />
              )}
            />

            <TextInput
              label="Nationality"
              {...register("user_id_nationality", {
                required: "Nationality is required",
                minLength: {
                  value: 2,
                  message: "Nationality must have at least 2 characters",
                },
                maxLength: {
                  value: 100,
                  message: "Nationality must be shorter than 100 characters",
                },
              })}
              error={errors.user_id_nationality?.message}
              mt="sm"
            />

            <TextInput
              label="Province"
              {...register("user_id_province", {
                required: "Province is required",
                minLength: {
                  value: 2,
                  message: "Province must have at least 2 characters",
                },
                maxLength: {
                  value: 100,
                  message: "Province must be shorter than 100 characters",
                },
              })}
              error={errors.user_id_province?.message}
              mt="sm"
            />

            <TextInput
              label="City"
              {...register("user_id_city", {
                required: "City is required",
                minLength: {
                  value: 2,
                  message: "City must have at least 2 characters",
                },
                maxLength: {
                  value: 100,
                  message: "City must be shorter than 100 characters",
                },
              })}
              error={errors.user_id_city?.message}
              mt="sm"
            />

            <TextInput
              label="Barangay/Municipality"
              {...register("user_id_barangay", {
                required: "Barangay/Municipality is required",
                minLength: {
                  value: 2,
                  message:
                    "Barangay/Municipality must have at least 2 characters",
                },
                maxLength: {
                  value: 100,
                  message:
                    "Barangay/Municipality must be shorter than 100 characters",
                },
              })}
              error={errors.user_id_barangay?.message}
              mt="sm"
            />

            <Controller
              control={control}
              name={"user_id_zip_code"}
              rules={{
                required: "Zip code is required",
              }}
              render={({ field: { value, onChange } }) => (
                <NumberInput
                  label="Zip code"
                  defaultValue={0}
                  value={Number(value) | 0}
                  onChange={onChange}
                  hideControls
                  formatter={(value) => {
                    const intValue = parseInt(value, 10);

                    if (
                      !isNaN(intValue) &&
                      intValue >= 1000 &&
                      intValue <= 9999
                    ) {
                      clearErrors("user_id_zip_code");
                      return intValue.toString();
                    } else {
                      setError("user_id_zip_code", {
                        message: "Zip code must be 4 digits",
                      });
                      return "";
                    }
                  }}
                  error={errors.user_id_zip_code?.message}
                  mt="sm"
                />
              )}
            />

            <TextInput
              label="House number and street address"
              {...register("user_id_house_and_street", {
                required: "House number and street address is required",
                minLength: {
                  value: 2,
                  message:
                    "House number and street address must have at least 2 characters",
                },
                maxLength: {
                  value: 100,
                  message:
                    "House number and street address must be shorter than 100 characters",
                },
              })}
              error={errors.user_id_house_and_street?.message}
              mt="sm"
            />

            <Controller
              control={control}
              name={"user_id_front_image"}
              rules={{
                required: "Front ID image is required",
              }}
              render={({ field: { value, onChange } }) => (
                <FileInput
                  value={value}
                  onChange={onChange}
                  label="Front ID image"
                  accept="image/png,image/jpeg"
                  error={errors.user_id_front_image?.message}
                />
              )}
            />

            {idType !== "Philippine Passport" && (
              <Controller
                control={control}
                name={"user_id_back_image"}
                rules={{
                  required:
                    idType !== "Philippine Passport"
                      ? "Back ID image is required"
                      : false,
                }}
                render={({ field: { value, onChange } }) => (
                  <FileInput
                    value={value}
                    onChange={onChange}
                    label="Back ID image"
                    accept="image/png,image/jpeg"
                    error={errors.user_id_back_image?.message}
                  />
                )}
              />
            )}

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
