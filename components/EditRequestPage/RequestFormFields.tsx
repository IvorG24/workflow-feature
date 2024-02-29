import { getRequestFormslyId } from "@/backend/api/get";
import { useActiveTeam } from "@/stores/useTeamStore";
import { MAX_FILE_SIZE, MAX_FILE_SIZE_IN_MB } from "@/utils/constant";
import { addDays } from "@/utils/functions";
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
  itemFormMethods?: {
    onGeneralNameChange: (index: number, value: string | null) => void;
    onProjectNameChange: (value: string | null) => void;
    onCSICodeChange: (index: number, value: string | null) => void;
    supplierSearch?: (value: string, index: number) => void;
    isSearchingSupplier?: boolean;
    csiSearch?: (value: string, index: number) => void;
    isSearchingCSI?: boolean;
  };
  subconFormMethods?: {
    onServiceNameChange: (index: number, value: string | null) => void;
    onProjectNameChange: (value: string | null) => void;
    subconSearch?: (value: string) => void;
    subconOption?: OptionTableRow[];
    isSearching?: boolean;
  };
  quotationFormMethods?: {
    onItemChange: (
      index: number,
      value: string | null,
      prevValue: string | null
    ) => void;
    supplierSearch?: (value: string) => void;
    supplierOption?: OptionTableRow[];
    isSearching?: boolean;
  };
  rirFormMethods?: {
    onQuantityChange: (index: number, value: number) => void;
  };
  formslyFormName?: string;
  sourcedItemFormMethods?: {
    onProjectSiteChange: () => void;
  };
  referenceOnly?: boolean;
  servicesFormMethods?: {
    onProjectNameChange: (value: string | null) => void;
    onCSIDivisionChange: (index: number, value: string | null) => void;
    onCSICodeChange: (index: number, value: string | null) => void;
    supplierSearch?: (value: string, index: number) => void;
    isSearching?: boolean;
  };
  otherExpensesMethods?: {
    onProjectNameChange: (value: string | null) => void;
    onCSICodeChange: (index: number, value: string | null) => void;
    onCategoryChange: (index: number, value: string | null) => void;
    supplierSearch?: (value: string, index: number) => void;
    isSearching?: boolean;
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
  pedConsumableFormMethods?: {
    onProjectNameChange: (value: string | null) => void;
    onPropertyNumberChange: (value: string | null, index: number) => void;
    onRequestTypeChange: (
      prevValue: string | null,
      value: string | null
    ) => void;
    onGeneralNameChange: (value: string | null, index: number) => void;
  };
};

