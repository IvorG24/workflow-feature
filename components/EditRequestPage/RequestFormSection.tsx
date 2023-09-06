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

const RequestFormSection = ({
  section,
  sectionIndex,
  onRemoveSection,
  isSectionRemovable,
  requisitionFormMethods,
  quotationFormMethods,
  rirFormMethods,
  formslyFormName = "",
  sourcedItemFormMethods,
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
            quotationFormMethods={quotationFormMethods}
            rirFormMethods={rirFormMethods}
            formslyFormName={formslyFormName}
            sourcedItemFormMethods={sourcedItemFormMethods}
          />
        ))}
      </Stack>
    </Paper>
  );
};

export default RequestFormSection;
