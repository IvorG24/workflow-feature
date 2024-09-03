import { updateJobOfferStatus } from "@/backend/api/update";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { formatDate } from "@/utils/constant";
import { Database } from "@/utils/database";
import { getStatusToColor } from "@/utils/styling";
import { AttachmentTableRow, JobOfferTableRow } from "@/utils/types";
import { Alert, Badge, Button, Group, Stack, Text, Title } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { IconFile, IconNote } from "@tabler/icons-react";
import { useEffect, useState } from "react";

type Props = {
  jobOfferData: JobOfferTableRow & AttachmentTableRow;
};
const JobOffer = ({ jobOfferData }: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [initialStatus, setInitialStatus] = useState(
    jobOfferData.job_offer_status
  );
  const { setIsLoading } = useLoadingActions();

  useEffect(() => {
    const attachment_public_url = supabaseClient.storage
      .from(jobOfferData.attachment_bucket)
      .getPublicUrl(`${jobOfferData.attachment_value}`).data.publicUrl;
    setAttachmentUrl(attachment_public_url);
  }, [jobOfferData]);

  const handleUpdateJobOffer = async (action: string) => {
    try {
      setIsLoading(true);
      const newStatus = action === "Accept" ? "ACCEPTED" : "REJECTED";
      await updateJobOfferStatus(supabaseClient, {
        jobOfferId: jobOfferData.job_offer_id,
        status: newStatus,
      });

      setInitialStatus(newStatus);
      notifications.show({
        message: `Job offer ${action === "Accept" ? "accepted" : "rejected"}.`,
        color: "green",
      });
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openModel = (action: string) =>
    modals.openConfirmModal({
      title: <Text>Please confirm your action.</Text>,
      children: (
        <Text>{`Are you sure you want to ${action.toLocaleLowerCase()} this job offer?`}</Text>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      centered: true,
      confirmProps: {
        color: action === "Accept" ? "green" : "red",
      },
      onConfirm: async () => handleUpdateJobOffer(action),
    });

  return (
    <Stack spacing="xl" sx={{ flex: 1 }}>
      <Title order={3}>Job Offer</Title>
      <Stack>
        <Group>
          <Text>Date Created: </Text>
          <Title order={5}>
            {formatDate(new Date(jobOfferData.job_offer_date_created ?? ""))}
          </Title>
        </Group>
        <Group>
          <Text>Status: </Text>
          <Badge color={getStatusToColor(initialStatus ?? "")}>
            {initialStatus}
          </Badge>
          {jobOfferData.job_offer_status_date_updated && (
            <Text color="dimmed">
              on{" "}
              {formatDate(new Date(jobOfferData.job_offer_status_date_updated))}
            </Text>
          )}
        </Group>
        {initialStatus === "WAITING FOR OFFER" && (
          <Alert mb="xl" title="Note!" icon={<IconNote size={16} />}>
            <Text>
              Thank you for your application. We are currently reviewing your
              informations, and we’re excited to connect with you soon. Please
              look forward for the job offer information.
            </Text>
          </Alert>
        )}
        {jobOfferData.job_offer_attachment_id && (
          <>
            <Group>
              <Text>Job Title: </Text>
              <Title order={5}>{jobOfferData.job_offer_title}</Title>
            </Group>
            <Group>
              <Text>Job Offer: </Text>
              <Button
                variant="light"
                rightIcon={<IconFile size={16} />}
                onClick={() => {
                  window.open(attachmentUrl, "_blank");
                }}
              >
                View Job Offer
              </Button>
            </Group>
          </>
        )}
        {initialStatus === "PENDING" && (
          <Group>
            <Text>Action: </Text>
            <Group spacing="xs">
              <Button color="green" w={100} onClick={() => openModel("Accept")}>
                Accept
              </Button>
              <Button color="red" w={100} onClick={() => openModel("Reject")}>
                Reject
              </Button>
            </Group>
          </Group>
        )}
        {initialStatus === "ACCEPTED" && (
          <Alert mb="xl" title="Note!" icon={<IconNote size={16} />}>
            <Text>
              We appreciate you taking us up on our job offer. Kindly expect to
              get the message from HR.
            </Text>
          </Alert>
        )}
      </Stack>
    </Stack>
  );
};

export default JobOffer;
