import Meta from "@/components/Meta/Meta";
import OnboardingTestPage, {
  OnboardingTestFormValues,
} from "@/components/OnboardingTestPage/OnboardingTestPage";
import {
  ONBOARDING_DASHBOARD_ANSWER,
  ONBOARDING_DASHBOARD_QUESTION,
  ONBOARDING_FORM_CREATE_REQUISITION_ANSWER,
  ONBOARDING_FORM_CREATE_REQUISITION_QUESTION,
  ONBOARDING_REQUEST_LIST_ANSWER,
  ONBOARDING_REQUEST_LIST_QUESTION,
  ONBOARDING_REQUISITION_REQUEST_ANSWER,
  ONBOARDING_REQUISITION_REQUEST_QUESTION,
  ONBOARD_NAME,
  OnboardAnswer,
} from "@/utils/onboarding";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async ({ context, user }) => {
    try {
      const { onboardName } = context.query;
      let questionList: OnboardingTestFormValues["sections"] = [];
      let answerList: OnboardAnswer[] = [];

      if (onboardName === ONBOARD_NAME.DASHBOARD) {
        questionList = ONBOARDING_DASHBOARD_QUESTION;
        answerList = ONBOARDING_DASHBOARD_ANSWER;
      } else if (onboardName === ONBOARD_NAME.REQUEST_LIST) {
        questionList = ONBOARDING_REQUEST_LIST_QUESTION;
        answerList = ONBOARDING_REQUEST_LIST_ANSWER;
      } else if (onboardName === ONBOARD_NAME.CREATE_REQUISITION) {
        questionList = ONBOARDING_FORM_CREATE_REQUISITION_QUESTION;
        answerList = ONBOARDING_FORM_CREATE_REQUISITION_ANSWER;
      } else if (onboardName === ONBOARD_NAME.REQUISITION_REQUEST) {
        questionList = ONBOARDING_REQUISITION_REQUEST_QUESTION;
        answerList = ONBOARDING_REQUISITION_REQUEST_ANSWER;
      } else {
        throw new Error("No onboard name");
      }
      return {
        props: { userId: user.id, questionList, answerList },
      };
    } catch (error) {
      console.error(error);
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
  userId: string;
  questionList: OnboardingTestFormValues["sections"];
  answerList: OnboardAnswer[];
};

const Page = ({ userId, answerList, questionList }: Props) => {
  return (
    <>
      <Meta
        description="Onboarding Test Page"
        url="/team-requests/requests/test"
      />

      <OnboardingTestPage
        userId={userId}
        questionList={questionList}
        answerList={answerList}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
