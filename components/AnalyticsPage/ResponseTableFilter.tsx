import { OptionType } from "@/utils/types";
import { Group, Select } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { Controller, useFormContext } from "react-hook-form";

type FilterChartValues = {
  memberFilter: string;
  stepFilter: string;
  startDate: Date | null;
  endDate: Date | null;
};

type Props = {
  stepOptions: OptionType[];
  memberOptions: OptionType[];
  handleFetchResponseTable: (data: FilterChartValues) => void;
};

const ResponseTableFilter = ({
  stepOptions,
  memberOptions,
  handleFetchResponseTable,
}: Props) => {
  const { control, getValues } = useFormContext<FilterChartValues>();

  return (
    <Group grow>
      <Controller
        name="memberFilter"
        control={control}
        defaultValue={memberOptions[0].value}
        render={({ field }) => (
          <Select
            label="HR Member"
            placeholder="Select HR Member"
            data={memberOptions}
            {...field}
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
              handleFetchResponseTable(getValues()); // Trigger fetch
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
              placeholder="Pick a start date"
              {...field}
              onChange={(value) => {
                field.onChange(value);
                handleFetchResponseTable(getValues()); // Trigger fetch
              }}
            />
          )}
        />

        <Controller
          name="endDate"
          control={control}
          render={({ field }) => (
            <DatePickerInput
              label="End Date"
              placeholder="Pick an end date"
              {...field}
              onChange={(value) => {
                field.onChange(value);
                handleFetchResponseTable(getValues()); // Trigger fetch
              }}
            />
          )}
        />
      </Group>
    </Group>
  );
};

export default ResponseTableFilter;
