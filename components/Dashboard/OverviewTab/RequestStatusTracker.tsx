import RadialChart, { RadialChartData } from "@/components/Chart/RadialChart";
import { getStatusToColorForCharts } from "@/utils/styling";
import {
  Box,
  Center,
  Flex,
  Group,
  Paper,
  Stack,
  Text,
  Title,
  createStyles,
} from "@mantine/core";
import {
  IconChartDonutFilled,
  IconSquareRoundedFilled,
} from "@tabler/icons-react";

type RequestStatusTrackerProps = {
  data: RadialChartData[];
  totalRequestCount: number;
};

const getPercentage = (value: number, total: number) => {
  const percentage = (value / total) * 100;
  return !isNaN(percentage) ? `${percentage.toFixed(0)}%` : `0%`;
};

const useStyles = createStyles(() => ({
  withBorderBottom: {
    borderBottom: "0.0625rem solid #dee2e6",
  },
}));

const RequestStatusTracker = ({
  data,
  totalRequestCount,
}: RequestStatusTrackerProps) => {
  const { classes } = useStyles();

  return (
    <Paper w="100%" h="100%" withBorder>
      <Group p="md" spacing="xs" className={classes.withBorderBottom}>
        <Center c="green">
          <IconChartDonutFilled />
        </Center>
        <Title order={4}>
          Total Request: {totalRequestCount.toLocaleString()}
        </Title>
      </Group>
      <Flex direction="column" align="stretch" gap="sm" mt="lg">
        <Center w="100%">
          <Box maw={175} mih={175}>
            {totalRequestCount > 0 ? (
              <RadialChart data={data} totalCount={totalRequestCount} />
            ) : (
              <Center h={175}>
                <Text size={20} color="dimmed" weight={600}>
                  No data to display
                </Text>
              </Center>
            )}
          </Box>
        </Center>
        <Stack p="lg" spacing="lg">
          {data.map((d, idx) => (
            <Flex
              key={d.label + idx}
              fz={14}
              justify="space-between"
              align="center"
              wrap="wrap"
            >
              <Group spacing="xs" w="fit-content" align="center">
                <Center c={getStatusToColorForCharts(d.label)}>
                  <IconSquareRoundedFilled />
                </Center>
                <Text weight={600}>{`${d.label} Requests`}</Text>
                <Text align="right" weight={600} c="dimmed">
                  {getPercentage(d.value, totalRequestCount)}
                </Text>
              </Group>
              <Text
                weight={600}
              >{`${d.value.toLocaleString()}/${totalRequestCount.toLocaleString()}`}</Text>
            </Flex>
          ))}
        </Stack>
      </Flex>
    </Paper>
  );
};

export default RequestStatusTracker;
