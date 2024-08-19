import { DuplicateSectionType, FieldType } from "@/utils/types";
import { Box, Paper, Space, Stack, Title } from "@mantine/core";
import RequestResponse from "./RequestResponse";

type RequestSectionProps = {
  section: DuplicateSectionType;
  isFormslyForm?: boolean;
  isOnlyWithResponse?: boolean;
  isAnon?: boolean;
  index?: number;
  isPublicRequest?: boolean;
};

const RequestSection = ({
  section,
  isFormslyForm = false,
  isOnlyWithResponse = false,
  isAnon = false,
  index = 0,
  isPublicRequest = false,
}: RequestSectionProps) => {
  return (
    <Paper p="xl" shadow="xs">
      <Title order={4} color="dimmed">
        {section.section_name}{" "}
        {section.section_is_duplicatable && index ? index : ""}
      </Title>
      <Space h="xl" />
      <Stack spacing="sm">
        {section.section_field.map((field) => {
          if (isFormslyForm && isOnlyWithResponse) {
            if (field.field_response) {
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
                    isFormslyForm={isFormslyForm}
                    isAnon={isAnon}
                    isPublicRequest={isPublicRequest}
                  />
                </Box>
              );
            }
          } else {
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
                    prefix: field.field_response?.request_response_prefix,
                    isSpecialField:
                      field.field_special_field_template_id !== null,
                  }}
                  isFormslyForm={isFormslyForm}
                  isAnon={isAnon}
                  isPublicRequest={isPublicRequest}
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
