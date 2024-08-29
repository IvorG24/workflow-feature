import { getPhoneInterview } from "@/backend/api/get";
import { formatDate } from "@/utils/constant";
import { getStatusToColor } from "@/utils/styling";
import { HRPhoneInterviewTableRow } from "@/utils/types";
import { Badge, Group, Stack, Text, Title } from "@mantine/core";
import { notifications } from '@mantine/notifications';
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useState } from 'react';
import SchedulingCalendar from "./SchedulingCalendar";

type Props = {
  hrPhoneInterviewData: HRPhoneInterviewTableRow;
};
const HRPhoneInterview = ({ hrPhoneInterviewData }: Props) => {
  const supabaseClient = useSupabaseClient();
  const [phoneInterviewData, setPhoneInterviewData] = useState<HRPhoneInterviewTableRow>(hrPhoneInterviewData)
  const [isLoading, setIsLoading] = useState(false)

  const refetchData = async () => {
    try {
      setIsLoading(true)
      const data = await getPhoneInterview(supabaseClient)
      setPhoneInterviewData(data[0])
    } catch (error) {
      notifications.show({
        message: 'Theres something wrong, Please Try Again',
      })
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <Stack spacing="xl" sx={{ flex: 1 }}>
      <Title order={3}>HR Phone Interview</Title>
      <Stack>
        <Group>
          <Text>Date Created: </Text>
          <Title order={5}>
            {formatDate(
              new Date(
                phoneInterviewData.hr_phone_interview_date_created ?? ""
              )
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
        <SchedulingCalendar
          refetchData={refetchData}
          meeting_type="phone"
          target_id={phoneInterviewData.hr_phone_interview_id}
          intialDate={phoneInterviewData.hr_phone_interview_schedule}
          status={phoneInterviewData.hr_phone_interview_status}
          isRefetchingData={isLoading}
        />
      </Stack>
    </Stack>
  );
};

export default HRPhoneInterview;
