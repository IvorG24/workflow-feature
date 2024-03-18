import { useFormList } from "@/stores/useFormStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import { formatDate } from "@/utils/constant";
import { formatTeamNameToUrlKey } from "@/utils/string";
import { getAvatarColor, getStatusToColor } from "@/utils/styling";
import {
  RequestListItemSignerType,
  RequestListItemType,
  TeamMemberWithUserType,
} from "@/utils/types";
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
import { useRouter } from "next/router";
import RequestSignerList from "./RequestSignerList";

type Props = {
  request: RequestListItemType;
  teamMemberList: TeamMemberWithUserType[];
};

const useStyles = createStyles(() => ({
  requestor: {
    border: "solid 2px white",
    cursor: "pointer",
  },
  clickable: {
    cursor: "pointer",
  },
}));

const RequestItemRow = ({ request, teamMemberList }: Props) => {
  const { classes } = useStyles();
  const router = useRouter();
  const activeTeam = useActiveTeam();
  const teamForms = useFormList();
  const matchForm = teamForms.find(
    (form) => form.form_id === request.request_form_id
  );
  const defaultAvatarProps = { color: "blue", size: "sm", radius: "xl" };

  const requestor = teamMemberList.find(
    (member) => member.team_member_id === request.request_team_member_id
  );
  const requestorUserData = requestor ? requestor.team_member_user : null;

  const requestId =
    request.request_formsly_id === "-"
      ? request.request_id
      : request.request_formsly_id;

  const request_signer = request.request_signer.map((signer) => {
    const signerTeamMemberData = teamMemberList.find(
      (member) =>
        member.team_member_id === signer.request_signer.signer_team_member_id
    );

    return {
      ...signer,
      signer_team_member_user: signerTeamMemberData?.team_member_user,
    };
  });

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

          <CopyButton
            value={`${
              process.env.NEXT_PUBLIC_SITE_URL
            }/${formatTeamNameToUrlKey(
              activeTeam.team_name ?? ""
            )}/requests/${requestId}`}
          >
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
        <Tooltip label={matchForm?.form_name} openDelay={2000}>
          <Text truncate>{matchForm?.form_name}</Text>
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
        {requestorUserData ? (
          <Flex px={0} gap={8} wrap="wrap">
            <Avatar
              // src={requestor.user_avatar}
              {...defaultAvatarProps}
              color={getAvatarColor(
                Number(`${requestorUserData?.user_id.charCodeAt(0)}`)
              )}
              className={classes.requestor}
              onClick={() =>
                window.open(`/member/${request.request_team_member_id}`)
              }
            >
              {requestorUserData.user_first_name[0] +
                requestorUserData.user_last_name[0]}
            </Avatar>
            <Anchor
              href={`/member/${request.request_team_member_id}`}
              target="_blank"
            >
              <Text>{`${requestorUserData?.user_first_name} ${requestorUserData?.user_last_name}`}</Text>
            </Anchor>
          </Flex>
        ) : (
          <></>
        )}
      </Grid.Col>
      <Grid.Col span={1}>
        <RequestSignerList
          signerList={request_signer as RequestListItemSignerType[]}
        />
      </Grid.Col>
      <Grid.Col span="content">
        <Text miw={105}>
          {formatDate(new Date(request.request_date_created))}
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
