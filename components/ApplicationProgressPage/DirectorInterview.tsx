import { getInterview } from "@/backend/api/get";
import { formatDate } from "@/utils/constant";
import { getStatusToColor } from "@/utils/styling";
import { DirectorInterviewTableRow } from "@/utils/types";
import { Alert, Badge, Box, Group, Stack, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { IconNote } from "@tabler/icons-react";
import { useState } from "react";
import SchedulingCalendar from "./SchedulingCalendar";

type Props = {
  directorInterviewData: DirectorInterviewTableRow;
};
const DirectorInterview = ({ directorInterviewData: initialData }: Props) => {
  const supabaseClient = useSupabaseClient();
  const [directorInterviewData, setDirectorInterviewData] =
    useState<DirectorInterviewTableRow>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [isReadyToSelect, setIsReadyToSelect] = useState(false);

  const refetchData = async () => {
    try {
      setIsLoading(true);
      const targetId = directorInterviewData.director_interview_id;
      const data = await getInterview(supabaseClient, {
        interviewId: targetId,
        table: "director_interview",
      });
      setDirectorInterviewData(data);
    } catch (error) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Stack spacing="xl" sx={{ flex: 1 }}>
      <Title order={3}>Director Interview</Title>
      <Stack>
        <Group>
          <Text>Date Created: </Text>
          <Title order={5}>
            {formatDate(
              new Date(
                directorInterviewData.director_interview_date_created ?? ""
              )
            )}
          </Title>
        </Group>
        <Group>
          <Text>Status: </Text>
          <Badge
            color={getStatusToColor(
              directorInterviewData.director_interview_status ?? ""
            )}
          >
            {directorInterviewData.director_interview_status}
          </Badge>
          {directorInterviewData.director_interview_status_date_updated && (
            <Text color="dimmed">
              on{" "}
              {formatDate(
                new Date(
                  directorInterviewData.director_interview_status_date_updated
                )
              )}
            </Text>
          )}
        </Group>
        {["PENDING", "WAITING FOR SCHEDULE", "CANCELLED", "QUALIFIED"].includes(
          directorInterviewData.director_interview_status
        ) && (
          <SchedulingCalendar
            setIsReadyToSelect={setIsReadyToSelect}
            isReadyToSelect={isReadyToSelect}
            refetchData={refetchData}
            meetingType="director_interview"
            dateCreated={directorInterviewData.director_interview_date_created}
            targetId={directorInterviewData.director_interview_id}
            intialDate={directorInterviewData.director_interview_schedule}
            status={directorInterviewData.director_interview_status}
            isRefetchingData={isLoading}
          />
        )}
        <Box mb={"xl"}>
          {!isReadyToSelect &&
            directorInterviewData.director_interview_status === "PENDING" && (
              <Alert title="Note!" icon={<IconNote size={16} />}>
                <Text>
                  Your Director Interview is scheduled. The meeting link will be
                  made available on the exact date of the meeting. Please wait
                  for further details and let us know if you have any questions.
                  Looking forward to speaking with you soon!
                </Text>
              </Alert>
            )}
        </Box>
      </Stack>
    </Stack>
  );
};

export default DirectorInterview;
