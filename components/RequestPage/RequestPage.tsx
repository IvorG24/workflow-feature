// TODO:
// 1. Connect handleUpdateStatus to backend
// 2. Display Approve/Reject/Cancel if current user has permission

import {
  FieldType,
  FormStatusType,
  RequestWithResponseType,
} from "@/utils/types";
import {
  Box,
  Button,
  Container,
  Divider,
  Group,
  Paper,
  Space,
  Stack,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import RequestResponse from "./RequestResponse";

type Props = {
  request: RequestWithResponseType;
};

const RequestPage = ({ request }: Props) => {
  const [requestStatus, setRequestStatus] = useState(request.request_status);
  const sections = request.request_form.form_section;
  const requestor = request.request_team_member.team_member_user;

  const requestDateCreated = new Date(
    request.request_date_created
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleUpdateRequest = (status: FormStatusType) => {
    setRequestStatus(status);
    notifications.show({
      title: "Update request successful.",
      message: `You have ${status} this request`,
      color: "green",
    });
  };

  return (
    <Container>
      <Paper p="lg" h="fit-content">
        <Group spacing={4}>
          <Text>Request ID:</Text>
          <Text weight={600}>{request.request_id}</Text>
        </Group>
        <Group spacing={4}>
          <Text>Form name:</Text>
          <Text weight={600}>{request.request_form.form_name}</Text>
        </Group>
        <Group spacing={4}>
          <Text>Form description:</Text>
          <Text weight={600}>{request.request_form.form_description}</Text>
        </Group>
        <Group spacing={4}>
          <Text>Submitted by:</Text>
          <Text
            weight={600}
          >{`${requestor.user_first_name} ${requestor.user_last_name}`}</Text>
        </Group>
        <Group spacing={4}>
          <Text>Submitted on:</Text>
          <Text weight={600}>{requestDateCreated}</Text>
        </Group>
        <Group spacing={4}>
          <Text>Status:</Text>
          <Text weight={600}>{requestStatus}</Text>
        </Group>

        {sections.map((section) => (
          <Box my="lg" key={section.section_id}>
            <Divider label={section.section_name} labelPosition="center" />
            <Stack>
              {section.section_field.map((field) => (
                <Box key={field.field_id}>
                  {field.field_response.map((response) => (
                    <RequestResponse
                      key={response.request_response_id}
                      response={{
                        type: field.field_type as FieldType,
                        label: field.field_name,
                        value: response.request_response,
                        options: field.field_options ? field.field_options : [],
                      }}
                    />
                  ))}
                </Box>
              ))}
            </Stack>
          </Box>
        ))}
        <Space h="xl" />
        <Divider my="sm" />
        <Stack>
          <Button
            color="green"
            fullWidth
            onClick={() => handleUpdateRequest("APPROVED")}
          >
            Approve Request
          </Button>
          <Button
            color="red"
            fullWidth
            onClick={() => handleUpdateRequest("REJECTED")}
          >
            Reject Request
          </Button>
          <Button fullWidth onClick={() => handleUpdateRequest("CANCELED")}>
            Cancel Request
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default RequestPage;
