import Chart from "chart.js/auto";
import React, { useEffect, useRef } from "react";

type DataItem = {
  label: string;
  value: number;
};

type Props = {
  data: DataItem[];
};

const BarChart: React.FC<Props> = ({ data }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        const labels = data.map((item) => item.label);
        const values = data.map((item) => parseFloat(`${item.value}`));

        new Chart(ctx, {
          type: "bar",
          data: {
            labels,
            datasets: [
              {
                label: "Values",
                data: values,
                backgroundColor: "rgba(75, 192, 192, 0.6)",
              },
            ],
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        });
      }
    }
  }, [data]);

  return (
    <div>
      <canvas ref={chartRef} />
    </div>
  );
};

export default BarChart;
