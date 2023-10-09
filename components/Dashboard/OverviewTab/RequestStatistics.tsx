import StackedBarChart from "@/components/Chart/StackedBarChart";
import { startCase } from "@/utils/string";
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
} from "@mantine/core";
import { IconChartBar, IconSquareRoundedFilled } from "@tabler/icons-react";
import moment from "moment";
import { useEffect, useState } from "react";
import { MonthlyRequestDataTypeWithTotal } from "./Overview";

type RequestStatisticsProps = {
  startDateFilter: Date | null;
  endDateFilter: Date | null;
  monthlyChartData: MonthlyRequestDataTypeWithTotal["data"];
  totalRequestCount: number;
};

const statusList = ["pending", "approved", "rejected"];

const RequestStatistics = ({
  monthlyChartData,
  totalRequestCount,
  startDateFilter,
  endDateFilter,
}: RequestStatisticsProps) => {
  const [chartData, setChartData] = useState(monthlyChartData);
  const [selectedFilter, setSelectedFilter] = useState<string[]>([]);

  const filterChart = (newFilter: string) => {
    let updatedFilter = selectedFilter;
    if (selectedFilter.includes(newFilter)) {
      updatedFilter = selectedFilter.filter(
        (oldFilter) => oldFilter !== newFilter
      );
    } else {
      updatedFilter.push(newFilter);
    }
    setSelectedFilter(updatedFilter);

    const newChartData = monthlyChartData.map((d) => {
      updatedFilter.forEach((filter) => {
        // update status
        switch (filter) {
          case "approved":
            d.approved = 0;
            break;
          case "rejected":
            d.rejected = 0;
            break;
          case "pending":
            d.pending = 0;
            break;

          default:
            break;
        }
      });

      return d;
    });
    setChartData(newChartData);
  };

  const startDate = moment(startDateFilter).format("MMM DD, YYYY");
  const endDate = moment(endDateFilter).format("MMM DD, YYYY");
  const xAxisChartLabel =
    startDate === endDate ? startDate : `${startDate} - ${endDate}`;

  useEffect(() => {
    setChartData(monthlyChartData);
  }, [monthlyChartData]);

  return (
    <Paper w="100%" h="100%" p="lg" withBorder sx={{ flex: 1 }}>
      <Stack>
        <Group position="apart">
          <Group spacing="xs" mb="sm">
            <Center c="green">
              <IconChartBar />
            </Center>
            <Title order={3}>Monthly Statistics</Title>
          </Group>
          <Group fz={14}>
            {statusList.map((status, idx) => (
              <Flex
                key={status + idx}
                gap={4}
                w="fit-content"
                onClick={() => filterChart(status)}
                sx={{ cursor: "pointer" }}
              >
                <Box c={getStatusToColorForCharts(status)}>
                  <IconSquareRoundedFilled />
                </Box>
                <Text
                  weight={600}
                  strikethrough={selectedFilter.includes(status)}
                >
                  {startCase(status)}
                </Text>
              </Flex>
            ))}
          </Group>
        </Group>
        <Box p="xs" w="100%">
          {totalRequestCount > 0 ? (
            <StackedBarChart
              data={chartData}
              xAxisLabel={xAxisChartLabel}
              yAxisLabel="No. of Request"
            />
          ) : (
            <Center mih={600}>
              <Text size={20} color="dimmed" weight={600}>
                No data to display
              </Text>
            </Center>
          )}
        </Box>
      </Stack>
    </Paper>
  );
};

export default RequestStatistics;
