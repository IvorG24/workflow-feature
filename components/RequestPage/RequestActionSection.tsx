import {
  checkIfAllPrimaryApprovedTheRequest,
  getRequestStatus,
} from "@/backend/api/get";
import { updateRequestStatus } from "@/backend/api/update";
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
import { useBeforeunload } from "react-beforeunload";

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
}: Props) => {
  const router = useRouter();
  const activeTeam = useActiveTeam();
  const supabaseClient = useSupabaseClient();
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckIfRequestIsBeingProcessed = async (requestId: string) => {
    const currentStatus = await getRequestStatus(supabaseClient, { requestId });
    if (currentStatus === "PENDING") {
      await updateRequestStatus(supabaseClient, {
        requestId,
        status: "PROCESSING",
      });
    }
    return currentStatus === "PROCESSING";
  };

  const handleRevertStatusToPendingIfStillProcessing = async () => {
    const isBeingProcessed = await handleCheckIfRequestIsBeingProcessed(
      requestId
    );
    if (isBeingProcessed) {
      await updateRequestStatus(supabaseClient, {
        requestId,
        status: "PENDING",
      });
    }
  };

  const handleApproveItemRequest = async (
    onCreateJiraTicket: () => Promise<JiraTicketData>
  ) => {
    try {
      setIsLoading(true);
      // check if request is being processed
      const isBeingProcessed = await handleCheckIfRequestIsBeingProcessed(
        requestId
      );
      if (isBeingProcessed) {
        notifications.show({
          message: "This request is being processed.",
          color: "orange",
        });
        return;
      }

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
    } catch (error) {
      notifications.show({
        message: "Failed to approve item request",
        color: "red",
      });
    } finally {
      await handleRevertStatusToPendingIfStillProcessing();
      setIsLoading(false);
    }
  };

  useBeforeunload(async () => {
    await handleRevertStatusToPendingIfStillProcessing();
  });

  const handleAction = (action: string, color: string) => {
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

              // <form
              //   onSubmit={handleSubmit(async (data) => {
              //     const checkJiraIdIfValid = await isValidJiraId(data.jiraId);
              //     if (checkJiraIdIfValid) {
              //       handleUpdateRequest("APPROVED", data.jiraId.toUpperCase());
              //       modals.close("approveRf");
              //     } else {
              //       notifications.show({
              //         message: "Jira ID is invalid or does not exist.",
              //         color: "red",
              //       });
              //       return "Jira ID is invalid.";
              //     }
              //   })}
              // >
              //   <Stack mt="xl" spacing="xs">
              //     <TextInput
              //       icon={<IconId size={16} />}
              //       placeholder="Jira ID"
              //       data-autofocus
              //       {...register("jiraId", {
              //         validate: {
              //           required: (value) => {
              //             if (!value) {
              //               notifications.show({
              //                 message: "Jira ID is required.",
              //                 color: "red",
              //               });
              //               return "Jira ID is required.";
              //             } else {
              //               return true;
              //             }
              //           },
              //           checkIfUnique: async (value) => {
              //             if (
              //               await checkIfJiraIDIsUnique(supabaseClient, {
              //                 value: value.toUpperCase(),
              //               })
              //             ) {
              //               notifications.show({
              //                 message:
              //                   "Jira ID is already used by another request.",
              //                 color: "red",
              //               });
              //               return "Jira ID is already used by another request.";
              //             } else {
              //               return true;
              //             }
              //           },
              //         },
              //       })}
              //       error={errors.jiraId?.message}
              //     />
              //   </Stack>

              //   <Flex mt="md" align="center" justify="flex-end" gap="sm">
              //     <Button
              //       variant="default"
              //       color="dimmed"
              //       onClick={() => {
              //         resetValue();
              //         modals.close("approveRf");
              //       }}
              //     >
              //       Cancel
              //     </Button>
              //     <Button type="submit" color="green">
              //       Approve
              //     </Button>
              //   </Flex>
              // </form>
            )}
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
            onClick={() =>
              router.push(
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
            onClick={() =>
              router.push(
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
