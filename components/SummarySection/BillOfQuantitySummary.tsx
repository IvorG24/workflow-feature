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
              const costCode = safeParse(
                `${summary.section_field[5].field_response?.request_response}`
              );
              const boqCode = safeParse(
                `${summary.section_field[6].field_response?.request_response}`
              );

              return (
                <tr key={index}>
                  <td>{payee}</td>
                  <td>{type}</td>
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
