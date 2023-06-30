import { RequestByFormType, RequestorListType } from "@/utils/types";
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
import RequestorItem from "./RequestorItem";

const useStyles = createStyles(() => ({
  withBorderBottom: {
    borderBottom: "0.0625rem solid #dee2e6",
  },
}));

type RequestorTableProps = {
  requestList: RequestByFormType[];
  totalRequest: number;
};

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

const RequestorTable = ({ requestList, totalRequest }: RequestorTableProps) => {
  const { classes } = useStyles();

  // get all requestor and display in RequestorTable
  const reducedRequestorList = requestList.reduce((acc, request) => {
    if (!request.request_team_member) return acc;
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
  }, [] as RequestorListType[]);

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
          {requestList.length > 0 ? (
            sortRequestorListByTotalRequests.map((requestor) => (
              <Box key={requestor.user_id}>
                <RequestorItem
                  requestor={requestor}
                  totalRequest={totalRequest}
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
