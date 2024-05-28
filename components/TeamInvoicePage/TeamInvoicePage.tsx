import { Container } from "@mantine/core";
import InvoiceHistory from "./InvoiceHistory/InvoiceHistory";
import Payment from "./Payment/Payment";

type Props = {
  outstandingBalance: number;
  expirationDate: string;
  currentDate: string;
};

const TeamInvoicePage = ({
  outstandingBalance,
  expirationDate,
  currentDate,
}: Props) => {
  return (
    <Container>
      <Payment
        outstandingBalance={outstandingBalance}
        expirationDate={expirationDate}
        currentDate={currentDate}
      />
      <InvoiceHistory />
    </Container>
  );
};

export default TeamInvoicePage;
