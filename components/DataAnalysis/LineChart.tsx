import {
  axisBottom,
  axisLeft,
  curveMonotoneX,
  line,
  max,
  scaleLinear,
  scalePoint,
  select,
} from "d3";

import { useEffect, useRef, useState } from "react";

export type LineChartDataType = {
  label?: string;
  value: number;
  dateTime: string;
  borderColor?: string;
  borderWidth?: number;
  backgroundColor?: string;
};

type ChartData = {
  label: string;
  value: number;
};
type LineData = {
  name: string;
  value: number;
};

const LineChart = ({ data }: { data: ChartData[] }) => {
  const width = 600;
  const height = 300;
  const padding = 30;

  const optimizeData = (currData: ChartData[]) => {
    return currData.map((data) => {
      return {
        name: data.label,
        value: data.value,
      };
    });
  };
  const [chartData] = useState<LineData[]>(optimizeData(data));

  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const maxDomain = max(chartData, (d) => d.value) as number;
    const xTextScale = scalePoint()
      .domain(chartData.map((d) => d.name))
      .range([0 + padding, width - padding]);

    const xScale = scaleLinear()
      .domain([0, chartData.length - 1])
      .range([padding, width - padding]);
    const yScale = scaleLinear()
      .domain([0, maxDomain])
      .range([height - padding, 0 + padding]);

    const generateLine = line<LineData>()
      .x((d, i) => xScale(i))
      .y((d) => yScale(d["value"]))
      .curve(curveMonotoneX);

    select(svgRef.current)
      .select("path")
      .attr("d", () => generateLine(chartData))
      .attr("fill", "none")
      .attr("stroke", "#90C8AC");

    const xAxis = axisBottom(xTextScale);
    const yAxis = axisLeft(yScale);

    select("#xaxis").remove();
    select(svgRef.current)
      .append("g")
      .attr("transform", `translate(0,${height - padding})`)
      .attr("id", "xaxis")
      .call(xAxis);

    select("#yaxis").remove();
    select(svgRef.current)
      .append("g")
      .attr("transform", `translate(${padding},0)`)
      .attr("id", "yaxis")
      .call(yAxis);
  }, [chartData]);

  return (
    <svg ref={svgRef} viewBox="0 0 600 300" width="40em">
      <path d="" strokeWidth="1.5" />
    </svg>
  );
};

export default LineChart;
