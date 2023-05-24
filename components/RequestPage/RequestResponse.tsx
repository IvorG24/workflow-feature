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
    label: string;
    type: FieldType;
    value: string;
    options: OptionTableRow[];
  };
};

const RequestResponse = ({ response }: RequestReponseProps) => {
  const inputProps = { variant: "filled", readOnly: true };
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
            checked={response.value as unknown as boolean}
            {...inputProps}
          />
        );
      case "DROPDOWN":
        return (
          <Select
            label={response.label}
            value={response.value}
            data={[{ value: response.value, label: response.value }]}
            {...inputProps}
          />
        );
      case "MULTISELECT":
        return (
          <MultiSelect
            label={response.label}
            value={[response.value]}
            data={[{ value: response.value, label: response.value }]}
            {...inputProps}
          />
        );
      case "DATE":
        return (
          <DateInput
            value={new Date(response.value)}
            label={response.label}
            {...inputProps}
          />
        );
      case "TIME":
        return (
          <TextInput
            value={response.value}
            label={response.label}
            icon={<IconClock />}
            {...inputProps}
          />
        );
      case "SLIDER":
        const optionValue = JSON.parse(
          response.options.map((option) => option.option_value)[0]
        );
        const max = optionValue[1];
        const marks = Array.from({ length: max }, (_, index) => ({
          value: index + 1,
          label: index + 1,
        }));

        return (
          <Box>
            <Text weight={600}>{response.label}</Text>
            <Slider
              defaultValue={Number(response.value)}
              min={optionValue[0]}
              max={max}
              step={1}
              marks={marks}
              {...inputProps}
            />
          </Box>
        );
    }
  };

  return <>{renderResponse(response)}</>;
};

export default RequestResponse;
