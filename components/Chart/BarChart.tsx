import React, { Dispatch, SetStateAction, useRef } from "react";
import { Bar } from "react-chartjs-2";

type DataItem = {
  label: string;
  value: number;
};

type HorizontalBarChartProps = {
  data: DataItem[];
  setSelectedBarChartItem?: Dispatch<SetStateAction<string>>;
};

const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({ data }) => {
  const chartRef = useRef();
  const chartData = {
    labels: data.map((item) => item.label),
    datasets: [
      {
        label: "Purchase Order",
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
        max: Math.max(...data.map((item) => item.value)),
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  // const handleOnClick = (e: MouseEvent<HTMLCanvasElement>) => {
  //   const { current: chart } = chartRef;

  //   if (!chart) {
  //     return;
  //   }
  //   const clickedElement = getElementAtEvent(chart, e);
  //   const { index } = clickedElement[0];
  //   const elementLabel = chartData.labels[index];
  //   if (setSelectedBarChartItem) {
  //     setSelectedBarChartItem(elementLabel);
  //   }
  // };

  return (
    <Bar
      ref={chartRef}
      data={chartData}
      options={chartOptions}
      // onClick={handleOnClick}
    />
  );
};

export default HorizontalBarChart;
