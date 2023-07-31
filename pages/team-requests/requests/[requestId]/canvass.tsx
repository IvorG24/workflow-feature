import { getCanvassData } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import OrderToPurchaseCanvassPage from "@/components/OrderToPurchaseCanvassPage/OrderToPurchaseCanvassPage";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import { CanvassLowestPriceType, CanvassType } from "@/utils/types";
import { isEmpty } from "lodash";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async ({ supabaseClient, context }) => {
    try {
      const {
        canvassData,
        lowestPricePerItem,
        summaryData,
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
  lowestQuotation: { id: string; value: number };
  requestAdditionalCharge: CanvassLowestPriceType;
  lowestAdditionalCharge: number;
};

const Page = ({
  canvassData,
  lowestPricePerItem,
  summaryData,
  lowestQuotation,
  requestAdditionalCharge,
  lowestAdditionalCharge
}: Props) => {
  return (
    <>
      <Meta
        description="Canvass Page"
        url="/team-requests/request/<requestId>/canvass"
      />
      <OrderToPurchaseCanvassPage
        canvassData={canvassData}
        lowestPricePerItem={lowestPricePerItem}
        summaryData={summaryData}
        lowestQuotation={lowestQuotation}
        requestAdditionalCharge={requestAdditionalCharge}
        lowestAdditionalCharge={lowestAdditionalCharge}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
