import Meta from "@/components/Meta/Meta";
import RequisitionAnalytics from "@/components/RequisitionAnalyticsPage/RequisitionAnalytics";
import { TEMP_REQUISITION_FORM_RESPONSE } from "@/utils/dummyData";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const rfData = TEMP_REQUISITION_FORM_RESPONSE;

    return {
      props: { requisition_form_data: rfData },
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

type Props = {
  requisition_form_data: {
    request_response_id: string;
    request_response: string;
    request_response_request_id: string;
    request_response_field_id: string;
  }[];
};

const RequisitionFormData = ({ requisition_form_data }: Props) => {
  // const formslyForm = () => {
  //   switch (form.form_name) {
  //     case "Requisition Form":
  //       return <>Formsly Req Form</>;
  //   }
  // };
  return (
    <>
      <Meta description="Request Page" url="/team-requests/forms/[formId]" />
      {/* {form.form_is_formsly_form ? formslyForm() : null}
      {!form.form_is_formsly_form ? <>Req form</> : null} */}
      <RequisitionAnalytics requisitionData={requisition_form_data} />
    </>
  );
};

export default RequisitionFormData;
