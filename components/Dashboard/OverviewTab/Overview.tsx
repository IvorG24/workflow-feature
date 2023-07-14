import {
  getRequestMonthlyCount,
  getRequestStatusCount,
  getRequestorData,
  getSignerData,
  getTeamMemberList,
} from "@/backend/api/get";
import { RadialChartData } from "@/components/Chart/RadialChart";
import { StackedBarChartDataType } from "@/components/Chart/StackedBarChart";
import { useFormList } from "@/stores/useFormStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import { checkIfTwoArrayHaveAtLeastOneEqualElement } from "@/utils/arrayFunctions/arrayFunctions";
import { TeamMemberType } from "@/utils/types";
import { Box, Flex, LoadingOverlay, Stack } from "@mantine/core";
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

export type RequestorAndSignerDataType = {
  user_id: string;
  user_avatar: string | null;
  user_first_name: string;
  user_last_name: string;
  request: {
    pending: number;
    approved: number;
    rejected: number;
    canceled: number;
    total: number;
  };
};

type OverviewProps = {
  dateFilter: [Date | null, Date | null];
  selectedForm: string | null;
};

export type MonthlyRequestDataTypeWithTotal = {
  data: StackedBarChartDataType[];
  totalCount: number;
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
        const monthlyRequestData = await getRequestMonthlyCount(
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
            // only fetch if requestor has same form group
            const isGroupMember =
              checkIfTwoArrayHaveAtLeastOneEqualElement(
                formMatch?.form_group,
                member.team_member_group_list
              ) || formMatch.form_group.length === 0;
            if (!isGroupMember) {
              const newRequestor = {
                ...member.team_member_user,
                request: {
                  pending: 0,
                  approved: 0,
                  rejected: 0,
                  canceled: 0,
                  total: 0,
                },
              };

              return newRequestor;
            }
            const requestor = await getRequestorData(supabaseClient, {
              formId: selectedForm,
              teamMemberId: member.team_member_id,
              startDate: moment(dateFilter[0]).format(),
              endDate: moment(dateFilter[1]).format(),
            });

            const pendingCount = requestor?.filter(
              (request) => request.request_status === "PENDING"
            ).length;
            const approvedCount = requestor?.filter(
              (request) => request.request_status === "APPROVED"
            ).length;
            const rejectedCount = requestor?.filter(
              (request) => request.request_status === "REJECTED"
            ).length;
            const canceledCount = requestor?.filter(
              (request) => request.request_status === "CANCELED"
            ).length;

            const newRequestor = {
              ...member.team_member_user,
              request: {
                pending: pendingCount || 0,
                approved: approvedCount || 0,
                rejected: rejectedCount || 0,
                canceled: canceledCount || 0,
                total: requestor?.length || 0,
              },
            };

            return newRequestor;
          })
        );
        setRequestorList(
          requestorList.filter((requestor) => requestor.request.total !== 0)
        );

        // set signer data
        const signerList = await Promise.all(
          teamMemberList.map(async (member) => {
            // only fetch if signer has same form group
            const isGroupMember =
              checkIfTwoArrayHaveAtLeastOneEqualElement(
                formMatch.form_group,
                member.team_member_group_list
              ) || formMatch.form_group.length === 0;

            if (!isGroupMember) {
              const newSigner = {
                ...member.team_member_user,
                request: {
                  pending: 0,
                  approved: 0,
                  rejected: 0,
                  canceled: 0,
                  total: 0,
                },
              };

              return newSigner;
            }

            const signer = await getSignerData(supabaseClient, {
              formId: selectedForm,
              teamMemberId: member.team_member_id,
              startDate: moment(dateFilter[0]).format(),
              endDate: moment(dateFilter[1]).format(),
            });

            const pendingCount = signer?.filter(
              (signer) => signer.request_signer_status === "PENDING"
            ).length;
            const approvedCount = signer?.filter(
              (signer) => signer.request_signer_status === "APPROVED"
            ).length;
            const rejectedCount = signer?.filter(
              (signer) => signer.request_signer_status === "REJECTED"
            ).length;
            const canceledCount = signer?.filter(
              (signer) => signer.request_signer_status === "CANCELED"
            ).length;

            const newSigner = {
              ...member.team_member_user,
              request: {
                pending: pendingCount || 0,
                approved: approvedCount || 0,
                rejected: rejectedCount || 0,
                canceled: canceledCount || 0,
                total: signer?.length || 0,
              },
            };

            return newSigner;
          })
        );
        setSignerList(
          signerList.filter((signer) => signer.request.total !== 0)
        );
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
      <LoadingOverlay visible={isFetchingData} overlayBlur={2} />
      <Flex
        w="100%"
        align="flex-start"
        justify={{ xl: "space-between" }}
        gap="md"
        wrap="wrap"
      >
        <Box w={{ base: "100%", sm: 360 }} h={450}>
          <RequestStatusTracker
            data={requestStatusCount || []}
            totalRequestCount={totalRequestCount}
          />
        </Box>
        <Box w={{ base: "100%", sm: 300 }} h={450}>
          <RequestorTable
            totalRequestCount={totalRequestCount}
            requestorList={requestorList.length > 0 ? requestorList : []}
          />
        </Box>
        <Box w={{ base: "100%", sm: 300 }} h={450}>
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
