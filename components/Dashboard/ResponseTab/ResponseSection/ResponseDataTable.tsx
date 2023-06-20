import { FieldWithResponseType, LineChartDataType } from "@/utils/types";
import { Box, Paper, ScrollArea, Title, createStyles } from "@mantine/core";
import ResponseChart from "../ResponseChart";

const useStyles = createStyles(() => ({
  withBorderBottom: {
    borderBottom: "0.0625rem solid #dee2e6",
  },
}));

type ResponseDataTableProps = {
  response: FieldWithResponseType[0];
};

export const getUniqueResponseData = (
  data: FieldWithResponseType[0]["field_response"]
) => {
  const uniqueResponseData = data.reduce((acc, response) => {
    const parseResponseValue = JSON.parse(response.request_response);
    const duplicateResponseIndex = acc.findIndex(
      (res) => res.label === parseResponseValue
    );

    if (duplicateResponseIndex >= 0) {
      acc[duplicateResponseIndex].value++;
    } else {
      const newResponse = { label: parseResponseValue, value: 1 };
      acc.push(newResponse);
    }

    return acc;
  }, [] as LineChartDataType[]);

  const sortedUniqueResponseData = uniqueResponseData.sort(
    (a, b) => b.value - a.value
  );
  return sortedUniqueResponseData;
};

const ResponseDataTable = ({ response }: ResponseDataTableProps) => {
  const { classes } = useStyles();
  const label = response.field_name;
  const chartData = getUniqueResponseData(response.field_response);

  return (
    <Paper maw={400} w={{ base: "100%" }} mt="xl" mah={600} withBorder>
      <ScrollArea maw={500} type="auto" h={300}>
        <Box p="sm" className={classes.withBorderBottom}>
          <Title order={4}>{label}</Title>
        </Box>

        <ResponseChart type={response.field_type} data={chartData} />
      </ScrollArea>
    </Paper>
  );
};

export default ResponseDataTable;
