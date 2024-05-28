import { getCurrentDateString } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import TeamInvoicePage from "@/components/TeamInvoicePage/TeamInvoicePage";
import { FORMSLY_PRICE_PER_MONTH } from "@/utils/constant";
import { withActiveTeam } from "@/utils/server-side-protections";
import moment from "moment";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withActiveTeam(
  async ({ supabaseClient, userActiveTeam }) => {
    const currentDate = await getCurrentDateString(supabaseClient);
    let outstandingBalance = 0;
    const difference = moment(currentDate).diff(
      moment(userActiveTeam.team_expiration),
      "months",
      true
    );
    if (difference > 0) {
      outstandingBalance = Math.ceil(difference) * FORMSLY_PRICE_PER_MONTH;
    }
    return {
      props: {
        currentDate,
        expirationDate: userActiveTeam.team_expiration,
        outstandingBalance,
      },
    };
  }
);

type Props = {
  outstandingBalance: number;
  expirationDate: string;
  currentDate: string;
};

const Page = ({ outstandingBalance, expirationDate, currentDate }: Props) => {
  return (
    <>
      <Meta description="Team Invoice Page" url="/teamName/invoice" />
      <TeamInvoicePage
        outstandingBalance={outstandingBalance}
        expirationDate={expirationDate}
        currentDate={currentDate}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
