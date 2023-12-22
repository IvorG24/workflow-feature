import { defaultMantineColorList } from "@/utils/styling";
import { UserIssuedItem } from "@/utils/types";
import {
  Box,
  Container,
  Divider,
  Flex,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import "chart.js/auto";
import { ChartData } from "chart.js/auto";
import React, { MouseEvent, useRef } from "react";
import { Bar, getElementAtEvent } from "react-chartjs-2";

type HorizontalBarChartProps = {
  data: UserIssuedItem[];
};

const UserItemBarChart: React.FC<HorizontalBarChartProps> = ({ data }) => {
  const chartRef = useRef();

  const { colors } = useMantineTheme();

  const getDataLabels = () => {
    const maxDatalabelCount = Math.max(
      ...data.map((item) => item.variation.length),
      0
    );
    const dataLabels: number[][] = Array.from(
      { length: maxDatalabelCount },
      () => []
    );

    data.forEach((item, itemIdx) => {
      const variationCount = item.variation.length;
      const fillCount = maxDatalabelCount - variationCount;
      const quantityList = [
        ...item.variation.map((variation) => variation.quantity),
        ...Array(fillCount).fill(0),
      ];

      quantityList.forEach((quantity, quantityIdx) => {
        dataLabels[quantityIdx][itemIdx] = quantity;
      });
    });

    return dataLabels.map((dataArray, dataArrayIdx) => {
      return {
        label: "Quantity",
        data: dataArray,
        backgroundColor:
          dataArrayIdx === 0
            ? "#339AF0"
            : defaultMantineColorList[Math.floor(Math.random() * 8) + 2],
        borderColor: colors.gray[6],
        borderWidth: 1,
        barPercentage: 0.7,
        borderSkipped: false,
        borderRadius: {
          topLeft: 20,
          topRight: 20,
          bottomLeft: 20,
          bottomRight: 20,
        },
      };
    });
  };

  const chartData: ChartData<"bar", number[], string> = {
    labels: data.map((item) => item.itemName),
    datasets: getDataLabels(),
  };

  const chartOptions = {
    indexAxis: "y" as const,
    responsive: true,
    scales: {
      x: {
        beginAtZero: true,
        max: Math.max(...data.map((item) => item.itemQuantity)),
        stacked: true,
        border: {
          display: false,
        },
        grid: {
          display: false,
          drawOnChartArea: false,
          drawTicks: false,
        },
        ticks: {
          display: false,
        },
      },
      y: {
        stacked: true,
        border: {
          display: false,
        },
        grid: {
          display: false,
          drawOnChartArea: false,
          drawTicks: false,
        },
        ticks: {
          display: true,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
    datasets: {
      bar: {
        grouped: true,
        maxBarThickness: 45,
      },
    },
    maintainAspectRatio: false,
  };

  const handleOnClick = (e: MouseEvent<HTMLCanvasElement>) => {
    const { current: chart } = chartRef;

    if (!chart) {
      return;
    }
    const clickedElement = getElementAtEvent(chart, e)[0];

    if (!clickedElement) return;
    const item = data[clickedElement.index];
    const itemVariant =
      data[clickedElement.index].variation[clickedElement.datasetIndex];

    modals.open({
      title: (
        <Flex direction="column">
          <Text>{item.itemName}</Text>
          <Text size="xs">
            <Text size="xs" color="dimmed" span>
              Total Quantity:{" "}
            </Text>
            {item.itemQuantity}
          </Text>
        </Flex>
      ),
      centered: true,
      children: (
        <Box maw={390}>
          <Divider />
          <Text size="sm">
            <Text size="sm" color="dimmed" span>
              Variant Quantity:
            </Text>{" "}
            {itemVariant.quantity}
          </Text>
          {itemVariant.specification.length > 0 &&
            itemVariant.specification.map((spec, specIdx) => (
              <Text size="sm" key={specIdx}>
                <Text size="sm" color="dimmed" span>
                  {spec.fieldName}:
                </Text>{" "}
                {spec.response}
              </Text>
            ))}
        </Box>
      ),
    });
  };

  return (
    <Container h={data.length * 30}>
      <Bar
        ref={chartRef}
        data={chartData}
        options={chartOptions}
        onClick={handleOnClick}
        style={{ cursor: "pointer" }}
      />
    </Container>
  );
};

export default UserItemBarChart;
