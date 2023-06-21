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
  return (
    <Paper p="xl" w={400}>
      <Stack spacing="xl">
        <Title order={3}>Request Status</Title>
        <Center w="100%">
          <Box maw={250}>
            <RadialChart data={data} />
          </Box>
        </Center>
        <Stack>
          {data.map((meter, idx) => (
            <Box key={meter.label + idx}>
              <Group w="100%" position="apart">
                <Flex gap="sm" w="fit-content">
                  <Box c={getStatusToColorForCharts(meter.label)}>
                    <IconSquareRoundedFilled />
                  </Box>
                  <Text weight={600}>{`${meter.label} Requests`}</Text>
                </Flex>
                <Text weight={600}>{`${meter.value}/${meter.totalCount}`}</Text>
                <Text weight={600} c="dimmed">{`${
                  (meter.value / meter.totalCount) * 100
                }%`}</Text>
              </Group>
              {idx < data.length - 1 && <Divider />}
            </Box>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
};

export default RequestStatusTracker;
