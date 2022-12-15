import BarChart from "./BarChart";
import LineChart from "./LineChart";
import RadarChart from "./RadarChart";

type Data = { label: string; value: number };

type Props = {
  data: Data[];
  chartType?: "bar" | "line" | "radar";
};

const DataAnalysis = ({ data, chartType = "bar" }: Props) => {
  const renderChart = (data: Data[], chartType: string) => {
    switch (chartType) {
      case "bar":
        return <BarChart data={data} />;
      case "line":
        return <LineChart data={data} />;
      case "radar":
        return <RadarChart data={data} />;

      default:
        break;
    }
  };

  return <>{renderChart(data, chartType)}</>;
};

export default DataAnalysis;
