import { FieldTableRow, OptionTableRow } from "@/utils/types";
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
import { Controller, useFormContext } from "react-hook-form";
import { RequestFormValues } from "./CreateRequestPage";

type RequestFormFieldsProps = {
  field: FieldTableRow & {
    options: OptionTableRow[];
  };
  sectionIndex: number;
  fieldIndex: number;
};

const RequestFormFields = ({
  field,
  sectionIndex,
  fieldIndex,
}: RequestFormFieldsProps) => {
  const { register, control } = useFormContext<RequestFormValues>();
  const timeInputRef = useRef<HTMLInputElement>(null);

  const inputProps = {
    label: field.field_name,
    description: field.field_description,
    required: field.field_is_required,
  };

  const fieldRules = {
    required: {
      value: field.field_is_required,
      message: "This field is required",
    },
  };

  const renderField = (field: RequestFormFieldsProps["field"]) => {
    switch (field.field_type) {
      case "TEXT":
        return (
          <TextInput
            {...inputProps}
            {...register(
              `sections.${sectionIndex}.section_field.${fieldIndex}.field_response`,
              {
                ...fieldRules,
              }
            )}
            withAsterisk={field.field_is_required}
          />
        );

      case "TEXTAREA":
        return (
          <Textarea
            {...inputProps}
            {...register(
              `sections.${sectionIndex}.section_field.${fieldIndex}.field_response`,
              {
                ...fieldRules,
              }
            )}
            withAsterisk={field.field_is_required}
          />
        );

      case "NUMBER":
        return (
          <Controller
            control={control}
            name={`sections.${sectionIndex}.section_field.${fieldIndex}.field_response`}
            render={({ field: { value, onChange } }) => (
              <NumberInput
                value={value as number}
                onChange={(value) => onChange(value)}
                withAsterisk={field.field_is_required}
                {...inputProps}
              />
            )}
            rules={{ ...fieldRules }}
          />
        );

      case "SWITCH":
        return (
          <Controller
            control={control}
            name={`sections.${sectionIndex}.section_field.${fieldIndex}.field_response`}
            render={({ field: { value, onChange } }) => (
              <Switch
                checked={value as boolean}
                onChange={(e) => onChange(e.currentTarget.checked)}
                {...inputProps}
              />
            )}
            rules={{ ...fieldRules }}
          />
        );

      case "DROPDOWN":
        const dropdownOption = field.options.map((option) => ({
          value: option.option_value,
          label: option.option_value,
        }));
        return (
          <Controller
            control={control}
            name={`sections.${sectionIndex}.section_field.${fieldIndex}.field_response`}
            render={({ field: { value, onChange } }) => (
              <Select
                value={value as string}
                onChange={(value) => onChange(value)}
                data={dropdownOption}
                withAsterisk={field.field_is_required}
                {...inputProps}
              />
            )}
            rules={{ ...fieldRules }}
          />
        );

      case "MULTISELECT":
        const multiselectOption = field.options.map((option) => ({
          value: option.option_value,
          label: option.option_value,
        }));
        return (
          <Controller
            control={control}
            name={`sections.${sectionIndex}.section_field.${fieldIndex}.field_response`}
            render={({ field: { value, onChange } }) => (
              <MultiSelect
                value={value as string[]}
                onChange={(value) => onChange(value)}
                data={multiselectOption}
                withAsterisk={field.field_is_required}
                {...inputProps}
              />
            )}
            rules={{ ...fieldRules }}
          />
        );

      case "DATE":
        return (
          <Controller
            control={control}
            name={`sections.${sectionIndex}.section_field.${fieldIndex}.field_response`}
            render={({ field: { value, onChange } }) => {
              const dateValue = value ? new Date(`${value}`) : undefined;
              return (
                <DateInput
                  value={dateValue}
                  onChange={(value) => onChange(new Date(`${value}`))}
                  withAsterisk={field.field_is_required}
                  {...inputProps}
                />
              );
            }}
            rules={{ ...fieldRules }}
          />
        );

      case "TIME":
        return (
          <Controller
            control={control}
            name={`sections.${sectionIndex}.section_field.${fieldIndex}.field_response`}
            render={({ field }) => (
              <TimeInput
                value={field.value as string}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={timeInputRef}
                rightSection={
                  <ActionIcon
                    onClick={() => timeInputRef.current?.showPicker()}
                  >
                    <IconClock size="1rem" stroke={1.5} />
                  </ActionIcon>
                }
              />
            )}
            rules={{ required: "This field is required" }}
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
            <Text weight={600}>
              {field.field_name}{" "}
              {field.field_is_required ? (
                <Text span c="red">
                  *
                </Text>
              ) : (
                <></>
              )}
            </Text>
            <Controller
              control={control}
              name={`sections.${sectionIndex}.section_field.${fieldIndex}.field_response`}
              render={({ field: { value, onChange } }) => (
                <Slider
                  value={value as number}
                  onChange={(value) => onChange(value)}
                  min={sliderOption[0]}
                  max={max}
                  step={1}
                  marks={marks}
                  {...inputProps}
                />
              )}
              rules={{ ...fieldRules }}
            />
          </Box>
        );
    }
  };

  return <>{renderField(field)}</>;
};

export default RequestFormFields;
