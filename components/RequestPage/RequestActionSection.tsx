import { FormStatusType, RequestWithResponseType } from "@/utils/types";
import { Button, Paper, Space, Stack, Title } from "@mantine/core";
import { useRouter } from "next/router";
// import { useRouter } from "next/router";

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

  return (
    <Paper p="xl" shadow="xs">
      <Title order={4} color="dimmed">
        Request Action
      </Title>
      <Space h="xl" />
      <Stack>
        {isUserSigner &&
          signer &&
          signer.request_signer_status === "PENDING" && (
            <>
              {!isOTP && (
                <Button
                  color="green"
                  fullWidth
                  onClick={() => handleUpdateRequest("APPROVED")}
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
                      handleUpdateRequest("APPROVED", "FOR_PURCHASED")
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
                onClick={() => handleUpdateRequest("REJECTED")}
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
            <Button variant="default" fullWidth onClick={handleCancelRequest}>
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
