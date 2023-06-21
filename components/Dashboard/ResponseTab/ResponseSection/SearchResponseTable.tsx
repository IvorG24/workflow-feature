import { ResponseDataType } from "@/utils/types";
import { Box, Paper, ScrollArea, Title, createStyles } from "@mantine/core";
import ResponseChart from "./ResponseChart";

const useStyles = createStyles(() => ({
  withBorderBottom: {
    borderBottom: "0.0625rem solid #dee2e6",
  },
}));

type ResponseTableProps = {
  response: ResponseDataType;
};

const SearchResponseTable = ({ response }: ResponseTableProps) => {
  const { classes } = useStyles();
  const { responseList } = response;
  const sortedResponseList = responseList.sort((a, b) => b.value - a.value);

  return (
    <Paper maw={400} w={{ base: "100%" }} mt="xl" mah={600} withBorder>
      <ScrollArea maw={500} type="auto" h={300}>
        <Box p="sm" className={classes.withBorderBottom}>
          <Title order={4}>{response.label}</Title>
        </Box>

        <ResponseChart type={response.type} data={sortedResponseList} />
      </ScrollArea>
    </Paper>
  );
};

export default SearchResponseTable;
