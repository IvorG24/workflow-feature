import {
  PurchaseTrendChartDataType,
  RequestResponseDataType,
} from "@/utils/types";
import { Container, SegmentedControl, Text } from "@mantine/core";
import { useState } from "react";
import PurchaseOrder from "./PurchaseOrder";
import PurchaseTrend from "./PurchaseTrend";

type Props = {
  fieldResponseData: RequestResponseDataType[];
};

const getItemPurchaseTrendData = (data: RequestResponseDataType[]) => {
  const itemPurchaseTrendData: PurchaseTrendChartDataType[] = [];
  const fieldList = data.flatMap((d) => d.responseData);
  const generalNameFieldList = fieldList.filter(
    (f) => f.field_name === "General Name"
  );
  generalNameFieldList.forEach((field) => {
    if (field.field_response.length > 0) {
      itemPurchaseTrendData.push(...field.field_response);
    }
  });

  return itemPurchaseTrendData;
};

const OrderToPurchaseAnalytics = ({ fieldResponseData }: Props) => {
  const [selectedPurchaseData, setSelectedPurchaseData] = useState("user");
  const [selectedBarChartItem, setSelectedBarChartItem] = useState("");
  const itemPurchaseTrendData = getItemPurchaseTrendData(fieldResponseData);

  return (
    <Container h="100%" fluid>
      <SegmentedControl
        mb="md"
        value={selectedPurchaseData}
        onChange={setSelectedPurchaseData}
        data={[
          { value: "user", label: "Your Purchase Order" },
          { value: "team", label: "Team Purchase Order" },
          { value: "purchase", label: "Purchase Trend" },
        ]}
      />

      {selectedPurchaseData !== "purchase" &&
        fieldResponseData &&
        fieldResponseData.length > 0 && (
          <PurchaseOrder
            selectedPurchaseData={selectedPurchaseData}
            selectedBarChartItem={selectedBarChartItem}
            setSelectedBarChartItem={setSelectedBarChartItem}
            purchaseOrderData={fieldResponseData}
          />
        )}

      {!fieldResponseData && <Text>No data available.</Text>}

      {selectedPurchaseData === "purchase" && itemPurchaseTrendData && (
        <PurchaseTrend itemPurchaseTrendData={itemPurchaseTrendData} />
      )}
    </Container>
  );
};

export default OrderToPurchaseAnalytics;
