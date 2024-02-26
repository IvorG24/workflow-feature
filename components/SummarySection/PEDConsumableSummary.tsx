import { addCommaToNumber } from "@/utils/string";
import { DuplicateSectionType } from "@/utils/types";
import { Paper, ScrollArea, Table, Text, Title } from "@mantine/core";

type Props = {
  summaryData: DuplicateSectionType[];
  isSingle: boolean;
};

const PEDConsumableSummary = ({ summaryData, isSingle }: Props) => {
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
              {isSingle && (
                <>
                  <th>Equipment Property Number</th>
                  <th>Equipment Description</th>
                </>
              )}
              <th>General Name</th>
              <th>Item Description</th>
              <th>Quantity</th>
              <th>Base Unit of Measurement</th>
            </tr>
          </thead>
          <tbody>
            {summaryData.map((summary, index) => {
              let equipmentDescription = "";
              const propertyNumber = JSON.parse(
                `${summary.section_field[0].field_response?.request_response}`
              );
              summary.section_field.slice(1, 4).forEach((field) => {
                if (field.field_response) {
                  equipmentDescription += `${field.field_name}: ${JSON.parse(
                    field.field_response.request_response
                  )}\n`;
                }
              });

              const generalName = JSON.parse(
                `${
                  summary.section_field[isSingle ? 4 : 0].field_response
                    ?.request_response
                }`
              );

              let description = "";
              summary.section_field.slice(isSingle ? 7 : 3).forEach((field) => {
                if (field.field_response) {
                  description += `${field.field_name}: ${JSON.parse(
                    field.field_response.request_response
                  )}\n`;
                }
              });

              const quantity = JSON.parse(
                `${
                  summary.section_field[isSingle ? 6 : 2].field_response
                    ?.request_response
                }`
              );
              const unit = JSON.parse(
                `${
                  summary.section_field[isSingle ? 5 : 1].field_response
                    ?.request_response
                }`
              );

              return (
                <tr key={index}>
                  {isSingle && (
                    <>
                      <td>{propertyNumber}</td>
                      <td>
                        <pre>
                          <Text>{equipmentDescription}</Text>
                        </pre>
                      </td>
                    </>
                  )}
                  <td>{generalName}</td>
                  <td>
                    <pre>
                      <Text>{description}</Text>
                    </pre>
                  </td>
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

export default PEDConsumableSummary;
