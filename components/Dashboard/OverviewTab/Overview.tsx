import { getRequestStatusCount } from "@/backend/api/get";
import { useActiveTeam } from "@/stores/useTeamStore";
import { Box, Flex, Stack } from "@mantine/core";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { lowerCase } from "lodash";
import moment from "moment";
import { useEffect, useState } from "react";
import RequestStatistics from "./RequestStatistics";
import RequestStatusTracker from "./RequestStatusTracker";
import RequestorTable from "./RequestorTable/RequestorTable";
import SignerTable from "./SignerTable";

export type RequestStatusDataType = {
  request_status: string;
  request_date_created: string;
};

export type RequestorDataType = {
  team_member_id: string;
  user: {
    user_avatar: string | null;
    user_first_name: string;
    user_last_name: string;
  };
  request_status: string;
};

type OverviewProps = {
  requestorList: RequestorDataType[];
  dateFilter: string;
  selectedForm: string | null;
};

type RequestStatusChartData = {
  label: string;
  value: number;
  totalCount: number;
};

const status = ["Pending", "Approved", "Rejected", "Canceled"];

const Overview = ({
  requestorList,
  dateFilter,
  selectedForm,
}: OverviewProps) => {
  const activeTeam = useActiveTeam();
  const supabaseClient = useSupabaseClient();
  const currentDate = moment();
  const [requestStatusData, setRequestStatusData] = useState<
    RequestStatusDataType[] | null
  >(null);
  const [totalRequestCount, setTotalRequestCount] = useState(0);
  const [requestStatusChartData, setRequestStatusChartData] = useState<
    RequestStatusChartData[]
  >([]);

  useEffect(() => {
    const handleFetchRequestStatusTracker = async (selectedForm: string) => {
      const { data, count: count } = await getRequestStatusCount(
        supabaseClient,
        {
          formId: selectedForm,
          startDate: dateFilter,
          endDate: currentDate.format("YYYY-MM-DD"),
          teamId: activeTeam.team_id,
        }
      );
      setRequestStatusData(data);
      setTotalRequestCount(count ? count : 0);

      if (!data) return;
      const chartData = status.map((status) => {
        const requestMatch =
          data.filter(
            (request) => lowerCase(request.request_status) === lowerCase(status)
          ) || [];

        const meterData = {
          label: status,
          value: requestMatch.length,
          totalCount: count ? count : 0,
        };

        return meterData;
      });

      setRequestStatusChartData(chartData);
    };

    if (selectedForm) {
      handleFetchRequestStatusTracker(selectedForm);
    }
  }, [selectedForm, dateFilter, supabaseClient, currentDate]);

  return (
    <Stack w="100%" align="center">
      <Flex
        w="100%"
        align="flex-start"
        justify={{ xl: "space-between" }}
        gap="md"
        wrap="wrap"
      >
        <Box w={{ base: "100%", sm: 360 }} h={450}>
          <RequestStatusTracker
            data={requestStatusChartData}
            totalRequestCount={totalRequestCount}
          />
        </Box>
        <Box w={{ base: "100%", sm: 300 }} h={450}>
          <RequestorTable
            totalRequestCount={totalRequestCount}
            requestorList={requestorList}
          />
        </Box>
        <Box w={{ base: "100%", sm: 300 }} h={450}>
          <SignerTable
            selectedForm={selectedForm}
            dateFilter={dateFilter}
            requestList={[]}
          />
        </Box>
      </Flex>
      <Flex w="100%" align="flex-start" gap="xl" wrap="wrap">
        <Box sx={{ flex: 1 }} w="100%">
          <RequestStatistics
            requestStatusData={requestStatusData ? requestStatusData : []}
          />
        </Box>
      </Flex>
    </Stack>
  );
};

export default Overview;
