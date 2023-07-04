import BarChart from "@/components/Chart/BarChart";
import { useUserTeamMember } from "@/stores/useUserStore";
import { getChartData } from "@/utils/arrayFunctions/dashboard";
import { RequestResponseDataType } from "@/utils/types";
import {
  ActionIcon,
  Box,
  Center,
  Group,
  Paper,
  Text,
  TextInput,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { Dispatch, SetStateAction, useState } from "react";

type Props = {
  selectedPurchaseData: string;
  selectedBarChartItem: string;
  setSelectedBarChartItem: Dispatch<SetStateAction<string>>;
  purchaseOrderData: RequestResponseDataType[];
};

const PurchaseOrder = ({
  selectedPurchaseData,
  setSelectedBarChartItem,
  purchaseOrderData,
}: Props) => {
  const authUserMember = useUserTeamMember();
  const [searchItemKey, setSearchItemKey] = useState("");

  const chartData = getChartData(purchaseOrderData, {
    selectedPurchaseData,
    teamMemberId: authUserMember?.team_member_id,
  });

  const isChartDataEmpty =
    chartData.reduce((total, item) => {
      return item.value + total;
    }, 0) === 0;

  return (
    <Paper maw={1024} p="md" h="fit-content">
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
      <Box maw={1024} mih={334}>
        {!isChartDataEmpty ? (
          <BarChart
            data={chartData}
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
  );
};

export default PurchaseOrder;
