import LineChart from "@/components/Chart/LineChart";
import { PurchaseTrendChartDataType } from "@/utils/types";
import {
  Box,
  Center,
  Group,
  Paper,
  Select,
  SelectItem,
  Text,
} from "@mantine/core";
import moment from "moment";
import { useEffect, useState } from "react";

type PurchaseTrendProps = {
  itemPurchaseTrendData: PurchaseTrendChartDataType[];
};

export type DataItem = {
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
    const itemName = item.request_response_item_general_name;
    const itemQuantity = Number(item.request_response);

    const existingItemIndex = acc.findIndex(
      (el) => el.item === itemName && el.label === monthLabel
    );

    if (existingItemIndex >= 0) {
      const newQuantity = acc[existingItemIndex].value + itemQuantity;
      acc[existingItemIndex].value = newQuantity;
    } else {
      acc.push({
        label: monthLabel,
        value: itemQuantity,
        item: itemName,
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
    <Paper p="md" w="100%" h="fit-content">
      <Group mb="sm">
        <Text weight={600}>Purchase Trend of</Text>
        <Select
          size="xs"
          w={500}
          value={selectedItem}
          onChange={(value: string) => setSelectedItem(value)}
          data={itemList as SelectItem[]}
          searchable
        />
      </Group>
      <Box mih={334}>
        {chartData && chartData.length > 0 ? (
          <LineChart data={chartData} legendLabel={selectedItem} />
        ) : (
          <Center h={334}>
            <Text size={24} color="dimmed" weight={600}>
              No data available.
            </Text>
          </Center>
        )}
      </Box>
    </Paper>
  );
};

export default PurchaseTrend;
