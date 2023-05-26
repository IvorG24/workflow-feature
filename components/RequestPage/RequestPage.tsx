import { FormStatusType, RequestWithResponseType } from "@/utils/types";
import {
  Box,
  Button,
  Container,
  Divider,
  Group,
  NavLink,
  Paper,
  Space,
  Stack,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconArrowLeft } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useState } from "react";
import RequestSection from "./RequestSection";

type Props = {
  request: RequestWithResponseType;
};

const RequestPage = ({ request }: Props) => {
  const router = useRouter();
  const [requestStatus, setRequestStatus] = useState(request.request_status);
  const requestor = request.request_team_member.team_member_user;
  const sections = request.request_form.form_section;

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
      <NavLink
        mb="sm"
        label="Return to Requests Page"
        icon={<IconArrowLeft />}
        onClick={() => router.push("/team-requests/requests")}
      />
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

        {sections.map((section) => {
          const duplicateSectionIdList = section.section_field[0].field_response
            .map(
              (response) => response.request_response_duplicatable_section_id
            )
            .filter((id) => id !== null);
          // if duplicateSectionIdList is empty, use section_id instead
          const newSectionIdList =
            duplicateSectionIdList.length > 0
              ? duplicateSectionIdList
              : [section.section_id];

          return (
            <Box key={section.section_id}>
              {newSectionIdList.map((sectionId) => (
                <RequestSection
                  key={sectionId}
                  duplicateSectionId={sectionId}
                  section={section}
                />
              ))}
            </Box>
          );
        })}

        <Space h="xl" />
        <Divider my="sm" />

        <Button
          variant="outline"
          fullWidth
          onClick={() =>
            router.push(`/team-requests/requests/${request.request_id}/edit`)
          }
        >
          Edit Request
        </Button>
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
          <Button
            variant="default"
            fullWidth
            onClick={() => handleUpdateRequest("CANCELED")}
          >
            Cancel Request
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default RequestPage;
