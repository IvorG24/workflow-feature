import { formatDate, formatTime } from "@/utils/constant";
import { getStatusToColor } from "@/utils/styling";
import { DirectorInterviewTableRow } from "@/utils/types";
import { Alert, Badge, Group, Stack, Text, Title } from "@mantine/core";
import { IconNote } from "@tabler/icons-react";

type Props = {
  directorInterviewData: DirectorInterviewTableRow;
};
const DirectorInterview = ({ directorInterviewData }: Props) => {
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
        {directorInterviewData.director_interview_schedule && (
          <>
            <Group>
              <Text>Schedule Date: </Text>
              <Title order={5}>
                {formatDate(
                  new Date(directorInterviewData.director_interview_schedule)
                )}
              </Title>
            </Group>
            <Group>
              <Text>Schedule Time: </Text>
              <Title order={5}>
                {formatTime(
                  new Date(directorInterviewData.director_interview_schedule)
                )}
              </Title>
            </Group>
          </>
        )}
        {directorInterviewData.director_interview_status ===
          "WAITING FOR SCHEDULE" && (
          <Alert mb="xl" title="Note!" icon={<IconNote size={16} />}>
            <Text>
              Thank you for your application. We are currently reviewing your
              informations, and we’re excited to connect with you soon. Please
              look forward for the director interview schedule.
            </Text>
          </Alert>
        )}
      </Stack>
    </Stack>
  );
};

export default DirectorInterview;
