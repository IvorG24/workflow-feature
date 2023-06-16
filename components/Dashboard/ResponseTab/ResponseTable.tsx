import { ResponseDataType } from "@/utils/types";
import {
  Box,
  Paper,
  ScrollArea,
  Text,
  Title,
  createStyles,
} from "@mantine/core";
import { lowerCase, startCase } from "lodash";
import ResponseChart from "./ResponseChart";

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
  const sortedResponseList = responseList.sort((a, b) => b.value - a.value);

  return (
    <Paper maw={400} w={{ base: "100%" }} mt="xl" mah={600} withBorder>
      <ScrollArea maw={500} type="auto" h={300}>
        <Box p="sm" className={classes.withBorderBottom}>
          <Title order={4}>{response.label}</Title>
          <Text size="xs">{`${startCase(
            lowerCase(response.type)
          )} Field`}</Text>
        </Box>

        <ResponseChart type={response.type} data={sortedResponseList} />
      </ScrollArea>
    </Paper>
  );
};

export default ResponseTable;
