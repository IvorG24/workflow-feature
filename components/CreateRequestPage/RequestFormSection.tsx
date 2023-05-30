import { FieldType } from "@/utils/types";
import { Group, Paper, Space, Stack, Title } from "@mantine/core";
import { Section } from "./CreateRequestPage";
import RequestFormFields from "./RequestFormFields";

type RequestFormSectionProps = {
  section: Section;
};

const RequestFormSection = ({ section }: RequestFormSectionProps) => {
  return (
    <Paper p="xl" shadow="xs">
      <Group position="apart">
        <Title order={4} color="dimmed">
          {section.section_name}
        </Title>
      </Group>
      <Space />
      <Stack>
        {section.section_field.map((field) => (
          <RequestFormFields
            key={field.field_id + section.section_id}
            field={{
              id: field.field_id,
              type: field.field_type as FieldType,
              label: field.field_name,
              description: field.field_description,
              is_required: field.field_is_required,
              options: field.field_option ? field.field_option : [],
            }}
          />
        ))}
      </Stack>
    </Paper>
  );
};

export default RequestFormSection;
