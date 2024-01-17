import { OptionTableRow } from "@/utils/types";
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
import { Section } from "./EditRequestPage";
import RequestFormFields from "./RequestFormFields";

type RequestFormSectionProps = {
  section: Section;
  sectionIndex: number;
  onRemoveSection?: (index: number) => void;
  isSectionRemovable?: boolean;
  requisitionFormMethods?: {
    onGeneralNameChange: (index: number, value: string | null) => void;
    onProjectNameChange: (value: string | null) => void;
    onCSICodeChange: (index: number, value: string | null) => void;
    supplierSearch?: (value: string, index: number) => void;
    isSearching?: boolean;
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
  serviceFormMethods?: {
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
};

const RequestFormSection = ({
  section,
  sectionIndex,
  onRemoveSection,
  isSectionRemovable,
  requisitionFormMethods,
  subconFormMethods,
  quotationFormMethods,
  rirFormMethods,
  formslyFormName = "",
  sourcedItemFormMethods,
  referenceOnly,
  serviceFormMethods,
  otherExpensesMethods,
}: RequestFormSectionProps) => {
  return (
    <Paper p="xl" shadow="xs">
      <Group position="apart">
        <Title order={4} color="dimmed">
          {section.section_name}
        </Title>
        {isSectionRemovable && (
          <Tooltip label="Remove Section">
            <ActionIcon
              onClick={() => onRemoveSection && onRemoveSection(sectionIndex)}
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
            requisitionFormMethods={requisitionFormMethods}
            subconFormMethods={subconFormMethods}
            quotationFormMethods={quotationFormMethods}
            serviceFormMethods={serviceFormMethods}
            rirFormMethods={rirFormMethods}
            formslyFormName={formslyFormName}
            sourcedItemFormMethods={sourcedItemFormMethods}
            referenceOnly={referenceOnly}
            otherExpensesMethods={otherExpensesMethods}
          />
        ))}
      </Stack>
    </Paper>
  );
};

export default RequestFormSection;
