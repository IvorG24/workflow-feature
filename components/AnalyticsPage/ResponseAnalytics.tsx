import { getHrAnalyticsData } from "@/backend/api/get";
import { generateMonthLabels } from "@/utils/functions";
import { getStatusToColorForCharts } from "@/utils/styling";
import { DatasetChartResponse } from "@/utils/types";
import { Container, Stack, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import ResponseTable from "./ResponseTable";
import ResponseTableFilter from "./ResponseTableFilter"; // Your filter form component

export type FilterChartValues = {
  memberFilter: string;
  stepFilter: string;
  startDate: Date | null;
  endDate: Date | null;
};
const stepOptions = [
  { label: "Application Information", value: "request" },
  { label: "HR Phone Interview", value: "hr_phone_interview" },
  { label: "Technical Interview 1", value: "technical_interview_1" },
  { label: "Technical Interview 2", value: "technical_interview_2" },
  { label: "Trade Test", value: "trade_test" },
  { label: "Background Check", value: "background_check" },
  { label: "Job Offer", value: "job_offer" },
];
const colors = {
  pending: "#ff922b",
  approved: "#51cf66",
  rejected: "#fa5252",
};
const memberOptions = [{ label: "All", value: "All" }];
const ResponseAnalytics = () => {
  const supabaseClient = useSupabaseClient();
  const methods = useForm<FilterChartValues>({
    defaultValues: {
      memberFilter: memberOptions[0].value,
      stepFilter: stepOptions[0].value,
      startDate: null,
      endDate: null,
    },
  });
  const stepValue = methods.watch("stepFilter");
  const [dataChart, setDataChart] = useState<DatasetChartResponse[]>([]);
  const [monthLabels, setMonthLabels] = useState<string[]>([]);
  const handleFetchResponseTable = async (data: FilterChartValues) => {
    try {
      const rawData = await getHrAnalyticsData(supabaseClient, {
        filterChartValues: data,
      });

      const startDate = data.startDate || new Date();
      const endDate = data.endDate || new Date();
      const monthLabels = generateMonthLabels(startDate, endDate);
      setMonthLabels(monthLabels);
      const datasetChartResponse: DatasetChartResponse[] = [
        {
          label: "Pending",
          data: rawData.pending_counts.map((item) => parseInt(item, 10) || 0), // Ensure no NaN values
          backgroundColor: [
            getStatusToColorForCharts("pending") || colors.pending,
          ], // Fallback to default color
          borderColor: [getStatusToColorForCharts("pending") || colors.pending], // Fallback to default color
          borderWidth: 2,
        },
        {
          label: "Approved",
          data: rawData.approved_counts.map((item) => parseInt(item, 10)),
          backgroundColor: rawData.approved_counts.map(() => colors.approved),
          borderColor: rawData.approved_counts.map(() => colors.approved),
          borderWidth: 2,
        },
        {
          label: "Rejected",
          data: rawData.rejected_counts.map((item) => parseInt(item, 10)),
          backgroundColor: rawData.rejected_counts.map(() => colors.rejected),
          borderColor: rawData.rejected_counts.map(() => colors.rejected),
          borderWidth: 2,
        },
        {
          label: "Qualified",
          data: rawData.qualified_counts.map((item) => parseInt(item, 10)),
          backgroundColor: rawData.rejected_counts.map(() => colors.rejected),
          borderColor: rawData.rejected_counts.map(() => colors.rejected),
          borderWidth: 2,
        },
        {
          label: "Not Qualified",
          data: rawData.not_qualified_counts.map((item) => parseInt(item, 10)),
          backgroundColor: rawData.rejected_counts.map(() => colors.rejected),
          borderColor: rawData.rejected_counts.map(() => colors.rejected),
          borderWidth: 2,
        },
        {
          label: "Cancelled",
          data: rawData.cancelled_counts.map((item) => parseInt(item, 10)),
          backgroundColor: rawData.rejected_counts.map(() => colors.rejected),
          borderColor: rawData.rejected_counts.map(() => colors.rejected),
          borderWidth: 2,
        },
        {
          label: "Not Responsive",
          data: rawData.not_responsive_counts.map((item) => parseInt(item, 10)),
          backgroundColor: rawData.rejected_counts.map(() => colors.rejected),
          borderColor: rawData.rejected_counts.map(() => colors.rejected),
          borderWidth: 2,
        },
      ];
      setDataChart(datasetChartResponse);
    } catch (e) {
      notifications.show({
        message: "Something went wrong",
        color: "red",
      });
    }
  };
  console.log(dataChart);

  useEffect(() => {
    handleFetchResponseTable(methods.getValues());
  }, [methods, dataChart]);
  return (
    <Container fluid>
      <Stack spacing="sm">
        <Title order={2}>HR Response</Title>
        <FormProvider {...methods}>
          <form>
            <ResponseTableFilter
              handleFetchResponseTable={handleFetchResponseTable}
              memberOptions={memberOptions}
              stepOptions={stepOptions}
            />
          </form>
        </FormProvider>
        <ResponseTable
          monthLabel={monthLabels}
          dataChartResponse={dataChart}
          stepFilter={stepValue}
        />
      </Stack>
    </Container>
  );
};

export default ResponseAnalytics;
