import { RequestType } from "@/utils/types";
import { Box, Flex } from "@mantine/core";
import { lowerCase } from "lodash";
import RequestCountByStatus from "./RequestCountByStatus";
import RequestStatistics from "./RequestStatistics";
import RequestorTable from "./RequestorTable";

type OverviewProps = {
  requestList: RequestType[];
  requestCount: number;
};

export type RequestorListType =
  (RequestType["request_team_member"]["team_member_user"] & {
    count: number;
  })[];

const status = ["Pending", "Approved", "Rejected", "Canceled"];

const Overview = ({ requestList, requestCount }: OverviewProps) => {
  // get all requestor and display in RequestorTable
  const requestorList =
    requestList.map(
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

  // get request status meter data
  const requestStatusMeterData = status.map((status) => {
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
      <Flex gap="sm" wrap="wrap">
        {requestStatusMeterData.map((meter, idx) => (
          <RequestCountByStatus key={meter.label + idx} {...meter} />
        ))}
      </Flex>
      <Flex gap="xl" wrap="wrap">
        <RequestStatistics requestList={requestList} />
        {requestorList.length > 0 && (
          <RequestorTable
            requestorList={reducedRequestorList}
            totalRequest={requestCount}
          />
        )}
      </Flex>
    </Box>
  );
};

export default Overview;
