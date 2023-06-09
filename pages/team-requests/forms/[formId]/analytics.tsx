import { getForm } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import OrderToPurchaseAnalytics from "@/components/OrderToPurchaseAnalyticsPage/OrderToPurchaseAnalytics";
import {
  TEMP_ORDER_TO_PURCHASE_FORM_TEAM_DATA,
  TEMP_ORDER_TO_PURCHASE_FORM_USER_DATA,
  TEMP_ORDER_TO_PURCHASE_PURCHASE_DATA,
} from "@/utils/dummyData";
import { FormWithResponseType } from "@/utils/types";
import { Title } from "@mantine/core";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const teamData = TEMP_ORDER_TO_PURCHASE_FORM_TEAM_DATA;
    const userData = TEMP_ORDER_TO_PURCHASE_FORM_USER_DATA;
    const purchaseData = TEMP_ORDER_TO_PURCHASE_PURCHASE_DATA;
    const supabaseClient = createServerSupabaseClient(ctx);

    const form = await getForm(supabaseClient, {
      formId: `${ctx.query.formId}`,
    });

    return {
      props: {
        order_to_purchase_form_team_data: teamData,
        order_to_purchase_form_user_data: userData,
        order_to_purchase_form_purchase_data: purchaseData,
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

export type OTPDataType = {
  request_response_id: string;
  request_response: string;
  request_response_request_id: string;
  request_response_field_id: string;
  request_response_date_purchased?: string;
}[];

type Props = {
  order_to_purchase_form_team_data: OTPDataType;
  order_to_purchase_form_user_data: OTPDataType;
  order_to_purchase_form_purchase_data: OTPDataType;
  form: FormWithResponseType;
};

const OrderToPurchaseFormData = ({
  order_to_purchase_form_team_data,
  order_to_purchase_form_user_data,
  order_to_purchase_form_purchase_data,
  form,
}: Props) => {
  const formslyForm = () => {
    switch (form.form_name) {
      case "Order To Purchase":
        return (
          <>
            {" "}
            <Title order={3}>{form.form_name}</Title>
            <OrderToPurchaseAnalytics
              teamOrderToPurchaseData={order_to_purchase_form_team_data}
              userOrderToPurchaseData={order_to_purchase_form_user_data}
              purchaseOrderToPurchaseData={order_to_purchase_form_purchase_data}
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
      {/* {!form.form_is_formsly_form ? <RequestFormPage form={form} /> : null} */}
    </>
  );
};

export default OrderToPurchaseFormData;
OrderToPurchaseFormData.Layout = "APP";
