import { removeMultipleSpaces } from "@/utils/string";
import { OptionType } from "@/utils/types";
import {
  Box,
  Checkbox,
  Flex,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { OnboardUserParams } from "../OnboardingPage";
import SubmitSection from "../SubmitSection";

type Props = {
  activeStep: number;
  totalSections: number;
  cityOptions: OptionType[];
  barangayOptions: OptionType[];
  handleChangeStep: (action: "PREVIOUS" | "NEXT") => Promise<void>;
  handleFetchZipCode: (value: string | null) => Promise<void>;
  handleFetchBarangayOptions: (value: string | null) => Promise<void>;
};

const ThirdStep = ({
  activeStep,
  totalSections,
  cityOptions,
  barangayOptions,
  handleChangeStep,
  handleFetchZipCode,
  handleFetchBarangayOptions,
}: Props) => {
  const [isDataConfirmed, setIsDataConfirmed] = useState(false);

  const {
    register,
    control,
    formState: { errors },
    setValue,
  } = useFormContext<OnboardUserParams>();

  const watchBarangay = useWatch({ name: "user_id_barangay", control });

  const defaultInputProps = {
    styles: { required: { color: "red" } },
  };

  return (
    <Flex h="100%" direction="column" gap={{ base: 24, sm: 32 }}>
      <Flex justify="space-between">
        <Box>
          <Text size={20} weight={700}>
            Almost done!
          </Text>
          <Text size={14}>
            Fill out the remaining inputs and submit to finish onboarding.
          </Text>
        </Box>
        <Text weight={600}>{`${activeStep}/${totalSections}`}</Text>
      </Flex>
      <Flex h="fit-content" gap={32} direction={{ base: "column", sm: "row" }}>
        <Box h="100%" sx={{ flex: 1 }}>
          <Stack justify="space-between" spacing={36}>
            <SimpleGrid
              cols={2}
              breakpoints={[{ maxWidth: "sm", cols: 1, spacing: "sm" }]}
            >
              <Controller
                control={control}
                name="user_id_city"
                render={({ field: { onChange, value } }) => (
                  <Select
                    label="City"
                    placeholder="Select ID type"
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
                    {...defaultInputProps}
                  />
                )}
              />
              <Controller
                control={control}
                name="user_id_barangay"
                render={({ field: { onChange, value } }) => (
                  <Select
                    label="Barangay"
                    placeholder="Select a barangay"
                    data={barangayOptions}
                    required
                    clearable
                    searchable
                    onChange={(value) => {
                      setValue("user_id_street", "");
                      handleFetchZipCode(value);
                      onChange(value);
                    }}
                    value={value}
                    error={errors.user_id_barangay?.message}
                    disabled={barangayOptions.length === 0}
                    mt="sm"
                    {...defaultInputProps}
                  />
                )}
                rules={{
                  required: {
                    value: true,
                    message: "Barangay is required",
                  },
                }}
              />
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
                placeholder="123 Joze Rizal Street"
                {...defaultInputProps}
              />
              <TextInput
                {...register("user_id_zip_code", {
                  validate: {
                    required: (value) =>
                      value.trim() ? true : "Zip Code is required",
                  },
                })}
                withAsterisk
                w="100%"
                label="Zip Code"
                placeholder="1300"
                error={errors.user_id_zip_code?.message}
                variant="filled"
                mt="sm"
                {...defaultInputProps}
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
            <Checkbox
              label="I confirm that all data is correct and truthful to the best of my knowledge."
              checked={isDataConfirmed}
              onChange={(e) => setIsDataConfirmed(e.currentTarget.checked)}
              required
            />
            <SubmitSection
              activeStep={activeStep}
              handleChangeStep={handleChangeStep}
              disableSubmit={!isDataConfirmed}
            />
          </Stack>
        </Box>
      </Flex>
    </Flex>
  );
};

export default ThirdStep;
