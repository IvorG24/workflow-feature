import { getStatusToColor } from "@/utils/styling";
import { RequestType } from "@/utils/types";
import { Group, Paper, RingProgress, Stack, Text } from "@mantine/core";
import { lowerCase, startCase } from "lodash";

type RequestCountByStatusProps = {
  requestList: RequestType[];
  status: string;
  totalRequestListCount: number;
};

const RequestCountByStatus = ({
  requestList,
  status,
  totalRequestListCount,
}: RequestCountByStatusProps) => {
  const requestListCount = requestList.length;
  const percentage = (requestListCount / totalRequestListCount) * 100;

  return (
    <Paper
      py={{ base: 8, sm: 16 }}
      px={{ base: 16, sm: 24 }}
      w={{ base: "100%", sm: 360 }}
    >
      <Group spacing="md" position="apart">
        <Stack justify="center" spacing={4}>
          <Text>{`${startCase(lowerCase(status))} Requests`}</Text>
          <Text weight={600} size={32}>
            {requestListCount}
          </Text>
        </Stack>
        <RingProgress
          thickness={18}
          label={
            <Text size="lg" weight={700} align="center">
              {`${percentage ? percentage.toFixed(0) : 0}%`}
            </Text>
          }
          sections={[
            {
              value: percentage,
              color: `${getStatusToColor(lowerCase(status))}`,
            },
          ]}
        />
      </Group>
    </Paper>
  );
};

export default RequestCountByStatus;
