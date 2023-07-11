import {
  Box,
  Center,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Title,
  createStyles,
} from "@mantine/core";
import { IconTrophyFilled } from "@tabler/icons-react";
import { RequestorDataType } from "../Overview";
import RequestorItem, { RequestorWithStatusCount } from "./RequestorItem";

const useStyles = createStyles(() => ({
  withBorderBottom: {
    borderBottom: "0.0625rem solid #dee2e6",
  },
}));

type RequestorTableProps = {
  totalRequestCount: number;
  requestorList: RequestorDataType[];
};

const incrementRequestorStatusCount = (
  requestor: RequestorWithStatusCount,
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

const RequestorTable = ({
  totalRequestCount,
  requestorList,
}: RequestorTableProps) => {
  const { classes } = useStyles();

  // get all requestor and display in RequestorTable
  const reducedRequestorList = requestorList.reduce((acc, requestor) => {
    const requestorId = requestor.team_member_id;
    const duplicateRequestorIndex = acc.findIndex(
      (duplicateRequestor) => duplicateRequestor.team_member_id === requestorId
    );
    const requestStatus = requestor.request_status.toLowerCase();

    if (duplicateRequestorIndex >= 0) {
      const updateRequestor = incrementRequestorStatusCount(
        acc[duplicateRequestorIndex],
        requestStatus
      );
      updateRequestor.request.total++;

      acc[duplicateRequestorIndex] = updateRequestor;
    } else {
      const newRequestor: RequestorWithStatusCount = {
        ...requestor.user,
        team_member_id: requestor.team_member_id,
        request: {
          total: 1,
          pending: 0,
          approved: 0,
          rejected: 0,
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
  }, [] as RequestorWithStatusCount[]);

  const sortRequestorListByTotalRequests = reducedRequestorList.sort(
    (a, b) => b.request.total - a.request.total
  );

  return (
    <ScrollArea w="100%" h="100%">
      <Paper w={{ base: "100%" }} mih={450} withBorder>
        <Group p="md" className={classes.withBorderBottom}>
          <Box c="blue">
            <IconTrophyFilled />
          </Box>
          <Title order={4}>Top Requestor</Title>
        </Group>

        <Stack p="lg" mb="sm" spacing={32}>
          {sortRequestorListByTotalRequests.length > 0 ? (
            sortRequestorListByTotalRequests.map((requestor) => (
              <Box key={requestor.team_member_id}>
                <RequestorItem
                  requestor={requestor}
                  totalRequest={totalRequestCount}
                />
              </Box>
            ))
          ) : (
            <Center h={175}>
              <Text size={20} color="dimmed" weight={600}>
                No data available.
              </Text>
            </Center>
          )}
        </Stack>
      </Paper>
    </ScrollArea>
  );
};

export default RequestorTable;
