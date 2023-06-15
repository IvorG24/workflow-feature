import { Group, Progress, Stack, Text } from "@mantine/core";

type ListChartProps = {
  responseData: {
    label: string;
    value: number;
  }[];
};

const ListChart = ({ responseData }: ListChartProps) => {
  const totalCount = responseData.reduce((sum, value) => sum + value.value, 0);
  return (
    <>
      {responseData.map((responseItem, idx) => (
        <Stack key={responseItem.label + idx}>
          <Group position="apart">
            <Group spacing="xs">
              <Text weight={500}>{responseItem.label}</Text>
            </Group>
            <Text weight={600}>{responseItem.value}</Text>
          </Group>
          <Progress
            size="sm"
            value={(responseItem.value / totalCount) * 100}
            color={idx % 2 === 0 ? "#339AF0" : "#FF6B6B"}
          />
        </Stack>
      ))}
    </>
  );
};

export default ListChart;
