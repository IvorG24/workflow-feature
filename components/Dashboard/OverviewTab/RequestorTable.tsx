import { RequestorListType } from "@/utils/types";
import {
  Group,
  Paper,
  ScrollArea,
  Stack,
  Title,
  createStyles,
} from "@mantine/core";
import { IconTrophy } from "@tabler/icons-react";
import RequestorItem from "./RequestorItem";

const useStyles = createStyles(() => ({
  withBorderBottom: {
    borderBottom: "0.0625rem solid #dee2e6",
  },
}));

type RequestorTableProps = {
  requestorList: RequestorListType;
  totalRequest: number;
};

const RequestorTable = ({
  requestorList,
  totalRequest,
}: RequestorTableProps) => {
  const { classes } = useStyles();
  const sortRequestorListByTotalRequests = requestorList.sort(
    (a, b) => b.request.total - a.request.total
  );

  return (
    <ScrollArea w="100%" maw={500} h={412} mt="xl">
      <Paper w={{ base: "100%" }} mih={412} withBorder>
        <Group p="sm" className={classes.withBorderBottom}>
          <IconTrophy />
          <Title order={4}>Requestor Ranking</Title>
        </Group>

        <Stack p="sm" my="sm">
          {sortRequestorListByTotalRequests.map((requestor) => (
            <RequestorItem
              key={requestor.user_id}
              requestor={requestor}
              totalRequest={totalRequest}
            />
          ))}
        </Stack>
      </Paper>
    </ScrollArea>
  );
};

export default RequestorTable;
