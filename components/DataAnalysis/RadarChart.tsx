import { useMantineColorScheme } from "@mantine/core";
import { scaleLinear, select } from "d3";
import { useEffect, useRef, useState } from "react";

type ChartData = {
  label: string;
  value: number;
};

const RadarChart = ({ data }: { data: ChartData[] }) => {
  const { colorScheme } = useMantineColorScheme();

  const optimizeValue = (currData: ChartData[]) =>
    currData.map((data) => {
      const value = data.value > 100 ? 1000 : data.value * 10;
      return {
        ...data,
        value: value,
      };
    });
  const [chartData] = useState(optimizeValue(data));
  const radarChartRef = useRef<SVGSVGElement>(null);
  const createChart = () => {
    const svg = select(radarChartRef.current);

    const maxValue = 1000;
    const radius = 140;
    const center = { x: 250, y: 200 };

    const radialScale = scaleLinear().domain([0, maxValue]).range([radius, 0]);

    for (let val = 0; val <= maxValue; val += maxValue / 5) {
      const r = radialScale(val);
      svg
        .append("circle")
        .attr("cx", center.x)
        .attr("cy", center.y)
        .attr("r", r)
        .style("stroke", colorScheme === "dark" ? "#7F8487" : "#BFBFBF")
        .style("fill", "none");
    }

    const middle = Math.round((chartData.length - 1) / 2);
    const anchors = chartData.map((_, index) => {
      if (index === 0 || middle === index) return "middle";
      if (index < middle) return "start";
      return "end";
    });

    const shifts = chartData.map((_, index) => {
      if (index === 0) return { x: 0, y: -10 };
      else if (index === middle) return { x: 10, y: 20 };
      else if (index < middle) return { x: 10, y: 5 };
      else if (index > middle) return { x: -10, y: 5 };
      return { x: 0, y: 0 };
    });

    for (let index = 0; index < chartData.length; index++) {
      const angle = (index * Math.PI * 2) / chartData.length;
      const x = center.x + radius * Math.sin(angle);
      const y = center.y + radius * -Math.cos(angle);
      if (angle >= 0) {
        svg
          .append("line")
          .attr("x1", center.x)
          .attr("y1", center.y)
          .attr("x2", x)
          .attr("y2", y)
          .style("stroke", colorScheme === "dark" ? "#7F8487" : "#BFBFBF");
      }
      svg
        .append("text")
        .text(chartData[index].label)
        .attr("text-anchor", anchors[index])
        .attr("dx", shifts[index].x)
        .attr("dy", shifts[index].y)
        .attr("x", x)
        .attr("y", y)
        .attr("font-size", 15)
        .attr("fill", colorScheme === "dark" ? "#eee" : "#7F8487");
    }
    const allValues = chartData.map((data) => data.value);
    let path = "";
    for (let i = 0; i < allValues.length; i++) {
      const r = radius - radialScale(allValues[i]);
      const angle = (i * Math.PI * 2) / allValues.length;
      const x = center.x + r * Math.sin(angle);
      const y = center.y + r * -Math.cos(angle);
      path += `${i > 0 ? "L" : "M"} ${x},${y} `;
    }
    path += "Z";
    svg
      .append("path")
      .attr("d", path)
      .style("stroke", "#90C8AC")
      .style("stroke-width", 2)
      .style("stroke-opacity", 0.6)
      .style("fill", "#90C8AC")
      .style("fill-opacity", 0.3);
  };
  useEffect(() => {
    createChart();
  }, [chartData, colorScheme]);

  return <svg ref={radarChartRef} viewBox="0 0 500 400" width="40em"></svg>;
};

export default RadarChart;
