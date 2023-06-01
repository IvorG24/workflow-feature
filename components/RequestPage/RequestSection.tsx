import { FieldType, RequestWithResponseType } from "@/utils/types";
import { Box, Paper, Space, Stack, Title } from "@mantine/core";
import RequestResponse from "./RequestResponse";

type RequestSectionProps = {
  duplicateSectionId: string | null;
  section: RequestWithResponseType["request_form"]["form_section"][0];
};

const RequestSection = ({ section }: RequestSectionProps) => {
  return (
    <Paper p="xl" shadow="xs">
      <Title order={4} color="dimmed">
        {section.section_name}
      </Title>
      <Space h="xl" />
      <Stack spacing="sm">
        {section.section_field.map((field) => (
          <Box key={field.field_id}>
            <RequestResponse
              response={{
                id: field.field_id,
                type: field.field_type as FieldType,
                label: field.field_name,
                value:
                  field.field_response.length !== 0
                    ? field.field_response[0].request_response
                    : "",
                options: field.field_option ? field.field_option : [],
              }}
            />
            {/* {field.field_response.map((response) =>
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
            )} */}
          </Box>
        ))}
      </Stack>
    </Paper>
  );
};

export default RequestSection;
