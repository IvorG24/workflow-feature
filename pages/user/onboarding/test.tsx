import Meta from "@/components/Meta/Meta";
import OnboardingTestPage, {
  OnboardingTestFormValues,
} from "@/components/OnboardingTestPage/OnboardingTestPage";
import {
  ONBOARDING_FORM_CREATE_REQUISITION_ANSWER,
  ONBOARDING_FORM_CREATE_REQUISITION_QUESTION,
  ONBOARDING_REQUEST_LIST_ANSWER,
  ONBOARDING_REQUEST_LIST_QUESTION,
  ONBOARD_NAME,
  OnboardAnswer,
} from "@/utils/onboarding";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async ({ user }) => {
    try {
      return {
        props: { userId: user.id },
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
};

const Page = ({ userId }: Props) => {
  const router = useRouter();
  const { onboardName } = router.query;
  let questionList: OnboardingTestFormValues["sections"] = [];
  let answerList: OnboardAnswer[] = [];

  if (onboardName === ONBOARD_NAME.DASHBOARD) {
    questionList = [];
    answerList = [];
  } else if (onboardName === ONBOARD_NAME.REQUEST_LIST) {
    questionList = ONBOARDING_REQUEST_LIST_QUESTION;
    answerList = ONBOARDING_REQUEST_LIST_ANSWER;
  } else if (onboardName === ONBOARD_NAME.CREATE_REQUISITION) {
    questionList = ONBOARDING_FORM_CREATE_REQUISITION_QUESTION;
    answerList = ONBOARDING_FORM_CREATE_REQUISITION_ANSWER;
  } else if (onboardName === ONBOARD_NAME.REQUISITION_REQUEST) {
    questionList = [];
    answerList = [];
  }

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
Page.Layout = "ONBOARDING";
