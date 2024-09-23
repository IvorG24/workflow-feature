import { checkIfGroupMember } from "@/backend/api/get";
import CreateRequestPage from "@/components/CreateRequestPage/CreateRequestPage";
import Meta from "@/components/Meta/Meta";
import TechnicalAssessmentViewQuestionPage from "@/components/TechnicalAssessmentCreateQuestionPage/TechnicalAssessmentViewQuestionPage";
import { withActiveTeam } from "@/utils/server-side-protections";
import { FormWithResponseType } from "@/utils/types";
import { GetServerSideProps } from "next";
export const getServerSideProps: GetServerSideProps = withActiveTeam(
  async ({ supabaseClient, user, userActiveTeam, context }) => {
    try {
      const iSHumanResourcesMember = await checkIfGroupMember(supabaseClient, {
        userId: user.id,
        groupName: "HUMAN RESOURCES",
        teamId: userActiveTeam.team_id,
      });
      if (!iSHumanResourcesMember) {
        return {
          redirect: {
            destination: "/401",
            permanent: false,
          },
        };
      }
      const { data, error } = await supabaseClient.rpc(
        "create_request_page_on_load",
        {
          input_data: {
            formId: context.query.formId,
            userId: user.id,
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
  form: FormWithResponseType;
};
const Page = ({ form }: Props) => {
  const formslyForm = () => {
    switch (form.form_name) {
      case "Technical Questionnaire":
        return (
          <TechnicalAssessmentViewQuestionPage
            form={form}
            formslyFormName={form.form_name}
          />
        );
      default:
        return (
          <CreateRequestPage form={form} formslyFormName={form.form_name} />
        );
    }
  };
  return (
    <>
      <Meta
        description="Create Request Page"
        url="/teamName/forms/[formId]/technical-questionnaire-view"
      />

      {form.form_is_formsly_form ? formslyForm() : null}
      {!form.form_is_formsly_form ? (
        <CreateRequestPage form={form} formslyFormName={form.form_name} />
      ) : null}
    </>
  );
};

export default Page;
Page.Layout = "APP";
