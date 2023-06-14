import React from "react";
import { Bar } from "react-chartjs-2";

type DataItem = {
  label: string;
  value: number;
};

type HorizontalBarChartProps = {
  data: DataItem[];
};

const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map((item) => item.label),
    datasets: [
      {
        label: "Item Purchase",
        data: data.map((item) => item.value),
        backgroundColor: "#339AF0",
        borderColor: "#1864AB",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    indexAxis: "y" as const,
    responsive: true,
    scales: {
      x: {
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

  return <Bar data={chartData} options={chartOptions} />;
};

export default HorizontalBarChart;
