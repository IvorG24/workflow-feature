import { Box } from "@mantine/core";
import * as d3 from "d3";
import { useEffect, useRef } from "react";

type DataItem = {
  month: string;
  approved: number;
  rejected: number;
  pending: number;
};

type StackedBarChartProps = {
  data: DataItem[];
};

const StackedBarChart: React.FC<StackedBarChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chartContainer = d3.select(chartRef.current);
    chartContainer.select("svg").remove();

    // Set up the dimensions of the chart
    const containerWidth = chartContainer.node()!.getBoundingClientRect().width;
    const width = containerWidth >= 700 ? 700 : containerWidth;
    const height = width * 0.7;
    // const width = 700;
    // const height = 400;
    const margin = { top: 20, right: 30, bottom: 30, left: 60 };

    // Calculate the chart area dimensions
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create the SVG container
    const svg = chartContainer
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Create the chart group and translate it to leave space for margins
    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Set up the x-axis scale
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.month))
      .range([0, chartWidth])
      .padding(0.6);

    // Set up the y-axis scale
    const y = d3.scaleLinear().domain([0, 100]).range([chartHeight, 0]);

    // Create the x-axis
    const xAxis = d3.axisBottom(x);

    // Create the y-axis
    const yAxis = d3.axisLeft(y).tickFormat((d) => `${d}%`);

    // Append the x-axis to the chart
    chart
      .append("g")
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(xAxis);

    // Append the y-axis to the chart
    chart.append("g").call(yAxis);

    // Create the stacked bar chart
    const stack = d3
      .stack<DataItem>()
      .keys(["approved", "rejected", "pending"]);
    const series = stack(data);

    // Add horizontal background lines
    const numLines = 10; // Number of horizontal lines
    const yTickCount = y.ticks(numLines); // Generate tick values

    chart
      .append("g")
      .attr("class", "grid-lines")
      .selectAll("line")
      .data(yTickCount)
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("x2", chartWidth)
      .attr("y1", (d) => y(d) || 0)
      .attr("y2", (d) => y(d) || 0)
      .attr("stroke", "#ccc")
      .attr("stroke-dasharray", "1 0");

    chart
      .selectAll(".bar")
      .data(series)
      .enter()
      .append("g")
      .attr("fill", (d, i) => ["#40c057", "#fa5252", "#228be6"][i])
      .selectAll("rect")
      .data((d) => d)
      .join("rect")
      .attr("x", (d) => x(d.data.month) || 0)
      .attr("y", (d) => y(d[1]) || 0)
      .attr("height", (d) => y(d[0]) - y(d[1]) - 5 || 0)
      .attr("width", x.bandwidth())
      .attr("rx", 12) // Rounded corner
      .attr("ry", 12); // Rounded corner

    // Add labels for the stacked bars
    // chart
    //   .selectAll(".label")
    //   .data(series)
    //   .enter()
    //   .append("g")
    //   .selectAll("text")
    //   .data((d) => d)
    //   .join("text")
    //   .text((d) => `${d[1] - d[0]}%`)
    //   .attr("x", (d) => (x(d.data.month) || 0) + x.bandwidth() / 2)
    //   .attr("y", (d) => (y(d[1]) || 0) - 5)
    //   .attr("text-anchor", "middle")
    //   .attr("fill", "white")
    //   .style("font-size", "12px");
  }, []);

  return <Box ref={chartRef} w="100%" />;
};

export default StackedBarChart;
