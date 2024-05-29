import {
  fetchFormslyLatestPrice,
  fetchTeamLatestTransaction,
  getCurrentDateString,
} from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import TeamInvoicePage from "@/components/TeamInvoicePage/TeamInvoicePage";
import { withActiveTeam } from "@/utils/server-side-protections";
import moment from "moment";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withActiveTeam(
  async ({ supabaseClient, userActiveTeam }) => {
    const currentDate = await getCurrentDateString(supabaseClient);
    let expirationDate = userActiveTeam.team_date_created;
    const latestTransaction = await fetchTeamLatestTransaction(supabaseClient, {
      teamId: userActiveTeam.team_id,
    });
    const price = await fetchFormslyLatestPrice(supabaseClient);

    if (latestTransaction) {
      expirationDate = latestTransaction.team_transaction_team_expiration_date;
    }
    let outstandingBalance = 0;
    const difference = moment(currentDate).diff(
      moment(expirationDate),
      "months",
      true
    );
    if (difference > 0) {
      outstandingBalance = Math.ceil(difference) * price;
    }
    return {
      props: {
        currentDate,
        expirationDate,
        outstandingBalance,
        price,
      },
    };
  }
);

type Props = {
  outstandingBalance: number;
  expirationDate: string;
  currentDate: string;
  price: number;
};

const Page = ({
  outstandingBalance,
  expirationDate,
  currentDate,
  price,
}: Props) => {
  return (
    <>
      <Meta description="Team Invoice Page" url="/teamName/invoice" />
      <TeamInvoicePage
        outstandingBalance={outstandingBalance}
        expirationDate={expirationDate}
        currentDate={currentDate}
        price={price}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
