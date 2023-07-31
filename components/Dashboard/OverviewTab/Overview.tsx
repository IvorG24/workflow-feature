import {
  getRequestStatusCount,
  getRequestStatusMonthlyCount,
  getRequestorData,
  getSignerData,
  getTeamMemberList,
} from "@/backend/api/get";
import { RadialChartData } from "@/components/Chart/RadialChart";
import { StackedBarChartDataType } from "@/components/Chart/StackedBarChart";
import { useFormList } from "@/stores/useFormStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import { TeamMemberType } from "@/utils/types";
import { Box, Flex, Loader, LoadingOverlay, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
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

export type RequestorAndSignerDataType = TeamMemberType & {
  request: RadialChartData[];
  total: number;
};

export type MonthlyRequestDataTypeWithTotal = {
  data: StackedBarChartDataType[];
  totalCount: number;
};

type OverviewProps = {
  dateFilter: [Date | null, Date | null];
  selectedForm: string | null;
};

const Overview = ({ dateFilter, selectedForm }: OverviewProps) => {
  const activeTeam = useActiveTeam();
  const formList = useFormList();
  const supabaseClient = useSupabaseClient();
  const [teamMemberList, setTeamMemberList] = useState<TeamMemberType[]>([]);
  const [requestStatusCount, setRequestStatusCount] = useState<
    RadialChartData[] | null
  >(null);
  const [totalRequestCount, setTotalRequestCount] = useState(0);
  const [monthlyChartData, setMonthlyChartData] = useState<
    StackedBarChartDataType[]
  >([]);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [requestorList, setRequestorList] = useState<
    RequestorAndSignerDataType[]
  >([]);
  const [signerList, setSignerList] = useState<RequestorAndSignerDataType[]>(
    []
  );

  useEffect(() => {
    const fetchTeamMemberList = async () => {
      const members = await getTeamMemberList(supabaseClient, {
        teamId: activeTeam.team_id,
      });
      setTeamMemberList(members);
    };
    if (activeTeam.team_id) {
      fetchTeamMemberList();
    }
  }, [activeTeam.team_id]);

  useEffect(() => {
    if (!dateFilter[0] || !dateFilter[1]) return;
    const fetchOverviewData = async (selectedForm: string, teamId: string) => {
      try {
        setIsFetchingData(true);
        // set request status tracker
        const { data: requestStatusCountData, totalCount } =
          await getRequestStatusCount(supabaseClient, {
            formId: selectedForm,
            startDate: moment(dateFilter[0]).format(),
            endDate: moment(dateFilter[1]).format(),
            teamId: teamId,
          });

        setRequestStatusCount(requestStatusCountData);
        setTotalRequestCount(totalCount);

        // get monthly statistics
        const monthlyRequestData = await getRequestStatusMonthlyCount(
          supabaseClient,
          {
            formId: selectedForm,
            startDate: moment(dateFilter[0]).format(),
            endDate: moment(dateFilter[1]).format(),
            teamId: teamId,
          }
        );
        if (!monthlyRequestData) return;

        const chartData = monthlyRequestData.data.map((d) => ({
          ...d,
          month: moment(d.month).format("MMM"),
        }));

        setMonthlyChartData(chartData);

        const formMatch = formList.find(
          (form) => form.form_id === selectedForm
        );
        if (!formMatch) return;
        const requestorList = await Promise.all(
          teamMemberList.map(async (member) => {
            const requestData = await getRequestorData(supabaseClient, {
              formId: selectedForm,
              teamMemberId: member.team_member_id,
              startDate: moment(dateFilter[0]).format(),
              endDate: moment(dateFilter[1]).format(),
            });

            const totalRequestCount = requestData.reduce(
              (sum, item) => sum + item.value,
              0
            );

            const newRequestor = {
              ...member,
              request: requestData,
              total: totalRequestCount,
            };

            return newRequestor;
          })
        );
        setRequestorList(
          requestorList.filter((requestor) => requestor.total !== 0)
        );

        // set signer data
        const signerList = await Promise.all(
          teamMemberList.map(async (member) => {
            const signedRequestData = await getSignerData(supabaseClient, {
              formId: selectedForm,
              teamMemberId: member.team_member_id,
              startDate: moment(dateFilter[0]).format(),
              endDate: moment(dateFilter[1]).format(),
            });

            const totalRequestCount = signedRequestData.reduce(
              (sum, item) => sum + item.value,
              0
            );

            const newSigner = {
              ...member,
              request: signedRequestData,
              total: totalRequestCount,
            };

            return newSigner;
          })
        );
        setSignerList(signerList.filter((signer) => signer.total !== 0));
      } catch (error) {
        notifications.show({
          message:
            "There was a problem while fetching the data. Please try again later",
          color: "red",
        });
      } finally {
        setIsFetchingData(false);
      }
    };
    if (selectedForm && activeTeam.team_id) {
      fetchOverviewData(selectedForm, activeTeam.team_id);
    }
  }, [selectedForm, dateFilter, activeTeam.team_id, teamMemberList]);

  return (
    <Stack w="100%" align="center" pos="relative">
      <LoadingOverlay
        visible={isFetchingData}
        overlayBlur={0}
        overlayOpacity={0.2}
        loader={<Loader variant="dots" />}
      />
      <Flex
        w="100%"
        align="flex-start"
        justify={{ xl: "space-between" }}
        gap="md"
        wrap="wrap"
      >
        <Box w={{ base: "100%", sm: 360 }} h={420}>
          <RequestStatusTracker
            data={requestStatusCount || []}
            totalRequestCount={totalRequestCount}
          />
        </Box>
        <Box w={{ base: "100%", sm: 300 }} h={420}>
          <RequestorTable
            totalRequestCount={totalRequestCount}
            requestorList={requestorList.length > 0 ? requestorList : []}
          />
        </Box>
        <Box w={{ base: "100%", sm: 300 }} h={420}>
          <SignerTable
            signerList={signerList.length > 0 ? signerList : []}
            totalRequestCount={totalRequestCount}
          />
        </Box>
      </Flex>
      <Flex w="100%" align="flex-start" gap="xl" wrap="wrap">
        <Box sx={{ flex: 1 }} w="100%">
          <RequestStatistics
            monthlyChartData={monthlyChartData}
            totalRequestCount={totalRequestCount}
            dateFilter={dateFilter}
          />
        </Box>
      </Flex>
    </Stack>
  );
};

export default Overview;
