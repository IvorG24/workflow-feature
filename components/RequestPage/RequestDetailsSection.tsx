import { startCase } from "@/utils/string";
import { getAvatarColor, getStatusToColor } from "@/utils/styling";
import { RequestWithResponseType } from "@/utils/types";
import {
  Avatar,
  Badge,
  Flex,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconCalendar } from "@tabler/icons-react";

type Props = {
  request: RequestWithResponseType;
  requestor: RequestWithResponseType["request_team_member"]["team_member_user"];
  requestDateCreated: string;
  requestStatus: string;
};

const RequestDetailsSection = ({
  request,
  requestor,
  requestDateCreated,
  requestStatus,
}: Props) => {
  return (
    <Paper p="xl" shadow="xs">
      <Title order={2}>{request.request_form.form_name}</Title>
      <Text mt="xs">{request.request_form.form_description}</Text>

      <Title order={5} mt="xl">
        Requested by:
      </Title>
      <Flex gap="md" align="center" mt="xs">
        <Avatar
          size={50}
          src={requestor.user_avatar}
          color={getAvatarColor(Number(`${requestor.user_id.charCodeAt(0)}`))}
          radius="xl"
        >
          {startCase(
            requestor.user_first_name[0] + requestor.user_last_name[0]
          )}
        </Avatar>
        <Stack spacing={0}>
          <Text>
            {`${requestor.user_first_name} ${requestor.user_last_name}`}
          </Text>
          <Text color="dimmed" size={14}>
            {" "}
            {requestor.user_username}
          </Text>
        </Stack>
      </Flex>
      <Group spacing="md" mt="xl">
        <IconCalendar />
        <Text weight={600}>{requestDateCreated}</Text>
      </Group>
      <Group spacing="md" mt="xs">
        <Text>Status:</Text>
        <Badge color={getStatusToColor(requestStatus.toLowerCase())}>
          {requestStatus}
        </Badge>
      </Group>
      {request.request_project && (
        <Group spacing="md" mt="xl">
          <Title order={5}>Requesting Project:</Title>
          <Text>{request.request_project.team_project_name}</Text>
        </Group>
      )}
    </Paper>
  );
};

export default RequestDetailsSection;
