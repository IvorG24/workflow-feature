import {
  PurchaseTrendChartDataType,
  RequestResponseDataType,
} from "@/utils/types";
import { Container, SegmentedControl, Text } from "@mantine/core";
import { useState } from "react";
import PurchaseOrder from "./PurchaseOrder";
import PurchaseTrend, { DataItem } from "./PurchaseTrend";

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

const getItemStatusCount = (data: PurchaseTrendChartDataType[]) => {
  const itemStatusCount = data.reduce((acc, item) => {
    const parseResponse = JSON.parse(item.request_response);
    const requestStatus: string = item.request_response_request_status
      ? item.request_response_request_status
      : "";
    const itemMatch = acc.findIndex(
      (accItem) =>
        accItem.item === parseResponse && accItem.label === requestStatus
    );

    if (itemMatch >= 0 && requestStatus) {
      acc[itemMatch].value++;
    } else {
      const newItem = {
        label: requestStatus,
        value: 1,
        item: parseResponse,
      };
      acc.push(newItem);
    }

    return acc;
  }, [] as DataItem[]);

  return itemStatusCount;
};

const RequisitionTab = ({ fieldResponseData }: Props) => {
  const [selectedPurchaseData, setSelectedPurchaseData] = useState("user");
  const [selectedBarChartItem, setSelectedBarChartItem] = useState("");

  const approvedFieldResponseData = fieldResponseData.map((data) => {
    const responseData = data.responseData.map((field) => {
      const approvedResponseList = field.field_response.filter(
        (res) => res.request_response_request_status === "APPROVED"
      );

      return {
        ...field,
        field_response: approvedResponseList,
      };
    });

    return {
      ...data,
      responseData,
    };
  });

  const itemPurchaseTrendData = getItemPurchaseTrendData(
    approvedFieldResponseData
  );

  const initialItemStatusCount = getItemPurchaseTrendData(fieldResponseData);
  const itemStatusCount = getItemStatusCount(initialItemStatusCount);

  return (
    <Container p={0} h="100%" fluid>
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
                itemStatusCount={itemStatusCount}
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
