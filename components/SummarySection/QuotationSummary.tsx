import { addCommaToNumber, regExp } from "@/utils/string";
import { DuplicateSectionType } from "@/utils/types";
import { Paper, Table, Text, Title } from "@mantine/core";

type Props = {
  summaryData: DuplicateSectionType[];
};

const QuotationSummary = ({ summaryData }: Props) => {
  let totalPriceSummation = 0;
  return (
    <Paper p="xl" shadow="xs">
      <Title order={4} color="dimmed">
        Summary
      </Title>

      <Table
        mt="md"
        highlightOnHover
        withColumnBorders
        withBorder
        sx={(theme) => ({
          "& th": {
            backgroundColor:
              theme.colorScheme === "dark"
                ? theme.colors.blue[9]
                : theme.colors.blue[2],
          },
        })}
      >
        <thead>
          <tr>
            <th>Item</th>
            <th>Price per Unit</th>
            <th>Quantity</th>
            <th>Unit</th>
            <th>Total Price</th>
          </tr>
        </thead>
        <tbody>
          {summaryData.map((summary, index) => {
            const item = JSON.parse(
              `${summary.section_field[0].field_response?.request_response}`
            );
            const price = JSON.parse(
              `${summary.section_field[1].field_response?.request_response}`
            );
            const parsedQuantity = JSON.parse(
              `${summary.section_field[2].field_response?.request_response}`
            );
            const matches = regExp.exec(item);
            const unit = matches && matches[1].replace(/\d+/g, "").trim();

            const totalPrice = parsedQuantity * price;
            totalPriceSummation += totalPrice;

            return (
              <tr key={index}>
                <td>{item}</td>
                <td>₱ {addCommaToNumber(price)}</td>
                <td>{addCommaToNumber(parsedQuantity)}</td>
                <td>{unit}</td>
                <td>₱ {addCommaToNumber(totalPrice)}</td>
              </tr>
            );
          })}
          <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td>
              <Text fw={700}>₱ {addCommaToNumber(totalPriceSummation)}</Text>
            </td>
          </tr>
        </tbody>
      </Table>
    </Paper>
  );
};

export default QuotationSummary;
