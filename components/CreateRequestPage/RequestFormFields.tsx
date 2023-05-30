import { FieldType, OptionTableRow } from "@/utils/types";
import {
  ActionIcon,
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
import { useRef } from "react";

type RequestFormFieldsProps = {
  field: {
    id: string;
    label: string;
    type: FieldType;
    description: string | null;
    is_required: boolean;
    options: OptionTableRow[];
  };
};

const RequestFormFields = ({ field }: RequestFormFieldsProps) => {
  const timeInputRef = useRef<HTMLInputElement>(null);
  const inputProps = {
    description: field.description,
    required: field.is_required,
  };

  const renderField = (field: RequestFormFieldsProps["field"]) => {
    switch (field.type) {
      case "TEXT":
        return <TextInput label={field.label} {...inputProps} />;

      case "TEXTAREA":
        return <Textarea label={field.label} {...inputProps} />;

      case "NUMBER":
        return (
          <NumberInput
            label={field.label}
            withAsterisk={field.is_required}
            min={0}
            max={99999999999999}
            {...inputProps}
          />
        );

      case "SWITCH":
        return <Switch {...inputProps} label={field.label} />;

      case "DROPDOWN":
        const dropdownOption = field.options.map((option) => ({
          value: option.option_value,
          label: option.option_value,
        }));
        return (
          <Select label={field.label} data={dropdownOption} {...inputProps} />
        );

      case "MULTISELECT":
        const multiselectOption = field.options.map((option) => ({
          value: option.option_value,
          label: option.option_value,
        }));
        return (
          <MultiSelect
            label={field.label}
            data={multiselectOption}
            {...inputProps}
          />
        );

      case "DATE":
        return <DateInput label={field.label} {...inputProps} />;

      case "TIME":
        return (
          <TimeInput
            label={field.label}
            ref={timeInputRef}
            {...inputProps}
            rightSection={
              <ActionIcon onClick={() => timeInputRef.current?.showPicker()}>
                <IconClock size="1rem" stroke={1.5} />
              </ActionIcon>
            }
          />
        );
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
              {...inputProps}
            />
          </Box>
        );
    }
  };

  return <>{renderField(field)}</>;
};

export default RequestFormFields;
