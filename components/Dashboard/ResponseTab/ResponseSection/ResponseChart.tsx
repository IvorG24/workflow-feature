import LineChart from "@/components/Chart/LineChart";
import ListChart from "@/components/Chart/ListChart";
import { LineChartDataType } from "@/utils/types";
import { Box } from "@mantine/core";
import moment from "moment";

type ResponseChartProps = {
  type: string;
  data: LineChartDataType[];
};

const ResponseChart = ({ type, data }: ResponseChartProps) => {
  const getDataWithStartingPoint = (data: LineChartDataType[]) => {
    return [{ label: "Default", value: 0 }, ...data];
  };

  const renderChart = (dataType: string, chartData: LineChartDataType[]) => {
    switch (dataType) {
      case "DATE":
        const dateChartData = chartData.map((d) => ({
          ...d,
          label: moment(new Date(d.label)).format("MMM DD, YYYY"),
        }));
        return <LineChart data={getDataWithStartingPoint(dateChartData)} />;

      case "NUMBER":
        return <LineChart data={getDataWithStartingPoint(data)} />;

      case "TIME":
        return <LineChart data={getDataWithStartingPoint(data)} />;

      default:
        return <ListChart responseData={data} />;
    }
  };

  return (
    <Box w="100%" p="sm">
      {renderChart(type, data)}
    </Box>
  );
};

export default ResponseChart;
