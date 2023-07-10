import { getStackedBarChartData } from "@/utils/arrayFunctions/dashboard";
import { getStatusToColorForCharts } from "@/utils/styling";
import { Box, Flex, Group, Paper, Stack, Text, Title } from "@mantine/core";
import {
  IconFileAnalytics,
  IconSquareRoundedFilled,
} from "@tabler/icons-react";
import { startCase } from "lodash";
import { useEffect, useState } from "react";
import StackedBarChart from "../../Chart/StackedBarChart";
import { RequestStatusDataType } from "./Overview";

type RequestStatisticsProps = {
  requestStatusData: RequestStatusDataType[];
};

const generateInitialChartData = () => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const initialChartData = months.map((month) => ({
    month,
    approved: 0,
    rejected: 0,
    pending: 0,
    canceled: 0,
  }));

  return initialChartData;
};

const statusList = ["pending", "approved", "rejected", "canceled"];

const RequestStatistics = ({ requestStatusData }: RequestStatisticsProps) => {
  const initialChartData = getStackedBarChartData(
    requestStatusData,
    generateInitialChartData()
  );

  const [chartData, setChartData] = useState(generateInitialChartData());
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

    const newChartData = initialChartData.map((d) => {
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
          case "canceled":
            d.canceled = 0;
            break;

          default:
            break;
        }
      });

      return d;
    });
    setChartData(newChartData);
  };

  useEffect(() => {
    setChartData(initialChartData);
  }, [requestStatusData]);

  return (
    <Paper w="100%" h="100%" p="lg" withBorder sx={{ flex: 1 }}>
      <Stack>
        <Group position="apart">
          <Group mb="sm">
            <IconFileAnalytics />
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
          <StackedBarChart
            data={chartData}
            xAxisLabel={`${new Date().getFullYear()}`}
          />
        </Box>
      </Stack>
    </Paper>
  );
};

export default RequestStatistics;
