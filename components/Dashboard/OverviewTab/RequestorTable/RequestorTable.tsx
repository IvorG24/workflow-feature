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
import { RequestorAndSignerDataType } from "../Overview";
import RequestorItem from "./RequestorItem";

const useStyles = createStyles(() => ({
  withBorderBottom: {
    borderBottom: "0.0625rem solid #dee2e6",
  },
}));

type RequestorTableProps = {
  totalRequestCount: number;
  requestorList: RequestorAndSignerDataType[];
};

const RequestorTable = ({
  totalRequestCount,
  requestorList,
}: RequestorTableProps) => {
  const { classes } = useStyles();

  const sortRequestorListByTotalRequests = requestorList.sort(
    (a, b) => b.total - a.total
  );

  return (
    <ScrollArea w="100%" h="100%">
      <Paper w={{ base: "100%" }} mih={420} withBorder>
        <Group p="md" spacing="xs" className={classes.withBorderBottom}>
          <Center c="green">
            <IconTrophyFilled />
          </Center>
          <Title order={4}>Top Requestor</Title>
        </Group>

        <Stack p="lg" mb="sm" spacing={32}>
          {totalRequestCount > 0 ? (
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
                No data to display
              </Text>
            </Center>
          )}
        </Stack>
      </Paper>
    </ScrollArea>
  );
};

export default RequestorTable;
