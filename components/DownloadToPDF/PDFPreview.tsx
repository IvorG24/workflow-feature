import { DuplicateSectionType } from "@/utils/arrayFunctions";
import { RequestWithResponseType } from "@/utils/types";
import { Box, Divider, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { lowerCase, startCase } from "lodash";
import moment from "moment";
import { useRef } from "react";
import DownloadToPDFButton from "./DownloadToPDF";

type Props = {
  request: RequestWithResponseType;
  sectionWithDuplicateList: DuplicateSectionType[];
  isFormslyForm?: boolean;
};

const getReadableDate = (date: string) => {
  const readableDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return readableDate;
};

const PDFPreview = ({ request, sectionWithDuplicateList }: Props) => {
  const pageContentRef = useRef<HTMLDivElement>(null);
  const requestor = request.request_team_member.team_member_user;
  const requestDateCreated = getReadableDate(request.request_date_created);

  const pdfFileName = `${moment(request.request_date_created).format(
    "YYYY-MM-DD"
  )}-${request.request_form.form_name}-${requestor.user_first_name}-${
    requestor.user_last_name
  }`;

  const pageContentId = `pdf-${request.request_id}`;

  return (
    <Paper>
      <Stack
        p="md"
        spacing="xl"
        ref={pageContentRef}
        id={`pdf-${request.request_id}`}
      >
        {/* Receipt Details */}
        <Group position="apart">
          <Stack>
            <Stack spacing={0}>
              <Text size="sm">Request ID:</Text>
              <Title order={5}>{request.request_id}</Title>
            </Stack>
            <Stack spacing={0}>
              <Text size="sm">Form Name:</Text>
              <Title order={5}>{request.request_form.form_name}</Title>
            </Stack>
            <Stack spacing={0}>
              <Text size="sm">Form Description:</Text>
              <Title order={5}>{request.request_form.form_description}</Title>
            </Stack>
          </Stack>
          <Stack ta="right">
            <Stack spacing={0}>
              <Text size="sm">Requested by:</Text>
              <Title order={5}>
                {`${requestor.user_first_name} ${requestor.user_last_name}`}
              </Title>
            </Stack>
            <Stack spacing={0}>
              <Text size="sm">Date requested:</Text>
              <Title order={5}>{requestDateCreated}</Title>
            </Stack>
            <Stack spacing={0}>
              <Text size="sm">Request status:</Text>
              <Title order={5}>
                {startCase(lowerCase(request.request_status))}
              </Title>
            </Stack>
          </Stack>
        </Group>

        <Divider />

        {/* Request Section */}
        {sectionWithDuplicateList.map((section, idx) => (
          <Box key={section.section_id + idx}>
            <Stack>
              <Title order={4}>{section.section_name}</Title>
              <Stack>
                {section.section_field.map((field) => {
                  if (field.field_response) {
                    const parseResponse = JSON.parse(
                      field.field_response.request_response
                    );
                    return (
                      <Group key={field.field_id} position="apart">
                        <Text size="sm">{field.field_name}</Text>
                        <Text weight={600}>
                          {field.field_type !== "DATE"
                            ? parseResponse
                            : getReadableDate(parseResponse)}
                        </Text>
                      </Group>
                    );
                  }
                })}
              </Stack>
            </Stack>
            {idx < sectionWithDuplicateList.length - 1 && <Divider mt="md" />}
          </Box>
        ))}
      </Stack>
      <DownloadToPDFButton
        pageContentId={pageContentId}
        pdfFileName={pdfFileName}
      />
    </Paper>
  );
};

PDFPreview.displayName = "PDFPreview";

export default PDFPreview;
