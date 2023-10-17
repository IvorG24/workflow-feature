import { TicketListItemType } from "@/pages/team-requests/tickets";
import { useUserTeamMember } from "@/stores/useUserStore";
import { Container, Divider, Paper, Stack } from "@mantine/core";
import { useState } from "react";
import TicketActionSection from "./TicketActionSection";
import TicketCommentSection, {
  TicketCommentType,
} from "./TicketCommentSection";
import TicketDetailSection from "./TicketDetailSection";
import TicketResponseSection from "./TicketResponseSection";

type Props = {
  ticket: TicketListItemType;
  commentList: TicketCommentType[];
};

const TicketPage = ({ ticket, commentList }: Props) => {
  const currentUser = useUserTeamMember();
  const [showTicketActionSection, setShowTicketActionSection] = useState(
    ["OWNER", "ADMIN"].includes(`${currentUser?.team_member_role}`)
  );

  return (
    <Container>
      <Paper p="md" withBorder>
        <Stack>
          <TicketDetailSection ticket={ticket} />
          <Divider mt="md" />
          <TicketResponseSection
            title={ticket.ticket_title}
            description={ticket.ticket_description}
            ticketStatus={ticket.ticket_status}
            setShowTicketActionSection={setShowTicketActionSection}
          />
          {showTicketActionSection && (
            <>
              <Divider mt="md" />
              <TicketActionSection
                ticketId={ticket.ticket_id}
                ticketStatus={ticket.ticket_status}
              />
            </>
          )}

          <Divider mt="xl" />
          <TicketCommentSection commentList={commentList} />
        </Stack>
      </Paper>
    </Container>
  );
};

export default TicketPage;
