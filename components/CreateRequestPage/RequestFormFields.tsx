import { getRequestFormslyId } from "@/backend/api/get";
import { MAX_FILE_SIZE, MAX_FILE_SIZE_IN_MB } from "@/utils/constant";
import { addDays } from "@/utils/functions";
import { addCommaToNumber, regExp, requestPath } from "@/utils/string";
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
    supplierSearch?: (value: string, index: number) => void;
    isSearchingSupplier?: boolean;
    csiSearch?: (value: string, index: number) => void;
    isSearchingCSI?: boolean;
  };
  subconFormMethods?: {
    onServiceNameChange: (index: number, value: string | null) => void;
    onProjectNameChange: (value: string | null) => void;
    subconSearch?: (value: string) => void;
    isSearching?: boolean;
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
  servicesFormMethods,
  pedEquipmentFormMethods,
  pedPartFormMethods,
  otherExpensesMethods,
  pedConsumableFormMethods,
}: RequestFormFieldsProps) => {
  const {
    register,
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
                      servicesFormMethods?.onProjectNameChange(value);
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
                  if (quotationFormMethods && field.field_name === "Supplier") {
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
                        otherExpensesMethods?.supplierSearch(
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
                  minDate={
                    formslyFormName
                      ? subconFormMethods
                        ? addDays(new Date(), 14)
                        : new Date()
                      : undefined
                  }
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
