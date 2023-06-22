import {
  RequestByFormType,
  RequestSignerListType,
  RequestorListType,
} from "@/utils/types";
import { Box, Flex, Stack } from "@mantine/core";
import { lowerCase } from "lodash";
import RequestStatistics from "./RequestStatistics";
import RequestStatusTracker from "./RequestStatusTracker";
import RequestorTable from "./RequestorTable/RequestorTable";
import SignerTable from "./SignerTable";

type OverviewProps = {
  requestList: RequestByFormType[];
  requestCount: number;
};

const status = ["Pending", "Approved", "Rejected", "Canceled"];

const incrementRequestorStatusCount = (
  requestor: RequestorListType,
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
      const newRequestor: RequestorListType = {
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
  }, [] as RequestorListType[]);

  // get signers
  const signerList = requestList.flatMap((request) => request.request_signer);
  const reducedSignerList = signerList.reduce((acc, signer) => {
    const duplicateSignerIndex = acc.findIndex(
      (d) =>
        d.signer_team_member.team_member_id ===
        signer.request_signer_signer.signer_team_member.team_member_id
    );

    if (duplicateSignerIndex >= 0) {
      acc[duplicateSignerIndex].count++;
    } else {
      const newSigner = { ...signer.request_signer_signer, count: 1 };
      acc.push(newSigner);
    }

    return acc;
  }, [] as RequestSignerListType[]);

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
    <Stack w="100%" align="center">
      <Flex w="100%" align="flex-start" gap="xl" wrap="wrap">
        <Box w={{ base: "100%", sm: 320 }} h={450}>
          <RequestStatusTracker data={requestStatusData} />
        </Box>
        <Box sx={{ flex: 1 }} maw={700} h={450}>
          <RequestStatistics requestList={requestList} />
        </Box>
      </Flex>
      <Flex w="100%" align="flex-start" gap="xl" wrap="wrap">
        <Box w={{ base: "100%", sm: 320 }} h={500}>
          <RequestorTable
            requestorList={reducedRequestorList}
            totalRequest={requestCount}
          />
        </Box>
        <Box w={{ base: "100%", sm: 320 }} h={500}>
          <SignerTable signerList={reducedSignerList} />
        </Box>
      </Flex>
    </Stack>
  );
};

export default Overview;
