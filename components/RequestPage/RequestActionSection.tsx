import {
  checkIfAllPrimaryApprovedTheRequest,
  getCurrentRequestStatus,
} from "@/backend/api/get";
import { useActiveTeam } from "@/stores/useTeamStore";
import { formatTeamNameToUrlKey } from "@/utils/string";
import { JiraTicketData } from "@/utils/types";
import { Button, Flex, Paper, Space, Stack, Text, Title } from "@mantine/core";
// import { useRouter } from "next/router";
import { modals, openConfirmModal } from "@mantine/modals";
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

  const handleAction = async (action: string, color: string) => {
    try {
      const isStatusUpdated = await checkRequestStatus();
      if (!isStatusUpdated) {
        router.reload();
        return;
      }

      if (isItemForm && action === "approve" && isUserPrimarySigner) {
        modals.open({
          modalId: "approveRf",
          title: <Text>Please confirm your action.</Text>,
          children: (
            <>
              <Text size={14}>
                Are you sure you want to {action} this request?
              </Text>
              {onCreateJiraTicket ? (
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
                      modals.close("approveRf");
                      handleApproveItemRequest(onCreateJiraTicket);
                    }}
                  >
                    Approve
                  </Button>
                </Flex>
              ) : (
                <>
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
                        modals.close("approveRf");
                        handleUpdateRequest("APPROVED");
                      }}
                    >
                      Approve
                    </Button>
                  </Flex>
                </>
              )}
            </>
          ),
          centered: true,
        });
      } else {
        openConfirmModal({
          title: <Text>Please confirm your action.</Text>,
          children: (
            <Text size={14}>
              Are you sure you want to {action} this request?
            </Text>
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
              onClick={() => handleAction("approve", "green")}
              disabled={isLoading}
            >
              Approve Request
            </Button>
            <Button
              color="red"
              fullWidth
              onClick={() => handleAction("reject", "red")}
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
            onClick={() => handleAction("cancel", "blue")}
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
