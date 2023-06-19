import BarChart from "@/components/Chart/BarChart";
import { FormslyFormResponseDataType, ResponseDataType } from "@/utils/types";
import { Paper, Stack, Text } from "@mantine/core";
import { Dispatch, SetStateAction } from "react";
import RequisitionTable from "../ResponseTab/RequisitionTable";

type UserPurchaseDataProps = {
  selectedBarChartItem: string;
  setSelectedBarChartItem: Dispatch<SetStateAction<string>>;
  purchaseOrderData: FormslyFormResponseDataType[];
};

const PurchaseOrder = ({
  setSelectedBarChartItem,
  selectedBarChartItem,
  purchaseOrderData,
}: UserPurchaseDataProps) => {
  const mainItemData: ResponseDataType["responseList"] = [];

  purchaseOrderData.forEach((fieldResponse) =>
    fieldResponse.responseData.forEach((responseItem) => {
      if (responseItem.label === "General Name") {
        mainItemData.push(responseItem.responseList[0]);
      }
    })
  );

  const response = purchaseOrderData.map((fieldResponse) => ({
    ...fieldResponse,
    responseData: fieldResponse.responseData.filter(
      (responseItem) => responseItem.label !== "General Name"
    ),
  }));

  return (
    <Stack>
      <Paper p="md" w="100%" maw={700} h="fit-content">
        <Text weight={600}>User Order Per Item</Text>
        <BarChart
          data={mainItemData}
          setSelectedBarChartItem={setSelectedBarChartItem}
        />
      </Paper>
      {selectedBarChartItem !== "" &&
        purchaseOrderData &&
        purchaseOrderData.length > 0 && (
          <RequisitionTable
            response={
              response.filter((r) => r.label === selectedBarChartItem)[0]
            }
          />
        )}
    </Stack>
  );
};

export default PurchaseOrder;
