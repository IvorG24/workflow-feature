import { useActiveTeam } from "@/stores/useTeamStore";
import { formatTeamNameToUrlKey, toTitleCase } from "@/utils/string";
import { getAvatarColor } from "@/utils/styling";
import { TicketListType } from "@/utils/types";
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

type Props = {
  ticket: TicketListType[0];
};

const useStyles = createStyles(() => ({
  requester: {
    border: "solid 2px white",
  },
}));

export const getTicketStatusColor = (status: string) => {
  switch (status) {
    case "CLOSED":
      return "green";

    case "PENDING":
      return "blue";

    case "INCORRECT":
      return "red";

    case "UNDER REVIEW":
      return "orange";

    default:
      break;
  }
};

const TicketListItem = ({ ticket }: Props) => {
  const { classes } = useStyles();
  const router = useRouter();
  const activeTeam = useActiveTeam();
  const activeTeamNameToUrlKey = formatTeamNameToUrlKey(
    activeTeam.team_name ?? ""
  );
  const defaultAvatarProps = { color: "blue", size: "sm", radius: "xl" };
  const requester = ticket.ticket_requester;
  const approver = ticket.ticket_approver;

  return (
    <Grid m={0} px="sm" py={0} justify="space-between">
      <Grid.Col span={2}>
        <Flex justify="space-between">
          <Text
            truncate
            maw={150}
            component="a"
            sx={{
              ":hover": {
                cursor: "pointer",
                textDecoration: "underline",
              },
            }}
            onClick={() =>
              router.push(
                `/${activeTeamNameToUrlKey}/tickets/${ticket.ticket_id}`
              )
            }
          >
            {ticket.ticket_id}
          </Text>
          <CopyButton value={ticket.ticket_id}>
            {({ copied, copy }) => (
              <Tooltip
                label={copied ? "Copied" : "Copy ticket id"}
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
      <Grid.Col span={2}>
        <Flex justify="space-between">
          <Text truncate maw={150}>
            {ticket.ticket_title}
          </Text>
        </Flex>
      </Grid.Col>

      <Grid.Col span={2}>
        <Text>{toTitleCase(ticket.ticket_category)}</Text>
      </Grid.Col>
      <Grid.Col span={1}>
        <Badge
          variant="filled"
          color={getTicketStatusColor(ticket.ticket_status)}
        >
          {ticket.ticket_status}
        </Badge>
      </Grid.Col>

      <Grid.Col span="auto" offset={0.5}>
        <Flex px={0} gap={8} wrap="wrap">
          <Avatar
            src={requester.user_avatar || null}
            {...defaultAvatarProps}
            color={getAvatarColor(
              Number(`${requester.team_member_id.charCodeAt(0)}`)
            )}
            className={classes.requester}
          ></Avatar>
          <Text>{`${requester.user_first_name} ${requester.user_last_name}`}</Text>
        </Flex>
      </Grid.Col>
      <Grid.Col span={1}>
        {ticket.ticket_approver_team_member_id && (
          <Flex px={0} gap={8} wrap="wrap">
            <Tooltip
              key={approver.user_id}
              label={`${approver.user_first_name} ${approver.user_last_name}`}
              withArrow
            >
              <Avatar
                src={approver.user_avatar || null}
                {...defaultAvatarProps}
                color={getAvatarColor(
                  Number(`${approver.team_member_id.charCodeAt(0)}`)
                )}
                className={classes.requester}
              >
                {approver.user_first_name[0] + approver.user_last_name[0]}
              </Avatar>
            </Tooltip>
          </Flex>
        )}
      </Grid.Col>
      <Grid.Col span="content">
        <Text miw={105}>
          {moment(ticket.ticket_date_created).format("YYYY-MM-DD")}
        </Text>
      </Grid.Col>
      <Grid.Col span="content">
        <Group position="center">
          <ActionIcon
            color="blue"
            onClick={() =>
              router.push(
                `/${activeTeamNameToUrlKey}/tickets/${ticket.ticket_id}`
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

export default TicketListItem;
