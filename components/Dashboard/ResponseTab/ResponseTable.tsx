import {
  Box,
  Group,
  Paper,
  Progress,
  Stack,
  Text,
  Title,
  createStyles,
} from "@mantine/core";
import { ResponseDataType } from "./ResponseDataChart";

const useStyles = createStyles(() => ({
  withBorderBottom: {
    borderBottom: "0.0625rem solid #dee2e6",
  },
}));

type ResponseTableProps = {
  response: ResponseDataType[0];
};

const ResponseTable = ({ response }: ResponseTableProps) => {
  const { classes } = useStyles();
  const { responseList } = response;
  const sortedResponseList = responseList.sort((a, b) => b.count - a.count);
  const totalCount = responseList.reduce((sum, value) => sum + value.count, 0);
  return (
    <Paper w={{ base: "100%", sm: 320 }} mt="xl" h="fit-content" withBorder>
      <Box p="sm" className={classes.withBorderBottom}>
        <Title order={4}>{response.label}</Title>
      </Box>

      <Stack p="sm" my="sm">
        {sortedResponseList.map((responseItem, idx) => (
          <Stack key={responseItem.label + idx}>
            <Group position="apart">
              <Group spacing="xs">
                <Text weight={500}>{responseItem.label}</Text>
              </Group>
              <Text weight={600}>{responseItem.count}</Text>
            </Group>
            <Progress
              size="sm"
              value={(responseItem.count / totalCount) * 100}
              color={idx % 2 === 0 ? "#339AF0" : "#FF6B6B"}
            />
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
};

export default ResponseTable;
