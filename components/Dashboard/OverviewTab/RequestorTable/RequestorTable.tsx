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
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
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
  loadMoreRequestor: (page: number) => void;
  isRequestorFetchable: boolean;
  requestorOffset: number;
  setRequestorOffset: Dispatch<SetStateAction<number>>;
};

const RequestorTable = ({
  totalRequestCount,
  requestorList,
  loadMoreRequestor,
  isRequestorFetchable,
  requestorOffset,
  setRequestorOffset,
}: RequestorTableProps) => {
  const { classes } = useStyles();
  const containerRef = useRef<HTMLDivElement>(null);

  const [isInView, setIsInView] = useState(false);

  const handleScroll = () => {
    if (!isRequestorFetchable) return;
    if (containerRef.current && typeof window !== "undefined") {
      const container = containerRef.current;
      const { bottom } = container.getBoundingClientRect();
      const { innerHeight } = window;
      setIsInView(bottom <= innerHeight);
    }
  };

  useEffect(() => {
    if (isInView) {
      loadMoreRequestor(requestorOffset + 1);
      setRequestorOffset((prev) => (prev += 1));
    }
  }, [isInView]);

  return (
    <ScrollArea
      w="100%"
      h="100%"
      onScrollCapture={handleScroll}
      className="onboarding-dashboard-top-requestor"
    >
      <Paper w={{ base: "100%" }} mih={420} withBorder>
        <Group p="md" spacing="xs" className={classes.withBorderBottom}>
          <Center c="green">
            <IconTrophyFilled />
          </Center>
          <Title order={4}>Top Requestor</Title>
        </Group>

        <Stack p="lg" mb="sm" spacing={32} ref={containerRef}>
          {totalRequestCount > 0 ? (
            requestorList.map((requestor) => (
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
