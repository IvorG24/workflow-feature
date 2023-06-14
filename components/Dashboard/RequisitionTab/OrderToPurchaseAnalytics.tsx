import BarChart from "@/components/Chart/BarChart";
import LineChart from "@/components/Chart/LineChart";
import { OTPDataType } from "@/pages/team-requests/forms/[formId]/analytics";
import {
  Container,
  Group,
  Paper,
  SegmentedControl,
  Select,
  SelectItem,
  Text,
} from "@mantine/core";
import moment from "moment";
import { useState } from "react";

type DataItem = {
  label: string;
  value: number;
  item?: string;
};

const getReducedDataArray = (data: OTPDataType) => {
  const reducedArray: DataItem[] = data.reduce((acc: DataItem[], item) => {
    const existingItem = acc.find(
      (data) => data.label === item.request_response
    );
    if (existingItem) {
      existingItem.value += 1;
    } else {
      acc.push({
        label: item.request_response,
        value: 1,
      });
    }
    return acc;
  }, []);

  return reducedArray;
};

const getReducedPurchaseDataArray = (data: OTPDataType) => {
  const reducedArray: DataItem[] = data.reduce((acc: DataItem[], item) => {
    const monthLabel = moment(item.request_response_date_purchased).format(
      "MMM"
    );
    const existingItem = acc.find(
      (el) => el.item === item.request_response && el.label === monthLabel
    );
    if (existingItem) {
      existingItem.value++;
    } else {
      acc.push({ label: monthLabel, value: 1, item: item.request_response });
    }

    return acc;
  }, []);

  return reducedArray;
};

type Props = {
  teamOrderToPurchaseData: OTPDataType;
  userOrderToPurchaseData?: OTPDataType;
  purchaseOrderToPurchaseData?: OTPDataType;
};

const OrderToPurchaseAnalytics = ({
  teamOrderToPurchaseData,
  userOrderToPurchaseData,
  purchaseOrderToPurchaseData,
}: Props) => {
  const teamDataArray: DataItem[] = getReducedDataArray(
    teamOrderToPurchaseData
  );
  const userDataArray: DataItem[] | null = userOrderToPurchaseData
    ? getReducedDataArray(userOrderToPurchaseData)
    : null;

  const purchaseDataArray: DataItem[] | null = purchaseOrderToPurchaseData
    ? getReducedPurchaseDataArray(purchaseOrderToPurchaseData)
    : null;

  const itemList = purchaseDataArray?.reduce((acc, data) => {
    const items = acc.map((d) => d.value);

    if (data.item && !items.includes(data.item)) {
      acc.push({ value: data.item, label: data.item });
    }

    return acc;
  }, [] as SelectItem[]);

  const [selectedData, setSelectedData] = useState("user");
  const [selectedItem, setSelectedItem] = useState(itemList?.[0].value || "");

  return (
    <Container h="100%" fluid>
      <SegmentedControl
        mb="md"
        value={selectedData}
        onChange={setSelectedData}
        data={[
          { value: "user", label: "Your Purchase Order" },
          { value: "team", label: "Team Purchase Order" },
          { value: "purchase", label: "Purchase Trend" },
        ]}
      />

      {selectedData === "user" && (
        <Paper p="md" w="100%" maw={700} h="fit-content">
          <Text weight={600}>User Order Per Item</Text>
          {userDataArray && userDataArray.length > 0 ? (
            <BarChart data={userDataArray} />
          ) : (
            <Text>No data available.</Text>
          )}
        </Paper>
      )}

      {selectedData === "team" && (
        <Paper p="md" w="100%" maw={700} h="fit-content">
          <Text weight={600}>Team Order Per Item</Text>
          {teamDataArray.length > 0 ? (
            <BarChart data={teamDataArray} />
          ) : (
            <Text>No data available.</Text>
          )}
        </Paper>
      )}

      {selectedData === "purchase" && (
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
          {purchaseDataArray && purchaseDataArray.length > 0 ? (
            <LineChart
              data={purchaseDataArray.filter((d) => d.item === selectedItem)}
              legendLabel={selectedItem}
            />
          ) : (
            <Text>No data available.</Text>
          )}
        </Paper>
      )}
    </Container>
  );
};

export default OrderToPurchaseAnalytics;
