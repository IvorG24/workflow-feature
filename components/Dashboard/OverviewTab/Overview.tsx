import {
  getRequestStatusCount,
  getRequestorData,
  getSignerData,
  getTeamMemberList,
} from "@/backend/api/get";
import { useActiveTeam } from "@/stores/useTeamStore";
import { Database } from "@/utils/database";
import { TeamMemberType } from "@/utils/types";
import { Box, Flex, LoadingOverlay, Stack } from "@mantine/core";
import {
  SupabaseClient,
  useSupabaseClient,
} from "@supabase/auth-helpers-react";
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

type RequestStatusChartData = {
  label: string;
  value: number;
  totalCount: number;
};

const status = ["Pending", "Approved", "Rejected", "Canceled"];

const Overview = ({ dateFilter, selectedForm }: OverviewProps) => {
  const activeTeam = useActiveTeam();
  const supabaseClient = useSupabaseClient();
  const [teamMemberList, setTeamMemberList] = useState<TeamMemberType[]>([]);
  const [requestStatusData, setRequestStatusData] = useState<
    RequestStatusDataType[] | null
  >(null);
  const [totalRequestCount, setTotalRequestCount] = useState(0);
  const [requestStatusChartData, setRequestStatusChartData] = useState<
    RequestStatusChartData[]
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
      setIsFetchingData(true);
      // set request status tracker
      const { data, count: count } = await getRequestStatusCount(
        supabaseClient,
        {
          formId: selectedForm,
          startDate: moment(dateFilter[0]).format(),
          endDate: moment(dateFilter[1]).format(),
          teamId: teamId,
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

      // set requestor data
      const requestorList = await Promise.all(
        teamMemberList.map(async (member) => {
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
      setRequestorList(requestorList);

      // set signer data
      const signerList = await Promise.all(
        teamMemberList.map(async (member) => {
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
            (request) => signer.request_signer_status === "CANCELED"
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
      setSignerList(signerList);
      setIsFetchingData(false);
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
            data={requestStatusChartData}
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
            requestStatusData={requestStatusData ? requestStatusData : []}
            dateFilter={dateFilter}
          />
        </Box>
      </Flex>
    </Stack>
  );
};

export default Overview;

type Params = {
  teamId: string;
  formId: string;
  supabaseClient: SupabaseClient<Database>;
  startDate: string;
  endDate: string;
};

const overviewDataFetcher = async (key: string, params: Params) => {
  try {
    const { teamId, formId, supabaseClient, startDate, endDate } = params;

    const { data, count: count } = await getRequestStatusCount(supabaseClient, {
      formId: formId,
      startDate: startDate,
      endDate: endDate,
      teamId: teamId,
    });

    if (!data) return;
    const requestStatusData = status.map((status) => {
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

    const members = await getTeamMemberList(supabaseClient, {
      teamId: teamId,
    });

    // set requestor data
    const requestorList = await Promise.all(
      members.map(async (member) => {
        const requestor = await getRequestorData(supabaseClient, {
          formId: formId,
          teamMemberId: member.team_member_id,
          startDate: startDate,
          endDate: endDate,
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

    // set signer data
    const signerList = await Promise.all(
      members.map(async (member) => {
        const signer = await getSignerData(supabaseClient, {
          formId: formId,
          teamMemberId: member.team_member_id,
          startDate: startDate,
          endDate: endDate,
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
  } catch (error) {
    console.error(error);
    if (error) throw new Error("Failed to fetch request list by form");
  }
};
