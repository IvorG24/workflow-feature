import { formatDate } from "@/utils/constant";
import { getStatusToColor } from "@/utils/styling";
import { JobOfferTableRow } from "@/utils/types";
import { Alert, Badge, Group, Stack, Text, Title } from "@mantine/core";
import { IconNote } from "@tabler/icons-react";

type Props = {
  jobOfferData: JobOfferTableRow;
};
const JobOffer = ({ jobOfferData }: Props) => {
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
          <Badge color={getStatusToColor(jobOfferData.job_offer_status ?? "")}>
            {jobOfferData.job_offer_status}
          </Badge>
          {jobOfferData.job_offer_status_date_updated && (
            <Text color="dimmed">
              on{" "}
              {formatDate(new Date(jobOfferData.job_offer_status_date_updated))}
            </Text>
          )}
        </Group>
        {jobOfferData.job_offer_status === "PENDING" && (
          <Alert mb="xl" title="Note!" icon={<IconNote size={16} />}>
            <Text>
              Thank you for your application. We are currently reviewing your
              informations, and we’re excited to connect with you soon. Please
              look forward for the job offer information.
            </Text>
          </Alert>
        )}
      </Stack>
    </Stack>
  );
};

export default JobOffer;
