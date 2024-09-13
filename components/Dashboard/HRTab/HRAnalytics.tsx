import { getCandidateReferralSource } from "@/backend/api/get";
import { Container } from "@mantine/core";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
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

  return <Container p={0}></Container>;
};

export default HRAnalytics;
