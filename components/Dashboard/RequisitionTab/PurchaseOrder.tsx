import BarChart from "@/components/Chart/BarChart";
import { useUserTeamMember } from "@/stores/useUserStore";
import { getChartData } from "@/utils/arrayFunctions/dashboard";
import { RequestResponseDataType } from "@/utils/types";
import { Box, Center, Paper, Text } from "@mantine/core";
import { Dispatch, SetStateAction } from "react";

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
      <Text weight={600}>Total Order Per Item</Text>
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
