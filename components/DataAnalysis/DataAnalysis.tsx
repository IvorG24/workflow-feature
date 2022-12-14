import { Text } from "@mantine/core";

type Data = { label: string; value: number };

type Props = {
  data: Data[];
  chartType?: string;
};

const DataAnalysis = ({ data, chartType = "barchart" }: Props) => {
  const renderChart = (data: Data[], chartType: string) => {
    switch (chartType) {
      case "barchart":
        // <BarChart data={data} />;
        <Text>{chartType}</Text>;
        console.log(data);
        break;

      default:
        break;
    }
  };

  return <>{renderChart(data, chartType)}</>;
};

export default DataAnalysis;
