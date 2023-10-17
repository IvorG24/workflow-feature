import { updateTicketStatus } from "@/backend/api/update";
import { Database } from "@/utils/database";
import { TicketType } from "@/utils/types";
import { Button, Flex, Text, TextInput } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";

type Props = {
  ticketId: string;
  setTicket: Dispatch<SetStateAction<TicketType>>;
};

const TicketStatusAction = ({ ticketId, setTicket }: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const rejectTicketFormMethods = useForm<{ rejectionMessage: string }>({
    defaultValues: { rejectionMessage: "" },
  });

  const handleUpdateTicketStatus = async (
    status: string,
    rejectionMessage: string | null
  ) => {
    // 1. update ticket status
    // 2. add rejection message as comment to the ticket
    //   2.A. [Approver] rejected this request with note: [rejectionMessage]
    try {
      const data = await updateTicketStatus(supabaseClient, {
        ticketId,
        status,
        rejectionMessage,
      });

      setTicket((ticket) => ({ ...ticket, ticket_status: data.ticket_status }));

      // 1. update ticket (done)
      // 2. add comment explaining the changes made by admin. only comment the changes that occured
      // 3. example
      //    3.A. [Admin] has made the following changes on the ticket
      //         [Old Title] -> [New Title]
      //         [Old Description] -> [New Description]
      //    3.B. [Admin] has made the following changes on the ticket
      //         [Old Description] -> [New Description]
    } catch (error) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
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
              >
                Cancel
              </Button>
              <Button type="submit" color="red">
                Reject
              </Button>
            </Flex>
          </form>
        </>
      ),
    });

  return (
    <>
      <Text weight={600}>Ticket Action</Text>
      <Flex gap="xl" wrap="wrap">
        <Button
          sx={{ flex: 1 }}
          size="md"
          color="red"
          onClick={handleRejectTicketAction}
        >
          Reject
        </Button>
        <Button
          sx={{ flex: 1 }}
          size="md"
          color="green"
          onClick={() => handleUpdateTicketStatus("CLOSED", null)}
        >
          Close
        </Button>
      </Flex>
    </>
  );
};

export default TicketStatusAction;
