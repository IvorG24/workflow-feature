import { defaultMantineColorHexList } from "@/utils/styling";
import { UserIssuedItem } from "@/utils/types";
import { Carousel, Embla, useAnimationOffsetEffect } from "@mantine/carousel";
import { Box, Container, Flex, Spoiler, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import "chart.js/auto";
import { ChartData } from "chart.js/auto";
import React, { MouseEvent, useRef, useState } from "react";
import { Bar, getElementAtEvent } from "react-chartjs-2";

type HorizontalBarChartProps = {
  data: UserIssuedItem[];
};

const UserItemBarChart: React.FC<HorizontalBarChartProps> = ({ data }) => {
  const chartRef = useRef();

  const TRANSITION_DURATION = 200;
  const [embla, setEmbla] = useState<Embla | null>(null);
  useAnimationOffsetEffect(embla, TRANSITION_DURATION);

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
      let colorIndex = dataArrayIdx + 1;
      if (colorIndex > defaultMantineColorHexList.length) colorIndex = 1;
      return {
        label: "Quantity",
        data: dataArray,
        backgroundColor:
          dataArrayIdx === 0
            ? "#339bf067"
            : `${defaultMantineColorHexList[colorIndex]}67`,
        borderColor:
          dataArrayIdx === 0
            ? "#339AF0"
            : defaultMantineColorHexList[colorIndex],
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
    const itemIndex = clickedElement.index;
    const item = data[itemIndex];
    const itemVariant = data[itemIndex].variation[clickedElement.datasetIndex];

    const colorIndex = clickedElement.datasetIndex;

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
          <Flex mih={itemVariant.specification.length * 36 + 42}>
            <Carousel
              maw={{ xs: 390, base: 300 }}
              align="center"
              px={32}
              controlsOffset={-20}
              includeGapInSize
              py="xs"
              draggable={data[itemIndex].variation.length > 1}
              withControls={data[itemIndex].variation.length > 1}
              initialSlide={clickedElement.datasetIndex}
              height="100%"
              slideSize="100%"
              slidesToScroll={1}
              sx={{ flex: 1 }}
              getEmblaApi={setEmbla}
              slideGap="xs"
            >
              {data[itemIndex].variation.map(
                (itemVariation, itemVariationIdx) => (
                  <Carousel.Slide key={itemVariationIdx}>
                    <Box
                      p="xs"
                      sx={{
                        borderRadius: "12px",
                        border: `3px solid ${
                          itemVariationIdx === 0
                            ? "#339AF03d"
                            : `${
                                defaultMantineColorHexList[
                                  colorIndex > defaultMantineColorHexList.length
                                    ? 1
                                    : itemVariationIdx + 1
                                ]
                              }3d`
                        }`,
                      }}
                    >
                      <Spoiler
                        maxHeight={250}
                        showLabel="Show more"
                        hideLabel="Hide"
                      >
                        <Text size="sm">
                          <Text size="sm" color="dimmed" span>
                            Quantity:
                          </Text>{" "}
                          {itemVariation.quantity}
                        </Text>
                        {itemVariation.specification.length > 0 &&
                          itemVariation.specification.map((spec, specIdx) => (
                            <Text size="sm" key={specIdx}>
                              <Text size="sm" color="dimmed" span>
                                {spec.fieldName}:
                              </Text>
                              {spec.response}
                            </Text>
                          ))}
                      </Spoiler>
                    </Box>
                  </Carousel.Slide>
                )
              )}
            </Carousel>
          </Flex>
        </Box>
      ),
    });
  };

  return (
    <Container
      h={data.length === 1 ? (data.length + 1) * 36 : data.length * 36}
    >
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
