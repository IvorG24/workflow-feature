import { checkUsername, getUserPendingInvitation } from "@/backend/api/get";
import {
  createTeamMemberReturnTeamName,
  createUser,
  createValidID,
  uploadImage,
} from "@/backend/api/post";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { ID_OPTIONS } from "@/utils/constant";
import {
  formatTeamNameToUrlKey,
  isUUID,
  removeMultipleSpaces,
  toTitleCase,
} from "@/utils/string";
import { mobileNumberFormatter } from "@/utils/styling";
import { OptionType } from "@/utils/types";
import {
  Button,
  Center,
  Container,
  Divider,
  FileInput,
  Flex,
  Grid,
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
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  barangays,
  cities,
  provinces,
  regions,
} from "select-philippines-address";
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
  user_employee_number: string;
  user_id_type: string;
  user_id_number: string;
  user_id_first_name: string;
  user_id_middle_name: string;
  user_id_last_name: string;
  user_id_gender: string;
  user_id_nationality: string;
  user_id_region: string;
  user_id_province: string;
  user_id_city: string;
  user_id_barangay: string;
  user_id_street: string;
  user_id_zip_code: string;
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
  const [regionOptions, setRegionOptions] = useState<OptionType[]>([]);
  const [provinceOptions, setProvinceOptions] = useState<OptionType[]>([]);
  const [cityOptions, setCityOptions] = useState<OptionType[]>([]);
  const [barangayOptions, setBarangayOptions] = useState<OptionType[]>([]);

  useEffect(() => {
    try {
      setIsLoading(true);
      handleFetchRegionOptions();
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    control,
    setValue,
    watch,
  } = useForm<OnboardUserParams>({
    defaultValues: { user_id: user.id, user_email: user.email },
    reValidateMode: "onChange",
  });

  const watchBarangay = watch("user_id_barangay");

  const handleOnboardUser = async (data: OnboardUserParams) => {
    setIsLoading(true);
    try {
      const { inviteTeamId } = router.query;
      const isValidTeamId = isUUID(inviteTeamId);

      const region = regionOptions.find(
        (options) => options.value === data.user_id_region
      )?.label;
      const province = provinceOptions.find(
        (options) => options.value === data.user_id_province
      )?.label;
      const city = cityOptions.find(
        (options) => options.value === data.user_id_city
      )?.label;
      const barangay = barangayOptions.find(
        (options) => options.value === data.user_id_barangay
      )?.label;

      if (!region || !province || !city || !barangay) throw new Error();

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
        user_email: data.user_email.trim(),
        user_first_name: data.user_first_name.trim(),
        user_last_name: data.user_last_name.trim(),
        user_username: data.user_username.trim(),
        user_phone_number: data.user_phone_number,
        user_job_title: data.user_job_title.trim().replace(/'/g, "''"),
        user_active_team_id: isValidTeamId ? `${inviteTeamId}` : "",
        user_avatar: imageUrl,
        user_employee_number: data.user_employee_number,
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
        user_valid_id_type: data.user_id_type.replace(/'/g, "''"),
        user_valid_id_number: data.user_id_number.trim(),
        user_valid_id_first_name: data.user_id_first_name.trim(),
        user_valid_id_middle_name: data.user_id_middle_name.trim(),
        user_valid_id_last_name: data.user_last_name.trim(),
        user_valid_id_gender: data.user_id_gender.trim(),
        user_valid_id_nationality: data.user_id_nationality.trim(),
        user_valid_id_status: "PENDING",
        user_valid_id_front_image_url: idFrontImage,
        user_valid_id_back_image_url: idBackImage,
        address_region: region.replace(/'/g, "''"),
        address_province: province.replace(/'/g, "''"),
        address_city: city.replace(/'/g, "''"),
        address_barangay: barangay.replace(/'/g, "''"),
        address_street: data.user_id_street.replace(/'/g, "''"),
        address_zip_code: "0000",
      });

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
      console.error(error);
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const idLabel = idType === "Company ID" ? "Employee Number" : "ID Number";

  const handleFetchRegionOptions = async () => {
    const data: {
      region_code: string;
      region_name: string;
    }[] = await regions();
    setRegionOptions(
      data.map((region) => {
        return {
          label: region.region_name,
          value: region.region_code,
        };
      })
    );
  };

  const handleFetchProvinceOptions = async (value: string | null) => {
    try {
      setProvinceOptions([]);
      setCityOptions([]);
      setBarangayOptions([]);
      setValue("user_id_province", "");
      setValue("user_id_city", "");
      setValue("user_id_barangay", "");
      setValue("user_id_street", "");
      if (!value) {
        return;
      } else if (Number(value) === 13) {
        const data: {
          province_code: string;
          province_name: string;
        }[] = await provinces(value);
        setProvinceOptions(
          data
            .filter((province) => province.province_name !== "City Of Manila")
            .map((province) => {
              return {
                label: province.province_name,
                value: province.province_code,
              };
            })
        );
      } else {
        const data: {
          province_code: string;
          province_name: string;
        }[] = await provinces(value);
        setProvinceOptions(
          data.map((province) => {
            return {
              label: province.province_name,
              value: province.province_code,
            };
          })
        );
      }
    } catch (e) {
      setValue("user_id_region", "");
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const handleFetchCityOptions = async (value: string | null) => {
    try {
      setCityOptions([]);
      setBarangayOptions([]);
      setValue("user_id_city", "");
      setValue("user_id_barangay", "");
      setValue("user_id_street", "");
      if (!value) return;

      const data: {
        city_code: string;
        city_name: string;
      }[] = await cities(value);
      setCityOptions(
        data.map((city) => {
          return {
            label: city.city_name,
            value: city.city_code,
          };
        })
      );
    } catch (e) {
      setValue("user_id_province", "");
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const handleFetchBarangayOptions = async (value: string | null) => {
    try {
      setBarangayOptions([]);
      setValue("user_id_barangay", "");
      setValue("user_id_street", "");
      if (!value) return;

      const data: {
        brgy_code: string;
        brgy_name: string;
      }[] = await barangays(value);
      setBarangayOptions(
        data.map((barangay) => {
          return {
            label: barangay.brgy_name,
            value: barangay.brgy_code,
          };
        })
      );
    } catch (e) {
      setValue("user_id_city", "");
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  return (
    <Container p={0} mih="100vh" fluid>
      <Container p="xl" maw={{ base: 450, xs: 750 }}>
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
            <Grid columns={2} gutter="sm">
              <Grid.Col xs={2} sm={1}>
                <TextInput
                  label="Email"
                  {...register("user_email")}
                  mt="sm"
                  disabled
                />
              </Grid.Col>
              <Grid.Col xs={2} sm={1}>
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
                        const isAlreadyUsed = await checkUsername(
                          supabaseClient,
                          {
                            username: value,
                          }
                        );
                        return isAlreadyUsed
                          ? "Username is already used"
                          : true;
                      },
                    },
                  })}
                  error={errors.user_username?.message}
                  mt="sm"
                  data-cy="onboarding-input-username"
                  required
                />
              </Grid.Col>
              <Grid.Col xs={2} sm={1}>
                <TextInput
                  label="First name"
                  {...register("user_first_name", {
                    onChange: (e) => {
                      const format = toTitleCase(
                        removeMultipleSpaces(e.currentTarget.value)
                      );
                      setValue("user_first_name", format);
                    },
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
                  required
                />
              </Grid.Col>

              <Grid.Col xs={2} sm={1}>
                <TextInput
                  label="Last name"
                  {...register("user_last_name", {
                    onChange: (e) => {
                      const format = toTitleCase(
                        removeMultipleSpaces(e.currentTarget.value)
                      );
                      setValue("user_last_name", format);
                    },
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
                  required
                />
              </Grid.Col>
              <Grid.Col xs={2} sm={1}>
                <Controller
                  control={control}
                  name="user_phone_number"
                  rules={{
                    required: "Mobile Number is required.",
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
                      mt="sm"
                      required
                    />
                  )}
                />
              </Grid.Col>

              <Grid.Col xs={2} sm={1}>
                <Controller
                  control={control}
                  name="user_employee_number"
                  render={({ field: { onChange } }) => (
                    <NumberInput
                      label="Employee Number"
                      onChange={onChange}
                      hideControls
                      error={errors.user_employee_number?.message}
                      mt="sm"
                      required
                    />
                  )}
                  rules={{
                    required: {
                      value: true,
                      message: "Employee number is required",
                    },
                  }}
                />
              </Grid.Col>

              <Grid.Col span={2}>
                <Text size="lg" mt="lg" fw="bold">
                  Government-issued ID
                </Text>
                <Divider mt={4} />
                <Flex align="center" gap={4} mt="xs">
                  <IconAlertCircle size="1rem" color="#998e95" />
                  <Text size="xs" color="dimmed">
                    Please fill in the fields referring to the government-issued
                    ID.
                  </Text>
                </Flex>
              </Grid.Col>

              <Grid.Col xs={2} sm={1}>
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
                      data={ID_OPTIONS}
                      error={errors.user_id_type?.message}
                      mt="sm"
                      required
                    />
                  )}
                />
              </Grid.Col>

              <Grid.Col xs={2} sm={1}>
                <TextInput
                  label={idLabel}
                  {...register("user_id_number", {
                    required: `${idLabel} is required`,
                    minLength: {
                      value: 6,
                      message: `${idLabel} must have at least 8 characters`,
                    },
                    maxLength: {
                      value: 16,
                      message: `${idLabel} must be shorter than 16 characters`,
                    },
                  })}
                  error={errors.user_id_number?.message}
                  mt="sm"
                  required
                />
              </Grid.Col>

              <Grid.Col xs={2} sm={1}>
                <TextInput
                  label="First name"
                  {...register("user_id_first_name", {
                    onChange: (e) => {
                      const format = toTitleCase(
                        removeMultipleSpaces(e.currentTarget.value)
                      );
                      setValue("user_id_first_name", format);
                    },
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
                  required
                />
              </Grid.Col>

              <Grid.Col xs={2} sm={1}>
                <TextInput
                  label="Middle name"
                  {...register("user_id_middle_name", {
                    onChange: (e) => {
                      const format = toTitleCase(
                        removeMultipleSpaces(e.currentTarget.value)
                      );
                      setValue("user_id_middle_name", format);
                    },
                    minLength: {
                      value: 2,
                      message: "Middle name must have at least 2 characters",
                    },
                    maxLength: {
                      value: 100,
                      message:
                        "Middle name must be shorter than 100 characters",
                    },
                  })}
                  error={errors.user_id_middle_name?.message}
                  mt="sm"
                  required
                />
              </Grid.Col>

              <Grid.Col xs={2} sm={1}>
                <TextInput
                  label="Last name"
                  {...register("user_id_last_name", {
                    onChange: (e) => {
                      const format = toTitleCase(
                        removeMultipleSpaces(e.currentTarget.value)
                      );
                      setValue("user_id_last_name", format);
                    },
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
                  required
                />
              </Grid.Col>

              <Grid.Col xs={2} sm={1}>
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
                      required
                    />
                  )}
                />
              </Grid.Col>

              <Grid.Col xs={2} sm={1}>
                <TextInput
                  label="Nationality"
                  {...register("user_id_nationality", {
                    onChange: (e) => {
                      const format = toTitleCase(
                        removeMultipleSpaces(e.currentTarget.value)
                      );
                      setValue("user_id_nationality", format);
                    },
                    required: "Nationality is required",
                    minLength: {
                      value: 2,
                      message: "Nationality must have at least 2 characters",
                    },
                    maxLength: {
                      value: 100,
                      message:
                        "Nationality must be shorter than 100 characters",
                    },
                  })}
                  error={errors.user_id_nationality?.message}
                  mt="sm"
                  required
                />
              </Grid.Col>

              <Grid.Col xs={2} sm={1}>
                <Controller
                  control={control}
                  name="user_id_region"
                  render={({ field: { onChange, value } }) => (
                    <Select
                      label="Region"
                      data={regionOptions}
                      required
                      clearable
                      searchable
                      onChange={async (value) => {
                        await handleFetchProvinceOptions(value);
                        onChange(value);
                      }}
                      value={value}
                      error={errors.user_id_region?.message}
                      mt="sm"
                    />
                  )}
                  rules={{
                    required: {
                      value: true,
                      message: "Region is required",
                    },
                  }}
                />
              </Grid.Col>

              <Grid.Col xs={2} sm={1}>
                <Controller
                  control={control}
                  name="user_id_province"
                  render={({ field: { onChange, value } }) => (
                    <Select
                      label="Province"
                      data={provinceOptions}
                      required
                      clearable
                      searchable
                      onChange={async (value) => {
                        await handleFetchCityOptions(value);
                        onChange(value);
                      }}
                      value={value}
                      error={errors.user_id_province?.message}
                      disabled={provinceOptions.length === 0}
                      mt="sm"
                    />
                  )}
                  rules={{
                    required: {
                      value: true,
                      message: "Province is required",
                    },
                  }}
                />
              </Grid.Col>

              <Grid.Col xs={2} sm={1}>
                <Controller
                  control={control}
                  name="user_id_city"
                  render={({ field: { onChange, value } }) => (
                    <Select
                      label="City"
                      data={cityOptions}
                      required
                      clearable
                      searchable
                      onChange={async (value) => {
                        await handleFetchBarangayOptions(value);
                        onChange(value);
                      }}
                      value={value}
                      error={errors.user_id_city?.message}
                      disabled={cityOptions.length === 0}
                      mt="sm"
                    />
                  )}
                  rules={{
                    required: {
                      value: true,
                      message: "City is required",
                    },
                  })}
                  error={errors.user_id_barangay?.message}
                  mt="sm"
                />
              </Grid.Col>

              <Grid.Col xs={2} sm={1}>
                <Controller
                  control={control}
                  name="user_id_barangay"
                  render={({ field: { onChange, value } }) => (
                    <Select
                      label="Barangay"
                      data={barangayOptions}
                      required
                      clearable
                      searchable
                      onChange={(value) => {
                        setValue("user_id_street", "");
                        onChange(value);
                      }}
                      value={value}
                      error={errors.user_id_barangay?.message}
                      disabled={barangayOptions.length === 0}
                      mt="sm"
                    />
                  )}
                  rules={{
                    required: {
                      value: true,
                      message: "Barangay is required",
                    },
                  }}
                />
              </Grid.Col>

              <Grid.Col xs={2} sm={1}>
                <TextInput
                  {...register("user_id_street", {
                    validate: {
                      required: (value) =>
                        value.trim() ? true : "Street is required",
                      minLength: (value) =>
                        value.trim().length > 2
                          ? true
                          : "Street must have atleast 3 characters",
                      maxLength: (value) =>
                        value.trim().length < 500
                          ? true
                          : "Street must be shorter than 500 characters",
                    },
                  })}
                  withAsterisk
                  w="100%"
                  label="Street"
                  error={errors.user_id_street?.message}
                  disabled={!watchBarangay}
                  mt="sm"
                />
              </Grid.Col>

              <Grid.Col xs={2} sm={1}>
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
                      mt="sm"
                      required
                    />
                  )}
                />
              </Grid.Col>

              {idType !== "Philippine Passport" && (
                <Grid.Col xs={2} sm={1}>
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
                        mt="sm"
                        required
                      />
                    )}
                  />
                </Grid.Col>
              )}
              <Grid.Col span={2}>
                <Text size="lg" mt="lg" fw="bold">
                  Optional
                </Text>

                <Divider mt={4} />
              </Grid.Col>

              <Grid.Col span={2}>
                <TextInput
                  label="Job Title"
                  {...register("user_job_title", {
                    onChange: (e) => {
                      const format = removeMultipleSpaces(
                        e.currentTarget.value
                      );
                      setValue("user_job_title", format);
                    },
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
              </Grid.Col>
            </Grid>

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
