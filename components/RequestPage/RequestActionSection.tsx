import { FormStatusType, RequestWithResponseType } from "@/utils/types";
import { Button, Paper, Space, Stack, Text, Title } from "@mantine/core";
import { useRouter } from "next/router";
// import { useRouter } from "next/router";
import { openConfirmModal } from "@mantine/modals";

type Props = {
  isUserOwner: boolean;
  requestStatus: FormStatusType;
  handleCancelRequest: () => void;
  openPromptDeleteModal: () => void;
  isUserSigner: boolean;
  handleUpdateRequest: (
    status: "APPROVED" | "REJECTED",
    additionalInfo?: string
  ) => void;
  isOTP?: boolean;
  sourcedOtpForm?: {
    form_name: string;
    form_id: string;
    form_group: string[];
    form_is_for_every_member: boolean;
  };
  requestId: string;
  isUserPrimarySigner: boolean;
  signer?: RequestWithResponseType["request_signer"][0];
};

const RequestActionSection = ({
  isUserOwner,
  requestStatus,
  handleCancelRequest,
  openPromptDeleteModal,
  isUserSigner,
  handleUpdateRequest,
  isOTP = false,
  sourcedOtpForm,
  requestId,
  isUserPrimarySigner,
  signer,
}: Props) => {
  const router = useRouter();

  const handleAction = (
    action: string,
    color: string,
    additionalInfo?: string
  ) => {
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
            handleUpdateRequest("APPROVED", additionalInfo);
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
  };

  return (
    <Paper p="xl" shadow="xs">
      <Title order={4} color="dimmed">
        Request Action
      </Title>
      <Space h="xl" />
      <Stack>
        {isUserSigner &&
          signer &&
          signer.request_signer_status === "PENDING" &&
          requestStatus === "PENDING" && (
            <>
              {!isOTP && (
                <Button
                  color="green"
                  fullWidth
                  onClick={() => handleAction("approve", "green")}
                >
                  Approve Request
                </Button>
              )}
              {isOTP && (
                <>
                  <Button
                    color="green"
                    fullWidth
                    onClick={() =>
                      handleAction("approve", "green", "FOR_PURCHASED")
                    }
                  >
                    For Purchased
                  </Button>
                  {sourcedOtpForm && isUserPrimarySigner && (
                    <Button
                      color="orange"
                      fullWidth
                      onClick={() => {
                        router.push(
                          `/team-requests/forms/${sourcedOtpForm.form_id}/create?otpId=${requestId}`
                        );
                      }}
                    >
                      Available Internally
                    </Button>
                  )}
                </>
              )}
              <Button
                color="red"
                fullWidth
                onClick={() => handleAction("reject", "red")}
              >
                Reject Request
              </Button>
            </>
          )}
        {isUserOwner && requestStatus === "PENDING" && (
          <>
            {/* <Button
              variant="outline"
              fullWidth
              onClick={() =>
                router.push(`/team-requests/requests/${requestId}/edit`)
              }
            >
              Edit Request
            </Button> */}
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
