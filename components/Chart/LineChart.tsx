import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import React from "react";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type DataItem = {
  label: string;
  value: number;
};

type LineChartProps = {
  data: DataItem[];
  legendLabel?: string;
};

const LineChart: React.FC<LineChartProps> = ({ data, legendLabel }) => {
  const chartData = {
    labels: data.map((item) => item.label),
    datasets: [
      {
        label: legendLabel || "<Item Name>",
        data: data.map((item) => item.value),
        fill: false,
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        max: Math.max(...data.map((item) => item.value)) + 5,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return <Line data={chartData} options={chartOptions} />;
};

export default LineChart;
