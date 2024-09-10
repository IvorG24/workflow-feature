import { getInterview } from "@/backend/api/get";
import { formatDate } from "@/utils/constant";
import { getStatusToColor } from "@/utils/styling";
import { TradeTestTableRow } from "@/utils/types";
import {
  Alert,
  Badge,
  Box,
  Group,
  LoadingOverlay,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { IconNote } from "@tabler/icons-react";
import { useState } from "react";
import SchedulingCalendar from "./SchedulingCalendar";

type Props = {
  tradeTestData: TradeTestTableRow;
};
const TradeTest = ({ tradeTestData: initialData }: Props) => {
  const supabaseClient = useSupabaseClient();
  const [tradeTestData, setTradeTestData] =
    useState<TradeTestTableRow>(initialData);
  const [status, setStatus] = useState(tradeTestData.trade_test_status);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isReadyToSelect, setIsReadyToSelect] = useState(false);

  const refetchData = async () => {
    try {
      setIsFetching(true);
      const targetId = tradeTestData.trade_test_id;
      const data = await getInterview(supabaseClient, {
        interviewId: targetId,
        table: "trade_test",
      });
      setTradeTestData(data);
    } catch (error) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <Stack spacing="xl" sx={{ flex: 1 }}>
      <LoadingOverlay visible={isLoading} />
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
          <Badge color={getStatusToColor(status ?? "")}>{status}</Badge>
          {tradeTestData.trade_test_status_date_updated && (
            <Text color="dimmed">
              on{" "}
              {formatDate(
                new Date(tradeTestData.trade_test_status_date_updated)
              )}
            </Text>
          )}
        </Group>
        {status && (
          <SchedulingCalendar
            setIsReadyToSelect={setIsReadyToSelect}
            isReadyToSelect={isReadyToSelect}
            refetchData={refetchData}
            meetingType="trade_test"
            dateCreated={tradeTestData.trade_test_date_created}
            targetId={tradeTestData.trade_test_id}
            intialDate={tradeTestData.trade_test_schedule}
            setIsLoading={setIsLoading}
            status={status}
            setStatus={setStatus}
            setIsFetching={setIsFetching}
            isRefetchingData={isFetching}
          />
        )}
        <Box mb={"xl"}>
          {!isReadyToSelect &&
            tradeTestData.trade_test_status === "PENDING" && (
              <Alert title="Note!" icon={<IconNote size={16} />}>
                <Text>
                  Your Trade Test is scheduled. The meeting link will be made
                  available on the exact date of the meeting. Please wait for
                  further details and let us know if you have any questions.
                  Looking forward to speaking with you soon!
                </Text>
              </Alert>
            )}
        </Box>
      </Stack>
    </Stack>
  );
};

export default TradeTest;
