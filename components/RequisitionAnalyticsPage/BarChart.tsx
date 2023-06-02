import * as d3 from "d3";
import { useEffect, useRef } from "react";

type DataItem = {
  label: string;
  value: number;
};

type Props = {
  data: DataItem[];
};

const BarChart: React.FC<Props> = ({ data }) => {
  const chartRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (data && chartRef.current) {
      const svg = d3.select(chartRef.current);
      const width = 500;
      const height = 300;
      const margin = { top: 20, right: 20, bottom: 30, left: 120 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      const y = d3
        .scaleBand<string>()
        .domain(data.map((d) => d.label))
        .range([0, innerHeight])
        .padding(0.1);

      const x = d3
        .scaleLinear<number>()
        .domain([0, d3.max(data, (d) => d.value) || 0])
        .nice()
        .range([0, innerWidth]);

      const yAxis = (g: d3.Selection<SVGGElement, unknown, null, undefined>) =>
        g.attr("transform", `translate(0,0)`).call(d3.axisLeft(y));

      const xAxis = (g: d3.Selection<SVGGElement, unknown, null, undefined>) =>
        g
          .attr("transform", `translate(0,${innerHeight})`)
          .call(d3.axisBottom(x));

      svg.attr("width", width).attr("height", height);

      const chartGroup = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      chartGroup
        .append("g")
        .attr("fill", "steelblue")
        .selectAll("rect")
        .data(data)
        .join("rect")
        .attr("x", 0)
        .attr("y", (d) => y(d.label)!)
        .attr("width", (d) => x(d.value))
        .attr("height", y.bandwidth());

      chartGroup.append("g").call(xAxis);
      chartGroup.append("g").call(yAxis);
    }
  }, [data]);

  return <svg ref={chartRef}></svg>;
};

export default BarChart;
