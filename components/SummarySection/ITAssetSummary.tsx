import { addCommaToNumber } from "@/utils/string";
import { DuplicateSectionType } from "@/utils/types";
import { Paper, ScrollArea, Table, Text, Title } from "@mantine/core";

type Props = {
  summaryData: DuplicateSectionType[];
};

const ITAssetSummary = ({ summaryData }: Props) => {
  const isWithPreferredSupplier = summaryData
    .map((data) => {
      return data.section_field.findIndex(
        (data) =>
          data.field_name === "Preferred Supplier" &&
          data.field_response?.request_response.length
      );
    })
    .some((index) => index !== -1);
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
              <th>Description</th>
              <th>GL Account</th>
              <th>CSI Code Description</th>
              <th>Quantity</th>
              <th>Base Unit of Measurement</th>
            </tr>
          </thead>
          <tbody>
            {summaryData.map((summary, index) => {
              const item = JSON.parse(
                `${summary.section_field[0].field_response?.request_response}`
              );

              let description = "";
              summary.section_field
                .slice(isWithPreferredSupplier ? 10 : 9)
                .forEach((field) => {
                  if (field.field_response) {
                    description += `${field.field_name}: ${JSON.parse(
                      field.field_response.request_response
                    )}\n`;
                  }
                });

              const csiCode = JSON.parse(
                `${summary.section_field[4].field_response?.request_response}`
              );
              const glAccount = JSON.parse(
                `${summary.section_field[3].field_response?.request_response}`
              );
              const quantity = JSON.parse(
                `${summary.section_field[2].field_response?.request_response}`
              );
              const unit = JSON.parse(
                `${summary.section_field[1].field_response?.request_response}`
              );

              return (
                <tr key={index}>
                  <td>{item}</td>
                  <td>
                    <pre>
                      <Text>{description.slice(0, -1)}</Text>
                    </pre>
                  </td>
                  <td>{glAccount}</td>
                  <td>{csiCode}</td>
                  <td>{addCommaToNumber(quantity)}</td>
                  <td>{unit}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </ScrollArea>
    </Paper>
  );
};

export default ITAssetSummary;