import { getStatusToColor } from "@/utils/styling";
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
import StackedBarChart from "./StackedBarChart";

const status = ["Approved", "Rejected", "Pending"];

const dummyChartData = [
  { month: "Jan", approved: 60, rejected: 20, pending: 20 },
  { month: "Feb", approved: 75, rejected: 10, pending: 15 },
  { month: "Mar", approved: 40, rejected: 30, pending: 30 },
  { month: "Apr", approved: 55, rejected: 25, pending: 20 },
  { month: "May", approved: 70, rejected: 15, pending: 15 },
  { month: "Jun", approved: 45, rejected: 30, pending: 25 },
  { month: "Jul", approved: 65, rejected: 10, pending: 25 },
  { month: "Aug", approved: 50, rejected: 20, pending: 30 },
  { month: "Sep", approved: 35, rejected: 30, pending: 35 },
  { month: "Oct", approved: 60, rejected: 15, pending: 25 },
  { month: "Nov", approved: 75, rejected: 5, pending: 20 },
  { month: "Dec", approved: 40, rejected: 35, pending: 25 },
];

const RequestStatistics = () => {
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
        <StackedBarChart data={dummyChartData} />
      </ScrollArea>
    </Paper>
  );
};

export default RequestStatistics;
