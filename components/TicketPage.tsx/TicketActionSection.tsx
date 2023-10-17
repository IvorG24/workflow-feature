import { Button, Flex, Text, TextInput } from "@mantine/core";
import { modals } from "@mantine/modals";
import { useForm } from "react-hook-form";

type Props = {
  ticketStatus: string;
  ticketId: string;
};

const TicketStatusAction = ({ ticketStatus, ticketId }: Props) => {
  const rejectTicketFormMethods = useForm<{ rejectionMessage: string }>({
    defaultValues: { rejectionMessage: "" },
  });

  const handleUpdateTicketStatus = (
    status: string,
    rejectionMessage?: string
  ) => {
    // 1. update ticket status
    // 2. add rejection message as comment to the ticket
    //   2.A. [Approver] rejected this request with note: [rejectionMessage]
    console.log("Update status:", ticketId, status, rejectionMessage);
  };

  const handleRejectTicketAction = () =>
    modals.open({
      modalId: "rejectTicket",
      title: "Please add a reason why you rejected this ticket",
      centered: true,
      children: (
        <>
          <form
            onSubmit={rejectTicketFormMethods.handleSubmit((data) => {
              handleUpdateTicketStatus("INCORRECT", data.rejectionMessage);
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
      {ticketStatus === "PENDING" && (
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
              onClick={() => handleUpdateTicketStatus("CLOSED")}
            >
              Close
            </Button>
          </Flex>
        </>
      )}
    </>
  );
};

export default TicketStatusAction;
