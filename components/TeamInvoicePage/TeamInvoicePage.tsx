import { Container } from "@mantine/core";
import InvoiceHistory from "./InvoiceHistory/InvoiceHistory";
import Payment from "./Payment/Payment";

type Props = {
  outstandingBalance: number;
  expirationDate: string;
  currentDate: string;
  price: number;
};

const TeamInvoicePage = ({
  outstandingBalance,
  expirationDate,
  currentDate,
  price,
}: Props) => {
  return (
    <Container>
      <Payment
        outstandingBalance={outstandingBalance}
        expirationDate={expirationDate}
        currentDate={currentDate}
        price={price}
      />
      <InvoiceHistory />
    </Container>
  );
};

export default TeamInvoicePage;
