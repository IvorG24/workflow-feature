import BarChart from "@/components/Chart/BarChart";
import { useUserTeamMember } from "@/stores/useUserStore";
import { RequestResponseDataType } from "@/utils/types";
import { Paper, Stack, Text } from "@mantine/core";
import { Dispatch, SetStateAction } from "react";
import { getUniqueResponseData } from "../ResponseTab/ResponseSection/ResponseDataTable";
import ResponseSection from "../ResponseTab/ResponseSection/ResponseSection";

type UserPurchaseDataProps = {
  selectedPurchaseData: string;
  selectedBarChartItem: string;
  setSelectedBarChartItem: Dispatch<SetStateAction<string>>;
  purchaseOrderData: RequestResponseDataType[];
};

const PurchaseOrder = ({
  selectedPurchaseData,
  setSelectedBarChartItem,
  selectedBarChartItem,
  purchaseOrderData,
}: UserPurchaseDataProps) => {
  const authUserMember = useUserTeamMember();
  const itemSections = purchaseOrderData.filter(
    (d) => d.sectionLabel !== "Main"
  );
  const mainItemList = itemSections.flatMap(
    (section) => section.responseData[0].field_response
  );

  const selectedItemList =
    selectedPurchaseData === "user"
      ? mainItemList.filter(
          (item) =>
            item.request_response_team_member_id ===
            authUserMember?.team_member_id
        )
      : mainItemList;

  const mainItemData = getUniqueResponseData(selectedItemList);

  return (
    <Stack>
      <Paper p="md" w="100%" maw={700} h="fit-content">
        <Text weight={600}>User Order Per Item</Text>
        <BarChart
          data={mainItemData}
          setSelectedBarChartItem={setSelectedBarChartItem}
        />
      </Paper>
      {selectedBarChartItem !== "" && (
        <ResponseSection
          responseSection={
            itemSections.filter(
              (item) => item.sectionLabel === selectedBarChartItem
            )[0]
          }
        />
      )}
    </Stack>
  );
};

export default PurchaseOrder;
