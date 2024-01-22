import { useActiveTeam } from "@/stores/useTeamStore";
import { formatTeamNameToUrlKey } from "@/utils/string";
import { getAvatarColor, getStatusToColor } from "@/utils/styling";
import { RequestListItemType } from "@/utils/types";
import {
  ActionIcon,
  Anchor,
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
  const activeTeam = useActiveTeam();
  const defaultAvatarProps = { color: "blue", size: "sm", radius: "xl" };
  const {
    request_team_member: { team_member_user: requestor },
    request_signer,
  } = request;

  const requestId =
    request.request_formsly_id === "-"
      ? request.request_id
      : request.request_formsly_id;

  return (
    <Grid m={0} px="sm" py={0} justify="space-between">
      <Grid.Col span={1}>
        <Flex justify="space-between">
          <Text truncate maw={150}>
            <Anchor
              href={`/${formatTeamNameToUrlKey(
                activeTeam.team_name ?? ""
              )}/requests/${requestId}`}
              target="_blank"
            >
              {requestId}
            </Anchor>
          </Text>

          <CopyButton value="temp">
            {({ copied, copy }) => (
              <Tooltip
                label={
                  copied
                    ? "Copied"
                    : `Copy ${request.request_formsly_id ?? request.request_id}`
                }
                onClick={copy}
              >
                <ActionIcon>
                  <IconCopy size={16} />
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
        </Flex>
      </Grid.Col>
      <Grid.Col span={1}>
        <Flex justify="space-between">
          <Text truncate maw={150}>
            <Anchor href={request.request_jira_link} target="_blank">
              {request.request_jira_id}
            </Anchor>
          </Text>
          {request.request_jira_id && (
            <CopyButton value={request.request_jira_id}>
              {({ copied, copy }) => (
                <Tooltip
                  label={copied ? "Copied" : `Copy ${request.request_jira_id}`}
                  onClick={copy}
                >
                  <ActionIcon>
                    <IconCopy size={16} />
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
          )}
        </Flex>
      </Grid.Col>
      <Grid.Col span={1}>
        <Flex justify="space-between">
          <Text truncate maw={150}>
            {request.request_otp_id}
          </Text>
          {request.request_otp_id && (
            <CopyButton value={request.request_otp_id}>
              {({ copied, copy }) => (
                <Tooltip
                  label={copied ? "Copied" : `Copy ${request.request_otp_id}`}
                  onClick={copy}
                >
                  <ActionIcon>
                    <IconCopy size={16} />
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
          )}
        </Flex>
      </Grid.Col>

      <Grid.Col span={2}>
        <Tooltip label={request.request_form.form_name} openDelay={2000}>
          <Text truncate>{request.request_form.form_name}</Text>
        </Tooltip>
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
          <Anchor
            href={`/member/${request.request_team_member.team_member_id}`}
            target="_blank"
          >
            <Text>{`${requestor.user_first_name} ${requestor.user_last_name}`}</Text>
          </Anchor>
        </Flex>
      </Grid.Col>
      <Grid.Col span={1}>
        <RequestSignerList signerList={request_signer} />
      </Grid.Col>
      <Grid.Col span="content">
        <Text miw={105}>
          {moment(request.request_date_created).format("YYYY-MM-DD")}
        </Text>
      </Grid.Col>
      <Grid.Col span="content">
        <Group position="center">
          <ActionIcon
            color="blue"
            onClick={() =>
              router.push(
                `/${formatTeamNameToUrlKey(
                  activeTeam.team_name ?? ""
                )}/requests/${requestId}`
              )
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
