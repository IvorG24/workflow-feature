import { RequestByFormType, RequestorListType } from "@/utils/types";
import { Box, Flex } from "@mantine/core";
import { lowerCase } from "lodash";
import RequestStatistics from "./RequestStatistics";
import RequestStatusTracker from "./RequestStatusTracker";
import RequestorTable from "./RequestorTable";

type OverviewProps = {
  requestList: RequestByFormType[];
  requestCount: number;
};

const status = ["Pending", "Approved", "Rejected", "Canceled"];

const incrementRequestorStatusCount = (
  requestor: RequestorListType[0],
  status: string
) => {
  switch (status) {
    case "approved":
      requestor.request.approved++;
      break;

    case "rejected":
      requestor.request.rejected++;
      break;
    case "pending":
      requestor.request.pending++;
      break;

    case "canceled":
      requestor.request.canceled++;
      break;

    default:
      break;
  }

  return requestor;
};

const Overview = ({ requestList, requestCount }: OverviewProps) => {
  // get all requestor and display in RequestorTable
  const reducedRequestorList = requestList.reduce((acc, request) => {
    const user = request.request_team_member.team_member_user;
    const duplicateIndex = acc.findIndex(
      (duplicate) => duplicate.user_id === user.user_id
    );
    const requestStatus = request.request_status.toLowerCase();

    if (duplicateIndex >= 0) {
      const updateRequestor = incrementRequestorStatusCount(
        acc[duplicateIndex],
        requestStatus
      );
      updateRequestor.request.total++;

      acc[duplicateIndex] = updateRequestor;
    } else {
      const newRequestor: RequestorListType[0] = {
        ...user,
        request: {
          total: 1,
          approved: 0,
          rejected: 0,
          pending: 0,
          canceled: 0,
        },
      };
      const updatedNewRequestor = incrementRequestorStatusCount(
        newRequestor,
        requestStatus
      );
      acc[acc.length] = updatedNewRequestor;
    }

    return acc;
  }, [] as RequestorListType);

  // get request status meter data
  const requestStatusData = status.map((status) => {
    const requestMatch =
      requestList.filter(
        (request) => lowerCase(request.request_status) === lowerCase(status)
      ) || [];

    const meterData = {
      label: status,
      value: requestMatch.length,
      totalCount: requestCount,
    };

    return meterData;
  });

  return (
    <Box>
      <Flex gap="xl" wrap="wrap" mah={700}>
        <RequestStatistics requestList={requestList} />
        <RequestStatusTracker data={requestStatusData} />
      </Flex>
      {reducedRequestorList.length > 0 && (
        <RequestorTable
          requestorList={reducedRequestorList}
          totalRequest={requestCount}
        />
      )}
    </Box>
  );
};

export default Overview;
