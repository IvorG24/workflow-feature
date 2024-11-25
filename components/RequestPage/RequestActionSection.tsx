import {
  checkIfAllPrimaryApprovedTheRequest,
  getCurrentRequestStatus,
} from "@/backend/api/get";
import { useActiveTeam } from "@/stores/useTeamStore";
import { formatTeamNameToUrlKey } from "@/utils/string";
import { JiraTicketData } from "@/utils/types";
import { Button, Paper, Space, Stack, Title } from "@mantine/core";
// import { useRouter } from "next/router";
import { useDisclosure } from "@mantine/hooks";
import RequestConfirmModal from "../Modal/RequestConfirmModal";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useState } from "react";

type Props = {
  handleCancelRequest: () => void;
  openPromptDeleteModal: () => void;
  handleUpdateRequest: (
    status: "APPROVED" | "REJECTED",
    jiraId?: string,
    jiraLink?: string
  ) => void;
  isItemForm?: boolean;
  isUserPrimarySigner?: boolean;
  requestId: string;
  isEditable: boolean;
  isCancelable: boolean;
  canSignerTakeAction?: boolean;
  isDeletable: boolean;
  isUserRequester?: boolean;
  onCreateJiraTicket?: () => Promise<JiraTicketData>;
  requestSignerId?: string;
  status: string;
};

const RequestActionSection = ({
  handleCancelRequest,
  openPromptDeleteModal,
  handleUpdateRequest,
  isItemForm,
  isUserPrimarySigner,
  requestId,
  isEditable,
  isCancelable,
  canSignerTakeAction,
  isDeletable,
  isUserRequester,
  onCreateJiraTicket,
  requestSignerId,
  status,
}: Props) => {
  const router = useRouter();
  const activeTeam = useActiveTeam();
  const supabaseClient = useSupabaseClient();
  const [isLoading, setIsLoading] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const [requestAction, setRequestAction] = useState<string>("");

  const handleApproveItemRequest = async (
    onCreateJiraTicket: () => Promise<JiraTicketData>
  ) => {
    try {
      setIsLoading(true);

      // check if all primary approver approves the request
      if (!requestSignerId) return;

      const isAllPrimaryApprovedTheRequest =
        await checkIfAllPrimaryApprovedTheRequest(supabaseClient, {
          requestId: requestId,
          requestSignerId: requestSignerId,
        });

      if (isAllPrimaryApprovedTheRequest) {
        if (process.env.NODE_ENV === "production") {
          const { jiraTicketId, jiraTicketLink } = await onCreateJiraTicket();
          if (!jiraTicketId) {
            notifications.show({
              message: "Failed to create jira ticket",
              color: "red",
            });
            return;
          }

          handleUpdateRequest("APPROVED", jiraTicketId, jiraTicketLink);
        } else {
          handleUpdateRequest("APPROVED", "DEV-TEST-ONLY", "DEV-TEST-ONLY");
        }
      } else {
        handleUpdateRequest("APPROVED");
      }
    } catch (e) {
      notifications.show({
        message: "Failed to approve item request",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (action: string) => {
    try {
      const isStatusUpdated = await checkRequestStatus();
      if (!isStatusUpdated) {
        router.reload();
        return;
      }
      setRequestAction(action);
      open();
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const checkRequestStatus = async () => {
    const currentStatus = await getCurrentRequestStatus(supabaseClient, {
      requestId,
    });
    return status === currentStatus;
  };

  return (
    <Paper p="xl" shadow="xs">
      <RequestConfirmModal
        action={requestAction}
        opened={opened}
        close={close}
        isCreateJiraTicket={onCreateJiraTicket ? true : false}
        onCancelClick={() => close()}
        onConfirmClick={async () => {
          switch (requestAction) {
            case "approve":
              if (isItemForm && isUserPrimarySigner && onCreateJiraTicket) {
                handleApproveItemRequest(onCreateJiraTicket);
                close();
              } else {
                // handleUpdateRequest("APPROVED");
                console.log("ey");
                close();
              }
              break;
            case "reject":
              handleUpdateRequest("REJECTED");
              close();
              break;
            case "cancel":
              handleCancelRequest();
              close();
              break;
          }
        }}
      />
      <Title order={4} color="dimmed">
        Request Action
      </Title>
      <Space h="xl" />
      <Stack>
        {!isUserRequester === false && (
          <Button
            fullWidth
            onClick={async () =>
              await router.push(
                `/${formatTeamNameToUrlKey(
                  activeTeam.team_name ?? ""
                )}/requests/${router.query.requestId}/edit?referenceOnly=true`
              )
            }
            disabled={isLoading}
          >
            Reference this Request
          </Button>
        )}

        {canSignerTakeAction && (
          <>
            <Button
              color="green"
              fullWidth
              onClick={() => handleAction("approve")}
              disabled={isLoading}
            >
              Approve Request
            </Button>
            <Button
              color="red"
              fullWidth
              onClick={() => handleAction("reject")}
              disabled={isLoading}
            >
              Reject Request
            </Button>
          </>
        )}

        {isEditable && (
          <Button
            variant="outline"
            fullWidth
            onClick={async () =>
              await router.push(
                `/${formatTeamNameToUrlKey(
                  activeTeam.team_name ?? ""
                )}/requests/${router.query.requestId}/edit`
              )
            }
            disabled={isLoading}
          >
            Edit Request
          </Button>
        )}
        {isCancelable && (
          <Button
            variant="default"
            fullWidth
            onClick={() => handleAction("cancel")}
            disabled={isLoading}
          >
            Cancel Request
          </Button>
        )}
        {isDeletable && (
          <Button
            color="red"
            fullWidth
            onClick={openPromptDeleteModal}
            disabled={isLoading}
          >
            Delete Request
          </Button>
        )}
      </Stack>
    </Paper>
  );
};

export default RequestActionSection;
