import { getCandidateReferralSource } from "@/backend/api/get";
import { Container } from "@mantine/core";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";

const HRAnalytics = () => {
  const supabaseClient = useSupabaseClient();
  const [candidateReferralSourceData, setCandidateReferralSourceData] =
    useState([]);

  useEffect(() => {
    const fetchHRAnalyticsData = async () => {
      const data = await getCandidateReferralSource(supabaseClient);
      console.log(data);
    };
    fetchHRAnalyticsData();
  }, []);

  return <Container p={0}></Container>;
};

export default HRAnalytics;
