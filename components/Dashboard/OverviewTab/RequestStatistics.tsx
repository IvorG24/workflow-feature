import { getStackedBarChartData } from "@/utils/arrayFunctions/dashboard";
import { getStatusToColorForCharts } from "@/utils/styling";
import { RequestByFormType } from "@/utils/types";
import { Box, Flex, Group, Paper, Stack, Text, Title } from "@mantine/core";
import {
  IconFileAnalytics,
  IconSquareRoundedFilled,
} from "@tabler/icons-react";
import { startCase } from "lodash";
import { useState } from "react";
import StackedBarChart from "../../Chart/StackedBarChart";

type RequestStatisticsProps = {
  requestList: RequestByFormType[];
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

const statusList = ["approved", "rejected", "pending", "canceled"];

const RequestStatistics = ({ requestList }: RequestStatisticsProps) => {
  const initialChartData = generateInitialChartData();
  const [chartData, setChartData] = useState(
    getStackedBarChartData(requestList, initialChartData)
  );
  const [selectedFilter, setSelectedFilter] = useState([""]);
  const filterChart = (status: string) => {
    const filteredChartData = chartData.map((d) => {
      // update status
      switch (status) {
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

      return d;
    });

    setChartData(filteredChartData);
  };

  return (
    <Paper w="100%" h="100%" p="md" withBorder sx={{ flex: 1 }}>
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
              >
                <Box c={getStatusToColorForCharts(status)}>
                  <IconSquareRoundedFilled />
                </Box>
                <Text weight={600}>{startCase(status)}</Text>
              </Flex>
            ))}
          </Group>
        </Group>
        <Box p="xs" w="100%">
          <StackedBarChart data={chartData} />
        </Box>
      </Stack>
    </Paper>
  );
};

export default RequestStatistics;
