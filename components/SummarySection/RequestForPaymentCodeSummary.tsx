import { safeParse } from "@/utils/functions";
import { DuplicateSectionType } from "@/utils/types";
import { Paper, ScrollArea, Table, Title } from "@mantine/core";

type Props = {
  summaryData: DuplicateSectionType[];
};

const RequestForPaymentCodeSummary = ({ summaryData }: Props) => {
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
              <th>Type</th>
              <th>Amount</th>
              <th>Project</th>
              <th>Cost Code</th>
              <th>BOQ Code</th>
            </tr>
          </thead>
          <tbody>
            {summaryData.map((summary, index) => {
              const type = safeParse(
                `${summary.section_field[0].field_response?.request_response}`
              );
              const amount = safeParse(
                `${summary.section_field[1].field_response?.request_response}`
              );
              const project = safeParse(
                `${summary.section_field[2].field_response?.request_response}`
              );
              const costCode = safeParse(
                `${summary.section_field[3].field_response?.request_response}`
              );
              const boqCode = safeParse(
                `${summary.section_field[4].field_response?.request_response}`
              );

              return (
                <tr key={index}>
                  <td>{type}</td>
                  <td>{amount}</td>
                  <td>{project}</td>
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

export default RequestForPaymentCodeSummary;
