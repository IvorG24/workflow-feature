import { FieldType, RequestWithResponseType } from "@/utils/types";
import { Box, Divider, Stack } from "@mantine/core";
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
    <Box my="lg">
      <Divider label={section.section_name} labelPosition="center" />
      <Stack>
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
                    options: field.field_options ? field.field_options : [],
                  }}
                />
              ) : null
            )}
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default RequestSection;
