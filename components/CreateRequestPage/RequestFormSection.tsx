import { FieldType, RequestWithResponseType } from "@/utils/types";
import { Box, Paper, Space, Title } from "@mantine/core";
import RequestFormFields from "./RequestFormFields";

type RequestFormSectionProps = {
  duplicateSectionId: string | null;
  section: RequestWithResponseType["request_form"]["form_section"][0];
};

const RequestFormSection = ({
  duplicateSectionId,
  section,
}: RequestFormSectionProps) => {
  return (
    <Paper p="xl" shadow="xs">
      <Title order={4} color="dimmed">
        {section.section_name}
      </Title>
      <Space />
      {section.section_field.map((field) => (
        <Box key={field.field_id}>
          {field.field_response.map((response) =>
            response.request_response_duplicatable_section_id ===
              duplicateSectionId ||
            response.request_response_duplicatable_section_id === null ? (
              <RequestFormFields
                key={response.request_response_id}
                field={{
                  id: response.request_response_id,
                  type: field.field_type as FieldType,
                  label: field.field_name,
                  options: field.field_option ? field.field_option : [],
                }}
              />
            ) : null
          )}
        </Box>
      ))}
    </Paper>
  );
};

export default RequestFormSection;
