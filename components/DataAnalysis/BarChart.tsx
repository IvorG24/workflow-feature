import {
  axisBottom,
  axisLeft,
  scaleBand,
  ScaleBand,
  scaleLinear,
  ScaleLinear,
  scaleOrdinal,
  select,
} from "d3";

import { useEffect, useRef } from "react";

type BarChartProps = {
  data: {
    label: string;
    value: number;
  }[];
};

type BarProps = {
  x: number | undefined;
  y: number | undefined;
  width: number;
  height: number;
  color: string;
  text: {
    label: string;
    value: number;
  };
};

type XAxisProps = {
  scale: ScaleLinear<number, number, never>;
  transform: string;
};

type YAxisProps = {
  scale: ScaleBand<string>;
};

const Bar = ({ x, y, width, height, color, text }: BarProps) => {
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={color} />
      <text
        fill="white"
        x={width - 10}
        y={Number(y) + height / 1.3}
        fontSize="16px"
      >
        {`${text.value}`}
      </text>
    </g>
  );
};

const XAxis = ({ scale, transform }: XAxisProps) => {
  const ref = useRef<SVGGElement>(null);

  useEffect(() => {
    if (ref.current) {
      select(ref.current).call(axisBottom(scale)).style("font-size", "16px");
    }
  }, [scale]);

  return <g ref={ref} transform={transform} />;
};

const YAxis = ({ scale }: YAxisProps) => {
  const ref = useRef<SVGGElement>(null);

  useEffect(() => {
    if (ref.current) {
      select(ref.current).call(axisLeft(scale)).style("font-size", "16px");
    }
  }, [scale]);

  return <g ref={ref} />;
};

const BarChart = ({ data }: BarChartProps) => {
  const width = 700;
  const height = 500;
  const margin = { top: 20, right: 20, bottom: 20, left: 150 };

  const xScale = scaleLinear()
    .domain([0, Math.round(Math.max(...data.map((d) => d.value)) / 5) * 5])
    .rangeRound([0, width]);
  const yScale = scaleBand()
    .domain(data.map(({ label }) => label))
    .range([0, height])
    .padding(0.2);

  const color = scaleOrdinal().range([
    "#114B5F",
    "#028090",
    "#0090C1",
    "#456990",
    "#F45B69",
  ]);

  return (
    <svg
      viewBox={`0 0 ${width + margin.left + margin.right} ${
        height + margin.bottom + margin.top
      }`}
      textAnchor="end"
    >
      <g transform={`translate(${margin.left}, 0)`}>
        {data.map(({ label, value }, idx) => {
          return (
            <Bar
              key={`bar-${idx}`}
              x={0}
              text={{ label: label, value: value }}
              y={yScale(label)}
              height={yScale.bandwidth()}
              width={xScale(value)}
              color={`${color(idx.toString())}`}
            />
          );
        })}
        <YAxis scale={yScale} />
        <XAxis scale={xScale} transform={`translate(0, ${height})`} />
      </g>
    </svg>
  );
};

export default BarChart;
