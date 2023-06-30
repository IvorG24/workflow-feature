import { getUniqueResponseData } from "@/utils/arrayFunctions/dashboard";
import { FieldWithResponseType } from "@/utils/types";
import { Box, Paper, ScrollArea, Title, createStyles } from "@mantine/core";
import ResponseChart from "./ResponseChart";

const useStyles = createStyles(() => ({
  withBorderBottom: {
    borderBottom: "0.0625rem solid #dee2e6",
  },
}));

type ResponseDataTableProps = {
  response: FieldWithResponseType[0];
};

const FieldResponseTable = ({ response }: ResponseDataTableProps) => {
  const { classes } = useStyles();
  const label = response.field_name;
  const chartData = getUniqueResponseData(response.field_response);

  return (
    <Paper maw={400} w={{ base: "100%" }} mah={600} withBorder>
      <ScrollArea maw={500} type="auto" h={300}>
        <Box p="sm" className={classes.withBorderBottom}>
          <Title order={4}>{label}</Title>
        </Box>

        <ResponseChart type={response.field_type} data={chartData} />
      </ScrollArea>
    </Paper>
  );
};

export default FieldResponseTable;
