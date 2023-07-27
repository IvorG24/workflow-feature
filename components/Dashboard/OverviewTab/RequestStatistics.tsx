import StackedBarChart from "@/components/Chart/StackedBarChart";
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
import { startCase } from "lodash";
import moment from "moment";
import { useEffect, useState } from "react";
import { MonthlyRequestDataTypeWithTotal } from "./Overview";

type RequestStatisticsProps = {
  monthlyChartData: MonthlyRequestDataTypeWithTotal["data"];
  totalRequestCount: number;
  dateFilter: [Date | null, Date | null];
};

const statusList = ["pending", "approved", "rejected"];

const RequestStatistics = ({
  monthlyChartData,
  totalRequestCount,
  dateFilter,
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

  const startDate = moment(dateFilter[0]).format("MMM DD, YYYY");
  const endDate = moment(dateFilter[1]).format("MMM DD, YYYY");
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
