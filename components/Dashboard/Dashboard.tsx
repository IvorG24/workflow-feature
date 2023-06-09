import { getRequestList } from "@/backend/api/get";
import { OTPDataType } from "@/pages/team-requests/forms/[formId]/analytics";
import { useFormList } from "@/stores/useFormStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import { RequestType, TeamMemberWithUserType } from "@/utils/types";
import {
  Container,
  Flex,
  LoadingOverlay,
  Paper,
  Select,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useState } from "react";
import OrderToPurchaseAnalytics from "../OrderToPurchaseAnalyticsPage/OrderToPurchaseAnalytics";
import RequestCountByStatus from "./RequestCountByStatus";
import RequestStatistics from "./RequestStatistics";
import RequestorTable from "./RequestorTable";

type DashboardProps = {
  requestList: RequestType[];
  requestListCount: number;
  teamMemberList: TeamMemberWithUserType[];
  teamRequisitionData: OTPDataType;
  userRequisitionData?: OTPDataType;
  purchaseRequisitionData?: OTPDataType;
};

export type RequestorListType =
  (RequestType["request_team_member"]["team_member_user"] & {
    count: number;
  })[];

const Dashboard = ({
  requestList,
  requestListCount,
  teamRequisitionData,
  userRequisitionData,
  purchaseRequisitionData,
}: DashboardProps) => {
  const formList = useFormList();
  const activeTeam = useActiveTeam();
  const supabaseClient = useSupabaseClient();
  const [visibleRequestList, setVisibleRequestList] = useState(requestList);
  const [requestCount, setRequestCount] = useState(requestListCount);
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [isFetchingData, setIsFetchingData] = useState(false);

  // check if selected form is formsly form
  const isFormslyForm = formList.find(
    (form) => form.form_id === selectedForm
  )?.form_is_formsly_form;

  // get all requestor and display in RequestorTable
  const requestorList =
    visibleRequestList.map(
      (request) => request.request_team_member.team_member_user
    ) || [];
  const reducedRequestorList = requestorList.reduce((accumulator, user) => {
    const { user_id } = user;
    const duplicateIndex = accumulator.findIndex(
      (duplicate) => duplicate.user_id === user_id
    );
    if (duplicateIndex >= 0) {
      accumulator[duplicateIndex].count++;
    } else {
      accumulator[accumulator.length] = {
        ...user,
        count: 1,
      };
    }
    return accumulator;
  }, [] as RequestorListType);

  // get request list by status
  const pendingRequestList =
    visibleRequestList.filter(
      (request) => request.request_status === "PENDING"
    ) || [];
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

  // filter data by selected request form
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
      <Flex gap="xl" wrap="wrap">
        <RequestStatistics />
        {requestorList.length > 0 && (
          <RequestorTable requestorList={reducedRequestorList} />
        )}
        {isFormslyForm && (
          <Paper
            mt="xl"
            p="xl"
            w={{ base: "100%", sm: 500, md: "fit-content" }}
          >
            <Title order={3} mb="md">
              Requisition Data
            </Title>
            <OrderToPurchaseAnalytics
              teamOrderToPurchaseData={teamRequisitionData}
              userOrderToPurchaseData={userRequisitionData}
              purchaseOrderToPurchaseData={purchaseRequisitionData}
            />
          </Paper>
        )}
      </Flex>
    </Container>
  );
};

export default Dashboard;
