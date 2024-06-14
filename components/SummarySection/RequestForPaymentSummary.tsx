import { addCommaToNumber } from "@/utils/string";
import { DuplicateSectionType } from "@/utils/types";
import { Paper, ScrollArea, Table, Title } from "@mantine/core";

type Props = {
  summaryData: DuplicateSectionType[];
};

const RequestForPaymentSummary = ({ summaryData }: Props) => {
  return (
    <Paper p="xl" shadow="xs">
      <Title order={4} color="dimmed">
        Request Summary
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
              <th>Project / Department</th>
            </tr>
          </thead>
          <tbody>
            {summaryData.map((summary, index) => {
              const type = JSON.parse(
                `${summary.section_field[0].field_response?.request_response}`
              );
              const amount = JSON.parse(
                `${summary.section_field[1].field_response?.request_response}`
              );
              const projectOrDepartment = JSON.parse(
                `${summary.section_field[2].field_response?.request_response}`
              );

              return (
                <tr key={index}>
                  <td>{type}</td>
                  <td>{addCommaToNumber(amount)}</td>
                  <td>{projectOrDepartment}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </ScrollArea>
    </Paper>
  );
};

export default RequestForPaymentSummary;
