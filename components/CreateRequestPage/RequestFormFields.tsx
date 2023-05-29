import { FieldType, OptionTableRow } from "@/utils/types";
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
import { DateInput } from "@mantine/dates";
import { IconClock } from "@tabler/icons-react";

type RequestFormFieldsProps = {
  field: {
    id: string;
    label: string;
    type: FieldType;
    options: OptionTableRow[];
  };
};

const RequestFormFields = ({ field }: RequestFormFieldsProps) => {
  const renderField = (field: RequestFormFieldsProps["field"]) => {
    switch (field.type) {
      case "TEXT":
        return <TextInput label={field.label} />;
      case "TEXTAREA":
        return <Textarea label={field.label} />;
      case "NUMBER":
        return <NumberInput label={field.label} />;
      case "SWITCH":
        return <Switch label={field.label} />;
      case "DROPDOWN":
        const dropdownOption = field.options.map((option) => ({
          value: option.option_value,
          label: option.option_value,
        }));
        return <Select label={field.label} data={dropdownOption} />;
      case "MULTISELECT":
        const multiselectOption = field.options.map((option) => ({
          value: option.option_value,
          label: option.option_value,
        }));
        return <MultiSelect label={field.label} data={multiselectOption} />;
      case "DATE":
        return <DateInput label={field.label} />;
      case "TIME":
        return <TextInput label={field.label} icon={<IconClock />} />;
      case "SLIDER":
        const sliderOption = JSON.parse(
          field.options.map((option) => option.option_value)[0]
        );
        const max = Number(sliderOption[1]);
        const marks = Array.from({ length: max }, (_, index) => ({
          value: index + 1,
          label: index + 1,
        }));
        return (
          <Box pb="xl">
            <Text weight={600}>{field.label}</Text>
            <Slider
              min={sliderOption[0]}
              max={max}
              step={1}
              marks={marks}
              disabled
            />
          </Box>
        );
    }
  };

  return <>{renderField(field)}</>;
};

export default RequestFormFields;
