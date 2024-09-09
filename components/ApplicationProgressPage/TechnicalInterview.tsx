import { getInterview } from "@/backend/api/get";
import { formatDate } from "@/utils/constant";
import { getStatusToColor } from "@/utils/styling";
import { TechnicalInterviewTableRow } from "@/utils/types";
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
  technicalInterviewData: TechnicalInterviewTableRow;
  technicalInterviewNumber?: number;
};
const TechnicalInterview = ({
  technicalInterviewData: initialData,
  technicalInterviewNumber,
}: Props) => {
  const supabaseClient = useSupabaseClient();
  const [technicalInterviewData, setPhoneInterviewData] =
    useState<TechnicalInterviewTableRow>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [status, setStatus] = useState<string>(
    technicalInterviewData.technical_interview_status
  );
  const [isReadyToSelect, setIsReadyToSelect] = useState(false);

  const refetchData = async () => {
    try {
      setIsFetching(true);
      const targetId = technicalInterviewData.technical_interview_id;
      const data = await getInterview(supabaseClient, {
        interviewId: targetId,
        table: "technical_interview",
        interviewNumber: technicalInterviewNumber,
      });
      setPhoneInterviewData(data);
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
      <Title order={3}>Technical Interview {technicalInterviewNumber}</Title>
      <Stack>
        <Group>
          <Text>Date Created: </Text>
          <Title order={5}>
            {formatDate(
              new Date(
                technicalInterviewData.technical_interview_date_created ?? ""
              )
            )}
          </Title>
        </Group>
        <Group>
          <Text>Status: </Text>
          <Badge color={getStatusToColor(status ?? "")}>{status}</Badge>
          {technicalInterviewData.technical_interview_status_date_updated && (
            <Text color="dimmed">
              on{" "}
              {formatDate(
                new Date(
                  technicalInterviewData.technical_interview_status_date_updated
                )
              )}
            </Text>
          )}
        </Group>
        {status && (
          <SchedulingCalendar
            setIsReadyToSelect={setIsReadyToSelect}
            isReadyToSelect={isReadyToSelect}
            refetchData={refetchData}
            meetingType="technical_interview"
            meetingTypeNumber={technicalInterviewNumber}
            dateCreated={
              technicalInterviewData.technical_interview_date_created
            }
            targetId={technicalInterviewData.technical_interview_id}
            intialDate={technicalInterviewData.technical_interview_schedule}
            status={status}
            setStatus={setStatus}
            setIsLoading={setIsLoading}
            isRefetchingData={isFetching}
          />
        )}
        <Box mb={"xl"}>
          {!isReadyToSelect &&
            technicalInterviewData.technical_interview_status === "PENDING" && (
              <Alert title="Note!" icon={<IconNote size={16} />}>
                <Text>
                  Your Technical Interview is scheduled. The meeting link will
                  be made available on the exact date of the meeting. Please
                  wait for further details and let us know if you have any
                  questions. Looking forward to speaking with you soon!
                </Text>
              </Alert>
            )}
        </Box>
      </Stack>
    </Stack>
  );
};

export default TechnicalInterview;