const RequestFormFields = ({
  field,
  sectionIndex,
  fieldIndex,
  itemFormMethods,
  subconFormMethods,
  quotationFormMethods,
  rirFormMethods,
  formslyFormName = "",
  sourcedItemFormMethods,
  referenceOnly,
  servicesFormMethods,
  pedPartFormMethods,
  pedEquipmentFormMethods,
  otherExpensesMethods,
  pedConsumableFormMethods,
}: RequestFormFieldsProps) => {
  const {
    control,
    formState: { errors },
    getValues,
    setValue,
  } = useFormContext<RequestFormValues>();

  const supabaseClient = useSupabaseClient();
  const timeInputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const team = useActiveTeam();
  const [linkToDisplay, setLinkToDisplay] = useState<string | null>(null);
  const [prevFileLink, setPrevFileLink] = useState<string | null>(null);

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

  const readOnly =
    field.field_name === "Requesting Project" &&
    !referenceOnly &&
    ["Item", "Subcon", "PED Equipment", "PED Part"].includes(formslyFormName)
      ? true
      : field.field_is_read_only;

  const inputProps = {
    label: field.field_name,
    description: field.field_description,
    required: field.field_is_required,
    readOnly: readOnly,
    variant: readOnly ? "filled" : "default",
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
          requestId: parseJSONIfValid(requestId),
        });
        if (fetchedValue) {
          setLinkToDisplay(parseJSONIfValid(fetchedValue));
        }
      }
    };

    const fetchFile = async () => {
      try {
        const fileLink = parseJSONIfValid(
          getValues(
            `sections.${sectionIndex}.section_field.${fieldIndex}.field_response.0.request_response`
          )
        );
        setPrevFileLink(fileLink);
        if (!fileLink) return;

        const response = await fetch(fileLink);
        const blob = await response.blob();
        const file = new File([blob], fileLink, { type: blob.type });
        setValue(
          `sections.${sectionIndex}.section_field.${fieldIndex}.field_response.0.request_response`,
          file as never
        );
      } catch (error) {
        console.error("Error downloading file:", error);
      }
    };

    if (field.field_type === "LINK") {
      fetchLinkToDisplay();
    }

    if (field.field_type === "FILE") {
      fetchFile();
    }
  }, []);

  const checkIfDateIsValid = (value: Date | undefined) => {
    if (!formslyFormName || !value) return value;
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    if (subconFormMethods) {
      return value >= addDays(currentDate, 14) ? value : undefined;
    } else {
      return value >= currentDate ? value : undefined;
    }
  };

  const renderField = (field: RequestFormFieldsProps["field"]) => {
    let fieldOption = field.options;

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
                    value={
                      `${linkToDisplay || parseJSONIfValid(value)}` || undefined
                    }
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
                        requestPath(
                          `${(parseJSONIfValid(value), team.team_name)}`,
                          team.team_name
                        ),
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
          <Controller
            control={control}
            name={`sections.${sectionIndex}.section_field.${fieldIndex}.field_response.0.request_response`}
            render={({ field: inputField }) => (
              <TextInput
                {...inputField}
                value={parseJSONIfValid(inputField.value) || undefined}
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
                value={parseJSONIfValid(inputField.value) || undefined}
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
                precision={2}
              />
            )}
            rules={{
              ...fieldRules,
              validate: {
                checkIfZero: (value) =>
                  (itemFormMethods || quotationFormMethods) &&
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
              const checked = isBoolean
                ? value
                : `${parseJSONIfValid(value)}`.toLowerCase() === "true";
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
        if (field.field_name === "Supplier" && formslyFormName === "Quotation")
          fieldOption = quotationFormMethods?.supplierOption || field.options;

        const dropdownOption = fieldOption.map((option) => {
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
                  value={`${parseJSONIfValid(value)}` || undefined}
                  onChange={(value) => {
                    const prevValue = getValues(
                      `sections.${sectionIndex}.section_field.${fieldIndex}.field_response.0.request_response`
                    );
                    onChange(value);
                    switch (field.field_name) {
                      case "General Name":
                        itemFormMethods?.onGeneralNameChange(
                          sectionIndex,
                          value
                        );
                        pedConsumableFormMethods?.onGeneralNameChange(
                          value,
                          sectionIndex
                        );
                        break;
                      case "Item":
                        quotationFormMethods?.onItemChange(
                          sectionIndex,
                          value,
                          prevValue === null ? null : `${prevValue}`
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
                      case "Source Project":
                        sourcedItemFormMethods?.onProjectSiteChange();
                        break;
                      case "Requesting Project":
                        itemFormMethods?.onProjectNameChange(value);
                        subconFormMethods?.onProjectNameChange(value);
                        otherExpensesMethods?.onProjectNameChange(value);
                        pedPartFormMethods?.onProjectNameChange(value);
                        pedEquipmentFormMethods?.onProjectNameChange(value);
                        pedConsumableFormMethods?.onProjectNameChange(value);
                        break;
                      case "Service Name":
                        subconFormMethods?.onServiceNameChange(
                          sectionIndex,
                          value
                        );
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
                        pedConsumableFormMethods?.onPropertyNumberChange(
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
                        pedConsumableFormMethods?.onRequestTypeChange(
                          prevValue as string | null,
                          value
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
                  onSearchChange={(value) => {
                    if (
                      quotationFormMethods &&
                      field.field_name === "Supplier"
                    ) {
                      if (timeoutRef.current) {
                        clearTimeout(timeoutRef.current);
                      }

                      timeoutRef.current = setTimeout(() => {
                        quotationFormMethods.supplierSearch &&
                          quotationFormMethods.supplierSearch(value);
                      }, 500);
                    } else if (field.field_name === "Preferred Supplier") {
                      if (timeoutRef.current) {
                        clearTimeout(timeoutRef.current);
                      }
                      timeoutRef.current = setTimeout(() => {
                        itemFormMethods?.supplierSearch &&
                          itemFormMethods.supplierSearch(value, sectionIndex);
                        otherExpensesMethods?.supplierSearch &&
                          otherExpensesMethods.supplierSearch(
                            value,
                            sectionIndex
                          );
                      }, 500);
                    } else if (
                      itemFormMethods &&
                      field.field_name === "CSI Code Description"
                    ) {
                      if (timeoutRef.current) {
                        clearTimeout(timeoutRef.current);
                      }

                      timeoutRef.current = setTimeout(() => {
                        itemFormMethods.csiSearch &&
                          itemFormMethods.csiSearch(value, sectionIndex);
                      }, 500);
                    }
                  }}
                  rightSection={
                    (quotationFormMethods &&
                      quotationFormMethods.isSearching &&
                      field.field_name === "Supplier") ||
                    (itemFormMethods &&
                      itemFormMethods.isSearchingSupplier &&
                      field.field_name === "Preferred Supplier") ||
                    (itemFormMethods &&
                      itemFormMethods.isSearchingCSI &&
                      field.field_name === "CSI Code Description") ||
                    (otherExpensesMethods &&
                      otherExpensesMethods.isSearching &&
                      field.field_name === "Preferred Supplier") ? (
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
        if (
          field.field_name === "Nominated Subcon" &&
          formslyFormName === "Subcon"
        )
          fieldOption = subconFormMethods?.subconOption || field.options;
        const multiselectOption = fieldOption.map((option) => ({
          value: option.option_value,
          label: option.option_value,
        }));
        return (
          <Controller
            control={control}
            name={`sections.${sectionIndex}.section_field.${fieldIndex}.field_response.0.request_response`}
            render={({ field: { value, onChange } }) => (
              <MultiSelect
                value={(parseJSONIfValid(value) as string[]) || undefined}
                onChange={(value) => onChange(value)}
                data={multiselectOption}
                withAsterisk={field.field_is_required}
                {...inputProps}
                error={fieldError}
                onSearchChange={(value) => {
                  if (
                    subconFormMethods &&
                    value &&
                    field.field_name === "Nominated Subcon"
                  ) {
                    if (timeoutRef.current) {
                      clearTimeout(timeoutRef.current);
                    }

                    timeoutRef.current = setTimeout(() => {
                      subconFormMethods.subconSearch &&
                        subconFormMethods.subconSearch(value);
                    }, 500);
                  }
                }}
                rightSection={
                  subconFormMethods &&
                  subconFormMethods.isSearching &&
                  field.field_name === "Nominated Subcon" ? (
                    <Loader size={16} />
                  ) : null
                }
                searchable={
                  subconFormMethods && field.field_name === "Nominated Subcon"
                }
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
            name={`sections.${sectionIndex}.section_field.${fieldIndex}.field_response.0.request_response`}
            render={({ field: { value, onChange } }) => (
              <DateInput
                value={checkIfDateIsValid(convertTimestampToDate(value))}
                onChange={onChange}
                withAsterisk={field.field_is_required}
                {...inputProps}
                icon={<IconCalendar size={16} />}
                error={fieldError}
                minDate={
                  formslyFormName
                    ? subconFormMethods
                      ? addDays(new Date(), 14)
                      : new Date()
                    : undefined
                }
                valueFormat="YYYY-MM-DD"
              />
            )}
            rules={{
              ...fieldRules,
            }}
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
                  defaultValue={field.value}
                  value={
                    typeof field.value === "string" ? undefined : field.value
                  }
                  clearable
                  multiple={false}
                  onChange={field.onChange}
                  error={fieldError}
                  accept={
                    formslyFormName === "Quotation"
                      ? "application/pdf"
                      : undefined
                  }
                  sx={{ width: prevFileLink ? "96%" : "100%" }}
                />
                {parseJSONIfValid(field.value) ? (
                  <Tooltip
                    label="Open last saved file in new tab"
                    openDelay={200}
                  >
                    <ActionIcon
                      mb={4}
                      p={4}
                      variant="light"
                      color="blue"
                      onClick={() => window.open(`${prevFileLink}`, "_blank")}
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
                  return formattedValue.size !== undefined
                    ? formattedValue.size <= MAX_FILE_SIZE ||
                        `File exceeds ${MAX_FILE_SIZE_IN_MB}mb`
                    : true;
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
