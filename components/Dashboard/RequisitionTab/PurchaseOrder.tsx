import BarChart from "@/components/Chart/BarChart";
import { useUserTeamMember } from "@/stores/useUserStore";
import {
  getItemStatusCount,
  getUniqueResponseData,
} from "@/utils/arrayFunctions/dashboard";
import { RequestResponseDataType } from "@/utils/types";
import {
  Box,
  Center,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { lowerCase, startCase } from "lodash";
import { Dispatch, SetStateAction, useState } from "react";
import validator from "validator";

type Props = {
  selectedPurchaseData: string;
  selectedBarChartItem: string;
  setSelectedBarChartItem: Dispatch<SetStateAction<string>>;
  purchaseOrderData: RequestResponseDataType[];
};

const STATUS_LIST = ["PENDING", "APPROVED", "REJECTED", "CANCELED"];

const PurchaseOrder = ({
  selectedPurchaseData,
  setSelectedBarChartItem,
  selectedBarChartItem,
  purchaseOrderData,
}: Props) => {
  const authUserMember = useUserTeamMember();
  const [searchItemKey, setSearchItemKey] = useState("");

  //get all General Name field responses
  const itemGeneralNameList = purchaseOrderData.flatMap(
    (section) =>
      section.responseData.filter(
        (data) => data.field_name === "General Name"
      )[0].field_response
  );

  // filter General Name responses -> user or team responses
  const selectedTabItemGeneralNameList =
    selectedPurchaseData === "user"
      ? itemGeneralNameList.filter(
          (item) =>
            item.request_response_team_member_id ===
            authUserMember?.team_member_id
        )
      : itemGeneralNameList;

  const generalNameChartData = getUniqueResponseData(
    selectedTabItemGeneralNameList.filter((item) => {
      const parseResponse = JSON.parse(item.request_response);

      return validator.contains(parseResponse, searchItemKey, {
        ignoreCase: true,
      });
    })
  );

  const selectedItemSection = purchaseOrderData.filter(
    (section) => section.sectionLabel === selectedBarChartItem
  );

  // get number of order by status
  const itemStatusCount = getItemStatusCount(selectedTabItemGeneralNameList);
  const selectedItemStatusCount = itemStatusCount.filter(
    (item) => item.item === selectedBarChartItem
  );

  const getOrderCountByStatus = (selectedStatus: string) => {
    const selectedItem = selectedItemStatusCount.filter(
      (item) => item.label === selectedStatus
    )[0];
    if (selectedItem) {
      return selectedItem.value;
    }

    return 0;
  };

  //get all Quantity field responses from selected item

  const itemQuantityList = selectedItemSection.flatMap(
    (section) =>
      section.responseData.filter((res) => res.field_name === "Quantity")[0]
        .field_response
  );

  // filter Quantity responses -> user or team responses
  const selectedItemQuantityList =
    selectedPurchaseData === "user"
      ? itemQuantityList.filter(
          (item) =>
            item.request_response_team_member_id ===
            authUserMember?.team_member_id
        )
      : itemQuantityList;

  const getTotalQuantityCount = () => {
    const total = selectedItemQuantityList.reduce((total, item) => {
      const itemQuantity = JSON.parse(item.request_response);
      return total + itemQuantity;
    }, 0);

    return total;
  };
  const getQuantityCountByStatus = (selectedStatus: string) => {
    const itemQuantity = selectedItemQuantityList.filter(
      (item) => item.request_response_request_status === selectedStatus
    );
    const total = itemQuantity.reduce((total, item) => {
      const itemQuantity = JSON.parse(item.request_response);

      return total + itemQuantity;
    }, 0);

    return total;
  };

  return (
    <Stack>
      <Paper p="md" w="100%" maw={700} h="fit-content">
        <Group mb="lg" position="apart">
          <Text weight={600}>Total Order Per Item</Text>
          <TextInput
            placeholder="Search item"
            value={searchItemKey}
            onChange={(e) => setSearchItemKey(e.currentTarget.value)}
          />
        </Group>
        <Box mih={334}>
          {generalNameChartData.length > 0 ? (
            <BarChart
              data={generalNameChartData}
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
          <Text weight={600}>{selectedItemStatusCount[0].item}</Text>
          <Divider my="md" />
          <Text weight={600}>
            Total Purchase Order:{" "}
            {generalNameChartData
              .find((name) => name.label === selectedBarChartItem)
              ?.value.toLocaleString()}
          </Text>
          <Stack mt="sm">
            {STATUS_LIST.map((status, idx) => (
              <Text key={status + idx} weight={600}>{`${startCase(
                lowerCase(status)
              )}: ${getOrderCountByStatus(status).toLocaleString()}`}</Text>
            ))}
          </Stack>
          <Divider my="md" />
          <Text weight={600}>
            Total Item Quantity: {getTotalQuantityCount().toLocaleString()}
          </Text>
          <Stack mt="sm">
            {STATUS_LIST.map((status, idx) => (
              <Text key={status + idx} weight={600}>{`${startCase(
                lowerCase(status)
              )}: ${getQuantityCountByStatus(status).toLocaleString()}`}</Text>
            ))}
          </Stack>
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
