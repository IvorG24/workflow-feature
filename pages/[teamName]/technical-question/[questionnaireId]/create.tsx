import CreateRequestPage from "@/components/CreateRequestPage/CreateRequestPage";
import Meta from "@/components/Meta/Meta";
import TechnicalAssessmentCreateQuestionPage from "@/components/TechnicalAssessmentCreateQuestionPage/TechnicalAssessmentCreateQuestionPage";

// export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
//   async ({ supabaseClient, user, context }) => {
//     try {
//     } catch (e) {
//       return {
//         redirect: {
//           destination: "/500",
//           permanent: false,
//         },
//       };
//     }
//   }
// );

const Page = ({}) => {
  return (
    <>
      <Meta
        description="Create Request Page"
        url="/teamName/forms/[formId]/create"
      />
      <TechnicalAssessmentCreateQuestionPage/>
    </>
  );
};

export default Page;
Page.Layout = "APP";
