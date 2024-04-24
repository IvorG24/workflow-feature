import { checkUsername } from "@/backend/api/get";
import { Database } from "@/utils/database";
import { removeMultipleSpaces, toTitleCase } from "@/utils/string";
import { mobileNumberFormatter } from "@/utils/styling";
import {
  Box,
  Flex,
  NumberInput,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { Dispatch, SetStateAction } from "react";
import { Controller, useFormContext } from "react-hook-form";
import UploadAvatar from "../UploadAvatar/UploadAvatar";
import { OnboardUserParams } from "./OnboardingPage";
import SubmitSection from "./SubmitSection";

type Props = {
  activeStep: number;
  totalSections: number;
  avatarFile: File | null;
  setAvatarFile: Dispatch<SetStateAction<File | null>>;
  setActiveStep: Dispatch<SetStateAction<number>>;
};

const FirstStep = ({
  activeStep,
  totalSections,
  avatarFile,
  setAvatarFile,
  setActiveStep,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const {
    register,
    control,
    formState: { errors },
    setValue,
    setError,
  } = useFormContext<OnboardUserParams>();

  const inputList = [
    "user_employee_number",
    "user_username",
    "user_first_name",
    "user_last_name",
    "user_phone_number",
    "user_job_title",
  ];

  const defaultInputProps = { h: 80, styles: { required: { color: "red" } } };

  return (
    <Stack h="100%" mah={334} spacing={32}>
      <Flex justify="space-between">
        <Box>
          <Text size={20} weight={700}>
            Let&apos;s setup your account
          </Text>
          <Text size={14}>
            Fill up all required fields to proceed to the next step. Uploading a
            profile picture is optional.
          </Text>
        </Box>
        <Text weight={600}>{`${activeStep}/${totalSections}`}</Text>
      </Flex>
      <Flex h="100%" gap={32}>
        <Stack
          align="center"
          justify="center"
          p="md"
          w={300}
          sx={{ border: "1px dashed #CED4DA", borderRadius: 8 }}
        >
          <Text size={14} weight={600}>
            Profile Picture
          </Text>
          <UploadAvatar
            value={avatarFile}
            onChange={setAvatarFile}
            onError={(error: string) =>
              setError("user_avatar", { message: error })
            }
            size={140}
          />
          <Box sx={{ textAlign: "center", color: "#495057", fontSize: 14 }}>
            <Text>Allowed *.jpg, *jpeg, *.png</Text>
            <Text>Max allowed of 5 MB</Text>
          </Box>
        </Stack>
        <Box sx={{ flex: 1 }}>
          <Stack spacing={36}>
            <SimpleGrid cols={2}>
              <Controller
                control={control}
                name="user_employee_number"
                render={({ field: { onChange, value } }) => (
                  <NumberInput
                    label="Employee Number"
                    placeholder="00001"
                    value={Number(value) || ""}
                    onChange={onChange}
                    hideControls
                    error={errors.user_employee_number?.message}
                    required
                    {...defaultInputProps}
                  />
                )}
                rules={{
                  required: {
                    value: true,
                    message: "Employee number is required",
                  },
                }}
              />
              <TextInput
                label="Username"
                placeholder="jdelacruz01"
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
                      return isAlreadyUsed ? "Username is already used" : true;
                    },
                  },
                })}
                error={errors.user_username?.message}
                data-cy="onboarding-input-username"
                required
                {...defaultInputProps}
              />
              <TextInput
                label="First Name"
                placeholder="Juan"
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
                data-cy="onboarding-input-first-name"
                required
                {...defaultInputProps}
              />
              <TextInput
                label="Last Name"
                placeholder="Dela Cruz"
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
                data-cy="onboarding-input-last-name"
                required
                {...defaultInputProps}
              />
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
                    placeholder="9123456789"
                    maxLength={10}
                    hideControls
                    formatter={(value) => mobileNumberFormatter(value)}
                    icon="+63"
                    min={0}
                    max={9999999999}
                    onChange={onChange}
                    error={errors.user_phone_number?.message}
                    required
                    {...defaultInputProps}
                  />
                )}
              />
              <TextInput
                label="Job Title"
                placeholder="Office Staff"
                {...register("user_job_title", {
                  onChange: (e) => {
                    const format = removeMultipleSpaces(e.currentTarget.value);
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
                {...defaultInputProps}
              />
            </SimpleGrid>
            <SubmitSection
              activeStep={activeStep}
              setActiveStep={setActiveStep}
              inputList={inputList}
            />
          </Stack>
        </Box>
      </Flex>
    </Stack>
  );
};

export default FirstStep;
