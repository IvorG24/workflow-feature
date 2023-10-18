import { createNotification, createTicketComment } from "@/backend/api/post";
import { editTicketResponse } from "@/backend/api/update";
import { useUserTeamMember } from "@/stores/useUserStore";
import { Database } from "@/utils/database";
import { CreateTicketPageOnLoad, TicketType } from "@/utils/types";
import {
  Box,
  Button,
  Flex,
  Group,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";

type Props = {
  ticket: TicketType;
  setTicket: Dispatch<SetStateAction<TicketType>>;
  user: CreateTicketPageOnLoad["member"];
  isApprover: boolean;
  setIsEditingResponse: Dispatch<SetStateAction<boolean>>;
  isEditingResponse: boolean;
};

type TicketResponseFormValues = {
  title: string;
  description: string;
};

const TicketResponseSection = ({
  ticket,
  user,
  isApprover,
  setTicket,
  isEditingResponse,
  setIsEditingResponse,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const router = useRouter();
  const teamMember = useUserTeamMember();
  const canUserEditResponse =
    ["ADMIN", "OWNER"].includes(user.team_member_role || "") && isApprover;

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<TicketResponseFormValues>({
    defaultValues: {
      title: ticket.ticket_title,
      description: ticket.ticket_description,
    },
  });

  const handleEditResponse = async (data: TicketResponseFormValues) => {
    if (!teamMember) return;
    try {
      await editTicketResponse(supabaseClient, {
        ...data,
        ticketId: `${router.query.ticketId}`,
      });

      const newCommentId = uuidv4();

      let ticketChanges = "";
      if (ticket.ticket_title !== data.title)
        ticketChanges = `<p>The <strong>title</strong> has been changed.
                        <br>
                        <br>
                        <strong>From:</strong> 
                        <br>
                        ${ticket.ticket_title}
                        <br>
                        <br>
                        <strong>To:</strong> 
                        <br>
                        ${data.title}</p>`;

      const addHorizontalLine =
        ticket.ticket_title !== data.title ? "<hr>" : "";

      if (ticket.ticket_description !== data.description)
        ticketChanges += `
                          ${addHorizontalLine}
                          <p>The <strong>description</strong> has been changed.
                          <br>
                          <br>
                          <strong>From:</strong>
                          <br>
                          ${ticket.ticket_description}
                          <br>
                          <br>
                          <strong>To:</strong>
                          <br>
                          ${data.description}</p>`;

      const { error } = await createTicketComment(supabaseClient, {
        ticket_comment_id: newCommentId,
        ticket_comment_content: `<p>${user.team_member_user.user_first_name} ${user.team_member_user.user_last_name} has made the following changes on the ticket.</p>\n${ticketChanges}`,
        ticket_comment_type: "ACTION_OVERRIDE",
        ticket_comment_team_member_id: user.team_member_id,
        ticket_comment_ticket_id: ticket.ticket_id,
      });
      if (error) throw error;

      if (!error) {
        if (ticket.ticket_requester_team_member_id !== user.team_member_id) {
          await createNotification(supabaseClient, {
            notification_app: "REQUEST",
            notification_type: "COMMENT",
            notification_content: `${`${user.team_member_user.user_first_name} ${user.team_member_user.user_last_name}`} overrode your ticket`,
            notification_redirect_url: `/team-requests/tickets/${ticket.ticket_id}`,
            notification_user_id:
              ticket.ticket_requester.team_member_user.user_id,
            notification_team_id: teamMember.team_member_team_id,
          });
        }
      }

      setTicket((ticket) => ({
        ...ticket,
        ticket_title: data.title,
        ticket_description: data.description,
      }));
    } catch (error) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsEditingResponse(false);
    }
  };

  return (
    <Stack spacing={16}>
      <Group position="apart">
        <Group spacing={8}>
          <Text weight={600}>Request Details</Text>
          {isEditingResponse && (
            <Text size="xs" color="blue">
              (Edit Mode)
            </Text>
          )}
        </Group>
        {canUserEditResponse &&
          ticket.ticket_status === "UNDER REVIEW" &&
          (isEditingResponse ? (
            <Button
              sx={{ alignSelf: "flex-end" }}
              w={100}
              size="sm"
              variant="default"
              onClick={() => {
                setIsEditingResponse(false);
              }}
            >
              Cancel
            </Button>
          ) : (
            <Button
              sx={{ alignSelf: "flex-end" }}
              w={100}
              size="sm"
              color="yellow"
              onClick={() => {
                setIsEditingResponse(true);
              }}
            >
              Override
            </Button>
          ))}
      </Group>

      {isEditingResponse ? (
        <form onSubmit={handleSubmit(handleEditResponse)}>
          <Stack>
            <TextInput
              sx={{ flex: 1 }}
              label="Title"
              {...register("title", {
                required: "This field is required",
              })}
              error={errors.title?.message}
              readOnly={!isEditingResponse}
            />

            <Textarea
              label="Description"
              {...register("description", {
                required: "This field is required",
              })}
              error={errors.description?.message}
              readOnly={!isEditingResponse}
            />
            {isEditingResponse ? (
              <Button type="submit" size="md">
                Save Changes
              </Button>
            ) : null}
          </Stack>
        </form>
      ) : (
        <Stack>
          <Box>
            <Text size={14} weight={600}>
              Title
            </Text>
            <Text>{ticket.ticket_title}</Text>
          </Box>

          <Box>
            <Text size={14} weight={600}>
              Description
            </Text>

            <Flex direction="column">
              {ticket.ticket_description.split("\n").map((line, id) => (
                <Text key={id}>{line}</Text>
              ))}
            </Flex>
          </Box>
        </Stack>
      )}
    </Stack>
  );
};

export default TicketResponseSection;
