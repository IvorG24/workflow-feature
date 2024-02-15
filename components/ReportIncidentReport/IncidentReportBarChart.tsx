import { Chart, registerables } from "chart.js";
import React, { useRef } from "react";
import { Bar } from "react-chartjs-2";

export type DataItem = {
  label: string;
  value: number;
};

type HorizontalBarChartProps = {
  data: DataItem[];
};

const IncidentReportBarChart: React.FC<HorizontalBarChartProps> = ({
  data,
}) => {
  Chart.register(...registerables);
  const chartRef = useRef();
  const chartData = {
    labels: data.map((item) => item.label),
    datasets: [
      {
        label: "Report Count",
        data: data.map((item) => item.value),
        backgroundColor: "#339AF0",
        borderColor: "#1864AB",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    indexAxis: "x" as const,
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        max: Math.max(...data.map((item) => item.value)),
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return <Bar ref={chartRef} data={chartData} options={chartOptions} />;
};

export default IncidentReportBarChart;
