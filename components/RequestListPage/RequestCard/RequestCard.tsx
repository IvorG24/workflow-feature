import { getAvatarColor, getStatusToColor } from "@/utils/styling";
import { RequestType } from "@/utils/types";
import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CopyButton,
  Divider,
  Flex,
  Group,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import {
  IconCalendar,
  IconCopy,
  IconFileDescription,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import RequestSignerList from "./RequestSignerList";

type RequestCardProps = {
  request: RequestType;
};

const RequestCard = ({ request }: RequestCardProps) => {
  const router = useRouter();
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

  const handleRedirectToRequestPage = (requestId: string) => {
    router.push(`/team-requests/requests/${requestId}`);
    return;
  };

  return (
    <Card radius="lg" maw={300}>
      <Stack>
        <Group position="apart">
          <Group spacing={8}>
            <Avatar
              src={requestor.user_avatar}
              {...defaultAvatarProps}
              color={getAvatarColor(
                Number(`${requestor.user_id.charCodeAt(0)}`)
              )}
            >
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
            <Text c="dimmed" size={14}>
              Request ID
            </Text>
            <Flex gap={3}>
              <Tooltip label={request.request_id}>
                <Text truncate>{request.request_id}</Text>
              </Tooltip>
              <CopyButton value={request.request_id}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? "Copied" : "Copy"} onClick={copy}>
                    <ActionIcon>
                      <IconCopy />
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Flex>
          </Box>
          <Stack spacing="xs">
            <Flex gap="xs">
              <Tooltip label={form.form_description}>
                <IconFileDescription stroke={1} />
              </Tooltip>
              <Text weight={600}>{form.form_name}</Text>
            </Flex>

            <Flex gap="xs">
              <Tooltip label="Date created">
                <IconCalendar stroke={1} />
              </Tooltip>
              <Text>{requestDateCreated}</Text>
            </Flex>
          </Stack>
        </Stack>
      </Stack>
      <Card.Section mt="sm">
        <Divider />
        <Group p="sm" position="apart">
          <RequestSignerList signerList={request_signer} />

          <Button
            variant="light"
            onClick={() => handleRedirectToRequestPage(request.request_id)}
          >
            View Request
          </Button>
        </Group>
      </Card.Section>
    </Card>
  );
};

export default RequestCard;
