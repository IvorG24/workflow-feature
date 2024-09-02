import ApplicationProgressPage from "@/components/ApplicationProgressPage/ApplicationProgressPage";
import Meta from "@/components/Meta/Meta";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import {
  BackgroundCheckTableRow,
  DirectorInterviewTableRow,
  HRPhoneInterviewTableRow,
  JobOfferTableRow,
  RequestViewRow,
  TechnicalInterviewTableRow,
  TradeTestTableRow,
} from "@/utils/types";
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
  generalAssessmentData?: RequestViewRow;
  technicalAssessmentData?: RequestViewRow;
  hrPhoneInterviewData?: HRPhoneInterviewTableRow;
  tradeTestData?: TradeTestTableRow | null;
  technicalInterviewData?: TechnicalInterviewTableRow | null;
  directorInterviewData?: DirectorInterviewTableRow | null;
  backgroundCheckData?: BackgroundCheckTableRow | null;
  jobOfferData?: JobOfferTableRow | null;
};

const Page = ({
  applicationInformationData,
  generalAssessmentData,
  technicalAssessmentData,
  hrPhoneInterviewData,
  tradeTestData,
  technicalInterviewData,
  directorInterviewData,
  backgroundCheckData,
  jobOfferData,
}: Props) => {
  return (
    <>
      <Meta
        description="User Application Progress Page"
        url="/user/application-progress/[requestId]"
      />
      <ApplicationProgressPage
        applicationInformationData={applicationInformationData}
        generalAssessmentData={generalAssessmentData}
        technicalAssessmentData={technicalAssessmentData}
        hrPhoneInterviewData={hrPhoneInterviewData}
        tradeTestData={tradeTestData}
        technicalInterviewData={technicalInterviewData}
        directorInterviewData={directorInterviewData}
        backgroundCheckData={backgroundCheckData}
        jobOfferData={jobOfferData}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
