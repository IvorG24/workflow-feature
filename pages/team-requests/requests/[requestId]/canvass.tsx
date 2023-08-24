import { getCanvassData } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import RequisitionCanvassPage from "@/components/RequisitionCanvassPage/RequisitionCanvassPage";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import {
  CanvassAdditionalDetailsType,
  CanvassLowestPriceType,
  CanvassType,
} from "@/utils/types";
import { isEmpty } from "lodash";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async ({ supabaseClient, context }) => {
    try {
      const {
        canvassData,
        lowestPricePerItem,
        summaryData,
        summaryAdditionalDetails,
        lowestQuotation,
        requestAdditionalCharge,
        lowestAdditionalCharge,
      } = await getCanvassData(supabaseClient, {
        requestId: `${context.query.requestId}`,
      });

      if (
        isEmpty(summaryData) ||
        lowestQuotation.id === undefined ||
        lowestQuotation.value === undefined
      ) {
        throw new Error();
      }

      return {
        props: {
          canvassData,
          lowestPricePerItem,
          summaryData,
          summaryAdditionalDetails,
          lowestQuotation,
          requestAdditionalCharge,
          lowestAdditionalCharge,
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
  }
);

type Props = {
  canvassData: CanvassType;
  lowestPricePerItem: CanvassLowestPriceType;
  summaryData: CanvassLowestPriceType;
  summaryAdditionalDetails: CanvassAdditionalDetailsType;
  lowestQuotation: { id: string; request_id: string; value: number };
  requestAdditionalCharge: CanvassLowestPriceType;
  lowestAdditionalCharge: number;
};

const Page = ({
  canvassData,
  lowestPricePerItem,
  summaryData,
  summaryAdditionalDetails,
  lowestQuotation,
  requestAdditionalCharge,
  lowestAdditionalCharge,
}: Props) => {
  return (
    <>
      <Meta
        description="Canvass Page"
        url="/team-requests/request/<requestId>/canvass"
      />
      <RequisitionCanvassPage
        canvassData={canvassData}
        lowestPricePerItem={lowestPricePerItem}
        summaryData={summaryData}
        summaryAdditionalDetails={summaryAdditionalDetails}
        lowestQuotation={lowestQuotation}
        requestAdditionalCharge={requestAdditionalCharge}
        lowestAdditionalCharge={lowestAdditionalCharge}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
