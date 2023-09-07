import { getRequestFormslyId } from "@/backend/api/get";
import { MAX_FILE_SIZE, MAX_FILE_SIZE_IN_MB } from "@/utils/constant";
import {
  addCommaToNumber,
  convertTimestampToDate,
  formatTime,
  parseJSONIfValid,
  regExp,
  requestPath,
} from "@/utils/string";
import { FieldTableRow, OptionTableRow } from "@/utils/types";
import {
  ActionIcon,
  FileInput,
  Flex,
  Loader,
  MultiSelect,
  NumberInput,
  Select,
  Switch,
  TextInput,
  Tooltip,
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
import { RequestFormValues } from "./EditRequestPage";

type RequestFormFieldsProps = {
  field: FieldTableRow & {
    options: OptionTableRow[];
  };
  sectionIndex: number;
  fieldIndex: number;
  requisitionFormMethods?: {
    onGeneralNameChange: (index: number, value: string | null) => void;
    onProjectNameChange: (value: string | null) => void;
    onCSICodeChange: (index: number, value: string | null) => void;
  };
  quotationFormMethods?: {
    onItemChange: (
      index: number,
      value: string | null,
      prevValue: string | null
    ) => void;
    supplierSearch?: (value: string) => void;
    isSearching?: boolean;
  };
  rirFormMethods?: {
    onQuantityChange: (index: number, value: number) => void;
  };
  formslyFormName?: string;
  sourcedItemFormMethods?: {
    onProjectSiteChange: () => void;
  };
};

const RequestFormFields = ({
  field,
  sectionIndex,
  fieldIndex,
  requisitionFormMethods,
  quotationFormMethods,
  rirFormMethods,
  formslyFormName = "",
  sourcedItemFormMethods,
}: RequestFormFieldsProps) => {
  const {
    control,
    formState: { errors },
    getValues,
  } = useFormContext<RequestFormValues>();

  const supabaseClient = useSupabaseClient();
  const timeInputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [linkToDisplay, setLinkToDisplay] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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
        `sections.${sectionIndex}.section_field.${fieldIndex}.field_response.0.request_response`
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
            name={`sections.${sectionIndex}.section_field.${fieldIndex}.field_response.0.request_response`}
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
          <Controller
            control={control}
            name={`sections.${sectionIndex}.section_field.${fieldIndex}.field_response.0.request_response`}
            render={({ field: inputField }) => (
              <TextInput
                {...inputField}
                value={parseJSONIfValid(inputField.value)}
                withAsterisk={field.field_is_required}
                {...inputProps}
                error={fieldError}
              />
            )}
          />
        );

      case "TEXTAREA":
        return (
          <Controller
            control={control}
            name={`sections.${sectionIndex}.section_field.${fieldIndex}.field_response.0.request_response`}
            render={({ field: inputField }) => (
              <TextInput
                {...inputField}
                value={parseJSONIfValid(inputField.value)}
                withAsterisk={field.field_is_required}
                {...inputProps}
                error={fieldError}
              />
            )}
          />
        );

      case "NUMBER":
        return (
          <Controller
            control={control}
            name={`sections.${sectionIndex}.section_field.${fieldIndex}.field_response.0.request_response`}
            render={({ field: { value, onChange } }) => (
              <NumberInput
                value={(Number(value) as number) || undefined}
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
            rules={{
              ...fieldRules,
              validate: {
                checkIfZero: (value) =>
                  (requisitionFormMethods || quotationFormMethods) &&
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
            name={`sections.${sectionIndex}.section_field.${fieldIndex}.field_response.0.request_response`}
            render={({ field: { value, onChange } }) => {
              const isBoolean = typeof value === "boolean";
              const checked = isBoolean ? value : value === "true";
              return (
                <Switch
                  checked={checked}
                  onChange={(e) => onChange(e.currentTarget.checked)}
                  {...inputProps}
                  mt="xs"
                  sx={{ label: { cursor: "pointer" } }}
                  error={fieldError}
                />
              );
            }}
            rules={{ ...fieldRules }}
          />
        );

      case "DROPDOWN":
        const dropdownOption = field.options.map((option) => {
          if (quotationFormMethods) {
            const label = option.option_value;
            const matches = regExp.exec(label);
            if (matches) {
              const quantityMatch = matches[1].match(/(\d+)/);
              if (quantityMatch) {
                const newLabel = label.replace(
                  quantityMatch[0],
                  addCommaToNumber(Number(quantityMatch[0]))
                );
                return {
                  value: option.option_value,
                  label: newLabel,
                };
              }
            }
          }

          return {
            value: option.option_value,
            label: option.option_value,
          };
        });
        return (
          <Controller
            control={control}
            name={`sections.${sectionIndex}.section_field.${fieldIndex}.field_response.0.request_response`}
            render={({ field: { value, onChange } }) => {
              return (
                <Select
                  value={parseJSONIfValid(value)}
                  onChange={(value) => {
                    const prevValue = getValues(
                      `sections.${sectionIndex}.section_field.${fieldIndex}.field_response.0.request_response`
                    );
                    onChange(value);

                    if (field.field_name === "General Name") {
                      requisitionFormMethods?.onGeneralNameChange(
                        sectionIndex,
                        value
                      );
                    } else if (field.field_name === "Item") {
                      quotationFormMethods?.onItemChange(
                        sectionIndex,
                        value,
                        prevValue === null ? null : `${prevValue}`
                      );
                    } else if (field.field_name === "CSI Code Description") {
                      requisitionFormMethods?.onCSICodeChange(
                        sectionIndex,
                        value
                      );
                    } else if (field.field_name === "Source Project") {
                      sourcedItemFormMethods?.onProjectSiteChange();
                    } else if (field.field_name === "Requesting Project") {
                      requisitionFormMethods?.onProjectNameChange(value);
                    }
                  }}
                  data={dropdownOption}
                  withAsterisk={field.field_is_required}
                  {...inputProps}
                  clearable
                  error={fieldError}
                  searchable={formslyFormName !== ""}
                  onSearchChange={(value) => {
                    if (
                      quotationFormMethods &&
                      value &&
                      field.field_name === "Supplier"
                    ) {
                      if (timeoutRef.current) {
                        clearTimeout(timeoutRef.current);
                      }

                      timeoutRef.current = setTimeout(() => {
                        quotationFormMethods.supplierSearch &&
                          quotationFormMethods.supplierSearch(value);
                      }, 500);
                    }
                  }}
                  rightSection={
                    quotationFormMethods &&
                    quotationFormMethods.isSearching &&
                    field.field_name === "Supplier" ? (
                      <Loader size={16} />
                    ) : null
                  }
                  nothingFound="Nothing found. Try a different keyword"
                />
              );
            }}
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
            name={`sections.${sectionIndex}.section_field.${fieldIndex}.field_response.0.request_response`}
            render={({ field: { value, onChange } }) => (
              <MultiSelect
                value={parseJSONIfValid(value) as string[]}
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
            name={`sections.${sectionIndex}.section_field.${fieldIndex}.field_response.0.request_response`}
            render={({ field: { value, onChange } }) => (
              <DateInput
                value={convertTimestampToDate(value)}
                onChange={onChange}
                withAsterisk={field.field_is_required}
                {...inputProps}
                icon={<IconCalendar size={16} />}
                error={fieldError}
                minDate={formslyFormName ? new Date() : undefined}
              />
            )}
            rules={{ ...fieldRules }}
          />
        );

      case "TIME":
        return (
          <Controller
            control={control}
            name={`sections.${sectionIndex}.section_field.${fieldIndex}.field_response.0.request_response`}
            render={({ field }) => {
              return (
                <TimeInput
                  {...inputProps}
                  value={formatTime(field.value)}
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
              );
            }}
            rules={{ ...fieldRules }}
          />
        );

      case "FILE":
        return (
          <Controller
            control={control}
            name={`sections.${sectionIndex}.section_field.${fieldIndex}.field_response.0.request_response`}
            render={({ field }) => (
              <Flex w="100%" align="flex-end" gap="xs">
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
                  sx={{ width: "100%" }}
                />
                {field.value ? (
                  <Tooltip
                    label="Open last saved file in new tab"
                    openDelay={200}
                  >
                    <ActionIcon
                      mb={4}
                      p={4}
                      variant="light"
                      color="blue"
                      onClick={() =>
                        window.open(parseJSONIfValid(field.value), "_blank")
                      }
                    >
                      <IconExternalLink />
                    </ActionIcon>
                  </Tooltip>
                ) : null}
              </Flex>
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
