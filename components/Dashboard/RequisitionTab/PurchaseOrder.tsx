import BarChart from "@/components/Chart/BarChart";
import { useUserTeamMember } from "@/stores/useUserStore";
import { getUniqueResponseData } from "@/utils/arrayFunctions/dashboard";
import { RequestResponseDataType } from "@/utils/types";
import { Box, Center, Paper, Stack, Text } from "@mantine/core";
import { startCase } from "lodash";
import { Dispatch, SetStateAction } from "react";
import ResponseSection from "../ResponseTab/ResponseSection/FormslyFormResponseSection";

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
        <Text weight={600}>
          {startCase(selectedPurchaseData)} Order Per Item
        </Text>
        <Box mih={334}>
          {mainItemData.length > 0 ? (
            <BarChart
              data={mainItemData}
              setSelectedBarChartItem={setSelectedBarChartItem}
            />
          ) : (
            <Center h={334}>
              <Text size={24} color="dimmed" weight={600}>
                No data available.
              </Text>
            </Center>
          )}
        </Box>
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
