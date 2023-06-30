import { Divider, Group, Progress, Stack, Text } from "@mantine/core";

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
      <Group position="apart">
        <Text>Label</Text>
        <Text>Qty</Text>
      </Group>
      <Divider my="md" />
      <Stack>
        {responseData.map((responseItem, idx) => (
          <Stack spacing={4} key={responseItem.label + idx}>
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
      </Stack>
    </>
  );
};

export default ListChart;
