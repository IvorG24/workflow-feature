import RadialChart, { RadialChartData } from "@/components/Chart/RadialChart";
import { getStatusToColorForCharts } from "@/utils/styling";
import {
  Box,
  Center,
  Divider,
  Flex,
  Grid,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconSquareRoundedFilled } from "@tabler/icons-react";

type RequestStatusTrackerProps = {
  data: RadialChartData[];
};

const getPercentage = (value: number, total: number) => {
  const percentage = (value / total) * 100;
  return !isNaN(percentage) ? `${percentage.toFixed(0)}%` : `0%`;
};

const RequestStatusTracker = ({ data }: RequestStatusTrackerProps) => {
  const totalCount = data[0].totalCount;
  return (
    <Paper p="lg" w="100%" h="100%" withBorder>
      <Flex h="100%" direction="column" justify="space-between">
        <Title order={3}>Total Request: {totalCount}</Title>
        <Center w="100%">
          <Box maw={175} mih={175}>
            {totalCount > 0 ? (
              <RadialChart data={data} />
            ) : (
              <Center mih={175}>
                <Text size={20} color="dimmed" weight={600}>
                  No data available.
                </Text>
              </Center>
            )}
          </Box>
        </Center>
        <Stack>
          {data.map((d, idx) => (
            <Box key={d.label + idx} fz={14}>
              <Grid justify="flex-end">
                <Grid.Col span={8}>
                  <Flex gap="sm" w="fit-content">
                    <Box c={getStatusToColorForCharts(d.label)}>
                      <IconSquareRoundedFilled />
                    </Box>
                    <Text weight={600}>{`${d.label} Requests`}</Text>
                  </Flex>
                </Grid.Col>
                <Grid.Col span={2}>
                  <Text weight={600}>{`${d.value}/${d.totalCount}`}</Text>
                </Grid.Col>
                <Grid.Col span={2}>
                  <Text align="right" weight={600} c="dimmed">
                    {getPercentage(d.value, d.totalCount)}
                  </Text>
                </Grid.Col>
              </Grid>
              {idx < data.length - 1 && <Divider />}
            </Box>
          ))}
        </Stack>
      </Flex>
    </Paper>
  );
};

export default RequestStatusTracker;
