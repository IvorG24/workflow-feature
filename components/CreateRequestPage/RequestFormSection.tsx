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
  paymentRequestFormMethods?: {
    onProjectNameChange: (value: string | null) => void;
    onRequestTypeChange: (value: string | null, index: number) => void;
  };
};

const RequestFormSection = ({
  section,
  sectionIndex,
  onRemoveSection,
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
  paymentRequestFormMethods,
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
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
      <Space />
      <Stack mt="xl">
        {section.section_field.map((field, idx) => (
          <RequestFormFields
            key={field.field_id + section.section_id}
            field={{
              ...field,
              options: field.field_option ? field.field_option : [],
            }}
            sectionIndex={sectionIndex}
            fieldIndex={idx}
            itemFormMethods={itemFormMethods}
            subconFormMethods={subconFormMethods}
            quotationFormMethods={quotationFormMethods}
            rirFormMethods={rirFormMethods}
            formslyFormName={formslyFormName}
            sourcedItemFormMethods={sourcedItemFormMethods}
            servicesFormMethods={servicesFormMethods}
            pedEquipmentFormMethods={pedEquipmentFormMethods}
            pedPartFormMethods={pedPartFormMethods}
            otherExpensesMethods={otherExpensesMethods}
            pedConsumableFormMethods={pedConsumableFormMethods}
            paymentRequestFormMethods={paymentRequestFormMethods}
          />
        ))}
      </Stack>
    </Paper>
  );
};

export default RequestFormSection;
