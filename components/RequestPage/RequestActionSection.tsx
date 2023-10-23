import {
  checkIfJiraIDIsUnique,
  checkIfJiraLinkIsUnique,
} from "@/backend/api/get";
import { Database } from "@/utils/database";
import { isValidUrl } from "@/utils/functions";
import { FormStatusType, RequestWithResponseType } from "@/utils/types";
import {
  Button,
  Flex,
  Paper,
  Space,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
// import { useRouter } from "next/router";
import { modals, openConfirmModal } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { IconId, IconLink } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";

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
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<{ jiraId: string; jiraLink: string }>();

  const resetValue = () => {
    setValue("jiraId", "");
    setValue("jiraLink", "");
    setError("jiraId", { message: "" });
    setError("jiraLink", { message: "" });
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
            <form
              onSubmit={handleSubmit((data) => {
                if (!isValidUrl(data.jiraLink)) {
                  notifications.show({
                    message: "Enter a valid link.",
                    color: "red",
                  });
                  return;
                }
                handleUpdateRequest("APPROVED", data.jiraId, data.jiraLink);
                modals.close("approveRf");
              })}
            >
              <Stack mt="xl" spacing="xs">
                <TextInput
                  icon={<IconId size={16} />}
                  placeholder="Jira ID"
                  data-autofocus
                  {...register("jiraId", {
                    validate: {
                      required: (value) => {
                        if (!value) {
                          notifications.show({
                            message: "Jira ID is required.",
                            color: "red",
                          });
                          return "Jira ID is required.";
                        } else {
                          return true;
                        }
                      },
                      checkIfUnique: async (value) => {
                        if (
                          await checkIfJiraIDIsUnique(supabaseClient, {
                            value: value,
                          })
                        ) {
                          notifications.show({
                            message: "Jira ID already exists.",
                            color: "red",
                          });
                          return "Jira ID already exists.";
                        } else {
                          return true;
                        }
                      },
                    },
                  })}
                  error={errors.jiraId?.message}
                />
                <TextInput
                  icon={<IconLink size={16} />}
                  placeholder="Jira Link"
                  data-autofocus
                  {...register("jiraLink", {
                    validate: {
                      required: (value) => {
                        if (!value) {
                          notifications.show({
                            message: "Jira Link is required.",
                            color: "red",
                          });
                          return "Jira Link is required.";
                        } else {
                          return true;
                        }
                      },
                      checkIfUnique: async (value) => {
                        if (
                          await checkIfJiraLinkIsUnique(supabaseClient, {
                            value: value,
                          })
                        ) {
                          notifications.show({
                            message: "Jira Link already exists.",
                            color: "red",
                          });
                          return "Jira Link already exists.";
                        } else {
                          return true;
                        }
                      },
                    },
                  })}
                  error={errors.jiraLink?.message}
                />
              </Stack>

              <Flex mt="md" align="center" justify="flex-end" gap="sm">
                <Button
                  variant="default"
                  color="dimmed"
                  onClick={() => {
                    resetValue();
                    modals.close("approveRf");
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" color="green">
                  Approve
                </Button>
              </Flex>
            </form>
          </>
        ),
        centered: true,
        onClose: () => {
          resetValue();
        },
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
