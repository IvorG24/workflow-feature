import { FieldType, OptionTableRow } from "@/utils/types";
import {
  MultiSelect,
  NumberInput,
  Select,
  Switch,
  TextInput,
  Textarea,
} from "@mantine/core";
import { DateInput, TimeInput } from "@mantine/dates";
import { IconCalendar, IconClock } from "@tabler/icons-react";

type RequestReponseProps = {
  response: {
    id: string;
    label: string;
    type: FieldType;
    value: string;
    options: OptionTableRow[];
  };
  isRequisitionForm?: boolean;
};

const RequestResponse = ({
  response,
  isRequisitionForm = false,
}: RequestReponseProps) => {
  const inputProps = {
    variant: "filled",
    readOnly: true,
  };

  const renderResponse = (response: RequestReponseProps["response"]) => {
    const parsedValue = response.value === "" ? "" : JSON.parse(response.value);

    switch (response.type) {
      case "TEXT":
        return (
          <TextInput
            label={response.label}
            value={parsedValue}
            {...inputProps}
          />
        );
      case "TEXTAREA":
        return (
          <Textarea
            label={response.label}
            value={parsedValue}
            {...inputProps}
          />
        );
      case "NUMBER":
        return (
          <NumberInput
            label={response.label}
            value={parsedValue}
            {...inputProps}
          />
        );
      case "SWITCH":
        return (
          <Switch
            label={response.label}
            checked={parsedValue}
            {...inputProps}
            mt="xs"
            sx={{ label: { cursor: "pointer" } }}
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
            value={parsedValue}
            {...inputProps}
            clearable
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
            value={parsedValue}
            data={multiselectOption}
            {...inputProps}
          />
        );
      case "DATE":
        return (
          <DateInput
            label={response.label}
            value={parsedValue ? new Date(parsedValue) : undefined}
            {...inputProps}
            icon={<IconCalendar size={16} />}
          />
        );
      case "TIME":
        return (
          <TimeInput
            label={response.label}
            value={parsedValue ? parsedValue : undefined}
            icon={<IconClock size={16} />}
            {...inputProps}
          />
        );
      // case "SLIDER":
      //   const sliderOption = JSON.parse(
      //     response.options.map((option) => option.option_value)[0]
      //   );
      //   const max = Number(sliderOption[1]);
      //   const marks = Array.from({ length: max }, (_, index) => ({
      //     value: index + 1,
      //     label: index + 1,
      //   }));
      //   return (
      //     <Box pb="xl">
      //       <Text weight={600} size={14}>
      //         {response.label}
      //       </Text>
      //       <Slider
      //         defaultValue={Number(response.value)}
      //         min={sliderOption[0]}
      //         max={max}
      //         step={1}
      //         marks={marks}
      //         disabled
      //       />
      //     </Box>
      //   );
    }
  };

  return (
    <>
      {!isRequisitionForm ? renderResponse(response) : null}
      {isRequisitionForm ? (
        <TextInput
          label={response.label}
          value={JSON.parse(response.value)}
          {...inputProps}
        />
      ) : null}
    </>
  );
};

export default RequestResponse;
