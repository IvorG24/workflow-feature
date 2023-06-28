import { DuplicateSectionType } from "@/utils/arrayFunctions";
import { Paper, Table, Title } from "@mantine/core";

type Props = {
  summaryData: DuplicateSectionType[];
};

const OrderToPurchaseSummary = ({ summaryData }: Props) => {
  return (
    <Paper p="xl" shadow="xs">
      <Title order={4} color="dimmed">
        Summary
      </Title>

      <Table mt="md" highlightOnHover withColumnBorders withBorder>
        <thead style={{ backgroundColor: "#A5D8FF" }}>
          <tr>
            <th>Item</th>
            <th>Description</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {summaryData.map((summary, index) => {
            const item = JSON.parse(
              `${summary.section_field[0].field_response?.request_response}`
            );
            const quantity = `${JSON.parse(
              `${summary.section_field[2].field_response?.request_response}`
            )} ${JSON.parse(
              `${summary.section_field[1].field_response?.request_response}`
            )}`;

            let description = "";
            summary.section_field.slice(3).forEach((field) => {
              if (field.field_response) {
                description += `${field.field_name}: ${JSON.parse(
                  field.field_response.request_response
                )}, `;
              }
            });
            description.slice(0, -2);

            return (
              <tr key={index}>
                <td>{item}</td>
                <td>{description}</td>
                <td>{quantity}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Paper>
  );
};

export default OrderToPurchaseSummary;
