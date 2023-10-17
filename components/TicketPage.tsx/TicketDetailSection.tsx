import { TicketListItemType } from "@/pages/team-requests/tickets";
import { getAvatarColor } from "@/utils/styling";
import {
  Avatar,
  Badge,
  Divider,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import moment from "moment";
import { getTicketStatusColor } from "../TicketListPage/TicketListItem";

type Props = {
  ticket: TicketListItemType;
  currentTicketStatus: string;
};

const TicketDetailSection = ({ ticket, currentTicketStatus }: Props) => {
  const requester = ticket.ticket_requester;
  return (
    <Stack>
      <Title order={3}>Ticket Request</Title>
      <Group spacing={8}>
        <Avatar
          size="sm"
          src={requester.user.user_avatar}
          color={getAvatarColor(
            Number(`${requester.team_member_id.charCodeAt(0)}`)
          )}
          radius="xl"
        >
          {(
            requester.user.user_first_name[0] + requester.user.user_last_name[0]
          ).toUpperCase()}
        </Avatar>
        <Text>
          {`${requester.user.user_first_name} ${requester.user.user_last_name} opened this ticket on `}
          <Text span weight={600}>
            {moment(ticket.ticket_date_created).format("MMM DD, YYYY")}
          </Text>
        </Text>
      </Group>
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
          color={getTicketStatusColor(currentTicketStatus)}
        >
          {currentTicketStatus}
        </Badge>
      </Stack>
    </Stack>
  );
};

export default TicketDetailSection;
