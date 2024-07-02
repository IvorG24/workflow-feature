import { formatDate } from "@/utils/constant";
import { safeParse } from "@/utils/functions";
import { addCommaToNumber } from "@/utils/string";
import { DuplicateSectionType } from "@/utils/types";
import { Paper, ScrollArea, Table, Title } from "@mantine/core";

type Props = {
  summaryData: DuplicateSectionType[];
};

const LiquidationReimbursementSummary = ({ summaryData }: Props) => {
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
              <th>Date</th>
              <th>Supplier Name/Payee</th>
              <th>Type of Request</th>
              <th>Invoice Amount</th>
            </tr>
          </thead>
          <tbody>
            {summaryData.map((summary, index) => {
              const date = formatDate(
                safeParse(
                  `${summary.section_field[0].field_response?.request_response}`
                )
              );
              const payee = safeParse(
                `${summary.section_field[1].field_response?.request_response}`
              );
              const type = safeParse(
                `${summary.section_field[2].field_response?.request_response}`
              );
              const amount = safeParse(
                `${
                  summary.section_field.find(
                    (field) => field.field_name === "Invoice Amount"
                  )?.field_response?.request_response
                }`
              );

              return (
                <tr key={index}>
                  <td>{date}</td>
                  <td>{payee}</td>
                  <td>{type}</td>
                  <td>{addCommaToNumber(amount)}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </ScrollArea>
    </Paper>
  );
};

export default LiquidationReimbursementSummary;
