import { getIncidentReport } from "@/backend/api/get";
import { Database } from "@/utils/database";
import { TeamMemberType } from "@/utils/types";
import {
  Alert,
  Container,
  Flex,
  LoadingOverlay,
  Paper,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { IconAlertCircle } from "@tabler/icons-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import IncidentReportBarChart, { DataItem } from "./IncidentReportBarChart";
import IncidentReportListFilter, {
  IncidentReportFormValues,
} from "./IncidentReportListFilter";

type Props = {
  teamMemberList: TeamMemberType[];
};

const ReportIncidentReportPage = ({ teamMemberList }: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const [reportData, setReportData] = useState<DataItem[] | null>(null);
  const [isFetchingData, setIsFetchingData] = useState(false);

  const defaultYear = new Date().getFullYear().toString();
  const defaultMonth = `${new Date().getMonth() + 1}`;
  const filterMethods = useForm<IncidentReportFormValues>({
    mode: "onChange",

    defaultValues: {
      interval: "Monthly",
      year: defaultYear,
      month: defaultMonth,
    },
  });

  const { handleSubmit } = filterMethods;

  const reporteeOption = teamMemberList.map((member) => ({
    label: `${member.team_member_user.user_first_name} ${member.team_member_user.user_last_name}`,
    value: member.team_member_id,
  }));

  const handleFilterSubmit = async (data: IncidentReportFormValues) => {
    try {
      setIsFetchingData(true);
      const report = await getIncidentReport(supabaseClient, {
        reporteeId: data.teamMemberId,
        interval: data.interval,
        month: data.month,
        year: data.year,
      });

      let newReport: DataItem[] = [];

      if (report.interval === "Monthly") {
        const newData = report.data.map((report) => ({
          label: new Date(report.date).toLocaleString(undefined, {
            month: "long",
          }),
          value: Number(report.report_count),
        }));
        newReport = fillMissingMonths(newData);
      } else {
        const newData = report.data.map((report) => ({
          label: new Date(report.date).toLocaleString(undefined, {
            day: "numeric",
          }),
          value: Number(report.report_count),
        }));
        newReport = fillMissingDates(
          newData,
          Number(report.year),
          Number(report.month)
        );
      }
      setReportData(newReport);
    } catch {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsFetchingData(false);
    }
  };

  const fillMissingMonths = (data: DataItem[]): DataItem[] => {
    const months: Record<number, DataItem> = {};
    for (let i = 1; i <= 12; i++) {
      const monthName = new Date(2024, i - 1).toLocaleString(undefined, {
        month: "long",
      });
      months[i] = { label: monthName, value: 0 };
    }

    data.forEach((month) => {
      months[month.value] = month;
    });

    return Object.values(months);
  };

  const fillMissingDates = (
    data: DataItem[],
    year: number,
    month: number
  ): DataItem[] => {
    const daysInMonth: number = new Date(year, month, 0).getDate();
    const filledData: DataItem[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const existingEntry: DataItem | undefined = data.find(
        (entry) => entry.label === day.toString()
      );

      if (existingEntry) {
        filledData.push(existingEntry);
      } else {
        filledData.push({ label: day.toString(), value: 0 }); // You can set any default value you want
      }
    }
    return filledData;
  };

  return (
    <Container p={0}>
      <FormProvider {...filterMethods}>
        <Flex justify="space-between">
          <Title order={2}>Incident Report for Employees Metrics</Title>
        </Flex>
        <form onSubmit={handleSubmit(handleFilterSubmit)}>
          <IncidentReportListFilter reporteeOption={reporteeOption} />
        </form>

        <Paper p="xs" mt="md" pos="relative">
          <LoadingOverlay visible={isFetchingData} overlayBlur={2} />
          {reportData !== null ? (
            reportData.length > 0 ? (
              <IncidentReportBarChart data={reportData} />
            ) : (
              <Alert icon={<IconAlertCircle size="1rem" />} mt="xl">
                No results found for your search query.
              </Alert>
            )
          ) : (
            <Alert icon={<IconAlertCircle size="1rem" />}>
              Please search a reportee
            </Alert>
          )}
        </Paper>
      </FormProvider>
    </Container>
  );
};

export default ReportIncidentReportPage;
