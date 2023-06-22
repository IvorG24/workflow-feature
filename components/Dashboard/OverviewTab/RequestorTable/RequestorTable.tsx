import { RequestorListType } from "@/utils/types";
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
import { IconTrophy } from "@tabler/icons-react";
import RequestorItem from "./RequestorItem";

const useStyles = createStyles(() => ({
  withBorderBottom: {
    borderBottom: "0.0625rem solid #dee2e6",
  },
}));

type RequestorTableProps = {
  requestorList: RequestorListType[];
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
    <ScrollArea w="100%" h="100%">
      <Paper w={{ base: "100%" }} withBorder>
        <Group p="md" className={classes.withBorderBottom}>
          <IconTrophy />
          <Title order={4}>Top Requestor</Title>
        </Group>

        <Stack p="lg" mb="sm">
          {sortRequestorListByTotalRequests.length > 0 ? (
            sortRequestorListByTotalRequests.map((requestor) => (
              <Box key={requestor.user_id}>
                <RequestorItem
                  requestor={requestor}
                  totalRequest={totalRequest}
                />
              </Box>
            ))
          ) : (
            <Center h={300}>
              <Text size={24} color="dimmed" weight={600}>
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
