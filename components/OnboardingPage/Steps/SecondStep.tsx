import { checkUserIdNumber } from "@/backend/api/get";
import { ID_OPTIONS } from "@/utils/constant";
import { removeMultipleSpaces, toTitleCase } from "@/utils/string";
import { OptionType } from "@/utils/types";
import {
  Box,
  Flex,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Dispatch, SetStateAction } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { OnboardUserParams } from "../OnboardingPage";
import SubmitSection from "../SubmitSection";
import UploadId from "../UploadId";

type Props = {
  activeStep: number;
  totalSections: number;
  idLabel: string;
  regionOptions: OptionType[];
  provinceOptions: OptionType[];
  handleChangeStep: (action: "PREVIOUS" | "NEXT") => Promise<void>;
  setIdType: Dispatch<SetStateAction<string | null>>;
  handleFetchProvinceOptions: (value: string | null) => Promise<void>;
  handleFetchCityOptions: (value: string | null) => Promise<void>;
};

const SecondStep = ({
  activeStep,
  totalSections,
  idLabel,
  regionOptions,
  provinceOptions,
  handleChangeStep,
  setIdType,
  handleFetchProvinceOptions,
  handleFetchCityOptions,
}: Props) => {
  const supabaseClient = useSupabaseClient();

  const {
    register,
    control,
    formState: { errors },
    setValue,
    setError,
  } = useFormContext<OnboardUserParams>();

  const defaultInputProps = {
    styles: { required: { color: "red" } },
    h: { sm: 80 },
  };

  return (
    <Flex h="100%" direction="column" gap={{ base: 24, sm: 32 }}>
      <Flex justify="space-between">
        <Box>
          <Text size={20} weight={700}>
            Upload an ID
          </Text>
          <Text size={14}>Be sure to use the data indicated in your ID.</Text>
        </Box>
        <Text weight={600}>{`${activeStep}/${totalSections}`}</Text>
      </Flex>
      <Flex h="fit-content" gap={32} direction={{ base: "column", sm: "row" }}>
        <Flex direction="column" justify="space-between" gap={24} mih="100%">
          <Group
            align="center"
            p={18}
            w="100%"
            mah={300}
            h="100%"
            sx={{ border: "1px dashed #CED4DA", borderRadius: 8 }}
          >
            <Controller
              control={control}
              name={"user_id_front_image"}
              rules={{
                required: "Front ID image is required",
              }}
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <UploadId
                  value={value}
                  onChange={onChange}
                  onError={(error: string) =>
                    setError("user_id_front_image", { message: error })
                  }
                  fieldError={error?.message}
                  size={90}
                />
              )}
            />
            <Stack spacing={0}>
              <Text size={14} weight={600}>
                Front ID
              </Text>
              <Box c="#495057">
                <Text size={12}>Allowed *.jpg, *jpeg, *.png</Text>
                <Text size={12}>Max allowed of 5 MB</Text>
              </Box>
            </Stack>
          </Group>
          <Group
            align="center"
            p={18}
            w="100%"
            mah={300}
            h="100%"
            sx={{ border: "1px dashed #CED4DA", borderRadius: 8 }}
          >
            <Controller
              control={control}
              name={"user_id_back_image"}
              rules={{
                required: "Back ID image is required",
              }}
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <UploadId
                  value={value}
                  onChange={onChange}
                  onError={(error: string) =>
                    setError("user_id_back_image", { message: error })
                  }
                  fieldError={error?.message}
                  size={90}
                />
              )}
            />
            <Stack spacing={0}>
              <Text size={14} weight={600}>
                Back ID
              </Text>
              <Box c="#495057">
                <Text size={12}>Allowed *.jpg, *jpeg, *.png</Text>
                <Text size={12}>Max allowed of 5 MB</Text>
              </Box>
            </Stack>
          </Group>
        </Flex>
        <Box h="100%" sx={{ flex: 1 }}>
          <Stack justify="space-between" spacing={36}>
            <SimpleGrid
              cols={2}
              breakpoints={[{ maxWidth: "sm", cols: 1, spacing: "sm" }]}
            >
              <Controller
                control={control}
                name={"user_id_type"}
                rules={{ required: "ID Type is required" }}
                render={({ field: { value, onChange } }) => (
                  <Select
                    label="ID type"
                    placeholder="Select ID type"
                    value={value}
                    onChange={(value) => {
                      onChange(value);
                      setIdType(value);
                    }}
                    data={ID_OPTIONS}
                    error={errors.user_id_type?.message}
                    required
                    {...defaultInputProps}
                  />
                )}
              />
              <TextInput
                label={idLabel}
                placeholder="00000111-111"
                {...register("user_id_number", {
                  required: `${idLabel} is required`,
                  minLength: {
                    value: 3,
                    message: `${idLabel} must have at least 3 characters`,
                  },
                  maxLength: {
                    value: 16,
                    message: `${idLabel} must be shorter than 16 characters`,
                  },
                  validate: {
                    isUnique: async (value) => {
                      const result = await checkUserIdNumber(supabaseClient, {
                        idNumber: value.trim(),
                      });
                      return result ? result : "ID Number already used";
                    },
                  },
                })}
                error={errors.user_id_number?.message}
                required
                {...defaultInputProps}
              />
              <Controller
                control={control}
                name={"user_id_gender"}
                rules={{ required: "Gender is required" }}
                render={({ field: { value, onChange } }) => (
                  <Select
                    label="Gender"
                    placeholder="Select a gender"
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
                    required
                    {...defaultInputProps}
                  />
                )}
              />
              <TextInput
                label="Nationality"
                placeholder="Filipino"
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
                    message: "Nationality must be shorter than 100 characters",
                  },
                })}
                error={errors.user_id_nationality?.message}
                required
                {...defaultInputProps}
              />
              <Controller
                control={control}
                name="user_id_region"
                render={({ field: { onChange, value } }) => (
                  <Select
                    label="Region"
                    placeholder="Select a region"
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
                    {...defaultInputProps}
                  />
                )}
                rules={{
                  required: {
                    value: true,
                    message: "Region is required",
                  },
                }}
              />
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
                    {...defaultInputProps}
                  />
                )}
                rules={{
                  required: {
                    value: true,
                    message: "Province is required",
                  },
                }}
              />
            </SimpleGrid>
            <SubmitSection
              activeStep={activeStep}
              handleChangeStep={handleChangeStep}
            />
          </Stack>
        </Box>
      </Flex>
    </Flex>
  );
};

export default SecondStep;
