import RadialChart, { RadialChartData } from "@/components/Chart/RadialChart";
import { getStatusToColorForCharts } from "@/utils/styling";
import {
  Box,
  Center,
  Divider,
  Flex,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconSquareRoundedFilled } from "@tabler/icons-react";

type RequestStatusTrackerProps = {
  data: RadialChartData[];
};

const RequestStatusTracker = ({ data }: RequestStatusTrackerProps) => {
  const totalCount = data[0].totalCount;

  return (
    <Paper p="xl" w={400} withBorder>
      <Flex h="100%" direction="column" justify="space-between">
        <Title order={3}>Total Request: {totalCount}</Title>
        <Center w="100%">
          <Box maw={300}>
            <RadialChart data={data} />
          </Box>
        </Center>
        <Stack>
          {data.map((d, idx) => (
            <Box key={d.label + idx}>
              <Group w="100%" position="apart">
                <Flex gap="sm" w="fit-content">
                  <Box c={getStatusToColorForCharts(d.label)}>
                    <IconSquareRoundedFilled />
                  </Box>
                  <Text weight={600}>{`${d.label} Requests`}</Text>
                </Flex>
                <Text weight={600}>{`${d.value}/${d.totalCount}`}</Text>
                <Text weight={600} c="dimmed">{`${
                  (d.value / d.totalCount) * 100
                }%`}</Text>
              </Group>
              {idx < data.length - 1 && <Divider />}
            </Box>
          ))}
        </Stack>
      </Flex>
    </Paper>
  );
};

export default RequestStatusTracker;
