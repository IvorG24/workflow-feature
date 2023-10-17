import { assignTicket } from "@/backend/api/update";
import { Database } from "@/utils/database";
import { CreateTicketPageOnLoad, TicketType } from "@/utils/types";
import {
  Button,
  Container,
  Divider,
  Paper,
  Stack,
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import moment from "moment";
import { useState } from "react";
import TicketActionSection from "./TicketActionSection";
import TicketCommentSection, {
  TicketCommentType,
} from "./TicketCommentSection";
import TicketDetailSection from "./TicketDetailSection";
import TicketResponseSection from "./TicketResponseSection";

type Props = {
  ticket: TicketType;
  user: CreateTicketPageOnLoad["member"];
  commentList: TicketCommentType[];
};

const TicketPage = ({ ticket: initialTicket, user, commentList }: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const [currentCommentList, setCurrentCommentList] = useState(commentList);
  const [ticket, setTicket] = useState(initialTicket);
  const [isEditingResponse, setIsEditingResponse] = useState(false);

  const handleAssignTicketToUser = async () => {
    try {
      const currentUserFullName = `${user.team_member_user.user_first_name} ${user.team_member_user.user_last_name}`;
      const updatedTicket = await assignTicket(supabaseClient, {
        teamMemberId: user.team_member_id,
        ticketId: ticket.ticket_id,
      });

      setTicket(updatedTicket);
      const newComment = {
        ticket_comment_id: "78f78689-a898-47f5-bf3c-a3469c8eb34f",
        ticket_comment_content: `${currentUserFullName} is reviewing this ticket`,
        ticket_comment_is_edited: false,
        ticket_comment_is_disabled: false,
        ticket_comment_date_created: `${moment()}`,
        ticket_comment_type: "ACTION_UNDER_REVIEW",
        ticket_comment_team_member: {
          team_member_id: user.team_member_id,
          user: {
            user_id: user.team_member_user.user_id,
            user_first_name: user.team_member_user.user_first_name,
            user_last_name: user.team_member_user.user_last_name,
            user_avatar: `${user.team_member_user.user_avatar}`,
          },
        },
      };
      // add new comment
      setCurrentCommentList((prev) => [...prev, newComment]);
    } catch (error) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  return (
    <Container>
      <Paper p="md" withBorder>
        <Stack>
          {ticket.ticket_status === "PENDING" &&
            ticket.ticket_approver_team_member_id === null &&
            ticket.ticket_requester_team_member_id !== user.team_member_id &&
            (user.team_member_role === "ADMIN" ||
              user.team_member_role === "OWNER") && (
              <Tooltip label="You will be assigned to review this ticket.">
                <Button size="md" onClick={handleAssignTicketToUser}>
                  Assign To Me
                </Button>
              </Tooltip>
            )}
          <TicketDetailSection ticket={ticket} />

          <Divider mt="md" />
          <TicketResponseSection
            title={ticket.ticket_title}
            description={ticket.ticket_description}
            ticketStatus={ticket.ticket_status}
            user={user}
            isApprover={
              ticket.ticket_approver_team_member_id === user.team_member_id
            }
            setTicket={setTicket}
            isEditingResponse={isEditingResponse}
            setIsEditingResponse={setIsEditingResponse}
          />
          {ticket.ticket_status === "UNDER REVIEW" && !isEditingResponse && (
            <>
              <Divider mt="md" />
              <TicketActionSection
                ticketId={ticket.ticket_id}
                setTicket={setTicket}
              />
              <Divider mt="xl" />
            </>
          )}

          <TicketCommentSection commentList={currentCommentList} />
        </Stack>
      </Paper>
    </Container>
  );
};

export default TicketPage;
