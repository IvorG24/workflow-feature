import { getAvatarColor, getStatusToColor } from "@/utils/styling";
import { RequestListItemType } from "@/utils/types";
import {
  ActionIcon,
  Avatar,
  Badge,
  CopyButton,
  Flex,
  Grid,
  Group,
  Text,
  Tooltip,
  createStyles,
} from "@mantine/core";
import { IconArrowsMaximize, IconCopy } from "@tabler/icons-react";
import moment from "moment";
import { useRouter } from "next/router";
import RequestSignerList from "./RequestSignerList";

type Props = {
  request: RequestListItemType;
};

const useStyles = createStyles(() => ({
  requestor: {
    border: "solid 2px white",
  },
}));

const RequestItemRow = ({ request }: Props) => {
  const { classes } = useStyles();
  const router = useRouter();
  const defaultAvatarProps = { color: "blue", size: "sm", radius: "xl" };
  const {
    request_team_member: { team_member_user: requestor },
    request_signer,
  } = request;

  return (
    <Grid m={0} px="sm" py={0} justify="space-between">
      <Grid.Col span={2}>
        <Group spacing={0}>
          <Text truncate w={100}>
            {request.request_id}
          </Text>
          <CopyButton value={request.request_id}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? "Copied" : "Copy"} onClick={copy}>
                <ActionIcon>
                  <IconCopy size={16} />
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
        </Group>
      </Grid.Col>
      <Grid.Col span={3}>
        <Text>{request.request_form.form_name}</Text>
      </Grid.Col>
      <Grid.Col span={1}>
        <Badge
          variant="filled"
          color={getStatusToColor(request.request_status)}
        >
          {request.request_status}
        </Badge>
      </Grid.Col>

      <Grid.Col span="auto" offset={0.5}>
        <Flex px={0} gap={8} wrap="wrap">
          <Avatar
            src={requestor.user_avatar}
            {...defaultAvatarProps}
            color={getAvatarColor(Number(`${requestor.user_id.charCodeAt(0)}`))}
            className={classes.requestor}
          >
            {requestor.user_first_name[0] + requestor.user_last_name[0]}
          </Avatar>
          <Text>{`${requestor.user_first_name} ${requestor.user_last_name}`}</Text>
        </Flex>
      </Grid.Col>
      <Grid.Col span={1}>
        <RequestSignerList signerList={request_signer} />
      </Grid.Col>
      <Grid.Col span="content">
        <Text miw={105}>
          {moment(request.request_date_created).format("MMM DD, YYYY")}
        </Text>
      </Grid.Col>
      <Grid.Col span="content">
        <Group position="center">
          <ActionIcon
            color="blue"
            onClick={() =>
              router.push(`/team-requests/requests/${request.request_id}`)
            }
          >
            <IconArrowsMaximize size={16} />
          </ActionIcon>
        </Group>
      </Grid.Col>
    </Grid>
  );
};

export default RequestItemRow;
