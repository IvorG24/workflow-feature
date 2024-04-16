import { Container, Paper } from "@mantine/core";
import OtherExpensesType from "./OtherExpensesType/OtherExpensesType";

const OtherExpensesFormDetails = () => {
  return (
    <Container p={0} fluid pos="relative">
      <Paper p="xl" shadow="xs">
        <OtherExpensesType />
      </Paper>
    </Container>
  );
};

export default OtherExpensesFormDetails;
