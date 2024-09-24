import Meta from "@/components/Meta/Meta";
import TechnicalAssessmentCreateQuestionPage from "@/components/TechnicalAssessmentCreateQuestionPage/TechnicalAssessmentCreateQuestionPage";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async ({ context }) => {
    try {
      const questionnaireId = context.query?.questionnaireId;

      if (!questionnaireId) {
        return {
          redirect: {
            destination: "/404",
            permanent: false,
          },
        };
      }

      return {
        props: { questionnaireId }, // Wrap it inside an object with `props`
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
  questionnaireId: string;
};

const Page = ({ questionnaireId }: Props) => {
  return (
    <>
      <Meta
        description="Create technical question Page"
        url="/teamName/technical-question/[questionnaireId]/create"
      />
      <TechnicalAssessmentCreateQuestionPage
        questionnaireId={questionnaireId}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
