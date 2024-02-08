import { OtherExpensesTypeWithCategoryType } from "@/utils/types";
import { Container, Paper } from "@mantine/core";
import OtherExpensesType from "./OtherExpensesType/OtherExpensesType";

type Props = {
  otherExpensesTypes: OtherExpensesTypeWithCategoryType[];
  otherExpensesTypeCount: number;
};

const OtherExpensesFormDetails = ({
  otherExpensesTypes,
  otherExpensesTypeCount,
}: Props) => {
  return (
    <Container p={0} fluid pos="relative">
      <Paper p="xl" shadow="xs">
        <OtherExpensesType
          otherExpensesTypes={otherExpensesTypes}
          otherExpensesTypeCount={otherExpensesTypeCount}
        />
      </Paper>
    </Container>
  );
};

export default OtherExpensesFormDetails;
