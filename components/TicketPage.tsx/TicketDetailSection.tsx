import { formatDate } from "@/utils/constant";
import { getAvatarColor } from "@/utils/styling";
import { TicketType } from "@/utils/types";
import {
  Avatar,
  Badge,
  Divider,
  Flex,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { getTicketStatusColor } from "../TicketListPage/TicketListItem";

type Props = {
  ticket: TicketType;
  ticketStatus: string;
};

const TicketDetailSection = ({ ticket, ticketStatus }: Props) => {
  const requester = ticket.ticket_requester;
  const approver = ticket.ticket_approver;
  return (
    <Stack>
      <Title order={3}>Ticket Request</Title>

      <Flex gap="xs">
        <Avatar
          size="sm"
          src={requester.team_member_user.user_avatar}
          color={getAvatarColor(
            Number(`${requester.team_member_id.charCodeAt(0)}`)
          )}
          radius="xl"
        >
          {(
            requester.team_member_user.user_first_name[0] +
            requester.team_member_user.user_last_name[0]
          ).toUpperCase()}
        </Avatar>
        <Text>
          {`${requester.team_member_user.user_first_name} ${requester.team_member_user.user_last_name} opened this ticket on `}
          <Text span weight={600}>
            {formatDate(new Date(ticket.ticket_date_created))}
          </Text>
        </Text>
      </Flex>
      {approver && (
        <Flex gap="xs">
          <Avatar
            size="sm"
            src={approver.team_member_user.user_avatar}
            color={getAvatarColor(
              Number(`${approver.team_member_id.charCodeAt(0)}`)
            )}
            radius="xl"
          >
            {(
              approver.team_member_user.user_first_name[0] +
              approver.team_member_user.user_last_name[0]
            ).toUpperCase()}
          </Avatar>
          <Text>
            {`${approver.team_member_user.user_first_name} ${
              approver.team_member_user.user_last_name
            } reviewed this ticket and marked as '${ticketStatus.toLowerCase()}' on `}
            <Text span weight={600}>
              {ticket.ticket_status_date_updated &&
                formatDate(new Date(ticket.ticket_status_date_updated))}
            </Text>
          </Text>
        </Flex>
      )}
      <Divider />
      <Stack spacing={4}>
        <Text>Category</Text>
        <Text weight={600}>{ticket.ticket_category}</Text>
      </Stack>
      <Stack spacing={4}>
        <Text>Status</Text>
        <Badge
          w="fit-content"
          size="lg"
          color={getTicketStatusColor(ticketStatus)}
        >
          {ticketStatus}
        </Badge>
      </Stack>
    </Stack>
  );
};

export default TicketDetailSection;
