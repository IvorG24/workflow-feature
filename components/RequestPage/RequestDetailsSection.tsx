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
import { capitalize, lowerCase } from "lodash";

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
          {capitalize(requestor.user_first_name[0])}
          {capitalize(requestor.user_last_name[0])}
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
        <Badge color={getStatusToColor(lowerCase(requestStatus))}>
          {requestStatus}
        </Badge>
      </Group>
    </Paper>
  );
};

export default RequestDetailsSection;
