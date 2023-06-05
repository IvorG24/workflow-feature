import { getForm } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import RequestFormPage from "@/components/RequestFormPage/RequestFormPage";
import RequisitionAnalytics from "@/components/RequisitionAnalyticsPage/RequisitionAnalytics";
import {
  TEMP_REQUISITION_FORM_PURCHASE_DATA,
  TEMP_REQUISITION_FORM_TEAM_DATA,
  TEMP_REQUISITION_FORM_USER_DATA,
} from "@/utils/dummyData";
import { FormWithResponseType } from "@/utils/types";
import { Title } from "@mantine/core";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const teamData = TEMP_REQUISITION_FORM_TEAM_DATA;
    const userData = TEMP_REQUISITION_FORM_USER_DATA;
    const purchaseData = TEMP_REQUISITION_FORM_PURCHASE_DATA;
    const supabaseClient = createServerSupabaseClient(ctx);

    const form = await getForm(supabaseClient, {
      formId: `${ctx.query.formId}`,
    });

    return {
      props: {
        requisition_form_team_data: teamData,
        requisition_form_user_data: userData,
        requisition_form_purchase_data: purchaseData,
        form,
      },
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
};

export type RFDataType = {
  request_response_id: string;
  request_response: string;
  request_response_request_id: string;
  request_response_field_id: string;
  request_response_date_purchased?: string;
}[];

type Props = {
  requisition_form_team_data: RFDataType;
  requisition_form_user_data: RFDataType;
  requisition_form_purchase_data: RFDataType;
  form: FormWithResponseType;
};

const RequisitionFormData = ({
  requisition_form_team_data,
  requisition_form_user_data,
  requisition_form_purchase_data,
  form,
}: Props) => {
  const formslyForm = () => {
    switch (form.form_name) {
      case "Requisition Form":
        return (
          <>
            {" "}
            <Title order={3}>{form.form_name}</Title>
            <RequisitionAnalytics
              teamRequisitionData={requisition_form_team_data}
              userRequisitionData={requisition_form_user_data}
              purchaseRequisitionData={requisition_form_purchase_data}
            />
          </>
        );
    }
  };
  return (
    <>
      <Meta
        description="Analytics Page"
        url="/team-requests/forms/[formId]/analytics"
      />
      {form.form_is_formsly_form ? formslyForm() : null}
      {!form.form_is_formsly_form ? <RequestFormPage form={form} /> : null}
    </>
  );
};

export default RequisitionFormData;
RequisitionFormData.Layout = "APP";
