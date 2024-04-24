import { ID_OPTIONS } from "@/utils/constant";
import { removeMultipleSpaces, toTitleCase } from "@/utils/string";
import { OptionType } from "@/utils/types";
import {
  Box,
  Flex,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { Dispatch, SetStateAction } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { OnboardUserParams } from "./OnboardingPage";
import SubmitSection from "./SubmitSection";

type Props = {
  activeStep: number;
  totalSections: number;
  idLabel: string;
  regionOptions: OptionType[];
  provinceOptions: OptionType[];
  setActiveStep: Dispatch<SetStateAction<number>>;
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
  setActiveStep,
  setIdType,
  handleFetchProvinceOptions,
  handleFetchCityOptions,
}: Props) => {
  const {
    register,
    control,
    formState: { errors },
    setValue,
  } = useFormContext<OnboardUserParams>();

  const inputList = [
    "user_id_type",
    "user_id_number",
    "user_id_gender",
    "user_id_nationality",
    "user_id_region",
  ];

  const defaultInputProps = { h: 80, styles: { required: { color: "red" } } };

  return (
    <Stack h="100%" mah={334} spacing={32}>
      <Flex justify="space-between">
        <Box>
          <Text size={20} weight={700}>
            Upload an ID
          </Text>
          <Text size={14}>Be sure to use the data indicated in your ID.</Text>
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
            ID
          </Text>
          <Box ta="center" c="#495057">
            <Text size={14}>Allowed *.jpg, *jpeg, *.png</Text>
            <Text size={14}>Max allowed of 5 MB</Text>
          </Box>
        </Stack>
        <Box sx={{ flex: 1 }}>
          <Stack spacing={36}>
            <SimpleGrid cols={2}>
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
                    required
                    {...defaultInputProps}
                  />
                )}
              />
              <TextInput
                label={idLabel}
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
                })}
                error={errors.user_id_number?.message}
                required
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
                    required
                  />
                )}
              />
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
                    message: "Nationality must be shorter than 100 characters",
                  },
                })}
                error={errors.user_id_nationality?.message}
                required
              />
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
              setActiveStep={setActiveStep}
              inputList={inputList}
            />
          </Stack>
        </Box>
      </Flex>
    </Stack>
  );
};

export default SecondStep;
