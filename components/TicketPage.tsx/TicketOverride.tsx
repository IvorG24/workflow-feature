import { CreateTicketFormValues } from "@/utils/types";
import { useState } from "react";
import TicketForm from "../CreateTicketPage/TicketForm";
import TicketRequestCustomCSIForm from "../TicketRequestCustomCSIForm/TicketRequestCustomCSIForm";
import TicketRequestItemCSIForm from "../TicketRequestItemCSIForm/TicketRequestItemCSIForm";

type Props = {
  category: string;
  ticketForm: CreateTicketFormValues;
  memberId: string;
};

const TicketOverride = ({
  category,
  ticketForm: initialTicketForm,
  memberId,
}: Props) => {
  const [isLoading, setIsLoading] = useState(false);

  const ticketForm: CreateTicketFormValues = {
    ticket_sections: initialTicketForm.ticket_sections.map((section) => ({
      ...section,
      ticket_section_fields: section.ticket_section_fields.map((field) => ({
        ...field,
        ticket_field_response: `${JSON.parse(
          `${field.ticket_field_response}`
        )}`,
      })),
    })),
  };

  // const handleEditResponse = async (data: TicketResponseFormValues) => {
  //     if (!teamMember) return;
  //     try {
  //       await editTicketResponse(supabaseClient, {
  //         ...data,
  //         ticketId: `${router.query.ticketId}`,
  //       });

  //       const newCommentId = uuidv4();

  //       let ticketChanges = "";
  //       if (ticket.ticket_title !== data.title)
  //         ticketChanges = `<p>The <strong>title</strong> has been changed.
  //                         <br>
  //                         <br>
  //                         <strong>From:</strong>
  //                         <br>
  //                         ${ticket.ticket_title}
  //                         <br>
  //                         <br>
  //                         <strong>To:</strong>
  //                         <br>
  //                         ${data.title}</p>`;

  //       const addHorizontalLine =
  //         ticket.ticket_title !== data.title ? "<hr>" : "";

  //       if (ticket.ticket_description !== data.description)
  //         ticketChanges += `
  //                           ${addHorizontalLine}
  //                           <p>The <strong>description</strong> has been changed.
  //                           <br>
  //                           <br>
  //                           <strong>From:</strong>
  //                           <br>
  //                           ${ticket.ticket_description}
  //                           <br>
  //                           <br>
  //                           <strong>To:</strong>
  //                           <br>
  //                           ${data.description}</p>`;

  //       const { error } = await createTicketComment(supabaseClient, {
  //         ticket_comment_id: newCommentId,
  //         ticket_comment_content: `<p>${user.team_member_user.user_first_name} ${user.team_member_user.user_last_name} has made the following changes on the ticket.</p>\n${ticketChanges}`,
  //         ticket_comment_type: "ACTION_OVERRIDE",
  //         ticket_comment_team_member_id: user.team_member_id,
  //         ticket_comment_ticket_id: ticket.ticket_id,
  //       });
  //       if (error) throw error;

  //       if (!error) {
  //         if (ticket.ticket_requester_team_member_id !== user.team_member_id) {
  //           await createNotification(supabaseClient, {
  //             notification_app: "REQUEST",
  //             notification_type: "COMMENT",
  //             notification_content: `${`${user.team_member_user.user_first_name} ${user.team_member_user.user_last_name}`} overrode your ticket`,
  //             notification_redirect_url: `/${formatTeamNameToUrlKey(
  //               activeTeam.team_name ?? ""
  //             )}/tickets/${ticket.ticket_id}`,
  //             notification_user_id:
  //               ticket.ticket_requester.team_member_user.user_id,
  //             notification_team_id: teamMember.team_member_team_id,
  //           });
  //         }
  //       }

  //       setTicket((ticket) => ({
  //         ...ticket,
  //         ticket_title: data.title,
  //         ticket_description: data.description,
  //       }));
  //     } catch (error) {
  //       notifications.show({
  //         message: "Something went wrong. Please try again later.",
  //         color: "red",
  //       });
  //     } finally {
  //       setIsEditingResponse(false);
  //     }
  //   };
  const renderTicketForm = () => {
    switch (category) {
      case "Request Custom CSI":
        return (
          <TicketRequestCustomCSIForm
            category={category}
            memberId={memberId}
            ticketForm={ticketForm}
            setIsLoading={setIsLoading}
          />
        );
      case "Request Item CSI":
        return (
          <TicketRequestItemCSIForm
            category={category}
            memberId={memberId}
            ticketForm={ticketForm}
            setIsLoading={setIsLoading}
          />
        );
      default:
        return (
          <TicketForm
            category={category}
            memberId={memberId}
            ticketForm={ticketForm}
            setIsLoading={setIsLoading}
            isEdit={true}
          />
        );
    }
  };
  return renderTicketForm();
};

export default TicketOverride;
