import { getStatusToColorForCharts } from "@/utils/styling";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import React from "react";
import { Doughnut } from "react-chartjs-2";

export type RadialChartData = {
  label: string;
  value: number;
  totalCount: number;
};

type RadialChartProps = {
  data: RadialChartData[];
};

ChartJS.register(ArcElement, Tooltip, Legend);

const RadialChart: React.FC<RadialChartProps> = ({
  data,
}: RadialChartProps) => {
  const totalCount = data[0].totalCount;
  const labels = ["Approved", "Pending", "Rejected", "Canceled"];
  const dataSet = data.map((d) => ({
    label: d.label,
    data: [d.value, totalCount - d.value],
    backgroundColor: [getStatusToColorForCharts(d.label), "#C1C2C5"],
    borderWidth: 4,
    borderRadius: 24,
  }));

  const chartData = {
    labels: labels,
    datasets: dataSet,
  };

  const chartOptions = {
    cutout: "25%",
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  return <Doughnut data={chartData} options={chartOptions} />;
};

export default RadialChart;
