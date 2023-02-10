/* eslint-disable react/display-name */
import { RequestFieldType } from "@/utils/types";
import {
  Divider,
  Group,
  MultiSelect,
  NumberInput,
  Select,
  Text,
  TextInput,
} from "@mantine/core";
import { DatePicker, DateRangePicker } from "@mantine/dates";
import { forwardRef } from "react";

export type PolymorphicFieldInputProps = {
  id: string;
  type: RequestFieldType;
  label?: string;
  value?: string;
  options?: string[];
  optionTooltipList?: string[];
  isRequired?: boolean;
  isDisabled?: boolean;
  handleUpdateFieldValue?: (id: string, value: string) => void;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface ItemProps extends React.ComponentPropsWithoutRef<"div"> {
  value: string;
  description: string;
  index: number;
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ index, value, description, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others} key={index}>
      <Group noWrap>
        <div>
          <Text size="sm">{value}</Text>
          <Text size="xs" opacity={0.65}>
            {description}
          </Text>
        </div>
      </Group>
    </div>
  )
);

// eslint-disable-next-line react/display-name
function PolymorphicFieldInput({
  id,
  type,
  label,
  value,
  handleUpdateFieldValue,
  options,
  optionTooltipList,
  isRequired,
  isDisabled,
}: PolymorphicFieldInputProps) {
  const requiredMessage = "This field is required.";

  const optionList: ItemProps[] =
    options?.map((option, index) => ({
      value: option,
      label: option,
      description: optionTooltipList ? optionTooltipList[index] : "",
      index,
    })) || [];

  // return a mantine component based on type.
  const section = <Divider size="xs" label={label} />;

  const repeatableSection = <Divider size="xs" label={label} />;

  const textInput = type === "text" && (
    <TextInput
      size="xs"
      placeholder={label}
      value={value}
      onChange={(e) => {
        if (handleUpdateFieldValue)
          handleUpdateFieldValue(id, e.currentTarget.value);
      }}
      required={isRequired}
      withAsterisk={isRequired}
      label={isRequired ? `${requiredMessage}` : undefined}
      disabled={isDisabled}
    />
  );
  const numberInput = type === "number" && (
    <NumberInput
      placeholder={label}
      size="xs"
      value={value ? Number(value) : undefined}
      withAsterisk={isRequired}
      required={isRequired}
      label={isRequired ? `${requiredMessage}` : undefined}
      onChange={(value) => {
        if (handleUpdateFieldValue)
          handleUpdateFieldValue(id, JSON.stringify(value));
      }}
      disabled={isDisabled}
    />
  );
  const dateInput = type === "date" && (
    <DatePicker
      placeholder={label}
      // placeholder="Pick date"
      size="xs"
      value={value ? new Date(value) : undefined}
      withAsterisk={isRequired}
      required={isRequired}
      label={isRequired ? `${requiredMessage}` : undefined}
      onChange={(value) => {
        if (handleUpdateFieldValue)
          handleUpdateFieldValue(id, value ? value.toJSON() : "");
      }}
      disabled={isDisabled}
    />
  );

  const dateRangePickerInput = type === "daterange" && (
    <DateRangePicker
      placeholder={label}
      // placeholder="Pick date range"
      withAsterisk={isRequired}
      required={isRequired}
      label={isRequired ? `${requiredMessage}` : undefined}
      size="xs"
      value={value as unknown as [Date, Date]}
      onChange={(value) => {
        if (handleUpdateFieldValue)
          handleUpdateFieldValue(id, value as unknown as string);
      }}
      disabled={isDisabled}
    />
  );

  const selectInput = type === "select" && (
    <Select
      size="xs"
      placeholder={label}
      value={value || ""}
      withAsterisk={isRequired}
      required={isRequired}
      label={isRequired ? `${requiredMessage}` : undefined}
      searchable
      itemComponent={SelectItem}
      data={optionList}
      onChange={(value) => {
        if (handleUpdateFieldValue) handleUpdateFieldValue(id, value as string);
      }}
      disabled={isDisabled}
    />
  );

  const multipleSelectInput = type === "multiple" && (
    <MultiSelect
      searchable
      required={isRequired}
      withAsterisk={isRequired}
      label={isRequired ? `${requiredMessage}` : undefined}
      itemComponent={SelectItem}
      data={optionList}
      placeholder={label}
      value={value ? JSON.parse(value) : []}
      onChange={(value) => {
        if (handleUpdateFieldValue)
          handleUpdateFieldValue(id, JSON.stringify(value));
      }}
      disabled={isDisabled}
    />
  );

  return (
    <Group>
      {/* <Text size="xs">{label}</Text> */}
      {type === "section" && section}
      {type === "repeatable_section" && repeatableSection}
      {textInput}
      {numberInput}
      {dateInput}
      {dateRangePickerInput}
      {selectInput}
      {multipleSelectInput}
    </Group>
  );
}
// eslint-disable-next-line react/display-name
export default PolymorphicFieldInput;
