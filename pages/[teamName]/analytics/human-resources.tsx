import { getHRApplicantAnalytics } from "@/backend/api/get";
import HRAnalytics from "@/components/AnalyticsPage/HRAnalytics";
import Meta from "@/components/Meta/Meta";
import { withActiveTeam } from "@/utils/server-side-protections";
import { HRAnalyticsData } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withActiveTeam(
  async ({ supabaseClient }) => {
    try {
      const data = await getHRApplicantAnalytics(supabaseClient, {});
      return {
        props: { data: data as HRAnalyticsData },
      };
    } catch (e) {
      console.log(e);
      return {
        redirect: {
          destination: "/500",
          permanent: false,
        },
      };
    }
  }
);

type Props = {
  data: HRAnalyticsData;
};

const Page = ({ data }: Props) => {
  return (
    <>
      <Meta description="Analytics Page" url="/{teamName}/analytics" />
      <HRAnalytics data={data} />
    </>
  );
};

export default Page;
Page.Layout = "APP";
