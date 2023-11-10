import { Button, Paper, Space, Stack, Text, Title } from "@mantine/core";
// import { useRouter } from "next/router";
import { openConfirmModal } from "@mantine/modals";

type Props = {
  handleReverseApproval: () => void;
};

const RequestReverseActionSection = ({ handleReverseApproval }: Props) => {
  const openPromptReverseApproval = () => {
    openConfirmModal({
      title: <Text>Please confirm your action reversal.</Text>,
      children: (
        <Text size={16}>Are you sure you want to reverse your approval?</Text>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      centered: true,
      confirmProps: { color: "orange" },

      onConfirm: () => {
        handleReverseApproval();
      },
    });
  };

  return (
    <Paper p="xl" shadow="xs">
      <Title order={4} color="dimmed">
        Reverse Request Action
      </Title>
      <Space h="xl" />
      <Stack>
        <Button color="orange" fullWidth onClick={openPromptReverseApproval}>
          Reverse Approval
        </Button>
      </Stack>
    </Paper>
  );
};

export default RequestReverseActionSection;
