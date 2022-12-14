import BarChart from "./BarChart";

type Data = { label: string; value: number };

type Props = {
  data: Data[];
  chartType?: string;
};

const DataAnalysis = ({ data, chartType = "barchart" }: Props) => {
  const renderChart = (data: Data[], chartType: string) => {
    switch (chartType) {
      case "barchart":
        return <BarChart data={data} />;
      // case "linechart":
      //   return <LineChart data={data} />;
      // case "radarchart":
      //   return <RadarChart data={data} />;

      default:
        break;
    }
  };

  return <>{renderChart(data, chartType)}</>;
};

export default DataAnalysis;
