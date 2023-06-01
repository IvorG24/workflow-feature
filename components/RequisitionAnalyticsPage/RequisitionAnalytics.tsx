import { Paper } from "@mantine/core";
import BarChart from "./BarChart";

type RequisitionAnalyticsProps = {
  requisitionData: {
    request_response_id: string;
    request_response: string;
    request_response_request_id: string;
    request_response_field_id: string;
  }[];
};

type DataItem = {
  label: string;
  value: number;
};

const RequisitionAnalytics = ({
  requisitionData,
}: RequisitionAnalyticsProps) => {
  const dataArray: DataItem[] = requisitionData.reduce(
    (acc: DataItem[], item) => {
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
    },
    []
  );

  console.log(dataArray);
  return (
    <Paper p="xl">
      <BarChart data={dataArray} />
    </Paper>
  );
};

export default RequisitionAnalytics;
