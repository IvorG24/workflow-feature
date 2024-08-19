import ApplicationProgressPage from "@/components/ApplicationProgressPage/ApplicationProgressPage";
import Meta from "@/components/Meta/Meta";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import { RequestViewRow } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async ({ supabaseClient, context }) => {
    try {
      const { data, error } = await supabaseClient.rpc(
        "get_user_application_progress_on_load",
        {
          input_data: {
            requestId: `${context.query.requestId}`,
          },
        }
      );
      if (error) throw error;
      return {
        props: data as Props,
      };
    } catch (e) {
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
  applicationInformationData: RequestViewRow;
  onlineApplicationData: RequestViewRow;
  onlineAssessmentData: RequestViewRow;
};

const Page = ({
  applicationInformationData,
  onlineApplicationData,
  onlineAssessmentData,
}: Props) => {
  return (
    <>
      <Meta
        description="User Application Progress Page"
        url="/user/application-progress/[requestId]"
      />
      <ApplicationProgressPage
        applicationInformationData={applicationInformationData}
        onlineApplicationData={onlineApplicationData}
        onlineAssessmentData={onlineAssessmentData}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
