import { FormType } from "@/utils/types";
import {
  Box,
  MultiSelect,
  NumberInput,
  Select,
  Slider,
  Switch,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { DateInput, TimeInput } from "@mantine/dates";
import { IconClock } from "@tabler/icons-react";

type Props = {
  field: FormType["form_section"][0]["section_field"][0];
};

const FormField = ({ field }: Props) => {
  const inputProps = {
    variant: "filled",
  };

  const renderResponse = (
    field: FormType["form_section"][0]["section_field"][0]
  ) => {
    switch (field.field_type) {
      case "TEXT":
        return <TextInput label={field.field_name} {...inputProps} />;
      case "TEXTAREA":
        return <Textarea label={field.field_name} {...inputProps} />;
      case "NUMBER":
        return <NumberInput label={field.field_name} {...inputProps} />;
      case "SWITCH":
        return <Switch label={field.field_name} {...inputProps} />;
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
          />
        );
      case "DATE":
        return <DateInput label={field.field_name} {...inputProps} />;
      case "TIME":
        return (
          <TimeInput
            label={field.field_name}
            icon={<IconClock />}
            {...inputProps}
          />
        );
      case "SLIDER":
        const sliderOption = JSON.parse(
          field.field_option.map((option) => option.option_value)[0]
        );
        const max = Number(sliderOption[1]);
        const marks = Array.from({ length: max }, (_, index) => ({
          value: index + 1,
          label: index + 1,
        }));
        return (
          <Box pb="xl">
            <Text weight={600}>{field.field_name}</Text>
            <Slider min={sliderOption[0]} max={max} step={1} marks={marks} />
          </Box>
        );
    }
  };

  return <>{renderResponse(field)}</>;
};

export default FormField;
