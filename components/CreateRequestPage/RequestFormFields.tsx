import { requestPath } from "@/utils/string";
import { FieldTableRow, OptionTableRow } from "@/utils/types";
import {
  ActionIcon,
  FileInput,
  Flex,
  MultiSelect,
  NumberInput,
  Select,
  Switch,
  TextInput,
  Textarea,
} from "@mantine/core";
import { DateInput, TimeInput } from "@mantine/dates";
import {
  IconCalendar,
  IconClock,
  IconExternalLink,
  IconFile,
  IconLink,
} from "@tabler/icons-react";
import { useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { RequestFormValues } from "./CreateRequestPage";

type RequestFormFieldsProps = {
  field: FieldTableRow & {
    options: OptionTableRow[];
  };
  sectionIndex: number;
  fieldIndex: number;
  orderToPurchaseFormMethods?: {
    onGeneralNameChange: (index: number, value: string | null) => void;
  };
  quotationFormMethods?: {
    onItemChange: (
      index: number,
      value: string | null,
      prevValue: string | null
    ) => void;
  };
  rirFormMethods?: {
    onQuantityChange: (index: number, value: number) => void;
  };
  formslyFormName?: string;
};

const RequestFormFields = ({
  field,
  sectionIndex,
  fieldIndex,
  orderToPurchaseFormMethods,
  quotationFormMethods,
  rirFormMethods,
  formslyFormName = "",
}: RequestFormFieldsProps) => {
  const {
    register,
    control,
    formState: { errors },
    getValues,
  } = useFormContext<RequestFormValues>();

  const timeInputRef = useRef<HTMLInputElement>(null);

  const fieldError =
    errors.sections?.[sectionIndex]?.section_field?.[fieldIndex]?.field_response
      ?.message;

  const inputProps = {
    label: field.field_name,
    description: field.field_description,
    required: field.field_is_required,
    readOnly: field.field_is_read_only,
    variant: field.field_is_read_only ? "filled" : "default",
    error: fieldError,
  };

  const fieldRules = {
    required: {
      value: field.field_is_required,
      message: "This field is required",
    },
  };

  const renderField = (field: RequestFormFieldsProps["field"]) => {
    switch (field.field_type) {
      case "LINK":
        return (
          <Controller
            control={control}
            name={`sections.${sectionIndex}.section_field.${fieldIndex}.field_response`}
            render={({ field: { value } }) => {
              return (
                <Flex w="100%" align="flex-end" gap="xs">
                  <TextInput
                    {...inputProps}
                    error={fieldError}
                    withAsterisk={field.field_is_required}
                    value={`${value}`}
                    icon={<IconLink size={16} />}
                    style={{ flex: 1 }}
                  />
                  <ActionIcon
                    mb={4}
                    p={4}
                    variant="light"
                    color="blue"
                    onClick={() =>
                      window.open(requestPath(`${value}`), "_blank")
                    }
                  >
                    <IconExternalLink />
                  </ActionIcon>
                </Flex>
              );
            }}
            rules={{ ...fieldRules }}
          />
        );
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
            error={fieldError}
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
            error={fieldError}
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
                onChange={(value) => {
                  onChange(value);
                  if (field.field_name === "Quantity" && rirFormMethods) {
                    rirFormMethods.onQuantityChange(
                      sectionIndex,
                      Number(value)
                    );
                  }
                }}
                withAsterisk={field.field_is_required}
                {...inputProps}
                error={fieldError}
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
                mt="xs"
                sx={{ label: { cursor: "pointer" } }}
                error={fieldError}
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
                onChange={(value) => {
                  const prevValue = getValues(
                    `sections.${sectionIndex}.section_field.${fieldIndex}.field_response`
                  );
                  onChange(value);

                  if (field.field_name === "General Name")
                    orderToPurchaseFormMethods?.onGeneralNameChange(
                      sectionIndex,
                      value
                    );
                  if (field.field_name === "Item")
                    quotationFormMethods?.onItemChange(
                      sectionIndex,
                      value,
                      prevValue === null ? null : `${prevValue}`
                    );
                }}
                data={dropdownOption}
                withAsterisk={field.field_is_required}
                {...inputProps}
                clearable
                error={fieldError}
                searchable={formslyFormName !== ""}
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
                error={fieldError}
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
                  icon={<IconCalendar size={16} />}
                  error={fieldError}
                  minDate={formslyFormName ? new Date() : undefined}
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
                {...inputProps}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={timeInputRef}
                error={fieldError}
                rightSection={
                  <ActionIcon
                    onClick={() => timeInputRef.current?.showPicker()}
                  >
                    <IconClock size="1rem" stroke={1.5} />
                  </ActionIcon>
                }
                icon={<IconClock size={16} />}
              />
            )}
            rules={{ ...fieldRules }}
          />
        );
      // case "SLIDER":
      //   const sliderOption = JSON.parse(
      //     field.options.map((option) => option.option_value)[0]
      //   );
      //   const max = Number(sliderOption[1]);
      //   const marks = Array.from({ length: max }, (_, index) => ({
      //     value: index + 1,
      //     label: index + 1,
      //   }));
      //   return (
      //     <Box pb="xl">
      //       <Text weight={600} size={14}>
      //         {field.field_name}{" "}
      //         {field.field_is_required ? (
      //           <Text span c="red">
      //             *
      //           </Text>
      //         ) : (
      //           <></>
      //         )}
      //       </Text>
      //       <Controller
      //         control={control}
      //         name={`sections.${sectionIndex}.section_field.${fieldIndex}.field_response`}
      //         render={({ field: { value, onChange } }) => (
      //           <Slider
      //             value={value as number}
      //             onChange={(value) => onChange(value)}
      //             min={sliderOption[0]}
      //             max={max}
      //             step={1}
      //             marks={marks}
      //             {...inputProps}
      //           />
      //         )}
      //         rules={{ ...fieldRules }}
      //       />
      //     </Box>
      //   );

      case "FILE":
        return (
          <Controller
            control={control}
            name={`sections.${sectionIndex}.section_field.${fieldIndex}.field_response`}
            render={({ field }) => (
              <FileInput
                {...inputProps}
                icon={<IconFile size={16} />}
                clearable
                multiple={false}
                onChange={field.onChange}
                error={fieldError}
                accept={
                  formslyFormName === "Quotation"
                    ? "application/pdf"
                    : undefined
                }
              />
            )}
            rules={{ ...fieldRules }}
          />
        );
    }
  };

  return <>{renderField(field)}</>;
};

export default RequestFormFields;
