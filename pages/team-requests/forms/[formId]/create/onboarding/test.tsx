import Meta from "@/components/Meta/Meta";
import OnboardingTestPage from "@/components/OnboardingTestPage/OnboardingTestPage";
import {
  ONBOARDING_FORM_CREATE_REQUISITION_ANSWER,
  ONBOARDING_FORM_CREATE_REQUISITION_QUESTION,
} from "@/utils/onboarding";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import { GetServerSideProps } from "next";

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
  return (
    <>
      <Meta
        description="Onboarding Test Page"
        url="/team-requests/forms/[formId]/create/onboarding/test"
      />

      <OnboardingTestPage
        userId={userId}
        questionList={ONBOARDING_FORM_CREATE_REQUISITION_QUESTION}
        answerList={ONBOARDING_FORM_CREATE_REQUISITION_ANSWER}
      />
    </>
  );
};

export default Page;
Page.Layout = "ONBOARDING";
