import { addCommaToNumber, regExp } from "@/utils/string";
import { DuplicateSectionType } from "@/utils/types";
import { Paper, ScrollArea, Table, Title } from "@mantine/core";

type Props = {
  summaryData: DuplicateSectionType[];
};

const ReceivingInspectingReportSummary = ({ summaryData }: Props) => {
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
              <th>Item</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Receiving Status</th>
            </tr>
          </thead>
          <tbody>
            {summaryData.map((summary, index) => {
              const quantityMatch =
                summary.section_field[0].field_response?.request_response.match(
                  /(\d+)/
                );
              if (!quantityMatch) return;

              const item =
                summary.section_field[0].field_response?.request_response.replace(
                  `${quantityMatch[0]}`,
                  addCommaToNumber(Number(quantityMatch[0]))
                );
              if (!item) return;
              const parsedQuantity = JSON.parse(
                `${summary.section_field[1].field_response?.request_response}`
              );
              const matches = regExp.exec(item);
              const unit = matches && matches[1].replace(/[0-9,]/g, "").trim();

              const status = JSON.parse(
                `${summary.section_field[2].field_response?.request_response}`
              );

              return (
                <tr key={index}>
                  <td>{JSON.parse(item)}</td>
                  <td>{addCommaToNumber(parsedQuantity)}</td>
                  <td>{unit}</td>
                  <td>{status}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </ScrollArea>
    </Paper>
  );
};

export default ReceivingInspectingReportSummary;
