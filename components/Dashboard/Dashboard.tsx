import { RFDataType } from "@/pages/team-requests/forms/[formId]/analytics";
import { RequestType, TeamMemberWithUserType } from "@/utils/types";
import { Container, Flex } from "@mantine/core";
import RequestCountByStatus from "./RequestCountByStatus";
import RequestStatistics from "./RequestStatistics";

type DashboardProps = {
  requestList: RequestType[];
  requestListCount: number;
  teamMemberList: TeamMemberWithUserType[];
  teamRequisitionData: RFDataType;
  userRequisitionData?: RFDataType;
  purchaseRequisitionData?: RFDataType;
};

const Dashboard = ({ requestList, requestListCount }: DashboardProps) => {
  const pendingRequestList = requestList.filter(
    (request) => request.request_status === "PENDING"
  );
  const approvedRequestList =
    requestList.filter((request) => request.request_status === "APPROVED") ||
    [];
  const rejectedRequestList =
    requestList.filter((request) => request.request_status === "REJECTED") ||
    [];
  const canceledRequestList =
    requestList.filter((request) => request.request_status === "CANCELED") ||
    [];

  return (
    <Container fluid>
      <Flex gap="xl" wrap="wrap">
        <RequestCountByStatus
          requestList={pendingRequestList}
          status={"PENDING"}
          totalRequestListCount={requestListCount}
        />
        <RequestCountByStatus
          requestList={approvedRequestList}
          status={"APPROVED"}
          totalRequestListCount={requestListCount}
        />
        <RequestCountByStatus
          requestList={rejectedRequestList}
          status={"REJECTED"}
          totalRequestListCount={requestListCount}
        />
        <RequestCountByStatus
          requestList={canceledRequestList}
          status={"CANCELED"}
          totalRequestListCount={requestListCount}
        />
      </Flex>
      <RequestStatistics />
    </Container>
  );
};

export default Dashboard;
