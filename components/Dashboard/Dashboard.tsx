import { getRequestList } from "@/backend/api/get";
import { OTPDataType } from "@/pages/team-requests/forms/[formId]/analytics";
import { useFormList } from "@/stores/useFormStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import { RequestType, TeamMemberWithUserType } from "@/utils/types";
import { Container, Flex, LoadingOverlay, Select } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useState } from "react";
import RequestCountByStatus from "./RequestCountByStatus";
import RequestStatistics from "./RequestStatistics";

type DashboardProps = {
  requestList: RequestType[];
  requestListCount: number;
  teamMemberList: TeamMemberWithUserType[];
  teamRequisitionData: OTPDataType;
  userRequisitionData?: OTPDataType;
  purchaseRequisitionData?: OTPDataType;
};

const Dashboard = ({ requestList, requestListCount }: DashboardProps) => {
  const formList = useFormList();
  const activeTeam = useActiveTeam();
  const supabaseClient = useSupabaseClient();
  const [visibleRequestList, setVisibleRequestList] = useState(requestList);
  const [requestCount, setRequestCount] = useState(requestListCount);
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [isFetchingData, setIsFetchingData] = useState(false);

  const pendingRequestList = visibleRequestList.filter(
    (request) => request.request_status === "PENDING"
  );
  const approvedRequestList =
    visibleRequestList.filter(
      (request) => request.request_status === "APPROVED"
    ) || [];
  const rejectedRequestList =
    visibleRequestList.filter(
      (request) => request.request_status === "REJECTED"
    ) || [];
  const canceledRequestList =
    visibleRequestList.filter(
      (request) => request.request_status === "CANCELED"
    ) || [];

  const handleFilterRequestList = async (value: string) => {
    setSelectedForm(value);
    try {
      setIsFetchingData(true);
      const { data, count } = await getRequestList(supabaseClient, {
        teamId: activeTeam.team_id,
        page: 1,
        limit: 9999999,
        form: value ? [value] : undefined,
      });
      setVisibleRequestList(data as RequestType[]);
      setRequestCount(count as number);
    } catch (error) {
      console.log(error);
      notifications.show({
        title: "Something went wrong.",
        message: "Please try again later",
        color: "red",
      });
    } finally {
      setIsFetchingData(false);
    }
  };

  return (
    <Container fluid>
      <LoadingOverlay visible={isFetchingData} overlayBlur={2} />
      <Select
        maw={300}
        mb="sm"
        label="Filter data by form"
        placeholder="Select form"
        data={formList.map((form) => ({
          value: form.form_id,
          label: form.form_name,
        }))}
        value={selectedForm}
        onChange={handleFilterRequestList}
        clearable
      />
      <Flex gap="xl" wrap="wrap">
        <RequestCountByStatus
          requestList={pendingRequestList}
          status={"PENDING"}
          totalRequestListCount={requestCount}
        />
        <RequestCountByStatus
          requestList={approvedRequestList}
          status={"APPROVED"}
          totalRequestListCount={requestCount}
        />
        <RequestCountByStatus
          requestList={rejectedRequestList}
          status={"REJECTED"}
          totalRequestListCount={requestCount}
        />
        <RequestCountByStatus
          requestList={canceledRequestList}
          status={"CANCELED"}
          totalRequestListCount={requestCount}
        />
      </Flex>
      <RequestStatistics />
    </Container>
  );
};

export default Dashboard;
