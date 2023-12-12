import { getUserActiveTeamId } from "@/backend/api/get";
import OnboardingCreateRequisitionRequestPage from "@/components/CreateRequisitionRequestPage/OnboardingCreateRequisitionRequestPage";

import Meta from "@/components/Meta/Meta";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import { FormType, FormWithResponseType, OptionTableRow } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async ({ supabaseClient, user, context }) => {
    try {
      const { data, error } = await supabaseClient.rpc(
        "create_request_page_on_load",
        {
          input_data: {
            formId: context.query.formId,
            userId: user.id,
            requisitionId: context.query.requisitionId,
            quotationId: context.query.quotationId,
            sourcedItemId: context.query.sourcedItemId,
            releaseOrderId: context.query.releaseOrderId,
          },
        }
      );
      if (error) throw error;
      const teamId = await getUserActiveTeamId(supabaseClient, {
        userId: user.id,
      });
      const createRequestData = JSON.parse(JSON.stringify(data)) as Props;
      return {
        props: { ...createRequestData, teamId, userId: user.id },
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
  teamId: string;
  form: FormWithResponseType;
  itemOptions: OptionTableRow[];
  projectOptions?: OptionTableRow[];
  sourceProjectList?: Record<string, string>;
  requestProjectId: string;
  requestingProject?: string;
  serviceOptions?: OptionTableRow[];
  specialApprover?: {
    special_approver_id: string;
    special_approver_item_list: string[];
    special_approver_signer: FormType["form_signer"][0];
  }[];
};

const Page = ({
  userId,
  teamId,
  form,
  itemOptions,
  projectOptions = [],
  specialApprover = [],
}: Props) => {
  const formslyForm = () => {
    switch (form.form_name) {
      case "Requisition":
        return (
          <OnboardingCreateRequisitionRequestPage
            userId={userId}
            form={form}
            itemOptions={itemOptions}
            projectOptions={projectOptions}
            specialApprover={specialApprover}
            teamId={teamId}
          />
        );
    }
  };

  return (
    <>
      <Meta
        description="Create Request Onboarding Page"
        url="/team-requests/forms/[formId]/create/onboarding"
      />

      {form.form_is_formsly_form ? formslyForm() : null}
    </>
  );
};

export default Page;
Page.Layout = "ONBOARDING";
