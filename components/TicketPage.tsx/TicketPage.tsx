import { TicketListItemType } from "@/pages/team-requests/tickets";
import { Container, Divider, Paper, Stack } from "@mantine/core";
import TicketActionSection from "./TicketActionSection";
import TicketDetailSection from "./TicketDetailSection";
import TicketResponseSection from "./TicketResponseSection";

type Props = {
  ticket: TicketListItemType;
};

const TicketPage = ({ ticket }: Props) => {
  return (
    <Container>
      <Paper p="md" withBorder>
        <Stack>
          <TicketDetailSection ticket={ticket} />
          <Divider />
          <TicketResponseSection
            title={ticket.ticket_title}
            description={ticket.ticket_description}
            ticketStatus={ticket.ticket_status}
          />
          <Divider />
          <TicketActionSection
            ticketId={ticket.ticket_id}
            ticketStatus={ticket.ticket_status}
          />
        </Stack>
      </Paper>
    </Container>
  );
};

export default TicketPage;
