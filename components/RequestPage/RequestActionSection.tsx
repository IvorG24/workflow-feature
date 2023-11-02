import {
  FormStatusType,
  JiraTicketConfig,
  RequestWithResponseType,
} from "@/utils/types";
import { Button, Flex, Paper, Space, Stack, Text, Title } from "@mantine/core";
// import { useRouter } from "next/router";
import { modals, openConfirmModal } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/router";

type Props = {
  isUserOwner: boolean;
  requestStatus: FormStatusType;
  handleCancelRequest: () => void;
  openPromptDeleteModal: () => void;
  isUserSigner: boolean;
  handleUpdateRequest: (
    status: "APPROVED" | "REJECTED",
    jiraId?: string,
    jiraLink?: string
  ) => void;
  signer?: RequestWithResponseType["request_signer"][0];
  isRf?: boolean;
  isCashPurchase?: boolean;
  isUserPrimarySigner?: boolean;
  isEditable?: boolean;
  jiraId?: string | null;
};

type JiraTicketDataType = {
  id: string;
  key: string;
  self: string;
};

const RequestActionSection = ({
  isUserOwner,
  requestStatus,
  handleCancelRequest,
  openPromptDeleteModal,
  isUserSigner,
  handleUpdateRequest,
  signer,
  isRf,
  isCashPurchase,
  isUserPrimarySigner,
  isEditable,
}: // jiraId,
Props) => {
  const router = useRouter();

  const createJiraTicket = async (ticketConfig: JiraTicketConfig) => {
    try {
      const jiraTicket = await fetch("/api/create-jira-ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ticketConfig),
      });

      if (jiraTicket.ok) {
        const jiraTicketResponse = await jiraTicket.json();
        console.log(jiraTicketResponse);
        return jiraTicketResponse;
      } else {
        console.error("Jira API request failed:", jiraTicket.statusText);
        notifications.show({
          message: "Failed to create Jira ticket",
          color: "red",
        });
        return null;
      }
    } catch (error) {
      console.error("An error occurred while making the request:", error);
    }
  };

  // const deleteJiraTicket = () => {
  //   console.log(jiraId);
  // };

  const handleApproveRequisitionRequest = async () => {
    try {
      const ticketConfig = {
        project_key: "FT",
        issue_type_name: "Requisition Form",
        summary: "Test Ticket",
        description:
          "Creating of an issue using ids for projects and issue types using the REST API",
      };

      const jiraTicket: JiraTicketDataType | null = await createJiraTicket(
        ticketConfig
      );

      if (!jiraTicket) throw Error;

      handleUpdateRequest("APPROVED", jiraTicket.id, jiraTicket.self);
    } catch (error) {
      console.log(error);
      notifications.show({
        message: "Failed to approve requisition request",
        color: "red",
      });
    }
  };

  const handleAction = (action: string, color: string) => {
    if (
      isRf &&
      action === "approve" &&
      isUserPrimarySigner &&
      !isCashPurchase
    ) {
      modals.open({
        modalId: "approveRf",
        title: <Text>Please confirm your action.</Text>,
        children: (
          <>
            <Text size={14}>
              Are you sure you want to {action} this request?
            </Text>
            <Flex mt="md" align="center" justify="flex-end" gap="sm">
              <Button
                variant="default"
                color="dimmed"
                onClick={() => {
                  modals.close("approveRf");
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                color="green"
                onClick={async () => {
                  await handleApproveRequisitionRequest();
                  modals.close("approveRf");
                }}
              >
                Approve
              </Button>
            </Flex>
          </>
        ),
        centered: true,
      });
    } else {
      openConfirmModal({
        title: <Text>Please confirm your action.</Text>,
        children: (
          <Text size={14}>Are you sure you want to {action} this request?</Text>
        ),
        labels: { confirm: "Confirm", cancel: "Cancel" },
        centered: true,
        confirmProps: { color },

        onConfirm: () => {
          switch (action) {
            case "approve":
              handleUpdateRequest("APPROVED");
              break;
            case "reject":
              handleUpdateRequest("REJECTED");
              break;
            case "cancel":
              handleCancelRequest();
              break;
          }
        },
      });
    }
  };

  const canSignerTakeAction =
    isUserSigner &&
    signer?.request_signer_status === "PENDING" &&
    requestStatus !== "CANCELED";

  return (
    <Paper p="xl" shadow="xs">
      <Title order={4} color="dimmed">
        Request Action
      </Title>
      <Space h="xl" />
      <Stack>
        {canSignerTakeAction && (
          <>
            <Button
              color="green"
              fullWidth
              onClick={() => handleAction("approve", "green")}
            >
              Approve Request
            </Button>
            <Button
              color="red"
              fullWidth
              onClick={() => handleAction("reject", "red")}
            >
              Reject Request
            </Button>
          </>
        )}
        {isUserOwner && requestStatus === "PENDING" && isEditable && (
          <>
            <Button
              variant="outline"
              fullWidth
              onClick={() =>
                router.push(
                  `/team-requests/requests/${router.query.requestId}/edit`
                )
              }
            >
              Edit Request
            </Button>
            <Button
              variant="default"
              fullWidth
              onClick={() => handleAction("cancel", "blue")}
            >
              Cancel Request
            </Button>
          </>
        )}
        {isUserOwner && requestStatus === "CANCELED" && (
          <Button color="red" fullWidth onClick={openPromptDeleteModal}>
            Delete Request
          </Button>
        )}
      </Stack>
    </Paper>
  );
};

export default RequestActionSection;
