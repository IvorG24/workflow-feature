import BarChart from "@/components/Chart/BarChart";
import { useUserTeamMember } from "@/stores/useUserStore";
import { getUniqueResponseData } from "@/utils/arrayFunctions/dashboard";
import { RequestResponseDataType } from "@/utils/types";
import {
  ActionIcon,
  Box,
  Center,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { Dispatch, SetStateAction, useState } from "react";
import validator from "validator";

type Props = {
  selectedPurchaseData: string;
  selectedBarChartItem: string;
  setSelectedBarChartItem: Dispatch<SetStateAction<string>>;
  purchaseOrderData: RequestResponseDataType[];
};

// const STATUS_LIST = ["PENDING", "APPROVED", "REJECTED", "CANCELED"];

const PurchaseOrder = ({
  selectedPurchaseData,
  setSelectedBarChartItem,
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

  return (
    <Stack>
      <Paper p="md" w="100%" h="fit-content">
        <Group mb="lg" position="apart">
          <Text weight={600}>Total Order Per Item</Text>
          <TextInput
            placeholder="Search item"
            value={searchItemKey}
            onChange={(e) => setSearchItemKey(e.currentTarget.value)}
            rightSection={
              <ActionIcon size="xs" type="submit">
                <IconSearch />
              </ActionIcon>
            }
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
