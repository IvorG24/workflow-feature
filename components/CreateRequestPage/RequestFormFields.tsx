import { getRequestFormslyId } from "@/backend/api/get";
import { useActiveTeam } from "@/stores/useTeamStore";
import {
  MAX_FILE_SIZE,
  MAX_FILE_SIZE_IN_MB,
  SELECT_OPTION_LIMIT,
} from "@/utils/constant";
import { parseJSONIfValid, requestPath } from "@/utils/string";
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
import { Controller, useFormContext, useWatch } from "react-hook-form";
import isURL from "validator/lib/isURL";
import { RequestFormValues } from "./CreateRequestPage";
import CurrencyFormField from "./SpecialField/CurrencyFormField";

type RequestFormFieldsProps = {
  field: FieldTableRow & {
    options: OptionTableRow[];
  } & {
    field_section_duplicatable_id: string | undefined;
    field_prefix?: string | null;
  };
  sectionIndex: number;
  fieldIndex: number;
  itemFormMethods?: {
    onGeneralNameChange: (index: number, value: string | null) => void;
    onProjectNameChange: (value: string | null) => void;
  };
  formslyFormName?: string;
  servicesFormMethods?: {
    onProjectNameChange: (value: string | null) => void;
  };
  otherExpensesMethods?: {
    onProjectNameChange: (value: string | null) => void;
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
    onGeneralItemNameChange: (
      value: string | null,
      index: number,
      editDetails?: {
        fieldId: string;
        dupId: string | undefined;
        response: string;
      }
    ) => void;
    onComponentCategoryChange: (
      value: string | null,
      index: number,
      editDetails?: {
        fieldId: string;
        dupId: string | undefined;
        response: string;
      }
    ) => void;
    onBrandChange: (
      value: string | null,
      index: number,
      editDetails?: {
        fieldId: string;
        dupId: string | undefined;
        response: string;
      }
    ) => void;
    onModelChange: (
      value: string | null,
      index: number,
      editDetails?: {
        fieldId: string;
        dupId: string | undefined;
        response: string;
      }
    ) => void;
    onPartNumberChange: (value: string | null, index: number) => void;
    onGeneralItemNameOpen?: (index: number) => void;
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
  isEdit?: boolean;
  isLoading: boolean | undefined;
  itAssetRequestFormMethods?: {
    onProjectNameChange: (value: string | null) => void;
    onGeneralNameChange: (index: number, value: string | null) => void;
  };
  currencyOptionList?: { value: string; label: string }[];
  liquidationReimbursementFormMethods?: {
    onProjectNameChange: (value: string | null) => void;
    onRequestTypeChange: (value: string | null) => void;
    onDepartmentChange: (value: string | null) => void;
  };
  personnelTransferRequisitionMethods?: {
    onTypeOfTransferChange: (value: string | null) => void;
    onMannerOfTransferChange: (
      value: string | null,
      prevValue: string | null
    ) => void;
    onFromChange: (value: string | null) => void;
    onToChange: (value: string | null) => void;
    onPurposeChange: (value: string | null, prevValue: string | null) => void;
    onEquipmentCodeChange: (value: string | null, index: number) => void;
    onEmployeeNumberChange: (value: string | null, index: number) => void;
    onITAssetBooleanChange: (value: boolean, index: number) => void;
    onEmployeeStatusChange: (
      value: string | null,
      prevValue: string | null,
      index: number
    ) => void;
    onPhaseOfWorkChange: (
      value: string | null,
      sectionIndex: number,
      fieldIndex: number
    ) => void;
  };
  workingAdvanceVoucherFormMethods?: {
    onProjectNameChange: (value: string | null) => void;
    onWorkingAdvanceVoucherBooleanChange: (
      value: boolean,
      sectionIndex: number
    ) => void;
    onEmployeeNumberChange: (
      value: string | null,
      sectionIndex: number
    ) => void;
  };
  equipmentServiceReportMethods?: {
    onProjectNameChange: (value: string | null) => void;
    onCategoryChange: (value: string | null) => void;
    onEquipmentTypeChange: (value: string | null) => void;
    onPropertyNumberChange: (value: string | null) => void;
    onActionTypeChange: (
      value: string | null,
      prevValue: string | null
    ) => void;
    onActionPlanBlur: (value: string | null, index: number) => void;
    onGeneralItemNameChange: (
      value: string | null,
      index: number,
      editDetails?: {
        fieldId: string;
        dupId: string | undefined;
        response: string;
      }
    ) => void;
    onComponentCategoryChange: (
      value: string | null,
      index: number,
      editDetails?: {
        fieldId: string;
        dupId: string | undefined;
        response: string;
      }
    ) => void;
    onBrandChange: (
      value: string | null,
      index: number,
      editDetails?: {
        fieldId: string;
        dupId: string | undefined;
        response: string;
      }
    ) => void;
    onModelChange: (
      value: string | null,
      index: number,
      editDetails?: {
        fieldId: string;
        dupId: string | undefined;
        response: string;
      }
    ) => void;
    onPartNumberChange: (value: string | null, index: number) => void;
    onQuantityBlur: () => void;
  };
  requestForPaymentFormMethods?: {
    onProjectNameChange: (value: string | null) => void;
    onDepartmentChange: (
      value: string | null,
      prevValue: string | null
    ) => void;
    onPayeeTypeChange: (value: string | null, prevValue: string | null) => void;
    onEmployeeNumberChange: (value: string | null) => void;
    onPurposePlanChange: (
      value: string | null,
      prevValue: string | null
    ) => void;
    onChargeToChange: (value: string | null) => void;
    onAmountBlur: (value: string | null, index: number) => void;
    onModeOfPaymentChange: (value: string | null, index: number) => void;
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
  itAssetRequestFormMethods,
  isEdit,
  isLoading,
  currencyOptionList,
  liquidationReimbursementFormMethods,
  personnelTransferRequisitionMethods,
  workingAdvanceVoucherFormMethods,
  equipmentServiceReportMethods,
  requestForPaymentFormMethods,
}: RequestFormFieldsProps) => {
  const {
    register,
    control,
    formState: { errors },
    getValues,
    setValue,
  } = useFormContext<RequestFormValues>();

  const team = useActiveTeam();
  const dropdownOptionValue = useWatch({
    control,
    name: `sections.${sectionIndex}.section_field.${fieldIndex}.field_option`,
  });

  const supabaseClient = useSupabaseClient();
  const timeInputRef = useRef<HTMLInputElement>(null);

  const [linkToDisplay, setLinkToDisplay] = useState<string | null>(null);
  const [prevFileLink, setPrevFileLink] = useState<string | null>(null);
  const [currencyFieldValue, setCurrencyFieldValue] = useState<string | null>(
    field.field_prefix ?? "PHP"
  );

  const fieldError =
    errors.sections?.[sectionIndex]?.section_field?.[fieldIndex]?.field_response
      ?.message;

  const inputProps = {
    label: field.field_name,
    required: field.field_is_required,
    variant: field.field_is_read_only ? "filled" : "default",
    error: fieldError,
  };

  const fieldRules = {
    required: {
      value: field.field_type !== "SWITCH" && field.field_is_required,
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

    const fetchFile = async () => {
      try {
        const fileLink = parseJSONIfValid(
          `${getValues(
            `sections.${sectionIndex}.section_field.${fieldIndex}.field_response`
          )}`
        );
        setPrevFileLink(fileLink);

        if (isURL(fileLink)) {
          const response = await fetch(fileLink);
          const blob = await response.blob();
          const file = new File([blob], fileLink, { type: blob.type });
          setValue(
            `sections.${sectionIndex}.section_field.${fieldIndex}.field_response`,
            file as never
          );
        }
      } catch (error) {
        console.error("Error downloading file:", error);
      }
    };

    if (field.field_type === "LINK") {
      fetchLinkToDisplay();
    }

    if (field.field_type === "FILE" && isEdit !== undefined) {
      fetchFile();
    }
  }, []);

  useEffect(() => {
    if (
      field.field_type === "NUMBER" &&
      field.field_special_field_template_id
    ) {
      setValue(
        `sections.${sectionIndex}.section_field.${fieldIndex}.field_prefix`,
        field.field_prefix ?? "PHP"
      );
    }
  }, [field]);

  const renderField = (field: RequestFormFieldsProps["field"]) => {
    switch (field.field_type) {
      case "LINK":
        return (
          <Controller
            control={control}
            name={`sections.${sectionIndex}.section_field.${fieldIndex}.field_response`}
            render={({ field: { value, onChange } }) => {
              return (
                <Flex w="100%" align="flex-end" gap="xs">
                  <TextInput
                    {...inputProps}
                    error={fieldError}
                    withAsterisk={field.field_is_required}
                    value={`${linkToDisplay || value || ""}`}
                    icon={<IconLink size={16} />}
                    style={{ flex: 1 }}
                    onChange={onChange}
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
            rules={{
              ...fieldRules,
              validate: {
                isUrl: (value) => {
                  if (linkToDisplay) {
                    return true;
                  }

                  return isURL(`${value}`) || "Link is invalid";
                },
              },
            }}
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
            readOnly={field.field_is_read_only || isLoading}
            rightSection={isLoading && <Loader size={16} />}
            onBlur={(e) => {
              const value = e.currentTarget.value;
              switch (field.field_name) {
                case "Employee No. (HRIS)":
                  personnelTransferRequisitionMethods &&
                    personnelTransferRequisitionMethods.onEmployeeNumberChange(
                      value,
                      sectionIndex
                    );
                  requestForPaymentFormMethods &&
                    requestForPaymentFormMethods.onEmployeeNumberChange(value);

                  workingAdvanceVoucherFormMethods &&
                    workingAdvanceVoucherFormMethods.onEmployeeNumberChange(
                      value,
                      sectionIndex
                    );
                  break;

                case "Action Plan":
                  equipmentServiceReportMethods?.onActionPlanBlur(
                    value,
                    sectionIndex
                  );
                  break;
              }
            }}
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
            autosize
            minRows={4}
            maxRows={12}
            withAsterisk={field.field_is_required}
          />
        );

      case "NUMBER":
        if (field.field_special_field_template_id) {
          return (
            <Controller
              control={control}
              name={`sections.${sectionIndex}.section_field.${fieldIndex}.field_response`}
              render={({ field: { value, onChange } }) => (
                <CurrencyFormField
                  label={inputProps.label}
                  selectInputProps={{
                    data: currencyOptionList ?? [],
                    value: currencyFieldValue,
                    onChange: (value) => {
                      setCurrencyFieldValue(value);
                      setValue(
                        `sections.${sectionIndex}.section_field.${fieldIndex}.field_prefix`,
                        value ?? ""
                      );
                    },
                  }}
                  numberInputProps={{
                    value: value as number,
                    onChange: onChange,
                    withAsterisk: inputProps.required,
                    required: inputProps.required,
                    error: inputProps.error,
                  }}
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
                  checkIfPositiveInteger: (value) =>
                    field.field_name === "Quantity" && Number(value) < 0
                      ? "Quantity must be a positive integer."
                      : true,
                },
              }}
            />
          );
        } else {
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
                  onBlur={() => {
                    switch (field.field_name) {
                      case "Quantity":
                        equipmentServiceReportMethods?.onQuantityBlur();
                        break;
                      case "Amount":
                        requestForPaymentFormMethods?.onAmountBlur(
                          value as string | null,
                          sectionIndex
                        );
                        break;
                    }
                  }}
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
                  checkIfPositiveInteger: (value) =>
                    field.field_name === "Quantity" && Number(value) < 0
                      ? "Quantity must be a positive integer."
                      : true,
                },
              }}
            />
          );
        }

      case "SWITCH":
        return (
          <Controller
            control={control}
            name={`sections.${sectionIndex}.section_field.${fieldIndex}.field_response`}
            render={({ field: { value, onChange } }) => (
              <Switch
                checked={value as boolean}
                onChange={(e) => {
                  const value = e.currentTarget.checked;
                  switch (field.field_name) {
                    case "Do employees transferring to other projects have IT assets":
                      personnelTransferRequisitionMethods &&
                        personnelTransferRequisitionMethods.onITAssetBooleanChange(
                          value,
                          sectionIndex
                        );
                      break;

                    case "Is this for Official Business":
                      workingAdvanceVoucherFormMethods &&
                        workingAdvanceVoucherFormMethods.onWorkingAdvanceVoucherBooleanChange(
                          value,
                          sectionIndex
                        );
                      break;
                  }
                  onChange(value);
                }}
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
        const dropdownOption = dropdownOptionValue.map((option) => {
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
                      itAssetRequestFormMethods?.onGeneralNameChange(
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
                      itAssetRequestFormMethods?.onProjectNameChange(value);
                      liquidationReimbursementFormMethods?.onProjectNameChange(
                        value
                      );
                      workingAdvanceVoucherFormMethods?.onProjectNameChange(
                        value
                      );
                      equipmentServiceReportMethods?.onProjectNameChange(value);
                      requestForPaymentFormMethods?.onProjectNameChange(value);
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
                      equipmentServiceReportMethods?.onGeneralItemNameChange(
                        value,
                        sectionIndex
                      );
                      break;
                    case "Component Category":
                      pedPartFormMethods?.onComponentCategoryChange(
                        value,
                        sectionIndex
                      );
                      equipmentServiceReportMethods?.onComponentCategoryChange(
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
                      equipmentServiceReportMethods?.onBrandChange(
                        value,
                        sectionIndex
                      );
                      break;
                    case "Model":
                      pedPartFormMethods?.onModelChange(value, sectionIndex);
                      equipmentServiceReportMethods?.onModelChange(
                        value,
                        sectionIndex
                      );
                      break;
                    case "Part Number":
                      pedPartFormMethods?.onPartNumberChange(
                        value,
                        sectionIndex
                      );
                      equipmentServiceReportMethods?.onPartNumberChange(
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
                      liquidationReimbursementFormMethods?.onRequestTypeChange(
                        value
                      );
                      break;
                    case "Department":
                      liquidationReimbursementFormMethods?.onDepartmentChange(
                        value
                      );
                      liquidationReimbursementFormMethods?.onRequestTypeChange(
                        value
                      );
                      requestForPaymentFormMethods?.onDepartmentChange(
                        value,
                        prevValue as string | null
                      );
                      break;
                    case "Type of Transfer":
                      personnelTransferRequisitionMethods?.onTypeOfTransferChange(
                        value
                      );
                      break;
                    case "Manner of Transfer":
                      personnelTransferRequisitionMethods?.onMannerOfTransferChange(
                        value,
                        prevValue as string | null
                      );
                      break;
                    case "From":
                      personnelTransferRequisitionMethods?.onFromChange(value);
                      break;
                    case "To":
                      personnelTransferRequisitionMethods?.onToChange(value);
                      break;
                    case "Purpose":
                      personnelTransferRequisitionMethods?.onPurposeChange(
                        value,
                        prevValue as string | null
                      );
                      break;
                    case "Equipment Code":
                      personnelTransferRequisitionMethods?.onEquipmentCodeChange(
                        value,
                        sectionIndex
                      );
                      break;
                    case "Employee No. (HRIS)":
                      personnelTransferRequisitionMethods?.onEmployeeNumberChange(
                        value,
                        sectionIndex
                      );
                      break;
                    case "Employee Status":
                      personnelTransferRequisitionMethods?.onEmployeeStatusChange(
                        value,
                        prevValue as string | null,
                        sectionIndex
                      );
                      break;
                    case "Phase of Work":
                      personnelTransferRequisitionMethods?.onPhaseOfWorkChange(
                        value,
                        sectionIndex,
                        fieldIndex
                      );
                      break;
                    case "Equipment Category":
                      equipmentServiceReportMethods?.onCategoryChange(value);
                      break;
                    case "Equipment Type":
                      equipmentServiceReportMethods?.onEquipmentTypeChange(
                        value
                      );
                      break;
                    case "Property Number":
                      equipmentServiceReportMethods?.onPropertyNumberChange(
                        value
                      );
                      break;
                    case "Action Type":
                      equipmentServiceReportMethods?.onActionTypeChange(
                        value,
                        prevValue as string | null
                      );
                      break;
                    case "Payee Type":
                      requestForPaymentFormMethods?.onPayeeTypeChange(
                        value,
                        prevValue as string | null
                      );
                      break;
                    case "Purpose of Payment":
                      requestForPaymentFormMethods?.onPurposePlanChange(
                        value,
                        prevValue as string | null
                      );
                      break;
                    case "Charge To":
                      requestForPaymentFormMethods?.onChargeToChange(value);
                      break;
                    case "Mode of Payment":
                      requestForPaymentFormMethods?.onModeOfPaymentChange(
                        value,
                        sectionIndex
                      );
                      break;
                  }
                }}
                onDropdownOpen={() => {
                  switch (field.field_name) {
                    case "General Item Name":
                      isEdit && pedPartFormMethods?.onGeneralItemNameOpen
                        ? pedPartFormMethods.onGeneralItemNameOpen(sectionIndex)
                        : null;
                      break;
                    case "Component Category":
                      isEdit &&
                        pedPartFormMethods?.onGeneralItemNameChange(
                          getValues(
                            `sections.${sectionIndex}.section_field.${0}.field_response`
                          ) as string,
                          sectionIndex,
                          {
                            fieldId: field.field_id,
                            response: getValues(
                              `sections.${sectionIndex}.section_field.${1}.field_response`
                            ) as string,
                            dupId: field.field_section_duplicatable_id,
                          }
                        );
                      break;
                    case "Brand":
                      isEdit &&
                        pedPartFormMethods?.onComponentCategoryChange(
                          getValues(
                            `sections.${sectionIndex}.section_field.${1}.field_response`
                          ) as string,
                          sectionIndex,
                          {
                            fieldId: field.field_id,
                            response: getValues(
                              `sections.${sectionIndex}.section_field.${2}.field_response`
                            ) as string,
                            dupId: field.field_section_duplicatable_id,
                          }
                        );
                      break;
                    case "Model":
                      isEdit &&
                        pedPartFormMethods?.onBrandChange(
                          getValues(
                            `sections.${sectionIndex}.section_field.${2}.field_response`
                          ) as string,
                          sectionIndex,
                          {
                            fieldId: field.field_id,
                            response: getValues(
                              `sections.${sectionIndex}.section_field.${3}.field_response`
                            ) as string,
                            dupId: field.field_section_duplicatable_id,
                          }
                        );
                      break;
                    case "Part Number":
                      isEdit &&
                        pedPartFormMethods?.onModelChange(
                          getValues(
                            `sections.${sectionIndex}.section_field.${3}.field_response`
                          ) as string,
                          sectionIndex,
                          {
                            fieldId: field.field_id,
                            response: getValues(
                              `sections.${sectionIndex}.section_field.${4}.field_response`
                            ) as string,
                            dupId: field.field_section_duplicatable_id,
                          }
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
                disabled={isEdit && field.field_name === "Requesting Project"}
                readOnly={field.field_is_read_only || isLoading}
                rightSection={isLoading && <Loader size={16} />}
                dropdownPosition="bottom"
                description={
                  personnelTransferRequisitionMethods &&
                  field.field_name === "Department"
                    ? "Which department will this employee go to?"
                    : ""
                }
              />
            )}
            rules={{ ...fieldRules }}
          />
        );

      case "MULTISELECT":
        const multiselectOption = field.options
          .map((option) => ({
            value: option.option_value,
            label: option.option_value,
          }))
          .filter((option) => option.value);

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
              <Flex w="100%" align="flex-end" gap="xs">
                <FileInput
                  {...inputProps}
                  icon={<IconFile size={16} />}
                  clearable
                  multiple={false}
                  value={field.value as File | null | undefined}
                  onChange={field.onChange}
                  error={fieldError}
                  sx={{ width: prevFileLink ? "96%" : "100%" }}
                />
                {parseJSONIfValid(`${field.value}`) && isEdit !== undefined ? (
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
