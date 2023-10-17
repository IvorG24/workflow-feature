import { useUserProfile, useUserTeamMember } from "@/stores/useUserStore";
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

const TicketPage = ({ ticket, user, commentList }: Props) => {
  const currentUserProfile = useUserProfile();
  const currentUserTeamMember = useUserTeamMember();
  const [currentCommentList, setCurrentCommentList] = useState(commentList);
  const [currentTicketStatus, setCurrentTicketStatus] = useState(
    ticket.ticket_status
  );
  const [showTicketActionSection, setShowTicketActionSection] = useState(
    ticket.ticket_approver_team_member_id === user.team_member_id
  );

  const handleAssignTicketToUser = () => {
    try {
      if (!currentUserProfile || !currentUserTeamMember) return;
      const currentUserFullName = `${currentUserProfile.user_first_name} ${currentUserProfile.user_last_name}`;
      setCurrentTicketStatus("UNDER REVIEW");

      const newComment = {
        ticket_comment_id: "78f78689-a898-47f5-bf3c-a3469c8eb34f",
        ticket_comment_content: `${currentUserFullName} is reviewing this ticket`,
        ticket_comment_is_edited: false,
        ticket_comment_is_disabled: false,
        ticket_comment_date_created: `${moment()}`,
        ticket_comment_type: "ACTION_UNDER_REVIEW",
        ticket_comment_team_member: {
          team_member_id: currentUserTeamMember.team_member_id,
          user: {
            user_id: currentUserProfile.user_id,
            user_first_name: currentUserProfile.user_first_name,
            user_last_name: currentUserProfile.user_last_name,
            user_avatar: `${currentUserProfile.user_avatar}`,
          },
        },
      };
      console.log(Date.now());
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
          {currentTicketStatus === "PENDING" &&
            ticket.ticket_approver_team_member_id === null &&
            (user.team_member_role === "ADMIN" ||
              user.team_member_role === "OWNER") && (
              <Tooltip label="You will be assigned to review this ticket.">
                <Button size="md" onClick={handleAssignTicketToUser}>
                  Assign To Me
                </Button>
              </Tooltip>
            )}
          <TicketDetailSection
            ticket={ticket}
            currentTicketStatus={currentTicketStatus}
          />

          <Divider mt="md" />
          <TicketResponseSection
            title={ticket.ticket_title}
            description={ticket.ticket_description}
            ticketStatus={currentTicketStatus}
            setShowTicketActionSection={setShowTicketActionSection}
            isApprover={
              ticket.ticket_approver_team_member_id === user.team_member_id
            }
          />
          {showTicketActionSection && (
            <>
              <Divider mt="md" />
              <TicketActionSection
                ticketId={ticket.ticket_id}
                ticketStatus={currentTicketStatus}
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
