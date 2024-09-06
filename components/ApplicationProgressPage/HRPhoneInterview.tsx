import { getPhoneInterview } from "@/backend/api/get";
import { formatDate } from "@/utils/constant";
import { getStatusToColor } from "@/utils/styling";
import { HRPhoneInterviewTableRow } from "@/utils/types";
import { Alert, Badge, Box, Group, Stack, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { IconNote } from "@tabler/icons-react";
import { useState } from "react";
import SchedulingCalendar from "./SchedulingCalendar";

type Props = {
  hrPhoneInterviewData: HRPhoneInterviewTableRow;
};
const HRPhoneInterview = ({ hrPhoneInterviewData }: Props) => {
  const supabaseClient = useSupabaseClient();
  const [phoneInterviewData, setPhoneInterviewData] =
    useState<HRPhoneInterviewTableRow>(hrPhoneInterviewData);
  const [isLoading, setIsLoading] = useState(false);
  const [isReadyToSelect, setIsReadyToSelect] = useState(false);
  const refetchData = async () => {
    try {
      setIsLoading(true);
      const targetId = hrPhoneInterviewData.hr_phone_interview_id;
      const data = await getPhoneInterview(supabaseClient, targetId);
      setPhoneInterviewData(data[0]);
    } catch (error) {
      notifications.show({
        message: "Theres something wrong, Please Try Again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Stack spacing="xl" sx={{ flex: 1 }}>
      <Title order={3}>HR Phone Interview</Title>
      <Stack>
        <Group>
          <Text>Date Created: </Text>
          <Title order={5}>
            {formatDate(
              new Date(phoneInterviewData.hr_phone_interview_date_created ?? "")
            )}
          </Title>
        </Group>
        <Group>
          <Text>Status: </Text>
          <Badge
            color={getStatusToColor(
              phoneInterviewData.hr_phone_interview_status ?? ""
            )}
          >
            {phoneInterviewData.hr_phone_interview_status}
          </Badge>
          {phoneInterviewData.hr_phone_interview_status_date_updated && (
            <Text color="dimmed">
              on{" "}
              {formatDate(
                new Date(
                  phoneInterviewData.hr_phone_interview_status_date_updated
                )
              )}
            </Text>
          )}
        </Group>
        {["PENDING", "WAITING FOR SCHEDULE", "CANCELLED", "QUALIFIED"].includes(
          phoneInterviewData.hr_phone_interview_status
        ) && (
          <SchedulingCalendar
            setIsReadyToSelect={setIsReadyToSelect}
            isReadyToSelect={isReadyToSelect}
            refetchData={refetchData}
            meeting_type="phone"
            date_created={phoneInterviewData.hr_phone_interview_date_created}
            target_id={phoneInterviewData.hr_phone_interview_id}
            intialDate={phoneInterviewData.hr_phone_interview_schedule}
            status={phoneInterviewData.hr_phone_interview_status}
            isRefetchingData={isLoading}
          />
        )}
        <Box mb={"xl"}>
          {!isReadyToSelect &&
            phoneInterviewData.hr_phone_interview_status === "PENDING" && (
              <Alert title="Note!" icon={<IconNote size={16} />}>
                <Text>
                  Your HR phone interview is scheduled. The meeting link will be
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

export default HRPhoneInterview;
