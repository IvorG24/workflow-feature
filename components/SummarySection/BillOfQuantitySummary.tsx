import { safeParse } from "@/utils/functions";
import { DuplicateSectionType } from "@/utils/types";
import { Paper, ScrollArea, Table, Title } from "@mantine/core";

type Props = {
  summaryData: DuplicateSectionType[];
};

const BillOfQuantitySummary = ({ summaryData }: Props) => {
  return (
    <Paper p="xl" shadow="xs">
      <Title order={4} color="dimmed">
        Summary
      </Title>

      <ScrollArea>
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
          miw={600}
        >
          <thead>
            <tr>
              <th>Supplier Name/Payee</th>
              <th>Type of Request</th>
              <th>Invoice Amount</th>
              <th>VAT</th>
              <th>Cost</th>
              <th>Cost Code</th>
              <th>BOQ Code</th>
            </tr>
          </thead>
          <tbody>
            {summaryData.map((summary, index) => {
              const payee = safeParse(
                `${summary.section_field[0].field_response?.request_response}`
              );
              const type = safeParse(
                `${summary.section_field[1].field_response?.request_response}`
              );
              const invoiceAmount = safeParse(
                `${summary.section_field[2].field_response?.request_response}`
              );
              const vat = Number(
                safeParse(
                  `${
                    summary.section_field.find(
                      (field) => field.field_name === "VAT"
                    )?.field_response?.request_response ?? 0
                  }`
                )
              );
              const cost = Number(
                safeParse(
                  `${
                    summary.section_field.find(
                      (field) => field.field_name === "Cost"
                    )?.field_response?.request_response ?? 0
                  }`
                )
              );
              const costCode = safeParse(
                `${
                  summary.section_field.find(
                    (field) => field.field_name === "Cost Code"
                  )?.field_response?.request_response
                }`
              );
              const boqCode = safeParse(
                `${
                  summary.section_field.find(
                    (field) => field.field_name === "Bill of Quantity Code"
                  )?.field_response?.request_response
                }`
              );

              return (
                <tr key={index}>
                  <td>{payee}</td>
                  <td>{type}</td>
                  <td>{invoiceAmount}</td>
                  <td>{vat.toFixed(2)}</td>
                  <td>{cost.toFixed(2)}</td>
                  <td>{costCode}</td>
                  <td>{boqCode}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </ScrollArea>
    </Paper>
  );
};

export default BillOfQuantitySummary;
