import { Modal, Flex, Button, Text } from "@mantine/core";

const RequestConfirmModal = ({
  action,
  opened,
  close,
  onCancelClick,
  isCreateJiraTicket,
  onConfirmClick,
}: {
  action: string;
  opened: boolean;
  close: () => void;
  isCreateJiraTicket?: boolean;
  onCancelClick: () => void;
  onConfirmClick: () => void;
}) => {
  return (
    <Modal
      opened={opened}
      onClose={close}
      centered
      title="Please confirm your action"
      transitionProps={{ transition: "fade", duration: 200 }}
    >
      <Text size={14}>Are you sure you want to {action} this request?</Text>
      <Flex mt="md" align="center" justify="flex-end" gap="sm">
        <Button variant="default" color="dimmed" onClick={onCancelClick}>
          Cancel
        </Button>
        <Button
          data-autofocus
          type="submit"
          onKeyDown={(e) => {
            if (e.key !== "Enter") {
              e.preventDefault();
            }
          }}
          color={
            action === "approve"
              ? "green"
              : action === "reject"
              ? "red"
              : "blue"
          }
          onClick={onConfirmClick}
        >
          {action === "approve" && isCreateJiraTicket
            ? "Approve"
            : action === "reject" && isCreateJiraTicket
            ? "Reject"
            : action === "cancel"
            ? "Cancel"
            : "Confirm"}
        </Button>
      </Flex>
    </Modal>
  );
};

export default RequestConfirmModal;
