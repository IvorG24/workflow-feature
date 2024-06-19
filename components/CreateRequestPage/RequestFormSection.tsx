import {
  ActionIcon,
  Group,
  Paper,
  Space,
  Stack,
  Title,
  Tooltip,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { Section } from "./CreateRequestPage";
import RequestFormFields from "./RequestFormFields";

type RequestFormSectionProps = {
  section: Section;
  sectionIndex: number;
  onRemoveSection?: (sectionDuplicatableId: string) => void;
  itemFormMethods?: {
    onGeneralNameChange: (index: number, value: string | null) => void;
    onProjectNameChange: (value: string | null) => void;
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
  loadingFieldList?: { sectionIndex: number; fieldIndex: number }[];
  itAssetRequestFormMethods?: {
    onProjectNameChange: (value: string | null) => void;
    onGeneralNameChange: (index: number, value: string | null) => void;
    onCSICodeChange: (index: number, value: string | null) => void;
  };
  currencyOptionList?: { value: string; label: string }[];
  liquidationReimbursementFormMethods?: {
    onProjectNameChange: (value: string | null) => void;
    onRequestTypeChange: (value: string | null) => void;
    onDepartmentChange: (value: string | null) => void;
  };
  personnelTransferRequisitionMethods?: {
    onMannerOfTransferChange: (
      value: string | null,
      prevValue: string | null
    ) => void;
    onFromChange: (value: string | null) => void;
    onToChange: (value: string | null) => void;
    onTypeOfTransferChange: (value: string | null) => void;
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

const RequestFormSection = ({
  section,
  sectionIndex,
  onRemoveSection,
  itemFormMethods,
  formslyFormName = "",
  servicesFormMethods,
  pedEquipmentFormMethods,
  pedPartFormMethods,
  otherExpensesMethods,
  pedItemFormMethods,
  paymentRequestFormMethods,
  isEdit,
  loadingFieldList,
  itAssetRequestFormMethods,
  currencyOptionList,
  liquidationReimbursementFormMethods,
  personnelTransferRequisitionMethods,
  workingAdvanceVoucherFormMethods,
  equipmentServiceReportMethods,
  requestForPaymentFormMethods,
}: RequestFormSectionProps) => {
  const sectionDuplicatableId =
    section.section_field[0].field_section_duplicatable_id;

  return (
    <Paper p="xl" shadow="xs">
      <Group position="apart">
        <Title order={4} color="dimmed">
          {section.section_name}
        </Title>
        {sectionDuplicatableId && (
          <Tooltip label="Remove Section">
            <ActionIcon
              onClick={() =>
                onRemoveSection && onRemoveSection(sectionDuplicatableId)
              }
              variant="light"
              color="red"
              disabled={onRemoveSection === undefined}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
      <Space />
      <Stack mt="xl">
        {section.section_field.map((field, idx) => {
          const isLoading = Boolean(
            loadingFieldList?.find(
              (loadingField) =>
                loadingField.sectionIndex === sectionIndex &&
                loadingField.fieldIndex === idx
            )
          );

          return (
            <RequestFormFields
              key={field.field_id + section.section_id}
              field={{
                ...field,
                options: field.field_option ? field.field_option : [],
                field_section_duplicatable_id:
                  field.field_section_duplicatable_id,
              }}
              sectionIndex={sectionIndex}
              fieldIndex={idx}
              itemFormMethods={itemFormMethods}
              formslyFormName={formslyFormName}
              servicesFormMethods={servicesFormMethods}
              pedEquipmentFormMethods={pedEquipmentFormMethods}
              pedPartFormMethods={pedPartFormMethods}
              otherExpensesMethods={otherExpensesMethods}
              pedItemFormMethods={pedItemFormMethods}
              paymentRequestFormMethods={paymentRequestFormMethods}
              itAssetRequestFormMethods={itAssetRequestFormMethods}
              isEdit={isEdit}
              isLoading={isLoading}
              currencyOptionList={currencyOptionList}
              liquidationReimbursementFormMethods={
                liquidationReimbursementFormMethods
              }
              personnelTransferRequisitionMethods={
                personnelTransferRequisitionMethods
              }
              workingAdvanceVoucherFormMethods={
                workingAdvanceVoucherFormMethods
              }
              equipmentServiceReportMethods={equipmentServiceReportMethods}
              requestForPaymentFormMethods={requestForPaymentFormMethods}
            />
          );
        })}
      </Stack>
    </Paper>
  );
};

export default RequestFormSection;
