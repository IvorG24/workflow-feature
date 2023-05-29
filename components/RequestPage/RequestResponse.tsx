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

type RequestReponseProps = {
  response: {
    id: string;
    label: string;
    type: FieldType;
    value: string;
    options: OptionTableRow[];
  };
};

const RequestResponse = ({ response }: RequestReponseProps) => {
  const inputProps = {
    variant: "filled",
    readOnly: true,
  };

  const renderResponse = (response: RequestReponseProps["response"]) => {
    switch (response.type) {
      case "TEXT":
        return (
          <TextInput
            label={response.label}
            value={response.value}
            {...inputProps}
          />
        );
      case "TEXTAREA":
        return (
          <Textarea
            label={response.label}
            value={response.value}
            {...inputProps}
          />
        );
      case "NUMBER":
        return (
          <NumberInput
            label={response.label}
            value={Number(response.value)}
            {...inputProps}
          />
        );
      case "SWITCH":
        return (
          <Switch
            label={response.label}
            checked={Boolean(response.value)}
            {...inputProps}
          />
        );
      case "DROPDOWN":
        const dropdownOption = response.options.map((option) => ({
          value: option.option_value,
          label: option.option_value,
        }));
        return (
          <Select
            label={response.label}
            data={dropdownOption}
            value={response.value}
            {...inputProps}
          />
        );
      case "MULTISELECT":
        const multiselectOption = response.options.map((option) => ({
          value: option.option_value,
          label: option.option_value,
        }));
        return (
          <MultiSelect
            label={response.label}
            value={[response.value]}
            data={multiselectOption}
            {...inputProps}
          />
        );
      case "DATE":
        return (
          <DateInput
            label={response.label}
            value={new Date(response.value)}
            {...inputProps}
          />
        );
      case "TIME":
        return (
          <TextInput
            label={response.label}
            value={response.value}
            icon={<IconClock />}
            {...inputProps}
          />
        );
      case "SLIDER":
        const sliderOption = JSON.parse(
          response.options.map((option) => option.option_value)[0]
        );
        const max = Number(sliderOption[1]);
        const marks = Array.from({ length: max }, (_, index) => ({
          value: index + 1,
          label: index + 1,
        }));
        return (
          <Box pb="xl">
            <Text weight={600}>{response.label}</Text>
            <Slider
              defaultValue={Number(response.value)}
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

  return <>{renderResponse(response)}</>;
};

export default RequestResponse;
