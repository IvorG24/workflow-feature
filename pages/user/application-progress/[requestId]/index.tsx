import ApplicationProgressPage from "@/components/ApplicationProgressPage/ApplicationProgressPage";
import Meta from "@/components/Meta/Meta";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import {
  AttachmentTableRow,
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
  technicalInterview1Data?: TechnicalInterviewTableRow | null;
  technicalInterview2Data?: TechnicalInterviewTableRow | null;
  directorInterviewData?: DirectorInterviewTableRow | null;
  backgroundCheckData?: BackgroundCheckTableRow | null;
  jobOfferData?: (JobOfferTableRow & AttachmentTableRow) | null;
};

const Page = ({
  applicationInformationData,
  generalAssessmentData,
  technicalAssessmentData,
  hrPhoneInterviewData,
  tradeTestData,
  technicalInterview1Data,
  technicalInterview2Data,
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
        technicalInterview1Data={technicalInterview1Data}
        technicalInterview2Data={technicalInterview2Data}
        directorInterviewData={directorInterviewData}
        backgroundCheckData={backgroundCheckData}
        jobOfferData={jobOfferData}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
