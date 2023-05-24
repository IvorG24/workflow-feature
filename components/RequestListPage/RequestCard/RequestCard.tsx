import { getStatusToColor } from "@/utils/styling";
import { RequestType } from "@/utils/types";
import {
  Avatar,
  Badge,
  Box,
  Card,
  CopyButton,
  Divider,
  Group,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconCalendar } from "@tabler/icons-react";
import RequestApproverList from "./RequestApproverList";

type RequestCardProps = {
  request: RequestType;
};

const RequestCard = ({ request }: RequestCardProps) => {
  const defaultAvatarProps = { color: "blue", size: "sm", radius: "xl" };
  const {
    request_form: form,
    request_team_member: { team_member_user: requestor },
    request_signer,
  } = request;
  const requestDateCreated = new Date(
    request.request_date_created
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card radius="lg">
      <Stack>
        <Group position="apart">
          <Group spacing={8}>
            <Avatar src={requestor.user_avatar} {...defaultAvatarProps}>
              {requestor.user_first_name[0] + requestor.user_last_name[0]}
            </Avatar>
            <Text>{`${requestor.user_first_name} ${requestor.user_last_name}`}</Text>
          </Group>
          <Badge
            variant="filled"
            w="fit-content"
            color={getStatusToColor(request.request_status)}
          >
            {request.request_status}
          </Badge>
        </Group>
        <Stack spacing={8}>
          <Box>
            <Text c="dimmed">Request ID</Text>
            <CopyButton value={request.request_id}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? "Copied" : "Copy"} onClick={copy}>
                  <Text sx={{ cursor: "pointer" }}>{request.request_id}</Text>
                </Tooltip>
              )}
            </CopyButton>
          </Box>
          <Box>
            <Text c="dimmed">Form title and description</Text>
            <Text weight={600}>{form.form_name}</Text>
            <Text>{form.form_description}</Text>
          </Box>
        </Stack>
      </Stack>
      <Card.Section mt="sm">
        <Divider />
        <Group p="sm" position="apart">
          <RequestApproverList approverList={request_signer} />
          <Group spacing={8}>
            <Tooltip label="Date created">
              <IconCalendar stroke={1} />
            </Tooltip>
            <Text>{requestDateCreated}</Text>
          </Group>
        </Group>
      </Card.Section>
    </Card>
  );
};

export default RequestCard;
