import { DuplicateSectionType } from "@/utils/arrayFunctions";
import { FieldType } from "@/utils/types";
import { Box, Paper, Space, Stack, Title } from "@mantine/core";
import RequestResponse from "./RequestResponse";

type RequestSectionProps = {
  section: DuplicateSectionType;
};

const RequestSection = ({ section }: RequestSectionProps) => {
  return (
    <Paper p="xl" shadow="xs">
      <Title order={4} color="dimmed">
        {section.section_name}
      </Title>
      <Space h="xl" />
      <Stack spacing="sm">
        {section.section_field.map((field) => {
          return (
            <Box key={field.field_id}>
              <RequestResponse
                response={{
                  id: field.field_response?.request_response_id as string,
                  type: field.field_type as FieldType,
                  label: field.field_name,
                  value: field.field_response
                    ? field.field_response.request_response
                    : "",
                  options: field.field_option ? field.field_option : [],
                }}
              />
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
};

export default RequestSection;
