import { getStatusToColor } from "@/utils/styling";
import { Group, Paper, RingProgress, Stack, Text } from "@mantine/core";
import { lowerCase, startCase } from "lodash";

type RequestCountByStatusProps = {
  label: string;
  value: number;
  totalCount: number;
};

const RequestCountByStatus = ({
  label,
  value,
  totalCount,
}: RequestCountByStatusProps) => {
  const percentage = (value / totalCount) * 100;

  return (
    <Paper
      py={{ base: 8, sm: 16 }}
      px={{ base: 16, sm: 24 }}
      w={{ base: "100%", sm: 360 }}
    >
      <Group spacing="md" position="apart">
        <Stack justify="center" spacing={4}>
          <Text>{`${startCase(lowerCase(label))} Requests`}</Text>
          <Text weight={600} size={32}>
            {value}
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
              color: `${getStatusToColor(lowerCase(label))}`,
            },
          ]}
        />
      </Group>
    </Paper>
  );
};

export default RequestCountByStatus;
