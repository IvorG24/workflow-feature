import { addCommaToNumber, regExp } from "@/utils/string";
import { DuplicateSectionType } from "@/utils/types";
import { Paper, ScrollArea, Table, Text, Title } from "@mantine/core";

type Props = {
  summaryData: DuplicateSectionType[];
};

const TransferReceiptSummary = ({ summaryData }: Props) => {
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
              <th>Base Unit of Measurement</th>
              <th>Receiving Status</th>
              <th>Source Project</th>
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

              const sourceProject = JSON.parse(
                `${summary.section_field[3].field_response?.request_response}`
              );

              const parsedItem = JSON.parse(item);
              const firstClosingIndex = parsedItem.indexOf(")");
              const secondClosingIndex = parsedItem
                .slice(firstClosingIndex + 1)
                .indexOf(")");

              const newItem = parsedItem.slice(0, firstClosingIndex + 1);
              const description = parsedItem
                .slice(
                  firstClosingIndex + secondClosingIndex + 4,
                  parsedItem.length - 3
                )
                .split(", ")
                .join("\n");

              return (
                <tr key={index}>
                  <td>
                    <Text fw={700}>{newItem}</Text>
                    <pre style={{ marginTop: 10 }}>
                      <Text>{description}</Text>
                    </pre>
                  </td>
                  <td>{addCommaToNumber(parsedQuantity)}</td>
                  <td>{unit}</td>
                  <td>{status}</td>
                  <td>{sourceProject}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </ScrollArea>
    </Paper>
  );
};

export default TransferReceiptSummary;
