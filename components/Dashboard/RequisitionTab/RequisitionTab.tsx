import { getItemPurchaseTrendData } from "@/utils/arrayFunctions/dashboard";
import { RequestResponseDataType } from "@/utils/types";
import { Container, SegmentedControl, Text } from "@mantine/core";
import { useState } from "react";
import PurchaseOrder from "./PurchaseOrder";
import PurchaseTrend from "./PurchaseTrend";

type Props = {
  fieldResponseData: RequestResponseDataType[];
};

const RequisitionTab = ({ fieldResponseData }: Props) => {
  const [selectedPurchaseData, setSelectedPurchaseData] = useState("user");
  const [selectedBarChartItem, setSelectedBarChartItem] = useState("");

  const itemPurchaseTrendData = getItemPurchaseTrendData(fieldResponseData);

  return (
    <Container maw={1024} p={0} h="100%" fluid>
      {fieldResponseData.length > 0 ? (
        <>
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

          {selectedPurchaseData === "purchase" && itemPurchaseTrendData && (
            <PurchaseTrend itemPurchaseTrendData={itemPurchaseTrendData} />
          )}
        </>
      ) : (
        <Text>No data available.</Text>
      )}
    </Container>
  );
};

export default RequisitionTab;
