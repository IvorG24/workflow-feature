import * as d3 from "d3";
import { useEffect, useRef } from "react";

type DataItem = {
  label: string;
  value: number;
};

type Props = {
  data: DataItem[];
};

const LineChart: React.FC<Props> = ({ data }) => {
  const chartRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (data && chartRef.current) {
      const svg = d3.select(chartRef.current);
      const width = 500;
      const height = 300;
      const margin = { top: 20, right: 20, bottom: 30, left: 40 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      const x = d3
        .scaleBand<string>()
        .domain(data.map((d) => d.label))
        .range([0, innerWidth])
        .padding(0.1);

      const y = d3
        .scaleLinear<number>()
        .domain([0, d3.max(data, (d) => d.value) || 0])
        .nice()
        .range([innerHeight, 0]);

      const line = d3
        .line<DataItem>()
        .x((d) => x(d.label)!)
        .y((d) => y(d.value));

      svg.attr("width", width).attr("height", height);

      const chartGroup = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      chartGroup
        .append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line);

      chartGroup
        .selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", (d) => x(d.label)!)
        .attr("cy", (d) => y(d.value))
        .attr("r", 4)
        .attr("fill", "steelblue");

      const xAxis = (g: d3.Selection<SVGGElement, unknown, null, undefined>) =>
        g
          .attr("transform", `translate(0,${innerHeight})`)
          .call(d3.axisBottom(x));

      const yAxis = (g: d3.Selection<SVGGElement, unknown, null, undefined>) =>
        g.call(d3.axisLeft(y));

      chartGroup.append("g").call(xAxis);
      chartGroup.append("g").call(yAxis);
    }
  }, [data]);

  return <svg ref={chartRef}></svg>;
};

export default LineChart;
