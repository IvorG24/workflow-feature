import { DuplicateSectionType } from "@/utils/types";
import { Paper, ScrollArea, Table, Title } from "@mantine/core";

type Props = {
  summaryData: DuplicateSectionType[];
};

const ServicesSummary = ({ summaryData }: Props) => {
  return (
    <Paper
      p="xl"
      shadow="xs"
      className="onboarding-requisition-request-summary"
    >
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
              <th>Category</th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit of Measurement</th>
              <th>CSI Code Description</th>
              <th>Preferred Supplier</th>
            </tr>
          </thead>
          <tbody>
            {summaryData.map((summary, index) => {
              const category = JSON.parse(
                `${summary.section_field[0].field_response?.request_response}`
              );
              const description = JSON.parse(
                `${summary.section_field[1].field_response?.request_response}`
              );
              const quantity = JSON.parse(
                `${summary.section_field[2].field_response?.request_response}`
              );
              const uom = JSON.parse(
                `${summary.section_field[3].field_response?.request_response}`
              );
              const csiCodeDescription = JSON.parse(
                `${summary.section_field[5].field_response?.request_response}`
              );
              const preferredSupplier =
                summary.section_field[9].field_response?.request_response &&
                JSON.parse(
                  `${summary.section_field[9].field_response?.request_response}`
                );

              return (
                <tr key={index}>
                  <td>{category}</td>
                  <td>{description}</td>
                  <td>{quantity}</td>
                  <td>{uom}</td>
                  <td>{csiCodeDescription}</td>
                  <td>{preferredSupplier}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </ScrollArea>
    </Paper>
  );
};

export default ServicesSummary;
