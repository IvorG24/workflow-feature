import { FieldType, RequestWithResponseType } from "@/utils/types";
import { Box, Paper, Space, Stack, Title } from "@mantine/core";
import RequestResponse from "./RequestResponse";

type RequestSectionProps = {
  section: RequestWithResponseType["request_form"]["form_section"][0];
  duplicateId: string | null;
};

const RequestSection = ({ section, duplicateId }: RequestSectionProps) => {
  return (
    <Paper p="xl" shadow="xs">
      <Title order={4} color="dimmed">
        {section.section_name}
      </Title>
      <Space h="xl" />
      <Stack spacing="sm">
        {section.section_field.map((field) => {
          if (field.field_response.length > 0) {
            return field.field_response.map((response) => {
              return response.request_response_duplicatable_section_id ===
                duplicateId ? (
                <Box key={response.request_response_id}>
                  <RequestResponse
                    response={{
                      id: response.request_response_id,
                      type: field.field_type as FieldType,
                      label: field.field_name,
                      value: response.request_response,
                      options: field.field_option ? field.field_option : [],
                    }}
                  />
                </Box>
              ) : null;
            });
          } else {
            return (
              <Box key={field.field_id}>
                <RequestResponse
                  response={{
                    id: field.field_id,
                    type: field.field_type as FieldType,
                    label: field.field_name,
                    value: "",
                    options: field.field_option ? field.field_option : [],
                  }}
                />
              </Box>
            );
          }
        })}
      </Stack>
    </Paper>
  );
};

export default RequestSection;
