import { RequestByFormType } from "@/utils/types";
import { Box, Group, Paper, Title } from "@mantine/core";
import { IconFileAnalytics } from "@tabler/icons-react";
import moment from "moment";
import { useEffect, useState } from "react";
import StackedBarChart, {
  StackedBarChartDataType,
} from "../../Chart/StackedBarChart";

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

const RequestStatistics = ({ requestList }: RequestStatisticsProps) => {
  const initialChartData = generateInitialChartData();
  const [chartData, setChartData] = useState<StackedBarChartDataType[]>([]);

  useEffect(() => {
    const reducedRequestList = requestList.reduce((acc, request) => {
      const requestMonthCreated = moment(request.request_date_created).format(
        "MMM"
      );
      const status = request.request_status.toLowerCase();
      const duplicateIndex = acc.findIndex(
        (duplicate) => duplicate.month === requestMonthCreated
      );

      if (duplicateIndex >= 0) {
        switch (status) {
          case "approved":
            acc[duplicateIndex].approved++;
            break;
          case "rejected":
            acc[duplicateIndex].rejected++;
            break;
          case "pending":
            acc[duplicateIndex].pending++;
            break;
          case "canceled":
            acc[duplicateIndex].canceled++;
            break;

          default:
            break;
        }
      } else {
        acc[acc.length] = {
          month: requestMonthCreated,
          approved: status === "approved" ? 1 : 0,
          rejected: status === "rejected" ? 1 : 0,
          pending: status === "pending" ? 1 : 0,
          canceled: status === "canceled" ? 1 : 0,
        };
      }

      return acc;
    }, [] as StackedBarChartDataType[]);

    const updatedChartData = initialChartData.map((chartData) => {
      const dataMatch = reducedRequestList.find(
        (requestData) => requestData.month === chartData.month
      );

      if (dataMatch) {
        return dataMatch;
      } else {
        return chartData;
      }
    });
    setChartData(updatedChartData);
  }, [requestList]);

  return (
    <Paper
      w={{ base: "100%" }}
      p={{ base: "sm", sm: "lg" }}
      withBorder
      sx={{ flex: 1 }}
    >
      <Group mb="sm">
        <IconFileAnalytics />
        <Title order={3}>Monthly Request Statistics</Title>
      </Group>
      <Box p="xl">
        <StackedBarChart data={chartData} />
      </Box>
    </Paper>
  );
};

export default RequestStatistics;
