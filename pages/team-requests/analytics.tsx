import Meta from "@/components/Meta/Meta";
import RequestAnalyticsPage from "@/components/RequestAnalyticsPage/RequestAnalyticsPage";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async () => {
    return {
      props: {},
    };
  }
);

const Page = () => {
  return (
    <>
      <Meta
        description="Analytics Page"
        url="/team-requests/requests/analytics"
      />
      <RequestAnalyticsPage />
    </>
  );
};

export default Page;
Page.Layout = "APP";
