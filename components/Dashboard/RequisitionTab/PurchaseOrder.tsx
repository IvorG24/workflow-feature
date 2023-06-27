import BarChart from "@/components/Chart/BarChart";
import { useUserTeamMember } from "@/stores/useUserStore";
import { getUniqueResponseData } from "@/utils/arrayFunctions/dashboard";
import { RequestResponseDataType } from "@/utils/types";
import {
  Box,
  Center,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { startCase } from "lodash";
import { Dispatch, SetStateAction, useState } from "react";
import validator from "validator";
import { DataItem } from "./PurchaseTrend";

type UserPurchaseDataProps = {
  selectedPurchaseData: string;
  selectedBarChartItem: string;
  setSelectedBarChartItem: Dispatch<SetStateAction<string>>;
  purchaseOrderData: RequestResponseDataType[];
  itemStatusCount: DataItem[];
};

const PurchaseOrder = ({
  selectedPurchaseData,
  setSelectedBarChartItem,
  selectedBarChartItem,
  purchaseOrderData,
  itemStatusCount,
}: UserPurchaseDataProps) => {
  const authUserMember = useUserTeamMember();

  const itemSections = purchaseOrderData.filter(
    (d) => d.sectionLabel !== "Main"
  );

  const mainItemList = itemSections.flatMap(
    (section) => section.responseData[0].field_response
  );

  const initialSelectedItemList =
    selectedPurchaseData === "user"
      ? mainItemList.filter(
          (item) =>
            item.request_response_team_member_id ===
            authUserMember?.team_member_id
        )
      : mainItemList;

  const [searchItemKey, setSearchItemKey] = useState("");

  const mainItemData = getUniqueResponseData(
    initialSelectedItemList.filter((item) => {
      const parseResponse = JSON.parse(item.request_response);

      return validator.contains(parseResponse, searchItemKey, {
        ignoreCase: true,
      });
    })
  );

  const selectedItemStatusCount = itemStatusCount.filter(
    (item) => item.item === selectedBarChartItem
  );

  const getStatusCount = (selectedStatus: string) => {
    const selectedItem = selectedItemStatusCount.filter(
      (item) => item.label === selectedStatus
    )[0];
    if (selectedItem) {
      return selectedItem.value;
    }

    return 0;
  };

  return (
    <Stack>
      <Paper p="md" w="100%" maw={700} h="fit-content">
        <Group mb="lg" position="apart">
          <Text weight={600}>
            {startCase(selectedPurchaseData)} Order Per Item
          </Text>
          <TextInput
            placeholder="Search item"
            value={searchItemKey}
            onChange={(e) => setSearchItemKey(e.currentTarget.value)}
          />
        </Group>
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
        <Paper p="md" maw={700}>
          <Group>
            <Text weight={600}>{selectedItemStatusCount[0].item}</Text>
            <Text>Pending: {getStatusCount("PENDING")}</Text>
            <Text>Approved: {getStatusCount("APPROVED")}</Text>
            <Text>Rejected: {getStatusCount("REJECTED")}</Text>
            <Text>Canceled: {getStatusCount("CANCELED")}</Text>
          </Group>
        </Paper>
      )}
      {/* {selectedBarChartItem !== "" && (
        <ResponseSection
          responseSection={
            itemSections.filter(
              (item) => item.sectionLabel === selectedBarChartItem
            )[0]
          }
        />
      )} */}
    </Stack>
  );
};

export default PurchaseOrder;
