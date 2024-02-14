import {
  checkCSICodeDescriptionExists,
  checkCSICodeExists,
} from "@/backend/api/get";
import {
  createCustomCSI,
  createNotification,
  createTicketComment,
} from "@/backend/api/post";
import { updateTicketStatus } from "@/backend/api/update";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserTeamMember } from "@/stores/useUserStore";
import { Database } from "@/utils/database";
import { formatTeamNameToUrlKey, parseJSONIfValid } from "@/utils/string";
import {
  CreateTicketFormValues,
  CreateTicketPageOnLoad,
  TicketType,
} from "@/utils/types";
import { Button, Flex, Text, TextInput } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";

type Props = {
  ticket: TicketType;
  ticketForm: CreateTicketFormValues;
  setTicket: Dispatch<SetStateAction<TicketType>>;
  user: CreateTicketPageOnLoad["member"];
};

const TicketStatusAction = ({ ticket, ticketForm, setTicket, user }: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const activeTeam = useActiveTeam();
  const teamMember = useUserTeamMember();
  const rejectTicketFormMethods = useForm<{ rejectionMessage: string }>({
    defaultValues: { rejectionMessage: "" },
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateTicketStatus = async (
    status: string,
    rejectionMessage: string | null
  ) => {
    if (!teamMember) return;
    try {
      setIsLoading(true);
      const data = await updateTicketStatus(supabaseClient, {
        ticketId: ticket.ticket_id,
        status,
        rejectionMessage,
      });

      const newCommentId = uuidv4();
      let commentContent = "";
      let notificationContent = "";
      let notificationType = "REQUEST";

      if (status === "INCORRECT" && rejectionMessage) {
        commentContent = `rejected this ticket with note: ${rejectionMessage}`;
        notificationContent = `rejected your ticket`;
        notificationType = "REJECT";
      }
      if (status === "CLOSED") {
        commentContent = `closed this ticket`;
        notificationContent = `closed your ticket`;
        notificationType = "APPROVE";
      }

      const { error } = await createTicketComment(supabaseClient, {
        ticket_comment_id: newCommentId,
        ticket_comment_content: `${user.team_member_user.user_first_name} ${user.team_member_user.user_last_name} ${commentContent}`,
        ticket_comment_type: `ACTION_${status}`,
        ticket_comment_team_member_id: user.team_member_id,
        ticket_comment_ticket_id: ticket.ticket_id,
      });
      if (error) throw error;

      if (!error) {
        if (ticket.ticket_requester_team_member_id !== user.team_member_id) {
          // create notification
          await createNotification(supabaseClient, {
            notification_app: "REQUEST",
            notification_type: notificationType,
            notification_content: `${`${user.team_member_user.user_first_name} ${user.team_member_user.user_last_name}`} ${notificationContent}`,
            notification_redirect_url: `/${formatTeamNameToUrlKey(
              activeTeam.team_name ?? ""
            )}/tickets/${ticket.ticket_id}`,
            notification_user_id:
              ticket.ticket_requester.team_member_user.user_id,
            notification_team_id: teamMember.team_member_team_id,
          });
        }
      }

      setTicket((ticket) => ({ ...ticket, ticket_status: data.ticket_status }));
    } catch (error) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectTicketAction = () =>
    modals.open({
      modalId: "rejectTicket",
      title: "Please add a reason why you rejected this ticket",
      centered: true,
      children: (
        <>
          <form
            onSubmit={rejectTicketFormMethods.handleSubmit(async (data) => {
              await handleUpdateTicketStatus(
                "INCORRECT",
                data.rejectionMessage
              );
              modals.close("rejectTicket");
            })}
          >
            <TextInput
              label="Rejection Message"
              {...rejectTicketFormMethods.register("rejectionMessage", {
                required: "This field is required",
              })}
            />
            <Flex mt="md" align="center" justify="flex-end" gap="sm">
              <Button
                variant="default"
                color="dimmed"
                onClick={() => {
                  modals.close("rejectTicket");
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" color="red" loading={isLoading}>
                Reject
              </Button>
            </Flex>
          </form>
        </>
      ),
    });

  const handleTicketClosing = async () => {
    switch (ticket.ticket_category) {
      case "Request Custom CSI":
        return handleCustomCSIClosing();
      default:
        return true;
    }
  };

  const handleCustomCSIClosing = async () => {
    try {
      setIsLoading(true);

      // check if csi exists
      const itemName = parseJSONIfValid(
        `${ticketForm.ticket_sections[0].ticket_section_fields[0].ticket_field_response}`
      );
      const csiCodeDescription = parseJSONIfValid(
        `${ticketForm.ticket_sections[0].ticket_section_fields[1].ticket_field_response}`
      );
      const csiCode = parseJSONIfValid(
        `${ticketForm.ticket_sections[0].ticket_section_fields[2].ticket_field_response}`
      );

      const csiCodeDescriptionExists = await checkCSICodeDescriptionExists(
        supabaseClient,
        { csiCodeDescription }
      );

      const csiCodeExists = await checkCSICodeExists(supabaseClient, {
        csiCode,
      });

      if (csiCodeDescriptionExists || csiCodeExists) return false;
      // add custom csi
      const csiAdded = await createCustomCSI(supabaseClient, {
        csiCode,
        csiCodeDescription,
        itemName,
      });

      return csiAdded;
    } catch {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Text weight={600}>Ticket Action</Text>
      <Flex gap="xl" wrap="wrap">
        <Button
          sx={{ flex: 1 }}
          size="md"
          color="red"
          onClick={handleRejectTicketAction}
          loading={isLoading}
        >
          Reject
        </Button>
        <Button
          sx={{ flex: 1 }}
          size="md"
          color="green"
          loading={isLoading}
          onClick={async () => {
            const canClose = await handleTicketClosing();
            if (canClose) handleUpdateTicketStatus("CLOSED", null);
            else {
              notifications.show({
                message: "Ticket can't be closed. Please try again later.",
                color: "orange",
              });
            }
          }}
        >
          Close
        </Button>
      </Flex>
    </>
  );
};

export default TicketStatusAction;
