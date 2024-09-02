import { formatDate, formatTime } from "@/utils/constant";
import { getStatusToColor } from "@/utils/styling";
import { TradeTestTableRow } from "@/utils/types";
import { Alert, Badge, Group, Stack, Text, Title } from "@mantine/core";
import { IconNote } from "@tabler/icons-react";

type Props = {
  tradeTestData: TradeTestTableRow;
};
const TradeTest = ({ tradeTestData }: Props) => {
  return (
    <Stack spacing="xl" sx={{ flex: 1 }}>
      <Title order={3}>Trade Test</Title>
      <Stack>
        <Group>
          <Text>Date Created: </Text>
          <Title order={5}>
            {formatDate(new Date(tradeTestData.trade_test_date_created ?? ""))}
          </Title>
        </Group>
        <Group>
          <Text>Status: </Text>
          <Badge
            color={getStatusToColor(tradeTestData.trade_test_status ?? "")}
          >
            {tradeTestData.trade_test_status}
          </Badge>
          {tradeTestData.trade_test_status_date_updated && (
            <Text color="dimmed">
              on{" "}
              {formatDate(
                new Date(tradeTestData.trade_test_status_date_updated)
              )}
            </Text>
          )}
        </Group>
        {tradeTestData.trade_test_schedule && (
          <>
            <Group>
              <Text>Schedule Date: </Text>
              <Title order={5}>
                {formatDate(new Date(tradeTestData.trade_test_schedule))}
              </Title>
            </Group>
            <Group>
              <Text>Schedule Time: </Text>
              <Title order={5}>
                {formatTime(new Date(tradeTestData.trade_test_schedule))}
              </Title>
            </Group>
          </>
        )}
        {tradeTestData.trade_test_status === "WAITING FOR SCHEDULE" && (
          <Alert mb="xl" title="Note!" icon={<IconNote size={16} />}>
            <Text>
              Thank you for your application. We are currently reviewing your
              informations, and we’re excited to connect with you soon. Please
              look forward for the trade test schedule.
            </Text>
          </Alert>
        )}
      </Stack>
    </Stack>
  );
};

export default TradeTest;
