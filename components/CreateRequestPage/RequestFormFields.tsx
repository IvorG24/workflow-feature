import { getRequestFormslyId } from "@/backend/api/get";
import { useActiveTeam } from "@/stores/useTeamStore";
import {
  MAX_FILE_SIZE,
  MAX_FILE_SIZE_IN_MB,
  SELECT_OPTION_LIMIT,
} from "@/utils/constant";
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
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import {
  IconCalendar,
  IconClock,
  IconExternalLink,
  IconFile,
  IconLink,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { RequestFormValues } from "./CreateRequestPage";

type RequestFormFieldsProps = {
  field: FieldTableRow & {
    options: OptionTableRow[];
  };
  sectionIndex: number;
  fieldIndex: number;
  itemFormMethods?: {
    onGeneralNameChange: (index: number, value: string | null) => void;
    onProjectNameChange: (value: string | null) => void;
    onCSICodeChange: (index: number, value: string | null) => void;
  };
  formslyFormName?: string;
  servicesFormMethods?: {
    onProjectNameChange: (value: string | null) => void;
    onCSIDivisionChange: (index: number, value: string | null) => void;
    onCSICodeChange: (index: number, value: string | null) => void;
  };
  otherExpensesMethods?: {
    onProjectNameChange: (value: string | null) => void;
    onCSICodeChange: (index: number, value: string | null) => void;
    onCategoryChange: (index: number, value: string | null) => void;
  };
  pedEquipmentFormMethods?: {
    onCategoryChange: (value: string | null, index: number) => void;
    onProjectNameChange: (value: string | null) => void;
    onEquipmentNameChange: (value: string | null, index: number) => void;
    onBrandChange: (value: string | null, index: number) => void;
  };
  pedPartFormMethods?: {
    onProjectNameChange: (value: string | null) => void;
    onCategoryChange: (value: string | null) => void;
    onEquipmentNameChange: (value: string | null) => void;
    onPropertyNumberChange: (value: string | null) => void;
    onTypeOfOrderChange: (
      prevValue: string | null,
      value: string | null
    ) => void;
    onGeneralItemNameChange: (value: string | null, index: number) => void;
    onComponentCategoryChange: (value: string | null, index: number) => void;
    onBrandChange: (value: string | null, index: number) => void;
    onModelChange: (value: string | null, index: number) => void;
    onPartNumberChange: (value: string | null, index: number) => void;
  };
  pedItemFormMethods?: {
    onProjectNameChange: (value: string | null) => void;
    onPropertyNumberChange: (value: string | null, index: number) => void;
    onRequestTypeChange: (
      prevValue: string | null,
      value: string | null
    ) => void;
    onGeneralNameChange: (value: string | null, index: number) => void;
  };
  paymentRequestFormMethods?: {
    onProjectNameChange: (value: string | null) => void;
    onRequestTypeChange: (value: string | null, index: number) => void;
  };
};

const RequestFormFields = ({
  field,
  sectionIndex,
  fieldIndex,
  itemFormMethods,
  formslyFormName = "",
  servicesFormMethods,
  pedEquipmentFormMethods,
  pedPartFormMethods,
  otherExpensesMethods,
  pedItemFormMethods,
  paymentRequestFormMethods,
}: RequestFormFieldsProps) => {
  const {
    register,
    control,
    formState: { errors },
    getValues,
  } = useFormContext<RequestFormValues>();
  const team = useActiveTeam();

  const supabaseClient = useSupabaseClient();
  const timeInputRef = useRef<HTMLInputElement>(null);

  const [linkToDisplay, setLinkToDisplay] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchLinkToDisplay = async () => {
      const requestId = getValues(
        `sections.${sectionIndex}.section_field.${fieldIndex}.field_response`
      );
      if (requestId) {
        const fetchedValue = await getRequestFormslyId(supabaseClient, {
          requestId: requestId as string,
        });
        if (fetchedValue) {
          setLinkToDisplay(fetchedValue);
        }
      }
    };

    if (field.field_type === "LINK") {
      fetchLinkToDisplay();
    }
  }, []);

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
                    value={`${linkToDisplay || value}`}
                    icon={<IconLink size={16} />}
                    style={{ flex: 1 }}
                  />
                  <ActionIcon
                    mb={4}
                    p={4}
                    variant="light"
                    color="blue"
                    onClick={() =>
                      window.open(
                        requestPath(`${value}`, team.team_name),
                        "_blank"
                      )
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
                onChange={onChange}
                withAsterisk={field.field_is_required}
                {...inputProps}
                error={fieldError}
                precision={2}
              />
            )}
            rules={{
              ...fieldRules,
              validate: {
                checkIfZero: (value) =>
                  itemFormMethods &&
                  field.field_name === "Quantity" &&
                  value === 0
                    ? "Quantity value is required"
                    : true,
              },
            }}
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
        const dropdownOption = field.options.map((option) => {
          return {
            value: option.option_value,
            label: option.option_value,
          };
        });

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

                  switch (field.field_name) {
                    case "General Name":
                      itemFormMethods?.onGeneralNameChange(sectionIndex, value);
                      pedItemFormMethods?.onGeneralNameChange(
                        value,
                        sectionIndex
                      );
                      break;

                    case "CSI Code Description":
                      itemFormMethods &&
                        itemFormMethods.onCSICodeChange(sectionIndex, value);
                      servicesFormMethods &&
                        servicesFormMethods.onCSICodeChange(
                          sectionIndex,
                          value
                        );
                      otherExpensesMethods &&
                        otherExpensesMethods.onCSICodeChange(
                          sectionIndex,
                          value
                        );
                      break;

                    case "Requesting Project":
                      itemFormMethods?.onProjectNameChange(value);
                      servicesFormMethods?.onProjectNameChange(value);
                      otherExpensesMethods?.onProjectNameChange(value);
                      pedPartFormMethods?.onProjectNameChange(value);
                      pedEquipmentFormMethods?.onProjectNameChange(value);
                      pedItemFormMethods?.onProjectNameChange(value);
                      paymentRequestFormMethods?.onProjectNameChange(value);
                      break;
                    case "CSI Division":
                      servicesFormMethods?.onCSIDivisionChange(
                        sectionIndex,
                        value
                      );
                      break;
                    case "Category":
                      otherExpensesMethods?.onCategoryChange(
                        sectionIndex,
                        value
                      );
                      pedEquipmentFormMethods?.onCategoryChange(
                        value,
                        sectionIndex
                      );
                      pedPartFormMethods?.onCategoryChange(value);
                      break;
                    case "Type of Order":
                      pedPartFormMethods?.onTypeOfOrderChange(
                        prevValue as string | null,
                        value
                      );
                      break;
                    case "Equipment Property Number":
                      pedPartFormMethods?.onPropertyNumberChange(value);
                      pedItemFormMethods?.onPropertyNumberChange(
                        value,
                        sectionIndex
                      );
                      break;
                    case "Equipment Name":
                      pedPartFormMethods?.onEquipmentNameChange(value);
                      pedEquipmentFormMethods?.onEquipmentNameChange(
                        value,
                        sectionIndex
                      );
                      break;
                    case "General Item Name":
                      pedPartFormMethods?.onGeneralItemNameChange(
                        value,
                        sectionIndex
                      );
                      break;
                    case "Component Category":
                      pedPartFormMethods?.onComponentCategoryChange(
                        value,
                        sectionIndex
                      );
                      break;
                    case "Brand":
                      pedPartFormMethods?.onBrandChange(value, sectionIndex);
                      pedEquipmentFormMethods?.onBrandChange(
                        value,
                        sectionIndex
                      );
                      break;
                    case "Model":
                      pedPartFormMethods?.onModelChange(value, sectionIndex);
                      break;
                    case "Part Number":
                      pedPartFormMethods?.onPartNumberChange(
                        value,
                        sectionIndex
                      );
                      break;
                    case "Request Type":
                      pedItemFormMethods?.onRequestTypeChange(
                        prevValue as string | null,
                        value
                      );
                      paymentRequestFormMethods?.onRequestTypeChange(
                        value,
                        sectionIndex
                      );
                      break;
                  }
                }}
                data={dropdownOption}
                withAsterisk={field.field_is_required}
                {...inputProps}
                clearable
                error={fieldError}
                searchable={formslyFormName !== ""}
                nothingFound="Nothing found. Try a different keyword"
                limit={SELECT_OPTION_LIMIT}
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
                nothingFound="Nothing found. Try a different keyword"
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
                  valueFormat="YYYY-MM-DD"
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
            rules={{
              ...fieldRules,
              validate: {
                fileSize: (value) => {
                  if (!value) return true;
                  const formattedValue = value as File;
                  return formattedValue.size <= MAX_FILE_SIZE
                    ? true
                    : `File exceeds ${MAX_FILE_SIZE_IN_MB}mb`;
                },
              },
            }}
          />
        );
    }
  };

  return <>{renderField(field)}</>;
};

export default RequestFormFields;
