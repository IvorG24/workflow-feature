import { getCandidateReferralSource } from "@/backend/api/get";
import PieChart from "@/components/Chart/PieChart";
import { parseDataForChart, safeParse } from "@/utils/functions";
import { Container, Paper } from "@mantine/core";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { ChartData } from "chart.js";
import { useEffect, useState } from "react";

type CandidateReferralSourceType = {
  request_response: string;
  count: number;
};

const HRAnalytics = () => {
  const supabaseClient = useSupabaseClient();
  const [candidateReferralSourceData, setCandidateReferralSourceData] =
    useState<CandidateReferralSourceType[]>([]);

  useEffect(() => {
    const fetchHRAnalyticsData = async () => {
      const data = await getCandidateReferralSource(supabaseClient);
      if (!data) return;
      setCandidateReferralSourceData(data as CandidateReferralSourceType[]);
    };
    fetchHRAnalyticsData();
  }, []);

  return (
    <Container p={0}>
      {candidateReferralSourceData ? (
        <Paper w={{ base: 300, lg: 600 }} p="md" withBorder>
          <PieChart
            data={
              parseDataForChart({
                data: candidateReferralSourceData.map((d) => ({
                  ...d,
                  request_response: safeParse(d.request_response),
                })),
                labelPropKey: "request_response",
                valuePropKey: "count",
              }) as ChartData<"pie">
            }
          />
        </Paper>
      ) : null}
    </Container>
  );
};

export default HRAnalytics;
