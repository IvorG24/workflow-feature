import { getStatusToColor } from "@/utils/styling";
import { RequestType } from "@/utils/types";
import {
  ActionIcon,
  Flex,
  Group,
  Paper,
  ScrollArea,
  Text,
  Title,
} from "@mantine/core";
import { IconSquareRoundedFilled } from "@tabler/icons-react";
import { lowerCase } from "lodash";
import moment from "moment";
import { useEffect, useState } from "react";
import StackedBarChart from "./StackedBarChart";

const status = ["Approved", "Rejected", "Pending"];

type ChartData = {
  month: string;
  approved: number;
  rejected: number;
  pending: number;
}[];

type RequestStatisticsProps = {
  requestList: RequestType[];
};

const RequestStatistics = ({ requestList }: RequestStatisticsProps) => {
  const initialChartData = [
    { month: "Jan", approved: 0, rejected: 0, pending: 0 },
    { month: "Feb", approved: 0, rejected: 0, pending: 0 },
    { month: "Mar", approved: 0, rejected: 0, pending: 0 },
    { month: "Apr", approved: 0, rejected: 0, pending: 0 },
    { month: "May", approved: 0, rejected: 0, pending: 0 },
    { month: "Jun", approved: 0, rejected: 0, pending: 0 },
    { month: "Jul", approved: 0, rejected: 0, pending: 0 },
    { month: "Aug", approved: 0, rejected: 0, pending: 0 },
    { month: "Sep", approved: 0, rejected: 0, pending: 0 },
    { month: "Oct", approved: 0, rejected: 0, pending: 0 },
    { month: "Nov", approved: 0, rejected: 0, pending: 0 },
    { month: "Dec", approved: 0, rejected: 0, pending: 0 },
  ];
  const [chartData, setChartData] = useState<ChartData>([]);

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

          default:
            break;
        }
      } else {
        acc[acc.length] = {
          month: requestMonthCreated,
          approved: status === "approved" ? 1 : 0,
          rejected: status === "rejected" ? 1 : 0,
          pending: status === "pending" ? 1 : 0,
        };
      }

      return acc;
    }, [] as ChartData);

    const updatedChartData = initialChartData.map((chartData) => {
      const dataMatch = reducedRequestList.find(
        (requestData) => requestData.month === chartData.month
      );

      if (dataMatch) {
        const { approved, rejected, pending } = dataMatch;
        const totalCount = approved + rejected + pending;

        return {
          ...dataMatch,
          approved: (dataMatch.approved / totalCount) * 100,
          rejected: (dataMatch.rejected / totalCount) * 100,
          pending: (dataMatch.pending / totalCount) * 100,
        };
      } else {
        return chartData;
      }
    });
    setChartData(updatedChartData);
  }, [requestList]);

  return (
    <Paper
      w={{ base: "100%", sm: 500, md: "fit-content" }}
      p={{ base: "sm", sm: "md" }}
      mt="xl"
      h="fit-content"
    >
      <Group px={{ base: 0, sm: "md" }} position="apart">
        <Title order={3}>Request Statistics</Title>
        <Flex gap="sm">
          {status.map((stat, idx) => (
            <Group spacing={4} key={stat + idx}>
              <ActionIcon color={`${getStatusToColor(lowerCase(stat))}`}>
                <IconSquareRoundedFilled />
              </ActionIcon>
              <Text size="xs">{stat}</Text>
            </Group>
          ))}
        </Flex>
      </Group>
      <ScrollArea
        type="always"
        w={{ base: 300, sm: 480, md: 700 }}
        h="fit-content"
      >
        <StackedBarChart data={chartData} />
      </ScrollArea>
    </Paper>
  );
};

export default RequestStatistics;
