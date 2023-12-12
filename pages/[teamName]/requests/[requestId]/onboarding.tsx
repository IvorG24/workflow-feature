import Meta from "@/components/Meta/Meta";
import OnboardingRequisitionRequestPage from "@/components/OnboardingRequisitionRequestPage/OnboardingRequisitionRequestPage";
import { REQUISITION_REQUEST_SAMPLE } from "@/utils/onboarding";
import { withAuthAndOnboardingRequestPage } from "@/utils/server-side-protections";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";

export const getServerSideProps: GetServerSideProps =
  withAuthAndOnboardingRequestPage(async () => {
    try {
      return {
        props: {},
      };
    } catch (e) {
      console.error(e);
      return {
        redirect: {
          destination: "/500",
          permanent: false,
        },
      };
    }
  });

const Page = () => {
  const router = useRouter();
  const { requestFormName } = router.query;
  const connectedRequestIDList = {
    Requisition: [],
    "Sourced Item": [],
    Quotation: [],
    "Receiving Inspecting Report": [],
    "Release Order": [],
    "Transfer Receipt": [],
    "Release Quantity": [],
  };

  const formslyForm = () => {
    if (requestFormName === "Requisition") {
      return (
        <OnboardingRequisitionRequestPage
          request={REQUISITION_REQUEST_SAMPLE}
          connectedForm={[]}
          connectedRequestIDList={connectedRequestIDList}
          canvassRequest={[]}
        />
      );
    }
  };

  return (
    <>
      <Meta
        description="Request Page"
        url="/team-requests/requests/[requestId]"
      />
      {requestFormName ? formslyForm() : null}
    </>
  );
};

export default Page;
Page.Layout = "APP";
