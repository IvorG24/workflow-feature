import { regExp } from "@/utils/string";
import { DuplicateSectionType } from "@/utils/types";
import { Paper, Table, Title } from "@mantine/core";

type Props = {
  summaryData: DuplicateSectionType[];
};

const ReceivingInspectingReportSummary = ({ summaryData }: Props) => {
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
            <th>Quantity</th>
            <th>Receiving Status</th>
          </tr>
        </thead>
        <tbody>
          {summaryData.map((summary, index) => {
            const item = JSON.parse(
              `${summary.section_field[0].field_response?.request_response}`
            );
            const parsedQuantity = JSON.parse(
              `${summary.section_field[1].field_response?.request_response}`
            );
            const matches = regExp.exec(item);
            const unit =
              matches && matches[1].replace(/\d+/g, "").trim().split("/")[0];

            const quantity = `${parsedQuantity} ${unit}`;
            const status = JSON.parse(
              `${summary.section_field[2].field_response?.request_response}`
            );

            return (
              <tr key={index}>
                <td>{item}</td>
                <td>{quantity}</td>
                <td>{status}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Paper>
  );
};

export default ReceivingInspectingReportSummary;
