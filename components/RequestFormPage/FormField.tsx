import { FormType } from "@/utils/types";
import {
  ActionIcon,
  FileInput,
  Flex,
  MultiSelect,
  NumberInput,
  Select,
  Switch,
  TextInput,
  Textarea,
} from "@mantine/core";
import { DateInput, TimeInput } from "@mantine/dates";
import {
  IconCalendar,
  IconClock,
  IconExternalLink,
  IconFile,
} from "@tabler/icons-react";
import { useRef } from "react";

type Props = {
  field: FormType["form_section"][0]["section_field"][0];
};

const FormField = ({ field }: Props) => {
  const inputProps = {
    variant: "filled",
  };

  const ref = useRef<HTMLInputElement>(null);

  const renderResponse = (
    field: FormType["form_section"][0]["section_field"][0]
  ) => {
    switch (field.field_type) {
      case "LINK":
        return (
          <Flex w="100%" align="flex-end" gap="xs">
            <TextInput
              label={field.field_name}
              {...inputProps}
              style={{ flex: 1 }}
              withAsterisk={field.field_is_required}
            />
            <ActionIcon mb={4} p={4} variant="light" color="blue">
              <IconExternalLink />
            </ActionIcon>
          </Flex>
        );
      case "TEXT":
        return (
          <TextInput
            label={field.field_name}
            {...inputProps}
            withAsterisk={field.field_is_required}
          />
        );
      case "TEXTAREA":
        return (
          <Textarea
            label={field.field_name}
            {...inputProps}
            withAsterisk={field.field_is_required}
          />
        );
      case "NUMBER":
        return (
          <NumberInput
            label={field.field_name}
            {...inputProps}
            withAsterisk={field.field_is_required}
          />
        );
      case "SWITCH":
        return (
          <Switch
            label={field.field_name}
            {...inputProps}
            sx={{ label: { cursor: "pointer" } }}
            mt="xs"
          />
        );
      case "DROPDOWN":
        const dropdownOption = field.field_option.map((option) => ({
          value: option.option_value,
          label: option.option_value,
        }));
        return (
          <Select
            label={field.field_name}
            data={dropdownOption}
            {...inputProps}
            clearable
            withAsterisk={field.field_is_required}
          />
        );
      case "MULTISELECT":
        const multiselectOption = field.field_option.map((option) => ({
          value: option.option_value,
          label: option.option_value,
        }));
        return (
          <MultiSelect
            label={field.field_name}
            data={multiselectOption}
            {...inputProps}
            withAsterisk={field.field_is_required}
          />
        );
      case "DATE":
        return (
          <DateInput
            icon={<IconCalendar size={16} />}
            label={field.field_name}
            {...inputProps}
            withAsterisk={field.field_is_required}
          />
        );
      case "TIME":
        return (
          <TimeInput
            label={field.field_name}
            icon={<IconClock size={16} />}
            {...inputProps}
            withAsterisk={field.field_is_required}
            ref={ref}
            rightSection={
              <ActionIcon
                onClick={() => {
                  ref.current && ref.current.showPicker();
                }}
              >
                <IconClock size="1rem" stroke={1.5} />
              </ActionIcon>
            }
          />
        );
      // case "SLIDER":
      //   const sliderOption = JSON.parse(
      //     field.field_option.map((option) => option.option_value)[0]
      //   );
      //   const max = Number(sliderOption[1]);
      //   const marks = Array.from({ length: max }, (_, index) => ({
      //     value: index + 1,
      //     label: index + 1,
      //   }));
      //   return (
      //     <Box pb="xl">
      //       <Text weight={600} size={14}>
      //         {field.field_name}
      //       </Text>
      //       <Slider min={sliderOption[0]} max={max} step={1} marks={marks} />
      //     </Box>
      //   );
      case "FILE":
        return (
          <FileInput
            {...inputProps}
            label={field.field_name}
            icon={<IconFile size={16} />}
            clearable
            multiple={false}
            withAsterisk={field.field_is_required}
          />
        );
    }
  };

  return <>{renderResponse(field)}</>;
};

export default FormField;
