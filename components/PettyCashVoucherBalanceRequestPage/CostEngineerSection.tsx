import { useActiveTeam } from "@/stores/useTeamStore";
import { formatTeamNameToUrlKey } from "@/utils/string";
import {
  Button,
  Modal,
  Paper,
  Space,
  Stack,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
// import { useRouter } from "next/router";
import { useRouter } from "next/router";
import { useState } from "react";

type Props = {
  handleCostEngineerRejectRequest: (rejectionReason: string) => void;
};

const CostEngineerSection = ({ handleCostEngineerRejectRequest }: Props) => {
  const router = useRouter();
  const activeTeam = useActiveTeam();
  const [isLoading, setIsLoading] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const [rejectionReasonInputValue, setRejectionReasonInputValue] =
    useState("");

  const handleRejectRequest = async () => {
    try {
      setIsLoading(true);

      if (!rejectionReasonInputValue) {
        notifications.show({
          message: "Rejection reason is required.",
          color: "red",
        });

        return;
      }

      handleCostEngineerRejectRequest(rejectionReasonInputValue);
    } catch (error) {
      console.log(error);
      notifications.show({
        message: "Failed to reject request.",
        color: "red",
      });
    } finally {
      close();
      setIsLoading(false);
    }
  };

  return (
    <Paper p="xl" shadow="xs">
      <Title order={4} color="dimmed">
        Cost Engineer Section
      </Title>
      <Space h="xl" />
      <Stack>
        <Button
          fullWidth
          disabled={isLoading}
          onClick={() =>
            router.push(
              `/${formatTeamNameToUrlKey(
                activeTeam.team_name ?? ""
              )}/requests/${router.query.requestId}/edit`
            )
          }
        >
          Add Cost and BOQ Code
        </Button>

        <Button color="red" fullWidth disabled={isLoading} onClick={open}>
          Reject Request
        </Button>
      </Stack>
      <Modal
        centered
        opened={opened}
        onClose={close}
        title="Confirm your action"
      >
        <Stack>
          <Text weight={600}>Please state your reason.</Text>
          <Textarea
            placeholder="Write your reason here"
            minRows={4}
            required
            value={rejectionReasonInputValue}
            onChange={(e) =>
              setRejectionReasonInputValue(e.currentTarget.value)
            }
          />
          <Button fullWidth onClick={() => handleRejectRequest()}>
            Submit
          </Button>
        </Stack>
      </Modal>
    </Paper>
  );
};

export default CostEngineerSection;
