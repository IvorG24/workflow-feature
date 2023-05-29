import { FieldType, RequestWithResponseType } from "@/utils/types";
import { Box, Paper, Space, Title } from "@mantine/core";
import RequestResponse from "./RequestResponse";

type RequestSectionProps = {
  duplicateSectionId: string | null;
  section: RequestWithResponseType["request_form"]["form_section"][0];
};

const RequestSection = ({
  duplicateSectionId,
  section,
}: RequestSectionProps) => {
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
              <RequestResponse
                key={response.request_response_id}
                response={{
                  id: response.request_response_id,
                  type: field.field_type as FieldType,
                  label: field.field_name,
                  value: response.request_response,
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

export default RequestSection;
