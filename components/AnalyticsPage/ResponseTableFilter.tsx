import { OptionType } from "@/utils/types";
import { Group, Select } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { Controller, useFormContext } from "react-hook-form";
import { FilterChartValues } from "./ResponseAnalytics";

type Props = {
  stepOptions: OptionType[];
  memberOptions: OptionType[];
  handleFetchResponseTable: (data: FilterChartValues) => void;
};

const frequencyOptions: OptionType[] = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Yearly", value: "yearly" },
];

const ResponseTableFilter = ({
  stepOptions,
  memberOptions,
  handleFetchResponseTable,
}: Props) => {
  const { control, getValues, watch } = useFormContext<FilterChartValues>();
  const frequencyFilter = watch("frequencyFilter");

  return (
    <Group grow>
      <Controller
        name="memberFilter"
        control={control}
        render={({ field }) => (
          <Select
            label="HR Member"
            placeholder="Select HR Member"
            data={memberOptions}
            {...field}
            onChange={(value) => {
              field.onChange(value);
              handleFetchResponseTable(getValues());
            }}
          />
        )}
      />

      <Controller
        name="stepFilter"
        control={control}
        defaultValue={stepOptions[0].value}
        render={({ field }) => (
          <Select
            label="Step"
            placeholder="Select Step"
            data={stepOptions}
            {...field}
            onChange={(value) => {
              field.onChange(value);
              handleFetchResponseTable(getValues());
            }}
          />
        )}
      />

      <Controller
        name="frequencyFilter"
        control={control}
        defaultValue={frequencyOptions[2].value}
        render={({ field }) => (
          <Select
            label="Frequency"
            placeholder="Select Frequency"
            data={frequencyOptions}
            {...field}
            onChange={(value) => {
              field.onChange(value);
              handleFetchResponseTable(getValues());
            }}
          />
        )}
      />

      <Group grow>
        <Controller
          name="startDate"
          control={control}
          render={({ field }) => (
            <DatePickerInput
              label="Start Date"
              clearable
              firstDayOfWeek={6}
              placeholder="Pick a start date"
              {...field}
              onChange={(value) => {
                field.onChange(value);
                handleFetchResponseTable(getValues());
              }}
            />
          )}
        />

        <Controller
          name="endDate"
          control={control}
          render={({ field }) => (
            <DatePickerInput
              clearable
              label="End Date"
              placeholder="Pick an end date"
              {...field}
              onChange={(value) => {
                field.onChange(value);
                handleFetchResponseTable(getValues());
              }}
            />
          )}
        />
      </Group>
    </Group>
  );
};

export default ResponseTableFilter;
