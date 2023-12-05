import Meta from "@/components/Meta/Meta";
import OnboardingTestPage from "@/components/OnboardingTestPage/OnboardingTestPage";
import {
  ONBOARDING_REQUEST_LIST_ANSWER,
  ONBOARDING_REQUEST_LIST_QUESTION,
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
        url="/team-requests/requests/test"
      />

      <OnboardingTestPage
        userId={userId}
        questionList={ONBOARDING_REQUEST_LIST_QUESTION}
        answerList={ONBOARDING_REQUEST_LIST_ANSWER}
      />
    </>
  );
};

export default Page;
Page.Layout = "ONBOARDING";
