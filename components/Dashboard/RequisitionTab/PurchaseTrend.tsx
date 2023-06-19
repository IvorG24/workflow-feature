import LineChart from "@/components/Chart/LineChart";
import { PurchaseTrendChartDataType } from "@/utils/types";
import { Group, Paper, Select, SelectItem, Text } from "@mantine/core";
import moment from "moment";
import { useEffect, useState } from "react";

type PurchaseTrendProps = {
  itemPurchaseTrendData: PurchaseTrendChartDataType[];
};

type DataItem = {
  label: string;
  value: number;
  item?: string;
};

const generateInitialChartData = () => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const initialChartData = months.map((label) => ({
    label,
    value: 0,
  }));

  return initialChartData;
};

const getReducedPurchaseDataArray = (data: PurchaseTrendChartDataType[]) => {
  const reducedArray: DataItem[] = data.reduce((acc: DataItem[], item) => {
    const monthLabel = moment(item.request_response_date_purchased).format(
      "MMM"
    );
    const parseResponse = JSON.parse(item.request_response);

    const existingItem = acc.find(
      (el) => el.item === parseResponse && el.label === monthLabel
    );
    if (existingItem) {
      existingItem.value++;
    } else {
      acc.push({
        label: monthLabel,
        value: 1,
        item: parseResponse,
      });
    }

    return acc;
  }, []);

  return reducedArray;
};

const PurchaseTrend = ({ itemPurchaseTrendData }: PurchaseTrendProps) => {
  const initialChartData = generateInitialChartData();
  const purchaseDataArray: DataItem[] | null = itemPurchaseTrendData
    ? getReducedPurchaseDataArray(itemPurchaseTrendData)
    : null;

  const itemList = purchaseDataArray?.reduce((acc, data) => {
    const items = acc.map((d) => d.value);

    if (data.item && !items.includes(data.item)) {
      acc.push({ value: data.item, label: data.item });
    }

    return acc;
  }, [] as SelectItem[]);

  const [selectedItem, setSelectedItem] = useState(itemList?.[0].value || "");
  const [chartData, setChartData] = useState<DataItem[] | null>(null);

  useEffect(() => {
    const selectedItemData = purchaseDataArray?.filter(
      (data) => data.item === selectedItem
    );

    if (selectedItemData) {
      const updatedChartData = initialChartData.map((chartData) => {
        selectedItemData.forEach((itemData) => {
          if (itemData.label === chartData.label) {
            chartData.value = itemData.value;
          }
        });

        return chartData;
      });
      setChartData(updatedChartData);
    }
  }, [selectedItem]);

  return (
    <Paper p="md" w="100%" maw={700} h="fit-content">
      <Group mb="sm">
        <Text weight={600}>Purchase Trend of</Text>
        <Select
          size="xs"
          value={selectedItem}
          onChange={(value: string) => setSelectedItem(value)}
          data={itemList as SelectItem[]}
        />
      </Group>
      {chartData && chartData.length > 0 ? (
        <LineChart data={chartData} legendLabel={selectedItem} />
      ) : (
        <Text>No data available.</Text>
      )}
    </Paper>
  );
};

export default PurchaseTrend;
