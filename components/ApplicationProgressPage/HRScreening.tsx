import { formatDate } from "@/utils/constant";
import { getStatusToColor } from "@/utils/styling";
import { HRScreeningTableRow } from "@/utils/types";
import { Alert, Badge, Group, Stack, Text, Title } from "@mantine/core";
import { IconNote } from "@tabler/icons-react";

type Props = {
  hrScreeningData: HRScreeningTableRow;
};
const HRScreening = ({ hrScreeningData }: Props) => {
  return (
    <Stack spacing="xl" sx={{ flex: 1 }}>
      <Title order={3}>HR Screening</Title>
      <Stack>
        <Group>
          <Text>Date Created: </Text>
          <Title order={5}>
            {formatDate(
              new Date(hrScreeningData.hr_screening_date_created ?? "")
            )}
          </Title>
        </Group>
        <Group>
          <Text>Status: </Text>
          <Badge
            color={getStatusToColor(hrScreeningData.hr_screening_status ?? "")}
          >
            {hrScreeningData.hr_screening_status}
          </Badge>
          {hrScreeningData.hr_screening_status_date_updated && (
            <Text color="dimmed">
              on{" "}
              {formatDate(
                new Date(hrScreeningData.hr_screening_status_date_updated)
              )}
            </Text>
          )}
        </Group>
        {hrScreeningData.hr_screening_status === "PENDING" && (
          <Alert mb="xl" title="Note!" icon={<IconNote size={16} />}>
            <Text>
              Thank you for your application. We are currently reviewing your
              informations, and we’re excited to connect with you soon. Please
              look forward to a call from our HR team in the coming days.
            </Text>
          </Alert>
        )}
      </Stack>
    </Stack>
  );
};

export default HRScreening;
