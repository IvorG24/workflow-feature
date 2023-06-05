import { RFDataType } from "@/pages/team-requests/forms/[formId]/analytics";
import { Box, Container, Tabs, Text } from "@mantine/core";
import { IconTrendingUp, IconUser, IconUsers } from "@tabler/icons-react";
import moment from "moment";
import BarChart from "./BarChart";
import LineChart from "./LineChart";

type RequisitionAnalyticsProps = {
  teamRequisitionData: RFDataType;
  userRequisitionData?: RFDataType;
  purchaseRequisitionData?: RFDataType;
};

type DataItem = {
  label: string;
  value: number;
};

const getReducedDataArray = (data: RFDataType) => {
  const reducedArray: DataItem[] = data.reduce((acc: DataItem[], item) => {
    const existingItem = acc.find(
      (data) => data.label === item.request_response
    );
    if (existingItem) {
      existingItem.value += 1;
    } else {
      acc.push({
        label: item.request_response,
        value: 1,
      });
    }
    return acc;
  }, []);

  return reducedArray;
};

const getReducedPurchaseDataArray = (data: RFDataType) => {
  const reducedArray: DataItem[] = data.reduce((acc: DataItem[], item) => {
    const monthLabel = moment(item.request_response_date_purchased).format(
      "MMM"
    );
    const existingItem = acc.find((el) => el.label === monthLabel);
    if (existingItem) {
      existingItem.value++;
    } else {
      acc.push({ label: monthLabel, value: 1 });
    }

    return acc;
  }, []);

  return reducedArray;
};

const RequisitionAnalytics = ({
  teamRequisitionData,
  userRequisitionData,
  purchaseRequisitionData,
}: RequisitionAnalyticsProps) => {
  const teamDataArray: DataItem[] = getReducedDataArray(teamRequisitionData);
  const userDataArray: DataItem[] | null = userRequisitionData
    ? getReducedDataArray(userRequisitionData)
    : null;

  const purchaseDataArray: DataItem[] | null = purchaseRequisitionData
    ? getReducedPurchaseDataArray(purchaseRequisitionData)
    : null;

  return (
    <Container p="xl" h="100%" fluid>
      <Tabs defaultValue="user order">
        <Tabs.List>
          <Tabs.Tab value="user order" icon={<IconUser size="0.8rem" />}>
            User Order
          </Tabs.Tab>
          <Tabs.Tab value="team order" icon={<IconUsers size="0.8rem" />}>
            Team Order
          </Tabs.Tab>
          <Tabs.Tab
            value="purchase trend"
            icon={<IconTrendingUp size="0.8rem" />}
          >
            Purchase Trend
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="user order" pt="xs">
          {userDataArray && (
            <Box h="fit-content">
              <Text>User Order Per Item</Text>
              <BarChart data={userDataArray} />
            </Box>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="team order" pt="xs">
          <Box h="fit-content" mb="md">
            <Text>Team Order Per Item</Text>
            <BarChart data={teamDataArray} />
          </Box>
        </Tabs.Panel>

        <Tabs.Panel value="purchase trend" pt="xs">
          {purchaseDataArray && (
            <Box h="fit-content">
              <Text>
                Purchase Trend of{" "}
                <Text span weight={600}>
                  {purchaseRequisitionData?.[0].request_response}
                </Text>
              </Text>
              <LineChart data={purchaseDataArray} />
            </Box>
          )}
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
};

export default RequisitionAnalytics;
